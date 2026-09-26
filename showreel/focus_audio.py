# Procedural score for FOCUS: a continuous music bed plus sound design. Every sound is placed from focus_cues.json, which focus.js exports from
# the same constants that drive the picture (`node render.mjs cues focus_cues.json`), so sync is exact.
# usage: python3 focus_audio.py [focus_cues.json] [focus_audio.wav]
import json, sys, wave
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve

SR = 44100
cues = json.load(open(sys.argv[1] if len(sys.argv) > 1 else 'focus_cues.json'))
OUT = sys.argv[2] if len(sys.argv) > 2 else 'focus_audio.wav'
DUR = cues['dur']
N = int((DUR + 3) * SR)
L = np.zeros(N); R = np.zeros(N)
rng = np.random.default_rng(7)

# ---------- primitives ----------
def tt(d): return np.arange(int(d * SR)) / SR
def env(n, a=0.002, d=0.2): t = np.arange(n) / SR; return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)
def filt(x, kind, f): return sosfilt(butter(2, f, kind, fs=SR, output='sos'), x)
def place(sig, t, g=1.0, pan=0.0):
    i = int(round(t * SR));
    if i >= N or i + len(sig) <= 0: return
    j = min(N, i + len(sig)); s = sig[: j - i] * g
    L[i:j] += s * np.sqrt(0.5 * (1 - pan)); R[i:j] += s * np.sqrt(0.5 * (1 + pan))
def mix(*xs):                      # sum signals of different lengths
    out = np.zeros(max(len(x) for x in xs))
    for x in xs: out[:len(x)] += x
    return out
def sine(f, d, a=0.002, dec=0.2): t = tt(d); return np.sin(2 * np.pi * f * t) * env(len(t), a, dec)
def glide(f0, f1, d, dec=None):
    t = tt(d); f = f0 * (f1 / f0) ** (t / d); ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * env(len(t), 0.002, dec or d / 2)
def noise(d, lo=None, hi=None, a=0.001, dec=0.1):
    x = rng.standard_normal(int(d * SR))
    if lo: x = filt(x, 'highpass', lo)
    if hi: x = filt(x, 'lowpass', hi)
    return x * env(len(x), a, dec)
def kick(d=0.45, f0=150, f1=45, g=1.0):
    t = tt(d); f = f1 + (f0 - f1) * np.exp(-t * 30); s = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.001, d / 3.5)
    return np.tanh(s * 1.8) * g
def boom(d=2.5, f=40): t = tt(d); return np.tanh(2 * np.sin(2 * np.pi * (f + 35 * np.exp(-t * 6)) * t) * env(len(t), 0.003, d / 3))
def whoosh(d=0.5, up=True):
    x = rng.standard_normal(int(d * SR)); t = np.arange(len(x)) / len(x)
    shape = np.sin(np.pi * (t if up else 1 - t) ** (1.6 if up else 0.6)) ** 2
    return filt(x, 'bandpass', [600, 6000]) * shape
def pad(freqs, d, a=0.5, rel=1.0, bright=1800):
    t = tt(d); s = sum(2 * ((t * f * (1 + det)) % 1) - 1 for f in freqs for det in (-0.004, 0, 0.005))
    s = filt(s / (3 * len(freqs)), 'lowpass', bright)
    return s * np.minimum(1, t / a) * np.clip((d - t) / rel, 0, 1)
def af_beep(f=2400):          # camera autofocus confirm: two quick blips
    return np.concatenate([sine(f, 0.05, 0.001, 0.02), np.zeros(int(0.035 * SR)), sine(f * 1.12, 0.07, 0.001, 0.03)])
def bell(f, d=0.8): return sine(f, d, 0.002, d / 3) + 0.35 * sine(f * 2.76, d, 0.002, d / 6) + 0.2 * sine(f * 5.4, d, 0.001, d / 10)
NOTE = lambda n: 440 * 2 ** ((n - 69) / 12)
SCALE = [69, 71, 73, 76, 78, 81, 83, 85, 88, 90, 93]      # A major pentatonic-ish, rising

