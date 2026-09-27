const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');

// Vercel's filesystem routing only matches one segment under api/, so
// nested routes like /api/drops/:id need an explicit rewrite to the function.
test('vercel.json rewrites every /api/* path to the single API function', () => {
  const config = JSON.parse(fs.readFileSync(path.join(ROOT, 'vercel.json'), 'utf8'));
  const rule = (config.rewrites || []).find(r => r.source === '/api/(.*)');

  assert.ok(rule, 'missing /api/(.*) rewrite');
  assert.ok(fs.existsSync(path.join(ROOT, `${rule.destination}.js`)), `no function file for ${rule.destination}`);
});
