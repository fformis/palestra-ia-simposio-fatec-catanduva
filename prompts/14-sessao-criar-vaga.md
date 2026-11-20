# Sessão: spec, plano, tarefas e implementação de vagas (spec 009)

- **Projeto:** palestra-ia-simposio-fatec-catanduva
- **Modelo:** Claude Opus 5.5 (toda a sessão, incluindo esta exportação)
- **Data da sessão:** 2026-11-19 a 2026-11-20 (exportada em 2026-11-20)
- **Resultado:** feature `specs/009-criar-vaga/` completa (spec aprovada, plano, 38 tarefas) e implementada no backend e no frontend: item **Criar** no menu, formulário de vaga com descrição formatada e imagem, curtidas e candidaturas com contagens, lista de candidatos, perfil somente leitura e currículo para impressão em PDF. Commit `2e62a47` no branch `palestra-implementacao` (não enviado ao remoto; sem PR).

> Transcrição editada: as mensagens do usuário estão na íntegra; as respostas finais do assistente estão preservadas (algumas levemente condensadas); as chamadas de ferramenta aparecem resumidas.

---

## 1. Usuário — `/especificar`

> criar vaga
>
> A partir de um novo item no menu (Criar).
> Quero poder criar uma vaga com: Cargo, Empresa (opcional), Imagem (opcional), Descrição, Lista de benefícios [Plano Médico, Plano Odontológico, Plano Saúde Pet, Gympass, Day off de aniversário], Regime de contração, Valor, Status  do anúncio(ativo ou inativo), Data da criação.
> Os usuários podem curtir e descurtir uma vaga e podem candidatar-se e desistir da candidatura.
> As curtidas devem ser contabilizadas.
> O número de candidatos deve ser contabilizado.
>
> Manter a lista de candidatos à vaga, sendo possível acessar um perfil de somente leitura do candidato, e imprimir o curriculum em PDF.

### Assistente

**Exploração.** Li a constituição, listei `specs/` (001 a 008, logo o próximo número é 009) e o template `spec.md`. Li as specs 004 (perfil), 005 e 007 (menu/avatar) para manter os termos, e confirmei que o menu hoje só tem **Home**. Notei que a spec 004 define o perfil como privado (RF-23), o que esta feature precisa ampliar.

**Ação:** criei `specs/009-criar-vaga/spec.md` (rascunho) com 27 RFs, 7 RNFs e 14 critérios de aceite, incluindo um RNF de privacidade para a exceção ao perfil privado (o anunciante vê o perfil de quem se candidatou a uma vaga dele, só enquanto a candidatura estiver ativa).

**Resposta final (resumo):** 15 questões em aberto, com destaque para a 8 (sem ela não há onde os usuários vejam as vagas):
1. Qualquer usuário anuncia ou existe papel de recrutador?
2. Limites de cargo e descrição; descrição com formatação?
3. Opções de regime de contratação?
4. Valor único ou faixa? Periodicidade? "A combinar"?
5. Status padrão ao criar?
6. Vaga inativa visível aos demais? Inscritos podem desistir?
7. Editar ou excluir a vaga?
8. Onde os usuários encontram as vagas e em que ordem?
9. Lista "Minhas vagas"?
10. Anunciante curte a própria vaga?
11. Candidatura exige perfil mínimo? Pede confirmação?
12. Pode se candidatar de novo após desistir?
13. Contagem de candidatos pública?
14. Ordem da lista de candidatos?
15. E-mail do candidato para o anunciante e no PDF? PDF cita a vaga? Layout de referência?

---

## 2. Usuário

> 1 o usuário
> 2 500 - formatação
> 3. CLT, PJ, Estágio
> 4 valor único, mensal
> 5 ativo
> 6 só ao usuário que criou
> 7 Só editar
> 8 (será outra spec)
> 9 (outra spec)
> 10 Não
> 11 sim, sim
> 12 sim
> 13 publica
> 14 alfabética
> 15 sim, sim, não

### Assistente

**Ação:** reescrevi a spec com as 15 respostas, uma seção "Decisões registradas" e status "em revisão". Listagem de vagas e "Minhas vagas" foram para "Fora de escopo" (cada vaga é aberta pela própria página). Acrescentei o RNF-03: a descrição formatada nunca executa código.

**Resposta final (resumo):** interpretei a resposta 2 como valendo para a descrição e, na 15, assumi que não há layout de referência. Restaram 5 questões menores, com sugestões: cargo até 100 caracteres; negrito, itálico e listas, sem links, contando só o texto visível; aceitar que o candidato não desista de vaga inativa; perfil mínimo = uma ocupação ou formação; PDF sem layout de referência.

