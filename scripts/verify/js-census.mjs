// §6/§9's JavaScript census. Zero JS in dist/ is the default state, MEASURED,
// not assumed — and every byte that is there has to be named.
//
// "Named" is enforced, not documented: each expected module below carries a
// signature that must match the code found, a reason it exists, and a gzipped
// budget. A script nothing matches fails the run, and so does one that outgrew
// its budget. That is what stops a 543-byte module becoming a 40 KB one over six
// commits without anyone noticing.

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { gzipSync } from 'node:zlib';
import { result, line, passed, bytes } from './lib/report.mjs';
import { isMain } from './lib/main.mjs';

const DIST = process.env.DIST ?? 'dist';

/**
 * PROJECT: every module a project adds is declared here, with a reason, before
 * it ships. That is the point of friction — §6 says every script is a ruling,
 * not a habit, and this is where the ruling gets written down.
 */
const EXPECTED = [
  {
    id: 'nav disclosure',
    signature: /data-disclosure/,
    why: 'ARCHITECTURE §4.3 — TWO behaviours, bundled into one script because both belong to the nav and ship on every page. (1) Dropdown panels must be a keyboard-operable disclosure, which CSS alone cannot do: Escape has to return focus. (2) An open disclosure must not survive the breakpoint that made it reachable — the desktop trigger keeps aria-expanded="true" and the mobile <details> keeps `open` when the other takes over, so a hidden control lies to a screen reader until the window is resized back. Declared as one entry because one script is what dist actually contains, and a census that reports modules the bundler merged is a census describing source rather than output.',
    maxGzip: 700,
  },
  {
    id: 'contact form submit',
    signature: /data-contact-form/,
    why:
      'ARCHITECTURE §8 — THREE jobs, and the third is why this budget moved from 500 to 750 B. ' +
      '(1) The form ships disabled so an unverified endpoint cannot silently swallow an enquiry. ' +
      '(2) started_at is stamped in the browser, because a build-time value would be baked into cached HTML and every visitor would submit the same stale timestamp. ' +
      '(3) The submission is intercepted and the answer rendered on the page. That third job was missing and the form was broken without it: functions/api/contact.ts replies with JSON, and a native POST to a JSON response NAVIGATES — a visitor who filled the form correctly left the site and read {"ok":true} in a blank tab. ' +
      'Intercepting costs no capability the page had, because the form ships disabled and only this module enables it, so there has never been a no-JavaScript path that could submit. What it buys is the error text: the endpoint distinguishes a failed challenge from a bad address from a dead provider, and without a fetch every one of those is the same blank tab. ' +
      'It also resets the Turnstile widget after a failure, because the token is single-use and a second attempt with a spent one fails for a reason the visitor cannot see. ' +
      'Measured at 620 B gzipped against the 750 B budget.',
    maxGzip: 750,
  },
  {
    id: 'select enter-to-open',
    signature: /showPicker/,
    why: 'ARCHITECTURE §6/§4.1 — a focused <select> opens on Space and the arrows but NOT on Enter, on any platform. Measured here: Enter on a select inside a form does nothing at all. One delegated listener restores the key people expect, on a native control, instead of rebuilding the select as a div with role="combobox".',
    maxGzip: 400,
  },
  {
    id: 'rail pagination',
    signature: /rail-progress/,
    why: 'ARCHITECTURE open ruling 1, ruled for this project — the product grids become a native scroll-snap rail below lg, and the browser gives every part of that free EXCEPT a pagination indicator. This computes the visible fraction and the scroll fraction and writes two custom properties; the shape and the colours are CSS. Swiper was measured and rejected: ~15 KB gzipped for its pagination build against 2 KB for this whole site, to replace a scroller the platform already ships correctly.',
    maxGzip: 500,
  },
  {
    /**
     * A BUNDLER ARTEFACT, NAMED RATHER THAN EXEMPTED. When a module is imported
     * by more than one page, Rollup hoists it into a shared chunk and leaves
     * each page with a stub that does nothing but import it — 27 bytes of
     * `import"./rail.<hash>.js";`. The real module is counted once, under its
     * own name; these are the pointers to it.
     *
     * It is declared here rather than skipped because §6's rule is that every
     * byte is named, and "the bundler made it" is a reason, not an exemption. The
     * budget is tight on purpose: if one of these ever grows past a bare import,
     * something has started shipping through a door nobody is watching.
     */
    id: 'shared-chunk pointer',
    signature: /^\s*import"\.\/[\w.$-]+\.js";?\s*$/,
    why: 'Rollup hoists a module imported by several pages into one shared chunk — counted once under its own name — and leaves each page a bare import of it. The pointer, not the module.',
    maxGzip: 120,
  },
  {
    id: 'clip playback',
    signature: /data-clip/,
    why: 'ARCHITECTURE §7 — attaches the MP4 only near the viewport, and honours prefers-reduced-motion. Not on any page in this repo; ships when a project adds media.',
    maxGzip: 900,
  },
];

