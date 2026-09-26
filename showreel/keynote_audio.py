# Procedural score for KEYNOTE. One musical idea: THE CHORD ASSEMBLES.
# The problem is a tense, crowded groove (A with a B-flat rubbing against it). Each rule's stinger adds one voice
# to a held chord — A, E, A, C, E, G, B — so by rule seven the room holds a full A-minor-9, and every piece of
# attention that flies home rings a note of the chord built so far. FOCUS LOCKED, the loop's hit and the apex
# play the whole chord. Every event comes from keynote_cues.json, exported by keynote.js from its own constants.
# usage: python3 keynote_audio.py [keynote_cues.json] [keynote_audio.wav]
import json, sys, wave
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve

SR = 44100
cues = json.load(open(sys.argv[1] if len(sys.argv) > 1 else 'keynote_cues.json'))
OUT = sys.argv[2] if len(sys.argv) > 2 else 'keynote_audio.wav'
DUR, BEAT = cues['dur'], cues['beat']
N = int((DUR + 3) * SR)
rng = np.random.default_rng(5)

# ================================ primitives (same instruments as focus_audio.py) ================================
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
def swell(d, up=True, lo=500, hi=7000):
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
def clap():
    out = np.zeros(int(0.25 * SR))
    for o in (0, 0.01, 0.021): i = int(o * SR); n = noise(0.25 - o, 900, 7000, 0.0005, 0.012 if o < 0.02 else 0.07); out[i:i + len(n)] += n
    return out
def hat(dec=0.03): return noise(0.08, 7000, None, 0.0005, dec)
NOTE = lambda n: 440 * 2 ** ((n - 69) / 12)

BUS = {k: (np.zeros(N), np.zeros(N)) for k in ('mus', 'drm', 'fx')}
KICKS = []
def put(bus, sig, t, g=1.0, pan=0.0):
    i = int(round(t * SR))
    if i >= N or i < 0: return
    j = min(N, i + len(sig)); x = sig[: j - i] * g; L, R = BUS[bus]
    L[i:j] += x * np.sqrt(0.5 * (1 - pan)); R[i:j] += x * np.sqrt(0.5 * (1 + pan))

# ================================ the idea ================================
VOICES = [45, 52, 57, 60, 64, 67, 71]           # A2 E3 A3 C4 E4 G4 B4 — one per rule
def groove(t0, t1, root, g=1.0, busy=False, four=True, rub=False, bright=1400):
    put('mus', pad([NOTE(root + 12), NOTE(root + 19)] + ([NOTE(root + 13)] if rub else []), t1 - t0 + 0.05, a=0.1, rel=0.1, bright=bright), t0, 0.07 * g)
    for j, tb in enumerate(np.arange(t0, t1 - 1e-3, BEAT)):
        if four or j % 2 == 0: put('drm', kick(0.4, 140, 45), tb, 0.7 * g); KICKS.append(tb)
        if j % 2 == 1: put('drm', clap(), tb, 0.3 * g)
        for s in ((1, 2, 3) if busy else (2,)): put('drm', hat(0.018), tb + s * BEAT / 4, (0.16 if s == 2 else 0.08) * g)
        put('mus', bass_note(NOTE(root - 12), BEAT / 2 * 0.9), tb, 0.15 * g); put('mus', bass_note(NOTE(root - 12), BEAT / 2 * 0.9), tb + BEAT / 2, 0.1 * g)
def impact(t, g=1.0):
    put('fx', swell(0.4, True, 500, 9000), t - 0.4, 0.2 * g); put('fx', boom(1.6, 42), t, 0.4 * g); put('drm', kick(0.5, 190, 40), t, 0.6 * g); put('drm', clap(), t, 0.35 * g); KICKS.append(t)
def chord(t, voices, d=2.5, g=0.1, oct=0):
    for n in voices: put('fx', bell(NOTE(n + 12 + 12 * oct), d), t, g)

