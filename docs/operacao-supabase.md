# Operacao do Supabase

## Vinculo do Projeto

O projeto pode ser ligado ao Supabase CLI via:

```powershell
npx supabase link --project-ref SEU_PROJECT_REF
```

## Regeneracao de Tipos

Sempre que o schema mudar:

```powershell
npx supabase gen types typescript --linked | Out-File -Encoding utf8 .\src\integrations\supabase\types.ts
```

## Migrations

As migrations locais ficam em:

[C:\Users\brito\OneDrive\Documentos\terra-viva-link-main\terra-viva-link-main\supabase\migrations](C:\Users\brito\OneDrive\Documentos\terra-viva-link-main\terra-viva-link-main\supabase\migrations)

## Fluxo Sem Docker

Quando `db pull` nao puder ser usado:

1. criar arquivo `.sql` manual em `supabase/migrations`
2. colar as queries aplicadas no Supabase
3. regenerar `types.ts`

## Fluxo Com Docker

Quando o Docker estiver disponivel:

```powershell
npx supabase db pull
```

Isso gera um snapshot local do delta remoto.

## Roles

O sistema usa:

- `user`
- `moderator`
- `admin`

Hoje a promocao de usuarios pode ser feita diretamente na tabela `profiles`.

## RLS Importante

Ha regras de acesso criticas para:

- especies customizadas
- registros de agua
- consorcios e seus itens
- moderacao

## Cuidados

- Alterar o banco sem registrar a migration local aumenta o risco de divergencia
- Alterar views pode impactar o frontend imediatamente
- Policies antigas de `SELECT` podem anular restricoes novas se permanecerem ativas
