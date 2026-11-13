# RFC 002: Growth algebra

Status: Draft
Date: 2026-11-13

### Related

- VISION.md
- RFC 001 (meaning first): the method this RFC follows
- RFC 003 (Goethean morphology) and RFC 004 (traits): what the rules built on this algebra say, and where their values come from
- PRINCIPLES.md principles 1–6; proposes two design principles (§Proposed design principles)
- Brandon Kase, "Using Abstract Algebra to derive a better Animation Library" (talk), and his [gist](https://gist.github.com/bkase/16b2de2c3bcae1b89287f402daea86ba): the source of the element-level operations
- Rivas, Jaskelioff & Schrijvers, "From monoids to near-semirings: the essence of MonadPlus and Alternative" (2015): the algebra the structure level has
- Pratt, "Modeling concurrency with partial orders" (1986): where timing goes if two operators stop being enough (J5)
- Prusinkiewicz & Lindenmayer, *The Algorithmic Beauty of Plants* (1990): prior art, see §Alternatives
- bd: generative-morphology-fge (review), -bvk (slice 1a), -p3p (slice 1b)

## Summary

Each seed grows one plant over a few seconds, then holds still; the last frame is the image. This RFC defines what "a plant" and "growing" are, independently of which plant: a tree with open tips, a life for each element, and a function from time to a drawing. RFC 003 says what the rules that build the tree are (Goethe); RFC 004 says where their values come from (traits).

Three behaviours of the jig are laws here, with tests:

- moving a control changes the part of the plant that control governs and leaves the rest where it was;
- the scrubber can be dragged in either direction and always shows the same frame for the same time;
- the final image is the growth sampled at its end, at any resolution.

Several choices in the model change what is drawn. They are listed in §Judgement calls and are the user's to make.

## The experience

For one seed, from the viewer's side:

1. **Start.** An empty canvas.
2. **Growth, 2–5 s.** The plant grows in its causal order: an element appears when the element it grows from has finished its primary phase. At any moment the lower, earlier part of the plant is present and whatever is above the growing frontier is absent. Rates vary: a shoot extends quickly then slows, a leaf opens after its node forms.
3. **Settle.** Every change has completed. The drawing holds still.
4. **Image.** The live canvas is replaced by the settled state rendered once at high resolution, which is also the export.

In the jig: the same, plus a time scrubber.

## Proposed design principles

These enter PRINCIPLES.md only when approved, and are numbered then.

> **The phytomer is the unit of structure.** All structure, including branches and compound leaves, is phytomers repeated and nested. No structure is drawn that isn't built from phytomers. (Principle 4 applied.)

> **The animation is the growth.** What the viewer sees over time is the generated structure growing in its causal order. Nothing appears that growth didn't produce, and the final frame is the image.

## Meaning and laws

### Form: a tree with open tips

The meaning of a generated plant, ignoring time, is a finite tree:

```ts
type Tree<X> = readonly Shoot<X>[]   // siblings in slot order; [] is "nothing here"
type Shoot<X> =
  | { kind: 'tip'; ctx: X }          // open: growth can continue from here, with this context
  | { kind: 'closed' }               // a slot that grows nothing further
  | { kind: 'element'; element: Element; children: Tree<X> }

type Rule<A, B> = (ctx: A) => Tree<B>
```

An **element** is one drawn part: an internode, a leaf, a petal. A **rule** is a function from a context to a tree whose open tips carry the contexts for whatever grows next. Four operations:

| Operation | Meaning |
|---|---|
| `tip` | the tree that is one open tip: an unopened bud |
| `nothing` | the empty tree |
| `fork(f, g)` | `f`'s siblings followed by `g`'s, at the same point |
| `then(f, g)` | **continue**: grow `f`; replace each of its open tips with what `g` grows from that tip's context |

`then` is substitution at the tips. (In functional-programming terms `Tree` is a monad and `then` its Kleisli composition. That is a statement about which laws hold, not a request for monad machinery; RFC 001.)

A **phytomer** is a rule, not a node type: it grows an internode whose children are its lateral organ(s), its axillary slot(s), and an open apical tip. A shoot of `n` phytomers is the phytomer rule continued `n` times. A branch is the same rule grown from an axillary slot. A compound leaf is the same pattern inside the leaf.

**Context.** A context travels down through tips and nowhere else. Each tip of a fork carries its own, so siblings can diverge below that point, and a change made to a context is scoped to the subtree grown from it. This RFC puts position in the context (branch order, index along the axis). RFC 003 adds the stage and the archetype; RFC 004 adds traits and mutations.

**Identity.** A node's id is its **path**: the sequence of slot indices from the root, where a tip keeps its slot when it is continued. A node's seed is derived from the root seed and its path, by the combinators and never by a rule. A slot that grows nothing is `closed`, not absent, so the slots beside it keep their indices. Placement around a node (alternate, opposite, whorled, spiral) is a function of the slot index, a trait and the node's seed; it is not part of the algebra.

### Life: timed contributions to one element

After Kase. Each element has a **life**, built from **phases**. The meaning of a life is a duration `d ≥ 0` and a set of keyed, timed contributions, each clamped to its first value before it starts and its last value after it ends. The key is *(property, source)*: two sources may contribute to one property (curvature from two different causes) and the property's value is computed from all its contributions when sampled.

- **sequential** `a · b`: duration `d(a) + d(b)`; `b`'s contributions shifted later by `d(a)`.
- **concurrent** `a + b`: duration `max(d(a), d(b))`; contributions united by key. Two contributions with the same key, the same start and the same values are one contribution. The same key with different starts or values has no meaning yet (open question 1), so the laws below are stated for terms in which that doesn't occur.
- **instant**: duration 0, no contributions. It is the identity of both operations.

Concurrent values are united by key and not averaged, as Kase does, because averaging is not associative: avg(avg(1, 2), 4) = 2.75 but avg(1, avg(2, 4)) = 2.

An element's life has a **primary** part, which must finish before growth continues from its tips (an internode elongating), and may have a **secondary** part that runs on alongside what grows next (thickening, ageing, bending under its own length). No separate mechanism is needed: this is "primary, then (secondary concurrent with everything that grows next)".

### Growth: the tree, with a start time for each element

```
start(root element) = 0
start(child)        = start(parent) + primary(parent)
```

An element's start time is the sum of the primary durations along its path. The **settle time** is the latest moment at which anything is still changing. Sampling is a function:

```
sample : Growth → Time → Drawing
```

and the image is `sample(g, settle(g))`. Time is in growth units, not seconds and not `[0, 1]`. Normalising to `[0, 1]` and mapping that to wall-clock seconds is a **warp**: one monotone function applied to `t` before sampling, kept out of the algebra. One presentation parameter in the jig sets the wall-clock duration (default in the 2–5 s range).

### Laws

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
- I3. Locality. If two runs differ only in what a rule grows under path `π`, every node not under `π` has the same id, seed and element in both.

**Time.**

- T1. Causality. Every element starts exactly when its parent's primary duration ends.
- T2. Prefix. `then(f, g)` gives `f`'s elements the same start times and lives that `f` alone gives them. (Holds in growth units. It fails after normalising to `[0, 1]`, which is why normalisation is a warp applied afterwards.)
- T3. Settling. `sample(g, t) = sample(g, settle(g))` for every `t ≥ settle(g)`.
- T4. Sampling is a pure function of seed, context and `t`. (Principle 1, extended to time.)
- T5. The tree drawn at the settle time has exactly the elements of the form meaning.

**Life.**

- E1. Sequential is associative with identity instant.
- E2. Concurrent is associative, commutative and idempotent, with identity instant.
- E3. Duration is a homomorphism into `(max, +)`: `d(a · b) = d(a) + d(b)` and `d(a + b) = max(d(a), d(b))`.
- E4. Sequential distributes over concurrent from the left: `a · (b + c) = a·b + a·c`. (The right-hand side holds `a`'s contributions twice, identically, which is one copy by the rule above.)

**Not laws.** Right distributivity: with `d(a) = 1` and `d(b) = 2`, `(a + b) · c` starts `c` at 2, while `a·c + b·c` starts one `c` at 1 and another at 2. A zero: with durations `≥ 0` the identity of concurrent is instant, the same element as the identity of sequential, and nothing annihilates.

So each level has two monoids and one distributive law, on opposite sides. The structure level is a **near-semiring** in the sense of Rivas et al.; the element level is the same shape without a zero. Neither is the semiring VISION.md starts from (§Alternatives).

### Where a semiring does appear

As measurement. A semiring appears whenever we ask a question of the tree whose answer adds across siblings and multiplies along a path:

- **Counting.** The number of open tips of `fork(f, g)` is the sum of the two counts. For rules whose tip count does not depend on context, the count of `then(f, g)` is the product. That is `(ℕ, +, ×)`.
- **Timing.** A tip's time is the sum of primary durations along its path; the latest is the maximum over paths. That is `(max, +)`, and the path that attains the maximum is the plant's critical path.

Both are candidates for inspector readouts (generative-morphology-4uz). Unverified until the slice has tests for them.

## Judgement calls

Each is a choice about the form, with a recommendation and what the recommendation gives up.

**J1. Does a shoot that stops growing stay drawn?** Recommended: yes (`then(p, nothing)` is `p`, closed). The alternative is a right zero, under which only shoots that still end in a live tip exist. The recommendation gives up the right-zero law and with it a full semiring. The alternative would make an axis that ends (in a flower, say) inexpressible without a special atom.

**J2. Is a stem that forks the same as two stems from one point?** Recommended: no. The alternative merges any two siblings that begin identically. The recommendation gives up left distributivity at the structure level. It keeps "the tree a rule returns is the tree that is drawn", with no canonicalisation step between generation and render.

**J3. Are siblings ordered?** Recommended: yes, by slot, with a slot that grows nothing kept as `closed`. This is what makes I3 hold: toggling one bud does not reshuffle the plant beside it. It gives up commutativity of `fork`.

**J4. Is there a "cancelled" change?** Kase has one, as the zero of his algebra. Recommended: no. Generation has no reason to emit a cancelled change, and in the timed meaning it has no honest definition. Nothing visible changes.

**J5. Can a phase wait on anything other than its parent's primary phase?** Recommended: not yet. Two operators express only series-parallel timing. "This flower opens when both that stem and that leaf have finished" is a general precedence graph (Pratt's pomsets) and would replace the life algebra with a graph. Stay with two operators until a growth behaviour we want can't be said with them.

**J6. Fixed total time, or fixed rates?** Recommended to start: fixed total time, so every seed plays in the same 2–5 s. With the warp outside the algebra this is a presentation choice that can change late. What it does to the form: a large plant's elements each move faster than a small plant's. Whether that reads as growth is decided by looking at the slice.

## Architectural implications

- **Generation gains three parts**, all pure (principle 1), none touching WebGL (principle 2): *tree* (the type, the four operations, paths and seeds), *life* (phases and their two operations), *growth* (start times, settle time, `sample`). Rules (RFC 003) and traits (RFC 004) sit on top.
- **Combinators assign paths and seeds; rules never do.** This is what makes I1 and I3 enforceable in one place.
- **No canonicalisation pass.** The tree a rule returns is the tree that is drawn.
- **Render receives a drawing for one `t`.** It holds no clock and no previous frame. The scrubber and the final high-resolution image are the same call.
- **Rules are typed by what they hand on.** `Rule<A, B>` composes with `Rule<B, C>` only. RFC 003 uses this for stage order.
- **Reading upwards is a different model.** A rule reading aggregates of what earlier rules realised (generative-morphology-t46) needs information to flow against the direction contexts travel. It stays possible as a second pure pass over the finished tree, but is not a small extension of `then`.
- **Provenance must be a value.** Today every `StructureNode` holds a reference to the one params object the panel mutates, so a node's recorded parameters change after the fact (generative-morphology-foj).
- **Seed derivation is adequate.** `deriveSeed` was checked for sibling, parent–child and adjacent-seed correlation (all below 0.004 over 200 000 seeds) and for collisions in depth-12 trees (none in 409 550 nodes), by a one-off script that is not committed. It needs a path-based contract (I1), not a new hash.
- **Current code.** `GenerationParams`, `StructureNode` and `stub-branch` are replaced by the slice.

## Parameters

Exposed in the jig by this RFC: presentation duration (seconds), and the time scrubber (`t` in `[0, 1]`). Everything else the slice exposes belongs to its placeholder rule.

## First slice

In two parts, so the laws are in place before anything is drawn.

**1a (generative-morphology-bvk).** `Tree`, `Rule`, `tip`, `nothing`, `fork`, `then`, with paths and seeds assigned by the combinators; lives with sequential and concurrent; start times, settle time and `sample`; fast-check generators for trees, rules and lives; a property test for every law above and a failing-as-expected test for every non-law. No rendering.

**1b (generative-morphology-p3p).** One axis of `n` phytomers, each an internode and one leaf drawn as a line, with an axillary slot that is either `closed` or grows one branch of the same rule; rendered from `sample(g, t)`; a scrubber in the jig. Replaces `stub-branch`.

Left out: traits and weight tables, stages, mutations, 3D, line style.

What looking at it should tell us: whether growth in causal order within a fixed total time reads as growth (J6), and whether locality (I3) is felt when a control moves.

1b needs the two proposed design principles above approved, or its rule marked a placeholder as `stub-branch` is.

## Alternatives considered

- **A semiring at each level** (VISION.md's starting hypothesis, after Kase). At the structure level a real one exists: forget everything about the tree except the paths to its open tips, and the multisets of those paths form a semiring with both distributive laws and a two-sided zero. It describes the growing frontier correctly. It is not enough to draw from: it cannot say where a fork is (J2), a shoot that stops is not in it (J1), and ids and seeds would have to come from a canonical form, not from the tree a rule built. At the element level right distributivity fails whenever concurrent branches differ in duration.
- **One parallel operator for both levels.** One operator can't be both idempotent (concurrent changes to one element are one change) and not (two leaves are two leaves).
- **Fork as a keyed map** (children identified by name, not index). Restores commutativity and makes locality automatic, at the cost of `fork` being partial (two children with one name). Worth revisiting if slot indices prove awkward for whorls.
- **L-systems** (Prusinkiewicz & Lindenmayer). The structure level is close to a stochastic, parametric L-system: `then` at tips plays the role of productions, and contexts are close to inherited parameters. The book also covers phyllotaxis and timed growth, so it is the main reference to check rules against. The difference here is that laws are explicit and tested, and time is a function, not a count of derivation steps.
- **Intrinsic durations.** Rejected as the default for a fixed total time (J6), but kept reachable: it is a different warp.

## Open questions

1. **Same key, different contributions.** Is it a generation error, or does each property declare how its contributions combine (sum for curvature; what for colour)? Whether such a clash can be detected from the term without running it is unverified.
2. **Tip types.** Does the apical tip need a different context type from axillary tips? The slice will show.
3. **J1–J6.** The user decides each; J6 after seeing the slice.

New terms used here are defined in GLOSSARY.md, marked as proposed by this RFC.
