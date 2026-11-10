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

// Internal page for the team: what content is still missing, open decisions. Not linked anywhere,
// noindex. Built only while the site is in preview (follows NOINDEX), so it disappears from the
// production build automatically at launch. Simple path on request; anyone who guesses it can open it.
export const INTERNA_STRAN = NOINDEX;
export const INTERNA_POT = 'placeholders';

// Pages CMS (https://pagescms.org): base URL of this repository's branch in the hosted app. The team page's
// "Uredi v CMS" links are built from it and from .pages.yml (src/lib/cms.ts). Change owner/repo/branch here if they change.
export const CMS_URL = 'https://app.pagescms.org/nikolazupan/apolonija-spletna-stran/main';
