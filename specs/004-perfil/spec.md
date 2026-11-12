# Spec: Perfil profissional em linha do tempo

- **ID:** 004-perfil
- **Status:** implementada
- **Data:** 2026-11-11

## Contexto e objetivo
O usuário já se identifica no sistema (spec 003), mas ainda não tem onde registrar **quem ele é profissionalmente**. Esta feature entrega a tela de **edição do perfil**, na qual o usuário mantém seus dados profissionais — foto, bio, ocupações, formações e cursos — e os vê organizados em **linha do tempo**, do mais recente ao mais antigo, contando sua trajetória.

O acesso se dá clicando no **nome do usuário** exibido no topo do menu lateral (spec 003, RF-22), que passa a levar ao perfil.

Público: qualquer usuário autenticado, editando o **próprio** perfil.

## Histórias de usuário
- Como usuário logado, quero clicar no meu nome no menu para abrir meu perfil, para editar meus dados profissionais.
- Como usuário, quero enviar e trocar minha foto de perfil, para me identificar visualmente.
- Como usuário, quero escrever uma bio, para me apresentar em poucas palavras.
- Como usuário, quero adicionar, editar e remover quantas ocupações eu tiver, para registrar meu histórico de trabalho.
- Como usuário, quero adicionar, editar e remover quantas formações eu tiver, para registrar minha trajetória acadêmica.
- Como usuário, quero adicionar, editar e remover quantos cursos eu tiver, para registrar minha capacitação complementar.
- Como usuário, quero ver ocupações, formações e cursos em uma linha do tempo, para entender minha trajetória em ordem cronológica.

## Requisitos funcionais

### Acesso
- **RF-01 — Entrada pelo menu:** o nome (e sobrenome) do usuário no topo do menu lateral é clicável e leva à tela de **Perfil**; no menu compacto, o mesmo vale para a versão reduzida (iniciais). A tela só é acessível a usuário autenticado (spec 003, RF-06).
- **RF-02 — Perfil próprio:** o usuário visualiza e edita apenas o seu próprio perfil.

### Foto de perfil
- **RF-03 — Enviar/trocar foto:** o usuário pode enviar uma imagem como foto de perfil e substituí-la por outra a qualquer momento. A foto aparece no topo do perfil.
- **RF-04 — Remover foto:** o usuário pode remover a foto; sem foto, é exibido um avatar padrão com as **iniciais** do nome.
- **RF-05 — Validação da foto:** só são aceitas imagens de formatos comuns (JPG, PNG, WebP) até **2 MB**; arquivo inválido ou grande demais é recusado com mensagem clara e a foto atual é mantida.

### Bio
- **RF-06 — Bio:** campo de texto livre, opcional, com limite de **500 caracteres**, com contador de caracteres restantes.

### Ocupações
- **RF-07 — Lista de ocupações:** o usuário pode ter **N** ocupações. Cada uma possui: **cargo** (obrigatório), **empresa** (obrigatório), **data de início** (mês/ano, obrigatório), **data de término** (mês/ano, opcional) e **descrição** (texto, opcional).
- **RF-08 — Ocupação atual:** ocupação sem data de término é considerada **atual** e exibida como "até o momento" na linha do tempo.
- **RF-09 — Gerir ocupações:** o usuário pode adicionar, editar e remover ocupações. A remoção pede confirmação.

### Formações
- **RF-10 — Lista de formações:** o usuário pode ter **N** formações. Cada uma possui: **instituição** (obrigatória), **curso/área** (nome do curso, obrigatório; ex.: "Análise e Desenvolvimento de Sistemas"), **nível de formação** (obrigatório, um de: fundamental, médio, técnico, superior, pós/MBA, mestrado, doutorado), **data de início** (mês/ano, obrigatória), **data de término** (mês/ano, opcional) e **descrição** (texto, opcional).
- **RF-11 — Formação em andamento:** formação sem data de término é considerada **em andamento** e exibida como "até o momento".
- **RF-12 — Gerir formações:** adicionar, editar e remover, com confirmação na remoção.
### Cursos
- **RF-13 — Lista de cursos:** o usuário pode ter **N** cursos. Cada um possui: **curso** (nome, obrigatório), **instituição** (obrigatória), **quantidade de horas** (número inteiro positivo, obrigatório), **data de início** (mês/ano, obrigatória) e **data de término** (mês/ano, opcional).
- **RF-14 — Gerir cursos:** adicionar, editar e remover, com confirmação na remoção.
- **RF-14a — Descrição em cursos:** a descrição inicial não prevê descrição para cursos (diferente de ocupação e formação); cursos não possuem descrição nesta feature.

### Datas
- **RF-15 — Formato mês/ano:** todas as datas são informadas e exibidas como **mês/ano** (ex.: 03/2021), sem dia.
- **RF-16 — Consistência de datas:** o término não pode ser anterior ao início; o início não pode estar no futuro; o término **pode** ser futuro (conclusão prevista), caso em que o item é exibido com o período informado.

### Linha do tempo
- **RF-17 — Exibição em linha do tempo:** o perfil apresenta, para cada seção (ocupações, formações, cursos), os itens em **linha do tempo**, do mais recente ao mais antigo (ordenados pela data de início; empate resolvido pela data de término, itens atuais primeiro). Cada item mostra seus dados e o período "mês/ano — mês/ano" ou "mês/ano — até o momento".
- **RF-18 — Uma linha do tempo por seção:** ocupações, formações e cursos têm cada um a sua própria linha do tempo; os itens de seções diferentes não são misturados.
- **RF-19 — Estado vazio:** seção sem itens exibe mensagem convidativa e a ação de adicionar.

