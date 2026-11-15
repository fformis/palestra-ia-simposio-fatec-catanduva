# Tarefas: Foto do perfil no avatar do menu

- **Plano:** ./plan.md
- **Spec:** ./spec.md

Formato: `- [ ] T-01 [RF-01] descrição (arquivo/área) — Verificação: …`

Ordem por dependência: contexto → provider → menu → perfil → validação. Sem tarefas de Backend nem de Docker (nenhuma mudança).

## Backend
Nenhuma tarefa.

## Frontend
- [x] T-01 [RF-03] Em `frontend/src/auth/authContext.ts`, adicionar `photoVersion: string | null` e `setPhotoVersion: (v: string | null) => void` ao `AuthContextValue` — Verificação: `npm run build` aponta só os pontos que ainda não fornecem os novos campos (corrigidos nas tarefas seguintes).
- [x] T-02 [RF-01, RF-02, RNF-02, RNF-03] Em `frontend/src/auth/AuthProvider.tsx`, manter o estado `photoVersion`; ao autenticar (carga inicial via `me` e `login`) buscar `profileService.getProfile()` e guardar `photoVersion` (erro ignorado, resposta tardia descartada com flag de cancelamento); zerar em `logout` e no handler de não autorizado; expor `photoVersion` e `setPhotoVersion` no valor do contexto — Verificação: `npm run build` passa; teste: `setPhotoVersion('v2')` altera o `photoVersion` exposto pelo `useAuth` (em `auth/auth.test.tsx`).
- [x] T-03 [RF-01, RF-02, RF-04, RF-05, RF-06, RNF-01] Em `frontend/src/layout/UserBadge.tsx`, ler `photoVersion` de `useAuth`; com versão e sem falha, renderizar `<img className={styles.avatar} src={profileService.photoUrl(photoVersion)} alt="" onError=…>`; caso contrário, o `<span>` de iniciais atual; estado `failed` zerado quando `photoVersion` muda; manter `aria-label` do link — Verificação: testes em `layout/layout.test.tsx` (T-05) passam.
- [x] T-04 [RF-01, RF-05] Em `frontend/src/layout/Sidebar.module.css`, adicionar `object-fit: cover` a `.avatar` — Verificação: no navegador, a foto preenche o círculo (expandido e recolhido) sem distorcer nem mudar o tamanho do avatar.
- [x] T-05 [RF-01, RF-02, RF-04] Em `frontend/src/layout/layout.test.tsx`, incluir `photoVersion` e `setPhotoVersion` no contexto de teste (e em `auth/auth.test.tsx`, onde o contexto é montado à mão) e adicionar 3 testes curtos: com `photoVersion: 'v1'` o menu mostra `<img>` com `src` contendo `/api/profile/photo?v=v1`; com `null` mostra "AS" e nenhum `<img>`; disparar `error` na imagem volta às iniciais — Verificação: `cd frontend && npm test` passa.
- [x] T-06 [RF-03] Em `frontend/src/pages/profile/Profile.tsx`, sincronizar `setPhotoVersion(profile.photoVersion)` toda vez que o perfil é carregado ou recarregado (inclui o `onChanged` do `PhotoSection`) — Verificação: no navegador, enviar foto no perfil muda o avatar do menu sem recarregar; remover volta às iniciais.

## Docker / infra
Nenhuma tarefa.

## Validação
- [x] T-07 Executar os critérios de aceite da spec — Verificação: `cd frontend && npm test`, `npm run build` e `npm run lint` verdes; conferência manual no navegador (usuário com foto e sem foto, enviar/trocar/remover foto no perfil, recarregar mantém, menu recolhido, foto indisponível cai nas iniciais, clique leva ao perfil); marcar os critérios em `spec.md` e atualizar o status para "implementada".
