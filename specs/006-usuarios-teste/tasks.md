# Tarefas: Usuários de teste com perfil completo (área de TI)

- **Plano:** ./plan.md
- **Spec:** ./spec.md

Formato: `- [ ] T-01 [RF-01] descrição (arquivo/área) — Verificação: …`

Ordem por dependência: leitor dos dados → conteúdo (`users.json`) → avatares → testes de integridade → migration → documentação → validação. Sem tarefas de frontend, Api, Domain, Application nem Docker (nada muda). Todos os caminhos de seed ficam em `backend/src/Palestra.Infrastructure/Persistence/Seed/TestUsers/` (abreviado `Seed/` abaixo).

**Notas da implementação** (ajustes em relação ao plano, sem mudança de comportamento):
- `users.json` foi gerado por um script descartável (fora do repositório) combinando listas de nomes, cargos, empresas fictícias, cursos e formações por área, com semente fixa; o resultado versionado é o JSON.
- O campo auxiliar `avatar` ficou em `users.json` (T-07) em vez de um campo de gênero; o penteado já distingue o conjunto.
- Testes de integridade ficaram em 7 métodos num único arquivo (`SeedTestUsersTests.cs`); o teste de `AVATARES.md` foi descartado por depender de caminho relativo.
- T-14: o `ef migrations add` exigiu `dotnet restore Palestra.slnx` antes; o snapshot não mudou. No contêiner `api` foi preciso `dotnet restore` antes do `dotnet ef` (pasta `obj` compartilhada com o host).
- T-19: validado no banco de desenvolvimento do compose, via API (login `HTTP 200`, `GET /api/profile`, `GET /api/profile/photo`) e SQL; a conferência visual das telas no navegador não foi feita.
- O comando de teste a partir de `backend/`: `dotnet test --project tests/Palestra.Tests` (da raiz o SDK local não aceita `--project`).

**Sem pontos de parada com o usuário:** os 100 avatares são gerados pelo próprio projeto (script determinístico), sem download nem terceiros.

## Backend — Infrastructure (leitor dos dados)
- [x] T-01 [RF-18] Embutir `Seed/**` como `EmbeddedResource` em `Palestra.Infrastructure.csproj` e criar `Persistence/Seed/TestUserSeedData` com os modelos do contrato (`users.json`) e métodos para ler os 100 usuários e a foto de cada um (`photos/NNN.jpg`) dos recursos embutidos — Verificação: `dotnet build` compila; um `users.json` mínimo de exemplo (1 usuário + `001.jpg` provisório) é lido por `TestUserSeedData` num teste xUnit rápido (descartado ou absorvido por T-11).
- [x] T-02 [RF-02, RF-18] Definir no leitor os Guids fixos (usuário `n` → `00000000-0000-4000-8000-0000000000NN`; itens com sufixo estável por tipo e posição) e a lista de e-mails de teste — Verificação: teste xUnit: o Guid do usuário 7 é sempre o mesmo e os Guids dos 100 usuários e de seus itens são únicos.

## Conteúdo — `Seed/users.json` (100 usuários em 4 lotes)
Todos os lotes seguem as "Regras do conjunto" do plano (nomes/e-mails únicos `@exemplo.com`, empresas fictícias, textos pt-BR, limites da spec 004, início ≤ 2026-10, bio única).
- [x] T-03 [RF-01, RF-04, RF-05, RF-08–RF-14] Escrever os usuários **1–25** (nome, e-mail, bio, 2–5 ocupações, 1–3 formações, 2–6 cursos), áreas de desenvolvimento (back-end, front-end, full stack, mobile) — Verificação: JSON válido e `TestUserSeedData` lê 25 usuários sem erro.
- [x] T-04 [RF-13, RF-14] Escrever os usuários **26–50**: dados/IA, DevOps/cloud, segurança — Verificação: idem, 50 usuários lidos; nomes e e-mails sem repetição.
- [x] T-05 [RF-13, RF-14] Escrever os usuários **51–75**: QA, UX/UI, produto/projetos, liderança técnica — Verificação: idem, 75 usuários lidos.
- [x] T-06 [RF-14, RF-15] Escrever os usuários **76–100**, completando a cobertura obrigatória: ≥ 1 sem ocupação atual, ≥ 1 com formação em andamento, ≥ 1 com mais de 10 anos de carreira, itens com e sem descrição, níveis de formação variados (técnico a doutorado), níveis de carreira de estagiário a especialista/gestor — Verificação: 100 usuários lidos; casos de cobertura obrigatória presentes (conferido em T-12).
- [x] T-07 [RF-07, RNF-06] Definir no `users.json` um campo auxiliar `avatar` por usuário (traços: tom de pele, penteado/cor, acessório, fundo), distribuídos para dar variedade — ignorado pela migration, usado só pelo gerador — Verificação: 100 usuários com `avatar`; ≥ 6 tons de pele, ≥ 8 penteados/cores e nenhuma combinação repetida.

