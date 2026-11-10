import { getCollection, type CollectionEntry } from 'astro:content';
import { getImage } from 'astro:assets';
import { instagramProfil } from '../data/site';
import { OBJAVE_OD } from '../config';

// shared with the browser (live feed): labels, date format, embed URLs
export { tipOznaka, jeVideo, formatDatum, embedUrl } from './behold';
import type { PrikazObjave } from './behold';

// image of a post: local (hand-made entries) or remote URL (Behold feed)
export const slikaObjave = (o: CollectionEntry<'objave'>['data']) => o.slika ?? o.slikaUrl;

// Posts from OBJAVE_OD on, newest first. Placeholder posts are shown only while no real post exists.
export async function getObjave() {
  const vse = await getCollection('objave');
  const prave = vse.filter((o) => !o.data.osnutek);
  const od = new Date(`${OBJAVE_OD}T00:00:00`);
  return (prave.length ? prave : vse)
    .filter((o) => o.data.datum >= od)
    .sort((a, b) => b.data.datum.getTime() - a.data.datum.getTime());
}

// Link for "Poglej na Instagramu": the post's permalink, or the campaign profile while the post has none.
export function povezavaObjave(o: { povezava: string; platforma: 'instagram' | 'facebook' }): string {
  return o.povezava && o.povezava !== '#' ? o.povezava : instagramProfil.url;
}

// A post as the cards and the hero show it: optimised image (srcset), aspect ratio of the uncropped image,
// video file (feed only). Same shape as the live feed in the browser (prikazIzFeeda in src/lib/behold.ts).
export async function zaPrikaz(objava: CollectionEntry<'objave'>): Promise<PrikazObjave> {
  const o = objava.data;
  const vir = slikaObjave(o);
  let slika: string | undefined;
  let srcset: string | undefined;
  let r = 1;
  if (vir) {
    const mere =
      typeof vir === 'string'
        ? o.sirina && o.visina
          ? { width: o.sirina, height: o.visina }
          : { inferSize: true as const }
        : {};
    const img = await getImage({ src: vir, ...mere, widths: [320, 640, 960], format: 'webp' });
    slika = img.src;
    srcset = img.srcSet.attribute;
    const w = Number(img.attributes.width ?? (typeof vir === 'string' ? o.sirina : vir.width));
    const h = Number(img.attributes.height ?? (typeof vir === 'string' ? o.visina : vir.height));
    if (w && h) r = w / h;
  }
  return {
    povezava: povezavaObjave(o),
    datum: o.datum.toISOString(),
    tip: o.tip,
    platforma: o.platforma,
    opis: o.opis,
    osnutek: o.osnutek,
    r,
    slika,
    srcset,
    video: o.videoUrl,
  };
}
