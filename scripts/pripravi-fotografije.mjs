#!/usr/bin/env node
// Creates web versions of the campaign photos.
//
//   originals (camera files, not in git): podatki/fotografije-originali/ and its {kandidati,skupinske}/
//   web versions (in git, used by the site): src/assets/fotografije/ and {kandidati,skupinske,nepotrjeno}/
//
// Web versions: longest edge max 2400 px, JPEG quality 82, rotated according to EXIF,
// all metadata removed (no GPS / camera data), converted to sRGB.
//
// When new photos arrive: put the originals into podatki/fotografije-originali/, add them to
// MAPPING below and run `npm run fotografije`. Files that are not in MAPPING are reported, not processed.

import { mkdir, readdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

const root = new URL('..', import.meta.url).pathname;
const SRC = join(root, 'podatki/fotografije-originali');
const OUT = join(root, 'src/assets/fotografije');

// original file (subfolder/name, or just name for files directly in fotografije-originali/) → web version.
// A value can be a list of outputs; an output can be { out, izrez: { x, y, w, h } } to crop first
// (fractions of the original, after EXIF rotation).
// kandidati/: confirmed portraits, named ime-priimek.jpg (as in src/content/kandidati/mestni-svet.yaml)
// skupinske/: group photos (two or more people)
// nepotrjeno/: not confirmed who is who yet; not used on the site
const MAPPING = {
  // homepage hero (HeroObrat): full web version + 4:5 crops (desktop/tablet, and closer for phones),
  // she sits slightly low so the water stream above her shows
  'apolonija-uvod.jpg': [
    'apolonija-uvod.jpg',
    { out: 'apolonija-uvod-izrez.jpg', izrez: { x: 0.1833, y: 0.2556, w: 0.55, h: 0.4583 } },
    { out: 'apolonija-uvod-blizje.jpg', izrez: { x: 0.225, y: 0.2889, w: 0.4333, h: 0.3611 } },
  ],

  'kandidati/Afrodita.jpg': 'kandidati/afrodita-hebar-kljun.jpg',
  'kandidati/Apolonija.jpg': 'kandidati/apolonija-simon.jpg',
  'kandidati/Arian.jpg': 'kandidati/arian-ramadani.jpg',
  'kandidati/Arne.jpg': 'kandidati/arne-vehovar.jpg',
  'kandidati/Ciril Horjak.jpg': 'kandidati/ciril-horjak.jpg',
  'kandidati/Denis.jpg': 'kandidati/denis-strikovic.jpg',
  'kandidati/Jasminka.jpg': 'kandidati/jasminka-dedic.jpg',
  'kandidati/Kaja.jpg': 'kandidati/kaja-lipnik-vehovar.jpg',
  'kandidati/Neva Zibrik.jpg': 'kandidati/neva-zibrik.jpg',
  'kandidati/Tadej.jpg': 'kandidati/tadej-glazar.jpg',
  'kandidati/Velimir.jpg': 'kandidati/velimir-zivkovic.jpg',

  'skupinske/Skupinska 1.jpg': 'skupinske/skupinska-1.jpg',
  'skupinske/Skupinska 2 skupina 1.jpg': 'skupinske/skupinska-2.jpg',
  'skupinske/Skupinska 2 skupina 2.jpg': 'skupinske/skupinska-3.jpg',
  'skupinske/Apolonija Denis Jasminka Jaka.jpg': 'skupinske/skupinska-4.jpg',
  'skupinske/Apolonija Denis Jasminka Jaka_2.jpg': 'skupinske/skupinska-5.jpg',
  'skupinske/Apolonija Jasmink Denis.jpg': 'skupinske/skupinska-6.jpg',
  'skupinske/Vesna_Moški skupinska letak.jpg': 'skupinske/skupinska-7.jpg',
  'kandidati/Denis Arian.jpg': 'skupinske/skupinska-8.jpg',
  'kandidati/Denis Jasminka.jpg': 'skupinske/skupinska-9.jpg',

  'kandidati/Černigoj.jpg': 'nepotrjeno/Cernigoj.jpg',
  'kandidati/Jaka.jpg': 'nepotrjeno/Jaka.jpg',
  'kandidati/Sašo kolo.jpg': 'nepotrjeno/Saso kolo.jpg',
  'kandidati/Sia.jpg': 'nepotrjeno/Sia.jpg',
  'kandidati/Sia 2.jpg': 'nepotrjeno/Sia 2.jpg',
  'kandidati/Vesna_Portret_014.jpg': 'nepotrjeno/Vesna_Portret_014.jpg',
  'kandidati/Vesna_Portret_020.jpg': 'nepotrjeno/Vesna_Portret_020.jpg',
  'kandidati/Arne Kleči.jpg': 'nepotrjeno/Arne Kleci.jpg',
  'kandidati/Velimir letak.jpg': 'nepotrjeno/Velimir letak.jpg',
};

// Further shots of a person who already has a web version: kept only as originals.
const IGNORE = ['kandidati/Apolonija_2.jpg', 'kandidati/Denis 4.jpg', 'kandidati/Denis_2.jpg', 'kandidati/Denis_3.jpg', 'kandidati/Tadej 2.jpg'];

const MAX = 2400;
const QUALITY = 82;

// macOS stores file names decomposed (Č = C + ˇ); compare in one form
const nfc = (s) => s.normalize('NFC');
const mapping = new Map(Object.entries(MAPPING).map(([k, v]) => [nfc(k), v]));
const ignore = new Set(IGNORE.map(nfc));

const originals = [];
for (const name of await readdir(SRC).catch(() => [])) {
  if (/\.(jpe?g|png|tiff?|heic|webp)$/i.test(name)) originals.push({ rel: nfc(name), path: join(SRC, name) });
}
for (const dir of ['kandidati', 'skupinske']) {
  for (const name of await readdir(join(SRC, dir)).catch(() => [])) {
    if (/\.(jpe?g|png|tiff?|heic|webp)$/i.test(name)) originals.push({ rel: nfc(`${dir}/${name}`), path: join(SRC, dir, name) });
  }
}

// start clean so renamed or removed photos don't linger
for (const dir of ['kandidati', 'skupinske', 'nepotrjeno']) {
  await rm(join(OUT, dir), { recursive: true, force: true });
  await mkdir(join(OUT, dir), { recursive: true });
}

const done = [];
const unmapped = [];
for (const { rel, path } of originals.sort((a, b) => a.rel.localeCompare(b.rel))) {
  if (ignore.has(rel)) continue;
  const target = mapping.get(rel);
  if (!target) {
    unmapped.push(rel);
    continue;
  }
  for (const t of [target].flat()) {
    const { out, izrez } = typeof t === 'string' ? { out: t } : t;
    // apply EXIF orientation first, so crops are in the photo's upright coordinates
    let img = sharp(await sharp(path).rotate().toBuffer());
    if (izrez) {
      const { width, height } = await img.metadata();
      img = img.extract({
        left: Math.round(izrez.x * width),
        top: Math.round(izrez.y * height),
        width: Math.round(izrez.w * width),
        height: Math.round(izrez.h * height),
      });
    }
    const info = await img
      .resize({ width: MAX, height: MAX, fit: 'inside', withoutEnlargement: true })
      .toColourspace('srgb')
      .jpeg({ quality: QUALITY, mozjpeg: true }) // no withMetadata(): EXIF/GPS/ICC are dropped
      .toFile(join(OUT, out));
    done.push(`${rel}  →  ${out}  (${info.width}×${info.height}, ${Math.round(info.size / 1024)} KB)`);
  }
}

console.log(done.join('\n'));
const missing = [...mapping.keys()].filter((k) => !originals.some((o) => o.rel === k));
if (missing.length) console.log(`\nIn MAPPING but no original found:\n  ${missing.join('\n  ')}`);
if (unmapped.length) {
  console.log(`\nNot processed (add to MAPPING or IGNORE in scripts/pripravi-fotografije.mjs):\n  ${unmapped.join('\n  ')}`);
  process.exitCode = 1;
}
