// Nemat (نعمت) - Main Application Controller
// Unifies all 24 Stitch screen designs with exact layouts, reactive state, and full SRS functional workflows.

const SCREENS = {
  'welcome': 'welcome_nemat_food_rescue',
  'choose-role': 'choose_role_nemat_food_rescue',
  'customer/explore': 'customer_explore_nemat_food_rescue',
  'customer/map': 'customer_map_nemat_food_rescue',
  'customer/location': 'customer_location_nemat_food_rescue',
  'customer/bag': 'surprise_bag_details_nemat_food_rescue',
  'customer/confirmed': 'reservation_confirmation_nemat_food_rescue',
  'customer/pass': 'pickup_pass_nemat_food_rescue',
  'customer/reservations': 'my_reservations_nemat_food_rescue',
  'customer/profile': 'customer_profile_nemat_food_rescue',
  'vendor/dashboard': 'vendor_dashboard_nemat_food_rescue',
  'vendor/new-drop': 'create_new_drop_nemat_food_rescue',
  'volunteer/jobs': 'rescue_jobs_nemat_food_rescue',
  'volunteer/job': 'rescue_job_details_nemat_food_rescue',
  'volunteer/active': 'active_rescue_nemat_food_rescue',
  'volunteer/deliver': 'deliver_rescued_food_nemat_food_rescue',
  'volunteer/my-runs': 'my_runs_nemat_food_rescue',
  'recipient/dashboard': 'recipient_dashboard_nemat_food_rescue',
  'recipient/delivery': 'delivery_confirmation_nemat_food_rescue',
  'admin/dashboard': 'admin_dashboard_nemat_food_rescue',
  'admin/approvals': 'approvals_verification_nemat_food_rescue',
  'admin/safety': 'food_safety_reports_nemat_food_rescue',
  'admin/analytics': 'platform_analytics_nemat_food_rescue',
  'components': 'component_state_sheet_nemat_food_rescue'
};

// Map Stitch data-path attributes to application routes
const DATA_PATH_MAP = {
  'explore': 'customer/explore',
  'browse-surplus': 'customer/explore',
  'map': 'customer/map',
  'my-reservations': 'customer/reservations',
  'profile': 'customer/profile',
  'switch-role': 'choose-role',
  'select-role': 'choose-role',
  'role-switcher': 'choose-role',
  'dashboard': 'vendor/dashboard',
  'new-drop': 'vendor/new-drop',
  'jobs': 'volunteer/jobs',
  'volunteer-jobs': 'volunteer/jobs',
  'my-runs': 'volunteer/my-runs',
  'volunteer-profile': 'volunteer/my-runs',
  'recipient-dashboard': 'recipient/dashboard',
  'recipient-deliveries': 'recipient/delivery',
  'recipient-history': 'recipient/dashboard',
  'recipient-profile': 'recipient/dashboard',
  'platform-overview': 'admin/dashboard',
  'approvals-and-verification': 'admin/approvals',
  'food-safety': 'admin/safety',
  'analytics': 'admin/analytics',
  'audit-log': 'admin/safety',
  'users': 'admin/dashboard',
  'settings': 'vendor/dashboard',
  'how-it-works': 'welcome',
  'community-impact': 'admin/analytics',
  'about': 'welcome',
  'tokens': 'components'
};

class NematApp {
  constructor() {
    this.screenCache = {};
    this.currentRoute = '';
    this.selectedBagId = 'drop-1';
    this.selectedJobId = 'rj-104';
    this.init();
  }

  async init() {
    this.setupToastContainer();
    this.setupRouter();

    // Listen to hash changes
    window.addEventListener('hashchange', () => this.handleHashChange());

    // Listen to state changes
    window.NematState.subscribe(() => {
      this.updateQuickHubActiveRole();
    });

    // Handle initial route immediately with local demo data, then swap
    // in live data from the backend as soon as it arrives.
    this.handleHashChange();
    await window.NematState.bootstrap();
    this.handleHashChange();
  }

  setupToastContainer() {
    if (!document.getElementById('nemat-toast-container')) {
      const container = document.createElement('div');
      container.id = 'nemat-toast-container';
      document.body.appendChild(container);
    }
  }

