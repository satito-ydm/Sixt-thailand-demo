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
/* THE BOOKING PANEL IS GLASS AS OF 2026-08-17 and is no longer a fixed colour
   pair. It is --sixt-black at 0.70 with a backdrop blur, so its ground is
   whatever is behind it — the hero photograph above 1024, the page's own white
   below it. Measured against a white pixel, which is the worst a photograph
   can offer and is literally what the page offers below the breakpoint. */
C.bookingGlass = over(C.black, 0.70, C.white);
C.bookingGlassMuted = over(C.white, 0.78, C.bookingGlass);
/* What the same card would be at the alpha glass is usually built at. Both of
   these are in FORBIDDEN. */
C.bookingGlassThin = over(C.black, 0.55, C.white);
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
/* NO LONGER THE LIVE GROUND. The band is flat #000000 as of 2026-08-17; this
   value is what the sweep-under-a-wash presented and is kept because the two
   FORBIDDEN entries below are the written record of why a picture behind this
   band is a trap, and they need a ground to be measured against. */
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
/* THE MEMBERSHIP COPY'S GROUND IS A PHOTOGRAPH FROM 1280 UP, so this value is
   SAMPLED rather than derived — the orange wash it used to stand on is gone
   (2026-08-17, "use the picture full") and there is no longer a token that says
   what is behind those words.

   #E9581C is the darkest pixel found under any glyph of the copy across
   1280 / 1440 / 1920, read out of the rendered page with the copy hidden and
   the header removed. It is not the artwork's white wall, which is where most
   of the copy sits and measures around 15:1 — it is the orange brand arc in
   the artwork's top left, which the heading and the first line of the
   paragraph clip at some widths.

   The thing this value is really guarding is the OTHER end of the crop. At a
   600px band `object-position` decides which 36% of the picture is discarded,
   and pushing it 8 points further down puts the car's black roofline under the
   "already a member" line — 1.09:1, black on black, measured at 1280. That is
   in FORBIDDEN below.

   RE-SAMPLE THIS WHEN THE ARTWORK CHANGES. It is the one constant in this file
   that is a property of a file in assets/img rather than of tokens.css, and an
   artwork with a dark sky or a subject in its top left would break the section
   with nothing here or in the CSS to catch it. */
C.memberArt = '#E9581C';
/* And the car's bodywork, which is what the crop must never bring up under the
   copy. Sampled from the same renders at object-position 50% 28%. */
C.memberArtCar = '#151412';
/* The active column's foot wash, painted UNDER the scrim's own layer in
   z-order but composited on top of it here, which is the same thing for a
   ratio: the scrim's worst ground is white, and this is 0.55 of black laid
   over that. rgb(65), against the scrim's rgb(113). It is at full strength
   through the bottom 45% of the column, which is where the detail copy and
   its button sit, and gone by 82% — so it does NOT apply to the title. */
