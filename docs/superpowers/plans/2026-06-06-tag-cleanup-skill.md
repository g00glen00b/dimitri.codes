# tag-cleanup Skill: Script-Assisted Audit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the broken `tag-cleanup` skill with a script-assisted audit that correctly reads inline-array frontmatter, detects three classes of tag issues, suggests canonical forms, and outputs ready-to-use rename commands.

**Architecture:** `audit.js` walks all posts, parses inline-array `tags:` fields, runs three detection passes (case inconsistencies → near-duplicates → low-frequency), and outputs structured JSON. The rewritten `SKILL.md` runs the script on invocation, presents findings interactively, and outputs `sed` commands for confirmed renames — without applying any changes itself.

**Tech Stack:** Node.js 22 (ES modules, `"type": "module"` in `package.json`), native `fs` and `path` modules only.

---

### Task 1: Write `audit.js`

**Files:**
- Create: `.claude/skills/tag-cleanup/scripts/audit.js`

- [ ] **Step 1: Create the scripts directory**

```bash
mkdir -p .claude/skills/tag-cleanup/scripts
```

- [ ] **Step 2: Write `audit.js`**

Create `.claude/skills/tag-cleanup/scripts/audit.js` with the following content:

```js
import { readFileSync, readdirSync, existsSync } from 'fs'
import { join } from 'path'

const root = process.cwd()
const postsDir = join(root, 'src/content/posts')

if (!existsSync(postsDir)) {
  console.error(`Posts directory not found: ${postsDir}`)
  process.exit(1)
}

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

function extractTags(content) {
  const match = content.match(/^tags:\s*(\[.+?\])/ms)
  return match ? parseInlineArray(match[1]) : []
}

// Step 1: collect all tag counts
const tagCount = {}
for (const file of walkDir(postsDir).filter(f => f.endsWith('.md'))) {
  const content = readFileSync(file, 'utf-8')
  for (const tag of extractTags(content)) {
    tagCount[tag] = (tagCount[tag] ?? 0) + 1
  }
}

const allTags = Object.entries(tagCount)

// Step 2: case inconsistencies — same tag, different capitalisation
const caseMap = {}
for (const [tag, count] of allTags) {
  const key = tag.toLowerCase()
  if (!caseMap[key]) caseMap[key] = []
  caseMap[key].push([tag, count])
}
const caseInconsistencies = Object.values(caseMap)
  .filter(variants => variants.length > 1)
  .map(variants => ({ variants: variants.sort((a, b) => b[1] - a[1]) }))

const inCaseGroups = new Set(
  caseInconsistencies.flatMap(g => g.variants.map(([tag]) => tag)),
)

// Step 3: near-duplicates — same after stripping non-alphanumeric, but lowercase forms differ
const nearMap = {}
for (const [tag, count] of allTags) {
  const key = tag.toLowerCase().replace(/[^a-z0-9]/g, '')
  if (!nearMap[key]) nearMap[key] = []
  nearMap[key].push([tag, count])
}
const nearDuplicates = Object.values(nearMap)
  .filter(variants => {
    const lowercaseForms = new Set(variants.map(([tag]) => tag.toLowerCase()))
    return lowercaseForms.size > 1
  })
  .map(variants => ({ variants: variants.sort((a, b) => b[1] - a[1]) }))

// Step 4: low-frequency — ≤ 2 occurrences, not already flagged
const flagged = new Set([
  ...inCaseGroups,
  ...nearDuplicates.flatMap(g => g.variants.map(([tag]) => tag)),
])
const lowFrequency = allTags
  .filter(([tag, count]) => count <= 2 && !flagged.has(tag))
  .sort((a, b) => a[0].localeCompare(b[0]))

console.log(JSON.stringify({ caseInconsistencies, nearDuplicates, lowFrequency }, null, 2))
```

- [ ] **Step 3: Run the script to verify it produces valid JSON**

```bash
node .claude/skills/tag-cleanup/scripts/audit.js
```

Expected: valid JSON printed to stdout with exactly three top-level keys: `caseInconsistencies`, `nearDuplicates`, `lowFrequency`. No errors on stderr.

