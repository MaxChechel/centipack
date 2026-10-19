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
  /* THE SETUP FROM LENIS'S OWN README, defaults and all. The absence of a
     `duration` is the setting: passing one switches Lenis out of its default
     lerp mode into a fixed-length tween, so every wheel tick takes the same
     time regardless of distance, which is what felt slow and heavy.
     `syncTouch` is already false by default and stays that way — touch keeps
     the platform's own physics. */
  const lenis = new Lenis();

  /* The documented rAF loop, written out rather than delegated to `autoRaf`.
     Same work, and it is the shape every Lenis integration note is written
     against, so the next person comparing this against the docs sees what
     they expect.

     THE README'S OTHER HALF IS THE GSAP ScrollTrigger BRIDGE —
     `lenis.on('scroll', ScrollTrigger.update)` — and it does not apply here:
     there is no GSAP on this site, and ScrollTrigger needs that line only
     because it caches scroll positions of its own. What this site reveals
     with is IntersectionObserver, and Lenis in its default window mode
     performs a REAL scroll rather than transforming a wrapper, so the
     observers fire off the genuine scroll position with nothing to keep in
     step. Verified rather than assumed — see the WORKLOG. */
  const frame = (time: number): void => {
    lenis.raf(time);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);

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
