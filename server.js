const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { isApiRequest, handleApiRequest } = require('./lib/api');

const PORT = process.env.PORT || 3000;
const BASE_DIR = __dirname;
const serplyCache = new Map();

function sendJson(res, status, value) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(value));
}


const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf'
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  let pathname = decodeURIComponent(parsedUrl.pathname);

  if (pathname === '/map-config.json') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify({ geoapifyKey: process.env.GEOAPIFY_API_KEY || '' }));
    return;
  }

  if (pathname === '/serply/images') {
    const name = String(parsedUrl.query.name || '').trim().slice(0, 140);
    if (!name) { sendJson(res, 400, { error: 'Cafe name is required.' }); return; }
    if (!process.env.SERPLY_API_KEY) { sendJson(res, 503, { error: 'SERPLY_API_KEY is not configured.' }); return; }
    const cacheKey = `image:${name.toLowerCase()}`;
    const cached = serplyCache.get(cacheKey);
    if (cached && cached.expires > Date.now()) { sendJson(res, 200, cached.value); return; }
    const query = encodeURIComponent(`q=${name} cafe Islamabad Pakistan`);
    fetch(`https://api.serply.io/v1/image/${query}`, { headers: { 'X-Api-Key': process.env.SERPLY_API_KEY, 'X-Proxy-Location': 'IN', 'X-User-Agent': 'desktop' } })
      .then(async response => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) { sendJson(res, response.status, { error: data.error || 'Serply image lookup failed.' }); return; }
        const tokens = name.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(token => token.length > 2 && !['islamabad','pakistan','cafe','cafes','coffee'].includes(token));
        const images = (data.image_results || []).map(item => {
          const title = item.image?.alt || item.link?.title || name;
          const domain = item.link?.domain || '';
          const source = item.link?.href || '';
          const haystack = `${title} ${domain} ${source}`.toLowerCase().replace(/[^a-z0-9 ]/g, ' ');
          const matched = tokens.filter(token => haystack.includes(token)).length;
          return {
            thumbnail: item.thumbnails?.medium || item.image?.src || item.thumbnails?.small || '',
            original: item.original_image?.src || '', title, source, domain,
            relevance: tokens.length ? matched / tokens.length : 0
          };
        }).filter(item => item.thumbnail).sort((a,b)=>b.relevance-a.relevance).slice(0,5);
        const value = { images };
        serplyCache.set(cacheKey, { value, expires: Date.now() + 24 * 60 * 60 * 1000 });
        sendJson(res, 200, value);
      }).catch(error => { console.warn('Serply image request failed:', error.message); sendJson(res, 502, { error: 'Serply image lookup is unavailable.' }); });
    return;
  }

  if (isApiRequest(pathname)) {
    handleApiRequest(req, res, new URL(req.url, `http://${req.headers.host}`));
    return;
  }

  // Default to index.html for root
  if (pathname === '/') {
    pathname = '/index.html';
  }

  // Prevent directory traversal
  const safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  let filePath = path.join(BASE_DIR, safePath);

  // If path doesn't have extension and directory exists with code.html or index.html
  if (!path.extname(filePath)) {
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      if (fs.existsSync(path.join(filePath, 'code.html'))) {
        filePath = path.join(filePath, 'code.html');
      } else if (fs.existsSync(path.join(filePath, 'index.html'))) {
        filePath = path.join(filePath, 'index.html');
      }
    } else if (fs.existsSync(filePath + '.html')) {
      filePath = filePath + '.html';
    }
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Check if it's an SPA route, serve index.html
      const indexPath = path.join(BASE_DIR, 'index.html');
      if (fs.existsSync(indexPath) && !path.extname(pathname)) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        fs.createReadStream(indexPath).pipe(res);
        return;
      }
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(`404 Not Found: ${pathname}`);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*'
    });

    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`Nemat Food Rescue server running at http://localhost:${PORT}`);
});
