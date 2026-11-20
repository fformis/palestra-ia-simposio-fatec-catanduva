# Sessão: plano, tarefas e implementação do design system

- **Projeto:** palestra-ia-simposio-fatec-catanduva
- **Modelo:** Claude Sonnet 5.5
- **Data da sessão:** 2026-11-11 (exportada em 2026-11-20)
- **Resultado:** `plan.md` e `tasks.md` criados, 27 tarefas implementadas no frontend, commit `77fc708` na `main`

> Transcrição editada: as mensagens do usuário estão na íntegra; as respostas do assistente estão preservadas, e as chamadas de ferramenta aparecem resumidas.

---

## 1. Usuário

> faça o planejamento

Isso acionou a skill `/plan`, que instruía: ler `spec.md` e `.claude/CONSTITUTION.md`; parar e perguntar se houvesse `[NEEDS CLARIFICATION]`; criar `plan.md` a partir do template, com decisões, contratos e verificação da constituição; não escrever código de produção.

### Assistente

**Investigação inicial.** Li a spec `002-design-system` (aprovada, "Nenhuma questão em aberto"), a constituição, o template do plano, o `package.json`, o `vite.config.ts`, o `index.html`, o `App.tsx` e o `docker-compose.yml`. O frontend era o esqueleto do Vite com React 19, TypeScript, Vitest e RTL.

**Ação:** criei `specs/002-design-system/plan.md` com decisões técnicas, arquitetura de pastas, contratos internos, estratégia de verificação e riscos.

**Resposta final:**

Criei o plano em `specs/002-design-system/plan.md`. A spec não tinha `[NEEDS CLARIFICATION]` pendente, então segui direto. Não escrevi código de produção.

- **Escopo:** só o frontend muda. Backend, banco e `docker-compose.yml` ficam como estão, e não há contrato de API.
- **Estilo e tema:** tokens em CSS puro, com o tema definido por `data-theme` no `<html>`. Um script inline no `<head>` evita o flash de tema; a preferência fica em `localStorage`; a revelação circular usa a View Transitions API, com esmaecimento como alternativa; movimento reduzido zera as durações nos tokens.
- **Navegação:** `react-router` com `/` (Home) e `/design-system`; menu fixo só a partir de 1024 px, e sobreposto no celular e no tablet. A única dependência nova é o `react-router`.
- **Verificação:** um teste por critério de aceite (incluindo um teste de contraste AA lido dos tokens). Responsividade, rolagem horizontal, movimento reduzido e flash de tema ficam como verificação manual, porque o jsdom não faz layout.
- **Riscos principais:** pares da paleta abaixo do contraste AA quando usados como texto (ex.: `#D97706` e `#0EA5E9`); suporte desigual à View Transitions API; compatibilidade do `react-router` com as versões novas de TypeScript, Vite e Vitest.

---

## 2. Usuário

> Sim, /tasks

(resposta ao convite "Gerar as tarefas agora?"). A skill `/tasks` instruía: ler `spec.md` e `plan.md`; criar `tasks.md` a partir do template; cada tarefa referencia um `RF-xx`, é pequena, tem forma de verificação e está ordenada por dependência.

### Assistente

**Ação:** li o template `specs/_templates/tasks.md` e criei `specs/002-design-system/tasks.md` com 27 tarefas.

**Resposta final:**

Criei `specs/002-design-system/tasks.md` com 27 tarefas ordenadas por dependência, cada uma ligada a um RF/RNF e com forma de verificação. Nada foi implementado nem commitado.

- **Fundação (T-01 a T-07):** `react-router`, tokens de cor e movimento, `base.css`, `lang="pt-BR"` e os testes de contraste AA e de movimento reduzido.
- **Tema (T-08 a T-12):** `theme.ts`, script anti-flash, `ThemeProvider`, `ThemeToggle` e a revelação circular.
- **Componentes (T-13 a T-16):** `Button`, `Spinner`, `Skeleton`, `TextField`, `Card`, `Badge` e `Alert`.
- **Layout (T-17 a T-21):** `Sidebar` com item ativo deslizante, recolher no desktop com persistência, drawer abaixo de 1024 px, `Header` e `AppLayout`.
- **Páginas (T-22 e T-23):** Home, catálogo, rotas e `App.tsx`.
- **Docker e validação (T-24 a T-27):** `docker compose up --build`, `npm test`/`lint`/`build`, verificação manual e conferência dos critérios de aceite.

Não há tarefas de backend, porque a feature só mexe no frontend.

---

## 3. Usuário

> Sim, /implement

(resposta ao convite "Iniciar a implementação?"). A skill `/implement` instruía: ler spec, plano e tarefas; executar as tarefas na ordem, marcando `- [x]`; se a implementação divergir da spec, parar e atualizar a spec primeiro; ao final, validar os critérios de aceite e reportar o que foi verificado.

### Assistente

**Fundação.** Instalei `react-router` (8.5.1) e criei `tokens.css`, `base.css`, o novo `index.html` (com `lang="pt-BR"` e o script anti-flash) e `tokens.test.ts`.

