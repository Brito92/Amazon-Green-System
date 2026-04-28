drop view if exists "public"."consortia_environment_dashboard";

drop view if exists "public"."consortia_environment_summary";

drop view if exists "public"."species_with_co2";

drop view if exists "public"."user_environment_dashboard";

drop view if exists "public"."user_water_balance";

drop view if exists "public"."consortia_co2_summary";

drop view if exists "public"."consortia_water_balance";

drop view if exists "public"."consortia_water_reference_summary";

drop view if exists "public"."user_co2_summary";

create or replace view "public"."consortia_co2_summary" as  SELECT c.id AS consortium_id,
    c.user_id,
    c.name,
    c.status,
    c.total_seedlings,
    COALESCE(sum(((ci.quantity)::numeric * COALESCE(cat.co2_min_kg_year, (0)::numeric))), (0)::numeric) AS estimated_co2_min_kg_year,
    COALESCE(sum(((ci.quantity)::numeric * COALESCE(cat.co2_max_kg_year, (0)::numeric))), (0)::numeric) AS estimated_co2_max_kg_year,
    COALESCE(sum(((ci.quantity)::numeric * COALESCE(cat.co2_avg_kg_year, (0)::numeric))), (0)::numeric) AS estimated_co2_avg_kg_year
   FROM (((public.consortia c
     LEFT JOIN public.consortium_items ci ON ((ci.consortium_id = c.id)))
     LEFT JOIN public.species s ON ((s.id = ci.species_id)))
     LEFT JOIN public.species_co2_categories cat ON ((cat.id = s.co2_category_id)))
  GROUP BY c.id, c.user_id, c.name, c.status, c.total_seedlings;


create or replace view "public"."consortia_environment_summary" as  SELECT c.id AS consortium_id,
    c.user_id,
    c.name,
    c.total_seedlings,
    COALESCE(sum(((ci.quantity)::numeric * COALESCE(s.co2_factor_kg_per_seedling_year, (0)::numeric))), (0)::numeric) AS estimated_co2_kg_year
   FROM ((public.consortia c
     LEFT JOIN public.consortium_items ci ON ((ci.consortium_id = c.id)))
     LEFT JOIN public.species s ON ((s.id = ci.species_id)))
  GROUP BY c.id, c.user_id, c.name, c.total_seedlings;


create or replace view "public"."consortia_water_reference_summary" as  SELECT c.id AS consortium_id,
    c.user_id,
    c.name,
    c.total_seedlings,
    COALESCE(sum(((ci.quantity)::numeric * COALESCE(cat.water_min_liters_month, (0)::numeric))), (0)::numeric) AS estimated_water_min_liters_month,
    COALESCE(sum(((ci.quantity)::numeric * COALESCE(cat.water_max_liters_month, (0)::numeric))), (0)::numeric) AS estimated_water_max_liters_month,
    COALESCE(sum(((ci.quantity)::numeric * COALESCE(cat.water_avg_liters_month, (0)::numeric))), (0)::numeric) AS estimated_water_avg_liters_month
   FROM (((public.consortia c
     LEFT JOIN public.consortium_items ci ON ((ci.consortium_id = c.id)))
     LEFT JOIN public.species s ON ((s.id = ci.species_id)))
     LEFT JOIN public.species_co2_categories cat ON ((cat.id = s.co2_category_id)))
  GROUP BY c.id, c.user_id, c.name, c.total_seedlings;


create or replace view "public"."species_with_co2" as  SELECT s.id,
    s.common_name,
    s.scientific_name,
    s.created_by,
    s.created_at,
    s.updated_at,
    s.slug,
    s.base_points,
    s.is_custom,
    s.co2_category_id,
    c.name AS co2_category_name,
    c.slug AS co2_category_slug,
    c.description AS co2_category_description,
    c.approximate_height AS co2_category_height,
    c.dominant_structure AS co2_category_structure,
    c.co2_min_kg_year,
    c.co2_max_kg_year,
    c.co2_avg_kg_year
   FROM (public.species s
     LEFT JOIN public.species_co2_categories c ON ((c.id = s.co2_category_id)));


create or replace view "public"."user_co2_summary" as  SELECT c.user_id,
    COALESCE(sum(((ci.quantity)::numeric * COALESCE(cat.co2_min_kg_year, (0)::numeric))), (0)::numeric) AS estimated_co2_min_kg_year,
    COALESCE(sum(((ci.quantity)::numeric * COALESCE(cat.co2_max_kg_year, (0)::numeric))), (0)::numeric) AS estimated_co2_max_kg_year,
    COALESCE(sum(((ci.quantity)::numeric * COALESCE(cat.co2_avg_kg_year, (0)::numeric))), (0)::numeric) AS estimated_co2_avg_kg_year
   FROM (((public.consortia c
     LEFT JOIN public.consortium_items ci ON ((ci.consortium_id = c.id)))
     LEFT JOIN public.species s ON ((s.id = ci.species_id)))
     LEFT JOIN public.species_co2_categories cat ON ((cat.id = s.co2_category_id)))
  GROUP BY c.user_id;


