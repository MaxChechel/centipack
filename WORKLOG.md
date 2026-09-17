# WORKLOG

Append-only. Newest entries at the bottom.

This file is the project's memory: why something is the way it is, what broke and
why, and what is still undecided. It is not a changelog — `git log` already does
that. It exists because the reasoning behind a decision outlives the person who
made it, and because a bug fixed without its root cause recorded is a bug that
comes back wearing a different hat.

## Rules

- **Append-only.** Never edit or delete an earlier entry. A correction is a NEW
  entry that supersedes the old one, and says so. The record of having been wrong
  is part of the record.
- **Decisions carry their reasoning**, not just their outcome. "Chose X" is
  useless in six months; "chose X because Y, having measured Z" is not.
- **Bugs carry their root cause**, and the symptom that led to it.
- **Measurements are numbers**, with the conditions they were measured under.
- **Open questions are numbered** and stay numbered, so a later entry can close
  one by name.
- **Deviations from an instruction are recorded as deviations**, not quietly
  absorbed.

`AUDIT.md` is the companion file for findings and sanctioned deviations from
`ARCHITECTURE.md`. Create it when there is a first one.

---

## Template provenance

This project was created from the **outredge-system** template. The build record
for the system itself — every decision, every bug with its root cause, and the
eleven defects the harness caught before any client project existed — lives in
that repository's own WORKLOG at tag `v1.1.0`. It is worth reading once before
deviating from `ARCHITECTURE.md`.

Entries below are about **this project**.

---

## 2026-09-12 — Entry 0. Project start

**Client.** CentiPack — a cold chain packaging supplier selling to high-volume
compounding pharmacies. Background is Centigrade Logistics, a 2–8°C logistics
operation; CentiPack sells the packaging direct through its own manufacturing
partners rather than through distributors.

**Scope.** Static rebuild, seven page types, no CMS at launch. Sanity arrives
post-launch through the Content Layer loader swap §5 and §11 shape the content
layer for. SEO is a primary driver: the current centipack.com is client-side
rendered and close to invisible to crawlers.

**Inputs received.**

- Figma, one file, both breakpoints: `uMHWj1JRHoqmY9uOQNfyL6`, page
  `665:4939` ("05 Ready for review"). Frames are drawn at 1440 and 402.
  Section node ids, for the Phase 1 audit: Home `788:8519`, Products index
  `788:8780`, Category — Cold Chain `788:8952`, Category — Pharmacy Formats
  `788:9676`, Category — Custom Boxes `788:9850`, Product family (CMS)
  `788:9125`, About `788:9540`, Contact `788:9565`, plus shared Nav `788:7960`,
  CTA `788:8513` and Footer `788:8516`.
- Brand primitives: the Figma variable collections (Neutral, Secondary,
  Primary, Brand, plus the type styles and a separate "Mobile/" type
  collection). Pulled through the Figma MCP, not retyped.
- Typeface: DM Sans, at `opsz` 14, weights 400 / 500 / 700.
- Logo: the 228×48 lockup, exported from the navbar component.
- Domain: centipack.com.

**Agreed and not in the brief.** Copy is locked and lifted verbatim from the
Figma frames. No videos at launch. Nav IA is three product categories in fixed
order — Cold Chain & Shipping, Boxes, Bottles & Jars — with roughly twelve
products beneath them.

**Not touched, and not to be:** DNS, the Cloudflare dashboard, Turnstile and
Resend keys, the CRM decision. All are on the human punch list.

---

## 2026-09-12 — Entry 1. Phase 0 — design system

Tokens only. No page was touched, and no component was touched except `Logo`
(the mark) and `_styleguide` (which renders what changed).

### What the design turned out to be

CentiPack is **monochrome with one accent it barely spends**. The ink is
Brand/Black `#1f1f1f`, the grounds are a warm sand pair, and the only real hue in
the whole variable set — `text/brand` `#0e2a46`, a 210° navy — is bound to
exactly one table cell in the entire file (AUDIT F4). Ruled in session: the navy
is `--accent`, and the design's black primary button is **not** the accent. That
leaves a Button ruling owed in Phase 1; see open question 1.

### Semantic mapping

| token | light | dark |
| --- | --- | --- |
| `--bg-base` | `--sand-50` #f9f7f5 | `--gray-950` #1f1f1f |
| `--bg-subtle` | `--sand-100` #f2eee8 | `--gray-900` #292827 |
| `--bg-surface` | `--gray-0` #ffffff | `--gray-800` #333231 |
| `--text-primary` | `--gray-950` | `--gray-0` |
| `--text-secondary` | `--gray-700` | `--gray-300` |
| `--text-tertiary` | `--gray-600` | `--gray-400` |
| `--line` | `--gray-300` | `--gray-700` |
| `--line-strong` | `--gray-500` | `--gray-500` |
| `--accent` | `--accent-700` #0e2a46 | `--accent-300` #8fa8c2 |
| `--accent-contrast` | `--gray-0` | `--gray-950` |

The dark theme is **derived, not invented**: the design draws two dark regions
(footer, closing CTA) and those are its anchors. Two of the design's own dark
values could not survive the derivation and are recorded as AUDIT F2 and F3.

### Ramp moves, and what moved by how much

Three primitives are not the client's. Every other step is theirs, unchanged.

| primitive | client value | shipped | move | why |
| --- | --- | --- | --- | --- |
| `--gray-500` | `#8c8a87` L\*57.6 | `#888683` L\*56.0 | **−1.55 L\***, hue unchanged | As `--line-strong` it measured **2.98:1** on `--bg-subtle` and missed WCAG 1.4.11's 3:1 by two hundredths. Now **3.14:1**. |
| `--gray-400` | *(absent)* | `#adaba8` L\*70.1 | **new step** | The client ramp jumps L\*84.3 → L\*57.6 with nothing between. Dark `--text-tertiary` needs L\* ≥ 63.3 to clear AA on the lightest dark ground; this is that step, at L\*70 for margin. |
| `--gray-900` | *(absent)* | `#292827` L\*16.2 | **new step** | The dark ground ladder needs a rung between Brand/Black and Neutral/800. Placed at even L\* spacing. |

The dark accent `--accent-300` `#8fa8c2` is derived rather than taken from the
client's own `color/primary/300` `#bcc3cb`: that value clears the matrix but sits
at 13% saturation, close enough to dark `--text-secondary` `#d4d2cf` that neither
reads as distinct from the other. The derived step keeps hue 210° at 30%
saturation, so it is still legibly the brand blue at L\*68.

### The contrast matrix — this phase's acceptance test

```
contrast matrix        38 token pairs        0 failures
  text × background:  18 pairs, 0 below threshold, floor 4.73:1
  accent:              8 pairs, 0 below threshold, floor 5.21:1
  line:               12 pairs, 0 below threshold, floor 3.14:1
```

**Floor pair: `light --text-tertiary on --bg-subtle` = 4.73:1** (`#6b6967` on
`#f2eee8`), against a 4.5:1 threshold. The accent group's floor is
`dark --accent on --bg-surface` = 5.21:1; the line group's is
`light --line-strong on --bg-subtle` = 3.14:1 against 3:1.

### The check was fault-injected before it was believed

§9's rule is that a check whose red path has never run is an assertion about the
harness. The matrix is an existing check, but it had never been pointed at
CentiPack's tokens, so its referent was proven twice:

1. `--gray-500` reverted to the client's untuned `#8c8a87`. Result:
   `FAIL … light --line-strong on --bg-subtle = 2.98:1 (needs 3:1) — #8c8a87 on
   #f2eee8`, exit 1. Reverted.
2. Dark `--text-tertiary` reverted to `--gray-500`, the value the footer is drawn
   with. Result: `FAIL … dark --text-tertiary on --bg-subtle = 4.05:1` and
   `on --bg-surface = 3.52:1 (needs 4.5:1)`, exit 1. Reverted.

Both failed by name, with the offending hexes, on the built CSS. The matrix is
measuring this project.

### Type

Interpolated between the two widths the design is drawn at, 402 and 1440. Figma
keeps a separate "Mobile/" type collection; the clamps below are both
collections expressed as one scale.

| token | mobile → desktop | leading | tracking |
| --- | --- | --- | --- |
| `--text-h1` | 36 → 64 | 1.0 | −0.02em |
| `--text-h2` | 32 → 48 | 1.1 | −0.02em |
| `--text-h3` | 24 → 32 | 1.1 | −0.015em |
| `--text-h4` | 20 → 24 | 1.2 | −0.01em |
| `--text-h5` | 18 → 20 | 1.1 | −0.01em |
| `--text-h6` | 16 → 18 | 1.2 | −0.01em |
| `--text-large` | 18 → 20 | 1.3 | −0.02em |
| `--text-body` | 16, static | 1.3 | −0.02em |
| `--text-sm` | 15, static | 1.3 | −0.02em |
| `--text-caption` | 12, static | 1.3 | −0.02em |
| `--text-eyebrow` | 11, static | 1.0 | +0.03em |

`--text-h6` and `--text-large` are **interpolated, not measured** — the launch
design stops at h5 and sets every lede at 16px. They are kept so the scale has no
hole. See open question 4.

Figma expresses tracking as a percentage of size; the four values above are those
percentages in em. `--tracking-normal` is gone and `--tracking-snug` /
`--tracking-slight` replace it, because the design uses four trackings, not
three.

