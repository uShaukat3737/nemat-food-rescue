// Nemat (نعمت) - Bilingual Urdu (اردو) & English (EN) Localization Engine
// Complies with FR-6: switch UI language between Urdu and English at any time

const translations = {
  en: {
    // Brand
    brandName: "Nemat",
    brandSubtitle: "Surplus Food Rescue • Islamabad",
    
    // Roles
    customer: "Customer",
    vendor: "Vendor",
    volunteer: "Volunteer",
    recipient: "Recipient Organisation",
    admin: "Admin",
    customerDesc: "Discover surplus bags from local bakeries and cafés at 50–70% off.",
    vendorDesc: "List evening surplus in seconds and turn food loss into recovered revenue.",
    volunteerDesc: "Rescue uncollected surplus and deliver to community kitchens.",
    recipientDesc: "Receive verified surplus food batches for registered shelters and kitchens.",
    adminDesc: "Manage verification, route dispatch, food safety logs, and analytics.",
    
    // Navigation
    explore: "Explore",
    map: "Map",
    myReservations: "My Reservations",
    profile: "Profile",
    dashboard: "Dashboard",
    newDrop: "New Drop",
    drops: "Drops",
    reservations: "Reservations",
    history: "History",
    impact: "Impact",
    jobs: "Jobs",
    myRuns: "My Runs",
    deliveries: "Deliveries",
    approvals: "Approvals",
    foodSafety: "Food Safety",
    analytics: "Analytics",
    auditLog: "Audit Log",
    switchRole: "Switch Role",
    
    // Common Actions
    reserveBag: "Reserve Bag",
    viewPass: "View Pickup Pass",
    verifyCode: "Verify Code",
    publishDrop: "Publish Drop",
    claimJob: "Claim Run",
    acceptDelivery: "Accept & Sign Off",
    rejectDelivery: "Reject Batch",
    approve: "Approve",
    reject: "Reject",
    reportSafety: "Report Food Safety Issue",
    saveMoney: "Save up to 70%",
    
    // Status
    live: "Live",
    reserved: "Reserved",
    collected: "Collected",
    available: "Available",
    claimed: "Claimed",
    inTransit: "In Transit",
    delivered: "Delivered",
    pending: "Pending Verification",
    
    // Islamabad
    islamabadTitle: "Islamabad Surplus Food Initiative",
    sectorsText: "F-6, F-7, F-8, Blue Area, G-9",
    withinRadius: "within 3 km",
    
    // Metrics
    mealsRescued: "Meals Rescued",
    pkrSaved: "Saved by Citizens",
    co2Saved: "CO₂e Avoided",
    activeKitchens: "Kitchens & Bakeries Live"
  },
  ur: {
    // Brand
    brandName: "نعمت",
    brandSubtitle: "بچ جانے والے کھانے کی بچت • اسلام آباد",
    
    // Roles
    customer: "صارف",
    vendor: "دکاندار",
    volunteer: "رضاکار",
    recipient: "فلاحی ادارہ",
    admin: "انتظامیہ",
    customerDesc: "اسلام آباد کی بیکریوں اور کیفے سے 50 سے 70 فیصد رعایت پر سرپرائز بیگز حاصل کریں۔",
    vendorDesc: "شام کا بچا ہوا کھانا منٹوں میں درج کریں اور ضیاع کو آمدنی میں بدلیں۔",
    volunteerDesc: "بغیر فروخت کھانا اکٹھا کر کے فلاحی کچن اور یتیم خانوں تک پہنچائیں۔",
    recipientDesc: "رجسٹرڈ پناہ گاہوں اور لنگر خانوں کے لیے تصدیق شدہ کھانا وصول کریں۔",
    adminDesc: "تصدیق، روٹ مانیٹرنگ، فوڈ سیفٹی اور اینالیٹکس کا نظم کریں۔",
    
    // Navigation
    explore: "دریافت کریں",
    map: "نقشہ",
    myReservations: "میری بکنگز",
    profile: "پروفائل",
    dashboard: "ڈیش بورڈ",
    newDrop: "نیا ڈراپ",
    drops: "ڈراپس",
    reservations: "آرڈرز",
    history: "تاریخچہ",
    impact: "ماحولیاتی اثر",
    jobs: "ریسکیو مشنز",
    myRuns: "میرے رنز",
    deliveries: "ترسیلات",
    approvals: "منظوریاں",
    foodSafety: "فوڈ سیفٹی",
    analytics: "اعداد و شمار",
    auditLog: "آڈٹ لاگ",
    switchRole: "کردار تبدیل کریں",
    
    // Common Actions
    reserveBag: "بیگ بک کریں",
    viewPass: "پک اپ پاس دیکھیں",
    verifyCode: "کوڈ کی تصدیق کریں",
    publishDrop: "ڈراپ شائع کریں",
    claimJob: "مشن قبول کریں",
    acceptDelivery: "وصولی کی تصدیق کریں",
    rejectDelivery: "بیچ مسترد کریں",
    approve: "منظور کریں",
    reject: "مسترد کریں",
    reportSafety: "فوڈ سیفٹی کی شکایت",
    saveMoney: "70٪ تک کی بچت",
    
    // Status
    live: "دستیاب",
    reserved: "محفوظ شدہ",
    collected: "وصول شدہ",
    available: "دستیاب مشن",
    claimed: "قبول شدہ",
    inTransit: "راستے میں",
    delivered: "پہنچا دیا گیا",
    pending: "زیرِ التواء تصدیق",
    
    // Islamabad
    islamabadTitle: "اسلام آباد سرپلس فوڈ ریسکیو انیشی ایٹو",
    sectorsText: "ایف-6، ایف-7، ایف-8، بلیو ایریا، جی-9",
    withinRadius: "3 کلومیٹر کے دائرے میں",
    
    // Metrics
    mealsRescued: "کھانے بچائے گئے",
    pkrSaved: "شہریوں کی بچت",
    co2Saved: "کاربن کا اخراج روکا گیا",
    activeKitchens: "فعال کچن اور بیکریاں"
  }
};

window.NematI18n = {
  t(key, lang = null) {
    const currentLang = lang || window.NematState?.get()?.language || 'en';
    const dict = translations[currentLang] || translations.en;
    return dict[key] || translations.en[key] || key;
  },
  
  applyLanguage(lang) {
    document.documentElement.lang = lang;
    if (lang === 'ur') {
      document.documentElement.dir = 'rtl';
      document.body.classList.add('font-urdu');
    } else {
      document.documentElement.dir = 'ltr';
      document.body.classList.remove('font-urdu');
    }
  }
};
