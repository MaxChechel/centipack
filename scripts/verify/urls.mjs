// URL-REMOVAL CHECK: a change may not make a published URL disappear.
//
// ARCHITECTURE §8: old URLs 301, never 404. Once the client edits content, the
// usual way to break that is ordinary and invisible — rename a product's slug,
// delete a page — and every check in `npm run verify` stays green, because the
// new site is internally whole. It is only wrong compared with the old one.
//
// So this builds BOTH: the base branch (in a temporary git worktree) and the
// working tree, reads each sitemap, and fails if a URL the base published is
// gone from this build without a redirect for it in dist/_redirects (generated
// from src/content/redirects.yaml). Whether that redirect's target is sound is
// `redirects are sound` in contracts.mjs; this only asks that one exists.
//
// A URL that left the sitemap but still has a page (it was noindexed) is not
// removed, and is not reported.
//
// Usage: node scripts/verify/urls.mjs <base-ref>   (e.g. origin/main)
// Exit 0 pass, 1 URLs removed, 2 the check could not run.

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync, symlinkSync } from 'node:fs';
import { join, resolve } from 'node:path';

const base = process.argv[2];
if (!base) {
  console.error('urls: pass the base ref, e.g. `node scripts/verify/urls.mjs origin/main`.');
  process.exit(2);
}

const ROOT = resolve('.');
const WORK = join(ROOT, '.verify', 'urls');
const BASE_SRC = join(WORK, 'base-src');
const BASE_OUT = join(WORK, 'base-dist');
const HEAD_OUT = join(WORK, 'head-dist');

const run = (cmd, args, cwd) => {
  const r = spawnSync(cmd, args, { cwd, encoding: 'utf8', env: { ...process.env, INCLUDE_STYLEGUIDE: '' } });
  if (r.status !== 0) {
    console.error(`urls: \`${cmd} ${args.join(' ')}\` failed in ${cwd}.\n${(r.stderr || r.stdout).slice(-1500)}`);
    cleanup();
    process.exit(2);
  }
  return r.stdout;
};

function cleanup() {
  if (existsSync(BASE_SRC)) spawnSync('git', ['worktree', 'remove', '--force', BASE_SRC], { cwd: ROOT });
}

/** The paths a build's sitemap lists. */
const sitemapPaths = (out) => {
  const file = join(out, 'sitemap.xml');
  if (!existsSync(file)) {
    console.error(`urls: no sitemap.xml in ${out}; nothing to compare.`);
    cleanup();
    process.exit(2);
  }
  return new Set(
    [...readFileSync(file, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname),
  );
};

/** Does this build still answer `path` with a page? */
const answers = (out, path) => {
  const clean = path.replace(/^\//, '');
  if (clean === '') return existsSync(join(out, 'index.html'));
  return existsSync(join(out, `${clean}.html`)) || existsSync(join(out, clean, 'index.html'));
};

rmSync(WORK, { recursive: true, force: true });
spawnSync('git', ['worktree', 'prune'], { cwd: ROOT });

// The base branch, checked out beside this one.
run('git', ['worktree', 'add', '--detach', BASE_SRC, base], ROOT);
const sameLock =
  readFileSync(join(ROOT, 'package-lock.json'), 'utf8') === readFileSync(join(BASE_SRC, 'package-lock.json'), 'utf8');
// Identical lockfile: the installed tree is the same, so reuse it rather than
// spend a minute on a second `npm ci`. Different lockfile: install for real.
if (sameLock) symlinkSync(join(ROOT, 'node_modules'), join(BASE_SRC, 'node_modules'), 'dir');
else run('npm', ['ci', '--no-audit', '--no-fund'], BASE_SRC);
run('npx', ['astro', 'build', '--outDir', BASE_OUT], BASE_SRC);
run('npx', ['astro', 'build', '--outDir', HEAD_OUT], ROOT);
cleanup();

const before = sitemapPaths(BASE_OUT);
const after = sitemapPaths(HEAD_OUT);
const redirected = new Set(
  existsSync(join(HEAD_OUT, '_redirects'))
    ? readFileSync(join(HEAD_OUT, '_redirects'), 'utf8')
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l && !l.startsWith('#'))
        .map((l) => l.split(/\s+/)[0])
    : [],
);

const removed = [...before].filter((path) => !after.has(path) && !answers(HEAD_OUT, path)).sort();
const unredirected = removed.filter((path) => !redirected.has(path));
const added = [...after].filter((path) => !before.has(path)).sort();

console.log(`urls: ${before.size} URL(s) on ${base}, ${after.size} in this build.`);
if (added.length) console.log(`urls: new: ${added.join(', ')}`);
for (const path of removed.filter((p) => redirected.has(p))) console.log(`urls: ${path} is gone, and redirected.`);

if (unredirected.length) {
  console.error(`\nurls: FAILED. ${unredirected.length} URL(s) on ${base} no longer exist and have no redirect:\n`);
  for (const path of unredirected) console.error(`  ${path}`);
  console.error(
    '\nAdd each one to src/content/redirects.yaml, pointing at the nearest useful page' +
      '\n(the renamed page, or its category; not the home page by default):\n' +
      `\n  ${unredirected[0]}:\n    to: /the/new/path\n    reason: Renamed.\n`,
  );
  process.exit(1);
}
console.log('urls: passed. Every URL the base published still resolves or is redirected.');
