# Regras de Negocio

## Muda Individual

A muda individual e o fluxo simples do sistema.

Ela serve para:

- registrar plantios isolados
- registrar uma acao rapida em campo
- vincular posteriormente uma muda a um consorcio

Regras:

- exige especie
- exige data
- usa um metodo de verificacao
- pode ter foto e observacoes
- pode ser vinculada a um consorcio existente

## Consorcio

O consorcio e o fluxo principal.

Regras:

- minimo de 3 mudas
- minimo de 2 especies diferentes
- pode exibir aviso de baixa diversidade
- e modelado por itens de composicao, nao mais por hectare como regra principal

## Consorcios Legados

Registros antigos podem continuar usando:

- `area_hectares`
- `species_list`

Eles continuam visiveis, mas os calculos ambientais funcionam melhor no modelo novo por quantidade de mudas.

## Especies

O sistema possui:

- especies padrao
- especies customizadas criadas por usuario

Regras:

- especies customizadas devem ser ligadas a uma categoria ambiental
- especies customizadas ficam visiveis para o proprio criador
- moderadores e admins podem ve-las para validacao

## Categorias Ambientais

As categorias ambientais sao a base dos calculos de CO2 e agua.

Categorias atuais:

- Arborea Climax
- Arborea Pioneira
- Palmeiras
- Arbustiva
- Herbacea
- Nao sei classificar

## CO2

O CO2 nao e medido diretamente por sensor.

Ele e calculado como estimativa usando:

- categoria da especie
- faixa de captura da categoria
- valor medio para consolidacao

O sistema deve apresentar esse dado como estimativa.

## Agua

O uso de agua tambem e tratado como estimativa + registro manual.

Logica:

- a referencia hidrica vem da categoria ambiental
- o uso real vem de `water_logs`
- o dashboard compara uso real com referencia

## Validacao

Registros podem ter status:

- `pending`
- `verified`
- `rejected`

Moderadores e admins:

- aprovam
- rejeitam
- registram observacoes de validacao

## Pontuacao

A pontuacao e recalculada a partir das regras do banco.

Hoje o sistema combina:

- pontos de mudas
- pontos de consorcios
- bonus quando aplicavel

## Dashboard

O dashboard combina informacoes de:

- mudas
- consorcios
- views ambientais
- pontos do perfil
- carrinho

Como regra de manutencao, cada card deve ter uma fonte de dados claramente definida.
