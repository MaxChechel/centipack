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

---

## 2026-09-17 — Entry 23. Animating the footer reveal, and measuring which trick works

Asked for a transition on the footer accordion, with the `grid-template-rows:
0fr → 1fr` trick suggested. Built it that way first — it has the better support
story, needing nothing but grid and transitions where the FAQ's approach needs
`interpolate-size`, which is the narrowest-support declaration in this file.

**It does not animate.** Sampled on every animation frame, inside the page:

```
1ms 0px · 55ms 102.391px · 123ms 102.391px · 189ms 102.391px · …
```

One frame from closed to fully open. The declaration was right —
`transition-property: grid-template-rows, content-visibility / 0.4s, 0.4s` — and
nothing interpolated.

### The control is why that conclusion is trustworthy

An instant reading is exactly what a blind measurement looks like, and this
project has already been caught twice reporting results from evidence that could
not have shown a failure. So before concluding anything, the same sampler was
pointed at the FAQ accordion, which uses the other technique, in the same
browser, on the same run:

```
13ms 0px · 95ms 48.2188px · 179ms 96.7656px · 262ms 117.828px · 346ms 124.219px · 428ms 125.5px
```

The sampler sees animation when there is animation. So the grid track genuinely
was not interpolating out of `content-visibility: hidden` — not a measurement
artefact, and not the headless transition problem recorded in entry 11.

Switched to `interpolate-size` + `block-size: 0 → auto`, which is now the one
disclosure animation technique on the site rather than two. Measured after:

```
open   0 → 39.4 → 79.0 → 96.1 → 101.3 → 102.4px   (~406ms)
close  102.4 → 63.1 → 23.5 → 6.3 → 1.0 → 0px      (~421ms)
```

Both directions, spring curve visible in the spacing of the samples — fast then
settling, which is `--ease-spring-soft` doing its job.

Desktop is untouched: panels still 189 / 102 / 168 / 102 and the transition set
to `none` there, since there is nothing to animate on something always open.

### What this is worth keeping

The grid-row trick is the widely-recommended answer for animating a disclosure,
and it is the right answer for a `div` toggled by a class. It is **not** the
answer for `<details>`, because the thing being revealed leaves
`content-visibility: hidden` and a track list has no rendered start state to
interpolate from. `block-size: 0 → auto` does, because the base rule declares the
zero. That distinction belongs in the template notes.

### Measurements

| | |
| --- | --- |
| verify | 8 checks, **532 assertions**, 0 failures |
| JS | unchanged — still zero script behind any of the three disclosures |
| reveal | ~406ms open, ~421ms close, spring-eased |

### Open questions

Unchanged: 22, 23, 24, 25, 26, 28–34, 36, 37. **The FAQ/footer inconsistency
that would have been question 38 does not exist** — both use the same mechanism.

---

## 2026-09-17 — Entry 24. Client copy redline v7

Applied across the content collections, six pages and the footer. Copy is data
here, so most of it landed in `src/content/` and reached every surface at once —
a product's one-line summary is written in one file and appears on the products
index, its category page, its own page and the nav.

### Applied

| Redline | Where |
| --- | --- |
| 1.2 key numbers | three items became **four**, each with a number, a label and a payoff line |
| 1.3, 1.4 | section heading, the full body replacement, testimonial attribution |
| 2.1–2.4 | products index hero and all three section bodies |
| product short descriptions | all twelve, in `src/content/products/*.md` |
| 2.5 CTA | `closingBand()` — "Produced at scale." on all 17 product pages from one string |
| 3.x, 4.x, 5.x | three category files: summary, lede, cardBody, crossBody, selectionHeading, guide link |
| 3.3/4.3/5.3 | "the rest of the build" heading — one literal in `[category].astro`, identical on all three by construction |
| 6.x | mailers lede, the new **Testing standard** row, Customization, Production |
| 7.1 | About paragraph 1, the new fourth paragraph, the closing line |
| 8.1 | contact body |
| 9 | phone number removed, copyright line extended |

All five of §10's global checks pass, run against **built HTML** rather than
source: no "proven", no British spellings anywhere including meta and alt text,
no phone number and no `telephone` in JSON-LD, "Produced at scale." on all 17
product pages, and the rest-of-the-build heading identical across the three
categories.

### The key numbers needed a ruling

The redline offers two shapes: "split at the em dash if the component has
separate fields; otherwise use the full line." The full line runs to ninety
characters — at 12px in a quarter of a phone's width that is six lines of body
copy laid over a photograph. So the fields are separate and the payoff sits under
the label at caption size, which is the redline's own first preference and the
only one of the two that leaves the band legible.

Four items also forced the grid: `grid-cols-2 md:grid-cols-4`. That broke the
divider rule — `.hero-stat + .hero-stat` is right for one row and wrong for a
grid that wraps, because item 3 opens a new row and was drawing a hairline
against the plate's own left edge. Now `:nth-child(2n)`, which is the item that
actually has a neighbour to its left.

**The band is now 327px tall at 390, against roughly 120 before.** It covers most
of a 488px hero picture. That is what this copy does at this size, not a bug —
flagged below rather than quietly re-designed.

### The sweep caught a real overflow

`/products` overflowed at 320 and 360 the moment the copy landed:

```
/products @320px — overflows (367 > 320); unclipped: a.inline-flex, svg.size-icon-inline
```

`Button` set `whitespace-nowrap` on every size. That is right for a box — a
filled button whose label wrapped would look broken — and wrong for `size="link"`,
which has no box: it is a sentence with an arrow after it. "How to choose the
right cold chain configuration →" is 367px on one line. The boxed sizes keep
nowrap; the link size wraps, with `items-start` so the arrow sits on the first
line rather than centring itself against two.

Worth noting what happened here: a pure copy change broke the layout, and the
only reason it was caught before the client saw it is that the sweep runs seven
widths on every page. Longer copy is exactly the kind of change that feels safe.

### Two items in the redline have no target on this site

Both are section 1, and both look like the redline was written against a
different build:

- **1.1 hero body.** The "Current" text is not on this site and the home hero has
  no body element — the review on 2026-09-12 explicitly ruled "hero: no subtext",
  and `SITE.description` carries different copy again. Adding a paragraph here
  would reverse that ruling, so it is not applied.
- **1.5 CTA heading.** "Thermal integrity. Proven performance. Manufacturing
  scale." appears nowhere. The home page's closing band reads "We produce at
  volume. You get the price that comes with it." Applying the New text would mean
  replacing a heading the client did not quote, so it is not applied.

Global check 1 ("proven" → "validated") therefore has nothing to change; the word
does not appear on the site.

### Measurements

| | |
| --- | --- |
| verify | 8 checks, **535 assertions**, 0 failures |
| hero stat band at 390 | ~120px → **327px** |
| pages touched by one CTA string | 17 |

### Open questions

Unchanged: 22, 23, 24, 25, 26, 28–34, 36, 37. Three added:

38. **Redline 1.1 and 1.5 have no target on this site** — see above. Both need a
    decision: is the redline against an older build, or is the home page meant to
    gain a hero body and a different closing heading?
39. **The hero band is now 327px on a 488px picture.** Faithful to the copy and
    heavy on the design. Options are a shorter payoff, payoffs on desktop only,
    or accepting it.
40. **Question 23 is now sharper.** The mailers table footnote still says
    "Placeholder values — client to confirm", and the redline explicitly left it
    unchanged while adding a Testing standard row citing ISTA protocol guidance.
    Unconfirmed numbers under a testing claim is a worse combination than either
    alone.

---

## 2026-09-17 — Entry 25. A second measure token

The three section standfirsts on the products index had **no measure at all** —
not 66ch that wanted tightening, but the full column. That was invisible while
they were one short line each ("The 2–8°C range, specified as one system.") and
obvious the moment the redline replaced them with two sentences, at which point
they ran the better part of a metre at 1440.

`--container-measure-tight: 60ch`, with a `measure-tight` utility beside
`measure`, following the existing token-plus-utility pair exactly.

**A second token, justified by role rather than by being a different number.**
66ch is a standfirst someone settles in to read — the contact page's, which is
what that token was written for. 60ch is a section's own one-line explanation,
which sits in a row beside a link and wants to turn over before it reaches it.
Two roles, two measures; had the only difference been "this one feels a bit long"
it would have belonged in the existing token or nowhere.

Measured: cap 656.64px, all three wrapping to two lines at 1440, and irrelevant
below the breakpoint where the viewport is narrower than the cap anyway.

### Measurements

| | |
| --- | --- |
| verify | 8 checks, **536 assertions**, 0 failures |
| standfirst at 1440 | full column → 657px, two lines |

### Open questions

Unchanged: 22, 23, 24, 25, 26, 28–34, 36–40.

---

## 2026-09-18 — Entry 26. The last pending box

The About photograph arrived as `Centipack_Mystic_2026-09-18_09-26-54 1.avif`,
1928 × 1076. Renamed `warehouse-eps-coolers.avif` to match the house convention
— subject, no prefix, role carried by the folder.

Checked the edges first, per entry 12: 0% neutral on the top and bottom rows and
a flat 12–18% down the sides, which is the photograph, not a baked frame.

**The `label` was wrong and has been corrected.** The slot read "Gel packs and a
mailer box, mid-air"; the picture is a warehouse aisle racked floor to ceiling
with EPS coolers on pallets. That label had been describing a photograph that was
never taken, which is precisely the state the pending box exists to make visible
— it said the right thing until the moment a different picture arrived.

Rendered at 1800px rather than the adapter's 2400 default: the slot is 900px
inside the narrow container, so 1800 is the 2x file and anything beyond it is
bytes nobody sees. The source is 1928, so this is also very nearly the original.

### Zero pending boxes on the site

```
=== pending boxes left on the whole site ===
(no rows = none)
```

Every one of the 39 slots in the client's image plan that this build renders now
has a photograph. That crosses a threshold `Media.astro` wrote down for itself in
Phase 2:

> "When the photographs land, every label disappears with them; when the last one
> lands, this component collapses to the `<img>` branch and the `label`/`ratio`
> props go with it. That removal is the point, and it is the thing to check at
> the Phase 4 gate."

**Not removing it now**, and that is deliberate rather than an oversight: the
schema keeps every image field optional because a thirteenth product with no
photograph is a normal state for this catalogue, and the pending box is what
makes that state visible instead of silently empty. It becomes removable when the
client confirms the range is closed. Recorded below.

### Measurements

| | |
| --- | --- |
| verify | 8 checks, **534 assertions**, 0 failures |
| pending image boxes, site-wide | 1 → **0** |
| about photograph | 1800 × 1005 in a 912 × 527 slot |

### Open questions

Unchanged: 22, 23, 24, 25, 26, 28–34, 36–40. One added:

41. **The pending box is now unused and stays anyway.** Phase 4 should decide
    whether the range is closed. If it is, `Media` loses its second branch and
    the `label` prop with it; if products will keep arriving without photography,
    it stays exactly as it is. Not a decision to make by noticing the count hit
    zero.

---

## 2026-09-22 — Entry 27. The form goes live, and copy v8

### §8's guarantee moved rather than lapsed

The form shipped every control `disabled` until a Turnstile key existed. Asked
three times to enable it for testing; answered three times with "set the test
keys", which did not serve the request. Doing it properly instead.

The original fear was exact and correct: **a form that posts into an unverified
endpoint swallows a real enquiry silently.** That fear was written when
submission was a native POST. It has not been one since entry 15 — submission is
an intercepted fetch that renders whatever the endpoint answers, and the endpoint
answers precisely: 503 with no Turnstile secret, 400 for a missing token, 502
with no delivery provider. **A submission on an unconfigured build now fails in
front of the visitor, in words.** Nothing is swallowed, so nothing needs
disabling to prevent the swallowing.

So the controls are live, the notice is gone, and the rule the contract enforces
has moved to the thing that now carries it: **a form whose submit is intercepted
must have a live region to report into.**

**Letting the old check pass would have been worse than deleting it.** It
short-circuited on `data-contact-ready` with "enable path allowed" — so a form
that is always ready would have sailed through asserting NOTHING while printing
a reassuring green line. `formShipsDisabled` is replaced by
`formReportsFailure`, which asserts three load-bearing things: a submit control
exists, a `[data-contact-status]` element exists carrying `role="status"` or
`aria-live`, and the honeypot is present and NOT disabled — that last one being
the single control whose enabled state IS the mechanism.

Fault-injected, per §9. Removing the status element:

```
FAIL  build contracts
      contact.html: NO [data-contact-status] ELEMENT. The submit is intercepted,
      so the endpoint answer has nowhere to go and every failure is silent —
      the exact loss §8 exists to prevent.
```

Tested end to end in the browser: 7 controls, 0 disabled, no notice, every field
accepting input, and a real submit against the un-deployed endpoint rendering
*"Could not reach the server. Please email info@centipack.com."* — visible,
which is the whole point.

### Copy v8

A newer pass than the v7 redline applied on the 17th — Figma 934:28182, frames
named "… v8 copy tightened". Mostly shorter versions of the same lines. Applied
to the home hero, the three-layers body, the volume heading, the products index
hero, all three category summaries and ledes, the mailers lede, production row
and table caption, the About prose, and the contact body.

**Two things v8 settles that were open questions.** Question 38 recorded that
redline 1.1 and 1.5 had no target on this site. v8 supplies both: the home hero
DOES take a body, and the volume band's heading IS "Thermal integrity. Validated
performance. Manufacturing scale." Question 38 closes.

The hero body reverses the "hero: no subtext" call from the 2026-09-12 review.
The later instruction wins, but an earlier explicit ruling is not something to
overturn quietly — recorded here, and trivial to put back.

**About collapsed from four paragraphs to one.** v8 writes it as a single block;
the closing line is unchanged.

### Measurements

| | |
| --- | --- |
| verify | 8 checks, **536 assertions**, 0 failures |
| contact form | 7 controls, 0 disabled |
| keyboard assertions | 3 → **6**, the form's controls now being reachable |

### Open questions

**38 closes.** Unchanged: 22, 23, 24, 25, 26, 28–34, 36, 37, 39, 40, 41. Three
added:

42. **v8 shows the hero key numbers as THREE, with the pre-redline labels** —
    "supplier, not five", "distributors in between", "years in cold chain before
    this". v7 §1.2 replaced them with four, each with a payoff line, and that is
    what is live. Either v8 reverts it or that frame is a stale instance. Not
    guessed at; left as applied from v7 until someone says.
43. **v8 adds a section this site does not have: "How ordering works"** — a
    four-step timeline (Week 1 · Week 2 · Up to 12 weeks · Every run after) with
    real copy for each step. That is a new block to build, not a copy edit. It
    also contains *"Lorem ipsum dolor sit amet consectetur…"* in the design, so
    at least one field is unwritten.
44. **The v8 frames carry copy from other projects** — "Deploy solar
    installations with Solarpunk in weeks", "The world's most advanced supply
    chain and logistics teams run their operations on Pallet", "Jan 11, 2050".
    Template leftovers, not CentiPack copy, and none of it was applied.

---

## 2026-09-28 — Entry 28. Copy 1:1 with v8, checked by diff rather than by eye

Asked to make the site match Figma 934:28182 exactly. Did it as a **diff** rather
than a reading: extracted all 70 text strings from the node, normalised
whitespace, and searched the whole built site for each one. That turns "is it
1:1" into a list instead of an opinion.

First pass: **22 absent.** Three categories.

### Thirteen were false positives, and saying why matters

- **Arrow labels** — "Browse all formats →", "How custom boxes fit the build →"
  and four more. The label text is on the site; the arrow is an inline SVG, not a
  "→" character. Matching the string literally would mean putting a glyph next to
  the icon that already means it.
- **Breadcrumbs** — "Home / Products / Cold Chain & Shipping" is one Figma text
  node and four elements here, with the separators between them. The words are
  all present.

### Two were real, and both are now fixed

- **The testimonial used straight apostrophes** where the design uses typographic
  ones: "they've" for "they’ve". Three of them in one quote.
- **"How ordering works" did not exist.** Built as `OrderingSteps.astro` and
  placed on the four pages the design puts it on — products index and all three
  categories — before the closing band. One block, four pages, one copy of the
  content, the same rule that puts the closing band's copy in `lib/`.

### And three were a trap worth recording

The three hero stat labels — "supplier, not five", "distributors in between",
"years in cold chain before this" — are in the v8 file and not on the site, which
reads as a straightforward miss. It is the opposite. **Their container,
`935:7438`, is marked `hidden="true"`.** The stats band is switched off in v8, so
that frame's contents are stale leftovers from before the v7 redline replaced
them with four items.

Reverting to match would have undone a deliberate client instruction on the
evidence of a layer nobody can see. Open question 42 closes on that, and the
general point is the one worth keeping: **a string's presence in a Figma file is
not evidence it is in the design.** Check the hidden flag on the way up.

### What was deliberately not matched

- **The step titles.** Each of the four steps has a title field, and all four
  read "Analyse" — one unedited component default repeated, sitting in the same
  frame as a "Lorem ipsum dolor sit amet consectetur…" paragraph. Four steps
  titled "Analyse" is placeholder text, and the brief says flag it. The steps
  ship with their time label and their body, both of which are written.
- **Copy from other projects** in the same frames: "Deploy solar installations
  with Solarpunk in weeks", "…run their operations on Pallet", "Jan 11, 2050".
- **The product breadcrumb.** v8 writes it "Products / Cold Chain & Shipping /
  Insulated Metallic Mailers" with no Home, while its own category frames start
  at Home. Entry 14 added Home precisely to fix that inconsistency, and the
  BreadcrumbList it emits should start at the site root. Kept.

Second pass after the fixes: **3 absent, all of them the hidden-frame labels.**

### Measurements

| | |
| --- | --- |
| verify | 8 checks, **538 assertions**, 0 failures |
| v8 strings reconciled | 70 of 70, minus 3 from a hidden frame |
| new block | `OrderingSteps`, on 4 pages, 0 bytes of JavaScript |

### Open questions

**42 closes** — v8 does not revert the key numbers; the frame is hidden.
Unchanged: 22, 23, 24, 25, 26, 28–34, 36, 37, 39, 40, 41, 44. One rewritten:

43. **The ordering steps have no titles.** The design's title field reads
    "Analyse" on all four. Each step currently shows its time label and its body,
    which is honest and reads well, but the design clearly intends a title per
    step — "Analyse / Specify / Produce / Reorder" or similar. Needs four words
    from the client.

---

## 2026-09-28 — Entry 29. The product photography is replaced

Thirteen new thumbnails arrived as `Product card (2).avif`, `Product card-1
(1).avif` … — and the thirteen named files were **deleted**, not added to. So
this was a replacement, and `npm run build` was already failing:

```
[ImageNotFound] Could not find requested image `../../assets/products/vial-presentation-boxes.avif`
```

Renamed to the thirteen slugs, which is all the wiring needed — the markdown
already points at `assets/products/<slug>.avif`, so no content file changed for
the images themselves.

**The mapping was re-derived, not reused.** The filenames carry the same numbers
as the first set but nothing guarantees the same order, and three of the shots
name themselves: #7 is printed with "Puncture Here" targets, #8 is a kraft liner
in a corrugated box, #6 is an EPS cooler in its outer. Those three fix their
categories and the rest follow. The result matches the previous mapping, which
is a check on both rather than an assumption carried forward.

### The card ratio follows the artwork, for the third time

4:3 originally, 1:1 when the first photography arrived square, and now **4:5** —
the new set is 1037 × 1284, portrait. The rule has not changed, only the files:
each item is centred on a plain ground with its own margin, so `object-cover` in
a squarer box crops the top and bottom off all thirteen. Cards are 259 × 411 at
1440, image 227 × 290.

### Alt text rewritten

Twelve of the thirteen descriptions were of the OLD photographs — different
framing, different styling, in one case a different colour of jar entirely
("a closed green ointment jar beside an open cream-coloured one" for a shot that
is now a single navy jar). Alt text that describes a photograph nobody is looking
at is worse than none, because it reads as correct.

That also cleared the last British spelling on the site: "cream-coloured" was
sitting in alt text, which the redline's global check reaches but a reader never
sees.

One nicety worth recording: `pump-dispensers` needed no change — the new shot and
the old one are both "a navy airless pump bottle with its cap alongside". The
script asserted that every replacement changed something and tripped on that,
which is the assertion being too strict rather than the data being wrong.

### Measurements

| | |
| --- | --- |
| verify | 8 checks, **538 assertions**, 0 failures |
| product thumbnails | 13 replaced, 13 alts rewritten |
| card | 259 × 411 at 1440, image 4:5 |

### Open questions

Unchanged: 22, 23, 24, 25, 26, 28–34, 36, 37, 39, 40, 41, 43, 44.

**33 is worth re-reading rather than closing.** It recorded that `vial-kits` and
`pill-bottles` were inferred rather than confirmed. The new set has the same
ambiguity in the same place — one branded jar opened to show vials, one closed
navy bottle — and was read the same way. Two independent passes agreeing is not
the same as the client confirming, and it is still a two-line swap.

---

## 2026-09-28 — Entry 30. The card becomes its picture

Asked for the image to cover the full card and the card to be strictly 260:320.
Checked the design before restructuring rather than inferring a layout from two
sentences — `935:7693` is a collapsed component instance, so its internals had to
be fetched directly, the same trick the footer needed in entry 22.

What it shows:

```
Product card                      259.2 x 321          ← 260:320
  rounded-rectangle (the photo)   x=-43  w=346         ← oversized, clipped
  Container                       x=16  y=16  w=227.2  ← the 16px inset
    Text        "Gel packs"
    Paragraph   "3–32 oz · 4 variants"
    Frame 1948765252 (the arrow)  bottom-right
```

So the picture is not a slot with text above it — **it is the card's ground**,
laid in oversized with negative offsets and cropped by the card, with the title,
summary and arrow overlaid in a container inset by the card's own padding.

### What changed

`.product-card` is now `position: relative` + `aspect-ratio: 260 / 320` and
nothing else structural. **The grid is gone**, and with it the `minmax(0, 1fr)`
column note that had lived there since Phase 2 — that existed because the media
sat in a track whose width its own aspect ratio could inflate. It no longer sits
in a track.

The media is absolute, `inset: 0`, `object-fit: cover`. Overriding it needs
`aspect-ratio: auto` to beat `.media-slot`'s `aspect-ratio: var(--media-ratio)`,
so the rule is written at two-class specificity — `.product-card
.product-card-media`. The inline custom property Media writes is still there and
still untouchable, which is precisely why this overrides the RESOLVED property
rather than the variable feeding it. Entry 20's lesson, applied rather than
rediscovered.

Measured: card 259 × 319, image 259 × 319, ratio 0.812.

### "How ordering works" comes off the products index

Removed from `/products` and its import with it. **It remains on the three
category pages**, which is where the design also places it — if it should go
everywhere, that is one more line in each.

### One thing to look at rather than fix

With the text over the picture, legibility now depends on where the subject sits
in frame. Most of the thirteen are shot with the subject low and the top clear,
which is what makes the design work. **"Eco liners" is not** — the box reaches
into the top-right and the summary's last line crosses it. Nothing here can fix
that; it is a crop, and it belongs to whoever shoots the next version.

### Measurements

| | |
| --- | --- |
| verify | 8 checks, **539 assertions**, 0 failures |
| card | 259 × 319 at 1440, ratio 0.812 |
| ordering steps | 4 pages → 3 |

### Open questions

Unchanged: 22, 23, 24, 25, 26, 28–34, 36, 37, 39, 40, 41, 43, 44. One added:

45. **The eco-liners thumbnail crowds its own caption.** Text over picture only
    works while the subject stays low in frame. One of thirteen does not, and it
    is a reshoot or a re-crop rather than a code change.

---

## 2026-09-28 — Entry 31. Copy matched to the rendered reference screens

Five full-page references supplied and asked to match 100%. Diffed each against
the live build rather than reading for differences.

### Applied

| | |
| --- | --- |
| Hero key numbers | payoff lines **dropped** — label only, and #2 reads "distributors in between", not "distributors between you and your packaging" |
| Home category cards | all three `cardBody` strings are shorter than v8's: pharmacy formats loses "the primary format the medication is dispensed in", custom boxes becomes "rigid boxes" and splits at a full stop, cold chain collapses to "validated for 24, 48, and 72-hour 2–8°C transit" |
| About | one paragraph → **three**, as drawn |
| Closing band | the body is **back** on every product page |

**The payoff lines closing open question 39 is the useful part.** That question
recorded the band at 327px on a 488px picture, carrying roughly four times the
text the design draws. The references settle it by not having them — the v7
redline asked for a payoff per number and the rendered design shows the label
alone. Question 39 closes, and `.hero-stat-payoff` came out of the stylesheet
with it.

**The closing band's body has now been removed and restored.** It shipped with a
paragraph, was cut in review — "we don't have subtext for all instances" — and
the references show it on every product page again. Latest instruction wins. Both
turns are recorded at the site of the change so the next reversal is a decision
rather than a rediscovery.

### Three things the references disagree with, left alone

1. **The footer shows social icons.** They were removed on explicit instruction
   in entry 18, and `socialLinks` was deleted rather than commented out. An
   explicit "remove this" outranks a screenshot that predates it, so they stay
   out until someone says otherwise. Git has them.
2. **"Exterior mailer box" carries Bottle & pump boxes' summary**, word for word,
   on both the products index and the custom boxes page — "Custom secondary
   packaging for oral and topical formats · matched to bottle and pump
   dimensions". That is a copy-paste in the design, not copy. Matching it would
   put the same sentence under two different products. Ours stays (open question
   30 — the line is still mine and still wants replacing).
3. **The two category references disagree with each other** about the pharmacy
   formats cross-card. The cold chain page shows the old short line, the custom
   boxes page shows the current longer one. `crossBody` is one field on one
   record and cannot be both; kept the version two of the three screens agree on.

### Measurements

| | |
| --- | --- |
| verify | 8 checks, **538 assertions**, 0 failures |
| About | 3 paragraphs |
| closing band body | on 17 product pages from one string |

### Open questions

**39 closes** — the payoff lines are gone, so the band is back to its drawn
height. Unchanged: 22, 23, 24, 25, 26, 28–34, 36, 37, 40, 41, 43, 44, 45. One
added:

46. **The footer's social marks are out and the reference shows them in.** Entry
    18 removed them on instruction; these screens predate or ignore that. One
    line to restore if the instruction has changed.

---

## 2026-09-28 — Entry 32. The one line that differed

"Copy is not correct" on the products index. Dumped the page's visible text and
compared it line by line against the reference rather than re-reading the screen:
**37 strings, one difference.**

`exterior-mailer-box`'s summary read "The corrugated shipping outer" — mine,
written in entry 16 because the product was added after the design and had no
line to lift, and flagged ever since as open question 30. The reference supplies
one, so the placeholder is gone.

