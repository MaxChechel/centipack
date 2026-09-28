import { getCollection, type CollectionEntry } from 'astro:content';
import { getImage } from 'astro:assets';
import { productPagesShip } from '../consts';

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
   * Width-descriptor candidates for the same photograph, as an `srcset` string.
   *
   * STILL SOURCE-AGNOSTIC, which is the only reason it belongs in this shape: a
   * CMS loader builds the identical string from its CDN's resize parameters, and
   * a component cannot tell where it came from. `src` stays as the fallback a
   * browser uses when it ignores `srcset`, so nothing breaks if this is absent.
   *
   * WHY IT EXISTS. Every card on the site was served ONE fixed 880px file
   * whatever it was drawn at. Measured on the built page:
   *
   *   context                 card CSS   device px needed   shipped
   *   products index @1x           259                259       880   3.4x waste
   *   products index @2x           259                518       880   fine
   *   category page  @2x           440                880       880   exactly 1:1
   *   category page  @3x           440               1320       880   440 short
   *
   * A category card is 440px where an index card is 259, so one number cannot
   * serve both: it is either wasteful at the small end or soft at the large one,
   * and it was both.
   */
  srcset?: string;
  /**
   * The art-directed mobile file: a DIFFERENT framing of the same subject, for
   * a portrait screen. No `alt` of its own — it shows the same thing, and two
   * descriptions of one subject is two things to keep in sync. Absent means the
   * desktop file serves both, which is the case for everything not yet reshot.
   */
  mobile?: { src: string; width: number; height: number; srcset?: string };
}

