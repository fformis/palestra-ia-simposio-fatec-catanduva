# Spec: Feed de vagas

- **ID:** 010-feed-vagas
- **Status:** implementada
- **Data:** 2026-11-20

## Contexto e objetivo
A spec 009 permitiu criar vagas, curtir e se candidatar, mas cada vaga só é acessível pelo endereço da sua própria página: **não existe um lugar onde o usuário encontre as vagas** nem onde o anunciante veja as vagas que criou (ambos deixados para "specs futuras" na 009). A Home, por sua vez, exibe apenas um texto de boas-vindas (spec 008).

Esta feature **substitui a Home por um feed de vagas**, no estilo de redes sociais (cards empilhados, rolagem contínua), com um seletor no cabeçalho para alternar entre **todas as vagas ativas** e **as vagas que eu criei**. Do próprio card, o usuário pode **curtir** e **se candidatar**, sem precisar abrir a página da vaga.

Público: usuários autenticados — como **candidato** (descobre e interage com vagas) e como **anunciante** (acompanha as próprias vagas).

## Histórias de usuário
- Como usuário, quero ver as vagas anunciadas logo ao entrar no app, para descobrir oportunidades sem precisar de um link.
- Como anunciante, quero alternar o feed para ver só as vagas que eu criei, para acompanhá-las em um só lugar.
- Como usuário, quero ver as vagas mais recentes primeiro, para não perder as novidades.
- Como usuário, quero que mais vagas carreguem conforme eu rolo a tela, para navegar sem clicar em "próxima página".
- Como usuário, quero ler um resumo da descrição e expandi-lo quando me interessar, para percorrer o feed rapidamente.
- Como usuário, quero curtir e me candidatar direto no card, para agir sem sair do feed.

## Requisitos funcionais

### Feed na Home
- **RF-01 — Home vira feed:** a tela inicial do app (após o login) passa a ser o feed de vagas; o conteúdo atual da Home (boas-vindas) deixa de existir. O feed só é acessível a usuário autenticado (spec 003, RF-06).
- **RF-02 — Item de menu:** o item **Home** do menu lateral continua com o mesmo rótulo e ícone e passa a levar ao feed.

### Seletor "Todas" / "Minhas"
- **RF-03 — Switch no cabeçalho:** no cabeçalho do feed há um switch de duas posições: **à esquerda, "Todas as vagas"**; **à direita, "Minhas vagas"**. A posição selecionada é indicada visualmente e o feed recarrega do início ao trocar de posição.
- **RF-04 — Posição inicial:** ao abrir o feed, o switch está **sempre** em "Todas as vagas"; a última posição escolhida não é lembrada.
- **RF-05 — "Todas as vagas":** exibe todas as vagas com status **Ativo** (spec 009, RF-09/RF-10), **incluindo as do próprio usuário**.
- **RF-06 — "Minhas vagas":** exibe apenas as vagas criadas pelo usuário logado, **ativas e inativas**. As inativas exibem no card um selo **"Inativa"**.
- **RF-07 — Ordenação:** nas duas visões, as vagas são ordenadas pela **data de criação**, da mais recente para a mais antiga. Vagas com a mesma data/hora mantêm uma ordem estável entre as páginas (nenhuma vaga se repete nem é pulada durante a rolagem).

### Rolagem infinita
- **RF-08 — Paginação de 10 em 10:** o feed carrega as **10** primeiras vagas e, quando o usuário se aproxima do fim da lista, carrega automaticamente as **10** seguintes, até não haver mais vagas.
- **RF-09 — Estados da rolagem:** enquanto uma página carrega, há indicação visual de carregamento; ao chegar ao fim, o feed indica que não há mais vagas; em caso de falha, exibe mensagem com opção de tentar novamente, sem perder as vagas já exibidas.
- **RF-10 — Feed vazio:** sem vagas na visão selecionada, o feed exibe uma mensagem amigável. Em "Minhas vagas" vazia, a mensagem convida a criar uma vaga (item **Criar**, spec 009 RF-01).

