# RFCs

An RFC explores a design before it is decided: what we want to change, why, what it means for the work, and what we considered instead. RFCs are rationale, not rules. Once approved, the decision moves into a spec (or, for a new principle, into PRINCIPLES.md), and the spec is what the code must match. RFCs are not kept in sync afterwards, so they go stale; read them for why, not for what.

## Lifecycle

1. **Draft.** Written to think something through. Can be rough.
2. **Discussion.** Ready for the user to push on. Open questions are listed, not buried.
3. **Accepted**, with a pointer to where the decision now lives (`SPEC_NNN`, or a principle number). The accepted text is written into that spec or principle in the same change that marks the RFC accepted.
4. **Rejected** or **Superseded by RFC NNN**, with one line on why. Kept, not deleted: the reasoning is still useful.

An RFC can propose a design principle. The principle text goes into PRINCIPLES.md only when the user approves it; principles are written together, not inferred.

## File name

`rfc_NNN_short_slug.md`, numbered in order of creation, three digits. RFC numbers and spec numbers are independent.

## Header

```markdown
# RFC NNN: Title

Status: Draft | Discussion | Accepted (→ SPEC_NNN / principle N) | Rejected | Superseded by RFC NNN
Date: YYYY-MM-DD (revised YYYY-MM-DD)

### Related

- PRINCIPLES.md principle N (name)
- SPEC_NNN, RFC NNN
- bd issue id
```

## Sections

Use the ones that apply; leave out the ones that don't rather than filling them.

- **Summary.** What changes, in two or three sentences, starting with what someone looking at or using the work will see differently.
- **Motivation.** Why now, and what's wrong or missing without it.
- **Principles check.** Each principle the design touches: how it complies, or an explicit, justified exception. A design that can't name the principle it traces to isn't ready (CLAUDE.md, Principles before implementation).
- **Design.** The rule or mechanism, concretely enough to check code against. State quantitative claims with how they were computed, or mark them as unverified.
- **Parameters.** What it exposes in the jig, with ranges and what each end of the range looks like; and what stays a buried constant, with why.
- **Alternatives considered.** What else was on the table and why it lost.
- **Open questions.** What is undecided, and who decides it.

New terms are defined in [GLOSSARY.md](../GLOSSARY.md) in the same change.
