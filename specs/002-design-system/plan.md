# Plano: Design System

- **Spec:** ./spec.md (002-design-system, aprovada, sem `[NEEDS CLARIFICATION]` pendente)

Feature **somente frontend**: não há contrato com a API, backend nem banco.

## Decisões técnicas
| Decisão | Escolha | Justificativa | Requisitos |
|---|---|---|---|
| Estilo | CSS puro com **CSS custom properties** (tokens) + CSS Modules por componente | Zero dependência nova; tokens em um único arquivo; simples para demo ao vivo (const. 2) | RF-05, RF-06, RNF-04 |
| Temas | Atributo `data-theme="light\|dark"` no `<html>`; tokens redefinidos por tema; `color-scheme` declarado | Troca instantânea e sem re-render dos componentes | RF-01 |
| Preferência de tema | Valor `system \| light \| dark` em `localStorage` (`theme`); resolvido via `matchMedia('(prefers-color-scheme: dark)')` com listener quando `system` | Só no dispositivo (fora de escopo: servidor) | RF-02, RF-03 |
| Sem flash de tema | Script **inline síncrono** no `<head>` do `index.html` que lê `localStorage`/`matchMedia` e define `data-theme` antes do primeiro paint | Roda antes do React carregar | RF-04 |
| Transição de tema | `transition` de cores (~200 ms) em `background-color, color, border-color`; efeito marcante com **View Transitions API** (`document.startViewTransition` + `clip-path` circular a partir do seletor); fallback: esmaecimento simples | Nativo, sem lib; degrada com elegância | RF-08 |
| Movimento reduzido | `@media (prefers-reduced-motion: reduce)` zera durações/translações/escala via tokens (`--dur-*: 0ms`) e desativa View Transition e animações de loop | Um ponto único controla tudo | RF-09 |
| Rotas | `react-router` (SPA, modo declarativo, `BrowserRouter`; versão estável mais recente) com rotas `/` (Home) e `/design-system` | Item ativo via `NavLink`; única dependência nova justificável (const. 2) | RF-11, RF-14, RF-15 |
| Ícones | SVGs inline próprios em `components/icons/` (Home, Menu, Fechar, Sol, Lua, Monitor, Chevron) | Evita dependência de ícones | RF-14, RF-08 |
| Fonte | Pilha do sistema (`system-ui, -apple-system, "Segoe UI", Roboto, ...`) e `ui-monospace` para código | Neutra, sem download externo | RF-06 |
| Breakpoints | Celular `< 768px`, tablet `768–1023px`, desktop `≥ 1024px`; menu fixo apenas em `≥ 1024px` | Tablet usa o menu recolhido/sobreposto como celular | RF-10, RF-12 |
| Menu | Estado `drawerOpen` (≤1023px) e `collapsed` (desktop, persistido em `localStorage` `sidebar-collapsed`); drawer fecha ao navegar, ao tocar no fundo e com `Esc` | Cobre aceite sem lib | RF-11–13 |
| Indicador ativo deslizante | Elemento absoluto posicionado por `transform: translateY` conforme índice do item ativo | Efeito pedido sem lib | RF-08, RF-11 |
| Contraste | Teste automatizado calcula a razão de contraste WCAG dos pares da paleta a partir dos tokens (função utilitária pura em teste) | Verificável sem ferramentas externas | RNF-01 |
| Testes | Vitest + RTL existentes; poucos testes, um por critério de aceite (const. 8.1) | Demo ao vivo | todos |

## Arquitetura
Todo o trabalho fica em `frontend/`; backend e `docker-compose.yml` não mudam.

```
frontend/
  index.html                  # <html lang="pt-BR">, script inline anti-flash, título
  src/
    styles/
      tokens.css              # cores (claro/escuro), tipografia, espaço, raios, sombras, durações, curvas
      base.css                # reset, tipografia base, foco, reduced-motion, keyframes (fade-up, shimmer, spin, glow)
    theme/
      ThemeProvider.tsx       # contexto: preference, resolved, setPreference; sincroniza <html data-theme>
      ThemeToggle.tsx         # seletor Sistema/Claro/Escuro (radiogroup acessível)
      theme.ts                # funções puras: readPreference, resolveTheme, applyTheme
    layout/
      AppLayout.tsx           # grid: Sidebar + (Header + <Outlet/>)
      Sidebar.tsx             # logo placeholder, nav (Home), botão recolher, drawer em <1024px
      Header.tsx              # botão de menu (<1024px) + ThemeToggle no canto superior direito
      navItems.ts             # lista de itens do menu (somente Home)
    components/               # Button, TextField, Card, Badge, Alert, Spinner, Skeleton (+ .module.css)
      icons/
    pages/
      Home.tsx                # boas-vindas + cartão com link para /design-system
      DesignSystem.tsx        # catálogo: paleta, tipografia, espaçamento, componentes, animações
    App.tsx                   # providers + rotas
    main.tsx                  # importa tokens.css e base.css
```

