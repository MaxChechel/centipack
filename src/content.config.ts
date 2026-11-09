import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
/* Imported from zod directly: astro:content's `z` re-export is deprecated as of
   Astro 7, and a deprecated import is a migration someone else has to do later. */
import { z } from 'zod';
import { picture, section } from './schema/sections';

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
      .strict(),
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
      .strict(),
});

export const collections = { products, categories };

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
