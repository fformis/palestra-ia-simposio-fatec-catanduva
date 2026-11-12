# Plano: Login e registro do usuário

- **Spec:** ./spec.md (003-login-registro, em revisão, sem `[NEEDS CLARIFICATION]` pendente)

Feature **full-stack**: backend (usuários, tokens de senha, sessão, e-mail), frontend (telas públicas, rotas protegidas, menu com usuário/Sair) e Docker (smtp4dev).

## Decisões técnicas
| Decisão | Escolha | Justificativa | Requisitos |
|---|---|---|---|
| Autenticação/sessão | **Cookie de autenticação** do ASP.NET Core (`AddAuthentication().AddCookie`), `HttpOnly`, `SameSite=Lax`, expiração **absoluta** de 2 h (`SlidingExpiration=false`); em API devolve `401` (sem redirect) | Nada de token em `localStorage`; sem JWT/refresh; `localhost:5173` e `:8080` são *same-site* | RF-03, RF-06, RNF-02 |
| CORS | `AllowCredentials()` com a origem única já configurada (`Cors:Origin`); frontend usa `fetch(..., { credentials: 'include' })` | Cookie cruza as portas em dev | RF-03 |
| CSRF | `SameSite=Lax` + APIs só aceitam JSON (`Content-Type: application/json`) + CORS restrito; sem antiforgery token | Suficiente para o escopo; simples | RNF-02 |
| Hash de senha | PBKDF2 (`Rfc2898DeriveBytes.Pbkdf2`, SHA-256, salt aleatório de 16 B, iterações altas) num `IPasswordHasher` implementado em Infrastructure; formato `iter.salt.hash` em texto | Biblioteca padrão do .NET, **sem ASP.NET Identity** nem pacote novo | RNF-01 |
| Tokens de link | 32 bytes aleatórios (`RandomNumberGenerator`) em base64url; no banco só o **SHA-256** do token; uso único (`UsedAt`), `ExpiresAt` = agora + 24 h; novo token invalida (marca `UsedAt`) os pendentes da conta | Vazamento do banco não expõe links | RF-09, RF-14, RF-16, RNF-02 |
| Propósito do token | `Activation` (conta pendente) e `Reset` (conta ativa); a tela do frontend é a mesma (`/definir-senha`) e muda só o texto | Uma tela, um endpoint | RF-10, RF-15 |
| Bloqueio de login | Tentativas **persistidas no banco**: entidade `LoginAttempt` (chave = e-mail normalizado, existindo conta ou não) com `FailedCount` e `LockedUntil`; 3 falhas consecutivas → `LockedUntil` = agora + 15 min; login correto ou redefinição de senha zera | Sobrevive a reinício da API (`dotnet watch`); não depende de a conta existir (sem enumeração) | RF-23, RNF-03 |
| Envio de e-mail | `IEmailSender` (Application) com `System.Net.Mail.SmtpClient` (Infrastructure) apontando para o smtp4dev; sem pacote novo. Corpos HTML simples em pt-BR montados em Application (`AuthEmails`), transporte em Infrastructure | Zero dependência; texto testável sem SMTP | RF-20, RF-21 |
| Envio síncrono | O e-mail é enviado dentro da requisição (sem fila/background) | Simplicidade (const. 2); diferença de tempo de resposta é risco registrado | RF-09, RF-14 |
| Respostas sem enumeração | `register` e `forgot-password` sempre `202` com corpo vazio para entradas válidas (existindo a conta ou não) | Spec RF-12/RF-14, RNF-03 | RNF-03 |
| E-mail normalizado | `trim` + `ToLowerInvariant`, gravado em `Email` com índice único | Unicidade sem diferenciar caixa | RF-08 |
| Configuração | Tudo em `appsettings.json` (seções `Auth`, `Smtp`, `Frontend`); classes de opções tipadas (`IOptions`) | Pedido explícito; sem segredos (smtp4dev não tem auth) | RF-21 |
| Frontend – rotas | `react-router` já presente: públicas `/entrar`, `/criar-conta`, `/esqueci-senha`, `/definir-senha`; protegidas (dentro de `RequireAuth` + `AppLayout`) `/` e `/design-system`; qualquer rota desconhecida → `/` | Sem libs novas | RF-06 |
| Frontend – estado | `AuthProvider` (contexto) hidrata com `GET /api/auth/me` ao carregar; qualquer `401` do cliente de API limpa o usuário e leva ao login | Cobre sessão expirada | RF-03, RF-06 |
| Campo de senha | Novo `PasswordField` (reusa `TextField`) com botão-olho: `type` alterna `password`/`text`, `aria-label` "Mostrar senha"/"Ocultar senha" e `aria-pressed` | Reuso nas 2 telas de senha | RF-02, RF-17, RNF-06 |
| Validação | Servidor é a autoridade (formato do e-mail, obrigatórios, ≥ 8 caracteres); cliente repete para feedback imediato e confere a **confirmação** (só no cliente) | Confirmação não é regra de negócio | RF-07, RF-17, RF-18 |
| Testes | xUnit v3 em Application com **fakes em memória** (repositório, e-mail, relógio); Vitest/RTL no frontend; um por critério (const. 8.1) | Demo ao vivo | todos |
| Migration | Uma migration EF Core (`AddAuth`), aplicada de forma explícita (ver Docker) | Const. 10 e 12 | RF-08 |

