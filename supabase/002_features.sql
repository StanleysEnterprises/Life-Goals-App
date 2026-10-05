-- Update #2 — run once in Supabase → SQL Editor → New query → Run.
-- Safe to run more than once.

-- Goals: retire without losing history, and custom ordering
alter table goals add column if not exists retired_on date;
alter table goals add column if not exists sort_order double precision;

-- Notes: shared "Us" notes, and weekly check-ins
alter table notes add column if not exists shared boolean not null default false;
alter table notes drop constraint if exists notes_kind_check;
alter table notes add constraint notes_kind_check check (kind in ('note', 'intention', 'checkin'));

-- Cheers: little reactions sent to each other
create table if not exists cheers (
  id uuid primary key,
  from_person text not null check (from_person in ('tegan', 'will')),
  to_person text not null check (to_person in ('tegan', 'will')),
  ref_id text not null,        -- what was cheered (a goal on a day, or a win)
  ref_text text,               -- its title, for the pop-up
  emoji text not null,
  seen boolean not null default false,
  created_at timestamptz not null default now()
);
alter table cheers enable row level security;
drop policy if exists "app access" on cheers;
create policy "app access" on cheers for all using (true) with check (true);

-- Phones that have turned on reminders
create table if not exists push_subscriptions (
  endpoint text primary key,
  person text not null check (person in ('tegan', 'will')),
  subscription jsonb not null,
  created_at timestamptz not null default now()
);
alter table push_subscriptions enable row level security;
drop policy if exists "app access" on push_subscriptions;
create policy "app access" on push_subscriptions for all using (true) with check (true);

-- Realtime for cheers (ignore "already member" if re-running)
do $$ begin
  alter publication supabase_realtime add table cheers;
exception when duplicate_object then null;
end $$;
