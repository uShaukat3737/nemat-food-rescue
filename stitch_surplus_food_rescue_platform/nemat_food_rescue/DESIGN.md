---
name: Nemat Food Rescue
colors:
  surface: '#fbf9f6'
  surface-dim: '#dbdad7'
  surface-bright: '#fbf9f6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f0'
  surface-container: '#efeeeb'
  surface-container-high: '#eae8e5'
  surface-container-highest: '#e4e2df'
  on-surface: '#1b1c1a'
  on-surface-variant: '#414844'
  inverse-surface: '#30312f'
  inverse-on-surface: '#f2f0ed'
  outline: '#717973'
  outline-variant: '#c1c8c2'
  surface-tint: '#3f6653'
  primary: '#012d1d'
  on-primary: '#ffffff'
  primary-container: '#1b4332'
  on-primary-container: '#86af99'
  inverse-primary: '#a5d0b9'
  secondary: '#904d00'
  on-secondary: '#ffffff'
  secondary-container: '#fe932c'
  on-secondary-container: '#663500'
  tertiary: '#002d1b'
  on-tertiary: '#ffffff'
  tertiary-container: '#00452d'
  on-tertiary-container: '#65b68e'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c1ecd4'
  primary-fixed-dim: '#a5d0b9'
  on-primary-fixed: '#002114'
  on-primary-fixed-variant: '#274e3d'
  secondary-fixed: '#ffdcc3'
  secondary-fixed-dim: '#ffb77d'
  on-secondary-fixed: '#2f1500'
  on-secondary-fixed-variant: '#6e3900'
  tertiary-fixed: '#a1f4c8'
  tertiary-fixed-dim: '#86d7ad'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#fbf9f6'
  on-background: '#1b1c1a'
  surface-variant: '#e4e2df'
typography:
  display-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  metric-price:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 26px
    letterSpacing: -0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-desktop: 2rem
  margin: 1rem
  margin-tablet: 2rem
  margin-desktop: 3.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system expresses conscious abundance, civic dignity, and operational warmth. Grounded in the cultural ethos of *nemat* (blessing/sustenance), it approaches surplus food rescue not as distress charity or clearance dumping, but as a sophisticated culinary reallocation platform tailored specifically for Islamabad's hospitality ecosystem.

### Aesthetic Principles
- **Modern Civic Warmth:** Combines the crisp, clean structure of contemporary food-tech platforms with the serene, grounded materiality of the Margalla foothills and Islamabad's planned urban geometry.
- **Dignified Hospitality:** Moves completely away from guilt-driven charity aesthetics and loud, discount-heavy bargain bin retail. The product feels like a premium neighborhood marketplace prioritizing sustainability, food safety, and community stewardship.
- **Local Context & Spatial Logic:** Integrated around Islamabad's sectoral grid (F-6 Markaz, F-7, Blue Area, E-7, I-8), delivering effortless spatial cues, transparent pickup windows, and bilingual respect (English and Urdu).
- **Subdued Precision:** Relies on generous breathing room, structured surfaces, fine hairline dividers, and grounded forest tones over aggressive gimmicks or neon accents.

## Colors

The palette balances deep, lush botanicals with organic cream paper surfaces and targeted culinary embers.

- **Primary (`#1B4332` - Margalla Forest):** Represents sustainability, trust, and quality. Used for authoritative structural moments, primary buttons, active tabs, and branding anchors. Paired with interactive state `#2D6A4F` for hovers and `#40916C` for affirmative status accents.
- **Secondary (`#D97706` - Warm Saffron Amber):** Denotes temporal urgency, rescue discount badges, remaining portion counters, and pickup countdown timers. Never neon; tuned for rich culinary warmth.
- **Tertiary (`#40916C` - Fresh Sage):** Serves as an environmental accent for kilograms diverted, CO₂ equivalent savings, and verified hygiene certifications.
- **Neutral Foundations:**
  - Canvas Base: `#FAF8F5` (Soft warm alabaster).
  - Surface Card / Raised Container: `#FFFFFF`.
  - Subdued Section Fill: `#F4F0E8`.
  - Hairline Borders & Dividers: `#E5E0D8`.
- **Text & Contrast:**
  - Charcoal Primary: `#1E232A` (Rich, legible charcoal, softer than pure black).
  - Charcoal Secondary: `#4A525D` (Subdued metadata, operating hours, sectoral hints).
  - Charcoal Muted / Placeholder: `#7D8795`.

## Typography

The typography system relies on **Plus Jakarta Sans** across all levels, marrying modern geometry with subtle organic humanist curves.

### Type Guidance
- **Tabular Figures for Commerce:** All pricing (`PKR 750`), quantities (`3 meals remaining`), weights (`12.4 kg rescued`), and pickup times (`8:30 PM - 10:00 PM`) must enable `font-variant-numeric: tabular-nums` to maintain vertical visual alignment across listings and tables.
- **Bilingual Considerations:** The language switch toggle `EN | اردو` serves as a core navigation anchor. When Urdu is activated, display sizes adapt with 20% expanded line height to accommodate Nastaliq/Naskh vertical ascenders and descenders smoothly.
- **Hierarchy Rules:** Primary headings employ bold weight (`700`) with modest negative letter spacing. Metadata labels utilize medium-bold weights (`600`) to guarantee high-speed legibility when scanning surplus bundles on cards.

## Layout & Spacing

The layout is built primarily for modern desktop and responsive laptop screens, with natural structural support for tablet and mobile viewports.

