# Spec: Design System

- **ID:** 002-design-system
- **Status:** aprovada
- **Data:** 2026-11-11

## Contexto e objetivo
O app web precisa de uma identidade visual única e consistente, para que as futuras funcionalidades sejam construídas com a mesma linguagem (cores, tipografia, espaçamento, componentes, movimento) sem retrabalho nem decisões visuais ad hoc. Esta feature define o design system e a **estrutura base de navegação** (menu lateral esquerdo) sobre a qual as demais funcionalidades serão encaixadas.

Público: pessoas usuárias do app em desktop, tablet e celular, em qualquer condição de iluminação; e a equipe que construirá as próximas features.

## Histórias de usuário
- Como usuário, quero que o app respeite o tema (claro/escuro) do meu sistema, para ter conforto visual sem configurar nada.
- Como usuário, quero poder alternar manualmente entre claro e escuro, para escolher o que prefiro independentemente do sistema.
- Como usuário, quero um menu lateral à esquerda com as principais funcionalidades, para navegar rapidamente.
- Como usuário de celular ou tablet, quero que o layout e o menu se adaptem à minha tela, para usar o app confortavelmente.
- Como usuário sensível a movimento, quero que as animações sejam reduzidas ou desligadas, para não me incomodar.
- Como desenvolvedor, quero um catálogo de tokens e componentes padronizados, para construir novas telas de forma consistente.

## Requisitos funcionais
- **RF-01 — Tema claro e escuro:** o app possui os dois temas, cobrindo todos os elementos do design system.
- **RF-02 — Tema padrão:** na primeira visita, o tema inicial segue a preferência do sistema operacional/navegador do usuário; se a preferência do sistema mudar enquanto o app está aberto e o usuário não escolheu manualmente, o app acompanha.
- **RF-03 — Escolha manual:** o usuário pode escolher entre "Sistema", "Claro" e "Escuro"; a escolha é lembrada nas próximas visitas.
- **RF-04 — Sem "flash" de tema:** ao carregar, o app já aparece no tema correto (sem piscar o tema errado).
- **RF-05 — Paleta de cores:** o design system adota a **paleta A "Índigo"** (marca/primária, secundária, fundo, superfície, texto, borda, e estados: sucesso, alerta, erro, informação), com valores para cada tema, conforme a seção "Paleta aprovada".
- **RF-06 — Tipografia, espaçamento e forma:** fonte neutra (sem fonte de marca; sem dependência de fontes externas pesadas), escala tipográfica, escala de espaçamento, raios de borda e elevações (sombras) definidos e únicos para o app.
- **RF-07 — Componentes base:** catálogo mínimo documentado e visível: botão (variantes e estados), campo de texto, cartão, badge/etiqueta, alerta/aviso, e o seletor de tema.
- **RF-08 — Animações e efeitos:** conjunto padronizado de durações, curvas de movimento e efeitos reutilizáveis, com perfil **expressivo** (aprovado) para valorizar a demonstração. Ver "Animações e efeitos".
- **RF-09 — Movimento reduzido:** se o usuário tiver preferência por movimento reduzido no sistema, animações não essenciais são desativadas ou simplificadas.
- **RF-10 — Layout responsivo:** o app se adapta a, no mínimo, três faixas: celular, tablet e desktop, sem rolagem horizontal da página.
- **RF-11 — Menu lateral esquerdo:** em desktop, exibe menu fixo à esquerda com os itens das principais funcionalidades, indicando visualmente o item ativo e levando à respectiva tela.
- **RF-12 — Menu em telas pequenas:** em celular **e tablet**, o menu lateral fica recolhido e é aberto por um botão, sobrepondo o conteúdo, e fecha ao navegar ou ao tocar fora.
- **RF-13 — Menu recolhível no desktop:** o usuário pode recolher o menu para uma versão compacta (apenas ícones) e expandi-lo novamente; a escolha é lembrada.
- **RF-14 — Itens do menu:** o menu contém apenas **Home** nesta feature (Logout fica para quando houver autenticação). No topo do menu há um **placeholder de logotipo** (bloco/ícone genérico + nome textual provisório), fácil de substituir depois. A página de catálogo (RF-15) fica acessível a partir da Home. Novos itens serão adicionados pelas features futuras.
- **RF-16 — Seletor de tema no cabeçalho:** o seletor de tema (RF-03) fica no cabeçalho, no canto superior direito, visível em todas as telas e faixas de largura.
- **RF-15 — Página de catálogo:** uma tela "Design System" (acessada pela Home) exibe paletas, tipografia, componentes e animações nos dois temas, servindo de referência viva e de demonstração.

## Paleta aprovada
**Paleta A — "Índigo" (aprovada):** moderna e neutra, boa legibilidade.
| Papel | Claro | Escuro |
|---|---|---|
| Primária | #4F46E5 | #818CF8 |
| Secundária (destaque) | #0B86C4 | #38BDF8 |
| Fundo | #F8FAFC | #0B1020 |
| Superfície (cartões, menu) | #FFFFFF | #151B2E |
| Texto principal | #0F172A | #E6EAF5 |
| Texto secundário | #475569 | #9AA4BF |
| Borda | #E2E8F0 | #26304A |
| Sucesso / Alerta / Erro / Info | #16A34A / #D97706 / #DC2626 / #0284C7 | #4ADE80 / #FBBF24 / #F87171 / #38BDF8 |

