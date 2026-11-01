import { defineCollection, reference } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Text blocks of a page. A block with `placeholder: true` is not approved text yet.
const blok = z.object({
  id: z.string(),
  naslov: z.string().optional(),
  besedilo: z.string(),
  placeholder: z.boolean().default(false),
});

// Label + value pairs (payment details, contact details, ...).
const podatek = z.object({
  oznaka: z.string(),
  vrednost: z.string(),
  // optional link for the value (mailto:, tel:, https:)
  povezava: z.string().optional(),
  placeholder: z.boolean().default(false),
});

// External or internal link.
const povezava = z.object({
  naslov: z.string(),
  url: z.string(),
  placeholder: z.boolean().default(false),
});

// Fixed pages (homepage, subpages): frontmatter holds the page's texts.
// One file per page in src/content/strani/, file name = page id.
const strani = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/strani' }),
  schema: ({ image }) =>
    z.object({
      // page title (also used in <title>) and meta description
      naslov: z.string(),
      opis: z.string(),
      placeholder: z.boolean().default(false),
      hero: z
        .object({
          podnaslov: z.string(),
          // ballot line next to the circled number from the posters, e.g. "Za županjo obkroži:"
          obkrozi: z.string().optional(),
        })
        .optional(),
      // Programme areas highlighted on this page (homepage: the 3 key points), by file name in src/content/program/.
      poudarki: z.array(reference('program')).default([]),
      bloki: z.array(blok).default([]),
      podatki: z.array(podatek).default([]),
      povezave: z.array(povezava).default([]),
      // Real quotes only, each with its source.
      citati: z
        .array(
          z.object({
            besedilo: z.string(),
            vir: z.string(),
            url: z.string().optional(),
          }),
        )
        .default([]),
      // Photos: either a real image (slika) or a labeled placeholder box (oznaka).
      fotografije: z
        .array(
          z.object({
            slika: image().optional(),
            alt: z.string().optional(),
            oznaka: z.string().optional(),
          }),
        )
        .default([]),
    }),
});

// Programme areas (from the campaign flyer). One file per area; the file name is the URL slug (/program/[slug]).
// `tocke` are the two short points from the flyer, the body is the longer text for the area page.
const program = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/program' }),
  schema: z.object({
    naslov: z.string(),
    vrstniRed: z.number(),
    tocke: z.array(z.string()).min(1),
    viri: z.array(povezava).default([]),
    placeholder: z.boolean().default(false),
  }),
});

// City council list, in ballot order (names from the official flyer).
const kandidati = defineCollection({
  loader: file('src/content/kandidati/mestni-svet.yaml'),
  schema: ({ image }) =>
    z.object({
      ime: z.string(),
      vrstniRed: z.number(),
      nosilec: z.boolean().default(false),
      opis: z.string(),
      slika: image().optional(),
      // true while the description/photo are not supplied (the name itself is real)
      placeholder: z.boolean().default(false),
    }),
});

// Candidate lists for četrtne skupnosti, one entry per četrtna skupnost.
const cetrtneSkupnosti = defineCollection({
  loader: file('src/content/kandidati/cetrtne-skupnosti.yaml'),
  schema: z.object({
    ime: z.string(),
    kandidati: z.array(z.string()),
    placeholder: z.boolean().default(false),
  }),
});

// Contested projects and our position.
const sporniProjekti = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/sporni-projekti' }),
  schema: ({ image }) =>
    z.object({
      naslov: z.string(),
      // the project name itself is not real (e.g. "Sporni projekt 3")
      naslovPlaceholder: z.boolean().default(false),
      vrstniRed: z.number(),
      opis: z.string(),
      stalisce: z.string(),
      slika: image().optional(),
      oznakaSlike: z.string().optional(),
      // description and position are not approved yet
      placeholder: z.boolean().default(false),
    }),
});

// Questions from residents with Apolonija's answers (/vprasanja). The body is the answer.
const vprasanja = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/vprasanja' }),
  schema: z.object({
    vprasanje: z.string(),
    datum: z.coerce.date(),
    placeholder: z.boolean().default(false),
  }),
});

// Social media posts for the homepage and /arhiv.
// Field names map to an Instagram Graph API media object for a later automatic import:
// id → file name, datum → timestamp, tip → media_type (IMAGE → foto/grafika, VIDEO → video, CAROUSEL_ALBUM → foto),
// opis → caption, povezava → permalink, slika → media_url / thumbnail_url.
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

export const collections = { strani, program, kandidati, cetrtneSkupnosti, sporniProjekti, vprasanja, objave };
