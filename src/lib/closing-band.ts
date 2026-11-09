import { getSite } from './site';
import { SITE } from '../consts';

/**
 * The closing band, in one place (§5's "one source per list", applied to copy).
 *
 * Every page type that has one ends on the same picture and the same three
 * sentences. The WORDS AND THE PICTURE are content now (`closingBand` in
 * src/content/site/site.md), so the client can change them without a developer;
 * this function shapes them for CtaPlate and adds the two things that are not
 * content: where the button goes, and the label the pending-image box would show.
 *
 * Copy history is in WORKLOG 33, 35 and 45: the body sentence has been on, off
 * and on again, and the heading deliberately ends without a full stop.
 *
 * A PORTRAIT CROP of the picture can be added as `mobile:` beside `src:` in the
 * site entry; Media renders <picture> the moment it exists.
 */
export async function closingBand() {
  const { closingBand: band } = await getSite();
  return {
    heading: band.heading,
    body: band.body,
    action: { label: band.actionLabel, href: SITE.contactHref },
    image: band.image,
    imageLabel: 'Closing band — a gel pack, stand-up mailers and an EPS cooler in its outer',
  };
}
