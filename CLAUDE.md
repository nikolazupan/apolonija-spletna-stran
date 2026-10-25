# Campaign website: Apolonija Simon za županjo (Ljubljana 2026)

## What this project is
A campaign website for **Apolonija Simon**, candidate of the list **Vesna in civilna družba** for mayor of Ljubljana in the 2026 local elections. Planned domain: kaksnomestohocemo.si.

The current goal is a **semi-polished prototype** that the campaign team can react to, edit and extend. Structure, texts and design are not final. Build everything so it is easy to change: content lives in content files, not hardcoded in components.

## Language
- All website text is in **Slovenian** (use č, š, ž correctly; `<html lang="sl">`).
- URL slugs in Slovenian, without diacritics (e.g. `/sporni-projekti`).
- Code, comments and commit messages in English.

## Tech
- Astro + Tailwind CSS, static output.
- Content in Astro content collections (`src/content/`), one collection per content type (program, sporni-projekti, kandidati, objave, ...).
- Minimal client-side JavaScript; use it only where interaction needs it.
- Mobile first. Most visitors will arrive from Instagram on a phone.
- Images optimized with Astro's image handling.

## Background (real, from public sources)
- Apolonija Simon is an academic painter and the headmistress of Srednja šola za oblikovanje in fotografijo Ljubljana.
- Key message: a different way of running the city. Inclusive city politics that identifies problems early, works from data and expert knowledge, listens to residents, and acts publicly and transparently. Development only makes sense if it improves residents' quality of life; the city is not a company.
- Campaign themes: housing, transport, health, clean environment, greenery, culture, public space, transparency, creativity, cooperation with residents.
- Contested projects she has named: the C0 sewage canal and the planned waste incinerator.
- Lead of the city council list: Denis Striković (current city councillor).
Use these facts where relevant. Do not invent further facts about her or the list.

## Site structure
Main menu:
1. **Vstopna stran** (`/`)
   - Logos: Vesna in civilna družba + "Apolonija Simon. za županjo"
   - Photo of Apolonija, linking to her subpage
   - Text: why Vesna and civil society are joining forces, and why Apolonija is running
   - Box: latest social media post, linking to the post archive
   - Prominent icon/box linking to the online survey
2. **Apolonija Simon** (`/apolonija-simon`): photos, text, link to her personal website
3. **Lista Vesna in civilna družba** (`/lista`): short text, city council candidates with photos and descriptions, lists of candidates for četrtne skupnosti
4. **Program** (`/program`): 8 points in short form; each links to a longer text page (`/program/[slug]`) with references (links or extra text pages)
5. **Sporni projekti + naše stališče** (`/sporni-projekti`): per project an image, short text and our position
6. **Spletna anketa** (`/anketa`): send suggestions, join us, sign up for updates
7. **Arhiv objav** (`/arhiv`): grid of about 5 per row, newest first (top left), date under each. Posts are mixed: graphics, text, photos, video
8. **Pomagaj, če lahko** (`/pomagaj`): donation request with payment details
9. **Kontakt** (`/kontakt`): contact details, links to Apolonija's personal site and Vesna's website

Footer on every page: campaign organizer notice ("Naročnik: ..."), privacy notice link, social links.

## Design direction
- The candidate is a painter and heads a design school. The site must feel **art-driven and authored**, not like a template (no Squarespace / generic startup look).
- The visual reference is the campaign print material in `design-reference/` (banner and flyer PDFs, JPEGs). **Study these files before any design work** and derive colors, typography, composition and graphic elements from them.
- Prefer: confident typography, asymmetric compositions, visible texture or hand-made elements, art and photography used as structural design elements, generous whitespace.
- Avoid: generic hero + three-card layouts, stock icons, default Tailwind look, gradients and shadows that aren't in the print material.
- Define colors and fonts once (Tailwind theme / CSS variables) so the designer can adjust them later in one place.
- Accessible contrast and readable body text, even when the design is bold.
- Reference sites the team likes for function and feel: lukazaljubljano.si, zohranfornyc.com (do not copy them).

