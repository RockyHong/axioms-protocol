# Phase 3 — The Set  (IN PROGRESS)

Finalize which slots are axioms vs corollaries; run consistency / independence / frame-translation. Built on `02-structure.md`. No final wording (Phase 5).

Pending tasks: Finitude-split · admit/reject Grounding · admit/reject Externalize · independence sweep per cluster · dedup pass.

---

## Finding 1 — Divide cluster: Boundary / SoC / Atomic are three distinct things

The three only look like one act (drawing a line). They answer different questions:

| Axiom | Role | Question | Bound |
|---|---|---|---|
| **Boundary** | partition *primitive* | Is there an edge? (scope + ownership + route) | — |
| **SoC** | criterion: edge placement | *Where* to cut → along concern seams, no bleed | qualitative |
| **Atomic** | criterion: unit grain | *How big* → one **whole** goal per unit | upper + lower |

**Boundary is the primitive, not an Axiom-0.** It underlies SoC, Atomic, *and* SSOT's "clear pillars" (Preserve). Most-used axiom in the set — but it only supplies the edge; each other axiom adds its own criterion and is not *derived* from Boundary. Heavily-used ≠ justificatory-root (necessity ≠ justification, per `01-spine.md` §3).

**Independence — both pass (removal leaves a real gap):**
- SoC without Atomic → concerns separated, but ten same-concern goals bundled in one container. SoC ✓ / Atomic ✗. Gap → Atomic independent.
- Atomic without SoC → one goal per container, but that goal tangles two unseparated concerns. Atomic ✓ / SoC ✗. Gap → SoC independent.

**Granularity is bounded by the apex.** Divide until a further cut costs more attention (coordination / reassembly) than it saves (focus). Three axioms triangulate the optimal grain:
- **SoC** — cut along concerns
- **Atomic** — one whole goal per cut
- **Economy** — stop when the cut costs more than it saves

Failure modes are split cleanly: **under-split** (bundle) caught by SoC + Atomic-upper; **over-split** (fragment one trajectory → coordination bleed) caught by Atomic-lower + Economy. "Too granular" is therefore a real failure, but policed by Atomic + Economy — *not* by SoC.

**Open dedup question (defer):** could SoC + Atomic collapse into one "Partition" axiom (two dimensions: seam + grain)? Lean **no** — the independence gaps above are demonstrable, and the failure modes differ. Revisit in the dedup pass.

---

## Finding 2 — Grounding ADMITTED (Aim) ✅

New axiom, name **Grounding**. Aim cluster. *Claims trace to reality; reason from first-principles; factual, not assumed.* Absorbs seed's "First Principle" + "factual-driven."