O tema escuro usa fundos azulados bem escuros (não preto puro) e cores de destaque mais claras para manter o contraste. Os valores podem ser ajustados na implementação apenas se necessário para atingir o contraste AA (RNF-01). Ajuste feito na implementação: a secundária clara passou de #0EA5E9 (2,77:1 sobre a superfície) para #0B86C4, para atingir 3:1.

## Animações e efeitos (perfil expressivo)
- **Durações:** rápida (~150 ms, hover/foco), média (~300 ms, abrir/fechar menu, modais), lenta (~600 ms, entrada de página/conteúdo e destaques).
- **Curvas:** suave de saída para entradas (desacelera ao chegar), suave de entrada para saídas, e uma leve "mola" para microinterações de destaque.
- **Efeitos reutilizáveis:**
  - Transição suave entre tema claro e escuro (cores em ~200 ms).
  - Hover em botões e cartões: leve elevação e/ou realce de cor.
  - Anel de foco visível e animado em elementos interativos.
  - Menu lateral: deslizar com esmaecer do fundo (celular) e expandir/recolher com transição de largura (desktop).
  - Entrada de conteúdo: aparecer com leve subida (fade + translação curta); itens de listas/cartões em cascata (escalonados).
  - Indicador do item ativo do menu que desliza entre itens.
  - Feedback de clique: leve "afundar" (escala ~0,97) no botão.
  - Carregamento: esqueleto com brilho (shimmer) e indicador giratório.
  - Realce sutil (brilho/gradiente) na cor primária em elementos de destaque.
  - Transição de tema com efeito marcante (ex.: revelação circular a partir do seletor), quando suportado; caso contrário, esmaecimento simples.
  - Brilho/gradiente animado em destaques e cartões ao passar o mouse; ícones com micro-animação no hover.
- **Princípio:** movimento é expressivo, porém nunca bloqueia a interação nem repete indefinidamente sem necessidade; com movimento reduzido (RF-09) tudo é simplificado.

## Requisitos não funcionais
- **RNF-01 — Acessibilidade:** contraste mínimo WCAG 2.1 AA (4,5:1 para texto normal, 3:1 para texto grande e componentes de interface) em ambos os temas; navegação completa por teclado; foco sempre visível.
- **RNF-02 — Semântica:** o menu é navegável por leitores de tela (região de navegação identificada, item ativo indicado, botão de abrir/fechar com rótulo).
- **RNF-03 — Desempenho:** troca de tema e animações sem travamentos perceptíveis; animações não bloqueiam a interação.
- **RNF-04 — Consistência:** nenhuma tela usa cores, espaçamentos ou durações fora do que o design system define.
- **RNF-05 — Alvos de toque:** elementos interativos com área mínima confortável em telas de toque (~44 px).
- **RNF-06 — Idioma:** textos da interface em português do Brasil.
- **RNF-07 — Execução:** funciona com `docker compose up` (constituição, seção 12).

## Critérios de aceite
- [x] **RF-02:** Dado que o sistema do usuário está em modo escuro e ele nunca escolheu tema, quando abre o app, então o app aparece em tema escuro desde o primeiro quadro (sem piscar claro); o mesmo vale para o claro.
- [x] **RF-03:** Dado que o usuário escolheu "Claro" com o sistema em escuro, quando recarrega a página, então o app permanece em tema claro.
- [x] **RF-02:** Dado que o usuário está em "Sistema", quando a preferência do sistema muda, então o app muda de tema sem recarregar.
- [x] **RF-12:** Dado um tablet, quando o app abre, então o menu está recolhido e abre por botão, como no celular.
- [x] **RF-16:** Dada qualquer largura de tela, quando o app é exibido, então o seletor de tema está no canto superior direito do cabeçalho.
- [x] **RF-11:** Dado um desktop, quando o app abre, então o menu lateral aparece fixo à esquerda e clicar em um item leva à sua tela, destacando-o como ativo.
- [x] **RF-12:** Dado um celular, quando o app abre, então o menu está recolhido; ao tocar no botão ele abre sobre o conteúdo e fecha ao escolher um item ou tocar fora.
- [x] **RF-13:** Dado um desktop, quando o usuário recolhe o menu e recarrega a página, então o menu continua recolhido.
- [x] **RF-10:** Dadas larguras de celular, tablet e desktop, quando o app é exibido, então não há rolagem horizontal e o conteúdo se reorganiza.
- [x] **RF-09:** Dado que o sistema pede movimento reduzido, quando o usuário navega e abre/fecha o menu, então não há animações de deslocamento/escala.
- [x] **RF-15:** Dada a página de catálogo, quando aberta nos dois temas, então exibe paleta, tipografia, componentes e animações definidos.
- [x] **RNF-01:** Dado cada par texto/fundo da paleta aprovada, quando medido, então atinge o contraste mínimo AA nos dois temas.

## Fora de escopo
- Telas e regras de negócio das funcionalidades em si (apenas a estrutura de navegação e o catálogo).
- Autenticação, perfil de usuário e preferências salvas na conta/servidor (a escolha de tema e do menu fica só no dispositivo do usuário).
- Internacionalização para outros idiomas.
- Biblioteca de componentes avançados (tabelas, gráficos, modais complexos, formulários completos).
- Identidade de marca (logotipo, ilustrações) além de um nome/marca textual provisório no menu.
- Autenticação e item de menu Logout (serão tratados em feature própria).

## Questões em aberto
Resolvidas: paleta (A Índigo), tablet (menu recolhido), fonte (neutra), animações (expressivas), seletor de tema (cabeçalho, canto superior direito), itens do menu (somente Home), Logout (adiado), marca (somente placeholder de logo).

Nenhuma questão em aberto.
