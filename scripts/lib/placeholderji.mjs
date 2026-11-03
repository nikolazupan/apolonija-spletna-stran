// Finds every remaining placeholder in src/ (shared by `npm run check-placeholders` and the team's
// internal page, so both always show the same list).
// Finds:
//   - content files (frontmatter of .md, .yaml, .json): every `osnutek: true` (also `naslovOsnutek`,
//     `uvodOsnutek`, `stalisceOsnutek`, ...), with its path in the file (e.g. bloki → skupaj → osnutek);
//   - components/pages (.astro, .ts, .js): hardcoded <Placeholder> and <ImagePlaceholder> (data-driven ones,
//     `<Placeholder active={…}>`, are skipped: their data is listed instead).
import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { parseDocument, visit, isMap, isPair, isSeq, isScalar } from 'yaml';

const OSNUTEK = /osnutek$/i;
const code = [
  { re: /<Placeholder\b/, label: '<Placeholder>' },
  { re: /<ImagePlaceholder\b/, label: '<ImagePlaceholder>' },
];
const extensions = /\.(md|mdx|ya?ml|json|astro|ts|js)$/;
// Component definitions themselves are not placeholders.
const ignore = ['src/components/Placeholder.astro', 'src/components/ImagePlaceholder.astro', 'src/content.config.ts'];

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else if (extensions.test(entry.name)) yield path;
  }
}

// YAML part of a content file and the line it starts on (0-based): frontmatter of .md, the whole .yaml/.json.
function yamlDel(rel, besedilo) {
  if (/\.(ya?ml|json)$/.test(rel)) return { yaml: besedilo, odmik: 0 };
  const m = besedilo.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return m ? { yaml: m[1], odmik: 1 } : null;
}

// Every `…osnutek: true` in a YAML document: path from the root (keys and list indexes), the object it is in,
// the list item it belongs to (for list files: one entry), and its line.
function osnutkiVYaml(yaml) {
  const doc = parseDocument(yaml);
  const zadetki = [];
  visit(doc, {
    Pair(_, pair, pot) {
      if (!isScalar(pair.key) || !OSNUTEK.test(String(pair.key.value))) return;
      if (!isScalar(pair.value) || pair.value.value !== true) return;
      const kljuci = [];
      let element = null;
      for (let i = 0; i < pot.length; i++) {
        const n = pot[i];
        if (isPair(n) && isScalar(n.key)) kljuci.push(String(n.key.value));
        if (isSeq(n)) {
          const otrok = pot[i + 1] ?? pair;
          const idx = n.items.indexOf(otrok);
          kljuci.push(idx);
          if (element === null && isMap(otrok)) element = otrok.toJSON();
        }
      }
      kljuci.push(String(pair.key.value));
      const stars = pot[pot.length - 1];
      const zacetek = pair.key.range?.[0] ?? 0;
      zadetki.push({
        pot: kljuci,
        polja: isMap(stars) ? stars.toJSON() : {},
        element,
        vrstica: yaml.slice(0, zacetek).split('\n').length - 1,
      });
    },
  });
  return { zadetki, podatki: doc.toJS() ?? {} };
}

// root: project root. Returns [{ rel, line, label, text, lines, pot?, polja?, element?, podatki? }]
// (lines = the whole file; pot/polja/element/podatki only for content files, see osnutkiVYaml).
export async function najdiPlaceholderje(root) {
  const hits = [];
  for await (const file of walk(join(root, 'src'))) {
    const rel = relative(root, file);
    if (ignore.includes(rel)) continue;
    const besedilo = await readFile(file, 'utf8');
    const lines = besedilo.split('\n');

    if (rel.startsWith('src/content/') && /\.(md|mdx|ya?ml|json)$/.test(rel)) {
      const del = yamlDel(rel, besedilo);
      if (!del) continue;
      const { zadetki, podatki } = osnutkiVYaml(del.yaml);
      for (const z of zadetki) {
        const line = z.vrstica + del.odmik + 1;
        hits.push({ rel, line, label: z.pot.join('.'), text: lines[line - 1].trim(), lines, pot: z.pot, polja: z.polja, element: z.element, podatki });
      }
      continue;
    }

    lines.forEach((line, i) => {
      const t = line.trim();
      // Skip comments, and wrappers driven by a flag (`<Placeholder active=`, `? <Placeholder`) and image fallbacks with a data-driven label: the data itself is listed.
      if (t.startsWith('//') || t.startsWith('#') || /\?\s*<(Image)?Placeholder\b/.test(t) || /<Placeholder active=/.test(t) || /<ImagePlaceholder label=\{/.test(t)) return;
      for (const { re, label } of code) {
        if (re.test(line)) hits.push({ rel, line: i + 1, label, text: t, lines });
      }
    });
  }
  return hits.sort((a, b) => a.rel.localeCompare(b.rel) || a.line - b.line);
}
