# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server at http://localhost:4321
npm run build     # Type-check (astro check) then build for production
npm run preview   # Preview production build locally
```

No test suite exists. The build command (`astro check && astro build`) is the primary correctness check.

Node version: 22.12.0 (see `.nvmrc`).

## Architecture

This is a personal blog (dimitri.codes) built with **Astro** and TypeScript. It is a static site with no backend.

### Content

Blog posts live in `src/content/posts/` as Markdown files, organized by year (`YYYY/YYYY-MM-DD-slug.md`). The Astro content collection schema is defined in `src/content.config.ts`. Future-dated posts are hidden in production but visible in dev mode.

Post frontmatter fields: `title` (required), `categories`, `tags`, `excerpt`, `featuredImage`.

### Data flow

`src/utils/post.ts` is the core data layer:
- `mapToSortedPosts()` — converts collection entries to `Post` objects, sorted newest-first
- `mapToCollectionPosts()` — groups posts by category/tag and paginates them
- `sliceIntoPages()` — splits arrays into `CollectionPage` objects (from `src/models/`)
- `kebabCase()` — converts category/tag names to URL-safe slugs used in routes

Pages under `src/pages/` consume these utilities directly; there is no separate API layer.

### Routing

- `src/pages/[...post].astro` — individual post pages (dynamic route from content collection)
- `src/pages/posts/index.astro` — paginated post listing
- `src/pages/category/[category].astro` and `src/pages/tag/[tag].astro` — filtered/paginated listings
- `src/pages/rss.xml.ts`, `src/pages/manifest.json.ts`, `src/pages/favicon-[size].png.ts` — generated assets
- `src/pages/social/` — social card images generated at build time via Canvas (`src/utils/image.ts`)

### Key conventions

- **Prettier**: no semicolons, LF line endings, single quotes, trailing commas (ES5). Run `npx prettier --write` if needed.
- **TypeScript**: strict mode (`astro/tsconfigs/strict`). All models are in `src/models/`.
- **Styling**: scoped Astro component styles + CSS custom properties defined in `src/styles/global.css`. No CSS framework.
- **Components**: `SiteLayout.astro` is the root layout wrapper. `PostCard.astro` renders post previews.
- **Site config**: all site-level constants (title, URL, page size, social links) live in `src/config/config.ts` and are exported as `CONFIG`.

### Deployment

Netlify hosts the site. `.github/workflows/deploy.yaml` triggers a Netlify build hook daily at 3 PM UTC on weekdays via the `NETLIFY_BUILD_HOOK` secret — no code changes needed for scheduled rebuilds.
