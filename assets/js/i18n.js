/* SIXT Thailand — translation engine and UI chrome dictionary.
   Section prose lives in content.js; this file holds labels, buttons and
   messages. Thai is the default. Both dictionaries must hold the same keys —
   tests enforce parity.

   Never translated: "Drive Your Way", "SIXT Thailand Membership", and all
   vehicle brand and model names. */
(function (root) {
  'use strict';
  root.SIXT = root.SIXT || {};

  var STORAGE_KEY = 'sixtLang';
  var DEFAULT_LANG = 'th';

  var dict = {
    th: {
      'a11y.skip': 'ข้ามไปยังเนื้อหาหลัก',
      'a11y.openMenu': 'เปิดเมนู',
      'a11y.closeMenu': 'ปิดเมนู',
      'a11y.hero': 'แบนเนอร์แคมเปญ SIXT',

      'top.hotline': 'โทร 1798',
      'top.hotlineAria': 'โทรหาศูนย์บริการลูกค้า 1798',

      'nav.manageBooking': 'จัดการการจอง',
      'nav.vehicles': 'รถยนต์',
      'nav.subscription': 'เช่ารถรายเดือน',
      'nav.contact': 'ติดต่อเรา',
      'nav.login': 'เข้าสู่ระบบ / สมัครสมาชิก',
      'hero.carousel': 'แคมเปญโปรโมชัน',
      'hero.slideOf': 'สไลด์ {n} จาก {total}',
      'hero.prev': 'สไลด์ก่อนหน้า',
      'hero.next': 'สไลด์ถัดไป',
      'booking.subtitle': 'เลือกสถานที่และวันที่ด้านล่าง เพื่อค้นหารถที่ว่างในพื้นที่ของคุณ',
      'booking.locationLabel': 'สถานที่รับรถ',
      'booking.locationPlaceholder': 'พิมพ์ชื่อเมือง สนามบิน หรือสาขา',
      'booking.differentReturn': '+ คืนรถคนละที่',
      'booking.sameReturn': '− คืนรถที่เดิม',
      'booking.returnLocationLabel': 'สถานที่คืนรถ',
      'booking.pickupDate': 'วันที่รับรถ',
      'booking.pickupTime': 'เวลารับรถ',
      'booking.returnDate': 'วันที่คืนรถ',
      'booking.returnTime': 'เวลาคืนรถ',
      'booking.submit': 'ค้นหารถที่ว่าง',
      'booking.edit': 'แก้ไข',
      'booking.noMatch': 'ไม่พบสาขาที่ตรงกับคำค้นหา',
      'booking.summaryDays': '{n} วัน',

      'booking.err.pickupLocationRequired': 'กรุณาเลือกสถานที่รับรถ',
      'booking.err.returnLocationRequired': 'กรุณาเลือกสถานที่คืนรถ',
      'booking.err.pickupDateRequired': 'กรุณาเลือกวันที่รับรถ',
      'booking.err.returnDateRequired': 'กรุณาเลือกวันที่คืนรถ',
      'booking.err.returnBeforePickup': 'วันที่คืนรถต้องไม่ก่อนวันที่รับรถ',
      'booking.err.returnTimeBeforePickup': 'หากคืนรถวันเดียวกัน เวลาคืนต้องหลังเวลารับ',

      'group.bangkok': 'กรุงเทพฯ',
      'group.upcountry': 'ต่างจังหวัด',

      'promo.title': 'โปรโมชันล่าสุด',
      'promo.viewAll': 'ดูโปรโมชันทั้งหมด',
      'promo.viewDetail': 'ดูรายละเอียดโปรโมชัน',
      'promo.carousel': 'แบนเนอร์โปรโมชัน',
      'promo.slideOf': 'โปรโมชัน {n} จาก {total}',
      'promo.prev': 'โปรโมชันก่อนหน้า',
      'promo.next': 'โปรโมชันถัดไป',

      'fleet.title': 'ค้นหารถที่ใช่',
      'fleet.tab.compact': 'Compact',
      'fleet.tab.suv': 'SUV',
      'fleet.tab.mpv': 'MPV',
      'fleet.tab.premium': 'Premium',
      'fleet.perDay': '/วัน',
      'fleet.seats': 'ที่นั่ง',
      'fleet.bags': 'กระเป๋า',
      'fleet.auto': 'ออโต้',
      'fleet.viewCar': 'ดูรถคันนี้',
      'fleet.viewAll': 'ดูรถทั้งหมด',
      'fleet.prev': 'เลื่อนดูรถก่อนหน้า',
      'fleet.next': 'เลื่อนดูรถถัดไป',
      'fleet.priceNote': 'ราคาเป็นตัวอย่าง รอเรตจริงจาก SIXT',
      'fleet.standInFull': 'ภาพนี้เป็นรถรุ่นอื่น ใช้ชั่วคราวระหว่างรอภาพจริง',
      'fleet.total': 'รวม',
      'fleet.forDays': '{n} วัน',
      'fuel.petrol': 'เบนซิน',
      'fuel.diesel': 'ดีเซล',
      'fuel.hybrid': 'ไฮบริด',
      'fuel.ev': 'ไฟฟ้า',

      'services.title': 'บริการของเรา',

      'member.artAlt': 'บัตรสมาชิก SIXT Thailand ลอยอยู่เหนือรถสามคัน — Honda CR-V สีขาว, Mercedes-Benz สีดำ และ BMW สีส้ม บนถนนยามค่ำคืนโดยมีเส้นขอบฟ้าเมืองเป็นฉากหลัง บนบัตรเขียนว่า MEMBER — EXPERIENCE MORE EXPERIENCE SIXT พร้อมสิทธิประโยชน์สี่ข้อ ได้แก่ ข้อเสนอพิเศษเฉพาะสมาชิก สะสมคะแนน จองก่อนใคร และบริการระดับ VIP',
      'member.title': 'SIXT Thailand Membership',
      'member.body': 'ปลดล็อกสิทธิพิเศษ ช่องทางรับรถแบบเร่งด่วน และบริการที่ออกแบบมาเพื่อการเดินทางของคุณทั้งในไทยและทั่วโลก',
      'member.cta': 'สมัครสมาชิกเลย',
      'member.have': 'เป็นสมาชิกอยู่แล้ว?',
      'member.login': 'เข้าสู่ระบบที่นี่',

      'news.title': 'ข่าวสารและกิจกรรม',
      'news.lead': 'ติดตามประกาศล่าสุด ข้อมูลการเดินทาง และเรื่องราวจากชุมชนของเราทั่วประเทศไทย',
      'news.viewAll': 'ดูข่าวทั้งหมด',

      'faq.title': 'คำถามที่พบบ่อย',
      'faq.lead': 'คำตอบชัดเจนเรื่องเงินมัดจำ การขับข้ามพรมแดน และแนวปฏิบัติสำหรับผู้ขับขี่',
      'faq.viewAll': 'ดู FAQ ทั้งหมด',

      'footer.copyright': '© 2026 SIXT Thailand / Master Car Rental สงวนลิขสิทธิ์',
      'footer.operated': 'ดำเนินการโดย Master Car Rental (เครือ MGC-Asia) ร่วมกับ SIXT Germany ก่อตั้งปี 1912 ให้บริการกว่า 100 ประเทศ',
      'footer.iso': 'ได้รับการรับรอง ISO 9001 (SGS/UKAS)',
      'footer.hotlineLabel': 'บริการลูกค้า',
      'footer.langLabel': 'เลือกภาษา',

      'lang.th': 'ไทย (TH)',
      'lang.en': 'English (EN)'
    },

    en: {
      'a11y.skip': 'Skip to main content',
      'a11y.openMenu': 'Open menu',
      'a11y.closeMenu': 'Close menu',
      'a11y.hero': 'SIXT campaign banner',

      'top.hotline': 'Call 1798',
      'top.hotlineAria': 'Call customer service on 1798',

      'nav.manageBooking': 'Manage Booking',
      'nav.vehicles': 'Vehicles',
      'nav.subscription': 'Car Subscription',
      'nav.contact': 'Contact',
      'nav.login': 'Login / Register',
      'hero.carousel': 'Promotional campaigns',
      'hero.slideOf': 'Slide {n} of {total}',
      'hero.prev': 'Previous slide',
      'hero.next': 'Next slide',
      'booking.subtitle': 'Select your location and dates below to search available vehicles in your area',
      'booking.locationLabel': 'Pick-up location',
      'booking.locationPlaceholder': 'Enter city, airport or branch',
      'booking.differentReturn': '+ Different return location',
      'booking.sameReturn': '− Return to the same place',
      'booking.returnLocationLabel': 'Return location',
      'booking.pickupDate': 'Pick-up date',
      'booking.pickupTime': 'Pick-up time',
      'booking.returnDate': 'Return date',
      'booking.returnTime': 'Return time',
      'booking.submit': 'Search Available Car',
      'booking.edit': 'Edit',
      'booking.noMatch': 'No branch matches that search',
      'booking.summaryDays': '{n} days',

      'booking.err.pickupLocationRequired': 'Please choose a pick-up location',
      'booking.err.returnLocationRequired': 'Please choose a return location',
      'booking.err.pickupDateRequired': 'Please choose a pick-up date',
      'booking.err.returnDateRequired': 'Please choose a return date',
      'booking.err.returnBeforePickup': 'The return date cannot be before the pick-up date',
      'booking.err.returnTimeBeforePickup': 'For a same-day return, the return time must be later',

      'group.bangkok': 'Bangkok',
      'group.upcountry': 'Upcountry',

      'promo.title': 'Latest Promotions',
      'promo.viewAll': 'View All Promotions',
      'promo.viewDetail': 'See promotion details',
      'promo.carousel': 'Promotion banners',
      'promo.slideOf': 'Promotion {n} of {total}',
      'promo.prev': 'Previous promotion',
      'promo.next': 'Next promotion',

      'fleet.title': 'Find the Right Car',
      'fleet.tab.compact': 'Compact',
      'fleet.tab.suv': 'SUV',
      'fleet.tab.mpv': 'MPV',
      'fleet.tab.premium': 'Premium',
      'fleet.perDay': '/day',
      'fleet.seats': 'seats',
      'fleet.bags': 'bags',
      'fleet.auto': 'Auto',
      'fleet.viewCar': 'View this car',
      'fleet.viewAll': 'View all cars',
      'fleet.prev': 'Scroll to previous cars',
      'fleet.next': 'Scroll to next cars',
      'fleet.priceNote': 'Indicative pricing — awaiting live SIXT rates',
      'fleet.standInFull': 'This photograph shows a different model, used while the real one is pending',
      'fleet.total': 'total',
      'fleet.forDays': '{n} days',
      'fuel.petrol': 'Petrol',
      'fuel.diesel': 'Diesel',
      'fuel.hybrid': 'Hybrid',
      'fuel.ev': 'Electric',

      'services.title': 'Our Services',

      'member.artAlt': 'A SIXT Thailand membership card above three cars — a white Honda CR-V, a black Mercedes-Benz and an orange BMW — on a night road against a city skyline. The card reads MEMBER, Experience more, experience SIXT, and lists four benefits: exclusive offers, earn points, priority booking and VIP treatment.',
      'member.title': 'SIXT Thailand Membership',
      'member.body': 'Unlock exclusive status, priority counter service and benefits shaped around your journeys in Thailand and worldwide.',
      'member.cta': 'Join Membership Now',
      'member.have': 'Already have an account?',
      'member.login': 'Log in here',

      'news.title': 'News & Events',
      'news.lead': 'Stay informed with our latest announcements, travel updates and local community stories across Thailand.',
      'news.viewAll': 'View All News',

      'faq.title': 'Frequently Asked Questions',
      'faq.lead': 'Clear answers on security deposits, cross-border travel rules and driver guidelines.',
      'faq.viewAll': 'View All FAQs',

      'footer.copyright': '© 2026 SIXT Thailand / Master Car Rental. All rights reserved.',
      'footer.operated': 'Operated by Master Car Rental (MGC-Asia Group) in partnership with SIXT Germany, founded 1912 and serving over 100 countries.',
      'footer.iso': 'ISO 9001 certified (SGS/UKAS)',
      'footer.hotlineLabel': 'Customer service',
      'footer.langLabel': 'Choose language',

      'lang.th': 'ไทย (TH)',
      'lang.en': 'English (EN)'
    }
  };

  var TH_MONTHS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
                   'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  var EN_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  var current = DEFAULT_LANG;

  function t(key, vars) {
    var table = dict[current] || dict[DEFAULT_LANG];
    var value = table[key];
    if (value === undefined) {
      value = dict[DEFAULT_LANG][key];
      if (value === undefined) {
        if (typeof console !== 'undefined') {
          console.warn('[i18n] missing key: ' + key);
        }
        return key;
      }
      if (typeof console !== 'undefined') {
        console.warn('[i18n] missing "' + current + '" translation, fell back to th: ' + key);
      }
    }
    if (vars) {
      Object.keys(vars).forEach(function (name) {
        value = value.replace('{' + name + '}', vars[name]);
      });
    }
    return value;
  }

  /* Parsed by hand on purpose. new Date('2026-08-15') is read as UTC midnight
     and renders as the 14th in negative-offset locales. */
  function parseISO(iso) {
    var parts = String(iso).split('-');
    return { y: Number(parts[0]), m: Number(parts[1]) - 1, d: Number(parts[2]) };
  }

  function months(lang) {
    return lang === 'en' ? EN_MONTHS : TH_MONTHS;
  }

  function year(y, lang) {
    return lang === 'en' ? y : y + 543; /* Thai dates use the Buddhist era */
  }

  function formatDate(iso, lang) {
    var l = lang || current;
    var p = parseISO(iso);
    return p.d + ' ' + months(l)[p.m] + ' ' + year(p.y, l);
  }

  function formatDateRange(isoA, isoB, lang) {
    var l = lang || current;
    var a = parseISO(isoA);
    var b = parseISO(isoB);
    var M = months(l);
    if (a.y === b.y && a.m === b.m) {
      return a.d + '–' + b.d + ' ' + M[a.m] + ' ' + year(a.y, l);
    }
    if (a.y === b.y) {
      return a.d + ' ' + M[a.m] + ' – ' + b.d + ' ' + M[b.m] + ' ' + year(b.y, l);
    }
    return a.d + ' ' + M[a.m] + ' ' + year(a.y, l) +
           ' – ' + b.d + ' ' + M[b.m] + ' ' + year(b.y, l);
  }

  /* Inclusive day count, matching how Thai rental listings quote duration:
     15–16 Aug reads as 2 days. This is a display figure only; real SIXT
     billing uses 24-hour periods and must be reconciled at integration. */
  function rentalDays(isoA, isoB) {
    var a = parseISO(isoA);
    var b = parseISO(isoB);
    var ms = Date.UTC(b.y, b.m, b.d) - Date.UTC(a.y, a.m, a.d);
    return Math.max(1, Math.round(ms / 86400000) + 1);
  }

  function formatPrice(value) {
    return '฿' + String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  function getLang() { return current; }

  function setLang(lang) {
    current = dict[lang] ? lang : DEFAULT_LANG;
    if (typeof localStorage !== 'undefined') {
      try { localStorage.setItem(STORAGE_KEY, current); } catch (e) { /* private mode */ }
    }
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('lang', current);
      applyTo(document);
      document.dispatchEvent(new CustomEvent('sixt:langchange', { detail: { lang: current } }));
    }
    return current;
  }

  function restore() {
    var saved = null;
    if (typeof localStorage !== 'undefined') {
      try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) { saved = null; }
    }
    return setLang(saved || DEFAULT_LANG);
  }

  /* Swaps every [data-i18n] node's text, and every [data-i18n-attr] node's
     attribute. Format: data-i18n-attr="placeholder:booking.locationPlaceholder"
     with multiple pairs separated by a comma. */
  function applyTo(scope) {
    if (typeof document === 'undefined') { return; }
    var rootEl = scope || document;

    Array.prototype.forEach.call(rootEl.querySelectorAll('[data-i18n]'), function (el) {
      el.textContent = t(el.getAttribute('data-i18n'));
    });

    Array.prototype.forEach.call(rootEl.querySelectorAll('[data-i18n-attr]'), function (el) {
      el.getAttribute('data-i18n-attr').split(',').forEach(function (pair) {
        var bits = pair.split(':');
        if (bits.length === 2) {
          el.setAttribute(bits[0].trim(), t(bits[1].trim()));
        }
      });
    });
  }

  root.SIXT.i18n = {
    dict: dict,
    DEFAULT_LANG: DEFAULT_LANG,
    STORAGE_KEY: STORAGE_KEY,
    t: t,
    getLang: getLang,
    setLang: setLang,
    restore: restore,
    applyTo: applyTo,
    formatDate: formatDate,
    formatDateRange: formatDateRange,
    rentalDays: rentalDays,
    formatPrice: formatPrice
  };
})(typeof window !== 'undefined' ? window : globalThis);
