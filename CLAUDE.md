# generative-morphology

A generative artwork in WebGL, built from a set of stated principles about plant morphology. This file is the starting point for every session — read it before doing anything else.

## What this is

Nothing about visual language, rendering approach, or tooling is decided beyond what's written in this repo. Don't assume a shader library, framework, or build tool that isn't recorded in [Structure](#structure) below. If it's not written down, it hasn't been decided.

## How we work

- **Plain language, no hype.** Describe what a thing does or looks like in concrete terms. No "stunning," "breathtaking," "organic beauty" — say what actually happens (e.g. "branch angle narrows as order increases," not "elegant cascading fronds").
- **Principles before implementation.** Every generative rule should trace back to a stated principle in [PRINCIPLES.md](PRINCIPLES.md). If a change isn't traceable to one, stop and raise it rather than guessing at what looks good.
- **Glossary discipline.** Define a term in [GLOSSARY.md](GLOSSARY.md) the first time it's used in a sense that isn't obvious from plain English — biological terms (e.g. phyllotaxis, apical dominance) and technical ones (e.g. what we mean by "generation" or "rule" in this codebase) alike. If you're about to use a term not already in the glossary, add it or ask first.
- **Issue tracking via beads.** This project uses `bd`. See [AGENTS.md](AGENTS.md) for the full workflow — finding ready work, claiming it, closing it, and the mandatory sync-and-push at session end. That workflow applies here unchanged; this file doesn't repeat it.

## Principles

See [PRINCIPLES.md](PRINCIPLES.md). Empty until we write the first ones together — don't invent principles to fill the gap.

## Glossary

See [GLOSSARY.md](GLOSSARY.md). Empty until terms come up.

## Structure

No code exists yet — this is the intended shape as we scaffold it. Update this section the moment reality diverges from it; an out-of-date Structure section is worse than an empty one.

- **Language:** TypeScript.
- **Build/dev:** Vite.
- **Rendering:** raw WebGL2. Deliberately not a scene-graph engine (Three.js considered and ruled out) — the content doesn't borrow meaning from recognizable materials/lighting, and the object model we actually need is shaped by generation (see below), not by a general-purpose 3D scene.
- **Rendering boilerplate:** [twgl.js](https://twgljs.org/), used only to remove shader-compile/buffer/uniform ceremony. No scene graph, no draw-command abstraction beyond what we write ourselves.
- **Structure/provenance layer:** ours to design and build. A tree of addressable generated nodes — rule, parameters, seed lineage, children — satisfying principle 2's provenance requirement. This is what the renderer consumes, what the inspector and lock controls (workflow principles 5–6) attach to, and where GL draw state gets scoped per node rather than left as global mutable state. Not started yet.
- **UI controls:** [Tweakpane](https://cocopon.github.io/tweakpane/) for sliders, macros, lock toggles, and the new-seed button. Isolated from generation and rendering code.
- **App shell:** none. No React/Vue/etc. — the surface is a canvas plus a control panel, wired together with plain TS modules.
- **Testing:** generation code (pure, seeded — principles 1 and 3) gets unit tests; a test runner gets picked as part of scaffolding, not planned separately. Rendering output is verified by looking at it (`run` skill), not automated.

Module boundaries mirror principle 2: a generation module produces structure data with no WebGL references; a render module consumes structure and owns all WebGL/twgl calls; a ui module only touches the control panel and structure-layer parameter overrides.

## Skills worth using here

- **beads** — multi-session task tracking, already wired up via AGENTS.md. Use it once work spans more than one sitting.
- **run** — once there's an app to launch, use this to start it and check changes in an actual browser rather than trusting that code compiles. WebGL correctness (a shape that's technically rendering vs. one that looks right) can't be verified by a type check.
- **code-review** — for reviewing shader and generation-logic changes before they land, particularly numerically-heavy code (transforms, noise, recursive/L-system generation) where a subtle bug produces a plausible-looking but wrong result.
- **simplify** — periodic cleanup pass on generation code once it exists.
- **artifact-diagramming** — for sketching a coordinate system or growth rule as a diagram when text alone is ambiguous. Use sparingly, for a mechanism that's genuinely hard to describe in a sentence — not decoration, and not a substitute for the plain-language rule above.

Not relevant yet: **dataviz** (no data to visualize), **artifact-capabilities** (no hosted runtime page planned). Revisit if that changes.
