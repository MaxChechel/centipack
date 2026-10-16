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
const picture = (image: () => z.ZodType<ImageMetadata>) =>
  z.object({
    src: image(),
    alt: z.string(),
    /**
     * OPTIONAL SECOND FILE, for art direction — a different framing of the same
     * subject shot for a portrait screen, not the desktop file rescaled. One
     * `alt` covers both: it is the same subject, and a second description is a
     * second thing to keep in sync. Absent means the desktop file serves every
     * width, which is true of everything not yet reshot.
     */
    mobile: image().optional(),
  });

/**
 * THE ICONS THE v1 PRODUCT PAGES DRAW, as a closed set.
 *
 * Every one is a lucide mark, named here exactly as the design names its layer
 * (`lucide/package` → `package`). An enum rather than a free string because an
 * icon name that does not exist renders NOTHING — a silent hole in a feature
 * grid — and a typo should fail the build with the bad name printed instead.
 * The paths themselves live in `src/components/atoms/Icon.astro`; this list and
 * that map are asserted to agree by the build contracts.
 */
const ICON = z.enum([
  'box',
  'droplets',
  'expand',
  'feather',
  'layers',
  'leaf',
  'lock-keyhole',
  'package',
  'repeat',
  'shield',
  'sparkles',
  'target',
  'thermometer-snowflake',
  'truck',
  'zap',
]);

/**
 * AN IMAGE SLOT ON A PRODUCT PAGE, which is a picture AND the brief for it.
 *
 * The v1 product pages are drawn with nineteen photographic slots between them
 * and not one of the photographs exists — the design fills each one with the
 * instruction for the shot ("IMAGE: short demonstration video, pull tab clearly
 * visible, transition from compressed to expanded"). That instruction is
 * CONTENT, not a comment: it is what `Media` prints inside the pending box, so
 * the client reviewing the page reads the brief for the picture that is
 * missing rather than looking at an unlabelled grey rectangle.
 *
 * `label` is therefore required and `picture` is optional, which is the exact
 * inverse of how an image field is usually shaped — and it is the honest shape
 * here, because today every one of these slots is a brief and none is a photo.
 */
const slot = (image: () => z.ZodType<ImageMetadata>) =>
  z
    .object({
      label: z.string(),
      picture: picture(image).optional(),
    })
    .strict();

/**
 * A PRODUCT PAGE IS AN ORDERED LIST OF TYPED SECTIONS (§5).
 *
 * The five v1 product pages share a vocabulary but not a skeleton: PuncturePack
 * runs hero → how it works → why choose → sizes → packouts → branding →
 * applications → FAQ; gel packs runs hero → network → construction → formats →
 * custom options and has no FAQ at all; thermal liners opens with a liner
 * chooser nothing else has. Eight section types, five different orders.
 *
 * SO THE ORDER IS DATA, NOT TEMPLATE. The alternative is a template carrying
 * eight optional fields and a hardcoded sequence, which gets the first four
 * pages right and then has to grow a `sectionOrder` array for the fifth — at
 * which point the order is data anyway, expressed twice. One list of
 * discriminated-union members says what is on the page and in what order, and
 * the template is a `switch`.
 *
 * `discriminatedUnion` rather than a loose object: zod reports
 * "invalid_union_discriminator" with the list of valid types when `type` is
 * wrong, and type-checks only the branch that matches when it is right, so a
 * `features` section with a `steps` key is an error rather than silent extra
 * data. Every branch is `.strict()` for the same reason the collections are.
 */