## Arquitetura
```
Frontend (React)                         Backend (.NET 10, Arquitetura Limpa)                 Infra
 /entrar /criar-conta ...  -- JSON + cookie -->  Api: AuthController  --> Application (casos de uso)  --> Infrastructure: EF Core/Postgres
 AuthProvider / authService                       (cookie auth, [Authorize])  IUserRepository, IPasswordHasher,   SmtpEmailSender --> smtp4dev (:25)
                                                                              IEmailSender, ILoginAttemptRepository, EF repositories
                                                                              IClock, ITokenGenerator
```
Fluxos:
1. **Cadastro:** `register` → cria/atualiza `User` pendente → gera token `Activation` → e-mail com `{Frontend:BaseUrl}/definir-senha?token=…`.
2. **Definir senha:** tela chama `validate` ao abrir; no envio chama `set-password` → grava hash, usuário `Active`, token usado → front redireciona a `/entrar` com aviso de sucesso.
3. **Esqueci a senha:** `forgot-password` → se conta ativa, token `Reset` + e-mail; senão nada (ou e-mail de aviso, ver RF-12).
4. **Login:** valida limitador → verifica senha → emite cookie (claims: `sub`, nome, sobrenome, e-mail) → `204`/usuário.

## Contratos
Base: `http://localhost:8080`. JSON em camelCase. Erros com `{ "code": "<codigo>" }` (e `retryAfterSeconds` quando aplicável); mensagens exibidas ao usuário são montadas no frontend a partir do `code`.

| Método e rota | Acesso | Corpo | Respostas |
|---|---|---|---|
| `POST /api/auth/register` | público | `{ firstName, lastName, email }` | `202` (sempre, exista a conta ou não) · `400 { code: "validation", fields: { campo: "mensagem-código" } }` |
| `POST /api/auth/password-links/validate` | público | `{ token }` | `200 { purpose: "activation" \| "reset" }` · `410 { code: "invalid_link" }` (usado, expirado ou inexistente) |
| `POST /api/auth/set-password` | público | `{ token, password }` | `204` · `400 { code: "weak_password" }` · `410 { code: "invalid_link" }` |
| `POST /api/auth/forgot-password` | público | `{ email }` | `202` (sempre) · `400 { code: "validation" }` |
| `POST /api/auth/login` | público | `{ email, password }` | `200 { id, firstName, lastName, email }` + `Set-Cookie` · `401 { code: "invalid_credentials" }` · `403 { code: "account_pending" }` · `423 { code: "locked", retryAfterSeconds }` |
| `POST /api/auth/logout` | autenticado | — | `204` (apaga o cookie) |
| `GET /api/auth/me` | autenticado | — | `200 { id, firstName, lastName, email }` · `401` |

