import { mkdirSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'of', 'in', 'on', 'at', 'to', 'for',
  'with', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'be', 'by',
])

function toSlug(title) {
  return title
    .toLowerCase()
    .split(/\s+/)
    .filter(word => !STOP_WORDS.has(word))
    .join('-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function todayDate() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function formatArray(arr) {
  return '[' + arr.map(item => `"${item}"`).join(', ') + ']'
}

let input
try {
  input = JSON.parse(process.argv[2])
} catch (err) {
  console.error(`Failed to parse input: ${err.message}`)
  process.exit(1)
}

const { title, categories, tags, featuredImage } = input

if (!title || typeof title !== 'string') {
  console.error('Input must include title (string)')
  process.exit(1)
}
if (!Array.isArray(categories) || !Array.isArray(tags)) {
  console.error('Input must include categories and tags (arrays)')
  process.exit(1)
}

const slug = toSlug(title) || 'post'
const date = todayDate()
const year = date.slice(0, 4)
const dir = join(process.cwd(), 'src/content/posts', year, `${date}-${slug}`)
const file = join(dir, 'index.md')

if (existsSync(file)) {
  console.error(`Post already exists: ${file}`)
  process.exit(1)
}

const escapedTitle = title.replace(/"/g, '\\"')
const lines = ['---', `title: "${escapedTitle}"`]
if (featuredImage) lines.push(`featuredImage: "${featuredImage}"`)
lines.push(`categories: ${formatArray(categories)}`)
lines.push(`tags: ${formatArray(tags)}`)
lines.push('---', '')

try {
  mkdirSync(dir, { recursive: true })
  writeFileSync(file, lines.join('\n'))
  console.log(file)
} catch (err) {
  console.error(`Failed to create post: ${err.message}`)
  process.exit(1)
}
