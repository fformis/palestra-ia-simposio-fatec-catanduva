# Plano: Criar vaga, curtidas e candidaturas

- **Spec:** ./spec.md (009-criar-vaga, aprovada, sem `[NEEDS CLARIFICATION]` pendente)

Feature **full-stack**: backend (vagas, imagem, curtidas, candidaturas, candidatos e perfil do candidato), frontend (item **Criar** no menu, formulário, página da vaga, lista de candidatos, perfil somente leitura e currículo para impressão). Sem mudanças no Docker.

## Decisões técnicas
| Decisão | Escolha | Justificativa | Requisitos |
|---|---|---|---|
| Quem é o usuário | Todas as rotas usam o **Id do cookie** (`ClaimTypes.NameIdentifier`), como na spec 004. A rota só traz ids de **vaga** e de **candidato**; a permissão é decidida no caso de uso | Anunciante/candidato definidos pelo servidor, nunca pelo cliente | RF-07, RF-14, RF-19, RF-23, RF-25 |
| Recurso negado | Vaga inativa para quem não é dono, lista de candidatos de vaga alheia e perfil de quem não é candidato ativo → **`404 not_found`** | Não revela a existência da vaga/candidatura; um único caminho de erro | RF-10, RF-23, RF-25 |
| Contagens | **Calculadas** (`COUNT`) a partir das tabelas `job_likes` e `job_applications`; sem contador gravado | Nunca divergem dos registros | RF-13, RF-20, RNF-04 |
| Uma curtida/candidatura por usuário | Chave primária composta `(job_id, user_id)` nas duas tabelas; curtir/candidatar são **idempotentes** (`PUT` já existente → nada muda; violação de chave por corrida é tratada como "já existe") | Banco garante a unicidade mesmo com cliques simultâneos | RF-12, RF-16, RNF-04 |
| Desistir e candidatar de novo | Desistir **apaga** a linha; nova candidatura cria outra com nova data | Sem histórico nem estado "desistiu" (não pedido na spec) | RF-17, RF-18 |
| Vaga inativa | Status guardado na vaga; nada é apagado ao inativar. Curtidas e candidaturas continuam e voltam a contar ao reativar | Decisão da spec | RF-09, RF-10 |
| Descrição com formatação | Texto com **subconjunto de Markdown**: `**negrito**`, `*itálico*`, linhas `- item` (lista) e `1. item` (lista numerada). Sem links nem HTML | Formato texto simples, fácil de validar e de contar | RF-03 |
| Renderização segura | O frontend converte o Markdown em **elementos React** (`<strong>`, `<em>`, `<ul>`, `<ol>`, `<p>`) com um parser próprio de ~40 linhas; **nunca** usa `dangerouslySetInnerHTML`. Qualquer outro texto (incluindo `<script>` ou `[x](url)`) aparece literalmente | Seguro por construção, sem biblioteca de sanitização | RNF-03 |
| Limite de 500 visíveis | `JobDescription.VisibleLength` (Domain) remove os marcadores (`**`, `*`, `- `, `1. ` no início da linha) e conta o restante; o frontend tem a mesma regra em `richText.ts` para o contador | O servidor é a autoridade; o cliente dá resposta imediata | RF-03, RF-05 |
| Editor da descrição | `TextArea` existente + barra com 4 botões (**N**, *I*, lista, lista numerada) que inserem/envolvem a seleção com os marcadores, e **pré-visualização** formatada abaixo | Sem editor WYSIWYG (dependência pesada); o usuário não precisa conhecer Markdown | RF-03 |
| Benefícios | Enum no Domain; gravados como **lista de códigos** (`text[]`, coleção primitiva do EF Core 10) na própria vaga. Códigos: `medical`, `dental`, `pet`, `gympass`, `birthday_off`; rótulos em pt-BR no frontend | Lista fixa e pequena; sem tabela de junção | RF-03 |
| Regime | Enum gravado como texto: `clt`, `pj`, `estagio` | Lista fechada da spec | RF-03 |
| Valor | `decimal(12,2)` > 0 (máx. 9.999.999.999,99); contrato `salary: number` em reais; exibição `R$ 5.000,00 / mês` via `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })` | Tipo exato para dinheiro | RF-03, RNF-07 |
| Data de criação | `CreatedAt` (`timestamptz`) definida pelo `IClock` existente na criação; nunca vem do cliente nem é alterada na edição; exibida `dd/mm/aaaa` | Não editável por construção | RF-03, RF-08 |
| Imagem da vaga | Mesma solução da foto de perfil: tabela própria `job_images` (`bytea`), validação de tamanho (2 MB) e de **assinatura** reutilizando `ImageSignature` (Domain/Profiles), `nosniff`, `Cache-Control: private`, `?v=<versão>` | Reaproveita código já testado; sem armazenamento novo | RF-04, RNF-02 |
| Criar vaga + imagem | Duas requisições: `POST /api/jobs` (JSON) e, se houver imagem, `PUT /api/jobs/{id}/image` (multipart). O formulário valida tipo e tamanho **antes** de enviar | Reaproveita o padrão de upload da spec 004; JSON fica simples | RF-04, RF-06 |
| Editar | `PUT /api/jobs/{id}` com todos os campos (inclusive status); o botão **Ativar/Inativar** da página envia a vaga atual com o status trocado. Sem exclusão | Um endpoint de escrita para a vaga | RF-08, RF-09 |
| Perfil mínimo | O caso de uso de candidatura consulta `IProfileRepository.ListAsync<Occupation>`/`<Education>` (spec 004): sem nenhuma → `400 profile_incomplete` | Reaproveita o repositório existente | RF-15 |
| Ordem alfabética | Lista ordenada **em memória** com `StringComparer.Create(pt-BR, ignoreCase)` por nome + sobrenome | Ordenação com acentos correta sem depender da *collation* do banco | RF-22 |
| Perfil do candidato | Novo caso de uso monta um `CandidateProfileDto` reutilizando `GetProfile` (spec 004) para bio e listas já ordenadas, mais nome e e-mail do `User` | Mesma ordenação e formato do perfil; sem duplicar regras | RF-24 |
| Foto do candidato | `GET /api/jobs/{id}/candidates/{userId}/photo`, autorizada pela mesma regra do RF-25; reaproveita `GetPhoto` | A rota atual `/api/profile/photo` só serve a foto do próprio usuário | RF-22, RF-24, RNF-01 |
| Currículo em PDF | **Página de impressão** no frontend (`/vagas/:id/candidatos/:userId/curriculo`), sem menu, com CSS de impressão (A4, tema claro forçado). Abre em nova aba e chama `window.print()` após carregar; o usuário escolhe **"Salvar como PDF"** no diálogo do navegador | Sem biblioteca de PDF no backend nem serviço novo no Docker (const. 2, 12); reaproveita os dados do perfil somente leitura | RF-26, RF-27, RNF-08 |
| Perfil somente leitura no front | `TimelineSection` ganha a prop `readOnly` (esconde Adicionar/Editar/Remover e usa o texto vazio "Nada informado") | Reuso do componente da spec 004 | RF-24 |
| Item de menu | `navItems` ganha `{ to: '/criar', label: 'Criar', icon: PlusIcon }` (ícone já existe) | Ponto de extensão previsto na spec 002 | RF-01 |
| Limites técnicos | Empresa: até 150 caracteres (mesmo limite técnico da spec 004) | A spec só fixa cargo (100) e descrição (500) | RF-05 |
| Configuração | Seção `Jobs` no `appsettings.json` (`MaxImageBytes`, `MaxTitleLength`, `MaxDescriptionLength`) com opções tipadas | Mesmo padrão das specs 003/004 | RF-03, RF-04 |
| Validação | `400 { code: "validation", fields }` com os códigos já usados (`required`, `too_long`, `invalid`) | Contrato existente | RF-05 |
| Testes | xUnit v3 com repositórios em memória e relógio falso; Vitest/RTL com `jobService` simulado; um por critério (const. 8.1) | Demo ao vivo | todos |
| Migration | Uma migration `AddJobs` | Const. 10 | — |