export interface ProductView {
  slug: string;
  title: string;
  category: CategorySlug;
  order: number;
  summary: string;
  lede?: string;
  contactLinkLabel?: string;
  /**
   * Where this product's page is — or `undefined` when product detail pages are
   * not part of this launch (`LAUNCH.productPages` in src/consts.ts).
   *
   * OPTIONAL ON PURPOSE, AND THE OPTIONALITY IS THE MECHANISM. A product with no
   * page has no URL, and saying so in the type is what makes every consumer —
   * the card, the nav panel, the mobile fold, the footer — a compile error until
   * it handles the absence. The alternative, a string that points at a route the
   * build does not emit, is a 404 that nothing catches: thirteen products across
   * three lists is 39 dead links on every page of the site.
   *
   * `productHref()` below still exists and is still the one place that builds
   * the URL. What is conditional is whether there is a page at the end of it.
   */
  href?: string;
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
  /** Per-host cross-card copy: `{ [slug of the card]: what it says here }`. */
  crossBodyOverrides?: Partial<Record<CategorySlug, string>>;
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

/**
 * The candidate widths a card image is rendered at.
 *
 * NOT ARBITRARY. Each one is a real drawn width times a real pixel density,
 * measured on the built page rather than picked off a ladder:
 *
 *   260   index card at 1x
 *   440   category card at 1x, index card at ~1.7x
 *   520   index card at 2x
 *   880   category card at 2x  — this was the only size that ever shipped
 *  1320   category card at 3x
 *
 * `getImage` will not upscale, so any entry above a source's own width simply
 * comes back at the source width; the duplicate is dropped below rather than
 * shipped as two identical candidates under different descriptors.
 *
 * THAT CAP IS CURRENTLY BINDING. The product photographs in this repo are
 * 1037px wide, so 1320 cannot be produced from them and a category card at 3x
 * is served 1037 — better than the 880 it had, and still short of the 1320 it
 * wants. Supplying larger sources is what unlocks the top of this list; nothing
 * here needs to change when they arrive.
 */
const CARD_WIDTHS = [260, 440, 520, 880, 1320] as const;

/**
 * The same, for a CATEGORY card — which is a different object at a different
 * size, and was the one actually being complained about.
 *
 * A category card is drawn WIDER than a product card and wider than it looks:
 *
 *            320    360    390    430    768    1024   1440
 *   home 3-up  288    328    358    396    230    310    440px
 *   cross 2-up 288    328    358    396    341    461    656px
 *
 * **656px on a category page**, which at 2x wants 1312 and at 3x wants 1968 —
 * against the single 880px file every one of them was served. The source
 * photographs are 2200px wide, so the resolution was there and the pipeline was
 * throwing it away.
 */
const CATEGORY_CARD_WIDTHS = [360, 440, 660, 880, 1320, 1970] as const;

/**
 * And for the full-bleed page pictures — the category range shot and the page
 * heroes.
 *
 * These are drawn at the VIEWPORT width, so the ladder is the viewport ladder
 * rather than a card ladder: 390 at 2x is 780, 1440 at 2x is 2880, 1440 at 3x
 * is 4320. One 2400px file served all of them, which is three times too much
 * for a phone and not quite enough for a retina desktop at the same time.
 */
const WIDE_WIDTHS = [640, 960, 1280, 1920, 2560, 3840] as const;

type RawPicture = { src: ImageMetadata; alt: string; mobile?: ImageMetadata } | undefined;

/** One number per surface, so every caller asks for the same asset. */
const MOBILE_WIDTH = 900;

/**
 * Candidate widths for the art-directed MOBILE file.
 *
 * A phone hero is full-bleed, so the ladder is the phone viewport times its
 * density: 390 at 2x is 780, 390 at 3x is 1170, 430 at 3x is 1290. The single
 * `MOBILE_WIDTH` of 900 was therefore already short of a 3x phone — which is
 * most phones — on the one image that fills the screen.
 */
const MOBILE_WIDTHS = [440, 780, 900, 1290] as const;

async function toPicture(
  picture: RawPicture,
  width: number,
  /**
   * Candidate widths for an `srcset`. Omitted for the wide page assets, which
   * are drawn at one size and gain nothing from a set.
   */
  widths?: readonly number[],
): Promise<Picture | undefined> {
  if (!picture) return undefined;
  const rendered = await getImage({ src: picture.src, format: 'webp', width });

  /* CLAMPED TO THE SOURCE'S OWN WIDTH, and that is not a tidiness measure.
     `getImage` will not upscale — asking 1320 of a 1037px file returns 1037 —
     but `attributes.width` reports the width that was REQUESTED, not the one
     produced. Trusting it shipped `… 1320w` pointing at a 1037px image, which
     is worse than no srcset: a browser picking by descriptor takes that
     candidate believing it is 1320 wide and renders it softer than the 880 it
     would otherwise have chosen. Caught by reading the emitted files, not the
     emitted HTML.

     So the candidate list is built from `picture.src.width`, which is the
     source's real intrinsic width, and the cap appears exactly once. */
  let srcset: string | undefined;
  if (widths?.length) {
    const intrinsic = picture.src.width;
    const candidates = widths.filter((w) => w < intrinsic);
    if (widths.some((w) => w >= intrinsic)) candidates.push(intrinsic);

    if (candidates.length > 1) {
      const variants = await Promise.all(
        candidates.map(async (w) => {
          const variant = await getImage({ src: picture.src, format: 'webp', width: w });
          return `${variant.src} ${w}w`;
        }),
      );
      srcset = variants.join(', ');
    }
  }
  const mobile = picture.mobile
    ? await getImage({ src: picture.mobile, format: 'webp', width: MOBILE_WIDTH })
    : undefined;

  /* The mobile file gets its own ladder, clamped to its own intrinsic width for
     the same reason the desktop one is — see the note above `srcset`. */
  let mobileSrcset: string | undefined;
  if (picture.mobile) {
    const intrinsic = picture.mobile.width;
    /* Typed `number[]` explicitly: MOBILE_WIDTHS is `as const`, so `.filter`
       returns an array of its literal union and refuses the intrinsic width
       pushed below. The desktop path does not hit this because its `widths`
       arrives as a `readonly number[]` parameter. */
    const candidates: number[] = MOBILE_WIDTHS.filter((w) => w < intrinsic);
    if (MOBILE_WIDTHS.some((w) => w >= intrinsic)) candidates.push(intrinsic);
    if (candidates.length > 1) {
      const variants = await Promise.all(
        candidates.map(async (w) => {
          const v = await getImage({ src: picture.mobile!, format: 'webp', width: w });
          return `${v.src} ${w}w`;
        }),
      );
      mobileSrcset = variants.join(', ');
    }
  }
  return {
    src: rendered.src,
    width: Number(rendered.attributes.width ?? width),
    height: Number(rendered.attributes.height ?? width),
    alt: picture.alt,
    ...(srcset && { srcset }),
    ...(mobile && {
      mobile: {
        src: mobile.src,
        width: Number(mobile.attributes.width ?? MOBILE_WIDTH),
        height: Number(mobile.attributes.height ?? MOBILE_WIDTH),
        ...(mobileSrcset && { srcset: mobileSrcset }),
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
  widths: readonly number[] = WIDE_WIDTHS,
): Promise<Picture> {
  const result = await toPicture(picture, width, widths);
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
    /* THE ONE PLACE THE LAUNCH GATE REACHES THE VIEW MODEL. Every product link
       on the site is derived from this field, so gating it here gates all of
       them at once — and cannot leave one list pointing at pages the build does
       not emit while another has been updated. See src/consts.ts. */
    href: productPagesShip() ? productHref(entry.data.category, entry.data.slug) : undefined,
    image: await toPicture(entry.data.images.main, CARD_WIDTH, CARD_WIDTHS),
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
    crossBodyOverrides: entry.data.crossBodyOverrides,
    href: categoryHref(entry.data.slug),
    rangeImage: await toPicture(entry.data.rangeImage, WIDE_WIDTH, WIDE_WIDTHS),
    cardImage: await toPicture(entry.data.cardImage, CARD_WIDTH, CATEGORY_CARD_WIDTHS),
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
