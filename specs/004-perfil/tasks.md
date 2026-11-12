# Tarefas: Perfil profissional em linha do tempo

- **Plano:** ./plan.md
- **Spec:** ./spec.md

Formato: `- [x] T-01 [RF-01] descrição (arquivo/área) — Verificação: …`

Ordem por dependência: Domain → Application → Infrastructure → Api → Frontend → Validação. Cada tarefa tem uma verificação objetiva. Não há tarefas de Docker (nenhuma mudança no `docker-compose.yml`).

**Notas da implementação** (ajustes em relação ao plano, sem mudança de comportamento):
- Pastas/namespaces `Profiles` (plural) em Domain, Application e testes, para não colidir com a classe `Profile`.
- A leitura de `"AAAA-MM"` ficou em `Period` (Domain), junto das regras de data, em vez de Application.
- Remoção de itens num único caso de uso genérico `RemoveItem<T>`; `IProfileRepository` tem métodos genéricos por tipo de item.
- T-17: o CORS já usava `AllowAnyMethod`; nada a alterar, só verificado.
- Utilitários de componentes (`THIS_YEAR`, `initialsOf`) em `components/helpers.ts` (regra do lint: arquivo de componente só exporta componentes).
- Formulários no arquivo único `pages/profile/forms.tsx`; testes do perfil em `pages/profile/profile.test.tsx` e `layout/layout.test.tsx`.
- T-34: verificado pela API (`curl`, duas contas de teste) e no navegador (desktop/celular, claro/escuro). O envio de foto pela tela foi coberto por teste automatizado e pela API; o seletor de arquivo do navegador não foi acionado manualmente.

## Backend — Domain (`Palestra.Domain/Profile`)
- [x] T-01 [RF-16, RF-17] Criar `Period` (estático): `Validate(start, end, mesAtual)` (início obrigatório e não futuro; término opcional, não anterior ao início, pode ser futuro) e a comparação de ordenação da linha do tempo (início decrescente; sem término primeiro; término decrescente) — Verificação: testes xUnit: término anterior ao início → `end_before_start`; início futuro → `future_start`; término futuro válido; ordenação de 3 períodos na ordem esperada.
- [x] T-02 [RF-07, RF-08] Criar entidade `Occupation` (Id, UserId, cargo, empresa, `Start`, `End?`, descrição) com `Create`/`Update` devolvendo erros por campo (`required`, `too_long`) e usando `Period` — Verificação: teste xUnit: cargo vazio → `required`; ocupação sem término é criada com `End = null`.
- [x] T-03 [RF-10, RF-11] Criar enum `EducationLevel` (7 níveis) e entidade `Education` (instituição, curso/área, nível, período, descrição) com `Create`/`Update` — Verificação: teste xUnit: curso/área vazio → `required`; formação "Mestrado" sem término é criada.
- [x] T-04 [RF-13] Criar entidade `Course` (nome, instituição, horas, período) com `Create`/`Update` (horas inteiro de 1 a 99.999) — Verificação: teste xUnit: 40 horas cria; 0 e negativo → `invalid`.
- [x] T-05 [RF-05, RNF-02] Criar `ImageSignature` (estático): detecta JPEG, PNG e WebP pelos primeiros bytes e devolve o tipo — Verificação: teste xUnit: cabeçalhos PNG/JPEG/WebP reconhecidos; bytes de texto → nenhum tipo.
- [x] T-06 [RF-03, RF-04, RF-06] Criar entidades `Profile` (UserId, `Bio?`, `PhotoVersion?`; `SetBio(texto, limite)`, `SetPhoto(now)`, `RemovePhoto()`) e `ProfilePhoto` (UserId, ContentType, Content) — Verificação: teste xUnit: bio de 501 caracteres é recusada; `SetPhoto` define a versão e `RemovePhoto` a zera.

