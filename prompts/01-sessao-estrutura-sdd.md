# Sessão: definição da estrutura SDD do repositório

- **Projeto:** palestra-ia-simposio-fatec-catanduva
- **Modelo:** Claude Sonnet 5.5
- **Data da sessão:** 2026-11-10
- **Resultado:** estrutura SDD, constituição, comandos, templates e esqueleto da solução (backend .NET, frontend React, Docker)

> Transcrição editada: as mensagens do usuário estão na íntegra; as respostas do assistente estão preservadas, e as chamadas de ferramenta aparecem resumidas.

---

## 1. Usuário

> vamos definir a estrutura do repositório, para utilizar o padrão SDD de desenvolvimento

### Assistente

**Investigação inicial.** O repositório tinha `LICENSE`, `CLAUDE.md` (apontando para `.claude/CLAUDE.md`), `backend/`, `frontend/` e `specs/` (com `.gitkeep`), além de `.claude/CLAUDE.md` e `.claude/CONSTITUTION.md` **vazios**, e `.claude/commands` e `.claude/skills` vazios.

**Ações:** criei o esqueleto SDD sem presumir stack:

- `.claude/CLAUDE.md` com visão geral, estrutura, fluxo SDD e regras de trabalho.
- `.claude/CONSTITUTION.md` com 7 princípios (spec primeiro, simplicidade, verificabilidade, separação de responsabilidades, rastreabilidade, segurança/privacidade, decisões abertas).
- Comandos `/specify`, `/plan`, `/tasks`, `/implement` em `.claude/commands/`.
- Templates `spec.md`, `plan.md`, `tasks.md` em `specs/_templates/` e uma spec de exemplo `specs/001-exemplo/`.

**Resposta final:**

Montei a estrutura SDD do repositório. Nada foi commitado, e a stack ainda não está definida.

```
.claude/
  CLAUDE.md          # visão geral, fluxo SDD e regras de trabalho
  CONSTITUTION.md    # 7 princípios: spec primeiro, simplicidade, verificabilidade...
  commands/          # /specify → /plan → /tasks → /implement
  skills/
specs/
  _templates/        # spec.md, plan.md, tasks.md
  001-exemplo/spec.md  # spec de exemplo, para apagar ou substituir
backend/  frontend/
```

Fluxo:
1. `/specify <descrição>` cria `specs/NNN-slug/spec.md` (só o quê e o porquê; lacunas como `[NEEDS CLARIFICATION]`).
2. `/plan` gera o `plan.md` com decisões técnicas, contratos e checagem da constituição.
3. `/tasks` quebra o plano em tarefas pequenas, cada uma ligada a um `RF-xx`.
4. `/implement` executa as tarefas na ordem; se o código divergir da spec, a spec é atualizada primeiro.

Não presumi stack, domínio nem ferramentas de teste. O texto da constituição e dos comandos é um ponto de partida.

*(Pergunta ao usuário: qual stack do backend e do frontend registrar na constituição? Opções: "Vou informar" / "Decidir depois".)*

---

## 2. Usuário

> Vou informar

### Assistente

Pode mandar: qual stack do backend e do frontend (linguagem, framework, banco de dados)? Se já tiver, inclua também as ferramentas de teste e de lint.

Com isso registro tudo na seção técnica da `CONSTITUTION.md` e ajusto os templates e comandos para a stack escolhida.

---

## 3. Usuário

> backend com C#, EF Core, Code First, Arquitetura Limpa
> frontend react com typescript
> banco de dados postgresql
> toda a solução roda no docker local

### Assistente

**Ações:** atualizei `CONSTITUTION.md` (seções 8–12), `.claude/CLAUDE.md` e os templates `plan.md` e `tasks.md`.

**Resposta final:**

Registrei a stack no repositório. Só editei documentação e templates, não criei código nem `docker-compose.yml`.

