# Notes for outredge-system

Everything CentiPack — the first project built on the template — turned up that
belongs back in the template. Written for whoever picks up outredge-system next,
not for this project.

**How to read this.** Section A is bugs that exist in the template right now and
ship into every site built from it. Section B is holes in the verify harness —
the reason the section A bugs survived. Section C is traps that cost real time
here and cost nothing once you know them. Section D is work from this project
worth promoting up. Section E is what the template got right and should not be
touched.

Attribution is exact: `git show <initial-commit>:path` against this repo is the
template as delivered, so every "the template does X" below was checked against
that, not remembered.

Nothing here edits the spec. ARCHITECTURE.md governs; this is the list of
changes to propose to it and to the template's code.

**Two phases are recorded here.** A1–A6, B1–B5, C1–C14 and D1–D7 came out of the
build. A7–A8, B6–B11, C15–C22 and D8–D11 came out of taking the site to a soft
launch — a phase the template has not been through before.

That second phase found only **two** new template bugs and a great many holes in
the harness, which is itself the finding: the launch defects were mostly things
nothing was *checking*, not things the template got wrong. Several were visible
only in the built output, and one only in a deployed response header. Four more
were drafted as template bugs and withdrawn on checking — see the note at the end
of section A, because getting that distinction wrong is how this file would start
misleading people.

---

## A. Bugs in the template

### A1. Keyboard focus is invisible in every dark region — CRITICAL

`src/styles/global.css`, template lines 484–486:

```css
:root {
  --focus-ring: var(--text-primary);
  --selection-bg: var(--text-primary);
  --selection-text: var(--bg-base);
}
```

`[data-theme='dark']` redeclares `--text-primary` and `--bg-base`. These three do
not. **A `var()` inside a custom property is substituted where the property is
DECLARED, not where it is used** — so all three resolve once, at `:root`, using
the light theme's values, and keep them everywhere.

Measured in the browser on this project before the fix:

```
dark region, focused link: outline #1f1f1f on ground #1f1f1f
```

Every dark band on every page: the footer, any `theme="dark"` Section, any card
over a photograph. WCAG 2.4.7, failing silently, on every site built from this
template. `::selection` is wrong in the same places for the same reason.

**Fix:** redeclare all three inside each theme block. Then add the check in B1,
which catches the whole family instead of these three.

### A2. `SectionHeader` silently discards its default slot

The template's `SectionHeader.astro` renders `<slot name="lede">` and no default
`<slot />`. Pass it children and they vanish — no error, no warning, no element.
On this project a "Browse all formats →" button was passed to it and rendered
nowhere; it took a screenshot to notice.

**Fix:** render a default slot, or throw when `Astro.slots.has('default')` and
nothing will render it. Silently dropping children is the worst of the three
options and it is the current one.

### A3. Nothing in the template stops a long word leaving its box

There is no `overflow-wrap`, `word-break` or `hyphens` declaration anywhere in
the template's CSS. Default `overflow-wrap: normal` lets any unbreakable token —
a product name, an email address, a URL, an env var in `<code>` — push straight
out of its container and lie on top of whatever is beside it.

It does not scroll the document, so the page-level overflow sweep never sees it.
On this project "distributors" ran 30px out of a hero stat card and over its
neighbour at 320px while the sweep reported seven green widths.

**Fix:** `overflow-wrap: break-word` on `body` (inherited, conservative — it only
breaks a word that has no other way to fit) and `overflow-wrap: anywhere` on
`code, kbd, samp`. Do **not** add `hyphenate-limit-chars` globally; see C9.

### A4. Rotated chevrons overflow their own box

`.faq-chevron` in the template is a 0.5rem square with `transform: rotate(45deg)`.
A square of side *s* turned 45° occupies *s*·√2, so the drawn corner hangs 1.7px
out of the box on each side. `transform` does not move layout but it **does**
enlarge the scrollable overflow area, so the glyph pokes into the gutter and any
content-overflow assertion fires on every `<summary>` on the page.

**Fix:** draw the corner in a `::before` inside a box sized to the rotated
footprint. Same pattern for any caret built this way.

### A5. A logo in a flex row shrinks below its own token

The nav's logo link is a flex item with the default `flex: 0 1 auto` and
`min-width: auto`. `--spacing-nav-logo` declares a 152px floor; measured on this
project, the mark rendered at **63px at 320** and 133px at 390 — the row simply
squeezed it. A wordmark with a strapline at 63px is not small, it is illegible,
and nothing in the build says so, because a flex item shrinking is not an
overflow.

