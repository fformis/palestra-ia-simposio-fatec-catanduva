# Plano: Feed de vagas

- **Spec:** ./spec.md (010-feed-vagas, aprovada, sem `[NEEDS CLARIFICATION]` pendente)

Feature **full-stack, de leitura**: o backend ganha um endpoint de listagem paginada de vagas (e a foto do anunciante); o frontend troca a Home pelo feed com switch, rolagem infinita e cards. Curtir, candidatar-se e desistir **reutilizam** os endpoints e regras da spec 009 sem alteração. Sem mudanças no Docker.

## Decisões técnicas
| Decisão | Escolha | Justificativa | Requisitos |
|---|---|---|---|
| Endpoint do feed | `GET /api/jobs?scope=all\|mine&cursor=…` no `JobsController` existente | Um único endpoint para as duas visões; o filtro é decidido no servidor a partir do usuário do cookie | RF-03, RF-05, RF-06 |
| Paginação | **Por cursor (keyset)** sobre `(created_at DESC, id DESC)`; página fixa de **10** (`JobsOptions.FeedPageSize`). O cursor é opaco (`"{createdAtTicks}_{id}"` em base64url) e vem em `nextCursor` (nulo = fim) | Ordem estável e sem repetir/pular vagas mesmo se outra vaga for criada durante a rolagem (offset falharia nesse caso); o `id` desempata datas iguais | RF-07, RF-08, RNF-01 |
| Filtro "Todas" | `status = active` (inclui as do próprio usuário) | Decisão da spec | RF-05, RNF-02 |
| Filtro "Minhas" | `owner_id = usuário`, qualquer status | Decisão da spec; o card mostra o selo "Inativa" pelo campo `status` já existente no `Job` | RF-06 |
| Item do feed | Reutiliza o tipo **`Job`** da spec 009 (com `likes`, `candidates`, `likedByMe`, `appliedByMe`, `isOwner`) | O card e a página da vaga falam o mesmo contrato; as ações do card usam os endpoints existentes | RF-12, RF-13, RF-17 a RF-21 |
| Consulta | Um método `ListFeedAsync` no `IJobRepository` que devolve as 10 vagas **já com** nome/foto do anunciante e contagens/estado do usuário em **uma projeção EF** (subconsultas `COUNT`/`EXISTS`) | Evita N+1 (10 vagas × 5 consultas); contagens continuam calculadas (spec 009) | RF-13, RNF-01 |
| Índice | Índice `(status, created_at DESC, id DESC)` e `(owner_id, created_at DESC, id DESC)` em `jobs` — migration `AddJobFeedIndexes` | Keyset eficiente nas duas visões | RNF-01 |
| Foto do anunciante | `OwnerDto` ganha `photoVersion`; nova rota `GET /api/jobs/{id}/owner/photo`, autorizada pela visibilidade da vaga (`IsVisibleTo`), reaproveitando `GetPhoto` (spec 004) | A rota de foto atual só serve o próprio usuário; o acesso fica restrito a quem vê a vaga, como declarado na spec (RNF-02) | RF-12, RNF-02 |
| Home | A rota índice (`/`) passa a renderizar `Feed`; `Home.tsx` é removido. `navItems` não muda (rótulo "Home") | Decisão da spec | RF-01, RF-02 |
| Switch | Componente `SegmentedSwitch` (dois botões com `role="radio"` dentro de `role="radiogroup"`, setas trocam a opção); estado só em memória, inicia em `all` | Acessível por teclado sem dependência; não lembra a escolha (decisão da spec) | RF-03, RF-04, RNF-05 |
| Rolagem infinita | Hook `useJobFeed(scope)` (lista, cursor, `loading`, `error`, `done`, `loadMore`, `updateJob`) + **sentinela** observada por `IntersectionObserver` (margem de 300px). Um botão **"Carregar mais"** fica disponível como alternativa por teclado/leitor de tela | Sem biblioteca de virtualização; 10 por vez é leve. A troca de `scope` zera a lista e reinicia; respostas atrasadas da visão anterior são descartadas | RF-08, RF-09, RNF-05 |
| Ações no card | Extrair de `JobPage` o componente **`JobActions`** (curtir/descurtir, candidatar-se/desistir com confirmação inline, `profile_incomplete` com link ao perfil) e usá-lo **na página e no card** | Mesmo comportamento por construção; sem duplicar regras de UI | RF-17 a RF-19 |
| Atualização no card | `JobActions` devolve o `Engagement` recebido e o feed faz `updateJob(id, engagement)` só naquele item | Não recarrega a lista nem perde a rolagem | RF-21 |
| "ver mais" | Descrição renderizada com `RichText` (spec 009) num contêiner com `-webkit-line-clamp: 3`; um `ResizeObserver` compara `scrollHeight > clientHeight` para mostrar "ver mais". Expandido remove o clamp e mostra "ver menos" (`aria-expanded`) | CSS nativo; só aparece quando de fato há corte | RF-15, RNF-05 |
| Imagem | `<img>` com `jobService.imageUrl` só quando `imageVersion` existe; sem área de imagem caso contrário; `loading="lazy"` | Decisão da spec; não baixa imagens fora da tela | RF-14 |
| Layout do card | `Card` do design system, `max-width: 600px`, `margin-inline: auto` dentro do conteúdo do `AppLayout` (que já desconta o menu); largura total abaixo disso | Centraliza no espaço útil com menu expandido/recolhido | RF-11, RNF-04 |
| Formatos | `formatSalary`, `formatDate` e rótulos de regime de `pages/jobs/format.ts` (spec 009) | Reuso | RF-12, RF-13, RNF-06 |
| Testes | xUnit v3 com repositório em memória e relógio falso para a paginação/filtros; Vitest/RTL com `jobService` simulado e `IntersectionObserver` falso; um por critério (const. 8.1) | Demo ao vivo | todos |

