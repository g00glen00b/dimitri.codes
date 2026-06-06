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

The `lowFrequency` array contains `[name, count]` tuples — use index 0 for the tag name and index 1 for the count.

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
