import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
/* Imported from zod directly: astro:content's `z` re-export is deprecated as of
   Astro 7, and a deprecated import is a migration someone else has to do later. */
import { z } from 'zod';
import { picture, section, pageSection, LENGTH_CAPS } from './schema/sections';

/**
 * Content collections (§5).
 *
 * THE CONTENT LAYER IS CMS-SHAPED FROM DAY ONE. All repeating content lives in a
 * collection from the first commit — not in a typed module that "will become a
 * collection later", because that migration never happens for free.
 *
 * The schemas below are written as the FUTURE SANITY SCHEMAS: the same field
 * names, the same types, the same optionality. Swapping `glob()` for a CMS
 * loader is a change to the `loader:` key below and to one function in
 * `src/lib/catalogue.ts`, and nothing else — because nothing downstream ever saw
 * a `CollectionEntry`. Components consume view models from that one adapter,
 * which is the only file that knows where the data came from.
 *
 * THAT IS MEASURED, NOT HOPED. The twelve products were fed through a throwaway
 * loader in Sanity document shape and the whole site built correctly; see the
 * note at the top of src/lib/catalogue.ts for what came out and for the two
 * things that had to change. What follows are the findings that belong here.
 *
 * `.strict()` everywhere: an unknown frontmatter key is a typo or a
 * half-finished rename, and either way it should fail the build rather than be
 * silently ignored.
 *
 * KEEP `.strict()` WHEN THE CMS ARRIVES. It rejects Sanity's `_id`, `_type`,
 * `_rev`, `_createdAt` and `_updatedAt` — measured, that exact list — and the
 * temptation will be to reach for `.passthrough()`. Don't: the loader is what
 * should project. A GROQ query already names its fields
 * (`*[_type == "product"]{ title, "slug": slug.current, category, order, … }`),
 * so it returns no system fields at all and `.strict()` costs nothing while
 * still catching the renamed field nobody updated.
 *
 * `image()` is the one field whose TYPE is loader-specific — a glob loader gives
 * an ImageMetadata, a CMS loader gives a URL and dimensions. Measured: a remote
 * URL PASSES this schema and then fails downstream in `toPicture()`, which is
 * the adapter doing its job — one function, one branch, named in that file.
 *
 * `slug` IS A FIELD, NOT THE ENTRY ID. Every filename here happens to equal its
 * slug, so an id lookup would work today and break the day the id is a document
 * id. Read `entry.data.slug`; never `entry.id`.
 */

/** The three product categories, in the order they appear everywhere. */
const CATEGORY = z.enum(['cold-chain-shipping', 'custom-boxes', 'pharmacy-formats']);


/**
 * THE META DESCRIPTION, as a field on every entry that has a page (WORKLOG 179,
 * 180).
 *
 * It was derived: a category shipped its `lede`, a product its `lede` or a
 * sentence assembled from its title and summary, and a page typed its own. A
 * derived snippet changes whenever the paragraph does, and nobody editing the
 * paragraph is thinking about the search result. A field is a decision someone
 * can see.
 *
 * 50 TO 160 CHARACTERS. Below 50 says nothing a search result can use; above
 * 160 is cut off mid-clause with an ellipsis. Counted in characters as
 * JavaScript counts them, which is what the search engines' own limits
 * approximate.
 */
const DESCRIPTION_MIN = 50;
const DESCRIPTION_MAX = 160;

/**
 * THE ONLY ENTRIES ALLOWED OVER 160, and each may not grow.
 *
 * These six shipped longer descriptions before the cap existed (measured in
 * dist/, WORKLOG 179). Phase 2 of the editing brief had to leave the built site
 * unchanged, so their text was carried over as it was rather than rewritten in
 * a refactor. Each is capped at its measured length, so the exemption can only
 * shrink. An entry leaves this list by being shortened to 160 or fewer in a
 * content PR, and then the normal cap applies to it like everything else.
 *
 * Keyed by collection and slug. Do not add to this list: a new entry over 160
 * is a description that needs shortening, not an exemption.
 */