Leading moved wholesale: body is **1.3**, not the template's 1.55, because that
is what every body style in the design specifies. `--container-measure` is
capped at 66ch (the contact standfirst's 530px) rather than 68ch, which is what
keeps 1.3 readable.

### Layout

| token | value | read from |
| --- | --- | --- |
| `--site-margin` | clamp 16 → 48px | nav `px-16` at 402, `px-48` at 1440; every content frame agrees |
| `--container-main` | 90rem (1440px) | the frame width, gutters included — 1344px of content |
| `--container-narrow` | 63rem (1008px) | the home hero's 912px column plus its margins |
| `--nav-height` | clamp 66 → 82px | the navbar component at both widths |
| `--spacing-nav-logo` | clamp 152 → 228px | the lockup at both widths, one 4.75:1 ratio |
| `--spacing-section-sm/md/lg` | 40→64 / 48→96 / 64→120 | measured section tops: 48, 64 mobile; 72, 80, 96, 120 desktop |
| `--radius-sm / md / lg` | 2 / 3 / 6px | buttons and inputs / cards / Figma `radius/6` |
| `--spacing-control-md / lg` | 48 / 52px | every button / every text input |

**Six of the design's gaps do not land on a step** and each snaps to its nearest,
largest move 4px: `6 → 4` (footer social row), `10 → 8` (product card column),
`20 → 24` (footer link lists), `28 → 32` (nav link row), `40 → 48`, `80 → 64`.
All six are nav and footer chrome, each used once or twice.

`--spacing-control-lg` is new and is currently unreferenced: `FormField` applies
`min-h-control-md`, and switching it to `lg` is a Phase 2 component edit rather
than a Phase 0 token edit. See open question 9.

### Fonts — one variable face, because it was measured

DM Sans is a two-axis variable font (`opsz` 9–40, `wght` 100–1000). The design
applies three weights, all at `opsz` 14. Both ways of shipping that were built
and weighed:

```
three static instances at opsz 14, subset   12,712 + 12,912 + 12,960 = 38,584 B
one partial variable, opsz=14 wght=400:700, subset                     21,764 B
```

**44% smaller, in one request instead of three.** §7's "only the weights the
design applies" is honoured by the axis clip rather than by the file count:
nothing below 400 or above 700 exists in the file. Pinning `opsz` also removes
the axis from `fvar` entirely, so no stylesheet has to carry
`font-variation-settings`.

Astro emits the `@font-face`, a preload, and the metric-matched Arial fallback
(`size-adjust: 104.531%`, ascent/descent overrides) that is the CLS insurance.
Source and its OFL licence are committed under `src/assets/fonts/source/`.

### Logo

The Figma lockup, 228×48 — badge, wordmark and the "SPECIALTY PACKAGING & COLD
CHAIN" line, all outlines. Figma exported it at **28,666 B**; fills rewritten to
`currentColor`, then SVGO at two-decimal precision merged the three paths into
one: **8,741 B raw, 3,329 B gzipped**.

Two things worth recording. The badge's arrow is a **knockout** — a hole in the
path, not a second shape — so the whole mark is one colour and the ground shows
through the arrow, which is exactly why it can follow `--text-primary` into the
dark footer and come out as a light badge with a dark arrow. And Figma's export
wrapped the mark in a clip path whose rect *is* the viewBox: a no-op that would
have put a **duplicate id** on every page the moment the mark appears in both the
nav and the footer. Both `<defs>` and the clip are gone; the file carries no ids.

### Styleguide repairs

The page is the Phase 0 deliverable, so three things on it that had gone stale
were fixed rather than screenshotted:

- the type scale's size ranges were **typed by hand** and printed the template's
  numbers beside CentiPack's type. They are now read out of `global.css` by
  `rangeOf()`, which throws on a token it cannot parse. A label nobody can
  falsify is worse than no label — the same reasoning the contrast section was
  already built on.
- the spacing lede claimed a fluid scale (D2) and the header claimed
  `outredge-system`.
- the swatch grid was fixed at 15 columns with a 1:1.4 aspect ratio, which made
  the two-step sand ramp's swatches four times as tall as the neutral ramp's.
  Now a flex row with a fixed swatch height, so both families fill the row.

### Measurements

| | |
| --- | --- |
| font, shipped | 21,764 B (one file, 400–700) |
| CSS, built | 37,101 B raw · **8,358 B gzipped** |
| `/` HTML | 34,069 B raw · **7,794 B gzipped** |
| JS | **1,714 B gzipped** across 6 scripts — template modules only, nothing added |
| verify | 8 checks, 308 assertions, **0 failures** |

### Open questions

1. **Button's `primary` variant is `bg-accent`, and the design's primary button
   is Brand/Black.** With the accent now navy, the styleguide renders navy
   primary buttons — correct per the token layer, wrong against Figma. Phase 1
   owes a ruling: an `inverse` variant on Button, or a remap. Not started, since
   Phase 0 is tokens.
2. **Is the navy SKU cell (`788:9197`) a designed highlight or a slip?** It is
   the only use of `text/brand` in the file. If it is a highlight, what is the
   rule — latest size? most popular? If it is a slip, the accent has no rendered
   use at launch and lives only in hover and focus states.
3. **DM Sans 700 is spent on one table column** (the SKU cells). It costs
   nothing extra here — the variable face carries 400–700 in one file — but if
   that column should be 500, the axis clips to 400:500 and the file gets
   smaller. Worth one look at the spec table.
4. **`SectionHeader` renders its lede at `--text-large`; every lede in the design
   is 16px.** Either the block takes `text-body` for this project or
   `--text-large` becomes 16px and stops being a distinct step. Phase 2.
5. **Hero top spacing has two treatments in the design.** Home, About and
   Contact put hero content 160px from the page top; Products index, category
   and product family put it at 248px. `spaceTop="nav"` derives nav-height + one
   md step = 114 → 178px, which fits the second group and overshoots the first
   on desktop while undershooting it on mobile. Phase 1's section map has to
   assign `space`/`spaceTop` per hero, and may want a ruling on whether the
   compact heroes are `spaceTop="nav"` at all.
6. **Mobile H1 tracking is −5% where the H1 style is −2%** (AUDIT F5). Slip or
   intent? The build uses one em value across the clamp.
7. **Mobile card lists are horizontal scroll-snap sliders** with a progress bar
   (e.g. `788:8905` on the products index, `788:8913` the bar). That is
   ARCHITECTURE's open ruling 1 — slider policy — arriving for real. Phase 1
   has to rule: hand-rolled scroll-snap, or Lumos for Astro's adapted.
8. **Nav IA.** The brief names three categories — Cold Chain & Shipping, Boxes,
   Bottles & Jars — while the design's nav, footer and product index all use
   **Cold Chain & Shipping, Custom Boxes / Branded Boxes, Pharmacy Formats**,
   and the footer uses "Branded Boxes" where the index uses "Custom Boxes".
   Phase 1 needs the canonical three labels.
9. **`FormField` applies `min-h-control-md` (48px); the design's inputs are
   52px.** `--spacing-control-lg` exists for it; the component edit is Phase 2.

---

## 2026-09-12 — Entry 2. Ruling: the primary button is the inverse fill

**Closes open question 1 from Entry 1.** Instructed in review: the primary button
fills `#1f1f1f` on the light theme and `#ffffff` on dark. The accent stays navy.

**Why it needed a token and not a class.** `bg-primary` does not compile, on
purpose (§2.3) — `--text-primary`'s one legal role is text, and a fill carries a
different contrast obligation from a text colour even when the two happen to
resolve to the same hex. So the fill is its own named pair:

```
--bg-inverse        light: --gray-950   dark: --gray-0
--text-on-inverse   light: --gray-0     dark: --gray-950
```

exposed by `bg-inverse`, `border-inverse` and `text-on-inverse` — one utility per
legal role, as §2.3 requires. `text-inverse` is deliberately absent: the pair is
a fill and its label, not a colour anything may paint text with on its own.

`Button`'s `primary` variant becomes
`bg-inverse text-on-inverse border-inverse`, hovering to
`bg-transparent text-accent border-accent`. **The accent stays load-bearing**:
it is now what a pointed-at primary button comes up in, which keeps the failure
mode Entry 1 worried about — accent wiring broken and invisible — visible on the
most-used control on the site.

**A new token means a new row in the matrix.** The core 18 already happens to
measure this exact ratio (`--text-primary` on `--bg-surface` in light is the same
two colours), and that coincidence is precisely the argument for a dedicated
group: the day someone moves `--bg-inverse` off `--text-primary`'s value,
nothing else would notice. `inverseMatrix()` added to
`scripts/verify/lib/contrast.mjs`, reported as its own group.

**The new check demonstrated its failure mode before it counted**, per §9.
`--text-on-inverse` set to `--gray-300`:

```
FAIL contrast matrix   40 token pairs   1 failure
     inverse fill: 2 pairs, 1 below threshold, floor 1.51:1
         dark --text-on-inverse on --bg-inverse = 1.51:1 (needs 4.5:1) — #d4d2cf on #fff
```

Exit 1, named, from the built CSS. Reverted.

### The referent guard fired, unprompted, and was right

Running `verify` with a dev server still on 4321 produced:

```
Error: verify: http://localhost:4321 is already in use by something this project
did not start. Refusing to run against it.
```

That is the port-4321 incident's guard working on a live case rather than a
rehearsed one. Recording it because the guard had never fired in this project.

**Second-order finding, worth knowing before Phase 4:** `npx astro dev stop`
stopped the daemon supervisor (pid 39210) and **left the worker holding the port**
(pid 39193). The leak §9 warns about for `astro preview` exists for `astro dev`
too. `lsof -nP -iTCP:4321 -sTCP:LISTEN` is the check; killing the listed pid is
the fix.

### Styleguide, three more stale claims removed

Same class of bug as Entry 1's type ranges — prose asserting numbers the tokens
no longer hold:

- the button caption still said primary was the accent fill;
- the dark Section demo quoted the template's `5.05:1` tertiary floor. Now
  computed from the matrix — this project's dark floor is **5.59:1**;
- a CSS comment quoted the template's light floor of `5.14:1`. This project's is
  **4.73:1**.

### After the ruling

```
contrast matrix   40 token pairs   0 failures
  text × background:  18 pairs, floor 4.73:1
  accent:              8 pairs, floor 5.21:1
  inverse fill:        2 pairs, floor 16.48:1
  line:               12 pairs, floor 3.14:1

8 checks, 310 assertions executed — §9 PASS
```

Open questions 2–9 from Entry 1 stand.

---

## 2026-09-12 — Entry 3. Phase 1 — audit

Read from the Figma page `665:4939`, both breakpoints, plus the client's own
"Product image checklist" frame (`676:6358`) which turns out to be the catalogue
and the image plan in one artefact. Nothing built.

### 1. Page inventory

**Six templates, seventeen URLs.** The design draws six page types; two of them
are CMS templates that multiply.

| # | template | URL | purpose | Figma |
| --- | --- | --- | --- | --- |
| 1 | Home | `/` | Positioning and proof above the fold; routes to the three category pages and to Contact. | `788:8519` |
| 2 | Products index | `/products` | The whole catalogue on one page, grouped by category. The SEO hub. | `788:8780` |
| 3 | Category **(CMS ×3)** | `/products/[category]` | One category's range, its five (or two) products, and the other two categories. **Where SEO actually lands** per the client's own sitemap note. | `788:8952`, `788:9676`, `788:9850` |
| 4 | Product family **(CMS ×12)** | `/products/[category]/[product]` | One product: lede, hero image, six facts, and the size table. | `788:9125` |
| 5 | About | `/about` | Where the company came from and why that matters. | `788:9540` |
| 6 | Contact | `/contact` | The form. No CTA band — the page *is* the CTA. | `788:9565` |

Plus, **not designed and not in the brief**: `/404`, and the two the footer
already links to — `/terms` and `/privacy`. Open question 12.

**URL shape.** `/products/[category]/[product]`, nested, because the product
page's own breadcrumb is drawn as `Products / Cold Chain & Shipping / Insulated
Metallic Mailers`. Flat (`/products/[product]`) is marginally better for SEO and
would contradict the designed breadcrumb; the old site is one page with anchors,
so there is no legacy URL shape to honour either way. Open question 13.

**The catalogue, confirmed from the image checklist** — twelve products, and the
5 / 2 / 5 split matches the nav panel's three columns exactly:

- **Cold Chain & Shipping (5)** — Gel packs · Insulated metallic mailers · EPS
  foam coolers · Puncture Pack · Eco liners
- **Custom Boxes (2)** — Vial presentation boxes · Bottle & pump boxes
- **Pharmacy Formats (5)** — Vial kits · Pill bottles · Spray bottles · Pump
  dispensers · Cream & ointment jars

### 2. Section map

Grounds below are **proposed**, read off the reference renders; Phase 2's visual
diff against Figma settles them. `space` values come from the measured section
tops in Entry 1.

#### `/` — Home

| # | design section | Section props | contents |
| --- | --- | --- | --- |
| 1 | Text Hero | `width="narrow" spaceTop="nav" spaceBottom="lg"` | `h1`, lede, two `Button`s (primary + secondary) |
| 2 | Hero image | `width="full" space="none"` | one `<Image>`, full-bleed |
| 3 | Three layers | `space="lg"` theme default, ground `bg-subtle` | `SectionHeader` (split: heading left, lede + link right) + 3 × **CategoryCard** |
| 4 | Testimonial | `space="lg"` ground `bg-surface` | decorative quote glyph, quote at `text-h4`, attribution at `text-sm` — page markup, no block |
| 5 | Volume | `space="lg"` | 5 absolutely-placed images around a centred heading + body + `Button` — page markup |

**No CTA band on Home** — section 5 does that job.

#### `/products` — Products index

| # | design section | Section props | contents |
| --- | --- | --- | --- |
| 1 | Text Hero | `spaceTop="nav" spaceBottom="lg"` ground `bg-subtle` | **Breadcrumb**, `h1`, lede right-aligned in a second column |
| 2–4 | one band per category | `space="md" spaceBottom="none"` | heading + sublede + a trailing "How to choose…" link, then the product grid |
| 5 | CTA | `space="md"` | `CtaBanner` with a background image |

Bands 2–4 butt against each other — `space="none"` on the shared edge, which is
what that step exists for.

#### `/products/[category]` — Category

| # | design section | Section props | contents |
| --- | --- | --- | --- |
| 1 | Text Hero | `spaceTop="nav" spaceBottom="lg"` ground `bg-subtle` | **Breadcrumb**, `h1`, lede |
| 2 | Range image | `width="full" space="none"` | the category's "range header" image |
| 3 | Products | `space="lg"` | `h2` + a 3-up grid of **ProductCard** |
| 4 | The rest of the build | `space="lg"` ground `bg-subtle` | `SectionHeader` (eyebrow + heading) + 2 × **CategoryCard** |
| 5 | CTA | `space="md"` | `CtaBanner` |

#### `/products/[category]/[product]` — Product family

| # | design section | Section props | contents |
| --- | --- | --- | --- |
| 1 | Text Hero | `spaceTop="nav" spaceBottom="lg"` ground `bg-subtle` | **Breadcrumb**, `h1`, lede, a "Talk to us about this…" link, then the hero image and the six-fact `<dl>` |
| 2 | Sizes | `space="lg"` | centred `h2` + intro, **SpecTable**, footnote at `text-caption` |
| 3 | CTA | `space="md"` | `CtaBanner` |

#### `/about`

One `Section width="narrow" spaceTop="nav" space="lg"` — centred `h1`, a 900px
image, a single prose column and a closing standfirst at `text-large`. Then the
footer. No CTA.

#### `/contact`

One `Section spaceTop="nav" spaceBottom="lg"` holding a two-column grid: the
left column is heading + standfirst + divider + an email row; the right is the
form panel on `bg-subtle` with `p-lg`. Then the footer.

#### What the kit cannot express as it stands

Four things, all small, none structural:

1. **The mobile product lists are horizontal sliders.** At 402 the product grids
   become a scroll-snap row with a progress bar underneath (`788:8905`, bar at
   `788:8913`). ARCHITECTURE's **open ruling 1** arriving for real. Open
   question 10.
2. **`CtaBanner` has no background image.** The design's CTA is a 600px image
   panel with a dark gradient and white content on it. One optional prop, not a
   new block.
3. **The card recipe does not match.** See §3.
4. **The tertiary "Browse formats →" link** is neither a `Button` (no box) nor a
   prose `TextLink` (no underline). See §3.

### 3. New components — four, and three extensions

Every candidate was challenged against "can this be Section + blocks + the card
pattern?" Six survived that; two of the six collapsed into extensions.

**Build:**

1. **`ProductCard`** — card-pattern instantiation. Image, title, one-line
   summary, a circular arrow affordance. Renders at four sizes (259×321 index,
   416×458 category, 312×254 nav panel, 370×462 mobile), so it is fluid and
   sized by its grid, never by itself. Driven by the collection from the first
   commit.
2. **`CategoryCard`** — the photographic card: image fill, dark gradient to
   `#1f1f1f`, white title top, white body and arrow link bottom. Appears on
   Home (3), every category page (2), and the product family page. Second
   card-pattern instantiation; shares no structure with `ProductCard`, which is
   exactly why §4.2 makes them siblings rather than subclasses.
3. **`SpecTable`** — the product family's size table. Seven columns × six rows,
   a `<table>` with a scroll container that is keyboard-reachable
   (`tabindex="0"`, or axe's `scrollable-region-focusable` fails), a caption and
   a footnote. Not expressible as blocks, and the schema makes it optional so
   the block must self-skip.
4. **`Breadcrumb`** — `<nav aria-label="Breadcrumb"><ol>`, on the index, the
   category template and the product template. A block rather than markup for
   one reason: Phase 3 owes `BreadcrumbList` JSON-LD, and the structured trail
   and the visible trail must come from one source or they will disagree.

**Extend, do not build:**

5. **`Button` gains `size="link"`** — the "Browse formats →" tertiary link, used
   about fifteen times across six page types. It is a link with a trailing
   arrow and no box. Rejected: a new `ArrowLink` atom, because `Button` already
   owns the icon plumbing, the `href`→`<a>` switch and the disabled contract;
   a `size` entry costs one line in the `SIZE` map and keeps one API for
   everything that reads as an action.
6. **`CtaBanner` gains an optional `image`** — background image, gradient
   overlay, `theme="dark"`. One prop.

**Challenged away, staying as page markup:** the Home testimonial (one instance,
one page), the Home "volume" collage (five absolutely-placed images, bespoke to
one section), the product family's six-fact `<dl>` (a grid of label/value pairs
in one template), and the hero stat row (see open question 11).

**One recipe change, not a component.** The house card pattern is
`bg-surface + border-line + radius-md + padding`. **CentiPack's cards are
`bg-subtle`, no border** — one step *away* from the ground rather than raised
off it, consistently, on every card on every page. §4.2 says a card that needs a
different treatment gets it as a token decision in `global.css` where every card
gets it, not per component. So the recipe changes for this project and the
styleguide's card section states the new one. Recorded as AUDIT D4.

### 4. Contact form → the form kit

Five controls, and **the kit already has all five**. Nothing missing.

| design | `FormField` type | notes |
| --- | --- | --- |
| Full Name\* | `text` | required |
| Work email\* | `email` | required |
| Company | `text` | optional |
| Projected shipments per week | `select` | placeholder "Select a range — up to 10,000+"; **the option list is not in the design** — open question 14 |
| What are you shipping, and where? | `textarea` | 164px tall ≈ 5 rows |

No checkbox, no radio, no file upload, no switch anywhere in the design — so
nothing hits §4.1's build-on-demand list.

Two deltas to expect in the visual diff, both deliberate:

- **the select gets a chevron well** the design does not draw. A `<select>` drawn
  identically to a text input does not say "this opens"; the kit's chevron is
  separated by a hairline for exactly that reason.
- **borders are `--line-strong`**, not the design's `#d4d2cf` — AUDIT F1.

Submit is `Button variant="primary"`, full width, and **ships disabled** until
the endpoint is verified end to end (§8). That is asserted, not conventional.

### 5. Nav — the disclosure dropdown, not flat

**Recommendation: the template's disclosure dropdown, unchanged.** The IA
settles it rather than taste: three categories and twelve products cannot be a
flat bar, and the design does not try — it draws a full-bleed panel at
`788:8420`, 1440 × 334, containing three link columns (5 / 2 / 5, matching the
catalogue exactly), a **featured `ProductCard`** in a fourth column, and a scrim
over the page behind.

That is §4.3's dropdown, feature for feature, and the template already ships it:
one `<button aria-expanded>`, `Esc` closes and returns focus, outside click
closes, the panel is a grid on the container gutters, and the whole thing costs
**347 B gzipped** — already in the census, already in the keyboard check.

**Mobile** (`788:7961`, `788:8043`) is the same tree folded into the native
`<details>` menu: three grouped lists with eyebrow headings, the featured product
card, an "About" link, and a pinned "Contact us" button on a solid bar at the
bottom. The pinned bar is the only addition; no extra JavaScript.

**Fixed order, per the brief:** Cold Chain & Shipping → Custom Boxes → Pharmacy
Formats.

### 6. Product collection schema

CMS-shaped from the first commit (§5): these are the field names, types and
optionality a Sanity document would carry, so the loader swap changes one line.
Components take view models from `src/lib/products.ts` and never a
`CollectionEntry`.

```ts
const products = defineCollection({
  loader: glob({ base: './src/content/products', pattern: '**/*.md' }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string(),
        // Explicit, not derived from the filename: Sanity will carry a slug
        // field, and the adapter is the only thing that should know the
        // difference between the two.
        slug: z.string(),
        category: z.enum(['cold-chain-shipping', 'custom-boxes', 'pharmacy-formats']),
        order: z.number().int().nonnegative(),

        // The card's one-line sublabel: "3-32 oz · 4 variants".
        summary: z.string(),
        // The product page's lede, one paragraph.
        lede: z.string(),

        // The client's own image plan (Figma 676:6358) is exactly three slots
        // per product, and only slot 01 exists for most of them today. The
        // schema tolerates the gap; the blocks self-skip on it.
        images: z
          .object({
            main: z.object({ src: image(), alt: z.string() }),
            sizeRange: z.object({ src: image(), alt: z.string() }).optional(),
            branded: z.object({ src: image(), alt: z.string() }).optional(),
          }),

        // The six label/value cells under the hero. An array rather than named
        // keys because the labels differ by category — a cold chain product has
        // "Temperature range", a jar does not.
        facts: z
          .array(z.object({ label: z.string(), value: z.string() }))
          .default([]),

        // Ruled post-launch. Pages must render correctly without it.
        specTable: z
          .object({
            caption: z.string(),
            note: z.string().optional(),
            columns: z.array(z.string()).min(2),
            rows: z.array(z.array(z.string())).min(1),
          })
          .optional(),
      })
      .strict(),
});
```

A **second collection for the three categories** rather than a typed module,
for the same reason: each carries a title, a lede, a range image, a "how to
choose" link label and an order, and all five are content.

Two adjustments to the brief's proposal, both from what the design actually
shows: `description` is split into `summary` (the card line) and `lede` (the
page paragraph) because they are different copy in every frame; and `facts`
is new — the six cells under the product hero are content, not chrome.

### 7. Numbered open questions

Continuing Entry 1's numbering. **2–9 still stand**; 10–14 are new.

10. **Slider policy.** The mobile product lists are horizontal scroll-snap rows
    with a progress bar. Recommendation: CSS scroll-snap with `overflow-x:auto`
    and no JavaScript, and **drop the progress bar at launch** — it needs a
    scroll listener to be honest, and a decorative bar that does not track the
    scroll is worse than none. If the bar is wanted, it is a new module in the
    census. This closes ARCHITECTURE's open ruling 1 either way.
11. **The hero stat row is hidden in Figma but present in the reference
    renders.** `788:8553` — "1 point of contact / 0 distributors in between /
    20 years in cold chain industry" — is `hidden="true"` in the file, and the
    hidden copy differs from the rendered copy ("1 supplier, not five",
    "20 years in cold chain before this"). Ships or not? And if it ships, which
    wording?
12. **`/terms` and `/privacy` are linked from every page and not designed.**
    Also `/404`. Three pages of scope not in the brief.
13. **URL shape** — nested `/products/[category]/[product]` per the designed
    breadcrumb, or flat `/products/[product]`?
14. **The "Projected shipments per week" select has no options in the design** —
    only the placeholder "Select a range — up to 10,000+". Need the ranges.
15. **The product hero stacks four image layers** (`788:9139`–`788:9142`), which
    reads as alternatives rather than a gallery. Confirming: one hero image per
    product, slot 01 from the image checklist?

---

## 2026-09-12 — Entry 4. Phase 2 (partial) — the homepage

Built at your request ahead of the rest of Phase 2, so there is something real to
give feedback on. **Six templates remain.**

### What had to be built to build one page

The homepage is five Sections, but the nav and the footer are on it, and both are
catalogue-driven — so the data layer landed first:

- **`src/content/products` — 12 entries**, and **`src/content/categories` — 3**,
  CMS-shaped per Entry 3's schema. The template's `items` collection, its adapter
  and `ItemCard` are deleted; nothing referenced them once the styleguide was
  repointed.
- **`src/lib/catalogue.ts`** — one adapter for both collections. No component
  anywhere takes a `CollectionEntry`.
- **`src/data/navigation.ts`** now *derives* from the catalogue. There is no
  hand-written product list in the repo: the nav panel's three columns, the
  mobile menu and the footer's three link columns are one traversal, so a product
  added to `src/content/products` appears in all of them or in none.
- **`Media`, `ProductCard`, `CategoryCard`** — three of the five the audit
  called for. `Breadcrumb` and `SpecTable` are not needed until the product pages.
- **`Button` gains `size="link"`** and an `icon="square"` — the small filled mark
  the design puts before every primary button's label.

### Two schema changes, both because the copy does not exist yet

`lede` is **optional** on products: the design writes one product lede (insulated
metallic mailers) and the other eleven are owed. And every image slot is
optional. Inventing eleven paragraphs to satisfy a required field would put
placeholder prose into a repo whose brief says the copy is locked — an optional
field is the honest shape for copy that is coming.

### Images: placeholders, by instruction

Instructed mid-build: empty placeholders for now. `Media` renders a **dashed**
well carrying the slot's own name, because a flat grey box is a thing everybody
stops seeing after a day and the failure that leads to is shipping one.

**The processed photography is staged but unreferenced** in
`src/assets/home/` — nine images pulled from the Figma nodes, flattened onto the
page ground, capped and written as progressive JPEG (642 kB total). They are
committed rather than deleted because the Figma asset URLs expire in seven days
and re-deriving them costs round trips that will not be available later. Nothing
imports them; wiring them up is one prop per slot.

### Three things the build got wrong, and what caught them

1. **Four dead classes**, caught by the dead-class check on its first run against
   a real page: `backdrop-blur-sm` (the `--blur-*` reset in §2.2 had killed the
   scale, so a real token had to be re-exposed — `--blur-overlay`),
   `text-line` (`--line`'s legal roles are `border-line`/`divide-line`, and there
   is no text role, correctly), `p-site-safe` (invented), and
   `after:content-[""]` — whose quotes are HTML-escaped on the way into the
   attribute, so the class ships and the rule never generates. That last one is
   §2's "the scanner reads source as text" wearing one more hat; the stretched
   link is a CSS rule now.

2. **A §3.1 violation I wrote myself.** `max-w-(--container-narrow)` on a child
   of a Section — the exact thing "no max-w page container below Section" exists
   to stop, reached through Tailwind's arbitrary-property syntax rather than the
   `max-w-*` utility the token being outside `@theme` already blocks. Both
   sections take `width="narrow"` instead. **Worth noting for the spec:**
   `max-w-(--custom-property)` is a hole in that enforcement that the token
   placement does not close.

3. **The stat cards overflowed the hero band at 390** and landed on the headline.
   Root cause: the hero is **art-directed** — 4:5 at 402, 5:3 at 1440 — and the
   build used one ratio. `Media` now applies its ratio through a
   `--media-ratio` custom property rather than an inline `aspect-ratio`, because
   an inline style cannot be beaten by a class, and `.hero-media` redefines it at
   `md`. The stats are three-across at every width, as drawn.

### The type system refused a breakpoint, and it was right

The stat label wanted `text-caption` at mobile and `text-h5` at desktop.
`md:text-h5` is not a utility and cannot be: the scale is not in `@theme` (§2.1)
and the named styles are the only way to apply type. **Type never jumps at a
breakpoint here.** The tokens are already fluid — the stat value is 36px at 402
and 64px at 1440, which is exactly what the design draws — so the breakpoint
changes padding and nothing else.

### Deliberate departures from the design

- **The hero lede ships at both widths.** The design drops it at 1440 and keeps
  it at 402. Hiding content at one breakpoint is a content-loss pattern rather
  than a layout, and that sentence is also the site's meta description. Open
  question 16.
- **The footer's "Branded Boxes" column is titled "Custom Boxes"**, because the
  title comes from the categories collection and there is one of it. Question 8.
- **Dark is conditional on a photograph existing.** A CategoryCard is dark
  because it sits on a darkened picture; with the slot pending there is nothing
  to darken, so it renders as a light well. One flag, two honest renderings.

### Measurements

| | |
| --- | --- |
| `/` HTML | 44,894 B raw · **8,696 B gzipped** |
| CSS | 41,218 B raw · **8,920 B gzipped** |
| JS | **1,714 B gzipped** — nav disclosure only, nothing added |
| verify | 8 checks, 334 assertions, **0 failures** |

### Open questions

11 is **closed**: the stat row ships. The hero frame's own export renders it, so
the hidden `788:8553` was a superseded copy — the live wording is "1 point of
contact / 0 distributors in between / 20 years in cold chain industry".

16. **The hero lede at desktop** — shipped at both widths, against the design.
    Confirm or revert.
17. **The "We produce at volume" collage.** The design scatters five pitched
    product shots around the closing block at specific offsets. Against empty
    boxes that placement cannot be judged, so it is a plain five-up grid for now
    and the collage is deferred until the photography lands.
18. **`/products`, `/about`, `/contact` and all twelve product URLs are linked
    and do not exist yet.** Expected mid-Phase-2; noting it so the 404s in
    review are not mistaken for bugs.

---

## 2026-09-12 — Entry 5. Homepage — first review round

Nine items from review, all applied. `npm run verify`: 8 checks, **351
assertions, 0 failures**; the matrix is now 42 pairs.

### Nav

The bar's links move to the right and join the call to action, so the logo holds
the left edge alone and the whole interactive surface is in one place.

**The dropdown's fourth column was wrong, and I had misread it.** It is not a
featured product — it is a *"Not sure which build?"* help card: a question, a
sentence, and a route to Contact. What the design actually draws (788:8447),
against what shipped:

| | was | now |
| --- | --- | --- |
| panel links | 16px + a summary line under each | 16px alone, gap 16 |
| per column | — | its own "Browse cold chain →" link |
| fourth column | a `ProductCard` | the help card |

The browse labels are a third label per category, so `navLinkLabel` joins
`cardLinkLabel` and `guideLinkLabel` in the categories collection — three
surfaces, three labels, one record. The help card is markup inside `Nav`: it
appears exactly once and it is nav furniture rather than content, so §4.2's
counting rule says do not make it a component.

### Hero

- **The lede is gone.** Entry 4 shipped it at both widths against the design;
  ruled out. **Open question 16 is closed** — the sentence keeps doing its real
  work as the page's meta description.
- **The photograph is in**, and the stat cards sit on it as real cards.
- **Primary hover lifts the fill one step instead of reversing it.**
  `--bg-inverse-hover` is a new token — gray-800 on light, gray-300 on dark —
  and **the matrix checks the hover state too**, which is why it went from 40
  pairs to 42. A label that goes illegible on hover fails for exactly as long as
  anyone is looking at it.

### SectionHeader — two fixes, one of them a silent bug

The "Browse all formats →" action was being **dropped on the floor**:
`SectionHeader` had no default slot, so the Button passed as a child rendered
nowhere and nothing said so. It has one now, under the lede.

And **the lede renders at `--text-body`, not `--text-large`** — every lede in the
design is 16px. **This closes Phase 0's open question 4.** `--text-large` keeps
its value for the first standfirst that wants it.

### Quote

The real glyph (788:8625), pulled as SVG and run through the same
currentColor + SVGO path as the logo — 341 B down to 133 B. Quote at
`text-h3` (24 → 32px), which is what the design sets.

**And the two rules, which are different rules**: the section carries a bottom
border across the full width; the card inside it carries left and right borders
at the container edge. That pair is what makes the quote read as a plate set
into the page rather than as another band.

### The closing collage, placed

Five shots at the design's own offsets, carried as percentages of the 1344 × 967
box they are drawn in — `--at-left` / `--at-top` / `--at-width` per item —
because they are MEASUREMENTS, and a measurement baked into a class name is one
nobody can check against the source. Two of them bleed past the container into
the gutters, which is the character of the arrangement and the reason a grid
could not stand in for it. Absolute from `md` only; below that there is no room
to scatter anything. `aria-hidden`, because five alt texts describing product
photographs would be five interruptions on the way to the button.

### Card order on Home is NOT catalogue order

Pharmacy Formats → Custom Boxes → Cold Chain & Shipping. The lede names them
inward-out — "the format it is dispensed in, the custom box, and the shipper" —
and the heading calls them three layers, so the cards read in the order of the
sentence they sit under. The nav and footer keep the catalogue's order, which is
what someone browsing a menu expects. Same three records, ordered per surface.

### A Phase 0 call corrected: `--spacing-5xl`

The footer wanted ~200px between its link columns and its legal rule, and the
scale topped out at 96px. Phase 0 collapsed the template's fluid 80 → 192 step
down to a static 96 and that was too aggressive. `--spacing-5xl: 12rem` restores
a top step; the footer's gap above the rule is `mt-5xl` and the space below the
© line is Section's own `spaceBottom`.

### Two arbitrary widths, both stated

`max-w-[49.625rem]` on the pull quote (794px) and `max-w-[38.75rem]` on the
volume block (620px). Neither lands on a token — `measure` is 66ch of the
CURRENT size, which at 32px is over a thousand pixels — and each is used once,
which §4.2 permits with a justifying comment. **A third editorial width makes
this a token.** The volume one is load-bearing rather than cosmetic: at the
container's full width the heading runs under the two side shots.

### A screenshot artifact worth knowing about

The category cards read as solid black in the first capture. Not a bug: they are
`loading="lazy"`, and `Page.captureScreenshot` with `captureBeyondViewport`
renders geometry without triggering an IntersectionObserver, so the images never
loaded. The review script now walks the page before capturing. **Anything that
screenshots this site below the fold has to do the same**, including whatever
takes the Phase 4 evidence.

### Measurements

| | |
| --- | --- |
| `/` HTML | **9,296 B gzipped** |
| CSS | **9,140 B gzipped** |
| JS | **1,714 B gzipped** — unchanged, nothing added |
| images on `/` | 9 webp, emitted by `astro:assets` at 3 widths each |
| verify | 8 checks, 351 assertions, **0 failures** |

### Open questions

16 closed (hero lede removed). 17 closed (collage placed).

19. **The volume collage has no mobile arrangement in the design.** It falls back
    to a two/three-up flow strip below `md`. Worth a look when the motion pass
    lands, since the animation presumably has an opinion about it.

---

## 2026-09-12 — Entry 6. Phase 2 — the products index

`/products` built. **Four templates remain**: the category page, the product
family page, About and Contact. `npm run verify`: 8 checks, **373 assertions,
0 failures**, now sweeping four pages at seven widths.

### Two of the audit's components, built

- **`Breadcrumb`** — `<nav aria-label="Breadcrumb"><ol>`, last crumb unlinked and
  carrying `aria-current="page"`. It emits the `BreadcrumbList` JSON-LD from the
  SAME array, which is the whole reason it is a block: Phase 3 owes that markup,
  and a structured trail that disagrees with the visible one is the failure
  nobody sees.
- **`CtaPlate`** — the design's own `cta` component.

### The audit was overruled on the CTA, and the review was right

Entry 3 called this an extension: one `image` prop on `CtaBanner`. It is not.
`CtaBanner` is a bordered well that sits IN a ground; `CtaPlate` is a
photographic plate that REPLACES the ground for 600px. Different structure,
different height behaviour, different theme rule. I had already written the
`image` prop, and the class list was forking on a single boolean in three
places — which is two components wearing one name. Reverted; `CtaBanner` is
untouched, and the two are siblings the way ProductCard and CategoryCard are.

### The five-up grid is NOT a five-up grid until `lg`

The design draws these cards five across at 1440, where each column is 259px.
Applied at `md` that is a 166px column holding a 1:1 photograph and a two-line
title — not a card any more.

**The sweep found it as a bug before I noticed it as a design problem:**

```
FAIL overflow + structure   /products @768px — overflows (769 > 768)
     unclipped: div.gap-2xs, h3.text-h5, p.text-caption, div.media-slot, span.product-card-go
```

One rounded pixel out of a five-column track in a fractional container. The fix
is moving the grid to `lg` and letting 768 keep the rail, which is the right
layout anyway — but the pixel is what made me look.

### The rail, and what it does not have

Below `lg` the row is a **CSS scroll-snap rail**: `overflow-x: auto`, snap
points, negative gutter margins so it bleeds to the page edge while the first
card still lands on the container's gutter line. **Zero JavaScript.**

**The progress bar the design puts under it is not built.** It needs a scroll
listener to be honest, and a decorative bar that does not track the scroll is
worse than no bar. This is ARCHITECTURE's open ruling 1 (slider policy) resolved
the way Entry 3 recommended — hand-rolled scroll-snap, nothing adopted — and it
stays open ONLY on the question of whether the bar is wanted enough to pay a
module for. Open question 10, narrowed.

`tabindex="0"` and an `aria-label` on the rail: a scrollable region that cannot
be reached by keyboard fails WCAG 2.1.1, and axe's `scrollable-region-focusable`
is what catches it. The JS census rose to 2,061 B only because `/products`
carries the nav disclosure like every other page — **no new JavaScript was
written for this page.**

### The column is the unit, not the row

`grid-template-columns: repeat(5, minmax(0, 1fr))` means Custom Boxes' two cards
sit at the same width as Cold Chain's five rather than stretching to fill the
row — which is what the design draws, and the right call: a card that grew
because its category is short would read as a different kind of thing.

### Measurements

| | |
| --- | --- |
| `/products` HTML | **12,090 B gzipped** |
| CSS | **9,472 B gzipped** |
| JS | **2,061 B gzipped** across 7 scripts — nav disclosure × 4 pages, nothing new |
| verify | 8 checks, 373 assertions, **0 failures** |

### Open questions

20. **ProductCard's image band starts lower when the title wraps to two lines.**
    The cards are equal outer height and their bottoms align; the pending boxes
    do not, because the title block above them is taller. The design centres the
    photograph behind the whole card instead. Worth deciding once the real
    images are in, since a photograph reads differently from a dashed box.
21. **The rail's progress bar** — see above. Ship without, or pay for a module?

---

## 2026-09-12 — Entry 7. The slider ruling, and a resize defect

Two items from review: the rail wants pagination, and resize was not handled.
Both done. `npm run verify`: 8 checks, **376 assertions, 0 failures**.

### ARCHITECTURE open ruling 1 — CLOSED. Native scroll-snap, not Swiper.

Swiper was proposed in review and is **rejected on measurement**:

| | gzipped |
| --- | --- |
| Swiper, pagination build | ~15 KB |
| Swiper, full bundle | ~40 KB |
| **this site's entire JavaScript, all four pages** | **2,820 B** |
| the module actually written | **431 B** |

That is **7× to 20× the whole site's budget to replace a scroller the platform
already ships**. And the cost is not only bytes: a JavaScript slider owns touch
physics, momentum, rubber-banding, `scroll-behavior`, keyboard arrows, focus
management and screen-reader announcement — all of which the native rail gets
right today, for free, and none of which can regress. Swiper would take on that
entire surface to deliver the one thing CSS cannot: a pagination indicator.

**So the indicator is the only thing written.** 431 B computes two numbers —
the visible fraction and the scroll fraction — and writes them as custom
properties. The shape, the colours and the track are CSS. Declared in the census
with that reasoning and a 500 B budget.

**If a future design needs coverflow, synchronised pairs or free-mode inertia,
that is the moment to reopen this** — those are things the platform genuinely
does not do. Pagination is not.

Measured behaviour, driven with real scroll events at four widths:

```
390   tabindex 0   bar shown    thumb 43px in a 143px track, travels 2 → 100px
768   tabindex 0   bar shown    thumb 213px in 285px,        travels 7 → 73px
1024  tabindex -1  bar hidden
1440  tabindex -1  bar hidden
```

The thumb reaches the track's end exactly (100 + 43 = 143), which is the
arithmetic being right rather than approximately right.

### The resize defect was real, and it was an accessibility one

**`disclosure.ts` had no resize handling at all.** Open the desktop dropdown,
narrow the window: the trigger goes `display: none` with `aria-expanded="true"`
still on it. The panel is invisible, the state is not, and **a hidden control is
now telling a screen reader it is expanded** — for as long as the window stays
narrow. The mirror case is the mobile `<details open>` surviving into desktop.

`src/scripts/viewport.ts` closes both on `matchMedia().change` — once per
crossing, not once per pixel. Verified: panel opened at 1440, window resized to
390, `aria-expanded` reads `false`.

### A rounding bug the first implementation shipped

The rail's tab stop was toggled on `scrollWidth - clientWidth > 1`. Measured at
1440: **scrollWidth 1350 against clientWidth 1344 — six pixels of pure
rounding**, because `scrollWidth` is an integer and five columns of 259.2px each
round up. The desktop grid was therefore being called scrollable and keeping a
tab stop on a region that cannot scroll.

`overflow-x: visible` is the ground truth — an element with it cannot scroll
whatever its content extent reports — so that is what the module tests now, with
the overflow figure as a secondary condition.

### Why `tabindex="0"` is in the HTML and not added by the module

A scrollable region that cannot be reached by keyboard fails WCAG 2.1.1. That
has to be true **before any JavaScript runs, and forever if none does** — so the
markup ships the safe state and the module removes the stop where it is not
earned. The same rule puts the progress bar in the markup with `hidden`: no-JS
gets a working rail with no bar, rather than a bar frozen at zero that lies
about where you are.

### One census entry for two behaviours

`disclosure.ts` and `viewport.ts` are separate modules — one behaviour each,
per §6 — but Astro bundles both into one inline script because both belong to
the nav and ship on every page. The census declares them as **one entry naming
both**, because one script is what `dist` actually contains, and a census that
reports modules the bundler merged is a census describing source rather than
output. Nav script: 429 B gzipped against a 700 B budget.

### Measurements

| | |
| --- | --- |
| rail pagination | **431 B gzipped** / 500 B budget |
| nav (disclosure + breakpoint reset) | **429 B gzipped** / 700 B budget |
| total JS, whole site | **2,820 B gzipped** across 8 scripts |
| verify | 8 checks, 376 assertions, **0 failures** |

### Open questions

21 closed — the bar is built, natively. 10 closed — open ruling 1 is ruled.

---

## 2026-09-12 — Entry 8. Second review round — two real card bugs

Five items. `npm run verify`: 8 checks, **380 assertions, 0 failures**.

### The product card was overflowing its own box, and I could not see it

Review attached a screenshot of the cards. Measured at 1440 rather than eyeballed:

```
Gel packs               media inset L/R = 16 / -6    go inset = -6
Insulated metallic …    media inset L/R = 16 / 16    go inset = 16
EPS foam coolers        media inset L/R = 16 / -6    go inset = -6
```

**The picture was 22px wider than the card's content area, and the arrow sat six
pixels past the card's right edge.** Root cause: `.product-card` declared
`grid-template-rows` but no columns, so the grid had one IMPLICIT column, which
sizes to its widest item — and the media slot's `aspect-ratio` turns its row
height into a width. A 249px-tall row became a 249px-wide picture inside a 227px
content area. `grid-template-columns: minmax(0, 1fr)` is what stops a grid item
from growing its own track.

Worth keeping: **only the cards whose title fitted on one line were broken.** The
two-line card had a shorter picture row, so its aspect-derived width happened to
fit — which is why the bug looked like a wrapping problem and was not one.

**Then I over-corrected and the check caught that too.** Setting the rows to
`minmax(0, 1fr)` gave the picture row a zero floor and it collapsed from 170px to
57px. `1fr` is `minmax(auto, 1fr)`; the zero form is a different thing and I
reached for it out of symmetry with the column.

### And the ragged tops, which were a real design bug

Open question 20, closed. A title that wraps used to push its picture down and
shrink it, so a row of five cards showed pictures at two sizes.
`.product-card-title { min-block-size: 2lh }` reserves exactly two lines of
whatever the type style is — `lh` is the element's own line box, so there is no
magic number to go stale, and a browser without it degrades to the old behaviour
rather than a broken layout.

After: all five cards 259 × 334, picture inset 16/16, picture top 96, picture
height 170, arrow inset 16. Identical.

### The card's window is landscape even though the source is square

The client's image plan shoots main product shots at 1:1. The design crops them
to 328 × 246 inside a 259-wide card — the picture BLEEDS and is clipped — so the
card's window is 4:3. Changed from `1 / 1`, which is what was making the cards
340px tall against the design's 321.

### The rest

- **Primary hover is `#333231`** — confirmed from the built CSS:
  `--bg-inverse-hover: var(--gray-800)` and `--gray-800: #333231`. It was already
  right; verified rather than assumed.
- **The nav's call to action is a regular button**, not `size="sm"`. The design
  draws it at 48px like every other primary button.
- **The quote band takes more space above than below** — `pt-5xl pb-4xl`, and the
  internal gap moves to `gap-3xl` (64px), which is what the design sets between
  the mark, the quote and the attribution.
- **Neither the quote band nor the closing band is elevated.** The quote had
  `bg-surface`; in Figma neither section declares a fill, so both inherit the
  page ground. **The rules are what separate that band, not a change of ground**
  — which is the whole reason it is drawn with borders rather than a fill.

### Open questions

20 closed — the picture row aligns across a row of cards, always.

---

## 2026-09-12 — Entry 9. The hover bug, and the hole in the harness that hid it

Four items. `npm run verify`: 8 checks, **394 assertions, 0 failures**.

### The primary button's hover was resolving to TRANSPARENT

Reported twice — "hovers to white" — and I checked the token twice, found
`--bg-inverse-hover: var(--gray-800)` and `--gray-800: #333231`, and reported it
as already correct. **Both times I checked the wrong thing.**

Driving a real mouse over the hero button and reading back the computed style:

```
hero: theme=none  rest=rgb(31, 31, 31)  hover=rgba(0, 0, 0, 0)
```

**`--bg-inverse-hover` was declared in `[data-theme='light']` and
`[data-theme='dark']` and NOT in the bare `:root`.** Most of this site renders
with no `data-theme` attribute at all, so on those pages the token did not exist,
`background-color: var(--bg-inverse-hover)` was invalid at computed-value time,
and the property fell back to `transparent`. The fill vanished and the near-white
page ground showed through — **which is exactly "hovers to white"**, and is why
the report was right and my two checks were not.

An earlier CDP probe using `CSS.forcePseudoState` reported no change at all,
which sent me looking in the wrong place: forced pseudo-states do not reach
`getComputedStyle`, and headless Chrome was reporting `hover: none` so the
`@media (hover: hover)` block never applied either. **The only probe that told
the truth was a real `Input.dispatchMouseEvent` with `matchMedia('(hover:
hover)')` asserted first.** Worth remembering for anything else hover-shaped.

### The contrast matrix could not have caught it, so it now does

42 pairs passed while the bug was live, every run, because **the matrix asks the
`light` and `dark` scopes by name and never asks the unstamped one** — and the
unstamped one is the state most of the site is in. A token present in both theme
blocks satisfies every ratio and is still missing where it is used.

`rootDeclaration()` added to `scripts/verify/lib/contrast.mjs`: thirteen semantic
tokens, each resolved against `scopes.root` alone, so a token that only exists
under a theme selector cannot answer.

**Fault-injected before counting it**, per §9 — by re-introducing the exact bug:

```
FAIL contrast matrix   55 token pairs …, plus :root declaration   1 failure
     text × background: 18 pairs, 0 below threshold, floor 4.73:1
     accent: 8 pairs, 0 below threshold, floor 5.21:1
     inverse fill: 4 pairs, 0 below threshold, floor 10.93:1
     line: 12 pairs, 0 below threshold, floor 3.14:1
     root declaration: 13 tokens, 1 missing from :root
         --bg-inverse-hover is declared only inside a [data-theme] block …
```

Exit 1. **Note that all four ratio groups still report zero failures in that
output** — that is the proof the new check is not redundant with the old one.

### The card's reserved space was in the wrong place

Entry 8 put `min-block-size: 2lh` on the TITLE, which reserved the second line
*inside the heading* and left a hole between every one-line title and its
summary. The reservation belongs on the block: the copy sits at the top,
together, and the slack falls below it — which is where the picture starts, and
the picture is the thing that has to line up.

Computed from the tokens rather than measured, so it cannot go stale when the
type scale moves:

```css
min-block-size: calc(
  2 * var(--text-h5) * var(--leading-tight)
  + var(--spacing-2xs)
  + var(--text-caption) * var(--leading-body)
);
```

Measured after: five cards, `head` 22 or 44 as the copy dictates, and **every
picture at top 96, height 170**.

### A start icon unbalances the box

The square mark sits inside the left padding's optical space, so a symmetric
button reads as leaning left. The design compensates — `pl-24 pr-32` at `md` —
and `Button` now carries padding as its own lookup keyed on whether there is a
leading icon. Two literal maps, because the scanner reads source as text.

### Quote band

`py-5xl` — 192px, symmetric, up from 96.

---

## 2026-09-13 — Entry 10. Phase 2 complete — the remaining four templates

Category, product family, About and Contact. **All six templates built; 20 pages
emitted.** `npm run verify`: 8 checks, **481 assertions, 0 failures**, sweeping
eight pages at seven widths.

### Two blocks built, one extracted

- **`SpecTable`** — the audit's last outstanding component. A real `<table>`,
  because eight columns of measurements mean nothing without the row/column
  association: `scope="col"`, `scope="row"`, and the SKU as the row header
  rather than a cell, since it is the thing every other value in the row is
  about. The scroll box is focusable in the MARKUP, not from a script — eight
  columns do not fit a phone, and a scrollable region that cannot be reached by
  keyboard fails WCAG 2.1.1 before any JavaScript has run.
- **`ProductRail` — extracted, not invented.** The index and every category page
  draw the same object at different column counts: the grid, the rail, the snap
  points, the keyboard contract and the pagination bar are identical and only
  the number of columns differs. Two copies in two templates is the drift a
  block exists to prevent — the second would have grown a fix the first did not.
  `columns` is a prop with a complete-class lookup, never `grid-cols-${n}`.
- **`closing-band.ts`** — five page types end on the same picture and the same
  three sentences. It lives in `lib/` rather than a collection because there is
  exactly one of it and it is not editable per page; **a collection of one row is
  a table pretending to be a constant.** If the client ever wants a different
  band per category, that is the moment it becomes a collection, and this
  function is the only thing that changes.

### The design uses two titles per category, so the schema does too

"Cold Chain & Shipping" in a menu; "Cold chain packaging" as a page heading.
One field carrying both would mean a page title that reads like a menu item or a
menu item that reads like a sentence. `pageTitle` joins `title`, and
`CategoryCard` gained a `cross` prop that selects it together with the shorter
`crossBody` — the same card with a different field selected, not a second
component. Three labels per category now (`cardLinkLabel`, `navLinkLabel`,
`guideLinkLabel`) plus `selectionHeading`, because the design writes four.

### Every optional field is genuinely optional, and the sweep proves it

The design writes ONE product in full. **Both ends are now in the verify page
list on purpose:**

- `/products/cold-chain-shipping/insulated-metallic-mailers` — lede, contact
  link, six facts, an eight-column table;
- `/products/cold-chain-shipping/gel-packs` — none of them.

A sweep that only saw the full one would never exercise the skips, which is
exactly where a block leaves an empty shell behind. Both pass at seven widths.

### A census failure worth keeping

Adding the rail to three templates made Rollup hoist it into a shared chunk and
leave each page a 27-byte stub: `import"./rail.<hash>.js";`. Three UNNAMED
scripts, and the run failed.

Declared rather than exempted, as `shared-chunk pointer` with a 120 B budget:
**"the bundler made it" is a reason, not an exemption**, and if one of these ever
grows past a bare import then something has started shipping through a door
nobody is watching.

### The required marker needed both halves

`FormField` marked required fields for screen readers only. The design draws an
asterisk. Both now ship: the glyph `aria-hidden` because an asterisk read aloud
is "star", and the sr-only word underneath it. One is the sighted convention,
the other is the announcement; neither substitutes for the other.

### Measurements

| | |
| --- | --- |
| pages emitted | **20** (19 in production — no styleguide) |
| JS, per page | nav 429 B; rail pagination 431 B; contact 456 B |
| JS, summed across all 20 pages | 9,825 B gzipped — the census sums the site, not a page |
| verify | 8 checks, 481 assertions, **0 failures** |

### Open questions

22. **Eleven of the twelve product pages have no copy.** No lede, no facts, no
    spec table — the design writes only the mailers. Those pages render a trail,
    a heading, a picture slot and the closing band. They are honest and they are
    not launchable. This is the largest single gap between here and Phase 3.
23. **The spec table's own footnote says the numbers are provisional** —
    "Placeholder values — client to confirm", verbatim from the design. Shipped
    as written because the caveat is the design's, not mine, but it is the only
    numeric content on the site and it is flagged as unconfirmed.
24. **The shipments-per-week ranges are mine, not the design's** (question 14 is
    still open). Five ranges shaped like the placeholder's promise, marked in the
    page source. Replace before launch.
