import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
/* Imported from zod directly: astro:content's `z` re-export is deprecated as of
   Astro 7, and a deprecated import is a migration someone else has to do later. */
import { z } from 'zod';

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
 * A picture and the sentence that replaces it for anyone who cannot see it.
 * Non-null alt is required by the SCHEMA, not by review (§7).
 *
 * NOTHING IS FILLED YET, ON PURPOSE. The client's own image plan (Figma
 * 676:6358) is three slots per product and most of them have no photograph
 * taken; the design draws a labelled "[ image pending ]" box for exactly that
 * state. So every image field here is optional and `Media` renders the pending
 * box when one is absent — see src/components/blocks/Media.astro, which also
 * records how that box gets removed.
 */
const picture = (image: () => z.ZodType) =>
  z.object({ src: image(), alt: z.string() });

const products = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/products' }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string(),
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

        /** The wide "range header" shot: the whole category in one picture. */
        rangeImage: picture(image).optional(),
        /** The photograph behind a CategoryCard. */
        cardImage: picture(image).optional(),
      })
      .strict(),
});

export const collections = { products, categories };
