---
name: axiom-lens
description: Audit a topic, artifact, design, or decision against the axioms canon. Loads AXIOMS.md and holds the target against each axiom — surfaces grounded concerns, possible antipatterns, insights, and optional proposals. Never issues verdicts; the human judges. Use when the user asks to audit, sanity-check, or reflect on something against the axioms.
---

# Axiom Lens

Hold a target against the axioms canon. Surface concerns and insights; route judgment to the human.

## Load the canon

1. Read `AXIOMS.md` two directory levels above this skill's base directory (the plugin root).
2. If unreadable, stop and surface the failure to the user. The loaded text is the only legal source — an audit from a remembered or paraphrased canon is invalid; do not produce one.

## Input contract

- **Target** — the argument names the topic, artifact, file, or decision to audit. No argument → take the subject currently under discussion in the session. Neither identifiable → return a question naming what is missing; do not guess a target.
- **Exclude advocacy** — audit the target itself (its text, structure, observed behavior), not the author's defense of it. Where the session carries justification narrative, set it aside and re-derive from the target.

## Procedure

1. **Scope gate.** Confirm the target passes the canon's two gates — a finite actor pursuing a stated outcome (AXIOMS.md § Scope). Fail either gate → name which, drop the canon framing, and route to ordinary review; the axioms do not apply and the lens does not run.
2. **Pin the anchor — never silently.** Restate the target's stated outcome in one line, at its own grain (its own outcome plus one nesting up — does it serve its parent's? — never a distant ancestor). State it as the anchor the audit measures against, so a wrong reading is visible and correctable.
   - **Ambiguous** between plausible readings → surface the options and confirm before auditing; a silently-assumed anchor makes every finding measure the wrong target (Axiom II).
   - **Absent** → that is itself the first concern (Axiom I): surface it, route to `axiom-discuss` to form one, and continue against the axioms that do not depend on the anchor.
3. Hold the target against the apex, the fuel properties, and each of the seven axioms, in order, at that grain.
4. Report only grounded findings. Each finding cites the axiom, the observed evidence in the target, and why that evidence strains the axiom. An axiom with no finding gets silence — a forced finding is assumption passed off as fact (Axiom II).
5. Insights are findings too: places where the target aligns with an axiom in a non-obvious, load-bearing way.
6. Antipatterns are named as *possible*, paired with the observation that suggests them — the observation is the claim, the pattern is the hypothesis.

## Output shape

- **Concerns** — axiom · evidence · strain.
- **Insights** — axiom · evidence · what it enables.
- **Proposals** (optional) — options with trade-offs, plural where the canon allows more than one resolution.
- Close by routing judgment to the human. The lens does not score, rank, pass, or fail the target.

## Edges

- Requests to amend the canon route to the canon repo's governance.
- Out-of-scope targets and review needs outside the axioms route to ordinary code or document review (scope gate, step 1).
