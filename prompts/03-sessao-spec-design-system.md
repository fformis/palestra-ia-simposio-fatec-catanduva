# Sessão: especificação do design system

- **Projeto:** palestra-ia-simposio-fatec-catanduva
- **Modelo:** Claude Sonnet 5.5
- **Data da sessão:** 2026-11-11
- **Resultado:** spec `002-design-system` aprovada, sem questões em aberto

> Transcrição editada: as mensagens do usuário estão na íntegra; as respostas do assistente estão preservadas, e as chamadas de ferramenta aparecem resumidas.

---

## 1. Usuário

> `/specify` design system
>
> precisamos criar o design system do app, precisamos ter modo claro e escuro, com o default baseado no sistema do usuário, quero uma sugestão de paletas e efeitos para animações, a aplicação será uma web e responsiva.
>
> teremos um menu lateral do lado esquerdo que nos levará as principais funcionalidades do sistema.

O comando também instruía: ler `.claude/CONSTITUTION.md` e listar `specs/` para definir `NNN` e o slug; criar `specs/NNN-slug/spec.md` a partir do template; descrever apenas O QUÊ e POR QUÊ; marcar lacunas como `[NEEDS CLARIFICATION]` e listá-las ao final.

### Assistente

**Investigação inicial.** Li a constituição e o template `specs/_templates/spec.md`. Em `specs/` havia só `001-exemplo` (um placeholder do template), então o próximo número é **002**.

**Ação:** criei `specs/002-design-system/spec.md` (status `rascunho`) com:

- **Temas:** claro e escuro; padrão segue o sistema; escolha manual Sistema/Claro/Escuro, lembrada; sem "flash" de tema.
- **Paletas:** três propostas (A Índigo, com tabela completa nos dois temas; B Esmeralda; C Violeta/Magenta).
- **Animações:** durações, curvas e lista de efeitos reutilizáveis; respeito a movimento reduzido.
- **Menu lateral esquerdo:** fixo no desktop, recolhível, sobreposto em telas pequenas, acessível por teclado e leitor de tela.
- **Responsividade e acessibilidade:** três faixas de tela; contraste WCAG AA.
- **Página de catálogo** "Design System" e critérios de aceite verificáveis.

**Resposta final:**

Criei a spec em `specs/002-design-system/spec.md`, com status `rascunho`. Usei o número 002 porque `001-exemplo` é só o placeholder do template.

Questões marcadas como `[NEEDS CLARIFICATION]`:

1. Qual paleta usar (A, B, C) ou há cores de marca próprias?
2. Quais itens e ícones entram no menu lateral, em que ordem? Nesta feature entram só itens provisórios?
3. Qual nome ou logotipo vai no topo do menu?
4. No tablet, o menu fica recolhido como no celular ou fixo/compacto como no desktop?
5. Há fonte de marca preferida, ou usamos uma neutra?
6. Onde fica o seletor de tema: no rodapé do menu, no cabeçalho ou nos dois?
7. As animações devem ser discretas (recomendado) ou mais expressivas para a demonstração da palestra?

Resolva essas questões antes do `/plan`.

---

## 2. Usuário

> Paleta A Índigo, menu recolhido no tablet, fonte neutra, animações mais expressivas, seletor de tema no cabeçalho canto superior direito, itens do menu: home, logout

### Assistente

**Ação:** atualizei a spec (status `em revisão`):

- Paleta A Índigo como única paleta (B e C removidas).
- Tablet com menu recolhido, como o celular.
- Seletor de tema no cabeçalho, canto superior direito (novo RF-16).
- Fonte neutra.
- Animações em perfil expressivo (revelação circular na troca de tema, brilho animado no hover), sem bloquear a interação e simplificadas com movimento reduzido.
- Menu com Home e Logout; critérios de aceite novos para tablet e posição do seletor.

**Resposta final:**

Atualizei a spec com suas decisões. Ainda em aberto:

1. **Logout sem autenticação:** a autenticação está fora de escopo, mas o menu terá Logout. Nesta feature o item fica só visual, tem uma ação provisória, ou a autenticação vira uma feature própria antes?
2. **Marca:** qual nome ou logotipo vai no topo do menu?

---

## 3. Usuário

> sem logout por enquanto
> somente placeholder do logo

### Assistente

**Ação:** atualizei a spec para o status `aprovada`:

- RF-14: o menu contém apenas **Home**; no topo há um placeholder de logotipo (bloco/ícone genérico + nome textual provisório).
- Logout e autenticação movidos para o fora de escopo, a tratar em feature própria.
- Seção de questões em aberto: "Nenhuma questão em aberto."

**Resposta final:**

A spec 002-design-system está aprovada e sem questões em aberto. Nada foi commitado. Próximo passo: `/plan`.

---

## 4. Usuário

> exporte essa sessão toda para um arquivo .md
>
> exporte essa sessão toda para um arquivo .md na pasta ./docs use a nomenclatura NN-nome-da-sessao.md

### Assistente

**Investigação inicial.** `docs/` já tinha `01-sessao-estrutura-sdd.md` e `02-sessao-skills-dotnet-react.md`; o próximo número é **03**. Apresentei um plano (em modo de planejamento), aprovado pelo usuário.

**Ação:** criei este arquivo, `docs/03-sessao-spec-design-system.md`, seguindo o formato dos anteriores.

---

## Referências

- Spec produzida: [`specs/002-design-system/spec.md`](../specs/002-design-system/spec.md)
- Próximo passo do fluxo SDD: `/plan`