const DESCRIPTION_CARRY_OVER: Readonly<Record<string, { length: number; why: string }>> = {
  'products/gel-packs': { length: 362, why: 'Carried over unchanged in the Phase 2 refactor, to be shortened by content PR.' },
  'products/thermal-liners': { length: 350, why: 'Carried over unchanged in the Phase 2 refactor, to be shortened by content PR.' },
  'products/puncture-pack': { length: 252, why: 'Carried over unchanged in the Phase 2 refactor, to be shortened by content PR.' },
  'products/eps-foam-coolers': { length: 240, why: 'Carried over unchanged in the Phase 2 refactor, to be shortened by content PR.' },
  'products/insulated-metallic-mailers': { length: 194, why: 'Carried over unchanged in the Phase 2 refactor, to be shortened by content PR.' },
  'categories/custom-boxes': { length: 186, why: 'Carried over unchanged in the Phase 2 refactor, to be shortened by content PR.' },
};

/** The description rule, as a refinement any collection with a slug can run. */
const checkDescription =
  (collection: string) =>
  (entry: { slug: string; description: string }, ctx: z.RefinementCtx): void => {
    const { length } = entry.description;
    const carried = DESCRIPTION_CARRY_OVER[`${collection}/${entry.slug}`];
    const max = carried?.length ?? DESCRIPTION_MAX;
    if (length < DESCRIPTION_MIN) {
      ctx.addIssue({
        code: 'custom',
        path: ['description'],
        message: `description is ${length} characters; it needs at least ${DESCRIPTION_MIN} to be useful in a search result.`,
      });
    }
    if (length > max) {
      ctx.addIssue({
        code: 'custom',
        path: ['description'],
        message: carried
          ? `description is ${length} characters, longer than the ${carried.length} it was carried over at. Shorten it to ${DESCRIPTION_MAX} or fewer.`
          : `description is ${length} characters; the limit is ${DESCRIPTION_MAX}. Search results cut it off mid-sentence beyond that.`,
      });
    }
  };

const products = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/products' }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string(),
        /**
         * The product page's own H1, where it differs from the list name.
         *
         * A SECOND TITLE, exactly as `categories` carries one, and the v1
         * design is what forces it: the footer and the nav say "Thermal
         * liners", "EPS foam coolers" and "Puncture Pack", while the pages they
         * point at are headed "Thermal box liners", "EPS foam coolers with
         * matched corrugated outers" and "PuncturePack™". One field carrying
         * both would mean a menu item that reads like a sentence or a page
         * heading that reads like a menu item.
         *
         * Optional, falling back to `title` in the adapter — most products do
         * not need a second name and should not be made to repeat the first.
         */
        pageTitle: z.string().optional(),
        /**
         * Explicit, not derived from the filename. Sanity will carry a slug
         * field, and the adapter should be the only thing that knows the
         * difference between the two.
         */
        slug: z.string(),
        category: CATEGORY,
        /** Explicit ordering; editors do not get to rely on filename sort. */
        order: z.number().int().nonnegative(),

        /** The card's one-line sublabel: "3–32 oz · 4 variants". */
        summary: z.string(),
        /**
         * The product page's meta description: the snippet under the page's
         * title in a search result. 50 to 160 characters (see
         * DESCRIPTION_MAX above). Written for the page, not copied from it; if
         * you change the lede, re-read this.
         */
        description: z.string(),

        /**
         * The line UNDER the product page's H1, set in the eyebrow style.
         *
         * Not the summary and not the lede: it is the product in five words
         * and a claim, dot-separated and upper-cased by the stylesheet —
         * "Self-expanding insulated poly mailer · Compact storage · Expanded
         * protection". Optional because the gel packs page is drawn without
         * one.
         */
        descriptor: z.string().optional(),
        /**
         * The product page's opening paragraph.
         *
         * OPTIONAL because it does not exist yet: the design writes one product
         * lede (insulated metallic mailers) and the other eleven are owed. An
         * optional field is the honest shape for copy that is coming; inventing
         * eleven paragraphs to satisfy a required field would put placeholder
         * prose into a repo whose brief says the copy is locked.
         */
        lede: z.string().optional(),

        /**
         * "Talk to us about this mailer →" — the hero's own route to Contact.
         * Per product because the design writes it per product, and optional
         * because eleven of the twelve are not written yet.
         */
        contactLinkLabel: z.string().optional(),

        /** The client's three-slot image plan. See `picture` above. */
        images: z
          .object({
            main: picture(image).optional(),
            /**
             * THE WIDE SHOT AT THE TOP OF THE PRODUCT PAGE, which is a
             * different photograph from the card's.
             *
             * `main` is drawn 5:6 portrait for a card; the page hero is a
             * 1344 x 541 letterbox. Cropping the portrait to it shows a band
             * across the middle of the product, which is why this is a second
             * slot rather than the same file at another ratio. The adapter
             * falls back to `main` while no wide shot exists — a cropped real
             * photograph beats a pending box, and the moment a wide one lands
             * nothing but this line changes.
             */
            hero: picture(image).optional(),
            sizeRange: picture(image).optional(),
            branded: picture(image).optional(),
          })
          .default({}),

        /**
         * The six label/value cells under the product hero. An array rather than
         * named keys because the labels differ by category — a cold chain
         * product has "Temperature range", a jar does not.
         */
        facts: z.array(z.object({ label: z.string(), value: z.string() })).default([]),

        /**
         * Ruled post-launch; the size table is not standardised yet. Pages must
         * render correctly without it, and SpecTable self-skips when it is
         * absent (§4.2).
         */
        specTable: z
          .object({
            caption: z.string(),
            note: z.string().optional(),
            columns: z.array(z.string()).min(2),
            rows: z.array(z.array(z.string())).min(1),
          })
          .optional(),

        /**
         * The product page itself, as an ordered list of typed sections.
         *
         * AND IT IS ALSO THE LAUNCH GATE. A product with sections has a page;
         * a product without them does not, and `src/lib/catalogue.ts` gives it
         * no `href` — which makes its name render as text in the nav, the
         * mobile fold, the footer and on its card, with no arrow promising a
         * destination. See `productPagesShip` in src/consts.ts for why that
         * replaced a single boolean over all thirteen.
         *
         * Defaults to empty, so the eight products the v1 round did not design
         * are correct rather than broken.
         */
        sections: z.array(section(image)).default([]),
      })
      .strict()
      .superRefine(checkDescription('products')),
});

