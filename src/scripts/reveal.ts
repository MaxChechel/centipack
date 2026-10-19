/**
 * Scroll reveal — the two things CSS cannot do for itself (§12.2, §6).
 *
 * THE MOTION IS NOT HERE. Opacity, transform, the curve, the duration and the
 * stagger step all live in global.css §8, as do every fallback. This module
 * does exactly two things CSS has no way to express: it COUNTS the revealable
 * elements in a container so each can be delayed by its position, and it says
 * WHEN a container has arrived. Both are facts about the document that a
 * stylesheet cannot compute.
 *
 * IT CANNOT HIDE ANYTHING, which is the safety property worth stating twice.
 * The hidden state belongs to `html.js [data-reveal-group]:not([data-reveal])`
 * — applied by the stylesheet, armed by the one-liner in <head>, before this
 * file is fetched. If this never loads, never parses, or throws on line one,
 * the failsafe below un-hides the page and every word is readable. There is no
 * path where failing here loses content.
 *
 * TWO TIMINGS, AND THE DIFFERENCE IS NOT COSMETIC. A hero is already on screen
 * when the page opens, so an intersection observer would never fire for it and
 * the band would sit blank until the reader scrolled away and back. Heroes
 * play on load. Everything below waits for its own arrival.
 *
 * FONTS FIRST, for the heroes only. A reveal that starts before the webfont
 * swaps animates the fallback and then jolts as the real face lands mid-flight.
 * `document.fonts.ready` settles even when a font fails, so it cannot hang —
 * and it is raced against a timeout anyway, because "cannot hang" is a claim
 * about an API and the failsafe is a claim about the page.
 */

/* THE ITEM LIST, duplicated from global.css §8 — see the note there. The
   stylesheet hides these; this counts them. They must stay in step, and the
   `reveal contract` check presses the result rather than trusting the pair. */
const ITEMS =
  'h1, h2, h3, h4, h5, p, li, figure, blockquote, .media-slot, .media-pending, a, button, ' +
  /* THE HORIZONTAL SCROLLERS ARRIVE AS ONE OBJECT. Listing them here means the
     outermost-match rule excludes everything inside them — a carousel whose
     eight slides each faded in separately would fight its own scroll position,
     and the slides already carry an inline transform the carousel owns. */
  '[data-carousel], [data-rail]';

const groups = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal-group]'));

if (groups.length) {
  /**
   * The elements that actually move, in reading order.
   *
   * OUTERMOST MATCH ONLY, mirroring the stylesheet's `:not(:is(…) *)`. A link
   * inside a paragraph arrives with the paragraph; a heading inside a card
   * arrives with the card. Indexing the inner one too would give it a second,
   * later delay and the card would visibly stutter as its own contents caught
   * up with it.
   */
  const itemsOf = (group: HTMLElement): HTMLElement[] =>
    Array.from(group.querySelectorAll<HTMLElement>(ITEMS)).filter(
      (el) => !el.parentElement?.closest(ITEMS) && !el.closest('.reveal-skip'),
    );

  for (const group of groups) {
    itemsOf(group).forEach((item, index) => {
      item.style.setProperty('--reveal-index', String(index));
    });
  }

  const arrive = (group: Element): void => group.setAttribute('data-reveal', 'in');

  /* Heroes: on load, once the type has settled. The race is the point — a font
     that never resolves must not leave the page blank. */
  const heroes = groups.filter((g) => g.getAttribute('data-reveal-on') === 'load');
  if (heroes.length) {
    Promise.race([
      document.fonts.ready,
      new Promise((resolve) => setTimeout(resolve, 600)),
    ]).then(() => {
      for (const hero of heroes) arrive(hero);
    });
  }

  /* Everything else: on arrival. `rootMargin` pulls the trigger line up from
     the bottom edge so a band starts moving as it comes into view rather than
     once it has already been read, and `threshold: 0` fires on the first pixel
     — a section taller than the viewport must not wait to be 10% visible,
     because on a short screen it never would be. */
  const watcher = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        arrive(entry.target);
        watcher.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -15% 0px', threshold: 0 },
  );

  for (const group of groups) {
    if (group.getAttribute('data-reveal-on') !== 'load') watcher.observe(group);
  }
}

/* THE FAILSAFE, and it is not decoration. Everything above can fail in ways
   this file cannot see — a font API that never settles, an observer that never
   fires, a browser that does not support one. The stylesheet has already
   hidden the content by the time any of that matters, so something has to be
   willing to give up. Three seconds after load, any group that has not arrived
   is shown. A reveal that never finishes is a page with holes in it. */
setTimeout(() => {
  for (const group of document.querySelectorAll('[data-reveal-group]:not([data-reveal])')) {
    group.setAttribute('data-reveal', 'in');
  }
}, 3000);
