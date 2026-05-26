---
name: git-workflow
description: Use this skill when creating commits, opening PRs, writing branch names, or doing any git operation in Zitly.
---

# Git workflow in Zitly

## Branch naming

feat/descripcion-corta
fix/descripcion-corta
chore/descripcion-corta

## Commit messages

Formato: tipo: descripción en imperativo

Ejemplos:

- feat: add booking cancellation from dashboard
- fix: prevent double booking on concurrent requests
- chore: update Next.js to latest
- test: add UNIQUE constraint violation test

Reglas:

- Imperativo: "add" no "added", "fix" no "fixed"
- Sin punto al final
- Un cambio lógico por commit
- Máximo 72 caracteres

## Antes de hacer commit siempre

1. npm run lint — cero errores
2. npm run build — debe pasar
3. Sin secrets ni API keys en el diff
4. Sin console.log en código de producción
