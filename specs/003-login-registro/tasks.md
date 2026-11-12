# Tarefas: Login e registro do usuário

- **Plano:** ./plan.md
- **Spec:** ./spec.md

Formato: `- [ ] T-01 [RF-01] descrição (arquivo/área) — Verificação: …`

Ordem por dependência: Docker/infra → Domain → Application → Infrastructure → Api → Frontend → Validação. Cada tarefa tem uma verificação objetiva.

## Docker / infra (base)
- [x] T-01 [RF-21] Adicionar serviço `smtp4dev` ao `docker-compose.yml` (imagem `rnwood/smtp4dev` com tag fixa, portas `3100:80` e `2525:25`) e `depends_on` na `api` (`docker-compose.yml`) — Verificação: `docker compose up --build` sobe e <http://localhost:3100> abre a caixa de testes. *(Tag fixada em `v3`: o Docker Hub estava inacessível para baixar `v3.8.6`.)*
- [x] T-02 [RF-21] Adicionar tool manifest `dotnet-tools.json` com `dotnet-ef` 10.x e garantir `dotnet tool restore` disponível no container da API (`backend/`, Dockerfile da api) — Verificação: `docker compose exec api dotnet ef --version` responde.

## Backend — Domain
- [x] T-03 [RF-08] Criar enums `UserStatus`/`TokenPurpose` e entidade `User` (normalização de e-mail, `Register`, `UpdateName`, `SetPassword` → Active) (`Palestra.Domain`) — Verificação: teste xUnit: e-mail `" A@B.com "` normaliza para `a@b.com`; `SetPassword` muda status para Active.
- [x] T-04 [RF-09, RF-16] Criar entidade `PasswordToken` com `IsUsable(now)` e `MarkUsed(now)` (`Palestra.Domain`) — Verificação: teste xUnit: token expirado ou usado → `IsUsable` falso.
- [x] T-05 [RF-23] Criar entidade `LoginAttempt` com `IsLocked`, `RegisterFailure(now, max, lockout)` e `Reset` (`Palestra.Domain`) — Verificação: teste xUnit: 3ª falha define `LockedUntil` = agora + 15 min; após expirar, nova falha recomeça a contagem.

## Backend — Application (`Palestra.Application/Auth`)
- [x] T-06 [RF-21] Definir interfaces (`IUserRepository`, `IPasswordTokenRepository`, `ILoginAttemptRepository`, `IPasswordHasher`, `ITokenGenerator`, `IEmailSender`, `IClock`), opções `AuthOptions`/`FrontendOptions` e DTO `UserDto` — Verificação: `dotnet build` da solution compila sem referência a Infrastructure.
- [x] T-07 [RF-20] Criar `AuthEmails` (assunto/corpo pt-BR: criação de senha, redefinição, conta já existente; remetente "Palestra", validade 1 dia, aviso de ignorar) — Verificação: teste xUnit: corpo contém o link, "1 dia" e o nome "Palestra".
- [x] T-08 [RF-07, RF-08, RF-09, RF-12] Caso de uso `RegisterUser` (valida campos/e-mail; novo → pendente + token Activation + e-mail; ativo → e-mail de aviso; pendente → atualiza nome e reenvia, invalidando token anterior) + fakes em memória em `Palestra.Tests/Auth` — Verificação: 3 testes xUnit (novo, ativo, pendente) e teste de validação (campo vazio/e-mail inválido → `validation`).
- [x] T-09 [RF-10, RF-11, RF-17, RF-18] Casos de uso `ValidatePasswordLink` e `SetPassword` (senha ≥ 8; hash; ativa conta; marca token usado; zera `LoginAttempt`) — Verificação: testes xUnit: token válido ativa; senha curta → `WeakPassword`; token usado/expirado → `InvalidLink` (relógio fake).
- [x] T-10 [RF-13, RF-14, RF-15, RF-16] Caso de uso `ForgotPassword` (conta ativa → token Reset + e-mail; inexistente/pendente → nada; novo token invalida anteriores) — Verificação: testes xUnit: ativa gera e-mail; inexistente não envia; 1º link recusado após 2º pedido; senha antiga deixa de logar após redefinição.
- [x] T-11 [RF-03, RF-04, RF-05, RF-23] Caso de uso `Login` (limitador → senha → `Success | InvalidCredentials | Pending | Locked`; zera contagem no sucesso) e `GetCurrentUser` — Verificação: testes xUnit: sucesso; senha errada e e-mail inexistente → mesmo `InvalidCredentials`; pendente → `Pending`; 3 falhas → `Locked` mesmo com senha correta; após 15 min volta a permitir.

## Backend — Infrastructure (`Palestra.Infrastructure`)
- [x] T-12 [RNF-01] Implementar `Pbkdf2PasswordHasher` (formato `iter.salt.hash`), `TokenGenerator` (32 B base64url + SHA-256) e `SystemClock` — Verificação: teste xUnit: verifica a senha correta, rejeita a errada, hash não contém texto puro; hash do token é determinístico.
- [x] T-13 [RF-08] Adicionar ao `AppDbContext` `User`, `PasswordToken`, `LoginAttempt` com `IEntityTypeConfiguration` (índice único em `Email`, FK cascade, PK de `LoginAttempt` = e-mail) e repositórios EF — Verificação: `dotnet build` ok.
- [x] T-14 [RF-08] Gerar migration `AddAuth` (3 tabelas) — Verificação: `docker compose exec api dotnet ef database update …` aplica sem erro e `\dt` no Postgres lista `users`, `password_tokens`, `login_attempts`.
- [x] T-15 [RF-21] Implementar `SmtpEmailSender` (+ `SmtpOptions`) e `AddInfrastructure` registrando tudo — Verificação: um e-mail disparado manualmente aparece em <http://localhost:3100> com remetente `Palestra <palestra@exemplo.com.br>`.

