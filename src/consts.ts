/**
 * Site identity — the first file a new project edits.
 *
 * Everything that is true about THIS SITE rather than about the system lives
 * here: the name, the description, the canonical origin, the locale, and the
 * routes that must never be indexed. `BaseLayout`, `src/lib/urls.ts`,
 * `robots.txt` and `sitemap.xml` all read it.
 *
 * One module because the alternative is what this repo had: a name in
 * `navigation.ts`, an origin in `astro.config.mjs`, a locale hardcoded in
 * `BaseLayout`, and a noindex rule expressed once as a meta tag and again as a
 * sitemap filter. Four places to change, and the fourth is the one someone
 * misses — which is how a staging origin ends up in a production canonical tag.
 *
 * Filled for CentiPack in Phase 0. Step one of the checklist in README.md.
 */
export const SITE = {
  /** Used in the nav's accessible name and the footer. */
  name: 'CentiPack',

  /**
   * The default <meta name="description">.
   *
   * Lifted verbatim from the home hero lede in Figma — the copy is locked, and
   * a description written separately from the page is a description that drifts
   * from it.
   */
  description:
    '2–8°C shippers, gel packs, branded boxes and the pharmacy formats that go inside them — specified around your lanes and produced to your run.',

  /**
   * The canonical production origin, no trailing slash.
   *
   * This is the single source of truth for it. `astro.config.mjs` imports this
   * rather than repeating the URL, so a build cannot disagree with the sitemap
   * about where the site lives.
   */
  origin: 'https://centipack.com',

  /** Sets <html lang>. */
  locale: 'en',

  /** Where enquiries go in the markup. The endpoint's own config is in env. */
  contactHref: '/contact',

  /**
   * Routes that must never be indexed, and never appear in the sitemap.
   *
   * Stated once and consumed twice — `BaseLayout` emits the robots meta and
   * `sitemap.xml` filters on the same list, so the two cannot drift. The
   * styleguide is here as a belt to the braces of the build-time route gate:
   * the gate means it does not exist in production, this means that if a project
   * ever turns the gate off, the page still says so.
   */
  noindex: ['/styleguide'] as readonly string[],
} as const;

/** Is this path one of the noindexed routes? */
export const isNoindexed = (path: string): boolean =>
  SITE.noindex.some((route) => path === route || path.startsWith(`${route}/`));