### Salvamento
- **RF-20 — Salvamento por item:** cada adição, edição ou remoção de item, a bio e a foto são salvas individualmente ao serem confirmadas (não há um botão "Salvar" único para o perfil todo), com confirmação visual de sucesso e mensagem clara em caso de erro.
- **RF-21 — Persistência:** os dados ficam guardados na conta do usuário: ao sair e entrar de novo (ou em outro dispositivo), o perfil continua o mesmo.
- **RF-22 — Validação:** campos obrigatórios vazios ou inválidos mostram erro junto ao campo e impedem o salvamento do item.

### Visibilidade
- **RF-23 — Perfil privado:** nesta feature, **somente o próprio usuário** vê e acessa o seu perfil.

## Requisitos não funcionais
- **RNF-01 — Privacidade (constituição §6):** foto, bio e histórico profissional são dados pessoais coletados por declaração do usuário, com a necessidade declarada nesta spec (apresentar sua trajetória profissional); só o próprio usuário os acessa (RF-02, RF-23).
- **RNF-02 — Segurança da foto:** apenas imagens são aceitas; o conteúdo enviado nunca é executado nem tratado como outro tipo de arquivo.
- **RNF-03 — Consistência visual:** a tela usa os componentes, temas (claro/escuro), responsividade e animações do design system (spec 002), funcionando em celular, tablet e desktop.
- **RNF-04 — Acessibilidade:** campos com rótulos associados, erros anunciáveis por leitores de tela, navegação completa por teclado, foto com texto alternativo e linha do tempo com semântica de lista ordenada; contraste AA.
- **RNF-05 — Idioma:** interface em português do Brasil, meses e datas no padrão brasileiro.
- **RNF-06 — Tudo via Docker (constituição §12):** a feature funciona com `docker compose up`, inclusive o armazenamento da foto, sem pré-requisitos locais.

## Critérios de aceite
- [x] **RF-01:** dado um usuário logado, quando clica no seu nome no menu, então abre a tela de Perfil.
- [x] **RF-01:** dado um visitante sem sessão, quando acessa o Perfil diretamente, então é levado ao login.
- [x] **RF-03:** dado o perfil aberto, quando envia uma imagem válida, então ela passa a ser a foto exibida e continua após recarregar a página.
- [x] **RF-04:** dado um usuário com foto, quando a remove, então vê o avatar com iniciais.
- [x] **RF-05:** dado um arquivo que não é imagem ou excede o limite, quando tenta enviar, então vê o erro e a foto anterior é mantida.
- [x] **RF-06:** dada uma bio dentro do limite, quando salva, então ela é exibida no perfil após recarregar; acima do limite, não salva e mostra o erro.
- [x] **RF-07/RF-17:** dadas duas ocupações com datas diferentes, quando o perfil é exibido, então aparecem na linha do tempo da mais recente para a mais antiga.
- [x] **RF-08:** dada uma ocupação sem data de término, quando exibida, então mostra o período "mês/ano — até o momento".
- [x] **RF-09:** dado o perfil, quando adiciona, edita e depois remove (confirmando) uma ocupação, então a lista reflete cada mudança.
- [x] **RF-10/RF-11:** dada uma formação com nível "Mestrado" e sem término, quando salva, então aparece na linha do tempo como em andamento.
- [x] **RF-10:** dada a escolha do nível de formação, então só são oferecidos: fundamental, médio, técnico, superior, pós/MBA, mestrado e doutorado.
- [x] **RF-13:** dado um curso com 40 horas, quando salvo, então aparece com instituição, carga horária e período; com horas zero, negativas ou não numéricas, o item não é salvo.
- [x] **RF-16:** dado término anterior ao início, ou início no futuro, quando tenta salvar, então vê o erro e o item não é salvo; com término futuro e início válido, o item é salvo.
- [x] **RF-22:** dado um item com campo obrigatório vazio, quando tenta salvar, então vê o erro junto ao campo e nada é salvo.
- [x] **RF-19:** dado um usuário sem itens numa seção, quando abre o perfil, então vê o estado vazio com a ação de adicionar.
- [x] **RF-21:** dado um perfil preenchido, quando o usuário sai e entra novamente, então todos os dados continuam lá.
- [x] **RF-02:** dados dois usuários, quando um edita o perfil, então os dados do outro não são alterados nem visíveis para ele.

## Fora de escopo
- Visualização do perfil por outros usuários, perfil público, compartilhamento ou exportação (PDF/currículo).
- Edição de nome, sobrenome, e-mail ou senha (continua fora de escopo, conforme spec 003).
- Edição/recorte avançado de imagem (zoom, rotação) além do envio da foto.
- Sugestão automática de instituições, cargos ou empresas; validação da veracidade dos dados.
- Outras seções (idiomas, habilidades, certificações, links, projetos).
- Ordenação manual dos itens (a ordem é sempre cronológica).

## Decisões registradas
- Foto: JPG, PNG ou WebP, até 2 MB.
- Bio: até 500 caracteres.
- Formação tem o campo obrigatório curso/área, além de instituição e nível.
- Datas: início nunca no futuro; término pode ser futuro (conclusão prevista).
- Uma linha do tempo por seção (não unificada).
- Salvamento por item, sem botão "Salvar" único.
- Perfil privado: só o próprio usuário o vê.
- Cursos não têm descrição.

## Questões em aberto
Nenhuma.
