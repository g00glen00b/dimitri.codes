# Design: Slim CLAUDE.md via astro-dev skill

## Goal

Reduce context loaded on every conversation by moving all coding-specific knowledge out of `CLAUDE.md` into a dedicated `astro-dev` skill. `CLAUDE.md` becomes a thin router.

## Motivation

`CLAUDE.md` is loaded in full on every session regardless of task type. Content-focused tasks (writing posts, auditing tags) pay the token cost for architecture docs, routing tables, and deployment details they never need. Moving that knowledge into a skill means it only loads when explicitly invoked.

## What changes

### `CLAUDE.md` — replaced with a stub

```md
# CLAUDE.md

For coding tasks (components, pages, utilities, bug fixes), load the `astro-dev` skill. Use `add-component` when creating a new Astro component.

For content tasks, use the dedicated skills: `new-post`, `check-post`, `tag-cleanup`, or `social-card-preview`.

## Content model

Posts live in `src/content/posts/YYYY/YYYY-MM-DD-slug/index.md`. Schema is in `src/content.config.ts`. Future-dated posts are hidden in production but visible in dev.
```

The content model section stays in `CLAUDE.md` directly because it is too thin to warrant its own skill — three lines that orient any session touching content without loading a full skill.

### New `.claude/skills/astro-dev/SKILL.md`

Contains everything removed from `CLAUDE.md`:

- Commands (`npm run dev`, `npm run build`, `npm run preview`) and what they do
- Node version (22.12.0) and no-test-suite note
- Architecture overview (Astro + TypeScript, static site, no backend)
- Data flow (`src/utils/post.ts` utilities: `mapToSortedPosts`, `mapToCollectionPosts`, `sliceIntoPages`, `kebabCase`)
- Routing table (all `src/pages/` dynamic and generated routes)
- Key components (`SiteLayout.astro`, `PostCard.astro`) and site config (`CONFIG` from `src/config/config.ts`)
- Prettier config (no semicolons, LF, single quotes, trailing commas ES5)
- TypeScript strict mode, models in `src/models/`
- Styling conventions (scoped styles, CSS custom properties in `src/styles/global.css`)
- Deployment (Netlify, daily build hook via `NETLIFY_BUILD_HOOK`)

Trigger line in skill description: *"Load before writing code, reviewing changes, or discussing project conventions."*

### Existing skills — untouched

`new-post`, `check-post`, `add-component`, `tag-cleanup`, and `social-card-preview` are kept exactly as-is. They remain self-contained with their own task-specific guidance.

## What does NOT change

- No new `blog-context` skill — the content model lines are thin enough to live in `CLAUDE.md` directly
- No changes to existing task skills
- No changes to site code, config, or build pipeline

## Implementation steps

1. Create `.claude/skills/astro-dev/SKILL.md` with the content above
2. Replace `CLAUDE.md` with the stub
3. Commit both changes
