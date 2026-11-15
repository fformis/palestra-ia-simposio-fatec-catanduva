# Tarefas: Ajuste do controle de recolher o menu lateral

- **Plano:** ./plan.md
- **Spec:** ./spec.md

Formato: `- [ ] T-01 [RF-01] descrição (arquivo/área) — Verificação: …`

Ordem por dependência: Frontend (marcação → estilo → teste) → Validação. Não há tarefas de Backend nem de Docker (nenhuma mudança).

## Backend
Nenhuma tarefa.

## Frontend
- [x] T-01 [RF-01, RF-02, RF-04] Em `frontend/src/layout/Sidebar.tsx`, mover o botão de recolher do rodapé para dentro de `.top`, após `.brand`; deixar só `<ChevronIcon />` (remover o texto "Recolher"), manter `aria-label` e `aria-pressed` e adicionar `title` com o mesmo texto do `aria-label` — Verificação: `npm test` e `npm run build` passam; o teste existente "recolher o menu é lembrado após recarregar" continua verde.
- [x] T-02 [RF-01, RF-03, RF-05, RNF-01] Em `frontend/src/layout/Sidebar.module.css`, ajustar `.collapseBtn` (botão quadrado `var(--touch-target)`, centralizado, sem padding/gap de texto), manter `.top` em `space-between` quando expandido e, no desktop com `.collapsed`, usar `flex-direction: column; gap: var(--space-2)` (botão em linha própria abaixo do logotipo); limpar as referências antigas ao `.collapseBtn` de rodapé — Verificação: no navegador (desktop, claro e escuro), expandido = botão ao lado de "Palestra IA"; recolhido = botão logo abaixo do logotipo, sem corte nem sobreposição.
- [x] T-03 [RF-06] Conferir que `.collapseBtn` segue `display: none` abaixo de 1024px — Verificação: no navegador em celular e tablet, o menu aberto mostra só "Fechar menu"; o botão de recolher não aparece.
- [x] T-04 [RF-01, RF-02] Em `frontend/src/layout/layout.test.tsx`, adicionar teste curto: o botão "Recolher menu" não tem texto visível e está no mesmo cabeçalho que "Palestra IA" — Verificação: `cd frontend && npm test` passa com o novo teste.

## Docker / infra
Nenhuma tarefa.

## Validação
- [x] T-05 Executar os critérios de aceite da spec — Verificação: `cd frontend && npm test` verde; conferência manual no navegador (desktop expandido/recolhido, recarregar mantém recolhido, teclado com Enter/Espaço, tooltip ao passar o mouse, celular e tablet sem o botão); marcar os critérios em `spec.md` e atualizar o status para "implementada".
