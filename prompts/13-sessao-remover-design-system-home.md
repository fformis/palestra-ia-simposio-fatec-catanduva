# Sessão: remover exemplos de Design System da Home (spec 008)

- **Projeto:** palestra-ia-simposio-fatec-catanduva
- **Modelo:** Claude Sonnet 5.5 (toda a sessão, incluindo esta exportação)
- **Data da sessão:** 2026-11-17 (exportada em 2026-11-20)
- **Resultado:** feature `specs/008-remover-design-system-home/` completa (spec, plano e tarefas), implementada no frontend: o cartão "Design System" saiu da Home e `/design-system` ficou acessível só por URL direta. Commit `135262a` enviado para `origin/demo`. A tarefa T-08 (conferência visual) ficou para o usuário.

> Transcrição editada: as mensagens do usuário estão na íntegra (a saída longa do `docker compose` está resumida); as respostas do assistente estão preservadas; as chamadas de ferramenta aparecem resumidas.

---

## 1. Usuário — `/especificar`

> remover a exibição do exemplos de design system da home

### Assistente

**Exploração.** Li a constituição, listei `specs/` (001 a 007, logo o próximo número é 008) e o template `spec.md`. Busquei no frontend as referências a design system: `App.tsx`, `Home.tsx` e `DesignSystem.tsx`. Li `Home.tsx` (um `<Card>` "Design System" com o link "Abrir catálogo →" para `/design-system`) e o início da spec 002, cujos RF-14 e RF-15 dizem que o catálogo é acessado pela Home.

**Ação:** criei `specs/008-remover-design-system-home/spec.md` (rascunho) com:
- **RF-01:** a Home não exibe mais o cartão nem atalho para os exemplos.
- **RF-02:** o restante da Home (título e boas-vindas) fica inalterado, sem lacunas.
- **RF-03:** a spec 002 deve ser atualizada conforme a decisão em aberto.
- Critérios de aceite, fora de escopo e duas questões `[NEEDS CLARIFICATION]`.

**Resposta final:**

Criei `specs/008-remover-design-system-home/spec.md` com status `rascunho`. Não rodei nada nem toquei no código. Hoje a Home mostra um cartão "Design System" com o link "Abrir catálogo →".

Perguntas em aberto:
1. A página `/design-system` deve continuar existindo, acessível só por URL direta, ou deve ser removida por completo?
2. Se continuar, precisa de outro ponto de acesso (item no menu, rodapé) ou basta a URL direta?

---

## 2. Usuário

> manter a página, só acessível pela URL direta

### Assistente

**Ação:** atualizei a spec 008:
- **RF-03:** `/design-system` continua funcionando como hoje, acessível só por URL direta, sem link na Home, no menu ou em outra tela.
- **RF-04:** a spec 002 (RF-14 e RF-15) passa a dizer que o acesso é por URL direta.
- Novos critérios de aceite (a URL direta abre o catálogo nos dois temas; não há link para `/design-system`), "Fora de escopo" ampliado (não criar outro ponto de acesso), "Questões em aberto: nenhuma" e status `em revisão`.

**Resposta final:**

Spec 008 atualizada com a sua decisão e sem questões em aberto. Se a spec estiver ok, aprove e siga com `/planejar`.

---

## 3. Usuário — `/planejar`

### Assistente

**Exploração.** Li o template `plano.md`, listei as páginas do frontend e os testes existentes e procurei referências ao catálogo. O único teste afetado é o de `App.test.tsx` ("Home leva ao catálogo…"). `.cardLink` só é usado por `Home.tsx`.

**Ação:** criei `specs/008-remover-design-system-home/plan.md`:
- **Decisões:** apagar o bloco do `<Card>` de `Home.tsx`; manter a rota em `App.tsx` sem alteração; remover imports e `.cardLink` sem uso; trocar o teste existente por dois; ajustar a spec 002.
- **Escopo:** só frontend. Backend, contratos, banco, migration e Docker sem mudanças.
- **Constituição:** todos os itens marcados.
- **Riscos:** não apagar `Card` nem `.cardLink` indevidamente; o texto de boas-vindas cita "componentes padronizados", o que pode soar desconexo, mas alterá-lo está fora de escopo.

**Resposta final:** plano criado; a spec não tinha `[NEEDS CLARIFICATION]` pendente. Se estiver ok, siga com `/tarefas`.

---

## 4. Usuário — `/tarefas`

### Assistente

**Exploração.** Li o template `tasks.md` e o critério de aceite do RF-15 na spec 002.

