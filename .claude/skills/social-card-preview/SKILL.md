---
name: social-card-preview
description: Start the Astro dev server and open the generated social card (OG image) for a specific blog post slug to visually verify it. Use when the user wants to preview or verify the social card, OG image, or open graph image for a post.
---

# Social Card Preview

## Quick start

Given a post slug, start the dev server and surface the social card URL for that post.

## Workflow

1. **Resolve the slug** — the slug is the folder name without the date prefix, e.g. `my-post-title` from `2024-03-15-my-post-title/`
2. **Start the dev server** if not already running:

```bash
npm run dev
```

3. **Open the social card URL** in a browser:

```
http://localhost:4321/social/{slug}.png
```

4. **Verify visually** — check that title text renders correctly, image fits the card, no overflow or clipping

## Slug lookup

If the slug isn't known, find it:

```bash
ls src/content/posts/
# then drill into the year folder
ls src/content/posts/2024/
# folder name: YYYY-MM-DD-{slug} → slug is everything after the date prefix
```

## Social card implementation

The generation logic lives in `src/utils/image.ts` and the route in `src/pages/social/`. If the card looks wrong, that's where to fix it.

## Notes

- The dev server must be running; the social card route is not static, it's generated on request
- If the post is future-dated it will still render a social card in dev mode
