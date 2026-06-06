import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve } from 'path'

let input
try {
  input = JSON.parse(process.argv[2])
} catch (err) {
  console.error(`Failed to parse input: ${err.message}`)
  process.exit(1)
}

const { file, excerpt } = input

if (!file || typeof file !== 'string') {
  console.error('Input must include file (string)')
  process.exit(1)
}
if (!excerpt || typeof excerpt !== 'string') {
  console.error('Input must include excerpt (string)')
  process.exit(1)
}

const absPath = resolve(process.cwd(), file)

if (!existsSync(absPath)) {
  console.error(`File not found: ${absPath}`)
  process.exit(1)
}

const content = readFileSync(absPath, 'utf-8')
const fmMatch = content.match(/^---\n([\s\S]*?)\n---/)

if (!fmMatch) {
  console.error('Could not find frontmatter block in file')
  process.exit(1)
}

const escaped = excerpt.replace(/"/g, '\\"')
const excerptLine = `excerpt: "${escaped}"`

let newContent
if (/^excerpt:/m.test(fmMatch[1])) {
  newContent = content.replace(/^excerpt:.*$/m, excerptLine)
} else {
  newContent = content.replace(/^(title:.*$)/m, `$1\n${excerptLine}`)
}

writeFileSync(absPath, newContent)
console.log(`Excerpt written to ${absPath}`)
