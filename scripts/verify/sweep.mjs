// §9 rendered checks: horizontal overflow, exactly one h1, zero heading skips,
// and every image carrying dimensions and a non-null alt — at all seven widths,
// on every page.
//
// Run through `npm run verify`, or on its own against a running preview:
//   npm run build:styleguide && npm run preview &  →  node scripts/verify/sweep.mjs

import { connect, PAGES, WIDTHS, BASE } from './lib/cdp.mjs';
import { result, line, passed } from './lib/report.mjs';
import { isMain } from './lib/main.mjs';
import { assertServingDist } from './lib/served.mjs';

/**
 * Runs in the page.
 *
 * TWO FILTERS ON THE OVERFLOW LIST, both paid for:
 *
 *  1. `checkVisibility()`. A closed <details> hides its contents through
 *     `content-visibility`, which removes them from rendering and from the
 *     document's scroll extent but leaves getBoundingClientRect() returning their
 *     LAST LAID-OUT geometry. Without this filter every mobile menu on the site
 *     reports five phantom offenders at 390px while the document does not scroll
 *     at all — and a sweep nobody believes is a sweep nobody reads.
 *
 *  2. An ancestor that clips. A wide table or code block inside its own
 *     `overflow-x: auto` container is the correct way to handle wide content, not
 *     a defect. Only content that pushes the DOCUMENT is a defect.
 *
 * AND THEN THERE IS THE OVERFLOW THAT NEVER REACHES THE DOCUMENT.
 *
 * Everything above asks one question: does the PAGE scroll sideways. A word
 * wider than its own card does not make the page scroll — it lies on top of the
 * card beside it and the document is none the wiser. CentiPack shipped exactly
 * that: "distributors" is 97px at --text-h5 and the hero's stat card gives it
 * 67px at 320, so the label ran 30px into its neighbour while this sweep
 * reported seven green widths.
 *
 * `spill` is the second question: is any element's own CONTENT wider than its
 * own BOX. Three things are not spills and are excluded:
 *
 *   - the element scrolls or clips (`overflow-x` is not `visible`) — that is the
 *     correct way to carry wide content, and the spec table and the product rail
 *     both do it deliberately;
 *   - the element is invisible, by the same `checkVisibility()` rule as above;
 *   - the element is marked `data-bleed`, or contains something that is.
 *
 * `data-bleed` is the one escape hatch and it is deliberately INCONVENIENT: it
 * has to be written in the markup, at the element that bleeds, where a reviewer
 * reading the component sees it. Two things on this site legitimately extend
 * past their own box — the product rail, which cancels the page gutter with a
 * negative margin so the cards run to the screen edge, and the volume collage,
 * whose whole character is two shots hanging into the margin. Both are art
 * direction. Neither is discoverable from the geometry alone, which is why the
 * author declares it rather than the checker guessing at it from negative
 * margins and absolute positions.
 */