## Arquitetura
```
Frontend (React)                                    Backend (.NET 10, Arquitetura Limpa)
 / (índice) ──► pages/feed/Feed                      Api: JobsController [Authorize]
   ├─ SegmentedSwitch (all | mine)                     GET api/jobs?scope&cursor   (novo)
   ├─ useJobFeed(scope) ── jobService.feed ──────►     GET api/jobs/{id}/owner/photo (novo)
   ├─ JobCard × N                                      │ userId = claim do cookie
   │    ├─ cabeçalho (Avatar, nome, data, cargo→link)  ▼
   │    ├─ imagem? · RichText (3 linhas + ver mais)  Application/Jobs: ListFeed (novo),
   │    ├─ regime · valor · contagens                  GetOwnerPhoto (novo) · FeedCursor
   │    └─ JobActions (extraído de JobPage) ──────►     SetLike / SetApplication (spec 009)
   └─ sentinela (IntersectionObserver) + "Carregar mais"   ▼
                                                     Infrastructure: JobRepository.ListFeedAsync
                                                       (projeção única, keyset) ──► PostgreSQL
```
Fluxo: abrir `/` → `GET /api/jobs?scope=all` → 10 cards → sentinela visível → `GET …&cursor=X` → +10 … até `nextCursor = null` ("Não há mais vagas"). Trocar o switch → lista zerada → `GET …?scope=mine`. Curtir/candidatar no card → endpoints da 009 → atualiza só aquele card.

## Contratos
Base: `http://localhost:8080`. Autenticação obrigatória (`401` sem sessão). JSON em camelCase.

| Método e rota | Quem | Parâmetros | Respostas |
|---|---|---|---|
| `GET /api/jobs` | qualquer usuário | `scope` = `all` (padrão) ou `mine`; `cursor` opcional | `200 JobFeedPage` · `400 validation` (`scope` ou `cursor` inválido) |
| `GET /api/jobs/{id}/owner/photo` | quem vê a vaga | — | `200` bytes (`nosniff`, `Cache-Control: private`) · `404` (vaga não visível ou anunciante sem foto) |

Endpoints da spec 009 usados sem mudança: `PUT/DELETE /api/jobs/{id}/like`, `PUT/DELETE /api/jobs/{id}/application`, `GET /api/jobs/{id}/image`.

**Tipos TS** (`frontend/src/services/jobTypes.ts`):
```ts
type FeedScope = 'all' | 'mine'

interface JobFeedPage {
  items: Job[]                 // até 10, mais recente primeiro
  nextCursor: string | null    // null = não há mais vagas
}

// alteração no tipo existente
interface Job {
  // ...campos da spec 009
  owner: { firstName: string; lastName: string; photoVersion: string | null }
}
```
**Serviço** (`jobService.ts`): `feed(scope: FeedScope, cursor?: string)` e `ownerPhotoUrl(id, version)`.

**Configuração** (`appsettings.json`, seção `Jobs` existente): `"FeedPageSize": 10`.

