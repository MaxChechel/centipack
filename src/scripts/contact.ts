/**
 * Contact form enhancement (§8). Loaded on the contact page only.
 *
 * Two jobs, both of which must happen in the BROWSER:
 *
 *  1. Stamp `started_at`. The endpoint uses it as a bot floor, and a build-time
 *     value would be baked into the HTML and then cached — every visitor would
 *     submit with the same, increasingly stale, timestamp.
 *  2. Enable the form — but ONLY when the page says the endpoint is configured.
 *     The form ships `disabled` in the markup, and this module is the only thing
 *     that lifts it, so a browser with no JavaScript gets an honest inert form
 *     rather than a button that posts into nothing.
 *
 * THE GATE IS NOT OPTIONAL. An earlier version of this module enabled the form
 * unconditionally, which meant an unconfigured build rendered "this form is not
 * live yet" directly above a working-looking submit button — the two halves of
 * the page disagreeing, with the misleading half being the interactive one.
 *
 *  3. Submit the form and put the answer on this page.
 *
 * THAT THIRD JOB WAS MISSING, and this comment used to claim it was not needed:
 * "the endpoint answers with a redirect-friendly status and the browser does the
 * rest". It does not. `functions/api/contact.ts` answers with JSON, and a native
 * POST to a JSON response NAVIGATES — a visitor who filled the form correctly
 * would have left the site and be reading `{"ok":true}` in a blank tab.
 *
 * Intercepting costs nothing that the page had: the form ships `disabled` and
 * only job 2 above lifts it, so there has never been a no-JavaScript path that
 * could submit. What it buys is the error text. The endpoint distinguishes a
 * failed challenge from a bad address from a dead provider, and without a fetch
 * every one of those is the same blank tab.
 */
const form = document.querySelector<HTMLFormElement>('[data-contact-form]');

/* Set by the page only when a Turnstile site key exists. Absent → the endpoint
   cannot verify a submission, so there is nothing to enable. */
if (form?.hasAttribute('data-contact-ready')) {
  const startedAt = form.querySelector<HTMLInputElement>('input[name="started_at"]');
  if (startedAt) startedAt.value = String(Date.now());

  /* Re-stamp if the page was restored from the back/forward cache, where the
     original timestamp could be hours old and would trip the MAX_FILL_MS ceiling. */
  window.addEventListener('pageshow', (event) => {
    if (event.persisted && startedAt) startedAt.value = String(Date.now());
  });

  for (const control of form.querySelectorAll<HTMLElement & { disabled: boolean }>('[disabled]')) {
    control.disabled = false;
  }
  form.removeAttribute('data-form-disabled');

  const status = form.querySelector<HTMLParagraphElement>('[data-contact-status]');
  const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]');

  const say = (message: string): void => {
    if (!status) return;
    status.textContent = message;
    status.hidden = false;
  };

  form.addEventListener('submit', async (event) => {
    /* Let the browser run its own validation first: `required` and
       `type="email"` already report better than any message written here. */
    if (!form.reportValidity()) return;
    event.preventDefault();
    if (submit) submit.disabled = true;
    say('Sending…');

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { accept: 'application/json' },
      });
      const result = (await response.json()) as { ok?: boolean; error?: string };

      if (result.ok) {
        /* Replace rather than reset: a sent enquiry is not a form waiting to be
           filled in again, and leaving it fillable invites the double-send.
           Every direct child goes except the status line itself — which is why
           the status element is inside the form rather than beside it. */
        for (const child of [...form.children]) {
          if (child !== status) child.remove();
        }
        say('Thank you — your request is with the team. We reply from a person, not a sequence.');
        return;
      }

      say(result.error ?? 'Could not send right now. Please email info@centipack.com.');
    } catch {
      /* Offline, DNS, a blocked request — anything that never reached the
         endpoint. The address is in the message because it is the one route
         that still works when this one does not. */
      say('Could not reach the server. Please email info@centipack.com.');
    }

    if (submit) submit.disabled = false;
    /* A Turnstile token is single-use. Without this reset the next attempt
       posts a spent token and fails verification for a reason the visitor has
       no way to understand. */
    (window as unknown as { turnstile?: { reset: () => void } }).turnstile?.reset();
  });
}
