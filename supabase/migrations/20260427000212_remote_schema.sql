drop extension if exists "pg_net";


  create table "public"."consortium_items" (
    "id" uuid not null default gen_random_uuid(),
    "consortium_id" uuid not null,
    "species_id" uuid,
    "custom_species_name" text,
    "quantity" integer not null,
    "notes" text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."consortium_items" enable row level security;


  create table "public"."species_co2_categories" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "slug" text not null,
    "description" text,
    "approximate_height" text,
    "dominant_structure" text,
    "co2_min_kg_year" numeric(12,4) not null default 0,
    "co2_max_kg_year" numeric(12,4) not null default 0,
    "co2_avg_kg_year" numeric(12,4) not null default 0,
    "is_user_selectable" boolean not null default true,
    "sort_order" integer not null default 0,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "water_min_liters_month" numeric(12,2) not null default 0,
    "water_max_liters_month" numeric(12,2) not null default 0,
    "water_avg_liters_month" numeric(12,2) not null default 0
      );


alter table "public"."species_co2_categories" enable row level security;


  create table "public"."water_logs" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "consortium_id" uuid,
    "planting_id" uuid,
    "recorded_at" date not null default CURRENT_DATE,
    "water_liters" numeric(12,2) not null,
    "irrigation_method" text,
    "source_type" text,
    "notes" text,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."water_logs" enable row level security;

alter table "public"."consortia" add column "measurement_mode" text not null default 'legacy_area'::text;

alter table "public"."consortia" add column "total_seedlings" integer not null default 0;

alter table "public"."consortia" alter column "area_hectares" drop default;

alter table "public"."consortia" alter column "area_hectares" drop not null;

alter table "public"."species" add column "co2_category_id" uuid;

alter table "public"."species" add column "co2_factor_kg_per_seedling_year" numeric(12,4);

alter table "public"."species" add column "co2_factor_source" text;

alter table "public"."species" add column "water_reference_liters_per_seedling_month" numeric(12,2);

CREATE UNIQUE INDEX consortium_items_pkey ON public.consortium_items USING btree (id);

CREATE INDEX idx_consortium_items_consortium_id ON public.consortium_items USING btree (consortium_id);

CREATE INDEX idx_consortium_items_species_id ON public.consortium_items USING btree (species_id);

CREATE INDEX idx_species_co2_category_id ON public.species USING btree (co2_category_id);

CREATE INDEX idx_water_logs_consortium_id ON public.water_logs USING btree (consortium_id);

CREATE INDEX idx_water_logs_planting_id ON public.water_logs USING btree (planting_id);

CREATE INDEX idx_water_logs_user_date ON public.water_logs USING btree (user_id, recorded_at DESC);

CREATE UNIQUE INDEX species_co2_categories_name_key ON public.species_co2_categories USING btree (name);

CREATE UNIQUE INDEX species_co2_categories_pkey ON public.species_co2_categories USING btree (id);

CREATE UNIQUE INDEX species_co2_categories_slug_key ON public.species_co2_categories USING btree (slug);

CREATE UNIQUE INDEX water_logs_pkey ON public.water_logs USING btree (id);

alter table "public"."consortium_items" add constraint "consortium_items_pkey" PRIMARY KEY using index "consortium_items_pkey";

alter table "public"."species_co2_categories" add constraint "species_co2_categories_pkey" PRIMARY KEY using index "species_co2_categories_pkey";

alter table "public"."water_logs" add constraint "water_logs_pkey" PRIMARY KEY using index "water_logs_pkey";

alter table "public"."consortia" add constraint "consortia_measurement_mode_check" CHECK ((measurement_mode = ANY (ARRAY['legacy_area'::text, 'seedling_quantity'::text]))) not valid;

alter table "public"."consortia" validate constraint "consortia_measurement_mode_check";

alter table "public"."consortium_items" add constraint "consortium_items_consortium_id_fkey" FOREIGN KEY (consortium_id) REFERENCES public.consortia(id) ON DELETE CASCADE not valid;

alter table "public"."consortium_items" validate constraint "consortium_items_consortium_id_fkey";

alter table "public"."consortium_items" add constraint "consortium_items_quantity_check" CHECK ((quantity > 0)) not valid;

alter table "public"."consortium_items" validate constraint "consortium_items_quantity_check";

