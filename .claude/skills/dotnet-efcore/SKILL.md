---
name: dotnet-efcore
description: Especialista em C# / .NET 10 / ASP.NET Core / EF Core 10 (Code First, PostgreSQL) seguindo a Arquitetura Limpa do projeto. Use ao escrever ou revisar código backend, entidades, DbContext, mapeamentos, migrations, repositórios, casos de uso, endpoints e testes xUnit.
---

# Skill: C# · .NET 10 · EF Core 10

Você é especialista em C# 14, .NET 10 (LTS), ASP.NET Core e EF Core 10 com Npgsql/PostgreSQL 18. Antes de codar, leia a constituição (seções 8–10) e a `spec.md`/`plan.md` da feature. **Sem spec aprovada, não escreva código.**

## Estrutura (Arquitetura Limpa)
```
backend/src/
  Palestra.Domain/          # entidades, value objects, regras. Sem dependências
  Palestra.Application/     # casos de uso, DTOs, interfaces. Depende só de Domain
  Palestra.Infrastructure/  # DbContext, configurations, repositórios, migrations
  Palestra.Api/             # endpoints, DI, config. Camada mais externa
backend/tests/Palestra.Tests
```
- Domain/Application **nunca** referenciam EF Core, ASP.NET ou Npgsql.
- Endpoints só delegam a casos de uso; zero regra de negócio.
- Confirme os nomes reais dos projetos em `backend/Palestra.slnx` antes de criar arquivos.

## C# 14 / .NET 10 — estilo
- `<Nullable>enable</Nullable>`, `<ImplicitUsings>enable</ImplicitUsings>`, `<TreatWarningsAsErrors>true</TreatWarningsAsErrors>`.
- Namespaces *file-scoped*; `record` para DTOs/value objects; *primary constructors* para injeção de dependência; *collection expressions* (`[]`).
- `required` e `init` para invariantes; construtores/métodos de fábrica no Domain garantem estado válido (setters `private`).
- `async`/`await` ponta a ponta, sempre com `CancellationToken`; sufixo `Async`; nunca `.Result`/`.Wait()`.
- Erros esperados de negócio: exceção de domínio específica ou resultado tipado; nunca `catch (Exception)` genérico engolindo erro.
- Sem pacotes pré-release; versões estáveis (constituição seção 8).

## EF Core 10 — Code First
- Modelo C# é a fonte da verdade. **Nunca** SQL manual de esquema: toda mudança vira migration.
- Mapeamento **somente** via `IEntityTypeConfiguration<T>` em `Infrastructure/Persistence/Configurations/`; sem Data Annotations no Domain.
- `ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly)` no `OnModelCreating`.
- Configure explicitamente: chave, `HasMaxLength`, `IsRequired`, índices/únicos, precisão de `decimal` (`HasPrecision`), `HasConversion` para value objects/enums (preferir string para enums).
- Convenções PostgreSQL: `UseNpgsql`; nomes em snake_case apenas se o `plan.md` pedir.
- Registro: `AddDbContext<AppDbContext>(o => o.UseNpgsql(connectionString))`; connection string vem de variável de ambiente, nunca hardcoded.

### Consultas
- Leitura: `AsNoTracking()` e **projeção** (`Select` para DTO) em vez de carregar a entidade inteira.
- Evite N+1: use `Include`/projeção; `AsSplitQuery()` para coleções grandes.
- Nunca `ToList()` antes de filtrar; filtros e paginação (`Skip/Take` com `OrderBy` estável) no banco.
- Use `ExecuteUpdateAsync`/`ExecuteDeleteAsync` para operações em lote.
- Novidades do EF 10 a considerar: `LeftJoin`/`RightJoin` em LINQ, *named query filters* (múltiplos filtros globais nomeados, ex.: soft delete) e `ComplexProperty` (value objects/JSON) em vez de owned types quando fizer sentido.
- Concorrência otimista, quando a spec exigir: no PostgreSQL use a coluna de sistema `xmin` como token (`builder.Property<uint>("xmin").IsRowVersion()`); confirme a API vigente na documentação do Npgsql.

### Repositórios e Unit of Work
- Interfaces em **Application**; implementações em **Infrastructure**.
- `DbContext` é scoped; nunca compartilhe entre threads nem guarde em singleton.
- `SaveChangesAsync` uma vez por caso de uso.

## Migrations
```bash
# a partir da raiz do repositório
dotnet ef migrations add <NomeDaMigration> \
  --project backend/src/Palestra.Infrastructure \
  --startup-project backend/src/Palestra.Api
dotnet ef migrations script --idempotent \
  --project backend/src/Palestra.Infrastructure \
  --startup-project backend/src/Palestra.Api
```
- Nome descritivo em PascalCase (`AdicionarTabelaPalestrantes`). Revise o arquivo gerado antes de commitar.
- Nunca edite migration já aplicada; crie outra. Nunca apague `*ModelSnapshot.cs` à mão.
- Migrations aplicadas de forma **explícita e documentada** (constituição seção 12): não use `Database.Migrate()` escondido sem aprovação do `plan.md`.
- Mudança de esquema → migration no mesmo commit da mudança de modelo.

## API (ASP.NET Core)
- Minimal APIs agrupadas por feature (`MapGroup`) ou controllers finos, conforme o `plan.md`.
- Contratos (rotas, DTOs, status codes) exatamente como no `plan.md`; mudou? Atualize a spec/plan primeiro.
- Validação na borda; erros no formato `ProblemDetails` (`AddProblemDetails`, `IExceptionHandler`).
- OpenAPI nativo do .NET 10 (`AddOpenApi`/`MapOpenApi`); health check em `GET /health`.
- Configuração via `IOptions<T>` + variáveis de ambiente; segredos só no `.env`.

## Testes (xUnit v3) — constituição 8.1
- Poucos, rápidos, **um por critério de aceite** (caminho feliz + no máximo um erro relevante).
- Sem mocks elaborados; prefira dados simples. Para persistência, use `UseInMemoryDatabase` ou SQLite em memória só se o `plan.md` aceitar; evite testar o framework.
- Um assert principal, nome descritivo (`Deve_rejeitar_inscricao_duplicada`), poucas linhas.
- Rodar: `dotnet test --project backend/tests/Palestra.Tests`.

## Fluxo de trabalho
1. Ler `CONSTITUTION.md` e `specs/NNN-nome/{spec,plan,tasks}.md`.
2. Implementar a tarefa atual, referenciando o `RF-xx` correspondente.
3. Rodar `dotnet build` e `dotnet test --project backend/tests/Palestra.Tests`.
4. Se houve mudança de modelo: gerar migration e revisar.
5. Marcar a tarefa como concluída em `tasks.md`.

## Checklist antes de finalizar
- [ ] Dependências de camada respeitadas (Domain/Application sem EF/ASP.NET).
- [ ] Mapeamento em `IEntityTypeConfiguration`, sem annotations no Domain.
- [ ] Migration gerada e revisada, se o esquema mudou.
- [ ] Consultas de leitura com `AsNoTracking`/projeção; `CancellationToken` propagado.
- [ ] Teste por critério de aceite, suíte rápida e verde.
- [ ] Nada quebra `docker compose up`.
- [ ] Dúvidas da spec seguem como `[NEEDS CLARIFICATION]`, não resolvidas por suposição.
