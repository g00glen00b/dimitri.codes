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

let newFrontmatter
if (/^excerpt:/m.test(fmMatch[1])) {
  newFrontmatter = fmMatch[1].replace(/^excerpt:.*$/m, excerptLine)
} else {
  newFrontmatter = fmMatch[1].replace(/^(title:.*$)/m, `$1\n${excerptLine}`)
}

const newContent = content.slice(0, fmMatch.index) + '---\n' + newFrontmatter + '\n---' + content.slice(fmMatch.index + fmMatch[0].length)

writeFileSync(absPath, newContent)
console.log(`Excerpt written to ${absPath}`)