---

## 3. Usuário

> Aceitar sugestões

### Assistente

**Ação:** apliquei as 5 sugestões na spec e nas decisões registradas; "Questões em aberto" ficou "Nenhuma" (zero `[NEEDS CLARIFICATION]`). A tentativa de mudar o status para "aprovada" foi bloqueada pelo modo automático, por ser decisão do usuário.

**Resposta final (resumo):** spec sem lacunas, ainda "em revisão" porque aprovar cabe ao usuário.

---

## 4. Usuário

> Aprovar e planejar

### Assistente

**Ação:** marquei a spec como **aprovada** e rodei `/planejar`. Li o template de plano, o plano da spec 004 e o código existente (`ProfileController`, casos de uso e repositório do perfil, `ImageSignature`, `navItems.ts`, `App.tsx`, `api.ts`, `TimelineSection`). Criei `specs/009-criar-vaga/plan.md`.

**Resposta final (resumo):**
- Rotas sob `/api/jobs` (13 endpoints); usuário sempre pelo cookie; recurso negado responde `404` para não revelar existência.
- Curtidas e candidaturas com chave composta `(vaga, usuário)` e operações idempotentes; contagens calculadas por `COUNT`.
- Descrição em Markdown restrito com editor de 4 botões e pré-visualização; renderização como elementos React, sem HTML (RNF-03).
- Imagem da vaga reaproveitando a solução da foto de perfil (PostgreSQL + assinatura do arquivo).
- Perfil do candidato reaproveitando o perfil da spec 004 em modo somente leitura, com rota própria para a foto.
- Sem dependências novas e sem mudança no Docker; migration `AddJobs`.
- Ponto de decisão: PDF pelo diálogo de impressão do navegador ("Salvar como PDF") ou download direto gerado no backend (ex.: QuestPDF).

---

## 5. Usuário

> Sim, seguir /tarefas

### Assistente

**Ação:** rodei `/tarefas`. Com base no template e no `tasks.md` da spec 004, criei `specs/009-criar-vaga/tasks.md` com 38 tarefas na ordem Domain → Application → Infrastructure → Api → Frontend → Validação, cada uma com os RFs e a forma de verificação.

**Resposta final (resumo):**

| Etapa | Tarefas | O que cobre |
|---|---|---|
| Domain | T-01 a T-05 | listas fixas, contagem visível, regras da vaga, imagem, curtida e candidatura |
| Application | T-06 a T-14 | casos de uso da vaga, imagem, curtir, candidatar-se, candidatos |
| Infrastructure | T-15 a T-18 | mapeamento, repositório, migration `AddJobs`, configuração |
| Api | T-19 a T-22 | `JobsController`, verificado com `curl` |
| Frontend | T-23 a T-36 | serviços, editor, formulário, menu, páginas, currículo |
| Validação | T-37 e T-38 | suítes, lint e critérios de aceite no Docker |

---

## 6. Usuário

> Sim, implementar

### Assistente

**Backend.**
- Domain (`Palestra.Domain/Jobs`): enums e códigos (`JobCodes`), `JobDescription.VisibleLength`, entidade `Job` com `Create`/`Update` e erros por campo, `IsVisibleTo`, `JobImage`, `JobLike`, `JobApplication`.
- Application (`Palestra.Application/Jobs`): `IJobRepository`, DTOs, `JobReader`, `CandidateAccess` e os casos de uso `CreateJob`, `GetJob`, `UpdateJob`, `UploadJobImage`, `GetJobImage`, `RemoveJobImage`, `SetLike`, `SetApplication`, `ListCandidates` (ordem pt-BR), `GetCandidateProfile`, `GetCandidatePhoto`.
- Testes xUnit em `tests/Palestra.Tests/Jobs/JobTests.cs` com repositório em memória: 49 de 51 na primeira rodada; os 2 erros eram dos próprios testes (comparação de array em tupla e status ausente na edição), corrigidos.
- Infrastructure: configurações EF (benefícios como `text[]`, `numeric(12,2)`, PKs compostas), `JobRepository` (tratando violação de chave única em cliques simultâneos), registro em DI e seção `Jobs` no `appsettings.json`. `JobsController` na Api.
- **Incidente 1:** o build local sobrescreveu o `obj/` compartilhado com o container; resolvido com `dotnet restore` dentro do container. Migration `AddJobs` gerada no container.
- **Incidente 2:** o banco local já tinha tabelas `job*` de outra implementação (migration `20261119234453_AddJobs`, de outro branch, com 1 vaga gravada).

