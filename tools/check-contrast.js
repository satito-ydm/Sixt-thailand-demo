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
  blackTrue: token('black-true'),
  white: token('white'),
  grey50: token('grey-50'),
  grey100: token('grey-100'),
  tintWarm: token('tint-warm'),
  grey200: token('grey-200'),
  grey500: token('grey-500'),
  borderInput: token('border-input'),
  error: token('error')
};

/* Still used by the booking panel, which is the last black surface on the
   page now that the service cards have inverted. */
C.onDarkMuted = over(C.white, 0.78, C.black);
/* The language toggle on the dark header: a translucent track with
   translucent type on it, so both need compositing before measurement. */
C.langTrackDark = over(C.white, 0.14, C.black);
C.langIdleDark = over(C.white, 0.72, C.langTrackDark);
/* Not a token — measured here to document why the orange band has no muted
   text tone. See the note in tokens.css. */
C.orangeMutedRejected = over(C.black, 0.78, C.orange);
/* The service tiles lay white copy over a photograph under a flat 62% scrim.
   A picture has no one colour, so the pair is measured against the worst
   ground one could present — pure white. That is not a hypothetical here: the
   subscription photograph holds literal rgb(255,255,255) in the strip its own
   caption sits on, and the other two come within a few points of it. The
   measured floor across all three is 60%; 62% is that with margin, and it
   bounds whatever replaces them later. */
C.serviceScrim = over(C.black, 0.62, C.white);
/* The services band is a studio backdrop under a flat 0.78 black wash. The
   brightest pixel in that picture is rgb(163) and it reaches the half the
   heading sits in, so this is the worst ground the band can present anywhere:
   0.78 of black over rgb(163). Everything written on the band is measured
   against it, and because the wash is flat the number does not depend on
   where on the band the words fall. See --surface-services. */
C.servicesGround = over('#A3A3A3', 0.22, C.blackTrue);
/* What the same picture would present unwashed — the pair that sets the 0.78.
   Kept for the FORBIDDEN list, because "soften the wash" is the first thing
   anyone will reach for if the band ever looks too dark. */
C.servicesUnwashed = '#A3A3A3';
/* An earlier version of the band was a photograph under a gradient that ran
   0.62 at its weakest, so the worst ground it could leave under a word was
   pure white at 62% black. Kept as the bar any subject photograph put behind
   this band would have to clear. */
C.servicesWash = over(C.blackTrue, 0.62, C.white);
/* The service tiles gain an orange wash on hover, painted under the 62% scrim
   rather than over it. Fully opaque orange, then the scrim: this is the ground
   the tile copy sits on at the far end of the fade, and every frame before it
   lies between this and C.serviceScrim. */
C.serviceHoverWash = over(C.orange, 0.38, C.blackTrue);
/* Hover also lifts the scrim from 0.62 to 0.45, so the two pairs below are the
   ends of the caption block on a hovered tile. The wash is a gradient running
   from fully opaque orange at the tile's foot to 0.55 where the caption starts,
   and the worst pixel a photograph can put under either is white — so each is
   that much orange over white, then 0.45 of the scrim. */
function washedThenScrimmed(orangeAlpha, scrimAlpha) {
  return over(C.black, scrimAlpha, over(C.orange, orangeAlpha, C.white));
}
C.hoverCaptionTop  = washedThenScrimmed(0.55, 0.45);
C.hoverCaptionFoot = washedThenScrimmed(1.00, 0.45);
/* And the same two with no scrim at all, which is what "take the black fade
   off" means literally. Both are in the FORBIDDEN list. */
