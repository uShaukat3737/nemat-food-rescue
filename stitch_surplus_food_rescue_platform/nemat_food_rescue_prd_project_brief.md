# Product Requirements Document (PRD) & Project Brief: Nemat Food Rescue (نعمت)

---

## 1. Executive Summary & Vision

**Nemat Food Rescue** (*نعمت — "Blessing / Abundance"*) is an end-to-end, responsive web platform engineered to eliminate commercial food waste across Islamabad and the Islamabad Capital Territory (ICT). Operating at the intersection of marketplace dynamics, hyper-local logistics, and charitable surplus redistribution, Nemat bridges five distinct stakeholder groups: **Customers / Rescuers**, **Food Vendors / Bakeries**, **Civic Volunteers**, **Recipient Charitable Organizations / Community Kitchens**, and **Platform Administrators**.

The platform tackles the duality of Islamabad's urban food ecosystem: high-end culinary establishments and bakeries (in sectors such as F-6, F-7, F-8, G-9, and Blue Area) frequently dispose of pristine, day-fresh perishable items, while low-income communities, orphanages, and shelter kitchens face persistent food supply constraints. 

### Mission Statement
> *"To ensure that no edible food produced in Islamabad ends up in a CDA landfill, transforming commercial surplus into affordable nourishment for citizens and guaranteed hot meals for communities in need."*

---

## 2. Market Context & Operational Environment

- **Target Geography**: Islamabad Capital Territory (ICT), Pakistan.
- **Initial Operational Clusters**: F-6 (Super Market), F-7 (Jinnah Super), F-8 (Ayub Market), G-9 (Karachi Company), Blue Area commercial spine, and I-8 / I-9 distribution belts.
- **Regulatory Framework**: Compliance with ICT Food Safety Authority, Islamabad District Administration hygiene standards, and Punjab/ICT Safe Food Handling Protocols.
- **Currency & Local Payment Methods**: Pakistani Rupee (PKR). Integrated with cash-on-pickup counter verification, local digital wallets (NayaPay, SadaPay, JazzCash, EasyPaisa), and 1Link / Raast direct bank verification.
- **Languages Supported**: Dual-language architecture: English (EN) and Urdu (اردو), with localized microcopy and sector identifiers.

---

## 3. Product Principles & Design Language

As captured in `DESIGN_SYSTEM_1` and applied across all web app interfaces:

1. **Dignity Over Charity**: Surprise bags and marketplace items are positioned as premium culinary deals and ecological stewardship rather than welfare hand-outs.
2. **Operational Velocity**: Perishable food has a tight expiration window. Timers, collection passes, and volunteer handovers must operate with single-tap clarity and zero cognitive load.
3. **Transparency & Trust**: Clear verification codes (4-digit PINs, encrypted QR tokens), strict allergen disclosures, and verifiable cold-chain / hygiene logs.
4. **Visual Aesthetics & Palette**:
   - Primary: Forest Emerald (`#1b4332`, `#2d6a4f`) evoking freshness, sustainability, and civic pride.
   - Surface & Canvas: Warm cream/off-white (`#fbf9f6`, `#ffffff`) with neutral earth tones (`#f5f3f0`).
   - Accent & Alerts: Terracotta / amber gold (`#d97706`) for urgency/warning; soft ruby (`#dc2626`) for food safety rejections/expirations.
   - Typography: Plus Jakarta Sans with generous whitespace, high contrast, and clean tabular alignment.

---

## 4. Multi-Sided Stakeholder Roles & User Journeys

The platform features 5 distinct user roles accessible via a unified role switch or dedicated authentication entry point:

### Role 1: Customer / Rescuer (B2C Surplus Marketplace)
*Primary Goal: Discover, reserve, and pick up discounted surprise surplus food bags from top local eateries.*
- **Explore & Filter**: Browse Islamabad bakery and café drops filtered by sector, pickup time window, dietary preference (Vegetarian, Halal, Bakery, Savory), and discount tier (~50–70% off).
- **Interactive Map View**: Geolocation-enabled sector map displaying partner venues with live bag inventory pins, walking distance, and real-time availability status.
- **Surprise Bag Details**: Transparent view of potential items (e.g., artisanal sourdough, croissants, paninis), allergen checklist, vendor preparation protocol, and pickup schedule.
- **Checkout & Reservation**: One-click reservation with immediate confirmation and held-inventory timer.
- **Pickup Pass (Digital Ticket)**: High-contrast counter pass displaying an oversized 4-digit verification code (`#4827`), dynamic QR code, vendor GPS directions, and environmental impact scorecard (e.g., `1.8 kg CO₂e saved`).
- **Profile & Impact Tracking**: Cumulative statistics of meals rescued, rupees saved, favorite vendors in F-6/F-7, and notification controls for drop alerts.

### Role 2: Vendor / Food Business (B2B Inventory Management)
*Primary Goal: Monetize surplus inventory, reduce disposal costs, and automate charitable redistribution.*
- **Quick Drop Creation**: Standardized multi-step flow allowing bakeries to list batches in under 60 seconds (Bag category, quantity, discounted price vs. retail valuation, pickup window).
- **Real-Time Vendor Dashboard**: Live progress bars tracking total posted vs. reserved vs. collected bags during the evening rush.
- **Counter Verification**: Dedicated merchant interface to input or scan customer 4-digit pickup codes, confirm payment status, and reconcile stock in real time.
- **Civic Escalation Protocol**: Automated trigger at the conclusion of the commercial pickup window (e.g., 9:30 PM). Unclaimed or unsold bags are instantly converted into Volunteer Rescue Jobs for charitable delivery.
- **Business Impact & Compliance**: Weekly and monthly analytics showing recovered revenue, waste avoidance certificates, and ICT Food Safety inspection logs.

