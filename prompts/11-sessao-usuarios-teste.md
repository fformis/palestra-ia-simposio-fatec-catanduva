# Sessão: spec, plano, tarefas e implementação dos usuários de teste

- **Projeto:** palestra-ia-simposio-fatec-catanduva
- **Modelo:** Claude Sonnet 5.5 (toda a sessão, incluindo esta exportação)
- **Data da sessão:** 2026-11-15 (exportada em 2026-11-20)
- **Resultado:** spec `006-usuarios-teste` criada, esclarecida e aprovada; `plan.md` e `tasks.md` gerados; feature implementada (migration `SeedTestUsers`, 100 usuários de TI com perfil completo e avatar, testes de integridade) e validada no Postgres do compose; commit `9026942` na branch `feat/004-perfil`.

> Transcrição editada: as mensagens do usuário estão na íntegra; as respostas do assistente estão preservadas (as mais longas, resumidas nos trechos de listas); as chamadas de ferramenta aparecem resumidas.

---

## 1. Usuário

> /especificar criar 100 usuários para testes, eles devem ter o perfil completo, todos devem ser da área de TI inclua as imagens dos perfis

O comando `especificar` foi acionado: ler a constituição, listar `specs/` para definir o próximo número, criar `spec.md` a partir do template (só o quê e o porquê) e listar as lacunas `[NEEDS CLARIFICATION]`.

### Assistente

**Leitura.** Li `.claude/CONSTITUTION.md`, o template de spec e, como referência de estilo e de regras, a spec `004-perfil`. O próximo número era 006 (a 005 já existia).

**Ação:** criei `specs/006-usuarios-teste/spec.md` (status **rascunho**).

**Resposta final:**

Criei `specs/006-usuarios-teste/spec.md` com status `rascunho`. A spec cobre 100 usuários fictícios, todos de TI, com perfil completo (foto, bio, ocupações, formações e cursos). Só descreve o quê e o porquê, sem stack nem implementação.

Principais requisitos:
- **Perfis:** todos têm foto distinta, bio única, de 2 a 5 ocupações, de 1 a 3 formações e de 2 a 6 cursos, dentro das validações da spec 004.
- **Variedade:** os perfis cobrem pelo menos 6 áreas de TI e níveis de estagiário a gestor. Há perfis com e sem ocupação atual, com formação em andamento e com mais de 10 anos de carreira.
- **Carga:** roda sob demanda, sem duplicar ao repetir, de forma determinística, sem tocar em usuários reais e com opção de remover o conjunto.
- **Privacidade:** nomes, e-mails e fotos são fictícios, e a senha de teste é pública.

Antes do `/planejar`, preciso que você resolva estas pendências `[NEEDS CLARIFICATION]`:
1. **Origem das fotos:** IA de uso livre, IA gerada por nós, avatares ilustrados ou banco de retratos de licença livre. É a decisão mais crítica, por causa da licença e da privacidade.
2. **Senha de teste:** qual valor, e se pode ser a mesma para todos.
3. **Domínio dos e-mails:** reservado a testes ou ligado à palestra.
4. **Disparo da carga:** comando manual (recomendado) ou variável de ambiente na subida.
5. **Conta ativa:** se a spec 003 exige confirmação de e-mail, os usuários de teste devem nascer já aptos a entrar.
6. **Empresas e instituições:** reais ou fictícias. Recomendo empresas fictícias e instituições reais só como formação genérica.

---

## 2. Usuário

> Retrato de licença livre
> senha123
> exemplo.com
> dispara como uma migration
> todos com conta ativa
> conforme recomendação

### Assistente

**Ação:** consultei a política de senha da spec 003 (RF-18: mínimo de 8 caracteres, sem exigência de composição; `senha123` atende) e a regra de conta ativa (RF-10). Atualizei a spec: RF-03 (senha), RF-03a (conta ativa), RF-04 (domínio `exemplo.com`), RF-07 (retratos de licença livre), RF-16/17/20 (carga como migration, aplicada junto das demais; reverter a migration remove o conjunto), RNFs e critérios de aceite, e uma seção "Decisões registradas". Sem questões em aberto.

