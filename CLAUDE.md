# generative-morphology

A generative artwork in WebGL2: plant-like forms grown from seeded rules, explored through a control panel. Purpose and audience: [VISION.md](VISION.md).

The principles below constrain every design and implementation decision. A violation must be explicit, intentional and justified.

@PRINCIPLES.md

## Ground rules

- **Propose before building.** For anything non-trivial (new behaviour, multi-file change, refactor), describe what and how, then wait for approval. Trivial fixes and research don't need it.
- **Principles before implementation.** Every generative rule traces back to a stated principle. If a change isn't traceable to one, stop and raise it rather than guessing at what looks good. The Design principles section is written together, deliberately; don't infer principles from what looks good.
- **Meaning before operators.** A new generation type, or a new operation on one, starts with what it means: the Meaning and laws section of its RFC, read by the user before the rest is drafted ([rfcs/README.md](rfcs/README.md), Order of work; method in [RFC 001](rfcs/rfc_001_meaning_first.md)). Give every operation a type and check that each law type-checks as written. Don't propose an operator table, a law or an architecture for something whose meaning isn't written down. If asked to, say so and write the meaning first.
- **Specs are canonical.** A code change that affects specified behaviour updates the spec in the same commit. If something isn't specified, say so and ask; don't invent scope.
- **Use the glossary.** [GLOSSARY.md](GLOSSARY.md) for biological and project terms alike. Restate loose terms in glossary language, ask when a term is ambiguous, and propose a definition before using a new one. Botanical words keep their botanical sense (a node is where leaves attach, not a tree-data-structure node). A term for a physical structure gets a place in a glossary diagram in the same change (principle 8; [docs/diagrams/](docs/diagrams/)).
- **Track work and memory in bd.** No TODO or plan files, and no memory files: persistent notes go in `bd remember --key <slug> "..."`. File discoveries (spec gaps, surprising behaviour) as issues when you find them, then ask the user to triage. `bd close -r "reason"`, not `--comment`.
- **Breaking changes are fine.** No shims, aliases or deprecated paths unless asked.
- **Plain register.** No hype in docs, comments, commits or issues. Say what a thing does or looks like ("branch angle narrows as order increases", not "elegant cascading fronds"). Be precise about what exists versus what is planned.

## Architecture

```
seed + GenerationParams → generation → StructureNode tree (with provenance) → render → canvas
                              ↑
                   ui (the jig: params, locks, new seed)
```

Generation decides what a structure is; render draws whatever structure it is handed; ui edits parameters and seeds and triggers regeneration. Principle 2 is the rule; ESLint enforces the import boundaries.

| Module | Owns | May import |
|---|---|---|
| [src/generation/](src/generation/) | Pure, seeded rules → `StructureNode` tree; `rng.ts` (seeded PRNG, seed derivation) | nothing outside generation (its tests may import `src/testing`) |
| [src/render/](src/render/) | All WebGL2 and twgl calls; GL state scoped per structure node | generation types |
| [src/ui/](src/ui/) | The jig: Tweakpane panel, parameter ranges, locks, new-seed button | generation |
| [src/testing/](src/testing/) | Test support: `laws.ts`, property-based checkers for algebraic laws | fast-check |
| [src/main.ts](src/main.ts) | Wiring: canvas, renderer, controls, regenerate | everything |

