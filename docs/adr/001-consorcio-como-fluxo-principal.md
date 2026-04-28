# ADR 001 - Consorcio como fluxo principal

## Status

Aceito

## Contexto

O projeto inicialmente aceitava consorcios fortemente orientados por hectare. A evolucao do produto passou a exigir representacao mais fiel da composicao real de especies e mudas.

## Decisao

O consorcio passa a ser o fluxo principal do sistema.

## Consequencias

- o modelo novo usa `consortium_items`
- `area_hectares` deixa de ser a base do fluxo principal
- mudas individuais continuam existindo como fluxo simples
- registros antigos continuam como legado
