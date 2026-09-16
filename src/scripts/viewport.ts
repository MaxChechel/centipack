/**
 * Disclosure state that must not outlive the breakpoint that created it (§6).
 *
 * The desktop dropdown writes `aria-expanded` on its trigger; the mobile menu is
 * a `<details open>`. Cross the layout breakpoint and the element holding that
 * state is `display: none`, so the state survives — invisible — until you cross
 * back, and the panel is sitting there open, which nobody asked for.
 *
 * The visual artefact is the smaller half. `aria-expanded="true"` on a control
 * that is not rendered is a lie told to a screen reader, and it persists for as
 * long as the window stays that width. CSS cannot clean it up because it is
 * state, not style.
 *
 * `matchMedia().change` rather than a resize listener: it fires once per
 * crossing rather than once per pixel.
 */
const DESKTOP = window.matchMedia('(min-width: 62rem)');

DESKTOP.addEventListener('change', () => {
  for (const trigger of document.querySelectorAll('[data-disclosure]')) {
    trigger.setAttribute('aria-expanded', 'false');
  }
  for (const menu of document.querySelectorAll<HTMLDetailsElement>('.nav-disclosure[open]')) {
    menu.open = false;
  }
});
