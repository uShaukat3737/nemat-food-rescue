-- Demo/seed data, matching the legacy js/state.js defaultState exactly,
-- including the original hosted image URLs.

insert into users (id, name, phone, role, level, meals_rescued, pkr_saved, co2_saved_kg, sector, radius_km, language) values
  ('usr-101', 'Bilal K.', '+92 300 8594210', 'customer', 2, 18, 14250, 28.4, 'F-7', 3, 'en');

insert into vendors (id, name, sector, address, contact, status, verified, rating, flags_count, photo_url) values
  ('v-1', 'Loaf & Crumb',     'F-7',       'Jinnah Super Market, Sector F-7, Islamabad',        'Tariq M. (0300-5551234)',  'Online • Accepting Orders', true, 4.9, 0, 'https://lh3.googleusercontent.com/aida-public/AB6AXuBl0QExfAQufL0cuPHPiCDwpAALo0_UtLuHIAdCr7bH-8acitcPPQ2YQUqJi2kdKL-JHOQ2IS1YXgUtzvh9FAe_JLSfD4EGq4A1_goSsQiFDRosLAZgFTES9hD67-GXx0u_CCQOhOnCNoSCodJYgpYgbIjkiJEQ9fLzPX72yZwWqY8od_YnpsrS4EAWG9KSCb9KLHUB9HjMEUl1md-fPa3si02GVYUwJ88jOEvinLah0Idgy34XPWXM'),
  ('v-2', 'Brew District',    'F-7',       'College Road, Sector F-7/2, Islamabad',             'Kamran S. (0321-9876543)', 'Online • Accepting Orders', true, 4.8, 0, 'https://lh3.googleusercontent.com/aida-public/AB6AXuB0qzoWz1MLPqbAWVW6O5_zTILs6L3voGROclPeAwGsc9bXvVkVBs4IpikF3QS7PhalIcUY2iFfTx2yZ1qV0KgWWi2gaHqevJ5QcaTf5XBmhEyM_rTBEHfhqYGxGrXDI-Hk6Xmbs3ZGdEN09FpF2P9E_H1d3AtPr1Y6LE3Xad4VoLurJULSDJPYX8EtMF6VT1YOqx2_xUl1EWuQDU0DFDv2qsI6xbN2EDymccMjdvluyKhgj5q2h9ww'),
  ('v-3', 'Sweet Truth',      'Blue Area', 'Beverly Centre, Jinnah Avenue, Blue Area, Islamabad','Hassan A. (0333-1122334)', 'Online • Accepting Orders', true, 4.7, 0, 'https://lh3.googleusercontent.com/aida-public/AB6AXuCd1VT7jkmCrsMfYsmLflANwdxe8B4SA-7lqtfiqCWZK7fh8425dd8Xl1vCB4UC905j_msaDh7vbGK0IP-g7pNRxeh3ZD7Rwdcakh-4FBY0MmaVnWdNe_HoxMcyfKI_BI_S5d3OC9IlbnXpPcKoNmL1U_PVGH8m8BPrNwlZHmNb5REXsg7Z7SdLTvHNvkoiSbZTAR4aFRRymxHC5VtHi2fVHXbFtTe3JUva2TqZaD9t91D1VnUdS8su'),
  ('v-4', 'Burning Brownie',  'F-6',       'Super Market, Sector F-6, Islamabad',                'Saad M. (0301-4455667)',   'Online • Accepting Orders', true, 4.9, 1, 'https://lh3.googleusercontent.com/aida-public/AB6AXuC_-wiFEXG5iiwnUMRWiwcmqd7s1HpwwLVUvnQq6hniuST5svtfVdpet4n85vCB1VS5ZSHhwxiPyjKjWYdwMk4KW03fNdctTiMjgtztWLEe8ahsweWlrCQxbbynVhm660oaeYVRpQQmx3eL5lHTxSDbn1IICIROUddlIitA9CHQK0Ueq4kj_V6r9h5r6NHd6bB2XYtpy5hK2JttJq5_mxjzq64B9ny5eDQ7QEW2SzFY9DydqWG8oK8J');

