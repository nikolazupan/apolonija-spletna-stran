#!/usr/bin/env node
// Adds one Instagram post (@skupajzamesto) to the posts collection.
//
//   npm run objava -- --url https://www.instagram.com/p/ABC123/ --datum 2026-10-24 --tip grafika \
//                     --opis "Caption text …" --slika /path/to/first-image.jpg
//
//   --url     permalink of the post (instagram.com/p/…, /reel/… or /tv/…)
//   --datum   publication date, YYYY-MM-DD (or a full ISO timestamp)
//   --tip     grafika | fotografija | video | reel | carousel
//   --opis    the caption; only its first non-empty line is kept
//   --slika   the first image (for reels/videos: the cover or a screenshot of it)
//   --force   overwrite an existing entry for the same post
//
// Writes:
//   src/assets/objave/<datum>-<shortcode>.jpg   web version: max 2400 px, JPEG 82, EXIF-rotated, no metadata
//   src/content/objave/<datum>-<shortcode>.md   the post entry
// The first real post also removes all placeholder posts (entries with `osnutek: true`)
// and their stand-in image.

import { existsSync } from 'node:fs';
import { readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import sharp from 'sharp';

const root = new URL('..', import.meta.url).pathname;
const VSEBINA = join(root, 'src/content/objave');
const SLIKE = join(root, 'src/assets/objave');
const TIPI = ['grafika', 'fotografija', 'video', 'reel', 'carousel'];

const { values: a } = parseArgs({
  options: {
    url: { type: 'string' },
    datum: { type: 'string' },
    tip: { type: 'string' },
    opis: { type: 'string' },
    slika: { type: 'string' },
    force: { type: 'boolean', default: false },
  },
});

const napaka = (msg) => {
  console.error(`Napaka: ${msg}`);
  process.exit(1);
};
const koda = a.url?.match(/instagram\.com\/(?:[\w.]+\/)?(p|reel|tv)\/([\w-]+)/)?.[2];
if (!koda) napaka('--url must be an Instagram post link (…/p/CODE/ or …/reel/CODE/)');
if (!a.datum || Number.isNaN(Date.parse(a.datum))) napaka('--datum must be a date, e.g. 2026-10-24');
if (!TIPI.includes(a.tip)) napaka(`--tip must be one of: ${TIPI.join(', ')}`);
if (!a.slika || !existsSync(a.slika)) napaka('--slika must be an existing image file');
const opis = (a.opis ?? '').split('\n').map((l) => l.trim()).find(Boolean);
if (!opis) napaka('--opis (caption) is empty');

const dan = new Date(a.datum).toISOString().slice(0, 10);
const ime = `${dan}-${koda}`;
const md = join(VSEBINA, `${ime}.md`);
const jpg = join(SLIKE, `${ime}.jpg`);
if (existsSync(md) && !a.force) napaka(`${ime}.md already exists (use --force to overwrite)`);

// canonical permalink without tracking parameters
const povezava = `https://www.instagram.com/${a.url.includes('/reel/') ? 'reel' : 'p'}/${koda}/`;

const info = await sharp(a.slika)
  .rotate()
  .resize({ width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true })
  .toColourspace('srgb')
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile(jpg);

const q = (s) => JSON.stringify(s);
await writeFile(
  md,
  `---
datum: ${a.datum.length > 10 ? a.datum : dan}
tip: ${a.tip}
platforma: instagram
povezava: ${q(povezava)}
opis: ${q(opis)}
slika: ${q(`@assets/objave/${ime}.jpg`)}
---
`,
);
console.log(`Dodano: src/content/objave/${ime}.md`);
console.log(`Slika:  src/assets/objave/${ime}.jpg (${info.width}×${info.height}, ${Math.round(info.size / 1024)} KB)`);

// first real post: remove the placeholder posts and the stand-in image they use
const odstranjene = [];
for (const f of await readdir(VSEBINA)) {
  if (!f.endsWith('.md')) continue;
  const besedilo = await readFile(join(VSEBINA, f), 'utf8');
  if (/^osnutek:\s*true\s*$/m.test(besedilo)) {
    await rm(join(VSEBINA, f));
    odstranjene.push(f);
  }
}
if (odstranjene.length) {
  await rm(join(SLIKE, 'primer-plakat.jpg'), { force: true });
  console.log(`Odstranjene nadomestne objave (${odstranjene.length}): ${odstranjene.join(', ')}`);
}
