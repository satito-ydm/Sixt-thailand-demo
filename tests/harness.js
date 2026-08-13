/* Zero-dependency test harness. Runs identically in Node (via tests/run.js)
   and in a browser (via tests/index.html). */
(function (root) {
  'use strict';
  root.SIXT = root.SIXT || {};

  var cases = [];

  function test(name, fn) {
    cases.push({ name: name, fn: fn });
  }

  function eq(actual, expected, msg) {
    var a = JSON.stringify(actual);
    var e = JSON.stringify(expected);
    if (a !== e) {
      throw new Error((msg ? msg + ': ' : '') + 'expected ' + e + ' but got ' + a);
    }
  }

  function ok(value, msg) {
    if (!value) {
      throw new Error(msg || 'expected truthy but got ' + JSON.stringify(value));
    }
  }

  function throws(fn, msg) {
    var threw = false;
    try { fn(); } catch (e) { threw = true; }
    if (!threw) { throw new Error(msg || 'expected the function to throw'); }
  }

  function run() {
    var pass = 0;
    var fail = 0;
    var lines = [];

    cases.forEach(function (c) {
      try {
        c.fn();
        pass++;
        lines.push({ ok: true, text: 'PASS  ' + c.name });
      } catch (err) {
        fail++;
        lines.push({ ok: false, text: 'FAIL  ' + c.name + '\n      ' + err.message });
      }
    });

    var summary = fail === 0
      ? 'All ' + pass + ' tests passed'
      : fail + ' failed, ' + pass + ' passed';

    if (typeof document !== 'undefined') {
      var ul = document.getElementById('results');
      lines.forEach(function (l) {
        var li = document.createElement('li');
        li.className = l.ok ? 'pass' : 'fail';
        li.textContent = l.text;
        ul.appendChild(li);
      });
      var s = document.getElementById('summary');
      s.textContent = summary;
      s.className = fail === 0 ? 'pass' : 'fail';
    } else {
      lines.forEach(function (l) { if (!l.ok) { console.log(l.text); } });
      console.log(summary);
    }

    return { pass: pass, fail: fail };
  }

  root.SIXT.test = { test: test, eq: eq, ok: ok, throws: throws, run: run };
})(typeof window !== 'undefined' ? window : globalThis);
