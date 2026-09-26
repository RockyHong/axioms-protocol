// AXIOMS — CONCEPT (~88s). The framework itself, between FOCUS (a story) and AXIOMS.md (the law):
// the fuel, the loop, the seven rules as a list you can hold in your head, recursion, the motto and the apex.
// Same visual language as FOCUS / HOOK: lime bracket = your attention, 12 pieces = finite.
// Layout never moves: the picture lives in the upper half, the caption sits just under it, and each rule,
// once explained, docks into the list below — the eye flows picture → caption → list, top to bottom.
// Deterministic: every frame is a pure function of t. Events sit on a 120 BPM grid (BEAT = 0.5s).
const W = 1080, H = 1920, DUR = 88;
window.DUR = DUR;
const cv = document.getElementById('c');
let ctx = cv.getContext('2d');

// ---------- palette ----------
const BG = '#07080C', LIME = '#C8FF2E', WHITE = '#F5F5F7', INK = '#07080C', RED = '#FF453A', GREY = '#8E8E93';
const ORANGE = '#FF9F0A', BLUE = '#0A84FF', CARD = 'rgba(34,36,46,0.97)';
const limeA = a => `rgba(200,255,46,${a})`;
const whiteA = a => `rgba(245,245,247,${a})`;

// ---------- math ----------
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const E = {
  lin: t => t,
  outExpo: t => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  outCubic: t => 1 - Math.pow(1 - t, 3),
  inCubic: t => t * t * t,
  inOutCubic: t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  inOutExpo: t => t <= 0 ? 0 : t >= 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2,
  outBack: t => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
};
const tw = (t, a, b, e = E.inOutCubic) => e(clamp((t - a) / (b - a)));
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

// ---------- type ----------
const F = (w, s, fam = 'Inter Tight') => `${w} ${s}px "${fam}"`;
const MONO = s => F(500, s, 'JetBrains Mono');
function text(str, x, y, font, color, { align = 'center', alpha = 1, ls = 0, blur = 0 } = {}) {
  if (alpha <= 0.003) return;
  ctx.save(); ctx.globalAlpha *= alpha; ctx.font = font; ctx.letterSpacing = ls + 'px';
  if (blur > 0.4) ctx.filter = `blur(${blur.toFixed(1)}px)`;
  ctx.textAlign = align; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = color; ctx.fillText(str, x, y); ctx.restore();
}
// Focus-in / focus-out caption (as FOCUS). lines: [[str, color, size?]].
function cap(t, tIn, tOut, lines, x, y, size, { gap = 0.18, stagger = 0.06, weight = 900, lh = 1.08, align = 'center', shadow = true, outDir = -1 } = {}) {
  if (t < tIn || t > tOut + 0.3) return;
  const q = clamp((t - tOut) / 0.28), qe = E.inCubic(q);
  let ly = y;
  lines.forEach(([str, color, sz = size], li) => {
    if (li) ly += sz * lh;
    const font = F(weight, sz); ctx.font = font; ctx.letterSpacing = '-2px';
    const words = str.split(' '), sp = ctx.measureText(' ').width;
    const ws = words.map(w => ctx.measureText(w).width), total = ws.reduce((a, b) => a + b, 0) + sp * (words.length - 1);
    let cx = align === 'center' ? x - total / 2 : x;
    words.forEach((w, i) => {
      const p = clamp((t - tIn - li * gap - i * stagger) / 0.26);
      if (p > 0) {
        const e = E.outBack(p), s = lerp(1.45, 1, e) * (1 + 0.12 * qe);
        const blur = (1 - E.outCubic(p)) * 16 + qe * 22, a = clamp(p * 3) * (1 - q);
        ctx.save(); ctx.globalAlpha = a; ctx.translate(cx + ws[i] / 2, ly + outDir * qe * 60); ctx.scale(s, s);
        if (blur > 0.4) ctx.filter = `blur(${blur.toFixed(1)}px)`;
        if (shadow) { ctx.shadowColor = 'rgba(0,0,0,0.85)'; ctx.shadowBlur = 40; }
        ctx.font = font; ctx.letterSpacing = '-2px'; ctx.textAlign = 'center'; ctx.fillStyle = color; ctx.fillText(w, 0, 0); ctx.restore();
      }
      cx += ws[i] + sp;
    });
  });
}
function burst(t, t0, x, y, r0, r1, n = 10, color = LIME, w = 6, dur = 0.4) {
  const p = (t - t0) / dur; if (p <= 0 || p >= 1) return;
  const e = E.outExpo(p); ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.globalAlpha = 1 - p;
  for (let i = 0; i < n; i++) { const a = i * Math.PI * 2 / n, ra = lerp(r0, r1, e * 0.7), rb = lerp(r0, r1, e); ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * ra, y + Math.sin(a) * ra); ctx.lineTo(x + Math.cos(a) * rb, y + Math.sin(a) * rb); ctx.stroke(); }
  ctx.restore();
}
function ring(t, t0, x, y, r0, r1, color = LIME, w = 8, dur = 0.5) {
  const p = (t - t0) / dur; if (p <= 0 || p >= 1) return;
  ctx.save(); ctx.strokeStyle = color; ctx.globalAlpha = 1 - p; ctx.lineWidth = w * (1 - p) + 1; ctx.beginPath(); ctx.arc(x, y, lerp(r0, r1, E.outExpo(p)), 0, 7); ctx.stroke(); ctx.restore();
}
function card(x, y, w, h, { rot = 0, s = 1, alpha = 1, border = 'rgba(255,255,255,0.10)', bw = 2, fill = CARD, r = 24 } = {}) {
  ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12;
  ctx.fillStyle = fill; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, r); ctx.fill();
  ctx.shadowColor = 'transparent'; ctx.strokeStyle = border; ctx.lineWidth = bw; ctx.stroke();
}
const endCard = () => ctx.restore();

