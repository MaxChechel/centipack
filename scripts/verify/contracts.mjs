// Contract assertions against the BUILT OUTPUT (§9).
//
// This file exists for rules the compiler cannot enforce. The system's recurring
// move is convention → compile error where possible, convention → assertion where
// not; "documented" is the weakest of the three and is never the resting place.
// Everything here was a paragraph in ARCHITECTURE.md that something had already
// violated while the paragraph sat there being correct.
//
// Each contract states the rule, what would break it, and how it is checked, so a
// failure here reads as a design violation rather than as a broken test.

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { result, line, passed } from './lib/report.mjs';
import { isMain } from './lib/main.mjs';

const DIST = process.env.DIST ?? 'dist';

const read = (file) => {
  const path = join(DIST, file);
  if (!existsSync(path)) throw new Error(`verify: ${path} is missing — run \`npm run build:styleguide\` first.`);
  return readFileSync(path, 'utf8');
};

/**
 * §8 — A FORM WITH NO CONFIGURED ENDPOINT SHIPS DISABLED.
 *
 * Paid for. `src/scripts/contact.ts` lifted `disabled` unconditionally, so an
 * unconfigured build rendered "this form is not live yet" directly above a
 * working-looking submit button: the two halves of the page disagreeing, with the
 * misleading half being the interactive one. A screenshot found it; nothing
 * asserted it. This is that assertion.
 *
 * The check is on the BUILT HTML, not on the source, because the rule is about
 * what a visitor receives. `data-contact-ready` present means a Turnstile site key
 * exists, so the module is allowed to enable the form; absent means every control
 * must carry `disabled` and the module must refuse.
 *
 * EVERY CONTROL TYPE, and the breakdown is reported rather than summed, so the
 * next person can see at a glance that the checkbox and the radios are actually
 * in the population. A contract that says "8 controls" hides a control type
 * dropping out of the form entirely.
 */
/**
 * Is this tag carrying the `disabled` ATTRIBUTE?
 *
 * Not `/\bdisabled\b/` on the raw tag — and that naive version is why this
 * function exists. Every button in this system carries Tailwind's
 * `disabled:pointer-events-none disabled:opacity-40` in its class list, and
 * `disabled` followed by `:` is a word boundary, so the naive test returned true
 * for every button whether or not it was disabled. The contract passed its own
 * fault injection for the wrong reason, which is the exact failure the
 * demonstrate-your-failure-mode rule (§9) exists to surface.
 *
 * Blanking quoted attribute VALUES first leaves only attribute names to match.
 */
const hasDisabledAttribute = (tag) => {
  const namesOnly = tag.replace(/=\s*"[^"]*"/g, '=""').replace(/=\s*'[^']*'/g, "=''");
  return /\sdisabled(\s|=|\/?>)/.test(namesOnly);
};

/**
 * §8, RESTATED. This asserted that every control shipped `disabled` until a
 * Turnstile key existed, because a form posting into an unverified endpoint
 * swallows a real enquiry SILENTLY.
 *
 * Submission is no longer a native POST (WORKLOG entry 15): it is an intercepted
 * fetch that renders whatever the endpoint answers, and the endpoint answers
 * precisely — 503 without a Turnstile secret, 400 for a missing token, 502 with
 * no delivery provider. A submission on an unconfigured build therefore fails IN
 * FRONT OF THE VISITOR rather than vanishing, and disabling the controls is no
 * longer what prevents the loss.
 *
 * WHAT PREVENTS IT NOW IS THE LIVE REGION, so that is what this asserts.
 *
 * Note that simply letting the old check pass would have been worse than
 * deleting it: it short-circuited on `data-contact-ready` with "enable path
 * allowed", so a form that is always ready would have sailed through asserting
 * NOTHING while still printing a reassuring green line.
 *
 * Three things, all load-bearing:
 *   1. a submit control exists at all;
 *   2. a status element exists inside the form carrying an ARIA live role —
 *      without it every failure is silent again;
 *   3. the honeypot is present and NOT disabled, because a bot has to be able to
 *      fill it. That is the one control whose enabled state is the mechanism.
 */
