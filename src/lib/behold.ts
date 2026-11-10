// Post helpers shared by the build (Astro pages, content loader) and the browser (live Behold feed,
// src/lib/objave-v-zivo.ts). No astro:* imports here, so this module can be bundled for the client.

export type TipObjave = 'grafika' | 'fotografija' | 'video' | 'reel' | 'carousel';
export type Platforma = 'instagram' | 'facebook';

export const tipOznaka: Record<TipObjave, string> = {
  grafika: 'Grafika',
  fotografija: 'Fotografija',
  video: 'Video',
  reel: 'Reel',
  carousel: 'Galerija',
};

// reels and videos: cover image + play icon, a click opens the post on Instagram
export const jeVideo = (tip: string) => tip === 'video' || tip === 'reel';

// fixed time zone, so the build machine and every visitor show the same day
const datumFormat = new Intl.DateTimeFormat('sl-SI', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Ljubljana' });
export const formatDatum = (d: Date) => datumFormat.format(d);

export const platformaNa = (p: Platforma) => (p === 'instagram' ? 'Instagramu' : 'Facebooku');

// Embed URL for click-to-load, or null when the post has no real link yet.
export function embedUrl(povezava: string, platforma: Platforma): string | null {
  if (platforma === 'instagram') {
    const m = povezava.match(/^https:\/\/(www\.)?instagram\.com\/(p|reel|tv)\/([\w-]+)/);
    return m ? `https://www.instagram.com/${m[2]}/${m[3]}/embed` : null;
  }
  if (platforma === 'facebook' && povezava.startsWith('https://www.facebook.com/')) {
    return `https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(povezava)}`;
  }
  return null;
}

// aria-labels of a post card (PostCard.astro and the live cards)
export function oznakeKartice(o: { tip: TipObjave; datum: Date; platforma: Platforma }) {
  const na = platformaNa(o.platforma);
  const datum = formatDatum(o.datum);
  return {
    odpri: `${tipOznaka[o.tip]} na ${na}, ${datum}: odpri na ${na}`,
    nalozi: `Naloži objavo z ${na} (${tipOznaka[o.tip]}, ${datum})`,
  };
}

// --- Behold JSON feed (https://behold.so) ---

type BeholdSize = { mediaUrl?: string; width?: number; height?: number; uncropped?: { width: number; height: number } };
export type BeholdPost = {
  id: string;
  timestamp: string;
  permalink: string;
  mediaType?: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  isReel?: boolean;
  caption?: string;
  prunedCaption?: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  sizes?: { small?: BeholdSize; medium?: BeholdSize; large?: BeholdSize; full?: BeholdSize };
};

// Behold v2 feeds are { posts: [...] }, older ones a plain array
export const beholdObjave = (json: unknown): BeholdPost[] =>
  Array.isArray(json) ? json : ((json as { posts?: BeholdPost[] })?.posts ?? []);

const NAJVEC_ZNAKOV = 140;
// first non-empty line of the caption, cut at a word boundary (cards clamp it to 2 lines anyway)
export function skrajsajOpis(s = '') {
  const vrstica = s.split('\n').map((l) => l.trim()).find(Boolean) ?? '';
  if (vrstica.length <= NAJVEC_ZNAKOV) return vrstica;
  const rez = vrstica.slice(0, NAJVEC_ZNAKOV);
  return `${rez.slice(0, rez.lastIndexOf(' ') > 80 ? rez.lastIndexOf(' ') : NAJVEC_ZNAKOV).replace(/[\s,.;:–-]+$/, '')} …`;
}

// "2026-11-09T20:35:25+0000" → "+00:00" (Safari does not parse offsets without a colon)
export const beholdDatum = (ts: string) => new Date(ts.replace(/([+-]\d{2})(\d{2})$/, '$1:$2'));

// posts that show a picture (the hero uses only these): photos, graphics, carousels (first image)
export const jeSlika = (tip: string) => !jeVideo(tip);

// Behold post → our post fields (same shape as the hand-made entries in src/content/objave/)
// Image: Behold's `sizes.*` are square crops when the feed is set to crop (class=squareMedium), which would cut the
// post. Then the uncropped original from Instagram is used (mediaUrl; for videos thumbnailUrl), with the real
// proportions from `sizes.medium.uncropped`. If the feed's sizes are not cropped, sizes.medium is used.
export function izBehold(p: BeholdPost) {
  const tip: TipObjave =
    p.isReel || /\/reel\//.test(p.permalink ?? '')
      ? 'reel'
      : p.mediaType === 'VIDEO'
        ? 'video'
        : p.mediaType === 'CAROUSEL_ALBUM'
          ? 'carousel'
          : 'fotografija';
  const video = p.mediaType === 'VIDEO';
  const medium = p.sizes?.medium;
  const cela = medium?.uncropped ?? (medium?.width && medium?.height ? { width: medium.width, height: medium.height } : undefined);
  const obrezana = !!(medium?.width && medium?.height && cela && Math.abs(medium.width / medium.height - cela.width / cela.height) > 0.01);
  const izvirnik = video ? p.thumbnailUrl : p.mediaUrl;
  const slikaUrl = (!obrezana && medium?.mediaUrl) || izvirnik || medium?.mediaUrl;
  // only the cropped square is available: its own proportions
  const mere = slikaUrl === medium?.mediaUrl && obrezana ? { width: medium!.width!, height: medium!.height! } : cela;
  return {
    datum: beholdDatum(p.timestamp),
    tip,
    platforma: 'instagram' as const,
    povezava: p.permalink,
    opis: skrajsajOpis(p.prunedCaption ?? p.caption),
    slikaUrl,
    sirina: mere?.width,
    visina: mere?.height,
    // the video file itself (Instagram CDN; the link expires after a few days, the browser gets a fresh one from the feed)
    videoUrl: video ? p.mediaUrl : undefined,
    osnutek: false,
  };
}
export type ObjavaVZivo = ReturnType<typeof izBehold>;

// Aspect ratio (width / height) of a post's image; square when unknown.
export const razmerje = (o: { sirina?: number; visina?: number }) => (o.sirina && o.visina ? o.sirina / o.visina : 1);

// --- One display shape for every post (built page and live feed) ---

// What a card / the hero needs to show a post. Built pages make it with zaPrikaz() (src/lib/objave.ts, optimised
// images); the browser makes it from the live feed with prikazIzFeeda().
export type PrikazObjave = {
  povezava: string;
  datum: string; // ISO
  tip: TipObjave;
  platforma: Platforma;
  opis: string;
  osnutek: boolean;
  r: number; // aspect ratio width / height of the image
  slika?: string;
  srcset?: string;
  video?: string;
};

export const prikazIzFeeda = (o: ObjavaVZivo): PrikazObjave => ({
  povezava: o.povezava,
  datum: o.datum.toISOString(),
  tip: o.tip,
  platforma: o.platforma,
  opis: o.opis,
  osnutek: false,
  r: razmerje(o),
  slika: o.slikaUrl,
  video: o.videoUrl,
});

// Hero: only posts that show a picture (photos, graphics, carousels), newest first;
// only if there is none, the newest video.
export function izberiZaHero<T extends { tip: string }>(objave: T[]): T[] {
  const slike = objave.filter((o) => jeSlika(o.tip));
  return slike.length ? slike : objave.slice(0, 1);
}

// Number of posts in "Zadnje objave z Instagrama" on the homepage.
export const STEVILO_OBJAV = 6;