- **Independent** — vs Outcome-Driven (can aim fiercely at a goal built on false premises → uncaught without Grounding); vs SSOT (a single canonical source can be confidently *wrong*); vs Leverage (Grounding is the check — a routed-to authority/title isn't automatically fact). All leave gaps.
- **Frame-translates** — measure-don't-guess / empiricism-over-authority / decide-on-facts / read-the-actual-code. ≥3 ✓
- **Consistent** — supports Outcome (aim true), guards Leverage (verify the borrowed). ✓
- **Aim pair:** Outcome-Driven = aim at *something*; Grounding = aim at *the real thing*. Together = "aim true."

---

## Finding 3 — Externalize: NOT an axiom → Economy corollary + a resource-property ✅

Failed the **residual-force test** — decomposes with no leftover:
- *force* = Economy (don't waste attention; loss across a reset = waste)
- *truth-home* = SSOT
- *the line* (volatile vs durable) = Boundary, drawn per frame

So the **rule** ("if it's not recorded it doesn't exist" + cold-start) = **corollary of Economy**, load-bearing in the agentic projection where context is most volatile.

But the challenge surfaced a genuine **second resource-property** (premise tier, beside Finitude): attention's working store is **volatile** — cleared on context reset; persistence needs a durable store. Orthogonal to finitude (quantity ≠ persistence; small-but-persistent vs large-but-volatile both possible). Recorded in `01-spine.md` §2. Not a rule, not a node — a fact completing the apex description. The externalize corollary is what *follows* from it via Economy.

- **"internal/external" was a mis-frame** — the axis is **volatile/durable**, which cuts *through* human + AI + docs alike: an unwritten thought and a context-window are both volatile; a committed doc is durable regardless of author. The line is set per frame by Boundary, not by the canon.
- **Cold-start** = the *test* of the corollary; **Doc-sync** = SSOT's over-time arm. Neither is its own node.
- **KEEP axis slims** to **SSOT** (+ doc-sync arm) + the Economy persistence-corollary — matches the original "SSOT = work-state" instinct.

**Sharpened admission rule (governs all remaining findings):** an axiom must contribute a *residual force* not covered by the union of the others. No residue → corollary or property, not axiom.

---

## Finding 4 — Finitude dissolved ✅

The old "Finitude" axiom splits across two levels and disappears as a node:
- inward (bounded quantity) → **Finite** resource-property (premise, §2)
- volatility → **Volatile** resource-property (premise, §2)
- outward (reach past limit) → **Leverage** axiom (Extend)

No "Finitude" axiom remains — it was the awkward two-faces-in-one-node from the start.

---

## Finding 5 — Boundary: ownership + routing stay one axiom ✅

Paired, not split. An edge that *blocks* (ownership) and *redirects* (routing) is one concept; routing is half the axiom, not a separate node. At canon altitude it holds the three routing seed-elements (positive≥negative, escalate, route-to-capability) without over-density. Split only if a *projection* finds it too dense to carry.

---

## Finding 6 — Economy dissolves: iteration → apex dynamic · Footprint axiom · Grounding = engine ✅

"Entropy/Economy" was blurring three things at three different levels:

**(1) The iteration loop → APEX DYNAMIC (spine §2), not a node.** "Fail-fast" is a *real run that hits a real wall*, not a test — it's the core of iteration, and **the engine IS iteration**: decision → action → result → learning → decision, always in motion. You can't name a sub-node for what the whole machine *is*. So "fail-fast / probe" is neither axiom nor corollary — it moved into the spine as the apex's motion-shape. **"Probe" rejected** (implies tentative test; the real thing is real action + motion). Node deleted.

**(2) Grounding = engine of progress (axiom, stays).** The *learning + recalibrate* step of the loop. Two faces: aim-true (static — claims trace to reality) + learn-true (dynamic — each sprint recalibrates from real results by first-principle, held to the anchor). Drives unknown→known convergence so iteration progresses instead of wandering.

**(3) Footprint = cost axiom (was "Entropy"), name CONFIRMED.** Residual not in Grounding: *your iterative path leaves a footprint — own it, contain blast radius, clean what shouldn't persist.* A→B is unknown→known; the rest is path, not a straight line — the footprint is the trace that real motion leaves. Survives as an axiom.

**Apex reframe (spine §2):** attention = **fuel** (burned for motion) · outcome = **anchor** (without it, motion = drift = the lore's NEVER DRIFT) · dynamic = the iteration loop. Leverage survives the metaphor as mechanical advantage (further per unit fuel).

**Parsimony:** still zero new axioms — this *deletes* the fail-fast/probe candidate (it's the apex dynamic), renames Entropy → Footprint, and clarifies Grounding's dual role. The "Economy/Conserve" cross-cut box collapses entirely: "don't waste" = apex restated; the one residual = Footprint. *(Superseded by Finding 8 — Footprint also dissolves.)*

---

## Finding 7 — Decoupling: NOT an axiom → emergent fruit of SoC + SSOT + Boundary ✅

Decomposes with no residue:
- "no shared mutable state" = **SSOT** (two writers on one state = parallel truth)
- "contract-only access, no reaching into internals" = **Boundary** (cross via the declared edge/route) + **SoC** (concerns stay apart)

**Coupling is a *symptom*** that SoC / SSOT / Boundary was violated — not a force needing its own axiom. The iteration loop self-heals it: the run hits the coupling wall → Grounding diagnoses the layer → Boundary routes to the owner → fixed atomically → cycle.

**Exception check:** only nuance is *declared* vs *undeclared* dependency. Declared (ordering/format in the contract) = fine, Boundary working. Undeclared = the symptom, and that's a Boundary "declare your edge" violation. Reduces to existing axioms. No genuine exception. Conscious, audited drop of an original-canon axiom (not silent drift).

---

## Finding 8 — Footprint: NOT an axiom → property of the burn + distributed handling ✅

"Footprint simply is outcome" — the *realized* outcome (achieved A→B + side-effects), vs Outcome-Driven's *intended* front. Same arrow, two ends; SSOT is its recorded back.

- The *fact* — **action is irreversible; every burn leaves a trace** — becomes a **property of the burn** (spine §2), parallel to Finite/Volatile being properties of the fuel.
- The *handling* distributes with no residue: record (+/− trace) → **SSOT** routed by **SoC**; contain blast radius → **Boundary**; fix a bad trace → the iteration loop.

No residual force → not an axiom. Supersedes Finding 6's "Footprint axiom."

---

## SET CLOSED — 7 axioms

| Group | Axioms |
|---|---|
| **Aim** | Outcome-Driven (anchor) · Grounding (engine: aim-true + learn-true) |
| **Divide** | SoC · Atomic · Boundary (ownership + routing) |
| **Extend** | Leverage |
| **Keep** | SSOT — truth-store where footprints land (doc-sync = its arm, cold-start = its test) |

**Apex:** Attention = fuel · Outcome = anchor · burn = iteration loop. Properties: Finite, Volatile (fuel); Irreversible (burn). Mottos: attention-is-all-you-need / leverage-everything.

**Dissolved, with reason:** Finitude (→ properties + Leverage) · Decoupling (→ SoC+SSOT+Boundary) · Entropy/Footprint (→ irreversibility property + distributed) · Fail-fast/Probe (→ apex dynamic) · Externalize (→ Volatile property + footprint→SSOT). **Net: zero added, five dissolved — the residual-force test did its job.**

---

## Verification sweep — PASS

**Independence (at-risk neighbor pairs; distant pairs trivially independent):**

| Pair | Stays independent because |
|---|---|
| Outcome ↔ Grounding | aim at *something* vs aim at the *real* |
| SoC ↔ Atomic | *where* (concern seam) vs *grain* (one whole goal) |
| SoC ↔ Boundary | concern-criterion vs edge-primitive |
| Atomic ↔ Boundary | grain-criterion vs edge-primitive |
| Boundary ↔ SSOT | edge+owner+route vs *exactly-one*-truth (uniqueness) |
| Leverage ↔ Boundary | "reach past limit" (motive) vs "redirect to owner" (mechanic) |
| Grounding ↔ Leverage | verify-real vs reach-for-it |

All 7 leave a gap on removal → all residual.

**Consistency:** no pair contradicts; they cooperate around the loop (Aim → Divide → Extend → Keep). ✓

**Frame-translation (≥3 of scope's instances — personal / career / AI / team):** Outcome, Grounding, SoC, Atomic, Boundary, Leverage, SSOT each survive ≥3. ✓

**Phase 3 closed: consistent · independent · frame-translates.** → Phase 4 (downstream gate).