**Pergunta ao usuário:** como limpar o banco local — remover só as tabelas antigas, recriar o volume ou deixar com o usuário?

**Usuário respondeu:** "Recriar o volume do banco".

**Ação:** `docker compose down -v` e `up -d`; todas as migrations reaplicadas (inclui os 100 usuários de teste).

**Frontend.**
- `jobTypes.ts`, `jobService.ts`, novos códigos de erro, `format.ts`, `markdown.ts` (renomeado de `richText.ts`, que colidia com `RichText.tsx` no macOS), `RichText`, `DescriptionEditor`, `JobForm`, `JobCreate`, `JobEdit`, `JobPage`, `CandidateList`, `CandidateProfile`, `ResumePrint` (+ CSS de impressão A4), hook `useCandidate`, ilustração `public/vaga-padrao.svg`.
- `TimelineSection` ganhou `readOnly`; `TextArea` passou a aceitar `ref`; item **Criar** em `navItems.ts` e rotas em `App.tsx`.
- 15 testes Vitest novos + 1 no layout; suíte completa 62/62, lint e build ok. Backend 51/51 rodando no container.

**Validação.**
- Pela API (`curl` com três usuários de teste e um usuário novo, ativado pelo e-mail do smtp4dev): `401` sem sessão, validação, `404` para outro usuário, imagem PNG aceita e texto renomeado recusado com `nosniff`, curtida idempotente e 6 curtidas simultâneas contando 1, `own_job`, `profile_incomplete`, candidatar/desistir, lista alfabética (Anderson antes de André), perfil e foto do candidato, `404` após desistência e em vaga inativa.
- No navegador: página do dono com lista de candidatos, perfil somente leitura, currículo (a impressão real travou o painel; conferido com `window.print` interceptado), tela Criar no celular sem rolagem horizontal e criação de vaga pela tela com redirecionamento e aviso de sucesso.
- Ajuste visual: botão de impressão do currículo deixou de flutuar.
- `tasks.md` e critérios da spec marcados; spec "implementada"; notas da implementação registradas.

**Resposta final (resumo):** feature implementada, sem commit. Não verificado: "Salvar como PDF" no diálogo do navegador. Avisos: banco local recriado (ficaram as vagas de teste "Dev .NET Pleno" e "Analista de Dados" e o usuário `caio.novo@exemplo.com`); rodar testes do backend dentro do container para não quebrar o `obj/` compartilhado; desvios do plano listados no `tasks.md`; a barra de formatação aparece acima do rótulo "Descrição".

---

## 7. Usuário

> Revisar antes

### Assistente

Sugeri a ordem de leitura: specs (`spec.md`, `plan.md`, `tasks.md` e suas notas); backend (`Job.cs`, `JobDescription.cs`, `JobUseCases.cs`, `JobRepository.cs`, `JobsController.cs`, migration `AddJobs`, `JobTests.cs`); frontend (`JobPage.tsx`, `JobForm.tsx`, `DescriptionEditor.tsx`, `markdown.ts`, `RichText.tsx`, `CandidateProfile.tsx`, `ResumePrint.tsx`, `jobs.test.tsx` e os arquivos existentes alterados). Para teste manual: vaga "Dev .NET Pleno" como dono com `alexandre.cunha@exemplo.com` e como candidato com `andre.araujo@exemplo.com` (senha do seed).

---

## 8. Usuário

> pode commitar

### Assistente

**Ação:** `git add` de `backend/`, `frontend/` e `specs/009-criar-vaga/` e commit com a mensagem "Implementa criação de vagas, curtidas, candidaturas e currículo (spec 009)".

**Resposta final:** commit `2e62a47` no branch `palestra-implementacao`; árvore limpa; nada enviado ao remoto.

---

## 9. Usuário

> Agora não

### Assistente

Sem PR por enquanto; o commit `2e62a47` está só no branch local `palestra-implementacao`.

---

## 10. Usuário

> exporte essa sessão toda para um arquivo .md na pasta ./docs use a nomenclatura NN-nome-da-sessao.md

### Assistente

**Ação:** listei `docs/` (última sessão numerada: 13), li uma sessão anterior para seguir o mesmo formato, exportei a transcrição bruta do app (zip em `~/Downloads`) e escrevi este arquivo, `docs/14-sessao-criar-vaga.md`.
