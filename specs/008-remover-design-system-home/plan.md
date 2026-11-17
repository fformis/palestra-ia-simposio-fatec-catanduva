# Plano: Remover exemplos de Design System da Home

- **Spec:** ./spec.md

## Decisões técnicas
| Decisão | Escolha | Justificativa |
|---|---|---|
| Remoção do cartão | Apagar o bloco do `<Card>` "Design System" de `Home.tsx` | Solução mais simples; RF-01 e RF-02 |
| Rota `/design-system` | Manter em `App.tsx` sem alteração (continua dentro de `RequireAuth` + `AppLayout`) | RF-03: acesso só por URL direta, comportamento idêntico ao atual |
| Limpeza de código morto | Remover de `Home.tsx` os imports `Link` e `Card` e a classe `.cardLink` de `pages.module.css` se ficar sem uso | Evita código morto; `Card` segue usado pelo catálogo, então o componente em si permanece |
| Teste existente | Substituir o teste "Home leva ao catálogo…" em `App.test.tsx` por dois: Home sem link ao catálogo; `/design-system` aberto por URL direta exibe o catálogo | Critérios de aceite 1 e 3 (constituição 8.1: um teste por critério) |
| Spec 002 | Ajustar RF-14 e RF-15 (e o critério de aceite RF-15) para "acessada por URL direta" | RF-04 desta spec; constituição 1/5 |

## Arquitetura
Mudança restrita ao frontend (SPA). Nenhuma mudança de backend, contrato, dados ou infraestrutura.

## Contratos
Nenhum. Sem alterações de API. A única "interface" afetada é a rota de navegação `/design-system`, que permanece inalterada.

## Impacto por camada (backend)
- **Domain:** nenhum
- **Application:** nenhum
- **Infrastructure:** nenhum
- **Api:** nenhum

## Frontend
- `frontend/src/pages/Home.tsx`: remover o cartão "Design System" (e imports sem uso). Manter título e texto de boas-vindas. O parágrafo de boas-vindas cita "componentes padronizados"; manter como está (fora de escopo alterar o texto).
- `frontend/src/pages/pages.module.css`: remover `.cardLink` se não houver outro uso (hoje só `Home.tsx` usa).
- `frontend/src/App.tsx`: sem alteração (rota `design-system` mantida).
- `frontend/src/App.test.tsx`: trocar o teste do catálogo conforme "Decisões técnicas".
- `specs/002-design-system/spec.md`: atualizar RF-14, RF-15 e critério de aceite RF-15.

## Modelo de dados (EF Core Code First)
Nenhum. Sem migration.

## Docker
Nenhuma mudança.

## Verificação da constituição
- [x] Spec primeiro (spec 008 em revisão, sem pendências) 
- [x] Simplicidade (apenas remoção de um bloco e ajuste de testes) 
- [x] Verificabilidade (testes Vitest cobrem cada critério de aceite) 
- [x] Dependências da Arquitetura Limpa respeitadas (backend intocado) 
- [x] Roda via docker compose (sem mudanças de ambiente)

## Riscos
- Remover `.cardLink` ou `Card` indevidamente quebraria outras telas: conferir uso com busca antes de apagar (`Card` é usado pelo catálogo).
- O texto de boas-vindas da Home menciona componentes padronizados, o que pode soar desconexo sem o cartão; aceito por ser fora de escopo (spec).
