# Frontend

## Stack

- React 19
- TanStack Start
- TanStack Router
- Tailwind CSS
- componentes Radix UI

## Estrutura de rotas

### `src/routes/index.tsx`

Entrada pública do projeto.

### `src/routes/login.tsx`

Autenticação com:

- email e senha
- Google via Supabase OAuth

### `src/routes/dashboard.tsx`

Painel principal do usuário.

Responsabilidades:

- mostrar cards de resumo
- mostrar registros recentes
- mostrar ranking
- resumir indicadores ambientais
- resumir eventos blockchain

### `src/routes/refloreste.tsx`

Tela central de operação ambiental.

Responsabilidades:

- cadastrar muda simples
- cadastrar consórcio
- cadastrar espécie customizada
- registrar água
- visualizar histórico de consórcios e mudas

### `src/routes/validacao.tsx`

Tela de acompanhamento e moderação.

Responsabilidades:

- mostrar status das validações do próprio usuário
- habilitar moderação para `moderator` e `admin`
- permitir registrar mudas e consórcios validados na blockchain

### `src/routes/creditos.tsx`

Tela de créditos simulados.

Responsabilidades:

- emitir crédito
- listar, comprar, cancelar e aposentar crédito
- registrar crédito emitido na blockchain
- minerar bloco
- validar blockchain

### `src/routes/produtores.tsx`

Vitrine pública de produtores.

### `src/routes/mercado.tsx`

Fluxo de marketplace.

### `src/routes/carrinho.tsx`

Itens selecionados do mercado.

### `src/routes/chat.tsx`

Mensageria entre usuários.

## Componentes relevantes

### `AppShell`

Estrutura base das páginas autenticadas.

### `AuthGuard`

Protege rotas autenticadas.

### `StatusBadge`

Padroniza a apresentação dos estados de validação.

### `BlockchainBadge`

Padroniza a apresentação dos estados blockchain.

### `EmptyState`

Usado quando não há dados em uma tela.

## Integração com Supabase

O frontend usa:

- `src/integrations/supabase/client`
- `src/integrations/supabase/types.ts`
- `src/lib/blockchain.ts`

Toda alteração de schema relevante deve levar à regeneração de tipos.

## Observação de manutenção

O frontend depende fortemente de views do Supabase para dashboard, créditos, vitrine pública e blockchain. Mudanças em views, Edge Functions ou RLS costumam impactar diretamente essas rotas.