**Resposta final:**

Atualizei a spec 006 com as suas respostas e agora ela não tem mais `[NEEDS CLARIFICATION]`.

O que mudou:
- **Fotos:** retratos de licença livre. Cada foto precisa ter fonte, autoria e licença registradas, e a atribuição exigida pela licença deve ser cumprida.
- **Senha:** `senha123`. Ela tem 8 caracteres, então atende à política da spec 003.
- **E-mails:** domínio `exemplo.com`.
- **Carga como migration (RF-16/17/20):** a carga entra junto das migrations, aplicadas de forma explícita (constituição §10 e §12). Ela roda uma única vez pelo controle de migrations, e reverter a migration remove o conjunto de teste.
- **Conta ativa (RF-03a):** todos entram direto, sem e-mail de ativação.
- **Empresas e instituições:** empresas fictícias; instituições reais só como formação genérica.

Dois pontos para você conferir:
- **Retratos de licença livre costumam ser de pessoas reais.** Por isso troquei a regra "não identifica pessoas reais" por "nenhum retrato é ligado ao nome real de quem aparece". Só entram fotos cuja licença permita esse uso. Se preferir rostos 100% sintéticos, é só dizer e eu ajusto.
- **O status continua `rascunho`.** Mude para `aprovada` quando revisar, e aí podemos rodar `/planejar`.

---

## 3. Usuário

> rostos 100% sintéticos

### Assistente

**Ação:** reescrevi RF-07, RNF-01, RNF-06, o critério de aceite correspondente e as decisões registradas: as imagens passam a ser rostos gerados por computador, que não retratam nenhuma pessoa real, com origem e termos de uso registrados.

**Resposta final:**

Troquei as fotos por rostos 100% sintéticos em `spec.md`. Não deixei nenhuma menção a "licença livre" na spec.

- **RF-07:** os 100 retratos são gerados por computador, diferentes entre si, sem nenhuma pessoa real. Variam em gênero aparente, idade e etnia, de forma plausível para profissionais de TI no Brasil.
- **RNF-01:** não vale foto de pessoa real, nem imagem sintética treinada para imitar uma pessoa específica.
- **RNF-06 e critério de aceite:** a origem de cada imagem (ferramenta ou serviço de geração) e os termos de uso ficam registrados no repositório. Esses termos precisam permitir redistribuição, inclusive em demonstração pública.
- **Decisões registradas:** a decisão sobre as fotos foi atualizada.

A fonte dos rostos sintéticos é uma escolha técnica e fica para o `/planejar`. A spec continua em `rascunho` e sem questões em aberto. Quando você aprovar, mude o status para `aprovada` e rode `/planejar`.

---

## 4. Usuário

> /plante

O comando `/plante` não existe na sessão; o sistema avisou para tratar a mensagem como pedido comum.

### Assistente

`/plante` não existe nesta sessão. Como você provavelmente quis dizer `/planejar`, vou rodá-lo para a spec 006.

**Ação:** acionei o skill `planejar` com a spec `006-usuarios-teste`.

---

## 5. Instruções do comando `planejar` (injetadas pelo skill)

> Feature: 006-usuarios-teste (se vazio, use a spec mais recente em `specs/`).
>
> 1. Leia `spec.md` e `.claude/CONSTITUTION.md`. Pare se houver `[NEEDS CLARIFICATION]` pendente e pergunte ao usuário.
> 2. Crie `plan.md` a partir de `specs/_templates/plan.md`, com decisões, contratos e verificação da constituição.
> 3. Não escreva código de produção.

### Assistente

**Leitura.** Li o template de plano, o `plan.md` da spec 004 (como referência de formato), as entidades do Domain (`Profile`, `ProfilePhoto`, `ImageSignature`, `Occupation`, `Education`, `Course`, `Period`), a configuração EF das tabelas, as migrations `AddAuth`/`AddProfile` (nomes literais de colunas), o `Pbkdf2PasswordHasher` e a estrutura de testes.

