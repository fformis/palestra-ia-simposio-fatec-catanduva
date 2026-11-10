# Constituição do Projeto

Princípios que valem para todas as features. Mudanças aqui exigem justificativa registrada.

## 1. Spec primeiro
Nenhuma implementação começa sem `spec.md` revisada. A spec descreve *o quê* e *por quê*, nunca *como*.

## 2. Simplicidade
Escolha a solução mais simples que atenda à spec. Sem abstrações, camadas ou dependências "para o futuro".

## 3. Verificabilidade
Todo requisito tem critério de aceite testável. Tarefa sem forma de verificação não está pronta para ser feita.

## 4. Separação de responsabilidades
`backend/` e `frontend/` evoluem de forma independente, integrados apenas por contratos explícitos.

## 5. Rastreabilidade
Spec → plano → tarefa → código/teste. Cada elo referencia o anterior.

## 6. Segurança e privacidade
Sem segredos no repositório. Dados pessoais só com necessidade declarada na spec.

## 7. Decisões abertas
Ambiguidades são marcadas e resolvidas com o responsável antes de seguir — não adivinhadas.

## 8. Stack oficial
| Camada | Tecnologia | Versão |
|---|---|---|
| Backend | C#, ASP.NET Core Web API, Entity Framework Core | .NET 10 (LTS) · EF Core 10 |
| Frontend | React com TypeScript (Vite) | Node.js 24 (LTS) · TypeScript estável mais recente |
| Banco de dados | PostgreSQL | 18 (major suportada mais recente; o PostgreSQL não possui LTS) |
| Testes backend | xUnit | v3 |
| Testes frontend | Vitest (+ React Testing Library) | estável mais recente |
| Infraestrutura | Docker / Docker Compose (execução local) | — |

Versões fixadas por tag de imagem Docker (`mcr.microsoft.com/dotnet/*:10.0`, `node:24`, `postgres:18`), nunca `latest`.
Dependências (NuGet/npm) sempre na versão estável, sem pré-releases.

Trocar qualquer item exige alterar esta constituição antes.

## 8.1 Testes (contexto de demonstração ao vivo)
O projeto é construído ao vivo em uma palestra: os testes precisam ser **concisos e rápidos**.
- Poucos testes, de alto valor: um por critério de aceite da spec, cobrindo o caminho feliz e no máximo um caso de erro relevante.
- Sem testes de getters, DTOs, mapeamentos triviais ou código de framework.
- Sem mocks elaborados: preferir dados simples e, quando possível, repositório em memória.
- Cada teste curto (poucas linhas), nome descritivo e um único assert principal.
- A suíte completa deve rodar em segundos.

## 9. Arquitetura do backend (Arquitetura Limpa)
Camadas em `backend/src/`, com dependências apontando sempre para dentro:
- **Domain** — entidades, value objects, regras de negócio. Não depende de nada.
- **Application** — casos de uso, DTOs, interfaces (repositórios, serviços). Depende só de Domain.
- **Infrastructure** — EF Core, DbContext, repositórios, migrations, integrações. Implementa as interfaces de Application.
- **Api** — controllers/endpoints, configuração e injeção de dependência. Camada mais externa.

Regras:
- Domain e Application não referenciam EF Core, ASP.NET nem Npgsql.
- Controllers não contêm regra de negócio; apenas delegam a casos de uso.
- Testes em `backend/tests/` com xUnit, espelhando as camadas (unitários para Domain/Application, integração para Infrastructure/Api).

## 10. Persistência (EF Core Code First)
- O modelo C# é a fonte da verdade do esquema; o banco nunca é alterado manualmente.
- Toda mudança de esquema gera uma migration versionada em `Infrastructure`.
- Configuração de mapeamento via `IEntityTypeConfiguration`, não por anotações no Domain.

## 11. Frontend
- React + TypeScript com `strict` habilitado; proibido `any` sem justificativa.
- Testes com Vitest, arquivos `*.test.ts(x)` ao lado do código testado.
- Chamadas à API isoladas em uma camada de serviços/cliente, tipadas conforme os contratos do `plan.md`.

## 12. Ambiente Docker
- A solução inteira (api, frontend, postgres) sobe com um único `docker compose up` na raiz.
- Nenhum pré-requisito local além do Docker.
- Configuração por variáveis de ambiente; segredos em `.env` (ignorado pelo git), com `.env.example` versionado.
- Dados do PostgreSQL em volume nomeado; migrations aplicadas de forma explícita e documentada.
