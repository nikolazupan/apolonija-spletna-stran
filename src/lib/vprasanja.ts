import { getCollection } from 'astro:content';

// Questions shown on /vprasanja: only entries marked published (`objavljeno: true`) that have an answer
// (the body below the frontmatter), newest first. Unpublished or unanswered questions stay in the CMS only.
export async function getVprasanja() {
  return (await getCollection('vprasanja', (v) => v.data.objavljeno && (v.body ?? '').trim() !== ''))
    .sort((a, b) => b.data.datum.getTime() - a.data.datum.getTime());
}
