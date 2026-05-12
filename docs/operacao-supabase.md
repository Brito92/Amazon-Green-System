# Operação do Supabase

## Vínculo do projeto

O projeto pode ser ligado ao Supabase CLI via:

```powershell
npx supabase link --project-ref SEU_PROJECT_REF
```

## Regeneração de tipos

Sempre que o schema mudar:

```powershell
npx supabase gen types typescript --linked | Out-File -Encoding utf8 .\src\integrations\supabase\types.ts
```

## Migrations

As migrations locais ficam em `supabase/migrations`.

## Fluxo sem Docker

Quando `db pull` não puder ser usado:

1. criar arquivo `.sql` manual em `supabase/migrations`
2. colar as queries aplicadas no Supabase
3. regenerar `types.ts`

## Fluxo com Docker

Quando o Docker estiver disponível:

```powershell
npx supabase db push
```

Use `db pull` com cuidado. Se o histórico local e remoto estiver divergente, o comando pode falhar ou gerar snapshots extras.

## Edge Functions

O projeto usa Edge Functions para blockchain:

- `blockchain-register-event`
- `blockchain-mine`
- `blockchain-validate`

Deploy:

```powershell
npx supabase functions deploy blockchain-register-event
npx supabase functions deploy blockchain-mine
npx supabase functions deploy blockchain-validate
```

## Secrets

Para a integração blockchain:

```powershell
npx supabase secrets set BLOCKCHAIN_API_BASE_URL=https://ew.app.br/blockchain/api
npx supabase secrets set BLOCKCHAIN_API_TOKEN=SEU_TOKEN
```

## Roles

O sistema usa:

- `user`
- `moderator`
- `admin`

Hoje a promoção de usuários pode ser feita diretamente na tabela `profiles`.

## RLS importante

Há regras de acesso críticas para:

- espécies customizadas
- registros de água
- consórcios e seus itens
- créditos simulados
- blockchain
- moderação

## Cuidados

- Alterar o banco sem registrar a migration local aumenta o risco de divergência
- Alterar views pode impactar o frontend imediatamente
- Policies antigas de `SELECT` podem anular restrições novas se permanecerem ativas
- `db push` exige que o histórico remoto exista também no diretório local
- a blockchain depende de secrets corretos; sem eles, as Edge Functions falham
