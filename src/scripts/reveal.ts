/**
 * Scroll reveal — the one attribute CSS cannot set for itself (§12.2, §6).
 *
 * THE MOTION IS NOT HERE. Opacity and transform, their spring tokens, the 60ms
 * stagger and every fallback live in global.css §8. This module observes, and
 * when a group reaches the viewport it sets one attribute on it. That is all
 * it does, and it is all it should: a reveal written in JavaScript would
 * animate on the main thread and still need the CSS for reduced motion.
 *
 * IT CANNOT HIDE ANYTHING, which is the safety property worth stating. The
 * hidden state belongs to `html.js [data-reveal-group] > *` — applied by the
 * stylesheet, armed by the one-liner in <head>, before this file is fetched.
 * If this module never loads, never parses, or throws on line one, every group
 * stays exactly where the CSS left it: visible content that simply did not
 * animate. There is no path where failing here loses content.
 *
 * ONCE, THEN FORGOTTEN. A revealed section is unobserved immediately: the
 * animation is an entrance, not a state, and a section that faded out again on
 * scroll-up would be a different and much worse idea.
 *
 * `rootMargin` pulls the trigger line 12% up from the bottom edge so a band
 * starts moving as it comes into view rather than once it is already read, and
 * `threshold: 0` fires on the first pixel — a tall section must not have to be
 * 10% visible before it begins, because on a short viewport it never would be.
 */
const groups = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal-group]'));

if (groups.length) {
  for (const group of groups) {
    /* The stagger number, per child. The attribute carries the intent in the
       markup; CSS cannot read an integer out of one portably, so the number
       goes into a custom property here. */
    const children = group.children;
    for (let i = 0; i < children.length; i += 1) {
      (children[i] as HTMLElement).style.setProperty('--reveal-index', String(i));
    }
  }

  const watcher = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.setAttribute('data-reveal', 'in');
        watcher.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0 },
  );

  for (const group of groups) watcher.observe(group);
}
