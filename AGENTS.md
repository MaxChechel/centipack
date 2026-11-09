# Agent operating contract

For any agent working in this repo or in a project copied from it. It points at
the rules; it does not restate them.

## Which mode you are in

**Editing mode is the default.** If you are working for CentiPack's team (changing
copy, products, FAQs, images), follow **Editing mode** below and nothing else in
this file applies to you. **Build mode** (every section after Editing mode) is
for Outredge developers only, and only when the human says so explicitly.

## Editing mode

The site is edited through pull requests. You never publish anything: a person
reviews the preview and merges.

### What you may change

- `src/content/products/*.md` and `src/content/categories/*.md`: every field is
  checked by the schema in `src/content.config.ts`. Read the comment above a
  field before writing it; the comments explain what each field is for and
  where it appears.
- `src/content/pages/*.md`: the words on Home, About, Contact, the products
  index and the 404 page (each has a `route`), and any page you add (it has a
  `slug`; see `pages` in the schema). Sections come from
  `src/schema/sections.ts`.
- `src/content/site/site.md`: words every page shares, the email address, and
  the hand-made menu links.
- `src/content/redirects.yaml`: old URLs and where they go now.
- New or replaced pictures under `src/assets/` (products, categories, home,
  about, shared, posters, clients), referenced from content.

Everything else is a developer change: components, styles, scripts, pages under
`src/pages/`, `src/data/`, `src/lib/`, config, `package.json`, `.github/`, and
the verify harness. If a request needs any of those, do not attempt it. Say
plainly that it needs a developer and what would have to change. CI enforces
this (`scripts/verify/edit-scope.mjs`), so a PR that drifts will fail anyway.

### How to make a change

1. Branch from `main` as `claude/<short-description>`.
2. Make the smallest change that does what was asked.
3. Run `npm run verify` if your environment can run it. If it cannot (no
   Chrome, no Node), say so; CI runs it on the PR either way.
4. Commit, push the branch, and open a PR. In the description, say what changed
   in plain words, list the pages affected, and link the preview once the host
   posts it.
5. Never push to `main`, never merge your own PR, and never change a check to
   make it pass. If verify fails, the content is wrong: fix the content.

### Content rules

- **Copy in `src/content/` is the source of truth; it may differ from Figma.**
- **The schema is strict on purpose.** An unknown or misspelled key fails the
  build. Do not add keys; if something has no field, it needs a developer.
- **`slug` is a field, not the file name.** Never change a live slug without
  being asked: it changes the URL.
- **A product page exists only when it has `sections`.** A product with no
  sections shows its name without a link. That is the launch gate, not a bug.
- **Every picture needs `alt`** that describes what is actually in that picture.
  Re-read it whenever the picture changes.
- **Do not invent claims.** Thermal performance, temperature ranges, durations,
  certifications, compliance, materials and prices come from the CentiPack team
  only. If the request needs one you were not given, ask.
- Keep names consistent with the rest of the site (for example "PuncturePack™"
  as a page heading, "Puncture Pack" in menus, as the existing entries do).

### What not to read

Skip `WORKLOG.md`, `TEMPLATE-NOTES.md` and `AUDIT.md` for content edits. They
are the build history, they are long, and they do not change how content is
written. `src/content.config.ts` and the existing entries are all you need.

# Build mode (Outredge developers only)

## The spec is law

**[ARCHITECTURE.md](ARCHITECTURE.md) governs.** Read it before proposing anything
structural. Where this file and the spec disagree, the spec wins. A project that
needs to deviate records the deviation in its own `AUDIT.md` with a reason; it
does not edit the spec in place — the canonical copy is the outredge-system
template.

## Verification

**`npm run verify` must pass before any phase gate.** It is the gate, not a
formality.

**Never weaken a check to make it pass.** Widening an allowlist, lowering a
threshold, deleting an assertion or narrowing a page list to get to green is
falsifying the result. If a check is wrong, say so and argue it; if the code is
wrong, fix the code.

**Any new check must demonstrate its own failure mode before it counts** (§9):
inject the fault it exists to catch, watch it fail with a legible message and a
non-zero exit, revert. A check whose red path has never run is an assertion about
the harness, not about the code. A check that cannot be made to fail does not
belong in the suite — say so and remove it rather than leaving an unfalsifiable
green line in the report.

**Read built output, not source.** Most of what this system has got wrong was
invisible in source and obvious in `dist/`. §2's thesis is that the compiler's
reality outranks the documentation in your head.

## Phase discipline

Work is phase-gated. **Stop at each gate and report. Only the human closes a
phase.** Do not start the next phase because the current one went well.

Deliver the whole scope of the phase you were given, and no more. If part of it
turns out to be blocked, finish everything else and say plainly what you left and
why — scaling the work down is the human's call.

## WORKLOG.md

**Append-only.** Never edit or delete an earlier entry; a correction is a new
entry that supersedes the old one. Record decisions with their reasoning, bugs
with their root cause, measured numbers, and numbered open questions. Deviations
from an instruction are recorded as deviations, not quietly absorbed.

## Never touch

- **DNS, hosting dashboards, accounts, signups, billing, domain registrars.**
  These are named human punch-list items. Do not attempt them, and do not ask for
  credentials.
- **Secrets.** Keys live in the environment. Nothing secret enters this repo, in
  any file, ever.
- **Reference repositories** (`../` siblings supplied as prior art). Read-only,
  always, unless the human explicitly instructs otherwise for a specific file.
- **`git push`, tags, releases, and history rewrites** without being asked.

## Scope

- Dependencies are **default no**. Each one is justified in the commit that adds
  it.
- Every script is a ruling, not a habit (§6). New JavaScript is declared in the
  census with a reason and a budget before it ships.
- Build what the work requires. Do not invent components, tokens or abstractions
  ahead of a demonstrated need (§4.2, §4.5).
