# RFC 002: Growth algebra

Status: Discussion (design principles accepted → principles 9 and 10; J1–J6 decided; the laws become spec text with slice 1a)
Date: 2026-11-13

### Related

- VISION.md
- RFC 001 (meaning first): the method this RFC follows
- RFC 003 (Goethean morphology) and RFC 004 (traits): what the rules built on this algebra say, and where their values come from
- PRINCIPLES.md principles 1–8; source of design principles 9 and 10 (§Design principles)
- Brandon Kase, "Using Abstract Algebra to derive a better Animation Library" (talk), and his [gist](https://gist.github.com/bkase/16b2de2c3bcae1b89287f402daea86ba): the source of the element-level operations
- Rivas, Jaskelioff & Schrijvers, "From monoids to near-semirings: the essence of MonadPlus and Alternative" (2015): the algebra the structure level would have if a bud could grow several shoots (J2, §Alternatives)
- Pratt, "Modeling concurrency with partial orders" (1986): where timing goes if two operators stop being enough (J5)
- Prusinkiewicz & Lindenmayer, *The Algorithmic Beauty of Plants* (1990): prior art, see §Alternatives
- bd: generative-morphology-fge (review), -bvk (slice 1a), -p3p (slice 1b)

## Summary

Each seed grows one plant over a few seconds, then holds still; the last frame is the image. This RFC defines what "a plant" and "growing" are, independently of which plant: a tree with open buds, a life for each element, and a function from time to a drawing. RFC 003 says what the rules that build the tree are (Goethe); RFC 004 says where their values come from (traits).

Three behaviours of the jig are laws here, with tests:

- moving a control changes the part of the plant that control governs and leaves the rest where it was;
- the scrubber can be dragged in either direction and always shows the same frame for the same time;
- the final image is the growth sampled at its end, at any resolution.

Several choices in the model change what is drawn. They are listed in §Judgement calls, with what was decided.

## The experience

For one seed, from the viewer's side:

1. **Start.** An empty canvas.
2. **Growth, 2–5 s.** The plant grows in its causal order: an element appears when the element it grows from has finished its primary phase. At any moment the lower, earlier part of the plant is present and whatever is above the growing frontier is absent. Rates vary: a shoot extends quickly then slows, a leaf opens after its node forms.
3. **Settle.** Every change has completed. The drawing holds still.
4. **Image.** The live canvas is replaced by the settled state rendered once at high resolution, which is also the export.

In the jig: the same, plus a time scrubber.

## Design principles

Proposed here and approved on 2026-11-13. The text of record is PRINCIPLES.md.

> **9. The phytomer is the unit of structure.** All structure, including branches and compound leaves, is phytomers repeated and nested. No structure is drawn that isn't built from phytomers. (Principle 4 applied.)

> **10. The animation is the growth.** What the viewer sees over time is the generated structure growing in its causal order. Nothing appears that growth didn't produce, and the final frame is the image.

## Meaning and laws

### Form: a tree with open buds

The meaning of a generated plant, ignoring time, is a finite tree:

```ts
type Shoot<X> =
  | { kind: 'bud'; ctx: X }          // open: growth can continue from here, with this context
  | { kind: 'closed' }               // grows nothing further
  | { kind: 'element'; element: Element; children: readonly Shoot<X>[] }   // one child per slot, in slot order

type Rule<A, B> = (ctx: A) => Shoot<B>
```

The vocabulary, drawn in [GLOSSARY.md](../GLOSSARY.md#diagrams):

- An **element** is one drawn part: an internode, a leaf, a petal.
- An element has ordered **slots**, and each slot holds exactly one shoot. An internode's slots all sit at its **node**, its upper end: one slot for each lateral organ, one for each axillary bud, and one apical slot. So several slots share a node. A node is not a separate thing in the tree; it is where an internode's slots attach.
- A **bud** is a slot that is still open: it holds no element yet and carries the context for whatever grows there. An **apical** bud continues its axis. An **axillary** bud sits in the axil of a leaf and starts a new axis, a branch. A bud grows exactly one shoot (J2).
- **Closed** is a slot that will grow nothing: a bud that never opens, or an axis that has ended.
- A **shoot** is any such tree, at any size: a single bud, a leaf, a branch, the whole plant. Anything cut off at a slot is a shoot. (Botany uses the word for a stem with its leaves. We also use it for a leaf, which has a precedent in Agnes Arber's reading of Goethe, where the leaf is a partial shoot.)
- A **rule** builds a shoot from a context.

An `Element` is plain data: its kind (internode, leaf, …), the values its geometry is drawn from, and its life (§Life). Two elements are equal when those are.

Four operations build rules. Each is given by the shoot it grows from a context `c`:

| Operation | Type | The shoot it grows from context `c` |
|---|---|---|
| `bud` | `Rule<A, A>` | one open bud carrying `c` |
| `closed` | `Rule<A, B>` | one closed slot |
| `grow(e, f₁ … fₙ)` | `e : A → Element`, each `fᵢ : Rule<A, B>`; gives `Rule<A, B>` | the element `e(c)` with `n` slots, slot `i` holding the shoot `fᵢ` grows from `c` at slot `i` |
| `then(f, g)` | `f : Rule<A, B>`, `g : Rule<B, C>`; gives `Rule<A, C>` | **continue**: the shoot `f` grows from `c`, with each open bud replaced by the shoot `g` grows from that bud's context |

"`c` at slot `i`" is `c` with its path extended by `i` and nothing else changed. Two rules are equal when they grow equal shoots from every context; the laws below are equations between rules.

`then` is substitution at the buds. (In functional-programming terms `Shoot` is a monad and `then` its Kleisli composition. That is a statement about which laws hold, not a request for monad machinery; RFC 001.)

**How the pieces fit.** Phytomers are rules. Rules build shoots. Shoots are made of elements. `grow` makes one element and says what goes in each of its slots, so a rule calls it once per element. The **phytomer** rule calls it once for the internode and once for each leaf:

```
leaf     = grow(blade)                          one element, no slots
phytomer = grow(internode, leaf, bud ∘ axillary, bud ∘ apical)
                           └ 0   └ slot 1        └ slot 2
```

`axillary` and `apical` are functions on contexts (§Context): each marks which kind of bud this is, and moves the position. The phytomer leaves both buds open. What happens at them is decided by the rule that is continued there, which reads the bud's context:

```
onward(c) = bud(c)                       if c is apical and its index has reached the axis's length
          = closed(c)                    if c is axillary and its bud does not grow out
          = then(phytomer, onward)(c)    otherwise

stem = then(phytomer, onward)
```

Because `then` grows its second rule at *every* open bud (F4), a bare `then(phytomer, phytomer)` would grow a phytomer in the axil as well as at the apex. It is `onward` reading the context that makes an apical bud continue the axis and an axillary bud branch or close.

`onward` is defined by recursion, and that recursion is the only thing that ends an axis. It is finite because every step either stops or moves the context towards a bound that the context itself carries: `apical` raises the index, which stops at the axis's length; `axillary` raises the branch order, and no bud grows out at the maximum order. Length and maximum order are traits, read from the context when the rule is grown, so each branch ends by its own length.

A rule must close every bud it does not want a later rule to grow from. The apical bud left open at the end of an axis is where the next stage starts (RFC 003). Whether one context type with a kind field is enough here is open question 2.

So the same rule gives everything else by where it is grown:

- at an **apical** bud, it continues the same axis;
- at an **axillary** bud, it starts a new axis one branch order higher: a branch;
- a rule of the same shape in a **lateral** slot gives a compound organ: a compound leaf is rachis segments bearing leaflets, in the roles of internodes bearing leaves.

Shoot and phytomer are therefore not two kinds of part. A shoot is the thing built; the phytomer is the pattern it is built in. The type `Shoot` would let a rule build any tree of elements. Principle 9 is what says our rules build only phytomers, so every shoot of a plant is phytomers repeated and nested, down to the single phytomer, whose own parts are elements and buds.

Opposite leaves are two lateral slots and two axillary slots at one node. Several buds at the end of a twig (as in *Quercus*) or several in one axil (as in *Prunus*) are several bud slots at one node, each growing its own shoot. The rule decides how many slots a node has, reading traits. What J2 rules out is narrower: one bud turning into several siblings after the fact.

**Context.** A context flows downwards only. `grow` hands the element's context to every one of its slots, lateral, axillary and apical alike; a bud holds the context it was handed; `then` passes each bud's context to the rule that grows from it. Nothing flows up the tree or between siblings.

The context has two parts: `Context<R> = { path, seed, rest: R }`. The **path** is extended by the combinators, as above, and the **seed** is derived by them from the root seed and the path (I1). A rule reads the seed whenever it draws a value, such as whether an axillary bud grows out (RFC 004 says how), and cannot change it. Everything else is `rest`, and rules change it: a rule applies a function `m : R′ → R` to what it hands a slot by composing it in front of that slot's rule (`f ∘ m`, the rule that grows from `c` what `f` grows from `c` with `m` applied to its `rest`). This is ordinary function composition, not a fifth operation, and `m` never receives the path or the seed, so no rule can change either; I1–I3 rest on that. The phytomer rule does this at each slot: `apical` adds one to the index along the axis; `axillary` adds one to the branch order and resets the index; each records which kind of bud it made. A change made this way is scoped to the subtree grown from that slot. This RFC puts branch order, index along the axis and the kind of bud in `rest`. RFC 003 adds the stage and the archetype; RFC 004 adds traits and mutations, a mutation being exactly such a function.

**Identity.** A slot's id is its **path**: the sequence of slot indices from the root, the root slot having the empty path. Because a bud is replaced by exactly one shoot, continuing a bud never changes how many slots its parent has, so no path outside the bud changes. A slot's seed is derived from the root seed and its path, by the combinators and never by a rule. A slot that grows nothing is `closed`, not absent, so the slots beside it keep their indices. The direction in which each slot's shoot leaves its node (alternate, opposite, whorled, spiral) is a function of the slot index, the arrangement trait and the seed; it is geometry read from the tree, not part of the algebra.

### Life: timed contributions to one element

After Kase. Each element has a **life**, built from **phases**. The meaning of a life is a duration `d ≥ 0` and a set of keyed, timed contributions, each clamped to its first value before it starts and its last value after it ends. The key is *(property, source)*: two sources may contribute to one property (curvature from two different causes) and the property's value is computed from all its contributions when sampled.

- **sequential** `a · b`: duration `d(a) + d(b)`; `b`'s contributions shifted later by `d(a)`.
- **concurrent** `a + b`: duration `max(d(a), d(b))`; contributions united by key. Two contributions with the same key, the same start and the same values are one contribution. The same key with different starts or values has no meaning yet (open question 1), so the laws below are stated for terms in which that doesn't occur.
- **instant**: duration 0, no contributions. It is the identity of both operations.

Concurrent values are united by key and not averaged, as Kase does, because averaging is not associative: avg(avg(1, 2), 4) = 2.75 but avg(1, avg(2, 4)) = 2.

An element's life has a **primary** part, which must finish before growth continues from its buds (an internode elongating), and may have a **secondary** part that runs on alongside what grows next (thickening, ageing, bending under its own length). No separate mechanism is needed: this is "primary, then (secondary concurrent with everything that grows next)".

### Growth: the tree, with a start time for each element

```
start(root element) = 0
start(child)        = start(parent) + primary(parent)
```

An element's start time is the sum of the primary durations along its path. The **settle time** is the latest moment at which anything is still changing. Sampling is a function:

```
sample : Growth → Time → Drawing
```

A `Growth` is a shoot with no open buds left to continue, together with the start time of each of its elements; it is determined by the shoot. A `Drawing` is, for one instant, the set of elements that have started, each with its slot path and the value of every property at that instant. Two drawings are equal when those sets are.

and the image is `sample(g, settle(g))`. Time is in growth units, not seconds and not `[0, 1]`. Normalising to `[0, 1]` and mapping that to wall-clock seconds is a **warp**: one monotone function applied to `t` before sampling, kept out of the algebra.

**Duration.** How long a plant takes to grow, in wall-clock seconds, is an input to that plant, not a constant of the piece: a per-plant trait (RFC 004). To begin with the jig pins it (default in the 2–5 s range); later it can be drawn from a weight table or come with a species, so that some plants grow faster than others. It is carried in the root context and read only by the warp. Rules do not read it, which is law T6. Parts of one plant growing at different rates is a separate matter: rules set each element's primary duration from traits, in growth units.

### Laws

Derived from the meanings above. Each becomes a property test in the first slice; none has been machine-checked yet.

**Form.**

- F1. `then` is associative.
- F2. `bud` is the identity of `then` on both sides.
- F3. `closed` is a left zero: `then(closed, f) = closed`.
- F4. `then` passes through an element to its children: `then(grow(e, f₁ … fₙ), h) = grow(e, then(f₁, h) … then(fₙ, h))`. (What grows next grows at every bud.)

**Not laws**, with the smallest counterexample:

- Right zero. `then(grow(e, bud), closed)` is `e` with its slot closed. It is not `closed`.
- Order of children. `grow(e, q, r)` puts `q` in slot 0; `grow(e, r, q)` puts `r` there, with slot 0's seed.

**Identity.**

- I1. A slot's seed is a function of the root seed and the slot's path, and of nothing else.
- I2. Distinct paths have distinct ids.
- I3. Locality. If two runs differ only in what a rule grows under path `π`, every slot not under `π` has the same id, seed and contents in both. (Follows from a bud growing exactly one shoot; the test guards the combinators.)

**Time.**

- T1. Causality. Every element starts exactly when its parent's primary duration ends.
- T2. Prefix. `then(f, g)` gives `f`'s elements the same start times and lives that `f` alone gives them. (Holds in growth units. It fails after normalising to `[0, 1]`, which is why normalisation is a warp applied afterwards.)
- T3. Settling. `sample(g, t) = sample(g, settle(g))` for every `t ≥ settle(g)`.
- T4. Sampling is a pure function of seed, context and `t`. (Principle 1, extended to time.)
- T5. The tree drawn at the settle time has exactly the elements of the form meaning.
- T6. Duration is presentation. Two plants that differ only in duration have the same tree and the same start times and lives in growth units; `sample` at the same fraction of the duration gives the same drawing.

**Life.**

- E1. Sequential is associative with identity instant.
- E2. Concurrent is associative, commutative and idempotent, with identity instant.
- E3. Duration is a homomorphism into `(max, +)`: `d(a · b) = d(a) + d(b)` and `d(a + b) = max(d(a), d(b))`.
- E4. Sequential distributes over concurrent from the left: `a · (b + c) = a·b + a·c`. (The right-hand side holds `a`'s contributions twice, identically, which is one copy by the rule above.)

**Not laws.** Right distributivity: with `d(a) = 1` and `d(b) = 2`, `(a + b) · c` starts `c` at 2, while `a·c + b·c` starts one `c` at 1 and another at 2. A zero: with durations `≥ 0` the identity of concurrent is instant, the same element as the identity of sequential, and nothing annihilates.

So the two levels have different algebras. The structure level is substitution: one monoid (`then`, `bud`) with a left zero, which passes through branching. The element level is two monoids sharing an identity, with one distributive law. Neither is the semiring VISION.md starts from (§Alternatives).

### Where a semiring does appear

As measurement. A semiring appears whenever we ask a question of the tree whose answer adds across siblings and multiplies along a path:

- **Counting.** The number of open buds of `grow(e, f₁ … fₙ)` is the sum of the children's counts. For rules whose bud count does not depend on context, the count of `then(f, g)` is the product. That is `(ℕ, +, ×)`.
- **Timing.** A bud's time is the sum of primary durations along its path; the latest is the maximum over paths. That is `(max, +)`, and the path that attains the maximum is the plant's critical path.

Both are candidates for inspector readouts (generative-morphology-4uz). Unverified until the slice has tests for them.

## Judgement calls

Each is a choice about the form. All six were decided by the user on 2026-11-13; the reasoning is kept because it says what each decision gives up.

**J1. Does a shoot that stops growing stay drawn?** Decided: yes. Continuing with `closed` closes the buds and keeps the shoot. The alternative is a right zero, under which only shoots that still end in an open bud exist. This gives up the right-zero law and with it a full semiring. The alternative would make an axis that ends (in a flower, say) inexpressible without a special atom.

**J2. Can a bud grow more than one shoot?** Decided: no, given that several buds can share a node. A bud grows one shoot; several things at one point are several slots of one element (opposite leaves, a cluster of buds at the end of a twig, several buds in one axil; GLOSSARY.md, phytomer diagram, panels b and c). The alternative lets a bud be replaced by several siblings, which makes `fork` an operation on rules and gives the structure level a second monoid and a distributive law (a near-semiring). It cannot be had together with stable ids: if the buds in slots 0 and 1 are continued and slot 0 grows two siblings where it grew one, slot 1's contents move to slot 2 and get a different id and seed. In the jig that is one bud changing and the rest of the plant reshuffling. The decision gives up `fork` as algebra; it keeps I3 by construction. It also means the number of slots at a node is fixed by the rule that grows the element, when it grows it.

**J3. Are siblings ordered?** Decided: yes, by slot, with a slot that grows nothing kept as `closed`. A plant accrues over time and never rearranges itself. Toggling one bud leaves the slots beside it alone. It gives up any law that reorders children.

**J4. Is there a "cancelled" change?** Kase has one, as the zero of his algebra. Decided: no. A shoot that dies is a bud that is `closed`, and how likely that is can be a trait (a fitness). What adding more later would cost depends on when the death is decided:

- *Decided when the bud is grown* (this bud never opens): nothing to add. It is `closed`, chosen by a trait.
- *A shoot that grows, then withers or stops part-way*: small. Withering is a secondary phase. Stopping part-way is one new operation on lives, "the first `d` of this life", with its laws to state and test; start times follow because they only read durations.
- *Decided by what another part of the plant did* (this branch dies because that one shaded it): large. Contexts flow down only, so this needs the second pass over the finished tree (generative-morphology-t46), or the precedence graph of J5.

**J5. Can a phase wait on anything other than its parent's primary phase?** Decided: not yet. Two operators express only series-parallel timing. "This flower opens when both that stem and that leaf have finished" is a general precedence graph (Pratt's pomsets) and would replace the life algebra with a graph. Stay with two operators until a growth behaviour we want can't be said with them.

**J6. Fixed total time, or fixed rates?** Decided: a fixed total per plant, passed in as that plant's duration (§Growth, T6) so it can later come from a weight table or a species. What it does to the form: within one plant, a large plant's elements each move faster than a small plant's would at the same duration. Whether that reads as growth is still checked by looking at the slice.

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

Exposed in the jig by this RFC: the plant's duration (seconds; a pinned trait, §Growth), and the time scrubber (`t` in `[0, 1]`). Everything else the slice exposes belongs to its placeholder rule.

## First slice

In two parts, so the laws are in place before anything is drawn.

**1a (generative-morphology-bvk).** `Shoot`, `Rule`, `bud`, `closed`, `grow`, `then`, with paths and seeds assigned by the combinators; lives with sequential and concurrent; start times, settle time and `sample`; fast-check generators for trees, rules and lives; a property test for every law above and a failing-as-expected test for every non-law. No rendering.

**1b (generative-morphology-p3p).** One axis of `n` phytomers, each an internode and one leaf drawn as a line, with an axillary slot that is either `closed` or grows one branch of the same rule; rendered from `sample(g, t)`; a scrubber in the jig. Replaces `stub-branch`.

Left out: traits and weight tables, stages, mutations, 3D, line style.

What looking at it should tell us: whether growth in causal order within a fixed total time reads as growth (J6), and whether locality (I3) is felt when a control moves.

1b's rule traces to principles 9 and 10.

## Alternatives considered

- **A semiring at each level** (VISION.md's starting hypothesis, after Kase). At the structure level a real one exists: forget everything about the tree except the paths to its open buds, and the multisets of those paths form a semiring with both distributive laws and a two-sided zero. It describes the growing frontier correctly. It is not enough to draw from: it cannot say where a fork is, a shoot that stops is not in it (J1), and ids and seeds would have to come from a canonical form, not from the tree a rule built. At the element level right distributivity fails whenever concurrent branches differ in duration.
- **One parallel operator for both levels.** One operator can't be both idempotent (concurrent changes to one element are one change) and not (two leaves are two leaves).
- **Fork as an operation on rules** (a bud may grow several siblings). Gives the structure level two monoids and a right distributive law, a near-semiring in the sense of Rivas et al. Rejected under J2: with ids as slot paths, either `fork` is not associative (if each fork nests) or locality fails (if forks flatten).
- **Children as a keyed map** (identified by name, not index). Makes order irrelevant, at the cost of names having to be unique within an element. Worth revisiting if slot indices prove awkward for whorls.
- **L-systems** (Prusinkiewicz & Lindenmayer). The structure level is close to a stochastic, parametric L-system: `then` at buds plays the role of productions, and contexts are close to inherited parameters. The book also covers phyllotaxis and timed growth, so it is the main reference to check rules against. The difference here is that laws are explicit and tested, and time is a function, not a count of derivation steps.
- **Intrinsic durations** (every element takes the time its own rate says, and a large plant takes longer). Not chosen (J6), but kept reachable: it is a different warp.

## Open questions

1. **Same key, different contributions.** Is it a generation error, or does each property declare how its contributions combine (sum for curvature; what for colour)? Whether such a clash can be detected from the term without running it is unverified.
2. **Bud types.** `then(phytomer, g)` grows `g` at the axillary buds and the apical bud alike, and `g` tells them apart by the context. Is that enough, or do the two kinds of bud need different context types? The slice will show.

New terms used here are defined in GLOSSARY.md.
