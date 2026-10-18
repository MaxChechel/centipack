// Stretched hit areas actually catch a press (§9).
//
// PAID FOR, ON THE DAY IT WAS WRITTEN. The category card's whole surface is one
// target: the link at the bottom grows a `::after` that covers the card, so a
// press anywhere follows it. That is a hit area built out of CSS, and CSS has a
// way of removing it silently —
//
//   `position: relative` was added to EVERY button so the hover mark had a
//   containing block. That also made each button the containing block for its
//   own `::after`, so `.category-card-link::after` stopped stretching over the
//   card and shrank to the link. Three cards on the home page and six more
//   across the category pages became unclickable everywhere except a few words
//   of link text.
//
// Nothing caught it. The markup was unchanged, every link still resolved, axe
// was happy, the keyboard check passed because the link is still reachable by
// Tab and still paints a ring, and the sweep saw no overflow. The card LOOKED
// identical. It was found by someone asking whether the card was still
// clickable.
//
// So this check presses. For every element that claims a stretched hit area, it
// samples nine points across the claiming container and asserts that each one
// resolves to an <a href>. `elementFromPoint` is the browser's own hit test —
// the same answer a real press would get, including every way CSS can take it
// away: a containing block that moved, an overflow that clips, a z-index that
// buries it, `pointer-events: none` inherited from somewhere unhelpful.
//
// It asserts the hit area at REST, which is the state that matters: the card
// shows only its title until hovered, and a target that only exists once you
// are already on it is not a target.
//
// A SKIP IS A FAILURE, AND THE FIRST VERSION OF THIS CHECK DID NOT KNOW THAT.
//
// It scrolled each container into view and then probed EVERY matching container
// on the page, so a card was counted once per sibling and the total was an
// artifact of the nested loop rather than a count of targets. Worse, anything
// not wholly inside the viewport after the scroll was `continue`d past in
// silence. The styleguide's two cards are 799px tall and sit where the page
// cannot centre them; they were never pressed, on any run, and the line still
// read green. That is the unfalsifiable green line §9 exists to forbid — the
// check was reporting on the containers that happened to fit, not on the
// contract.
//
// Now each declared target is probed ONCE, by index, and `checks` is the number
// of stretched targets on the site. Nothing is skipped: a container taller than
// the viewport is pressed across the band of it that is on screen, and a
// container that cannot be brought on screen at all, or that has lost its link,
// FAILS and is named. The count went 11 to 7 making this change and the
// coverage went up — 11 counted the home page's three cards three times each
// and the styleguide's two not at all.

import { connect, PAGES, BASE } from './lib/cdp.mjs';
import { result, line, passed } from './lib/report.mjs';
import { isMain } from './lib/main.mjs';

/**
 * The stretched-target contracts on this site, as `[container, the link inside]`.
 * A container listed here is asserting "all of me is one press"; if that stops
 * being true, this fails.
 */
const STRETCHED = [
  ['.category-card', '.category-card-link'],
  ['.cross-link', '.cross-link-target'],
];

/** Nine points, so a partial hit area fails rather than passing on its centre. */
const POINTS = [
  [0.15, 0.12], [0.5, 0.12], [0.85, 0.12],
  [0.15, 0.5], [0.5, 0.5], [0.85, 0.5],
  [0.15, 0.88], [0.5, 0.88], [0.85, 0.88],
];

/**
 * Press ONE container — the `index`th match — and report what happened.
 *
 * Returns a `state` rather than throwing, so the caller can tell a dead hit
 * area ("pressed", with misses) apart from a target it could not reach at all
 * ("offscreen") and from a structural break ("no-link"). All three are
 * failures; they are different failures and deserve different messages.
 */
const PROBE = (selector, linkSelector, index, points) => `JSON.stringify(function(){
  var n = document.querySelectorAll(${JSON.stringify(selector)})[${index}];
  if (!n) return { state: 'gone' };
  var label = (n.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 28);
  if (!n.querySelector(${JSON.stringify(linkSelector)})) return { state: 'no-link', label: label };

  var r = n.getBoundingClientRect();
  if (r.width < 4 || r.height < 4) {
    return { state: 'degenerate', label: label, w: Math.round(r.width), h: Math.round(r.height) };
  }

  /* Sample the part that is ON SCREEN. elementFromPoint is viewport-relative
     and answers null outside it, so clamping to the visible band presses a
     container taller than the viewport instead of skipping it. */
  var top = Math.max(r.top, 0), bottom = Math.min(r.bottom, window.innerHeight);
  var left = Math.max(r.left, 0), right = Math.min(r.right, window.innerWidth);
  if (bottom - top < 4 || right - left < 4) {
    return { state: 'offscreen', label: label,
             top: Math.round(r.top), bottom: Math.round(r.bottom), vh: window.innerHeight };
  }

  var pts = ${JSON.stringify(points)};
  var miss = [];
  for (var p = 0; p < pts.length; p++) {
    var el = document.elementFromPoint(left + (right - left) * pts[p][0],
                                       top + (bottom - top) * pts[p][1]);
    var link = el && el.closest ? el.closest('a[href]') : null;
    if (!link) miss.push(pts[p][0] + ',' + pts[p][1] + ' -> ' + (el ? el.tagName.toLowerCase() : 'null'));
  }
  return { state: 'pressed', label: label, misses: miss,
           clipped: top > r.top + 1 || bottom < r.bottom - 1 };
}())`;

