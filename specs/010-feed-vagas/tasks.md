# Tarefas: Feed de vagas

- **Plano:** ./plan.md
- **Spec:** ./spec.md

Formato: `- [ ] T-01 [RF-01] descrição (arquivo/área) — Verificação: …`

**Notas da implementação** (ajustes em relação ao plano, sem mudança de comportamento):
- T-04/T-05: nos testes, cada vaga é criada com o relógio avançado 1 minuto. Sem isso, vagas com a mesma data ficavam ordenadas pelo id aleatório e o teste ficava instável.
- T-08: o desempate pelo id usa `Id.CompareTo(after) < 0`, que o EF/Npgsql converte para comparação de `uuid` no SQL. Funcionou contra o PostgreSQL real (T-21).
- T-14: a mensagem "Candidatura enviada." passou a aparecer dentro de `JobActions`, logo abaixo dos botões, e não mais no topo da página da vaga. A mensagem de criação e a de ativar/inativar continuam no topo. Os testes da spec 009 passaram sem alteração.
- T-16: a classe do botão "ver mais" é `.toggle`, para não colidir com `.more` (área da sentinela).
- T-19: o seletor de tema do cabeçalho também usa `role="radio"`; os testes do feed buscam o switch pelo nome das opções.
- T-21: verificado pela API com dois usuários de teste e 11 vagas `Teste feed 01…11` criadas para a validação (a `05` está inativa). Resultados: "Todas" em páginas de 10 + 3, sem repetição e em ordem decrescente; "Minhas" inclui a inativa; `scope`/`cursor` inválidos → 400; sem sessão → 401; vaga inativa e foto do anunciante dela → 404 para outro usuário; a foto vem com `nosniff` e `Cache-Control: private`. No navegador:
  - rolagem infinita de 10 → 13 cards e "Não há mais vagas.";
  - "ver mais"/"ver menos" com `aria-expanded`;
  - descrição curta sem "ver mais";
  - "Minhas vagas" pela seta do teclado, com o selo "Inativa";
  - card de outro anunciante com Curtir e Candidatar-se, e card próprio sem ações;
  - celular sem rolagem horizontal;
  - desktop com o card centralizado com o menu expandido e recolhido.

  Não foram feitos no navegador: curtir/candidatar-se de verdade (a sessão aberta era a do anunciante; isso está coberto pelos testes Vitest e pelos endpoints da spec 009) e o carregamento do cabeçalho da 2ª página com datas idênticas (coberto pelo teste xUnit).

A ordem segue as dependências: Application → Infrastructure → Api → Frontend → Validação. O Domain não muda. Não há tarefas de Docker, porque o `docker-compose.yml` e o `.env` ficam como estão; só entra uma migration de índices.

## Backend — Application (`Palestra.Application/Jobs`)
- [x] T-01 [RF-07, RF-08] Criar `FeedCursor` com dois métodos: `Encode(createdAt, id)`, que gera `"{ticks}_{id}"` em base64url, e `TryDecode(texto, out createdAt, out id)`. Texto malformado → `false` — Verificação: teste xUnit: um cursor codificado e depois decodificado devolve a mesma data e o mesmo id; `"xyz"` → `false`.
- [x] T-02 [RF-05, RF-06, RF-12, RF-13] Adicionar ao contrato `FeedQuery(UserId, Mine, AfterCreatedAt?, AfterId?, Take)`, `FeedRow(Job, OwnerFirstName, OwnerLastName, OwnerPhotoVersion?, Engagement)`, `JobFeedPageDto(Items, NextCursor)` e `IJobRepository.ListFeedAsync(FeedQuery)`; `OwnerDto` passa a ter `PhotoVersion`; `JobsOptions.FeedPageSize = 10` — Verificação: `dotnet build` sem erros.
- [x] T-03 [RF-12] `JobReader.ToDtoAsync` passa a preencher `OwnerDto.PhotoVersion` com a foto do perfil do anunciante, via `IProfileRepository` — Verificação: os testes da spec 009 continuam passando (`dotnet test`).
- [x] T-04 [RF-05, RF-06, RF-07, RF-08] Implementar `ListFeed` no `JobStore` em memória dos testes (`Palestra.Tests/Jobs`), com o mesmo filtro e a mesma ordem keyset: `created_at` decrescente e, no empate, `id` decrescente — Verificação: usado pelos testes de T-05 a T-07.
- [x] T-05 [RF-05, RF-06] Caso de uso `ListFeed(userId, scope, cursor)`. `scope` `all` (padrão) traz só as vagas ativas, inclusive as do próprio usuário; `mine` traz todas as vagas do usuário, inclusive as inativas. `scope` desconhecido → `validation` — Verificação: testes xUnit em `FeedTests.cs`: com vagas ativas e inativas de outro anunciante e uma vaga ativa do usuário, `all` devolve as ativas, incluindo a dele; com uma vaga ativa e uma inativa do usuário, `mine` devolve as duas e nenhuma de terceiros.
- [x] T-06 [RF-07, RF-08] Paginar o `ListFeed`: busca `PageSize + 1` vagas, devolve 10 e preenche `NextCursor` com a última devolvida, ou nulo se não houver mais. Cursor inválido → `validation` — Verificação: teste xUnit: 25 vagas, duas delas com a mesma data, vêm em páginas de 10, 10 e 5, em ordem decrescente e sem repetição, com `NextCursor` nulo na última página; o cursor `"xyz"` → `validation`.
- [x] T-07 [RF-12, RNF-02] Caso de uso `GetOwnerPhoto(userId, jobId)`: chama `FindVisibleAsync` e, se a vaga for visível, `GetPhoto` (spec 004) do anunciante; caso contrário, nulo — Verificação: teste xUnit: quando outro usuário pede a foto do anunciante de uma vaga inativa → nulo.

