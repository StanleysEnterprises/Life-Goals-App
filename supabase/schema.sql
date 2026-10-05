-- Run this once in Supabase → SQL Editor → New query.

create table if not exists goals (
  id uuid primary key,
  title text not null,
  owner text not null check (owner in ('tegan', 'will', 'both')),
  category text not null default 'personal' check (category in ('personal', 'shared', 'wellness', 'ventures')),
  type text not null check (type in ('daily', 'weekly', 'milestone')),
  target int,                 -- weekly: times per week
  due_date date,              -- milestone: optional target date
  archived boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists completions (
  id uuid primary key,
  goal_id uuid not null references goals (id) on delete cascade,
  person text not null check (person in ('tegan', 'will')),
  day date not null,
  created_at timestamptz not null default now()
);
create index if not exists completions_lookup on completions (goal_id, person, day);

create table if not exists notes (
  id uuid primary key,
  person text not null check (person in ('tegan', 'will')),
  kind text not null default 'note' check (kind in ('note', 'intention')),
  body text not null,
  day date not null,
  created_at timestamptz not null default now()
);

-- Simple open access for a private two-person app.
-- Anyone with the site URL + anon key can read/write; add Supabase Auth later to lock it down.
alter table goals enable row level security;
alter table completions enable row level security;
alter table notes enable row level security;

create policy "app access" on goals for all using (true) with check (true);
create policy "app access" on completions for all using (true) with check (true);
create policy "app access" on notes for all using (true) with check (true);

-- Realtime: changes on one phone appear instantly on the other
alter publication supabase_realtime add table goals, completions, notes;
