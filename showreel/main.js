// AXIOMS — 15s showreel. Deterministic: every frame is a pure function of t.
// Grid: 128 BPM, 4/4, 8 bars = 32 beats = 15.000s. All timing is written in beats.
const W = 1080, H = 1920, BPM = 128, B = 60 / BPM, DUR = 15, FPS = 60;
const cv = document.getElementById('c');
const ctx = cv.getContext('2d');

// ---------- palette ----------
const BG = '#07070a', INK = '#F4F1EA', GOLD = '#FFB547', AMBER = '#FF7A1A', GREY = '#8A8A96';
const inkA = a => `rgba(244,241,234,${a})`;
const goldA = a => `rgba(255,181,71,${a})`;
const amberA = a => `rgba(255,122,26,${a})`;

// ---------- math ----------
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const E = {
  lin: t => t,
  outExpo: t => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  inExpo: t => (t <= 0 ? 0 : Math.pow(2, 10 * t - 10)),
  outCubic: t => 1 - Math.pow(1 - t, 3),
  inCubic: t => t * t * t,
  inQuad: t => t * t,
  inOutCubic: t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  outBack: t => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  outQuint: t => 1 - Math.pow(1 - t, 5),
};
const bt = b => b * B;                                   // beat -> seconds
const tw = (t, b0, b1, e = E.outExpo) => e(clamp((t - bt(b0)) / (bt(b1) - bt(b0)))); // beats window
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const noise1 = (x, s = 0) => Math.sin(x * 1.7 + s) * 0.5 + Math.sin(x * 3.1 + s * 2.3) * 0.3 + Math.sin(x * 7.3 + s * 0.7) * 0.2;

// ---------- sprites ----------
function makeGlow(r, stops) {
  const c = document.createElement('canvas'); c.width = c.height = r * 2;
  const g = c.getContext('2d'); const gr = g.createRadialGradient(r, r, 0, r, r, r);
  stops.forEach(([o, col]) => gr.addColorStop(o, col)); g.fillStyle = gr; g.fillRect(0, 0, r * 2, r * 2); return c;
}
const GLOW_GOLD = makeGlow(128, [[0, 'rgba(255,240,210,1)'], [0.12, 'rgba(255,190,90,0.9)'], [0.4, 'rgba(255,122,26,0.28)'], [1, 'rgba(255,90,10,0)']]);
const GLOW_INK = makeGlow(128, [[0, 'rgba(255,255,255,1)'], [0.2, 'rgba(244,241,234,0.5)'], [1, 'rgba(244,241,234,0)']]);
function glow(x, y, r, a = 1, spr = GLOW_GOLD) {
  if (a <= 0 || r <= 0) return;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = clamp(a);
  ctx.drawImage(spr, x - r, y - r, r * 2, r * 2); ctx.restore();
}
const GRAIN = [0, 1, 2, 3].map(i => {
  const c = document.createElement('canvas'); c.width = 540; c.height = 960;
  const g = c.getContext('2d'); const d = g.createImageData(540, 960); const R = rng(99 + i);
  for (let k = 0; k < d.data.length; k += 4) { const v = R() * 255; d.data[k] = d.data[k + 1] = d.data[k + 2] = v; d.data[k + 3] = 255; }
  g.putImageData(d, 0, 0); return c;
});
const buf = document.createElement('canvas'); buf.width = W; buf.height = H;

// ---------- type ----------
const F = (w, s, fam = 'Inter Tight', style = '') => `${style} ${w} ${s}px "${fam}"`.trim();
const SERIF = s => F(400, s, 'Instrument Serif', 'italic');
const MONO = s => F(500, s, 'JetBrains Mono');
// segs: [{t, f, c, ls}] drawn as one centered line. Returns width.
function line(segs, x, y, o = {}) {
  const { align = 'center', alpha = 1 } = o;
  ctx.save(); ctx.globalAlpha *= alpha; ctx.textBaseline = 'alphabetic';
  let total = 0;
  const ws = segs.map(s => { ctx.font = s.f; ctx.letterSpacing = (s.ls || 0) + 'px'; const w = ctx.measureText(s.t).width; total += w; return w; });
  let cx = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x;
  segs.forEach((s, i) => {
    ctx.font = s.f; ctx.letterSpacing = (s.ls || 0) + 'px'; ctx.fillStyle = s.c;
    if (s.glow) { ctx.shadowColor = s.glow; ctx.shadowBlur = s.gb || 40; } else ctx.shadowBlur = 0;
    ctx.fillText(s.t, cx, y); cx += ws[i];
  });
  ctx.restore(); return total;
}
// masked slide-up reveal of a line; p in 0..1
function reveal(segs, x, y, size, p, o = {}) {
  if (p <= 0) return;
  const q = E.outExpo(p);
  ctx.save();
  ctx.beginPath(); ctx.rect(0, y - size * 1.05, W, size * 1.4); ctx.clip();
  line(segs, x, y + (1 - q) * size * 1.1, { ...o, alpha: (o.alpha ?? 1) * clamp(p * 4) });
  ctx.restore();
}
function fitSize(text, font, max, maxW) { let s = max; ctx.font = font(s); while (ctx.measureText(text).width > maxW && s > 20) { s -= 2; ctx.font = font(s); } return s; }

function rrect(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }

