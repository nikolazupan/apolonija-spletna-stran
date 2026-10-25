import { getCollection, type CollectionEntry } from 'astro:content';

export const tipOznaka: Record<CollectionEntry<'objave'>['data']['tip'], string> = {
  grafika: 'Grafika',
  besedilo: 'Besedilo',
  foto: 'Fotografija',
  video: 'Video',
};

const datumFormat = new Intl.DateTimeFormat('sl-SI', { day: 'numeric', month: 'long', year: 'numeric' });
export const formatDatum = (d: Date) => datumFormat.format(d);

// Newest first.
export async function getObjave() {
  const objave = await getCollection('objave');
  return objave.sort((a, b) => b.data.datum.getTime() - a.data.datum.getTime());
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