alter table "public"."consortium_items" add constraint "consortium_items_species_check" CHECK (((species_id IS NOT NULL) OR (custom_species_name IS NOT NULL))) not valid;

alter table "public"."consortium_items" validate constraint "consortium_items_species_check";

alter table "public"."consortium_items" add constraint "consortium_items_species_id_fkey" FOREIGN KEY (species_id) REFERENCES public.species(id) ON DELETE SET NULL not valid;

alter table "public"."consortium_items" validate constraint "consortium_items_species_id_fkey";

alter table "public"."species" add constraint "species_co2_category_id_fkey" FOREIGN KEY (co2_category_id) REFERENCES public.species_co2_categories(id) ON DELETE SET NULL not valid;

alter table "public"."species" validate constraint "species_co2_category_id_fkey";

alter table "public"."species_co2_categories" add constraint "species_co2_categories_name_key" UNIQUE using index "species_co2_categories_name_key";

alter table "public"."species_co2_categories" add constraint "species_co2_categories_range_check" CHECK ((co2_min_kg_year <= co2_max_kg_year)) not valid;

alter table "public"."species_co2_categories" validate constraint "species_co2_categories_range_check";

alter table "public"."species_co2_categories" add constraint "species_co2_categories_slug_key" UNIQUE using index "species_co2_categories_slug_key";

alter table "public"."water_logs" add constraint "water_logs_consortium_id_fkey" FOREIGN KEY (consortium_id) REFERENCES public.consortia(id) ON DELETE CASCADE not valid;

alter table "public"."water_logs" validate constraint "water_logs_consortium_id_fkey";

alter table "public"."water_logs" add constraint "water_logs_liters_check" CHECK ((water_liters >= (0)::numeric)) not valid;

alter table "public"."water_logs" validate constraint "water_logs_liters_check";

alter table "public"."water_logs" add constraint "water_logs_planting_id_fkey" FOREIGN KEY (planting_id) REFERENCES public.plantings(id) ON DELETE CASCADE not valid;

alter table "public"."water_logs" validate constraint "water_logs_planting_id_fkey";

alter table "public"."water_logs" add constraint "water_logs_target_check" CHECK (((consortium_id IS NOT NULL) OR (planting_id IS NOT NULL))) not valid;

alter table "public"."water_logs" validate constraint "water_logs_target_check";

alter table "public"."water_logs" add constraint "water_logs_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."water_logs" validate constraint "water_logs_user_id_fkey";

set check_function_bodies = off;

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


create or replace view "public"."consortia_water_usage_monthly" as  SELECT consortium_id,
    user_id,
    (date_trunc('month'::text, (recorded_at)::timestamp with time zone))::date AS reference_month,
    sum(water_liters) AS actual_water_liters_month
   FROM public.water_logs wl
  WHERE (consortium_id IS NOT NULL)
  GROUP BY consortium_id, user_id, ((date_trunc('month'::text, (recorded_at)::timestamp with time zone))::date);


