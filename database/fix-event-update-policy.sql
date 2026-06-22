-- Run this once in the Supabase SQL editor for an existing database.
-- The app currently uses the anon role because authentication is not wired in yet.
drop policy if exists anon_update_dev on public.events;

create policy anon_update_dev on public.events
  for update
  to anon
  using (true)
  with check (true);
