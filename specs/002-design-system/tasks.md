# Tarefas: Design System

- **Plano:** ./plan.md

Formato: `- [x] T-01 [RF-01] descrição (arquivo/área) — Verificação: ...`

Ordenadas por dependência. Caminhos relativos a `frontend/`. Testes concisos (const. 8.1): um por critério de aceite.

## Backend
Nenhuma tarefa: a feature não toca o backend (ver plano).

## Frontend

### Fundação
- [x] T-01 [RF-14] Adicionar `react-router` (versão estável) ao `package.json` (`package.json`, `package-lock.json`) — Verificação: `npm install` e `npm run build` passam.
- [x] T-02 [RF-05, RF-06] Criar `src/styles/tokens.css` com cores da paleta Índigo (claro/escuro via `:root` e `[data-theme="dark"]`), tipografia (pilha do sistema), escalas de espaço, raios e sombras — Verificação: arquivo contém todos os tokens do plano; revisão visual na T-24.
- [x] T-03 [RF-08, RF-09] Adicionar tokens de movimento (`--dur-fast|base|slow`, `--ease-out|in|spring`) em `tokens.css` e bloco `@media (prefers-reduced-motion: reduce)` zerando as durações — Verificação: teste de leitura do CSS confere que o bloco `reduce` zera `--dur-*` (T-04).
- [x] T-04 [RF-09] Teste `src/styles/tokens.test.ts`: bloco `reduce` zera `--dur-*` — Verificação: `npm test` verde.
- [x] T-05 [RNF-01] Teste `src/styles/contrast.test.ts`: lê cores de `tokens.css`, calcula razão WCAG e exige ≥ 4,5 (texto) e ≥ 3 (UI) nos dois temas; ajustar tons só se falhar — Verificação: `npm test` verde.
- [x] T-06 [RF-06, RF-08, RF-10] Criar `src/styles/base.css`: reset, tipografia base, `box-sizing`, sem rolagem horizontal, `:focus-visible` animado, keyframes (`fade-up`, `shimmer`, `spin`, `glow`), transição de cores de tema (~200 ms); importar tokens e base em `src/main.tsx` — Verificação: `npm run build` passa; app abre sem erro.
- [x] T-07 [RNF-06] Trocar `<html lang>` para `pt-BR` e título para o nome provisório em `index.html` — Verificação: inspeção do arquivo.

### Tema
- [x] T-08 [RF-02, RF-03] Criar `src/theme/theme.ts` (`readPreference`, `resolveTheme`, `applyTheme`, `localStorage` em `try/catch`) e `theme.test.ts`: sistema escuro/claro resolve corretamente e preferência salva prevalece — Verificação: `npm test` verde.
- [x] T-09 [RF-04] Adicionar script inline síncrono no `<head>` de `index.html` que define `data-theme` antes do primeiro paint, com comentário apontando `theme.ts` — Verificação: inspeção do `<head>`; recarregar no navegador sem piscar (manual, na T-24).
- [x] T-10 [RF-02, RF-03] Criar `src/theme/ThemeProvider.tsx` (contexto `preference`, `resolved`, `setPreference`; listener `matchMedia` em "Sistema"; sem reescrever atributo divergente na montagem) e testes: "Claro" persiste após remontar com sistema escuro; mudança do sistema em "Sistema" troca o tema sem recarregar — Verificação: `npm test` verde.
- [x] T-11 [RF-03, RF-16] Criar ícones inline (Sol, Lua, Monitor) e `src/theme/ThemeToggle.tsx` (`radiogroup` com Sistema/Claro/Escuro, setas, alvos ≥ 44 px) — Verificação: teste RTL: selecionar "Escuro" altera `data-theme`.
- [x] T-12 [RF-08] Efeito de revelação circular na troca de tema (`startViewTransition` + `clip-path` a partir do seletor), com fallback para esmaecimento e desligado em movimento reduzido — Verificação: manual na T-24 nos dois casos (com e sem suporte/redução).

