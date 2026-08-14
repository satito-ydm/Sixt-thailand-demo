/* Verifies every text/background pair used on the page against its WCAG 2.1
   threshold. Reads the real values out of tokens.css so it cannot drift.

   Usage:  node tools/check-contrast.js      (exits non-zero on any failure)

   Thresholds: 4.5:1 normal text, 3.0:1 large text (>=18.66px bold or >=24px),
   3.0:1 non-text UI such as borders, focus rings and icons. */
'use strict';

var fs = require('fs');
var path = require('path');

var css = fs.readFileSync(path.join(__dirname, '..', 'assets', 'css', 'tokens.css'), 'utf8');

function token(name) {
  var m = css.match(new RegExp('--' + name + ':\\s*(#[0-9A-Fa-f]{6})'));
  if (!m) { throw new Error('token not found in tokens.css: --' + name); }
  return m[1];
}

function channel(v) {
  var c = v / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function luminance(hex) {
  var r = parseInt(hex.slice(1, 3), 16);
  var g = parseInt(hex.slice(3, 5), 16);
  var b = parseInt(hex.slice(5, 7), 16);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function ratio(a, b) {
  var la = luminance(a);
  var lb = luminance(b);
  var hi = Math.max(la, lb);
  var lo = Math.min(la, lb);
  return (hi + 0.05) / (lo + 0.05);
}

/* --on-dark-muted is rgba, so composite it over its band before measuring. */
function over(rgbaHexish, alpha, bgHex) {
  function mix(i) {
    var fg = parseInt(rgbaHexish.slice(1 + i * 2, 3 + i * 2), 16);
    var bg = parseInt(bgHex.slice(1 + i * 2, 3 + i * 2), 16);
    return Math.round(fg * alpha + bg * (1 - alpha));
  }
  return '#' + [0, 1, 2].map(function (i) {
    return ('0' + mix(i).toString(16)).slice(-2);
  }).join('').toUpperCase();
}

var C = {
  orange: token('sixt-orange'),
  orangeDeep: token('sixt-orange-deep'),
  black: token('sixt-black'),
  white: token('white'),
  grey50: token('grey-50'),
  grey200: token('grey-200'),
  grey500: token('grey-500'),
  borderInput: token('border-input'),
  error: token('error')
};

C.onDarkMuted = over(C.white, 0.78, C.black);
/* The language toggle on the dark header: a translucent track with
   translucent type on it, so both need compositing before measurement. */
C.langTrackDark = over(C.white, 0.14, C.black);
C.langIdleDark = over(C.white, 0.72, C.langTrackDark);
/* Not a token — measured here to document why the orange band has no muted
   text tone. See the note in tokens.css. */
C.orangeMutedRejected = over(C.black, 0.78, C.orange);

var PAIRS = [
  // where                                  fg            bg          min   note
  ['body text on white',                    C.black,      C.white,    4.5, ''],
  ['body text on grey-50',                  C.black,      C.grey50,   4.5, ''],
  ['secondary text on white',               C.grey500,    C.white,    4.5, ''],
  ['secondary text on grey-50',             C.grey500,    C.grey50,   4.5, ''],
  ['error text on white',                   C.error,      C.white,    4.5, ''],
  ['.btn-primary label (19px bold)',        C.white,      C.orange,   3.0,
    'passes only as WCAG large text — .btn-primary is locked to 19px/700'],
  ['.btn-primary label on hover',           C.white,      C.orangeDeep, 3.0,
    'same large-text rule'],
  ['.btn-hotline on the black header',      C.orange,     C.black,    3.0,
    'orange text, not a button — comfortable on this ground'],
  ['.btn-hotline on the white header',      C.orange,     C.white,    3.0,
    'the tight one: 3.28:1 is legal only because .btn-hotline holds 19px/700'],
  ['.btn-hotline hover on the white header', C.orangeDeep, C.white,   3.0, ''],
  ['header nav on the black state',          C.white,     C.black,    4.5, ''],
  ['header focus ring on the black state',   C.white,     C.black,    3.0,
    'the orange ring is 1.9:1 on black'],
  ['.lang-btn idle on the black state',      C.langIdleDark, C.langTrackDark, 4.5,
    'white at 72% over a 14% white track, both composited over black'],
  ['.lang-btn active on the black state',    C.black,     C.white,    4.5, ''],
  ['.lang-btn active on the white state',    C.white,     C.black,    4.5, ''],
  ['.lang-btn idle on grey-50',              C.grey500,    C.grey50,  4.5, ''],
  ['.btn-secondary label',                  C.white,      C.black,    4.5, ''],
  ['.btn-outline label',                    C.black,      C.white,    4.5, ''],
  ['.btn-outline label on the orange hover', C.white,     C.orange,   3.0,
    'white on orange, legal only as large text — .btn-outline is held at ' +
    '19px/700 for this and nothing else. Drop it to 16px and this pair needs ' +
    '4.5 and fails'],
  ['.badge label on black',                 C.white,      C.black,    4.5,
    '11px, so it must clear the normal-text bar — this is why the badge is not orange'],
  ['footer link on black',                  C.white,      C.black,    4.5, ''],
  ['focus ring (non-text) on white',        C.orange,     C.white,    3.0, ''],
  ['focus ring (non-text) on grey-50',      C.orange,     C.grey50,   3.0, ''],
  ['active tab underline (non-text)',       C.orange,     C.white,    3.0, ''],
  ['input border on white',                 C.borderInput, C.white,   3.0,
    'WCAG 1.4.11 — an input boundary is a UI component, not decoration'],

  // The booking panel, now a black card. Its fields stay white, so the field
  // pairs above still hold; these are the ones the new ground changed.
  ['booking title on the dark panel',       C.white,      C.black,    4.5, ''],
  ['booking sub-line on the dark panel',    C.onDarkMuted, C.black,   4.5,
    '--grey-500 would be 3.3:1 here, which is why the panel uses the wash'],
  ['field labels on the dark panel',        C.onDarkMuted, C.black,   4.5, ''],
  ['return-location toggle on the panel',   C.white,      C.black,    4.5, ''],
  ['that toggle on hover',                  C.orange,     C.black,    4.5,
    '14px bold is not large text, so this one has to clear the full bar'],
  ['white field against the dark panel',    C.white,      C.black,    3.0,
    'the field edge is its own boundary here — 1.4.11 met by the card itself'],
  ['input border on grey-50',               C.borderInput, C.grey50,  3.0, ''],

  // the value-prop band — a plain white ground, no heading, no boxes. Title
  // and copy are on the page's own ground, so the on-white pairs at the top
  // already carry them; the ringed icon is all this band adds.
  ['value-prop icon tile against white (non-text)', C.orange, C.white, 3.0,
    'the tile edge — decoration beside a title that says the same thing in ' +
    'words, which is what makes 3.0 the right bar for it'],
  ['value-prop glyph on the orange tile (non-text)', C.white, C.orange, 3.0,
    'the tightest pair in the band — it clears 3.0 as decoration and would ' +
    'fail 4.5 as a word, and it depends on the tile keeping its fill'],

  /* .band-dark is not applied anywhere in the markup right now — the
     promotions panel borrowed it for one revision and gave it back. The pairs
     stay because the footer and the service cards are still black-on-white
     inversions measured against the same two colours. */
  // .band-dark — service cards, footer
  ['heading on the black band',             C.white,      C.black,    4.5, ''],
  ['muted copy on the black band',          C.onDarkMuted, C.black,   4.5,
    'white at 78% — --grey-500 reaches only 3.3:1 here and cannot be used'],
  ['focus ring on the black band',          C.white,      C.black,    3.0,
    'the orange ring is 1.9:1 on black — .band-dark swaps it to white'],
  ['white button on a service card',        C.black,      C.white,    4.5, ''],

  ['promo CTA label on its white fill',     C.black,      C.white,    4.5,
    'the one element on the orange strip that brings its own ground — the ' +
    'fill is what stops its contrast depending on the photograph behind it'],

  /* Otherwise the promotions section carries no pair of its own. The orange panel is a
     photograph set behind the banners and nothing is written on it — the
     heading and the detail sit on the page's own white, which the on-white
     pairs at the top of this list already cover. That is exactly why they
     were moved off the artwork; see the note on .promo-detail in app.css. */

  // .band-orange — membership
  ['heading on the orange band',            C.black,      C.orange,   4.5,
    'this is why the orange band sets black text, not white'],
  ['body copy on the orange band',          C.black,      C.orange,   4.5,
    'solid black at weight 300 — a lighter tone cannot pass here'],
  ['inverted CTA on the orange band',       C.white,      C.black,    4.5, ''],
  ['focus ring on the orange band',         C.black,      C.orange,   3.0, ''],
  ['heading rule on the orange band',       C.black,      C.orange,   3.0,
    'the kickers are gone site-wide; this stays because the membership band ' +
    'still inverts black onto orange for everything it draws']
];

/* --grey-200 is intentionally absent above. It edges cards and dividers, which
   carry no information and are exempt from 1.4.11; it must never be used on an
   interactive control. */

// Documented as failing on purpose, so nobody "fixes" it by shipping it.
var FORBIDDEN = [
  ['white on orange at normal text size',   C.white,      C.orange,   4.5,
    'never allowed below 19px bold — use black text or a black ground instead'],
  ['.btn-outline hover if the button were dropped back to 16px', C.white, C.orange, 4.5,
    'the same colours the button now uses, measured against the bar they ' +
    'would face at normal text size — this is what the 19px is buying'],
  ['black at 78% on orange',                C.orangeMutedRejected, C.orange, 4.5,
    'why the orange band has no muted text tone; hierarchy uses weight instead'],
  ['promo copy written in white on the orange panel', C.white, C.orange, 4.5,
    'the reason the detail sits on the page rather than on the artwork: the ' +
    'panel is a photograph running bright orange to dark red, and no single ' +
    'ink clears AA across that range at body size'],
  ['black ink on an orange ground one shade darker', C.black, C.orangeDeep, 4.5,
    'why nothing black-inked may sit on --sixt-orange-deep: 4.14 is under AA, ' +
    'and it is the trap any darkening of an orange ground walks into'],
  ['the value-prop glyph left white on an unfilled tile', C.white, C.white, 3.0,
    'the standing trap of this band: it has changed ground four times and ' +
    'the glyph has had to change with it every time. White needs the orange ' +
    'fill behind it — take the fill away and the glyph goes with it'],
  ['the value-prop glyph left orange on the filled tile', C.orange, C.orange, 3.0,
    'the same trap from the other side, and the one that actually happened ' +
    'when the tile stopped being a hollow ring'],
  ['the value-prop glyph as a white word on the tile', C.white, C.orange, 4.5,
    'it passes at 3.28:1 as decoration and fails as text — nothing in this ' +
    'tile may ever become a letter or a number'],
  ['the value-prop icon tile as text-weight orange', C.orange, C.white,  4.5,
    'the tile clears 1.4.11 at 3.28:1 and nothing more — it may never be ' +
    'asked to carry a word, a number or a meaning the title does not repeat']
];

var failures = 0;

console.log('WCAG contrast check — values read from tokens.css\n');
PAIRS.forEach(function (p) {
  var r = ratio(p[1], p[2]);
  var ok = r >= p[3];
  if (!ok) { failures++; }
  console.log(
    (ok ? '  PASS  ' : '  FAIL  ') +
    r.toFixed(2).padStart(5) + ':1  (needs ' + p[3].toFixed(1) + ')  ' +
    p[0] + (p[4] ? '\n           ' + p[4] : '')
  );
});

console.log('\nKnown-bad combination, guarded against in app.css:');
FORBIDDEN.forEach(function (p) {
  var r = ratio(p[1], p[2]);
  console.log('  ' + r.toFixed(2) + ':1  (would need ' + p[3].toFixed(1) + ')  ' +
    p[0] + '\n           ' + p[4]);
});

console.log('');
if (failures) {
  console.log(failures + ' pair(s) failed');
  process.exit(1);
}
console.log('All ' + PAIRS.length + ' pairs pass');