**Fix:** `flex: none` on the logo link. Then decide what gives at the narrowest
widths — on this project the full lockup became the badge alone below 26rem, by
clipping the link to the badge's width and letting the same SVG keep its own (see
D5, which is a pattern worth promoting, not just a fix).

### A6. The blur scale is killed by the reset with no way back

The template's reset removes Tailwind's `--blur-*` scale, so `backdrop-blur-sm`
and friends compile to nothing — the class ships in the HTML and no rule
generates. Caught here only by the dead-class check.

**Fix:** either re-expose one deliberate step (this project added
`--blur-overlay`) or document in the reset that a blur needs a token first.

---

### A7. The template generates no `srcset` anywhere — CONFIRMED

Checked against the initial commit: `src/lib/media.ts`, `src/lib/items.ts` and
`src/components/blocks/ItemCard.astro` contain **zero** references to `srcset`,
`densities` or `widths`. Every image helper resolves one file at one width and
the card emits a plain `<img src>`.

One fixed width cannot serve a responsive layout. Measured here, the same card
component on two pages:

```
index card    259px drawn      880px shipped   3.4x oversized
category card 656px drawn      880px shipped   needs 1312 at 2x
page hero     390px on a phone 2400px shipped  73 KB for a 10 KB job
```

Wasteful at the small end and soft at the large one, simultaneously, and it
arrives as "the images look bad" with no obvious cause.

**Fix:** a `widths` argument on the image helper, a `srcset` field on the
normalised picture shape (still source-agnostic — a CMS builds the same string
from its CDN), and a `sizes` prop that the LAYING-OUT component passes. `sizes`
cannot live in the media component: the same card is 259px on one page and 656px
on another, and only the parent knows which.

Three gotchas are in C15, C16 and C18 — all three produced confident wrong
readings while this was being built.

### A8. Every page ships its internal design notes to visitors — CONFIRMED

The template comments in `<!-- -->`. **Astro emits those**; only `{/* … */}` is
stripped at build. Counted in the initial commit:

```
src/components/shells/BaseLayout.astro    1
src/components/shells/Nav.astro           4
src/pages/contact.astro                   2
src/pages/_styleguide.astro              20
                                   TOTAL 27
```

So every site built from this template publishes its own implementation notes.
On this project that reached ~11.8 KB across seven pages, and included a
paragraph beside the contact form naming the honeypot field and explaining that
it was a trap — served to precisely the audience it existed to fool.

**Fix:** convert every `<!-- -->` in a `.astro` template to `{/* … */}` and keep
long-form reasoning in frontmatter, which is compiled away. Then B8 holds the
line. Note C18 before writing the check — Astro's stripping is not uniform.

---

**Four entries were drafted here and withdrawn after checking them against the
initial commit.** They are real defects on this project and NOT template bugs,
and the difference matters to whoever reads this:

- *The `<picture>` branch drops its `srcset`.* The template has no `<picture>`
  support at all; CentiPack added it. Recorded as a caveat in D2 instead.
- *The mobile nav fold has no link to its column's page.* The template's
  `NavColumn` is `{ title, links }` with **no `href`** — its columns have no
  landing page to link to. CentiPack added `href` and `browseLabel`, wired the
  desktop panel and missed the mobile fold. Recorded as C22, because the shape
  of that mistake is reusable.
- *`legalLinks` ships two dead links.* The template has no `legalLinks`. Its
  `footerLinks` are `/`, `/styleguide` and `/contact`, all of which exist.
  CentiPack introduced `/terms` and `/privacy` against pages nobody wrote.
- *Cards put white type on a photograph with nothing behind it.* **The template
  ships `--scrim-strength` and uses it.** CentiPack removed it. That one is in
  section E, under what the template got right.

## B. Holes in the harness

Each of these is the reason a section A bug survived. Every one of them was
fault-injected on this project before it counted (§9): inject the fault, watch it
fail with a legible message and a non-zero exit, revert.

### B1. The contrast matrix does not check declaration sites

Add two assertions to `scripts/verify/lib/contrast.mjs`, both reading the BUILT
CSS:

- **`rootDeclaration()`** — every semantic token a component uses must be
  declared at `:root`. A token declared only inside `[data-theme]` blocks does
  not exist on an unthemed region, so the declaration dies at computed-value
  time and the property falls back to its initial value. On this project
  `--bg-inverse-hover` was declared only in the theme blocks, so the primary
  button's hover background resolved to `transparent` and the near-white ground
  showed through. It was reported three times as "the button hovers to white",
  and the token's value was correct every time it was checked.

