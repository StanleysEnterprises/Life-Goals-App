-- Update #4 (already applied). Which days a habit is on: 0 = Sunday … 6 = Saturday. NULL = every day.
alter table goals add column if not exists days smallint[];
