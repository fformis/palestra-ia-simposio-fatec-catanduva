# Spec: Remover exemplos de Design System da Home

- **ID:** 008-remover-design-system-home
- **Status:** implementada
- **Data:** 2026-11-17

## Contexto e objetivo
Hoje a Home exibe um cartão "Design System" que apresenta o catálogo de componentes e leva à página de exemplos (spec 002, RF-15). Esse conteúdo é material de referência para a equipe e de demonstração, e não é algo que a pessoa usuária final precise ver na tela inicial. O objetivo é deixar a Home limpa, sem a exibição/atalho dos exemplos de design system.

Público: pessoas usuárias do app (Home mais enxuta) e a equipe (o catálogo deixa de ser promovido na tela inicial).

## Histórias de usuário
- Como usuário, quero uma Home sem conteúdo de exemplos técnicos, para focar no que é relevante do app.
- Como pessoa da equipe, quero que a Home não exiba mais o cartão do Design System, para que a tela inicial reflita apenas funcionalidades do produto.

## Requisitos funcionais
- **RF-01:** A Home não exibe mais o cartão/seção "Design System" nem qualquer atalho ou link para os exemplos de design system.
- **RF-02:** O restante da Home (título e texto de boas-vindas) permanece inalterado, sem espaços vazios ou elementos quebrados onde o cartão estava.
- **RF-03:** A página de catálogo (`/design-system`) continua existindo e funcionando exatamente como hoje, acessível **apenas por URL direta** (sem link na Home, no menu ou em qualquer outra tela).
- **RF-04:** A spec 002 (RF-14 e RF-15, que dizem que o catálogo é acessado pela Home) deve ser atualizada para refletir que o acesso passa a ser somente por URL direta.

## Requisitos não funcionais
- **RNF-01:** A mudança não afeta tema claro/escuro, menu lateral nem responsividade da Home nas três faixas (celular, tablet, desktop).

## Critérios de aceite
- [ ] Dado um usuário na Home, quando a página carrega, então não há cartão, título, texto ou link referentes ao "Design System".
- [ ] Dado a Home nos temas claro e escuro e nas três faixas de largura, quando exibida, então o layout continua íntegro (sem lacunas ou rolagem horizontal).
- [ ] Dado que digito `/design-system` na URL, quando a página carrega, então o catálogo é exibido normalmente nos dois temas.
- [ ] Dado o menu lateral e as demais telas, quando navego pelo app, então nada além da Home foi alterado e não há link para `/design-system`.

## Fora de escopo
- Alterar o conteúdo de boas-vindas da Home ou adicionar novos elementos a ela.
- Alterar o design system em si (tokens, componentes, tema) ou a página de catálogo.
- Criar outro ponto de acesso ao catálogo (menu, rodapé etc.).

## Questões em aberto
Nenhuma.