Observações:
- `register` com conta **ativa** existente → e-mail de aviso (RF-12); com **pendente** → atualiza nome/sobrenome e reenvia link; resposta idêntica (`202`).
- `423` é devolvido também com a senha correta enquanto durar o bloqueio (RF-23). Com e-mail inexistente a contagem existe igual (sem enumeração).
- `account_pending` só é devolvido a conta pendente (RF-05 exige a orientação; revela a existência dessa conta — ver Riscos).
- `set-password` aceita `Activation` e `Reset`; confirmação de senha não trafega.
- **Tipos TS** (`frontend/src/services/authTypes.ts`):
  ```ts
  interface AuthUser { id: string; firstName: string; lastName: string; email: string }
  type LinkPurpose = 'activation' | 'reset'
  type ApiErrorCode = 'validation' | 'invalid_credentials' | 'account_pending' | 'locked' | 'weak_password' | 'invalid_link'
  ```
- **Configuração** (`appsettings.json`):
  ```json
  "Auth":     { "LinkValidityHours": 24, "SessionMinutes": 120, "MaxFailedAttempts": 3, "LockoutMinutes": 15, "MinPasswordLength": 8 },
  "Smtp":     { "Host": "smtp4dev", "Port": 25, "FromAddress": "palestra@exemplo.com.br", "FromName": "Palestra" },
  "Frontend": { "BaseUrl": "http://localhost:5173" }
  ```
  `Host: smtp4dev` é o nome do serviço no Docker (tudo roda em `docker compose`); para rodar a API fora do Docker, sobrescrever em `appsettings.Development.json`.

## Impacto por camada (backend)
- **Domain** (`Palestra.Domain`):
  - `User` (Id, FirstName, LastName, `Email` normalizado, `PasswordHash?`, `Status` {Pending, Active}, CreatedAt) com métodos `Register`/`UpdateName`, `SetPassword(hash)` (→ Active). Normalização de e-mail como regra do Domain.
  - `PasswordToken` (Id, UserId, `TokenHash`, `Purpose`, ExpiresAt, UsedAt?) com `IsUsable(now)` e `MarkUsed(now)`.
  - `LoginAttempt` (Email normalizado como chave, `FailedCount`, `LockedUntil?`) com `IsLocked(now)`, `RegisterFailure(now, maxAttempts, lockout)` (ao atingir o máximo define `LockedUntil` e zera a contagem; falha após bloqueio expirado recomeça a contagem) e `Reset()`.
  - Enums `UserStatus`, `TokenPurpose`. Sem dependências.
- **Application** (`Palestra.Application`), pasta `Auth/`:
  - Casos de uso (classes simples, um método `ExecuteAsync`): `RegisterUser`, `ValidatePasswordLink`, `SetPassword`, `ForgotPassword`, `Login`, `GetCurrentUser`.
  - Resultados tipados (`LoginResult` com `Success | InvalidCredentials | Pending | Locked(retryAfter)`; `SetPasswordResult`, etc.) e DTO `UserDto`.
  - Interfaces: `IUserRepository` (por e-mail/Id, adicionar, salvar), `IPasswordTokenRepository` (por hash, invalidar pendentes do usuário), `IPasswordHasher`, `ITokenGenerator` (gera token e hash), `IEmailSender`, `ILoginAttemptRepository` (obter/salvar/remover por e-mail normalizado), `IClock`; opções `AuthOptions`, `FrontendOptions`.
  - `AuthEmails`: assunto/corpo (pt-BR) dos 3 e-mails: criação de senha, redefinição, "já existe uma conta".
