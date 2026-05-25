# Component Patterns — Mobile SaaS

Patrones de componentes concretos para web apps SaaS en móvil.
Para cada componente: anatomía, CSS base, y variantes comunes.

---

## Navegación

### Bottom Navigation Bar (recomendada para 3-5 secciones)

```html
<nav class="bottom-nav" role="navigation" aria-label="Navegación principal">
  <a href="/dashboard" class="nav-item active" aria-current="page">
    <span class="nav-icon" aria-hidden="true"><!-- icono SVG --></span>
    <span class="nav-label">Dashboard</span>
  </a>
  <a href="/proyectos" class="nav-item">
    <span class="nav-icon" aria-hidden="true"><!-- icono SVG --></span>
    <span class="nav-label">Proyectos</span>
  </a>
  <a href="/ajustes" class="nav-item">
    <span class="nav-icon" aria-hidden="true"><!-- icono SVG --></span>
    <span class="nav-label">Ajustes</span>
  </a>
</nav>
```

```css
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 64px;
  display: flex;
  background: var(--color-bg);
  border-top: 1px solid var(--color-border);
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 100;
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  min-height: 48px;  /* touch target */
  color: var(--color-text-tertiary);
  text-decoration: none;
  transition: color var(--duration-fast) var(--ease-in-out);
}

.nav-item.active {
  color: var(--color-primary);
}

.nav-label {
  font-size: 10px;
  font-weight: var(--font-medium);
}
```

### Top App Bar

```html
<header class="top-app-bar">
  <button class="icon-btn" aria-label="Menú"><!-- icono --></button>
  <h1 class="app-bar-title">Proyectos</h1>
  <button class="icon-btn" aria-label="Buscar"><!-- icono --></button>
</header>
```

```css
.top-app-bar {
  position: sticky;
  top: 0;
  display: flex;
  align-items: center;
  height: 56px;
  padding-inline: var(--space-2);
  background: var(--color-bg);
  border-bottom: 1px solid var(--color-border);
  z-index: 90;
}

.app-bar-title {
  flex: 1;
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  padding-inline: var(--space-3);
}

.icon-btn {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  border: none;
  background: transparent;
  color: var(--color-text-primary);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: background var(--duration-fast);
}

.icon-btn:hover { background: var(--color-bg-tertiary); }
.icon-btn:active { background: var(--color-bg-tertiary); transform: scale(0.95); }
```

---

## Cards

### Card de métrica (dashboard)

```html
<div class="metric-card">
  <p class="metric-label">Ingresos este mes</p>
  <p class="metric-value">€12,450</p>
  <p class="metric-change positive">+8.2% vs mes anterior</p>
</div>
```

```css
.metric-card {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-4) var(--space-5);
}

.metric-label {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-2);
}

.metric-value {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  line-height: var(--leading-tight);
  margin-bottom: var(--space-2);
}

.metric-change {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
}
.metric-change.positive { color: var(--color-success); }
.metric-change.negative { color: var(--color-danger); }
```

### Card de contenido con acciones

```html
<article class="content-card">
  <div class="card-header">
    <h3 class="card-title">Nombre del proyecto</h3>
    <button class="icon-btn" aria-label="Más opciones">⋮</button>
  </div>
  <p class="card-description">Descripción breve del elemento...</p>
  <div class="card-meta">
    <span class="badge badge-success">Activo</span>
    <span class="card-date">Actualizado hoy</span>
  </div>
</article>
```

```css
.content-card {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
}

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
}

.card-title {
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
}

.card-description {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  line-height: var(--leading-normal);
  margin-bottom: var(--space-3);
}

.card-meta {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.card-date {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
}
```

---

## Formularios

### Input con label flotante

```html
<div class="field">
  <label for="email" class="field-label">Email</label>
  <input
    id="email"
    type="email"
    inputmode="email"
    autocomplete="email"
    class="field-input"
    placeholder="tu@empresa.com"
  />
  <p class="field-hint" id="email-hint">Usa el email de tu empresa</p>
</div>
```

```css
.field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.field-label {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--color-text-primary);
}

.field-input {
  width: 100%;
  min-height: 48px;         /* touch target */
  font-size: 16px;          /* CRÍTICO: evita zoom en iOS */
  padding: var(--space-3) var(--space-4);
  background: var(--color-bg);
  border: 1.5px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  transition: border-color var(--duration-fast);
  -webkit-appearance: none;  /* elimina estilos nativos en iOS */
}

.field-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-subtle);
}

.field-input.error {
  border-color: var(--color-danger);
}

.field-hint {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
}

.field-error {
  font-size: var(--text-xs);
  color: var(--color-danger);
}
```

### Tipos de input y su `inputmode`

| Tipo de dato       | `type`     | `inputmode`  | `autocomplete`    |
|--------------------|------------|--------------|-------------------|
| Email              | `email`    | `email`      | `email`           |
| Contraseña         | `password` | —            | `current-password` |
| Teléfono           | `tel`      | `tel`        | `tel`             |
| Número entero      | `number`   | `numeric`    | —                 |
| Búsqueda           | `search`   | `search`     | —                 |
| URL                | `url`      | `url`        | `url`             |
| Nombre             | `text`     | —            | `name`            |

---

