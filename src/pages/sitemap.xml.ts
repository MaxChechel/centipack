import type { APIRoute } from 'astro';
import { canonicalPath } from '../lib/urls';
import { isNoindexed } from '../consts';
import { getCategories, getProducts } from '../lib/catalogue';

/**
 * /sitemap.xml (§8).
 *
 * Hand-rolled rather than @astrojs/sitemap: the integration is one more
 * dependency for forty lines, and it would need configuring to exclude the
 * styleguide anyway. Dependencies are default-no.
 *
 * The page list is DERIVED from the routes that exist, not written out — a
 * hand-maintained sitemap is a second source of truth for what the site
 * contains, and §5's rule about second lists applies to URLs as much as to work
 * items. Underscore-prefixed files are not routes (that is how the styleguide is
 * gated), so the same filter that keeps them out of the build keeps them out of
 * here.
 *
 * THE COLLECTION-DRIVEN ROUTES ARE DERIVED, exactly as the note below always
 * said they should be. `staticPaths` can only see routes whose FILENAME is the
 * URL, so it drops anything with a `[` in it — which silently left the three
 * category pages out of the sitemap for as long as they have existed. They are
 * launch surface, and a launched page absent from the sitemap is a page nobody
 * told a crawler about.
 *
 * PRODUCT PAGES FOLLOW THE LAUNCH GATE rather than a second decision here: their
 * `href` is `undefined` while they are out of scope (src/consts.ts), so they
 * drop out of this list on the same flag that stops the build emitting them.
 * One boolean, and the sitemap cannot end up advertising URLs that 404.
 */
const pageModules = import.meta.glob('./**/*.astro');

const staticPaths = Object.keys(pageModules)
  .map((file) => file.replace(/^\.\//, '').replace(/\.astro$/, ''))
  // Not routes: underscore-prefixed files, and anything under a `_` directory.
  .filter((name) => !name.split('/').some((segment) => segment.startsWith('_')))
  // Dynamic routes cannot be enumerated from their filename alone.
  .filter((name) => !name.includes('['))
  // 404 is a route the crawler should find by getting a 404, not by being told.
  .filter((name) => name !== '404')
  .map((name) => (name === 'index' ? '/' : `/${name.replace(/\/index$/, '')}`))
  /* The same list BaseLayout emits the robots meta from. A page told not to be
     indexed and then listed in the sitemap is a page giving a crawler two
     contradictory instructions. */
  .filter((path) => !isNoindexed(path))
  .sort();

export const GET: APIRoute = async ({ site }) => {
  if (!site) throw new Error('sitemap.xml: `site` must be set in astro.config.mjs.');

  const [categories, products] = await Promise.all([getCategories(), getProducts()]);

  const paths = [
    ...staticPaths,
    ...categories.map((category) => category.href),
    /* `undefined` while product pages are outside the launch scope — the same
       field the cards, the nav and the footer read. */
    ...products.map((product) => product.href).filter((href) => href !== undefined),
  ]
    .filter((path) => !isNoindexed(path))
    .sort();

  const urls = paths
    .map((path) => `  <url><loc>${new URL(canonicalPath(path), site).href}</loc></url>`)
    .join('\n');

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  return new Response(body, { headers: { 'content-type': 'application/xml; charset=utf-8' } });
};
