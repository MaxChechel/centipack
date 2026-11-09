import { z } from 'zod';

/**
 * THE SECTION VOCABULARY, in its own module (editing addendum A5).
 *
 * Moved out of content.config.ts with no change to any member: the text of each
 * branch below is what the config held. What changed is the grouping. The union
 * is now BASE plus PROJECT:
 *
 *   - BASE sections are generic: a split row, a feature grid, an FAQ, a numbered
 *     list, media cards, a carousel. Nothing in them is about CentiPack, and
 *     they are what the outredge-system template ships to every project.
 *   - PROJECT sections are this site's own: the how-it-works steps (with an R2
 *     video), the spec sheet and the format cards. A project extends the base
 *     set with these; it never edits the base set to get them.
 *
 * The client's Claude composes pages from these and never adds to them. A page
 * that needs a section type that is not here is a developer change.
 *
 * The icon enum lives here because the `features` branch uses it;
 * scripts/verify/contracts.mjs reads it from this file.
 */

type ImageFn = () => z.ZodType<ImageMetadata>;

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
export const picture = (image: () => z.ZodType<ImageMetadata>) =>
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
export const ICON = z.enum([
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
export const slot = (image: () => z.ZodType<ImageMetadata>) =>
  z
    .object({
      label: z.string(),
      picture: picture(image).optional(),
    })
    .strict();

/* "How it works" — a heading and numbered steps on the left, a picture on
   the right. The steps are a real ordered sequence, so the template renders
   an <ol>; the design's numerals come from CSS counters, not from content. */
const stepsSection = (image: ImageFn) =>
  z
    .object({
      type: z.literal('steps'),
      heading: z.string(),
      steps: z.array(z.object({ title: z.string(), body: z.string() }).strict()).min(1),
      image: slot(image).optional(),
      /* A looping clip in place of the image. `src` is the file's base name
         under VIDEO_BASE (src/lib/media.ts) and under src/assets/posters/;
         `aspect` is the video's own ratio, because a remote file cannot be
         measured at build time. */
      video: z
        .object({
          src: z.string(),
          label: z.string(),
          aspect: z.string().regex(/^\d+ ?\/ ?\d+$/),
        })
        .strict()
        .optional(),
    })
    .strict()
    .refine((s) => Boolean(s.image) !== Boolean(s.video), {
      message: 'A steps section needs exactly one of `image` or `video`.',
    });

/* "Why choose …" / "Construction" — an icon grid. The design draws four
   across and then three or four across; the template lets the grid wrap
   rather than storing a row structure, because a row is a layout fact and
   this is content (§4.4). */
const featuresSection = (_image: ImageFn) =>
  z
    .object({
      type: z.literal('features'),
      heading: z.string(),
      features: z
        .array(z.object({ icon: ICON, title: z.string(), body: z.string() }).strict())
        .min(1),
    })
    .strict();

/* "Sizes and specifications" — a two-column specification sheet beside a
   dimension drawing, with an intro above and a qualifying note below.
   `columns` is a tuple because the sheet is exactly two columns wide: the
   thing and its options. A sheet with three would be a different block. */
const specsSection = (image: ImageFn) =>
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
    .strict();

/* "Tailored pack-outs" / "Brand your box" — copy one side, picture the
   other. `imageSide` because the design alternates them down the page, and
   which side a picture sits on is the one layout decision this section
   genuinely owns. */
const splitSection = (image: ImageFn) =>
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
    .strict();

/* "Applications" / "Nationwide cold storage" / "Custom & private-label" —
   a heading and an optional paragraph on the left, a numbered list on the
   right. `body` on an item is optional because two of the three instances
   are titles alone. */
const numberedSection = (_image: ImageFn) =>
  z
    .object({
      type: z.literal('numbered'),
      heading: z.string(),
      body: z.string().optional(),
      items: z.array(z.object({ title: z.string(), body: z.string().optional() }).strict()).min(1),
    })
    .strict();

/* "Which liner is right for you?" — full-width rows, each a picture and a
   short pitch. Thermal liners only, today. */
const cardsSection = (image: ImageFn) =>
  z
    .object({
      type: z.literal('cards'),
      heading: z.string(),
      cards: z
        .array(z.object({ title: z.string(), body: z.string(), image: slot(image) }).strict())
        .min(1),
    })
    .strict();

/* "Available formats & sizes" — a card per format, each listing its sizes
   as chips. Gel packs only, today. */
const formatsSection = (_image: ImageFn) =>
  z
    .object({
      type: z.literal('formats'),
      heading: z.string(),
      cards: z
        .array(z.object({ title: z.string(), sizes: z.array(z.string()).min(1) }).strict())
        .min(1),
    })
    .strict();

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
/* "Everything you can customize" — one card at a time, centred, with its
   neighbours showing at both edges (Figma 1268:24141).

   A LIST, NOT A GRID, AND THE DIFFERENCE IS THE CONTENT'S. The eight cards
   are a catalogue of options a buyer reads through — box style, closures,
   finish, board, two coatings, inserts, branding — not a ranked set where
   the first three matter most. A grid would publish seven of them below the
   fold and imply the top row is the important one; the carousel gives each
   the same card and the same turn.

   `slides` is `.min(2)` because one slide is not a carousel: it is a card
   that has grown a scroller, a snap axis and a pair of buttons that cannot
   do anything. The component renders a plain card at one slide, and this
   floor keeps content from asking it to. */
const carouselSection = (image: ImageFn) =>
  z
    .object({
      type: z.literal('carousel'),
      heading: z.string(),
      lede: z.string().optional(),
      slides: z
        .array(
          z
            .object({ title: z.string(), body: z.string(), image: slot(image) })
            .strict(),
        )
        .min(2),
    })
    .strict();

const faqSection = (_image: ImageFn) =>
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
    .strict();

/** Generic sections: the template's base set. */
export const baseSections = (image: ImageFn) =>
  [splitSection(image), featuresSection(image), numberedSection(image), cardsSection(image), carouselSection(image), faqSection(image)] as const;

/** CentiPack's own sections, on top of the base set. */
export const projectSections = (image: ImageFn) =>
  [stepsSection(image), specsSection(image), formatsSection(image)] as const;

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
export const section = (image: ImageFn) =>
  z.discriminatedUnion('type', [...baseSections(image), ...projectSections(image)]);

