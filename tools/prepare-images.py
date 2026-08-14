#!/usr/bin/env python3
"""Copy the supplied brand assets into assets/img as WebP.

Run once from the sixt-home directory:  python3 tools/prepare-images.py
Source files live in the repository root, one level up.

NOTE: four assets in assets/img are .jpg rather than .webp and were not
produced by this script — the three promotion banners and promo-ground. Pillow
is not installed on the machine they were prepared on, so they were resized
with System.Drawing through PowerShell, which has no WebP encoder. Their
sources are listed in JPEG_JOBS below purely so the provenance is recorded.
Re-run them through this script once Pillow is available: the WebP will be
smaller again, and the tree will stop mixing two formats.
"""
import pathlib
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT = pathlib.Path(__file__).resolve().parents[1] / "assets" / "img"
OUT.mkdir(parents=True, exist_ok=True)

# source relative to repo root  ->  output stem
JOBS = [
    ("hero-lionair-airport.png",                     "hero-lionair-skyline"),
    ("Banner 16-9.png",                              "hero-lionair-camry"),
    ("Banner.png",                                   "hero-banner"),
    ("54QYBUJF.jpg",                                 "promo-kbank-domestic"),
    ("Car/bmw.png",                                  "car-premium-bmw-3-series"),
    ("Car/a9a4d41a-13f6-473b-818a-1925b5ebf277.png", "car-premium-mercedes-c-class"),
    ("Car/e10659e4-2939-482b-9a27-b5d4176af74c.png", "car-suv-honda-cr-v"),
    ("Car/2d906091-ff27-42d4-a2d6-a5d1e874a954.png", "car-mpv-toyota-veloz"),
    ("logo.png",                                     "logo"),
]

# Prepared outside this script — see the module docstring. Width is the long
# edge they were resized to; the three banners are 1672x941 at source, which is
# 16:9 and the exact ratio of the promo card frame.
JPEG_JOBS = [
    ("promotion/2cc959c9-a585-4179-be56-6aac7eadf048.png", "promo-ais-chauffeur",       1200),
    ("promotion/97031bc1-0166-4909-bcbe-84bac05904ee.png", "promo-kbank-international", 1200),
    ("promotion/0987b3ad-ac13-4aac-ad55-06177c115c19.png", "promo-mobilife-platform",   1200),
    ("v960-ning-19.jpg",                                   "promo-ground",              1600),
]

# Car/70YDMMJR.jpg (the Xpeng G6 banner) is deliberately absent from both lists.
# Its card was replaced by the promotion/ artwork and nothing references the
# output any more. The source is still in the tree if the campaign returns.

for rel, stem in JOBS:
    src = ROOT / rel
    if not src.exists():
        raise SystemExit("missing source asset: %s" % src)
    im = Image.open(src)
    # Vehicle cutouts are shot on white; flatten any alpha onto white so the
    # WebP does not carry a transparent fringe over the grey card background.
    keep_alpha = stem == "logo"
    if im.mode in ("RGBA", "LA", "P"):
        im = im.convert("RGBA")
        if not keep_alpha:
            flat = Image.new("RGB", im.size, (255, 255, 255))
            flat.paste(im, mask=im.split()[-1])
            im = flat
    elif not keep_alpha:
        im = im.convert("RGB")

    dst = OUT / (stem + ".webp")
    im.save(dst, "WEBP", quality=82, method=6)
    print("%-46s %5dx%-5d -> %-34s %4d KB" % (
        rel, im.width, im.height, dst.name, dst.stat().st_size // 1024))

# The header sits on black until the page moves, then turns white. SIXT's own
# dark-ground lockup keeps the orange accent and turns only the letters white —
# which a CSS filter cannot do, since `brightness(0) invert(1)` flattens the
# orange along with everything else. Derived from the same master rather than
# fetched: www.sixt.com refuses automated requests, and the one logo reachable
# from it is the light-ground version at 96x39, far too small for this header.
src = ROOT / "logo.png"
im = Image.open(src).convert("RGBA")
px = im.load()
recoloured = 0
for y in range(im.height):
    for x in range(im.width):
        r, g, b, a = px[x, y]
        if a == 0:
            continue
        # Orange carries hue; the wordmark does not. Anything unsaturated is
        # part of the letterforms and flips to white, alpha untouched so the
        # anti-aliased edges stay smooth.
        if max(r, g, b) - min(r, g, b) < 40:
            px[x, y] = (255, 255, 255, a)
            recoloured += 1
dst = OUT / "logo-on-dark.webp"
im.save(dst, "WEBP", quality=90, method=6, lossless=True)
print("%-46s %5dx%-5d -> %-34s %4d KB  (%d px turned white)" % (
    "logo.png (recoloured for dark grounds)", im.width, im.height, dst.name,
    dst.stat().st_size // 1024, recoloured))

print("\n%d assets written to %s" % (len(JOBS), OUT))
