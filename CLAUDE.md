# CLAUDE.md

For coding tasks (components, pages, utilities, bug fixes), load the `astro-dev` skill. Use `add-component` when creating a new Astro component.

For content tasks, use the dedicated skills: `new-post`, `check-post`, `tag-cleanup`, or `social-card-preview`.

## Content model

Posts live in `src/content/posts/YYYY/YYYY-MM-DD-slug/index.md`. Schema is in `src/content.config.ts`. Future-dated posts are hidden in production but visible in dev.
