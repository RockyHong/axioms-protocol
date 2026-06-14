---
name: audit
description: Audit a topic, artifact, design, or decision against the axioms canon in a fresh context. Pins the target and its outcome-anchor with you, then dispatches a cold subagent that loads AXIOMS.md and holds the target against each axiom — returning grounded concerns, possible antipatterns, and insights. You disposition; the human judges. Never issues verdicts. Use when the user asks to audit, sanity-check, or reflect on something against the axioms. For open discussion, use `load`.
---

# Audit — Fresh-Context Canon Audit

A real audit needs fresh eyes: a target held in the context that authored or argued it gets self-review, not audit. So this skill routes the holding to a **cold subagent** blind to the advocacy — it pins target + anchor with you, dispatches, and dispositions what comes back.

## Input contract

- **Target** — the argument names the topic, artifact, file, or decision to audit. No explicit argument → infer the session subject, then confirm it with the user before dispatching (step 2). Neither identifiable → return a question naming what is missing; do not guess a target.
- **Exclude advocacy** — the dispatch carries the target itself (its text, structure, observed behavior), never the author's defense of it. Session justification narrative stays out of the dispatch; that blindness is the audit's value.

## Dispatcher procedure (main loop — interactive)

The cold agent cannot ask you anything mid-run, so target and anchor are fixed here, with you, before dispatch.

1. **Scope gate.** Confirm the target passes the canon's two gates — a finite actor pursuing a stated outcome (AXIOMS.md § Scope). Fail either gate → name which, drop the canon framing, route to ordinary review; do not dispatch.
2. **Pin the anchor — never silently.** Restate the target's outcome in one line, at its own grain (its own outcome plus one nesting up — does it serve its parent's? — never a distant ancestor).
   - **Clear** → state it. An explicit target/anchor proceeds. An inferred one is confirmed before dispatch as a *redirectable proposal* — restate the inference and the session evidence it rests on so the user can correct or redirect it.
   - **Ambiguous** between plausible readings → surface the options and confirm with the user before dispatching; a wrong anchor makes every finding measure the wrong target (Axiom II).
   - **Absent** → that is itself the first concern (Axiom I): surface it and route to `load` to form one; do not invent an anchor to dispatch against.
3. **Resolve the dispatch inputs.** Derive the absolute path to `AXIOMS.md` from the base directory named in this skill's invocation (two levels above it = the plugin root) and pass it — the cold agent cannot resolve a relative reference. Resolve the target too: file paths, or the target text serialized inline when it lives only in the session (the cold agent holds no session context).
4. **Dispatch the cold audit** (next section), then disposition.

## Dispatch spec — the cold subagent

Spawn the `axioms:audit-probe` agent — a read-only cold auditor that owns the load protocol, hold procedure, and return contract, so the dispatch supplies only:

- **AXIOMS.md path** — the absolute path resolved in step 3; the agent reads the canon cold and holds no session context.
- **Target** — the target text / file paths, never the authoring rationale; that blindness is the audit's value.
- **Anchor** — the fixed one-line outcome at its grain, pinned in step 2.

Designate the model at dispatch (`sonnet` default — judgment work; escalate tier only with a named reason).

## Disposition (main loop)

The report is a fresh-eye second opinion; weigh each finding against context only this session holds. Per finding: **apply**, **falsify** against the target, or **reject with rationale**. Close by routing judgment to the human — the audit does not score, rank, pass, or fail the target.

**Render for the human, not the model.** The report's `axiom · evidence · strain` is the cold agent's proof-of-work — agent-facing. Don't pass it through raw. Surface each kept finding as one sharp plain claim: the consequence for the target's outcome, in the human's terms, one idea each. The axiom cite rides behind as drillable backing, never the headline.

## Edges

- A request for open discussion rather than a structured audit routes to `load`.
- Requests to amend the canon route to the canon repo's governance.
- Out-of-scope targets and review needs outside the axioms route to ordinary code or document review (scope gate, step 1).