- **`themeCompleteness()`** — list every custom property each theme block
  redeclares, then fail any `:root` property whose value references one of them
  without being redeclared per theme. This is the A1 family, caught
  structurally rather than three at a time.

Fault injection: delete `--line-overlay` from the dark block →

```
FAIL  contrast matrix
      theme completeness: `--line-overlay` is declared at :root with a value
      referencing `--text-primary`, which [data-theme='dark'] re-declares.
      It resolves once, at :root, using the LIGHT value.
```

### B2. The keyboard check asserts a ring EXISTS, never that it is VISIBLE

`scripts/verify/keyboard.mjs`, template line 67:

```js
hasOutline: cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0,
```

A `#1f1f1f` outline on a `#1f1f1f` ground passes this. **This is exactly why A1
shipped in the template and survived every green run.**

**Fix:** compare the resolved outline colour against the focused element's
effective background and require 3:1 (WCAG 1.4.11). And make sure the page list
includes a dark-themed surface — on this project every page the keyboard check
ran was light, which is the second half of the same hole.

### B3. Nothing checks that content fits its own box

The sweep asks one question: does the **page** scroll sideways. A word wider than
its own card does not scroll the page — it lies on top of the card beside it.

Added here as a `spills` assertion in `scripts/verify/sweep.mjs`: for every
element, is `scrollWidth` greater than `clientWidth`, with three exclusions —
the element scrolls or clips, the element is invisible, or the element is marked
`data-bleed`. Only the deepest offender in a chain is reported.

`data-bleed` is the one escape hatch and it is deliberately **inconvenient**: it
is written in the markup, at the element that bleeds, where a reviewer reading
the component sees it. Two things on this site legitimately extend past their own
box — the product rail, which cancels the page gutter with a negative margin, and
the volume collage, whose character is two shots hanging into the margin. Neither
is discoverable from geometry alone, which is why the author declares it rather
than the checker guessing from negative margins and absolute positions.

Fault injection: remove the guard from the hero stat label →

```
FAIL  overflow + structure
  / @320px — content spills its box: dd.text-h5 +30px "distributors in between"
  / @360px — content spills its box: dd.text-h5 +16px "distributors in between"
  / @390px — content spills its box: dd.text-h5  +6px "distributors in between"
```

It immediately found four more the moment it was switched on, including A4.

### B4. Nothing checks for Astro's reserved prop names