CREATE OR REPLACE FUNCTION public.recalculate_consortium_points(_consortium_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  _points integer;
begin
  select coalesce(sum(ci.quantity * coalesce(s.base_points, 10)), 0)
    into _points
  from public.consortium_items ci
  left join public.species s on s.id = ci.species_id
  where ci.consortium_id = _consortium_id;

  update public.consortia
  set points = _points + coalesce(bonus_points, 0)
  where id = _consortium_id;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.recalculate_consortium_total_seedlings(_consortium_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  _total integer;
begin
  select coalesce(sum(quantity), 0)
    into _total
  from public.consortium_items
  where consortium_id = _consortium_id;

  update public.consortia
  set total_seedlings = _total
  where id = _consortium_id;
end;
$function$
;

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


CREATE OR REPLACE FUNCTION public.trg_consortium_items_recalc()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  _consortium_id uuid;
begin
  _consortium_id := coalesce(new.consortium_id, old.consortium_id);

  perform public.recalculate_consortium_total_seedlings(_consortium_id);
  perform public.recalculate_consortium_points(_consortium_id);
  perform public.recalculate_points(
    (select user_id from public.consortia where id = _consortium_id)
  );

  return coalesce(new, old);
end;
$function$
;

create or replace view "public"."user_co2_summary" as  SELECT c.user_id,
    COALESCE(sum(((ci.quantity)::numeric * COALESCE(cat.co2_min_kg_year, (0)::numeric))), (0)::numeric) AS estimated_co2_min_kg_year,
    COALESCE(sum(((ci.quantity)::numeric * COALESCE(cat.co2_max_kg_year, (0)::numeric))), (0)::numeric) AS estimated_co2_max_kg_year,
    COALESCE(sum(((ci.quantity)::numeric * COALESCE(cat.co2_avg_kg_year, (0)::numeric))), (0)::numeric) AS estimated_co2_avg_kg_year
   FROM (((public.consortia c
     LEFT JOIN public.consortium_items ci ON ((ci.consortium_id = c.id)))
     LEFT JOIN public.species s ON ((s.id = ci.species_id)))
     LEFT JOIN public.species_co2_categories cat ON ((cat.id = s.co2_category_id)))
  GROUP BY c.user_id;


CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, city, state)
  VALUES (NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data ->> 'city',
    NEW.raw_user_meta_data ->> 'state');
  RETURN NEW;
END; $function$
;

CREATE OR REPLACE FUNCTION public.is_conversation_participant(_conv uuid, _user uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = _conv AND (c.buyer_id = _user OR c.seller_id = _user));
$function$
;

CREATE OR REPLACE FUNCTION public.is_negotiation_participant(_neg uuid, _user uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (SELECT 1 FROM public.negotiations n WHERE n.id = _neg AND (n.buyer_id = _user OR n.seller_id = _user));
$function$
;

CREATE OR REPLACE FUNCTION public.recalculate_points(_user uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE total INTEGER;
BEGIN
  SELECT COALESCE(SUM(points), 0) INTO total FROM (
    SELECT points FROM public.plantings WHERE user_id = _user AND status = 'verified'
    UNION ALL
    SELECT points FROM public.consortia WHERE user_id = _user AND status = 'verified'
  ) s;
  UPDATE public.profiles SET points = total WHERE user_id = _user;
END; $function$
;

CREATE OR REPLACE FUNCTION public.trg_recalc_points()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  PERFORM public.recalculate_points(COALESCE(NEW.user_id, OLD.user_id));
  RETURN COALESCE(NEW, OLD);
END; $function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $function$
;

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


grant delete on table "public"."consortium_items" to "anon";

grant insert on table "public"."consortium_items" to "anon";

grant references on table "public"."consortium_items" to "anon";

grant select on table "public"."consortium_items" to "anon";

grant trigger on table "public"."consortium_items" to "anon";

grant truncate on table "public"."consortium_items" to "anon";

grant update on table "public"."consortium_items" to "anon";

grant delete on table "public"."consortium_items" to "authenticated";

grant insert on table "public"."consortium_items" to "authenticated";

grant references on table "public"."consortium_items" to "authenticated";

grant select on table "public"."consortium_items" to "authenticated";

grant trigger on table "public"."consortium_items" to "authenticated";

grant truncate on table "public"."consortium_items" to "authenticated";

grant update on table "public"."consortium_items" to "authenticated";

grant delete on table "public"."consortium_items" to "service_role";

grant insert on table "public"."consortium_items" to "service_role";

grant references on table "public"."consortium_items" to "service_role";

grant select on table "public"."consortium_items" to "service_role";

grant trigger on table "public"."consortium_items" to "service_role";

grant truncate on table "public"."consortium_items" to "service_role";

grant update on table "public"."consortium_items" to "service_role";

grant delete on table "public"."species_co2_categories" to "anon";

grant insert on table "public"."species_co2_categories" to "anon";

grant references on table "public"."species_co2_categories" to "anon";

grant select on table "public"."species_co2_categories" to "anon";

grant trigger on table "public"."species_co2_categories" to "anon";

grant truncate on table "public"."species_co2_categories" to "anon";

grant update on table "public"."species_co2_categories" to "anon";

grant delete on table "public"."species_co2_categories" to "authenticated";

grant insert on table "public"."species_co2_categories" to "authenticated";

grant references on table "public"."species_co2_categories" to "authenticated";

grant select on table "public"."species_co2_categories" to "authenticated";

grant trigger on table "public"."species_co2_categories" to "authenticated";

grant truncate on table "public"."species_co2_categories" to "authenticated";

grant update on table "public"."species_co2_categories" to "authenticated";

grant delete on table "public"."species_co2_categories" to "service_role";

grant insert on table "public"."species_co2_categories" to "service_role";

grant references on table "public"."species_co2_categories" to "service_role";

grant select on table "public"."species_co2_categories" to "service_role";

grant trigger on table "public"."species_co2_categories" to "service_role";

grant truncate on table "public"."species_co2_categories" to "service_role";

grant update on table "public"."species_co2_categories" to "service_role";

grant delete on table "public"."water_logs" to "anon";

grant insert on table "public"."water_logs" to "anon";

grant references on table "public"."water_logs" to "anon";

grant select on table "public"."water_logs" to "anon";

grant trigger on table "public"."water_logs" to "anon";

grant truncate on table "public"."water_logs" to "anon";

grant update on table "public"."water_logs" to "anon";

grant delete on table "public"."water_logs" to "authenticated";

grant insert on table "public"."water_logs" to "authenticated";

grant references on table "public"."water_logs" to "authenticated";

grant select on table "public"."water_logs" to "authenticated";

grant trigger on table "public"."water_logs" to "authenticated";

grant truncate on table "public"."water_logs" to "authenticated";

grant update on table "public"."water_logs" to "authenticated";

grant delete on table "public"."water_logs" to "service_role";

grant insert on table "public"."water_logs" to "service_role";

grant references on table "public"."water_logs" to "service_role";

grant select on table "public"."water_logs" to "service_role";

grant trigger on table "public"."water_logs" to "service_role";

grant truncate on table "public"."water_logs" to "service_role";

grant update on table "public"."water_logs" to "service_role";


  create policy "Consortium items delete own consortium"
  on "public"."consortium_items"
  as permissive
  for delete
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.consortia c
  WHERE ((c.id = consortium_items.consortium_id) AND (c.user_id = auth.uid())))));



  create policy "Consortium items insert own consortium"
  on "public"."consortium_items"
  as permissive
  for insert
  to authenticated
