// Turns the placeholder scan (scripts/lib/placeholderji.mjs, same as `npm run check-placeholders`)
// into a list of missing content for the team page: page → section → item, in plain Slovenian.
// Nothing here is maintained per item: descriptions come from the content files themselves
// (block titles, labels) plus a few rules per file type. Anything not recognised is still listed
// under "Ostalo" with its file and line, so nothing gets lost.
import { getCollection } from 'astro:content';
import { najdiPlaceholderje } from '../../scripts/lib/placeholderji.mjs';

export interface Postavka {
  kaj: string;
  oblika?: string;
  povezava: string;
  vir: string; // file:line, for the developer
}
export interface Stran {
  ime: string;
  povezava: string;
  sekcije: { ime: string; postavke: Postavka[] }[];
}

// pages in the order of the menu
const STRANI: [string, string, string][] = [
  ['vstopna', 'Vstopna stran', '/'],
  ['apolonija-simon', 'Apolonija Simon', '/apolonija-simon'],
  ['lista', 'Lista', '/lista'],
  ['program', 'Program', '/program'],
  ['sporni-projekti', 'Sporni projekti', '/sporni-projekti'],
  ['vprasanja', 'Vprašanja in odgovori', '/vprasanja'],
  ['arhiv', 'Arhiv objav', '/arhiv'],
  ['pomagaj', 'Pomagaj, če lahko', '/pomagaj'],
  ['kontakt', 'Kontakt', '/kontakt'],
  ['odprta-vprasanja', 'Odprta vprašanja mesta', '/odprta-vprasanja'],
  ['zasebnost', 'Varstvo zasebnosti', '/zasebnost'],
  ['noga', 'Noga strani (vse strani)', '/'],
  ['ostalo', 'Ostalo', '/'],
];

// Plainer wording / format hints for text blocks, by "page#block id" (optional; otherwise the block title is used).
const BLOKI: Record<string, { sekcija?: string; kaj: string; oblika?: string }> = {
  'vstopna#poudarki': { sekcija: 'Ključne točke programa', kaj: 'Izbor 3 ključnih točk programa za vstopno stran', oblika: '3 od 9 področij, s skrajšanimi besedili (2 stavka)' },
  'vstopna#kandidatura': { sekcija: 'Zakaj Apolonija kandidira', kaj: 'Besedilo: zakaj Apolonija kandidira', oblika: '1–2 odstavka' },
  'vstopna#skupaj': { sekcija: 'Vesna in civilna družba skupaj', kaj: 'Besedilo: zakaj Vesna in civilna družba nastopata skupaj (zdaj je na strani osnutek, ki ga je treba potrditi ali nadomestiti)', oblika: '1 odstavek' },
  'apolonija-simon#zgodba': { sekcija: 'Besedilo', kaj: 'Besedilo: kdo je Apolonija (njena pot, delo v šoli in umetnosti, civilne pobude)', oblika: '2–4 odstavki' },
  'apolonija-simon#zakaj': { sekcija: 'Besedilo', kaj: 'Besedilo: zakaj Apolonija kandidira', oblika: '1–2 odstavka' },
  'lista#uvod': { sekcija: 'Uvod', kaj: 'Uvodno besedilo o listi Vesna in civilna družba', oblika: '1 odstavek' },
  'lista#cetrtne': { sekcija: 'Četrtne skupnosti', kaj: 'Uvodno besedilo o kandidaturah v četrtnih skupnostih', oblika: '1–2 stavka' },
  'sporni-projekti#uvod': { sekcija: 'Uvod', kaj: 'Uvodno besedilo strani Sporni projekti', oblika: '1 odstavek' },
  'vprasanja#razlika': { sekcija: 'Uvod', kaj: 'Potrditev uvodne vrstice (razlika med to stranjo in Odprtimi vprašanji mesta)', oblika: 'potrditev ali popravek' },
  'arhiv#plakati': { sekcija: 'Plakati', kaj: 'Uvodno besedilo k plakatom', oblika: '1–2 stavka' },
  'pomagaj#uvod': { sekcija: 'Prošnja za donacijo', kaj: 'Besedilo: prošnja za donacijo (za kaj bomo sredstva porabili)', oblika: '1 odstavek' },
  'pomagaj#nakazilo': { sekcija: 'Podatki za nakazilo', kaj: 'Pojasnilo o nakazilu in morebitnih omejitvah donacij', oblika: '1–2 stavka' },
  'kontakt#uvod': { sekcija: 'Uvod', kaj: 'Uvodno besedilo (kdo odgovarja na sporočila in v kakšnem času)', oblika: '1–2 stavka' },
  'zasebnost#podrobnosti': { sekcija: 'Pravno besedilo', kaj: 'Pravno besedilo o varstvu osebnih podatkov', oblika: 'upravljavec, namen obdelave, hramba, pravice posameznika' },
};

