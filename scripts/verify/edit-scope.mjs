// EDIT-SCOPE CHECK: a content PR may only touch content.
//
// The client's own Claude edits this site through pull requests. The schema
// (src/content.config.ts) and `npm run verify` decide whether a content change
// is VALID; this check decides whether a change is CONTENT at all. Without it,
// an agent asked to "make the FAQ look tighter" can reach into a component or
// global.css, verify can pass, and the design system drifts one green PR at a
// time.
//
// So the rule is a path allowlist, read from the PR's diff against its base:
// anything outside it fails the check, with the offending paths printed. A PR
// that genuinely needs code is a developer change and says so with the
// `dev-change` label, which the workflow reads before running this at all.
//
// This is a guard against drift, not against a hostile actor: anyone with write
// access can add the label. That is the right trade for a team editing its own
// site; the label makes "this PR changes the system" a visible decision instead
// of a side effect.
//
// Usage: node scripts/verify/edit-scope.mjs <base-ref>   (e.g. origin/main)

import { spawnSync } from 'node:child_process';

/** Paths a content edit may touch, each with the reason it is content. */
const ALLOWED = [
  { match: /^src\/content\//, why: 'Collection entries: every field is validated by a .strict() schema.' },
  { match: /^src\/assets\/(products|categories|home|about|shared|posters|clients)\//, why: 'Pictures referenced from content; alt text is required by the schema.' },
];

const base = process.argv[2];
if (!base) {
  console.error('edit-scope: pass the base ref, e.g. `node scripts/verify/edit-scope.mjs origin/main`.');
  process.exit(2);
}

// `--no-renames`: git detects renames by default, and `--name-only` then prints
// only the DESTINATION. Moving src/components/Faq.astro to src/content/ would
// list one allowed path and hide the deletion of a component. With renames off,
// a move is a delete plus an add, and both paths are checked.
//
// `-z`: without it git quotes any path with unusual bytes ("src/assets/home/
// caf\303\251.avif"), and the leading quote fails the allowlist for a file that
// is content. NUL-separated output is the path exactly as it is on disk.
const diff = spawnSync('git', ['diff', '--name-only', '--no-renames', '-z', `${base}...HEAD`], {
  encoding: 'utf8',
});
if (diff.status !== 0) {
  console.error(`edit-scope: git diff against ${base} failed.\n${diff.stderr}`);
  process.exit(2);
}

const changed = diff.stdout.split('\0').filter(Boolean);
if (changed.length === 0) {
  // A pass with nothing examined is not a pass (§9).
  console.error('edit-scope: the diff is empty, so nothing was checked. Is the base ref right?');
  process.exit(2);
}

const outside = changed.filter((path) => !ALLOWED.some((rule) => rule.match.test(path)));

console.log(`edit-scope: ${changed.length} changed file(s) checked against the content allowlist.`);
if (outside.length) {
  console.error('\nedit-scope: FAILED. These files are outside what a content edit may change:\n');
  for (const path of outside) console.error(`  ${path}`);
  console.error(
    '\nIf the request really needs a code change, it is a developer change: revert these files' +
      '\nand ask a developer, or (developers only) add the `dev-change` label to this PR.',
  );
  process.exit(1);
}
console.log('edit-scope: passed. Every change is content.');
