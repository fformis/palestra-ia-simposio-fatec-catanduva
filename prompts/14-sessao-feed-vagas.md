# Sessão: feed de vagas na Home (spec 010)

- **Projeto:** palestra-ia-simposio-fatec-catanduva
- **Modelo:** Claude Opus 5.5 (toda a sessão, incluindo esta exportação)
- **Data da sessão:** 2026-11-20
- **Resultado:** feature `specs/010-feed-vagas/` completa: spec, plano, tarefas e implementação full-stack. A Home virou um feed de vagas com o switch "Todas as vagas" / "Minhas vagas", rolagem infinita de 10 em 10 e cards no estilo de rede social. Commit `20eb809` no branch `palestra-implementacao`, já enviado para `origin`. O PR para a `main` ficou para depois.

> Transcrição editada: as mensagens do usuário estão na íntegra; as respostas do assistente estão preservadas em essência; as chamadas de ferramenta aparecem resumidas.

---

## 1. Usuário — `/especificar`

> /especificar feed
>
> Substituir a home pelo feed de vagas, quando o feed for exibido, no cabeçalho devemos ter um switch, do lado esquerdo, trará todas as vagas anunciadas e ativas, do lado direito apenas as vagas que eu criei. Sempre ordenar por data, do mais recente para o mais antigo.
>
> O feed terá um scroll infinito, paginado de 10 em 10 vagas.
>
> Cada vaga será exibida em um card, ao estilo do instagram, centralizado no espaço disponível (desconsiderando o menu), terá uma seção de header, uma imagem (opcional) e a descrição exibindo até 3 linhas (incluir o ver mais para expandir o card) e um botão de candidatar-se, curtir.

### Assistente

**Exploração.** Li a constituição e o template de spec. Em `specs/` já havia as features 001 a 009, então a próxima é a 010. Li a spec 009 (vagas, curtidas e candidaturas), que deixava a "listagem de vagas" e "Minhas vagas" para specs futuras, a spec 008 e as rotas do `App.tsx`, onde a Home já exige autenticação.

**Ação:** criei `specs/010-feed-vagas/spec.md` (rascunho) com 21 requisitos:
- **Home vira feed:** RF-01 e RF-02.
- **Switch Todas/Minhas:** RF-03 a RF-07.
- **Rolagem infinita e estados de carregamento, erro e vazio:** RF-08 a RF-10.
- **Card:** RF-11 a RF-16.
- **Ações no card:** RF-17 a RF-21, reaproveitando as regras da spec 009.

**Resposta final:** spec criada com status `rascunho`, sem decisões técnicas. Ficaram 10 questões `[NEEDS CLARIFICATION]`:
1. o rótulo do menu;
2. se a posição do switch fica salva;
3. se as minhas vagas também aparecem em "Todas";
4. se as inativas entram em "Minhas";
5. o conteúdo do cabeçalho do card;
6. se o card mostra regime, valor, benefícios e contagens;
7. o que fazer com a vaga sem imagem;
8. o link para a página da vaga;
9. "Desistir" ou "Candidatado" para quem já se candidatou;
10. ações nos cards das minhas vagas.

---

## 2. Usuário

> Aceite as propostas

### Assistente

Só a questão 5 tinha uma proposta explícita. Nas outras nove escolhi a opção mais simples e coerente com a spec 009, e deixei a lista explícita para o usuário conferir:

| # | Decisão |
|---|---|
| 1 | O item de menu continua "Home". |
| 2 | O switch sempre começa em "Todas as vagas". |
| 3 | "Todas" inclui as minhas vagas ativas. |
| 4 | "Minhas" inclui as inativas, com o selo "Inativa". |
| 5 | Cabeçalho do card: foto ou iniciais, nome do anunciante, data, cargo e empresa. |
| 6 | O card mostra regime, valor e contagens; os benefícios ficam só na página da vaga. |
| 7 | Vaga sem imagem fica sem área de imagem. |
| 8 | O cargo é o link para a página da vaga. |
| 9 | Quem já se candidatou vê "Desistir". |
| 10 | As minhas vagas não ganham ações extras no card. |

