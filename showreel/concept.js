// AXIOMS — concept version v2 (64s, text-only, voice-over ready).
// Deterministic: every frame is a pure function of t (seconds).
// Law of the frame: one focal point at a time. A camera follows the attention dot; every caption is
// placed where the eye already is. Blue = attention. A donut of 12 slices = its finite capacity.
const W = 1080, H = 1920, DUR = 64;
window.DUR = DUR;
const cv = document.getElementById('c');
const ctx = cv.getContext('2d');

// ---------- palette ----------
const PAPER = '#F7F7F5', INK = '#111113', GREY = '#8E8E93', BLUE = '#0A5CFF', GRID = '#DCDCE0';
const blueA = a => `rgba(10,92,255,${a})`;
const inkA = a => `rgba(17,17,19,${a})`;

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
  outBack: t => { const c1 = 1.7, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
};
const tw = (t, a, b, e = E.inOutCubic) => e(clamp((t - a) / (b - a)));
const deg = d => d * Math.PI / 180;
const qbez = (a, c, b, u) => (1 - u) * (1 - u) * a + 2 * (1 - u) * u * c + u * u * b;

// ---------- type ----------
const F = (w, s, fam = 'Inter Tight') => `${w} ${s}px "${fam}"`;
const MONO = s => F(500, s, 'JetBrains Mono');
function text(str, x, y, font, color, { align = 'center', alpha = 1, ls = 0 } = {}) {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha *= alpha; ctx.font = font; ctx.letterSpacing = ls + 'px';
  ctx.textAlign = align; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = color; ctx.fillText(str, x, y); ctx.restore();
}
// Kinetic caption: words pop in with overshoot, staggered; leave by rising + fading.
// lines: [[str, color]], each line starts `gap` later. Returns nothing; draws in the current transform.
function kin(t, t0, t1, lines, x, y, size, { align = 'center', gap = 0.35, stagger = 0.07, weight = 800, lh = 1.12 } = {}) {
  if (t < t0 || t > t1 + 0.35) return;
  const q = clamp((t - t1) / 0.35);
  lines.forEach(([str, color], li) => {
    const font = F(weight, size); ctx.font = font; ctx.letterSpacing = '-1px';
    const words = str.split(' '), sp = ctx.measureText(' ').width;
    const ws = words.map(w => ctx.measureText(w).width), total = ws.reduce((a, b) => a + b, 0) + sp * (words.length - 1);
    let cx = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x;
    const ly = y + li * size * lh;
    words.forEach((w, i) => {
      const p = clamp((t - t0 - li * gap - i * stagger) / 0.5);
      if (p > 0) {
        const e = E.outBack(p), a = clamp(p * 3) * (1 - q);
        ctx.save(); ctx.globalAlpha *= a; ctx.font = font; ctx.letterSpacing = '-1px'; ctx.fillStyle = color; ctx.textBaseline = 'alphabetic';
        const wx = cx + ws[i] / 2, wy = ly + (1 - e) * size * 0.55 - q * size * 0.35;
        ctx.translate(wx, wy); const s = lerp(0.85, 1, E.outCubic(p)); ctx.scale(s, s); ctx.textAlign = 'center'; ctx.fillText(w, 0, 0); ctx.restore();
      }
      cx += ws[i] + sp;
    });
  });
}
function typewriter(t, t0, t1, str, x, y, size, color, cps = 20) {
  if (t < t0 || t > t1 + 0.35) return;
  const n = Math.min(str.length, Math.floor((t - t0) * cps)), a = 1 - clamp((t - t1) / 0.35);
  const font = F(800, size); ctx.font = font; ctx.letterSpacing = '-1px';
  const full = ctx.measureText(str).width, shown = str.slice(0, n), sw = ctx.measureText(shown).width;
  text(shown, x - full / 2, y, font, color, { align: 'left', alpha: a, ls: -1 });
  if ((t * 2.5) % 1 < 0.6 || n < str.length) { ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = color; ctx.fillRect(x - full / 2 + sw + 6, y - size * 0.78, 6, size * 0.9); ctx.restore(); }
}
// radial "pop" marks at an impact
function burst(t, t0, x, y, r0, r1, n = 8, color = INK, w = 4, dur = 0.45, rot = 0) {
  const p = (t - t0) / dur; if (p <= 0 || p >= 1) return;
  const e = E.outCubic(p); ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const a = rot + i * Math.PI * 2 / n, ra = lerp(r0, r1, e), rb = lerp(r0, r1, Math.min(1, e * 1.6 + 0.05));
    ctx.globalAlpha = 1 - p; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * ra, y + Math.sin(a) * ra); ctx.lineTo(x + Math.cos(a) * rb, y + Math.sin(a) * rb); ctx.stroke();
  }
  ctx.restore();
}