C.unscrimmedTop  = over(C.orange, 0.55, C.white);
C.unscrimmedFoot = C.orange;
C.serviceScrimThin = over(C.black, 0.55, C.white);

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
  /* The tab underline is gone — the tabs are filled pills now, measured in
     the fleet block below. */
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

  // the fleet section, back on --tint-warm. Its ground fades from white into
  // the tint over the first fifth, so every pair here is measured against the
  // tint — the darkest point the gradient reaches.
  ['fleet heading on the warm tint',        C.black,      C.tintWarm, 4.5, ''],
  ['idle tab label on its white pill',      C.grey500,    C.white,    4.5, ''],
  ['selected tab label on its black pill',  C.white,      C.black,    4.5,
    'the pairing that asks nothing of the size, which is what let the label ' +
    'shrink to body size'],
  ['selected pill against the warm tint',   C.black,      C.tintWarm, 3.0,
    'a filled pill has no border of its own to lean on'],
  ['fleet scroll arrow on the warm tint',   C.black,      C.tintWarm, 3.0,
    'a solid black disc, for the same reason the tab pill cannot be a white ' +
    'one on this ground'],
  ['fleet arrow glyph on its black disc',   C.white,      C.black,    3.0, ''],
  ['fleet arrow glyph on the orange hover', C.black,      C.orange,   3.0, ''],

  // the vehicle card.
  ['vehicle price in orange (24px bold)',   C.orange,     C.white,    3.0,
    'legal as large text and nothing else — .price-total is 1.5rem/700, and ' +
    'a test holds it there because the colour depends on the size'],
  ['.vehicle-cta label on its black fill',   C.white,      C.black,    4.5,
    'the rest state asks nothing of the size — white on --sixt-black holds ' +
    'at any setting, which is what going black bought'],
  ['.vehicle-cta label on the orange hover', C.white,      C.orange,   3.0,
    'white on orange, legal only as large text. The rest state no longer ' +
    'needs the 19px/700; this does, and it is now the only thing holding the ' +
    'button at --text-cta'],
  ['.vehicle-cta black fill against the card (non-text)', C.black, C.white, 3.0,
    'a filled button with no border of its own — 1.4.11 is met by the fill'],
  ['vehicle spec row on the card',          C.grey500,    C.white,    4.5,
    '14px bold, so it still has to clear the normal-text bar despite the ' +
    'weight — grey is a tone decision, not a licence to go lighter'],
  /* The stand-in chip is gone from the picture. Its honesty now lives only in
     the alt text, which carries no contrast requirement. */

  // the value-prop band — a plain white ground, no heading, no boxes. Title
  // and copy are on the page's own ground, so the on-white pairs at the top
  // already carry them; the ringed icon is all this band adds.
  ['value-prop icon tile against white (non-text)', C.orange, C.white, 3.0,
    'the tile edge — decoration beside a title that says the same thing in ' +
    'words, which is what makes 3.0 the right bar for it'],
  ['value-prop glyph on the orange tile (non-text)', C.white, C.orange, 3.0,
    'the tightest pair in the band — it clears 3.0 as decoration and would ' +
    'fail 4.5 as a word, and it depends on the tile keeping its fill'],

  /* the services section — the one place .band-dark is applied, and the only
     black band left on the page now the promotions panel has given it back.
     Its ground is flat --black-true: a photograph was tried there and taken
     out, and the pair that ended that experiment is in the FORBIDDEN list.

     The tiles are photographs under a flat scrim and bring their own ground,
     so everything written inside one is measured against C.serviceScrim, not
     against the band. Only the heading sits on the black itself. */
  ['services heading in orange on the washed backdrop', C.orange, C.servicesGround, 4.5,
    'the one orange section heading on the page, measured against the ' +
    'brightest ground its band can present anywhere. It clears the ' +
    'normal-text bar and not merely the 3.0 a 40px bold heading is entitled ' +
    'to. A flat wash is what makes one number cover every width and every ' +
    'string length — the gradient this replaced had to be sampled at eight'],
  ['service tile copy at the far end of the orange hover', C.white, C.serviceHoverWash, 4.5,
    'the wash is under the scrim, so full orange composites to rgb(97,30,0) ' +
    'and the copy is better off than on the picture alone. Over the scrim the ' +
    'same effect is white on brand orange at 3.28:1 — see the FORBIDDEN entry'],
  ['tile caption, top edge, hovered with the scrim at 0.45', C.white, C.hoverCaptionTop, 4.5,
    'the tightest point of the hover state: the least orange the wash carries ' +
    'anywhere a word is set, over the lightest pixel a photograph can hold. ' +
    'This pair is what fixes the hover scrim at 0.45 rather than lower'],
  ['tile caption, bottom edge, hovered', C.white, C.hoverCaptionFoot, 4.5,
    'the same measurement at the foot of the block, where the wash is fully ' +
    'opaque and the picture no longer contributes at all'],
  ['focus ring on the black band',          C.white,      C.blackTrue, 3.0,
    'the orange ring is 1.9:1 on black — .band-dark swaps it to white'],
  ['service card against the black band',   C.white,      C.blackTrue, 3.0,
    'the card is its own edge here; nothing else separates it from the band'],
  ['service tile heading over the scrim',   C.white,      C.serviceScrim, 4.5,
    'the 62% scrim is flat across the whole tile now, so this holds wherever ' +
    'the words are placed rather than only where a gradient had darkened. ' +
    'Measured against pure white, which the three real photographs actually ' +
    'reach inside their own text zones'],
  ['service tile copy over the scrim',      C.white,      C.serviceScrim, 4.5,
    'solid white — --on-dark-muted composites to 3.59:1 against this ground'],
  ['service tile button on its own fill',   C.white,      C.black,    4.5,
    '.btn-secondary brings its own ground, so it does not depend on the ' +
    'picture at all'],

  ['promo CTA label on its white fill',     C.black,      C.white,    4.5,
    'the one element on the orange strip that brings its own ground — the ' +
    'fill is what stops its contrast depending on the photograph behind it'],

  /* Otherwise the promotions section carries no pair of its own. The orange panel is a
     photograph set behind the banners and nothing is written on it — the
     heading and the detail sit on the page's own white, which the on-white
     pairs at the top of this list already cover. That is exactly why they
     were moved off the artwork; see the note on .promo-detail in app.css. */

  // the membership panel — an inset box carrying a photograph, with an orange
  // wash coming in from the left and every word standing on the solid part of
  // it. Solid is the operative word and it is measured, not assumed: the
  // picture reaches rgb(255) in its left half, so anything short of a fully
  // opaque wash puts black type over white artwork. The pairs below are
  // therefore all against flat --sixt-orange, and the FORBIDDEN list carries
  // what happens where the wash has started to go.
  ['membership button label on its black fill', C.white,   C.black,    4.5,
    '.band-orange inverts .btn-primary to black-on-orange with a white label, ' +
    'because a filled orange button on an orange ground has no edge'],
  ['membership heading on the panel',       C.black,      C.orange,   4.5, ''],
  ['membership body copy on the panel',     C.black,      C.orange,   4.5,
    'solid black at weight 300. There is no muted tone on this ground — black ' +
    'at 78% falls to 4.01:1 — so hierarchy is weight and size only'],
  ['the "already a member" line',           C.black,      C.orange,   4.5, ''],
  ['its login link',                        C.black,      C.orange,   4.5,
    'and it stays black on hover: the hover thickens the underline instead. ' +
    'Nothing in the palette can recolour 15px type on orange — white is ' +
    '3.28:1, both oranges vanish into the ground, and black is already what ' +
    'it is. See the FORBIDDEN entry for the white version'],
  ['the accent rule under the heading (non-text)', C.black, C.orange,  3.0,
    'decoration, aria-hidden, and it repeats nothing — 3.0 is the right bar'],
  ['the panel against the page around it (non-text)', C.orange, C.white, 3.0,
    'the panel is inset now, so its edge against the page is a real boundary ' +
    'rather than a section change. 3.28:1 — it clears the non-text bar and ' +
    'would fail as a word, which is exactly what it is not'],

  // news — an editorial list on the page's own white. Its title and body sit
  // on the on-white pairs at the top of this list; the rule is all it adds.
  ['the rule over a news item (non-text)',  C.black,      C.white,    3.0,
    '2px of black rather than 1px of --grey-200, which at 1.3:1 is not a ' +
    'rule. With the card edges gone it is the only thing dividing the items'],

  // FAQ — hairline rows on the grey-50 band, no white box.
  ['an FAQ question on the band',           C.black,      C.grey50,   4.5, ''],
  ['an FAQ question on hover',              C.orange,     C.grey50,   3.0,
    'the tightest pair on the page: 3.06 against a bar of 3.0. It is legal ' +
    'only as large text, so the trigger is held at 19px/700 exactly as ' +
    '.price-total is at 24px/700 — and it is legal only on this band, because ' +
    'grey-50 is already a fifth of the way down from white and there is no ' +
    'margin left to spend. Darkening this band by any amount at all ' +
    'breaks the hover. At weight 600 the bar becomes 4.5 and no orange in the ' +
    'palette clears it: see the two FORBIDDEN entries'],
  ['an FAQ answer on the band',             C.grey500,    C.grey50,   4.5, ''],
  ['the accordion plus/close mark (non-text)', C.orange,   C.grey50,   3.0,
    'a control glyph beside a label that already says what it does — and the ' +
    'same 3.06 as the hover above, for the same reason and with the same ' +
    'absence of margin'],

  // footer — three tiers on --sixt-black.
  ['footer column heading',                 C.onDarkMuted, C.black,   4.5,
    '13px small-caps in the wash, not solid white. Five of them in white ' +
    'outranked the twenty-five links they label'],
  ['footer hotline number',                 C.white,      C.black,    4.5, ''],
  ['footer hotline on hover',               C.orange,     C.black,    4.5,
    '28px/700 would pass at 3.0 as large text; it clears the full bar anyway, ' +
    'which is what makes the same orange safe on the 15px links below it'],
  ['footer link on hover',                  C.orange,     C.black,    4.5,
    '15px at weight 400 — normal text, no exemption. This is the pair that ' +
    'replaced an opacity step, and it is why the hover could become a colour'],
  ['footer legal and copyright lines',      C.onDarkMuted, C.black,   4.5,
    '13px in the wash. It was 12px at opacity 0.7, which composites to the ' +
    'same place but as a property of the element rather than a stated tone'],
  ['footer hairline against the band (non-text)', over(C.white, 0.14, C.black), C.black, 1.0,
    'listed at 1.0 because it is deliberately below any bar: it is a seam ' +
    'between two parts of one black surface, carries no information, and a ' +
    'rule strong enough to pass 3.0 would divide the footer into boxes'],

  // .band-orange — still defined, currently unapplied. The membership band
  // was its only call site and is now a black panel. The pairs stay because
  // the class stays: anything that adopts it inherits these constraints.
  ['heading on the orange band',            C.black,      C.orange,   4.5,
    'this is why the orange band sets black text, not white'],
  ['body copy on the orange band',          C.black,      C.orange,   4.5,
    'solid black at weight 300 — a lighter tone cannot pass here'],
  ['inverted CTA on the orange band',       C.white,      C.black,    4.5, ''],
  ['focus ring on the orange band',         C.black,      C.orange,   3.0, ''],
  ['heading rule on the orange band',       C.black,      C.orange,   3.0,
    'the kickers are gone site-wide; this stays because .band-orange still ' +
    'inverts black onto orange for everything it draws']
];

