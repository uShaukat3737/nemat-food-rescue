// Nemat (نعمت) - Surplus Food Rescue Platform State Engine
// Backed by a real Postgres API (see lib/api.js) instead of only
// localStorage. localStorage remains a same-tab cache so the UI still
// has something to render instantly on load; bootstrap() then replaces
// it with live data from the database, and every state-changing action
// persists there too (falling back to local-only if the API is
// unreachable, so the demo still works offline).

const NEMAT_STORAGE_KEY = 'nemat_app_state_v1';

const defaultState = {
  currentRole: 'customer', // 'customer' | 'vendor' | 'volunteer' | 'recipient' | 'admin'
  language: 'en', // 'en' | 'ur'
  currentUser: {
    id: 'usr-101',
    name: 'Bilal K.',
    phone: '+92 300 8594210',
    role: 'customer',
    level: 2,
    mealsRescued: 18,
    pkrSaved: 14250,
    co2SavedKg: 28.4,
    sector: 'F-7',
    radiusKm: 3
  },
  sectors: ['F-6', 'F-7', 'F-8', 'G-9', 'Blue Area', 'I-8'],
  vendors: [
    {
      id: 'v-1',
      name: 'Loaf & Crumb',
      sector: 'F-7',
      address: 'Jinnah Super Market, Sector F-7, Islamabad',
      contact: 'Tariq M. (0300-5551234)',
      status: 'Online • Accepting Orders',
      verified: true,
      rating: 4.9,
      flagsCount: 0,
      photo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBl0QExfAQufL0cuPHPiCDwpAALo0_UtLuHIAdCr7bH-8acitcPPQ2YQUqJi2kdKL-JHOQ2IS1YXgUtzvh9FAe_JLSfD4EGq4A1_goSsQiFDRosLAZgFTES9hD67-GXx0u_CCQOhOnCNoSCodJYgpYgbIjkiJEQ9fLzPX72yZwWqY8od_YnpsrS4EAWG9KSCb9KLHUB9HjMEUl1md-fPa3si02GVYUwJ88jOEvinLah0Idgy34XPWXM'
    },
    {
      id: 'v-2',
      name: 'Brew District',
      sector: 'F-7',
      address: 'College Road, Sector F-7/2, Islamabad',
      contact: 'Kamran S. (0321-9876543)',
      status: 'Online • Accepting Orders',
      verified: true,
      rating: 4.8,
      flagsCount: 0,
      photo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB0qzoWz1MLPqbAWVW6O5_zTILs6L3voGROclPeAwGsc9bXvVkVBs4IpikF3QS7PhalIcUY2iFfTx2yZ1qV0KgWWi2gaHqevJ5QcaTf5XBmhEyM_rTBEHfhqYGxGrXDI-Hk6Xmbs3ZGdEN09FpF2P9E_H1d3AtPr1Y6LE3Xad4VoLurJULSDJPYX8EtMF6VT1YOqx2_xUl1EWuQDU0DFDv2qsI6xbN2EDymccMjdvluyKhgj5q2h9ww'
    },
    {
      id: 'v-3',
      name: 'Sweet Truth',
      sector: 'Blue Area',
      address: 'Beverly Centre, Jinnah Avenue, Blue Area, Islamabad',
      contact: 'Hassan A. (0333-1122334)',
      status: 'Online • Accepting Orders',
      verified: true,
      rating: 4.7,
      flagsCount: 0,
      photo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCd1VT7jkmCrsMfYsmLflANwdxe8B4SA-7lqtfiqCWZK7fh8425dd8Xl1vCB4UC905j_msaDh7vbGK0IP-g7pNRxeh3ZD7Rwdcakh-4FBY0MmaVnWdNe_HoxMcyfKI_BI_S5d3OC9IlbnXpPcKoNmL1U_PVGH8m8BPrNwlZHmNb5REXsg7Z7SdLTvHNvkoiSbZTAR4aFRRymxHC5VtHi2fVHXbFtTe3JUva2TqZaD9t91D1VnUdS8su'
    },
    {
      id: 'v-4',
      name: 'Burning Brownie',
      sector: 'F-6',
      address: 'Super Market, Sector F-6, Islamabad',
      contact: 'Saad M. (0301-4455667)',
      status: 'Online • Accepting Orders',
      verified: true,
      rating: 4.9,
      flagsCount: 1,
      photo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC_-wiFEXG5iiwnUMRWiwcmqd7s1HpwwLVUvnQq6hniuST5svtfVdpet4n85vCB1VS5ZSHhwxiPyjKjWYdwMk4KW03fNdctTiMjgtztWLEe8ahsweWlrCQxbbynVhm660oaeYVRpQQmx3eL5lHTxSDbn1IICIROUddlIitA9CHQK0Ueq4kj_V6r9h5r6NHd6bB2XYtpy5hK2JttJq5_mxjzq64B9ny5eDQ7QEW2SzFY9DydqWG8oK8J'
    }
  ],
  drops: [
    {
      id: 'drop-1',
      vendorId: 'v-1',
      vendorName: 'Loaf & Crumb',
      sector: 'F-7',
      address: 'Jinnah Super Market, Sector F-7, Islamabad',
      title: 'Artisanal Pastry Surprise Bag',
      category: 'bakery',
      pricePkr: 450,
      retailPkr: 1200,
      discountPct: 63,
      bagCount: 8,
      bagsLeft: 8,
      window: '8:30 PM – 9:30 PM',
      windowStart: '20:30',
      windowEnd: '21:30',
      tags: ['Halal', 'Vegetarian', 'Contains Gluten', 'Contains Nuts'],
      status: 'live',
      description: 'Golden flaky French croissants, pain au chocolat, sourdough slices, and fruit danishes baked fresh this morning.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBl0QExfAQufL0cuPHPiCDwpAALo0_UtLuHIAdCr7bH-8acitcPPQ2YQUqJi2kdKL-JHOQ2IS1YXgUtzvh9FAe_JLSfD4EGq4A1_goSsQiFDRosLAZgFTES9hD67-GXx0u_CCQOhOnCNoSCodJYgpYgbIjkiJEQ9fLzPX72yZwWqY8od_YnpsrS4EAWG9KSCb9KLHUB9HjMEUl1md-fPa3si02GVYUwJ88jOEvinLah0Idgy34XPWXM'
    },
    {
      id: 'drop-2',
      vendorId: 'v-2',
      vendorName: 'Brew District',
      sector: 'F-7',
      address: 'College Road, Sector F-7/2, Islamabad',
      title: 'Gourmet Panini & Salad Bag',
      category: 'cafe',
      pricePkr: 550,
      retailPkr: 1400,
      discountPct: 61,
      bagCount: 4,
      bagsLeft: 4,
      window: '9:00 PM – 10:00 PM',
      windowStart: '21:00',
      windowEnd: '22:00',
      tags: ['Halal', 'Savory', 'Fresh Salad', 'Contains Dairy'],
      status: 'live',
      description: 'Toasted artisan paninis, Mediterranean roasted veg salad bowls, and fresh cold pressed brew beverage.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB0qzoWz1MLPqbAWVW6O5_zTILs6L3voGROclPeAwGsc9bXvVkVBs4IpikF3QS7PhalIcUY2iFfTx2yZ1qV0KgWWi2gaHqevJ5QcaTf5XBmhEyM_rTBEHfhqYGxGrXDI-Hk6Xmbs3ZGdEN09FpF2P9E_H1d3AtPr1Y6LE3Xad4VoLurJULSDJPYX8EtMF6VT1YOqx2_xUl1EWuQDU0DFDv2qsI6xbN2EDymccMjdvluyKhgj5q2h9ww'
    },
    {
      id: 'drop-3',
      vendorId: 'v-3',
      vendorName: 'Sweet Truth',
      sector: 'Blue Area',
      address: 'Beverly Centre, Jinnah Avenue, Blue Area, Islamabad',
      title: 'Midnight Sweet Treat Box',
      category: 'bakery',
      pricePkr: 400,
      retailPkr: 1100,
      discountPct: 64,
      bagCount: 6,
      bagsLeft: 6,
      window: '9:30 PM – 10:30 PM',
      windowStart: '21:30',
      windowEnd: '22:30',
      tags: ['Halal', 'Dessert', 'Contains Eggs', 'Contains Dairy'],
      status: 'live',
      description: 'Assorted artisan cupcakes, cinnamon swirl rolls with cream cheese glaze, and gourmet cookies.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCd1VT7jkmCrsMfYsmLflANwdxe8B4SA-7lqtfiqCWZK7fh8425dd8Xl1vCB4UC905j_msaDh7vbGK0IP-g7pNRxeh3ZD7Rwdcakh-4FBY0MmaVnWdNe_HoxMcyfKI_BI_S5d3OC9IlbnXpPcKoNmL1U_PVGH8m8BPrNwlZHmNb5REXsg7Z7SdLTvHNvkoiSbZTAR4aFRRymxHC5VtHi2fVHXbFtTe3JUva2TqZaD9t91D1VnUdS8su'
    },
    {
      id: 'drop-4',
      vendorId: 'v-4',
      vendorName: 'Burning Brownie',
      sector: 'F-6',
      address: 'Super Market, Sector F-6, Islamabad',
      title: 'Decadent Brownie & Tart Assortment',
      category: 'bakery',
      pricePkr: 500,
      retailPkr: 1350,
      discountPct: 63,
      bagCount: 3,
      bagsLeft: 3,
      window: '8:45 PM – 9:45 PM',
      windowStart: '20:45',
      windowEnd: '21:45',
      tags: ['Halal', 'Dessert', 'Contains Nuts'],
      status: 'live',
      description: 'Rich fudge brownies, classic New York cheesecake slices, and lemon meringue tartlets.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC_-wiFEXG5iiwnUMRWiwcmqd7s1HpwwLVUvnQq6hniuST5svtfVdpet4n85vCB1VS5ZSHhwxiPyjKjWYdwMk4KW03fNdctTiMjgtztWLEe8ahsweWlrCQxbbynVhm660oaeYVRpQQmx3eL5lHTxSDbn1IICIROUddlIitA9CHQK0Ueq4kj_V6r9h5r6NHd6bB2XYtpy5hK2JttJq5_mxjzq64B9ny5eDQ7QEW2SzFY9DydqWG8oK8J'
    }
  ],
  reservations: [
    {
      id: 'res-1',
      code: '4827',
      dropId: 'drop-1',
      vendorId: 'v-1',
      vendorName: 'Loaf & Crumb',
      vendorAddress: 'Jinnah Super Market, Sector F-7, Islamabad',
      customerName: 'Bilal K.',
      title: 'Artisanal Pastry Surprise Bag',
      pricePkr: 450,
      window: '8:30 PM – 9:30 PM',
      status: 'RESERVED',
      qrData: 'NMT-4827-SECURE',
      createdAt: '24 mins ago',
      co2SavedKg: 1.8
    }
  ],
  rescueJobs: [
    {
      id: 'rj-104',
      dropId: 'drop-1',
      vendorName: 'Loaf & Crumb',
      vendorAddress: 'Jinnah Super Market, F-7 Markaz, Islamabad',
      vendorContact: 'Tariq M. (0300-5551234)',
      recipientId: 'rec-1',
      recipientName: 'Al-Noor Community Kitchen',
      recipientAddress: 'Sector I-8/4, Islamabad',
      bagsCount: 12,
      weightKg: 6.4,
      vehicle: 'two_wheeler',
      distanceKm: 4.8,
      etaMin: 18,
      status: 'available', // 'available' | 'claimed' | 'in_transit' | 'delivered' | 'rejected'
      urgent: true,
      closingWindow: 'Closing in 35 mins',
      pickupCode: '8841',
      handoverCode: '7192',
      volunteerName: null,
      tempLogC: null,
      notes: 'Breads, croissants, and sealed bakery bags. Thermal box required.'
    },
    {
      id: 'rj-102',
      dropId: 'drop-2',
      vendorName: 'Brew District',
      vendorAddress: 'College Road, F-7/2, Islamabad',
      vendorContact: 'Kamran S. (0321-9876543)',
      recipientId: 'rec-2',
      recipientName: 'Edhi Shelter Home',
      recipientAddress: 'Sector H-8, Islamabad',
      bagsCount: 6,
      weightKg: 3.2,
      vehicle: 'two_wheeler',
      distanceKm: 3.5,
      etaMin: 15,
      status: 'claimed',
      urgent: false,
      closingWindow: 'Closing in 50 mins',
      pickupCode: '3149',
      handoverCode: '6201',
      volunteerName: 'Zeeshan K.',
      tempLogC: 4.5,
      notes: 'Prepared sandwiches and cold juices. Maintain chilled transit.'
    }
  ],
  recipientOrgs: [
    {
      id: 'rec-1',
      name: 'Al-Noor Community Kitchen',
      sector: 'I-8/4',
      address: 'Sector I-8/4, Islamabad',
      director: 'Sr. Yasmin Kausar',
      dailyCapacity: 250,
      tonightReceivedMeals: 168,
      status: 'approved',
      cdaCert: 'CDA-ICT-NGO-2024-88'
    },
    {
      id: 'rec-2',
      name: 'Edhi Shelter Home',
      sector: 'H-8',
      address: 'Sector H-8, Islamabad',
      director: 'Muhammad Rizwan',
      dailyCapacity: 180,
      tonightReceivedMeals: 110,
      status: 'approved',
      cdaCert: 'CDA-ICT-NGO-2023-14'
    }
  ],
  volunteers: [
    {
      id: 'vol-1',
      name: 'Zeeshan K.',
      phone: '+92 312 4567890',
      vehicle: 'Honda CG125 (LEB-491)',
      level: 3,
      runsCompleted: 24,
      totalKgRescued: 148.5,
      mealsDelivered: 412,
      hub: 'Faisal Mosque Civic Volunteers',
      status: 'Duty Shift ON'
    }
  ],
  approvals: [
    {
      id: 'app-1',
      name: 'Crust & Co Artisanal Bakery',
      category: 'Vendor (Bakery)',
      sector: 'F-10 Markaz',
      regNumber: 'CDA-ICT-9021',
      contact: 'Farhan Ali (0321-4455889)',
      status: 'pending',
      date: 'Sep 26, 2026'
    },
    {
      id: 'app-2',
      name: 'Tehzeeb Bakers',
      category: 'Vendor (Bakery)',
      sector: 'G-9 Karachi Company',
      regNumber: 'CDA-ICT-4182',
      contact: 'Zahid Khan (0300-8811223)',
      status: 'pending',
      date: 'Sep 26, 2026'
    },
    {
      id: 'app-3',
      name: 'Asim Raza',
      category: 'Volunteer Courier',
      sector: 'H-12 (NUST Hub)',
      regNumber: 'VOUCHED: NUST CSS Society',
      contact: '0345-9988776',
      status: 'pending',
      date: 'Sep 26, 2026'
    },
    {
      id: 'app-4',
      name: 'Hope Community Feeding Kitchen',
      category: 'Recipient NGO',
      sector: 'G-7/2 Islamabad',
      regNumber: 'CDA-WELF-2025-11',
      contact: 'Mrs. Parveen (0332-6655443)',
      status: 'pending',
      date: 'Sep 25, 2026'
    }
  ],
  foodSafetyReports: [
    {
      id: 'fsr-1',
      vendorName: 'Burning Brownie',
      sector: 'F-6 Super Market',
      reportedBy: 'Customer (Reservation #NMT-3910)',
      issue: 'Storage Temperature Check Needed',
      details: 'Customer noted the chilled cream pastry box felt lukewarm upon pickup counter handover.',
      status: 'Under Review',
      timestamp: 'Sep 25, 2026 • 21:40 PKT',
      vendorSuspended: false
    }
  ],
  notifications: [
    {
      id: 'notif-1',
      title: 'Active Reservation Confirmed',
      message: 'Your pickup pass #4827 at Loaf & Crumb is ready. Window opens at 8:30 PM.',
      time: '12m ago',
      read: false,
      role: 'customer'
    },
    {
      id: 'notif-2',
      title: 'New Rescue Job in F-7',
      message: '12 surplus bakery bags available at Loaf & Crumb for Al-Noor Kitchen.',
      time: '25m ago',
      read: false,
      role: 'volunteer'
    }
  ],
  otpRequests: {
    count: 0,
    lastRequestTime: null
  }
};

