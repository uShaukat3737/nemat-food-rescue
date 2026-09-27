const { test } = require('node:test');
const assert = require('node:assert');
const { handleApiRequest } = require('../lib/api');

// Calls the shared router (used by server.js and api/[...path].js) and
// returns { status, body }.
async function call(method, pathAndQuery) {
  const req = { method, headers: { host: 'localhost' } };
  let status;
  let raw = '';
  const res = {
    writeHead: (s) => { status = s; },
    end: (chunk) => { raw = chunk || ''; },
  };
  await handleApiRequest(req, res, new URL(pathAndQuery, 'https://localhost'));
  return { status, body: JSON.parse(raw) };
}

test('GET /api/map-config returns the Geoapify key so it works on Vercel', async () => {
  process.env.GEOAPIFY_API_KEY = 'test-geo-key';

  const { status, body } = await call('GET', '/api/map-config');

  assert.strictEqual(status, 200);
  assert.deepStrictEqual(body, { geoapifyKey: 'test-geo-key' });
});
