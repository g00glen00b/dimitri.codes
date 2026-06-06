# new-post skill: interactive scaffolding redesign

## Goal

Improve the `new-post` skill to be (A) accurate to real post conventions and (B) fully interactive — Claude collects all fields conversationally before creating any files.

## Scripts

Two Node.js scripts live in `.claude/skills/new-post/scripts/`.

### `context.js`

Run at skill start. Reads the filesystem and outputs JSON:

```json
{
  "categories": ["General", "Java", "JavaScript", "Tutorials", "Other", "Cloud"],
  "tags": [["Spring", 45], ["Spring Boot", 38], "...top 30 by frequency"],
  "logos": ["angular.png", "astro.png", "docker.png", "..."]
}
```

- Categories: grepped from existing posts
- Tags: top 30 by frequency across all posts, with counts
- Logos: `ls public/logos/`

### `create.js`

Accepts a single JSON argument with the collected inputs:

```bash
node .claude/skills/new-post/scripts/create.js '{"title":"...","categories":[...],"tags":[...],"featuredImage":"..."}'
```

Responsibilities:
- **Slug**: lowercase title, strip stop words (`a, an, the, of, in, on, at, to, for, with, and, or, but, is, are, was, were, be, by`), replace remaining spaces with hyphens, remove non-alphanumeric chars
  - Example: `"Deprecation of RestTemplate"` → `deprecation-resttemplate`
- **Date**: today's date as `YYYY-MM-DD`
- **Path**: `src/content/posts/YYYY/YYYY-MM-DD-{slug}/index.md`
- Creates directory and writes the file
- Prints the created file path to stdout

## Conversation flow

1. Run `context.js` before asking anything
2. Ask for the title (one question, nothing else)
3. Suggest 1–2 categories from the fixed list based on the title; ask user to confirm or change
4. Suggest 3–5 tags: draw from existing tag list where relevant, add new ones for technologies not yet in corpus; ask user to confirm or edit
5. Suggest a `featuredImage` path (e.g. `/logos/spring-security.png`) based on the primary technology in tags/title; ask user to confirm, pick another, or skip
6. Run `create.js` with collected answers
7. Echo the created file path — done

## Frontmatter conventions (corrected)

Generated file uses double quotes and inline array style to match real posts:

```md
---
title: "Post Title Here"
featuredImage: "/logos/spring-security.png"
categories: ["Java", "Tutorials"]
tags: ["Spring", "Spring Security"]
---
```

- `excerpt` is omitted entirely from the scaffold (written after the post is complete)
- `featuredImage` is an absolute path from `public/logos/`; omit the field if the user skips it
- Tags use the display form seen in existing posts (Title Case, e.g. `"Spring Boot"`) — not kebab-case

## Out of scope

- Suggesting post content or outline (separate concern)
- Generating or validating the `excerpt` (separate skill planned)
- Listing or deduplicating existing tags (covered by `tag-cleanup` skill)
