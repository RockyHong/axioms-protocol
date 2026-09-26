# Procedural score for the HOOK. One musical idea: ONE VOICE, SPLIT.
# The bracket's lock is a single bell note (A). When the bracket splits across the tasks, that same note is
# played by 12 pieces, each quieter and pushed further out in the stereo field: one voice thinned into twelve.
# While the pieces dart between tasks the harmony sours (a flat-9 rubs against the root) and the grid gets busy.
# At the freeze everything stops dead; one low A is all that is left. At the CTA the twelve come back as one chord.
# Every picture event sits on the 120 BPM grid in hook.js, so nothing here is quantised after the fact.
# Events come from hook_cues.json (`PAGE=hook.html node render.mjs cues hook_cues.json`).
# usage: python3 hook_audio.py [hook_cues.json] [hook_audio.wav]
import json, sys, wave
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve

SR = 44100
cues = json.load(open(sys.argv[1] if len(sys.argv) > 1 else 'hook_cues.json'))
OUT = sys.argv[2] if len(sys.argv) > 2 else 'hook_audio.wav'
DUR, BEAT = cues['dur'], cues['beat']
N = int((DUR + 3) * SR)
rng = np.random.default_rng(11)

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
ONE = 81                                    # A5: the voice of your attention
AM, F_ = [57, 60, 64], [57, 60, 65]
LK, BU, SP, FL, FZ, CF, CL = cues['lock'], cues['burst'], cues['split'][0]['t'], cues['flat'], cues['freeze'], cues['ctaFly'], cues['ctaLock']

# lock: one voice, whole
put('fx', boom(1.2, 50), LK, 0.35); put('fx', bell(NOTE(ONE), 1.6), LK, 0.4)
put('fx', kick(0.4, 160, 45), LK, 0.6); KICKS.append(LK)
put('mus', pad([NOTE(n) for n in AM], BU - LK + 0.3, a=0.3, rel=0.3, bright=1200), LK, 0.12)

# burst: a hundred things — every card that flies out of the goal is the next step of a climbing arpeggio
put('fx', boom(0.8, 60), BU, 0.3); put('fx', kick(0.35, 140, 50), BU, 0.5)
up = [n for n in range(52, 97) if n % 12 in (9, 0, 4)]
for i, c in enumerate(cues['cards'][:12]):
    put('fx', pluck(NOTE(up[i]), 0.3, 4200), c['t'], 0.2, pan=0.45 * (-1) ** i)
for i, c in enumerate(cues['cards']):
    put('fx', kick(0.15, 110, 70) if c['from'] == 'goal' else mix(kick(0.3, 120, 45), 0.6 * clap()), c['land'], 0.12 if c['from'] == 'goal' else 0.45)

# groove from the burst to the freeze: Am → F (split) → E with a ♭9 (the scramble)
for tb in np.arange(BU, FZ - 1e-3, BEAT):
    b = int(round((tb - BU) / BEAT)); busy = tb >= cues['hops'][0]['t']
    put('drm', kick(0.4, 140, 45), tb, 0.75); KICKS.append(tb)
    if b % 2 == 1: put('drm', clap(), tb, 0.35)
    for s in ((1, 2, 3) if busy else (2,)): put('drm', hat(0.02), tb + s * BEAT / 4, 0.18 if s == 2 else 0.1)
def chord_sec(t0, t1, notes, root, bright, g, extra=()):
    put('mus', pad([NOTE(n) for n in notes] + [NOTE(n) for n in extra], t1 - t0 + 0.05, a=0.08, rel=0.05, bright=bright), t0, g)
    for tb in np.arange(t0, t1 - 1e-3, BEAT / 2): put('mus', bass_note(NOTE(root), BEAT / 2 * 0.9), tb, 0.16)
chord_sec(BU, SP, AM, 33, 1600, 0.1)
chord_sec(SP, FL, F_, 29, 1800, 0.1)
chord_sec(FL, FZ, [52, 56, 59, 64], 28, 2400, 0.11, extra=(70,))      # E with B♭ rubbing: nothing sits right

# split: the one voice, divided — same note, each piece quieter and further apart
for i, s in enumerate(cues['split']):
    g = 0.34 * (1 - i / 14); pan = (0.25 + 0.7 * i / 11) * (-1) ** i
    put('fx', bell(NOTE(ONE), 0.35), s['land'], g, pan=pan)
    put('fx', swell(0.2, True, 2000, 9000), s['t'], 0.03, pan=pan)
# hops: every dart is a short, thin blip somewhere in the chord (+ the rub)
hop_notes = [76, 80, 83, 88, 82, 92]
for i, h in enumerate(cues['hops']):
    put('fx', pluck(NOTE(hop_notes[rng.integers(0, len(hop_notes))]), 0.12, 6000), h['t'], 0.08, pan=rng.random() * 1.6 - 0.8)
# nothing on the goal: a low detuned hit on the downbeat
put('fx', boom(1.2, 44), FL, 0.4); put('fx', mix(bell(NOTE(57), 1.0), bell(NOTE(58), 1.0)), FL, 0.18)

# freeze: everything stops. A tape-stop down, then one low A — only one of you.
put('fx', swell(0.3, False, 300, 3000), FZ, 0.15)
put('mus', sine(NOTE(45), CF - FZ + 0.4, 0.05, 2.5), FZ + BEAT / 2, 0.22)
put('mus', pad([NOTE(57), NOTE(64)], CF - FZ, a=0.8, rel=0.5, bright=700), FZ + BEAT / 2, 0.06)

# CTA: the twelve come back as one chord
put('fx', swell(CL - CF + 0.25, True, 400, 9000), CF - 0.25, 0.25)
put('fx', boom(2.5, 38), CL, 0.45); put('drm', kick(0.6, 180, 40), CL, 0.6); KICKS.append(CL)
for n in (57, 64, 69, 71, 72, ONE): put('fx', bell(NOTE(n), 2.8), CL, 0.09)
put('mus', pad([NOTE(n) for n in (45, 57, 64, 71, 72)], DUR - CL + 0.5, a=0.02, rel=1.2, bright=2600), CL, 0.13)

# ================================ mix (as focus_audio.py) ================================
duck = np.ones(N); tt_ = np.arange(int(0.35 * SR)) / SR; shape = 1 - 0.55 * np.exp(-tt_ / 0.09)
for tk in KICKS:
    i = int(tk * SR); j = min(N, i + len(shape))
    if 0 <= i < N: duck[i:j] = np.minimum(duck[i:j], shape[: j - i])
L = BUS['mus'][0] * duck + BUS['drm'][0] + BUS['fx'][0] * (0.5 + 0.5 * duck)
R = BUS['mus'][1] * duck + BUS['drm'][1] + BUS['fx'][1] * (0.5 + 0.5 * duck)
# the freeze is a hard cut: the groove and pads stop dead on the frame, only the room rings on
cut = int(FZ * SR); held = int((FZ + BEAT / 2) * SR)
for ch in (L, R): ch[cut:held] *= np.linspace(1, 0, held - cut) ** 4
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
