/**
 * The v1 product pages' icon set, as data.
 *
 * A MODULE RATHER THAN THE COMPONENT'S FRONTMATTER, and the reason is a bug
 * rather than tidiness: Astro HOISTS `export` statements out of a component's
 * frontmatter, so `export const ICON_NAMES = Object.keys(ICONS)` written below
 * `const ICONS = {...}` evaluated FIRST and the build died with "ICONS is not
 * defined" — while `astro check` was perfectly happy, because the error is an
 * ordering fact about the emitted module and not a type. Frontmatter is not a
 * module scope, and anything exported from one must not depend on anything
 * declared beside it.
 *
 * So the data lives here, Icon.astro renders it, and the build contract that
 * checks this list against the schema's icon enum imports it without having to
 * load a component.
 *
 * FIFTEEN LUCIDE MARKS, INLINE, AND NO DEPENDENCY. The design names each one by
 * its lucide layer (`lucide/package`), so these are lucide's own paths at
 * lucide-static 0.544.0 — copied in rather than installed, because what is
 * actually needed is fifteen path strings and the package is sixteen hundred
 * files. Dependencies are default no (§6); this is what "no" looks like when
 * the asset is still wanted.
 *
 * lucide — ISC License. Portions are held by Cole Bemis 2013-2022 as part of
 * Feather (MIT); all other copyright is held by Lucide Contributors 2022.
 */
export type IconName =
  | 'box'
  | 'droplets'
  | 'expand'
  | 'feather'
  | 'layers'
  | 'leaf'
  | 'lock-keyhole'
  | 'package'
  | 'repeat'
  | 'shield'
  | 'sparkles'
  | 'target'
  | 'thermometer-snowflake'
  | 'truck'
  | 'zap';

/**
 * One drawing primitive. Typed rather than held as an HTML string: `set:html`
 * on a literal would push unescaped markup through a prop, and a typed list is
 * something the compiler can check.
 */
export type Shape =
  | { d: string }
  | { circle: [cx: number, cy: number, r: number] }
  | { rect: [x: number, y: number, w: number, h: number, rx: number] }
  | { points: string };

export const ICONS: Record<IconName, readonly Shape[]> = {
  box: [
    { d: 'M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z' },
    { d: 'm3.3 7 8.7 5 8.7-5' },
    { d: 'M12 22V12' },
  ],
  droplets: [
    { d: 'M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z' },
    { d: 'M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97' },
  ],
  expand: [
    { d: 'm15 15 6 6' },
    { d: 'm15 9 6-6' },
    { d: 'M21 16v5h-5' },
    { d: 'M21 8V3h-5' },
    { d: 'M3 16v5h5' },
    { d: 'm3 21 6-6' },
    { d: 'M3 8V3h5' },
    { d: 'M9 9 3 3' },
  ],
  feather: [
    { d: 'M12.67 19a2 2 0 0 0 1.416-.588l6.154-6.172a6 6 0 0 0-8.49-8.49L5.586 9.914A2 2 0 0 0 5 11.328V18a1 1 0 0 0 1 1z' },
    { d: 'M16 8 2 22' },
    { d: 'M17.5 15H9' },
  ],
  layers: [
    { d: 'M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z' },
    { d: 'M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12' },
    { d: 'M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17' },
  ],
  leaf: [
    { d: 'M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z' },
    { d: 'M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12' },
  ],
  'lock-keyhole': [
    { circle: [12, 16, 1] },
    { rect: [3, 10, 18, 12, 2] },
    { d: 'M7 10V7a5 5 0 0 1 10 0v3' },
  ],
  package: [
    { d: 'M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z' },
    { d: 'M12 22V12' },
    { points: '3.29 7 12 12 20.71 7' },
    { d: 'm7.5 4.27 9 5.15' },
  ],
  repeat: [
    { d: 'm17 2 4 4-4 4' },
    { d: 'M3 11v-1a4 4 0 0 1 4-4h14' },
    { d: 'm7 22-4-4 4-4' },
    { d: 'M21 13v1a4 4 0 0 1-4 4H3' },
  ],
  shield: [
    { d: 'M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z' },
  ],
  sparkles: [
    { d: 'M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z' },
    { d: 'M20 2v4' },
    { d: 'M22 4h-4' },
    { circle: [4, 20, 2] },
  ],
  target: [{ circle: [12, 12, 10] }, { circle: [12, 12, 6] }, { circle: [12, 12, 2] }],
  'thermometer-snowflake': [
    { d: 'm10 20-1.25-2.5L6 18' },
    { d: 'M10 4 8.75 6.5 6 6' },
    { d: 'M10.585 15H10' },
    { d: 'M2 12h6.5L10 9' },
    { d: 'M20 14.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0z' },
    { d: 'm4 10 1.5 2L4 14' },
    { d: 'm7 21 3-6-1.5-3' },
    { d: 'm7 3 3 6h2' },
  ],
  truck: [
    { d: 'M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2' },
    { d: 'M15 18H9' },
    { d: 'M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14' },
    { circle: [17, 18, 2] },
    { circle: [7, 18, 2] },
  ],
  zap: [
    { d: 'M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z' },
  ],
};
/** Exported for the build contract that asserts this map and the enum agree. */
export const ICON_NAMES = Object.keys(ICONS) as IconName[];