Responsabilidades:
- **Tokens** são a única fonte de valores visuais; componentes só usam `var(--...)` (RNF-04).
- **ThemeProvider** é a única fonte de verdade do tema em runtime; o script do `index.html` apenas antecipa o primeiro frame (duplica de propósito a lógica mínima de `theme.ts`, comentada no código).
- **AppLayout** reúne navegação e cabeçalho; features futuras só adicionam item em `navItems.ts` e uma rota.

## Contratos
Sem endpoints, payloads ou eventos (backend não participa). Contratos internos do frontend:

- **`localStorage`** (somente no dispositivo):
  - `theme`: `"system" | "light" | "dark"` (ausente = `system`).
  - `sidebar-collapsed`: `"true" | "false"` (ausente = `false`).
  - Leituras/escritas em `try/catch` (armazenamento indisponível → valores padrão).
- **DOM:** `<html data-theme="light|dark">` é a interface entre tema e CSS.
- **Tipos:**
  ```ts
  type ThemePreference = 'system' | 'light' | 'dark'
  type ResolvedTheme = 'light' | 'dark'
  interface NavItem { to: string; label: string; icon: ComponentType }
  ```
- **Tokens (nomes):** `--color-primary`, `--color-secondary`, `--color-bg`, `--color-surface`, `--color-text`, `--color-text-muted`, `--color-border`, `--color-success|warning|danger|info`; `--font-sans`, `--font-mono`, `--text-xs…3xl`; `--space-1…12`; `--radius-sm|md|lg|full`; `--shadow-sm|md|lg`; `--dur-fast|base|slow`; `--ease-out|in|spring`. Valores de cor conforme a paleta aprovada na spec (ajuste só se necessário para AA).

## Impacto por camada (backend)
Nenhum. Domain, Application, Infrastructure e Api permanecem inalterados.

## Frontend
**Telas**
- **Home (`/`):** título, texto curto e cartão/botão "Design System" → `/design-system`; entrada em cascata (RF-08).
- **Design System (`/design-system`):** seções — Paleta (swatches claro/escuro com nome e hex), Tipografia (escala), Espaçamento/Raios/Sombras, Componentes (variantes e estados), Animações (demos: durações, curvas, fade-up, cascata, shimmer, spinner, brilho no hover). Sem lógica de negócio.

**Componentes (RF-07)**
- `Button` (primary, secondary, ghost; estados hover/focus/active "afundar" 0,97/disabled/loading), `TextField` (label, ajuda, erro), `Card` (hover com elevação e brilho), `Badge` (neutro + 4 estados), `Alert` (4 estados, `role` adequado), `ThemeToggle`, mais `Skeleton` (shimmer) e `Spinner`.
- Alvos interativos com mín. 44×44 px (RNF-05). Foco com `:focus-visible` e anel animado.

**Acessibilidade (RNF-01/02)**
- `<nav aria-label="Principal">`, `aria-current="page"` (via `NavLink`), botão do menu com `aria-label`, `aria-expanded` e `aria-controls`; drawer com foco devolvido ao botão ao fechar; `Esc` fecha.
- `ThemeToggle` como `role="radiogroup"` com três `role="radio"` (`aria-checked`), navegável por setas.
- Textos de UI em pt-BR (RNF-06); `lang="pt-BR"` no `<html>`.

**Serviços de API / tipos:** não há (sem chamadas à API).

**Dependências novas:** apenas `react-router` (estável). Nenhuma de fonte, ícone, animação ou CSS.

## Modelo de dados (EF Core Code First)
Não se aplica: sem entidades nem migrations.

