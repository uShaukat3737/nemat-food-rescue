const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const SCREENS = path.join(ROOT, 'stitch_surplus_food_rescue_platform');

// UTF-8 text re-read as Windows-1252 turns "é" into "Ã©", "—" into "â€”"
// and Urdu letters into "Ù…"-style pairs.
const MOJIBAKE = /Ã[\u0080-ÿ]|â€|[ØÙÚ][\u0080-ÿŒœŠšŸŽžƒˆ˜–-›€™]/;

function sourceFiles() {
  const files = ['index.html', 'manifest.json', 'css/app.css', 'js/app.js', 'js/state.js', 'js/i18n.js'];
  for (const dir of fs.readdirSync(SCREENS)) {
    const screen = path.join('stitch_surplus_food_rescue_platform', dir, 'code.html');
    if (fs.existsSync(path.join(ROOT, screen))) files.push(screen);
  }
  return files;
}

test('source files contain no mis-encoded (mojibake) text', () => {
  const broken = sourceFiles().filter(file => MOJIBAKE.test(fs.readFileSync(path.join(ROOT, file), 'utf8')));

  assert.deepStrictEqual(broken, []);
});
