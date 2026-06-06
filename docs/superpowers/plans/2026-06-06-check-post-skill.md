# check-post Skill: Script-Assisted Validation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the broken `check-post` skill with a script-assisted validator (`validate.js`) that checks frontmatter conventions, resolves asset paths, and integrates `astro check` — with a corrected SKILL.md that removes the wrong kebab-case tag advice.

**Architecture:** `validate.js` performs all deterministic checks (required fields, allowed category values, Title Case tags, asset resolution, path convention, future-date detection) and outputs structured JSON. The rewritten SKILL.md instructs Claude to run the script, present the report, then always run `npx astro check`. The skill does not apply any fixes.

**Tech Stack:** Node.js 22 (ES modules, `"type": "module"` in project `package.json`), native `fs`, `path`, and `child_process` modules only.

---

### Task 1: Write `validate.js`

**Files:**
- Create: `.claude/skills/check-post/scripts/validate.js`

- [ ] **Step 1: Create the scripts directory**

```bash
mkdir -p .claude/skills/check-post/scripts
```

- [ ] **Step 2: Write `validate.js`**

Create `.claude/skills/check-post/scripts/validate.js` with the following content:

```js
import { readFileSync, existsSync } from 'fs'
import { readdirSync } from 'fs'
import { join, relative } from 'path'
import { execSync } from 'child_process'

const root = process.cwd()
const postsDir = join(root, 'src/content/posts')
const publicDir = join(root, 'public')

const ALLOWED_CATEGORIES = new Set(['General', 'Java', 'JavaScript', 'Other', 'Tutorials', 'Cloud'])

function walkDir(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const fullPath = join(dir, entry.name)
    return entry.isDirectory() ? walkDir(fullPath) : [fullPath]
  })
}

function parseInlineArray(str) {
  return str
    .replace(/^\[|\]$/g, '')
    .split(',')
    .map(s => s.trim().replace(/^["']|["']$/g, ''))
    .filter(Boolean)
}

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return {}
  const fields = {}
  for (const line of match[1].split('\n')) {
    const m = line.match(/^(\w+):\s*(.+)$/)
    if (!m) continue
    const [, key, rawValue] = m
    fields[key] = rawValue.startsWith('[')
      ? parseInlineArray(rawValue)
      : rawValue.replace(/^["']|["']$/g, '').trim()
  }
  return fields
}

function isTitleCase(tag) {
  return tag === tag.split(' ').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')
}

function findBySlug(slug) {
  const allMds = walkDir(postsDir).filter(f => f.endsWith('index.md'))
  return allMds.filter(f => {
    const dir = f.replace(/[/\\]index\.md$/, '')
    return dir.toLowerCase().includes(slug.toLowerCase())
  })
}

function autoDetect() {
  let output
  try {
    output = execSync('git status --porcelain', { cwd: root, encoding: 'utf-8' })
  } catch {
    return { path: null, error: 'Could not run git status' }
  }
  const matches = output
    .split('\n')
    .filter(l => l.trim())
    .map(l => l.slice(3).trim())
    .filter(f => !f.includes(' -> ') && f.startsWith('src/content/posts/') && f.endsWith('.md'))
  if (matches.length === 1) return { path: join(root, matches[0]), error: null }
  return { path: null, error: 'Could not auto-detect post. Provide a path or slug.' }
}

function resolvePost(arg) {
  if (!arg) return autoDetect()
  if (arg.endsWith('.md') || arg.endsWith('index.md')) {
    const abs = arg.startsWith('/') ? arg : join(root, arg)
    return { path: abs, error: null }
  }
  const matches = findBySlug(arg)
  if (matches.length === 1) return { path: matches[0], error: null }
  if (matches.length > 1) {
    return {
      path: null,
      error: `Multiple posts match "${arg}":\n${matches.map(f => relative(root, f)).join('\n')}`,
    }
  }
  return { path: null, error: `No post found matching "${arg}"` }
}

const { path: postPath, error: resolveError } = resolvePost(process.argv[2])

if (!postPath) {
  console.error(resolveError)
  process.exit(1)
}

if (!existsSync(postPath)) {
  console.error(`Post file not found: ${postPath}`)
  process.exit(1)
}

const content = readFileSync(postPath, 'utf-8')
const fields = parseFrontmatter(content)
const relPath = relative(root, postPath)

const errors = []
const warnings = []
const info = []

// title
if (!fields.title || String(fields.title).trim() === '') {
  errors.push('title: field is missing or empty')
}

// categories
if (!fields.categories || fields.categories.length === 0) {
  errors.push('categories: field is missing or empty')
} else {
  for (const cat of fields.categories) {
    if (!ALLOWED_CATEGORIES.has(cat)) {
      errors.push(`categories: unknown value "${cat}" (allowed: ${[...ALLOWED_CATEGORIES].join(', ')})`)
    }
  }
}

// tags — Title Case check
if (fields.tags && Array.isArray(fields.tags)) {
  for (const tag of fields.tags) {
    if (!isTitleCase(tag)) {
      const suggested = tag.split(' ').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')
      warnings.push(`tags: "${tag}" should be Title Case (e.g. "${suggested}")`)
    }
  }
}

// featuredImage — resolve /logos/foo.png → public/logos/foo.png
if (fields.featuredImage) {
  const imgPath = join(publicDir, fields.featuredImage.replace(/^\//, ''))
  if (!existsSync(imgPath)) {
    warnings.push(`featuredImage: file not found at public${fields.featuredImage}`)
  }
}

// excerpt
if (!fields.excerpt) {
  warnings.push('excerpt: field is missing')
}

// path structure: src/content/posts/YYYY/YYYY-MM-DD-slug/index.md
const pathMatch = relPath.match(/^src[/\\]content[/\\]posts[/\\](\d{4})[/\\](\d{4}-\d{2}-\d{2}-[^/\\]+)[/\\]index\.md$/)
if (!pathMatch) {
  warnings.push(`path: does not match convention src/content/posts/YYYY/YYYY-MM-DD-slug/index.md`)
} else {
  const dateStr = pathMatch[2].slice(0, 10)
  const postDate = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (postDate > today) {
    info.push(`post is future-dated (${dateStr}) — it will be hidden in production`)
  }
}

console.log(JSON.stringify({ post: relPath, errors, warnings, info }, null, 2))
```

