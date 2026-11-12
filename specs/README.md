# Specs

A spec is canonical: an approved decision that the code must match. A code change that affects specified behaviour updates the spec in the same commit. If behaviour isn't specified, it isn't decided; say so and ask rather than inventing it.

Specs usually come from an accepted RFC. The RFC keeps the reasoning; the spec keeps only the decision, stated so code can be checked against it.

## File name

`SPEC_NNN_short_slug.md`, numbered in order of approval, three digits. Spec numbers are independent of RFC numbers.

## Header

```markdown
# SPEC NNN: Title

Status: Approved
Date: YYYY-MM-DD (revised YYYY-MM-DD)
Source: RFC NNN
```

## Content

- **Summary.** What the spec defines, as a short list.
- **Rules.** Checkable statements, in glossary terms. Number them if other documents or code comments will cite them. Each rule names the principle it serves when that isn't obvious.
- **Code references.** Point at the code that implements a rule as `src/...` paths in backticks or markdown links. `npm run check:specs` (part of `npm run lint`) fails if a referenced path doesn't exist. It does not check that the prose still matches behaviour; keeping that true is the job of whoever changes the code.

No rationale beyond a line where a rule would otherwise look arbitrary; the reasoning lives in the source RFC. When a spec is approved, add it to the Specs and RFCs table in [CLAUDE.md](../CLAUDE.md).
