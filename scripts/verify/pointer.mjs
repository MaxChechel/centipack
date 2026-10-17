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

const PROBE = (selector, linkSelector, points) => `JSON.stringify(function(){
  var out = [];
  var nodes = document.querySelectorAll(${JSON.stringify(selector)});
  var pts = ${JSON.stringify(points)};
  for (var i = 0; i < nodes.length; i++) {
    var n = nodes[i];
    if (!n.querySelector(${JSON.stringify(linkSelector)})) continue;
    var r = n.getBoundingClientRect();
    if (r.width < 4 || r.height < 4) continue;
    /* Only sample what is actually on screen — elementFromPoint is
       viewport-relative and returns null outside it, which would be a failure
       about scrolling rather than about the hit area. */
    if (r.top < 0 || r.bottom > window.innerHeight) continue;
    var miss = [];
    for (var p = 0; p < pts.length; p++) {
      var el = document.elementFromPoint(r.x + r.width * pts[p][0], r.y + r.height * pts[p][1]);
      var link = el && el.closest ? el.closest('a[href]') : null;
      if (!link) miss.push(pts[p][0] + ',' + pts[p][1] + ' -> ' + (el ? el.tagName.toLowerCase() : 'null'));
    }
    out.push({ label: (n.textContent || '').trim().slice(0, 28), misses: miss });
  }
  return out; }())`;

export async function pointer() {
  const notes = [];
  let checks = 0;
  let failures = 0;
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
        /* Scroll each one into view before testing: a target below the fold is
           skipped by the probe, and a skipped target is not an asserted one. */
        const count = await page.eval(
          `document.querySelectorAll(${JSON.stringify(container)}).length`,
        );
        if (!count) continue;
        for (let i = 0; i < count; i++) {
          await page.eval(
            `(() => { const n = document.querySelectorAll(${JSON.stringify(container)})[${i}];
               if (n) n.scrollIntoView({ block: 'center' }); return 1; })()`,
          );
          await page.sleep(260);
          const found = JSON.parse(await page.eval(PROBE(container, link, POINTS)));
          for (const card of found) {
            checks += 1;
            if (card.misses.length) {
              failures += 1;
              notes.push(
                `STRETCHED TARGET DEAD — ${path} ${container} "${card.label}": ` +
                  `${card.misses.length} of ${POINTS.length} sampled points do not resolve to a link. ` +
                  `First: ${card.misses[0]}. The container claims to be one press and is not.`,
              );
            }
          }
        }
      }
    }

    if (failures === 0) {
      notes.push(
        `${checks} stretched target(s) across ${PAGES.length} page(s), ` +
          `${POINTS.length} points each — every point lands on a link`,
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
