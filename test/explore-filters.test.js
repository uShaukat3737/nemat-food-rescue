const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const SRC = fs.readFileSync(path.join(__dirname, '..', 'js', 'explore-filters.js'), 'utf8');
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(SRC, sandbox);
const { filterOffers } = sandbox.window.NematExploreFilters;

const OFFERS = [
  { name: 'Loaf & Crumb', title: 'Pastry Bag', category: 'bakery', tags: ['Vegetarian'], bagsLeft: 7, pricePkr: 450, discountPct: 63, distanceMeters: 900 },
  { name: 'Brew District', title: 'Panini Bag', category: 'cafe', tags: ['Savory'], bagsLeft: 0, pricePkr: 550, discountPct: 61, distanceMeters: 300 },
];

test('filterOffers with no matches returns an empty list, not everything', () => {
  const result = filterOffers(OFFERS, { query: 'sushi' });

  assert.strictEqual(result.length, 0);
});

test('filterOffers by category: bakery, cafe, meal (savory) and vegetarian (tag)', () => {
  const names = category => filterOffers(OFFERS, { category }).map(o => o.name);

  assert.deepStrictEqual(names('bakery'), ['Loaf & Crumb']);
  assert.deepStrictEqual(names('cafe'), ['Brew District']);
  assert.deepStrictEqual(names('meal'), ['Brew District']);
  assert.deepStrictEqual(names('vegetarian'), ['Loaf & Crumb']);
  assert.deepStrictEqual(names('all'), ['Loaf & Crumb', 'Brew District']);
});
