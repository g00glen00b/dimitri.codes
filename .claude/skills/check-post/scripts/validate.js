import { readFileSync, existsSync } from 'fs'
import { readdirSync } from 'fs'
import { join, relative } from 'path'
import { execSync } from 'child_process'

const root = process.cwd()
const postsDir = join(root, 'src/content/posts')
const publicDir = join(root, 'public')

const ALLOWED_CATEGORIES = new Set(['General', 'Java', 'JavaScript', 'Other', 'Tutorials', 'Cloud'])

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

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return {}
  const fields = {}
  for (const line of match[1].split('\n')) {
    const m = line.match(/^(\w+):\s*(.+)$/)
    if (!m) continue
    const [, key, rawValue] = m
    fields[key] = rawValue.startsWith('[')
      ? parseInlineArray(rawValue)
      : rawValue.replace(/^["']|["']$/g, '').trim()
  }
  return fields
}

function isTitleCase(tag) {
  return tag === tag.split(' ').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')
}

function findBySlug(slug) {
  const allMds = walkDir(postsDir).filter(f => f.endsWith('index.md'))
  return allMds.filter(f => {
    const dir = f.replace(/[/\\]index\.md$/, '')
    const dirName = dir.split(/[/\\]/).pop()
    return dirName.toLowerCase().includes(slug.toLowerCase())
  })
}

function autoDetect() {
  let output
  try {
    output = execSync('git status --porcelain', { cwd: root, encoding: 'utf-8' })
  } catch {
    return { path: null, error: 'Could not run git status' }
  }
  const matches = output
    .split('\n')
    .filter(l => l.trim())
    .map(l => l.slice(3).trim())
    .filter(f => !f.includes(' -> ') && f.startsWith('src/content/posts/') && f.endsWith('.md'))
  if (matches.length === 1) return { path: join(root, matches[0]), error: null }
  return { path: null, error: 'Could not auto-detect post. Provide a path or slug.' }
}

function resolvePost(arg) {
  if (!arg) return autoDetect()
  if (arg.endsWith('.md') || arg.endsWith('index.md')) {
    const abs = arg.startsWith('/') ? arg : join(root, arg)
    return { path: abs, error: null }
  }
  const matches = findBySlug(arg)
  if (matches.length === 1) return { path: matches[0], error: null }
  if (matches.length > 1) {
    return {
      path: null,
      error: `Multiple posts match "${arg}":\n${matches.map(f => relative(root, f)).join('\n')}`,
    }
  }
  return { path: null, error: `No post found matching "${arg}"` }
}

const { path: postPath, error: resolveError } = resolvePost(process.argv[2])

if (!postPath) {
  console.error(resolveError)
  process.exit(1)
}

if (!existsSync(postPath)) {
  console.error(`Post file not found: ${postPath}`)
  process.exit(1)
}

const content = readFileSync(postPath, 'utf-8')
const fields = parseFrontmatter(content)
const relPath = relative(root, postPath)

const errors = []
const warnings = []
const info = []

// title
if (!fields.title || String(fields.title).trim() === '') {
  errors.push('title: field is missing or empty')
}

// categories
if (!fields.categories || fields.categories.length === 0) {
  errors.push('categories: field is missing or empty')
} else {
  for (const cat of fields.categories) {
    if (!ALLOWED_CATEGORIES.has(cat)) {
      errors.push(`categories: unknown value "${cat}" (allowed: ${[...ALLOWED_CATEGORIES].join(', ')})`)
    }
  }
}

// tags — Title Case check
if (fields.tags && Array.isArray(fields.tags)) {
  for (const tag of fields.tags) {
    if (!isTitleCase(tag)) {
      const suggested = tag.split(' ').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')
      warnings.push(`tags: "${tag}" should be Title Case (e.g. "${suggested}")`)
    }
  }
}

// featuredImage — resolve /logos/foo.png → public/logos/foo.png
if (fields.featuredImage) {
  const imgPath = join(publicDir, fields.featuredImage.replace(/^\//, ''))
  if (!existsSync(imgPath)) {
    warnings.push(`featuredImage: file not found at public${fields.featuredImage}`)
  }
}

// excerpt
if (!fields.excerpt) {
  warnings.push('excerpt: field is missing')
}

// path structure: src/content/posts/YYYY/YYYY-MM-DD-slug/index.md
const pathMatch = relPath.match(/^src[/\\]content[/\\]posts[/\\](\d{4})[/\\](\d{4}-\d{2}-\d{2}-[^/\\]+)[/\\]index\.md$/)
if (!pathMatch) {
  warnings.push(`path: does not match convention src/content/posts/YYYY/YYYY-MM-DD-slug/index.md`)
} else {
  const dateStr = pathMatch[2].slice(0, 10)
  const postDate = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (postDate > today) {
    info.push(`post is future-dated (${dateStr}) — it will be hidden in production`)
  }
}

console.log(JSON.stringify({ post: relPath, errors, warnings, info }, null, 2))
