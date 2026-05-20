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

## Notas de stack

- Usar el cliente de Supabase desde `src/lib/supabase/` — no instanciar clientes ad-hoc.
- Next.js 16 App Router: los Server Components se ejecutan en servidor pero su output HTML llega al cliente; no incluir datos sensibles en el árbol de render.
- Las Server Actions son endpoints POST públicos — tratar sus argumentos como input no confiable.