# ---------- 1. open: goal appears, bracket snaps on ----------
place(bell(NOTE(81), 1.2), cues['goal'], 0.35)
place(boom(1.2, 55), cues['goal'], 0.25)
place(af_beep(), cues['bracketIn'], 0.35); place(noise(0.05, 2000, None, 0.0005, 0.01), cues['bracketIn'], 0.3)
for c in cues['captions']: place(whoosh(0.28, True), c - 0.05, 0.06)

# ---------- 2. the notifications arrive, attention starts hunting ----------
pings = [NOTE(n) for n in (88, 84, 91, 86, 93, 81, 89)]
for i, t in enumerate(cues['arrive']):
    place(bell(pings[i], 0.5), t + 0.15, 0.22 + 0.03 * i, pan=(-1) ** i * 0.5)
    place(kick(0.2, 110, 60, 0.6), t + 0.18, 0.5)
    place(noise(0.15, 300, 3000, 0.001, 0.04), t + 0.15, 0.15)
arr0, hs0, hs1 = cues['arrive'][0], cues['huntSpan'][0], cues['huntSpan'][1]
dr = pad([NOTE(45), NOTE(46)], hs1 - arr0 + 0.2, a=1.5, rel=0.1, bright=900)
place(dr * np.linspace(0.3, 1, len(dr)), arr0, 0.22)                     # rising dissonant drone
for t in cues['hunt']: place(sine(1800 + rng.random() * 1400, 0.03, 0.001, 0.012), t, 0.45, pan=rng.random() * 1.6 - 0.8)
for t in np.arange(hs0, hs1, 0.05): place(noise(0.02, 5000, None, 0.0005, 0.006), t, 0.12)
place(noise(0.4, 100, 800, 0.001, 0.15), hs1, 0.5); place(kick(0.5), hs1, 0.8)       # snap home

# ---------- 3. attention is finite: pieces yanked away ----------
for i, t in enumerate(cues['yank']):
    place(glide(1400 - i * 60, 260 - i * 10, 0.2), t - 0.12, 0.38, pan=(-1) ** i * 0.4)
    place(noise(0.06, 1500, 6000, 0.001, 0.02), t, 0.12)
low0, low1 = cues['yank'][-1] + 0.2, cues['swipe'][0]
for t in np.arange(low0, low1, 0.78):                                       # heartbeat at 17%
    place(kick(0.35, 70, 40, 1), t, 0.55); place(kick(0.3, 65, 38, 1), t + 0.2, 0.35)
place(pad([NOTE(33), NOTE(40)], low1 - low0 + 0.5, a=0.8, rel=0.5, bright=400), low0, 0.18)

# ---------- 4. drop the noise; every return climbs ----------
for i, t in enumerate(cues['swipe']): place(whoosh(0.35, False), t, 0.35, pan=0.7 if i % 2 else -0.7)
for i, t in enumerate(cues['ret']):
    f = NOTE(SCALE[i])
    place(mix(glide(f / 2, f, 0.09, 0.05), 0.6 * bell(f, 0.35)), t - 0.02, 0.2)
    place(noise(0.03, 3000, None, 0.0005, 0.008), t, 0.2)

# ---------- 5. the motto flood ----------
f0, f1 = cues['flood1']
place(whoosh(0.4, True), f0 - 0.3, 0.5); place(boom(2.5, 38), f0 + 0.1, 0.5); place(kick(0.6, 160, 40), f0 + 0.1, 0.55)
place(pad([NOTE(57), NOTE(61), NOTE(64), NOTE(69)], f1 - f0 + 0.6, a=0.3, rel=0.5, bright=2500), f0 + 0.1, 0.1)
for t in cues['statement']: place(kick(0.35, 120, 50, 1), t, 0.5)
w = cues['wall']
for k in range(60): place(sine(NOTE(84 + rng.integers(0, 12)), 0.08, 0.001, 0.03), w + rng.random() * 0.55, 0.05, pan=rng.random() * 2 - 1)
place(whoosh(0.4, False), f1, 0.35)

