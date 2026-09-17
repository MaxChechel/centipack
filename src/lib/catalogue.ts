import { getCollection, type CollectionEntry } from 'astro:content';
import { getImage } from 'astro:assets';

/**
 * The catalogue view-model adapter (§5).
 *
 * ONE adapter for the two collections that describe the same thing from two
 * sides, and it is the ONLY file that knows what shape the source data has.
 * Components take `ProductView` / `CategoryView` and nothing else: no
 * `CollectionEntry<'products'>` ever crosses into a component's props, so a swap
 * from `glob()` to a Sanity loader changes this file and stops.
 *
 * Images are normalized here to `{ src, width, height, alt }` — a plain,
 * source-agnostic shape. `getImage()` is what turns a glob loader's
 * ImageMetadata into that; a CMS loader would build the same object from a URL
 * and the dimensions the CMS reports. A card cannot tell them apart, which is
 * the point.
 *
 * THE SWAP HAS BEEN RUN, NOT JUST ASSERTED. A throwaway loader returning the
 * twelve products as Sanity documents — system fields, a cdn.sanity.io URL in
 * place of a local image — was put behind this adapter and the site built: 19
 * pages, 12 product pages, 12 footer links, 12 nav panel links, and the remote
 * URL in the built HTML. Not one component, page or data module changed.
 *
 * Exactly two things had to move, and both are named here so the next person
 * does not have to rediscover them:
 *
 *   1. THE LOADER MUST PROJECT. `.strict()` rejected `_id`, `_type`, `_rev`,
 *      `_createdAt` and `_updatedAt` — correctly. A GROQ query that names its
 *      fields returns none of them, so this costs nothing; a loader that passes
 *      whole documents through fails the build on the first one.
 *   2. `toPicture()` BELOW IS THE ONE FUNCTION THAT BREAKS. `getImage()` refuses
 *      a remote src without explicit dimensions (MissingImageDimension). The CMS
 *      branch is `typeof picture.src === 'string'` → return the URL with the
 *      width and height the CMS reports, no `getImage()` call. It is not written
 *      yet on purpose: writing it now would mean guessing which Sanity field
 *      carries the dimensions, and a branch that has never seen real data is a
 *      guess wearing the clothes of a migration.
 *
 * `undefined` is a first-class answer here. The client's photography is not
 * shot yet, so every image slot is optional and the view model says so rather
 * than substituting something. `Media` is what turns that absence into the
 * pending box the design draws.
 */

export type CategorySlug = 'cold-chain-shipping' | 'custom-boxes' | 'pharmacy-formats';

export interface Picture {
  src: string;
  width: number;
  height: number;
  alt: string;
  /**
   * The art-directed mobile file: a DIFFERENT framing of the same subject, for
   * a portrait screen. No `alt` of its own — it shows the same thing, and two
   * descriptions of one subject is two things to keep in sync. Absent means the
   * desktop file serves both, which is the case for everything not yet reshot.
   */
  mobile?: { src: string; width: number; height: number };
}

export interface ProductView {
  slug: string;
  title: string;
  category: CategorySlug;
  order: number;
  summary: string;
  lede?: string;
  contactLinkLabel?: string;
  href: string;
  image?: Picture;
  facts: readonly { label: string; value: string }[];
  specTable?: {
    caption: string;
    note?: string;
    columns: readonly string[];
    rows: readonly (readonly string[])[];
  };
}

export interface CategoryView {
  slug: CategorySlug;
  title: string;
  pageTitle: string;
  order: number;
  summary: string;
  lede: string;
  cardBody: string;
  cardLinkLabel: string;
  guideLinkLabel: string;
  navLinkLabel: string;
  selectionHeading: string;
  crossBody: string;
  href: string;
  rangeImage?: Picture;
  cardImage?: Picture;
}

/**
 * ONE place that builds a product URL, because §5's "one source per list" covers
 * the shape of a link as much as the list of them. Nested under the category
 * because the product page's own breadcrumb is drawn that way.
 */
export const categoryHref = (slug: CategorySlug): string => `/products/${slug}`;
export const productHref = (category: CategorySlug, slug: string): string =>
  `${categoryHref(category)}/${slug}`;

/** Render widths. One number per surface, so every caller asks for the same asset. */
const CARD_WIDTH = 880;
const WIDE_WIDTH = 2400;

type RawPicture = { src: ImageMetadata; alt: string; mobile?: ImageMetadata } | undefined;

/** One number per surface, so every caller asks for the same asset. */
const MOBILE_WIDTH = 900;

