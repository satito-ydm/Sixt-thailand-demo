/* SIXT Thailand — DOM rendering and interaction.
   Everything repeated on the page is built here from data.js and content.js so
   index.html holds structure only. */
(function (root) {
  'use strict';
  root.SIXT = root.SIXT || {};

  var i18n, data, content;

  /* Rental length from the last search, or 0 before one has run. Vehicle cards
     switch from a daily rate to a trip total once this is known. */
  var activeDays = 0;

  /* ---------- helpers -------------------------------------------------- */

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) { node.className = className; }
    if (text !== undefined && text !== null) { node.textContent = text; }
    return node;
  }

  function icon(paths, size) {
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('width', size || 20);
    svg.setAttribute('height', size || 20);
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '1.6');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    paths.forEach(function (d) {
      var p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      p.setAttribute('d', d);
      svg.appendChild(p);
    });
    return svg;
  }

  var ICONS = {
    cursor:   ['M4 3l7 17 2.2-6.8L20 11z'],
    calendar: ['M7 3v3M17 3v3', 'M3.5 8.5h17', 'M4 6.5h16v13H4z'],
    shield:   ['M12 3l7 3v6c0 4-3 7.2-7 9-4-1.8-7-5-7-9V6z', 'M9 12l2 2 4-4'],
    seats:    ['M6 4h9a3 3 0 013 3v6H9a3 3 0 01-3-3z', 'M6 16h12', 'M6 16v4M18 16v4'],
    bags:     ['M6 8h12v12H6z', 'M9.5 8V5.5A1.5 1.5 0 0111 4h2a1.5 1.5 0 011.5 1.5V8'],
    gear:     ['M7 5v14M17 5v14M7 9h10', 'M7 5h.01M17 5h.01M7 19h.01M17 19h.01'],
    phone:    ['M4.5 5.5c0 8 6 14 14 14l1.5-3-4-2-1.8 1.8a12 12 0 01-6-6L10 8.5l-2-4z'],
    menu:     ['M4 7h16M4 12h16M4 17h16'],
    close:    ['M6 6l12 12M18 6L6 18'],
    globe:    ['M12 3a9 9 0 100 18 9 9 0 000-18z', 'M3.5 9.5h17M3.5 14.5h17', 'M12 3c-2.5 2.4-3.8 5.5-3.8 9S9.5 18.6 12 21c2.5-2.4 3.8-5.5 3.8-9S14.5 5.4 12 3z'],
    check:    ['M4.5 12.5l5 5 10-11'],
    snow:     ['M12 3v18M4.2 7.5l15.6 9M19.8 7.5l-15.6 9'],
    fuel:     ['M5 21V5a2 2 0 012-2h5a2 2 0 012 2v16', 'M3.5 21h13', 'M14 10h2.5a2 2 0 012 2v4.5a1.5 1.5 0 003 0V8l-2.5-2.5']
  };

  /* A real photo when we have one, otherwise a labelled placeholder that names
     the file the client still owes us. */
  function mediaOrPlaceholder(image, slot, ratio, alt, contain) {
    if (image) {
      var wrap = el('div', 'media' + (contain ? ' media--contain' : ''));
      wrap.setAttribute('data-ratio', ratio);
      var img = el('img');
      img.src = image;
      img.alt = alt || '';
      img.loading = 'lazy';
      img.decoding = 'async';
      wrap.appendChild(img);
      return wrap;
    }
    var ph = el('div', 'ph');
    ph.setAttribute('data-ratio', ratio);
    ph.setAttribute('role', 'img');
    ph.setAttribute('aria-label', alt || slot);
    ph.appendChild(el('span', 'ph-label', 'PLACEHOLDER · ' + ratio + ' · ' + slot + '.jpg'));
    return ph;
  }

  function copy(entry) {
    return entry[i18n.getLang()] || entry[i18n.DEFAULT_LANG];
  }

  function clear(node) {
    while (node.firstChild) { node.removeChild(node.firstChild); }
  }

  /* ---------- section renderers ---------------------------------------- */

  function renderValueProps() {
    var host = document.getElementById('value-props');
    clear(host);
    content.VALUE_PROPS.forEach(function (item) {
      var c = copy(item);
      var box = el('div');
      var mark = el('span', 'prop-icon');
      mark.appendChild(icon(ICONS[item.icon], 36));
      box.appendChild(mark);
      /* The words are wrapped so the tile has a single sibling to sit beside.
         Left as three children of a flex row, the title and the copy would be
         two columns of their own rather than one block against the icon. */
      var text = el('div', 'prop-text');
      /* No size class: this drops the title onto --text-h3, the scale's own
         heading step, instead of a one-off 17px. It also gains the mobile
         step the arbitrary value never had — 24px falling to 20px. */
      text.appendChild(el('h3', 'mb-2', c.title));
      text.appendChild(el('p', 'lead text-[0.9375rem]', c.body));
      box.appendChild(text);
      host.appendChild(box);
    });
  }

  /* ---------- hero carousel ------------------------------------------- */

  /* The banner advances only when the reader asks it to. Nothing moves on its
     own, so there is no timer to pause and WCAG 2.2.2 has nothing to bite on —
     which is why the row of dots and its pause button are gone. */
  var heroIndex = 0;
  var heroRelabel = null;

  /* Puts the curtain over the banner, then takes it away once the banner is
     worth looking at. Two classes on #hero rather than one:

       .hero-armed    the curtain is up and the booking form is held at zero
                      opacity behind nothing — it sits outside the slider and
                      the curtain cannot cover it
       .hero-running  both animations are running

     They are swapped in the same statement, so there is no frame in which the
     form is neither held back nor arriving.

     The trigger is the first banner's own load event, not DOMContentLoaded.
     The wipe exists to uncover a photograph; fire it before that file has
     decoded and it uncovers the slider's grey placeholder, which is the one
     outcome worse than not doing it. The timeout behind that is not a
     nicety — a 404 on the artwork, or a browser that declines to fire `load`
     for something it served from cache, would otherwise leave an opaque panel
     over the banner for the life of the page. */
  function buildReveal(slider, hero, firstFigure) {
    var curtain = el('div', 'hero-curtain');
    curtain.setAttribute('aria-hidden', 'true');
    slider.appendChild(curtain);
    hero.classList.add('hero-armed');

    var done = false;
    function reveal() {
      if (done) { return; }
      done = true;
      hero.classList.remove('hero-armed');
      hero.classList.add('hero-running');
    }

    /* Out of the DOM the moment it is off the frame. The curtain carries
       will-change: transform, which is a promoted compositor layer the size
       of the viewport — worth paying for 700ms and not worth paying for the
       rest of the session. */
    curtain.addEventListener('animationend', function () {
      if (curtain.parentNode) { curtain.parentNode.removeChild(curtain); }
    });

    var img = firstFigure.querySelector('img');
    if (img.complete) { reveal(); }
    else {
      img.addEventListener('load', reveal);
      img.addEventListener('error', reveal);
    }
    window.setTimeout(reveal, 1800);
  }

  function initHeroSlider() {
    var root_ = document.getElementById('hero-slider');
    if (!root_) { return; }

    var hero = document.getElementById('hero');
    var slides = content.HERO_SLIDES;
    var total = slides.length;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    clear(root_);

    var figures = slides.map(function (slide, index) {
      var fig = el('div', 'hero-slide' + (index === 0 ? ' is-active' : ''));
      fig.setAttribute('role', 'group');
      fig.setAttribute('aria-roledescription', 'slide');
      fig.setAttribute('aria-label', i18n.t('hero.slideOf', { n: index + 1, total: total }));
      var img = el('img');
      img.src = slide.image;
      img.width = slide.width;
      img.height = slide.height;
      img.alt = copy(slide).alt;
      /* Optional per-slide crop bias, for artwork whose logo or terms sit too
         close to an edge for a centred crop. */
      if (slide.focus) { img.style.objectPosition = slide.focus; }
      /* The first slide is the largest thing above the fold. */
      if (index === 0) { img.setAttribute('fetchpriority', 'high'); }
      else { img.loading = 'lazy'; }
      fig.appendChild(img);
      root_.appendChild(fig);
      return fig;
    });

    /* ── The reveal ───────────────────────────────────────────────────────
       An orange panel over the banner, which leaves to the right and takes
       the page's one authored moment with it. app.css carries the design
       argument; what belongs here is why the element is built in JavaScript.

       It covers the banner completely and only a script removes it. Written
       into index.html, a browser that blocked or failed to run this file
       would show an orange rectangle where the banner should be, permanently
       — so the only safe owner of the curtain is the same code that can be
       relied on to take it away. Nothing in the markup depends on it.

       Nothing is built at all under prefers-reduced-motion. A panel the size
       of the viewport crossing the screen has no gentler version of itself;
       the stylesheet gives the booking form a plain fade in its place. */
    if (!reduce && hero) {
      buildReveal(root_, hero, figures[0]);
    }

    if (total < 2) { return; } /* one slide needs no controls */

    /* `dir` is the step that was taken, not the index that resulted, and the
       difference matters at the ends of the strip: wrapping from the last
       banner to the first is a forward press whose indices run backwards.
       It is written to the slider, where app.css reads it to pick between two
       arrival keyframes — the incoming banner enters from the side of the
       chevron that was pressed. Absent on the first call, which is why slide
       zero arrives with the curtain instead. */
    function show(index, dir) {
      heroIndex = (index + total) % total;
      if (dir) { root_.setAttribute('data-dir', dir > 0 ? 'next' : 'prev'); }
      figures.forEach(function (fig, i) {
        var on = i === heroIndex;
        fig.classList.toggle('is-active', on);
        fig.setAttribute('aria-hidden', String(!on));
        if (on) { fig.removeAttribute('inert'); } else { fig.setAttribute('inert', ''); }
      });
    }

    /* Chevrons rather than a filled triangle: the arrow sits on photography,
       and an outline reads against both a bright sky and a dark car. */
    var ICON_PREV = ['M15 5l-7 7 7 7'];
    var ICON_NEXT = ['M9 5l7 7-7 7'];

    function arrow(variant, path, step, key) {
      var button = el('button', 'hero-arrow hero-arrow--' + variant);
      button.type = 'button';
      button.appendChild(icon(path, 20));
      button.addEventListener('click', function () { show(heroIndex + step, step); });
      root_.appendChild(button);
      return { el: button, key: key };
    }

    var arrows = [
      arrow('prev', ICON_PREV, -1, 'hero.prev'),
      arrow('next', ICON_NEXT, 1, 'hero.next')
    ];

    function label() {
      arrows.forEach(function (a) { a.el.setAttribute('aria-label', i18n.t(a.key)); });
    }

    /* Nothing to do for reduced motion here any more, and the block that used
       to strip the fade is gone on purpose. A crossfade is opacity, which is
       not the kind of motion the preference is asking about — and it is the
       only thing left saying one banner replaced another once the directional
       travel has been zeroed by tokens.css. Taking it away made the carousel
       cut between pictures with no signal at all. */
    show(0);
    label();

    /* Re-labelling in place rather than rebuilding: a language switch should
       not throw the viewer back to the first slide. */
    heroRelabel = function () {
      figures.forEach(function (fig, index) {
        fig.setAttribute('aria-label', i18n.t('hero.slideOf', { n: index + 1, total: total }));
        fig.querySelector('img').alt = copy(slides[index]).alt;
      });
      label();
    };
  }

  /* Four figures drawn from facts already stated elsewhere on the page — the
     branch list, the ISO badge and the SIXT history line in the footer. */
  /* One banner large in the middle, its neighbours cropped at the edges, and
     chevrons to bring one of them in. The detail sits below rather than on the
     picture: every banner already prints its own headline and price, and a
     second set of words laid over that would be two voices at once.

     Index lives here rather than on the element so a language switch, which
     rebuilds the whole strip, can put the reader back where they were.

     It starts at 1, not 0: the second banner is the one the client wants
     landed on, and the first then sits cropped at the left edge where it reads
     as something to go back to rather than as something skipped. */
  var promoIndex = 1;

  function renderPromos() {
    var stage = document.getElementById('promo-stage');
    var detail = document.getElementById('promo-detail');
    if (!stage || !detail) { return; }

    var items = content.PROMOS;
    var total = items.length;
    clear(stage);
    clear(detail);
    promoIndex = Math.min(promoIndex, total - 1);

    var track = el('div', 'promo-track');
    stage.appendChild(track);

    /* Two terms: centre slide 0 in the stage, then step by whole slides. Both
       are percentages of the track, which is exactly the stage width — see the
       note on .promo-track for why it must not carry a margin.

       The drag offset is appended as pixels. calc() will not take a bare
       negative after a plus, so the sign is folded into the operator. */
    function trackTransform(index, dragPx) {
      var drag = '';
      if (dragPx > 0) { drag = ' + ' + dragPx + 'px'; }
      else if (dragPx < 0) { drag = ' - ' + (-dragPx) + 'px'; }
      return 'translateX(calc((100% - var(--promo-slide-w)) / 2 - ' + index +
             ' * (var(--promo-slide-w) + var(--promo-slide-gap))' + drag + '))';
    }

    items.forEach(function (item, index) {
      var c = copy(item);
      var slide = el('div', 'promo-slide');
      slide.setAttribute('role', 'group');
      slide.setAttribute('aria-roledescription', 'slide');
      slide.setAttribute('aria-label', i18n.t('promo.slideOf', { n: index + 1, total: total }));
      var img = el('img');
      img.src = item.image;
      img.alt = c.alt || c.title;
      img.width = 1200;
      img.height = 675;
      img.loading = index === 0 ? 'eager' : 'lazy';
      img.decoding = 'async';
      /* Otherwise the browser's own image drag starts the moment the pointer
         moves, and the carousel never sees the gesture. */
      img.draggable = false;
      slide.appendChild(img);
      track.appendChild(slide);
    });

    /* Chevrons live on this row, flanking the words, not floating over the
       banners. Built before the text so the reading order matches the visual
       one: previous, what you are looking at, next. */
    var textBlock = el('div', 'promo-detail__text');
    var title = el('h3', 'promo-detail__title');
    /* Solid white, not .lead. --on-dark-muted is white at 78%, which holds on
       solid black but composites to 3.59:1 against the lightest ground the
       scrim can leave behind — under AA. On this panel the body copy has to
       be the full white. */
    var body = el('p', 'promo-detail__body');
    /* One call to action under the words, not one per banner: it points at
       whichever promotion the words are describing, so there is only ever one
       of it and its label changes with them.

       Always in the DOM, only ever hidden by opacity. Built with
       display: none it would be unreachable by keyboard, and a control that
       exists for a mouse and not for a tab key is not a control — which is why
       the stylesheet reveals it on :focus-within as well as on :hover. */
    var cta = el('a', 'promo-cta', i18n.t('promo.viewDetail'));
    cta.href = '#';
    textBlock.appendChild(title);
    textBlock.appendChild(body);

    /* The modulo is the loop: last to first and first to last, with no end
       stop in either direction. The track jumps rather than travels when it
       wraps — an unbroken slide would need the strip duplicated at both ends,
       which buys smoothness at the cost of three more images in the DOM. */
    function show(index) {
      promoIndex = (index + total) % total;
      track.style.transform = trackTransform(promoIndex, 0);
      var c = copy(items[promoIndex]);
      title.textContent = c.title;
      body.textContent = c.body;
      /* Names the promotion rather than saying "details", so a screen reader
         listing the page's links gets a destination rather than a word that
         means nothing on its own. */
      cta.setAttribute('aria-label', i18n.t('promo.viewDetail') + ' — ' + c.title);
    }

    function arrow(variant, path, step, key) {
      var button = el('button', 'promo-arrow promo-arrow--' + variant);
      button.type = 'button';
      /* Labelled here rather than through a relabel hook like the hero's:
         renderAll rebuilds this strip on every language change, so the labels
         are written fresh each time anyway. */
      button.setAttribute('aria-label', i18n.t(key));
      button.appendChild(icon(path, 20));
      button.addEventListener('click', function () { show(promoIndex + step); });
      return button;
    }

    detail.appendChild(textBlock);
    detail.appendChild(cta);
    /* The chevrons sit on the picture's own edges, so they belong to the stage
       rather than to the row of words below it. */
    if (total > 1) {
      stage.appendChild(arrow('prev', ['M15 5l-7 7 7 7'], -1, 'promo.prev'));
      stage.appendChild(arrow('next', ['M9 5l7 7-7 7'], 1, 'promo.next'));
    }

    show(promoIndex);
    if (total > 1) { initDrag(); }

    /* Drag the banners, by mouse or by finger. Pointer events cover both, so
       there is one code path rather than a mouse one and a touch one.

       The pointer is captured on the way down: without it, a drag that leaves
       the stage — which is easy, the banners run to the window edge — stops
       receiving moves and the strip freezes mid-gesture with no pointerup to
       release it.

       The threshold is a share of the slide rather than a fixed distance, so
       the same flick means the same thing on a phone and on a wide monitor.
       Under it the strip returns to where it was; over it, one slide moves.
       Never more than one, however far the drag went — a carousel that skips
       two banners because a gesture was enthusiastic is not answering the
       reader. */
    function initDrag() {
      var startX = 0;
      var delta = 0;
      var dragging = false;

      stage.addEventListener('pointerdown', function (e) {
        if (e.button) { return; }          /* primary button or touch only */
        /* The chevrons live on the stage now. Without this a press on one of
           them starts a drag, and the click that should have changed the slide
           is spent on a gesture that goes nowhere. */
        if (e.target.closest && e.target.closest('.promo-arrow')) { return; }
        dragging = true;
        delta = 0;
        startX = e.clientX;
        track.style.transition = 'none';
        stage.setPointerCapture(e.pointerId);
      });

      stage.addEventListener('pointermove', function (e) {
        if (!dragging) { return; }
        delta = e.clientX - startX;
        track.style.transform = trackTransform(promoIndex, delta);
      });

      function end() {
        if (!dragging) { return; }
        dragging = false;
        track.style.transition = '';
        var first = track.firstChild;
        var threshold = (first ? first.offsetWidth : 320) * 0.18;
        if (delta <= -threshold) { show(promoIndex + 1); }
        else if (delta >= threshold) { show(promoIndex - 1); }
        else { show(promoIndex); }
        delta = 0;
      }
      stage.addEventListener('pointerup', end);
      stage.addEventListener('pointercancel', end);
    }
  }

  function specRow(vehicle) {
    var row = el('div', 'spec-inline');
    [
      { key: 'seats', value: String(vehicle.seats) },
      { key: 'bags',  value: String(vehicle.bags) },
      { key: 'gear',  value: i18n.t('fleet.auto') }
    ].forEach(function (spec) {
      var item = el('span', 'spec');
      item.appendChild(icon(ICONS[spec.key], 18));
      item.appendChild(el('span', null, spec.value));
      row.appendChild(item);
    });
    return row;
  }

  function priceBlock(vehicle) {
    var box = el('div');
    if (activeDays) {
      box.appendChild(el('div', 'price-total',
        i18n.formatPrice(vehicle.pricePerDay * activeDays) + ' ' + i18n.t('fleet.total')));
      box.appendChild(el('div', 'price-breakdown',
        i18n.t('fleet.forDays', { n: activeDays }) + '  ·  ' +
        i18n.formatPrice(vehicle.pricePerDay) + i18n.t('fleet.perDay')));
    } else {
      /* No "from" label above it. The figure carries /day already, and the
         card is down to four lines — a caption on one of them reads as a
         fifth. */
      box.appendChild(el('div', 'price-total',
        i18n.formatPrice(vehicle.pricePerDay) + i18n.t('fleet.perDay')));
    }
    box.title = i18n.t('fleet.priceNote');
    return box;
  }

  function renderFleetGrid(tab) {
    var host = document.getElementById('fleet-grid');
    clear(host);

    data.fleetByTab(tab).forEach(function (vehicle, index) {
      var card = el('article', 'card card--vehicle');
      /* The card's place in the row, which app.css multiplies by --stagger to
         restage the set left to right. Set here rather than derived in CSS
         with :nth-child so that the delay survives the row being rebuilt with
         a different number of cards in it — and so the picture inside the
         card can inherit the same number instead of counting again. */
      card.style.setProperty('--i', String(index));

      /* The visible "stand-in" chip has been taken off the picture, but the
         alt text has not: thirteen of these sixteen cards show a different
         model, and the picture is a claim about which car the customer
         receives. A sighted visitor now has nothing telling them so — the
         honesty survives only for anyone reading the alt. */
      var alt = vehicle.imageIsStandIn
        ? i18n.t('fleet.standInFull')
        : vehicle.name + ' — ' + copy({ th: vehicle.classTh, en: vehicle.classEn });
      /* The frame is the size the three shots are written out at, 1200:838,
         so they fill it exactly and nothing letterboxes. It is that number
         rather than a round one because the sources arrived at three
         different sizes — 1492x1054, 1496x1051, 1502x1047 — and were cropped
         to one canonical frame on the way in. Left as they came, each card
         would have shown a hairline of ground that its neighbours did not.

         The one car still on an older photograph is the CR-V at 1.67:1, which
         shows about 14% as bands top and bottom until a framed shot arrives
         for it. */
      var shot = mediaOrPlaceholder(vehicle.image, vehicle.imageSlot, '1200:838', alt, true);
      card.appendChild(shot);

      var body = el('div', 'card-body');

      /* Name, then the class beneath it, then the three specs, then a rule and
         a price beside a link. That is the whole card in the wireframe, and
         everything that used to sit between those lines — the "or similar"
         second line, the best-deal and fuel badges, the checklist of what the
         rate includes — was ours rather than the wireframe's. */
      body.appendChild(el('h3', 'vehicle-name', vehicle.name));
      body.appendChild(el('p', 'vehicle-class',
        copy({ th: vehicle.classTh, en: vehicle.classEn })));

      body.appendChild(specRow(vehicle));

      var foot = el('div', 'vehicle-foot mt-auto');
      foot.appendChild(priceBlock(vehicle));
      var link = el('a', 'vehicle-cta', i18n.t('fleet.viewCar'));
      link.href = '#';
      link.setAttribute('aria-label', i18n.t('fleet.viewCar') + ' — ' + vehicle.name);
      foot.appendChild(link);
      body.appendChild(foot);

      card.appendChild(body);
      host.appendChild(card);
    });
    if (fleetScrollSync) { fleetScrollSync(); }
  }

  /* The two arrows under the fleet row. Built once, not per render: the row's
     contents change when a tab is chosen but the controls do not, and
     rebuilding them would throw away the scroll listener with them.

     They are disabled whenever there is nowhere to go: on arrival that is the
     left one, and at the end of the row the right one. A control that looks
     live and does nothing is worse than one that admits it cannot act. */
  function initFleetScroll() {
    var track = document.getElementById('fleet-grid');
    var nav = document.getElementById('fleet-nav');
    if (!track || !nav) { return; }

    function arrow(variant, path, dir, key) {
      var button = el('button', 'fleet-arrow fleet-arrow--' + variant);
      button.type = 'button';
      button.setAttribute('aria-label', i18n.t(key));
      button.appendChild(icon(path, 20));
      button.addEventListener('click', function () {
        var card = track.firstChild;
        /* One card plus its gap, so a press lands the next card where the
           last one started rather than part-way across two. */
        var step = card ? card.getBoundingClientRect().width + 24 : 320;
        /* The row still moves under reduced motion — it has to, or the arrow
           does nothing — it just does not travel there. This was the one
           smooth scroll on the page without the check that scrollToSection
           has been making all along. */
        track.scrollBy({
          left: dir * step,
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
            ? 'auto' : 'smooth'
        });
      });
      nav.appendChild(button);
      return button;
    }

    clear(nav);
    var prev = arrow('prev', ['M15 5l-7 7 7 7'], -1, 'fleet.prev');
    var next = arrow('next', ['M9 5l7 7-7 7'], 1, 'fleet.next');

    function sync() {
      var max = track.scrollWidth - track.clientWidth;
      /* A pixel of slack: sub-pixel layout leaves scrollLeft a hair short of
         max at the end of a scroll, which would keep "next" live forever. */
      prev.setAttribute('aria-disabled', String(track.scrollLeft <= 1));
      next.setAttribute('aria-disabled', String(track.scrollLeft >= max - 1));
    }
    sync();
    track.addEventListener('scroll', sync);
    if (typeof ResizeObserver === 'function') {
      new ResizeObserver(sync).observe(track);
    } else {
      root.addEventListener('resize', sync);
    }
    /* The row is rebuilt on every tab change and language switch, so the
       disabled state has to be recomputed after those too. */
    fleetScrollSync = sync;
  }

  var fleetScrollSync = null;

  function renderFleetTabs() {
    var host = document.getElementById('fleet-tabs');
    clear(host);
    data.TABS.forEach(function (tab) {
      var btn = el('button', 'tab', i18n.t('fleet.tab.' + tab));
      btn.type = 'button';
      btn.id = 'tab-' + tab;
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-controls', 'fleet-grid');
      btn.setAttribute('data-tab', tab);
      var selected = tab === data.DEFAULT_TAB;
      btn.setAttribute('aria-selected', String(selected));
      btn.tabIndex = selected ? 0 : -1;
      host.appendChild(btn);
    });
  }

  function selectTab(tab, focus) {
    var buttons = Array.prototype.slice.call(document.querySelectorAll('#fleet-tabs .tab'));
    buttons.forEach(function (btn) {
      var on = btn.getAttribute('data-tab') === tab;
      btn.setAttribute('aria-selected', String(on));
      btn.tabIndex = on ? 0 : -1;
      if (on && focus) { btn.focus(); }
    });
    renderFleetGrid(tab);
  }

  function initFleetTabs() {
    var host = document.getElementById('fleet-tabs');
    host.addEventListener('click', function (e) {
      var btn = e.target.closest('.tab');
      if (btn) { selectTab(btn.getAttribute('data-tab'), false); }
    });
    /* ARIA tabs pattern: arrows move between tabs, Home/End jump to the ends. */
    host.addEventListener('keydown', function (e) {
      var keys = ['ArrowRight', 'ArrowLeft', 'Home', 'End'];
      if (keys.indexOf(e.key) === -1) { return; }
      e.preventDefault();
      var tabs = data.TABS;
      var currentTab = document.querySelector('#fleet-tabs .tab[aria-selected="true"]');
      var index = tabs.indexOf(currentTab.getAttribute('data-tab'));
      var next;
      if (e.key === 'ArrowRight') { next = (index + 1) % tabs.length; }
      else if (e.key === 'ArrowLeft') { next = (index - 1 + tabs.length) % tabs.length; }
      else if (e.key === 'Home') { next = 0; }
      else { next = tabs.length - 1; }
      selectTab(tabs[next], true);
    });
  }

  function renderServices() {
    var host = document.getElementById('service-grid');
    clear(host);
    /* Bento: the first card stands tall down the left, the other two lie wide
       beside it. Orientation is positional rather than a property of the
       service — nothing about self-drive makes it the tall one — so it is
       decided here by index and not carried in content.js. */
    content.SERVICES.forEach(function (item, index) {
      var c = copy(item);
      var tall = index === 0;
      var card = el('article', 'service-card service-card--' + (tall ? 'tall' : 'wide'));
      /* The tall card's picture stands up; the wide ones lie down beside their
         words, so each takes the frame its own shape asks for. */
      /* The ratio is only a fallback shape for the placeholder — once a real
         picture is in, the stylesheet stretches it to fill the whole card and
         the aspect-ratio stops applying. */
      card.appendChild(mediaOrPlaceholder(item.image, item.imageSlot,
        tall ? '3:4' : '1:1', c.alt || c.title));
      /* The words sit on the picture, in a scrim that guarantees they are
         readable whatever the picture turns out to be. See .service-overlay. */
      var body = el('div', 'service-body service-overlay');
      body.appendChild(el('h3', null, c.title));
      body.appendChild(el('p', 'service-text', c.body));
      var btn = el('a', item.variant === 'primary' ? 'btn-primary mt-2' : 'btn-secondary mt-2', c.cta);
      btn.href = '#';
      body.appendChild(btn);
      card.appendChild(body);
      host.appendChild(card);
    });
  }

  /* An editorial list, not a card grid.

     Each of the three items carried a 16:9 placeholder — a grey box with an
     oval in it and the filename printed underneath — because none of them has
     a photograph and none is planned. Three of those in a row was the largest
     thing in the section and it was showing the absence of art at full size.
     The rule above each item does the dividing that the card edge used to,
     which is the whole trade: a card is a box drawn around content that had
     no box, and here there was nothing inside it that needed one.

     Nothing here is a link. The three items have no destinations in the
     content file, so they are articles rather than anchors — a hover state
     over something that cannot be opened is a promise the page cannot keep.
     The section's one real link is "view all", in the head.

     A photograph goes in above the rule when one exists, and the item is
     complete without one — which is the difference from every other picture on
     this page. mediaOrPlaceholder is not used here on purpose: its placeholder
     is a grey box naming the file the client still owes, and that is the right
     answer for a vehicle card, where a missing photograph is a gap in the
     catalogue. It is the wrong answer here. These three items have no
     photographs commissioned, so the absence is not a debt to display; the
     list is a finished design either way and simply gains an image when one
     arrives. Set `image` in content.js and it appears. */
  function renderNews() {
    var host = document.getElementById('news-grid');
    clear(host);
    content.NEWS.forEach(function (item) {
      var c = copy(item);
      var article = el('article', 'news-item');

      if (item.image) {
        var media = el('div', 'news-media');
        var img = el('img');
        img.src = item.image;
        /* Falls back to the headline rather than to empty. An empty alt says
           "decorative", and a news photograph beside a headline is not. */
        img.alt = c.alt || c.title;
        img.loading = 'lazy';
        img.decoding = 'async';
        img.width = 1000;
        img.height = 667;
        media.appendChild(img);
        article.appendChild(media);
        article.classList.add('news-item--illustrated');
      }

      var date = el('time', 'overline', i18n.formatDate(item.date));
      date.setAttribute('datetime', item.date);
      article.appendChild(date);
      article.appendChild(el('h3', 'news-title', c.title));
      article.appendChild(el('p', 'news-body', c.body));
      host.appendChild(article);
    });
  }

  function renderFAQ() {
    var host = document.getElementById('faq-list');
    clear(host);
    content.FAQ.forEach(function (item) {
      var c = copy(item);
      var wrap = el('div', 'acc-item');

      var trigger = el('button', 'acc-trigger');
      trigger.type = 'button';
      trigger.id = 'faq-t-' + item.id;
      trigger.setAttribute('aria-expanded', 'false');
      trigger.setAttribute('aria-controls', 'faq-p-' + item.id);
      trigger.appendChild(el('span', null, c.q));
      trigger.appendChild(el('span', 'acc-icon'));

      /* The answer opens by animating a grid row from 0fr to 1fr rather than
         by flipping `hidden`, which snapped. That needs the inner wrapper: the
         row is what animates and the wrapper is what carries the overflow.

         It stays in the DOM open or shut, so `hidden` cannot be what keeps it
         out of the accessibility tree any more — .acc-panel__inner takes
         visibility: hidden while collapsed, which removes it from the tree the
         same way and, unlike opacity or a zero height, is honoured by screen
         readers. It also transitions on the right side of the animation in
         both directions: on the way in it flips at the start so the text is
         present as the row grows, on the way out at the end so it does not
         vanish before the row has finished closing. */
      var panel = el('div', 'acc-panel');
      panel.id = 'faq-p-' + item.id;
      panel.setAttribute('role', 'region');
      panel.setAttribute('aria-labelledby', trigger.id);
      var inner = el('div', 'acc-panel__inner');
      inner.appendChild(el('p', null, c.a));
      panel.appendChild(inner);

      /* Multiple panels may stay open at once — people compare answers. */
      trigger.addEventListener('click', function () {
        var open = trigger.getAttribute('aria-expanded') === 'true';
        trigger.setAttribute('aria-expanded', String(!open));
        wrap.classList.toggle('is-open', !open);
      });

      wrap.appendChild(trigger);
      wrap.appendChild(panel);
      host.appendChild(wrap);
    });
  }

  function renderFooterColumns() {
    var host = document.getElementById('footer-columns');
    clear(host);
    content.FOOTER.forEach(function (column) {
      var col = el('div', 'footer-col');
      col.appendChild(el('h3', 'footer-heading', column[i18n.getLang()]));
      var ul = el('ul', 'footer-links');
      column.links.forEach(function (link) {
        var li = el('li');
        var a = el('a', null, link[i18n.getLang()]);
        a.href = '#';
        li.appendChild(a);
        ul.appendChild(li);
      });
      col.appendChild(ul);
      host.appendChild(col);
    });
  }

  /* ---------- chrome ---------------------------------------------------- */

  function initStickyHeader() {
    var header = document.getElementById('site-header');
    function onScroll() {
      header.classList.toggle('is-stuck', window.scrollY > 8);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function initDrawer() {
    var drawer = document.getElementById('drawer');
    var openBtn = document.getElementById('menu-open');
    var closeBtn = document.getElementById('menu-close');

    function focusables() {
      return Array.prototype.slice.call(
        drawer.querySelectorAll('a[href], button:not([disabled])')
      );
    }

    function open() {
      drawer.classList.add('is-open');
      drawer.removeAttribute('inert');
      document.body.classList.add('is-locked');
      openBtn.setAttribute('aria-expanded', 'true');
      var first = focusables()[0];
      if (first) { first.focus(); }
    }

    function close() {
      drawer.classList.remove('is-open');
      drawer.setAttribute('inert', '');
      document.body.classList.remove('is-locked');
      openBtn.setAttribute('aria-expanded', 'false');
      /* Focus belongs back on the control that opened the drawer. Reading
         document.activeElement at open time is unreliable — a click that
         originates anywhere but the button itself leaves it pointing at body,
         which cannot take focus, and the user is dumped at the top of the
         document. The trigger is always the right answer here. */
      openBtn.focus();
    }

    openBtn.addEventListener('click', open);
    closeBtn.addEventListener('click', close);

    document.addEventListener('keydown', function (e) {
      if (!drawer.classList.contains('is-open')) { return; }
      if (e.key === 'Escape') { close(); return; }
      if (e.key !== 'Tab') { return; }
      /* Trap focus inside the drawer while it is open. */
      var items = focusables();
      if (!items.length) { return; }
      var first = items[0];
      var last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    });

    Array.prototype.forEach.call(drawer.querySelectorAll('a[href^="#"]'), function (a) {
      a.addEventListener('click', close);
    });

    drawer.setAttribute('inert', '');
  }

  /* Two buttons rather than a select: with exactly two languages a toggle
     shows the current state without being opened. There may be more than one
     switcher on the page (header and drawer), so all of them stay in sync. */
  function initLangSwitcher() {
    var buttons = Array.prototype.slice.call(document.querySelectorAll('.lang-btn'));
    if (!buttons.length) { return; }

    function paint() {
      var current = i18n.getLang();
      buttons.forEach(function (btn) {
        btn.setAttribute('aria-pressed', String(btn.getAttribute('data-lang') === current));
      });
    }

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        i18n.setLang(btn.getAttribute('data-lang'));
      });
    });

    document.addEventListener('sixt:langchange', paint);
    paint();
  }

  /* Every block below the banner arrives as the reader reaches it. app.css
     carries the five entrance kinds and the argument for there being five;
     what lives here is the trigger and, more importantly, the arming.

     NOTHING IS HIDDEN BY THE STYLESHEET. The hidden states in app.css all sit
     behind .is-armed, and .is-armed is added on the line that starts observing
     the element — so a browser that never runs this file, or runs it and
     throws before this point, shows a finished page rather than a column of
     empty sections. That failure is the usual way this pattern ships broken,
     and it is silent: the page looks fine to whoever built it.

     Two paths skip the observer and mark everything revealed at once:

       — prefers-reduced-motion. There is no gentler form of "content appears
         as you scroll" worth offering; its honest reduced version is content
         that is already there. Nothing is armed, so nothing has to be undone.
       — no IntersectionObserver. Marking revealed rather than returning
         matters: the fleet row's restage is gated on #fleet being revealed,
         and a bare return would leave the tabs rebuilding the row with no
         animation for the rest of the session.

     Once each. The observer stops watching an element the moment it fires, so
     scrolling back up and down again does not replay the page — a section
     that re-animates every time it passes is a section arguing with whoever
     is reading it. */
  function initSectionReveals() {
    var nodes = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
    if (!nodes.length) { return; }

    function reveal(node) {
      node.classList.remove('is-armed');
      node.classList.add('is-revealed');
    }

    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || typeof IntersectionObserver !== 'function') {
      nodes.forEach(reveal);
      return;
    }

    /* -12% at the bottom, so a block starts arriving once it is properly into
       the window rather than the instant its first pixel clears the edge —
       otherwise the reader watches the animation from underneath it. The 0.01
       threshold is what makes that work for a section taller than the screen,
       which can never reach a percentage-based one. */
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) { return; }
        reveal(entry.target);
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.01 });

    nodes.forEach(function (node) {
      node.classList.add('is-armed');
      io.observe(node);
    });

    /* The foot of the page is a dead zone for that bottom inset, and this is
       what covers it.

       Shrinking the root by 12% means an element only counts once its top is
       12% of a screen above the window's bottom edge. For anything in the
       middle of the document that is exactly the delay we want. For anything
       whose top sits inside the last 12% of the DOCUMENT it is unreachable:
       scrolling runs out before the shrunken root ever gets there, the
       observer never fires, and the block stays at the opacity the arming put
       it at — permanently. On this page that was the footer's legal line, and
       it is the kind of bug that only shows up if someone scrolls all the way
       down and looks, which is the last thing anyone does.

       So: at the bottom of the document, whatever is still armed has arrived
       by definition. Reveal it and take the listener off — there is nowhere
       further to scroll and nothing left to wait for. Called once immediately
       as well, for a window tall enough to show the whole page at once. */
    function revealTail() {
      var bottom = window.scrollY + window.innerHeight;
      if (bottom < document.documentElement.scrollHeight - 2) { return; }
      nodes.forEach(function (node) {
        if (!node.classList.contains('is-armed')) { return; }
        reveal(node);
        io.unobserve(node);
      });
      window.removeEventListener('scroll', revealTail);
    }
    window.addEventListener('scroll', revealTail, { passive: true });
    revealTail();
  }

  var HEADER_OFFSET = 88; /* sticky utility bar + header */

  /* scrollTo({behavior:'smooth'}) is silently ignored in some environments —
     automation harnesses and a few embedded webviews among them — which would
     leave the search handoff looking broken. Try smooth, then verify we
     actually moved and jump outright if we did not. */
  function scrollToSection(target) {
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var top = Math.max(0, target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET);
    var start = window.scrollY;

    window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });

    if (reduce) { return; }
    window.setTimeout(function () {
      var moved = Math.abs(window.scrollY - start) > 2;
      var shouldMove = Math.abs(top - start) > 2;
      if (!moved && shouldMove) { window.scrollTo(0, top); }
    }, 350);
  }

  function initSearchHandoff() {
    var summary = document.getElementById('search-summary');
    var text = document.getElementById('search-summary-text');
    var editBtn = document.getElementById('search-summary-edit');
    var lastState = null;

    document.addEventListener('sixt:search', function (e) {
      lastState = e.detail.state;
      text.textContent = e.detail.summary;
      /* Removed, flushed, re-added — which restarts the chip's arrival on
         every search rather than only the first. A class that is already
         present does not re-trigger its animation, and the second search is
         exactly the case that needs it: the chip is on the page already and
         the only thing that changed is the words inside it. Reading
         offsetWidth is what forces the removal to be committed; without it the
         browser coalesces both changes into one frame and sees no change at
         all. */
      summary.classList.remove('is-visible');
      void summary.offsetWidth;
      summary.classList.add('is-visible');
      activeDays = i18n.rentalDays(lastState.pickupDate, lastState.returnDate);
      renderFleetGrid(currentTab()); /* prices become trip totals */
      /* The panel rides with the banner and has scrolled away by now, so there
         is nothing sitting on top of the results to fold. */
      scrollToSection(document.getElementById('fleet'));
    });

    editBtn.addEventListener('click', function () {
      /* The form lives on the banner at every width now, so editing always
         means going back up to it. */
      scrollToSection(document.getElementById('hero'));
      document.getElementById('pickup-location').focus();
    });

    /* Keep the summary readable after a language switch. */
    document.addEventListener('sixt:langchange', function () {
      if (lastState) { text.textContent = root.SIXT.booking.summarize(lastState); }
    });
  }

  function currentTab() {
    var active = document.querySelector('#fleet-tabs .tab[aria-selected="true"]');
    return active ? active.getAttribute('data-tab') : data.DEFAULT_TAB;
  }

  /* Everything built from data has to be rebuilt when the language changes.
     Nodes carrying [data-i18n] are handled separately by i18n.applyTo.
     The active tab is read first so a language switch does not reset it. */
  function renderAll() {
    var tab = currentTab();
    renderValueProps();
    renderPromos();
    renderFleetTabs();
    selectTab(tab, false);
    renderServices();
    renderNews();
    renderFAQ();
    renderFooterColumns();
  }

  function init() {
    i18n = root.SIXT.i18n;
    data = root.SIXT.data;
    content = root.SIXT.content;

    i18n.restore();   /* sets <html lang> and swaps every [data-i18n] node */
    initHeroSlider(); /* once only — renderAll must not restart the carousel */
    renderAll();      /* builds the tab strip before it is wired up */
    initFleetTabs();
    initFleetScroll();

    root.SIXT.booking.init();
    initStickyHeader();
    initDrawer();
    initLangSwitcher();
    initSearchHandoff();
    /* Last, and after renderAll: the staggered containers take their child
       index from :nth-child, so their children have to exist before anything
       is armed — and the observer has to measure blocks at their real height,
       which an empty container does not have. */
    initSectionReveals();

    document.addEventListener('sixt:langchange', function () {
      renderAll();
      if (heroRelabel) { heroRelabel(); }
    });
  }

  root.SIXT.ui = { init: init, renderAll: renderAll, selectTab: selectTab };
})(typeof window !== 'undefined' ? window : globalThis);
