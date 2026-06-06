# Design: Remove social-card-preview skill

## Decision

Delete the `social-card-preview` skill and remove its reference from `CLAUDE.md`.

## Rationale

The skill was added speculatively. In practice, social card preview is rare, and when it does happen the workflow is either self-directed (navigate to the URL manually) or post-deploy (use an external metadata preview tool). Claude cannot visually verify the generated image, so the only thing the skill provided was a URL to open — which adds no real value.

The one genuinely Claude-native capability (predicting title overflow from canvas constants) is too niche to justify a dedicated skill. If it ever becomes relevant, it belongs as a check in `check-post`.

## What changes

| Action | Path |
|--------|------|
| Delete | `.claude/skills/social-card-preview/SKILL.md` |
| Modify | `CLAUDE.md` — remove `social-card-preview` from the content skills list |

## What does NOT change

- `src/utils/image.ts` and `src/pages/social/` — no changes to site code
- All other skills — untouched