## Backend — Application (`Palestra.Application/Profile`)
- [x] T-07 [RF-21] Definir `IProfileRepository` (perfil, foto e listas por `userId`; item por `(id, userId)`; adicionar/remover), `ProfileOptions` (`MaxPhotoBytes`, `MaxBioLength`), DTOs do contrato e conversão `"AAAA-MM"` ⇄ `DateOnly` (texto mal formado → `invalid`) — Verificação: `dotnet build` compila sem referência a Infrastructure; teste xUnit: `"2021-03"` converte e `"2021-13"` → `invalid`.
- [x] T-08 [RF-02, RF-17, RF-21] Caso de uso `GetProfile` (perfil vazio se não existir; três listas ordenadas) + repositório em memória em `Palestra.Tests/Profile` — Verificação: testes xUnit: usuário sem dados recebe perfil vazio; duas ocupações voltam da mais recente para a mais antiga; perfil de B não traz itens de A.
- [x] T-09 [RF-02, RF-07, RF-09, RF-22] Casos de uso `SaveOccupation` (cria sem id; edita com id se for do usuário) e `RemoveOccupation` — Verificação: testes xUnit: cria, edita e remove; campo obrigatório vazio → `validation` sem gravar; item de outro usuário → `not_found`.
- [x] T-10 [RF-10, RF-12, RF-22] Casos de uso `SaveEducation` e `RemoveEducation` — Verificação: testes xUnit: nível fora da lista → `validation`; nível válido salva; remove.
- [x] T-11 [RF-13, RF-14, RF-22] Casos de uso `SaveCourse` e `RemoveCourse` — Verificação: testes xUnit: curso de 40 horas salva; horas 0 → `validation`; remove.
- [x] T-12 [RF-06] Caso de uso `UpdateBio` (cria o perfil sob demanda; vazio limpa) — Verificação: testes xUnit: 500 caracteres salva; 501 → `validation`.
- [x] T-13 [RF-03, RF-04, RF-05] Casos de uso `UploadPhoto` (tamanho ≤ `MaxPhotoBytes`, assinatura válida, grava o tipo detectado, substitui a anterior), `GetPhoto` e `RemovePhoto` — Verificação: testes xUnit: PNG válido grava e define `photoVersion`; não imagem → `invalid_image`; acima do limite → `image_too_large`; nos dois erros a foto anterior permanece; remover zera.

## Backend — Infrastructure (`Palestra.Infrastructure`)
- [x] T-14 [RF-21] Adicionar ao `AppDbContext` os 5 `DbSet` e as `IEntityTypeConfiguration` (tamanhos máximos, `Level` como texto, FK para `users` com cascade, índice em `user_id`) e implementar `ProfileRepository` (EF) — Verificação: `dotnet build` ok.
- [x] T-15 [RF-21] Gerar a migration `AddProfile` — Verificação: `docker compose exec api dotnet ef database update …` aplica sem erro e `\dt` lista `profiles`, `profile_photos`, `occupations`, `educations`, `courses`.
- [x] T-16 [RF-05, RF-06] Registrar repositório, casos de uso e `ProfileOptions` em `AddInfrastructure` e adicionar a seção `Profile` ao `appsettings.json` — Verificação: a API sobe sem erro de injeção de dependência.

## Backend — Api (`Palestra.Api`)
- [x] T-17 [RF-01] Ajustar o CORS em `Program.cs` para permitir `PUT` e `DELETE` — Verificação: `curl -i -X OPTIONS` com `Origin: http://localhost:5173` e `Access-Control-Request-Method: PUT` devolve o método permitido.
- [x] T-18 [RF-01, RF-02, RF-06] Criar `ProfileController` (`[Authorize]`, `api/profile`) com `GET /api/profile` e `PUT /api/profile/bio`, lendo o userId do cookie — Verificação: `curl` sem cookie → `401`; com sessão, `GET` → `200` com perfil vazio e `PUT bio` → `204`.
- [x] T-19 [RF-07, RF-09, RF-10, RF-12, RF-13, RF-14] Adicionar ao controller `POST`/`PUT`/`DELETE` de `occupations`, `educations` e `courses` conforme os contratos — Verificação: `curl` em cada rota devolve `201`/`200`/`204`, `400 validation` com `fields` e `404 not_found` para id inexistente.
- [x] T-20 [RF-03, RF-04, RF-05, RNF-02] Adicionar `PUT`/`GET`/`DELETE /api/profile/photo` (multipart `file`, limite de requisição, `Content-Type` detectado, `nosniff`, `Cache-Control: private`) — Verificação: `curl -F file=@foto.png` → `200 { photoVersion }`; `GET` devolve a imagem com `X-Content-Type-Options: nosniff`; arquivo `.txt` renomeado para `.png` → `400 invalid_image`.

