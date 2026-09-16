/**
 * The product rail — a native scroll-snap row, and the two things it needs a
 * script for (§6).
 *
 * THE SCROLLING ITSELF IS NOT HERE, AND THAT IS THE POINT. The rail is
 * `overflow-x: auto` with snap points: momentum, rubber-banding, trackpad and
 * touch gestures, `scroll-behavior`, keyboard arrows and every platform
 * convention come from the browser, free and correct. What the browser does not
 * give is a pagination indicator, and that is all this module computes.
 *
 * WHY NOT A SLIDER LIBRARY. Swiper was considered and rejected on measurement:
 * its pagination build is roughly 15 KB gzipped and the full bundle over 40 KB,
 * against 2 KB of JavaScript for this entire site. That is 7× to 20× the whole
 * budget to replace a scroller the platform already ships — and replacing it
 * means re-implementing touch physics, focus management and screen-reader
 * announcement that currently cost nothing and cannot regress. The ruling and
 * the numbers are in WORKLOG; if a future slider genuinely needs coverflow or
 * synchronised pairs, that is the moment to reopen it.
 *
 * Two jobs:
 *
 *   1. THE PROGRESS BAR. Thumb width is the visible fraction, thumb offset is
 *      the scroll fraction — the same arithmetic a scrollbar does, drawn in the
 *      page's own tokens. It ships `hidden` in the markup and is revealed only
 *      where the rail actually overflows, so no-JS gets a rail with no bar
 *      rather than a bar that lies about where you are.
 *
 *   2. THE TAB STOP. `tabindex="0"` is in the HTML because a scrollable region
 *      that cannot be reached by keyboard fails WCAG 2.1.1, and that has to be
 *      true before this runs and forever if it never does. At desktop the same
 *      rail does not scroll and the stop is not earned, so it is removed there.
 *
 * One module for every rail on the page, delegating through one scroll listener
 * per rail and one shared resize pass — not a script per instance.
 */
type Rail = HTMLElement & { dataset: { rail?: string } };

const rails = Array.from(document.querySelectorAll<Rail>('[data-rail]'));

function draw(rail: Rail): void {
  const bar = rail.parentElement?.querySelector<HTMLElement>('[data-rail-progress]');
  const overflow = rail.scrollWidth - rail.clientWidth;

  /* ASK WHETHER IT CAN SCROLL, NOT WHETHER IT OVERFLOWS. Measured: at 1440 the
     five-column track reports scrollWidth 1350 against clientWidth 1344 — six
     pixels of pure rounding, because `scrollWidth` is an integer and five
     columns of 259.2px each round up. An overflow test alone therefore called
     the desktop grid scrollable and left a tab stop on it.
     `overflow-x: visible` is the ground truth: an element with it cannot scroll
     no matter what its content extent says. */
  const scrollable = getComputedStyle(rail).overflowX !== 'visible';
  const scrolls = scrollable && overflow > 1;

  rail.tabIndex = scrolls ? 0 : -1;
  if (scrolls) rail.setAttribute('aria-label', rail.dataset.rail ?? 'Products');
  else rail.removeAttribute('aria-label');

  if (!bar) return;
  bar.hidden = !scrolls;
  if (!scrolls) return;

  const visible = rail.clientWidth / rail.scrollWidth;
  const progress = rail.scrollLeft / overflow;
  bar.style.setProperty('--rail-thumb', `${visible * 100}%`);
  /* Expressed in the THUMB's own width: a percentage translate resolves against
     the element being translated, not against its container. Travel is
     (1 - visible) of the track, which is (1 - visible) / visible of the thumb. */
  bar.style.setProperty('--rail-at', `${(progress * (1 - visible) * 100) / visible}%`);
}

let queued = false;
function schedule(): void {
  if (queued) return;
  queued = true;
  requestAnimationFrame(() => {
    queued = false;
    for (const rail of rails) draw(rail);
  });
}

for (const rail of rails) {
  rail.addEventListener('scroll', schedule, { passive: true });
  draw(rail);
}

window.addEventListener('resize', schedule, { passive: true });
