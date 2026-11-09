import type { APIRoute } from 'astro';
import { readFileSync } from 'node:fs';
import { getCollection } from 'astro:content';
import type { RedirectData } from '../content.config';

/**
 * dist/_redirects, GENERATED FROM CONTENT (editing addendum A3).
 *
 * The source of truth is src/content/redirects.yaml; this writes it in the
 * format Cloudflare Pages reads (`from to status`, one per line, first match
 * wins). `public/_redirects` is retired: a hand-edited copy beside a generated
 * one is two lists that can disagree.
 *
 * A DYNAMIC ROUTE WITH ONE PATH because Astro does not route a file whose name
 * starts with an underscore, and `_redirects` has to sit at the root of the
 * build under exactly that name.
 *
 * Whether each rule is sound (its target exists, no chains, no loops, no
 * duplicate source, no live page shadowed) is checked against the finished
 * build by `redirects are sound` in scripts/verify/contracts.mjs, which reads
 * this file back out of dist/.
 */
export async function getStaticPaths() {
  return [{ params: { redirects: '_redirects' } }];
}

/** The file as written: its non-comment text, and the old paths it declares. */
function readRedirectsFile() {
  const text = readFileSync('src/content/redirects.yaml', 'utf8');
  const body = text
    .split('\n')
    .filter((line) => !/^\s*(#|$)/.test(line))
    .join('\n')
    .trim();
  const paths = text
    .split('\n')
    .map((line) => /^["']?(\/\S*?)["']?\s*:\s*$/.exec(line)?.[1])
    .filter((path): path is string => Boolean(path));
  return { body, paths };
}

export const GET: APIRoute = async () => {
  const file = readRedirectsFile();

  /* AN EMPTY FILE IS HANDLED, NOT WARNED ABOUT (CE-16). Asking Astro for an
     empty collection logs "collection does not exist or is empty" on every
     build, and a warning that appears on every build teaches everyone to
     ignore warnings. So the file says it is empty in exactly one way, `{}`,
     and then the collection is not queried at all. Anything else is loaded and
     checked below, so a file with rules that failed to parse can never pass
     for an empty one. */
  const explicitlyEmpty = file.body === '{}';
  const entries = explicitlyEmpty
    ? []
    : ((await getCollection('redirects')) as { id: string; data: RedirectData }[]);

  /* A BROKEN FILE MUST NOT BUILD AS AN EMPTY ONE. Astro's file loader logs a
     YAML error (a duplicate key, a bad indent) and carries on with no entries,
     so the build would pass and publish no redirects at all: every old URL a
     404, silently. Counting the rules written in the file (each starts a line
     with "/" and ends with ":") against the rules loaded turns that into a
     failed build that says why. Measured: a duplicated key built clean, exit 0,
     before this check existed. */
  const written = file.paths;
  if (!explicitlyEmpty && entries.length === 0) {
    throw new Error(
      'src/content/redirects.yaml: the file has content but no redirect loaded from it. ' +
        'Write `{}` for no redirects, or fix the rules (check the [file-loader] error above).',
    );
  }
  /* By path, not only by count: on a parse error Astro keeps the LAST GOOD
     load in its local content cache, so a broken file can come back as stale
     rules that happen to number the same. (CI has no cache, so there it loads
     none.) */
  const loaded = new Set(entries.map((entry) => entry.id));
  if (written.length !== entries.length || written.some((path) => !loaded.has(path))) {
    throw new Error(
      `src/content/redirects.yaml: ${written.length} redirect(s) written (${written.join(', ') || 'none'}) ` +
        `but ${entries.length} loaded (${[...loaded].join(', ') || 'none'}). ` +
        'The file did not parse, or a path is listed twice (each old path may appear once). ' +
        'Check the error printed above by [file-loader].',
    );
  }
  const rules = entries
    .map((entry) => ({ from: entry.id, ...entry.data }))
    .sort((a, b) => a.from.localeCompare(b.from));
  const body = [
    '# Generated from src/content/redirects.yaml at build. Edit that file, not this one.',
    ...rules.map((rule) => `${rule.from} ${rule.to} ${rule.status}`),
    '',
  ].join('\n');
  return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
};
