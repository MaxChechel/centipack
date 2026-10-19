// The reveal contract's two safety guarantees, pressed (§9, §12.2, §12.3).
//
// WHY THIS EXISTS, in the same terms the pointer check does. Scroll reveal
// works by hiding content and promising to put it back. Both halves of that
// promise are invisible in source and silent when broken:
//
//   - WITHOUT JAVASCRIPT the content must never be hidden in the first place.
//     The hiding is gated on `html.js`, set by a blocking one-liner in <head>.
//     Delete the guard, move the one-liner below the stylesheet, or let the
//     class name drift, and every revealed section on the site becomes a blank
//     band for anyone whose script did not run.
//
//     THAT IS NOT A PREDICTION. Removing the `html.js` guard was run against
//     the whole suite: every revealed element on eight pages painted invisible
//     with scripting off, and NINE OF TEN CHECKS PASSED. astro check, the
//     contrast matrix, dead classes, the JS census, build contracts, the
//     seven-width sweep, keyboard, pointer targets and axe-core all reported
//     green on a site whose content had disappeared. axe has no opinion on an
//     element at `opacity: 0`; the sweep sees no overflow; every link still
//     resolves. It is a content-loss bug that looks exactly like a working
//     page in every other artefact we keep.
//
//   - UNDER prefers-reduced-motion the content must be VISIBLE AND STILL
//     (§12.3), never hidden waiting for an observer that may not fire.
//
// So this check turns scripting off and asks the browser what it actually
// painted, then asks again with reduced motion on. `getComputedStyle` is the
// same answer the compositor works from, including every way a later rule can
// take the guarantee away.
//
// It also asserts the happy path — that a group DOES reveal when scrolled to —
// because a contract that only ever proves its fallbacks would pass just as
// well with the whole feature deleted.

import { connect, PAGES, BASE } from './lib/cdp.mjs';
import { result, line, passed } from './lib/report.mjs';
import { isMain } from './lib/main.mjs';

/** Every group child's painted visibility on the current page. */
const PROBE = `JSON.stringify(function(){
  var groups = document.querySelectorAll('[data-reveal-group]');
  var out = { groups: groups.length, hidden: [], js: document.documentElement.classList.contains('js') };
  for (var g = 0; g < groups.length; g++) {
    var kids = groups[g].children;
    for (var k = 0; k < kids.length; k++) {
      var cs = getComputedStyle(kids[k]);
      if (Number(cs.opacity) < 0.99 || cs.transform !== 'none') {
        out.hidden.push('group ' + g + ' child ' + k + ' opacity=' + cs.opacity +
                        ' transform=' + (cs.transform === 'none' ? 'none' : 'translated'));
      }
    }
  }
  return out; }())`;

export async function reveal() {
  const notes = [];
  let checks = 0;
  let failures = 0;
  const page = await connect(9227, 'cp-verify-reveal');

  try {
    await page.send('Emulation.setDeviceMetricsOverride', {
      width: 1440, height: 900, deviceScaleFactor: 1, mobile: false,
    });
    await page.send('Page.enable');

    let groupsSeen = 0;
    let revealed = 0;

    for (const path of PAGES) {
      /* 1 — SCRIPTING OFF. Nothing may be hidden. */
      await page.send('Emulation.setScriptExecutionDisabled', { value: true });
      await page.send('Page.navigate', { url: BASE + path });
      await page.sleep(700);
      const off = JSON.parse(await page.eval(PROBE));
      await page.send('Emulation.setScriptExecutionDisabled', { value: false });

      if (!off.groups) continue;
      groupsSeen += off.groups;
      checks += 1;
      if (off.hidden.length) {
        failures += 1;
        notes.push(
          `CONTENT HIDDEN WITHOUT JAVASCRIPT — ${path}: ${off.hidden.length} revealed ` +
            `element(s) painted invisible with scripting off. First: ${off.hidden[0]}. ` +
            `The reveal is hiding content it cannot put back (§12.2).`,
        );
      }

      /* 2 — REDUCED MOTION. Visible, and still. */
      await page.send('Emulation.setEmulatedMedia', {
        features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
      });
      await page.send('Page.navigate', { url: BASE + path });
      await page.sleep(900);
      const calm = JSON.parse(await page.eval(PROBE));
      await page.send('Emulation.setEmulatedMedia', { features: [] });

      checks += 1;
      if (calm.hidden.length) {
        failures += 1;
        notes.push(
          `CONTENT HIDDEN UNDER REDUCED MOTION — ${path}: ${calm.hidden.length} revealed ` +
            `element(s) painted invisible. First: ${calm.hidden[0]}. §12.3 requires ` +
            `visible and unanimated, not hidden and waiting.`,
        );
      }

      /* 3 — THE HAPPY PATH. Every group must arrive, so READ THE PAGE the way
         a person does: each group scrolled to in turn, top to bottom.

         The first version of this jumped straight to the last group and then
         asserted all of them, which failed on seven pages — correctly, for the
         wrong reason. A group the scroll skipped over never intersects and so
         never reveals until it is scrolled back to, which is how every reveal
         on the web behaves and is not the bug this check is looking for. What
         it IS looking for is a group that is scrolled to and still does not
         arrive. So the probe has to visit them. */
      await page.send('Page.navigate', { url: BASE + path });
      await page.sleep(900);
      for (let i = 0; i < off.groups; i += 1) {
        await page.eval(
          `(() => { const g = document.querySelectorAll('[data-reveal-group]')[${i}];
             if (g) g.scrollIntoView({ block: 'center', behavior: 'instant' }); return 1; })()`,
        );
        await page.sleep(260);
      }
      await page.sleep(600);
      const live = JSON.parse(await page.eval(PROBE));

      checks += 1;
      if (live.hidden.length) {
        failures += 1;
        notes.push(
          `REVEAL NEVER ARRIVED — ${path}: ${live.hidden.length} element(s) still invisible ` +
            `after their group was scrolled to centre. First: ${live.hidden[0]}. ` +
            `Content hidden by a reveal that does not fire is content that is gone.`,
        );
      } else {
        revealed += 1;
      }
    }

    if (failures === 0) {
      notes.push(
        `${groupsSeen} reveal group(s) across ${checks / 3} page(s) — visible with scripting ` +
          `off, visible under reduced motion, and arriving on scroll (${revealed} page(s) confirmed)`,
      );
    }
  } finally {
    page.close();
  }

  return result('reveal contract', { checks, failures, unit: 'reveal-state checks', notes });
}

if (isMain(import.meta.url)) {
  const r = await reveal();
  console.log(line(r));
  for (const n of r.notes) console.log(`         ${n}`);
  process.exit(passed(r) ? 0 : 1);
}
