# Sessão: tarefas e implementação de login e registro

- **Projeto:** palestra-ia-simposio-fatec-catanduva
- **Modelo:** Claude Sonnet 5.5
- **Data da sessão:** 2026-11-11 (exportada em 2026-11-20)
- **Resultado:** `tasks.md` da spec `003-login-registro` criado; feature implementada (backend, frontend e smtp4dev) e commitada como `fc9bab9`; validação final (T-31) parcial

> Transcrição editada: as mensagens do usuário estão na íntegra; as respostas do assistente estão preservadas, e as chamadas de ferramenta aparecem resumidas. Continua a sessão registrada em `05-sessao-spec-plano-login-registro.md`.

---

## 1. Usuário

> vá para tasks

O skill `tarefas` foi acionado, com estas instruções: ler `spec.md` e `plan.md`, criar `tasks.md` a partir de `specs/_templates/tasks.md`, cada tarefa referenciando um `RF-xx`, pequena e com forma de verificação, ordenada por dependência.

### Assistente

**Leitura.** Li o template de tarefas, a spec e o plano de `specs/003-login-registro/`.

**Ação:** criei `specs/003-login-registro/tasks.md` com 31 tarefas, na ordem Docker/infra → Domain → Application → Infrastructure → Api → Frontend → Documentação → Validação.

**Resposta final:**

Criei o `tasks.md` da feature 003-login-registro, com 31 tarefas. Não executei nenhuma e não fiz commit.

Cada tarefa referencia um ou mais `RF-xx` e traz uma forma de verificação. A ordem segue as dependências:

- **Docker/infra:** smtp4dev no compose e `dotnet-ef` (T-01 a T-02).
- **Backend:** Domain, Application, Infrastructure (migration `AddAuth`) e Api (T-03 a T-18).
- **Frontend:** serviços, `PasswordField`, `AuthProvider`/`RequireAuth`, as quatro telas públicas, menu com usuário e Sair, e as rotas no `App.tsx` (T-19 a T-28).
- **Documentação:** atualizar o `.claude/CLAUDE.md` com a porta :3100 e o comando da migration (T-29).
- **Validação:** rodar os testes, o lint e o build, e depois os critérios de aceite via `docker compose up --build -V` (T-30 a T-31).

Os critérios que o plano marca como manuais (bloqueio de login depois de reiniciar a API, cookie de 2 h, remetente no smtp4dev) ficaram na T-31.

---

## 2. Usuário

> Implementar

O skill `implementar` foi acionado: executar as tarefas na ordem marcando `- [x]`, escrever o código em `backend/` e `frontend/` conforme o plano, parar e atualizar a spec se a implementação divergir dela, e validar os critérios de aceite ao final.

### Assistente

**Exploração.** Li a estrutura do repositório, o `docker-compose.yml`, o `Program.cs`, o `DbContext`, os `.csproj` e, no frontend, `App.tsx`, `Sidebar`, `AppLayout`, `TextField`, `Alert` e os ícones.

**Docker/infra (T-01, T-02).**
- Serviço `smtp4dev` no compose (portas 3100 e 2525) e `depends_on` na `api`.
- Tool manifest `backend/dotnet-tools.json` com `dotnet-ef` 10.0.15 e `RUN dotnet tool restore` no Dockerfile da API.
- A tag `v3.8.6` do smtp4dev não pôde ser baixada (Docker Hub inacessível); usei `rnwood/smtp4dev:v3`, que já estava local.

**Backend.**
- *Domain:* `User`, `PasswordToken`, `LoginAttempt` e os enums `UserStatus`/`TokenPurpose`.
- *Application:* interfaces, opções, `AuthEmails` (pt-BR), `PasswordLinkIssuer` e os casos de uso `RegisterUser`, `ValidatePasswordLink`, `SetPassword`, `ForgotPassword`, `Login` e `GetCurrentUser`.
- *Infrastructure:* `Pbkdf2PasswordHasher`, `TokenGenerator` (token base64url, só o SHA-256 vai ao banco), `SmtpEmailSender`, repositórios EF, configurações de entidade e a migration `AddAuth`. Para ler a configuração sem pacote novo, o projeto ganhou `FrameworkReference Microsoft.AspNetCore.App`.
- *Api:* autenticação por cookie (`HttpOnly`, `SameSite=Lax`, 2 h absoluto, 401 sem redirect), CORS com credenciais e o `AuthController` com as 7 rotas do plano; seções `Auth`, `Smtp` e `Frontend` no `appsettings.json`.
- *Testes:* 15 testes xUnit com fakes em memória (cadastro novo/ativo/pendente, validação, definir senha, link expirado, esqueci a senha, login, bloqueio por 3 falhas, hash).

**Frontend.**
- Serviços (`api.ts` com `credentials: 'include'` e `ApiError`, `authService.ts`, `authTypes.ts`), `AuthProvider`, `RequireAuth`, `PasswordField` (botão-olho com `aria-label` e `aria-pressed`; o `TextField` ganhou a propriedade `adornment`), ícones `Eye`, `EyeOff` e `Logout`.
- `PublicLayout` e as telas `Login`, `Register`, `ForgotPassword` e `SetPassword`; `UserBadge` no topo do menu (iniciais no modo compacto) e botão **Sair** na base; rotas atualizadas no `App.tsx`.
- Testes Vitest: 30 no total, incluindo os novos de login, cadastro, esqueci minha senha, definir senha, `RequireAuth` e menu; os testes existentes foram ajustados para o `AuthProvider`.

