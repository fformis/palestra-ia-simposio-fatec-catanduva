# Spec: Criar vaga, curtidas e candidaturas

- **ID:** 009-criar-vaga
- **Status:** implementada
- **Data:** 2026-11-19

## Contexto e objetivo
Os usuários já se identificam (spec 003) e mantêm um perfil profissional (spec 004), mas ainda não há como **anunciar oportunidades de trabalho** nem **se interessar por elas**. Esta feature permite que um usuário **crie uma vaga** a partir de um novo item **Criar** no menu lateral, e que os demais usuários **curtam** a vaga e **se candidatem** a ela.

Quem anunciou a vaga acompanha o interesse por ela — **quantidade de curtidas** e **quantidade de candidatos** — e mantém a **lista de candidatos**, podendo abrir o **perfil de cada candidato em modo somente leitura** e **imprimir o currículo dele em PDF**, para conduzir a seleção.

A **listagem de vagas** (onde os usuários encontram as vagas) e a lista **"Minhas vagas"** do anunciante ficam para specs futuras; nesta feature, cada vaga é acessada pela sua própria página.

Público: usuários autenticados — como **anunciante** (cria e gerencia vagas) e como **candidato** (curte e se candidata).

## Histórias de usuário
- Como usuário logado, quero um item **Criar** no menu, para começar a anunciar uma vaga.
- Como anunciante, quero informar cargo, empresa, imagem, descrição, benefícios, regime de contratação, valor e status, para divulgar a vaga com as informações que importam ao candidato.
- Como anunciante, quero editar minha vaga e ativá-la ou inativá-la, para mantê-la correta e controlar quando ela recebe interessados.
- Como usuário, quero curtir e descurtir uma vaga, para sinalizar meu interesse sem me comprometer.
- Como usuário, quero me candidatar a uma vaga e desistir da candidatura, para participar do processo seletivo enquanto me fizer sentido.
- Como usuário, quero ver quantas curtidas e quantos candidatos a vaga tem, para entender o interesse por ela.
- Como anunciante, quero ver a lista de candidatos da minha vaga, para avaliar quem se interessou.
- Como anunciante, quero abrir o perfil de um candidato em modo somente leitura, com o e-mail dele, para conhecer sua trajetória e entrar em contato.
- Como anunciante, quero imprimir o currículo do candidato em PDF, para avaliá-lo fora do sistema ou compartilhá-lo com a equipe.

## Requisitos funcionais

### Acesso
- **RF-01 — Item "Criar" no menu:** o menu lateral ganha o item **Criar**, com ícone, que leva à tela de criação de vaga. No menu recolhido aparece só o ícone (spec 002, RF-13). A tela só é acessível a usuário autenticado (spec 003, RF-06).
- **RF-02 — Quem pode anunciar:** qualquer usuário autenticado pode criar vagas; não há papel específico de recrutador ou empresa.

### Criação da vaga
- **RF-03 — Campos da vaga:** a vaga possui:
  - **Cargo** — texto, obrigatório, até **100 caracteres**.
  - **Empresa** — texto, opcional.
  - **Imagem** — opcional; uma imagem ilustrativa do anúncio.
  - **Descrição** — obrigatória, até **500 caracteres**, **com formatação** (texto rico), com contador de caracteres restantes. Formatações permitidas: **negrito**, **itálico** e **listas** (com marcadores e numeradas); links não são permitidos. Os 500 caracteres contam apenas o texto visível, sem a marcação de formatação.
  - **Benefícios** — seleção de **zero ou mais** itens de uma lista fixa: Plano Médico, Plano Odontológico, Plano Saúde Pet, Gympass, Day off de aniversário.
  - **Regime de contratação** — obrigatório, um de: **CLT**, **PJ**, **Estágio**.
  - **Valor** — obrigatório, **valor único mensal** em reais (R$), maior que zero; exibido como "R$ 5.000,00 / mês".
  - **Status do anúncio** — **Ativo** ou **Inativo**, obrigatório; ao criar, vem como **Ativo**.
  - **Data de criação** — registrada automaticamente pelo sistema no momento da criação; não é editável e é exibida no padrão brasileiro (dd/mm/aaaa).
