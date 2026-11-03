// Turns the placeholder scan (scripts/lib/placeholderji.mjs, same as `npm run check-placeholders`)
// into a list of missing content for the team page: page → section → item, in plain Slovenian.
// Nothing here is maintained per item: descriptions come from the content files themselves
// (block titles, labels) plus a few rules per file type; each item links to its entry in Pages CMS. Anything not recognised is still listed
// under "Ostalo" with its file and line, so nothing gets lost.
import { getCollection } from 'astro:content';
import { najdiPlaceholderje } from '../../scripts/lib/placeholderji.mjs';
import { urediVCms } from './cms';

export interface Postavka {
  kaj: string;
  oblika?: string;
  povezava: string;
  // link to the matching entry in Pages CMS ("Uredi v CMS"), when the file is editable there
  cms?: string;
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

// Plainer wording / format hints for text blocks, by "page#block name" (optional; otherwise the block title is used).
const BLOKI: Record<string, { sekcija?: string; kaj: string; oblika?: string }> = {
  'vstopna#poudarki': { sekcija: 'Ključne točke programa', kaj: 'Izbor 3 ključnih točk programa za vstopno stran', oblika: '3 od 9 področij, s skrajšanimi besedili (2 stavka)' },
  'vstopna#kandidatura': { sekcija: 'Zakaj Apolonija kandidira', kaj: 'Besedilo: zakaj Apolonija kandidira', oblika: '1–2 odstavka' },
  'vstopna#skupaj': { sekcija: 'Vesna in civilna družba skupaj', kaj: 'Besedilo: zakaj Vesna in civilna družba nastopata skupaj (zdaj je na strani osnutek, ki ga je treba potrditi ali nadomestiti)', oblika: '1 odstavek' },
  'lista#uvod': { sekcija: 'Uvod', kaj: 'Uvodno besedilo o listi Vesna in civilna družba', oblika: '1 odstavek' },
  'lista#cetrtne': { sekcija: 'Četrtne skupnosti', kaj: 'Uvodno besedilo o kandidaturah v četrtnih skupnostih', oblika: '1–2 stavka' },
  'sporni-projekti#uvod': { sekcija: 'Uvod', kaj: 'Uvodno besedilo strani Sporni projekti', oblika: '1 odstavek' },
  'vprasanja#razlika': { sekcija: 'Uvod', kaj: 'Potrditev uvodne vrstice (razlika med to stranjo in Odprtimi vprašanji mesta)', oblika: 'potrditev ali popravek' },
  'vprasanja#obrazec': { sekcija: 'Obrazec', kaj: 'Delovanje obrazca za vprašanja (zdaj še ne pošilja)', oblika: 'e-naslov, kamor naj prihajajo vprašanja' },
  'arhiv#plakati': { sekcija: 'Plakati', kaj: 'Uvodno besedilo k plakatom', oblika: '1–2 stavka' },
  'pomagaj#uvod': { sekcija: 'Prošnja za donacijo', kaj: 'Besedilo: prošnja za donacijo (za kaj bomo sredstva porabili)', oblika: '1 odstavek' },
  'pomagaj#nakazilo': { sekcija: 'Podatki za nakazilo', kaj: 'Pojasnilo o nakazilu in morebitnih omejitvah donacij', oblika: '1–2 stavka' },
  'kontakt#uvod': { sekcija: 'Uvod', kaj: 'Uvodno besedilo (kdo odgovarja na sporočila in v kakšnem času)', oblika: '1–2 stavka' },
  'zasebnost#podrobnosti': { sekcija: 'Pravno besedilo', kaj: 'Pravno besedilo o varstvu osebnih podatkov', oblika: 'upravljavec, namen obdelave, hramba, pravice posameznika' },
  'noga#narocnik': { sekcija: 'Politični oglas', kaj: 'Naročnik (plačnik) z naslovom', oblika: 'ime in naslov naročnika' },
};

// One hit of the placeholder scan (scripts/lib/placeholderji.mjs). For content files: `pot` = path of the
// `…osnutek: true` field in the file, `polja` = the object it is in, `element` = its list item, `podatki` = whole file.
type Hit = {
  rel: string;
  line: number;
  label: string;
  text: string;
  lines: string[];
  pot?: (string | number)[];
  polja?: Record<string, unknown>;
  element?: Record<string, unknown> | null;
  podatki?: Record<string, unknown>;
};

const niz = (v: unknown) => (typeof v === 'string' ? v : '');

export async function getManjkajoce(root: string) {
  const hits: Hit[] = await najdiPlaceholderje(root);
  const zbirka = new Map<string, Map<string, Postavka[]>>();
  const dodaj = (stran: string, sekcija: string, p: Omit<Postavka, 'cms'>, cms?: string) => {
    if (!zbirka.has(stran)) zbirka.set(stran, new Map());
    const s = zbirka.get(stran)!;
    if (!s.has(sekcija)) s.set(sekcija, []);
    s.get(sekcija)!.push({ ...p, cms });
  };
  let objave = 0;

  for (const h of hits) {
    const vir = `${h.rel}:${h.line}`;
    const ime = h.rel.split('/').pop()!.replace(/\.(md|ya?ml)$/, '');
    const pot = h.pot ?? [];
    const kljuc = String(pot.at(-1) ?? '');
    const el = h.element ?? {};
    const podatki = h.podatki ?? {};
    const cms = urediVCms(h.rel);

    if (h.rel.startsWith('src/content/strani/')) {
      const [, , url] = STRANI.find(([id]) => id === ime) ?? ['', '', '/'];
      if (pot.length === 1) {
        // page-level flag
        if (ime === 'program') dodaj('program', 'Celoten program', { kaj: 'Potrditev, da je program dokončen (zdaj je cel program označen kot osnutek)', oblika: 'potrditev ekipe', povezava: url, vir }, cms);
        else dodaj(ime, 'Stran', { kaj: 'Potrditev vsebine strani', povezava: url, vir }, cms);
      } else if (pot[0] === 'bloki') {
        const b = BLOKI[`${ime}#${pot[1]}`];
        const naslov = niz(h.polja?.naslov);
        dodaj(ime, b?.sekcija ?? (naslov || 'Besedilo'), { kaj: b?.kaj ?? `Besedilo: ${naslov || pot[1]}`, oblika: b?.oblika, povezava: url, vir }, cms);
      } else if (pot[0] === 'podatki') {
        dodaj(ime, ime === 'pomagaj' ? 'Podatki za nakazilo' : 'Kontaktni podatki', { kaj: `${ime === 'pomagaj' ? 'Podatek za nakazilo' : 'Kontakt'}: ${niz(el.oznaka)}`, povezava: url, vir }, cms);
      } else if (pot[0] === 'povezave' || pot[0] === 'omrezja') {
        dodaj(ime, 'Povezave', { kaj: `Povezava: ${niz(el.naslov)}`, oblika: 'URL', povezava: url, vir }, cms);
      } else {
        dodaj(ime, 'Drugo', { kaj: `Vsebina (${pot.join(' → ')})`, povezava: url, vir }, cms);
      }
    } else if (h.rel.startsWith('src/content/program/')) {
      const naslov = niz(podatki.naslov);
      if (pot[0] === 'viri') dodaj('program', naslov, { kaj: `Vir ali povezava (${niz(el.naslov).replace(/^\[|\]$/g, '').split(':')[0]})`, oblika: 'naslov in povezava (URL) ali dokument', povezava: `/program/${ime}`, vir }, cms);
      else dodaj('program', naslov, { kaj: `Daljše besedilo področja »${naslov}«`, oblika: 'iz daljše verzije programa (nekaj odstavkov)', povezava: `/program/${ime}`, vir }, cms);
    } else if (h.rel.startsWith('src/content/sporni-projekti/')) {
      const naslov = niz(podatki.naslov);
      const izmisljen = podatki.naslovOsnutek === true;
      const url = `/sporni-projekti#${ime}`;
      if (kljuc === 'naslovOsnutek') {
        dodaj('sporni-projekti', naslov, { kaj: `Ali naj bo na strani še en projekt? Če da: ime, opis, naše stališče in fotografija (zdaj »${naslov}« kot nadomestek)`, oblika: 'ime + 2–3 stavki + stališče + fotografija', povezava: url, vir }, cms);
      } else if (izmisljen) {
        // covered by the item above
      } else if (kljuc === 'stalisceOsnutek') {
        dodaj('sporni-projekti', naslov, { kaj: `Naše stališče: ${naslov}`, oblika: '1–2 stavka', povezava: url, vir }, cms);
      } else {
        dodaj('sporni-projekti', naslov, { kaj: `Opis projekta: ${naslov} (kaj je, kje je in zakaj je sporen)`, oblika: '2–3 stavki', povezava: url, vir }, cms);
        dodaj('sporni-projekti', naslov, { kaj: `Fotografija: ${naslov}`, oblika: 'fotografija v originalni ločljivosti (z avtorjem)', povezava: url, vir }, cms);
      }
    } else if (h.rel.startsWith('src/content/vprasanja/')) {
      dodaj('vprasanja', 'Vprašanja in odgovori', { kaj: `Pravo vprašanje z odgovorom (zdaj primer: »${niz(podatki.vprasanje)}«)`, oblika: 'vprašanje meščana + odgovor', povezava: '/vprasanja', vir }, cms);
    } else if (h.rel.startsWith('src/content/objave/')) {
      objave++;
    } else if (h.rel.startsWith('src/content/odprta-vprasanja/')) {
      if (kljuc === 'uvodOsnutek') dodaj('odprta-vprasanja', 'Uvod', { kaj: 'Potrditev uvodne vrstice (razlika med to stranjo in Vprašanji in odgovori)', oblika: 'potrditev ali popravek', povezava: '/odprta-vprasanja', vir }, cms);
      else dodaj('odprta-vprasanja', 'Celotno besedilo', { kaj: 'Pregled in potrditev besedila »Odprta vprašanja mesta« (zdaj označeno kot osnutek)', oblika: 'potrditev ekipe (ali nova verzija dokumenta)', povezava: '/odprta-vprasanja', vir }, cms);
    } else if (h.rel === 'src/components/ui/PostCard.astro') {
      // generic image fallback for posts without an image; covered by the Instagram item below
    } else {
      dodaj('ostalo', 'Ostalo', { kaj: `Nadomestna vsebina (${h.text.slice(0, 60)})`, povezava: '/', vir }, cms);
    }
  }

  if (objave > 0) {
    dodaj('arhiv', 'Objave z Instagrama', { kaj: `Prave objave z Instagrama @skupajzamesto (zdaj ${objave} nadomestnih objav; prva prava objava jih vse odstrani)`, oblika: 'povezava do objave, datum, opis in prva slika (pri reelih naslovnica)', povezava: '/arhiv', vir: 'src/content/objave/' }, urediVCms('src/content/objave'));
  }

  // candidates without a portrait (not placeholders in the files, but still missing)
  const portreti = new Set(Object.keys(import.meta.glob('../assets/fotografije/kandidati/*.jpg')).map((p) => p.split('/').pop()!.replace('.jpg', '')));
  const kandidati = (await getCollection('kandidati')).sort((a, b) => a.data.vrstniRed - b.data.vrstniRed);
  const kandidatiCms = urediVCms('src/content/kandidati/mestni-svet.yaml');
  for (const k of kandidati) {
    if (!k.data.slika && !portreti.has(k.id)) {
      dodaj('lista', 'Fotografije kandidatov', { kaj: `Fotografija: ${k.data.ime}`, oblika: 'portret, originalna ločljivost', povezava: '/lista', vir: `src/content/kandidati/mestni-svet.yaml (${k.id})` }, kandidatiCms);
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
