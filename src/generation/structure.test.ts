import { describe, expect, it } from 'vitest'
import { generateStructure } from './structure'

// Establishes the testing practice for the project: pure generation code
// (principle 1) is deterministic by seed (principle 3), so that claim is
// checkable, not just assumed.
describe('generateStructure', () => {
  it('produces an identical structure for the same seed', () => {
    const a = generateStructure(42)
    const b = generateStructure(42)
    expect(a).toEqual(b)
  })

  it('produces a different structure for a different seed', () => {
    const a = generateStructure(42)
    const b = generateStructure(43)
    expect(a).not.toEqual(b)
  })

  it('gives every node a unique, stable id', () => {
    const root = generateStructure(42)
    const ids: string[] = []
    const collect = (node: typeof root) => {
      ids.push(node.id)
      node.children.forEach(collect)
    }
    collect(root)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
