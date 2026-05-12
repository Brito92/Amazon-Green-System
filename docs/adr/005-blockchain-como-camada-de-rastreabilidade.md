# ADR 005 - Blockchain como Camada de Rastreabilidade

## Contexto

O sistema precisava ganhar uma camada de rastreabilidade para eventos ambientais importantes, sem migrar toda a operação para uma arquitetura descentralizada completa.

## Decisão

Foi adotada uma arquitetura híbrida:

- Supabase continua como backend operacional principal
- a blockchain entra como camada complementar de registro e auditoria
- somente eventos críticos são enviados para a API externa

Eventos atuais:

- `muda_validada`
- `consorcio_validado`
- `credito_emitido`

Também foram adicionadas operações de:

- mineração manual
- auditoria manual

## Consequências

### Positivas

- melhora a rastreabilidade
- reforça transparência e confiança
- mantém o sistema simples de operar
- evita a complexidade imediata de smart contracts e wallets

### Limitações

- o sistema continua centralizado
- a blockchain não substitui o banco principal
- não há token público real nem descentralização completa

## Justificativa

Essa abordagem equilibra viabilidade técnica, clareza para apresentação e valor demonstrável para o projeto.
