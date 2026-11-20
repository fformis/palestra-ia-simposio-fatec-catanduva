# Sessão: criação das skills `dotnet-efcore` e `react-vite`

Projeto: Palestra IA — Simpósio FATEC Catanduva (Spec-Driven Development)
Branch: `main`

> Exportação da conversa. Chamadas de ferramentas aparecem resumidas; o conteúdo completo das skills está nos arquivos citados.

---

## 1. Usuário

> crie uma skill para desenvolvimento com C#, especialista em dotnet 10 e ef core

### Claude — ações

- Leu `.claude/CONSTITUTION.md` (seções 8 a 12: stack, testes, Arquitetura Limpa, persistência EF Core, frontend, Docker) e listou `.claude/` (havia `commands/` e `skills/` vazia).
- Criou [`.claude/skills/dotnet-efcore/SKILL.md`](.claude/skills/dotnet-efcore/SKILL.md).
- Corrigiu a linha sobre concorrência otimista no PostgreSQL: usar a coluna de sistema `xmin` como token (`builder.Property<uint>("xmin").IsRowVersion()`), confirmando a API vigente na documentação do Npgsql.

### Claude — resposta

Criei a skill `dotnet-efcore`. Ela ainda não foi usada numa tarefa real, e nada foi commitado. Cobre:

- **Camadas:** Arquitetura Limpa em quatro camadas; Domain e Application sem referência a EF Core, ASP.NET ou Npgsql.
- **C# 14 e .NET 10:** nullable habilitado, records, primary constructors, `CancellationToken` e `async` de ponta a ponta.
- **EF Core 10 Code First:** mapeamento só por `IEntityTypeConfiguration`, consultas com `AsNoTracking` e projeção, novidades do EF 10 (`LeftJoin`, named query filters).
- **Migrations:** comandos `dotnet ef` com os projetos de Infrastructure e Api; nunca editar migration já aplicada.
- **API e testes:** ProblemDetails, OpenAPI nativo, xUnit v3 enxuto (um teste por critério de aceite).
- **Fluxo e checklist:** passo a passo SDD e checklist final.

Observação: os nomes dos projetos (`Palestra.Domain`, `Palestra.Api` etc.) e os caminhos dos comandos `dotnet ef` vieram da estrutura descrita no `CLAUDE.md`; o `backend/Palestra.slnx` não foi conferido.

---

## 2. Usuário

> commit essa skill

### Claude — ações

```bash
git add .claude/skills/dotnet-efcore/SKILL.md
git commit -m "Adiciona skill dotnet-efcore para desenvolvimento C#/.NET 10/EF Core"
```

### Claude — resposta

Commit feito na `main`: `bbb862a`. Só o arquivo da skill entrou, a árvore de trabalho ficou limpa e não houve push.

---

## 3. Usuário

> crie uma skill para desenvolvimento react e vite, nunca use SSR

### Claude — ações

- Criou [`.claude/skills/react-vite/SKILL.md`](.claude/skills/react-vite/SKILL.md).

### Claude — resposta

Criei a skill `react-vite`. Pontos principais:

- **Sem SSR:** a skill abre com a regra "nunca SSR". Proíbe Next.js, Remix, Astro e outros meta-frameworks, `react-dom/server`, `hydrateRoot`, React Server Components, Server Actions e o modo SSR do Vite. O frontend é uma SPA com `createRoot`. Se algo parecer exigir SSR, parar e perguntar, pois mudar isso exige alterar a constituição antes.
- **Stack e regras:** segue a constituição (seções 8, 11 e 12). TypeScript em `strict`, sem `any` injustificado; chamadas à API só em `src/services/`, com os tipos dos contratos do `plan.md`.
- **Vite e Docker:** variáveis com prefixo `VITE_`, URL da API em `VITE_API_URL`, porta 5173, imagem `node:24`; produção serve arquivos estáticos, sem Node em runtime.
- **Testes:** Vitest com React Testing Library, poucos e rápidos, um por critério de aceite, mocks só na camada de serviços.

Observação: a estrutura de pastas e os scripts npm são um padrão assumido, porque o `frontend/` não foi inspecionado; a skill manda confirmar a estrutura real antes de criar arquivos.

---

## 4. Usuário

> faça o commit

### Claude — ações

```bash
git add .claude/skills/react-vite/SKILL.md
git commit -m "Adiciona skill react-vite para desenvolvimento frontend (SPA, sem SSR)"
```

### Claude — resposta

Commit feito na `main`: `53f545d`. Só o arquivo da skill entrou, a árvore de trabalho ficou limpa e não houve push.

---

## 5. Usuário

> exporte essa sessão toda para um arquivo .md

### Claude — ação

Gerou este arquivo (`sessao-skills-dotnet-react.md`, na raiz do repositório). Ele não foi commitado.

---

## Resultado da sessão

| Item | Arquivo | Commit |
|---|---|---|
| Skill C# / .NET 10 / EF Core | `.claude/skills/dotnet-efcore/SKILL.md` | `bbb862a` |
| Skill React / Vite (sem SSR) | `.claude/skills/react-vite/SKILL.md` | `53f545d` |
| Exportação da sessão | `sessao-skills-dotnet-react.md` | não commitado |

### Notas

- Entre os pedidos 4 e 5, o `.claude/CLAUDE.md` foi relido e mudou: os comandos SDD passaram a ser `/especificar`, `/planejar`, `/tarefas` e `/implementar`, e o projeto ganhou a migration `SeedTestUsers` e o serviço smtp4dev. As duas skills criadas aqui descrevem o fluxo SDD de forma genérica (spec, plan, tasks) e não citam os nomes antigos dos comandos, então não precisam de ajuste por causa disso.
- A skill `dotnet-efcore` diz para não usar `Database.Migrate()` escondido sem aprovação do `plan.md`. O `CLAUDE.md` atualizado informa que a API aplica as migrations ao iniciar; vale alinhar essa regra com o `plan.md` da feature.
