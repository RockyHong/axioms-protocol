---
name: audit
description: Audit a topic, artifact, design, or decision against the axioms canon in a fresh context. Pins the target and its outcome-anchor with you, then dispatches a cold subagent that loads AXIOMS.md and holds the target against each axiom — returning grounded concerns, possible antipatterns, and insights. You disposition; the human judges. Never issues verdicts. Use when the user asks to audit, sanity-check, or reflect on something against the axioms. For open discussion, use `load`.
---

# Audit — Fresh-Context Canon Audit

A real audit needs fresh eyes: a target held in the context that authored or argued it gets self-review, not audit. So this skill routes the holding to a **cold subagent** blind to the advocacy — it pins the fact ground, target, and anchor with you, dispatches, and dispositions what comes back.

## Input contract — three typed inputs

The probe holds the whole footprint: where the target moves *from*, the move itself, where it should *land*. Fragment it and the probe invents the missing piece, then audits the fiction (Axiom II). So the dispatch carries three, each a declared input the sender owns:

- **Fact ground** — the situation the target sits in: what's going on, current state, what was tried and observed — the A the target moves from. Typed as *fact*: declared reality with a truth value, never interpretation.
- **Target** — the topic, artifact, file, or decision under audit: the approach itself, the A→B move. No explicit argument → infer the session subject, then confirm before dispatching (step 2). Neither identifiable → return a question naming what is missing; do not guess.
- **Anchor** — the outcome shape, the B the move should reach (pinned in step 2).

**Advocacy is excluded by type, not by a guard.** The author's *defense* — "therefore this is right" — is not a fact, names no target, shapes no outcome; it fills no slot and never enters. The sender owns supplying clean inputs; the probe trusts the contract and never reaches back to verify them (Atomic, Boundary). Blindness to the defense stays the audit's value.

## Dispatcher procedure (main loop — interactive)

The cold agent cannot ask you anything mid-run, so target and anchor are fixed here, with you, before dispatch.

1. **Scope gate.** Confirm the target passes the canon's two gates — a finite actor pursuing a stated outcome (AXIOMS.md § Scope). Fail either gate → name which, drop the canon framing, route to ordinary review; do not dispatch.
2. **Pin the anchor — never silently.** Restate the target's outcome in one line, at its own grain (its own outcome plus one nesting up — does it serve its parent's? — never a distant ancestor).
   - **Clear** → state it. An explicit target/anchor proceeds. An inferred one is confirmed before dispatch as a *redirectable proposal* — restate the inference and the session evidence it rests on so the user can correct or redirect it.
   - **Ambiguous** between plausible readings → surface the options and confirm with the user before dispatching; a wrong anchor makes every finding measure the wrong target (Axiom II).
   - **Absent** → that is itself the first concern (Axiom I): surface it and route to `load` to form one; do not invent an anchor to dispatch against.
3. **Resolve the dispatch inputs.** Derive the absolute path to `AXIOMS.md` from the base directory named in this skill's invocation (two levels above it = the plugin root) and pass it — the cold agent cannot resolve a relative reference. Resolve the target: file paths, or the target text serialized inline when it lives only in the session (the cold agent holds no session context). Assemble the fact ground from the session — state, history, what was tried and observed — as declared facts; you own its fidelity, the probe will not (and must not) re-verify it. Advocacy named in the session stays out by type, not by scrubbing — it is not a fact.
4. **Dispatch the cold audit** (next section), then disposition.

## Dispatch spec — the cold subagent

Spawn the `axioms:audit-probe` agent — a read-only cold auditor that owns the load protocol, hold procedure, and return contract, so the dispatch supplies only:

- **AXIOMS.md path** — the absolute path resolved in step 3; the agent reads the canon cold and holds no session context.
- **Fact ground** — the situation as declared facts (step 3); the A the target moves from, so every finding measures the real target.
- **Target** — the target text / file paths.
- **Anchor** — the fixed one-line outcome at its grain, pinned in step 2.

Designate the model at dispatch (`sonnet` default — judgment work; escalate tier only with a named reason).

## Disposition (main loop)

The report is a fresh-eye second opinion; weigh each finding against context only this session holds. Per finding: **apply**, **falsify** against the target, or **reject with rationale**. Falsify the findings that *agree with* the target as hard as the ones that attack it — a wrong attack is loud and you catch it at disposition; a wrong validation is silent, flatters what you already wanted, and compounds once it lands in SSOT (Axiom II). Never apply an insight you did not try to break. Close by routing judgment to the human — the audit does not score, rank, pass, or fail the target.

**Render for the human, not the model.** The report's `axiom · evidence · strain` is the cold agent's proof-of-work — agent-facing. Don't pass it through raw. Surface each kept finding as one sharp plain claim: the consequence for the target's outcome, in the human's terms, one idea each. The axiom cite rides behind as drillable backing, never the headline.

## Edges

- A request for open discussion rather than a structured audit routes to `load`.
- Requests to amend the canon route to the canon repo's governance.
- Out-of-scope targets and review needs outside the axioms route to ordinary code or document review (scope gate, step 1).
