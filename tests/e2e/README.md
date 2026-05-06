# Testes E2E com Playwright

Esta estrutura usa Page Object Model (POM) em TypeScript para organizar os fluxos do sistema.

## Estrutura

- `fixtures/`: helpers e leitura de credenciais
- `pages/`: objetos de página
- `specs/public/`: testes públicos
- `specs/authenticated/`: caminhos felizes autenticados

## Variáveis para testes autenticados

Defina no terminal antes de rodar:

```powershell
$env:E2E_EMAIL="seu-usuario-de-teste@exemplo.com"
$env:E2E_PASSWORD="sua-senha-de-teste"
```

Sem essas variáveis, os testes autenticados serão ignorados automaticamente.

## Comandos

```powershell
npm run test:e2e
npm run test:e2e:headed
npm run test:e2e:ui
```

## O que os testes cobrem hoje

### Públicos
- landing page carregando
- botão `Acessar o sistema`
- link do APK
- redirecionamento de rota protegida para login

### Autenticados
- login com e-mail e senha
- chegada ao dashboard
- navegação para `Refloreste e Ganhe`
- navegação para `Mapa`
- logout

## Observações

- O Playwright sobe o projeto automaticamente com `npm run dev`.
- A base local usada por padrão é `http://127.0.0.1:3000`.
- Se precisar mudar a porta:

```powershell
$env:PLAYWRIGHT_PORT="4173"
npm run test:e2e
```