# ---- the goal ----
lk = cues['lock']; put('fx', boom(1.4, 50), lk, 0.35); put('fx', bell(NOTE(69), 1.8), lk, 0.3); put('drm', kick(0.45, 160, 45), lk, 0.6); KICKS.append(lk)
put('mus', pad([NOTE(57), NOTE(64)], cues['hundred'], a=0.3, rel=0.2, bright=900), lk, 0.08)
# ---- a hundred things: a hit, then a crowd of clicks as the wall lands; the groove is tense ----
h = cues['hundred']; impact(h, 1.1)
c0, c1 = cues['cardsLand']
for k in range(60): put('fx', pluck(NOTE([69, 70, 72, 76, 77, 81][rng.integers(0, 6)] + 12), 0.08, 7000), c0 + (c1 - c0) * k / 60, 0.05, pan=rng.random() * 1.8 - 0.9)
groove(h, cues['finite'], 45, 0.9, busy=True, rub=True, bright=2000)
# ---- only one of you: one note split into twelve, falling and spreading ----
for i, t in enumerate(cues['split']): put('fx', bell(NOTE(81 - [0, 2, 3, 5, 7, 8, 10, 12, 14, 15, 17, 19][i]), 0.4), t, 0.2, pan=(0.2 + 0.7 * i / 11) * (-1) ** i)
z = cues['zero']; put('fx', mix(bell(NOTE(57), 1.2), bell(NOTE(58), 1.2)), z, 0.2); put('fx', boom(1.0, 44), z, 0.35)
# ---- finite, forgets: the groove thins to a heartbeat ----
groove(cues['finite'], cues['turn'], 45, 0.6, four=False, rub=True, bright=800)
for i, t in enumerate(cues['forgets']):
    for k in range(3): put('fx', bell(NOTE(84 - 3 * i - 5 * k), 0.9), t + k * BEAT / 4, 0.1 * (1 - 0.3 * k), pan=(-1) ** i * 0.5)
# ---- the turn: light floods in; the rub resolves to C ----
tn = cues['turn']; put('fx', swell(0.5, True, 400, 9000), tn - 0.5, 0.3); put('fx', boom(2.5, 38), tn, 0.4); KICKS.append(tn)
chord(tn, [48, 55, 60, 64], 3.0, 0.1); put('mus', pad([NOTE(n) for n in (48, 55, 60, 64, 67)], cues['rules'] - tn + 0.3, a=0.05, rel=0.4, bright=3200), tn, 0.1)
chord(cues['motto2'], [53, 57, 60, 65], 2.0, 0.08)
# ---- seven rules: a riser; the numbers climb ----
r0 = cues['stingers'][0]; put('fx', swell(r0 - cues['rules'], True, 300, 9000), cues['rules'], 0.22)
for i, t in enumerate(cues['ruleNums']): put('fx', pluck(NOTE(VOICES[i] + 12), 0.3, 5000), t, 0.18)
# ---- the rules: each stinger adds a voice; the held chord grows; pieces home ring it ----
groove(r0, cues['locked'] - 0.7, 45, 1.0, busy=True, bright=2600)
st = cues['stingers'] + [cues['locked'] - 0.7]
for i in range(7):
    impact(st[i], 1.0); put('fx', bell(NOTE(VOICES[i] + 24), 1.6), st[i], 0.2)
    put('mus', pad([NOTE(n + 12) for n in VOICES[: i + 1]], st[i + 1] - st[i] + 0.1, a=0.05, rel=0.1, bright=1500 + 250 * i), st[i], 0.05 + 0.006 * i)
for hm in cues['home']:
    got = VOICES[: hm['rule'] + 1]; put('fx', bell(NOTE(got[rng.integers(0, len(got))] + 24), 0.6), hm['t'], 0.14, pan=rng.random() - 0.5)
