// Pure search/filter/sort logic for the customer Explore page. Kept out of
// app.js so it can be unit-tested in Node (see test/explore-filters.test.js).
(function () {
  function matchesQuery(offer, query) {
    const needle = String(query || '').trim().toLowerCase();
    if (!needle) return true;
    const haystack = [offer.name, offer.title, offer.description, offer.address, ...(offer.tags || [])]
      .join(' ').toLowerCase();
    return haystack.includes(needle);
  }

  const hasTag = (offer, tag) => (offer.tags || []).some(t => String(t).toLowerCase() === tag);

  // Chip key -> predicate. Meals are savoury bags; vegetarian comes from tags.
  const CATEGORY_TESTS = {
    all: () => true,
    bakery: offer => offer.category === 'bakery',
    cafe: offer => offer.category === 'cafe',
    meal: offer => offer.category === 'meal' || hasTag(offer, 'savory'),
    vegetarian: offer => hasTag(offer, 'vegetarian'),
  };

  function filterOffers(offers, options = {}) {
    const inCategory = CATEGORY_TESTS[options.category] || CATEGORY_TESTS.all;
    const maxPrice = Number(options.maxPrice) || Infinity;
    return offers.filter(offer =>
      matchesQuery(offer, options.query) &&
      inCategory(offer) &&
      !(options.hideSoldOut && Number(offer.bagsLeft) <= 0) &&
      Number(offer.pricePkr) <= maxPrice);
  }

  const num = (value, missing) => (Number.isFinite(Number(value)) && value !== null && value !== '' ? Number(value) : missing);

  // Sort key -> comparator. Offers without a distance go last.
  const SORTS = {
    distance: (a, b) => num(a.distanceMeters, Infinity) - num(b.distanceMeters, Infinity),
    discount: (a, b) => num(b.discountPct, 0) - num(a.discountPct, 0),
    price: (a, b) => num(a.pricePkr, Infinity) - num(b.pricePkr, Infinity),
    bags: (a, b) => num(b.bagsLeft, 0) - num(a.bagsLeft, 0),
  };

  function sortOffers(offers, sort) {
    const compare = SORTS[sort];
    return compare ? [...offers].sort(compare) : [...offers];
  }

  // Built fresh from state on every render, so newly fetched drops/cafes
  // are filterable without any extra wiring.
  function offerFromDrop(drop) {
    return {
      name: drop.vendorName || '',
      title: drop.title || '',
      description: drop.description || '',
      address: drop.address || '',
      category: drop.category || '',
      tags: drop.tags || [],
      bagsLeft: num(drop.bagsLeft, 0),
      pricePkr: num(drop.pricePkr, 0),
      discountPct: num(drop.discountPct, 0),
      distanceMeters: null,
    };
  }

  function offerFromCafe(cafe, drop) {
    return {
      ...offerFromDrop(drop || {}),
      name: cafe.name || '',
      address: cafe.address || '',
      distanceMeters: num(cafe.distanceMeters, null),
    };
  }

  const CATEGORY_LABELS = { bakery: 'Bakery', cafe: 'Café', meal: 'Meal' };

  // Card badges from the drop + its vendor, replacing the mockup's fixed
  // "Artisan Bakery" / "4.9 (120+)" text. No review count exists in the DB.
  function cardBadges(drop, vendor) {
    const category = String(drop?.category || '');
    const titled = category.split(/[-_\s]+/).filter(Boolean).map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
    const rating = Number(vendor?.rating);
    return {
      categoryLabel: CATEGORY_LABELS[category] || titled || 'Surplus food',
      rating: rating > 0 ? rating.toFixed(1) : null,
      verified: vendor?.verified === true,
    };
  }

  window.NematExploreFilters = { filterOffers, sortOffers, offerFromDrop, offerFromCafe, cardBadges };
})();
