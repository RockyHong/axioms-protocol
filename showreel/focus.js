// AXIOMS — "FOCUS" (~41s). The film dogfoods its thesis: the viewer's attention is steered by focus.
// A lime autofocus bracket = your attention. It is built from 12 pieces (finite capacity).
// Whatever the bracket holds is sharp; everything else is out of focus. Text enters by focusing in
// and leaves by focusing out — motion-out is the hand-off to the next focal point. No idle holds.
// Deterministic: every frame is a pure function of t (seconds).
const W = 1080, H = 1920, SCRIPT_END = 41.5;
// Script time is authored in seconds; WARP stretches only the spans where a caption needs reading time.
// [scriptStart, scriptEnd, rate]  rate < 1 = slower.
const WARP = [[9.0, 10.55, 0.6], [10.6, 11.15, 0.4], [26.0, 27.9, 0.55], [27.9, 31.9, 0.8]];
function warp(tOut) {
  let s = 0, o = 0;
  for (const [a, b, r] of WARP) {
    if (tOut < o + (a - s)) return s + (tOut - o);
    o += a - s; s = a;
    const len = (b - a) / r;
    if (tOut < o + len) return a + (tOut - o) * r;
    o += len; s = b;
  }
  return s + (tOut - o);
}
const DUR = (() => { let d = SCRIPT_END; for (const [a, b, r] of WARP) d += (b - a) / r - (b - a); return Math.round(d * 100) / 100; })();
window.DUR = DUR;
const cv = document.getElementById('c');
let ctx = cv.getContext('2d');

// ---------- palette ----------
const BG = '#07080C', LIME = '#C8FF2E', WHITE = '#F5F5F7', INK = '#07080C';
const limeA = a => `rgba(200,255,46,${a})`;
const whiteA = a => `rgba(245,245,247,${a})`;

// ---------- math ----------
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const E = {
  lin: t => t,
  outExpo: t => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  inExpo: t => (t <= 0 ? 0 : Math.pow(2, 10 * t - 10)),
  outCubic: t => 1 - Math.pow(1 - t, 3),
  inCubic: t => t * t * t,
  inOutCubic: t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  inOutExpo: t => t <= 0 ? 0 : t >= 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2,
  outBack: t => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
};
const tw = (t, a, b, e = E.inOutCubic) => e(clamp((t - a) / (b - a)));
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const qbez = (a, c, b, u) => (1 - u) * (1 - u) * a + 2 * (1 - u) * u * c + u * u * b;

