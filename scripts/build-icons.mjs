#!/usr/bin/env node
// Generates the site's icons and share image into public/, from the brand
// sources in src/assets/brand/.
//
// SAME PATTERN AS scripts/subset-fonts.py: a committed script produces a
// committed artifact, and the artifact ships. Not a build-time integration —
// these four files change when the brand changes, which is roughly never, and a
// build step that runs on every deploy to produce identical bytes is machinery
// earning nothing. Run it by hand when a source changes:
//
//     node scripts/build-icons.mjs
//
// WHY public/ AND NOT src/assets/. Everything under src/assets gets a
// fingerprinted filename. These need STABLE paths: a browser requests
// /favicon.ico on its own, iOS requests /apple-touch-icon.png on its own, and
// neither asks the HTML first. public/ copies verbatim to the site root.
//
// `sharp` is Astro's own image dependency, already in node_modules — this adds
// nothing to the tree, and nothing here ships to a browser.

import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const SRC = 'src/assets/brand';
const OUT = 'public';

/**
 * THE TWO SOURCE SVGs ARE ONE PATH AND TWO FILLS. The badge is a solid square
 * with the arrow knocked OUT of it — a hole, not a second shape — so whatever
 * is behind the icon shows through the arrow. `centipack-icon-dark.svg` fills
 * the square #1F1F1F; the light one fills it white. Nothing else differs, which
 * is why one path is extracted here and re-coloured rather than both files
 * being carried through.
 */
const light = readFileSync(join(SRC, 'centipack-icon-light.svg'), 'utf8');
const dark = readFileSync(join(SRC, 'centipack-icon-dark.svg'), 'utf8');

const pathOf = (svg) => /<path[^>]*\sd="([^"]+)"/.exec(svg)?.[1];
const viewBoxOf = (svg) => /viewBox="([^"]+)"/.exec(svg)?.[1];

const d = pathOf(dark);
const viewBox = viewBoxOf(dark);
if (!d || !viewBox) throw new Error('build-icons: could not read the path or viewBox from the source SVG');
if (pathOf(light) !== d) {
  throw new Error(
    'build-icons: the light and dark sources are no longer the same path.\n' +
      'They were identical geometry differing only in fill, which is the assumption\n' +
      'favicon.svg is built on. Re-check the sources before trusting this script.',
  );
}

mkdirSync(OUT, { recursive: true });

/* --- favicon.svg ----------------------------------------------------------
   ONE FILE THAT ANSWERS BOTH THEMES. A `media` attribute on <link rel="icon">
   is not reliably honoured, so the switch lives INSIDE the SVG as a
   prefers-color-scheme rule — which Chrome, Firefox and Safari all apply to an
   SVG favicon.

   Dark ink by default, because a browser in light mode draws a light tab strip;
   white under a dark scheme. The arrow is a hole in both, so it takes the tab's
   own colour rather than needing a second fill. */
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">
  <style>
    path { fill: #1F1F1F }
    @media (prefers-color-scheme: dark) { path { fill: #FFFFFF } }
  </style>
  <path d="${d}"/>
</svg>
`;
writeFileSync(join(OUT, 'favicon.svg'), faviconSvg);

/**
 * The raster icons, which CANNOT adapt and cannot be transparent.
 *
 * iOS composites an apple-touch-icon onto its own rounded square and renders
 * ALPHA AS BLACK, so a transparent arrow would come out as a black arrow on a
 * dark square — the mark, invisible. Flattening onto white fills the knockout
 * instead, giving a dark badge with a white arrow: the same thing the lockup
 * draws on a light ground, and legible on a light or a dark tab strip.
 *
 * The badge's own corner radius is ~2.6% of its width. iOS masks at ~22%, so
 * the four white slivers flattening leaves in the corners are cropped away
 * before anyone sees them; at 32px they are sub-pixel.
 */
const opaque = (svg, size) =>
  sharp(Buffer.from(svg))
    .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .flatten({ background: '#FFFFFF' })
    .png({ compressionLevel: 9 })
    .toBuffer();

writeFileSync(join(OUT, 'apple-touch-icon.png'), await opaque(dark, 180));

/* --- favicon.ico ----------------------------------------------------------
   sharp does not write ICO, and neither does sips. An ICO is a 6-byte header, a
   16-byte directory entry and then the image — and since Vista that image may
   be a PNG verbatim, which is what every modern browser reads. So the container
   is written here rather than adding a dependency to produce 22 bytes of it.

   32x32: the size a browser actually renders in a tab. The multi-resolution ICO
   is a Windows-desktop-shortcut concern this site does not have. */
const icoPng = await opaque(dark, 32);
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: 1 = icon
header.writeUInt16LE(1, 4); // one image
const entry = Buffer.alloc(16);
entry.writeUInt8(32, 0); // width
entry.writeUInt8(32, 1); // height
entry.writeUInt8(0, 2); // palette size: 0 = not paletted
entry.writeUInt8(0, 3); // reserved
entry.writeUInt16LE(1, 4); // colour planes
entry.writeUInt16LE(32, 6); // bits per pixel
entry.writeUInt32LE(icoPng.length, 8); // bytes of image data
entry.writeUInt32LE(22, 12); // offset: 6 + 16
writeFileSync(join(OUT, 'favicon.ico'), Buffer.concat([header, entry, icoPng]));

/* --- the share image ------------------------------------------------------
   Copied rather than re-encoded. It is already 1200x630, which is the size
   BaseLayout writes into og:image:width/height, and re-compressing a PNG
   somebody exported deliberately is a way to lose something for nothing. */
const og = readFileSync(join(SRC, 'centipack-OpenGraph.png'));
const meta = await sharp(og).metadata();
if (meta.width !== 1200 || meta.height !== 630) {
  throw new Error(
    `build-icons: the share image is ${meta.width}x${meta.height}, and BaseLayout ` +
      'declares og:image:width 1200 and height 630. Either re-export at 1200x630, ' +
      'or make those meta tags derive from the file.',
  );
}
writeFileSync(join(OUT, 'og-default.png'), og);

const report = [
  ['favicon.svg', faviconSvg.length],
  ['favicon.ico', 22 + icoPng.length],
  ['apple-touch-icon.png', (await opaque(dark, 180)).length],
  ['og-default.png', og.length],
];
for (const [name, bytes] of report) console.log(`  ${name.padEnd(24)} ${bytes} B`);
