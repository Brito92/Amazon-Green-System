alter table public.plantings
  add column if not exists location_label text,
  add column if not exists latitude numeric(10, 7),
  add column if not exists longitude numeric(10, 7);

alter table public.consortia
  add column if not exists location_label text,
  add column if not exists latitude numeric(10, 7),
  add column if not exists longitude numeric(10, 7);

create or replace view public.environment_location_points as
select
  p.id as target_id,
  p.user_id,
  'muda'::text as target_type,
  coalesce(s.common_name, p.custom_species_name, 'Muda') as title,
  p.location_label,
  p.latitude,
  p.longitude,
  p.planted_at as happened_at,
  p.status::text as status,
  p.created_at
from public.plantings p
left join public.species s on s.id = p.species_id
where p.latitude is not null
  and p.longitude is not null

union all

select
  c.id as target_id,
  c.user_id,
  'consorcio'::text as target_type,
  c.name as title,
  c.location_label,
  c.latitude,
  c.longitude,
  c.created_at as happened_at,
  c.status::text as status,
  c.created_at
from public.consortia c
where c.latitude is not null
  and c.longitude is not null;

revoke all on table public.environment_location_points from anon;
grant select on table public.environment_location_points to authenticated;