// ======================================================================
// WORLD: dot at origin, goal far above.
// ======================================================================
const G = { x: 0, y: -1300 };
const RX = 400, RY = 470;
// pills: things pulling at attention. burden → handed off; distraction → dropped.
const PILLS = [
  { label: 'remember everything', ang: 225, kind: 'burden', to: 'NOTES', slices: [10, 11] },
  { label: 'figure it all out',   ang: 165, kind: 'burden', to: 'PEOPLE', slices: [8, 9] },
  { label: 'do it all by hand',   ang: -15, kind: 'burden', to: 'TOOLS', slices: [2, 3] },
  { label: 'the feed',            ang: 32,  kind: 'distraction', slices: [4] },
  { label: 'notifications',       ang: 55,  kind: 'distraction', slices: [5] },
  { label: 'group chat',          ang: 90,  kind: 'distraction', slices: [6] },
  { label: 'the news',            ang: 125, kind: 'distraction', slices: [7] },
].map((p, k) => ({ ...p, k, hx: Math.cos(deg(p.ang)) * RX, hy: Math.sin(deg(p.ang)) * (k === 5 ? 520 : RY), tin: 7.5 + k * 0.3125 }));
const OWNER = {}; PILLS.forEach(p => p.slices.forEach(j => (OWNER[j] = p.k)));
// slices leave (yank) in this order, one per half-beat
const YANK_ORDER = [4, 5, 6, 7, 2, 3, 8, 9, 10, 11];
const T_YANK = {}; YANK_ORDER.forEach((j, i) => (T_YANK[j] = 13.1 + i * 0.3125));
const T_RET = { 10: 24.3, 11: 24.6, 8: 31.95, 9: 32.25, 2: 33.15, 3: 33.45, 4: 35.9, 5: 36.2, 6: 36.5, 7: 36.8 };
const T_DROP = { 3: 35.6, 4: 35.9, 5: 36.2, 6: 36.5 };
const HELPERS = { NOTES: { x: 0, y: 720 }, PEOPLE: { x: -340, y: 690 }, TOOLS: { x: 340, y: 690 } };
const CARD_S4 = { x: -440, y: -110 };           // where the notes card lives before the leverage flood

// ---------- camera ----------
const CAM0 = { x: 0, y: -60, z: 1.6 };
const MOVES = [
  [1.9, 3.1, 0, -650, 0.95],        // follow "goal." up
  [5.0, 5.7, 0, -80, 1.3],          // back down to the dot
  [7.0, 7.9, 0, 60, 0.85],          // pull back for the pills
  [10.6, 11.4, 0, 40, 0.85],
  [18.75, 19.6, -60, -40, 1.0],     // push in: leak
  [26.5, 29.5, 0, 130, 0.9],        // (hidden under flood) wide: leverage bench
  [39.4, 40.0, 0, -40, 1.1],        // tight on the dot
  [41.0, 42.3, 0, -1200, 1.0],      // ride the beam to the goal
  [42.8, 43.8, 0, -650, 0.85],      // whole path
  [54.1, 54.35, 0, -1300, 1.25],    // impact punch
];
function camBase(t) {
  let b = { ...CAM0 };
  for (const [a, c, x, y, z] of MOVES) {
    if (t < a) return b;
    const e = tw(t, a, c, E.inOutCubic), n = { x, y, z };
    if (t < c) return { x: lerp(b.x, n.x, e), y: lerp(b.y, n.y, e), z: lerp(b.z, n.z, e) };
    b = n;
  }
  return b;
}
function camera(t) {
  const b = camBase(t);
  // loop chapter: track the dot (smoothed), blended in/out
  const w = tw(t, 44.6, 45.6) * (1 - tw(t, 53.6, 54.1));
  if (w <= 0) return b;
  let sx = 0, sy = 0; const N = 10;
  for (let i = 0; i < N; i++) { const p = loopDot(t - i * 0.05); sx += p.x; sy += p.y; }
  const f = { x: sx / N * 0.4, y: sy / N - 160, z: 1.05 };
  return { x: lerp(b.x, f.x, w), y: lerp(b.y, f.y, w), z: lerp(b.z, f.z, w) };
}

// ---------- loop geometry ----------
const ERR = [190, -120, 55, 0], LD = [3.0, 2.5, 2.0, 1.6], LS = [45.0, 48.0, 50.5, 52.5];
const STEP = (0 - G.y) / 4;
function loopIter(t) { for (let i = 3; i >= 0; i--) if (t >= LS[i]) return i; return -1; }
function loopDot(t) {
  if (t < LS[0]) return { x: 0, y: 0 };
  let x = 0, y = 0;
  for (let i = 0; i < 4; i++) {
    if (t < LS[i]) break;
    const u = (t - LS[i]) / LD[i], y0 = -i * STEP, y1 = -(i + 1) * STEP, ax = ERR[i];
    const act = E.inOutCubic(clamp((u - 0.18) / 0.37)), learn = i < 3 ? E.inOutCubic(clamp((u - 0.75) / 0.25)) : 0;
    x = learn > 0 ? lerp(ax, 0, learn) : lerp(0, ax, act); y = lerp(y0, y1, act);
    if (u >= 1) { x = 0; y = y1; }
  }
  return { x, y };
}
const phaseOf = (i, u) => (u < 0.18 ? 'DECIDE' : u < 0.55 ? 'ACT' : u < 0.75 ? 'RESULT' : i < 3 ? 'LEARN' : 'RESULT');

