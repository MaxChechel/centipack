/**
 * The carousel — a looping, draggable, centre-snapping track (§6).
 *
 * THE SCROLLING IS STILL THE PLATFORM'S, which is the ruling rail.ts set and
 * the reason this is ~1 KB rather than Swiper's ~15. The track is a native
 * scroll-snap row: momentum, rubber-banding, trackpad, touch and the keyboard
 * arrows all arrive free and correct, and nothing here reimplements them. What
 * this adds is the four things the platform has no concept of.
 *
 * WHY THE FIRST VERSION FELT CLUNKY, since the fix is the interesting part.
 * The guess was that the scroll handler was too slow — it read 24 bounding
 * boxes a frame. Measured: 0.03 ms a frame, against a 16.7 ms budget. Not
 * remotely the problem, and the rewrite that "optimised" it would have changed
 * nothing. What actually felt wrong was behaviour, in three places:
 *
 *   - THE SCALE SNAPPED. Slides were either 1 or 0.95 with a CSS transition
 *     between, so during a drag the sizes lagged the finger and then caught up
 *     in a lurch. Now scale is a continuous function of scroll position, so a
 *     card grows as it approaches the middle and the row tracks the pointer
 *     exactly. This is the single biggest difference.
 *   - A RELEASE STOPPED DEAD. Letting go mid-flick parked on the nearest card
 *     rather than carrying, which reads as the thing being stuck. Pointer
 *     velocity is sampled during the drag and projected on release, so a flick
 *     advances and a slow drag does not.
 *   - SNAP FOUGHT THE SETTLE. Mandatory snap re-engaged before the settling
 *     scroll had finished and yanked it. It now comes back after.
 *
 * 1. THE LOOP. One clone set either side of the real slides, with the scroll
 *    position kept inside the middle copy: cross a boundary and it jumps
 *    exactly one set width, onto identical pixels, so the seam cannot be seen.
 *    Clones are `aria-hidden` and untabbable — eight options announced once.
 *
 * 2. THE MOUSE DRAG. Touch already drags natively, with inertia no script will
 *    beat, and is left alone. A mouse does not, and on a wide screen that is
 *    how most people will try it.
 *
 * 3. THE SIZING, continuous, above.
 *
 * 4. WHICH SLIDE IS CENTRED, for anything keying off `.is-active`.
 *
 * EVERY NUMBER IS CACHED. Not for speed — it is already fast — but because
 * geometry read mid-drag is geometry read while the thing is moving. Measured
 * once, and again on resize.
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

  /* Geometry, measured once. Slides are all one width, so the whole track is
     described by a pitch and an origin. */
  let pitch = 0;
  let origin = 0;
  let span = 0;
  const measure = (): void => {
    pitch = slides[1].offsetLeft - slides[0].offsetLeft;
    origin = slides[0].offsetLeft - (track.clientWidth - slides[0].offsetWidth) / 2;
    span = count * pitch;
  };
  measure();

  /** Where the centre of the track is, in fractional slide indices. */
  const centre = (): number => (track.scrollLeft - origin) / pitch;

  /** The scroll position that centres slide `index`. */
  const positionOf = (index: number): number => origin + index * pitch;

  /**
   * Size every slide from its distance to the centre.
   *
   * A slide exactly in the middle is 1 and one full pitch away is 0.95, with
   * everything between interpolated — which is what makes a drag feel attached
   * to the pointer rather than animated after it.
   *
   * THE ORIGIN FLIP IS FREE because of where it happens. A slide left of
   * centre shrinks toward its right edge and one to the right toward its left,
   * so each keeps its gap to the middle card. They swap as a slide crosses the
   * centre — and AT the centre the scale is exactly 1, where the origin has no
   * effect at all, so the swap cannot be seen.
   */
  const paint = (): void => {
    const at = centre();
    const nearest = Math.round(at);
    for (let i = 0; i < slides.length; i += 1) {
      const away = Math.min(Math.abs(i - at), 1);
      const slide = slides[i];
      slide.style.transform = `scale(${(1 - 0.05 * away).toFixed(4)})`;
      slide.style.transformOrigin = i < at ? 'right center' : 'left center';
      slide.classList.toggle('is-active', i === nearest);
    }
  };

  /* One paint per frame however many scroll events arrive. */
  let frame = 0;
  const schedule = (): void => {
    if (!frame) frame = requestAnimationFrame(() => { frame = 0; paint(); });
  };

  /**
   * Keep the scroll position inside the middle set.
   *
   * Returns the jump it applied, because a drag is holding its own anchor and
   * has to be moved by the same amount or the row snaps out from under the
   * pointer.
   */
  const wrap = (): number => {
    if (track.scrollLeft < span * 0.5) {
      track.scrollLeft += span;
      return span;
    }
    if (track.scrollLeft > span * 1.5) {
      track.scrollLeft -= span;
      return -span;
    }
    return 0;
  };

  /* Open on the SECOND real slide: the first then sits to its left and three
     cards are in view. */
  track.scrollLeft = positionOf(count + 1);
  track.classList.add('is-live');
  paint();

  let dragging = false;
  track.addEventListener(
    'scroll',
    () => {
      if (!dragging) wrap();
      schedule();
    },
    { passive: true },
  );

  /* THE DRAG. */
  let anchor = 0;
  let from = 0;
  let lastX = 0;
  let lastAt = 0;
  let speed = 0;
  let restore: number;

  track.addEventListener('pointerdown', (event: PointerEvent) => {
    if (event.pointerType === 'touch' || event.button !== 0) return;
    dragging = true;
    from = lastX = event.clientX;
    anchor = track.scrollLeft;
    lastAt = event.timeStamp;
    speed = 0;
    clearTimeout(restore);
    track.style.scrollSnapType = 'none';
    track.classList.add('is-dragging');
    track.setPointerCapture(event.pointerId);
  });

  track.addEventListener('pointermove', (event: PointerEvent) => {
    if (!dragging) return;
    event.preventDefault();

    /* Pointer speed in px/ms, smoothed so one stuttering sample cannot throw
       the projection on release. */
    const elapsed = event.timeStamp - lastAt;
    if (elapsed > 0) {
      speed = speed * 0.7 + ((event.clientX - lastX) / elapsed) * 0.3;
      lastX = event.clientX;
      lastAt = event.timeStamp;
    }

    track.scrollLeft = anchor - (event.clientX - from);
    anchor += wrap();
  });

  const release = (): void => {
    if (!dragging) return;
    dragging = false;
    track.classList.remove('is-dragging');

    /* PROJECT THE FLICK. Pointer speed is the opposite sign to scroll, and
       160ms is roughly how long a thrown scroll keeps going. Capped at a
       slide and a bit: a hard flick should advance one card decisively, not
       fly across the whole set and leave you lost in it. */
    const carry = Math.max(-1.2, Math.min(1.2, (-speed * 160) / pitch));
    const target = Math.round(centre() + carry);
    track.scrollTo({ left: positionOf(target), behavior: 'smooth' });

    /* Snap comes back AFTER the settle. Re-engaging mandatory snap over a
       smooth scroll already in flight is what made letting go feel like being
       yanked — the browser snapped to where the row was rather than where it
       was going. */
    restore = window.setTimeout(() => {
      track.style.scrollSnapType = '';
    }, 420);
  };

  track.addEventListener('pointerup', release);
  track.addEventListener('pointercancel', release);

  /* Every number above comes from layout, so a width change invalidates the
     pitch, the seam and the resting position together. */
  let settle: number;
  window.addEventListener('resize', () => {
    clearTimeout(settle);
    settle = window.setTimeout(() => {
      const held = Math.round(centre());
      measure();
      track.scrollLeft = positionOf(held);
      paint();
    }, 150);
  });
}
