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
      'car-premium-bmw-3-series', 'assets/img/car-premium-bmw-3-series.jpg'),
    v('mercedes-c-class', 'premium', 'Mercedes-Benz C-Class', 'ซีดานพรีเมียม', 'Premium Sedan', 5, 3, 'petrol', 6200,
      'car-premium-mercedes-c-class', 'assets/img/car-premium-mercedes-c-class.jpg'),
    v('bmw-5-series', 'premium', 'BMW 5 Series', 'ซีดานหรู', 'Luxury Sedan', 5, 3, 'petrol', 8500,
      'car-premium-bmw-5-series'),
    v('mini-cooper-s', 'premium', 'MINI Cooper S', 'แฮตช์แบ็กพรีเมียม', 'Premium Hatchback', 4, 2, 'petrol', 4800,
      'car-premium-mini-cooper-s'),
    v('mercedes-e-class', 'premium', 'Mercedes-Benz E-Class', 'ซีดานหรู', 'Luxury Sedan', 5, 3, 'petrol', 9800,
      'car-premium-mercedes-e-class'),
    v('volvo-s60', 'premium', 'Volvo S60 Recharge', 'ซีดานพรีเมียมปลั๊กอินไฮบริด', 'Premium Plug-in Hybrid Sedan', 5, 3, 'hybrid', 6800,
      'car-premium-volvo-s60'),

    /* SUV — one real photograph */
    v('honda-cr-v', 'suv', 'Honda CR-V', 'เอสยูวีขนาดกลาง', 'Mid-size SUV', 5, 3, 'petrol', 3400,
      'car-suv-honda-cr-v'),
    v('honda-hr-v', 'suv', 'Honda HR-V e:HEV', 'เอสยูวีขนาดเล็ก', 'Compact SUV', 5, 2, 'hybrid', 2900,
      'car-suv-honda-hr-v'),
    v('toyota-fortuner', 'suv', 'Toyota Fortuner', 'เอสยูวี 7 ที่นั่ง', 'Full-size SUV', 7, 4, 'diesel', 3800,
      'car-suv-toyota-fortuner'),
    v('bmw-x1', 'suv', 'BMW X1', 'เอสยูวีพรีเมียม', 'Premium SUV', 5, 3, 'petrol', 6500,
      'car-suv-bmw-x1'),
    v('mazda-cx-5', 'suv', 'Mazda CX-5', 'เอสยูวีขนาดกลาง', 'Mid-size SUV', 5, 3, 'petrol', 3200,
      'car-suv-mazda-cx-5'),
    v('mg-zs-ev', 'suv', 'MG ZS EV', 'เอสยูวีไฟฟ้า', 'Electric SUV', 5, 2, 'ev', 3000,
      'car-suv-mg-zs-ev'),

    /* MPV — one real photograph */
    v('toyota-veloz', 'mpv', 'Toyota Veloz', 'เอ็มพีวี 7 ที่นั่ง', 'Compact MPV', 7, 3, 'petrol', 2400,
      'car-mpv-toyota-veloz', 'assets/img/car-mpv-toyota-veloz.jpg'),
    v('toyota-alphard', 'mpv', 'Toyota Alphard', 'เอ็มพีวีหรู', 'Luxury MPV', 7, 4, 'petrol', 9500,
      'car-mpv-toyota-alphard'),
    v('toyota-commuter', 'mpv', 'Toyota Commuter', 'รถตู้', 'Passenger Van', 13, 8, 'diesel', 4200,
      'car-mpv-toyota-commuter'),
    v('peugeot-5008', 'mpv', 'Peugeot 5008', 'เอ็มพีวี 7 ที่นั่ง', 'Seven-seat MPV', 7, 4, 'petrol', 3600,
      'car-mpv-peugeot-5008'),
    v('toyota-innova', 'mpv', 'Toyota Innova Crysta', 'เอ็มพีวี 7 ที่นั่ง', 'Seven-seat MPV', 7, 3, 'diesel', 2800,
      'car-mpv-toyota-innova'),
    v('hyundai-h1', 'mpv', 'Hyundai H-1', 'รถตู้', 'Passenger Van', 11, 6, 'diesel', 4600,
      'car-mpv-hyundai-h1'),

    /* Compact — no real photography yet */
    v('toyota-yaris', 'compact', 'Toyota Yaris', 'แฮตช์แบ็กประหยัด', 'Economy Hatchback', 4, 2, 'petrol', 1500,
      'car-compact-toyota-yaris'),
    v('honda-city', 'compact', 'Honda City', 'ซีดานประหยัด', 'Economy Sedan', 5, 2, 'petrol', 1600,
      'car-compact-honda-city'),
    v('toyota-altis', 'compact', 'Toyota Altis', 'ซีดานคอมแพ็กต์', 'Compact Sedan', 5, 3, 'petrol', 2000,
      'car-compact-toyota-altis'),
    v('honda-civic', 'compact', 'Honda Civic', 'ซีดานคอมแพ็กต์', 'Compact Sedan', 5, 3, 'petrol', 2300,
      'car-compact-honda-civic'),
    /* Both named on the wireframe's compact row, which the tab was two cars
       short of carrying. */
    v('mazda-2', 'compact', 'Mazda 2', 'แฮตช์แบ็กประหยัด', 'Economy Hatchback', 5, 2, 'petrol', 1700,
      'car-compact-mazda-2'),
    v('nissan-almera', 'compact', 'Nissan Almera', 'ซีดานประหยัด', 'Economy Sedan', 5, 2, 'petrol', 1650,
      'car-compact-nissan-almera')
  ];

  /* TEMPORARY: only four vehicles have real photography, so the rest borrow a
     picture of a different model to fill the grid for review. Matched by body
     shape — sedans borrow a sedan, SUVs an SUV — so at least the silhouette is
     honest. Every borrowed card is flagged and labelled in the UI, because a
     BMW photograph on a Yaris card is a factual claim about what the customer
     is renting. Delete this block once the real shots land. */
  /* What a borrowed photograph is allowed to look like. Tabs are commercial
     classes, not shapes: `compact` and `premium` are both three-box cars, and
     compact owns no photograph of its own, so it borrows from premium. */
  /* SUV and MPV share a group. They were separate while an SUV photograph
     existed to borrow; the only one there was is unframed, and every SUV card
     now takes the Toyota Veloz — a crossover that reads as both a tall wagon
     and a small SUV, which is what makes the substitution survivable. It is a
     real loosening of the guarantee and not a free one: an SUV card is now
     showing a body one size down from what it names. */
  var BODY_GROUP = { compact: 'car', premium: 'car', suv: 'tall', mpv: 'tall' };

  var STAND_INS = {
    'bmw-5-series':    'car-premium-bmw-3-series',
    'mini-cooper-s':   'car-premium-mercedes-c-class',
    'honda-hr-v':      'car-mpv-toyota-veloz',
    'toyota-fortuner': 'car-mpv-toyota-veloz',
    'bmw-x1':          'car-mpv-toyota-veloz',
    'honda-cr-v':      'car-mpv-toyota-veloz',
    'toyota-alphard':  'car-mpv-toyota-veloz',
    'toyota-commuter': 'car-mpv-toyota-veloz',
    'peugeot-5008':    'car-mpv-toyota-veloz',
    'toyota-yaris':    'car-premium-bmw-3-series',
    'honda-city':      'car-premium-mercedes-c-class',
    'toyota-altis':    'car-premium-bmw-3-series',
    'honda-civic':     'car-premium-mercedes-c-class',
    'mercedes-e-class': 'car-premium-mercedes-c-class',
    'volvo-s60':       'car-premium-bmw-3-series',
    'mazda-cx-5':      'car-mpv-toyota-veloz',
    'mg-zs-ev':        'car-mpv-toyota-veloz',
    'toyota-innova':   'car-mpv-toyota-veloz',
    'hyundai-h1':      'car-mpv-toyota-veloz',
    'mazda-2':         'car-premium-bmw-3-series',
    'nissan-almera':   'car-premium-mercedes-c-class'
  };

  /* The borrowed path is copied from the owner rather than rebuilt from its
     slot name. Rebuilding meant writing the file extension here, a second
     place that had to agree with data above it — and when three photographs
     were resupplied as .jpg it silently pointed twelve cards at .webp files
     that no longer existed. Reading the owner's own path cannot drift. */
  var IMAGE_BY_SLOT = {};
  FLEET.forEach(function (vehicle) {
    if (vehicle.image) { IMAGE_BY_SLOT[vehicle.imageSlot] = vehicle.image; }
  });

  FLEET.forEach(function (vehicle) {
    vehicle.imageIsStandIn = false;
    if (!vehicle.image && STAND_INS[vehicle.id]) {
      vehicle.image = IMAGE_BY_SLOT[STAND_INS[vehicle.id]];
      vehicle.imageIsStandIn = true;
    }
  });

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
    BODY_GROUP: BODY_GROUP,
    DEFAULT_TAB: DEFAULT_TAB,
    cheapestIn: cheapestIn,
    fleetByTab: fleetByTab,
    locationsByGroup: locationsByGroup,
    findLocation: findLocation
  };
})(typeof window !== 'undefined' ? window : globalThis);
