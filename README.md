# 33° - Simpósio de Tecnologia da FATEC Catanduva

## Palestra: Do Prompt ao SDD

Projeto de demonstração da palestra sobre **IA no desenvolvimento de software** no Simpósio da FATEC Catanduva. A ideia é mostrar, ao vivo, como construir uma aplicação completa com um assistente de IA seguindo **Spec-Driven Development (SDD)**: a **especificação é a fonte da verdade** e o código é consequência dela.

## A ideia

Em vez de pedir código direto à IA, o fluxo é:

1. **Especificar** (`/especificar`) — descreve *o quê* e *por quê* (requisitos, histórias, critérios de aceite), sem decisões técnicas.
2. **Planejar** (`/planejar`) — define *como* (arquitetura, stack, contratos), respeitando a constituição.
3. **Tarefas** (`/tarefas`) — quebra o plano em passos pequenos, ordenados e verificáveis.
4. **Implementar** (`/implementar`) — executa as tarefas, marcando-as como concluídas.

Cada elo referencia o anterior (spec → plano → tarefa → código/teste). Os comandos ficam em [`.claude/commands`](.claude/commands) e os princípios inegociáveis em [`.claude/CONSTITUTION.md`](.claude/CONSTITUTION.md).

### O que a aplicação faz

Uma rede de perfis profissionais, construída feature a feature (cada uma tem sua pasta em [`specs/`](specs)):

| Spec | Feature |
|---|---|
| 002 | Design system (tema claro/escuro) e menu lateral |
| 003 | Login, registro e recuperação de senha (senha criada por link enviado por e-mail) |
| 004 | Perfil profissional em linha do tempo (foto, bio, ocupações, formações, cursos) |
| 005 | Ajuste do controle de recolher o menu |
| 006 | 100 usuários de teste da área de TI, com perfil completo |
| 007 | Foto do perfil no avatar do menu |

## Stack

C# .NET 10 · ASP.NET Core · EF Core (Code First) · Arquitetura Limpa · xUnit · React + TypeScript (Vite, Node 24) · Vitest · PostgreSQL 18 · Docker Compose.

## Estrutura

```
.claude/     # CLAUDE.md, constituição, comandos e skills do fluxo SDD
specs/       # uma pasta por feature: spec.md, plan.md, tasks.md
backend/     # Domain, Application, Infrastructure, Api + tests
frontend/    # React + TypeScript
docker-compose.yml
```

## Como executar

### Pré-requisitos

- [Docker](https://www.docker.com/) com Docker Compose (é só o que precisa para rodar a aplicação)
- Opcional, para rodar testes fora do Docker: .NET 10 SDK e Node 24

### Passo a passo

1. **Clone o repositório**

   ```bash
   git clone <url-do-repositorio>
   cd palestra-ia-simposio-fatec-catanduva
   ```

2. **Crie o arquivo de ambiente**

   ```bash
   cp .env.example .env
   ```

3. **Suba tudo**

   ```bash
   docker compose up --build
   ```

   A API aplica as migrations (inclusive a dos usuários de teste) automaticamente ao iniciar.

4. **Acesse**

   | Serviço | URL |
   |---|---|
   | Aplicação web | http://localhost:5173 |
   | API | http://localhost:8080 (health check: `/health`) |
   | Caixa de e-mails de teste (smtp4dev) | http://localhost:3100 |
   | PostgreSQL | `localhost:5432` |

5. **Entre no sistema**

   - Use um usuário de teste: e-mail no formato `nome.sobrenome@exemplo.com` (escolha um nome de TI qualquer, consulte o banco para ver a lista) e senha `senha123`.
   - Ou crie uma conta na tela de registro: o link para definir a senha chega na caixa do smtp4dev (http://localhost:3100), pois nenhum e-mail real é enviado.

> ⚠️ Os 100 usuários de teste são **somente para desenvolvimento e demonstração**.

### Testes

```bash
dotnet test --project backend/tests/Palestra.Tests   # backend (xUnit v3)
cd frontend && npm test                              # frontend (Vitest)
```

### Operações úteis

Aplicar migrations manualmente (normalmente desnecessário):

```bash
docker compose exec api dotnet ef database update --project src/Palestra.Infrastructure --startup-project src/Palestra.Api
```

Remover os usuários de teste (sem afetar os demais), revertendo a migration:

```bash
docker compose exec api dotnet ef database update 20261112023721_AddProfile --project src/Palestra.Infrastructure --startup-project src/Palestra.Api
```

Zerar tudo, inclusive o banco:

```bash
docker compose down -v
```

## Contribuindo

Não escreva código sem spec aprovada. Mudou o comportamento? Atualize a spec primeiro. Leia a [constituição](.claude/CONSTITUTION.md) e o [CLAUDE.md](.claude/CLAUDE.md) antes de começar. Mudanças de esquema do banco são sempre migrations EF Core.

## Licença

[MIT](LICENSE) © 2026 Flávio José Formis