const categories = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/categories' }),
  schema: ({ image }) =>
    z
      .object({
        /** Title case, for the nav, the footer and the products index. */
        title: z.string(),
        /**
         * The category page's own H1, and the label on a cross-link card.
         *
         * A SECOND TITLE because the design genuinely uses two: "Cold Chain &
         * Shipping" in a menu, "Cold chain packaging" as a page heading. One
         * field carrying both would mean a page title that reads like a menu
         * item or a menu item that reads like a sentence.
         */
        pageTitle: z.string(),
        /**
         * The category PAGE's own H1, where it differs from `pageTitle`.
         *
         * A THIRD NAME, and only one category needs it: the nav says "Custom
         * Boxes", a cross-link card says "Custom boxes", and v1 heads the page
         * "Custom interior and exterior boxes" (Figma 1005:14936). The other
         * two categories head their page with `pageTitle`, which is what this
         * falls back to in the adapter.
         *
         * Three fields for three jobs is the honest shape when the design draws
         * three strings; collapsing them would mean a menu item that reads like
         * a sentence or a page heading that reads like a menu item.
         */
        pageHeading: z.string().optional(),
        slug: CATEGORY,
        order: z.number().int().nonnegative(),

        /** One line under the heading on the products index. */
        summary: z.string(),
        /** The category page's own opening paragraph. */
        lede: z.string(),
        /** The longer paragraph on a CategoryCard, wherever one is rendered. */
        cardBody: z.string(),
        /** The label on the card's own link — the design varies it per surface. */
        cardLinkLabel: z.string(),
        /** The "How to choose a cold chain build →" link on the products index. */
        guideLinkLabel: z.string(),
        /** The "Browse cold chain →" link at the foot of the nav panel's column. */
        navLinkLabel: z.string(),
        /** "A selection of our cold chain range" — the category page's own H2. */
        selectionHeading: z.string(),
        /**
         * The SHORT body on a cross-link card — the one another category page or
         * a product page shows when it points here. `cardBody` is the long one
         * the home page uses; the design writes both, because a card in a
         * three-up hero has room a card in a two-up footer does not.
         */
        crossBody: z.string(),

        /**
         * The standfirst on this category's card in the NAV dropdown.
         *
         * A FOURTH LENGTH OF THE SAME SENTENCE, and the design writes all four
         * separately: `cardBody` for the home page's three-up, `crossBody` for
         * the cross-link cards, `summary` for the products index, and this for
         * the menu. The nav's is the tightest of them — a reader with the menu
         * open is deciding where to go, not reading about the category — and
         * sharing any of the others put a clause too many in a 384px card.
         */
        navBody: z.string(),

        /**
         * The category page's meta description: the snippet under the page's
         * title in a search result. 50 to 160 characters (see
         * DESCRIPTION_MAX above).
         */
        description: z.string(),

        /**
         * The link on this category's cross-link card, at the foot of the
         * OTHER category pages: "Explore custom boxes".
         *
         * Was derived ("Explore" plus `pageTitle`, lower-cased) and is a field
         * now, so the wording can be changed without a developer. The three
         * entries carry exactly what the rule produced.
         */
        crossLinkLabel: z.string(),

        /**
         * THE CATEGORY'S OWN PAGE BODY, where it has one.
         *
         * Cold chain and pharmacy formats list their products: a heading and a
         * rail of cards, which is what `selectionHeading` and the catalogue
         * give them. Custom boxes does not. Its v1 page (Figma 1005:14931)
         * draws three split rows describing what can be built, then a carousel
         * of the options — and no product rail at all, because what it sells is
         * a capability rather than a shelf of SKUs.
         *
         * SO THE BODY IS DATA, for the same reason a product page's is. The
         * alternative is a template with a `if (slug === 'custom-boxes')` in
         * it, which is the page's identity hard-coded into the one file that
         * exists to not know it. A category with sections renders them; a
         * category without renders its rail. Same template, no branch on a
         * name.
         *
         * It reuses the PRODUCT section union rather than defining a second
         * one. `split` here is the same block, drawn the same way, from the
         * same fields — and sharing it means a category page cannot drift into
         * a parallel vocabulary that looks identical and behaves differently.
         */
        sections: z.array(section(image)).default([]),

        /** The wide "range header" shot: the whole category in one picture. */
        rangeImage: picture(image).optional(),
        /** The photograph behind a CategoryCard. */
        cardImage: picture(image).optional(),
        /**
         * THE 240px SQUARE on a cross-link card, and a different crop from
         * `cardImage` rather than the same file at another size.
         *
         * `cardImage` is a 5:6 portrait shot to sit behind a whole home-page
         * card with text over it. The cross-link card draws a 1:1 thumb flush
         * to its left edge (Figma 1275:3343), and squaring the portrait takes a
         * band out of the middle of the product — the same argument `images.hero`
         * makes against reusing `images.main`. Optional, and the adapter falls
         * back to `cardImage`, so a category without a square still renders.
         */
        cardThumb: picture(image).optional(),
      })
      .strict()
      .superRefine(checkDescription('categories')),
});

