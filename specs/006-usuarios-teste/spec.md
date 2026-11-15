# Spec: Usuários de teste com perfil completo (área de TI)

- **ID:** 006-usuarios-teste
- **Status:** implementada
- **Data:** 2026-11-15

## Contexto e objetivo
Com login/registro (spec 003) e perfil profissional (spec 004) prontos, o sistema só tem sentido quando há **gente nele**. Para a demonstração ao vivo da palestra, e para validar telas, linhas do tempo e futuras features (busca, listagens, visualização de perfis), é preciso um **conjunto de dados de teste realista**, disponível em segundos, sem cadastro manual.

Esta feature entrega **100 usuários fictícios**, todos profissionais da **área de TI**, cada um com **perfil completo**: imagem de perfil, bio, ocupações, formações e cursos coerentes com a carreira.

Público: quem apresenta, desenvolve e testa o projeto.

## Histórias de usuário
- Como apresentador, quero um ambiente já populado com 100 usuários, para demonstrar o sistema sem perder tempo cadastrando dados.
- Como desenvolvedor/testador, quero poder entrar com qualquer um desses usuários, para ver o perfil de cada um na prática.
- Como desenvolvedor/testador, quero perfis variados (cargos, trajetórias, níveis de carreira, com e sem item "atual"), para exercitar a linha do tempo em situações diferentes.
- Como desenvolvedor, quero recriar esses dados quando necessário sem duplicá-los, para manter o ambiente limpo.

## Requisitos funcionais

### Conjunto de usuários
- **RF-01 — Quantidade:** o conjunto contém exatamente **100 usuários** distintos.
- **RF-02 — Identificação (spec 003):** cada usuário tem nome, sobrenome, e-mail único e senha válidos segundo as regras da spec 003, e consegue **entrar no sistema** normalmente.
- **RF-03 — Credencial conhecida:** todos compartilham a mesma senha de teste, `senha123` (atende à política da spec 003, RF-18), documentada para uso em desenvolvimento e demonstração.
- **RF-03a — Conta ativa:** todos os usuários nascem com conta **ativa** (spec 003, RF-10), já com senha definida, sem e-mail pendente nem passo extra: podem entrar imediatamente.
- **RF-04 — Dados fictícios e marcados:** nomes e e-mails são **fictícios**, em português do Brasil, e usam o domínio **`exemplo.com`** (reservado a testes), de modo que nenhum e-mail real seja afetado e os usuários de teste sejam facilmente reconhecíveis.
- **RF-05 — Diversidade:** nomes e sobrenomes variados e plausíveis, sem repetição de pessoa (nome + sobrenome) nem de e-mail.

### Perfil completo (spec 004)
- **RF-06 — Foto:** todo usuário tem **imagem de perfil** (avatar) válida segundo a spec 004 (RF-05: JPG/PNG/WebP, até 2 MB), exibida no perfil e no menu. Nenhum usuário fica com avatar de iniciais.
- **RF-07 — Avatares ilustrados e distintos:** as 100 imagens são **avatares ilustrados** (personagens estilizados, não fotografias), **diferentes entre si**, gerados pelo próprio projeto, e portanto **não retratam nenhuma pessoa real**. Variam em cor de pele, cabelo, acessórios e fundo, de modo plausível e inclusivo, e seguem um mesmo estilo visual. Cada imagem é gerada de forma **determinística** (mesmo resultado a cada geração) e dedicada ao domínio público, sem depender de terceiros.
- **RF-08 — Bio:** todo usuário tem bio preenchida, **única**, dentro do limite de 500 caracteres, coerente com sua área e nível na TI.
- **RF-09 — Ocupações:** todo usuário tem **de 2 a 5 ocupações** com cargo, empresa, início, descrição e término (exceto a mais recente, que é a atual, sem término em ao menos a maioria dos usuários). Datas em ordem coerente, sem início no futuro e sem sobreposição absurda.
- **RF-10 — Formações:** todo usuário tem **de 1 a 3 formações** com instituição, curso/área, nível e período, usando níveis variados (técnico, superior, pós/MBA, mestrado, doutorado), com predominância de cursos de TI (ex.: Análise e Desenvolvimento de Sistemas, Ciência da Computação, Sistemas de Informação, Engenharia de Software). Alguns têm formação em andamento.
- **RF-11 — Cursos:** todo usuário tem **de 2 a 6 cursos** complementares com nome, instituição, carga horária e período, relacionados à TI (ex.: cloud, dados, segurança, DevOps, IA, agilidade).
- **RF-12 — Validade:** todos os itens respeitam as validações da spec 004 (obrigatórios preenchidos, datas consistentes, horas inteiras positivas). Nenhum dado de teste poderia ser recusado pelo próprio sistema.

### Área de TI e variedade
- **RF-13 — Todos de TI:** todas as ocupações, formações e cursos pertencem ao universo de tecnologia da informação.
- **RF-14 — Variedade de papéis:** o conjunto cobre papéis diversos, como desenvolvimento (back-end, front-end, full stack, mobile), dados/IA, DevOps/infraestrutura/cloud, segurança, QA, UX/UI, gestão de produto/projetos e liderança técnica, em níveis de estagiário a especialista/gestor.
- **RF-15 — Variedade de trajetórias:** o conjunto inclui, de propósito, perfis com ocupação atual e sem ocupação atual, formação concluída e em andamento, trajetória curta (início de carreira) e longa (mais de 10 anos), e itens com e sem descrição.

