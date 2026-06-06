# tag-cleanup skill: script-assisted audit redesign

## Goal

Replace the broken `tag-cleanup` skill with a script-assisted audit that correctly reads inline-array frontmatter, detects three classes of tag issues, suggests canonical forms, and outputs ready-to-use rename commands — without performing any renames itself.

## What the current skill gets wrong

- Grep commands target YAML block-style tags (`  - tag`) but all posts use inline arrays (`["Tag1", "Tag2"]`)
- Rules section claims tags should be kebab-case; real tags are Title Case (`"Spring Boot"`, `"Node.js"`)
- Rename `sed` pattern targets block-style; correct pattern for inline arrays is `s/"OldTag"/"NewTag"/g`

## Script: `audit.js`

Lives at `.claude/skills/tag-cleanup/scripts/audit.js`. Run at skill invocation with no arguments.

### Detection algorithm

**Step 1 — collect:** Walk `src/content/posts/`, parse every `tags:` line using the same inline-array parser as `new-post/scripts/context.js`. Build a `Map<tag, count>` over all posts.

**Step 2 — case inconsistencies:** Group tags by `tag.toLowerCase()`. Any group with more than one distinct form is a case conflict. Sort variants by count descending — the first entry is the suggested canonical.

**Step 3 — near-duplicates:** Group tags by `tag.toLowerCase().replace(/[^a-z0-9]/g, '')`. Any group with more than one distinct case-normalized form (i.e. not already flagged in step 2) is a near-duplicate. Same sort and canonical logic.

**Step 4 — low-frequency:** Tags appearing ≤ 2 times that are not already in a case-inconsistency or near-duplicate group.

### Output shape

```json
{
  "caseInconsistencies": [
    { "variants": [["Spring Boot", 12], ["Spring boot", 87]] }
  ],
  "nearDuplicates": [
    { "variants": [["Node.js", 8], ["NodeJS", 1]] }
  ],
  "lowFrequency": [
    ["SomeTag", 1],
    ["AnotherTag", 2]
  ]
}
```

Each `variants` array is sorted highest-count first. The first entry is the suggested canonical.

## Conversation flow

1. **Run `audit.js`** immediately when the skill is invoked — no preamble
2. **Present case inconsistencies** one group at a time:
   > "`Spring Boot` (12) vs `Spring boot` (87) — suggested canonical: `Spring boot`. Confirm or pick a different form?"
   Wait for confirmation before moving to the next group. Collect all decisions.
3. **Present near-duplicates** the same way, noting forms differ beyond casing:
   > "`Node.js` (8) vs `NodeJS` (1) — suggested canonical: `Node.js`. Confirm or pick a different form?"
4. **Present low-frequency tags** all at once — informational only, no decision required:
   > "These tags appear ≤ 2 times and may be candidates for merging or dropping: `SomeTag` (1), `AnotherTag` (2)."
5. **Output rename commands** for every confirmed rename:
   ```bash
   # Spring boot → Spring Boot
   find src/content/posts -name "*.md" -exec sed -i '' 's/"Spring boot"/"Spring Boot"/g' {} +
   ```
   The skill does not run these commands. The user copies and runs them.

If `audit.js` finds no issues in a category, skip that category silently.

## Tag convention (corrected)

Tags use **Title Case display form** matching the technology name: `"Spring Boot"`, `"Node.js"`, `"AngularJS"`. Not kebab-case. The `audit.js` script detects deviations from this — it does not enforce a specific convention programmatically.

## Out of scope

- Applying renames automatically (user runs the `sed` commands)
- Detecting semantic duplicates beyond normalization (e.g. `"REST"` vs `"RESTful"`)
- Auditing categories (fixed set of 6, rarely wrong)
- Suggesting new tags or merging low-frequency tags automatically
