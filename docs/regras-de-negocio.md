# Regras de Negócio

## Muda individual

A muda individual é o fluxo simples do sistema.

Ela serve para:

- registrar plantios isolados
- registrar uma ação rápida em campo
- vincular posteriormente uma muda a um consórcio

Regras:

- exige espécie
- exige data
- usa um método de verificação
- pode ter foto e observações
- pode ser vinculada a um consórcio existente

## Consórcio

O consórcio é o fluxo principal.

Regras:

- mínimo de 3 mudas
- mínimo de 2 espécies diferentes
- pode exibir aviso de baixa diversidade
- é modelado por itens de composição, não mais por hectare como regra principal

## Consórcios legados

Registros antigos podem continuar usando:

- `area_hectares`
- `species_list`

Eles continuam visíveis, mas os cálculos ambientais funcionam melhor no modelo novo por quantidade de mudas.

## Espécies

O sistema possui:

- espécies padrão
- espécies customizadas criadas por usuário

Regras:

- espécies customizadas devem ser ligadas a uma categoria ambiental
- espécies customizadas ficam visíveis para o próprio criador
- moderadores e admins podem vê-las para validação

## Categorias ambientais

As categorias ambientais são a base dos cálculos de CO2 e água.

Categorias atuais:

- Arbórea Clímax
- Arbórea Pioneira
- Palmeiras
- Arbustiva
- Herbácea
- Não sei classificar

## CO2

O CO2 não é medido por sensor.

Ele é calculado como estimativa usando:

- categoria da espécie
- faixa de captura da categoria
- valor médio para consolidação

O sistema deve apresentar esse dado como estimativa.

## Água

O uso de água é tratado como estimativa mais registro manual.

Lógica:

- a referência hídrica vem da categoria ambiental
- o uso real vem de `water_logs`
- o dashboard compara uso real com referência

## Validação

Registros podem ter status:

- `pending`
- `verified`
- `rejected`

Moderadores e admins:

- aprovam
- rejeitam
- registram observações de validação

## Pontuação

A pontuação é recalculada a partir das regras do banco.

Hoje o sistema combina:

- pontos de mudas
- pontos de consórcios
- bônus quando aplicável

## Créditos simulados

Os créditos são uma representação interna do impacto ambiental validado.

Regras:

- a emissão parte de consórcio validado
- um consórcio não deve emitir créditos duplicados
- créditos podem ser listados, comprados, vendidos e aposentados

## Blockchain

A blockchain é complementar ao banco principal.

Regras:

- somente eventos críticos são enviados
- o envio não substitui o registro no Supabase
- o sistema deve evitar duplicidade por `target_type + target_id + event_type`
- mineração e auditoria são operações administrativas

Eventos atuais:

- `muda_validada`
- `consorcio_validado`
- `credito_emitido`

## Dashboard

O dashboard combina informações de:

- mudas
- consórcios
- views ambientais
- pontos do perfil
- créditos
- carrinho
- resumo blockchain

Cada card deve ter uma fonte de dados claramente definida.
