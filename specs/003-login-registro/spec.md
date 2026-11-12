# Spec: Login e registro do usuário

- **ID:** 003-login-registro
- **Status:** em revisão
- **Data:** 2026-11-11

## Contexto e objetivo
O app precisa identificar quem o usa e restringir o acesso a pessoas cadastradas. Esta feature entrega a **porta de entrada** do sistema: entrar com e-mail e senha, criar a própria conta e recuperar o acesso quando a senha for esquecida. A senha nunca é definida no formulário de cadastro: ela é criada pelo usuário a partir de um link enviado por e-mail, o que também comprova que o e-mail informado pertence a ele.

Público: pessoas que usarão o app (novas e já cadastradas). Para a demonstração, os e-mails enviados pelo sistema são consultados numa caixa de entrada de testes (smtp4dev), sem envio real.

## Histórias de usuário
- Como visitante, quero entrar com meu e-mail e senha, para acessar o sistema.
- Como usuário, quero poder exibir e esconder a senha que estou digitando, para conferir se digitei corretamente.
- Como visitante, quero criar uma conta informando nome, sobrenome e e-mail, para passar a usar o sistema.
- Como novo usuário, quero receber um e-mail com um link para criar minha senha, para concluir meu cadastro e depois entrar.
- Como usuário que esqueceu a senha, quero informar meu e-mail e receber um link, para definir uma nova senha e voltar a acessar o sistema.
- Como usuário logado, quero ver meu nome no menu e poder sair, para saber com qual conta estou e encerrar a sessão.
- Como responsável pela demonstração, quero que os e-mails cheguem a uma caixa de testes configurável, para mostrar o fluxo completo ao vivo.

## Requisitos funcionais

### Tela de login
- **RF-01 — Campos e ações:** a tela de login possui campo de **e-mail**, campo de **senha**, botão **Entrar**, o link/botão **Esqueci minha senha** e o link/botão **Criar conta**.
- **RF-02 — Exibir/ocultar senha:** o campo de senha possui um ícone de "olho" que alterna entre exibir e ocultar o texto digitado; por padrão a senha vem oculta.
- **RF-03 — Entrar:** com e-mail e senha corretos de uma conta ativa, o usuário passa a ter acesso ao sistema, sempre na **Home**. A sessão dura **2 horas** (sem opção "Manter conectado"); expirada, é preciso entrar novamente.
- **RF-04 — Falha de login:** com credenciais inválidas, o sistema informa uma mensagem **genérica** ("e-mail ou senha inválidos"), sem revelar se o e-mail existe.
- **RF-05 — Conta sem senha:** se o e-mail pertence a uma conta que ainda não criou a senha (pendente), o login não é concluído e o usuário é orientado a usar o link recebido por e-mail (ver RF-11).
- **RF-06 — Rotas protegidas:** telas do sistema (ex.: Home) só são acessíveis a usuário autenticado; sem autenticação, o visitante é levado à tela de login. Telas de login, criar conta, esqueci minha senha e criação de senha são públicas.
- **RF-23 — Limite de tentativas:** após **3 logins falhos consecutivos** para um mesmo e-mail, o login desse e-mail é bloqueado por **15 minutos**, com mensagem informando o bloqueio; um login correto ou a redefinição de senha zera a contagem.

### Criação de conta
- **RF-07 — Formulário de cadastro:** o usuário informa **nome**, **sobrenome** e **e-mail** (que será o login). Todos os campos são obrigatórios e o e-mail deve ter formato válido.
- **RF-08 — E-mail único:** não pode haver duas contas com o mesmo e-mail (sem diferenciar maiúsculas/minúsculas).
- **RF-09 — E-mail de criação de senha:** ao concluir o cadastro, a conta é registrada como **pendente** (sem senha) e o sistema envia ao e-mail informado uma mensagem com um **link único**, válido por **1 dia**, para criar a senha. A tela informa que o e-mail foi enviado e o que fazer em seguida.
- **RF-10 — Ativação:** ao abrir o link e definir uma senha válida, a conta passa a **ativa** e o usuário é levado à **tela de login**, com aviso de sucesso, para entrar com a senha criada (não é autenticado automaticamente).
- **RF-11 — Link inválido ou expirado:** link já utilizado, expirado ou inexistente não permite definir senha; a tela explica o motivo e oferece caminho para solicitar novo link (conta pendente: refazer o cadastro, que reenvia o link; conta ativa: "Esqueci minha senha").
- **RF-12 — Cadastro com e-mail já existente:** a resposta ao visitante é sempre a mesma de um cadastro novo (mensagem de "e-mail enviado, se aplicável"), sem revelar que o e-mail já está cadastrado; nunca é criada uma segunda conta.
  - Conta existente **ativa:** o dono do e-mail recebe uma mensagem informando que já existe uma conta com aquele e-mail, com orientação para entrar ou usar "Esqueci minha senha".
  - Conta existente **pendente:** o sistema reenvia o link de criação de senha (invalidando o anterior) e **substitui** nome e sobrenome pelos informados na nova tentativa.

