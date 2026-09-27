const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(ROOT, file), 'utf8');

// The full variable icon font is 3.8 MB; until it arrives, icons render as
// their ligature names ("arrow_forward") over the labels. Only FILL varies
// in this app, so the static 24/400/GRAD 0 cut (~0.44 MB) is enough.
test('icon font loads the small FILL-only cut and blocks ligature text', () => {
  const link = read('index.html').match(/href="([^"]*Material\+Symbols\+Outlined[^"]*)"/)[1];

  assert.match(link, /opsz,wght,FILL,GRAD@24,400,0\.\.1,0/);
  assert.match(link, /display=block/);
});

test('icons stay hidden until the icon font has loaded', () => {
  assert.match(read('css/app.css'), /html:not\(\.icons-ready\) \.material-symbols-outlined/);
  assert.match(read('js/app.js'), /icons-ready/);
});
