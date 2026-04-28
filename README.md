# Sistema Verde da Amazonia

Aplicacao web e mobile para registro de mudas, consorcios agroflorestais, validacao de acoes ambientais, acompanhamento de carbono estimado, controle de agua e apoio a interacoes de mercado da rede.

## Stack

- Frontend: React 19 + TanStack Start + Vite
- UI: Tailwind CSS + Radix UI
- Backend/Banco: Supabase
- Mobile: Capacitor + Android Studio

## Principais Fluxos

- Cadastro simples de muda
- Cadastro de consorcio por especies e quantidades
- Registro manual de uso de agua
- Dashboard com indicadores ambientais
- Validacao por moderadores e admins
- Mercado, carrinho e chat

## Estrutura do Projeto

- `src/routes`: telas principais do sistema
- `src/components`: componentes compartilhados
- `src/hooks`: hooks de autenticacao e apoio
- `src/integrations/supabase`: cliente e tipos do Supabase
- `src/lib`: funcoes auxiliares
- `supabase/migrations`: historico local de migrations
- `docs`: documentacao funcional e tecnica

## Como rodar localmente

```powershell
npm install
npm run dev
```

## Build de producao

```powershell
npm run build
```

## Geracao de APK

```powershell
npm run android
npx cap open android
```

Observacoes:

- O projeto usa `dist/client` como `webDir` do Capacitor.
- E necessario ter Java configurado e Android Studio instalado.
- Veja detalhes em [docs/mobile-apk.md](C:\Users\brito\OneDrive\Documentos\terra-viva-link-main\terra-viva-link-main\docs\mobile-apk.md).

## Supabase

O projeto depende de:

- tabelas de autenticacao e perfis
- registros de mudas e consorcios
- categorias ambientais
- views de dashboard ambiental
- RLS para especies, registros e moderacao

Veja:

- [docs/modelo-de-dados.md](C:\Users\brito\OneDrive\Documentos\terra-viva-link-main\terra-viva-link-main\docs\modelo-de-dados.md)
- [docs/operacao-supabase.md](C:\Users\brito\OneDrive\Documentos\terra-viva-link-main\terra-viva-link-main\docs\operacao-supabase.md)

## Documentacao

- [Visao geral](C:\Users\brito\OneDrive\Documentos\terra-viva-link-main\terra-viva-link-main\docs\visao-geral.md)
- [Regras de negocio](C:\Users\brito\OneDrive\Documentos\terra-viva-link-main\terra-viva-link-main\docs\regras-de-negocio.md)
- [Modelo de dados](C:\Users\brito\OneDrive\Documentos\terra-viva-link-main\terra-viva-link-main\docs\modelo-de-dados.md)
- [Frontend](C:\Users\brito\OneDrive\Documentos\terra-viva-link-main\terra-viva-link-main\docs\frontend.md)
- [Mobile / APK](C:\Users\brito\OneDrive\Documentos\terra-viva-link-main\terra-viva-link-main\docs\mobile-apk.md)
- [Operacao do Supabase](C:\Users\brito\OneDrive\Documentos\terra-viva-link-main\terra-viva-link-main\docs\operacao-supabase.md)
- [ADRs](C:\Users\brito\OneDrive\Documentos\terra-viva-link-main\terra-viva-link-main\docs\adr)
