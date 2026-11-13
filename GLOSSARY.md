# Glossary

Terms as we use them in this project — not necessarily their full biological or technical breadth. Add a term the first time it's used in a sense that isn't obvious from plain English. Alphabetical.

## Format

```
**term** — definition, in our specific usage. (Distinguish from a related term if the two could be confused.)
```

Terms marked *(proposed, RFC NNN)* are under review with that RFC and may change or be dropped.

## Terms

**anastomosis** — Goethe's term for parts growing together, e.g. sepals fusing into a calyx tube. Here it is drawn, not simulated: where contraction makes organ outlines overlap near a shared node, the renderer draws the union of the outlines. *(proposed, RFC 003)*

**archetype** — the leaf archetype: the plant's leaf, as a set of trait values, carried in the context through the stages. Every lateral organ is a transformation of it. *(proposed, RFC 003)*

**closed** — a slot in a tree that grows nothing further: a dormant bud, or an axis that has ended. Drawn or not, it keeps its slot, so the slots beside it keep their paths. (Distinguish from **tip**, which can still be continued, and from nothing at all.) *(proposed, RFC 002)*

**concurrent** — element-level parallel composition: two changes to one element at the same time. Idempotent: a change concurrent with itself is one change. (Distinguish from **fork**.) *(proposed, RFC 002)*

**context** — what a tip carries for the rule that grows from it: position (branch order, index along the axis), stage and archetype (RFC 003), traits and mutations in force (RFC 004). It travels down through tips only; each tip of a fork carries its own. *(proposed, RFC 002)*

**continue** — structure-level sequential composition, written `then(f, g)`: grow `f`, then replace each of its tips with what `g` grows from that tip's context. (Distinguish from **sequential**.) *(proposed, RFC 002)*

**contraction / expansion** — Goethe's alternation along the axis. Expansion: longer internodes, broader organs. Contraction: shorter internodes, narrower organs, organs drawn towards one node. *(proposed, RFC 003)*

**element** — one drawn part with its own life: an internode, a leaf, a petal. A node of the tree. *(proposed, RFC 002)*

**fork** — structure-level parallel composition: siblings at one point, in slot order. Not idempotent (leaf + leaf is two leaves) and not commutative (each sibling has its slot). (Distinguish from **concurrent**.) *(proposed, RFC 002)*

**jig** — the dev-time control panel and what it drives: Tweakpane sliders for every form-affecting parameter, per-parameter locks, and the new-seed button (`src/ui/controls.ts`). Where exploration happens (principle 5).

**law** — an equation between meanings that holds for every value, e.g. `then` is associative. Derived from the meaning and checked by a property test; never assumed. *(proposed, RFC 001)*

**life** — everything one element does over time: its properties as functions of the time since it started, built from phases, with a primary duration after which growth continues from its tips. *(proposed, RFC 002)*

**lock** — a per-parameter toggle in the jig. A locked parameter keeps its value when a new seed is drawn; unlocked parameters are re-derived from the new seed. RFC 004 generalises this to pinning any trait.

**meaning** — the mathematical object a generation type stands for, chosen to be simpler than the code and independent of it. Two values are equal when their meanings are. Elliott's *denotation*. *(proposed, RFC 001)*

**meaning function** — the function from a representation to its meaning. Each operation is specified by requiring the meaning function to respect it (to be a homomorphism). *(proposed, RFC 001)*

**mutation** — a rare change to the context, applied at a node and so scoped to the subtree grown from it; whether one occurs is drawn from its own weight table per seed or per node. The first ones are named bud sports ('Pendula', 'Contorta', 'Fastigiata'). Not a synonym for phase or rule application. *(proposed, RFC 004)*

**near-semiring** — two monoids on one set with only one distributive law. The structure level is one: `then` distributes over `fork` from the right but not the left. The element level has the same shape, with the law on the other side and no zero. *(proposed, RFC 002)*

**path** — a node's position: the sequence of slot indices from the root, with a continued tip keeping its slot. A node's id, and with the root seed its seed, are functions of its path. *(proposed, RFC 002)*

**phase** — one stretch of an element's life during which a set of property changes run together, e.g. an internode elongating while it greens. **Primary** phases must finish before growth continues from the element's tips; **secondary** phases (thickening, ageing, bending) run on alongside what grows next. *(proposed, RFC 002)*

**phytomer** — the unit of plant structure: an internode, the node above it with its lateral organ(s) and axillary slot(s), and an apical tip. Here it is a rule, not a node type; all structure is that rule repeated and nested. *(proposed, RFC 002)*

**pin** — fixing a trait to a value, so it isn't drawn from its weight table. A jig lock pins from the panel; input data (e.g. a species) pins from outside. *(proposed, RFC 004)*

**provenance** — what a generated node carries about how it was made: the rule that produced it, the parameters, and its seed (principle 2).

**RFC** — a design proposal in `rfcs/`: exploration and rationale, never canonical. Becomes a spec or a principle when accepted. (Distinguish from **spec**.)

**rule** — a function from a context to a tree whose tips carry the contexts for what grows next. Rules are composed with `then` and `fork`. *(proposed, RFC 002; today's code uses the word for the name recorded in provenance)*

**sample** — to evaluate a growing plant at one time `t`, giving the drawing for that instant. Pure: the same seed, traits and `t` give the same drawing. *(proposed, RFC 002)*

**seed lineage** — the chain of seeds from the root seed to a node, each derived from its parent's by `deriveSeed`. Gives every node a stable seed of its own without a shared RNG.

**sequential** — element-level sequential composition: one phase after another within one element. (Distinguish from **continue**.) *(proposed, RFC 002)*

**settle time** — the latest moment at which anything in a growing plant is still changing. The image is the plant sampled at its settle time. *(proposed, RFC 002)*

**slot** — one position among the siblings at a point. Slots are ordered and indexed; placement and seeds are functions of the slot index. *(proposed, RFC 002)*

**spec** — an approved decision in `specs/` that the code must match. Canonical. (Distinguish from **RFC**.)

**stage** — one step of Goethe's fixed sequence along an axis: vegetative leaves, calyx, corolla, stamens and pistil, fruit. Each stage is a run of phytomers whose organ is the archetype transformed for that stage. *(proposed, RFC 003)*

**structure node** — one node of the tree generation produces (`StructureNode`): geometry, provenance, children, and a stable id of the form `rule:path`. What render consumes and what the inspector and feedback attach to.

**tip** — an open end of a tree, carrying the context for whatever grows there next: an unopened bud. `then` replaces tips. (Distinguish from **closed**.) *(proposed, RFC 002)*

**trait** — a named, typed morphological variable (arrangement, divergence angle, leaf compoundness, a growth-rate curve…), either pinned or drawn from a weight table, per seed or per node. *(proposed, RFC 004)*

**warp** — a monotone function applied to time before sampling. Normalising growth time to `[0, 1]` and mapping that to wall-clock seconds are warps; they are presentation, outside the algebra. *(proposed, RFC 002)*

**weight table** — a distribution over a trait's values; rarity is the shape of the table. Can be authored, or built from data (e.g. species counts near a location). *(proposed, RFC 004)*