## Arquitetura
```
Frontend (React)                                   Backend (.NET 10, Arquitetura Limpa)
 Sidebar: item "Criar" ──► /criar                    Api: JobsController [Authorize] (api/jobs)
 pages/jobs/                                           │  userId = claim do cookie
   JobCreate / JobEdit (JobForm + DescriptionEditor)   ▼
   JobPage (dados, curtir, candidatar, status,       Application/Jobs: casos de uso
            lista de candidatos p/ o dono)             │  IJobRepository, IProfileRepository (004),
   CandidateProfile (somente leitura)                  │  IUserRepository (003), IClock, IUnitOfWork
   ResumePrint (página de impressão → PDF)             ▼
 services/jobService.ts                              Domain/Jobs: Job, JobImage, JobLike,
                                                       JobApplication, JobDescription, enums
                                                       ▼
                                                     Infrastructure: EF Core ──► PostgreSQL
                                                     (jobs, job_images, job_likes, job_applications)
```
Fluxos:
1. **Criar:** `/criar` → `POST /api/jobs` → (imagem? `PUT …/image`) → navega para `/vagas/{id}` com aviso de sucesso.
2. **Ver vaga:** `GET /api/jobs/{id}` devolve dados, contagens e o estado do usuário (`isOwner`, `likedByMe`, `appliedByMe`). Dono vê também a lista (`GET …/candidates`).
3. **Curtir/candidatar:** `PUT`/`DELETE` em `…/like` e `…/application` devolvem as contagens atualizadas; a tela atualiza sem recarregar.
4. **Candidato:** dono clica no candidato → `/vagas/{id}/candidatos/{userId}` → `GET …/candidates/{userId}`; **Imprimir currículo** abre `…/curriculo` em nova aba, que imprime.