// ---------- type ----------
const F = (w, s, fam = 'Inter Tight') => `${w} ${s}px "${fam}"`;
const MONO = s => F(500, s, 'JetBrains Mono');
function text(str, x, y, font, color, { align = 'center', alpha = 1, ls = 0, blur = 0 } = {}) {
  if (alpha <= 0.003) return;
  ctx.save(); ctx.globalAlpha *= alpha; ctx.font = font; ctx.letterSpacing = ls + 'px';
  if (blur > 0.4) ctx.filter = `blur(${blur.toFixed(1)}px)`;
  ctx.textAlign = align; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = color; ctx.fillText(str, x, y); ctx.restore();
}
// Focus-in / focus-out caption. lines: [[str, color, size?]]. Words rack into focus, staggered.
function cap(t, tIn, tOut, lines, x, y, size, { gap = 0.18, stagger = 0.06, weight = 900, lh = 1.08, align = 'center', shadow = true, outDir = -1 } = {}) {
  if (t < tIn || t > tOut + 0.3) return;
  const q = clamp((t - tOut) / 0.28), qe = E.inCubic(q);
  let ly = y;
  lines.forEach(([str, color, sz = size], li) => {
    if (li) ly += sz * lh;                       // baseline advances by the incoming line's size
    const font = F(weight, sz); ctx.font = font; ctx.letterSpacing = '-2px';
    const words = str.split(' '), sp = ctx.measureText(' ').width;
    const ws = words.map(w => ctx.measureText(w).width), total = ws.reduce((a, b) => a + b, 0) + sp * (words.length - 1);
    let cx = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x;
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
function burst(t, t0, x, y, r0, r1, n = 10, color = LIME, w = 6, dur = 0.4, rot = 0) {
  const p = (t - t0) / dur; if (p <= 0 || p >= 1) return;
  const e = E.outExpo(p); ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.globalAlpha = 1 - p;
  for (let i = 0; i < n; i++) { const a = rot + i * Math.PI * 2 / n, ra = lerp(r0, r1, e * 0.7), rb = lerp(r0, r1, e); ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * ra, y + Math.sin(a) * ra); ctx.lineTo(x + Math.cos(a) * rb, y + Math.sin(a) * rb); ctx.stroke(); }
  ctx.restore();
}
function ring(t, t0, x, y, r0, r1, color = LIME, w = 8, dur = 0.5) {
  const p = (t - t0) / dur; if (p <= 0 || p >= 1) return;
  ctx.save(); ctx.strokeStyle = color; ctx.globalAlpha = 1 - p; ctx.lineWidth = w * (1 - p) + 1; ctx.beginPath(); ctx.arc(x, y, lerp(r0, r1, E.outExpo(p)), 0, 7); ctx.stroke(); ctx.restore();
}

// ======================================================================
// SCRIPT (seconds). Everything below reads from these.
// ======================================================================
const C = { x: 540, y: 1000 };                           // goal / home of the bracket
const HOME = { cx: C.x, cy: C.y, w: 300, h: 300 };
const LOCK = { cx: C.x, cy: C.y, w: 250, h: 250 };
// notifications. burden → handed off; distraction → swiped away.
const ITEMS = [
  { app: 'REMINDERS', body: 'Remember everything.',      col: '#FF9F0A', glyph: 'list',   x: 400, y: 360,  r: -0.04, kind: 'burden', to: 'NOTES' },
  { app: 'SEARCH',    body: 'Figure it all out yourself.', col: '#BF5AF2', glyph: 'q',   x: 690, y: 520,  r: 0.05,  kind: 'burden', to: 'EXPERT' },
  { app: 'TO-DO',     body: 'Do it all by hand. Again.',  col: '#32ADE6', glyph: 'loop',  x: 390, y: 1340, r: 0.03,  kind: 'burden', to: 'AI' },
  { app: 'GROUP CHAT', body: '99+ new messages',          col: '#30D158', glyph: 'chat',  x: 720, y: 690,  r: -0.04, kind: 'distraction' },
  { app: 'FEED',      body: 'Someone liked your post',    col: '#FF375F', glyph: 'heart', x: 300, y: 930,  r: 0.04,  kind: 'distraction' },
  { app: 'NEWS',      body: 'Breaking: you won’t believe…', col: '#FF453A', glyph: 'news', x: 780, y: 1110, r: -0.03, kind: 'distraction' },
  { app: 'BROWSER',   body: '37 tabs open',               col: '#0A84FF', glyph: 'tabs',  x: 640, y: 1500, r: 0.04,  kind: 'distraction' },
];
const ARRIVE_ORDER = [3, 0, 4, 1, 5, 2, 6];
ARRIVE_ORDER.forEach((k, i) => (ITEMS[k].arr = 3.3 + i * 0.28));
const BW = 700, BH = 132;
// bracket pieces: 12 (3 per corner). pieces 0 and 3 are never spent.
const HOLD = { 1: 0, 2: 0, 4: 1, 5: 1, 7: 2, 8: 2, 6: 3, 9: 4, 10: 5, 11: 6 };
const YANK_SEQ = [6, 9, 10, 11, 1, 2, 4, 5, 7, 8];
const T_YANK = {}; YANK_SEQ.forEach((k, i) => (T_YANK[k] = 7.0 + i * 0.19));
const T_SWIPE = { 3: 11.2, 4: 11.45, 5: 11.7, 6: 11.95 };
const T_RET = { 6: 11.32, 9: 11.57, 10: 11.82, 11: 12.07, 1: 18.8, 2: 18.95, 4: 20.17, 5: 20.33, 7: 20.87, 8: 21.03 };
const T_HAND = { 0: [18.2, 18.7], 1: [19.75, 20.15], 2: [20.45, 20.85] };
const BENCH = { NOTES: { x: 200, y: 1690 }, EXPERT: { x: 540, y: 1690 }, AI: { x: 880, y: 1690 } };
const T_BENCH = { EXPERT: 19.6, AI: 20.3 };
const T_WORK = { EXPERT: 20.15, AI: 20.85 };   // helper's own bracket locks onto the handed-off task
const BENCH_LABEL = { EXPERT: 'SOMEONE WHO KNOWS', AI: 'AI AGENT' };
// aim / loop
const LS = [26.0, 27.9, 29.6, 31.1], LD = [1.9, 1.7, 1.5, 1.3];
const ERR = [170, -110, 50, 0];
const S0 = { x: 540, y: 1600 }, G2 = { x: 540, y: 430 }, STEP = (S0.y - G2.y) / 4;
const goalPos = t => ({ x: C.x, y: lerp(C.y, G2.y, tw(t, 23.0, 24.0, E.inOutExpo)) });
const PH = i => (i === 0 ? [0.14, 0.40, 0.70] : [0.18, 0.55, 0.75]);   // decide | act | result | learn
const T_HIT = LS[3] + PH(3)[1] * LD[3];

// ---------- camera: dolly into the goal for the loop ----------
function camZ(t) { return 1 + 0.05 * Math.max(0, 1 - (t - T_HIT) / 0.35) * (t > T_HIT ? 1 : 0); }
function shake(t) {
  let a = 0;
  for (const it of ITEMS) { const d = t - (it.arr + 0.18); if (d > 0 && d < 0.2) a = Math.max(a, 14 * (1 - d / 0.2)); }
  if (t > 5.1 && t < 6.1) a = Math.max(a, 7);
  const dl = t - 21.6; if (dl > 0 && dl < 0.3) a = Math.max(a, 16 * (1 - dl / 0.3));
  const dh = t - T_HIT; if (dh > 0 && dh < 0.5) a = Math.max(a, 30 * (1 - dh / 0.5));
  const df = t - 17.35; if (df > 0 && df < 0.2) a = Math.max(a, 12 * (1 - df / 0.2));
  return { x: Math.sin(t * 91) * a, y: Math.cos(t * 77) * a };
}

// ---------- bracket target over time ----------
const itemRect = k => ({ cx: ITEMS[k].x, cy: ITEMS[k].y, w: BW + 40, h: BH + 40 });
const BR_EV = (() => {
  const ev = [[0.25, HOME, 0.3]];
  ARRIVE_ORDER.forEach(k => ev.push([ITEMS[k].arr + 0.05, itemRect(k), 0.14]));
  const R = rng(5); for (let j = 0; j < 10; j++) ev.push([5.1 + j * 0.1, itemRect(Math.floor(R() * 7)), 0.07]);
  ev.push([6.1, HOME, 0.22]);
  ev.push([21.6, LOCK, 0.18]);
  ev.push([36.95, { cx: 540, cy: 960, w: 620, h: 240 }, 0.3]);
  return ev;
})();
function bracketRect(t) {
  let prev = { cx: C.x, cy: C.y, w: 900, h: 900 }, cur = prev, t0 = 0, d = 0.3;
  for (const [et, r, dur] of BR_EV) { if (t < et) break; prev = cur; cur = r; t0 = et; d = dur; }
  const p = E.outBack(clamp((t - t0) / d));
  let r = { cx: lerp(prev.cx, cur.cx, p), cy: lerp(prev.cy, cur.cy, p), w: lerp(prev.w, cur.w, p), h: lerp(prev.h, cur.h, p) };
  // focus → loop: the locked bracket drops to the start line and becomes the runner
  if (t >= 23.0 && t < 36.9) {
    const st = { cx: S0.x, cy: S0.y, w: 130, h: 130 }, m = tw(t, 23.0, 24.2, E.inOutExpo);
    r = { cx: lerp(LOCK.cx, st.cx, m), cy: lerp(LOCK.cy, st.cy, m), w: lerp(LOCK.w, st.w, m), h: lerp(LOCK.h, st.h, m) };
    if (t >= LS[0]) { const d = loopDot(t); r = { cx: d.x, cy: d.y, w: 130, h: 130 }; }
    if (t >= T_HIT) { const k = E.outBack(tw(t, T_HIT, T_HIT + 0.2, E.lin)); r = { cx: G2.x, cy: G2.y, w: lerp(130, 250, k), h: lerp(130, 250, k) }; }
  }
  return r;
}
function loopDot(t) {
  let x = S0.x, y = S0.y;
  for (let i = 0; i < 4; i++) {
    if (t < LS[i]) break;
    const u = (t - LS[i]) / LD[i], y0 = S0.y - i * STEP, y1 = y0 - STEP, ax = S0.x + ERR[i];
    const [pd, pa, pr] = PH(i), act = E.inOutCubic(clamp((u - pd) / (pa - pd))), learn = i < 3 ? E.inOutCubic(clamp((u - pr) / (1 - pr))) : 0;
    x = learn > 0 ? lerp(ax, S0.x, learn) : lerp(S0.x, ax, act); y = lerp(y0, y1, act);
    if (u >= 1) { x = S0.x; y = y1; }
  }
  return { x, y };
}
const bracketFocusIdx = t => { if (t < 3.3 || t >= 6.1) return -1; let k = -1; for (const [et, r] of BR_EV) { if (et > t) break; const i = ITEMS.findIndex(it => it.x === r.cx && it.y === r.cy); k = i; } return k; };

// ---------- bracket pieces ----------
function pieceSeg(k, r) {
  const c = Math.floor(k / 3), p = k % 3, sx = c === 0 || c === 3 ? -1 : 1, sy = c < 2 ? -1 : 1;
  const px = r.cx + sx * r.w / 2, py = r.cy + sy * r.h / 2, arm = Math.min(90, Math.min(r.w, r.h) * 0.3);
  if (p === 0) return [[px - sx * arm * 0.3, py], [px, py], [px, py - sy * arm * 0.3]];
  if (p === 1) return [[px - sx * arm * 0.45, py], [px - sx * arm, py]];
  return [[px, py - sy * arm * 0.45], [px, py - sy * arm]];
}
function pieceAway(k, t) {
  if (!(k in HOLD)) return 0;
  return tw(t, T_YANK[k], T_YANK[k] + 0.32, E.inOutCubic) - tw(t, T_RET[k], T_RET[k] + 0.3, E.inOutCubic);
}
const awayCount = t => { let n = 0; for (const k in HOLD) if (pieceAway(+k, t) > 0.5) n++; return n; };
function holderDock(k, t) {
  const it = HOLD[k], st = itemState(it, t), idx = Object.keys(HOLD).filter(q => HOLD[q] === it).indexOf(String(k));
  if (it === 0 && t > 18.65) { const c = cardState(t); return { x: c.x - 150 * c.s + idx * 60 * c.s, y: c.y - 120 * c.s, ang: 0 }; }
  if (st.bench) { const b = BENCH[ITEMS[it].to]; return { x: b.x - 30 + idx * 60, y: b.y - 105, ang: 0 }; }
  const side = ITEMS[it].x < 540 ? 1 : -1;                       // dock on the edge facing the centre
  return { x: st.x + side * (BW / 2 + 36) * st.s, y: st.y - 22 + idx * 44, ang: Math.PI / 2 };
}
function drawBracket(t, cam) {
  const r = bracketRect(t);
  const hunting = t > 5.1 && t < 6.1, locked = t > 21.6 && t < 26;
  const inP = E.outExpo(tw(t, 0.25, 0.55, E.lin));
  if (inP <= 0) return;
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const fl = hunting ? (Math.sin(t * 90) > 0 ? 1 : 0.45) : 1;
  for (let k = 0; k < 12; k++) {
    let seg = pieceSeg(k, r); const u = pieceAway(k, t);
    let alpha = inP * fl;
    if (u > 0) {
      const dk = holderDock(k, t), mx = seg.reduce((a, p) => a + p[0], 0) / seg.length, my = seg.reduce((a, p) => a + p[1], 0) / seg.length;
      const s = lerp(1, 0.75, u), ox = lerp(0, dk.x - mx, u), oy = lerp(0, dk.y - my, u);
      const arc = Math.sin(u * Math.PI) * 120;
      seg = seg.map(([x, y]) => [mx + (x - mx) * s + ox, my + (y - my) * s + oy - arc]);
      // motion trail
      if (u > 0.05 && u < 0.95) { ctx.save(); ctx.strokeStyle = limeA(0.25); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(mx, my); ctx.quadraticCurveTo((mx + mx + ox) / 2, (my + my + oy) / 2 - 240, mx + ox, my + oy - arc); ctx.stroke(); ctx.restore(); }
    }
    ctx.strokeStyle = LIME; ctx.lineWidth = 12; ctx.globalAlpha = alpha; ctx.shadowColor = limeA(0.8); ctx.shadowBlur = locked ? 40 : 22;
    ctx.beginPath(); seg.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
  }
  ctx.restore();
  // HUD under the bracket
  const hud = tw(t, 6.2, 6.5) * (1 - tw(t, 22.6, 23.0));
  if (hud > 0) {
    const pct = Math.round(100 * (12 - awayCount(t)) / 12);
    const low = pct < 50;
    text('ATTENTION', r.cx - 12, r.cy + r.h / 2 + 64, MONO(26), limeA(0.8), { align: 'right', alpha: hud, ls: 5 });
    let punch = 0; for (const e of [...Object.values(T_YANK).map(v => v + 0.32), ...Object.values(T_RET).map(v => v + 0.3)]) { const d = t - e; if (d > 0 && d < 0.2) punch = Math.max(punch, 1 - d / 0.2); }
    ctx.save(); ctx.translate(r.cx + 12, r.cy + r.h / 2 + 66); ctx.scale(1 + punch * 0.3, 1 + punch * 0.3);
    text(`${pct}%`, 0, 0, F(900, 44), low ? '#FF453A' : LIME, { align: 'left', alpha: hud }); ctx.restore();
  }
  const st = hunting ? 'HUNTING' : t < 3.3 ? 'AF' : t < 6.1 ? 'AF' : null;
  if (st && t > 0.4) text(st, r.cx - r.w / 2, r.cy - r.h / 2 - 22, MONO(24), LIME, { align: 'left', alpha: fl * inP, ls: 4 });
  if (t > 21.6 && t < 23.0) {
    const a = tw(t, 21.65, 21.8) * (1 - tw(t, 22.7, 23.0));
    text('FOCUS LOCKED', r.cx, r.cy - r.h / 2 - 30, MONO(30), LIME, { alpha: a, ls: 6 });
  }
}

// ---------- goal ----------
function goalFocus(t) { return t < 3.3 ? 1 : t < 21.3 ? lerp(1, 0.18, tw(t, 3.3, 3.6)) : lerp(0.18, 1, tw(t, 21.3, 21.65)); }
function drawGoal(t) {
  const pop = E.outBack(tw(t, 0.1, 0.4, E.lin)); if (pop <= 0) return;
  const f = goalFocus(t), blur = (1 - f) * 14;
  ctx.save(); if (blur > 0.4) ctx.filter = `blur(${blur.toFixed(1)}px)`; ctx.globalAlpha = 0.35 + 0.65 * f;
  const fill = E.outBack(tw(t, T_HIT, T_HIT + 0.3, E.lin));
  ctx.strokeStyle = WHITE; ctx.lineWidth = 8;
  const gp = goalPos(t);
  [70, 40].forEach(rr => { ctx.beginPath(); ctx.arc(gp.x, gp.y, rr * pop, 0, 7); ctx.stroke(); });
  ctx.fillStyle = fill > 0 ? LIME : WHITE; ctx.beginPath(); ctx.arc(gp.x, gp.y, (fill > 0 ? 70 * fill : 10) * pop, 0, 7); ctx.fill();
  ctx.lineWidth = 6; for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; ctx.beginPath(); ctx.moveTo(gp.x + Math.cos(a) * 92 * pop, gp.y + Math.sin(a) * 92 * pop); ctx.lineTo(gp.x + Math.cos(a) * 118 * pop, gp.y + Math.sin(a) * 118 * pop); ctx.stroke(); }
  ctx.restore();
  ring(t, 0.1, C.x, C.y, 70, 260, WHITE, 6, 0.5);
}

// ---------- notification banners ----------
function drawGlyph(g, s) {
  ctx.save(); ctx.strokeStyle = '#FFFFFF'; ctx.fillStyle = '#FFFFFF'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (g === 'chat') { ctx.beginPath(); ctx.ellipse(0, -2, 22, 17, 0, 0, 7); ctx.fill(); ctx.beginPath(); ctx.moveTo(-12, 10); ctx.lineTo(-18, 22); ctx.lineTo(-2, 13); ctx.fill(); }
  else if (g === 'heart') { ctx.beginPath(); ctx.moveTo(0, 18); ctx.bezierCurveTo(-30, -2, -14, -26, 0, -10); ctx.bezierCurveTo(14, -26, 30, -2, 0, 18); ctx.fill(); }
  else if (g === 'news') { ctx.font = F(900, 40); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('N', 0, 2); }
  else if (g === 'tabs') { ctx.strokeRect(-18, -12, 36, 28); ctx.beginPath(); ctx.moveTo(-18, -4); ctx.lineTo(18, -4); ctx.stroke(); ctx.strokeRect(-12, -20, 36, 28); }
  else if (g === 'list') { for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(-14, -12 + i * 12, 3.5, 0, 7); ctx.fill(); ctx.beginPath(); ctx.moveTo(-4, -12 + i * 12); ctx.lineTo(18, -12 + i * 12); ctx.stroke(); } }
  else if (g === 'q') { ctx.font = F(900, 40); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('?', 0, 2); }
  else if (g === 'loop') { ctx.beginPath(); ctx.arc(0, 0, 15, 0.3, Math.PI * 1.7); ctx.stroke(); ctx.beginPath(); ctx.moveTo(14, -16); ctx.lineTo(15, -4); ctx.lineTo(3, -6); ctx.stroke(); }
  ctx.restore();
}
function itemState(k, t) {
  const it = ITEMS[k]; if (t < it.arr) return null;
  const p = clamp((t - it.arr) / 0.3), e = E.outBack(p), side = it.x < 540 ? -1 : 1;
  let x = lerp(it.x + side * 900, it.x, e), y = lerp(it.y - 260, it.y, e), rot = lerp(side * 0.35, it.r, E.outCubic(p)), s = 1, a = 1, mblur = (1 - E.outCubic(p)) * 18, bench = false;
  if (it.kind === 'burden') {
    const [h0, h1] = T_HAND[k], u = tw(t, h0, h1, E.inOutCubic);
    if (u > 0) {
      const tgt = k === 0 ? cardState(t) : BENCH[it.to];
      x = qbez(it.x, (it.x + tgt.x) / 2, tgt.x, u); y = qbez(it.y, Math.min(it.y, tgt.y) - 300, tgt.y, u); rot = lerp(it.r, 0, u) + Math.sin(u * Math.PI) * 0.3; s = lerp(1, 0.18, u); a = 1 - E.inCubic(u); mblur = Math.sin(u * Math.PI) * 10;
      if (u >= 1) { a = 0; bench = true; }
    }
  } else {
    const d = t - T_SWIPE[k]; if (d > 0) { const u = E.inCubic(clamp(d / 0.3)); x = it.x + side * u * 1200; rot = it.r + side * u * 0.2; mblur = u * 30; a = 1 - clamp((d - 0.2) / 0.1); }
  }
  // outro of the bench
  return { x, y, rot, s, a, mblur, bench };
}
function itemFocus(k, t) {
  const fi = bracketFocusIdx(t); if (fi >= 0) return fi === k ? 1 : 0.3;
  if (t < 6.1) return 1;
  let f = 0.28;
  for (const q in HOLD) if (HOLD[q] === k) { const d = t - (T_YANK[q] + 0.32); if (d > -0.2 && d < 0.3) f = Math.max(f, 0.9); }
  const it = ITEMS[k];
  if (it.kind === 'burden') { const [h0] = T_HAND[k]; if (t > h0 - 0.2) f = 1; }
  else if (t > T_SWIPE[k] - 0.15) f = 1;
  if (t > 17.3 && t < 18.4 && k !== 0) f = Math.min(f, 0.15);
  return f;
}
// Banners are pre-rendered once per (item, held, blur level): per-frame canvas blur is far too slow.
const SPR = {}, PAD = 90;
function bannerSprite(k, held, bl) {
  const key = `${k}|${held}|${bl}`; if (SPR[key]) return SPR[key];
  const it = ITEMS[k], c = document.createElement('canvas'); c.width = BW + PAD * 2; c.height = BH + PAD * 2;
  const g = c.getContext('2d');
  if (bl > 0) { g.filter = `blur(${bl}px)`; g.drawImage(bannerSprite(k, held, 0), 0, 0); SPR[key] = c; return c; }
  ctxSwap(g, () => {
    ctx.translate(c.width / 2, c.height / 2);
    ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 16;
    ctx.fillStyle = 'rgba(34,36,46,0.97)'; ctx.beginPath(); ctx.roundRect(-BW / 2, -BH / 2, BW, BH, 34); ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = held ? LIME : 'rgba(255,255,255,0.10)'; ctx.lineWidth = held ? 5 : 2; ctx.stroke();
    ctx.fillStyle = it.col; ctx.beginPath(); ctx.roundRect(-BW / 2 + 26, -38, 76, 76, 20); ctx.fill();
    ctx.save(); ctx.translate(-BW / 2 + 64, 0); drawGlyph(it.glyph); ctx.restore();
    text(it.app, -BW / 2 + 126, -14, MONO(22), 'rgba(245,245,247,0.55)', { align: 'left', ls: 3 });
    text('now', BW / 2 - 30, -14, MONO(22), 'rgba(245,245,247,0.4)', { align: 'right' });
    text(it.body, -BW / 2 + 126, 30, F(600, 34, 'Inter'), WHITE, { align: 'left' });
    if (it.kind === 'distraction') { ctx.fillStyle = '#FF453A'; ctx.beginPath(); ctx.arc(-BW / 2 + 98, -34, 15, 0, 7); ctx.fill(); }
  });
  SPR[key] = c; return c;
}
function ctxSwap(g, fn) { const keep = ctx; ctx = g; try { ctx.save(); fn(); ctx.restore(); } finally { ctx = keep; } }
function drawItem(k, t) {
  const st = itemState(k, t); if (!st || st.a <= 0.01) return;
  const f = itemFocus(k, t), blur = (1 - f) * 12 + st.mblur;
  const held = Object.keys(HOLD).some(q => HOLD[q] === k && pieceAway(+q, t) > 0.5);
  const bl = Math.min(42, Math.round(blur / 3) * 3), spr = bannerSprite(k, held, bl);
  ctx.save(); ctx.globalAlpha = st.a * (0.3 + 0.7 * f);
  ctx.translate(st.x, st.y); ctx.rotate(st.rot); ctx.scale(st.s, st.s);
  ctx.drawImage(spr, -spr.width / 2, -spr.height / 2);
  ctx.restore();
}

