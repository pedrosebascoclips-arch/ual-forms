-- ═══════════════════════════════════════════════════════════════
--  UAL Credit App — Supabase SQL Setup
--  Run this in Supabase → SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────
-- 1. CREDIT APPS TABLE
--    Stores completed credit applications submitted by clients
-- ─────────────────────────────────────────────────────────────
create table if not exists credit_apps (
  id                  uuid        default gen_random_uuid() primary key,
  client_id           uuid        references clients(id) on delete set null,
  consultant          text,
  first_name          text,
  last_name           text,
  phone               text,
  email               text,
  dob                 text,
  ssn                 text,
  address             text,
  address2            text,
  city                text,
  state               text,
  zip                 text,
  own_or_rent         text,
  time_at_address     text,
  monthly_rent        text,
  employer_name       text,
  employer_phone      text,
  employer_address    text,
  employer_address2   text,
  employer_city       text,
  employer_state      text,
  employer_zip        text,
  time_in_position    text,
  job_title           text,
  annual_income       text,
  signature_first     text,
  signature_last      text,
  signature_canvas    text,        -- base64 PNG of drawn signature
  created_at          timestamptz default now()
);

-- Add signature_canvas if table already exists (safe to run)
alter table credit_apps add column if not exists signature_canvas text;

-- ─────────────────────────────────────────────────────────────
-- 2. CREDIT APP INVITES TABLE
--    Tracks every tracker link sent from the CRM
--    Lets you see: sent → opened → in progress → submitted
-- ─────────────────────────────────────────────────────────────
create table if not exists credit_app_invites (
  id                  uuid        default gen_random_uuid() primary key,
  client_id           uuid        references clients(id) on delete set null,
  credit_app_id       uuid        references credit_apps(id) on delete set null,
  invite_token        text        not null unique,
  sent_by             text,
  status              text        default 'sent',   -- sent | opened | in_progress | signing_done | submitted
  progress_percent    integer     default 0,
  last_step           text,
  opened_at           timestamptz,
  signing_done_at     timestamptz,
  submitted_at        timestamptz,
  updated_at          timestamptz default now(),
  created_at          timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────
-- 3. ROW LEVEL SECURITY
--    Credit app is PUBLIC (no login required)
--    Anyone with the link can submit — anon key is fine
-- ─────────────────────────────────────────────────────────────

-- credit_apps: allow public insert and select (needed to match client by name/phone)
alter table credit_apps enable row level security;

drop policy if exists "Public can insert credit apps" on credit_apps;
create policy "Public can insert credit apps"
  on credit_apps for insert
  with check (true);

drop policy if exists "Public can read credit apps" on credit_apps;
create policy "Public can read credit apps"
  on credit_apps for select
  using (true);

-- credit_app_invites: allow public read (to load invite by token) and update (to track progress)
alter table credit_app_invites enable row level security;

drop policy if exists "Public can read invites" on credit_app_invites;
create policy "Public can read invites"
  on credit_app_invites for select
  using (true);

drop policy if exists "Public can insert invites" on credit_app_invites;
create policy "Public can insert invites"
  on credit_app_invites for insert
  with check (true);

drop policy if exists "Public can update invites" on credit_app_invites;
create policy "Public can update invites"
  on credit_app_invites for update
  using (true);

-- ─────────────────────────────────────────────────────────────
-- 4. INDEXES (faster lookups)
-- ─────────────────────────────────────────────────────────────
create index if not exists idx_credit_app_invites_token    on credit_app_invites(invite_token);
create index if not exists idx_credit_app_invites_client   on credit_app_invites(client_id);
create index if not exists idx_credit_apps_client          on credit_apps(client_id);

-- ─────────────────────────────────────────────────────────────
-- DONE — verify with:
--   select * from credit_apps limit 5;
--   select * from credit_app_invites limit 5;
-- ─────────────────────────────────────────────────────────────
