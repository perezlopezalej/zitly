---
name: security-audit
description: >
  Auditoría de seguridad del código en la rama actual. Actívala cuando el
  usuario pida revisar vulnerabilidades, antes de un merge a main, o tras
  añadir nuevas rutas, Server Actions o accesos a base de datos. Cubre las
  amenazas específicas del stack Zitly (Next.js 16 + Supabase + TypeScript).
trigger: "security audit" | "security review" | "auditoría de seguridad" | "revisar seguridad"
---

# Security Audit Skill

## Proceso

1. **Listar todos los findings primero** — presenta el informe completo antes de tocar ningún archivo.
2. Pide confirmación al usuario.
3. Aplica los fixes en orden de severidad (Critical → High → Medium → Low).

---

## Checklist

### 1. Inyección SQL / NoSQL
- [ ] Ninguna query construye SQL con interpolación de strings o template literals.
- [ ] Todas las consultas a Supabase usan los métodos del cliente (`.eq()`, `.in()`, etc.) o RPC con parámetros tipados, nunca `.rpc('fn', { raw: userInput })` sin sanitizar.
- [ ] Los inputs de búsqueda libre se validan con regex o longitud máxima antes de pasarlos a la query.

### 2. Rutas sin autenticación
- [ ] Cada `route.ts` bajo `app/api/` que exponga datos del negocio verifica sesión con `supabase.auth.getUser()` al inicio del handler.
- [ ] Los layouts y páginas bajo rutas protegidas redirigen a `/login` si no hay sesión (middleware o comprobación en el Server Component).
- [ ] No existen rutas que lean `params` o `searchParams` sin comprobar primero que el usuario autenticado tiene permiso sobre ese recurso.

### 3. Datos sensibles expuestos
- [ ] Ningún Server Component ni route handler devuelve campos como `password_hash`, `stripe_secret`, tokens internos o claves de API al cliente.
- [ ] Los `console.log` de desarrollo no imprimen objetos de sesión completos ni datos PII.
- [ ] Los mensajes de error al cliente son genéricos; el detalle interno se loguea solo en servidor.

### 4. Row Level Security (RLS) de Supabase
- [ ] Todas las tablas tienen RLS habilitado (`ALTER TABLE … ENABLE ROW LEVEL SECURITY`).
- [ ] Las políticas de SELECT, INSERT, UPDATE y DELETE usan `auth.uid()` y no permiten acceso cruzado entre tenants/usuarios.
- [ ] El cliente de Supabase usado en rutas de API es el cliente de servicio (`supabaseAdmin`) solo cuando es necesario, y nunca se expone al browser.
- [ ] Las políticas no tienen `USING (true)` sin una condición de usuario.

### 5. Variables de entorno
- [ ] Las variables con prefijo `NEXT_PUBLIC_` son únicamente las que deben llegar al cliente (URL de Supabase, anon key). Ningún secret aparece con ese prefijo.
- [ ] El archivo `.env.local` (y cualquier `.env*`) está en `.gitignore` y no existe en el historial de git.
- [ ] El código accede a `process.env.X` con un guard (`if (!process.env.X) throw new Error(…)`) para fallar rápido en deploy incompleto.

### 6. Server Actions sin validación
- [ ] Cada `'use server'` action valida sus argumentos con un esquema (zod u otro) antes de cualquier operación de escritura.
- [ ] Las actions verifican sesión activa — no confían en que "solo el cliente autenticado puede llamarlas".
- [ ] Los rate limits o guards de CSRF no se omiten en actions que muten estado crítico (pagos, roles, borrados).

### 7. Errores internos expuestos al usuario
- [ ] Los bloques `catch` en route handlers y actions nunca reenvían `error.message` directamente en la respuesta JSON.
- [ ] Se usa un helper centralizado (p. ej. `toApiError`) que mapea errores internos a códigos genéricos.
- [ ] Los stack traces no aparecen en respuestas 500 en producción (`NODE_ENV === 'production'`).

---

## Formato de output

Presenta los findings como tabla antes de aplicar ningún cambio:

```
| Archivo | Línea | Severidad | Descripción | Fix sugerido |
|---------|-------|-----------|-------------|--------------|
| src/app/api/bookings/route.ts | 42 | Critical | Sin verificación de sesión | Añadir getUser() al inicio |
| src/lib/queries.ts | 17 | High | Template literal en query SQL | Usar parámetros del cliente Supabase |
```

### Niveles de severidad

| Nivel | Criterio |
|-------|----------|
| **Critical** | Acceso a datos de otros usuarios, RLS desactivado, secret expuesto en cliente |
| **High** | Ruta autenticada sin verificación de sesión, SQL injection posible, error interno expuesto |
| **Medium** | Validación de input ausente en action, variable de entorno sin guard |
| **Low** | `console.log` con datos sensibles, mensaje de error demasiado detallado |