- **RF-04 — Imagem da vaga:** só são aceitas imagens de formatos comuns (JPG, PNG, WebP) até **2 MB**, como na foto de perfil (spec 004, RF-05); arquivo inválido ou grande demais é recusado com mensagem clara. Sem imagem, o anúncio exibe uma ilustração padrão.
- **RF-05 — Validação:** campos obrigatórios vazios ou inválidos (incluindo descrição acima de 500 caracteres) mostram erro junto ao campo e impedem a gravação da vaga.
- **RF-06 — Confirmação:** ao criar a vaga, o usuário recebe confirmação visual de sucesso e é levado à página da vaga criada.
- **RF-07 — Anunciante:** a vaga fica associada ao usuário que a criou (anunciante).

### Gestão da vaga
- **RF-08 — Editar:** o anunciante pode editar todos os campos da vaga (RF-03), exceto a data de criação, com as mesmas validações da criação. Não há exclusão de vagas.
- **RF-09 — Alterar status:** o anunciante pode alternar a vaga entre Ativo e Inativo a qualquer momento.
- **RF-10 — Vaga inativa:** uma vaga inativa fica visível **somente ao anunciante**; para os demais usuários ela não é exibida, e portanto não recebe curtidas nem candidaturas. Curtidas e candidaturas existentes são mantidas e voltam a valer se a vaga for reativada. Enquanto a vaga está inativa, o candidato já inscrito não consegue acessá-la e, portanto, não consegue desistir; isso é aceito.

### Página da vaga
- **RF-11 — Página da vaga:** cada vaga tem uma página própria (acessível por endereço direto) que exibe todos os seus campos (RF-03), o anunciante, a quantidade de curtidas e a quantidade de candidatos. A listagem de vagas e a lista "Minhas vagas" são escopo de specs futuras.

### Curtidas
- **RF-12 — Curtir/descurtir:** um usuário autenticado pode curtir uma vaga ativa e desfazer a curtida. Cada usuário conta **no máximo uma** curtida por vaga; o estado (curtida ou não) é indicado visualmente e persiste entre sessões.
- **RF-13 — Contagem de curtidas:** a vaga exibe o total de curtidas, visível a todos, atualizado imediatamente após curtir ou descurtir.
- **RF-14 — Anunciante não curte:** o anunciante não pode curtir a própria vaga.

### Candidaturas
- **RF-15 — Perfil mínimo:** para se candidatar, o usuário precisa ter o perfil (spec 004) com **ao menos uma ocupação ou uma formação**. Sem isso, a ação mostra uma mensagem explicando o motivo e leva ao perfil para completá-lo.
- **RF-16 — Candidatar-se:** um usuário autenticado pode se candidatar a uma vaga ativa, após **confirmação**. A confirmação informa que o perfil e o e-mail dele ficarão visíveis ao anunciante (RNF-01). Cada usuário tem **no máximo uma** candidatura ativa por vaga.
- **RF-17 — Desistir:** o candidato pode desistir da candidatura, com confirmação; ao desistir, deixa de constar na lista de candidatos e na contagem.
- **RF-18 — Nova candidatura:** depois de desistir, o usuário pode se candidatar novamente à mesma vaga (se ela estiver ativa).
- **RF-19 — Anunciante não se candidata:** o anunciante não pode se candidatar à própria vaga.
- **RF-20 — Contagem de candidatos:** a vaga exibe o total de candidatos (candidaturas ativas), **visível a todos**, atualizado imediatamente após candidatar-se ou desistir.
- **RF-21 — Estado da candidatura:** o usuário vê na página da vaga se já está candidatado, com a ação de desistir no lugar de candidatar-se.

