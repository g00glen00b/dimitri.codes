---
name: add-component
description: Create a new Astro component for the dimitri.codes blog with TypeScript props, Tailwind styling, and correct project conventions. Use when the user wants to add a component, create a new UI element, or build a reusable Astro component.
---

# Add Component

## Quick start

Create `src/components/{ComponentName}.astro`. PascalCase filename. Check `src/components/` for existing patterns before inventing new ones.

## Code conventions

- `export interface Props` with explicit TypeScript types — no `any`
- Optional props: `?` suffix + default via destructuring
- Prettier: no semicolons, double quotes, trailing commas
- **Never use `<style>`** — not even scoped. Tailwind is the only styling mechanism.

```astro
---
export interface Props {
  label: string
  href?: string
}

const { label, href = "#" } = Astro.props
---

<div class="...">
  <!-- content -->
</div>
```

## Design tokens

All defined in `src/styles/global.css` via `@theme` and available as Tailwind classes.

### Colors

| Class | Use case |
|---|---|
| `text-ink` / `bg-ink` | Structural dark: borders, text, shadow fills — used almost everywhere |
| `text-primary` / `bg-primary` | Brand blue: header backgrounds, logo, main headings |
| `text-primary-light` / `bg-primary-light` | Muted labels, subdued text |
| `text-secondary` / `bg-secondary` | Orange: accents, category badges, hover highlights |
| `text-secondary-light` / `bg-secondary-light` | Lighter orange |
| `bg-accent` | Yellow: interactive highlights (e.g. button hover background) |
| `bg-bg` | White: card and element backgrounds |
| `bg-bg-muted` | Light grey: page background |

### Shadows

Solid ink-colored offset shadows:

| Class | Offset |
|---|---|
| `shadow-brut-xs` | 2px |
| `shadow-brut-sm` | 4px |
| `shadow-brut-md` | 6px |
| `shadow-brut-lg` | 8px |

### Typography

- `font-sans` — body copy (Roboto)
- `font-heading` — headings, labels, buttons (Montserrat)

### Layout

- `max-w-content` — 950px content width

## Neo-brutalism patterns

### Offset shadow

The signature effect: an `absolute` ink div behind the element creates a solid offset shadow.

```astro
<div class="relative">
  <div class="absolute inset-0 translate-x-2 translate-y-2 bg-ink" aria-hidden="true"></div>
  <div class="relative bg-bg border-2 border-ink ...">
    <!-- content -->
  </div>
</div>
```

Use `translate-x-1 translate-y-1` for small elements (buttons), `translate-x-2 translate-y-2` for cards.

### Hover press-in

Clickable elements animate toward their shadow on hover. The convention differs by element size:

- **Buttons** (shadow uses `translate-x-1`): `hover:translate-x-1 hover:translate-y-1` — presses fully into the shadow
- **Cards** (shadow uses `translate-x-2`): `hover:translate-x-1 hover:translate-y-1` — slides halfway in, shadow remains visible

Always pair with `transition-transform duration-150 relative`. Combine with the offset-shadow pattern above.

### Borders

`border-2 border-ink` is standard. Never use `rounded-*` — border-radius is zeroed globally.

### Headings and labels

`font-heading font-bold uppercase tracking-widest` for any heading-style or button text.
