# Plano: Foto do perfil no avatar do menu

- **Spec:** ./spec.md

## Decisões técnicas
| Decisão | Escolha | Justificativa |
|---|---|---|
| Escopo | **Somente frontend**; sem mudança de API, banco ou Docker | O contrato da foto já existe (spec 004): `GET /api/profile` devolve `photoVersion` e `GET /api/profile/photo?v=` entrega a imagem |
| Origem do `photoVersion` no menu | `AuthProvider` busca `profileService.getProfile()` após autenticar e guarda só `photoVersion` | Evita alterar `/api/auth/me` e o login (backend, DTOs, testes); custo: uma leitura extra do perfil ao abrir o app |
| Compartilhar o estado | Expor `photoVersion` e `setPhotoVersion` em `AuthContext` (`useAuth`) | O menu e a tela de perfil já usam `useAuth`; evita um novo contexto/provider (simplicidade) |
| Atualização sem recarregar (RF-03) | `Profile.tsx` chama `setPhotoVersion(profile.photoVersion)` sempre que carrega/recarrega o perfil (inclui o `onChanged` do `PhotoSection`) | Reaproveita o recarregamento que já ocorre após enviar/remover; nenhum mecanismo novo |
| Troca de usuário | `photoVersion` é zerado em `logout` e em perda de sessão (`unauthorized`) e recarregado no `login` | Nunca mostrar a foto do usuário anterior (RNF-02) |
| Falha da imagem (RF-04) | `UserBadge` mantém estado `failed` (zerado quando `photoVersion` muda) e, no `onError` do `<img>`, volta às iniciais | Evita imagem quebrada; sem alterar o componente `Avatar` compartilhado |
| Enquanto carrega (RNF-03) | Sem `photoVersion` (ainda não chegou, ou erro ao buscar), mostram-se as iniciais | O menu nunca fica sem avatar; falha ao buscar o perfil é silenciosa no menu |
| Marcação do avatar | `UserBadge` renderiza `<img className={styles.avatar} src alt="" />` quando há foto e o `<span>` de iniciais como hoje; o link mantém `aria-label="Abrir perfil de <nome>"` | RNF-01 (avatar decorativo, sem alt redundante); sem mudar cor/tamanho (fora de escopo) |
| URL da foto | `profileService.photoUrl(version)` já existente (`?v=` invalida o cache após troca) | RF-03 |

## Arquitetura
```
AuthProvider ── autenticado ──► GET /api/profile ──► photoVersion (estado)
     │                                                   ▲
     │ useAuth()                                         │ setPhotoVersion(p.photoVersion)
     ├──► UserBadge (menu): photoVersion? <img src=photoUrl(v)> : iniciais
     └──► Profile (tela): carrega/recarrega perfil ──────┘
```

## Contratos
Nenhum novo. Consome os existentes da spec 004:
- `GET /api/profile` → `{ …, photoVersion: string | null }`
- `GET /api/profile/photo?v=<versão>` → bytes da imagem (`404` sem foto)

Mudança de tipo no frontend: `AuthContextValue` ganha `photoVersion: string | null` e `setPhotoVersion: (v: string | null) => void`.

## Impacto por camada (backend)
Nenhum (Domain, Application, Infrastructure e Api intocados).

## Frontend
- **`auth/authContext.ts`:** adicionar `photoVersion` e `setPhotoVersion` ao `AuthContextValue`.
- **`auth/AuthProvider.tsx`:** estado `photoVersion`; ao ficar autenticado (carga inicial via `me` e `login`), buscar `profileService.getProfile()` e guardar a versão (erro ignorado); zerar em `logout` e no handler de não autorizado. Cuidado com resposta tardia (flag `active`/ignorar se saiu).
- **`layout/UserBadge.tsx`:** ler `photoVersion` de `useAuth`; renderizar `<img>` circular com `onError` → iniciais; zerar `failed` ao mudar a versão.
- **`layout/Sidebar.module.css`:** `.avatar` ganha `object-fit: cover` (a imagem preenche o círculo; funciona expandido e recolhido, pois o tamanho do avatar não muda).
- **`pages/profile/Profile.tsx`:** sincronizar `setPhotoVersion` com `profile.photoVersion` após cada carga.
- **Testes:** `layout/layout.test.tsx` e `auth/auth.test.tsx` fornecem o `AuthContext` manualmente: incluir `photoVersion`/`setPhotoVersion` nos valores de teste.

## Modelo de dados (EF Core Code First)
Nenhum. Sem migration.

## Docker
Nenhuma mudança.

## Verificação da constituição
- [x] Spec primeiro — spec 007 sem pendências
- [x] Simplicidade — sem backend novo, sem novo contexto, sem alterar componente compartilhado
- [x] Verificabilidade — um teste por critério de aceite (abaixo)
- [x] Dependências da Arquitetura Limpa respeitadas — backend não afetado
- [x] Roda via docker compose — sem mudança de infraestrutura

## Testes (concisos, constituição 8.1)
Em `layout/layout.test.tsx`, com `photoVersion` no contexto de teste:
- RF-01/RF-05: com `photoVersion: 'v1'`, o menu mostra `<img>` com `src` contendo `/api/profile/photo?v=v1`.
- RF-02: com `photoVersion: null`, mostra as iniciais "AS" e nenhum `<img>`.
- RF-04: disparar `error` na imagem faz o avatar voltar às iniciais.
- RF-03: em `auth/auth.test.tsx` (ou teste do `AuthProvider`), `setPhotoVersion` altera o valor exposto; a sincronização no perfil fica coberta pela verificação manual abaixo.
- RF-06 já coberto pelo teste existente do link "Abrir perfil de Ana Silva".

Verificação manual no navegador: enviar foto no perfil → avatar do menu muda sem recarregar; remover → volta às iniciais; recarregar mantém; menu recolhido mostra a foto.

## Riscos
- **Leitura extra do perfil** a cada abertura do app (traz também a linha do tempo, sem uso no menu). Aceito pela simplicidade; se pesar, a alternativa é incluir `photoVersion` em `/api/auth/me` (mudança de backend e de DTO a registrar em nova spec).
- **Corrida:** resposta do perfil chegando após logout/troca de usuário não pode repor a foto (tratar com flag de cancelamento).
- **Dois pontos escrevem `photoVersion`** (provider e tela de perfil); como a tela sempre grava o valor mais recente do servidor, não há divergência duradoura.
- **Cookie em `<img>`:** depende do cookie `SameSite=Lax` entre `:5173` e `:8080`, já validado na spec 004.