25. **`/terms`, `/privacy` and `/404` still do not exist** and are linked from
    every page — question 12, now the only broken links on the site.

---

## 2026-09-15 — Entry 11. Third review round — interaction, and three bugs in the token layer

The feedback was a list of hover states. Implementing them turned up three
variants of the SAME defect in the token layer — one of which had been making
keyboard focus invisible on every dark region of every page since Phase 0 — plus
a fourth bug that had shipped a page with a missing hero image while the build
stayed green. Two new checks came out of it, both fault-injected.

### What was asked, and where each piece lives

| Asked | Where it lives | Why there |
| --- | --- | --- |
| Footer + nav columns: hovering one link fades the others to 0.5 | `.fade-group` in global.css | "My sibling is hovered" is not expressible from the sibling; the rule has to sit on the container |
| Footer social links | `socialLinks` in `data/navigation.ts`, `.social-link` | Three accounts, one 32px control recipe from the control scale |
| Dropdown opens on hover | `src/scripts/disclosure.ts` | An enhancement over the click/Escape/outside contract, never the only way in |
| More space between the dropdown label and its chevron | `gap-sm` on the trigger | — |
| Nav help card fills black with a white arrow on hover | `.nav-help-go` | — |
| Secondary button reverses on hover | `VARIANT.secondary` in Button.astro | Token pair, so it inverts again under `theme="dark"` with no second rule |
| Arrow link: lighten one step, arrow travels 4px | `.btn-link` | — |
| Hero stat borders were too dark | `--line-overlay` — see below | It was a bug, not a value |
| Products + category hero: 48px bottom | `spaceBottom="sm"` | `--spacing-section-sm` is already the 40→48 clamp |
| Second CTA variation drops the subtext | `closingBand({ body: false })` | One source of the copy, one flag |
| Category hero: full-width range image | `<Media>` in a `width="full" space="none"` Section | — |
| Product card hover: fill the go circle, 1.01 image | `.product-card` | — |
| Build cards: 1:1, 1.01 image hover, real links | `CategoryCard` `ratio` prop | The same card with a different ratio selected, not a second component |

