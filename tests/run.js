/* Node entry point. Loads the same classic scripts the browser loads, into a
   context with no `document`, then runs the suite.
   Usage:  node tests/run.js   (exits non-zero when anything fails) */
'use strict';

var fs = require('fs');
var path = require('path');
var vm = require('vm');

var store = {};
var context = {
  console: console,
  require: require,
  __dirname: __dirname,
  localStorage: {
    getItem: function (k) {
      return Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null;
    },
    setItem: function (k, v) { store[k] = String(v); },
    removeItem: function (k) { delete store[k]; }
  }
};
context.window = context;
context.globalThis = context;
vm.createContext(context);

[
  '../assets/js/data.js',
  '../assets/js/content.js',
  '../assets/js/i18n.js',
  '../assets/js/booking.js',
  'harness.js',
  'tests.js'
].forEach(function (rel) {
  var file = path.join(__dirname, rel);
  if (!fs.existsSync(file)) { return; }
  vm.runInContext(fs.readFileSync(file, 'utf8'), context, { filename: rel });
});

var result = context.SIXT.test.run();
process.exit(result.fail === 0 ? 0 : 1);
