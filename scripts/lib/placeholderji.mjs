// Finds every remaining placeholder in src/ (shared by `npm run check-placeholders` and the team's
// internal page, so both always show the same list).
// Finds: `placeholder: true` in content/data files, <Placeholder> and <ImagePlaceholder> in components/pages.
import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const rules = [
  { re: /placeholder:\s*true/, label: 'placeholder: true' },
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

// root: project root. Returns [{ rel, line, label, text, lines }] (lines = the whole file, for context).
export async function najdiPlaceholderje(root) {
  const hits = [];
  for await (const file of walk(join(root, 'src'))) {
    const rel = relative(root, file);
    if (ignore.includes(rel)) continue;
    const lines = (await readFile(file, 'utf8')).split('\n');
    lines.forEach((line, i) => {
      const t = line.trim();
      // Skip comments, and wrappers driven by a `placeholder` flag (`? <Placeholder`, `<Placeholder active=`) and image fallbacks with a data-driven label: the data itself is listed.
      if (t.startsWith('//') || t.startsWith('#') || /\?\s*<(Image)?Placeholder\b/.test(t) || /<Placeholder active=/.test(t) || /<ImagePlaceholder label=\{/.test(t)) return;
      for (const { re, label } of rules) {
        if (re.test(line)) hits.push({ rel, line: i + 1, label, text: t, lines });
      }
    });
  }
  return hits.sort((a, b) => a.rel.localeCompare(b.rel) || a.line - b.line);
}