Every hover rule is inside `@media (hover: hover)` and every one has a
`:focus-visible` or `:focus-within` twin. A hover-only affordance is a rule half
the audience never sees.

### Bug 1 — `--bg-inverse-hover` was declared only inside the theme blocks

Reported three times as "the main button still hovers to white". I checked the
token's value twice and reported it correct twice. The value WAS correct. The
declaration site was not.

`--bg-inverse-hover: var(--gray-800)` lived in `[data-theme='light']` and
`[data-theme='dark']` but not in `:root`. On a page region with no `data-theme`
attribute — which is most of the site — the property was never declared, so
`background-color: var(--bg-inverse-hover)` resolved to nothing, the declaration
was dropped at computed-value time, the background fell back to `transparent`,
and what showed through was the near-white ground. Exactly the reported symptom,
produced by a token that reads correctly everywhere you would look for it.

### Bug 2 — `--bg-overlay` and `--line-overlay` resolved once, at `:root`

Same family, different mechanism, and this is the one worth internalising:

> **A `var()` inside a custom property is substituted where the property is
> DECLARED, not where it is used.**

`--line-overlay: color-mix(in oklab, var(--text-primary) 15%, transparent)` sat
in `:root`. `--text-primary` at `:root` is the LIGHT theme's ink. So inside a
`data-theme="dark"` region the overlay line was black at 15% over a near-black
ground — invisible — instead of white at 15%. That is the "stat borders are dark,
they should be light" item in the feedback list: a real defect, reported as a
colour preference.

