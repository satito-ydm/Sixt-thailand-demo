/* SIXT Thailand — bilingual section copy.
   Prose lives here, separate from data.js (which holds things with a shape
   worth validating) and from i18n.js (which holds UI chrome strings).
   Every entry must carry both `th` and `en`; tests enforce parity.

   PLACEHOLDER CONTENT: news items and FAQ answers are written as realistic
   examples, not supplied by the client. Replace before launch. */
(function (root) {
  'use strict';
  root.SIXT = root.SIXT || {};

  /* One line each, which is a copy constraint before it is a layout one: the
     column is ~437px at the widest viewport and a line of this size holds
     about 45 characters of English there. The bodies below were cut from
     roughly twice that. What went is the qualifying half of each sentence —
     "with a booking flow built to stay out of your way", "that fits your
     schedule" — and the claim itself is intact in all three.

     tests.js asserts the ceiling. Nothing here can be lengthened without
     turning the band back into two lines. */
  var VALUE_PROPS = [
    {
      id: 'booking',
      icon: 'cursor',
      th: { title: 'จองออนไลน์ง่าย', body: 'จองรถที่ต้องการได้ในไม่กี่คลิก' },
      en: { title: 'Easy Online Booking', body: 'Reserve the car you want in a few clicks.' }
    },
    {
      id: 'flexible',
      icon: 'calendar',
      th: { title: 'เลือกได้ตามการใช้งาน', body: 'รายวัน รายสัปดาห์ รายเดือน หรือระยะยาว' },
      en: { title: 'Flexible Rental Options', body: 'Daily, weekly, monthly or long-term.' }
    },
    {
      id: 'trusted',
      icon: 'shield',
      th: { title: 'บริการมาตรฐาน SIXT', body: 'มาตรฐานระดับโลก ดูแลตลอด 24 ชั่วโมง' },
      en: { title: 'Trusted SIXT Service', body: 'Global standards, care around the clock.' }
    }
  ];

  /* Hero carousel.

     The frame is 2:1. Every slide shares it under object-fit: cover, so a
     slide whose ratio drifts loses the difference off its edges — and each of
     these banners carries its headline, logos and terms baked into the
     picture.

     Measured against a 2:1 frame, per edge:
       KBank          2.00:1   exact
       banner3        1.78:1   5.6% off the top and bottom — clears the logos
                               at 8% and the date bar ending at 90%
       Banner         1.96:1   1.0% off the sides, but it is the same Thai
                               Lion Air campaign as banner3
       Xpeng G6       2.54:1  10.6% off the sides — takes the headline
       Banner 16-9    2.63:1  12.0% off the sides — takes the wordmark
     The last two stay promotion cards.

     6% per edge is the default budget, and it assumes the worst: artwork with
     its wordmark hard against the edge, which is how every banner above was
     drawn. A slide laid out with real margin can afford more, but only after
     someone has cropped the file to the frame and looked at the result — say
     so with `safeEdge` on that slide and write down what was measured. Guessing
     it defeats the check.

     Adding a slide: convert it in tools/prepare-images.py and append it here. */
  /* 2.5:1 AS OF 2026-08-18, up from 2:1, and it is the artwork that moved
     rather than a preference. All three banners were re-cut to 1920x768 for
     the fixed hero height, which is exactly 2.5:1 — so a 2:1 frame was
     cropping 10% off each side of every one of them for no reason at all.
     At 2.5 the crop below HERO_FIXED_FROM is nil.

     Keep in step with .hero-slider's aspect-ratio; a test measures the two
     against each other, and a second test measures every slide against this. */
  var HERO_FRAME_RATIO = 2.5 / 1;
  /* The frame is not 2:1 on a phone — .hero-slider goes 4/3 under 768 so the
     artwork has some height. A landscape banner in that frame loses a third of
     its width, which on this campaign set means the wordmark and the price: the
     three originals keep 68%, 64% and 51% of themselves, measured.

     So a slide may carry its own `mobile` artwork, cut for THIS ratio, and
     ui.js swaps to it with a <picture> source. Same rules as the main image —
     declare the real width and height, and the tests check both against the
     file and against this frame rather than the desktop one. */
  var HERO_MOBILE_FRAME_RATIO = 4 / 3;

  /* ── The fixed desktop height, and what it costs ────────────────────────
     Client direction, 2026-08-18: the hero is 768px tall. Taken with the
     numbers below in front of them, and they are the reason this block exists
     rather than a bare declaration in the stylesheet.

     A FIXED HEIGHT ON A FULL-BLEED BANNER RETIRES THE FRAME RATIO. Above
     HERO_FIXED_FROM the frame is no longer 2:1 — it is viewport-width over 768,
     which is 1.67:1 at 1280 and 2.50:1 at 1920. HERO_FRAME_RATIO and the 6%
     budget it guards still describe the frame BELOW that breakpoint and
     nowhere else, so the crop has to be declared here per width instead of
     derived once.

     THE ARTWORK ANSWERED THIS, LATER THE SAME DAY. The note here used to end
     "what would fix it is artwork, not CSS — anything at or above 2.5:1 sits in
     this height with nothing lost", and both banners were re-cut to exactly
     that: 1920x768, 2.5:1, which IS the frame at a 1920 window. The 25%
     top-crop that took the MOBILIFE lockup off the picture is gone, and so is
     every vertical crop — a 2.5:1 file in a frame that is never taller than
     2.5:1 is only ever cropped left and right.

     WORST PER-EDGE LOSS, NOW ALL HORIZONTAL AND THE SAME FOR BOTH SLIDES:

         1280   16.7%   off each side   = 320px of the 1920 source
         1440   12.5%                   = 240px
         1536   10.0%                   = 192px
         1680    6.2%                   = 120px
         1920    0.0%                   — the file is the frame

     WHICH MOVES THE PROBLEM RATHER THAN ENDING IT, and the number that decides
     it is in the artwork: mobilife-coupon's SIXT | MOBILIFE lockup starts at
     column 263 of 1920, 13.7% in. So it clears 1440's 12.5% by 23 pixels and
     is cut 57 pixels deep at 1280. lionair-skyline is comfortable — its lockup
     starts about 24% in and the 10% edge is sky and glass.

     Read plainly: this pair of banners is correct at 1920, tight at 1536, on
     the line at 1440 and clipped below it. The page is checked at 1440 and 390
     and passes both. A third cut, or a hero that keeps 2.5:1 instead of a flat
     768 below 1536, is what closes the last of it.

     The test that reads this asserts the measured numbers still match. Change
     the height, the breakpoint or a slide's artwork and it fails with the new
     figure, so this table cannot quietly go stale. */
  var HERO_FIXED_HEIGHT = 768;
  var HERO_FIXED_FROM = 1280;
  var HERO_FIXED_CROP = {
    1280: 0.167,
    1440: 0.125,
    1536: 0.100,
    1680: 0.062,
    1920: 0.000
  };

  var HERO_SLIDES = [
    {
      id: 'lionair-skyline',
      image: 'assets/img/hero-lionair-skyline.webp',
      /* RE-CUT FOR THE 768px HERO, supplied 2026-08-18 under the same filename.
         1920x768 is exactly 2.5:1, which is exactly the frame at a 1920 window
         — nothing is cropped there at all. It was 1811x868 at 2.09:1, drawn
         for the 2:1 frame this banner had before the height was fixed.

         safeEdge 0.10, and it is declared rather than assumed. Below 1280 the
         frame is still 2:1, and a 2.5:1 file in it loses 10% off each side.
         That is over the strict 6% default and it is safe HERE because of
         where this artwork puts its type: the SIXT | Thai Lion Air lockup
         starts about 24% in, so a 10% crop takes sky, the terminal's glass and
         the leading edge of the orange arc — which is drawn bleeding off that
         edge anyway. */
      width: 1920,
      height: 768,
      /* 2.086:1, drawn all but on the frame: cover trims 37.5px off each side,
         2.07%, comfortably inside the default 6% budget — so no safeEdge
         override, and no focus bias either, since nothing is cropped
         vertically and the sides lose only sky and terminal glass.

         Re-supplied as top1.png and the numbers above are that file's, measured
         rather than carried over. It replaced a 2138x1029 version of the same
         campaign and is SMALLER than it, which is the one thing to know about
         this slide: at 1811px it is under the 1920 breakpoint, so the widest
         screens scale it up about 6%. The alternative was resampling it to 2138
         and inventing the difference, which is not more detail, only more bytes.
         If a larger master ever arrives, this is the slide to re-cut first —
         it is the first picture on the page. */
      /* The phone cut of the same campaign, supplied 2026-08-17. 1448x1086 is
         1.3333:1 against the mobile frame's 1.3333 — the file IS the frame, and
         nothing is cropped at any width where it is used. The landscape file in
         that same frame lost 18% off each side and took the SIXT and Thai Lion
         Air lockup with it.

         It is a RE-LAYOUT, not a re-crop, which is what README open item 7 has
         been asking for: the lockup has moved up and in, the aircraft has come
         down into the frame, and the headline and its two lines of terms are
         set above the car instead of beside it. A 2:1 composition cannot be
         made to work at 4:3 by any amount of cropping — the proof is that
         cropping the desktop file is exactly what was already happening.

         3.4x the widest phone box (428px), so it holds on a 3x screen.

         The declared numbers are the ENCODED file's, not the PNG's. Lossy WebP
         subsamples chroma and rounds odd dimensions down to even: the source
         was 1447x1087 on its first supply and came out 1448x1086, and the test
         that matches these numbers against the header would have failed on the
         PNG's. Read them back from the .webp, never from what went in. */
      mobile: {
        image: 'assets/img/hero-lionair-skyline-m.webp',
        width: 1448,
        height: 1086
      },
      th: { alt: 'แคมเปญ SIXT ร่วมกับ Thai Lion Air — เช่ารถพร้อมคนขับ รับ-ส่งสนามบิน สิทธิพิเศษสำหรับผู้โดยสาร Thai Lion Air เพียงแสดงบัตรโดยสารหรือ E-Ticket ภาพ Mercedes-Benz E-Class สีขาวหน้าอาคารผู้โดยสาร มีเครื่องบิน Thai Lion Air และสกายไลน์กรุงเทพฯ เป็นฉากหลัง' },
      en: { alt: 'SIXT with Thai Lion Air — chauffeured airport transfers, a perk for Thai Lion Air passengers on showing a boarding pass or e-ticket; a white Mercedes-Benz E-Class outside the terminal, a Thai Lion Air aircraft and the Bangkok skyline behind' }
    },
    {
      /* THE BRAND KEY VISUAL, SECOND IN THE ROTATION, at the client's direction
         on 2026-08-18 — added as the first slide and moved to second within
         the hour. It is the same artwork that stood at the foot of the page
         until earlier the same day — three cars, a couple and the Bangkok
         skyline, with the SIXT Thailand lockup and DRIVE YOUR / JOURNEY / OWN
         YOUR / EXPERIENCE printed into it — re-cut from the closing section's
         2:1 to the hero's 1920x768.

         THE ONE THING TO KNOW ABOUT THIS FILE, and it is the tightest artwork
         on the page: its type starts 3.3% in from the left edge — the headline
         at column 64 of 1920, the lockup at 119. Every other banner keeps its
         words well inside; this one does not.

         What that means in practice, against HERO_FIXED_CROP: at 1920 nothing
         is cropped and the slide is perfect. At 1536 the side crop is 10% and
         eats 6.7 points into the headline. At 1440 it is 12.5% and the words
         "DRIVE YOUR" lose their left third. It is correct at 1920 and degrades
         from about 1500 down, which is the opposite of every other slide here.

         Two things fix it and neither is CSS: a re-cut with the type inside the
         middle 70% the way mobilife-coupon has it at 13.7%, or a hero that
         keeps 2.5:1 instead of a flat 768 below 1536. Recorded rather than
         quietly cropped.

         No `mobile` cut was supplied. Below 768 the frame is 4:3 and this file
         loses 23.3% off each side there — the whole left column. It is the one
         slide of the three without a phone variant and it is the one that
         needs it most. */
      id: 'brand-skyline',
      image: 'assets/img/hero-brand-skyline.webp',
      width: 1920,
      height: 768,
      /* PINNED TO THE LEFT EDGE, and this is the fix for the paragraph above
         rather than a composition choice. Centred, the 12.5% side crop at 1440
         takes 240px off a left edge whose first type sits at column 64: the
         lockup came out as "XT | CAR | D" and the headline as "E YOUR /
         URNEY", which is what the screenshot showed. Pinned, the left edge is
         never cropped at all and the whole 25% comes off the RIGHT — sky,
         skyline and the sunset over the water, no words, and the composition
         still reads because the cars sit left of centre.

         It is the only slide that needs this. The other two keep their type
         13.7% and about 24% in, and a centred crop never reaches either. */
      focus: '0% 50%',
      /* THE PHONE CUT, supplied 2026-08-18 an hour after the landscape one and
         the reason the paragraph above no longer ends badly. Without it this
         slide was losing 23.3% off each side in the 4:3 frame — the entire
         left column, which on this artwork is the lockup and the whole
         headline.

         1448x1086 is 1.3333:1 against the mobile frame's 1.3333, so the file
         IS the frame and nothing is cropped at any width where it is used;
         `focus` does not apply to it. Third slide of three to get one, and the
         same spec as the other two, which is not a coincidence — it is the
         spec this project asks for.

         A RE-LAYOUT, not a re-crop: the lockup and the headline have moved up
         and in, the three cars have come down and the Fortuner runs off the
         right edge instead of being centred. Cropping the landscape file to
         4:3 is exactly what was happening before this arrived.

         Dimensions read back from the encoded .webp, not from the source —
         1448x1086 held because the source was already even on both axes. */
      mobile: {
        image: 'assets/img/hero-brand-skyline-m.webp',
        width: 1448,
        height: 1086
      },
      th: { alt: 'SIXT Thailand — Drive Your Journey, Own Your Experience ภาพคู่รักลากกระเป๋าเดินทางผ่านรถ BMW สีส้ม Mercedes-Benz สีขาว และ Toyota Fortuner สีดำ ที่จอดเรียงกันริมแม่น้ำ โดยมีสกายไลน์กรุงเทพฯ และตึกมหานครเป็นฉากหลัง' },
      en: { alt: 'SIXT Thailand — Drive Your Journey, Own Your Experience. A couple walk with their luggage past an orange BMW, a white Mercedes-Benz and a black Toyota Fortuner parked by the river, with the Bangkok skyline and the Mahanakhon tower behind' }
    },
    {
      /* Replaced the KBank domestic banner on 2026-08-17 at the client's
         direction, then re-supplied within the hour as the full campaign
         artwork, and REPLACED AGAIN ON 2026-08-18 with a new photograph of the
         same campaign: the friends in the open boot of an orange MINI at a
         viewpoint are gone, and it is now a couple at a clifftop villa beside
         an orange Toyota Yaris Cross. Every printed claim is unchanged — the
         same headline, the same 1,000-baht coupon, the same LINE QR, the same
         1–31 August run, the same four excluded models, the same 1798 / master
         lockups — so only the scene half of the two alts moved. The outgoing
         file is `hero-mobilife.webp` and it is left in the tree, unreferenced,
         on the same terms as the other retired artwork.

         WORTH A HUMAN EYE: the car in this picture is a Toyota Yaris Cross and
         the artwork's own legal line excludes the Toyota Yaris. Different
         models, and the exclusion is presumably meant literally — but the hero
         car of a promotion and the first name on its exclusion list now read as
         the same word to anyone skimming. That is a claim inside a JPEG again,
         not a bug in this file.

         1717x916 is 1.875:1 in a 2:1 frame — the same shape as the artwork it
         replaces — so cover trims 58 rows, the TOP AND BOTTOM, because this
         slide is squarer than the frame rather than wider. 3.14% per edge,
         inside the 6% budget.

         THE BUDGET STILL IS NOT WHAT DECIDES THIS ONE, and it was re-measured
         rather than assumed to carry over. Counting dark pixels in the new
         file:

           top 58 rows      0.0% ink across the left three quarters,
                            28.8% in the far right — the tree, which bleeds
                            off the frame on purpose
           bottom, left ¼   lowest ink at row 876 of 916, so the
                            "1798 / www.sixthailand.com / master" strip has
                            39 rows of floor under it
           top, left ¼      first ink at row 88 — the SIXT | MOBILIFE lockup

         This artwork is kinder than the last one: its bottom lockup is no
         longer hard against the edge, so a centred 29-row crop would clear it
         with 10 rows to spare rather than cutting 27 off it. `focus: 50% 100%`
         is kept anyway, and now by preference instead of necessity — it takes
         the whole 58 off the top, where the left three quarters are empty sky
         and the only thing paid for is foliage already running out of frame,
         and it leaves the legal strip its full clearance. */
      id: 'mobilife-coupon',
      image: 'assets/img/hero-mobilife-villa.webp',
      /* RE-CUT FOR THE 768px HERO, supplied 2026-08-18 under the same filename,
         same campaign and same photograph — 1920x768, exactly 2.5:1, so the
         1920 window crops nothing. It was 1717x916 at 1.87:1.

         safeEdge 0.10 on the same terms as the slide above, and this one is
         the tighter of the two by a distance. Its SIXT | MOBILIFE lockup
         starts at column 263 of 1920 — 13.7% in — so a 10% crop clears it with
         3.7 points to spare and the 2:1 frame below 1280 is fine.

         WHAT IS NOT FINE IS THE MIDDLE OF THE DESKTOP RANGE, and it is not
         this budget that governs there. From 1280 up the frame is
         viewport/768, so the side crop is 16.7% at 1280 and 12.5% at 1440
         against type at 13.7%: the lockup survives at 1440 by 23px and is cut
         by 57px at 1280. See HERO_FIXED_CROP — that table is where the fixed
         height's cost is recorded, and this artwork moved the whole cost onto
         the horizontal axis.

         `focus` is kept and now does nothing: it pins the vertical axis, and
         a 2.5:1 file in a frame that is never taller than 2.5:1 is only ever
         cropped left and right. It stays because the phone frame is 4:3 and
         the desktop file is what a browser falls back to if the mobile source
         is ever removed. */
      width: 1920,
      height: 768,
      focus: '50% 100%',
      /* THE PHONE CUT, supplied 2026-08-18 with the artwork above, and it
         closes the last open item on this page: this slide had none, so the
         landscape file was being served into the 4:3 mobile frame and losing
         14.4% off EACH side — which took "ยิ่งเช่า" down to "ช่า", cut the
         lockup to "MOBI life", and put half the LINE QR and most of the 1798
         strip off the frame. Every printed claim on this slide lives in that
         left column, so the phone was the one place a visitor could not read
         any of them.

         1448x1086 is 1.3333:1 against the mobile frame's 1.3333 — the file IS
         the frame, so nothing is cropped at any width where it is used, and
         `focus` does not apply to it. Same spec as slide 1's phone cut, which
         is not a coincidence: it is the spec this project asked for.

         It is a RE-LAYOUT, not a re-crop. The headline has been reset two lines
         over a taller sky, the couple and the car have come down and in, and
         the QR, the dates and the legal line are stacked under the coupon copy
         rather than beside it. A 1.875:1 composition cannot be made to work at
         4:3 by any amount of cropping; the proof is what cropping it was
         already doing.

         Measured, since the edges are what a supplied file gets wrong: no ink
         in the top 120 rows, first ink at column 85 on the left, 88 rows of
         floor under the 1798 / master strip, and the villa deliberately bleeds
         off the right edge to the last column.

         The declared numbers are the ENCODED file's, not the PNG's — lossy
         WebP rounds odd dimensions down to even, and the test that checks these
         against the header would fail on the source's. Read back from the
         .webp: 1448x1086, unchanged from the source this time because it was
         already even on both axes. */
      mobile: {
        image: 'assets/img/hero-mobilife-villa-m.webp',
        width: 1448,
        height: 1086
      },
      /* THE ALT CARRIES THE TERMS, because they exist nowhere else on the page.
         This artwork prints its own run dates, its own exclusions and its own
         hotline, and the alt is the only route any of that has to a reader who
         cannot see the picture. Same rule the closing key visual follows.

         Two of them are worth a human eye before launch: the offer runs
         1–31 August 2026, so it is live today and expires in two weeks with
         nothing on the page that knows it; and four models are excluded, three
         of which — Yaris, City, Altis — are cars this site's own fleet tab
         offers. Neither is a bug in the markup. Both are claims inside a JPEG,
         which is the thing this project keeps finding. */
      th: { alt: 'แคมเปญ SIXT ร่วมกับ MOBILIFE — ยิ่งเช่า ยิ่งได้คืน รับ E-Coupon สูงสุด 1,000 บาท สำหรับสมาชิก MOBILIFE สมัครสมาชิกผ่าน LINE ด้วยคิวอาร์โค้ดบนภาพ ระยะเวลา 1–31 สิงหาคม 2569 ไม่ร่วมรายการ Toyota Yaris, Honda City, Toyota Altis และ Honda Civic สอบถาม 1798 ภาพคู่รักยืนมองวิวทะเล ข้างรถ Toyota Yaris Cross สีส้ม จอดอยู่หน้าบ้านพักริมหน้าผา' },
      en: { alt: 'SIXT with MOBILIFE — the more you rent, the more you get back: an e-coupon worth up to ฿1,000 for MOBILIFE members. Join MOBILIFE through the LINE QR code shown. Runs 1–31 August 2026. Excludes the Toyota Yaris, Honda City, Toyota Altis and Honda Civic. Enquiries on 1798. A couple stand looking out to sea beside an orange Toyota Yaris Cross parked at a clifftop villa' }
    }
  ];

  /* Shown on every vehicle card. PLACEHOLDER TERMS: these are plausible for a
     Thai rental but have not been confirmed against SIXT Thailand's actual
     rental agreement. They are contractual claims, so verify before launch. */
  var FLEET_INCLUDES = [
    { id: 'insurance', th: 'รวมประกันภัยพื้นฐาน', en: 'Basic insurance included' },
    { id: 'roadside',  th: 'ช่วยเหลือฉุกเฉิน 24 ชม.', en: '24h roadside assistance' },
    { id: 'mileage',   th: 'ไมล์ไม่จำกัด',           en: 'Unlimited kilometres' }
  ];
  FLEET_INCLUDES.isPlaceholder = true;

  /* The three banners supplied in promotion/. Every one is 1672x941, which is
     16:9 to three decimals — the card frame's own ratio — so these fill it
     edge to edge with no letterboxing at all. The banners they replaced ran
     2.54:1 and 2:1 and could not.

     Titles and figures below are transcribed from the artwork, not written:
     each banner already states its own offer, and the card must not contradict
     the picture above it.

     `ends` is the last day the artwork itself prints. Nothing reads it yet —
     it is here because one of these three is already past it, and a date that
     lives only inside a JPEG cannot be checked by anything. */
  var PROMOS = [
    {
      id: 'ais-chauffeur',
      image: 'assets/img/promo-ais-chauffeur.jpg',
      imageSlot: 'promo-ais-chauffeur',
      ends: '2026-12-18',
      th: { title: 'เช่ารถพร้อมคนขับ รับ-ส่งสนามบิน', body: 'Toyota Camry เริ่มต้น 1,099 บาท/เที่ยว ใช้เอไอเอส พอยท์ 1 คะแนนแลกรับส่วนลด', alt: 'แบนเนอร์ SIXT ride Chauffeur ร่วมกับ AIS บริการรับส่งสนามบินพร้อมคนขับ' },
      en: { title: 'Airport Transfers with a Chauffeur', body: 'Toyota Camry from ฿1,099 a trip. Redeem a single AIS Point for the discount.', alt: 'SIXT ride Chauffeur and AIS airport transfer promotion banner' }
    },
    {
      id: 'kbank-international',
      image: 'assets/img/promo-kbank-international.jpg',
      imageSlot: 'promo-kbank-international',
      ends: '2026-03-31',
      th: { title: 'เดินทางต่างประเทศกับ KBank ลด 20%', body: 'ส่วนลด 20% เช่ารถขับเองและลีมูซีนกว่า 110 ประเทศ พร้อมคูปองมูลค่า 1,000 บาท', alt: 'แบนเนอร์ SIXT ร่วมกับ KBank สำหรับการเดินทางต่างประเทศ' },
      en: { title: '20% Off International Travel with KBank', body: '20% off self-drive and limousine hire in over 110 countries, plus a ฿1,000 coupon.', alt: 'SIXT and KBank international travel promotion banner' }
    },
    {
      id: 'mobilife-platform',
      image: 'assets/img/promo-mobilife-platform.jpg',
      imageSlot: 'promo-mobilife-platform',
      ends: null,
      th: { title: 'MOBILIFE แพลตฟอร์มใหม่', body: 'สมัครง่าย สะสมเร็ว แลกคะแนนสะดวกกว่าเดิม เชื่อมต่อสมาชิกผ่าน LINE ได้ทันที', alt: 'แบนเนอร์แพลตฟอร์มสมาชิก MOBILIFE โฉมใหม่' },
      en: { title: 'MOBILIFE, Rebuilt', body: 'Quicker to join, faster to earn and simpler to redeem. Link your membership over LINE.', alt: 'MOBILIFE membership platform relaunch banner' }
    }
  ];

  /* Two lines each, and the break is written here rather than left to the
     measure. Where a line turns is an editorial decision — Thai runs without
     spaces, so a browser filling greedily splits a phrase mid-word and no
     width setting reliably stops it. The escape is honoured by
     white-space: pre-line on .service-text, and a line still wraps further if
     a narrow screen leaves it no room.

     tests.js holds the total length at both ends: too long and a third line
     appears, too short and the string collapses onto one while its neighbours
     stay at two.

     Three supplied photographs, one per tile, each cropped to the shape its
     tile takes and cropped from the top — all three put their subject in the
     upper half and their clear ground in the lower. */
  var SERVICES = [
    {
      id: 'self-drive',
      image: 'assets/img/service-self-drive.webp',
      imageSlot: 'service-self-drive',
      variant: 'primary',
      /* RESUPPLIED as sv1.jpg on 2026-08-17, and the alt is a different
         sentence rather than an edited one — the picture is not a variation of
         what it replaced, it is a different shot. What was there was a woman
         at a coastal viewpoint seen from outside the car; this is the driver's
         own view from behind the wheel. The subject moved from the scenery to
         the driving, which is what the column is selling, and the English body
         copy already said "with the wheel in your hands".

         1920x660, which is 2.909:1 — the banner's own ratio at its widest, so
         nothing is cropped horizontally for the first time in this section. */
      th: { title: 'ขับเอง', body: 'เช่าสั้น ยืดหยุ่นตามแผนของคุณ\nควบคุมการเดินทางได้เอง', cta: 'เช่ารถ',
            alt: 'มุมมองจากที่นั่งคนขับ มือทั้งสองจับพวงมาลัย มองผ่านกระจกหน้าออกไปเห็นถนนเลียบชายทะเลทอดโค้งไปตามหน้าผา และพระอาทิตย์ตกเหนือผืนน้ำ' },
      en: { title: 'Self-Drive', body: 'Short rentals that flex around your plans,\nwith the wheel in your hands.', cta: 'Rent a Car',
            alt: 'The view from the driver\'s seat, both hands on the wheel, looking out along a coastal road curving around a headland into the sunset' }
    },
    {
      id: 'limousine',
      image: 'assets/img/service-limousine.webp',
      imageSlot: 'service-limousine',
      variant: 'secondary',
      th: { title: 'ลีมูซีนพร้อมคนขับ', body: 'คนขับผ่านการอบรมมาตรฐาน SIXT\nพาคุณถึงที่หมายอย่างมืออาชีพ', cta: 'ดูบริการลีมูซีน',
            alt: 'คนขับสวมสูทและถุงมือขาวเปิดประตูรถซีดานสีดำให้ผู้โดยสารชุดสูท หน้าอาคารผู้โดยสารท่าอากาศยานสุวรรณภูมิยามพระอาทิตย์ตก' },
      en: { title: 'Limousine', body: 'A chauffeur trained to SIXT standards drives;\nyou arrive ready.', cta: 'Explore Limousine',
            alt: 'A chauffeur in a suit and white gloves holding the door of a black sedan for a suited passenger outside the Suvarnabhumi airport terminal at sunset' }
    },
    {
      id: 'subscription',
      image: 'assets/img/service-subscription.webp',
      imageSlot: 'service-subscription',
      variant: 'secondary',
      th: { title: 'เช่ารถรายเดือน', body: 'ทางเลือกแทนการเช่าซื้อ จ่ายรายเดือน\nราคาเดียวครบจบ เปลี่ยนรุ่นได้', cta: 'ดูแพ็กเกจรายเดือน',
            alt: 'พนักงานชุดสูทส่งกุญแจรถให้ลูกค้าหน้ารถซีดานสีดำ ที่ลานหน้าอาคารสำนักงาน' },
      en: { title: 'Car Subscription', body: 'A monthly alternative to leasing —\nall in one price, and you can switch models.', cta: 'Explore Subscription',
            alt: 'A member of staff handing car keys to a customer beside a black sedan outside an office building' }
    }
  ];

  /* The pictures arrived and the copy was rewritten to them, which is the
     reverse of how the rest of this file was built and worth saying plainly.
     The alt text elsewhere is a shot brief written before the photograph; here
     the photographs came first — three of SIXT Thailand's own social posts —
     so the headline, the body and the alt all describe a frame that already
     exists. Nothing below is invented about a picture nobody has taken.

     Two of the three carry their own lettering: `family-day` has HAPPY FAMILY
     DAY set across its top, `why-rent` has a diagonal headline and "17 สาขา
     ทั่วไทย". That is why .news-media is square rather than the 3:2 it was
     designed as — a centre crop to 3:2 takes a third off the top and bottom of
     a square post, which is exactly where a poster puts its title and its
     logo. The claim in `why-rent`'s body is read off its own artwork rather
     than added to it.

     It also decides what the headlines may say. Both of those two were first
     written as the poster's own words and both had to be rewritten, because a
     headline directly under a picture that already shouts the same sentence in
     display type says it twice in two typefaces and adds nothing the second
     time. So the picture keeps the campaign name and the headline carries what
     the campaign *is* — `family-day`'s names the seven seats, and the campaign
     title moved down into its body. Anything set large inside the artwork is
     spoken for; write around it.

     The list still renders complete with `image: null`; renderNews draws no
     placeholder and no gap. A fourth post exists and is deliberately not here
     — see NEWS_JOBS in tools/prepare-images.py. */
  var NEWS = [
    {
      id: 'branch-event',
      date: '2026-08-09',
      image: 'assets/img/news-branch-event.webp',
      imageSlot: 'news-branch-event',
      th: { title: 'เปิดโชว์รูมใหม่ ต้อนรับลูกค้าองค์กร', body: 'พบทีมงานและทดลองรถได้ที่โชว์รูมแห่งใหม่ พร้อมแพ็กเกจเช่าระยะยาวสำหรับองค์กร',
            alt: 'ลูกค้าและทีมงานนั่งคุยกันรอบโต๊ะในโชว์รูม มีลูกโป่งสีส้มและรถจอดอยู่หลังผนังกระจก' },
      en: { title: 'New Showroom Opens for Corporate Clients', body: 'Meet the team and try the cars at our newest showroom, with long-term corporate rental packages.',
            alt: 'Guests and staff talking around a table in the showroom, with orange balloons and a car parked behind the glass wall' }
    },
    {
      id: 'family-day',
      date: '2026-07-26',
      image: 'assets/img/news-family-day.webp',
      imageSlot: 'news-family-day',
      th: { title: 'รถ 7 ที่นั่งพร้อมออกทริปกับครอบครัว', body: 'แคมเปญ Happy Family Day ช่วงวันหยุดยาว จองล่วงหน้าและรับรถได้ทุกสาขาทั่วประเทศ',
            alt: 'ครอบครัวเดินออกจากบ้านพักริมทะเลตอนพลบค่ำ มีรถ MPV ไฟฟ้าสีเงินจอดรออยู่ข้างหน้า' },
      en: { title: 'Seven Seats, Ready for the Family Trip', body: 'The Happy Family Day campaign for the long weekends — book ahead and collect from any branch nationwide.',
            alt: 'A family leaving a beach house at dusk, with a silver electric MPV waiting in front of them' }
    },
    {
      id: 'why-rent',
      date: '2026-07-12',
      image: 'assets/img/news-why-rent.webp',
      imageSlot: 'news-why-rent',
      th: { title: 'ทำไมต้องซื้อ? สิ่งที่การเช่าประหยัดให้', body: 'เปลี่ยนรุ่นรถได้ตามการเดินทาง ไม่ต้องแบกค่าเสื่อมและค่าบำรุงรักษา ครบ 17 สาขาทั่วไทย',
            alt: 'รถคูเป้สีขาววิ่งบนถนนเลียบชายฝั่งยามพระอาทิตย์ตก มีสาขา SIXT ตั้งอยู่ริมทาง' },
      en: { title: 'Why Buy? What Renting Saves You', body: 'Change model as the journey changes, with no depreciation or servicing to carry — 17 branches across Thailand.',
            alt: 'A white coupé on a coastal highway at sunset, with a SIXT branch beside the road' }
    }
  ];

  var FAQ = [
    {
      id: 'documents',
      th: {
        q: 'ต้องใช้เอกสารอะไรบ้างในการรับรถ?',
        a: 'ผู้เช่าต้องแสดงใบขับขี่ที่ยังไม่หมดอายุ บัตรประชาชนหรือหนังสือเดินทาง และบัตรเครดิตในชื่อผู้เช่าสำหรับวางมัดจำ ผู้ขับขี่ชาวต่างชาติควรมีใบขับขี่สากลควบคู่กับใบขับขี่ของประเทศตนเอง'
      },
      en: {
        q: 'What documents are required to pick up my rental vehicle?',
        a: 'Bring a valid driving licence, your national ID card or passport, and a credit card in the main driver’s name for the deposit. Overseas drivers should also carry an International Driving Permit alongside their home licence.'
      }
    },
    {
      id: 'deposit',
      th: {
        q: 'เงินมัดจำเท่าไหร่ และได้คืนเมื่อไหร่?',
        a: 'ยอดมัดจำขึ้นอยู่กับคลาสของรถ โดยจะกันวงเงินไว้บนบัตรเครดิตในวันรับรถ ไม่ใช่การตัดเงินจริง วงเงินจะถูกปลดหลังคืนรถและตรวจสภาพเรียบร้อย โดยทั่วไปใช้เวลา 7–14 วันทำการขึ้นอยู่กับธนาคารผู้ออกบัตร'
      },
      en: {
        q: 'How much is the security deposit and when is it released?',
        a: 'The amount depends on the vehicle class and is held against your credit card at pickup rather than charged. The hold is released once the car has been returned and inspected, typically within 7–14 business days depending on your card issuer.'
      }
    },
    {
      id: 'cross-border',
      th: {
        q: 'นำรถเช่าขับข้ามประเทศได้หรือไม่?',
        a: 'การนำรถออกนอกประเทศไทยต้องได้รับอนุญาตเป็นลายลักษณ์อักษรล่วงหน้า และมีเงื่อนไขเพิ่มเติมด้านประกันภัยและเอกสารศุลกากร กรุณาติดต่อฝ่ายบริการลูกค้าที่ 1798 ก่อนวันเดินทางอย่างน้อย 14 วัน'
      },
      en: {
        q: 'Can I drive the rental vehicle across international borders?',
        a: 'Taking a vehicle out of Thailand requires written approval in advance and carries additional insurance and customs requirements. Please contact customer service on 1798 at least 14 days before you travel.'
      }
    },
    {
      id: 'cancellation',
      th: {
        q: 'นโยบายยกเลิกเป็นอย่างไรหากเที่ยวบินล่าช้า?',
        a: 'การจองที่ยกเลิกล่วงหน้าอย่างน้อย 48 ชั่วโมงจะได้รับเงินคืนเต็มจำนวน หากเที่ยวบินล่าช้าและคุณแจ้งหมายเลขเที่ยวบินไว้ตอนจอง เราจะถือรถไว้ให้โดยไม่คิดค่าใช้จ่ายเพิ่ม'
      },
      en: {
        q: 'What is the cancellation policy if my flight is delayed?',
        a: 'Bookings cancelled at least 48 hours ahead are fully refunded. If your flight is delayed and you supplied the flight number when booking, we hold your vehicle at no extra charge.'
      }
    }
  ];

  var FOOTER = [
    {
      id: 'services',
      th: 'บริการ', en: 'Services',
      links: [
        { th: 'เช่ารถรายวัน',      en: 'Daily Car Rental' },
        { th: 'รถพร้อมคนขับ',      en: 'Chauffeur Service' },
        { th: 'บริการลีมูซีน',      en: 'Limousine Service' },
        { th: 'รับส่งสนามบิน',      en: 'Airport Transfer' },
        { th: 'ลูกค้าองค์กร',       en: 'Corporate Fleet' }
      ]
    },
    {
      id: 'explore',
      th: 'สำรวจ', en: 'Explore',
      links: [
        { th: 'สาขาทั้งหมด',       en: 'Our Locations' },
        { th: 'โปรโมชัน',          en: 'Special Deals' },
        { th: 'ฟลีตรถยนต์',        en: 'Fleet Overview' },
        { th: 'คู่มือการเดินทาง',   en: 'Travel Guides' },
        { th: 'โปรแกรมพันธมิตร',   en: 'Partner Program' }
      ]
    },
    {
      id: 'support',
      th: 'ช่วยเหลือ', en: 'Support',
      links: [
        { th: 'ติดต่อเรา',         en: 'Contact Center' },
        { th: 'ช่วยเหลือ & FAQ',   en: 'Help & FAQs' },
        { th: 'แจ้งความเสียหาย',    en: 'Damage Reports' },
        { th: 'ประกันภัย',         en: 'Insurance Details' },
        { th: 'แผนผังเว็บไซต์',     en: 'Sitemap' }
      ]
    },
    {
      id: 'membership',
      th: 'สมาชิก', en: 'Membership',
      links: [
        { th: 'SIXT Membership',  en: 'SIXT Membership' },
        { th: 'Silver Tier',      en: 'Silver Tier' },
        { th: 'Gold Tier',        en: 'Gold Tier' },
        { th: 'Platinum Tier',    en: 'Platinum Tier' },
        { th: 'พันธมิตร',          en: 'Partner Programs' }
      ]
    },
    {
      id: 'legal',
      th: 'ข้อกำหนด', en: 'Legal',
      links: [
        { th: 'ข้อกำหนดและเงื่อนไข',   en: 'Terms & Conditions' },
        { th: 'นโยบายความเป็นส่วนตัว', en: 'Privacy Policy' },
        { th: 'การตั้งค่าคุกกี้',       en: 'Cookie Settings' },
        { th: 'Imprint',              en: 'Imprint' },
        { th: 'ระเบียบการเช่า',        en: 'Rental Guidelines' }
      ]
    }
  ];

  root.SIXT.content = {
    HERO_SLIDES: HERO_SLIDES,
    HERO_FRAME_RATIO: HERO_FRAME_RATIO,
    HERO_FIXED_HEIGHT: HERO_FIXED_HEIGHT,
    HERO_FIXED_FROM: HERO_FIXED_FROM,
    HERO_FIXED_CROP: HERO_FIXED_CROP,
    HERO_MOBILE_FRAME_RATIO: HERO_MOBILE_FRAME_RATIO,
    VALUE_PROPS: VALUE_PROPS,
    FLEET_INCLUDES: FLEET_INCLUDES,
    PROMOS: PROMOS,
    SERVICES: SERVICES,
    NEWS: NEWS,
    FAQ: FAQ,
    FOOTER: FOOTER
  };
})(typeof window !== 'undefined' ? window : globalThis);
