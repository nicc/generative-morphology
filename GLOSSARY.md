# Glossary

Terms as we use them in this project — not necessarily their full biological or technical breadth. Add a term the first time it's used in a sense that isn't obvious from plain English. Alphabetical.

## Format

```
**term** — definition, in our specific usage. (Distinguish from a related term if the two could be confused.)
```

Terms marked *(proposed, RFC NNN)* are under review with that RFC and may change or be dropped.

## Terms

**anastomosis** — Goethe's term for parts growing together, e.g. sepals fusing into a calyx tube. Here it is drawn, not simulated: where contraction makes organ outlines overlap near a shared node, the renderer draws the union of the outlines. *(proposed, RFC 001)*

**archetype** — the leaf archetype: the plant's sampled leaf traits, passed forward through the stages. Every lateral organ is a transformation of it. *(proposed, RFC 001)*

**concurrent** — element-level parallel composition: two changes to one element at the same time. Idempotent: a change concurrent with itself is one change. (Distinguish from **fork**.) *(proposed, RFC 001)*

**context** — the record `continue` hands to the next term: archetype, inherited traits, mutations in force, and position (branch order, stage, index along the axis, seed). Each forked sibling gets its own copy. *(proposed, RFC 001)*

**continue** — structure-level sequential composition: grow one term, then from each of its tips grow the next. (Distinguish from **sequential**.) *(proposed, RFC 001)*

**contraction / expansion** — Goethe's alternation along the axis. Expansion: longer internodes, broader organs. Contraction: shorter internodes, narrower organs, organs drawn towards one node. *(proposed, RFC 001)*

**element** — one drawn part with its own phases: an internode, a leaf, a petal. The unit the element-level algebra animates. *(proposed, RFC 001)*

**fork** — structure-level parallel composition: siblings spawned from one point at the same time. Not idempotent: leaf + leaf is two leaves. (Distinguish from **concurrent**.) *(proposed, RFC 001)*

**jig** — the dev-time control panel and what it drives: Tweakpane sliders for every form-affecting parameter, per-parameter locks, and the new-seed button (`src/ui/controls.ts`). Where exploration happens (principle 5).

**lock** — a per-parameter toggle in the jig. A locked parameter keeps its value when a new seed is drawn; unlocked parameters are re-derived from the new seed. RFC 001 generalises this to pinning any trait.

**mutation** — a rare transform of the context, scoped to a subtree, drawn from its own weight table per seed or per node. The first ones are named bud sports ('Pendula', 'Contorta', 'Fastigiata'). Not a synonym for phase or rule application. *(proposed, RFC 001)*

**near-semiring** — a semiring with only one distributive law. The element-level algebra is one: sequencing distributes over concurrency on the left but not the right. *(proposed, RFC 001)*

**phase** — one stretch of an element's life during which a set of property changes run together, e.g. an internode elongating while it greens. **Primary** phases must finish before growth continues from the element's tips; **secondary** phases (thickening, ageing, bending) run on alongside what grows next. *(proposed, RFC 001)*

**phytomer** — the unit of plant structure: a node, with its lateral organ(s) and axillary bud(s), plus the internode below it. All structure is phytomers repeated and nested. *(proposed, RFC 001)*

**pin** — fixing a trait to a value, so it isn't drawn from its weight table. A jig lock pins from the panel; input data (e.g. a species) pins from outside. *(proposed, RFC 001)*

**provenance** — what a generated node carries about how it was made: the rule that produced it, the parameters, and its seed (principle 2).

**RFC** — a design proposal in `rfcs/`: exploration and rationale, never canonical. Becomes a spec or a principle when accepted. (Distinguish from **spec**.)

**seed lineage** — the chain of seeds from the root seed to a node, each derived from its parent's by `deriveSeed`. Gives every node a stable seed of its own without a shared RNG.

**sequential** — element-level sequential composition: one phase after another within one element. (Distinguish from **continue**.) *(proposed, RFC 001)*

**spec** — an approved decision in `specs/` that the code must match. Canonical. (Distinguish from **RFC**.)

**stage** — one step of Goethe's fixed sequence along an axis: vegetative leaves, calyx, corolla, stamens and pistil, fruit. Each stage is a run of phytomers whose organ is the archetype transformed for that stage. *(proposed, RFC 001)*

**structure node** — one node of the tree generation produces (`StructureNode`): geometry, provenance, children, and a stable id of the form `rule:path`. What render consumes and what the inspector and feedback attach to.

**trait** — a named, typed morphological variable (arrangement, divergence angle, leaf compoundness, a growth-rate curve…), either pinned or drawn from a weight table, per seed or per node. *(proposed, RFC 001)*

**weight table** — a distribution over a trait's values; rarity is the shape of the table. Can be authored, or built from data (e.g. species counts near a location). *(proposed, RFC 001)*
