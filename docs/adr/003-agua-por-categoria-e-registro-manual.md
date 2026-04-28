# ADR 003 - Agua por categoria e registro manual

## Status

Aceito

## Contexto

O sistema nao recebe dados de hardware no momento, mas precisava acompanhar consumo e economia de agua.

## Decisao

A agua passa a ser tratada com:

- referencia por categoria ambiental
- uso real informado manualmente em `water_logs`

## Consequencias

- o sistema compara referencia e uso real
- indicadores de economia e excesso sao estimados
- o fluxo principal de agua fica no consorcio
