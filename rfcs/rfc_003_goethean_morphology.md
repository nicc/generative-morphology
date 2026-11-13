# RFC 003: Goethean morphology

Status: Discussion (design principles accepted → principles 11 and 12; M-J1 to M-J3 decided 2026-11-13; the laws become spec text with this RFC's slice)
Date: 2026-11-13

### Related

- VISION.md
- RFC 001 (meaning first), RFC 002 (growth algebra): the method and the vocabulary (shoot, bud, slot, node, rule, `then`, context) used here
- RFC 004 (traits): where the values these rules read come from
- PRINCIPLES.md principles 9 and 10 (RFC 002); source of design principles 11 and 12 (§Design principles)
- Goethe, *Metamorphosis of Plants* (1790)
- Prusinkiewicz & Lindenmayer, *The Algorithmic Beauty of Plants* (1990): reference for phyllotaxis
- bd: generative-morphology-t46 (pass-forward from realised instances), -ys0 (plain 3D view), -76j (fruit stage)

## Summary

What the plant is, as opposed to how plants in general grow (RFC 002). Along every axis, the main one and each branch, the plant passes through Goethe's stages in a fixed order: vegetative leaves, calyx, corolla, stamens and pistil, fruit. Every lateral organ is one leaf archetype, transformed for its stage. Successive stages alternately expand and contract; at extreme contraction, organs that share a node are drawn fused.

Someone looking at the work sees a shoot whose leaves change by degrees into the parts of a flower, with the flower's parts drawn together where the leaves were spread apart.

## Motivation

VISION.md names Goethe's observations as the source of the form. Goethe is used here as a source of rules, not as an authority on plants: botanical accuracy is not the aim, and where his account is wrong we are free to keep it if it draws well or drop it if it doesn't. The two principles below are the part of his account this work commits to.

## Design principles

Proposed here and approved on 2026-11-13. The text of record is PRINCIPLES.md.

> **11. The leaf is the archetype.** Every lateral organ (leaf, bract, sepal, petal, stamen, carpel) is a transformation of the plant's leaf archetype. A later stage derives its organ from the archetype passed forward; it does not specify one independently. (Goethe's central claim.)

> **12. Expansion and contraction alternate along the axis.** Successive stages alternately expand (longer internodes, broader organs) and contract (shorter internodes, narrower organs, organs drawn towards one node). At extreme contraction, organs share a node and their outlines fuse. Fusion is drawn, not simulated (§Anastomosis).

## Meaning and laws

This RFC adds no new type. Its meanings are RFC 002's; what it adds is what the context carries and which rules exist.

**Context.** To RFC 002's position, add the **stage** and the **archetype** (the plant's leaf, as trait values; RFC 004).

**Expansion.** Each stage `s` has an expansion value `x(s) = sign(s) · m(s)`. The sign is fixed by the stage's place in the order: vegetative expands (+), calyx contracts (−), corolla expands (+), stamens and pistil contract (−), fruit expands (+). The magnitude `m(s) ≥ 0` is a trait. So a trait decides how much a stage expands or contracts, never which of the two it does. A magnitude of 0 is a stage that does neither. `scale` is an increasing function from expansion values to positive factors with `scale(0) = 1`.

**Transform.** `transform : (Archetype, Stage) → Archetype`. `transform(a, s)` is `a` with its length and width multiplied by `scale(x(s))`.

**Internode length.** `internodeLength : (Traits, Stage) → Length`. The plant's base internode length (a trait) multiplied by `scale(x(s))`, before any curve along the axis (RFC 004). It is a separate function from `transform` because the internode is not part of the archetype; the two share only the factor.

This is the whole meaning to start with; what else a stage may change is open question 2, and each addition has to be stated here the same way.

**Variation.** `vary : (Archetype, Context) → Archetype`. Organs of one stage need not be identical. `vary(a, c)` multiplies `a`'s length and width by a factor that depends only on the context `c`: the position along the axis (a curve; RFC 004) and a small per-slot draw from the slot's seed. The size of the per-slot draw is a trait, the variation, `v ≥ 0`; the factor lies in `[1 − v, 1 + v]` times the curve's value. With `v = 0` and a flat curve, `vary(a, c) = a`.

**The organ.** `organ : Rule<Context, never>`, the rule grown in a lateral slot. It reads `vary(transform(archetype, stage), c)` and grows what that describes. For a simple leaf that is one element. For a compound one (compoundness is part of the archetype) it is a shoot: rachis segments bearing leaflets, by a rule of the phytomer's shape (principle 9; GLOSSARY.md, shoot diagram, panel c), each leaflet being the same archetype one level of compoundness down. Either way the organ's rule leaves no open bud, so nothing later grows inside a leaf.

