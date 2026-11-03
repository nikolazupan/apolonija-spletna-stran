// Links into Pages CMS for a content file, from the entries in .pages.yml (so they always match the CMS config).
//   type: file       → <CMS_URL>/file/<name>
//   type: collection → <CMS_URL>/collection/<name>/edit/<encoded repo path>
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import { CMS_URL } from '../config';

type Vnos = { name: string; type: 'file' | 'collection' | 'group'; path?: string; items?: Vnos[] };

const vnosi: Vnos[] = [];
const zberi = (seznam: Vnos[]) =>
  seznam.forEach((v) => (v.type === 'group' ? zberi(v.items ?? []) : vnosi.push(v)));
zberi((parse(readFileSync('.pages.yml', 'utf8'))?.content ?? []) as Vnos[]);

// rel: repository path of a content file (e.g. src/content/program/uporabna-digitalizacija.md), or of a
// collection folder (e.g. src/content/objave → the collection's list).
// Returns the CMS link, or undefined when the file is not editable in the CMS.
export function urediVCms(rel: string): string | undefined {
  const mapa = vnosi.find((v) => v.type === 'collection' && v.path === rel.replace(/\/$/, ''));
  if (mapa) return `${CMS_URL}/collection/${encodeURIComponent(mapa.name)}`;
  const datoteka = vnosi.find((v) => v.type === 'file' && v.path === rel);
  if (datoteka) return `${CMS_URL}/file/${encodeURIComponent(datoteka.name)}`;
  const zbirka = vnosi.find((v) => v.type === 'collection' && v.path && rel.startsWith(`${v.path}/`));
  if (zbirka) return `${CMS_URL}/collection/${encodeURIComponent(zbirka.name)}/edit/${encodeURIComponent(rel)}`;
  return undefined;
}
