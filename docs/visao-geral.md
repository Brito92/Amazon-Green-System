# Visão Geral

## Objetivo

O sistema foi construído para apoiar iniciativas de reflorestamento e sistemas agroflorestais na Amazônia, combinando registro operacional, validação, indicadores ambientais, rastreabilidade e possibilidades de valorização econômica.

## Perfis de usuário

- `user`: produtor ou participante da rede
- `moderator`: revisa, valida e pode operar mineração e auditoria
- `admin`: possui as capacidades de moderação com acesso ampliado

## Pilares do produto

- Registro de mudas individuais
- Registro de consórcios agroflorestais
- Validação de registros
- Acompanhamento de pontos e impacto
- Controle estimado e registrado de água
- Cálculo estimado de CO2
- Créditos simulados
- Rastreabilidade blockchain
- Vitrine de produtores
- Mercado, carrinho e chat

## Fluxos principais

### 1. Muda individual

Fluxo leve para registrar um plantio isolado.

Informações centrais:

- espécie
- data do plantio
- método de verificação
- foto opcional
- observações
- vínculo opcional com consórcio

### 2. Consórcio

Fluxo principal do sistema para representar um plantio estruturado.

Informações centrais:

- nome do consórcio
- descrição
- método de verificação
- foto
- espécies e quantidades

### 3. Registro de água

Fluxo de controle manual, preferencialmente feito no contexto do consórcio.

Informações centrais:

- consórcio
- data do registro
- litros utilizados
- método de irrigação
- fonte de água
- observações

### 4. Validação

Moderadores e admins aprovam ou rejeitam mudas e consórcios. Após a validação, eventos importantes podem ser enviados para a camada blockchain.

### 5. Créditos

Consórcios validados podem gerar créditos simulados. Esses créditos podem ser listados, comprados, aposentados e registrados na blockchain.

### 6. Blockchain

Eventos críticos podem ser registrados em uma API blockchain externa:

- `muda_validada`
- `consorcio_validado`
- `credito_emitido`

Depois do registro, o sistema pode:

- mostrar hash e status
- minerar bloco
- auditar a cadeia

### 7. Dashboard

Resume atividade, pontos, consórcios, carbono estimado, uso de água, créditos e eventos blockchain.

## Organização atual do produto

O projeto está em uma fase em que:

- o consórcio é o fluxo principal
- a muda individual continua existindo como fluxo simples
- o carbono e a água são estimados por categoria ambiental
- a blockchain funciona como camada complementar de rastreabilidade
- parte do modelo antigo por hectare ainda continua como legado

## Documentos relacionados

- [Regras de negócio](regras-de-negocio.md)
- [Modelo de dados](modelo-de-dados.md)
