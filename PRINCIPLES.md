# Principles

The rules that govern the form of this work. Each one is a constraint or a generative rule, stated plainly enough to check code against. Numbered so they can be cited elsewhere (commit messages, issues, code comments) as "principle 3," etc.

## Format

```
**N. Name.** The rule itself, stated as something that can be checked. (Why, only if not self-evident.)
```

Each principle is its own paragraph with the number inside the bold text, not a Markdown list item: a list would be renumbered by position when rendered, and the numbers here are permanent ids given in order of adoption, so they are not consecutive within a section.

Keep each principle short. If a principle needs a paragraph to state, it's probably two principles, or it's not ready to be written down yet.

## Software principles

Fundamental to how the code is written, independent of the visual/design principles below. Established first so they don't get relitigated per change.

**1. Pure generation.** Rules, transforms, and branching logic are pure functions of explicit parameters — no hidden state, no ambient randomness, no wall-clock time unless time is itself a passed-in parameter. Same inputs produce the same plant, always.

**2. Generation and rendering are separate.** The code that decides what a structure *is* doesn't know WebGL exists. The renderer only consumes a structure it's handed. Every generated structure carries its provenance — which rule, which parameters, which seed lineage produced it — even before anything consumes that data. (Lets a generated structure be inspected or tested without a GPU context, lets the rendering approach change without touching the rules, and makes a future inspector a display problem rather than a rewrite.)

**3. Determinism by seed.** Any randomness traces back to an explicit seed value passed in, never an ambient source like `Math.random()` called directly. (Makes a specific output reproducible and bugs reportable — "seed 4471 produces a malformed branch.")

**4. Composition over special cases.** Complex forms come from a few small rules applied repeatedly, not one rule that grows more special-cased over time. Mirrors the biology — a plant's form is repetition of simple rules — as much as it mirrors functional style.

**7. Meaning before representation.** Every generation type has a stated meaning (a mathematical object simpler than the code) and a meaning function onto it. Each operation is specified by what it does to the meaning, and two values are equal when their meanings are. Laws are derived from the meaning and tested, never assumed. Everything downstream (render, ids, seeds, the inspector) reads only what the meaning determines. (RFC 001.)

## Workflow principles

How we work together while building this, as distinct from the artwork itself.

**5. Exploration through exposed parameters.** Parameters — numeric or discrete — that materially affect the generated form are exposed as tweakable, rather than buried in code. A parameter earns exposure when varying it across its range visibly changes the form; things that only affect numerical stability or performance stay buried. Curated over exhaustive. Related parameters can be bundled into a single macro that drives several of them along independent curves — but a macro stays inspectable: you can always see the individual values it's currently driving, not just the meta-value.

**6. Every pipeline stage is visible to both of us, and feedback can target a specific structure.** Seed, traits, structure, render space, and image are all inspectable, not just the final frame. We visualize a representation when it helps understanding, and we'll build intermediate structures purely to have shared vocabulary to point at. Feedback has an unambiguous channel: click on a rendered structure and give input tied to that structure specifically, rather than describing it in words. We invest in tooling for this when the alternative is guessing what the other means.

**8. Structural terms are drawn.** A glossary term that names a physical structure, or a part of one, is shown in a labelled diagram in the glossary. One diagram that shows several terms and how they nest is preferred to a diagram per term. Diagrams are in the register of the work (botanical line drawing, dense with information), but clarity comes first: a diagram is there to fix what a term refers to. (A structure described only in words gets read differently by each of us.)

## Design principles

The rules that govern the work's visual form and generative behavior. These get written deliberately, together, not inferred from what looks good.

**9. The phytomer is the unit of structure.** All structure, including branches and compound leaves, is phytomers repeated and nested. No structure is drawn that isn't built from phytomers. (Principle 4 applied. RFC 002.)

**10. The animation is the growth.** What the viewer sees over time is the generated structure growing in its causal order. Nothing appears that growth didn't produce, and the final frame is the image. (RFC 002.)

**11. The leaf is the archetype.** Every lateral organ (leaf, bract, sepal, petal, stamen, carpel) is a transformation of the plant's leaf archetype. A later stage derives its organ from the archetype passed forward; it does not specify one independently. (Goethe's central claim. RFC 003.)

**12. Expansion and contraction alternate along the axis.** Successive stages alternately expand (longer internodes, broader organs) and contract (shorter internodes, narrower organs, organs drawn towards one node). At extreme contraction, organs share a node and their outlines fuse. Fusion is drawn, not simulated. (RFC 003.)