**Pesquisa.** Busquei fontes de rostos sintéticos com licença de redistribuição: o conjunto *Nobodies* (Hugging Face) é CC0, mas tem só 32 imagens; *SFHQ* não declara licença; *FLUXSynID* é CC BY-NC; *Generated Photos* é pago.

**Ação:** criei `specs/006-usuarios-teste/plan.md`.

**Resposta final:**

Criei o `plan.md`. Falta uma decisão sua sobre as fotos, que bloqueia só a tarefa das imagens.

**O plano**
- **Migration:** uma migration `SeedTestUsers` só com dados, sem mudar o esquema.
- **Dados:** vêm de `users.json` e `photos/001…100.jpg`, embutidos no assembly da Infrastructure. Nada muda em Domain, Application, Api, frontend nem Docker.
- **Login:** `senha123` é hasheada uma vez no `Up` e repetida nos 100 usuários, todos `Active`.
- **Sem duplicar:** o `Up` apaga primeiro os usuários cujo e-mail está na lista e depois insere o conjunto. O `Down` apaga os mesmos pelo e-mail, e a cascata limpa perfil, foto e itens.
- **Testes:** um de integridade do conjunto, que valida cada item com as regras reais da spec 004, e um de login. A aplicação da migration é verificada à mão, em passos objetivos.

**Decisão pendente: a fonte das 100 fotos sintéticas.** A busca não achou conjunto grande com licença clara de redistribuição:
- *Nobodies* é CC0, mas tem só 32 imagens.
- *SFHQ* não declara licença.
- *FLUXSynID* é CC BY-NC.
- *Generated Photos* é pago.

Recomendo que você gere os 100 rostos com uma ferramenta cujos termos permitam redistribuição e os coloque em `photos/`. Você pode combinar com as 32 do Nobodies, se quiser. Escolha qual caminho seguir e eu registro em `FOTOS.md`.

**Pontos para conferir**
- Ao aplicar a migration, um usuário `@exemplo.com` igual a um da lista é removido. Isso foi aceito porque o domínio é reservado a testes.
- Nada foi implementado. Depois da sua decisão sobre as fotos, o próximo passo é `/tarefas`.

---

## 6. Usuário

> combine as 32

O modo de plano estava ativo: só o arquivo de plano podia ser editado.

### Assistente

**Ação:** escrevi o plano da alteração em `~/.claude/plans/combine-as-32-smooth-eagle.md` (usar as 32 do *Nobodies* CC0 mais 68 geradas; mudanças apenas em `plan.md`) e pedi aprovação com `ExitPlanMode`; o usuário aprovou. Em seguida atualizei `plan.md`: origem das fotos (32 + 68), riscos, `FOTOS.md` com uma linha por foto, regra de variedade (as 32 do *Nobodies* retratam só rostos femininos) e a verificação do teste de integridade.

**Resposta final:**

O `plan.md` agora usa as 32 fotos CC0 do *Nobodies* mais 68 geradas, e não tem mais pendência de decisão. Só alterei o plano: a spec, o código e as imagens ficaram como estavam.

- **Origem das fotos:** o `FOTOS.md` terá uma linha por foto, com número, origem (`nobodies` ou `gerada`), ferramenta e data, termos e link.
- **Variedade:** as 32 do *Nobodies* mostram só rostos femininos. As 68 geradas precisam compensar em gênero aparente, idade e etnia, e o nome de cada usuário deve combinar com a foto.
- **Teste de integridade:** além de conferir as 100 fotos (JPEG, até 2 MB, sem duplicadas), agora confere que o `FOTOS.md` tem 100 linhas.
- **Riscos:** o item pendente saiu. Sobrou a conferência dos termos de cada foto gerada antes de entrar no repositório.