/** Script types that are data, not code, and do not count against the budget. */
const DATA_TYPES = ['application/ld+json'];

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

export function jsCensus() {
  let files;
  try {
    files = walk(DIST);
  } catch {
    throw new Error(`verify: no ${DIST}/ — run \`npm run build:styleguide\` first.`);
  }

  const found = [];

  // 1. Standalone .js files.
  for (const f of files.filter((f) => f.endsWith('.js'))) {
    const code = readFileSync(f, 'utf8');
    found.push({ where: relative(DIST, f), kind: 'file', code });
  }

  // 2. Inline modules in HTML. Astro inlines small scripts rather than emitting
  //    a file, so counting only .js files would report zero while shipping code.
  for (const f of files.filter((f) => f.endsWith('.html'))) {
    const html = readFileSync(f, 'utf8');
    for (const m of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)) {
      const attrs = m[1];
      const type = /type="([^"]*)"/.exec(attrs)?.[1] ?? '';
      if (DATA_TYPES.includes(type)) continue;
      const src = /src="([^"]*)"/.exec(attrs)?.[1];
      if (src) {
        found.push({ where: `${relative(DIST, f)} → ${src}`, kind: 'ref', code: '' });
        continue;
      }
      if (m[2].trim() === '') continue;
      found.push({ where: relative(DIST, f), kind: 'inline', code: m[2] });
    }
  }

  let failures = 0;
  const notes = [];
  let totalGzip = 0;

  for (const s of found) {
    const raw = Buffer.byteLength(s.code);
    const gzip = raw ? gzipSync(s.code, { level: 9 }).length : 0;
    totalGzip += gzip;

    if (s.kind === 'ref') {
      /* A <script src> pointing at a file already counted above is fine; one
         pointing off-site is a dependency nobody declared. */
      if (/^https?:/.test(s.where.split('→ ')[1] ?? '')) {
        failures++;
        notes.push(`UNDECLARED external script: ${s.where}`);
      }
      continue;
    }

    const match = EXPECTED.find((e) => e.signature.test(s.code));
    if (!match) {
      failures++;
      notes.push(`UNNAMED script in ${s.where} — ${bytes(raw)} raw, ${bytes(gzip)} gzipped`);
      notes.push(`    ${s.code.trim().slice(0, 120).replace(/\s+/g, ' ')}…`);
      notes.push('    Every byte of JavaScript is a ruling (§6). Declare it in EXPECTED with a reason, or delete it.');
      continue;
    }
    if (gzip > match.maxGzip) {
      failures++;
      notes.push(`OVER BUDGET: ${match.id} in ${s.where} — ${bytes(gzip)} gzipped, budget ${bytes(match.maxGzip)}`);
      continue;
    }
    notes.push(`${match.id} — ${s.where} (${s.kind}) — ${bytes(raw)} raw, ${bytes(gzip)} gzipped / ${bytes(match.maxGzip)} budget`);
    notes.push(`    ${match.why}`);
  }

  const unused = EXPECTED.filter((e) => !found.some((s) => e.signature.test(s.code)));
  for (const e of unused) notes.push(`${e.id} — declared, on no page in this build. ${e.why}`);

  notes.push(`total shipped JavaScript: ${bytes(totalGzip)} gzipped across ${found.filter((s) => s.kind !== 'ref').length} script(s)`);

  /* The census always runs at least one check — "did we walk dist" — so that a
     genuinely zero-JS build reports a pass rather than an EMPTY. */
  return result('JS census', {
    checks: found.length + 1,
    failures,
    unit: 'scripts found in dist (+1 walk)',
    notes,
  });
}

if (isMain(import.meta.url)) {
  const r = jsCensus();
  console.log(line(r));
  for (const n of r.notes) console.log(`         ${n}`);
  process.exit(passed(r) ? 0 : 1);
}