## Docker
Sem mudanças em `docker-compose.yml` nem variáveis de ambiente. O serviço `frontend` já usa Node 24 com volume montado; `npm install` (via build da imagem) traz `react-router`. A SPA em `docker compose up` (:5173) deve usar fallback de histórico (o dev server do Vite já faz isso). Verificar que a imagem reconstrói com `--build` após o `package.json` mudar. **Atenção:** o volume anônimo `/app/node_modules` preserva a instalação antiga; ao adicionar dependências, subir com `docker compose up --build -V` (renova o volume), senão o Vite não resolve `react-router`.

## Estratégia de verificação (const. 8.1 — poucos testes, um por critério)
| Critério de aceite | Verificação |
|---|---|
| RF-02 sistema escuro/claro no primeiro frame | Teste de `theme.ts`: `resolveTheme` com `matchMedia` simulado + teste do `ThemeProvider` aplicando `data-theme` na montagem |
| RF-03 escolha "Claro" persiste | RTL: clicar "Claro", remontar, `data-theme="light"` com `matchMedia` escuro |
| RF-02 acompanha mudança do sistema | Disparar `change` no `matchMedia` simulado em "Sistema" |
| RF-12 / RF-16 tablet/celular, seletor no cabeçalho | RTL: `Header` contém o `ThemeToggle`; botão de menu abre/fecha drawer (aria-expanded), fecha ao navegar e ao clicar no fundo. Faixas de largura por CSS: validação manual (jsdom não faz layout) |
| RF-11 desktop, item ativo | RTL com `MemoryRouter`: item "Home" tem `aria-current="page"`; clique navega |
| RF-13 recolher persiste | RTL: recolher, remontar, `localStorage` e classe/estado compacto preservados |
| RF-10 sem rolagem horizontal | Verificação manual em 375/768/1280 px (Browser pane/DevTools); sem teste automatizado (jsdom) |
| RF-09 movimento reduzido | Verificação manual com emulação de `prefers-reduced-motion`; teste simples garante que CSS de tokens zera `--dur-*` no bloco `reduce` (leitura do arquivo) |
| RF-15 catálogo | RTL: página renderiza seções Paleta, Tipografia, Componentes e Animações |
| RNF-01 contraste AA | Teste: calcula razão para os pares texto/fundo, texto-secundário/fundo, primária/fundo e estados/superfície em ambos os temas lendo valores de `tokens.css`; falha < 4,5 (texto) ou < 3 (UI) |
| RF-04 sem flash | Verificação manual (recarregar com cache e `Fast 3G`) + inspeção de que o script está inline no `<head>` |

Comandos: `cd frontend && npm test` · `npm run lint` · `npm run build` (tsc estrito). Verificação final: `docker compose up --build`.

## Verificação da constituição
- [x] Spec primeiro (spec aprovada, sem pendências)
- [x] Simplicidade (CSS puro, ícones inline, só `react-router` como dependência nova)
- [x] Verificabilidade (tabela acima; itens visuais explicitados como manuais)
- [x] Dependências da Arquitetura Limpa respeitadas (backend intocado)
- [x] Roda via docker compose (sem mudanças de infra; `strict` TS, testes `*.test.tsx` ao lado do código, seção 11)

## Riscos
- **Contraste AA:** alguns pares da paleta aprovada podem ficar abaixo de 4,5:1 (ex.: Alerta `#D97706` ou Secundária `#0EA5E9` como texto sobre fundo claro). Mitigação: o teste de contraste revela; usar essas cores como fundo/ícone/borda (3:1) e ajustar o tom apenas se necessário, conforme a spec permite.
- **View Transitions API:** suporte desigual; fallback para esmaecimento e desativada com movimento reduzido. Evitar bloquear o clique durante a transição.
- **Flash de tema:** depende do script inline ser síncrono e anterior ao CSS; `ThemeProvider` não deve reescrever o atributo com valor diferente na montagem.
- **Escopo de animações expressivas:** muitos efeitos podem inflar a tarefa. Mitigação: efeitos via tokens + poucas classes utilitárias; priorizar os que aparecem na Home/catálogo.
- **TypeScript 7 / Vite 8 / Vitest 5:** versões recentes do `package.json`; confirmar compatibilidade de `react-router` e de CSS Modules (tipagem `*.module.css`) com `vite/client`.
- **localStorage indisponível** (modo privado/bloqueio): tratado com `try/catch` e padrões.