It is word for word Bottle & pump boxes' summary, on both the products index and
the custom boxes page. Entry 31 declined to apply it on exactly that ground and
said so; asked again, that is the client's call to make and it is applied. Two
products now carry one sentence. The reason sits in the file beside the field, so
whoever edits it next sees the duplication is known rather than accidental.

**The lesson is about the flag, not the line.** Entry 31 reported this as one of
three things deliberately left alone. That report was accurate and it was still
the thing that came back — a caveat in a summary is easy to miss, and "I did not
do this" reads as done unless it is the headline. Open questions are for the log;
anything the human has to *decide* belongs at the top of the reply.

### Measurements

| | |
| --- | --- |
| verify | 8 checks, 538 assertions, 0 failures |
| strings compared | 37 on /products, 1 differing |

### Open questions

**30 closes** — the summary is the client's now, not mine. Unchanged: 22, 23, 24,
25, 26, 28, 29, 31–34, 36, 37, 40, 41, 43, 44, 45, 46.

---

## 2026-09-22 — Entry 33. Six reference screens, two differences

Six full-page references supplied — home, about, products index and all three
categories — with "update copy on all pages". Cut each into full-resolution
tiles and read them against the built pages' visible text, string by string.
**Home and the three category pages match already. Two differences, both
applied.**

### Applied

| | |
| --- | --- |
| Products index closing band | **no body** — "Produced at scale." and the button. The three category screens keep the sentence, and so do product pages, which were not supplied |
| About closing statement | **one paragraph**, not three lines — the `<br />`s are out, and it wraps where the measure puts it |
| "How ordering works" | **off the category pages.** This was already deleted in the working tree when the session began — `OrderingSteps.astro` gone, its use removed from `[category].astro`. None of the six screens draws it, so it is committed as found, with one stray blank line tidied |

**The closing band is on its fourth turn.** It originally had the body on
categories and products but not on the index. Then it was a heading and a button
everywhere. Entry 31 put the body back everywhere, and now the index goes without
it again. That first reading was right all along. `closing-band.ts` stays the one
string; the index drops it at the call site with `body={undefined}`, and the
history in the file gets one more line.

### Not matched, and why

1. **The pharmacy formats cross-card on the cold chain screen** reads "Vial kits,
   bottles, dispensers and jars — what the medication is dispensed in." Entry 31
   kept the other version on a two-screens-to-one vote. The real reason is
   firmer: `git log -S` shows that line is the **initial commit's copy, replaced
   by client redline v7** (3d35096). That frame is out of date. It has not been
   revised. The custom boxes screen shows the v7 line, and that stays.
2. **"Exterior mailer box:"** — with a trailing colon, on the custom boxes screen
   only. The products index screen draws the same card without it. A colon after
   a product name is a typo in the design, not a title.
3. **The footer** shows the social marks (open question 46, unchanged) and lists
   two custom boxes where the catalogue has three. The column is generated from
   the collection, and the drawing predates the product (entry 16). Removing a
   live product from the footer to match it would be wrong.

### Measurements

| | |
| --- | --- |
| verify | 8 checks, **536 assertions**, 0 failures |
| assertion delta | −2, both in build contracts (54 → 52): the `as` and `slot` scans each cover one fewer component now that `OrderingSteps.astro` is deleted. Confirmed by running verify on a clean HEAD worktree. Nothing loosened |
| distinct classes | 290 → 290 |
| closing band body | 16 pages (was 17) |
| ordering steps | 3 pages → 0 |

### Open questions

**43 closes** — the ordering steps are gone, and with them the four missing
titles. Unchanged: 22, 23, 24, 25, 26, 28, 29, 31–34, 36, 37, 40, 41, 44, 45, 46.

---

## 2026-09-22 — Entry 34. The index card's summary is one line

"Copy on product cards on the all products page should be less copy." Entry 33
had compared the strings, found them identical to the references, and reported
no difference. **The strings were identical and the report was still wrong**: the
instruction was about how much text is on that page, and the reference screen
answers it in the rendering rather than in the words.

### What the reference actually shows

The five-up card is 259px wide and the summary is a 40-to-100 character
sentence. The design draws **one line, cut mid-word by the card edge** —
"3–32 oz · regular, flat-profile, and condensatio". The build wrapped the same
string to three lines and pushed the photograph down. The same sentence on a
416px category card takes two lines and reads fine, which is why the category
screens show it whole and only this page does not.

### What changed

`white-space: nowrap` on `.product-rail-5 .product-card-summary`, and nothing
else. `.product-card` already carries `overflow: hidden`, so the card does the
cutting — hence no ellipsis, which is also what the design draws.

**At every width, not just where the five-up grid exists.** Scoped to `lg`
first; the screenshot at 900 showed why that was wrong — below 62rem the index
is a scroll rail at 26% of the viewport, 234px, *narrower* than the desktop card,
so the wrap it was meant to fix was worse there. One page, one behaviour.

**Nothing is removed from the document.** The full sentence is still in the HTML,
a screen reader reads all of it, and the card links to the page that carries it.
The three-up category rail is untouched.

**The sweep stays quiet, and not by accident.** Its spill assertion excludes
content whose ancestor clips (`overflow-x` not `visible`), which is exactly this
case — the check is not being dodged, it is being answered: the text is
contained by the card, not spilling the page. 56 page/width checks still pass.

### The process note

Entry 32 recorded that a caveat in a summary reads as done. This is the same
lesson one level up: **a string-by-string diff answers "are the words right", and
the instruction was "is there too much text".** Six reference screens were read
as copy and not as renderings. The tell was in the screenshot the whole time —
text cut mid-word is a layout instruction, not a typo.

### Measurements

| | |
| --- | --- |
| verify | 8 checks, **537 assertions**, 0 failures |
| distinct classes | 290 → **291** (`product-card-summary`) |
| index card summary | 3 lines → 1 at 1440; 3 → 1 at 900; 2 → 1 at 390 |
| category card summary | 2 lines, unchanged |

### Open questions

Unchanged: 22, 23, 24, 25, 26, 28, 29, 31–34, 36, 37, 40, 41, 44, 45, 46. One
added:

47. **Eight of thirteen index summaries now cut mid-word.** That is what the
    design draws and it is applied as drawn, but a line written to fit 259px
    would read better than a sentence trimmed by a card edge. Thirteen short
    lines, if the client wants them.

---

## 2026-09-24 — Entry 35. The copy deck arrives, and settles three arguments

A written copy deck — "CentiPack — Site Copy (v8, copy tightened)", eight page
sections plus shared nav and footer, "apply verbatim on staging". **A deck that
states the copy outranks a screenshot the copy has to be inferred from**, and it
decides three things this log has gone back and forth on.

Diffed it the way entry 32 did the index: **86 strings from the deck against the
six built pages, string by string. Two were wrong.** The product template and the
contact page — neither of which had a reference screen, and neither of which had
been checked before — match the deck exactly, including the seven spec rows, the
eight-column size table, its footnote, and all five form placeholders.

### Applied

| | |
| --- | --- |
| Products index closing band | the body is **back**. The deck writes it out under this page's own "Produced at scale." |
| Cold chain page's pharmacy card | the **short** line: "Vial kits, bottles, dispensers and jars — what the medication is dispensed in." The custom boxes page keeps the long one |

**The closing band's body has now moved five times** — on the categories and
products but not the index, then off everywhere, then on everywhere (entry 31),
then off the index again (entry 33, reading the screen), and now on everywhere
because the deck says so. Entry 33 was a reasonable reading of a picture and it
was still wrong, which is the argument for a deck over a screen in one line.

### The cross-card is per-page, and now the data says so

Entries 31 and 33 both treated the two category screens disagreeing as one of
them being stale — first by vote, then by `git log -S`, which showed the short
line was pre-redline-v7 copy. **The deck writes both, one page apart, and flags
neither**, where it does flag two other Figma artifacts. That is no longer a
transcription slip to be adjudicated; it is the copy.

`crossBodyOverrides` on the category record: what another category's card says
**on this page**, keyed by that category's slug. One record, one entry — the cold
chain page's pharmacy card. Everything else still reads the target's own
`crossBody`. `CategoryCard` gains a `body` prop that replaces the field it would
otherwise select; it is not told why.

**The host owns the override, not the target.** A `crossBodyShort` on
pharmacy-formats would have needed the template to know which pages take the
short one — a rule hardcoded in markup rather than data, and the next page would
rediscover it.

**Two things measured rather than assumed:**

1. `z.record(CATEGORY, z.string())` is **exhaustive** in zod 4 — it demanded all
   three slugs on a map whose purpose is to name one. The build said
   `crossBodyOverrides.custom-boxes: Required`. `z.partialRecord` is the one.
2. **The red path was run** (§9). Renaming the key to `pharmacy-format` fails the
   build with `Unrecognized key: "pharmacy-format"` and the file named — so a
   typo in an override cannot silently fall back to the default line. Reverted,
   rebuilt clean.

### Not applied

1. **The footer's Custom Boxes column lists two products; the catalogue has
   three.** The deck omits Exterior mailer box there, as the screens do. The
   column is generated from the collection, and this is the product that was
   added after the design (entry 16) and whose description the client supplied
   later (entry 32). Dropping its only footer link to match a transcription of
   the old frame would orphan a live product. **Flagged to the human rather than
   applied** — one line if the answer is yes.
2. **"Exterior mailer box:"** — the deck itself notes the stray colon as a Figma
   artifact. Not copy.
3. **Its description is still Bottle & pump boxes'** — the deck carries the
   duplicate and marks it "needs its own copy", which is the client agreeing with
   entry 31 rather than a new line to apply.

### Measurements

| | |
| --- | --- |
| verify | 8 checks, **537 assertions**, 0 failures |
| deck strings checked | **86 across 6 pages, 0 missing** after the change |
| pages the deck covers that had never been diffed | 2 (product template, contact) |
| schema | +1 optional field, +1 card prop, 1 override in one record |

### Open questions

**46 closes** — the deck's footer section lists the columns and the legal line
and has no social row, which agrees with the instruction in entry 18. The marks
stay out.

Unchanged: 22, 23, 24, 25, 26, 28, 29, 31–34, 36, 37, 40, 41, 44, 45, 47. Two
added:

48. **The footer's Custom Boxes column: two products or three?** See above. The
    deck says two; the catalogue says three and the third has a live page.
49. **Exterior mailer box still needs its own description.** Open question 30
    closed when the client supplied the duplicate as deliberate; the deck now
    marks the same line "needs its own copy". One sentence, from the client.

---

## 2026-09-24 — Entry 36. The trimmed line now says it was trimmed

Two reports against /products: cap the section subtext at 60ch, and "see why
subtext is overflowing card". **One was already done and the other was mine.**

### The card summary ends inside the padding now

Entry 34 set `white-space: nowrap` and let `.product-card`'s `overflow: hidden`
do the cutting, because that is what the design draws — the line runs under the
card's edge, mid-word, with nothing to say it had been cut.

Measured at 1440 through CDP rather than eyeballed: **525px of text in a 227px
box.** The overflow paints straight through the 16px inset every other element
on the card respects, so the last characters sit on the padding and stop dead at
the card's edge. Faithful to the frame, and it reads as a broken card.

`overflow: hidden` + `text-overflow: ellipsis` on the paragraph. The line now
ends where the title ends, with one glyph saying the sentence continues on the
page the card links to. Design's hard cut in, design's hard cut out — **the
instruction was "less copy on this page", and the ellipsis serves it without
pretending a word ends in "conden".**

### The subtext was already at 60ch

`measure-tight` has been on that paragraph since the v7 redline, and
`--container-measure-tight` is `60ch`. Measured: **`max-width: 656.64px`, and
656.64 / 60 = 10.94px, which is DM Sans's zero at 16px.** Exactly 60ch, on all
three section subtexts. Nothing to change.

**`ch` is the width of the digit zero, not of an average character**, so a 60ch
cap holds about 85 characters of prose and wraps this sentence to two lines. If
the ask was sixty CHARACTERS per line rather than the CSS unit, that is ~44ch
(480px) and it is one token. Raised with the numbers rather than guessed at.

Every other text block on the page was measured in the same pass: the hero body
and the closing band's body are 432px, both from their containers, neither
uncapped.

### Measurements

| | |
| --- | --- |
| verify | 8 checks, **537 assertions**, 0 failures |
| card summary | text 525px, box 227px, card 259px — now clipped at 227 with an ellipsis |
| section subtext | 656.64px = 60ch, unchanged, ×3 |

### Open questions

Unchanged: 22, 23, 24, 25, 26, 28, 29, 31–34, 36, 37, 40, 41, 44, 45, 48, 49.
One amended:

47. **Eight of thirteen index summaries are still trimmed** — now with an
    ellipsis inside the card rather than a mid-word cut at its edge, which is
    honest but still not written for the space. Thirteen lines built for a 227px
    box would beat thirteen trimmed sentences, if the client wants them.

---

## 2026-09-24 — Entry 37. The summary flows

"For subtext on cards, we can just make it flow naturally, no truncating, no
overflow thing." **The one-line rule comes out**, and with it
`.product-card-summary`, which existed only to carry it.

### The three turns, so the fourth is a decision

| | |
| --- | --- |
| 33 | strings match the references; the wrap was never looked at |
| 34 | "should be less copy" → `nowrap`, cut by the card's own `overflow: hidden`, as the design draws it |
| 36 | the cut moved inside the 16px inset with an ellipsis — 525px of text in a 227px box was painting over the padding |
| 37 | **no truncation anywhere.** The paragraph is a paragraph |

**The design's frame was faithfully reproduced twice and rejected twice.** The
instruction under all three turns is the same one — less copy on the index card —
and the answer to it was never in the layout. It is thirteen lines written for a
227px box (open question 47), and until those exist the full sentence wrapping is
the honest rendering: nothing hidden, nothing to expand, nothing that ends in
"conden…".

### What it looks like now

Back to three lines on the 259px card, which is where entry 30 left it. Worth
one look rather than one fix: with the text over the picture, the third line
lands on the product itself on **two of the five cold chain cards** — Puncture
Pack and Eco liners, the two shot with the subject high in frame. That is open
question 45 widening from one card to two, and it is a crop, not a rule.

### Measurements

| | |
| --- | --- |
| verify | 8 checks, **536 assertions**, 0 failures |
| distinct classes | 291 → **290** (`product-card-summary` gone from markup and stylesheet) |
| index card summary | 1 line + ellipsis → 3 lines, flowing |

### Open questions

Unchanged: 22, 23, 24, 25, 26, 28, 29, 31–34, 36, 37, 40, 41, 44, 48, 49. Two
amended:

45. **Two thumbnails crowd their own caption**, not one: Eco liners and Puncture
    Pack. With the summary flowing again, a three-line caption reaches further
    down the card than it did when this was first logged. A re-crop, not a rule.
47. **Thirteen short lines are now the only way to make this page quieter.**
    Truncation has been tried in both forms and ruled out. One sentence per
    product, written for a 227px card, from the client.

---

## 2026-09-24 — Entry 38. `text-wrap: balance` on every heading and paragraph

Asked for as a default. Applied as one rule in the type-scale block, and **the
interesting part is that the first version of it did nothing.**

### The rule that lost

Written first as `@layer base { h1…h6, p { text-wrap: balance } }`, beside the
`overflow-wrap` net that lives there. The build was green, a probe that forced
the property showed 39 blocks improving, and the page **still rendered exactly
as before**.

`.text-large / .text-body / .text-sm / .text-caption` set `text-wrap: pretty`,
and they live in `@layer components`, which outranks `@layer base` whatever the
specificity. Nearly every paragraph on this site carries one of those classes,
so nearly every paragraph kept `pretty`.

**What caught it was reading the built page, not the stylesheet:**
`getComputedStyle(p).textWrap` → `"pretty"` while the source said `balance`, on
the one paragraph whose line break — "…and 72-" / "hour transit." — had not
moved in the screenshot. §2's thesis, one more time: the compiler's reality
outranks the CSS in your head. **A probe that injects `!important` measures a
hypothesis, not a page.** It was right about the improvement and silent about
whether the rule applied.

Now written where it wins, next to the classes it has to beat:

```
:is(h1, h2, h3, h4, h5, h6, p),
:is(h1, h2, h3, h4, h5, h6, p):is(.text-large, .text-body, .text-sm, .text-caption)
```

The compound selector outranks the size class; the bare one covers anything
with no size class at all. `pretty` stays as the floor for everything else
wearing a size class — a label, a link, a table cell.

### Measured, on the built pages

| | |
| --- | --- |
| headings + paragraphs computing `balance` | **121 of 121** across 6 pages, 0 exceptions |
| list items and table cells affected | **0** — a balanced `<li>` reads as a ragged column, and a balanced cell fights the spec table's column widths |
| blocks whose breaks move | 39 of 60 multi-line blocks |
| blocks made more ragged | **0.** Every one of the 39 has a longer shortest line |
| line counts at 390 / 768 / 1024 / 1440 | **identical** — nothing gains a line, so nothing below it moves |
| worst case fixed | About's closing statement: an 89px last line on a 448px measure. The section subtext went 645/85 → 360/366 |
| verify | 8 checks, 536 assertions, 0 failures |

### Open questions

Unchanged: 22, 23, 24, 25, 26, 28, 29, 31–34, 36, 37, 40, 41, 44, 45, 47, 48, 49.

---

## 2026-09-24 — Entry 39. Seven photographs, thirteen lines, and one contrast failure they caused

Client images dropped into `src/assets`, and the thirteen short card lines open
question 47 has been asking for since entry 34. Applied together because the
second is what makes the first legible.

### First, a correction against myself

**Four of the seven images were committed in entry 38 without being mentioned.**
`git add -A` on the `text-wrap` commit swept up `Cold Chain & Shipping -
card.avif`, `Custom Boxes - card.avif`, `Pharmacy Formats-card.avif` and
`Pharmacy formats - hero.avif`, which had landed in the working tree while that
change was in progress. They were not in that commit's message, its diff review
or its report. `git add -A` in a tree the human is also writing to is a commit
whose contents I did not choose — **`git add <path>` from here.**

### The images

Renamed to the role-first convention the folder already uses, and the seven jpgs
they replace are deleted (git has them):

| supplied | now | used as |
| --- | --- | --- |
| Cold chain packaging.avif | range-cold-chain.avif | category hero |
| Custom boxes - hero.avif | range-custom-boxes.avif | category hero |
| Pharmacy formats - hero.avif | range-pharmacy-formats.avif | category hero |
| *Category* - card.avif ×3 | category-*.avif | CategoryCard, home and cross-links |
| cta-bg.avif | cta-produced-at-volume.avif | the closing band, all 17 pages |

**The shapes confirmed the mapping before anything was wired**: the three heroes
are 2.056:1 against the template's 1440/700 = 2.057, and the three cards are
0.827 against the CategoryCard's 5/6 = 0.833. Alt text is rewritten per image
from looking at each one — the old lines describe photographs that are gone.

### The contrast failure, measured

The new closing-band photograph is a product group on cream: mean luminance
**198.7 against the old shot's 137.8**. The band's text is centred and its scrim
is a bottom-up ramp, which is nearly transparent where centred text sits.
Sampling the rendered pixels under each text run at 1440:

| | old photo | new photo | after the fix |
| --- | --- | --- | --- |
| heading | 3.32:1 | **2.04:1** | **4.52:1** |
| body | 3.91:1 | **2.49:1** | **4.82:1** |

So the band was already thin — the body line has never met 4.5:1 here — and the
brighter picture pushed the heading under even the 3:1 large-text floor. Fixed
with a flat tint UNDER the ramp (`--scrim-plate-floor`, a color-mix token per
§2.3, not ad-hoc alpha), because the problem is the middle of the plate and not
its foot.

**Two passes, because the arithmetic was wrong.** 55% predicted 4.0 / 4.8 and
rendered 3.73 / 4.16. 70% renders 4.52 / 4.82. The page decided it, twice.

**The contrast matrix cannot see any of this** and says so in its own comment:
what sits behind is a photograph, not a token. Nothing in `verify` would have
caught white-on-cream at 2.04:1 — it took sampling the built pixels.

### The thirteen lines

The client's own short summaries, replacing sentences of 60–110 characters with
40–60. The index card's three-line caption is now two, and the crowding that
entries 34, 36 and 37 tried to solve in the layout is gone from the copy, which
is where it lived.

**Exterior mailer box has its own line at last** — "Branded outer mailer · sized
to the full packout" — after carrying Bottle & pump boxes' sentence since entry
16.

### Not changed, one to look at

The three card images arrive **pre-darkened** (mean 96 against the old 157) and
the CategoryCard scrim then darkens them again at full strength. Text contrast
is well clear, and the cards read as intended, but the photographs are muddier
than the frames they were cut from. If the client's files already carry the
design's gradient, `--scrim-strength` on `.category-card` is the one number to
drop — left alone rather than guessed at.

### Measurements

| | |
| --- | --- |
| verify | 8 checks, **536 assertions**, 0 failures |
| images applied | 7, replacing 7 |
| card summaries | 13 rewritten, 60–110 chars → 40–60 |
| closing-band contrast | 2.04 / 2.49 → **4.52 / 4.82** |
| dist | 2.0 MB total |

### Open questions

**47 closes** — the thirteen lines exist, and the index card holds two tidy lines
without truncation. **49 closes** — Exterior mailer box has its own copy.
**45 closes too**: the eco liners and Puncture Pack captions no longer reach the
product, because the caption is two lines now. Unchanged: 22, 23, 24, 25, 26, 28,
29, 31–34, 36, 37, 40, 41, 44, 48. One added:

50. **The category card photographs are darkened twice.** See above — one token,
    if the client's files already include the design's gradient.

---

## 2026-09-24 — Entry 40. The scrim comes off the cards, and the hero is the range

Three instructions in one turn: remove the overlay from the category cards, use
the new home hero, and borrow product shots for the closing collage until its
own arrive.

### Correction to entry 39

That entry reported **four** images swept into entry 38's commit by `git add -A`.
It was **five** — `centipack-home-hero.avif` went in with them, which is why it
was already tracked when the instruction to use it arrived. The lesson stands
and is now paid for twice: this entry's commit stages named paths.

### The card scrim is gone, and here is what it costs

`.media-scrim` off `CategoryCard`, and `--scrim-strength: 1` with it. The
client's card files carry the design's gradient already (mean luminance 96/255
against the 157 of the shots they replace), so the card was darkening a darkened
picture.

Sampled on the built page at 1440, white text over the photograph:

| | with scrim | without |
| --- | --- | --- |
| body (Pharmacy / Cold Chain) | 16.5 / 16.3 : 1 | **16.8 / 15.1 : 1** |
| "Browse formats" link | 16.3 : 1 | **13.9 : 1** |
| **heading (Pharmacy)** | 3.43 : 1 | **3.05 : 1** |
| **heading (Cold Chain)** | 3.40 : 1 | **2.99 : 1** |

The bottom of each card is deep in the file's own gradient, so the paragraph and
the link are untouchable either way. **The heading is not**: it sits at the top,
where the picture is lightest, and it was already thin at 3.4. Without the scrim
it lands on the WCAG large-text floor — 3.05 on one card, **2.99 on another,
which is under it.**

**Left as instructed, and raised rather than quietly re-scrimmed.** The heading
is large text (`text-h3`), so 3:1 is its bar, not 4.5:1, and one card misses it
by 0.01. Three ways out, none of them mine to pick: darker crops at the top of
the card files, a top-edge gradient behind the heading alone, or accept it.
Open question 51.

### The home hero is the whole range

`centipack-home-hero.avif` — the full line-up on cream, 4223 x 2053 — replaces
the vial-kit-in-a-cooler shot, whose file is deleted. Alt text rewritten to what
the picture shows.

**The design's crop trims it.** `.hero-media` is 5:3 at desktop and 1:1.25 on a
phone, and the file is 2.057:1, so `cover` takes about 19% off the width: the
jars, the pump bottle and the white mailer at the right end are outside the
frame. That is the design's box, not a bug, and the picture still reads — but a
line-up shot wants the line-up. Open question 52.

### The collage borrows, temporarily

Five product-catalogue shots stand in for the collage's own, on instruction.
Imported from `assets/products` rather than copied, so there is one file per
product and swapping back is five lines. The five `volume-*.jpg` files are
deleted; git has them.

**They broke the composition, and the fix is worth more than the swap.** Every
product file is 1037 x 1284, where the design's five slots run from 288:540 to
618:593. Dropped in, the tallest slot grew down over "Thermal integrity." —
visible in the first render, not in any check. `--at-ratio` now carries **the
drawn box** per slot and the photograph is cropped into it, so the composition
holds whatever proportion the next file has. That is the durable half of a
temporary change.

### Measurements

| | |
| --- | --- |
| verify | 8 checks, **536 assertions**, 0 failures |
| card heading contrast | 3.43 / 3.40 → **3.05 / 2.99** |
| card body + link | 13.9–16.8 : 1, unaffected |
| hero | 4223 x 2053, cropped 19% at 5:3 |
| files deleted | 6 (one hero, five collage) |

### Open questions

**50 closes** — the double-darkening is gone. Unchanged: 22, 23, 24, 25, 26, 28,
29, 31–34, 36, 37, 40, 41, 44, 48. Three added:

51. **The category card heading is at the large-text contrast floor** — 3.05:1
    on one card and 2.99:1 on another, against a 3:1 bar. Darker crops, a
    heading-only gradient, or accepted as drawn.
52. **The home hero loses its right-hand third to the design's 5:3 crop.** The
    file is 2.057:1. Change the box to the picture, or crop the picture for the
    box.
53. **The closing collage is borrowing product shots.** Temporary on
    instruction; five imports to swap when its own land.

---

## 2026-09-24 — Entry 41. The band's own picture, and a dropdown that opened onto nothing

### The closing band is the client's shot, with no scrim

`cta-banner.avif`, 3360 x 1500 — **2.24:1, which is the plate's own
`1344 / 600` exactly**, so the file was cut for this slot. It replaces
`cta-produced-at-volume.avif` (deleted) on all 17 pages that end on this band.

`.media-scrim` off `CtaPlate` on instruction, and `--scrim-plate-floor` — added
two entries ago for the picture this one replaces — removed with it. **Restore
both together or neither**, which the comment left in its place says.

**And the contrast goes back where it was.** Sampled on the built page at 1440,
white text over the new plate:

| | entry 39, tinted | now |
| --- | --- | --- |
| heading | 4.52:1 | **2.07:1** |
| body | 4.82:1 | **2.59:1** |

The picture is darker overall than the one it replaces (mean 128.8 against
198.7) but its **centre is the lightest part of it**, and the centre is where the
type sits. This is not the marginal miss the category-card headings are: 2.59:1
on a body line is text a reader with ordinary eyesight will struggle with, on
every product page.

