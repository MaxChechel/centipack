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
   *
   * WWW, because that is the host that answers. The apex 301s to
   * www.centipack.com, so a canonical on the apex pointed every page at a
   * redirect — mixed signals at launch. This one constant feeds the canonical,
   * og:url, the sitemap, robots.txt and the JSON-LD graph.
   */
  origin: 'https://www.centipack.com',

  /** Sets <html lang>. */
  locale: 'en',

  /** Where enquiries go in the markup. The endpoint's own config is in env. */
  contactHref: '/contact',

  /**
   * The published address, stated once.
   *
   * It was typed into the footer and the contact page independently, and the
   * structured data would have been a third — an `Organization.email` that can
   * drift from the address a visitor can actually see is worse than no
   * structured data, because a machine reads the one nobody proofreads.
   */
  email: 'info@centipack.com',

  /**
   * The default share image, root-relative.
   *
   * 1200 × 630, which is the size `BaseLayout` writes into `og:image:width` and
   * `og:image:height` — those are declared rather than derived, so the file and
   * the numbers have to agree. `scripts/build-icons.mjs` refuses to run if the
   * source is any other size, which is what keeps them agreeing.
   *
   * Served from `public/` and NOT through `src/assets`, because a share image
   * needs a stable URL: scrapers cache by it, and a fingerprinted filename would
   * hand every build a new one.
   *
   * A page passes `ogImage` to override it; nothing does yet.
   */
  ogImage: '/og-default.png',

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

/**
 * LAUNCH SCOPE — what this build is allowed to ship.
 *
 * The soft launch was Home, the products index, the three category pages, About
 * and Contact, with every product detail page gated out. v1 opens five of them
 * — the five the client designed — and leaves the other eight closed. WHICH
 * five is decided by the content, not by a list here; see `productPagesShip`
 * below for why that is the only rule that can be correct.
 *
 * A GATE, NOT A `noindex`, and not a hand-edited list of links. The same ruling
 * the styleguide route gets in astro.config.mjs, for the same reason: a page
 * that must not be launched is a page a production build emits NOTHING for.
 * `noindex` is a request to a crawler; not existing is a fact about the site.
 *
 * WHAT THIS ONE BOOLEAN REACHES, because it is more than the route:
 *
 *   - `src/pages/products/[category]/[product].astro` returns no paths, so the
 *     build emits no product HTML;
 *   - `ProductView.href` is `undefined` (src/lib/catalogue.ts), which makes the
 *     product card's title plain text instead of a link, and removes its `→`
 *     affordance — an arrow that promises a destination there is not;
 *   - the nav panel, the mobile nav fold and the footer render the product NAMES
 *     without wrapping them in anchors.
 *
 * That last set is 39 links on every page of the site — thirteen products times
 * three lists — and it is why this is one flag read in one adapter rather than a
 * condition written into four templates. Making `href` optional is what turns
 * each of those into a type error, so `astro check` finds the consumers rather
 * than a grep.
 *
 * NO DEV OVERRIDE. `npm run dev` gates these pages out exactly as a build does,
 * and that is a correction rather than the original design: this first shipped
 * with `|| import.meta.env.DEV`, so unlaunched product pages stayed reviewable
 * on localhost. The effect was that `npm run dev` served 52 product links and 16
 * card arrows while the built site served none — **the dev server showing a
 * different site from the one that ships, on the exact question being reviewed.**
 * Reported as the cards still being clickable, which they were, in the only
 * place anybody was looking.
 *
 * A preview that disagrees with the artifact is worth less than no preview.
 *
 * TO REVIEW THE PRODUCT PAGES, flip this to `true` and run dev; that is one line
 * and it is honest, because while it is true the pages are genuinely part of the
 * site. Flipping it is also exactly how they launch.
 */
export const LAUNCH = {
  /** The master switch for product detail pages — `/products/:category/:product`. */
  productPages: true,
} as const;

/**
 * Does THIS product have a page?
 *
 * IT IS NO LONGER ONE ANSWER FOR ALL THIRTEEN, and the v1 round is what forced
 * that. Five products were designed as pages — gel packs, Puncture Pack,
 * insulated metallic mailers, EPS foam coolers and thermal liners — and the
 * other eight were not. An all-or-nothing boolean had two settings and both
 * were wrong: `false` buries five finished pages, `true` ships eight built from
 * a template with nothing in it.
 *
 * SO THE CONTENT DECIDES. A product with sections has a page; a product without
 * them does not. That is not a convention someone has to remember — it is the
 * only sentence that can be true, because a page IS its sections, and a product
 * with none of them has no page to link to in the first place.
 *
 * The machinery around it is unchanged and still does the work: a product that
 * fails this gets no `href` from the adapter, `ProductView.href` is optional,
 * and every consumer — the card, the nav panel, the mobile fold, the footer —
 * is a compile error until it handles the absence. Eight products across three
 * lists is 24 names that render as text rather than 24 links to pages the build
 * does not emit.
 *
 * `LAUNCH.productPages` survives as the master switch above it, for turning the
 * whole family off in one line without emptying thirteen content files.
 *
 * @param sectionCount how many sections this product's content declares
 */
export const productPagesShip = (sectionCount: number): boolean =>
  LAUNCH.productPages && sectionCount > 0;