// ---------- notes card / bench ----------
function cardState(t) {
  const p = clamp((t - 17.3) / 0.3), e = E.outBack(p);
  let x = lerp(-500, 540, e), y = 1540, rot = lerp(-0.5, -0.03, E.outCubic(p)), s = 1;
  let bump = 0; for (const n of [17.85, 17.95, 18.2, 18.7]) { const d = t - n; if (d > 0 && d < 0.2) bump = Math.max(bump, 1 - d / 0.2); }
  const dk = tw(t, 19.25, 19.6, E.inOutExpo); x = lerp(x, BENCH.NOTES.x, dk); y = lerp(y, BENCH.NOTES.y, dk); s = lerp(1, 0.32, dk) * (1 + bump * 0.06); rot = lerp(rot, 0, dk);
  return { x, y, rot, s, on: t >= 17.3 };
}
function drawCard(t) {
  const c = cardState(t); if (!c.on) return;
  const fade = 1 - tw(t, 23.0, 23.5);
  if (fade <= 0) return;
  ctx.save(); ctx.globalAlpha = fade; ctx.translate(c.x, c.y); ctx.rotate(c.rot); ctx.scale(c.s, c.s);
  ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 20;
  ctx.fillStyle = '#FAFAF7'; ctx.beginPath(); ctx.scale(1.25, 1.25); ctx.roundRect(-230, -150, 460, 300, 26); ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.fillStyle = LIME; ctx.beginPath(); ctx.roundRect(-230, -150, 460, 56, [26, 26, 0, 0]); ctx.fill();
  text('NOTES', -200, -112, MONO(26), INK, { align: 'left', ls: 5 });
  // the caption is typed on the card itself
  const n = Math.floor(clamp((t - 17.9) / 0.6) * 14), str = 'Write it down.'.slice(0, n);
  text(str, -200, -18, F(900, 60), INK, { align: 'left', ls: -2 });
  if (n < 14 && t > 17.9 && (t * 4) % 1 < 0.6) { ctx.font = F(900, 60); ctx.letterSpacing = '-2px'; const w = ctx.measureText(str).width; ctx.fillStyle = INK; ctx.fillRect(-196 + w, -66, 7, 58); }
  [[17.95, 300], [18.2, 220], [18.7, 340]].forEach(([tt, len], i) => { const f = tw(t, tt, tt + 0.2, E.outCubic); if (f > 0) { ctx.fillStyle = i === 2 ? '#FF9F0A' : 'rgba(7,8,12,0.75)'; ctx.fillRect(-200, 26 + i * 34, len * f, 12); } });
  ctx.restore();
  if (c.s > 0.9) burst(t, 17.55, c.x + 230, c.y - 150, 20, 90, 8, LIME, 6, 0.35);
  if (t > 19.6) text('NOTES', BENCH.NOTES.x, BENCH.NOTES.y + 110, MONO(24), LIME, { alpha: fade * tw(t, 19.6, 19.8), ls: 5 });
}
// Helpers are finite runners too: each has its own focus bracket, which locks onto what you hand it.
function drawBench(t, key) {
  const b = BENCH[key], t0 = T_BENCH[key]; const p = E.outBack(tw(t, t0, t0 + 0.28, E.lin)); if (p <= 0) return;
  const fade = 1 - tw(t, 23.0, 23.5); if (fade <= 0) return;
  const work = T_WORK[key]; const d = t - work, bump = d > 0 && d < 0.3 ? Math.sin(d / 0.3 * Math.PI) : 0;
  ctx.save(); ctx.globalAlpha = fade; ctx.translate(b.x, b.y - bump * 20); ctx.scale(p, p);
  ctx.fillStyle = 'rgba(34,36,46,1)'; ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.roundRect(-92, -92, 184, 184, 36); ctx.fill(); ctx.stroke();
  if (key === 'EXPERT') {
    ctx.fillStyle = '#E5E5EA'; ctx.beginPath(); ctx.arc(-6, -22, 26, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(-6, 56, 46, Math.PI, 0); ctx.fill();
    // they already know: a lit "!" bubble
    ctx.fillStyle = LIME; ctx.beginPath(); ctx.roundRect(22, -66, 44, 44, 14); ctx.fill();
    ctx.fillStyle = INK; ctx.font = F(900, 34); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('!', 44, -43);
  } else {
    // AI: a four-point spark that spins up when it takes the job
    const pulse = t > work ? 1 + 0.12 * Math.sin((t - work) * 14) * Math.exp(-(t - work) * 2) : 1; ctx.scale(pulse, pulse);
    const star = (R, r, col) => { ctx.fillStyle = col; ctx.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 - Math.PI / 2, rr = i % 2 ? r : R; i ? ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : ctx.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); } ctx.closePath(); ctx.fill(); };
    star(58, 14, LIME); ctx.translate(34, -36); star(20, 5, WHITE);
  }
  ctx.restore();
  // its own attention locks on
  const lk = E.outBack(tw(t, work - 0.05, work + 0.2, E.lin));
  if (lk > 0 && fade > 0) {
    const hs = lerp(260, 122, lk), arm = 34;
    ctx.save(); ctx.globalAlpha = fade; ctx.strokeStyle = LIME; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.shadowColor = limeA(0.8); ctx.shadowBlur = 20;
    [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([sx, sy]) => { const x = b.x + sx * hs, y = b.y + sy * hs; ctx.beginPath(); ctx.moveTo(x - sx * arm, y); ctx.lineTo(x, y); ctx.lineTo(x, y - sy * arm); ctx.stroke(); });
    ctx.restore();
  }
  text(BENCH_LABEL[key], b.x, b.y + 150, MONO(24), LIME, { alpha: fade * clamp(p), ls: 3 });
  burst(t, work, b.x, b.y, 130, 200, 10, LIME, 6, 0.4);
}

