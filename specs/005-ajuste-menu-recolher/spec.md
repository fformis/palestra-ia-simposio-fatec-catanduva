# Spec: Ajuste do controle de recolher o menu lateral

- **ID:** 005-ajuste-menu-recolher
- **Status:** implementada
- **Data:** 2026-11-15

## Contexto e objetivo
Hoje o menu lateral (spec 002, RF-13) é recolhido por um botão no **rodapé** do menu, com ícone e o texto "Recolher". Esse botão está longe da marca do app e o texto ocupa espaço sem necessidade. Esta feature **reposiciona e simplifica** o controle: ele passa a ficar **ao lado do nome/logotipo "Palestra IA"**, no topo do menu, e a alternar o estado **apenas com ícone**, sem texto.

Público: qualquer usuário no desktop, onde o menu é recolhível.

## Histórias de usuário
- Como usuário no desktop, quero o controle de recolher o menu junto à marca "Palestra IA", para encontrá-lo facilmente no topo.
- Como usuário, quero que o controle seja apenas um ícone, para que o menu fique mais limpo e compacto.
- Como usuário que usa leitor de tela ou teclado, quero que o controle continue acessível, mesmo sem texto visível.

## Requisitos funcionais
- **RF-01 — Posição:** o controle de recolher/expandir fica no topo do menu, **ao lado** do logotipo e do nome "Palestra IA", e deixa de existir no rodapé do menu.
- **RF-02 — Somente ícone:** o controle exibe apenas um ícone (sem o texto "Recolher" nem qualquer rótulo visível), e o ícone indica a ação disponível (recolher quando expandido, expandir quando recolhido).
- **RF-03 — Alternância:** acionar o controle alterna o menu entre expandido e recolhido (apenas ícones), com a transição já existente; a escolha continua sendo lembrada entre recargas (spec 002, RF-13).
- **RF-04 — Acessibilidade:** apesar de não ter texto visível, o controle tem nome acessível ("Recolher menu" / "Expandir menu"), é operável por teclado e exibe dica (tooltip) ao passar o mouse.
- **RF-05 — Menu recolhido:** com o menu recolhido (largura só de ícones), o controle continua visível e acessível no topo, em uma **linha própria logo abaixo do logotipo**, sem sobreposição nem corte. Com o menu expandido, permanece ao lado de "Palestra IA" (RF-01).
- **RF-06 — Telas pequenas:** em celular e tablet, onde o menu é aberto por botão e fechado pelo botão de fechar (spec 002, RF-12), o comportamento não muda; o novo controle de recolher não aparece nessas faixas.

## Requisitos não funcionais
- **RNF-01:** o controle segue os tokens do design system (cores, foco visível, tamanho mínimo de alvo de toque/clique) nos temas claro e escuro.
- **RNF-02:** o ajuste não altera as demais áreas do menu (perfil do usuário, itens de navegação, Sair).

## Critérios de aceite
- [x] **RF-01:** Dado um desktop com o menu expandido, quando o app abre, então o controle de recolher aparece ao lado de "Palestra IA" e não há mais botão "Recolher" no rodapé.
- [x] **RF-02:** Dado o menu expandido, quando o usuário observa o controle, então ele mostra apenas um ícone, sem o texto "Recolher".
- [x] **RF-03:** Dado o menu expandido, quando o usuário aciona o controle, então o menu passa a mostrar só ícones; acionando de novo, volta ao expandido.
- [x] **RF-03:** Dado o menu recolhido, quando a página é recarregada, então o menu continua recolhido.
- [x] **RF-04:** Dado o foco no controle via teclado, quando o usuário pressiona Enter ou Espaço, então o menu alterna, e o controle é identificado como "Recolher menu" ou "Expandir menu" conforme o estado.
- [x] **RF-05:** Dado o menu recolhido, quando o usuário observa o topo, então o controle aparece em uma linha própria logo abaixo do logotipo, visível e utilizável, sem sobrepô-lo.
- [x] **RF-06:** Dado um celular ou tablet, quando o menu é aberto, então o novo controle de recolher não é exibido.

## Fora de escopo
- Mudar o comportamento de recolher, a persistência da escolha ou as animações já existentes.
- Alterar o logotipo placeholder, os itens do menu ou o botão Sair.
- Atalhos de teclado globais para recolher o menu.

## Questões em aberto
Nenhuma. Resolvida: no menu recolhido, o botão fica em uma linha própria abaixo do logotipo (RF-05).
