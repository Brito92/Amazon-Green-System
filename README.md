# Sistema Verde da Amazônia

Aplicação web e mobile para registro de mudas, consórcios agroflorestais, validação de ações ambientais, acompanhamento de carbono estimado, controle de água, vitrine de produtores e créditos simulados com rastreabilidade blockchain.

## Stack

- Frontend: React 19 + TanStack Start + Vite
- UI: Tailwind CSS + Radix UI
- Backend/Banco: Supabase
- Mobile: Capacitor + Android Studio
- Integração externa: API blockchain para registro, mineração e auditoria

## Principais fluxos

- Cadastro simples de muda
- Cadastro de consórcio por espécies e quantidades
- Cadastro de espécies customizadas
- Registro manual de uso de água
- Dashboard com indicadores ambientais e resumo blockchain
- Validação por moderadores e admins
- Créditos simulados com emissão, listagem, compra, aposentadoria e rastreabilidade
- Vitrine pública de produtores
- Mercado, carrinho e chat

## Estrutura do projeto

- `src/routes`: telas principais do sistema
- `src/components`: componentes compartilhados
- `src/hooks`: autenticação e utilitários de estado
- `src/lib`: helpers de formatação, blockchain e apoio ao frontend
- `src/integrations/supabase`: cliente e tipos do Supabase
- `supabase/migrations`: histórico local de schema
- `supabase/functions`: Edge Functions
- `docs`: documentação funcional, técnica e ADRs

## Como rodar localmente

```powershell
npm install
npm run dev
```

## Build de produção

```powershell
npm run build
```

## Geração de APK

```powershell
npm run android
npx cap open android
```

## Supabase

O projeto depende de:

- autenticação e perfis
- registros de mudas e consórcios
- categorias ambientais
- views de dashboard ambiental
- RLS para espécies, registros, créditos e moderação
- Edge Functions para blockchain

## Blockchain

A blockchain não substitui o banco principal. O Supabase continua sendo a base operacional do sistema, enquanto a integração blockchain registra eventos críticos como:

- `muda_validada`
- `consorcio_validado`
- `credito_emitido`

Além do registro, há suporte a:

- mineração manual de bloco
- auditoria da cadeia
- exibição de hash e status no app

## Documentação

- [Visão geral](docs/visao-geral.md)
- [Regras de negócio](docs/regras-de-negocio.md)
- [Modelo de dados](docs/modelo-de-dados.md)
- [Frontend](docs/frontend.md)
- [Mobile / APK](docs/mobile-apk.md)
- [Operação do Supabase](docs/operacao-supabase.md)
- [ADRs](docs/adr)
