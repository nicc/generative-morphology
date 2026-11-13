# RFC 003: Goethean morphology

Status: Draft
Date: 2026-11-13

### Related

- VISION.md
- RFC 001 (meaning first), RFC 002 (growth algebra): the method and the vocabulary (tree, tip, rule, `then`, context) used here
- RFC 004 (traits): where the values these rules read come from
- PRINCIPLES.md; proposes two design principles (§Proposed design principles)
- Goethe, *Metamorphosis of Plants* (1790)
- Prusinkiewicz & Lindenmayer, *The Algorithmic Beauty of Plants* (1990): reference for phyllotaxis
- bd: generative-morphology-t46 (pass-forward from realised instances)

## Summary

What the plant is, as opposed to how plants in general grow (RFC 002). Along each axis the plant passes through Goethe's stages in a fixed order: vegetative leaves, calyx, corolla, stamens and pistil, fruit. Every lateral organ is one leaf archetype, transformed for its stage. Successive stages alternately expand and contract; at extreme contraction, organs that share a node are drawn fused.

Someone looking at the work sees a shoot whose leaves change by degrees into the parts of a flower, with the flower's parts drawn together where the leaves were spread apart.

## Motivation

VISION.md names Goethe's observations as the source of the form. Goethe is used here as a source of rules, not as an authority on plants: botanical accuracy is not the aim, and where his account is wrong we are free to keep it if it draws well or drop it if it doesn't. The two principles below are the part of his account this work commits to.

## Proposed design principles

These enter PRINCIPLES.md only when approved, and are numbered then.

> **The leaf is the archetype.** Every lateral organ (leaf, bract, sepal, petal, stamen, carpel) is a transformation of the plant's leaf archetype. A later stage derives its organ from the archetype passed forward; it does not specify one independently. (Goethe's central claim.)

> **Expansion and contraction alternate along the axis.** Successive stages alternately expand (longer internodes, broader organs) and contract (shorter internodes, narrower organs, organs drawn towards one node). At extreme contraction, organs share a node and their outlines fuse. Fusion is drawn, not simulated (§Anastomosis).

## Meaning and laws

This RFC adds no new type. Its meanings are RFC 002's; what it adds is what the context carries and which rules exist.

**Context.** To RFC 002's position, add the **stage** and the **archetype** (the plant's leaf, as trait values; RFC 004).

**Expansion.** Each stage `s` has an expansion value `x(s)`, a signed number and a trait: positive for an expanding stage, negative for a contracting one. `scale` is an increasing function from expansion values to positive factors with `scale(0) = 1`.

**Transform.** `transform(a, s)` is the archetype `a` with its length and width multiplied by `scale(x(s))`. The stage's internode length is multiplied by the same factor. This is the whole meaning to start with; what else a stage may change is open question 2, and each addition has to be stated here the same way.

**Stage rules.** Each stage is a rule: a run of zero or more phytomers whose lateral organ is `transform(archetype, stage)`, the stage's expansion or contraction applied to the archetype handed forward. The main axis is the stages continued in order:

```
axis = then(vegetative, then(calyx, then(corolla, then(stamensAndPistil, fruit))))
```

Giving each stage's context its own type (`Rule<Vegetative, Calyx>`, `Rule<Calyx, Corolla>`, …) makes any other order fail to compile. Traits decide each stage's form and extent; they cannot reorder stages. A stage that does not appear is its rule with a run of zero phytomers: it grows a `tip` carrying the context with the stage advanced, and no element.

**Branches.** An axillary slot that grows out starts its own run from the vegetative stage, one branch order higher.

Laws, to be tested when the first stage rules exist:

- M1. Stage order. Along any root-to-tip path, the stage runs appear in the fixed order, each once, each of zero or more phytomers. (By the types; the test guards the types.)
- M2. One archetype. Every lateral organ's length and width are the archetype's multiplied by `scale(x(s))` for the organ's stage `s`, after any mutation in force has changed the archetype (RFC 004).
- M3. Alternation. Along an axis, `x` has opposite signs in consecutive stages that appear.

### Anastomosis

Contraction draws organs towards one node until their outlines overlap, and overlapping organs are drawn as the union of their outlines, so internal edges disappear and they read as fused. Nothing about fusion is simulated. The structure reports which organs share a node. Whether it also reports which of them fuse, or leaves that to render to find from overlap, is M-J3.

### Geometry

Generation produces 3D geometry whether rendering is 2D or 3D: phyllotaxis is a 3D arrangement, and a 2D drawing needs it to derive angles from.

## Judgement calls

**M-J1. Do lateral shoots flower?** Recommended to start: no; only the main axis runs past the vegetative stage. The alternative (inflorescences) multiplies the flowering detail and the time spent on it. Giving it up for now means a plant has one flower.

**M-J2. Is fruit in the first backbone?** Recommended to start: no; end at stamens and pistil. Fruit is the stage furthest from the leaf and the hardest to draw as a transformation of it.

**M-J3. Is fusion a fact of the structure or only of the drawing?** Two options. (a) Render finds overlapping outlines and draws their union; fusion falls out of geometry with no rule. (b) Generation reports fusion groups (which organs at a node fuse) and render draws the union of each group. Recommended: (b). Under (a) "these sepals are fused" is not something the tree carries, the inspector cannot point at a fused calyx (principle 6), and render is deciding what the structure is (principle 2). (b) gives up the simplicity of fusion needing no rule.

## Architectural implications

- **Rules** is a part of generation on top of RFC 002's tree, life and growth: the phytomer rule, the stage rules, `transform`.
- **Line drawing.** WebGL2 draws only 1-pixel lines natively; a line-drawing style needs screen-space line geometry (quads or instanced segments). An early render decision, not made here.

## First slice

After RFC 002's slice. One unbranched axis through three stages (vegetative, calyx, corolla), with a single expansion/contraction value per stage and `transform` reduced to scaling the leaf's length and width. Tests for M1–M3. What looking at it should tell us: whether a leaf scaled by stage reads as a sepal and a petal at all, or whether `transform` needs more than scale before the principle is believable.

## Alternatives considered

- **Generated stage order.** Rejected for a fixed backbone: order is simpler to state and check, and Goethe's sequence is fixed anyway.
- **An organ per stage, specified independently.** Rejected: it is the opposite of the first principle above.
- **Simulated fusion** (organs physically merging). Rejected for drawn fusion: the work is a drawing.

## Open questions

1. **Render style.** 2D or 3D, and the line style. Probably a 3D line drawing borrowing from botanical and information-dense illustration. Generation is 3D either way.
2. **What `transform` can change** beyond scale: margin, compoundness, colour, the organ's own life.
3. **Pass-forward from realised instances.** Should a stage also read aggregates of what the previous stage actually grew (mean leaf size)? Deferred; it is a second pass over the tree, not a context field (generative-morphology-t46).
4. M-J1 to M-J3. The user decides.

New terms used here are defined in GLOSSARY.md, marked as proposed by this RFC.
