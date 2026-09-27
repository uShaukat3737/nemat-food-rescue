const { test } = require('node:test');
const assert = require('node:assert');
const { handleApiRequest } = require('../lib/api');

// Calls the shared router (used by server.js and api/[...path].js) and
// returns { status, body }.
async function call(method, pathAndQuery) {
  const req = { method, headers: { host: 'localhost' } };
  let status;
  let raw = '';
  const res = {
    writeHead: (s) => { status = s; },
    end: (chunk) => { raw = chunk || ''; },
  };
  await handleApiRequest(req, res, new URL(pathAndQuery, 'https://localhost'));
  return { status, body: JSON.parse(raw) };
}

test('GET /api/map-config returns the Geoapify key so it works on Vercel', async () => {
  process.env.GEOAPIFY_API_KEY = 'test-geo-key';

  const { status, body } = await call('GET', '/api/map-config');

  assert.strictEqual(status, 200);
  assert.deepStrictEqual(body, { geoapifyKey: 'test-geo-key' });
});

test('GET /api/serply/images without a name is a 400', async () => {
  const { status, body } = await call('GET', '/api/serply/images?name=%20%20');

  assert.strictEqual(status, 400);
  assert.strictEqual(body.error, 'Cafe name is required.');
});

test('GET /api/serply/images without SERPLY_API_KEY is a 503', async () => {
  delete process.env.SERPLY_API_KEY;

  const { status } = await call('GET', '/api/serply/images?name=Loaf');

  assert.strictEqual(status, 503);
});

test('GET /api/serply/images ranks thumbnails by name match', async () => {
  process.env.SERPLY_API_KEY = 'test-serply-key';
  const realFetch = global.fetch;
  global.fetch = async () => ({
    ok: true,
    json: async () => ({ image_results: [
      { image: { alt: 'Random bakery', src: 'a.jpg' }, link: { domain: 'x.com', href: 'https://x.com' } },
      { image: { alt: 'Brew District F-7', src: 'b.jpg' }, link: { domain: 'y.com', href: 'https://y.com' } },
      { image: { alt: 'no thumbnail' }, link: {} },
    ] }),
  });
  try {
    const { status, body } = await call('GET', '/api/serply/images?name=Brew%20District');

    assert.strictEqual(status, 200);
    assert.deepStrictEqual(body.images.map(i => i.thumbnail), ['b.jpg', 'a.jpg']);
  } finally {
    global.fetch = realFetch;
  }
});

test('GET /api/serply/images prefers sharp images: large thumbs, direct hi-res originals first', async () => {
  process.env.SERPLY_API_KEY = 'test-serply-key';
  const realFetch = global.fetch;
  global.fetch = async () => ({
    ok: true,
    json: async () => ({ image_results: [
      { image: { alt: 'Loaf Crumb reel', src: 's1' }, link: { domain: 'instagram.com' },
        thumbnails: { medium: 'm1', large: 'l1' },
        original_image: { src: 'https://lookaside.instagram.com/seo/?media_id=1', width: '1080', height: '1920' } },
      { image: { alt: 'Loaf Crumb storefront', src: 's2' }, link: { domain: 'blog.pk' },
        thumbnails: { medium: 'm2', large: 'l2' },
        original_image: { src: 'https://blog.pk/loaf.jpg', width: '1200', height: '800' } },
    ] }),
  });
  try {
    const { body } = await call('GET', '/api/serply/images?name=Loaf%20Crumb%20x');
    const [first, second] = body.images;

    assert.strictEqual(first.original, 'https://blog.pk/loaf.jpg', 'direct hi-res image ranks first');
    assert.strictEqual(first.thumbnail, 'l2', 'large thumbnail is the fallback');
    assert.strictEqual(second.original, '', 'page links are not images, so no original');
    assert.strictEqual(second.thumbnail, 'l1');
  } finally {
    global.fetch = realFetch;
  }
});
