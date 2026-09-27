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
  const names = sort => Array.from(sortOffers(list, sort), o => o.name);

  assert.deepStrictEqual(names('distance'), ['Brew District', 'Loaf & Crumb', 'Far Away']);
  assert.deepStrictEqual(names('discount'), ['Far Away', 'Loaf & Crumb', 'Brew District']);
  assert.deepStrictEqual(names('price'), ['Far Away', 'Loaf & Crumb', 'Brew District']);
  assert.deepStrictEqual(names('bags'), ['Far Away', 'Loaf & Crumb', 'Brew District']);
  assert.deepStrictEqual(names('bogus'), ['Loaf & Crumb', 'Brew District', 'Far Away']);
  assert.strictEqual(list[0].name, 'Loaf & Crumb', 'must not mutate the input');
});

test('offerFromDrop / offerFromCafe map live API data into filterable offers', () => {
  const { offerFromDrop, offerFromCafe } = sandbox.window.NematExploreFilters;
  const drop = { id: 'drop-9', vendorName: 'New Bakery', title: 'Bread Bag', description: 'Loaves', address: 'G-9',
    category: 'bakery', tags: ['Vegetarian'], bagsLeft: 2, pricePkr: 300, discountPct: 50 };

  assert.deepStrictEqual({ ...offerFromDrop(drop) }, {
    name: 'New Bakery', title: 'Bread Bag', description: 'Loaves', address: 'G-9',
    category: 'bakery', tags: ['Vegetarian'], bagsLeft: 2, pricePkr: 300, discountPct: 50, distanceMeters: null,
  });
  const cafe = offerFromCafe({ name: 'Corner Cafe', address: 'F-6', distanceMeters: 420 }, drop);
  assert.strictEqual(cafe.name, 'Corner Cafe');
  assert.strictEqual(cafe.address, 'F-6');
  assert.strictEqual(cafe.distanceMeters, 420);
  assert.strictEqual(cafe.title, 'Bread Bag');
  assert.strictEqual(offerFromDrop({}).bagsLeft, 0, 'missing fields must not crash or become NaN');
});

test('cardBadges derives the category label and rating from live data, never mockup text', () => {
  const { cardBadges } = sandbox.window.NematExploreFilters;

  assert.deepStrictEqual({ ...cardBadges({ category: 'cafe' }, { rating: 4.8, verified: true }) },
    { categoryLabel: 'Café', rating: '4.8', verified: true });
  assert.deepStrictEqual({ ...cardBadges({ category: 'bakery' }, { rating: 0, verified: false }) },
    { categoryLabel: 'Bakery', rating: null, verified: false });
  assert.deepStrictEqual({ ...cardBadges({ category: 'soup-kitchen' }, undefined) },
    { categoryLabel: 'Soup Kitchen', rating: null, verified: false });
  assert.strictEqual(cardBadges({}, null).categoryLabel, 'Surplus food');
});