# ---------- 6. your head forgets → write it down ----------
for t in cues['lost']: place(glide(NOTE(88), NOTE(76), 0.9, 0.4) * np.linspace(1, 0, int(0.9 * SR)), t, 0.14)
place(glide(900, 180, 0.5, 0.3), cues['forgetsFall'][0], 0.15)
place(kick(0.3, 90, 50, 1), cues['cardSlam'], 0.6); place(noise(0.12, 200, 2500, 0.001, 0.04), cues['cardSlam'], 0.4)
t0, t1 = cues['typing']
for k in range(14): place(mix(noise(0.02, 2500, 9000, 0.0005, 0.006), 0.5 * sine(3200, 0.01, 0.0005, 0.003)), t0 + k * (t1 - t0) / 14, 0.5, pan=0.2)
for t in cues['caught']: place(sine(NOTE(88), 0.1, 0.001, 0.04), t, 0.18)
place(kick(0.25, 120, 60, 1), cues['absorbed'], 0.4)

# ---------- 7. hand it off: each helper locks on ----------
for t in cues['bench']: place(sine(NOTE(76), 0.12, 0.001, 0.05) + sine(NOTE(83), 0.12, 0.001, 0.05), t, 0.12)
for t in cues['handoff']: place(whoosh(0.35, True), t, 0.25)
for t in cues['work']: place(af_beep(1900), t, 0.3)

# ---------- 8. FOCUS LOCKED, then a steady pulse into the loop ----------
lk = cues['lock']
place(af_beep(2600), lk - 0.02, 0.45)
place(bell(NOTE(69), 2.0) + bell(NOTE(76), 2.0) * 0.8 + bell(NOTE(81), 2.0) * 0.6, lk, 0.3)
place(boom(1.5, 45), lk, 0.5)
hit = cues['hit']
g0, g1 = cues['glide']
place(whoosh(g1 - g0, True), g0, 0.25)
beat = 0.5
for k, t in enumerate(np.arange(lk + 1.0, hit - 0.1, beat)):
    ramp = (t - lk) / (hit - lk)
    place(kick(0.35, 130, 45, 1), t, 0.35 + 0.35 * ramp)
    place(noise(0.03, 7000, None, 0.0005, 0.01), t + beat / 2, 0.08 + 0.1 * ramp)
    if k % 2 == 0: place(pad([NOTE(33)], beat * 2, a=0.01, rel=0.3, bright=300), t, 0.25)
bed = pad([NOTE(45), NOTE(52), NOTE(57)], hit - lk, a=2.0, rel=0.2, bright=1200)
place(bed * np.linspace(0.5, 1.0, len(bed)), lk, 0.08)
for i, st in enumerate(cues['loop']):
    place(sine(1500, 0.04, 0.001, 0.015), st['decide'], 0.25)                          # decide: aim tick
    place(whoosh(st['result'] - st['act'] + 0.05, True), st['act'], 0.3)                # act: move
    if i < 3:
        place(kick(0.3, 100, 50, 1), st['result'], 0.55); place(bell(NOTE(64 + i * 3), 0.6), st['result'], 0.15)   # result: contact with reality
        place(glide(NOTE(76 + i * 3) / 2, NOTE(76 + i * 3), 0.1, 0.06), st['learn'], 0.22)                         # learn: correction snap
last = cues['loop'][3]['decide']
rs = rng.standard_normal(int((hit - last) * SR)); tr = np.arange(len(rs)) / len(rs)
place(filt(rs, 'bandpass', [400, 7000]) * tr ** 2.5, last, 0.35)                           # riser into the hit

# ---------- 9. the hit, the flood, the name ----------
place(boom(3.5, 34), hit, 0.75); place(kick(0.7, 200, 38), hit, 0.8); place(noise(1.8, 60, 9000, 0.001, 0.4), hit, 0.35)
fl2, ol = cues['flood2'], cues['outroLock']
place(pad([NOTE(45), NOTE(57), NOTE(61), NOTE(64), NOTE(69), NOTE(71)], ol - fl2 + 1.0, a=0.2, rel=0.9, bright=3000), fl2, 0.2)
place(bell(NOTE(81), 2.5) + bell(NOTE(88), 2.5) * 0.6, fl2 + 0.35, 0.25)
place(whoosh(0.4, False), ol - 0.35, 0.3)
place(af_beep(2400), ol + 0.2, 0.4)
place(pad([NOTE(57), NOTE(64), NOTE(69), NOTE(73)], DUR - ol, a=0.3, rel=2.5, bright=2000), ol, 0.14)
place(bell(NOTE(69), 3.0) + bell(NOTE(76), 3.0) * 0.7, cues['outroText'], 0.22)