// ======================================================================
// HOOK WORLD (b0–b4): attention core gets torn apart by distractions
// ======================================================================
const CORE = { x: 540, y: 1150 };
const FR = [
  ['badge', 'Slack', '12 new'], ['pill', 'Inbox', '1,284 unread'], ['tab', 'New Tab'], ['pill', 'Reminder', 'Meeting in 5 min'],
  ['pill', 'todo.md', '37 items'], ['tab', 'How to focus better'], ['pill', 'YouTube', 'Watch later (212)'], ['badge', 'Messages', 'can you just…'],
  ['pill', 'Side project', 'v3 · 40% done'], ['tab', 'Learn Rust in 30 days'], ['pill', 'Idea', 'what if I also…'], ['pill', 'Calendar', '3 conflicts'],
  ['tab', 'Untitled document'], ['pill', 'Feed', 'just one more scroll'], ['badge', 'Mail', 'Re: Re: Fwd:'], ['tab', 'Pricing — compare'],
  ['pill', 'Draft', 'unsaved changes'], ['pill', 'Course', 'Lesson 2 of 48'], ['badge', 'Group chat', '99+'], ['pill', 'Deadline', 'tomorrow'],
  ['tab', 'Stack Overflow'], ['pill', 'News', 'you won’t believe…'],
];
const frags = (() => {
  const R = rng(7); const n = FR.length;
  return FR.map((d, i) => {
    const arrive = 0.8 + (i / n) * 3.0 + R() * 0.12;            // beats
    const a = (i * 2.399963) % (Math.PI * 2);                     // golden-angle spread
    const rad = 230 + R() * 330;
    let ex = CORE.x + Math.cos(a) * rad * 1.05, ey = CORE.y + Math.sin(a) * rad * 0.95;
    ey = clamp(ey, 860, 1660);
    const sa = a + (R() - 0.5) * 0.6;
    return { d, i, arrive, sx: CORE.x + Math.cos(sa) * 1500, sy: CORE.y + Math.sin(sa) * 1500, ex, ey, rot: (R() - 0.5) * 0.18, ph: R() * 10 };
  });
})();
const PN = 260;
const parts = (() => {
  const R = rng(11);
  return Array.from({ length: PN }, (_, i) => {
    const f = frags[i % frags.length];
    return { f, rel: f.arrive + 0.05 + R() * 0.35, ox: (R() - 0.5) * 120, oy: (R() - 0.5) * 70, sz: 1.5 + R() * 3.5, ph: R() * 10, bend: (R() - 0.5) * 260, d: R() * 0.4 };
  });
})();
const chaosAt = t => tw(t, 0.6, 4, E.inQuad);

function fragPos(f, t) {
  const tb = t / B; const q = E.outExpo(clamp((tb - (f.arrive - 0.45)) / 0.45));
  const c = chaosAt(t);
  const jx = noise1(t * 3 + f.ph, f.ph) * 22 * c, jy = noise1(t * 3.3 + f.ph * 2, f.ph) * 22 * c;
  return { x: lerp(f.sx, f.ex, q) + jx, y: lerp(f.sy, f.ey, q) + jy, q, rot: f.rot * (1 + c * 2 * noise1(t * 2 + f.ph)) };
}
function partPos(p, t) {
  const tb = t / B; const a = clamp((tb - p.rel) / 0.7); if (a <= 0) return null;
  const fp = fragPos(p.f, t); const e = E.outCubic(a);
  const tx = fp.x + p.ox, ty = fp.y + p.oy;
  const mx = (CORE.x + tx) / 2 + p.bend * 0.4, my = (CORE.y + ty) / 2 - p.bend * 0.3;  // quadratic bezier
  const x = (1 - e) * (1 - e) * CORE.x + 2 * (1 - e) * e * mx + e * e * tx;
  const y = (1 - e) * (1 - e) * CORE.y + 2 * (1 - e) * e * my + e * e * ty;
  return { x: x + Math.sin(t * 4 + p.ph) * 6 * e, y: y + Math.cos(t * 5 + p.ph) * 6 * e, e };
}
function stolen(t) { let n = 0; for (const p of parts) if (t / B > p.rel) n++; return n / PN; }

function drawCard(f, x, y, rot, scale, mono, alpha) {
  const [type, title, sub] = f.d;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(scale, scale); ctx.globalAlpha *= alpha;
  ctx.font = F(500, 26, 'Inter'); const tw1 = ctx.measureText(title).width;
  ctx.font = F(400, 24, 'Inter'); const tw2 = sub ? ctx.measureText(sub).width : 0;
  const w = 44 + tw1 + (sub ? 16 + tw2 : 0) + (type === 'tab' ? 40 : 28), h = type === 'tab' ? 58 : 64;
  ctx.translate(-w / 2, -h / 2);
  if (type === 'tab') { ctx.beginPath(); ctx.roundRect(0, 0, w, h, [16, 16, 0, 0]); }
  else rrect(0, 0, w, h, 32);
  ctx.fillStyle = mono ? 'rgba(30,30,34,0.7)' : 'rgba(26,26,32,0.94)'; ctx.fill();
  ctx.strokeStyle = mono ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.14)'; ctx.lineWidth = 2; ctx.stroke();
  // icon
  ctx.beginPath(); ctx.arc(30, h / 2, type === 'badge' ? 11 : 8, 0, Math.PI * 2);
  ctx.fillStyle = mono ? '#555' : type === 'badge' ? '#FF3B30' : type === 'tab' ? '#7C8CFF' : GOLD; ctx.fill();
  ctx.textBaseline = 'middle';
  ctx.font = F(500, 26, 'Inter'); ctx.fillStyle = mono ? '#777' : INK; ctx.fillText(title, 50, h / 2 + 1);
  if (sub) { ctx.font = F(400, 24, 'Inter'); ctx.fillStyle = mono ? '#555' : 'rgba(244,241,234,0.55)'; ctx.fillText(sub, 50 + tw1 + 16, h / 2 + 1); }
  if (type === 'tab') { ctx.strokeStyle = mono ? '#555' : 'rgba(244,241,234,0.5)'; ctx.lineWidth = 2; const xx = w - 28, yy = h / 2; ctx.beginPath(); ctx.moveTo(xx - 7, yy - 7); ctx.lineTo(xx + 7, yy + 7); ctx.moveTo(xx + 7, yy - 7); ctx.lineTo(xx - 7, yy + 7); ctx.stroke(); }
  ctx.restore();
}