// ---------- leak: thoughts slip out of focus ----------
const THOUGHTS = [
  { t: 16.3, s: 'that idea', dx: -1, lost: true }, { t: 16.55, s: 'the plan', dx: 1, lost: true }, { t: 16.8, s: 'her birthday', dx: -1, lost: true },
  { t: 17.7, s: 'the fix', dx: -60, lost: false }, { t: 17.95, s: 'next step', dx: 60, lost: false },
];
function drawThoughts(t) {
  for (const th of THOUGHTS) {
    const dur = th.lost ? 1.0 : 0.25, u = (t - th.t) / dur; if (u <= 0 || u >= 1) continue;
    let x, y, blur, a = 1, s = E.outBack(clamp(u * 4));
    if (th.lost) { x = C.x + th.dx * E.outCubic(u) * 330 + Math.sin(u * 7) * 16; y = C.y + 40 - E.outCubic(u) * 200; blur = E.inCubic(u) * 30; a = 1 - E.inCubic(u); }
    else { const c = cardState(t), q = E.inOutCubic(u); x = qbez(C.x + th.dx, C.x + th.dx, c.x - 100, q); y = qbez(C.y - 60, C.y + 150, c.y + 30, q); blur = 0; s *= 1 - q * 0.5; }
    ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.scale(s, s); if (blur > 0.4) ctx.filter = `blur(${blur.toFixed(1)}px)`;
    ctx.font = F(800, 36); const w = ctx.measureText(th.s).width + 50;
    ctx.fillStyle = LIME; ctx.beginPath(); ctx.roundRect(-w / 2, -32, w, 64, 32); ctx.fill();
    text(th.s, 0, 12, F(800, 36), INK); ctx.restore();
  }
}

