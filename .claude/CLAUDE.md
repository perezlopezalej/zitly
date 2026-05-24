# Zitly — Sistema de reservas para negocios de servicios

## Stack
- **Next.js 16.2.6** (App Router, `proxy.ts` no `middleware.ts`)
- **TypeScript strict** (`strict: true`, sin `any`)
- **Tailwind CSS v4** + `tw-animate-css` (sistema de tokens en `@theme inline`)
- **Supabase** (auth + PostgreSQL, `@supabase/ssr` 0.10.3)
- **Vitest** para tests unitarios (no puede testar Server Components async — usar unit tests para lógica pura)
- **Vercel** para deploy

## Dependencias clave
- `clsx` + `tailwind-merge` → `cn()` en `src/lib/utils.ts`
- `lucide-react` para iconos
- `next/font/google`: Playfair Display, DM Sans, Geist, JetBrains Mono

## Estructura
- `src/app/` — páginas y rutas (App Router)
- `src/app/actions/` — Server Actions (`'use server'`)
- `src/components/landing/` — 18 componentes de landing page
- `src/components/ui/` — componentes genéricos reutilizables
- `src/lib/` — utilidades y clientes de Supabase
- `src/lib/actions.ts` — `getBusiness()`: helper de auth para Server Actions
- `src/lib/validation.ts` — `validateLength()` y otras validaciones
- `src/types/index.ts` — tipos de dominio (`ActionResult`, `Employee`, `Service`, `Booking`, `BookingStatus`)
- `src/hooks/` — hooks custom (ej. `useIntersectionObserver`)
- `src/proxy.ts` — middleware de Next.js 16 (protección de rutas `/dashboard`)

## Fuentes (CSS vars)
- `--font-display` → Playfair Display (títulos, `font-display` class)
- `--font-sans` → DM Sans → Geist Sans → Arial (body)
- `--font-mono` → JetBrains Mono (código, datos)

## Paleta (OKLCH)
- `brand-green`: `oklch(0.38 0.1 155)` → primary
- `brand-cream`: `oklch(0.985 0.005 145)` → background
- `brand-ink`: `oklch(0.12 0.01 60)` → texto oscuro
- `brand-muted`: `oklch(0.45 0.05 155)` → texto secundario
- `--radius: 0.25rem` (esquinas casi planas)

## Patrones de auth en Server Actions
```ts
'use server'
import { getBusiness } from '@/lib/actions'
import { isRedirectError } from 'next/dist/client/components/redirect-error'

// Patrón estándar:
let supabase, businessId
try {
  ;({ supabase, businessId } = await getBusiness())
} catch (e) {
  if (isRedirectError(e)) throw e
  return { error: 'Error de conexión. Inténtalo de nuevo.' }
}
```

## Cambios importantes de Next.js 16
- `cookies()`, `headers()`, `params`, `searchParams` son **async** — siempre `await`
- Caching **invertido**: nada se cachea por defecto; añadir `'use cache'` para optar al caché
- Turbopack es el bundler por defecto (`next dev` usa Turbopack)
- Gradientes Tailwind v4: `bg-linear-to-*` (no `bg-gradient-to-*`)

## Reglas
- Sin `any`, sin secrets hardcodeados, sin imports de `React` explícitos
- Componentes en PascalCase, funciones en camelCase
- Errores de DB nunca al cliente: mensajes genéricos en español
- Supabase: `createSupabaseServerClient()` desde `src/lib/supabase`
- Tipos de dominio siempre desde `src/types/index.ts`

## Comandos
- `npm run dev` — servidor local en localhost:3000
- `npm run build` — build de producción
- `npm run lint` — linter ESLint
- `npm run test` — Vitest (31 tests)
