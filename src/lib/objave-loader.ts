// Content loader for the posts collection (src/content.config.ts → objave).
//
// - BEHOLD_FEED_URL empty (default): the hand-made entries in src/content/objave/*.md.
// - BEHOLD_FEED_URL set: the newest posts from the Behold JSON feed, mapped to the same data shape
//   (remote image in `slikaUrl` instead of a local `slika`). If the feed can't be loaded or has
//   no usable posts, it falls back to the hand-made entries and logs a warning.
import type { Loader } from 'astro/loaders';
import { glob } from 'astro/loaders';
import { BEHOLD_FEED_URL } from '../config';

type BeholdSize = { mediaUrl?: string };
type BeholdPost = {
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

const prvaVrstica = (s = '') => s.split('\n').map((l) => l.trim()).find(Boolean) ?? '';

// Behold post → our post fields (same shape as the hand-made entries)
export function izBehold(p: BeholdPost) {
  const tip = p.isReel ? 'reel' : p.mediaType === 'VIDEO' ? 'video' : p.mediaType === 'CAROUSEL_ALBUM' ? 'carousel' : 'fotografija';
  const slikaUrl =
    p.sizes?.large?.mediaUrl ?? p.sizes?.full?.mediaUrl ?? (p.mediaType === 'VIDEO' ? p.thumbnailUrl : p.mediaUrl) ?? p.thumbnailUrl;
  return {
    datum: p.timestamp,
    tip,
    platforma: 'instagram',
    povezava: p.permalink,
    opis: prvaVrstica(p.prunedCaption ?? p.caption),
    slikaUrl,
    osnutek: false,
  };
}

export function objaveLoader(): Loader {
  const rocne = glob({ pattern: '**/*.md', base: './src/content/objave' });
  const feed = (typeof process !== 'undefined' && process.env.BEHOLD_FEED_URL) || BEHOLD_FEED_URL;
  return {
    name: 'objave',
    load: async (ctx) => {
      if (feed) {
        try {
          const res = await fetch(feed, { signal: AbortSignal.timeout(15000) });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const json = await res.json();
          // Behold v2 feeds are { posts: [...] }, older ones a plain array
          const posts: BeholdPost[] = Array.isArray(json) ? json : (json.posts ?? []);
          if (!posts.length) throw new Error('feed has no posts');
          ctx.store.clear();
          for (const p of posts) {
            const id = p.permalink?.match(/\/(?:p|reel|tv)\/([\w-]+)/)?.[1] ?? p.id;
            const data = await ctx.parseData({ id, data: izBehold(p) });
            ctx.store.set({ id, data });
          }
          ctx.logger.info(`Behold: ${posts.length} posts from the feed`);
          return;
        } catch (e) {
          ctx.logger.warn(`Behold feed unavailable (${(e as Error).message}); using the hand-made posts`);
        }
      }
      await rocne.load(ctx);
    },
  };
}