// Draws the hook world at time t. mono = frozen/greyed. implode (0..1) sucks everything to target.
function drawHookWorld(t, { mono = false, alpha = 1, implode = 0, target = CORE } = {}) {
  const tb = t / B, c = chaosAt(t), st = stolen(t);
  ctx.save(); ctx.globalAlpha = alpha;
  // threads
  for (const f of frags) {
    const fp = fragPos(f, t); if (fp.q < 0.6) continue;
    const q = implode ? 1 - E.inExpo(implode) : 1;
    ctx.strokeStyle = mono ? `rgba(140,140,150,${0.18 * q})` : amberA(0.22 + 0.2 * c);
    ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(CORE.x, CORE.y);
    ctx.quadraticCurveTo((CORE.x + fp.x) / 2 + noise1(t * 5 + f.ph) * 40 * c, (CORE.y + fp.y) / 2 + 30, fp.x, fp.y); ctx.stroke();
  }
  // cards
  const R = rng(3);
  for (const f of frags) {
    const fp = fragPos(f, t); if (tb < f.arrive - 0.45) continue;
    const d = R() * 0.35;
    const k = implode ? E.inExpo(clamp((implode - d) / (1 - d))) : 0;
    const x = lerp(fp.x, target.x, k), y = lerp(fp.y, target.y, k);
    const pop = E.outBack(clamp((tb - (f.arrive - 0.1)) / 0.35));
    drawCard(f, x, y, fp.rot * (1 - k), (0.82 + 0.18 * pop) * (1 - k * 0.95), mono, 1 - k * 0.6);
  }
  // particles
  for (const p of parts) {
    const pp = partPos(p, t); if (!pp) continue;
    const k = implode ? E.inExpo(clamp((implode - p.d) / (1 - p.d))) : 0;
    const x = lerp(pp.x, target.x, k), y = lerp(pp.y, target.y, k);
    if (mono && k < 0.5) { ctx.fillStyle = `rgba(150,150,160,${0.45})`; ctx.beginPath(); ctx.arc(x, y, p.sz * 0.8, 0, 7); ctx.fill(); }
    else glow(x, y, p.sz * (mono ? 5 : 7), mono ? k : 0.75 * pp.e);
  }
  // core
  if (!mono && !implode) {
    const ign = E.outBack(tw(t, 0, 0.35, E.lin));
    const r = 58 * (1 - 0.72 * st) * ign * (1 + 0.06 * Math.sin(t * 30) * c);
    glow(CORE.x, CORE.y, r * 5.5, 1); glow(CORE.x, CORE.y, r * 1.6, 1, GLOW_INK);
    const ring = tw(t, 0, 0.8); if (ring < 1) { ctx.strokeStyle = goldA(1 - ring); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(CORE.x, CORE.y, 60 + ring * 300, 0, 7); ctx.stroke(); }
  } else if (mono && !implode) {
    ctx.fillStyle = 'rgba(160,160,170,0.5)'; ctx.beginPath(); ctx.arc(CORE.x, CORE.y, 58 * (1 - 0.72 * st), 0, 7); ctx.fill();
  }
  ctx.restore();
}

function sceneHook(t) {
  drawHookWorld(t);
  const c = chaosAt(t);
  // "You have a goal." — the goal dims as chaos grows
  const goalA = 1 - 0.65 * c;
  reveal([{ t: 'You have a ', f: F(800, 88), c: INK }, { t: 'goal.', f: SERIF(150), c: goldA(goalA), glow: amberA(0.6 * goalA), gb: 50 }], 540, 560, 150, tw(t, 0.1, 0.9, E.lin));
  // "And 47 tabs open." — counter races up
  const n = Math.round(lerp(3, 47, tw(t, 2, 3.6, E.inQuad)));
  const shake = t / B > 3 ? noise1(t * 40, 3) * 8 * c : 0;
  reveal([{ t: 'And ', f: F(800, 76), c: inkA(0.9) }, { t: String(n), f: F(900, 76), c: '#FF4D2E' }, { t: ' tabs open.', f: F(800, 76), c: inkA(0.9) }], 540 + shake, 700, 76, tw(t, 2, 2.6, E.lin));
}

// ======================================================================
// FREEZE (b4–b8): silence. "Focus runs out." Fuel drains in ticks.
// ======================================================================
const TF = bt(4) - 1e-4;
function fuelLevel(t) {
  const steps = [[4.5, 100], [5.5, 81], [6.5, 58], [7.25, 36], [7.75, 17]];
  let v = 100; for (let i = 1; i < steps.length; i++) { const [b, lv] = steps[i]; v = lerp(v, lv, tw(t, b, b + 0.2)); } return v;
}
function sceneFreeze(t) {
  const out = tw(t, 7.8, 8.2, E.inCubic);
  ctx.save(); const z = lerp(1, 0.93, tw(t, 4, 8, E.outCubic));
  ctx.translate(540, 1150); ctx.scale(z, z); ctx.translate(-540, -1150);
  drawHookWorld(TF, { mono: true, alpha: lerp(0.9, 0.35, tw(t, 4, 5)) });
  ctx.restore();
  const a = 1 - out;
  reveal([{ t: 'Focus', f: F(800, 100), c: INK }], 540, 560, 100, tw(t, 4.5, 5.1, E.lin), { alpha: a });
  reveal([{ t: 'runs out.', f: SERIF(230), c: INK, glow: inkA(0.25), gb: 30 }], 540, 780, 230, tw(t, 5.5, 6.1, E.lin), { alpha: a });
  // fuel bar
  const g = tw(t, 4.25, 4.9); if (g <= 0) return;
  const bw = 720 * g, bx = 540 - bw / 2, by = 1010, lv = fuelLevel(t) / 100;
  ctx.save(); ctx.globalAlpha = a;
  ctx.strokeStyle = inkA(0.35); ctx.lineWidth = 2; rrect(bx, by, bw, 26, 13); ctx.stroke();
  const low = lv < 0.4; const flick = low ? 0.75 + 0.25 * Math.sign(Math.sin(t * 60)) : 1;
  const fw = Math.max(0, (bw - 8) * lv);
  const gr = ctx.createLinearGradient(bx, 0, bx + bw, 0); gr.addColorStop(0, low ? '#FF3B1A' : AMBER); gr.addColorStop(1, low ? '#FF7A1A' : GOLD);
  ctx.fillStyle = gr; ctx.globalAlpha = a * flick; rrect(bx + 4, by + 4, fw, 18, 9); ctx.fill();
  glow(bx + 4 + fw, by + 13, 60, 0.7 * a * flick);
  ctx.globalAlpha = a * g;
  line([{ t: 'ATTENTION', f: MONO(26), c: inkA(0.6), ls: 8 }], bx, by - 26, { align: 'left' });
  line([{ t: `${Math.round(lv * 100)}%`, f: MONO(26), c: low ? '#FF5A3A' : GOLD, ls: 2 }], bx + bw, by - 26, { align: 'right' });
  // beat ticks under the bar
  for (let i = 0; i < 16; i++) { const on = t / B > 4.5 + i * 0.25; ctx.fillStyle = on ? inkA(0.5) : inkA(0.12); ctx.fillRect(bx + i * (bw / 16), by + 44, 2, i % 4 ? 8 : 16); }
  ctx.restore();
}