// ======================================================================
// SCRIPT (seconds, on the 0.5s beat grid). Everything reads from these.
// ======================================================================
const BEAT = 0.5, S16 = BEAT / 4;
const G = { x: 540, y: 740 };                 // the picture's centre: goal / stage
const CY = 1215;                              // caption: first baseline (fixed for the whole film)
const TAGY = 1128;                            // rule tag above the caption
const LIST = { x: 110, y: 1455, row: 62 };    // the list of seven
const T = {
  open: 0, fuel: 3.0, runs: 5.5, forgets: 7.5, marks: 9.5,
  loop: 12.0, loopRun: [12.5, 18.5], loopLand: 19.0,
  header: 19.5, list: 20.5,
  ax0: 22.5, axD: 6.5,
  rec: 68.0, motto: 75.0, apex: 79.5, end: 82.0,
};
const AX = [
  { name: 'AIM', row: 'know the goal, drop the rest', lines: ['Know what you’re aiming at.', 'Drop what doesn’t serve it.'] },
  { name: 'CHECK', row: 'test what’s real first', lines: ['Check what’s real', 'before you build on it.'] },
  { name: 'SEPARATE', row: 'one job per place', lines: ['One job per place.', 'Don’t mix them.'] },
  { name: 'WHOLE', row: 'one task, one whole goal', lines: ['One task,', 'one whole goal.'] },
  { name: 'EDGES', row: 'own yours, route the rest', lines: ['Know what’s yours,', 'and where the rest goes.'] },
  { name: 'LEVERAGE', row: 'borrow when it costs less', lines: ['Borrow when it costs less', 'than building it yourself.'] },
  { name: 'WRITE IT DOWN', row: 'one truth, one place', lines: ['Write it down.', 'Once. In one place.'] },
];
AX.forEach((a, i) => { a.t0 = T.ax0 + i * T.axD; a.capIn = a.t0 + 0.5; a.capOut = a.t0 + 5.25; a.dock = a.t0 + 5.5; });

// ---------- the unit: a goal with a bracket on it ----------
function pieceSeg(k, r) {
  const c = Math.floor(k / 3), p = k % 3, sx = c === 0 || c === 3 ? -1 : 1, sy = c < 2 ? -1 : 1;
  const px = r.cx + sx * r.w / 2, py = r.cy + sy * r.h / 2, arm = Math.min(90, Math.min(r.w, r.h) * 0.3);
  if (p === 0) return [[px - sx * arm * 0.3, py], [px, py], [px, py - sy * arm * 0.3]];
  if (p === 1) return [[px - sx * arm * 0.45, py], [px - sx * arm, py]];
  return [[px, py - sy * arm * 0.45], [px, py - sy * arm]];
}
function bracket(cx, cy, w, h, { lw = 12, alpha = 1, color = LIME, glow = 22, pieceAlpha = null } = {}) {
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = color; ctx.lineWidth = lw;
  ctx.shadowColor = limeA(0.8); ctx.shadowBlur = glow;
  for (let k = 0; k < 12; k++) {
    ctx.globalAlpha = alpha * (pieceAlpha ? pieceAlpha(k) : 1); if (ctx.globalAlpha <= 0.01) continue;
    const seg = pieceSeg(k, { cx, cy, w, h }); ctx.beginPath(); seg.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
  }
  ctx.restore();
}
function goal(x, y, s, { alpha = 1, fill = 0, inner = true } = {}) {
  ctx.save(); ctx.globalAlpha *= alpha; ctx.strokeStyle = WHITE; ctx.lineWidth = Math.max(1, 8 * s);
  [70, 40].forEach(rr => { if (rr === 40 && !inner) return; ctx.beginPath(); ctx.arc(x, y, rr * s, 0, 7); ctx.stroke(); });
  if (fill > 0) { ctx.fillStyle = LIME; ctx.beginPath(); ctx.arc(x, y, 70 * s * fill, 0, 7); ctx.fill(); }
  else if (inner) { ctx.fillStyle = WHITE; ctx.beginPath(); ctx.arc(x, y, 10 * s, 0, 7); ctx.fill(); }
  ctx.lineWidth = Math.max(1, 6 * s);
  for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * 92 * s, y + Math.sin(a) * 92 * s); ctx.lineTo(x + Math.cos(a) * 118 * s, y + Math.sin(a) * 118 * s); ctx.stroke(); }
  ctx.restore();
}
// a scene enters by focusing in and leaves by focusing out (scale + fade), so the eye is always handed on
function scene(t, a, b, fn, { cx = G.x, cy = G.y } = {}) {
  if (t < a || t > b) return;
  const i = E.outBack(clamp((t - a) / 0.35)), o = E.inCubic(clamp((t - (b - 0.3)) / 0.3));
  const s = lerp(1.12, 1, i) * (1 + 0.1 * o), al = clamp((t - a) / 0.15) * (1 - o);
  if (al <= 0.01) return;
  ctx.save(); ctx.globalAlpha = al; ctx.translate(cx, cy); ctx.scale(s, s); ctx.translate(-cx, -cy); fn(t - a); ctx.restore();
}

