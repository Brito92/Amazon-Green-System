# Modelo de Dados

## Visão geral

O projeto usa Supabase como backend principal. O modelo atual mistura:

- tabelas base
- enums
- funções e triggers
- views para dashboard e consolidação
- RLS para controle de acesso
- tabelas auxiliares para blockchain

## Tabelas principais

### `profiles`

Responsável por:

- nome de exibição
- role do usuário
- pontos consolidados

### `species`

Responsável por:

- catálogo de espécies
- espécies customizadas
- pontos base
- relação com categoria ambiental

Campos relevantes:

- `common_name`
- `scientific_name`
- `base_points`
- `is_custom`
- `created_by`
- `co2_category_id`

### `species_co2_categories`

Responsável por:

- categorias ambientais
- faixas de CO2
- faixas de água

### `plantings`

Responsável por:

- mudas individuais
- dados de plantio
- status de validação
- vínculo opcional com consórcio

### `consortia`

Responsável por:

- cabeçalho do consórcio
- modo legado ou modo por quantidade
- pontos
- total de mudas

Campos relevantes:

- `measurement_mode`
- `total_seedlings`
- `area_hectares`
- `species_list`

### `consortium_items`

Responsável por:

- composição do consórcio
- quantidade por espécie

### `water_logs`

Responsável por:

- registros reais de uso de água

### `validations`

Responsável por:

- histórico de moderação
- aprovações e rejeições

### `carbon_credit_credits`

Responsável por:

- créditos simulados emitidos
- lastro por consórcio
- status do crédito
- token interno e histórico de posse

### `carbon_credit_transactions`

Responsável por:

- emissão
- listagem
- compra
- venda
- aposentadoria

### `blockchain_records`

Responsável por:

- registrar o envio de eventos críticos para a API blockchain
- guardar payload, hash, status, bloco e auditoria

### `blockchain_blocks`

Responsável por:

- armazenar blocos minerados
- manter hash do bloco, índice, merkle root, nonce e resposta bruta

### `blockchain_audits`

Responsável por:

- armazenar auditorias da cadeia
- manter o resultado da validação externa

## Views principais

### `species_with_co2`

Usada para leitura de espécies com metadados ambientais.

### `consortia_environment_dashboard`

Usada para consolidar:

- total de mudas
- CO2 estimado
- referência de água

### `consortia_water_balance`

Usada para comparar:

- referência de água
- uso real
- economia estimada
- excesso estimado

### `user_environment_dashboard`

Usada pelo dashboard geral do usuário.

### `user_carbon_credit_summary`

Usada pelo módulo de créditos e dashboard.

### `producer_public_summary`

Usada na vitrine de produtores.

### `producer_public_consortia`

Usada no detalhamento público de produtores.

### `user_blockchain_summary`

Usada para resumir:

- total de eventos
- pendentes
- minerados
- auditados

### `blockchain_records_display`

Usada para exibição frontend dos registros blockchain sem expor payload completo.

## Legado

O sistema ainda mantém suporte a:

- consórcios por hectare
- listas antigas de espécies em texto

Esses campos não devem ser tratados como fonte principal do modelo novo.

## Migrations

O histórico local está em `supabase/migrations`.

Arquivos recentes relevantes:

- `20260504010000_carbon_credit_marketplace.sql`
- `20260505010000_producer_profiles_showcase.sql`
- `20260511010000_blockchain_integration.sql`

## Observação importante

Algumas alterações do banco foram feitas diretamente no Supabase e depois refletidas no projeto por migrations manuais ou snapshots. Banco remoto e código local precisam permanecer em sincronia.