### Role 3: Civic Volunteer (Last-Mile Hyper-Local Logistics)
*Primary Goal: Transport unsold commercial surplus from vendors to recipient community kitchens safely and punctually.*
- **Rescue Job Feed**: Available evening pickup routes categorized by sector, vehicle requirement (bike, car, walk), load weight (kg), and urgent surge indicators.
- **Job Acceptance & Route Detail**: Clear pickup and drop-off waypoints, vendor contact person, kitchen receiving guidelines, and packaging verification checklist.
- **Active Rescue Mode**: Step-by-step progress tracking:
  - Step 1: Arrival at vendor & verification code confirmation.
  - Step 2: Quality & packaging inspection (temp check, seal integrity, weight log).
  - Step 3: Transit with emergency dispatch helpline (`0800-NEMAT`).
  - Step 4: Handover at recipient facility with pin-code signoff.
- **Volunteer History (My Runs)**: Personal gamified tracker showing completed runs, total kilograms transported, meal equivalents, and community rating.

### Role 4: Recipient Organisation / NGO (Beneficiary Operations)
*Primary Goal: Forecast, inspect, and safely receive bulk hot food or bakery batches to serve community members.*
- **Recipient Dashboard**: Real-time arrival board tracking incoming volunteer couriers with ETAs, donor vendor names, and food volume.
- **Hygiene & Intake Verification**: Mandatory safety triage checklist upon delivery (thermal check, packaging tamper status, visual and olfactory inspection).
- **Delivery Confirmation & Exception Handling**: Formal digital sign-off confirming acceptance. In case of spoiled or compromised items, instant structured rejection workflow (Food quality / Unsafe condition / Exceeded time threshold) with mandatory incident audit trail.
- **Daily Feeding & Quota Log**: Real-time progress tracker towards nightly kitchen meal targets (e.g., 250 meals served nightly across shelter facilities).

### Role 5: Platform Administrator (Governance, Safety & Oversight)
*Primary Goal: Monitor system-wide health, audit food safety incidents, and verify merchant/NGO onboarding.*
- **Executive Management Console**: Live Islamabad city-wide telemetry: active vendor drops, live rescue routes, completed collections, and platform fulfillment rates.
- **Vendor & NGO Approvals**: Verification queue vetting applicant restaurants, hygiene licenses, CDA registration numbers, and kitchen facilities with one-click approve/reject actions.
- **Food Safety Incident Desk**: Structured auditing queue reviewing logged delivery exceptions, customer reports, and thermal non-compliance cases to suspend or re-certify entities.
- **Platform Analytics**: Geospatial heatmaps detailing food recovery across CDA sectors (F-6, F-7, G-9, Blue Area), CO₂e greenhouse gas reduction metrics, and vendor participation indices.

---

## 5. Technical Architecture & Non-Functional Requirements

### 5.1 Architecture & Stack
- **Frontend**: Clean, semantic HTML5, modern Tailwind CSS layout engine, vanilla JavaScript interactions, responsive design across Desktop, Tablet, and Mobile.
- **Component Design System**: Reusable tokenized design system (`Nemat Food Rescue`) featuring standardized status badges (`LIVE`, `RESERVED`, `COLLECTED`, `RESCUED`, `CANCELLED`), uniform navigation rails, and modal components.
- **State Management & Offline Tolerance**: Lightweight local state persistence for volunteer and customer pickup passes to ensure retrieval even in cellular dead zones or underground markaz basements.

### 5.2 Performance & Reliability
- **Time to First Meaningful Paint (FMP)**: < 1.2s on standard broadband; responsive lightweight asset delivery optimized for 3G/4G connectivity.
- **Fault-Tolerant Verification**: 4-digit human-readable alphanumeric codes alongside QR tokens to guarantee offline counter validation.

### 5.3 Safety, Security & Compliance
- **Chain of Custody**: Immutable timestamped records for every batch transition: Listed → Reserved → Counter Collected OR Handed to Volunteer → Inspected → Received at Kitchen.
- **Data Protection**: Zero storage of unencrypted customer financial data; role-based access control (RBAC) ensuring customer PII is never exposed to external parties.

---

## 6. Key Performance Indicators (KPIs)

1. **Diversion Rate**: > 85% of all listed surplus inventory collected by customers or redistributed to charitable kitchens.
2. **Zero Waste Window**: 100% of unclaimed commercial drops transitioned to volunteer dispatch within 15 minutes of window closing.
3. **Food Safety Incident Rate**: < 0.1% rejection rate at recipient kitchen inspection gates.
4. **Civic Economic Impact**: Monthly community savings generated for Islamabad households (> PKR 2,000,000 baseline target).
5. **Environmental Impact**: Metric tons of CO₂ equivalent avoided per quarter diverted from municipal landfills.

---

## 7. Roadmap & Phasing

- **Phase 1 (Completed)**: Core UI/UX design architecture, design system specification, role selection, customer discovery & reservation flow, vendor management portal, volunteer dispatch engine, recipient triage dashboard, and administrative management console.
- **Phase 2 (Near-Term)**: Live push notifications via WhatsApp/SMS for Islamabad customers; automated Raast/OpenBanking payment settlement for merchants.
- **Phase 3 (Expansion)**: Expansion into Rawalpindi twin city sectors; cold-chain temperature telemetry sensors for bulk transit vehicles.