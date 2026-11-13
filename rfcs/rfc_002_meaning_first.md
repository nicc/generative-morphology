# RFC 002: Meaning first

Status: Draft
Date: 2026-11-13

### Related

- RFC 001 (phytomer growth algebra): this RFC amends its Model section; see §Amendments to RFC 001
- PRINCIPLES.md principles 1–6; proposes one software principle (§Proposed principle)
- Conal Elliott, ["Denotational design with type class morphisms"](http://conal.net/papers/type-class-morphisms/) (2009): the method used here
- Conal Elliott, ["Push-pull functional reactive programming"](http://conal.net/papers/push-pull-frp/) (2009) and Elliott & Hudak, "Functional reactive animation" (1997): behaviours as functions of continuous time
- Conal Elliott, ["Why program with continuous time?"](http://conal.net/blog/posts/why-program-with-continuous-time) (2010) and "Functional images" (2003): sample late, at whatever resolution is asked for
- Conal Elliott, ["Compiling to categories"](http://conal.net/papers/compiling-to-categories/) (2017): one description, several interpretations (taken in a reduced form, §What we take from Elliott)
- Rivas, Jaskelioff & Schrijvers, "From monoids to near-semirings: the essence of MonadPlus and Alternative" (2015): the algebra the structure level turns out to have
- Pratt, "Modeling concurrency with partial orders" (1986): where the element level sits if sequencing by two operators stops being enough (§Judgement calls, J5)
- bd: generative-morphology-fge (review of this RFC), and the issues listed in §First slice and §Amendments

## Summary

Nothing changes on the canvas. What changes is the order in which we decide things, and three behaviours of the jig stop being hopes and become laws with tests:

- moving a control changes the part of the plant that control governs and leaves the rest where it was;
- the scrubber can be dragged in either direction and always shows the same frame for the same time;
- the final image is the growth sampled at its end, at any resolution.

RFC 001 chose operators and laws first (a semiring at each level) and then looked for a model that satisfies them. This RFC reverses that, following Elliott: say what a plant and its growth *mean* as plain mathematical objects, define each operation by what it does to the meaning, and read the laws off. Done that way, the structure level is a tree with open tips where `continue` is substitution at the tips, and it has one distributive law, not two. The element level has the other one. Neither is a semiring. Semirings still appear, as measurements of the plant (§Where the semiring went).

Several of the differences are visible in the drawing, so they are choices, not corrections. They are listed in §Judgement calls with what each one does to the form.

## Motivation

RFC 001 states laws without saying what `=` compares. That leaves three problems, in order of consequence:

1. **The laws equate terms that generate differently.** Node ids (`rule:path`), seeds (seed lineage) and placement ("the sibling's index in canonical order") are all read from a term's shape. `a · (b + c)` has one `a`; `a·b + a·c` has two, at different paths, with different seeds. RFC 001 calls these equal and resolves it by a drawing convention (shared prefixes drawn once). Which one the generator actually built, and what its seeds are, is undefined.
2. **Two laws have visible consequences that were never presented as choices.** `a · 0 = 0` says a shoot that stops growing is no plant at all. Left distributivity says one stem that forks and two stems from the same point are the same thing.
3. **Commutative fork conflicts with stable ids.** If `a + b = b + a`, siblings have no index, so "canonical order" needs a total order on subterms. Any such order depends on the subterms' contents, so changing a trait deep in one branch can reorder its siblings and reshuffle every seed beside it.

None of these is a flaw in the idea. They come from choosing the algebra before the meaning.

## The method

Elliott's denotational design, in the four steps we will use:

1. For each type, choose a **meaning**: a mathematical object that is simpler than any implementation and makes no reference to one.
2. Write the **meaning function** `μ` from the representation to the meaning.
3. Specify every operation by requiring `μ` to be a homomorphism: `μ(a ⊕ b) = μ(a) ⊕′ μ(b)`, where `⊕′` is the corresponding operation on meanings. ("The instance's meaning follows the meaning's instance.")
4. Two values are **equal** when their meanings are. Laws are whatever equations hold in the meaning; they are derived and then tested, not postulated. Anything downstream reads only what the meaning determines. An observation that can tell apart two values with the same meaning is a bug in the abstraction.

A corollary we rely on: while performance allows, make the representation the same shape as the meaning. Then `μ` is close to the identity, structural equality is semantic equality, and the laws are checkable with `toEqual`.

## Meanings

### Form: a tree with open tips

The meaning of a generated plant (ignoring time) is a finite tree:

```ts
type Tree<X> = readonly Shoot<X>[]   // siblings in slot order; [] is "nothing here"
type Shoot<X> =
  | { kind: 'tip'; ctx: X }          // open: growth can continue from here, with this context
  | { kind: 'closed' }               // a slot that grows nothing further
  | { kind: 'part'; part: Part; children: Tree<X> }

type Rule<A, B> = (ctx: A) => Tree<B>
```

A **rule** is a function from a context to a tree whose open tips carry the contexts for whatever grows next. The four operations:

| Operation | Meaning | RFC 001 name |
|---|---|---|
| `tip` | the tree that is one open tip | `1`, an unopened bud |
| `nothing` | the empty tree | `0` |
| `fork(f, g)` | `f`'s siblings followed by `g`'s, at the same point | `f + g` |
| `then(f, g)` | grow `f`; replace each of its open tips with what `g` grows from that tip's context | `f · g`, with pass-forward |

`then` is substitution at the tips. In functional-programming terms `Tree` is a monad and `then` is its Kleisli composition; that is a statement about which laws hold, not a request to build monad machinery (§What we take from Elliott). Pass-forward, per-branch scoping of the context, and "a mutation is a context transform scoped to a subtree" all follow from this shape without further rules: a context only travels down through tips.

**Identity.** A node's id is its **path**: the sequence of slot indices from the root, where an open tip keeps its slot when it is continued. A node's seed is derived from the root seed and its path, by the combinators and never by a rule. A slot that grows nothing is `closed`, not absent, so the slots beside it keep their indices.

### Growth: the tree, with a start time and a life for each part

Each part has a **life**: its properties as functions of the time since it started, and a **primary duration** after which growth continues from its tips. The meaning of a growing plant is the tree plus, for each part,

```
start(root part)  = 0
start(child)      = start(parent) + primary(parent)
```

so a part's start time is the sum of the primary durations along its path. The **settle time** is the latest moment at which anything is still changing. Sampling is a function:

```
sample : Growth → Time → Drawing
```

and the image is `sample(g, settle(g))`. Time here is in growth units, not seconds and not `[0, 1]`. Normalising to `[0, 1]` and mapping to wall-clock seconds is one monotone function applied to `t` before sampling (a time warp), kept out of the algebra. RFC 001's primary/secondary split needs no separate mechanism: it is "primary, then (secondary concurrent with everything that grows next)".

### A part's life: timed contributions

Within one part, a life is built from phases. The meaning of a life is a duration `d ≥ 0` and a set of keyed, timed contributions (RFC 001's *(property, source)* keys), each clamped to its first value before it starts and its last value after it ends:

- **sequential** `a · b`: duration `d(a) + d(b)`; `b`'s contributions shifted later by `d(a)`.
- **concurrent** `a + b`: duration `max(d(a), d(b))`; contributions united by key. Two contributions with the same key, the same start and the same values are one contribution. The same key with different starts or values has no meaning yet (RFC 001 open question 7), so the laws below are stated for terms in which that doesn't occur.
- **instant**: duration 0, no contributions. It is the identity of both operations.

## Laws

Derived from the meanings above. Each becomes a property test in the first slice; none has been machine-checked yet.

**Form.**

- F1. `then` is associative.
- F2. `tip` is the identity of `then` on both sides.
- F3. `fork` is associative, with identity `nothing`.
- F4. `then` distributes over `fork` from the right: `then(fork(f, g), h) = fork(then(f, h), then(g, h))`. (What grows next grows at every tip.)
- F5. `then(nothing, f) = nothing`.

**Not laws**, with the smallest counterexample:

- Left distributivity. `then(p, fork(q, r))` is one `p` carrying `q` and `r`. `fork(then(p, q), then(p, r))` is two `p`s.
- Right zero. `then(p, nothing)` is `p` with no way to continue. It is not `nothing`.
- Commutativity of `fork`. `fork(q, r)` puts `q` in slot 0; `fork(r, q)` puts `r` there, with slot 0's seed.

**Identity.**

- I1. A node's seed is a function of the root seed and the node's path, and of nothing else.
- I2. Distinct paths have distinct ids.
- I3. Locality. If two runs differ only in what a rule grows under path `π`, every node not under `π` has the same id, seed and part in both.

**Time.**

- T1. Causality. Every part starts exactly when its parent's primary duration ends.
- T2. Prefix. `then(f, g)` gives `f`'s parts the same start times and lives that `f` alone gives them. (Holds in growth units. It fails after normalising to `[0, 1]`, which is why normalisation is a warp applied afterwards.)
- T3. Settling. `sample(g, t) = sample(g, settle(g))` for every `t ≥ settle(g)`.
- T4. Sampling is a pure function of seed, traits and `t`. (Principle 1, extended to time.)
- T5. The tree drawn at the settle time has exactly the parts of the form meaning.

**Life.**

- E1. Sequential is associative with identity instant.
- E2. Concurrent is associative, commutative and idempotent, with identity instant.
- E3. Duration is a homomorphism into `(max, +)`: `d(a · b) = d(a) + d(b)` and `d(a + b) = max(d(a), d(b))`.
- E4. Sequential distributes over concurrent from the left: `a · (b + c) = a·b + a·c`. (The right-hand side holds `a`'s contributions twice, identically, which is one copy by the rule above.)

**Not laws.** Right distributivity (RFC 001 already found this). A zero: with durations `≥ 0` the identity of concurrent is instant, the same element as the identity of sequential, and nothing annihilates.

So both levels have two monoids and one distributive law, on opposite sides. The structure level is a near-semiring in the sense of Rivas et al. The element level is the same shape without a zero.

## Where the semiring went

It survives as measurement. A semiring appears whenever we ask a question of the tree whose answer adds across siblings and multiplies along a path:

- **Counting.** The number of open tips of `fork(f, g)` is the sum of the two counts. For rules whose tip count does not depend on context, the count of `then(f, g)` is the product. That is `(ℕ, +, ×)`.
- **Timing.** A tip's time is the sum of primary durations along its path; the latest tip is the maximum over paths. That is `(max, +)`, and the path that attains the maximum is the plant's critical path.
- **RFC 001's model.** Forget everything about the tree except the paths to its open tips and you get RFC 001's multiset of paths, with all its laws including `a · 0 = 0` and left distributivity. It is a correct description of the growing frontier. It is not enough to draw from.

These are candidates for the inspector (principle 6): tip count and critical path as readouts. Unverified until the slice has tests for them.

## Judgement calls

Each is a choice about the form. The recommendation is given with what is lost by taking it.

**J1. Does a shoot that stops growing stay drawn?** Recommended: yes (`then(p, nothing)` is `p`, closed). The alternative is RFC 001's `a · 0 = 0`, under which only shoots that still end in a live tip exist. Taking the recommendation loses the right-zero law, and with it the full semiring. The alternative would make determinate growth (an axis that ends in a flower) inexpressible without a special atom.

**J2. Is a stem that forks the same as two stems from one point?** Recommended: no. The alternative merges any two siblings that begin identically, which is RFC 001's "shared prefixes drawn once". Taking the recommendation loses left distributivity at the structure level. It keeps "what the term says is what is drawn", with no canonicalisation step between generation and render.

**J3. Are siblings ordered?** Recommended: yes, by slot, and a slot that grows nothing is `closed`. This is what makes I3 hold: toggling one bud does not reshuffle the plant beside it. It loses commutativity of `fork`. Placement (alternate, opposite, whorled, spiral) becomes a function of the slot index, which is what RFC 001 wanted from "index in canonical order".

**J4. Does the element level keep `Cancelled`?** Recommended: drop it. Generation has no reason to emit a cancelled change, and in the timed meaning it has no honest definition. Nothing visible changes.

**J5. Can a phase wait on anything other than its parent's primary phase?** (RFC 001 open question 4.) Recommended: no, for now. Two operators can only express series-parallel timing. "This flower opens when both that stem and that leaf have finished" is a general precedence graph (Pratt's pomsets) and would replace the life algebra with a graph. Stay with two operators until a growth behaviour we want can't be said with them.

**J6. Fixed total time, or fixed rates?** RFC 001 chose fixed total time (every seed plays in the same 2–5 s). With the warp kept outside the algebra this stays a presentation choice that can be changed late. What it does to the form: a large plant's parts each move faster than a small plant's. Whether that reads as growth is a question for looking at, not for this RFC.

## What we take from Elliott

Four ideas were on the table. They do not cost the same.

| Idea | Decision | What it commits us to |
|---|---|---|
| Denotational design | Adopt in full | A meaning and meaning function for each generation type, stated in its RFC; laws as property tests. |
| Continuous time | Adopt | `sample(g, t)` is pure; render keeps no state between frames; the warp is one function. |
| Continuous space | Adopt as intent, mechanism deferred | Generation describes a part's geometry as a curve, render decides how finely to cut it. Needs its own RFC (generative-morphology-ybg). |
| Compiling to categories | Take the goal, not the technique | The technique is a Haskell compiler plugin and has no TypeScript counterpart. The goal is one description read several ways. We get it by keeping trees, lives and curves as plain data and writing each reading (draw, schedule, inspect, count) as a separate fold. |
| Calculating implementations | Defer | When something is too slow, the plain version stays as the reference and the fast one is tested against it. Nothing to do until then. |

Three things to leave on the shelf: Elliott's reactive events (the piece has no interaction during growth), generic `Functor`/`Monad` abstractions in TypeScript (there is one tree type; `then` and `fork` are two functions), and automatic differentiation.

One tension to hold deliberately. Elliott's meanings are functions (of time, of space). Functions in a data structure can't be compared, printed or shown in an inspector, which works against principle 6. The resolution is his own: functions are the *meaning*; the *representation* is data with an evaluator. A curve is a record that the inspector can show and `sample` can evaluate.

## Architectural implications

- **Rules are typed by what they hand on.** `Rule<A, B>` composes with `Rule<B, C>` only. If each stage has its own context type, "no calyx before leaves" is a compile error, not a runtime check. How far to take this is for the slice to find out.
- **Combinators assign paths and seeds; rules never do.** This is what makes I1 and I3 enforceable in one place.
- **No canonicalisation pass.** The tree a rule returns is the tree that is drawn.
- **Render receives a drawing for one `t`.** It holds no clock and no previous frame. The scrubber and the final high-resolution image are the same call.
- **Reading upwards is a different model.** generative-morphology-t46 (a stage reading aggregates of realised instances) needs information to flow against the direction contexts travel. It stays possible as a second pure pass over the finished tree, but it is not a small extension of `then`.
- **Provenance must be a value.** Today every `StructureNode` holds a reference to the one params object the panel mutates, so a node's recorded parameters change after the fact (generative-morphology-foj).
- **Seed derivation is adequate.** `deriveSeed` was checked for sibling, parent–child and adjacent-seed correlation (all below 0.004 over 200 000 seeds) and for collisions in depth-12 trees (none in 409 550 nodes). It needs a path-based contract (I1), not a new hash.

## Proposed principle

A software principle, to enter PRINCIPLES.md only if approved, numbered then.

> **Meaning before representation.** Every generation type has a stated meaning (a mathematical object simpler than the code) and a meaning function onto it. Each operation is specified by what it does to the meaning, and two values are equal when their meanings are. Laws are derived from the meaning and tested, never assumed. Everything downstream (render, ids, seeds, the inspector) reads only what the meaning determines.

## First slice

The ideas are well ahead of the code. Before RFC 001 or this RFC is accepted in full, build the smallest thing that exercises every law above and can be looked at (generative-morphology-p3p):

- one axis of `n` phytomers, each an internode and one leaf drawn as a line, with an axillary slot that is either `closed` or grows one branch of the same rule;
- `tip`, `nothing`, `fork`, `then`; paths and seeds assigned by the combinators;
- a life per part with a primary duration; `sample(g, t)`; a scrubber in the jig;
- property tests for F1–F5, I1–I3, T1–T5 and E1–E4.

It leaves out traits and weight tables, stages, mutations, 3D and line style. What looking at it should tell us: whether growth in causal order within a fixed total time reads as growth (J6), and whether locality (I3) is felt when a control moves.

It needs either RFC 001's proposed principles 9 and 11 approved, or to be marked a placeholder as `stub-branch` is.

## Amendments to RFC 001

If this RFC is accepted (generative-morphology-o3h):

- §Two levels and §Structure level: replace the semiring table and laws with F1–F5 and the three non-laws; delete the path-multiset model, the canonical form, and the "Subtlety" paragraph (it no longer arises).
- §Structure level, placement: a function of slot index, not of canonical order.
- §Element level: drop `Cancelled`; state the meaning as timed keyed contributions; keep the value-combination argument.
- §How the levels meet: primary/secondary restated as "primary, then (secondary concurrent with what grows next)".
- §Time: weights in growth units; normalisation as a warp.
- §Architecture and tooling: no canonical form or normalisation in *algebra*; render samples at `t`.
- Open questions 1 and 4 are answered by J4/J5 and the laws above.

Unaffected: the experience, the proposed design principles 7–11, the stage backbone, traits, weight tables, mutations, curves, anastomosis.

## Alternatives considered

- **Keep RFC 001's semiring and fix the gaps.** Possible: it is a real semiring. It loses J1 and J2 and needs a canonicalisation step whose output, not the term, carries ids and seeds.
- **Fork as a keyed map** (children identified by name, not index). Restores commutativity and makes locality automatic, at the cost of `fork` being partial (two children with one name). Worth revisiting if slot indices prove awkward for whorls.
- **Tagless-final encoding** (rules written against an interface, interpreted several ways). Closer to Elliott's Haskell. Rejected for plain data and folds: data can be compared, generated by fast-check, and shown in an inspector.

## Open questions

1. J1–J6. The user decides each; J6 after seeing the slice.
2. Does the apical tip need a different context type from axillary tips (same stage, next index, versus vegetative stage, next order)? The slice will show whether one tip type is enough.
3. Which proof tool, if any, checks F1–F5 beyond property tests (generative-morphology-3qk)?
4. Same-key contributions (RFC 001 open question 7) is untouched here.

New terms used here are defined in GLOSSARY.md, marked as proposed by this RFC.