## Contratos
Base: `http://localhost:8080`. Todas as rotas exigem autenticação (`401` sem sessão). JSON em camelCase.

| Método e rota | Quem | Corpo | Respostas |
|---|---|---|---|
| `POST /api/jobs` | qualquer usuário | `JobInput` | `201 Job` · `400 validation` |
| `GET /api/jobs/{id}` | todos (inativa: só o dono) | — | `200 Job` · `404 not_found` |
| `PUT /api/jobs/{id}` | dono | `JobInput` | `200 Job` · `400 validation` · `404 not_found` |
| `PUT /api/jobs/{id}/image` | dono | `multipart/form-data`, campo `file` | `200 { imageVersion }` · `400 invalid_image` · `400 image_too_large` · `404` |
| `DELETE /api/jobs/{id}/image` | dono | — | `204` · `404` |
| `GET /api/jobs/{id}/image` | quem vê a vaga | — | `200` bytes · `404` |
| `PUT /api/jobs/{id}/like` | não dono, vaga ativa | — | `200 Engagement` · `400 own_job` · `404` |
| `DELETE /api/jobs/{id}/like` | idem | — | `200 Engagement` · `404` |
| `PUT /api/jobs/{id}/application` | não dono, vaga ativa | — | `200 Engagement` · `400 own_job` · `400 profile_incomplete` · `404` |
| `DELETE /api/jobs/{id}/application` | candidato, vaga ativa | — | `200 Engagement` · `404` |
| `GET /api/jobs/{id}/candidates` | dono | — | `200 Candidate[]` (ordem alfabética) · `404` |
| `GET /api/jobs/{id}/candidates/{userId}` | dono, candidatura ativa | — | `200 CandidateProfile` · `404` |
| `GET /api/jobs/{id}/candidates/{userId}/photo` | idem | — | `200` bytes · `404` |

