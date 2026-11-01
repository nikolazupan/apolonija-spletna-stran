#!/usr/bin/env node
// Turns the poster print PDFs into images for /arhiv ("Plakati").
//
//   source (print files, not in git): podatki/plakati/*.pdf
//   download (served as is):          public/plakati/<slug>.jpg      long edge 3000 px, JPEG 86
//   preview (optimised by Astro):     src/assets/plakati/<slug>.jpg  long edge 1600 px, JPEG 82
//
// Each PDF's first page is rendered with macOS `sips`, then cropped to the TrimBox (removes crop marks
// and bleed), converted to sRGB and stripped of metadata with sharp. macOS only (needs `sips`).
// New poster: put the PDF in podatki/plakati/, add it to PLAKATI below (and to
// src/content/plakati/plakati.yaml for its title), then run `npm run plakati`.

import { execFileSync } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sharp from 'sharp';

const root = new URL('..', import.meta.url).pathname;
const SRC = join(root, 'podatki/plakati');
const DOWNLOAD = join(root, 'public/plakati');
const PREVIEW = join(root, 'src/assets/plakati');

// PDF file (starts with its number) → name on the site, from the poster's slogan.
// The billboard location in the PDF name is never used on the site.
const PLAKATI = {
  '1.': 'naj-ljubljana-spet-stece',
  '2.': 'koncajmo-trgovalni-urbanizem',
  '3.': 'zascitimo-plecnikov-stadion',
  '4.': 'cas-je-da-odlocamo-skupaj',
  '5.': 'glas-civilne-druzbe-v-mestnem-svetu',
  '6.': 'stanovanje-je-pravica',
  '7.': 'vec-dreves-vec-zivljenja',
  '8.': 'cista-voda-varna-prihodnost',
  '9.': 'manj-odpadkov-vec-prihodnosti',
  '10.': 'zascitimo-mesto-pred-slabimi-projekti',
  '11.': 'zascitimo-mesto-pred-prostorskim-nasiljem',
  '12.': 'zascitimo-reko',
  '13.': 'zascitimo-trznico',
};

const RENDER = 4000; // px, long edge of the rendered page before cropping

// first number of a PDF box, e.g. /TrimBox[21.0 21.0 1449.66 684.307]
const box = (pdf, name) => {
  const m = pdf.match(new RegExp(`/${name}\\s*\\[\\s*([\\d.]+)\\s+([\\d.]+)\\s+([\\d.]+)\\s+([\\d.]+)\\s*\\]`));
  return m ? m.slice(1, 5).map(Number) : null;
};

await mkdir(DOWNLOAD, { recursive: true });
await mkdir(PREVIEW, { recursive: true });
const tmp = await mkdtemp(join(tmpdir(), 'plakati-'));
const { readdir } = await import('node:fs/promises');
const files = (await readdir(SRC)).filter((f) => f.toLowerCase().endsWith('.pdf'));

for (const f of files.sort((a, b) => parseInt(a) - parseInt(b))) {
  const slug = PLAKATI[f.match(/^\d+\./)?.[0] ?? ''];
  if (!slug) {
    console.log(`Skipped (not in PLAKATI): ${f}`);
    continue;
  }
  const pdf = (await readFile(join(SRC, f))).toString('latin1');
  const media = box(pdf, 'MediaBox');
  const trim = box(pdf, 'TrimBox') ?? media;
  const png = join(tmp, `${slug}.png`);
  execFileSync('sips', ['-s', 'format', 'png', '-Z', String(RENDER), join(SRC, f), '--out', png], { stdio: 'ignore' });

  const { width, height } = await sharp(png).metadata();
  const sx = width / (media[2] - media[0]);
  const sy = height / (media[3] - media[1]);
  // PDF y runs upwards; image y downwards
  const crop = {
    left: Math.round((trim[0] - media[0]) * sx),
    top: Math.round((media[3] - trim[3]) * sy),
    width: Math.round((trim[2] - trim[0]) * sx),
    height: Math.round((trim[3] - trim[1]) * sy),
  };
  const base = () => sharp(png).extract(crop).toColourspace('srgb').flatten({ background: '#ffffff' });
  const dl = await base().resize({ width: 3000, height: 3000, fit: 'inside' }).jpeg({ quality: 86, mozjpeg: true }).toFile(join(DOWNLOAD, `${slug}.jpg`));
  await base().resize({ width: 1600, height: 1600, fit: 'inside' }).jpeg({ quality: 82, mozjpeg: true }).toFile(join(PREVIEW, `${slug}.jpg`));
  console.log(`${f}  →  ${slug}.jpg  (${dl.width}×${dl.height}, ${Math.round(dl.size / 1024)} KB)`);
}
await rm(tmp, { recursive: true, force: true });
