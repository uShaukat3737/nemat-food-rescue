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
    this.setupQuickHub();
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
        this.navigate('customer/explore');
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

    // 2. Specific Screen Hydration
    if (routeKey === 'customer/explore') {
      this.hydrateCustomerExplore(container);
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
    // Stitch markup has no per-card id, so match each card to its real drop
    // by the vendor name already printed on the card (robust to a new drop
    // being unshifted to the front of state.drops — plain array-index
    // matching would silently point every card at the wrong bag then).
    // Falls back to position only if no vendor name match is found.
    const drops = window.NematState.get().drops;

    container.querySelectorAll('article, .surplus-card').forEach((card, idx) => {
      const cardText = card.textContent;
      const matchedDrop = drops.find(d => d.vendorName && cardText.includes(d.vendorName));
      const dropId = matchedDrop?.id ?? drops[idx]?.id ?? 'drop-1';
      card.style.cursor = 'pointer';
      card.addEventListener('click', (e) => {
        if (e.target.closest('button, a')) return;
        this.selectedBagId = dropId;
        this.navigate('customer/bag');
      });

      // Reserve/Bag buttons nested inside this specific card
      card.querySelectorAll('a, button').forEach(btn => {
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

  hydrateCustomerMap(container) {
    // Map markers
    const markerLoaf = container.querySelector('#marker-loaf-crumb') || container.querySelector('[id*="marker"]');
    if (markerLoaf) {
      markerLoaf.addEventListener('click', () => {
        this.selectedBagId = 'drop-1';
        this.navigate('customer/bag');
      });
    }

    container.querySelectorAll('button:has(.material-symbols-outlined)').forEach(btn => {
      if (btn.textContent.includes('PKR')) {
        btn.addEventListener('click', () => {
          this.navigate('customer/bag');
        });
      }
    });
  }

  hydrateSurpriseBagDetails(container) {
    // The template is static Loaf & Crumb markup — patch in the actually
    // selected drop's data so different bags don't all look identical.
    const drops = window.NematState.get().drops;
    const drop = drops.find(d => d.id === this.selectedBagId) || drops[0];

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
          const res = await window.NematState.reserveBag(this.selectedBagId);
          if (res.success) {
            this.showToast('Reservation Successful!', `Pickup Pass #${res.reservation.code} generated.`, 'check_circle');
            this.navigate('customer/confirmed');
          } else {
            this.showToast('Cannot Reserve', res.message, 'warning');
          }
        });
      }
    });
  }

  hydrateReservationConfirmation(container) {
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
    const activeRes = state.reservations.find(r => r.status === 'RESERVED') || state.reservations[0];
    if (activeRes && activeRes.code !== '4827') {
      // Template markup hardcodes the seed reservation's code (4827) in several
      // places (breadcrumb, QR caption, helper text) — swap them all for real ones.
      const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) {
        if (node.nodeValue.includes('4827')) {
          node.nodeValue = node.nodeValue.split('4827').join(activeRes.code);
        }
      }
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

  hydrateVendorDashboard(container) {
    const state = window.NematState.get();

    // Add working "Verify Counter Code" button in header or action area
    const actionHeader = container.querySelector('header .flex.items-center.gap-space-md') || container.querySelector('main');
    if (actionHeader && !container.querySelector('#vendor-verify-code-btn')) {
      const verifyBtn = document.createElement('button');
      verifyBtn.id = 'vendor-verify-code-btn';
      verifyBtn.className = 'px-3 py-1.5 rounded-lg bg-primary-container text-on-primary font-bold text-xs flex items-center gap-1.5 shadow-sm hover:bg-primary transition-all';
      verifyBtn.innerHTML = `<span class="material-symbols-outlined text-[16px]">qr_code_scanner</span> Verify Customer Code`;
      verifyBtn.addEventListener('click', () => this.openCounterVerificationModal());
      actionHeader.prepend(verifyBtn);
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
      actionHeader.prepend(closeBtn);
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
        <p class="text-xs text-on-surface-variant">Ask the customer for their 4-digit pickup code or scan their digital pass token.</p>
        
        <div class="flex flex-col gap-2">
          <label class="text-xs font-bold text-on-surface">Enter 4-Digit Customer Code:</label>
          <div class="flex gap-2 justify-center py-2">
            <input type="text" maxlength="4" placeholder="4827" id="counter-input-code" value="4827"
              class="w-48 text-center text-3xl font-mono font-bold tracking-widest px-3 py-2 rounded-xl bg-surface-container border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary text-primary" />
          </div>
        </div>

        <div class="p-3 bg-surface-container-low rounded-xl text-xs flex flex-col gap-1 text-on-surface-variant">
          <span class="font-bold text-primary flex items-center gap-1">
            <span class="material-symbols-outlined text-[16px]">info</span> Quick Demo Hint:
          </span>
          <span>Active Customer Pass Code is <strong class="text-primary font-mono font-bold">4827</strong> (Bilal K. • Loaf & Crumb).</span>
        </div>

        <div class="flex items-center justify-end gap-2 pt-2">
          <button class="px-4 py-2 rounded-lg bg-surface-container text-on-surface-variant text-xs font-bold" onclick="this.closest('.nemat-modal-backdrop').remove()">Cancel</button>
          <button id="counter-verify-submit-btn" class="px-5 py-2 rounded-lg bg-primary-container text-on-primary text-xs font-bold shadow-sm hover:bg-primary transition-colors flex items-center gap-1">
            <span class="material-symbols-outlined text-[16px]">check</span> Verify & Release Bag
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('#counter-verify-submit-btn').addEventListener('click', async () => {
      const code = modal.querySelector('#counter-input-code').value;
      const res = await window.NematState.verifyPickupCode(code);
      if (res.success) {
        modal.remove();
        this.showToast('Pickup Confirmed!', `Customer ${res.reservation.customerName} verified. Marked as COLLECTED.`, 'check_circle');
        this.navigate('vendor/dashboard');
      } else {
        this.showToast('Verification Failed', res.message, 'error');
      }
    });
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
              <span class="text-[11px] text-on-surface-variant">Browse F-7 drops, reserve bag, view 4-digit code pass (#4827).</span>
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
              <span class="text-[11px] text-on-surface-variant">Verify customer 4-digit code #4827 and mark as collected.</span>
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