**Execução e verificação.**
- O Docker Hub estava inacessível (timeout no build), então subi os containers sem `--build`, com as imagens locais.
- O `dotnet ef` do host não funcionava com o `obj/` gerado pelo container; gerei o script SQL idempotente da migration numa cópia do backend na pasta temporária e apliquei no Postgres do compose.
- Fluxo conferido por `curl`: cadastro (e-mail no smtp4dev), validação do link, senha fraca (400), definir senha (204), link reutilizado (410), conta pendente (403), login (200), cookie `HttpOnly` com validade de 2 h, `/me`, logout (depois 401), 3 falhas seguidas (423, também com a senha certa) e "esqueci minha senha" (202 para e-mail existente ou não).
- Ajuste feito durante os testes: o login passou a emitir o cookie como persistente (`IsPersistent = true`), para que ele expire em 2 h em vez de ser cookie de sessão.
- No navegador: login leva à Home com as iniciais e o botão Sair no menu; Sair volta ao login; acessar a Home sem sessão redireciona para `/entrar`.
- Os dados de teste foram removidos do banco local.
- `.claude/CLAUDE.md` atualizado (porta :3100 e comando de migration); `tasks.md` marcado com `[x]`, exceto a T-31, com uma nota do que falta.

**Resposta final:**

Implementei as 30 primeiras tarefas e a T-31 (validação final) ficou parcial. Nada foi commitado.

**O que foi verificado**
- **Testes:** passam 15 no backend (xUnit) e 30 no frontend (Vitest). O lint e o build do frontend também passam.
- **API, por `curl`:**
  - cadastro com o e-mail chegando ao smtp4dev, com remetente `palestra@exemplo.com.br`;
  - link de criar senha: senha fraca recusada, senha válida aceita, link reutilizado recusado com 410;
  - conta pendente recebe 403 no login; credenciais erradas, 401;
  - bloqueio na 3ª tentativa, com 423 mesmo com a senha certa;
  - cookie `HttpOnly` com validade de 2 h; `/me` devolve 401 depois do logout;
  - "Esqueci minha senha" devolve 202 para qualquer e-mail e envia e-mail só se a conta existe.
- **Navegador:** login leva à Home com as iniciais e o botão Sair no menu; Sair volta ao login; acessar a Home sem sessão redireciona ao login.

**O que não foi verificado**
- **Não validado:**
  - o bloqueio de login continuar após reiniciar a API;
  - trocar o remetente no `appsettings.json`;
  - o cadastro completo pela interface (testei só login e logout);
  - o `docker compose up --build -V` do zero.
- **Docker Hub:** estava inacessível (timeout), então só consegui subir os containers com as imagens locais.

**Desvios do plano**
- **smtp4dev:** usei a tag `v3`, que já estava local, em vez de uma versão exata. Troque por `v3.8.6` ou outra fixa quando houver rede.
- **Migration:** apliquei por script SQL gerado fora do container, porque o `dotnet tool restore` do container precisa de rede. O comando documentado no `.claude/CLAUDE.md` é `docker compose exec api dotnet ef database update …`.
- **Manifest:** o `dotnet-tools.json` ficou em `backend/`, não em `backend/.config/`.
- **Infrastructure:** ganhou `FrameworkReference Microsoft.AspNetCore.App`, sem pacote novo, só para ler a configuração.
- **tasks.md:** as tarefas estão marcadas `[x]`, exceto a T-31, com uma nota dizendo o que falta. Os critérios de aceite na `spec.md` ainda não foram marcados.

Limpei os dados de teste do banco local depois dos testes.

---

## 3. Notificação automática (não é mensagem do usuário)

O sistema avisou que um comando em segundo plano terminou: a checagem de manifesto da tag `3.8.6` do smtp4dev.

### Assistente

Essa notificação é só o fim de um comando em segundo plano: a checagem de manifesto da tag `3.8.6` do smtp4dev. Não muda nada do que reportei, e o resultado dela não precisa de ação.

A tag `v3` continua no `docker-compose.yml` e a T-31 continua parcial. Quando o Docker Hub voltar, troque `v3` por uma versão exata (a `v3.8.6` não consegui baixar) e rode o `docker compose up --build -V` do zero para fechar a validação.

---

## 4. Usuário

> commit isso

### Assistente

**Ação:** `git add -A`, conferi que nenhum artefato de build, `.env` ou `node_modules` entrou, e commitei com a mensagem "Implementa login, registro e recuperação de senha (spec 003)" (com a linha `Co-Authored-By`).

**Resposta final:**

Commitei tudo como `fc9bab9` ("Implementa login, registro e recuperação de senha (spec 003)"), na branch `main`. O commit inclui a spec, o plano e o `tasks.md` da feature. Os artefatos de build, o `.env` e o `node_modules` não entraram, e não há mais nada pendente na árvore. Não fiz push.

---

## 5. Usuário

> exporte essa sessão toda para um arquivo .md na pasta ./docs use a nomenclatura NN-nome-da-sessao.md

### Assistente

**Ação:** verifiquei que `docs/` já tinha as sessões `01` a `05`, segui o formato da `05` e criei este arquivo como `06-sessao-tarefas-implementacao-login-registro.md`.