- [ ] **Step 4: Verify JSON structure**

Pipe through `node` to validate key shapes:

```bash
node .claude/skills/tag-cleanup/scripts/audit.js | node -e "
const d = JSON.parse(require('fs').readFileSync('/dev/stdin','utf-8'))
console.assert(Array.isArray(d.caseInconsistencies), 'caseInconsistencies must be array')
console.assert(Array.isArray(d.nearDuplicates), 'nearDuplicates must be array')
console.assert(Array.isArray(d.lowFrequency), 'lowFrequency must be array')
if (d.caseInconsistencies.length) {
  const g = d.caseInconsistencies[0]
  console.assert(Array.isArray(g.variants), 'variants must be array')
  console.assert(Array.isArray(g.variants[0]), 'each variant must be [name, count]')
  console.assert(typeof g.variants[0][0] === 'string', 'variant[0] must be string')
  console.assert(typeof g.variants[0][1] === 'number', 'variant[1] must be number')
}
if (d.lowFrequency.length) {
  console.assert(Array.isArray(d.lowFrequency[0]), 'lowFrequency entry must be [name, count]')
}
console.log('All assertions passed')
"
```

Expected: `All assertions passed` with no assertion errors.

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/tag-cleanup/scripts/audit.js
git commit -m "feat(skill): add audit.js to tag-cleanup skill"
```

---

### Task 2: Rewrite `SKILL.md`

**Files:**
- Modify: `.claude/skills/tag-cleanup/SKILL.md`

- [ ] **Step 1: Overwrite `SKILL.md` with the updated version**

Replace the entire contents of `.claude/skills/tag-cleanup/SKILL.md` with:

````md
---
name: tag-cleanup
description: Audit all tags across blog posts, surface case inconsistencies, near-duplicates (e.g. Node.js vs NodeJS), and low-frequency tags. Suggests canonical forms and outputs ready-to-use sed rename commands. Use when the user wants to clean up tags, find duplicate tags, audit tag quality, or rename a tag across all posts.
---

# Tag Cleanup

## Quick start

Run the audit script immediately when the skill is invoked — no preamble:

```bash
node .claude/skills/tag-cleanup/scripts/audit.js
```

Parse the JSON output. Three keys: `caseInconsistencies`, `nearDuplicates`, `lowFrequency`. Skip any section that is an empty array.

## Conversation flow

### 1. Case inconsistencies

Present each group one at a time. Suggest the canonical using Title Case judgment — highest count is the tiebreaker when multiple forms are equally correct, but prefer the form that matches the technology's canonical name:

> "`Spring Boot` (12) vs `Spring boot` (87) — suggested canonical: `Spring Boot` (Title Case). Confirm or pick a different form?"

Wait for confirmation before moving to the next group. Collect all decisions.

### 2. Near-duplicates

Same format, but note these differ beyond casing:

> "`Node.js` (8) vs `NodeJS` (1) — suggested canonical: `Node.js`. Confirm or pick a different form?"

### 3. Low-frequency tags

List all at once — informational only, no decision required:

> "These tags appear ≤ 2 times and may be candidates for merging or dropping: `SomeTag` (1), `AnotherTag` (2)."

### 4. Rename commands

After collecting all confirmed canonicals, output one `find`/`sed` command per rename. Do NOT run these commands — hand them to the user to copy and run:

```bash
# Spring boot → Spring Boot
find src/content/posts -name "*.md" -exec sed -i '' 's/"Spring boot"/"Spring Boot"/g' {} +
```

If no renames were confirmed, say so and end.

## Tag conventions

- Tags use **Title Case** matching the technology name: `"Spring Boot"`, `"Node.js"`, `"AngularJS"`
- Not kebab-case, not all-lowercase
- Categories are a fixed set and are out of scope for this skill: `["General", "Java", "JavaScript", "Other", "Tutorials", "Cloud"]`
````

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/tag-cleanup/SKILL.md
git commit -m "feat(skill): rewrite tag-cleanup skill with script-assisted audit and correct conventions"
```
