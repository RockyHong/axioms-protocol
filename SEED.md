# axioms-protocol — SEED

> This file locks alignment before any further work. Re-read before any structural change. If a proposed change contradicts this file, the change is wrong (or this file needs an explicit, deliberate amendment — never silent drift).

SEED is the **meta** home: epistemology, scope, admission discipline, drift guard. The axioms themselves — the apex, the seven, their mandates and forbids — live in [`axioms/index.md`](axioms/index.md). One truth, one home.

---

## First Principle

**Authority and telos are two separate axes. Never conflate them.**

### Authority — flat stipulation

Each axiom is *posited as law*. Its authority comes from the posit + adoption — not from external argument, not from mutually referencing the other axioms. Each is **independently stipulated, flat rank**. No axiom outranks another.

### Telos — the apex

The set has an apex: **attention** — the finite, volatile fuel a finite actor burns toward an outcome (see `axioms/index.md`). The apex **necessitates** the set but does not **justify** it. Remove the constraint — grant infinite attention — and every axiom becomes unnecessary: you would never need to aim, divide, conserve, target, or leverage. The finitude is what makes the discipline real. But *necessity is not justification.* Each axiom's authority remains its own stipulation; **deriving** an axiom from the apex would be foundationalism — the "Axiom 0" this protocol forbids.

So the apparent contradiction (an apex over a flat set) dissolves: the set is **flat in authority, rooted in purpose** — the purpose being *spend finite attention well*. A teleological apex that *necessitates* is legal. A foundationalist authority-root that *justifies* is not.

### Hygiene constraints (govern the set; not the source of authority)

1. **Consistency** — no axiom contradicts another.
2. **Residual force** (the sharpened independence test) — each axiom contributes a force the union of the others does not. Remove it → a real gap appears. No residue → it is a corollary or a property, not an axiom.
3. **Frame-translation** — each axiom stays meaningful across the scope's instances (person / career / AI agent / team).

Revision is allowed but disciplined: fallibilism on top of an axiomatic floor. Change only via deliberate, versioned amendment — never silent drift.

> **Note on prior wording.** Earlier drafts called the authority model "Coherentism." That label was wrong. Coherentism makes mutual fit the *source* of justification, which (a) admits rival internally-coherent sets with no way to choose, (b) softens the iron-law tone the protocol requires, and (c) opens a drift surface where any node can be swapped for a "coherent replacement." Stipulation keeps the web metaphor (the residual-force test still uses it) but locates authority in the posit, not in the mutual hug.

---

## Scope

**Domain: the structure "a finite actor pursuing a stated outcome" — wherever it appears. Substrate-neutral, *not* universal.**

Two gates, both required:

1. **Outcome-driven** — the effort serves a stated end. *Firewall against "universal":* undirected, non-teleological reality is out of scope. Not everything needs to be outcome-driven.
2. **Finite actor** — a bounded locus of attention holds the goal. Finitude has two faces: bounded **attention** (must focus + divide) and bounded **knowledge/reach** (must leverage beyond self).