/**
 * PAGES: the site's own pages, and any page the client adds (WORKLOG 183).
 *
 * `route` names one of the five pages the site was built with: home, about,
 * contact, products (the products index) and 404. Each has its own template
 * under src/pages/ that draws its layout and reads its words from here.
 * Exactly one entry per route.
 *
 * Page-level fields (title, description, heading) are fields; the bands under
 * the heading are `sections`, in order, like a product page.
 */
const ROUTES = ['home', 'about', 'contact', 'products', '404'] as const;

/** Which section types each built-in page draws. */
const PAGE_SECTIONS_BY_ROUTE: Record<(typeof ROUTES)[number], readonly string[]> = {
  home: ['categories', 'testimonial', 'closing'],
  about: ['prose'],
  contact: ['contact-form'],
  products: ['catalogue', 'closing'],
  '404': [],
};

const pageSchema = ({ image }: { image: () => z.ZodType<ImageMetadata> }) =>
    z
      .object({
        /** Which built-in page this is. Do not change it. */
        route: z.enum(ROUTES),
        /** The <title> in the browser tab and the headline of a search result. */
        title: z.string(),
        /** The search-result snippet. 50 to 160 characters. */
        description: z.string(),
        /**
         * The page's short name: the last step of its breadcrumb, and its name
         * in llms.txt unless `listing` says otherwise. "About", "Contact".
         */
        label: z.string(),
        /** The page's H1. */
        heading: z.string(),
        /** The paragraph under the H1, where the page has one. */
        lede: z.string().optional(),
        /** Buttons under the hero, in order. At most two. */
        actions: z.array(z.object({ label: z.string(), href: z.string() }).strict()).max(2).default([]),
        /** The page's main picture, where it has one. */
        image: picture(image).optional(),
        /**
         * How the page is listed in llms.txt's "Company" section. Leave it out
         * to list the page under its `label` with its `description`; `false`
         * leaves it out. `order` sorts the list (lower first).
         */
        listing: z
          .union([
            z.literal(false),
            z.object({ label: z.string(), note: z.string(), order: z.number().int() }).strict(),
          ])
          .optional(),
        sections: z.array(pageSection(image)).default([]),
      })
      .strict()
      .superRefine((page, ctx) => {
        const where = page.route;
        const allowed = PAGE_SECTIONS_BY_ROUTE[page.route];
        page.sections.forEach((section, index) => {
          if (!allowed.includes(section.type)) {
            ctx.addIssue({
              code: 'custom',
              path: ['sections', index, 'type'],
              message: `page "${where}" cannot use a "${section.type}" section. It can use: ${allowed.join(', ') || 'none'}. A new kind of section is a developer change.`,
            });
          }
        });
        if (page.route === 'contact' && page.sections.filter((s) => s.type === 'contact-form').length !== 1) {
          ctx.addIssue({
            code: 'custom',
            path: ['sections'],
            message: 'the contact page needs exactly one "contact-form" section: without it the page has no form.',
          });
        }
        const cap = (field: 'heading' | 'lede', max: number) => {
          const value = page[field];
          if (value && value.length > max) {
            ctx.addIssue({
              code: 'custom',
              path: [field],
              message: `page "${where}": ${field} is ${value.length} characters; the layout is drawn for at most ${max} (LENGTH_CAPS in src/schema/sections.ts).`,
            });
          }
        };
        if (page.route === 'home') {
          cap('heading', LENGTH_CAPS.homeHeading);
          cap('lede', LENGTH_CAPS.homeLede);
        }
        if (page.route === 'about') cap('heading', LENGTH_CAPS.aboutHeading);
        checkDescription('pages')({ slug: where, description: page.description }, ctx);
      });

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: pageSchema,
});

