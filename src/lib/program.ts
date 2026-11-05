import { getCollection, type CollectionEntry } from 'astro:content';

// Program chapters in leaflet order.
export async function getProgram() {
  const poglavja = await getCollection('program');
  return poglavja.sort((a, b) => a.data.vrstniRed - b.data.vrstniRed);
}

// Published additional texts, all or for one chapter, in their order.
export async function getDodatnaBesedila(poglavje?: string) {
  const besedila = await getCollection('dodatnaBesedila', (b) => b.data.objavljeno && (!poglavje || b.data.poglavje.id === poglavje));
  return besedila.sort((a, b) => a.data.vrstniRed - b.data.vrstniRed);
}

// URL of an additional text: /program/<chapter>/<file name>.
export const povezavaDodatnega = (b: CollectionEntry<'dodatnaBesedila'>) => `/program/${b.data.poglavje.id}/${b.id}`;

// Paragraphs of a plain-text field (separated by an empty line).
export const odstavki = (besedilo: string) => besedilo.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);

// Rendered HTML of an additional text, prepared for the page:
//   - reference marks "[1]", "[3, 4]" become links to the numbered list of sources (#vir-1 …);
//   - tables are wrapped in a box that scrolls horizontally on phones.
// Only numbers that have a source are linked.
export function pripraviBesedilo(html: string, steviloVirov: number): string {
  return html
    .replace(/\[(\d+(?:\s*,\s*\d+)*)\]/g, (cel, stevilke: string) => {
      const n = stevilke.split(',').map((x) => Number(x.trim()));
      if (n.some((x) => x < 1 || x > steviloVirov)) return cel;
      return `[${n.map((x) => `<a href="#vir-${x}" class="sklic" aria-label="Vir ${x}">${x}</a>`).join(', ')}]`;
    })
    .replace(/<table>/g, '<div class="tabela-ovoj" tabindex="0" role="region" aria-label="Tabela"><table>')
    .replace(/<\/table>/g, '</table></div>');
}
