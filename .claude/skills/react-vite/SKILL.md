---
name: react-vite
description: Especialista em React + TypeScript + Vite (SPA, nunca SSR) com Vitest e React Testing Library, rodando em Node 24 e Docker. Use ao criar ou revisar componentes, hooks, rotas, camada de serviços/cliente da API, configuração do Vite e testes do frontend.
---

# Skill: React · TypeScript · Vite (somente SPA)

Você é especialista em React (estável mais recente), TypeScript e Vite, em Node.js 24. Antes de codar, leia a constituição (seções 8, 11 e 12) e a `spec.md`/`plan.md` da feature. **Sem spec aprovada, não escreva código.**

## Regra inegociável: NUNCA SSR
O frontend é uma **SPA renderizada no cliente**. É proibido:
- Next.js, Remix, React Router framework mode com SSR, Astro, Gatsby, TanStack Start ou qualquer meta-framework com renderização no servidor.
- `react-dom/server`, `renderToString`, `renderToPipeableStream`, `hydrateRoot`, React Server Components, `"use server"`/`"use client"` e Server Actions.
- Plugins/modo SSR do Vite (`vite build --ssr`, `ssrLoadModule`, `ssr` em `vite.config.ts`).
- Código que dependa de Node no runtime do navegador ou assuma execução no servidor.

Use `createRoot` de `react-dom/client`. Se uma necessidade parecer pedir SSR (SEO, performance), **pare e pergunte**; mudar isso exige alterar a constituição antes.

## Estrutura (`frontend/`)
```
frontend/
  index.html
  vite.config.ts
  tsconfig.json              # "strict": true
  src/
    main.tsx                 # createRoot(...).render(<App />)
    App.tsx
    components/              # componentes de UI reutilizáveis
    features/<nome>/         # componentes, hooks e testes da feature
    services/                # cliente da API (única camada que chama fetch)
    types/                   # tipos dos contratos do plan.md
```
Confirme a estrutura real do `frontend/` antes de criar arquivos; siga o que já existe.

## TypeScript
- `strict` habilitado. **Proibido `any`** sem justificativa em comentário; prefira `unknown` + *narrowing*.
- Tipos dos contratos da API exatamente como no `plan.md`; sem duplicar tipos.
- `type` para unions/props simples, `interface` quando for extensível; props sempre tipadas, sem `React.FC` obrigatório.
- Sem `enum` (use unions de string literais); `import type` para tipos.

## React
- Componentes de função e hooks; sem classes.
- Estado mínimo e local; derive valores em vez de duplicar estado; `useEffect` só para sincronizar com sistemas externos (não para derivar dados).
- Chaves estáveis em listas (nunca índice quando a lista muda); evite `useMemo`/`useCallback` sem necessidade medida.
- Formulários controlados ou `useActionState`/`useFormStatus` do lado do cliente; sem Server Actions.
- Componentes pequenos e acessíveis: elementos semânticos, `label` associado, foco e `aria-*` quando necessário.
- Carregamento, erro e estado vazio sempre tratados na UI.

## Vite
- Scripts: `dev`, `build` (`tsc -b && vite build`), `preview`, `test`.
- Variáveis de ambiente só com prefixo `VITE_`; nada secreto no frontend (tudo vai para o bundle).
- A URL da API vem de `import.meta.env.VITE_API_URL`; nunca hardcoded.
- Em desenvolvimento no Docker: `server.host: true` e porta **5173**; considere `server.proxy` apenas se o `plan.md` prever.
- Roteamento no cliente (ex.: React Router em modo *library*/declarativo), com fallback de SPA para `index.html` no servidor estático.
- Produção: `vite build` gera arquivos estáticos servidos por servidor de arquivos (ex.: nginx), sem processo Node em runtime.

## Camada de serviços
- Toda chamada HTTP fica em `src/services/`, tipada conforme os contratos do `plan.md`.
- Um cliente base (`fetch` com `VITE_API_URL`, tratamento de erro e `ProblemDetails` da API .NET).
- Componentes e hooks **não** chamam `fetch` diretamente; consomem os serviços.
- Suporte a `AbortSignal` para cancelar requisições ao desmontar.

## Testes (Vitest + React Testing Library) — constituição 8.1
- Arquivos `*.test.ts(x)` ao lado do código testado.
- Poucos e rápidos: **um por critério de aceite** (caminho feliz + no máximo um erro relevante).
- Teste comportamento pelo que o usuário vê (`getByRole`, `getByText`); sem testar detalhes de implementação, estilos ou código de framework.
- Sem mocks elaborados: mocke apenas a fronteira (`services/`) com `vi.fn()`/`vi.mock`.
- Ambiente `jsdom`, `@testing-library/jest-dom`; um assert principal por teste.
- Rodar: `cd frontend && npm test` (use `vitest run` em CI/não interativo).

## Docker (constituição 12)
- Imagem base `node:24` (nunca `latest`); instalação com `npm ci`.
- Configuração por variáveis de ambiente (`.env`, com `.env.example` versionado).
- Deve subir com `docker compose up --build` em `:5173`, sem pré-requisito local além do Docker.
- Dependências npm em versões estáveis, sem pré-releases.

## Fluxo de trabalho
1. Ler `CONSTITUTION.md` e `specs/NNN-nome/{spec,plan,tasks}.md`.
2. Implementar a tarefa atual, referenciando o `RF-xx`.
3. Rodar `npm run build` (inclui checagem de tipos) e `npm test`.
4. Marcar a tarefa como concluída em `tasks.md`.

## Checklist antes de finalizar
- [ ] Nenhum traço de SSR (sem `react-dom/server`, `hydrateRoot`, meta-frameworks, RSC).
- [ ] `strict` ativo, sem `any` injustificado, `tsc` sem erros.
- [ ] Chamadas à API somente em `services/`, tipadas pelo `plan.md`.
- [ ] Estados de carregando, erro e vazio tratados.
- [ ] Teste por critério de aceite, suíte rápida e verde.
- [ ] Nada quebra `docker compose up`.
- [ ] Dúvidas da spec seguem como `[NEEDS CLARIFICATION]`.
