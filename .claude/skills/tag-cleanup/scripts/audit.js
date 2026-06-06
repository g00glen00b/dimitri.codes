import { readFileSync, readdirSync, existsSync } from 'fs'
import { join } from 'path'

const root = process.cwd()
const postsDir = join(root, 'src/content/posts')

if (!existsSync(postsDir)) {
  console.error(`Posts directory not found: ${postsDir}`)
  process.exit(1)
}

function walkDir(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const fullPath = join(dir, entry.name)
    return entry.isDirectory() ? walkDir(fullPath) : [fullPath]
  })
}

function parseInlineArray(str) {
  return str
    .replace(/^\[|\]$/g, '')
    .split(',')
    .map(s => s.trim().replace(/^["']|["']$/g, ''))
    .filter(Boolean)
}

function extractTags(content) {
  const match = content.match(/^tags:\s*(\[.+?\])/ms)
  return match ? parseInlineArray(match[1]) : []
}

// Step 1: collect all tag counts
const tagCount = {}
for (const file of walkDir(postsDir).filter(f => f.endsWith('.md'))) {
  const content = readFileSync(file, 'utf-8')
  for (const tag of extractTags(content)) {
    tagCount[tag] = (tagCount[tag] ?? 0) + 1
  }
}

const allTags = Object.entries(tagCount)

// Step 2: case inconsistencies — same tag, different capitalisation
const caseMap = {}
for (const [tag, count] of allTags) {
  const key = tag.toLowerCase()
  if (!caseMap[key]) caseMap[key] = []
  caseMap[key].push([tag, count])
}
const caseInconsistencies = Object.values(caseMap)
  .filter(variants => variants.length > 1)
  .map(variants => ({ variants: variants.sort((a, b) => b[1] - a[1]) }))

const inCaseGroups = new Set(
  caseInconsistencies.flatMap(g => g.variants.map(([tag]) => tag)),
)

// Step 3: near-duplicates — same after stripping non-alphanumeric, but lowercase forms differ
const nearMap = {}
for (const [tag, count] of allTags) {
  if (inCaseGroups.has(tag)) continue
  const key = tag.toLowerCase().replace(/[^a-z0-9]/g, '')
  if (!nearMap[key]) nearMap[key] = []
  nearMap[key].push([tag, count])
}
const nearDuplicates = Object.values(nearMap)
  .filter(variants => {
    const lowercaseForms = new Set(variants.map(([tag]) => tag.toLowerCase()))
    return lowercaseForms.size > 1
  })
  .map(variants => ({ variants: variants.sort((a, b) => b[1] - a[1]) }))

// Step 4: low-frequency — ≤ 2 occurrences, not already flagged
const flagged = new Set([
  ...inCaseGroups,
  ...nearDuplicates.flatMap(g => g.variants.map(([tag]) => tag)),
])
const lowFrequency = allTags
  .filter(([tag, count]) => count <= 2 && !flagged.has(tag))
  .sort((a, b) => a[0].localeCompare(b[0]))

console.log(JSON.stringify({ caseInconsistencies, nearDuplicates, lowFrequency }, null, 2))