Curtir/candidatar de novo quando já curtiu/candidatou responde `200` sem mudar nada (idempotente). Vaga inativa responde `404` a quem não é dono em todas as rotas.

**Tipos TS** (`frontend/src/services/jobTypes.ts`):
```ts
type ContractType = 'clt' | 'pj' | 'estagio'
type Benefit = 'medical' | 'dental' | 'pet' | 'gympass' | 'birthday_off'
type JobStatus = 'active' | 'inactive'

interface JobInput {
  title: string
  company: string | null
  description: string            // Markdown restrito (negrito, itálico, listas)
  benefits: Benefit[]
  contractType: ContractType
  salary: number                 // reais, mensal
  status: JobStatus
}

interface Engagement { likes: number; candidates: number; likedByMe: boolean; appliedByMe: boolean }

interface Job extends JobInput, Engagement {
  id: string
  createdAt: string              // ISO 8601
  imageVersion: string | null    // null = ilustração padrão
  owner: { firstName: string; lastName: string }
  isOwner: boolean
}

interface Candidate {
  userId: string
  firstName: string
  lastName: string
  email: string
  photoVersion: string | null
  appliedAt: string              // ISO 8601
}

interface CandidateProfile {
  firstName: string
  lastName: string
  email: string
  bio: string | null
  photoVersion: string | null
  occupations: Occupation[]      // tipos da spec 004, já ordenados
  educations: Education[]
  courses: Course[]
}
```
`ApiErrorCode` (em `authTypes.ts`) ganha `own_job` e `profile_incomplete`.

**Configuração** (`appsettings.json`):
```json
"Jobs": { "MaxImageBytes": 2097152, "MaxTitleLength": 100, "MaxDescriptionLength": 500 }
```

## Impacto por camada (backend)
- **Domain** (`Palestra.Domain/Jobs/`), sem dependências:
  - `Job` (Id, OwnerId, Title, Company?, Description, Benefits, ContractType, Salary, Status, CreatedAt, ImageVersion?) com `Create(input, now, limites)` e `Update(input, limites)` que devolvem os erros por campo (obrigatórios, `too_long`, salário > 0, códigos de enum válidos); `IsVisibleTo(userId)` (ativa ou dono); `SetImage(now)`/`RemoveImage()`.
  - `JobImage` (JobId, ContentType, Content) — usa `ImageSignature` da spec 004.
  - `JobLike` e `JobApplication` (JobId, UserId, CreatedAt/AppliedAt).
  - `ContractType`, `Benefit`, `JobStatus` (enums) com conversão código ⇄ enum.
  - `JobDescription` (estático): `VisibleLength(texto)` (RF-03/RF-05).
- **Application** (`Palestra.Application/Jobs/`):
  - Casos de uso (um `ExecuteAsync` cada): `CreateJob`, `GetJob`, `UpdateJob`, `UploadJobImage`, `RemoveJobImage`, `GetJobImage`, `SetLike(on/off)`, `SetApplication(on/off)` (aplica RF-14, RF-15, RF-19), `ListCandidates`, `GetCandidateProfile` (reusa `GetProfile`), `GetCandidatePhoto` (reusa `GetPhoto`).
  - DTOs do contrato (`JobDto`, `EngagementDto`, `CandidateDto`, `CandidateProfileDto`) e `JobsOptions`.
  - `IJobRepository`: obter vaga (e imagem) por id; adicionar; contagens e "curtiu/candidatou" por `(jobId, userId)`; adicionar/remover curtida e candidatura; listar candidatos com nome, e-mail, versão da foto e data.
