# ADR 002 - CO2 por categoria ambiental

## Status

Aceito

## Contexto

O sistema precisava calcular CO2 sem depender de sensores ou de valores exatos por especie, o que seria dificil de manter e validar.

## Decisao

O CO2 passa a ser calculado por categoria ambiental, usando faixas e valor medio de referencia.

## Consequencias

- especies precisam de uma categoria ambiental
- novas especies podem ser cadastradas por usuario
- o resultado deve ser comunicado como estimativa
