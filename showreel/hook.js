// AXIOMS — HOOK (~12.5s). Intrigue for FOCUS, not an answer: one goal, a hundred things to do, only one of you.
// Same visual language as FOCUS: the lime bracket is your attention, built from 12 pieces (finite capacity).
// Here the bracket splits itself across everything the goal needs doing — each task gets a sliver, the goal
// gets none — and the piece stops at the question. Deterministic: every frame is a pure function of t.
// Every event sits on a 120 BPM grid (BEAT = 0.5s) so the score can land on the picture exactly.
const W = 1080, H = 1920, DUR = 12.5;
window.DUR = DUR;
const cv = document.getElementById('c');
let ctx = cv.getContext('2d');

// ---------- palette ----------
const BG = '#07080C', LIME = '#C8FF2E', WHITE = '#F5F5F7', RED = '#FF453A';
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
// Focus-in / focus-out caption (same as FOCUS). lines: [[str, color, size?]]. Words rack into focus, staggered.
function cap(t, tIn, tOut, lines, x, y, size, { gap = 0.18, stagger = 0.06, weight = 900, lh = 1.08, shadow = true, outDir = -1 } = {}) {
  if (t < tIn || t > tOut + 0.3) return;
  const q = clamp((t - tOut) / 0.28), qe = E.inCubic(q);
  let ly = y;
  lines.forEach(([str, color, sz = size], li) => {
    if (li) ly += sz * lh;
    const font = F(weight, sz); ctx.font = font; ctx.letterSpacing = '-2px';
    const words = str.split(' '), sp = ctx.measureText(' ').width;
    const ws = words.map(w => ctx.measureText(w).width), total = ws.reduce((a, b) => a + b, 0) + sp * (words.length - 1);
    let cx = x - total / 2;
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

// ======================================================================
// SCRIPT (seconds, on a 0.5s beat grid). Everything below reads from these.
// ======================================================================
const BEAT = 0.5, S16 = BEAT / 4;
const G = { x: 540, y: 600 };                                   // the goal
const HOME = { cx: G.x, cy: G.y, w: 300, h: 300 };
const CTA = { cx: 540, cy: 1045, w: 470, h: 200 };              // the bracket's last lock: the full video
const T = {
  lock: 0.25,                   // bracket slams onto the goal (motion from frame 1)
  burst: 1.0,                   // the goal cracks open into things to do
  split: 3.5,                   // the bracket splits itself across them
  flat: 6.0,                    // nothing left on the goal
  hops: [5.5, 8.5],             // pieces dart between tasks: none held for long
  freeze: 8.5,                  // stop. pull back.
  ctaFly: 10.75, ctaLock: 11.0, // the pieces reassemble on the full video
};
const FLY = 0.25, HOP = 0.19;
const CAPS = [[0.25, 2.9], [3.0, 5.85], [6.0, 8.5], [8.75, 99]];

// things the goal needs done. The first three are FOCUS's burdens (its answers: notes / someone who knows / AI).
const CW = 480, CH = 96;
const TASKS = [
  ['01', 'Remember everything.', '#FF9F0A', 'list'], ['02', 'Figure it all out yourself.', '#BF5AF2', 'q'],
  ['03', 'Do it all by hand. Again.', '#32ADE6', 'loop'], ['04', 'Reply to 40 emails.', '#30D158', 'box'],
  ['05', 'Fix the website.', '#FF375F', 'box'], ['06', 'Learn the tax rules.', '#0A84FF', 'box'],
  ['07', 'Write the proposal.', '#FFD60A', 'box'], ['08', 'Chase the invoice.', '#FF9F0A', 'box'],
  ['09', 'Edit the video.', '#BF5AF2', 'box'], ['10', 'Plan next week.', '#64D2FF', 'box'],
  ['11', 'Update the spreadsheet.', '#30D158', 'box'], ['12', 'Call the supplier.', '#FF375F', 'box'],
  ['13', 'Read the contract.', '#0A84FF', 'box'], ['14', 'Post something today.', '#FFD60A', 'box'],
  ['58', 'Redo the slides.', '#FF9F0A', 'box'], ['100', '…and 86 more.', RED, 'box'],
];
const CARDS = TASKS.map(([n, body, col, glyph], i) => {
  const R = rng(40 + i);
  let x, y, r, arr, from;
  if (i < 14) { x = (i % 2 ? 795 : 285) + (R() - 0.5) * 24; y = 1170 + Math.floor(i / 2) * 112; r = (R() - 0.5) * 0.05; }
  else { x = i === 14 ? 600 : 470; y = i === 14 ? 1345 : 1580; r = i === 14 ? -0.05 : 0.045; }
  if (i < 12) { arr = T.burst + i * S16; from = 'goal'; }        // 12 burst out of the goal, one per 16th
  else { arr = 5.0 + (i - 12) * S16 * 2; from = i % 2 ? 'right' : 'left'; }   // then they keep coming
  return { n, body, col, glyph, x, y, r, arr, from };
});

// piece routes: [launch time, place]. place: 'home' | card index | 'cta'.
// Split: piece k flies to card SPLIT_TO[k]. Hops: seeded, on the 16th grid, each piece darts to another task.
const SPLIT_TO = [0, 5, 2, 9, 4, 7, 1, 11, 6, 3, 10, 8];
const ROUTE = Array.from({ length: 12 }, (_, k) => {
  const legs = [[T.split + k * S16, SPLIT_TO[k]]], R = rng(100 + k);
  let t = T.hops[0] + (k % 4) * S16, cur = SPLIT_TO[k];
  while (t < T.hops[1] - HOP) {
    const avail = CARDS.map((c, i) => i).filter(i => CARDS[i].arr + 0.3 < t && i !== cur);
    cur = avail[Math.floor(R() * avail.length)]; legs.push([t, cur]);
    t += S16 * (2 + Math.floor(R() * 3));
  }
  legs.push([T.ctaFly, 'cta']);
  return legs;
});

// ---------- bracket pieces ----------
function pieceSeg(k, r) {
  const c = Math.floor(k / 3), p = k % 3, sx = c === 0 || c === 3 ? -1 : 1, sy = c < 2 ? -1 : 1;
  const px = r.cx + sx * r.w / 2, py = r.cy + sy * r.h / 2, arm = Math.min(90, Math.min(r.w, r.h) * 0.3);
  if (p === 0) return [[px - sx * arm * 0.3, py], [px, py], [px, py - sy * arm * 0.3]];
  if (p === 1) return [[px - sx * arm * 0.45, py], [px - sx * arm, py]];
  return [[px, py - sy * arm * 0.45], [px, py - sy * arm]];
}
function homeRect(t) {                                           // slams in from oversize
  const p = E.outBack(tw(t, 0, T.lock, E.lin)), s = lerp(2.4, 1, p);
  return { cx: HOME.cx, cy: HOME.cy, w: HOME.w * s, h: HOME.h * s };
}
// A piece docked on a card keeps its own corner: the task gets a sliver of a bracket, never a whole one.
function placeSeg(k, place, t) {
  if (place === 'home') return { pts: pieceSeg(k, homeRect(t)), lw: 12 };
  if (place === 'cta') return { pts: pieceSeg(k, CTA), lw: 12 };
  const c = Math.floor(k / 3), sx = c === 0 || c === 3 ? -1 : 1, sy = c < 2 ? -1 : 1;
  const st = cardState(place, t), S = 0.55, cs = Math.cos(st.rot), sn = Math.sin(st.rot);
  const ox = sx * (CW / 2 + 12), oy = sy * (CH / 2 + 12);
  const cx = st.x + ox * cs - oy * sn, cy = st.y + ox * sn + oy * cs;
  const px = HOME.cx + sx * HOME.w / 2, py = HOME.cy + sy * HOME.h / 2;
  return { pts: pieceSeg(k, HOME).map(([x, y]) => { const dx = (x - px) * S, dy = (y - py) * S; return [cx + dx * cs - dy * sn, cy + dx * sn + dy * cs]; }), lw: 7 };
}
function pieceState(k, t) {
  const legs = ROUTE[k]; let prev = 'home', leg = null;
  for (const l of legs) { const hop = T.hops[0] <= l[0] && l[0] < T.hops[1]; if (hop && l[0] >= T.freeze) break; if (t < l[0]) break; if (leg) prev = leg[1]; leg = l; }
  if (!leg) return { place: 'home', u: 1, from: 'home' };
  const d = leg[1] === 'cta' ? FLY : leg[0] >= T.hops[0] ? HOP : FLY;
  return { place: leg[1], from: prev, u: clamp((t - leg[0]) / d), t0: leg[0] };
}
const onGoal = t => { let n = 0; for (let k = 0; k < 12; k++) { const s = pieceState(k, t); if (s.place === 'home' || (s.from === 'home' && s.u < 0.5)) n++; } return n; };
const holders = (i, t) => { let n = 0; for (let k = 0; k < 12; k++) { const s = pieceState(k, t); if (s.place === i && s.u >= 1) n++; } return n; };
function drawPieces(t, dim) {
  if (t < 0.02) return;
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (let k = 0; k < 12; k++) {
    const s = pieceState(k, t), e = E.inOutCubic(s.u);
    const A = placeSeg(k, s.from, t), B = placeSeg(k, s.place, t);
    const arc = Math.sin(s.u * Math.PI) * (s.place === 'cta' ? 60 : s.from === 'home' ? 160 : 70);
    const pts = A.pts.map(([x, y], j) => [lerp(x, B.pts[j][0], e), lerp(y, B.pts[j][1], e) - arc]);
    const cta = s.place === 'cta' ? E.outCubic(s.u) : 0;
    const a = clamp(t / 0.08) * lerp(1 - 0.75 * dim, 1, cta);
    if (s.u > 0.04 && s.u < 0.96) {                            // motion trail
      const ub = E.inOutCubic(Math.max(0, s.u - 0.3)), ab = Math.sin(Math.max(0, s.u - 0.3) * Math.PI) * arc / Math.max(1e-3, Math.sin(s.u * Math.PI));
      const ma = [lerp(A.pts[0][0], B.pts[0][0], ub), lerp(A.pts[0][1], B.pts[0][1], ub) - ab], mb = pts[0];
      ctx.save(); ctx.globalAlpha = a * 0.3; ctx.strokeStyle = LIME; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(ma[0], ma[1]); ctx.lineTo(mb[0], mb[1]); ctx.stroke(); ctx.restore();
    }
    ctx.globalAlpha = a; ctx.strokeStyle = LIME; ctx.lineWidth = lerp(A.lw, B.lw, e); ctx.shadowColor = limeA(0.8); ctx.shadowBlur = 22;
    ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
  }
  ctx.restore();
}

// ---------- goal + its HUD ----------
function drawGoal(t, dim) {
  const pop = E.outBack(tw(t, 0, 0.3, E.lin)); if (pop <= 0) return;
  const f = onGoal(t) / 12, blur = (1 - f) * 16;
  ctx.save(); if (blur > 0.4) ctx.filter = `blur(${blur.toFixed(1)}px)`; ctx.globalAlpha = (0.35 + 0.65 * f) * (1 - 0.8 * dim);
  // the crack: the goal kicks as the tasks burst out of it
  const kick = 1 + 0.12 * Math.max(0, 1 - Math.abs(t - T.burst - 0.1) / 0.25) + 0.04 * Math.sin(t * 60) * (t > T.burst && t < T.burst + 1.5 ? 1 : 0) * (1 - tw(t, T.burst, T.burst + 1.5, E.lin));
  const R = pop * kick;
  ctx.strokeStyle = WHITE; ctx.lineWidth = 8;
  [70, 40].forEach(rr => { ctx.beginPath(); ctx.arc(G.x, G.y, rr * R, 0, 7); ctx.stroke(); });
  ctx.fillStyle = WHITE; ctx.beginPath(); ctx.arc(G.x, G.y, 10 * R, 0, 7); ctx.fill();
  ctx.lineWidth = 6; for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; ctx.beginPath(); ctx.moveTo(G.x + Math.cos(a) * 92 * R, G.y + Math.sin(a) * 92 * R); ctx.lineTo(G.x + Math.cos(a) * 118 * R, G.y + Math.sin(a) * 118 * R); ctx.stroke(); }
  ctx.restore();
  ring(t, 0, G.x, G.y, 70, 260, WHITE, 6, 0.5);
  ring(t, T.burst, G.x, G.y, 60, 280, WHITE, 8, 0.45); burst(t, T.burst, G.x, G.y, 90, 230, 12, WHITE, 5, 0.4);
  ring(t, T.flat, G.x, G.y, 60, 360, RED, 10, 0.6); ring(t, T.flat + 0.1, G.x, G.y, 60, 240, RED, 6, 0.5);
  // HUD: how much of you is on the goal
  const hud = tw(t, 0.3, 0.55) * (1 - tw(t, T.freeze, T.freeze + 0.3));
  if (hud > 0) {
    const pct = Math.round(100 * onGoal(t) / 12), low = pct < 50, y = G.y + HOME.h / 2 + 66;
    let punch = 0;
    for (let k = 0; k < 12; k++) { const d = t - (T.split + k * S16 + FLY / 2); if (d > 0 && d < 0.2) punch = Math.max(punch, 1 - d / 0.2); }
    { const d = t - T.flat; if (d > 0 && d < 0.35) punch = Math.max(punch, 1.6 * (1 - d / 0.35)); }
    text('ON GOAL', G.x - 12, y - 2, MONO(26), low ? 'rgba(255,69,58,0.85)' : limeA(0.8), { align: 'right', alpha: hud, ls: 5 });
    ctx.save(); ctx.translate(G.x + 12, y); ctx.scale(1 + punch * 0.3, 1 + punch * 0.3);
    text(`${pct}%`, 0, 0, F(900, 44), low ? RED : LIME, { align: 'left', alpha: hud * (pct === 0 && t > T.flat ? (Math.sin(t * 18) > -0.3 ? 1 : 0.35) : 1) }); ctx.restore();
  }
}

// ---------- task cards (same banner family as FOCUS's notifications) ----------
function drawGlyph(g) {
  ctx.save(); ctx.strokeStyle = '#FFFFFF'; ctx.fillStyle = '#FFFFFF'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (g === 'list') { for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(-12, -10 + i * 10, 3, 0, 7); ctx.fill(); ctx.beginPath(); ctx.moveTo(-3, -10 + i * 10); ctx.lineTo(15, -10 + i * 10); ctx.stroke(); } }
  else if (g === 'q') { ctx.font = F(900, 34); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('?', 0, 2); }
  else if (g === 'loop') { ctx.beginPath(); ctx.arc(0, 0, 13, 0.3, Math.PI * 1.7); ctx.stroke(); ctx.beginPath(); ctx.moveTo(12, -14); ctx.lineTo(13, -3); ctx.lineTo(2, -5); ctx.stroke(); }
  else { ctx.lineWidth = 4; ctx.strokeRect(-13, -13, 26, 26); }
  ctx.restore();
}
function cardState(i, t) {
  const c = CARDS[i], p = clamp((t - c.arr) / FLY), e = E.outBack(p);
  let x, y, rot = c.r, s = 1, mblur = (1 - E.outCubic(p)) * 16;
  if (c.from === 'goal') {                                       // flung out of the goal on an arc
    const u = E.outCubic(p); x = lerp(G.x, c.x, u); y = lerp(G.y, c.y, u) - Math.sin(u * Math.PI) * 140; s = lerp(0.15, 1, e); rot = lerp((c.x < 540 ? -1 : 1) * 0.5, c.r, E.outCubic(p));
  } else {                                                       // slammed in from the side
    const side = c.from === 'left' ? -1 : 1; x = lerp(c.x + side * 900, c.x, e); y = lerp(c.y - 200, c.y, e); rot = lerp(side * 0.35, c.r, E.outCubic(p)); s = lerp(1.2, 1, e);
  }
  return { x, y, rot, s, mblur, on: t >= c.arr };
}
const SPR = {}, PAD = 70;
function cardSprite(i, held, bl) {
  const key = `${i}|${held}|${bl}`; if (SPR[key]) return SPR[key];
  const it = CARDS[i], c = document.createElement('canvas'); c.width = CW + PAD * 2; c.height = CH + PAD * 2;
  const g = c.getContext('2d');
  if (bl > 0) { g.filter = `blur(${bl}px)`; g.drawImage(cardSprite(i, held, 0), 0, 0); SPR[key] = c; return c; }
  ctxSwap(g, () => {
    ctx.translate(c.width / 2, c.height / 2);
    ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 36; ctx.shadowOffsetY = 14;
    ctx.fillStyle = 'rgba(34,36,46,0.97)'; ctx.beginPath(); ctx.roundRect(-CW / 2, -CH / 2, CW, CH, 28); ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = held ? LIME : 'rgba(255,255,255,0.10)'; ctx.lineWidth = held ? 4 : 2; ctx.stroke();
    ctx.fillStyle = it.col; ctx.beginPath(); ctx.roundRect(-CW / 2 + 20, -30, 60, 60, 16); ctx.fill();
    ctx.save(); ctx.translate(-CW / 2 + 50, 0); drawGlyph(it.glyph); ctx.restore();
    text(`TO DO · ${it.n}`, -CW / 2 + 100, -12, MONO(19), 'rgba(245,245,247,0.55)', { align: 'left', ls: 3 });
    let fs = 30; ctx.font = F(600, fs, 'Inter'); const room = CW - 100 - 26; const w = ctx.measureText(it.body).width; if (w > room) fs = Math.floor(fs * room / w);
    text(it.body, -CW / 2 + 100, 26, F(600, fs, 'Inter'), WHITE, { align: 'left' });
  });
  SPR[key] = c; return c;
}
function ctxSwap(g, fn) { const keep = ctx; ctx = g; try { ctx.save(); fn(); ctx.restore(); } finally { ctx = keep; } }
// Cards are sharp while the bracket is reaching for them; once the caption asks the question they fall back.
function cardFocus(i, t) { return 1 - 0.6 * tw(t, T.flat - 0.1, T.flat + 0.2); }
function drawCard(i, t, dim) {
  const st = cardState(i, t); if (!st.on) return;
  const f = cardFocus(i, t), blur = (1 - f) * 12 + st.mblur;
  const bl = Math.min(36, Math.round(blur / 3) * 3), spr = cardSprite(i, holders(i, t) > 0, bl);
  ctx.save(); ctx.globalAlpha = (0.35 + 0.65 * f) * (1 - 0.8 * dim);
  ctx.translate(st.x, st.y); ctx.rotate(st.rot); ctx.scale(st.s, st.s);
  ctx.drawImage(spr, -spr.width / 2, -spr.height / 2);
  ctx.restore();
}

// ---------- camera ----------
function shake(t) {
  let a = 0; const hit = (t0, amp, d) => { const x = t - t0; if (x > 0 && x < d) a = Math.max(a, amp * (1 - x / d)); };
  hit(T.lock, 12, 0.2); hit(T.burst, 16, 0.3);
  CARDS.forEach(c => hit(c.arr + FLY, c.from === 'goal' ? 4 : 12, 0.15));
  for (let k = 0; k < 12; k++) hit(T.split + k * S16 + FLY, 5, 0.12);
  hit(T.flat, 18, 0.35); hit(T.ctaLock, 10, 0.25);
  return { x: Math.sin(t * 91) * a, y: Math.cos(t * 77) * a };
}
function drawBg(t) {
  ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
  const g = ctx.createRadialGradient(G.x, G.y, 50, G.x, G.y, 900);
  g.addColorStop(0, `rgba(200,255,46,${0.07 * (onGoal(t) / 12)})`); g.addColorStop(1, 'rgba(200,255,46,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(255,255,255,0.07)';
  for (let gx = -6; gx <= 6; gx++) for (let gy = -11; gy <= 11; gy++) { const x = 540 + gx * 90, y = 960 + gy * 90; ctx.beginPath(); ctx.arc(x, y, 2.4, 0, 7); ctx.fill(); }
}

// ======================================================================
// frame
// ======================================================================
function renderFrame(t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none'; ctx.globalCompositeOperation = 'source-over';
  const sh = shake(t), dim = tw(t, T.freeze, T.freeze + 0.35);
  drawBg(t);
  ctx.save(); ctx.translate(sh.x, sh.y);
  drawGoal(t, dim);
  // stacking: the latest arrivals on top
  CARDS.forEach((_, i) => drawCard(i, t, dim));
  ctx.restore();

  // caption bed between goal and tasks: the pieces and cards pass under it, never over the words
  const sa = tw(t, 2.9, 3.1) * (1 - tw(t, T.freeze, T.freeze + 0.3));
  if (sa > 0) { const g = ctx.createLinearGradient(0, 830, 0, 1110); g.addColorStop(0, 'rgba(7,8,12,0)'); g.addColorStop(0.25, `rgba(7,8,12,${0.8 * sa})`); g.addColorStop(0.8, `rgba(7,8,12,${0.8 * sa})`); g.addColorStop(1, 'rgba(7,8,12,0)'); ctx.fillStyle = g; ctx.fillRect(0, 830, W, 280); }

  ctx.save(); ctx.translate(sh.x, sh.y); drawPieces(t, dim); ctx.restore();

  // ---------------- captions: where the eye already is ----------------
  // 1: on the goal, above it — the line lands as the goal cracks open
  cap(t, CAPS[0][0], CAPS[0][1], [['One goal.', LIME, 130], ['A hundred things to do.', WHITE, 76]], 540, 300, 130, { gap: T.burst - CAPS[0][0], lh: 1.3 });
  // 2, 3: the band between the goal and the pile — the eye crosses it every time a piece flies down
  cap(t, CAPS[1][0], CAPS[1][1], [['So you try', WHITE, 92], ['to do them all.', LIME, 92]], 540, 940, 92, { gap: 0.25 });
  cap(t, CAPS[2][0], CAPS[2][1], [['But there’s only', WHITE, 92], ['one of you.', LIME, 92]], 540, 940, 92, { gap: 0.3 });
  // 4: where the goal was. It stays until the end.
  cap(t, CAPS[3][0], CAPS[3][1], [['What if you', WHITE, 96], ['didn’t have to', WHITE, 96], ['carry it all?', LIME, 96]], 540, 520, 96, { gap: 0.3 });
  // CTA: the bracket leaves the pile and locks onto the full video
  if (t > T.ctaFly - 0.3) {
    text('FULL VIDEO →', CTA.cx, CTA.cy - CTA.h / 2 - 36, MONO(30), limeA(0.85), { alpha: tw(t, T.ctaFly - 0.3, T.ctaFly), ls: 6 });
    cap(t, T.ctaLock - 0.05, 99, [['FOCUS', WHITE, 120]], CTA.cx, CTA.cy + 43, 120, { stagger: 0 });
    burst(t, T.ctaLock, CTA.cx, CTA.cy, 250, 420, 14, LIME, 6, 0.4);
  }
}
window.renderFrame = renderFrame;

// ---------- sound cues: every audible event, from the same constants the picture uses ----------
window.cueSheet = () => ({
  dur: DUR, beat: BEAT,
  goal: 0, lock: T.lock, burst: T.burst,
  captions: CAPS.map(c => c[0]),
  cards: CARDS.map(c => ({ t: c.arr, land: c.arr + FLY, from: c.from })),
  split: Array.from({ length: 12 }, (_, k) => ({ t: T.split + k * S16, land: T.split + k * S16 + FLY, k })),
  hops: ROUTE.flatMap((legs, k) => legs.filter(([t0, p]) => p !== 'cta' && t0 >= T.hops[0] && t0 < T.freeze).map(([t0]) => ({ t: t0, k }))).sort((a, b) => a.t - b.t),
  flat: T.flat, freeze: T.freeze, ctaFly: T.ctaFly, ctaLock: T.ctaLock, end: DUR,
});
window.__ready = document.fonts.ready.then(() => Promise.all(['900 10px "Inter Tight"', '600 10px Inter', '500 10px "JetBrains Mono"'].map(f => document.fonts.load(f)))).then(() => true);

if (!location.search.includes('render')) {
  let t0 = performance.now(), paused = false, tp = 0;
  addEventListener('keydown', e => { if (e.code === 'Space') { paused = !paused; t0 = performance.now() - tp * 1000; } if (e.code === 'ArrowRight') tp = Math.min(DUR, tp + 0.5); if (e.code === 'ArrowLeft') tp = Math.max(0, tp - 0.5); if (paused) renderFrame(tp); });
  window.__ready.then(() => { const loop = now => { if (!paused) { tp = ((now - t0) / 1000) % DUR; renderFrame(tp); } document.getElementById('hud').textContent = `t=${tp.toFixed(2)}s`; requestAnimationFrame(loop); }; requestAnimationFrame(loop); });
} else document.body.classList.add('render');
