/**
 * Nav disclosure panels — one module per page, owning every disclosure (§4.3, §6).
 *
 * ONE delegated listener on the document, not a script per trigger. Adding a
 * fourth dropdown adds zero bytes.
 *
 * The panel's visibility is CSS's job, driven off `aria-expanded` on the trigger
 * (see `.nav-panel` in global.css). This module therefore only ever writes one
 * attribute — which means the accessible state and the visual state cannot drift
 * apart, because they are the same fact.
 *
 * Behaviour, all of it required by §4.3:
 *   - click on a trigger toggles it, and closes any other open panel;
 *   - Escape closes the open panel and RETURNS FOCUS to its trigger;
 *   - a pointer press outside closes;
 *   - focus leaving the group closes it, so Tab cannot strand an open panel
 *     behind you;
 *   - HOVER OPENS IT TOO, as an enhancement and never as the only way in. §4.3
 *     is explicit about the direction: hover *may* open a panel, but a panel
 *     reachable only by hover excludes touch and keyboard entirely. So the
 *     button, Escape, outside-press and focus handling above are the contract,
 *     and hover is a shortcut laid over them that changes the same one
 *     attribute.
 *
 *     Three details that matter: it is gated on `(hover: hover)` so a touch
 *     device never fires it; closing is delayed so crossing the gap between the
 *     trigger and the panel does not shut it; and a pointer re-entering cancels
 *     the pending close. Without the delay the panel is unusable with a mouse,
 *     which is the classic way hover menus get shipped broken.
 */
const TRIGGER = '[data-disclosure]';
const GROUP = '[data-disclosure-group]';

const triggersIn = (root: ParentNode): HTMLElement[] =>
  Array.from(root.querySelectorAll<HTMLElement>(TRIGGER));

const setOpen = (trigger: HTMLElement, open: boolean): void => {
  trigger.setAttribute('aria-expanded', String(open));
};

const isOpen = (trigger: Element): boolean => trigger.getAttribute('aria-expanded') === 'true';

const closeAll = (except?: Element): void => {
  for (const trigger of triggersIn(document)) {
    if (trigger !== except) setOpen(trigger, false);
  }
};

document.addEventListener('click', (event) => {
  const trigger = (event.target as Element | null)?.closest<HTMLElement>(TRIGGER);
  if (!trigger) return;
  const open = !isOpen(trigger);
  closeAll(trigger);
  setOpen(trigger, open);
});

/* Pointerdown rather than click: a press that starts outside should close the
   panel even if the pointer is released somewhere else. */
document.addEventListener('pointerdown', (event) => {
  const target = event.target as Element | null;
  if (target?.closest(GROUP)) return;
  closeAll();
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  const open = triggersIn(document).find(isOpen);
  if (!open) return;
  setOpen(open, false);
  /* Returning focus is the half of Escape that is usually missing. Without it
     the user is dropped at the top of the document. */
  open.focus();
});

document.addEventListener('focusin', (event) => {
  const group = (event.target as Element | null)?.closest(GROUP);
  for (const trigger of triggersIn(document)) {
    if (isOpen(trigger) && trigger.closest(GROUP) !== group) setOpen(trigger, false);
  }
});


/* ── Hover, as an enhancement over the contract above ────────────────────────
   Everything below is additive: remove it and every requirement in §4.3 is
   still met by the click, Escape, outside-press and focus handlers. */
const CAN_HOVER = window.matchMedia('(hover: hover)');

/** Crossing from the trigger to the panel passes over a gap. Do not punish it. */
const CLOSE_DELAY = 180;
let closeTimer: number | undefined;

const cancelClose = (): void => {
  if (closeTimer !== undefined) clearTimeout(closeTimer);
  closeTimer = undefined;
};

document.addEventListener('pointerover', (event) => {
  if (!CAN_HOVER.matches || event.pointerType === 'touch') return;
  const group = (event.target as Element | null)?.closest(GROUP);
  if (!group) return;
  cancelClose();
  const trigger = group.querySelector<HTMLElement>(TRIGGER);
  if (trigger && !isOpen(trigger)) {
    closeAll(trigger);
    setOpen(trigger, true);
  }
});

document.addEventListener('pointerout', (event) => {
  if (!CAN_HOVER.matches || event.pointerType === 'touch') return;
  const group = (event.target as Element | null)?.closest(GROUP);
  if (!group) return;
  /* Still inside the same group — a move between its own children, not an exit. */
  const to = event.relatedTarget as Element | null;
  if (to && group.contains(to)) return;
  cancelClose();
  closeTimer = window.setTimeout(() => {
    const trigger = group.querySelector<HTMLElement>(TRIGGER);
    /* Keyboard focus inside the panel outranks the pointer having left it. */
    if (trigger && !group.contains(document.activeElement)) setOpen(trigger, false);
  }, CLOSE_DELAY);
});