# =====================================================================================
# MUSIC: a continuous score under the sound design. 120 BPM, A minor ↔ C major.
# Each section's downbeat is pinned to a picture cue, so the arrangement turns when the story does.
# =====================================================================================
BEAT = 0.5
ML = np.zeros(N); MR = np.zeros(N)          # melodic bus (ducked by the kick)
DL = np.zeros(N); DR = np.zeros(N)          # drum bus
KICKS = []
def put(bus, sig, t, g=1.0, pan=0.0):
    i = int(round(t * SR))
    if i >= N or i + len(sig) <= 0 or i < 0: return
    j = min(N, i + len(sig)); x = sig[: j - i] * g
    bus[0][i:j] += x * np.sqrt(0.5 * (1 - pan)); bus[1][i:j] += x * np.sqrt(0.5 * (1 + pan))
MUS, DRM = (ML, MR), (DL, DR)
CH = {  # voicings (midi) + bass root
    'Am': ([57, 60, 64, 71], 45), 'F': ([57, 60, 65, 69], 41), 'C': ([55, 60, 64, 67], 48), 'G': ([55, 59, 62, 67], 43),
    'E': ([56, 59, 64, 68], 40), 'Dm': ([57, 62, 65, 69], 38), 'Fmaj7': ([57, 60, 64, 65], 41), 'Cadd9': ([55, 60, 62, 64], 48),
}
def saw(f, d): t = tt(d); return 2 * ((t * f) % 1) - 1
def pluck(f, d=0.35, bright=3200):
    x = saw(f, d) + 0.5 * saw(f * 1.005, d)
    return filt(x, 'lowpass', bright) * env(len(x), 0.002, d / 3.5)
def bass_note(f, d, drive=1.4):
    x = np.tanh(drive * (saw(f, d) + 0.6 * np.sin(2 * np.pi * f / 2 * tt(d))))
    return filt(x, 'lowpass', 520) * np.minimum(1, tt(d) / 0.01) * np.clip((d - tt(d)) / 0.05, 0, 1)
def snare(): return mix(noise(0.22, 1200, 9000, 0.001, 0.06), 0.6 * sine(190, 0.12, 0.001, 0.04))
def clap():
    out = np.zeros(int(0.25 * SR))
    for o in (0, 0.01, 0.021): i = int(o * SR); n = noise(0.25 - o, 900, 7000, 0.0005, 0.012 if o < 0.02 else 0.07); out[i:i + len(n)] += n
    return out
def hat(dec=0.03, g=1.0): return noise(0.08, 7000, None, 0.0005, dec) * g