A spec ficou sem pendências e com status "em revisão", já com as decisões registradas e os critérios de aceite novos.

---

## 3. Usuário — `/planejar`

> Aprovar e planejar

### Assistente

**Exploração.** Marquei a spec como "aprovada" e li o template de plano, o `plan.md` da 009 e o código de vagas: `Contracts.cs`, `JobUseCases.cs`, `JobRepository.cs`, `JobsController`, `jobService.ts` e `JobPage.tsx`. Descobri que o `OwnerDto` não trazia a foto do anunciante e que a rota de foto existente só serve o próprio usuário.

**Ação:** criei `specs/010-feed-vagas/plan.md` com estas decisões:
- **Endpoint do feed:** `GET /api/jobs?scope=all|mine&cursor=…`.
- **Paginação por cursor (keyset)** sobre `(created_at DESC, id DESC)`. Assim nenhuma vaga se repete ou é pulada, mesmo se outra for criada durante a rolagem.
- **Consulta:** uma única projeção EF por página, sem N+1.
- **Foto do anunciante:** nova rota `GET /api/jobs/{id}/owner/photo`, liberada só para quem pode ver a vaga.
- **Banco:** migration `AddJobFeedIndexes`, só com índices.
- **Frontend:**
  - `Feed`, `SegmentedSwitch`, `useJobFeed` (com `IntersectionObserver` e o botão "Carregar mais"), `JobCard` e `ClampedText` (com `-webkit-line-clamp` e "ver mais");
  - extração de `JobActions` da página da vaga.

O plano também traz a tabela de verificação, o checklist da constituição e os riscos: a regressão na página da vaga, o layout simulado no jsdom e a exposição da foto do anunciante.

---

## 4. Usuário — `/tarefas`

> Gerar tarefas

### Assistente

Criei `specs/010-feed-vagas/tasks.md` com 21 tarefas em ordem de dependência. Cada uma cita os RF que atende e diz como verificar:

| Bloco | Tarefas |
|---|---|
| Application | T-01 a T-07 |
| Infrastructure | T-08 a T-10 |
| Api | T-11 e T-12 |
| Frontend | T-13 a T-20 |
| Validação | T-21 |

O Domain não muda e não há tarefas de Docker.

---

## 5. Usuário — `/implementar`

> Implementar

### Assistente

**Backend**
- `Application/Jobs/Feed.cs` reúne:
  - `FeedCursor`, que gera o cursor em base64url com a data em ticks e o id;
  - `FeedQuery` e `FeedRow`;
  - o caso de uso `ListFeed`, que valida `scope` e `cursor`, busca `PageSize + 1` vagas e calcula o `NextCursor`;
  - o caso de uso `GetOwnerPhoto`.
- `OwnerDto` ganhou `PhotoVersion`, e o `JobReader` passou a ler a foto pelo `IProfileRepository`.
- `JobRepository.ListFeedAsync` usa a condição keyset com `Id.CompareTo(after) < 0` e uma projeção que traz anunciante, foto, contagens e `likedByMe`/`appliedByMe`.
- Os dois índices compostos ficaram no `JobConfiguration`, com a migration `AddJobFeedIndexes`. Também registrei os novos serviços no DI e acrescentei `FeedPageSize: 10` ao `appsettings.json`.
- `JobsController` ganhou `Feed` e `OwnerPhoto`.
- Testes em `FeedTests.cs`:
  - cursor;
  - "Todas" e "Minhas";
  - paginação 10/10/5 com duas datas iguais;
  - entrada inválida;
  - foto de vaga inativa.

**Problemas encontrados e corrigidos**
- **Asserção:** comparar uma tupla de `List` usava igualdade por referência; passei a comparar strings.
- **Teste instável:** vagas criadas no mesmo instante eram ordenadas pelo id aleatório. Agora o relógio avança 1 minuto a cada vaga, e a suíte passou 6 vezes seguidas.
- **`dotnet ef`:** precisou de `dotnet restore` antes, porque faltava um pacote no cache do NuGet.