### Disponibilização e repetição
- **RF-16 — Carga via migration:** os usuários de teste são criados por uma **migration** do banco (constituição §10), aplicada de forma explícita e documentada junto com as demais (constituição §12), e não automaticamente em toda subida dos contêineres. A carga só entra no banco quando as migrations são aplicadas.
- **RF-17 — Sem duplicar:** a carga é aplicada **uma única vez** pelo controle de migrations; reaplicar as migrations não cria duplicatas, e o resultado final é sempre o mesmo conjunto de 100 usuários. Se algum usuário de teste já existir (mesmo e-mail), ele é tratado sem gerar segundo registro nem erro.
- **RF-18 — Reprodutível:** o conteúdo do conjunto é **determinístico e versionado** no repositório: qualquer pessoa que rode a carga obtém os mesmos 100 usuários, com os mesmos dados e fotos.
- **RF-19 — Não interfere em dados reais:** usuários já existentes que não pertencem ao conjunto de teste não são alterados nem removidos pela carga.
- **RF-20 — Remoção:** reverter a migration remove o conjunto de teste (usuários, itens de perfil e fotos) sem afetar outros usuários.

## Requisitos não funcionais
- **RNF-01 — Privacidade (constituição §6):** nome, e-mail, bio, histórico profissional e imagem são **inteiramente fictícios** e não correspondem a pessoa real; as imagens são ilustrações, nunca fotos de pessoas, reais ou sintéticas. A senha de teste é pública por natureza e **jamais** deve ser usada em ambiente real; por isso a carga é destinada apenas a desenvolvimento e demonstração.
- **RNF-02 — Sem segredos reais:** nada no conjunto contém segredo; a senha de teste é declarada como tal.
- **RNF-03 — Tudo via Docker (constituição §12):** a carga é aplicada no ambiente do projeto (`docker compose`) pelo mesmo comando documentado das migrations, sem pré-requisitos locais.
- **RNF-04 — Rapidez:** a carga completa leva **segundos** (compatível com demo ao vivo).
- **RNF-05 — Peso razoável do repositório:** as 100 fotos ocupam pouco espaço (cada uma bem abaixo do limite de 2 MB).
- **RNF-06 — Origem e uso das imagens:** os avatares são criados pelo próprio projeto; o repositório registra como foram gerados e declara que são dedicados ao domínio público (CC0), de modo que podem ser usados e redistribuídos, inclusive em demonstração pública, sem termos de terceiros.
- **RNF-07 — Idioma:** textos (bios, descrições, cargos, cursos) em português do Brasil.

## Critérios de aceite
- [x] **RF-01:** dado o ambiente limpo, quando as migrations são aplicadas, então existem exatamente 100 usuários de teste.
- [x] **RF-02/RF-03:** dado qualquer usuário de teste, quando entra com seu e-mail e a senha de teste, então o login funciona.
- [x] **RF-06/RF-07:** dado cada um dos 100 usuários, quando abre o perfil, então vê uma foto (não o avatar de iniciais), e não há duas fotos idênticas.
- [x] **RF-07/RNF-06:** dado o repositório, então o processo de geração dos 100 avatares e a dedicação ao domínio público estão registrados, e gerá-los novamente produz as mesmas imagens.
- [x] **RF-03a:** dado um usuário de teste, quando entra com e-mail e `senha123`, então chega à Home sem nenhum passo de ativação.
- [x] **RF-08–RF-11:** dado cada usuário, quando abre o perfil, então vê bio, de 2 a 5 ocupações, de 1 a 3 formações e de 2 a 6 cursos, cada seção em linha do tempo do mais recente ao mais antigo.
- [x] **RF-12:** dado o conjunto inteiro, quando seus itens são conferidos contra as regras da spec 004, então nenhum viola validação alguma.
- [x] **RF-13/RF-14:** dado o conjunto, quando os perfis são conferidos, então todos têm conteúdo de TI e há ao menos 6 áreas de atuação distintas representadas.
- [x] **RF-15:** dado o conjunto, então existe ao menos um usuário sem ocupação atual, um com formação em andamento e um com mais de 10 anos de carreira.
- [x] **RF-17:** dado o conjunto já carregado, quando as migrations são aplicadas novamente, então continuam existindo exatamente 100 usuários de teste, sem duplicatas.
- [x] **RF-19:** dado um usuário real existente, quando as migrations são aplicadas, então os dados dele permanecem intactos.
- [x] **RF-20:** dado o conjunto carregado, quando a migration é revertida, então nenhum usuário de teste (nem foto ou item de perfil) resta e usuários reais permanecem.
- [x] **RF-05:** dado o conjunto, então não há dois usuários com o mesmo e-mail nem o mesmo nome completo.

## Fora de escopo
- Perfis públicos, busca, listagem ou qualquer tela nova para navegar entre usuários (spec 004 mantém o perfil privado).
- Usuários de teste de outras áreas além de TI.
- Carga em produção ou automática a cada `docker compose up`; interface própria para disparar a carga.
- Dados de teste para outras features além de usuário e perfil.

## Decisões registradas
- Imagens de perfil: 100 avatares ilustrados gerados pelo projeto (não fotos), determinísticos e em domínio público; substitui a decisão anterior de rostos sintéticos/fotos.
- Senha de teste: `senha123` (única para todos).
- E-mails no domínio `exemplo.com`.
- Carga disparada como migration, aplicada junto das demais de forma explícita.
- Todos os usuários nascem com conta ativa.
- Empresas fictícias; instituições de ensino reais apenas como formação genérica (sem atribuir fatos ou notas específicas a elas).

## Questões em aberto
Nenhuma.
