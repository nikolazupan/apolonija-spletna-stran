# Risbe (hand-drawn marks)

Each hand-made mark on the site is one SVG file here. They are rendered inline by
`src/components/brand/Risba.astro`, so they take the color from the page.

| File | Where it's used |
|---|---|
| `poteza.svg` | crayon stroke before "Apolonija" (`CandidateMark`, optional; switched off in the homepage hero) |
| `krog.svg` | hand-drawn circle around the ballot number 6 and the "?" in the Q&A heading |
| `podcrta.svg` | underline under the current item in the desktop menu |
| `puscica.svg` | arrow (currently unused, kept for later pages) |

The current files are vector redraws of the print marks. A rough edge is added by the
`#risba-grobo` filter in `BaseLayout.astro` (turn it off per use with `rough={false}`).

## Replacing a file with a scanned drawing

1. Scan the drawing, vectorize it (e.g. Illustrator Image Trace, Inkscape Trace Bitmap).
2. Use `fill="currentColor"` (filled shapes) or `stroke="currentColor"` (lines), no fixed colors,
   so the site can color it.
3. Keep `preserveAspectRatio="none"` if the mark should stretch to its box (underline, circle);
   remove it if the drawing must keep its proportions.
4. Save it under the same file name. No code changes needed.
5. A scan already has its own rough edge: pass `rough={false}` in the component if the filter
   makes it look doubled.
