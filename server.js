import http from 'node:http';
import { appendFile, mkdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const publicRoot = path.join(projectRoot, 'dist');
const enquiryFile = path.join(projectRoot, 'data', 'enquiries.jsonl');
const port = Number(process.env.PORT) || 3000;
const mimeTypes = { '.css': 'text/css', '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml' };
const send = (res, status, body, type = 'application/json') => { res.writeHead(status, { 'Content-Type': type }); res.end(body); };
const clean = (value, limit) => String(value ?? '').trim().slice(0, limit);

http.createServer(async (req, res) => {
  if (req.method === 'POST' && req.url === '/api/enquiries') {
    let body = '';
    for await (const chunk of req) { body += chunk; if (body.length > 20000) return send(res, 413, JSON.stringify({ error: 'Request too large' })); }
    try {
      const submitted = JSON.parse(body);
      const enquiry = { receivedAt: new Date().toISOString(), name: clean(submitted.name, 120), email: clean(submitted.email, 200), service: clean(submitted.type, 80), message: clean(submitted.message, 5000) };
      if (!enquiry.name || !enquiry.email || !enquiry.message) return send(res, 400, JSON.stringify({ error: 'Missing required fields' }));
      await mkdir(path.dirname(enquiryFile), { recursive: true });
      await appendFile(enquiryFile, JSON.stringify(enquiry) + '\n', 'utf8');
      return send(res, 201, JSON.stringify({ saved: true }));
    } catch { return send(res, 400, JSON.stringify({ error: 'Invalid enquiry' })); }
  }
  const requestPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const requestedFile = requestPath === '/' ? 'index.html' : requestPath.replace(/^\/+/, '');
  const safeFile = path.resolve(publicRoot, requestedFile);
  const fallback = path.join(publicRoot, 'index.html');
  try {
    const file = safeFile.startsWith(publicRoot) && (await stat(safeFile)).isFile() ? safeFile : fallback;
    return send(res, 200, await readFile(file), mimeTypes[path.extname(file)] || 'application/octet-stream');
  } catch { return send(res, 500, 'Build the website first with npm run build, then run npm start.', 'text/plain'); }
}).listen(port, () => console.log('William website running at http://localhost:' + port));
