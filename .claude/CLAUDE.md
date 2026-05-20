# Zitly — Sistema de reservas para negocios de servicios

## Stack
- Next.js 15, TypeScript strict mode, Tailwind CSS
- Supabase (auth + base de datos PostgreSQL)
- Desplegado en Vercel

## Estructura
- src/app/ — páginas y rutas (App Router)
- src/components/ — componentes reutilizables
- src/lib/ — utilidades y cliente de Supabase
- src/types/ — tipos TypeScript

## Reglas
- Usar siempre TypeScript estricto, nunca `any`
- Componentes en PascalCase, funciones en camelCase
- Siempre manejar estados de carga y error en UI
- Nunca hardcodear secrets, usar variables de entorno

## Comandos
`npm run dev` — servidor local en localhost:3000
`npm run build` — build de producción
`npm run lint` — linter