The actor is *any* instance of that structure: a whole person (life direction), a slice of a life (a career, a project, self-management of one's affairs), a single mind dividing its own concerns, an AI agent, a team or org. Canon names none of them — it speaks of the **actor** generically; instances are named only in projections.

### Noun rule

> A noun is canon-legal iff it survives across every instance: a person's goals ⇄ a career ⇄ an AI agent ⇄ a team.

- **Legal (structure-level):** actor, attention, goal / outcome, concern, context, leverage, boundary, truth, cost.
- **Forbidden (substrate-bound → projection only):** LLM, token, context-window, subagent, code, function, ticket, KPI, headcount. Also "delegate to a human/agent" *as the definition of* leverage — too narrow; leverage spans tools, information, and actors alike.

This is **broader** than the old "domain-neutral across all of reality" (it admits intra-personal work and tool-leverage) yet still firewalled from "universal" by gate 1.

---

## What this repo IS

- Canonical upstream SSOT of the **substrate-neutral axioms of finite-actor agency**.
- Substrate-neutral within the finite-actor + outcome scope.
- A divine anchor that external downstream consumers reference.
- Stable, versioned, citable.

## What this repo is NOT

- Not harness-specific, coding-specific, or agent-framework-specific.
- Not a theory of *all* reality — only of outcome-driven work by a finite actor.
- Does not contain frame projections (no examples in code / PM / business / life inside the canon).
- Does not enumerate consumers. Does not know who reads it.

Any frame-specific interpretation, example, or application — the **projection** — lives in the consumer's repo, not here. The Claude-Code lore (`~/.claude/guidelines/axiom-principles/`) is the *AI-agent* projection; a team playbook would be the *human-org* projection.

---

## Goals

1. Single source of truth for the axioms.
2. Substrate-neutral canonical language (the noun rule).
3. Consistency + residual-force independence (no contradiction, no redundancy).
4. Stability (consumers can pin a version and reference safely).
5. Admission discipline (a new axiom must survive consistency + residual-force + frame-translation).

---

## Context

Origin: a conversation about building a rule-bound AI agent system (working metaphors: "Iron Stoic", "Iron Tyrant", orchestrator + sub-agent monks). Mid-conversation the scope expanded — the same structure governs coding, planning, PM, business, and a life directed at a goal. Therefore the protocol is substrate-neutral, and the canonical layer is extracted from any single consumer.

The bounded-actor stance that motivates the canon — now a canon-native motto (`axioms/index.md`):

> "I don't know everything, therefore I can leverage everything."

---

## The Set — home and record

The axioms live in [`axioms/index.md`](axioms/index.md), the SSOT for the set: the apex, the fuel-properties, the seven axioms with mandates and forbids, the mottos, the corollaries. **SEED does not re-enumerate them** — duplicating the truth-home would violate SSOT.

**Closed at seven** (top-down recalibration, 2026-06-02): Outcome-Driven · Grounding · Separation of Concerns · Atomic · Boundary · Leverage · SSOT — grouped Aim · Divide · Extend · Keep.

**Residual-force admission rule.** An axiom must contribute a force not covered by the union of the others. No residue → corollary or property, not axiom. This sharpened independence test governs every future admission and every audit.

**Dissolved five** — failed the residual-force test, recorded so they are not re-grafted:

| Dissolved | Decomposes into |
|---|---|
| Finitude | fuel properties (Finite, Volatile) + Leverage |
| Decoupling | SoC + SSOT + Boundary (emergent; coupling is the *symptom* one was violated) |
| Entropy / Footprint | the Irreversible property + handling via Outcome / SSOT / SoC / Boundary |
| Fail-fast / Probe | the apex's iteration dynamic (decision → action → result → learning) |
| Externalize | the Volatile property + footprint → SSOT |

**Net: zero added, five dissolved.** The residual-force test did its job.

---

## How — Operating Rules of This Repo

0. **Dogfood Supreme.** The canon must obey its own axioms. Every file here is itself an artifact subject to the seven — Boundary, SSOT, SoC, Atomic, Outcome-Driven, Grounding, Leverage. If the doc violates an axiom, the doc is wrong — fix the doc, not the axiom. Self-application is the deepest consistency check available; passing it is non-negotiable.

1. **Structure-level language only.** Axioms use only canon-legal nouns (see the Scope noun rule): actor, attention, goal, concern, context, leverage, boundary, truth, cost. Forbidden inside canon: any substrate-bound noun — LLM, token, code, function, ticket, KPI, person, user — that names a single frame.

2. **No frame projections inside the canon.** Examples, applications, "how to use in X" belong to the consumer, in the consumer's repo.

3. **No consumer enumeration.** Canon does not know who reads it. Anyone reads.

4. **Versioning — deferred.** Not yet released; git history is the version record. A formal version scheme + pinning is introduced only when a consumer actually needs to pin. Adding one now is premature scaffolding (Outcome-Driven).

5. **Admission criteria for a new axiom.** Must satisfy all of:
   - **Residual force** — removal leaves a real gap not covered by the union of the others.
   - Consistent with existing axioms (introduces no contradiction).
   - Survives frame-translation across the scope's instances (≥3 of person / career / AI agent / team).
   - Stated in structure-level language (the noun rule).
   - Posited deliberately and recorded in git — never silently grafted in.

6. **Meta vs axiom separation.** Axioms live in `axioms/` — `index.md` is the self-contained set (apex + fuel-properties + seven axioms with mandates/forbids + mottos + corollaries + dissolved-list). Meta — epistemology, scope, admission criteria, drift guard — lives here in SEED. Distinct homes, one truth each. (Per-axiom files may later split out of `index.md` if a consumer needs them; until then `index.md` is the single home.)

7. **Source absorption before removal.** Any external source material (chat logs, drafts, notes, prior conversations, the `calibration/` working area) that informed the canon must have its load-bearing content fully absorbed into the appropriate canon file *before* the source is removed. Distill, verify, then delete. Source is throwaway; canon is the SSOT. Never accept silent loss; never permit premature deletion. If a source cannot be safely deleted yet, that is a signal the canon is incomplete — fix the canon first.

---

## Drift Guard

Reject any proposed change that:

- Adds consumer-specific content → violates Boundary.
- Adds examples bound to one frame, or a substrate-bound noun → violates Boundary and the noun rule.
- Expands scope to undirected / non-teleological reality (the old "all of reality" framing) → violates gate 1; canon covers finite-actor + outcome work only.
- Removes or alters an axiom without a consistency + residual-force audit → violates SSOT of the canon itself.
- Adds a node that fails the **residual-force test** (decomposes into existing axioms / properties with no leftover) → it is a corollary or property, not an axiom.
- Reintroduces a **foundationalist authority-root** — an "Axiom 0" that *justifies* the others, or any axiom *derived* from the apex. A teleological apex that *necessitates* the set is legal; an authority-root that *justifies* it is not.
- Justifies an axiom by appeal to the other axioms ("it fits the web") → that is Coherentism; authority here is stipulation, not mutual fit. Mutual fit is a hygiene check, not a license.
- Lets the canon doc itself violate an axiom (bloat, premature scaffolding, parallel sources, undeclared dependency, orphan section) → Dogfood Supreme breach. The doc is the first test bed.
- Names a downstream consumer → violates Boundary and Leverage (canon pretending to know all downstream frames).

Before any structural edit: re-read this SEED.

---

## Status

- Seed rewritten: **2026-06-02** (Phase 6 of the top-down recalibration).
- **Top-down rebuild complete.** Canon re-authored from the pinned seed intent, not from the harness projection. Spine ratified (scope · apex · authority), set closed at **7** axioms, downstream gate passed.
- Authority model sharpened: **authority axis** (flat stipulation) split from the **telos axis** (apex = attention; necessitates ≠ justifies). The flat-set-with-no-apex framing of the prior SEED is superseded.
- Set closed at **7** via the residual-force test: Outcome-Driven · Grounding · SoC · Atomic · Boundary · Leverage · SSOT. **Five dissolved** (Finitude, Decoupling, Entropy/Footprint, Fail-fast/Probe, Externalize), zero added.
- Canon: `axioms/index.md` — self-contained (apex + properties + seven axioms + mottos + corollaries + dissolved-list).
- `calibration/` holds the live design record (spine · structure · set · downstream-fit). Safe to clean once SEED + axioms are confirmed final, per Operating Rule 7 (source absorption).
