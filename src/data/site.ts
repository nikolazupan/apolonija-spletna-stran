// Site-wide settings: menu, and (from src/content/strani/noga.md, editable in Pages CMS as "Noga strani")
// the organizer notice, footer links, social profiles and the campaign's Instagram profile.
// Entries with `osnutek: true` are not confirmed yet (listed by `npm run check-placeholders`).
import { getStran } from '../lib/strani';

// Menu (header overlay, footer, 404). Follows the pages in src/pages/, so it stays in code.
// `short` is used where space is tight.
export const navigation = [
  { label: 'Vstopna stran', short: 'Domov', href: '/' },
  { label: 'Apolonija Simon', short: 'Apolonija Simon', href: '/apolonija-simon' },
  { label: 'Lista Vesna in civilna družba', short: 'Lista', href: '/lista' },
  { label: 'Program', short: 'Program', href: '/program' },
  { label: 'Sporni projekti', short: 'Sporni projekti', href: '/sporni-projekti' },
  { label: 'Vprašanja in odgovori', short: 'Vprašanja', href: '/vprasanja' },
  { label: 'Arhiv objav', short: 'Arhiv', href: '/arhiv' },
  { label: 'Pomagaj, če lahko', short: 'Pomagaj', href: '/pomagaj' },
  { label: 'Kontakt', short: 'Kontakt', href: '/kontakt' },
  { label: 'Odprta vprašanja mesta', short: 'Odprta vprašanja', href: '/odprta-vprasanja' },
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

// Footer links.
export const links = noga.povezave.map((p) => ({ label: p.naslov, href: p.url, osnutek: p.osnutek }));

// Campaign Instagram profile: shown on the latest post in the hero, and the source of the posts
// (hero, /arhiv). Post links without a permalink yet point to the profile.
export const instagramProfil = noga.instagram ?? { handle: '', url: '', osnutek: false };

// Social profiles (footer, menu overlay, /kontakt).
export const social = noga.omrezja.map((p) => ({ label: p.naslov, href: p.url, osnutek: p.osnutek }));

// Credit line at the very bottom of the footer.
export const izdelava = noga.blok('izdelava').besedilo;