insert into drops (id, vendor_id, title, category, price_pkr, retail_pkr, bag_count, bags_left, window_start, window_end, tags, status, description, image_url) values
  ('drop-1', 'v-1', 'Artisanal Pastry Surprise Bag',      'bakery', 450, 1200, 8, 8, '20:30', '21:30',
    array['Halal','Vegetarian','Contains Gluten','Contains Nuts'], 'live',
    'Golden flaky French croissants, pain au chocolat, sourdough slices, and fruit danishes baked fresh this morning.',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBl0QExfAQufL0cuPHPiCDwpAALo0_UtLuHIAdCr7bH-8acitcPPQ2YQUqJi2kdKL-JHOQ2IS1YXgUtzvh9FAe_JLSfD4EGq4A1_goSsQiFDRosLAZgFTES9hD67-GXx0u_CCQOhOnCNoSCodJYgpYgbIjkiJEQ9fLzPX72yZwWqY8od_YnpsrS4EAWG9KSCb9KLHUB9HjMEUl1md-fPa3si02GVYUwJ88jOEvinLah0Idgy34XPWXM'),
  ('drop-2', 'v-2', 'Gourmet Panini & Salad Bag',         'cafe',   550, 1400, 4, 4, '21:00', '22:00',
    array['Halal','Savory','Fresh Salad','Contains Dairy'], 'live',
    'Toasted artisan paninis, Mediterranean roasted veg salad bowls, and fresh cold pressed brew beverage.',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuB0qzoWz1MLPqbAWVW6O5_zTILs6L3voGROclPeAwGsc9bXvVkVBs4IpikF3QS7PhalIcUY2iFfTx2yZ1qV0KgWWi2gaHqevJ5QcaTf5XBmhEyM_rTBEHfhqYGxGrXDI-Hk6Xmbs3ZGdEN09FpF2P9E_H1d3AtPr1Y6LE3Xad4VoLurJULSDJPYX8EtMF6VT1YOqx2_xUl1EWuQDU0DFDv2qsI6xbN2EDymccMjdvluyKhgj5q2h9ww'),
  ('drop-3', 'v-3', 'Midnight Sweet Treat Box',           'bakery', 400, 1100, 6, 6, '21:30', '22:30',
    array['Halal','Dessert','Contains Eggs','Contains Dairy'], 'live',
    'Assorted artisan cupcakes, cinnamon swirl rolls with cream cheese glaze, and gourmet cookies.',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCd1VT7jkmCrsMfYsmLflANwdxe8B4SA-7lqtfiqCWZK7fh8425dd8Xl1vCB4UC905j_msaDh7vbGK0IP-g7pNRxeh3ZD7Rwdcakh-4FBY0MmaVnWdNe_HoxMcyfKI_BI_S5d3OC9IlbnXpPcKoNmL1U_PVGH8m8BPrNwlZHmNb5REXsg7Z7SdLTvHNvkoiSbZTAR4aFRRymxHC5VtHi2fVHXbFtTe3JUva2TqZaD9t91D1VnUdS8su'),
  ('drop-4', 'v-4', 'Decadent Brownie & Tart Assortment', 'bakery', 500, 1350, 3, 3, '20:45', '21:45',
    array['Halal','Dessert','Contains Nuts'], 'live',
    'Rich fudge brownies, classic New York cheesecake slices, and lemon meringue tartlets.',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuC_-wiFEXG5iiwnUMRWiwcmqd7s1HpwwLVUvnQq6hniuST5svtfVdpet4n85vCB1VS5ZSHhwxiPyjKjWYdwMk4KW03fNdctTiMjgtztWLEe8ahsweWlrCQxbbynVhm660oaeYVRpQQmx3eL5lHTxSDbn1IICIROUddlIitA9CHQK0Ueq4kj_V6r9h5r6NHd6bB2XYtpy5hK2JttJq5_mxjzq64B9ny5eDQ7QEW2SzFY9DydqWG8oK8J');

insert into reservations (id, code, drop_id, customer_id, price_pkr, status, qr_data, co2_saved_kg, created_at) values
  ('res-1', '4827', 'drop-1', 'usr-101', 450, 'RESERVED', 'NMT-4827-SECURE', 1.8, now() - interval '24 minutes');

insert into recipient_orgs (id, name, sector, address, director, daily_capacity, tonight_received_meals, status, cda_cert) values
  ('rec-1', 'Al-Noor Community Kitchen', 'I-8/4', 'Sector I-8/4, Islamabad', 'Sr. Yasmin Kausar', 250, 168, 'approved', 'CDA-ICT-NGO-2024-88'),
  ('rec-2', 'Edhi Shelter Home',         'H-8',   'Sector H-8, Islamabad',   'Muhammad Rizwan',   180, 110, 'approved', 'CDA-ICT-NGO-2023-14');

insert into volunteers (id, name, phone, vehicle, level, runs_completed, total_kg_rescued, meals_delivered, hub, status) values
  ('vol-1', 'Zeeshan K.', '+92 312 4567890', 'Honda CG125 (LEB-491)', 3, 24, 148.5, 412, 'Faisal Mosque Civic Volunteers', 'Duty Shift ON');

insert into rescue_jobs (id, drop_id, vendor_name, vendor_address, vendor_contact, recipient_id, recipient_name, recipient_address,
  bags_count, weight_kg, vehicle, distance_km, eta_min, status, urgent, closing_window, pickup_code, handover_code, volunteer_id, temp_log_c, notes) values
  ('rj-104', 'drop-1', 'Loaf & Crumb',  'Jinnah Super Market, F-7 Markaz, Islamabad', 'Tariq M. (0300-5551234)',
    'rec-1', 'Al-Noor Community Kitchen', 'Sector I-8/4, Islamabad',
    12, 6.4, 'two_wheeler', 4.8, 18, 'available', true, 'Closing in 35 mins', '8841', '7192', null, null,
    'Breads, croissants, and sealed bakery bags. Thermal box required.'),
  ('rj-102', 'drop-2', 'Brew District', 'College Road, F-7/2, Islamabad', 'Kamran S. (0321-9876543)',
    'rec-2', 'Edhi Shelter Home', 'Sector H-8, Islamabad',
    6, 3.2, 'two_wheeler', 3.5, 15, 'claimed', false, 'Closing in 50 mins', '3149', '6201', 'vol-1', 4.5,
    'Prepared sandwiches and cold juices. Maintain chilled transit.');

insert into approvals (id, name, category, sector, reg_number, contact, status, submitted_at) values
  ('app-1', 'Crust & Co Artisanal Bakery',    'Vendor (Bakery)',   'F-10 Markaz',           'CDA-ICT-9021',            'Farhan Ali (0321-4455889)',  'pending', now() - interval '1 day'),
  ('app-2', 'Tehzeeb Bakers',                 'Vendor (Bakery)',   'G-9 Karachi Company',   'CDA-ICT-4182',            'Zahid Khan (0300-8811223)',  'pending', now() - interval '1 day'),
  ('app-3', 'Asim Raza',                      'Volunteer Courier', 'H-12 (NUST Hub)',       'VOUCHED: NUST CSS Society','0345-9988776',              'pending', now() - interval '1 day'),
  ('app-4', 'Hope Community Feeding Kitchen', 'Recipient NGO',     'G-7/2 Islamabad',       'CDA-WELF-2025-11',        'Mrs. Parveen (0332-6655443)','pending', now() - interval '2 days');

insert into food_safety_reports (id, vendor_id, vendor_name, sector, reported_by, issue, details, status, vendor_suspended, created_at) values
  ('fsr-1', 'v-4', 'Burning Brownie', 'F-6 Super Market', 'Customer (Reservation #NMT-3910)',
    'Storage Temperature Check Needed',
    'Customer noted the chilled cream pastry box felt lukewarm upon pickup counter handover.',
    'Under Review', false, now() - interval '3 hours');

insert into notifications (id, user_id, role, title, message, read, created_at) values
  ('notif-1', 'usr-101', 'customer', 'Active Reservation Confirmed', 'Your pickup pass #4827 at Loaf & Crumb is ready. Window opens at 8:30 PM.', false, now() - interval '12 minutes'),
  ('notif-2', null,      'volunteer', 'New Rescue Job in F-7', '12 surplus bakery bags available at Loaf & Crumb for Al-Noor Kitchen.', false, now() - interval '25 minutes');