const PROBE = `(() => {
  const de = document.documentElement;
  const vw = de.clientWidth;
  const offenders = [];
  for (const el of document.querySelectorAll('body *')) {
    if (typeof el.checkVisibility === 'function' && !el.checkVisibility()) continue;
    const r = el.getBoundingClientRect();
    if (r.width <= 0 || r.right <= vw + 0.5) continue;
    let clipped = false;
    for (let p = el.parentElement; p; p = p.parentElement) {
      if (/auto|scroll|hidden|clip/.test(getComputedStyle(p).overflowX)) { clipped = true; break; }
    }
    if (!clipped) {
      const cls = String(el.className.baseVal ?? el.className).trim().split(/\\s+/)[0] || '';
      offenders.push(el.tagName.toLowerCase() + (cls ? '.' + cls : ''));
    }
  }
  /* Content wider than its own box. See the note above for the three exclusions. */
  const bleeds = [...document.querySelectorAll('[data-bleed]')];
  const spilling = [];
  for (const el of document.querySelectorAll('body *')) {
    if (el.scrollWidth - el.clientWidth <= 1) continue;
    if (typeof el.checkVisibility === 'function' && !el.checkVisibility()) continue;
    if (getComputedStyle(el).overflowX !== 'visible') continue;
    if (bleeds.some((b) => el.contains(b) || b.contains(el))) continue;
    /* Same rule the page-level check above already applies: content inside a
       container that clips or scrolls is CONTAINED, not spilled. The ramp on the
       styleguide is the case — a twelve-swatch strip in a rounded <ul> with
       overflow hidden, where the narrowest cell cannot hold "1000" at 320 and
       the <ul> is what stops it reaching anything else.
       (No backticks in this comment: the probe is a template literal.) */
    let clipped = false;
    for (let p = el.parentElement; p; p = p.parentElement) {
      if (getComputedStyle(p).overflowX !== 'visible') { clipped = true; break; }
    }
    if (clipped) continue;
    spilling.push(el);
  }
  /* Only the DEEPEST offender in a chain: a spill reports on every ancestor up
     to the first one that clips, and naming ten of them for one bad word makes
     the failure harder to read, not better evidenced. */
  const spills = spilling
    .filter((el) => !spilling.some((o) => o !== el && el.contains(o)))
    .map((el) => {
      const cls = String(el.className.baseVal ?? el.className).trim().split(/\s+/)[0] || '';
      /* Double-backslash-s, not single: this probe is a template literal, so a
         lone backslash-s is consumed as an unrecognised string escape and the
         regex the page actually compiles becomes /s+/g — which replaced every
         letter "s" in the evidence with a space, and printed the stat-card bug
         as "di tributor in between". The check was right; its report was lying. */
      const text = (el.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 32);
      /* String concatenation, not a nested template literal: this whole probe IS
         a template literal in the module above, so a dollar-brace in here is
         interpolated by Node at definition time rather than by the page at run
         time — which is a SyntaxError at import, not a wrong result. */
      return el.tagName.toLowerCase() + (cls ? '.' + cls : '') +
        ' +' + (el.scrollWidth - el.clientWidth) + 'px ' + JSON.stringify(text);
    });

  const headings = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')];
  const skips = [];
  let prev = 0;
  for (const h of headings) {
    const level = +h.tagName[1];
    if (prev && level > prev + 1) skips.push(prev + '->' + level);
    prev = level;
  }
  const imgs = [...document.querySelectorAll('img')];
  return JSON.stringify({
    overflow: de.scrollWidth > vw,
    scrollWidth: de.scrollWidth,
    viewport: vw,
    offenders: [...new Set(offenders)].slice(0, 5),
    spills: spills.slice(0, 5),
    h1: document.querySelectorAll('h1').length,
    headings: headings.length,
    skips,
    images: imgs.length,
    broken: imgs.filter((i) => i.complete && i.naturalWidth === 0).length,
    noDimensions: imgs.filter((i) => !i.getAttribute('width') || !i.getAttribute('height')).length,
    noAlt: imgs.filter((i) => i.getAttribute('alt') === null).length,
  });
})()`;

export async function sweep() {
  /* Before a single measurement, confirm this port is serving the build under
     test. A check whose counts are real but whose referent is somebody else's
     website has proven nothing — see lib/served.mjs. */
  await assertServingDist(BASE);

  const page = await connect(9400, 'outredge-verify-sweep');
  await page.send('Page.enable');
  await page.send('Runtime.enable');

  let checks = 0;
  let failures = 0;
  const notes = [];

  try {
    for (const path of PAGES) {
      for (const width of WIDTHS) {
        await page.send('Emulation.setDeviceMetricsOverride', {
          width,
          height: 900,
          deviceScaleFactor: 1,
          mobile: width < 768,
        });
        await page.send('Page.navigate', { url: BASE + path });
        await page.sleep(520);
        /* Lazy images below the fold never load in a headless viewport, so they
           would report as "not complete" rather than as broken. Force them in
           before measuring, or the image half of this check verifies nothing. */
        await page.eval(
          `(async () => {
             for (const i of document.querySelectorAll('img[loading="lazy"]')) i.loading = 'eager';
             await new Promise((r) => setTimeout(r, 250));
           })()`,
          true,
        );
        const d = JSON.parse(await page.eval(PROBE));
        checks++;

        const problems = [];
        if (d.overflow) problems.push(`overflows (${d.scrollWidth} > ${d.viewport})`);
        if (d.offenders.length) problems.push(`unclipped: ${d.offenders.join(', ')}`);
        if (d.spills.length) problems.push(`content spills its box: ${d.spills.join('; ')}`);
        if (d.h1 !== 1) problems.push(`${d.h1} h1 elements`);
        if (d.skips.length) problems.push(`heading skips ${d.skips.join(', ')}`);
        if (d.broken) problems.push(`${d.broken} broken images`);
        if (d.noDimensions) problems.push(`${d.noDimensions} images without width/height`);
        if (d.noAlt) problems.push(`${d.noAlt} images without alt`);

        if (problems.length) {
          failures++;
          notes.push(`${path} @${width}px — ${problems.join('; ')}`);
        }
      }
    }
  } finally {
    page.close();
  }

  return result('overflow + structure', {
    checks,
    failures,
    unit: `page/width checks (${PAGES.length} pages × ${WIDTHS.length} widths)`,
    notes,
  });
}

if (isMain(import.meta.url)) {
  const r = await sweep();
  console.log(line(r));
  for (const n of r.notes) console.log(`         ${n}`);
  process.exit(passed(r) ? 0 : 1);
}
