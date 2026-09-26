// AXIOMS — KEYNOTE (16:9, ~75s). The full version: problem first, then the seven rules fix it, on screen.
// The problem is a wall of a hundred things around one goal; your attention (the 12-piece lime bracket) is split
// across it until nothing is left on the goal. Each rule then clears one kind of mess off the wall, and the
// pieces fly home one rule at a time — the percentage on the goal climbs back to 100. Then the loop,
// recursion (whatever you hand off is a goal of its own), and the apex.
// Deterministic: every frame is a pure function of t. Events sit on a 120 BPM grid (BEAT = 0.5s).
const W = 1920, H = 1080, DUR = 75;
window.DUR = DUR;
const cv = document.getElementById('c');
let ctx = cv.getContext('2d');

// ---------- palette ----------
const BG = '#07080C', LIME = '#C8FF2E', WHITE = '#F5F5F7', INK = '#07080C', RED = '#FF453A', GREY = '#8E8E93';
const CAT = { DESIGN: '#FF9F0A', MONEY: '#30D158', PEOPLE: '#BF5AF2', BUILD: '#0A84FF' };
const limeA = a => `rgba(200,255,46,${a})`;
const whiteA = a => `rgba(245,245,247,${a})`;
const inkA = a => `rgba(7,8,12,${a})`;

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

