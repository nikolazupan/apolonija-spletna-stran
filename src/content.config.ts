import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Text blocks of a page. A block with `placeholder: true` is not approved text yet.
const blok = z.object({
  id: z.string(),
  naslov: z.string().optional(),
  besedilo: z.string(),
  placeholder: z.boolean().default(false),
});

// Fixed pages (homepage, ...): frontmatter holds the page's text blocks.
const strani = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/strani' }),
  schema: z.object({
    naslov: z.string(),
    opis: z.string().optional(),
    placeholder: z.boolean().default(false),
    hero: z
      .object({
        slogan: z.array(z.string()),
        podnapis: z.string(),
        stevilka: z.number(),
        stevilkaOznaka: z.string(),
        volitve: z.string(),
      })
      .optional(),
    bloki: z.array(blok).default([]),
  }),
});

// Social media posts for the homepage box and /arhiv.
// Field names map to an Instagram Graph API media object for a later automatic import:
// id → id, datum → timestamp, tip → media_type, opis → caption, povezava → permalink, slika → media_url/thumbnail_url.
const objave = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/objave' }),
  schema: ({ image }) =>
    z.object({
      datum: z.coerce.date(),
      tip: z.enum(['grafika', 'besedilo', 'foto', 'video']),
      platforma: z.enum(['instagram', 'facebook']).default('instagram'),
      povezava: z.string(),
      opis: z.string(),
      slika: image().optional(),
      placeholder: z.boolean().default(false),
    }),
});

export const collections = { strani, objave };