### Esqueci minha senha
- **RF-13 — Solicitação:** ao clicar em **Esqueci minha senha**, o usuário informa o **e-mail** e clica em **Enviar**.
- **RF-14 — E-mail de nova senha:** se o e-mail pertence a uma conta ativa, o sistema envia mensagem com um **link único**, válido por **1 dia**, para criar a nova senha. A resposta na tela é sempre a mesma ("se o e-mail estiver cadastrado, você receberá as instruções"), exista a conta ou não.
- **RF-15 — Definir nova senha:** pelo link, o usuário define a nova senha; a senha anterior deixa de valer, o link não pode ser reutilizado e o usuário é levado à tela de login, com aviso de sucesso, para entrar com a nova senha.
- **RF-16 — Novo pedido invalida o anterior:** ao gerar um novo link para a mesma conta, links anteriores ainda pendentes deixam de valer.

### Regras da senha
- **RF-17 — Definição de senha:** a tela de criação/redefinição de senha possui campo de senha com exibir/ocultar (como RF-02) e campo de **confirmação**; as duas devem coincidir e a senha deve atender à política (RF-18).
- **RF-18 — Política de senha:** a única regra é ter **no mínimo 8 caracteres**; sem exigência de composição. Quando não atendida, o erro é claro.

### Sessão e menu
- **RF-19 — Sair (logout):** na **parte inferior** do menu lateral há o item **Sair**, que encerra a sessão e leva à tela de login (item previsto como pendente na spec 002, RF-14).
- **RF-22 — Usuário logado no menu:** na **parte superior** do menu lateral, em destaque, são exibidos o **nome e o sobrenome** do usuário autenticado. No menu compacto (desktop recolhido) exibe-se uma versão reduzida (ex.: iniciais), com o nome completo acessível por rótulo/dica.

### E-mails
- **RF-20 — Conteúdo dos e-mails:** os e-mails (criação de senha, nova senha e aviso de conta já existente) são em português do Brasil, identificam o app ("Palestra"), explicam o motivo do envio, trazem o link de ação quando houver, informam que o link vale por 1 dia e orientam a ignorar a mensagem caso o destinatário não tenha feito a solicitação.
- **RF-21 — Caixa de testes para a demonstração:** na demonstração, todos os e-mails são entregues a uma caixa de entrada de testes (smtp4dev), consultável pelo navegador, sem sair para a internet. Os parâmetros de envio e de segurança (servidor, porta, remetente, validade dos links, duração da sessão, limite de tentativas etc.) ficam no arquivo de configuração `appsettings.json`, sem valores fixos no código. O remetente é **Palestra <palestra@exemplo.com.br>**.

## Requisitos não funcionais
- **RNF-01 — Segurança de senhas:** senhas nunca são armazenadas nem registradas em log em texto puro; são guardadas apenas de forma irreversível (hash com salt).
- **RNF-02 — Segurança dos links:** os links contêm um token imprevisível, de uso único e com validade limitada; apenas uma versão não reutilizável do token é guardada no servidor.
- **RNF-03 — Sem enumeração de contas:** login, cadastro e "esqueci minha senha" não permitem descobrir se um e-mail está cadastrado (mensagens genéricas, RF-04/RF-12/RF-14).
- **RNF-04 — Proteção contra tentativas em massa:** tentativas repetidas de login são limitadas (RF-23); não há limite de pedidos de e-mail nesta feature.
- **RNF-05 — Privacidade (constituição §6):** os dados pessoais coletados são apenas nome, sobrenome, e-mail e a senha (hash), pois são necessários para identificar e autenticar o usuário.
- **RNF-06 — Acessibilidade:** campos com rótulos associados, erros anunciáveis por leitores de tela, navegação completa por teclado e botão de exibir/ocultar senha com nome acessível e estado indicado; contraste AA conforme o design system (spec 002).
- **RNF-07 — Consistência visual:** as telas usam os componentes, temas (claro/escuro), responsividade e animações do design system (spec 002). Telas públicas não exibem o menu lateral.
- **RNF-08 — Tudo via Docker (constituição §12):** a caixa de testes de e-mail sobe junto com o restante via `docker compose up`, sem pré-requisitos locais.
- **RNF-09 — Idioma:** toda a interface e os e-mails em português do Brasil.

