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
      var mark = el('span', 'why-icon');
      mark.appendChild(icon(ICONS[item.icon], 20));
      box.appendChild(mark);
      box.appendChild(el('h3', 'text-[1.0625rem] mb-2', c.title));
      box.appendChild(el('p', 'lead text-[0.9375rem]', c.body));
      host.appendChild(box);
    });
  }

  function renderWhyMedia() {
    var host = document.getElementById('why-media');
    clear(host);
    /* 2:3 is the photograph's own ratio (1024×1536). Forcing it into 3:4 would
       crop the sunset sky, which is most of what makes the frame work. */
    host.appendChild(mediaOrPlaceholder(
      'assets/img/why-sixt.webp', 'why-sixt', '2:3', i18n.t('why.imageAlt')));
  }

  /* Four figures drawn from facts already stated elsewhere on the page — the
     branch list, the ISO badge and the SIXT history line in the footer. */
  var STATS = ['branches', 'countries', 'founded', 'support'];

  function renderStats() {
    var host = document.getElementById('stats-row');
    clear(host);
    STATS.forEach(function (key) {
      var box = el('div');
      box.appendChild(el('div', 'stat-value', i18n.t('stat.' + key + 'Value')));
      box.appendChild(el('div', 'stat-label mt-1', i18n.t('stat.' + key + 'Label')));
      host.appendChild(box);
    });
  }

  function renderPromos() {
    var host = document.getElementById('promo-grid');
    clear(host);
    content.PROMOS.forEach(function (item) {
      var c = copy(item);
      var card = el('article', 'card');
      /* 2:1 with contain — the banners are 2.54:1 and 2:1 with headlines baked
         into the artwork, so cropping to 16:9 cuts the words in half. */
      card.appendChild(mediaOrPlaceholder(item.image, item.imageSlot, '2:1', c.alt || c.title, true));
      var body = el('div', 'card-body');
      var badge = el('span', 'badge self-start', i18n.t('promo.badge'));
      body.appendChild(badge);
      body.appendChild(el('h3', 'text-[1.125rem]', c.title));
      body.appendChild(el('p', 'lead text-[0.9375rem] flex-1', c.body));
      var btn = el('a', 'btn-outline w-full mt-3', i18n.t('promo.view'));
      btn.href = '#';
      body.appendChild(btn);
      card.appendChild(body);
      host.appendChild(card);
    });
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
      card.appendChild(mediaOrPlaceholder(
        vehicle.image, vehicle.imageSlot, '16:9',
        vehicle.name + ' — ' + copy({ th: vehicle.classTh, en: vehicle.classEn }),
        true
      ));

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
    var overlay = document.getElementById('drawer-overlay');
    var openBtn = document.getElementById('menu-open');
    var closeBtn = document.getElementById('menu-close');

    function focusables() {
      return Array.prototype.slice.call(
        drawer.querySelectorAll('a[href], button:not([disabled])')
      );
    }

    function open() {
      drawer.classList.add('is-open');
      overlay.classList.add('is-open');
      drawer.removeAttribute('inert');
      document.body.classList.add('is-locked');
      openBtn.setAttribute('aria-expanded', 'true');
      var first = focusables()[0];
      if (first) { first.focus(); }
    }

    function close() {
      drawer.classList.remove('is-open');
      overlay.classList.remove('is-open');
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
    overlay.addEventListener('click', close);

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

  function initLangSwitcher() {
    var select = document.getElementById('lang-select');
    select.value = i18n.getLang();
    select.addEventListener('change', function () {
      i18n.setLang(select.value);
    });
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
      scrollToSection(document.getElementById('fleet'));
    });

    editBtn.addEventListener('click', function () {
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
    renderWhyMedia();
    renderStats();
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
    renderAll();      /* builds the tab strip before it is wired up */
    initFleetTabs();

    root.SIXT.booking.init();
    initStickyHeader();
    initDrawer();
    initLangSwitcher();
    initSearchHandoff();

    document.addEventListener('sixt:langchange', renderAll);
  }

  root.SIXT.ui = { init: init, renderAll: renderAll, selectTab: selectTab };
})(typeof window !== 'undefined' ? window : globalThis);
