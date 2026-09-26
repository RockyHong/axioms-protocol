// usage: [PAGE=focus.html] node render.mjs stills <t1,t2,...>   |   node render.mjs video [out.mp4]
// PAGE picks the piece (default index.html = 15s reel); its duration comes from window.DUR (default 15).
// Environment overrides: PLAYWRIGHT (module path), CHROME (browser executable), FFMPEG (binary).
const { chromium } = await import(process.env.PLAYWRIGHT || 'playwright');
import { spawn } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const root = path.dirname(new URL(import.meta.url).pathname);
const FFMPEG = process.env.FFMPEG || 'ffmpeg';
const types = { '.html': 'text/html', '.js': 'text/javascript', '.woff2': 'font/woff2' };
const srv = http.createServer((q, r) => {
  const f = path.join(root, decodeURIComponent(q.url.split('?')[0]));
  fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream' }); r.end(d); });
}).listen(0);
const port = srv.address().port;

const browser = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
page.on('console', m => console.log('[page]', m.text()));
page.on('pageerror', e => console.log('[err]', e.message));
const PAGE = process.env.PAGE || 'index.html';
await page.goto(`http://localhost:${port}/${PAGE}?render`);
await page.evaluate(() => window.__ready);
const grab = t => page.evaluate(t => { renderFrame(t); return document.getElementById('c').toDataURL('image/png'); }, t);

const [mode, arg] = process.argv.slice(2);
if (mode === 'stills') {
  fs.mkdirSync(path.join(root, 'stills'), { recursive: true });
  for (const t of arg.split(',').map(Number)) {
    const d = await grab(t);
    fs.writeFileSync(path.join(root, 'stills', `t${t.toFixed(2).padStart(5, '0')}.png`), Buffer.from(d.split(',')[1], 'base64'));
  }
} else {
  const out = arg || 'axioms-showreel.mp4', FPS = 60, N = Math.round((await page.evaluate(() => window.DUR || 15)) * FPS);
  const ff = spawn(FFMPEG, ['-y', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'slow', '-crf', '14', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', path.join(root, out)], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let i = 0; i < N; i++) {
    const d = await grab(i / FPS);
    if (!ff.stdin.write(Buffer.from(d.split(',')[1], 'base64'))) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 60 === 0) console.log(`frame ${i}/${N}`);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
}
await browser.close(); srv.close();
