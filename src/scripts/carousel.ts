/**
 * The carousel — a looping, draggable, centre-snapping track (§6).
 *
 * THE SCROLLING IS STILL THE PLATFORM'S, which is the ruling rail.ts set and
 * the reason this is ~1 KB rather than Swiper's ~15. The track is a native
 * scroll-snap row: momentum, rubber-banding, trackpad, touch, the keyboard
 * arrows and `scroll-behavior` all arrive free and correct, and nothing here
 * reimplements any of them. What this module adds is the three things the
 * platform has no concept of —
 *
 *   1. THE LOOP. The slides are cloned once before and once after the real
 *      set, and the scroll position is kept inside the middle copy: cross a
 *      boundary and it jumps exactly one set width, onto identical pixels, so
 *      the seam cannot be seen. That is the whole trick, and it is why there
 *      is always a card bleeding in on both sides — the thing the design draws
 *      and a plain scroller cannot do.
 *
 *      Clones are `aria-hidden` and untabbable. A screen reader hears eight
 *      options once, not twenty-four.
 *
 *   2. THE DRAG. Touch already drags, natively and better than script can; a
 *      MOUSE does not, and on a wide screen that is how most people will try.
 *      So pointer events move `scrollLeft` directly and then hand back to the
 *      browser, rather than animating a transform and owning the physics.
 *      Snapping is switched off for the duration — mandatory snap fights a
 *      drag it did not start — and switched back on at the end, with one
 *      smooth scroll onto the nearest slide.
 *
 *   3. WHICH SLIDE IS CENTRED, which the browser does not expose and the
 *      design sizes to. One class; the scale, the origin and the transition
 *      are all CSS.
 *
 * IT OPENS ON THE SECOND SLIDE, so the first is already peeking on the left
 * and three cards are in view. With no JavaScript the track simply starts at
 * slide one with the class the HTML gives it — correct, just not looping.
 */
const tracks = Array.from(document.querySelectorAll<HTMLElement>('[data-carousel]'));

for (const track of tracks) {
  const originals = Array.from(track.querySelectorAll<HTMLElement>('.carousel-slide'));
  if (originals.length < 2) continue;

  /** A clone set, inert to assistive tech and to the tab order. */
  const copies = (where: 'prepend' | 'append'): void => {
    const batch = document.createDocumentFragment();
    for (const slide of originals) {
      const copy = slide.cloneNode(true) as HTMLElement;
      copy.setAttribute('aria-hidden', 'true');
      copy.classList.remove('is-active');
      for (const node of copy.querySelectorAll('a, button, input, [tabindex]')) {
        node.setAttribute('tabindex', '-1');
      }
      batch.append(copy);
    }
    track[where](batch);
  };
  copies('append');
  copies('prepend');

  const slides = Array.from(track.querySelectorAll<HTMLElement>('.carousel-slide'));
  const count = originals.length;

  /** How far one full set runs — the distance every loop jump moves. */
  const step = (): number => slides[count].offsetLeft - slides[0].offsetLeft;

  /** The scroll position that puts a slide in the middle of the track. */
  const centreOf = (slide: HTMLElement): number =>
    slide.offsetLeft - (track.clientWidth - slide.offsetWidth) / 2;

  /** The slide nearest the centre right now. */
  const nearest = (): HTMLElement => {
    const middle = track.getBoundingClientRect().left + track.clientWidth / 2;
    let best = slides[0];
    let shortest = Infinity;
    for (const slide of slides) {
      const box = slide.getBoundingClientRect();
      const gap = Math.abs(box.left + box.width / 2 - middle);
      if (gap < shortest) {
        shortest = gap;
        best = slide;
      }
    }
    return best;
  };

  const mark = (): void => {
    const active = nearest();
    for (const slide of slides) slide.classList.toggle('is-active', slide === active);
  };

  /* Open on the SECOND real slide, which is the first of the middle set plus
     one: the first card then sits to its left and three are in view. */
  track.scrollLeft = centreOf(slides[count + 1]);
  mark();

  /* THE SEAM. Stay inside the middle set; crossing either way moves exactly
     one set width onto identical content. Assigning `scrollLeft` is instant —
     `scroll-behavior` is not inherited, and the track never sets it — so the
     jump cannot animate and cannot be seen. */
  let dragging = false;
  const wrap = (): void => {
    const run = step();
    if (track.scrollLeft < run * 0.5) track.scrollLeft += run;
    else if (track.scrollLeft > run * 1.5) track.scrollLeft -= run;
  };

  track.addEventListener(
    'scroll',
    () => {
      if (!dragging) wrap();
      mark();
    },
    { passive: true },
  );

  /* THE DRAG, for pointers that do not already have one. Touch scrolls
     natively and is left alone; taking it over would replace working inertia
     with worse inertia. */
  let from = 0;
  let at = 0;

  track.addEventListener('pointerdown', (event: PointerEvent) => {
    if (event.pointerType === 'touch' || event.button !== 0) return;
    dragging = true;
    from = event.clientX;
    at = track.scrollLeft;
    track.style.scrollSnapType = 'none';
    track.classList.add('is-dragging');
    track.setPointerCapture(event.pointerId);
  });

  track.addEventListener('pointermove', (event: PointerEvent) => {
    if (!dragging) return;
    event.preventDefault();
    track.scrollLeft = at - (event.clientX - from);
  });

  const release = (): void => {
    if (!dragging) return;
    dragging = false;
    track.classList.remove('is-dragging');
    track.style.scrollSnapType = '';
    wrap();
    /* Snapping is back on, but it only acts on a scroll it can see. One smooth
       scroll onto the nearest card is what makes letting go feel like a
       decision rather than a stop. */
    track.scrollTo({ left: centreOf(nearest()), behavior: 'smooth' });
  };

  track.addEventListener('pointerup', release);
  track.addEventListener('pointercancel', release);

  /* Widths are read from layout, so a resize invalidates the seam arithmetic
     and the resting position both. Re-centre on whatever was centred. */
  let settle: number;
  window.addEventListener('resize', () => {
    clearTimeout(settle);
    settle = window.setTimeout(() => {
      track.scrollLeft = centreOf(nearest());
      mark();
    }, 150);
  });
}