// ---------- dot / disc ----------
function dotPos(t) {
  if (t >= LS[0]) return loopDot(t);
  let x = 0, y = 0;
  if (t < 10.8) {
    for (const p of PILLS) {          // recoil each time a tether hooks on
      const dt = t - (p.tin + 0.45); if (dt <= 0) continue;
      const d = Math.hypot(p.hx, p.hy), a = 30 * Math.exp(-5 * dt) * Math.cos(16 * dt);
      x += p.hx / d * a; y += p.hy / d * a;
    }
    const ten = tw(t, 9.5, 10.0) * (1 - tw(t, 10.4, 10.8));
    PILLS.forEach((p, k) => { const d = Math.hypot(p.hx, p.hy), s = Math.sin(t * (9 + k)) * 12 * ten; x += p.hx / d * s; y += p.hy / d * s; });
  }
  return { x, y };
}
function discR(t) {
  const pop = E.outBack(tw(t, 0.3, 0.8, E.lin));
  let r = 30 * pop;
  r = lerp(r, 170, E.outBack(tw(t, 10.65, 11.3, E.lin)));
  // S7 compress with anticipation
  r = lerp(r, 190, tw(t, 39.4, 39.6)); r = lerp(r, 34, tw(t, 39.6, 40.0, E.inOutExpo));
  return r;
}

// ---------- pills ----------
function pillState(p, t) {
  let x = p.hx, y = p.hy, rot = 0, s = 1, a = 1;
  const inP = clamp((t - p.tin) / 0.5);
  if (inP <= 0) return null;
  const d = Math.hypot(p.hx, p.hy), fx = p.hx / d * 1400, fy = p.hy / d * 1400;
  const e = E.outBack(inP); x = lerp(fx, p.hx, e); y = lerp(fy, p.hy, e); rot = (1 - E.outCubic(inP)) * 0.4 * Math.sign(p.hx || 1);
  if (p.k === 0) {                                          // into the notes card
    const u = tw(t, 23.6, 24.2, E.inOutCubic), c = cardPos(t);
    if (u > 0) { x = qbez(x, (x + c.x) / 2 - 80, c.x, u); y = qbez(y, Math.min(y, c.y) - 160, c.y, u); s = 1 - u; a = 1 - u * u; }
  } else if (p.kind === 'burden') {                         // handed to a helper
    const t0 = p.k === 1 ? 31.25 : 32.45, u = tw(t, t0, t0 + 0.65, E.inOutCubic), h = HELPERS[p.to];
    if (u > 0) { const tx = h.x, ty = h.y + 118; x = qbez(x, (x + tx) / 2, tx, u); y = qbez(y, Math.min(y, ty) - 220, ty, u); s = lerp(1, 0.78, u); rot = Math.sin(u * Math.PI) * 0.15; }
  } else {                                                  // dropped: tether snaps, gravity takes it
    const dt = t - T_DROP[p.k];
    if (dt > 0) { x += Math.sign(p.hx || (p.k % 2 ? 1 : -1)) * 160 * dt; y += -300 * dt + 0.5 * 4200 * dt * dt; rot = (p.k % 2 ? 1 : -1) * dt * 2.4; a = 1 - clamp((dt - 0.7) / 0.3); }
  }
  // chapter 7+: the bench recedes
  a *= 1 - 0.85 * tw(t, 39.4, 40.0);
  return { x, y, rot, s, a, held: p.slices.some(j => sliceAway(j, t) > 0.5) };
}
const PW = {};
function pillW(p) { if (!PW[p.label]) { ctx.save(); ctx.font = MONO(34); ctx.letterSpacing = '0px'; PW[p.label] = ctx.measureText(p.label).width + 64; ctx.restore(); } return PW[p.label]; }
function drawPill(p, st) {
  if (!st || st.a <= 0 || st.s <= 0.02) return;
  ctx.save(); ctx.globalAlpha *= st.a; ctx.translate(st.x, st.y); ctx.rotate(st.rot); ctx.scale(st.s, st.s);
  const w = pillW(p), h = 70;
  ctx.fillStyle = '#FFFFFF'; ctx.strokeStyle = st.held ? BLUE : INK; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, h / 2); ctx.fill(); ctx.stroke();
  text(p.label, 0, 12, MONO(34), st.held ? BLUE : INK);
  ctx.restore();
}

// ---------- slices ----------
function sliceAway(j, t) {        // 0 = home in the disc, 1 = held by its owner
  if (j === 0 || j === 1) return 0;
  const y = T_YANK[j], r = T_RET[j];
  return tw(t, y, y + 0.4, E.inOutCubic) - tw(t, r, r + 0.45, E.inOutCubic);
}
function holderPos(j, t, dp = { x: 0, y: 0 }) {
  const p = PILLS[OWNER[j]];
  if (p.k === 0 && t > 24.0) return cardPos(t);
  const st = pillState(p, t), c = st ? { x: st.x, y: st.y } : { x: p.hx, y: p.hy }, sc = st ? st.s : 1;
  const d = Math.hypot(dp.x - c.x, dp.y - c.y) || 1, ux = (dp.x - c.x) / d, uy = (dp.y - c.y) / d;
  const reach = (pillW(p) / 2 * Math.abs(ux) + 35 * Math.abs(uy)) * sc + 34 + p.slices.indexOf(j) * 0;
  const k = p.slices.indexOf(j), px = -uy, py = ux, spread = (k - (p.slices.length - 1) / 2) * 44;
  return { x: c.x + ux * reach + px * spread, y: c.y + uy * reach + py * spread };
}
const awayCount = t => { let n = 0; for (let j = 2; j < 12; j++) if (sliceAway(j, t) > 0.5) n++; return n; };
const EVENTS = [...Object.values(T_YANK).map(v => v + 0.4), ...Object.values(T_RET).map(v => v + 0.45)];