## Critérios de aceite
- [ ] **RF-01:** dado um visitante, quando abre o app sem sessão, então vê a tela de login com e-mail, senha, Entrar, Esqueci minha senha e Criar conta.
- [ ] **RF-02:** dado o campo de senha preenchido, quando clica no olho, então o texto é exibido; ao clicar de novo, volta a ficar oculto.
- [ ] **RF-03/RF-22:** dada uma conta ativa, quando informa e-mail e senha corretos, então acessa a Home e vê nome e sobrenome em destaque no topo do menu.
- [ ] **RF-03:** dada uma sessão com mais de 2 horas, quando o usuário acessa o sistema, então é levado ao login.
- [ ] **RF-04:** dado um e-mail ou senha incorretos (ou e-mail inexistente), quando clica em Entrar, então vê a mesma mensagem genérica e permanece na tela de login.
- [ ] **RF-23:** dado um e-mail com 3 logins falhos seguidos, quando tenta entrar de novo (mesmo com a senha correta), então é informado do bloqueio temporário e não acessa até o fim dele.
- [ ] **RF-05:** dada uma conta pendente, quando tenta entrar, então não acessa e é orientado a usar o link recebido por e-mail.
- [ ] **RF-06:** dado um visitante sem sessão, quando acessa diretamente a Home, então é redirecionado ao login.
- [ ] **RF-07:** dado o formulário de cadastro, quando envia com campo vazio ou e-mail mal formatado, então vê o erro no campo e nada é enviado.
- [ ] **RF-08/RF-12:** dado um e-mail de conta ativa, quando alguém tenta criar conta com ele, então vê a mesma confirmação de um cadastro novo, nenhuma segunda conta é criada e o dono recebe o aviso de conta existente.
- [ ] **RF-12:** dado um e-mail de conta pendente, quando o cadastro é refeito com outro nome, então chega novo link (o anterior deixa de valer) e o nome é atualizado.
- [ ] **RF-09:** dados nome, sobrenome e e-mail válidos, quando conclui o cadastro, então vê a confirmação de envio e o e-mail com o link chega à caixa de testes.
- [ ] **RF-10/RF-17:** dado o link do e-mail, quando define senha válida com confirmação igual, então a conta fica ativa, o usuário volta à tela de login com aviso de sucesso e consegue entrar com a nova senha.
- [ ] **RF-17:** dada confirmação diferente da senha, quando tenta salvar, então vê o erro e a senha não é definida.
- [ ] **RF-18:** dada uma senha com menos de 8 caracteres, quando tenta salvar, então vê o erro e a senha não é definida.
- [ ] **RF-11:** dado um link já usado ou expirado, quando é aberto, então não permite definir senha e oferece como obter novo link.
- [ ] **RF-13/RF-14:** dado um e-mail de conta ativa, quando solicita em Esqueci minha senha, então chega à caixa de testes um e-mail com link; com e-mail inexistente, a tela mostra a mesma mensagem e nenhum e-mail é enviado.
- [ ] **RF-15:** dado o link de redefinição, quando define nova senha, então volta ao login, a senha antiga deixa de funcionar, a nova funciona e o link não pode ser reutilizado.
- [ ] **RF-16:** dados dois pedidos seguidos de nova senha, quando abre o link do primeiro, então ele é recusado e o do segundo funciona.
- [ ] **RF-19:** dado um usuário autenticado, quando clica em Sair (parte inferior do menu), então volta ao login e a Home deixa de ser acessível sem novo login.
- [ ] **RF-21:** dado o `docker compose up`, quando o fluxo gera um e-mail, então ele aparece na interface web do smtp4dev com remetente Palestra <palestra@exemplo.com.br>, e alterar o remetente no `appsettings.json` altera o remetente do e-mail.

## Fora de escopo
- Login social (Google, Microsoft etc.) e autenticação multifator.
- Opção "Manter conectado".
- Alteração de e-mail, de nome ou de senha dentro do sistema por usuário já logado (perfil/conta).
- Exclusão ou desativação de conta; administração de usuários e perfis/permissões (papéis).
- Envio de e-mail real em produção (provedor SMTP definitivo).
- Reenvio automático de e-mails e filas de entrega com tentativas.

## Decisões registradas
- Após definir a senha (criação ou redefinição): volta à tela de login.
- Validade de ambos os links: 1 dia.
- Política de senha: apenas mínimo de 8 caracteres.
- Sessão: 2 horas.
- Cadastro com e-mail existente: conta ativa → aviso por e-mail; conta pendente → reenvia link e substitui nome/sobrenome.
- Bloqueio após 3 logins falhos; destino pós-login sempre Home.
- Remetente: Palestra <palestra@exemplo.com.br> .
- Menu: nome e sobrenome em destaque no topo; Sair na parte inferior.
- Bloqueio de login: 15 minutos após 3 falhas.
- Sem limite de pedidos de e-mail (cadastro / esqueci minha senha); RNF-04 cobre apenas o login.
- Remetente confirmado: palestra@exemplo.com.br.

## Questões em aberto
Nenhuma.