## Backend — Infrastructure
- [x] T-08 [RF-05 a RF-08, RF-12, RF-13] Implementar `JobRepository.ListFeedAsync` com o filtro de escopo, a condição keyset `(CreatedAt < c) || (CreatedAt == c && Id < id)`, ordenação por `CreatedAt` e `Id` decrescentes, `Take` e **uma única projeção**, que junta nome e foto do anunciante, contagens e `likedByMe`/`appliedByMe` — Verificação: `dotnet build`; consulta conferida na T-21, na API (página com 10 itens e contagens corretas).
- [x] T-09 [RNF-01] Em `JobConfiguration`, trocar o índice simples de `OwnerId` por `(OwnerId, CreatedAt DESC, Id DESC)` e adicionar `(Status, CreatedAt DESC, Id DESC)`; gerar a migration `AddJobFeedIndexes` — Verificação: a migration contém só criação e remoção de índices; `dotnet ef database update` aplica sem erro.
- [x] T-10 [RF-05, RF-12] Registrar `ListFeed` e `GetOwnerPhoto` em `DependencyInjection` e incluir `"FeedPageSize": 10` na seção `Jobs` do `appsettings.json` — Verificação: a API sobe (`GET /health` → 200).

## Backend — Api
- [x] T-11 [RF-03, RF-05 a RF-08] Em `JobsController`, criar `[HttpGet] Feed(scope, cursor)`, que só delega: `200 JobFeedPage` ou `400 validation` — Verificação: `curl` autenticado em `/api/jobs?scope=all` → 200 com `items` e `nextCursor`; `?scope=x` → 400; sem sessão → 401.
- [x] T-12 [RF-12, RNF-02] Em `JobsController`, criar `[HttpGet("{id:guid}/owner/photo")]`, com `nosniff` e `Cache-Control: private`, como as demais fotos — Verificação: `curl` → 200 com bytes para uma vaga visível cujo anunciante tem foto; 404 para uma vaga inativa de terceiro.

## Frontend — serviços e componentes base
- [x] T-13 [RF-05, RF-06, RF-12] Em `jobTypes.ts`, adicionar `FeedScope`, `JobFeedPage` e `owner.photoVersion`; em `jobService.ts`, adicionar `feed(scope, cursor?)` e `ownerPhotoUrl(id, version)` — Verificação: `npm run build` sem erros de tipo.
- [x] T-14 [RF-17, RF-18, RF-19] Extrair de `JobPage.tsx` o componente `pages/jobs/JobActions.tsx`, com props `job` e `onChange(engagement)`, que reúne curtir/descurtir, candidatar-se/desistir com confirmação e o aviso `profile_incomplete`; `JobPage` passa a usá-lo — Verificação: os testes de `jobs.test.tsx` (spec 009) continuam passando sem alteração.
- [x] T-15 [RF-03, RF-04, RNF-05] Criar `components/SegmentedSwitch.tsx`: duas opções em `role="radiogroup"` com `role="radio"` e `aria-checked`, troca de opção pelas setas, estilos do design system nos dois temas — Verificação: teste Vitest: o clique e a seta para a direita trocam a opção selecionada e chamam `onChange`.
- [x] T-16 [RF-15, RNF-05] Criar `pages/feed/ClampedText.tsx`: limita o texto a 3 linhas (`-webkit-line-clamp`) e usa um `ResizeObserver` para detectar se ele foi cortado; quando foi, mostra "ver mais"/"ver menos" com `aria-expanded` — Verificação: teste Vitest: com `scrollHeight` maior que `clientHeight` simulado, aparece "ver mais", que alterna para "ver menos"; sem corte, o botão não aparece.

