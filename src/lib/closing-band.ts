import { getImage } from 'astro:assets';
import image from '../assets/shared/cta-produced-at-volume.jpg';

/**
 * The closing band, in one place (§5's "one source per list", applied to copy).
 *
 * Five page types end on the same picture and the same three sentences. Typing
 * them into five templates is how one of them ends up a revision behind — and
 * the picture would be resolved five times for one asset.
 *
 * It lives in `lib/` rather than in a collection because it is not repeating
 * CONTENT: there is exactly one of it, it is not editable per page, and a
 * collection of one row is a table pretending to be a constant. If the client
 * ever wants a different closing band per category, that is the moment it
 * becomes a collection — and this function is the only thing that changes.
 */
export async function closingBand() {
  const rendered = await getImage({ src: image, format: 'webp', width: 2400 });

  return {
    heading: 'Produced at volume. Sold direct. Nobody in between.',
    /* NO BODY, ON ANY PAGE. This shipped with a paragraph on the category and
       product pages and without one on the products index, on the reading that a
       page arrived at from a narrower context wants the extra sentence. Ruled
       the other way in review: the band is a heading and a button everywhere it
       appears. The `body` prop went with it — CtaPlate self-skips on content, so
       there is nothing left for it to skip. */
    action: { label: 'Contact us', href: '/contact' },
    image: {
      src: rendered.src,
      width: Number(rendered.attributes.width),
      height: Number(rendered.attributes.height),
      /* Decorative: the heading beside it says what it is, and naming three
         packaging formats here would be three interruptions before the button. */
      alt: '',
    },
    imageLabel: 'Closing band — mailers, a corrugated outer and an EPS cooler',
  };
}