function drawDisc(t, dp) {
  const R = discR(t), split = tw(t, 11.2, 11.7) * (1 - tw(t, 39.4, 39.8));
  if (R <= 0) return;
  // capacity ring with ticks = the hard limit
  const cap = tw(t, 11.25, 11.9, E.outCubic) * (1 - tw(t, 39.4, 39.7));
  if (cap > 0) {
    ctx.save(); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.globalAlpha = cap;
    ctx.beginPath(); ctx.arc(dp.x, dp.y, R + 18, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * cap); ctx.stroke();
    for (let i = 0; i < 12; i++) { const a = deg(-90 + i * 30 - 15); ctx.beginPath(); ctx.moveTo(dp.x + Math.cos(a) * (R + 12), dp.y + Math.sin(a) * (R + 12)); ctx.lineTo(dp.x + Math.cos(a) * (R + 26), dp.y + Math.sin(a) * (R + 26)); ctx.stroke(); }
    ctx.restore();
  }
  if (split <= 0) { ctx.fillStyle = BLUE; ctx.beginPath(); ctx.arc(dp.x, dp.y, R, 0, 7); ctx.fill(); return; }
  const hub = R * 0.5 * split;
  for (let j = 0; j < 12; j++) {
    const u = sliceAway(j, t), mid = deg(-90 + j * 30), a0 = mid - deg(15 - 2 * split), a1 = mid + deg(15 - 2 * split);
    let ox = 0, oy = 0, s = 1;
    if (u > 0) {
      const h = holderPos(j, t, dp), rc = (R + hub) / 2, sd = 0.22;
      const tx = h.x - Math.cos(mid) * rc * sd, ty = h.y - Math.sin(mid) * rc * sd;   // land the wedge's centroid on the dock
      ox = (tx - dp.x) * u; oy = (ty - dp.y) * u; s = lerp(1, sd, u);
      if (u > 0.05 && u < 0.95) for (let g = 1; g <= 3; g++) {            // motion ghosts
        ctx.save(); ctx.globalAlpha = 0.12 / g; ctx.translate(dp.x + ox * (1 - g * 0.12), dp.y + oy * (1 - g * 0.12)); ctx.scale(s, s);
        ctx.fillStyle = BLUE; ctx.beginPath(); ctx.arc(0, 0, R, a0, a1); ctx.arc(0, 0, hub, a1, a0, true); ctx.closePath(); ctx.fill(); ctx.restore();
      }
    }
    if (u >= 0.999 && PILLS[OWNER[j]]?.k === 0 && t > 24.1 && t < 24.3) continue;
    const pa = OWNER[j] !== undefined ? (pillState(PILLS[OWNER[j]], t)?.a ?? 1) : 1;
    ctx.save(); ctx.globalAlpha *= u > 0.5 ? pa : 1; ctx.translate(dp.x + ox, dp.y + oy); ctx.scale(s, s);
    ctx.fillStyle = BLUE; ctx.beginPath(); ctx.arc(0, 0, R, a0, a1); ctx.arc(0, 0, hub, a1, a0, true); ctx.closePath(); ctx.fill(); ctx.restore();
  }
  // hub readout
  const ma = tw(t, 11.4, 11.9) * (1 - tw(t, 39.3, 39.5));
  if (ma > 0) {
    const pct = Math.round(100 * (12 - awayCount(t)) / 12);
    let punch = 0; for (const e of EVENTS) { const d = t - e; if (d > 0 && d < 0.3) punch = Math.max(punch, 1 - d / 0.3); }
    ctx.save(); ctx.globalAlpha = ma; ctx.translate(dp.x, dp.y + 8); const sc = 1 + 0.18 * punch; ctx.scale(sc, sc);
    text(`${pct}%`, 0, 14, F(800, 60), pct >= 100 ? BLUE : INK, { ls: -1 });
    ctx.restore();
    text('ATTENTION', dp.x, dp.y + 50, MONO(15), GREY, { alpha: ma, ls: 3 });
  }
  if (t > 37.3 && t < 38.2) { const u = tw(t, 37.3, 38.1, E.outCubic); ctx.save(); ctx.strokeStyle = blueA(1 - u); ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(dp.x, dp.y, R + 18 + u * 90, 0, 7); ctx.stroke(); ctx.restore(); }
  burst(t, 37.3, dp.x, dp.y, R + 50, R + 130, 12, BLUE, 6, 0.5);
}

// ---------- tethers ----------
function drawTethers(t, dp) {
  const R = discR(t);
  for (const p of PILLS) {
    const st = pillState(p, t); if (!st) continue;
    const hook = clamp((t - (p.tin + 0.3)) / 0.2); if (hook <= 0) continue;
    const rel = p.k === 0 ? 23.6 : p.kind === 'burden' ? (p.k === 1 ? 31.25 : 32.45) : T_DROP[p.k];
    const cut = tw(t, rel - 0.05, rel + (p.kind === 'distraction' ? 0.12 : 0.25), E.inCubic);
    if (cut >= 1) continue;
    const d = Math.hypot(st.x - dp.x, st.y - dp.y), ux = (st.x - dp.x) / d, uy = (st.y - dp.y) / d;
    const ax = dp.x + ux * R, ay = dp.y + uy * R;                          // anchor on the disc edge
    const sx = lerp(ax, st.x, cut), sy = lerp(ay, st.y, cut);
    const ex = lerp(st.x, ax, 1 - hook) , ey = lerp(st.y, ay, 1 - hook);
    const sag = Math.sin(t * 6 + p.k) * 10 + 18;
    const mx = (sx + ex) / 2 - uy * sag, my = (sy + ey) / 2 + ux * sag;
    ctx.save(); ctx.globalAlpha = st.a; ctx.strokeStyle = st.held ? BLUE : inkA(0.55); ctx.lineWidth = st.held ? 5 : 4;
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.quadraticCurveTo(mx, my, ex, ey); ctx.stroke(); ctx.restore();
    if (p.kind === 'distraction') burst(t, rel, ax + ux * 40, ay + uy * 40, 10, 50, 6, INK, 3, 0.35);
  }
}

