# Plano: Usuários de teste com perfil completo (área de TI)

- **Spec:** ./spec.md (006-usuarios-teste, sem `[NEEDS CLARIFICATION]`; imagens: 100 avatares ilustrados gerados por script, ver "Riscos")

Feature **somente backend/dados**: uma migration EF Core que insere 100 usuários de teste com perfil completo, mais os arquivos de dados e fotos versionados no repositório. Sem endpoints, sem frontend, sem mudança de Docker. As telas existentes (login, perfil) já exibem esses dados.

## Decisões técnicas
| Decisão | Escolha | Justificativa | Requisitos |
|---|---|---|---|
| Mecanismo da carga | Uma migration `SeedTestUsers` em `Infrastructure/Persistence/Migrations`, que só insere dados (sem alterar esquema) | Decisão da spec; sobe com `dotnet ef database update`, o mesmo comando já documentado | RF-16, RNF-03 |
| Fonte dos dados | Arquivos versionados e **embutidos como recurso** no assembly da Infrastructure: `Persistence/Seed/TestUsers/users.json` e `photos/001.png … 100.png` | Determinístico, revisável no diff, sem acesso à rede nem a pasta externa na hora de aplicar (funciona dentro do contêiner `api`) | RF-18 |
| Independência do modelo | A migration usa nomes literais de tabelas/colunas (como em `AddAuth`/`AddProfile`) e **não** referencia entidades do Domain | Migration é histórica: não pode quebrar se as entidades mudarem depois | RF-16 |
| Inserção | `migrationBuilder.InsertData` por tabela (`users`, `profiles`, `profile_photos`, `occupations`, `educations`, `courses`), em lote, na ordem das FKs | API nativa de migration; sem SQL manual (CLAUDE.md), uma transação | RF-06–RF-11 |
| Ids | **Guids fixos**, derivados do número do usuário (ex.: `00000000-0000-4000-8000-0000000000NN` para o usuário NN; itens com sufixo estável) e gravados no `users.json` | Mesmo conjunto sempre; `Down` sabe exatamente o que remover | RF-17, RF-18, RF-20 |
| Senha | Um único hash de `senha123` calculado **uma vez** no `Up` com o `Pbkdf2PasswordHasher` existente (mesmo formato do login) e repetido nos 100 usuários; `Status = Active` | Login funciona sem passo extra (RF-03a); 1 cálculo PBKDF2 mantém a carga em segundos; sem hash fixo no repositório | RF-03, RF-03a, RNF-04 |
| Não duplicar | Antes de inserir, o `Up` **apaga** usuários cujo e-mail esteja na lista de teste (cascata remove perfil, foto e itens) e depois insere o conjunto. A migration roda uma vez pelo controle `__EFMigrationsHistory` | Cobre e-mail já existente (RF-17) sem `ON CONFLICT` nem SQL manual; só atinge e-mails `@exemplo.com` da lista | RF-17, RF-19 |
| Remoção | `Down` apaga por e-mail os mesmos 100 usuários (cascata limpa o resto) | Reverter a migration = remover o conjunto | RF-20 |
| Datas | Datas absolutas no `users.json` (`AAAA-MM`, gravadas como dia 1), todas com **início ≤ 2026-10**; `CreatedAt` fixo | Nunca no futuro na data de aplicação (hoje ≥ 2026-11-15); resultado reproduzível | RF-12, RF-18 |
| Geração do conteúdo | O `users.json` é escrito **uma vez** (por Claude, com script descartável fora do repositório) e revisado; um teste confere o conjunto (ver Verificação). Só o gerador de avatares é versionado | O dado é o que importa versionar | RF-05, RF-08–RF-15 |
| Avatares: formato | **PNG 256×256**, ~3–10 KB cada (≈ 0,6 MB no total); a spec 004 aceita PNG e a `ImageSignature` o reconhece | Bem abaixo dos 2 MB; repositório leve | RF-06, RNF-05 |
| Fotos: gravação | Mesma tabela `profile_photos` (`bytea`) e `profiles.PhotoVersion` = `CreatedAt` fixo | Exatamente como o upload da spec 004 grava; o perfil já serve a imagem | RF-06 |
| Avatares: origem | **Gerados por um script versionado** (`Seed/TestUsers/gerar_avatares.py`, Python + Pillow, **sem dependência no projeto**): ilustração vetorial simples (fundo, rosto, cabelo, acessório) com combinação **determinística** derivada do número do usuário (`n`) e de uma semente fixa; dedicados ao domínio público (CC0) em `AVATARES.md`  | Sem terceiros, sem licença a verificar, sem ação do usuário; reprodutível | RF-07, RF-18, RNF-06 |
| Resumo da carga | `Up` não usa o `IClock` nem o DI: lê recursos, monta as linhas e insere | Migration não tem container de DI | RNF-04 |
| Testes | 1 teste de integridade do conjunto (`users.json` + fotos, sem banco) e 1 de login com `senha123`; verificação ponta a ponta manual | Const. 8.1; migration em si é verificada aplicando-a | todos |

