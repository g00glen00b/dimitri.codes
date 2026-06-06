# new-post Skill: Interactive Scaffolding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the static `new-post` skill with a script-assisted, interactive version that collects title, categories, tags, and featuredImage conversationally before creating the post file.

**Architecture:** Two Node.js scripts own all deterministic work — `context.js` reads the filesystem for grounding data, `create.js` handles slug generation, path construction, and file creation. The updated SKILL.md instructs Claude to run `context.js` first, conduct the step-by-step conversation, then invoke `create.js` with collected inputs as a single JSON argument.

**Tech Stack:** Node.js 22 (ES modules, `"type": "module"` in project `package.json`), native `fs` and `path` modules only — no external dependencies.

---

### Task 1: Write `context.js`

**Files:**
- Create: `.claude/skills/new-post/scripts/context.js`

- [ ] **Step 1: Create the scripts directory**

```bash
mkdir -p .claude/skills/new-post/scripts
```

- [ ] **Step 2: Write `context.js`**

Create `.claude/skills/new-post/scripts/context.js`:

```js
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'

const root = process.cwd()
const postsDir = join(root, 'src/content/posts')
const logosDir = join(root, 'public/logos')

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

function extractField(content, field) {
  const match = content.match(new RegExp(`^${field}:\\s*(\\[.+?\\])`, 'm'))
  return match ? parseInlineArray(match[1]) : []
}

const categoryCount = {}
const tagCount = {}

for (const file of walkDir(postsDir).filter(f => f.endsWith('.md'))) {
  const content = readFileSync(file, 'utf-8')
  for (const c of extractField(content, 'categories')) {
    categoryCount[c] = (categoryCount[c] ?? 0) + 1
  }
  for (const t of extractField(content, 'tags')) {
    tagCount[t] = (tagCount[t] ?? 0) + 1
  }
}

const categories = Object.keys(categoryCount).sort()
const tags = Object.entries(tagCount)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 30)
const logos = readdirSync(logosDir)
  .filter(f => /\.(png|jpe?g|svg)$/i.test(f))
  .sort()

console.log(JSON.stringify({ categories, tags, logos }, null, 2))
```

- [ ] **Step 3: Run to verify output**

```bash
node .claude/skills/new-post/scripts/context.js
```

Expected: valid JSON printed to stdout with three keys:
- `categories`: sorted array of strings, e.g. `["General", "Java", "JavaScript", "Other", "Tutorials"]`
- `tags`: array of `[name, count]` pairs sorted by count descending, e.g. `[["Spring", 45], ["Spring Boot", 38], ...]`
- `logos`: sorted array of filenames, e.g. `["angular.png", "angularjs.png", ...]`

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/new-post/scripts/context.js
git commit -m "feat(skill): add context.js to new-post skill"
```

---

### Task 2: Write `create.js`

**Files:**
- Create: `.claude/skills/new-post/scripts/create.js`

- [ ] **Step 1: Write `create.js`**

Create `.claude/skills/new-post/scripts/create.js`:

```js
import { mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'of', 'in', 'on', 'at', 'to', 'for',
  'with', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'be', 'by',
])

