# KEYNOTE: ledger (review & tweak)

The working ledger for `keynote.html` / `keynote.js` (+ `keynote_audio.py`). Read this first in a review/tweak session; update it when the cut changes. The rest of the showreel is described in `README.md`.

## Where it stands

- **What it is:** the full concept video. 16:9, 1920×1080, 60fps, **75s**. A keynote-style showcase: dynamic, hard camera moves, lime stingers.
- **Narrative:** problem first (owner's call). "You have a goal" → a wall of a hundred things → one of you → the seven rules clear the wall, rule by rule, while the attention pieces fly home → loop → recursion → apex.
- **Status:** first cut rendered and sent. **Nothing in it has been approved by the owner yet**: the beats, the captions and the plain-word rule lines are all open to review.
- **How it has been checked:** only through stills and a handful of frames pulled from the final MP4; nobody has watched the motion or heard the audio yet. The score is a procedural scratch track.
- **Communication:** English captions. Talk with the owner in **Traditional Chinese (繁體中文)**.

## The piece family (don't duplicate lines across them)

| Piece | Format | Role |
|---|---|---|
| HOOK `hook.js` | 9:16, 12.5s | intrigue only: one goal, a hundred things, only one of you → points to FOCUS |
| FOCUS `focus.js` | 9:16, ~46s | the story (distraction, hand-off, loop) |
| **KEYNOTE `keynote.js`** | **16:9, 75s** | **the full version: problem → seven rules → loop → recursion → apex** |
| CONCEPT `concept2.js` | 9:16, 88s | first cut of the rules-as-a-list idea. Rejected: not problem-first, too slow. Kept for reference |

## Timeline (current cut)

All times are in seconds, on a 120 BPM grid (BEAT = 0.5). The constants live in `T` (keynote.js:84) and `RULES` (keynote.js:90); every rule starts at `R0 + i·RD` = 19.25 + i·4.5.

| t | Beat | Caption (exact) | Picture |
|---|---|---|---|
| 0–2.5 | goal | You have a goal. | bracket slams onto the goal (camera z 1.7), ON GOAL 100% |
| 2.5–5.5 | hundred | And a hundred / things to do. | goal cracks, 114 cards burst into a wall, camera pulls back to z 0.52 |
| 5.5–8.25 | one | But there's only / one of you. | 12 pieces fly out one per 16th and stick to cards; 100 → 0%, red ring |
| 8.25–10 | finite | Attention is finite. | push in on the empty goal (z 1.35) |
| 10–12.25 | forgets | And your head / forgets. | thought chips float off the goal and blur |
| 12.25–16.5 | turn | You can't know / everything. → But you can leverage / everything. | lime flood from the goal |
| 16.5–19.25 | intro | Seven rules / to get it back. | 01–07 tiles pop in a row, world dimmed |
| 19.25 | 01 AIM | Drop what doesn't / serve the goal. | 30 PING cards swiped off in a cascade; 3 pieces home |
| 23.75 | 02 CHECK | Check what's real / before you build on it. | lime beam sweeps the wall and the camera rides it; GUESS cards crack and fall (fake) or turn into tasks (real) |
| 28.25 | 03 SEPARATE | One job per place. / No mixing. | tasks fly into 4 clusters: DESIGN / MONEY / PEOPLE / BUILD; REMEMBER cards line up on top |
| 32.75 | 04 WHOLE | One task, / one whole goal. | camera dives on DESIGN, 16 cards fold into one unit ("ONE TASK / ONE GOAL", ring fills); pulls out to 4 units |
| 37.25 | 05 EDGES | Know what's yours. / Route the rest. | BUILD unit joins the goal; the YOURS boundary draws itself; the other units get dashed routes out to a "?" ("IF NOT ME, THEN WHO?") |
| 41.75 | 06 LEVERAGE | Borrow when it costs less / than building it yourself. | BUILD vs BORROW cost bars per unit; 3 are handed to AI AGENT / SOMEONE WHO KNOWS (whose own brackets lock on); BUILD stays, since building it is cheaper |
| 46.25 | 07 WRITE IT DOWN | Write it down. / Once. In one place. | REMEMBER cards fly into the NOTES card, which types "Write it down." |
| 50.75 | locked | Now all of you / is on the goal. | camera onto the goal, FOCUS LOCKED, 100% |
| 53.75 | loop | Try. See what's real. / Adjust. → Every loop, / a little closer. | bracket spirals in: DECIDE / ACT / RESULT / LEARN ×2 |
| 59.25 | hit | none | goal fills lime, shockwave |
| 59.5 | recursion | Hand it off — / it's a goal of its own. → Same rules. / Every size. | infinite zoom through nested goal+bracket: YOU → SOMEONE YOU HANDED IT TO → THEIR AI AGENT |
| 65.5 | apex | Attention is / all you need. | lime flood |
| 68.5–75 | end | AXIOMS · Seven rules for spending attention well. · repo link | bracket locks onto the name; the seven rules list in on the right |

## Knobs: where to tweak what

| Want to change | Where |
|---|---|
| beat timings | `T` keynote.js:84. **Also** update `capOn` (keynote.js:591), the list of caption windows that drives the caption scrim; it must match the `cap(...)` calls right below it |
| rule length | `T.RD` (4.5). Stinger = first 0.75s of each rule; action/caption start at `r.act = t0 + 0.75` |
| rule captions / names / end-card rows | `RULES` keynote.js:90 (`lines`, `name`, `row`) |
| other captions | the `cap(...)` calls in `renderFrame` (keynote.js:~593–605); motto/apex floods and end card further down |
| card texts on the wall | `POOL` keynote.js:105 (kinds: noise, fake, real, mem, and one list per category) |
| wall size / density | `COLS, ROWS, PX, PY, CW, CH` keynote.js:104; kind counts in the `kinds` array inside `CARDS` |
| cluster / unit / helper positions | `CLUSTER`, `UNITPOS`, `HELPER`, `YOURS`, `NOTES` keynote.js:116–122 |
| camera moves | `CAM` keynote.js:410: `[time, x, y, zoom, duration]`, eased in/out expo. The CHECK beam-follow is inside `cam()` |
| screen shake | `shake()` keynote.js:438 |
| which rule frees which piece | `FREED_BY` keynote.js:266 (currently 3/2/1/1/1/2/2 pieces per rule) |
| stinger look | `drawStinger()` keynote.js:506 |
| recursion labels / depth | `REC_R`, `REC_LAB` keynote.js:486 |
| music | `keynote_audio.py` (idea: each rule adds a voice; `VOICES` = A E A C E G B). Reads `keynote_cues.json` |

## Open review points (known, not yet decided)

1. **Nothing is approved.** Walk the owner through the timeline table above and get beats and captions signed off before polishing.
2. **Wall legibility:** at zoom ~0.5 the card text is only texture. It's readable only in the burst, the CHECK beam-follow and the WHOLE dive. Decide whether more beats need a close-up.
3. **Readability vs pace:** each rule gives its caption ~3.4s (fine for ≤10 words per the 3 words/s + 0.5s rule), but the stinger + action + caption are tight. Needs a watch.
4. **AIM (01) is the weakest visual:** the swipe reads at full speed only; there's no close-up and no "serves the goal" tether shown. Consider a camera move onto a swiped cluster, or tethers from the tasks to the goal.
5. **Caption placement:** one fixed band at the bottom centre (baseline `CAPY` = 862, with a scrim). The owner's rule is "text where the eye already is". The subject is mostly the goal at screen centre, but check the rules where the action is off to the sides (CHECK, LEVERAGE).
6. **Recursion wording:** "THEIR AI AGENT" names an instance (fine for a projection; the canon itself stays neutral). Confirm with the owner.
7. **Length** is 75s; the tightest candidates to trim are the problem act (12s) and the intro (2.75s).
8. **Audio:** unheard. The owner judged earlier procedural scores "not OK yet". Offer a real track cut to `keynote_cues.json` if the synth doesn't land.

## Owner's rules (non-negotiable; apply to every tweak)

1. **Attention flow is king:** one focal point at a time, and text where the eye already is. Never text-top / action-bottom. Sequence, don't juxtapose.
2. **No idle gaps,** yet every caption readable (~3 words/s + 0.5s).
3. **Motion ≠ distraction:** hyper, dynamic, crafted ("go all out", keynote showcase). Minimal/dry was rejected; so were amber/"spiritual".
4. **Dogfood the thesis;** metaphors map to `AXIOMS.md` precisely. Two examples: Leverage is an *attention-cost comparison* (hence the BUILD-stays case), not "always delegate"; Boundary *routes*, it isn't a wall.
5. **Plain words, no jargon:** "Write it down", not "SSOT".
6. **Captions never jump mid-read,** and they stay clear of their subject.
7. **Sound:** music and SFX are one thing (on the grid, in key). Don't overclaim audio quality you can't hear.
8. **ICP:** people with goals, hands-on, **stretched thin** (分身乏術). Framing it as "distraction / regain focus" was rejected twice.

## Session start: commands (cloud env)

```sh
cd showreel && npm install
pip install pillow numpy scipy imageio-ffmpeg
export PLAYWRIGHT=/opt/node22/lib/node_modules/playwright/index.mjs
export CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome
export FFMPEG=$(python3 -c "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())")

PAGE=keynote.html node render.mjs stills 1.2,4.2,20.6,26,34,44.8,49.5,55,62,70   # review frames
python3 sheet.py 0 80 sheet.png                                                    # contact sheet (auto landscape)
PAGE=keynote.html node render.mjs cues keynote_cues.json                            # after any timing change
python3 keynote_audio.py keynote_cues.json keynote_audio.wav
PAGE=keynote.html node render.mjs video axioms-keynote_master.mp4                   # ~20 min: run in background
$FFMPEG -i axioms-keynote_master.mp4 -i keynote_audio.wav -map 0:v -map 1:a -c:v libx264 -crf 20 -preset slow \
  -pix_fmt yuv420p -c:a aac -b:a 256k -movflags +faststart -shortest axioms-keynote.mp4
```

Gotchas:
- Rendered MP4/WAV/cue JSON/stills are git-ignored; commit source only.
- The model can't watch motion or hear audio: review via stills plus frames pulled from the final MP4 (`ffmpeg -ss T -i file -frames:v 1`), and say so.
- Card sprites are cached per (card, colour, dashed, red). A new visual state needs a new key.
- Units, helpers and the YOURS boundary fade out at the start of WRITE IT DOWN (`R(6).t0 + 0.2`), so rule 07 plays on a clean stage.