create or replace view "public"."consortia_environment_dashboard" as  SELECT c.id AS consortium_id,
    c.user_id,
    c.name,
    c.status,
    c.total_seedlings,
    COALESCE(co2.estimated_co2_min_kg_year, (0)::numeric) AS estimated_co2_min_kg_year,
    COALESCE(co2.estimated_co2_max_kg_year, (0)::numeric) AS estimated_co2_max_kg_year,
    COALESCE(co2.estimated_co2_avg_kg_year, (0)::numeric) AS estimated_co2_avg_kg_year,
    COALESCE(w.estimated_water_min_liters_month, (0)::numeric) AS estimated_water_min_liters_month,
    COALESCE(w.estimated_water_max_liters_month, (0)::numeric) AS estimated_water_max_liters_month,
    COALESCE(w.estimated_water_avg_liters_month, (0)::numeric) AS estimated_water_avg_liters_month
   FROM ((public.consortia c
     LEFT JOIN public.consortia_co2_summary co2 ON ((co2.consortium_id = c.id)))
     LEFT JOIN public.consortia_water_reference_summary w ON ((w.consortium_id = c.id)));


create or replace view "public"."consortia_water_balance" as  SELECT r.consortium_id,
    r.user_id,
    r.name,
    r.total_seedlings,
    r.estimated_water_min_liters_month,
    r.estimated_water_max_liters_month,
    r.estimated_water_avg_liters_month,
    COALESCE(u.reference_month, (date_trunc('month'::text, now()))::date) AS reference_month,
    COALESCE(u.actual_water_liters_month, (0)::numeric) AS actual_water_liters_month,
    GREATEST((r.estimated_water_avg_liters_month - COALESCE(u.actual_water_liters_month, (0)::numeric)), (0)::numeric) AS estimated_water_savings_liters_month,
    GREATEST((COALESCE(u.actual_water_liters_month, (0)::numeric) - r.estimated_water_avg_liters_month), (0)::numeric) AS estimated_water_excess_liters_month
   FROM (public.consortia_water_reference_summary r
     LEFT JOIN public.consortia_water_usage_monthly u ON ((u.consortium_id = r.consortium_id)));


create or replace view "public"."user_water_balance" as  SELECT user_id,
    reference_month,
    sum(estimated_water_min_liters_month) AS estimated_water_min_liters_month,
    sum(estimated_water_max_liters_month) AS estimated_water_max_liters_month,
    sum(estimated_water_avg_liters_month) AS estimated_water_avg_liters_month,
    sum(actual_water_liters_month) AS actual_water_liters_month,
    sum(estimated_water_savings_liters_month) AS estimated_water_savings_liters_month,
    sum(estimated_water_excess_liters_month) AS estimated_water_excess_liters_month
   FROM public.consortia_water_balance b
  GROUP BY user_id, reference_month;


create or replace view "public"."user_environment_dashboard" as  SELECT COALESCE(co2.user_id, water.user_id) AS user_id,
    COALESCE(co2.estimated_co2_min_kg_year, (0)::numeric) AS estimated_co2_min_kg_year,
    COALESCE(co2.estimated_co2_max_kg_year, (0)::numeric) AS estimated_co2_max_kg_year,
    COALESCE(co2.estimated_co2_avg_kg_year, (0)::numeric) AS estimated_co2_avg_kg_year,
    water.reference_month,
    COALESCE(water.estimated_water_min_liters_month, (0)::numeric) AS estimated_water_min_liters_month,
    COALESCE(water.estimated_water_max_liters_month, (0)::numeric) AS estimated_water_max_liters_month,
    COALESCE(water.estimated_water_avg_liters_month, (0)::numeric) AS estimated_water_avg_liters_month,
    COALESCE(water.actual_water_liters_month, (0)::numeric) AS actual_water_liters_month,
    COALESCE(water.estimated_water_savings_liters_month, (0)::numeric) AS estimated_water_savings_liters_month,
    COALESCE(water.estimated_water_excess_liters_month, (0)::numeric) AS estimated_water_excess_liters_month
   FROM (public.user_co2_summary co2
     FULL JOIN public.user_water_balance water ON ((water.user_id = co2.user_id)));