with check ((EXISTS ( SELECT 1
   FROM public.consortia c
  WHERE ((c.id = consortium_items.consortium_id) AND (c.user_id = auth.uid())))));



  create policy "Consortium items update own consortium"
  on "public"."consortium_items"
  as permissive
  for update
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.consortia c
  WHERE ((c.id = consortium_items.consortium_id) AND (c.user_id = auth.uid())))));



  create policy "Consortium items view own consortium"
  on "public"."consortium_items"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.consortia c
  WHERE ((c.id = consortium_items.consortium_id) AND (c.user_id = auth.uid())))));



  create policy "Admins manage species CO2 categories delete"
  on "public"."species_co2_categories"
  as permissive
  for delete
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.user_id = auth.uid()) AND (p.role = 'admin'::public.user_role)))));



  create policy "Admins manage species CO2 categories insert"
  on "public"."species_co2_categories"
  as permissive
  for insert
  to authenticated
with check ((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.user_id = auth.uid()) AND (p.role = 'admin'::public.user_role)))));



  create policy "Admins manage species CO2 categories update"
  on "public"."species_co2_categories"
  as permissive
  for update
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.user_id = auth.uid()) AND (p.role = 'admin'::public.user_role)))));



  create policy "Species CO2 categories view all authenticated"
  on "public"."species_co2_categories"
  as permissive
  for select
  to authenticated
using (true);



  create policy "Water logs delete own"
  on "public"."water_logs"
  as permissive
  for delete
  to authenticated
using ((user_id = auth.uid()));



  create policy "Water logs insert own"
  on "public"."water_logs"
  as permissive
  for insert
  to authenticated
with check ((user_id = auth.uid()));



  create policy "Water logs update own"
  on "public"."water_logs"
  as permissive
  for update
  to authenticated
using ((user_id = auth.uid()));



  create policy "Water logs view own"
  on "public"."water_logs"
  as permissive
  for select
  to authenticated
using ((user_id = auth.uid()));


CREATE TRIGGER trg_consortium_items_recalc AFTER INSERT OR DELETE OR UPDATE ON public.consortium_items FOR EACH ROW EXECUTE FUNCTION public.trg_consortium_items_recalc();

CREATE TRIGGER trg_consortium_items_updated BEFORE UPDATE ON public.consortium_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_species_co2_categories_updated BEFORE UPDATE ON public.species_co2_categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