// ---------- notes card / helpers ----------
function cardPos(t) {
  const whip = E.outBack(tw(t, 21.9, 22.5, E.lin));
  let x = lerp(-1000, CARD_S4.x, whip), y = CARD_S4.y;
  const mv = tw(t, 27.0, 29.0); x = lerp(x, HELPERS.NOTES.x, mv); y = lerp(y, HELPERS.NOTES.y, mv);
  return { x, y, rot: (1 - E.outCubic(tw(t, 21.9, 22.6, E.lin))) * -0.35 };
}
const NOTE_T = [22.9, 23.3, 24.05];            // caught thought, caught thought, absorbed pill
function drawCard(t) {
  if (t < 21.9) return;
  const c = cardPos(t), a = 1 - 0.85 * tw(t, 39.4, 40.0);
  ctx.save(); ctx.globalAlpha = a; ctx.translate(c.x, c.y); ctx.rotate(c.rot);
  let bump = 0; for (const n of NOTE_T) { const d = t - n; if (d > 0 && d < 0.25) bump = Math.max(bump, 1 - d / 0.25); }
  ctx.scale(1 + bump * 0.08, 1 + bump * 0.08);
  ctx.fillStyle = '#FFFFFF'; ctx.strokeStyle = INK; ctx.lineWidth = 4;
  ctx.shadowColor = 'rgba(0,0,0,0.10)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 10;
  ctx.beginPath(); ctx.roundRect(-100, -125, 200, 250, 18); ctx.fill(); ctx.shadowColor = 'transparent'; ctx.stroke();
  ctx.fillStyle = INK; ctx.fillRect(-100, -125 + 44, 200, 3);
  text('NOTES', 0, -125 + 32, MONO(20), INK, { ls: 4 });
  NOTE_T.forEach((n, l) => { const f = tw(t, n, n + 0.35, E.outCubic); if (f > 0) { ctx.fillStyle = l === 2 ? BLUE : INK; ctx.fillRect(-68, -48 + l * 42, (l === 1 ? 96 : 136) * f, 12); } });
  ctx.restore();
}
function drawHelper(t, key) {
  const h = HELPERS[key], t0 = key === 'PEOPLE' ? 30.9 : 32.1;
  const p = E.outBack(tw(t, t0, t0 + 0.5, E.lin)); if (p <= 0) return;
  const a = 1 - 0.85 * tw(t, 39.4, 40.0);
  const work = key === 'PEOPLE' ? 31.9 : 33.1;
  let bump = 0; const d = t - work; if (d > 0 && d < 0.35) bump = Math.sin(d / 0.35 * Math.PI);
  ctx.save(); ctx.globalAlpha = a; ctx.translate(h.x, h.y - bump * 18); ctx.scale(p, p);
  ctx.fillStyle = '#FFFFFF'; ctx.strokeStyle = INK; ctx.lineWidth = 4;
  ctx.shadowColor = 'rgba(0,0,0,0.10)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 10;
  ctx.beginPath(); ctx.roundRect(-75, -75, 150, 150, 28); ctx.fill(); ctx.shadowColor = 'transparent'; ctx.stroke();
  if (key === 'PEOPLE') {
    [[-24, 0], [24, 0]].forEach(([ox]) => { ctx.beginPath(); ctx.arc(ox, -18, 16, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.arc(ox, 38, 28, Math.PI, 0); ctx.stroke(); });
  } else {
    const spin = t > work ? (t - work) * 2.5 : 0;
    ctx.rotate(spin); ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, 0, 22, 0, 7); ctx.stroke();
    for (let k = 0; k < 8; k++) { const an = k * Math.PI / 4; ctx.beginPath(); ctx.moveTo(Math.cos(an) * 28, Math.sin(an) * 28); ctx.lineTo(Math.cos(an) * 40, Math.sin(an) * 40); ctx.stroke(); }
  }
  ctx.restore();
  text(key, h.x, h.y - 100, MONO(24), INK, { alpha: a * clamp(p), ls: 6 });
  burst(t, work, h.x, h.y, 95, 150, 8, BLUE, 5, 0.4);
}

