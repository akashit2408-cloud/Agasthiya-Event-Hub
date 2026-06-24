-- Run once in the Supabase SQL editor for an existing installation.
alter table setups
  add column if not exists category text not null default 'Setup';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'setups_category_check'
  ) then
    alter table setups
      add constraint setups_category_check check (category in ('Setup', 'Equipment'));
  end if;
end $$;

update setups
set category = 'Equipment'
where name in (
  'Cold Pyro',
  'LED Dance Floor',
  'Low Fog Entry',
  '360 Degree Selfie Booth',
  'Balloon Blast',
  '3rd Dance Floor'
);