- **Infrastructure** (`Palestra.Infrastructure`):
  - `AppDbContext`: 4 `DbSet` novos; `IEntityTypeConfiguration` para cada (tamanhos, enums como texto, `benefits` como `text[]`, `salary` `numeric(12,2)`, PKs compostas, FKs com *cascade*).
  - `JobRepository` (EF): trata violação de chave única de curtida/candidatura como "já existe"; registro em `DependencyInjection` (repositório, casos de uso, opções).
  - Migration `AddJobs`.
- **Api** (`Palestra.Api`):
  - `JobsController` (`[Authorize]`, rota `api/jobs`), sem regra de negócio: lê o userId do cookie, delega e mapeia resultado → status (mesmo estilo do `ProfileController`).
  - Seção `Jobs` no `appsettings.json`. CORS já permite `PUT`/`DELETE` e multipart (spec 004).

## Frontend
**Rotas** (`App.tsx`, dentro de `RequireAuth`):
- Com `AppLayout`: `/criar` (`JobCreate`), `/vagas/:id` (`JobPage`), `/vagas/:id/editar` (`JobEdit`), `/vagas/:id/candidatos/:userId` (`CandidateProfile`).
- Sem layout (página limpa): `/vagas/:id/candidatos/:userId/curriculo` (`ResumePrint`).

**Menu (RF-01)** — `layout/navItems.ts`: item **Criar** com `PlusIcon`; no menu recolhido só o ícone (comportamento atual do `Sidebar`).

**Telas** (`src/pages/jobs/`):
- `JobForm` (usado em criar e editar): `TextField` cargo (contador 100) e empresa; campo de imagem (pré-visualização, validação JPG/PNG/WebP e 2 MB antes de enviar, botão remover); `DescriptionEditor`; benefícios em 5 *checkboxes*; `Select` regime (CLT, PJ, Estágio); valor em reais (campo numérico com sufixo "/ mês"); status (Ativo/Inativo, padrão Ativo). Erros do servidor (`fields`) junto ao campo.
- `DescriptionEditor`: barra (Negrito, Itálico, Lista, Lista numerada — botões com `aria-label`), `TextArea`, contador "N caracteres restantes" pela regra visível e pré-visualização com `RichText`.
- `RichText`: converte o Markdown restrito em elementos React (sem HTML bruto).
- `JobPage`: imagem (ou ilustração padrão), cargo, empresa, anunciante, data `dd/mm/aaaa`, regime, valor, benefícios (`Badge`), descrição (`RichText`), contagens. Para não dono: botão **Curtir/Descurtir** (`aria-pressed`) e **Candidatar-se/Desistir**, ambos com confirmação inline na candidatura (texto do RNF-01) e na desistência; `profile_incomplete` mostra `Alert` com link para `/perfil`. Para o dono: **Editar**, **Ativar/Inativar**, selo "Inativa" e `CandidateList`.
- `CandidateList`: `Avatar` (foto via rota do candidato ou iniciais), nome, e-mail, data da candidatura; cada item leva ao perfil do candidato; estado vazio "Nenhum candidato ainda".
- `CandidateProfile`: `Avatar`, nome, e-mail, bio e as três `TimelineSection readOnly`; botão **Imprimir currículo** (abre `…/curriculo` em nova aba) e **Voltar à vaga**.
- `ResumePrint`: mesmo conteúdo em layout de currículo (A4, tema claro forçado, sem menu/cabeçalho, sem menção à vaga), chama `window.print()` quando os dados chegam e oferece um botão "Imprimir / salvar PDF" oculto na impressão.
- `format.ts`: rótulos de regime e benefícios, `formatSalary`, `formatDate`.

**Alterações em código existente:** `TimelineSection` (prop `readOnly`), `navItems.ts`, `App.tsx`, `authTypes.ts` (novos códigos de erro).

**Serviços** (`src/services/`): `jobService.ts` (`create`, `get`, `update`, `uploadImage`, `removeImage`, `imageUrl`, `like`, `unlike`, `apply`, `withdraw`, `candidates`, `candidateProfile`, `candidatePhotoUrl`) e `jobTypes.ts`.

