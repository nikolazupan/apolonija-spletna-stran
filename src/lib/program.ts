import { getCollection } from 'astro:content';

// Programme areas in flyer order.
export async function getProgram() {
  const podrocja = await getCollection('program');
  return podrocja.sort((a, b) => a.data.vrstniRed - b.data.vrstniRed);
}
