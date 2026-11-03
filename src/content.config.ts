import { defineCollection, reference } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { objaveLoader } from './lib/objave-loader';

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
      // shortened texts for the highlighted areas on this page, by area file name (the full text stays on /program)
      poudarkiBesedila: z.record(z.string(), z.string()).default({}),
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

// Programme areas (podatki/vsebina/program-povzetek.md). One file per area; the file name is the URL slug (/program/[slug]).
// `povzetek` is the short description from the summary, the body is the longer text for the area page.
const program = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/program' }),
  schema: z.object({
    naslov: z.string(),
    vrstniRed: z.number(),
    povzetek: z.string(),
    viri: z.array(povezava).default([]),
    placeholder: z.boolean().default(false),
  }),
});

// City council list, in ballot order. Only public data: name, part of the list, professional title, photo.
const kandidati = defineCollection({
  loader: file('src/content/kandidati/mestni-svet.yaml'),
  schema: ({ image }) =>
    z.object({
      ime: z.string(),
      vrstniRed: z.number(),
      nosilec: z.boolean().default(false),
      // part of the list the candidate belongs to
      clan: z.enum(['Vesna', 'Civilna iniciativa']),
      // professional or academic title, exactly as supplied
      naziv: z.string(),
      slika: image().optional(),
    }),
});

// Candidate lists for četrtne skupnosti, one entry per četrtna skupnost.
const cetrtneSkupnosti = defineCollection({
  loader: file('src/content/kandidati/cetrtne-skupnosti.yaml'),
  schema: z.object({
    ime: z.string(),
    // order of the source file
    vrstniRed: z.number(),
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
      // programme area the position is quoted from (file name in src/content/program/)
      stalisceVir: reference('program').optional(),
      // position is not written yet
      stalisceOsnutek: z.boolean().default(false),
      slika: image().optional(),
      oznakaSlike: z.string().optional(),
      // description and photo are not supplied yet
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
  // hand-made entries in src/content/objave/, or a Behold feed when BEHOLD_FEED_URL is set (src/lib/objave-loader.ts)
  loader: objaveLoader(),
  schema: ({ image }) =>
    z.object({
      datum: z.coerce.date(),
      tip: z.enum(['grafika', 'fotografija', 'video', 'reel', 'carousel']),
      platforma: z.enum(['instagram', 'facebook']).default('instagram'),
      // permalink of the post
      povezava: z.string(),
      // first line of the caption
      opis: z.string(),
      // hand-made entries: local image (src/assets/objave/); feed entries: remote image URL
      slika: image().optional(),
      slikaUrl: z.string().optional(),
      placeholder: z.boolean().default(false),
    }),
});

// "Odprta vprašanja mesta" (/odprta-vprasanja): the team's document, body kept exactly as written.
const odprtaVprasanja = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/odprta-vprasanja' }),
  schema: z.object({
    naslov: z.string(),
    opis: z.string(),
    uvod: z.string(),
    uvodPlaceholder: z.boolean().default(false),
    placeholder: z.boolean().default(false),
  }),
});

// Apolonija's CV (/apolonija-simon), one file per section, text exactly as in podatki/vsebina/zivljenjepis-apolonija.md.
// vrsta: uvod = intro text under the header, razdelek = collapsible section, zakaj = "Zakaj kandidiram" (prominent).
// casovnica: "### <year> – <title>" headings are shown as a timeline (src/lib/casovnica.ts).
const zivljenjepis = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/zivljenjepis' }),
  schema: z.object({
    naslov: z.string(),
    vrstniRed: z.number(),
    vrsta: z.enum(['uvod', 'razdelek', 'zakaj']),
    casovnica: z.boolean().default(false),
  }),
});

// Campaign posters (/arhiv → "Plakati"); images made by `npm run plakati`.
const plakati = defineCollection({
  loader: file('src/content/plakati/plakati.yaml'),
  schema: z.object({
    vrstniRed: z.number(),
    // the poster's slogan, as printed (alt text and lightbox title)
    naslov: z.string(),
  }),
});

// Open items for the team (internal team page), maintained by hand.
const odprteZadeve = defineCollection({
  loader: file('src/content/odprte-zadeve/odprte-zadeve.yaml'),
  schema: z.object({
    naslov: z.string(),
    opis: z.string(),
    kdo: z.string().optional(),
    status: z.enum(['odprto', 'v teku', 'urejeno']).default('odprto'),
  }),
});

export const collections = { odprteZadeve, plakati, strani, program, kandidati, cetrtneSkupnosti, sporniProjekti, vprasanja, objave, odprtaVprasanja, zivljenjepis };