Eu não tenho ferramenta de geração de imagens nesta sessão. Você precisa gerar as 68 imagens com uma ferramenta que permita redistribuição e colocá-las em `backend/src/Palestra.Infrastructure/Persistence/Seed/TestUsers/photos/`. O download das 32 do *Nobodies* eu faço na implementação, pedindo sua confirmação antes.

O próximo passo é `/tarefas`.

---

## 7. Usuário

> /tarefas

O comando `tarefas` foi acionado: ler `spec.md` e `plan.md` e criar `tasks.md` a partir do template, com cada tarefa referenciando um `RF-xx`, pequena e com forma de verificação, ordenada por dependência.

### Assistente

**Ação:** criei `specs/006-usuarios-teste/tasks.md` com 20 tarefas (T-01 a T-20), usando o `tasks.md` da spec 004 como referência de formato.

**Resposta final:**

Criei `tasks.md` com 20 tarefas ordenadas por dependência. Cada uma referencia um `RF-xx` e traz a forma de verificação.

- **Leitor dos dados (T-01 a T-02):** recursos embutidos e Guids fixos.
- **Conteúdo (T-03 a T-07):** `users.json` em 4 lotes de 25 usuários, por área de atuação. A última tarefa define o gênero aparente de cada foto e monta a tabela do `FOTOS.md`.
- **Fotos (T-08 a T-10):** baixar as 32 CC0, receber as 68 geradas, normalizar para JPEG de até 512 px e numerar.
- **Testes (T-11 a T-13):** integridade do conjunto e das fotos, validade dos perfis pelas regras reais da spec 004, e login com `senha123`.
- **Migration (T-14 a T-16):** criar vazia e conferir que o snapshot não muda, implementar `Up` e `Down`.
- **Documentação e validação (T-17 a T-20):** comandos e aviso no `CLAUDE.md`, suíte de testes, validação ponta a ponta no Docker e fechamento dos critérios.

Duas tarefas dependem de você:
- **T-08:** eu peço sua confirmação antes de baixar as 32 imagens, informando origem, arquivos e tamanho.
- **T-09:** você entrega as 68 imagens geradas com a ferramenta e os termos de uso de cada uma. Sem isso, T-10 a T-13 e T-19 ficam travadas.

Posso começar o `/implementar` por T-01 a T-07, que não dependem das fotos. Quer assim?

---

## 8. Usuário

> esquece essas imagens gere 100 avatares

### Assistente

**Ação:** troquei a decisão de imagens: em vez de fotos (reais ou sintéticas), 100 avatares ilustrados gerados pelo próprio projeto por um script determinístico, em domínio público (CC0). Atualizei spec (RF-06, RF-07, RNF-01, RNF-06, critérios e decisões), plan (PNG 256×256, `gerar_avatares.py`, `AVATARES.md`, riscos) e tasks (saíram o download e a espera pelas 68 imagens; entraram T-07 a T-10 para traços, gerador, geração/conferência visual e `AVATARES.md`).

**Resposta final:**

Troquei as fotos por 100 avatares ilustrados gerados pelo próprio projeto, e atualizei a spec, o plan e as tarefas. Ainda não gerei nenhum avatar: isso é a tarefa T-08 em diante.

- **Spec:** RF-07 passa a pedir avatares ilustrados, diferentes entre si, gerados de forma determinística e sem nenhuma pessoa real. A origem agora é do próprio projeto, em domínio público (CC0). Não há mais licença de terceiros para verificar.
- **Plano:** os avatares são PNG 256×256, de cerca de 3 a 10 KB cada. Um script `gerar_avatares.py` (Python com Pillow, que já está instalado aqui) os cria a partir de traços definidos no `users.json`: tom de pele, penteado, acessório e fundo. Só o script de geração é versionado, e o build, o Docker e os testes usam os PNG já prontos.
- **Tarefas:** saíram o download das 32 fotos, a espera pelas 68 e os pontos de parada com você. Entraram T-07 (traços de cada avatar), T-08 (o gerador), T-09 (gerar e conferir uma grade de contato) e T-10 (`AVATARES.md`). O teste de integridade passa a exigir PNG.

