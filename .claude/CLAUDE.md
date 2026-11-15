# Projeto: Palestra IA — Simpósio FATEC Catanduva

Projeto desenvolvido com **Spec-Driven Development (SDD)**: a especificação é a fonte da verdade; o código é consequência dela.

## Leitura obrigatória
1. [CONSTITUTION.md](./CONSTITUTION.md) — princípios inegociáveis do projeto.
2. A pasta da feature em `specs/NNN-nome/` antes de qualquer alteração de código.

## Estrutura do repositório
```
.claude/
  CLAUDE.md          # este arquivo
  CONSTITUTION.md    # princípios e restrições
  commands/          # comandos do fluxo SDD (/especificar, /planejar, /tarefas, /implementar)
  skills/            # skills específicas do projeto
specs/
  _templates/        # templates de spec, plan e tasks
  NNN-nome/          # uma pasta por feature
    spec.md          # O QUÊ e POR QUÊ (sem decisões técnicas)
    plan.md          # COMO (arquitetura, stack, contratos)
    tasks.md         # passos pequenos, ordenados e verificáveis
backend/
  src/               # Domain, Application, Infrastructure, Api (Arquitetura Limpa)
  tests/
frontend/            # React + TypeScript
docker-compose.yml   # api + frontend + postgres
```

## Stack
C# .NET 10 / ASP.NET Core / EF Core (Code First) · Arquitetura Limpa · xUnit · React + TypeScript (Node 24) · Vitest · PostgreSQL 18 · tudo em Docker local. Detalhes e regras na constituição (seções 8–12).

## Comandos
```bash
cp .env.example .env && docker compose up --build   # sobe tudo: web :5173 · api :8080 · postgres :5432 · e-mails de teste (smtp4dev) :3100
dotnet test --project backend/tests/Palestra.Tests  # testes backend (xUnit v3)
cd frontend && npm test                             # testes frontend (Vitest)
docker compose exec api dotnet ef database update --project src/Palestra.Infrastructure --startup-project src/Palestra.Api   # aplica migrations (tool em backend/dotnet-tools.json)
```
**Usuários de teste (spec 006):** a migration `SeedTestUsers` cria 100 usuários de TI com perfil completo (`nome.sobrenome@exemplo.com`, senha `senha123`, contas ativas; **só para desenvolvimento e demonstração**). Vem junto do `database update` acima; para removê-los (sem afetar outros usuários), reverta a migration:
```bash
docker compose exec api dotnet ef database update 20261112023721_AddProfile --project src/Palestra.Infrastructure --startup-project src/Palestra.Api
```
Os avatares ilustrados (CC0) são gerados por `backend/src/Palestra.Infrastructure/Persistence/Seed/TestUsers/gerar_avatares.py`; ver `AVATARES.md` na mesma pasta.

Solution: `backend/Palestra.slnx` (Domain, Application, Infrastructure, Api + Palestra.Tests). Health check: `GET /health`.

## Fluxo SDD
1. **Specify** — `/especificar <descrição>` cria `specs/NNN-nome/spec.md` (requisitos, histórias, critérios de aceite).
2. **Plan** — `/planejar` gera `plan.md` respeitando a constituição.
3. **Tasks** — `/tarefas` quebra o plano em `tasks.md`.
4. **Implement** — `/implementar` executa as tarefas, marcando-as como concluídas.

## Regras de trabalho
- Não escrever código sem spec aprovada. Mudou o comportamento? Atualize a spec primeiro.
- Dúvidas na spec ficam marcadas como `[NEEDS CLARIFICATION]`; não as resolva por suposição.
- Cada tarefa referencia o requisito (`RF-xx`) que atende.
- Mudanças de esquema do banco = migration EF Core, nunca SQL manual.
- Testes concisos (demo ao vivo): poucos, um por critério de aceite, sem mocks elaborados (constituição 8.1).
- Tudo deve rodar com `docker compose up`.
- Backend e frontend só se comunicam pelos contratos descritos no `plan.md`.
- Respostas e documentação em português do Brasil.
