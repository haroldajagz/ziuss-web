// Local preview server for the ZIUSS static site:  node serve.mjs  →  http://localhost:4173
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const port = process.env.PORT || 4173;
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.woff2': 'font/woff2', '.json': 'application/json' };

// Review overlay (Agentation): injected into pages by this preview server only, so the
// site files stay clean for deployment. Turn it off with  OVERLAY=0 node serve.mjs
const overlayTag = '<script src="/.dev/agentation.bundle.js" defer></script>';
const overlay = process.env.OVERLAY !== '0' && await stat(join(root, '.dev/agentation.bundle.js')).then(() => true, () => false);

createServer(async (req, res) => {
  try {
    let p = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if (p.includes('..')) throw 0;
    let file = join(root, p);
    if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
    let body = await readFile(file);
    if (overlay && extname(file) === '.html') body = String(body).replace('</body>', overlayTag + '</body>');
    res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(body);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
}).listen(port, () => console.log(`ZIUSS preview running at http://localhost:${port}`));
