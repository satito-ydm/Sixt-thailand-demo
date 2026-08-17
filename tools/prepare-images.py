#!/usr/bin/env python3
"""Copy the supplied brand assets into assets/img as WebP.

Run once from the sixt-home directory:  python3 tools/prepare-images.py
Source files live in the repository root, one level up.

NOTE: eleven assets in assets/img are .jpg rather than .webp and were not
produced by this script — three promotion banners, promo-ground, three
resupplied vehicle shots and three service photographs. Pillow was not
installed on the machine they were prepared on, so they were resized with
System.Drawing through PowerShell, which has no WebP encoder. Their sources are
listed in JPEG_JOBS below purely so the provenance is recorded.

**Pillow is available now** — 12.3.0, checked 2026-08-17, and it is what
produced faq-car.webp. The "re-run them once Pillow is available" note that
stood here for several sessions is a job that can be done rather than a
condition being waited on. All five JOBS sources were confirmed present on the
same date, so the loop should run; it has simply not been run, because
re-encoding eleven live assets is its own change and not one to make in the
middle of a layout edit.
"""
import pathlib
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT = pathlib.Path(__file__).resolve().parents[1] / "assets" / "img"
OUT.mkdir(parents=True, exist_ok=True)

# source relative to repo root  ->  output stem
JOBS = [
    # Re-supplied as top1.png, 1811x868, replacing hero-lionair-airport.png at
    # 2138x1029. Same campaign, same message, and the alt text in content.js
    # already described this exact picture down to the E-Ticket line, so it did
    # not change. Saved at native size: it is smaller than the file it replaced
    # and resampling it up to match would add bytes, not detail. See the crop
    # note on the lionair-skyline slide for what 2.086:1 costs in a 2:1 frame.
    ("top1.png",                                     "hero-lionair-skyline"),
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
    # SUPERSEDED — all three service pictures were resupplied on 2026-08-17 as
    # s1.png, s2.png and s3.jpg at the repository root, and they are .webp now,
    # produced by this script rather than by System.Drawing. The three entries
    # below and the w1.png one under them are the previous generation and are
    # kept only as provenance; nothing references their .jpg outputs.
    #
    #   s1.png  1920x536  ->  service-self-drive.webp     (sunset coast)
    #   s2.png  1920x536  ->  service-limousine.webp      (Suvarnabhumi kerbside)
    #   s3.jpg  1920x536  ->  service-subscription.webp   (handover, keys)
    #
    # Saved at native size, quality 86, 128 + 86 + 86 = 300 KB for the three.
    # All three are 3.58:1 — cut to the shape the banner is at 1440, where cover
    # keeps 100% of their width.
    #
    # Resupplied a second time on the same day, at 1920 from an earlier 1360, and
    # that second pass is what closed the one problem the first set had: at 1360
    # they were UNDER the 1533px the banner renders at 1440, so they were being
    # upscaled about 13% even at 1x. 1920 covers the widest breakpoint outright.
    # The mapping was re-checked rather than assumed — each new source was
    # thumbnailed against all three shipped files and matched its own slot by a
    # clear margin (s1 41.6 against 70.5 and 76.8, and so on).
    #
    # The one shape problem that remains is a layout one, not a resolution one,
    # and it is written up on .svc-bg in app.css: below 768 the columns stack and
    # the box behind them goes to 0.48:1, where cover would keep 13.5% of the
    # picture. The layer becomes a strip at its own ratio there instead.
    #
    # NOT s3.png. There is also an s3.png at the root, 1672x941, and it is a
    # DIFFERENT photograph — checked, mean absolute difference 44 against s3.jpg
    # at thumbnail size. The set that matches in shape and subject is
    # s1.png / s2.png / s3.jpg.
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

# assets/img/closing-hero.webp — the brand key visual, full bleed across the
# closing section. Source closing-hero2 at the repository root — a JPEG with no
# extension on it, 1774x887 — saved at native size and quality 86. Not resized:
# 1774 is under the 1920 breakpoint by 8% and upscaling to meet it would invent
# detail the file does not have.
#
# It replaced Car/thank.png, which is the same composition at the same size in a
# darker grade and without the orange arc in the bottom right. That arc matters
# to anyone changing .closing-glow: the wash and the artwork's own brand curve
# now meet in the same corner, and they were tuned to read as one shape rather
# than as two oranges at different strengths.
#
# NEVER CROP THIS ONE. The lockup, the country line and the two-line tagline
# are printed into the artwork, and no other copy of those words exists on the
# page — the section's own heading and paragraph were removed when it arrived,
# on the grounds that two headlines saying the same thing is what the news
# section was rebuilt to stop. There is no object-fit and no aspect-ratio on
# .closing-hero for the same reason. Same rule as the promotion banners.
#
# assets/img/closing-chauffeur.webp is what it replaced and nothing references
# it any more. Left in the tree rather than deleted: it is the only copy of
# that crop, and the section it was made for may come back.

# assets/img/faq-car.webp — the picture standing on the FAQ band with its
# subject crossing the join onto the key visual below.
# Source Car/ฟกฟกฟ.png, 1024x1536 RGBA — a woman with a suitcase stepping away
# from the X7. It replaced Car/car-faq.png, 1536x1024, which was the same car
# alone from the rear three-quarter; that source is still in the tree.
#
# IT IS A CUTOUT. THE ALPHA HAS TO SURVIVE. Steps:
#
#   1. crop to the opaque bounds, read from the alpha channel rather than
#      hard-coded — this source carries 160px of empty above the subject and
#      the current one cropped to 1,396 .. 1024,1377
#   2. save WEBP, quality 86, alpha intact
#
# No resize. 1023px is already about 1.9x the ~530px column the picture renders
# into at the 1440 container, and rounding it up to 1200 would invent detail.
# The previous source was landscape and was resized down to 1200; this one is
# not, and nothing in the CSS names a ratio, so the shape is free to change.
#
# Check the corners still read a=0 afterwards. A matte would show the moment the
# subject crossed onto the artwork, which is most of what it is there to do.
#
# Worth recording how this was got wrong first, because the mistake is an easy
# one and it cost an asset and a layout. The source opens against a dark studio
# backdrop in any viewer that composites transparency onto black — which looked
# like a photograph on a black ground, so it was flattened onto black, its
# blacks lifted so the rectangle's bottom row matched --sixt-black exactly, and
# framed in CSS with a radius and overflow:hidden. All of that was real work
# spent making an edge invisible, and the file had no edge: 36.6% of it is
# fully transparent and all four corners are a=0. One numpy read of the alpha
# channel before converting would have said so.

# member-car.webp's note below says neither Pillow nor System.Drawing could
# write WebP with alpha here. Pillow can, and did, for faq-car.webp — so the
# headless-Chrome canvas recipe recorded there is no longer the only way to
# produce these. It has been left in place because it is the provenance of the
# file that actually shipped, not because it is still the best route.

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

# The three news pictures. They are not commissioned photographs — they are
# SIXT Thailand's own social posts, supplied in pic_img/content, and all three
# are square at source. That is why .news-media is 1:1: two of them carry their
# own lettering, and a centre crop to the 3:2 this section was designed around
# would have cut the title off the top of one and the logo off the bottom of
# the other. The ratio followed the sources; the sources were not cut to fit.
#
# 1000x1000, which is 2.2x the 453px column the three-up list gives each item
# at the 1536 container. Bigger than the 2x the rest of the page settles for,
# because these are the only pictures here whose legibility is their own
# baked-in type rather than a subject.
#
# NOT PRODUCED BY THIS SCRIPT. Pillow is still not installed (see the module
# docstring) so these went through the same headless-Chrome canvas as
# member-car.webp:
#   1. draw the source to a canvas, centre-cropped square, at 1000x1000
#   2. toDataURL('image/webp', 0.78) -> assets/img/<stem>.webp
#
# 0.78 rather than the 0.86 member-car.webp uses, and the instinct was the
# other way: two of these are posters, their subject IS fine Thai lettering,
# so spend on them. Four settings were encoded instead and the smallest type
# in each compared at 1:1 of the 1000px source — more resolution than a 2x
# screen can ask of a 453px column. 0.78 and 0.86 are not distinguishable
# there. The three together are 250 KB at 0.78 and 367 KB at 0.86.
# Check bytes 8..12 of the output read "WEBP" — Chrome silently returns a PNG
# from toDataURL when it cannot honour the format, and a PNG of a photograph
# at this size is roughly six times the file.
NEWS_JOBS = [
    ("pic_img/content/2.jpg",                          "news-branch-event", 1000),
    ("pic_img/content/668552762_972624645451353_699289362102309240_n.jpg",
                                                       "news-family-day",   1000),
    ("pic_img/content/738546328_1047568717956945_1939210619484628277_n.jpg",
                                                       "news-why-rent",     1000),
]

# A fourth post was supplied and is deliberately unused:
# pic_img/content/728984494_1036828549030962_4603823503306439495_n.jpg,
# "อยากเที่ยว..แต่ติดงาน". It is 1080x1350 rather than square, and it is an
# infographic — four stacked benefit cards down its right side — so a square
# crop loses two of the four and the piece stops making its own argument. It
# needs its own ratio or its own section, not this one's frame.

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