/**
 * SITE: the words every page shares (WORKLOG 183). One entry,
 * src/content/site/site.md.

 */
const siteSchema = ({ image }: { image: () => z.ZodType<ImageMetadata> }) =>
    z
      .object({
        /** What CentiPack is, in one sentence. Used in structured data and at the top of llms.txt. */
        description: z.string(),
        /** The published enquiry address: the footer, the contact page, structured data, llms.txt. */
        email: z.email(),
        labels: z
          .object({
            /** The first step of every breadcrumb. */
            home: z.string(),
            /** The products menu, and the breadcrumb step for the products index. */
            products: z.string(),
            /** The quote button in the header (and in the phone menu). */
            getQuote: z.string(),
          })
          .strict(),
        footer: z
          .object({
            /** After "© <year> CentiPack." */
            rights: z.string(),
          })
          .strict(),
        /** The band at the foot of most pages: a heading, a line, the quote button and a picture. */
        closingBand: z
          .object({
            heading: z.string(),
            body: z.string(),
            actionLabel: z.string(),
            /** Decorative: the heading says what it is, so `alt` stays "". */
            image: picture(image),
          })
          .strict(),
        /** "The rest of the build": the cross-links at the foot of each category page. */
        crossLinks: z.object({ eyebrow: z.string(), body: z.string() }).strict(),
      })
      .strict();

const site = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/site' }),
  schema: siteSchema,
});


export const collections = { products, categories, pages, site };

/**
 * The section union as ZOD infers it, exported for the adapter.
 *
 * NOT `CollectionEntry<'products'>['data']['sections'][number]`, which is what
 * this was and which resolved to `any`: Astro's generated entry types flatten a
 * schema this deep, so the adapter's switch narrowed nothing and `astro check`
 * reported three "implicitly has an 'any' type" errors rather than one useful
 * one. Inferring straight from the schema object keeps the discriminated union
 * intact, which is the whole reason it is a discriminated union.
 *
 * `ReturnType<typeof section>` because `section` is a factory over Astro's
 * `image()` helper; the argument does not affect the shape, only the type of
 * the `src` inside a picture, which the adapter hands straight to `getImage`.
 */
export type ProductSectionInput = z.infer<ReturnType<typeof section>>;

/** A page section as zod infers it, for the pages adapter (same reasoning as above). */
export type PageSectionInput = z.infer<ReturnType<typeof pageSection>>;

/*
 * THE ENTRY TYPES, inferred from the schemas for the adapter (src/lib/site.ts). Astro's generated `CollectionEntry` data types
 * flatten to `any` for these schemas, as noted above `ProductSectionInput`, so
 * reading them off the zod objects is the only way the adapters get checked.
 */
export type PageData = z.infer<ReturnType<typeof pageSchema>>;
export type SiteData = z.infer<ReturnType<typeof siteSchema>>;
