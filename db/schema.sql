-- Nemat (نعمت) — Surplus Food Rescue Platform
-- Schema ported 1:1 from the legacy client-side state (js/state.js),
-- normalized into relational tables. Postgres.

create extension if not exists pgcrypto;

create table users (
  id            text primary key,
  name          text not null,
  phone         text not null,
  role          text not null check (role in ('customer', 'vendor', 'volunteer', 'recipient', 'admin')),
  level         int not null default 1,
  meals_rescued int not null default 0,
  pkr_saved     int not null default 0,
  co2_saved_kg  numeric not null default 0,
  sector        text,
  radius_km     numeric default 3,
  language      text not null default 'en' check (language in ('en', 'ur')),
  created_at    timestamptz not null default now()
);

create table vendors (
  id          text primary key,
  name        text not null,
  sector      text not null,
  address     text not null,
  contact     text,
  status      text not null default 'Online • Accepting Orders',
  verified    boolean not null default false,
  rating      numeric,
  flags_count int not null default 0,
  photo_url   text,
  created_at  timestamptz not null default now()
);

create table drops (
  id            text primary key,
  vendor_id     text not null references vendors(id),
  title         text not null,
  category      text not null,
  price_pkr     int not null,
  retail_pkr    int not null,
  bag_count     int not null,
  bags_left     int not null,
  window_start  time not null,
  window_end    time not null,
  tags          text[] not null default '{}',
  status        text not null default 'live' check (status in ('live', 'sold_out', 'closed')),
  description   text,
  image_url     text,
  created_at    timestamptz not null default now()
);

create table reservations (
  id            text primary key,
  code          text not null,
  drop_id       text not null references drops(id),
  customer_id   text not null references users(id),
  price_pkr     int not null,
  status        text not null default 'RESERVED' check (status in ('RESERVED', 'COLLECTED', 'EXPIRED', 'CANCELLED')),
  qr_data       text,
  co2_saved_kg  numeric,
  created_at    timestamptz not null default now()
);

create table recipient_orgs (
  id                     text primary key,
  name                   text not null,
  sector                 text not null,
  address                text not null,
  director               text,
  daily_capacity         int not null,
  tonight_received_meals int not null default 0,
  status                 text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  cda_cert               text,
  created_at             timestamptz not null default now()
);

create table volunteers (
  id                text primary key,
  name              text not null,
  phone             text not null,
  vehicle           text,
  level             int not null default 1,
  runs_completed    int not null default 0,
  total_kg_rescued  numeric not null default 0,
  meals_delivered   int not null default 0,
  hub               text,
  status            text not null default 'Duty Shift OFF',
  created_at        timestamptz not null default now()
);

create table rescue_jobs (
  id               text primary key,
  drop_id          text references drops(id),
  vendor_name      text not null,
  vendor_address   text,
  vendor_contact   text,
  recipient_id     text references recipient_orgs(id),
  recipient_name   text,
  recipient_address text,
  bags_count       int not null,
  weight_kg        numeric,
  vehicle          text,
  distance_km      numeric,
  eta_min          int,
  status           text not null default 'available'
                     check (status in ('available', 'claimed', 'in_transit', 'delivered', 'rejected')),
  urgent           boolean not null default false,
  closing_window   text,
  pickup_code      text,
  handover_code    text,
  volunteer_id     text references volunteers(id),
  temp_log_c       numeric,
  delivery_accepted boolean,
  delivery_reject_reason text,
  notes            text,
  created_at       timestamptz not null default now()
);

create table approvals (
  id          text primary key,
  name        text not null,
  category    text not null,
  sector      text,
  reg_number  text,
  contact     text,
  status      text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  submitted_at timestamptz not null default now()
);

create table food_safety_reports (
  id                text primary key,
  vendor_id         text references vendors(id),
  vendor_name       text not null,
  sector            text,
  reported_by       text,
  issue             text not null,
  details           text,
  status            text not null default 'Under Review' check (status in ('Under Review', 'Resolved', 'Dismissed')),
  vendor_suspended  boolean not null default false,
  created_at        timestamptz not null default now()
);

create table notifications (
  id         text primary key,
  user_id    text references users(id),
  role       text not null default 'all',
  title      text not null,
  message    text not null,
  read       boolean not null default false,
  created_at timestamptz not null default now()
);

create index on drops (vendor_id);
create index on reservations (customer_id);
create index on reservations (drop_id);
create index on rescue_jobs (status);
create index on rescue_jobs (volunteer_id);
create index on notifications (user_id);
