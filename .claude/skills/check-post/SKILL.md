---
name: check-post
description: Validate a blog post's frontmatter, resolve asset paths, and run astro check to catch type errors. Use when the user wants to verify a post is valid, check frontmatter, or validate before committing a new post.
---

# Check Post

## Quick start

Given a post path (or "the current post"), validate it end-to-end before committing.

## Workflow

1. **Read the post file** — parse frontmatter fields
2. **Frontmatter checks**:
   - `title` is present and non-empty (required)
   - `excerpt` is present and is a single sentence (warn if missing)
   - `categories` entries use Title Case
   - `tags` entries use kebab-case (lowercase, hyphens)
   - `featuredImage` path resolves relative to the post folder (warn if declared but file missing)
3. **Path check** — confirm the file is under `src/content/posts/YYYY/YYYY-MM-DD-slug/index.md`; warn if the date prefix is future-dated (post will be hidden in production)
4. **Type check** — run `npm run build` (which runs `astro check && astro build`) or just `npx astro check` if the user wants a faster check

```bash
npx astro check
```

5. **Report** — summarise: ✓ passed checks, ⚠ warnings (non-blocking), ✗ errors (blocking)

## Common issues

| Issue | Fix |
|---|---|
| `featuredImage` points to missing file | Add the image or remove the field |
| Tags in Title Case | Lowercase and hyphenate |
| Post not appearing in dev | Check date — future dates are hidden |
| `astro check` type error | Read the error and fix the offending `.astro` or `.ts` file |
