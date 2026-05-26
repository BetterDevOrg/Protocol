-- Add phone for residency verification (run if 001_members already applied)
alter table public.members
  add column if not exists phone_e164 text;

create index if not exists members_phone_e164_idx on public.members (phone_e164);
