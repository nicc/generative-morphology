# RFC 001: Phytomer growth algebra

Status: Draft
Date: 2026-11-12

### Related

- VISION.md
- PRINCIPLES.md principles 1–6; proposes the first Design principles (§Proposed design principles)
- Brandon Kase, "Using Abstract Algebra to derive a better Animation Library" (talk), and his [gist](https://gist.github.com/bkase/16b2de2c3bcae1b89287f402daea86ba)
- Goethe, *Metamorphosis of Plants* (1790)
- Prusinkiewicz & Lindenmayer, *The Algorithmic Beauty of Plants* (1990): prior art, see §Alternatives
- bd: generative-morphology-b1o (this RFC), -3cn (algebra spike), -3qk (Bend 2 spike), -t46 (instance-derived pass-forward)

## Summary

Each seed grows one plant over a few seconds, then holds still; the last frame is the image. What grows, and in what order, is decided up front by pure, seeded generation (principles 1–3) as a term in a two-level algebra:

- **Structure level.** The plant is built from phytomers. Two operations: *fork* (spawn siblings from one point) and *continue* (at every tip, grow what comes next). These form a semiring.
- **Element level.** Each drawn part (an internode, a leaf, a petal) changes over time through phases. Two operations: *concurrent* (changes at the same time) and *sequential* (one after another), after Kase. These form a near-semiring.

Goethe's stage sequence (leaf → calyx → corolla → stamens/pistil → fruit) is a fixed backbone. Every lateral organ is a transformation of one leaf archetype that is passed forward through the stages, expanding and contracting. Traits are either pinned (by a jig lock, or later by data such as a species) or drawn from weight tables, per seed and per node. Mutations are rare transforms of the trait context, scoped to a subtree.

The purpose of this RFC is to settle the model well enough to make the first architecture and tooling decisions (§Architecture and tooling).

## Motivation

The current generation rule (`stub-branch`) is a placeholder that proves the pipeline. VISION.md sets the actual target: animations grounded in real tree morphology and Goethe's observations, expressed as composable algebraic structures, with laws that can be checked by static analysis, tests and (possibly) Bend 2 proofs. Before any real rule is written, we need to know what a rule produces, how compositions combine, and what the laws are, because those decide the module layout, the data the renderer consumes, and what the jig exposes.

## The experience

For one seed, from the viewer's side:

1. **Start.** An empty or near-empty canvas.
2. **Growth, 2–5 s.** The plant grows in linear wall-clock time. Growth rates vary within that time: a shoot extends quickly then slows, leaves open after their node forms, the flowering stages draw together as internodes contract. The total duration is the same for every seed (§Time).
3. **Settle.** At the end every change has completed. The drawing holds still.
4. **Image.** The live canvas is replaced by the final state rendered once at high resolution, which is also the export.

Render style is open: probably a 3D line drawing borrowing from botanical and information-dense illustration. A 2D drawing would still need 3D geometry to derive angles from (phyllotaxis is a 3D arrangement), so generation produces 3D geometry either way.

In the jig: the same, plus a time scrubber, trait controls with locks, and an inspector showing the generated term and its timeline (principle 6).

## Proposed design principles

These enter PRINCIPLES.md only when approved. Numbering continues from the workflow principles.

7. **The leaf is the archetype.** Every lateral organ (leaf, bract, sepal, petal, stamen, carpel) is a transformation of the plant's leaf archetype. A later stage derives its organ from the archetype passed forward; it does not specify one independently. (Goethe's central claim.)
8. **Expansion and contraction alternate along the axis.** Successive stages alternately expand (longer internodes, broader organs) and contract (shorter internodes, narrower organs, organs drawn towards one node). At extreme contraction, organs share a node and their outlines fuse. Fusion is drawn, not simulated (§Anastomosis).
9. **The phytomer is the unit of structure.** All structure, including branches and compound leaves, is phytomers repeated and nested. No structure is drawn that isn't built from phytomers. (Principle 4 applied.)
10. **Traits are pinned or drawn.** Every trait value is either pinned (by a lock, or by input data) or drawn from a weight table using a seed. Rarity is the shape of the weight table. There is no third source of trait values.
11. **The animation is the growth.** What the viewer sees over time is the generated structure growing in its causal order. Nothing appears that growth didn't produce, and the final frame is the image.

## Model

### Two levels

