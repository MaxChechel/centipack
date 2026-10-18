/**
 * The carousel — which slide is centred, and nothing else (§6).
 *
 * THE SCROLLING IS NOT HERE, FOR THE SAME REASON IT IS NOT IN rail.ts. The
 * track is a native scroll-snap row: momentum, rubber-banding, trackpad and
 * touch gestures, `scroll-behavior` and the keyboard arrows all come from the
 * browser, free and correct. Swiper was measured and rejected for the rail at
 * ~15 KB gzipped against 2 KB for this whole site; a second carousel is not a
 * reason to reopen that, it is a second reason not to.
 *
 * WHAT THE BROWSER DOES NOT EXPOSE is which snap target is currently resting
 * at the centre, and the design sizes the centred card differently from its
 * neighbours. So that is the whole module: find the slide whose centre is
 * nearest the track's centre and move one class onto it. Everything the class
 * does — the scale, the transform origin, the transition — is CSS.
 *
 * IntersectionObserver RATHER THAN A SCROLL LISTENER. A scroll handler runs on
 * every frame of a flick and has to measure all eight slides each time; the
 * observer wakes only when a slide crosses the centre band and hands back the
 * ones that changed. The root margin collapses the viewport to a thin strip
 * down the middle of the track, so "intersecting" means "over the centre line".
 *
 * ONE OBSERVER PER TRACK, not one per slide, and the module does nothing at all
 * on a page with no carousel.
 */
const tracks = Array.from(document.querySelectorAll<HTMLElement>('[data-carousel]'));

for (const track of tracks) {
  const slides = Array.from(track.querySelectorAll<HTMLElement>('.carousel-slide'));
  if (slides.length < 2) continue;

  /**
   * Mark the slide nearest the centre, and only that one.
   *
   * The observer says WHICH slides are over the centre strip; during a scroll
   * two can be, so this still compares distances rather than taking the first.
   * Measured against the track's own box, not the viewport, so a page scrolled
   * halfway down a tall section answers the same as one at the top.
   */
  function mark(): void {
    const box = track.getBoundingClientRect();
    const middle = box.left + box.width / 2;

    let nearest = slides[0];
    let best = Infinity;
    for (const slide of slides) {
      const r = slide.getBoundingClientRect();
      const distance = Math.abs(r.left + r.width / 2 - middle);
      if (distance < best) {
        best = distance;
        nearest = slide;
      }
    }

    for (const slide of slides) slide.classList.toggle('is-active', slide === nearest);
  }

  const observer = new IntersectionObserver(mark, {
    root: track,
    /* A strip one pixel wide down the middle of the track: the left and right
       insets are 50% less half a pixel, so only what covers the centre line
       counts as intersecting. */
    rootMargin: '0px -50% 0px -50%',
    threshold: 0,
  });

  for (const slide of slides) observer.observe(slide);

  /* The observer fires on attach, but the first callback can land before the
     slides have their final width — a web font or an image can still be
     settling. One pass after layout, so the class starts where the design
     draws it. */
  mark();
}
