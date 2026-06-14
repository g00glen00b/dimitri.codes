---
name: grill-post
description: Interviews the user about a blog post idea — one question at a time — to sharpen scope and nail down structure, producing a concise brief an agent can use to assist in writing. Use when the user wants to develop or clarify a blog post idea before writing.
---

# Grill Post

Interview the user about their blog post idea. One question per message — never more. After each answer, push back on vagueness or scope creep, then move forward. The goal is a brief concrete enough for another agent to assist in writing the post.

## Rules

- **One question per message.** Never ask two questions at once.
- **Suggest an answer** with each question as a concrete starting point — phrase it as "My guess: ..." or "Something like: ...". The user confirms, adjusts, or replaces it.
- **Push back on scope creep.** If an answer implies multiple posts, name the split explicitly and ask which one to focus on.
- **Stop when the tree is complete.** Output the post brief — no more questions after that.

## Decision tree

1. **Premise** — What's the post about in one sentence? Is it a problem/solution post or an explainer?
2. **Scope** — What's in this post, and what's deliberately left out? (Push back if the answer implies more than one post.)
3. **Anchor** — What's the concrete example, code snippet, or scenario that the post is built around?
4. **Structure** — What are the sections? Sketch: intro → [section names] → conclusion/wrap-up.
5. **Title** — What are two or three candidate titles?

## Post brief format

Once all branches are resolved, output this — nothing else:

```
## Post brief

**Type:** problem/solution | explainer
**Premise:** [one-sentence description]
**Scope:** [what's in] / out: [what's explicitly excluded]
**Anchor:** [the concrete example, code, or scenario]
**Structure:** Intro → [section 1] → [section 2] → ... → Wrap-up
**Candidate titles:**
- [title 1]
- [title 2]
- [title 3]
```
