-- Common Supabase/Postgres queries for the current app screens.
-- Replace parameters like :event_id when running from your API layer or SQL client.

-- Dashboard cards.
select * from dashboard_summary;

-- Dashboard upcoming events.
select *
from event_list
where event_date >= current_date
  and status <> 'Cancelled'
order by event_date asc, event_time asc
limit 5;

-- Events page: all/upcoming/today/completed.
select *
from event_list
where (:status_filter is null or status = :status_filter::event_status)
  and (:search is null or title ilike '%' || :search || '%' or customer_name ilike '%' || :search || '%')
order by event_date asc, event_time asc;

select *
from event_list
where event_date = current_date
order by event_time asc;

select *
from event_list
where event_date > current_date
  and status <> 'Cancelled'
order by event_date asc, event_time asc;

select *
from event_list
where status = 'Completed'
order by event_date desc, event_time desc;

-- Event detail.
select *
from event_list
where id = :event_id;

select s.*
from event_staff es
join staff s on s.id = es.staff_id
where es.event_id = :event_id
order by s.name;

select r.*
from event_rentals er
join rentals r on r.id = er.rental_id
where er.event_id = :event_id
order by r.name;

-- Create customer and event.
insert into customers (name, mobile, email, address)
values (:customer_name, :mobile, :email, :address)
on conflict (mobile)
do update set
  name = excluded.name,
  email = coalesce(excluded.email, customers.email),
  address = coalesce(excluded.address, customers.address),
  updated_at = now()
returning id;

insert into events (
  customer_id,
  title,
  event_type,
  location,
  map_link,
  event_date,
  event_time,
  vehicle_id,
  status,
  total_amount,
  notes
) values (
  :customer_id,
  :title,
  :event_type,
  :location,
  :map_link,
  :event_date,
  :event_time,
  :vehicle_id,
  'Planned',
  :total_amount,
  :notes
)
returning *;

insert into event_staff (event_id, staff_id, assigned_role)
select :event_id, unnest(:staff_ids::uuid[]), null
on conflict do nothing;

-- Resource availability for a date.
select *
from staff
where status = 'Available'
  and id not in (
    select es.staff_id
    from event_staff es
    join events e on e.id = es.event_id
    where e.event_date = :event_date
      and e.status not in ('Cancelled', 'Completed')
  )
order by role, name;

select *
from setups
where status = 'Available'
order by name;

select *
from vehicles
where status = 'Available'
  and id not in (
    select vehicle_id
    from events
    where event_date = :event_date
      and vehicle_id is not null
      and status not in ('Cancelled', 'Completed')
  )
order by name;

-- Rentals page.
select *
from rentals
where (:status_filter is null or status = :status_filter::resource_status)
  and (:search is null or name ilike '%' || :search || '%' or category ilike '%' || :search || '%')
order by category, name;

insert into rentals (name, category, status, condition, due_date, notes)
values (:name, :category, 'Available', :condition::rental_condition, :due_date, :notes)
returning *;

-- Staff and setup pages.
select *
from staff
where (:status_filter is null or status = :status_filter::staff_status)
order by role, name;

select *
from setups
where (:status_filter is null or status = :status_filter::resource_status)
order by name;

-- Payments and revenue.
select
  e.id as event_id,
  e.title,
  c.name as customer_name,
  e.total_amount,
  coalesce(sum(p.amount), 0) as paid_amount,
  e.total_amount - coalesce(sum(p.amount), 0) as balance_amount
from events e
left join customers c on c.id = e.customer_id
left join payments p on p.event_id = e.id and p.status = 'Paid'
group by e.id, c.name
order by e.event_date desc;

insert into payments (event_id, customer_id, amount, method, status, reference_number, notes)
select id, customer_id, :amount, :method, 'Paid', :reference_number, :notes
from events
where id = :event_id
returning *;

-- Monthly report.
select
  date_trunc('month', e.event_date)::date as month,
  count(*) as event_count,
  sum(e.total_amount) as booked_revenue,
  coalesce(sum(p.amount), 0) as collected_revenue
from events e
left join payments p on p.event_id = e.id and p.status = 'Paid'
where e.status <> 'Cancelled'
group by 1
order by 1 desc;