## Frontend — feed
- [x] T-17 [RF-11 a RF-14, RF-16, RF-17] Criar `pages/feed/JobCard.tsx`, com:
  - cabeçalho: `Avatar` com foto ou iniciais, nome, `formatDate`, cargo como link para `/vagas/:id`, empresa e `Badge` "Inativa";
  - imagem só se houver `imageVersion` (`loading="lazy"`);
  - descrição em `ClampedText` com `RichText`;
  - regime e `formatSalary`, contagens e `JobActions` (oculto se `isOwner`);
  - CSS centralizado com `max-width: 600px`.

  Verificação: testes Vitest:
  - exibe anunciante, data, "Dev .NET" (link), "Acme", "CLT", "R$ 5.000,00 / mês" e as contagens;
  - mostra o selo "Inativa" quando a vaga está inativa;
  - sem `imageVersion`, não há `<img>` da vaga;
  - quando `isOwner`, não há curtir nem candidatar-se.
- [x] T-18 [RF-07 a RF-09, RF-21] Criar `pages/feed/useJobFeed.ts`, que guarda a lista e o cursor por `scope`, além dos estados `loading`, `error` e `done`. `loadMore` não dispara chamadas em dobro; a troca de `scope` zera a lista e descarta respostas atrasadas; `retry` mantém os itens já carregados; `updateJob(id, engagement)` atualiza só aquele item — Verificação: coberto pelos testes de T-19.
- [x] T-19 [RF-01, RF-03, RF-04, RF-08 a RF-10, RF-21] Criar `pages/feed/Feed.tsx` com:
  - título e `SegmentedSwitch`, iniciando sempre em "Todas as vagas";
  - `Skeleton` no primeiro carregamento;
  - lista de `JobCard`;
  - sentinela com `IntersectionObserver` (margem de 300px) e o botão "Carregar mais";
  - `Spinner` ao carregar mais e "Não há mais vagas." no fim;
  - `Alert` de erro com "Tentar novamente";
  - estados vazios: "Nenhuma vaga anunciada ainda." e, em "Minhas vagas", "Você ainda não criou vagas." com botão para `/criar`.

  Verificação: testes Vitest em `feed.test.tsx`, com `IntersectionObserver` falso:
  - mudar para "Minhas vagas" chama `feed('mine')`;
  - a sentinela chama `feed('all', cursor)` e acrescenta cards; com `nextCursor` nulo, aparece "Não há mais vagas.";
  - "Minhas vagas" vazia mostra o link para `/criar`;
  - curtir no card troca o botão para "Descurtir" sem nova chamada a `feed`;
  - candidatar-se pede confirmação e depois mostra "Desistir".
- [x] T-20 [RF-01, RF-02] Em `App.tsx`, usar `<Route index element={<Feed />} />`, remover `pages/Home.tsx` e ajustar os testes que citavam a Home (`App.test.tsx`/`layout.test.tsx`); `navItems` não muda — Verificação: teste Vitest: a rota `/` autenticada mostra o feed e não o texto de boas-vindas; o menu continua com "Home"; `npm test && npm run lint && npm run build` passam.

## Validação
- [x] T-21 [todos] Executar os critérios de aceite da spec:
  - Rodar `dotnet test --project backend/tests/Palestra.Tests` e `cd frontend && npm test && npm run lint && npm run build`.
  - Subir com `docker compose up --build`.
  - Pela API, com dois usuários de teste: paginação 10/10/…, "Todas" × "Minhas" (com uma vaga inativa), foto do anunciante e 404 em vaga inativa de terceiro.
  - No navegador:
    - abrir `/`, ver o feed com a vaga mais recente primeiro e rolar até "Não há mais vagas.";
    - trocar para "Minhas vagas" e conferir o selo "Inativa";
    - testar "ver mais"/"ver menos";
    - curtir e candidatar-se no card sem perder a rolagem;
    - clicar no cargo e abrir a página da vaga;
    - conferir tema escuro, celular e menu recolhido (card centralizado, sem rolagem horizontal).
  - Marcar os critérios na `spec.md`.
