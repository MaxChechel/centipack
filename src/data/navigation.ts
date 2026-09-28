import { getCatalogue, categoryHref } from '../lib/catalogue';

/**
 * Navigation — ONE source per list (§5).
 *
 * Nav and Footer both read this, and this reads the CATALOGUE. There is no
 * hand-maintained list of products anywhere in the repo: the twelve entries in
 * `src/content/products` are the only place they exist, and the nav panel, the
 * mobile menu and the footer's three link columns are all derived from that one
 * traversal. A second hardcoded list is how a link goes stale in one place and
 * not the other, and how orphan pages happen.
 *
 * Async, because the source is a content collection. That is a real constraint
 * and it is the right one: the alternative is a typed module duplicating the
 * collection, which is exactly the migration §5 says never happens for free.
 */
export interface NavLink {
  /**
   * Where the entry goes — or `undefined` for an entry that is a NAME rather
   * than a destination.
   *
   * The product entries are nameless-destination entries while product detail
   * pages sit outside the launch scope (`LAUNCH.productPages`, src/consts.ts):
   * the catalogue still lists what CentiPack makes, and none of the thirteen
   * names is a link, because there is no page to link to. Nav and Footer each
   * render a `<span>` in place of the `<a>`.
   *
   * Optional here for the same reason it is optional on `ProductView`: it makes
   * an unhandled absence a compile error rather than a 404 in the built HTML.
   */
  href?: string;
  label: string;
  /** Shown under the label in a mega-menu panel, where there is room for it. */
  description?: string;
}

/**
 * One column of a mega-menu panel. The `title` is a real heading in the panel's
 * outline, not a styled label — a panel of thirty links with no headings is a
 * list a screen-reader user has to read end to end to navigate.
 */
export interface NavColumn {
  title: string;
  href: string;
  /** "Browse cold chain →" — the column's own route to its category page. */
  browseLabel?: string;
  links: readonly NavLink[];
}

export interface NavGroup {
  /** The disclosure trigger's label. */
  label: string;
  /** Stable id — the trigger, the panel and `aria-controls` are wired by it. */
  id: string;
  columns: readonly NavColumn[];
  /**
   * The panel's fourth column is not a list. It is the "Not sure which build?"
   * card the design ends the menu with — a question and a route to Contact,
   * which is nav furniture rather than content, so it lives in Nav.
   */
  help?: { heading: string; body: string; linkLabel: string; href: string };
}

export type NavItem = NavLink | NavGroup;

export const isGroup = (item: NavItem): item is NavGroup => 'columns' in item;

/**
 * The bar: one disclosure over the whole catalogue, then About. Short on
 * purpose — a nav is a set of promises about where the site goes.
 */
export async function getNavigation(): Promise<readonly NavItem[]> {
  const catalogue = await getCatalogue();

  return [
    {
      label: 'Products',
      id: 'nav-products',
      help: {
        heading: 'Not sure which build?',
        body: 'Tell us what you ship and where it goes — we come back with a recommended build and a price.',
        linkLabel: 'Contact Us',
        href: '/contact',
      },
      columns: catalogue.map(({ category, products }) => ({
        title: category.title,
        href: categoryHref(category.slug),
        browseLabel: category.navLinkLabel,
        links: products.map((product) => ({ href: product.href, label: product.title })),
      })),
    },
    { href: '/about', label: 'About' },
  ];
}

/**
 * The footer's four columns. The first three are the catalogue again — same
 * traversal, same order, no second list — and the fourth is the company links
 * the footer owns.
 */
export async function getFooterColumns(): Promise<readonly NavColumn[]> {
  const catalogue = await getCatalogue();

  return [
    ...catalogue.map(({ category, products }) => ({
      title: category.title,
      href: categoryHref(category.slug),
      links: products.map((product) => ({ href: product.href, label: product.title })),
    })),
    {
      title: 'Company',
      href: '/products',
      links: [
        { href: '/products', label: 'All products' },
        { href: '/about', label: 'About' },
        { href: '/contact', label: 'Contact' },
      ],
    },
  ];
}

/**
 * The legal row, beside the copyright line.
 *
 * EMPTY FOR THE SOFT LAUNCH. This carried `/terms` and `/privacy`, and neither
 * page has ever existed — so every page of the site shipped two 404s in its
 * footer. Nothing caught it until `internalLinksResolve()` in
 * scripts/verify/contracts.mjs started asserting that an internal link resolves
 * to a page the build emits; it found 14 dead links on the first run.
 *
 * Removed rather than pointed somewhere plausible: a legal link that goes to the
 * wrong page is worse than no legal link, and a footer row is not the place to
 * improvise a privacy policy. The Footer renders nothing for an empty list, so
 * the row disappears until there is real copy to put behind it.
 *
 * Restoring it is two entries plus two pages — and the link check will fail the
 * build if the entries land before the pages do.
 */
export const legalLinks: readonly NavLink[] = [];

/* Site identity lives in src/consts.ts — one module, consumed by BaseLayout,
   urls.ts, robots.txt and sitemap.xml. This file is about links. */
export { SITE as site } from '../consts';
