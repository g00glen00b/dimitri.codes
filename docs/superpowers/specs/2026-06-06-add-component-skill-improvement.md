# add-component skill improvement

## Overview

Rewrite the `add-component` SKILL.md to be a comprehensive, accurate briefing document for agents creating Astro components. The skill is agent-invoked (not user-invoked), so the goal is correctness and completeness — agents read it once and have everything they need.

The current skill has a critical mismatch with the codebase: its template shows a scoped `<style>` block, but all components use Tailwind exclusively. It also lacks the design token vocabulary and neo-brutalism visual patterns agents need to produce consistent components.

## Files

```
.claude/skills/add-component/SKILL.md  (rewrite)
```

No scripts needed — this is a reference document, not a workflow.

## Section 1: Code conventions

- **Location**: `src/components/{ComponentName}.astro`, PascalCase filename
- **Props**: `export interface Props` (not `interface Props`), no `any`, explicit types on every prop
- **Optional props**: `?` suffix + destructuring default (e.g. `const { href = '#' } = Astro.props`)
- **Prettier**: no semicolons, single quotes, trailing commas
- **No `<style>` blocks**: never — not even scoped. Tailwind is the only styling mechanism.
- **Check first**: read `src/components/` for existing patterns before inventing new ones

Corrected template:

```astro
---
export interface Props {
  label: string
  href?: string
}

const { label, href = '#' } = Astro.props
---

<div class="...">
  <!-- content -->
</div>
```

## Section 2: Design tokens

All defined in `src/styles/global.css` via `@theme` and available as Tailwind classes.

### Colors

| Class | Use case |
|---|---|
| `text-ink` / `bg-ink` | Structural dark: borders, text, shadow fills |
| `text-primary` / `bg-primary` | Brand blue: header backgrounds, logo, main headings |
| `text-primary-light` / `bg-primary-light` | Muted labels, subdued text |
| `text-secondary` / `bg-secondary` | Orange: accents, category badges, hover highlights |
| `text-secondary-light` / `bg-secondary-light` | Lighter orange |
| `bg-accent` | Yellow: interactive highlights (e.g. button hover background) |
| `bg-bg` | White: card and element backgrounds |
| `bg-bg-muted` | Light grey: page background |

### Shadows

Solid offset shadows in ink color, increasing size:

- `shadow-brut-xs` — 2px offset
- `shadow-brut-sm` — 4px offset
- `shadow-brut-md` — 6px offset
- `shadow-brut-lg` — 8px offset

### Typography

- `font-sans` — body copy (Roboto)
- `font-heading` — headings, labels, buttons (Montserrat)

### Layout

- `max-w-content` — 950px content width

## Section 3: Neo-brutalism patterns

### Offset shadow

The signature effect: a `relative` wrapper with an `absolute` ink-colored div behind the element.

```astro
<div class="relative">
  <div class="absolute inset-0 translate-x-2 translate-y-2 bg-ink" aria-hidden="true"></div>
  <div class="relative bg-bg border-2 border-ink ...">
    <!-- content -->
  </div>
</div>
```

The shadow div's translate values determine the visible offset. Use `translate-x-1 translate-y-1` for small elements (buttons), `translate-x-2 translate-y-2` for cards.

### Hover press-in

Clickable elements animate toward their shadow on hover. The translate values must match the shadow div:

```
transition-transform duration-150 hover:translate-x-2 hover:translate-y-2 relative
```

### Borders

`border-2 border-ink` is the standard. Never use `rounded-*` — border-radius is zeroed globally via CSS.

### Headings and labels

`font-heading font-bold uppercase tracking-widest` for any heading-style or button text.
