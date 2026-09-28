/**
 * Contact form submission (§8). Loaded on the contact page only.
 *
 * ONE JOB: submit the form without leaving the page, and put the answer on it.
 *
 * THE INTERCEPT IS THE §8 GUARANTEE, not a nicety. Formspark's documented HTML
 * setup is a native POST, which navigates: a visitor who filled the form
 * correctly lands on submit-form.com, and a visitor who hit an error lands on an
 * error page belonging to a company they have never heard of. Either way they
 * have left CentiPack, and any failure is something they have to interpret
 * themselves.
 *
 * Fetching with `accept: application/json` makes Formspark answer with JSON
 * instead of a redirect, so success and failure both get rendered HERE, in
 * words, in a live region. That region is what `scripts/verify/contracts.mjs`
 * asserts the existence of, and it is the whole reason a failed enquiry is not
 * a silent one.
 *
 * NO `started_at` AND NO ENABLE GATE — both belonged to the Cloudflare Pages
 * Function this replaced (AUDIT D7). The time floor was evaluated server-side by
 * code that no longer exists; Formspark would have filed it as an ordinary form
 * field, so a hidden input named `started_at` would have been data pretending to
 * be a defence. The honeypot survives because Formspark genuinely enforces it,
 * under the custom name `company_contact`.
 *
 * THE TURNSTILE RESET IS BACK, because Turnstile is (AUDIT D7, narrowed). A
 * token is SINGLE-USE: after a rejected submission the spent one is still sitting
 * in the form, so a second attempt posts it, Formspark refuses it again, and the
 * visitor is told their details could not be sent for a reason they have no way
 * to see or fix. Resetting the widget issues a fresh token and makes "try again"
 * mean what it says.
 *
 * Guarded rather than assumed: the loader is `defer`, a request to
 * challenges.cloudflare.com can fail, and `window.turnstile` may simply not be
 * there. Optional chaining means a missing widget costs the reset and nothing
 * else — the error is already on screen by this point.
 *
 * The form is NOT disabled in markup and nothing here enables it. The endpoint
 * is public and static — there is no unconfigured state to protect against.
 */
const form = document.querySelector<HTMLFormElement>('[data-contact-form]');

if (form) {
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

      /* FORMSPARK'S SHAPE, NOT THE OLD FUNCTION'S. It answers `{"success":true}`
         on acceptance; the previous endpoint answered `{"ok":true}`. Both are
         read, and `response.ok` is the backstop — a 2xx with a body this code
         does not recognise is still an accepted submission, and treating it as a
         failure would tell a visitor their enquiry was lost when it was not.

         The JSON parse is guarded for the same reason in reverse: a proxy or an
         outage can return 200 with HTML, and an unguarded `.json()` would throw
         into the catch below and claim the server was unreachable. */
      let result: { success?: boolean; ok?: boolean; message?: string; error?: string } = {};
      try {
        result = await response.json();
      } catch {
        /* Non-JSON body. `response.ok` alone decides. */
      }

      if (response.ok && result.success !== false && result.ok !== false) {
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

      say(
        result.message ??
          result.error ??
          'Could not send right now. Please email info@centipack.com.',
      );
    } catch {
      /* Offline, DNS, a blocked request — anything that never reached the
         endpoint. The address is in the message because it is the one route
         that still works when this one does not. */
      say('Could not reach the server. Please email info@centipack.com.');
    }

    if (submit) submit.disabled = false;
    /* A spent token cannot be sent twice. See the note at the top. */
    (window as unknown as { turnstile?: { reset: () => void } }).turnstile?.reset();
  });
}