**Frontend**
- `jobTypes.ts` e `jobService.ts` ganharam `feed`, `ownerPhotoUrl`, `FeedScope`, `JobFeedPage` e `owner.photoVersion`.
- `JobActions.tsx` foi extraído de `JobPage`. Os 15 testes da spec 009 continuaram passando sem alteração.
- `components/SegmentedSwitch.tsx` usa `radiogroup` e as setas do teclado.
- Em `pages/feed/` ficaram `ClampedText`, `JobCard`, `useJobFeed` (descarta respostas de outra visão e evita chamadas em dobro), `Feed` e `feed.module.css`, com a coluna limitada a 600px e centralizada.
- `App.tsx` passou a usar `<Route index element={<Feed />} />`, e `Home.tsx` foi removido.
- Testes: `feed.test.tsx` (8 testes, com `IntersectionObserver` falso), o teste do switch e o `App.test.tsx` atualizado.
- Ajustes de lint e build: o `stateRef` passou a ser atualizado num efeito, a limpeza do efeito usa uma variável local e a classe falsa do teste deixou de usar *parameter property*.

**Resultado:** backend com 57 testes e frontend com 71, lint limpo e build ok.

**Validação (T-21)**
- Reiniciei a API para aplicar a migration e confirmei os índices no PostgreSQL.
- Criei 11 vagas "Teste feed 01…11" com um usuário de teste (a 05 inativa).
- Pela API:
  - "Todas" veio em páginas de 10 + 3, sem repetição e em ordem decrescente;
  - "Minhas" incluiu a inativa;
  - `scope` ou `cursor` inválido → 400; sem sessão → 401;
  - a vaga inativa e a foto de quem a anunciou → 404 para outro usuário;
  - a foto veio com `nosniff` e `Cache-Control: private`.
- No navegador:
  - a rolagem foi de 10 para 13 cards e mostrou "Não há mais vagas.";
  - "ver mais" e "ver menos" funcionaram com `aria-expanded`, e a descrição curta não mostrou "ver mais";
  - "Minhas vagas" funcionou pela seta do teclado, com o selo "Inativa";
  - o card de outro anunciante mostrou Curtir e Candidatar-se, e o card próprio ficou sem ações;
  - no celular não houve rolagem horizontal;
  - no desktop, o card ficou centralizado com o menu expandido e recolhido.
- Durante o teste cliquei por engano no seletor de tema, que também usa `role=radio`. O tema foi restaurado para "Sistema".
- Marquei as tarefas e os critérios, a spec passou para "implementada" e registrei as notas da implementação no `tasks.md`.

**Resposta final:** feature pronta. Testes, lint e build passaram. Curtir e candidatar-se não foram testados no navegador, porque a sessão aberta era a do anunciante, mas esses fluxos estão cobertos pelos testes Vitest. As 11 vagas de teste continuam no banco local.

---

## 6. Usuário

> Faça o commit das alterações da árvore de trabalho com uma mensagem adequada.

### Assistente

Fiz o commit `20eb809`, "Implementa feed de vagas na Home (spec 010)", no branch `palestra-implementacao`. A árvore ficou limpa.

---

## 7. Usuário

> faça o push do branch

### Assistente

`git push -u origin palestra-implementacao`: o branch era novo no remoto e agora acompanha `origin`, com os commits das specs 009 e 010. Ofereci abrir um PR para a `main`.

---

## 8. Usuário

> Não agora

### Assistente

Combinado; o PR fica para depois.

---

## 9. Usuário

> exporte essa sessão toda para um arquivo .md na pasta ./docs use a nomenclatura NN-nome-da-sessao.md

### Assistente

Listei `docs/` (a última sessão era a 13) e segui o formato das exportações anteriores. Criei este arquivo: `docs/14-sessao-feed-vagas.md`.