// --- API helpers ---

async function apiFetch(path, options) {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `Request failed: ${res.status}`);
    err.apiMessage = data.error;
    throw err;
  }
  return data;
}

// --- DB row -> app-shape mappers (snake_case columns -> the camelCase
// shape the rest of state.js/app.js already expect) ---

function formatTime12(hms) {
  if (!hms) return '';
  const [h, m] = hms.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = ((h + 11) % 12) + 1;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

function mapVendor(v) {
  return {
    id: v.id,
    name: v.name,
    sector: v.sector,
    address: v.address,
    contact: v.contact,
    status: v.status,
    verified: v.verified,
    rating: Number(v.rating),
    flagsCount: v.flags_count,
    photo: v.photo_url
  };
}

function mapDrop(d) {
  return {
    id: d.id,
    vendorId: d.vendor_id,
    vendorName: d.vendor_name,
    sector: d.sector,
    address: d.address,
    title: d.title,
    category: d.category,
    pricePkr: d.price_pkr,
    retailPkr: d.retail_pkr,
    discountPct: Math.round(((d.retail_pkr - d.price_pkr) / d.retail_pkr) * 100),
    bagCount: d.bag_count,
    bagsLeft: d.bags_left,
    window: `${formatTime12(d.window_start)} – ${formatTime12(d.window_end)}`,
    windowStart: d.window_start.slice(0, 5),
    windowEnd: d.window_end.slice(0, 5),
    tags: d.tags,
    status: d.status,
    description: d.description,
    image: d.image_url
  };
}

function mapReservation(r) {
  return {
    id: r.id,
    code: r.code,
    dropId: r.drop_id,
    vendorName: r.vendor_name,
    vendorAddress: r.vendor_address,
    customerName: window.NematState?.get().currentUser.name,
    title: r.title,
    pricePkr: r.price_pkr,
    window: `${formatTime12(r.window_start)} – ${formatTime12(r.window_end)}`,
    status: r.status,
    qrData: r.qr_data,
    createdAt: r.created_at,
    co2SavedKg: Number(r.co2_saved_kg)
  };
}

function mapRescueJob(j) {
  return {
    id: j.id,
    dropId: j.drop_id,
    vendorName: j.vendor_name,
    vendorAddress: j.vendor_address,
    vendorContact: j.vendor_contact,
    recipientId: j.recipient_id,
    recipientName: j.recipient_name,
    recipientAddress: j.recipient_address,
    bagsCount: j.bags_count,
    weightKg: j.weight_kg != null ? Number(j.weight_kg) : null,
    vehicle: j.vehicle,
    distanceKm: j.distance_km != null ? Number(j.distance_km) : null,
    etaMin: j.eta_min,
    status: j.status,
    urgent: j.urgent,
    closingWindow: j.closing_window,
    pickupCode: j.pickup_code,
    handoverCode: j.handover_code,
    // Demo has a single seeded volunteer — good enough for this scope.
    volunteerName: j.volunteer_id ? 'Zeeshan K.' : null,
    tempLogC: j.temp_log_c != null ? Number(j.temp_log_c) : null,
    rejectionReason: j.delivery_reject_reason,
    notes: j.notes
  };
}

function mapRecipientOrg(r) {
  return {
    id: r.id,
    name: r.name,
    sector: r.sector,
    address: r.address,
    director: r.director,
    dailyCapacity: r.daily_capacity,
    tonightReceivedMeals: r.tonight_received_meals,
    status: r.status,
    cdaCert: r.cda_cert
  };
}

function mapVolunteer(v) {
  return {
    id: v.id,
    name: v.name,
    phone: v.phone,
    vehicle: v.vehicle,
    level: v.level,
    runsCompleted: v.runs_completed,
    totalKgRescued: Number(v.total_kg_rescued),
    mealsDelivered: v.meals_delivered,
    hub: v.hub,
    status: v.status
  };
}

function mapApproval(a) {
  return {
    id: a.id,
    name: a.name,
    category: a.category,
    sector: a.sector,
    regNumber: a.reg_number,
    contact: a.contact,
    status: a.status,
    date: new Date(a.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  };
}

function mapFoodSafetyReport(r) {
  return {
    id: r.id,
    vendorName: r.vendor_name,
    sector: r.sector,
    reportedBy: r.reported_by,
    issue: r.issue,
    details: r.details,
    status: r.status,
    timestamp: r.created_at,
    vendorSuspended: r.vendor_suspended
  };
}

class StateManager {
  constructor() {
    this.listeners = [];
    this.state = this.loadState();
  }

  loadState() {
    try {
      const data = localStorage.getItem(NEMAT_STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Could not read state from localStorage', e);
    }
    return JSON.parse(JSON.stringify(defaultState));
  }

  saveState() {
    try {
      localStorage.setItem(NEMAT_STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.warn('Could not save state to localStorage', e);
    }
    this.notify();
  }

  resetState() {
    this.state = JSON.parse(JSON.stringify(defaultState));
    this.saveState();
  }

  // Pulls live data from Postgres (via lib/api.js) and replaces the
  // hardcoded seed arrays above. Called once at app startup; on any
  // failure (API/DB unreachable) the app just keeps running on the
  // local defaults, same as before this was wired up.
  async bootstrap() {
    try {
      const customerId = this.state.currentUser.id;
      const [vendors, drops, reservations, rescueJobs, recipientOrgs, volunteers, approvals, foodSafetyReports] = await Promise.all([
        apiFetch('/vendors'),
        apiFetch('/drops'),
        apiFetch(`/reservations?customerId=${encodeURIComponent(customerId)}`),
        apiFetch('/rescue-jobs'),
        apiFetch('/recipient-orgs'),
        apiFetch('/volunteers'),
        apiFetch('/approvals'),
        apiFetch('/food-safety-reports')
      ]);

      this.state.vendors = vendors.map(mapVendor);
      this.state.drops = drops.map(mapDrop);
      this.state.reservations = reservations.map(mapReservation);
      this.state.rescueJobs = rescueJobs.map(mapRescueJob);
      this.state.recipientOrgs = recipientOrgs.map(mapRecipientOrg);
      this.state.volunteers = volunteers.map(mapVolunteer);
      this.state.approvals = approvals.map(mapApproval);
      this.state.foodSafetyReports = foodSafetyReports.map(mapFoodSafetyReport);

      this.saveState();
      console.info('Nemat: loaded live state from the backend.');
    } catch (err) {
      console.warn('Nemat: backend unavailable, staying on local demo data.', err);
    }
  }

  get() {
    return this.state;
  }

  subscribe(fn) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }

  notify() {
    this.listeners.forEach(fn => fn(this.state));
  }

  setRole(role) {
    this.state.currentRole = role;
    this.saveState();
  }

  setLanguage(lang) {
    this.state.language = lang;
    this.saveState();
  }

  addNotification(title, message, role = 'all') {
    this.state.notifications.unshift({
      id: 'notif-' + Date.now(),
      title,
      message,
      time: 'Just now',
      read: false,
      role
    });
    this.saveState();
  }

  // Customer actions
  async reserveBag(dropId) {
    const drop = this.state.drops.find(d => d.id === dropId);
    if (!drop || drop.bagsLeft <= 0) {
      return { success: false, message: 'Bag is sold out or unavailable.' };
    }

    // Check FR-25: at most 2 active reservations (also enforced server-side)
    const activeRes = this.state.reservations.filter(r => r.status === 'RESERVED');
    if (activeRes.length >= 2) {
      return { success: false, message: 'Maximum 2 active reservations allowed per customer (FR-25).' };
    }

    let code;
    try {
      const row = await apiFetch('/reservations', {
        method: 'POST',
        body: JSON.stringify({ dropId, customerId: this.state.currentUser.id })
      });
      code = row.code; // server is the source of truth for the pickup code
    } catch (err) {
      if (err.apiMessage) return { success: false, message: err.apiMessage };
      console.warn('Nemat: reservation not persisted (backend unreachable).', err);
      code = Math.floor(1000 + Math.random() * 9000).toString();
    }

    drop.bagsLeft -= 1;
    if (drop.bagsLeft === 0) {
      drop.status = 'sold_out';
    }

    const newReservation = {
      id: 'res-' + Date.now(),
      code,
      dropId: drop.id,
      vendorId: drop.vendorId,
      vendorName: drop.vendorName,
      vendorAddress: drop.address,
      customerName: this.state.currentUser.name,
      title: drop.title,
      pricePkr: drop.pricePkr,
      window: drop.window,
      status: 'RESERVED',
      qrData: `NMT-${code}-SECURE`,
      createdAt: 'Just now',
      co2SavedKg: 1.8
    };

    this.state.reservations.unshift(newReservation);
    this.state.currentUser.mealsRescued += 1;
    this.state.currentUser.pkrSaved += (drop.retailPkr - drop.pricePkr);
    this.state.currentUser.co2SavedKg = +(this.state.currentUser.co2SavedKg + 1.8).toFixed(1);

    this.addNotification(
      'Reservation Confirmed!',
      `Bag reserved at ${drop.vendorName}. Pickup code #${code}.`,
      'customer'
    );
    this.addNotification(
      'New Customer Reservation',
      `${this.state.currentUser.name} reserved a bag at ${drop.vendorName} (Code #${code}).`,
      'vendor'
    );

    this.saveState();
    return { success: true, reservation: newReservation };
  }

  // Vendor actions
  async createDrop(dropData) {
    const vendorId = 'v-1';
    const pricePkr = Number(dropData.pricePkr) || 450;
    const retailPkr = Number(dropData.retailPkr) || 1200;
    const bagCount = Number(dropData.bagCount) || 10;
    const windowStart = dropData.windowStart || '20:30';
    const windowEnd = dropData.windowEnd || '21:30';

    let id = 'drop-' + Date.now();
    try {
      const row = await apiFetch('/drops', {
        method: 'POST',
        body: JSON.stringify({
          vendorId,
          title: dropData.title || 'Artisanal Bakery Surprise Bag',
          category: dropData.category || 'bakery',
          pricePkr,
          retailPkr,
          bagCount,
          windowStart,
          windowEnd,
          tags: dropData.tags || ['Halal', 'Vegetarian'],
          description: dropData.description || 'Fresh evening surplus assortment.',
          imageUrl: dropData.image || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBl0QExfAQufL0cuPHPiCDwpAALo0_UtLuHIAdCr7bH-8acitcPPQ2YQUqJi2kdKL-JHOQ2IS1YXgUtzvh9FAe_JLSfD4EGq4A1_goSsQiFDRosLAZgFTES9hD67-GXx0u_CCQOhOnCNoSCodJYgpYgbIjkiJEQ9fLzPX72yZwWqY8od_YnpsrS4EAWG9KSCb9KLHUB9HjMEUl1md-fPa3si02GVYUwJ88jOEvinLah0Idgy34XPWXM'
        })
      });
      id = row.id;
    } catch (err) {
      console.warn('Nemat: drop not persisted (backend unreachable).', err);
    }

    const newDrop = {
      id,
      vendorId,
      vendorName: 'Loaf & Crumb',
      sector: 'F-7',
      address: 'Jinnah Super Market, Sector F-7, Islamabad',
      title: dropData.title || 'Artisanal Bakery Surprise Bag',
      category: dropData.category || 'bakery',
      pricePkr,
      retailPkr,
      discountPct: Math.round(((retailPkr - pricePkr) / retailPkr) * 100) || 60,
      bagCount,
      bagsLeft: bagCount,
      window: `${formatTime12(windowStart)} – ${formatTime12(windowEnd)}`,
      windowStart,
      windowEnd,
      tags: dropData.tags || ['Halal', 'Vegetarian'],
      status: 'live',
      description: dropData.description || 'Fresh evening surplus assortment.',
      image: dropData.image || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBl0QExfAQufL0cuPHPiCDwpAALo0_UtLuHIAdCr7bH-8acitcPPQ2YQUqJi2kdKL-JHOQ2IS1YXgUtzvh9FAe_JLSfD4EGq4A1_goSsQiFDRosLAZgFTES9hD67-GXx0u_CCQOhOnCNoSCodJYgpYgbIjkiJEQ9fLzPX72yZwWqY8od_YnpsrS4EAWG9KSCb9KLHUB9HjMEUl1md-fPa3si02GVYUwJ88jOEvinLah0Idgy34XPWXM'
    };

    this.state.drops.unshift(newDrop);
    this.addNotification(
      'New Drop Published!',
      `${newDrop.vendorName} posted ${newDrop.bagCount} bags at PKR ${newDrop.pricePkr}.`,
      'all'
    );
    this.saveState();
    return newDrop;
  }

  async verifyPickupCode(code) {
    try {
      const row = await apiFetch('/reservations/verify', {
        method: 'POST',
        body: JSON.stringify({ code: code.trim() })
      });
      const reservation = this.state.reservations.find(r => r.id === row.id) ||
        this.state.reservations.find(r => r.code === code.trim());
      if (reservation) reservation.status = 'COLLECTED';

      this.addNotification('Pickup Verified!', `Order #${row.code} collected.`, 'vendor');
      this.addNotification('Food Collected!', `You collected your bag. Enjoy!`, 'customer');
      this.saveState();
      return { success: true, reservation: reservation || row };
    } catch (err) {
      if (err.apiMessage) return { success: false, message: err.apiMessage };

      // Backend unreachable — fall back to the local-only check so the
      // demo still works offline.
      const reservation = this.state.reservations.find(r => r.code === code.trim() && r.status === 'RESERVED');
      if (!reservation) {
        return { success: false, message: 'Invalid pickup code or reservation already collected.' };
      }
      reservation.status = 'COLLECTED';
      this.saveState();
      return { success: true, reservation };
    }
  }

  // Send unsold bags to Volunteer Rescue Jobs
  async closeWindowAndSendToRescue(vendorId = 'v-1') {
    let serverJob = null;
    try {
      serverJob = await apiFetch('/rescue-jobs/close-window', {
        method: 'POST',
        body: JSON.stringify({ vendorId })
      });
    } catch (err) {
      console.warn('Nemat: close-window not persisted (backend unreachable).', err);
    }

    const vendorDrops = this.state.drops.filter(d => d.vendorId === vendorId && d.bagsLeft > 0);
    let totalUnsold = 0;
    vendorDrops.forEach(d => {
      totalUnsold += d.bagsLeft;
      d.status = 'closed';
      d.bagsLeft = 0;
    });
    if (totalUnsold === 0) totalUnsold = 6;

    const vendor = this.state.vendors.find(v => v.id === vendorId);
    const newJob = serverJob
      ? mapRescueJob(serverJob)
      : {
          id: 'rj-' + Date.now(),
          dropId: vendorDrops[0]?.id || 'drop-1',
          vendorName: vendor?.name || 'Loaf & Crumb',
          vendorAddress: vendor?.address || 'Jinnah Super Market, Sector F-7, Islamabad',
          vendorContact: vendor?.contact || 'Tariq M. (0300-5551234)',
          recipientId: 'rec-1',
          recipientName: 'Al-Noor Community Kitchen',
          recipientAddress: 'Sector I-8/4, Islamabad',
          bagsCount: totalUnsold,
          weightKg: +(totalUnsold * 0.55).toFixed(1),
          vehicle: 'two_wheeler',
          distanceKm: 4.8,
          etaMin: 20,
          status: 'available',
          urgent: true,
          closingWindow: 'Pickup window closed • Urgent rescue needed',
          pickupCode: Math.floor(1000 + Math.random() * 9000).toString(),
          handoverCode: Math.floor(1000 + Math.random() * 9000).toString(),
          volunteerName: null,
          tempLogC: null,
          notes: 'End-of-day surplus bags from evening close. Collect within 60 mins.'
        };

    this.state.rescueJobs.unshift(newJob);
    this.addNotification(
      'New Rescue Job Available!',
      `Urgent run: ${newJob.bagsCount} bags from ${newJob.vendorName} to Al-Noor Kitchen.`,
      'volunteer'
    );
    this.saveState();
    return newJob;
  }

  // Volunteer actions
  async claimRescueJob(jobId, volunteerName = 'Zeeshan K.') {
    const job = this.state.rescueJobs.find(j => j.id === jobId);
    if (!job || job.status !== 'available') {
      return { success: false, message: 'Job is no longer available or already claimed.' };
    }

    try {
      await apiFetch(`/rescue-jobs/${encodeURIComponent(jobId)}/claim`, {
        method: 'POST',
        body: JSON.stringify({ volunteerId: 'vol-1' }) // single seeded demo volunteer
      });
    } catch (err) {
      if (err.apiMessage) return { success: false, message: err.apiMessage };
      console.warn('Nemat: claim not persisted (backend unreachable).', err);
    }

    job.status = 'claimed';
    job.volunteerName = volunteerName;

    this.addNotification('Rescue Run Claimed!', `You claimed run #${job.id}. Head to ${job.vendorName}.`, 'volunteer');
    this.saveState();
    return { success: true, job };
  }

  async progressRescueStep(jobId, step, data = {}) {
    const job = this.state.rescueJobs.find(j => j.id === jobId);
    if (!job) return { success: false, message: 'Job not found' };

    apiFetch(`/rescue-jobs/${encodeURIComponent(jobId)}/progress`, {
      method: 'PATCH',
      body: JSON.stringify({ step, tempLogC: data.temp, weightKg: data.weight })
    }).catch(err => console.warn('Nemat: progress step not persisted (backend unreachable).', err));

    if (step === 'pickup_verified') {
      job.tempLogC = data.temp || 4.2;
      job.weightKg = Number(data.weight) || job.weightKg;
      job.status = 'in_transit';
    } else if (step === 'delivered') {
      job.status = 'delivered';
      const vol = this.state.volunteers[0];
      if (vol) {
        vol.runsCompleted += 1;
        vol.totalKgRescued = +(vol.totalKgRescued + job.weightKg).toFixed(1);
        vol.mealsDelivered += (job.bagsCount * 2);
      }
      const rec = this.state.recipientOrgs.find(r => r.name === job.recipientName);
      if (rec) {
        rec.tonightReceivedMeals += (job.bagsCount * 2);
      }
    }
    this.saveState();
    return { success: true, job };
  }

  // Recipient triage intake
  async confirmDeliveryTriage(jobId, accepted, reason = '') {
    const job = this.state.rescueJobs.find(j => j.id === jobId);
    if (!job) return { success: false, message: 'Job not found' };

    apiFetch(`/deliveries/${encodeURIComponent(jobId)}`, {
      method: 'PATCH',
      body: JSON.stringify({ accepted, reason })
    }).catch(err => console.warn('Nemat: delivery triage not persisted (backend unreachable).', err));

    if (accepted) {
      job.status = 'delivered';
      this.addNotification(
        'Delivery Confirmed & Accepted',
        `Food batch from ${job.vendorName} passed safety triage. Added to tonight's meals.`,
        'recipient'
      );
    } else {
      job.status = 'rejected';
      job.rejectionReason = reason;
      this.state.foodSafetyReports.unshift({
        id: 'fsr-' + Date.now(),
        vendorName: job.vendorName,
        sector: 'Islamabad',
        reportedBy: `Recipient Org (${job.recipientName})`,
        issue: 'Delivery Triage Rejected',
        details: reason || 'Food safety threshold failure upon inspection.',
        status: 'Audit Required',
        timestamp: 'Just now',
        vendorSuspended: false
      });
      this.addNotification(
        'Delivery Exception Logged',
        `Batch from ${job.vendorName} rejected: ${reason}. Incident sent to Admin desk.`,
        'admin'
      );
    }
    this.saveState();
    return { success: true, job };
  }

  // Admin actions
  async reviewApproval(appId, approved) {
    const app = this.state.approvals.find(a => a.id === appId);
    if (!app) return { success: false };

    apiFetch(`/approvals/${encodeURIComponent(appId)}`, {
      method: 'PATCH',
      body: JSON.stringify({ approved })
    }).catch(err => console.warn('Nemat: approval decision not persisted (backend unreachable).', err));

    app.status = approved ? 'approved' : 'rejected';
    this.addNotification(
      `Entity ${approved ? 'Approved' : 'Rejected'}`,
      `${app.name} (${app.category}) has been ${app.status} by Admin.`,
      'admin'
    );
    this.saveState();
    return { success: true, app };
  }

  async flagFoodSafety(vendorName, issue, details) {
    const vendor = this.state.vendors.find(v => v.name.toLowerCase().includes(vendorName.toLowerCase()));

    let id = 'fsr-' + Date.now();
    try {
      const row = await apiFetch('/food-safety-reports', {
        method: 'POST',
        body: JSON.stringify({
          vendorId: vendor?.id,
          vendorName,
          sector: vendor?.sector,
          reportedBy: this.state.currentUser.name,
          issue,
          details
        })
      });
      id = row.id; // server is the source of truth — suspendVendor() needs this real id
    } catch (err) {
      console.warn('Nemat: food safety report not persisted (backend unreachable).', err);
    }

    if (vendor) {
      vendor.flagsCount += 1;
      // FR-61: 2 confirmed flags in 30 days auto-suspends vendor
      if (vendor.flagsCount >= 2) {
        vendor.status = 'Suspended (Safety Review)';
      }
    }

    const report = {
      id,
      vendorName,
      sector: vendor?.sector || 'Islamabad',
      reportedBy: this.state.currentUser.name,
      issue,
      details,
      status: 'Under Review',
      timestamp: 'Just now',
      vendorSuspended: vendor ? vendor.flagsCount >= 2 : false
    };

    this.state.foodSafetyReports.unshift(report);
    this.addNotification(
      'Food Safety Incident Reported',
      `Flag against ${vendorName}: ${issue}. Admin investigation desk notified.`,
      'admin'
    );
    this.saveState();
    return report;
  }

  // Admin Food Safety desk "Suspend Vendor" action (FR-61).
  async suspendVendor(reportId) {
    const report = this.state.foodSafetyReports.find(r => r.id === reportId);
    if (!report) return { success: false, message: 'Report not found' };

    try {
      await apiFetch(`/food-safety-reports/${encodeURIComponent(reportId)}/suspend`, { method: 'POST' });
    } catch (err) {
      console.warn('Nemat: vendor suspension not persisted (backend unreachable).', err);
    }

    const vendor = this.state.vendors.find(v => v.name.toLowerCase().includes(report.vendorName.toLowerCase()));
    if (vendor) vendor.status = 'Suspended (Safety Review)';
    report.vendorSuspended = true;

    this.saveState();
    return { success: true, vendor };
  }
}

window.NematState = new StateManager();