### Lista de candidatos
- **RF-22 — Lista de candidatos:** o anunciante vê, na página da sua vaga, a lista de candidatos com foto (ou iniciais), nome, e-mail e data da candidatura, em **ordem alfabética** pelo nome.
- **RF-23 — Acesso restrito à lista:** somente o anunciante da vaga acessa a lista de candidatos.
- **RF-24 — Perfil do candidato (somente leitura):** a partir da lista, o anunciante abre o perfil do candidato — foto, nome, e-mail, bio e as linhas do tempo de ocupações, formações e cursos (spec 004) — **sem nenhuma ação de edição**.
- **RF-25 — Alcance do acesso ao perfil:** o anunciante só acessa o perfil de quem se candidatou a uma vaga **dele**, e somente enquanto a candidatura estiver ativa. Os demais perfis continuam privados (spec 004, RF-23).

### Currículo em PDF
- **RF-26 — Imprimir currículo:** no perfil somente leitura do candidato, o anunciante pode gerar o **currículo em PDF**, contendo nome, foto, e-mail, bio, ocupações, formações e cursos, em ordem cronológica do mais recente ao mais antigo, como no perfil. O PDF **não** cita a vaga à qual o candidato se candidatou.
- **RF-27 — Layout do PDF:** não há layout de referência; o currículo segue a identidade visual do app (spec 002) em formato próprio para impressão (A4, fundo claro).

## Requisitos não funcionais
- **RNF-01 — Privacidade (constituição §6 e spec 004, RNF-01):** esta feature **amplia** o acesso ao perfil: o anunciante passa a ver o perfil, o e-mail e o currículo de quem se candidatou a uma vaga dele. A necessidade declarada é a avaliação e o contato com o candidato no processo seletivo; o acesso existe só enquanto a candidatura estiver ativa (RF-25) e nunca permite edição. O usuário é informado disso ao confirmar a candidatura (RF-16).
- **RNF-02 — Segurança da imagem:** apenas imagens são aceitas como imagem da vaga; o conteúdo enviado nunca é executado nem tratado como outro tipo de arquivo (como na spec 004, RNF-02).
- **RNF-03 — Segurança da descrição:** a formatação da descrição nunca permite executar código ou inserir conteúdo ativo na página de quem a lê.
- **RNF-04 — Contagens consistentes:** curtidas e candidatos nunca são contados em dobro para o mesmo usuário, mesmo com cliques repetidos ou simultâneos.
- **RNF-05 — Consistência visual:** as telas usam os componentes, temas (claro/escuro), responsividade e animações do design system (spec 002), funcionando em celular, tablet e desktop.
- **RNF-06 — Acessibilidade:** campos com rótulos associados, erros anunciáveis por leitores de tela, navegação por teclado; botões de curtir e candidatar-se com nome acessível que indica o estado ("Curtir"/"Descurtir", "Candidatar-se"/"Desistir"); contraste AA.
- **RNF-07 — Idioma e formato:** interface e PDF em português do Brasil; valores em reais (R$ 1.234,56) e datas no padrão brasileiro.
- **RNF-08 — Tudo via Docker (constituição §12):** a feature, inclusive o armazenamento da imagem e a geração do PDF, funciona com `docker compose up`, sem pré-requisitos locais.

