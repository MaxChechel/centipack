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
  its red path recorded above.