Com isso, nada mais depende de você e dá para rodar o `/implementar` do começo ao fim.

---

## 9. Usuário

> /implementar

O comando `implementar` foi acionado: ler spec, plan e tasks, executar as tarefas na ordem marcando `- [x]`, parar e atualizar a spec se a implementação divergir, e ao final validar os critérios de aceite.

### Assistente

**Leitura.** Li o `csproj` da Infrastructure e dos testes, as migrations `AddAuth`/`AddProfile` (nomes de colunas; `Level` gravado como nome do enum), `Education`/`Period` (assinaturas de `Update`), o `Pbkdf2PasswordHasher` e o `docker-compose.yml`.

**Ações:**
- **Conteúdo (T-03 a T-07):** escrevi um script descartável (fora do repositório, com semente fixa) que combina listas de nomes, cargos por nível, empresas fictícias, cursos e formações por área e gerou `Persistence/Seed/TestUsers/users.json` com 100 usuários. Conferido pelo próprio script: 11 áreas, 18 usuários com mais de 10 anos, 10 sem ocupação atual, 11 com formação em andamento, 1 doutorado, níveis de técnico a doutorado, 8 tons de pele, nomes, e-mails e bios únicos, contagens dentro dos limites e início máximo em 2026-08.
- **Avatares (T-08 a T-10):** escrevi `gerar_avatares.py` (Pillow, supersampling, determinístico), gerei os 100 PNG (cerca de 1,2 MB no total, o maior com 15 KB), conferi que duas execuções produzem o mesmo hash e olhei uma grade de contato (variados e legíveis). Criei `AVATARES.md` (como regenerar, ilustrações sem pessoa real, CC0).
- **Leitor dos dados (T-01, T-02):** `EmbeddedResource` no `csproj` com `LogicalName`; `TestUserSeedData` (modelos do JSON, Guids fixos para usuário e itens, leitura dos recursos).
- **Testes (T-11 a T-13):** `SeedTestUsersTests` com 7 testes: conjunto de 100 únicos em `@exemplo.com`; avatares PNG válidos, até 2 MB e distintos; contagens e bio única; todos os itens validados pelo Domain com `currentMonth = 2026-11`; casos de variedade; Guids únicos; senha de teste confere com o hash do login.
- **Migration (T-14 a T-16):** `dotnet ef migrations add SeedTestUsers` (exigiu `dotnet restore Palestra.slnx` antes; snapshot inalterado); implementei `Up` (apaga por e-mail, hash único de `senha123`, `InsertData` em `users`, `profiles`, `profile_photos`, `occupations`, `educations`, `courses`) e `Down` (apaga por e-mail). O script SQL gerado tem os `INSERT` esperados.
- **Documentação (T-17):** seção de usuários de teste nos Comandos do `.claude/CLAUDE.md`.
- **Validação no compose (T-18 a T-20):** o banco já tinha 4 usuários reais. O `dotnet ef` no contêiner exigiu `dotnet restore` no contêiner antes. Resultado: 104 usuários (100 de teste ativos), 102 perfis, 101 fotos, 329 ocupações, 139 formações, 391 cursos; login de um usuário com `senha123` retornou HTTP 200, e `GET /api/profile` e `GET /api/profile/photo` responderam corretamente. Reverter deixou 0 usuários de teste e os 4 reais intactos; reaplicar levou cerca de 3 s; com um e-mail de teste pré-existente ficou 1 registro, sem duplicar. A primeira tentativa de reverter falhou por causa do zsh (variável com flags não separada em argumentos), sem alterar nada, e foi repetida com os argumentos explícitos. Os testes do backend passam no host (36), rodando a partir de `backend/`.
- **Fechamento:** marquei as tarefas e os critérios de aceite e passei o status da spec para `implementada`, com notas da implementação no `tasks.md`.

**Resposta final:**

