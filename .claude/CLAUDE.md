# axioms-protocol — canon repo

One public artifact: the **axioms plugin** — **`AXIOMS.md`**, the closed, substrate-neutral canon of finite-actor agency, and two skills that load it: **`skills/axiom-lens/`** (audit a named target against it) and **`skills/axiom-discuss/`** (open discussion grounded in it). Every other file serves its editing.

## Editing the canon

- **Dogfood.** The canon obeys its own axioms — one home per truth (SSOT), one whole goal (Atomic), declared edges (Boundary), no ornament (Outcome-Driven). If the document violates an axiom, the document is wrong: fix the document, not the axiom.
- **Keep it pure law.** The canon is substrate-neutral and knows no reader. Projections, examples, and named consumers live in the consumer's repo — never here.
- **Distill then delete.** Fold source material (drafts, notes, prior conversation) into the canon, verify, then delete it — nothing load-bearing lost. Git log is the history; never narrate precedent inside the canon.
- **Amend deliberately.** Change the canon only by versioned amendment — never silent drift.

## Editing the skills

- **A skill loads the canon; it never restates it.** Axiom text inside a skill body is a parallel truth — delete it and keep the runtime Read.
- Skills stay substrate-bound (Claude Code) and consumer-facing; the canon stays substrate-neutral and reader-blind. Neither edits to fit the other.
- **Lens audits, discuss converses.** One procedure per skill (Atomic); a new consumption mode is a new skill, not a mode switch inside an existing one.

## Rules

- `canon-governance` (fires on `AXIOMS.md`) — the admission gate and hygiene tests the set must satisfy before any change commits.
