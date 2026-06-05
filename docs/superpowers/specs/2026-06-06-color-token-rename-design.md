# Color Token Rename Design

**Date:** 2026-06-06
**Status:** Approved

## Summary

Rename the CSS color tokens and all Tailwind utility references to reflect the actual role each color plays in the design: navy stays as `primary`, orange moves from `accent` to `secondary`, and yellow (`#ffdb33`) becomes the new `accent`. The unused teal `secondary` token is removed.

## Token Changes

| Current token | New token | Value | Notes |
|---|---|---|---|
| `--color-primary` | `--color-primary` | `#2d3452` | Unchanged |
| `--color-primary-light` | `--color-primary-light` | `#9c9fbd` | Unchanged |
| `--color-accent` | `--color-secondary` | `#f0803c` | Orange — rename only |
| `--color-accent-light` | `--color-secondary-light` | `#facdb3` | Light orange — rename only |
| `--color-secondary` | *(removed)* | `#60a5b4` | Teal — unused, delete |
| *(hardcoded `#ffdb33`)* | `--color-accent` | `#ffdb33` | Yellow — promote to token |

Tint naming convention: `*-light` / `*-dark` suffix, consistent with existing `primary-light`.

## Utility Class Renames

All Tailwind utility references to `accent` are renamed to `secondary`, and all hardcoded `#ffdb33` values are replaced with `accent`.

| Old class | New class |
|---|---|
| `bg-accent` | `bg-secondary` |
| `bg-accent-light` | `bg-secondary-light` |
| `text-accent` | `text-secondary` |
| `border-accent` | `border-secondary` |
| `hover:bg-accent` | `hover:bg-secondary` |
| `hover:text-accent` | `hover:text-secondary` |
| `hover:border-accent` | `hover:border-secondary` |
| `focus:border-accent` | `focus:border-secondary` |
| `hover:bg-[#ffdb33]` | `hover:bg-accent` |
| `bg-[#ffdb33]` | `bg-accent` |

## Files Affected

- `src/styles/global.css` — `@theme` block and `var(--color-accent)` references in rules
- `src/components/BandContainer.astro`
- `src/components/AboutHeadline.astro`
- `src/components/Footer.astro`
- `src/components/PageTitle.astro`
- `src/components/SocialLinks.astro`
- `src/components/PostCard.astro`
- `src/components/Header.astro`
- `src/components/ContentLinks.astro`
- `src/pages/contact.astro`
- `src/pages/category/[category].astro`
- `src/pages/category/[category]/page/[page].astro`
- `src/pages/tag/[tag].astro`
- `src/pages/tag/[tag]/page/[page].astro`

## Out of Scope

- Visual changes to any element — this is a rename only, no color values change
- Adding an `accent-light` variant for yellow — deferred until needed
