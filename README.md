# Nemat (نعمت) — Surplus Food Rescue

A mobile-first PWA for Islamabad and Rawalpindi. Cafés and bakeries sell end-of-day surplus as discounted "surprise bags". Bags still unsold when the pickup window closes go to a volunteer network, which delivers them to shelters, madrassas, orphanages and community kitchens.

The full requirements are in [`SRS — Surplus Food Rescue Web App (Islamabad).md`](./SRS%20—%20Surplus%20Food%20Rescue%20Web%20App%20(Islamabad).md).

## Roles

| Role | Can do |
| --- | --- |
| Customer | Browse nearby bags (list and map), reserve, show a pickup pass |
| Vendor | Post drops (price, quantity, pickup window), verify pickups |
| Volunteer | Claim rescue jobs, record pickup and delivery |
| Recipient org | Receive and confirm rescued food |
| Admin | Approve vendors, volunteers and orgs; review food-safety reports; suspend vendors |

There is no login yet. You switch roles from the **Choose role** screen.

The UI is available in English and Urdu (`js/i18n.js`).

## Stack

- Frontend: plain HTML, CSS and JS with no build step. Screens are in `stitch_surplus_food_rescue_platform/*/code.html`, the shell is `index.html`, and app logic is in `js/`.
- Backend: Node `http` server (`server.js`) plus a single API router (`lib/api.js`).
- Database: Postgres through `pg` (`lib/db.js`).
- Deployment: Vercel. `api/[...path].js` sends every `/api/*` request to the same router.
- PWA: `manifest.json` and a service worker in `sw.js`.

## Getting started

Requirements: Node 20.6 or later (the npm scripts use `--env-file`) and a Postgres database.

```bash
npm install
cp .env.example .env        # then set DATABASE_URL
npm run db:migrate          # applies db/schema.sql + db/seed.sql
npm run dev                 # http://localhost:3000
```

To apply the schema without seed data, run `npm run db:migrate:schema-only`.

Run the tests with `npm test`. They use Node's built-in test runner and need no database.

### Environment variables

| Name | Default | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | `postgres://localhost:5432/nemat` | Postgres connection string |
| `PORT` | `3000` | Local server port |
| `GEOAPIFY_API_KEY` | none | Map tiles (served to the browser by `/api/map-config`) |
| `SERPLY_API_KEY` | none | Café photo lookup (`/api/serply/images`); returns 503 when unset |

## API

All routes live in `lib/api.js`.

| Method | Path |
| --- | --- |
| GET | `/api/vendors` |
| GET, POST | `/api/drops` |
| GET | `/api/drops/:id` |
| GET, POST | `/api/reservations` |
| POST | `/api/reservations/verify` |
| GET | `/api/rescue-jobs` |
| POST | `/api/rescue-jobs/close-window` |
| POST | `/api/rescue-jobs/:id/claim` |
| PATCH | `/api/rescue-jobs/:id/progress` |
| PATCH | `/api/deliveries/:id` |
| GET | `/api/approvals` |
| PATCH | `/api/approvals/:id` |
| GET, POST | `/api/food-safety-reports` |
| POST | `/api/food-safety-reports/:id/suspend` |
| GET | `/api/recipient-orgs` |
| GET | `/api/volunteers` |
| GET, PATCH | `/api/users/:id` |
| GET | `/api/map-config` |
| GET | `/api/serply/images?name=` |

## Project layout

```
index.html, js/, css/        app shell, state, i18n, styles
stitch_surplus_food_rescue_platform/   one folder per screen (code.html + screen.png mockup)
server.js                    local static + API server
lib/api.js, lib/db.js        API router, Postgres pool
api/[...path].js             Vercel serverless entry
db/                          schema.sql, seed.sql, migrate.mjs
```

## Deploying to Vercel

1. Import the repo into Vercel.
2. Set `DATABASE_URL` to a hosted Postgres database (the team uses Supabase), plus `GEOAPIFY_API_KEY` and `SERPLY_API_KEY`.
3. Run `npm run db:migrate` against that database once.

Static files are served as they are, and `/api/*` runs as a single function.

## License

MIT
