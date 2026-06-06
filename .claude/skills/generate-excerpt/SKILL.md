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

The resolved path is the project-relative path to the post's `index.md` (e.g. `src/content/posts/2024/2024-01-15-mailpit-spring-boot/index.md`). Pass it as-is to the script.

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
node .claude/skills/generate-excerpt/scripts/write-excerpt.js "{\"file\":\"<resolved-path>\",\"excerpt\":\"<chosen-excerpt>\"}"
```

Escape any `"` characters within the excerpt as `\"`.

If the script exits with an error, report the error message to the user.

On success, reply with the file path only — no further commentary.
