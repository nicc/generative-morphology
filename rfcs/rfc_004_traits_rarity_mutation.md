# RFC 004: Traits, rarity and mutation

Status: Draft
Date: 2026-11-13

### Related

- RFC 001 (meaning first), RFC 002 (growth algebra: context, path, seed), RFC 003 (Goethean morphology: the archetype is a set of traits)
- PRINCIPLES.md principle 3 (determinism by seed), principle 5 (exposed parameters); proposes one design principle (§Proposed design principle)
- bd: generative-morphology-ybg (curves as data), -4aw (contact sheet)

## Summary

Where the values that rules read come from. Every value is a **trait**: either pinned (by a lock in the jig, or by input data such as a species) or drawn from a **weight table** using a seed. A rare plant is one that drew a low-weight value. A **mutation** is a rare change to the context, scoped to the subtree grown from the slot where it occurs.

In the jig, today's per-parameter locks become pins on any trait: lock what you like about this plant, draw a new seed, and everything else is redrawn.

## Motivation

The current code has four numeric parameters with ranges, randomised uniformly on a new seed. The work needs discrete traits (arrangement), curves (how internode length changes along the axis), unequal likelihoods (most plants ordinary, a few odd), and values that come from outside (a species). One model should cover all of these and the lock.

## Proposed design principle

Enters PRINCIPLES.md only when approved, and is numbered then.

> **Traits are pinned or drawn.** Every trait value is either pinned (by a lock, or by input data) or drawn from a weight table using a seed. Rarity is the shape of the weight table. There is no third source of trait values.

## Meaning and laws

- A **trait** is a named, typed morphological variable (arrangement, divergence angle, leaf compoundness, margin, internode-length curve, branching-probability curve…). The **trait schema**, the list of traits with their types, is explicit and shared by the jig, the rules and any data source.
- A **weight table** means a probability distribution over one trait's values.
- A trait's **scope** is per seed (one value for the plant), per axis (drawn from the seed of the slot where an axis starts, and carried in the context along that axis; an axis's length is the first), or per slot (drawn at each slot from that slot's seed; RFC 002, I1).
- A **pin** means a constant: the trait's value regardless of seed.
- **Resolving** a trait at a slot is a function of (schema, weight tables, pins, the slot's seed, the context). The context a rule receives carries resolved traits. Rules read everything about an element from them: its geometry and the phases of its life (RFC 002).
- A **mutation** means a function from traits to traits, applied to the traits a context carries. It cannot see or change the path (RFC 002) or the stage (RFC 003), by its type. Because contexts flow downwards only (RFC 002), applying one at a slot scopes it to the subtree grown from that slot with no further mechanism. Whether one occurs is itself a trait, drawn from a weight table per seed (the whole plant) or per slot (a bud sport). A mutation never touches an element directly: it changes trait values in the context, and the rules that read them grow something different.

Laws, to be tested when the first traits exist:

- R1. Resolution is deterministic: the same inputs give the same value. (Principle 3.)
- R2. A pinned trait has its pinned value under every seed.
- R3. Independence. Pinning one trait does not change the value any other trait resolves to under the same seed. (Each trait draws from its own seed derivation, not from a shared sequence.)
- R4. Scope. A mutation applied at path `π` changes nothing outside `π`. (RFC 002's I3, for contexts.)

One statistical check, which is not a law (it is not an equation between meanings): over many seeds the frequency of each value of a drawn trait is close to its weight. The test fixes its sample size and tolerance from the weights, so that a correct implementation fails it less than once in a million runs, and states both.

### First mutations

Three named sports:

- 'Pendula': raises a droop trait. The phytomer rule turns a non-zero droop into a secondary phase in which curvature increases with the element's length (RFC 002).
- 'Contorta': raises a twist trait, which the phytomer rule reads as growth direction modulated along the element.
- 'Fastigiata': narrows the branch-angle trait.

Broader mutations (changing compoundness, arrangement, a curve's shape) need nothing new, being context changes too. A mutation that would reorder stages or change the operations is out of scope: it would get round RFC 003's stage order.

### Curves

Curves are traits. How the phrases we use for growth map onto the model:

| Phrase | Model |
|---|---|
| grow at speed _ | primary duration of each internode, from a curve along the axis |
| branch at rate _ | probability that an axillary slot grows out, from a curve along the axis |
| branch with arrangement _ | arrangement trait: how many lateral slots a node has, and the direction each leaves it |
| take _ seconds to grow | duration: a per-seed trait read only by the warp (RFC 002, T6) |
| form leaves at rate _ | phytomer production along the axis: internode length and timing curves |
| form leaves with structure _ | the leaf archetype, including compound-leaf recursion |
| curves over speeds and rates | expansion/contraction curves, indexed by stage and position (RFC 003) |

How a curve is represented, as data with an evaluator, is its own RFC (generative-morphology-ybg).

### Data as input

Pins and weight tables are both inputs. A species pins many traits at once. "The trees around this location" is a weight table built from nearby species counts (hackney-tree-finder has species, common name, age and location per tree). Either needs a species-to-traits table that does not exist.

## Parameters

The jig shows the trait schema: a control per trait, a lock per control (a pin), and the new-seed button. This generalises today's locks. Curve traits need a curve control; Tweakpane's essentials plugin has a cubic-bézier blade, enough for easing-shaped curves, and arbitrary curves would need more. Weight tables themselves are not in the panel to start with: curated over exhaustive (principle 5).

## Architectural implications

- **Traits** is a part of generation beside RFC 002's tree, life and growth: schema, weight tables, resolution, pins, mutations.
- The form-affecting-values convention in CLAUDE.md (a field, a default, a range, a lock) becomes: a trait in the schema, with its weight table.
- New-seed randomisation moves out of [src/ui/controls.ts](../src/ui/controls.ts) into trait resolution, so the panel displays resolved traits and no longer computes them.

## First slice

After RFC 002's slice. Three traits on its placeholder axis: one numeric drawn per seed (divergence angle), one discrete with unequal weights (arrangement: alternate common, opposite rare), one per-slot (whether an axillary bud grows out). Locks as pins. One mutation, 'Fastigiata', per slot. Tests for R1–R4 and the frequency check. What looking at it should tell us, ideally on a contact sheet of seeds (generative-morphology-4aw): whether rarity set by weights is felt as rarity across sixteen plants, and whether a sport on one branch reads as a sport or as a mistake.

## Alternatives considered

- **Uniform ranges** (today). No rarity, no discrete values, no outside data.
- **Mutation as a separate mechanism** with its own scoping rules. Unnecessary: a context change is already scoped by how contexts travel.

## Open questions

1. **Species traits.** Where would a species-to-traits table come from, if we pursue hackney-tree-finder?
2. **Weight tables in the jig.** Is editing a weight ever something the user wants in the panel, or are tables authored in code and judged on a contact sheet?
3. **Macros** (principle 5): a species pin drives many traits at once and is close to a macro. Is it the same thing?

New terms used here are defined in GLOSSARY.md, marked as proposed by this RFC.