// ======================================================================
// REFRAME (b8–b13.5): everything collapses into one beam toward the goal
// ======================================================================
const YOU = { x: 540, y: 1560 }, GOAL = { x: 540, y: 300 };
function drawAnchor(x, y, p, a = 1, label = true) {
  if (p <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  [44, 84, 124].forEach((r, i) => {
    const q = E.outExpo(clamp(p * 1.6 - i * 0.2));
    ctx.strokeStyle = i === 0 ? GOLD : inkA(0.55 - i * 0.12); ctx.lineWidth = i === 0 ? 4 : 2;
    ctx.beginPath(); ctx.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * q); ctx.stroke();
  });
  glow(x, y, 70 * E.outExpo(p), 0.9);
  if (label) line([{ t: 'THE GOAL', f: MONO(24), c: goldA(clamp(p * 2 - 0.6)), ls: 8 }], x, y + 190, {});
  ctx.restore();
}
function beam(x0, y0, x1, y1, p, a = 1, w = 6) {
  if (p <= 0) return;
  const xe = lerp(x0, x1, p), ye = lerp(y0, y1, p);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a;
  const g = ctx.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, 'rgba(255,200,120,0.95)'); g.addColorStop(1, 'rgba(255,122,26,0.5)');
  ctx.strokeStyle = g; ctx.lineCap = 'round';
  ctx.lineWidth = w * 6; ctx.globalAlpha = a * 0.12; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(xe, ye); ctx.stroke();
  ctx.lineWidth = w; ctx.globalAlpha = a; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(xe, ye); ctx.stroke();
  ctx.restore();
}
function sceneReframe(t) {
  const tb = t / B;
  const imp = tw(t, 8, 9, E.lin);
  if (imp < 1) drawHookWorld(TF, { mono: true, alpha: 0.6 + 0.4 * imp, implode: imp, target: YOU });
  const ign = tw(t, 9, 9.4);
  const push = lerp(1, 1.035, tw(t, 9, 13.5, E.inOutCubic));
  ctx.save(); ctx.translate(540, 960); ctx.scale(push, push); ctx.translate(-540, -960);
  // beam + pulses on every beat
  const bp = tw(t, 9, 9.5);
  beam(YOU.x, YOU.y, GOAL.x, GOAL.y, bp, 1);
  for (let k = 9.5; k < 13.5; k += 1) {
    const q = tw(t, k, k + 1, E.inOutCubic); if (q <= 0 || q >= 1) continue;
    glow(YOU.x, lerp(YOU.y, GOAL.y, q), 60, 0.9 * Math.sin(q * Math.PI));
  }
  drawAnchor(GOAL.x, GOAL.y, tw(t, 9.2, 10.4, E.lin));
  if (ign > 0) {
    const r = 46 * E.outBack(ign) * (1 + 0.08 * Math.sin(tb * Math.PI * 2));
    glow(YOU.x, YOU.y, r * 6 + (1 - ign) * 400, 1); glow(YOU.x, YOU.y, r * 1.5, 1, GLOW_INK);
    line([{ t: 'YOU', f: MONO(24), c: inkA(0.7 * clamp(ign * 2 - 0.5)), ls: 8 }], YOU.x, YOU.y + 110, {});
  }
  ctx.restore();
  // shockwave on ignition
  const sw = tw(t, 9, 10, E.outCubic); if (sw > 0 && sw < 1) { ctx.strokeStyle = goldA(0.8 * (1 - sw)); ctx.lineWidth = 6 * (1 - sw) + 1; ctx.beginPath(); ctx.arc(YOU.x, YOU.y, 40 + sw * 900, 0, 7); ctx.stroke(); }
  // title — dark halo keeps it readable over the beam
  const ta = tw(t, 9.2, 9.8, E.lin);
  if (ta > 0) { ctx.save(); const g = ctx.createRadialGradient(540, 960, 50, 540, 960, 520); g.addColorStop(0, `rgba(7,7,10,${0.85 * ta})`); g.addColorStop(1, 'rgba(7,7,10,0)'); ctx.fillStyle = g; ctx.fillRect(0, 500, W, 900); ctx.restore(); }
  reveal([{ t: 'Attention is', f: F(800, 104), c: INK }], 540, 900, 104, tw(t, 9.25, 9.9, E.lin));
  reveal([{ t: 'all you need.', f: SERIF(200), c: GOLD, glow: amberA(0.7), gb: 60 }], 540, 1090, 200, tw(t, 10, 10.6, E.lin));
}

