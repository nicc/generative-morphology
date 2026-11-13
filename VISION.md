## The initial idea

This is an art project attempting to create generative animations that culminate in a static image, based on real tree morphologies, applying Goethe's observations in Metamorphosis of Plants (e.g. expansion / contraction phases with anastomosis at extreme contraction ranges).

It is also a technical toy / puzzle. I want to use abstract algebra to express composable, generative animation structures. A semiring, specifically, using addition for expressing animations in parallel and multiplication for sequential ones. At the same time, it will have lots of design and aesthetic decisions. I'm interested in exercising at this intersection of modalities. This should entail lots of interesting assertions via static analysis, formal verification via Bend 2, invariants and evals, all whilst working in a jig. But let's see!

## What followed

The initial statement above worked really well as the seed of an idea, but intentionally challenging it yielded much more attractive operating models which diverged significantly from the initial technical intention. For example, the semiring gave way to two smaller algebras and survives only as measurement. RFC_001 covers the method and RFC_002 covers the laws.

At a general level, it's worth noting that a half-formed idea functioned well as inspiration but loose attachment to it _in the right places_ resulted in a different but (hopefully) better approach. I held to Goethe, growth as animation, and a generally algebraic approach with laws that are derived and tested, but let go of the semiring and left Bend 2 open.