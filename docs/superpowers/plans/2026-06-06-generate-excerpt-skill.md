# generate-excerpt Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a `/generate-excerpt` skill that reads an existing blog post, presents 3 excerpt variants in the blog's established style, and writes the chosen one to the post's frontmatter.

**Architecture:** Two files — `SKILL.md` carries the conversational instructions (input resolution, variant generation rules, write invocation), and `scripts/write-excerpt.js` handles the atomic frontmatter mutation. Claude does all the creative reasoning; the script does the file write.

**Tech Stack:** Node.js ESM (same as `new-post` scripts), no external dependencies.

---

### Task 1: Create `write-excerpt.js`

**Files:**
- Create: `.claude/skills/generate-excerpt/scripts/write-excerpt.js`

- [ ] **Step 1: Create the directory**

```bash
mkdir -p .claude/skills/generate-excerpt/scripts
```

- [ ] **Step 2: Write the script**

Create `.claude/skills/generate-excerpt/scripts/write-excerpt.js`:

```javascript
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve } from 'path'

let input
try {
  input = JSON.parse(process.argv[2])
} catch (err) {
  console.error(`Failed to parse input: ${err.message}`)
  process.exit(1)
}

const { file, excerpt } = input

if (!file || typeof file !== 'string') {
  console.error('Input must include file (string)')
  process.exit(1)
}
if (!excerpt || typeof excerpt !== 'string') {
  console.error('Input must include excerpt (string)')
  process.exit(1)
}

const absPath = resolve(process.cwd(), file)

if (!existsSync(absPath)) {
  console.error(`File not found: ${absPath}`)
  process.exit(1)
}

const content = readFileSync(absPath, 'utf-8')
const fmMatch = content.match(/^---\n([\s\S]*?)\n---/)

if (!fmMatch) {
  console.error('Could not find frontmatter block in file')
  process.exit(1)
}

const escaped = excerpt.replace(/"/g, '\\"')
const excerptLine = `excerpt: "${escaped}"`

let newContent
if (/^excerpt:/m.test(fmMatch[1])) {
  newContent = content.replace(/^excerpt:.*$/m, excerptLine)
} else {
  newContent = content.replace(/^(title:.*$)/m, `$1\n${excerptLine}`)
}

writeFileSync(absPath, newContent)
console.log(`Excerpt written to ${absPath}`)
```

- [ ] **Step 3: Test — insert excerpt into a post that has none**

```bash
POST=$(grep -rL "^excerpt:" src/content/posts --include="*.md" | head -1)
node .claude/skills/generate-excerpt/scripts/write-excerpt.js "{\"file\":\"$POST\",\"excerpt\":\"Test excerpt to verify insertion works correctly.\"}"
```

Verify the excerpt appears after `title:` and is the only excerpt line:

```bash
head -10 "$POST"
grep -c "^excerpt:" "$POST"
```

Expected: frontmatter contains `excerpt: "Test excerpt to verify insertion works correctly."` on its own line after `title:`, count is `1`.

- [ ] **Step 4: Revert the test change**

```bash
git checkout -- "$POST"
```

- [ ] **Step 5: Test — update an existing excerpt**

```bash
POST=$(grep -rl "^excerpt:" src/content/posts --include="*.md" | head -1)
ORIGINAL=$(grep "^excerpt:" "$POST")
node .claude/skills/generate-excerpt/scripts/write-excerpt.js "{\"file\":\"$POST\",\"excerpt\":\"Updated test excerpt to verify replacement works.\"}"
grep "^excerpt:" "$POST"
grep -c "^excerpt:" "$POST"
```

Expected: the excerpt line is `excerpt: "Updated test excerpt to verify replacement works."` and the count is `1` (no duplicate).

- [ ] **Step 6: Revert the test change**

```bash
git checkout -- "$POST"
```

- [ ] **Step 7: Test — error on missing file**

```bash
node .claude/skills/generate-excerpt/scripts/write-excerpt.js '{"file":"src/content/posts/nonexistent/index.md","excerpt":"test"}'
echo "Exit code: $?"
```

Expected: stderr contains "File not found", exit code is `1`.

- [ ] **Step 8: Commit**

```bash
git add .claude/skills/generate-excerpt/scripts/write-excerpt.js
git commit -m "feat(skill): add write-excerpt.js script for frontmatter mutation"
```

---

### Task 2: Create `SKILL.md`

**Files:**
- Create: `.claude/skills/generate-excerpt/SKILL.md`

- [ ] **Step 1: Write the skill file**

Create `.claude/skills/generate-excerpt/SKILL.md`:

```markdown
---
name: generate-excerpt
description: Generate a catchy excerpt for an existing blog post — resolves the post from a slug, path, or conversation context, produces 3 variants in the blog's established style, then writes the chosen one to the post's frontmatter. Use when the user wants to generate, create, or write an excerpt for a blog post.
---

# Generate Excerpt

## Resolve the post

Determine the target post from one of these sources, in order:

1. **Explicit slug in args** (e.g. `/generate-excerpt 2024-01-15-mailpit-spring-boot`) — find the file:
   ```bash
   find src/content/posts -type f -name "index.md" | grep "<slug>"
   ```
2. **Explicit file path in args** — use it directly
3. **Context inference** — if the recent conversation mentions a post file path or slug (e.g. from a prior `/new-post` run), confirm with the user before proceeding: "I see we were working on `<path>` — should I generate an excerpt for that post?"
4. **Ask** — if nothing can be resolved, ask: "Which post should I generate an excerpt for? You can provide a slug (e.g. `2024-01-15-mailpit-spring-boot`) or a file path."

If the resolved file does not exist, report the error and ask the user to correct it.

## Read and identify the post

Read the resolved file. Identify the post type from the content:
- **Tutorial**: step-by-step instruction, code examples are central, "how to" framing
- **Opinion/reflective**: personal takes, experience, comparisons, "should I…" questions
- **Year-in-review**: annual recap, metrics, personal reflection

## Generate 3 variants

Generate all three and present as a lettered list. Treat the word counts as firm targets, not suggestions.

- **A — Short & punchy (15–20 words):** One crisp sentence distilling the core takeaway.
- **B — Standard (20–28 words):** Follows the "In this post/tutorial, I'll…" convention used throughout the blog.
- **C — Hook-led (25–35 words):** Opens with a provocative or interesting observation, then frames what the post covers.

Style rules for all variants:
- Conversational and first-person
- No marketing language or superlatives ("powerful", "amazing", "deep dive")
- Factual preview of what the post delivers
- Tone matches the identified post type (tutorials use "I'll show"/"we'll explore"; reflective posts use narrative framing)

Present as:

> Here are 3 excerpt options:
>
> **A** — "…"
> **B** — "…"
> **C** — "…"
>
> Reply with a letter to use one, ask for a tweak ("B but without 'In this post'"), request all new variants, or share your own text to refine.

## Write the chosen excerpt

Once the user selects or approves an excerpt, run:

```bash
node .claude/skills/generate-excerpt/scripts/write-excerpt.js '{"file":"<resolved-path>","excerpt":"<chosen-excerpt>"}'
```

If the script exits with an error, report the error message to the user.

On success, echo the file path only — no further summary.
```

- [ ] **Step 2: Verify the skill directory looks correct**

```bash
find .claude/skills/generate-excerpt -type f | sort
```

Expected:
```
.claude/skills/generate-excerpt/SKILL.md
.claude/skills/generate-excerpt/scripts/write-excerpt.js
```

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/generate-excerpt/SKILL.md
git commit -m "feat(skill): add generate-excerpt skill"
```