// ---------- loop: zeroing in ----------
const MISS = [57, 37, 17];
function drawLoop(t) {
  if (t < LS[0] || t > T_HIT + 0.6) return;
  // dashed axis: the straight line you wish you could walk
  ctx.save(); ctx.setLineDash([14, 18]); ctx.strokeStyle = whiteA(0.18); ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(S0.x, S0.y); ctx.lineTo(G2.x, G2.y + 90); ctx.stroke(); ctx.restore();
  // the path actually walked
  ctx.save(); ctx.strokeStyle = LIME; ctx.lineWidth = 9; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.shadowColor = limeA(0.6); ctx.shadowBlur = 18;
  ctx.beginPath(); for (let s = LS[0]; s <= Math.min(t, T_HIT); s += 1 / 60) { const p = loopDot(s); s === LS[0] ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y); } ctx.stroke(); ctx.restore();
  for (let i = 0; i < 4; i++) {
    if (t < LS[i]) break;
    const u = (t - LS[i]) / LD[i], y0 = S0.y - i * STEP, y1 = y0 - STEP, ax = S0.x + ERR[i];
    // decide: dashed aim
    const [pd, pa, pr] = PH(i), da = clamp(u / 0.06) * (1 - clamp((u - pa + 0.1) / 0.1));
    if (da > 0 && u < 1) { ctx.save(); ctx.globalAlpha = da; ctx.setLineDash([10, 12]); ctx.strokeStyle = limeA(0.7); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(S0.x, y0); ctx.lineTo(ax, y1); ctx.stroke(); ctx.restore(); }
    if (i === 3) continue;
    // result: where reality put you
    const tr = LS[i] + pa * LD[i];
    if (t >= tr) {
      ctx.save(); ctx.strokeStyle = WHITE; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(ax, y1, 22, 0, 7); ctx.stroke(); ctx.restore();
      ring(t, tr, ax, y1, 20, 110, WHITE, 5, 0.4); burst(t, tr, ax, y1, 30, 90, 8, WHITE, 4, 0.3);
      const side = ERR[i] > 0 ? 1 : -1, ra = tw(t, tr, tr + 0.12);
      text(`OFF BY ${MISS[i]}`, ax + side * 44, y1 + 9, MONO(26), WHITE, { align: side > 0 ? 'left' : 'right', alpha: ra * lerp(1, 0.45, tw(t, LS[i] + LD[i], LS[i] + LD[i] + 0.3)), ls: 2 });
      // learn: correction arrow back toward the line
      const tl = LS[i] + pr * LD[i], la = tw(t, tl, tl + 0.12) * (1 - tw(t, LS[i] + LD[i] + 0.2, LS[i] + LD[i] + 0.5));
      if (la > 0) { ctx.save(); ctx.globalAlpha = la; ctx.strokeStyle = LIME; ctx.lineWidth = 5; ctx.setLineDash([10, 10]); ctx.beginPath(); ctx.moveTo(ax, y1 + 46); ctx.lineTo(S0.x, y1 + 46); ctx.stroke(); ctx.restore(); }
    }
  }
  if (t > T_HIT) { ring(t, T_HIT, G2.x, G2.y, 70, 700, LIME, 14, 0.6); ring(t, T_HIT + 0.08, G2.x, G2.y, 70, 480, WHITE, 8, 0.5); burst(t, T_HIT, G2.x, G2.y, 120, 420, 16, LIME, 8, 0.5); }
}
const phaseLabel = t => { for (let i = 3; i >= 0; i--) if (t >= LS[i]) { const u = (t - LS[i]) / LD[i]; if (u >= 1) return null; const [pd, pa, pr] = PH(i); return [i, u < pd ? 'DECIDE' : u < pa ? 'ACT' : u < pr ? 'RESULT' : 'LEARN']; } return null; };