async function toPicture(picture: RawPicture, width: number): Promise<Picture | undefined> {
  if (!picture) return undefined;
  const rendered = await getImage({ src: picture.src, format: 'webp', width });
  const mobile = picture.mobile
    ? await getImage({ src: picture.mobile, format: 'webp', width: MOBILE_WIDTH })
    : undefined;
  return {
    src: rendered.src,
    width: Number(rendered.attributes.width ?? width),
    height: Number(rendered.attributes.height ?? width),
    alt: picture.alt,
    ...(mobile && {
      mobile: {
        src: mobile.src,
        width: Number(mobile.attributes.width ?? MOBILE_WIDTH),
        height: Number(mobile.attributes.height ?? MOBILE_WIDTH),
      },
    }),
  };
}

/**
 * The same normalisation, for a PAGE ASSET rather than a collection field.
 *
 * The home hero and the closing band import their photographs directly — they
 * are page furniture, not content anybody edits — and both were rebuilding the
 * `{ src, width, height, alt }` shape by hand with their own `getImage()` call
 * and their own `Number(...)` casts. Two copies of one conversion is two places
 * for the art-directed `mobile` file to be forgotten, so it lives here with the
 * collection's version and both call it.
 *
 * Exported because pages may call it; components still receive only `Picture`.
 */
export async function toPageImage(
  picture: { src: ImageMetadata; alt: string; mobile?: ImageMetadata },
  width = WIDE_WIDTH,
): Promise<Picture> {
  const result = await toPicture(picture, width);
  /* Non-null: `picture` is required here, so `toPicture`'s undefined branch —
     which exists for optional collection fields — cannot be reached. */
  return result!;
}

async function toProduct(entry: CollectionEntry<'products'>): Promise<ProductView> {
  return {
    slug: entry.data.slug,
    title: entry.data.title,
    category: entry.data.category,
    order: entry.data.order,
    summary: entry.data.summary,
    lede: entry.data.lede,
    contactLinkLabel: entry.data.contactLinkLabel,
    href: productHref(entry.data.category, entry.data.slug),
    image: await toPicture(entry.data.images.main, CARD_WIDTH),
    facts: entry.data.facts,
    specTable: entry.data.specTable,
  };
}

async function toCategory(entry: CollectionEntry<'categories'>): Promise<CategoryView> {
  return {
    slug: entry.data.slug,
    title: entry.data.title,
    pageTitle: entry.data.pageTitle,
    order: entry.data.order,
    summary: entry.data.summary,
    lede: entry.data.lede,
    cardBody: entry.data.cardBody,
    cardLinkLabel: entry.data.cardLinkLabel,
    guideLinkLabel: entry.data.guideLinkLabel,
    navLinkLabel: entry.data.navLinkLabel,
    selectionHeading: entry.data.selectionHeading,
    crossBody: entry.data.crossBody,
    href: categoryHref(entry.data.slug),
    rangeImage: await toPicture(entry.data.rangeImage, WIDE_WIDTH),
    cardImage: await toPicture(entry.data.cardImage, CARD_WIDTH),
  };
}

/**
 * Every product, ordered by category then by `order`. Derived views — one
 * category's products, the nav panel's columns, the footer's link lists — filter
 * THIS, never a second hardcoded list, which is how orphans happen.
 */
export async function getProducts(): Promise<ProductView[]> {
  const entries = await getCollection('products');
  const views = await Promise.all(entries.map(toProduct));
  return views.sort((a, b) => a.category.localeCompare(b.category) || a.order - b.order);
}

/** Every category, in the fixed order the brief sets. */
export async function getCategories(): Promise<CategoryView[]> {
  const entries = await getCollection('categories');
  const views = await Promise.all(entries.map(toCategory));
  return views.sort((a, b) => a.order - b.order);
}

/**
 * The catalogue as the nav, the footer and the products index all want it:
 * each category with its own products attached, in order. One traversal, one
 * source, three consumers.
 */
export async function getCatalogue(): Promise<
  { category: CategoryView; products: ProductView[] }[]
> {
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);
  return categories.map((category) => ({
    category,
    products: products.filter((p) => p.category === category.slug).sort((a, b) => a.order - b.order),
  }));
}

/*
 * THERE IS NO `getProductBody()` ANY MORE, AND ITS ABSENCE IS THE POINT.
 *
 * It rendered a product's markdown body. Nothing called it, no product has a
 * body, and it was the single worst thing in this file for the CMS swap:
 *
 *   - `getEntry('products', slug)` looked an entry up BY ID while passing it a
 *     SLUG. That works today only because every product's filename happens to
 *     equal its slug field; under any CMS the id is a document id and the lookup
 *     silently finds nothing.
 *   - `render()` is markdown-only. Sanity returns Portable Text, which is not a
 *     component and cannot be rendered by it.
 *
 * Deleting it took `getEntry`, `render` and two-thirds of the loader coupling
 * out of the adapter at the cost of nothing that shipped. When product bodies
 * arrive they will arrive in whatever the source of truth is by then, and that
 * is the moment to write the function that reads them.
 */