## Arquitetura
```
Infrastructure/Persistence/
  Migrations/<timestamp>_SeedTestUsers.cs      Up: apaga por e-mail → InsertData ×6   Down: apaga por e-mail
  Seed/TestUsers/
    users.json            100 usuários + perfil + ocupações + formações + cursos
    photos/001.png…100.png
    AVATARES.md           como os avatares são gerados e dedicação ao domínio público (CC0)
    gerar_avatares.py     gerador determinístico (Pillow); roda fora do build
  Seed/TestUserSeedData.cs   lê os recursos embutidos e devolve as linhas (usado pela migration e pelo teste)
```
Fluxo: `docker compose exec api dotnet ef database update …` → EF aplica `SeedTestUsers` → 100 usuários prontos. Frontend e API não mudam: login (spec 003) e perfil (spec 004) leem as mesmas tabelas.

## Contratos
Nenhum endpoint, payload ou evento novo.

**Formato do `users.json`** (contrato entre os dados e a migration):
```jsonc
{
  "users": [
    {
      "n": 1,                              // 1..100; define o Guid fixo e o nome da foto (photos/001.png)
      "firstName": "Marina", "lastName": "Albuquerque",
      "email": "marina.albuquerque@exemplo.com",
      "bio": "…até 500 caracteres…",
      "occupations": [ { "title": "…", "company": "…", "start": "2022-03", "end": null, "description": "…" } ],
      "educations":  [ { "institution": "…", "course": "…", "level": "superior", "start": "2015-02", "end": "2018-12", "description": null } ],
      "courses":     [ { "name": "…", "institution": "…", "hours": 40, "start": "2023-05", "end": "2023-06" } ]
    }
  ]
}
```
Níveis usam os códigos da spec 004 (`fundamental` … `doutorado`), gravados na migration como o texto que o EF usa para `EducationLevel` (confirmar no `AddProfile`).

**Configuração:** nenhuma nova. A senha e o domínio ficam como constantes na migration/dados, documentados como de teste.

## Impacto por camada (backend)
- **Domain:** nenhum.
- **Application:** nenhum.
- **Infrastructure:** migration `SeedTestUsers`; `TestUserSeedData` (leitura dos recursos); `Palestra.Infrastructure.csproj` ganha `EmbeddedResource` para `Persistence/Seed/TestUsers/**`.
- **Api:** nenhum.

## Frontend
Nenhuma mudança.

## Modelo de dados (EF Core Code First)
Sem mudança de esquema: o `AppDbContextModelSnapshot` não é alterado e a migration tem apenas dados (`Up`/`Down` só de `InsertData`/`DeleteData`). Se o `dotnet ef migrations add` gerar alteração de snapshot, algo foi alterado por engano.

Conteúdo inserido (por usuário): 1 `users`, 1 `profiles`, 1 `profile_photos`, 2–5 `occupations`, 1–3 `educations`, 2–6 `courses`. Total aproximado: 100 / 100 / 100 / ~350 / ~200 / ~400 linhas.

### Regras do conjunto (para quem escrever o `users.json`)
- 100 nomes completos e e-mails únicos (`nome.sobrenome@exemplo.com`, sem acento, minúsculos); sem repetição de nome + sobrenome.
- ≥ 6 áreas distintas (back-end, front-end, full stack, mobile, dados/IA, DevOps/cloud, segurança, QA, UX/UI, produto/projetos, liderança técnica); níveis de estagiário a especialista/gestor (RF-14).
- Cobertura obrigatória (RF-15): ≥ 1 sem ocupação atual, ≥ 1 com formação em andamento, ≥ 1 com mais de 10 anos de carreira, itens com e sem descrição; ≥ 70% com ocupação atual.
- Empresas **fictícias**; instituições de ensino reais só como formação genérica, sem descrição que atribua fatos específicos a elas.
- Textos em pt-BR, bio **única** por usuário, tudo dentro dos limites da spec 004 (150/1000/500 caracteres, horas 1–99.999).
- Ocupações sem sobreposição absurda e coerentes com a formação (início da carreira depois de cerca de 16 anos de idade implícita; sem datas no futuro).

