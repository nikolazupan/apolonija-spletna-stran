// Browser side of the Instagram posts: fetches the Behold feed on page load, so new posts appear
// without a redeploy. The pages are built with the posts as of the last build (or the hand-made entries);
// if this fetch fails or the feed is empty, that static version simply stays.
// Used by HeroObrat (picture posts on the back of the green shape) and LatestPosts ("Zadnje objave z Instagrama").
// Note: the BEHOLD_FEED_URL environment variable only affects the build; the browser uses src/config.ts.
import { BEHOLD_FEED_URL, OBJAVE_OD } from '../config';
import {
  beholdObjave,
  formatDatum,
  izBehold,
  jeVideo,
  oznakeKartice,
  prikazIzFeeda,
  tipOznaka,
  type PrikazObjave,
} from './behold';

let zahteva: Promise<PrikazObjave[] | null> | undefined;

// Posts from OBJAVE_OD on, newest first; null when the feed is off, unreachable or empty.
// One request per page, shared by every component on it.
export function naloziObjave(): Promise<PrikazObjave[] | null> {
  if (!BEHOLD_FEED_URL) return Promise.resolve(null);
  zahteva ??= (async () => {
    try {
      const signal = typeof AbortSignal.timeout === 'function' ? AbortSignal.timeout(10000) : undefined;
      const res = await fetch(BEHOLD_FEED_URL, { signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const od = new Date(`${OBJAVE_OD}T00:00:00`);
      const objave = beholdObjave(await res.json())
        .filter((p) => p?.permalink && p.timestamp)
        .map(izBehold)
        .filter((o) => o.slikaUrl && !Number.isNaN(o.datum.getTime()) && o.datum >= od)
        .sort((a, b) => b.datum.getTime() - a.datum.getTime())
        .map(prikazIzFeeda);
      return objave.length ? objave : null;
    } catch (e) {
      console.warn('Instagram (Behold): feed unavailable, keeping the built posts.', e);
      return null;
    }
  })();
  return zahteva;
}

// Resolves once the image is loaded (or failed / took too long), so a swap doesn't show an empty frame.
export function prednaloziSliko(src: string, cakaj = 4000): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.referrerPolicy = 'no-referrer';
    const konec = () => resolve();
    img.onload = konec;
    img.onerror = konec;
    window.setTimeout(konec, cakaj);
    img.src = src;
  });
}

// Image into an <img> rendered by Astro (the srcset of a built image is replaced or dropped).
function nastaviSliko(img: Element | null, o: PrikazObjave, alt: string) {
  if (!(img instanceof HTMLImageElement) || !o.slika) return;
  if (o.srcset) img.srcset = o.srcset;
  else img.removeAttribute('srcset');
  img.src = o.slika;
  img.alt = alt;
}

const q = <T extends HTMLElement = HTMLElement>(el: ParentNode, kljuc: string) => el.querySelector<T>(`[data-o="${kljuc}"]`);

// Play icon on a video's poster (ReelOznaka.astro with `vedno`)
function nastaviReel(el: ParentNode, tip: PrikazObjave['tip']) {
  const reel = q(el, 'reel');
  if (reel) reel.hidden = !jeVideo(tip);
}

// --- Videos in the cards: poster + play icon, played in place without native controls ---
// A click/tap on the video plays or pauses it (the play icon shows while paused). Muted by default;
// the small button in the corner switches the sound (shown once the video has started). One video at a time.

// A video that can't be played (expired link, network): drop the player, the poster underneath links to the post.
const opustiVideo = (ovoj: Element) => ovoj.remove();

// Play icon + labels follow the video's state.
function osveziVideo(ovoj: Element, v: HTMLVideoElement) {
  const gumb = q(ovoj, 'predvajaj');
  const ustavljeno = q(ovoj, 'ustavljeno');
  if (ustavljeno) ustavljeno.hidden = !v.paused;
  gumb?.setAttribute('aria-label', `${v.paused ? 'Predvajaj' : 'Ustavi'}: ${gumb.dataset.oznaka ?? ''}`);
  const zvok = q(ovoj, 'zvok');
  if (zvok) {
    zvok.setAttribute('aria-pressed', String(!v.muted));
    zvok.setAttribute('aria-label', v.muted ? 'Vklopi zvok' : 'Izklopi zvok');
    zvok.querySelector('[data-o="zvok-izklopljen"]')?.toggleAttribute('hidden', !v.muted);
    zvok.querySelector('[data-o="zvok-vklopljen"]')?.toggleAttribute('hidden', v.muted);
  }
}