// ---------- background ----------
function drawBg(t, z) {
  ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
  const lock = tw(t, 21.5, 21.9) * (1 - tw(t, 33.4, 33.6));
  const g = ctx.createRadialGradient(C.x, C.y, 50, C.x, C.y, 900);
  g.addColorStop(0, `rgba(200,255,46,${0.05 + 0.07 * lock})`); g.addColorStop(1, 'rgba(200,255,46,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // dot field (zooms with the dolly → sense of speed)
  ctx.fillStyle = 'rgba(255,255,255,0.07)';
  const sp = 90;
  for (let gx = -6; gx <= 6; gx++) for (let gy = -11; gy <= 11; gy++) {
    const x = C.x + gx * sp * z, y = C.y + gy * sp * z; if (x < -10 || x > W + 10 || y < -10 || y > H + 10) continue;
    ctx.beginPath(); ctx.arc(x, y, 2.4 * z, 0, 7); ctx.fill();
  }
}

// ---------- floods ----------
function flood(cx, cy, r, col = LIME) { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(cx, cy, Math.max(0, r), 0, 7); ctx.fill(); }

// ======================================================================
// frame
// ======================================================================
function renderFrame(tOut) {
  const t = warp(tOut);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none'; ctx.globalCompositeOperation = 'source-over';
  const z = camZ(t), sh = shake(t);
  drawBg(t, z);
  ctx.save(); ctx.translate(C.x + sh.x, C.y + sh.y); ctx.scale(z, z); ctx.translate(-C.x, -C.y);
  if (t < 36.9) { drawGoal(t); drawLoop(t); }
  // items: blurred ones first so the focused one sits on top
  const order = ITEMS.map((_, k) => k).sort((a, b) => itemFocus(a, t) - itemFocus(b, t));
  for (const k of order) drawItem(k, t);
  drawThoughts(t);
  drawCard(t);
  drawBench(t, 'EXPERT'); drawBench(t, 'AI');
  if (t < 33.5 || t > 36.9) drawBracket(t);
  ctx.restore();

  // scrim: captions that sit over the notification wall get a dark bed so they never compete with it
  const sa = tw(t, 6.1, 6.35) * (1 - tw(t, 12.3, 12.5)) + tw(t, 16.1, 16.3) * (1 - tw(t, 21.6, 22.0));
  if (sa > 0) { const g = ctx.createLinearGradient(0, 300, 0, 860); g.addColorStop(0, 'rgba(7,8,12,0)'); g.addColorStop(0.25, `rgba(7,8,12,${0.82 * sa})`); g.addColorStop(0.75, `rgba(7,8,12,${0.82 * sa})`); g.addColorStop(1, 'rgba(7,8,12,0)'); ctx.fillStyle = g; ctx.fillRect(0, 300, W, 560); }
  // ---------------- captions: at the focal point, never parked ----------------
  cap(t, 0.5, 2.05, [['You have a', WHITE, 84], ['goal.', LIME, 150]], 540, 590, 84, { gap: 0.28 });
  cap(t, 2.2, 3.28, [['Everything', WHITE, 110], ['wants your', WHITE, 110], ['attention.', LIME, 110]], 540, 500, 110, { gap: 0.2, outDir: 1 });
  cap(t, 6.25, 8.95, [['Attention', WHITE, 110], ['is finite.', LIME, 110]], 540, 640, 110, { gap: 0.2 });
  cap(t, 9.0, 10.55, [['Spend it there —', WHITE, 84], ['it’s gone here.', LIME, 84]], 540, 660, 84, { gap: 0.3 });
  cap(t, 10.6, 12.25, [['Drop what doesn’t', WHITE, 84], ['serve the goal.', LIME, 84]], 540, 660, 84, { gap: 0.22 });
  if (t < 17.35) cap(t, 16.15, 99, [['Your head', WHITE, 110], ['forgets.', LIME, 110]], 540, 620, 110, { gap: 0.2 });
  else if (t < 17.9) {                          // the line drops into the card — the eye rides it down
    const c = cardState(t), u = E.inCubic(clamp((t - 17.35) / 0.5));
    [['Your head', WHITE, 620], ['forgets.', LIME, 739]].forEach(([str, col, y0], i) => {
      const x = lerp(540, c.x + (i ? 40 : -40), u), y = qbez(y0, y0 - 60, c.y - 20, u), sc = lerp(1, 0.2, u);
      ctx.save(); ctx.translate(x, y); ctx.rotate(u * (i ? 0.25 : -0.2)); ctx.scale(sc, sc);
      text(str, 0, 0, F(900, 110), col, { alpha: 1 - u * u * u, blur: u * 4, ls: -2 }); ctx.restore();
    });
  }
  cap(t, 19.65, 21.35, [['Hand it off.', WHITE, 110]], 540, 700, 110);
  cap(t, 23.85, 25.85, [['Now all of it', WHITE, 100], ['goes to one goal.', LIME, 100]], 540, 960, 100, { gap: 0.4 });
  // loop words ride the first shot; one at a time
  // loop captions ride the head of the path: the eye is already there. Each one clears before the next
  // lands on the same spot; near the goal they ride under the head instead of over the target.
  if (t >= LS[0] && t < T_HIT + 0.3) {
    const h = loopDot(Math.min(t, T_HIT)), hx = clamp(h.x, 330, 750);
    const hy = h.y - 118, hyBelow = h.y + 250;       // side is fixed per caption, never flips mid-read
    const [, a0, r0] = PH(0), X = 0.3;             // X = exit length of a caption
    const s1 = LS[0] + a0 * LD[0], s2 = LS[0] + r0 * LD[0];
    cap(t, LS[0] + 0.02, s1 - X, [['Try.', WHITE, 96]], hx, hy, 96);
    cap(t, s1, s2 - X, [['See what’s real.', WHITE, 84]], hx, hy, 84);
    cap(t, s2, LS[1] - X, [['Adjust.', LIME, 96]], hx, hy, 96);
    cap(t, LS[1], LS[2] - X, [['Again.', WHITE, 96]], hx, hy, 96);
    cap(t, LS[2], T_HIT - 0.05, [['Every loop,', WHITE, 84], ['closer.', LIME, 84]], hx, hyBelow, 84, { gap: 0.2 });
  }
  const ph = phaseLabel(t);
  if (ph && t < T_HIT) { const r = bracketRect(t), zz = camZ(t); const sx = C.x + (r.cx - r.w / 2 - C.x) * zz, sy = C.y + (r.cy - r.h / 2 - C.y) * zz; text(ph[1], sx, sy + r.h * zz + 44, MONO(30), LIME, { align: 'left', ls: 5 }); }

  // ---------------- flood 1: "You don't know everything." ----------------
  if (t > 12.4 && t < 16.2) {
    const grow = tw(t, 12.4, 12.75, E.inOutExpo), shrink = tw(t, 15.7, 16.1, E.inOutExpo);
    flood(C.x, C.y, lerp(40, 2300, grow) * (1 - shrink));
    if (shrink < 1) {
      cap(t, 12.75, 13.6, [['You can’t', INK, 130], ['know', INK, 130], ['everything.', INK, 130]], 540, 820, 130, { shadow: false, gap: 0.14 });
      // the wall of "everything"
      if (t > 13.8 && t < 14.65) {
        const R = rng(9); const out = tw(t, 14.4, 14.65);
        for (let row = 0; row < 26; row++) for (let col = 0; col < 4; col++) {
          const d = R() * 0.4, p = clamp((t - 13.9 - d) / 0.12); if (p <= 0) continue;
          const x = 40 + col * 300 + (row % 2) * 150 - 140, y = 60 + row * 72;
          text('everything', x, y, F(900, 44), `rgba(7,8,12,${0.12 + 0.2 * R()})`, { align: 'left', alpha: p * (1 - out), blur: out * 20, ls: -1 });
        }
      }
      cap(t, 14.65, 15.7, [['But you can', INK, 110], ['leverage', INK, 150], ['everything.', INK, 110]], 540, 780, 110, { shadow: false, gap: 0.16 });
    }
  }
  // ---------------- flood 2: "Attention is all you need." ----------------
  if (t > T_HIT + 0.3) {
    const grow = tw(t, T_HIT + 0.3, T_HIT + 0.7, E.inOutExpo), shrink = tw(t, 36.7, 37.15, E.inOutExpo);
    if (shrink < 1) flood(G2.x, G2.y, lerp(80 * camZ(t), 2300, grow) * (1 - shrink));
    cap(t, T_HIT + 0.75, 36.6, [['Attention is', INK, 120], ['all you', INK, 190], ['need.', INK, 190]], 540, 800, 120, { shadow: false, gap: 0.22 });
  }
  // ---------------- outro: the bracket locks onto the name ----------------
  if (t > 37.0) {
    cap(t, 37.15, 99, [['AXIOMS', WHITE, 150]], 540, 1015, 150, { stagger: 0 });
    cap(t, 37.6, 99, [['Seven axioms for spending attention well.', whiteA(0.7), 38]], 540, 1180, 38, { weight: 600, stagger: 0.025, shadow: false });
    text('github.com/RockyHong/axioms-protocol', 540, 1250, MONO(28), LIME, { alpha: tw(t, 38.1, 38.4), ls: 1 });
  }
}
window.renderFrame = renderFrame;

// ---------- sound cues: every audible event, read from the same constants the picture uses ----------
function unwarp(ts) {                  // script time → output (video) time
  let s = 0, o = 0;
  for (const [a, b, r] of WARP) {
    if (ts < a) return o + (ts - s);
    o += a - s; s = a;
    if (ts < b) return o + (ts - a) / r;
    o += (b - a) / r; s = b;
  }
  return o + (ts - s);
}
window.cueSheet = () => {
  const U = x => Math.round(unwarp(x) * 1000) / 1000, K = o => Object.keys(o).map(Number);
  const loop = [0, 1, 2, 3].map(i => { const [pd, pa, pr] = PH(i); return { decide: U(LS[i]), act: U(LS[i] + pd * LD[i]), result: U(LS[i] + pa * LD[i]), learn: i < 3 ? U(LS[i] + pr * LD[i]) : null }; });
  return {
    dur: DUR,
    goal: U(0.1), bracketIn: U(0.25),
    captions: [0.5, 2.2, 6.25, 9.0, 10.6, 16.15, 19.65, 23.85].map(U),
    arrive: ARRIVE_ORDER.map(k => U(ITEMS[k].arr)),
    hunt: BR_EV.filter(([et, , d]) => d === 0.07).map(([et]) => U(et)),
    huntSpan: [U(5.1), U(6.1)],
    yank: YANK_SEQ.map(k => U(T_YANK[k] + 0.32)),
    swipe: K(T_SWIPE).map(k => U(T_SWIPE[k])),
    ret: K(T_RET).map(k => U(T_RET[k] + 0.3)).sort((a, b) => a - b),
    flood1: [U(12.4), U(15.7)], wall: U(13.9), statement: [U(12.75), U(14.65)],
    lost: THOUGHTS.filter(th => th.lost).map(th => U(th.t)),
    caught: THOUGHTS.filter(th => !th.lost).map(th => U(th.t + 0.25)),
    forgetsFall: [U(17.35), U(17.85)], cardSlam: U(17.3), typing: [U(17.9), U(18.5)], absorbed: U(T_HAND[0][1]),
    bench: Object.values(T_BENCH).map(U), handoff: [T_HAND[1][0], T_HAND[2][0]].map(U), work: Object.values(T_WORK).map(U),
    lock: U(21.6), glide: [U(23.0), U(24.2)],
    loop, hit: U(T_HIT), flood2: U(T_HIT + 0.3), outroLock: U(36.95), outroText: U(37.15), end: DUR,
  };
};
window.__ready = document.fonts.ready.then(() => Promise.all(['900 10px "Inter Tight"', '800 10px "Inter Tight"', '600 10px "Inter Tight"', '600 10px Inter', '500 10px "JetBrains Mono"'].map(f => document.fonts.load(f)))).then(() => true);

if (!location.search.includes('render')) {
  let t0 = performance.now(), paused = false, tp = 0;
  addEventListener('keydown', e => { if (e.code === 'Space') { paused = !paused; t0 = performance.now() - tp * 1000; } if (e.code === 'ArrowRight') tp = Math.min(DUR, tp + 0.5); if (e.code === 'ArrowLeft') tp = Math.max(0, tp - 0.5); if (paused) renderFrame(tp); });
  window.__ready.then(() => { const loop = now => { if (!paused) { tp = ((now - t0) / 1000) % DUR; renderFrame(tp); } document.getElementById('hud').textContent = `t=${tp.toFixed(2)}s`; requestAnimationFrame(loop); }; requestAnimationFrame(loop); });
} else document.body.classList.add('render');