**Dependências novas:** nenhuma.

## Modelo de dados (EF Core Code First)
```
jobs                                          job_images
 id             uuid PK                        job_id        uuid PK, FK -> jobs.id
 owner_id       uuid FK -> users.id (índice)   content_type  varchar(20) NOT NULL
 title          varchar(100)   NOT NULL        content       bytea       NOT NULL
 company        varchar(150)   NULL
 description    varchar(2000)  NOT NULL   (texto com marcadores; o limite de 500 visíveis é regra do Domain)
 benefits       text[]         NOT NULL
 contract_type  varchar(10)    NOT NULL
 salary         numeric(12,2)  NOT NULL
 status         varchar(10)    NOT NULL
 created_at     timestamptz    NOT NULL
 image_version  timestamptz    NULL

job_likes                                     job_applications
 job_id      uuid FK -> jobs.id  ┐ PK          job_id      uuid FK -> jobs.id  ┐ PK
 user_id     uuid FK -> users.id ┘             user_id     uuid FK -> users.id ┘
 created_at  timestamptz NOT NULL              applied_at  timestamptz NOT NULL
```
Todas as FKs com `ON DELETE CASCADE`. Nomes finais seguem a convenção já usada pelo EF no projeto; o desenho é indicativo. Migration única `AddJobs`, sem dados semente, aplicada na inicialização da API ou pelo comando documentado.

## Docker
Nenhuma mudança em `docker-compose.yml` nem em `.env`: imagens no PostgreSQL (volume existente), PDF gerado pelo navegador. Único passo operacional: aplicar a migration `AddJobs`.

## Estratégia de verificação (const. 8.1)
Backend — `backend/tests/Palestra.Tests/Jobs/` (repositórios em memória + relógio falso):
| Critério de aceite | Verificação |
|---|---|
| RF-03/RF-06 criar | `CreateJob` válido grava com status Ativo, `CreatedAt` do relógio e dono = usuário |
| RF-03 benefícios/regime | código de benefício ou regime fora da lista → `validation` |
| RF-05 validação | cargo vazio, salário 0 ou descrição com 501 caracteres visíveis → `validation`, nada gravado; 500 visíveis com marcadores → salvo |
| RF-04 imagem | bytes que não são imagem → `invalid_image`; acima de 2 MB → `image_too_large` |
| RF-08 editar | dono altera o valor e a data de criação não muda; outro usuário → `not_found` |
| RF-10 inativa | vaga inativa: `GetJob` do dono ok, de outro usuário → `not_found` |
| RF-12/RF-13 curtidas | curtir → 1; curtir de novo → 1; descurtir → 0 |
| RF-14/RF-19 dono | dono curtir ou candidatar-se → `own_job` |
| RF-15 perfil mínimo | usuário sem ocupação nem formação → `profile_incomplete` |
| RF-16/RF-17/RF-18 candidatura | candidatar → 1 candidato; desistir → 0; candidatar de novo → 1 |
| RF-22/RF-23 lista | candidatos "Carla" e "Ana" → lista Ana, Carla com e-mail; não dono → `not_found` |
| RF-24/RF-25 perfil | dono obtém perfil (nome, e-mail, bio, listas) de candidato ativo; de não candidato ou desistente → `not_found` |

