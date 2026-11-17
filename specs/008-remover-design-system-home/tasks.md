# Tarefas: Remover exemplos de Design System da Home

- **Plano:** ./plan.md

Formato: `- [ ] T-01 [RF-01] descrição (arquivo/área)`

## Backend (Domain → Application → Infrastructure → Api)
Nenhuma tarefa (mudança restrita ao frontend).

## Frontend
- [x] T-01 [RF-01, RF-02] Remover o cartão "Design System" de `Home.tsx`, mantendo título e texto de boas-vindas, e apagar os imports `Link` e `Card` sem uso. **Verificação:** `npm run build` (tsc) sem erros de import não usado; Home exibe só título e texto.
- [x] T-02 [RF-01] Remover `.cardLink` de `pages.module.css` após confirmar por busca (`grep -rn cardLink frontend/src`) que não há outro uso. **Verificação:** a busca não retorna resultados e o build passa.
- [x] T-03 [RF-03] Conferir que a rota `design-system` em `App.tsx` permanece inalterada e que nenhum link/menu aponta para ela (`grep -rn "design-system" frontend/src`). **Verificação:** a única ocorrência é a rota em `App.tsx`.
- [x] T-04 [RF-01] Em `App.test.tsx`, substituir o teste "Home leva ao catálogo…" por "Home não exibe link nem cartão do Design System". **Verificação:** `npm test` passa; o teste falharia se o cartão voltasse.
- [x] T-05 [RF-03] Em `App.test.tsx`, adicionar teste: com `history.pushState({}, '', '/design-system')`, o catálogo exibe os títulos Paleta, Tipografia, Componentes e Animações. **Verificação:** `npm test` passa.
- [x] T-06 [RF-04] Atualizar `specs/002-design-system/spec.md` (RF-14, RF-15 e critério de aceite RF-15) para "acessada por URL direta". **Verificação:** nenhuma menção a acesso "pela Home" ao catálogo em `002`.

## Docker / infra
Nenhuma tarefa.

## Validação
- [x] T-07 [RNF-01] Rodar `cd frontend && npm test` e conferir que a suíte inteira passa (layout, tema e demais telas intactos).
- [ ] T-08 Executar os critérios de aceite da spec: `docker compose up --build`, abrir a Home nos temas claro e escuro e nas larguras de celular, tablet e desktop (sem cartão, sem lacuna, sem rolagem horizontal), abrir `/design-system` pela URL (catálogo exibido) e navegar pelo menu (sem link para o catálogo).
