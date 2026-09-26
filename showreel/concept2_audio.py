# Procedural score for CONCEPT. One musical idea: THE LIST IS A SCALE.
# Each rule, as it docks into the list, plays the next step of A minor (A B C D E F G). At the end card the list
# lights up again as one fast run and lands on the octave: seven rules, one complete set.
# Around it: the pieces counting are ticks climbing, forgotten thoughts are bells falling away, the loop is an
# arpeggio that tightens, recursion is a rising swell, the motto and the apex are the band's biggest chords.
# Events come from concept2_cues.json (`PAGE=concept2.html node render.mjs cues concept2_cues.json`).
# usage: python3 concept2_audio.py [concept2_cues.json] [concept2_audio.wav]
import json, sys, wave
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve

SR = 44100
cues = json.load(open(sys.argv[1] if len(sys.argv) > 1 else 'concept2_cues.json'))
OUT = sys.argv[2] if len(sys.argv) > 2 else 'concept2_audio.wav'
DUR, BEAT = cues['dur'], cues['beat']
N = int((DUR + 3) * SR)
rng = np.random.default_rng(21)

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

# ================================ harmony ================================
CH = {'Am': [57, 60, 64], 'F': [57, 60, 65], 'C': [55, 60, 64], 'G': [55, 59, 62], 'E': [56, 59, 64], 'Dm': [57, 62, 65]}
ROOT = {'Am': 33, 'F': 29, 'C': 36, 'G': 31, 'E': 28, 'Dm': 38}
def block(t0, t1, ch, pad_g=0.1, bright=1600, bass_g=0.14, drums=None, dg=1.0):
    put('mus', pad([NOTE(n) for n in CH[ch]], t1 - t0 + 0.1, a=0.15, rel=0.15, bright=bright), t0, pad_g)
    if bass_g:
        for tb in np.arange(t0, t1 - 1e-3, BEAT): put('mus', bass_note(NOTE(ROOT[ch]), BEAT * 0.9), tb, bass_g)
    if drums:
        for j, tb in enumerate(np.arange(t0, t1 - 1e-3, BEAT)):
            if drums == 'four' or j % 2 == 0: put('drm', kick(0.4, 140, 45), tb, 0.7 * dg); KICKS.append(tb)
            if j % 2 == 1: put('drm', clap(), tb, 0.3 * dg)
            put('drm', hat(0.02), tb + BEAT / 2, 0.15 * dg)
SCALE = [69, 71, 72, 74, 76, 77, 79, 81]    # A minor, A4 → A5

# ---- open + fuel ----
put('fx', boom(1.5, 50), cues['lock'], 0.4); put('fx', bell(NOTE(81), 1.8), cues['lock'], 0.3); KICKS.append(cues['lock']); put('drm', kick(0.45, 160, 45), cues['lock'], 0.6)
block(0, cues['fuel'], 'Am', 0.1, 1100, 0.0)
block(cues['fuel'], cues['loop'], 'Am', 0.1, 1400, 0.12, 'half', 0.7)
for i, t in enumerate(cues['count']):                   # it runs out: twelve ticks climbing the chord…
    put('fx', pluck(NOTE([57, 60, 64][i % 3] + 12 * (1 + i // 3)), 0.18, 5000), t, 0.14, pan=0.5 * (-1) ** i)
put('fx', mix(bell(NOTE(57), 1.2), bell(NOTE(58), 1.2)), cues['thatsAll'], 0.2); put('fx', boom(0.8, 45), cues['thatsAll'], 0.35)   # …and nothing more
for i, t in enumerate(cues['forgets']):                 # it forgets: bells that fall and fade
    for k in range(3): put('fx', bell(NOTE(84 - 3 * i - 5 * k), 0.9), t + k * BEAT / 4, 0.12 * (1 - 0.3 * k), pan=(-1) ** i * 0.5)
for t in cues['marks']: put('fx', mix(kick(0.3, 110, 50), 0.5 * clap()), t, 0.45)   # every move leaves a mark

# ---- the loop: DECIDE / ACT / RESULT / LEARN as a four-note arpeggio, twice, tighter ----
block(cues['loop'], cues['header'], 'F', 0.09, 1800, 0.12, 'four', 0.8)
for i, t in enumerate(cues['loopNodes']):
    put('fx', pluck(NOTE([69, 72, 76, 79][i % 4] + (12 if i >= 4 else 0)), 0.3, 4800), t, 0.2, pan=[0, 0.5, 0, -0.5][i % 4])
lt = cues['loopLand']; put('fx', boom(1.8, 42), lt, 0.45); put('drm', kick(0.5, 180, 40), lt, 0.6); KICKS.append(lt)
for n in (57, 64, 69, 72, 76): put('fx', bell(NOTE(n + 12), 1.6), lt, 0.08)

# ---- the seven: each rule its own chord; its dock plays the next note of the scale ----
put('fx', swell(0.5, True), cues['header'] - 0.5, 0.12)
block(cues['header'], cues['rules'][0]['t0'], 'Am', 0.08, 1200, 0.0)
prog = ['Am', 'F', 'C', 'G', 'Am', 'F', 'E']
for i, r in enumerate(cues['rules']):
    t1 = cues['rules'][i + 1]['t0'] if i < 6 else cues['rec']
    block(r['t0'], t1, prog[i], 0.09, 1500 + 150 * i, 0.12, 'half', 0.75)
    put('fx', swell(0.35, True, 800, 8000), r['t0'] - 0.35, 0.08)
    put('fx', bell(NOTE(SCALE[i]), 1.4), r['dock'], 0.32); put('fx', pluck(NOTE(SCALE[i] - 12), 0.5), r['dock'], 0.12)

# ---- recursion: the same pulse, rising, every size ----
block(cues['rec'], cues['motto'], 'Am', 0.1, 2200, 0.1, 'half', 0.6)
for k in range(4): put('fx', swell(1.6, True, 300 * 2 ** k, min(12000, 2500 * 2 ** k)), cues['rec'] + 0.4 + k * 1.6, 0.06)
for i, tb in enumerate(np.arange(cues['rec'] + 1.0, cues['motto'] - 0.5, BEAT)):
    put('fx', pluck(NOTE(SCALE[i % 8]), 0.2, 4000), tb, 0.07 + 0.004 * i, pan=0.4 * np.sin(i))

# ---- motto, apex ----
m = cues['motto']; put('fx', swell(0.5, True, 400, 9000), m - 0.5, 0.3); put('fx', boom(2.5, 38), m, 0.45); KICKS.append(m)
block(m, cues['apex'], 'C', 0.12, 3000, 0.16, 'four', 0.9)
a = cues['apex']; put('fx', boom(3.0, 34), a, 0.5); KICKS.append(a)
block(a, cues['end'], 'F', 0.13, 3200, 0.16, 'four', 0.8)
for n in (65, 69, 72, 76): put('fx', bell(NOTE(n + 12), 2.4), a, 0.08)

# ---- end: the list runs the scale once more and lands on the octave ----
e = cues['end']; put('fx', swell(0.4, False), e - 0.1, 0.2)
block(e, DUR, 'Am', 0.1, 2000, 0.1)
for i, t in enumerate(cues['listFlash']): put('fx', bell(NOTE(SCALE[i]), 0.8), t, 0.22, pan=(i - 3) * 0.15)
fin = cues['listFlash'][-1] + BEAT / 4
put('fx', bell(NOTE(SCALE[7]), 3.0), fin, 0.3)
for n in (57, 64, 69, 71, 72): put('fx', bell(NOTE(n), 3.0), fin, 0.07)

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
