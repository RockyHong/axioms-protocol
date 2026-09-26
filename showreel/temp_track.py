# Scratch/temp score, synthesized to the exact beat grid in cues.json. Not the final music:
# it exists to prove sync. Swap for a generated/licensed track built on the same cue sheet.
import json, wave
import numpy as np

SR = 44100
cues = json.load(open('cues.json'))
BPM = cues['bpm']; B = 60 / BPM; DUR = cues['duration_s']
N = int(SR * DUR) + SR * 2
L = np.zeros(N); Rr = np.zeros(N)
rng = np.random.default_rng(3)

def at(beat): return int(round(beat * B * SR))
def add(sig, beat, gain=1.0, pan=0.0):
    i = at(beat); j = min(N, i + len(sig)); s = sig[: j - i] * gain
    L[i:j] += s * (1 - max(0, pan)); Rr[i:j] += s * (1 + min(0, pan))
def env(n, a=0.002, d=0.2):
    t = np.arange(n) / SR; return np.minimum(1, t / a) * np.exp(-t / d)
def lp(x, k):  # one-pole low-pass, k in 0..1 (per-sample or scalar)
    y = np.zeros_like(x); acc = 0.0; k = np.broadcast_to(k, x.shape)
    for i in range(len(x)): acc += k[i] * (x[i] - acc); y[i] = acc
    return y
def hp(x, k): return x - lp(x, k)

def kick(dur=0.45, f0=160, f1=42, punch=1.0):
    n = int(dur * SR); t = np.arange(n) / SR
    f = f1 + (f0 - f1) * np.exp(-t * 28); ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * env(n, 0.001, dur / 3.5); s += punch * 0.3 * rng.standard_normal(n) * env(n, 0.0005, 0.004)
    return np.tanh(s * 1.6)
def boom(dur=2.5, f=38):
    n = int(dur * SR); t = np.arange(n) / SR
    s = np.sin(2 * np.pi * (f + 40 * np.exp(-t * 6)) * t) * env(n, 0.002, dur / 3)
    return np.tanh(s * 2.2) * 0.9
def noise_hit(dur, d, k=0.3, hpk=None):
    n = int(dur * SR); s = rng.standard_normal(n) * env(n, 0.0005, d)
    s = lp(s, k); return hp(s, hpk) if hpk else s
def clap():
    n = int(0.3 * SR); s = np.zeros(n)
    for o in (0, 0.009, 0.018): i = int(o * SR); s[i:] += rng.standard_normal(n - i) * env(n - i, 0.0005, 0.012 if o < 0.018 else 0.09)
    return hp(lp(s, 0.5), 0.08) * 0.8
def hat(d=0.03): return hp(rng.standard_normal(int(0.12 * SR)) * env(int(0.12 * SR), 0.0005, d), 0.6) * 0.35
def ping(f, d=0.18):
    n = int(0.5 * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * f * 2.01 * t)) * env(n, 0.001, d) * 0.25
def tick(): n = int(0.05 * SR); t = np.arange(n) / SR; return np.sin(2 * np.pi * 2400 * t) * env(n, 0.0005, 0.006) * 0.6
def pad(freqs, dur, a=0.4, rel=1.5, gain=0.12, bright=0.04):
    n = int(dur * SR); t = np.arange(n) / SR; s = np.zeros(n)
    for f in freqs:
        for det in (-0.12, 0, 0.13):
            s += 2 * ((t * f * (1 + det / 100)) % 1) - 1
    s = lp(s / (len(freqs) * 3), bright)
    e = np.minimum(1, t / a) * np.minimum(1, np.maximum(0, (dur - t) / rel)); return s * e * gain * 4
def riser(dur, f0=200, f1=2400, g=0.5):
    n = int(dur * SR); t = np.arange(n) / SR; u = t / dur
    no = lp(rng.standard_normal(n), 0.02 + 0.5 * u ** 2)
    f = f0 * (f1 / f0) ** u; tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.3
    return (no + tone) * (u ** 2.2) * g

