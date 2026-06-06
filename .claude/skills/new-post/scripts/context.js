import { readFileSync, readdirSync, existsSync } from 'fs'
import { join } from 'path'

const root = process.cwd()
const postsDir = join(root, 'src/content/posts')
const logosDir = join(root, 'public/logos')

if (!existsSync(postsDir)) {
  console.error(`Posts directory not found: ${postsDir}`)
  process.exit(1)
}
if (!existsSync(logosDir)) {
  console.error(`Logos directory not found: ${logosDir}`)
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

function extractField(content, field) {
  const escaped = field.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = content.match(new RegExp(`^${escaped}:\\s*(\\[.+?\\])`, 'ms'))
  return match ? parseInlineArray(match[1]) : []
}

const categoryCount = {}
const tagCount = {}

for (const file of walkDir(postsDir).filter(f => f.endsWith('.md'))) {
  const content = readFileSync(file, 'utf-8')
  for (const c of extractField(content, 'categories')) {
    categoryCount[c] = (categoryCount[c] ?? 0) + 1
  }
  for (const t of extractField(content, 'tags')) {
    tagCount[t] = (tagCount[t] ?? 0) + 1
  }
}

const categories = Object.keys(categoryCount).sort()
const tags = Object.entries(tagCount)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 30)
const logos = readdirSync(logosDir)
  .filter(f => /\.(png|jpe?g|svg)$/i.test(f))
  .sort()

console.log(JSON.stringify({ categories, tags, logos }, null, 2))
