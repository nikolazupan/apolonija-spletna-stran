// Content loader for the posts collection (src/content.config.ts → objave).
//
// - BEHOLD_FEED_URL empty (default): the hand-made entries in src/content/objave/*.md.
// - BEHOLD_FEED_URL set: at build time the newest posts from the Behold JSON feed, mapped to the same data shape
//   (remote image in `slikaUrl` instead of a local `slika`). If the feed can't be loaded or has
//   no usable posts, it falls back to the hand-made entries and logs a warning.
// In the browser the same feed is fetched again on every page load (src/lib/objave-v-zivo.ts), so new posts
// appear without a rebuild; this build-time copy is what visitors see if that fetch fails.
import type { Loader } from 'astro/loaders';
import { glob } from 'astro/loaders';
import { BEHOLD_FEED_URL } from '../config';
import { beholdDatum, beholdObjave, izBehold, type BeholdPost } from './behold';

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
          const posts: BeholdPost[] = beholdObjave(json);
          if (!posts.length) throw new Error('feed has no posts');
          ctx.store.clear();
          for (const p of posts) {
            const id = p.permalink?.match(/\/(?:p|reel|tv)\/([\w-]+)/)?.[1] ?? p.id;
            const data = await ctx.parseData({ id, data: { ...izBehold(p), datum: beholdDatum(p.timestamp).toISOString() } });
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