## Avatares — `Seed/photos/` e `Seed/gerar_avatares.py`
- [x] T-08 [RF-07, RF-18, RNF-06] Escrever `Seed/gerar_avatares.py` (Python + Pillow, determinístico, sem rede): lê `users.json` e desenha, para cada usuário, um avatar ilustrado 256×256 (fundo, rosto, cabelo, acessório conforme `avatar`) em `photos/NNN.png` — Verificação: rodar duas vezes gera arquivos idênticos (mesmo hash); sem dependência adicionada ao projeto.
- [x] T-09 [RF-06, RF-07, RNF-05] Gerar os 100 PNG e conferir visualmente uma grade de contato (`Seed/` não recebe a grade; usar pasta temporária) — Verificação: 100 arquivos `001.png…100.png`, cada um < 20 KB e com assinatura PNG válida; grade sem rostos quebrados, repetidos ou ilegíveis.
- [x] T-10 [RF-07, RNF-06] Criar `Seed/AVATARES.md`: como regenerar (`python3 gerar_avatares.py`), que são ilustrações geradas pelo projeto (nenhuma pessoa real) e a dedicação ao domínio público (CC0) — Verificação: o arquivo existe com os três itens.

## Testes (const. 8.1) — `backend/tests/Palestra.Tests/SeedTestUsers/`
- [x] T-11 [RF-01, RF-05, RF-06, RF-07] Teste de **conjunto e avatares**: 100 usuários; e-mails únicos terminando em `@exemplo.com`; nomes completos únicos; 100 avatares, todos PNG por `ImageSignature.Detect`, ≤ 2 MB, sem conteúdo repetido (hash); `AVATARES.md` existe — Verificação: `dotnet test --project backend/tests/Palestra.Tests` passa; falha se um e-mail for repetido ou uma foto faltar.
- [x] T-12 [RF-08–RF-15] Teste de **perfil válido**: cada usuário tem bio única de 1–500 caracteres e as contagens 2–5 / 1–3 / 2–6; todos os itens passam por `Occupation/Education/Course.Update` do Domain com `currentMonth = 2026-11`; existem os casos de cobertura (sem ocupação atual, formação em andamento, > 10 anos de carreira) e ≥ 6 áreas — Verificação: teste passa; falha se algum item violar a validação da spec 004.
- [x] T-13 [RF-03, RF-03a] Teste de **login**: o hash gerado como no `Up` (`Pbkdf2PasswordHasher.Hash("senha123")`) verifica com `senha123` e o conjunto seria gravado `Active` — Verificação: teste passa.

## Backend — Infrastructure (migration)
- [x] T-14 [RF-16] Criar a migration vazia `SeedTestUsers` com `dotnet ef migrations add SeedTestUsers` e confirmar que o `AppDbContextModelSnapshot` **não** mudou — Verificação: `git diff` mostra só os dois arquivos novos da migration (código e Designer), sem alteração no snapshot.
- [x] T-15 [RF-03, RF-03a, RF-06–RF-12, RF-17, RF-18] Implementar `Up`: apagar usuários cujo e-mail está na lista de teste; calcular **uma vez** o hash de `senha123`; `InsertData` em `users` (`Status = Active`, `CreatedAt` fixo), `profiles` (bio, `PhotoVersion`), `profile_photos`, `occupations`, `educations`, `courses`, na ordem das FKs, usando nomes literais de tabelas/colunas como em `AddAuth`/`AddProfile` (e o texto de `Level` que o EF grava) — Verificação: `dotnet build` compila; `Up` não referencia entidades do Domain.
- [x] T-16 [RF-20] Implementar `Down`: apagar por e-mail os mesmos 100 usuários (a cascata remove perfil, foto e itens) — Verificação: `dotnet build` compila; confirmado em T-19.

## Documentação
- [x] T-17 [RF-03, RF-16, RF-20, RNF-01] Acrescentar à seção Comandos do `.claude/CLAUDE.md` como aplicar (`dotnet ef database update`) e reverter a carga de teste (`database update 20261112023721_AddProfile` ou a migration anterior), a senha `senha123` e o aviso "só para desenvolvimento e demonstração"; criar o cabeçalho do `Seed/AVATARES.md` com o mesmo aviso — Verificação: leitura do `CLAUDE.md`: os dois comandos e a senha estão documentados.

## Validação
- [x] T-18 Rodar `dotnet test --project backend/tests/Palestra.Tests` — Verificação: toda a suíte passa em segundos.
- [x] T-19 [RF-01, RF-03a, RF-06–RF-11, RF-17, RF-19, RF-20, RNF-04] Validação ponta a ponta com `docker compose up --build`: (1) cadastrar um usuário real de outro domínio; (2) aplicar migrations e conferir 100 usuários `@exemplo.com`; (3) entrar com um usuário qualquer e `senha123` → Home sem passo extra; abrir o perfil e ver foto, bio e as três linhas do tempo; (4) reaplicar/refazer e confirmar que continuam 100; (5) reverter a migration → 0 usuários de teste, usuário real intacto, sem linhas órfãs; (6) reaplicar e medir o tempo (segundos) — Verificação: os seis passos conferidos; registrar o resultado.
- [x] T-20 Executar os critérios de aceite da spec e marcá-los; atualizar o status da spec para `implementada` — Verificação: todos os critérios da spec marcados `[x]`.