### Card da vaga
- **RF-11 — Layout do card:** cada vaga é exibida em um card no estilo de feed de rede social, **centralizado horizontalmente no espaço de conteúdo** (desconsiderando o menu lateral), com largura máxima confortável para leitura e ocupando a largura disponível em telas estreitas. O card tem, de cima para baixo: **cabeçalho**, **imagem** (opcional), **descrição** e **ações**.
- **RF-12 — Cabeçalho do card:** exibe foto (ou iniciais) e nome do anunciante, data de criação (dd/mm/aaaa), **cargo** e **empresa** (quando informada).
- **RF-13 — Demais informações da vaga:** o card exibe o **regime de contratação**, o **valor** ("R$ 5.000,00 / mês") e as contagens de **curtidas** e **candidatos** (spec 009, RF-13/RF-20). Os benefícios aparecem só na página da vaga.
- **RF-14 — Imagem:** quando a vaga tem imagem, ela é exibida entre o cabeçalho e a descrição. Vaga **sem imagem** não tem área de imagem no card (a ilustração padrão da spec 009 continua só na página da vaga).
- **RF-15 — Descrição resumida:** a descrição é exibida com sua formatação (spec 009, RF-03), limitada a **3 linhas**. Quando o texto ultrapassa 3 linhas, aparece a ação **"ver mais"**, que expande o card exibindo a descrição completa; o card expandido oferece **"ver menos"** para recolher. Descrições que cabem em 3 linhas não exibem "ver mais".
- **RF-16 — Acesso à página da vaga:** o **cargo** no cabeçalho do card é um link para a página da vaga (spec 009, RF-11).

### Ações no card
- **RF-17 — Curtir:** o card tem o botão **Curtir**, com o mesmo comportamento da página da vaga (spec 009, RF-12 a RF-14): alterna curtir/descurtir, indica o estado atual e não está disponível nas vagas do próprio usuário.
- **RF-18 — Candidatar-se:** o card tem o botão **Candidatar-se**, com as mesmas regras da página da vaga (spec 009, RF-15, RF-16 e RF-19): exige perfil mínimo, pede confirmação e não está disponível nas vagas do próprio usuário.
- **RF-19 — Já candidatado:** se o usuário já está candidatado, o card mostra a ação **"Desistir"** no lugar de "Candidatar-se", com confirmação, como na página da vaga (spec 009, RF-17 e RF-21).
- **RF-20 — Ações nas minhas vagas:** nos cards das vagas do próprio usuário não há ações de curtir nem de candidatar-se, e nenhuma outra ação é adicionada; editar, alterar status e ver candidatos continuam na página da vaga, acessível pelo cargo (RF-16).
- **RF-21 — Atualização imediata:** após curtir, descurtir, candidatar-se ou desistir no card, o estado (e as contagens, se exibidas) é atualizado imediatamente, sem recarregar o feed nem perder a posição de rolagem.

## Requisitos não funcionais
- **RNF-01 — Desempenho percebido:** cada página de 10 vagas carrega rapidamente, e a rolagem não "salta" nem duplica cards quando novas vagas chegam.
- **RNF-02 — Privacidade (constituição §6):** o feed não expõe vagas inativas de outros anunciantes (spec 009, RF-10), nem dados de candidatos; do anunciante, só foto e nome (RF-12).
- **RNF-03 — Segurança da descrição:** a descrição formatada exibida no card segue a spec 009, RNF-03 (nenhum conteúdo ativo).
- **RNF-04 — Consistência visual:** feed e cards usam os componentes, temas (claro/escuro), responsividade e animações do design system (spec 002), funcionando em celular, tablet e desktop, com o menu expandido ou recolhido.
- **RNF-05 — Acessibilidade:** switch operável por teclado e com estado anunciado ("Todas as vagas"/"Minhas vagas"); "ver mais"/"ver menos" com nome acessível e estado de expansão; botões de curtir e candidatar-se com nome que indica o estado (spec 009, RNF-06); novas vagas carregadas também alcançáveis por teclado; contraste AA.
- **RNF-06 — Idioma e formato:** interface em português do Brasil; datas e valores no padrão brasileiro.
- **RNF-07 — Tudo via Docker (constituição §12):** funciona com `docker compose up`, sem pré-requisitos locais.

