#!/usr/bin/env node
/**
 * check-spec-refs — keep specs/SPEC_*.md pointing at code that exists.
 *
 * Specs are canonical (CLAUDE.md): code and specs must match. This
 * catches the mechanical half of drift — references that no longer
 * resolve. It does not judge whether the prose is still true.
 *
 * For every specs/SPEC_*.md (RFCs are exploratory and exempt), every
 * `src/...` or `scripts/...` path, in backticks or a markdown link, must
 * exist relative to the repo root. A trailing :line or #anchor is
 * ignored; `{a,b}` lists are expanded; paths containing a `<placeholder>`
 * or `*` glob are skipped as templates.
 *
 * Prints `file:line: message` per violation; exits 1 if there are any.
 * Run with `npm run check:specs` (also part of `npm run lint`).
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join, relative, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const specDir = join(root, 'specs')

const PATH_RE = /(?:`|\]\()((?:\.\.\/)?(?:src|scripts)\/[^`)\s]+?)(?::\d+(?:-\d+)?)?(?:#[^`)\s]*)?(?:`|\))/g

/** Expand one `{a,b,c}` group: "x/{a,b}.ts" → ["x/a.ts", "x/b.ts"]. */
function expandBraces(path) {
  const m = path.match(/^(.*?)\{([^}]+)\}(.*)$/)
  return m ? m[2].split(',').map((alt) => m[1] + alt + m[3]) : [path]
}

const violations = []
const specs = existsSync(specDir) ? readdirSync(specDir).filter((f) => /^SPEC_.*\.md$/.test(f)).sort() : []

for (const file of specs) {
  const rel = relative(root, join(specDir, file))
  const lines = readFileSync(join(specDir, file), 'utf8').split('\n')
  lines.forEach((line, i) => {
    for (const [, ref] of line.matchAll(PATH_RE)) {
      if (/[<*]/.test(ref)) continue
      for (const path of expandBraces(ref.replace(/^\.\.\//, ''))) {
        if (!existsSync(join(root, path))) violations.push(`${rel}:${i + 1}: path does not exist: ${path}`)
      }
    }
  })
}

for (const v of violations) console.error(v)
if (violations.length > 0) process.exit(1)
console.log(`check:specs: ${specs.length} spec(s), all references resolve.`)
