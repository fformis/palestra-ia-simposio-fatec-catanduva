# Sessão: spec, plano, tarefas e implementação do perfil profissional

- **Projeto:** palestra-ia-simposio-fatec-catanduva
- **Modelos:** Claude Sonnet 5.5 (spec), Claude Fable 5.2 (decisões da spec, plano, tarefas e implementação), Claude Opus 5.5 (esta exportação)
- **Data da sessão:** 2026-11-11 a 2026-11-12 (exportada em 2026-11-20)
- **Resultado:** spec `004-perfil` criada, esclarecida e aprovada; `plan.md` e `tasks.md` gerados; feature implementada (backend, migration `AddProfile` e tela `/perfil`) e verificada. Nada foi commitado nesta sessão: o usuário pediu para revisar antes.

> Transcrição editada: as mensagens do usuário estão na íntegra; as respostas do assistente estão preservadas, e as chamadas de ferramenta aparecem resumidas. A senha da conta de teste local criada durante a verificação foi omitida.

---

## 1. Usuário

> /especificar perfil
>
> ao clicar no menu em seu nome, acessar a edição que permite incluir seus dados profissionais no formato de linha do tempo.
>
> seçoes:
>
> * foto do perfil
>
> * bio (texto)
> * ocupação (pode adicionar N) (cargo, empresa, de (mes/ano), até (mes/ano, não obrigatório, descrição)
> * formação (pode adicionar N) (instituiçao, formação[ fundamental, médio, técnico, superior, pos/mba, mestrado, doutorado] , de (mes/ano), até (mes/ano, não obrigatório, descrição)
> * cursos (pode adicionar N) (curso, instituiçao, quantidade de horas , de (mes/ano), até (mes/ano, não obrigatório)

O skill `especificar` foi acionado: ler a constituição, listar `specs/` para definir o próximo número e um slug, criar `spec.md` a partir do template descrevendo só o quê e o porquê, e marcar lacunas como `[NEEDS CLARIFICATION]`.

### Assistente

**Leitura.** Li `.claude/CONSTITUTION.md`, o template de spec e, como referência de estilo, a spec `003-login-registro` (incluindo o RF-22, que pôs o nome do usuário no topo do menu).

**Ação:** criei `specs/004-perfil/spec.md` (status **rascunho**) com 23 requisitos funcionais, 6 não funcionais, critérios de aceite e fora de escopo.

**Resposta final:**

Criei a spec em `specs/004-perfil/spec.md`, com status **rascunho** — ela descreve só o quê e o porquê, sem decisões técnicas.

O que ela cobre:
- **Acesso:** o nome do usuário no topo do menu (spec 003, RF-22) passa a ser clicável e abre o Perfil; cada usuário edita só o próprio.
- **Foto:** enviar, trocar e remover; sem foto, avatar com as iniciais.
- **Bio:** texto livre opcional com contador.
- **Ocupações, formações e cursos:** N itens cada, com os campos pedidos; adicionar, editar e remover (com confirmação).
- **Datas:** sempre mês/ano; item sem término aparece como "até o momento"; término não pode ser anterior ao início.
- **Linha do tempo:** do mais recente ao mais antigo.

Preciso das suas respostas para 7 pontos antes de `/planejar`:

| # | Questão | Minha sugestão |
|---|---|---|
| 1 | Tamanho máximo da foto (RF-05) | 2 MB, JPG/PNG/WebP |
| 2 | Limite de caracteres da bio (RF-06) | 500 |
| 3 | Formação tem campo para o nome do curso/área, ex.: "ADS"? (RF-12a) | Sim, obrigatório — a descrição listava só instituição e nível |
| 4 | Datas futuras são permitidas? (RF-16) | Só no término (conclusão prevista) |
| 5 | Linha do tempo única ou uma por seção? (RF-18) | Uma por seção (já assumido na spec) |
| 6 | Salvar por item ou um único botão "Salvar"? (RF-20) | Por item (já assumido na spec) |
| 7 | Perfil privado ou visível a outros usuários? (RF-23) | Privado nesta feature (já assumido na spec) |

Cursos ficaram sem descrição, como na lista original (ocupação e formação têm) — avise se foi esquecimento.

---

## 2. Usuário

O modelo foi trocado para Claude Fable 5.2 (`/model claude-fable-5-2`).

> Usar suas sugestões

### Assistente

**Ação:** apliquei as 7 decisões na spec, removi o RF-12a (o campo curso/área entrou no RF-10), troquei as questões em aberto por uma seção **Decisões registradas**, ajustei o critério de aceite de datas (início futuro recusado, término futuro aceito) e mudei o status para **em revisão**. Confirmei por `grep` que não restou nenhum `[NEEDS CLARIFICATION]`.

**Resposta final:**

Apliquei as 7 sugestões: não resta nenhum `[NEEDS CLARIFICATION]` e o status passou para **em revisão**.

Decisões agora registradas na spec:
- **Foto:** JPG, PNG ou WebP, até 2 MB.
- **Bio:** até 500 caracteres.
- **Formação:** ganhou o campo obrigatório **curso/área**, além de instituição e nível.
- **Datas:** o início nunca pode ser futuro; o término pode (conclusão prevista).
- **Linha do tempo:** uma por seção, sem misturar ocupações, formações e cursos.
- **Salvamento:** por item, sem botão "Salvar" único.
- **Visibilidade:** perfil privado, só o próprio usuário vê.
- **Cursos:** sem descrição, como na lista original.

Ajustei também o critério de aceite das datas para cobrir início futuro (recusado) e término futuro (aceito). Nada foi commitado. O próximo passo do fluxo é `/planejar`.

---

## 3. Usuário

> Gerar o plano

O skill `planejar` foi acionado: ler `spec.md` e a constituição (parando se houver `[NEEDS CLARIFICATION]`), criar `plan.md` a partir do template com decisões, contratos e verificação da constituição, sem escrever código de produção.

### Assistente

**Leitura.** Li o template de plano, o `plan.md` da spec 003 (como padrão de formato e contratos), a lista de arquivos do backend e do frontend, o `docker-compose.yml`, o `AuthController`, a entidade `User`, o `api.ts`, o `UserBadge`, o `App.tsx`, o `AppDbContext` e as interfaces de `Application/Auth`.

**Ação:** criei `specs/004-perfil/plan.md` e, em seguida, corrigi uma frase ambígua sobre como a tela atualiza a lista depois de gravar (ficou: recarrega o perfil com `GET` e exibe a ordem definida pelo servidor).

**Resposta final:**

Gerei o plano técnico em `specs/004-perfil/plan.md`. Nenhum código de produção foi escrito e nada foi commitado.

As decisões que mais pesam no resultado:
- **Foto no PostgreSQL** (`bytea`, tabela própria): sem volume, serviço Docker ou pacote novo. É validada pelo tamanho (2 MB) e pela assinatura do arquivo, não pela extensão.
- **Mês/ano** trafega como `"AAAA-MM"` e é gravado como data no dia 1; as regras de data e a ordenação da linha do tempo ficam no Domain, com a ordem definida pelo servidor.
- **Isolamento:** todas as rotas usam o usuário do cookie; nenhuma recebe id de usuário, e item de outra pessoa responde `404`.
- **Edição inline:** formulários e confirmação de remoção dentro da própria seção, porque o design system não tem modal.
- **Mês/ano na tela:** dois seletores (mês e ano), já que o campo nativo de mês não funciona bem no Safari e no Firefox desktop.
- **Sem dependências novas** (NuGet ou npm) e sem mudanças no `docker-compose.yml`; só uma migration `AddProfile`.

O plano traz 14 rotas em `/api/profile`, cinco tabelas novas e quatro componentes novos no design system (`TextArea`, `Select`, `MonthYearField`, `Avatar`).

Um ponto para decidir: defini limites que a spec não menciona — 150 caracteres para cargo, empresa, instituição e nomes de curso, 1000 para descrição e horas de 1 a 99.999. Tratei como limites técnicos; se preferir registrá-los como regra na spec (ou mudar os valores), é melhor fazer isso antes de `/tarefas`.

---

## 4. Usuário

> Gerar tarefas

O skill `tarefas` foi acionado: ler `spec.md` e `plan.md` e criar `tasks.md` a partir do template, com tarefas pequenas, cada uma referenciando um `RF-xx` e com forma de verificação, ordenadas por dependência.

### Assistente

**Leitura.** Li o template de tarefas e o `tasks.md` da spec 003 como referência de formato.

**Ação:** criei `specs/004-perfil/tasks.md` com 35 tarefas.

**Resposta final:**

Criei `specs/004-perfil/tasks.md` com 35 tarefas, ordenadas por dependência, cada uma com o requisito que atende e uma verificação objetiva. Nenhum código foi escrito e nada foi commitado.

| Bloco | Tarefas | Conteúdo |
|---|---|---|
| Domain | T-01 a T-06 | regras de período e ordenação, as três entidades, assinatura de imagem, perfil e foto |
| Application | T-07 a T-13 | repositório, DTOs e os casos de uso de perfil, itens, bio e foto |
| Infrastructure | T-14 a T-16 | mapeamentos, repositório EF, migration `AddProfile`, registro e configuração |
| Api | T-17 a T-20 | CORS, `ProfileController`, rotas dos itens e da foto |
| Frontend | T-21 a T-32 | serviços, componentes novos, página `/perfil`, nome do menu como link, linha do tempo, formulários, bio e foto |
| Validação | T-33 a T-35 | suítes, roteiro manual dos critérios de aceite, status da spec |

Não há tarefas de Docker, porque o plano não muda o `docker-compose.yml`.

Dois pontos pendentes antes de `/implementar`:
- A spec ainda está **em revisão**; a constituição exige que ela esteja aprovada antes de qualquer código.
- Os limites de texto do plano (150 e 1000 caracteres, horas até 99.999) entraram nas tarefas como estão.

---

## 5. Usuário

> Aprovar e implementar

O skill `implementar` foi acionado: ler spec, plano e tarefas, executar as tarefas na ordem marcando `- [x]`, parar e atualizar a spec se a implementação divergir, e validar os critérios de aceite ao final.

### Assistente

**Aprovação.** Mudei o status da spec para **aprovada** antes de escrever código.

**Exploração.** Li `Program.cs`, `appsettings.json`, `DependencyInjection.cs`, as configurações EF e os repositórios existentes, opções e casos de uso de autenticação, os fakes e testes xUnit da spec 003; no frontend, `TextField`, `Button`, `Card`, `Alert`, `Skeleton`, `Sidebar`, `navItems`, `authService`, `authTypes`, `Register`, `layout.test.tsx`, os ícones e os tokens de estilo. Confirmei que os containers (api, db, frontend, smtp4dev) estavam no ar.

**Backend — Domain (T-01 a T-06).** Pasta `Palestra.Domain/Profiles`:
- `Period`: interface `ITimelineItem`, leitura/escrita de `"AAAA-MM"`, validação de datas (RF-16) e ordenação da linha do tempo (RF-17).
- `Occupation`, `Education` (com o enum `EducationLevel` e os códigos `fundamental` … `doutorado`) e `Course`, cada uma com `Update(...)` devolvendo erros por campo.
- `Profile` (bio e versão da foto), `ProfilePhoto` e `ImageSignature` (detecta JPEG, PNG e WebP pelos primeiros bytes).

**Backend — Application (T-07 a T-13).** Pasta `Palestra.Application/Profiles`: `IProfileRepository` com métodos genéricos por tipo de item, `ProfileOptions`, DTOs do contrato, e os casos de uso `GetProfile`, `UpdateBio`, `UploadPhoto`, `GetPhoto`, `RemovePhoto`, `SaveOccupation`, `SaveEducation`, `SaveCourse` e o genérico `RemoveItem<T>`. Testes em `Palestra.Tests/Profiles/ProfileTests.cs` com repositório em memória e relógio falso (ordenação, item atual, criar/editar/remover, datas, obrigatórios, isolamento entre usuários, níveis, horas, bio, foto válida e inválida, assinaturas). Suíte backend: 29 testes passando.

**Backend — Infrastructure e Api (T-14 a T-20).**
- Configurações EF das 5 tabelas (FK para `users` com cascade, índice em `user_id`, `Level` como texto), `ProfileRepository`, registro em `AddInfrastructure` e seção `Profile` no `appsettings.json`.
- `ProfileController` (`[Authorize]`, `api/profile`), lendo o usuário do cookie: bio, foto (multipart, `nosniff`, `Cache-Control: private`) e `POST`/`PUT`/`DELETE` de ocupações, formações e cursos.
- O build no host falhou por um pacote NuGet ausente no cache local; o build dentro do container passou.
- Migration `AddProfile` gerada e aplicada no container; `\dt` listou `profiles`, `profile_photos`, `occupations`, `educations` e `courses`.
- T-17: o CORS já usava `AllowAnyMethod`; só verifiquei o preflight de `PUT`.

**Verificação da API.** Criei duas contas de teste locais (`perfil.a@teste.local` e `perfil.b@teste.local`), ativadas pelo link recebido no smtp4dev. A primeira chamada ao perfil falhou porque o `dotnet watch` não tinha registrado os novos serviços; reiniciei o container da API. Depois, por `curl`: perfil vazio (200), sem cookie (401), preflight de `PUT` permitido, bio (204; 501 caracteres → 400), ocupações (201, ordem correta, `required`/`future_start`/`end_before_start`), usuário B recebendo 404 ao editar e remover item de A, formação com nível inválido (400), curso com 0 horas (400), foto falsa (`invalid_image`), foto acima de 2 MB (`image_too_large`), foto válida (200, `image/png` com `nosniff`), B sem acesso à foto de A (404) e remoções.

**Frontend (T-21 a T-32).**
- `api.ts` com `PUT`, `DELETE` e `FormData`; novos códigos de erro; `profileTypes.ts` e `profileService.ts`.
- Componentes `TextArea`, `Select`, `MonthYearField` (dois seletores, meses em pt-BR) e `Avatar`; ícones `Plus`, `Pencil`, `Trash` e `Camera`; todos incluídos no catálogo `/design-system`.
- Página `pages/profile/` com `Profile`, `PhotoSection`, `BioSection`, `TimelineSection` (genérico, lista `<ol>`, confirmação inline de remoção, estado vazio), `forms.tsx` (`OccupationForm`, `EducationForm`, `CourseForm`) e `format.ts`; rota `/perfil` no `App.tsx`.
- `UserBadge` virou link para `/perfil` (fecha o menu no celular ao navegar); o teste de menu foi ajustado e ganhou o caso "nome leva ao perfil".
- O lint apontou `Date` chamado durante o render, exportação de utilitário em arquivo de componente e `setState` síncrono em efeito; movi `THIS_YEAR` e `initialsOf` para `components/helpers.ts` e reescrevi a carga inicial do perfil. Resultado: 41 testes Vitest passando, lint sem avisos e build ok.

**Verificação no navegador.** Sem sessão, `/perfil` levou ao login. Com a conta de teste: o nome no menu abriu o perfil; a foto enviada pela API carregou (`alt` "Foto de Teste a"); o formulário de ocupação mostrou "Informe a empresa." e "O término não pode ser anterior ao início."; corrigido, salvou e apareceu no topo como "05/2023 — até o momento". Conferi celular (375 px) e tema escuro, sem rolagem horizontal. Depois de logout e novo login, bio, foto e itens continuaram lá.

**Fechamento.** Marquei as 35 tarefas como `[x]`, com notas de implementação no topo do `tasks.md`; marquei os critérios de aceite e mudei o status da spec para **implementada**. Suíte backend: 29 testes passando (rodando de dentro de `backend/`).

**Resposta final:**

A spec 004 está implementada: clicar no seu nome no menu abre `/perfil`, com foto, bio e as três linhas do tempo (ocupações, formações, cursos). As 35 tarefas estão marcadas no `tasks.md` e a spec passou para **implementada**. Nada foi commitado.

**O que foi verificado**
- **Testes automatizados:** 29 no backend e 41 no frontend passam; lint sem avisos e build ok.
- **API (`curl`, duas contas de teste):** todas as rotas devolvem os status do plano, incluindo validações, foto inválida ou acima de 2 MB recusada e isolamento (o usuário B recebe `404` ao tentar editar ou remover item do usuário A e vê o próprio perfil vazio).
- **Persistência:** após sair e entrar de novo, bio, foto e itens continuam lá.
- **Navegador:** sem sessão, `/perfil` redireciona para o login; o nome no menu abre o perfil; a foto carrega; adicionar ocupação mostra os erros junto aos campos e, corrigida, aparece no topo como "05/2023 — até o momento". Conferi também celular e tema escuro, sem rolagem horizontal.

**O que não foi verificado**
- **Envio de foto pelo seletor de arquivo do navegador:** coberto só por teste automatizado e pela API, não manualmente na tela.
- **Navegação por teclado e leitor de tela:** não testei manualmente.

**Pontos para saber**
- **Migration já aplicada** no banco local (`AddProfile`, 5 tabelas novas).
- **Contas de teste no banco local:** `perfil.a@teste.local` e `perfil.b@teste.local`; a primeira ficou com dados de exemplo.
- **Reiniciei o container da API** uma vez, porque o `dotnet watch` não registrou os novos serviços sem reinício.
- **Ajustes em relação ao plano**, sem mudar comportamento: pastas `Profiles` no plural (para não colidir com a classe `Profile`), remoção de itens num único caso de uso genérico e leitura de `"AAAA-MM"` no Domain. Estão anotados no topo do `tasks.md`.
- **Comando de teste do `CLAUDE.md`:** `dotnet test --project backend/tests/Palestra.Tests` falha quando rodado da raiz; funciona de dentro de `backend/` (`dotnet test --project tests/Palestra.Tests`).

---

## 6. Usuário

> Vou revisar antes

### Assistente

**Resposta final:**

Combinado. Fica tudo como está, sem commit, até você revisar.

Para ver a tela, a pilha já está no ar em <http://localhost:5173/perfil>; os pontos de entrada no código são `backend/src/Palestra.Api/Controllers/ProfileController.cs` no backend e `frontend/src/pages/profile/Profile.tsx` no frontend.

Quando terminar, me diga o que ajustar ou se posso commitar — e se quer que eu remova as duas contas de teste do banco local.

---

## 7. Usuário

O modelo foi trocado para Claude Opus 5.5 (`/model claude-opus-5-5`).

> exporte essa sessão toda para um arquivo .md na pasta ./docs use a nomenclatura NN-nome-da-sessao.md

### Assistente

**Ação:** verifiquei que `docs/` já tinha as sessões `01` a `07`, segui o formato da `06` e criei este arquivo como `08-sessao-spec-plano-implementacao-perfil.md`.
