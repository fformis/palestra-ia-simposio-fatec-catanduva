# Plano: Ajuste do controle de recolher o menu lateral

- **Spec:** ./spec.md

## Decisões técnicas
| Decisão | Escolha | Justificativa |
|---|---|---|
| Local do botão | Mover o `<button>` de recolher do rodapé para dentro do bloco `.top` de `Sidebar.tsx`, ao lado de `.brand` | RF-01; mesma linha que já abriga o botão "Fechar menu" (mobile), sem novo componente |
| Somente ícone | Remover o `<span className={styles.label}>Recolher</span>`; manter `ChevronIcon` | RF-02; o ícone já gira 180° ao recolher (indica a ação disponível) |
| Acessibilidade | Manter `aria-label` ("Recolher menu"/"Expandir menu") e `aria-pressed`; adicionar `title` com o mesmo texto | RF-04; tooltip nativo, sem dependência |
| Layout recolhido | No desktop recolhido, `.top` vira coluna (`flex-direction: column`): logotipo "P" em cima, botão em linha própria abaixo, centralizados | RF-05 (decidido na spec) |
| Estilo do botão | Botão quadrado `min-width/height: var(--touch-target)`, centralizado (como `.closeBtn`), tokens do design system | RNF-01 |
| Mobile/tablet | Sem mudança: `.collapseBtn` segue `display: none` abaixo de 1024px | RF-06 |
| Persistência/estado | Inalterados (`collapsed`, `onToggleCollapsed` e armazenamento já existentes) | RF-03; fora de escopo |

## Arquitetura
Apenas frontend. Sem mudança em props, estado, rotas ou contratos. Alterações restritas a `frontend/src/layout/Sidebar.tsx` e `Sidebar.module.css`.

## Contratos
Nenhum. Sem alteração de API nem de tipos.

## Impacto por camada (backend)
Nenhum (Domain, Application, Infrastructure e Api intocados).

## Frontend
- **`Sidebar.tsx`:**
  - Em `.top`, após `.brand`, renderizar o botão de recolher (`styles.collapseBtn`) com `aria-label`, `aria-pressed`, `title` e apenas `<ChevronIcon />` dentro de `.chevron`; o botão "Fechar menu" permanece.
  - Remover o botão do rodapé (e o texto "Recolher").
- **`Sidebar.module.css`:**
  - `.collapseBtn`: justificar ao centro, largura mínima `var(--touch-target)`, sem padding lateral/gap de texto.
  - `.top`: manter `space-between` expandido; no `@media (min-width: 1024px)` com `.collapsed`, `flex-direction: column; gap: var(--space-2)` (substitui o `justify-content: center` atual).
  - Remover do seletor `.collapsed ...` as referências ao `.collapseBtn` que serviam ao botão de rodapé com texto (`justify-content: center; padding: 0` passa a valer no próprio `.collapseBtn`).
  - Conferir que `.collapsed .top` não corta o botão (a sidebar tem `overflow: hidden`).
- **Testes (`layout.test.tsx`):** o teste existente de lembrar o recolhimento continua válido (usa o `aria-label`). Adicionar um teste curto: o botão "Recolher menu" não exibe texto visível e está no cabeçalho do menu (mesmo contêiner de "Palestra IA"), não no rodapé (RF-01/RF-02).

## Modelo de dados (EF Core Code First)
Nenhum. Sem migration.

## Docker
Nenhuma mudança.

## Verificação da constituição
- [x] Spec primeiro — spec 005 revisada, sem pendências
- [x] Simplicidade — só move um botão e ajusta CSS; sem novos componentes ou dependências
- [x] Verificabilidade — cada RF tem critério de aceite; um teste novo + o existente cobrem RF-01 a RF-04; RF-05/RF-06 por verificação visual
- [x] Dependências da Arquitetura Limpa respeitadas — backend não afetado
- [x] Roda via docker compose — sem mudança de infraestrutura

## Riscos
- Menu recolhido: `.top` em coluna aumenta a altura do cabeçalho e empurra o conteúdo abaixo; validar visualmente que nada fica cortado (sidebar com `overflow: hidden`).
- Testes jsdom não avaliam CSS: RF-05 e RF-06 (posição recolhida e ocultação no mobile) exigem conferência manual em desktop e celular/tablet.
- Largura do cabeçalho expandido: logotipo + nome + botão precisam caber em `--sidebar-width` sem quebra de linha (`white-space: nowrap` já aplicado).
