#!/usr/bin/env node
// Lists every remaining placeholder in the project, so nothing slips into the final site.
// Finds: `placeholder: true` in content/data files, <Placeholder> and <ImagePlaceholder> in components/pages.
// Exits with code 1 when placeholders remain and --strict is passed (for use before launch / in CI).

import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const strict = process.argv.includes('--strict');

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

const hits = [];
for await (const file of walk(join(root, 'src'))) {
  const rel = relative(root, file);
  if (ignore.includes(rel)) continue;
  const lines = (await readFile(file, 'utf8')).split('\n');
  lines.forEach((line, i) => {
    const t = line.trim();
    // Skip comments, and conditional wrappers driven by a `placeholder` flag (the data itself is listed).
    if (t.startsWith('//') || t.startsWith('#') || /\?\s*<(Image)?Placeholder\b/.test(t)) return;
    for (const { re, label } of rules) {
      if (re.test(line)) hits.push({ rel, line: i + 1, label, text: line.trim() });
    }
  });
}

if (hits.length === 0) {
  console.log('No placeholders left.');
  process.exit(0);
}

let lastFile = '';
for (const h of hits) {
  if (h.rel !== lastFile) console.log(`\n${h.rel}`);
  lastFile = h.rel;
  console.log(`  ${String(h.line).padStart(4)}  ${h.label.padEnd(20)} ${h.text.slice(0, 90)}`);
}
console.log(`\n${hits.length} placeholder(s) in ${new Set(hits.map((h) => h.rel)).size} file(s).`);
process.exit(strict ? 1 : 0);
