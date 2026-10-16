// Headless-Chrome driver, and the page/width matrix ARCHITECTURE §9 is run
// against. Not run directly — imported by sweep.mjs and axe.mjs.
//
// Raw CDP over a WebSocket rather than Puppeteer: the harness needs one browser
// and six commands, and a 300 MB dependency that downloads its own Chromium is a
// worse trade than 30 lines. Node's built-in WebSocket makes it dependency-free.

import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';

/** Where Chrome lives, in the order worth trying. Override with CHROME=. */
const CANDIDATES = [
  process.env.CHROME,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].filter(Boolean);

export function chromePath() {
  const found = CANDIDATES.find((p) => existsSync(p));
  if (!found) {
    throw new Error(
      'verify: no Chrome found. Install Google Chrome, or set CHROME=/path/to/chrome.\n' +
        `Tried:\n${CANDIDATES.map((p) => `  ${p}`).join('\n')}`,
    );
  }
  return found;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function connect(port, profile) {
  const chrome = spawn(
    chromePath(),
    [
      '--headless=new',
      `--remote-debugging-port=${port}`,
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-gpu',
      '--hide-scrollbars',
      `--user-data-dir=/tmp/${profile}`,
      'about:blank',
    ],
    { stdio: 'ignore' },
  );

  let targets;
  for (let i = 0; i < 60; i++) {
    try {
      targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
      if (targets.length) break;
    } catch {
      /* not up yet */
    }
    await sleep(250);
  }
  if (!targets?.length) {
    chrome.kill();
    throw new Error(`verify: Chrome did not open a debugging port on ${port}`);
  }

  const ws = new WebSocket(targets.find((t) => t.type === 'page').webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));

  let id = 0;
  const pending = new Map();
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) {
      pending.get(m.id)(m);
      pending.delete(m.id);
    }
  };
  const send = (method, params = {}) =>
    new Promise((res) => {
      const i = ++id;
      pending.set(i, res);
      ws.send(JSON.stringify({ id: i, method, params }));
    });

  return {
    send,
    sleep,
    /** Evaluate an expression and return its parsed JSON result. */
    async eval(expression, awaitPromise = false) {
      const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise });
      if (r.result?.exceptionDetails) {
        throw new Error(`verify: page threw — ${r.result.exceptionDetails.text}`);
      }
      return r.result.result.value;
    },
    close: () => {
      ws.close();
      chrome.kill();
    },
  };
}

export const BASE = process.env.BASE ?? 'http://localhost:4321';

/**
 * Every page the build emits with the styleguide route on. PROJECT: extend as
 * real pages land — a page that is not in this list is a page nothing verifies.
 */
export const PAGES = [
  '/',
  '/products',
  /* One of the three category pages — same template, same props shape. */
  '/products/cold-chain-shipping',
  /*
   * THREE OF THE FIVE PRODUCT PAGES, CHOSEN TO COVER ALL EIGHT SECTION TYPES.
   *
   * These went back on the list the moment the gate opened, which is what the
   * note below said would happen. One product page is not enough and five is
   * more than the coverage argument needs: the template is shared and the only
   * thing that varies is WHICH sections a product declares, so the list has to
   * instantiate every member of the union at least once.
   *
   *   puncture-pack   steps, features, specs, split x2, numbered, faq
   *   gel-packs       numbered x2, features, formats
   *   thermal-liners  cards, steps, features, split x2, numbered, faq
   *
   * Between them: all eight. `formats` exists only on gel packs and `cards`
   * only on thermal liners, so dropping either would leave a section type that
   * nothing sweeps and nothing runs axe against.
   *
   * GEL PACKS ALSO COVERS THE HERO'S OTHER STATE. It is the one page drawn
   * without a descriptor and with its contact link hidden, so it is the only
   * page where those two self-skips are exercised at all.
   *
   * eps-foam-coolers and insulated-metallic-mailers are deliberately absent:
   * every section type they declare is already instantiated above, and a fourth
   * and fifth instance of the same union members would cost seven widths each
   * to assert something already asserted.
   */
  '/products/cold-chain-shipping/puncture-pack',
  '/products/cold-chain-shipping/gel-packs',
  '/products/cold-chain-shipping/thermal-liners',
  '/about',
  '/contact',
  '/styleguide',
];

/*
 * THE TWO PRODUCT PAGES CAME OFF THIS LIST, AND WHY IS THE POINT.
 *
 * SUPERSEDED, AND KEPT BECAUSE THE REASONING IS STILL THE RULE. The gate is now
 * open for the five products that have v1 content, so three of them are on the
 * list above and the paragraph below describes a state this repo has left. What
 * it says about WHY a page leaves the list — the list follows what the build
 * emits, never what we wish it emitted — is exactly as binding as it was.
 * The eight products with no v1 content are the case it now describes.
 *
 * `/products/cold-chain-shipping/insulated-metallic-mailers` and
 * `/products/cold-chain-shipping/gel-packs` were swept here as the two ends of
 * the optional-field range — the one product the design writes in full against
 * one with every optional block self-skipping.
 *
 * They are gone because the pages are gone: product detail routes are outside
 * the launch scope (`LAUNCH.productPages`, src/consts.ts) and NO BUILD EMITS
 * THEM. Sweeping them would 404 through the preview server and report structure
 * assertions about an error page — which is the port-4321 incident in §9 wearing
 * different clothes: real numbers, measured against the wrong artifact.
 *
 * THIS IS NOT THE PAGE LIST BEING NARROWED TO REACH GREEN. Nothing about those
 * two pages was failing. The list follows what the build emits, and it has to,
 * or a §9 pass stops describing the site. What replaces the coverage is
 * `internalLinksResolve()` in contracts.mjs, which asserts against the
 * PRODUCTION build that no page links to a route the build did not emit — the
 * generalised form of the bug that gating these pages would otherwise have
 * introduced 39 times per page.
 *
 * WHAT IS GENUINELY UNCOVERED WHILE THE GATE IS SHUT: the product page template
 * itself. Its optional-field skips are exercised by nothing until the gate opens,
 * at which point both paths go back on this list. Recorded as an open question in
 * WORKLOG.md rather than left to be rediscovered. The CARD is still covered — the
 * styleguide renders ProductCard, and the index and category pages render it at
 * five and three columns.
 */

/** §9's widths. Not negotiable, and not a sample. */
export const WIDTHS = [320, 360, 390, 430, 768, 1024, 1440];