// ======================================================================
// chapters
// ======================================================================
// 0–12: one goal, the fuel and its three properties
function drawOpen(t) {
  if (t > T.loop + 0.3) return;
  const slam = E.outBack(tw(t, 0, 0.25, E.lin)), bs = lerp(2.4, 1, slam);
  const pop = E.outBack(tw(t, 0, 0.3, E.lin));
  let bx = G.x;
  // every move leaves a mark: the bracket steps, and where it was stays marked
  const steps = [T.marks + 0.25, T.marks + 0.75, T.marks + 1.25];
  const off = [0, -150, 150, 0];
  let k = 0; for (const s of steps) if (t >= s) k++;
  const prevX = G.x + off[Math.max(0, k - 1)], curX = G.x + off[k];
  if (k > 0) bx = lerp(prevX, curX, E.outBack(tw(t, steps[k - 1], steps[k - 1] + 0.2, E.lin))); else bx = G.x;
  const fade = 1 - tw(t, T.loop - 0.1, T.loop + 0.3);
  // marks
  for (let i = 0; i < k; i++) {
    const mx = G.x + off[i], p = tw(t, steps[i], steps[i] + 0.15);
    ctx.save(); ctx.globalAlpha = 0.5 * p * fade; ctx.strokeStyle = LIME; ctx.lineWidth = 4; ctx.setLineDash([8, 10]);
    ctx.beginPath(); ctx.roundRect(mx - 110, G.y + 190, 220, 26, 13); ctx.stroke(); ctx.restore();
    ctx.save(); ctx.globalAlpha = 0.85 * p * fade; ctx.fillStyle = LIME; ctx.beginPath(); ctx.roundRect(mx - 110, G.y + 190, 220 * p, 26, 13); ctx.fill(); ctx.restore();
    burst(t, steps[i], mx, G.y + 203, 30, 110, 8, LIME, 4, 0.3);
  }
  goal(G.x, G.y, pop, { alpha: fade });
  ring(t, 0, G.x, G.y, 70, 260, WHITE, 6, 0.5);
  // it runs out: the pieces count themselves, 1 → 12, then nothing more
  const cnt = t >= T.runs + 0.25 ? Math.min(12, 1 + Math.floor((t - T.runs - 0.25) / S16)) : 0;
  const counting = t >= T.runs + 0.25 && t < T.forgets;
  bracket(bx, G.y, 300 * bs, 300 * bs, {
    alpha: clamp(t / 0.06) * fade,
    pieceAlpha: k2 => counting ? (k2 < cnt ? 1 : 0.25) : 1,
  });
  if (counting) {
    const red = cnt === 12 && t > T.runs + 0.25 + 12 * S16, y = G.y - 190;
    text(red ? '12 / 12 · THAT’S ALL' : `${cnt} / 12`, G.x, y, MONO(32), red ? RED : LIME, { ls: 4 });
  }
  // it forgets: thoughts leave the goal and blur out
  [['the plan', -1, T.forgets + 0.25], ['that idea', 1, T.forgets + 0.6], ['what they said', -0.2, T.forgets + 0.95]].forEach(([s, dx, t0]) => {
    const u = (t - t0) / 1.1; if (u <= 0 || u >= 1) return;
    const x = G.x + dx * E.outCubic(u) * 300, y = G.y - 20 - E.outCubic(u) * 260, blur = E.inCubic(u) * 30, a = 1 - E.inCubic(u), sc = E.outBack(clamp(u * 4));
    ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.scale(sc, sc); if (blur > 0.4) ctx.filter = `blur(${blur.toFixed(1)}px)`;
    ctx.font = F(800, 36); const w = ctx.measureText(s).width + 50;
    ctx.fillStyle = LIME; ctx.beginPath(); ctx.roundRect(-w / 2, -32, w, 64, 32); ctx.fill(); text(s, 0, 12, F(800, 36), INK); ctx.restore();
  });
}
// 12–19.5: you spend it in loops. The bracket circles the goal — decide, act, result, learn — and each lap is tighter.
const LOOP_R = 300, NODES = ['DECIDE', 'ACT', 'RESULT', 'LEARN'];
const loopAngle = t => -Math.PI / 2 + 2 * Math.PI * (t - T.loopRun[0]) / 3;
const loopRad = t => LOOP_R * (1 - E.inOutCubic(clamp((t - T.loopRun[0]) / (T.loopLand - T.loopRun[0]))));
function drawLoop(t) {
  if (t < T.loop || t > T.header + 0.3) return;
  const fade = 1 - tw(t, T.header - 0.1, T.header + 0.3), a0 = tw(t, T.loop, T.loop + 0.3);
  ctx.save(); ctx.globalAlpha = fade;
  goal(G.x, G.y, 1, { fill: E.outBack(tw(t, T.loopLand, T.loopLand + 0.3, E.lin)) });
  // the ring you walk
  ctx.save(); ctx.globalAlpha *= 0.25 * a0; ctx.setLineDash([12, 16]); ctx.strokeStyle = WHITE; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(G.x, G.y, LOOP_R, 0, 7); ctx.stroke(); ctx.restore();
  NODES.forEach((n, i) => {
    const ang = -Math.PI / 2 + i * Math.PI / 2, x = G.x + Math.cos(ang) * (LOOP_R + 62), y = G.y + Math.sin(ang) * (LOOP_R + 62) + 10;
    const lit = [0, 1].map(l => T.loopRun[0] + l * 3 + i * 0.75).some(tt => t > tt - 0.05 && t < tt + 0.45);
    text(n, x, y, MONO(28), lit ? LIME : whiteA(0.45), { ls: 5, alpha: a0 });
  });
  // the path actually walked: a spiral in
  if (t > T.loopRun[0]) {
    ctx.save(); ctx.strokeStyle = LIME; ctx.lineWidth = 7; ctx.shadowColor = limeA(0.6); ctx.shadowBlur = 16; ctx.beginPath();
    for (let s = T.loopRun[0]; s <= Math.min(t, T.loopLand); s += 1 / 60) { const r = loopRad(s), an = loopAngle(s), x = G.x + Math.cos(an) * r, y = G.y + Math.sin(an) * r; s === T.loopRun[0] ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
    ctx.stroke(); ctx.restore();
  }
  // the bracket: from the goal out onto the ring, round twice, and home
  const out = E.inOutCubic(tw(t, T.loop, T.loopRun[0], E.lin));
  let x, y, s;
  if (t < T.loopRun[0]) { x = G.x; y = lerp(G.y, G.y - LOOP_R, out); s = lerp(300, 110, out); }
  else { const r = loopRad(Math.min(t, T.loopLand)), an = loopAngle(Math.min(t, T.loopLand)); x = G.x + Math.cos(an) * r; y = G.y + Math.sin(an) * r; s = lerp(110, 250, E.outBack(tw(t, T.loopLand, T.loopLand + 0.25, E.lin))); }
  bracket(x, y, s, s, { lw: lerp(12, 8, clamp((300 - s) / 190)) });
  ctx.restore();
  ring(t, T.loopLand, G.x, G.y, 70, 520, LIME, 12, 0.6); burst(t, T.loopLand, G.x, G.y, 110, 360, 14, LIME, 7, 0.5);
}

// ---------- the seven ----------
function drawAim(u, t) {
  goal(G.x, G.y, 1); bracket(G.x, G.y, 300, 300);
  const items = [['Draft the pitch.', 300, 470, -0.05, true], ['Just in case…', 790, 520, 0.05, false], ['Look busy.', 560, 1010, -0.03, false]];
  items.forEach(([s, x, y, r, keep], i) => {
    const t0 = 0.3 + i * 0.25, p = E.outBack(tw(u, t0, t0 + 0.3, E.lin)); if (p <= 0) return;
    const side = x < 540 ? -1 : 1; let cx = lerp(x + side * 700, x, p), a = 1, rot = r;
    const tether = keep ? tw(u, 1.75, 2.0) : 0;
    if (!keep) { const d = u - (2.25 + (i - 1) * 0.25); if (d > 0) { const q = E.inCubic(clamp(d / 0.35)); cx = x + (i === 1 ? 1 : -1) * q * 900; rot = r + q * 0.3 * (i === 1 ? 1 : -1); a = 1 - q; } }
    if (tether > 0) { ctx.save(); ctx.strokeStyle = LIME; ctx.lineWidth = 5; ctx.globalAlpha = 0.9; ctx.setLineDash([2, 12]); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(cx + 130, y + 20); ctx.lineTo(lerp(cx + 130, G.x - 90, tether), lerp(y + 20, G.y - 60, tether)); ctx.stroke(); ctx.restore(); }
    card(cx, y, 360, 84, { rot, alpha: a, border: tether > 0.9 ? LIME : undefined, bw: tether > 0.9 ? 4 : 2 });
    text(s, -150, 12, F(600, 30, 'Inter'), WHITE, { align: 'left' }); endCard();
  });
}
function drawCheck(u) {
  const Y = 960; // ground
  ctx.save(); ctx.strokeStyle = whiteA(0.25); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(140, Y); ctx.lineTo(940, Y); ctx.stroke(); ctx.restore();
  const blocks = [{ x: 330, real: false, t: 1.0 }, { x: 750, real: true, t: 2.0 }];
  blocks.forEach(b => {
    const probed = u > b.t + 0.25;
    let y = Y - 80, rot = 0, a = 1;
    if (probed && !b.real) { const q = E.inCubic(tw(u, b.t + 0.45, b.t + 1.0, E.lin)); y += q * 500; rot = q * 0.6; a = 1 - q; }
    ctx.save(); ctx.globalAlpha = a * tw(u, 0.2, 0.4); ctx.translate(b.x, y); ctx.rotate(rot);
    if (probed && b.real) { ctx.fillStyle = WHITE; ctx.beginPath(); ctx.roundRect(-120, -80, 240, 160, 18); ctx.fill(); text('REAL ✓', 0, 12, MONO(30), INK, { ls: 3 }); }
    else { ctx.strokeStyle = probed ? RED : whiteA(0.7); ctx.lineWidth = 5; ctx.setLineDash([14, 12]); ctx.beginPath(); ctx.roundRect(-120, -80, 240, 160, 18); ctx.stroke(); text(probed ? 'NOT REAL ✕' : 'GUESS', 0, 12, MONO(30), probed ? RED : whiteA(0.8), { ls: 3 }); }
    ctx.restore();
    ring(u, b.t + 0.25, b.x, Y - 80, 60, 220, b.real ? LIME : RED, 8, 0.45);
  });
  // the probe: a small bracket hops onto each guess
  const hop = u < 1.0 ? null : u < 2.0 ? 0 : u < 3.0 ? 1 : null;
  if (hop !== null) { const b = blocks[hop], p = E.outBack(tw(u, b.t, b.t + 0.2, E.lin)); bracket(b.x, Y - 80, lerp(420, 280, p), lerp(340, 200, p), { lw: 9, alpha: clamp((u - b.t) / 0.05) * (1 - tw(u, b.t + 0.8, b.t + 1.0)) }); }
  // then build on what's real
  [[2.9, 0], [3.3, 1]].forEach(([t0, i]) => {
    const p = E.outBack(tw(u, t0, t0 + 0.25, E.lin)); if (p <= 0) return;
    const y = lerp(Y - 700, Y - 160 - 50 - i * 100, p);
    ctx.save(); ctx.fillStyle = LIME; ctx.beginPath(); ctx.roundRect(750 - 110, y - 45, 220, 90, 14); ctx.fill(); ctx.restore();
    text('BUILD', 750, y + 11, MONO(28), INK, { ls: 4 });
  });
}
function drawSeparate(u) {
  const R = rng(3), dots = Array.from({ length: 22 }, (_, i) => ({ c: i % 2, x: (R() - 0.5) * 460, y: (R() - 0.5) * 260 }));
  const cut = tw(u, 1.1, 1.5, E.inOutCubic), sort = E.inOutCubic(tw(u, 1.6, 2.3, E.lin)), apart = E.outBack(tw(u, 2.1, 2.5, E.lin));
  const gapX = apart * 50;
  // boxes: one mixed box becomes two clean ones
  [-1, 1].forEach(side => {
    const w = lerp(560, 270, sort), cx = G.x + side * lerp(0, 145 + gapX, sort);
    ctx.save(); ctx.strokeStyle = sort > 0.5 ? (side < 0 ? ORANGE : BLUE) : whiteA(0.5); ctx.lineWidth = 5; ctx.beginPath(); ctx.roundRect(cx - w / 2, G.y - 180, w, 360, 26); ctx.stroke(); ctx.restore();
  });
  dots.forEach((d, i) => {
    const side = d.c ? 1 : -1, j = Math.floor(i / 2), tx = side * (145 + gapX) + ((j % 3) - 1) * 70, ty = (Math.floor(j / 3) - 1.5) * 70;
    const e = clamp(sort * 1.2 - (i % 5) * 0.04);
    const x = G.x + lerp(d.x, tx, E.inOutCubic(e)), y = G.y + lerp(d.y, ty, E.inOutCubic(e)) - Math.sin(e * Math.PI) * 40;
    ctx.fillStyle = d.c ? BLUE : ORANGE; ctx.beginPath(); ctx.arc(x, y, 20 * E.outBack(tw(u, 0.2 + i * 0.02, 0.45 + i * 0.02, E.lin)), 0, 7); ctx.fill();
  });
  if (cut > 0 && cut < 1) { ctx.save(); ctx.strokeStyle = LIME; ctx.lineWidth = 8; ctx.shadowColor = limeA(0.8); ctx.shadowBlur = 20; ctx.beginPath(); ctx.moveTo(G.x, G.y - 260); ctx.lineTo(G.x, lerp(G.y - 260, G.y + 260, cut)); ctx.stroke(); ctx.restore(); }
}
function drawWhole(u) {
  const split = E.inOutCubic(tw(u, 1.2, 1.8, E.lin));
  const ys = [G.y - 250, G.y, G.y + 250];
  if (split <= 0) {
    // one task, stuffed with three goals
    card(G.x, G.y, 560, 180, { s: E.outBack(tw(u, 0.1, 0.4, E.lin)) });
    [-170, 0, 170].forEach((dx, i) => goal(dx, 0, 0.55 + 0.03 * Math.sin(u * 20 + i)));
    text('ONE TASK', -250, -62, MONO(20), whiteA(0.5), { align: 'left', ls: 3 }); endCard();
  } else {
    [-170, 0, 170].forEach((dx, i) => {
      const x = G.x + lerp(dx, 0, split), y = lerp(G.y, ys[i], split), w = lerp(186, 460, split);
      card(x, y, w, lerp(180, 170, split));
      const lk = u - (2.2 + i * 0.25);
      goal(0, 0, 0.55, { fill: lk > 0 ? E.outBack(clamp(lk / 0.25)) : 0 });
      if (split > 0.95) text(`TASK ${i + 1}`, -200, -52, MONO(20), whiteA(0.5), { align: 'left', ls: 3 });
      endCard();
      if (lk > -0.1) bracket(x, y, lerp(360, 150, E.outBack(clamp((lk + 0.1) / 0.25))), lerp(300, 150, E.outBack(clamp((lk + 0.1) / 0.25))), { lw: 7, alpha: clamp((lk + 0.1) / 0.05) });
      burst(u, 2.2 + i * 0.25 + 0.15, x, y, 60, 150, 8, LIME, 4, 0.35);
    });
  }
}
function drawEdges(u) {
  const box = { x: G.x, y: G.y + 40, w: 420, h: 420 };
  const route = [{ x: 150, y: G.y + 40, label: 'AI AGENT' }, { x: 930, y: G.y + 40, label: 'SOMEONE WHO KNOWS' }];
  const inP = tw(u, 0.1, 0.4);
  ctx.save(); ctx.globalAlpha = inP; ctx.strokeStyle = LIME; ctx.lineWidth = 6; ctx.shadowColor = limeA(0.6); ctx.shadowBlur = 16;
  ctx.beginPath(); ctx.roundRect(box.x - box.w / 2, box.y - box.h / 2, box.w, box.h, 28); ctx.stroke(); ctx.restore();
  text('YOURS', box.x - box.w / 2 + 24, box.y - box.h / 2 + 44, MONO(26), LIME, { align: 'left', alpha: inP, ls: 5 });
  route.forEach((r, i) => {
    const p = E.outBack(tw(u, 0.3 + i * 0.15, 0.6 + i * 0.15, E.lin));
    card(r.x, r.y, 150, 150, { s: p }); endCard();
    text(r.label, r.x, r.y + 112, MONO(18), whiteA(0.7), { alpha: clamp(p), ls: 2 });
    if (i === 1) { ctx.save(); ctx.globalAlpha = clamp(p); ctx.fillStyle = '#E5E5EA'; ctx.beginPath(); ctx.arc(r.x, r.y - 18, 22, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(r.x, r.y + 48, 38, Math.PI, 0); ctx.fill(); ctx.restore(); }
    else { ctx.save(); ctx.globalAlpha = clamp(p); ctx.translate(r.x, r.y); ctx.fillStyle = LIME; ctx.beginPath(); for (let j = 0; j < 8; j++) { const a = j * Math.PI / 4 - Math.PI / 2, rr = j % 2 ? 11 : 44; j ? ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : ctx.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); } ctx.closePath(); ctx.fill(); ctx.restore(); }
  });
  // three things arrive. One is yours. The others hit the edge — and the edge sends each where it belongs.
  const chips = [{ t: 0.8, s: 'Your part', to: null, col: LIME }, { t: 1.6, s: 'Legal stuff', to: 1, col: ORANGE }, { t: 2.6, s: 'Repeat job', to: 0, col: BLUE }];
  chips.forEach(c => {
    const fall = E.inCubic(tw(u, c.t, c.t + 0.35, E.lin)); if (u < c.t) return;
    let x = box.x, y;
    if (c.to === null) y = lerp(G.y - 520, box.y, E.outBack(tw(u, c.t, c.t + 0.4, E.lin)));
    else {
      const edgeY = box.y - box.h / 2 - 40; y = lerp(G.y - 520, edgeY, fall);
      const r = route[c.to], go = E.inOutCubic(tw(u, c.t + 0.45, c.t + 0.9, E.lin));
      if (go > 0) { x = lerp(box.x, r.x, go); y = lerp(edgeY, r.y, go) - Math.sin(go * Math.PI) * 160; }
      const hit = u - (c.t + 0.35);
      if (hit > 0 && hit < 0.3) { ctx.save(); ctx.globalAlpha = 1 - hit / 0.3; ctx.strokeStyle = WHITE; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(box.x - 150, box.y - box.h / 2); ctx.lineTo(box.x + 150, box.y - box.h / 2); ctx.stroke(); ctx.restore(); }
      // the route drawn: an arrow from the edge to where it goes
      const ra = tw(u, c.t + 0.35, c.t + 0.5) * (1 - tw(u, c.t + 1.2, c.t + 1.5));
      if (ra > 0) { ctx.save(); ctx.globalAlpha = ra; ctx.strokeStyle = LIME; ctx.lineWidth = 4; ctx.setLineDash([10, 10]); ctx.beginPath(); ctx.moveTo(box.x + (c.to ? 60 : -60), edgeY); ctx.quadraticCurveTo((box.x + r.x) / 2, edgeY - 160, r.x, r.y - 95); ctx.stroke(); ctx.restore(); }
      if (go >= 1) { const d = u - (c.t + 0.9); ring(u, c.t + 0.9, r.x, r.y, 50, 150, LIME, 6, 0.4); if (d > 0.2) return; }
    }
    ctx.save(); ctx.translate(x, y); ctx.font = F(800, 30); const w = ctx.measureText(c.s).width + 44;
    ctx.fillStyle = c.col; ctx.beginPath(); ctx.roundRect(-w / 2, -28, w, 56, 28); ctx.fill(); text(c.s, 0, 11, F(800, 30), INK); ctx.restore();
  });
}
function drawLeverage(u) {
  // same question twice, opposite answers: it's a comparison of attention cost, not a rule to always hand off
  const rows = [{ y: G.y - 190, task: 'DO THE TAXES', build: 8, borrow: 2, t: 1.4 }, { y: G.y + 190, task: 'A QUICK EMAIL', build: 1, borrow: 4, t: 2.6 }];
  rows.forEach((r, ri) => {
    const inP = tw(u, 0.15 + ri * 0.35, 0.45 + ri * 0.35); if (inP <= 0) return;
    text(r.task, G.x, r.y - 120, MONO(28), WHITE, { alpha: inP, ls: 5 });
    [['BUILD IT', r.build, 300], ['BORROW IT', r.borrow, 780]].forEach(([lab, n, x], oi) => {
      const pick = (r.build <= r.borrow) === (oi === 0), chosen = u > r.t && pick, dropped = u > r.t && !pick;
      card(x, r.y, 380, 170, { alpha: inP * (dropped ? 0.4 : 1), border: chosen ? LIME : undefined, bw: chosen ? 5 : 2 });
      text(lab, 0, -30, MONO(26), chosen ? LIME : whiteA(0.8), { ls: 4 });
      // cost, in pieces of your attention
      const shown = Math.min(n, Math.floor(clamp((u - 0.5 - ri * 0.35) / 0.6) * n + 0.999 * (u > 0.5 + ri * 0.35 ? 1 : 0)));
      for (let j = 0; j < n; j++) {
        const px = -((n - 1) * 26) / 2 + j * 26;
        ctx.fillStyle = j < shown ? LIME : whiteA(0.12); ctx.beginPath(); ctx.roundRect(px - 8, 12, 16, 44, 5); ctx.fill();
      }
      endCard();
      if (chosen) { const p = E.outBack(tw(u, r.t, r.t + 0.22, E.lin)); bracket(x, r.y, lerp(520, 420, p), lerp(300, 210, p), { lw: 8, alpha: clamp((u - r.t) / 0.05) }); burst(u, r.t + 0.1, x, r.y, 120, 260, 10, LIME, 5, 0.35); }
      if (dropped) { ctx.save(); ctx.globalAlpha = 0.8; ctx.strokeStyle = RED; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x - 150, r.y); ctx.lineTo(lerp(x - 150, x + 150, tw(u, r.t, r.t + 0.2)), r.y); ctx.stroke(); ctx.restore(); }
    });
    text('COSTS LESS ATTENTION →', G.x, r.y + 130, MONO(22), LIME, { alpha: tw(u, r.t + 0.2, r.t + 0.4), ls: 3 });
  });
}
function drawTruth(u) {
  const notes = [['Due Friday.', 300, G.y - 200, -0.12, ORANGE], ['Due Monday.', 770, G.y - 90, 0.09, BLUE], ['Due… when?', 430, G.y + 190, 0.06, '#FF375F']];
  const merge = E.inOutCubic(tw(u, 1.5, 2.1, E.lin));
  notes.forEach(([s, x, y, r, col], i) => {
    const p = E.outBack(tw(u, 0.2 + i * 0.25, 0.5 + i * 0.25, E.lin)); if (p <= 0) return;
    const keep = i === 1;
    const cx = lerp(x, G.x, merge), cy = lerp(y, G.y, merge), s0 = keep ? 1 : 1 - merge;
    if (s0 <= 0.02) return;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(lerp(r, 0, merge) + (keep ? 0 : merge * 0.8)); ctx.scale(p * s0, p * s0);
    ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12;
    ctx.fillStyle = '#FAFAF7'; ctx.beginPath(); ctx.roundRect(-190, -100, 380, 200, 20); ctx.fill(); ctx.shadowColor = 'transparent';
    const head = keep ? (merge > 0.5 ? LIME : col) : col;
    ctx.fillStyle = head; ctx.beginPath(); ctx.roundRect(-190, -100, 380, 46, [20, 20, 0, 0]); ctx.fill();
    text(keep && merge > 0.5 ? 'NOTES · THE ONE PLACE' : 'COPY', -165, -68, MONO(20), INK, { align: 'left', ls: 3 });
    text(s, -165, 24, F(900, 50), INK, { align: 'left', ls: -1 });
    ctx.restore();
  });
  burst(u, 2.1, G.x, G.y, 200, 360, 12, LIME, 6, 0.4);
}
const AX_DRAW = [drawAim, drawCheck, drawSeparate, drawWhole, drawEdges, drawLeverage, drawTruth];