## Pantalla de autenticación

### Login mobile-first

```html
<div class="auth-screen">
  <div class="auth-header">
    <img src="/logo.svg" alt="Logo" class="auth-logo" />
    <h1 class="auth-title">Bienvenido</h1>
    <p class="auth-subtitle">Accede a tu cuenta</p>
  </div>

  <!-- OAuth primero en B2B (reduce fricción) -->
  <button class="btn-oauth">
    <img src="/google-icon.svg" aria-hidden="true" />
    Continuar con Google
  </button>
  <button class="btn-oauth">
    <img src="/github-icon.svg" aria-hidden="true" />
    Continuar con GitHub
  </button>

  <div class="divider"><span>o con tu email</span></div>

  <form class="auth-form" novalidate>
    <div class="field">
      <label for="login-email">Email</label>
      <input id="login-email" type="email" inputmode="email" autocomplete="email" />
    </div>
    <div class="field">
      <label for="login-password">Contraseña</label>
      <input id="login-password" type="password" autocomplete="current-password" />
    </div>
    <button type="submit" class="btn-primary btn-full">Entrar</button>
  </form>
</div>
```

```css
.auth-screen {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  padding: var(--space-8) var(--space-6);
  padding-bottom: max(var(--space-8), env(safe-area-inset-bottom));
}

.auth-header { text-align: center; margin-bottom: var(--space-8); }
.auth-logo   { height: 40px; margin-bottom: var(--space-4); }
.auth-title  { font-size: var(--text-2xl); font-weight: var(--font-bold); }
.auth-subtitle { color: var(--color-text-secondary); margin-top: var(--space-2); }

.btn-oauth {
  width: 100%;
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  background: var(--color-bg);
  border: 1.5px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  margin-bottom: var(--space-3);
  cursor: pointer;
}

.divider {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin: var(--space-5) 0;
  color: var(--color-text-tertiary);
  font-size: var(--text-sm);
}
.divider::before, .divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--color-border);
}

.btn-primary {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  border: none;
  border-radius: var(--radius-md);
  min-height: 52px;
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: background var(--duration-fast);
}
.btn-primary:hover  { background: var(--color-primary-hover); }
.btn-primary:active { transform: scale(0.98); }
.btn-full { width: 100%; }
```

---

## Tablas de datos en móvil

En móvil, las tablas densas no funcionan. Convierte filas en cards:

```html
<!-- En lugar de <table>, usa una lista de cards -->
<ul class="data-list" role="list">
  <li class="data-row">
    <div class="data-row-main">
      <span class="data-row-title">Acme Corp</span>
      <span class="data-badge badge-success">Activo</span>
    </div>
    <div class="data-row-meta">
      <span>€2,400/mes</span>
      <span class="text-secondary">Plan Pro · 12 usuarios</span>
    </div>
    <button class="data-row-action" aria-label="Ver detalles de Acme Corp">
      →
    </button>
  </li>
</ul>
```

```css
.data-list { list-style: none; display: flex; flex-direction: column; gap: var(--space-2); }

.data-row {
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-rows: auto auto;
  gap: var(--space-1) var(--space-3);
  padding: var(--space-4);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: background var(--duration-fast);
  -webkit-tap-highlight-color: transparent;
}

.data-row:active { background: var(--color-bg-secondary); }

.data-row-main {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.data-row-title {
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
}

.data-row-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.data-row-action {
  grid-row: 1 / 3;
  grid-column: 2;
  align-self: center;
  color: var(--color-text-tertiary);
  background: none;
  border: none;
  font-size: var(--text-xl);
  padding: var(--space-2);
}
```

---

## Badges y estados

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 2px var(--space-2);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
}

.badge-success { background: var(--color-success-subtle); color: var(--color-success); }
.badge-warning { background: var(--color-warning-subtle); color: var(--color-warning); }
.badge-danger  { background: var(--color-danger-subtle);  color: var(--color-danger);  }
.badge-info    { background: var(--color-info-subtle);    color: var(--color-info);    }
```

---

## Skeleton loaders (preferir sobre spinners)

```html
<div class="skeleton-card">
  <div class="skeleton" style="height:14px;width:40%;margin-bottom:8px"></div>
  <div class="skeleton" style="height:32px;width:60%"></div>
</div>
```

```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-bg-tertiary) 25%,
    var(--color-bg-secondary) 50%,
    var(--color-bg-tertiary) 75%
  );
  background-size: 200% 100%;
  border-radius: var(--radius-sm);
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton { animation: none; background: var(--color-bg-tertiary); }
}
```

---

## Estado vacío (empty state)

```html
<div class="empty-state">
  <div class="empty-icon" aria-hidden="true">📋</div>
  <h3 class="empty-title">No hay proyectos todavía</h3>
  <p class="empty-description">Crea tu primer proyecto y empieza a trabajar.</p>
  <button class="btn-primary">Crear proyecto</button>
</div>
```

```css
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: var(--space-16) var(--space-8);
  gap: var(--space-3);
}

.empty-icon { font-size: 48px; margin-bottom: var(--space-2); }
.empty-title { font-size: var(--text-xl); font-weight: var(--font-semibold); }
.empty-description { color: var(--color-text-secondary); max-width: 280px; }
```