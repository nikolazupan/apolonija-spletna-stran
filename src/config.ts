// Global site settings.

// Visually mark placeholder content (dashed outline + "OSNUTEK" label).
// Set to false to preview the site without markings.
export const SHOW_PLACEHOLDERS = true;

// Preview mode: keep search engines out (robots meta tag on every page + robots.txt that disallows all).
// Set to false for the final launch (see "Before final launch" in CLAUDE.md).
export const NOINDEX = true;

// Instagram posts (homepage + /arhiv): only posts from this date on are shown (YYYY-MM-DD).
export const OBJAVE_OD = '2026-10-01';

// Automatic import of @skupajzamesto posts from a Behold JSON feed (https://behold.so).
// Empty = off: the hand-made entries in src/content/objave/ are used.
// To switch on, paste the feed URL here (or set the BEHOLD_FEED_URL environment variable) and rebuild.
// If the feed can't be loaded during the build, the hand-made entries are used instead.
export const BEHOLD_FEED_URL = '';
