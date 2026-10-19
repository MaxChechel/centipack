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
 * FONTS FIRST, FOR EVERYTHING. Nothing is measured, split, indexed or observed
 * until `document.fonts.ready` settles. Line breaking depends entirely on the
 * face that eventually loads, and a split taken on fallback metrics is frozen
 * at the wrong widths — see the note on `measured` for the 64px layout shift
 * that caused, and the three separate symptoms it produced.
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

/**
 * Elements whose text is split into lines, so a heading arrives a line at a
 * time rather than as one block.
 *
 * PLAIN TEXT ONLY, enforced below. An element containing inline markup — a
 * link mid-sentence, a <br>, an <em> — is left whole, because rebuilding its
 * innerHTML from measured line boxes would have to re-create that markup
 * across line boundaries and would silently drop anything it did not
 * anticipate. Dropping a link out of a paragraph to make it animate better is
 * not a trade worth making, so those reveal as a block and look fine.
 */
const SPLITTABLE = 'h1, h2, h3, h4, p';

/** Lines live in the DOM only while the animation needs them — see `unsplit`. */
const SPLIT_CLASS = 'is-split';

const escapeText = (text: string): string =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * Where the browser ACTUALLY broke this text, measured rather than guessed.
 *
 * A Range over each word reports the rectangle that word occupies; words whose
 * tops agree are on one line. This is the only way to know, because line
 * breaking depends on the font that eventually loaded, the width the element
 * ended up with, hyphenation, `text-wrap: balance` and the rest — none of
 * which can be computed from the string.
 *
 * Returns null when there is nothing to gain: one line, no text, or markup
 * inside. Wrapping a single line would add an element and change nothing.
 */
function linesOf(el: HTMLElement): string[] | null {
  const node = el.firstChild;
  if (!node || node.nodeType !== Node.TEXT_NODE || el.childNodes.length !== 1) return null;

  const text = node.textContent ?? '';
  if (!text.trim()) return null;

  if (!/\S\s+\S/.test(text)) return null;

  const range = document.createRange();
  const lines: string[] = [];
  let from = 0;
  let top: number | null = null;

  /* MEASURED ONE CHARACTER AT A TIME, and it has to be.
   *
   * Grouping by WORD is the obvious implementation and it is wrong, because a
   * browser does not only break at spaces. The home page h1 breaks inside
   * "high-volume": the hyphen ends one line and "volume" starts the next. A
   * Range spanning that word therefore covers two line boxes, and
   * getBoundingClientRect returns their UNION — top from the first line, left
   * from the second. The word looked like it belonged to line one, line one
   * came out 36 characters long, and rebuilding it as a block wrapped it
   * again: the heading grew 64px every load.
   *
   * A single character cannot straddle a break, so its rect is unambiguous.
   * Slicing the ORIGINAL string at the offsets where the top changes also
   * keeps the text exactly as authored, hyphens and punctuation included,
   * rather than reassembling it from tokens.
   */
  for (let i = 0; i < text.length; i += 1) {
    /* Whitespace at a line end has no reliable rect — it is collapsed. The
       character after it opens the new line, which is the boundary wanted. */
    if (!text[i].trim()) continue;

    range.setStart(node, i);
    range.setEnd(node, i + 1);
    const { top: y } = range.getBoundingClientRect();

    if (top === null) top = y;
    /* A pixel of tolerance: sub-pixel layout puts characters on one visual
       line at tops that differ in the third decimal. */
    if (y - top > 1) {
      lines.push(text.slice(from, i));
      from = i;
      top = y;
    }
  }
  lines.push(text.slice(from));

  return lines.length > 1 ? lines : null;
}

/** Wrap each measured line, remembering the original text to put back. */
function split(el: HTMLElement): boolean {
  const lines = linesOf(el);
  if (!lines) return false;
  el.dataset.revealText = el.textContent ?? '';
  el.innerHTML = lines.map((line) => `<span class="reveal-line">${escapeText(line)}</span>`).join('');
  el.classList.add(SPLIT_CLASS);
  return true;
}

/**
 * Put the original sentence back, so it can be measured again.
 *
 * NOT A CLEANUP STEP — the split is permanent now (see `arrive`). This exists
 * only so a resize can re-measure from the real text rather than from text
 * that has already been cut into lines at some other width.
 */
