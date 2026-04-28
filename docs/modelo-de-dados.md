# Modelo de Dados

## Visao Geral

O projeto usa Supabase como backend principal. O modelo atual mistura:

- tabelas base
- enums
- funcoes e triggers
- views para dashboard e consolidacao
- RLS para controle de acesso

## Tabelas Principais

### `profiles`

Responsavel por:

- nome de exibicao
- role do usuario
- pontos consolidados

### `species`

Responsavel por:

- catalogo de especies
- especies customizadas
- pontos base
- relacao com categoria ambiental

Campos relevantes:

- `common_name`
- `scientific_name`
- `base_points`
- `is_custom`
- `created_by`
- `co2_category_id`

### `species_co2_categories`

Responsavel por:

- categorias ambientais
- faixas de CO2
- faixas de agua

### `plantings`

Responsavel por:

- mudas individuais
- dados de plantio
- status de validacao
- vinculo opcional com consorcio

### `consortia`

Responsavel por:

- cabecalho do consorcio
- modo legado ou modo por quantidade
- pontos
- total de mudas

Campos relevantes:

- `measurement_mode`
- `total_seedlings`
- `area_hectares`
- `species_list`

### `consortium_items`

Responsavel por:

- composicao do consorcio
- quantidade por especie

### `water_logs`

Responsavel por:

- registros reais de uso de agua

### `validations`

Responsavel por:

- historico de moderacao
- aprovacoes e rejeicoes

## Views Principais

### `species_with_co2`

Usada para leitura de especies com metadados ambientais.

### `consortia_environment_dashboard`

Usada para consolidar:

- total de mudas
- CO2 estimado
- referencia de agua

### `consortia_water_balance`

Usada para comparar:

- referencia de agua
- uso real
- economia estimada
- excesso estimado

### `user_environment_dashboard`

Usada pelo dashboard geral do usuario.

## Legado

O sistema ainda mantem suporte a:

- consorcios por hectare
- listas antigas de especies em texto

Esses campos nao devem ser tratados como fonte principal do modelo novo.

## Migrations

O historico local esta em:

[C:\Users\brito\OneDrive\Documentos\terra-viva-link-main\terra-viva-link-main\supabase\migrations](C:\Users\brito\OneDrive\Documentos\terra-viva-link-main\terra-viva-link-main\supabase\migrations)

Arquivos relevantes:

- base inicial do schema
- migrations de visibilidade de especies customizadas
- snapshots remotos puxados do banco

## Observacao Importante

Algumas alteracoes do banco foram feitas diretamente no Supabase e depois refletidas no projeto por migrations manuais ou snapshots. Por isso, banco remoto e codigo local devem ser mantidos em sincronia.