## Backend — Api (`Palestra.Api`)
- [x] T-16 [RF-21] Adicionar seções `Auth`, `Smtp`, `Frontend` ao `appsettings.json` e ligar as opções tipadas — Verificação: alterar `Smtp:FromAddress` e reiniciar muda o remetente do e-mail.
- [x] T-17 [RF-03, RF-06] Configurar em `Program.cs` autenticação por cookie (`HttpOnly`, `SameSite=Lax`, 2 h absoluto, 401 sem redirect), `UseAuthentication/UseAuthorization` e CORS com `AllowCredentials` — Verificação: `curl -i GET /api/auth/me` sem cookie → `401`.
- [x] T-18 [RF-03, RF-04, RF-05, RF-09, RF-13, RF-19, RF-23] Criar `AuthController` com `register`, `password-links/validate`, `set-password`, `forgot-password`, `login`, `logout`, `me` conforme contratos do plano — Verificação: `curl` em cada rota devolve os status do plano (202/400/410/204/200/401/403/423); cookie `HttpOnly` com expiração em 2 h no login; `/me` → 401 após logout.

## Frontend
- [x] T-19 [RF-03, RF-06] Criar `services/api.ts` (fetch com `credentials: 'include'`, `ApiError`, callback em 401), `authTypes.ts` e `authService.ts` — Verificação: `npm run build` sem erros de tipo.
- [x] T-20 [RF-02, RNF-06] Criar ícones `Eye`/`EyeOff`/`Logout` e `PasswordField` (olho alterna `type`, `aria-label`, `aria-pressed`) — Verificação: teste Vitest: clicar no olho alterna `password`↔`text` e o rótulo.
- [x] T-21 [RF-03, RF-06] Criar `AuthProvider`/`authContext` (hidrata via `/me`, `login`, `logout`) e `RequireAuth` (loading → Spinner; anônimo → `/entrar`) — Verificação: teste Vitest: `RequireAuth` anônimo redireciona para `/entrar`.
- [x] T-22 [RNF-07] Criar `PublicLayout` (cartão centralizado, marca, `ThemeToggle`, sem menu lateral) — Verificação: telas públicas renderizam sem Sidebar nos dois temas.
- [x] T-23 [RF-01, RF-04, RF-05, RF-23] Criar tela `Login` (`/entrar`) com campos, links, Alert por `code` e aviso de sucesso vindo de `/definir-senha` — Verificação: testes Vitest: exibe campos/links; mensagem correta para `invalid_credentials`, `account_pending` e `locked`.
- [x] T-24 [RF-07, RF-09, RF-12] Criar tela `Register` (`/criar-conta`) com validação local e painel "Enviamos um e-mail…" idêntico para qualquer e-mail — Verificação: teste Vitest: campo vazio/e-mail inválido mostra erro e não chama o serviço.
- [x] T-25 [RF-13, RF-14] Criar tela `ForgotPassword` (`/esqueci-senha`) com mensagem genérica após enviar — Verificação: teste Vitest: após enviar mostra a mensagem genérica.
- [x] T-26 [RF-10, RF-11, RF-15, RF-17, RF-18] Criar tela `SetPassword` (`/definir-senha?token=`) com `validate` ao montar, confirmação, textos por `purpose` e painel de `invalid_link` com caminhos de recuperação — Verificação: testes Vitest: confirmação diferente e < 8 caracteres bloqueiam; `invalid_link` mostra explicação e links.
- [x] T-27 [RF-19, RF-22] Criar `UserBadge` no topo do `Sidebar` (nome/sobrenome; iniciais + `title` no modo compacto) e botão **Sair** na base — Verificação: teste Vitest: nome no topo e clicar em Sair chama `logout`.
- [x] T-28 [RF-06] Ligar `App.tsx`: `AuthProvider` dentro do `ThemeProvider`, rotas públicas fora do `AppLayout`, demais sob `RequireAuth`, rota desconhecida → `/` — Verificação: `npm test && npm run lint && npm run build` passam.

## Documentação
- [x] T-29 [RF-21] Atualizar `.claude/CLAUDE.md` (porta :3100 do smtp4dev e comando de migration explícita) — Verificação: seção "Comandos" cita smtp4dev e `dotnet ef database update`.

## Validação
- [x] T-30 Rodar `dotnet test --project backend/tests/Palestra.Tests` e `cd frontend && npm test && npm run lint && npm run build` — Verificação: tudo verde.
- [ ] T-31 [RF-01..RF-23] Executar os critérios de aceite da spec com `docker compose up --build -V`: cadastrar → e-mail em :3100 → definir senha → entrar → menu → Sair → esqueci minha senha; incluir bloqueio 3× + reinício da API e sessão/cookie (DevTools) — Verificação: todos os itens de "Critérios de aceite" marcados.

> Nota de execução: T-31 parcial. Verificados via `curl` e navegador (cadastro, e-mail no smtp4dev, definir senha, link reutilizado, login, cookie `HttpOnly` com 2 h, `/me`, logout, bloqueio 3×, esqueci minha senha). **Não verificados:** bloqueio sobrevivendo a reinício da API, troca do remetente no `appsettings.json`, fluxo completo de cadastro pela interface (só login/logout), `docker compose up --build -V` do zero (sem acesso ao Docker Hub).