- **Infrastructure** (`Palestra.Infrastructure`):
  - `AppDbContext`: `DbSet<User>`, `DbSet<PasswordToken>`, `DbSet<LoginAttempt>`; `LoginAttemptConfiguration` (PK = `Email`); `UserConfiguration` (índice único em `Email`, `Email` e nomes com tamanho máximo, `Status` como string) e `PasswordTokenConfiguration` (índice em `TokenHash`, FK para `User` com cascade).
  - Repositórios EF, `Pbkdf2PasswordHasher`, `TokenGenerator`, `SmtpEmailSender` (+ `SmtpOptions`), `SystemClock`.
  - `DependencyInjection.AddInfrastructure` registra tudo e liga as opções à configuração.
  - Migration `AddAuth`.
- **Api** (`Palestra.Api`):
  - `AuthController` (rotas acima), sem regra de negócio: mapeia resultado → status HTTP; login emite o cookie via `HttpContext.SignInAsync`, logout via `SignOutAsync`.
  - `Program.cs`: `AddAuthentication().AddCookie` (nome, 2 h absoluto, `HttpOnly`, `SameSite=Lax`, eventos de redirect → 401), `UseAuthentication/UseAuthorization`, `AllowCredentials` no CORS.
  - Validação de entrada (obrigatórios, formato do e-mail, senha ≥ `MinPasswordLength`) nos casos de uso, retornando `validation`/`weak_password`.
  - `appsettings.json` com as seções acima.

## Frontend
**Rotas e telas** (`src/pages/auth/`), todas usando Card/Button/TextField/Alert do design system e a animação de entrada existente:
- **`/entrar` (`Login`)**: e-mail, `PasswordField`, botão **Entrar** (estado de carregamento), links **Esqueci minha senha** e **Criar conta**; mostra `Alert` conforme `code` (`invalid_credentials` → "E-mail ou senha inválidos"; `account_pending` → orientação ao e-mail; `locked` → "tente novamente em N minutos"); aviso de sucesso quando chega de `/definir-senha` (estado de navegação). Após sucesso → `/`.
- **`/criar-conta` (`Register`)**: nome, sobrenome, e-mail; validação local; ao enviar mostra painel "Enviamos um e-mail para …" (mesmo texto para qualquer e-mail) com link de volta ao login.
- **`/esqueci-senha` (`ForgotPassword`)**: e-mail + **Enviar**; após enviar, mensagem genérica.
- **`/definir-senha?token=…` (`SetPassword`)**: ao montar chama `validate`; `invalid_link` → painel explicativo com links "Criar conta" / "Esqueci minha senha"; válido → `PasswordField` + confirmação (iguais, ≥ 8 caracteres); título/texto conforme `purpose`; sucesso → `/entrar` com aviso.
- **Layout público** `PublicLayout` (sem menu lateral): cartão centralizado, marca "Palestra" e o `ThemeToggle` no canto superior direito (RNF-07).

**Estrutura de acesso**
- `auth/AuthProvider.tsx` + `authContext.ts`: `user`, `status` (`loading | authenticated | anonymous`), `login`, `logout`; hidrata via `/me`.
- `auth/RequireAuth.tsx`: `loading` → `Spinner`; anônimo → `<Navigate to="/entrar" replace />`.
- `App.tsx`: `AuthProvider` dentro do `ThemeProvider`; rotas públicas fora do `AppLayout`, as demais dentro de `RequireAuth`.

**Menu (RF-19, RF-22)** — `layout/Sidebar.tsx`:
- **Topo:** abaixo da marca, bloco em destaque `UserBadge` (avatar com iniciais + "Nome Sobrenome"); com o menu compacto só as iniciais, nome completo em `title`/`aria-label`.
- **Base:** botão **Sair** (ícone novo `LogoutIcon`) abaixo do botão Recolher; chama `logout()` e navega a `/entrar`.

**Serviços** (`src/services/`): `api.ts` (wrapper de `fetch` com `credentials: 'include'`, base `VITE_API_URL`, JSON, erro tipado `ApiError{status, code, retryAfterSeconds}`, `401` → callback de sessão expirada) e `authService.ts` (`register`, `validateLink`, `setPassword`, `forgotPassword`, `login`, `logout`, `me`).