// ---------- type ----------
const F = (w, s, fam = 'Inter Tight') => `${w} ${s}px "${fam}"`;
const MONO = s => F(500, s, 'JetBrains Mono');
function text(str, x, y, font, color, { align = 'center', alpha = 1, ls = 0, blur = 0 } = {}) {
  if (alpha <= 0.003) return;
  ctx.save(); ctx.globalAlpha *= alpha; ctx.font = font; ctx.letterSpacing = ls + 'px';
  if (blur > 0.4) ctx.filter = `blur(${blur.toFixed(1)}px)`;
  ctx.textAlign = align; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = color; ctx.fillText(str, x, y); ctx.restore();
}
// Focus-in / focus-out caption (as FOCUS). lines: [[str, color, size?]]
function cap(t, tIn, tOut, lines, x, y, size, { gap = 0.18, stagger = 0.05, weight = 900, lh = 1.08, shadow = true, outDir = -1 } = {}) {
  if (t < tIn || t > tOut + 0.3) return;
  const q = clamp((t - tOut) / 0.25), qe = E.inCubic(q);
  let ly = y;
  lines.forEach(([str, color, sz = size], li) => {
    if (li) ly += sz * lh;
    const font = F(weight, sz); ctx.font = font; ctx.letterSpacing = '-2px';
    const words = str.split(' '), sp = ctx.measureText(' ').width;
    const ws = words.map(w => ctx.measureText(w).width), total = ws.reduce((a, b) => a + b, 0) + sp * (words.length - 1);
    let cx = x - total / 2;
    words.forEach((w, i) => {
      const p = clamp((t - tIn - li * gap - i * stagger) / 0.22);
      if (p > 0) {
        const e = E.outBack(p), s = lerp(1.5, 1, e) * (1 + 0.12 * qe);
        const blur = (1 - E.outCubic(p)) * 16 + qe * 22, a = clamp(p * 3) * (1 - q);
        ctx.save(); ctx.globalAlpha = a; ctx.translate(cx + ws[i] / 2, ly + outDir * qe * 50); ctx.scale(s, s);
        if (blur > 0.4) ctx.filter = `blur(${blur.toFixed(1)}px)`;
        if (shadow) { ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowBlur = 40; }
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

// ======================================================================
// SCRIPT (seconds, 0.5s beat grid)
// ======================================================================
const BEAT = 0.5, S16 = BEAT / 4;
const T = {
  lock: 0.25, hundred: 2.5, split: 5.5, finite: 8.25, forgets: 10.0,
  turn: 12.25, motto2: 14.4, rules: 16.5, R0: 19.25, RD: 4.5,
  locked: 50.75, loop: 53.75, loopRun: [54.25, 58.75], hit: 59.25,
  rec: 59.5, apex: 65.5, end: 68.5,
};
const RULES = [
  { n: '01', name: 'AIM', row: 'Know the goal. Drop the rest.', lines: [['Drop what doesn’t', WHITE], ['serve the goal.', LIME]] },
  { n: '02', name: 'CHECK', row: 'Test what’s real before you build.', lines: [['Check what’s real', WHITE], ['before you build on it.', LIME]] },
  { n: '03', name: 'SEPARATE', row: 'One job per place.', lines: [['One job per place.', WHITE], ['No mixing.', LIME]] },
  { n: '04', name: 'WHOLE', row: 'One task, one whole goal.', lines: [['One task,', WHITE], ['one whole goal.', LIME]] },
  { n: '05', name: 'EDGES', row: 'Own yours. Route the rest.', lines: [['Know what’s yours.', WHITE], ['Route the rest.', LIME]] },
  { n: '06', name: 'LEVERAGE', row: 'Borrow when it costs less.', lines: [['Borrow when it costs less', WHITE], ['than building it yourself.', LIME]] },
  { n: '07', name: 'WRITE IT DOWN', row: 'One truth, one place.', lines: [['Write it down.', WHITE], ['Once. In one place.', LIME]] },
];
RULES.forEach((r, i) => { r.t0 = T.R0 + i * T.RD; r.act = r.t0 + 0.75; });
const R = i => RULES[i];

// ---------- world: one goal, a wall of a hundred things around it ----------
const GW = 240;                                         // bracket size on the goal
const COLS = 14, ROWS = 9, PX = 270, PY = 96, CW = 250, CH = 78;
const POOL = {
  noise: ['99+ new messages', 'Someone liked your post', 'Breaking: you won’t believe…', '37 tabs open', 'New episode out', 'Sale ends tonight', 'Trending now', 'Re: re: re: FWD', 'Your weekly recap', 'Hot take thread'],
  fake: ['They’ll love it.', 'It’ll go viral.', 'Nobody does this.', 'Surely it’s fine.'],
  real: ['3 users said yes.', 'Tested on 10 people.', 'The numbers add up.'],
  mem: ['Remember the password', 'Remember the deadline', 'Remember what they said', 'Remember her birthday', 'Remember the plan', 'Remember the fix'],
  DESIGN: ['Fix the logo', 'Redo the slides', 'Edit the video', 'Pick the fonts', 'Shoot the photos', 'Make the thumbnail', 'Design the flyer'],
  MONEY: ['Do the taxes', 'Chase the invoice', 'Update the budget', 'Pay the supplier', 'Set the prices', 'Check the bank', 'File the receipts'],
  PEOPLE: ['Reply to 40 emails', 'Call the client', 'Book the meeting', 'Hire an editor', 'Answer the DMs', 'Thank the team', 'Plan the call'],
  BUILD: ['Fix the website', 'Write the proposal', 'Set up the store', 'Ship the update', 'Write the newsletter', 'Fix the checkout', 'Draft the pitch'],
};
const CATS = ['DESIGN', 'MONEY', 'PEOPLE', 'BUILD'];
const CLUSTER = { DESIGN: { x: -1150, y: -235 }, MONEY: { x: 1150, y: -235 }, PEOPLE: { x: -1150, y: 235 }, BUILD: { x: 1150, y: 235 } };
const UNITPOS = { DESIGN: { x: -820, y: -190 }, MONEY: { x: 820, y: -190 }, PEOPLE: { x: -820, y: 190 }, BUILD: { x: 820, y: 190 } };
const US = 1.2;                                          // unit scale
const HELPER = { DESIGN: { x: -1470, y: -190, who: 'AI AGENT' }, MONEY: { x: 1470, y: -190, who: 'SOMEONE WHO KNOWS' }, PEOPLE: { x: -1470, y: 190, who: 'SOMEONE WHO KNOWS' } };
const YOURS = { x: 0, y: 360 };                         // where the one you keep sits, next to the goal
const NOTES = { x: 0, y: -400 };
const CARDS = (() => {
  const cells = [];
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    if (c >= 5 && c <= 8 && r >= 3 && r <= 5) continue;
    cells.push({ gx: (c - (COLS - 1) / 2) * PX, gy: (r - (ROWS - 1) / 2) * PY });
  }
  const Rn = rng(7), idx = cells.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(Rn() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
  // 114 cells: 30 noise, 8 fake, 6 real, 6 mem (+6 = 12 mem), 58 tasks
  const kinds = [...Array(30).fill('noise'), ...Array(8).fill('fake'), ...Array(6).fill('real'), ...Array(12).fill('mem'), ...Array(58).fill('task')];
  const cnt = {}; const catCount = { DESIGN: 0, MONEY: 0, PEOPLE: 0, BUILD: 0 };
  const out = idx.map((ci, k) => {
    const kind = kinds[k], cell = cells[ci];
    cnt[kind] = (cnt[kind] || 0) + 1;
    let cat = null, label, col;
    if (kind === 'task' || kind === 'real') { cat = CATS.find(c => catCount[c] < 16 && (kind === 'real' || catCount[c] < 16)); cat = CATS[(cnt[kind] + (kind === 'real' ? 2 : 0)) % 4]; }
    const pool = kind === 'task' ? POOL[cat] : POOL[kind];
    label = pool[cnt[kind] % pool.length];
    col = kind === 'noise' ? '#FF375F' : kind === 'mem' ? '#FFD60A' : kind === 'fake' || kind === 'real' ? GREY : CAT[cat];
    const d = Math.hypot(cell.gx, cell.gy * 2.2);
    return { ...cell, kind, cat, label, col, d, rot0: (Rn() - 0.5) * 1.2 };
  });
  // task + real → 16 per category, slots in their cluster
  const bucket = { DESIGN: [], MONEY: [], PEOPLE: [], BUILD: [] };
  out.filter(c => c.kind === 'task' || c.kind === 'real').forEach((c, i) => { c.cat = CATS[i % 4]; if (c.kind === 'task') { const p = POOL[c.cat]; c.label = p[Math.floor(i / 4) % p.length]; c.col = CAT[c.cat]; } bucket[c.cat].push(c); });
  CATS.forEach(k => bucket[k].forEach((c, s) => { const cl = CLUSTER[k]; c.slot = s; c.sx = cl.x + ((s % 4) - 1.5) * PX; c.sy = cl.y + (Math.floor(s / 4) - 1.5) * PY; }));
  out.filter(c => c.kind === 'mem').forEach((c, j) => { c.slot = j; c.sx = (j - 5.5) * PX; c.sy = -640; });
  out.filter(c => c.kind === 'noise').forEach((c, j) => { c.ord = j; });
  // burst order: nearest first
  const byD = out.map((c, i) => i).sort((a, b) => out[a].d - out[b].d); byD.forEach((ci, k) => (out[ci].arr = T.hundred + 0.1 + k * 0.011));
  return out;
})();
// check beam: sweeps left → right across the wall
const BEAM = [R(1).act + 0.15, R(1).act + 2.15];
const probeT = x => lerp(BEAM[0], BEAM[1], (x + 1950) / 3900);

function cardState(i, t) {
  const c = CARDS[i]; if (t < c.arr) return null;
  const p = clamp((t - c.arr) / 0.45), e = E.outBack(p), u = E.outCubic(p);
  let x = lerp(0, c.gx, u), y = lerp(0, c.gy, u), rot = lerp(c.rot0, 0, u), s = lerp(0.2, 1, e), a = 1, dashed = false, red = false, col = c.col, gone = false;
  if (c.kind === 'noise') {
    const ts = R(0).act + 0.2 + c.ord * 0.03, q = clamp((t - ts) / 0.45);
    if (q > 0) { const n = Math.hypot(c.gx, c.gy) || 1, qq = E.inCubic(q); x += c.gx / n * qq * 2600; y += c.gy / n * qq * 2600 - Math.sin(q * Math.PI) * 120; rot += qq * (c.gx > 0 ? 0.8 : -0.8); a = 1 - q; if (q >= 1) gone = true; }
  }
  if (c.kind === 'fake' || c.kind === 'real') {
    const tp = probeT(c.gx); dashed = t < tp;
    if (c.kind === 'fake' && t >= tp) { red = true; const q = clamp((t - tp - 0.15) / 0.6); if (q > 0) { y += E.inCubic(q) * 1400; rot += q * 0.9; a = 1 - q; if (q >= 1) gone = true; } }
    if (c.kind === 'real' && t >= tp) col = CAT[c.cat];
  }
  if (c.kind === 'task' || c.kind === 'real') {
    const tm = R(2).act + 0.15 + c.slot * 0.025 + CATS.indexOf(c.cat) * 0.05, q = E.inOutCubic(clamp((t - tm) / 0.55));
    if (q > 0) { x = lerp(c.gx, c.sx, q); y = lerp(c.gy, c.sy, q) - Math.sin(q * Math.PI) * 90; }
    const ta = R(3).act + 0.25 + c.slot * 0.02, q2 = clamp((t - ta) / 0.35);
    if (q2 > 0) { const cl = CLUSTER[c.cat], qq = E.inCubic(q2); x = lerp(c.sx, cl.x, qq); y = lerp(c.sy, cl.y, qq); s *= lerp(1, 0.7, qq); a = 1 - E.inExpo(q2); if (q2 >= 1) gone = true; }
  }
  if (c.kind === 'mem') {
    const tm = R(2).act + 0.3 + c.slot * 0.03, q = E.inOutCubic(clamp((t - tm) / 0.55));
    if (q > 0) { x = lerp(c.gx, c.sx, q); y = lerp(c.gy, c.sy, q); }
    const tw_ = R(6).act + 0.35 + c.slot * 0.1, q2 = clamp((t - tw_) / 0.4);
    if (q2 > 0) { const qq = E.inOutCubic(q2); x = lerp(c.sx, NOTES.x, qq); y = lerp(c.sy, NOTES.y, qq) - Math.sin(q2 * Math.PI) * 160; s *= lerp(1, 0.3, qq); a = 1 - E.inExpo(q2); if (q2 >= 1) gone = true; }
  }
  return gone ? null : { x, y, rot, s, a, dashed, red, col };
}
const SPR = {};
function cardSprite(i, col, dashed, red) {
  const c = CARDS[i], key = `${i}|${col}|${dashed}|${red}`; if (SPR[key]) return SPR[key];
  const cv2 = document.createElement('canvas'); cv2.width = CW + 40; cv2.height = CH + 40;
  ctxSwap(cv2.getContext('2d'), () => {
    ctx.translate(cv2.width / 2, cv2.height / 2);
    ctx.fillStyle = 'rgba(30,32,42,1)'; ctx.beginPath(); ctx.roundRect(-CW / 2, -CH / 2, CW, CH, 18); ctx.fill();
    if (dashed) { ctx.setLineDash([10, 8]); ctx.strokeStyle = whiteA(0.6); ctx.lineWidth = 3; ctx.stroke(); ctx.setLineDash([]); }
    else { ctx.strokeStyle = red ? RED : 'rgba(255,255,255,0.10)'; ctx.lineWidth = red ? 4 : 2; ctx.stroke(); }
    ctx.fillStyle = red ? RED : col; ctx.beginPath(); ctx.roundRect(-CW / 2 + 14, -22, 44, 44, 12); ctx.fill();
    text(dashed ? '?' : red ? '✕' : c.kind === 'noise' ? '!' : c.kind === 'mem' ? '✎' : '✓', -CW / 2 + 36, 10, F(900, 26), '#FFFFFF');
    const tag = c.kind === 'noise' ? 'PING' : c.kind === 'mem' ? 'REMEMBER' : dashed ? 'GUESS' : red ? 'NOT REAL' : c.cat || 'TO DO';
    text(tag, -CW / 2 + 72, -10, MONO(14), red ? RED : 'rgba(245,245,247,0.5)', { align: 'left', ls: 2 });
    let fs = 21; ctx.font = F(600, fs, 'Inter'); const room = CW - 86; const w = ctx.measureText(c.label).width; if (w > room) fs = Math.floor(fs * room / w);
    text(c.label, -CW / 2 + 72, 20, F(600, fs, 'Inter'), WHITE, { align: 'left' });
  });
  SPR[key] = cv2; return cv2;
}
function ctxSwap(g, fn) { const keep = ctx; ctx = g; try { ctx.save(); fn(); ctx.restore(); } finally { ctx = keep; } }

// ---------- units: after WHOLE, each cluster is one task with one whole goal ----------
function unitState(k, t) {
  const t0 = R(3).act + 0.25 + 16 * 0.02 + 0.1; if (t < t0) return null;
  const cl = CLUSTER[k], up = UNITPOS[k], g = E.inOutExpo(clamp((t - t0 - 0.4) / 0.5));
  let x = lerp(cl.x, up.x, g), y = lerp(cl.y, up.y, g), s = E.outBack(clamp((t - t0) / 0.35)) * US, a = 1 - tw(t, R(6).t0 + 0.2, R(6).t0 + 0.6);
  if (k === 'BUILD') { const q = E.inOutCubic(clamp((t - R(4).act - 0.1) / 0.6)); x = lerp(x, YOURS.x, q); y = lerp(y, YOURS.y, q) - Math.sin(q * Math.PI) * 150; }
  else {
    const td = R(5).act + 1.3 + ['DESIGN', 'MONEY', 'PEOPLE'].indexOf(k) * 0.45, q = E.inOutCubic(clamp((t - td) / 0.45));
    const h = HELPER[k]; if (q > 0) { x = lerp(up.x, h.x, q); y = lerp(up.y, h.y, q) - Math.sin(q * Math.PI) * 120; s *= lerp(1, 0.5, q); }
  }
  if (a <= 0) return null;
  const fill = E.outBack(clamp((t - t0 - 0.3) / 0.3));
  return { x, y, s, a, fill, t0 };
}
function drawUnit(k, t) {
  const st = unitState(k, t); if (!st) return;
  ctx.save(); ctx.globalAlpha = st.a; ctx.translate(st.x, st.y); ctx.scale(st.s, st.s);
  ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 40;
  // the stack under it: 16 things became one task
  for (let j = 3; j >= 1; j--) { ctx.fillStyle = `rgba(30,32,42,${0.9 - j * 0.2})`; ctx.beginPath(); ctx.roundRect(-230 + j * 10, -80 - j * 12, 460, 160, 26); ctx.fill(); }
  ctx.fillStyle = 'rgba(34,36,46,1)'; ctx.beginPath(); ctx.roundRect(-230, -80, 460, 160, 26); ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.strokeStyle = CAT[k]; ctx.lineWidth = 4; ctx.stroke();
  text(k, -200, -30, MONO(22), CAT[k], { align: 'left', ls: 4 });
  text('ONE TASK', -200, 20, F(900, 40), WHITE, { align: 'left', ls: -1 });
  text('ONE GOAL', -200, 60, F(900, 26), whiteA(0.5), { align: 'left', ls: 0 });
  // one whole goal on it
  ctx.strokeStyle = WHITE; ctx.lineWidth = 5; [46, 26].forEach(r => { ctx.beginPath(); ctx.arc(150, 0, r, 0, 7); ctx.stroke(); });
  if (st.fill > 0) { ctx.fillStyle = LIME; ctx.beginPath(); ctx.arc(150, 0, 46 * st.fill, 0, 7); ctx.fill(); }
  ctx.restore();
  burst(t, st.t0 + 0.3, st.x + 150 * st.s, st.y, 50, 130, 8, LIME, 4, 0.35);
}

// ---------- helpers: someone who knows / an AI agent, each with its own bracket ----------
function drawHelper(k, t) {
  const h = HELPER[k], t0 = R(5).act + 0.15 + ['DESIGN', 'MONEY', 'PEOPLE'].indexOf(k) * 0.12; if (t < t0 || t > R(6).t0 + 0.7) return;
  const p = E.outBack(clamp((t - t0) / 0.35)), fade = 1 - tw(t, R(6).t0 + 0.2, R(6).t0 + 0.6);
  ctx.save(); ctx.globalAlpha = fade; ctx.translate(h.x, h.y); ctx.scale(p, p);
  ctx.fillStyle = 'rgba(34,36,46,1)'; ctx.strokeStyle = whiteA(0.15); ctx.lineWidth = 4; ctx.beginPath(); ctx.roundRect(-110, -110, 220, 220, 40); ctx.fill(); ctx.stroke();
  if (h.who === 'AI AGENT') { ctx.fillStyle = LIME; ctx.beginPath(); for (let j = 0; j < 8; j++) { const a = j * Math.PI / 4 - Math.PI / 2, rr = j % 2 ? 16 : 62; j ? ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : ctx.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); } ctx.closePath(); ctx.fill(); }
  else { ctx.fillStyle = '#E5E5EA'; ctx.beginPath(); ctx.arc(0, -28, 32, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(0, 70, 58, Math.PI, 0); ctx.fill(); }
  text(h.who, 0, 160, MONO(26), LIME, { ls: 3 });
  ctx.restore();
  // its own attention locks on what it was handed
  const td = R(5).act + 1.3 + ['DESIGN', 'MONEY', 'PEOPLE'].indexOf(k) * 0.45 + 0.45, lk = E.outBack(clamp((t - td) / 0.25));
  if (lk > 0) { ctx.save(); ctx.globalAlpha = fade; bracket(h.x, h.y, lerp(420, 270, lk), lerp(420, 270, lk), { lw: 9 }); ctx.restore(); burst(t, td, h.x, h.y, 150, 260, 10, LIME, 5, 0.35); }
}

// ---------- the bracket: 12 pieces ----------
function pieceSeg(k, r) {
  const c = Math.floor(k / 3), p = k % 3, sx = c === 0 || c === 3 ? -1 : 1, sy = c < 2 ? -1 : 1;
  const px = r.cx + sx * r.w / 2, py = r.cy + sy * r.h / 2, arm = Math.min(80, Math.min(r.w, r.h) * 0.3);
  if (p === 0) return [[px - sx * arm * 0.3, py], [px, py], [px, py - sy * arm * 0.3]];
  if (p === 1) return [[px - sx * arm * 0.45, py], [px - sx * arm, py]];
  return [[px, py - sy * arm * 0.45], [px, py - sy * arm]];
}
function bracket(cx, cy, w, h, { lw = 12, alpha = 1, glow = 22 } = {}) {
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = LIME; ctx.lineWidth = lw; ctx.globalAlpha *= alpha; ctx.shadowColor = limeA(0.8); ctx.shadowBlur = glow;
  for (let k = 0; k < 12; k++) { const seg = pieceSeg(k, { cx, cy, w, h }); ctx.beginPath(); seg.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); }
  ctx.restore();
}
// Which card each piece gets stuck on — and so which rule frees it: 3 / 2 / 1 / 1 / 1 / 2 / 2.
const FREED_BY = [0, 0, 0, 1, 1, 2, 3, 4, 5, 5, 6, 6];
const PIECE_CARD = (() => {
  const want = { 0: 'noise', 1: 'fake', 2: 'task', 3: 'task', 4: 'task', 5: 'task', 6: 'mem' }, used = new Set();
  const Rn = rng(31);
  return FREED_BY.map(r => {
    const pool = CARDS.map((c, i) => i).filter(i => !used.has(i) && CARDS[i].kind === want[r] && Math.abs(CARDS[i].gx) < 1500 && (r !== 4 || CARDS[i].cat === 'BUILD') && (r !== 5 || CARDS[i].cat === 'DESIGN' || CARDS[i].cat === 'MONEY'));
    const i = pool[Math.floor(Rn() * pool.length)]; used.add(i); return i;
  });
})();
const pieceOut = k => T.split + k * S16;
const pieceHome = k => R(FREED_BY[k]).act + (k % 3) * 0.08;
function homeRect(t) { const s = lerp(2.6, 1, E.outBack(tw(t, 0, T.lock, E.lin))); return { cx: 0, cy: 0, w: GW * s, h: GW * s }; }
function dockPts(k, i, t) {
  // a piece rides its card; once the card is folded into a task unit, it rides the unit
  const cd = CARDS[i], un = cd.cat && t > R(3).act ? unitState(cd.cat, t) : null;
  const st = un ? { x: un.x, y: un.y, w: 460 * un.s, h: 160 * un.s } : cardState(i, t) || (cd.cat && t > R(3).act ? { x: CLUSTER[cd.cat].x, y: CLUSTER[cd.cat].y } : { x: cd.gx, y: cd.gy });
  const c = Math.floor(k / 3), sx = c === 0 || c === 3 ? -1 : 1, sy = c < 2 ? -1 : 1, S = 0.5;
  const cx = st.x + sx * ((st.w || CW) / 2 + 8), cy = st.y + sy * ((st.h || CH) / 2 + 8);
  const home = { cx: 0, cy: 0, w: GW, h: GW }, px = sx * GW / 2, py = sy * GW / 2;
  return pieceSeg(k, home).map(([x, y]) => [cx + (x - px) * S, cy + (y - py) * S]);
}
function pieceState(k, t) {
  const o = pieceOut(k), hm = pieceHome(k);
  if (t < o) return { u: 1, from: 'home', to: 'home' };
  if (t < hm) return { u: clamp((t - o) / 0.28), from: 'home', to: 'card' };
  return { u: clamp((t - hm) / 0.4), from: 'card', to: 'home' };
}
const piecesHome = t => { let n = 0; for (let k = 0; k < 12; k++) { const s = pieceState(k, t); if (s.to === 'home' ? s.u > 0.5 : s.u < 0.5) n++; } return n; };
function drawPieces(t) {
  if (t > T.loop) return;
  const hr = homeRect(t);
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (let k = 0; k < 12; k++) {
    const s = pieceState(k, t), A = s.from === 'home' ? pieceSeg(k, hr) : dockPts(k, PIECE_CARD[k], t), B = s.to === 'home' ? pieceSeg(k, hr) : dockPts(k, PIECE_CARD[k], t);
    const e = E.inOutCubic(s.u), arc = Math.sin(s.u * Math.PI) * 220, lw = lerp(s.from === 'home' ? 12 : 7, s.to === 'home' ? 12 : 7, e);
    const pts = A.map(([x, y], j) => [lerp(x, B[j][0], e), lerp(y, B[j][1], e) - arc]);
    if (s.u > 0.05 && s.u < 0.95) { const m = A[0], n = pts[0], ub = E.inOutCubic(Math.max(0, s.u - 0.25)); ctx.save(); ctx.globalAlpha = 0.35; ctx.strokeStyle = LIME; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(lerp(m[0], B[0][0], ub), lerp(m[1], B[0][1], ub) - Math.sin(Math.max(0, s.u - 0.25) * Math.PI) * 220); ctx.lineTo(n[0], n[1]); ctx.stroke(); ctx.restore(); }
    ctx.strokeStyle = LIME; ctx.lineWidth = lw; ctx.shadowColor = limeA(0.8); ctx.shadowBlur = 22; ctx.globalAlpha = clamp(t / 0.05);
    ctx.beginPath(); pts.forEach(([x, y], j) => (j ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
    if (s.to === 'home' && s.u >= 1 && t - pieceHome(k) - 0.4 < 0.3) burst(t, pieceHome(k) + 0.4, 0, 0, GW * 0.6, GW * 1.1, 6, LIME, 4, 0.3);
  }
  ctx.restore();
}

// ---------- goal ----------
function goalFocus(t) { return piecesHome(t) / 12; }
function drawGoal(t) {
  if (t > T.rec + 0.2) return;
  const pop = E.outBack(tw(t, 0, 0.3, E.lin)), f = goalFocus(t), blur = (1 - f) * 10;
  const fill = E.outBack(tw(t, T.hit, T.hit + 0.3, E.lin));
  const kick = 1 + 0.15 * Math.max(0, 1 - Math.abs(t - T.hundred - 0.1) / 0.25);
  const s = 0.85 * pop * kick;
  ctx.save(); if (blur > 0.4) ctx.filter = `blur(${blur.toFixed(1)}px)`; ctx.globalAlpha = 0.35 + 0.65 * f;
  ctx.strokeStyle = WHITE; ctx.lineWidth = 8;
  [70, 40].forEach(r => { ctx.beginPath(); ctx.arc(0, 0, r * s, 0, 7); ctx.stroke(); });
  ctx.fillStyle = fill > 0 ? LIME : WHITE; ctx.beginPath(); ctx.arc(0, 0, (fill > 0 ? 70 * fill : 10) * s, 0, 7); ctx.fill();
  ctx.lineWidth = 6; for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 92 * s, Math.sin(a) * 92 * s); ctx.lineTo(Math.cos(a) * 112 * s, Math.sin(a) * 112 * s); ctx.stroke(); }
  ctx.restore();
  ring(t, 0, 0, 0, 70, 300, WHITE, 6, 0.5); ring(t, T.hundred, 0, 0, 60, 500, WHITE, 10, 0.5); burst(t, T.hundred, 0, 0, 100, 380, 16, WHITE, 6, 0.45);
  ring(t, T.split + 12 * S16 + 0.3, 0, 0, 60, 360, RED, 10, 0.6);
}
// thoughts leave the goal and blur out (your head forgets)
function drawThoughts(t) {
  [['the plan', -1, T.forgets + 0.2], ['that idea', 1, T.forgets + 0.5], ['what they said', 0.3, T.forgets + 0.8], ['the fix', -0.5, T.forgets + 1.1]].forEach(([s, dx, t0]) => {
    const u = (t - t0) / 1.0; if (u <= 0 || u >= 1) return;
    const x = dx * E.outCubic(u) * 220, y = -30 - E.outCubic(u) * 170, blur = E.inCubic(u) * 24, a = 1 - E.inCubic(u), sc = E.outBack(clamp(u * 4)) * 0.8;
    ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.scale(sc, sc); if (blur > 0.4) ctx.filter = `blur(${blur.toFixed(1)}px)`;
    ctx.font = F(800, 36); const w = ctx.measureText(s).width + 50;
    ctx.fillStyle = LIME; ctx.beginPath(); ctx.roundRect(-w / 2, -32, w, 64, 32); ctx.fill(); text(s, 0, 12, F(800, 36), INK); ctx.restore();
  });
}

// ---------- rule-specific overlays on the wall ----------
function drawOverlays(t) {
  // CHECK: the beam
  if (t > BEAM[0] - 0.1 && t < BEAM[1] + 0.2) {
    const x = lerp(-1950, 1950, clamp((t - BEAM[0]) / (BEAM[1] - BEAM[0]))), a = tw(t, BEAM[0] - 0.1, BEAM[0]) * (1 - tw(t, BEAM[1], BEAM[1] + 0.2));
    const g = ctx.createLinearGradient(x - 260, 0, x + 20, 0); g.addColorStop(0, limeA(0)); g.addColorStop(1, limeA(0.22 * a));
    ctx.fillStyle = g; ctx.fillRect(x - 260, -520, 280, 1040);
    ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = LIME; ctx.lineWidth = 6; ctx.shadowColor = limeA(1); ctx.shadowBlur = 30; ctx.beginPath(); ctx.moveTo(x, -520); ctx.lineTo(x, 520); ctx.stroke(); ctx.restore();
  }
  // SEPARATE: category labels over the clusters
  CATS.forEach((k, i) => {
    const a = tw(t, R(2).act + 0.6 + i * 0.05, R(2).act + 0.9 + i * 0.05) * (1 - tw(t, R(3).act + 0.1, R(3).act + 0.3));
    const cl = CLUSTER[k]; text(k, cl.x, cl.y - 2 * PY - 40, MONO(30), CAT[k], { alpha: a, ls: 8 });
  });
  // EDGES: your boundary; every other thing at the edge gets a route
  const bA = tw(t, R(4).act + 0.7, R(4).act + 1.0);
  if (bA > 0 && t < T.loop) {
    const bx = -470, by = -230, bw = 940, bh = 720, per = 2 * (bw + bh), len = per * E.inOutCubic(tw(t, R(4).act + 0.7, R(4).act + 1.3, E.lin));
    const fade = 1 - tw(t, R(6).t0 + 0.2, R(6).t0 + 0.6);
    ctx.save(); ctx.globalAlpha = fade; ctx.strokeStyle = LIME; ctx.lineWidth = 7; ctx.shadowColor = limeA(0.8); ctx.shadowBlur = 20; ctx.setLineDash([len, per]); ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 40); ctx.stroke(); ctx.restore();
    text('YOURS', bx + 30, by + 50, MONO(30), LIME, { align: 'left', alpha: bA * fade, ls: 8 });
    ['DESIGN', 'MONEY', 'PEOPLE'].forEach((k, i) => {
      const ra = tw(t, R(4).act + 1.4 + i * 0.2, R(4).act + 1.6 + i * 0.2) * (1 - tw(t, R(5).act + 1.3 + i * 0.45, R(5).act + 1.6 + i * 0.45));
      if (ra <= 0) return;
      // not mine → the edge routes it outward: to whom? (answered by LEVERAGE)
      const up = UNITPOS[k], h = HELPER[k], sd = Math.sign(up.x), ex = up.x + sd * 290, dl = E.inOutCubic(tw(t, R(4).act + 1.4 + i * 0.2, R(4).act + 1.7 + i * 0.2, E.lin));
      ctx.save(); ctx.globalAlpha = ra; ctx.strokeStyle = LIME; ctx.lineWidth = 5; ctx.setLineDash([14, 12]); ctx.beginPath(); ctx.moveTo(ex, up.y); ctx.lineTo(lerp(ex, h.x - sd * 60, dl), up.y); ctx.stroke(); ctx.restore();
      const qa = ra * tw(t, R(4).act + 1.7 + i * 0.2, R(4).act + 1.8 + i * 0.2);
      ctx.save(); ctx.globalAlpha = qa; ctx.fillStyle = LIME; ctx.beginPath(); ctx.arc(h.x, up.y, 50, 0, 7); ctx.fill(); ctx.restore();
      text('?', h.x, up.y + 20, F(900, 60), INK, { alpha: qa });
    });
    const q = tw(t, R(4).act + 1.9, R(4).act + 2.1) * (1 - tw(t, R(5).act, R(5).act + 0.2));
    text('IF NOT ME, THEN WHO?', 0, by - 40, MONO(30), LIME, { alpha: q, ls: 6 });
  }
  // LEVERAGE: attention cost, build vs borrow, over each task
  if (t > R(5).act && t < R(6).act + 0.3) {
    const out = 1 - tw(t, R(6).act, R(6).act + 0.3);
    [['DESIGN', 7, 2], ['MONEY', 9, 2], ['PEOPLE', 6, 3], ['BUILD', 1, 4]].forEach(([k, b, o], i) => {
      const st = unitState(k, t); if (!st) return;
      const t0 = R(5).act + 0.35 + i * 0.12, a = tw(t, t0, t0 + 0.2) * out, dec = k === 'BUILD' ? R(5).act + 2.8 : R(5).act + 1.3 + i * 0.45;
      const leave = k === 'BUILD' ? 0 : tw(t, dec, dec + 0.15);
      if (a * (1 - leave) <= 0) return;
      const x = UNITPOS[k].x * (k === 'BUILD' ? 0 : 1), y = (k === 'BUILD' ? YOURS.y + 170 : UNITPOS[k].y - 165);
      ctx.save(); ctx.globalAlpha = a * (1 - leave);
      [['BUILD', b, -1], ['BORROW', o, 1]].forEach(([lab, n, side]) => {
        const win = (lab === 'BUILD') === (b <= o), chosen = t > dec - 0.25 && win;
        const bx = x + side * 120;
        ctx.fillStyle = 'rgba(20,22,30,0.95)'; ctx.beginPath(); ctx.roundRect(bx - 110, y - 44, 220, 88, 16); ctx.fill();
        if (chosen) { ctx.strokeStyle = LIME; ctx.lineWidth = 4; ctx.stroke(); }
        text(lab, bx, y - 12, MONO(20), chosen ? LIME : whiteA(0.7), { ls: 3 });
        const shown = Math.min(n, Math.ceil(clamp((t - t0 - 0.1) / 0.4) * n));
        for (let j = 0; j < n; j++) { ctx.fillStyle = j < shown ? (win ? LIME : RED) : whiteA(0.1); ctx.fillRect(bx - (n * 18) / 2 + j * 18 + 3, y + 6, 12, 26); }
      });
      ctx.restore();
    });
  }
  // WRITE IT DOWN: the notes card
  if (t > R(6).act - 0.1 && t < T.loop) {
    const p = E.outBack(tw(t, R(6).act, R(6).act + 0.3, E.lin)), fade = 1 - tw(t, T.locked, T.locked + 0.4);
    const n = Math.floor(clamp((t - R(6).act - 0.4) / 1.2) * 14), str = 'Write it down.'.slice(0, n);
    ctx.save(); ctx.globalAlpha = fade; ctx.translate(NOTES.x, NOTES.y); ctx.scale(p, p);
    ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 50; ctx.fillStyle = '#FAFAF7'; ctx.beginPath(); ctx.roundRect(-260, -130, 520, 260, 26); ctx.fill(); ctx.shadowColor = 'transparent';
    ctx.fillStyle = LIME; ctx.beginPath(); ctx.roundRect(-260, -130, 520, 58, [26, 26, 0, 0]); ctx.fill();
    text('NOTES · ONE PLACE', -230, -90, MONO(24), INK, { align: 'left', ls: 4 });
    text(str, -230, 0, F(900, 56), INK, { align: 'left', ls: -2 });
    for (let j = 0; j < 3; j++) { const f = tw(t, R(6).act + 1.2 + j * 0.3, R(6).act + 1.4 + j * 0.3); ctx.fillStyle = inkA(0.7); ctx.fillRect(-230, 40 + j * 26, [380, 300, 340][j] * f, 10); }
    ctx.restore();
  }
}

// ---------- camera (world → screen) ----------
// [time, cx, cy, zoom, duration]  moves ease in/out expo: hard, fast, keynote.
const CAM = [
  [0, 0, 0, 1.7, 0.01],
  [T.hundred + 0.15, 0, 0, 0.52, 1.3],
  [T.finite, 0, 0, 1.35, 0.5],
  [T.turn, 0, 0, 1.6, 0.6],
  [T.rules, 0, 0, 0.52, 0.8],
  [R(0).t0 + 0.6, 0, 0, 0.62, 0.3],
  [R(1).t0 + 0.6, 0, 0, 0.62, 0.3],
  [R(2).t0 + 0.6, 0, -60, 0.5, 0.3],
  [R(3).t0 + 0.6, CLUSTER.DESIGN.x, CLUSTER.DESIGN.y, 1.0, 0.3],
  [R(3).act + 0.9, 0, 0, 0.6, 0.6],
  [R(4).t0 + 0.6, 0, 260, 0.6, 0.4],
  [R(5).t0 + 0.6, 0, 290, 0.58, 0.4],
  [R(6).t0 + 0.6, 0, -230, 0.66, 0.4],
  [T.locked, 0, 0, 1.25, 0.7],
  [T.loop, 0, 0, 1.0, 0.5],
];
function cam(t) {
  let prev = CAM[0], cur = CAM[0];
  for (const k of CAM) { if (t < k[0]) break; prev = cur; cur = k; }
  const p = E.inOutExpo(clamp((t - cur[0]) / cur[4]));
  const c = { x: lerp(prev[1], cur[1], p), y: lerp(prev[2], cur[2], p), z: lerp(prev[3], cur[3], p) };
  // CHECK: the camera rides the beam across the wall
  const bw = tw(t, R(1).t0 + 0.6, R(1).act + 0.1) * (1 - tw(t, BEAM[1], BEAM[1] + 0.5));
  if (bw > 0) { const bx = clamp(lerp(-1950, 1950, clamp((t - BEAM[0]) / (BEAM[1] - BEAM[0]))), -1250, 1250); c.x = lerp(c.x, bx, bw); c.z = lerp(c.z, 0.9, bw); }
  c.z *= 1 + 0.015 * Math.sin(t * 0.9);                  // breathing
  return c;
}
function shake(t) {
  let a = 0; const hit = (t0, amp, d) => { const x = t - t0; if (x > 0 && x < d) a = Math.max(a, amp * (1 - x / d)); };
  hit(T.lock, 16, 0.25); hit(T.hundred, 22, 0.4); hit(T.split + 12 * S16 + 0.3, 16, 0.35);
  RULES.forEach(r => hit(r.t0 + 0.2, 20, 0.3)); hit(T.locked + 0.7, 18, 0.35); hit(T.hit, 28, 0.5); hit(T.turn + 0.3, 14, 0.3); hit(T.apex + 0.3, 14, 0.3);
  return { x: Math.sin(t * 91) * a, y: Math.cos(t * 77) * a };
}

// ---------- background ----------
function drawBg(t, c) {
  ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
  const g = ctx.createRadialGradient(W / 2, H / 2, 50, W / 2, H / 2, 1100);
  g.addColorStop(0, `rgba(200,255,46,${0.03 + 0.07 * goalFocus(t)})`); g.addColorStop(1, 'rgba(200,255,46,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // dot grid in world space → parallax with the camera
  const sp = 90 * c.z; if (sp < 12) return;
  ctx.fillStyle = 'rgba(255,255,255,0.07)';
  const ox = (W / 2 - c.x * c.z) % sp, oy = (H / 2 - c.y * c.z) % sp;
  for (let x = ox - sp; x < W + sp; x += sp) for (let y = oy - sp; y < H + sp; y += sp) { ctx.beginPath(); ctx.arc(x, y, Math.max(1.2, 2.4 * c.z), 0, 7); ctx.fill(); }
}

// ---------- the loop ----------
const LOOP_R = 330, NODES = ['DECIDE', 'ACT', 'RESULT', 'LEARN'];
const loopAng = t => -Math.PI / 2 + 2 * Math.PI * (t - T.loopRun[0]) / 2.25;
const loopRad = t => LOOP_R * (1 - E.inOutCubic(clamp((t - T.loopRun[0]) / (T.hit - T.loopRun[0]))));
function drawLoop(t) {
  if (t < T.loop || t > T.rec + 0.3) return;
  const a0 = tw(t, T.loop, T.loop + 0.3), fade = 1 - tw(t, T.rec, T.rec + 0.3);
  ctx.save(); ctx.globalAlpha = fade;
  ctx.save(); ctx.globalAlpha *= 0.25 * a0; ctx.setLineDash([12, 16]); ctx.strokeStyle = WHITE; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, LOOP_R, 0, 7); ctx.stroke(); ctx.restore();
  NODES.forEach((n, i) => {
    const ang = -Math.PI / 2 + i * Math.PI / 2, x = Math.cos(ang) * (LOOP_R + 80), y = Math.sin(ang) * (LOOP_R + 55) + 10;
    const lit = [0, 1].map(l => T.loopRun[0] + (l + i / 4) * 2.25).some(tt => t > tt - 0.05 && t < tt + 0.4);
    text(n, x, y, MONO(30), lit ? LIME : whiteA(0.45), { ls: 5, alpha: a0 });
  });
  if (t > T.loopRun[0]) {
    ctx.save(); ctx.strokeStyle = LIME; ctx.lineWidth = 8; ctx.shadowColor = limeA(0.6); ctx.shadowBlur = 16; ctx.beginPath();
    for (let s = T.loopRun[0]; s <= Math.min(t, T.hit); s += 1 / 60) { const r = loopRad(s), an = loopAng(s); s === T.loopRun[0] ? ctx.moveTo(Math.cos(an) * r, Math.sin(an) * r) : ctx.lineTo(Math.cos(an) * r, Math.sin(an) * r); }
    ctx.stroke(); ctx.restore();
  }
  const out = E.inOutCubic(tw(t, T.loop, T.loopRun[0], E.lin));
  let x, y, s;
  if (t < T.loopRun[0]) { x = 0; y = -LOOP_R * out; s = lerp(GW, 110, out); }
  else { const tt = Math.min(t, T.hit), r = loopRad(tt), an = loopAng(tt); x = Math.cos(an) * r; y = Math.sin(an) * r; s = lerp(110, 260, E.outBack(tw(t, T.hit, T.hit + 0.25, E.lin))); }
  bracket(x, y, s, s, { lw: 9 });
  ctx.restore();
  ring(t, T.hit, 0, 0, 70, 900, LIME, 16, 0.7); ring(t, T.hit + 0.08, 0, 0, 70, 600, WHITE, 8, 0.5); burst(t, T.hit, 0, 0, 120, 500, 18, LIME, 8, 0.5);
}

// ---------- recursion: hand it off, and it's a goal of its own ----------
const REC_R = 6, REC_LAB = ['YOU', 'SOMEONE YOU HANDED IT TO', 'THEIR AI AGENT', ''];
function drawRec(t) {
  if (t < T.rec - 0.1 || t > T.apex + 0.1) return;
  const inP = tw(t, T.rec - 0.1, T.rec + 0.25), zoom = Math.pow(REC_R, 2 * E.inOutCubic(tw(t, T.rec + 0.6, T.apex - 0.4, E.lin)));
  ctx.save(); ctx.globalAlpha = inP; ctx.beginPath(); ctx.rect(0, 0, W, 700); ctx.clip(); ctx.translate(W / 2, 400);
  for (let lv = 0; lv < 4; lv++) {
    const s = zoom / Math.pow(REC_R, lv); if (s < 0.02 || s > 12) continue;
    ctx.save(); ctx.globalAlpha *= clamp((12 - s) / 5);
    ctx.strokeStyle = WHITE; ctx.lineWidth = Math.max(1, 8 * s);
    ctx.beginPath(); ctx.arc(0, 0, 70 * s, 0, 7); ctx.stroke();
    ctx.lineWidth = Math.max(1, 6 * s); for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 92 * s, Math.sin(a) * 92 * s); ctx.lineTo(Math.cos(a) * 112 * s, Math.sin(a) * 112 * s); ctx.stroke(); }
    bracket(0, 0, 300 * s, 300 * s, { lw: Math.max(1.5, 12 * s), glow: 22 * Math.min(1, s) });
    if (REC_LAB[lv] && s > 0.35 && s < 3) text(REC_LAB[lv], -150 * s, -150 * s - 22 * Math.min(1.4, s), MONO(Math.round(24 * Math.min(1.4, s))), LIME, { align: 'left', ls: 4, alpha: clamp((s - 0.35) / 0.3) * clamp(3 - s) });
    ctx.restore();
  }
  ctx.restore();
  const g = ctx.createLinearGradient(0, 560, 0, 700); g.addColorStop(0, inkA(0)); g.addColorStop(1, inkA(inP)); ctx.fillStyle = g; ctx.fillRect(0, 560, W, 140);
}

// ---------- stingers: each rule arrives as a hard lime wipe with its number and name ----------
function drawStinger(t, r, i) {
  const u = t - r.t0; if (u < 0 || u > 0.8) return;
  const inn = E.inOutExpo(clamp(u / 0.2)), out = E.inOutExpo(clamp((u - 0.55) / 0.2)), sk = 260;
  const x0 = lerp(-W - sk, 0, inn) + out * (W + sk);
  ctx.save();
  ctx.fillStyle = LIME; ctx.beginPath(); ctx.moveTo(x0, 0); ctx.lineTo(x0 + W + sk, 0); ctx.lineTo(x0 + W, H); ctx.lineTo(x0 - sk, H); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x0, 0); ctx.lineTo(x0 + W + sk, 0); ctx.lineTo(x0 + W, H); ctx.lineTo(x0 - sk, H); ctx.closePath(); ctx.clip();
  const drift = (u - 0.2) * 60;
  // the numeral: huge outline
  ctx.save(); ctx.font = F(900, 620); ctx.letterSpacing = '-30px'; ctx.lineWidth = 6; ctx.strokeStyle = inkA(0.35); ctx.textAlign = 'left'; ctx.strokeText(r.n, 80 - drift, 800); ctx.restore();
  // the name slams in
  const p = clamp((u - 0.12) / 0.2), sc = lerp(1.6, 1, E.outBack(p));
  ctx.font = F(900, 230); ctx.letterSpacing = '-8px'; let fs = 230; const w = ctx.measureText(r.name).width; if (w > 1300) fs = Math.floor(230 * 1300 / w);
  ctx.save(); ctx.translate(1020 + drift * 0.5, 640); ctx.scale(sc, sc); ctx.globalAlpha = clamp(p * 3);
  text(r.name, 0, 0, F(900, fs), INK, { align: 'center', ls: -8 }); ctx.restore();
  text(`RULE ${r.n} / 07`, 1020, 380, MONO(34), INK, { alpha: clamp(p * 3), ls: 10 });
  ctx.restore();
}

// ---------- the rules tracker (screen, top-left) ----------
function drawTracker(t) {
  if (t < T.R0 || t > T.loop + 0.3) return;
  const a = tw(t, T.R0 + 0.7, T.R0 + 1.0) * (1 - tw(t, T.loop, T.loop + 0.3));
  text('SEVEN RULES', 70, 978, MONO(22), limeA(0.8), { align: 'left', alpha: a, ls: 6 });
  RULES.forEach((r, i) => {
    const done = t > r.act, cur = t > r.t0 && t < r.t0 + T.RD;
    ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = done ? LIME : whiteA(0.15); ctx.fillRect(70 + i * 46, 998, 36, 6); ctx.restore();
    if (cur) text(r.name, 70, 1044, F(900, 30), WHITE, { align: 'left', alpha: a * tw(t, r.act, r.act + 0.2), ls: -1 });
  });
}

// ---------- floods ----------
function flood(cx, cy, r, col = LIME) { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(cx, cy, Math.max(0, r), 0, 7); ctx.fill(); }

// ---------- HUD on the goal (screen space, anchored to the goal) ----------
function drawHud(t, sx, sy, z) {
  const a = tw(t, 0.4, 0.7) * (1 - tw(t, T.locked + 1.5, T.locked + 1.8)) * (t < T.turn || t > T.R0 + 0.75 ? 1 : 0);
  if (a <= 0) return;
  const pct = Math.round(100 * piecesHome(t) / 12), low = pct < 50, x = sx + GW / 2 * z + 36;
  let punch = 0;
  for (let k = 0; k < 12; k++) for (const e of [pieceOut(k) + 0.14, pieceHome(k) + 0.4]) { const d = t - e; if (d > 0 && d < 0.2) punch = Math.max(punch, 1 - d / 0.2); }
  text('ON GOAL', x, sy - 14, MONO(22), low ? 'rgba(255,69,58,0.9)' : limeA(0.85), { align: 'left', alpha: a, ls: 5 });
  ctx.save(); ctx.translate(x, sy + 40); ctx.scale(1 + punch * 0.25, 1 + punch * 0.25);
  text(`${pct}%`, 0, 0, F(900, 56), low ? RED : LIME, { align: 'left', alpha: a }); ctx.restore();
  if (t > T.locked + 0.7) text('FOCUS LOCKED', sx, sy - GW / 2 * z - 30, MONO(30), LIME, { alpha: tw(t, T.locked + 0.7, T.locked + 0.8) * (1 - tw(t, T.locked + 1.5, T.locked + 1.8)), ls: 8 });
}

// ======================================================================
// frame
// ======================================================================
const CAPY = 862;                              // caption: first baseline, screen space (fixed)
function scrim(a, y0 = 700, y1 = 1080) {
  if (a <= 0) return; const g = ctx.createLinearGradient(0, y0, 0, y0 + 120); g.addColorStop(0, inkA(0)); g.addColorStop(1, inkA(0.88 * a));
  ctx.fillStyle = g; ctx.fillRect(0, y0, W, 120); ctx.fillStyle = inkA(0.88 * a); ctx.fillRect(0, y0 + 120, W, y1 - y0 - 120);
}
function renderFrame(t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none'; ctx.globalCompositeOperation = 'source-over';
  const c = cam(t), sh = shake(t);
  drawBg(t, c);
  const sx = W / 2 + (0 - c.x) * c.z + sh.x, sy = H / 2 + (0 - c.y) * c.z + sh.y;   // goal on screen
  // ---- world ----
  ctx.save(); ctx.translate(W / 2 + sh.x, H / 2 + sh.y); ctx.scale(c.z, c.z); ctx.translate(-c.x, -c.y);
  if (t < T.loop + 0.2) {
    drawGoal(t);
    CARDS.forEach((cd, i) => {
      const st = cardState(i, t); if (!st) return;
      const spr = cardSprite(i, st.col, st.dashed, st.red);
      const held = PIECE_CARD.some((pc, k) => pc === i && pieceState(k, t).to === 'card' && pieceState(k, t).u >= 1);
      ctx.save(); ctx.globalAlpha = st.a; ctx.translate(st.x, st.y); ctx.rotate(st.rot); ctx.scale(st.s, st.s);
      ctx.drawImage(spr, -spr.width / 2, -spr.height / 2);
      if (held) { ctx.strokeStyle = LIME; ctx.lineWidth = 4; ctx.beginPath(); ctx.roundRect(-CW / 2, -CH / 2, CW, CH, 18); ctx.stroke(); }
      ctx.restore();
    });
    drawOverlays(t);
    CATS.forEach(k => drawUnit(k, t));
    ['DESIGN', 'MONEY', 'PEOPLE'].forEach(k => drawHelper(k, t));
    drawThoughts(t);
    drawPieces(t);
  } else drawGoal(t);
  drawLoop(t);
  ctx.restore();
  drawRec(t);
  drawHud(t, sx, sy, c.z);

  // ---------------- captions: one place, under the goal ----------------
  const capOn = [[0.3, 2.35], [T.hundred + 0.1, 5.3], [T.split, 8.05], [T.finite, 9.85], [T.forgets, 12.0], ...RULES.map(r => [r.act, r.t0 + T.RD - 0.1]), [T.locked + 0.1, 53.6], [T.loop + 0.2, T.hit - 0.1]];
  scrim(Math.max(...capOn.map(([a, b]) => tw(t, a - 0.2, a) * (1 - tw(t, b + 0.1, b + 0.35)))), 690);
  cap(t, 0.3, 2.35, [['You have a goal.', WHITE, 110]], W / 2, CAPY + 40, 110);
  cap(t, T.hundred + 0.1, 5.3, [['And a hundred', WHITE, 96], ['things to do.', LIME, 96]], W / 2, CAPY - 10, 96, { gap: 0.25 });
  cap(t, T.split, 8.05, [['But there’s only', WHITE, 96], ['one of you.', LIME, 96]], W / 2, CAPY - 10, 96, { gap: 0.25 });
  cap(t, T.finite, 9.85, [['Attention is finite.', WHITE, 110]], W / 2, CAPY + 40, 110);
  cap(t, T.forgets, 12.0, [['And your head', WHITE, 96], ['forgets.', LIME, 96]], W / 2, CAPY - 10, 96, { gap: 0.25 });
  RULES.forEach(r => cap(t, r.act + 0.05, r.t0 + T.RD - 0.1, r.lines.map(([s, col]) => [s, col, 84]), W / 2, CAPY, 84, { gap: 0.25 }));
  cap(t, T.locked + 0.1, 53.6, [['Now all of you', WHITE, 96], ['is on the goal.', LIME, 96]], W / 2, CAPY - 10, 96, { gap: 0.25 });
  cap(t, T.loop + 0.2, T.loop + 2.6, [['Try. See what’s real.', WHITE, 90], ['Adjust.', LIME, 90]], W / 2, CAPY - 10, 90, { gap: 0.4 });
  cap(t, T.loop + 2.8, T.hit - 0.1, [['Every loop,', WHITE, 90], ['a little closer.', LIME, 90]], W / 2, CAPY - 10, 90, { gap: 0.25 });
  cap(t, T.rec + 0.3, T.rec + 3.3, [['Hand it off —', WHITE, 90], ['it’s a goal of its own.', LIME, 90]], W / 2, CAPY - 10, 90, { gap: 0.3 });
  cap(t, T.rec + 3.5, T.apex - 0.4, [['Same rules.', WHITE, 96], ['Every size.', LIME, 96]], W / 2, CAPY - 10, 96, { gap: 0.25 });

  drawTracker(t);

  // ---------------- turn: the motto flood ----------------
  if (t > T.turn && t < T.rules + 0.6) {
    const grow = tw(t, T.turn, T.turn + 0.35, E.inOutExpo), shrink = tw(t, T.rules, T.rules + 0.4, E.inOutExpo);
    flood(sx, sy, lerp(40, 2300, grow) * (1 - shrink));
    if (shrink < 1) {
      cap(t, T.turn + 0.3, T.motto2 - 0.2, [['You can’t know', INK, 170], ['everything.', INK, 170]], W / 2, 470, 170, { shadow: false, gap: 0.2 });
      cap(t, T.motto2, T.rules - 0.25, [['But you can leverage', INK, 150], ['everything.', INK, 170]], W / 2, 480, 150, { shadow: false, gap: 0.25 });
    }
  }
  // ---------------- "seven rules": the numbers line up ----------------
  if (t > T.rules + 0.2 && t < T.R0 + 0.1) {
    ctx.fillStyle = inkA(0.8 * tw(t, T.rules + 0.2, T.rules + 0.5)); ctx.fillRect(0, 0, W, H);
    cap(t, T.rules + 0.35, T.R0 - 0.25, [['Seven rules', WHITE, 150], ['to get it back.', LIME, 110]], W / 2, 430, 150, { gap: 0.3 });
    RULES.forEach((r, i) => {
      const p = E.outBack(tw(t, T.rules + 1.0 + i * S16, T.rules + 1.25 + i * S16, E.lin)), out = tw(t, T.R0 - 0.35, T.R0);
      const x = W / 2 + (i - 3) * 200;
      ctx.save(); ctx.globalAlpha = clamp(p) * (1 - out); ctx.translate(x, 760 - out * 80); ctx.scale(p, p);
      ctx.strokeStyle = LIME; ctx.lineWidth = 4; ctx.beginPath(); ctx.roundRect(-80, -70, 160, 140, 24); ctx.stroke();
      text(r.n, 0, 22, F(900, 64), LIME, { ls: -2 }); ctx.restore();
    });
  }
  RULES.forEach((r, i) => drawStinger(t, r, i));

  // ---------------- apex ----------------
  if (t > T.apex - 0.1) {
    const grow = tw(t, T.apex - 0.1, T.apex + 0.3, E.inOutExpo), shrink = tw(t, T.end - 0.4, T.end, E.inOutExpo);
    if (shrink < 1) flood(W / 2, 470, lerp(40, 2300, grow) * (1 - shrink));
    cap(t, T.apex + 0.3, T.end - 0.45, [['Attention is', INK, 150], ['all you need.', INK, 230]], W / 2, 430, 150, { shadow: false, gap: 0.3 });
  }
  // ---------------- end card: the name, and the whole list ----------------
  if (t > T.end - 0.1) {
    const lk = E.outBack(tw(t, T.end, T.end + 0.3, E.lin));
    bracket(560, 470, lerp(1100, 820, lk), lerp(600, 340, lk), { lw: 10, alpha: clamp((t - T.end) / 0.1) });
    cap(t, T.end + 0.1, 99, [['AXIOMS', WHITE, 170]], 560, 520, 170, { stagger: 0 });
    cap(t, T.end + 0.45, 99, [['Seven rules for spending attention well.', whiteA(0.7), 36]], 560, 600, 36, { weight: 600, stagger: 0.02, shadow: false });
    text('github.com/RockyHong/axioms-protocol', 560, 760, MONO(28), LIME, { alpha: tw(t, T.end + 1.6, T.end + 1.9), ls: 1 });
    RULES.forEach((r, i) => {
      const tt = T.end + 0.5 + i * S16 * 2, p = E.outBack(tw(t, tt, tt + 0.25, E.lin)), y = 250 + i * 88;
      ctx.save(); ctx.globalAlpha = clamp(p * 2); ctx.translate(1120 + (1 - p) * 60, y);
      text(r.n, 0, 0, MONO(28), LIME, { align: 'left', ls: 2 });
      text(r.name, 70, 2, F(900, 44), WHITE, { align: 'left', ls: -1 });
      text(r.row, 70, 38, F(600, 24, 'Inter'), GREY, { align: 'left' });
      ctx.restore();
    });
  }
}
window.renderFrame = renderFrame;

// ---------- sound cues ----------
window.cueSheet = () => ({
  dur: DUR, beat: BEAT,
  lock: T.lock, hundred: T.hundred, cardsLand: [T.hundred + 0.55, T.hundred + 0.55 + CARDS.length * 0.011],
  split: Array.from({ length: 12 }, (_, k) => pieceOut(k) + 0.28), zero: T.split + 12 * S16 + 0.3,
  finite: T.finite, forgets: [0.2, 0.5, 0.8, 1.1].map(d => T.forgets + d),
  turn: T.turn, motto2: T.motto2, rules: T.rules, ruleNums: RULES.map((_, i) => T.rules + 1.0 + i * S16),
  stingers: RULES.map(r => r.t0), acts: RULES.map(r => r.act),
  home: Array.from({ length: 12 }, (_, k) => ({ t: pieceHome(k) + 0.4, rule: FREED_BY[k] })).sort((a, b) => a.t - b.t),
  noiseSwipe: [R(0).act + 0.2, R(0).act + 0.2 + 30 * 0.03], beam: BEAM, sort: R(2).act + 0.15, absorb: R(3).act + 0.25,
  units: R(3).act + 0.25 + 16 * 0.02 + 0.1, boundary: R(4).act + 0.7, handoffs: [0, 1, 2].map(i => R(5).act + 1.3 + i * 0.45 + 0.45), notes: R(6).act,
  locked: T.locked + 0.7, loop: T.loop, loopNodes: [0, 1].flatMap(l => [0, 1, 2, 3].map(i => T.loopRun[0] + (l + i / 4) * 2.25)), hit: T.hit,
  rec: T.rec, apex: T.apex, end: T.end, endList: RULES.map((_, i) => T.end + 0.5 + i * S16 * 2),
});
window.__ready = document.fonts.ready.then(() => Promise.all(['900 10px "Inter Tight"', '800 10px "Inter Tight"', '600 10px "Inter Tight"', '600 10px Inter', '500 10px "JetBrains Mono"'].map(f => document.fonts.load(f)))).then(() => true);

if (!location.search.includes('render')) {
  let t0 = performance.now(), paused = false, tp = 0;
  addEventListener('keydown', e => { if (e.code === 'Space') { paused = !paused; t0 = performance.now() - tp * 1000; } if (e.code === 'ArrowRight') tp = Math.min(DUR, tp + 0.5); if (e.code === 'ArrowLeft') tp = Math.max(0, tp - 0.5); if (paused) renderFrame(tp); });
  window.__ready.then(() => { const loop = now => { if (!paused) { tp = ((now - t0) / 1000) % DUR; renderFrame(tp); } document.getElementById('hud').textContent = `t=${tp.toFixed(2)}s`; requestAnimationFrame(loop); }; requestAnimationFrame(loop); });
} else document.body.classList.add('render');