let klikiPripravljeni = false;
// Shows the players (hidden without JS, then the poster link stays) and handles play/pause and sound.
export function pripraviVidee(koren: ParentNode) {
  koren.querySelectorAll<HTMLElement>('[data-o="video-ovoj"]').forEach((ovoj) => {
    const v = ovoj.querySelector('video');
    if (!v?.getAttribute('src')) return opustiVideo(ovoj);
    v.addEventListener('error', () => opustiVideo(ovoj), { once: true });
    for (const dogodek of ['play', 'pause', 'volumechange']) v.addEventListener(dogodek, () => osveziVideo(ovoj, v));
    ovoj.hidden = false;
  });
  if (klikiPripravljeni) return;
  klikiPripravljeni = true;
  document.addEventListener('click', (e) => {
    const cilj = e.target as Element | null;
    const ovoj = cilj?.closest('[data-o="video-ovoj"]');
    const v = ovoj?.querySelector('video');
    if (!ovoj || !v) return;
    if (cilj?.closest('[data-o="zvok"]')) {
      v.muted = !v.muted;
      return;
    }
    if (!cilj?.closest('[data-o="predvajaj"]')) return;
    if (!v.paused) return v.pause();
    // only one card video plays at a time
    document.querySelectorAll<HTMLVideoElement>('[data-o="video-ovoj"] video').forEach((drug) => drug !== v && drug.pause());
    const zvok = q(ovoj, 'zvok');
    if (zvok) zvok.hidden = false;
    v.play().catch(() => opustiVideo(ovoj));
  });
}

// --- Cards ("Zadnje objave z Instagrama") ---

// Fills a card cloned from PostCard's template (PostCard.astro with `sablona`).
function napolniKartico(el: HTMLElement, o: PrikazObjave) {
  const video = jeVideo(o.tip);
  const datum = new Date(o.datum);
  const oznake = oznakeKartice({ tip: o.tip, datum, platforma: o.platforma });
  el.style.setProperty('--r', String(o.r));
  const clanek = el.querySelector('article');
  clanek?.setAttribute('data-objava', o.povezava);
  clanek?.style.setProperty('--r', String(o.r));
  nastaviSliko(q(el, 'slika'), o, o.opis);
  const odpri = q<HTMLAnchorElement>(el, 'odpri');
  if (odpri) {
    odpri.href = o.povezava;
    odpri.setAttribute('aria-label', oznake.odpri);
  }
  nastaviReel(el, o.tip);
  const ovoj = q(el, 'video-ovoj');
  if (ovoj) {
    if (video && o.video) {
      const v = ovoj.querySelector('video')!;
      v.src = o.video;
      if (o.slika) v.poster = o.slika;
      const gumb = q(ovoj, 'predvajaj');
      if (gumb) {
        gumb.dataset.oznaka = `${tipOznaka[o.tip]}, ${formatDatum(datum)}`;
        gumb.setAttribute('aria-label', `Predvajaj: ${gumb.dataset.oznaka}`);
      }
    } else {
      ovoj.remove();
    }
  }
  const cas = q(el, 'datum');
  if (cas) {
    cas.textContent = formatDatum(datum);
    cas.setAttribute('datetime', o.datum);
  }
  const opis = q(el, 'opis');
  if (opis) opis.textContent = o.opis; // also drops the OSNUTEK mark of a stand-in post
  const povezava = q<HTMLAnchorElement>(el, 'povezava');
  if (povezava) povezava.href = o.povezava;
}

// Replaces the posts of a list (<ul>/<ol> with a <template data-objava-sablona> inside).
// data-nagibi: the list's tilt classes (JSON array), applied in turn as on the built page.
// Nothing changes when the feed has the same posts as the built page.
export function zamenjajSeznam(seznam: HTMLElement, objave: PrikazObjave[]) {
  const sablona = seznam.querySelector<HTMLTemplateElement>('template[data-objava-sablona]');
  const vzorec = sablona?.content.firstElementChild;
  if (!sablona || !vzorec) return;
  const zdaj = [...seznam.querySelectorAll('li article')].map((a) => a.getAttribute('data-objava'));
  if (zdaj.length === objave.length && objave.every((o, i) => o.povezava === zdaj[i])) return;

  let nagibi: string[] = [];
  try {
    nagibi = JSON.parse(seznam.dataset.nagibi ?? '[]');
  } catch {}
  const elementi = objave.map((o, i) => {
    const li = vzorec.cloneNode(true) as HTMLElement;
    napolniKartico(li, o);
    if (nagibi.length) li.querySelector('article')?.classList.add(nagibi[i % nagibi.length]);
    return li;
  });
  seznam.replaceChildren(sablona, ...elementi);
  pripraviVidee(seznam);
}

// --- Hero (HeroObrat.astro) ---

// Puts a post on the back of the green shape: proportions, image, video (muted, played by the hero script),
// link and its aria-label ("<oznaka> · <date>"; not shown on the post).
export function prikaziVHeroju(zadaj: HTMLElement, o: PrikazObjave, oznakaBesedilo: string) {
  const okvir = q(zadaj, 'okvir');
  const odpri = q<HTMLAnchorElement>(zadaj, 'odpri');
  if (!okvir || !odpri) return;
  okvir.style.setProperty('--r', String(o.r));
  nastaviSliko(q(okvir, 'slika'), o, '');
  let v = okvir.querySelector('video');
  if (o.video) {
    if (!v) {
      v = document.createElement('video');
      v.dataset.o = 'video';
      v.className = 'absolute inset-0 h-full w-full object-cover';
      v.muted = true;
      v.loop = true;
      v.playsInline = true;
      v.preload = 'metadata';
      okvir.append(v);
    }
    if (o.slika) v.poster = o.slika;
    v.src = o.video;
  } else {
    v?.remove();
  }
  const oznaka = `${oznakaBesedilo} · ${formatDatum(new Date(o.datum))}`;
  odpri.href = o.povezava;
  odpri.setAttribute('aria-label', `${oznaka}. Poglej na Instagramu.`);
}