// ---------- the list ----------
function drawList(t) {
  if (t < T.list) return;
  const inP = tw(t, T.list, T.list + 0.4), out = tw(t, T.rec - 0.2, T.rec + 0.2) * (1 - tw(t, T.end + 0.3, T.end + 0.8));
  const vis = inP * (1 - out); if (vis <= 0.01) return;
  const endLit = t > T.end;
  text('SEVEN RULES', LIST.x, LIST.y - 58, MONO(24), limeA(0.8), { align: 'left', alpha: vis, ls: 6 });
  AX.forEach((a, i) => {
    const y = LIST.y + i * LIST.row, d = t - a.dock;
    const docked = d > 0, flash = d > 0 && d < 0.6 ? 1 - d / 0.6 : 0;
    const endFlash = endLit ? Math.max(0, 1 - Math.abs(t - (T.end + 0.8 + i * S16)) / 0.25) : 0;
    const bright = endLit ? 1 : docked ? 0.55 + 0.45 * flash : 0.18;
    ctx.save(); ctx.globalAlpha = vis;
    if (flash > 0 || endFlash > 0) { ctx.fillStyle = limeA(0.18 * Math.max(flash, endFlash)); ctx.fillRect(LIST.x - 20, y - 42, 880 * E.outCubic(clamp(d / 0.25)), 56); }
    text(`0${i + 1}`, LIST.x, y, MONO(26), docked || endLit ? LIME : whiteA(0.3), { align: 'left', alpha: bright, ls: 2 });
    if (docked || endLit) {
      const p = endLit ? 1 : E.outBack(clamp(d / 0.3)), x = LIST.x + 70;
      ctx.save(); ctx.translate(x, y); ctx.scale(lerp(1.3, 1, p), lerp(1.3, 1, p));
      text(a.name, 0, 0, F(900, 38), WHITE, { align: 'left', alpha: bright * clamp(p * 2), ls: -1 });
      ctx.font = F(900, 38); ctx.letterSpacing = '-1px'; const nw = ctx.measureText(a.name).width;
      text(a.row, nw + 22, 0, F(600, 28, 'Inter'), GREY, { align: 'left', alpha: bright * clamp(p * 2) });
      ctx.restore();
    } else { ctx.fillStyle = whiteA(0.08); ctx.fillRect(LIST.x + 70, y - 24, 600, 14); }
    ctx.restore();
  });
}

