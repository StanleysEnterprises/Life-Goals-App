-- Update #3 — run once in Supabase → SQL Editor. Safe to run more than once.
alter table goals add column if not exists time_of_day text
  check (time_of_day in ('morning', 'afternoon', 'evening', 'anytime'));
