import { getCollection } from 'astro:content';
import { toPageImage, toSection, type Picture, type ProductSection } from './catalogue';
import type { PageData, PageSectionInput, ProductSectionInput, SiteData } from '../content.config';

/**
 * The pages-and-site view-model adapter (§5), the sibling of catalogue.ts.
 *
 * The same contract: pages and components take the views below, never a
 * `CollectionEntry`, so a Sanity loader replaces `getCollection` here and stops.
 * It is also the only place the editorial `{email}` token is filled in, so the
 * address is stated once (in the site entry) wherever a sentence mentions it.
 */

export interface MenuLink {
  label: string;
  href: string;
}

export interface SiteView {
  description: string;
  email: string;
  labels: { home: string; products: string; getQuote: string };
  footer: { rights: string };
  closingBand: { heading: string; body: string; actionLabel: string; image: Picture };
  crossLinks: { eyebrow: string; body: string };
}

export type PageRoute = 'home' | 'about' | 'contact' | 'products' | '404';

export interface ContactFormView {
  type: 'contact-form';
  emailLabel: string;
  fields: Record<'name' | 'email' | 'company' | 'volume' | 'message', { label: string; placeholder: string }>;
  volumeOptions: readonly string[];
  submitLabel: string;
  messages: { sending: string; success: string; failed: string; unreachable: string };
}

/** A page's sections: the shared vocabulary plus the bands the built-in pages draw. */
export type PageSection =
  | ProductSection
  | { type: 'categories'; heading: string; lede: string; action: MenuLink }
  | { type: 'testimonial'; quote: string; attribution: string }
  | { type: 'prose'; paragraphs: readonly string[]; closer?: string }
  | ContactFormView
  | { type: 'catalogue' }
  | { type: 'closing' };

export interface PageView {
  /** Set on the five built-in pages; `slug` is set on pages the client adds. */
  route?: PageRoute;
  slug?: string;
  /** The page's URL path. */
  path: string;
  title: string;
  description: string;
  label: string;
  heading: string;
  lede?: string;
  actions: readonly MenuLink[];
  image?: Picture;
  /** How llms.txt lists it, or null when it is not listed. */
  listing: { label: string; note: string; order: number } | null;
  sections: readonly PageSection[];
}

/** Fill the `{email}` token content uses wherever a sentence names the address. */
const withEmail = (text: string, email: string): string => text.replaceAll('{email}', email);

/**
 * Picture widths for page images. Layout knowledge, so it is here rather than in
 * content: the About photograph is drawn 900px wide, so 1800 is the 2x file and
 * anything beyond it is bytes nobody sees. Everything else takes the default.
 */
const PAGE_IMAGE_WIDTH: Partial<Record<PageRoute, number>> = { about: 1800 };

const ROUTE_PATH: Record<PageRoute, string> = {
  home: '/',
  about: '/about',
  contact: '/contact',
  products: '/products',
  '404': '/404',
};

let siteCache: Promise<SiteView> | undefined;

/** The one site entry. Memoised: every page reads it, several times. */
export function getSite(): Promise<SiteView> {
  siteCache ??= (async () => {
    const entries = await getCollection('site');
    if (entries.length !== 1) {
      throw new Error(
        `site: expected exactly one entry in src/content/site/, found ${entries.length}.`,
      );
    }
    const data = entries[0].data as SiteData;
    return {
      description: data.description,
      email: data.email,
      labels: data.labels,
      footer: data.footer,
      closingBand: {
        heading: data.closingBand.heading,
        body: data.closingBand.body,
        actionLabel: data.closingBand.actionLabel,
        image: await toPageImage(data.closingBand.image),
      },
      crossLinks: data.crossLinks,
    };
  })();
  return siteCache;
}

async function toPageSection(section: PageSectionInput, email: string): Promise<PageSection> {
  switch (section.type) {
    case 'categories':
    case 'testimonial':
    case 'prose':
    case 'catalogue':
    case 'closing':
      return section;
    case 'contact-form':
      return {
        ...section,
        messages: {
          sending: withEmail(section.messages.sending, email),
          success: withEmail(section.messages.success, email),
          failed: withEmail(section.messages.failed, email),
          unreachable: withEmail(section.messages.unreachable, email),
        },
      };
    default:
      /* Everything else is the shared product vocabulary, built by the same
         function product pages use, so a split row on a new page is the same
         object as a split row on PuncturePack. */
      return toSection(section as ProductSectionInput);
  }
}

let pagesCache: Promise<PageView[]> | undefined;

/**
 * Every page entry, checked as a set.
 *
 * The schema checks each entry alone; these are the rules that need all of them
 * at once, and each fails the build naming what is wrong: every built-in route
 * has exactly one entry, and no two new pages share a slug.
 */
export function getPages(): Promise<PageView[]> {
  pagesCache ??= (async () => {
    const [entries, site] = await Promise.all([getCollection('pages'), getSite()]);
    const views = await Promise.all(
      entries.map(async (entry: { data: unknown }): Promise<PageView> => {
        const data = entry.data as PageData;
        const path = data.route ? ROUTE_PATH[data.route] : `/${data.slug}`;
        return {
          route: data.route,
          slug: data.slug,
          path,
          title: data.title,
          description: data.description,
          label: data.label,
          heading: data.heading,
          lede: data.lede,
          actions: data.actions,
          image: data.image
            ? await toPageImage(data.image, data.route ? PAGE_IMAGE_WIDTH[data.route] : undefined)
            : undefined,
          listing:
            data.listing === false
              ? null
              : data.listing
                ? { ...data.listing, note: withEmail(data.listing.note, site.email) }
                : { label: data.label, note: data.description, order: 100 },
          sections: await Promise.all(data.sections.map((s: PageSectionInput) => toPageSection(s, site.email))),
        };
      }),
    );

    const problems: string[] = [];
    for (const route of Object.keys(ROUTE_PATH) as PageRoute[]) {
      const count = views.filter((v) => v.route === route).length;
      if (count !== 1) problems.push(`route "${route}" has ${count} entries; it needs exactly one`);
    }
    const seen = new Map<string, number>();
    for (const v of views) if (v.slug) seen.set(v.slug, (seen.get(v.slug) ?? 0) + 1);
    for (const [slug, count] of seen) {
      if (count > 1) problems.push(`slug "${slug}" is used by ${count} pages; each page needs its own`);
    }
    if (problems.length) throw new Error(`src/content/pages/: ${problems.join('; ')}.`);

    return views;
  })();
  return pagesCache;
}

/** One of the five built-in pages. */
export async function getPage(route: PageRoute): Promise<PageView> {
  const page = (await getPages()).find((p) => p.route === route);
  /* getPages() has already thrown if a route is missing. */
  return page!;
}

/** The pages the client added, which src/pages/[slug].astro builds. */
export async function getNewPages(): Promise<PageView[]> {
  return (await getPages()).filter((p) => p.slug);
}
