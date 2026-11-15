# Spec: Foto do perfil no avatar do menu

- **ID:** 007-avatar-menu
- **Status:** implementada
- **Data:** 2026-11-15

## Contexto e objetivo
No topo do menu lateral, o usuário logado aparece com um avatar circular que **sempre** mostra as iniciais do nome (spec 003, RF-22; spec 004, RF-01). Mas o usuário já pode enviar uma **foto de perfil** (spec 004, RF-03). Hoje a foto só aparece na tela de perfil, e o menu não a reflete, o que dá a impressão de que ela não foi salva.

Esta feature faz o avatar do menu **mostrar a foto do perfil quando ela existe** e, quando não existe, manter as **iniciais do nome**. Assim o usuário se reconhece no menu em qualquer tela.

Público: qualquer usuário autenticado.

## Histórias de usuário
- Como usuário com foto de perfil, quero ver minha foto no avatar do menu, para me reconhecer visualmente em qualquer tela.
- Como usuário sem foto, quero continuar vendo as iniciais do meu nome, para ter sempre uma identificação.
- Como usuário, quero que o avatar do menu acompanhe minhas mudanças de foto, para não ver uma imagem desatualizada.

## Requisitos funcionais
- **RF-01 — Foto quando existe:** se o usuário tem foto de perfil, o avatar do menu exibe essa foto, no mesmo formato circular e tamanho do avatar atual.
- **RF-02 — Iniciais quando não existe:** se o usuário não tem foto (nunca enviou ou a removeu), o avatar exibe as iniciais do nome, como hoje.
- **RF-03 — Acompanha mudanças:** ao enviar, trocar ou remover a foto na tela de perfil, o avatar do menu é atualizado sem recarregar a página. Após recarregar ou entrar de novo, o avatar reflete a foto atual.
- **RF-04 — Falha ao carregar:** se a foto não puder ser carregada, o avatar exibe as iniciais em vez de uma imagem quebrada.
- **RF-05 — Menu recolhido:** com o menu recolhido (só ícones), o avatar também exibe a foto ou as iniciais, conforme RF-01 e RF-02.
- **RF-06 — Comportamento preservado:** clicar no avatar/nome continua levando ao perfil (spec 004, RF-01); o nome continua exibido ao lado quando o menu está expandido.

## Requisitos não funcionais
- **RNF-01 — Acessibilidade:** o avatar continua decorativo; o link já tem o nome acessível "Abrir perfil de <nome>", sem texto alternativo redundante. Contraste das iniciais mantido (AA) nos dois temas.
- **RNF-02 — Privacidade (constituição §6):** a foto continua acessível apenas ao próprio usuário (spec 004, RNF-01); nenhum novo dado pessoal é coletado.
- **RNF-03 — Desempenho:** o menu não deve ficar sem avatar nem "piscar" de forma perceptível ao carregar; enquanto a foto não chega, são exibidas as iniciais.

## Critérios de aceite
- [x] **RF-01:** Dado um usuário com foto, quando abre qualquer tela, então o avatar do menu mostra a foto, circular, no tamanho atual.
- [x] **RF-02:** Dado um usuário sem foto, quando abre qualquer tela, então o avatar do menu mostra as iniciais do nome.
- [x] **RF-03:** Dado um usuário no perfil, quando envia uma foto, então o avatar do menu passa a mostrá-la sem recarregar; quando remove a foto, então volta às iniciais.
- [x] **RF-04:** Dado um usuário cuja foto falha ao carregar, quando o menu é exibido, então o avatar mostra as iniciais, sem imagem quebrada.
- [x] **RF-05:** Dado o menu recolhido, quando o usuário tem foto, então o avatar mostra a foto; sem foto, as iniciais.
- [x] **RF-06:** Dado qualquer estado do avatar, quando o usuário clica nele, então vai para o perfil.

## Fora de escopo
- Enviar, cortar ou editar a foto (já coberto na spec 004).
- Mostrar a foto em outros lugares além do avatar do menu (ex.: cabeçalho, listas).
- Alterar o tamanho, a forma ou o estilo do avatar, ou a cor de fundo das iniciais.
- Foto de outros usuários.

## Questões em aberto
Nenhuma.