function formReportsFailure() {
  const notes = [];
  let checks = 0;
  let failures = 0;

  const pages = readdirSync(DIST).filter((f) => f.endsWith('.html'));
  for (const file of pages) {
    const html = read(file);
    const forms = [...html.matchAll(/<form\b[^>]*>[\s\S]*?<\/form>/g)].map((m) => m[0]);
    for (const form of forms) {
      if (!/data-contact-form/.test(form)) continue;
      checks++;

      const submits = [...form.matchAll(/<(button|input)\b[^>]*type=["']submit["'][^>]*>/g)].map((m) => m[0]);
      const status = /<[a-z]+\b[^>]*data-contact-status[^>]*>/.exec(form)?.[0] ?? '';
      const live = /role=["']status["']/.test(status) || /aria-live=/.test(status);
      /* `_honeypot`, renamed from `company_website` when the form moved to
         Formspark (AUDIT D7): that is the name the endpoint actually enforces.
         The assertion is unchanged — a honeypot exists and is not disabled —
         and follows the field rather than relaxing. */
      const honeypot = /<input\b[^>]*name=["']_honeypot["'][^>]*>/.exec(form)?.[0] ?? '';

      const problems = [];
      if (submits.length === 0) problems.push('no submit control — nothing can be sent');
      if (!status) {
        problems.push(
          'NO [data-contact-status] ELEMENT. The submit is intercepted, so the endpoint answer ' +
            'has nowhere to go and every failure is silent — the exact loss §8 exists to prevent.',
        );
      } else if (!live) {
        problems.push(
          'the status element carries no role="status" and no aria-live, so the answer is drawn but never announced',
        );
      }
      if (!honeypot) problems.push('honeypot field is missing');
      else if (hasDisabledAttribute(honeypot)) {
        problems.push('honeypot is DISABLED — a bot cannot fill it, which removes the trap entirely');
      }

      if (problems.length) {
        failures += problems.length;
        for (const problem of problems) notes.push(`${file}: ${problem}`);
      } else {
        const controls = [...form.matchAll(/<(input|textarea|select|button)\b[^>]*>/g)]
          .filter((m) => !/_honeypot/.test(m[0]))
          .filter((m) => !/type=["']hidden["']/.test(m[0]));
        notes.push(
          `${file}: ${controls.length} live control(s), submit present, failures reported into a live region`,
        );
      }
    }
  }

  if (checks === 0) notes.push('no [data-contact-form] in this build — nothing to assert');
  return { checks, failures, notes };
}

/** Every file under `dir`, recursively, as paths relative to it. */
function walkRelative(dir, base = dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walkRelative(full, base, out);
    else out.push(full.slice(base.length + 1));
  }
  return out;
}

const PRODUCTION_OUT = '.verify/production';

/**
 * THE PRODUCTION BUILD, BUILT ONCE AND SHARED.
 *
 * Two contracts now read it — the styleguide gate and the link check — and it is
 * a full Astro build, so memoising it is the difference between one and two of
 * them per `npm run verify`. Memoised on the RESULT, failure included, so a
 * broken build is reported by both rather than being retried and reported once.
 */
let productionBuildResult = null;
function productionBuild() {
  if (productionBuildResult) return productionBuildResult;
  const build = spawnSync('npx', ['astro', 'build', '--outDir', PRODUCTION_OUT], {
    encoding: 'utf8',
    env: { ...process.env, INCLUDE_STYLEGUIDE: '' },
  });
  productionBuildResult = {
    ok: build.status === 0,
    out: PRODUCTION_OUT,
    log: (build.stderr || build.stdout || '').slice(-800),
  };
  return productionBuildResult;
}

function productionOmitsStyleguide() {
  const notes = [];
  const build = productionBuild();
  if (!build.ok) return { checks: 1, failures: 1, notes: ['production build failed', build.log] };

  /* RECURSIVE, not `readdirSync` on the top level. The site has nested routes
     now (`/products/:category`), and a top-level-only scan is a leak detector
     that cannot see into the directory a leak would most plausibly land in. */
  const files = walkRelative(build.out);
  const leaked = files.filter((f) => /styleguide/i.test(f));
  if (leaked.length) {
    return {
      checks: 1,
      failures: 1,
      notes: [`PRODUCTION BUILD EMITTED THE STYLEGUIDE: ${leaked.join(', ')} (§2.4/§10)`],
    };
  }
  const pages = files.filter((f) => f.endsWith('.html'));
  notes.push(`production build emits ${pages.length} page(s), none of them the styleguide`);
  notes.push(`pages: ${pages.sort().join(', ')}`);
  return { checks: 1, failures: 0, notes };
}

/**
 * §8/§9 — EVERY INTERNAL LINK RESOLVES TO A PAGE THIS BUILD EMITS.
 *
 * §9 already demands "zero broken refs" for images. This is the same sentence
 * about `href`, and it was the one link in the chain nothing checked.
 *
 * PAID FOR IMMEDIATELY. Taking product detail pages out of the launch scope
 * left thirteen product names in three lists — the nav panel, the mobile nav
 * fold, the footer — which is THIRTY-NINE dead links on every page of the site.
 * Every one of them would have built clean, typed clean, swept clean and passed
 * axe: a 404 is not a rendering defect, and nothing in a static build objects to
 * an anchor pointing at a URL that was never written. The only artifact that can
 * answer the question is the finished build, compared against itself.
 *
 * AGAINST THE PRODUCTION BUILD, NOT `dist`. `dist` is built with the styleguide
 * route on, so it contains a page production does not and would answer for links
 * that only resolve in a build nobody visits. The question is whether the site
 * THAT SHIPS is internally whole.
 *
 * WHAT IS OUT OF SCOPE, and each is a real limit rather than a convenience:
 *   - external URLs (`https:`, `mailto:`, `tel:`, protocol-relative) — reaching
 *     the network from a verification run makes the suite fail on someone else's
 *     outage;
 *   - pure `#fragment` links, which never leave the page;
 *   - the fragment and query on an internal link, stripped before resolving —
 *     `/contact?utm=x#form` is a link to `/contact`.
 *
 * `build.format: 'file'` means `/about` is `about.html`, so that is the primary
 * resolution. A directory-style `about/index.html` and a literal file
 * (`/robots.txt`) both count as resolved too — the rule is "something answers
 * this URL", not "it took the shape I expected".
 */
function internalLinksResolve() {
  const notes = [];
  const build = productionBuild();
  if (!build.ok) return { checks: 1, failures: 1, notes: ['production build failed', build.log] };

  const files = walkRelative(build.out);
  const emitted = new Set(files.map((f) => f.split('/').join('/')));
  const pages = files.filter((f) => f.endsWith('.html'));

  /** Does anything in this build answer `path`? */
  const resolves = (path) => {
    const clean = path.replace(/^\//, '');
    if (clean === '') return emitted.has('index.html');
    return emitted.has(`${clean}.html`) || emitted.has(`${clean}/index.html`) || emitted.has(clean);
  };

  let checks = 0;
  let failures = 0;
  /* Grouped by target: thirty-nine instances of one missing page is one broken
     page, and a report that lists it thirty-nine times buries the other two. */
  const dead = new Map();

  for (const file of pages) {
    const html = readFileSync(join(build.out, file), 'utf8');
    for (const match of html.matchAll(/\shref=["']([^"']*)["']/g)) {
      const raw = match[1].trim();
      if (raw === '' || raw.startsWith('#')) continue;
      if (/^[a-z][a-z0-9+.-]*:/i.test(raw) || raw.startsWith('//')) continue;
      if (!raw.startsWith('/')) continue;

      const path = raw.split('#')[0].split('?')[0];
      if (path === '') continue;
      checks++;
      if (resolves(path)) continue;
      failures++;
      if (!dead.has(path)) dead.set(path, new Set());
      dead.get(path).add(file);
    }
  }

  if (dead.size) {
    notes.push(`${dead.size} internal link target(s) MISSING from the production build:`);
    for (const [path, onPages] of [...dead].sort()) {
      const list = [...onPages].sort();
      const shown = list.slice(0, 4).join(', ');
      notes.push(
        `    ${path} — 404. Linked from ${list.length} page(s): ${shown}${list.length > 4 ? ', …' : ''}`,
      );
    }
  } else {
    notes.push(`${checks} internal link(s) across ${pages.length} page(s), all resolving`);
  }

  return { checks, failures, notes };
}

/**
 * §4.2 — `as` IS RESERVED FOR SECTION, AS A NAME.
 *
 * A leaf component whose `Props` declares a key called `as` can have its entire
 * `Props` type silently discarded — every prop on it stops being checked, with no
 * error anywhere. `VisuallyHidden` shipped that way: `<VisuallyHidden as={42}
 * nonsense="x">` raised nothing at all.
 *
 * The trigger is narrow (see §4.2 for the exact mechanism) and depends on an
 * unrelated detail of the file, which is precisely why the rule is about the NAME
 * rather than about the circumstances: a rule you have to re-derive per file is a
 * rule that gets it wrong once.
 *
 * A static check rather than a type probe, because the failure is the ABSENCE of
 * type errors — there is nothing for `astro check` to report. Reading the source
 * for the name is the only reliable detector.
 */
function asPropReservedForSection() {
  const notes = [];
  let checks = 0;
  let failures = 0;

  const components = [];
  const walkSrc = (dir) => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) walkSrc(full);
      else if (full.endsWith('.astro')) components.push(full);
    }
  };
  walkSrc('src/components');

  for (const file of components) {
    const source = readFileSync(file, 'utf8');
    const frontmatter = /^---\n([\s\S]*?)\n---/.exec(source)?.[1];
    if (!frontmatter) continue;
    checks++;
    if (!/^\s*as\??\s*:/m.test(frontmatter)) continue;
    if (file.endsWith('Section.astro')) {
      notes.push(`${file}: declares \`as\` — the one sanctioned use (§4.2), typing re-verified`);
      continue;
    }
    failures++;
    notes.push(
      `${file}: declares an \`as\` prop. §4.2 reserves that NAME for Section — on a leaf ` +
        'component it can discard the entire Props type, silently. Rename it (headingLevel, ' +
        'element, variant …).',
    );
  }

  notes.push(`${checks} component(s) scanned for a reserved \`as\` prop`);
  return { checks, failures, notes };
}

/**
 * `slot` IS RESERVED BY ASTRO ON EVERY COMPONENT, and a component that declares
 * it as a prop is a component that silently disappears.
 *
 * `slot` is how Astro assigns a child to a named slot of its parent. So a
 * component whose Props include `slot` works fine wherever it sits inside plain
 * markup — and the moment it is a DIRECT CHILD of another component, the
 * attribute is read as a slot assignment instead of a prop. If the parent has no
 * slot by that name, the element is dropped from the output. No error, no
 * warning, nothing in `astro check`, nothing in the console.
 *
 * Paid for: `Media` took a `label` prop called `slot`, which worked on every page
 * where it sat inside a <div> and vanished on the one page where it was a direct
 * child of <Section>. The category pages shipped with no hero image and the build
 * was green.
 *
 * Same shape of rule as the `as` check above, for the same reason — the failure
 * is the ABSENCE of an error, so reading the source for the name is the only
 * reliable detector.
 */
function slotIsReserved() {
  const notes = [];
  let checks = 0;
  let failures = 0;

  const components = [];
  const walkSrc = (dir) => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) walkSrc(full);
      else if (full.endsWith('.astro')) components.push(full);
    }
  };
  walkSrc('src/components');

  for (const file of components) {
    const source = readFileSync(file, 'utf8');
    const frontmatter = /^---\n([\s\S]*?)\n---/.exec(source)?.[1];
    if (!frontmatter) continue;
    checks++;
    /* Only an interface member, not a mention in prose — the docs above these
       components explain the trap and must not trip the check that enforces it. */
    if (!/^\s*slot\??\s*:\s*(string|number|boolean)/m.test(frontmatter)) continue;
    failures++;
    notes.push(
      `${file}: declares a \`slot\` prop. Astro reserves that attribute for slot ` +
        'assignment, so this component is DROPPED whenever it is a direct child of ' +
        'another component. Rename it (label, name, caption …).',
    );
  }

  notes.push(`${checks} component(s) scanned for a reserved \`slot\` prop`);
  return { checks, failures, notes };
}

/**
 * Absolute URLs that appear in built HTML and are NOT network requests.
 *
 * Every entry needs a reason. The rule this list serves is narrow: the CSP
 * governs what the browser FETCHES, so a URL the browser never fetches must not
 * be held against it.
 */
const NOT_A_FETCH = [
  {
    match: /^http:\/\/www\.w3\.org$/,
    why: 'XML namespace on <svg> and <html>. An identifier, never dereferenced — no browser has ever requested it.',
  },
  {
    match: /^https:\/\/schema\.org$/,
    why: 'JSON-LD `@context`. Names a vocabulary; consumers ship it, they do not fetch it. Not a subresource.',
  },
];

/**
 * §8 — THE CSP PERMITS WHAT THE SITE ACTUALLY DOES, AND NOTHING ELSE.
 *
 * PAID FOR, AT THE WORST MOMENT: on a real person trying to send a real
 * enquiry. The contact form moved to Formspark (AUDIT D7) and `public/_headers`
 * was not followed through, so `connect-src` still named Turnstile's domain and
 * not the endpoint the form now posts to. Every submission was refused by the
 * browser before it left the page. The form reported "Could not reach the
 * server" — correctly; it genuinely could not — and the cause was visible only
 * in the console.
 *
 * NOTHING IN THE HARNESS COULD HAVE OBJECTED. The build was valid, the markup
 * was right, `internalLinksResolve()` only inspects internal links, and a CSP is
 * a response header that no page-rendered check reads. This is §9's "a rule that
 * only convention enforces is a rule that will be broken", demonstrated.
 *
 * TWO DIRECTIONS, because the two failures are different and both are real:
 *
 *   1. AN ORIGIN THE SITE REACHES IS MISSING FROM THE CSP → the browser blocks
 *      it. This is the failure above, and it is the expensive one: it breaks a
 *      working feature in production only, because a CSP is not applied by
 *      `astro dev` or `astro preview`. Nobody sees it until a deploy.
 *
 *   2. AN ORIGIN IN THE CSP APPEARS NOWHERE IN THE BUILD → permission granted to
 *      nothing. Not exploitable on its own, and it is how an allowlist decays
 *      into a list of things somebody once used: Turnstile sat in three
 *      directives of this CSP after the code that used it was deleted. A stale
 *      allowance is the next person's evidence that an origin is needed.
 *
 *   3. THE RIGHT ORIGIN IN THE WRONG DIRECTIVE. Directives 1 and 2 read the CSP
 *      as a flat set of origins, which is enough to catch an origin that is
 *      missing altogether — and NOT enough for the bug that prompted this check.
 *      Discovered by fault injection: removing `submit-form.com` from
 *      `connect-src` while leaving it in `form-action` reproduced the exact
 *      production failure and the flat check passed it, because the origin was
 *      still "somewhere in the CSP".
 *
 *      So the form's endpoint is checked PER DIRECTIVE, and against both of the
 *      two that govern it:
 *        - `connect-src`, because the submit is intercepted and sent by fetch;
 *        - `form-action`, because the <form> carries a real action and a browser
 *          that never ran the module will POST to it natively.
 *      Either one missing breaks a real path, and the two paths fail
 *      differently: without `connect-src` the fetch is refused and the page says
 *      so; without `form-action` the native POST is blocked and nothing visible
 *      happens at all.
 */
function cspMatchesTheSite() {
  const notes = [];
  const build = productionBuild();
  if (!build.ok) return { checks: 1, failures: 1, notes: ['production build failed', build.log] };

  const headersPath = join(build.out, '_headers');
  if (!existsSync(headersPath)) {
    return {
      checks: 1,
      failures: 1,
      notes: ['no _headers in the production build — the CSP ships from there, so there is no policy at all'],
    };
  }

  const csp = /Content-Security-Policy:([^\n]*)/.exec(readFileSync(headersPath, 'utf8'))?.[1] ?? '';
  if (!csp.trim()) {
    return { checks: 1, failures: 1, notes: ['_headers carries no Content-Security-Policy line'] };
  }

  /* Origins named in the policy, as opposed to keywords and schemes. */
  const cspOrigins = new Set(
    [...csp.matchAll(/https?:\/\/[a-zA-Z0-9.*-]+/g)].map((m) => m[0]),
  );

  const files = walkRelative(build.out).filter((f) => f.endsWith('.html'));

  /* The site's own origin is `'self'`, and it is READ OUT OF THE BUILD rather
     than imported from src/consts.ts — partly because this is a .mjs script and
     that is a .ts module, and mostly because the canonical tag is the artifact's
     own statement of where it lives. If those two ever disagree, the build is
     what ships. */
  const indexHtml = existsSync(join(build.out, 'index.html'))
    ? readFileSync(join(build.out, 'index.html'), 'utf8')
    : '';
  const canonical = /<link[^>]+rel=["']canonical["'][^>]+href=["'](https?:\/\/[^/"']+)/.exec(indexHtml)?.[1];
  if (!canonical) {
    return {
      checks: 1,
      failures: 1,
      notes: ['could not read the canonical origin from the built index.html — cannot tell self from third party'],
    };
  }
  const siteOrigin = canonical;

  /** Origins the built pages actually reference, excluding self and non-fetches. */
  const used = new Map();
  for (const file of files) {
    const html = readFileSync(join(build.out, file), 'utf8');
    for (const m of html.matchAll(/https?:\/\/[a-zA-Z0-9.-]+/g)) {
      const origin = m[0];
      if (origin === siteOrigin) continue;
      if (NOT_A_FETCH.some((e) => e.match.test(origin))) continue;
      if (!used.has(origin)) used.set(origin, new Set());
      used.get(origin).add(file);
    }
  }

  let checks = 0;
  let failures = 0;

  for (const [origin, onPages] of [...used].sort()) {
    checks++;
    if (cspOrigins.has(origin)) continue;
    failures++;
    const list = [...onPages].sort();
    notes.push(
      `NOT IN THE CSP: ${origin} — referenced by ${list.length} page(s): ${list.slice(0, 4).join(', ')}` +
        `${list.length > 4 ? ', …' : ''}. The browser will refuse it in production.`,
    );
  }

  for (const origin of [...cspOrigins].sort()) {
    checks++;
    /* A wildcard host cannot be matched against a literal, and is a deliberate
       breadth decision rather than a specific permission. */
    if (origin.includes('*')) continue;
    if ([...used.keys()].some((u) => u === origin)) continue;
    failures++;
    notes.push(
      `STALE CSP ALLOWANCE: ${origin} is permitted but appears on no page in this build — ` +
        'permission granted to nothing. Remove it, or say here why it is needed.',
    );
  }

  /* --- 3. The form endpoint, per directive. See the note above for why the two
     checks above are not sufficient on their own. */
  const sourceList = (name) => {
    const m = new RegExp(`(?:^|;)\\s*${name}\\s+([^;]*)`).exec(csp);
    return m ? m[1].trim().split(/\s+/) : null;
  };

  const formOrigins = new Set();
  for (const file of files) {
    const html = readFileSync(join(build.out, file), 'utf8');
    for (const m of html.matchAll(/<form\b[^>]*\saction=["'](https?:\/\/[^/"']+)/g)) {
      formOrigins.add(m[1]);
    }
  }

  for (const origin of [...formOrigins].sort()) {
    for (const name of ['connect-src', 'form-action']) {
      checks++;
      const list = sourceList(name);
      if (list === null) {
        failures++;
        notes.push(
          `${name} IS NOT DECLARED, so the form endpoint ${origin} falls back to default-src — ` +
            `state it explicitly rather than inheriting it.`,
        );
        continue;
      }
      if (list.includes(origin)) continue;
      failures++;
      notes.push(
        `${origin} IS THE FORM ENDPOINT BUT IS NOT IN ${name} (found: ${list.join(' ')}). ` +
          (name === 'connect-src'
            ? 'The intercepted submit is a fetch; the browser will refuse it and the enquiry never leaves the page.'
            : 'A browser that did not run the module POSTs natively; that POST is blocked and NOTHING VISIBLE HAPPENS.'),
      );
    }
  }

  if (failures === 0) {
    notes.push(
      `${used.size} external origin(s) used, all permitted; ` +
        `${[...cspOrigins].filter((o) => !o.includes('*')).length} origin(s) permitted, all used`,
    );
    for (const [origin] of [...used].sort()) notes.push(`    ${origin}`);
    for (const origin of [...formOrigins].sort()) {
      notes.push(`    ${origin} — form endpoint, present in connect-src and form-action`);
    }
  }

  return { checks, failures, notes };
}

const CONTRACTS = [
  ['form reports failure (§8)', formReportsFailure],
  ['`as` reserved for Section (§4.2)', asPropReservedForSection],
  ['`slot` reserved by Astro', slotIsReserved],
  ['production omits styleguide (§2.4)', productionOmitsStyleguide],
  ['internal links resolve (§8/§9)', internalLinksResolve],
  ['CSP matches the site (§8)', cspMatchesTheSite],
];

export function contracts() {
  let checks = 0;
  let failures = 0;
  const notes = [];

  for (const [label, fn] of CONTRACTS) {
    const r = fn();
    checks += r.checks;
    failures += r.failures;
    notes.push(`${label}: ${r.checks} assertion(s), ${r.failures} failure(s)`);
    for (const n of r.notes) notes.push(`    ${n}`);
  }

  return result('build contracts', {
    checks,
    failures,
    unit: 'contract assertions',
    notes,
  });
}

if (isMain(import.meta.url)) {
  const r = contracts();
  console.log(line(r));
  for (const n of r.notes) console.log(`         ${n}`);
  process.exit(passed(r) ? 0 : 1);
}