/* --grey-200 is intentionally absent above. It edges cards and dividers, which
   carry no information and are exempt from 1.4.11; it must never be used on an
   interactive control. */

// Documented as failing on purpose, so nobody "fixes" it by shipping it.
var FORBIDDEN = [
  ['an unselected tab pill against the warm tint', C.white, C.tintWarm, 3.0,
    'the white pill has no perceivable outline on this ground, and it is ' +
    'listed rather than fixed on purpose. What WCAG 1.4.11 asks to be visible ' +
    'is the control and its state: the label reads at 5.33:1 and the selected ' +
    'fill at 15.14:1, so both are. The pill shape is the only thing lost. Put ' +
    'the section back on a dark ground and this stops being a question'],
  ['the selected tab if it went back to orange with a white label', C.white, C.orange, 4.5,
    'it was exactly this until the label shrank to body size — an orange ' +
    'pill here has to take a black label instead, at 5.30:1'],
  ['white on orange at normal text size',   C.white,      C.orange,   4.5,
    'never allowed below 19px bold — use black text or a black ground instead'],
  ['the membership login link if its hover went white', C.white, C.orange, 4.5,
    'the obvious hover for a link on this panel, and it fails at 15px. So do ' +
    'both oranges, against their own ground. That is why the state is carried ' +
    'by underline thickness — the one cue on an orange band that costs no ' +
    'contrast at all'],
  ['membership copy halfway down the wash, over the night road', C.black, over(C.orange, 0.5, '#0F0F0F'), 4.5,
    'the pair that caps .member-copy at 34rem. Half a wash over the dark two ' +
    'thirds of this artwork is 2.44:1 for black type — and the light half ' +
    'is no argument for softening it either, because the same ramp over the ' +
    'white SUV is a different number entirely. A photograph has no one ' +
    'colour, so the wash under a word has to be opaque or the word has to ' +
    'move'],
  ['membership copy on the bare artwork with no wash', C.black, '#0F0F0F', 4.5,
    'and this is where the ramp ends: 1.10:1. It is the whole reason the ' +
    'gradient runs flat at full strength for the first 52% instead of easing ' +
    'from the left edge, which is what a fade normally means'],
  ['.vehicle-cta label on the orange hover if the button were shrunk', C.white, C.orange, 4.5,
    'the whole reason the button is 19px. Its black rest state would survive ' +
    'any size; the hover would not, and shrinking the button quietly breaks ' +
    'the state nobody screenshots'],
  ['the vehicle price at body size in orange', C.orange,   C.white,    4.5,
    'what the orange price costs if it is ever shrunk out of large text'],
  ['.btn-outline hover if the button were dropped back to 16px', C.white, C.orange, 4.5,
    'the same colours the button now uses, measured against the bar they ' +
    'would face at normal text size — this is what the 19px is buying'],
  ['black at 78% on orange',                C.orangeMutedRejected, C.orange, 4.5,
    'why the orange band has no muted text tone; hierarchy uses weight instead'],
  ['promo copy written in white on the orange panel', C.white, C.orange, 4.5,
    'the reason the detail sits on the page rather than on the artwork: the ' +
    'panel is a photograph running bright orange to dark red, and no single ' +
    'ink clears AA across that range at body size'],
  ['the services heading if the wash were softened to 0.62', C.orange, over(C.servicesUnwashed, 0.38, C.blackTrue), 3.0,
    'what sixteen points of alpha are buying. The backdrop is a lit sweep and ' +
    'reads as almost nothing at 0.78, so lightening it is the obvious ' +
    '"improvement" — and the heading fails the large-text bar before the ' +
    'picture has gained anything worth looking at'],
  ['the services heading on the backdrop with no wash at all', C.orange, C.servicesUnwashed, 3.0,
    '1.30:1. The picture is bright in the upper middle and that brightness ' +
    'reaches the half the heading occupies, so there is no crop or position ' +
    'that makes an unwashed version of this work'],
  ['the hovered caption if the scrim were taken off entirely', C.white, C.unscrimmedTop, 4.5,
    'what "remove the black fade" costs at the top of the caption block — the ' +
    'wash is thin enough there that the photograph is most of the ground, and ' +
    'a photograph can hold white'],
  ['the same caption at the foot with no scrim', C.white, C.unscrimmedFoot, 4.5,
    'and at the other end it is simply white on brand orange, the one pair ' +
    'this file refuses everywhere it appears. Between them there is no ' +
    'unscrimmed version of the hover that keeps the words, which is why the ' +
    'scrim lifts to 0.45 instead of to nothing'],
  ['the service hover wash painted over the scrim instead of under it', C.white, C.orange, 4.5,
    'the same effect one layer higher, and it breaks every caption on the ' +
    'tile for as long as the pointer rests there. ::before and ::after is the ' +
    'whole of the difference'],
  ['the orange services heading if a subject photograph goes back behind it', C.orange, C.servicesWash, 3.0,
    'the reason that band is a flat colour. Against the worst ground a washed ' +
    'photograph can leave, orange fails even the large-text bar — and a ' +
    'picture has no one value, so the real number depends on which pixels the ' +
    'glyphs land on and has to be re-measured at every width whenever the ' +
    'string or the picture changes. It was, once, and it passed at 6.23:1; ' +
    'this is what was being balanced on, and what a flat ground buys'],
  ['service copy if the scrim were lightened to 55%', C.white, C.serviceScrimThin, 4.5,
    'what a genuinely faint wash costs: seven points of alpha is the whole ' +
    'margin, and these photographs have no dark corner to hide in'],
  ['--on-dark-muted as service tile copy',  over(C.white, 0.78, C.serviceScrim), C.serviceScrim, 4.5,
    'the muted tone holds on solid black and fails on a scrimmed picture'],
  ['an FAQ question hovering orange at weight 600', C.orange, C.grey50, 4.5,
    'the trigger was 600 for one revision. It looks all but identical to 700 ' +
    'and is a different thing to WCAG: bold starts at 700, so at 600 the ' +
    'question stops being large text and its hover is measured against 4.5'],
  ['the same hover in the darker orange, still at 600', C.orangeDeep, C.grey50, 4.5,
    'and the obvious escape does not work either — this is the darkest orange ' +
    'in the palette and it reaches only 3.92:1 on the FAQ band. There is no ' +
    'orange that carries a 19px/600 question, which is what pinned the ' +
    'weight at 700'],
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