// ---------- leak: thoughts ----------
const THOUGHTS = [
  { t: 19.4, s: 'that idea', lost: true, dx: -40 }, { t: 20.0, s: 'the plan', lost: true, dx: 50 }, { t: 20.6, s: 'her birthday', lost: true, dx: -10 },
  { t: 22.35, s: 'the fix', lost: false, dx: -30 }, { t: 22.75, s: 'next step', lost: false, dx: 30 },
];
function drawThoughts(t, dp) {
  for (const th of THOUGHTS) {
    const u = (t - th.t) / (th.lost ? 1.5 : 0.6); if (u <= 0 || u >= 1) continue;
    const sx = dp.x + th.dx, sy = dp.y - 120;
    let x, y, a = 1, sc = E.outBack(clamp(u * 5));
    if (th.lost) {
      x = sx + Math.sin(u * 6) * 18; y = sy - E.outCubic(u) * 230;
      if (u > 0.6) {                                   // dissolve into dust
        const d = (u - 0.6) / 0.4;
        for (let i = 0; i < 8; i++) { const an = i * 0.785 + th.t; ctx.fillStyle = blueA(1 - d); ctx.beginPath(); ctx.arc(x + Math.cos(an) * d * 70, y + Math.sin(an) * d * 40 - d * 30, 6 * (1 - d), 0, 7); ctx.fill(); }
        continue;
      }
    } else {
      const c = cardPos(t), q = E.inOutCubic(u);
      x = qbez(sx, (sx + c.x) / 2, c.x, q); y = qbez(sy, sy - 220, c.y - 40, q); sc *= 1 - q * 0.6;
    }
    ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ctx.globalAlpha = a;
    ctx.font = MONO(24); const w = ctx.measureText(th.s).width + 40;
    ctx.fillStyle = BLUE; ctx.beginPath(); ctx.roundRect(-w / 2, -24, w, 48, 24); ctx.fill();
    text(th.s, 0, 8, MONO(24), '#FFFFFF'); ctx.restore();
  }
}

// ---------- goal / beam / loop ----------
function drawGoal(t) {
  const p = tw(t, 2.85, 3.4, E.lin); if (p <= 0) return;
  ctx.save();
  const e = E.outBack(p);
  [80, 50].forEach((r, i) => { ctx.strokeStyle = INK; ctx.lineWidth = i ? 5 : 6; ctx.beginPath(); ctx.arc(G.x, G.y, r * e, 0, 7); ctx.stroke(); });
  // slow-turning ticks keep it alive
  const br = 1 + 0.04 * Math.sin(t * 3); ctx.lineWidth = 5; ctx.lineCap = 'round';   // fixed crosshair, breathing
  for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; ctx.beginPath(); ctx.moveTo(G.x + Math.cos(a) * 96 * e * br, G.y + Math.sin(a) * 96 * e * br); ctx.lineTo(G.x + Math.cos(a) * 128 * e * br, G.y + Math.sin(a) * 128 * e * br); ctx.stroke(); }
  const fill = E.outBack(tw(t, 54.1, 54.5, E.lin));
  if (fill > 0) { ctx.fillStyle = BLUE; ctx.beginPath(); ctx.arc(G.x, G.y, 80 * fill, 0, 7); ctx.fill(); }
  ctx.restore();
  burst(t, 3.1, G.x, G.y, 130, 220, 10, INK, 5, 0.5);
  burst(t, 54.1, G.x, G.y, 140, 300, 14, BLUE, 7, 0.6);
  const sw = tw(t, 54.1, 55.0, E.outCubic); if (sw > 0 && sw < 1) { ctx.strokeStyle = blueA(1 - sw); ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(G.x, G.y, 80 + sw * 500, 0, 7); ctx.stroke(); }
}
function drawPath(t, dp) {
  // dashed intention (ch.1-6)
  const p = tw(t, 3.1, 3.9), a = (1 - tw(t, 39.4, 39.8)) * (t > 5 && t < 39 ? 0.22 : 1);
  if (p > 0 && a > 0) {
    ctx.save(); ctx.globalAlpha = a; ctx.setLineDash([14, 16]); ctx.strokeStyle = GREY; ctx.lineWidth = 4;
    const y0 = dp.y - discR(t) - 40, y1 = G.y + 150;
    ctx.beginPath(); ctx.moveTo(dp.x, y0); ctx.lineTo(dp.x, lerp(y0, y1, p)); ctx.stroke(); ctx.restore();
  }
  // focus beam (ch.7) → splits into 4 steps
  const b = tw(t, 41.0, 42.2, E.inOutCubic); if (b <= 0) return;
  const seg = tw(t, 43.4, 44.0, E.outBack), fade = lerp(1, 0.2, tw(t, 44.8, 45.4));
  const y0 = -40, y1 = G.y + 90, tip = lerp(y0, y1, b);
  ctx.save(); ctx.strokeStyle = BLUE; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.globalAlpha = fade * (1 - tw(t, 54.1, 54.4));
  for (let s = 0; s < 4; s++) {
    const a0 = -s * STEP - (s ? 16 * seg : 0) - 40 * (s === 0), a1 = -(s + 1) * STEP + (s < 3 ? 16 * seg : 90);
    if (tip > a0) continue;
    ctx.beginPath(); ctx.moveTo(0, a0); ctx.lineTo(0, Math.max(a1, tip)); ctx.stroke();
    if (seg > 0) text(String(s + 1), -46, (a0 + a1) / 2 + 12, MONO(34), BLUE, { align: 'right', alpha: seg });
  }
  if (b < 1) { ctx.fillStyle = BLUE; ctx.beginPath(); ctx.moveTo(-22, tip + 10); ctx.lineTo(22, tip + 10); ctx.lineTo(0, tip - 26); ctx.fill(); }
  ctx.restore();
}
function drawLoop(t) {
  if (t < LS[0]) return;
  // trail sampled from the analytic path
  ctx.save(); ctx.strokeStyle = BLUE; ctx.lineWidth = 8; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.globalAlpha = 1 - tw(t, 54.2, 54.6);
  ctx.beginPath(); for (let s = LS[0]; s <= t; s += 1 / 60) { const p = loopDot(s); s === LS[0] ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y); } ctx.stroke();
  // results: contact with reality
  for (let i = 0; i < 3; i++) {
    const tr = LS[i] + 0.55 * LD[i]; if (t < tr) continue;
    const m = { x: ERR[i], y: -(i + 1) * STEP };
    ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(m.x, m.y, 20, 0, 7); ctx.stroke();
    burst(t, tr, m.x, m.y, 30, 80, 8, INK, 4, 0.4);
    // correction arrow (learn)
    const tl = LS[i] + 0.75 * LD[i], la = tw(t, tl, tl + 0.2) * (1 - tw(t, LS[i] + LD[i] + 0.3, LS[i] + LD[i] + 0.6));
    if (la > 0) { ctx.save(); ctx.globalAlpha = la; ctx.setLineDash([10, 10]); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(m.x, m.y + 40); ctx.lineTo(0, m.y + 40); ctx.stroke(); ctx.restore(); }
  }
  // aim ghost during DECIDE
  const i = loopIter(t); if (i >= 0) {
    const u = (t - LS[i]) / LD[i], a = clamp(u / 0.08) * (1 - clamp((u - 0.4) / 0.1));
    if (a > 0 && u < 1) { ctx.save(); ctx.globalAlpha = a * 0.6; ctx.setLineDash([10, 12]); ctx.strokeStyle = BLUE; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, -i * STEP); ctx.lineTo(ERR[i], -(i + 1) * STEP); ctx.stroke(); ctx.restore(); }
  }
  ctx.restore();
}