def section(t0, t1, chords, bars_per_chord=0.5, pad_g=0.0, pad_bright=1600, arp=None, arp_g=0.0, arp_oct=1,
            bass=None, bass_g=0.0, drums=None, drum_g=1.0, ramp=(1, 1)):
    """chords cycle every `bars_per_chord` bars (1 bar = 4 beats). arp: step in beats. bass: 'pulse' | 'long' | None.
    drums: 'four' | 'half' | 'light' | 'build' | None. ramp: gain at start/end of the section."""
    cl = bars_per_chord * 4 * BEAT
    k, t = 0, t0
    while t < t1 - 1e-3:
        d = min(cl, t1 - t); name = chords[k % len(chords)]; notes, root = CH[name]
        g = lerp_(ramp[0], ramp[1], (t - t0) / max(1e-3, t1 - t0))
        if pad_g: put(MUS, pad([NOTE(n) for n in notes], d + 0.25, a=min(0.4, d / 3), rel=0.3, bright=pad_bright), t, pad_g * g)
        if arp:
            seq = notes + [n + 12 for n in notes[:2]]; st = arp * BEAT
            for j, tb in enumerate(np.arange(t, t + d - 1e-3, st)):
                n = seq[j % len(seq)] + 12 * (arp_oct - 1)
                put(MUS, pluck(NOTE(n), 0.3), tb, arp_g * g, pan=0.35 * np.sin(j * 1.3))
                put(MUS, pluck(NOTE(n), 0.3), tb + 3 * st / 2, arp_g * g * 0.28, pan=-0.5)     # dotted echo
        if bass == 'pulse':
            for tb in np.arange(t, t + d - 1e-3, BEAT / 2): put(MUS, bass_note(NOTE(root - 12), BEAT / 2 * 0.9), tb, bass_g * g)
        elif bass == 'long':
            put(MUS, bass_note(NOTE(root - 12), d * 0.98, 1.1), t, bass_g * g)
        t += cl; k += 1
    if drums:
        nb = int(round((t1 - t0) / BEAT))
        for b in range(nb):
            tb = t0 + b * BEAT; g = lerp_(ramp[0], ramp[1], b / max(1, nb)) * drum_g
            if drums == 'four':
                put(DRM, kick(0.4, 140, 45), tb, 0.9 * g); KICKS.append(tb)
                if b % 2 == 1: put(DRM, clap(), tb, 0.45 * g)
                put(DRM, hat(0.025), tb + BEAT / 2, 0.25 * g); put(DRM, hat(0.015), tb + BEAT / 4, 0.1 * g); put(DRM, hat(0.015), tb + 3 * BEAT / 4, 0.1 * g)
            elif drums == 'half':
                if b % 4 == 0: put(DRM, kick(0.5, 120, 40), tb, 0.85 * g); KICKS.append(tb)
                if b % 4 == 2: put(DRM, snare(), tb, 0.4 * g)
                put(DRM, hat(0.02), tb, 0.12 * g); put(DRM, hat(0.02), tb + BEAT / 2, 0.08 * g)
            elif drums == 'light':
                if b % 2 == 0: put(DRM, kick(0.35, 120, 50), tb, 0.6 * g); KICKS.append(tb)
                put(DRM, hat(0.02), tb + BEAT / 2, 0.16 * g)
                if b % 4 == 3: put(DRM, clap(), tb, 0.25 * g)
        if drums == 'build':
            steps = int((t1 - t0) / (BEAT / 4))
            for j in range(steps):
                u = j / max(1, steps); put(DRM, snare(), t0 + j * BEAT / 4, (0.08 + 0.35 * u ** 2) * drum_g)
                if j % 4 == 0: put(DRM, kick(0.3, 130, 50), t0 + j * BEAT / 4, 0.6 * drum_g); KICKS.append(t0 + j * BEAT / 4)
def lerp_(a, b, u): return a + (b - a) * min(1, max(0, u))

A_ = cues['arrive'][0]; HOME = cues['huntSpan'][1]; SW = cues['swipe'][0]; F0, F1 = cues['flood1']; LK = cues['lock']; HT = cues['hit']; END = cues['dur']
build_len = 4 * BEAT
# A · goal: a quiet promise
section(0.0, A_, ['Am', 'F'], bars_per_chord=1, pad_g=0.16, pad_bright=1300, arp=0.5, arp_g=0.08, arp_oct=2,
        bass='long', bass_g=0.14, ramp=(0.7, 1))
section(cues['bracketIn'], A_, ['Am'], bars_per_chord=4, drums='light', drum_g=0.7, ramp=(0.6, 1))
# B · everything wants your attention: frantic 16ths, four-on-the-floor
section(A_, HOME, ['Am', 'F', 'E'], bars_per_chord=0.5, pad_g=0.10, pad_bright=1400, arp=0.25, arp_g=0.08, arp_oct=2,
        bass='pulse', bass_g=0.16, drums='four', drum_g=0.8, ramp=(0.7, 1.1))
