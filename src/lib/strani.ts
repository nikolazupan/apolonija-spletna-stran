import { getEntry } from 'astro:content';

// Loads a page from src/content/strani/<id>.md, with a helper to pick its text blocks by id.
export async function getStran(id: string) {
  const stran = await getEntry('strani', id);
  if (!stran) throw new Error(`Missing src/content/strani/${id}.md`);
  const blok = (blokId: string) => {
    const b = stran.data.bloki.find((b) => b.id === blokId);
    if (!b) throw new Error(`${id}.md: missing block "${blokId}"`);
    return b;
  };
  return { ...stran.data, blok };
}
