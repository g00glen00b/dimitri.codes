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

Read the JSON output. `categories` is a sorted array of strings. `tags` is an array of `[name, count]` pairs (e.g. `["Spring Boot", 38]`) — use the name (index 0) for suggestions, count is for reference. `logos` is a sorted array of filenames. Use all three to ground suggestions in the conversation below.

## Conversation flow

Collect all fields before creating any files. One question per message.

1. **Run `context.js`** as above
2. **Ask for the title** — one open question, nothing else
3. **Suggest categories** — pick 1–2 from the `categories` list that fit the title; present as a confirmation:
   > "I'd suggest `["Java", "Tutorials"]` — confirm or change?"
4. **Suggest tags** — propose 3–5: prefer entries from the `tags` list where they fit, add new ones for technologies not yet in the corpus; present as an editable list — the user can freely add, remove, or change any tag
5. **Suggest featuredImage** — pick the closest match from `logos` based on the primary technology in the tags/title; present the full path and ask to confirm, pick another, or skip:
   > "I'd use `/logos/spring-boot.png` — confirm, pick another, or skip?"
6. **Run `create.js`** with all collected answers as a single JSON argument:

```bash
node .claude/skills/new-post/scripts/create.js '{"title":"...","categories":[...],"tags":[...],"featuredImage":"..."}'
```

Omit `featuredImage` from the JSON object if the user skipped it.

7. **Echo the created file path** — done, no further summary

If `create.js` exits with an error (e.g. post already exists at that date/slug), report the error message to the user and ask if they want to try a different title.

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
