import { mkdirSync, writeFileSync } from 'fs'
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

const input = JSON.parse(process.argv[2])
const { title, categories, tags, featuredImage } = input

const slug = toSlug(title)
const date = todayDate()
const year = date.slice(0, 4)
const dir = join(process.cwd(), 'src/content/posts', year, `${date}-${slug}`)
const file = join(dir, 'index.md')

const lines = ['---', `title: "${title}"`]
if (featuredImage) lines.push(`featuredImage: "${featuredImage}"`)
lines.push(`categories: ${formatArray(categories)}`)
lines.push(`tags: ${formatArray(tags)}`)
lines.push('---', '')

mkdirSync(dir, { recursive: true })
writeFileSync(file, lines.join('\n'))
console.log(file)