| Level | Parallel | Sequential | 0 | 1 | Idempotent + | Laws |
|---|---|---|---|---|---|---|
| Structure (which parts exist, where) | fork | continue | no plant | an unopened bud | no: leaf + leaf is two leaves | semiring |
| Element (one part's properties over time) | concurrent | sequential | cancelled | instantaneous no-op | yes: a change concurrent with itself is one change | near-semiring |

The two kinds of parallelism can't be one operator. Left distributivity of sequencing over parallel, a·(b+c) = a·b + a·c, needs a + a = a when the parallel thing is a change to one part: "grow, then (redden ‖ fade)" equals "(grow then redden) ‖ (grow then fade)" only if two simultaneous identical grows are one grow. Kase hits the same point in his talk. Spawning needs the opposite: two leaves are two leaves.

### Structure level

A plant is a term over phytomers. A **phytomer** is a node (carrying one or more lateral organs and their axillary buds) plus the internode below it.

- **fork**, `a + b`: siblings that start from the same point at the same time. Commutative, associative, identity `0`.
- **continue**, `a · b`: grow `a`, then from each of `a`'s tips grow `b`. Associative, identity `1`. Not commutative.
- `0` is no plant: `0 · a = a · 0 = 0`.
- `1` is an unopened bud: `1 · a = a · 1 = a`.
- Distributes both ways: `a · (b + c) = a·b + a·c` (a shared stem is one stem) and `(b + c) · d = b·d + c·d` (`d` grows at every tip). This is the semiring of multisets of root-to-tip paths (non-commutative polynomials over ℕ). The renderer draws its canonical form: shared prefixes drawn once.

Recursion depth is a bounded power: a shoot of `n` phytomers each with an optional lateral branch is `(p · (branch + 1))ⁿ`, with `branch` itself a shoot one order higher. Compound leaves are the same pattern inside the leaf: a rachis of leaflet-phytomers.

Placement is not in the algebra. `+` is commutative, so it has no left or right; where siblings go (alternate, opposite, whorled, spiral at a divergence angle) is a deterministic function of the fork's arrangement trait, the sibling's index in canonical order, and the node's seed.

**Subtlety.** The laws identify `(a + a) · b` with `a · (b + b)`: two identical stems each carrying one `b` equals one stem carrying two. In practice every node has its own seed (seed lineage), so two sibling terms are never identical and the identification doesn't arise. A test should confirm that seeded siblings never collapse.

### Element level

After Kase: an element animation is `Cancelled | Instant | Run(weight, f)`, where `weight > 0` is relative duration and `f` maps relative time `[0, 1]` to a value.

- **concurrent**, `a + b`: weight is `max`; the shorter clamps at its end; values combine (below).
- **sequential**, `a · b`: weights add; `f` switches at the ratio of the weights.
- `Cancelled` is the additive identity and annihilates sequencing; `Instant` is the sequential identity.

**Value combination must be associative, commutative and idempotent** (a semilattice). Kase combines values by averaging, which is not associative: avg(avg(1, 2), 4) = 2.75 but avg(1, avg(2, 4)) = 2. Proposal: a value is a map from *(property, source)* to a contribution. Combining is union by key, which is a semilattice. A property's final value is computed from all its contributions when sampled. So 'Pendula' and 'Contorta' both contribute curvature to the same element under different source keys, and the renderer sums them; the same source concurrent with itself is one contribution. Two different values under the same key are a generation error, which can be detected statically from the term.

**Near-semiring.** Right distributivity fails when concurrent branches have different weights: with `a` = 1 and `b` = 2, `(a + b) · c` starts `c` at 2, while `a·c + b·c` starts one `c` at 1 and another at 2. Only left distributivity holds. We start with the near-semiring, flagged; generative-morphology-3cn looks for a better model before we commit.

### How the levels meet: primary and secondary phases

An element's phases divide into:

- **primary**: the phases that must finish before growth continues from its tips (an internode elongating);
- **secondary**: phases that run on while the structure continues (thickening, colour ageing, a branch bending under its own length for 'Pendula').

`continue` waits for the end of the parent's primary phases, not its whole animation. Without this split, a long thickening phase would hold up everything above it.

### Time

All weights are relative. Generation produces the whole term and its schedule up front; normalisation maps the schedule's total onto `[0, 1]` (including secondary phases, so everything has settled by the end); a single presentation parameter in the jig maps `[0, 1]` onto wall-clock seconds (default in the 2–5 s range). Every seed takes the same time to play; rate curves decide order and proportion.

### Stage backbone

The main axis runs through Goethe's stages in a fixed order: vegetative leaves → calyx → corolla → stamens and pistil → fruit. Each stage is a run of phytomers whose lateral organ is `transform(archetype, stage)`: the stage's expansion or contraction applied to the archetype passed forward. Traits decide each stage's form and extent, and whether an optional stage appears; they don't reorder stages. Well-formedness ("no calyx before leaves, no stamens on a leaf") is a property of the rules, checkable statically.

Branches start their own run from the vegetative stage at their own order. Whether lateral shoots can flower (an inflorescence) is open.

### Pass-forward

`continue` hands the next term a **context**: the leaf archetype and inherited traits, plus position (branch order, stage, index along the axis, seed). A fork gives each sibling its own copy, so siblings can diverge below that point. Right distributivity at the structure level is what makes this per-branch scoping consistent.

The context is a record, not individual fields, so that a later phase can also read aggregates of realised instances (e.g. mean leaf size of the previous stage) without restructuring. That extension is deferred: generative-morphology-t46.

### Traits, rarity and mutation

- **Trait**: a named, typed morphological variable (arrangement, divergence angle, leaf compoundness, margin, internode-length curve, branching probability curve…). The trait schema is explicit and shared by the jig, the rules and any future data source.
- **Weight table**: a distribution over a trait's values. Rare values have low weight.
- **Scope**: a trait is drawn per seed (one value for the plant) or per node (redrawn at each node, from that node's seed).
- **Pinning**: a lock in the jig pins a trait to its current value. Input data pins traits too: a species fixes many at once. Weight tables are also an input: "the trees around this location" is a weight table built from nearby species counts (hackney-tree-finder has species, common name, age and location per tree; a species-to-traits table would be needed).
- **Mutation**: a transform of the context, scoped to a subtree, drawn rarely from its own weight table, per seed (the whole plant) or per node (a bud sport: the branch and everything above it). The first mutations are named sports: 'Pendula' (curvature increasing with length, as a secondary phase), 'Contorta' (growth direction modulated along the element), 'Fastigiata' (narrow branch angle, upright). Because a mutation is a context transform, broader mutations (changing compoundness, arrangement, curve shapes) need no new machinery. A mutation that would reorder stages or change the operators is out of scope: it would bypass the backbone's well-formedness.

### Curves

The motivating example ("grow at speed _, branch at rate _, branch with arrangement _, form leaves at rate _, with structure _, over curves for speeds and rates _") maps as follows:

| Phrase | Model |
|---|---|
| grow at speed _ | primary-phase weight of each internode, from a curve along the axis |
| branch at rate _ | probability an axillary bud grows out, from a curve along the axis |
| branch with arrangement _ | arrangement trait: placement function of the fork |
| form leaves at rate _ | phytomer production along the axis: internode length and timing curves |
| form leaves with structure _ | the leaf archetype, including compound-leaf recursion |
| curves over speeds and rates | expansion/contraction curves, indexed by stage and position, which are themselves traits |

### Anastomosis

Contraction draws organs towards one node until their outlines overlap. Where they overlap, the renderer draws the union of the outlines, so internal edges disappear and the parts read as fused. The structure only reports which organs share a node; nothing about fusion is simulated.

## Architecture and tooling

What this model implies for the first build:

- **Generation splits into four parts**, all pure (principle 1), none touching WebGL (principle 2):
  - *algebra*: term types for both levels, the operations, canonical form, normalisation;
  - *traits*: schema, weight tables, sampling, pinning, mutations;
  - *rules*: the stage backbone and phytomer rules, from context to term;
  - *schedule*: term → elements with 3D geometry, start/end in relative time, and sampled-on-demand property contributions.
- **Render** consumes the schedule and samples it at `t`. The final image is a render at `t = 1`.
- **Geometry is 3D** from the start, regardless of whether rendering is 2D or 3D.
- **Line drawing**: WebGL2 draws only 1-pixel lines natively; a line-drawing style needs screen-space line geometry (quads or instanced segments). That's an early render decision, not in this RFC.
- **Laws as tests**: property-based tests (e.g. fast-check) for every law in the tables above, plus "seeded siblings never collapse" and "every generated term is well-formed". Worth adding regardless of the Bend decision.
- **Bend 2**: role undecided; spike first (generative-morphology-3qk).
- **Jig**: presentation duration, time scrubber, trait controls with locks (generalising today's per-parameter locks to all traits), curve editing (Tweakpane's essentials plugin has a cubic-bézier blade, enough for easing-shaped curves; arbitrary curves would need more), a term and timeline inspector (Kase's free-structure intervals idea: name, start, end per element).
- **Current code**: `GenerationParams`, `PARAM_RANGES` and the stub rule are replaced. The jig convention (form-affecting values live in the jig) carries over to traits.

## Alternatives considered

- **One parallel operator for everything** (VISION.md's original framing). Rejected: one operator can't be both idempotent (concurrent changes to one part) and not (spawning).
- **Kase's model as is.** Rejected in part: averaging values isn't associative. Its sequencing/concurrency structure is kept at the element level.
- **L-systems** (Prusinkiewicz & Lindenmayer). The structure level is close to a stochastic, parametric L-system: `continue` at tips plays the role of productions, and context passing is close to parametric L-systems' inherited parameters. The book also covers phyllotaxis and timed (developmental) growth, so it's the main reference to check our rules against. The difference here is that laws are explicit and checkable, and time is a separate algebra rather than derivation steps.
- **Generated stage order.** Rejected for a fixed backbone: well-formedness is simpler to state and check, and Goethe's sequence is fixed anyway.
- **Intrinsic durations.** Rejected for normalised time: the experience is a fixed 2–5 s.

## Open questions

1. **Element-level algebra**: near-semiring or something better? (generative-morphology-3cn)
2. **Bend 2's role**: core, proofs alongside, or later? (generative-morphology-3qk)
3. **2D or 3D render, and line style.** Generation is 3D either way.
4. **Gating `continue`**: is the primary/secondary split right, or should a phase be able to name an arbitrary sync point?
5. **Flowering on lateral shoots** (inflorescences): in scope for the first rules?
6. **Fruit**: does the first backbone include the fruit stage?
7. **Same-property contributions**: under keyed contributions, is "sum when sampled" the right rule for every property (curvature, yes; colour?), or does each property declare its own?
8. **Species traits**: where would a species-to-traits table come from, if we pursue hackney-tree-finder?

New terms used here are defined in GLOSSARY.md, marked as proposed by this RFC.
