import { getEntry } from 'astro:content';

// Loads a page from src/content/strani/<id>.md, with a helper to pick one of its named text blocks
// (`bloki.<name>` in the file). A missing block fails the build, so a typo never renders an empty section.
export async function getStran(id: string) {
  const stran = await getEntry('strani', id);
  if (!stran) throw new Error(`Missing src/content/strani/${id}.md`);
  const blok = (ime: string) => {
    const b = stran.data.bloki[ime];
    if (!b) throw new Error(`${id}.md: missing block "bloki.${ime}"`);
    return b;
  };
  return { ...stran.data, blok };
}
