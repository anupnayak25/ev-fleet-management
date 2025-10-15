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
