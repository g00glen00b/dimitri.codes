# generate-excerpt skill design

## Overview

A standalone Claude Code skill that reads an existing blog post, generates 3 excerpt variants in the blog's established style, lets the user pick or refine one, then writes the chosen excerpt to the post's frontmatter.

## Files

```
.claude/skills/generate-excerpt/
  SKILL.md
  scripts/write-excerpt.js
```

Mirrors the `new-post` pattern: conversational logic in `SKILL.md`, file mutation isolated in a script.

## Input resolution

Tried in order:

1. **Explicit slug** in args — glob `src/content/posts/**/*{slug}*/index.md`
2. **Explicit file path** in args — used directly
3. **Context inference** — scan recent conversation for a previously mentioned path or slug; confirm with the user before proceeding

If the resolved file does not exist, report the error and ask for a correction. If nothing can be inferred from context, ask the user to provide a slug or path explicitly.

## Variant generation

Claude reads the post content, identifies the post type (tutorial, opinion/reflective, year-in-review, etc.), and generates 3 variants:

- **A — Short & punchy** (15–20 words): distils the core takeaway into one crisp sentence
- **B — Standard** (20–28 words): follows the established "In this post/tutorial, I'll…" convention
- **C — Hook-led** (25–35 words): opens with a provocative or interesting angle before framing what the post covers

Style rules for all variants: conversational, first-person, no marketing language, factual preview, matches the tone of existing blog excerpts.

Variants are presented as a numbered list. The user can:
- Reply with a letter to select ("B")
- Request a tweak ("B but without 'In this post'")
- Ask to regenerate all three
- Provide their own text and ask Claude to refine it

## `write-excerpt.js`

Accepts a single JSON argument: `{ file, excerpt }`.

```bash
node .claude/skills/generate-excerpt/scripts/write-excerpt.js '{"file":"src/content/posts/2024/.../index.md","excerpt":"..."}'
```

Behaviour:
- Reads the target file
- Locates the YAML frontmatter block (between `---` fences)
- Updates an existing `excerpt:` line, or inserts a new one after the `title:` line
- Writes the excerpt value with double quotes, consistent with the rest of the frontmatter
- Exits non-zero with an error message if the file doesn't exist or the frontmatter block can't be found