**Left off, as instructed, and raised rather than re-added quietly.** The tint
that fixed it is four lines and its value was measured — 70% brought the old
picture to 4.5:1, and this one needs less. One word restores it. Open question 54.

### The contact dropdown opened onto nothing

Reported as "not working". It was, and **the cause was in `dist`, not in the
source.**

The picker is styled through `appearance: base-select`: a base rule drew the
popup at `opacity: 0`, and a second rule — `::picker(select):popover-open` with
an `@starting-style` fade — brought it in. Correct in source. In the built
stylesheet: **one occurrence of the rule that hides it, zero of either rule that
reveals it.**

`vite.build.cssTarget` is `chrome111 / safari17.2 / firefox112 / edge111`, set
deliberately in astro.config.mjs so the `linear()` spring tokens survive
minification. esbuild drops what that target cannot parse, and `:popover-open`
is Chrome 114, `@starting-style` Chrome 117. Both rules were stripped on the way
out. **The target that protects the springs ate the dropdown.**

Measured before touching anything, by driving Chrome: the select opened
(`:open` true), focus moved into an option, the option had a 550 x 36 box, white
background, hover — **and the screenshot showed nothing at all.** Forcing
`opacity: 1` from the console drew the full list.

The fix is the base state: the picker is now visible when the browser shows it,
so nothing about whether it can be SEEN depends on a rule a minifier is willing
to remove. The fade is gone and is worth less than a dropdown that opens; it
returns if the target is ever raised past Chrome 117.

**Nothing in `verify` could have caught this**, and it is worth naming why: the
keyboard check proved the control is reachable and operable, axe proved it is
labelled and announced, the JS census proved the Enter-to-open script ships. All
true, all passing, on a control that painted an invisible menu. A popup that
opens empty is a pixel fact, and §2 says so: read the built output.

### Measurements

| | |
| --- | --- |
| verify | 8 checks, **536 assertions**, 0 failures |
| band image | 3360 x 1500, 2.24:1 — the plate's ratio to the decimal |
| band contrast | 4.52 / 4.82 → **2.07 / 2.59** |
| picker rules in dist | hide: 1, reveal: **0** → now visible in the base state |
| options drawn | 0 → 6 |

### Open questions

Unchanged: 22, 23, 24, 25, 26, 28, 29, 31–34, 36, 37, 40, 41, 44, 48, 51, 52, 53.
Two added:

54. **The closing band's text is at 2.07:1 and 2.59:1.** The scrim came off on
    instruction and the picture's centre is its lightest part. Four lines to
    restore a measured tint; the alternative is a band shot whose middle is dark
    enough to carry white type.
55. **`cssTarget` decides which modern CSS survives the build.** Springs need it
    low; `@starting-style`, `:popover-open` and anything newer are silently
    stripped at that floor. Nothing warns. Worth a check that greps `dist` for
    rules the source declares and the build removed.

---

## 2026-09-24 — Entry 42. Two product shots replaced

Found in the working tree at push time, not announced: new files for
`insulated-metallic-mailers` and `puncture-pack`. Both are the same products
reshot with the printed branding — "PEEL > PACK > SHIP", "Protective thermal
mailer", the puncture marks. **Checked rather than pushed blind** (entry 39's
lesson, and the reason this is its own commit).

| | was | now |
| --- | --- | --- |
| insulated-metallic-mailers | 1037 x 1284 | 1037 x 1284, same frame |
| puncture-pack | 1122 x 1402 | **1037 x 1284** — now identical to the other twelve |

**Alt text still true**, checked against each picture rather than assumed: the
mailer is still "printed 'Refrigerate upon opening'" and the pack is still
"marked with puncture points". Nothing to rewrite.

**Four surfaces each**, all looked at: the products index card, the category
card, the product page, and — for the mailer — the home collage, whose 288:540
slot crops the new frame to a strip. It still reads as a blue mailer, which is
all that slot has ever shown.

verify: 8 checks, 536 assertions, 0 failures.

---

## 2026-09-24 — Entry 43. The card summary opts out of balancing

One exception to entry 38's site-wide `text-wrap: balance`: the product card's
summary wraps plainly.

`text-wrap: wrap` on `.product-card p.text-caption` — the SHORTHAND, which
resets the omitted longhand to its initial `auto`, i.e. the default asked for.
Two classes so it beats the site-wide rule on specificity rather than on source
order; the site-wide selector computes to (0,1,1) and a rule that wins only by
sitting lower in the file is a rule the next reorder breaks.

**Why the card is the exception.** Balancing evens a block's lines against each
other, which is what a standfirst under a heading wants. In a 227px card it buys
a tidier ragged edge by stopping the FIRST line early, so a two-line summary
reads as though the sentence were shorter than it is. Measured at 1440, the five
cold chain cards' line widths:

| | balanced | plain |
| --- | --- | --- |
| Gel packs | 166, 142 | **174, 134** |
| Insulated metallic mailers | 158, 102 | **226, 34** |
| EPS foam coolers | 178, 132 | **223, 87** |
| Puncture Pack | 145, 119 | **161, 103** |
| Eco liners | 168, 112 | **209, 71** |

Every first line is longer and every second is shorter, which is the point: the
line reads to the card's edge and the remainder falls under it.

**Scope confirmed on the built page, not assumed**: the five summaries compute
`wrap`, and the section subtext beside them still computes `balance`. The rule
was also read back out of `dist` — `product-card p.text-caption{text-wrap:wrap}`
— because entry 41's dropdown was a rule that looked right in source and was not
there in the build.

verify: 8 checks, 536 assertions, 0 failures.

---

## 2026-09-25 — Entry 44. The home hero's subtext, supplied directly

One line, given verbatim:

> We manufacture complete packaging for temperature-sensitive medications —
> shippers, refrigerants, custom boxes and pharmacy formats — backed by 20+ years
> of combined cold chain expertise.

It replaces the v8 deck's "Insulated shippers, refrigerants, custom boxes, and
pharmacy formats — one supplier, built for pharmacies producing at scale." —
**the deck this log spent entry 35 arguing outranks a screenshot.** A line
handed over directly outranks the deck in turn; the order is recency, not
format. Both strings are now at the site of the change so the next revision is a
decision rather than an excavation.

**What it changes about the page, worth noticing rather than just applying:**
it leads with *manufacture*, which nothing else above the fold says — the deck's
line led with the product list, and the list is already the three cards below.
It also moves "20+ years of combined cold chain expertise" above the fold, where
the stat band repeats it 400px later. Duplication the client may want, or may
not have noticed. Open question 56.

Two sentences elsewhere on this page are untouched and still the deck's: the
stat labels and the section body under "Three integrated layers".

The meta description is a separate string in `consts.ts` (open question 16
closed it there deliberately) and does not move with this.

| | |
| --- | --- |
| verify | 8 checks, 536 assertions, 0 failures |
| rendering | 2 lines at 1440, 4 at 390, balanced, no overflow at any of the 7 swept widths |

### Open questions

Unchanged: 22, 23, 24, 25, 26, 28, 29, 31–34, 36, 37, 40, 41, 44, 48, 51, 52,
53, 54, 55. One added:

56. **"20+ years of combined cold chain expertise" now appears twice above the
    fold** — in the new hero line and in the stat band under the picture. One
    of the two is a repetition the client may want removed.

---

## 2026-09-25 — Entry 45. Five ledes, supplied directly

Four instructions in one turn, all copy the client wrote and handed over: the
products index hero, all three category heroes, and the closing band on every
page but Home.

### A near-miss, recorded first because it nearly shipped

The three category ledes live in YAML front matter, and the first attempt
replaced them with a regex: `^lede: >-\n(?:  .*\n)+?(?=^\w)`. The lazy repeat
plus that lookahead **ran past the end of the block and ate every field after
it** — `cardBody`, `crossBody`, `crossBodyOverrides`, both image records, the
lot. Cold chain went from 36 lines to 12.

It was caught because the script printed the length of what it replaced: 1313
characters for a 126-character line. **The number did not match the thing, and
that is the only reason this is a near-miss rather than an entry about restoring
deleted content.** `git checkout` put it back; the replacement is now an exact
full-string match with a `count == 1` assertion, which cannot run past anything.

The wider rule: **a script that edits content files states what it expects to
find and fails if it does not find exactly that.** A regex that matches "roughly
the right region" is a deletion waiting for a file whose shape it did not
anticipate.

### Applied

| | was | now |
| --- | --- | --- |
| Products index hero | 131 chars | **261** |
| Cold chain lede | 126 | **160** |
| Pharmacy formats lede | 142 | **214** |
| Custom boxes lede | 173 | **189** |
| Closing band body, 17 pages | 100 | **164** |

**The products index's description split off from its hero.** They were one
string; at 261 characters the hero copy is a meta description cut off mid-clause
in a search result. The description is now the hero's first sentence — 148
characters, says what the page is — and the second sentence, a caveat about
scope, stays on the page where it belongs.

**The closing band is one string in `lib/`, so the client's new sentence reached
17 pages from one edit** — the whole argument for that file, demonstrated
rather than asserted. Home's closing band is a different block with its own
copy, which is what "except homepage" asked for; it is untouched and verified
untouched in the built output.

### Not split, and worth a decision

The three category ledes are still doing double duty as their pages' meta
descriptions — that is pre-existing, and the new copy makes it worse: **pharmacy
formats is 214 characters and will truncate in a search result.** The products
index now has the pattern that fixes it, but applying it to categories means a
second field on the content type, which is the client's call rather than mine.
Open question 57.

### Measurements

| | |
| --- | --- |
| verify | 8 checks, **536 assertions**, 0 failures |
| pages carrying the new band line | **17**, from one string |
| home band | unchanged, confirmed in `dist` |
| category files | 36 / 30 / 30 lines before and after, one changed line each |

### Open questions

Unchanged: 22, 23, 24, 25, 26, 28, 29, 31–34, 36, 37, 40, 41, 44, 48, 51, 52,
53, 54, 55, 56. One added:

57. **Category ledes are their own meta descriptions, and one is now 214
    characters.** Either a `metaDescription` field on the category type, or
    accept truncation on that page.

---

## 2026-09-25 — Entry 46. The mailer shot again

`insulated-metallic-mailers.avif` replaced a second time, found in the tree at
push time. Same frame, same 1037 x 1284, same exposure; the "Protective thermal
mailer" line is off the pack, leaving "PEEL > PACK > SHIP" and "Refrigerate upon
opening".

The alt text — *A sealed blue insulated mailer printed "Refrigerate upon
opening"* — was re-read against the picture and still describes it exactly.

verify: 8 checks, 536 assertions, 0 failures.

---

## 2026-09-28 — Entry 47. The soft launch: five page types, and the 39 links nobody had counted

Instruction: launch Home, the products index, the three category pages, About
and Contact. Product cards not clickable, because the individual product pages
are not launching yet.

### The instruction was about the cards; the work was about the links

The cards were four links. **The nav mega-menu, the mobile nav fold and the
footer each list all thirteen products, on every page of the site** — read out
of `dist`, not out of the source — which is 39 anchors per page pointing at
routes a gated build does not emit. Nothing in the repo would have objected:
a 404 is not a rendering defect, `astro check` has nothing to check, the sweep
finds one h1 and no overflow, axe finds no violations. The build would have gone
green and the site would have shipped broken.

That is the entry. The rest is mechanism.

### One flag, and optionality as the enforcement

`LAUNCH.productPages` in `src/consts.ts`, beside `noindex` where site-scope facts
already live, with `productPagesShip()` applying the dev override so
`npm run dev` still serves the unlaunched pages for review.

It reaches exactly one field: **`ProductView.href` became optional.** That is the
whole design. A product with no page has no URL, and saying so in the type turned
every consumer into a compile error — card, nav panel, mobile fold, footer — so
`astro check` enumerated the call sites instead of a grep. Four consumers, found
by the compiler, zero found by me. `NavLink.href` went optional for the same
reason and by the same argument.

Each consumer renders a `<span>`, **not an href-less `<a>`**: an anchor with no
href is still announced as a link and still takes a tab stop, which is the same
lie with better manners.

`getStaticPaths` returns `[]` when the gate is shut — no paths, no pages. The
template is otherwise untouched: launching these is flipping one boolean, not
restoring deleted code.

**Nothing in `global.css` had to change for the inert card,** which is worth
recording because it is the kind of thing someone goes looking for. Every hover,
focus and lift rule is written `.product-card:has(.product-card-link:hover)`.
No link, no `.product-card-link`, and the entire interactive costume stops
matching on its own. The `→` affordance is removed in markup, on instruction and
on merit: it is the card's one promise that pressing it goes somewhere.

### The check that should have existed all along

§9 already demands "zero broken refs" for images. `internalLinksResolve()` in
`scripts/verify/contracts.mjs` is that sentence applied to `href`, asserted
against **the production build** — not `dist`, which carries the styleguide route
and would answer for links that only resolve in a build nobody visits.

**It failed on its first run, on something that had nothing to do with this
work.** `/terms` and `/privacy` were in `legalLinks` and neither page has ever
existed: 14 dead links, two per page, across all seven pages, shipped for as
long as the footer has. Removed rather than pointed somewhere plausible — a
legal link to the wrong page is worse than none, and a footer row is not where
a privacy policy gets improvised. The row self-skips when the list is empty,
because an empty `<ul>` is still a list announced with zero items.

Fault-injected per §9 before counting it: `/no-such-page` into the home hero's
button → `1 failure`, the URL and the page named, exit 1 → reverted.

The production build is now built once and shared by both contracts that read
it, and its styleguide scan went recursive — the site has nested routes now, and
a top-level-only scan cannot see into the directory a leak would land in.

### Two page paths came OFF the sweep list, and that is not what it looks like

`/products/cold-chain-shipping/insulated-metallic-mailers` and `.../gel-packs`
were swept as the two ends of the optional-field range. They are gone from
`PAGES` because **no build emits them**; sweeping them would 404 through the
preview server and report structure assertions about an error page, which is the
port-4321 incident wearing different clothes — real numbers, wrong artifact.

Nothing about those pages was failing. **This is the list following the build,
not the list being narrowed to reach green,** and the reasoning is written at the
site in `lib/cdp.mjs` so the next reader does not have to take this entry's word
for it.

What is genuinely uncovered: the product page template's optional-field skips.
Open question 58.

### Also in this pass

**The sitemap was missing the category pages.** `staticPaths` can only see routes
whose filename is the URL, so it dropped everything with a `[` — the three
category pages have never been in `sitemap.xml`, and they are launch surface.
Now derived from `getCategories()`, as the file's own PROJECT note always said
it should be. Product pages follow the same gate, so the sitemap cannot advertise
a URL the build does not emit. 4 URLs → 7.

**Three `guideLinkLabel` strings**, supplied directly: "How to choose the right
cold chain configuration" → "Browse cold chain", "How custom boxes fit the
build" → "Browse custom boxes", "How to choose the right pharmacy format" →
"Browse pharmacy formats". Exact full-string matches, one field per file, line
counts 36/30/30 before and after — the assertion entry 45 paid for.

These are now **identical to `navLinkLabel`** in all three files. Two fields
holding one string is a second source; open question 59.

**The arrow link centres on its label.** `items-start` was correct for a reason
that has just expired: it existed so a long wrapping label kept its arrow on the
first line, and the longest arrow-link label on the site is now 28 characters.
The cost had been paid on every single-line link — a 16px glyph pinned to the
top of a 20px line box, the tertiary action site-wide very slightly out of true.
Reversal recorded at the site, both positions written down.

**The home hero's alt text was re-read against the swapped photograph** (entry
46's rule). It said "two insulated mailers": there is one mailer and one gel
pack, a different product. It also said "jars" for a single open jar and never
named the gel pack. Rewritten from the picture. The closing band's `alt: ''` is
deliberate and unaffected.

### Measurements

| | before | after |
| --- | --- | --- |
| verify | 8 checks, 536 assertions, 0 failures | **8 checks, 602 assertions, 0 failures** |
| pages emitted by a production build | 19 | **7** |
| links to product detail pages, per page | 39 | **0** |
| product names still listed, per page | 39 | **39**, as text |
| internal links asserted to resolve | 0 | **118 across 7 pages** |
| dead links in the production build | **14** (`/terms`, `/privacy`) | 0 |
| sitemap URLs | 4 | **7** |

### Open questions

Unchanged: 22, 23, 24, 25, 26, 28, 29, 31–34, 36, 37, 40, 41, 44, 48, 51, 52,
53, 54, 55, 56, 57. Three added:

58. **The product page template is verified by nothing while the gate is shut.**
    Its optional-field skips were the reason two product paths were on the sweep
    list. Both go back when `LAUNCH.productPages` flips; until then the template
    can rot without the harness noticing.
59. **`guideLinkLabel` and `navLinkLabel` now hold the same string in all three
    category files.** Either retire one field, or record why the two surfaces
    are allowed to diverge later.
60. **`/terms` and `/privacy` are gone from the footer, not written.** A
    commercial site launching without either is a decision someone should make
    deliberately rather than inherit from this entry.

---

## 2026-09-28 — Entry 48. The contact form moves to Formspark

Endpoint supplied directly: `https://submit-form.com/bqtIN0U6N`, set up in
Formspark, HTML technology selected. Recorded as a deviation from §8 in
**AUDIT.md D7**; this entry is what it cost and what was found on the way.

### The form has never been able to deliver an enquiry

Reading the code before changing it: `PUBLIC_TURNSTILE_SITE_KEY` gates the
Turnstile widget at build time, and `functions/api/contact.ts` answers
`503 Form is not configured.` without a `TURNSTILE_SECRET_KEY`. Neither is in the
environment. **Every submission since the form shipped has been a 503 rendered
in the live region** — correctly, visibly, and to no useful end.

So the deviation is not a downgrade from a working system. §8's design was
correct and was never switched on; Formspark needs no key, no environment and no
function, and works on a fresh clone.

### What §8's guarantee actually rested on

The rule is that a form must never swallow an enquiry silently. It would have
been easy to read the Pages Function as the thing enforcing that, and it was not:
**the intercepted submit and the live status region are the guarantee**, and both
survive unchanged. `accept: application/json` makes Formspark answer JSON instead
of redirecting, so the outcome is rendered on the page in words rather than
navigating the visitor to submit-form.com. `contracts.mjs` still fails the build
if that region goes missing.

Formspark's own documented HTML setup is a native POST. Taking it would have sent
a visitor who filled the form correctly to a third party's thank-you page, and a
visitor who hit an error to a third party's error page. Declined.

### Three defences deleted rather than left looking like defences

- **Turnstile.** Its token was only ever verified by the function that is gone,
  and Formspark does not check it. Kept, it would have been a visible challenge
  the visitor pays for that stops nothing. The widget, the script tag and the
  env gate all go.
- **The time floor.** `MIN_FILL_MS` / `MAX_FILL_MS` were evaluated server-side by
  deleted code. `started_at` came out of the markup: **a hidden field no endpoint
  reads is data wearing the costume of a defence**, and leaving it would have
  been worse than never having had it, because the next reader would count it.
- **`sendLead()`.** Delivery is Formspark's now. The seam goes with the function.

**The honeypot survives because it is the one that still does something** — but
only after being renamed `company_website` → `_honeypot`, which is the reserved
name Formspark enforces. Under any other name it is an ordinary form field that
gets filed with the enquiry. The contract assertion follows the field; the
assertion itself is unchanged.

### Two stale allowances found by following the deletions out

- `scripts/verify/utilities.mjs` carried a `cf-turnstile` entry in
  `UNSTYLED_BY_DESIGN`. The class no longer reaches any page, so the allowance
  described a site that no longer exists. Removed — that list is meant to read as
  the complete set of deliberately unstyled classes.
- The JS census's justification for this script described all three deleted jobs
  and the budget set for them. Rewritten, and **the budget came down 750 → 550 B**
  rather than being left slack: a budget nothing pushes against stops being a
  budget.

### A number I nearly asserted instead of measuring

The census text was first written with "Measured at 458 B" — **a figure I had not
taken.** Measured from `dist`: 518 B by hand, and **519 B by the census's own
`gzipSync(level: 9)`**, which is the number that belongs in the census because it
is the one the check computes. Corrected twice, and recorded here because a
plausible invented measurement in a file whose entire purpose is measurement is
the worst place for one to sit.

### Measurements

| | before | after |
| --- | --- | --- |
| verify | 8 checks, 602 assertions, 0 failures | **8 checks, 602 assertions, 0 failures** |
| contact script | 620 B gzipped / 750 B budget | **519 B / 550 B** |
| total shipped JavaScript | 14,583 B across 28 scripts | **6,461 B across 15** |
| third-party requests on /contact | Turnstile api.js | **none** |
| deliverable enquiries | **0** (503, no secret) | Formspark |
| repo lines of form endpoint code | 234 | **0** |

The JavaScript total falls for two reasons and only one is this entry's: twelve
product pages left the build (entry 47), and Turnstile's loader left this page.

### Open questions

Unchanged: 22, 23, 24, 25, 26, 28, 29, 31–34, 36, 37, 40, 41, 44, 48, 51, 52,
53, 54, 55, 56, 57, 58, 59, 60. Two added:

61. **Lead data now transits a third party.** Formspark stores submissions. That
    is a processor relationship and belongs in the privacy policy the site does
    not have — which is open question 60, now with a second reason to close it.
62. **Nobody has submitted this form end to end.** The endpoint is wired and the
    build is green, but green here means the markup is right; it does not mean an
    enquiry arrived. A live submission to the real endpoint, confirmed in the
    Formspark dashboard, is a human punch-list item before launch.

---

## 2026-09-28 — Entry 49. The dev override was a preview that lied

**Supersedes the dev-override ruling in entry 47.** That entry gated product
detail pages out of the build and wrote the gate as
`LAUNCH.productPages || import.meta.env.DEV`, so `npm run dev` still served the
pages and still linked to them. The stated reason was that unlaunched work
should stay reviewable locally. It was wrong, and the way it was wrong is the
entry.

### What it actually did

Reported as the product cards still being clickable. Both artifacts measured on
the same commit, same source:

| | `dist` (what ships) | `localhost:4321` (dev) |
| --- | --- | --- |
| product links on /products | **0** | **52** |
| card arrows in markup | **0** | **16** |
| `/products/cold-chain-shipping/gel-packs` | not emitted | **200** |

The build was correct the whole time. **The dev server was showing a different
site from the one that ships, on precisely the question under review** — and the
dev server is where anybody actually looks. So the change appeared not to have
worked, twice, and the thing being inspected was never the thing being changed.

That is the port-4321 incident's shape again (§9) in a place §9 does not reach:
real output, honestly rendered, about the wrong artifact. The harness was never
fooled — `verify` builds and reads `dist`, which is why every run was green and
green was not the reassurance it looked like.

**A preview that disagrees with the artifact is worth less than no preview.**

### The correction

`productPagesShip()` is now `LAUNCH.productPages` and nothing else. Dev gates the
pages out exactly as a build does: product URLs 404 in dev, cards render a plain
`<h3>` with no anchor and no arrow, everywhere.

Reviewing the product page template means setting `LAUNCH.productPages` to
`true` — one line, and honest, because while it is true those pages genuinely
are part of the site. It is also exactly how they launch.

### Not removed, and the reason is the same one as last time

`.product-card-go` and `.product-card-link` stay in `global.css` although no
markup carries either class right now. They are not dead: they are the card's
interactive costume, and it returns in full the moment the flag flips. The same
argument left `[product].astro` untouched in entry 47 — **launching is flipping
one boolean, not restoring deleted code.** The dead-class check reads HTML → CSS
and so has nothing to say about a rule with no current user; that is the check
being correctly scoped, not a gap this is slipping through.

Worth knowing when reading dev output: `product-card-go` still appears three
times in the dev server's HTML because dev inlines the stylesheet, so the CSS
rule text is in the document. Zero of them are markup. `dist` links the
stylesheet instead, which is why the same grep returns 0 there — the two numbers
disagree for a reason that has nothing to do with the cards.

### Measurements

| | |
| --- | --- |
| verify | 8 checks, 602 assertions, 0 failures |
| dev and dist, product links | **0 and 0** |
| dev and dist, card arrows in markup | **0 and 0** |
| pages emitted | 7, unchanged |

### Open questions

Unchanged: 22, 23, 24, 25, 26, 28, 29, 31–34, 36, 37, 40, 41, 44, 48, 51, 52,
53, 54, 55, 56, 57, 58, 59, 60, 61, 62. One added:

63. **Nothing prevents a future gate from growing a dev-only branch again.** The
    failure was invisible to a green harness because the harness only ever reads
    `dist`. A check that diffs a dev-rendered page against its built counterpart
    would catch the whole class; it is not obviously worth the machinery for one
    flag, which is why this is a question rather than an entry.

---

## 2026-09-28 — Entry 50. The CSP still named Turnstile, and a person found it

Reported from the browser console on a real submission attempt:

> Connecting to 'https://submit-form.com/bqtIN0U6N' violates the following
> Content Security Policy directive: "connect-src 'self'
> https://challenges.cloudflare.com". The action has been blocked.

Entry 48 moved the form to Formspark and deleted Turnstile. **It did not follow
the change out to `public/_headers`,** so `connect-src` still permitted the
domain of a service the site no longer uses and did not permit the endpoint the
form now posts to. Every submission was refused by the browser before it left
the page.

### The form behaved correctly, which is the one good part

The page said *"Could not reach the server. Please email info@centipack.com."*
That is the catch branch in `src/scripts/contact.ts`, and it is exactly right —
the request genuinely never reached anything, and the visitor was told so in
words with a working alternative. **§8's guarantee held under a failure nobody
had anticipated.** The enquiry was not swallowed; it was refused, visibly.

### Why nothing in the harness objected

A CSP is a RESPONSE HEADER. `astro dev` and `astro preview` do not apply
`_headers`, so the policy is inert everywhere except a real deploy — and every
rendered check in this harness runs against the preview server. The build was
valid, the markup was right, and `internalLinksResolve()` inspects internal
links only. **There was no artifact under test that carried the bug.**

§9: "a rule that only convention enforces is a rule that will be broken."

### `cspMatchesTheSite()`, and the fault injection that rewrote it

The check asserts, against the production build, that the CSP and the site agree
in both directions: every external origin the pages reference is permitted, and
every origin permitted is referenced. Turnstile sitting in three directives
after its code was deleted is the second failure, and is how an allowlist decays
into a list of things somebody once used.

**The first version passed its own fault injection, and that is the entry.**
Removing `submit-form.com` from `connect-src` — the exact production bug —
left it in `form-action`, and a check that reads the CSP as a flat set of
origins saw the origin still present and reported green. It would have caught
the original bug, because that origin was absent from the policy altogether; it
would not have caught the bug it was written for if the shape had been slightly
different. A check that passes the fault it exists to catch is an assertion
about the harness.

