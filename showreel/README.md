# Showreel

Motion pieces that explain the Axioms canon. Each piece is a canvas animation whose every frame is a pure function of time, so a render is exactly reproducible.

| Piece | Page / script | Length | Status |
|---|---|---|---|
| **FOCUS**: the autofocus bracket is your attention | `focus.html` / `focus.js` | 45.9s | current |
| Concept explainer (white paper, blue attention) | `concept.html` / `concept.js` | 64s | earlier direction, kept |
| 15s reel (amber) | `index.html` / `main.js` | 15s | marketing cut, kept |

`CONCEPT.md` is the chapter/caption sheet for the concept explainer. `CUES.md` and `cues.json` are the music cue sheet for the 15s reel, and `temp_track.py` synthesizes that reel's scratch track.

## Preview

Serve this folder over HTTP (fonts load from `node_modules`) and open a page. Space pauses; ← / → scrub.

```sh
npm install
npx http-server .   # then open /focus.html
```

## Render

Needs Node, Playwright with a Chromium, and ffmpeg.

```sh
npm install
PAGE=focus.html node render.mjs video axioms-focus_master.mp4      # 60fps master
PAGE=focus.html node render.mjs stills 5,12.3,20                  # PNG stills into ./stills
python3 sheet.py 0 30 s1.png                                      # contact sheet from ./stills (needs Pillow)
```

Override tool locations with `PLAYWRIGHT`, `CHROME` and `FFMPEG` when they are not on the default paths. For a lighter social file: `ffmpeg -i axioms-focus_master.mp4 -c:v libx264 -crf 20 -preset slow -pix_fmt yuv420p -movflags +faststart axioms-focus_social.mp4`.