n0, n1 = cues['noiseSwipe']; put('fx', swell(n1 - n0 + 0.3, False, 800, 9000), n0, 0.2)
b0, b1 = cues['beam']; put('fx', filt(rng.standard_normal(int((b1 - b0) * SR)), 'bandpass', [2000, 6000]) * np.sin(np.linspace(0, np.pi, int((b1 - b0) * SR))), b0, 0.05)
for k in range(8): put('fx', pluck(NOTE([69, 72, 76, 79][k % 4] + 12), 0.15, 5000), cues['sort'] + k * BEAT / 4, 0.1, pan=(-1) ** k * 0.6)
put('fx', mix(kick(0.3, 100, 50), 0.4 * clap()), cues['absorb'] + 0.3, 0.4); put('fx', bell(NOTE(76), 1.0), cues['units'] + 0.3, 0.15)
put('fx', swell(0.6, True, 600, 5000), cues['boundary'], 0.1)
for i, t in enumerate(cues['handoffs']): chord(t, VOICES[i + 3: i + 6], 0.8, 0.07)
for k in range(10): put('fx', hat(0.012), cues['notes'] + 0.4 + k * BEAT / 4, 0.25, pan=0.2)
# ---- FOCUS LOCKED: the whole chord ----
L0 = cues['locked']; impact(L0, 1.2); chord(L0, VOICES, 3.0, 0.07)
put('mus', pad([NOTE(n + 12) for n in VOICES], cues['loop'] - L0 + 0.3, a=0.02, rel=0.4, bright=3000), L0, 0.07)
# ---- the loop: DECIDE ACT RESULT LEARN = a four-note figure, twice, tighter; the hit ----
groove(cues['loop'], cues['hit'], 45, 0.85, bright=2400)
for i, t in enumerate(cues['loopNodes']): put('fx', pluck(NOTE([69, 72, 76, 79][i % 4] + (12 if i >= 4 else 0)), 0.3, 5000), t, 0.2, pan=[0, 0.5, 0, -0.5][i % 4])
ht = cues['hit']; impact(ht, 1.4); chord(ht, VOICES, 3.0, 0.08, 0); put('fx', boom(3.5, 34), ht, 0.5)
# ---- recursion: the same figure, rising, every size ----
groove(cues['rec'], cues['apex'], 45, 0.7, four=False, bright=2000)
for k in range(4): put('fx', swell(1.4, True, 300 * 2 ** k, min(12000, 2500 * 2 ** k)), cues['rec'] + 0.4 + k * 1.4, 0.06)
for i, tb in enumerate(np.arange(cues['rec'] + 0.5, cues['apex'] - 0.5, BEAT / 2)): put('fx', pluck(NOTE([69, 72, 76, 79][i % 4] + 12 * (i // 8 % 2)), 0.2, 4000), tb, 0.07 + 0.003 * i, pan=0.4 * np.sin(i))
# ---- apex, end ----
ap = cues['apex']; impact(ap, 1.3); chord(ap, VOICES, 3.0, 0.08); chord(ap, VOICES[2:], 3.0, 0.05, 1)
put('mus', pad([NOTE(n + 12) for n in VOICES], cues['end'] - ap + 0.4, a=0.02, rel=0.5, bright=3500), ap, 0.1)
e = cues['end']; put('fx', swell(0.4, False), e - 0.1, 0.2)
put('mus', pad([NOTE(n + 12) for n in VOICES], DUR - e + 0.5, a=0.3, rel=2.0, bright=2200), e, 0.08)
for i, t in enumerate(cues['endList']): put('fx', bell(NOTE(VOICES[i] + 24), 1.2), t, 0.18, pan=(i - 3) * 0.15)
fin = cues['endList'][-1] + BEAT / 2; put('fx', bell(NOTE(93), 3.5), fin, 0.2); chord(fin, VOICES, 3.5, 0.05)

# ================================ mix (as focus_audio.py) ================================
duck = np.ones(N); tt_ = np.arange(int(0.35 * SR)) / SR; shape = 1 - 0.55 * np.exp(-tt_ / 0.09)
for tk in KICKS:
    i = int(tk * SR); j = min(N, i + len(shape))
    if 0 <= i < N: duck[i:j] = np.minimum(duck[i:j], shape[: j - i])
L = BUS['mus'][0] * duck + BUS['drm'][0] + BUS['fx'][0] * (0.5 + 0.5 * duck)
R = BUS['mus'][1] * duck + BUS['drm'][1] + BUS['fx'][1] * (0.5 + 0.5 * duck)
ir_n = int(1.4 * SR); ir = rng.standard_normal(ir_n) * np.exp(-np.arange(ir_n) / SR / 0.32); ir[0] = 0
ir /= np.sqrt(np.sum(ir ** 2))
Lm = L + 0.14 * fftconvolve(L, ir)[:N]; Rm = R + 0.14 * fftconvolve(R, ir[::-1])[:N]
st = np.stack([Lm, Rm], 1)[: int(DUR * SR)]
st = np.tanh(st / (np.percentile(np.abs(st), 99.9) + 1e-9) * 1.5)
fade = int(0.5 * SR); st[-fade:] *= np.linspace(1, 0, fade)[:, None]
st = st / np.max(np.abs(st)) * 0.89
with wave.open(OUT, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype('<i2').tobytes())
print(f'{OUT}: {len(st) / SR:.2f}s')