### Componentes base
- [x] T-13 [RF-07, RF-08] Criar `Button` (primary/secondary/ghost; hover, foco, "afundar" 0,97, disabled, loading) com CSS Module — Verificação: teste RTL: `disabled` não dispara clique; `loading` exibe `Spinner`.
- [x] T-14 [RF-07, RF-08] Criar `Spinner` e `Skeleton` (shimmer) — Verificação: renderizam com `role`/`aria` adequados (coberto por T-13 e T-23).
- [x] T-15 [RF-07] Criar `TextField` (label, ajuda, erro com `aria-invalid`/`aria-describedby`) — Verificação: teste RTL: label associado ao input e mensagem de erro anunciada.
- [x] T-16 [RF-07, RF-08] Criar `Card` (hover com elevação e brilho/gradiente), `Badge` (neutro + 4 estados) e `Alert` (4 estados, `role` adequado) — Verificação: renderização no catálogo (T-23).

### Layout e navegação
- [x] T-17 [RF-14] Criar `src/layout/navItems.ts` (somente Home) e ícones de Home, Menu, Fechar e Chevron — Verificação: tipagem `NavItem` compila (`npm run build`).
- [x] T-18 [RF-11, RF-14, RNF-02] Criar `Sidebar` com placeholder de logo + nome provisório, `<nav aria-label="Principal">`, `NavLink` com `aria-current` e indicador ativo deslizante — Verificação: teste RTL com `MemoryRouter`: "Home" tem `aria-current="page"`.
- [x] T-19 [RF-13] Adicionar recolher/expandir (versão só ícones) no desktop com transição de largura e persistência em `localStorage` `sidebar-collapsed` — Verificação: teste RTL: recolher, remontar, continua recolhido.
- [x] T-20 [RF-12, RNF-02] Implementar drawer em `< 1024px`: botão com `aria-label`/`aria-expanded`/`aria-controls`, abre sobre o conteúdo com fundo esmaecido, fecha ao navegar, ao tocar fora e com `Esc`, devolvendo o foco ao botão — Verificação: teste RTL cobrindo abrir, fechar ao navegar e fechar ao clicar no fundo.
- [x] T-21 [RF-16, RF-10] Criar `Header` (botão de menu em `< 1024px` + `ThemeToggle` no canto superior direito) e `AppLayout` (grid Sidebar + Header + `<Outlet/>`, sem rolagem horizontal) — Verificação: teste RTL: `Header` contém o `ThemeToggle`; manual em 375/768/1280 px na T-24.

### Páginas e rotas
- [x] T-22 [RF-14, RF-15, RF-08] Criar `pages/Home.tsx` (boas-vindas e cartão/botão "Design System" → `/design-system`, entrada em cascata) e ligar rotas `/` e `/design-system` em `App.tsx` com `BrowserRouter`, `ThemeProvider` e `AppLayout`; ajustar `App.test.tsx` — Verificação: teste RTL: Home exibe o link para o catálogo; `npm test` verde.
- [x] T-23 [RF-15, RF-05, RF-06, RF-07, RF-08] Criar `pages/DesignSystem.tsx` com seções Paleta (swatches claro/escuro e hex), Tipografia, Espaçamento/Raios/Sombras, Componentes (variantes e estados) e Animações (durações, curvas, fade-up, cascata, shimmer, spinner, brilho no hover) — Verificação: teste RTL: as quatro seções principais aparecem.

## Docker / infra
- [x] T-24 [RNF-07] Rodar `docker compose up --build` e confirmar que o frontend sobe em :5173 com `react-router` instalado e que as rotas `/` e `/design-system` carregam ao recarregar a página — Verificação: abrir `http://localhost:5173` e `/design-system` sem erro de console.

## Validação
- [x] T-25 [RF-01–RF-16, RNF-01–RNF-07] `npm test`, `npm run lint` e `npm run build` verdes em `frontend/` — Verificação: três comandos com saída de sucesso.
- [x] T-26 [RF-04, RF-09, RF-10, RF-12] Verificação manual (Browser pane): sem flash de tema ao recarregar; sem rolagem horizontal em 375/768/1280 px; tablet com menu recolhido; movimento reduzido sem deslocamento/escala; foco visível e navegação por teclado completa — Verificação: checklist anotado no PR/relatório.
- [x] T-27 Executar todos os critérios de aceite da spec (`spec.md`) e marcar os atendidos — Verificação: checkboxes da spec marcados e nenhum item pendente sem justificativa.
