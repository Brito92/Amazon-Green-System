create or replace view public.producer_public_summary as
with latest_environment as (
  select distinct on (user_id)
    user_id,
    reference_month,
    estimated_co2_avg_kg_year,
    estimated_water_savings_liters_month,
    actual_water_liters_month
  from public.user_environment_dashboard
  where user_id is not null
  order by user_id, reference_month desc nulls last
),
verified_consortia as (
  select
    user_id,
    count(*)::int as consortia_count,
    coalesce(sum(total_seedlings), 0)::int as total_seedlings
  from public.consortia
  where status = 'verified'
  group by user_id
),
verified_plantings as (
  select
    user_id,
    count(*)::int as verified_plantings_count
  from public.plantings
  where status = 'verified'
  group by user_id
)
select
  p.user_id,
  p.display_name,
  p.full_name,
  p.avatar_url,
  p.city,
  p.state,
  p.points,
  coalesce(vc.consortia_count, 0) as consortia_count,
  coalesce(vc.total_seedlings, 0) as total_seedlings,
  coalesce(vp.verified_plantings_count, 0) as verified_plantings_count,
  le.reference_month,
  coalesce(le.estimated_co2_avg_kg_year, 0) as estimated_co2_avg_kg_year,
  coalesce(le.estimated_water_savings_liters_month, 0) as estimated_water_savings_liters_month,
  coalesce(le.actual_water_liters_month, 0) as actual_water_liters_month,
  coalesce(ccs.total_credits, 0) as total_credits,
  coalesce(ccs.listed_credits, 0) as listed_credits,
  coalesce(ccs.sold_credits, 0) as sold_credits,
  coalesce(ccs.total_tco2, 0) as total_tco2,
  coalesce(ccs.revenue_brl, 0) as revenue_brl
from public.profiles p
left join verified_consortia vc on vc.user_id = p.user_id
left join verified_plantings vp on vp.user_id = p.user_id
left join latest_environment le on le.user_id = p.user_id
left join public.user_carbon_credit_summary ccs on ccs.user_id = p.user_id
where p.role = 'user'
  and (
    coalesce(vc.consortia_count, 0) > 0
    or coalesce(vp.verified_plantings_count, 0) > 0
  );

create or replace view public.producer_public_consortia as
select
  c.id as consortium_id,
  c.user_id,
  c.name,
  c.description,
  c.photo_url,
  c.total_seedlings,
  c.created_at,
  c.verification_method,
  coalesce(env.estimated_co2_avg_kg_year, 0) as estimated_co2_avg_kg_year,
  coalesce(env.estimated_water_avg_liters_month, 0) as estimated_water_avg_liters_month
from public.consortia c
left join public.consortia_environment_dashboard env
  on env.consortium_id = c.id
where c.status = 'verified';

revoke all on table public.producer_public_summary from anon;
revoke all on table public.producer_public_consortia from anon;
grant select on table public.producer_public_summary to authenticated;
grant select on table public.producer_public_consortia to authenticated;
