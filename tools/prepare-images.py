#!/usr/bin/env python3
"""Copy the supplied brand assets into assets/img as WebP.

Run once from the sixt-home directory:  python3 tools/prepare-images.py
Source files live in the repository root, one level up.

NOTE: eleven assets in assets/img are .jpg rather than .webp and were not
produced by this script — three promotion banners, promo-ground, three
resupplied vehicle shots and three service photographs. Pillow
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
    # Resupplied a second time as PNGs named .jpg, at three different sizes —
    # 1492x1054, 1496x1051, 1502x1047. Centre-cropped to one canonical
    # 1200x838 so every card's frame is filled by the same shape; the trim was
    # at most 10px of the template's own margin.
    ("Car/BMW2.jpg",                                       "car-premium-bmw-3-series",   1200),
    ("Car/benz.jpg",                                       "car-premium-mercedes-c-class", 1200),
    ("Car/suv1.jpg",                                       "car-mpv-toyota-veloz",       1200),
    # The service tiles. Cropped to the shape each tile takes — 3:4 for the
    # tall one, 2:1 for the two wide.
    #
    # READ THIS BEFORE RE-RUNNING. The slot a source feeds is not the slot its
    # filename implies, because two of these three were resupplied in place and
    # the new pictures did not land where the old ones had been:
    #
    #   80c0c895  was the self-drive shot. It is now a chauffeur holding a door
    #             at Suvarnabhumi, which is the limousine subject, and it feeds
    #             service-limousine.
    #   c1ca2024  was the limousine source and is not referenced any more. It
    #             holds the previous, weaker version of the same scene.
    #   ee062d21  is the subscription shot in both versions.
    #
    # The mapping was settled against the alt text in content.js rather than
    # against the filenames: each NEWS and SERVICES entry describes the picture
    # it is written for, so the copy is what says which photograph belongs
    # where. Resupplying a file in place cannot say that, and the filename
    # stopped being evidence the moment the first one was overwritten.
    #
    # Two of the three are the resupplied versions and were cut with
    # System.Drawing, centre-cropped rather than top-cropped: both are 1536x1024
    # and their subjects sit across the middle, so the crop takes sky and paving
    # that were spare. Only service-self-drive is still the original top-crop —
    # its source is gone, overwritten by the limousine picture, and the derived
    # 900x1200 JPEG is now the only copy of it that exists.
    ("pic_img/80c0c895-42d4-4641-adf9-7a09df6f557c.png",   "service-limousine",          1400),
    ("pic_img/ee062d21-4e86-4805-a29d-aa7cb17ade5b.png",   "service-subscription",       1400),
    # w1.png is the resupplied self-drive shot and it arrived portrait —
    # 1086x1449, which is 0.749 against the tile's 0.750, so the crop takes
    # one pixel and the frame is the photograph's own. It is shot from inside
    # the car looking out, which is the only one of the three that puts the
    # viewer in the driving seat, and the dark headlining across its top is
    # where the tall tile happens to place its heading.
    ("pic_img/w1.png",                                     "service-self-drive",          900),
    # A services-ground entry sat here, for a photograph behind the three
    # tiles. The band is a flat colour again — the bento covers its middle at
    # every width, so the picture only ever showed in the padding. Source kept
    # at pic_img/59fbb783-b1f7-4597-ac58-36c05ce9cd0a.png if it is wanted for
    # something that can actually show it.
]

# assets/img/member-car.webp is not produced here either, and it is the one
# asset in the tree that could not be. It is a cutout of an orange BMW 3 Series
# for the membership panel, from pic_img/car4.png, and it has to keep its alpha
# channel: it overhangs the panel onto both a black band and the white page, so
# there is no single ground to flatten it against.
#
# PNG keeps the alpha and cannot compress a photograph — the same picture is
# 1062 KB as a PNG and 102 KB as lossy WebP. Neither Pillow nor System.Drawing
# is available to write WebP here, so it was encoded by drawing the PNG to a
# canvas in headless Chrome and reading back toDataURL('image/webp', 0.86).
# Steps, if it needs redoing:
#   1. crop pic_img/car4.png to its opaque bounds  — 126,53 to 1409,947
#   2. resize the crop to 960px on the long edge
#   3. canvas -> toDataURL('image/webp', 0.86) -> assets/img/member-car.webp
# Check the corners still read A=0 afterwards; a matte would show as a dark
# rectangle the moment the picture crosses the panel's edge.

# Waiting on files. The three news photographs are commissioned but not
# supplied; drop them in the repository root as the names on the left and
# uncomment. See NEWS in content.js — each item already carries the alt text
# describing what its picture is meant to show, which is also the shot brief.
#
# 1000px on the long edge, cropped to 3:2 by .news-media at display time. That
# is 2x the 453px column the three-up list gives each item at the 1536
# container, so it is sharp on a retina screen and nothing wider is doing any
# work. Send anything 1500px or larger and any ratio near landscape; the crop
# is centred and takes from the sides.
NEWS_JOBS = [
    # ("news-ev-fleet.jpg",        "news-ev-fleet",        1000),
    # ("news-chiang-mai.jpg",      "news-chiang-mai",      1000),
    # ("news-southern-routes.jpg", "news-southern-routes", 1000),
]

# There is no SUV photograph any more. The CR-V's own shot was unframed and
# the wrong ratio for the card, so every SUV card borrows the Veloz until a
# framed SUV arrives. Its source is still at
# Car/e10659e4-2939-482b-9a27-b5d4176af74c.png if it is wanted back.

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
