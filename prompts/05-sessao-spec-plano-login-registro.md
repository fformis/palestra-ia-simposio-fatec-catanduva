# Sessão: especificação e plano de login e registro

- **Projeto:** palestra-ia-simposio-fatec-catanduva
- **Modelo:** Claude Sonnet 5.5
- **Data da sessão:** 2026-11-11 (exportada em 2026-11-20)
- **Resultado:** spec `003-login-registro` sem questões em aberto e `plan.md` gerado; `tasks.md` ainda não criado

> Transcrição editada: as mensagens do usuário estão na íntegra; as respostas do assistente estão preservadas, e as chamadas de ferramenta aparecem resumidas.

---

## 1. Usuário

> `/specify` login e registro do usuário
>
> a tela de login, deverá possuir um campo de email e senha (com o olho para exibir e esconder a senha) além do botão de entrar, deve possuir o esqueci minha senha, e o criar conta.
>
> para criar a conta o usuário cadastra o nome e sobrenome, e o e-mail (que será o login), então será enviado um e-mail com um link para a criação da senha, depois disso o usuário ganha acesso ao sistema.
>
> no botão esqueci minha senha o usuário deverá informar o e-mail, e clicar em enviar, então receberá um email para a criação da nova senha.
>
> use o smtp4dev para a demonstração todas configurações no appsettings.json

O comando também instruía: ler `.claude/CONSTITUTION.md` e listar `specs/` para definir `NNN` e o slug; criar `specs/NNN-slug/spec.md` a partir do template; descrever apenas O QUÊ e POR QUÊ; marcar lacunas como `[NEEDS CLARIFICATION]` e listá-las ao final.

### Assistente

**Investigação inicial.** Li a constituição, o template `specs/_templates/spec.md` e a spec `002-design-system` (como referência de estilo). Em `specs/` havia `001-exemplo` e `002-design-system`, então o próximo número é **003**.

**Ação:** criei `specs/003-login-registro/spec.md` (status `rascunho`) com 21 requisitos funcionais, 9 não funcionais e 16 critérios de aceite.

**Resposta final:**

Criei a spec em `specs/003-login-registro/spec.md`, com status `rascunho`. Ela cobre 21 requisitos funcionais, 9 não funcionais e 16 critérios de aceite.

Escrevi só O QUÊ e POR QUÊ. A única menção técnica é o smtp4dev e o `appsettings.json`, que você pediu explicitamente (RF-21 e RNF-08).

Pontos além do que você descreveu:
- **Rotas protegidas e logout:** adicionei o item **Sair** no menu lateral, que a spec 002 deixou pendente, e a proteção das telas para quem não está logado.
- **Mensagens genéricas:** login, cadastro e "esqueci minha senha" não revelam se um e-mail já existe.
- **Links de uso único:** cada link vale uma vez, tem validade e é invalidado por um pedido mais novo.
- **Confirmação de senha:** a tela de criar senha pede a senha duas vezes.

Pendências `[NEEDS CLARIFICATION]` (não resolvi nenhuma por suposição):

1. **Após definir a senha:** o usuário já entra logado ou volta para a tela de login? O seu texto sugere entrar logado.
2. **Validade dos links:** quanto tempo vale o de criação de senha e o de redefinição?
3. **Política de senha:** tamanho mínimo e composição.
4. **Duração da sessão:** quanto tempo fica logado e se haverá "Manter conectado".
5. **Cadastro com e-mail já existente:** o dono desse e-mail recebe um aviso ou nenhum e-mail?
6. **Conta pendente que se cadastra de novo:** reenvia o link e substitui nome e sobrenome?
7. **Limite de tentativas:** bloqueio após N logins falhos e limite de e-mails por hora.
8. **Destino pós-login:** sempre a Home ou a tela que a pessoa tentou abrir.
9. **Remetente dos e-mails:** nome, endereço e nome do app no texto.
10. **Nome do usuário logado:** mostrar nome e sobrenome ao lado do Sair?

Quando essas respostas estiverem definidas, o próximo passo é `/plan`.

---

## 2. Usuário

> 1 - volta para a tela de login
> 2 - 1 dia
> 3 - apenas tamanho 8 caracteres
> 4 - 2horas
> 5 - sim
> 6 - sim
> 7 - 3
> 8 - sempre home
> 9 - Palestra, platestra@exemplo.com.br
> 10 - mostrar o nome e o sobrenome no parte superior do menu em destaque, e na parte inferior do menu o sair

### Assistente

**Ação:** atualizei a spec (status `em revisão`). Minha primeira tentativa de edição por script falhou numa substituição e não gravou nada; reescrevi o arquivo inteiro com as decisões aplicadas.

**Resposta final:**

Atualizei a spec com as 10 respostas. O status passou para `em revisão`, e as decisões ficaram registradas numa seção própria.

- **Pós-senha:** depois de criar ou redefinir a senha, o usuário volta ao login com aviso de sucesso (RF-10 e RF-15).
- **Links e senha:** os links valem 1 dia e a única regra de senha é ter no mínimo 8 caracteres (RF-09, RF-14, RF-18).
- **Sessão:** dura 2 horas, sem "Manter conectado", que entrou em Fora de escopo (RF-03).
- **Cadastro com e-mail existente (RF-12):** conta ativa → o dono recebe um aviso de que a conta já existe; conta pendente → o link é reenviado e nome e sobrenome são substituídos.
- **Limite de tentativas:** o login é bloqueado após 3 falhas seguidas (novo RF-23). Depois de logar, o usuário sempre cai na Home.
- **Remetente:** `Palestra <palestra@exemplo.com.br>`. Entendi "platestra" como erro de digitação.
- **Menu:** nome e sobrenome em destaque no topo (novo RF-22), com iniciais no menu compacto. O Sair fica na parte inferior (RF-19).
- **Critérios de aceite:** ajustei os existentes e acrescentei os de bloqueio, sessão, política de senha e conta pendente.

