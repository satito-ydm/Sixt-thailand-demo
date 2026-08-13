/* SIXT Thailand — structured data.
   Locations and vehicle models are taken from sixtthailand.com.
   PRICES ARE PLACEHOLDERS: the live site does not publish daily rates.
   Every price carries priceIsPlaceholder: true. Replace before launch. */
(function (root) {
  'use strict';
  root.SIXT = root.SIXT || {};

  var LOCATIONS = [
    { id: 'suvarnabhumi', group: 'bangkok',   th: 'สุวรรณภูมิ (สนามบิน)',         en: 'Suvarnabhumi Airport' },
    { id: 'ladprao',      group: 'bangkok',   th: 'ลาดพร้าว',                     en: 'Ladprao' },
    { id: 'rama-iv',      group: 'bangkok',   th: 'พระราม 4',                     en: 'Rama IV Rd.' },
    { id: 'vibhavadi',    group: 'bangkok',   th: 'วิภาวดี–ดอนเมือง',              en: 'Vibhavadi Donmueang' },
    { id: 'pattanakarn',  group: 'bangkok',   th: 'พัฒนาการ–ศรีนครินทร์',          en: 'Pattanakarn-Srinakarin' },
    { id: 'chiang-mai',   group: 'upcountry', th: 'เชียงใหม่',                     en: 'Chiang Mai' },
    { id: 'phuket-air',   group: 'upcountry', th: 'ภูเก็ต (สนามบิน)',              en: 'Phuket Airport' },
    { id: 'phuket-ic',    group: 'upcountry', th: 'ภูเก็ต (อินเตอร์คอนติเนนตัล)',  en: 'Phuket InterContinental Resort' },
    { id: 'krabi',        group: 'upcountry', th: 'กระบี่',                        en: 'Krabi' },
    { id: 'samui',        group: 'upcountry', th: 'สมุย',                          en: 'Samui' },
    { id: 'hat-yai',      group: 'upcountry', th: 'หาดใหญ่',                       en: 'Hat Yai' },
    { id: 'surat-thani',  group: 'upcountry', th: 'สุราษฎร์ธานี',                   en: 'Surat Thani' },
    { id: 'khon-kaen',    group: 'upcountry', th: 'ขอนแก่น',                       en: 'Khon Kaen' },
    { id: 'udon-thani',   group: 'upcountry', th: 'อุดรธานี',                      en: 'Udon Thani' },
    { id: 'ubon',         group: 'upcountry', th: 'อุบลราชธานี',                   en: 'Ubon Ratchathani' },
    { id: 'rayong',       group: 'upcountry', th: 'ระยอง',                         en: 'Rayong' },
    { id: 'nan',          group: 'upcountry', th: 'น่าน',                          en: 'Nan' }
  ];

  var TABS = ['compact', 'suv', 'mpv', 'premium'];
  var DEFAULT_TAB = 'premium'; /* premium is the only tab with real photography */

  var FUELS = ['petrol', 'diesel', 'hybrid', 'ev'];

  function v(id, tab, name, classTh, classEn, seats, bags, fuel, price, imageSlot, image) {
    return {
      id: id,
      tab: tab,
      name: name,
      classTh: classTh,
      classEn: classEn,
      seats: seats,
      bags: bags,
      transmission: 'auto',
      fuel: fuel,
      pricePerDay: price,
      priceIsPlaceholder: true,
      imageSlot: imageSlot,
      image: image || null
    };
  }

  var FLEET = [
    /* Premium — two real photographs */
    v('bmw-3-series', 'premium', 'BMW 3 Series', 'ซีดานพรีเมียม', 'Premium Sedan', 5, 3, 'petrol', 5900,
      'car-premium-bmw-3-series', 'assets/img/car-premium-bmw-3-series.webp'),
    v('mercedes-c-class', 'premium', 'Mercedes-Benz C-Class', 'ซีดานพรีเมียม', 'Premium Sedan', 5, 3, 'petrol', 6200,
      'car-premium-mercedes-c-class', 'assets/img/car-premium-mercedes-c-class.webp'),
    v('bmw-5-series', 'premium', 'BMW 5 Series', 'ซีดานหรู', 'Luxury Sedan', 5, 3, 'petrol', 8500,
      'car-premium-bmw-5-series'),
    v('mini-cooper-s', 'premium', 'MINI Cooper S', 'แฮตช์แบ็กพรีเมียม', 'Premium Hatchback', 4, 2, 'petrol', 4800,
      'car-premium-mini-cooper-s'),

    /* SUV — one real photograph */
    v('honda-cr-v', 'suv', 'Honda CR-V', 'เอสยูวีขนาดกลาง', 'Mid-size SUV', 5, 3, 'petrol', 3400,
      'car-suv-honda-cr-v', 'assets/img/car-suv-honda-cr-v.webp'),
    v('honda-hr-v', 'suv', 'Honda HR-V e:HEV', 'เอสยูวีขนาดเล็ก', 'Compact SUV', 5, 2, 'hybrid', 2900,
      'car-suv-honda-hr-v'),
    v('toyota-fortuner', 'suv', 'Toyota Fortuner', 'เอสยูวี 7 ที่นั่ง', 'Full-size SUV', 7, 4, 'diesel', 3800,
      'car-suv-toyota-fortuner'),
    v('bmw-x1', 'suv', 'BMW X1', 'เอสยูวีพรีเมียม', 'Premium SUV', 5, 3, 'petrol', 6500,
      'car-suv-bmw-x1'),

    /* MPV — one real photograph */
    v('toyota-veloz', 'mpv', 'Toyota Veloz', 'เอ็มพีวี 7 ที่นั่ง', 'Compact MPV', 7, 3, 'petrol', 2400,
      'car-mpv-toyota-veloz', 'assets/img/car-mpv-toyota-veloz.webp'),
    v('toyota-alphard', 'mpv', 'Toyota Alphard', 'เอ็มพีวีหรู', 'Luxury MPV', 7, 4, 'petrol', 9500,
      'car-mpv-toyota-alphard'),
    v('toyota-commuter', 'mpv', 'Toyota Commuter', 'รถตู้', 'Passenger Van', 13, 8, 'diesel', 4200,
      'car-mpv-toyota-commuter'),
    v('peugeot-5008', 'mpv', 'Peugeot 5008', 'เอ็มพีวี 7 ที่นั่ง', 'Seven-seat MPV', 7, 4, 'petrol', 3600,
      'car-mpv-peugeot-5008'),

    /* Compact — no real photography yet */
    v('toyota-yaris', 'compact', 'Toyota Yaris', 'แฮตช์แบ็กประหยัด', 'Economy Hatchback', 4, 2, 'petrol', 1500,
      'car-compact-toyota-yaris'),
    v('honda-city', 'compact', 'Honda City', 'ซีดานประหยัด', 'Economy Sedan', 5, 2, 'petrol', 1600,
      'car-compact-honda-city'),
    v('toyota-altis', 'compact', 'Toyota Altis', 'ซีดานคอมแพ็กต์', 'Compact Sedan', 5, 3, 'petrol', 2000,
      'car-compact-toyota-altis'),
    v('honda-civic', 'compact', 'Honda Civic', 'ซีดานคอมแพ็กต์', 'Compact Sedan', 5, 3, 'petrol', 2300,
      'car-compact-honda-civic')
  ];

  /* The cheapest vehicle in a tab earns the "best deal" flag. Derived from the
     price data rather than hand-set, so it cannot go stale. */
  function cheapestIn(tab) {
    return FLEET
      .filter(function (item) { return item.tab === tab; })
      .reduce(function (lowest, item) {
        return !lowest || item.pricePerDay < lowest.pricePerDay ? item : lowest;
      }, null);
  }

  function fleetByTab(tab) {
    return FLEET.filter(function (item) { return item.tab === tab; });
  }

  function locationsByGroup(group) {
    return LOCATIONS.filter(function (item) { return item.group === group; });
  }

  function findLocation(id) {
    var i;
    for (i = 0; i < LOCATIONS.length; i++) {
      if (LOCATIONS[i].id === id) { return LOCATIONS[i]; }
    }
    return undefined;
  }

  root.SIXT.data = {
    LOCATIONS: LOCATIONS,
    FLEET: FLEET,
    TABS: TABS,
    FUELS: FUELS,
    DEFAULT_TAB: DEFAULT_TAB,
    cheapestIn: cheapestIn,
    fleetByTab: fleetByTab,
    locationsByGroup: locationsByGroup,
    findLocation: findLocation
  };
})(typeof window !== 'undefined' ? window : globalThis);
