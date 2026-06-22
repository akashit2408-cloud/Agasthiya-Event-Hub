-- Supabase/Postgres schema for DJ Eventer ERP.
-- Run this in Supabase SQL Editor, or with psql against your Supabase database.

create extension if not exists pgcrypto;

do $$ begin
  create type event_status as enum ('Planned', 'Confirmed', 'Completed', 'Cancelled', 'Rental');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type resource_status as enum ('Available', 'Booked', 'Rented', 'Maintenance');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type staff_status as enum ('Available', 'Assigned', 'Leave', 'Inactive');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type rental_condition as enum ('Excellent', 'Good', 'Fair', 'Needs Repair');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type payment_status as enum ('Pending', 'Partial', 'Paid', 'Refunded', 'Cancelled');
exception when duplicate_object then null;
end $$;

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null default 'Staff',
  phone text,
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  mobile text not null,
  email text,
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (mobile)
);

create table if not exists staff (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  role text not null,
  mobile text,
  status staff_status not null default 'Available',
  avatar_seed text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists vehicles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  registration_number text unique,
  driver_staff_id uuid references staff(id) on delete set null,
  status resource_status not null default 'Available',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists setups (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  quantity integer not null default 1 check (quantity >= 0),
  status resource_status not null default 'Available',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists rentals (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  category text not null,
  status resource_status not null default 'Available',
  condition rental_condition not null default 'Good',
  due_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete set null,
  title text not null,
  event_type text not null,
  location text not null,
  map_link text,
  event_date date not null,
  event_time time not null,
  vehicle_id uuid references vehicles(id) on delete set null,
  status event_status not null default 'Planned',
  total_amount numeric(12,2) not null default 0 check (total_amount >= 0),
  notes text,
  invitation_url text,
  remark text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists event_staff (
  event_id uuid not null references events(id) on delete cascade,
  staff_id uuid not null references staff(id) on delete restrict,
  assigned_role text,
  created_at timestamptz not null default now(),
  primary key (event_id, staff_id)
);

create table if not exists event_rentals (
  event_id uuid not null references events(id) on delete cascade,
  rental_id uuid not null references rentals(id) on delete restrict,
  quantity integer not null default 1 check (quantity > 0),
  created_at timestamptz not null default now(),
  primary key (event_id, rental_id)
);

create table if not exists event_setups (
  event_id uuid not null references events(id) on delete cascade,
  setup_id uuid not null references setups(id) on delete restrict,
  quantity integer not null default 1 check (quantity > 0),
  created_at timestamptz not null default now(),
  primary key (event_id, setup_id)
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id) on delete cascade,
  customer_id uuid references customers(id) on delete set null,
  amount numeric(12,2) not null check (amount >= 0),
  method text not null default 'Cash',
  status payment_status not null default 'Paid',
  paid_at timestamptz not null default now(),
  reference_number text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists whatsapp_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  audience text not null check (audience in ('Team', 'Customer')),
  body text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists alerts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text,
  severity text not null default 'info' check (severity in ('info', 'warning', 'danger', 'success')),
  event_id uuid references events(id) on delete cascade,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  table_name text,
  row_id uuid,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists backup_runs (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'Completed',
  file_url text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists idx_events_event_date on events(event_date);
create index if not exists idx_events_status on events(status);
create index if not exists idx_events_customer_id on events(customer_id);
create index if not exists idx_staff_status on staff(status);
create index if not exists idx_rentals_status on rentals(status);
create unique index if not exists idx_staff_name_unique on staff(name);
create unique index if not exists idx_rentals_name_unique on rentals(name);
create index if not exists idx_setups_status on setups(status);
create index if not exists idx_vehicles_status on vehicles(status);
create index if not exists idx_payments_event_id on payments(event_id);
create index if not exists idx_alerts_is_read on alerts(is_read);

create or replace view dashboard_summary as
select
  (select count(*) from events where event_date = current_date and status <> 'Cancelled') as todays_events,
  (select count(*) from staff where status = 'Available') as available_staff,
  (select count(*) from staff where status <> 'Inactive') as total_staff,
  (select coalesce(sum(quantity), 0) from setups where status = 'Available') as available_setups,
  (select coalesce(sum(quantity), 0) from setups) as total_setups,
  (select count(*) from vehicles where status = 'Available') as available_vehicles,
  (select count(*) from vehicles) as total_vehicles;

create or replace view event_list as
select
  e.id,
  e.title,
  e.event_type,
  e.location,
  e.map_link,
  e.event_date,
  e.event_time,
  e.status,
  c.name as customer_name,
  c.mobile as customer_mobile,
  (select string_agg(s.name || ' (' || es_setup.quantity || ')', ', ') 
   from event_setups es_setup 
   join setups s on s.id = es_setup.setup_id 
   where es_setup.event_id = e.id) as setup_name,
  v.name as vehicle_name,
  count(es.staff_id)::integer as staff_count
from events e
left join customers c on c.id = e.customer_id
left join vehicles v on v.id = e.vehicle_id
left join event_staff es on es.event_id = e.id
group by e.id, c.name, c.mobile, v.name;

alter table profiles enable row level security;
alter table customers enable row level security;
alter table staff enable row level security;
alter table vehicles enable row level security;
alter table setups enable row level security;
alter table rentals enable row level security;
alter table events enable row level security;
alter table event_staff enable row level security;
alter table event_rentals enable row level security;
alter table event_setups enable row level security;
alter table payments enable row level security;
alter table whatsapp_templates enable row level security;
alter table alerts enable row level security;
alter table app_settings enable row level security;
alter table audit_logs enable row level security;
alter table backup_runs enable row level security;

do $$ declare
  table_name text;
begin
  foreach table_name in array array[
    'profiles', 'customers', 'staff', 'vehicles', 'setups', 'rentals',
    'events', 'event_staff', 'event_rentals', 'event_setups', 'payments',
    'whatsapp_templates', 'alerts', 'app_settings', 'audit_logs', 'backup_runs'
  ]
  loop
    execute format('drop policy if exists authenticated_read on %I', table_name);
    execute format('drop policy if exists authenticated_insert on %I', table_name);
    execute format('drop policy if exists authenticated_update on %I', table_name);
    execute format('drop policy if exists authenticated_delete on %I', table_name);
    execute format('create policy authenticated_read on %I for select to authenticated using (true)', table_name);
    execute format('create policy authenticated_insert on %I for insert to authenticated with check (true)', table_name);
    execute format('create policy authenticated_update on %I for update to authenticated using (true) with check (true)', table_name);
    execute format('create policy authenticated_delete on %I for delete to authenticated using (true)', table_name);
  end loop;
end $$;

do $$ declare
  table_name text;
begin
  foreach table_name in array array['customers', 'events', 'event_staff', 'event_setups', 'rentals', 'staff']
  loop
    execute format('drop policy if exists anon_insert_dev on %I', table_name);
    execute format('create policy anon_insert_dev on %I for insert to anon with check (true)', table_name);
  end loop;
end $$;

-- Temporary dev policies for the current client-only app.
-- Remove these after real Supabase auth is wired into /login.
do $$ declare
  table_name text;
begin
  foreach table_name in array array[
    'profiles', 'customers', 'staff', 'vehicles', 'setups', 'rentals',
    'events', 'event_staff', 'event_rentals', 'event_setups', 'payments',
    'whatsapp_templates', 'alerts', 'app_settings', 'backup_runs'
  ]
  loop
    execute format('drop policy if exists anon_read_dev on %I', table_name);
    execute format('create policy anon_read_dev on %I for select to anon using (true)', table_name);
  end loop;
end $$;

insert into rentals (name, category, status, condition, due_date) values
  ('JBL SRX828SP Subwoofer', 'Audio', 'Available', 'Good', null),
  ('Pioneer CDJ-3000', 'DJ Gear', 'Rented', 'Excellent', '2026-06-21'),
  ('Sharpy Beam Moving Head', 'Lighting', 'Maintenance', 'Needs Repair', null),
  ('Yamaha QL5 Digital Console', 'Audio', 'Available', 'Excellent', null),
  ('Smoke Machine 1500W', 'Effects', 'Rented', 'Good', '2026-06-20'),
  ('Truss 2m Aluminum', 'Staging', 'Available', 'Fair', null)
on conflict (name) do nothing;

insert into staff (name, role, status, avatar_seed) values
  ('Ravi Kumar', 'DJ Operator', 'Available', 'Ravi Kumar'),
  ('Mani Shankar', 'Sound Engineer', 'Assigned', 'Mani Shankar'),
  ('Arjun Prakash', 'Light Operator', 'Available', 'Arjun Prakash'),
  ('Suresh Babu', 'Helper', 'Assigned', 'Suresh Babu'),
  ('Vicky', 'Helper', 'Available', 'Vicky'),
  ('Kumar', 'Driver', 'Available', 'Kumar'),
  ('Prakash', 'Sound Engineer', 'Leave', 'Prakash')
on conflict (name) do nothing;

insert into setups (name, quantity, status) values
  ('Basic Setup', 5, 'Available'),
  ('Honeycomb Setup', 5, 'Available'),
  ('Honeycomb with mirror ball sharpy Dj setup', 2, 'Available'),
  ('Cold Pyro', 10, 'Available'),
  ('LED Dance Floor', 2, 'Available'),
  ('Low Fog Entry', 5, 'Available'),
  ('360 Degree Selfie Booth', 2, 'Available'),
  ('Balloon Blast', 5, 'Available'),
  ('3rd Dance Floor', 2, 'Available')
on conflict (name) do nothing;

insert into vehicles (name, registration_number, status) values
  ('Vehicle 1', 'TN-00-DJ-0001', 'Available'),
  ('Vehicle 2', 'TN-00-DJ-0002', 'Booked')
on conflict (registration_number) do nothing;

insert into customers (name, mobile, address) values
  ('Wedding Customer', '9000000001', 'ECR, Chennai'),
  ('Birthday Customer', '9000000002', 'OMR, Chennai'),
  ('Corporate Customer', '9000000003', 'Nungambakkam, Chennai')
on conflict (mobile) do nothing;

insert into whatsapp_templates (name, audience, body) values
  ('Team Event Assignment', 'Team', 'Event: {{title}}\nDate: {{event_date}} {{event_time}}\nLocation: {{location}}\nSetup: {{setup_name}}'),
  ('Customer Event Confirmation', 'Customer', 'Hi {{customer_name}}, your event {{title}} is confirmed for {{event_date}} at {{event_time}}.')
on conflict (name) do nothing;

insert into app_settings (key, value) values
  ('company', '{"name":"DJ Eventer Chennai ERP","timezone":"Asia/Kolkata"}')
on conflict (key) do nothing;
