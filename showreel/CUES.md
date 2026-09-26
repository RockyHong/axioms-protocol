# AXIOMS showreel: music cue sheet

**128 BPM · 4/4 · 8 bars · exactly 15.000s · 1 beat = 0.46875s**
The machine-readable version is `cues.json`. The picture is locked to this grid, so the music has to be built on it too.

| Bar.Beat | Time (s) | Section | What the picture does | What the music must do |
|---|---|---|---|---|
| 1.1 | 0.000 | HOOK | Core ignites | Sub hit and shimmer, no intro |
| 1.1→2.1 | 0–1.875 | HOOK | 22 distractions hit the core, tab counter races 3→47, glitch | Build fast: pings, 16th hats getting denser, a riser, a stutter in the last half beat |
| **2.1** | **1.875** | FREEZE | Everything freezes and goes grey | **Hard stop to true silence** (a tape stop is fine). This is the most important cue |
| 2.2 / 2.4 / 3.2 / 3.3 / 3.4 | 2.11 / 2.58 / 3.05 / 3.40 / 3.63 | FREEZE | Fuel bar drains in steps | Clock ticks only, over a low drone |
| 2.4 | 2.578 | FREEZE | "runs out." lands | One soft low thump |
| 3.1→3.2 | 3.75–4.22 | REFRAME | Everything implodes into "YOU" | Reverse swell |
| **3.2** | **4.219** | REFRAME | Beam fires toward "THE GOAL" | **DROP**: sub boom and kick |
| 3.3 | 4.688 | REFRAME | "all you need." | Warm pad and half-time pulse |
| 4.2.5 + every 1.5 beats | 6.33, 7.03, 7.73, 8.44, 9.14, 9.84, 10.55 | AXIOMS | Seven cuts, one per axiom | Seven accents on a dotted-quarter pattern (3+3+3+3+3+3+3 eighths) |
| 7.1→8.1 | 11.25–13.125 | LOOP | Orbit accelerates, spirals into the goal | Accelerating riser. Ticks follow `loop_node_hits` |
| **8.1** | **13.125** | IMPACT | White flash and shockwave | **Biggest hit of the piece** |
| 8.1→end | 13.1–15.0 | END | "Burn it well." and the AXIOMS wordmark | Warm resolve (Am9 → C feel), soft pulses at 8.3 and 8.4, clean tail by 15.0 |

## Prompt for a music generator
> 15-second cinematic electronic motion-graphics sting, 128 BPM, 4/4, A minor. Starts instantly with a glittery impact and a frantic build: notification pings, tightening hi-hats, a riser. At 1.875s it cuts to dead silence, leaving only a clock tick and a low drone. At 4.22s a huge sub drop, then a warm, driving half-time groove with dotted-quarter accent hits. It accelerates into a riser and lands a massive impact at 13.125s, resolving on a warm hopeful pad. No vocals. Modern, premium, Apple-keynote meets Stranger-Things synth warmth.

If the generator can't hit exact timestamps, generate 128 BPM and slide the track so that its drop lands at **4.219s**. The hook stop (1.875s) and the impact (13.125s) will then line up too.
