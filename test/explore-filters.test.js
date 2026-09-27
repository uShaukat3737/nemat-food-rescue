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

test('filterOffers hides sold-out bags and bags over the max price', () => {
  assert.deepStrictEqual(filterOffers(OFFERS, { hideSoldOut: true }).map(o => o.name), ['Loaf & Crumb']);
  assert.deepStrictEqual(filterOffers(OFFERS, { maxPrice: 500 }).map(o => o.name), ['Loaf & Crumb']);
  assert.strictEqual(filterOffers(OFFERS, { hideSoldOut: false, maxPrice: null }).length, 2);
});

test('sortOffers orders by distance, discount, price or bags; unknown keys keep order', () => {
  const { sortOffers } = sandbox.window.NematExploreFilters;
  const noDistance = { name: 'Far Away', bagsLeft: 9, pricePkr: 300, discountPct: 70 };
  const list = [...OFFERS, noDistance];
  const names = sort => sortOffers(list, sort).map(o => o.name);

  assert.deepStrictEqual(names('distance'), ['Brew District', 'Loaf & Crumb', 'Far Away']);
  assert.deepStrictEqual(names('discount'), ['Far Away', 'Loaf & Crumb', 'Brew District']);
  assert.deepStrictEqual(names('price'), ['Far Away', 'Loaf & Crumb', 'Brew District']);
  assert.deepStrictEqual(names('bags'), ['Far Away', 'Loaf & Crumb', 'Brew District']);
  assert.deepStrictEqual(names('bogus'), ['Loaf & Crumb', 'Brew District', 'Far Away']);
  assert.strictEqual(list[0].name, 'Loaf & Crumb', 'must not mutate the input');
});