So the form endpoint is now checked PER DIRECTIVE, against both that govern it:

| directive | why | failure if missing |
| --- | --- | --- |
| `connect-src` | the submit is intercepted and sent by fetch | request refused, page reports it |
| `form-action` | the `<form>` has a real action; a browser that never ran the module POSTs natively | **POST blocked, nothing visible happens at all** |

All three red paths demonstrated, each exit 1: origin missing from
`connect-src`, origin missing from `form-action`, stale Turnstile allowance
re-added.

### A second bug, found by writing the check rather than by a visitor

`form-action` was `'self'` — it had never included Formspark, and would not have
until something forced the question. With JavaScript unavailable the form does a
native POST to `submit-form.com`, and under `form-action 'self'` the browser
blocks it: **no navigation, no error on the page, the enquiry simply gone.**
That is the silent swallow §8 exists to prevent, and it was one script-load
failure away from being live. Now permitted, so the no-JS path degrades to
Formspark's own thank-you page.

`frame-src` was removed rather than emptied — with no directive it falls back to
`default-src 'self'`, which is tighter than the Turnstile allowance it replaced.

### Three URLs in the built HTML are not fetches

Enumerated in `NOT_A_FETCH` with reasons rather than silently skipped:
`http://www.w3.org` (XML namespace on `<svg>`, never dereferenced),
`https://schema.org` (JSON-LD `@context`, a vocabulary name), and the site's own
origin — read out of the built `index.html`'s canonical tag rather than imported
from `consts.ts`, because the artifact's own statement of where it lives is what
ships.

### Measurements

| | before | after |
| --- | --- | --- |
| verify | 8 checks, 602 assertions | **8 checks, 606 assertions, 0 failures** |
| origins permitted by the CSP | 1, used by nothing | **1, used** |
| origins used but not permitted | **1** (`submit-form.com`) | 0 |
| directives naming a dead service | **3** | 0 |
| deliverable enquiries | **0** (blocked) | endpoint permitted; see OQ 62 |

### Open questions

Unchanged: 22, 23, 24, 25, 26, 28, 29, 31–34, 36, 37, 40, 41, 44, 48, 51–63.
One added:

64. **No check covers response headers as a deployed browser would see them.**
    This check reads `_headers` as a file and reasons about it; it cannot tell
    whether Cloudflare Pages actually serves what the file says, nor catch a
    header set in a dashboard rather than in the repo. Open question 62's live
    submission is currently the only thing that would.

Open question 62 is now the urgent one: **the endpoint has still never accepted
a submission.** It has been attempted once and refused by the CSP.

---

## 2026-09-28 — Entry 51. The honeypot explained itself to the bots

Two changes asked for, and one of them uncovered a live defect that the other
had just made worse.

### The honeypot is `company_contact` now

`company_contact` registered as a custom honeypot name in the Formspark
dashboard, and the field renamed to match. **The name is the mechanism.**
`_honeypot` and `_gotcha` are Formspark's always-on names and therefore published
ones: a bot author who has read any form using them can skip them by name on
every site that uses them, and the better the bot the more certainly it does. An
innocuous-looking contact field has nothing to skip on sight.

This is the third name for this field — `company_website` for the Pages
Function, `_honeypot` for Formspark's default, `company_contact` now — and the
last one is the first that is both enforced and not self-announcing.

**The coupling is invisible from the repo.** This is a trap only while that
dashboard setting exists. Delete the custom name in Formspark and the markup goes
on looking exactly as correct as it does today while quietly filing spam as
ordinary form data. Nothing here can see or assert it. Open question 65.

### And then: the comment describing the trap was shipping in the page

Writing that explanation next to the input, as `<!-- -->`, put it **in the HTML
of the live contact page**. A paragraph naming the honeypot field and stating in
as many words that it is a trap, served to every visitor — and the one audience
certain to read page source is the audience the field exists to fool.

Found by grepping `dist` for `_honeypot` after the rename, expecting zero hits
and getting two. **Both were inside my own comment.** §2's thesis again: it was
invisible in source, because in source it is a comment, and comments are the one
thing a reader's eye is trained to treat as not-content.

The pre-existing comment already said "Honeypot. Off-screen rather than
display:none — some bots skip hidden fields". So this was live before this
session; the rewrite made a small leak into a complete disclosure.

The explanation now lives in the frontmatter, which is compiled away.

### `<!-- -->` is content. 29 of them across the site

| page | comments | bytes shipped |
| --- | --- | --- |
| contact | 7 | 2,682 |
| products | 9 | 2,232 |
| index | 7 | 1,361 |
| three category pages | 7 each | 1,486 each |
| about | 6 | 1,113 |

All converted to `{/* … */}`, which Astro strips. **The source keeps every word**
— this costs the codebase nothing and removes roughly 1–2.7 KB per page of
internal design reasoning from what visitors receive.

Converted by script rather than by hand, with entry 45's discipline: each
comment matched end to end, the per-file count asserted after, and anything
containing `*/` reported and left alone rather than guessed at. 29 converted, 0
skipped, 0 aborted.

### The check, and the fault injection that was wrong the first time

`noCommentsInShippedHtml()` asserts the production build carries no HTML comment
at all. Flat rule, deliberately: the honeypot note was written to be helpful and
had been reviewed, so **the author of a comment is the last person able to judge
whether it is safe to publish.** A rule with no judgement in it cannot be argued
with.

**The first fault injection passed, and the reason is worth keeping.** A comment
was injected as a direct child of `<BaseLayout>` — and it never reached `dist`.
Measured:

```
<BaseLayout>          direct child of a component slot  →  STRIPPED
  <!-- x -->
<div>                 inside a plain HTML element       →  SHIPS
  <!-- x -->
```

Astro strips one and emits the other. The honeypot note was in the second
position, inside a `<form>`, which is exactly how it reached production. Injected
there instead: 1 failure, page named, bytes counted, exit 1.

**A source grep could not have done this job.** It would flag both positions,
half its hits would be false, and a reviewer would learn to ignore it. Only the
built output knows which comments are real — which is the same sentence this
repo has now paid for in CSS rules, in dead classes, in link targets, and here.

### Measurements

| | before | after |
| --- | --- | --- |
| verify | 8 checks, 606 assertions | **8 checks, 613 assertions, 0 failures** |
| HTML comments in the production build | **29, ~11.8 KB** | **0** |
| mentions of the honeypot in shipped HTML | **2** | **0** |
| honeypot field name | `_honeypot` (published) | `company_contact` (custom) |

### Open questions

Unchanged: 22–26, 28, 29, 31–34, 36, 37, 40, 41, 44, 48, 51–64. One added:

65. **The honeypot works only while a Formspark dashboard setting exists, and
    nothing in this repo can see it.** Same shape as open question 64: the
    contract is with a third-party console, and the harness ends at the network
    boundary. A periodic live submission with the honeypot filled — expecting
    rejection — is the only thing that would prove it.

---

## 2026-09-28 — Entry 52. The collage's own five shots arrived

Supplied in `src/assets/home/cta-banner/` as `home-cta-1` … `home-cta-5`, for
the home page's closing CTA — section 5, the placed collage around "Thermal
integrity. Validated performance. Manufacturing scale." There is no CtaBanner on
Home; this band is its call to action.

They replace the product catalogue's shots, which have stood in since the first
build. The import site said *"swapping back is five lines"*, and it was five
lines.

### The file numbers are not the slot order

The obvious reading — `home-cta-1` into the first slot, and so on — is wrong,
and acting on it would have put a tall jar in a box drawn 618:593 and a flat
top-down pouch in one drawn 288:540. The mapping was derived two independent
ways, and they agree:

**Every file's height is exactly twice its slot's drawn box.**

| slot | drawn box | ×2 | file | actual |
| --- | --- | --- | --- | --- |
| top centre | 618 × 593 | 1236 × 1186 | `home-cta-2` | 1236 × 1188 |
| left, bleeding | 360 × 628 | 720 × 1256 | `home-cta-1` | 904 × 1256 |
| right, bleeding | 288 × 540 | 576 × 1080 | `home-cta-4` | 720 × 1080 |
| bottom right | 522 × 628 | 1044 × 1256 | `home-cta-5` | 1044 × 1256 |
| bottom left | 514 × 504 | 1028 × 1008 | `home-cta-3` | 1028 × 1008 |

**And sorting files and slots independently by aspect ratio pairs them the same
way.** Three match their box outright; two are wider, so `--at-ratio` crops them
horizontally into the composition — the same job that property has always done,
except it is now trimming the sides of a correct photograph rather than
rescuing a wrong one.

Subjects, in slot order: flat gel pack shot from above; navy jar with its lid
off and vials inside; EPS cooler in its corrugated outer; the large insulated
mailer; drawer box slid open on two vials.

### Verified by looking at it

Two derivations agreeing is an argument, not a result. The page was built,
served and screenshotted at 1440 and 390, and read:

- **1440** — gel pack top centre, jar bleeding off the left gutter, cooler off
  the right, drawer box and mailer below. The heading and button sit clear of
  all five, which is the thing `max-w-[38.75rem]` on the text column exists to
  protect and the failure this arrangement would have shown first.
- **390** — gel pack above the heading, drawer box and mailer below the button,
  the two gutter shots dropped. Exactly what the mobile rule describes, with the
  real files in place of the borrowed ones.

### `alt` came out of the collage rows

Five sentences describing photographs, and nothing has ever read them: the list
is `aria-hidden="true"` and the template passes `alt=""` directly. They were
also now stale — they described the borrowed product shots, not these. Dead data
that reads as authoritative is worse than no data, and a future reader wiring
`shot.alt` into the `<Image>` would have shipped five confident descriptions of
the wrong pictures.

The decision they encoded is unchanged and still stated at the list: these five
are decoration around a heading that already says what they are, and five alt
texts here would be five interruptions on the way to the button.

### Measurements

| | before | after |
| --- | --- | --- |
| verify | 8 checks, 613 assertions, 0 failures | **8 checks, 613 assertions, 0 failures** |
| collage images | 5 borrowed from `assets/products` | **5 own, `assets/home/cta-banner`** |
| references to borrowed shots on Home | 5 | **0** |
| dead `alt` strings in the collage data | 5 | **0** |

### Open questions

Unchanged: 22–26, 28, 29, 31–34, 36, 37, 40, 41, 44, 48, 51–65.

Open question 27 — the collage's mobile fallback — stays closed; the placed
mobile arrangement it was closed with is what these render into.

---

## 2026-09-28 — Entry 53. The custom boxes card shot

`category-custom-boxes.avif` replaced in the tree at push time, 1320 × 1596. An
open blue mailer box holding two branded bottles, a blue drawer box slid open on
two vials, and an open white mailer behind them with a long branded box inside.

**The alt was re-read against the picture and stands unchanged** — *"An open blue
mailer box of bottles and a blue drawer box of vials, beside a white mailer
holding a branded box."* All four elements confirmed, including a zoom on the two
containers in the mailer box to check "bottles" against what is actually in
frame. Entry 46's rule, applied and answered "no change" this time.

### The thing worth checking on this card, and the number

`CategoryCard` sets `data-theme="dark"` whenever it has an image, so the heading,
the body and the link are **white type sitting directly on the photograph**.
There is no scrim: it came off in entry 40 when the client's pre-darkened shots
landed, so every one of these cards depends on the photograph itself carrying the
contrast. A replacement shot is therefore a contrast change, and nothing in
`npm run verify` would say so — the contrast matrix reads token pairs from the
built CSS and has no view of what a photograph does behind a paragraph.

Measured off a rendered screenshot instead: the darkest decile of pixels behind
each text box, against white.

| card | element | size | contrast | needs | |
| --- | --- | --- | --- | --- | --- |
| Pharmacy Formats | heading | 32px | 3.17 | 3.0 | pass |
| Pharmacy Formats | body | 16px | 18.26 | 4.5 | pass |
| **Custom Boxes** | heading | 32px | **3.25** | 3.0 | pass |
| **Custom Boxes** | body | 16px | **17.44** | 4.5 | pass |
| Cold Chain & Shipping | heading | 32px | 3.17 | 3.0 | pass |
| Cold Chain & Shipping | body | 16px | 17.39 | 4.5 | pass |

The new shot is the best of the three on the heading. Not a regression — a
marginal improvement.

**The headings clear 3:1 by 0.17–0.25 across all three cards**, which is thin,
and it is thin on the two cards nobody changed. They pass only because 32px at
weight 500 is WCAG "large text"; at the body threshold all three would fail.
Pre-existing, not introduced here, and now written down with a number rather than
left as a thing that has always looked fine. Open question 66.

### Open questions

Unchanged: 22–26, 28, 29, 31–34, 36, 37, 40, 41, 44, 48, 51–65. One added:

66. **The three category card headings clear their contrast threshold by under
    0.3, and only as "large text".** Every future photograph swap on these cards
    is one shade away from failing, with no check to catch it — the contrast
    matrix cannot see a photograph. Either the scrim comes back as an insurance
    band behind the type, or a check samples rendered pixels behind text on a
    themed card. The measurement above is the method; it is not wired into
    `verify`.

---

## 2026-09-28 — Entry 54. Icons and the share image

Supplied into `src/assets/brand/`: `centipack-icon-light.svg`,
`centipack-icon-dark.svg` and `centipack-OpenGraph.png` at 1200 × 630. Both the
favicon and the OG tags were `PROJECT:` placeholders until now — **the site has
been shipping no icon of any kind and no `og:image` at all**, because
`BaseLayout`'s `ogImage` prop existed and no page had ever passed it.

### The two sources are one path and two fills

The badge is a solid square with the arrow knocked OUT — a hole, not a second
shape — so whatever sits behind shows through it. `-dark` fills the square
`#1F1F1F`, `-light` fills it white; the geometry is byte-identical.

`scripts/build-icons.mjs` extracts that one path and asserts the two sources
still agree, because `favicon.svg` is built on the assumption that they do. If a
future export makes them genuinely different artworks the script stops rather
than silently picking one.

### Four files, and why each is the shape it is

| file | size | why |
| --- | --- | --- |
| `favicon.svg` | 541 B | the path plus a `prefers-color-scheme` rule |
| `favicon.ico` | 444 B | 32 × 32, for browsers that do not read an SVG favicon |
| `apple-touch-icon.png` | 1,933 B | 180 × 180, opaque |
| `og-default.png` | 29,912 B | copied, not re-encoded |

**One SVG answers both themes.** A `media` attribute on `<link rel="icon">` is
not reliably honoured, so the switch is a `@media (prefers-color-scheme: dark)`
rule *inside* the SVG — dark ink by default for a light tab strip, white under a
dark one. The arrow is a hole in both, so it takes the tab's own colour and
needs no second fill.

**The raster icons had to be flattened, and that is not a size decision.** iOS
composites an apple-touch-icon onto its own rounded square and **renders alpha as
black** — a transparent arrow would come out as a black arrow on a near-black
square, i.e. the mark, invisible. Flattening onto white fills the knockout
instead: a dark badge with a white arrow, which is what the lockup already draws
on a light ground and is legible on a light or a dark tab.

**`sizes="32x32"` on the `.ico` link is load-bearing**, not decoration: without
it a browser may take the ICO as the better candidate and never look at the SVG.

### The ICO container is 22 bytes written by hand

`sharp` does not write ICO and neither does `sips`, and an ICO is a 6-byte
header, a 16-byte directory entry, and then the image — which since Vista may be
a PNG verbatim. Writing those 22 bytes beat adding a dependency to produce them.
Verified in the built file: `0000 0100 0100` then `20 20`, one plane, 32bpp,
offset 22, then PNG magic.

### public/, not src/assets, and the reason is not preference

Everything under `src/assets` gets a fingerprinted filename. **A browser requests
`/favicon.ico` on its own and iOS requests `/apple-touch-icon.png` on its own —
neither has read the HTML first**, so both need paths that do not move. The share
image needs a stable URL for a different reason: scrapers cache by it.

### A script that produces a committed artifact, per the font precedent

`scripts/build-icons.mjs` is run by hand, not wired into the build. The exact
pattern `scripts/subset-fonts.py` already set for `DMSans.subset.woff2`: these
four files change when the brand changes, which is roughly never, and a build
step re-deriving identical bytes on every deploy is machinery earning nothing.
`sharp` is Astro's own image dependency — nothing added to the tree, and nothing
here reaches a browser.

The script refuses to run if the share image is not 1200 × 630, because
`BaseLayout` **declares** those numbers in `og:image:width`/`height` rather than
deriving them. That check is what keeps the file and the meta from disagreeing.

### The link check picked them up for free

`internalLinksResolve()` went from 118 assertions to **139** — three icon `href`s
across seven pages — so a missing or misnamed icon file now fails the build
without anything being added. That was not designed for; it is what a check
written against `href` generally rather than against a page list generally does.

### Measurements

| | before | after |
| --- | --- | --- |
| verify | 8 checks, 613 assertions | **8 checks, 634 assertions, 0 failures** |
| internal link assertions | 118 | **139** |
| icons shipped | **0** | 3 |
| pages carrying `og:image` | **0** | **7** |
| added bytes in `public/` | — | 32,830 B |

### Open questions

Unchanged: 22–26, 28, 29, 31–34, 36, 37, 40, 41, 44, 48, 51–66. One added:

67. **Every page shares one OG image and one OG title pattern.** The image is
    generic — headline plus lockup — which is right for Home and weaker for a
    category page a buyer lands on from search. Per-page share images are a real
    improvement and a real cost; the `ogImage` prop is already there to take one.

---

## 2026-09-28 — Entry 55. Structured data, which was one type on four pages

Asked what the site had. Read out of `dist` rather than answered from memory,
and the answer was thinner than it looked:

| page | before |
| --- | --- |
| Home | **nothing** |
| About | **nothing** |
| Contact | **nothing** |
| Products index | `BreadcrumbList` |
| 3 category pages | `BreadcrumbList` |

One type, on four of seven pages, and **nothing anywhere saying CentiPack is an
organisation** — the node a search engine attaches a brand to.

The plumbing was never the problem. The `JsonLd` atom works, and `Breadcrumb`
emits its own `BreadcrumbList` beside the trail it describes, so a page cannot
get one without the other. Nothing else had been wired.

### One `@graph`, not three blocks

`Organization`, `WebSite` and a page node, in `BaseLayout`, referencing each
other by `@id`: the page `isPartOf` the site, the site `publisher`ed by the
organisation. Three unlinked blocks would describe three unrelated things that
happen to share a page.

`BreadcrumbList` deliberately stays where it is. Moving it into the graph would
break the coupling that makes it trustworthy — it is emitted by the component
that draws the visible trail, from the same array.

`pageType` is a closed union, not a string: `WebPage` | `AboutPage` |
`ContactPage` | `CollectionPage`. A typo in structured data fails silently
because structured data has no runtime, so the compiler is the only thing that
can catch it.

### What was left OUT, which took longer to decide than what went in

No address, no telephone, no `sameAs`, no `foundingDate` — **none of them appear
anywhere on this site.** The phone was deliberately removed site-wide and the
social accounts do not exist. Structured data is the worst place to debut a fact
nobody can check against the page.

**No `parentOrganization`, and this was the tempting one.** About says *"We come
from Centigrade Logistics, a cold chain operation."* That is a sentence about
where the founders came from. It is not a claim about corporate structure, and
turning it into one would be inventing a fact in the single format that reads as
authoritative precisely because a machine wrote it.

**No `SearchAction` on the WebSite node** — the thing everybody copies. It
declares a search endpoint, and this site has no search, so it would name a URL
that 404s.

**No `Product` schema**, ruled against and agreed: with product pages gated there
is no URL, no price, no availability and no offer. Incomplete `Product` markup
earns Search Console warnings rather than rich results, and it would assert
purchasable entities the site does not back with a page. It arrives with the
pages.

### The email became one source on the way

`info@centipack.com` was typed independently into the footer and the contact
page, and the `Organization.email` would have been a third. **A machine-readable
address that can drift from the visible one is worse than none**, because the
copy nobody proofreads is the one a crawler believes. Now `SITE.email`, consumed
three times.

### Breadcrumbs on About and Contact are a DESIGN change, and were taken as one

Those two pages had no trail, so they had no `BreadcrumbList`. Adding the schema
alone would have been markup describing a UI that is not there — so the visible
trail went in too, and both were rendered and read at 1440: centred on About,
because that page is centred, and left-aligned above the h1 on Contact, matching
the products and category pages. Placement follows the page; the component does
not impose one.

### `ItemList` follows the launch gate rather than repeating a decision

Each category page lists its products, derived from the same array the rail
renders — §5's rule about second sources applies to structured data exactly as
it does to a nav. The entries carry names and **no `url`**, because
`product.href` is `undefined` while the pages are gated, and a `ListItem`
pointing at a route the build does not emit is a 404 asserted authoritatively.
They gain URLs on the same boolean that gives them pages: no second edit, and no
window in which the two disagree.

### After

| page | after |
| --- | --- |
| Home | `Organization`, `WebSite`, `WebPage` |
| About | + `AboutPage`, `BreadcrumbList` |
| Contact | + `ContactPage`, `BreadcrumbList` |
| Products index | + `CollectionPage` |
| 3 category pages | + `CollectionPage`, `ItemList` |

### Measurements

| | before | after |
| --- | --- | --- |
| verify | 8 checks, 634 assertions | **8 checks, 636 assertions, 0 failures** |
| pages with structured data | 4 of 7 | **7 of 7** |
| distinct schema types | 1 | **7** |
| pages naming the organisation | **0** | **7** |
| hardcoded copies of the email | 2 | **0** (one source) |

### Open questions

Unchanged: 22–26, 28, 29, 31–34, 36, 37, 40, 41, 44, 48, 51–67. One added:

68. **Nothing validates the structured data.** It is well-formed JSON by
    construction, and that is all that is proven — no check asserts that the
    `@id` references resolve within the graph, that a required property has not
    been dropped, or that the types are ones schema.org defines. A malformed
    graph fails exactly as silently as a missing one. Google's Rich Results Test
    is the manual answer; a local check over the emitted blocks is the durable
    one.

---

## 2026-09-28 — Entry 56. Turnstile, and the widget that did not fit

Site key supplied: `0x4AAAAAAFHCIE9r1TW2roAB`, with the secret half configured
in Formspark. **AUDIT D7 narrows** — the deviation is now about *who* verifies
the token, not *whether* anyone does.

Turnstile came off in entry 48 for a specific reason: its token was only ever
checked by the Pages Function that went with it, and an unverified challenge is
a step the visitor pays for that stops no bot. Formspark checks it now, so the
reason has expired and the widget is back. Three layers, each catching what the
others do not: Formspark's filtering, the honeypot (a bot that fills every
field), Turnstile (a bot that fills only the visible ones).

The reset came back too, and it is not optional: **a token is single-use**, so
without it a second attempt posts a spent one and is refused again for a reason
the visitor cannot see or fix. 16 B gzipped, 519 → 535, **inside the 550 budget
already set** — the budget did not move, because raising one to fit a change
nobody measured is how a budget stops being one.

### The sweep caught a horizontal scroll on the phone, immediately

`data-size="flexible"` does not mean what it sounds like. **Turnstile's iframe
has a hard 300px floor**, and flexible only governs the width above it. Measured
on the built page rather than guessed:

| viewport | space for the widget | widget needs | result |
| --- | --- | --- | --- |
| 320 | 240px | 300px | **document pushed to 340** |
| 360 | 280px | 300px | spill |
| 768 | 245px | 300px | spill — the `md` grid narrows the form column |
| 1440 | 560px | 560px | fine |

Three failures the moment Turnstile went in, on the one page that has to work.
Worth noting **768 is not a narrow viewport** — the form sits in a 6-column grid
there and gets 245px while the window is wide, which is why this was never a
question about screen size.

**`data-bleed` would have silenced it in one line and was not an option.** That
hatch is for art direction that deliberately runs past its box — the collage,
the product rail. A third-party iframe that does not fit is not art direction,
and declaring it bleed is exactly the "weaken the check" §9 forbids.

### `zoom`, not `transform: scale()`

`scale` paints smaller and leaves the original box in the layout, so a 0.75
scale would have left ~16px of dead space under the widget and broken the form's
rhythm. **`zoom` scales the layout box with the pixels**, so the gap closes
itself. Where `zoom` is unsupported the widget renders at 300px — the behaviour
before this rule, not a worse one.

**A container query, not a media query**, because the trigger is not viewport
width — 768 proves that. The question is always "how much room does this widget
have", and that is the question a container query asks.

**0.75 rather than the 0.8 that exactly fits.** 300 × 0.8 is 240.0 against 240px
available, and the sweep's own tolerance is half a pixel. A rule that passes by
rounding is a rule that fails on the next browser.

### Two checks had to be widened, and both kept their red path

**The JS census hard-failed on any off-site script** — "UNDECLARED external
script". The previous Turnstile code only ever passed it because the widget
never rendered without an env key, so the rule had never met a real third-party
tag. It now has an `EXTERNAL` list: declared with a reason, undeclared still
fails. Fault-injected `https://cdn.example.com/tracker.js` → 1 failure, exit 1,
reverted.

**No byte budget on an external entry**, deliberately. The payload is served by
somebody else, is not in `dist`, and can be swapped for a larger one without
this repo changing. A number there would assert a measurement this harness
cannot take.

**The `cf-turnstile` dead-class allowance came back**, having been correctly
removed in entry 50 when the class stopped reaching any page. The entry is right
exactly while the class ships: an allowance for a class nothing emits describes a
site that does not exist, and a missing one fails a build for no reason.

**The CSP needed three directives, not one.** `script-src` for the loader,
`frame-src` because Turnstile renders its challenge in an iframe, `connect-src`
because the widget calls home for the token. Miss `frame-src` and the failure is
the nastiest of the three: the script loads, the widget mounts, no challenge
ever appears, and every submission is refused for a reason the page cannot
explain. The CSP check went 4 assertions to 6 and holds all of it.

### Measurements

| | before | after |
| --- | --- | --- |
| verify | 8 checks, 636 assertions | **8 checks, 641 assertions, 0 failures** |
| contact script | 519 B / 550 budget | **535 B / 550** |
| third-party scripts | 0 | **1, declared** |
| CSP origins | 1 | 2 |
| sweep failures introduced, then fixed | **3** | 0 |

### Open questions

Unchanged: 22–26, 28, 29, 31–34, 36, 37, 40, 41, 44, 48, 51–68. Two added:

69. **The widget renders in the browser's language, not the page's.** Turnstile
    defaults to `data-language="auto"`, so an English form can show a Russian
    challenge — seen while testing. Arguably right for the visitor and arguably
    jarring on an English-only site. `data-language={SITE.locale}` pins it.
70. **Nothing here proves a challenge is actually enforced.** The widget renders
    and the token posts; whether Formspark rejects a submission with a bad or
    absent token is a fact about a dashboard setting this repo cannot see —
    the same shape as open questions 64 and 65. A submission with the challenge
    deliberately failed is the only thing that would show it.