function toSlug(title) {
  return title
    .toLowerCase()
    .split(/\s+/)
    .filter(word => !STOP_WORDS.has(word))
    .join('-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function todayDate() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function formatArray(arr) {
  return '[' + arr.map(item => `"${item}"`).join(', ') + ']'
}

const input = JSON.parse(process.argv[2])
const { title, categories, tags, featuredImage } = input

const slug = toSlug(title)
const date = todayDate()
const year = date.slice(0, 4)
const dir = join(process.cwd(), 'src/content/posts', year, `${date}-${slug}`)
const file = join(dir, 'index.md')

const lines = ['---', `title: "${title}"`]
if (featuredImage) lines.push(`featuredImage: "${featuredImage}"`)
lines.push(`categories: ${formatArray(categories)}`)
lines.push(`tags: ${formatArray(tags)}`)
lines.push('---', '')

mkdirSync(dir, { recursive: true })
writeFileSync(file, lines.join('\n'))
console.log(file)
```

- [ ] **Step 2: Run with sample input to verify file creation**

```bash
node .claude/skills/new-post/scripts/create.js '{"title":"Deprecation of RestTemplate","categories":["Java","Tutorials"],"tags":["Spring","Spring Boot"],"featuredImage":"/logos/spring-boot.png"}'
```

Expected: the script prints an absolute path ending in `deprecation-resttemplate/index.md`.

- [ ] **Step 3: Verify the created file content**

Open the printed path and confirm its contents match:

```md
---
title: "Deprecation of RestTemplate"
featuredImage: "/logos/spring-boot.png"
categories: ["Java", "Tutorials"]
tags: ["Spring", "Spring Boot"]
---
```

Key checks:
- Folder name ends in `deprecation-resttemplate` (stop words `of` stripped)
- `featuredImage` appears before `categories` (order matches script)
- Arrays use double quotes with a space after each comma

- [ ] **Step 4: Remove the test post**

```bash
rm -rf "$(node .claude/skills/new-post/scripts/create.js '{"title":"Deprecation of RestTemplate","categories":["Java","Tutorials"],"tags":["Spring","Spring Boot"],"featuredImage":"/logos/spring-boot.png"}' 2>/dev/null | xargs dirname)"
```

Or manually: `rm -rf src/content/posts/YYYY/YYYY-MM-DD-deprecation-resttemplate` (use the year printed in step 2).

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/new-post/scripts/create.js
git commit -m "feat(skill): add create.js to new-post skill"
```

---

### Task 3: Update `SKILL.md`

**Files:**
- Modify: `.claude/skills/new-post/SKILL.md`

- [ ] **Step 1: Overwrite `SKILL.md` with the updated version**

Replace the entire contents of `.claude/skills/new-post/SKILL.md` with:

````md
---
name: new-post
description: Scaffold a new blog post for the dimitri.codes Astro blog interactively — collects title, categories, tags, and featuredImage conversationally then creates the file with correct frontmatter. Use when the user wants to create a new blog post, write a new article, or add a new post to the blog.
---

# New Post

## Quick start

Run the context script immediately when the skill is invoked — before asking anything:

```bash
node .claude/skills/new-post/scripts/context.js
```

Read the JSON output and use `categories`, `tags`, and `logos` to ground all suggestions in the conversation below.

## Conversation flow

Collect all fields before creating any files. One question per message.

1. **Run `context.js`** as above
2. **Ask for the title** — one open question, nothing else
3. **Suggest categories** — pick 1–2 from the `categories` list that fit the title; present as a confirmation:
   > "I'd suggest `["Java", "Tutorials"]` — confirm or change?"
4. **Suggest tags** — propose 3–5: prefer entries from the `tags` list where they fit, add new ones for technologies not yet in the corpus; present as an editable list the user can trim or extend
5. **Suggest featuredImage** — pick the closest match from `logos` based on the primary technology in the tags/title; present the full path and ask to confirm, pick another, or skip:
   > "I'd use `/logos/spring-boot.png` — confirm, pick another, or skip?"
6. **Run `create.js`** with all collected answers as a single JSON argument:

```bash
node .claude/skills/new-post/scripts/create.js '{"title":"...","categories":[...],"tags":[...],"featuredImage":"..."}'
```

Omit `featuredImage` from the JSON object if the user skipped it.

7. **Echo the created file path** — done, no further summary

## Slug convention

Handled automatically by `create.js` — no manual slug work needed:
- Strips stop words: `a, an, the, of, in, on, at, to, for, with, and, or, but, is, are, was, were, be, by`
- Lowercases and hyphenates remaining words, removes non-alphanumeric characters
- Example: `"Deprecation of RestTemplate"` → `deprecation-resttemplate`

## Frontmatter reference

The generated file uses double quotes and inline array style with a space after each comma:

```md
---
title: "Post Title Here"
featuredImage: "/logos/spring-boot.png"
categories: ["Java", "Tutorials"]
tags: ["Spring", "Spring Boot"]
---
```

- `excerpt` is omitted — it is written after the post is complete
- `featuredImage` is an absolute path under `/logos/`; omit the field entirely if the user skips it
- Tags use Title Case display form (e.g. `"Spring Boot"`), not kebab-case
````

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/new-post/SKILL.md
git commit -m "feat(skill): update new-post skill with interactive conversation flow and accurate conventions"
```