**Componentes novos:** `PasswordField`, `UserBadge`, ícones `Eye`, `EyeOff`, `Logout`. **Dependências novas:** nenhuma.

## Modelo de dados (EF Core Code First)
```
users                                      password_tokens
 id            uuid  PK                     id          uuid  PK
 first_name    varchar(100)  NOT NULL      user_id     uuid  FK -> users.id (ON DELETE CASCADE)
 last_name     varchar(100)  NOT NULL      token_hash  varchar(64) NOT NULL  (índice)
 email         varchar(254)  NOT NULL UNIQUE   purpose     varchar(20) NOT NULL  (Activation|Reset)
 password_hash varchar(256)  NULL          expires_at  timestamptz NOT NULL
 status        varchar(20)   NOT NULL      used_at     timestamptz NULL
 created_at    timestamptz   NOT NULL

login_attempts
 email         varchar(254)  PK  (normalizado; existindo ou não conta)
 failed_count  int           NOT NULL
 locked_until  timestamptz   NULL
```
(Nomes finais seguem a convenção do EF; o desenho acima é indicativo.) Migration única `AddAuth` (as 3 tabelas) em `Infrastructure/Persistence/Migrations`. Sem dados semente. Linhas de `login_attempts` são removidas no login correto/redefinição de senha.

## Docker
- **Novo serviço `smtp4dev`** em `docker-compose.yml`: imagem `rnwood/smtp4dev` com **tag de versão fixa** (nunca `latest`; definir a tag estável na implementação); portas `3100:80` (interface web) e `2525:25` (SMTP, opcional para testes externos). A API alcança-o por `smtp4dev:25` na rede do compose.
- `api` passa a `depends_on` do `smtp4dev` (started). Nenhuma variável nova no `.env` (config em `appsettings.json`).
- Interface web da caixa de testes: <http://localhost:3100>. Atualizar a seção de comandos do `.claude/CLAUDE.md` (portas) ao implementar.
- **Migration explícita (const. 12):** adicionar tool manifest `dotnet-tools.json` com `dotnet-ef` (versão 10.x estável) e documentar o comando `docker compose exec api dotnet ef database update --project src/Palestra.Infrastructure --startup-project src/Palestra.Api`. O README/CLAUDE.md passa a citá-lo.
- Nova dependência NuGet: nenhuma além dos pacotes de autenticação já inclusos no ASP.NET Core (cookie).

## Estratégia de verificação (const. 8.1)
Backend — `backend/tests/Palestra.Tests/Auth/` (xUnit v3, fakes em memória, um assert principal por teste):
| Critério de aceite | Verificação |
|---|---|
| RF-09 cadastro envia link | `RegisterUser` com e-mail novo: usuário pendente criado e 1 e-mail enviado com o link |
| RF-08/RF-12 conta ativa | `RegisterUser` com e-mail ativo: nenhum usuário novo e e-mail de aviso enviado |
| RF-12 conta pendente | `RegisterUser` repetido: nome atualizado e token anterior inutilizável |
| RF-10/RF-17/RF-18 definir senha | `SetPassword` com token válido ativa a conta; senha < 8 → `WeakPassword`; |
| RF-11 link inválido | token expirado/usado → `InvalidLink` (relógio fake) |
| RF-13/RF-14 esqueci senha | conta ativa gera e-mail; e-mail inexistente não envia nada |
| RF-15/RF-16 redefinição | novo pedido invalida o anterior; senha antiga deixa de logar |
| RF-03/RF-04 login | senha correta → sucesso; errada/inexistente → `InvalidCredentials` idêntico |
| RF-05 pendente | login de conta pendente → `Pending` |
| RF-23 bloqueio | 3 falhas (repositório em memória + relógio fake) → `Locked`, mesmo com senha correta; após 15 min volta a permitir e a contagem é zerada no sucesso |
| RF-23 persistência | verificação **manual**: errar 3×, reiniciar a API, confirmar que o bloqueio continua (linha em `login_attempts`) |
| RNF-01 hash | `Pbkdf2PasswordHasher`: verifica a senha e não grava texto puro |
| RF-21 / config | verificação **manual**: fluxo no smtp4dev (:3100) e troca do remetente no `appsettings.json` |
| RF-03 sessão 2 h / RF-19 logout cookie | verificação **manual** (DevTools: cookie `HttpOnly`, expira em 2 h; `/me` → 401 após logout) |

