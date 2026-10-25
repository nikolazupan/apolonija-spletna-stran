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