  showToast(title, message, icon = 'info') {
    const container = document.getElementById('nemat-toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'nemat-toast';
    toast.innerHTML = `
      <span class="material-symbols-outlined text-primary text-[22px]">${icon}</span>
      <div class="flex flex-col flex-1">
        <span class="font-bold text-sm text-primary">${title}</span>
        <span class="text-xs text-on-surface-variant mt-0.5 leading-snug">${message}</span>
      </div>
      <button class="text-outline hover:text-on-surface text-sm ml-2" onclick="this.parentElement.remove()">✕</button>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      if (toast.parentElement) {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        setTimeout(() => toast.remove(), 250);
      }
    }, 4500);
  }

  setupQuickHub() {
    if (document.getElementById('nemat-quick-hub')) return;

    const hub = document.createElement('div');
    hub.id = 'nemat-quick-hub';
    hub.innerHTML = `
      <div class="flex items-center gap-1.5 pr-2 border-r border-white/20">
        <span class="w-2 h-2 rounded-full bg-secondary-container animate-pulse"></span>
        <span class="font-bold text-xs tracking-wider uppercase text-tertiary-fixed">Nemat Hub</span>
      </div>
      <div class="flex items-center gap-1">
        <button class="hub-btn" data-role-switch="customer" title="Switch to Customer view">
          <span class="material-symbols-outlined text-[16px]">shopping_bag</span> Customer
        </button>
        <button class="hub-btn" data-role-switch="vendor" title="Switch to Vendor view">
          <span class="material-symbols-outlined text-[16px]">storefront</span> Vendor
        </button>
        <button class="hub-btn" data-role-switch="volunteer" title="Switch to Volunteer view">
          <span class="material-symbols-outlined text-[16px]">two_wheeler</span> Volunteer
        </button>
        <button class="hub-btn" data-role-switch="recipient" title="Switch to Recipient Org view">
          <span class="material-symbols-outlined text-[16px]">corporate_fare</span> Recipient
        </button>
        <button class="hub-btn" data-role-switch="admin" title="Switch to Admin view">
          <span class="material-symbols-outlined text-[16px]">admin_panel_settings</span> Admin
        </button>
      </div>
      <div class="flex items-center gap-1 pl-2 border-l border-white/20">
        <button class="hub-btn text-xs text-white/80 hover:text-white" id="quick-scenario-btn" title="Run Demo Scenarios">
          <span class="material-symbols-outlined text-[16px]">auto_fix_high</span> Scenarios
        </button>
        <button class="hub-btn text-xs text-white/80 hover:text-white" id="quick-otp-btn" title="Simulate SMS OTP Login">
          <span class="material-symbols-outlined text-[16px]">sms</span> OTP
        </button>
      </div>
    `;

    document.body.appendChild(hub);

    // Event listeners on hub
    hub.querySelectorAll('[data-role-switch]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const role = btn.getAttribute('data-role-switch');
        this.switchRole(role);
      });
    });

    const scenarioBtn = document.getElementById('quick-scenario-btn');
    if (scenarioBtn) {
      scenarioBtn.addEventListener('click', () => this.openScenariosModal());
    }

    const otpBtn = document.getElementById('quick-otp-btn');
    if (otpBtn) {
      otpBtn.addEventListener('click', () => this.openOtpModal());
    }
  }

  updateQuickHubActiveRole() {
    const role = window.NematState.get().currentRole;
    const hub = document.getElementById('nemat-quick-hub');
    if (!hub) return;

    hub.querySelectorAll('[data-role-switch]').forEach(btn => {
      if (btn.getAttribute('data-role-switch') === role) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  switchRole(role) {
    window.NematState.setRole(role);
    this.updateQuickHubActiveRole();
    this.showToast(`Switched Role: ${role.toUpperCase()}`, `Active view updated for ${role}.`, 'sync_alt');

    switch (role) {
      case 'customer':
        this.navigate('customer/map');
        break;
      case 'vendor':
        this.navigate('vendor/dashboard');
        break;
      case 'volunteer':
        this.navigate('volunteer/jobs');
        break;
      case 'recipient':
        this.navigate('recipient/dashboard');
        break;
      case 'admin':
        this.navigate('admin/dashboard');
        break;
      default:
        this.navigate('welcome');
    }
  }

  setupRouter() {
    // Intercept clicks on links
    document.addEventListener('click', (e) => {
      // Role card clicks on choose-role screen (plain divs, not links/buttons —
      // must be checked before the closest('a, button') early return below).
      const roleCard = e.target.closest('.role-card');
      if (roleCard) {
        const role = roleCard.getAttribute('data-role')?.toLowerCase();
        if (role) {
          window.NematState.setRole(role.includes('recipient') ? 'recipient' : role);
        }
      }

      const link = e.target.closest('a, button');
      if (!link) return;

      const dataPath = link.getAttribute('data-path');
      if (dataPath) {
        e.preventDefault();
        const mappedRoute = DATA_PATH_MAP[dataPath];
        if (mappedRoute) {
          this.navigate(mappedRoute);
        } else {
          console.warn('Unmapped data-path:', dataPath);
        }
        return;
      }

      // Check role continue button on choose-role
      if (link.id === 'continue-action-button') {
        e.preventDefault();
        const currentRole = window.NematState.get().currentRole || 'customer';
        this.switchRole(currentRole);
      }
    });
  }

  navigate(route) {
    window.location.hash = '#/' + route;
  }

  handleHashChange() {
    const rawHash = window.location.hash;
    // In-page anchor (e.g. #profile-section), not a route — but only once a screen
    // is already loaded; on first load fall through so the app doesn't stay blank.
    if (rawHash && !rawHash.startsWith('#/') && this.currentRoute) return;
    let hash = rawHash.replace(/^#\/?/, '') || 'welcome';
    if (!SCREENS[hash]) {
      // Find closest or default to welcome
      const cleanHash = Object.keys(SCREENS).find(k => k === hash || hash.startsWith(k));
      if (cleanHash) {
        hash = cleanHash;
      } else {
        hash = 'welcome';
      }
    }
    this.currentRoute = hash;
    this.loadScreen(hash);
  }

  async loadScreen(routeKey) {
    const screenFolder = SCREENS[routeKey];
    if (!screenFolder) {
      console.error('Unknown route:', routeKey);
      return;
    }

    const appRoot = document.getElementById('app-root');
    if (!appRoot) return;

    try {
      let html = this.screenCache[screenFolder];
      if (!html) {
        const resp = await fetch(`/stitch_surplus_food_rescue_platform/${screenFolder}/code.html`);
        if (!resp.ok) throw new Error(`HTTP ${resp.status} fetching ${screenFolder}`);
        html = await resp.text();
        this.screenCache[screenFolder] = html;
      }

      // Parse HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Extract body contents
      const bodyContent = doc.body.innerHTML;

      // Replace app root content
      appRoot.innerHTML = bodyContent;
      appRoot.className = doc.body.className || 'bg-surface font-body-md text-on-surface antialiased';
      appRoot.classList.add('nemat-screen-enter');

      // innerHTML never executes <script> tags, so each template's own inline
      // interaction script (modals, tabs, etc.) needs to be re-created to run.
      // Wrapped in an IIFE: classic <script> top-level const/let attach to
      // the real global scope, not the DOM node, so revisiting a screen
      // whose script declares e.g. `const refreshBtn = ...` a second time
      // threw "Identifier has already been declared" and aborted the rest
      // of loadScreen (scroll reset, quick-hub highlight, language re-apply).
      appRoot.querySelectorAll('script').forEach(oldScript => {
        const newScript = document.createElement('script');
        if (oldScript.src) {
          newScript.src = oldScript.src;
        } else {
          newScript.textContent = `(function(){\n${oldScript.textContent}\n})();`;
        }
        oldScript.replaceWith(newScript);
      });

      // Hydrate screen
      this.hydrateCurrentScreen(routeKey, appRoot);

      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'instant' });

      // Update quick hub
      this.updateQuickHubActiveRole();
      const quickHub = document.getElementById('nemat-quick-hub');
      if (quickHub) {
        quickHub.hidden = true;
        quickHub.style.display = 'none';
      }

      // Apply current language
      const lang = window.NematState.get().language || 'en';
      window.NematI18n.applyLanguage(lang);

    } catch (err) {
      console.error('Error loading screen:', err);
      this.showToast('Loading Error', `Could not load ${screenFolder}`, 'error');
    }
  }

  hydrateCurrentScreen(routeKey, container) {
    // 1. Language Toggle Listeners (EN / اردو)
    container.querySelectorAll('header button, aside button, nav button').forEach(btn => {
      if (btn.hasAttribute('data-language-choice')) return;
      const text = btn.textContent.trim();
      if (text === 'EN' || text === 'اردو' || text === 'English') {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const newLang = (text === 'اردو') ? 'ur' : 'en';
          window.NematState.setLanguage(newLang);
          window.NematI18n.applyLanguage(newLang);
          this.showToast(newLang === 'ur' ? 'اردو زبان فعال' : 'English Mode Activated', 'Language toggled.', 'translate');
        });
      }
    });

    // 2. Apply the shared customer shell treatment to vendor workspaces as well.
    if (routeKey.startsWith('vendor/')) this.prepareVendorWorkspace(container, routeKey);
    if (routeKey.startsWith('volunteer/')) this.prepareVolunteerWorkspace(container, routeKey);
    if (routeKey.startsWith('admin/')) this.prepareAdminWorkspace(container, routeKey);
    if (routeKey.startsWith('recipient/')) this.prepareRecipientWorkspace(container, routeKey);

    // 2. Specific Screen Hydration
    if (routeKey.startsWith('customer/') && !['customer/bag','customer/confirmed','customer/pass'].includes(routeKey)) {
      const active = ['customer/map','customer/location'].includes(routeKey) ? 'map' : routeKey === 'customer/reservations' ? 'my-reservations' : routeKey === 'customer/profile' ? 'profile' : 'explore';
      const nav = this.customerNavigation(active);
      const oldHeader = container.querySelector('header');
      const oldAside = container.querySelector('aside');
      const oldMain = container.querySelector('main');
      const logo = document.createElement('a');
      logo.className = 'retro-brand'; logo.href = '#/welcome'; logo.dataset.path = 'how-it-works';
      logo.innerHTML = '<img class="retro-brand-mark" src="/images/nemat-logo.svg" alt="Nemat">Nemat<span>.</span>';
      const language = document.createElement('div'); language.className = 'customer-language';
      language.innerHTML = '<button type="button" data-language-choice="en">English</button><button type="button" data-language-choice="ur">\u0627\u0631\u062f\u0648</button>';
      language.querySelectorAll('[data-language-choice]').forEach(button => button.addEventListener('click', () => { const lang=button.dataset.languageChoice; window.NematState.setLanguage(lang); window.NematI18n.applyLanguage(lang); language.querySelectorAll('button').forEach(item=>item.classList.toggle('is-selected',item===button)); }));
      const topbar = document.createElement('header'); topbar.className = 'customer-topbar';
      topbar.append(logo, nav, language);
      if (oldHeader) oldHeader.remove();
      if (oldAside) oldAside.remove();
      const oldShell = container.querySelector(':scope > div.pl-72');
      if (oldShell) oldShell.classList.remove('pl-72');
      container.classList.add('customer-page');
      const outerShell = container.querySelector(':scope > div.pl-72');
      if (outerShell) { outerShell.classList.remove('pl-72'); outerShell.prepend(topbar); outerShell.classList.add('customer-workspace-inner'); }
      else container.prepend(topbar);
      if (oldMain) { oldMain.classList.add('customer-content'); oldMain.classList.remove('pt-20'); }
      container.querySelectorAll('[data-path="switch-role"], #nemat-quick-hub').forEach(el => el.remove());
      container.querySelectorAll('a').forEach(a => { if (a.textContent.trim() === 'Change') { a.dataset.path = 'location'; a.href = '#/customer/location'; } });
    }
    if (routeKey === 'customer/explore') {
      this.hydrateCustomerExplore(container);
    } else if (routeKey === 'customer/location') {
      this.hydrateCustomerLocation(container);
    } else if (routeKey === 'customer/map') {
      this.hydrateCustomerMap(container);
    } else if (routeKey === 'customer/bag') {
      this.hydrateSurpriseBagDetails(container);
    } else if (routeKey === 'customer/confirmed') {
      this.hydrateReservationConfirmation(container);
    } else if (routeKey === 'customer/pass') {
      this.hydratePickupPass(container);
    } else if (routeKey === 'customer/reservations') {
      this.hydrateMyReservations(container);
    } else if (routeKey === 'vendor/dashboard') {
      this.hydrateVendorDashboard(container);
    } else if (routeKey === 'vendor/new-drop') {
      this.hydrateCreateNewDrop(container);
    } else if (routeKey === 'volunteer/jobs') {
      this.hydrateRescueJobs(container);
    } else if (routeKey === 'volunteer/job') {
      this.hydrateRescueJobDetails(container);
    } else if (routeKey === 'volunteer/active') {
      this.hydrateActiveRescue(container);
    } else if (routeKey === 'volunteer/deliver') {
      this.hydrateDeliverRescuedFood(container);
    } else if (routeKey === 'recipient/dashboard') {
      this.hydrateRecipientDashboard(container);
    } else if (routeKey === 'recipient/delivery') {
      this.hydrateDeliveryConfirmation(container);
    } else if (routeKey === 'admin/dashboard') {
      this.hydrateAdminDashboard(container);
    } else if (routeKey === 'admin/approvals') {
      this.hydrateApprovals(container);
    } else if (routeKey === 'admin/safety') {
      this.hydrateFoodSafetyDesk(container);
    } else if (routeKey === 'customer/profile') {
      this.hydrateCustomerProfile(container);
    } else if (routeKey === 'volunteer/my-runs') {
      this.hydrateMyRuns(container);
    }
  }

  // --- SCREEN HYDRATORS ---

  hydrateCustomerExplore(container) {
    const hero = container.querySelector('main section');
    container.classList.add('customer-explore-page');
    hero?.classList.add('customer-explore-hero');
    hero?.querySelector(':scope > div > div:last-child > div:last-child')?.classList.add('customer-explore-impact');
    if (hero && !hero.querySelector('.customer-mascot-art')) {
      const mascot = document.createElement('img');
      mascot.className = 'customer-mascot-art';
      mascot.src = '/images/eat-transparent.png';
      mascot.alt = 'Nemat food rescue characters';
      hero.appendChild(mascot);
    }
    // Stitch markup has no per-card id, so match each card to its real drop
    // by the vendor name already printed on the card (robust to a new drop
    // being unshifted to the front of state.drops — plain array-index
    // matching would silently point every card at the wrong bag then).
    // Falls back to position only if no vendor name match is found.
    const state = window.NematState.get();
    const drops = state.drops;
    const cafeGroup = this.renderMapCafeList(container);
    const offerGrid = this.renderOfferCards(container, drops);

    container.querySelectorAll('article, .surplus-card').forEach((card, idx) => {
      const cardText = card.textContent;
      const matchedDrop = drops.find(d => d.id === card.dataset.dropId) ||
        drops.find(d => d.vendorName && cardText.includes(d.vendorName));
      const dropId = matchedDrop?.id ?? drops[idx]?.id ?? 'drop-1';
      const drop = matchedDrop || drops[idx];
      if (drop) this.hydrateOfferCard(card, drop);
      card.style.cursor = 'pointer';
      card.addEventListener('click', (e) => {
        if (e.target.closest('button, a')) return;
        this.selectedBagId = dropId;
        this.navigate('customer/bag');
      });

      // Reserve/Bag buttons nested inside this specific card
      card.querySelectorAll('a, button').forEach(btn => {
        if (btn.getAttribute('aria-label') === 'Save to favorites') {
          this.bindFavoriteButton(btn, dropId);
          return;
        }
        const btnText = btn.textContent.toLowerCase();
        if (btnText.includes('reserve') || btnText.includes('bag')) {
          btn.addEventListener('click', (e) => {
            e.preventDefault();
            this.selectedBagId = dropId;
            this.navigate('customer/bag');
          });
        }
      });
    });
    this.bindExploreControls(container, cafeGroup, offerGrid, drops);

    // Wire Sector Change link
    container.querySelectorAll('a').forEach(a => {
      if (a.textContent.trim() === 'Change') {
        a.addEventListener('click', (e) => {
          e.preventDefault();
          this.navigate('customer/location');
        });
      }
    });
  }

  formatOfferTime(drop) {
    const toClock = value => {
      if (!value) return '';
      const [hours, minutes] = value.slice(0, 5).split(':').map(Number);
      return `${hours % 12 || 12}:${String(minutes || 0).padStart(2, '0')} ${hours >= 12 ? 'PM' : 'AM'}`;
    };
    return `${toClock(drop.windowStart)} – ${toClock(drop.windowEnd)}`;
  }

  // The Stitch mockup ships a fixed 3 cards; clone the first one per drop so
  // every drop from the API gets a card, however many there are.
  renderOfferCards(container, drops) {
    const template = container.querySelector('main article');
    const grid = template?.parentElement;
    if (!grid) return null;
    grid.querySelectorAll(':scope > article').forEach(card => card.remove());
    drops.forEach(drop => {
      const card = template.cloneNode(true);
      card.dataset.dropId = drop.id;
      grid.appendChild(card);
    });
    const total = [...container.querySelectorAll('main h2')].find(h => h.textContent.trim() === 'Available near you')?.nextElementSibling;
    if (total) total.textContent = `${drops.reduce((sum, drop) => sum + (Number(drop.bagsLeft) || 0), 0)} bags left`;
    return grid;
  }

  bindExploreControls(container, cafeGroup, offerGrid, drops) {
    const { offerFromDrop } = window.NematExploreFilters;
    const groups = cafeGroup ? [cafeGroup] : [];
    if (offerGrid) {
      const items = [...offerGrid.querySelectorAll(':scope > article')]
        .map(el => ({ el, offer: offerFromDrop(drops.find(drop => drop.id === el.dataset.dropId) || {}) }));
      groups.push({ grid: offerGrid, items });
    }
    this.exploreFilters = window.NematExploreControls.bind(container.querySelector('main'), groups, this.exploreFilters);
  }

  hydrateOfferCard(card, drop) {
    const vendor = card.querySelector('.font-headline-sm.text-headline-sm.text-on-surface.font-bold');
    if (vendor) vendor.textContent = drop.vendorName;
    const title = card.querySelector('.font-label-md.text-label-md.text-primary.font-bold');
    if (title) title.textContent = drop.title;
    const description = card.querySelector('p.line-clamp-2');
    if (description) description.textContent = drop.description;
    const time = [...card.querySelectorAll('span')].find(el => /Today/.test(el.textContent) && /[0-9].*(AM|PM)/i.test(el.textContent));
    if (time) time.textContent = `Today ${this.formatOfferTime(drop)}`;
    const sector = time?.parentElement?.querySelector('span.ml-auto');
    if (sector) sector.textContent = drop.sector;
    const tagRow = card.querySelector('.flex.flex-wrap.gap-1.mt-1');
    if (tagRow) {
      tagRow.innerHTML = (drop.tags || []).filter(tag => !tag.toLowerCase().startsWith('contains')).slice(0, 2)
        .map(tag => `<span class="px-2 py-0.5 rounded text-[11px] font-label-sm bg-surface-container text-on-surface-variant">${tag}</span>`).join('');
    }
    const price = card.querySelector('.font-metric-price.text-metric-price.text-primary');
    if (price) price.textContent = `PKR ${drop.pricePkr}`;
    const retail = card.querySelector('del.font-body-sm');
    if (retail) retail.textContent = `PKR ${drop.retailPkr}`;
    const saving = [...card.querySelectorAll('span')].find(el => /^Save PKR /.test(el.textContent.trim()));
    if (saving) saving.textContent = `Save PKR ${drop.retailPkr - drop.pricePkr}`;
    const discount = [...card.querySelectorAll('span')].find(el => /% OFF$/.test(el.textContent.trim()));
    if (discount) discount.textContent = `-${drop.discountPct}% OFF`;
    const availability = [...card.querySelectorAll('span')].find(el => /bag(s)? left|Only \d+ bag/i.test(el.textContent));
    if (availability) availability.textContent = drop.bagsLeft === 1 ? 'Only 1 bag left!' : `${drop.bagsLeft} bags left`;
    const image = card.querySelector('img');
    if (image && drop.image) image.src = drop.image;
  }

  bindFavoriteButton(button, dropId) {
    const key = 'nemat_saved_bags';
    let fallbackSaved = [];
    const read = () => { try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return fallbackSaved; } };
    const paint = () => {
      const saved = read().includes(dropId);
      button.setAttribute('aria-pressed', String(saved));
      button.classList.toggle('text-error', saved);
      const icon = button.querySelector('.material-symbols-outlined');
      if (icon) icon.style.fontVariationSettings = saved ? "'FILL' 1" : "'FILL' 0";
    };
    paint();
    button.addEventListener('click', event => {
      event.preventDefault(); event.stopPropagation();
      const saved = read();
      const next = saved.includes(dropId) ? saved.filter(id => id !== dropId) : [...saved, dropId];
      fallbackSaved = next;
      try { localStorage.setItem(key, JSON.stringify(next)); } catch {}
      paint();
      this.showToast(next.includes(dropId) ? 'Saved to favorites' : 'Removed from favorites', '', next.includes(dropId) ? 'favorite' : 'favorite_border');
    });
  }

  hydrateCustomerLocation(container) {
    const hero = container.querySelector('main > div');
    if (hero && !hero.querySelector('.customer-mascot-art')) {
      const mascot = document.createElement('img'); mascot.className = 'customer-mascot-art customer-mascot-art--location';
      mascot.src = '/images/eat-transparent.png'; mascot.alt = 'Nemat food rescue characters'; hero.appendChild(mascot);
    }
    const customerNav = this.customerNavigation('location');
    container.querySelector('.customer-topnav')?.replaceWith(customerNav);
    const state = window.NematState.get();
    const selected = state.currentUser?.sector || 'F-7';
    const selectedChip = container.querySelector(`.sector-chip[data-sector="${selected}"]`);
    if (selectedChip && !selectedChip.classList.contains('active')) selectedChip.click();
    container.querySelectorAll('.sector-chip').forEach(chip => chip.addEventListener('click', () => {
      const sector = chip.getAttribute('data-sector');
      if (sector && state.currentUser) {
        state.currentUser.sector = sector.replace('-', '-');
        try { localStorage.setItem('nemat_customer_location', JSON.stringify({ sector, radiusKm: Number(container.querySelector('#radius-slider')?.value || 3) })); } catch {}
      }
    }));
    const locate = container.querySelector('[data-path="map"]');
    locate?.addEventListener('click', () => {
      const active = container.querySelector('.sector-chip.active') || container.querySelector('.sector-chip[data-sector="F-7"]');
      const key = active?.getAttribute('data-sector') || 'F-7';
      try { localStorage.setItem('nemat_customer_location', JSON.stringify({ sector: key, radiusKm: Number(container.querySelector('#radius-slider')?.value || 3) })); } catch {}
    });
  }

  customerNavigation(active) {
    const nav = document.createElement('nav');
    nav.className = 'customer-topnav';
    nav.setAttribute('aria-label', 'Customer navigation');
    const entries = [
      ['explore', 'storefront', 'Explore', 'customer/explore'],
      ['map', 'map', 'Map', 'customer/map'],
      ['my-reservations', 'receipt_long', 'My Reservations', 'customer/reservations'],
      ['profile', 'account_circle', 'Profile', 'customer/profile']
    ];
    entries.forEach(([key, icon, label, path]) => {
      const link = document.createElement('a');
      link.href = `#/${path}`;
      link.dataset.path = key;
      link.classList.toggle('active', key === active);
      link.innerHTML = `<span class="material-symbols-outlined">${icon}</span>${label}`;
      nav.appendChild(link);
    });
    return nav;
  }

  prepareVendorWorkspace(container, routeKey) {
    const oldHeader = container.querySelector('header');
    const oldAside = container.querySelector('aside');
    const main = container.querySelector('main');
    const shell = container.querySelector(':scope > div.pl-72');
    const logo = document.createElement('a');
    logo.className = 'retro-brand'; logo.href = '#/welcome'; logo.dataset.path = 'how-it-works';
    logo.innerHTML = '<img class="retro-brand-mark" src="/images/nemat-logo.svg" alt="Nemat">Nemat<span>.</span>';
    const nav = document.createElement('nav'); nav.className = 'customer-topnav vendor-topnav'; nav.setAttribute('aria-label','Vendor navigation');
    [['dashboard','grid_view','Dashboard','vendor/dashboard'],['new-drop','add_circle','New Drop','vendor/new-drop'],['settings','settings','Settings','vendor/dashboard']].forEach(([key,icon,label,path])=>{
      const link=document.createElement('a');link.href=`#/${path}`;link.dataset.path=key;link.classList.toggle('active',key===(routeKey==='vendor/new-drop'?'new-drop':'dashboard'));link.innerHTML=`<span class="material-symbols-outlined">${icon}</span>${label}`;nav.appendChild(link);
    });
    const language=document.createElement('div');language.className='customer-language';language.innerHTML='<button type="button" data-language-choice="en">English</button><button type="button" data-language-choice="ur">اردو</button>';
    language.querySelectorAll('[data-language-choice]').forEach(button=>button.addEventListener('click',()=>{const lang=button.dataset.languageChoice;window.NematState.setLanguage(lang);window.NematI18n.applyLanguage(lang);language.querySelectorAll('button').forEach(item=>item.classList.toggle('is-selected',item===button))}));
    const topbar=document.createElement('header');topbar.className='customer-topbar vendor-topbar';topbar.append(logo,nav,language);
    oldHeader?.remove();oldAside?.remove();shell?.classList.remove('pl-72');container.classList.add('customer-page','vendor-page');
    const updatedShell=container.querySelector(':scope > div.pl-72');
    if(updatedShell){updatedShell.classList.remove('pl-72');updatedShell.classList.add('customer-workspace-inner');updatedShell.prepend(topbar)}else container.prepend(topbar);
    main?.classList.add('customer-content');main?.classList.remove('pt-18','pt-20');
    container.querySelectorAll('#nemat-quick-hub,[data-path="switch-role"]').forEach(el=>el.remove());
  }

  prepareVolunteerWorkspace(container, routeKey) {
    const oldHeader=container.querySelector('header');
    const oldAside=container.querySelector('aside');
    const main=container.querySelector('main');
    const shell=container.querySelector(':scope > div.pl-72');
    const logo=document.createElement('a');logo.className='retro-brand';logo.href='#/welcome';logo.dataset.path='how-it-works';logo.innerHTML='<img class="retro-brand-mark" src="/images/nemat-logo.svg" alt="Nemat">Nemat<span>.</span>';
    const nav=document.createElement('nav');nav.className='customer-topnav volunteer-topnav';nav.setAttribute('aria-label','Volunteer navigation');
    [['jobs','pin_drop','Jobs','volunteer/jobs'],['my-runs','two_wheeler','My Runs','volunteer/my-runs'],['volunteer-profile','person','Profile','volunteer/my-runs']].forEach(([key,icon,label,path])=>{const link=document.createElement('a');link.href=`#/${path}`;link.dataset.path=key;link.classList.toggle('active',routeKey==='volunteer/jobs'?key==='jobs':key==='my-runs'||key==='volunteer-profile');link.innerHTML=`<span class="material-symbols-outlined">${icon}</span>${label}`;nav.appendChild(link)});
    const language=document.createElement('div');language.className='customer-language';language.innerHTML='<button type="button" data-language-choice="en">English</button><button type="button" data-language-choice="ur">اردو</button>';language.querySelectorAll('[data-language-choice]').forEach(button=>button.addEventListener('click',()=>{const lang=button.dataset.languageChoice;window.NematState.setLanguage(lang);window.NematI18n.applyLanguage(lang);language.querySelectorAll('button').forEach(item=>item.classList.toggle('is-selected',item===button))}));
    const topbar=document.createElement('header');topbar.className='customer-topbar volunteer-topbar';topbar.append(logo,nav,language);
    oldHeader?.remove();oldAside?.remove();shell?.classList.remove('pl-72');container.classList.add('customer-page','volunteer-page');
    const updatedShell=container.querySelector(':scope > div.pl-72');if(updatedShell){updatedShell.classList.remove('pl-72');updatedShell.classList.add('customer-workspace-inner');updatedShell.prepend(topbar)}else container.prepend(topbar);
    main?.classList.add('customer-content');main?.classList.remove('pt-18','pt-20');
    container.querySelectorAll('#nemat-quick-hub,[data-path="switch-role"]').forEach(el=>el.remove());
  }

  prepareAdminWorkspace(container, routeKey) {
    const oldHeader=container.querySelector('header');const oldAside=container.querySelector('aside');const main=container.querySelector('main');const shell=container.querySelector(':scope > div.pl-72');
    const logo=document.createElement('a');logo.className='retro-brand';logo.href='#/welcome';logo.dataset.path='how-it-works';logo.innerHTML='<img class="retro-brand-mark" src="/images/nemat-logo.svg" alt="Nemat">Nemat<span>.</span>';
    const nav=document.createElement('nav');nav.className='customer-topnav admin-topnav';nav.setAttribute('aria-label','Administration navigation');
    [['platform-overview','dashboard','Overview','admin/dashboard'],['approvals-and-verification','verified','Approvals','admin/approvals'],['users','group','Users','admin/dashboard'],['food-safety','health_and_safety','Food Safety','admin/safety'],['analytics','monitoring','Analytics','admin/analytics'],['audit-log','history_edu','Audit Log','admin/safety']].forEach(([key,icon,label,path])=>{const link=document.createElement('a');link.href=`#/${path}`;link.dataset.path=key;link.classList.toggle('active',routeKey==='admin/dashboard'?key==='platform-overview':routeKey==='admin/approvals'?key==='approvals-and-verification':routeKey==='admin/safety'?['food-safety','audit-log'].includes(key):routeKey==='admin/analytics'?key==='analytics':false);link.innerHTML=`<span class="material-symbols-outlined">${icon}</span>${label}`;nav.appendChild(link)});
    const language=document.createElement('div');language.className='customer-language';language.innerHTML='<button type="button" data-language-choice="en">English</button><button type="button" data-language-choice="ur">اردو</button>';language.querySelectorAll('[data-language-choice]').forEach(button=>button.addEventListener('click',()=>{const lang=button.dataset.languageChoice;window.NematState.setLanguage(lang);window.NematI18n.applyLanguage(lang);language.querySelectorAll('button').forEach(item=>item.classList.toggle('is-selected',item===button))}));
    const topbar=document.createElement('header');topbar.className='customer-topbar admin-topbar';topbar.append(logo,nav,language);
    oldHeader?.remove();oldAside?.remove();shell?.classList.remove('pl-72');container.classList.add('customer-page','admin-page');const updatedShell=container.querySelector(':scope > div.pl-72');if(updatedShell){updatedShell.classList.remove('pl-72');updatedShell.classList.add('customer-workspace-inner');updatedShell.prepend(topbar)}else container.prepend(topbar);
    main?.classList.add('customer-content');main?.classList.remove('pt-16','pt-18','pt-20');container.querySelectorAll('#nemat-quick-hub,[data-path="role-switcher"]').forEach(el=>el.remove());
  }

  prepareRecipientWorkspace(container, routeKey) {
    const oldHeader=container.querySelector('header');const oldAside=container.querySelector('aside');const main=container.querySelector('main');const shell=container.querySelector(':scope > div.pl-72');
    const logo=document.createElement('a');logo.className='retro-brand';logo.href='#/welcome';logo.dataset.path='how-it-works';logo.innerHTML='<img class="retro-brand-mark" src="/images/nemat-logo.svg" alt="Nemat">Nemat<span>.</span>';
    const nav=document.createElement('nav');nav.className='customer-topnav recipient-topnav';nav.setAttribute('aria-label','Recipient navigation');
    const active=routeKey==='recipient/dashboard'?'recipient-dashboard':routeKey==='recipient/delivery'?'recipient-deliveries':'recipient-dashboard';
    [['recipient-dashboard','dashboard','Overview'],['recipient-deliveries','local_shipping','Deliveries'],['recipient-history','receipt_long','History'],['recipient-profile','corporate_fare','Kitchen profile']].forEach(([key,icon,label])=>{const link=document.createElement('a');link.href='#';link.dataset.path=key;link.classList.toggle('active',key===active);link.innerHTML=`<span class="material-symbols-outlined">${icon}</span>${label}`;nav.appendChild(link)});
    const language=document.createElement('div');language.className='customer-language';language.innerHTML='<button type="button" data-language-choice="en">English</button><button type="button" data-language-choice="ur">اردو</button>';language.querySelectorAll('[data-language-choice]').forEach(button=>button.addEventListener('click',()=>{const lang=button.dataset.languageChoice;window.NematState.setLanguage(lang);window.NematI18n.applyLanguage(lang);language.querySelectorAll('button').forEach(item=>item.classList.toggle('is-selected',item===button))}));
    const topbar=document.createElement('header');topbar.className='customer-topbar recipient-topbar';topbar.append(logo,nav,language);
    oldHeader?.remove();oldAside?.remove();container.classList.add('customer-page','recipient-page');
    if(shell){shell.classList.remove('pl-72');shell.classList.add('customer-workspace-inner');shell.prepend(topbar)}else container.prepend(topbar);
    main?.classList.add('customer-content');main?.classList.remove('pt-16','pt-18','pt-20');
    container.querySelectorAll('#nemat-quick-hub,[data-path="role-switcher"]').forEach(el=>el.remove());
  }

  async getCafeImage(name, fallbackUrl = '') {
    const key=String(name||'').trim();
    if(!key)return fallbackUrl;
    if(!this.cafeImageRequests)this.cafeImageRequests=new Map();
    if(this.cafeImageRequests.has(key))return this.cafeImageRequests.get(key);
    const request=(async()=>{
      try{
        const cached=JSON.parse(localStorage.getItem('nemat_cafe_images')||'{}');
        if(cached[key]?.url&&cached[key].expires>Date.now())return cached[key];
        const response=await fetch(`/api/serply/images?name=${encodeURIComponent(key)}`);
        if(!response.ok)throw new Error(`image search ${response.status}`);
        const data=await response.json();const image=data.images?.[0];
        if(image?.thumbnail){const result={url:image.thumbnail,source:image.source||'',domain:image.domain||'',title:image.title||key,expires:Date.now()+7*24*60*60*1000};cached[key]=result;try{localStorage.setItem('nemat_cafe_images',JSON.stringify(cached))}catch{}return result;}
      }catch(error){console.warn(`No Serply image found for ${key}`,error.message)}
      return {url:fallbackUrl,source:'',domain:'',title:key,expires:Date.now()+60*60*1000};
    })();
    this.cafeImageRequests.set(key,request);return request;
  }

  renderMapCafeList(container) {
    let cafes=[];
    try{cafes=JSON.parse(localStorage.getItem('nemat_map_cafes')||'[]')}catch{}
    let source='';try{source=localStorage.getItem('nemat_map_cafe_source')||''}catch{}
    if(!cafes.length||!['geoapify','local-demo'].includes(source))return null;
    const main=container.querySelector('main');
    const offersHeading=[...container.querySelectorAll('h2')].find(node=>node.textContent.trim()==='Available near you');
    const offersSection=offersHeading?.closest('section');
    if(!main||!offersSection||main.querySelector('.map-cafe-directory'))return null;
    const section=document.createElement('section');section.className='map-cafe-directory';
    const heading=document.createElement('div');heading.className='map-cafe-directory-heading';
    const titles=document.createElement('div');const eyebrow=document.createElement('span');eyebrow.textContent=source==='geoapify'?'FROM YOUR MAP':'DEMO PREVIEW · LIVE PLACES UNAVAILABLE';eyebrow.className='map-cafe-eyebrow';
    const title=document.createElement('h2');title.textContent='Cafes around you';titles.append(eyebrow,title);
    const total=document.createElement('span');total.className='map-cafe-total';total.textContent=source==='geoapify'?`${cafes.length} places`:`${cafes.length} demo places`;heading.append(titles,total);section.appendChild(heading);
    const grid=document.createElement('div');grid.className='map-cafe-directory-grid map-cafe-offer-grid';
    const demoDrops = window.NematState.get().drops;
    const items=[];
    cafes.forEach((cafe,cafeIndex)=>{
      const card=document.createElement('div');card.className='map-cafe-directory-card';
      const photo=document.createElement('div');photo.className='map-cafe-photo';
      const image=document.createElement('img');image.alt=`${cafe.name} cafe`;image.loading='lazy';if(cafe.thumbnail)image.src=cafe.thumbnail;
      const fallback=document.createElement('span');fallback.className='material-symbols-outlined map-cafe-photo-fallback';fallback.textContent='storefront';photo.append(image,fallback);
      image.addEventListener('error',()=>{image.hidden=true;fallback.hidden=false});if(!cafe.thumbnail)image.hidden=true;
      const detail=document.createElement('div');detail.className='map-cafe-directory-detail';
      const name=document.createElement('h3');name.textContent=cafe.name;
      const address=document.createElement('p');address.textContent=cafe.address||'Islamabad';
      const matchedOffer = cafe.drop || demoDrops.find(drop => drop.vendorName.toLowerCase() === cafe.name.toLowerCase());
      const offer = matchedOffer || demoDrops[cafeIndex % demoDrops.length];
      const photoBadge=document.createElement('span');photoBadge.className='map-cafe-offer-badge';photoBadge.textContent=`-${offer.discountPct}% OFF`;
      const stockBadge=document.createElement('span');stockBadge.className='map-cafe-stock-badge';stockBadge.textContent=`${offer.bagsLeft} bags left`;
      const saveButton=document.createElement('button');saveButton.type='button';saveButton.className='map-cafe-save';saveButton.setAttribute('aria-label','Save to favorites');saveButton.innerHTML='<span class="material-symbols-outlined">favorite</span>';
      photo.append(photoBadge,stockBadge,saveButton);
      const offerTitle=document.createElement('strong');offerTitle.className='map-cafe-offer-title';offerTitle.textContent=offer.title;
      const offerDescription=document.createElement('p');offerDescription.className='map-cafe-offer-description';offerDescription.textContent=offer.description;
      const demoNote=document.createElement('span');demoNote.className='map-cafe-demo-note';demoNote.textContent=matchedOffer?'Surplus offer':'Sample bag preview';
      const pickup=document.createElement('div');pickup.className='map-cafe-pickup';pickup.innerHTML=`<span class="material-symbols-outlined">schedule</span><b>Today ${this.formatOfferTime(offer)}</b><span>${cafe.distanceMeters?`${(cafe.distanceMeters/1000).toFixed(1)} km`:offer.sector}</span>`;
      const dietary=document.createElement('div');dietary.className='map-cafe-dietary';(offer.tags||[]).filter(tag=>!tag.toLowerCase().startsWith('contains')).slice(0,2).forEach(tag=>{const chip=document.createElement('span');chip.textContent=tag;dietary.appendChild(chip)});
      const photoCredit=document.createElement('a');photoCredit.className='map-cafe-photo-credit';photoCredit.hidden=true;photoCredit.target='_blank';photoCredit.rel='noopener noreferrer';photoCredit.textContent='Photo source';
      const meta=document.createElement('div');meta.className='map-cafe-directory-meta';
      if(Number(cafe.rating)>0){const rating=document.createElement('span');rating.className='map-cafe-rating';rating.textContent=`★ ${Number(cafe.rating).toFixed(1)}`;meta.appendChild(rating)}
      const distance=document.createElement('span');distance.textContent=cafe.distanceMeters?`${(cafe.distanceMeters/1000).toFixed(1)} km away`:'Nearby';meta.appendChild(distance);
      const actions=document.createElement('div');actions.className='map-cafe-directory-actions';
      if(cafe.drop){const bags=document.createElement('button');bags.type='button';bags.className='map-cafe-bags-button';bags.textContent=`${cafe.drop.bagsLeft} bags → View`;bags.addEventListener('click',()=>{this.selectedBagId=cafe.drop.id;this.navigate('customer/bag')});actions.appendChild(bags)}
      const mapButton=document.createElement('button');mapButton.type='button';mapButton.className='map-cafe-map-button';mapButton.textContent='Show on map';mapButton.addEventListener('click',()=>{try{localStorage.setItem('nemat_selected_map_cafe',String(cafe.id||cafe.name))}catch{}this.navigate('customer/map')});actions.appendChild(mapButton);
      const pricing=document.createElement('div');pricing.className='map-cafe-pricing';pricing.innerHTML=`<strong>PKR ${offer.pricePkr}</strong><del>PKR ${offer.retailPkr}</del><b>Save PKR ${offer.retailPkr-offer.pricePkr}</b>`;
      const viewOffer=document.createElement('button');viewOffer.type='button';viewOffer.className='map-cafe-view-offer';viewOffer.textContent='View bag';viewOffer.addEventListener('click',()=>{this.selectedBagId=offer.id;this.navigate('customer/bag')});
      if (!matchedOffer) viewOffer.textContent='View sample bag';
      detail.append(name,address,photoCredit,meta,demoNote,offerTitle,offerDescription,pickup,dietary,pricing,viewOffer,actions);card.append(photo,detail);grid.appendChild(card);
      items.push({el:card,offer:window.NematExploreFilters.offerFromCafe(cafe,offer)});
      this.bindFavoriteButton(saveButton,matchedOffer?.id || `cafe-${cafe.id || cafe.name}`);
      const loadPhoto=async()=>{const result=await this.getCafeImage(cafe.name,cafe.thumbnail||'');if(result.url){image.src=result.url;image.hidden=false;fallback.hidden=true;if(result.source){photoCredit.href=result.source;photoCredit.textContent=result.domain?`Photo: ${result.domain}`:'Photo source';photoCredit.hidden=false}image.addEventListener('error',()=>{image.hidden=true;fallback.hidden=false},{once:true})}};
      if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){observer.disconnect();loadPhoto()}},{rootMargin:'180px'});observer.observe(card)}else loadPhoto();
    });
    section.appendChild(grid);offersSection.before(section);
    return {grid,items};
  }

  async hydrateCustomerMap(container) {
    const nav = this.customerNavigation('map');
    container.querySelector('.customer-topnav')?.replaceWith(nav);
    const main = container.querySelector('main');
    if (!main) return;
    const saved = (() => { try { return JSON.parse(localStorage.getItem('nemat_customer_location') || '{}'); } catch { return {}; } })();
    const fallback = {
      latitude: Number(saved.latitude) || 33.7215,
      longitude: Number(saved.longitude) || 73.0435,
      sector: saved.sector || window.NematState.get().currentUser?.sector || 'F-7'
    };
    main.innerHTML = `<section class="live-map-page">
      <div class="live-map-toolbar">
        <div class="live-map-place"><span class="material-symbols-outlined">location_on</span><div><strong>Islamabad</strong><small class="map-live-status" aria-live="polite">Finding your location...</small></div></div>
        <div class="live-map-actions"><button type="button" class="location-action" data-locate><span class="material-symbols-outlined">my_location</span>Locate me</button><button type="button" class="list-action" data-view-list disabled>Finding cafes... <span class="material-symbols-outlined">arrow_forward</span></button></div>
      </div>
      <div class="live-map-frame"><div id="nemat-live-map" role="application" aria-label="Map of nearby cafes in Islamabad"></div>
        <div class="map-loading"><span class="map-loading-pulse"></span><span>Finding cafes near you...</span></div>
        <div class="map-legend"><span><i class="legend-you"></i>You</span><span><i class="legend-cafe"></i>Cafes</span></div>
        <div class="map-results-chip"><span class="live-dot"></span><span class="map-nearby-status">Searching nearby</span><b class="map-cafe-count"></b><small class="map-cafe-source"></small></div>
      </div>
    </section>`;
    const status = text => { const node=main.querySelector('.map-live-status'); if(node)node.textContent=text; };
    main.querySelector('[data-view-list]')?.addEventListener('click',()=>this.navigate('customer/explore'));
    let position=fallback;
    const launchMap=async()=>{
      const config=await fetch('/api/map-config').then(r=>r.json()).catch(()=>({}));
      if(!window.maplibregl){status('Map could not load. Try View list.');return;}
      const map=new maplibregl.Map({container:'nemat-live-map',center:[position.longitude,position.latitude],zoom:14,attributionControl:false,style:config.geoapifyKey?`https://maps.geoapify.com/v1/styles/osm-bright/style.json?apiKey=${encodeURIComponent(config.geoapifyKey)}`:{version:8,sources:{osm:{type:'raster',tiles:['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],tileSize:256,attribution:'OpenStreetMap contributors'}},layers:[{id:'base',type:'raster',source:'osm'}]}});
      // Register before awaiting Places; the style can load while that request is in flight.
      map.once('load',()=>main.querySelector('.map-loading')?.classList.add('is-hidden'));
      map.addControl(new maplibregl.NavigationControl({showCompass:false}),'bottom-right');
      map.addControl(new maplibregl.AttributionControl({compact:true}),'bottom-left');
      const userEl=document.createElement('div');userEl.className='map-you-marker';userEl.innerHTML='<span></span><b>You</b>';
      new maplibregl.Marker({element:userEl,anchor:'center'}).setLngLat([position.longitude,position.latitude]).addTo(map);
      let cafes=[];
      let cafeSource='geoapify';
      let placeLookupMessage='';
      if(config.geoapifyKey){
        try{
          const params=new URLSearchParams({categories:'catering.cafe',filter:`circle:${position.longitude},${position.latitude},5000`,limit:'50',apiKey:config.geoapifyKey});
          const response=await fetch(`https://api.geoapify.com/v2/places?${params}`);
          if(response.ok){
            const data=await response.json();
            cafes=(data.features||[]).filter(feature=>feature.geometry?.coordinates?.length===2).map(feature=>{
              const properties=feature.properties||{};const coords=feature.geometry.coordinates;
              return {id:properties.place_id||properties.datasource?.raw?.osm_id||`${properties.name}-${coords[1]}`,name:properties.name||properties.address_line1||'Cafe',longitude:coords[0],latitude:coords[1],address:properties.address_line2||properties.formatted||'',rating:properties.datasource?.raw?.stars||null,distanceMeters:properties.distance?.straight_line||null,thumbnail:properties.datasource?.raw?.image||'',mapUrl:''};
            });
          }else {placeLookupMessage=`Geoapify request failed (HTTP ${response.status})`;console.warn(placeLookupMessage);}
        }catch(error){placeLookupMessage='Geoapify could not be reached';console.warn('Geoapify cafe search unavailable.',error);}
      }else{
        placeLookupMessage='Geoapify API key is missing';
      }
      if(!cafes.length&&!placeLookupMessage)placeLookupMessage='Geoapify returned no cafes in this area';
      if(!cafes.length){
        cafeSource='local-demo';
        cafes=window.NematState.get().vendors.slice(0,6).map((vendor,index)=>({id:vendor.id,name:vendor.name,longitude:position.longitude+[-.008,.006,.011,-.004,.003,-.012][index],latitude:position.latitude+[.004,.009,-.003,-.011,-.007,.012][index],address:vendor.address,rating:vendor.rating,thumbnail:vendor.photo,mapUrl:'',fallback:true}));
      }
      const normalizeName=value=>String(value||'').toLowerCase().replace(/[^a-z0-9]/g,'');
      const state=window.NematState.get();
      cafes=cafes.slice(0,24).map(cafe=>{
        const vendor=state.vendors.find(item=>normalizeName(item.name)===normalizeName(cafe.name)||normalizeName(cafe.name).includes(normalizeName(item.name)));
        const drop=vendor&&state.drops.find(item=>item.vendorId===vendor.id&&item.status==='live'&&item.bagsLeft>0);
        return {...cafe,drop:drop?{id:drop.id,bagsLeft:drop.bagsLeft,title:drop.title,pricePkr:drop.pricePkr}:null};
      });
      try{localStorage.setItem('nemat_map_cafes',JSON.stringify(cafes));localStorage.setItem('nemat_map_cafe_source',cafeSource);}catch{}
      const bounds=new maplibregl.LngLatBounds([position.longitude,position.latitude],[position.longitude,position.latitude]);
      cafes.forEach(cafe=>bounds.extend([cafe.longitude,cafe.latitude]));
      const selectedCafe=(()=>{try{return localStorage.getItem('nemat_selected_map_cafe')||''}catch{return ''}})();
      const listButton=main.querySelector('[data-view-list]');
      if(listButton){listButton.disabled=false;listButton.innerHTML=`View list <span class="map-list-count">${cafes.length}</span><span class="material-symbols-outlined">arrow_forward</span>`;}
      const count=main.querySelector('.map-cafe-count');
      if(count)count.textContent=`${cafes.length} nearby`;
      const cafeStatus=main.querySelector('.map-nearby-status');
      const sourceLabel=main.querySelector('.map-cafe-source');
      if(sourceLabel){sourceLabel.textContent=cafeSource==='geoapify'?'GEOAPIFY LIVE':'DEMO';sourceLabel.classList.toggle('is-demo',cafeSource!=='geoapify');}
      if(cafeStatus)cafeStatus.textContent=cafeSource==='geoapify'?'Nearby cafes':placeLookupMessage;
      const loadingOverlay=main.querySelector('.map-loading');
      if(loadingOverlay){
        const loadingText=loadingOverlay.querySelector('span:last-child');
        if(loadingText)loadingText.textContent=cafeSource==='geoapify'?`Found ${cafes.length} nearby cafes`:`Using demo cafes · ${placeLookupMessage}`;
        loadingOverlay.classList.add('is-hidden');
      }
      cafes.forEach((cafe,index)=>setTimeout(()=>{
        const progress=index+1;const line=main.querySelector('.map-nearby-status');if(line)line.textContent=cafeSource==='geoapify'?`Found ${cafes.length} nearby cafes`:placeLookupMessage;const badge=main.querySelector('.map-cafe-count');if(badge)badge.textContent=cafeSource==='geoapify'?`${cafes.length} nearby`:`${cafes.length} demo`;
        const pin=document.createElement('button');pin.type='button';pin.className='map-cafe-marker';pin.setAttribute('aria-label',`View ${cafe.name}`);pin.innerHTML='<span class="material-symbols-outlined">storefront</span>';
        const popupContent=document.createElement('div');popupContent.className='cafe-map-popup';
        const name=document.createElement('strong');name.textContent=cafe.name;popupContent.appendChild(name);
        const address=document.createElement('small');address.textContent=cafe.address||'Nearby cafe';popupContent.appendChild(address);
        const food=document.createElement('span');food.className='cafe-map-popup-food';food.textContent=cafe.drop?`${cafe.drop.bagsLeft} surprise bags available`:'Cafe nearby';popupContent.appendChild(food);
        if(cafe.drop){const view=document.createElement('button');view.type='button';view.className='cafe-map-popup-action';view.textContent='View food';view.addEventListener('click',()=>{this.selectedBagId=cafe.drop.id;this.navigate('customer/bag')});popupContent.appendChild(view);}
        const popup=new maplibregl.Popup({offset:22,closeButton:false,maxWidth:'250px'}).setDOMContent(popupContent);
        new maplibregl.Marker({element:pin,anchor:'bottom'}).setLngLat([cafe.longitude,cafe.latitude]).setPopup(popup).addTo(map);
        setTimeout(()=>pin.classList.add('is-visible'),40);
        if(selectedCafe&&(selectedCafe===String(cafe.id)||selectedCafe===cafe.name)){popup.addTo(map);try{localStorage.removeItem('nemat_selected_map_cafe')}catch{}}
      },index*170));
      map.fitBounds(bounds,{padding:{top:100,bottom:100,left:90,right:90},maxZoom:15,duration:750});
      map.on('error',event=>{if(!map.isStyleLoaded?.())main.querySelector('.map-loading')?.classList.add('is-hidden');console.warn('Map tile/style error',event.error?.message||'');});
      status(`Near ${position.sector}, Islamabad`);
      main.querySelector('[data-locate]')?.addEventListener('click',()=>{
        if(!navigator.geolocation){status('Location is unavailable in this browser.');return;}
        status('Getting your location...');
        navigator.geolocation.getCurrentPosition(pos=>{
          position={latitude:pos.coords.latitude,longitude:pos.coords.longitude,sector:'Nearby'};
          try{localStorage.setItem('nemat_customer_location',JSON.stringify(position));}catch{}
          status('Location updated. Refreshing nearby cafes...');this.hydrateCustomerMap(container);
        },()=>status(`Showing Islamabad near ${fallback.sector}`),{enableHighAccuracy:true,timeout:9000});
      });
    };
    if(navigator.geolocation&&!saved.latitude)navigator.geolocation.getCurrentPosition(pos=>{position={latitude:pos.coords.latitude,longitude:pos.coords.longitude,sector:'Nearby'};try{localStorage.setItem('nemat_customer_location',JSON.stringify(position));}catch{}launchMap();},launchMap,{enableHighAccuracy:true,timeout:9000});else launchMap();
  }

  hydrateSurpriseBagDetails(container) {
    // The template is static Loaf & Crumb markup — patch in the actually
    // selected drop's data so different bags don't all look identical.
    const drops = window.NematState.get().drops;
    const drop = drops.find(d => d.id === this.selectedBagId) || drops[0];
    // If the incoming selection is stale (for example, API-backed UUIDs
    // replaced the seeded drop-1 IDs), keep the displayed fallback and the
    // reservation target in sync.
    if (drop) this.selectedBagId = drop.id;

    if (drop) {
      const categoryLabel = drop.category.charAt(0).toUpperCase() + drop.category.slice(1);

      const crumbNav = container.querySelector('nav.text-body-sm');
      if (crumbNav) {
        const links = crumbNav.querySelectorAll('a');
        if (links[1]) links[1].textContent = drop.sector;
        if (links[2]) links[2].textContent = drop.vendorName;
        const bagCrumb = crumbNav.querySelector('span.truncate');
        if (bagCrumb) bagCrumb.textContent = drop.title;
      }

      const heroImg = container.querySelector('#main-gallery-image');
      if (heroImg) heroImg.src = drop.image;

      container.querySelectorAll('span').forEach(span => {
        const text = span.textContent.trim();
        if (text.endsWith('OFF')) {
          span.textContent = `${drop.discountPct}% OFF`;
        } else if (text.includes('bags remaining') || text.includes('bag remaining')) {
          span.textContent = `${drop.bagsLeft} bag${drop.bagsLeft === 1 ? '' : 's'} remaining`;
        }
      });

      const vendorHeading = container.querySelector('h2.font-headline-sm');
      if (vendorHeading) {
        vendorHeading.textContent = drop.vendorName;
        const addressP = vendorHeading.closest('div').parentElement.querySelector('p.font-body-sm');
        if (addressP) addressP.textContent = drop.address;
      }

      const h1 = container.querySelector('h1.font-headline-lg');
      if (h1) {
        const categoryBadge = h1.previousElementSibling?.querySelector('span');
        if (categoryBadge) categoryBadge.textContent = `${categoryLabel} • ${drop.sector}`;
        h1.textContent = drop.title;
        if (h1.nextElementSibling) h1.nextElementSibling.textContent = drop.description;
      }

      const priceEl = container.querySelector('.font-display-xl.text-\\[36px\\]');
      if (priceEl) priceEl.textContent = `PKR ${drop.pricePkr}`;
      const retailEl = container.querySelector('.text-outline.line-through');
      if (retailEl) retailEl.textContent = `PKR ${drop.retailPkr}`;
      const saveEl = container.querySelector('.bg-secondary-fixed.text-on-secondary-fixed.shadow-sm');
      if (saveEl) saveEl.textContent = `Save ${drop.discountPct}% (PKR ${drop.retailPkr - drop.pricePkr})`;

      const windowEl = container.querySelector('.font-body-md.text-body-md.font-semibold.text-primary');
      if (windowEl) windowEl.textContent = `Today • ${drop.window}`;

      const storefrontCaption = container.querySelector('.font-label-sm.text-label-sm.text-on-surface.font-bold.truncate');
      if (storefrontCaption) storefrontCaption.textContent = `${drop.vendorName} • ${drop.sector}`;
      const pickupGuide = [...container.querySelectorAll('h2')].find(el => /Picking up at/i.test(el.textContent));
      if (pickupGuide) pickupGuide.textContent = `Collect at ${drop.sector} • ${drop.vendorName}`;
      const map = container.querySelector('[data-location]');
      const destination = `${drop.vendorName}, ${drop.address}, Islamabad`;
      const mapUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
      if (map) map.dataset.location = destination;
      const mapLink = [...container.querySelectorAll('a')].find(el => el.textContent.trim() === 'Open Map');
      if (mapLink) { mapLink.href = mapUrl; mapLink.target = '_blank'; mapLink.rel = 'noopener noreferrer'; }
      const mapLabel = map?.querySelector('.font-label-sm.text-label-sm.text-on-surface.font-bold.truncate');
      if (mapLabel) mapLabel.textContent = `${drop.vendorName} • ${drop.sector}`;

      // "What's inside?" has no real per-item data model — approximate it
      // by splitting the drop's own description into items, rather than
      // leaving Loaf & Crumb's croissants/pain au chocolat on every bag.
      const whatsInsideHeading = [...container.querySelectorAll('h3')].find(h => h.textContent.includes("What's inside"));
      const grid = whatsInsideHeading?.nextElementSibling;
      if (grid && drop.description) {
        const items = drop.description.replace(/\.$/, '').split(/,| and /i).map(s => s.trim()).filter(Boolean);
        [...grid.children].forEach((slot, i) => {
          const span = slot.querySelector('span:last-child');
          if (items[i] && span) {
            span.textContent = items[i].charAt(0).toUpperCase() + items[i].slice(1);
            slot.style.display = '';
          } else {
            slot.style.display = 'none';
          }
        });
      }

      // Dietary/allergen chips + text, rebuilt from the drop's real tags
      // instead of always showing "Vegetarian Friendly / 100% Halal".
      const dietaryHeading = [...container.querySelectorAll('h3')].find(h => h.textContent.includes('Dietary'));
      const chipRow = dietaryHeading?.nextElementSibling;
      const allergenPara = chipRow?.nextElementSibling;
      if (chipRow && drop.tags) {
        const ICONS = { Halal: 'check_circle', Vegetarian: 'eco' };
        chipRow.innerHTML = drop.tags
          .filter(t => !t.toLowerCase().startsWith('contains'))
          .map(t => `<span class="px-2.5 py-1 rounded-md bg-surface-container text-primary font-label-sm text-label-sm font-semibold flex items-center gap-1"><span class="material-symbols-outlined text-[15px]">${ICONS[t] || 'verified'}</span>${t}</span>`)
          .join('');
      }
      if (allergenPara && drop.tags) {
        const allergenTags = drop.tags.filter(t => t.toLowerCase().startsWith('contains'));
        allergenPara.innerHTML = `<strong>Allergens:</strong> ${allergenTags.length ? allergenTags.join(', ') : 'None declared'}.`;
      }
    }

    container.querySelectorAll('button').forEach(btn => {
      if (btn.textContent.includes('Reserve Bag') || btn.textContent.includes('Confirm Reservation')) {
        const span = btn.querySelector('span');
        if (span && drop) span.textContent = `Reserve Bag • PKR ${drop.pricePkr}`;
        btn.addEventListener('click', async (e) => {
          e.preventDefault();
          if (btn.disabled) return;
          const reserveDropId = drop?.id || this.selectedBagId;
          if (!reserveDropId) {
            this.showToast('Cannot Reserve', 'No food bag is selected. Return to Explore and choose an available bag.', 'warning');
            return;
          }
          btn.disabled = true;
          const res = await window.NematState.reserveBag(reserveDropId);
          if (res.success) {
            this.selectedReservationId = res.reservation.id;
            this.latestReservation = res.reservation;
            this.showToast(res.persisted===false?'Reserved on this device':'Reservation Successful!', `Pickup Pass #${res.reservation.code} generated.`, 'check_circle');
            this.navigate('customer/confirmed');
          } else {
            btn.disabled = false;
            this.showToast('Cannot Reserve', res.message, 'warning');
          }
        });
      }
    });
  }

  hydrateReservationConfirmation(container) {
    const state = window.NematState.get();
    const reservation = state.reservations.find(r => r.id === this.selectedReservationId) || this.latestReservation || state.reservations.find(r => r.status === 'RESERVED') || state.reservations[0];
    if (reservation) {
      const drop = state.drops.find(d => d.id === reservation.dropId);
      const vendorHeading = [...container.querySelectorAll('h1')].find(el => el.textContent.includes('Loaf & Crumb'));
      if (vendorHeading) vendorHeading.textContent = reservation.vendorName;
      const bagTitle = container.querySelector('h4');
      if (bagTitle && drop) bagTitle.textContent = drop.title;
      const summaryName = [...container.querySelectorAll('span')].find(el => el.textContent.trim() === 'Loaf & Crumb');
      if (summaryName) summaryName.textContent = reservation.vendorName;
      const time = [...container.querySelectorAll('span')].find(el => /Today.*8:30/.test(el.textContent));
      if (time) time.textContent = `Today · ${reservation.window}`;
      const summaryAddress = [...container.querySelectorAll('span')].find(el => el.textContent.includes('Shop 14, Jinnah Super'));
      if (summaryAddress) summaryAddress.textContent = reservation.vendorAddress || '';
      const images = container.querySelectorAll('img');
      const offerImage = drop?.image;
      if (images.length > 1 && offerImage) images[1].src = offerImage;
      const price = [...container.querySelectorAll('span')].find(el => el.classList.contains('font-headline-lg') && el.textContent.trim() === '350');
      if (price && drop) price.textContent = String(drop.pricePkr);
      const values = [...container.querySelectorAll('.font-metric-price')];
      const retail = values.find(el => el.textContent.includes('PKR 850'));
      if (retail && drop) retail.textContent = `PKR ${drop.retailPkr}`;
      const discount = [...container.querySelectorAll('span')].find(el => /Surplus rescue discount/.test(el.textContent));
      if (discount && drop) discount.childNodes[0].textContent = `Surplus rescue discount (${drop.discountPct}%) `;
      const discountValue = [...container.querySelectorAll('.font-metric-price')].find(el => /-PKR 500/.test(el.textContent));
      if (discountValue && drop) discountValue.textContent = `-PKR ${drop.retailPkr - drop.pricePkr}`;
      const intro = [...container.querySelectorAll('p')].find(el => el.textContent.includes('Collect at'));
      if (intro) intro.innerHTML = `Collect at <strong class="text-on-surface font-semibold">${reservation.vendorName}</strong> during the pickup window.`;
      const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${reservation.vendorName}, ${reservation.vendorAddress}, Islamabad`)}`;
      container.querySelectorAll('a').forEach(link => {
        if (/Direction|Open Map/.test(link.textContent)) { link.href = directionsUrl; link.target = '_blank'; link.rel = 'noopener noreferrer'; }
      });
    }
    // Wire "View Pickup Pass" button
    container.querySelectorAll('a, button').forEach(el => {
      if (el.textContent.includes('Pass') || el.textContent.includes('Pickup Pass') || el.textContent.includes('View Pass')) {
        el.addEventListener('click', (e) => {
          e.preventDefault();
          this.navigate('customer/pass');
        });
      }
    });
  }

  hydratePickupPass(container) {
    const state = window.NematState.get();
    const activeRes = state.reservations.find(r => r.id === this.selectedReservationId) || this.latestReservation || state.reservations.find(r => r.status === 'RESERVED') || state.reservations[0];
    if (activeRes) {
      // Template markup hardcodes the seed reservation's code (4827) in several
      // places (breadcrumb, QR caption, helper text) — swap them all for real ones.
      const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) {
        if (node.nodeValue.includes('4827')) {
          node.nodeValue = node.nodeValue.split('4827').join(activeRes.code);
        }
      }
      const passLayout=container.querySelector('#pickupCode')?.closest('.py-space-md');
      const passInstruction=passLayout?.querySelector('.flex.flex-col.items-center.justify-center.p-space-sm');
      if(passInstruction)passInstruction.innerHTML='<span class="material-symbols-outlined text-primary text-[34px]">verified_user</span><strong class="font-label-md text-label-md text-primary">Counter verification</strong><span class="font-body-sm text-body-sm text-on-surface-variant text-center">Show this code to the vendor. They will enter it to confirm pickup.</span>';
      const instruction=[...container.querySelectorAll('span')].find(el=>el.textContent.includes('Show code')&&el.querySelector('strong'));
      if(instruction)instruction.innerHTML=`Show code <strong class="text-primary font-bold">${activeRes.code}</strong> to the vendor at the counter.`;
      const copyButton=container.querySelector('#copyBtn');
      if(copyButton){
        copyButton.removeAttribute('onclick');
        copyButton.addEventListener('click',async()=>{
          try{
            await navigator.clipboard.writeText(String(activeRes.code));
            copyButton.innerText='Copied!';
            setTimeout(()=>{copyButton.innerHTML='<span class="material-symbols-outlined text-[14px]">content_copy</span><span>Copy</span>'},1600);
          }catch{this.showToast('Copy unavailable','Select the pickup code and copy it manually.','info')}
        });
      }
      const drop = state.drops.find(d => d.id === activeRes.dropId);
      const name = activeRes.vendorName || drop?.vendorName || 'Cafe';
      const address = activeRes.vendorAddress || drop?.address || '';
      const destination = `${name}, ${address}, Islamabad`;
      const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
      const intro = [...container.querySelectorAll('p')].find(el => el.textContent.includes('Collect at'));
      if (intro) intro.innerHTML = `Collect at <strong class="text-on-surface font-semibold">${name}</strong> during the pickup window.`;
      const storeName = [...container.querySelectorAll('span')].find(el => el.textContent.trim() === 'Loaf & Crumb');
      if (storeName) storeName.textContent = name;
      const storeAddress = [...container.querySelectorAll('span')].find(el => el.textContent.includes('Shop 14, Block B'));
      if (storeAddress) storeAddress.textContent = address;
      const windowLabel = [...container.querySelectorAll('span')].find(el => /8:30 PM.*9:30 PM/.test(el.textContent));
      if (windowLabel) windowLabel.textContent = activeRes.window || drop?.window || '';
      const directions = [...container.querySelectorAll('a')].find(el => el.textContent.includes('Get Directions'));
      if (directions) { directions.href = directionsUrl; directions.target = '_blank'; directions.rel = 'noopener noreferrer'; }
      const location = container.querySelector('[data-location]');
      if (location) location.dataset.location = destination;
      const mapLink = [...container.querySelectorAll('a')].find(el => el.textContent.trim() === 'Open Map');
      if (mapLink) { mapLink.href = directionsUrl; mapLink.target = '_blank'; mapLink.rel = 'noopener noreferrer'; }
    }
  }

  hydrateMyReservations(container) {
    // Wire "View Pass" buttons on reservation cards
    container.querySelectorAll('a, button').forEach(btn => {
      if (btn.textContent.includes('Pickup Pass') || btn.textContent.includes('View Pass')) {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          this.navigate('customer/pass');
        });
      }
      if (btn.textContent.includes('Rate') || btn.textContent.includes('Safety') || btn.textContent.includes('Report')) {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          this.openFoodSafetyModal('Loaf & Crumb');
        });
      }
    });
  }

  renderVendorImpactStory(container,state) {
    const main=container.querySelector('main');
    if(!main||main.querySelector('.vendor-impact-story'))return;
    const vendor=state.vendors?.find(item=>item.id==='v-1');
    const vendorName=vendor?.name||'Loaf & Crumb';
    const drops=(state.drops||[]).filter(drop=>drop.vendorId==='v-1'||drop.vendorName===vendorName);
    const reservations=state.reservations||[];
    const posted=drops.reduce((sum,drop)=>sum+(Number(drop.bagCount)||0),0);
    const reserved=reservations.filter(item=>item.status==='RESERVED'&&drops.some(drop=>drop.id===item.dropId)).length;
    const collectedCount=reservations.filter(item=>item.status==='COLLECTED'&&drops.some(drop=>drop.id===item.dropId)).length;
    const remaining=Math.max(0,posted-reserved-collectedCount);
    const rescued=Number((collectedCount*1.8).toFixed(1));
    const percent=posted?Math.min(100,Math.round(reserved/posted*100)):0;
    const story=document.createElement('section');story.className='vendor-impact-story';
    story.innerHTML=`<div class="vendor-impact-heading"><span class="vendor-impact-orbit"><span class="material-symbols-outlined">volunteer_activism</span></span><div><span class="vendor-impact-eyebrow">TONIGHT'S RESCUE IN MOTION</span><h2>Your surplus is moving through the community</h2></div><span class="vendor-impact-live"><i></i> Live drop</span></div><div class="vendor-impact-track" style="--vendor-progress:${percent}%"><article><span class="vendor-impact-icon"><span class="material-symbols-outlined">inventory_2</span></span><div><small>Shared</small><strong>${posted}</strong><em>bags posted</em></div><b class="vendor-track-link"></b></article><article><span class="vendor-impact-icon"><span class="material-symbols-outlined">shopping_bag</span></span><div><small>Claimed</small><strong>${reserved}</strong><em>bags reserved</em></div><b class="vendor-track-link"></b></article><article><span class="vendor-impact-icon vendor-impact-icon--amber"><span class="material-symbols-outlined">schedule</span></span><div><small>Ready for rescue</small><strong>${remaining}</strong><em>bags remaining</em></div><b class="vendor-track-link"></b></article><article><span class="vendor-impact-icon vendor-impact-icon--leaf"><span class="material-symbols-outlined">eco</span></span><div><small>Impact</small><strong>${rescued}<i>kg</i></strong><em>food rescued</em></div></article></div><div class="vendor-impact-foot"><span><i class="material-symbols-outlined">tips_and_updates</i>Every reservation keeps good food in the community.</span><b>${percent}% of tonight's bags claimed</b></div>`;
    const metricLabels=['Bags Posted','Bags Reserved','Bags Remaining','Food Rescued'];
    const metrics=[...main.querySelectorAll('main > div > div')].find(el=>metricLabels.every(label=>el.textContent.includes(label)));
    if(metrics){metrics.replaceWith(story)}else{
      const operational=[...main.querySelectorAll('main > div > div')].find(el=>el.textContent.includes('Active Evening Drop'));
      if(operational)operational.before(story);else main.prepend(story);
    }
  }

  hydrateVendorDashboard(container) {
    const state = window.NematState.get();

    const main = container.querySelector('main');
    if (main && !main.querySelector('.vendor-mascot-art')) {
      const hero = main.querySelector(':scope > div > div:first-child');
      if (hero) {
        hero.classList.add('vendor-dashboard-hero');
        const content = hero.querySelector(':scope > div:first-child');
        const actions = hero.querySelector(':scope > div:nth-child(2)');
        if (content && actions) { actions.classList.add('vendor-dashboard-actions'); content.appendChild(actions); }
        const mascot=document.createElement('img');mascot.className='vendor-mascot-art';mascot.src='/images/eat-transparent.png';mascot.alt='Nemat food rescue characters';hero.appendChild(mascot);
        hero.querySelectorAll('button').forEach(button=>button.classList.add('vendor-hero-action'));
      }
    }
    this.renderVendorImpactStory(container,state);
    const contentColumn=main?.querySelector(':scope > div');
    const hero=main?.querySelector('.vendor-dashboard-hero');
    const impact=main?.querySelector('.vendor-impact-story');
    if(contentColumn&&hero&&impact){contentColumn.insertBefore(hero,contentColumn.firstElementChild);hero.after(impact)}

    // Add working "Verify Counter Code" button in header or action area
    const actionHeader = container.querySelector('main .vendor-dashboard-hero .flex.flex-wrap.items-center.gap-space-sm') || container.querySelector('main');
    if (actionHeader && !container.querySelector('#vendor-verify-code-btn')) {
      const verifyBtn = document.createElement('button');
      verifyBtn.id = 'vendor-verify-code-btn';
      verifyBtn.className = 'px-3 py-1.5 rounded-lg bg-primary-container text-on-primary font-bold text-xs flex items-center gap-1.5 shadow-sm hover:bg-primary transition-all';
      verifyBtn.innerHTML = `<span class="material-symbols-outlined text-[16px]">qr_code_scanner</span> Verify Customer Code`;
      verifyBtn.addEventListener('click', () => this.openCounterVerificationModal());
      actionHeader.append(verifyBtn);
    }

    // Add working "Close Window -> Send Unsold to Rescue" button
    if (!container.querySelector('#vendor-close-window-btn')) {
      const closeBtn = document.createElement('button');
      closeBtn.id = 'vendor-close-window-btn';
      closeBtn.className = 'px-3 py-1.5 rounded-lg bg-secondary text-on-secondary font-bold text-xs flex items-center gap-1.5 shadow-sm hover:bg-secondary-container transition-all';
      closeBtn.innerHTML = `<span class="material-symbols-outlined text-[16px]">emergency_share</span> Send Unsold to Rescue`;
      closeBtn.addEventListener('click', async () => {
        const job = await window.NematState.closeWindowAndSendToRescue('v-1');
        this.showToast('Window Closed & Converted!', `${job.bagsCount} surplus bags sent to Volunteer Rescue network.`, 'local_shipping');
        setTimeout(() => this.navigate('volunteer/jobs'), 800);
      });
      actionHeader.append(closeBtn);
    }
  }

  hydrateCreateNewDrop(container) {
    let bagType = 'bakery';
    container.querySelectorAll('.bag-type-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.bag-type-btn').forEach(b => {
          b.classList.remove('bg-primary-container', 'text-on-primary');
          b.classList.add('bg-surface-container-low', 'text-on-surface');
        });
        btn.classList.add('bg-primary-container', 'text-on-primary');
        btn.classList.remove('bg-surface-container-low', 'text-on-surface');
        bagType = btn.textContent.trim().toLowerCase();
      });
    });

    // Wire Publish Drop button
    container.querySelectorAll('button').forEach(btn => {
      if (btn.textContent.includes('Publish Drop')) {
        btn.addEventListener('click', async (e) => {
          e.preventDefault();
          const bagsInput = container.querySelector('input[type="number"], input[value="10"], #bag-count');
          const count = bagsInput ? bagsInput.value : 10;

          const created = await window.NematState.createDrop({
            title: bagType === 'bakery' ? 'Artisanal Bakery Surplus Bag' : 'Chef Surprise Evening Bag',
            category: bagType,
            pricePkr: 450,
            retailPkr: 1200,
            bagCount: count,
            windowStart: '20:30',
            windowEnd: '21:30'
          });

          this.showToast('Drop Published!', `${created.bagCount} bags are now live on Customer Explore & Map.`, 'rocket_launch');
          this.navigate('vendor/dashboard');
        });
      }
    });
  }

  hydrateRescueJobs(container) {
    const main=container.querySelector('main');
    const hero=main?.querySelector(':scope > div > div:first-child');
    if(hero&&!hero.querySelector('.volunteer-ride-art')){
      hero.classList.add('volunteer-jobs-hero');
      const stats=hero.querySelector(':scope > div:nth-child(2)');
      stats?.classList.add('volunteer-hero-stats');
      const art=document.createElement('img');art.className='volunteer-ride-art';art.src='/images/ride.png';art.alt='Nemat volunteer courier riding to rescue surplus food';
      hero.appendChild(art);
    }
    // Same vendor-name-matching approach as hydrateCustomerExplore — the
    // static cards have no per-card id, so match by the vendor name text
    // already on the card instead of assuming DOM order === array order.
    const jobs = window.NematState.get().rescueJobs;

    container.querySelectorAll('.group.cursor-pointer, .rounded-xl:has(img)').forEach((jobCard, idx) => {
      const cardText = jobCard.textContent;
      const matchedJob = jobs.find(j => j.vendorName && cardText.includes(j.vendorName));
      const jobId = matchedJob?.id ?? jobs[idx]?.id ?? 'rj-104';

      jobCard.style.cursor = 'pointer';
      jobCard.addEventListener('click', (e) => {
        if (e.target.closest('button, a')) return;
        this.selectedJobId = jobId;
        this.navigate('volunteer/job');
      });

      jobCard.querySelectorAll('button, a').forEach(btn => {
        if (btn.textContent.includes('Claim') || btn.textContent.includes('View Route') || btn.textContent.includes('Run Details')) {
          btn.addEventListener('click', (e) => {
            e.preventDefault();
            this.selectedJobId = jobId;
            this.navigate('volunteer/job');
          });
        }
      });
    });
  }

  hydrateRescueJobDetails(container) {
    container.querySelectorAll('button').forEach(btn => {
      if (btn.textContent.includes('Accept') || btn.textContent.includes('Claim')) {
        btn.addEventListener('click', async (e) => {
          e.preventDefault();
          const res = await window.NematState.claimRescueJob(this.selectedJobId, 'Zeeshan K.');
          if (res.success) {
            this.showToast('Run Claimed!', 'Follow the 4-step active transit stepper.', 'two_wheeler');
            this.navigate('volunteer/active');
          } else {
            this.showToast('Already Claimed', res.message, 'warning');
          }
        });
      }
    });
  }

  hydrateActiveRescue(container) {
    // Wire active stepper buttons
    container.querySelectorAll('button').forEach(btn => {
      if (btn.textContent.includes('Confirm Pickup') || btn.textContent.includes('Verify Code')) {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          window.NematState.progressRescueStep(this.selectedJobId, 'pickup_verified', { temp: 4.2, weight: 6.4 });
          this.showToast('Pickup Confirmed!', 'Step 2 complete: Weight 6.4 kg, Chilled Temp 4.2°C.', 'verified');
        });
      }
      const btnText = btn.textContent.toLowerCase();
      if (btnText.includes('handover') || btnText.includes('deliver') || btnText.includes('arrived')) {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          this.navigate('volunteer/deliver');
        });
      }
    });
  }

  hydrateDeliverRescuedFood(container) {
    container.querySelectorAll('button').forEach(btn => {
      if (btn.textContent.toLowerCase().includes('confirm delivery')) {
        btn.addEventListener('click', async (e) => {
          e.preventDefault();
          btn.disabled = true;
          const res = await window.NematState.progressRescueStep(this.selectedJobId, 'delivered');
          if (res.success) {
            this.showToast('Delivery Confirmed!', 'Run complete — logged to your civic rescue history.', 'check_circle');
            this.navigate('volunteer/my-runs');
          }
        });
      }
    });
  }

  hydrateRecipientDashboard(container) {
    const main=container.querySelector('main');
    const hero=main?.querySelector(':scope > div > section:first-child > div:first-child');
    if(hero&&!hero.querySelector('.recipient-mascot-art')){
      hero.classList.add('recipient-dashboard-hero');
      const mascot=document.createElement('img');mascot.className='recipient-mascot-art';mascot.src='/images/popcorn.png';mascot.alt='Nemat community kitchen food mascot';hero.appendChild(mascot);
    }
    const page=main?.firstElementChild;
    const metrics=page?.children[1];
    const contentGrid=page?.children[2];
    metrics?.classList.add('recipient-metrics');
    contentGrid?.classList.add('recipient-content-grid');
    metrics?.querySelectorAll(':scope > div').forEach(card=>card.classList.add('recipient-metric-card'));
    const deliveryColumn=contentGrid?.children[0];
    deliveryColumn?.classList.add('recipient-deliveries-column');
    deliveryColumn?.querySelectorAll(':scope > div').forEach(card=>{if(card.querySelector('h3'))card.classList.add('recipient-delivery-card')});
    contentGrid?.children[1]?.classList.add('recipient-operations-column');
    contentGrid?.children[1]?.querySelectorAll(':scope > div').forEach((card,index)=>card.classList.add(`recipient-operation-card-${index+1}`));
    container.querySelectorAll('button, tr, .cursor-pointer').forEach(row => {
      if (row.textContent.includes('Verify Delivery') || row.textContent.includes('Inspect Batch') || row.textContent.includes('View Delivery')) {
        row.addEventListener('click', (e) => {
          e.preventDefault();
          this.navigate('recipient/delivery');
        });
      }
    });
  }

  hydrateDeliveryConfirmation(container) {
    container.querySelectorAll('button').forEach(btn => {
      if (btn.textContent.includes('Confirm') || btn.textContent.includes('Accept') || btn.textContent.includes('Sign Off')) {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          window.NematState.confirmDeliveryTriage(this.selectedJobId, true);
          this.showToast('Intake Confirmed!', 'Food batch passed safety triage and added to dinner supper service.', 'check_circle');
          this.navigate('recipient/dashboard');
        });
      }
      if (btn.textContent.includes('Reject')) {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          window.NematState.confirmDeliveryTriage(this.selectedJobId, false, 'Cold-chain threshold failure (> 12°C)');
          this.showToast('Batch Rejected', 'Incident filed with Admin Food Safety Desk.', 'error');
          this.navigate('recipient/dashboard');
        });
      }
    });
  }

  hydrateAdminDashboard(container) {
    const main=container.querySelector('main');
    const hero=main?.querySelector(':scope > div > div > div:first-child');
    if(hero&&!hero.querySelector('.admin-mascot-art')){
      hero.classList.add('admin-dashboard-hero');
      const intro=hero.querySelector(':scope > div:first-child');
      const controls=hero.querySelector(':scope > div:nth-child(2)');
      if(intro&&controls){controls.classList.add('admin-dashboard-controls');intro.appendChild(controls)}
      const artFrame=document.createElement('div');artFrame.className='admin-mascot-frame';
      const art=document.createElement('img');art.className='admin-mascot-art';art.src='/images/admin.png';art.alt='Nemat admin character';artFrame.appendChild(art);
      if(intro){intro.classList.add('admin-dashboard-intro');intro.prepend(artFrame)}
    }
    // Link to approvals queue
    container.querySelectorAll('a, button').forEach(btn => {
      if (btn.textContent.includes('Approvals') || btn.textContent.includes('Pending')) {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          this.navigate('admin/approvals');
        });
      }
    });
  }

  hydrateApprovals(container) {
    // The detail panel (name/ID/category) is static "Loaf & Crumb" markup —
    // patch in the first real pending approval so Approve/Reject act on an
    // actual record instead of a fictional one.
    const approvals = window.NematState.get().approvals;
    const approval = approvals.find(a => a.status === 'pending');

    const heading = container.querySelector('h2.font-headline-md.text-headline-md.tracking-tight.font-bold.text-on-primary');
    if (approval && heading) {
      heading.textContent = approval.name;
      if (heading.nextElementSibling) {
        heading.nextElementSibling.textContent = `ID: ${approval.regNumber ?? approval.id} • ${approval.category}`;
      }
    }

    container.querySelectorAll('button').forEach(btn => {
      const text = btn.textContent.trim();
      if (text.includes('Approve')) {
        btn.addEventListener('click', async (e) => {
          e.preventDefault();
          if (!approval) return;
          btn.disabled = true;
          const res = await window.NematState.reviewApproval(approval.id, true);
          if (res.success) {
            btn.textContent = 'Approved ✓';
            btn.className = 'px-3 py-1 bg-primary text-white rounded-lg text-xs font-bold';
            this.showToast('Entity Approved', 'CDA Food Safety verification token granted.', 'verified');
          }
        });
      } else if (text.includes('Reject')) {
        btn.addEventListener('click', async (e) => {
          e.preventDefault();
          if (!approval) return;
          btn.disabled = true;
          const res = await window.NematState.reviewApproval(approval.id, false);
          if (res.success) {
            btn.textContent = 'Rejected ✕';
            btn.className = 'px-3 py-1 bg-error text-white rounded-lg text-xs font-bold';
            this.showToast('Entity Rejected', 'Notification sent to applicant.', 'cancel');
          }
        });
      }
    });
  }

  hydrateFoodSafetyDesk(container) {
    // The ticket detail panel is static "Loaf & Crumb" markup — patch in
    // the first real actionable report so Suspend Vendor acts on it.
    const reports = window.NematState.get().foodSafetyReports;
    const report = reports.find(r => r.status === 'Under Review');

    const heading = container.querySelector('h3.font-headline-sm.text-headline-sm.mt-0\\.5.text-on-primary.font-bold');
    if (report && heading) {
      heading.textContent = `Report #${report.id}`;
      if (heading.nextElementSibling) {
        heading.nextElementSibling.textContent = `${report.vendorName} · ${report.sector}`;
      }
    }

    container.querySelectorAll('button').forEach(btn => {
      if (btn.textContent.includes('Suspend Vendor') || btn.textContent.includes('Action')) {
        btn.addEventListener('click', async (e) => {
          e.preventDefault();
          if (!report) return;
          btn.disabled = true;
          const res = await window.NematState.suspendVendor(report.id);
          if (res.success) {
            this.showToast('Vendor Suspended (FR-61)', `${res.vendor?.name ?? report.vendorName} suspended pending safety audit.`, 'warning');
          }
        });
      }
    });
  }

  hydrateCustomerProfile(container) {
    // Static "Bilal Khan / 6 Rescued / 10.8 kg / Rs 4,850" markup — patch
    // in the real currentUser stats instead of always showing the seed
    // template's numbers.
    const user = window.NematState.get().currentUser;
    const co2 = `${user.co2SavedKg} kg CO₂e`;

    const chips = container.querySelectorAll('.px-space-sm.py-0\\.5.rounded.bg-surface-container.text-on-surface.font-label-sm.text-label-sm');
    if (chips[0]) chips[0].textContent = `🍲 ${user.mealsRescued} Rescued`;
    if (chips[1]) chips[1].textContent = `🌱 ${co2}`;
    if (chips[2]) chips[2].textContent = `₨ ${user.pkrSaved.toLocaleString()} Saved`;

    // Header "Net Environmental Impact" value — only rewrite the leading
    // text node so the nested "saved" label span is left untouched.
    const impactHeading = [...container.querySelectorAll('span')].find(s => s.textContent.trim() === 'Net Environmental Impact');
    const impactValue = impactHeading?.parentElement?.querySelector('span.font-metric-price');
    if (impactValue?.firstChild?.nodeType === Node.TEXT_NODE) {
      impactValue.firstChild.textContent = `${co2} `;
    }
  }

  hydrateMyRuns(container) {
    // Only the headline numbers on the first two metric cards (runs
    // completed, kg rescued) map to real data we track — the trend
    // badges ("+3 this week") and sparkline have no backing time-series,
    // so those stay decorative.
    const vol = window.NematState.get().volunteers[0];
    if (!vol) return;
    const numbers = container.querySelectorAll('.font-display-xl.text-display-xl.text-primary.leading-none');
    if (numbers[0]) numbers[0].textContent = vol.runsCompleted;
    if (numbers[1]) numbers[1].textContent = Math.round(vol.totalKgRescued);
  }

  // --- INTERACTIVE MODALS ---

  openCounterVerificationModal() {
    const modal = document.createElement('div');
    modal.className = 'nemat-modal-backdrop';
    modal.innerHTML = `
      <div class="bg-surface-container-lowest rounded-2xl p-6 max-w-md w-full shadow-2xl flex flex-col gap-4 border border-outline-variant/30">
        <div class="flex items-center justify-between pb-2 border-b border-surface-container">
          <div class="flex items-center gap-2 text-primary font-bold">
            <span class="material-symbols-outlined text-[24px]">qr_code_scanner</span>
            <span>Counter Pickup Verification</span>
          </div>
          <button class="text-outline hover:text-on-surface text-lg" onclick="this.closest('.nemat-modal-backdrop').remove()">✕</button>
        </div>
        <p class="text-xs text-on-surface-variant">Ask the customer to show their pickup pass, then enter its 4-digit code.</p>
        
        <div class="flex flex-col gap-2">
          <label class="text-xs font-bold text-on-surface">Enter 4-Digit Customer Code:</label>
          <div class="flex gap-2 justify-center py-2">
            <input type="text" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{4}" maxlength="4" placeholder="Enter pickup code" id="counter-input-code" value=""
              class="w-48 text-center text-3xl font-mono font-bold tracking-widest px-3 py-2 rounded-xl bg-surface-container border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary text-primary" />
          </div>
          <span id="counter-code-feedback" class="text-xs text-error text-center" aria-live="polite"></span>
        </div>

        <div class="px-3 py-2.5 bg-surface-container-low rounded-xl text-xs text-on-surface-variant">Enter the 4-digit code displayed on the customer pickup pass.</div>

        <div class="flex items-center justify-end gap-2 pt-2">
          <button class="px-4 py-2 rounded-lg bg-surface-container text-on-surface-variant text-xs font-bold" onclick="this.closest('.nemat-modal-backdrop').remove()">Cancel</button>
          <button id="counter-verify-submit-btn" class="px-5 py-2 rounded-lg bg-primary-container text-on-primary text-xs font-bold shadow-sm hover:bg-primary transition-colors flex items-center gap-1">
            <span class="material-symbols-outlined text-[16px]">check</span> Verify & Release Bag
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const codeInput=modal.querySelector('#counter-input-code');
    const submitButton=modal.querySelector('#counter-verify-submit-btn');
    const feedback=modal.querySelector('#counter-code-feedback');
    const verify=async()=>{
      const code = codeInput.value.trim();
      if(!/^\d{4}$/.test(code)){feedback.textContent='Enter the 4-digit code from the pickup pass.';codeInput.focus();return;}
      feedback.textContent='';submitButton.disabled=true;submitButton.textContent='Checking code…';
      const res = await window.NematState.verifyPickupCode(code);
      if (res.success) {
        modal.remove();
        this.showToast(res.persisted===false?'Pickup Verified Locally':'Pickup Confirmed!', `Customer ${res.reservation.customerName} verified. Marked as COLLECTED.`, 'check_circle');
        this.navigate('vendor/dashboard');
      } else {
        submitButton.disabled=false;submitButton.innerHTML='<span class="material-symbols-outlined text-[16px]">check</span> Verify & Release Bag';
        feedback.textContent=res.message;
        this.showToast('Verification Failed', res.message, 'error');
      }
    };
    submitButton.addEventListener('click',verify);
    codeInput.addEventListener('input',()=>{codeInput.value=codeInput.value.replace(/\D/g,'').slice(0,4);feedback.textContent=''});
    codeInput.addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();verify()}});
    codeInput.focus();
  }

  openOtpModal() {
    const modal = document.createElement('div');
    modal.className = 'nemat-modal-backdrop';
    modal.innerHTML = `
      <div class="bg-surface-container-lowest rounded-2xl p-6 max-w-sm w-full shadow-2xl flex flex-col gap-4 border border-outline-variant/30">
        <div class="flex items-center justify-between pb-2 border-b border-surface-container">
          <div class="flex items-center gap-2 text-primary font-bold">
            <span class="material-symbols-outlined text-[22px]">sms</span>
            <span>SMS OTP Verification</span>
          </div>
          <button class="text-outline hover:text-on-surface" onclick="this.closest('.nemat-modal-backdrop').remove()">✕</button>
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-xs font-bold text-on-surface">Pakistani Mobile Number (+92):</label>
          <div class="flex items-center rounded-lg bg-surface-container px-3 py-2 border border-outline-variant">
            <span class="font-bold text-xs text-on-surface-variant mr-2">🇵🇰 +92</span>
            <input type="tel" value="300 8594210" class="bg-transparent text-sm font-semibold w-full focus:outline-none" />
          </div>
          <span class="text-[11px] text-outline mt-1">Rate limit: Max 3 OTPs per 15 min (FR-8)</span>
        </div>

        <div class="flex flex-col gap-2 pt-2">
          <label class="text-xs font-bold text-on-surface">Enter 4-Digit Code:</label>
          <div class="flex justify-center gap-2">
            <input type="text" maxlength="1" value="7" class="w-10 h-12 text-center text-xl font-bold rounded-lg bg-surface-container border border-outline-variant" />
            <input type="text" maxlength="1" value="2" class="w-10 h-12 text-center text-xl font-bold rounded-lg bg-surface-container border border-outline-variant" />
            <input type="text" maxlength="1" value="9" class="w-10 h-12 text-center text-xl font-bold rounded-lg bg-surface-container border border-outline-variant" />
            <input type="text" maxlength="1" value="4" class="w-10 h-12 text-center text-xl font-bold rounded-lg bg-surface-container border border-outline-variant" />
          </div>
        </div>

        <div class="flex items-center justify-between text-xs text-secondary font-bold pt-1">
          <span>Resend in 0:42</span>
          <button class="underline hover:text-on-surface-variant">Change Number</button>
        </div>

        <button id="otp-confirm-btn" class="w-full py-2.5 rounded-lg bg-primary text-on-primary font-bold text-xs shadow-sm hover:bg-primary-container transition-all flex items-center justify-center gap-1.5 mt-2">
          <span class="material-symbols-outlined text-[16px]">verified</span> Verify & Proceed
        </button>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('#otp-confirm-btn').addEventListener('click', () => {
      modal.remove();
      this.showToast('Phone Number Verified', '+92 300 8594210 logged in securely.', 'check_circle');
      this.navigate('choose-role');
    });
  }

  openFoodSafetyModal(vendorName = 'Loaf & Crumb') {
    const modal = document.createElement('div');
    modal.className = 'nemat-modal-backdrop';
    modal.innerHTML = `
      <div class="bg-surface-container-lowest rounded-2xl p-6 max-w-md w-full shadow-2xl flex flex-col gap-4 border border-outline-variant/30">
        <div class="flex items-center justify-between pb-2 border-b border-surface-container">
          <div class="flex items-center gap-2 text-error font-bold">
            <span class="material-symbols-outlined text-[24px]">health_and_safety</span>
            <span>Report Food Safety Issue (FR-29)</span>
          </div>
          <button class="text-outline hover:text-on-surface text-lg" onclick="this.closest('.nemat-modal-backdrop').remove()">✕</button>
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-xs font-bold text-on-surface">Vendor Name:</label>
          <input type="text" value="${vendorName}" disabled class="bg-surface-container text-xs font-semibold px-3 py-2 rounded-lg text-on-surface" />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-xs font-bold text-on-surface">Issue Type:</label>
          <select id="safety-issue-type" class="bg-surface-container text-xs font-semibold px-3 py-2 rounded-lg text-on-surface border border-outline-variant">
            <option>Temperature Violation (lukewarm chilled item)</option>
            <option>Expired Shelf Life</option>
            <option>Packaging Tamper / Compromised Seal</option>
            <option>Allergen Undeclared</option>
            <option>Other Food Safety Defect</option>
          </select>
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-xs font-bold text-on-surface">Description / Observation:</label>
          <textarea id="safety-issue-details" rows="3" placeholder="Provide details of the food condition..." class="bg-surface-container text-xs px-3 py-2 rounded-lg border border-outline-variant"></textarea>
        </div>

        <span class="text-[11px] text-outline">Per FR-61: 2 confirmed food safety flags in 30 days automatically triggers vendor suspension.</span>

        <div class="flex items-center justify-end gap-2 pt-2">
          <button class="px-4 py-2 rounded-lg bg-surface-container text-on-surface-variant text-xs font-bold" onclick="this.closest('.nemat-modal-backdrop').remove()">Cancel</button>
          <button id="safety-submit-btn" class="px-5 py-2 rounded-lg bg-error text-white text-xs font-bold shadow-sm hover:opacity-90 transition-opacity">Submit Report</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('#safety-submit-btn').addEventListener('click', () => {
      const type = modal.querySelector('#safety-issue-type').value;
      const details = modal.querySelector('#safety-issue-details').value || 'Reported from reservation pass inspection.';
      window.NematState.flagFoodSafety(vendorName, type, details);
      modal.remove();
      this.showToast('Incident Report Filed', 'Admin food safety investigation desk notified.', 'verified_user');
    });
  }

  async runCloseWindowScenario() {
    await window.NematState.closeWindowAndSendToRescue();
    this.navigate('volunteer/jobs');
  }

  openScenariosModal() {
    const modal = document.createElement('div');
    modal.className = 'nemat-modal-backdrop';
    modal.innerHTML = `
      <div class="bg-surface-container-lowest rounded-2xl p-6 max-w-lg w-full shadow-2xl flex flex-col gap-4 border border-outline-variant/30 max-h-[85vh] overflow-y-auto">
        <div class="flex items-center justify-between pb-2 border-b border-surface-container">
          <div class="flex items-center gap-2 text-primary font-bold">
            <span class="material-symbols-outlined text-[24px]">auto_fix_high</span>
            <span>Interactive Demo Scenarios</span>
          </div>
          <button class="text-outline hover:text-on-surface text-lg" onclick="this.closest('.nemat-modal-backdrop').remove()">✕</button>
        </div>

        <p class="text-xs text-on-surface-variant">Execute complete end-to-end user journeys defined in the Islamabad SRS:</p>

        <div class="flex flex-col gap-2.5">
          <!-- Scenario 1 -->
          <div class="p-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors flex items-center justify-between gap-3">
            <div class="flex flex-col">
              <span class="font-bold text-xs text-primary">1. Customer: Discover & Reserve Bag</span>
              <span class="text-[11px] text-on-surface-variant">Browse a drop, reserve a bag, and copy its generated 4-digit pickup code.</span>
            </div>
            <button class="px-3 py-1.5 rounded-lg bg-primary-container text-on-primary text-xs font-bold shrink-0" onclick="window.NematApp.navigate('customer/explore'); this.closest('.nemat-modal-backdrop').remove();">Run</button>
          </div>

          <!-- Scenario 2 -->
          <div class="p-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors flex items-center justify-between gap-3">
            <div class="flex flex-col">
              <span class="font-bold text-xs text-primary">2. Vendor: Post Evening Drop (< 60s)</span>
              <span class="text-[11px] text-on-surface-variant">List bakery bags with price validation (<= 60% retail) & allergens.</span>
            </div>
            <button class="px-3 py-1.5 rounded-lg bg-primary-container text-on-primary text-xs font-bold shrink-0" onclick="window.NematApp.navigate('vendor/new-drop'); this.closest('.nemat-modal-backdrop').remove();">Run</button>
          </div>

          <!-- Scenario 3 -->
          <div class="p-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors flex items-center justify-between gap-3">
            <div class="flex flex-col">
              <span class="font-bold text-xs text-primary">3. Vendor: Verify Counter Pickup Code</span>
              <span class="text-[11px] text-on-surface-variant">Enter the active customer's pickup code to mark the bag collected.</span>
            </div>
            <button class="px-3 py-1.5 rounded-lg bg-primary-container text-on-primary text-xs font-bold shrink-0" onclick="this.closest('.nemat-modal-backdrop').remove(); window.NematApp.openCounterVerificationModal();">Run</button>
          </div>

          <!-- Scenario 4 -->
          <div class="p-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors flex items-center justify-between gap-3">
            <div class="flex flex-col">
              <span class="font-bold text-xs text-secondary">4. Window Closes: Send Unsold to Rescue</span>
              <span class="text-[11px] text-on-surface-variant">Converts remaining surplus into Volunteer Rescue Job.</span>
            </div>
            <button class="px-3 py-1.5 rounded-lg bg-secondary text-on-secondary text-xs font-bold shrink-0" onclick="window.NematApp.runCloseWindowScenario(); this.closest('.nemat-modal-backdrop').remove();">Run</button>
          </div>

          <!-- Scenario 5 -->
          <div class="p-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors flex items-center justify-between gap-3">
            <div class="flex flex-col">
              <span class="font-bold text-xs text-primary">5. Volunteer: Claim Run & Stepper</span>
              <span class="text-[11px] text-on-surface-variant">Arrival code, weight kg log, cold-chain temp check, delivery.</span>
            </div>
            <button class="px-3 py-1.5 rounded-lg bg-primary-container text-on-primary text-xs font-bold shrink-0" onclick="window.NematApp.navigate('volunteer/active'); this.closest('.nemat-modal-backdrop').remove();">Run</button>
          </div>

          <!-- Scenario 6 -->
          <div class="p-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors flex items-center justify-between gap-3">
            <div class="flex flex-col">
              <span class="font-bold text-xs text-primary">6. Recipient: Food Intake Triage</span>
              <span class="text-[11px] text-on-surface-variant">Al-Noor Kitchen inspects temperature, seal, and confirms intake.</span>
            </div>
            <button class="px-3 py-1.5 rounded-lg bg-primary-container text-on-primary text-xs font-bold shrink-0" onclick="window.NematApp.navigate('recipient/delivery'); this.closest('.nemat-modal-backdrop').remove();">Run</button>
          </div>

          <!-- Scenario 7 -->
          <div class="p-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors flex items-center justify-between gap-3">
            <div class="flex flex-col">
              <span class="font-bold text-xs text-primary">7. Admin: Approvals & Telemetry</span>
              <span class="text-[11px] text-on-surface-variant">Review pending KYC/CDA registration & city-wide impact.</span>
            </div>
            <button class="px-3 py-1.5 rounded-lg bg-primary-container text-on-primary text-xs font-bold shrink-0" onclick="window.NematApp.navigate('admin/approvals'); this.closest('.nemat-modal-backdrop').remove();">Run</button>
          </div>
        </div>

        <div class="flex items-center justify-between pt-3 border-t border-surface-container">
          <button class="text-xs text-error font-bold hover:underline" onclick="window.NematState.resetState(); window.NematApp.showToast('Demo State Reset', 'Default state restored.', 'refresh'); this.closest('.nemat-modal-backdrop').remove();">Reset Demo State</button>
          <button class="px-4 py-1.5 rounded-lg bg-surface-container text-xs font-bold" onclick="this.closest('.nemat-modal-backdrop').remove()">Close</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.NematApp = new NematApp();
});
