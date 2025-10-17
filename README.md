# EV Fleet Management API

Node.js + Express REST API for managing EV fleets, vehicles, and charging sessions. Uses Supabase for PostgreSQL database and authentication.

## Tech Stack
- Runtime: Node.js (Express)
- Database: Supabase Postgres
- Auth: Supabase Auth (email/password)
- PostgreSQL: `Backend/db/schema.sql` (tables, RLS policies, seed data)
- API Docs/Test: Postman collection (optional)

## Core Entities
- Fleet: id, name, location, created_at
- Vehicle: id, owner, model, registration_number, fleet_id, created_at
- ChargingSession: id, fleet_id, vehicle_id, start_time, end_time, energy_used, battery_status (jsonb), created_at

## API Overview

Base URL (local): http://localhost:3000

Auth (public):
- POST /api/auth/signup
- POST /api/auth/login → returns access_token

Fleets (auth required):
- GET /api/fleets
- POST /api/fleets
- PUT /api/fleets/:id
- DELETE /api/fleets/:id

Vehicles (auth required):
- GET /api/vehicles?fleetId=<uuid>    (optional filter)
- POST /api/vehicles
- PUT /api/vehicles/:id
- DELETE /api/vehicles/:id

Charging Sessions (auth required):
- GET /api/sessions?vehicleId=<uuid>&fleetId=<uuid>  (both optional; use either)
- POST /api/sessions
- PUT /api/sessions/:id
- DELETE /api/sessions/:id

Authorization header for protected routes:
```
Authorization: Bearer <access_token>
```

## Project Structure (reference)
```
ev-fleet-management/
├─ Backend/
│  ├─ src/
│  │  ├─ index.ts                  # Express app bootstrap
│  │  ├─ config/supabase.ts        # Supabase clients (anon + admin)
│  │  ├─ middleware/auth.ts        # Bearer token verification
│  │  ├─ routes/auth.ts            # /api/auth/*
│  │  ├─ routes/fleets.ts          # /api/fleets/*
│  │  ├─ routes/vehicles.ts        # /api/vehicles/*
│  │  └─ routes/sessions.ts        # /api/sessions/*
│  ├─ db/schema.sql                # Tables, RLS, seed data
│  ├─ postman/
│  │  ├─ EV Fleet Management API.postman_collection.json
│  │  └─ EV Fleet Management API.postman_environment.json
│  └─ .env                         # local environment variables
└─ README.md
```

Note: Filenames may vary if you customized.

## Setup

1) Prerequisites
- Node.js 18+ recommended
- A Supabase project (URL + keys)
- Optional: psql CLI for running SQL locally

2) Install dependencies
```
cd Backend
npm install
```

3) Configure environment
Create `Backend/.env`:
```
PORT=3000

# Supabase
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # server-only, never expose to client

# Dev helper: auto-confirm users at signup when true
SKIP_EMAIL_CONFIRM=true

# Optional: email confirmation redirect if you keep confirmations enabled
EMAIL_REDIRECT_TO=http://localhost:3000
```

4) Initialize database
- Open Supabase Dashboard → SQL Editor → paste and run `Backend/db/schema.sql`
  - Creates tables, indexes, enables RLS, adds permissive demo policies, and seeds sample data.

Alternatively (PowerShell with psql):
```
cd Backend
$env:PGPASSWORD="<db_password>"; psql -h <host> -U <user> -d <db> -p 5432 -f ".\db\schema.sql"
```

5) Run the API (Windows PowerShell)
- Common scripts:
  - Dev (watch): `npm run dev`
  - Start: `npm start`
If not set, try: `node ./dist/index.js` (after building) or `ts-node ./src/index.ts`.

## Quick Start (Postman)

1) Import collection and environment from `Backend/postman/`.
2) Select the environment (e.g., “EV Fleet API Local”).
3) Signup: POST /api/auth/signup with email/password.
   - If email confirmations are enabled, check your inbox or set `SKIP_EMAIL_CONFIRM=true`.
4) Login: POST /api/auth/login → saves `accessToken` in environment.
5) Call protected routes with the Bearer token.

Seed IDs you can use (if you kept the provided seeds):
- Fleets: 11111111-1111-1111-1111-111111111111, 22222222-2222-2222-2222-222222222222
- Vehicles: aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1, aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaa2, bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbb1
- Sessions: ccccccc1-cccc-cccc-cccc-ccccccccccc1, ccccccc2-cccc-cccc-cccc-ccccccccccc2, ddddddd1-dddd-dddd-dddd-ddddddddddd1

## Request Examples

Signup:
```
POST /api/auth/signup
Content-Type: application/json

{ "email": "user@example.com", "password": "Passw0rd!" }
```

Login:
```
POST /api/auth/login
Content-Type: application/json

{ "email": "user@example.com", "password": "Passw0rd!" }
```

Create Fleet:
```
POST /api/fleets
Authorization: Bearer <token>
Content-Type: application/json

{ "name": "Gamma Couriers", "location": "Seattle, WA" }
```

List Vehicles by Fleet:
```
GET /api/vehicles?fleetId=11111111-1111-1111-1111-111111111111
Authorization: Bearer <token>
```

Create Charging Session:
```
POST /api/sessions
Authorization: Bearer <token>
Content-Type: application/json

{
  "fleetId": "11111111-1111-1111-1111-111111111111",
  "vehicleId": "aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1",
  "startTime": "2025-10-15T10:00:00Z",
  "endTime": "2025-10-15T10:45:00Z",
  "energyUsed": 20.5,
  "batteryStatus": { "soc_start": 25, "soc_end": 80 }
}
```

## Database & Security

- Tables and policies are defined in `Backend/db/schema.sql`.
- Row Level Security is enabled; demo policies allow CRUD for authenticated users.
- Keep `SUPABASE_SERVICE_ROLE_KEY` secret and server-only.

## Troubleshooting

- 401 Unauthorized:
  - Ensure the `Authorization: Bearer <token>` header is present.
- 403 due to RLS:
  - Use a valid Supabase access token from login and ensure the policies match your use case.

## Scripts (typical)
Your `package.json` may include:
```
"scripts": {
  "dev": "nodemon --exec ts-node src/index.ts",
  "start": "node dist/index.js",
  "build": "tsc",
  "lint": "eslint .",
  "db:apply": "echo Use Supabase SQL editor or psql to run ./db/schema.sql"
}
```