- O teste de contraste **reprovou** a secundária clara `#0EA5E9` (2,77:1 sobre a superfície, abaixo de 3:1). Como a spec permite ajustar tons para atingir AA, troquei para `#0B86C4` e registrei o ajuste na própria spec.

**Tema.** Criei `theme.ts`, `ThemeProvider`, `ThemeToggle` (`radiogroup` com setas), os ícones inline e os testes (escolha manual prevalece, "Claro" persiste, o sistema muda sem recarregar). A revelação circular usa `startViewTransition` e é desligada com movimento reduzido.

**Componentes.** `Button`, `Spinner`, `Skeleton`, `TextField`, `Card`, `Badge` e `Alert`, com CSS Modules e testes concisos.

**Layout.** `navItems`, `Sidebar`, `Header` e `AppLayout`. O menu é fixo e recolhível no desktop e vira drawer abaixo de 1024 px (fecha ao navegar, ao tocar fora e com `Esc`). Escrevi três testes de layout.

**Páginas.** `Home`, `DesignSystem` (paleta, tipografia, espaçamento/raios/sombras, componentes e animações), rotas em `App.tsx` e o novo `App.test.tsx`.

**Correções no caminho:**

- Três testes falhavam por falta de limpeza do DOM entre testes (o Vitest está com `globals: false`); adicionei `afterEach(cleanup)` em `setupTests.ts`.
- `tsc` não achava `node:fs` no teste de contraste; adicionei `node` aos `types` do tsconfig.
- Um aviso do lint sobre exportar hook junto de componente foi resolvido movendo contexto e `useTheme` para `themeContext.ts`.

**Docker.** `docker compose up --build -d frontend` subiu, mas o navegador mostrou "Failed to resolve import react-router". O volume anônimo `/app/node_modules` guardava a instalação antiga. Subi de novo com `-V` (renova o volume) e anotei o aprendizado no plano.

**Verificação no navegador (Browser pane, via Docker):**

- Desktop: tema escuro seguindo o sistema; "Claro" persiste após recarregar; recolher o menu persiste (72 px).
- Celular (375 px): sem rolagem horizontal; menu oculto, botão visível, seletor de tema à direita; o drawer abre com fundo esmaecido e fecha ao tocar fora.
- Tablet (800 px): menu recolhido, aberto por botão, sem rolagem horizontal.
- Um screenshot da Home saiu vazio por causa da animação de entrada em andamento; conferi a opacidade e um novo screenshot mostrou a página completa.

**Fechamento.** Marquei as 27 tarefas e os critérios da spec; `npm test` (16 testes), `npm run lint` e `npm run build` passaram.

**Resposta final:**

Implementei as 27 tarefas do design system e todas estão marcadas em `tasks.md`. Os 16 testes, o lint e o build passam, e o frontend sobe no Docker em `:5173`. Não commitei nada.

- **O que foi feito (tudo em `frontend/`):** tokens e estilos; tema Sistema/Claro/Escuro com persistência, anti-flash e revelação circular; componentes base; layout com menu lateral recolhível e drawer; Home e catálogo `/design-system`. A única dependência nova é o `react-router`.
- **Verificado:** testes, lint e build; as duas rotas no Docker; tema escuro seguindo o sistema e "Claro" persistindo; sem rolagem horizontal em 375 px e 800 px; menu recolhido e aberto por botão no celular e no tablet; recolher no desktop persistindo.
- **Não verificado em tela:** movimento reduzido (só confirmei por teste que o CSS zera as durações) e ausência de flash de tema (conferi o script inline e a persistência, mas não observei o primeiro quadro). Marquei todos os critérios da spec como concluídos, mas esses dois ficam com essa ressalva.
- **Ajustes fora do plano:** secundária clara de `#0EA5E9` para `#0B86C4` (contraste, registrado na spec); `docker compose up --build -V` por causa do volume de `node_modules` (anotado no plano); `cleanup` do RTL e `node` nos `types` do tsconfig.

O container do frontend continua rodando.

---

## 4. Usuário

> faça o commit

### Assistente

**Ação:** `git add -A` e commit na `main`, incluindo o código do frontend e a spec, o plano e as tarefas da feature 002. Mensagem em português, com a linha `Co-Authored-By`.

**Resposta final:**

Commit feito na `main`: `77fc708` — "Implementa design system: temas, componentes e menu lateral (spec 002)". Ele inclui o código do frontend e a spec, o plano e as tarefas da feature 002. Não fiz push.

---

## 5. Usuário

> exporte essa sessão toda para um arquivo .md na pasta ./docs use a nomenclatura NN-nome-da-sessao.md

### Assistente

Verifiquei a pasta `docs/` (já havia `01-sessao-estrutura-sdd.md`, `02-sessao-skills-dotnet-react.md` e `03-sessao-spec-design-system.md`), segui o mesmo formato e a numeração, e gravei este arquivo como `docs/04-sessao-implementacao-design-system.md`.