// ======================================================================
// SEVEN AXIOMS (b13.5–b24): 1.5 beats each, one visual verb per law
// ======================================================================
const AX0 = 13.5, AXD = 1.5;
const VC = { x: 540, y: 1150 };
const AX = [
  ['I', 'OUTCOME-DRIVEN', 'Aim first.', axOutcome],
  ['II', 'GROUNDING', 'Test against reality.', axGround],
  ['III', 'SEPARATION OF CONCERNS', 'Cut clean seams.', axSoc],
  ['IV', 'ATOMIC', 'One unit, one goal.', axAtomic],
  ['V', 'BOUNDARY', 'Own your edge.', axBoundary],
  ['VI', 'LEVERAGE', 'Reach, don’t rebuild.', axLeverage],
  ['VII', 'SINGLE SOURCE OF TRUTH', 'One truth, one home.', axSsot],
];
function axOutcome(p, t) {
  const q = E.outExpo(clamp(p / 0.5)), cx = VC.x, cy = VC.y - 60;
  const R = rng(21);
  for (let i = 0; i < 7; i++) {
    const sx = cx + (i - 3) * 110, sy = cy + 440, ph = R() * 10, amp = (90 + R() * 80) * (1 - q), main = i === 3;
    ctx.beginPath();
    for (let s = 0; s <= 40; s++) {
      const u = s / 40; const bx = lerp(sx, cx, u), by = lerp(sy, cy, u);
      const off = Math.sin(u * 9 + ph + t * 6) * amp * Math.sin(u * Math.PI) + (R() - 0.5) * 0;
      s ? ctx.lineTo(bx + off, by) : ctx.moveTo(bx + off, by);
    }
    ctx.strokeStyle = main ? GOLD : inkA(0.25 + 0.35 * q); ctx.lineWidth = main ? 5 : 2.5; ctx.stroke();
  }
  const snap = 1 + 0.5 * (1 - E.outBack(clamp((p - 0.25) / 0.3)));
  ctx.save(); ctx.translate(cx, cy); ctx.scale(snap, snap);
  [60, 115, 170].forEach((r, i) => { ctx.strokeStyle = i ? inkA(0.6 - i * 0.15) : GOLD; ctx.lineWidth = i ? 2.5 : 5; ctx.beginPath(); ctx.arc(0, 0, r, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI * q); ctx.stroke(); });
  ctx.strokeStyle = INK; ctx.lineWidth = 3;
  [[0, -1], [0, 1], [-1, 0], [1, 0]].forEach(([dx, dy]) => { ctx.beginPath(); ctx.moveTo(dx * 190, dy * 190); ctx.lineTo(dx * 230, dy * 230); ctx.stroke(); });
  ctx.restore(); glow(cx, cy, 90 * q, 1);
}
function axGround(p, t) {
  const cx = VC.x, gy = VC.y + 200, land = 0.3;
  ctx.strokeStyle = inkA(0.6); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx - 400, gy); ctx.lineTo(cx + 400, gy); ctx.stroke();
  for (let i = -8; i <= 8; i++) { ctx.beginPath(); ctx.moveTo(cx + i * 50, gy); ctx.lineTo(cx + i * 50 - 22, gy + 22); ctx.strokeStyle = inkA(0.15); ctx.lineWidth = 2; ctx.stroke(); }
  const fall = E.inCubic(clamp(p / land)), after = clamp((p - land) / 0.3);
  const bounce = after > 0 ? -Math.sin(after * Math.PI) * 30 * (1 - after) : 0;
  const s = 180, y = lerp(VC.y - 330, gy - s / 2, fall) + bounce;
  ctx.globalAlpha = clamp(p / 0.08);
  const squash = after > 0 ? 1 + 0.18 * Math.sin(clamp(after * 3) * Math.PI) * (1 - after) : 1;
  ctx.save(); ctx.translate(cx, y + s / 2); ctx.scale(squash, 1 / squash); ctx.translate(0, -s / 2);
  if (after <= 0) {
    ctx.setLineDash([14, 10]); ctx.strokeStyle = inkA(0.7); ctx.lineWidth = 3; rrect(-s / 2, -s / 2, s, s, 18); ctx.stroke(); ctx.setLineDash([]);
    line([{ t: '?', f: SERIF(140), c: inkA(0.7) }], 0, 45, {});
  } else {
    ctx.fillStyle = GOLD; rrect(-s / 2, -s / 2, s, s, 18); ctx.fill();
    ctx.strokeStyle = BG; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const ck = E.outExpo(clamp(after * 2)); ctx.beginPath(); ctx.moveTo(-45, 0); ctx.lineTo(lerp(-45, -12, clamp(ck * 2)), lerp(0, 34, clamp(ck * 2)));
    if (ck > 0.5) ctx.lineTo(lerp(-12, 50, (ck - 0.5) * 2), lerp(34, -36, (ck - 0.5) * 2)); ctx.stroke();
  }
  ctx.restore(); ctx.globalAlpha = 1;
  if (after > 0) { glow(cx, gy - s / 2, 260 * (1 - after * 0.5), 0.5 * (1 - after));
    for (let k = 0; k < 3; k++) { const r = E.outCubic(clamp((p - land - k * 0.08) / 0.5)); if (r <= 0) continue; ctx.strokeStyle = goldA(0.8 * (1 - r)); ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(cx, gy, 100 + r * 380, 12 + r * 40, 0, 0, 7); ctx.stroke(); } }
  line([{ t: after > 0 ? 'KNOWN' : 'ASSUMED', f: MONO(26), c: after > 0 ? GOLD : inkA(0.5), ls: 8 }], cx, gy + 90, {});
}
function axSoc(p, t) {
  const cut = 0.28, q = E.outExpo(clamp((p - cut) / 0.4)), cx = VC.x, cy = VC.y;
  const cols = [GOLD, INK, GREY];
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    for (let s = 0; s <= 60; s++) {
      const u = s / 60, x = cx - 400 + u * 800;
      const tang = cy + Math.sin(u * 7 + i * 2.1 + t * 3) * 170 * Math.sin(u * Math.PI) + Math.cos(u * 13 + i) * 40;
      const lane = cy + (i - 1) * 150;
      s ? ctx.lineTo(x, lerp(tang, lane, q)) : ctx.moveTo(x, lerp(tang, lane, q));
    }
    ctx.strokeStyle = cols[i]; ctx.lineWidth = i ? 5 : 7; ctx.lineCap = 'round'; ctx.stroke();
  }
  // blade sweep
  const bl = clamp((p - 0.1) / (cut - 0.1));
  if (bl > 0 && bl < 1) { const x = lerp(cx - 480, cx + 480, E.inOutCubic(bl)); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = 'rgba(255,255,255,0.95)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x - 140, cy - 300); ctx.lineTo(x + 140, cy + 300); ctx.stroke(); ctx.restore(); glow(x, cy, 160, 0.7, GLOW_INK); }
  if (q > 0) { ctx.save(); ctx.setLineDash([10, 12]); ctx.strokeStyle = inkA(0.3 * q); ctx.lineWidth = 2; [-75, 75].forEach(d => { ctx.beginPath(); ctx.moveTo(cx - 420, cy + d); ctx.lineTo(cx - 420 + 840 * q, cy + d); ctx.stroke(); }); ctx.restore(); }
}
function axAtomic(p, t) {
  const cx = VC.x, cy = VC.y, cell = 90; const R = rng(41);
  const merge = E.outExpo(clamp((p - 0.45) / 0.25));
  for (let i = 0; i < 9; i++) {
    const gx = (i % 3 - 1), gy = (Math.floor(i / 3) - 1);
    const a = R() * Math.PI * 2, rr = 280 + R() * 200, rot = (R() - 0.5) * 3;
    const q = E.outExpo(clamp((p - i * 0.025) / 0.35));
    const gap = lerp(10, 0, merge);
    const x = lerp(cx + Math.cos(a) * rr, cx + gx * (cell + gap), q), y = lerp(cy + Math.sin(a) * rr, cy + gy * (cell + gap), q);
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot * (1 - q));
    ctx.fillStyle = merge > 0 ? GOLD : inkA(0.85); ctx.globalAlpha = merge > 0 ? 1 : 0.9;
    ctx.fillRect(-cell / 2 - merge * 0.6, -cell / 2 - merge * 0.6, cell + merge * 1.2, cell + merge * 1.2); ctx.restore();
  }
  if (merge > 0) {
    const s = cell * 3; glow(cx, cy, 300, 0.45 * merge);
    const r = E.outCubic(clamp((p - 0.45) / 0.5)); ctx.strokeStyle = goldA(1 - r); ctx.lineWidth = 4; ctx.strokeRect(cx - s / 2 - r * 120, cy - s / 2 - r * 120, s + r * 240, s + r * 240);
  }
}
function axBoundary(p, t) {
  const cx = VC.x, cy = VC.y, R0 = 230;
  const q = E.outExpo(clamp(p / 0.3));
  ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(cx, cy, R0, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI * q); ctx.stroke();
  glow(cx, cy, 120, 0.9); ctx.fillStyle = '#FFE3B0'; ctx.beginPath(); ctx.arc(cx, cy, 16, 0, 7); ctx.fill();
  for (let i = 0; i < 6; i++) {
    const a = -Math.PI / 2 + i * Math.PI / 3 + 0.3;
    const s1 = E.inCubic(clamp((p - 0.12 - i * 0.02) / 0.25)), s2 = E.outCubic(clamp((p - 0.37 - i * 0.02) / 0.35));
    const ox = cx + Math.cos(a) * 470, oy = cy + Math.sin(a) * 440, hx = cx + Math.cos(a) * R0, hy = cy + Math.sin(a) * R0;
    const a2 = a + 0.55, ex = cx + Math.cos(a2) * 440, ey = cy + Math.sin(a2) * 400;
    ctx.strokeStyle = inkA(0.3); ctx.lineWidth = 2;
    if (s1 > 0) { ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(lerp(ox, hx, s1), lerp(oy, hy, s1)); ctx.stroke(); }
    let dx = lerp(ox, hx, s1), dy = lerp(oy, hy, s1);
    if (s2 > 0) {
      ctx.strokeStyle = goldA(0.9); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(hx, hy);
      const mx = cx + Math.cos(a + 0.3) * (R0 + 40), my = cy + Math.sin(a + 0.3) * (R0 + 40);
      const N = 20; for (let k = 1; k <= N * s2; k++) { const u = k / N; const bx = (1 - u) * (1 - u) * hx + 2 * (1 - u) * u * mx + u * u * ex, by = (1 - u) * (1 - u) * hy + 2 * (1 - u) * u * my + u * u * ey; ctx.lineTo(bx, by); dx = bx; dy = by; }
      ctx.stroke();
      if (s2 > 0.95) { const ang = Math.atan2(ey - my, ex - mx); ctx.fillStyle = GOLD; ctx.beginPath(); ctx.moveTo(ex + Math.cos(ang) * 18, ey + Math.sin(ang) * 18); ctx.lineTo(ex + Math.cos(ang + 2.5) * 16, ey + Math.sin(ang + 2.5) * 16); ctx.lineTo(ex + Math.cos(ang - 2.5) * 16, ey + Math.sin(ang - 2.5) * 16); ctx.fill(); }
      const sp = clamp((p - 0.37 - i * 0.02) / 0.1); if (sp < 1) glow(hx, hy, 60, 1 - sp);
    }
    if (s1 > 0) { ctx.fillStyle = s2 > 0 ? GOLD : INK; ctx.beginPath(); ctx.arc(dx, dy, 9, 0, 7); ctx.fill(); }
  }
}
function axLeverage(p, t) {
  const cx = VC.x, cy = VC.y, N = 6;
  let lit = 0;
  for (let i = 0; i < N; i++) {
    const a = -Math.PI / 2 + i * 2 * Math.PI / N, nx = cx + Math.cos(a) * 330, ny = cy + Math.sin(a) * 330;
    const q = E.outExpo(clamp((p - 0.05 - i * 0.03) / 0.3));
    ctx.strokeStyle = goldA(0.35 + 0.4 * q); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(lerp(cx, nx, q), lerp(cy, ny, q)); ctx.stroke();
    const on = q > 0.95; if (on) lit++;
    ctx.beginPath(); ctx.arc(nx, ny, 30, 0, 7); ctx.fillStyle = on ? GOLD : 'rgba(40,40,46,1)'; ctx.fill(); ctx.strokeStyle = on ? GOLD : inkA(0.4); ctx.lineWidth = 2.5; ctx.stroke();
    if (on) { glow(nx, ny, 90, 0.6);
      for (let k = 0; k < 3; k++) { const f = ((p - 0.35) * 3 + k / 3) % 1; if (p < 0.35) continue; glow(lerp(nx, cx, f), lerp(ny, cy, f), 36, 0.9); } }
  }
  const r = 26 + lit * 9 + (p > 0.4 ? 6 * Math.sin(t * 20) : 0);
  glow(cx, cy, r * 4.5, 1); glow(cx, cy, r * 1.2, 1, GLOW_INK);
}
function axSsot(p, t) {
  const cx = VC.x, cy = VC.y; const R = rng(71);
  const merge = E.outExpo(clamp((p - 0.5) / 0.3));
  const cards = Array.from({ length: 6 }, (_, i) => ({ x: cx + (R() - 0.5) * 760, y: cy + (R() - 0.5) * 560, r: (R() - 0.5) * 0.7, d: i * 0.04 }));
  cards.forEach((c, i) => {
    const q = E.inOutCubic(clamp((p - 0.08 - c.d) / 0.4));
    const x = lerp(c.x, cx, q), y = lerp(c.y, cy, q);
    if (q >= 1 && i > 0) return;
    ctx.save(); ctx.translate(x, y); ctx.rotate(c.r * (1 - q)); const sc = i === 0 ? 1 + 0.25 * merge : 1; ctx.scale(sc, sc);
    ctx.fillStyle = 'rgba(26,26,32,0.96)'; rrect(-75, -95, 150, 190, 14); ctx.fill();
    ctx.strokeStyle = i === 0 && merge > 0 ? GOLD : inkA(0.35); ctx.lineWidth = i === 0 && merge > 0 ? 4 : 2; ctx.stroke();
    for (let l = 0; l < 4; l++) { ctx.fillStyle = i === 0 && merge > 0 ? goldA(0.9) : inkA(i % 2 ? 0.25 : 0.45); ctx.fillRect(-50, -58 + l * 34, l === 3 ? 56 : 100, 10); }
    ctx.restore();
  });
  if (merge > 0) { glow(cx, cy, 320, 0.5 * merge); const r = E.outCubic(clamp((p - 0.5) / 0.45)); ctx.strokeStyle = goldA(0.8 * (1 - r)); ctx.lineWidth = 3; rrect(cx - 94 - r * 140, cy - 119 - r * 140, 188 + r * 280, 238 + r * 280, 20); ctx.stroke(); }
}
function sceneAxioms(t) {
  const tb = t / B, k = clamp(Math.floor((tb - AX0) / AXD), 0, 6), p = ((tb - AX0) - k * AXD) / AXD;
  const [num, name, head, fn] = AX[k];
  // faint spine from the reframe persists
  ctx.fillStyle = goldA(0.06); ctx.fillRect(538, 0, 4, H);
  const punch = 1 + 0.05 * (1 - E.outCubic(clamp(p / 0.35)));
  ctx.save(); ctx.translate(540, 960); ctx.scale(punch, punch); ctx.translate(-540, -960);
  fn(p, t);
  ctx.restore();
  line([{ t: `AXIOM ${num}`, f: MONO(28), c: inkA(0.5), ls: 8 }, { t: '  /  VII', f: MONO(28), c: inkA(0.2), ls: 8 }], 540, 350, {});
  line([{ t: name, f: MONO(32), c: GOLD, ls: 6 }], 540, 420, {});
  const hs = fitSize(head, s => F(900, s), 124, 940);
  reveal([{ t: head, f: F(900, hs), c: INK }], 540, 590, hs, clamp(p / 0.3));
  // progress
  for (let i = 0; i < 7; i++) { const x = 540 - (7 * 70 + 6 * 14) / 2 + i * 84; ctx.fillStyle = i < k ? goldA(0.6) : i === k ? GOLD : inkA(0.15); ctx.fillRect(x, 1640, 70, 6); }
  const fl = 1 - clamp(p / 0.12); if (fl > 0) { ctx.fillStyle = `rgba(255,236,200,${0.14 * fl})`; ctx.fillRect(0, 0, W, H); }
}