export async function pointer() {
  const notes = [];
  let checks = 0;
  let failures = 0;
  let clipped = 0;
  const page = await connect(9226, 'cp-verify-pointer');

  try {
    await page.send('Emulation.setDeviceMetricsOverride', {
      width: 1440, height: 1600, deviceScaleFactor: 1, mobile: false,
    });
    await page.send('Page.enable');

    for (const path of PAGES) {
      await page.send('Page.navigate', { url: BASE + path });
      await page.sleep(1400);

      for (const [container, link] of STRETCHED) {
        const count = Number(
          await page.eval(`document.querySelectorAll(${JSON.stringify(container)}).length`),
        );
        if (!count) continue;

        for (let i = 0; i < count; i += 1) {
          /* Bring this one into view, then press THIS one. Probing every
             sibling on each pass is what made the old total meaningless.

             `behavior: 'instant'` IS LOAD-BEARING. The site sets
             `scroll-behavior: smooth`, which scrollIntoView obeys, so the
             scroll ANIMATES and the probe measures wherever the animation has
             got to. Short hops finished inside the wait and long ones did not:
             the styleguide's cards are 9,000px down and were still at their
             document offset when sampled, which is exactly how they came to be
             skipped every run. Instant scrolling makes the position
             deterministic instead of a race against an easing curve. */
          await page.eval(
            `(() => { const n = document.querySelectorAll(${JSON.stringify(container)})[${i}];
               if (n) n.scrollIntoView({ block: 'center', behavior: 'instant' }); return 1; })()`,
          );
          await page.sleep(260);
          const card = JSON.parse(await page.eval(PROBE(container, link, i, POINTS)));

          checks += 1;
          const where = `${path} ${container}[${i}]`;

          if (card.state === 'pressed' && card.misses.length === 0) {
            if (card.clipped) clipped += 1;
            continue;
          }

          failures += 1;
          if (card.state === 'pressed') {
            notes.push(
              `STRETCHED TARGET DEAD — ${where} "${card.label}": ` +
                `${card.misses.length} of ${POINTS.length} sampled points do not resolve to a link. ` +
                `First: ${card.misses[0]}. The container claims to be one press and is not.`,
            );
          } else if (card.state === 'no-link') {
            notes.push(
              `STRETCHED TARGET HAS NO LINK — ${where} "${card.label}": ` +
                `no \`${link}\` inside. The container claims a stretched hit area ` +
                `and there is nothing for it to stretch.`,
            );
          } else if (card.state === 'offscreen') {
            notes.push(
              `STRETCHED TARGET UNREACHABLE — ${where} "${card.label}": ` +
                `after scrollIntoView it sits at ${card.top}..${card.bottom} in a ${card.vh}px ` +
                `viewport, so no part of it can be pressed. Unasserted is not passing.`,
            );
          } else if (card.state === 'degenerate') {
            notes.push(
              `STRETCHED TARGET COLLAPSED — ${where} "${card.label}": ` +
                `measures ${card.w}x${card.h}. A target that small is not a target.`,
            );
          } else {
            notes.push(`STRETCHED TARGET GONE — ${where}: no node at that index on the second look.`);
          }
        }
      }
    }

    if (failures === 0) {
      notes.push(
        `${checks} stretched target(s) across ${PAGES.length} page(s), ` +
          `${POINTS.length} points each — every point lands on a link` +
          (clipped ? ` (${clipped} taller than the viewport, pressed across the visible band)` : ''),
      );
    }
  } finally {
    page.close();
  }

  return result('pointer targets', { checks, failures, unit: 'stretched-target checks', notes });
}

if (isMain(import.meta.url)) {
  const r = await pointer();
  console.log(line(r));
  for (const n of r.notes) console.log(`         ${n}`);
  process.exit(passed(r) ? 0 : 1);
}