`.claude/CONSTITUTION.md` ganhou cinco seções:
- **8. Stack oficial:** C# com ASP.NET Core e EF Core, React com TypeScript, PostgreSQL e Docker.
- **9. Arquitetura Limpa:** camadas `Domain`, `Application`, `Infrastructure` e `Api` em `backend/src/`, com dependências sempre para dentro. `Domain` e `Application` não referenciam EF Core, ASP.NET nem Npgsql; controllers só delegam a casos de uso.
- **10. Code First:** o modelo C# é a fonte da verdade do esquema; toda mudança gera uma migration; mapeamento via `IEntityTypeConfiguration`.
- **11. Frontend:** TypeScript `strict`, sem `any` injustificado, chamadas à API isoladas numa camada de serviços.
- **12. Docker:** um único `docker compose up` sobe api, frontend e postgres; configuração por variáveis de ambiente, `.env` fora do git e `.env.example` versionado.

Também: `.claude/CLAUDE.md` com a estrutura e as novas regras; `plan.md` com impacto por camada, frontend, Docker e checagem da Arquitetura Limpa; `tasks.md` ordenado Domain → Application → Infrastructure → Api, com seção Docker/infra.

Ainda não defini versões nem ferramentas de teste e lint. Ofereci criar o esqueleto da solução.

---

## 4. Usuário

> Use o LTS de todos, e ferramentas de teste xTest e Vitest

### Assistente

**Verificação:** consultei a API do endoflife.date em vez de assumir versões.

| Produto | Resultado |
|---|---|
| .NET | 10 é LTS (suporte até 2028-11-14); o 8 sai de suporte em 2026-11-10 |
| Node.js | 24 é LTS (2025-10-28); 26 virou LTS em 2026-10-28 |
| PostgreSQL | sem rótulo LTS; a major mais recente suportada é a 18 (até 2030) |

**Ação:** registrei as versões e as ferramentas de teste na constituição.

**Resposta final:**

| Item | Escolha | Observação |
|---|---|---|
| Backend | .NET 10 e EF Core 10 | LTS atual |
| Frontend | Node.js 26 | LTS recente; o Node 24 também é LTS e mais maduro |
| Banco | PostgreSQL 18 | não há LTS; major suportada mais recente |
| Testes | xUnit v3 e Vitest com React Testing Library | RTL foi escolha minha |

As imagens Docker ficam fixadas por tag, nunca `latest`.

---

## 5. Usuário

> use o node 24,
> Os teste devem ser concisos, estamos preparando uma demonstração com desenvolvimento ao vivo

### Assistente

**Ações:** troquei para Node 24 (tabela e tag `node:24`) e criei a seção **8.1 Testes** na constituição; a regra também entrou no `CLAUDE.md`.

**Resposta final:**

- **Node 24 (LTS):** atualizado na constituição e no resumo do `CLAUDE.md`.
- **Testes concisos:** um teste por critério de aceite, com o caminho feliz e no máximo um caso de erro relevante; sem testes de getters, DTOs ou mapeamentos triviais; sem mocks elaborados (dados simples e repositório em memória); testes de poucas linhas, um assert principal, suíte rodando em segundos.

---

## 6. Usuário

> sim

*(Resposta à oferta de criar o esqueleto da solução.)*

### Assistente

**Verificação do ambiente:** .NET SDK 10.0.300, Node v24.16.0, npm 11.13.0, Docker 29.5.3.

**Backend (`backend/Palestra.slnx`)**
- Criei os projetos `Palestra.Domain`, `Palestra.Application`, `Palestra.Infrastructure`, `Palestra.Api` (webapi com controllers) e `Palestra.Tests`, com referências no sentido da Arquitetura Limpa.
- O template `xunit3` não existe no SDK; o template `xunit` traz **xUnit v2**. Troquei o `.csproj` por **xunit.v3** (4.0.3).
- `Infrastructure`: EF Core 10 + Npgsql, `AppDbContext` (aplica `IEntityTypeConfiguration` do assembly) e `AddInfrastructure`.
- `Api`: `GET /health`, CORS para o frontend, sem HTTPS redirection; `Dockerfile` com `dotnet watch`.
- Um teste de fumaça (provider Npgsql).

