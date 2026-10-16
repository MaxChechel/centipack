# AUDIT

Findings, and deviations from `ARCHITECTURE.md` sanctioned for this project.

The spec is law and is never edited in place; a project that needs to depart from
it records the departure here, with its reason, and the record is what makes the
departure a decision rather than a drift.

Two kinds of entry:

- **D — deviation.** A rule in `ARCHITECTURE.md` that this build does not follow
  as written, and why.
- **F — finding.** Something true about the inputs (the design, the copy, the
  brand) that the build has to work around or that the human has to rule on.
  Findings are not deviations; they are the evidence behind them.

---

## D1 — Two primitive colour ramps, not one

**§2.1** describes *the* colour ramp. This build declares two: `--gray-*`
(CentiPack's "Neutral" family, warm neutral, ink and lines) and `--sand-*`
(CentiPack's "Secondary" family, warm sand, page grounds).

**Why.** The brand's grounds and its ink are different hues at the same
lightness, not two ends of one ramp. The client's own Figma variables say so:
`Grays/Gray-00` is `#f1f1f1` at L\*95.1 and `Secondary/100` is `#f2eee8` at
L\*94.2 — a tenth of a lightness step apart and visibly different in warmth.
Folding them into one ramp means dropping one of the two, and the one that would
go is the one every page is painted with.

**What the rule was protecting is intact.** Neither ramp is in the `--color-*`
namespace, so `bg-gray-500` and `bg-sand-100` both fail to compile; primitives
are still not a vocabulary; the semantic layer is still the only thing a
component touches; and the contrast matrix still computes from the built CSS and
does not care how many families fed it.

**Cost.** `src/pages/_styleguide.astro` renders a ramp per family instead of one,
and the retheme instructions in `README.md` §2 name only `--gray-*`.

---

## D2 — The spacing scale is static, not fluid

**§2.1** requires a fluid spacing scale, `clamp()` throughout. This build's
`--spacing-3xs … --spacing-4xl` are fixed rem values. The section rhythm
(`--spacing-section-*`), `--site-margin` and `--nav-height` keep their clamps.

**Why, measured.** CentiPack is drawn at two widths, 402px and 1440px, and the
spacing is the same number at both: the card grid gap is 12px on both frames, the
content card's interior padding 24px on both, the content stack gap 32px on both.
A clamp between two equal values is a constant written the long way. A clamp
between the template's default ends would be wrong at *both* of the two widths
the design actually specifies — which is the opposite of what fluid spacing is
for.

**What does scale, scales.** The three things the design genuinely changes with
the viewport are the page gutter (16 → 48), the nav (66 → 82) and the section
rhythm (48/64 → 96/120), and those are the three that carry `clamp()`.

**Cost.** Gaps do not tighten below 402px. At 320px the design has no opinion;
the 12/16/24 steps hold, and §9's sweep at 320/360/390 is what proves nothing
overflows as a result.

---

## D4 — The card pattern is `bg-subtle`, not `bg-surface + border-line`

**§4.2** states the card recipe as `bg-surface` + `border-line` + `--radius-md` +
interior padding. CentiPack's cards are **`bg-subtle`, `--radius-md`, padding,
and no border**.

**Why.** Every card in the design — product cards on the index, the category
grids and the nav panel — is one step *away* from the ground rather than raised
off it: `#f2eee8` on a `#f9f7f5` page. It is consistent across all four sizes
and all six page types, and it is the same gesture in dark, where `bg-subtle`
sits one step lighter than the ground.

**Where it is made.** §4.2's own rule is that a card needing a different
treatment gets it "as a token decision in `global.css` where every card gets it",
not per component — so the recipe changes once, the styleguide's card section
states the new one, and `ProductCard` and `CategoryCard` still never invent their
own surface.

---

## D5 — ARCHITECTURE's open ruling 1, ruled: hand-rolled scroll-snap

**Open ruling 1** asks whether the slider policy is hand-rolled scroll-snap or
Lumos for Astro's, adapted. CentiPack rules **hand-rolled**, and additionally
rejects Swiper, which was proposed in review.

**The measurement.** Swiper's pagination build is ~15 KB gzipped and its full
bundle over 40 KB, against **2,820 B of JavaScript for this entire site**. The
module written instead is **431 B** and computes two numbers; everything visible
is CSS.

**The argument that is not about bytes.** The rail is `overflow-x: auto` with
scroll snapping, so touch physics, momentum, rubber-banding, keyboard arrows,
focus management and screen-reader announcement are the platform's and cannot
regress. A JavaScript slider takes ownership of all of it to deliver the one
thing CSS cannot compute — where you are in the scroll.

**When to reopen.** A design that needs coverflow, synchronised sliders or
free-mode inertia is asking for something the platform does not do. Pagination
is not that.

---

## F7 — A token declared only under `[data-theme]` does not exist on an unthemed page

Found by review, twice reported before it was understood.
`--bg-inverse-hover` was added to `[data-theme='light']` and
`[data-theme='dark']` but not to the bare `:root`. Most pages carry no
`data-theme` attribute, so on them the token was undefined, every rule using it
died at computed-value time, and the primary button's hover fill resolved to
`transparent`.

**The contrast matrix passed throughout**, because it resolves each token within
a named theme scope and never within the unstamped one.
`rootDeclaration()` in `scripts/verify/lib/contrast.mjs` now asserts it, and was
fault-injected with the original bug before being counted.

**The general rule, worth carrying back to the template:** §2.4 says a theme
block *remaps* the semantic tokens. Every token a theme block remaps must first
EXIST in `:root`, or the default state has a hole in it. The starter's own tokens
all satisfy this; nothing said so until one did not.

---

## F1 — The design's control borders fail WCAG 1.4.11

Text inputs and secondary buttons are drawn with a `#d4d2cf` (Neutral/300)
border on a white fill, inside a `#f2eee8` panel. Measured: **1.51:1** against
the fill and **1.31:1** against the panel. Nothing else in those controls
distinguishes them — white on cream is itself 1.16:1 — so the border is the only
thing saying "this is a control", which is exactly 1.4.11's 3:1 case.

**Fixed, under §10's "identical to source except documented a11y fixes".**
`--line-strong` resolves to a tuned `--gray-500` (`#888683`) instead, at 3.14:1
on the tightest ground. Dividers and card edges keep `--line` = `#d4d2cf`
exactly as drawn. **Visible consequence:** input and secondary-button borders
render darker than the Figma frames.

## F2 — The designed dark footer's meta colour cannot be the tertiary token

The footer sets its eyebrow labels and legal line in `#8c8a87` on `#1f1f1f`:
4.79:1, which passes on that ground and **fails at 3.72:1** the moment the same
token lands on a lighter dark ground. §2.3 requires every text token to clear
every background in its theme, so the dark `--text-tertiary` steps up to the
derived `--gray-400`. **Visible consequence:** footer meta renders one step
lighter than drawn.

## F3 — The designed dark divider is the dark theme's surface colour

The footer's divider is Neutral/800 `#333231`, which the dark ground ladder
(§2.4 rule 2) needs as `--bg-surface`. A rule the same colour as the card it
borders is not a rule, so dark `--line` is `--gray-700`. **Visible
consequence:** the footer divider reads slightly stronger than drawn.

## D3 — `Button`'s `primary` variant is not the accent fill

**§4.1** gives Button a canonical API and the template implements `primary` as
`bg-accent text-on-accent border-accent`. This build fills it with
`--bg-inverse` instead.

**Why.** CentiPack's primary action is the ink colour — Brand/Black on light,
pure white on dark — and its accent is a navy spent elsewhere (F4). Ruled in
review, 2026-09-12.

**What the rule was protecting is intact.** The variant API is unchanged, every
colour still comes from the semantic layer, a `theme="dark"` Section still
recolours every button with no `dark:` in markup, and the accent is still
load-bearing on the control: `primary` hovers to `text-accent`/`border-accent`,
so broken accent wiring still shows up on the most-used control on the site. The
new pair has its own row in the contrast matrix, which the template's did too.

---

## F4 — `text/brand` is bound to exactly one cell

`#0e2a46` appears once in the whole Figma file: the last SKU row of the spec
table on the mailers page (`788:9197`). Every other "action" surface — primary
button, links, tertiary arrows — is Brand/Black. Ruled in session on 2026-09-12:
it is the accent, the primary button is not. See WORKLOG open question 2 for
whether that one cell is a designed highlight or a slip.

## F5 — Mobile H1 carries a tracking the H1 style does not

The desktop H1 style is -2% (`-1.28px` at 64px). The mobile H1 is a detached
style at 36px with `-1.8px`, which is **-5%**. Tracking that tightens as the size
falls is backwards. The build uses one em-based -0.02em across the clamp; the
mobile frame will read very slightly looser than Figma at 402px. WORKLOG open
question 6.

## F6 — Hidden placeholder copy in the Figma frames

Two text nodes carry "Lorem ipsum dolor sit amet consectetur…" — `788:9179` in
the product family page and `788:9598` in a hidden Contact section. **Both are
`hidden="true"` in Figma**, so neither is shipping copy and neither reaches the
build. Recorded because the brief asks for placeholder text to be flagged rather
than silently shipped.

---

## D7 — The contact form posts to Formspark, not to a Pages Function

**§8 specifies** a Cloudflare Pages Function with invisible Turnstile, a honeypot
and a time floor, delivering through a swappable `sendLead()` seam. CentiPack
deviates: the form posts directly to **Formspark**
(`https://submit-form.com/bqtIN0U6N`), and `functions/api/contact.ts` is deleted.

**Why.** The spec's design has one precondition the project never met — a
`TURNSTILE_SECRET_KEY` and a `RESEND_API_KEY` in the deployment environment, plus
`PUBLIC_TURNSTILE_SITE_KEY` at build time. Without them the function answers
`503 Form is not configured.` and **no enquiry has ever been deliverable.** The
form was correct in every respect except the one that matters. Formspark needs no
key, no environment and no function: the endpoint is public by construction and
works on a fresh clone.

**What §8's guarantee rests on now, because it has not lapsed.** The rule is that
a form must never swallow an enquiry silently. What prevented that was never the
Pages Function — it was the intercepted submit plus the live status region, and
both are unchanged. `src/scripts/contact.ts` fetches with
`accept: application/json`, which makes Formspark answer JSON rather than
redirecting, and renders the outcome on the page in words.
`scripts/verify/contracts.mjs` still fails the build if that region is missing.

**What was given up, stated plainly rather than minimised:**

- ~~**Turnstile.** Deleted, not disabled. Its token was only ever checked by the
  function that is gone, and Formspark does not check it. A challenge nobody
  verifies costs the visitor a step and stops no bot.~~
  **RESTORED 2026-09-28, and the deviation narrows with it.** Formspark holds
  the secret key and verifies the token server-side, so the challenge means
  something again — which was the only reason it came off. §8 asked for
  invisible Turnstile on the contact page and the site has it; what still
  deviates is *who* verifies the token, not *whether* anyone does. Spam
  protection is now three layers, each catching what the others do not:
  Formspark's own filtering, the honeypot (a bot that fills every field) and
  Turnstile (a bot that fills only the visible ones).
- **The time floor** (`MIN_FILL_MS` / `MAX_FILL_MS`). Evaluated server-side by
  deleted code. `started_at` was removed rather than left in the markup: a hidden
  field no endpoint reads is data wearing the costume of a defence.
- **The `sendLead()` seam.** Delivery is Formspark's. Moving to a CRM means
  Formspark's own forwarding, or reinstating a function.
- **Lead data now transits a third party.** Formspark holds submissions. That is
  a processor relationship and belongs in the privacy policy the site does not
  yet have (WORKLOG open question 60).

**The honeypot was renamed** `company_website` → `_honeypot`, which is the
reserved name Formspark actually enforces; under any other name it would have
been filed as ordinary form data. The contract assertion follows the field and is
otherwise unchanged.

**When to reopen.** If Turnstile-grade bot filtering becomes necessary, or lead
data must not leave infrastructure the client controls, the function comes back
out of git history and §8 applies again unmodified.

---

## F8 — The v1 secondary action fill has no visible boundary

**The v1 design (Figma `uMHWj1JRHoqmY9uOQNfyL6`) gives its headline button a tan
fill**, `action/secondary/default` #c5b197, on the page ground #f9f7f5. Measured:

| | ratio | requirement | |
| --- | --- | --- | --- |
| label #1f1f1f on the fill | **7.94** | 4.5 (AA text) | passes |
| the fill against `--bg-base` | **1.94** | 3.0 (WCAG 1.4.11) | **fails** |

The label is legible. **The button's edge is not** — a tan at L*74 on a ground at
L*97 is a shape a sighted user infers from the label rather than sees. This is
the "Get a quote" button in the nav of every page, and the primary action on the
pages below it.

**The same failure as F1, one layer up.** F1 records that the design's control
BORDERS fail 1.4.11; this is the design's control FILL failing it, and the
mechanism is identical — a brand swatch chosen for how it looks on the ground
rather than for how far it is from it.

**Not asserted in the harness, deliberately.** `actionMatrix` checks the label on
the fill and stops there. Adding the 3:1 boundary row would turn an accepted
design decision into a red build on every run, which is how a check gets
weakened later to make it pass. It is recorded here instead, which is what
AUDIT is for.

**What would fix it**, if the client wants it fixed rather than accepted:
a 1px `--line-strong` border on the button (cheapest, keeps the swatch), or
darkening the tan to roughly L*62 — about #a98d6b — which reaches 3:1 against
the ground while staying recognisably the same colour. Both change what the
design draws, so neither is this file's call.

## D8 — Hero photographs run full-bleed, where v1 draws them as contained plates

**Deviation, on instruction, 2026-10-16.**

The v1 design draws every page's hero photograph as a plate inside the page
gutter with the card radius:

| page | drawn | |
| --- | --- | --- |
| Home | 1344 × 560 at x=48 | Figma 1005:13611 |
| Product pages | 1344 × 541 at x=48 | Figma 1179:3206 and siblings |
| Category pages | 1440 × 700, x=0 | Figma 1005:14041 — already full-bleed |

**They ship full-bleed.** The home hero was built to the drawn plate for one
round and the ruling came back the other way: the site's hero photographs run
the full viewport width, as they did before v1 and as the category pages do in
v1 regardless.

**Why it is recorded rather than absorbed.** It is a real difference from the
source of truth this round is being measured against, and it is the kind that
reads as an oversight later — someone opens Figma, sees a 48px gutter on the
home hero, and files it as a bug. It is not: it is a decision, and this is where
decisions that contradict the design live.

**What it costs.** Nothing measurable. The pictures are 4096px wide sources and
`sizes="100vw"` picks a wider candidate than `1344px` did, which is correct for
the wider box rather than wasteful. Contrast is unaffected — there is no type on
any of these three, which is also why the home hero's scrim came off with its
stat band.

**What would reverse it**: `width="main"` on the three Sections, the drawn ratio
on each Media, and `rounded-md` back on the image. Two lines per page, and the
design is already written down above.

## D9 — The category card's scrims are deeper and taller than the design draws them

**Deviation, forced by photography, 2026-10-16.**

v1 draws two gradient bands on a category card, each 185px on a 532px card —
34.8% — and each from transparent to `rgb(0 0 0 / 0.5)` (Figma 1005:13692 and
1295:23619). **They ship at 0.65 over 34.8% (top) and 0.8 over 50% (bottom).**

All three card photographs were replaced on 2026-10-16 with bright studio
frames: cream backdrops, and a white corrugated box low in the frame on two of
them. White type stopped carrying. Measured on the built home page at 1440,
sampling the 90th-percentile luminance under each text box with the glyphs
hidden, so the number describes the ground rather than the text on it:

| bottom band | cold chain body | custom boxes body | pharmacy body |
| --- | --- | --- | --- |
| 0.5 over 34.8% *(as drawn)* | **2.96** | — | — |
| 0.8 over 34.8% | 4.73 | **3.88** | 9.31 |
| 0.9 over 34.8% | 5.58 | 4.53 | 10.32 |
| **0.8 over 50%** | **6.65** | **5.65** | **11.63** |

The requirement is 4.5. Headings, which the top band governs, run 4.14 / 3.69 /
3.77 against a requirement of 3.0.

**HEIGHT, NOT MORE ALPHA, is the part worth recording.** Raising the bottom
alpha alone reached 4.53 at 0.9 — a 0.7% margin — and needed 0.95 before there
was any real headroom, by which point the foot of the photograph is nearly black
and there is no point having a photograph. Taking the band from 34.8% to 50% at
the same 0.8 spreads the same darkness over more of the card: the gradient under
the text is gentler, the bottom edge is not crushed, and the margin triples.

The two bands are therefore asymmetric — 34.8% top, 50% bottom. That is also
honest about what they carry: the top band covers one short heading, the bottom
covers a paragraph and a link.

**Why this is not a style choice.** A scrim is the thing that makes the type
legible; what it has to be is a property of the picture under it, not a number
that can be copied between photographs. The design's values were correct for
the shots they were drawn against. This is the third time it has been relearned
on this component — WORKLOG 40 took the scrim off when pre-darkened shots
arrived, 41 recorded the contrast that left, and the v1 round put two back.

**The alternative, if the darker plates are not wanted**: card photographs that
are darker where the type sits — the lower half, and the top-left where the
heading goes. At the design's 0.5 / 0.5 those shots would need to be roughly a
stop down from these. That is a shoot decision, not a CSS one, which is why the
fix went where it could be made.

**Not a weakened check.** Nothing in the harness was relaxed to reach this. The
contrast matrix cannot see photographs at all — which is why these numbers come
from a separate measurement script rather than from `npm run verify`, and why
running that script is not optional when a photograph is swapped. Both failures
above were found that way, after the images landed and before they shipped.