// ---------- background grid (moves with the camera = sense of travel) ----------
function drawGrid(cam) {
  const sp = 80, x0 = cam.x - W / 2 / cam.z, x1 = cam.x + W / 2 / cam.z, y0 = cam.y - H / 2 / cam.z, y1 = cam.y + H / 2 / cam.z;
  ctx.fillStyle = GRID;
  for (let x = Math.floor(x0 / sp) * sp; x <= x1; x += sp) for (let y = Math.floor(y0 / sp) * sp; y <= y1; y += sp) { ctx.beginPath(); ctx.arc(x, y, 2.4 / Math.max(cam.z, 0.6), 0, 7); ctx.fill(); }
}

// ======================================================================
// CAPTIONS (world space: they live next to the action)
// ======================================================================
function drawWorldCaptions(t, dp) {
  // ch1: "You have a goal." — "goal." flies up and becomes the target
  kin(t, 0.6, 2.2, [['You have a', INK]], 0, -190, 64);
  if (t > 1.25 && t < 3.1) {
    const p = tw(t, 1.25, 1.65, E.outBack), fly = tw(t, 1.9, 3.0, E.inOutCubic);
    const x = lerp(0, G.x, fly), y = lerp(-95, G.y + 22, fly), s = lerp(1, 0.55, fly) * (0.7 + 0.3 * p);
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); text('goal.', 0, 0, F(800, 96), BLUE, { alpha: clamp(p * 2) * (1 - tw(t, 2.85, 3.05, E.lin)), ls: -2 }); ctx.restore();
  }
  text('YOUR ATTENTION', dp.x, dp.y + 80, MONO(22), GREY, { alpha: tw(t, 3.4, 3.9) * (1 - tw(t, 4.8, 5.2)), ls: 5 });
  text('GOAL', G.x, G.y + 175, MONO(22), GREY, { alpha: tw(t, 3.4, 3.9) * (1 - tw(t, 4.8, 5.2)), ls: 5 });
  // ch2: tight on the dot, then it gets swarmed
  kin(t, 5.4, 7.0, [['But everything', INK], ['pulls at your attention.', INK]], 0, -250, 66, { gap: 0.45 });
  // ch3: over the disc
  kin(t, 11.6, 15.9, [['Attention is finite.', INK]], 0, -430, 80);
  kin(t, 16.1, 18.5, [['Spend it there,', INK], ['it’s gone here.', BLUE]], 0, -470, 76, { gap: 0.5 });
  // ch4
  kin(t, 19.5, 21.5, [['It leaks, too.', INK]], 0, -430, 80);
  typewriter(t, 21.9, 26.1, 'So write it down.', 0, -430, 80, BLUE, 16);
  // ch5 (after the flood): caption lands above the bench
  kin(t, 30.7, 34.3, [['So you can leverage', INK], ['everything.', BLUE]], 0, -500, 84, { gap: 0.25 });
  // ch6
  kin(t, 34.6, 39.2, [['Drop what doesn’t', INK], ['serve the goal.', INK]], 0, -500, 84, { gap: 0.3 });
  // ch7
  kin(t, 40.0, 40.65, [['Now all of it', INK]], 0, -150, 80);
  kin(t, 41.9, 43.3, [['goes to one goal.', BLUE]], G.x, G.y - 190, 84);
  kin(t, 43.9, 45.2, [['One step', INK], ['at a time.', INK]], 70, -690, 84, { align: 'left', gap: 0.3 });
  // ch8: words ride the first iteration
  const r0 = { x: ERR[0], y: -STEP };
  kin(t, LS[0] + 0.18 * LD[0], LS[0] + 0.52 * LD[0], [['Try.', INK]], 130, -110, 84, { align: 'left' });
  kin(t, LS[0] + 0.55 * LD[0], LS[0] + 0.72 * LD[0], [['See what’s real.', INK]], r0.x - 40, r0.y - 70, 72);
  kin(t, LS[0] + 0.75 * LD[0], LS[1] - 0.2, [['Adjust.', BLUE]], 95, r0.y + 110, 84);
  kin(t, LS[2], LS[3] + LD[3] - 0.3, [['Every loop,', INK], ['a little', BLUE], ['closer.', BLUE]], 120, -2 * STEP + 60, 62, { align: 'left', gap: 0.25 });
  const i = loopIter(t);
  if (i >= 1 && t < 54.1) {
    const u = (t - LS[i]) / LD[i], ph = phaseOf(i, u), p = loopDot(t);
    text(ph, p.x + 52, p.y + 10, MONO(30), ph === 'RESULT' ? INK : BLUE, { align: 'left', ls: 4 });
  }
}

