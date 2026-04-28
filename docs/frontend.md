# Frontend

## Stack

- React 19
- TanStack Start
- TanStack Router
- Tailwind CSS
- componentes Radix UI

## Estrutura de Rotas

### `src/routes/index.tsx`

Entrada publica do projeto.

### `src/routes/login.tsx`

Autenticacao com:

- email e senha
- Google via Supabase OAuth

### `src/routes/dashboard.tsx`

Painel principal do usuario.

Responsabilidades:

- mostrar cards de resumo
- mostrar registros recentes
- mostrar ranking
- resumir indicadores ambientais

### `src/routes/refloreste.tsx`

Tela central de operacao ambiental.

Responsabilidades:

- cadastrar muda simples
- cadastrar consorcio
- cadastrar especie customizada
- registrar agua
- visualizar historico de consorcios e mudas

### `src/routes/validacao.tsx`

Tela de acompanhamento e moderacao.

Responsabilidades:

- mostrar status das validacoes do proprio usuario
- habilitar moderacao para `moderator` e `admin`

### `src/routes/mercado.tsx`

Fluxo de marketplace.

### `src/routes/carrinho.tsx`

Itens selecionados do mercado.

### `src/routes/chat.tsx`

Mensageria entre usuarios.

## Componentes Relevantes

### `AppShell`

Estrutura base das paginas autenticadas.

### `AuthGuard`

Protege rotas autenticadas.

### `StatusBadge`

Padroniza a apresentacao dos estados de validacao.

### `EmptyState`

Usado quando nao ha dados em uma tela.

## Integracao com Supabase

O frontend usa:

- `src/integrations/supabase/client`
- `src/integrations/supabase/types.ts`

Toda alteracao de schema relevante deve levar a regeneracao de tipos.

## Observacao de Manutencao

O frontend depende fortemente de views do Supabase para o dashboard e de consultas compostas para os fluxos de plantio e consorcio. Mudancas em views ou RLS costumam impactar diretamente essas rotas.