### Bug 3 — the same shape, on focus, on every dark region of every page

`--focus-ring`, `--selection-bg` and `--selection-text` were declared once at
`:root` and derived from `--text-primary` the same way. Found by the check
written for bug 2, then confirmed in the browser:

```
dark region, focused link: ring #1f1f1f on ground #1f1f1f
```

**Keyboard focus was invisible in every dark region on all 20 pages** — WCAG
2.4.7, inherited from the template's own token layer, never noticed because the
sweep's keyboard check only ran `/styleguide`, which is light. All three are now
re-declared per theme.

### The check that makes the class of bug structural

`themeCompleteness()` in `scripts/verify/lib/contrast.mjs` parses the BUILT CSS,
lists every custom property a theme block re-declares, and then fails any `:root`
property whose value references one of them without being re-declared in each
theme. It is not a contrast assertion — it is a declaration-site assertion, and
it catches every future member of this family rather than the three I found.

`rootDeclaration()` is its partner for bug 1: every semantic token a component
uses must exist at `:root`, so an unthemed region cannot fall off the end of the
cascade.

**Fault injection, §9.** Deleted `--line-overlay` from the dark block:

```
FAIL  contrast matrix
      theme completeness: `--line-overlay` is declared at :root with a value
      referencing `--text-primary`, which [data-theme='dark'] re-declares.
      It resolves once, at :root, using the LIGHT value.
```

Non-zero exit, message names the property and the theme. Reverted; green.

### Bug 4 — `slot` is reserved by Astro, and the build will not tell you

`Media.astro` took a prop called `slot` — the caption for the pending box while
the photography is owed. `slot` is Astro's own attribute for assigning an element
to a named slot of its parent. So this:

```astro
<Section width="full" space="none">
  <Media image={category.rangeImage} slot="Cold chain shipping — the range" />
</Section>
```

assigned the `<Media>` to a slot named `"Cold chain shipping — the range"`.
`Section` has no such slot, so **the element was discarded**. The three category
pages shipped with no hero image, `astro check` passed, `npm run verify` passed,
and nothing in the output was wrong — there was simply less of it.

Renamed to `label` across eight call sites, and `CtaPlate`'s pass-through prop
renamed `imageSlot` → `imageLabel` in this entry's cleanup so the misleading name
does not survive anywhere.

`slotIsReserved()` in `scripts/verify/contracts.mjs` now scans every component's
frontmatter for a declared `slot` prop. Fault-injected by restoring the old name:

```
FAIL  build contracts
      src/components/blocks/Media.astro declares a `slot` prop. `slot` is
      reserved by Astro for slot assignment — the attribute is consumed
      before the component sees it, and a component passed `slot="…"` as a
      direct child is silently dropped.
```

Verified with `grep -c` that the category range image now reaches built HTML:
`1`.

### Hover was verified through its `:focus-visible` twin, not by hovering

Three separate reasons headless hover probing lies, all measured here:

1. `CSS.forcePseudoState` sets the state for rendering but `getComputedStyle`
   does not see it;
2. headless reports `hover: none` unless pointer capability is emulated, so
   every `@media (hover: hover)` rule is inert;
3. transitions do not tick without a compositor frame, so a transitioned
   property reads its START value.

Since every hover rule here was written with a `:focus-visible` twin carrying the
identical declarations, the twin is what I asserted — driven by real `Tab` key
events, which the browser does honour:

```
product card (focus):  { goBg: rgb(31,31,31), goArrow: rgb(255,255,255), scale: 1.01 }
category card (focus): { scale: 1.01 }
arrow link (focus):    { arrow: matrix(1,0,0,1,4,0), ring: rgb(255,255,255) }
```

This is a statement about the declarations, not about the pointer. The pointer
path is one `@media` query away and is the human's to confirm on the review.

### Measurements

| | |
| --- | --- |
| verify | 8 checks, **528 assertions**, 0 failures |
| nav disclosure script | **617 B gzipped against a 700 B budget** — 88%, the hover enhancement cost 188 B |
| rail pagination | 431 B / 500 B |
| total shipped JS | 13,585 B gzipped across 27 scripts, summed over all 20 pages |
| contrast matrix | core + accent + line + inverse fill + composite fade + `:root` declaration + theme completeness |

The nav budget is the number to watch. At 88% the next behaviour added to that
script needs its own ruling, not a quiet increment.

### Open questions

Unchanged and still unanswered: **22** (eleven product pages have no copy),
**23** (spec table values flagged "client to confirm" by the design itself),
**24** (the shipments-per-week ranges are mine), **25** (`/terms`, `/privacy`,
`/404` do not exist and are linked from every page).