**Problemas encontrados e corrigidos**
1. `dotnet test` no .NET 10 exige o modo Microsoft.Testing.Platform → `global.json` com `"test": { "runner": "Microsoft.Testing.Platform" }` e remoção de `Microsoft.NET.Test.Sdk` e `xunit.runner.visualstudio`. Comando passou a ser `dotnet test --project backend/tests/Palestra.Tests`.
2. Aviso NU1903 (vulnerabilidade alta) em `Microsoft.OpenApi` 2.0.0 transitivo → tentei a 3.11.0 (incompatível com o gerador de código do `Microsoft.AspNetCore.OpenApi`, erro CS0200) → fixei na **2.13.0**. Build com 0 avisos.
3. Versões `10.*` dos pacotes EF substituídas pelas resolvidas: EF Core 10.0.15, Npgsql.EFCore.PostgreSQL 10.0.3, EF Design 10.0.15.

**Frontend (`frontend/`)**
- Vite (`react-ts`): React 19, TypeScript 7, Vite 8, oxlint.
- Adicionei Vitest 5, jsdom e React Testing Library; `strict: true`; script `npm test`.
- `App` mínimo e um teste. `Dockerfile` com `node:24-alpine`.

**Docker / infra**
- `docker-compose.yml` com `db` (postgres:18, healthcheck, volume nomeado), `api` (bind mount + `dotnet watch`) e `frontend` (Vite dev, portas 8080/5173/5432).
- `.env.example` versionado, `.env` ignorado, `.gitignore` e `.dockerignore`.

**Validação:** `dotnet build` (0 avisos), `dotnet test` (1/1), `npm test` (1/1), `npm run build` e `npm run lint` ok. Com `docker compose up -d --build`: `GET :8080/health` → `{"status":"ok"}`, frontend `:5173` → 200, db saudável. Depois `docker compose down`.

**Documentação:** adicionei a seção "Comandos" ao `.claude/CLAUDE.md`.

**Resposta final:**

O esqueleto da solução está pronto e rodando. Nada foi commitado.

- **Backend:** quatro camadas, EF Core 10 e Npgsql, `/health`, CORS e um teste xUnit v3.
- **Frontend:** React 19 e TypeScript `strict`, Vitest e React Testing Library, uma tela e um teste.
- **Docker:** postgres 18, api e frontend em modo desenvolvimento com hot reload; web em 5173, api em 8080, postgres em 5432.

Ajustes durante a montagem: modo Microsoft.Testing.Platform no `global.json`; `Microsoft.OpenApi` fixado em 2.13.0; versões do EF Core e do Npgsql fixadas; o Vite gerou TypeScript 7 e Vitest 5 (estáveis mais recentes).

Falta definir a primeira feature real e apagar `specs/001-exemplo`. Quando quiser, é só rodar `/specify`.

---

## 7. Usuário

> exporte essa sessão toda para um arquivo .md

### Assistente

Gerei este arquivo.

---

## Apêndice: estado do repositório ao fim da sessão

```
.claude/{CLAUDE.md, CONSTITUTION.md, commands/{specify,plan,tasks,implement}.md, skills/}
specs/{_templates/{spec,plan,tasks}.md, 001-exemplo/spec.md}
backend/{global.json, Palestra.slnx, src/{Domain,Application,Infrastructure,Api}, tests/Palestra.Tests}
frontend/{package.json, vite.config.ts, Dockerfile, src/{App.tsx, App.test.tsx, ...}}
docker-compose.yml  .env.example  .gitignore
```

Decisões de stack registradas na constituição: .NET 10 + EF Core 10 (Code First), Arquitetura Limpa, xUnit v3, React + TypeScript (Node 24), Vitest, PostgreSQL 18, tudo em Docker local; testes concisos por causa da demonstração ao vivo (seção 8.1).

> Observação: os arquivos `.claude/CLAUDE.md` e os comandos foram alterados depois desta sessão (por exemplo, comandos renomeados para `/especificar`, `/planejar`, `/tarefas` e `/implementar`, e novos itens de seed e smtp4dev). Este documento reflete apenas o que foi feito nela.
