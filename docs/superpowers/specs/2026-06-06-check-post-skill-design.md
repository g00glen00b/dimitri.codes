# check-post skill: script-assisted validation redesign

## Goal

Replace the broken `check-post` skill with a script-assisted validator that correctly checks frontmatter conventions, resolves asset paths, and runs `astro check` — without applying any fixes itself.

## What the current skill gets wrong

- Tags convention is inverted: skill says "kebab-case (lowercase, hyphens)" but real tags use Title Case (`"Spring Boot"`, `"Node.js"`)
- The "Common issues" table says "Tags in Title Case → Lowercase and hyphenate" — this is backwards and actively harmful advice
- No script: Claude reads the file and runs checks mentally, which is error-prone and re-derives conventions each time

## Script: `validate.js`

Lives at `.claude/skills/check-post/scripts/validate.js`. Accepts an optional `path-or-slug` CLI argument.

### Post resolution

Called with no argument:
1. Run `git status --porcelain` and collect lines matching `.md` under `src/content/posts/`
2. If exactly one file found: use it
3. If multiple or none: print nothing to stdout and exit with code 1 — Claude will ask the user

Called with an argument:
1. If argument is an absolute or relative path ending in `.md` or `index.md`: use it directly
2. If argument looks like a slug (`YYYY-MM-DD-slug` or just `slug`): find the matching directory under `src/content/posts/`
3. If the resolved path does not exist: exit with code 1 and a message

### Frontmatter parsing

Parse the YAML frontmatter block between `---` delimiters. Extract all fields. The inline-array format (`tags: ["Spring Boot", "Node.js"]`) is the only format in use.

### Checks

All checks are deterministic — no Claude judgment involved.

| Check | Severity | Rule |
|---|---|---|
| `title` present and non-empty | Error | Required by Astro schema |
| `categories` present | Error | Required for post to appear correctly |
| All `categories` in allowed set | Error | Fixed set: `["General", "Java", "JavaScript", "Other", "Tutorials", "Cloud"]` |
| `tags` entries use Title Case | Warning | `"Spring Boot"` not `"spring-boot"` or `"spring boot"` |
| `featuredImage` file exists | Warning | `/logos/foo.png` → resolves to `public/logos/foo.png` |
| `excerpt` present | Warning | Optional in schema but recommended |
| Path structure matches convention | Warning | Must be `src/content/posts/YYYY/YYYY-MM-DD-slug/index.md` |
| Date in path is future | Info | Future posts are hidden in production but visible in dev |

**Tag Title Case check:** A tag fails if `tag !== tag.split(' ').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')` — simple word-initial capitalisation check. This correctly flags `"spring boot"` and `"Spring boot"` but passes `"Node.js"` and `"AngularJS"` since the first character of every word is already uppercase.

### Output shape

```json
{
  "post": "src/content/posts/2025/2025-02-05-some-post/index.md",
  "errors": [
    "categories: unknown value \"Jva\" (allowed: General, Java, JavaScript, Other, Tutorials, Cloud)"
  ],
  "warnings": [
    "tags: \"spring boot\" should be Title Case (e.g. \"Spring Boot\")",
    "excerpt: field is missing"
  ],
  "info": [
    "post is future-dated (2026-12-01) — it will be hidden in production"
  ]
}
```

Exit code 0 if the post was found and validated (even with errors/warnings). Exit code 1 if the post could not be resolved.

## SKILL.md conversation flow

1. **Determine which post to check:**
   - If the user mentioned a path, slug, or title → pass it to `validate.js`
   - Otherwise → call `validate.js` with no args (git auto-detect)
   - If that exits with code 1 → ask "Which post should I check?"

2. **Run `validate.js [path]`** — parse JSON output

3. **Present the validation report:**
   - `✗ Errors (blocking)` — list all errors
   - `⚠ Warnings (non-blocking)` — list all warnings
   - `ℹ Info` — list info items
   - If all three arrays are empty: "Frontmatter looks good."

4. **Run `npx astro check`** — always, regardless of `validate.js` results

5. **Report `astro check` outcome:**
   - If it exits 0: "Type check passed."
   - If it exits non-zero: show the error output

The skill does **not** apply any fixes. It reports; the user decides what to fix.

## Tag convention (corrected)

Tags use **Title Case** matching the technology name: `"Spring Boot"`, `"Node.js"`, `"AngularJS"`. Not kebab-case. The current skill's advice to lowercase-and-hyphenate is wrong and must be removed.

## Out of scope

- Applying any fixes automatically
- Validating post body content (headings, links, images in the body)
- Checking whether the slug is descriptive or matches the title
- Detecting semantic issues with the tags (duplicates, near-duplicates — that's `tag-cleanup`)