// ---------- recursion: hand a task off and it's a goal of its own. Same rules, every size. ----------
const REC_R = 6, REC_LAB = ['YOU', 'SOMEONE YOU HANDED IT TO', 'WHOEVER THEY HANDED IT TO', ''];
function drawRec(t) {
  if (t < T.rec - 0.2 || t > T.motto + 0.1) return;
  const inP = tw(t, T.rec - 0.2, T.rec + 0.2), zoom = Math.pow(REC_R, 2 * E.inOutCubic(tw(t, T.rec + 1.0, T.motto - 0.6, E.lin)));
  // the zoom stays inside the picture: it never runs over the caption
  ctx.save(); ctx.globalAlpha = inP; ctx.beginPath(); ctx.rect(0, 0, W, 1075); ctx.clip();
  const fadeEdge = ctx.createLinearGradient(0, 960, 0, 1075); fadeEdge.addColorStop(0, 'rgba(7,8,12,0)'); fadeEdge.addColorStop(1, 'rgba(7,8,12,1)');
  for (let lv = 0; lv < 4; lv++) {
    const s = zoom / Math.pow(REC_R, lv); if (s < 0.02 || s > 14) continue;
    const a = clamp((14 - s) / 6);
    ctx.save(); ctx.globalAlpha *= a;
    goal(G.x, G.y, s, { inner: false });
    bracket(G.x, G.y, 300 * s, 300 * s, { lw: Math.max(1.5, 12 * s), glow: 22 * Math.min(1, s) });
    if (REC_LAB[lv] && s > 0.35 && s < 3) text(REC_LAB[lv], G.x - 150 * s, G.y - 150 * s - 20 * Math.min(1.4, s), MONO(Math.round(24 * Math.min(1.4, s))), LIME, { align: 'left', ls: 4, alpha: clamp((s - 0.35) / 0.3) * clamp((3 - s) / 1) });
    ctx.restore();
  }
  ctx.fillStyle = fadeEdge; ctx.fillRect(0, 960, W, 115);
  ctx.restore();
}

