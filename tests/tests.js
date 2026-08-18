(function (root) {
  'use strict';
  var T = root.SIXT.test;
  var fs = typeof require === 'function' ? require('fs') : null;
  var here = typeof __dirname !== 'undefined' ? __dirname : null;

  function readProjectFile(rel) {
    return fs.readFileSync(here + '/../' + rel, 'utf8');
  }

  /* Width and height out of a JPEG's frame header, so the promo banners can be
     checked against the ratio their card frame expects without a dependency.
     Walks the marker chain to the SOF segment; C4, C8 and CC are the Huffman,
     JPG-extension and arithmetic-coding markers and are not frame headers. */
  function jpegSize(buf) {
    if (buf.readUInt16BE(0) !== 0xFFD8) { return null; }
    var i = 2;
    while (i < buf.length - 9) {
      if (buf[i] !== 0xFF) { i++; continue; }
      var marker = buf[i + 1];
      if (marker >= 0xC0 && marker <= 0xCF &&
          marker !== 0xC4 && marker !== 0xC8 && marker !== 0xCC) {
        return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
      }
      i += 2 + buf.readUInt16BE(i + 2);
    }
    return null;
  }

  /* ═══ Tokens and the accessibility contract ═══════════════════════════ */

  T.test('brand tokens hold the values measured from logo.png, not the brief estimates', function () {
    if (!fs) { return; } /* browser run — the Node run covers this */
    var css = readProjectFile('assets/css/tokens.css');
    T.ok(/--sixt-orange:\s*#FF5000/i.test(css), 'orange must be #FF5000');
    T.ok(/--sixt-black:\s*#1A1A1A/i.test(css), 'black must be #1A1A1A');
    T.ok(/--sixt-orange-deep:\s*#E04400/i.test(css), 'deep orange must be #E04400');
    T.ok(!/#FF5F00/i.test(css), 'the brief estimate #FF5F00 must not appear');
    T.ok(!/#111111/i.test(css), 'the brief estimate #111111 must not appear');
  });

  /* Every button on the page is one box, and this is the test that keeps it
     one. It replaced three near-identical tests — one per class — which is
     what the CSS looked like too, and is why the five buttons had drifted to
     three type sizes and four heights before anyone noticed.

     What the size is actually for: white on orange is 3.28:1, legal as large
     text and not as normal text. Three of the five depend on it — .btn-primary
     and .promo-cta's inverse in their rest state, .btn-outline and
     .vehicle-cta only on hover, which is the more fragile case because the
     state carrying the requirement is not the one on screen while you edit.

     The second half is the part that matters most: no class may restate any of
     the shared metrics. A single `font-size: var(--text-body)` on one of them
     is exactly how the old drift started, and it is invisible in a diff. */
  var BUTTONS = ['btn-primary', 'btn-secondary', 'btn-outline', 'promo-cta', 'vehicle-cta'];

  T.test('every button shares one box, at the 19px/700 white-on-orange needs', function () {
    if (!fs) { return; }
    var css = readProjectFile('assets/css/app.css');
    var shared = css.match(/\.btn-primary,[^{]*\{[^}]*\}/);
    T.ok(shared, 'the shared button rule must exist and lead with .btn-primary');
    if (!shared) { return; }

    BUTTONS.forEach(function (c) {
      T.ok(shared[0].indexOf('.' + c) !== -1, '.' + c + ' must be in the shared rule');
    });
    T.ok(/font-size:\s*var\(--text-cta\)/.test(shared[0]), 'buttons must be --text-cta (19px)');
    T.ok(/font-weight:\s*700/.test(shared[0]), 'buttons must be bold');
    T.ok(/min-height:\s*48px/.test(shared[0]), 'buttons must be 48px tall');
    T.ok(/padding:\s*var\(--space-3\) var\(--space-6\)/.test(shared[0]),
      'buttons must share one padding');
  });

  T.test('no button class restates the metrics the shared rule sets', function () {
    if (!fs) { return; }
    var css = readProjectFile('assets/css/app.css');
    /* Cut the shared rule out before scanning. Its selector list runs one
       class per line, so its LAST selector sits directly against the brace and
       looks exactly like a rule of its own to the pattern below. */
    var shared = css.match(/\.btn-primary,[^{]*\{[^}]*\}/);
    var rest = shared ? css.replace(shared[0], '') : css;
    BUTTONS.forEach(function (c) {
      /* Any rule ending in the bare class: both `.btn-outline {` and
         `.drawer .btn-outline {`. The scoped ones are deliberately included —
         a descendant override is how the drawer's login button grew to 57px
         and sat there, being the one button on the site with nothing beside
         it to compare against. The shared rule has commas before its brace
         and the state rules have a colon, so neither is caught here. */
      var own = rest.match(new RegExp('\\.' + c + '\\s*\\{[^}]*\\}', 'g')) || [];
      own.forEach(function (rule) {
        ['font-size', 'font-weight', 'min-height', 'height', 'padding'].forEach(function (prop) {
          T.ok(!new RegExp('(^|[;{\\s])' + prop + '\\s*:').test(rule),
            '.' + c + ' sets ' + prop + ' itself; it belongs in the shared rule');
        });
      });
    });
  });

  /* THE DISC CANNOT BE ORANGE ON AN ORANGE GROUND. Every CTA arrow now sits in
     a circle, the circle is orange by default, and orange on orange is 1.00:1 —
     not a dim button but a button with no arrow on it at all. That failure is
     silent in every way that matters: nothing overlaps, nothing shifts, the
     page looks finished, and the tests that watch the shared box all pass.

     It has already happened once. The membership CTA turns orange above 1280
     and had been checked at desktop width only; the disc went with it and the
     arrow disappeared at exactly the width the client looks at the page.

     So: any rule that puts --sixt-orange under a button carrying a disc must
     say what the disc becomes. The two header hovers are the stated exception
     and the reason is inheritance, not oversight — they reach the same orange
     as the bare .btn-outline:hover, which sets the disc for all three, and
     restating it there would be a second answer to one question. */
  var DISC_BUTTONS = ['btn-primary', 'btn-secondary', 'btn-outline', 'promo-cta'];
  var INHERITS_THE_DISC = [
    '.site-header .btn-outline:hover',
    '.site-header.is-stuck .btn-outline:hover'
  ];

  T.test('no orange ground leaves the CTA disc orange on top of it', function () {
    if (!fs) { return; }
    /* Comments carry braces in this file — the mask idiom is quoted in prose —
       so they come out before the rule split, not after. */
    var css = readProjectFile('assets/css/app.css').replace(/\/\*[\s\S]*?\*\//g, '');
    var rule = /([^{}]+)\{([^{}]*)\}/g;
    var m;
    var checked = 0;
    while ((m = rule.exec(css)) !== null) {
      var selector = m[1].replace(/\s+/g, ' ').trim();
      var body = m[2];
      if (!/background:\s*var\(--sixt-orange\)/.test(body)) { continue; }
      var isButton = DISC_BUTTONS.some(function (c) { return selector.indexOf('.' + c) !== -1; });
      if (!isButton) { continue; }
      if (INHERITS_THE_DISC.indexOf(selector) !== -1) { continue; }
      checked++;
      T.ok(/--cta-disc:/.test(body),
        selector + ' fills orange and does not say what --cta-disc becomes; ' +
        'the disc would be invisible and the button would lose its arrow');
    }
    T.ok(checked >= 3, 'the orange-ground rules must still be found — ' +
      'this test measured ' + checked + ' of them and expects at least 3');
  });

  T.test('.price-total holds the size its orange depends on', function () {
    if (!fs) { return; }
    var css = readProjectFile('assets/css/app.css');
    var rule = css.match(/\.price-total\s*\{[^}]*\}/);
    T.ok(rule, '.price-total rule must exist');
    T.ok(/font-size:\s*1\.5rem/.test(rule[0]), '.price-total must be 24px');
    T.ok(/font-weight:\s*700/.test(rule[0]), '.price-total must be bold');
  });

  T.test('the PROMO badge sits on black, never on orange', function () {
    if (!fs) { return; }
    var css = readProjectFile('assets/css/app.css');
    var rule = css.match(/\.badge\s*\{[^}]*\}/);
    T.ok(rule, '.badge rule must exist');
    T.ok(/background:\s*var\(--sixt-black\)/.test(rule[0]),
      '11px white on orange cannot reach the large-text exemption');
  });

  /* Browsers silently drop a stray end tag, so bad nesting ships looking fine
     and only shows up later as a layout that will not respond to CSS. One had
     been sitting in the hero since the booking form was rebuilt: an extra
     </div> that closed nothing. Nothing here noticed, because nothing here
     looked. Comments are blanked first so prose about tags is not parsed as
     tags, and <svg> subtrees are skipped — they carry their own vocabulary. */
  T.test('index.html nests cleanly — every element closes what it opened', function () {
    if (!fs) { return; }
    var html = readProjectFile('index.html')
      .replace(/<!--[\s\S]*?-->/g, '');
    var VOID = { area: 1, base: 1, br: 1, col: 1, embed: 1, hr: 1, img: 1,
                 input: 1, link: 1, meta: 1, source: 1, track: 1, wbr: 1 };
    var re = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)([^>]*)>/g;
    var stack = [];
    var problems = [];
    var m;
    while ((m = re.exec(html))) {
      var tag = m[2].toLowerCase();
      if (VOID[tag] || /\/\s*$/.test(m[3])) { continue; }
      if (tag === 'svg') {
        var close = html.indexOf('</svg>', m.index);
        if (close === -1) { problems.push('<svg> never closed'); break; }
        re.lastIndex = close + 6;
        continue;
      }
      if (m[1]) {
        var open = stack.pop();
        if (!open) { problems.push('</' + tag + '> closes nothing'); }
        else if (open !== tag) { problems.push('</' + tag + '> closes <' + open + '>'); }
      } else {
        stack.push(tag);
      }
    }
    stack.forEach(function (tag) { problems.push('<' + tag + '> never closed'); });
    T.eq(problems, []);
  });

  T.test('colour lives only in tokens.css — no hex literals leak into markup or logic', function () {
    if (!fs) { return; }
    ['index.html', 'assets/css/app.css', 'assets/js/ui.js', 'assets/js/i18n.js']
      .forEach(function (rel) {
        var text = readProjectFile(rel);
        var hits = text.match(/#[0-9A-Fa-f]{6}\b/g) || [];
        T.eq(hits, [], rel + ' must not contain hex colours');
      });
  });

  /* ═══ data.js ═════════════════════════════════════════════════════════ */

  T.test('there are 17 locations: 5 in Bangkok, 12 upcountry', function () {
    var D = root.SIXT.data;
    T.eq(D.LOCATIONS.length, 17);
    T.eq(D.locationsByGroup('bangkok').length, 5);
    T.eq(D.locationsByGroup('upcountry').length, 12);
  });

  T.test('every location has a unique id, a valid group and both languages', function () {
    var seen = {};
    root.SIXT.data.LOCATIONS.forEach(function (l) {
      T.ok(l.id, 'location needs an id');
      T.ok(!seen[l.id], 'duplicate location id: ' + l.id);
      seen[l.id] = true;
      T.ok(l.th && l.th.length, l.id + ' needs Thai');
      T.ok(l.en && l.en.length, l.id + ' needs English');
      T.ok(l.group === 'bangkok' || l.group === 'upcountry', l.id + ' has a bad group');
    });
  });

  T.test('findLocation returns the record, and undefined for a miss', function () {
    T.eq(root.SIXT.data.findLocation('suvarnabhumi').en, 'Suvarnabhumi Airport');
    T.eq(root.SIXT.data.findLocation('nope'), undefined);
  });

  /* Six a tab, not four. Four fitted the row exactly at desktop, which left
     the scroll arrows under it with nowhere to go — the count is what gives
     them something to do. */
  T.test('the fleet has 24 vehicles, six in each of the four tabs', function () {
    var D = root.SIXT.data;
    T.eq(D.FLEET.length, 24);
    T.eq(D.TABS, ['compact', 'suv', 'mpv', 'premium']);
    D.TABS.forEach(function (tab) {
      T.eq(D.fleetByTab(tab).length, 6, tab + ' must hold exactly six vehicles');
    });
  });

  T.test('the default tab is premium, the only tab with real photography', function () {
    var D = root.SIXT.data;
    T.eq(D.DEFAULT_TAB, 'premium');
    T.eq(D.fleetByTab('premium').filter(function (v) { return !v.imageIsStandIn; }).length, 2);
  });

  T.test('every vehicle carries complete, well-typed specs', function () {
    var D = root.SIXT.data;
    var seen = {};
    D.FLEET.forEach(function (v) {
      T.ok(!seen[v.id], 'duplicate vehicle id: ' + v.id);
      seen[v.id] = true;
      T.ok(D.TABS.indexOf(v.tab) !== -1, v.id + ' has a bad tab');
      T.ok(typeof v.name === 'string' && v.name.length, v.id + ' needs a name');
      T.ok(v.classTh && v.classEn, v.id + ' needs a class in both languages');
      T.ok(typeof v.seats === 'number' && v.seats > 0, v.id + ' needs seats');
      T.ok(typeof v.bags === 'number' && v.bags >= 0, v.id + ' needs bags');
      T.eq(v.transmission, 'auto', v.id + ' transmission');
      T.ok(typeof v.pricePerDay === 'number' && v.pricePerDay > 0, v.id + ' needs a price');
      T.ok(typeof v.imageSlot === 'string' && v.imageSlot.length, v.id + ' needs an imageSlot');
    });
  });

  T.test('every vehicle declares a known fuel type', function () {
    var D = root.SIXT.data;
    D.FLEET.forEach(function (v) {
      T.ok(D.FUELS.indexOf(v.fuel) !== -1, v.id + ' has a bad fuel: ' + v.fuel);
    });
  });

  T.test('the best-deal badge is derived from price, not hand-set', function () {
    var D = root.SIXT.data;
    D.TABS.forEach(function (tab) {
      var cheapest = D.cheapestIn(tab);
      var prices = D.fleetByTab(tab).map(function (v) { return v.pricePerDay; });
      T.eq(cheapest.pricePerDay, Math.min.apply(null, prices), tab + ' cheapest');
    });
    T.eq(D.cheapestIn('premium').id, 'mini-cooper-s');
    T.eq(D.cheapestIn('compact').id, 'toyota-yaris');
  });

  T.test('cheapestIn returns null for a tab that does not exist', function () {
    T.eq(root.SIXT.data.cheapestIn('spaceship'), null);
  });

  T.test('every price is flagged as a placeholder until real rates arrive', function () {
    root.SIXT.data.FLEET.forEach(function (v) {
      T.eq(v.priceIsPlaceholder, true, v.id + ' price must be flagged');
    });
  });

  /* Three, not four: the CR-V gave up its photograph when the resupplied
     shots arrived on the brand frame and its own did not. Every SUV card now
     borrows the Veloz. */
  T.test('exactly three vehicles own their photograph; the rest are flagged stand-ins', function () {
    var D = root.SIXT.data;
    var real = D.FLEET.filter(function (v) { return v.image && !v.imageIsStandIn; });
    T.eq(real.map(function (v) { return v.id; }).sort(),
      ['bmw-3-series', 'mercedes-c-class', 'toyota-veloz']);
    /* Every card shows something, so the grid reads as complete for review. */
    D.FLEET.forEach(function (v) {
      T.ok(v.image, v.id + ' has no image at all');
      /* Two formats on purpose: the resupplied shots came as .jpg because
         nothing here can write WebP. See the note in prepare-images.py. */
      T.ok(/^assets\/img\/car-[a-z0-9-]+\.(webp|jpg)$/.test(v.image),
        v.id + ' bad path: ' + v.image);
      T.eq(typeof v.imageIsStandIn, 'boolean', v.id + ' must declare imageIsStandIn');
    });
    T.eq(D.FLEET.filter(function (v) { return v.imageIsStandIn; }).length, 21);
  });

  T.test('a stand-in only borrows a photograph of the same body shape', function () {
    /* Shape has to survive the substitution: an SUV card showing a sedan
       misrepresents the vehicle class, not merely the model. Matching on tab
       would be wrong here — compact owns no photograph and legitimately
       borrows a premium sedan. */
    var D = root.SIXT.data;
    var ownerBody = {};
    D.FLEET.forEach(function (v) {
      if (!v.imageIsStandIn) { ownerBody[v.image] = D.BODY_GROUP[v.tab]; }
    });
    D.FLEET.filter(function (v) { return v.imageIsStandIn; }).forEach(function (v) {
      T.eq(ownerBody[v.image], D.BODY_GROUP[v.tab],
        v.id + ' is a ' + D.BODY_GROUP[v.tab] + ' borrowing a ' + ownerBody[v.image]);
    });
  });

  T.test('every tab has a body group, so no stand-in can slip through unchecked', function () {
    var D = root.SIXT.data;
    D.TABS.forEach(function (tab) {
      T.ok(D.BODY_GROUP[tab], tab + ' has no body group');
    });
  });

  T.test('every referenced image file actually exists on disk', function () {
    if (!fs) { return; }
    var refs = root.SIXT.data.FLEET
      .filter(function (v) { return v.image; })
      .map(function (v) { return v.image; })
      .concat(root.SIXT.content.PROMOS
        .filter(function (p) { return p.image; })
        .map(function (p) { return p.image; }))
      /* promo-ground.jpg is referenced from the stylesheet rather than from
         any data file, so nothing else in this suite would notice it going
         missing — the band would simply lose its lower half. */
      .concat(root.SIXT.content.SERVICES
        .filter(function (s) { return s.image; })
        .map(function (s) { return s.image; }))
      /* promo-ground.jpg is referenced from tokens.css rather than from any
         data file, so nothing else here would notice it going missing.
         services-ground.jpg was in this list too — the services band is a
         flat colour again and the file is no longer referenced from anywhere,
         so a test asserting it exists would only be pinning an orphan. */
      .concat(['assets/img/hero-banner.webp', 'assets/img/logo.webp',
               'assets/img/promo-ground.jpg']);
    refs.forEach(function (rel) {
      T.ok(fs.existsSync(here + '/../' + rel), 'missing asset: ' + rel);
    });
  });

  /* ═══ content.js ══════════════════════════════════════════════════════ */

  T.test('every content entry carries both Thai and English', function () {
    var C = root.SIXT.content;
    [['VALUE_PROPS', ['title', 'body']],
     ['PROMOS', ['title', 'body']],
     ['SERVICES', ['title', 'body', 'cta', 'alt']],
     ['NEWS', ['title', 'body']],
     ['FAQ', ['q', 'a']]].forEach(function (pair) {
      var listName = pair[0];
      var fields = pair[1];
      C[listName].forEach(function (entry) {
        ['th', 'en'].forEach(function (lang) {
          T.ok(entry[lang], listName + '/' + entry.id + ' is missing ' + lang);
          fields.forEach(function (f) {
            T.ok(entry[lang][f] && entry[lang][f].length,
              listName + '/' + entry.id + '.' + lang + '.' + f + ' is empty');
          });
        });
      });
    });
  });

  /* Each body sets one line at desktop width, and that is a property of the
     copy, not of the CSS — no stylesheet can fit a long sentence on one line
     in a 437px column. The longest string here runs 41 characters; 45 is the
     point where it starts wrapping.

     This is asserted because copy is edited far more often than the layout is
     re-measured, and the failure is silent: one column quietly becomes two
     lines and the three stop matching. */
  /* The three tiles are meant to read as a set, which means two lines each —
     not two, one and one. The measure is fixed at 24rem, so the line count is
     decided by the copy, and both ends of the window matter: too long and a
     third line appears, too short and the string collapses onto one while its
     neighbours stay at two. Currently 52 to 79 characters across both
     languages. */
  T.test('service bodies stay in the band that sets two lines', function () {
    root.SIXT.content.SERVICES.forEach(function (s) {
      ['th', 'en'].forEach(function (lang) {
        var n = s[lang].body.length;
        var where = 'SERVICES/' + s.id + '.' + lang + '.body runs ' + n + ' characters';
        T.ok(n <= 100, where + ' and will spill to a third line');
        T.ok(n >= 50, where + ' and will collapse onto one');
      });
    });
  });

  /* The news list is designed to work with no pictures and to gain them one at
     a time, which is exactly the arrangement where a half-wired item ships
     unnoticed: an `image` path with no alt beside it renders a photograph
     announcing its own headline twice, and nothing else on the page complains.
     Both directions are checked, so the alt written ahead of the file cannot
     be deleted either. */
  T.test('a news photograph and its alt text arrive together or not at all', function () {
    root.SIXT.content.NEWS.forEach(function (item) {
      ['th', 'en'].forEach(function (lang) {
        var alt = item[lang].alt;
        T.ok(typeof alt === 'string' && alt.length > 0,
          'NEWS/' + item.id + '.' + lang + ' has no alt text — it is the brief ' +
          'for the photograph as much as the description of it');
        T.ok(alt !== item[lang].title,
          'NEWS/' + item.id + '.' + lang + '.alt repeats the headline, which ' +
          'tells a screen reader nothing the headline has not already said');
      });
      if (item.image) {
        T.ok(/^assets\/img\//.test(item.image),
          'NEWS/' + item.id + '.image must point into assets/img');
      }
    });
  });

  /* The membership band sets its paragraph centred at 64ch, and centred copy
     is where an extra line is most visible: it widens the block's silhouette
     rather than lengthening a column, so a third line changes the shape of the
     whole band. Both strings were cut to two lines at 640px and above, and
     what came off the end of each was a sentence telling the reader to choose
     a tier or log in — which the button and the link beside it already are.

     125 characters is the English at 117 with a few words of margin. Thai is
     held to the same number and runs shorter in characters while setting
     wider, so the tighter of the two is whichever language is being read. */
  T.test('the membership paragraph stays inside two lines', function () {
    ['th', 'en'].forEach(function (lang) {
      var s = root.SIXT.i18n.dict[lang]['member.body'];
      T.ok(!!s, 'member.body is missing from the ' + lang + ' dictionary');
      T.ok(s.length <= 125,
        'member.body in ' + lang + ' runs ' + s.length + ' characters and will ' +
        'spill to a third line on the band');
      T.ok(s.indexOf('\n') === -1,
        'member.body in ' + lang + ' carries a hard break; this paragraph is ' +
        'centred and wraps to its own measure');
    });
  });

  /* A test guarding the membership perk list stood here and has been removed
     with the list itself, at the client's direction on 2026-08-17. It asserted
     that member.perk1-4 existed and that member.artAlt did not transcribe them —
     both of which are still true and neither of which now means anything: the
     list is not rendered, so the keys are unused and the alt describes an
     artwork that never had a card in it.

     A test that passes while proving nothing is worse than no test, because the
     next person reads a green suite as coverage. The four strings are still in
     i18n.js if the benefits are ever wanted back; if they are, this test comes
     back with them. */

  T.test('value-prop bodies stay inside the one-line measure', function () {
    root.SIXT.content.VALUE_PROPS.forEach(function (p) {
      ['th', 'en'].forEach(function (lang) {
        T.ok(p[lang].body.length <= 45,
          'VALUE_PROPS/' + p.id + '.' + lang + '.body runs ' +
          p[lang].body.length + ' characters and will wrap to a second line');
      });
    });
  });

  T.test('the wireframe counts hold: 3 value props, 3 promos, 3 services, 3 news, 4 FAQs', function () {
    var C = root.SIXT.content;
    T.eq(C.VALUE_PROPS.length, 3);
    T.eq(C.PROMOS.length, 3);
    T.eq(C.SERVICES.length, 3);
    T.eq(C.NEWS.length, 3);
    T.eq(C.FAQ.length, 4);
  });

  /* Was 'two promos use real artwork and the third is an honest placeholder'.
     The third slot held copy that said it was waiting on the marketing team,
     which would have shipped to a client demo as visible text. All three now
     carry supplied artwork, so the test that guarded the placeholder becomes
     the test that stops one coming back. */
  T.test('every promo card carries real artwork — no slot is left waiting', function () {
    root.SIXT.content.PROMOS.forEach(function (p) {
      T.ok(p.image, 'PROMOS/' + p.id + ' has no artwork');
    });
  });

  /* The banners are 16:9 and the card frame is 16:9, which is the whole
     reason these three fill it without bars. A JPEG that is not 16:9 would
     letterbox silently, so the ratio is asserted from the file itself. */
  T.test('every promo banner is 16:9, the ratio its frame expects', function () {
    if (!fs) { return; }
    root.SIXT.content.PROMOS.forEach(function (p) {
      var buf = fs.readFileSync(here + '/../' + p.image);
      var size = jpegSize(buf);
      T.ok(size, 'PROMOS/' + p.id + ' is not a readable JPEG');
      var ratio = size.w / size.h;
      T.ok(Math.abs(ratio - 16 / 9) < 0.01,
        'PROMOS/' + p.id + ' is ' + size.w + 'x' + size.h + ' (' +
        ratio.toFixed(3) + ':1), not 16:9 — it will letterbox in the card');
    });
  });

  T.test('the Thai Lion Air promo card is not repeated — it is already the hero', function () {
    var ids = root.SIXT.content.PROMOS.map(function (p) { return p.id; });
    T.eq(ids.indexOf('thai-lion-air'), -1);
  });

  T.test('the footer has five columns of five links, each bilingual', function () {
    var F = root.SIXT.content.FOOTER;
    T.eq(F.length, 5);
    F.forEach(function (col) {
      T.ok(col.th && col.en, col.id + ' heading needs both languages');
      T.eq(col.links.length, 5, col.id + ' must have five links');
      col.links.forEach(function (link) {
        T.ok(link.th && link.en, col.id + ' has a link missing a language');
      });
    });
  });

  T.test('every hero slide declares real dimensions and bilingual alt text', function () {
    var slides = root.SIXT.content.HERO_SLIDES;
    T.ok(slides.length >= 1, 'the carousel needs at least one slide');
    var seen = {};
    slides.forEach(function (s) {
      T.ok(!seen[s.id], 'duplicate slide id: ' + s.id);
      seen[s.id] = true;
      T.ok(/^assets\/img\/[a-z0-9-]+\.webp$/.test(s.image), s.id + ' bad path: ' + s.image);
      T.ok(typeof s.width === 'number' && s.width > 0, s.id + ' needs a width');
      T.ok(typeof s.height === 'number' && s.height > 0, s.id + ' needs a height');
      T.ok(s.th && s.th.alt && s.th.alt.length, s.id + ' needs Thai alt text');
      T.ok(s.en && s.en.alt && s.en.alt.length, s.id + ' needs English alt text');
    });
  });

  T.test('every hero slide fits the frame closely enough that cover spares the artwork', function () {
    /* Slides share one frame under object-fit: cover, and each banner carries
       its headline, logos and terms inside the picture. A slide more than 8%
       off the frame ratio starts losing them, and every one of these banners
       has the SIXT wordmark hard against its left edge. */
    var C = root.SIXT.content;
    var frame = C.HERO_FRAME_RATIO;
    C.HERO_SLIDES.forEach(function (s) {
      var ratio = s.width / s.height;
      /* cover trims whichever axis is proportionally longer, split across the
         two opposite edges. 6% per edge is what these banners tolerate before
         the crop reaches their wordmarks and terms. */
      var lost = ratio > frame
        ? (ratio - frame) / ratio          /* wider than the frame: sides */
        : (1 / ratio - 1 / frame) * ratio; /* taller: top and bottom */
      var perEdge = lost / 2;
      /* A slide may raise its own budget, but only by declaring it — see the
         note on safeEdge in content.js. Without one, the strict default holds. */
      var budget = s.safeEdge || 0.06;
      T.ok(perEdge <= budget, s.id + ' is ' + ratio.toFixed(2) + ':1 in a ' +
        frame.toFixed(2) + ':1 frame — ' + (perEdge * 100).toFixed(1) +
        '% off each edge, budget ' + (budget * 100).toFixed(0) + '%');
    });
  });

  T.test('the frame ratio in the data matches the one in the stylesheet', function () {
    if (!fs) { return; }
    var css = readProjectFile('assets/css/app.css');
    var m = css.match(/\.hero-slider\s*\{[^}]*aspect-ratio:\s*([\d.]+)\s*\/\s*([\d.]+)/);
    T.ok(m, '.hero-slider must declare an aspect-ratio');
    var cssRatio = Number(m[1]) / Number(m[2]);
    T.ok(Math.abs(cssRatio - root.SIXT.content.HERO_FRAME_RATIO) < 0.01,
      'CSS frame is ' + cssRatio.toFixed(3) + ' but HERO_FRAME_RATIO is ' +
      root.SIXT.content.HERO_FRAME_RATIO.toFixed(3));
  });

  T.test('every hero slide image exists on disk', function () {
    if (!fs) { return; }
    root.SIXT.content.HERO_SLIDES.forEach(function (s) {
      T.ok(fs.existsSync(here + '/../' + s.image), 'missing slide asset: ' + s.image);
      /* A phone cut is optional, but a declared one that is not there is worse
         than none: <picture> falls back silently to the desktop file, so the
         page looks correct on a laptop and quietly serves the 18%-cropped
         landscape banner to every phone. */
      if (s.mobile) {
        T.ok(fs.existsSync(here + '/../' + s.mobile.image),
          'missing mobile slide asset: ' + s.mobile.image);
      }
    });
  });

  /* The phone cut is measured against the MOBILE frame, which is 4:3 — not the
     2:1 the desktop slides are checked against. Checking it against the wrong
     frame is the whole failure this test exists to stop: hero-lionair-skyline-m
     is 1.333:1, which is 25% off each edge of a 2:1 frame and would look like a
     catastrophe, and is exactly right for the frame it actually renders in. */
  T.test('every hero mobile cut fits the 4:3 phone frame', function () {
    var C = root.SIXT.content;
    var frame = C.HERO_MOBILE_FRAME_RATIO;
    T.ok(frame, 'content.js must declare HERO_MOBILE_FRAME_RATIO');
    C.HERO_SLIDES.forEach(function (s) {
      if (!s.mobile) { return; }
      var ratio = s.mobile.width / s.mobile.height;
      var lost = ratio > frame
        ? (ratio - frame) / ratio
        : (1 / ratio - 1 / frame) * ratio;
      var budget = s.mobile.safeEdge || 0.06;
      T.ok(lost / 2 <= budget, s.id + ' mobile cut is ' + ratio.toFixed(3) + ':1 in a ' +
        frame.toFixed(3) + ':1 frame — ' + (lost / 2 * 100).toFixed(1) +
        '% off each edge, budget ' + (budget * 100).toFixed(0) + '%');
    });
  });

  /* The CSS breakpoint the <picture> source keys off is 767px, and .hero-slider
     changes frame at the same number. They are two literals in two files and
     nothing else ties them together — if one moves, phones get a 4:3 artwork in
     a 2:1 frame or the reverse, and neither shows as an error anywhere. */
  T.test('the phone frame breakpoint in the stylesheet is the one ui.js serves at', function () {
    if (!fs) { return; }
    var css = readProjectFile('assets/css/app.css');
    var js = readProjectFile('assets/js/ui.js');
    var cssHit = css.match(/@media \(max-width: (\d+)px\)[^{]*\{[^@]*?\.hero-slider\s*\{\s*aspect-ratio:\s*4\s*\/\s*3/);
    T.ok(cssHit, '.hero-slider must set a 4/3 aspect-ratio inside a max-width media query');
    var jsHit = js.match(/source\.media = '\(max-width: (\d+)px\)'/);
    T.ok(jsHit, 'ui.js must set the hero <source> media query');
    if (cssHit && jsHit) {
      T.eq(jsHit[1], cssHit[1],
        'ui.js serves the phone cut below ' + jsHit[1] + 'px but the 4:3 frame starts below ' + cssHit[1] + 'px');
    }
  });

  /* The width and height a slide declares must be the ones in the file, and
     until now nothing checked it.

     That is not a tidiness point. The crop-budget test above computes its ratio
     from s.width / s.height — the declared numbers — so a slide whose file has
     been re-supplied at a different size keeps passing on the shape of the
     picture it used to have. The budget it clears is the old artwork's, and the
     new one is cropped by however much the two ratios differ, silently, in the
     first picture on the page.

     It nearly happened: lionair-skyline was re-supplied at 1811x868 over a
     2138x1029 file, and 2138/1029 and 1811/868 are close enough in ratio
     (2.078 vs 2.086) that nothing would have looked wrong while the check was
     measuring a file that no longer existed.

     The dimensions are read out of the WebP header rather than by decoding the
     image, so this needs no dependency: RIFF at 0, WEBP at 8, then either a
     VP8X chunk carrying the canvas size, a lossy VP8 keyframe carrying it after
     the 0x9d 0x01 0x2a start code, or a lossless VP8L bitstream packing two
     14-bit values. Cross-checked against Pillow on all twelve WebP assets in
     the tree before being trusted here. A header this reader cannot parse fails
     rather than skips — a silent pass is what the test exists to stop. */
  T.test('hero slide dimensions match the files they point at', function () {
    if (!fs) { return; }

    function webpSize(buf) {
      if (buf.length < 30) { return null; }
      if (buf.toString('ascii', 0, 4) !== 'RIFF' ||
          buf.toString('ascii', 8, 12) !== 'WEBP') { return null; }
      var tag = buf.toString('ascii', 12, 16);
      if (tag === 'VP8X') {
        return { w: (buf.readUIntLE(24, 3) & 0xffffff) + 1,
                 h: (buf.readUIntLE(27, 3) & 0xffffff) + 1 };
      }
      if (tag === 'VP8 ') {
        if (buf[23] !== 0x9d || buf[24] !== 0x01 || buf[25] !== 0x2a) { return null; }
        return { w: buf.readUInt16LE(26) & 0x3fff, h: buf.readUInt16LE(28) & 0x3fff };
      }
      if (tag === 'VP8L') {
        var bits = buf.readUInt32LE(21);
        return { w: (bits & 0x3fff) + 1, h: ((bits >> 14) & 0x3fff) + 1 };
      }
      return null;
    }

    root.SIXT.content.HERO_SLIDES.forEach(function (s) {
      var path = here + '/../' + s.image;
      if (!fs.existsSync(path)) { return; }  /* the test above owns that failure */
      var size = webpSize(fs.readFileSync(path));
      T.ok(size, s.id + ': could not read the dimensions out of ' + s.image);
      if (!size) { return; }
      T.eq(size.w, s.width,
        s.id + ' declares width ' + s.width + ' but ' + s.image + ' is ' + size.w);
      T.eq(size.h, s.height,
        s.id + ' declares height ' + s.height + ' but ' + s.image + ' is ' + size.h);

      /* And the phone cut, for the same reason and one more: lossy WebP rounds
         odd dimensions down to even when it subsamples chroma, so a 1447x1087
         master encodes to 1448x1086. Declaring the source's numbers rather than
         the output's is a mistake that only this check catches. */
      if (!s.mobile) { return; }
      var mPath = here + '/../' + s.mobile.image;
      if (!fs.existsSync(mPath)) { return; }
      var mSize = webpSize(fs.readFileSync(mPath));
      T.ok(mSize, s.id + ': could not read the dimensions out of ' + s.mobile.image);
      if (!mSize) { return; }
      T.eq(mSize.w, s.mobile.width,
        s.id + ' mobile declares width ' + s.mobile.width + ' but the file is ' + mSize.w);
      T.eq(mSize.h, s.mobile.height,
        s.id + ' mobile declares height ' + s.mobile.height + ' but the file is ' + mSize.h);
    });
  });

  T.test('the vehicle inclusions are bilingual and flagged as unverified terms', function () {
    var inc = root.SIXT.content.FLEET_INCLUDES;
    T.eq(inc.length, 3);
    T.eq(inc.isPlaceholder, true, 'these are contractual claims and must stay flagged');
    inc.forEach(function (item) {
      T.ok(item.id, 'inclusion needs an id');
      T.ok(item.th && item.th.length, item.id + ' needs Thai');
      T.ok(item.en && item.en.length, item.id + ' needs English');
    });
  });

  T.test('news dates are ISO strings so they format correctly in both calendars', function () {
    root.SIXT.content.NEWS.forEach(function (item) {
      T.ok(/^\d{4}-\d{2}-\d{2}$/.test(item.date), item.id + ' bad date: ' + item.date);
    });
  });

  /* ═══ i18n.js ═════════════════════════════════════════════════════════ */

  T.test('the Thai and English dictionaries hold exactly the same keys', function () {
    var d = root.SIXT.i18n.dict;
    var th = Object.keys(d.th).sort();
    var en = Object.keys(d.en).sort();
    var missingEn = th.filter(function (k) { return en.indexOf(k) === -1; });
    var missingTh = en.filter(function (k) { return th.indexOf(k) === -1; });
    T.eq(missingEn, [], 'keys missing from en');
    T.eq(missingTh, [], 'keys missing from th');
  });

  T.test('no dictionary value is left empty', function () {
    var d = root.SIXT.i18n.dict;
    ['th', 'en'].forEach(function (lang) {
      Object.keys(d[lang]).forEach(function (key) {
        T.ok(d[lang][key] && d[lang][key].length, lang + '.' + key + ' is empty');
      });
    });
  });

  T.test('Thai is the default language', function () {
    T.eq(root.SIXT.i18n.DEFAULT_LANG, 'th');
  });

  T.test('t() returns the active language and interpolates variables', function () {
    var i18n = root.SIXT.i18n;
    i18n.setLang('th');
    T.eq(i18n.t('booking.submit'), 'ค้นหารถที่ว่าง');
    T.eq(i18n.t('booking.summaryDays', { n: 2 }), '2 วัน');
    i18n.setLang('en');
    T.eq(i18n.t('booking.submit'), 'Search Available Car');
    T.eq(i18n.t('booking.summaryDays', { n: 3 }), '3 days');
    i18n.setLang('th');
  });

  T.test('an unknown key returns the key itself rather than blank text', function () {
    T.eq(root.SIXT.i18n.t('does.not.exist'), 'does.not.exist');
  });

  T.test('an unknown language falls back to Thai instead of breaking', function () {
    var i18n = root.SIXT.i18n;
    T.eq(i18n.setLang('de'), 'th');
    T.eq(i18n.getLang(), 'th');
  });

  T.test('setLang persists the choice so it survives a reload', function () {
    var i18n = root.SIXT.i18n;
    i18n.setLang('en');
    T.eq(localStorage.getItem(i18n.STORAGE_KEY), 'en');
    T.eq(i18n.restore(), 'en');
    i18n.setLang('th');
  });

  T.test('Thai dates use the Buddhist era and abbreviated Thai months', function () {
    T.eq(root.SIXT.i18n.formatDate('2026-08-15', 'th'), '15 ส.ค. 2569');
    T.eq(root.SIXT.i18n.formatDate('2026-01-01', 'th'), '1 ม.ค. 2569');
    T.eq(root.SIXT.i18n.formatDate('2026-12-31', 'th'), '31 ธ.ค. 2569');
  });

  T.test('English dates use the Gregorian year', function () {
    T.eq(root.SIXT.i18n.formatDate('2026-08-15', 'en'), '15 Aug 2026');
  });

  T.test('dates are parsed by hand, so no timezone shifts the day', function () {
    /* new Date('2026-01-01') is UTC midnight and renders as 31 Dec in the
       Americas. Parsing the string directly keeps the day stable everywhere. */
    T.eq(root.SIXT.i18n.formatDate('2026-01-01', 'en'), '1 Jan 2026');
  });

  T.test('date ranges collapse the shared month and year', function () {
    var f = root.SIXT.i18n.formatDateRange;
    T.eq(f('2026-08-15', '2026-08-16', 'th'), '15–16 ส.ค. 2569');
    T.eq(f('2026-08-28', '2026-09-02', 'th'), '28 ส.ค. – 2 ก.ย. 2569');
    T.eq(f('2026-12-28', '2027-01-02', 'th'), '28 ธ.ค. 2569 – 2 ม.ค. 2570');
    T.eq(f('2026-08-15', '2026-08-16', 'en'), '15–16 Aug 2026');
  });

  T.test('rental days are counted inclusively, matching the spec example', function () {
    var d = root.SIXT.i18n.rentalDays;
    T.eq(d('2026-08-15', '2026-08-16'), 2);
    T.eq(d('2026-08-15', '2026-08-15'), 1);
    T.eq(d('2026-08-01', '2026-08-07'), 7);
    T.eq(d('2026-12-30', '2027-01-02'), 4); /* crosses a year boundary */
  });

  T.test('prices are grouped with thousands separators', function () {
    T.eq(root.SIXT.i18n.formatPrice(5900), '฿5,900');
    T.eq(root.SIXT.i18n.formatPrice(950), '฿950');
    T.eq(root.SIXT.i18n.formatPrice(1200000), '฿1,200,000');
  });

  /* ═══ booking.js ══════════════════════════════════════════════════════ */

  function state(extra) {
    var base = {
      pickupLocation: 'suvarnabhumi',
      returnLocation: '',
      differentReturn: false,
      pickupDate: '2026-08-15',
      pickupTime: '10:00',
      returnDate: '2026-08-16',
      returnTime: '10:00'
    };
    Object.keys(extra || {}).forEach(function (k) { base[k] = extra[k]; });
    return base;
  }

  T.test('a complete booking passes validation', function () {
    var r = root.SIXT.booking.validate(state());
    T.eq(r.valid, true);
    T.eq(r.errors, {});
  });

  T.test('a missing pick-up location is rejected', function () {
    var r = root.SIXT.booking.validate(state({ pickupLocation: '' }));
    T.eq(r.valid, false);
    T.eq(r.errors.pickupLocation, 'booking.err.pickupLocationRequired');
  });

  T.test('a return location is only required once the toggle is open', function () {
    T.eq(root.SIXT.booking.validate(state()).valid, true);
    var r = root.SIXT.booking.validate(state({ differentReturn: true }));
    T.eq(r.errors.returnLocation, 'booking.err.returnLocationRequired');
    T.eq(root.SIXT.booking.validate(
      state({ differentReturn: true, returnLocation: 'phuket-air' })).valid, true);
  });

  T.test('both dates are required', function () {
    T.eq(root.SIXT.booking.validate(state({ pickupDate: '' })).errors.pickupDate,
      'booking.err.pickupDateRequired');
    T.eq(root.SIXT.booking.validate(state({ returnDate: '' })).errors.returnDate,
      'booking.err.returnDateRequired');
  });

  T.test('a return date before the pick-up date is rejected', function () {
    var r = root.SIXT.booking.validate(state({ returnDate: '2026-08-14' }));
    T.eq(r.valid, false);
    T.eq(r.errors.returnDate, 'booking.err.returnBeforePickup');
  });

  T.test('a same-day return must be later in the day', function () {
    var same = { returnDate: '2026-08-15' };
    T.eq(root.SIXT.booking.validate(state(same)).errors.returnTime,
      'booking.err.returnTimeBeforePickup');
    same.returnTime = '09:00';
    T.eq(root.SIXT.booking.validate(state(same)).errors.returnTime,
      'booking.err.returnTimeBeforePickup');
    same.returnTime = '18:30';
    T.eq(root.SIXT.booking.validate(state(same)).valid, true);
  });

  T.test('several problems are reported together, not one at a time', function () {
    var r = root.SIXT.booking.validate({ differentReturn: true });
    T.eq(Object.keys(r.errors).sort(),
      ['pickupDate', 'pickupLocation', 'returnDate', 'returnLocation']);
  });

  T.test('the summary reads as one line of Thai', function () {
    root.SIXT.i18n.setLang('th');
    T.eq(root.SIXT.booking.summarize(state()),
      'สุวรรณภูมิ (สนามบิน) · 15–16 ส.ค. 2569 · 2 วัน');
  });

  T.test('the summary follows the language switch', function () {
    root.SIXT.i18n.setLang('en');
    T.eq(root.SIXT.booking.summarize(state()),
      'Suvarnabhumi Airport · 15–16 Aug 2026 · 2 days');
    root.SIXT.i18n.setLang('th');
  });

  T.test('a one-way rental shows both ends of the trip', function () {
    root.SIXT.i18n.setLang('th');
    T.eq(root.SIXT.booking.summarize(
      state({ differentReturn: true, returnLocation: 'chiang-mai' })),
      'สุวรรณภูมิ (สนามบิน) → เชียงใหม่ · 15–16 ส.ค. 2569 · 2 วัน');
  });
})(typeof window !== 'undefined' ? window : globalThis);
