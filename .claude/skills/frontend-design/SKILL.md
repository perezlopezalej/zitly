---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, or applications. Generates creative, polished code that avoids generic AI aesthetics.
license: Complete terms in LICENSE.txt
---

This skill guides creation of distinctive, production-grade frontend interfaces that avoid generic "AI slop" aesthetics. Implement real working code with exceptional attention to aesthetic details and creative choices.

The user provides frontend requirements: a component, page, application, or interface to build. They may include context about the purpose, audience, or technical constraints.

## Design Thinking

Before coding, understand the context and commit to a BOLD aesthetic direction:
- **Purpose**: What problem does this interface solve? Who uses it?
- **Tone**: Pick an extreme: brutally minimal, maximalist chaos, retro-futuristic, organic/natural, luxury/refined, playful/toy-like, editorial/magazine, brutalist/raw, art deco/geometric, soft/pastel, industrial/utilitarian, etc. There are so many flavors to choose from. Use these for inspiration but design one that is true to the aesthetic direction.
- **Constraints**: Technical requirements (framework, performance, accessibility).
- **Differentiation**: What makes this UNFORGETTABLE? What's the one thing someone will remember?

**CRITICAL**: Choose a clear conceptual direction and execute it with precision. Bold maximalism and refined minimalism both work - the key is intentionality, not intensity.

Then implement working code (HTML/CSS/JS, React, Vue, etc.) that is:
- Production-grade and functional
- Visually striking and memorable
- Cohesive with a clear aesthetic point-of-view
- Meticulously refined in every detail

## Frontend Aesthetics Guidelines

Focus on:
- **Typography**: Choose fonts that are beautiful, unique, and interesting. Avoid generic fonts like Arial and Inter; opt instead for distinctive choices that elevate the frontend's aesthetics; unexpected, characterful font choices. Pair a distinctive display font with a refined body font.
- **Color & Theme**: Commit to a cohesive aesthetic. Use CSS variables for consistency. Dominant colors with sharp accents outperform timid, evenly-distributed palettes.
- **Motion**: Use animations for effects and micro-interactions. Prioritize CSS-only solutions for HTML. Use Motion library for React when available. Focus on high-impact moments: one well-orchestrated page load with staggered reveals (animation-delay) creates more delight than scattered micro-interactions. Use scroll-triggering and hover states that surprise.
- **Spatial Composition**: Unexpected layouts. Asymmetry. Overlap. Diagonal flow. Grid-breaking elements. Generous negative space OR controlled density.
- **Backgrounds & Visual Details**: Create atmosphere and depth rather than defaulting to solid colors. Add contextual effects and textures that match the overall aesthetic. Apply creative forms like gradient meshes, noise textures, geometric patterns, layered transparencies, dramatic shadows, decorative borders, custom cursors, and grain overlays.

NEVER use generic AI-generated aesthetics like overused font families (Inter, Roboto, Arial, system fonts), cliched color schemes (particularly purple gradients on white backgrounds), predictable layouts and component patterns, and cookie-cutter design that lacks context-specific character.

Interpret creatively and make unexpected choices that feel genuinely designed for the context. No design should be the same. Vary between light and dark themes, different fonts, different aesthetics. NEVER converge on common choices (Space Grotesk, for example) across generations.

**IMPORTANT**: Match implementation complexity to the aesthetic vision. Maximalist designs need elaborate code with extensive animations and effects. Minimalist or refined designs need restraint, precision, and careful attention to spacing, typography, and subtle details. Elegance comes from executing the vision well.

Remember: Claude is capable of extraordinary creative work. Don't hold back, show what can truly be created when thinking outside the box and committing fully to a distinctive vision.

---

## Zitly Design System

When working on Zitly specifically, use these actual tokens and conventions — do not invent new ones.

### Typography

| Role | CSS var | Font | Usage |
|------|---------|------|-------|
| Display / headings | `--font-display` | Playfair Display (serif) | `font-display` Tailwind class |
| Body / UI | `--font-sans` | DM Sans → Geist Sans → Arial | Default body font |
| Code / data / mono labels | `--font-mono` | JetBrains Mono | `font-mono` class |

Heading scale uses `clamp()`: e.g. `text-[clamp(2.5rem,6vw,6rem)]` for hero H1.

### Color palette (OKLCH tokens — defined in `globals.css` `@theme inline`)

| Token | Value | Usage |
|-------|-------|-------|
| `brand-green` | `oklch(0.38 0.1 155)` | Primary buttons, accents |
| `brand-green-dark` | `oklch(0.30 0.09 155)` | Hover state for primary |
| `brand-green-light` | `oklch(0.77 0.05 155)` | Highlights |
| `brand-green-subtle` | `oklch(0.92 0.02 145)` | Backgrounds, accents |
| `brand-cream` | `oklch(0.985 0.005 145)` | Page background |
| `brand-ink` | `oklch(0.12 0.01 60)` | Dark text, focus ring |
| `brand-muted` | `oklch(0.45 0.05 155)` | Secondary text |
| `brand-border` | `oklch(0.88 0.01 90)` | Borders, inputs |

Always use semantic aliases (`primary`, `background`, `foreground`, `muted-foreground`, `border`) in components — reserve `brand-*` for design documentation.

### Tailwind v4 gradient syntax
Use `bg-linear-to-*` (e.g. `bg-linear-to-r`), **not** `bg-gradient-to-*` (renamed in v4).

### Border radius
`--radius: 0.25rem` — almost flat. Buttons and cards have very tight corners (`rounded-sm` or `rounded`). The nav pill uses `rounded-2xl` as a deliberate exception. Avoid `rounded-xl` or `rounded-3xl` in new components unless matching existing navigation pill style.

### Animation utilities (defined in `globals.css` — use, don't rewrite)
- `.marquee` / `.marquee-reverse` — horizontal scroll loops
- `.line-reveal` — clip-path reveal on load
- `.animate-char-in` — per-character blur+translateY entrance
- `.hover-lift` — spring translateY(-4px) on hover
- `.letter-spin` — rotateY(360deg) on hover
- `.noise-overlay` — SVG noise texture via `::after` pseudo-element
- `.border-sketch` — dashed/hatched decorative border

### Landing layout conventions
- Max content width: `max-w-[1400px]` (nav full-bleed) / `max-w-[1200px]` (nav scrolled pill)
- Horizontal padding: `px-6 lg:px-12`
- Section entrance: `isVisible` state toggled by `requestAnimationFrame` on mount, with `transition-all duration-700` + `opacity-0 translate-y-4` → `opacity-100 translate-y-0`
- Intersection-based reveals: use `useIntersectionObserver` hook from `src/hooks/`
- Staggered animation delays via inline `style={{ transitionDelay: '${i * 75}ms' }}`
