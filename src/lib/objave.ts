import { getCollection, type CollectionEntry } from 'astro:content';
import { instagramProfil } from '../data/site';
import { OBJAVE_OD } from '../config';

export const tipOznaka: Record<CollectionEntry<'objave'>['data']['tip'], string> = {
  grafika: 'Grafika',
  fotografija: 'Fotografija',
  video: 'Video',
  reel: 'Reel',
  carousel: 'Galerija',
};

// reels and videos: cover image + play icon, a click opens the post on Instagram
export const jeVideo = (tip: string) => tip === 'video' || tip === 'reel';

// image of a post: local (hand-made entries) or remote URL (Behold feed)
export const slikaObjave = (o: CollectionEntry<'objave'>['data']) => o.slika ?? o.slikaUrl;

const datumFormat = new Intl.DateTimeFormat('sl-SI', { day: 'numeric', month: 'long', year: 'numeric' });
export const formatDatum = (d: Date) => datumFormat.format(d);

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

// Embed URL for click-to-load, or null when the post has no real link yet.
export function embedUrl(povezava: string, platforma: 'instagram' | 'facebook'): string | null {
  if (platforma === 'instagram') {
    const m = povezava.match(/^https:\/\/(www\.)?instagram\.com\/(p|reel|tv)\/([\w-]+)/);
    return m ? `https://www.instagram.com/${m[2]}/${m[3]}/embed` : null;
  }
  if (platforma === 'facebook' && povezava.startsWith('https://www.facebook.com/')) {
    return `https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(povezava)}`;
  }
  return null;
}
