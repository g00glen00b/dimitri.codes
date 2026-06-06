---
name: check-post
description: Validate a blog post's frontmatter, resolve asset paths, and run astro check to catch type errors. Use when the user wants to verify a post is valid, check frontmatter, or validate before committing a new post.
---

# Check Post

## Quick start

Run the validation script, then `astro check`:

```bash
node .claude/skills/check-post/scripts/validate.js [path-or-slug]
npx astro check
```

## Conversation flow

### 1. Determine which post to check

- If the user mentioned a path, slug, or title → pass it to `validate.js`:
  ```bash
  node .claude/skills/check-post/scripts/validate.js 2025-02-05-cosmosdb
  ```
- If nothing was mentioned → call with no argument (git auto-detect):
  ```bash
  node .claude/skills/check-post/scripts/validate.js
  ```
- If `validate.js` exits with code 1 → ask: "Which post should I check?"

### 2. Present the validation report

Parse the JSON output and format it as:

```
Validating src/content/posts/2025/2025-02-05-foo/index.md

✗ Errors (must fix before committing):
  - categories: unknown value "Jva" (allowed: General, Java, JavaScript, Other, Tutorials, Cloud)

⚠ Warnings (non-blocking):
  - tags: "spring boot" should be Title Case (e.g. "Spring Boot")
  - excerpt: field is missing

ℹ Info:
  - post is future-dated (2026-12-01) — it will be hidden in production
```

If all three arrays are empty: "Frontmatter looks good."

Skip any section whose array is empty.

### 3. Run astro check

Always run — regardless of `validate.js` results:

```bash
npx astro check
```

- Exit 0: "Type check passed."
- Exit non-zero: show the error output verbatim

## Tag convention

Tags use **Title Case** matching the technology name: `"Spring Boot"`, `"Node.js"`, `"AngularJS"`. Not kebab-case.

## What this skill does NOT do

- Apply any fixes (reports only — the user decides what to fix)
- Validate post body content
- Detect semantic tag duplicates (use `/tag-cleanup` for that)