// ---------- floods: the motto and the apex ----------
function flood(cx, cy, r, col = LIME) { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(cx, cy, Math.max(0, r), 0, 7); ctx.fill(); }
function drawFloods(t) {
  if (t < T.motto - 0.4 || t > T.end + 0.5) return;
  const grow = tw(t, T.motto - 0.4, T.motto, E.inOutExpo), shrink = tw(t, T.end - 0.4, T.end, E.inOutExpo);
  flood(G.x, G.y, lerp(40, 2400, grow) * (1 - shrink));
  if (shrink < 1) {
    cap(t, T.motto + 0.1, T.motto + 1.95, [['You can’t', INK, 130], ['know', INK, 130], ['everything.', INK, 130]], 540, 700, 130, { shadow: false, gap: 0.14 });
    cap(t, T.motto + 2.1, T.apex - 0.3, [['But you can', INK, 110], ['leverage', INK, 150], ['everything.', INK, 110]], 540, 680, 110, { shadow: false, gap: 0.16 });
    cap(t, T.apex, T.end - 0.45, [['Attention is', INK, 120], ['all you', INK, 190], ['need.', INK, 190]], 540, 700, 120, { shadow: false, gap: 0.22 });
  }
}

// ---------- background ----------
function drawBg(t) {
  ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
  const g = ctx.createRadialGradient(G.x, G.y, 50, G.x, G.y, 900);
  g.addColorStop(0, 'rgba(200,255,46,0.06)'); g.addColorStop(1, 'rgba(200,255,46,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(255,255,255,0.07)';
  for (let gx = -6; gx <= 6; gx++) for (let gy = -11; gy <= 11; gy++) { ctx.beginPath(); ctx.arc(540 + gx * 90, 960 + gy * 90, 2.4, 0, 7); ctx.fill(); }
}
function shake(t) {
  let a = 0; const hit = (t0, amp, d) => { const x = t - t0; if (x > 0 && x < d) a = Math.max(a, amp * (1 - x / d)); };
  hit(0.25, 14, 0.25); hit(T.runs + 0.25 + 12 * S16, 12, 0.25); hit(T.loopLand, 16, 0.35);
  AX.forEach(a => hit(a.dock, 5, 0.15)); hit(T.motto, 10, 0.3);
  return { x: Math.sin(t * 91) * a, y: Math.cos(t * 77) * a };
}

// ======================================================================
// frame
// ======================================================================
function renderFrame(t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none'; ctx.globalCompositeOperation = 'source-over';
  const sh = shake(t);
  drawBg(t);
  ctx.save(); ctx.translate(sh.x, sh.y);
  drawOpen(t); drawLoop(t);
  AX.forEach((a, i) => scene(t, a.t0, a.t0 + T.axD, u => AX_DRAW[i](u, t)));
  drawRec(t);
  ctx.restore();
  drawList(t);

  // ---------------- captions: one place, just under the picture ----------------
  cap(t, 0.3, 2.8, [['One goal.', WHITE, 84], ['One of you.', LIME, 84]], 540, CY, 84, { gap: 0.4 });
  cap(t, T.fuel, T.runs - 0.15, [['Your attention', WHITE, 84], ['is the fuel.', LIME, 84]], 540, CY, 84, { gap: 0.25 });
  cap(t, T.runs, T.forgets - 0.15, [['It runs out.', WHITE, 84]], 540, CY + 40, 84);
  cap(t, T.forgets, T.marks - 0.15, [['It forgets.', WHITE, 84]], 540, CY + 40, 84);
  cap(t, T.marks, T.loop - 0.15, [['Every move', WHITE, 84], ['leaves a mark.', LIME, 84]], 540, CY, 84, { gap: 0.25 });
  cap(t, T.loop + 0.25, T.loop + 2.75, [['You spend it', WHITE, 84], ['in loops.', LIME, 84]], 540, CY, 84, { gap: 0.25 });
  cap(t, T.loop + 3.5, T.loopLand - 0.25, [['Every loop,', WHITE, 84], ['a little closer.', LIME, 84]], 540, CY, 84, { gap: 0.25 });
  cap(t, T.header, T.ax0 - 0.3, [['Seven rules', WHITE, 96], ['for spending it well.', LIME, 84]], 540, CY - 20, 96, { gap: 0.25, outDir: 1 });
  AX.forEach((a, i) => {
    const tagA = tw(t, a.t0 + 0.3, a.t0 + 0.5) * (1 - tw(t, a.capOut, a.capOut + 0.25));
    text(`0${i + 1} · ${a.name}`, 540, TAGY, MONO(30), LIME, { alpha: tagA, ls: 6 });
    cap(t, a.capIn, a.capOut, [[a.lines[0], WHITE, 72], [a.lines[1], LIME, 72]], 540, CY, 72, { gap: 0.3, outDir: 1 });
  });
  cap(t, T.rec + 0.3, T.rec + 4.2, [['Hand off a task,', WHITE, 80], ['it’s a goal of its own.', LIME, 80]], 540, CY, 80, { gap: 0.35 });
  cap(t, T.rec + 4.4, T.motto - 0.45, [['Same rules.', WHITE, 84], ['Every size.', LIME, 84]], 540, CY, 84, { gap: 0.3 });

  drawFloods(t);
  // ---------------- end card: the name over the full list ----------------
  if (t > T.end - 0.1) {
    cap(t, T.end + 0.1, 99, [['AXIOMS', WHITE, 150]], 540, 700, 150, { stagger: 0 });
    cap(t, T.end + 0.5, 99, [['Seven rules for spending attention well.', whiteA(0.7), 38]], 540, 800, 38, { weight: 600, stagger: 0.025, shadow: false });
    const lk = E.outBack(tw(t, T.end, T.end + 0.3, E.lin));
    bracket(540, 700, lerp(1040, 820, lk), lerp(640, 340, lk), { lw: 10, alpha: clamp((t - T.end) / 0.1) });
    text('github.com/RockyHong/axioms-protocol', 540, 1300, MONO(28), LIME, { alpha: tw(t, T.end + 1.5, T.end + 1.8), ls: 1 });
  }
}
window.renderFrame = renderFrame;

// ---------- sound cues ----------
window.cueSheet = () => ({
  dur: DUR, beat: BEAT,
  lock: 0.25, fuel: T.fuel, runs: T.runs, count: Array.from({ length: 12 }, (_, k) => T.runs + 0.25 + k * S16), thatsAll: T.runs + 0.25 + 12 * S16,
  forgets: [T.forgets + 0.25, T.forgets + 0.6, T.forgets + 0.95], marks: [T.marks + 0.25, T.marks + 0.75, T.marks + 1.25],
  loop: T.loop, loopNodes: [0, 1].flatMap(l => [0, 1, 2, 3].map(i => T.loopRun[0] + l * 3 + i * 0.75)), loopLand: T.loopLand,
  header: T.header, rules: AX.map(a => ({ t0: a.t0, dock: a.dock })),
  rec: T.rec, motto: T.motto, apex: T.apex, end: T.end, listFlash: AX.map((_, i) => T.end + 0.8 + i * S16),
});
window.__ready = document.fonts.ready.then(() => Promise.all(['900 10px "Inter Tight"', '800 10px "Inter Tight"', '600 10px "Inter Tight"', '600 10px Inter', '500 10px "JetBrains Mono"'].map(f => document.fonts.load(f)))).then(() => true);

if (!location.search.includes('render')) {
  let t0 = performance.now(), paused = false, tp = 0;
  addEventListener('keydown', e => { if (e.code === 'Space') { paused = !paused; t0 = performance.now() - tp * 1000; } if (e.code === 'ArrowRight') tp = Math.min(DUR, tp + 0.5); if (e.code === 'ArrowLeft') tp = Math.max(0, tp - 0.5); if (paused) renderFrame(tp); });
  window.__ready.then(() => { const loop = now => { if (!paused) { tp = ((now - t0) / 1000) % DUR; renderFrame(tp); } document.getElementById('hud').textContent = `t=${tp.toFixed(2)}s`; requestAnimationFrame(loop); }; requestAnimationFrame(loop); });
} else document.body.classList.add('render');