No new ones. Phase 2 is complete and awaiting the human's review.

---

## 2026-09-15 — Entry 12. A dashed border shipped inside three photographs

Found while taking the review screenshots, which is the only way it could have
been found: it is invisible in source, invisible in the DOM, and invisible to
every check in the suite.

The three category range images carry the design's **dashed placeholder stroke
baked into the pixels**. In Figma the photograph sits inside a frame with a
dashed outline; the export captured the inner two pixels of that stroke along
the top and bottom edges. On the page it reads as a faint dashed hairline across
the full width of the category hero — which looks exactly like a CSS bug, and is
not one:

```
src/assets/categories/range-cold-chain.jpg  2400×1167
  row  0: 41% of sampled pixels neutral grey
  row  1: 32%
  row  2:  3%
  row  3:  0%   ← photograph starts here
```

Measured, not eyeballed: saturation per pixel along each edge, counting how many
sit under 6 — a dashed grey stroke over a warm photograph is a spike in the top
two rows that vanishes by the fourth. Left and right edges are clean, because the
frame was wider than the crop.

Cropped 8px from the top and bottom of all three (MCU-aligned, one re-encode at
q90) and re-measured: `T[0,0,0,0] B[0,0,0,0]` on all three.

Swept **every** image asset in the repo the same way rather than fixing the one I
could see. Four more edges flagged on the first pass and all four are false
positives — the greyness runs flat fourteen rows deep, which is a neutral part of
the photograph, not a two-pixel stroke:

| asset | edge | profile |
| --- | --- | --- |
| `home/hero-vial-kit-in-cooler.jpg` | bottom | 85, 85, 85, 85, 83, 83, 84… — the dark table |
| `home/volume-metallic-mailer.jpg` | right | 50, 50, 50, 50, 52, 52, 51… — the mailer's own foil |
| `home/volume-gel-pack.jpg` | bottom | 50, 50, 51, 49, 37, 26… |
| `shared/cta-produced-at-volume.jpg` | bottom | 30, 32, 32, 36, 36… |

**No check was added for this**, deliberately. A "no baked frame in an asset"
assertion would be a heuristic over photographic content — the four false
positives above are what it would fire on — and §9 says a check that cannot
state its failure mode cleanly does not belong in the suite. This belongs on the
Phase 4 punch list as a human look at every asset, which is what caught it.

Backup of the three originals kept outside the repo for the duration of the
review.

Re-verified after the crop: 8 checks, 528 assertions, 0 failures.

---

## 2026-09-15 — Entry 13. The mobile pass, the CMS swap rehearsal, and a new check

Three pieces of work, in the order they were asked for.

### 1 — Mobile

Six defects at 320–430. Four of them were invisible to `npm run verify`, which is
the part worth recording: every one of them is content that fails to fit
something SMALLER than the viewport, and the sweep only ever asked whether the
page scrolls sideways.

| # | Width | Defect | Fix |
| --- | --- | --- | --- |
| 1 | ≤390 | "distributors" ran 30px out of its hero stat card and over the card beside it | `overflow-wrap: break-word` at the body, `hyphens: auto` on the label |
| 2 | all mobile | the product rail scrolled itself one gutter on load, parking the first card flush against the screen edge | `scroll-padding-inline` |
| 3 | ≤430 | the nav logo was flex-shrunk to 63px against its own 152px token floor | `flex: none`, and the badge alone below 26rem |
| 4 | ≤430 | the spec table scrolled with nothing to say so | CSS-only scroll shadow |
| 5 | all | every `<summary>` chevron hung 1.7px out of its own box | draw the rotated corner in a `::before` sized to the footprint |
| 6 | all | the product breadcrumb started at Products; the two pages above it start at Home | added the crumb |

**Defect 1, in detail, because it is the template's problem and not this
project's.** There is no `overflow-wrap`, `word-break` or `hyphens` declaration
anywhere in the template's CSS. Default `overflow-wrap: normal` lets any
unbreakable token leave its container. It does not scroll the document, so
nothing saw it.

**Defect 3 is the same shape.** `--spacing-nav-logo` declares a 152px floor and
the logo link is a flex item with the default `flex: 0 1 auto`, so the row simply
squeezed it: 63px at 320, 133px at 390 — measured. A flex item shrinking is not
an overflow, so nothing said anything. The lockup genuinely does not fit beside
the call to action and the burger at 320 (152 + 161 + 36 plus two gaps is 377px
of content in a 288px row), so below 26rem it becomes the badge alone — the SAME
asset, clipped to the first 48 of its 228 viewBox units. No second file.

**Defect 2 is a spec detail worth knowing.** `scroll-snap-align: start` snaps to
the start of the SNAPPORT, which defaults to the padding box — and for a rail
that cancels the page gutter with a negative margin, that is the bled-out edge.
Mandatory snapping therefore scrolled the rail before any gesture:
`scrollLeft: 16` at 320, `27` at 768, exactly one `--site-margin` every time.

**One thing tried and reverted.** `hyphenate-limit-chars` to stop the browser
hyphenating "between" and "industry" alongside the one word that needed it.
Forbidding the good break does not stop the word needing to break — `break-word`
took over and produced `betwee / n` and `industr / y`, a single orphaned letter on
its own line, at both `10 5 4` and `auto 4 3`. Removed. The browser's own
dictionary gives `be-tween` and `in-dustry`, which is correct English and the
whole reason `<html lang="en">` is set.

### The check that makes the class of defect structural

`spills` in `scripts/verify/sweep.mjs`: for every element, is `scrollWidth`
greater than `clientWidth`. Three exclusions — the element scrolls or clips, the
element is invisible, or it is marked `data-bleed` — and only the deepest
offender in a chain is reported.

`data-bleed` is deliberately INCONVENIENT: written in the markup, at the element
that bleeds, where a reviewer reading the component sees it. Two things here
legitimately extend past their own box — the rail's negative margin and the
volume collage's two shots hanging into the gutter. Neither is discoverable from
geometry alone, which is why the author declares it rather than the checker
guessing from negative margins and absolute positions.

**Fault injection, §9.** Removed the guard from the stat label:

```
FAIL  overflow + structure
  / @320px — content spills its box: dd.text-h5 +30px "distributors in between"
  / @360px — content spills its box: dd.text-h5 +16px "distributors in between"
  / @390px — content spills its box: dd.text-h5  +6px "distributors in between"
```

Non-zero exit, names the element, the amount and the text. Reverted; green.

It found four more the moment it was switched on — defect 5 above at all seven
widths, and two on `/styleguide` (a swatch label inside a clipping `<ul>`, which
led to the ancestor-clip exclusion; and a 26-character demo button label, which
was shortened, because a button does not wrap).

**A correction to Entry 11.** That entry credited the `themeCompleteness()` and
`rootDeclaration()` checks with catching the custom-property family. They do.
They did not catch, and could not have caught, any of the six above — those are
geometry, not tokens. The general lesson is not "add token checks": it is that
**every check in the suite asked about the document and none asked about the
box**.

### 2 — CMS readiness, rehearsed rather than asserted

The comment at the top of `content.config.ts` claimed swapping `glob()` for a
Sanity loader was "a one-line change here, and nothing downstream moves". That
was an assertion. It is now a measurement.

A throwaway loader was written returning the twelve products as Sanity documents
— `_id`, `_type`, `_rev`, `_createdAt`, `_updatedAt`, and a `cdn.sanity.io` URL in
place of a local image — and put behind the adapter.

**Result: the site built.** 19 pages, 12 product pages, 12 footer links, 12 nav
panel links, the remote URL in the built HTML. Not one component, page or data
module changed. The boundary is real.

Exactly two things had to move, both now recorded at their own site in the code:

1. **The loader must project.** `.strict()` rejected the five system fields —
   correctly, and that is the list, measured. A GROQ query that names its fields
   returns none of them, so `.strict()` stays. The temptation will be
   `.passthrough()`; it is the wrong fix.
2. **`toPicture()` is the one function that breaks.** `getImage()` refuses a
   remote src without explicit dimensions (`MissingImageDimension`). The CMS
   branch is `typeof picture.src === 'string'` → return the URL with the
   dimensions the CMS reports.

**The branch is NOT written.** Writing it now means guessing which Sanity field
carries the dimensions, and a branch that has never seen real data is a guess
wearing the clothes of a migration. What is written is the exact change, at the
exact function, with the error it fixes named.

**`getProductBody()` deleted.** Exported, never called, no product has a body,
and it was the worst thing in the file for this swap: `getEntry('products', slug)`
looked an entry up BY ID while passing it a SLUG — which works today only because
every filename happens to equal its slug field, and finds nothing under any CMS —
and `render()` is markdown-only where Sanity returns Portable Text. Deleting it
took `getEntry`, `render` and two-thirds of the loader coupling out of the
adapter at the cost of nothing that shipped.

### 3 — TEMPLATE-NOTES.md

Everything this project turned up that belongs back in outredge-system, written
for whoever picks the template up next. Attribution is exact — `git show` against
this repo's initial commit is the template as delivered, so every "the template
does X" was checked rather than remembered.

The headline is **A1**: `--focus-ring`, `--selection-bg` and `--selection-text`
are declared once at `:root` deriving from `--text-primary` and `--bg-base`, which
`[data-theme='dark']` redeclares. Template lines 484–486. **Every site built from
this template has an invisible keyboard focus ring in every dark region.**

And **B2**, which is why it survived: `keyboard.mjs` line 67 asserts a ring
EXISTS, never that it is VISIBLE.

```js
hasOutline: cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0,
```

`#1f1f1f` on `#1f1f1f` passes that.

### Measurements

| | |
| --- | --- |
| verify | 8 checks, **530 assertions**, 0 failures |
| new assertions | `spills`, across 8 pages × 7 widths |
| CMS rehearsal | 19 pages built, 0 components changed |
| JS | unchanged — nothing in this entry shipped a byte of it |

### Open questions

Unchanged: **22**, **23**, **24**, **25**. No new ones.

Two judgement calls for the human, neither a defect:

26. **The nav logo becomes the badge alone below 416px.** A brand decision made
    on measurement, not from a mobile design — there is no mobile nav frame in
    the Figma file. Reversible in one media query.
27. **The volume collage falls to a ragged two-up below `md`,** five items in two
    columns, so the last sits alone. Decorative and `aria-hidden`, left as drawn.

---

## 2026-09-15 — Entry 14. Fourth review round — six changes, two of them measured

### 1 — The home hero sets in two lines

Asked for two lines; it was setting in three. The layout was not the problem —
the design's own column was:

```
design text box (Figma 788:8525)      912 x 128px  = two lines at 64/64
our column: 63rem less two gutters    912px        — the same number
natural width of the string at 64px  1876px
two lines therefore need            ≥ 938px each
```

**Two lines are arithmetically impossible at 912px**, and no line break helps,
because 2 x 912 = 1824 < 1876. The browser sets this string about 3.5% wider
than Figma does at the same size, weight and tracking — the font is already
pinned to `opsz 14`, so that is not it either.

Found the threshold by sweeping the cap rather than guessing: 980px gives three
lines, **1000px gives two**, at [888, 988]. So the Section widened to `main` and
the HEADLINE took a measure of its own — `.hero-headline`, 62.5rem — which is
what `.measure` already does for body copy, one step up. The flex column centres
it, so nothing needed `mx-auto` (§3.1). Verified 2 lines at 1440, 1280 and 1024,
and the h1 box is 128px at 1440, which is the design's number exactly.

### 2 — The split section header is top-aligned

`md:items-end` → `md:items-start`. The design has both columns starting at the
frame's top edge (Figma 788:8574 and 788:8576 are both at y=0); bottom-aligning
them hung a two-line heading and a four-line lede off a baseline the design never
draws. Measured after: both column tops at the same y.

### 3 — The category card's fade, at the strength the design draws

The card already carried `.media-scrim`. The design's overlay (Figma 788:8586) is
a rectangle filled `linear-gradient(to bottom, rgba(31,31,31,0), #1f1f1f)` with
**no opacity modifier** — and `#1f1f1f` is `--gray-950` exactly. Ours ran the same
gradient at `opacity: 0.7`.

Rather than change one number for everybody, strength became a per-use property:
`--scrim-strength`, defaulting to 0.7 for the hero and the closing plate, set to
1 on `.category-card`. Declared on the element and inherited by `::after`, so the
two rules never fight over specificity. Measured after: `opacity: 1`,
`linear-gradient(rgba(0, 0, 0, 0), rgb(31, 31, 31))`.

### 4 — The whole category card is clickable, and it is still one target

The link that was already the card's only route to the page grew a stretched
`::after`. **Not** a wrapping `<a>`: that would fold the heading, the paragraph
and the link label into a single announced name. Same pattern ProductCard uses.

Hit-tested six points rather than assumed it — centre, three corners, over the
heading, over the photograph — all six resolve to the card link.

### 5 — The nav and footer underline

One rule, `.link-underline`, on every link in the nav, the footer, the mega
panel, the mobile panel and the breadcrumb.

**The direction is a `transform-origin` switch, and that is the whole trick.**
The line rests at `scaleX(0)` with its origin on the RIGHT and hovers to
`scaleX(1)` with its origin on the LEFT. Growing therefore happens from the left
edge; when hover ends the origin snaps back to the right and the same collapse
reads as the line continuing off to the right rather than rewinding.

`--ease-out`, not a spring: this file's own note says the springs are wrong for
anything that must not overshoot, and an underline that sprang past the end of
its word is exactly that. **Duration is `--transition-duration-base`, 300ms.** The
brief asked for "about 250ms"; the scale's three steps are 150 / 300 / 450 and
this is the one that means "a normal UI transition". A fourth step for one
interaction would be a token pretending to be a system — flagged for the human
rather than decided quietly.

**No colour change**, as asked. `hover:text-accent` came off the nav and footer
links and `hover:text-primary` off the legal links; `aria-current` keeps the
accent, because that is the page you are on and not a hover.

Verified through the `:focus-visible` twin with real Tab events, since headless
hover still lies (Entry 11): resting `matrix(0,0,0,1,0,0)` with origin at the
right edge, focused mid-transition at `matrix(0.55322,…)` with origin `0px` —
growing from the left. 1px, `currentcolor`, 0.3s, `cubic-bezier(0.165,0.84,0.44,1)`.