Stack: TypeScript, Vite, raw WebGL2 with [twgl.js](https://twgljs.org/) for shader/buffer/uniform boilerplate only, [Tweakpane](https://cocopon.github.io/tweakpane/) for the jig, Vitest with [fast-check](https://fast-check.dev/) for law tests. No scene-graph engine (Three.js considered and ruled out: the work doesn't borrow meaning from recognisable materials or lighting, and the object model is shaped by generation, not by a general 3D scene). No app framework.

The only generation rule today is a placeholder (`stub-branch` in [structure.ts](src/generation/structure.ts)) that proves the pipeline end to end. It is not a design principle and will be replaced.

## Specs and RFCs

- `specs/SPEC_*.md` are canonical: approved decisions that the code must match. `npm run check:specs` verifies their `src/` references resolve; whether the prose still matches behaviour is on you. Format: [specs/README.md](specs/README.md).
- `rfcs/` are exploration and rationale. Read them for why a decision was made. They go stale and are never canonical. The Drafts describe one design between them, one concern each; a change to a Draft's subject is an edit to that RFC, not a new one. New designs start as an RFC and become spec text (or, for a new principle, PRINCIPLES.md text) when approved. Format and lifecycle: [rfcs/README.md](rfcs/README.md).

| Concern | Specs |
|---|---|
| _None yet. Add a row per concern as specs are approved._ | |

## Where to look

| For | Read |
|---|---|
| Why this exists, who it's for | [VISION.md](VISION.md) |
| Writing an RFC | [rfcs/README.md](rfcs/README.md) |
| Writing or changing a spec | [specs/README.md](specs/README.md) |
| How we design a generation type: meaning, then operations, then laws (Elliott's denotational design) | [RFC 001](rfcs/rfc_001_meaning_first.md) (Accepted, principle 7) |
| What a plant and its growth are: shoots, buds, slots, lives, time, the laws | [RFC 002](rfcs/rfc_002_growth_algebra.md) (Discussion) |
| What this plant is: stages, the leaf archetype, expansion and contraction | [RFC 003](rfcs/rfc_003_goethean_morphology.md) (Discussion) |
| Where values come from: traits, weight tables, pins, mutations | [RFC 004](rfcs/rfc_004_traits_rarity_mutation.md) (Draft) |
| What the structural terms look like | [GLOSSARY.md](GLOSSARY.md#diagrams), [docs/diagrams/](docs/diagrams/) |
| Past spikes and findings | [docs/learnings/](docs/learnings/) |
| What the PR reviewer checks | [.github/pr-review.md](.github/pr-review.md) |

## Enforced by the toolchain

Breaking these fails the build or lint, so they need no separate checking. Each ESLint rule block in [eslint.config.js](eslint.config.js) names the principle it encodes.

- **Compiler** ([tsconfig.json](tsconfig.json)): no unused locals or parameters, `verbatimModuleSyntax`, `erasableSyntaxOnly`.
- **Module boundaries** (principle 2): generation imports neither render, ui, twgl nor Tweakpane; render doesn't import ui; ui doesn't import render or twgl.
- **Determinism** (principles 1, 3): no `Math.random`, `Date.now`, `new Date()`, `performance.now`, `crypto.getRandomValues` or browser globals in generation. Entropy enters as a seed from outside generation.
- **Code hygiene**: typed recommended rules, no deprecated APIs, exhaustive switches over unions.
- **Tests**: no `.only`/`.skip`, every test asserts, no `console`.
- **Specs**: `check:specs` fails on spec references to missing paths.

Lint exemptions are `eslint-disable-next-line` comments that give the reason and cite the bd issue that removes them.

## Tests

Generation code is pure and seeded, so it gets unit tests. Rendering output is verified by looking at it (the `run` skill), not by automated tests. The core rule: a test protects a behaviour. It survives a retune of a default and fails when the behaviour breaks. So import defaults and ranges rather than retyping them, and assert properties (determinism for a seed, orderings, bounds, ratios) over exact values.

An algebraic law (associativity, an identity, a distributive law, a meaning function respecting an operation) is tested with the checkers in [src/testing/laws.ts](src/testing/laws.ts) over generated inputs, never on a hand-picked example. Pass the equality of meanings as `eq`. An equation that deliberately doesn't hold gets a test too (`expect(() => law.…).toThrow()`), so it isn't restored by accident.

## Code conventions

- **Form-affecting values live in the jig.** A value that visibly changes the form when varied (principle 5) is a field of `GenerationParams` with a one-line comment giving its unit, a default in `DEFAULT_PARAMS` ([structure.ts](src/generation/structure.ts)) and a range in `PARAM_RANGES` ([controls.ts](src/ui/controls.ts)), so it appears in the panel and can be locked. Never an inline literal in a rule.
- **Other tunables are named top-of-file constants**, with units in the name (`_RAD`, `_FRACTION`, `_PX`) and a one-line comment. These are values that affect only numerical stability or performance and stay out of the panel (principle 5: curated over exhaustive).
- **Seed lineage, not shared RNG state.** Each structure node derives its own seed from its parent's (`deriveSeed` in [rng.ts](src/generation/rng.ts)); no mutable RNG is passed down the tree. New-seed parameter randomisation derives from the new seed, so `(seed, params)` reproduces from one number.
- **Structure-node ids are stable** for a given seed and parameters (`rule:path`, no counters). The inspector and click-to-target feedback (principle 6) attach to them.

## Planned, not set up

Recorded so no one assumes these exist yet:

- **A proof tool.** Which one (Bend 2, Agda, Lean 4) and whether proofs add anything over the property tests is open: generative-morphology-3qk. VISION.md names Bend 2; that is a starting preference, not a decision.
- **Subjective evals.** Automated evaluation of rendered output beyond unit tests. Until it exists, rendering is checked by looking.

## Skills worth using here

- **run**: launch the app and check a change in a real browser. A shape that technically renders and one that looks right can't be told apart by a type check.
- **code-review**: before landing numerically heavy generation or shader changes (transforms, noise, recursion), where a subtle bug produces a plausible-looking wrong result.
- **artifact-diagramming**: for a coordinate system or growth rule that is hard to state in a sentence. Not decoration, and not a substitute for plain language.
- **simplify**: periodic cleanup pass on generation code.

## Finishing work: branch, PR, review

`main` is protected; every change lands through a PR that the user merges.

1. **Branch** from `main`. Commit at stopping points; lead commit messages with the change to the form or the workflow. After a rename, grep `.ts` and `.md` for the old term.
2. **Run the gates** before pushing: `npm run build && npm test && npm run lint` (`build` runs `tsc`).
3. **Look at it.** For any change that can affect the rendered form, run the app and look, at the seeds and parameters that exercise the change.
4. **Open the PR**: push the branch and run `gh pr create`, filling every section of [.github/pull_request_template.md](.github/pull_request_template.md): intent, behaviour changes (with the seeds and parameters that show them), pertinent principles, specs and RFCs, and the decisions and deliberate exceptions agreed in conversation. The reviewer sees only the repo and the PR, so whatever the description leaves out, it will miss or flag as a violation.
5. **CI runs two checks** on every non-draft PR from this repo: the gates ([ci.yml](.github/workflows/ci.yml)) and an independent Claude review ([claude-review.yml](.github/workflows/claude-review.yml), following [.github/pr-review.md](.github/pr-review.md)). The review posts advisory comments and re-runs on each push, covering only what changed.
6. **Loop on the review.** Wait for it with `gh pr checks <n> --watch`, then read it with `gh pr view <n> --comments` and `gh api repos/{owner}/{repo}/pulls/<n>/comments`. Treat its observations as evidence and its interpretations as claims to check against the principles and the agreed decisions. Fix what holds up and push; the next round reviews only the new changes. If a finding is wrong because the description lacked context, fix the description too. Stop when a round raises nothing you would act on, or after three rounds, whichever comes first. A green `review` check with no review comment means the review didn't run (the action skips, reporting success, when the PR changes its workflow file); tell the user rather than treating it as a pass.
7. **Hand over.** Tell the user what you fixed and which findings you declined and why. Never drop one silently. The user reviews, then asks for changes or merges. After the merge, `bd sync` (the issue database is a Dolt remote on `refs/dolt/data`, independent of git branches) and close the finished issues.

If the review is repeatedly noisy or misses something, propose an edit to the brief rather than working around it.