## Critérios de aceite
- [x] **RF-01:** dado um usuário logado, quando clica em **Criar** no menu, então abre a tela de criação de vaga; dado um visitante sem sessão, quando acessa a tela diretamente, então é levado ao login.
- [x] **RF-03/RF-06:** dado o formulário com cargo, descrição, regime "CLT" e valor 5000 preenchidos, quando cria a vaga, então vê a confirmação e a página da vaga com os dados, "R$ 5.000,00 / mês", status Ativo e a data de criação do dia.
- [x] **RF-03:** dados os benefícios Plano Médico e Gympass marcados, quando a vaga é criada, então a página exibe exatamente esses dois; só são oferecidos os cinco benefícios e os regimes CLT, PJ e Estágio.
- [x] **RF-05:** dado o formulário com cargo vazio, valor zero ou descrição acima de 500 caracteres, quando tenta salvar, então vê o erro junto ao campo e a vaga não é gravada.
- [x] **RF-04:** dado um arquivo que não é imagem ou excede 2 MB, quando tenta anexá-lo como imagem da vaga, então vê o erro; sem imagem, a vaga exibe a ilustração padrão.
- [x] **RF-08:** dado o anunciante na sua vaga, quando altera o valor e salva, então a página exibe o novo valor e a data de criação não muda; outro usuário não tem a opção de editar.
- [x] **RF-09/RF-10:** dada uma vaga ativa, quando o anunciante a inativa, então ele continua vendo a vaga e outro usuário, ao acessar o endereço dela, não a encontra.
- [x] **RF-12/RF-13:** dada uma vaga com 0 curtidas, quando um usuário curte, então o total passa a 1; quando descurte, volta a 0; curtir duas vezes seguidas não conta 2.
- [x] **RF-14/RF-19:** dado o anunciante na página da própria vaga, então as ações de curtir e de candidatar-se não estão disponíveis.
- [x] **RF-15:** dado um usuário sem ocupações nem formações, quando tenta se candidatar, então vê a mensagem explicando o motivo e a candidatura não é feita.
- [x] **RF-16/RF-20:** dada uma vaga ativa sem candidatos, quando um usuário com perfil mínimo se candidata e confirma, então o total passa a 1 e ele vê a ação "Desistir".
- [x] **RF-17/RF-18:** dado um candidato inscrito, quando desiste (confirmando), então o total diminui em 1; quando se candidata de novo, então volta a constar na lista.
- [x] **RF-22/RF-23:** dada uma vaga com os candidatos "Carla" e "Ana", quando o anunciante abre a vaga, então vê a lista na ordem Ana, Carla, com nome e e-mail; quando outro usuário tenta acessar a lista, então o acesso é negado.
- [x] **RF-24:** dado o anunciante na lista de candidatos, quando abre um candidato, então vê foto, nome, e-mail, bio e linhas do tempo do perfil, sem nenhuma ação de edição.
- [x] **RF-25:** dado um usuário que não se candidatou (ou desistiu), quando o anunciante tenta acessar o perfil dele, então o acesso é negado.
- [x] **RF-26:** dado o perfil somente leitura de um candidato, quando o anunciante aciona "Imprimir currículo", então obtém um PDF com nome, e-mail, bio, ocupações, formações e cursos do candidato, sem menção à vaga.

## Fora de escopo
- Listagem de vagas para os usuários e lista "Minhas vagas" do anunciante (specs futuras).
- Exclusão de vagas.
- Busca, filtros e recomendação de vagas.
- Etapas do processo seletivo (triagem, entrevista, aprovação/reprovação) e mensagens entre anunciante e candidato.
- Notificações por e-mail (nova candidatura, desistência, vaga inativada).
- Comentários ou compartilhamento de vagas em redes sociais.
- Lista de quem curtiu a vaga (só o total é exibido).
- Benefícios e regimes personalizados além das listas fixas; faixa salarial ou periodicidade diferente de mensal.
- Perfil público ou acesso ao perfil por quem não é anunciante de uma vaga à qual o usuário se candidatou.
- Edição/recorte avançado da imagem da vaga.

## Decisões registradas
- Qualquer usuário autenticado pode anunciar vagas.
- Descrição: até 500 caracteres, com formatação.
- Regimes: CLT, PJ, Estágio.
- Valor: único, mensal.
- Status padrão ao criar: Ativo.
- Vaga inativa: visível só ao anunciante.
- Anunciante pode editar a vaga; não há exclusão.
- Listagem de vagas e "Minhas vagas": specs futuras.
- Anunciante não curte nem se candidata à própria vaga.
- Candidatura exige perfil mínimo (ao menos uma ocupação ou formação) e confirmação.
- Após desistir, é possível se candidatar de novo.
- Contagens de curtidas e de candidatos são públicas.
- Lista de candidatos em ordem alfabética.
- E-mail do candidato visível ao anunciante e incluído no PDF; o PDF não cita a vaga.
- Cargo: até 100 caracteres.
- Formatação da descrição: negrito, itálico e listas, sem links; o limite conta só o texto visível.
- Com a vaga inativa, o candidato inscrito não consegue desistir (aceito).
- Perfil mínimo: ao menos uma ocupação ou uma formação.
- PDF sem layout de referência.

## Questões em aberto
Nenhuma.