### Chosen direction: B · "Atelje" (decided 2026-10-25)
The hand-made marks of the print material become the structure of the site. Build every page in this language.
- **Ground:** cream paper with a light grain (`paper` utility in `global.css`, inline SVG noise, no image file).
- **Photos:** clipped into the organic blob shape from the posters, slightly rotated, like paper cut-outs (`CutoutImage`, shapes in `src/lib/blob.ts`). Photos may overlap headlines.
- **Typography:** oversized, condensed, tight headlines with stepped line indents (`display` utility), like the posters' "Kakšno / ·mesto / hočemo!".
- **Hand-drawn marks:** crayon stroke before "Apolonija", hand-drawn circle around the ballot number 6 ("Obkroži 6"), underlines, arrows. Each is a separate SVG in `src/assets/risbe/`, rendered via `Risba.astro`; replace files with scanned drawings later (see the README there).
- **Accents:** green survey band, black footer, black pill buttons. No gradients, no shadows.

**Colors** (defined once in the `@theme` block of `src/styles/global.css`):
| Token | Hex | Source |
|---|---|---|
| `zelena` | `#009854` | print green C100 M0 Y90 K0 (exact, sRGB conversion). Use this, not a neon screen green. |
| `zelena-temna` | `#00733f` | darker green for small text on cream/white (AA contrast) |
| `krema` | `#f0e8d4` | print cream C4 M6 Y13 K0 (exact) |
| `crna` | `#141414` | K100 |
| `bela` | `#ffffff` | |
| `rdeca` | `#dc4c28` | estimated from poster 35x504; used only for OSNUTEK markers |

Print green on cream/white is ~3.7:1: use it only for large text and shapes; small text uses `zelena-temna` or `crna`.

**Fonts:** the print uses Area Inktrap (commercial, not licensed for web). Stand-in: **Bricolage Grotesque** (variable, self-hosted via `@fontsource-variable/bricolage-grotesque`), for headlines (weight 800, `font-stretch: 85%`) and body text. If a web licence for Area is bought, swap `--font-display` / `--font-sans` in `global.css`.

## Placeholder content (IMPORTANT)
Most texts are still being written. Invented content is allowed only as a clearly marked placeholder:
- **In content files:** every entry that is not real gets `placeholder: true` in its frontmatter. For partially invented text inside real content, use the `<Placeholder>` component (or equivalent marker) around the invented part.
- **On the page:** placeholder content is visibly marked (e.g. striped highlight or dashed outline plus a small "OSNUTEK" label), so nobody mistakes it for approved text.
- **One switch:** a single config flag turns the visual marking on/off.
- **Check script:** `npm run check-placeholders` lists every remaining placeholder (file and location), so nothing slips into the final site.
- **What placeholders may say:** describe what will go there (e.g. "[Tu bo kratek opis točke programa o prometu.]") or use neutral filler. **Never invent political positions, promises, quotes, statistics, or statements attributed to Apolonija or anyone else**, and never invent names of real people (use "Kandidat/ka 1" etc.).
- **Images:** use clearly labeled grey placeholder boxes ("FOTO: Apolonija"), not stock photos of people.
- Real content (from the background section above or supplied by the team) is not marked.

## Features: prototype first
- **Latest post / archive:** for now a manually maintained content collection (image, type, date, link). Automatic import from Instagram is a later decision; keep the data shape compatible with it.
- **Instagram embeds:** click-to-load (thumbnail first, embed only on click). No Meta scripts on page load.
- **Survey / sign-up:** build the UI only; no backend yet. Mark it as non-functional in the prototype.
- **Donations:** placeholder payment details only.
- **Analytics / cookies:** none for now.

## Working rules
- Build page by page. Show the result and wait for feedback before moving to the next page.
- Before larger changes, briefly say what you plan to do.
- Never edit or delete files in `design-reference/`.
- Keep components small and reusable (layout, header/menu, footer, section blocks, placeholder marker).
