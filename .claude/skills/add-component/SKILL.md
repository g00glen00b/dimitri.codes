---
name: add-component
description: Create a new Astro component for the dimitri.codes blog with TypeScript props, scoped styles, and correct project conventions. Use when the user wants to add a component, create a new UI element, or build a reusable Astro component.
---

# Add Component

## Quick start

Given a component name and purpose, create `src/components/{ComponentName}.astro`.

## Workflow

1. **Name** — PascalCase filename, e.g. `TagBadge.astro`
2. **Props interface** — define in the frontmatter script block with explicit types
3. **Template** — semantic HTML with class names matching the component name
4. **Scoped styles** — use `<style>` (not global); reference CSS custom properties from `src/styles/global.css`

## Template

```astro
---
interface Props {
  label: string
  href?: string
}

const { label, href } = Astro.props
---

<div class="component-name">
  <!-- content -->
</div>

<style>
  .component-name {
    /* use var(--token) from global.css */
  }
</style>
```

## Rules

- No semicolons, single quotes, trailing commas (Prettier config for this project)
- All props must have explicit TypeScript types — no `any`
- Optional props need a `?` and a default value via destructuring
- Scoped `<style>` only — never `<style is:global>` unless deliberately overriding
- CSS custom properties live in `src/styles/global.css`; read it before picking token names
- Check `src/components/` for existing patterns before inventing new ones