- [ ] **Step 3: Run against a known post to verify output shape**

```bash
node .claude/skills/check-post/scripts/validate.js src/content/posts/2025/2025-02-05-cosmosdb-mongodb-actuator-fix/index.md
```

Expected: valid JSON printed to stdout with four top-level keys: `post`, `errors`, `warnings`, `info`. The `warnings` array should contain at least one entry for `tags: "Spring boot"` (Title Case violation — that post has `"Spring boot"` in its tags). No errors on stderr.

- [ ] **Step 4: Verify slug auto-resolution**

```bash
node .claude/skills/check-post/scripts/validate.js cosmosdb
```

Expected: same output as Step 3 — the script matches `cosmosdb` against the directory name `2025-02-05-cosmosdb-mongodb-actuator-fix` and uses that post.

- [ ] **Step 5: Verify git auto-detect (no argument)**

Add a blank line to a post so it shows up in `git status`, then run with no argument:

```bash
echo "" >> src/content/posts/2025/2025-02-05-cosmosdb-mongodb-actuator-fix/index.md
node .claude/skills/check-post/scripts/validate.js
```

Expected: same JSON output — script auto-detected the modified file. After confirming, revert the change:

```bash
git checkout -- src/content/posts/2025/2025-02-05-cosmosdb-mongodb-actuator-fix/index.md
```

- [ ] **Step 6: Verify JSON structure with assertions**

```bash
node .claude/skills/check-post/scripts/validate.js src/content/posts/2025/2025-02-05-cosmosdb-mongodb-actuator-fix/index.md | node -e "
const d = JSON.parse(require('fs').readFileSync('/dev/stdin','utf-8'))
console.assert(typeof d.post === 'string', 'post must be string')
console.assert(Array.isArray(d.errors), 'errors must be array')
console.assert(Array.isArray(d.warnings), 'warnings must be array')
console.assert(Array.isArray(d.info), 'info must be array')
console.assert(d.warnings.some(w => w.includes('Spring boot')), 'should flag Spring boot Title Case violation')
console.log('All assertions passed')
"
```

Expected: `All assertions passed`

- [ ] **Step 7: Commit**

```bash
git add .claude/skills/check-post/scripts/validate.js
git commit -m "feat(skill): add validate.js to check-post skill"
```

---

### Task 2: Rewrite `SKILL.md`

**Files:**
- Modify: `.claude/skills/check-post/SKILL.md`

- [ ] **Step 1: Overwrite `SKILL.md` with the updated version**

Replace the entire contents of `.claude/skills/check-post/SKILL.md` with:

````md
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
````

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/check-post/SKILL.md
git commit -m "feat(skill): rewrite check-post skill with script-assisted validation and correct tag convention"
```
