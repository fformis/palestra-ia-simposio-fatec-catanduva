# Plano: Perfil profissional em linha do tempo

- **Spec:** ./spec.md (004-perfil, em revisão, sem `[NEEDS CLARIFICATION]` pendente)

Feature **full-stack**: backend (perfil, foto, ocupações, formações, cursos), frontend (tela `/perfil`, linha do tempo, nome do menu clicável). Sem mudanças no Docker.

## Decisões técnicas
| Decisão | Escolha | Justificativa | Requisitos |
|---|---|---|---|
| Dono do perfil | Todas as rotas usam o **Id do usuário do cookie** (`ClaimTypes.NameIdentifier`); nenhuma rota recebe id de usuário. Item de outro usuário → `404` | Impossível ler/alterar perfil alheio por construção | RF-02, RF-23, RNF-01 |
| Armazenamento da foto | **No PostgreSQL** (`bytea`), em tabela própria `profile_photos`, separada do perfil | Sem volume, serviço ou pacote novo; roda no `docker compose` atual; tabela separada evita carregar os bytes a cada leitura do perfil | RF-03, RNF-06 |
| Envio da foto | `multipart/form-data` (campo `file`), `IFormFile`, limite de requisição ajustado ao máximo configurado | Padrão do ASP.NET Core, sem pacote | RF-03, RF-05 |
| Validação da foto | Tamanho ≤ `Profile:MaxPhotoBytes` (2 MB) e **assinatura do arquivo** (magic bytes de JPEG, PNG, WebP) — a extensão e o `Content-Type` enviados não são confiados. O tipo gravado é o detectado | Só imagens entram, independentemente do nome do arquivo | RF-05, RNF-02 |
| Entrega da foto | `GET /api/profile/photo` autenticado, com o `Content-Type` detectado, `X-Content-Type-Options: nosniff` e `Cache-Control: private`. O frontend usa `<img src>` direto (cookie `SameSite=Lax` acompanha, pois `:5173` e `:8080` são *same-site*) com `?v=<versão>` para atualizar após troca | Sem conversão para blob/base64; conteúdo nunca é interpretado como outro tipo | RF-03, RNF-02 |
| Sem redimensionamento | A imagem é guardada como enviada; o recorte circular é só CSS (`object-fit: cover`) | Evita biblioteca de imagem (const. 2); recorte avançado está fora de escopo | RF-03 |
| Mês/ano | Domain: `DateOnly` sempre no **dia 1**; banco: `date`; contrato: string **`"AAAA-MM"`**; exibição `MM/AAAA` no frontend | Tipo nativo do .NET e do EF, ordenável; sem value object novo | RF-15 |
| Regras de data | No Domain: início obrigatório e **não posterior ao mês atual**; término opcional, **não anterior ao início**, pode ser futuro. "Mês atual" vem do `IClock` existente | Regra de negócio testável com relógio falso | RF-16 |
| Ordenação | Feita **no servidor**, num único método compartilhado: início decrescente; empate → item sem término primeiro; depois término decrescente | Uma regra, um teste; o frontend só exibe | RF-17 |
| Modelagem | Três entidades independentes (`Occupation`, `Education`, `Course`) com `UserId`, mais `Profile` (bio) e `ProfilePhoto`. Sem classe-base genérica | Os campos diferem por seção; herança/genéricos seriam abstração desnecessária | RF-07, RF-10, RF-13 |
| Criação do perfil | `Profile` é criado **sob demanda** na primeira gravação de bio/foto; `GET` sem registro devolve perfil vazio | Sem alterar o cadastro (spec 003) nem migrar usuários existentes | RF-21 |
| Salvamento por item | Um endpoint por operação (bio, foto, cada item); cada confirmação na tela é uma requisição | Decisão da spec | RF-20 |
| Nível de formação | Enum no Domain, gravado como texto; no contrato os códigos `fundamental`, `medio`, `tecnico`, `superior`, `pos_mba`, `mestrado`, `doutorado`; rótulos em pt-BR no frontend | Lista fechada da spec | RF-10 |
| Limites técnicos de texto | Cargo, empresa, instituição, curso/área e nome do curso: até 150 caracteres; descrição: até 1000; horas: inteiro de 1 a 99.999 | A spec só fixa o limite da bio; estes protegem o banco e a tela (ver Riscos) | RF-22 |
| Validação | Servidor é a autoridade e devolve `400 { code: "validation", fields }` (mesmo formato da spec 003); o cliente repete obrigatórios e datas para resposta imediata | Consistência com o contrato existente | RF-22 |
| Formulários | Edição **inline** dentro da seção (o item vira formulário); remoção com confirmação inline ("Remover? Confirmar / Cancelar") | O design system não tem modal; não criar um só para isto | RF-09, RF-12, RF-14 |
| Campo mês/ano | Novo `MonthYearField`: dois `select` (mês em pt-BR, ano) | `<input type="month">` não tem seletor no Safari/Firefox desktop | RF-15, RNF-05 |
| Cliente de API | Estender `api.ts`: métodos `PUT`/`DELETE` e envio de `FormData` (sem `Content-Type` manual) | Mantém a camada única de serviços (const. 11) | — |
| Reuso | `IClock` e `IUnitOfWork` existentes (em `Application.Auth`) são reutilizados como estão | Sem mover código de outra feature | — |
| Configuração | Seção `Profile` no `appsettings.json` (`MaxPhotoBytes`, `MaxBioLength`) com opções tipadas | Mesmo padrão da spec 003 | RF-05, RF-06 |
| Testes | xUnit v3 com repositório em memória e relógio falso; Vitest/RTL com `profileService` simulado; um por critério (const. 8.1) | Demo ao vivo | todos |
| Migration | Uma migration `AddProfile` | Const. 10 | RF-21 |

