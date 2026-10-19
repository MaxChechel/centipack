/**
 * Lenis smooth scroll (§6, §12.3, §12.4).
 *
 * THE LARGEST SCRIPT ON THIS SITE, and it is here because it was asked for by
 * name rather than because the platform fell short. That is worth stating
 * plainly: native scrolling is correct, interruptible, accessible and free,
 * and this replaces its feel with an eased one. The census entry carries the
 * measurement; this note carries the reason.
 *
 * WHAT IT DOES NOT TOUCH:
 *
 *   - REDUCED MOTION. It never starts. Smoothing a scroll is adding motion to
 *     a gesture the reader controls, which is exactly what §12.3 says not to
 *     do. Not slowed, not shortened — never constructed, so there is nothing
 *     to run and nothing to leak.
 *   - TOUCH. `syncTouch` stays off (its default), so a finger scrolls the page
 *     natively with the platform's own physics. Lenis drives the wheel and
 *     keys only. Phone scrolling is the thing most easily made worse by a
 *     library, and the cheapest way to not make it worse is to not touch it.
 *   - THE HORIZONTAL SCROLLERS. The carousel and the product rail are native
 *     scroll-snap regions; `data-lenis-prevent` on each keeps the wheel over
 *     them doing what the browser intends instead of being hoisted into the
 *     page scroll.
 *
 * IT REPLACES `scroll-behavior: smooth` RATHER THAN STACKING ON IT. Lenis adds
 * `.lenis` to <html>, and the stylesheet turns the CSS smoothing off under
 * that class — two smoothing systems on one scroll fight, and the visible
 * result is an anchor jump that eases, stops, and eases again.
 */
import Lenis from 'lenis';

if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const lenis = new Lenis({
    /* LENIS'S OWN DEFAULTS, and the absence of `duration` is the setting.
       Passing a duration switches Lenis out of its default lerp mode and into
       a fixed-length tween: every wheel tick then takes the same time to play
       out regardless of how far it is going, which is what made it feel slow
       and heavy. The default lerp follows the wheel instead of scheduling
       against it. `syncTouch` is already false by default and is left that
       way — touch keeps the platform's own physics. */
    autoRaf: true,
  });

  /* Anchors — the skip link above all. Lenis owns the scroll position, so a
     native hash jump would move the document underneath it and leave the two
     disagreeing about where the page is. */
  document.addEventListener('click', (event) => {
    const link = (event.target as Element | null)?.closest?.('a[href^="#"]');
    if (!link) return;
    const id = link.getAttribute('href')?.slice(1);
    const target = id && document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    lenis.scrollTo(target, { offset: 0 });
    /* The scroll is the easy half. Focus is the half that matters: a skip link
       that moves the viewport without moving focus has not skipped anything
       for the person using it. */
    target.setAttribute('tabindex', '-1');
    (target as HTMLElement).focus({ preventScroll: true });
  });
}
