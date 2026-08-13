/* SIXT Thailand — bilingual section copy.
   Prose lives here, separate from data.js (which holds things with a shape
   worth validating) and from i18n.js (which holds UI chrome strings).
   Every entry must carry both `th` and `en`; tests enforce parity.

   PLACEHOLDER CONTENT: news items and FAQ answers are written as realistic
   examples, not supplied by the client. Replace before launch. */
(function (root) {
  'use strict';
  root.SIXT = root.SIXT || {};

  var VALUE_PROPS = [
    {
      id: 'booking',
      icon: 'cursor',
      th: { title: 'จองออนไลน์ง่าย', body: 'จองรถที่ต้องการได้ในไม่กี่คลิกผ่านระบบที่ออกแบบมาให้เรียบง่าย' },
      en: { title: 'Easy Online Booking', body: 'Reserve the car you want in just a few clicks with a booking flow built to stay out of your way.' }
    },
    {
      id: 'flexible',
      icon: 'calendar',
      th: { title: 'เลือกได้ตามการใช้งาน', body: 'เช่ารายวัน รายสัปดาห์ รายเดือน หรือแบบสมัครสมาชิกระยะยาว' },
      en: { title: 'Flexible Rental Options', body: 'Choose daily, weekly, monthly or a long-term subscription that fits your schedule.' }
    },
    {
      id: 'trusted',
      icon: 'shield',
      th: { title: 'บริการมาตรฐาน SIXT', body: 'มาตรฐานระดับโลกพร้อมทีมดูแลลูกค้าตลอด 24 ชั่วโมง' },
      en: { title: 'Trusted SIXT Service', body: 'Global standards backed by a customer care team available around the clock.' }
    }
  ];

  /* Hero carousel.
     Every slide shares one frame, so their aspect ratios have to be close or
     `cover` eats the artwork. These two are 2.63:1 and 2.54:1 — a 1.7% trim
     per side, which clears all the baked-in type. The KBank banner is 2:1 and
     would lose 11.5% off the top and bottom, taking both logos and the date
     line with it, so it stays a promotion card instead.
     Adding a slide: convert it in tools/prepare-images.py and append here. */
  var HERO_SLIDES = [
    {
      id: 'lionair-camry',
      image: 'assets/img/hero-lionair-camry.webp',
      width: 2035,
      height: 773,
      th: { alt: 'แคมเปญ SIXT ร่วมกับ Thai Lion Air — เช่ารถพร้อมคนขับ รับส่งสนามบิน เริ่มต้น 1,099 บาทต่อเที่ยว กับ Toyota Camry' },
      en: { alt: 'SIXT and Thai Lion Air — chauffeured airport transfers from ฿1,099 a trip in a Toyota Camry' }
    },
    {
      id: 'xpeng-g6',
      image: 'assets/img/promo-xpeng-g6.webp',
      width: 1600,
      height: 630,
      th: { alt: 'Xpeng G6 สีส้มวิ่งบนถนน พร้อมข้อความ Experience the Future — Rent the Xpeng G6' },
      en: { alt: 'Orange Xpeng G6 on the road with the headline Experience the Future — Rent the Xpeng G6' }
    }
  ];

  /* Shown on every vehicle card. PLACEHOLDER TERMS: these are plausible for a
     Thai rental but have not been confirmed against SIXT Thailand's actual
     rental agreement. They are contractual claims, so verify before launch. */
  var FLEET_INCLUDES = [
    { id: 'insurance', th: 'รวมประกันภัยพื้นฐาน', en: 'Basic insurance included' },
    { id: 'roadside',  th: 'ช่วยเหลือฉุกเฉิน 24 ชม.', en: '24h roadside assistance' },
    { id: 'mileage',   th: 'ไมล์ไม่จำกัด',           en: 'Unlimited kilometres' }
  ];
  FLEET_INCLUDES.isPlaceholder = true;

  var PROMOS = [
    {
      id: 'xpeng-g6',
      image: 'assets/img/promo-xpeng-g6.webp',
      imageSlot: 'promo-xpeng-g6',
      th: { title: 'Xpeng G6 — สัมผัสอนาคตแห่งการขับขี่', body: 'รถยนต์ไฟฟ้ารุ่นใหม่ล่าสุดพร้อมให้เช่าแล้ววันนี้ ขับสนุก เงียบ และประหยัดกว่าที่เคย', alt: 'Xpeng G6 สีส้มวิ่งบนถนน พร้อมข้อความ Experience the Future' },
      en: { title: 'Xpeng G6 — Experience the Future', body: 'Our newest electric SUV is available to rent today. Quiet, quick and cheaper to run.', alt: 'Orange Xpeng G6 on the road with the headline Experience the Future' }
    },
    {
      id: 'kbank-domestic',
      image: 'assets/img/promo-kbank-domestic.webp',
      imageSlot: 'promo-kbank-domestic',
      th: { title: 'เที่ยวในประเทศกับ KBank เริ่ม 799 บาท/วัน', body: 'เช่ารถขับเอง 799 บาท/วัน · ลีมูซีน 1,090 บาท/เที่ยว · ส่วนลดตั๋วเครื่องบิน 300 บาท', alt: 'แบนเนอร์โปรโมชัน SIXT ร่วมกับ KBank สำหรับการเดินทางภายในประเทศ' },
      en: { title: 'Domestic Travel with KBank from ฿799/day', body: 'Self-drive from ฿799 a day, limousine transfers from ฿1,090 a trip, plus ฿300 off flights.', alt: 'SIXT and KBank domestic travel promotion banner' }
    },
    {
      id: 'promo-slot-3',
      image: null,
      imageSlot: 'promo-slot-3',
      th: { title: 'โปรโมชันถัดไป', body: 'พื้นที่สำหรับแคมเปญใบที่สาม รอไฟล์ภาพและรายละเอียดจากทีมการตลาด', alt: '' },
      en: { title: 'Next Campaign', body: 'Reserved for a third campaign. Awaiting artwork and copy from the marketing team.', alt: '' }
    }
  ];

  var SERVICES = [
    {
      id: 'self-drive',
      image: null,
      imageSlot: 'service-self-drive',
      variant: 'primary',
      th: { title: 'ขับเอง', body: 'ควบคุมการเดินทางได้เต็มที่ด้วยรถเช่าระยะสั้นที่ยืดหยุ่นตามแผนของคุณ', cta: 'เช่ารถ' },
      en: { title: 'Self-Drive', body: 'Take full control of your journey with flexible short-term personal rentals.', cta: 'Rent a Car' }
    },
    {
      id: 'limousine',
      image: null,
      imageSlot: 'service-limousine',
      variant: 'secondary',
      th: { title: 'ลีมูซีนพร้อมคนขับ', body: 'เดินทางอย่างมืออาชีพกับบริการรถพร้อมคนขับที่ผ่านการอบรมมาตรฐาน SIXT', cta: 'ดูบริการลีมูซีน' },
      en: { title: 'Limousine', body: 'Travel in professional style with our trained, dedicated chauffeur service.', cta: 'Explore Limousine' }
    },
    {
      id: 'subscription',
      image: null,
      imageSlot: 'service-subscription',
      variant: 'secondary',
      th: { title: 'เช่ารถรายเดือน', body: 'ทางเลือกแทนการเช่าซื้อ จ่ายรายเดือนครบจบในราคาเดียว เปลี่ยนรุ่นรถได้', cta: 'ดูแพ็กเกจรายเดือน' },
      en: { title: 'Car Subscription', body: 'An all-inclusive monthly alternative to traditional leasing, with the freedom to switch models.', cta: 'Explore Subscription' }
    }
  ];

  var NEWS = [
    {
      id: 'ev-fleet',
      date: '2026-10-12',
      image: null,
      imageSlot: 'news-ev-fleet',
      th: { title: 'SIXT ขยายฟลีตรถยนต์ไฟฟ้าในกรุงเทพฯ', body: 'เพิ่มรถ SUV ไฟฟ้าระยะทางไกลเข้าสู่คลาสรถพรีเมียม เปิดให้จองโดยตรงผ่านเว็บไซต์แล้ววันนี้' },
      en: { title: 'SIXT Expands Its Electric Fleet in Bangkok', body: 'Long-range electric SUVs join the premium class and are now bookable directly on the website.' }
    },
    {
      id: 'chiang-mai-counter',
      date: '2026-09-28',
      image: null,
      imageSlot: 'news-chiang-mai',
      th: { title: 'เปิดเคาน์เตอร์ใหม่ที่สนามบินเชียงใหม่', body: 'รับรถได้เร็วขึ้นด้วยขั้นตอนเอกสารแบบดิจิทัลเต็มรูปแบบที่เคาน์เตอร์แห่งใหม่ของเรา' },
      en: { title: 'New Airport Counter Opens in Chiang Mai', body: 'Faster pickups with fully paperless digital onboarding at our newest northern counter.' }
    },
    {
      id: 'southern-routes',
      date: '2026-08-15',
      image: null,
      imageSlot: 'news-southern-routes',
      th: { title: 'เส้นทางขับรถเที่ยวชายฝั่งภาคใต้', body: 'แนะนำจุดแวะพัก ที่เที่ยวที่คนยังไม่ค่อยรู้จัก และรุ่นรถที่เหมาะกับเส้นทางเลียบทะเล' },
      en: { title: 'Road Trip Guide: Southern Coastal Routes', body: 'Recommended stopovers, lesser-known spots and the vehicle classes best suited to seaside driving.' }
    }
  ];

  var FAQ = [
    {
      id: 'documents',
      th: {
        q: 'ต้องใช้เอกสารอะไรบ้างในการรับรถ?',
        a: 'ผู้เช่าต้องแสดงใบขับขี่ที่ยังไม่หมดอายุ บัตรประชาชนหรือหนังสือเดินทาง และบัตรเครดิตในชื่อผู้เช่าสำหรับวางมัดจำ ผู้ขับขี่ชาวต่างชาติควรมีใบขับขี่สากลควบคู่กับใบขับขี่ของประเทศตนเอง'
      },
      en: {
        q: 'What documents are required to pick up my rental vehicle?',
        a: 'Bring a valid driving licence, your national ID card or passport, and a credit card in the main driver’s name for the deposit. Overseas drivers should also carry an International Driving Permit alongside their home licence.'
      }
    },
    {
      id: 'deposit',
      th: {
        q: 'เงินมัดจำเท่าไหร่ และได้คืนเมื่อไหร่?',
        a: 'ยอดมัดจำขึ้นอยู่กับคลาสของรถ โดยจะกันวงเงินไว้บนบัตรเครดิตในวันรับรถ ไม่ใช่การตัดเงินจริง วงเงินจะถูกปลดหลังคืนรถและตรวจสภาพเรียบร้อย โดยทั่วไปใช้เวลา 7–14 วันทำการขึ้นอยู่กับธนาคารผู้ออกบัตร'
      },
      en: {
        q: 'How much is the security deposit and when is it released?',
        a: 'The amount depends on the vehicle class and is held against your credit card at pickup rather than charged. The hold is released once the car has been returned and inspected, typically within 7–14 business days depending on your card issuer.'
      }
    },
    {
      id: 'cross-border',
      th: {
        q: 'นำรถเช่าขับข้ามประเทศได้หรือไม่?',
        a: 'การนำรถออกนอกประเทศไทยต้องได้รับอนุญาตเป็นลายลักษณ์อักษรล่วงหน้า และมีเงื่อนไขเพิ่มเติมด้านประกันภัยและเอกสารศุลกากร กรุณาติดต่อฝ่ายบริการลูกค้าที่ 1798 ก่อนวันเดินทางอย่างน้อย 14 วัน'
      },
      en: {
        q: 'Can I drive the rental vehicle across international borders?',
        a: 'Taking a vehicle out of Thailand requires written approval in advance and carries additional insurance and customs requirements. Please contact customer service on 1798 at least 14 days before you travel.'
      }
    },
    {
      id: 'cancellation',
      th: {
        q: 'นโยบายยกเลิกเป็นอย่างไรหากเที่ยวบินล่าช้า?',
        a: 'การจองที่ยกเลิกล่วงหน้าอย่างน้อย 48 ชั่วโมงจะได้รับเงินคืนเต็มจำนวน หากเที่ยวบินล่าช้าและคุณแจ้งหมายเลขเที่ยวบินไว้ตอนจอง เราจะถือรถไว้ให้โดยไม่คิดค่าใช้จ่ายเพิ่ม'
      },
      en: {
        q: 'What is the cancellation policy if my flight is delayed?',
        a: 'Bookings cancelled at least 48 hours ahead are fully refunded. If your flight is delayed and you supplied the flight number when booking, we hold your vehicle at no extra charge.'
      }
    }
  ];

  var FOOTER = [
    {
      id: 'services',
      th: 'บริการ', en: 'Services',
      links: [
        { th: 'เช่ารถรายวัน',      en: 'Daily Car Rental' },
        { th: 'รถพร้อมคนขับ',      en: 'Chauffeur Service' },
        { th: 'บริการลีมูซีน',      en: 'Limousine Service' },
        { th: 'รับส่งสนามบิน',      en: 'Airport Transfer' },
        { th: 'ลูกค้าองค์กร',       en: 'Corporate Fleet' }
      ]
    },
    {
      id: 'explore',
      th: 'สำรวจ', en: 'Explore',
      links: [
        { th: 'สาขาทั้งหมด',       en: 'Our Locations' },
        { th: 'โปรโมชัน',          en: 'Special Deals' },
        { th: 'ฟลีตรถยนต์',        en: 'Fleet Overview' },
        { th: 'คู่มือการเดินทาง',   en: 'Travel Guides' },
        { th: 'โปรแกรมพันธมิตร',   en: 'Partner Program' }
      ]
    },
    {
      id: 'support',
      th: 'ช่วยเหลือ', en: 'Support',
      links: [
        { th: 'ติดต่อเรา',         en: 'Contact Center' },
        { th: 'ช่วยเหลือ & FAQ',   en: 'Help & FAQs' },
        { th: 'แจ้งความเสียหาย',    en: 'Damage Reports' },
        { th: 'ประกันภัย',         en: 'Insurance Details' },
        { th: 'แผนผังเว็บไซต์',     en: 'Sitemap' }
      ]
    },
    {
      id: 'membership',
      th: 'สมาชิก', en: 'Membership',
      links: [
        { th: 'SIXT Membership',  en: 'SIXT Membership' },
        { th: 'Silver Tier',      en: 'Silver Tier' },
        { th: 'Gold Tier',        en: 'Gold Tier' },
        { th: 'Platinum Tier',    en: 'Platinum Tier' },
        { th: 'พันธมิตร',          en: 'Partner Programs' }
      ]
    },
    {
      id: 'legal',
      th: 'ข้อกำหนด', en: 'Legal',
      links: [
        { th: 'ข้อกำหนดและเงื่อนไข',   en: 'Terms & Conditions' },
        { th: 'นโยบายความเป็นส่วนตัว', en: 'Privacy Policy' },
        { th: 'การตั้งค่าคุกกี้',       en: 'Cookie Settings' },
        { th: 'Imprint',              en: 'Imprint' },
        { th: 'ระเบียบการเช่า',        en: 'Rental Guidelines' }
      ]
    }
  ];

  root.SIXT.content = {
    HERO_SLIDES: HERO_SLIDES,
    VALUE_PROPS: VALUE_PROPS,
    FLEET_INCLUDES: FLEET_INCLUDES,
    PROMOS: PROMOS,
    SERVICES: SERVICES,
    NEWS: NEWS,
    FAQ: FAQ,
    FOOTER: FOOTER
  };
})(typeof window !== 'undefined' ? window : globalThis);
