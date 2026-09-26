// Minimal REST API for the Nemat app, backing js/state.js instead of
// localStorage. Plain Node http (no framework) — matches server.js's style
// and keeps the dependency footprint to just `pg`.

const { pool, query } = require('./db');

function send(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function makePickupCode() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

const MAX_ACTIVE_RESERVATIONS = 2; // FR-25

// --- Handlers ---

async function getVendors(req, res) {
  const { rows } = await query(`select * from vendors order by name`);
  send(res, 200, rows);
}

async function getDrops(req, res, params, body, url) {
  const status = url.searchParams.get('status');
  const { rows } = await query(
    `select d.*, v.name as vendor_name, v.sector, v.address
     from drops d join vendors v on v.id = d.vendor_id
     where ($1::text is null or d.status = $1)
     order by d.created_at desc`,
    [status]
  );
  send(res, 200, rows);
}

async function getDrop(req, res, [id]) {
  const { rows } = await query(
    `select d.*, v.name as vendor_name, v.sector, v.address, v.contact, v.rating
     from drops d join vendors v on v.id = d.vendor_id
     where d.id = $1`,
    [id]
  );
  if (rows.length === 0) return send(res, 404, { error: 'Drop not found' });
  send(res, 200, rows[0]);
}

async function createDrop(req, res, params, body) {
  const { vendorId, title, category, pricePkr, retailPkr, bagCount, windowStart, windowEnd, tags, description, imageUrl } = body;
  if (!vendorId || !title || !category || !pricePkr || !retailPkr || !bagCount || !windowStart || !windowEnd) {
    return send(res, 400, { error: 'vendorId, title, category, pricePkr, retailPkr, bagCount, windowStart, windowEnd are required' });
  }
  const id = makeId('drop');
  const { rows } = await query(
    `insert into drops (id, vendor_id, title, category, price_pkr, retail_pkr, bag_count, bags_left,
                         window_start, window_end, tags, description, image_url)
     values ($1, $2, $3, $4, $5, $6, $7, $7, $8, $9, coalesce($10, '{}'), $11, $12)
     returning *`,
    [id, vendorId, title, category, pricePkr, retailPkr, bagCount, windowStart, windowEnd, tags, description, imageUrl]
  );
  send(res, 201, rows[0]);
}

async function getReservations(req, res, params, body, url) {
  const customerId = url.searchParams.get('customerId');
  if (!customerId) return send(res, 400, { error: 'customerId query param is required' });
  const { rows } = await query(
    `select r.*, d.title, d.window_start, d.window_end, d.image_url,
            v.name as vendor_name, v.address as vendor_address
     from reservations r
     join drops d on d.id = r.drop_id
     join vendors v on v.id = d.vendor_id
     where r.customer_id = $1
     order by r.created_at desc`,
    [customerId]
  );
  send(res, 200, rows);
}

async function createReservation(req, res, params, body) {
  const { dropId, customerId } = body;
  if (!dropId || !customerId) return send(res, 400, { error: 'dropId and customerId are required' });

  const client = await pool.connect();
  try {
    await client.query('begin');

    const activeRes = await client.query(
      `select count(*)::int as count from reservations where customer_id = $1 and status = 'RESERVED'`,
      [customerId]
    );
    if (activeRes.rows[0].count >= MAX_ACTIVE_RESERVATIONS) {
      await client.query('rollback');
      return send(res, 409, { error: 'Maximum 2 active reservations allowed per customer (FR-25).' });
    }

    const dropRes = await client.query(`select id, price_pkr, bags_left from drops where id = $1 for update`, [dropId]);
    const drop = dropRes.rows[0];
    if (!drop) {
      await client.query('rollback');
      return send(res, 404, { error: 'Drop not found' });
    }
    if (drop.bags_left <= 0) {
      await client.query('rollback');
      return send(res, 409, { error: 'Bag is sold out or unavailable.' });
    }

    const id = makeId('res');
    const code = makePickupCode();
    const inserted = await client.query(
      `insert into reservations (id, code, drop_id, customer_id, price_pkr, qr_data, co2_saved_kg)
       values ($1, $2, $3, $4, $5, $6, $7)
       returning *`,
      [id, code, dropId, customerId, drop.price_pkr, `NMT-${code}-SECURE`, 1.8]
    );

    const newBagsLeft = drop.bags_left - 1;
    await client.query(
      `update drops set bags_left = $1, status = case when $1 = 0 then 'sold_out' else status end where id = $2`,
      [newBagsLeft, dropId]
    );
    await client.query(`update users set meals_rescued = meals_rescued + 1 where id = $1`, [customerId]);

    await client.query('commit');
    send(res, 201, inserted.rows[0]);
  } catch (err) {
    await client.query('rollback');
    throw err;
  } finally {
    client.release();
  }
}

async function verifyReservation(req, res, params, body) {
  const { code } = body;
  if (!code) return send(res, 400, { error: 'code is required' });
  const { rows } = await query(
    `update reservations set status = 'COLLECTED' where code = $1 and status = 'RESERVED' returning *`,
    [code]
  );
  if (rows.length === 0) return send(res, 409, { error: 'Invalid code, or bag already collected.' });
  send(res, 200, rows[0]);
}

async function getRescueJobs(req, res, params, body, url) {
  const status = url.searchParams.get('status');
  const { rows } = await query(
    `select * from rescue_jobs where ($1::text is null or status = $1) order by created_at desc`,
    [status]
  );
  send(res, 200, rows);
}

async function claimRescueJob(req, res, [id], body) {
  const { volunteerId } = body;
  if (!volunteerId) return send(res, 400, { error: 'volunteerId is required' });

  const client = await pool.connect();
  try {
    await client.query('begin');
    const jobRes = await client.query(`select status from rescue_jobs where id = $1 for update`, [id]);
    if (jobRes.rows.length === 0) {
      await client.query('rollback');
      return send(res, 404, { error: 'Rescue job not found' });
    }
    if (jobRes.rows[0].status !== 'available') {
      await client.query('rollback');
      return send(res, 409, { error: 'This run has already been claimed.' });
    }
    const handoverCode = makePickupCode();
    const updated = await client.query(
      `update rescue_jobs set status = 'claimed', volunteer_id = $1, handover_code = coalesce(handover_code, $2)
       where id = $3 returning *`,
      [volunteerId, handoverCode, id]
    );
    await client.query('commit');
    send(res, 200, updated.rows[0]);
  } catch (err) {
    await client.query('rollback');
    throw err;
  } finally {
    client.release();
  }
}

const STEP_STATUS = { pickup_verified: 'in_transit', delivered: 'delivered' };

async function progressRescueJob(req, res, [id], body) {
  const { step, tempLogC, weightKg } = body;
  if (!step || !(step in STEP_STATUS)) {
    return send(res, 400, { error: `step must be one of: ${Object.keys(STEP_STATUS).join(', ')}` });
  }
  const { rows } = await query(
    `update rescue_jobs set status = $1, temp_log_c = coalesce($2, temp_log_c), weight_kg = coalesce($3, weight_kg)
     where id = $4 returning *`,
    [STEP_STATUS[step], tempLogC, weightKg, id]
  );
  if (rows.length === 0) return send(res, 404, { error: 'Rescue job not found' });
  send(res, 200, rows[0]);
}

async function closeWindow(req, res, params, body) {
  const { vendorId } = body;
  if (!vendorId) return send(res, 400, { error: 'vendorId is required' });

  const client = await pool.connect();
  try {
    await client.query('begin');
    const vendorRes = await client.query(`select * from vendors where id = $1`, [vendorId]);
    const vendor = vendorRes.rows[0];
    if (!vendor) {
      await client.query('rollback');
      return send(res, 404, { error: 'Vendor not found' });
    }

    const dropsRes = await client.query(`select id, bags_left from drops where vendor_id = $1 and bags_left > 0 for update`, [vendorId]);
    const unsoldDrops = dropsRes.rows;
    const totalUnsold = unsoldDrops.reduce((sum, d) => sum + d.bags_left, 0) || 6;

    if (unsoldDrops.length > 0) {
      await client.query(`update drops set status = 'closed', bags_left = 0 where vendor_id = $1 and bags_left > 0`, [vendorId]);
    }

    const id = makeId('rj');
    const jobRes = await client.query(
      `insert into rescue_jobs (id, drop_id, vendor_name, vendor_address, vendor_contact,
                                 recipient_id, recipient_name, recipient_address,
                                 bags_count, weight_kg, vehicle, distance_km, eta_min,
                                 status, urgent, closing_window, pickup_code, handover_code, notes)
       values ($1, $2, $3, $4, $5,
               'rec-1', 'Al-Noor Community Kitchen', 'Sector I-8/4, Islamabad',
               $6, $7, 'two_wheeler', 4.8, 20,
               'available', true, 'Pickup window closed • Urgent rescue needed', $8, $9,
               'End-of-day surplus bags from evening close. Collect within 60 mins.')
       returning *`,
      [id, unsoldDrops[0]?.id ?? null, vendor.name, vendor.address, vendor.contact, totalUnsold, +(totalUnsold * 0.55).toFixed(1), makePickupCode(), makePickupCode()]
    );

    await client.query(
      `insert into notifications (id, role, title, message) values ($1, 'volunteer', 'New Rescue Job Available!', $2)`,
      [makeId('notif'), `Urgent run: ${totalUnsold} bags from ${vendor.name} to Al-Noor Kitchen.`]
    );

    await client.query('commit');
    send(res, 201, jobRes.rows[0]);
  } catch (err) {
    await client.query('rollback');
    throw err;
  } finally {
    client.release();
  }
}

async function patchDelivery(req, res, [id], body) {
  const { accepted, reason } = body;
  if (typeof accepted !== 'boolean') return send(res, 400, { error: 'accepted (boolean) is required' });
  const { rows } = await query(
    `update rescue_jobs set status = $1, delivery_accepted = $2, delivery_reject_reason = $3 where id = $4 returning *`,
    [accepted ? 'delivered' : 'rejected', accepted, accepted ? null : reason ?? null, id]
  );
  if (rows.length === 0) return send(res, 404, { error: 'Rescue job not found' });
  send(res, 200, rows[0]);
}

async function getApprovals(req, res, params, body, url) {
  const status = url.searchParams.get('status');
  const { rows } = await query(`select * from approvals where ($1::text is null or status = $1) order by submitted_at desc`, [status]);
  send(res, 200, rows);
}

async function patchApproval(req, res, [id], body) {
  const { approved } = body;
  if (typeof approved !== 'boolean') return send(res, 400, { error: 'approved (boolean) is required' });
  const { rows } = await query(`update approvals set status = $1 where id = $2 returning *`, [approved ? 'approved' : 'rejected', id]);
  if (rows.length === 0) return send(res, 404, { error: 'Approval not found' });
  send(res, 200, rows[0]);
}

async function getFoodSafetyReports(req, res) {
  const { rows } = await query(`select * from food_safety_reports order by created_at desc`);
  send(res, 200, rows);
}

async function createFoodSafetyReport(req, res, params, body) {
  const { vendorId, vendorName, sector, reportedBy, issue, details } = body;
  if (!vendorName || !issue) return send(res, 400, { error: 'vendorName and issue are required' });
  const id = makeId('fsr');
  const { rows } = await query(
    `insert into food_safety_reports (id, vendor_id, vendor_name, sector, reported_by, issue, details)
     values ($1, $2, $3, $4, $5, $6, $7) returning *`,
    [id, vendorId ?? null, vendorName, sector ?? null, reportedBy ?? null, issue, details ?? null]
  );
  send(res, 201, rows[0]);
}

async function suspendVendor(req, res, [id]) {
  const client = await pool.connect();
  try {
    await client.query('begin');
    const reportRes = await client.query(`select vendor_id from food_safety_reports where id = $1`, [id]);
    const report = reportRes.rows[0];
    if (!report || !report.vendor_id) {
      await client.query('rollback');
      return send(res, 404, { error: 'Report or its vendor not found' });
    }
    const vendorRes = await client.query(
      `update vendors set status = 'Suspended (Safety Review)', flags_count = flags_count + 1 where id = $1 returning *`,
      [report.vendor_id]
    );
    await client.query(`update food_safety_reports set vendor_suspended = true where id = $1`, [id]);
    await client.query('commit');
    send(res, 200, vendorRes.rows[0]);
  } catch (err) {
    await client.query('rollback');
    throw err;
  } finally {
    client.release();
  }
}

async function getRecipientOrgs(req, res) {
  const { rows } = await query(`select * from recipient_orgs order by name`);
  send(res, 200, rows);
}

async function getVolunteers(req, res) {
  const { rows } = await query(`select * from volunteers order by name`);
  send(res, 200, rows);
}

async function getUser(req, res, [id]) {
  const { rows } = await query(`select * from users where id = $1`, [id]);
  if (rows.length === 0) return send(res, 404, { error: 'User not found' });
  send(res, 200, rows[0]);
}

async function patchUser(req, res, [id], body) {
  const { role, language } = body;
  const { rows } = await query(
    `update users set role = coalesce($1, role), language = coalesce($2, language) where id = $3 returning *`,
    [role ?? null, language ?? null, id]
  );
  if (rows.length === 0) return send(res, 404, { error: 'User not found' });
  send(res, 200, rows[0]);
}

const routes = [
  ['GET', /^\/api\/vendors$/, getVendors],
  ['GET', /^\/api\/drops$/, getDrops],
  ['POST', /^\/api\/drops$/, createDrop],
  ['GET', /^\/api\/drops\/([^/]+)$/, getDrop],
  ['GET', /^\/api\/reservations$/, getReservations],
  ['POST', /^\/api\/reservations$/, createReservation],
  ['POST', /^\/api\/reservations\/verify$/, verifyReservation],
  ['GET', /^\/api\/rescue-jobs$/, getRescueJobs],
  ['POST', /^\/api\/rescue-jobs\/close-window$/, closeWindow],
  ['POST', /^\/api\/rescue-jobs\/([^/]+)\/claim$/, claimRescueJob],
  ['PATCH', /^\/api\/rescue-jobs\/([^/]+)\/progress$/, progressRescueJob],
  ['PATCH', /^\/api\/deliveries\/([^/]+)$/, patchDelivery],
  ['GET', /^\/api\/approvals$/, getApprovals],
  ['PATCH', /^\/api\/approvals\/([^/]+)$/, patchApproval],
  ['GET', /^\/api\/food-safety-reports$/, getFoodSafetyReports],
  ['POST', /^\/api\/food-safety-reports$/, createFoodSafetyReport],
  ['POST', /^\/api\/food-safety-reports\/([^/]+)\/suspend$/, suspendVendor],
  ['GET', /^\/api\/recipient-orgs$/, getRecipientOrgs],
  ['GET', /^\/api\/volunteers$/, getVolunteers],
  ['GET', /^\/api\/users\/([^/]+)$/, getUser],
  ['PATCH', /^\/api\/users\/([^/]+)$/, patchUser],
];

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 1e6) req.destroy(); // 1MB guard
    });
    req.on('end', () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

// Returns true if this request was handled as an API call (so server.js
// knows not to also try serving it as a static file).
function isApiRequest(pathname) {
  return pathname.startsWith('/api/');
}

async function handleApiRequest(req, res, url) {
  const match = routes.find(([method, pattern]) => method === req.method && pattern.test(url.pathname));
  if (!match) {
    send(res, 404, { error: `No API route for ${req.method} ${url.pathname}` });
    return;
  }
  const [, pattern, handler] = match;
  const params = pattern.exec(url.pathname).slice(1);

  try {
    const body = req.method === 'GET' ? {} : await readBody(req);
    await handler(req, res, params, body, url);
  } catch (err) {
    console.error('API error:', err);
    send(res, 500, { error: 'Internal server error' });
  }
}

module.exports = { isApiRequest, handleApiRequest };
