# SIXT Thailand — Home Page Prototype

Static prototype of the redesigned `sixtthailand.com` home page, built to the
wireframe and moodboard supplied with `SIXT_Redesign_Brief.md`.

Full design rationale: `../docs/superpowers/specs/2026-08-13-sixt-thailand-home-redesign-design.md`

---

## Opening it

Double-click `index.html`. That is the whole procedure — no build, no
`npm install`, no local server. It is plain HTML with Tailwind loaded from a
CDN, so the only requirement is an internet connection for the fonts and
Tailwind itself.

To serve it over HTTP instead:

```bash
python3 -m http.server 8811
# then open http://127.0.0.1:8811/index.html
```

## Checking it

```bash
node tests/run.js            # 42 unit tests — data, copy, i18n, booking rules
node tools/check-contrast.js # 16 WCAG colour pairs
```

Both exit non-zero on failure. `tests/index.html` runs the same suite in a
browser if you prefer a visual list.

---

## Replacing the placeholder images — 19 slots

Every placeholder is labelled on screen with the exact filename it wants.
Drop the file into `assets/img/` using that name and it appears automatically —
except vehicles and promos, which also need their `image:` field filled in
(the third column below says where).

Convert new artwork to WebP first:

```bash
python3 - <<'PY'
from PIL import Image
im = Image.open("your-photo.jpg").convert("RGB")
im.save("assets/img/car-compact-toyota-yaris.webp", "WEBP", quality=82, method=6)
PY
```

### Vehicles — 12 slots, 16:9, minimum 1200×675

Set `image: 'assets/img/<name>.webp'` on the matching entry in `assets/js/data.js`.

| Tab | Filename |
|---|---|
| Premium | `car-premium-bmw-5-series.webp` |
| Premium | `car-premium-mini-cooper-s.webp` |
| SUV | `car-suv-honda-hr-v.webp` |
| SUV | `car-suv-toyota-fortuner.webp` |
| SUV | `car-suv-bmw-x1.webp` |
| MPV | `car-mpv-toyota-alphard.webp` |
| MPV | `car-mpv-toyota-commuter.webp` |
| MPV | `car-mpv-peugeot-5008.webp` |
| Compact | `car-compact-toyota-yaris.webp` |
| Compact | `car-compact-honda-city.webp` |
| Compact | `car-compact-toyota-altis.webp` |
| Compact | `car-compact-honda-civic.webp` |

Shoot these the way the four existing ones are shot: three-quarter front view,
white ground, SIXT plate. They are displayed with `object-fit: contain`, so a
cutout on white drops straight in.

### Promotion — 1 slot, 2:1, minimum 1600×800

Set `image:` on the `promo-slot-3` entry in `assets/js/content.js`.

| Filename |
|---|
| `promo-slot-3.webp` |

Campaign banners are never cropped — the card letterboxes them so baked-in
headlines survive. Anything between 2:1 and 2.6:1 sits well.

### Services — 3 slots, 3:4 portrait, minimum 900×1200

Set `image:` on the matching `SERVICES` entry in `assets/js/content.js`.

| Card | Filename |
|---|---|
| ขับเอง / Self-Drive | `service-self-drive.webp` |
| ลีมูซีน / Limousine | `service-limousine.webp` |
| เช่ารายเดือน / Subscription | `service-subscription.webp` |

### News — 3 slots, 16:9, minimum 1200×675

Set `image:` on the matching `NEWS` entry in `assets/js/content.js`.

| Filename |
|---|
| `news-ev-fleet.webp` |
| `news-chiang-mai.webp` |
| `news-southern-routes.webp` |

---

## Editing content

| What | Where |
|---|---|
| Branch list | `assets/js/data.js` → `LOCATIONS` |
| Vehicles, specs, prices | `assets/js/data.js` → `FLEET` |
| Promotions, services, news, FAQ, footer links | `assets/js/content.js` |
| Buttons, labels, error messages | `assets/js/i18n.js` → `dict` |
| Colour, type scale, spacing | `assets/css/tokens.css` |

Every content entry needs both `th` and `en`. `node tests/run.js` fails if one
is missing, so you cannot half-translate something by accident.

### Prices are not real

All 16 daily rates are invented. The live site does not publish them. Each
carries `priceIsPlaceholder: true` in `data.js` and a test asserts the flag is
still there. Replace the numbers and drop the flags before this goes anywhere
near a customer.

