create table if not exists public.blockchain_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  target_type text not null,
  target_id uuid not null,
  event_type text not null,
  request_payload jsonb not null,
  api_response jsonb,
  external_transaction_id text,
  external_hash text,
  external_status text,
  block_index integer,
  block_hash text,
  merkle_root text,
  nonce integer,
  mined_at timestamptz,
  is_audited boolean not null default false,
  audit_status text,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint blockchain_records_target_type_check
    check (target_type in ('planting', 'consortium', 'carbon_credit')),
  constraint blockchain_records_event_type_check
    check (event_type in ('muda_validada', 'consorcio_validado', 'credito_emitido'))
);

create table if not exists public.blockchain_blocks (
  id uuid primary key default gen_random_uuid(),
  block_index integer not null,
  block_hash text not null,
  previous_hash text,
  merkle_root text,
  nonce integer,
  difficulty integer,
  total_transactions integer,
  external_status text,
  mined_at timestamptz,
  raw_response jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.blockchain_audits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  audit_status text not null,
  raw_response jsonb,
  validated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_blockchain_records_user_id
  on public.blockchain_records(user_id);

create index if not exists idx_blockchain_records_target
  on public.blockchain_records(target_type, target_id);

create index if not exists idx_blockchain_records_event_type
  on public.blockchain_records(event_type);

create index if not exists idx_blockchain_records_external_hash
  on public.blockchain_records(external_hash);

create index if not exists idx_blockchain_records_created_at
  on public.blockchain_records(created_at desc);

create unique index if not exists idx_blockchain_records_unique_target_event
  on public.blockchain_records(target_type, target_id, event_type);

create unique index if not exists idx_blockchain_blocks_block_index
  on public.blockchain_blocks(block_index);

create unique index if not exists idx_blockchain_blocks_block_hash
  on public.blockchain_blocks(block_hash);

drop trigger if exists trg_blockchain_records_updated on public.blockchain_records;
create trigger trg_blockchain_records_updated
before update on public.blockchain_records
for each row execute function public.update_updated_at_column();

alter table public.blockchain_records enable row level security;
alter table public.blockchain_blocks enable row level security;
alter table public.blockchain_audits enable row level security;

drop policy if exists "Users view own blockchain records" on public.blockchain_records;
create policy "Users view own blockchain records"
on public.blockchain_records
for select
to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1
    from public.profiles p
    where p.user_id = auth.uid()
      and p.role in ('admin', 'moderator')
  )
);

drop policy if exists "Users insert own blockchain records" on public.blockchain_records;
create policy "Users insert own blockchain records"
on public.blockchain_records
for insert
to authenticated
with check (
  user_id = auth.uid()
  or exists (
    select 1
    from public.profiles p
    where p.user_id = auth.uid()
      and p.role in ('admin', 'moderator')
  )
);

drop policy if exists "Users update own blockchain records" on public.blockchain_records;
create policy "Users update own blockchain records"
on public.blockchain_records
for update
to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1
    from public.profiles p
    where p.user_id = auth.uid()
      and p.role in ('admin', 'moderator')
  )
)
with check (
  user_id = auth.uid()
  or exists (
    select 1
    from public.profiles p
    where p.user_id = auth.uid()
      and p.role in ('admin', 'moderator')
  )
);

drop policy if exists "Authenticated users view blockchain blocks" on public.blockchain_blocks;
create policy "Authenticated users view blockchain blocks"
on public.blockchain_blocks
for select
to authenticated
using (true);

drop policy if exists "Admins and moderators insert blockchain blocks" on public.blockchain_blocks;
create policy "Admins and moderators insert blockchain blocks"
on public.blockchain_blocks
for insert
to authenticated
with check (
  exists (
    select 1
    from public.profiles p
    where p.user_id = auth.uid()
      and p.role in ('admin', 'moderator')
  )
);

drop policy if exists "Authenticated users view blockchain audits" on public.blockchain_audits;
create policy "Authenticated users view blockchain audits"
on public.blockchain_audits
for select
to authenticated
using (true);

drop policy if exists "Admins and moderators insert blockchain audits" on public.blockchain_audits;
create policy "Admins and moderators insert blockchain audits"
on public.blockchain_audits
for insert
to authenticated
with check (
  user_id = auth.uid()
  or exists (
    select 1
    from public.profiles p
    where p.user_id = auth.uid()
      and p.role in ('admin', 'moderator')
  )
);

create or replace view public.user_blockchain_summary as
select
  user_id,
  count(*)::int as total_eventos,
  count(*) filter (where external_status = 'pendente')::int as pendentes,
  count(*) filter (where mined_at is not null)::int as minerados,
  count(*) filter (where is_audited = true and audit_status = 'valido')::int as auditados_validos
from public.blockchain_records
group by user_id;

create or replace view public.blockchain_records_display as
select
  id,
  user_id,
  target_type,
  target_id,
  event_type,
  external_transaction_id,
  external_hash,
  external_status,
  block_index,
  block_hash,
  merkle_root,
  nonce,
  mined_at,
  is_audited,
  audit_status,
  error_message,
  created_at,
  updated_at
from public.blockchain_records;

revoke all on table public.user_blockchain_summary from anon;
revoke all on table public.blockchain_records_display from anon;
grant select on table public.user_blockchain_summary to authenticated;
grant select on table public.blockchain_records_display to authenticated;