Frontend — `*.test.tsx` ao lado do código (Vitest + RTL, `authService` simulado por módulo, sem MSW):
| Critério | Verificação |
|---|---|
| RF-01 / RF-02 | `Login` mostra campos e links; clicar no olho alterna o tipo do campo |
| RF-04 / RF-05 / RF-23 | `Login` exibe a mensagem correta para `invalid_credentials`, `account_pending` e `locked` |
| RF-06 | `RequireAuth` anônimo redireciona para `/entrar` (MemoryRouter) |
| RF-07 | `Register` com campo vazio / e-mail inválido mostra erro e não chama o serviço |
| RF-17 / RF-18 / RF-11 | `SetPassword`: confirmação diferente e < 8 caracteres bloqueiam; `invalid_link` mostra explicação |
| RF-19 / RF-22 | `Sidebar`: nome e sobrenome no topo, botão Sair na base chama `logout` |

Comandos: `dotnet test --project backend/tests/Palestra.Tests` · `cd frontend && npm test && npm run lint && npm run build`. Verificação final manual: `docker compose up --build -V` → cadastrar → abrir e-mail em :3100 → definir senha → entrar → conferir menu → Sair → esqueci minha senha.

## Verificação da constituição
- [x] Spec primeiro (spec em revisão, sem pendências; aprovar antes de `/tarefas`)
- [x] Simplicidade (sem Identity/JWT/fila/biblioteca de e-mail; tentativas de login numa tabela simples; nenhuma dependência npm nova)
- [x] Verificabilidade (tabelas acima; itens de cookie/SMTP marcados como manuais)
- [x] Dependências da Arquitetura Limpa respeitadas (Domain puro; Application com interfaces; EF, SMTP, cache e cookies só em Infrastructure/Api; mapeamento via `IEntityTypeConfiguration`)
- [x] Roda via docker compose (smtp4dev adicionado ao compose; migration explícita documentada)
- [x] Segurança e privacidade (§6): hash PBKDF2, token só em hash, sem segredos no repositório, só dados necessários

## Riscos
- **Enumeração residual:** `account_pending` (RF-05) revela que o e-mail tem conta pendente, e o envio síncrono de e-mail torna o tempo de resposta de `register`/`forgot-password` diferente para e-mails existentes. Aceito para a demo (spec exige RF-05); mitigação futura: fila de envio.
- **Tentativas no banco:** cada login falho faz uma escrita e leitura extra; para e-mails inexistentes a tabela cresce (uma linha por e-mail tentado). Aceito para a demo; limpar linhas antigas seria melhoria futura. Corrida entre requisições simultâneas pode contar uma falha a menos; aceitável.
- **`SmtpClient`:** a Microsoft o considera legado, porém funciona com smtp4dev e evita pacote. Se houver problema, migrar para MailKit é isolado em `SmtpEmailSender`.
- **Cookies entre portas:** `:5173` → `:8080` funciona por serem *same-site*; se o frontend for servido de outro domínio, será preciso rever `SameSite`/`Secure`/CORS.
- **Link no e-mail:** depende de `Frontend:BaseUrl` correto; erro aqui quebra o fluxo todo (verificar no teste manual final).
- **Migration no Docker:** exige `dotnet-ef` disponível no container da API (tool manifest + `dotnet tool restore`); validar cedo na primeira tarefa.
- **Rastreabilidade de RF-11 (conta pendente com link expirado):** o caminho de recuperação é refazer o cadastro (reenvia o link); garantir que a tela de link inválido deixe isso claro.