// ======================================================================
// SCREEN-SPACE: floods and statements
// ======================================================================
function toScreen(p, cam) { return { x: W / 2 + (p.x - cam.x) * cam.z, y: H / 2 + (p.y - cam.y) * cam.z }; }
function flood(cx, cy, r) { ctx.fillStyle = BLUE; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.fill(); }
function drawScreen(t, cam, dp) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const WHITE = '#FFFFFF';
  // ch5 flood: the disc becomes the whole screen
  if (t > 26.2 && t < 30.7) {
    const o = toScreen(dp, cam), grow = tw(t, 26.25, 26.9, E.inOutExpo), shrink = tw(t, 30.0, 30.6, E.inOutExpo);
    const r0 = discR(t) * cam.z, r = lerp(r0, 2400, grow * (1 - shrink)) ;
    const c = { x: lerp(o.x, 540, grow * (1 - shrink)), y: lerp(o.y, 960, grow * (1 - shrink)) };
    if (r > r0 + 2) flood(c.x, c.y, r);
    kin(t, 26.9, 29.9, [['You don’t', WHITE], ['know everything.', WHITE]], 540, 760, 118, { gap: 0.35 });
    kin(t, 28.4, 29.9, [['So you can', WHITE], ['leverage everything.', WHITE]], 540, 1130, 96, { gap: 0.4 });
    const ul = tw(t, 29.0, 29.5, E.outCubic) * (1 - tw(t, 29.9, 30.2));
    if (ul > 0) { ctx.fillStyle = WHITE; ctx.fillRect(540 - 450, 1258, 900 * ul, 10); }
  }
  // ch9 flood from the goal
  if (t > 54.8) {
    const o = toScreen(G, cam), grow = tw(t, 54.8, 55.5, E.inOutExpo), shrink = tw(t, 59.2, 59.9, E.inOutExpo);
    const cx = lerp(o.x, 540, grow), cy = lerp(o.y, 960, grow);
    const r = shrink > 0 ? lerp(2400, 26, shrink) : lerp(80 * cam.z, 2400, grow);
    const ex = shrink > 0 ? lerp(540, 540, shrink) : cx, ey = shrink > 0 ? lerp(960, 760, shrink) : cy;
    if (t < 59.9 || true) flood(ex, ey, r);
    kin(t, 55.5, 59.0, [['Attention is', WHITE], ['all you need.', WHITE]], 540, 900, 124, { gap: 0.55 });
  }
  // ch10 outro
  const a = tw(t, 60.0, 60.6, E.outCubic);
  if (a > 0) {
    kin(t, 60.0, 99, [['AXIOMS', INK]], 540, 930, 88, { stagger: 0 });
    kin(t, 60.6, 99, [['Seven axioms for spending attention well.', GREY]], 540, 1010, 36, { weight: 600, stagger: 0.03 });
    text('github.com/RockyHong/axioms-protocol', 540, 1090, MONO(26), BLUE, { alpha: tw(t, 61.3, 61.9), ls: 1 });
  }
}

// ======================================================================
// frame
// ======================================================================
function renderFrame(t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
  const cam = camera(t), dp = dotPos(t);
  if (t < 59.3) {
    ctx.setTransform(cam.z, 0, 0, cam.z, W / 2 - cam.x * cam.z, H / 2 - cam.y * cam.z);
    drawGrid(cam);
    drawPath(t, dp);
    drawGoal(t);
    drawLoop(t);
    drawTethers(t, dp);
    for (const p of PILLS) drawPill(p, pillState(p, t));
    drawCard(t);
    drawHelper(t, 'PEOPLE'); drawHelper(t, 'TOOLS');
    drawThoughts(t, dp);
    if (t < 54.2) drawDisc(t, dp);
    drawWorldCaptions(t, dp);
  }
  drawScreen(t, cam, dp);
}
window.renderFrame = renderFrame;
window.__ready = document.fonts.ready.then(() => Promise.all(['800 10px "Inter Tight"', '600 10px "Inter Tight"', '500 10px Inter', '500 10px "JetBrains Mono"'].map(f => document.fonts.load(f)))).then(() => true);

if (!location.search.includes('render')) {
  let t0 = performance.now(), paused = false, tp = 0;
  addEventListener('keydown', e => { if (e.code === 'Space') { paused = !paused; t0 = performance.now() - tp * 1000; } if (e.code === 'ArrowRight') tp = Math.min(DUR, tp + 1); if (e.code === 'ArrowLeft') tp = Math.max(0, tp - 1); if (paused) renderFrame(tp); });
  window.__ready.then(() => { const loop = now => { if (!paused) { tp = ((now - t0) / 1000) % DUR; renderFrame(tp); } document.getElementById('hud').textContent = `t=${tp.toFixed(2)}s`; requestAnimationFrame(loop); }; requestAnimationFrame(loop); });
} else document.body.classList.add('render');
