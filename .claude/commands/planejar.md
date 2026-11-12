---
description: Gera o plano técnico de uma feature a partir da spec
argument-hint: [NNN-slug]
---
Feature: $ARGUMENTS (se vazio, use a spec mais recente em `specs/`).

1. Leia `spec.md` e `.claude/CONSTITUTION.md`. Pare se houver `[NEEDS CLARIFICATION]` pendente e pergunte ao usuário.
2. Crie `plan.md` a partir de `specs/_templates/plan.md`, com decisões, contratos e verificação da constituição.
3. Não escreva código de produção.