---

## 2026-09-28 — Entry 57. The widget Turnstile could not find

**A submission went through and arrived in Formspark.** Open question 62 closes:
the endpoint accepts, the challenge passes, the enquiry lands. Open question 70
narrows to "a deliberately failed challenge has still not been tried".

Three console messages came with it. **Two are not ours**, and saying which is
half the work — both are sourced to `flexible?lang=auto:1`, which is Turnstile's
own challenge document on `challenges.cloudflare.com`:

- `OTS parsing error: Size of decompressed WOFF 2.0 is less than compressed
  size` — a font inside Cloudflare's frame. Not this site's: ours is served
  from our own origin, and `font-src 'self'` would not let their document fetch
  it even if it wanted to.
- `No available adapters.` — WebGPU probing inside the challenge.

Neither is actionable from this repo, and chasing them would have been an hour
spent on somebody else's iframe.

### The third one was mine

> `[Cloudflare Turnstile] Cannot find Widget cf-chl-widget-y9k9m, consider using
> turnstile.remove() to clean up a widget.`

The success path replaces the form with the thank-you line — *"a sent enquiry is
not a form waiting to be filled in again"* — by removing every child except the
status element. **The widget is one of those children**, and Turnstile goes on
tracking a node that has left the document until its own housekeeping notices.

Harmless in effect, and still a defect: **a warning in the console of a page that
has just succeeded is how people learn to ignore the console.**

Fixed by telling Turnstile to release the widget before the DOM goes. Wrapped in
`try/catch` because it is third-party code **on the success path** — a throw
there would take out the thank-you message, which is a far worse outcome than
the warning it replaces.

### The budget refused it, and that is the entry

592 B against a 550 B budget. The census failed the build, correctly.

A shorter version — read the id off the container and pass it straight to
`remove()` — measures **560 B**, and was rejected. If Cloudflare puts the widget
id on a child element rather than the container it passes `undefined`, cleans
up nothing, and leaves exactly the warning it exists to remove. **32 B for a fix
that works rather than one that might.**

So the budget moved 550 → 620, deliberately and with the measurement written at
the entry. That is what a budget is for: not to prevent growth, but to make
growth a decision somebody made rather than one nobody noticed. The history is
now legible in one place — 500 → 750 when the intercept arrived, 750 → 550 when
the Pages Function's three jobs went, 550 → 620 for this.

### Measurements

| | before | after |
| --- | --- | --- |
| verify | 8 checks, 641 assertions | **8 checks, 641 assertions, 0 failures** |
| contact script | 535 B / 550 | **592 B / 620** |
| console warnings from this site on success | **1** | 0 |
| console warnings from Cloudflare's iframe | 2 | 2, not ours |

### Open questions

Unchanged: 22–26, 28, 29, 31–34, 36, 37, 40, 41, 44, 48, 51–69. 62 closes.

70, revised: **a failing challenge has not been tested.** A submission with a
valid token now provably works end to end. Whether Formspark *rejects* one with
a bad or absent token is still a dashboard fact this repo cannot see, and the
only way to know is to force it.

---

## 2026-09-28 — Entry 58. A card shot that fails contrast, pushed knowingly

Two images replaced in the tree: `category-cold-chain.avif` (4224 × 2376) and
`range-custom-boxes.avif` (4320 × 2100).

**The cold chain card's heading contrast fell from 3.17 to 1.62 against a 3.0
requirement.** Measured the way entry 53 set out — darkest decile of rendered
pixels behind each text box, against white:

| card | heading | needs | |
| --- | --- | --- | --- |
| Pharmacy Formats | 3.17 | 3.0 | pass |
| Custom Boxes | 3.25 | 3.0 | pass |
| **Cold Chain & Shipping** | **1.62** | 3.0 | **fail** |

`CategoryCard` sets `data-theme="dark"` whenever it has an image, so the heading
is white 32px type sitting directly on the photograph, and there is no scrim —
it came off in entry 40 "when the client's pre-darkened photographs landed".
**This shot is not pre-darkened, so that assumption has broken.**

This is open question 66 arriving: *"every future photograph swap on these cards
is one shade away from failing, with no check to catch it."* It took one swap.

### Pushed anyway, on instruction, and the record is the point

Ruled: push as-is, the image to be re-exported darker. **The target is ≥3.0 on
the heading; the two passing cards sit at 3.17 and 3.25**, so those are the
reference for how dark "dark enough" is.

Also ruled: do not wire the measurement into `verify` yet. Open question 66
stays open, now with a demonstrated failure attached to it rather than a
prediction.

**`npm run verify` passes — 8 checks, 641 assertions, 0 failures — and that is
the finding.** The contrast matrix reads token pairs out of the built CSS and
has no view of what a photograph does behind a paragraph. A green gate here
means the tokens are sound, not that the page is legible. Recorded so that the
next person reading a green run does not conclude more from it than it says.

### A near-miss in the measuring, worth more than the measurement

The first three attempts measured **nothing** and reported it as a pass: an
empty `{}` of geometry, and a contrast table with no rows and a cheerful
"tightest margin +99.00". The cause was a leftover `astro preview` daemon from
the reverted hero work still holding a port — Astro's preview refuses to start a
second instance and logs `SKIP`, so every new port I asked for silently served
nothing while `curl -sf -o /dev/null` still returned success.

**That is the port-4321 incident (§9) in miniature, in a throwaway script.** It
was caught only because the numbers were absurd and the next step was to assert
that the server was serving THIS build — 6 `category-card` occurrences served
against 6 in `dist` — before trusting a single pixel. `lib/preview.mjs` and
`lib/served.mjs` exist because of exactly this, and a script written outside
them does not inherit their protection.

### Open questions

Unchanged: 22–26, 28, 29, 31–34, 36, 37, 40, 41, 44, 48, 51–65, 67–70.

66, now with evidence: **the category card headings have no contrast floor and
nothing checks them.** One photograph swap took Cold Chain from 3.17 to 1.62.
The fix is either the scrim restored as an insurance band or the pixel sampling
wired into `verify`; both were offered and neither taken yet. A re-exported
image closes this instance, not the class.

71. **A verification script written outside `scripts/verify/lib` does not
    inherit the harness's protections.** The ad-hoc measurement above connected
    to a dead port and reported a pass over nothing. Anything that measures the
    site should go through `preview.mjs` and `served.mjs`, or assert the same
    things they do before it believes a number.

---

## 2026-09-28 — Entry 59. The re-export, measured: 1.62 → 2.15, still short

`category-cold-chain.avif` re-exported darker, and `range-cold-chain.avif`
replaced alongside it (a page hero, no type over it, nothing to measure).

| | heading contrast |
| --- | --- |
| before the first swap | 3.17 |
| after the first swap (entry 58) | **1.62** |
| after this re-export | **2.15** |
| required | **3.0** |

Moving in the right direction and not there. Pushed on the same standing
instruction as entry 58.

### The number that makes the next export one-shot

Measuring "it failed again" is worth less than measuring what would pass, so:

- the area behind the heading currently reads **RGB(183, 175, 173)**, relative
  luminance **0.437**;
- 3.0:1 against white needs luminance **≤ 0.300**, about **RGB(148,148,148)**;
- 3.3:1 — a margin rather than a pass by rounding — needs **≤ 0.268**, about
  **RGB(141,141,141)**.

That is the top-left region only, where the white 32px heading lands. The rest
of the photograph is unconstrained, and the body copy at the bottom has never
been in question: it reads 16.93 against a 4.5 requirement, because the card's
lower half is already dark.

**The two passing cards sit at 3.17 and 3.25**, which is the practical
definition of how dark this photography needs to be.

### Standing note

`npm run verify` passes — 8 checks, 641 assertions, 0 failures. As entry 58
recorded, that is not evidence about this: the contrast matrix reads token pairs
out of the built CSS and cannot see a photograph. Open question 66 remains the
place where this is either fixed by a scrim or caught by a check; a third
re-export closes this instance and not the class.

### Open questions

Unchanged: 22–26, 28, 29, 31–34, 36, 37, 40, 41, 44, 48, 51–65, 66, 67–71.

---

## 2026-09-28 — Entry 60. One image width for every card, and the srcset that replaced it

Reported as blurry product cards. Measured rather than adjusted: every product
card on the site was served **one fixed 880px file**, whatever it was drawn at,
at whatever pixel density.

`toPicture()` called `getImage({ width: 880 })` once and `Media` emitted a plain
`<img src>`. No `srcset` existed anywhere in the system.

| context | card CSS | device px needed | shipped | |
| --- | --- | --- | --- | --- |
| index @1x | 259 | 259 | 880 | **3.4× oversized** |
| index @2x | 259 | 518 | 880 | fine |
| phone 430 @3x | 269 | 808 | 880 | marginal |
| category @2x | 440 | 880 | 880 | **exactly 1:1, no headroom** |
| category @3x | 440 | 1320 | 880 | **440 short** |

**One number cannot serve a 259px card and a 440px card.** It was simultaneously
wasteful at the small end and soft at the large one, which is why the complaint
and the page-weight problem have the same cause.

### `sizes` is the half that is easy to forget

A `srcset` of width descriptors does nothing without it: a browser picks a
candidate BEFORE layout exists, and with no `sizes` it assumes the image fills
the viewport — taking the *largest* file for a 259px card, the exact opposite of
the fix. `Media` cannot know the answer either, because the same card is 259px
on the index and 440px on a category page.

So `ProductRail` owns it, since the rail is what sets the column count, and the
strings are **measured at the seven sweep widths** rather than estimated:

```
          320    360    390    430    768    1024   1440
5-col     61vw   62vw   62vw   63vw   24vw   18vw   259px
3-col     61vw   62vw   62vw   63vw   35vw   30vw   440px
```

Rounded up throughout: understating the drawn width makes the browser pick too
small and renders the card soft, which is the failure being fixed; overstating
it costs only bytes.

### A descriptor that lied, caught by reading the files rather than the HTML

The first build emitted `… 1037px-file 1320w`. `getImage` correctly refuses to
upscale — a 1320 request against a 1037px source returns 1037 — but
**`attributes.width` reports the width that was REQUESTED, not the one
produced**, and the dedup keyed on it.

That is worse than shipping no srcset at all: a browser picking by descriptor
takes the candidate believing it is 1320 wide and renders it *softer* than the
880 it would otherwise have chosen. The emitted HTML looked perfect. Only
`sips` on the emitted files showed 1037.

Now clamped to `picture.src.width`, the source's real intrinsic width, and every
descriptor was re-checked against its file: 260/440/520/880/1037, all honest.

### And a measurement that lied, for a different reason

The first "after" reading said the browser was picking the *smallest* candidate
everywhere — ratio 0.50 at 2x. It was not. Under `Emulation.setDeviceMetrics`
Chrome reports `naturalWidth` divided by the emulated density, so an 880px file
at 2x reads as 440. **The property was wrong, not the code.** `currentSrc`
mapped back through the srcset is unambiguous and is what the table below uses.

Two false readings in one entry, in opposite directions — one made a broken
build look correct, one made a correct build look broken. Both were caught by
going to the artifact: the files on disk, and the URL the browser actually
fetched.

### After

| context | card | needs | served | |
| --- | --- | --- | --- | --- |
| index @1x | 259px | 259 | **260w** | sharp |
| index @2x | 259px | 518 | **520w** | sharp |
| index @3x | 259px | 778 | **880w** | sharp |
| phone 430 @3x | 269px | 808 | **880w** | sharp |
| tablet 768 @2x | 185px | 371 | **440w** | sharp |
| category @1x | 440px | 440 | **440w** | sharp |
| category @2x | 440px | 880 | **880w** | sharp |
| category @3x | 440px | 1320 | **1037w** | source-capped |

**A 1x visitor to the products index downloads 59 KB of card images instead of
563 KB — 89% less**, because thirteen 880px files were being sent for thirteen
259px slots.

### The one case still short, and it is not a code problem

`category @3x` wants 1320px and the product photographs in this repo are
**1037px wide**. `getImage` will not upscale, so 1037 is the ceiling —
better than the 880 it had, still short. `CARD_WIDTHS` already lists 1320 and
will start producing it the moment larger sources land; nothing needs to change
here when they do.

### Measurements

| | before | after |
| --- | --- | --- |
| verify | 8 checks, 641 assertions | **8 checks, 641 assertions, 0 failures** |
| candidates per card image | **1** | 5 (capped at the source width) |
| index @1x card bytes | 562,978 B | **59,056 B** |
| contexts served a file that is too small | 2 of 8 | **1 of 8**, source-capped |

### Open questions

Unchanged: 22–26, 28, 29, 31–34, 36, 37, 40, 41, 44, 48, 51–71. One added:

72. **Only product card images have a srcset.** Category card images, the page
    heroes and the home collage all still ship one fixed width — `toPicture` now
    takes a `widths` argument and they simply do not pass one. The heroes are the
    next most valuable: `WIDE_WIDTH` is 2400, sent whole to a 390px phone.

---

## 2026-09-61 — Entry 61. The card that was actually blurry

Reported, with justified irritation: *"category card is 656px wide, i exported
from figma 440px wide image as 5x, it's ridiculous."*

**Both numbers were right and entry 60 had fixed the wrong component.** When the
first report said "product card" I measured `ProductCard`, which is 440px on a
category page. `CategoryCard` is a different object and is drawn **656px** in
the two-up cross-link pair at the foot of a category page. It was still being
served the single 880px file, from a 2200px source.

| | drawn at | was served | source |
| --- | --- | --- | --- |
| product card | 259–440px | srcset (entry 60) | 1037px |
| **category card** | 288–**656px** | **one 880px file** | **2200px** |
| **range / page hero** | 390–1440px | **one 2400px file** | **4096px** |

656px at 2x wants 1312 and at 3x wants 1968. The resolution was supplied and the
pipeline was discarding it — a 5x export downsampled to 880 and then stretched
back over a 656px card.

### Three ladders, because they are three different objects

`CARD_WIDTHS` (product), `CATEGORY_CARD_WIDTHS` and `WIDE_WIDTHS` — each built
from measured drawn widths rather than a generic ladder:

```
              320    360    390    430    768    1024   1440
home 3-up      288    328    358    396    230    310    440px
cross 2-up     288    328    358    396    341    461    656px
```

The same component at 440 and at 656 depending on the page, which is exactly why
`sizes` cannot live in the component. Home passes `CARD_SIZES_3UP`, the category
page passes `CARD_SIZES_2UP`, and the full-bleed pictures pass `100vw`.

### Result

| context | card | needs | served | |
| --- | --- | --- | --- | --- |
| cross 2-up @1440 2x | 656px | 1312 | **1320w** | sharp |
| cross 2-up @1440 3x | 656px | 1968 | **1970w** | sharp |
| cross 2-up @1024 2x | 461px | 922 | 1320w | sharp |
| home 3-up @1440 2x | 440px | 880 | 880w | sharp |
| range hero @1440 2x | 1440px | 2880 | **3840w** | sharp |
| range hero @390 2x | 390px | 780 | **960w** | sharp |

**The hero was the worst offender in the other direction**: one 2400px file sent
to every visitor, so a 390px phone downloaded 73 KB where it now takes 10 KB —
and a retina desktop was served 2400 where it wanted 2880 and now gets 3840. Too
much and not enough, simultaneously, from the same file.

### A measurement that read zero, and was not

The first pass reported `0w` for every cross card. They are below the fold and
`loading="lazy"`, so nothing had been fetched and `currentSrc` was an empty
string — the srcset was correct all along. Scrolling them into view first is
what makes the reading real.

Third measurement artifact in two entries, all three the same shape: **the tool
reported confidently about something it had not actually observed.** Cached
candidate, DPR-scaled `naturalWidth`, unloaded lazy image. None was a bug in the
site.

### Measurements

| | before | after |
| --- | --- | --- |
| verify | 8 checks, 641 assertions | **8 checks, 641 assertions, 0 failures** |
| category card candidates | 1 | **6** (360–1970) |
| hero candidates | 1 | **6** (640–3840) |
| hero bytes to a 390px phone | 73,136 B | **10,282 B** |
| contexts served too small | 3 | **0** |

### Open questions

Unchanged: 22–26, 28, 29, 31–34, 36, 37, 40, 41, 44, 48, 51–71.

72 closes: category cards, range shots and page heroes all carry a srcset now.
The home collage still ships fixed widths, and is the one remaining case —
small, decorative, five images, and deliberately left.

---

## 2026-09-28 — Entry 62. The mobile Products menu had no links at all

Asked why the mobile dropdown hides the category links. Read out of `dist`, and
the answer was worse than the question assumed:

> **links in the mobile Products fold: 0**
> 13 product names as `<span>`, 3 column titles as `<p>`, and nothing else.

**The Products menu on a phone was entirely non-navigable.** Open it and there
is no way out of it — not to a category page, not to anything.

### Two causes, and the second is mine

1. **The fold never had the category link.** The desktop panel has carried a
   "Browse cold chain →" button per column since it was built; the mobile fold
   rendered `column.title` as a plain `<p>` and listed the products beneath it.
   So the category pages were reachable on a laptop and not on a phone, and had
   been from the start.

2. **Entry 47 turned that gap into a dead end.** Gating product detail pages made
   every name in that list a `<span>` — correctly; they have no page. But those
   spans were the only links the fold had. A change that was right on its own
   terms removed the last exit from a menu that was already one link short, and
   nothing caught it: the links that disappeared were *supposed* to disappear.

### The title is the link, rather than a button under it

Desktop keeps its shape — an eyebrow heading with a browse button at the foot of
the column. The mobile fold takes the link on the title instead, because this
fold is a stack of rows on a small screen and a non-link heading sitting above a
button to the same place gives one destination two rows.

Same `column.href` either way, so the two surfaces cannot drift.

### 11px, which is not a tap target

Measured after wiring it up: the links worked and were **11px tall**, because
`text-eyebrow` is small caps. WCAG 2.5.8 asks 24. `py-xs -my-xs` takes the hit
area to **27px** while cancelling itself in layout, so the visual spacing is
exactly what it was.

Worth saying plainly: the link being present and the link being usable are two
different assertions, and only the first one was visible in the markup.

### Measurements

| | before | after |
| --- | --- | --- |
| verify | 8 checks, 641 assertions | **8 checks, 663 assertions, 0 failures** |
| links in the mobile Products fold | **0** | **3** |
| category pages reachable on a phone | **0 of 3** | **3 of 3** |
| tap target height | 11px | **27px** |
| internal link assertions | 141 | **162** |

The link check gained 21 assertions on its own — three new hrefs across seven
pages — so these are now covered by the same contract as everything else.

### Open questions

Unchanged: 22–26, 28, 29, 31–34, 36, 37, 40, 41, 44, 48, 51–71. One added:

73. **Nothing asserts that a navigation surface contains a link.** The fold was
    valid HTML, passed the sweep, passed axe, passed the link check — every
    assertion was about links that existed, and none about a menu having any. A
    check that every disclosure panel offers at least one destination would have
    caught this the moment entry 47 shipped.

---

## 2026-09-29 — Entry 63. Art-directed category heroes, and the srcset the picture branch was dropping

Three mobile photographs supplied for the category page hero — ~1175 × 1400, a
ratio of 0.84, which is the 1:1.2 asked for. Wired as `rangeImage.mobile` in the
three category files.

**The mechanism already existed and had never been used.** `Media` has rendered
`<picture>` since it was written — desktop behind a `min-width` query, the
mobile file on the `<img>` — and the content schema has carried `mobile` on
every image record. These are the first files to take it.

`.page-hero-media` goes from `1 / 1.2 5` to **`1 / 1.2`**, and the number changed
meaning: 1.25 was a judgement about how much of a landscape photograph to throw
away, and 1.2 is the proportion of a real file. `object-fit: cover` now has
almost nothing to trim.

### The picture branch was silently dropping every responsive candidate

Found while wiring it, not after: the `<source>` took `srcset={image.src}` — a
single URL — and the `<img>` fallback had no `srcset` at all. So **turning on art
direction would have thrown away the entire srcset added in entries 60 and 61**,
and the regression would have been invisible: the markup is valid, the picture
is right, and it only fails as a heavier or softer download.

Both branches now carry their own ladder, because the two files are different
photographs at different sizes and cannot share one.

The mobile file also gained its own ladder. `MOBILE_WIDTH` was a single 900,
and a full-bleed hero on a 390px phone at 3x needs 1170 — **the one image that
fills a phone screen was already the one most under-served.**

### Result

| viewport | file | ratio | needs | served |
| --- | --- | --- | --- | --- |
| 390 @2x | mobile | 0.83 | 780 | **780w** |
| 390 @3x | mobile | 0.83 | 1170 | **1175w** |
| 430 @3x | mobile | 0.83 | 1290 | 1175w (source cap) |
| 768 @2x | desktop | 2.06 | 1536 | **1920w** |
| 1440 @2x | desktop | 2.06 | 2880 | **3840w** |

The breakpoint swap is doing exactly what art direction is for: a portrait
photograph on a phone and a landscape one above it, not one crop of one file.

### `astro check` caught what my own tail hid

The build passed and the page rendered, and `verify` failed on a type error:
`MOBILE_WIDTHS` is `as const`, so `.filter()` returns an array of its literal
union and refuses the intrinsic width pushed onto it. The desktop path does not
hit it because its `widths` arrives as a `readonly number[]` parameter.

**I had run `npx astro check | tail -3` and read "0 warnings, 0 hints" as
clean** — the error line was the fourth from the end. The gate read the whole
output and failed. A reminder that reading the tail of a report is not reading
the report, and the reason `astro check` runs first in the harness.

### Measurements

| | before | after |
| --- | --- | --- |
| verify | 8 checks, 663 assertions | **8 checks, 664 assertions, 0 failures** |
| category heroes using `<picture>` | 0 | **3** |
| candidates on the desktop source | 1 (`image.src`) | **6** |
| candidates on the mobile `<img>` | 0 | **4** |
| mobile hero at 390 @3x | 900w | **1175w** |

### Open questions

Unchanged: 22–26, 28, 29, 31–34, 36, 37, 40, 41, 44, 48, 51–71, 73. One added:

74. **The mobile hero sources are 1175px and a 430px phone at 3x wants 1290.**
    Close, and capped. Also: the product page hero and the home hero still have
    no art-directed mobile file — both crop a landscape photograph to 1:1.2 on a
    phone, which is what these three just stopped doing.

## 2026-10-16 — Entry 64. Five product pages, and the page list that had to grow with them

The v1 round so far — palette (`deabf2d`), nav and button (`331291b`), logo
(`69df77c`), closing plate (`999c664`), photography, category-card scrims and
footer links (`2e4dfe2`) — is recorded in those commit messages. This entry is
the product pages, which are the first thing this round that is structural
rather than a substitution.

### The page is its sections, and the sections are data

Five products were designed as pages and they do not share a skeleton:

| | PuncturePack | mailers | EPS | liners | gel packs |
| --- | --- | --- | --- | --- | --- |
| how it works | ● | ● | | ● | |
| which liner | | | | ● | |
| why choose / construction | ● | ● | ● | ● | ● |
| sizes and specifications | ● | ● | ● | | |
| tailored pack-outs | ● | ● | ● | ● | |
| brand your box | ● | ● | ● | ● | |
| applications | ● | ● | ● | ● | |
| network / custom options | | | | | ●● |
| formats and sizes | | | | | ● |
| FAQ | ● | ● | ● | ● | |

Eight section types, five orders, two of them used once each. A template with
eight optional fields and a fixed sequence gets four of these right and then
needs a `sectionOrder` array for the fifth — at which point the order is data
anyway, expressed twice. So `sections` is an ordered discriminated union in the
content schema and the template is a switch over it.

**That union is also the launch gate.** `LAUNCH.productPages` was one boolean
over thirteen products and both its settings were now wrong: `false` buries five
finished pages, `true` ships eight built from a template with nothing in them.
`productPagesShip(sectionCount)` replaces it — a product with sections has a
page, one without them does not. That is not a convention anyone has to
remember; it is the only sentence that can be true, because a page IS its
sections. The machinery underneath is unchanged and still does the work: no
`href` from the adapter, `href` optional on `ProductView`, and every consumer a
compile error until it handles the absence.

### The check that caught what `astro check` cannot

The fifteen lucide marks are two lists in two files: path data in
`src/components/atoms/icons.ts`, and a `z.enum` in `content.config.ts` that a
product's `features` validate against. Neither can be derived from the other
without importing a component into a content config.

The two drift modes are not symmetrical:

- **in the enum, not in the map** — the product validates, the page builds, axe
  is happy, and the feature cell renders an **empty 48px circle**. Silent.
- in the map, not in the enum — dead path data nobody can reference.

`iconNamesMatchSchema()` asserts both directions, 15 assertions. Its red path
was run three ways before it counted (§9):

| injection | result |
| --- | --- |
| `truck` removed from the map, left in the enum | FAIL, names the icon and the consequence, exit 1 |
| `thermometer-snowflake` removed from the enum | FAIL, names the icon, exit 1 |
| `ICONS` renamed so the parse finds nothing | FAIL, "ICON LISTS NOT FOUND — parsed 0 … Fix the check, not the count", exit 1 |

**The first injection passes `astro check` with 0 errors.** The union and the
map still agree with each other; it is only the enum that disagrees, and nothing
in the type system spans that gap. That is the whole case for the check.

### Two bugs, both invisible in source

**`export` in Astro frontmatter is hoisted.** `export const ICON_NAMES =
Object.keys(ICONS)` written *below* `const ICONS = {...}` evaluated *first*, and
the build died with "ICONS is not defined" while `astro check` reported zero
errors — the error is an ordering fact about the emitted module, not a type.
Frontmatter is not a module scope. The data moved to `icons.ts`, which is where
it wanted to be anyway: the contract above imports it without loading a
component.

**`sm:w-10` styles nothing.** This repo resets Tailwind's numeric spacing scale
(`--spacing-*: initial`), so a `w-10` on the numbered list's marker column
reached five built pages with no rule behind it. Caught by the dead-class check,
which is the generalisation of the `duration-base` bug and has now paid for
itself twice. Replaced with `sm:w-[2.5rem]`; arbitrary values always generate.

### The page list had to grow, and it immediately found something

`PAGES` in `scripts/verify/lib/cdp.mjs` carried a note saying the two product
pages came off the list because no build emitted them, and that **"both paths go
back on this list"** when the gate opened. The gate is open, so three went back:
PuncturePack, gel packs and thermal liners — the smallest set that instantiates
all eight section types, since `formats` exists only on gel packs and `cards`
only on liners. Gel packs is also the only page drawn without a descriptor and
with its contact link hidden, so it is the only place those two self-skips are
exercised.

The sweep went 6 pages → 9 and **failed immediately**, twice:

```
/products/cold-chain-shipping/puncture-pack @768px — overflows (837 > 768)
  li.border-line … +96px "Pharmacy fulfillmentInsulated ma"
```

The numbered list's title column was `w-[18.75rem] flex-none`, which is what the
design measures — 300px against 370px of body. At 768 the container is 720: 40
of marker plus two 32px gaps plus a fixed 300 leaves 616 for a paragraph that
wants 370. A flex item's `min-width` is `auto`, so neither column would shrink.
Both are now `basis` + `flex-1` + `min-w-[0px]`, which gives the drawn 300:370
split at 1344 and shrinks in proportion below it — right at every width rather
than at one.

**Three new pages, two real failures.** That is the argument for the page list
following what the build emits, stated in measurements rather than in principle.

### Copy that is not there

Two gaps, neither invented around:

**The FAQ answers.** Figma draws seven to ten questions per page and writes the
answer to exactly **one** — the first item is expanded with its copy and every
other row is collapsed with no answer text in the file at all. Measured on all
four FAQ instances; it is the pattern, not an oversight in one. The questions
are the client's, so they are recorded in the content files with an empty
`answer`, and the adapter drops any item that has one. Each page currently shows
a single FAQ item. Writing the rest would mean inventing claims about thermal
performance, materials and disposal.