Frontend — `*.test.tsx` ao lado do código (`jobService` simulado por módulo):
| Critério | Verificação |
|---|---|
| RF-01 | `Sidebar` mostra o item **Criar** ligado a `/criar` |
| RF-03 | `JobForm` oferece exatamente os 5 benefícios e os regimes CLT, PJ e Estágio; status vem Ativo |
| RF-05 | `JobForm` com cargo vazio ou valor 0 mostra erro e não chama o serviço |
| RF-03/RNF-03 | `RichText` renderiza `**a**`, `*b*` e listas como `strong`/`em`/`ul`; `<script>` aparece como texto |
| RF-03 | `DescriptionEditor` conta só os caracteres visíveis |
| RF-04 | arquivo acima de 2 MB mostra erro e não envia |
| RF-14/RF-19 | `JobPage` do dono não mostra Curtir nem Candidatar-se |
| RF-16/RF-21 | candidatar exige confirmação; depois mostra "Desistir" e a contagem atualizada |
| RF-15 | `profile_incomplete` mostra a mensagem com link para o perfil |
| RF-24 | `CandidateProfile` não mostra ações de edição |
| RF-26 | `ResumePrint` exibe nome, e-mail e seções, não cita a vaga e chama `window.print` |

Comandos: `dotnet test --project backend/tests/Palestra.Tests` · `cd frontend && npm test && npm run lint && npm run build`. Verificação final manual: `docker compose up --build` → entrar com um usuário de teste → **Criar** vaga com imagem, descrição formatada e benefícios → entrar com outro usuário, abrir `/vagas/{id}`, curtir e candidatar-se → voltar ao anunciante, ver lista, abrir o perfil, imprimir e salvar o PDF → inativar e conferir que o outro usuário não vê a vaga; conferir tema escuro e celular.

## Verificação da constituição
- [x] Spec primeiro (spec 009 aprovada, sem pendências)
- [x] Simplicidade (sem dependência NuGet/npm nova, sem serviço Docker novo, contagens calculadas, PDF pelo navegador, Markdown restrito com parser próprio mínimo)
- [x] Verificabilidade (tabelas acima; só o "salvar como PDF" final é manual)
- [x] Dependências da Arquitetura Limpa respeitadas (regras de vaga, descrição e imagem no Domain; casos de uso e interfaces em Application; EF em Infrastructure; controller só delega; mapeamento via `IEntityTypeConfiguration`)
- [x] Roda via docker compose (nenhum pré-requisito novo; migration aplicada na inicialização)
- [x] Segurança e privacidade (§6): ampliação de acesso ao perfil declarada na spec (RNF-01) e limitada a candidaturas ativas do anunciante; e-mail exposto só nesse contexto; upload validado por assinatura; descrição renderizada sem HTML

## Riscos
- **PDF pelo diálogo de impressão:** o arquivo é gerado pelo navegador ("Salvar como PDF"); o resultado depende do navegador e o teste automático só verifica a página de impressão e a chamada a `window.print`. Se for exigido um download direto de `.pdf`, será preciso gerar no backend com uma biblioteca (ex.: QuestPDF) — mudança de plano a decidir antes de `/tarefas`.
- **Regra de contagem duplicada:** `VisibleLength` existe no Domain e no frontend; divergências fariam o contador discordar do servidor. Mitigação: mesmas regras, testadas dos dois lados com o mesmo exemplo.
- **Markdown restrito:** usuários podem digitar marcadores à mão de forma incompleta (ex.: `**a`); o texto aparece literalmente, sem quebrar a página.
- **Sem listagem de vagas:** até as specs futuras, as vagas só são encontradas pelo endereço (`/vagas/{id}`); na demo, o anunciante compartilha o link.
- **Candidato não desiste de vaga inativa:** aceito pela spec; o candidato também não vê a vaga até ela ser reativada.
- **Corrida em curtir/candidatar:** tratada pela chave composta + captura da violação; um teste de concorrência real não faz parte da suíte (const. 8.1).
- **Ordenação com `pt-BR`:** depende de ICU na imagem `mcr.microsoft.com/dotnet/sdk:10.0` (Debian, já incluído); em imagem com globalização invariante, a ordem de nomes acentuados mudaria.
- **Limite de empresa (150) e `description varchar(2000)`:** limites técnicos não fixados na spec; se forem regra de negócio, registrar na spec antes de `/tarefas`.