# ---- HOOK b0–4: ignition, pings per distraction, driving kick, stutter
add(boom(1.2, 50), 0, 0.6); add(noise_hit(1.0, 0.25, 0.05), 0, 0.3)
for b in (1, 2, 3): add(kick(), b, 0.9)
for k in range(int(0.75 * 4), 16):
    add(hat(), k / 4, 0.4 + 0.6 * (k / 16))
notes = [1760, 2093, 2349, 2637, 1568, 1976]
for i in range(22):
    add(ping(notes[i % 6]), 0.8 + i / 22 * 3.0, 0.5 + 0.5 * i / 22, pan=((i * 37) % 11 - 5) / 6)
add(riser(bt := 2 * B, 150, 3000, 0.4), 2)
for k in range(8): add(kick(0.08, 200, 90, 0.5), 3.5 + k / 16, 0.5)
g = at(4); fd = int(0.008 * SR)                                  # hard stop: gate the hook's tails
for ch in (L, Rr): ch[g - fd:g] *= np.linspace(1, 0, fd); ch[g:] = 0
# ---- FREEZE b4–8: dead stop. Ticks on each fuel drain step. Soft thump on "finite."
for b in cues['freeze_ticks']: add(tick(), b, 1.0)
add(kick(0.9, 70, 35, 0), 5.5, 0.7)
add(pad([55, 82.4], 4 * B, a=1.5, rel=0.3, gain=0.05, bright=0.01), 4.5)
# ---- REFRAME: reverse swell into the drop at b9
add(riser(1 * B, 80, 1200, 0.9), 8)
add(boom(3.0, 36), 9, 1.0); add(kick(), 9, 1.0); add(noise_hit(1.5, 0.4, 0.1), 9, 0.25)
for b in (10, 11, 12, 13): add(kick(), b, 0.85)
for b in np.arange(9.5, 13.5, 1.0): add(hat(0.05), b, 0.6)
add(pad([110, 130.8, 164.8, 196], 4.5 * B + 10.5 * B, a=0.8, rel=0.4, gain=0.09, bright=0.05), 9)   # Am7 bed
# ---- AXIOMS: a hit every 1.5 beats (dotted-quarter)
for i, b in enumerate(cues['axiom_hits']):
    add(kick(0.5, 180, 40), b, 1.0); add(clap(), b, 0.55); add(ping(notes[i % 6] / 2, 0.3), b, 0.6)
for k in np.arange(13.5, 24, 0.5): add(hat(0.02), k, 0.35)
add(noise_hit(0.6, 0.12, 0.08), cues['axiom_hits'][1] + 0.45, 0.4)   # grounding: box lands
# ---- LOOP b24–28: node ticks accelerate, riser into impact
for b in cues['loop_node_hits']: add(ping(2637, 0.05), b, 0.45)
add(riser(4 * B, 120, 5000, 0.7), 24)
for b in (24, 25, 26, 27): add(kick(), b, 0.8)
# ---- IMPACT b28 + end card
add(boom(4.0, 34), 28, 1.2); add(kick(0.6, 220, 40), 28, 1.0); add(noise_hit(2.5, 0.6, 0.15), 28, 0.5)
add(pad([110, 164.8, 220, 261.6, 329.6], 4 * B + 1.2, a=0.05, rel=1.6, gain=0.1, bright=0.06), 28)
for b in (30, 31): add(kick(0.6, 90, 40, 0), b, 0.45)

# simple room: convolve with a decaying noise tail
ir_n = int(1.6 * SR); ir = rng.standard_normal(ir_n) * np.exp(-np.arange(ir_n) / SR / 0.35); ir[0] = 0
def verb(x): m = len(x) + ir_n; F = np.fft.rfft; return np.fft.irfft(F(x, m) * F(ir, m), m)[: len(x)]
L2 = L + 0.02 * verb(L); R2 = Rr + 0.02 * verb(Rr)
for ch in (L2, R2): ch[at(4):at(4.5)] = (L if ch is L2 else Rr)[at(4):at(4.5)]   # keep the stop dry
st = np.stack([L2, R2], 1)[: int(DUR * SR)]
fade = int(0.25 * SR); st[-fade:] *= np.linspace(1, 0, fade)[:, None]
st = st / np.max(np.abs(st)) * 0.89
with wave.open('temp_track.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype('<i2').tobytes())
print('ok', st.shape[0] / SR, 's')