**The photography.** Nineteen image slots across the five pages, none shot.
`Media` renders its pending box, which is the design's own convention — but the
label Figma puts in each slot is the brief for the photographer ("confirm
sequence against the actual product before filming"), and `Media` prints that
label on the live page. Those stay as YAML comments beside the slot; the label
is a plain description of the missing picture.

### Measurements

| | before | after |
| --- | --- | --- |
| verify | 8 checks, 676 assertions | **8 checks, 1085 assertions, 0 failures** |
| pages built | 7 | **12** |
| pages swept (× 7 widths) | 6 | **9** |
| axe page/width runs | 12 | **18** |
| internal links asserted | 162 | **479** |
| build contracts | 227 | **580** |
| product pages with a route | 0 | **5 of 13** |
| PuncturePack page height at 1440 | — | 7314px (Figma draws 7100) |

New: `icons.ts`, `Icon.astro`, `FeatureGrid`, `StepList`, `SplitFeature`,
`NumberedList`, `MediaCards`, `FormatCards`, `SpecSheet`. No dependency added —
the fifteen lucide paths are copied in under ISC rather than installing 1,600
files for fifteen strings (§6).

### Open questions

Unchanged: 22–26, 28, 29, 31–34, 36, 37, 40, 41, 44, 48, 51–71, 73, 74. Eight
added:

75. **Six to nine FAQ answers per page are unwritten**, as above. The questions
    are in the content files; the pages show one item each.
76. **`facts` and `specTable` are no longer rendered.** Neither is drawn on any
    v1 product page. `facts` is kept on the mailers because three of its cells
    (testing standard, production, disposal) say things the v1 copy says
    nowhere. `SpecTable.astro` is now referenced by nothing. Keep or cut.
77. **The design draws the product H1 at two sizes** — 64px on PuncturePack,
    48px on the other four. Shipped at `--text-h1` for all five, matching the
    category pages. Deliberate subordination, or drift between batches?
78. **No wide hero photograph exists for any product.** The hero falls back to
    the portrait card shot letterboxed to 1344 × 541. `images.hero` is in the
    schema and picks one up the moment it lands.
79. **Breadcrumb roots disagree in the design**: product trails start at
    "Products", category trails at "Home". Shipped starting at Home, so one
    branch has one root in the structured-data graph.
80. **Three custom-boxes slugs still name the old products**
    (`vial-presentation-boxes` for "Individual product boxes", and so on). No
    page ships behind them so no URL is wrong yet; renaming churns four asset
    filenames and should happen when those pages are designed.
81. **FOOTER v2 draws Terms of Service, Privacy & cookies and three social
    marks.** None of the pages exist and none of the accounts are known. Adding
    the links would fail `internalLinksResolve()`, correctly. Owed.
82. **The phone number is back**, reversing redline v7 §9 on the authority of
    the v1 footer. If it should not be called it should not be drawn — the
    client's call against their own design.

## 2026-10-16 — Entry 65. The FAQ answers arrived; open question 75 closes

Supersedes entry 64's open question 75. Re-read the four FAQ instances on
instruction and the copy is there — every row now carries a `content` child
where last time only the first did. The accordions grew with it:

| page | questions | accordion, before | after |
| --- | --- | --- | --- |
| PuncturePack | 7 | 734px | **1223px** |
| insulated metallic mailers | 8 | 795px | **1446px** |
| EPS foam coolers | 10 | 896px | — |
| thermal liners | 9 | 835px | — |

**34 answers, transcribed verbatim.** Built HTML confirms 7 / 8 / 10 / 9 items
across the four pages, and 0 on gel packs, whose design has no FAQ at all.

### The filter stays, and the reason changed

`toSection()` drops any FAQ item with an empty `answer`, and the schema defaults
`answer` to `[]`. Nothing is filtered now. Both are kept, and the note in each
file is rewritten to say why: the default is what let these pages ship honestly
while the copy was outstanding, it cost nothing, and the next product's FAQ will
arrive the same way — questions first, answers after. Requiring an answer would
have meant holding five finished pages back or inventing claims about thermal
performance and disposal.

This is worth stating because it looks like dead defence now and is not. The
mechanism was exercised for exactly as long as it was needed.

### Two answers describe a page that does not exist

Transcribed as written rather than quietly reworded, because one of each pair is
wrong and which one is the client's call:

- **Insulated metallic mailers** closes with *"Click Get Samples & Pricing"*.
  The hero's link on that page is labelled **"Request samples & pricing"** —
  Figma's own string for the same page.
- **Thermal liners** closes with *"Click Request Samples & Pricing and choose
  Paper, PET, Foam, or Help Me Choose."* The contact form has no such field.

Both are recorded as comments beside the copy they describe.

### Measurements

| | before | after |
| --- | --- | --- |
| verify | 8 checks, 1085 assertions | **8 checks, 1085 assertions, 0 failures** |
| FAQ items in built HTML | 4 | **34** |

### Open questions

75 **closes**. Two added, both narrow:

83. **"Get Samples & Pricing" vs "Request samples & pricing"** on the mailers
    page — the FAQ names a button the page does not have.
84. **The liners FAQ promises a material chooser on the contact form.** Either
    the form grows the field or the sentence loses it.

Unchanged: 22–26, 28, 29, 31–34, 36, 37, 40, 41, 44, 48, 51–71, 73, 74, 76–82.

## 2026-10-16 — Entry 66. Home to v1, and the cross-link pair that was a different object

Three instructions: put the shared CTA banner on the home page, remove the hero
stats, and re-check every page against Figma. The first two are done and the
third is partly done — what is left is listed at the end rather than implied.

### The home page got better by losing things

All three of this round's home changes are subtractions.

**The stat band is gone.** Four claims sat on a glass plate over the hero
photograph. The design does not draw them, and never did: open question 32
recorded that both Figma frames carrying those labels were `hidden` in the file
and that the band existed because review asked for it. v1 settles it. The band,
`.hero-stats`, `.hero-stat` and the `--blur-overlay` token are all gone — the
token had exactly two consumers and both were the band.

**The collage is gone.** This page ended on a bespoke block: five product shots
scattered at Figma offsets around their own heading, copy and button, plus about
100 lines of positioning CSS. v1 ends it on the same `cta desktop` every other
page ends on. The closing band is now one component reading one string across
six page types instead of five plus a bespoke sixth.

**The hero has one button**, a secondary, where it had two.

The hero picture is also no longer full-bleed: v1 draws it contained at
1344 × 560 with the card radius, and with no type on it there is no scrim.

Copy, all from Figma 1005:13599: the hero paragraph (now at `--text-large`, 18px,
which is what the design sets and what that step exists for), the section
heading, its standfirst, "Browse all products" for "Browse all formats", and the
testimonial's attribution — "Compounding pharmacy client", down from "Director
of Operations, high-volume compounding pharmacy".

The three cards also stop being reversed. They were in nested order, inward-out,
to match a lede that named them that way; that lede is gone and v1 draws them in
catalogue order.

### CategoryCard was carrying a second component

`title` read `cross ? pageTitle : title`, which put "Cold Chain & Shipping" — a
menu label — on the home page's cards while the cross-link beside it said "Cold
chain packaging". v1 draws `pageTitle` in both places. One category, one display
name.

Then the cross-link pair stopped being a CategoryCard at all. v1 draws something
structurally different at the foot of a category page: a 128px square thumb, a
text column beside it in BLACK, and a round arrow button pinned bottom-right,
all 154px tall — where that was two 656px tiles with white type over a
photograph. Reaching one from the other would have meant a prop that moved the
text out of the picture, dropped both scrims, dropped the dark theme and changed
the aspect ratio, which is not a variant (§4.2). `CrossLinks.astro` is the new
block; CategoryCard lost `cross`, `ratio` and `body`, which only that use needed.

`crossBodyOverrides` went with it. It existed because the v8 deck wrote the
pharmacy card shorter on the cold chain page than on the custom boxes page; v1
writes one line per category and uses it on both pages that link to it, verified
across all six cards. One string, no host-keyed map.

Categories also gained `pageHeading`, a THIRD name, because one of them needs
it: the nav says "Custom Boxes", a card says "Custom boxes", and the page is
headed "Custom interior and exterior boxes". The other two fall back to
`pageTitle`.

### Two measurement bugs, both found by the sweep

**`w-full` beats a `class` prop.** `CrossLinks` passed `w-[8rem]` to `Media` for
its 128px thumb. Media puts `w-full` on its own `<img>` and the prop lands
beside it — two width utilities in one layer, decided by source order, and
`w-full` won. Measured on the built page rather than inferred: the thumb came
out **432px**, the text column **0px**, and the arrow 48px outside the card.
A caller cannot size that element from outside; it can only size the box around
it, so the width moved to a wrapper.

**`min-width: auto` again**, the same trap entry 64 hit in NumberedList. Flex
and grid items both refuse to shrink below their content, and the row ran up to
183px past its box at all seven widths. `min-w-[0px]` on the row and the text
column — not `min-w-0`, which generates no rule in this repo.

The pair is also two-up only from `xl`, and that is arithmetic rather than
taste: a card spends 212px on furniture before any text, so two of them need
424px of chrome plus two readable columns. At 1024 that leaves 96px per
paragraph.

### Measurements

| | before | after |
| --- | --- | --- |
| verify | 8 checks, 1085 assertions | **8 checks, 1082 assertions, 0 failures** |
| home page height at 1440 | 5,600px (with collage) | **4,604px** |
| CSS removed | — | ~160 lines (stats, collage, blur token) |

### Open questions

76 **narrows**: Figma 1005:14205 "Product family (CMS)" is the OLD product page
template and it DOES draw the six-cell fact grid. The five v1 product pages
(1179, 1204–1207) do not. Taking the newer batch as canonical is what dropped
the facts; recorded here because the client's own link list includes both.

Unchanged: 22–26, 28, 29, 31, 33, 34, 36, 37, 40, 41, 44, 48, 51–71, 73, 74,
77–84. Open question 32 **closes** — the stat band is gone, so which labels were
canonical no longer matters. Three added:

85. **The custom boxes category page is structurally different in v1** and is
    NOT yet built. It replaces the five-up product grid with three full-width
    rows — individual product boxes, complete protocol kits, exterior shipping
    boxes, each a heading, standfirst, paragraph and picture — and adds an
    eight-slide "Everything you can customize" carousel with prev/next and an
    "01 / 08" counter. The rows are the `split` section type that already
    exists; the carousel is new JavaScript and needs a census entry and a
    budget.
86. **The products index (Figma 1007:12982) has not been re-checked** against
    the built page this round.
87. **"Jars" is capitalised mid-sentence** in the pharmacy formats card body,
    as drawn. Transcribed rather than corrected, per the rule this round.

## 2026-10-16 — Entry 67. Full-bleed heroes, and three photographs that broke the scrim twice

Two instructions and two image drops, in one pass.

### Hero photographs go back to full-bleed

On instruction. v1 draws the home and product heroes as plates inside the page
gutter — 1344 × 560 and 1344 × 541 — and the ruling is that hero photography
runs the full viewport width, as it did before v1 and as the category pages do
in v1 regardless. The home hero had shipped as the drawn plate for exactly one
round.

Recorded as **AUDIT D8** rather than absorbed: it is a real difference from the
source of truth this round is measured against, and the kind that reads as an
oversight later. Costs nothing measurable — `sizes="100vw"` picks a wider
candidate than `1344px` did, which is correct for a wider box, and there is no
type on any of the three.

The product page hero moved out of the contained Section into its own
`width="full"` one, which is the structure the category pages already had.

### The scrim failed twice, against two different photographs

All three category card shots were replaced. Every one is a bright studio frame
on a cream backdrop, and two have a white corrugated box low in the frame. The
scrim that v1 draws — two bands at `rgb(0 0 0 / 0.5)` over 34.8% — does not
carry white type on any of them.

**First failure, cold chain.** Body text at **2.96** against a 4.5 requirement.
Fixed by taking the top band to 0.65 and the bottom to 0.8.

**Second failure, custom boxes**, which arrived after that fix was applied and
measured: body at **3.88**, still short.

| bottom band | cold chain | custom boxes | pharmacy |
| --- | --- | --- | --- |
| 0.5 over 34.8% *(as drawn)* | **2.96** | — | — |
| 0.8 over 34.8% | 4.73 | **3.88** | 9.31 |
| 0.9 over 34.8% | 5.58 | 4.53 | 10.32 |
| **0.8 over 50%** | **6.65** | **5.65** | **11.63** |

**Height, not more alpha.** Raising the bottom alpha alone reached 4.53 at 0.9 —
a 0.7% margin over the requirement — and needed 0.95 before there was real
headroom, at which point the foot of the photograph is nearly black and there is
no point having a photograph. The same 0.8 spread over 50% of the card instead
of 34.8% triples the margin and leaves the bottom edge uncrushed. The two bands
are now asymmetric, which is also honest about what they carry: one short
heading at the top, a paragraph and a link at the bottom.

Recorded as **AUDIT D9**.

### The method is the finding

Neither failure is visible to `npm run verify`. The contrast matrix reads token
pairs out of the built CSS and a photograph is not a token, so both of these
shipped green through the gate and were caught by a separate measurement script
run against the built page — screenshot with the glyphs hidden, sample the
90th-percentile luminance under each text box.

**Running that script is not optional when a photograph is swapped.** Four
images landed today and two of them broke a contrast requirement; neither was
obvious by eye. The sweep that found the fix overrides the alpha in the page
rather than rebuilding, so testing four values costs seconds rather than four
builds — `scrim-sweep.mjs`, in the session scratchpad.

### Measurements

| | before | after |
| --- | --- | --- |
| verify | 8 checks, 1082 assertions | **8 checks, 1082 assertions, 0 failures** |
| card contrast, worst body | **2.96 (fail)** | **5.65** |
| card contrast, worst heading | 3.08 | **3.69** |
| category card sources | 2200 × 2660 | 1760 × 2128 and 1320 × 1596 |

The new sources are smaller than the ones they replace. That is fine and worth
stating: the largest a category card is drawn is 440px on the home page, so 3x
wants 1320 and every new file meets it exactly. The 656px two-up case that
drove the old ladder is gone — cross-links are 128px thumbs now (entry 66).

### Open questions

Unchanged: 22–26, 28, 29, 31, 33, 34, 36, 37, 40, 41, 44, 48, 51–71, 73, 74,
76–87. One added:

88. **All four new photographs are bright studio frames on cream**, and two of
    them needed a scrim well past what the design draws to carry white type.
    If more card or plate photography arrives in this style, expect the same —
    and the answer may be a darker shot rather than a darker scrim. See AUDIT D9
    for what that would take.

## 2026-10-17 — Entry 68. A second button in the home hero

On instruction. v1 draws one button there — a 152px secondary, "Explore
products" — with the quote request living in the nav and in the closing band.
"Get a quote" now sits beside it as the primary. Recorded as **AUDIT D10**.

**The fill is the decision worth writing down.** The nav's "Get a quote" is the
tan `action` fill, so matching it here is the obvious move, and it is
deliberately not taken. AUDIT F8 records that the tan measures **1.94:1** against
the page ground where WCAG 1.4.11 asks 3.0 — the button's edge is not
perceivable, only its label — and that is accepted for the nav's single
instance. A second and larger instance at the top of the home page spreads an
accepted defect rather than containing it. The ink `primary` passes, it is the
site's primary action, and ink-beside-outline is the pairing this hero carried
before v1.

One word reverses it if the tan is wanted anyway, and F8 then describes two
instances rather than one.

"Get a quote" now appears three times on the home page — nav, hero, closing
band — which is the same label pointing at the same place from the top, the
middle and the foot of the page. Worth a look in review; it reads as
insistent rather than helpful if the page is short.

verify: 8 checks, 1083 assertions, 0 failures.

### Open questions

Unchanged, plus one added:

89. **Three "Get a quote" buttons on one page.** Deliberate after this entry,
    but not obviously right. The hero's could be "Talk to a specialist" or the
    nav's could stand alone.

## 2026-10-17 — Entry 69. Section grounds, and the canvas that nearly faked them

The design moved: the home hero is a contained plate again, and the pages band
themselves in three grounds rather than two. Both read off Figma, both now
shipping.

### The measurement nearly went wrong, and the trap is worth recording

Sampling the home frame's left gutter gave `#f2eee8` for every section — a
warm cream nothing in the file uses as a token. It looked like a page-wide
ground change.

**It was Figma's canvas showing through.** `get_screenshot` defaults to
`contentsOnly: false`, which composites overlapping canvas content so the render
"matches what the user sees"; the backdrop behind these frames happens to be the
same `#f2eee8`, so unfilled sections read as filled and a filled one read as
unfilled. The giveaway was a contradiction: the testimonial section's own design
context says `bg-[#f9f7f5]`, and the page render claimed `#f2eee8` in the same
place. Rendering that section ALONE settled it, and re-rendering the page with
`contentsOnly: true` produced a different and coherent answer.

A render that agrees with itself is not the same as a render that is right. Both
numbers were real; one was about the wrong surface.

### Three grounds, and the product pages alternate between them

All three map to tokens that already existed — `#f2eee8` is `--bg-subtle`,
`#ffffff` is `--bg-surface`, `#f9f7f5` is `--bg-base`:

| page | bands, top to bottom |
| --- | --- |
| Home | subtle everywhere, except the testimonial on base |
| Products index | subtle, then base — unchanged, already correct |
| Category | subtle, base, subtle, base — unchanged, already correct |
| **Product** | **subtle, then white / subtle alternating, then base for FAQ and CTA** |

**The product pages alternate by POSITION, not by section type**, which is the
part that had to be established rather than assumed. Two pages with different
section mixes were sampled, and the same `split` block comes out white on one
row and `#f2eee8` two rows later:

```
mailers    hero f2eee8 · steps #fff · features f2eee8 · specs #fff ·
           split f2eee8 · split #fff · numbered f2eee8 · faq f9f7f5 · cta f9f7f5
gel packs  hero f2eee8 · numbered #fff · features f2eee8 · formats #fff ·
           numbered f2eee8 · cta f9f7f5
```

So it is a function of the index, not a field on the section — a ground stored
in the content would need re-typing every time a section was inserted, and would
be wrong the first time someone forgot. The FAQ is the one exception and it is
the design's: it leaves the alternation and lands on the closing band's ground,
so the page ends on one colour rather than on a stripe.

Verified by diffing the band sequence of the built page against the Figma
render, rather than by reading the code back:

```
FIGMA  subtle | white | subtle | white | subtle | white | subtle | base | ink
BUILT  subtle | white | subtle | white | subtle | white | subtle | base | ink
```

### The nav moved with them

`bg-base` → `bg-subtle`. The design puts the navbar on the same ground as the
band under it, and that band is `#f2eee8` on every page type in the file. A
sticky bar has to be opaque — a transparent one puts body copy behind the logo
when a white section scrolls under it — so it picks one ground, and the right
one is the ground the page starts on. About and Contact got `bg-subtle` on their
first section to match; neither is in the v1 Figma set, so that is consistency
rather than transcription.

### Measurements

| | before | after |
| --- | --- | --- |
| verify | 8 checks, 1083 assertions | **8 checks, 1083 assertions, 0 failures** |
| grounds in use | 2 | **3** |
| home hero | full-bleed, 5:3 | **contained, 1344 × 640** |

### Open questions

Unchanged, plus:

90. **The product page heroes are still full-bleed** while the home hero has
    gone back to the drawn plate. AUDIT D8 is narrowed to them alone. The
    instruction that put them there has not been withdrawn, and nothing has
    been said about them since the design changed — so they are now the only
    pages whose hero disagrees with Figma.

## 2026-10-17 — Entry 70. One button set, three grounds

The v1 button set, drawn on the three grounds the site actually has (Figma
1327:24580 on `#f9f7f5`, 1327:24510 on `#f2eee8`, 1327:24598 on `#1f1f1f`):

| | primary | secondary | arrow link |
| --- | --- | --- | --- |
| on `#f9f7f5` | tan `#c5b197`, ink label | `#7a5f43` border + label | `#7a5f43` |
| on `#f2eee8` | tan `#c5b197`, ink label | `#7a5f43` border + label | `#7a5f43` |
| on `#1f1f1f` | **white**, ink label | **white** border + label | **white** |

**Three scenarios, two tokens.** The two light rows are identical, so what the
design is actually describing is a pair that flips with the ground — which is
what every other colour here does. `--bg-action` now remaps per theme, and a new
`--outline-action` carries the bronze.

**The old note predicted this and said so**: `--bg-action` was declared once in
the bare `:root` with "Stated rather than left as an omission someone later
fixes", and `actionMatrix` carried "the day somebody adds a `[data-theme]`
override for it, this is what notices". The override arrived. Both notes are
rewritten rather than deleted, because being wrong in a recorded way is the
point of recording it.

### `action` is gone, and `primary` took its place

The `action` variant existed because `primary` was the ink fill and the nav
needed the tan beside it. v1 makes the tan the primary on light and white on
dark — which is exactly what `primary` already resolved to on dark — so they
became two names for one button and one of them went. The ink fill survives as
`--bg-inverse`; nothing asks for it today.

### Two reversals, both recorded rather than absorbed

**Arrow links are bronze again.** They were grey, then black on the explicit
instruction *"for button with arrow type text use our black(text color)"*, and
the v1 set draws them `#7a5f43`. Later instruction wins; the earlier one was not
wrong when it was given.

**The square mark is a hover state.** It was drawn at rest on four call sites.
It now belongs to the component — a mark four pages remember to ask for is a
mark the fifth forgets — and appears on hover for every filled and outlined
button.

Positioning it was the only real design problem here, and both obvious options
cost something visible at rest, which is the state all three scenarios draw:

| | cost |
| --- | --- |
| in flow, revealed on hover | the label sits ~10px right of centre on every button, always |
| in flow, grown on hover | the button changes width under the pointer and shoves its neighbour |
| **absolute, in the left padding** | **nothing — label fixed, box fixed** |

The visible square is about 5px inside a 14px box, so at `left: 0.3125rem` it
clears the label by roughly 9px. Opacity only (§12.3).

**Secondary reverses into the primary**, on instruction: border, fill and label
all move to `--bg-action` / `--text-on-action`, so the outlined button completes
into the filled one. Same gesture it always had, now pointing at the tan rather
than the ink.

### The new check, and its red path

`outlineActionMatrix` asserts the bronze against all three grounds in both
themes — 12 pairs, floor **5.13 : 1**. It checks at AA rather than at 1.4.11's
3.0 even though the token is a border as well as a label: the stricter of the
two obligations decides, and the boundary comes along free.

Red path run before it counted (§9): lightening `--bronze-700` to `#b08a5e`
fails 3 of 12 pairs with a floor of 2.74 and exits 1. Reverted.

Verified at the pixel as well as in the matrix — rest, primary hover and
secondary hover captured from the built page with the pointer actually moved
onto each button, not by reading the CSS back.

### Measurements

| | before | after |
| --- | --- | --- |
| verify | 8 checks, 1083 assertions | **8 checks, 1096 assertions, 0 failures** |
| contrast pairs | 71 | **85** |
| button variants | 4 | **3** |

### Open questions

Unchanged, plus:

91. **F8 now covers every filled button on the site**, not one nav button. The
    tan measures 1.80–2.08 against the three grounds where WCAG 1.4.11 asks 3.0,
    so no primary or hovered secondary has a perceivable edge. Accepting it once
    for the nav and accepting it everywhere are different decisions; the second
    has now been made by following the design. A 1px `--line-strong` border, or
    darkening the tan to about `#a98d6b`, fixes it.

## 2026-10-17 — Entry 71. The hover opens the left padding, and the button stays put

Supersedes entry 70's account of the mark, on instruction: the dot shows on
hover **and the left padding opens with it**, so the label slides across rather
than the mark appearing beside a label that never moves.

**The two paddings swap rather than the left one growing.** 24/32 at rest,
32/24 on hover. A button that only grew its left padding would get wider under
the pointer, and in the home hero that is the second button stepping aside
every time you aim at the first. Swapping keeps the button's own width
constant, so the slide is contained entirely inside it.

Measured on the built page, pointer actually moved onto each button:

| state | padding L/R | mark opacity | x | width |
| --- | --- | --- | --- | --- |
| rest | 24 / 32 | 0 | 553.1 | 142.4 |
| hover primary | **32 / 24** | **1** | 553.1 | 142.4 |
| hover secondary | 24 / 32 → **32 / 24** | **1** | 707.5 | 179.5 |

`x` and `width` are identical in every row, for both buttons. Neither moves.

**`padding` joins the transition**, which is a layout property animating on
hover and therefore worth justifying against §12.3: the change is confined
inside a box whose own size never changes, so nothing outside the button
reflows. The mark stays absolutely positioned and adds no width in either
state — the padding pair is the only thing moving.

**The padding is a utility pair, not a component rule.** Utilities outrank
`@layer components`, so a `px-lg` from the size lookup would beat anything the
stylesheet tried to set — the same trap `.hero-stats` recorded. `MARK_PAD`
emits `pl-lg pr-xl hover:pl-xl hover:pr-lg` and the lookup is skipped for these
buttons. The dead-class count rose 316 → 323 on the build, which is those
hover variants proving they generate rather than being assumed to.

verify: 8 checks, 1103 assertions, 0 failures.

## 2026-10-17 — Entry 72. The category card shows its title and nothing else

On instruction, with the design attached: the home cards show only their title
at rest and reveal the paragraph and the link on hover.

**The title moved to the foot of the card** and the column is bottom-anchored,
so the reveal grows UPWARD into the photograph. The paragraph and link still
follow the heading in the source — that is reading order — and justifying the
column to the end means opening them pushes the heading up rather than pushing
them off the bottom edge.

### `0fr → 1fr`, not a max-height

The revealed block has no height anyone can write down: two lines of copy on one
card and three on another, reflowing at every width. `max-height` is the usual
workaround and it is a guess — too small clips the copy, too large makes the
transition start late and finish early, and both are wrong at some viewport.
A grid row animates to the content's own size and is correct at all of them.
The child carries `overflow: hidden`, because a `0fr` row stops reserving space
without clipping on its own.

Opacity fades the content in as a second step, so the copy is not scraped up by
the closing edge.

### Two things that would have been bugs

**`:focus-within`, not just `:hover`.** The link lives inside the collapsed
region. Without it, a keyboard user tabs to a control they cannot see — the card
would have passed the keyboard check (the link is reachable and has a ring) while
being unusable, which is exactly the kind of pass that means nothing.

**No hover, no hiding.** The collapsed state is written inside
`@media (hover: hover)`, so a touch device — which has no pointer to reveal with
— gets the content visible at rest. Putting the media query around the OPEN
state instead would have hidden the copy on every phone with no way to get it
back.

### The scrim lost its top band

Every piece of type on this card now sits at the bottom, so the top band was
darkening a corner with nothing in it. One band does the whole job. Re-measured
in both states rather than assumed to still hold, since the heading physically
moved into the other band:

| | heading (needs 3.0) | body (needs 4.5) |
| --- | --- | --- |
| rest, title only | **8.16 – 9.62** | *collapsed* |
| hover, fully open | **4.73 – 8.84** | **5.65 – 11.63** |

The measurement script had to be taught to force the reveal open first: sampling
the card as drawn measures a zero-height box and returns 1.16 for every card,
which is a number about nothing. The state that has to pass is the one the
reader sees.

AUDIT D9 narrowed to the single band.

### Measurements

| | before | after |
| --- | --- | --- |
| verify | 8 checks, 1103 assertions | **8 checks, 1105 assertions, 0 failures** |
| scrim bands per card | 2 | **1** |
| worst heading contrast | 3.69 | **4.73** |

## 2026-10-17 — Entry 73. The whole card stopped being clickable, and nothing noticed

Asked whether the category card was still clickable. It was not — anywhere, in
either state, on every page that renders one.

### What broke it

Entry 70 put `position: relative` on **every** button so the hover mark had a
containing block. That also made each button the containing block for its own
`::after` — and `.category-card-link::after` exists to stretch that link over
the whole card. It stopped reaching past the link.

Measured with `elementFromPoint` at nine points across the first card:

```
REST    top-left div · top-mid div · top-right div · mid-left div · centre div
        · mid-right div · low-left h3 · low-mid h3 · low-right div
```

Nine points, nine misses. Three cards on the home page and six more across the
category pages, all dead.

**`relative` is now scoped to buttons that carry a mark**, which is the only
reason it was ever added. `size="link"` never carries one, so the stretched hit
area gets its containing block back and all nine points resolve to the link in
both states.

### Nothing caught it, and that is the finding

The markup did not change. Every internal link still resolved. axe was happy.
The keyboard check passed — the link is still reachable by Tab and still paints
a ring. The sweep saw no overflow. The card looked identical in a screenshot.

**A hit area built out of CSS can be removed by CSS, silently, and the only way
to know is to press.** So `scripts/verify/pointer.mjs` does: for every container
that claims a stretched target, it samples nine points and asserts each one
resolves to an `<a href>` via `elementFromPoint` — the browser's own hit test,
which accounts for every way CSS can take a target away: a containing block
that moved, an overflow that clips, a z-index that buries it, inherited
`pointer-events`.

It tests the REST state deliberately. The card shows only its title until
hovered, and a target that only exists once you are already on it is not a
target.

Red path, run through the harness rather than standalone — 9 of 13 targets
dead, naming the page, the container, the card and the first missing point:

```
FAIL pointer targets   13 stretched-target checks   9 failures
  STRETCHED TARGET DEAD — / .category-card "Cold chain packaging…":
  9 of 9 sampled points do not resolve to a link. First: 0.15,0.12 -> div.
```

**The first attempt at that injection was invalid and the harness said so.**
Running `pointer.mjs` directly starts no preview server, so it navigated to
nothing, found nothing and reported `EMPTY — 0 stretched-target checks` with
exit 1. That is §9's "a pass with zero reported checks is a failure" catching a
bad test rather than bad code, which is the first time that rule has fired on
my own work.

### The card images settle instead of lifting

On instruction: both card types rest at `scale: 1.02` and go to `1` under the
pointer, reversing a 1 → 1.01 lift. It reads better on a card whose copy opens
at the same moment — the image relaxes back as the text arrives rather than
pushing forward into it. `scale` stays on the image only; the card's box must
not move or a row of them jitters.

Contrast re-measured after it, because a different crop puts different pixels
behind the type: headings **4.67 – 9.10**, bodies **5.82 – 11.60**, all passing.

### Measurements

| | before | after |
| --- | --- | --- |
| verify | 8 checks, 1105 assertions | **9 checks, 1118 assertions, 0 failures** |
| clickable points per card | **0 of 9** | **9 of 9** |
| stretched targets asserted | 0 | **13** |

## 2026-10-17 — Entry 74. The actions go navy, and F8 closes

Design system update, read off Figma's variables and checked against what the
pages actually render.

### One colour for all three actions

`action/primary/default`, `action/secondary/default` and `text/link` now hold
the same value — **`#0e2a46`**. So the filled button, the outlined button's
border and label, and every arrow link are one navy, replacing the tan fill and
the bronze outline from entry 70, which lasted a day.

Only the tokens moved. `Button.astro` is untouched except for comments, because
the variants already read `--bg-action`, `--text-on-action` and
`--outline-action`; the dark theme is untouched entirely, since white-on-dark
was already what the design drew there.

### F8 closes, and nothing was worked around to close it

| fill against | tan | navy | needs |
| --- | --- | --- | --- |
| `--bg-base` | 1.94 | **13.66** | 3.0 |
| `--bg-subtle` | 1.80 | **12.63** | 3.0 |
| `--bg-surface` | 2.08 | **14.60** | 3.0 |

The label improved with it — white on navy is 14.60 against ink-on-tan's 7.94.
The matrix floors moved 6.26 → **10.93** on the fill and 5.13 → **8.48** on the
outline. No check was relaxed and no exemption was taken: the design picked a
colour that passes.

### The variables and the pages disagree, and the pages won

This is the part worth recording. Figma's variable set is mid-update, and three
of its values are not what any page renders:

| variable | says | pages render | ours |
| --- | --- | --- | --- |
| `text/secondary` | `#6b6967` | `#4d4b4a` | `#4d4b4a` |
| `text/tertiary` | `#b0aeab` | — | `#6b6967` |
| `border/strong` | `#1f1f1f` | — | `#888683` |

**`text/tertiary: #b0aeab` measures 2.07 : 1 on `--bg-base`** against the 4.5
body text owes. Adopting the variable set wholesale would have put failing text
on every page — and it would have passed review, because it came from the
design system.

The older button spec frames (1327:24510 and siblings) have the same problem in
the other direction: they still draw the bronze as a raw hex while the live
hero (1005:13606) draws the navy as a variable. A variable is a statement of
intent; a frame is a statement of fact; and when they disagree the thing that
ships is whichever one the client is looking at. Here that is the page.

**So: the navy is applied, the three above are not.** They are listed here
rather than silently skipped.

### Measurements

| | before | after |
| --- | --- | --- |
| verify | 9 checks, 1118 assertions | **9 checks, 1118 assertions, 0 failures** |
| action fill floor | 6.26 | **10.93** |
| outlined/text action floor | 5.13 | **8.48** |
| AUDIT failures open | F1, F8 | **F1** |

### Open questions

91 **closes** with F8. One added:

92. **Three design-system variables disagree with every frame that uses them**
    — `text/secondary`, `text/tertiary` and `border/strong`. `text/tertiary`
    at `#b0aeab` would fail AA outright at 2.07 : 1. Worth confirming which
    side is current before the next palette pass.

## 2026-10-17 — Entry 75. The hero band grows, and the radius becomes a size rule

Re-read Home v1.03 and applied what moved; then a global ruling on card radii.

### What actually changed on the home page

Most of it already matched — the two hero buttons, the title-only cards, the
testimonial, the section grounds. The design's own card frame now contains
**only** a `Title` node at y=455, which is the hover-reveal this already builds.

One real difference: **the hero band is 1440 × 720, not 640.** The photograph
behind it did not change — still the same 756px file hung 100px above the band
— so the taller plate shows more of it rather than scaling it up. `.hero-media`
and the `ratio` prop both move to `1344 / 720`.

The CTA plate is unchanged at 600 tall; the instance around it went 728 → 664,
which is its padding, not the plate.

### Radius becomes a size rule

| | radius | token |
| --- | --- | --- |
| large, full-width plates | **4px** | `--radius-plate` |
| small cards | **6px** | `--radius-card` |

**The larger the box, the tighter its corner** — which reads backwards written
down and is right on the page: 4px on a 1344px plate is the same optical
softness as 6px on a 440px card, because the eye reads a radius against the
edge it sits on.

They are named for the ROLE, not for a size step. `--radius-md` / `--radius-lg`
would have invited exactly the wrong pick — the bigger number for the bigger
box — and `--radius-md` was 3px, which matched nothing in Figma's scale
(radius/0, /2, /4, /6, /32, /full). 2px stays as `--radius-sm` for buttons.

Migrated: 5 plates — the CTA plate, the CTA banner, the liner rows, the home
hero and the about image — and 36 card uses across 12 files.

Confirmed in the built CSS rather than assumed from the source:

```
.rounded-plate{border-radius:var(--radius-plate)}   --radius-plate:.25rem
.rounded-card {border-radius:var(--radius-card)}    --radius-card:.375rem
```

The dead-class check is what would have caught a utility that did not generate
— the same failure mode as `sm:w-10` in entry 64 — and it passed with both
present.

verify: 9 checks, 1118 assertions, 0 failures.

## 2026-10-17 — Entry 76. The design system, read properly, and what it costs

The real design system frame (1357:30) rather than the variables a page
happens to use. Three things applied, two refused, and the refusals are the
point of the entry.

### Applied

**The navy ramp is the system's, not derived.** `color/primary/800 #2b445c`,
`/900 #0e2a46`, `/950 #0b2035`. The hover step was derived here as `#16375c`
and the system says `#2b445c`, which is visibly lighter; the pressed step did
not exist at all. Buttons gain `active:` states and the contrast matrix gains
the pressed fill — 4 pairs → 6, floor 7.20 : 1.

**The quotation mark is the brand navy.** Sampled off the frame: `#0e2a46`,
not the ink it shipped as. It takes a new `--text-brand` rather than
`--outline-action`, because a decorative glyph wearing an action token is what
makes a later palette split painful.

**Home grounds reverted.** The whole page was `bg/secondary` for one round;
it is now `bg/primary` everywhere except the card band. The nav went back with
it, and About and Contact with the nav. Third reading of these in two days —
and the only reliable way to take it remains `contentsOnly: true`, because
Figma's canvas behind the frames is the same `#f2eee8`.

### Refused, with numbers

The system's text ramp is **one step lighter at every role** than ours, and the
tertiary step does not pass:

| token | system | on `#f2eee8` | ours | ours measures |
| --- | --- | --- | --- | --- |
| `text/secondary` | `#6b6967` | 4.73 ✓ | `#4d4b4a` | 7.04 |
| `text/tertiary` | `#8c8a87` | **2.98 ✗** | `#6b6967` | 4.73 |
| `text/disabled` | `#b0aeab` | 1.92 | — | — |

`--text-tertiary` carries captions, spec-table notes, the footer copyright and
form placeholders — all normal text, all owing 4.5. Adopting `#8c8a87` puts
failing text on every page of the site, and it would pass review precisely
because it came from the design system.

Adopting only `text/secondary` does not work either: it is `#6b6967`, which is
exactly our tertiary, so the two roles would collide. **The ramp is adopted as
a whole or not at all, and as a whole it fails.** Ours is the same ramp shifted
one neutral step darker. Left alone; recorded as open question 93.

`border/strong #1f1f1f` against our `#888683` is also left alone — ours was
tuned for 1.4.11 and the system's is ink, which would make every input border
and dashed pending box read as a rule rather than a boundary. Open question 94.

### Spacing, measured band by band

"Too much space after the buttons" was right, and so were two more:

| | was | design | now |
| --- | --- | --- | --- |
| hero buttons → picture | 120 | 48 | **48** |
| testimonial padding | 192 | 96 | **96** |
| closing band, above the plate | 120 | **0** | **0** |

The closing band's top padding was the biggest single error — the design's
`cta desktop` instance is 664 tall around a 600 plate at y=0, so every pixel of
the difference sits below it. Fixed on all three page types.

Built page 4430px → **4070px** against the design's 4114. The remaining gap is
spread, not concentrated.

### Buttons: the resting padding was wrong

24 left / 32 right, swapping to 32/24 on hover. The asymmetry came from the
OLD icon spec, where the mark was drawn at rest; the current design draws
`px-[24px]`, symmetric. Rest is symmetric now and only the left opens on hover.

**That reintroduces the growth the swap avoided, and the measurement is the
honest version of the trade:**

```
rest    Get a quote  x 561.1  w 134.4  24/24   ·  Explore products  x 707.5
hover   Get a quote  x 557.1  w 142.4  32/24   ·  Explore products  x 711.5
```

The button grows 8px and its neighbour moves 4px. Rest is the state every
visitor sees; hover is the state one of them sees at a time. Rest wins.

### The home hero, third position in two days

Full-bleed → contained → **full-bleed again**, and now flush to the band below
rather than carrying the design's 64px of ground. Ratio stays the plate's
1344/656, so only the box width differs: 703px tall at 1440 against the drawn
656. AUDIT D8 updated rather than re-argued.

### Measurements

| | before | after |
| --- | --- | --- |
| verify | 9 checks, 1118 assertions | **9 checks, 1118 assertions, 0 failures** |
| contrast pairs | 85 | **87** |
| home page height | 4430px | **4070px** (design 4114) |

### Open questions

93. **The design system's text ramp fails AA at the tertiary role** —
    `#8c8a87` measures 2.98 : 1 on `bg/secondary`. Ours is the same ramp one
    neutral step darker. Confirm which is intended.
94. **`border/strong` is `#1f1f1f` in the system and `#888683` here.** Ours was
    tuned for 1.4.11; the system's is ink and would read as a rule on inputs.

## 2026-10-17 — Entry 77. The space before the closing plate, and two rules that should not have been there

Asked to check the padding before the home page's closing band. Measured it:
**0px** from the testimonial's bottom rule to the plate.

That was technically what the design's geometry says — the `cta desktop`
instance starts exactly where the testimonial band ends — and it was still
wrong on the page, because two other things were off and the gap was the
symptom.

### The band was not holding itself open

The design's testimonial card is `h-[600px] py-[96px]` with its content
**centred**. Ours had the 96px padding and nothing else, so the band's height
came from whatever the quote happened to measure, and the attribution ended
97px above the plate against the design's ~141.

A `min-height` from `md` fixes it, and the content centres inside it:

| | was | design | now |
| --- | --- | --- | --- |
| band height | 497 | 600 | **600** |
| attribution → plate | 97 | ~141 | **147** |

No floor below `md`: 600px of fixed height on a phone is most of a screen of
nothing.

### The rules were from a design that no longer exists

The section carried a bottom border and the card left and right borders — "the
one place on this page where `--line` does structural work", per the note that
shipped with them. The current frame (1351:8662) draws neither. Rendered in
isolation its edges come back transparent rather than as a hairline, and it has
no fill of its own either; it sits on the page ground like every other band.

So the rule that was sitting flush against the plate should not have been there
at all. Removed, with the note that justified it.

verify: 9 checks, 1118 assertions, 0 failures.

## 2026-10-17 — Entry 78. The page-top step was double-counting the nav, on every page

"Less top padding on the home hero" turned out to be a bug rather than a taste
call, and it was on every page of the site.

### 178px where the design draws 78

`--spacing-section-nav` was
`calc(var(--nav-height) + var(--spacing-section-md))` — correct for a nav that
OVERLAYS the page. This one never has: the header is `position: sticky`, so it
is in flow and already occupies its own 83px. Adding that height again as the
first section's padding put every first heading 178px below the nav.

Measured on four page types before and after, all previously identical, which
is what a derived token gets you when the derivation is wrong:

| page | was | now | Figma |
| --- | --- | --- | --- |
| home | 178 | **96** | 78 |
| products index | 213 | 131 → **155** | 166 |
| category | 213 | 131 → **155** | 166 |
| product | 260 | **131** | 113 |

The index and category heroes then went to `spaceTop="lg"`, because the design
draws those two 166px below the nav where the home and product heroes sit at
78 — one step cannot serve both, so the shared step is the tighter one and
those two ask for more.

### The product hero was bottom-aligning a row the design top-aligns

`md:items-end` on the product hero hung its two columns off a shared baseline,
and with a taller right column that pushed the H1 **65px** further down than
drawn. Figma puts both columns at y=0 (1204:3924 and 1204:3928). The CATEGORY
hero genuinely is bottom-aligned — its right column sits at y=53 of a 99px row
— and keeps `items-end`.

### Every page compared band by band

Colour order matches the design exactly on both templated page types, and the
heights are within 5%:

```
PRODUCTS INDEX
  figma  secondary 399 · primary 2329 · ink 568          total 3304
  built  secondary 395 · primary 2379 · ink 592          total 3449

CATEGORY (cold chain)
  figma  secondary 306 · primary 1385 · secondary 286 · primary 724 · ink 568
  built  secondary 267 · primary 1489 · secondary 368 · primary 696 · ink 592
```

### The nav does not match on two page types

The built runs above begin with 82px of `primary` that the Figma runs do not
have: our header is `bg-base` on every page, and the index and category heroes
are `bg/secondary`. In the design the navbar sits INSIDE each hero band and
takes that band's ground, so it is `#f9f7f5` on home and product and `#f2eee8`
on index and category.

A sticky bar has to be opaque — it cannot inherit — so matching this means the
header taking its ground per page rather than once. Not done; open question 95.

### The quote band keeps its rules

Restored on instruction after entry 77 removed them on the evidence that the
current frame draws none. What a frame draws and what is wanted are different
questions. AUDIT D11. The 600px band height is NOT part of that deviation — it
is the design's own, and it is what gives the quote its air before the plate.

verify: 9 checks, 1119 assertions, 0 failures.

### Open questions

95. **The nav's ground is fixed where the design varies it per page** —
    `#f9f7f5` on home and product, `#f2eee8` on index and category. A sticky
    bar must be opaque, so this needs the header to take its ground from the
    page rather than from one token.

## 2026-10-18 — Entry 79. The cross-link card is redrawn, and a check that had been passing on skipped work

### The closing band joins the page's rhythm

On instruction: the CTA section takes `space="md"` on BOTH sides — 96px, the
same global step every other band gets — on the home page, the category
template and the product template.

The design's `cta desktop` instance draws no top padding and 64–96 below, which
is what the three pages carried. The ruling is that the closing band is not a
special case: it sits in the page's normal section rhythm. Recorded as a
deviation from the frame rather than absorbed, because the frame does say
otherwise.

### CrossLinks, rebuilt to Figma 1005:14054

The old block was three full-width cards with a picture behind each. The v1
design is a heading block across the top — eyebrow plus a 24px standfirst at a
600px measure — over two half-width cards, each a 240px square flush to its own
left edge with the copy beside it and a text link at the bottom.

Measured against the frame after building it, rather than trusting the markup:

```
                     figma      built
  section ground     #f2eee8    #f2eee8      ok
  card ground        #f9f7f5    #f9f7f5      ok
  card radius        6px        6px          ok
  card min-height    128px      128px        ok
  thumb              240x240    240x240      ok
  standfirst         24 / 1.2 / 600px measure  same   ok
  eyebrow            11px       11px         ok
  title              20 / 1.1   20 / 22      ok
  title - body gap   8px        8px          ok
  body               16 / 1.3   16 / 20.8    ok
  link               15px       15px         ok
  link colour        #0e2a46    #0e2a46      ok
  heading gap        16px       16px         ok
  card gap           24px       24px         ok
  card gap (inner)   20px       24px         DEVIATION
  card padding-right 20px       24px         DEVIATION
  body colour        #6b6967    #4d4b4a      DEVIATION (open question 93)
  section padding    80px       96px         DEVIATION
```

The two 20px values are snapped to 24 because there is no 20px step on the
spacing scale, and a one-off `1.25rem` here would be the first off-scale gap in
the repo. Same ruling the 80 → 96 section padding got. Both recorded in the
component rather than left to be discovered.

The body colour is the text ramp refusal standing: the design's
`text/secondary` is `#6b6967`, which is our `--text-tertiary`, and adopting the
ramp wholesale puts body copy at 2.98:1. Open question 93, unchanged.

Link labels are derived — `Explore ${pageTitle.toLowerCase()}` — rather than
stored, because the design writes exactly that for all three and a stored
string would be three copies of a rule.

### Three square photographs, because a square crop of a portrait is a band

`cardImage` is a 5:6 portrait shot to sit BEHIND a home-page card with text
over it. The cross-link thumb is 1:1, and cropping the portrait to it shows a
strip across the middle of the product. So `cardThumb` is a second slot in the
category schema, not the same file at another size — the same argument
`images.hero` already makes against reusing `images.main`.

Supplied as 960px PNGs, converted to 720px AVIF at q58:

```
  category-cold-chain-sm.avif         17.6 KB
  category-custom-boxes-sm.avif       19.5 KB
  category-pharmacy-formats-sm.avif   14.0 KB
```

720 because the thumb is a FIXED 240px at every width it is drawn at, so the
ladder is a density ladder for one number — 240 / 480 / 720 — not a viewport
sweep. `CATEGORY_CARD_WIDTHS` would have shipped a 1970px file into a 240px
box. The adapter falls back to `cardImage` so a category without a square still
draws a real picture.

The `cross 2-up 656px` row in the `CATEGORY_CARD_WIDTHS` docblock now describes
a layout this repo no longer ships. Marked as history in place rather than
deleted: the 656 figure is why that ladder reaches 1970, and the home card
still uses all of it.

### The link label was centred in a box that was flush left

On report. The link's BOX was correctly at the card's left edge and the full
width of the text column; `justify-content: center` inside it put the visible
label in the middle of the card, out of line with the title and copy above.
`self-start` sizes the box to its content. The hit area is unaffected — that is
the `::after`, measured against the card, and `pointer targets` confirms it.

### A check that had been passing on work it skipped

`pointer.mjs` went from 13 assertions to 11 when the cross-links were rebuilt.
Chasing that number found the check was wrong in two ways.

It scrolled each container into view and then probed EVERY matching container
on the page, so the home page's three cards were counted three times each and
the total was an artifact of the nested loop rather than a count of targets.
And anything not wholly inside the viewport after the scroll was `continue`d
past in silence.

The styleguide's two category cards are 799px tall. They were never pressed, on
any run since the check shipped, and the line read green every time. That is
precisely the unfalsifiable green line §9 forbids — the check was reporting on
the containers that happened to fit.

Rewritten so each declared target is probed ONCE, by index. Nothing is skipped:
a container taller than the viewport is pressed across the band of it that is
on screen, and one that cannot be brought on screen at all, or that has lost
its link, FAILS and is named.

Finding it also required fixing the instrumentation. The site sets
`scroll-behavior: smooth`, which `scrollIntoView` obeys, so the probe was
measuring wherever the scroll animation had got to after 260ms. Short hops
finished and long ones did not — which is exactly how a card 9,000px down came
to be skipped every single run. `behavior: 'instant'` makes the position
deterministic instead of a race against an easing curve.

```
  before   11 checks   home 3 cards counted 3x each, styleguide 2 counted 0x
  after     7 checks   every stretched target on the site, exactly once
```

Fewer assertions, more coverage. The count is now a number that means
something: there are seven stretched targets and seven are pressed.

§9 fault injection, both paths:

- **Primary.** Re-injected the original regression — `relative` on every button
  instead of only on those with a hover mark. All 7 targets went dead, 9 of 9
  points each on the cards, 7 of 9 on the cross-links, named per page and per
  index, non-zero exit. Reverted.
- **Unreachable.** Fired for real before the scroll fix, naming both styleguide
  cards with their measured position and the viewport height.

### A comment in a place the compiler accepted and the type system did not

`{/* … */}` placed inside a component's ATTRIBUTE LIST builds clean — the Astro
compiler strips it and the HTML is correct — and breaks the TypeScript parse of
the whole file, which took the `exploreLabel` unused-variable hint down with it
and reported as an unterminated string literal two lines later. `astro check`
caught it; the build did not. Noted because the build passing is the thing that
makes this one tempting to trust.

verify: 9 checks, 1113 assertions, 0 failures.

### Open questions

Unchanged: 85 (custom boxes carousel), 93 (the design's text ramp fails AA at
tertiary), 94 (`border/strong`), 95 (the nav's ground).

## 2026-10-18 — Entry 80. The custom boxes page, a carousel, and a category that is not a shelf

### The split header's supporting column goes to the right edge

On instruction, globally: in a two-column section header the supporting column
is an outer block aligned RIGHT with a content wrapper inside it whose text and
action stay LEFT-aligned.

The split matters. `text-align: right` would rag the lede down its left edge
and push the action away from the copy it belongs to. What the design aligns is
the BLOCK — its right edge meets the container's, and everything inside reads
from one left margin.

Measured first, because the symptom was not the obvious one. The column already
ENDED at the container's right edge; it was 546 wide where the design draws 432,
and the action under the lede sat at the column's left edge rather than the
block's. So the change is two things: `md:col-span-4 md:col-start-9` — the
design's own column (Figma 1336:25792), and the same one the category and
product heroes already use — and `md:justify-end` to hold the edge when the
content does not fill it.

```
  before  col1 left=846 right=1392 w=546   lede fills it, link at 846
  after   col1 left=960 right=1392 w=432   matches the drawn column
```

### The category template stops assuming a shelf

Cold chain and pharmacy formats sell products: their page is a heading and a
rail of cards. Custom boxes sells a capability. Its v1 page (Figma 1005:14931)
draws three rows describing what can be built, then a carousel of the options,
and NO product rail at all.

So a category now carries `sections`, exactly as a product does, and the
template branches on `category.sections.length` — never on the slug. A template
that asks which page it is has the page's identity compiled into the one file
whose job is to not know it, and the next category wanting rows would need a
second branch beside the first.

IT REUSES THE PRODUCT SECTION UNION rather than defining a second one. `split`
on this page is the same block from the same fields; a parallel vocabulary that
looked identical and behaved differently is exactly what one shared union
prevents. Adding `carousel` to that union made the product template's
exhaustiveness guard fail to compile until it acknowledged the new member —
which is the guard doing the job it was written for, observed rather than
assumed.

THE ItemList GOES WITH THE RAIL, not with the page. A category rendering rows
publishes no list of products, and structured data naming products the page
never mentions describes a page that does not exist.

`sectionsHeading` was added to the schema and then removed: `selectionHeading`
already holds "Thoughtfully packaged. Ready to deliver.", which is the sentence
the design puts over the rows. Two fields, one string, no.

### SplitFeature learns a second size

The product pages draw this block as the page's own h2 — 48px with a 24px
standfirst. The custom boxes rows sit UNDER a 48px section heading, so the
design sets them at 32 and 20 (Figma 1268:4222): items in a list, not the
heading of a band. Both land exactly on existing tokens — `text-h3` is 32px at
1440 and `text-h5` is 20px — so this is a `size` prop over the type scale, not
a new ramp. Defaulting to `h2` leaves all five product pages untouched.

The design sets all three lines 20px apart where the larger size runs 24 then
12. Snapped to 24 and 16; there is no 20px step, and the cross-link card got
the same ruling yesterday.

### The carousel

Eight option cards, one centred at a time, neighbours showing at both edges.

THE SCROLLING IS THE PLATFORM'S, as the rail's is. A native scroll-snap track
with `scroll-snap-align: center` brings momentum, rubber-banding, trackpad,
touch, `scroll-behavior` and the keyboard arrows for nothing. The script's only
job is to say which slide is centred, because that is the one thing the browser
does not expose and the one thing the design sizes to. Swiper stays rejected on
the rail's own measurement — ~15 KB gzipped against 2 KB for this whole site.

THE NEIGHBOURS SCALE, THEY DO NOT RESIZE. Every slide is the same 800px box and
the inactive ones are `scale(0.95)`, so changing the active slide reflows
nothing — a width change would move the snap target the browser is currently
scrolling toward. The transform ORIGIN is what makes it line up, and it is the
part worth recording:

```
                        figma            built
  active                320 .. 1120      320 .. 1120   w=800  media 800x480
  next (inactive)      1144 .. 1904     1144 .. 1904   w=760  media 760x456
```

A slide before the active one scales toward its RIGHT edge and one after it
toward its LEFT, so each stays 24px from the centre card instead of drifting 20
away. The `~` combinator does the before/after split in CSS off the single
class the script sets.

ITS ONE INEXACTNESS, STATED: two inactive slides that are not adjacent to the
active one sit 64px apart rather than 24, because each has shrunk 40px away
from the other. Checked where it would show — at 1440 only the active and one
neighbour are ever on screen, at 1920 the same, and the gap first peeks past
about 2400px as a sliver at the extreme edge. Transform origin cannot fix it;
layout width could, at the cost of reflowing mid-scroll. Taken deliberately.

Slide one carries `is-active` in the HTML, so with no JavaScript at all the
rest state is the one the design draws: first card full size, the rest a step
down. The script only ever moves the class. `tabindex="0"` is in the markup for
the same reason the rail's is — a scrollable region unreachable by keyboard
fails WCAG 2.1.1, and that has to be true before anything runs.

Verified the class actually follows the scroll rather than just initialising:

```
  at rest          active=slide0  box=320..1120 w=800
  scrollLeft 824   active=slide1  box=320..1120 w=800
  scrollLeft 1648  active=slide2  box=320..1120 w=800
  scrollLeft 4120  active=slide5  box=320..1120 w=800
  scrollLeft 5768  active=slide7  box=320..1120 w=800
```

§6 census entry `carousel centre`, budget 600 B, measured 337 B gzipped. Red
path run: padding the module to 1,215 B fails the census naming the script, the
measurement and the budget. Reverted.

Pictures are the design's own placeholder — a labelled slot, no file — which is
what `slot()` and Media already do, and what the frame itself draws.

### What the checks caught

`dead classes` failed on `carousel-media`: a class in the markup with no rule
anywhere, left over from sizing the slide picture before the ratio and the flex
basis did it. Removed rather than given a rule it did not need.

`/products/custom-boxes` joined the sweep list. It is the other category SHAPE —
same template, different branch — and it carries the only centre-snapping
scroll region on the site. 10 pages × 7 widths, no overflow; axe at 20 runs.

verify: 9 checks, 1131 assertions, 0 failures.

### Open questions

96. **The design's supporting column is two widths.** 432 on the home page
    (1336:25792) and the custom boxes hero (1005:14937), 546 in the
    "Everything you can customize" header (1222:3952). Unified on 432, which is
    the majority and the one the heroes already use. The right edge is the same
    either way; the lede wraps one line deeper at 432.

97. **The carousel does not loop, and the design implies it does.** The frame
    draws slide 08 bleeding in at x=-464, to the LEFT of the active first
    slide, which only happens if the track wraps. Ours is a plain scroller: at
    rest there is nothing left of slide one, so the left half of the band is
    empty. Looping means cloning slides and repositioning on scroll — real
    JavaScript against a 600 B budget — so it is a decision to take rather than
    something to slip in.

## 2026-10-18 — Entry 81. The carousel loops and drags, and a new home hero

### Open question 97, answered: loop it

On instruction. The carousel now loops, drags, and opens with the SECOND slide
centred so the first sits to its left and three cards are in view. Entry 80
left this as a decision to take rather than something to slip in; it was taken.

THE LOOP IS CLONES AND ARITHMETIC, not a rewrite. One clone set either side of
the real slides, with the scroll position kept inside the middle copy: cross a
boundary and it jumps exactly one set width, onto identical pixels, so the seam
cannot be seen. The clones are built at runtime rather than rendered — eight
slides are what the page has to say, and twenty-four in the markup would be a
seam in the HTML as well as in the scroll. They carry `aria-hidden` and are
untabbable, so a screen reader hears eight options rather than twenty-four.

Verified the seam rather than assuming it, in both directions, and the
important number is the last one:

```
  on load               scrollLeft 7416   centred "Closures"
  six steps back        scrollLeft 9064   centred "Paperboard thickness"
  fourteen steps on     scrollLeft 7416   centred "Closures"
```

Fourteen forward from four lands on two, and it lands on the SAME scrollLeft it
started from. The wrap does not drift — which is the failure this arithmetic
would otherwise have, accumulating a few pixels per crossing until the snap
points no longer line up with the cards.

`scroll-behavior` is deliberately left unset on the track. The seam jump is a
direct `scrollLeft` assignment, and that assignment obeys the property: smooth
scrolling would animate the jump across a whole set width and turn an invisible
seam into a visible rewind. The one place a smooth scroll IS wanted — settling
after a drag — asks for it explicitly through `scrollTo`.

THE DRAG IS FOR THE MOUSE ONLY. Touch already drags, natively, with inertia no
script is going to beat; taking it over would replace working physics with
worse physics. A mouse does not drag, and on a wide screen that is how most
people will try it, so pointer events move `scrollLeft` and hand straight back
to the browser. Snapping is switched off for the duration — mandatory snap
fights a drag it did not start — and back on at the end with one smooth scroll
onto the nearest card. `cursor: grab` because the scrollbar is hidden and a
draggable row with no affordance looks like a row that does not move.

Resize re-centres on whatever was centred: every number here is read from
layout, so a width change invalidates the seam arithmetic and the resting
position together.

§6: the budget moved 600 B to 1100 B, and the census entry carries the
reasoning rather than a bump. The first version centred and nothing else, at
337 B. Looping and dragging are the two things that cannot be done in CSS.
Measured at 800 B gzipped.

### The home hero photograph

Replaced on supply. Same 16:9 framing as the one it replaces, so it drops into
the existing 1344/656 crop with nothing lost.

```
  was   4096 x 2304   170.7 KB
  now   3072 x 1728   106.0 KB
```

THE LADDER LOST ITS TOP RUNG, and that is worth saying rather than leaving to
be noticed. `WIDE_WIDTHS` reaches 3840 and the new source is 3072 wide, so the
build caps there instead of upscaling — the emitted srcset now ends 2560w,
3072w where it ended 3840w. Still comfortably over 1440 at 2x, which is 2880;
a 4K display at 1x gets 3072 rather than a true 3840. Nothing to fix in code,
and supplying a wider file is what would restore it.

The alt text was re-read against the new picture rather than carried over —
the rule entry 46 set, and the reason it exists. The old string claimed "three
stand-up pouches" and "two navy gel packs"; the new shot does not support that
count, so the description now names what is actually there without asserting
numbers it cannot back.

verify: 9 checks, 1131 assertions, 0 failures.

### Open questions

97 is closed. 96 stands: the design's supporting column is 432 in two places
and 546 in a third, and this repo uses 432 throughout.

## 2026-10-18 — Entry 82. The drag was clunky, and the guess about why was wrong

### Profiled before changing anything, which is the whole lesson

Reported: the carousel drag is clunky, make it feel like Swiper, and use Swiper
or similar if a custom solution cannot.

The obvious suspect was the scroll handler. It read 24 bounding boxes a frame,
which is exactly the shape of a forced-layout problem, and the fix was already
written in my head. Measured it first:

```
  scroll handler   0.03 ms/frame   (16.7 ms is one frame at 60fps)
  rect reads alone 0.02 ms/frame   (24 slides)
```

Not remotely the problem. The optimisation pass would have shipped, measured
identically, and fixed nothing — and the next move would have been to reach for
the 15 KB library on the strength of a theory that was never true.

What was actually wrong was behaviour, in three places:

1. **The scale snapped.** Slides were either 1 or 0.95 with a CSS transition
   between them, so during a drag the sizes lagged the pointer and then caught
   up in a lurch. Scale is now a continuous function of scroll position:

   ```
     at rest             0.950  1.000  0.950
     quarter of a slide  0.950  0.988  0.963
     half a slide        0.975  0.975
     three quarters      0.963  0.988  0.950
   ```

   The half-slide case reading 0.975 both sides — the exact midpoint of 0.95
   and 1 — is the check that the interpolation is symmetric rather than merely
   moving.

2. **A release stopped dead.** Letting go mid-flick parked on the nearest card,
   which reads as stuck. Pointer velocity is now sampled through the drag and
   projected on release, capped at a slide and a bit so a hard flick advances
   decisively rather than flying across the set. Verified with real input
   events rather than synthetic ones — same distance, different speed:

   ```
     slow drag left 180px over ~290ms   stays on "Closures"
     fast flick left 180px under 20ms   carries to "Finish"
   ```

3. **Snap fought the settle.** Mandatory snap was restored before the settling
   scroll finished, so the browser snapped to where the row WAS rather than
   where it was going. It now comes back after.

THE ORIGIN FLIP BECAME FREE, which is the nice part of going continuous. A
slide left of centre shrinks toward its right edge and one right of centre
toward its left, and they swap as a slide crosses the middle — where the scale
is exactly 1 and the origin therefore has no effect at all. The swap cannot be
seen because at the moment it happens there is nothing to see.

Swiper stays unused. 1,017 B gzipped against the 1100 B budget already set, so
this cost no new budget — against ~15 KB for Swiper's pagination build alone,
on a site that ships 9.7 KB of JavaScript in total.

### Three photographs

The home hero gains its portrait companion, which the code has had a commented
slot for since entry 46. It is a `<picture>` now rather than one 16:9 file
cropped to 1:1.25 by `.hero-media` — and the crop was never the same picture:
squeezing a line-up of eleven products into a tall frame kept the middle two
and cut the rest off both ends. The portrait shot is composed for the frame and
measures 1206x1509, which IS 1:1.25, so the art direction and the CSS agree
rather than one overriding the other.

The cold chain range shot's mobile companion was replaced on the same supply.
It was 1175x1431 (0.821); the new one is 1206x1509 (0.799), so it now matches
the frame it is drawn in instead of being stretched a percent into it.

```
  centipack-home-hero-mobile.avif    1206x1509   84.8 KB   new
  category-cold-chain-mobile.avif    1206x1509   34.1 KB   was 1175x1431, 19.6 KB
```

### The cross-link card stacks on a phone

On instruction: picture on top, copy below. A 240px square beside three lines
of text is a row at 768 and a sliver at 390.

THE CORNERS COST NOTHING, which is the argument for clipping on the card rather
than rounding the picture. `overflow-hidden` on a `rounded-card` parent clips
whichever corners the child actually touches — left-top and left-bottom when
the picture is beside the copy, top-left and top-right when it is above it, and
square on the edge that runs into the card. Rounding the image itself would
have needed a rule per breakpoint and would have been wrong at one of them.

THIS INVALIDATED YESTERDAY'S LADDER, and the entry that set it said why it
would hold: `CARD_THUMB_WIDTHS` was 240 / 480 / 720 because "the thumb is 240px
at every width the card is drawn at". Stacking made that false — below `md` the
picture is now the width of the screen less its gutters, so a 430px device at
2x wants 860 and the top rung served 720. Re-encoded from the 960px sources and
the ladder extended to match; the small rungs are still why this is a separate
ladder from `CATEGORY_CARD_WIDTHS`.

```
  category-cold-chain-sm.avif        960x960   24.1 KB   was 720x720, 17.6 KB
  category-custom-boxes-sm.avif      960x960   30.8 KB   was 720x720, 19.5 KB
  category-pharmacy-formats-sm.avif  960x960   21.6 KB   was 720x720, 14.0 KB
```

The mobile picture keeps the drawn 1:1 rather than being re-cropped wider. That
is the only ratio the design gives for this thumb, and inventing a 16:9 for a
breakpoint the frame does not draw would be guessing at a design that exists.
Open question 98.

verify: 9 checks, 1133 assertions, 0 failures.

### Open questions

98. **The stacked cross-link picture is square.** Full width on a 390px phone
    makes it 358px tall, and the card about 480. The design draws no mobile
    frame for this band, and 1:1 is the ratio it gives for the thumb, so that
    is what shipped. A wider mobile crop is a design decision, not a fix.

96 stands. 97 closed in entry 81.

## 2026-10-18 — Entry 83. The home hero again, and the ladder's top rung comes back

Replaced on supply, second time today. The supplied file is 4224x2376, encoded
at 3840 — the ceiling of `WIDE_WIDTHS` — because nothing above that rung is
ever served and storing pixels no build will emit is weight in the repo for
nothing.

```
  this morning   4096 x 2304   170.7 KB   srcset ended 3840w
  midday         3072 x 1728   106.0 KB   srcset ended 3072w   top rung lost
  now            3840 x 2160   218.3 KB   srcset ends 3840w    restored
```

ENTRY 81 RECORDED THE LOST RUNG AS SOMETHING A WIDER FILE WOULD FIX, and this
is that file. The emitted ladder is back to 640 / 960 / 1280 / 1920 / 2560 /
3840, so a 4K display at 1x gets a true 3840 again rather than a 3072 stretched
into it. The cost is 112 KB on a picture that is `fetchpriority="high"` and
above the fold — paid knowingly: the rungs below are unchanged, so every device
that is not a 4K desktop downloads exactly what it did before.

The alt was re-read against the new photograph rather than carried over, which
is the rule entry 46 set. It survives unchanged this time — same line-up, same
arrangement, same products in the same places — so the string stands as
written. Recorded because "I checked and it still holds" and "I did not check"
produce identical diffs, and only one of them is the rule being followed.

verify: 9 checks, 1133 assertions, 0 failures.

## 2026-10-18 — Entry 84. The home hero, final frame

Supersedes entry 83's asset. Marked final on supply.

Same source dimensions as the frame it replaces (4224x2376) and the same
encode — 3840, the ceiling of `WIDE_WIDTHS` — so this is a swap of the
photograph and nothing else:

```
  entry 83   3840 x 2160   218.3 KB
  final      3840 x 2160   218.2 KB
```

The two source files are distinct renders (different hashes, 2 KB apart) of the
same composition, so the emitted ladder is unchanged at 640 / 960 / 1280 /
1920 / 2560 / 3840 and nothing downstream moves.

Alt re-read against the frame, per entry 46's rule, and unchanged again: the
same eleven products in the same places. Three hero swaps today, three reads,
one string — which is the point of the rule. It does not ask for a new
sentence, it asks that the sentence still be true.

verify: 9 checks, 1133 assertions, 0 failures.

## 2026-10-19 — Entry 85. Scroll reveals, wired at last, and the check that had to come with them

### Phase 1 wiring, not a new system

The reveal contract has been written since Phase 0 and dormant since: the CSS
in global.css §8, the `reveal` prop on Section, §12.2 and §12.3 in the spec.
What was missing was the three pieces Phase 1 was told to supply. They are
supplied.

1. **The scripting flag.** One blocking inline line in `<head>`, above every
   stylesheet and every deferred module. 56 B gzipped.
2. **The module.** `src/scripts/reveal.ts` — observes each group, sets one
   attribute when it arrives, unobserves it. 276 B gzipped.
3. **The opt-ins.** Twelve Sections across four templates.

THE GROUP/CHILD QUESTION, which the original CSS left loose. It described
itself as "[data-reveal] on the wrapper" with "children stagger via
[data-reveal-index]" — and those two cannot both be true. One element has one
transition-delay; a wrapper that animates itself cannot stagger anything inside
it. So the wrapper is the TRIGGER and its direct children are the subjects:

```css
  html.js [data-reveal-group] > *                      { hidden }
  html.js [data-reveal-group][data-reveal='in'] > *     { shown }
```

Every guarantee the original made is kept exactly — the same two properties
(§12.3 allows no others), the same spring tokens, the same 60ms step, visible
without JavaScript, visible under reduced motion.

THE DIRECTION OF THE GUARD IS THE SAFETY PROPERTY, and it is worth stating in
its own sentence. The hidden state is applied only under `html.js`. A page
without scripting never hides anything in the first place, rather than hiding
it and depending on something to put it back. The module cannot hide content;
it can only reveal it. There is no code path in which failing to load loses a
word.

### Where reveals were turned on, and where they were not

§12.2 says default off — "a page where everything animates in has no emphasis
left to spend" — so this is twelve Sections, not every Section:

```
  home        cards band, testimonial, closing plate
  category    the body (rows or rail), carousel, cross-links, closing plate
  product     every content section, closing plate
  products    the rail band, closing plate
```

NOT the heroes, on any template, and not the hero pictures. Two reasons and
both matter: they are above the fold, so there is no scroll to reveal them
with; and the hero picture is the LCP element on four page types, which is the
last thing that should start at `opacity: 0`. The hero standing still is also
what gives the bands below it something to contrast with.

Not `about` or `contact` either. Each is a single section above the fold, and
animating a contact form into existence is a cost with no benefit.

### The check, and what it found about every other check

A reveal works by hiding content and promising to put it back. Both halves are
invisible in source and silent when broken, which is the pointer regression's
shape exactly. So `reveal contract` presses all three states on every page that
has a group: scripting off, reduced motion, and a real read-through with each
group scrolled to in turn.

THE RED PATH WAS RUN, and the result is the argument for the check existing.
Removing the `html.js` guard makes every revealed element on eight pages paint
invisible with scripting off — and **nine of ten checks pass**. astro check,
the contrast matrix, dead classes, the JS census, build contracts, the
seven-width sweep, keyboard, pointer targets and axe-core all report green on a
site whose content has disappeared. axe has no opinion on an element at
`opacity: 0`; the sweep sees no overflow; every link still resolves.

The check's own first run failed on seven pages, correctly and for the wrong
reason: it jumped to the last group and then asserted all of them, and a group
the scroll skipped never intersects, which is how every reveal on the web
behaves. Fixed by reading the page the way a person does — each group scrolled
to in turn. That is the second time a new check here has caught its own probe
before it caught the code, and both times the §9 rule about running the red
path is what surfaced it.

### Measured

Per page: 56 B + 276 B = 332 B gzipped. The module inlines rather than hoisting
into a shared chunk, which is Astro's call for something this small and the
right one — a shared chunk would cost a round trip to save nothing. The census
line reads 13.7 KB "total shipped" against 9.7 KB before, and that number is
the SUM ACROSS PAGES, not what anyone downloads; no visitor fetches more than
332 B of this.

verify: 10 checks, 1183 assertions, 0 failures.

## 2026-10-19 — Entry 86. Reveals go per-element, heroes play on load, and Lenis arrives

### The reference was GSAP; this is not

Supplied as a worked example: a GSAP + ScrollTrigger + SplitText system from
another site, with the note that it shows how this should work. Taken as a
BEHAVIOURAL brief rather than a port. GSAP's three pieces are roughly 40 KB
gzipped against a site shipping 9.7 KB in total, and §12.4 sanctions
`motion/mini` only and says never a sitewide default. What the reference
demonstrates — hero on load, DOM-order cascade, media rising, no overshoot —
is all expressible in CSS driven by two numbers the module supplies.

ONE PIECE OF IT WAS NOT BUILT, and it is the one that genuinely needs a
library or a lot of code: SplitText's per-LINE reveal. Splitting a paragraph
into line boxes means measuring them, wrapping each in an element, and
re-splitting on every resize and font swap — and it freezes line breaks, which
is why the reference has to keep the splits in the DOM and revert them on
breakpoint change. Open question 99.

### Per-element, outermost match

The reveal now moves content primitives at any depth — headings, paragraphs,
standalone links, list items, pictures — rather than a Section's direct
children. `:not(:is(…) *)` keeps it to the outermost match in any branch, so a
link inside a paragraph arrives with the paragraph and a heading inside a card
arrives with the card. Without it a card fades in and then its own contents
fade in again inside it, which reads as a stutter.

The two horizontal scrollers are listed as items themselves, which means the
same rule excludes everything inside them. Eight carousel slides each fading
separately would fight the scroll position they sit in, and they already carry
an inline transform the carousel owns.

`.reveal-skip` opts a subtree out. A class and not an attribute because Media
forwards `class` and not arbitrary props, and the first thing that needed it
was a Media: the closing banner's backdrop photograph. Measured before and
after — backdrop fading with the copy, then holding still:

```
  before   img 0.96   h2 0.92   p 0.87   a 0.77
  after    img 1.00   h2 0.96   p 0.93   a 0.88
```

### Heroes play on load

`reveal="hero"` on a Section marks it `data-reveal-on="load"`: the module
reveals it once the fonts have settled instead of waiting for an intersection
that can never come for something already on screen. That also made `about`
and `contact` eligible, which entry 85 had to leave out — each is a single
section above the fold.

The hero PICTURE is still not revealed, on any template. It is the LCP element
on four page types, and an element that starts at `opacity: 0` is not painted,
so animating it would push LCP out by the length of the animation.

### Three bugs the measurements found

**Buttons snapped instead of easing.** Sampling the hero mid-flight at 500ms:
heading 0.97, paragraph 0.96, and both buttons 1.00 — the wrong way round.
Utilities outrank `@layer components`, so Button's own
`transition-[color,background-color,border-color,padding]` beat the reveal's
transition; the hiding still worked because nothing competes for `opacity`.
Fixed by moving the reveal rules OUTSIDE `@layer components` entirely —
unlayered beats every layer. The cascade then read 0.98 / 0.97 / 0.94 / 0.90,
monotonically trailing by index.

**And then the fix took the button's own colours with it.** `transition` is a
shorthand and replaces what was there, so the now-unlayered reveal removed the
colour easing from every button in a revealed section. Reported as "buttons
have no colour transition". The colour properties are listed in the reveal's
transition with the button's own 400ms timing, and `transition-delay` is given
per property so the stagger delays only the arrival — a delayed hover would
feel like the button ignoring the pointer.

**axe failed on contrast, correctly and uselessly.** Text at half opacity
genuinely fails contrast, and axe was sampling mid-fade: `color-contrast` on an
eyebrow at 390px that is perfectly legible once arrived. The check now drops
`js` before auditing, which shows everything with no transition — the exact
state the animation ends in. It audits the page people read rather than one
frame of it.

### The check caught its own hole, twice

Both of the reveal check's own probes were wrong before the code was:

- It failed any element whose `transform` was not `none`, which caught
  category-card photographs at their resting `scale(1.02)` and called them lost
  content. Opacity is the test; a transform is placement, not hiddenness.
- It flagged FAQ answers inside CLOSED disclosures, sixteen of them across the
  two longest product pages. Worth recording precisely: checking for a missing
  box does NOT catch these — `::details-content` leaves a collapsed answer with
  a client rect, so the obvious test passes it through. The disclosure's own
  state is the only honest question.

AND THE DRIFT DETECTOR DID NOT WORK, which only the red path showed. The item
list is written twice — once as a selector in global.css §8, once as a string
in reveal.ts — so the check asserts that everything the stylesheet hides was
numbered by the module. Dropping `p` from the module's list PASSED a full run:
the sample was taken after the read-through, by which point every group had
arrived, nothing was hidden, and an empty set trivially contains no unindexed
members. Moved to a fresh load before anything is scrolled to. The same
injection now fails on eight pages naming the element.

Red paths, both confirmed:

```
  html.js guard removed       8 pages, 14–28 elements each, scripting off
  module list drifts (p)      8 pages, named per element
```

### Lenis

Added on instruction. It is the largest script on the site and the entry says
so: native scrolling is correct, interruptible, accessible and free, and this
replaces its feel. 9.7 KB of JavaScript to 16.2 KB, recorded rather than
buried.

It never starts under `prefers-reduced-motion` — smoothing a scroll is adding
motion to a gesture the reader controls, which is what §12.3 forbids. Not
slowed, never constructed. `syncTouch` stays off so a finger keeps the
platform's own physics. The carousel and the product rail carry
`data-lenis-prevent`, and `scroll-behavior: smooth` is switched off under
`html.lenis` because two smoothing systems on one scroll fight.

ON DEFAULTS, and the absence of `duration` is the setting. The first version
passed `duration: 0.9`, which switches Lenis out of its default lerp mode into
a fixed-length tween — every wheel tick then takes the same time regardless of
distance, which is what made it feel slow and heavy. Reported as exactly that.
The default lerp follows the wheel rather than scheduling against it.

### The button's square mark is gone

Removed on instruction: hover is a colour change and nothing else.

IT WAS NEVER ONLY A DECORATION, which is why this is a net simplification. The
mark needed `position: relative` on its button — the single property that once
made every button the containing block for `.category-card-link::after` and
killed the whole-card hit area on nine cards. It needed `padding` in the
button's transition list, a layout property animated deliberately. And it
needed an asymmetric hover padding pair. All three went with it, and `pointer
targets` confirms the hit areas are unaffected.

verify: 10 checks, 1199 assertions, 0 failures.

### Open questions

99. **No per-line text reveal.** The reference splits headings and paragraphs
    into line boxes and staggers the lines. It needs measurement, element
    wrapping, and a re-split on every resize and font swap, and it freezes line
    breaks until reverted. Worth doing deliberately or not at all.

96 and 98 stand.
