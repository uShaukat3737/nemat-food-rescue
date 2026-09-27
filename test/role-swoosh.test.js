const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const HTML = fs.readFileSync(path.join(__dirname, '..', 'stitch_surplus_food_rescue_platform', 'choose_role_nemat_food_rescue', 'code.html'), 'utf8');

// The yellow swoosh used to be positioned as a % of the whole section, so on
// taller windows it drifted up onto the h1. It must be anchored to the words.
test('choose-role swoosh underlines "get started" inside the subtitle, not the section', () => {
  assert.match(HTML, /<p>Choose your role to <span class="role-swoosh">get started<\/span> with Nemat\.<\/p>/);
  assert.doesNotMatch(HTML, /\.role-swoosh\{[^}]*top:\s*\d+%/);
});