**Stage rules.** Each stage is a rule, `stage(s) : Rule<S, Next(S)>`: a run of zero or more phytomers whose lateral slots hold `organ`, ending in one open apical bud whose context has the stage advanced. Every axis is the stages continued in order and then closed:

```
axis : Rule<Vegetative, never>
axis = then(vegetative, then(calyx, then(corolla, then(stamensAndPistil, closed))))
```

(`never` is the context type of a rule that leaves no open bud: such a rule fits wherever any `Rule<A, B>` is wanted. Fruit goes between `stamensAndPistil` and `closed` when it is added; M-J2.)

Giving each stage's context its own type makes any other order of this chain fail to compile. The types cover only this chain. Two things reach the stage another way and are held by M1's test, not by the compiler: a branch's restart (below), and any function on contexts, which is why a mutation is restricted to traits (RFC 004). Traits decide each stage's form and extent; they cannot reorder stages. A stage that does not appear is its rule with a run of zero phytomers: it grows a `bud` carrying the context with the stage advanced, and no element.

**Branches.** Every branch runs the whole sequence and ends in its own flower (M-J1). An axillary bud grows out only in the vegetative stage, and what it grows is the whole axis again:

```
in vegetative, at an axillary bud:   closed   or   axis ∘ restart
in every later stage, at an axillary bud:   closed
```

