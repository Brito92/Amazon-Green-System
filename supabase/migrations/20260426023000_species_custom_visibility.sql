-- Privacidade de especies customizadas:
-- - especies padrao (is_custom = false) ficam visiveis para autenticados
-- - especies customizadas (is_custom = true) ficam visiveis apenas para quem criou
-- - moderadores e admins podem ver todas para fins de validacao

-- A restricao antiga tornava o nome comum unico globalmente, o que impede
-- que usuarios diferentes cadastrem a mesma especie personalizada.
drop index if exists public.species_common_name_unique;

create unique index if not exists species_common_name_shared_unique
  on public.species (lower(common_name))
  where is_custom = false;

create unique index if not exists species_common_name_custom_owner_unique
  on public.species (created_by, lower(common_name))
  where is_custom = true and created_by is not null;

drop policy if exists "Species viewable by authenticated" on public.species;
create policy "Species selective visibility"
  on public.species
  for select
  to authenticated
  using (
    is_custom = false
    or created_by = auth.uid()
    or exists (
      select 1
      from public.profiles p
      where p.user_id = auth.uid()
        and p.role in ('moderator', 'admin')
    )
  );

drop policy if exists "Authenticated add species" on public.species;
create policy "Authenticated add species"
  on public.species
  for insert
  to authenticated
  with check (auth.uid() = created_by);

drop policy if exists "Owners or moderators update species" on public.species;
create policy "Owners or moderators update species"
  on public.species
  for update
  to authenticated
  using (
    created_by = auth.uid()
    or exists (
      select 1
      from public.profiles p
      where p.user_id = auth.uid()
        and p.role in ('moderator', 'admin')
    )
  )
  with check (
    created_by = auth.uid()
    or exists (
      select 1
      from public.profiles p
      where p.user_id = auth.uid()
        and p.role in ('moderator', 'admin')
    )
  );

drop policy if exists "Owners or moderators delete species" on public.species;
create policy "Owners or moderators delete species"
  on public.species
  for delete
  to authenticated
  using (
    created_by = auth.uid()
    or exists (
      select 1
      from public.profiles p
      where p.user_id = auth.uid()
        and p.role in ('moderator', 'admin')
    )
  );
