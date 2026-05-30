# Neo-Brutalism Redesign + Tailwind v4 Migration

**Date:** 2026-05-31  
**Status:** Approved  
**Scope:** Full-site visual redesign in the Bold Neo-Brutalism style (inspired by RetroUI.dev / neubrutalism.com), combined with a complete migration from scoped Astro component styles to Tailwind v4 utility classes.

---

## 1. Technical Setup

### Installation
```bash
npm install tailwindcss@next @tailwindcss/vite
```

### `astro.config.mjs`
Add the Vite plugin (replaces any future `@astrojs/tailwind` usage):
```js
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  vite: { plugins: [tailwindcss()] }
})
```

### `src/styles/global.css`
The existing CSS custom properties become a Tailwind `@theme` block. All existing `var()` references are removed as components are rewritten.

```css
@import "tailwindcss";

@theme {
  --color-primary:       #2d3452;
  --color-primary-light: #9c9fbd;
  --color-accent:        #f0803c;
  --color-accent-light:  #facdb3;
  --color-secondary:     #60a5b4;  /* teal — used for links */
  --color-ink:           #051923;  /* near-black — all borders & shadows */
  --color-bg:            #ffffff;
  --color-bg-muted:      #f3f3f9;

  --font-sans:    'Roboto', sans-serif;
  --font-heading: 'Montserrat', sans-serif;
}
```

These map directly to Tailwind utilities: `bg-primary`, `text-accent`, `border-ink`, `text-secondary`, etc. All component `<style>` blocks are removed; styles move entirely to `class="…"` attributes.

---

## 2. Design Language (Global Rules)

These rules apply consistently across every component. When in doubt, refer to these.

### No border-radius — anywhere
Zero rounding on every element: cards, buttons, inputs, code blocks, images, badges.

### Shadow system — hard offset, no blur
All shadows use the format `Xpx Xpx 0 0 <color>`:

| Name | Value | Used on |
|------|-------|---------|
| `sm` | `4px 4px 0 0 ink` | Buttons, small elements |
| `md` | `6px 6px 0 0 ink` | Medium components |
| `lg` | `8px 8px 0 0 ink` | Post cards (default state) |

### Hover interaction
All shadowed elements shift on hover: `translate(Xpx, Xpx)` by the shadow size, shadow disappears. Transition: `0.1s ease`.

```
default:  box-shadow: 8px 8px 0 0 ink;  transform: none;
hover:    box-shadow: none;              transform: translate(8px, 8px);
```

### Borders
`2px solid ink` on all interactive/card elements. Dividers use `3px solid ink`.

### Typography
- **Headings:** Montserrat, weight 800. Section headings: `2rem`, regular case, no border — weight alone provides hierarchy.
- **Body:** Roboto, weight 400.
- **Labels / metadata:** Roboto, weight 700, uppercase, wide tracking.
- **Buttons / nav:** Montserrat, weight 700, uppercase, wide tracking.

### Emphasis text (`<strong>` inside headings)
Accent-light fill + 3px accent underline border, no border-radius:
```
background: accent-light (#facdb3)
border-bottom: 3px solid accent (#f0803c)
padding: 0 4px
```
On accent-light backgrounds (hero band), the fill blends in and only the underline reads — this is intentional.

### Buttons
Three variants, all share: Montserrat 700, uppercase, `2px solid ink` border, `4px ink` shadow, 0.1s ease hover translate.

| Variant | Background | Text |
|---------|-----------|------|
| Ghost | `bg` (white) | ink |
| Primary | primary (navy) | white |
| Accent | accent (orange) | ink |

Small variant (`btn-sm`): reduced padding, `3px` shadow.

### Category / tag labels
Inline pill badges, no border-radius, `1.5px solid ink` border, uppercase, tight tracking:
- **Categories:** accent fill, ink text
- **Tags:** primary fill, white text

### Links in content
`text-secondary` (teal), no underline by default, `2px solid secondary` underline on hover, `0.1s` transition.

### Inline code
`bg-muted` fill, `1.5px solid ink` border, Roboto Mono, no border-radius.

### Blockquotes
`6px solid accent` left border, `2px solid ink` border on all sides, `4px ink` shadow.

### Dividers
Full-width `3px solid ink` horizontal rules used as structural separators (hero-to-content, footer rows).

---

## 3. Layout & Page Structure

### Top band (homepage only)
The accent-light colour (`#facdb3`) runs full-width from the very top of the page through the end of the hero section. The header box and hero content both sit inside this band. A full-width `3px solid ink` divider closes the band.

```
┌─────────────────────────────────────────┐  ← accent-light band
│  ┌─────────────────────────────────┐    │
│  │  [logo]          [nav links]    │    │  ← white header box (2px ink border + 4px shadow)
│  └─────────────────────────────────┘    │
│                                         │
│  👋 Hello, I'm Dimitri                  │
│  I love [tinkering with code], and...   │  ← hero headline (em: accent-light + accent underline)
│  [check my tutorials →]                 │  ← ghost button
│                                         │
├─────────────────────────────────────────┤  ← 3px ink divider
│  Recent posts                           │  ← 2rem Montserrat 800, regular case
│  ┌──────────┐ ┌──────────┐             │
│  │ [card]   │ │ [card]   │             │  ← 2-column card grid
│  └──────────┘ └──────────┘             │
│             [page 1 of 12]  [older →]  │  ← pagination
└─────────────────────────────────────────┘
```

