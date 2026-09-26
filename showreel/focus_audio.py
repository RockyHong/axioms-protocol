# Procedural score for FOCUS. Music and sound design are one instrument: every picture event is played
# by the band, quantised to the section's grid and pitched from the chord that is sounding.
# Events come from focus_cues.json, exported by focus.js from the constants that drive the picture
# (`node render.mjs cues focus_cues.json`), so sync is exact.
# usage: python3 focus_audio.py [focus_cues.json] [focus_audio.wav]
import json, sys, wave
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve

SR = 44100
cues = json.load(open(sys.argv[1] if len(sys.argv) > 1 else 'focus_cues.json'))
OUT = sys.argv[2] if len(sys.argv) > 2 else 'focus_audio.wav'
DUR = cues['dur']
N = int((DUR + 3) * SR)
rng = np.random.default_rng(7)

# ================================ primitives ================================
def tt(d): return np.arange(int(d * SR)) / SR
def env(n, a=0.002, d=0.2): t = np.arange(n) / SR; return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)
def filt(x, kind, f): return sosfilt(butter(2, f, kind, fs=SR, output='sos'), x)
def mix(*xs):
    out = np.zeros(max(len(x) for x in xs))
    for x in xs: out[:len(x)] += x
    return out
def sine(f, d, a=0.002, dec=0.2): t = tt(d); return np.sin(2 * np.pi * f * t) * env(len(t), a, dec)
def saw(f, d): t = tt(d); return 2 * ((t * f) % 1) - 1
def noise(d, lo=None, hi=None, a=0.001, dec=0.1):
    x = rng.standard_normal(int(d * SR))
    if lo: x = filt(x, 'highpass', lo)
    if hi: x = filt(x, 'lowpass', hi)
    return x * env(len(x), a, dec)
def kick(d=0.45, f0=150, f1=45):
    t = tt(d); f = f1 + (f0 - f1) * np.exp(-t * 30)
    return np.tanh(1.8 * np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.001, d / 3.5))
def boom(d=2.5, f=40): t = tt(d); return np.tanh(2 * np.sin(2 * np.pi * (f + 35 * np.exp(-t * 6)) * t) * env(len(t), 0.003, d / 3))
def swell(d, up=True, lo=500, hi=7000):      # air that rises into (or falls from) a grid point
    x = rng.standard_normal(int(d * SR)); u = np.arange(len(x)) / max(1, len(x))
    return filt(x, 'bandpass', [lo, hi]) * ((u ** 2.2) if up else (1 - u) ** 2.2)
def pad(freqs, d, a=0.5, rel=1.0, bright=1800):
    t = tt(d); s = sum(2 * ((t * f * (1 + det)) % 1) - 1 for f in freqs for det in (-0.004, 0, 0.005))
    return filt(s / (3 * len(freqs)), 'lowpass', bright) * np.minimum(1, t / a) * np.clip((d - t) / rel, 0, 1)
def pluck(f, d=0.35, bright=3200):
    x = saw(f, d) + 0.5 * saw(f * 1.005, d); return filt(x, 'lowpass', bright) * env(len(x), 0.002, d / 3.5)
def bell(f, d=0.8): return mix(sine(f, d, 0.002, d / 3), 0.35 * sine(f * 2.76, d, 0.002, d / 6), 0.2 * sine(f * 5.4, d, 0.001, d / 10))
def bass_note(f, d, drive=1.4):
    x = np.tanh(drive * (saw(f, d) + 0.6 * np.sin(2 * np.pi * f / 2 * tt(d))))
    return filt(x, 'lowpass', 520) * np.minimum(1, tt(d) / 0.01) * np.clip((d - tt(d)) / 0.05, 0, 1)
def snare(): return mix(noise(0.22, 1200, 9000, 0.001, 0.06), 0.6 * sine(190, 0.12, 0.001, 0.04))
def clap():
    out = np.zeros(int(0.25 * SR))
    for o in (0, 0.01, 0.021): i = int(o * SR); n = noise(0.25 - o, 900, 7000, 0.0005, 0.012 if o < 0.02 else 0.07); out[i:i + len(n)] += n
    return out
def hat(dec=0.03): return noise(0.08, 7000, None, 0.0005, dec)
NOTE = lambda n: 440 * 2 ** ((n - 69) / 12)

