# Visao Geral

## Objetivo

O sistema foi construido para apoiar iniciativas de reflorestamento e sistemas agroflorestais, combinando registro operacional, verificacao, indicadores ambientais e recursos de rede comercial.

## Perfis de Usuario

- `user`: produtor ou participante da rede
- `moderator`: revisa e valida registros
- `admin`: possui as capacidades de moderacao e controle ampliado

## Pilares do Produto

- Registro de mudas individuais
- Registro de consorcios agroflorestais
- Validacao de registros
- Acompanhamento de pontos e impacto
- Controle estimado de agua
- Calculo estimado de CO2
- Mercado, carrinho e chat

## Fluxos Principais

### 1. Muda individual

Fluxo leve para registrar uma muda de forma rapida.

Informacoes centrais:

- especie
- data do plantio
- metodo de verificacao
- foto opcional
- observacoes
- vinculo opcional com consorcio

### 2. Consorcio

Fluxo principal do sistema para representar um plantio estruturado.

Informacoes centrais:

- nome do consorcio
- descricao
- metodo de verificacao
- foto
- especies e quantidades

### 3. Registro de agua

Fluxo de controle manual, feito preferencialmente no contexto do consorcio.

Informacoes centrais:

- consorcio
- data do registro
- litros utilizados
- metodo de irrigacao
- fonte de agua
- observacoes

### 4. Validacao

Moderadores e admins podem aprovar ou rejeitar mudas e consorcios.

### 5. Dashboard

Resume atividade, pontos, consorcios, carbono estimado, uso de agua e ranking.

## Organizacao Atual do Produto

O projeto esta em uma fase em que:

- o consorcio e o fluxo principal
- a muda individual continua existindo como fluxo simples
- o carbono e a agua sao estimados por categoria ambiental
- parte do modelo antigo por hectare ainda continua como legado

## Documentos Relacionados

- [Regras de negocio](C:\Users\brito\OneDrive\Documentos\terra-viva-link-main\terra-viva-link-main\docs\regras-de-negocio.md)
- [Modelo de dados](C:\Users\brito\OneDrive\Documentos\terra-viva-link-main\terra-viva-link-main\docs\modelo-de-dados.md)
