# AXIOMS — The Protocol

**Version:** 1.0.0
**Status:** Locked. Revision only via deliberate version bump.
**Epistemology, admission criteria, drift guard:** see `SEED.md`.

Six axioms. Stipulated as law. Frame-neutral. Equal rank.

Quality constraints (hygiene, not authority): consistency, independence, frame-translation productivity.

---

## I. Boundary

**A thing exists by virtue of its edge. What is not bounded is not.**

- Mandates: every thing declares its scope, its ownership, its edge.
- Forbids: unbounded scope, implicit ownership, scope creep, conflated identity.

---

## II. SSOT — Single Source of Truth

**One reality per object per time.**

- Mandates: one canonical reference for any given fact, state, or decision.
- Forbids: parallel truths, duplicated state, ambiguous authority, silent forks.

---

## III. Decoupling

**Peers depend on contract, not on each other.**

- Mandates: contract-only access between peers; no shared mutable state; no implicit dependency.
- Forbids: reaching into another's internals; coupling via shared state; assumed knowledge of a peer's implementation.

---

## IV. Finitude

**Capacity is bounded. Admit it, then act on it.**

Two faces of the same admission:

- **Outward** — route through external contracts to reach beyond the self. *I do not know everything, therefore I can leverage everything.*
- **Inward** — guard finite attention and bandwidth. Focus is a scarce resource and must be conserved on both sides of every interface.

Together:

- Mandates: explicit interfaces for what is delegated outward; ruthless reduction of what is demanded inward.
- Forbids: pretense of omniscience; bloat; noise; demanding more than the receiver can hold.

---

## V. Entropy

**Cost is real. Cause leaves trace.**

- Mandates: cleanup of side effects; containment of blast radius; reversibility where possible; explicit accounting where not.
- Forbids: free actions; unowned side effects; irreversibility accepted by default rather than by decision.

---

## VI. Outcome-Driven

**Every action and every artifact must serve a stated outcome.**

- Mandates: outcome declared before action; ornament removed; misaligned action abandoned at first unambiguous signal.
- Forbids: speculative scaffolding; forward optimization; just-in-case branches; ornament; orphan artifacts.

---

## Corollaries

These are not axioms. They are theorems derivable from the set and named here for convenience.

- **Failfast** — from Outcome-Driven + Entropy. If action is misaligned with the stated outcome, and cost is real, continuation is waste. Abandon at first unambiguous signal of misalignment.

---

## Reading Protocol

- Consumers reference the protocol by version. Pin explicitly.
- Breaking change → major bump. New axiom, axiom removal, or semantic change of an axiom → major.
- Clarifying or tightening wording without changing meaning → patch.
- No silent drift. Any change to this file must increment the version and record the rationale.
- New axioms admitted only via the criteria in `SEED.md`.