**A dead class caught a real coupling.** Removing `.nav-panel-link` failed the
build: `Breadcrumb` had been borrowing it for a hover colour, on 16 pages. The
dead-class check named the class, the page count and three example pages. The
crumbs took `.link-underline` instead, which is what they should have had.

### 6 — The closing plate

`min-block-size: 30rem` below md, `37.5rem` from md up — 480 and 600, the
design's own numbers. A minimum and not a height, so long copy at a narrow width
still grows the box instead of being clipped.

**The subtext is gone from every instance.** It shipped on category and product
pages and not on the products index, on the reading that a page arrived at from a
narrower context wants the extra sentence. Ruled the other way: the band is a
heading and a button everywhere. `closingBand()` lost its `body` flag and
`CtaPlate` lost the prop — self-skip on content means there is nothing left for
it to skip. That removal is why the min-height was needed: heading plus button
alone collapsed the plate to roughly 300px, a strip rather than the plate the
page closes on. Measured after: 600 at 1440, 480 at 390, zero paragraphs.

### 7 — Card photographs are inert

`pointer-events: none` on `.category-card .media-slot` and
`.product-card .media-slot`. Without it the image swallows the press the stretched
link exists to receive, and a drag starts the browser's native image drag instead
of following the card.

### Two Astro parse traps, both hit again

`{/* … */}` cannot sit among an element's attributes (Entry 13, C11) — and it
cannot sit beside the single root element of a ternary branch either, which is
the same rule seen from the other side. Both surface as `[CompilerError] Expected
`,` or `)`` or as a cascade of unrelated TypeScript errors, never as "your
comment is in the wrong place".

### Measurements

| | |
| --- | --- |
| verify | 8 checks, **532 assertions**, 0 failures |
| JS | unchanged — every one of these six is CSS or markup |
| hero h1 | 2 lines at 1440 / 1280 / 1024; 128px tall at 1440 |
| closing plate | 600px at 1440, 480px at 390 |

The referent guard fired once during this round, on a preview server left behind
by one of this session's own probes. Working as designed.

### Open questions

Unchanged: **22**, **23**, **24**, **25**, **26**, **27**. One added:

28. **The underline runs at 300ms, not the 250ms asked for.** The duration scale
    is 150 / 300 / 450 and 300 is the nearest step. Say the word and it becomes a
    fourth step; leaving it is one token's worth of restraint, not an oversight.

---

## 2026-09-15 — Entry 15. Three fixes, and the contact form made to work

### 1 — The product card's affordance snapped instead of fading

`.product-card-go` transitioned `color` and `border-color`. The hover sets
`background-color`, `border-color` AND `color` — so the circle's fill jumped to
black instantly while its border and its arrow faded over 400ms. `.nav-help-go`
and the social marks always listed all three, which is exactly why this one
looked different from the same gesture everywhere else on the site. All three
listed now.

### 2 — Social marks removed

Gone from the footer at the client's request, and deleted rather than commented
out: the `<ul>`, `socialLinks` and the `SocialLink` type in `data/navigation.ts`,
and the `.social-link` rule. The wrapper that held them beside the legal row went
too — a flex row around a single child is a div doing nothing. Git has all of it
if the accounts ever arrive.

### 3 — Category card heading up one step

`text-h4` → `text-h3`. The LEVEL is still the prop's; this is the visual size
only, which is the whole reason the type scale is named for size rather than for
level (§5).

---

## The contact form

Asked what it needs to work, with email as the destination for now. Two things
were wrong with it before any of that could matter, and both were invisible in a
green build.

### Defect 1 — the form asked a question the endpoint threw away

```
endpoint FIELDS   name, company, email, message
the form posts    name, email, company, volume, message
```

**`volume` is "Projected shipments per week".** It is the number this business
qualifies a lead on, and a field absent from `FIELDS` is read from neither the
request nor the email. It validated, it built, it passed every check — and the
client would have received every enquiry with the one commercially useful answer
missing, with nothing anywhere to say so.

The template shipped the four fields the template draws. The list is the
contract; it now matches the form. Labels moved in beside it, because a person
reads this email and `volume: 1,000–5,000` is worse than the question itself.
The subject line leads with the company for the same reason — the client triages
by account, and thirty rows of "New enquiry from Jane Doe" sort by nothing.

### Defect 2 — a successful submission left the site

```html
<form method="POST" action="/api/contact">   <!-- native POST -->
```
```ts
return json({ ok: true }, 200);              // JSON response
```

A native POST to a JSON response **navigates**. A visitor who filled the form
correctly would have left the site and been looking at `{"ok":true}` in a blank
tab. `contact.ts` described the arrangement as "the endpoint answers with a
redirect-friendly status and the browser does the rest" — the endpoint has never
returned a redirect, and that comment is why nobody looked.

The submission is now intercepted and the answer rendered on the page, into a
`role="status" aria-live="polite"` region inside the form. **This costs no
capability the page had**: the form ships `disabled` and only this module enables
it, so there has never been a no-JavaScript path that could submit. What it buys
is the error text — the endpoint distinguishes a failed challenge from a bad
address from a dead provider, and without a fetch all three are the same blank
tab. It also resets the Turnstile widget after a failure, because the token is
single-use and a second attempt with a spent one fails for a reason the visitor
cannot see.

**The census budget moved 500 → 750 B, declared as a ruling, not raised
quietly.** Measured at 620 B gzipped.

### Both halves tested, with no account and no key

The endpoint was exercised directly with a stubbed `fetch` and a fake `env` —
seven requests, one email:

| case | status | |
| --- | --- | --- |
| happy path | 200 | the only one that sent |
| honeypot filled | 200 | deliberately indistinguishable from success |
| submitted in 1s | 400 | below the 3s floor |
| missing name | 400 | `Missing: name.` |
| bad email | 400 | |
| no Turnstile token | 400 | |
| no provider configured | 502 | refuses loudly, as designed |

And the message the client would receive:

```
subject: New enquiry — Peak Compounding (Dana Whitfield)
reply_to: dana@peakcompounding.com

Name: Dana Whitfield
Work email: dana@peakcompounding.com
Company: Peak Compounding
Projected shipments per week: 1,000–5,000
What they are shipping, and where: GLP-1 injectables, nationwide next-day air.
```

The client half was tested in the browser against a stubbed response, built with
Cloudflare's own documented always-passes test key:

```
success: status shown, 0 fields left, 0 submit buttons left, still on /contact
failure: "Verification failed." shown, 6 fields left, 1 submit button, still on /contact
```

Rebuilt afterwards with no key, so the form ships disabled as before — the
contract check confirms it: *"contact.html: ships disabled — 6 controls, no
endpoint configured."*

### What is left, and it is all human

None of this is mine to do — accounts, dashboards and keys are named
punch-list items, and nothing secret enters this repo:

1. **A Resend account**, a verified sending domain (a DNS record on
   centipack.com), and an API key.
2. **A Cloudflare Turnstile site**, giving a site key and a secret key.
3. **Five environment variables** set in the hosting dashboard —
   `RESEND_API_KEY`, `LEAD_TO`, `LEAD_FROM`, `TURNSTILE_SECRET_KEY`, and
   `PUBLIC_TURNSTILE_SITE_KEY` at build time.
4. **One real submission, verified end to end**, before launch. The form enables
   itself the moment the site key is present, which means the build going green
   is not evidence that a lead arrives.

### Measurements

| | |
| --- | --- |
| verify | 8 checks, **531 assertions**, 0 failures |
| contact form script | 620 B gzipped / 750 B budget (was 500) |
| total shipped JS | unchanged elsewhere |

### Open questions

Unchanged: **22**, **23**, **24**, **25**, **26**, **27**, **28**. One added:

29. **Turnstile is required, and it is a second account.** The endpoint returns
    503 without `TURNSTILE_SECRET_KEY` and that is deliberate — a public contact
    form without a challenge collects spam from the first week. If the client
    would rather ship with the honeypot and the time floor alone, that is a
    ruling to record here, not a line to quietly delete.

---

## 2026-09-15 — Entry 16. A third custom box

`src/content/products/exterior-mailer-box.md`, six lines of frontmatter. Nothing
else was touched, and that is the entry: the catalogue is the only list, so one
file put the product in the nav panel, the footer's Custom Boxes column, the
products index, the category page's rail and its own page at
`/products/custom-boxes/exterior-mailer-box`. 19 pages became 20; verify went
from 531 assertions to 533 on its own.

This is the first time the §5 claim has been tested by an addition rather than
asserted at build time. It held with no edits anywhere else.

The five-column ruling also got its first real exercise: Custom Boxes now has
three cards where the grid has five columns, and the cards sit at the SAME width
as Cold Chain's five rather than stretching to fill the row. The comment in
`products.astro` explaining that said "Custom Boxes' two cards", which is the
kind of hard-coded count that goes stale the moment someone does exactly what was
just done. Reworded to describe the rule rather than count the instances.

### The summary is mine, and it is flagged

The schema requires a one-line sublabel and this product is not in the Figma
file — it was asked for after the build, so there is no verbatim line to lift.
"The corrugated shipping outer" is written to be accurate and neutral rather than
plausible and specific: it claims no flute, no wall count, no print method that
nobody has confirmed. The reason is recorded in the file itself, in a YAML
comment beside the field, so it is visible to whoever edits it next rather than
only here.

### Open questions

Unchanged: **22**, **23**, **24**, **25**, **26**, **27**, **28**, **29**. Two
added:

30. **`summary` for the exterior mailer box is mine, not the client's.** Replace
    before launch, along with the other eleven product pages that have no copy
    (question 22 — this makes it twelve of thirteen).
31. **The title is singular where its siblings are plural** — "Exterior mailer
    box" beside "Vial presentation boxes" and "Bottle & pump boxes". Shipped
    exactly as asked for; the nav, the footer and the two card surfaces all read
    it, so if it should be "boxes" that is one word in one file.

---

## 2026-09-16 — Entry 17. The hero stats become one plate on mobile

Asked for: the three claims in a single glass container with line dividers below
the breakpoint, per an attached reference. Delivered, plus a copy correction the
reference exposed.

### Two objects, one markup

Below `md` the three claims share ONE glass plate split by inset hairlines; from
`md` they separate into the three cards the desktop design draws. That is two
different objects, not one object with a changing gap, so the whole treatment
moved out of utilities on the markup and into `.hero-stats` / `.hero-stat`.

**It had to move.** The cards' glass was expressed as utilities —
`bg-overlay border-overlay backdrop-blur-overlay rounded-md … border` — and a
utility cannot be UNSET at a breakpoint. Utilities also outrank
`@layer components`, so any component rule trying to strip the card treatment
below `md` would have lost. Leaving those classes in place made the mobile plate
literally unexpressible. Fourth time the layer order has decided a structure in
this project; it is already in the template notes (C2).

The dividers are a `::before`, not `border-inline-start`, because the design
insets them — the hairline stops short of the plate's own padding top and bottom
rather than running edge to edge. A border cannot be inset; an absolutely
positioned pseudo-element is the only way to say it.

Measured at five widths:

| | ≤430 | ≥768 |
| --- | --- | --- |
| plate background | `oklab(… / 0.1)` | transparent |
| plate backdrop-filter | `blur(50px)` | none |
| grid gap | 0 | 24px |
| card background | transparent | `oklab(… / 0.1)` |
| divider `::before` | `content: ""`, 1px | `content: none` |

### One measurement, not a taste

Inline padding on a column is one step below its block padding — 8px, not 12.
At 12px each side a column at 390 gives 95px of text and "distributors" is 97px
of it, so the label hyphenated **two pixels short of fitting**. 8px gives 103px
and it sets clean on two lines, which is what the reference shows. Below 360 it
hyphenates anyway and should.

### The copy was not the design's, and the reference is what caught it

The reference image reads "supplier, not five" and "years in cold chain before
this". The site read "point of contact" and "years in cold chain industry".

Searched the Figma file for all four strings:

```
'point of contact'                 -> 0 nodes
'years in cold chain industry'     -> 0 nodes
'supplier, not five'               -> 2 nodes
'years in cold chain before this'  -> 2 nodes
'distributors in between'          -> 2 nodes
```

**Two of the three labels on the live site appear nowhere in the design file.**
The brief says copy is lifted verbatim; these were not. Changed to the design's
own strings, which are also what the reference shows.

**One thing to know before trusting that.** Both Figma frames carrying these
labels — 788:8317 and 788:8559 — are marked `hidden="true"`. The band is switched
off in the design file. It exists on this page because it was asked for in review
(Entry 5), not because the design draws it. So the copy now matches a hidden
frame, which is better than matching nothing, but "which of these is canonical"
is a human call.

### Measurements

| | |
| --- | --- |
| verify | 8 checks, **526 assertions**, 0 failures |
| distinct classes in built HTML | 283, down from 290 — seven utilities left the markup for the component layer |
| JS | unchanged |

The referent guard fired twice during this entry, both times on preview servers
left behind by this session's own probes. Working as designed, and a reminder
that the probe scripts should stop their servers on the error path too.

### Open questions

Unchanged: **22**–**31**. One added:

32. **Which stat copy is canonical?** The site now reads the design's strings,
    but the design has that band hidden, and the previous strings came from
    somewhere outside the Figma file. If "point of contact" was a deliberate
    later decision, this entry reverted it — say so and it goes back in one line.

---

## 2026-09-16 — Entry 18. The product photography lands

Thirteen square exports arrived as `Product card (1).avif`, `Product card-1.avif`
… `Product card-12.avif`. Thirteen products. No mapping supplied, so each was
identified from the image itself, renamed to the product's slug, and wired into
its markdown.

Two of them identified themselves and settled the rest by elimination: one pair
of mailers is printed with **"PUNCTURE HERE"** target marks, which is the
Puncture Pack; and one corrugated box is opened to show a moulded **kraft paper
liner**, which is Eco liners. The summaries already in the collection confirmed
both — "Expands at pack-out" and "Curbside-recyclable".

Files kept as AVIF rather than transcoded to JPEG. Sharp reads AVIF, the pipeline
emits WebP either way, and a re-encode would have cost quality for nothing. All
thirteen are ~1295 × 1295, comfortably above the 880px the card renders at.

Alt text written per image, describing the shot rather than repeating the title
that sits beside it. The schema requires it, so there was no option to skip.

### The card follows the artwork now

