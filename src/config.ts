// Global site settings.

// Visually mark placeholder content (dashed outline + "OSNUTEK" label).
// Set to false to preview the site without markings.
export const SHOW_PLACEHOLDERS = true;

// Preview mode: keep search engines out (robots meta tag on every page + robots.txt that disallows all).
// Set to false for the final launch (see "Before final launch" in CLAUDE.md).
export const NOINDEX = true;

// Instagram posts (homepage: hero flip + "Zadnje objave z Instagrama"): only posts from this date on are shown (YYYY-MM-DD).
export const OBJAVE_OD = '2026-10-01';

// Behold JSON feed of @skupajzamesto (https://behold.so). Used twice:
// - in the browser, on every page load (src/lib/objave-v-zivo.ts): new posts appear without a redeploy
//   (hero flip and "Zadnje objave z Instagrama" on the homepage);
// - at build time (src/lib/objave-loader.ts): the static HTML already shows the posts as of the last build,
//   which is what visitors see if the browser fetch fails. If the build can't load it, the hand-made entries in
//   src/content/objave/ are used. Empty = feed off, only the hand-made entries.
// The BEHOLD_FEED_URL environment variable overrides it for the build.
export const BEHOLD_FEED_URL = 'https://feeds.behold.so/PpRTNxpoipQpE41sBqCF';

// Privacy notice page (/zasebnost). The page is always built and reachable by direct URL. While this is false,
// every link to it (footer, and any future form / consent checkbox: read this flag) is hidden and the page gets
// <meta name="robots" content="noindex">. There is no sitemap yet; if one is added, leave /zasebnost out while false.
// Set to true to show the links and let it be indexed.
export const SHOW_PRIVACY_PAGE = false;
export const PRIVACY_PATH = '/zasebnost';