Pendências `[NEEDS CLARIFICATION]`:

1. **Duração do bloqueio:** por quanto tempo o e-mail fica bloqueado após as 3 falhas? Sugiro 15 minutos.
2. **Limite de e-mails:** haverá limite de pedidos de e-mail por hora (cadastro e esqueci minha senha)? Qual valor?
3. **Remetente:** confirme `palestra@exemplo.com.br`.

---

## 3. Usuário

> planeja

### Assistente

Invoquei a skill `plan`. Pelas regras dela, com `[NEEDS CLARIFICATION]` pendente o assistente deve parar e perguntar.

**Pergunta ao usuário (3 perguntas):**

| Pergunta | Resposta |
|---|---|
| Duração do bloqueio após 3 logins falhos (RF-23) | 15 minutos (Recomendado) |
| Limite de pedidos de e-mail por e-mail (RNF-04) | Sem limite |
| Remetente `palestra@exemplo.com.br` (escrito "platestra") | Sim, `palestra@exemplo.com.br` |

**Ação:** atualizei a spec com as respostas (seção "Questões em aberto" → "Nenhuma", bloqueio de 15 minutos, sem limite de e-mails, remetente confirmado). Li o `docker-compose.yml`, `.env.example`, `Program.cs`, `appsettings.json`, `DependencyInjection.cs`, `AppDbContext.cs`, `package.json`, `App.tsx`, `Sidebar.tsx`, `TextField.tsx` e o plano da spec 002 para alinhar o plano ao código existente. Criei `specs/003-login-registro/plan.md`.

**Resposta final:**

Criei o plano em `specs/003-login-registro/plan.md`.

As 3 pendências da spec foram resolvidas antes de planejar. A spec está sem `[NEEDS CLARIFICATION]`. O status dela continua `em revisão`: ela ainda precisa ser aprovada antes de `/tasks`.

Principais escolhas do plano:
- **Sessão:** cookie `HttpOnly` do ASP.NET Core com expiração fixa de 2 horas, sem JWT.
- **Senha e links:** hash PBKDF2, sem ASP.NET Identity. O token dos links é guardado só como SHA-256, tem uso único e vale 24 horas. Um novo pedido invalida o anterior.
- **API:** 7 endpoints em `/api/auth`. `register` e `forgot-password` sempre respondem `202`, para não revelar se o e-mail existe.
- **E-mail:** `System.Net.Mail.SmtpClient` para o smtp4dev, sem pacote novo.
- **Configuração:** em `appsettings.json`, seções `Auth`, `Smtp` e `Frontend`.
- **Dados:** duas tabelas, `users` e `password_tokens`, numa única migration.
- **Docker:** novo serviço `smtp4dev` com a interface web em `localhost:3100`. A migration é aplicada por comando documentado, usando `dotnet-ef` como ferramenta local.
- **Frontend:** 4 telas públicas, `RequireAuth`, `AuthProvider` e `PasswordField` com o olho. Nome e sobrenome no topo do menu e Sair na base. Nenhuma dependência npm nova.
- **Testes:** um por critério de aceite, com fakes em memória no backend e Vitest no frontend. Cookie, SMTP e remetente são verificados à mão.

Riscos registrados no plano: o RF-05 revela que um e-mail tem conta pendente; o envio síncrono deixa o tempo de resposta diferente para e-mails existentes; o bloqueio de login ficava em memória e zerava ao reiniciar a API; a tag da imagem do smtp4dev ficou sem versão fixa, a definir na implementação.

---

## 4. Usuário

> aceito o risco, contar as tentativas e salvar no banco de dados, ok

### Assistente

**Ação:** atualizei `plan.md`: as tentativas de login passam a ser persistidas.

**Resposta final:**

Atualizei o plano: as tentativas de login agora são contadas e salvas no banco, e os riscos que você aceitou continuam registrados lá.

- **Tabela nova:** `login_attempts` guarda o e-mail normalizado, `failed_count` e `locked_until`. O e-mail é registrado mesmo que a conta não exista, para não revelar quem está cadastrado.
- **Regra:** na 3ª falha seguida o e-mail fica bloqueado por 15 minutos. Login correto ou redefinição de senha apaga o registro. Depois do bloqueio vencido, uma nova falha recomeça a contagem.
- **Código:** entidade `LoginAttempt` em Domain, interface `ILoginAttemptRepository` em Application, implementação com EF em Infrastructure; a migration `AddAuth` cria as 3 tabelas. Saiu o limitador em memória.
- **Teste:** o bloqueio é testado com repositório em memória e relógio fake, mais uma verificação manual (errar 3 vezes, reiniciar a API e confirmar que o bloqueio continua).
- **Riscos:** cada tentativa faz uma escrita no banco; a tabela cresce com e-mails inexistentes; requisições simultâneas podem contar uma falha a menos.

Se a spec e o plano estiverem aprovados, o próximo passo é `/tasks`.

---

## 5. Usuário

> exporte essa sessão toda para um arquivo .md na pasta ./docs use a nomenclatura NN-nome-da-sessao.md

### Assistente

Em `docs/` já havia quatro arquivos (`01` a `04`), então usei o número **05**. Criei este arquivo no mesmo formato dos anteriores.

---

## Artefatos produzidos na sessão

| Arquivo | Estado |
|---|---|
| `specs/003-login-registro/spec.md` | `em revisão`, sem questões em aberto |
| `specs/003-login-registro/plan.md` | gerado, aguardando aprovação |
| `docs/05-sessao-spec-plano-login-registro.md` | este arquivo |

Nenhum código de produção foi escrito e nada foi commitado.