C.serviceFootWash = over(C.black, 0.55, C.serviceScrim);
/* C.black and not C.blackTrue, and the difference is not academic: written
   with pure black first, this pair reported 12.63 and its companion 3.85 —
   both flattering, both for a wash the stylesheet does not paint. The CSS is
   rgba(26, 26, 26, 0.55), which is --sixt-black, the same value .svc-scrim
   uses two rules above it. A composite is only as true as the colour fed into
   it, and #000 is the easiest wrong answer to reach for. */

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

  // The booking panel, GLASS as of 2026-08-17: --sixt-black at 0.70 over a
  // backdrop blur. Every pair below is measured against C.bookingGlass, the
  // card composited over a WHITE pixel, because that is the worst ground the
  // hero photograph can put behind it and it is exactly the ground the page
  // puts behind it below 1024. Its fields stay white, so the field pairs above
  // still hold — they bring their own surface and never touched this ground.
  //
  // The pairs that were here before measured against flat C.black and reported
  // 17.40 and 10.95. Those numbers belong to a card that is no longer on the
  // page; the two solid-black entries kept below are the no-backdrop-filter
  // and reduced-transparency fallbacks, which are real states and not history.
  ['booking title on the glass panel',      C.white,      C.bookingGlass, 4.5,
    'the ink did not change and its ratio fell from 17.40 to 6.39 — which is ' +
    'the whole cost of the effect, and is still comfortable'],
  ['booking sub-line on the glass panel',   C.bookingGlassMuted, C.bookingGlass, 4.5,
    'THE BINDING PAIR. --on-dark-muted is white at 78%, so a thinning card ' +
    'costs it from both ends at once: the ink lightens as the ground does. ' +
    '4.66 against 4.5 is what fixes the card\'s alpha at 0.70, and nothing ' +
    'else on the panel comes close to that margin'],
  ['field labels on the glass panel',       C.bookingGlassMuted, C.bookingGlass, 4.5,
    'same colour, same ground, and the smallest type on the card'],
  ['return-location toggle on the glass',   C.white,      C.bookingGlass, 4.5, ''],
  ['that toggle on hover, which no longer recolours', C.white, C.bookingGlass, 4.5,
    'the hover was --sixt-orange and had to stop being a colour at all. On ' +
    'the flat black card it was 5.30 and legal; on the glass over a white ' +
    'pixel the same orange is 1.95, which is the one pair the effect broke ' +
    'outright and it broke it by nearly a factor of three. The state is an ' +
    'underline now and the ink does not move, so this is the resting pair ' +
    'measured twice. The orange is in FORBIDDEN below'],
  ['white field against the glass panel',   C.white,      C.bookingGlass, 3.0,
    'the field edge is its own boundary here — 1.4.11 met by the card itself'],
  ['booking title on the solid fallback',   C.white,      C.black,    4.5,
    'what @supports-not and prefers-reduced-transparency both fall back to'],
  ['booking sub-line on the solid fallback', C.onDarkMuted, C.black,   4.5,
    '--grey-500 would be 3.3:1 here, which is why the panel uses the wash'],
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
  ['services heading in white on the black band', C.white, C.blackTrue, 4.5,
    'WHITE AS OF 17 AUGUST 2026, on the client\'s direction, and 21:1 against ' +
    'the 6.49 the orange managed. It was the one orange section heading on the ' +
    'page for four revisions; the brand colour is spent inside the banner now ' +
    'instead, where the hovered column title carries it. The pair below is the ' +
    'orange it replaced, kept because it is still what a photograph behind ' +
    'this band would have to answer for'],
  ['services heading in orange, the colour it replaced', C.orange, C.blackTrue, 4.5,
    'the number the flat band bought and the reason it is worth keeping ' +
    'measured even though nothing renders it: against the brightest ground the ' +
    'old studio sweep could present it was 6.39:1, on pure black 6.49, and it ' +
    'held at every width because nothing behind it varied. If the heading ever ' +
    'goes back to brand orange it does not need re-deriving — but only while ' +
    'the ground stays flat, which is what the FORBIDDEN entry guards'],
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
    'reach inside their own text zones. AS OF 17 AUGUST 2026 THIS IS THE ' +
    'RESTING STATE OF EVERY COLUMN TITLE: the 0.2 dimming that used to hold ' +
    'two of the three at 1.47 is gone, and its waiver with it. The one title ' +
    'this does not describe is the active one, which is orange and is in ' +
    'WAIVED'],
  ['a service column title dimmed while a neighbour is hovered',
    over(C.white, 0.65, C.serviceScrim), C.serviceScrim, 3.0,
    'the reference\'s dimming, back for the second time and legal on the ' +
    'second attempt. The first was 0.2 and measured 1.47 against 4.5; it ' +
    'shipped in WAIVED for a session and is gone. 0.65 composites to rgb(205) ' +
    'on rgb(113) and clears the large-text bar the title is entitled to — ' +
    '31.68px at weight 700 at 1440, and 22px at the clamp\'s floor, which is ' +
    'still bold above 18.66px. THE MARGIN IS TWO HUNDREDTHS: 0.62 measures ' +
    '2.95 and fails. Nothing about this value is a matter of taste, and the ' +
    'state is a hover rather than a rest, so a fainter one is a waiver'],
  ['service tile copy over the scrim',      C.white,      C.serviceScrim, 4.5,
    'solid white — --on-dark-muted composites to 3.59:1 against this ground. ' +
    'This is the pair at REST and at the start of the hover fade; the wash ' +
    'below only ever improves on it, so 4.88 stays the number the copy is ' +
    'guaranteed'],
  ['service detail copy over the foot wash on the active column',
    C.white, C.serviceFootWash, 4.5,
    'the client asked for black to come up under the detail copy on hover, ' +
    'and 0.55 of it under the existing scrim takes white from 4.88 to 10.21. ' +
    'This is the one change to this section all afternoon that costs nothing ' +
    'anywhere: the scrim is untouched — its own rule forbids lifting it — and ' +
    'the wash is per column, under the words, so no other pair moves'],
  ['the active title IF the foot wash ran the full column height',
    C.orange, C.serviceFootWash, 3.0,
    'MEASURED BUT NOT SHIPPED, and it is the priced escape from the waiver ' +
    'below. The orange title fails at 1.49 because the wash is transparent at ' +
    'the top of the column where the title sits; at full height and the same ' +
    '0.55 the same orange is 3.11 and clears the large-text bar. What it ' +
    'costs is the look — that is a uniformly dark active column rather than ' +
    'a bit of black at its foot, which is what was asked for. Recorded so ' +
    'the trade is a decision rather than a rediscovery'],
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

  // the membership panel. THE INK ON IT IS WHITE AS OF 2026-08-17 and most of
  // this block moved with it: the heading passes on the large-text exemption and
  // is measured here, and the paragraph and the "already a member" line fail and
  // are in WAIVED with the client's decision on them. What is left below is the
  // heading and the button.
  //
  // Both are still against flat --sixt-orange, and that part is measured rather
  // than assumed: the artwork reaches rgb(255) in its left half, so anything
  // short of a fully opaque wash under the copy would put type over white
  // photograph. The FORBIDDEN list carries what happens where the wash has
  // started to go.
  // FROM 1280 UP the copy is black on the artwork itself — no wash, no orange
  // field. These three are measured against C.memberArt, the darkest pixel
  // found under any glyph across a width sweep, which is the brand arc in the
  // artwork's top left rather than the white wall the rest of the copy sits on.
  ['membership heading, black on the artwork', C.black, C.memberArt, 3.0,
    '44px/700, so its bar is 3.0 and it holds 4.77 at its worst. The white ink ' +
    'this replaced was 3.28 on flat orange — better on paper, and it was ' +
    'invisible the moment the wash came off: white on this artwork\'s wall is ' +
    'about 1.1:1'],
  ['membership paragraph, black on the artwork', C.black, C.memberArt, 4.5,
    'THE BINDING PAIR OF THE WHOLE SECTION. 17px/300 is normal text, so this ' +
    'one needs the full 4.5, and at the shipped crop it holds 5.06 at its ' +
    'worst across 1280/1440/1920. It is also what fixes object-position at ' +
    '20%: eight points lower and the car comes up under the copy'],
  ['membership "already a member" line, black on the artwork', C.black, C.memberArt, 4.5,
    '15px, the smallest type in the section. Same ground, same measurement — ' +
    'it sits lowest in the copy block, so it is the line the car reaches first'],
  // Below 1280 the copy is still white on the flat orange band, which is the
  // pair below and the two entries in WAIVED.
  ['membership heading in white on the panel', C.white,    C.orange,   3.0,
    '40px/700, so 3.0 is its bar and 3.28 clears it. This is the one piece of ' +
    'white ink on this panel that is legal, and it is legal only because of the ' +
    'size — the paragraph beneath it is the same colour on the same ground and ' +
    'is in WAIVED. Drop the heading below 18.66px bold and it joins them'],
  ['membership button label on its white fill', C.black, C.white, 4.5,
    'the button inverted with the ink: a white fill with a black label, on the ' +
    'promotions CTA\'s model. It is the one element on the panel that gained ' +
    'contrast from the change — 17.40:1 against the 4.5 it needs'],
  ['membership button fill against the panel (non-text)', C.white, C.orange, 3.0,
    'the fill is the button\'s only edge, so 1.4.11 applies to it at 3.0 and ' +
    'not the 4.5 a word would need. 3.28 clears it, and barely: this is the ' +
    'same number the white ink beside it is living on'],
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

  // FAQ — one white card per question on a --grey-50 band, via .band-tint.
  //
  // The band has been three colours in three revisions and the pairs below have
  // only had to move once, which is the argument for measuring the card rather
  // than the section: everything written inside a question is on white and was
  // on white while the band was orange. The heading column is the part that
  // does sit on the band, and it needs nothing of its own — black heading and
  // --grey-500 lead on --grey-50 are both already at the top of this list.
  //
  // .rule-accent on the tint band. NOT ON THE PAGE — the FAQ heading carried
  // one for a revision and it came off when the car arrived. Kept for the same
  // reason the .band-orange block below was kept through two sessions of going
  // unused: the number is a property of the class, and the next thing to adopt
  // it inherits this constraint rather than re-deriving it.
  ['the heading rule on the tint band (non-text)', C.orange, C.grey50, 3.0,
    'and this is the 3.06 the cards were built to escape. When the questions ' +
    'sat on --grey-50 that number was load-bearing: it was a hover state on a ' +
    'control, it was the tightest pair on the page, and it meant the band ' +
    'could never darken by any amount. On 56x3px of aria-hidden decoration it ' +
    'is not — the rule can go black at 16.25:1 the moment the band moves. A ' +
    'tight margin on something with somewhere to fall back to is not the same ' +
    'risk as a tight margin on something without, and that is the whole reason ' +
    'this is recorded as a pass rather than as a thing to avoid'],
  ['an FAQ question on its card',           C.black,      C.white,    4.5, ''],
  ['an FAQ question on hover',              C.orange,     C.white,    3.0,
    'still the tightest pair on the page, but no longer at the line: 3.28 ' +
    'against a bar of 3.0, where the same hover on the old grey-50 band ' +
    'measured 3.06. It is legal only as large text, so the trigger stays at ' +
    '19px/700 exactly as .price-total does at 24px/700 — that has not ' +
    'changed and cannot. At weight 600 the bar becomes 4.5 and no orange in ' +
    'the palette clears it: see the two FORBIDDEN entries. What the card ' +
    'bought is the band: grey-50 had no margin left to spend and could not be ' +
    'darkened by any amount, and the cards are white whatever the band does'],
  ['an FAQ answer on its card',             C.grey500,    C.white,    4.5, ''],
  ['the accordion plus/close mark (non-text)', C.orange,   C.white,    3.0,
    'a control glyph beside a label that already says what it does, on the ' +
    'same white and with the same 3.28 as the hover above'],
  ['the accordion numeral when open (non-text)', C.orange, C.white,    3.0,
    'aria-hidden and decorative, so it owes nothing — measured anyway. At ' +
    '24px it is large text by size alone, whatever its 300 weight'],
  // The escalation strip inverted: it is the orange object now, not a white
  // card on an orange band, so both of its pairs moved onto orange and both
  // got easier. The strip carries .band-orange itself, so the focus ring it
  // uses is the black one measured at the foot of this list.
  ['the escalation strip label on its orange strip', C.white, C.orange, 3.0,
    'white on the brand orange, and 3.0 is the bar it is measured against ' +
    'because 19px/700 is large text. It reaches 3.28 and it would fail 4.5, so ' +
    'the size and the weight are the whole licence: this label may never drop ' +
    'to 600, may never drop to 16px, and this strip may never carry a caption ' +
    'or a line of small print. The alternative if any of that changes is not a ' +
    'different white — it is going back to --on-orange at 5.30:1, which is what ' +
    '.band-orange hands it by default. The membership panel used to be the ' +
    'example of that and no longer is: its ink went white too, and two of its ' +
    'three text elements are in WAIVED as a result'],
  ['the escalation hotline on its orange strip', C.white, C.orange, 3.0,
    'the same 3.28 under the same exemption — .btn-hotline is 19px/700 already, ' +
    'which is the only reason the number could follow the label to white. Its ' +
    'hover is an underline rather than a colour, so there is no third pair ' +
    'here to keep in step: orange-deep on orange is 1.16:1 and black would be ' +
    'a jump to 5.30 that reads as a different component'],
  ['the escalation strip focus ring (non-text)', C.black, C.orange, 3.0,
    'black, from .band-orange, while the type on the same strip is white. A ' +
    'white ring would sit at the same 3.28 as the words it is pointing at, and ' +
    'a focus indicator is the one mark on a surface that cannot be the ' +
    'faintest thing on it'],

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
  ['the ISO badge label',                   C.onDarkMuted, C.black,   4.5,
    'the same tone at 11px, which is the smallest type in the footer and the ' +
    'reason it stays on the full 4.5 rather than borrowing anything. It is a ' +
    'four-word label on an outlined chip, not copy: the sentence it shortens ' +
    'is still set in full in the terms column'],
  ['footer hairline against the band (non-text)', over(C.white, 0.14, C.black), C.black, 1.0,
    'listed at 1.0 because it is deliberately below any bar: it is a seam ' +
    'between two parts of one black surface, carries no information, and a ' +
    'rule strong enough to pass 3.0 would divide the footer into boxes. The ' +
    'social discs and the ISO chip draw their outlines at the same alpha, and ' +
    'for the same reason — one value for every faint line on this ground'],
  // the social row, which is four controls where the masthead used to hold a
  // 1,000px hole. Both states measured: the glyph carries the meaning in the
  // rest state and the fill carries it on hover.
  ['a social glyph on the black band (non-text)', C.white, C.black, 3.0,
    'measured at 3.0 and not 4.5 because each disc has an aria-label doing the ' +
    'naming — the mark inside it is a picture of a brand, not a word'],
  ['a social glyph on its orange hover (non-text)', C.black, C.orange, 3.0,
    'the glyph inverts to black on the fill rather than staying white. White ' +
    'would have been 3.28 and legal; black is 5.30 and legal for a word too, ' +
    'and there is nothing in a 44px disc worth spending the margin on'],
  ['a social disc fill against the band (non-text)', C.orange, C.black, 3.0,
    'the hover state is the fill, so the fill is what has to be visible ' +
    'against the ground it appears on'],

  // The back-to-top disc — the only mark on the page that is not on a ground.
  // It is fixed, so it crosses white, --grey-50, the orange membership panel,
  // two black bands, a photograph and the footer. No solid colour survives that:
  // whichever fill is chosen reads 1.00:1 against the band that happens to match
  // it. The mark is two-tone for exactly that reason, and these two pairs are
  // the halves of one guarantee — on any ground, at least one of them clears 3.
  ['the to-top disc on a light ground (non-text)', C.black, C.grey50, 3.0,
    'the tighter of the two light grounds it crosses, and the disc is the half ' +
    'carrying the edge there — the white ring is invisible on white and nearly ' +
    'so on grey-50, which is fine, because it is not the half doing the work on ' +
    'those surfaces'],
  ['the to-top ring on a dark ground (non-text)', C.white, C.black, 3.0,
    'and this is the half that carries it on the two black bands, where the ' +
    'disc itself is 1.00:1 against what is behind it. Take the ring off and the ' +
    'button disappears over the closing section — which is the ground the page ' +
    'spends its last screen on'],
  ['the to-top glyph on its disc (non-text)', C.white, C.black, 3.0,
    'an arrow with an aria-label doing the naming, so it is measured at the ' +
    'non-text bar rather than at 4.5'],
  ['the to-top glyph on its orange hover (non-text)', C.black, C.orange, 3.0,
    'inverted to black on the fill, the same trade the footer social discs ' +
    'take: white would be 3.28 and legal, black is 5.30 and there is nothing ' +
    'in a 48px disc worth spending the margin on'],

  // .band-orange — now on the membership panel and on the FAQ's escalation
  // strip. It has been adopted, dropped and adopted again three times and this
  // block has never had to change, which is the whole return on measuring the
  // class rather than the call site: the FAQ section took it for a session and
  // handed it back, and the strip inside that section picked it up the same
  // day, and neither move needed a number here re-run.
  //
  // Two rules that undid this contract for the escalation strip — a white
  // card's orange hotline and its orange focus ring — went out with the band.
  // A class is only worth measuring while the call sites let it do its job.
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
  ['the membership login link in white', C.white, C.orange, 4.5,
    'NO LONGER HYPOTHETICAL — this is on the page as of 2026-08-17 and is in ' +
    'WAIVED, not here. It is left in this list because the reasoning is what ' +
    'the waiver rests on: 3.28:1 is a large-text number and a 15px link is not ' +
    'large text, so no white makes this legal. What carries the link now is the ' +
    'underline it has always had, which is not a contrast property at all'],
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
  ['an FAQ question hovering orange at weight 600', C.orange, C.white, 4.5,
    'the trigger was 600 for one revision. It looks all but identical to 700 ' +
    'and is a different thing to WCAG: bold starts at 700, so at 600 the ' +
    'question stops being large text and its hover is measured against 4.5. ' +
    'Measured on the card, which is where the question has sat since; on the ' +
    'grey-50 the trigger used to sit on it was worse still, at 3.06'],
  ['the same hover in the darker orange, still at 600', C.orangeDeep, C.white, 4.5,
    'and the obvious escape does not work either — this is the darkest orange ' +
    'in the palette and it reaches only 4.20:1 on the card, which is close ' +
    'enough to the bar to look like a rounding argument and is not one. There ' +
    'is no orange that carries a 19px/600 question on any ground this page ' +
    'has, which is what pinned the weight at 700'],
  ['the escalation strip label in white at weight 600', C.white, C.orange, 4.5,
    'the trap the FAQ strip now lives beside. White on orange is 3.28:1 and ' +
    'only legal as large text; drop the label to 600, or to 16px, and the bar ' +
    'becomes 4.5 and the same colour is illegal. There is no whiter white, so ' +
    'the recovery is the ink going back to --on-orange and the strip going ' +
    'back to black type — not a palette change'],
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
  ['the active service title in the darker orange', C.orangeDeep, C.serviceScrim, 3.0,
    'the first thing anyone will try on the 1.49 in WAIVED, and it goes the ' +
    'wrong way: --sixt-orange-deep is 1.16 on this ground against the 1.49 ' +
    'the brighter orange manages. Orange is being measured against a MID GREY ' +
    'here, not against white — the scrim over a white pixel lands on rgb(113), ' +
    'which is DARKER than both oranges, so the ink is the light half of this ' +
    'pair and darkening it walks it into the ground. Every other ' +
    'orange-on-light pair in this file rewards going darker, because on white ' +
    'the orange is the dark half; this one is the exception and that is ' +
    'exactly why it is written down'],
  ['the active service title at 16px, still orange', C.orange, C.serviceScrim, 4.5,
    'the same colour with the large-text exemption taken away. The waived ' +
    '1.49 is measured against 3.0 because the title clamps between 22 and ' +
    '32px; shrink it under 18.66px and the bar becomes 4.5 and a shipped ' +
    'compromise silently becomes twice the failure it was signed off as'],
  ['a service column title dimmed to the 0.62 that reads the same',
    over(C.white, 0.62, C.serviceScrim), C.serviceScrim, 3.0,
    'three hundredths of opacity below the shipped 0.65 and on the wrong side ' +
    'of the bar at 2.95. It is here because nobody adjusting a dimming by eye ' +
    'would believe this is a boundary — the two are indistinguishable on ' +
    'screen — and because the value it guards is the second attempt at this ' +
    'state, the first having been 0.2'],
  ['the booking glass at the 0.55 it looks right at',
    over(C.white, 0.78, C.bookingGlassThin), C.bookingGlassThin, 4.5,
    'measured as its labels rather than as itself: --on-dark-muted over a ' +
    '0.55 card over a white pixel is 3.04 against a bar of 4.5. This is the ' +
    'alpha anyone building glass reaches for and it fails by a point and a ' +
    'half while looking completely convincing. 0.70 is the first step where ' +
    'the muted labels clear 4.5, and even the service scrim\'s own 0.62 is ' +
    'not enough here — the difference being that the scrim carries solid ' +
    'white and this card carries white at 78%'],
  ['the booking toggle hover left orange on the glass', C.orange, C.bookingGlass, 4.5,
    '1.95:1. Recolouring on a translucent card is the trap: the ground stops ' +
    'being a colour you chose and becomes whatever is behind the page, and ' +
    'orange is the light half of the pair there rather than the dark one. No ' +
    'orange in the palette recovers it — --sixt-orange-deep is worse. The ' +
    'recovery is an underline, which is what shipped'],
  ['the membership crop aimed 8 points lower', C.black, C.memberArtCar, 4.5,
    '1.09:1 — black ink on the car\'s black bodywork, which is what ' +
    'object-position: 50% 28% puts under the "already a member" line at 1280. ' +
    'The band is 600px against an artwork 939px tall at that width, so a third ' +
    'of the picture is discarded and this property decides which third. It ' +
    'looks like a framing preference and it is a legibility bound: 20% is the ' +
    'lowest aim that still clears every bar, and it was found by sweeping, not ' +
    'by eye'],
  ['the membership copy left white after the wash came off', C.white, C.memberArt, 4.5,
    'the failure this section would have shipped with if only the wash had ' +
    'been deleted. White was correct for four revisions because the ground was ' +
    'flat --sixt-orange; on the artwork it is 1.10:1 on the wall and 3.5 on ' +
    'the arc. Removing a background is never only removing a background'],
  ['the value-prop icon tile as text-weight orange', C.orange, C.white,  4.5,
    'the tile clears 1.4.11 at 3.28:1 and nothing more — it may never be ' +
    'asked to carry a word, a number or a meaning the title does not repeat']
];