## Critérios de aceite
- [x] **RF-01:** dado um usuário logado, quando acessa a tela inicial, então vê o feed de vagas e não o texto de boas-vindas; dado um visitante sem sessão, então é levado ao login.
- [x] **RF-03/RF-05:** dadas vagas ativas e inativas de outros anunciantes, quando o switch está em "Todas as vagas", então só as ativas aparecem.
- [x] **RF-03/RF-06:** dado um usuário que criou 2 vagas, quando move o switch para "Minhas vagas", então vê exatamente essas 2 vagas e nenhuma de outros anunciantes.
- [x] **RF-07:** dadas vagas criadas em datas diferentes, quando o feed carrega, então a mais recente aparece primeiro e a mais antiga por último.
- [x] **RF-08:** dadas 25 vagas ativas, quando o feed abre, então exibe 10; ao rolar até o fim, passa a exibir 20; ao rolar de novo, 25, com indicação de que não há mais vagas, sem nenhuma vaga repetida.
- [x] **RF-10:** dado um usuário sem vagas criadas, quando seleciona "Minhas vagas", então vê a mensagem de feed vazio com o convite para criar uma vaga.
- [x] **RF-06:** dado um usuário com uma vaga ativa e uma inativa, quando seleciona "Minhas vagas", então vê as duas, e a inativa com o selo "Inativa"; em "Todas as vagas", vê só a ativa.
- [x] **RF-12/RF-13/RF-16:** dada uma vaga "Dev .NET" na empresa "Acme", regime CLT e valor 5000, então o card exibe anunciante, data, "Dev .NET", "Acme", "CLT", "R$ 5.000,00 / mês" e as contagens; ao clicar no cargo, abre a página da vaga.
- [x] **RF-14:** dada uma vaga com imagem, então o card exibe a imagem entre o cabeçalho e a descrição; dada uma vaga sem imagem, então o card não tem área de imagem.
- [x] **RF-15:** dada uma vaga cuja descrição ocupa mais de 3 linhas, quando o card é exibido, então mostra só 3 linhas e "ver mais"; ao acionar, mostra a descrição completa e "ver menos"; dada uma descrição curta, então "ver mais" não aparece.
- [x] **RF-17/RF-21:** dado um card de vaga de outro anunciante, quando o usuário curte, então o botão passa a "Descurtir" sem recarregar o feed nem mudar a posição de rolagem.
- [x] **RF-18/RF-19:** dado um usuário com perfil mínimo, quando aciona "Candidatar-se" no card e confirma, então a candidatura é registrada, a contagem de candidatos aumenta em 1 e o card passa a mostrar "Desistir"; dado um usuário sem perfil mínimo, então vê a mensagem da spec 009 (RF-15) e a candidatura não é feita.
- [x] **RF-17/RF-18:** dado um card de vaga do próprio usuário, então as ações de curtir e candidatar-se não estão disponíveis.
- [x] **RF-11:** dado o feed em desktop com o menu expandido e recolhido, e em celular, então o card fica centralizado no espaço de conteúdo, sem rolagem horizontal.

## Fora de escopo
- Busca, filtros (regime, valor, benefícios) e recomendação de vagas.
- Outras ordenações além da data de criação.
- Atualização em tempo real do feed (novas vagas aparecem ao recarregar ou trocar o switch).
- Comentários, compartilhamento e lista de quem curtiu.
- Edição, alteração de status ou lista de candidatos diretamente no card (ficam na página da vaga).
- Exibição dos benefícios no card.
- Lembrar a posição do switch entre visitas.
- Alterações na página da vaga, no formulário de criação/edição ou nas regras de curtidas e candidaturas da spec 009.

## Decisões registradas
- Item de menu mantém o rótulo **Home**.
- Switch sempre começa em "Todas as vagas" (não lembra a escolha).
- "Todas as vagas" inclui as vagas ativas do próprio usuário.
- "Minhas vagas" inclui as inativas, com selo "Inativa".
- Cabeçalho do card: foto/iniciais e nome do anunciante, data, cargo e empresa.
- Card exibe regime, valor e contagens de curtidas e candidatos; benefícios só na página da vaga.
- Vaga sem imagem: card sem área de imagem.
- O cargo é o link para a página da vaga.
- Já candidatado: card mostra "Desistir".
- Nas minhas vagas, o card não ganha ações extras.

## Questões em aberto
Nenhuma.
