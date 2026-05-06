create table if not exists public.carbon_credit_credits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  consortium_id uuid not null references public.consortia(id) on delete cascade,
  estimated_co2_kg_year numeric(12,2) not null default 0,
  credit_amount_tco2 numeric(12,4) not null default 0,
  price_brl numeric(12,2),
  status text not null default 'issued',
  token_code text not null unique,
  blockchain_reference text not null,
  buyer_user_id uuid references auth.users(id) on delete set null,
  notes text,
  issued_at timestamptz not null default now(),
  listed_at timestamptz,
  sold_at timestamptz,
  retired_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint carbon_credit_credits_status_check
    check (status in ('issued', 'listed', 'sold', 'retired', 'cancelled')),
  constraint carbon_credit_credits_non_negative_check
    check (estimated_co2_kg_year >= 0 and credit_amount_tco2 >= 0),
  constraint carbon_credit_credits_price_check
    check (price_brl is null or price_brl >= 0)
);

create unique index if not exists carbon_credit_credits_one_per_consortium
  on public.carbon_credit_credits(consortium_id);

create index if not exists idx_carbon_credit_credits_user_id
  on public.carbon_credit_credits(user_id);

create index if not exists idx_carbon_credit_credits_status
  on public.carbon_credit_credits(status);

create index if not exists idx_carbon_credit_credits_buyer_user_id
  on public.carbon_credit_credits(buyer_user_id);

create table if not exists public.carbon_credit_transactions (
  id uuid primary key default gen_random_uuid(),
  credit_id uuid not null references public.carbon_credit_credits(id) on delete cascade,
  seller_user_id uuid not null references auth.users(id) on delete cascade,
  buyer_user_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  amount_tco2 numeric(12,4) not null default 0,
  price_brl numeric(12,2),
  notes text,
  created_at timestamptz not null default now(),
  constraint carbon_credit_transactions_event_check
    check (event_type in ('issued', 'listed', 'sold', 'retired', 'cancelled')),
  constraint carbon_credit_transactions_amount_check
    check (amount_tco2 >= 0),
  constraint carbon_credit_transactions_price_check
    check (price_brl is null or price_brl >= 0)
);

create index if not exists idx_carbon_credit_transactions_credit_id
  on public.carbon_credit_transactions(credit_id);

create index if not exists idx_carbon_credit_transactions_seller_user_id
  on public.carbon_credit_transactions(seller_user_id);

create index if not exists idx_carbon_credit_transactions_buyer_user_id
  on public.carbon_credit_transactions(buyer_user_id);

drop trigger if exists trg_carbon_credit_credits_updated on public.carbon_credit_credits;
create trigger trg_carbon_credit_credits_updated
before update on public.carbon_credit_credits
for each row execute function public.update_updated_at_column();

alter table public.carbon_credit_credits enable row level security;
alter table public.carbon_credit_transactions enable row level security;

drop policy if exists "Owners manage own carbon credits" on public.carbon_credit_credits;
create policy "Owners manage own carbon credits"
on public.carbon_credit_credits
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users read visible carbon credits" on public.carbon_credit_credits;
create policy "Users read visible carbon credits"
on public.carbon_credit_credits
for select
to authenticated
using (
  auth.uid() = user_id
  or auth.uid() = buyer_user_id
  or status = 'listed'
  or exists (
    select 1
    from public.profiles p
    where p.user_id = auth.uid()
      and p.role in ('admin', 'moderator')
  )
);

drop policy if exists "Users buy listed carbon credits" on public.carbon_credit_credits;
create policy "Users buy listed carbon credits"
on public.carbon_credit_credits
for update
to authenticated
using (
  status = 'listed'
  and user_id <> auth.uid()
  and buyer_user_id is null
)
with check (
  buyer_user_id = auth.uid()
  and status = 'sold'
);

drop policy if exists "Users read own carbon transactions" on public.carbon_credit_transactions;
create policy "Users read own carbon transactions"
on public.carbon_credit_transactions
for select
to authenticated
using (
  seller_user_id = auth.uid()
  or buyer_user_id = auth.uid()
  or exists (
    select 1
    from public.profiles p
    where p.user_id = auth.uid()
      and p.role in ('admin', 'moderator')
  )
);

drop policy if exists "Users insert own carbon transactions" on public.carbon_credit_transactions;
create policy "Users insert own carbon transactions"
on public.carbon_credit_transactions
for insert
to authenticated
with check (
  seller_user_id = auth.uid()
  or buyer_user_id = auth.uid()
);

create or replace view public.user_carbon_credit_summary as
select
  user_id,
  count(*)::bigint as total_credits,
  count(*) filter (where status = 'listed')::bigint as listed_credits,
  count(*) filter (where status = 'sold')::bigint as sold_credits,
  count(*) filter (where status = 'retired')::bigint as retired_credits,
  coalesce(sum(credit_amount_tco2), 0)::numeric as total_tco2,
  coalesce(sum(case when status = 'listed' then credit_amount_tco2 else 0 end), 0)::numeric as listed_tco2,
  coalesce(sum(case when status = 'sold' then credit_amount_tco2 else 0 end), 0)::numeric as sold_tco2,
  coalesce(sum(case when status = 'sold' then coalesce(price_brl, 0) else 0 end), 0)::numeric as revenue_brl
from public.carbon_credit_credits
group by user_id;
