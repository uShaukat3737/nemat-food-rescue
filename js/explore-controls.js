// Wires the Explore page's search, category chips, Filters panel, Sort and
// "Hide Sold Out" controls (static Stitch markup) to NematExploreFilters.
// `groups` is [{ grid, items: [{ el, offer }] }], rebuilt from live state on
// every render, so freshly fetched drops/cafes are filtered like the rest.
(function () {
  const { filterOffers, sortOffers } = window.NematExploreFilters;

  const CHIPS = [['all', 'All'], ['bakery', 'Bakeries'], ['cafe', 'Cafés'], ['meal', 'Meals'], ['vegetarian', 'Vegetarian']];
  const SORTS = [['distance', 'Distance (nearest first)'], ['discount', 'Biggest discount'], ['price', 'Price (low to high)'], ['bags', 'Most bags left']];
  const PRICES = [['', 'Any price'], ['300', 'Up to PKR 300'], ['500', 'Up to PKR 500'], ['800', 'Up to PKR 800']];
  const CHIP_ON = ['bg-primary-container', 'text-on-primary'];
  const CHIP_OFF = ['bg-surface-container-lowest', 'hover:bg-surface-container', 'text-on-surface-variant'];

  const byText = (root, selector, text) => [...root.querySelectorAll(selector)].find(el => el.textContent.includes(text));

  function makeSelect(options, value, className) {
    const select = document.createElement('select');
    select.className = className;
    options.forEach(([key, label]) => select.add(new Option(label, key, false, key === value)));
    return select;
  }

  function activeCount(prefs) {
    return [prefs.query.trim(), prefs.category !== 'all', prefs.hideSoldOut, prefs.maxPrice].filter(Boolean).length;
  }

  function applyToGroup(group, prefs) {
    const elByOffer = new Map(group.items.map(item => [item.offer, item.el]));
    const shown = sortOffers(filterOffers([...elByOffer.keys()], prefs), prefs.sort);
    group.items.forEach(item => item.el.setAttribute('data-filtered-out', ''));
    shown.forEach(offer => {
      const el = elByOffer.get(offer);
      el.removeAttribute('data-filtered-out');
      group.grid.appendChild(el);
    });
    group.empty.hidden = shown.length > 0;
  }

  function paintChips(chips, groups, prefs) {
    const offers = groups.flatMap(group => group.items.map(item => item.offer));
    chips.forEach(chip => {
      const on = chip.dataset.category === prefs.category;
      CHIP_ON.forEach(cls => chip.classList.toggle(cls, on));
      CHIP_OFF.forEach(cls => chip.classList.toggle(cls, !on));
      chip.setAttribute('aria-pressed', String(on));
      const count = filterOffers(offers, { ...prefs, category: chip.dataset.category }).length;
      chip.textContent = `${chip.dataset.label} (${count})`;
    });
  }

  function buildChips(row) {
    row.replaceChildren();
    return CHIPS.map(([key, label]) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'whitespace-nowrap px-space-md py-1.5 rounded-full font-label-md text-label-md shadow-sm transition-colors';
      chip.dataset.category = key;
      chip.dataset.label = label;
      row.appendChild(chip);
      return chip;
    });
  }

  function buildSort(sortButton, prefs) {
    const label = document.createElement('label');
    label.className = `${sortButton.className} cursor-pointer`;
    const caption = document.createElement('span');
    caption.className = 'text-on-surface-variant';
    caption.textContent = 'Sort by:';
    const select = makeSelect(SORTS, prefs.sort, 'font-bold text-primary bg-transparent border-0 p-0 pr-6 focus:ring-0 cursor-pointer');
    label.append(caption, select);
    sortButton.replaceWith(label);
    return select;
  }

  function buildFilterPanel(filtersButton, prefs) {
    const panel = document.createElement('div');
    panel.className = 'explore-filter-panel flex flex-wrap items-center gap-space-sm p-space-sm rounded-lg bg-surface-container-lowest shadow-sm';
    panel.hidden = true;
    const price = makeSelect(PRICES, prefs.maxPrice, 'rounded-md border-outline-variant bg-surface text-on-surface font-label-sm text-label-sm');
    price.setAttribute('aria-label', 'Maximum price');
    const clear = document.createElement('button');
    clear.type = 'button';
    clear.className = 'px-space-md py-1 rounded-md text-secondary font-label-sm text-label-sm hover:underline';
    clear.textContent = 'Clear all filters';
    panel.append(price, clear);
    filtersButton.closest('.flex.flex-wrap')?.after(panel);
    filtersButton.setAttribute('aria-expanded', 'false');
    filtersButton.addEventListener('click', () => {
      panel.hidden = !panel.hidden;
      filtersButton.setAttribute('aria-expanded', String(!panel.hidden));
    });
    return { panel, price, clear };
  }

  function addEmptyStates(groups) {
    groups.forEach(group => {
      const empty = document.createElement('p');
      empty.className = 'font-body-md text-body-md text-on-surface-variant py-space-lg';
      empty.textContent = 'No bags match your filters.';
      empty.hidden = true;
      group.grid.after(empty);
      group.empty = empty;
    });
  }

  function bind(main, groups, savedPrefs) {
    const search = main?.querySelector('input[placeholder^="Search caf"]');
    const chipRow = byText(main || document, 'button', 'All (')?.parentElement;
    const filtersButton = byText(main || document, 'button', 'Filters');
    const sortButton = byText(main || document, 'button', 'Sort by:');
    const soldOut = byText(main || document, 'label', 'Hide Sold Out')?.querySelector('input');
    if (!main || !search || !chipRow || !filtersButton || !sortButton || !soldOut) return savedPrefs;

    const prefs = savedPrefs || { query: '', category: 'all', hideSoldOut: soldOut.checked, maxPrice: '', sort: 'distance' };
    const badge = filtersButton.querySelector('.rounded-full');
    const chips = buildChips(chipRow);
    const sort = buildSort(sortButton, prefs);
    const panel = buildFilterPanel(filtersButton, prefs);
    addEmptyStates(groups);

    const apply = () => {
      groups.forEach(group => applyToGroup(group, prefs));
      paintChips(chips, groups, prefs);
      const count = activeCount(prefs);
      if (badge) { badge.textContent = `${count} active`; badge.hidden = count === 0; }
    };

    search.value = prefs.query;
    soldOut.checked = prefs.hideSoldOut;
    search.addEventListener('input', () => { prefs.query = search.value; apply(); });
    soldOut.addEventListener('change', () => { prefs.hideSoldOut = soldOut.checked; apply(); });
    sort.addEventListener('change', () => { prefs.sort = sort.value; apply(); });
    panel.price.addEventListener('change', () => { prefs.maxPrice = panel.price.value; apply(); });
    chips.forEach(chip => chip.addEventListener('click', () => { prefs.category = chip.dataset.category; apply(); }));
    panel.clear.addEventListener('click', () => {
      Object.assign(prefs, { query: '', category: 'all', hideSoldOut: false, maxPrice: '' });
      search.value = '';
      soldOut.checked = false;
      panel.price.value = '';
      apply();
    });
    apply();
    return prefs;
  }

  window.NematExploreControls = { bind };
})();
