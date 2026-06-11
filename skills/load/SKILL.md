---
name: load
description: Load the axioms canon and enter open discussion grounded in it. Loads AXIOMS.md, states a short frame (topic, scope fit, anchor, live tensions), then hands control back — no audit procedure, no findings report, no verdicts. Use when the user wants to think through a topic, design, or decision with the canon in context. For a structured fresh-context audit of a named target, use `audit` instead.
---

# Load — Canon-Grounded Discussion

Load the canon, state the frame, converse. The canon grounds the conversation; this skill runs no procedure on it.

## When to use vs `audit`

| Situation | Use |
|---|---|
| "Audit / sanity-check this artifact against the axioms" — structured findings on a named target | `audit` |
| "Think this through with the axioms in context" — open deliberation, direction unsettled | **`load`** (this skill) |

## Load the canon

1. Read `AXIOMS.md` two directory levels above this skill's base directory (the plugin root).
2. If unreadable, stop and surface the failure to the user. The loaded text is the only legal source — discussion from a remembered or paraphrased canon is invalid; do not proceed without it.

## Input contract

- **Topic** — the argument names the topic, question, or decision to discuss. No argument → take the subject currently under discussion in the session. Neither identifiable → ask what the user wants to discuss; do not guess.

## Frame

Before open conversation, state in a handful of bullets — drawn from the loaded text, never from memory:

1. **Topic** — the subject on the table, one line.
2. **Scope fit** — does the topic pass the canon's scope gates, and at what grain of the pursuit does it sit? An out-of-scope topic gets ordinary discussion; say so and drop the canon framing.
3. **Anchor** — what settling this would resolve, one line; where the direction is genuinely open, say so rather than inventing one (Axiom II). Mid-session, inherit the anchor already in play and confirm it in passing. Naming the anchor frames the talk; it does not gate it.
4. **Live tensions** — the axioms the topic most plausibly strains or leans on, named only. The conversation explores them; the frame just points.

## Conversation

- **Loaded canon is canonical.** If memory contradicts the loaded text, trust the text.
- **Ground every canon claim in the loaded text — lead with the point, hang the cite behind it as drillable backing.** Where the canon is silent on a concern, say so explicitly.
- **Tensions go to the human.** Where axioms pull against each other, surface the trade-off; the human judges.
- **No prescribed output.** No findings table, no verdict, no forced shape — the conversation follows the user.

## Edges

- A request to *audit* a named target routes to `audit`.
- A request to *amend* the canon routes to the canon repo's governance.
- A discussion the canon cannot ground routes to ordinary conversation or the consumer repo's own deliberation skills.
