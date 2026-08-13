/* SIXT Thailand — booking widget.
   Pure rules (validate, summarize) are separated from DOM wiring (init) so the
   rules can be unit-tested in Node with no browser.
   This is a prototype: nothing is submitted to a server. */
(function (root) {
  'use strict';
  root.SIXT = root.SIXT || {};

  /* ---------- pure ---------------------------------------------------- */

  /* state: {
       pickupLocation, returnLocation, differentReturn,
       pickupDate, pickupTime, returnDate, returnTime
     }
     Returns { valid: boolean, errors: { fieldName: i18nKey } } */
  function validate(state) {
    var s = state || {};
    var errors = {};

    if (!s.pickupLocation) {
      errors.pickupLocation = 'booking.err.pickupLocationRequired';
    }
    if (s.differentReturn && !s.returnLocation) {
      errors.returnLocation = 'booking.err.returnLocationRequired';
    }
    if (!s.pickupDate) {
      errors.pickupDate = 'booking.err.pickupDateRequired';
    }
    if (!s.returnDate) {
      errors.returnDate = 'booking.err.returnDateRequired';
    }

    if (s.pickupDate && s.returnDate) {
      if (s.returnDate < s.pickupDate) {
        errors.returnDate = 'booking.err.returnBeforePickup';
      } else if (s.returnDate === s.pickupDate &&
                 s.pickupTime && s.returnTime &&
                 s.returnTime <= s.pickupTime) {
        errors.returnTime = 'booking.err.returnTimeBeforePickup';
      }
    }

    return { valid: Object.keys(errors).length === 0, errors: errors };
  }

  /* "สุวรรณภูมิ (สนามบิน) · 15–16 ส.ค. 2569 · 2 วัน" */
  function summarize(state, lang) {
    var i18n = root.SIXT.i18n;
    var data = root.SIXT.data;
    var l = lang || i18n.getLang();
    var parts = [];

    var pickup = data.findLocation(state.pickupLocation);
    var drop = state.differentReturn ? data.findLocation(state.returnLocation) : null;

    if (pickup) {
      parts.push(drop ? pickup[l] + ' → ' + drop[l] : pickup[l]);
    }
    if (state.pickupDate && state.returnDate) {
      parts.push(i18n.formatDateRange(state.pickupDate, state.returnDate, l));
      parts.push(i18n.t('booking.summaryDays', {
        n: i18n.rentalDays(state.pickupDate, state.returnDate)
      }));
    }
    return parts.join(' · ');
  }

  /* ---------- DOM ------------------------------------------------------ */

  var FIELDS = ['pickupLocation', 'returnLocation', 'pickupDate', 'pickupTime',
                'returnDate', 'returnTime'];

  function todayISO() {
    var d = new Date();
    function pad(n) { return (n < 10 ? '0' : '') + n; }
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  function readState(form) {
    return {
      pickupLocation: form.querySelector('#pickup-location-id').value,
      returnLocation: form.querySelector('#return-location-id').value,
      differentReturn: !form.querySelector('#return-location-row').hidden,
      pickupDate: form.querySelector('#pickup-date').value,
      pickupTime: form.querySelector('#pickup-time').value,
      returnDate: form.querySelector('#return-date').value,
      returnTime: form.querySelector('#return-time').value
    };
  }

  function clearErrors(form) {
    FIELDS.forEach(function (name) {
      var msg = form.querySelector('#err-' + name);
      if (msg) { msg.classList.remove('is-visible'); msg.textContent = ''; }
      var input = form.querySelector('[data-field="' + name + '"]');
      if (input) { input.setAttribute('aria-invalid', 'false'); }
    });
  }

  function showErrors(form, errors) {
    var first = null;
    Object.keys(errors).forEach(function (name) {
      var msg = form.querySelector('#err-' + name);
      if (msg) {
        msg.textContent = root.SIXT.i18n.t(errors[name]);
        msg.classList.add('is-visible');
      }
      var input = form.querySelector('[data-field="' + name + '"]');
      if (input) {
        input.setAttribute('aria-invalid', 'true');
        if (!first) { first = input; }
      }
    });
    if (first) { first.focus(); }
  }

  /* Searchable location combobox, built on a text input plus a listbox.
     Follows the ARIA combobox pattern: arrows move the active option,
     Enter selects, Escape closes. */
  function initCombobox(wrapper) {
    var input = wrapper.querySelector('input[type="text"]');
    var hidden = wrapper.querySelector('input[type="hidden"]');
    var list = wrapper.querySelector('.combo-list');
    var i18n = root.SIXT.i18n;
    var data = root.SIXT.data;
    var options = [];
    var activeIndex = -1;

    function close() {
      list.hidden = true;
      input.setAttribute('aria-expanded', 'false');
      input.removeAttribute('aria-activedescendant');
      activeIndex = -1;
    }

    function highlight(index) {
      options.forEach(function (o) { o.el.classList.remove('is-active'); });
      activeIndex = index;
      if (index >= 0 && options[index]) {
        options[index].el.classList.add('is-active');
        input.setAttribute('aria-activedescendant', options[index].el.id);
        options[index].el.scrollIntoView({ block: 'nearest' });
      }
    }

    function choose(index) {
      if (index < 0 || !options[index]) { return; }
      var loc = options[index].loc;
      hidden.value = loc.id;
      input.value = loc[i18n.getLang()];
      input.setAttribute('aria-invalid', 'false');
      close();
    }

    function build(query) {
      var lang = i18n.getLang();
      var q = (query || '').trim().toLowerCase();
      list.innerHTML = '';
      options = [];

      ['bangkok', 'upcountry'].forEach(function (group) {
        var matches = data.locationsByGroup(group).filter(function (loc) {
          if (!q) { return true; }
          return loc.th.toLowerCase().indexOf(q) !== -1 ||
                 loc.en.toLowerCase().indexOf(q) !== -1;
        });
        if (!matches.length) { return; }

        var head = document.createElement('li');
        head.className = 'combo-group';
        head.setAttribute('role', 'presentation');
        head.textContent = i18n.t('group.' + group) + ' (' + matches.length + ')';
        list.appendChild(head);

        matches.forEach(function (loc) {
          var li = document.createElement('li');
          li.className = 'combo-option';
          li.id = 'opt-' + wrapper.id + '-' + loc.id;
          li.setAttribute('role', 'option');
          li.setAttribute('aria-selected', hidden.value === loc.id ? 'true' : 'false');
          li.textContent = loc[lang];
          var index = options.length;
          li.addEventListener('mousedown', function (e) {
            e.preventDefault(); /* keep focus on the input */
            choose(index);
          });
          list.appendChild(li);
          options.push({ el: li, loc: loc });
        });
      });

      if (!options.length) {
        var empty = document.createElement('li');
        empty.className = 'combo-empty';
        empty.setAttribute('role', 'presentation');
        empty.textContent = i18n.t('booking.noMatch');
        list.appendChild(empty);
      }
    }

    /* The bar can be docked to the bottom of the window, where a list opening
       downward would fall off the screen. Flip it above the input when there
       is not enough room below. */
    function placeList() {
      var space = window.innerHeight - input.getBoundingClientRect().bottom;
      list.classList.toggle('combo-list--up', space < 300);
    }

    /* When a location is already chosen the input holds its full name, which
       would filter the list down to that one entry. Show everything instead. */
    function open() {
      build(hidden.value ? '' : input.value);
      placeList();
      list.hidden = false;
      input.setAttribute('aria-expanded', 'true');
    }

    input.addEventListener('focus', open);
    input.addEventListener('input', function () {
      hidden.value = '';
      build(input.value);
      placeList();
      list.hidden = false;
      input.setAttribute('aria-expanded', 'true');
      highlight(options.length ? 0 : -1);
    });
    input.addEventListener('blur', function () { window.setTimeout(close, 120); });

    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (list.hidden) { open(); }
        if (!options.length) { return; }
        var next = e.key === 'ArrowDown'
          ? (activeIndex + 1) % options.length
          : (activeIndex <= 0 ? options.length - 1 : activeIndex - 1);
        highlight(next);
      } else if (e.key === 'Enter') {
        if (!list.hidden && activeIndex >= 0) {
          e.preventDefault();
          choose(activeIndex);
        }
      } else if (e.key === 'Escape') {
        close();
      }
    });

    /* Re-label the visible text when the page language changes. */
    document.addEventListener('sixt:langchange', function () {
      if (hidden.value) {
        var loc = data.findLocation(hidden.value);
        if (loc) { input.value = loc[i18n.getLang()]; }
      }
      if (!list.hidden) { build(input.value); }
    });
  }

  function init() {
    if (typeof document === 'undefined') { return; }
    var form = document.getElementById('booking-form');
    if (!form) { return; }

    Array.prototype.forEach.call(form.querySelectorAll('.combo'), initCombobox);

    var pickupDate = form.querySelector('#pickup-date');
    var returnDate = form.querySelector('#return-date');
    pickupDate.min = todayISO();
    returnDate.min = todayISO();
    pickupDate.addEventListener('change', function () {
      returnDate.min = pickupDate.value || todayISO();
      if (returnDate.value && returnDate.value < returnDate.min) {
        returnDate.value = returnDate.min;
      }
    });

    var toggle = form.querySelector('#toggle-return-location');
    var returnRow = form.querySelector('#return-location-row');
    toggle.addEventListener('click', function () {
      var opening = returnRow.hidden;
      returnRow.hidden = !opening;
      toggle.setAttribute('aria-expanded', String(opening));
      toggle.setAttribute('data-i18n', opening ? 'booking.sameReturn' : 'booking.differentReturn');
      toggle.textContent = root.SIXT.i18n.t(opening ? 'booking.sameReturn' : 'booking.differentReturn');
      if (opening) { returnRow.querySelector('input[type="text"]').focus(); }
      else { form.querySelector('#return-location-id').value = ''; }
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      clearErrors(form);
      var state = readState(form);
      var result = validate(state);
      if (!result.valid) {
        showErrors(form, result.errors);
        return;
      }
      document.dispatchEvent(new CustomEvent('sixt:search', {
        detail: { state: state, summary: summarize(state) }
      }));
    });
  }

  root.SIXT.booking = {
    validate: validate,
    summarize: summarize,
    init: init
  };
})(typeof window !== 'undefined' ? window : globalThis);