// ======================================================================
// LOOP (b24–b28): decide → act → result → learn, spiraling into the goal
// ======================================================================
const LOOP_NODES = ['DECIDE', 'ACT', 'RESULT', 'LEARN'];
function loopAngle(tb) { const u = clamp((tb - 24) / 4); return -Math.PI / 2 + Math.PI * 2 * (Math.pow(u, 1.8) * 5.5); }
function sceneLoop(t) {
  const tb = t / B;
  const fly = tw(t, 26.5, 28, E.inExpo);
  const cx = 540, cy = lerp(1150, GOAL.y, fly), R0 = lerp(250, 20, fly);
  drawAnchor(GOAL.x, GOAL.y, tw(t, 24, 25, E.lin), 1, false);
  beam(540, 1560, GOAL.x, GOAL.y, 1, 0.25 + 0.5 * fly, 4);
  // speed lines
  if (fly > 0) { const R = rng(Math.floor(tb * 16)); for (let i = 0; i < 26; i++) { const x = R() * W, y = R() * H, l = 120 + R() * 400 * fly; ctx.strokeStyle = inkA(0.25 * fly); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + l); ctx.stroke(); } }
  const ap = tw(t, 24, 24.6);
  ctx.strokeStyle = inkA(0.3 * ap); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, R0, 0, Math.PI * 2 * ap); ctx.stroke();
  const ang = loopAngle(tb);
  LOOP_NODES.forEach((n, i) => {
    const a = -Math.PI / 2 + i * Math.PI / 2, nx = cx + Math.cos(a) * R0, ny = cy + Math.sin(a) * R0;
    let d = ((ang - a) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2); const hit = Math.exp(-d * 3) * (tb > 24.1 ? 1 : 0);
    ctx.beginPath(); ctx.arc(nx, ny, 12, 0, 7); ctx.fillStyle = hit > 0.2 ? GOLD : inkA(0.5); ctx.fill();
    glow(nx, ny, 80, hit * 0.9);
    const lx = nx + Math.cos(a) * 78, ly = ny + Math.sin(a) * 60 + 10;
    line([{ t: n, f: MONO(30), c: hit > 0.2 ? GOLD : inkA(0.6), ls: 6 }], lx, ly, { align: i === 1 ? 'left' : i === 3 ? 'right' : 'center', alpha: ap * (1 - fly) });
  });
  // runner + trail
  for (let k = 14; k >= 0; k--) { const a = loopAngle(tb - k * 0.02); glow(cx + Math.cos(a) * R0, cy + Math.sin(a) * R0, 40 - k * 2, (1 - k / 15) * 0.8 * ap); }
  const ha = 1 - tw(t, 26.25, 26.75, E.lin);
  reveal([{ t: 'Loop until it ', f: F(900, 104), c: INK }, { t: 'lands.', f: SERIF(170), c: GOLD, glow: amberA(0.6), gb: 40 }], 540, 560, 170, tw(t, 24.1, 24.7, E.lin), { alpha: ha });
}