## Arquitetura
```
Frontend (React)                              Backend (.NET 10, Arquitetura Limpa)
 Sidebar: UserBadge (link) ──► /perfil         Api: ProfileController [Authorize]
 pages/profile/Profile                           │  userId = claim do cookie
   ├─ PhotoSection   ── multipart ──►            ▼
   ├─ BioSection     ── JSON ──────►           Application/Profile: casos de uso
   └─ TimelineSection ×3 (ocupações,             │  IProfileRepository, IClock, IUnitOfWork
      formações, cursos) ── JSON ──►             ▼
 services/profileService.ts                    Infrastructure: EF Core ──► PostgreSQL
                                                (profiles, profile_photos, occupations, educations, courses)
```
Fluxos:
1. **Abrir perfil:** `GET /api/profile` devolve bio, versão da foto e as três listas já ordenadas.
2. **Item:** adicionar/editar → Domain valida (obrigatórios, datas) → grava → devolve o item; a tela recarrega o perfil (`GET`) para exibir a lista na ordem definida pelo servidor.
3. **Foto:** envio → valida tamanho e assinatura → substitui a linha em `profile_photos` → devolve nova versão; a tela troca o `src`.

## Contratos
Base: `http://localhost:8080`. Todas as rotas exigem autenticação (`401` sem sessão). JSON em camelCase. Datas mês/ano como `"AAAA-MM"`; término ausente = `null`.

| Método e rota | Corpo | Respostas |
|---|---|---|
| `GET /api/profile` | — | `200 Profile` |
| `PUT /api/profile/bio` | `{ bio }` (vazio/`null` limpa) | `204` · `400 validation` (`bio: "too_long"`) |
| `PUT /api/profile/photo` | `multipart/form-data`, campo `file` | `200 { photoVersion }` · `400 { code: "invalid_image" }` · `400 { code: "image_too_large" }` |
| `GET /api/profile/photo` | — | `200` bytes da imagem · `404` sem foto |
| `DELETE /api/profile/photo` | — | `204` |
| `POST /api/profile/occupations` | `OccupationInput` | `201 Occupation` · `400 validation` |
| `PUT /api/profile/occupations/{id}` | `OccupationInput` | `200 Occupation` · `400 validation` · `404 { code: "not_found" }` |
| `DELETE /api/profile/occupations/{id}` | — | `204` · `404 { code: "not_found" }` |
| `POST` · `PUT` · `DELETE /api/profile/educations[/{id}]` | `EducationInput` | idem |
| `POST` · `PUT` · `DELETE /api/profile/courses[/{id}]` | `CourseInput` | idem |

Erro de validação: `400 { code: "validation", fields: { <campo>: <código> } }`, com códigos `required`, `too_long`, `invalid`, `future_start`, `end_before_start`.

