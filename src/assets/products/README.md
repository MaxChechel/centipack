# Product images

Drop product photographs here. One file per slot, named for the product's slug.

```
src/assets/products/gel-packs.jpg
src/assets/products/insulated-metallic-mailers.jpg
```

Then point the product's markdown at it — the path is relative to
`src/content/products/`, which is two levels up:

```yaml
---
title: "Gel packs"
slug: gel-packs
category: cold-chain-shipping
order: 1
summary: "3–32 oz · 4 variants"
images:
  main:
    src: ../../assets/products/gel-packs.jpg
    alt: >-
      A stack of gel packs beside an open EPS cooler.
---
```

The card swaps from the dashed `[ image pending ]` box to the photograph on the
next build. Nothing else needs touching.

## Rules

**`alt` is required.** The schema enforces it, so a build with an image and no
alt text fails rather than shipping an unlabelled photograph. Describe what is
in the shot, not the product name — the title is already next to it.

**Supply at least 1760px wide.** Cards render the image at 880px and the browser
asks for 2x on a retina screen. Astro converts to WebP and writes the width and
height into the HTML itself; do not pre-convert or resize.

**The card crop is 4:3, centred.** Anything important near the top or bottom edge
gets cut. The product page uses the same file.

**Check the edges of a Figma export.** Three category images shipped with the
design's dashed placeholder frame baked into the top and bottom two rows of
pixels — it reads on the page as a dashed hairline and looks exactly like a CSS
bug. If the artwork sits inside a frame with a stroke in Figma, export the image
node itself, not the frame. See WORKLOG entry 12.

## The other two slots

`content.config.ts` also allows `images.sizeRange` and `images.branded`, from the
client's three-slot image plan. **Nothing renders them yet** — there is no
gallery on the product page — so supplying them now has no visible effect. Ask
before shooting them, or they sit in the repo unused.

## Not here

| | |
| --- | --- |
| Category card and range-header shots | `src/assets/categories/` |
| Home page hero and the volume collage | `src/assets/home/` |
| The closing CTA band | `src/assets/shared/` |
