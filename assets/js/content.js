/* SIXT Thailand — bilingual section copy.
   Prose lives here, separate from data.js (which holds things with a shape
   worth validating) and from i18n.js (which holds UI chrome strings).
   Every entry must carry both `th` and `en`; tests enforce parity.

   PLACEHOLDER CONTENT: news items and FAQ answers are written as realistic
   examples, not supplied by the client. Replace before launch. */
(function (root) {
  'use strict';
  root.SIXT = root.SIXT || {};

  /* One line each, which is a copy constraint before it is a layout one: the
     column is ~437px at the widest viewport and a line of this size holds
     about 45 characters of English there. The bodies below were cut from
     roughly twice that. What went is the qualifying half of each sentence —
     "with a booking flow built to stay out of your way", "that fits your
     schedule" — and the claim itself is intact in all three.

     tests.js asserts the ceiling. Nothing here can be lengthened without
     turning the band back into two lines. */
  var VALUE_PROPS = [
    {
      id: 'booking',
      icon: 'cursor',
      th: { title: 'จองออนไลน์ง่าย', body: 'จองรถที่ต้องการได้ในไม่กี่คลิก' },
      en: { title: 'Easy Online Booking', body: 'Reserve the car you want in a few clicks.' }
    },
    {
      id: 'flexible',
      icon: 'calendar',
      th: { title: 'เลือกได้ตามการใช้งาน', body: 'รายวัน รายสัปดาห์ รายเดือน หรือระยะยาว' },
      en: { title: 'Flexible Rental Options', body: 'Daily, weekly, monthly or long-term.' }
    },
    {
      id: 'trusted',
      icon: 'shield',
      th: { title: 'บริการมาตรฐาน SIXT', body: 'มาตรฐานระดับโลก ดูแลตลอด 24 ชั่วโมง' },
      en: { title: 'Trusted SIXT Service', body: 'Global standards, care around the clock.' }
    }
  ];

  /* Hero carousel.

     The frame is 2:1. Every slide shares it under object-fit: cover, so a
     slide whose ratio drifts loses the difference off its edges — and each of
     these banners carries its headline, logos and terms baked into the
     picture.

     Measured against a 2:1 frame, per edge:
       KBank          2.00:1   exact
       banner3        1.78:1   5.6% off the top and bottom — clears the logos
                               at 8% and the date bar ending at 90%
       Banner         1.96:1   1.0% off the sides, but it is the same Thai
                               Lion Air campaign as banner3
       Xpeng G6       2.54:1  10.6% off the sides — takes the headline
       Banner 16-9    2.63:1  12.0% off the sides — takes the wordmark
     The last two stay promotion cards.

     6% per edge is the default budget, and it assumes the worst: artwork with
     its wordmark hard against the edge, which is how every banner above was
     drawn. A slide laid out with real margin can afford more, but only after
     someone has cropped the file to the frame and looked at the result — say
     so with `safeEdge` on that slide and write down what was measured. Guessing
     it defeats the check.

     Adding a slide: convert it in tools/prepare-images.py and append it here. */
  var HERO_FRAME_RATIO = 2 / 1;

  var HERO_SLIDES = [
    {
      id: 'lionair-skyline',
      image: 'assets/img/hero-lionair-skyline.webp',
      width: 2138,
      height: 1029,
      /* 2.08:1, drawn all but on the frame: cover trims 40px off each side,
         1.9%, comfortably inside the default 6% budget — so no safeEdge
         override, and no focus bias either, since nothing is cropped
         vertically and the sides lose only sky and terminal glass. */
      th: { alt: 'แคมเปญ SIXT ร่วมกับ Thai Lion Air — เช่ารถพร้อมคนขับ รับ-ส่งสนามบิน สิทธิพิเศษสำหรับผู้โดยสาร Thai Lion Air เพียงแสดงบัตรโดยสารหรือ E-Ticket ภาพ Mercedes-Benz E-Class สีขาวหน้าอาคารผู้โดยสาร มีเครื่องบิน Thai Lion Air และสกายไลน์กรุงเทพฯ เป็นฉากหลัง' },
      en: { alt: 'SIXT with Thai Lion Air — chauffeured airport transfers, a perk for Thai Lion Air passengers on showing a boarding pass or e-ticket; a white Mercedes-Benz E-Class outside the terminal, a Thai Lion Air aircraft and the Bangkok skyline behind' }
    },
    {
      id: 'kbank-domestic',
      image: 'assets/img/promo-kbank-domestic.webp',
      width: 1774,
      height: 887,
      th: { alt: 'แคมเปญ SIXT ร่วมกับ KBank — การเดินทางภายในประเทศ เช่ารถขับเอง 799 บาทต่อวัน ลีมูซีน 1,090 บาทต่อเที่ยว ส่วนลดตั๋วเครื่องบิน 300 บาท' },
      en: { alt: 'SIXT and KBank domestic travel — self-drive from ฿799 a day, limousine from ฿1,090 a trip, ฿300 off flights' }
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

  /* The three banners supplied in promotion/. Every one is 1672x941, which is
     16:9 to three decimals — the card frame's own ratio — so these fill it
     edge to edge with no letterboxing at all. The banners they replaced ran
     2.54:1 and 2:1 and could not.

     Titles and figures below are transcribed from the artwork, not written:
     each banner already states its own offer, and the card must not contradict
     the picture above it.

     `ends` is the last day the artwork itself prints. Nothing reads it yet —
     it is here because one of these three is already past it, and a date that
     lives only inside a JPEG cannot be checked by anything. */
  var PROMOS = [
    {
      id: 'ais-chauffeur',
      image: 'assets/img/promo-ais-chauffeur.jpg',
      imageSlot: 'promo-ais-chauffeur',
      ends: '2026-12-18',
      th: { title: 'เช่ารถพร้อมคนขับ รับ-ส่งสนามบิน', body: 'Toyota Camry เริ่มต้น 1,099 บาท/เที่ยว ใช้เอไอเอส พอยท์ 1 คะแนนแลกรับส่วนลด', alt: 'แบนเนอร์ SIXT ride Chauffeur ร่วมกับ AIS บริการรับส่งสนามบินพร้อมคนขับ' },
      en: { title: 'Airport Transfers with a Chauffeur', body: 'Toyota Camry from ฿1,099 a trip. Redeem a single AIS Point for the discount.', alt: 'SIXT ride Chauffeur and AIS airport transfer promotion banner' }
    },
    {
      id: 'kbank-international',
      image: 'assets/img/promo-kbank-international.jpg',
      imageSlot: 'promo-kbank-international',
      ends: '2026-03-31',
      th: { title: 'เดินทางต่างประเทศกับ KBank ลด 20%', body: 'ส่วนลด 20% เช่ารถขับเองและลีมูซีนกว่า 110 ประเทศ พร้อมคูปองมูลค่า 1,000 บาท', alt: 'แบนเนอร์ SIXT ร่วมกับ KBank สำหรับการเดินทางต่างประเทศ' },
      en: { title: '20% Off International Travel with KBank', body: '20% off self-drive and limousine hire in over 110 countries, plus a ฿1,000 coupon.', alt: 'SIXT and KBank international travel promotion banner' }
    },
    {
      id: 'mobilife-platform',
      image: 'assets/img/promo-mobilife-platform.jpg',
      imageSlot: 'promo-mobilife-platform',
      ends: null,
      th: { title: 'MOBILIFE แพลตฟอร์มใหม่', body: 'สมัครง่าย สะสมเร็ว แลกคะแนนสะดวกกว่าเดิม เชื่อมต่อสมาชิกผ่าน LINE ได้ทันที', alt: 'แบนเนอร์แพลตฟอร์มสมาชิก MOBILIFE โฉมใหม่' },
      en: { title: 'MOBILIFE, Rebuilt', body: 'Quicker to join, faster to earn and simpler to redeem. Link your membership over LINE.', alt: 'MOBILIFE membership platform relaunch banner' }
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
    HERO_FRAME_RATIO: HERO_FRAME_RATIO,
    VALUE_PROPS: VALUE_PROPS,
    FLEET_INCLUDES: FLEET_INCLUDES,
    PROMOS: PROMOS,
    SERVICES: SERVICES,
    NEWS: NEWS,
    FAQ: FAQ,
    FOOTER: FOOTER
  };
})(typeof window !== 'undefined' ? window : globalThis);
