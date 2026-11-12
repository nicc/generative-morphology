# Glossary

Terms as we use them in this project — not necessarily their full biological or technical breadth. Add a term the first time it's used in a sense that isn't obvious from plain English. Alphabetical.

## Format

```
**term** — definition, in our specific usage. (Distinguish from a related term if the two could be confused.)
```

## Terms

**jig** — the dev-time control panel and what it drives: Tweakpane sliders for every form-affecting parameter, per-parameter locks, and the new-seed button (`src/ui/controls.ts`). Where exploration happens (principle 5).

**lock** — a per-parameter toggle in the jig. A locked parameter keeps its value when a new seed is drawn; unlocked parameters are re-derived from the new seed.

**provenance** — what a generated node carries about how it was made: the rule that produced it, the parameters, and its seed (principle 2).

**RFC** — a design proposal in `rfcs/`: exploration and rationale, never canonical. Becomes a spec or a principle when accepted. (Distinguish from **spec**.)

**seed lineage** — the chain of seeds from the root seed to a node, each derived from its parent's by `deriveSeed`. Gives every node a stable seed of its own without a shared RNG.

**spec** — an approved decision in `specs/` that the code must match. Canonical. (Distinguish from **RFC**.)

**structure node** — one node of the tree generation produces (`StructureNode`): geometry, provenance, children, and a stable id of the form `rule:path`. What render consumes and what the inspector and feedback attach to.