type Hit = { rel: string; line: number; label: string; text: string; lines: string[] };

const indent = (l: string) => l.length - l.trimStart().length;
const vrednost = (v: string) => v.trim().replace(/^"(.*)"$/, '$1');

// For a YAML line inside a list item: the list's key and the item's fields. null when top-level.
function yamlKontekst(lines: string[], i: number) {
  const ind = indent(lines[i]);
  if (ind === 0) return null;
  let start = i;
  while (start >= 0 && !(/^\s*- /.test(lines[start]) && indent(lines[start]) + 2 === ind)) start--;
  if (start < 0) return null;
  let seznam = '';
  for (let j = start; j >= 0; j--) {
    const m = lines[j].match(/^(\w+):\s*$/);
    if (m) {
      seznam = m[1];
      break;
    }
  }
  const polja: Record<string, string> = {};
  for (let j = start; j < lines.length; j++) {
    if (j > start && (indent(lines[j]) < ind || (/^\s*- /.test(lines[j]) && indent(lines[j]) + 2 === ind))) break;
    const m = lines[j].replace(/^(\s*)- /, '$1  ').match(/^\s*(\w+):\s*(.*)$/);
    if (m && m[2]) polja[m[1]] = vrednost(m[2]);
  }
  return { seznam, polja };
}

// frontmatter field of a markdown file
const polje = (lines: string[], key: string) => {
  const l = lines.find((x) => x.startsWith(`${key}:`));
  return l ? vrednost(l.slice(key.length + 1)) : '';
};

