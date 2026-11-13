# RFC 001: Meaning first

Status: Accepted (→ principle 7)
Date: 2026-11-13

### Related

- PRINCIPLES.md principles 1–6; source of principle 7 (§Principle)
- RFC 002 (growth algebra), RFC 003 (Goethean morphology), RFC 004 (traits): each applies this method to its own subject
- Conal Elliott, ["Denotational design with type class morphisms"](http://conal.net/papers/type-class-morphisms/) (2009): the method
- Conal Elliott, ["Push-pull functional reactive programming"](http://conal.net/papers/push-pull-frp/) (2009) and Elliott & Hudak, "Functional reactive animation" (1997): behaviours as functions of continuous time
- Conal Elliott, ["Why program with continuous time?"](http://conal.net/blog/posts/why-program-with-continuous-time) (2010) and "Functional images" (2003): sample late, at whatever resolution is asked for
- Conal Elliott, ["Compiling to categories"](http://conal.net/papers/compiling-to-categories/) (2017): one description, several interpretations (taken in a reduced form, §What we take from Elliott)
- bd: generative-morphology-fge (review), -3qk (proof tool)

## Summary

This RFC is about how we design, not what is drawn. It fixes the order in which a generation type gets decided: first what it *means*, as a plain mathematical object; then its operations, each defined by what it does to the meaning; then the laws, read off the meaning and tested. Operators and law tables come last.

What that buys someone using the jig is that behaviours we would otherwise hope for become laws with tests: a control changes only what it governs, the scrubber shows the same frame for the same time, the final image is the growth sampled at its end. RFC 002 states those laws; this RFC states the method that produces them.

## Motivation

VISION.md starts from an algebra: a semiring, with addition for parallel and multiplication for sequential. Starting from the algebra invites choosing laws and then looking for a model that satisfies them. Where the model resists, the gap gets filled by a convention: "drawn once", "in canonical order", "in practice never identical". Each convention is a place where two things the laws call equal are told apart by something downstream (an id, a seed, a position), and each is a sign that the meaning was never stated.

Starting from the meaning removes the gap. The laws are whatever is true of the meaning, so there is nothing to patch, and the choices that remain are visible as choices about the form.

## The method

Elliott's denotational design, in four steps:

1. For each type, choose a **meaning**: a mathematical object that is simpler than any implementation and makes no reference to one.
2. Write the **meaning function** `μ` from the representation to the meaning.
3. Specify every operation by requiring `μ` to be a homomorphism: `μ(a ⊕ b) = μ(a) ⊕′ μ(b)`, where `⊕′` is the corresponding operation on meanings. ("The instance's meaning follows the meaning's instance.")
4. Two values are **equal** when their meanings are. A **law** is an equation that holds in the meaning; it is derived, then tested, never postulated. Anything downstream reads only what the meaning determines. An observation that can tell apart two values with the same meaning is a bug in the abstraction.

Three working rules follow.

- **Order of work.** The Meaning and laws section of an RFC is written, and read by the user, before any operator table, architecture or parameter list. (rfcs/README.md, Order of work.)
- **Representation follows meaning.** While performance allows, the representation has the same shape as the meaning. Then `μ` is close to the identity, structural equality is semantic equality, and laws are checkable with `toEqual`.
- **Non-laws are recorded.** An equation that looks as if it should hold and doesn't is written down with its smallest counterexample and given a test that expects failure, so nobody restores it later.

## What we take from Elliott

His ideas do not all cost the same. What is adopted, and what each commits us to:

| Idea | Decision | What it commits us to |
|---|---|---|
| Denotational design | Adopt in full | A meaning and meaning function for each generation type, stated in its RFC; laws as property tests. |
| Continuous time | Adopt | Growth is a function of `t`, sampled on demand; render keeps no state between frames. (RFC 002.) |
| Continuous space | Adopt as intent, mechanism deferred | Generation describes geometry as curves; render decides how finely to cut them. Needs its own RFC (generative-morphology-ybg). |
| Compiling to categories | Take the goal, not the technique | The technique is a Haskell compiler plugin with no TypeScript counterpart. The goal is one description read several ways. We get it by keeping trees, lives and curves as plain data and writing each reading (draw, schedule, inspect, count) as a separate fold. This is what principle 6 needs. |
| Calculating implementations | Defer | When something is too slow, the plain version stays as the reference and the fast one is tested against it. Nothing to do until then. |

Left on the shelf: Elliott's reactive events (the piece has no interaction during growth), generic `Functor`/`Monad` abstractions in TypeScript (there is one tree type; its operations are plain functions), and automatic differentiation.

**One tension, held deliberately.** Elliott's meanings are functions (of time, of space). A function stored in a data structure can't be compared, printed or shown in an inspector, which works against principle 6. The resolution is his own: the function is the *meaning*; the *representation* is data with an evaluator.

## Principle

A software principle, proposed here and approved on 2026-11-13. The text of record is PRINCIPLES.md.

> **7. Meaning before representation.** Every generation type has a stated meaning (a mathematical object simpler than the code) and a meaning function onto it. Each operation is specified by what it does to the meaning, and two values are equal when their meanings are. Laws are derived from the meaning and tested, never assumed. Everything downstream (render, ids, seeds, the inspector) reads only what the meaning determines.

## Principles check

- Principle 1 (pure generation): a meaning function exists only for pure code; the method presupposes it.
- Principle 2 (generation and rendering separate): "downstream reads only what the meaning determines" is the same boundary, stated as a test.
- Principle 4 (composition over special cases): laws are what make repeated application of small rules predictable.
- Principle 6 (every stage visible): met by data plus folds, and the reason functions are not stored in structures.

## What exists

- [src/testing/laws.ts](../src/testing/laws.ts): property-based checkers (associative, commutative, idempotent, identity, both distributive laws, zeros, homomorphism) over fast-check generators, taking the equality of meanings as an argument. Its tests show each checker passing on a structure that has the law and failing on one that doesn't.
- rfcs/README.md: the Meaning and laws, Judgement calls and First slice sections, and the order of work.
- specs/README.md: laws carry ids and name their tests.
- .github/pr-review.md: check 5, Meaning and laws.

## Alternatives considered

- **Operators first.** Choose the algebra (a semiring), then fit the model. Rejected for the reason in §Motivation.
- **Tagless-final encoding** (rules written against an interface, interpreted several ways). Closer to Elliott's Haskell. Rejected for plain data and folds: data can be compared, generated by fast-check, and shown in an inspector.
- **Proofs instead of property tests.** Not an alternative to the method but a stronger check of its output; which tool, and whether it adds anything, is open (generative-morphology-3qk).

## Open questions

1. Which proof tool, if any? (generative-morphology-3qk, after the first slice of RFC 002.)

New terms used here are defined in GLOSSARY.md.
