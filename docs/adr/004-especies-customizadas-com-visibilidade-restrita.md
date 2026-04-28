# ADR 004 - Especies customizadas com visibilidade restrita

## Status

Aceito

## Contexto

Usuarios precisavam cadastrar especies novas sem poluir a lista global para toda a base.

## Decisao

Especies customizadas ficam visiveis:

- para o usuario criador
- para moderadores e admins

Especies padrao continuam visiveis para todos os autenticados.

## Consequencias

- `species.created_by` e `species.is_custom` tornam-se fundamentais
- as policies da tabela `species` precisam ser mantidas com cuidado
