import fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import { law } from './laws'

// The checkers are only worth having if they pass on a structure that has
// a law and fail on one that doesn't. Both directions are tested here,
// using two structures the RFCs lean on.

const same = (a: number, b: number) => a === b
const int = fc.integer({ min: -1000, max: 1000 })

// The (max, +) semiring, with -Infinity as zero and 0 as one: a structure
// that has every law the checkers cover. RFC 002 law E3 maps a part's
// duration onto its non-negative part only; the zero is not part of the
// element-level meaning.
describe('(max, +) on integers', () => {
  const duration = fc.oneof(int, fc.constant(-Infinity))
  const add = (a: number, b: number) => a + b

  it('has two monoids', () => {
    law.associative(duration, Math.max, same)
    law.commutative(duration, Math.max, same)
    law.idempotent(duration, Math.max, same)
    law.identity(duration, Math.max, -Infinity, same)
    law.associative(duration, add, same)
    law.identity(duration, add, 0, same)
  })

  it('distributes from both sides and has a two-sided zero', () => {
    law.distributesFromLeft(duration, add, Math.max, same)
    law.distributesFromRight(duration, add, Math.max, same)
    law.leftZero(duration, add, -Infinity, same)
    law.rightZero(duration, add, -Infinity, same)
  })
})

describe('checkers fail on structures without the law', () => {
  // RFC 001: combining concurrent values by averaging is not associative.
  it('averaging is commutative and idempotent but not associative', () => {
    const average = (a: number, b: number) => (a + b) / 2
    law.commutative(int, average, same)
    law.idempotent(int, average, same)
    expect(() => law.associative(int, average, same)).toThrow()
  })

  it('subtraction has no two-sided identity and does not commute', () => {
    const subtract = (a: number, b: number) => a - b
    expect(() => law.identity(int, subtract, 0, same)).toThrow()
    expect(() => law.commutative(int, subtract, same)).toThrow()
  })

  it('max does not distribute over + and 0 is not its zero', () => {
    const add = (a: number, b: number) => a + b
    expect(() => law.distributesFromLeft(int, Math.max, add, same)).toThrow()
    expect(() => law.distributesFromRight(int, Math.max, add, same)).toThrow()
    expect(() => law.leftZero(int, Math.max, 0, same)).toThrow()
    expect(() => law.rightZero(int, Math.max, 0, same)).toThrow()
  })

  it('+ is not idempotent', () => {
    expect(() => law.idempotent(int, (a, b) => a + b, same)).toThrow()
  })
})

describe('homomorphism', () => {
  const concat = (a: string, b: string) => a + b
  const add = (a: number, b: number) => a + b

  it('length maps concatenation onto addition', () => {
    law.homomorphism(fc.string(), (s) => s.length, concat, add, same)
  })

  it('length does not map concatenation onto max', () => {
    expect(() => law.homomorphism(fc.string(), (s) => s.length, concat, Math.max, same)).toThrow()
  })
})