A feature 006 está implementada: a migration `SeedTestUsers` criou os 100 usuários de TI com perfil completo e avatar, e já está aplicada no seu banco de desenvolvimento. Os 36 testes passam (7 novos de integridade da carga). Não conferi as telas no navegador, só o login e o perfil pela API (login HTTP 200). Nada foi commitado.

**O que foi criado** (em `backend/src/Palestra.Infrastructure/Persistence/`)
- **Dados:** `Seed/TestUsers/users.json` traz, para cada usuário, bio única, de 2 a 5 ocupações, de 1 a 3 formações e de 2 a 6 cursos. São 11 áreas de TI, empresas fictícias e níveis de formação de técnico a doutorado. Todos têm e-mail `nome.sobrenome@exemplo.com`, senha `senha123` e conta ativa.
- **Avatares:** `Seed/TestUsers/photos/` tem 100 PNG ilustrados, gerados por `gerar_avatares.py`. A geração é determinística, com hash idêntico em duas execuções, e as imagens estão em CC0, conforme o `AVATARES.md`.
- **Migration:** `Migrations/…_SeedTestUsers.cs` inclui o `Down` que remove o conjunto. O snapshot do EF não mudou.
- **Documentação:** os comandos para aplicar e reverter, e a senha, estão em `.claude/CLAUDE.md`.

**O que verifiquei no Postgres do compose**
- **Carga:** 100 usuários ativos, 100 perfis, 100 fotos, 329 ocupações, 139 formações e 391 cursos.
- **Login e perfil:** o login de um usuário com `senha123` retornou 200, e o perfil e a foto vieram corretos.
- **Reverter e reaplicar:** reverter deixou 0 usuários de teste e os 4 reais intactos, e reaplicar levou cerca de 3 segundos.
- **E-mail já existente:** com um e-mail de teste pré-existente, ficou 1 registro, sem duplicar.
- **Spec:** marquei todos os critérios de aceite e passei o status para `implementada`.

**Pontos para saber**
- O `users.json` veio de um script descartável que não está no repositório; o que está versionado é o JSON.
- Para reaplicar ou reverter pelo contêiner, rode antes `dotnet restore` no contêiner `api`. A pasta `obj` é compartilhada com o host e o restore do host a deixava inconsistente.
- No host, rode `dotnet test --project tests/Palestra.Tests` a partir de `backend/`. Da raiz, o SDK local não aceita `--project`.
- Os 100 usuários continuam no seu banco de desenvolvimento. Para removê-los, use o comando de reverter do `CLAUDE.md`.

*(Caixa de próximo passo exibida pelo app: "Quer que eu commite essas mudanças?" — botões "Commit" e "Ainda não".)*

---

## 10. Usuário

> Ainda não

### Assistente

Tudo bem, não commitei nada. As mudanças continuam no working tree da branch `feat/004-perfil`, e o banco de desenvolvimento segue com os 100 usuários de teste.

Quando quiser commitar, é só pedir. Se quiser conferir antes como as telas ficaram, posso abrir o perfil de um dos usuários de teste no navegador.

---

## 11. Usuário

> faça o commit

### Assistente

**Ação:** conferi `git status` (CLAUDE.md, `csproj` da Infrastructure, migration, `Seed/`, testes e `specs/006-usuarios-teste/`) e a branch (`feat/004-perfil`); `git add -A` e commit com mensagem em português e a linha de coautoria do sistema.

**Resposta final:**

Commit feito: `9026942` — "Implementa usuários de teste com perfil completo (spec 006)", na branch `feat/004-perfil`. O working tree está limpo. Não fiz push nem abri PR.

---

## 12. Usuário

> exporte essa sessão toda para um arquivo .md na pasta ./docs use a nomenclatura NN-nome-da-sessao.md

### Assistente

**Ação:** listei `docs/` (já havia exportações de 01 a 10, a última `10-sessao-tempo-de-codificacao.md`), li o cabeçalho de `08-sessao-spec-plano-implementacao-perfil.md` para seguir o formato e criei este arquivo como `11-sessao-usuarios-teste.md`.