### News and FAQ copy is illustrative

Written to be plausible, not supplied by SIXT. Replace before launch.

---

## Things the client still has to confirm

1. **Hotline conflict.** The brief says `1798`; the KBank banner in the source
   assets prints `SIXT Call Center 1795`. The page uses `1798`.
2. **Prices** — see above.
3. **News and FAQ copy** — see above.
4. **The three inclusions on every vehicle card** — basic insurance, 24h
   roadside assistance, unlimited kilometres. These are contractual claims and
   were written as plausible defaults, not taken from SIXT's rental agreement.
   `FLEET_INCLUDES` in `content.js` carries `isPlaceholder = true` and a test
   asserts the flag survives. Check them against the real terms before launch.
5. **19 images** — see above.
5. **Tab taxonomy.** Tabs follow the wireframe and group by body type
   (Compact/SUV/MPV/Premium). The real booking engine groups by rate class
   (Economy/Compact/Standard/Premium/Electric). These will need mapping at
   integration.
6. **Language switcher placement.** It sits in the footer, as the wireframe
   specifies. An English-speaking visitor landing on the Thai default has to
   scroll the entire page to find it. Recommend adding one to the header next.
7. **The hero banner needs a mobile crop.** `Banner.png` is 1756×895 with its
   Thai headline, prices and fine print baked into the artwork. At 375px wide
   it renders 191px tall and the small type inside is illegible. Nothing in
   CSS can fix that — a portrait or square variant of the same campaign is
   required. Until one arrives, phone users get a decorative strip rather than
   a readable message.
8. **The hero carries no overlaid type, by request.** The page heading sits
   above the picture instead of on it, because the banner already contains its
   own headline and a second SIXT wordmark. If a clean photograph without type
   is supplied, the heading can move onto the image and the hero becomes the
   full cinematic treatment the reference calls for.

---

## Design decisions worth knowing before you change things

**Brand colours were measured, not copied from the brief.** Sampling
`logo.png` gives `#FF5000` and `#1A1A1A`; the brief estimated `#FF5F00` and
`#111111`. A test fails if the brief's values reappear.

**`.btn-primary` is locked to 19px/700.** White on `#FF5000` is 3.28:1, below
the 4.5:1 WCAG AA needs for normal text but above the 3.0:1 it needs for large
text (≥18.66px bold). The button size is what makes the brand's white-on-orange
combination legal. Shrink the label and it fails. This is why the `PROMO` badge
sits on black instead — at 11px there is no size exemption available.

**Colour bands invert the whole palette, so use `.band-dark` / `.band-orange`
rather than setting a background by hand.** Each class restates every colour it
needs — text, links, buttons and the focus ring. Miss one and it silently drops
to an unreadable ratio: the orange focus ring is 1.9:1 on black, and a filled
orange button disappears entirely on the orange band, which is why it inverts
to black there.

**The orange band has no muted text tone, deliberately.** Orange is a dark
enough ground that black at 78% falls to 4.01:1 — under AA — and the alpha
needed to pass (0.88) looks the same as solid black. Hierarchy on that band
comes from weight and size. `--on-orange-muted` does not exist; do not add it.
`--on-dark-muted` does exist, because black has the range for it (10.95:1).

**Input borders use `--border-input`, not `--grey-200`.** An input boundary is
a UI component under WCAG 1.4.11 and needs 3:1; `--grey-200` manages 1.3:1 and
is for decorative card edges only.

**No `<script type="module">`.** Chrome refuses to load modules over `file://`,
which would break the double-click-to-open requirement. Everything is a classic
script hanging off `window.SIXT`.

**Dates are parsed by hand.** `new Date('2026-08-15')` is read as UTC midnight
and renders as the 14th in some locales. Thai dates also use the Buddhist year.

**Smooth scrolling has a fallback.** Some environments ignore
`behavior: 'smooth'` entirely, which would silently break the
search-to-results handoff. The code checks whether the page actually moved and
jumps if it did not.

---

## Going to production

The Tailwind Play CDN compiles in the browser. It is fine for a prototype but
logs a warning and costs a few hundred milliseconds on first paint. To move to
a real build, keep `tokens.css` exactly as it is — it is the single source of
truth for colour and the Tailwind config only references it.