`restart` is the one function on contexts that sets the stage back to vegetative; it also raises the branch order (RFC 002's `axillary`). Because `axis` ends in `closed`, a branch has no open bud left, so when the main axis's `then(vegetative, calyx)` looks for open buds it finds exactly one: the main axis's own apical bud. The recursion ends because branch order is bounded (RFC 002).

**Worked example.** Main axis with a vegetative run of 2, whose first axillary bud grows out and whose second does not; the branch has a vegetative run of 1; every floral run is 1.

```
internode ─ leaf                                   main axis, vegetative 1
  ├ axillary: internode ─ leaf                     branch, vegetative 1   (axis ∘ restart)
  │             ├ axillary: closed
  │             └ apical: internode ─ sepal        branch calyx
  │                         └ apical: internode ─ petal      branch corolla
  │                                     └ apical: internode ─ stamen   then closed
  └ apical: internode ─ leaf                       main axis, vegetative 2
              ├ axillary: closed
              └ apical: internode ─ sepal          main calyx
                          └ apical: internode ─ petal        main corolla
                                      └ apical: internode ─ stamen   then closed
```

Two axes, two flowers, no open bud. Each of sepal, petal and stamen is `organ` reading the same archetype at a different stage. (Axillary slots of the floral phytomers are closed and left out of the listing.)

Laws, to be tested when the first stage rules exist:

- M1. Stage order. Along every axis, main or branch, from its first phytomer to its end, the stage runs appear in the fixed order, each once, each of zero or more phytomers. (By the types along the chain; the test also covers `restart` and mutations, which the types do not.)
- M2. One archetype. Every lateral organ is `organ` grown from `vary(transform(a, s), c)`, where `a` is the archetype in force at that slot (after any mutation; RFC 004), `s` the stage and `c` the slot's context. Two checks: with variation `v = 0` and a flat curve, the organ's overall length and width are exactly `a`'s multiplied by `scale(x(s))`; with `v > 0`, they are within `[1 − v, 1 + v]` of that times the curve's value. Stated for simple organs. How a compound organ's overall extent follows from its rachis and leaflets is not yet defined (open question 5), so M2 does not cover compound organs until it is.
- M6. Internodes follow the stage. With a flat curve, every internode of stage `s` has length `internodeLength(traits, s)`; so a contracting stage's internodes are no longer than the base and an expanding stage's no shorter.
- M3. Alternation. For consecutive stages `s`, `s′` of the fixed order, `x(s) · x(s′) ≤ 0` whatever the traits: `x` never has the same sign twice running, and the signs are strictly opposite when both magnitudes are above 0. (When a stage does not appear, the stages either side of it have the same sign and no contraction is drawn between them; whether that is wanted is open question 4.)

### Anastomosis

Contraction draws organs towards one node until their outlines overlap, and organs that fuse are drawn as the union of their outlines, so internal edges disappear and they read as fused. Nothing about fusion is simulated, and the tree is never changed by it (M-J3).

Fusion is an **annotation**: a second value computed from the finished shoot and kept beside it.

```
fusion : Shoot → set of fusion groups        a fusion group is a set of slot paths, of organs at one node
```

`fusion` is a pure fold in generation. It puts two organs of one node in the same group when the stage's contraction is past a threshold trait. The shoot it reads is returned untouched: five fused sepals are still five elements in five slots, each with its own path, seed, life and provenance, and the group is a separate fact that names them. Render draws the union of each group and may not work out fusion for itself; the plain view (§Geometry) ignores the annotation and draws the five sepals; the inspector can show either the group or a member.

Two laws follow:

- M4. Groups name real organs: every path in a fusion group is the path of a lateral organ in the shoot `fusion` was given. (That the shoot is unchanged needs no law: `fusion` is a pure function that returns a separate value.)
- M5. Fusion groups are disjoint, and all the organs of one group share a node.

(The shape is the one synesthetica uses for its annotated musical frame: the frame stays as it was, meaning is added beside it by one layer, and the layer that draws may read annotations but not compute them.)

### Geometry

Generation produces 3D geometry whether rendering is 2D or 3D: phyllotaxis is a 3D arrangement, and a 2D drawing needs it to derive angles from.

**Plain view.** Once geometry is 3D, render has a second, plain way of drawing it: every element drawn directly from its 3D geometry (axis lines and organ outlines), under a camera that can be turned, with no fusion and no line style. It is for inspection (principle 6: render space is a stage we can both look at), and it separates two questions the styled drawing mixes: is the geometry right, and is the style reading it well. It reads the same sampled drawing as the styled renderer and decides nothing about structure (generative-morphology-ys0).

## Judgement calls

Decided by the user on 2026-11-13.

**M-J1. Do branches flower?** Decided: yes. Every axis, the main one and each branch, runs through all the stages and ends in its own flower, so a branched plant has one flower per axis. What is left out is the inflorescence: a flowering axis that bears further flowers in its axils (a raceme, an umbel). In the model that is the one rule above: axillary buds grow out only in the vegetative stage. It costs flowering detail and growth time in proportion to the number of branches; maximum branch order and branching rate are the traits that bound it.

**M-J2. Is fruit in the first slices?** Decided: fruit is part of the sequence and is deferred, not dropped. The first slices end at stamens and pistil because fruit is the stage furthest from the leaf and the hardest to draw as a transformation of it. It is added as its own piece of work (generative-morphology-76j).

**M-J3. Is fusion a fact of the structure or only of the drawing?** Decided: a fact that generation states, as an annotation beside the tree (§Anastomosis). The alternative was for render to find overlapping outlines itself; then "these sepals are fused" is not something the inspector can point at (principle 6), and render is deciding what the structure is (principle 2). The annotation gives up the simplicity of fusion needing no rule, and keeps the individual organs intact.

## Architectural implications

- **Rules** is a part of generation on top of RFC 002's tree, life and growth: the phytomer rule, the stage rules, `transform`, `vary`, `organ`.
- **Annotations** are separate pure folds over a finished shoot, returned beside it. `fusion` is the first. Render reads annotations and computes none.
- **Two renderers over one drawing.** The plain view (§Geometry) and the styled drawing both consume `sample(g, t)`. Anything the styled drawing needs that the plain view cannot show (which organs fuse, M-J3) is a sign it belongs in the structure.
- **Line drawing.** WebGL2 draws only 1-pixel lines natively; a line-drawing style needs screen-space line geometry (quads or instanced segments). An early render decision, not made here.

## First slice

After RFC 002's slice. One unbranched axis through three stages (vegetative, calyx, corolla), with a single expansion/contraction value per stage and `transform` reduced to scaling the leaf's length and width. Tests for M1–M3 and M6. (M4 and M5 come with the first fusion, which this slice leaves out.) What looking at it should tell us: whether a leaf scaled by stage reads as a sepal and a petal at all, or whether `transform` needs more than scale before the principle is believable.

## Alternatives considered

- **Generated stage order.** Rejected for a fixed backbone: order is simpler to state and check, and Goethe's sequence is fixed anyway.
- **An organ per stage, specified independently.** Rejected: it is the opposite of the first principle above.
- **Simulated fusion** (organs physically merging). Rejected for drawn fusion: the work is a drawing.

## Open questions

1. **Render style.** 2D or 3D, and the line style. Probably a 3D line drawing borrowing from botanical and information-dense illustration. Generation is 3D either way.
2. **What `transform` can change** beyond scale: margin, compoundness, colour, the organ's own life.
3. **Pass-forward from realised instances.** Should a stage also read aggregates of what the previous stage actually grew (mean leaf size)? Deferred; it is a second pass over the tree, not a context field (generative-morphology-t46).
4. **A missing stage.** With signs fixed by stage, a plant with no calyx has two expansions in a row. Is that acceptable, or should a stage that does not appear still leave a contraction (a short internode, say)? The user decides.
5. **Compound organs under M2.** What is the overall length and width of a compound organ, as a function of its rachis and leaflets? Needed before M2 can be tested on one.

New terms used here are defined in GLOSSARY.md; the stages and fusion are drawn there (stages diagram).
