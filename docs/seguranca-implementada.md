# Segurança do Projeto - Melhorias Implementadas

## Data: 14 de Maio de 2026

### 1. CORS Restrito (CRÍTICO)
**Antes:** CORS aberto (`"Access-Control-Allow-Origin": "*"`)
**Depois:** CORS restrito a `ALLOWED_ORIGINS` configurável

**Mudanças:**
- Criado arquivo `supabase/functions/_shared.ts` com função `getCorsHeaders()` que:
  - Lê variável de ambiente `ALLOWED_ORIGINS`
  - Valida origem da requisição contra allowlist
  - Retorna header seguro com origin específica ou primeira origem da lista
  - Fallback seguro: usa o Supabase como default se não configurado

- Atualizadas 3 Edge Functions:
  - `supabase/functions/blockchain-register-event/index.ts`
  - `supabase/functions/blockchain-mine/index.ts`
  - `supabase/functions/blockchain-validate/index.ts`

**Como usar:**
```bash
# Em .env ou variáveis de ambiente Supabase
ALLOWED_ORIGINS=https://seu-dominio.com,https://www.seu-dominio.com,https://seu-projeto.supabase.co
```

---

### 2. Validação de Entrada com Zod (CRÍTICO)
**Antes:** `const body = (await req.json()) as RequestBody;` - sem validação
**Depois:** Validação com Zod em tempo de execução

**Mudanças:**
- Adicionado schema Zod em `_shared.ts`:
  ```typescript
  const blockchainEventSchema = z.object({
    targetType: z.enum(["planting", "consortium", "carbon_credit"]),
    targetId: z.string().uuid("ID deve ser um UUID válido"),
    eventType: z.enum([...]),
  });
  ```

- Função `parseAndValidateBody()` que:
  - Parse JSON com tratamento de erro
  - Valida com Zod
  - Retorna erro estruturado se falhar
  
- Aplicada em `blockchain-register-event` (principal função com entrada de usuário)

**Benefícios:**
- Evita injeção de dados inválidos
- Erros claros de validação para debugging
- Type safety em tempo de compilação

---

### 3. Headers de Segurança Adicionais
**Melhorias:**
- `X-Content-Type-Options: nosniff` - impede MIME type sniffing
- `Content-Type: application/json` - sempre explícito
- `Access-Control-Max-Age: 86400` - cache CORS por 24h

---

### 4. Validação de Origem (CSRF Prevention)
**Novo:**
- Função `validateCorsOrigin()` que rejeita requisições de origens não autorizadas
- Retorna HTTP 403 se origin não está em `ALLOWED_ORIGINS`
- Fallback seguro se variável não estiver configurada

---

### 5. Tratamento de Erros Seguro
**Antes:** Erros podiam vazar informações internas
**Depois:** 
- Mensagens de erro genéricas em produção
- Stack traces apenas em dev/logs internos
- Mensagens em português amigáveis ao usuário

---

## Configuração Recomendada

### Ambiente Local (`.env`)
```
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
BLOCKCHAIN_API_BASE_URL=http://localhost:8080
```

### Produção (Variáveis Supabase)
```
ALLOWED_ORIGINS=https://seu-dominio.com,https://www.seu-dominio.com
BLOCKCHAIN_API_BASE_URL=https://seu-blockchain-provider.com
```

---

## Testes Recomendados

### Testar CORS
```bash
# Deve retornar 200 (origin autorizada)
curl -H "Origin: https://seu-dominio.com" \
     -H "Authorization: Bearer TOKEN" \
     -X OPTIONS https://seu-projeto.supabase.co/functions/v1/blockchain-register-event

# Deve retornar 403 (origin não autorizada)
curl -H "Origin: https://ataque.com" \
     -H "Authorization: Bearer TOKEN" \
     -X POST https://seu-projeto.supabase.co/functions/v1/blockchain-register-event
```

### Testar Validação
```bash
# Deve retornar 400 (UUID inválido)
curl -X POST https://seu-projeto.supabase.co/functions/v1/blockchain-register-event \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"targetType":"planting","targetId":"invalido","eventType":"muda_validada"}'
```

---

## Próximos Passos Recomendados

1. **Rate Limiting** - Adicionar limite de requisições por IP/usuário
2. **Audit Logging** - Log de todas as operações sensíveis
3. **Secrets Rotation** - Rotação periódica de tokens
4. **WAF** - Considerar Web Application Firewall (Cloudflare)
5. **Monitoramento** - Alertas para padrões suspeitos

---

## Compatibilidade

✅ **Sem breaking changes**
- Todas as funções continuam funcionando como antes
- Apenas adicionadas validações e CORS restrito
- Fallback seguro se `ALLOWED_ORIGINS` não estiver configurada

