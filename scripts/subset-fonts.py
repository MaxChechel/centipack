#!/usr/bin/env python3
"""Subset the project's web fonts to the codepoints it actually renders (§7).

A stock woff2 from a foundry or Google Fonts typically carries 600+ codepoints,
most of them Greek, Cyrillic and Vietnamese that a English-language marketing
site never draws. Subsetting to Latin is routinely a 60-70% saving on a file that
sits in the critical path, and it costs nothing but this script.

ONLY THE WEIGHTS ACTUALLY APPLIED get subset. A face nobody references is a face
nobody should download; if a weight is not in FACES it does not ship, and if a
rule wants it, add it here deliberately.

CENTIPACK SHIPS ONE PARTIAL VARIABLE FACE, AND THAT IS A MEASUREMENT.
DM Sans is a two-axis variable font (opsz 9-40, wght 100-1000). The design
applies three weights — 400, 500 and 700 — all at opsz 14. Two ways to ship
that, both built and weighed:

    three static instances, subset  12,712 + 12,912 + 12,960 = 38,584 B
    one partial variable, subset                               21,764 B

44% smaller in one request instead of three, so the variable face wins. §7's
"only the weights the design applies" is honoured by the `axes` limit below
rather than by the file count: opsz is PINNED at 14 (the axis disappears from
fvar entirely, so no CSS anywhere has to remember to set it) and wght is CLIPPED
to 400-700, so nothing lighter or heavier exists in the file to be reached for.

    PROJECT: drop source files in src/assets/fonts/source/, list them in FACES,
    then declare the OUTPUT files in astro.config.mjs's `fonts` block.

Requires fonttools + brotli, kept out of package.json because this is a build-time
authoring tool, not a dependency of the site:

    python3 -m venv .venv && .venv/bin/pip install fonttools brotli
    .venv/bin/python scripts/subset-fonts.py
"""

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src" / "assets" / "fonts" / "source"
OUT = ROOT / "src" / "assets" / "fonts"

# The Google Fonts "latin" unicode-range. Covers ASCII plus the punctuation real
# copy uses — the en/em dashes, the curly apostrophe, the middot — which is what
# a naive "ASCII only" subset drops and nobody notices until a dash renders as a
# fallback glyph mid-heading.
#
# CentiPack's copy adds two beyond that range, and both are load-bearing rather
# than decorative: U+00B0 DEGREE SIGN is inside the base Latin-1 block already,
# and U+2013/U+2014 are inside U+2000-206F — so "2-8°C" and every em-dashed
# sentence in the locked copy are covered without widening it.
UNICODES = (
    "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,"
    "U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,"
    "U+2212,U+2215,U+FEFF,U+FFFD"
)

# PROJECT: the faces this site applies.
#
# `source` is the filename without extension; `out` is the basename this writes;
# `axes` is the fonttools instancer limit applied BEFORE subsetting — a bare
# number pins an axis (and drops it from fvar), a `min:max` pair clips it and
# keeps it variable. An empty `axes` means the source is already static.
FACES: list[dict] = [
    {
        "source": "DMSans[opsz,wght]",
        "out": "DMSans",
        # opsz pinned at 14: every type style in the Figma file is drawn at
        # `fontVariationSettings: "opsz" 14`, so the axis is a constant here and
        # baking it means no stylesheet has to carry it.
        "axes": {"opsz": "14", "wght": "400:700"},
    },
]


def main() -> int:
    if not FACES:
        print("subset-fonts: FACES is empty — nothing to do. Edit this script first.")
        return 0
    if not SRC.is_dir():
        print(f"subset-fonts: no source directory at {SRC.relative_to(ROOT)}")
        return 1

    OUT.mkdir(parents=True, exist_ok=True)
    done = 0
    for face in FACES:
        name = face["source"]
        source = next((SRC / f"{name}{ext}" for ext in (".woff2", ".ttf", ".otf")
                       if (SRC / f"{name}{ext}").exists()), None)
        if source is None:
            print(f"  MISSING  {name} — expected {SRC.relative_to(ROOT)}/{name}.(woff2|ttf|otf)")
            return 1

        # Instance first, subset second. The other order works but wastes time:
        # the subsetter would carry every master's deltas through, and the
        # instancer would then throw most of them away.
        staged = source
        axes = face.get("axes") or {}
        if axes:
            staged = OUT / f"{face['out']}.instanced.ttf"
            subprocess.run(
                [sys.executable, "-m", "fontTools.varLib.instancer", str(source),
                 *[f"{axis}={limit}" for axis, limit in axes.items()],
                 "-o", str(staged)],
                check=True, stdout=subprocess.DEVNULL,
            )

        target = OUT / f"{face['out']}.subset.woff2"
        subprocess.run(
            [sys.executable, "-m", "fontTools.subset", str(staged),
             f"--unicodes={UNICODES}",
             "--layout-features=kern,liga,calt",
             "--flavor=woff2",
             "--desubroutinize",
             f"--output-file={target}"],
            check=True,
        )
        if staged != source:
            staged.unlink()

        before, after = source.stat().st_size, target.stat().st_size
        saved = 100 - round(after / before * 100)
        axis_note = f"  [{', '.join(f'{a}={l}' for a, l in axes.items())}]" if axes else ""
        print(f"  {face['out']}: {before:,} B -> {after:,} B  ({saved}% smaller){axis_note}")
        done += 1

    print(f"subset-fonts: {done} face(s) subset into {OUT.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