function unsplit(el: HTMLElement): void {
  const original = el.dataset.revealText;
  if (original === undefined) return;
  el.textContent = original;
  delete el.dataset.revealText;
  el.classList.remove(SPLIT_CLASS);
}

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

  /**
   * Split what can be split, then number everything in reading order.
   *
   * ORDER MATTERS: splitting first means a four-line heading contributes four
   * numbers, so the paragraph after it starts its cascade where the heading
   * finished rather than on top of it. Numbering first and splitting after
   * would give every line of the heading the heading's single delay, and they
   * would all arrive together — which is the block reveal we already had.
   *
   * Reduced motion never gets here: nothing is hidden, so nothing needs
   * splitting, and the DOM is left exactly as authored.
   */
  const calm = matchMedia('(prefers-reduced-motion: reduce)');

  const layout = (group: HTMLElement): void => {
    if (!calm.matches) {
      for (const el of group.querySelectorAll<HTMLElement>(SPLITTABLE)) {
        if (el.closest('.reveal-skip')) continue;
        if (el.parentElement?.closest(ITEMS)) continue;
        unsplit(el);
        split(el);
      }
    }

    let index = 0;
    for (const item of itemsOf(group)) {
      const lines = item.querySelectorAll<HTMLElement>('.reveal-line');
      if (lines.length) {
        for (const line of lines) line.style.setProperty('--reveal-index', String(index++));
      } else {
        item.style.setProperty('--reveal-index', String(index++));
      }
    }
  };

  /**
   * NOTHING IS MEASURED UNTIL THE REAL TYPE IS ON THE PAGE.
   *
   * This is the most important line in the file and it was missing. `layout`
   * ran at module init, which is before the webfont swaps, so every line break
   * was computed from the FALLBACK metrics and frozen into spans that never
   * re-wrap. On the home page the h1's first line was cut at a width the real
   * face could not hold, so it wrapped again once DM Sans arrived: the heading
   * went from 128px to 192px and everything below it moved 64px down — after
   * the observers had recorded where things were.
   *
   * That is one bug presenting as three, and all three were reported: the
   * layout jumped, the card images flickered as they were pushed, and the
   * quote and closing band fired their reveals against stale positions.
   *
   * `document.fonts.ready` settles whether the fonts load or fail, so it
   * cannot hang — and the 3s failsafe at the foot of this file does not care
   * either way.
   */
  const measured = document.fonts.ready.then(() => {
    for (const group of groups) layout(group);
  });

  /**
   * THE SPLIT STAYS, and the reason is a measured one.
   *
   * This used to put each sentence back once its cascade had finished — a
   * second of wrapped lines and ordinary markup either side, which is tidier
   * in every way except the one that matters. Removing the wrappers recomputes
   * the line breaking, and the recomputed result is not always identical: the
   * text visibly shifted as the page settled. A layout shift a reader can see
   * is worse than extra elements they cannot.
   *
   * So the lines persist, which is what every other implementation of this
   * does and for the same reason. The cost is a wrapper span per line between
   * a screen reader and the sentence; the text nodes stay in order and read
   * normally. It also makes resize load-bearing — see below.
   */
  const arrive = (group: HTMLElement): void => {
    group.setAttribute('data-reveal', 'in');
  };

  /* Heroes: on load, once the type has settled. The race is the point — a font
     that never resolves must not leave the page blank. */
  const heroes = groups.filter((g) => g.getAttribute('data-reveal-on') === 'load');
  if (heroes.length) {
    measured.then(() => {
      for (const hero of heroes) arrive(hero);
    });
  }

  /* Everything else: on arrival.
   
     THE TRIGGER LINE SITS 70% DOWN THE VIEWPORT, not at its bottom edge. With
     the line at the edge, a tall band — a 600px quote, a closing plate —
     started its cascade the instant its top crossed into view, which is while
     its content is still below the fold. By the time the reader reached the
     words they had already finished arriving, so the reveal read as firing
     early and for nothing. Pulling the line up means a section begins when it
     is genuinely being looked at.
   
     `threshold: 0` fires on the first pixel past that line, because a section
     taller than the viewport must not wait to be some percentage visible —
     on a short screen it never would be. */
  const watcher = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        arrive(entry.target as HTMLElement);
        watcher.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -30% 0px', threshold: 0 },
  );

  /* OBSERVE AFTER MEASURING, for the same reason. An observer attached before
     the split knows where a section was while the text was still in the
     fallback face; the split then moves everything, and the recorded trigger
     points refer to positions that no longer exist. */
  measured.then(() => {
    for (const group of groups) {
      if (group.getAttribute('data-reveal-on') !== 'load') watcher.observe(group);
    }
  });

  /**
   * RESIZE, which is where every line-splitting implementation goes wrong.
   *
   * Lines are measured at one width and are wrong at another. The usual fix is
   * to re-split everything on resize and live with frozen breaks in between;
   * here most of the problem does not exist, because a group that has already
   * arrived has had its wrapper removed and is ordinary re-wrapping text.
   *
   * EVERY GROUP, ARRIVED OR NOT, because the wrappers are permanent. Lines are
   * measured at one width and are simply wrong at another — a heading split
   * into two lines at 1440 is still two frozen lines at 700, breaking where
   * nothing says it should. `layout` restores the original text before
   * re-measuring, so this is a true re-split and not a split of a split.
   *
   * Re-splitting a group that has already arrived cannot flash: the hidden
   * state requires `:not([data-reveal='in'])`, and it is `in`, so the fresh
   * lines are visible the moment they exist.
   *
   * Debounced, because dragging a window edge fires this continuously and each
   * pass does real layout work.
   */
  let resized: number;
  window.addEventListener('resize', () => {
    clearTimeout(resized);
    resized = window.setTimeout(() => {
      for (const group of groups) layout(group);
    }, 180);
  });
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
