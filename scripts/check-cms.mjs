#!/usr/bin/env node
// Checks that .pages.yml (Pages CMS) covers the content files: every key used in a content file must have a
// field in .pages.yml, otherwise editors can't see it (and it may be lost when the CMS saves the file).
// Run after adding a field to a content file or to src/content.config.ts. Exits with code 1 on problems.
import { readFileSync, readdirSync } from 'node:fs';
import { parse } from 'yaml';
const root = new URL("..", import.meta.url).pathname;
const cfg = parse(readFileSync(`${root}/.pages.yml`, 'utf8'));
const entries = [];
const walk = (l) => l.forEach((e) => (e.type === 'group' ? walk(e.items) : entries.push(e)));
walk(cfg.content);
const data = (p) => {
  const s = readFileSync(`${root}/${p}`, 'utf8');
  if (p.endsWith('.md')) { const m = s.match(/^---\n([\s\S]*?)\n---/); return { ...(parse(m[1]) ?? {}), ...(s.slice(m[0].length).trim() ? { body: 1 } : {}) }; }
  return parse(s);
};
const problems = [];
const cmp = (val, fields, where) => {
  if (val == null) return;
  if (Array.isArray(val)) return val.forEach((v, i) => cmp(v, fields, `${where}[${i}]`));
  if (typeof val !== 'object') return;
  const names = new Map(fields.map((f) => [f.name, f]));
  for (const k of Object.keys(val)) {
    const f = names.get(k);
    if (!f) { problems.push(`${where}: key "${k}" not in .pages.yml`); continue; }
    if (f.type === 'object' && f.fields) cmp(val[k], f.fields, `${where}.${k}`);
  }
};
for (const e of entries) {
  const files = e.type === 'file' ? [e.path] : readdirSync(`${root}/${e.path}`).filter((f) => f.endsWith('.md')).map((f) => `${e.path}/${f}`);
  for (const f of files) cmp(data(f), e.fields, f);
}
if (problems.length) {
  console.log(problems.join('\n'));
  process.exit(1);
}
console.log('All content keys are covered by .pages.yml.');