const section = (image: () => z.ZodType<ImageMetadata>) =>
  z.discriminatedUnion('type', [
    /* "How it works" — a heading and numbered steps on the left, a picture on
       the right. The steps are a real ordered sequence, so the template renders
       an <ol>; the design's numerals come from CSS counters, not from content. */
    z
      .object({
        type: z.literal('steps'),
        heading: z.string(),
        steps: z.array(z.object({ title: z.string(), body: z.string() }).strict()).min(1),
        image: slot(image),
      })
      .strict(),

    /* "Why choose …" / "Construction" — an icon grid. The design draws four
       across and then three or four across; the template lets the grid wrap
       rather than storing a row structure, because a row is a layout fact and
       this is content (§4.4). */
    z
      .object({
        type: z.literal('features'),
        heading: z.string(),
        features: z
          .array(z.object({ icon: ICON, title: z.string(), body: z.string() }).strict())
          .min(1),
      })
      .strict(),

    /* "Sizes and specifications" — a two-column specification sheet beside a
       dimension drawing, with an intro above and a qualifying note below.
       `columns` is a tuple because the sheet is exactly two columns wide: the
       thing and its options. A sheet with three would be a different block. */
    z
      .object({
        type: z.literal('specs'),
        heading: z.string(),
        intro: z.string().optional(),
        note: z.string().optional(),
        columns: z.tuple([z.string(), z.string()]),
        rows: z.array(z.object({ label: z.string(), value: z.string() }).strict()).min(1),
        image: slot(image),
      })
      .strict(),

    /* "Tailored pack-outs" / "Brand your box" — copy one side, picture the
       other. `imageSide` because the design alternates them down the page, and
       which side a picture sits on is the one layout decision this section
       genuinely owns. */
    z
      .object({
        type: z.literal('split'),
        heading: z.string(),
        subheading: z.string().optional(),
        body: z.string(),
        note: z.string().optional(),
        action: z.object({ label: z.string(), href: z.string() }).strict().optional(),
        image: slot(image),
        imageSide: z.enum(['start', 'end']).default('end'),
      })
      .strict(),

    /* "Applications" / "Nationwide cold storage" / "Custom & private-label" —
       a heading and an optional paragraph on the left, a numbered list on the
       right. `body` on an item is optional because two of the three instances
       are titles alone. */
    z
      .object({
        type: z.literal('numbered'),
        heading: z.string(),
        body: z.string().optional(),
        items: z.array(z.object({ title: z.string(), body: z.string().optional() }).strict()).min(1),
      })
      .strict(),

    /* "Which liner is right for you?" — full-width rows, each a picture and a
       short pitch. Thermal liners only, today. */
    z
      .object({
        type: z.literal('cards'),
        heading: z.string(),
        cards: z
          .array(z.object({ title: z.string(), body: z.string(), image: slot(image) }).strict())
          .min(1),
      })
      .strict(),

    /* "Available formats & sizes" — a card per format, each listing its sizes
       as chips. Gel packs only, today. */
    z
      .object({
        type: z.literal('formats'),
        heading: z.string(),
        cards: z
          .array(z.object({ title: z.string(), sizes: z.array(z.string()).min(1) }).strict())
          .min(1),
      })
      .strict(),

    /*
     * FAQ — and `answer` DEFAULTS TO EMPTY, which is not a formality.
     *
     * The design first arrived with seven to ten questions per page and the
     * answer to exactly one of them: the first item expanded with its copy,
     * every other row collapsed with no answer text anywhere in the file. That
     * was true of all four FAQ instances, so the schema was built to carry a
     * question whose answer was still owed, and the adapter drops any item that
     * has one. The answers have since been written — all 34 of them — so
     * nothing is currently filtered.
     *
     * THE DEFAULT STAYS ANYWAY. It cost nothing, it is what let the pages ship
     * honestly while the copy was outstanding, and the next product's FAQ will
     * arrive the same way. The alternative — requiring an answer — would have
     * meant either holding the pages back or inventing claims about thermal
     * performance and disposal.
     */
    z
      .object({
        type: z.literal('faq'),
        heading: z.string(),
        items: z
          .array(
            z
              .object({ question: z.string(), answer: z.array(z.string()).default([]) })
              .strict(),
          )
          .min(1),
      })
      .strict(),
  ]);

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
         * WHAT ANOTHER CATEGORY'S CROSS-CARD SAYS **ON THIS PAGE**, keyed by
         * that category's slug. Absent means it says its own `crossBody`, which
         * is what all but one of the six cards do.
         *
         * A per-host override rather than a second field on the target, because
         * the v8 copy deck writes the difference that way: the cold chain page's
         * pharmacy card reads "Vial kits, bottles, dispensers and jars — what
         * the medication is dispensed in", and the custom boxes page's reads the
         * longer line. One record cannot hold both, and the deck is explicit
         * enough that guessing which page is stale is no longer the job
         * (WORKLOG 31, 33, 35).
         *
         * Keyed by the CATEGORY enum, so a slug that does not exist fails the
         * build with the bad key named rather than silently rendering the
         * default — the failure mode was run before this shipped (§9).
         *
         * `partialRecord`, not `record`: zod 4's `z.record(enum, …)` is
         * EXHAUSTIVE — it demanded all three slugs on a map that exists to name
         * one. Measured, not assumed; the build said
         * "crossBodyOverrides.custom-boxes: Required".
         */
        crossBodyOverrides: z.partialRecord(CATEGORY, z.string()).optional(),

        /** The wide "range header" shot: the whole category in one picture. */
        rangeImage: picture(image).optional(),
        /** The photograph behind a CategoryCard. */
        cardImage: picture(image).optional(),
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
