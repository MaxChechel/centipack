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

export const GET: APIRoute = async () => {
  const entries = (await getCollection('redirects')) as { id: string; data: RedirectData }[];

  /* A BROKEN FILE MUST NOT BUILD AS AN EMPTY ONE. Astro's file loader logs a
     YAML error (a duplicate key, a bad indent) and carries on with no entries,
     so the build would pass and publish no redirects at all: every old URL a
     404, silently. Counting the rules written in the file (each starts a line
     with "/" and ends with ":") against the rules loaded turns that into a
     failed build that says why. Measured: a duplicated key built clean, exit 0,
     before this check existed. */
  const written = readFileSync('src/content/redirects.yaml', 'utf8')
    .split('\n')
    .map((line) => /^["']?(\/\S*?)["']?\s*:\s*$/.exec(line)?.[1])
    .filter((path): path is string => Boolean(path));
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
