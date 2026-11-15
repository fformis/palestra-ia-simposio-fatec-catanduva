# Avatares dos usuários de teste (spec 006)

> **Somente para desenvolvimento e demonstração.** Os 100 usuários de teste são fictícios e usam a senha pública `senha123`; nunca use esta carga em ambiente real.

- **O que são:** 100 ilustrações (PNG 256×256) de personagens estilizados, **não fotografias**. Nenhuma representa pessoa real.
- **Como são geradas:** pelo script [`gerar_avatares.py`](./gerar_avatares.py) (Python + Pillow), a partir do campo `avatar` de cada usuário em `users.json` (tom de pele, penteado, cor do cabelo, acessório, fundo e camisa). A geração é determinística: rodar de novo produz os mesmos arquivos.
- **Como regenerar:** `python3 gerar_avatares.py` nesta pasta (precisa de Pillow). O build, o Docker e os testes usam apenas os PNG já versionados em `photos/`.
- **Licença:** criadas pelo próprio projeto e dedicadas ao **domínio público (CC0 1.0)**; podem ser usadas e redistribuídas sem restrições.
