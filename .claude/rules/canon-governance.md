---
description: Closure gates for the axiom canon — apply before any change to AXIOMS.md commits
globs: ["AXIOMS.md"]
---

# Canon governance

Gates that keep the axiom set closed and clean. Apply when adding, removing, or reshaping an axiom.

## Admission — what may enter the set

A new axiom must add a force the union of the others does not: remove it and a real gap appears. No residual force → it is a corollary or a fuel property, not an axiom.

## Hygiene — what the set must satisfy after any change

- **Consistent** — no pair of axioms contradicts.
- **Independent** — each carries a residual force (the admission test, held standing).
- **Frame-translates** — each holds across ≥3 of person / career / AI agent / team.

## Propagation — before the change commits

- Bump `version` in `.claude-plugin/plugin.json` in the same commit — an unbumped version leaves stale canon in the field.