## Frontend
- [x] T-21 [RF-20] Estender `services/api.ts` (`PUT`, `DELETE`, envio de `FormData`), ampliar `ApiErrorCode` e criar `profileTypes.ts` e `profileService.ts` — Verificação: `npm run build` sem erros de tipo.
- [x] T-22 [RF-15, RNF-04, RNF-05] Criar componentes `TextArea`, `Select` e `MonthYearField` (dois seletores, meses em pt-BR, valor `"AAAA-MM"`) com rótulos e erros associados, e incluí-los no catálogo `/design-system` — Verificação: teste Vitest: escolher março e 2021 emite `"2021-03"`.
- [x] T-23 [RF-04, RNF-04] Criar componente `Avatar` (foto com `alt` ou iniciais) e ícones `Plus`, `Pencil`, `Trash`, `Camera`; incluir no catálogo — Verificação: teste Vitest: sem foto mostra as iniciais.
- [x] T-24 [RF-15, RF-08] Criar `pages/profile/format.ts` (`"2021-03"` → `"03/2021"`, período com "até o momento", rótulos dos níveis, mensagens dos códigos de erro) — Verificação: teste Vitest: período sem término formata como "03/2021 — até o momento".
- [x] T-25 [RF-01] Criar a página `Profile` (`/perfil`) com carregamento (`Skeleton`), erro (`Alert`) e os cartões das seções; registrar a rota em `App.tsx` dentro de `RequireAuth` + `AppLayout` — Verificação: com sessão, `/perfil` abre; sem sessão, redireciona para `/entrar`.
- [x] T-26 [RF-01] Transformar `UserBadge` em link para `/perfil` (iniciais no modo compacto, `aria-label`, estado ativo, foco visível) — Verificação: teste Vitest: o nome do usuário na `Sidebar` é um link para `/perfil`.
- [x] T-27 [RF-17, RF-18, RF-19, RF-09] Criar `TimelineSection` e `TimelineItem` (lista `<ol>`, marcador e linha, período, **Editar**/**Remover** com confirmação inline, estado vazio com **Adicionar**) — Verificação: testes Vitest: itens na ordem recebida com "até o momento"; seção vazia mostra o estado vazio; remover só chama o serviço após **Confirmar**.
- [x] T-28 [RF-07, RF-09, RF-16, RF-22] Criar `OccupationForm` e ligar a seção de ocupações (adicionar, editar, remover, recarregar o perfil após gravar, erros do servidor junto ao campo) — Verificação: teste Vitest: campo vazio ou término anterior ao início mostra erro e não chama o serviço.
- [x] T-29 [RF-10, RF-11, RF-12] Criar `EducationForm` e ligar a seção de formações — Verificação: teste Vitest: o seletor de nível oferece exatamente os 7 níveis.
- [x] T-30 [RF-13, RF-14] Criar `CourseForm` e ligar a seção de cursos — Verificação: teste Vitest: horas 0 ou não numéricas mostram erro e não chamam o serviço.
- [x] T-31 [RF-06] Criar `BioSection` (`TextArea`, contador de caracteres restantes, **Salvar**, confirmação de sucesso) — Verificação: teste Vitest: o contador mostra os caracteres restantes ao digitar.
- [x] T-32 [RF-03, RF-04, RF-05] Criar `PhotoSection` (`Avatar` grande, **Enviar/Trocar**, **Remover**, validação local de tipo e 2 MB, `Alert` para `invalid_image`/`image_too_large`) — Verificação: teste Vitest: arquivo acima de 2 MB mostra erro e não envia; sem foto mostra as iniciais.

## Validação
- [x] T-33 Rodar as suítes: `dotnet test --project backend/tests/Palestra.Tests` e `cd frontend && npm test && npm run lint && npm run build` — Verificação: tudo passa, em segundos.
- [x] T-34 [RF-21, RF-02, RNF-03] Executar manualmente os critérios de aceite da spec com `docker compose up --build`: entrar → clicar no nome → foto → bio → um item em cada seção → recarregar → Sair e entrar de novo; repetir com um segundo usuário (isolamento); conferir tema escuro, celular e navegação por teclado — Verificação: todos os critérios de aceite marcados na `spec.md`.
- [x] T-35 Atualizar o status da `spec.md` para **implementada** e marcar os critérios de aceite — Verificação: spec sem critérios pendentes.