### Grid & Canvas Structure
- **Desktop (1280px and above):** Max-width 1360px centered canvas, 12-column layout, 32px (`2rem`) gutters, 56px (`3.5rem`) outer margin.
- **Laptop / Tablet (768px - 1279px):** 8-column layout, 24px (`1.5rem`) gutters, 32px (`2rem`) outer margin.
- **Mobile (< 768px):** 4-column layout, 16px (`1rem`) gutters, 16px (`1rem`) outer margin.

### Spatial Rhythm
- **Micro Spacing (`space-xs`, `space-sm`):** Reserved for icon-to-text gaps within sector badges, countdown timer digits, and button content clusters.
- **Macro Spacing (`space-md`, `space-lg`, `space-xl`):** Manages internal card padding (`1.25rem` to `1.5rem`), card grid gaps (`1.5rem` to `2rem`), and major page section delimiters.

## Elevation & Depth

This design system avoids loud skeuomorphism and blur-heavy glassmorphism in favor of structured architectural depth and natural ambient light.

### Depth Hierarchy
1. **Flat Base Canvas:** Surface background tinted `#FAF8F5`. No shadows.
2. **Surface Containers (Cards, Modals, Menus):** Pure `#FFFFFF` resting on `#FAF8F5`, delineated with a crisp `1px solid #E5E0D8` border.
3. **Ambient Elevation (Hover & Overlay):**
   - **Resting Card:** `0 1px 3px rgba(30, 35, 42, 0.04), 0 1px 2px rgba(30, 35, 42, 0.02)` + hairline border `#E5E0D8`.
   - **Interactive Card Hover:** `0 12px 24px -6px rgba(27, 67, 50, 0.08), 0 4px 8px -2px rgba(30, 35, 42, 0.03)` with a smooth subtle lift (`translateY(-2px)`).
   - **Dropdowns & Popovers:** `0 10px 25px -4px rgba(30, 35, 42, 0.1), 0 4px 6px -2px rgba(30, 35, 42, 0.04)` with `#E5E0D8` boundary.
   - **Modals / Drawers:** Backed by an ambient scrim overlay `rgba(30, 35, 42, 0.45)`.

## Shapes

The form language is disciplined and balanced, using moderate radii (`0.5rem` / `8px`) for containers and inputs, and fully rounded capsules (`9999px`) for badges and primary status chips.

- **Cards & Panes:** `8px` (`0.5rem`) corner radius. Strikes the right balance between corporate reliability and approachable hospitality.
- **Buttons & Input Fields:** `8px` (`0.5rem`) for seamless physical pairing side by side.
- **Badges, Sector Chips & Urgency Pills:** Fully pill-shaped (`9999px`) to immediately set metadata, geography, and statuses apart from structural interactive containers.

## Components

### 1. Global Desktop Header & Language Switcher
- **Layout:** Sticky top surface (`#FFFFFF` with `1px` bottom border in `#E5E0D8`), 72px fixed height, containing the brand mark, Islamabad sector selector dropdown (`F-6`, `F-7`, `E-7`, `Blue Area`), dynamic search bar, navigation links, bilingual selector, and user account trigger.
- **Language Switcher (`EN | اردو`):** Segmented pill toggle. Active state features deep forest green text on a `#F4F0E8` soft background; inactive state renders in muted charcoal `#7D8795`.

### 2. Surplus Rescue Food Cards
- **Structure:**
  - Top visual area (16:10 ratio) with restaurant/bakery image, rescue batch badge (`Surprise Baker's Box`, `Prepared Buffet Pack`), and sector tag pinned at top-left.
  - Body section featuring restaurant name (`e.g., Burning Brownie, F-11` or `Street 1 Cafe, Diplomatic Enclave`), item title, remaining meal counters (`e.g., 2 left`), and strict pickup window badge (`Collect: 9:30 PM - 10:30 PM`).
  - Pricing footer: Tabular discount layout displaying strike-through original price in muted tone (`PKR 1,400`) alongside the bold rescue price in primary charcoal (`PKR 450`), flanked by a compact secondary amber savings badge (`-65%`).

### 3. Sector Geolocation Badges
- Islamabad sector badges (`F-6 Markaz`, `F-7 Jinnah Super`, `F-8`, `F-10`, `Blue Area`, `G-9`) built as compact pills:
  - Fill: `#F4F0E8` with hairline `#E5E0D8` border.
  - Text: `#1E232A` (12px, font weight 600) preceded by a muted pine pin icon.
  - Active/Filter selected state: `#1B4332` fill with white text.

### 4. Buttons
- **Primary:** Solid `#1B4332` background, white label, no border, 44px height for desktop. Hover state `#2D6A4F`. Active state `#143326`.
- **Secondary / Outlined:** Transparent surface with `1.5px solid #1B4332`, text color `#1B4332`. Hover fill `#F4F0E8`.
- **Urgent / Reserve Now:** `#D97706` background with white text, utilized strictly for high-urgency final stock allocation actions.

### 5. Input Fields & Dropdowns
- 44px height, `#FFFFFF` background, `1px solid #E5E0D8` border, `8px` corner radius.
- Focus state: `1.5px solid #1B4332` border with `0 0 0 3px rgba(27, 67, 50, 0.12)` halo.
- Floating helper tags or inline sector filters nestled directly inside search fields.

### 6. Impact Metric Tickers
- Environmental impact cards (e.g., "1,240 kg rescued in F-7 this month"): Minimalist white cards with a top accent strip in `#40916C`, large tabular numerals in `#1B4332`, and supportive caption text in `#4A525D`.