// ======================================================================
// END (b28–b32): impact, embers, "Burn it well."
// ======================================================================
const EMB = (() => { const R = rng(88); return Array.from({ length: 160 }, () => { const a = R() * Math.PI * 2, v = 300 + R() * 1400; return { vx: Math.cos(a) * v, vy: Math.sin(a) * v, s: 2 + R() * 5, life: 0.8 + R() * 1.4 }; }); })();
function sceneEnd(t) {
  const tb = t / B, dt = t - bt(28);
  for (const e of EMB) {
    const k = clamp(dt / e.life); if (k >= 1) continue;
    const drag = (1 - Math.exp(-dt * 3)) / 3;
    glow(GOAL.x + e.vx * drag, GOAL.y + e.vy * drag + 120 * dt * dt, e.s * 6, (1 - k) * 0.8);
  }
  for (let i = 0; i < 3; i++) { const r = tw(t, 28 + i * 0.15, 29.5 + i * 0.15, E.outCubic); if (r <= 0 || r >= 1) continue; ctx.strokeStyle = goldA(0.8 * (1 - r)); ctx.lineWidth = 8 * (1 - r) + 1; ctx.beginPath(); ctx.arc(GOAL.x, GOAL.y, r * 1400, 0, 7); ctx.stroke(); }
  const z = lerp(1, 1.04, tw(t, 28, 32, E.outCubic));
  ctx.save(); ctx.translate(540, 1000); ctx.scale(z, z); ctx.translate(-540, -1000);
  reveal([{ t: 'Burn it', f: F(900, 150), c: INK }], 540, 930, 150, tw(t, 28.25, 28.85, E.lin));
  reveal([{ t: 'well.', f: SERIF(300), c: GOLD, glow: amberA(0.8), gb: 70 }], 540, 1180, 300, tw(t, 28.75, 29.4, E.lin));
  const wm = tw(t, 29.75, 30.5, E.lin);
  if (wm > 0) {
    const pulse = 1 + 0.35 * Math.max(0, 1 - ((tb - 30) % 1) * 3) * (tb > 30 ? 1 : 0);
    reveal([{ t: 'AXIOMS', f: F(800, 46), c: INK, ls: 22 }], 552, 1440, 46, wm);
    glow(540, 1360, 30 * pulse * E.outExpo(wm), 1);
    line([{ t: 'Seven laws for spending attention.', f: MONO(24), c: inkA(0.45 * wm), ls: 3 }], 540, 1500, {});
  }
  ctx.restore();
  const fl = 1 - tw(t, 28, 28.45, E.outCubic); if (fl > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(255,200,130,${fl})`; ctx.fillRect(0, 0, W, H); ctx.restore(); glow(GOAL.x, GOAL.y, 900 * fl + 200, fl, GLOW_INK); }
}

// ======================================================================
// frame
// ======================================================================
function shakeAt(t) {
  const tb = t / B; let a = 0;
  if (tb < 4) a = 16 * Math.pow(chaosAt(t), 2);
  if (tb >= AX0 + 1 * AXD && tb < AX0 + 1.4 * AXD) a = 10 * (1 - (tb - AX0 - 1.3 * AXD) / (0.1 * AXD)) * (tb > AX0 + 1.3 * AXD ? 1 : 0);  // grounding impact
  if (tb >= 27 && tb < 28) a = 10 * tw(t, 27, 28, E.inQuad);
  if (tb >= 28 && tb < 29) a = 30 * (1 - tw(t, 28, 29, E.outCubic));
  return { x: noise1(t * 53, 1) * a, y: noise1(t * 47, 5) * a };
}
function renderFrame(t) {
  const tb = t / B;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
  const sh = shakeAt(t); ctx.save(); ctx.translate(sh.x, sh.y);
  if (tb < 4) sceneHook(t);
  else if (tb < 8) sceneFreeze(t);
  else if (tb < AX0) sceneReframe(t);
  else if (tb < 24) sceneAxioms(t);
  else if (tb < 28) sceneLoop(t);
  else sceneEnd(t);
  ctx.restore();
  // glitch slices at the peak of the hook
  if (tb > 3.2 && tb < 4) {
    const R = rng(Math.floor(t * 30)); const g = tw(t, 3.2, 4, E.inQuad);
    const bctx = buf.getContext('2d'); bctx.clearRect(0, 0, W, H); bctx.drawImage(cv, 0, 0);
    for (let i = 0; i < 10 * g; i++) { const y = R() * H, h = 8 + R() * 70, dx = (R() - 0.5) * 120 * g; ctx.drawImage(buf, 0, y, W, h, dx, y, W, h); }
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.18 * g; ctx.drawImage(buf, 8 * g, 0); ctx.restore();
  }
  // vignette + grain
  const v = ctx.createRadialGradient(540, 960, 500, 540, 960, 1250); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.6)');
  ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = 0.045; ctx.imageSmoothingEnabled = false;
  ctx.drawImage(GRAIN[Math.floor(t * 24) % 4], 0, 0, W, H); ctx.restore();
}
window.renderFrame = renderFrame;
window.__ready = document.fonts.ready.then(() => Promise.all(['800 10px "Inter Tight"', '900 10px "Inter Tight"', '500 10px Inter', '400 10px Inter', '500 10px "JetBrains Mono"', 'italic 400 10px "Instrument Serif"'].map(f => document.fonts.load(f)))).then(() => true);

// preview mode: play/loop in the browser (space = pause, ←/→ = scrub a beat)
if (!location.search.includes('render')) {
  let t0 = performance.now(), paused = false, tp = 0;
  addEventListener('keydown', e => { if (e.code === 'Space') { paused = !paused; t0 = performance.now() - tp * 1000; } if (e.code === 'ArrowRight') tp = Math.min(DUR, tp + B); if (e.code === 'ArrowLeft') tp = Math.max(0, tp - B); if (paused) renderFrame(tp); });
  window.__ready.then(() => { const loop = now => { if (!paused) { tp = ((now - t0) / 1000) % DUR; renderFrame(tp); } document.getElementById('hud').textContent = `t=${tp.toFixed(2)}s  beat=${(tp / B).toFixed(2)}  bar=${Math.floor(tp / B / 4) + 1}`; requestAnimationFrame(loop); }; requestAnimationFrame(loop); });
} else document.body.classList.add('render');