**Tipos TS** (`frontend/src/services/profileTypes.ts`):
```ts
type YearMonth = string // "AAAA-MM"
type EducationLevel = 'fundamental' | 'medio' | 'tecnico' | 'superior' | 'pos_mba' | 'mestrado' | 'doutorado'

interface OccupationInput { title: string; company: string; start: YearMonth; end: YearMonth | null; description: string | null }
interface EducationInput  { institution: string; course: string; level: EducationLevel; start: YearMonth; end: YearMonth | null; description: string | null }
interface CourseInput     { name: string; institution: string; hours: number; start: YearMonth; end: YearMonth | null }

type Occupation = OccupationInput & { id: string }
type Education  = EducationInput  & { id: string }
type Course     = CourseInput     & { id: string }

interface Profile {
  bio: string | null
  photoVersion: string | null   // null = sem foto; usado em /api/profile/photo?v=...
  occupations: Occupation[]     // já ordenadas (RF-17)
  educations: Education[]
  courses: Course[]
}
```
`ApiErrorCode` (em `authTypes.ts`) ganha `invalid_image`, `image_too_large` e `not_found`.

**Configuração** (`appsettings.json`):
```json
"Profile": { "MaxPhotoBytes": 2097152, "MaxBioLength": 500 }
```

## Impacto por camada (backend)
- **Domain** (`Palestra.Domain/Profile/`), sem dependências:
  - `Profile` (UserId, `Bio?`, `PhotoVersion?`) com `SetBio(texto, limite)`, `SetPhoto(now)`, `RemovePhoto()`.
  - `ProfilePhoto` (UserId, ContentType, Content).
  - `Occupation`, `Education`, `Course` (Id, UserId, campos da spec, `Start`, `End?`), cada uma com `Create(...)`/`Update(...)` que devolvem os erros de validação por campo.
  - `EducationLevel` (enum).
  - `Period` (estático): `Validate(start, end, mesAtual)` (RF-16) e a comparação de ordenação da linha do tempo (RF-17), usados pelas três entidades.
  - `ImageSignature` (estático): detecta JPEG/PNG/WebP pelos primeiros bytes e devolve o tipo, ou nada.
- **Application** (`Palestra.Application/Profile/`):
  - Casos de uso (um `ExecuteAsync` cada): `GetProfile`, `UpdateBio`, `UploadPhoto`, `GetPhoto`, `RemovePhoto`, `SaveOccupation`/`RemoveOccupation`, `SaveEducation`/`RemoveEducation`, `SaveCourse`/`RemoveCourse` (`Save*` cobre criar e editar: sem id cria, com id edita se o item for do usuário).
  - DTOs do contrato (`ProfileDto`, `OccupationDto`, …) e conversão `"AAAA-MM"` ⇄ `DateOnly` (texto mal formado → `invalid`).
  - `IProfileRepository`: obter perfil, foto e listas por `userId`; obter item por `(id, userId)`; adicionar/remover.
  - `ProfileOptions`.
- **Infrastructure** (`Palestra.Infrastructure`):
  - `AppDbContext`: 5 `DbSet` novos; `IEntityTypeConfiguration` para cada entidade (tamanhos máximos, `Level` como texto, FK para `users` com *cascade*, índice em `user_id`).
  - `ProfileRepository` (EF) e registro em `DependencyInjection` (repositório, casos de uso, opções).
  - Migration `AddProfile`.
- **Api** (`Palestra.Api`):
  - `ProfileController` (`[Authorize]`, rota `api/profile`), sem regra de negócio: lê o userId do cookie, delega e mapeia resultado → status.
  - `Program.cs`: CORS deve permitir `PUT` e `DELETE` além dos métodos atuais; seção `Profile` no `appsettings.json`.

## Frontend
**Rota** `/perfil` dentro de `RequireAuth` + `AppLayout` (`App.tsx`).

**Menu (RF-01)** — `layout/UserBadge.tsx` passa a ser um `NavLink` para `/perfil` (mantém iniciais no modo compacto, `aria-label` "Abrir perfil de Nome Sobrenome", estado ativo como os demais itens e foco visível). No celular/tablet, o menu fecha ao navegar, como os outros itens.

