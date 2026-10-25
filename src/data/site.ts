// Site-wide settings: menu, external links, organizer notice.
// Entries with `placeholder: true` are not confirmed yet (listed by `npm run check-placeholders`).

// `short` is used in the desktop header, where space is tight.
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
];

// Wording from the posters ("Politični oglas / Naročnik: ..."); the organizer of the website is not confirmed yet.
export const narocnik = {
  oznaka: 'Politični oglas',
  besedilo: 'Naročnik: VESNA – zelena stranka, [naslov naročnika]',
  volitve: 'Volitve v MOL 2026.',
  placeholder: true,
};

export const links = {
  // from the print material
  vesna: { label: 'vesnazelenastranka.si', href: 'https://vesnazelenastranka.si/ljubljana', placeholder: false },
  apolonija: { label: 'Osebna spletna stran Apolonije Simon', href: 'https://www.apolonijasimon.si/', placeholder: false },
  zasebnost: { label: 'Varstvo zasebnosti', href: '/zasebnost', placeholder: false },
};

export const social = [
  { label: 'Instagram', href: '#', placeholder: true },
  { label: 'Facebook', href: '#', placeholder: true },
];
