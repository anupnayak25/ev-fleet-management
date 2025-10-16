-- Fleets table
create table if not exists public.fleets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text,
  created_at timestamptz not null default now()
);

-- Vehicles table
create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  owner text not null,
  model text not null,
  registration_number text not null,
  fleet_id uuid references public.fleets(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists vehicles_fleet_idx on public.vehicles(fleet_id);

-- Charging sessions table
create table if not exists public.charging_sessions (
  id uuid primary key default gen_random_uuid(),
  fleet_id uuid references public.fleets(id) on delete set null,
  vehicle_id uuid references public.vehicles(id) on delete cascade,
  start_time timestamptz not null,
  end_time timestamptz,
  energy_used numeric,
  battery_status jsonb,
  created_at timestamptz not null default now()
);
create index if not exists charging_sessions_vehicle_idx on public.charging_sessions(vehicle_id);
create index if not exists charging_sessions_fleet_idx on public.charging_sessions(fleet_id);

-- Row Level Security: enable and allow authenticated users
alter table public.fleets enable row level security;
alter table public.vehicles enable row level security;
alter table public.charging_sessions enable row level security;

-- Policies: for demo, allow authenticated users to do CRUD
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'fleets' and policyname = 'fleets_auth_rw'
  ) then
    create policy fleets_auth_rw on public.fleets for all to authenticated using (true) with check (true);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'vehicles' and policyname = 'vehicles_auth_rw'
  ) then
    create policy vehicles_auth_rw on public.vehicles for all to authenticated using (true) with check (true);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'charging_sessions' and policyname = 'sessions_auth_rw'
  ) then
    create policy sessions_auth_rw on public.charging_sessions for all to authenticated using (true) with check (true);
  end if;
end $$;

-- ------------------------------------------------------------
-- Seed data (idempotent): dummy fleets, vehicles, sessions
-- Note: Uses fixed UUIDs for reproducibility. Safe to re-run.
-- ------------------------------------------------------------

-- Fleets
insert into public.fleets (id, name, location)
values
  ('11111111-1111-1111-1111-111111111111', 'Alpha Logistics', 'San Francisco, CA'),
  ('22222222-2222-2222-2222-222222222222', 'Beta Transport', 'Austin, TX')
on conflict (id) do nothing;

-- Vehicles
insert into public.vehicles (id, owner, model, registration_number, fleet_id)
values
  ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Alpha Logistics', 'Nissan Leaf', 'ALF-LEAF-001', '11111111-1111-1111-1111-111111111111'),
  ('aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'Alpha Logistics', 'Tesla Model 3', 'ALF-TM3-002', '11111111-1111-1111-1111-111111111111'),
  ('bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbb1', 'Beta Transport', 'Chevy Bolt', 'BET-BLT-101', '22222222-2222-2222-2222-222222222222')
on conflict (id) do nothing;

-- Charging Sessions
insert into public.charging_sessions (id, fleet_id, vehicle_id, start_time, end_time, energy_used, battery_status)
values
  (
    'ccccccc1-cccc-cccc-cccc-ccccccccccc1',
    '11111111-1111-1111-1111-111111111111',
    'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    now() - interval '2 days',
    now() - interval '2 days' + interval '45 minutes',
    22.5,
    '{"soc_start": 20, "soc_end": 80}'::jsonb
  ),
  (
    'ccccccc2-cccc-cccc-cccc-ccccccccccc2',
    '11111111-1111-1111-1111-111111111111',
    'aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
    now() - interval '1 day',
    now() - interval '1 day' + interval '30 minutes',
    15.8,
    '{"soc_start": 35, "soc_end": 70}'::jsonb
  ),
  (
    'ddddddd1-dddd-dddd-dddd-ddddddddddd1',
    '22222222-2222-2222-2222-222222222222',
    'bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbb1',
    now() - interval '3 hours',
    now() - interval '2 hours',
    12.1,
    '{"soc_start": 50, "soc_end": 90}'::jsonb
  )
on conflict (id) do nothing;
