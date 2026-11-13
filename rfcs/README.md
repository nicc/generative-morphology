# RFCs

An RFC explores a design before it is decided: what we want to change, why, what it means for the work, and what we considered instead. RFCs are rationale, not rules. Once approved, the decision moves into a spec (or, for a new principle, into PRINCIPLES.md), and the spec is what the code must match. RFCs are not kept in sync afterwards, so they go stale; read them for why, not for what.

## Lifecycle

1. **Draft.** Written to think something through. Can be rough.
2. **Discussion.** Ready for the user to push on. Open questions are listed, not buried.
3. **Accepted**, with a pointer to where the decision now lives (`SPEC_NNN`, or a principle number). The accepted text is written into that spec or principle in the same change that marks the RFC accepted.
4. **Rejected** or **Superseded by RFC NNN**, with one line on why. Kept, not deleted: the reasoning is still useful.

An RFC can propose a design principle. The principle text goes into PRINCIPLES.md only when the user approves it; principles are written together, not inferred.

## Order of work

For a design that adds or changes a generation type or its operations, the **Meaning and laws** section is written first and the user reads it before anything else in the RFC is drafted: before an operator table, an architecture, a parameter list. Operators chosen before the meaning is stated get their gaps filled by conventions ("in canonical order", "drawn once", "in practice never identical"); such a phrase in a draft is a sign the meaning is missing. When reading a Meaning and laws section, ask of each operation: what are the types of its arguments, and does each law type-check? A Draft does not move to Discussion with an operation whose meaning is unstated, an operation without a type, or a law that isn't derived from the meaning. (RFC 001.)

## One concern per RFC

The RFCs that are not yet Accepted describe one coherent design between them. Each owns one concern and refers to the others for theirs. When a new idea changes another Draft's subject, edit that RFC; don't write a second one that amends or contradicts it. History is in git. "Superseded by" is for an RFC that was Accepted and later replaced.

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

Use the ones that apply, in this order; leave out the ones that don't rather than filling them.

- **Summary.** What changes, in two or three sentences, starting with what someone looking at or using the work will see differently.
- **Motivation.** Why now, and what's wrong or missing without it.
- **Meaning and laws.** For any new or changed generation type: its meaning (a mathematical object simpler than the code), the meaning function, and what each operation does to the meaning. Give every operation a type: what each argument is (a value, a rule, a function on contexts) and what it returns, so that every law type-checks as written with both sides the same type. An operation described only in words, or a law that uses an argument as two different kinds of thing, isn't ready. Include one worked example: a concrete rule or value written out in the operations themselves (not described in prose), with what it produces. A claim about what the operations give ("a stem is the phytomer continued n times") is made by showing the expression. *On trial since 2026-11-13: when the next two RFCs or RFC revisions have used it, check whether the example caught anything the types and the review did not, and keep, change or drop this requirement (generative-morphology-2rv).* Then the laws that follow, numbered, and the equations that look as if they should hold but don't, each with its smallest counterexample. Say what equality compares. (Method and references: RFC 001.)
- **Judgement calls.** Choices in the model that change what is drawn or how the jig behaves, each stated as a question about the form, with a recommendation and what the recommendation gives up. Kept apart from open questions so that a choice about the form isn't settled as a technical detail.
- **Principles check.** Each principle the design touches: how it complies, or an explicit, justified exception. A design that can't name the principle it traces to isn't ready (CLAUDE.md, Principles before implementation).
- **Design.** The rule or mechanism, concretely enough to check code against. State quantitative claims with how they were computed, or mark them as unverified.
- **Parameters.** What it exposes in the jig, with ranges and what each end of the range looks like; and what stays a buried constant, with why.
- **First slice.** The smallest thing to build that can be looked at and that tests the RFC's claims, what it leaves out, and what looking at it should tell us. An RFC whose design can't be tried in a slice is probably two RFCs.
- **Alternatives considered.** What else was on the table and why it lost.
- **Open questions.** What is undecided, and who decides it.

New terms are defined in [GLOSSARY.md](../GLOSSARY.md) in the same change.