**Tela** (`src/pages/profile/`):
- `Profile.tsx`: carrega `GET /api/profile` (mostra `Skeleton` enquanto carrega, `Alert` em erro) e monta as seções em `Card`s.
- `PhotoSection`: `Avatar` grande (foto ou iniciais), botões **Enviar/Trocar foto** (input de arquivo com `accept="image/jpeg,image/png,image/webp"`) e **Remover**; valida tipo e 2 MB antes de enviar e trata `invalid_image`/`image_too_large` com `Alert`, mantendo a foto atual.
- `BioSection`: `TextArea` com contador de caracteres restantes (500) e botão **Salvar**; confirmação de sucesso.
- `TimelineSection` (genérico por *props*, usado 3×): título, botão **Adicionar**, estado vazio (RF-19), lista `<ol>` com `TimelineItem` (marcador + linha vertical, período "03/2021 — até o momento", ações **Editar**/**Remover** com confirmação inline). Entrada com a animação do design system, respeitando movimento reduzido.
- `OccupationForm`, `EducationForm`, `CourseForm`: campos da spec, validação local (obrigatórios, término ≥ início, início não futuro, horas inteiro > 0), erros do servidor (`fields`) exibidos junto ao campo.
- Após salvar/remover um item, a seção recarrega o perfil (`GET`) para refletir a ordem do servidor.
- `format.ts`: `"2021-03"` → `"03/2021"`, rótulos dos níveis e mensagens dos códigos de erro.

**Componentes novos do design system** (`src/components/`): `TextArea`, `Select`, `MonthYearField`, `Avatar` (foto com `alt` ou iniciais); ícones `Plus`, `Pencil`, `Trash`, `Camera`. Adicionados ao catálogo `/design-system`.

**Serviços** (`src/services/`): `api.ts` estendido (`PUT`, `DELETE`, `FormData`); `profileService.ts` (`getProfile`, `updateBio`, `uploadPhoto`, `removePhoto`, `photoUrl(version)`, `saveOccupation`/`removeOccupation`, `saveEducation`/`removeEducation`, `saveCourse`/`removeCourse`); `profileTypes.ts`.

**Dependências novas:** nenhuma.

## Modelo de dados (EF Core Code First)
```
profiles                                   profile_photos
 user_id        uuid PK, FK -> users.id     user_id       uuid PK, FK -> users.id
 bio            varchar(500)  NULL          content_type  varchar(20)  NOT NULL
 photo_version  timestamptz   NULL          content       bytea        NOT NULL

occupations                                educations
 id           uuid PK                       id           uuid PK
 user_id      uuid FK -> users.id (índice)  user_id      uuid FK -> users.id (índice)
 title        varchar(150)  NOT NULL        institution  varchar(150)  NOT NULL
 company      varchar(150)  NOT NULL        course       varchar(150)  NOT NULL
 start_date   date          NOT NULL        level        varchar(20)   NOT NULL
 end_date     date          NULL            start_date   date          NOT NULL
 description  varchar(1000) NULL            end_date     date          NULL
                                            description  varchar(1000) NULL
courses
 id           uuid PK
 user_id      uuid FK -> users.id (índice)
 name         varchar(150)  NOT NULL
 institution  varchar(150)  NOT NULL
 hours        int           NOT NULL
 start_date   date          NOT NULL
 end_date     date          NULL
```
Todas as FKs com `ON DELETE CASCADE`. Nomes finais seguem a convenção já usada pelo EF no projeto; o desenho é indicativo. Migration única `AddProfile`, sem dados semente, aplicada pelo comando já documentado (`docker compose exec api dotnet ef database update …`).

## Docker
Nenhuma mudança em `docker-compose.yml` nem em `.env`: a foto fica no PostgreSQL (volume `pgdata` existente). Único passo operacional: aplicar a migration `AddProfile`.

## Estratégia de verificação (const. 8.1)
Backend — `backend/tests/Palestra.Tests/Profile/` (repositório em memória + relógio falso):
| Critério de aceite | Verificação |
|---|---|
| RF-07/RF-17 ordenação | duas ocupações com inícios diferentes → `GetProfile` devolve a mais recente primeiro |
| RF-08/RF-11 item atual | item sem término é salvo com `end = null` e vem antes de outro com mesmo início |
| RF-09 gerir | `SaveOccupation` cria, edita e `RemoveOccupation` remove |
| RF-10 formação | nível fora da lista → `validation`; nível válido é salvo |
| RF-13 horas | 40 horas salva; 0 ou negativo → `validation` |
| RF-16 datas | término anterior ao início e início futuro → erro; término futuro com início válido → salvo |
| RF-22 obrigatórios | campo obrigatório vazio → `fields` com `required`, nada gravado |
| RF-05 foto | bytes que não são imagem → `invalid_image`; acima do limite → `image_too_large`; em ambos a foto anterior permanece |
| RF-03/RF-04 foto | PNG válido grava e define `photoVersion`; remover zera |
| RF-06 bio | 500 caracteres salva; 501 → `validation` |
| RF-02 isolamento | editar/remover item de outro usuário → `not_found`; `GetProfile` de B não traz itens de A |
| RF-21 persistência | verificação **manual**: preencher, Sair, entrar de novo |

Frontend — `*.test.tsx` ao lado do código (`profileService` simulado por módulo):
| Critério | Verificação |
|---|---|
| RF-01 | `Sidebar`: o nome do usuário é um link para `/perfil` |
| RF-17/RF-08 | `TimelineSection` mostra os itens na ordem recebida e "até o momento" quando não há término |
| RF-19 | seção sem itens mostra o estado vazio com **Adicionar** |
| RF-22/RF-16 | `OccupationForm` com campo vazio ou término anterior ao início mostra erro e não chama o serviço |
| RF-10 | `EducationForm` oferece exatamente os 7 níveis |
| RF-09 | remover só chama o serviço após **Confirmar** |
| RF-04/RF-05 | `PhotoSection` mostra iniciais sem foto; arquivo acima de 2 MB mostra erro e não envia |
| RF-06 | `BioSection` mostra os caracteres restantes |

Comandos: `dotnet test --project backend/tests/Palestra.Tests` · `cd frontend && npm test && npm run lint && npm run build`. Verificação final manual: `docker compose up --build` → aplicar migration → entrar → clicar no nome → enviar foto → bio → um item em cada seção → recarregar → Sair/entrar; repetir com um segundo usuário para conferir o isolamento; conferir tema escuro e celular.

## Verificação da constituição
- [x] Spec primeiro (spec em revisão, sem pendências; aprovar antes de `/tarefas`)
- [x] Simplicidade (foto no banco, sem biblioteca de imagem, sem modal, sem dependência NuGet/npm nova, sem serviço Docker novo)
- [x] Verificabilidade (tabelas acima; só a persistência entre sessões é manual)
- [x] Dependências da Arquitetura Limpa respeitadas (regras de data, ordenação e assinatura de imagem no Domain; casos de uso e interfaces em Application; EF em Infrastructure; controller só delega; mapeamento via `IEntityTypeConfiguration`)
- [x] Roda via docker compose (nenhum pré-requisito novo; migration explícita)
- [x] Segurança e privacidade (§6): dados pessoais declarados na spec (RNF-01), acessíveis só ao dono; upload validado por assinatura

## Riscos
- **Limites de texto não previstos na spec** (150/1000 caracteres, horas até 99.999): são limites técnicos; se forem considerados regra de negócio, registrar na spec antes de `/tarefas`.
- **Foto no banco:** aumenta o tamanho do banco e dos backups (até 2 MB por usuário). Aceito para a demo; migrar para armazenamento de arquivos ficaria isolado no repositório.
- **`<img>` autenticado por cookie:** funciona porque frontend e API são *same-site* em `localhost`; em domínios diferentes seria preciso buscar a imagem via `fetch` e usar blob.
- **CSRF com `multipart`:** o envio da foto não é JSON (a spec 003 se apoiava em "só JSON"); a proteção passa a depender de `SameSite=Lax` e do CORS restrito. Aceito no escopo local.
- **Assinatura não garante imagem íntegra:** um arquivo com cabeçalho válido e conteúdo corrompido é aceito e aparece como imagem quebrada; nunca é executado (`nosniff`). Aceito.
- **CORS:** `PUT`/`DELETE` e `multipart` são novos no projeto; validar a pré-verificação (preflight) logo na primeira tarefa de API.
- **Recarregar o perfil a cada gravação:** uma requisição extra por operação; simples e suficiente para o volume esperado.