## Impacto por camada (backend)
- **Domain:** nenhuma mudança (`Job.IsVisibleTo`/`IsOwner` e `JobStatus` já existem).
- **Application** (`Palestra.Application/Jobs/`):
  - `FeedCursor` (estático): `Encode(createdAt, id)` / `TryDecode(text, out createdAt, out id)`.
  - `FeedQuery(Guid UserId, bool Mine, DateTimeOffset? AfterCreatedAt, Guid? AfterId, int Take)` e `FeedRow(Job Job, string OwnerFirstName, string OwnerLastName, DateTimeOffset? OwnerPhotoVersion, EngagementDto Engagement)`.
  - `IJobRepository.ListFeedAsync(FeedQuery, ct)` → `IReadOnlyList<FeedRow>`.
  - Caso de uso `ListFeed`: valida `scope`/`cursor` (`400 validation`), busca `Take = PageSize + 1` para saber se há próxima página, monta `JobFeedPageDto(Items, NextCursor)` com `JobDto.From`.
  - Caso de uso `GetOwnerPhoto`: `FindVisibleAsync` + `GetPhoto` (spec 004) do `OwnerId`.
  - `OwnerDto` ganha `PhotoVersion`; `JobReader.ToDtoAsync` passa a preenchê-lo (via `IProfileRepository`).
  - `JobsOptions.FeedPageSize = 10`.
- **Infrastructure:**
  - `JobRepository.ListFeedAsync`: `Where` por escopo + condição keyset `(CreatedAt < c) || (CreatedAt == c && Id < id)`, `OrderByDescending(CreatedAt).ThenByDescending(Id)`, `Take`, projeção com join em `users`/perfil e subconsultas de contagem/existência.
  - `JobConfiguration`: os dois índices compostos. Migration `AddJobFeedIndexes`.
  - Registro dos novos casos de uso em `DependencyInjection`.
- **Api:** `JobsController` ganha `[HttpGet] Feed(string? scope, string? cursor)` e `[HttpGet("{id:guid}/owner/photo")] OwnerPhoto(id)`, só delegando (mesmo estilo dos demais).

## Frontend
**Rotas** (`App.tsx`): `<Route index element={<Feed />} />`; remove `Home` (e `pages/Home.tsx`). Nada muda em `navItems`.

**Novos** (`src/pages/feed/`):
- `Feed.tsx`: título + `SegmentedSwitch` no cabeçalho da página; lista de `JobCard`; `Skeleton` durante o primeiro carregamento; `Spinner` ao carregar mais; `Alert` de erro com **Tentar novamente** (mantém os cards); fim: "Não há mais vagas."; vazio: "Nenhuma vaga anunciada ainda." / em "Minhas": "Você ainda não criou vagas." + `Button` para `/criar`.
- `useJobFeed.ts`: estado da lista por `scope`, `loadMore` sem chamadas duplicadas, descarte de respostas de `scope` anterior, `updateJob(id, engagement)`.
- `JobCard.tsx`: `Card` com cabeçalho (`Avatar` com foto via `ownerPhotoUrl` ou iniciais, nome, `formatDate(createdAt)`, cargo como `Link` para `/vagas/:id`, empresa, `Badge` "Inativa" se `status = inactive`); imagem opcional; `ClampedText` com a descrição; linha com regime e `formatSalary`; contagens; `JobActions` (oculto se `isOwner`).
- `ClampedText.tsx`: 3 linhas + "ver mais"/"ver menos" (`aria-expanded`).
- `SegmentedSwitch.tsx` em `src/components/` (componente genérico do design system): duas opções, teclado (setas), estado anunciado.
- `feed.module.css`: coluna centralizada (`max-width: 600px; margin-inline: auto`), espaçamento entre cards, clamp.

**Alterados:**
- `pages/jobs/JobPage.tsx`: extrai `JobActions.tsx` (mesma pasta) com props `job` e `onChange(engagement)`; a página passa a usá-lo, sem mudança visível.
- `services/jobService.ts` e `jobTypes.ts`: `feed`, `ownerPhotoUrl`, `FeedScope`, `JobFeedPage`, `owner.photoVersion`.
- A página da vaga **não** passa a exibir a foto do anunciante (fora do escopo); `owner.photoVersion` é usado só no card.

**Dependências novas:** nenhuma.

## Modelo de dados (EF Core Code First)
Sem novas tabelas nem colunas. Migration `AddJobFeedIndexes`:
```
jobs: índice ix_jobs_status_created_at_id   (status, created_at DESC, id DESC)
      índice ix_jobs_owner_id_created_at_id (owner_id, created_at DESC, id DESC)  -- substitui o índice simples em owner_id
```

## Docker
Nenhuma mudança em `docker-compose.yml` nem `.env`. Migration aplicada na inicialização da API (ou pelo comando documentado).

