# axioms-protocol — SEED

> This file locks alignment before any further work. Re-read before any structural change. If a proposed change contradicts this file, the change is wrong (or this file needs an explicit, deliberate amendment — never silent drift).

---

## First Principle

**Axiomatic Stipulation.** The axioms are *posited as law*, not justified by external argument and not justified by mutually referencing each other. Authority comes from stipulation + adoption, not from internal self-support.

No foundationalist root. No "Axiom 0" above the rest. The axioms form a flat set of equal-rank stipulations.

Three quality constraints govern the set (these are hygiene, not the source of authority):

1. **Consistency** — no axiom contradicts another.
2. **Independence** — no axiom is derivable from the others; removing any one leaves a real gap (the "removal-breaks-the-web" test).
3. **Frame-translation productivity** — each axiom must remain meaningful and useful across multiple unrelated domains.

Revision is allowed but disciplined: fallibilism on top of an axiomatic floor. Change only via deliberate, versioned amendment — never silent drift.

> **Note on prior wording.** Earlier drafts called this "Coherentism." That label was wrong. Coherentism makes mutual fit the *source* of justification, which (a) admits rival internally-coherent sets with no way to choose, (b) softens the divine-anchor / iron-law tone the protocol requires, and (c) opens a drift surface where any node can be swapped for a "coherent replacement." Axiomatic Stipulation keeps the web metaphor (independence test still uses it) but locates authority in the posit, not in the mutual hug.

---

## What this repo IS

- Canonical upstream SSOT of universal axioms.
- Domain-neutral. Frame-agnostic.
- A divine anchor that external downstream consumers reference.
- Stable, versioned, citable.

## What this repo is NOT

- Not harness-specific.
- Not coding-specific.
- Not agent-framework-specific.
- Does not contain frame projections (no examples in code / PM / business / life inside the canon).
- Does not enumerate consumers.
- Does not know who reads it.

Any frame-specific interpretation, example, or application lives in the consumer's repo, not here.

---

## Goals

1. Single source of truth for the axioms.
2. Frame-neutral canonical language.
3. Consistency + independence (no internal contradiction, no redundancy).
4. Stability (consumers can pin a version and reference safely).
5. Admission discipline (new axiom must survive coherence + frame-translation tests).

---

## Context

Origin: a conversation about building a rule-bound AI agent system (working metaphors: "Iron Stoic", "Iron Tyrant", orchestrator + sub-agent monks). Mid-conversation the scope expanded — the same principles apply to coding, planning, PM, business, and life. Therefore the protocol must be domain-neutral, and the canonical layer must be extracted from any single consumer.

Recurring stance across the web (not itself an axiom — a *phrasing* of the bounded-agent posture that motivates the canon):

> "I don't know everything, therefore I can leverage everything."

---

## What — Current Axiom Candidates

Provisional. Subject to a consistency + independence + frame-translation audit before being finalized.

Core set (from initial convo):

1. **Boundary** — Existence via boundary. Without boundary, no identity; only chaos. A thing must know what it is and what it is not.
2. **SSOT** — One reality per object per time. No parallel truths. No ambiguous state.
3. **Decoupling** — Independence as purity. Components depend on contract, not on each other's internals.
4. **Leverage** — Finitude as power. Admit not-knowing; route through interface to command beyond self.
5. **Entropy** — Cost is real. Cause leaves trace. Irreversibility demands cleanup and containment of side effects.

Extended candidates (added for audit — may dedup into core):

6. **Attention** — Finite focus is a scarce resource. Spend it deliberately; protect it from noise; never waste a reader's or an executor's bandwidth.
7. **Failfast** — Reject premature optimization, forward optimization, speculative generality, and over-engineering. Build only what current outcome demands. Fail cheap and early; do not pay for futures that may never arrive.
8. **Outcome-Driven** — Every action and artifact must trace to a stated outcome aligned with the first principle. No ornament. No just-in-case. If it does not serve the outcome, it does not exist.

Pending audit (run before lock):
- **Consistency** — any pair contradict under any frame-translation?
- **Independence** — any axiom derivable from the others? (e.g. Decoupling vs Boundary viewed from outside vs inside; Failfast vs Entropy; Outcome-Driven vs Leverage; Attention vs Boundary.) Remove → does a real gap appear?
- **Frame-translation productivity** — each survive in at least three unrelated domains with non-trivial meaning?
- **Dedup pass** — fold any candidate that is a sub-case of another. Keep the smallest set that loses nothing.

---

## How — Operating Rules of This Repo

0. **Dogfood Supreme.** The canon must obey its own axioms. Every file in this repo is itself an artifact subject to Boundary, SSOT, Decoupling, Leverage, Entropy, Attention, Failfast, and Outcome-Driven. If the doc violates an axiom, the doc is wrong — fix the doc, not the axiom. Self-application is the deepest consistency check available; passing it is non-negotiable.

1. **Frame-neutral language.** Axioms use only universal nouns: boundary, truth, dependency, finitude, cost, contract, cause, trace. Forbidden inside canon: agent, code, function, ticket, market, KPI, person, user — any noun that names a single frame.

2. **No frame projections inside the canon.** Examples, applications, "how to use in X" belong to the consumer, in the consumer's repo.

3. **No consumer enumeration.** Canon does not know who reads it. Anyone reads.

4. **Versioning.** Protocol is versioned. Consumers pin. Breaking change = major bump. Coherence change = minor. Wording polish = patch.

5. **Admission criteria for a new axiom.** Must satisfy all of:
   - Survives frame-translation across multiple unrelated domains.
   - Consistent with existing axioms (introduces no contradiction).
   - Independent — removal breaks the set (otherwise it is redundant, not axiomatic).
   - Stated in frame-neutral language.
   - Posited deliberately, with version bump — never silently grafted in.

6. **Meta vs axiom separation.** Axioms = canonical statements. Meta = epistemology (what counts as axiom, why stipulation, admission criteria, drift guards). Both live here, in distinct files.

7. **Source absorption before removal.** Any external source material (chat logs, drafts, notes, prior conversations) that informed the canon must have its load-bearing content fully absorbed into the appropriate canon file *before* the source is removed. Distill, verify, then delete. Source is throwaway; canon is the SSOT. Never accept silent loss; never permit premature deletion. If a source cannot be safely deleted yet, that is a signal the canon is incomplete — fix the canon first.

---

## Drift Guard

Reject any proposed change that:

- Adds consumer-specific content → violates Boundary.
- Adds examples bound to one frame → violates Boundary and Decoupling.
- Removes or alters an axiom without a consistency + independence audit → violates SSOT of the canon itself.
- Reintroduces a foundationalist "Axiom 0 above others" framing → axioms are flat-rank stipulations, not a hierarchy.
- Justifies an axiom by appeal to the other axioms ("it fits the web") → that is Coherentism; authority here is stipulation, not mutual fit. Mutual fit is a hygiene check, not a license.
- Lets the canon doc itself violate an axiom (bloat, premature scaffolding, parallel sources, undeclared dependency, orphan section) → Dogfood Supreme breach. The doc is the first test bed.
- Names a downstream consumer → violates Boundary and Leverage (canon pretending to know all downstream frames).

Before any structural edit: re-read this SEED.

---

## Status

- Seed updated: 2026-05-20.
- Audit complete. Set locked at **6** via dedup (Failfast → corollary of Outcome-Driven + Entropy; Attention → inward face of Finitude alongside Leverage as outward face).
- Canon document: `AXIOMS.md` v1.0.0 — locked.
- No meta document. SEED holds epistemology; splitting it out would duplicate SSOT and violate Failfast.