**Ação:** criei `specs/008-remover-design-system-home/tasks.md` com 8 tarefas:
- **T-01 e T-02:** remover o cartão, os imports sem uso e a classe `.cardLink`.
- **T-03:** conferir que a rota ficou intacta e sem links para ela.
- **T-04 e T-05:** trocar o teste antigo por dois (Home sem o cartão; URL direta exibe o catálogo).
- **T-06:** atualizar a spec 002.
- **T-07:** rodar a suíte do frontend.
- **T-08:** conferência manual com `docker compose up --build`.

**Resposta final:** tarefas criadas, sem backend nem Docker. Se estiver ok, siga com `/implementar`.

---

## 5. Usuário — `/implementar`

### Assistente

**Exploração.** Confirmei com `grep` que `cardLink` só aparecia em `Home.tsx` e `pages.module.css`, e que `design-system` só aparecia na rota de `App.tsx` e no link da Home.

**Ação:**
- [Home.tsx](frontend/src/pages/Home.tsx): reescrito só com o título e o texto de boas-vindas, sem os imports `Link` e `Card`.
- [pages.module.css](frontend/src/pages/pages.module.css): removida a classe `.cardLink`.
- [App.test.tsx](frontend/src/App.test.tsx): o teste antigo foi substituído por "Home não exibe cartão nem link do Design System" e "URL direta /design-system exibe paleta, tipografia, componentes e animações".
- [spec 002](specs/002-design-system/spec.md): RF-14, RF-15 e o critério de aceite do RF-15 agora dizem "acessada apenas por URL direta (spec 008)".

**Verificação.** `grep` sem sobras de `cardLink`; a única ocorrência de `design-system` no código de produção é a rota. `npm test`: 8 arquivos, 46 testes passando. Marquei T-01 a T-07 em `tasks.md` e o status da spec como `implementada`.

**Correção durante a validação.** O `tsc -b` acusou `userEvent` importado e sem uso em `App.test.tsx` (o `vitest` não detecta isso). Removi o import; `tsc -b` passou e os 46 testes continuaram passando.

**Resposta final:**

Implementei a feature 008: o cartão saiu da Home e `/design-system` continua acessível só por URL direta. `tsc -b` e a suíte do frontend passam (46 testes). Não abri o app no navegador, então a T-08 ficou pendente e nada foi commitado. Para fechar a T-08: subir o app, conferir a Home nos temas claro e escuro e nas três larguras, abrir `/design-system` pela URL e ver que o menu não tem link para ele.

---

## 6. Usuário

> `docker compose up --build` (executado pelo próprio usuário no terminal; a saída completa foi colada na conversa)

### Assistente

O log mostrou as imagens da API e do frontend reconstruídas, o banco saudável, o Vite pronto em `localhost:5173`, a API ouvindo em `:8080` com "No migrations were applied. The database is already up to date" e consultas de login e perfil (ou seja, o usuário usou o app). Em seguida a pilha foi encerrada (códigos 143 e 137, apenas o Ctrl+C).

**Resposta final:**

A pilha subiu sem erros. O log não mostra o resultado visual, então a T-08 continua pendente. A única mensagem de erro é do `dotnet watch`, sobre um caminho `obj\Debug/...` com barra invertida: é um problema do ambiente Docker, sem relação com a feature, e a API iniciou normalmente. Falta conferir a Home (sem o cartão, nos dois temas e nas três larguras), `/design-system` pela URL e o menu sem link para o catálogo; basta avisar que eu marco a T-08.

---

## 7. Usuário

> faça o commit e o push

### Assistente

**Ação.** Conferi `git status` (4 arquivos modificados e a pasta `specs/008-remover-design-system-home/` nova), a branch (`demo`) e o remoto (`origin`). Fiz `git add -A`, o commit com a mensagem "Remove exemplos de Design System da Home, mantendo /design-system por URL direta (spec 008)" (com o `Co-Authored-By` de atribuição) e `git push -u origin demo`.

**Resultado:** `297cbba..135262a  demo -> demo`, com a branch passando a rastrear `origin/demo`.

**Resposta final:** commit e push feitos na branch `demo`. A T-08 continua desmarcada em `tasks.md`, porque a conferência visual é do usuário.

---

## 8. Usuário

> exporte essa sessão toda para um arquivo .md na pasta ./docs use a nomenclatura NN-nome-da-sessao.md

### Assistente

Listei `docs/` (já havia as sessões 01 a 12, com dois arquivos de número 11) e usei o formato do `12-sessao-readme.md` como modelo. O próximo número livre é 13, então esta sessão foi gravada em `docs/13-sessao-remover-design-system-home.md`.
