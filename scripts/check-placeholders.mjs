#!/usr/bin/env node
// Lists every remaining placeholder in the project, so nothing slips into the final site.
// The scan itself is in scripts/lib/placeholderji.mjs (also used by the team's internal page).
// Exits with code 1 when placeholders remain and --strict is passed (for use before launch / in CI).

import { najdiPlaceholderje } from './lib/placeholderji.mjs';

const root = new URL('..', import.meta.url).pathname;
const strict = process.argv.includes('--strict');
const hits = await najdiPlaceholderje(root);

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
