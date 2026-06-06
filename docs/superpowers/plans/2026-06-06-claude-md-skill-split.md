# CLAUDE.md Skill Split Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move all coding context out of `CLAUDE.md` into a new `astro-dev` skill, leaving `CLAUDE.md` as a thin router.

**Architecture:** Create one new skill file at `.claude/skills/astro-dev/SKILL.md` containing everything coding-related from the current `CLAUDE.md`. Replace `CLAUDE.md` with a stub that routes to the right skill by task type.

**Tech Stack:** Markdown only — no code changes.

---

## File map

| Action | Path |
|--------|------|
| Create | `.claude/skills/astro-dev/SKILL.md` |
| Replace | `CLAUDE.md` |

---

### Task 1: Create the astro-dev skill

**Files:**
- Create: `.claude/skills/astro-dev/SKILL.md`

- [ ] **Step 1: Create the skill file**

Create `.claude/skills/astro-dev/SKILL.md` with this exact content:

```markdown
---
name: astro-dev
description: Full coding context for the dimitri.codes Astro blog — commands, architecture, data flow, routing, conventions, and deployment. Load before writing code, reviewing changes, or discussing project conventions.
---

# Astro Dev

## Commands

​```bash
npm run dev       # Start dev server at http://localhost:4321
npm run build     # Type-check (astro check) then build for production
npm run preview   # Preview production build locally
​```

No test suite exists. The build command (`astro check && astro build`) is the primary correctness check.

Node version: 22.12.0 (see `.nvmrc`).

## Architecture

This is a personal blog (dimitri.codes) built with **Astro** and TypeScript. It is a static site with no backend.

## Data flow

`src/utils/post.ts` is the core data layer:
- `mapToSortedPosts()` — converts collection entries to `Post` objects, sorted newest-first
- `mapToCollectionPosts()` — groups posts by category/tag and paginates them
- `sliceIntoPages()` — splits arrays into `CollectionPage` objects (from `src/models/`)
- `kebabCase()` — converts category/tag names to URL-safe slugs used in routes

Pages under `src/pages/` consume these utilities directly; there is no separate API layer.

## Routing

- `src/pages/[...post].astro` — individual post pages (dynamic route from content collection)
- `src/pages/posts/index.astro` — paginated post listing
- `src/pages/category/[category].astro` and `src/pages/tag/[tag].astro` — filtered/paginated listings
- `src/pages/rss.xml.ts`, `src/pages/manifest.json.ts`, `src/pages/favicon-[size].png.ts` — generated assets
- `src/pages/social/` — social card images generated at build time via Canvas (`src/utils/image.ts`)

## Conventions

- **Prettier**: no semicolons, LF line endings, single quotes, trailing commas (ES5). Run `npx prettier --write` if needed.
- **TypeScript**: strict mode (`astro/tsconfigs/strict`). All models are in `src/models/`.
- **Styling**: scoped Astro component styles + CSS custom properties defined in `src/styles/global.css`. No CSS framework.
- **Components**: `SiteLayout.astro` is the root layout wrapper. `PostCard.astro` renders post previews.
- **Site config**: all site-level constants (title, URL, page size, social links) live in `src/config/config.ts` and are exported as `CONFIG`.

## Deployment

Netlify hosts the site. `.github/workflows/deploy.yaml` triggers a Netlify build hook daily at 3 PM UTC on weekdays via the `NETLIFY_BUILD_HOOK` secret — no code changes needed for scheduled rebuilds.
```

- [ ] **Step 2: Verify the file was created**

```bash
cat .claude/skills/astro-dev/SKILL.md
```

Expected: file content printed with frontmatter and all sections visible.

---

### Task 2: Replace CLAUDE.md with the stub

**Files:**
- Replace: `CLAUDE.md`

- [ ] **Step 1: Overwrite CLAUDE.md**

Replace the entire contents of `CLAUDE.md` with:

```markdown
# CLAUDE.md

For coding tasks (components, pages, utilities, bug fixes), load the `astro-dev` skill. Use `add-component` when creating a new Astro component.

For content tasks, use the dedicated skills: `new-post`, `check-post`, `tag-cleanup`, or `social-card-preview`.

## Content model

Posts live in `src/content/posts/YYYY/YYYY-MM-DD-slug/index.md`. Schema is in `src/content.config.ts`. Future-dated posts are hidden in production but visible in dev.
```

- [ ] **Step 2: Verify CLAUDE.md**

```bash
cat CLAUDE.md
```

Expected: only the stub content — no architecture, routing, or conventions sections.

---

### Task 3: Commit

**Files:**
- `.claude/skills/astro-dev/SKILL.md`
- `CLAUDE.md`

- [ ] **Step 1: Stage and commit**

```bash
git add .claude/skills/astro-dev/SKILL.md CLAUDE.md
git commit -m "refactor: slim CLAUDE.md and move coding context to astro-dev skill"
```

Expected: commit succeeds, 2 files changed.