/* Fails, and is on the page anyway, on a decision that was taken with the
   number in front of the person who took it.

   This is a THIRD bucket and it is not FORBIDDEN. That list means "never ship
   this" and exists so nobody rediscovers a trap; this one means "this ships,
   it does not pass, and here is who decided". Collapsing the two would either
   hide a live failure among things that are only hypothetical, or turn a
   recorded decision into a build error every time the suite runs.

   Nothing is added here without a date and a name for the decision. If that
   cannot be written down, the pair is not waived — it is just broken. */
var WAIVED = [
  /* RETIRED, 17 August 2026 — 'an inactive service column title', white at 0.2
     over the scrim, 1.47:1 against a bar of 4.5. The dimming is gone: all
     three titles are solid white now and the active one is orange, at the same
     client's direction that put the dim state here in the first place. The
     white measurement moved up into PAIRS as a pass at 4.88 and the state that
     replaced it is the entry below.

     Kept as a note rather than deleted, because it is the only record of how
     the number was got wrong the first time: the foreground was written as
     C.white, which reported 4.88 — the figure for a title that is fully
     opaque, i.e. for the thing that was not on the page. It had to be
     composited at 0.2 first. A waiver carrying a figure the page does not
     produce is worse than no waiver: it reads as a small compromise instead of
     the real one. */
  ['an active service column title in orange', C.orange, C.serviceScrim, 3.0,
   'client decision, 17 August 2026',
   '--sixt-orange over the 0.62 scrim, against the 3.0 a title at 22–32px is ' +
   'entitled to. The client asked for the heading in each column to be white ' +
   'and to turn orange on hover, and this is the second half of that. It is a ' +
   'smaller failure than the dimmed title it replaced and it replaced it ' +
   'outright, so the section is better off: two of three titles used to be ' +
   'illegible at rest, and now every title not being pointed at is solid white ' +
   'at 4.88. What is left fails only on the ONE column the pointer or the ' +
   'keyboard is already on. 1.49 is also the worst case rather than the usual ' +
   'one — the ground is a photograph and this is orange over 62% black over ' +
   'WHITE, the brightest strip these three pictures hold. Over their dark half ' +
   'the same orange reaches 6.40. The fix, if it is revisited, is not a ' +
   'lighter scrim: that moves the white titles too, and they are the 4.88 the ' +
   'whole arrangement now rests on. It is a darker one, or black ink.'],
  ['the membership paragraph in white, BELOW 1280 ONLY', C.white, C.orange, 4.5,
   'client decision, 17 August 2026',
   'SCOPED TO UNDER 1280 as of the same day: from 1280 up the wash is gone, ' +
   'the copy is black on the artwork and measures 5.06, and these two waivers ' +
   'do not describe it. What is left below that width is the stacked layout, ' +
   'where the copy keeps a flat orange ground because a phone-sized crop of a ' +
   'photograph cannot be measured in advance. ' +
   '17px at weight 300 on the brand orange. White on --sixt-orange is 3.28:1 ' +
   'and clears the 3.0 bar only as large text, which body copy is not. The ' +
   'panel title at 40px/700 does pass on that exemption and is not waived; ' +
   'these two are the copy underneath it. No white fixes this — the ratio ' +
   'belongs to the two colours — so the only lever is a darker ground under ' +
   'the copy, and the panel does not have one: its left half is brand orange ' +
   'by design and the artwork\'s own field is lighter still at 3.02'],
  ['the membership "already a member?" line in white, BELOW 1280 ONLY', C.white, C.orange, 4.5,
   'client decision, 17 August 2026',
   'same scoping as the entry above. ' +
   '15px, the smallest type on the panel, on the same ground and at the same ' +
   '3.28. Its link half carries an underline as well as colour, so the link is ' +
   'still distinguishable from the sentence around it — that part does not ' +
   'depend on contrast and is why this is the less serious of the two'],
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

console.log('\nWAIVED — on the page, does not pass, shipped on a decision:');
WAIVED.forEach(function (p) {
  var r = ratio(p[1], p[2]);
  console.log('  ' + r.toFixed(2) + ':1  (needs ' + p[3].toFixed(1) + ')  ' +
    p[0] + '  [' + p[4] + ']\n           ' + p[5]);
});

console.log('');
if (failures) {
  console.log(failures + ' pair(s) failed');
  process.exit(1);
}
/* The summary says what is true and no more. It used to read "All N pairs
   pass", which while WAIVED is empty means the page passes AA and while it is
   not means nothing of the kind — and the difference is exactly the thing a
   summary line gets read for. */
if (WAIVED.length) {
  console.log('All ' + PAIRS.length + ' measured pairs pass, and ' + WAIVED.length +
    ' waived failure(s) are on the page — this page does NOT meet WCAG AA throughout.');
} else {
  console.log('All ' + PAIRS.length + ' pairs pass');
}
