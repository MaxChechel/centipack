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
      const honeypot = /<input\b[^>]*company_website[^>]*>/.exec(form)?.[0] ?? '';

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
          .filter((m) => !/company_website/.test(m[0]))
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

function productionOmitsStyleguide() {
  const notes = [];
  const out = '.verify/production';
  const build = spawnSync('npx', ['astro', 'build', '--outDir', out], {
    encoding: 'utf8',
    env: { ...process.env, INCLUDE_STYLEGUIDE: '' },
  });
  if (build.status !== 0) {
    return { checks: 1, failures: 1, notes: ['production build failed', (build.stderr || build.stdout).slice(-800)] };
  }

  const leaked = readdirSync(out).filter((f) => /styleguide/i.test(f));
  if (leaked.length) {
    return {
      checks: 1,
      failures: 1,
      notes: [`PRODUCTION BUILD EMITTED THE STYLEGUIDE: ${leaked.join(', ')} (§2.4/§10)`],
    };
  }
  notes.push(`production build emits ${readdirSync(out).filter((f) => f.endsWith('.html')).length} page(s), none of them the styleguide`);
  return { checks: 1, failures: 0, notes };
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

const CONTRACTS = [
  ['form reports failure (§8)', formReportsFailure],
  ['`as` reserved for Section (§4.2)', asPropReservedForSection],
  ['`slot` reserved by Astro', slotIsReserved],
  ['production omits styleguide (§2.4)', productionOmitsStyleguide],
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