The template already documents that `as` is reserved for `Section` (a leaf with
an `as` prop makes Astro's type layer discard its Props type entirely). `slot` is
worse and was undocumented — see C3.

Added here as `slotIsReserved()` in `scripts/verify/contracts.mjs`, scanning
every component's frontmatter. Fault injection:

```
FAIL  build contracts
      src/components/blocks/Media.astro declares a `slot` prop. `slot` is
      reserved by Astro for slot assignment — the attribute is consumed
      before the component sees it, and a component passed `slot="…"` as a
      direct child is silently dropped.
```

### B5. Contrast matrix rows the template does not have

Three added here, all worth promoting: `inverseMatrix()` for the primary button's
fill pair, `fadeMatrix()` compositing faded text over its grounds (so a hover
fade that drops text under AA fails the run), and the `:root` declaration row
from B1.

---

### B6. Nothing checks that an internal link resolves

§9 demands "zero broken refs" for images and says nothing about `href`. A static
build has no objection to an anchor pointing at a URL it never wrote.

This project shipped `/terms` and `/privacy` in the footer of every page from
the first build, and a later change would have left 39 dead links per page —
thirteen names across three lists — all of which built clean, typed clean, swept
clean and passed axe. **A 404 is not a rendering defect.**

`internalLinksResolve()` in `scripts/verify/contracts.mjs`: every internal
`href` in the PRODUCTION build must resolve to a page that build emits. It found
14 real dead links on its first run.

### B7. Nothing checks the CSP against what the site actually loads

A CSP is a response header. `astro dev` and `astro preview` do not apply
`_headers`, so **the policy is inert everywhere except a real deploy** and no
rendered check can see it.

Here, a form moved to a new endpoint and `_headers` was not followed through:
`connect-src` named a service the site no longer used and not the one it now
posted to. Every submission was refused by the browser. Nothing in the harness
could object.

`cspMatchesTheSite()` asserts both directions — every origin the build
references is permitted, and every permitted origin is referenced, which is what
catches an allowlist rotting into a list of things somebody once used.

**Its first version passed its own fault injection** and had to be rewritten:
reading the CSP as a flat set of origins, removing an origin from `connect-src`
while it remained in `form-action` looked fine. The form endpoint is now checked
PER DIRECTIVE.

### B8. Nothing checks that comments stay out of the build

See A8. `noCommentsInShippedHtml()` asserts the production build contains no
`<!-- -->` at all. Flat rule on purpose — the author of a comment is the last
person able to judge whether it is safe to publish.

**Its first fault injection passed too**, for a reason worth knowing (C18).

### B9. The JS census cannot declare an external script

`js-census.mjs` hard-fails any `<script src="https://…">` as "UNDECLARED", with
no way to declare one. The rule is right and the list it implies does not exist,
so the first legitimate third-party tag forces someone to weaken the check.

Fix: an `EXTERNAL` list beside `EXPECTED` — declared with a reason, undeclared
still fails. **No byte budget on an external entry**: the payload is served by
somebody else and can change without the repo changing, so a number there would
assert a measurement the harness cannot take.

### B10. Nothing checks contrast of text over a photograph

The contrast matrix reads token pairs out of the built CSS. It cannot see a
photograph, so a card whose heading sits on an image is unchecked — and a green
matrix on such a page means the tokens are sound, not that the page is legible.

Method that works, if someone wants to wire it up: render the page, take the
bounding box of each text node over an image, sample the **darkest decile** of
pixels behind it (so white glyphs do not flatter the reading), and compare to
the text colour. That is how every number in section E's scrim note was taken.

### B11. Nothing asserts a navigation surface contains a link

C22's mobile menu was valid HTML, passed the sweep, passed axe and passed the
link check — because every assertion was about links that exist, and none about
a menu having any.

## C. Traps

No code change. Knowing them is the whole value.

### C1. Custom property substitution happens at the DECLARATION site

Say it out loud before writing any `--token: color-mix(… var(--other-token) …)`.
Three separate bugs on this project, one of them shipping an accessibility
failure on every page. The corollary is the useful half: a `var()` used **directly
in a rule** resolves per element, per theme, correctly — so
`background-image: linear-gradient(…, color-mix(in oklab, var(--text-primary) 14%, transparent), …)`
is safe where storing that same expression in a `:root` property is not.

### C2. Tailwind utilities beat `@layer components` — three bugs

Every time a component rule "isn't winning", this is why. It cost three bugs here:

| Symptom | Cause | Fix used |
| --- | --- | --- |
| Nav help arrow stayed ink-on-ink when the circle filled | `text-primary` utility in the markup | set the resting colour in the component rule, drop the utility |
| Product card arrow, identically | same | same |
| Nav logo rendered squashed instead of cropped | `w-full` on the SVG beat the crop's `width` | express the crop as `min-width`, which no utility sets and which outranks `width` anyway |

Two escapes: take the utility out of the markup and own the resting state in the
component rule, or express the rule in a property nothing in the utility layer
sets.

### C3. `slot` is reserved by Astro, and the build will not tell you

A prop named `slot` is consumed as Astro's slot-assignment attribute. A component
passed `slot="…"` as a direct child of a parent with no matching named slot is
**discarded** — no error, no warning, no element. Here the category pages shipped
with no hero image, `astro check` passed, `npm run verify` passed, and nothing in
the output was wrong; there was simply less of it. It survived everywhere the
component sat inside a plain `<div>` and vanished on the one page where it did
not. Covered by B4.

### C4. A type scale outside `@theme` has no variants

Deliberate, and worth restating because it surprises every time: semantic colours,
the type scale and layout tokens sit outside `@theme` so illegal utilities do not
compile. The cost is that `md:text-h5` **does not exist**. Type does not jump at
a breakpoint; the tokens are fluid instead. When a label genuinely will not fit at
a narrow width, the answer is hyphenation or a layout change, not a type step.

### C5. The Tailwind scanner reads source as text

No `` `bg-${variant}` ``. Every class must appear as a complete literal string
somewhere in the source. Prop-to-class lookups are maps of literals, and that is
why (`PAD`, `VARIANT`, `SIZE`, `COLUMNS`) all look the way they do.

### C6. Headless hover probing is unreliable — three reasons, all measured

1. `CSS.forcePseudoState` sets the state for rendering but `getComputedStyle`
   does not see it;
2. headless reports `hover: none` unless pointer capability is emulated, so every
   `@media (hover: hover)` rule is inert;
3. transitions do not tick without a compositor frame, so a transitioned property
   reads its **start** value.

Write every hover rule with a `:focus-visible` twin carrying identical
declarations — which accessibility requires anyway — and assert the twin, driven
by real `Tab` key events, which the browser does honour.

### C7. `1fr` is `minmax(auto, 1fr)`

A grid track will not shrink below its content. A card's media inset by −6px put
the arrow 6px past the card edge because the implicit column was sized to the
aspect-ratio-derived width. `minmax(0, 1fr)` for columns. Do not reflexively
apply it to rows — doing that here collapsed a picture to 57px.

### C8. Scroll-snap eats the gutter unless you inset the snapport

`scroll-snap-align: start` snaps to the start of the **snapport**, which defaults
to the scrollport — the padding box. A full-bleed rail that cancels the gutter
with a negative margin therefore snaps to the bled-out edge, and mandatory
snapping scrolls the rail by one gutter **on load, before any gesture**. Measured:
`scrollLeft: 16` at 320, `27` at 768 — exactly one `--site-margin` every time, so
the first card sat flush against the screen edge instead of on the gutter line
every heading uses. `scroll-padding-inline: var(--site-margin)` fixes it.

### C9. Hyphenation limits can make things worse

`hyphenate-limit-chars` looked like restraint and was the opposite. Forbidding the
good break does not stop the word needing to break — `overflow-wrap: break-word`
takes over and produces a single orphaned letter on its own line. Measured at 320
with both `10 5 4` and `auto 4 3`: `betwee / n`, `industr / y`. The browser's own
dictionary breaks the same words at `be-tween` and `in-dustry`, which is correct
English and the whole reason `<html lang>` is set. Leave the limits alone.

### C10a. The grid-row trick does not animate `<details>`

`grid-template-rows: 0fr → 1fr` is the widely-recommended way to animate a
disclosure open, and it is the right answer for a `div` toggled by a class. It is
**not** the answer for `<details>`: the panel leaves `content-visibility: hidden`
on open, and a track list has no rendered start state to interpolate from, so it
jumps in a single frame. Measured — one frame from `0px` to `102.391px`, with the
transition correctly declared.

`block-size: 0 → auto` on `::details-content`, with `interpolate-size:
allow-keywords` scoped to the element, does animate, because the base rule
declares the zero. Add `transition-behavior: allow-discrete` so the discrete
content-visibility flip is carried across the duration rather than snapping at
the start.

**Always run a control.** An instant reading looks identical to a blind
measurement. Point the same sampler at something known to animate, in the same
browser on the same run, before concluding anything from a flat curve.

### C10. A table that scrolls must say so

Touch platforms draw scrollbars as an overlay that fades to nothing when idle, so
a wide table on a phone shows a cell cut mid-value with no indication there is
more. The four-layer scroll shadow is CSS alone and needs no script, no resize
listener and no state — see D4.

### C11. Astro does not allow JSX comments among attributes

`{/* … */}` between an element's attributes is a parse error that surfaces as a
cascade of unrelated TypeScript errors (`Cannot find name 'progress'`, `No value
exists in scope for the shorthand property 'data'`). Use an HTML comment above
the element.

### C12. Three ways to break a CDP probe string

The probes are template literals in the runner, so inside one:

- a nested `${…}` is interpolated by Node at definition time — SyntaxError at
  import. Use string concatenation.
- a backtick anywhere, **including in a comment**, closes the literal.
- `\s` is consumed as an unrecognised string escape, so `/\s+/g` compiles in the
  page as `/s+/g`. This one is nastier than the other two because it does not
  throw: it silently replaced every letter "s" in the evidence and printed the
  stat-card bug as `"di tributor in between"`. The check was right; its own
  report was lying. Write `\\s`.

### C13. Figma can bake a placeholder frame into an export

Three category images came out of Figma with the design's **dashed placeholder
stroke in the pixels** — the export caught the inner two rows of the frame's
outline. On the page it read as a dashed hairline across the hero and looked
exactly like a CSS bug.

Detect it by measuring, not by eye: saturation per pixel along each edge, counting
how many sit under 6. A dashed grey stroke over a warm photograph is a spike in
the top two rows that vanishes by the fourth.

```
range-cold-chain.jpg 2400×1167
  row 0: 41% neutral   row 1: 32%   row 2: 3%   row 3: 0%  ← photograph
```

No check was added for this, deliberately: it would be a heuristic over
photographic content, and a repo-wide sweep produced four false positives where
the greyness ran flat fourteen rows deep (a dark table, a foil mailer). It belongs
on the launch punch list as a human look at every asset.

### C14. Two small operational ones

- `npx astro dev stop` leaves the worker holding the port. The referent guard
  fires on the stale server, which is the guard working.
- Lazy images never load under `captureBeyondViewport`, so a screenshot script
  must walk the page first and flip `loading` to `eager` before shooting.

---

### C15. `getImage().attributes.width` is the width you ASKED for

Astro will not upscale: request 1320 from a 1037px source and you get 1037. But
`attributes.width` reports **1320**.

Build a `srcset` from it and you ship `… 1320w` pointing at a 1037px file. That
is worse than no `srcset`: a browser picking by descriptor takes that candidate
believing it is the largest and renders it SOFTER than the one it would
otherwise have chosen.

Clamp candidates to `picture.src.width`, the source's real intrinsic width. The
emitted HTML looks perfect either way — this was caught by running `sips` on the
emitted files.

### C16. Chrome divides `naturalWidth` by the emulated device pixel ratio

Under `Emulation.setDeviceMetricsOverride` with `deviceScaleFactor: 2`, an 880px
image reports `naturalWidth` **440**. A srcset audit written on `naturalWidth`
therefore reports that the browser is picking the smallest candidate everywhere,
when it is picking correctly.

Use `currentSrc`, mapped back through the element's own `srcset`. It names a
file and cannot be rescaled.

### C17. A leftover `astro preview` daemon makes every new port serve nothing

`astro preview` daemonises, and a second instance does not fail — it logs
`Preview server already running … SKIP_FORMAT` and exits. **Every subsequent
port you ask for then serves nothing**, while `curl -sf -o /dev/null` still
returns success, because an empty 200 is a success.

Three measurement passes here reported a clean result over nothing — an empty
`{}` of geometry and a contrast table with no rows reporting "tightest margin
+99.00". This is the port-4321 incident in miniature, in a throwaway script.

`lib/preview.mjs` and `lib/served.mjs` exist for this. **A script written
outside them does not inherit their protection**, so assert that the server is
serving THIS build — count a known string in the response against the same count
in `dist` — before trusting a single number.

### C18. Astro strips some HTML comments and not others

```astro
<BaseLayout>        a comment here — a direct child of a component slot —
  <!-- x -->        is STRIPPED and never reaches dist.

<div>               a comment here — inside a plain HTML element —
  <!-- x -->        SHIPS verbatim.
</div>
```

This is why B8's first fault injection passed: the comment was injected in the
first position. It is also why A8 must be checked against `dist` rather than
grepped in source — a source grep flags both and half its hits are false.

### C19. An `as const` array plus `.filter()` will not take a `number`

```ts
const WIDTHS = [440, 780, 900] as const;
const candidates = WIDTHS.filter(w => w < max);   // (440 | 780 | 900)[]
candidates.push(intrinsic);                       // ts(2345)
```

Annotate `const candidates: number[]`. A `readonly number[]` parameter does not
hit this, which is why the same code works in one function and not the next.

### C20. Turnstile's "flexible" widget has a hard 300px floor

`data-size="flexible"` governs the width ABOVE 300px and the iframe inside keeps
its own 300. A form column narrower than that — which includes a 320px phone AND
a two-column desktop layout at 768 — gets a horizontal scrollbar on the page.

`zoom`, not `transform: scale()`: `scale` paints smaller and leaves the original
box in layout, so it opens a gap under the widget. And a CONTAINER query, not a
media query — at 768 the viewport is wide and the column is 245px, so the
trigger is available width, not screen width.

### C21. Reading the tail of `astro check` hides errors

`npx astro check | tail -3` prints `0 warnings`, `0 hints` and the `Result`
line. **The error count and the errors themselves are above it.** A run with one
error looks identical to a clean one.

Grep the output for `error`, or read the `Result` block whole. This is why the
harness runs `astro check` first and parses all three counts.

### C22. Adding a landing page to a nav column wires two surfaces, and you will do one

The template's `NavColumn` is `{ title, links }` — **no `href`**. Its columns are
groupings, not pages, so nothing links a column heading anywhere.

The moment a project gives its sections real landing pages it adds `href` to that
interface, and there are **two** places that render a column: the desktop
mega-panel and the mobile fold. They are structurally different on purpose (a
disclosure vs a nested `<details>`), so the compiler cannot pair them.

Here the desktop panel got a "Browse …" button and the mobile fold did not, which
meant category pages were reachable on a laptop and not on a phone — and nobody
noticed, because the fold still listed the children under each heading.

It became total later: gating the child pages turned every child link into a
`<span>`, and the mobile menu went to **zero links**. A menu with no way out of
it. The gating was right; the fold had been one link short all along.

**Two lessons.** Any field added to `NavColumn` has two render sites. And a tap
target measured **11px** tall — `text-eyebrow` is small caps — needs
`py-xs -my-xs` to reach WCAG 2.5.8's 24px without moving anything, because *the
link existing* and *the link being usable* are different assertions and only the
first is visible in the markup. See B11.

---

## D. Worth promoting into the template

### D1. The catalogue adapter, and the proof that it works

One adapter, the only file that knows the source shape. No `CollectionEntry`
crosses into a component. The template says this; this project **measured** it.

A throwaway loader returning the twelve products as Sanity documents — system
fields, a `cdn.sanity.io` URL in place of a local image — was put behind the
adapter and the site built: 19 pages, 12 product pages, 12 footer links, 12 nav
panel links, the remote URL in the built HTML. Not one component, page or data
module changed.

Exactly two things had to move:

1. **The loader must project.** `.strict()` rejected `_id`, `_type`, `_rev`,
   `_createdAt`, `_updatedAt` — correctly. A GROQ query that names its fields
   returns none of them, so `.strict()` costs nothing and still catches the
   renamed field nobody updated. Keep it; do not reach for `.passthrough()`.
2. **One function breaks: `toPicture()`.** `getImage()` refuses a remote `src`
   without explicit dimensions. The CMS branch is
   `typeof picture.src === 'string'` → return the URL with the dimensions the CMS
   reports, no `getImage()` call.

Two things to carry into the template's own version:

- **`slug` is a field, not the entry id.** Read `entry.data.slug`, never
  `entry.id`. Filenames happening to equal slugs makes an id lookup work today
  and fail silently the day the id is a document id.
- **Do not ship a `render()`-based body helper before a body exists.** The one
  here was dead code and carried both couplings above.

### D2. `Media` — the pending-image box

An image slot and what stands in its place while photography is owed. Renders the
slot's own name, visibly, because the failure it guards against is shipping a
silent grey rectangle everyone stopped noticing. Dashed, not a flat fill, so it
reads as unfinished at a glance and in a screenshot. It self-deletes: when the
photographs land the component collapses to the `<img>` branch.

Name the caption prop `label`. Not `slot` — see C3.

### D3. `.fade-group`

Hovering one link in a column drops its siblings back. Applied to the container,
because "my sibling is hovered" is not expressible from the sibling. `:hover` and
`:focus-within`, and the opacity is a token per ground so faded text still clears
AA — with `fadeMatrix()` (B5) failing the run if it does not.

### D4. The CSS-only scroll shadow

Four background layers: two **cover** layers painted in the container's own ground
with `background-attachment: local` so they travel with the content, parked over
two **shadow** layers attached to the scrollport. At the left end the cover sits on
the shadow and hides it; scroll and the cover moves away. No script, no resize
listener, no state — the shadow is a fact about the scroll position because it
*is* the scroll position.

### D5. One logo asset, two lockups, no second file

The badge occupies the first 48 of the lockup's 228 viewBox units. Clip the link
to a 48-unit window and let the SVG keep its full width, and you get the badge
alone — no second file, no duplicated path in the markup for a hidden variant, no
`viewBox` swap (which CSS cannot do anyway). Express the inner width as
`min-width`, per C2.

### D6. `Breadcrumb` emits its JSON-LD from the same array

One `trail` prop renders the visible trail and the `BreadcrumbList` structured
data, so they cannot drift. Start every trail at Home — on this project the
product template started at Products while the two pages above it started at Home,
which is a visible inconsistency and an inconsistent structured-data graph for one
branch of the site.

### D7. The native scroll-snap rail

Ruled against Swiper on measurement: ~15KB gzipped for its pagination build
against 2KB for this entire site, to replace a scroller the platform already ships
correctly. The only thing the browser does not give is a pagination indicator —
431 B computes the visible fraction and the scroll fraction and writes two custom
properties; the shape and the colours are CSS. Ships with C8's
`scroll-padding-inline`.

---

### D8. A launch gate that the compiler enforces

`LAUNCH.productPages` in `src/consts.ts` with one derived helper, for shipping a
site before a whole route family is ready.

The mechanism is not the boolean — it is that **the view model's `href` becomes
optional**. A product with no page has no URL, and saying so in the type turns
every consumer into a compile error until it handles the absence. Four consumers
here, all found by `astro check`, none by grep. The alternative is a string
pointing at a route the build does not emit, which is a 404 nothing catches.

Each consumer renders a `<span>`, never an href-less `<a>` — that is still
announced as a link and still takes a tab stop.

Pair it with: `getStaticPaths` returning `[]` when the gate is shut, and NO dev
override. An override was tried and removed — it made `npm run dev` serve 52
links the build did not, so the preview disagreed with the artifact on exactly
the question under review.

### D9. Three checks, in priority order

`internalLinksResolve`, `cspMatchesTheSite`, `noCommentsInShippedHtml` — see B6,
B7, B8. All three found real defects on their first run. The first is the one to
take if only one is taken.

### D10. `build-icons.mjs`

Generates `favicon.svg`, `favicon.ico`, `apple-touch-icon.png` and the share
image from two brand sources. Run by hand, committing its output, following the
`subset-fonts.py` precedent — these change when the brand changes, which is
never, and a build step re-deriving identical bytes on every deploy earns
nothing.

Three things in it are not obvious:
- **One SVG answers both themes.** A `media` attribute on `<link rel="icon">` is
  not reliably honoured; the `prefers-color-scheme` rule goes INSIDE the SVG.
- **The raster icons must be flattened.** iOS renders alpha as black, so a
  knocked-out mark ships as a black shape on a dark square.
- **`sizes="32x32"` on the `.ico` link is load-bearing** — without it a browser
  may take the ICO as the better candidate and never look at the SVG.
- `sharp` cannot write ICO. The container is a 6-byte header, a 16-byte entry
  and a PNG verbatim; writing those 22 bytes beats a dependency.

### D11. Structured data as one `@graph`

`Organization` / `WebSite` / page-type nodes in `BaseLayout`, linked by `@id`,
with `pageType` a closed union rather than a string — a typo in structured data
fails silently because structured data has no runtime.

`BreadcrumbList` stays emitted by `Breadcrumb` from the same array that draws the
visible trail. That coupling is what makes it trustworthy and moving it into the
graph would break it.

The discipline worth copying: **every value is something the page already says.**
No address, telephone or `sameAs` that does not appear in the markup, and no
`SearchAction` on a site without search — it names an endpoint that 404s.

## E. What the template got right — leave it alone

- **Semantic colours, type scale and layout tokens outside `@theme`.** Illegal
  utilities do not compile. Worth the cost in C4.
- **Section as the only page-level parent.** No `max-w-*`, no gutters, no `py-*`
  rhythm below it. The one leak found here was reached through Tailwind's
  arbitrary-property syntax (`max-w-(--container-narrow)`), which token placement
  does not block — a contract could.
- **The referent guard.** A check whose counts are real but whose referent is
  somebody else's website has proven nothing. It fired twice here, correctly.
- **The JS census as a set of rulings.** "The bundler made it" is a reason, not an
  exemption — a shared-chunk pointer gets a named entry and a budget like anything
  else.
- **Read built output, not source.** Most of what is in section A was invisible in
  source and obvious in `dist/`.
- **Fault-inject every new check.** A check whose red path has never run is an
  assertion about the harness, not about the code. Every check in section B has
  its red path recorded above. Two of them PASSED their first injection and had
  to be rewritten (B7, B8) — which is the rule earning its place, not an argument
  against it.
- **`--scrim-strength`, and the band behind type on a photograph.** This project
  removed it, on the reasoning that the client's photographs arrived
  pre-darkened and the scrim was therefore redundant. **Do not repeat that.**

  `CategoryCard` and `CtaPlate` set `data-theme="dark"` and lay white type
  directly over an image, so with no scrim the contrast is whatever the
  photograph happens to be in that corner. Measured across five rounds of
  re-exported photography, heading contrast against a 3.0 requirement:

  ```
  round 1   3.17  3.25  3.17     all three pass
  round 3   2.13  2.60  1.78     all three fail
  round 5   2.97  3.64  2.80     one passes
  ```

  Photographs get chosen for how they look; the type needs a specific luminance
  in a specific corner. Those goals fight, and the photograph wins, because it is
  the thing anyone is actually looking at. The template's scrim is the insurance
  that makes the two independent — a project with genuinely pre-darkened art can
  turn it down, and a project without one is a single photo swap from a WCAG
  failure that nothing in the harness can see (B10).

  Five rounds of client re-exports, and still not resolved at the time of
  writing. The scrim was one line.