# ================================ buses ================================
BUS = {k: (np.zeros(N), np.zeros(N)) for k in ('mus', 'drm', 'fx')}
KICKS = []
def put(bus, sig, t, g=1.0, pan=0.0):
    i = int(round(t * SR))
    if i >= N or i < 0: return
    j = min(N, i + len(sig)); x = sig[: j - i] * g; L, R = BUS[bus]
    L[i:j] += x * np.sqrt(0.5 * (1 - pan)); R[i:j] += x * np.sqrt(0.5 * (1 + pan))

# ================================ harmony + grid ================================
BEAT = 0.5                                              # 120 BPM
CH = {  # upper voicing, bass root
    'Am': ([57, 60, 64, 71], 45), 'F': ([57, 60, 65, 69], 41), 'C': ([55, 60, 64, 67], 48), 'G': ([55, 59, 62, 67], 43),
    'E': ([56, 59, 64, 68], 40), 'Dm': ([57, 62, 65, 69], 38), 'Fmaj7': ([57, 60, 64, 65], 41), 'Cadd9': ([55, 60, 62, 64], 48),
}
SECTIONS = []                                           # (t0, t1, chords, chord_len)
def chord_at(t):
    for t0, t1, chords, cl in SECTIONS:
        if t0 <= t < t1: return CH[chords[int((t - t0) // cl) % len(chords)]]
    return CH['Am']
def tones(t, lo=72, hi=96):                             # chord tones sounding at t, within a register
    notes, _ = chord_at(t); pcs = {n % 12 for n in notes}
    return [n for n in range(lo, hi + 1) if n % 12 in pcs]
def snap(t, q=BEAT / 8):                                # quantise to the section's 32nd grid (≤ 31 ms)
    for t0, t1, *_ in SECTIONS:
        if t0 <= t < t1: return t0 + round((t - t0) / q) * q
    return round(t / q) * q
def lerp_(a, b, u): return a + (b - a) * min(1, max(0, u))

def section(t0, t1, chords, bars_per_chord=0.5, pad_g=0.0, pad_bright=1600, arp=None, arp_g=0.0, arp_oct=1,
            bass=None, bass_g=0.0, drums=None, drum_g=1.0, ramp=(1, 1)):
    """chords cycle every `bars_per_chord` bars (1 bar = 4 beats). arp: step in beats. bass: 'pulse' | 'long'.
    drums: 'four' | 'half' | 'light' | 'build'. ramp: gain at the start / end of the section."""
    cl = bars_per_chord * 4 * BEAT
    if chords: SECTIONS.append((t0, t1, chords, cl))
    k, t = 0, t0
    while chords and t < t1 - 1e-3:
        d = min(cl, t1 - t); notes, root = CH[chords[k % len(chords)]]
        g = lerp_(ramp[0], ramp[1], (t - t0) / max(1e-3, t1 - t0))
        if pad_g: put('mus', pad([NOTE(n) for n in notes], d + 0.25, a=min(0.4, d / 3), rel=0.3, bright=pad_bright), t, pad_g * g)
        if arp:
            seq = notes + [n + 12 for n in notes[:2]]; st = arp * BEAT
            for j, tb in enumerate(np.arange(t, t + d - 1e-3, st)):
                n = seq[j % len(seq)] + 12 * (arp_oct - 1)
                put('mus', pluck(NOTE(n), 0.3), tb, arp_g * g, pan=0.35 * np.sin(j * 1.3))
                put('mus', pluck(NOTE(n), 0.3), tb + 3 * st / 2, arp_g * g * 0.28, pan=-0.5)     # dotted echo
        if bass == 'pulse':
            for tb in np.arange(t, t + d - 1e-3, BEAT / 2): put('mus', bass_note(NOTE(root - 12), BEAT / 2 * 0.9), tb, bass_g * g)
        elif bass == 'long':
            put('mus', bass_note(NOTE(root - 12), d * 0.98, 1.1), t, bass_g * g)
        t += cl; k += 1
    if drums:
        nb = int(round((t1 - t0) / BEAT))
        for b in range(nb):
            tb = t0 + b * BEAT; g = lerp_(ramp[0], ramp[1], b / max(1, nb)) * drum_g
            if drums == 'four':
                put('drm', kick(0.4, 140, 45), tb, 0.9 * g); KICKS.append(tb)
                if b % 2 == 1: put('drm', clap(), tb, 0.45 * g)
                put('drm', hat(0.025), tb + BEAT / 2, 0.25 * g); put('drm', hat(0.015), tb + BEAT / 4, 0.1 * g); put('drm', hat(0.015), tb + 3 * BEAT / 4, 0.1 * g)
            elif drums == 'half':
                if b % 4 == 0: put('drm', kick(0.5, 120, 40), tb, 0.85 * g); KICKS.append(tb)
                if b % 4 == 2: put('drm', snare(), tb, 0.4 * g)
                put('drm', hat(0.02), tb, 0.12 * g); put('drm', hat(0.02), tb + BEAT / 2, 0.08 * g)
            elif drums == 'light':
                if b % 2 == 0: put('drm', kick(0.35, 120, 50), tb, 0.6 * g); KICKS.append(tb)
                put('drm', hat(0.02), tb + BEAT / 2, 0.16 * g)
                if b % 4 == 3: put('drm', clap(), tb, 0.25 * g)
        if drums == 'build':
            steps = int((t1 - t0) / (BEAT / 4))
            for j in range(steps):
                u = j / max(1, steps); put('drm', snare(), t0 + j * BEAT / 4, (0.08 + 0.35 * u ** 2) * drum_g)
                if j % 4 == 0: put('drm', kick(0.3, 130, 50), t0 + j * BEAT / 4, 0.6 * drum_g); KICKS.append(t0 + j * BEAT / 4)

# ================================ the arrangement (downbeats pinned to picture cues) ================================
A_ = cues['arrive'][0]; HOME = cues['huntSpan'][1]; SW = cues['swipe'][0]; F0, F1 = cues['flood1']
LK = cues['lock']; HT = cues['hit']; OL = cues['outroLock']; END = cues['dur']; BUILD = 4 * BEAT
section(0.0, A_, ['Am', 'F'], bars_per_chord=1, pad_g=0.16, pad_bright=1300, arp=0.5, arp_g=0.08, arp_oct=2, bass='long', bass_g=0.14, ramp=(0.7, 1))
section(cues['bracketIn'], A_, [], drums='light', drum_g=0.7, ramp=(0.6, 1))
section(A_, HOME, ['Am', 'F', 'E'], bars_per_chord=0.5, pad_g=0.10, pad_bright=1400, arp=0.25, arp_g=0.06, arp_oct=2, bass='pulse', bass_g=0.16, drums='four', drum_g=0.8, ramp=(0.7, 1.1))
section(HOME, SW, ['Am', 'F', 'Dm', 'E'], bars_per_chord=1, pad_g=0.11, pad_bright=700, arp=1.0, arp_g=0.045, bass='long', bass_g=0.2, drums='half', drum_g=0.7)
section(SW, F0, ['F', 'G'], bars_per_chord=0.25, pad_g=0.1, pad_bright=1800, bass='pulse', bass_g=0.14, drums='build', drum_g=0.9)
section(F0, F1, ['C', 'G', 'Am', 'F'], bars_per_chord=0.5, pad_g=0.13, pad_bright=3200, arp=0.25, arp_g=0.07, arp_oct=2, bass='pulse', bass_g=0.18, drums='four', drum_g=1.0)
section(F1, LK, ['F', 'C', 'G', 'Am'], bars_per_chord=0.75, pad_g=0.09, pad_bright=2000, arp=0.5, arp_g=0.05, arp_oct=2, bass='long', bass_g=0.15, drums='light', drum_g=0.9, ramp=(0.8, 1.1))
section(LK, HT - BUILD, ['Am', 'F', 'C', 'G'], bars_per_chord=1, pad_g=0.11, pad_bright=2400, arp=0.25, arp_g=0.06, arp_oct=2, bass='pulse', bass_g=0.17, drums='four', drum_g=1.0, ramp=(0.85, 1.15))
section(HT - BUILD, HT, ['F', 'G'], bars_per_chord=0.5, pad_g=0.12, pad_bright=3500, arp=0.125, arp_g=0.05, arp_oct=2, bass='pulse', bass_g=0.17, drums='build', drum_g=1.0)
section(HT, OL, ['Cadd9', 'F', 'G', 'C'], bars_per_chord=0.65, pad_g=0.14, pad_bright=3500, arp=0.25, arp_g=0.06, arp_oct=2, bass='long', bass_g=0.18, drums='four', drum_g=0.75, ramp=(1.0, 0.8))
section(OL, END, ['Fmaj7', 'Cadd9'], bars_per_chord=1, pad_g=0.12, pad_bright=2200, arp=0.5, arp_g=0.05, arp_oct=2, bass='long', bass_g=0.12, ramp=(1, 0.3))

# ================================ picture events, played by the band ================================
def stab(t, g=0.3, d=1.2, oct=0):                      # the sounding chord as a bright hit
    notes, _ = chord_at(t + 0.01)
    put('fx', mix(*[bell(NOTE(n + 12 + 12 * oct), d) for n in notes]), t, g / len(notes) * 2)
def blip(t, n, g=0.2, d=0.3, pan=0.0, kind='pluck'):
    put('fx', (pluck(NOTE(n), d, 5000) if kind == 'pluck' else bell(NOTE(n), d)), t, g, pan)
def pick(ns, i): return ns[max(0, min(len(ns) - 1, i))]

# open: the goal rings the tonic; the bracket snaps on with two high chord tones
g0 = snap(cues['goal']); stab(g0, 0.28, 2.0); put('fx', boom(1.2, 55), g0, 0.25)
b0 = snap(cues['bracketIn']); tn = tones(b0, 81, 93); blip(b0, tn[-1], 0.22, kind='bell'); blip(b0 + BEAT / 4, tn[-2], 0.18, kind='bell')
for c in cues['captions']: put('fx', swell(0.25), snap(c) - 0.25, 0.05)

# notifications: each one is the next note of a rising chord arpeggio
for i, t in enumerate(cues['arrive']):
    ts = snap(t + 0.15); tn = tones(ts, 76, 100)
    blip(ts, pick(tn, i + 2), 0.26, 0.5, pan=(-1) ** i * 0.5, kind='bell'); put('fx', kick(0.2, 110, 60), ts, 0.35)
# hunting: the arp breaks into 32nd-note chord tones darting around the register
for t in cues['hunt']:
    ts = snap(t); tn = tones(ts, 84, 103)
    for k in range(3): blip(ts + k * BEAT / 8, tn[rng.integers(0, len(tn))], 0.12, 0.12, pan=rng.random() * 1.6 - 0.8)
hs = snap(cues['huntSpan'][1]); stab(hs, 0.25, 0.8, oct=-1); put('fx', kick(0.5), hs, 0.5)

# pieces yanked: a descending run down the chord, one note per piece
for i, t in enumerate(cues['yank']):
    ts = snap(t); tn = tones(ts, 60, 88); blip(ts, pick(tn, len(tn) - 1 - i), 0.24, 0.35, pan=(-1) ** i * 0.4)
# noise swiped away: air landing on the grid; the pieces come back up the chord
for i, t in enumerate(cues['swipe']): put('fx', swell(0.3, False, 800, 8000), snap(t), 0.18, pan=0.7 if i % 2 else -0.7)
for i, t in enumerate(cues['ret']):
    ts = snap(t); tn = tones(ts, 67, 100); blip(ts, pick(tn, i + 1), 0.24, 0.4, pan=0.3 * np.sin(i), kind='bell')

# the motto flood: the whole band hits; the "everything" wall is a shimmer of chord tones
f0 = snap(F0); put('fx', swell(0.5, True, 400, 9000), f0 - 0.5, 0.35); put('fx', boom(2.5, 38), f0, 0.45); stab(f0, 0.35, 2.5)
for t in cues['statement']: stab(snap(t), 0.2, 1.2)
w = snap(cues['wall']); tn = tones(w, 84, 103)
for k in range(24): blip(w + k * BEAT / 8, tn[rng.integers(0, len(tn))], 0.07, 0.15, pan=rng.random() * 2 - 1, kind='bell')
put('fx', swell(0.4, False), snap(F1), 0.2)

# your head forgets: thoughts ring and fall out of the chord; the line drops into the card on the beat
for i, t in enumerate(cues['lost']):
    ts = snap(t); tn = tones(ts, 72, 91)
    for k in range(3): blip(ts + k * BEAT / 4, pick(tn, len(tn) - 1 - k - i), 0.12 * (1 - k * 0.3), 0.4, kind='bell')
ff = snap(cues['forgetsFall'][0]); tn = tones(ff, 60, 84)
for k in range(4): blip(ff + k * BEAT / 4, pick(tn, len(tn) - 1 - 2 * k), 0.12, 0.25)
cs = snap(cues['cardSlam']); put('fx', kick(0.3, 90, 50), cs, 0.45); put('fx', snare(), cs, 0.2)
ty0, ty1 = cues['typing']
for k, tb in enumerate(np.arange(snap(ty0), ty1 + 0.01, BEAT / 4)):               # typing = a 16th-note figure
    put('fx', hat(0.012), tb, 0.3, pan=0.2); blip(tb, tones(tb, 84, 96)[k % 3], 0.05, 0.08)
for t in cues['caught']: blip(snap(t), tones(t, 76, 88)[-1], 0.16, kind='bell')
put('fx', kick(0.25, 120, 60), snap(cues['absorbed']), 0.3)

# hand it off: each helper answers with the chord, an octave apart
for t in cues['handoff']: put('fx', swell(0.35, True), snap(t) - 0.1, 0.15)
for i, t in enumerate(cues['work']): stab(snap(t), 0.2, 0.8, oct=i)

# FOCUS LOCKED: the band's biggest chord so far
lk = snap(LK); stab(lk, 0.4, 2.2); put('fx', boom(1.5, 45), lk, 0.4)
put('fx', swell(cues['glide'][1] - cues['glide'][0], True), cues['glide'][0], 0.12)

# the loop: decide = pickup note, act = rising run, result = chord hit, learn = resolving step up
for i, st in enumerate(cues['loop']):
    ts = snap(st['decide']); blip(ts, tones(ts, 79, 91)[0], 0.12, 0.15)
    ta, tr = snap(st['act']), snap(st['result']); tn = tones(ta, 64, 96); steps = max(2, int((tr - ta) / (BEAT / 4)))
    for k in range(steps): blip(ta + k * BEAT / 4, pick(tn, 2 + k + i * 2), 0.08 + 0.05 * k / steps, 0.2)
    if i < 3:
        stab(tr, 0.2 + 0.05 * i, 0.7); put('fx', kick(0.3, 100, 50), tr, 0.35)
        tl = snap(st['learn']); tn = tones(tl, 76, 96); blip(tl, pick(tn, 2 + i), 0.16, kind='bell'); blip(tl + BEAT / 4, pick(tn, 3 + i), 0.16, kind='bell')
last = snap(cues['loop'][3]['decide']); put('fx', swell(HT - last, True, 400, 9000), last, 0.3)

# the hit, and the name
ht = snap(HT); put('fx', boom(3.5, 34), ht, 0.6); put('fx', kick(0.7, 200, 38), ht, 0.6); stab(ht, 0.45, 3.0); stab(ht, 0.25, 3.0, oct=1)
stab(snap(cues['flood2']) + BEAT, 0.15, 2.0, oct=1)
ol = snap(OL); put('fx', swell(0.4, False), ol - 0.4, 0.2); stab(ol, 0.25, 3.5)
blip(snap(cues['outroText']), tones(OL + 0.1, 81, 93)[0], 0.2, 1.5, kind='bell')

# ================================ mix ================================
duck = np.ones(N); tt_ = np.arange(int(0.35 * SR)) / SR; shape = 1 - 0.55 * np.exp(-tt_ / 0.09)
for tk in KICKS:
    i = int(tk * SR); j = min(N, i + len(shape))
    if 0 <= i < N: duck[i:j] = np.minimum(duck[i:j], shape[: j - i])
L = BUS['mus'][0] * duck + BUS['drm'][0] + BUS['fx'][0] * (0.5 + 0.5 * duck)
R = BUS['mus'][1] * duck + BUS['drm'][1] + BUS['fx'][1] * (0.5 + 0.5 * duck)

# master: one shared room so band and events sit in the same space, then glue and level
ir_n = int(1.4 * SR); ir = rng.standard_normal(ir_n) * np.exp(-np.arange(ir_n) / SR / 0.32); ir[0] = 0
ir /= np.sqrt(np.sum(ir ** 2))
Lm = L + 0.14 * fftconvolve(L, ir)[:N]; Rm = R + 0.14 * fftconvolve(R, ir[::-1])[:N]
st = np.stack([Lm, Rm], 1)[: int(DUR * SR)]
st = np.tanh(st / (np.percentile(np.abs(st), 99.9) + 1e-9) * 1.5)
fade = int(0.6 * SR); st[-fade:] *= np.linspace(1, 0, fade)[:, None]
st = st / np.max(np.abs(st)) * 0.89
with wave.open(OUT, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype('<i2').tobytes())
print(f'{OUT}: {len(st) / SR:.2f}s')