---

### 8. Supply Chain Security & AI Tools

> Basado en ataques reales de 2025-2026: paquetes npm maliciosos, extensiones de VS Code troyanizadas, MCP servers comprometidos e inyección de prompts en configs de proyecto.

#### 8a. npm / Dependencias
- [ ] `package-lock.json` existe y está commiteado en el repositorio.
- [ ] CI/CD usa `npm ci` en lugar de `npm install` (reproduce el lockfile exacto).
- [ ] Ningún `package.json` propio ni de dependencias directas tiene scripts `preinstall`/`postinstall` sospechosos — revisar con `npm ls --all` y auditar manualmente los que ejecuten shells, curl o node -e.
- [ ] Las dependencias críticas usan versiones exactas (`"1.2.3"`) en lugar de rangos amplios (`^1.2.3`, `~1.2.3`).
- [ ] `npm audit --audit-level moderate` no arroja vulnerabilidades sin resolver.
- [ ] No existen paquetes con nombres que imiten a librerías populares con errores tipográficos (typosquatting): p. ej. `lodahs`, `expres`, `recat`.
- [ ] `.npmrc` del proyecto incluye `save-exact=true` y considera `ignore-scripts=true` si no se necesitan postinstall legítimos.

#### 8b. Extensiones de VS Code
- [ ] `.vscode/extensions.json` solo lista extensiones de publishers verificados y conocidos (Microsoft, publishers con historial largo).
- [ ] No hay extensiones instaladas recientemente en el workspace sin justificación documentada — revisar con `code --list-extensions`.
- [ ] Nunca instalar extensiones de publishers sin historial de descargas, reviews o presencia pública verificable.

#### 8c. GitHub Actions
- [ ] Todas las actions de terceros referencian un hash de commit completo (`uses: actions/checkout@abc1234…`), nunca `@v1`, `@v2` ni `@latest`.
- [ ] Ningún workflow tiene `permissions: write-all` ni `contents: write` sin necesidad explícita documentada.
- [ ] Los secrets de CI/CD (`secrets.NPM_TOKEN`, `secrets.VERCEL_TOKEN`, etc.) no se imprimen en `echo` ni en `run:` steps — verificar los logs de runs recientes.

#### 8d. MCP Servers
- [ ] `.mcp.json` solo contiene servidores oficiales de Anthropic o de publishers con repositorio público y mantenimiento activo.
- [ ] Los puertos que exponen servidores MCP locales no están abiertos en el firewall del sistema ni en reglas de red del cloud.
- [ ] MCPs que no se usan activamente están desactivados o eliminados de `.mcp.json`.

#### 8e. Prompt Injection en Configs de Proyecto
- [ ] `CLAUDE.md`, `.cursorrules`, `.github/copilot-instructions.md` y archivos equivalentes en repos clonados de fuentes desconocidas se revisan manualmente antes de ejecutar cualquier agente de IA — pueden contener instrucciones maliciosas dirigidas al modelo.
- [ ] Nunca ejecutar Claude Code (ni Cursor, Copilot, etc.) en repos no confiables sin revisar primero todos los archivos de configuración de IA.
- [ ] Los prompts del sistema y archivos de instrucciones del proyecto están bajo control de versiones y se revisan en cada PR como cualquier otro código.

#### 8f. Tokens y Credenciales
- [ ] Ningún token ni credencial está hardcodeado en código fuente, configs de CI, comentarios ni mensajes de commit — usar `git log -S 'token'` y `git log -S 'secret'` para verificar el historial.
- [ ] `.mcp.json` y todos los archivos `.env*` están en `.gitignore` y no aparecen en `git ls-files`.
- [ ] Existe un proceso documentado para rotar tokens periódicamente: npm token (`npm token list`), GitHub PAT, Anthropic API key.

#### 8g. Código Generado por IA
- [ ] Todo código generado por Claude u otro modelo pasa por revisión humana antes de cualquier deploy a producción.
- [ ] No existen pipelines de deploy automático que tomen código generado sin al menos un paso de revisión manual o aprobación de PR.
- [ ] Este audit de seguridad se ejecuta después de cada sesión larga con Claude Code en la que se hayan generado rutas de API, Server Actions, queries o lógica de autenticación.

---

## Notas de stack

- Usar el cliente de Supabase desde `src/lib/supabase/` — no instanciar clientes ad-hoc.
- Next.js 16 App Router: los Server Components se ejecutan en servidor pero su output HTML llega al cliente; no incluir datos sensibles en el árbol de render.
- Las Server Actions son endpoints POST públicos — tratar sus argumentos como input no confiable.
