# Design Tokens — Mobile SaaS

Valores concretos listos para copiar como variables CSS. Derivados de la síntesis
de Apple HIG y Material Design 3 para web apps.

---

## Espaciado (escala de 4px)

```css
:root {
  --space-1:  4px;
  --space-2:  8px;
  --space-3: 12px;
  --space-4: 16px;   /* padding base de componentes */
  --space-5: 20px;
  --space-6: 24px;   /* separación entre secciones */
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
}
```

Regla: usa siempre múltiplos de 4. Nunca valores como 7px, 13px, 22px.

---

## Tipografía

### Escala responsive (mobile-first)

```css
:root {
  /* Tamaños base (móvil) */
  --text-xs:   12px;  /* labels secundarias, metadata */
  --text-sm:   14px;  /* texto de soporte, captions */
  --text-base: 16px;  /* cuerpo de texto, inputs (OBLIGATORIO en inputs) */
  --text-lg:   18px;  /* subheadings */
  --text-xl:   20px;  /* headings de sección */
  --text-2xl:  24px;  /* títulos de página */
  --text-3xl:  30px;  /* métricas grandes en dashboard */

  /* Pesos */
  --font-normal:  400;
  --font-medium:  500;
  --font-semibold: 600;
  --font-bold:    700;

  /* Line heights */
  --leading-tight:  1.25;  /* headings */
  --leading-normal: 1.5;   /* cuerpo */
  --leading-loose:  1.75;  /* texto legal, ayuda */
}
```

### Jerarquía de pantalla (3 niveles máximo)

```
Nivel 1 — Título de pantalla: text-2xl / font-semibold / leading-tight
Nivel 2 — Título de sección:  text-lg  / font-medium  / leading-tight
Nivel 3 — Cuerpo / datos:     text-base / font-normal  / leading-normal
Soporte:                       text-sm  / font-normal  / color secundario
```

---

## Touch targets

```css
/* Touch target mínimo: 44px (HIG) / 48px (M3) → usamos 48px para web */
:root {
  --touch-target: 48px;
}

/* Botones */
.btn {
  min-height: var(--touch-target);
  padding-inline: var(--space-6);
  font-size: var(--text-base);
}

/* Inputs */
input, select, textarea {
  min-height: var(--touch-target);
  font-size: var(--text-base); /* evita zoom en iOS Safari */
  padding: var(--space-3) var(--space-4);
}

/* Elementos de lista clicables */
.list-item {
  min-height: var(--touch-target);
  padding: var(--space-3) var(--space-4);
  display: flex;
  align-items: center;
}
```

---

## Border radius

```css
:root {
  --radius-sm:   4px;   /* badges, chips pequeños */
  --radius-md:   8px;   /* inputs, botones secundarios */
  --radius-lg:  12px;   /* cards, modales */
  --radius-xl:  16px;   /* bottom sheets, sheets grandes */
  --radius-2xl: 24px;   /* floating elements, FAB */
  --radius-full: 9999px; /* pills, avatares */
}
```

---

## Sistema de colores semánticos

Define colores por rol, no por valor. Así el dark mode y la personalización de marca
funcionan solos.

```css
:root {
  /* Brand */
  --color-primary:        #2563EB;  /* acción principal */
  --color-primary-hover:  #1D4ED8;
  --color-primary-subtle: #EFF6FF;  /* fondos sutiles con acción primaria */

  /* Semánticos */
  --color-success:        #16A34A;
  --color-success-subtle: #F0FDF4;
  --color-warning:        #D97706;
  --color-warning-subtle: #FFFBEB;
  --color-danger:         #DC2626;
  --color-danger-subtle:  #FEF2F2;
  --color-info:           #0284C7;
  --color-info-subtle:    #F0F9FF;

  /* Superficies */
  --color-bg:             #FFFFFF;
  --color-bg-secondary:   #F9FAFB;
  --color-bg-tertiary:    #F3F4F6;
  --color-border:         #E5E7EB;
  --color-border-strong:  #D1D5DB;

  /* Texto */
  --color-text-primary:   #111827;
  --color-text-secondary: #6B7280;
  --color-text-tertiary:  #9CA3AF;
  --color-text-inverse:   #FFFFFF;
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-primary:        #3B82F6;
    --color-primary-hover:  #60A5FA;
    --color-primary-subtle: #1E3A5F;

    --color-bg:             #0F172A;
    --color-bg-secondary:   #1E293B;
    --color-bg-tertiary:    #334155;
    --color-border:         #334155;
    --color-border-strong:  #475569;

    --color-text-primary:   #F1F5F9;
    --color-text-secondary: #94A3B8;
    --color-text-tertiary:  #64748B;
  }
}
```

---

## Safe areas (iOS notch / home indicator)

```css
/* Siempre aplica en elementos que toquen los bordes de pantalla */
.bottom-nav {
  padding-bottom: max(var(--space-4), env(safe-area-inset-bottom));
}

.top-app-bar {
  padding-top: max(var(--space-4), env(safe-area-inset-top));
}

.full-screen-modal {
  padding-top:    env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left:   env(safe-area-inset-left);
  padding-right:  env(safe-area-inset-right);
}
```

---

## Elevación (tonal, sin sombras duras)

Siguiendo M3: la elevación se expresa con tonos de color, no con `box-shadow` agresivos.

```css
:root {
  /* Nivel 0 — superficie base */
  --elevation-0: var(--color-bg);

  /* Nivel 1 — cards, inputs */
  --elevation-1: var(--color-bg-secondary);

  /* Nivel 2 — bottom sheets, dropdowns */
  --elevation-2: var(--color-bg-tertiary);

  /* Sombra sutil (solo para elementos flotantes sobre contenido) */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05);
}
```

---

## Animaciones y transiciones

```css
:root {
  /* Duraciones */
  --duration-fast:    100ms;  /* feedback inmediato (ripple, hover) */
  --duration-normal:  200ms;  /* transiciones de estado */
  --duration-slow:    300ms;  /* entrada de modales, bottom sheets */
  --duration-slower:  400ms;  /* navegación entre pantallas */

  /* Easing */
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);   /* movimientos generales */
  --ease-out:    cubic-bezier(0, 0, 0.2, 1);      /* entrada de elementos */
  --ease-in:     cubic-bezier(0.4, 0, 1, 1);      /* salida de elementos */
}

/* Respeta la preferencia del usuario */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```