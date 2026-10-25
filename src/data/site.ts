// Site-wide settings: menu, external links, organizer notice.
// Entries with `placeholder: true` are not confirmed yet (listed by `npm run check-placeholders`).

export const navigation = [
  { label: 'Vstopna stran', href: '/' },
  { label: 'Apolonija Simon', href: '/apolonija-simon' },
  { label: 'Lista Vesna in civilna družba', href: '/lista' },
  { label: 'Program', href: '/program' },
  { label: 'Sporni projekti', href: '/sporni-projekti' },
  { label: 'Spletna anketa', href: '/anketa' },
  { label: 'Arhiv objav', href: '/arhiv' },
  { label: 'Pomagaj, če lahko', href: '/pomagaj' },
  { label: 'Kontakt', href: '/kontakt' },
];

// Wording from the posters ("Politični oglas / Naročnik: ...").
export const narocnik = {
  oznaka: 'Politični oglas',
  besedilo: 'Naročnik: VESNA – zelena stranka',
  volitve: 'Volitve v MOL 2026.',
};

export const links = {
  // from the print material
  vesna: { label: 'vesnazelenastranka.si', href: 'https://vesnazelenastranka.si/ljubljana', placeholder: false },
  apolonija: { label: 'Osebna stran Apolonije Simon', href: '#', placeholder: true },
  zasebnost: { label: 'Varstvo zasebnosti', href: '/zasebnost', placeholder: false },
};

export const social = [
  { label: 'Instagram', href: '#', placeholder: true },
  { label: 'Facebook', href: '#', placeholder: true },
];
