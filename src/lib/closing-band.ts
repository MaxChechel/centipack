import { toPageImage } from './catalogue';
import image from '../assets/shared/cta-banner.avif';
/* PROJECT: drop the portrait-framed version of this shot in beside the wide one
   and import it here. Media renders <picture> the moment it exists; until then
   the wide file serves both widths, exactly as before. */
// import imageMobile from '../assets/shared/cta-banner-mobile.avif';

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
  const rendered = await toPageImage({
    src: image,
    // mobile: imageMobile,
    /* Decorative: the heading beside it says what it is, and naming three
       packaging formats here would be three interruptions before the button. */
    alt: '',
  });

  return {
    heading: 'Produced at scale.',
    /* THE BODY IS BACK, and the history is the point rather than an
       embarrassment: it shipped with a paragraph, was removed in review
       ("we don't have subtext for all instances"), and the reference screens
       show it on every product page again. Latest instruction wins; recorded so
       the next reversal is a decision rather than a discovery.
       THE SENTENCE ITSELF IS THE CLIENT'S NOW, supplied directly and replacing
       the deck's "Own manufacturing partners, no distributor markup — the best
       price for the spec. Tell us what you ship." It is longer and it promises
       a reply, which the old one did not (WORKLOG 45). The home page's closing
       band is a different block with its own copy and is untouched.

       FIVE TURNS ON, IT IS ON EVERY PAGE INCLUDING THE INDEX. Entry 33 took it
       off the index because the reference screen shows the band without it;
       the v8 copy deck then wrote the sentence out under the index's own
       "Produced at scale." A deck that states the copy outranks a screenshot it
       has to be inferred from, and one string serves all five page types again. */
    body:
      'Our own manufacturing partners, no distributor markup — the best price you will find ' +
      'for the spec. Tell us what you ship and we come back with a build and a number.',
    /* PREVIOUSLY: This shipped with a paragraph on the category and
       product pages and without one on the products index, on the reading that a
       page arrived at from a narrower context wants the extra sentence. Ruled
       the other way in review: the band is a heading and a button everywhere it
       appears. The `body` prop went with it — CtaPlate self-skips on content, so
       there is nothing left for it to skip. */
    action: { label: 'Contact us', href: '/contact' },
    image: rendered,
    imageLabel: 'Closing band — mailers, a corrugated outer and an EPS cooler',
  };
}
