---
name: frontend-ui
description: Use this skill when building or modifying UI components, pages, or styles in Zitly. Covers design tokens, Tailwind v4 patterns, and component conventions.
---

# Frontend UI in Zitly

## Design tokens (OKLCH)

| Token         | Value                    |
| ------------- | ------------------------ |
| `brand-green` | `oklch(0.38 0.1 155)`    |
| `brand-cream` | `oklch(0.985 0.005 145)` |
| `brand-ink`   | `oklch(0.12 0.01 60)`    |
| `brand-muted` | `oklch(0.45 0.05 155)`   |
| `--radius`    | `0.25rem`                |

## Fonts (CSS vars)

- `--font-display` → Playfair Display
- `--font-sans` → DM Sans → Geist Sans → Arial
- `--font-mono` → JetBrains Mono

## Tailwind v4 — breaking changes

```css
/* ✅ Correct */
bg-linear-to-r from-brand-green to-brand-muted

/* ❌ Wrong — Tailwind v3 syntax, breaks here */
bg-gradient-to-r from-brand-green to-brand-muted
```

## Component conventions

- Conditional classes: always use `cn()` from `src/lib/utils.ts`
- Client components: only when using hooks, event handlers, or browser APIs
- Server components: default for everything else — no `'use client'` unless needed
- No explicit `import React` — not needed

## Accessibility

- Interactive elements need `aria-label` when icon-only
- Form inputs need associated `<label>`
- Error messages need `role="alert"`