## Estratégia de verificação (const. 8.1)
Backend — `backend/tests/Palestra.Tests/Jobs/FeedTests.cs` (repositório em memória com a mesma regra keyset + relógio falso):
| Critério de aceite | Verificação |
|---|---|
| RF-05 | `scope=all` com vagas ativas e inativas de outro anunciante → só as ativas (e a vaga ativa do próprio usuário aparece) |
| RF-06 | `scope=mine` → só as vagas do usuário, inclusive a inativa |
| RF-07/RF-08 | 25 vagas com datas distintas (duas com a mesma data) → páginas de 10, 10 e 5, ordem decrescente, sem repetição, `nextCursor` nulo na última |
| RF-08 | `cursor` inválido → `validation` |
| RNF-02 | `GetOwnerPhoto` de vaga inativa por outro usuário → nulo (`404`) |

Frontend — `src/pages/feed/feed.test.tsx` (`jobService` simulado, `IntersectionObserver` falso que dispara a sentinela):
| Critério | Verificação |
|---|---|
| RF-01 | rota `/` renderiza o feed e não o texto de boas-vindas |
| RF-03/RF-06 | trocar o switch para "Minhas vagas" chama `feed('mine')` e mostra só os itens retornados |
| RF-08 | sentinela visível chama `feed('all', cursor)` e acrescenta os cards; com `nextCursor` nulo mostra "Não há mais vagas" |
| RF-10 | "Minhas vagas" vazio mostra o convite com link para `/criar` |
| RF-12/RF-13/RF-16 | card exibe anunciante, data, cargo (link `/vagas/:id`), empresa, "CLT", "R$ 5.000,00 / mês" e contagens; selo "Inativa" quando inativa |
| RF-14 | sem `imageVersion` não há `<img>` de vaga |
| RF-15 | com overflow simulado aparece "ver mais" e alterna para "ver menos"; sem overflow não aparece |
| RF-17/RF-21 | curtir no card chama `like` e o botão vira "Descurtir" sem nova chamada a `feed` |
| RF-18/RF-19 | candidatar exige confirmação e depois mostra "Desistir"; card do próprio usuário não tem curtir/candidatar |

Os testes existentes de `JobPage` (spec 009) continuam passando após a extração de `JobActions` (regressão).

Comandos: `dotnet test --project backend/tests/Palestra.Tests` · `cd frontend && npm test && npm run lint && npm run build`. Verificação final manual: `docker compose up --build` → entrar com um usuário de teste → feed com vagas mais recentes primeiro → rolar até o fim → alternar para "Minhas vagas" → curtir/candidatar no card → conferir "ver mais", tema escuro, celular e menu recolhido (card centralizado, sem rolagem horizontal).

## Verificação da constituição
- [x] Spec primeiro (spec 010 aprovada, sem pendências)
- [x] Simplicidade (um endpoint de leitura + uma rota de foto; sem dependências novas; reaproveita `Job`, `RichText`, `format.ts` e as ações da 009)
- [x] Verificabilidade (tabelas acima; só o aspecto visual final é manual)
- [x] Dependências da Arquitetura Limpa respeitadas (cursor e caso de uso em Application, consulta EF em Infrastructure, controller só delega; Domain intacto)
- [x] Roda via docker compose (sem serviço novo; migration automática)
- [x] Segurança e privacidade (§6): feed nunca devolve vagas inativas de terceiros; foto do anunciante só para quem vê a vaga dele, como declarado na spec (RNF-02); nenhum dado de candidato no feed

## Riscos
- **Extração de `JobActions`:** mexe na página da vaga já entregue; mitigado pelos testes da spec 009, que precisam continuar verdes.
- **Precisão do cursor:** `timestamptz` do PostgreSQL tem precisão de microssegundos e `DateTimeOffset` de 100 ns; o cursor deve usar o valor lido do banco (não o do relógio), senão a comparação keyset pode pular uma vaga. Teste com datas iguais cobre o desempate por `id`.
- **"ver mais" em jsdom:** não há layout no ambiente de teste; o overflow é simulado (definindo `scrollHeight`/`clientHeight`). O comportamento real é conferido na verificação manual.
- **`IntersectionObserver`:** ausente em jsdom (stub nos testes); o botão "Carregar mais" garante o uso mesmo se a observação falhar.
- **Foto do anunciante:** amplia levemente a exposição de dados do perfil (foto visível a quem vê a vaga). Está declarado na spec (RNF-02); se não for desejado, o card usa só as iniciais e a rota nova sai do plano.
- **Feed não é em tempo real:** vagas criadas durante a rolagem só aparecem ao recarregar ou trocar o switch (fora de escopo na spec).
