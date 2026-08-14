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

  function initHeroSlider() {
    var root_ = document.getElementById('hero-slider');
    if (!root_) { return; }

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

    if (total < 2) { return; } /* one slide needs no controls */

    function show(index) {
      heroIndex = (index + total) % total;
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
      button.addEventListener('click', function () { show(heroIndex + step); });
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

    /* Reduced motion: the slide still changes, it just does not fade. */
    if (reduce) {
      figures.forEach(function (fig) { fig.style.transition = 'none'; });
    }

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
      { key: 'gear',  value: 'A' },
      { key: 'snow',  value: i18n.t('fleet.ac') }
    ].forEach(function (spec) {
      var item = el('span', 'spec');
      item.appendChild(icon(ICONS[spec.key], 18));
      item.appendChild(el('span', null, spec.value));
      row.appendChild(item);
    });
    return row;
  }

  function includeList() {
    var ul = el('ul', 'include-list');
    content.FLEET_INCLUDES.forEach(function (item) {
      var li = el('li');
      li.appendChild(icon(ICONS.check, 14));
      li.appendChild(el('span', null, item[i18n.getLang()]));
      ul.appendChild(li);
    });
    return ul;
  }

  /* Once a search has run we know the rental length, so the card can lead with
     the trip total the way a results listing does. Before that there is no
     duration to multiply by and it stays a daily rate. */
  function priceBlock(vehicle) {
    var box = el('div');
    if (activeDays) {
      box.appendChild(el('div', 'price-total',
        i18n.formatPrice(vehicle.pricePerDay * activeDays) + ' ' + i18n.t('fleet.total')));
      box.appendChild(el('div', 'price-breakdown',
        i18n.t('fleet.forDays', { n: activeDays }) + '  ·  ' +
        i18n.formatPrice(vehicle.pricePerDay) + i18n.t('fleet.perDay')));
    } else {
      box.appendChild(el('div', 'overline', i18n.t('fleet.from')));
      box.appendChild(el('div', 'price-total',
        i18n.formatPrice(vehicle.pricePerDay) + i18n.t('fleet.perDay')));
    }
    box.title = i18n.t('fleet.priceNote');
    return box;
  }

  function renderFleetGrid(tab) {
    var host = document.getElementById('fleet-grid');
    clear(host);
    var cheapest = data.cheapestIn(tab);

    data.fleetByTab(tab).forEach(function (vehicle) {
      var card = el('article', 'card card--vehicle');

      /* Borrowed photographs get an explicit label and honest alt text — the
         picture is otherwise a claim about which car the customer receives. */
      var alt = vehicle.imageIsStandIn
        ? i18n.t('fleet.standInFull')
        : vehicle.name + ' — ' + copy({ th: vehicle.classTh, en: vehicle.classEn });
      var shot = mediaOrPlaceholder(vehicle.image, vehicle.imageSlot, '16:9', alt, true);
      if (vehicle.imageIsStandIn) {
        shot.style.position = 'relative';
        var flag = el('span', 'standin-flag', i18n.t('fleet.standIn'));
        flag.title = i18n.t('fleet.standInFull');
        shot.appendChild(flag);
      }
      card.appendChild(shot);

      var body = el('div', 'card-body');

      /* "or similar" gets its own line rather than trailing the name. In a
         four-up grid it otherwise wraps on the longer names only, which drops
         that one card's specs and checklist out of line with its neighbours. */
      var nameRow = el('h3', 'vehicle-name');
      nameRow.appendChild(el('span', 'block', vehicle.name));
      nameRow.appendChild(el('span', 'vehicle-similar block', i18n.t('fleet.orSimilar')));
      body.appendChild(nameRow);

      var badges = el('div', 'flex flex-wrap items-center gap-2');
      if (cheapest && vehicle.id === cheapest.id) {
        badges.appendChild(el('span', 'badge-deal', i18n.t('fleet.bestDeal')));
      }
      var fuelBadge = el('span', 'badge-spec');
      fuelBadge.appendChild(icon(ICONS.fuel, 13));
      fuelBadge.appendChild(el('span', null, i18n.t('fuel.' + vehicle.fuel)));
      badges.appendChild(fuelBadge);
      body.appendChild(badges);

      body.appendChild(specRow(vehicle));
      body.appendChild(includeList());

      var foot = el('div', 'mt-auto pt-4');
      foot.style.borderTop = '1px solid var(--grey-200)';
      foot.appendChild(priceBlock(vehicle));
      var btn = el('a', 'btn-outline w-full mt-4', i18n.t('fleet.viewCar'));
      btn.href = '#';
      foot.appendChild(btn);
      body.appendChild(foot);

      card.appendChild(body);
      host.appendChild(card);
    });
  }

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
    content.SERVICES.forEach(function (item) {
      var c = copy(item);
      var card = el('article', 'service-card');
      card.appendChild(mediaOrPlaceholder(item.image, item.imageSlot, '3:4', c.title));
      var body = el('div', 'service-body');
      body.appendChild(el('h3', null, c.title));
      body.appendChild(el('p', 'service-text', c.body));
      var btn = el('a', item.variant === 'primary' ? 'btn-primary mt-2' : 'btn-secondary mt-2', c.cta);
      btn.href = '#';
      body.appendChild(btn);
      card.appendChild(body);
      host.appendChild(card);
    });
  }

  function renderNews() {
    var host = document.getElementById('news-grid');
    clear(host);
    content.NEWS.forEach(function (item) {
      var c = copy(item);
      var card = el('article', 'card');
      card.appendChild(mediaOrPlaceholder(null, item.imageSlot, '16:9', c.title));
      var body = el('div', 'card-body');
      var date = el('time', 'overline', i18n.formatDate(item.date));
      date.setAttribute('datetime', item.date);
      body.appendChild(date);
      body.appendChild(el('h3', 'text-[1.125rem] leading-snug clamp-2', c.title));
      body.appendChild(el('p', 'lead text-[0.9375rem] clamp-2', c.body));
      card.appendChild(body);
      host.appendChild(card);
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

      var panel = el('div', 'acc-panel');
      panel.id = 'faq-p-' + item.id;
      panel.setAttribute('role', 'region');
      panel.setAttribute('aria-labelledby', trigger.id);
      panel.hidden = true;
      panel.appendChild(el('p', null, c.a));

      /* Multiple panels may stay open at once — people compare answers. */
      trigger.addEventListener('click', function () {
        var open = trigger.getAttribute('aria-expanded') === 'true';
        trigger.setAttribute('aria-expanded', String(!open));
        panel.hidden = open;
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
      var col = el('div');
      col.appendChild(el('h3', 'footer-heading', column[i18n.getLang()]));
      var ul = el('ul', 'flex flex-col gap-2');
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

    root.SIXT.booking.init();
    initStickyHeader();
    initDrawer();
    initLangSwitcher();
    initSearchHandoff();

    document.addEventListener('sixt:langchange', function () {
      renderAll();
      if (heroRelabel) { heroRelabel(); }
    });
  }

  root.SIXT.ui = { init: init, renderAll: renderAll, selectTab: selectTab };
})(typeof window !== 'undefined' ? window : globalThis);
