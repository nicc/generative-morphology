import fc from 'fast-check'

// Property-based checkers for algebraic laws. Each takes a generator of
// values, the operations, and the equality to compare with, and throws
// (with fast-check's shrunk counterexample) if the law fails.
//
// `eq` is the point: a law is an equation between meanings, so pass the
// equality of meanings, not reference equality. While a representation
// has the same shape as its meaning, structural equality will do.

export type Eq<T> = (a: T, b: T) => boolean
type Op<T> = (a: T, b: T) => T

export const law = {
  associative<T>(arb: fc.Arbitrary<T>, op: Op<T>, eq: Eq<T>): void {
    fc.assert(fc.property(arb, arb, arb, (a, b, c) => eq(op(op(a, b), c), op(a, op(b, c)))))
  },

  commutative<T>(arb: fc.Arbitrary<T>, op: Op<T>, eq: Eq<T>): void {
    fc.assert(fc.property(arb, arb, (a, b) => eq(op(a, b), op(b, a))))
  },

  idempotent<T>(arb: fc.Arbitrary<T>, op: Op<T>, eq: Eq<T>): void {
    fc.assert(fc.property(arb, (a) => eq(op(a, a), a)))
  },

  // e ∘ a = a = a ∘ e
  identity<T>(arb: fc.Arbitrary<T>, op: Op<T>, e: T, eq: Eq<T>): void {
    fc.assert(fc.property(arb, (a) => eq(op(e, a), a) && eq(op(a, e), a)))
  },

  // a · (b + c) = a·b + a·c
  distributesFromLeft<T>(arb: fc.Arbitrary<T>, mul: Op<T>, add: Op<T>, eq: Eq<T>): void {
    fc.assert(fc.property(arb, arb, arb, (a, b, c) => eq(mul(a, add(b, c)), add(mul(a, b), mul(a, c)))))
  },

  // (a + b) · c = a·c + b·c
  distributesFromRight<T>(arb: fc.Arbitrary<T>, mul: Op<T>, add: Op<T>, eq: Eq<T>): void {
    fc.assert(fc.property(arb, arb, arb, (a, b, c) => eq(mul(add(a, b), c), add(mul(a, c), mul(b, c)))))
  },

  // z · a = z
  leftZero<T>(arb: fc.Arbitrary<T>, mul: Op<T>, z: T, eq: Eq<T>): void {
    fc.assert(fc.property(arb, (a) => eq(mul(z, a), z)))
  },

  // a · z = z
  rightZero<T>(arb: fc.Arbitrary<T>, mul: Op<T>, z: T, eq: Eq<T>): void {
    fc.assert(fc.property(arb, (a) => eq(mul(a, z), z)))
  },

  // mu(a ∘ b) = mu(a) ∘′ mu(b): the meaning function respects the operation.
  homomorphism<A, B>(arb: fc.Arbitrary<A>, mu: (a: A) => B, opA: Op<A>, opB: Op<B>, eq: Eq<B>): void {
    fc.assert(fc.property(arb, arb, (a, b) => eq(mu(opA(a, b)), opB(mu(a), mu(b)))))
  },
}