On non-home pages the top band only contains the header (no hero).

### Container
Max-width `950px`, `1rem` horizontal padding, centred. Unchanged from current.

---

## 4. Component Redesigns

### Header (`Header.astro`)
- Wrapping element gets `background: accent-light` (the band)
- Inner `<header>` element: white box, `2px solid ink` border, `4px 4px 0 0 ink` shadow
- Logo: Montserrat 900, primary colour
- Nav links: lowercase, `700` weight, accent colour + `2px solid accent` underline on hover/active, `0.1s` transition
- Mobile: stack logo above nav, centred

### Hero / About Headline (`AboutHeadline.astro`)
- Sits inside the accent-light band
- `<h1>`: Montserrat 800, `2.8rem`, `line-height: 1.25`
- `<strong>` uses the emphasis style (accent-light + accent underline)
- Greeting `<small>`: Montserrat 700, `1.3rem`

### CTA Banner (`VisitBlogBanner.astro`)
- Ghost button: white bg, ink border + shadow, uppercase Montserrat 700

### Post Card (`PostCard.astro`)
- No border-radius
- `2px solid ink` border, `8px 8px 0 0 ink` shadow
- Hover: `translate(4px, 4px)`, shadow reduces to `4px 4px 0 0 ink`
- Header section: primary fill, `2px solid ink` border-bottom
  - Category: accent pill label (accent fill, ink border, uppercase)
  - Title: Montserrat 800, white
  - Date: primary-light, small
- Body section: white, Roboto, muted ink text
  - "Read more →": uppercase, `2px solid accent` underline

### Page Title (`PageTitle.astro`) — post detail header
- Keep existing offset shadow structure, update to new shadow system (`8px 8px 0 0 ink`)
- `2px solid ink` border all sides
- Tags rendered as primary-fill pill labels

### Section Headings
Any `<h2>` used as a section label (e.g. "Recent posts", "All tutorials"): Montserrat 800, `2rem`, regular case, no border, `margin-bottom: 1.5rem`.

### Pagination (`Pagination.astro`)
- Prev / next: ghost button (sm variant)
- Page counter: Montserrat 700 uppercase, `2px solid ink` border, white fill — not a button, purely informational

### Content styles (`ContainerContent.astro`)
Update global content styles:
- Remove all `border-radius` from `pre`, `td`, inline code
- `pre` (code blocks): keep One Dark theme, `2px solid ink` border
- Inline `code`: `bg-muted`, `1.5px solid ink` border
- `blockquote`: `6px solid accent` left + `2px solid ink` all sides + `4px ink` shadow
- Table rows: `2px solid ink` border, no rounded cells
- Links: `text-secondary`, accent underline on hover

### Footer (`Footer.astro`)
- White background, `3px solid ink` top border
- Upper row (constrained to container): social icons + footer links, `1.5rem` vertical padding
  - Social icons: `32×32px`, white bg, `2px solid ink` border, `2px ink` shadow; accent fill on hover with shadow collapse
  - Links: Montserrat 700, uppercase, accent underline on hover
- Full-width `3px solid ink` divider between rows
- Lower row (constrained to container): Montserrat 700, uppercase, right-aligned, `#888` colour
  - Heart: accent colour

### Site Layout (`SiteLayout.astro`)
- Remove the `import "../styles/global.css"` and `import "../styles/OneDark.css"` lines — global styles are now imported via the Tailwind entry point in `global.css`
- Body background: `bg-muted` (`#f3f3f9`)
- No other structural changes — slot, Header, Footer positions unchanged

### Not Found (`NotFoundBox.astro`)
- `404` numeral: Montserrat 900, large, primary colour (replace current grey)
- Subtitle: Roboto, regular weight
- Link: ghost button

---

## 5. Pages in Scope

| Page | Notes |
|------|-------|
| `index.astro` | Homepage — full top band (header + hero) |
| `posts/index.astro` | Post listing — header band only, section heading, cards, pagination |
| `category/[category].astro` | Same structure as posts listing |
| `tag/[tag].astro` | Same structure as posts listing |
| `[...post].astro` | Post detail — PageTitle + markdown content |
| `about-me.md` / `speaking.md` | Markdown pages — header + markdown content styles |
| `404.astro` | Updated NotFoundBox |

Social card images (`src/pages/social/`) and generated assets (`rss.xml.ts`, `manifest.json.ts`, favicon pages) are not in scope — no visual changes needed.

---

## 6. Out of Scope

- Dark mode
- Any new pages or routes
- Changes to content (posts, frontmatter schema)
- Analytics, comments (Utterances), or SEO metadata
- Social card image generation (`src/utils/image.ts`)
