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

/**
 * Every revealable element's painted visibility, and whether it was indexed.
 *
 * IT WALKS THE WHOLE SUBTREE, not just direct children, because that is what
 * the stylesheet hides: content primitives at any depth, outermost match only.
 * Checking children alone would have missed every heading and paragraph on the
 * site the moment the reveal went per-element.
 *
 * `unindexed` IS THE DRIFT DETECTOR. The item list is written twice — once in
 * global.css §8 as a selector, once in src/scripts/reveal.ts as a string — and
 * a list that drifts means the stylesheet hides something the module never
 * counts. Such an element gets no `--reveal-index`, so no delay, so it arrives
 * out of sequence; and if the drift goes the other way it is hidden by a rule
 * with nothing to reveal it. This reports anything hidden that the module did
 * not number, which catches both directions without comparing the two lists as
 * text.
 */
const PROBE = `JSON.stringify(function(){
  var ITEMS = 'h1, h2, h3, h4, h5, p, li, figure, blockquote, .media-slot, .media-pending, a, button, details, [data-carousel], [data-rail]';
  var groups = document.querySelectorAll('[data-reveal-group]');
  var out = { groups: groups.length, items: 0, hidden: [], unindexed: [],
              js: document.documentElement.classList.contains('js') };
  for (var g = 0; g < groups.length; g++) {
    var all = groups[g].querySelectorAll(ITEMS);
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      /* Outermost match only, mirroring the stylesheet. */
      if (el.parentElement && el.parentElement.closest(ITEMS)) continue;
      if (el.closest('.reveal-skip')) continue;
      /* A COLLAPSED DISCLOSURE IS NOT A FAILED REVEAL. An FAQ answer inside a
         closed details element sits at zero opacity because that is how the
         disclosure animates open, and the reveal never touched it - the group
         around it is already marked arrived. It reported sixteen phantom
         failures across the two longest product pages.

         Checking for a missing box does NOT catch these, which is worth
         recording: ::details-content leaves the collapsed answer with a client
         rect, so the obvious test passes it straight through. The disclosure's
         own state is the only honest question. */
      if (el.closest('details:not([open])')) continue;
      out.items += 1;
      var cs = getComputedStyle(el);
      var label = 'group ' + g + ' <' + el.tagName.toLowerCase() + '>';
      /* OPACITY IS THE TEST, and transform deliberately is not. The first
         version failed any element whose transform was not 'none', which
         caught category-card photographs sitting at their resting scale(1.02)
         and called them hidden content. What this check guards is whether a
         word can be READ; an element with a transform of its own is not
         hidden, it is placed. */
      if (Number(cs.opacity) < 0.99) {
        out.hidden.push(label + ' opacity=' + cs.opacity);
        if (!el.style.getPropertyValue('--reveal-index')) out.unindexed.push(label);
      }
    }
  }
  /* SPLIT LINES ARE CHECKED SEPARATELY, and have to be. A split element is
     forced visible so its own opacity never multiplies with its lines' — so
     if the lines failed to arrive, the element would still report 1 and the
     sentence would be invisible with nothing flagged. The lines are what the
     reader sees once a heading is split, so the lines are what this asks
     about. */
  var lines = document.querySelectorAll('[data-reveal-group] .reveal-line');
  for (var L = 0; L < lines.length; L++) {
    var ln = lines[L];
    if (ln.closest('details:not([open])')) continue;
    out.items += 1;
    if (Number(getComputedStyle(ln).opacity) < 0.99) {
      out.hidden.push('line "' + ln.textContent.trim().slice(0, 24) + '"');
      if (!ln.style.getPropertyValue('--reveal-index')) {
        out.unindexed.push('line "' + ln.textContent.trim().slice(0, 24) + '"');
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

      /* THE DRIFT SAMPLE IS TAKEN HERE, BEFORE ANYTHING IS SCROLLED TO, and
         the timing is the whole point. Everything below the fold is still
         hidden and has already been indexed by the module, so a stylesheet
         that hides something the module does not know about shows up as a
         hidden element with no number.

         The first version sampled this AFTER the read-through and never fired:
         by then every group had arrived, nothing was hidden, and an empty set
         of hidden elements trivially contains no unindexed ones. Dropping `p`
         from the module's list passed a full run. Caught by injecting that
         exact drift and watching the check stay green — which is the §9 rule
         doing its job on the check rather than on the code. */
      const fresh = JSON.parse(await page.eval(PROBE));
      checks += 1;
      if (fresh.unindexed.length) {
        failures += 1;
        notes.push(
          `REVEAL ITEM LIST HAS DRIFTED — ${path}: ${fresh.unindexed.length} element(s) hidden ` +
            `by the stylesheet carry no --reveal-index. First: ${fresh.unindexed[0]}. ` +
            `global.css §8 and src/scripts/reveal.ts no longer agree on what reveals.`,
        );
      }

      for (let i = 0; i < off.groups; i += 1) {
        await page.eval(
          `(() => { const g = document.querySelectorAll('[data-reveal-group]')[${i}];
             if (g) g.scrollIntoView({ block: 'center', behavior: 'instant' }); return 1; })()`,
        );
        await page.sleep(260);
      }
      /* ASK WHETHER IT ARRIVED, NOT WHETHER IT HAS FINISHED MOVING.
         
         Waiting out the cascade is a race this check kept losing — 600ms
         caught headings at 0.999971, 2200ms caught a pending-media box at
         0.89, and every time the stagger grows the number has to grow with
         it. Waiting LONGER is also not available: past 3s the module's own
         failsafe reveals everything, so a generous sleep would pass a run in
         which the observer never fired at all.
         
         Killing transitions collapses the question to the one that matters.
         An element whose group arrived lands on 1 immediately; one whose group
         did not is still 0. No timing, no window, and the failsafe cannot
         rescue a false pass. */
      await page.sleep(900);
      await page.eval(
        `(() => {
           const kill = document.createElement('style');
           kill.textContent = '*,*::before,*::after{transition:none !important;animation:none !important}';
           document.head.append(kill);
           return 1;
         })()`,
      );
      await page.sleep(100);
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
        `${groupsSeen} reveal group(s) across ${checks / 4} page(s) — visible with scripting ` +
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
