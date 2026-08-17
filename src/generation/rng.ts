// mulberry32: small, fast, deterministic PRNG. Any randomness in generation
// must trace back to an explicit seed passed in here -- never Math.random()
// (principle 3).
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return function next() {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Deterministically derives a child seed from a parent seed and an integer
// salt (e.g. child index), so each node in a structure has its own stable
// seed lineage without needing a shared mutable RNG passed down the tree.
export function deriveSeed(seed: number, salt: number): number {
  let h = (seed ^ Math.imul(salt + 0x9e3779b9, 0x85ebca6b)) >>> 0
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35)
  return (h ^ (h >>> 16)) >>> 0
}