# C · finite: dark half-time, the air goes out
section(HOME, SW, ['Am', 'F', 'Dm', 'E'], bars_per_chord=1, pad_g=0.11, pad_bright=700, arp=1.0, arp_g=0.045, arp_oct=1,
        bass='long', bass_g=0.2, drums='half', drum_g=0.7)
# D · drop the noise: lift and build
section(SW, F0, ['F', 'G'], bars_per_chord=0.25, pad_g=0.1, pad_bright=1800, arp=0.25, arp_g=0.06, arp_oct=2, bass='pulse', bass_g=0.14, drums='build', drum_g=0.9)
# E · the motto: full, anthemic
section(F0, F1, ['C', 'G', 'Am', 'F'], bars_per_chord=0.5, pad_g=0.13, pad_bright=3200, arp=0.25, arp_g=0.07, arp_oct=2,
        bass='pulse', bass_g=0.18, drums='four', drum_g=1.0)
# F · forget → write it down → hand it off: lighter, hopeful
section(F1, LK, ['F', 'C', 'G', 'Am'], bars_per_chord=0.75, pad_g=0.09, pad_bright=2000, arp=0.5, arp_g=0.07, arp_oct=2,
        bass='long', bass_g=0.15, drums='light', drum_g=0.9, ramp=(0.8, 1.1))
# G · focus locked → the loop: driving, climbing into the hit
section(LK, HT - build_len, ['Am', 'F', 'C', 'G'], bars_per_chord=1, pad_g=0.11, pad_bright=2400, arp=0.25, arp_g=0.07, arp_oct=2,
        bass='pulse', bass_g=0.17, drums='four', drum_g=1.0, ramp=(0.85, 1.15))
section(HT - build_len, HT, ['F', 'G'], bars_per_chord=0.5, pad_g=0.12, pad_bright=3500, arp=0.125, arp_g=0.06, arp_oct=2, bass='pulse', bass_g=0.17, drums='build', drum_g=1.0)
# H · attention is all you need: resolve to C, then let it ring out on the name
section(HT, cues['outroLock'], ['Cadd9', 'F', 'G', 'C'], bars_per_chord=0.65, pad_g=0.14, pad_bright=3500, arp=0.25, arp_g=0.06, arp_oct=2,
        bass='long', bass_g=0.18, drums='four', drum_g=0.75, ramp=(1.0, 0.8))
section(cues['outroLock'], END, ['Fmaj7', 'Cadd9'], bars_per_chord=1, pad_g=0.12, pad_bright=2200, arp=0.5, arp_g=0.05, arp_oct=2, bass='long', bass_g=0.12, ramp=(1, 0.3))

# sidechain: the melodic bus breathes with the kick
duck = np.ones(N); tt_ = np.arange(int(0.35 * SR)) / SR; shape = 1 - 0.55 * np.exp(-tt_ / 0.09)
for tk in KICKS:
    i = int(tk * SR); j = min(N, i + len(shape))
    if 0 <= i < N: duck[i:j] = np.minimum(duck[i:j], shape[: j - i])
ML *= duck; MR *= duck
# sound design sits on top of the music, a touch lower
L = 0.6 * L + ML + DL; R = 0.6 * R + MR + DR

# ---------- master: room, glue, level ----------
ir_n = int(1.4 * SR); ir = rng.standard_normal(ir_n) * np.exp(-np.arange(ir_n) / SR / 0.32); ir[0] = 0
ir /= np.sqrt(np.sum(ir ** 2))
Lm = L + 0.12 * fftconvolve(L, ir)[:N]; Rm = R + 0.12 * fftconvolve(R, ir[::-1])[:N]
st = np.stack([Lm, Rm], 1)[: int(DUR * SR)]
st = np.tanh(st / (np.percentile(np.abs(st), 99.9) + 1e-9) * 1.5)   # soft-clip = gentle bus compression
fade = int(0.6 * SR); st[-fade:] *= np.linspace(1, 0, fade)[:, None]
st = st / np.max(np.abs(st)) * 0.89
with wave.open(OUT, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype('<i2').tobytes())
print(f'{OUT}: {len(st) / SR:.2f}s')