`ratio="4 / 3"` → `ratio="1 / 1"`. The old comment argued the design crops these
to 328 × 246 inside a 259-wide card, and that was true of a mock-up; the actual
photography is square, each item centred on a plain ground with its own margin,
and `object-cover` in a 4:3 box cropped the top and bottom off **every one of
them**. The frame follows the artwork rather than the artwork being cut to fit
the frame.

### The arrow is out of flow

`.product-card-go` is absolutely positioned in the card's bottom-right, inset by
the card's own padding, and the grid dropped from three rows to two. The third
track existed only to hold the arrow; leaving it would have reserved an empty row
and a second 16px gap under the picture. The picture now grows into that space,
and the arrow's position no longer depends on how tall anything above it is.

**It also fixed a live defect nobody had reported.** The arrow is the last child,
so it painted over the stretched card link — a press on the one thing in the card
that most looks like a button did not follow the link. `pointer-events: none`,
which it should always have had, being decorative and `aria-hidden`. Hit-tested
four points afterwards — the arrow, the picture, the title and the bottom-right
corner — and all four resolve to the card link.

### `.product-card-head` min-block-size removed

It computed two lines of title plus the summary from the type tokens, so a
one-line title and a two-line title started their pictures on the same line.
Removed at request. Cards in a row are still equal height — the grid stretches
them — what varies now is where the picture begins inside each one.

### Measurements

| | |
| --- | --- |
| verify | 8 checks, **525 assertions**, 0 failures |
| pending image boxes left on the site | **1**, on `/about` |
| product pages with photography | 13 of 13 |

### Open questions

Unchanged: **22**–**32**, except **30** narrows — the exterior mailer box now has
a photograph, only its `summary` is still mine. One added:

33. **Two image assignments are inferred, not confirmed: `vial-kits` and
    `pill-bottles`.** Eleven of the thirteen were unambiguous. These two are both
    white-and-navy containers; the one showing contents with blue closures was
    read as the vial kit and the pair of empty bottles as pill bottles. If that
    is the wrong way round it is a two-line swap — worth a glance before the
    client sees it.

---

## 2026-09-16 — Entry 19. Vercel serves this build differently to Cloudflare

Staging went up on Vercel. Home rendered; **every other page 404'd**.

Not a build problem — the build is correct and unchanged. It is the one line in
`astro.config.mjs` that was written for the target we are not on:

```js
// Extensionless URLs on Cloudflare Pages come from `file` format: it emits
// /work.html, which Pages serves at /work.
build: { format: 'file' },
```

So `dist/` holds `products.html`, not `products/index.html`. Cloudflare Pages
maps `/products` → `products.html` as a matter of course. **Vercel does not** —
by default it serves that file only at `/products.html`, so every extensionless
link on the site missed. Home was the exception because `index.html` is served at
`/` on every host there is, which is exactly why the failure looked stranger than
it was.

`vercel.json` at the repo root:

```json
{ "cleanUrls": true, "trailingSlash": false }
```

`cleanUrls` restores the Cloudflare behaviour — serve `products.html` at
`/products` and redirect the `.html` form to it. `trailingSlash: false` matches
`trailingSlash: 'never'` in the Astro config, so the two hosts agree on the
canonical shape of a URL rather than each picking one.

Cloudflare ignores `vercel.json` entirely, so this costs the real target nothing.
It does not reach `dist/` — it sits at the repo root, not in `public/` — so the
build output is byte-identical: 20 HTML files before and after.

### The general point, for TEMPLATE-NOTES

`build.format: 'file'` is a **host-coupled decision**, and the template's config
documents it as a Cloudflare fact without saying that it is one. Any project that
deploys this template anywhere else meets the same 404 on every page but the
home page. Worth stating in the config comment itself, next to the line that
causes it.

### Still Cloudflare-only on this deploy

Recorded so the staging link is not mistaken for a working site:

- `functions/api/contact.ts` does not run — Vercel does not execute Cloudflare
  Pages Functions. Invisible in practice, because the form ships disabled without
  a Turnstile key.
- `public/_headers` is ignored: no CSP, no HSTS, no `X-Frame-Options`, no
  cache-control on this deploy.
- `public/_redirects` is ignored — currently empty, so nothing is lost.
- There is still no `404.html` (open question 25), so a genuine miss shows
  Vercel's own page rather than the site's.

### Open questions

Unchanged: **22**–**33**. One added:

34. **The staging deploy is publicly indexable.** No `robots.txt`, and
    `_headers` — which is where an `X-Robots-Tag` would live — does not apply on
    Vercel. A client-review URL that Google indexes is duplicate content against
    the real domain before the real domain exists, on a project whose stated
    driver is SEO. Two fixes, both one step: Deployment Protection in the Vercel
    dashboard (human, nothing in the repo), or `robots.txt` plus an
    `X-Robots-Tag: noindex` header in the `vercel.json` above. Flagged twice,
    not yet decided.

---

## 2026-09-17 — Entry 20. Mobile round, and an art direction bug that never applied

### The bug under three of the requests

`Media` writes the aspect ratio as an **inline custom property**, and its own
comment defended the choice: a custom property "can be beaten by a class, which
an inline `aspect-ratio` would not allow". Half right, and the useless half — an
inline style beats every selector short of `!important`, so an inline
`--media-ratio` cannot be beaten by a class either.

So `.hero-media { --media-ratio: 4 / 5 }` never won. **The home hero has been 5:3
at every width since it was written**, portrait crop and all, and the art
direction the comment describes has never once applied. It looked like a value to
change; it was a mechanism that did not work.

An art-directing class must set `aspect-ratio` itself — the inline style does not
touch that property, and `.media-slot` is what resolves the custom property into
it, so a later rule in the same layer wins cleanly. `.hero-media` and the new
`.page-hero-media` both do that now. Measured after: 0.800 at 390, 1.667 at 1440.

### Mobile changes

| | |
| --- | --- |
| Home hero | 1:1.25 on mobile, 5:3 from md |
| Category and product heroes | same, via one `.page-hero-media` that reads the desktop ratio back out of the inline property rather than restating 1344/541 and 1440/700 in CSS |
| Hero stats | full-bleed band, no border, flush to the picture, 32px numbers and 12px labels |
| Quote | 64px of air on mobile instead of 192 |
| Product facts | 24px between rows, 12 inside one, 24 below the value — the design groups rule/label/value with the air after it, not before |
| Spec table | border, surface fill and scroll shadow all removed; it now bleeds past the right gutter so the sliced next column IS the affordance |
| Mobile menu | product links indented under their category label, rows at 32px (Figma 788:7961) |
| Volume collage | placed absolutely on mobile, two side shots dropped |

**32px and 12px are tokens, not literals.** `--text-h2`'s clamp floor is exactly
2rem and `--text-caption` is 0.75rem, so the design's numbers are already the
system's words. Same for the menu indent: the design sets 40px, the scale runs
…24, 32, 48…, and 32 is what a scale is for — a `--spacing-40` for one indent
would be a token pretending to be a system. Recorded rather than silently
rounded.

**The spec table's scroll shadow is gone, four entries after it was added.** It
existed to say "there is more this way". The design says it better: let the table
run past the gutter so the next column is visibly cut by the screen edge. A thing
half off the screen is the most legible scroll affordance there is, and it costs
no CSS. The surface fill went with it — it only existed to give the shadow's
cover layers something to paint in.

### `<picture>`, and what it is for

Three requests asked for separate desktop and mobile files. `Media` now renders
`<picture>` when `Picture.mobile` is present: the desktop file behind a
`min-width` query, the mobile file on the `<img>` itself, so the smallest screen
downloads the smallest file and a browser ignoring `<source>` still works. Absent,
nothing changes — a plain `<img>`, as before.

One `alt` covers both: it is the same subject, and a second description is a
second thing to keep in sync.

`display: contents` on the `<picture>` keeps the wrapper out of layout, so every
rule written against `.media-slot` as a direct child still matches. Without it,
adding a second source would silently change the box model of every slot that
gained one.

`toPageImage()` in the adapter now does for a page asset what `toPicture()` does
for a collection field. The home hero and the closing band were each rebuilding
that shape by hand with their own `getImage()` and `Number()` casts — two copies
of one conversion, which is two places to forget the mobile file. The import
lines for the mobile files are in place and commented out, waiting on the
photography.

### Open questions

**27 closes** — the collage is placed on mobile now, not a ragged two-up.
Unchanged: 22, 23, 24, 25, 26, 28–34. Two added:

35. **The mobile menu follows coordinates, not a picture.** The reference
    screenshots were too large to reach me, so the indent and rhythm come from
    the Figma node geometry (788:7961). The structure is right; the exact
    spacing wants a human glance.
36. **The contact form is still gated on Turnstile, deliberately.** Asked to
    enable it for field testing on staging. Not done in code: the gate is §8's
    and it has its own contract assertion. The answer is Cloudflare's published
    Turnstile TEST keys as environment variables — the form enables itself, the
    "not live yet" notice disappears on its own, and nothing is weakened.

---

## 2026-09-17 — Entry 21. Correcting entry 20: two things reported fixed were not

Both came back as "you haven't fixed this at all", and both times that was fair.
The root cause is the same in each: **I changed the code, confirmed the classes
reached the built HTML, and never looked at the rendered page.** Entry 20 claimed
both as done on that basis. The classes were there; the result was wrong.

### The mobile menu was a structure problem, not a spacing problem

Entry 20 tuned the indent and the row rhythm from the Figma node geometry. The
geometry was read correctly and the conclusion was still wrong, because it was
read off ONE of the two panels in the file:

```
788:7961  Menu panel  402 x 800   ← collapsed
788:8043  Menu panel  402 x 1292  ← expanded
```

Collapsed is a single row — the group's label with a chevron on the right.
Expanded reveals the category labels and their indented links. What shipped was
the expanded state and only the expanded state: **all thirteen products, always,
677px of list on a 390px screen.** Tuning its spacing could never have fixed
that, which is exactly why it read as untouched.

Now a nested `<details>`, so it still costs **zero JavaScript** — the outer one is
the burger, this is the second, and the browser owns both. No `aria-expanded` to
keep in sync and it works before any script runs, which is the same argument that
put the burger in a `<details>` to begin with.

Measured: panel 677px → **112px** collapsed, 712px expanded, caret rotating on
`[open]`.

### The product facts were bottom-heavy, not merely loose

Entry 20 cut the row gap from 48 to 24 and the label-to-value gap from 24 to 12,
which was the right direction and the wrong shape. Measured after that change:

```
above the label 17px · label to value 12px · below the value 48px
```

Every value sat close under its own label and then a third of the block's height
of nothing before the next rule. The design spaces a row EVENLY — the rule, the
label, the value, and the same air below as above. The fix was not smaller
numbers, it was removing `gap-y` entirely so the rows stack rule to rule and the
padding alone sets the rhythm. Measured now: **25 / 12 / 24**.

### The lesson, and it is a repeat

Entry 13 recorded that "every check in the suite asked about the document and
none asked about the box". This is the next rung of the same ladder: a class in
`dist/` is not a rendered result, and `grep` is not a screenshot. The sweep
cannot catch either of these — a flat menu and a bottom-heavy row are both
perfectly valid layouts — so the only check that would have caught them is
looking, which costs one screenshot and was skipped twice in one entry.

**Nothing is reported as done on the strength of a grep again.** Both are
screenshotted above.

### Measurements

| | |
| --- | --- |
| verify | 8 checks, **527 assertions**, 0 failures |
| mobile menu, collapsed | 677px → 112px |
| product fact row | 17/12/48 → 25/12/24 |

### Open questions

**35 closes** — the menu now follows the design's structure, confirmed against
both panels rather than one. Unchanged: 22, 23, 24, 25, 26, 28–34, 36.

---

## 2026-09-17 — Entry 22. The footer's mobile accordion

Same shape as the nav in entry 21, found the same way — by reading the component
instance rather than the page that embeds it. `788:8518` "Footer mobile" is an
`<instance>`, so its children were not in the page-level metadata dump at all;
fetching the node directly is what showed the structure:

```
Cold Chain & Shipping   label + "+"   List 370x175   ← open
Branded Boxes           label + "+"   List hidden="true"
Pharmacy Formats        label + "+"   List hidden="true"
Company                 label + "+"   List hidden="true"
```

Four columns, each a row with a **`+`** on the right, the first open and the rest
closed. Ours stacked all four expanded — four columns of product links under
content nobody scrolled that far to read.

A third native `<details>`, so the whole site still ships **zero JavaScript for
disclosure**: the nav burger, the nav's product fold, and now each footer column.
The browser owns the state and the keyboard in all three.

The marker is two bars with one rotated — no glyph, no asset, `currentColor` so
the dark footer needs no second value, and only `rotate` animates (§12.3).

### Desktop forces open rather than stamping `open`

Putting `open` on all four would have left mobile expanded, which is the thing
being fixed. So `lg` forces the panels visible through `::details-content` and
turns the summary back into a heading — `pointer-events: none`, marker hidden.

**Stated rather than discovered:** where `::details-content` is unsupported the
columns stay collapsible at desktop widths too. Every title is visible and every
panel still opens on click, so it degrades rather than breaking. The same
selector already carries the FAQ animation, where the note says the same thing.

Measured after: desktop panel heights 189 / 102 / 168 / 102 — all four open — and
the marker computing to `display: none`.

### The bottom gap

`mt-5xl` — 192px above the legal row — is the DESKTOP measure, and it is what the
second review round explicitly asked for at 1440 where the columns are four
across and short. On a phone the columns stack and that became most of a screen
of nothing between the last link and the copyright. The design's mobile footer
sets 80px; 64 is the step below on the scale and the complaint was too much, not
too little. `mt-3xl md:mt-5xl`.

Mobile footer 667px tall now, with three of the four columns closed.

### Measurements

| | |
| --- | --- |
| verify | 8 checks, **532 assertions**, 0 failures |
| JS | unchanged — three disclosures on this site, no script behind any of them |
| footer, mobile | 667px, first column open |
| footer, desktop | 598px, four columns open, markers hidden |

Both states screenshotted before this was written, per entry 21.

### Open questions

Unchanged: 22, 23, 24, 25, 26, 28–34, 36. One added:

37. **`::details-content` is now load-bearing for the desktop footer**, where it
    was only cosmetic for the FAQ. Worth a look in whatever the client's team
    actually uses before launch — the failure is columns that need a click at
    1440, not a broken page, but it is the first place this project depends on
    the selector for layout rather than motion.
