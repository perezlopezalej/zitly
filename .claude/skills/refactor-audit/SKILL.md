---
name: refactor-audit
description: >
  Auditoría de calidad estructural del código en la rama actual. Actívala cuando
  el usuario pida reducir duplicación, extraer utilidades, limpiar imports o
  reorganizar componentes. NUNCA modifica lógica de negocio — solo estructura,
  organización y reutilización. Cubre los patrones específicos del stack Zitly
  (Next.js 16 + Supabase + TypeScript + Tailwind).
trigger: "refactor audit" | "refactor review" | "auditoría de refactor" | "revisar duplicación" | "limpiar código"
---

# Refactor Audit Skill

## Regla fundamental

> **No tocar lógica de negocio.** Si mover o extraer código cambia el comportamiento observable, no hacerlo. Solo estructura y organización.

## Proceso

1. **Listar todos los findings primero** — presenta el informe completo antes de tocar ningún archivo.
2. Pide confirmación al usuario (puede excluir findings o cambiar el orden).
3. Aplica los refactors en orden: primero los que otros dependen de ellos (tipos, utils), luego componentes, luego páginas.

---

## Checklist

### 1. Código duplicado
- [ ] No existe lógica idéntica o casi idéntica copiada en dos o más archivos (handlers, transformaciones de datos, cálculos).
- [ ] Los bloques `try/catch` repetidos con la misma estructura se han extraído a un helper.
- [ ] Las llamadas a Supabase con el mismo patrón (`.select()`, `.eq()`, filtros comunes) no se repiten en múltiples rutas — deben estar en `src/lib/` o en un repositorio de datos.

### 2. Tipos TypeScript redundantes
- [ ] No existen interfaces o types que describan la misma forma con nombres distintos.
- [ ] Los tipos derivados de tablas de Supabase se generan desde `src/types/` y no se redefinen inline en componentes o routes.
- [ ] Los tipos de props de componentes no duplican tipos ya definidos en `src/types/` — se reutilizan o se extienden con `Pick` / `Omit`.
- [ ] No hay `as unknown as X` ni castings que indiquen un tipo incorrecto en el origen.

### 3. Validaciones repetidas
- [ ] Los esquemas de validación (zod u otro) no están definidos varias veces para la misma entidad en diferentes rutas o actions.
- [ ] Las validaciones de formato (email, teléfono, fechas) están centralizadas en `src/lib/validations/` y se importan donde se necesitan.
- [ ] Los guards de sesión (`if (!user) return ...`) siguen el mismo patrón en todos los handlers — si hay variaciones injustificadas, unificar.

### 4. Utilidades extraíbles
- [ ] Las funciones puras (formateo de fechas, precios, slugs, nombres) que aparecen en más de un archivo están en `src/lib/utils/`.
- [ ] Las constantes (estados de reserva, roles, límites) no están hardcodeadas en múltiples lugares — deben vivir en un archivo de constantes.
- [ ] Los helpers de Supabase (obtener usuario actual, manejar errores de DB) no se reimplementan en cada route handler.

### 5. Componentes UI duplicados
- [ ] No existen dos componentes que rendericen la misma estructura visual con props ligeramente distintas — deben unificarse con props opcionales.
- [ ] Los patrones de layout repetidos (card con header + body, sección con título + lista) están abstraídos en `src/components/`.
- [ ] Los estados de carga y error tienen una presentación consistente — no hay spinners o mensajes de error implementados de forma diferente en cada página.
- [ ] Las clases de Tailwind repetidas en múltiples componentes para el mismo patrón visual se han extraído a un componente o a `@apply` en globals.css (solo si el patrón se repite 3+ veces).

### 6. Imports no utilizados
- [ ] No hay imports de tipos, componentes, funciones o constantes que no se usen en el archivo.
- [ ] No hay imports de `React` explícitos innecesarios (Next.js 16 con App Router no los requiere).
- [ ] Los barrel exports (`index.ts`) no reexportan símbolos que ningún consumidor importa.
- [ ] No hay dependencias en `package.json` que no se importen en ningún archivo del proyecto.

---

## Formato de output

Presenta los findings como tabla antes de aplicar ningún cambio:

```
| Archivo(s) | Descripción del problema | Refactor propuesto |
|------------|--------------------------|-------------------|
| src/app/api/bookings/route.ts, src/app/api/services/route.ts | Guard de sesión duplicado (15 líneas idénticas) | Extraer a src/lib/auth/requireSession.ts |
| src/components/BookingCard.tsx, src/components/ServiceCard.tsx | Estructura de card idéntica, solo cambia el icono | Unificar en src/components/ui/Card.tsx con prop icon |
| src/types/booking.ts, src/app/api/bookings/route.ts:L8 | BookingStatus definido dos veces | Eliminar definición inline, importar desde src/types/ |
```

### Prioridad de aplicación

| Orden | Tipo | Razón |
|-------|------|-------|
| 1 | Tipos y constantes | Todo lo demás puede depender de ellos |
| 2 | Utilidades y helpers | Los componentes y routes los importan |
| 3 | Componentes UI | Las páginas los consumen |
| 4 | Imports no utilizados | Limpieza final, sin dependencias |

---

## Notas de stack

- `src/lib/supabase.ts` contiene `createSupabaseServerClient()` — no instanciar Supabase fuera de ahí.
- `src/lib/actions.ts` exporta `getBusiness()` — el único punto de acceso a auth + businessId en Server Actions.
- `src/lib/validation.ts` exporta `validateLength()` — las validaciones de longitud no se reimplementan inline.
- `src/types/index.ts` es la fuente de verdad para tipos de dominio (`ActionResult`, `Employee`, `Service`, `Booking`, `BookingStatus`).
- `src/components/ui/` es para componentes genéricos sin lógica de negocio; `src/components/landing/` para la landing page.
- En Next.js 16 App Router, no mezclar Server y Client Components — si necesita hooks, `'use client'` en su propio archivo.
- No extraer abstracciones para un solo uso — el umbral mínimo es **2 usos existentes** (no hipotéticos).

## Patrones reales observados en el proyecto

### Patrón de Server Action (no es duplicación a eliminar)
El bloque try/catch con `isRedirectError` se repite en cada action — es intencional. El re-throw es crítico para que el redirect de auth funcione:
```ts
try {
  ;({ supabase, businessId } = await getBusiness())
} catch (e) {
  if (isRedirectError(e)) throw e
  return { error: 'Error de conexión. Inténtalo de nuevo.' }
}
```

### Constantes de landing centralizadas
`src/components/landing/constants.ts` — timing constants (`AUTOADVANCE_MS`, `NOTIF_INITIAL_MS`, `NOTIF_VISIBLE_MS`). Si aparecen números mágicos de timing en otros componentes de landing, moverlos aquí.

### Clases de animación en globals.css
`.marquee`, `.marquee-reverse`, `.line-reveal`, `.hover-lift`, `.letter-spin`, `.animate-char-in`, `.noise-overlay`, `.border-sketch` están en `globals.css`. No reescribirlas inline en componentes.

### Hook de intersection observer ya existe
`src/hooks/useIntersectionObserver.ts` — si un componente implementa su propio `IntersectionObserver` manual, reemplazarlo con este hook.

### Tokens de color — nunca hardcodear
Todos los colores son tokens en `globals.css` bajo `@theme inline` (`brand-green`, `brand-cream`, `brand-ink`, `brand-muted`, etc.). Nunca usar valores OKLCH o hex directamente en componentes.
