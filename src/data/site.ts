// Site-wide settings: menu, and (from src/content/strani/noga.md, editable in Pages CMS as "Noga strani")
// the organizer notice, footer links, social profiles and the campaign's Instagram profile.
// Entries with `osnutek: true` are not confirmed yet (listed by `npm run check-placeholders`).
import { getStran } from '../lib/strani';
import { SHOW_PRIVACY_PAGE, PRIVACY_PATH } from '../config';

// Menu (header overlay, footer, 404). Follows the pages in src/pages/, so it stays in code.
// `short` is used where space is tight.
export const navigation = [
  { label: 'Vstopna stran', short: 'Domov', href: '/' },
  { label: 'Apolonija Simon', short: 'Apolonija Simon', href: '/apolonija-simon' },
  { label: 'Lista Vesna in civilna družba', short: 'Lista', href: '/lista' },
  { label: 'Program', short: 'Program', href: '/program' },
  { label: 'Odprta vprašanja mesta', short: 'Odprta vprašanja', href: '/odprta-vprasanja' },
  { label: 'Vprašanja in odgovori', short: 'Vprašanja', href: '/vprasanja' },
  { label: 'Arhiv', short: 'Arhiv', href: '/arhiv' },
  { label: 'Pomagaj, če lahko', short: 'Pomagaj', href: '/pomagaj' },
  { label: 'Kontakt', short: 'Kontakt', href: '/kontakt' },
];

const noga = await getStran('noga');
const narocnikBlok = noga.blok('narocnik');

// Organizer notice in the footer ("Politični oglas / Naročnik: ... / Volitve v MOL 2026.").
export const narocnik = {
  oznaka: narocnikBlok.naslov ?? '',
  besedilo: narocnikBlok.besedilo,
  volitve: narocnikBlok.podpis ?? '',
  osnutek: narocnikBlok.osnutek,
};

// Footer links. The link to the privacy page is left out while SHOW_PRIVACY_PAGE is false (src/config.ts).
export const links = noga.povezave
  .filter((p) => SHOW_PRIVACY_PAGE || p.url.replace(/\/$/, '') !== PRIVACY_PATH)
  .map((p) => ({ label: p.naslov, href: p.url, osnutek: p.osnutek }));

// Campaign Instagram profile: shown on the latest post in the hero, and the source of the posts
// (hero, "Zadnje objave z Instagrama" on the homepage). Post links without a permalink yet point to the profile.
export const instagramProfil = noga.instagram ?? { handle: '', url: '', osnutek: false };

// Social profiles (footer, menu overlay, /kontakt).
export const social = noga.omrezja.map((p) => ({ label: p.naslov, href: p.url, osnutek: p.osnutek }));

// Credit line at the very bottom of the footer.
export const izdelava = noga.blok('izdelava').besedilo;