## Docker
Sem mudança em `docker-compose.yml` nem `.env`. Para aplicar: o comando de migrations já documentado no `CLAUDE.md`. Para remover: `docker compose exec api dotnet ef database update <migration anterior> --project src/Palestra.Infrastructure --startup-project src/Palestra.Api`. Ambos serão acrescentados ao `CLAUDE.md` (seção Comandos) junto com `senha123`.

## Estratégia de verificação (const. 8.1)
Backend — `backend/tests/Palestra.Tests/SeedTestUsers/` (sem banco, sobre `TestUserSeedData`):
| Critério de aceite | Verificação |
|---|---|
| RF-01/RF-05 | o conjunto tem 100 usuários; e-mails únicos e terminam em `@exemplo.com`; nomes completos únicos |
| RF-06/RF-07 | existem 100 avatares, todos `ImageSignature.Detect` = PNG, ≤ 2 MB, e **sem dois com o mesmo conteúdo** (hash); `AVATARES.md` existe e declara CC0 |
| RF-08–RF-12 | cada usuário respeita contagens (2–5 / 1–3 / 2–6), bio ≤ 500 e não vazia/única, e todos os itens passam por `Occupation/Education/Course.Update` do Domain com `currentMonth = 2026-11` (a própria validação da spec 004) |
| RF-13–RF-15 | níveis válidos; casos de cobertura obrigatória (sem atual, em andamento, > 10 anos) presentes |
| RF-03/RF-03a | login com `senha123`: hash gerado como na migration verifica com `Pbkdf2PasswordHasher` e o usuário seria `Active` |

Manual (aplicação da migration, não automatizável rápido):
1. `docker compose up --build` → aplicar migrations → `SELECT count(*)` de `users` com `@exemplo.com` = 100 (RF-01).
2. Entrar com um usuário qualquer e `senha123` → Home sem passo extra (RF-03a); abrir o perfil: foto, bio e as três linhas do tempo (RF-06–RF-11).
3. Reaplicar/ rodar de novo → continua 100 (RF-17); criar um usuário real de outro domínio antes → intacto depois (RF-19).
4. Reverter a migration → 0 usuários de teste, usuário real intacto, sem linhas órfãs (RF-20).
5. Conferir `AVATARES.md` e o tempo da aplicação (segundos, RNF-04).

Comandos: `dotnet test --project backend/tests/Palestra.Tests`.

## Verificação da constituição
- [x] Spec primeiro (spec 006 escrita e decidida antes do plano)
- [x] Simplicidade (uma migration + arquivos de dados; gerador do avatar versionado como script isolado, sem endpoint, sem dependência nova)
- [x] Verificabilidade (testes de integridade do conjunto; resto por passos manuais objetivos)
- [x] Dependências da Arquitetura Limpa respeitadas (tudo em Infrastructure; Domain só é usado no teste para validar os dados com as regras reais)
- [x] Roda via docker compose (mesmo comando de migrations)
- [x] Segurança e privacidade (§6): dados fictícios, domínio reservado, senha pública só para teste; avatares ilustrados gerados pelo projeto (nenhuma foto de pessoa); migration alerta em `AVATARES.md`/`CLAUDE.md` que é só para desenvolvimento
- [x] Migration versionada (§10) e banco nunca alterado manualmente

## Riscos
- **Gerador depende de Python + Pillow:** só é necessário para regenerar os avatares; o build, o Docker e os testes usam os PNG já versionados. Se o script for perdido, os PNG continuam válidos.
- **Variedade e qualidade visual:** avatares simples podem parecer repetitivos; o gerador combina ≥ 6 tons de pele, ≥ 8 penteados/cores de cabelo, acessórios (óculos, barba, boné, fone) e fundos de uma paleta fixa, e a conferência visual de uma grade de contato é parte da validação.
- **Tamanho do repositório e da migration:** ~0,6 MB de avatares embutidos aumentam o assembly e o histórico git; aceito (RNF-05). Desprezível.
- **Apagar por e-mail:** se alguém tiver cadastrado manualmente um e-mail `@exemplo.com` igual a um da lista, ele é removido ao aplicar. Aceito: o domínio é reservado a testes; documentar.
- **Hash recalculado por aplicação:** cada ambiente tem salt diferente (não há hash fixo no repositório); sem impacto no login.
- **Reverter só funciona se o banco ainda tem os ids/e-mails:** `Down` apaga por e-mail; se o usuário de teste tiver mudado o e-mail (a spec 004 não permite), sobraria registro. Não aplicável hoje.
- **Migration de dados e EF Tools:** `dotnet ef migrations add` não deve gerar mudança de snapshot; a migration será criada vazia e preenchida à mão (só dados).