export async function getManjkajoce(root: string) {
  const hits: Hit[] = await najdiPlaceholderje(root);
  const zbirka = new Map<string, Map<string, Postavka[]>>();
  const dodaj = (stran: string, sekcija: string, p: Postavka) => {
    if (!zbirka.has(stran)) zbirka.set(stran, new Map());
    const s = zbirka.get(stran)!;
    if (!s.has(sekcija)) s.set(sekcija, []);
    s.get(sekcija)!.push(p);
  };
  let objave = 0;

  for (const h of hits) {
    const vir = `${h.rel}:${h.line}`;
    const ime = h.rel.split('/').pop()!.replace(/\.(md|ya?ml)$/, '');

    if (h.rel.startsWith('src/content/strani/')) {
      const kon = yamlKontekst(h.lines, h.line - 1);
      const [, , url] = STRANI.find(([id]) => id === ime) ?? ['', '', '/'];
      if (!kon) {
        // page-level flag
        if (ime === 'program') dodaj('program', 'Celoten program', { kaj: 'Potrditev, da je program dokončen (zdaj je cel program označen kot osnutek)', oblika: 'potrditev ekipe', povezava: url, vir });
        else dodaj(ime, 'Stran', { kaj: 'Potrditev vsebine strani', povezava: url, vir });
      } else if (kon.seznam === 'bloki') {
        const b = BLOKI[`${ime}#${kon.polja.id}`];
        dodaj(ime, b?.sekcija ?? kon.polja.naslov ?? 'Besedilo', { kaj: b?.kaj ?? `Besedilo: ${kon.polja.naslov ?? kon.polja.id}`, oblika: b?.oblika, povezava: url, vir });
      } else if (kon.seznam === 'podatki') {
        dodaj(ime, ime === 'pomagaj' ? 'Podatki za nakazilo' : 'Kontaktni podatki', { kaj: `${ime === 'pomagaj' ? 'Podatek za nakazilo' : 'Kontakt'}: ${kon.polja.oznaka}`, povezava: url, vir });
      } else if (kon.seznam === 'povezave') {
        dodaj(ime, 'Povezave', { kaj: `Povezava: ${kon.polja.naslov}`, oblika: 'URL', povezava: url, vir });
      } else {
        dodaj(ime, 'Drugo', { kaj: `Vsebina (${kon.seznam})`, povezava: url, vir });
      }
    } else if (h.rel.startsWith('src/content/program/')) {
      const naslov = polje(h.lines, 'naslov');
      const kon = yamlKontekst(h.lines, h.line - 1);
      if (kon?.seznam === 'viri') dodaj('program', naslov, { kaj: `Vir ali povezava (${kon.polja.naslov.replace(/^\[|\]$/g, '').split(':')[0]})`, oblika: 'naslov in povezava (URL) ali dokument', povezava: `/program/${ime}`, vir });
      else dodaj('program', naslov, { kaj: `Daljše besedilo področja »${naslov}«`, oblika: 'iz daljše verzije programa (nekaj odstavkov)', povezava: `/program/${ime}`, vir });
    } else if (h.rel.startsWith('src/content/sporni-projekti/')) {
      const naslov = polje(h.lines, 'naslov');
      const izmisljen = polje(h.lines, 'naslovPlaceholder') === 'true';
      const url = `/sporni-projekti#${ime}`;
      if (izmisljen) {
        dodaj('sporni-projekti', naslov, { kaj: `Ali naj bo na strani še en projekt? Če da: ime, opis, naše stališče in fotografija (zdaj »${naslov}« kot nadomestek)`, oblika: 'ime + 2–3 stavki + stališče + fotografija', povezava: url, vir });
      } else {
        dodaj('sporni-projekti', naslov, { kaj: `Opis projekta: ${naslov} (kaj je, kje je in zakaj je sporen)`, oblika: '2–3 stavki', povezava: url, vir });
        dodaj('sporni-projekti', naslov, { kaj: `Fotografija: ${naslov}`, oblika: 'fotografija v originalni ločljivosti (z avtorjem)', povezava: url, vir });
      }
    } else if (h.rel.startsWith('src/content/vprasanja/')) {
      dodaj('vprasanja', 'Vprašanja in odgovori', { kaj: `Pravo vprašanje z odgovorom (zdaj primer: »${polje(h.lines, 'vprasanje')}«)`, oblika: 'vprašanje meščana + odgovor', povezava: '/vprasanja', vir });
    } else if (h.rel.startsWith('src/content/objave/')) {
      objave++;
    } else if (h.rel.startsWith('src/content/odprta-vprasanja/')) {
      dodaj('odprta-vprasanja', 'Celotno besedilo', { kaj: 'Pregled in potrditev besedila »Odprta vprašanja mesta« (zdaj označeno kot osnutek)', oblika: 'potrditev ekipe (ali nova verzija dokumenta)', povezava: '/odprta-vprasanja', vir });
    } else if (h.rel === 'src/data/site.ts' && /narocnik|Naročnik/.test(h.lines.slice(Math.max(0, h.line - 8), h.line).join('\n'))) {
      dodaj('noga', 'Politični oglas', { kaj: 'Naročnik (plačnik) z naslovom', oblika: 'ime in naslov naročnika', povezava: '/', vir });
    } else if (h.rel === 'src/components/ui/QuestionForm.astro') {
      dodaj('vprasanja', 'Obrazec', { kaj: 'Delovanje obrazca za vprašanja (zdaj še ne pošilja)', oblika: 'e-naslov, kamor naj prihajajo vprašanja', povezava: '/vprasanja', vir });
    } else if (h.rel === 'src/components/ui/PostCard.astro') {
      // generic image fallback for posts without an image; covered by the Instagram item below
    } else {
      dodaj('ostalo', 'Ostalo', { kaj: `Nadomestna vsebina (${h.text.slice(0, 60)})`, povezava: '/', vir });
    }
  }

  if (objave > 0) {
    dodaj('arhiv', 'Objave z Instagrama', { kaj: `Prave objave z Instagrama @skupajzamesto (zdaj ${objave} nadomestnih objav; prva prava objava jih vse odstrani)`, oblika: 'povezava do objave, datum, opis in prva slika (pri reelih naslovnica)', povezava: '/arhiv', vir: 'src/content/objave/' });
  }

  // candidates without a portrait (not placeholders in the files, but still missing)
  const portreti = new Set(Object.keys(import.meta.glob('../assets/fotografije/kandidati/*.jpg')).map((p) => p.split('/').pop()!.replace('.jpg', '')));
  const kandidati = (await getCollection('kandidati')).sort((a, b) => a.data.vrstniRed - b.data.vrstniRed);
  for (const k of kandidati) {
    if (!k.data.slika && !portreti.has(k.id)) {
      dodaj('lista', 'Fotografije kandidatov', { kaj: `Fotografija: ${k.data.ime}`, oblika: 'portret, originalna ločljivost', povezava: '/lista', vir: `src/assets/fotografije/kandidati/${k.id}.jpg` });
    }
  }

  const strani: Stran[] = STRANI.filter(([id]) => zbirka.has(id)).map(([id, ime, povezava]) => ({
    ime,
    povezava,
    sekcije: [...zbirka.get(id)!.entries()].map(([ime, postavke]) => ({ ime, postavke })),
  }));
  const skupaj = strani.reduce((n, s) => n + s.sekcije.reduce((m, x) => m + x.postavke.length, 0), 0);
  return { strani, skupaj, placeholderjev: hits.length };
}
