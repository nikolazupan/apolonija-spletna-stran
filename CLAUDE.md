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
- Apolonija's personal website: https://www.apolonijasimon.si/ (real; used on /apolonija-simon, /kontakt and in the footer via `src/data/site.ts`).
Use these facts where relevant. Do not invent further facts about her or the list.

## Site structure
Main menu:
1. **Vstopna stran** (`/`)
   - Partner logos shown as a collaboration: "Vesna – zelena stranka" logo, "in", "civilna družba" (as on the banners), prominent
   - Hero heading is her name: "Apolonija Simon." + "Županja za vse meščane." ("Kakšno mesto hočemo!" is the domain name, not the page title). Composed like the posters: name on an organic white shape, cut-out photo on its own white paper shape overlapping it
   - Photo of Apolonija, linking to her subpage
   - Q&A box under the hero: "Imaš vprašanje? Mi imamo odgovore.", a field to ask a question, and a link to `/vprasanja`
   - Under the Q&A box: 3 key programme areas, each on its own hand-cut white paper shape (each slightly different, subtle wobble on hover, none with reduced motion), each linking to its `/program/[slug]` page; centered title, "Celoten program" link (green underline) below. The selection is set in `poudarki` in `src/content/strani/vstopna.md` (file names from `src/content/program/`). Current provisional selection: Upravljanje mesta in participacija, Stanovanjska politika, Okolje, pitna voda in čist zrak. The section stays marked OSNUTEK until the team decides the final 3.
   - Text: why Apolonija is running, then why Vesna and civil society are joining forces (framed blocks of equal size, alternating title/text columns, aligned across both)
   - Latest posts: title with archive link, then a row of the 3–4 newest posts (horizontally scrollable on mobile)
2. **Apolonija Simon** (`/apolonija-simon`): name and facts on a white hand-cut shape (text must always stay inside it), a cut-out of her face beside it (above it on phones, from `design-reference/4_Apolonija Portret.jpg`, copied to `src/assets/foto/`), quotes, text, link to her personal website. Uses real quotes from Siol.net, 1. 10. 2026 (source in `src/content/strani/apolonija-simon.md`); any further quotes must also be real and sourced.
3. **Lista Vesna in civilna družba** (`/lista`): short text, city council candidates with photos and descriptions, lists of candidates for četrtne skupnosti. City council: 45 real names in ballot order (official flyer) in `src/content/kandidati/mestni-svet.yaml`, Denis Striković is nosilec liste. Četrtne skupnosti: `cetrtne-skupnosti.yaml`, collapsible per ČS; which ČS the list runs in and the names are not known yet (placeholders).
4. **Program** (`/program`): **6 areas** (not 8), from the official campaign flyer (`design-reference/letak A52.jpg`), each with two short points; each area links to a longer text page (`/program/[slug]`) with references (links or extra text pages). Content: one file per area in `src/content/program/` (file name = slug, `vrstniRed` = flyer order, `tocke` = the two flyer points, body = longer text). The area names and points are real; the longer texts are not written yet, so every area is `placeholder: true`.
   1. Upravljanje mesta in participacija: Mesto posluša, ljudje odločajo. / Čisti računi.
   2. Okolje, pitna voda in čist zrak: Zaščita pitne vode. / Konec odpadkovnega kolonializma.
   3. Zelena Ljubljana in podnebna odpornost: Mesto zelenih otokov. / Prilagajanje na spremembe.
   4. Promet in javni prevoz: Učinkovit javni promet. / Mesto kratkih poti.
   5. Stanovanjska politika: Dom, ne privilegij. / Prispevek komercialnih gradenj.
   6. Socialna pravičnost, mladi in kultura: Ljubljana za vse. / Ustvarjalnost in dediščina.
5. **Sporni projekti + naše stališče** (`/sporni-projekti`): per project an image, short text and our position. One file per project in `src/content/sporni-projekti/`. Real names: kanalizacijski kanal C0, sežigalnica odpadkov; descriptions and positions are placeholders until the team writes them.
6. **Vprašanja in odgovori** (`/vprasanja`): list of questions residents have asked, with Apolonija's answers, and a form to ask a new one
7. **Arhiv objav** (`/arhiv`): grid of about 5 per row, newest first (top left), date under each. Posts are mixed: graphics, text, photos, video
8. **Pomagaj, če lahko** (`/pomagaj`): donation request with payment details
9. **Kontakt** (`/kontakt`): contact details, links to Apolonija's personal site and Vesna's website

Footer on every page: campaign organizer notice ("Naročnik: ..."), privacy notice link (`/zasebnost`), social links.

Also: `/zasebnost` (privacy notice, legal text still to be supplied) and a custom 404 page. Every page's title and meta description come from its file in `src/content/strani/` (`naslov`, `opis`); the layout appends "| Apolonija Simon za županjo".

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
- **Shapes with text:** always use `ShapedText` (`src/components/brand/ShapedText.astro`), directly or via `PaperCard` / `PageIntro`. It keeps the original irregular `Blob` outlines (stretched with `preserveAspectRatio="none"`) and builds the shape around the text: the text sits in the shape's largest inner rectangle (`inscribed()` in `src/lib/blob.ts`), so it stays inside the outline at any length and screen size. Shapes must stay irregular and hand-cut, never rectangles. A bare `Blob` is only for decorative backings behind fixed-size photos.
- **Photos:** clipped into the organic blob shape from the posters, slightly rotated, like paper cut-outs (`CutoutImage`, shapes in `src/lib/blob.ts`). Photos may overlap headlines and sit on white "paper" shapes, like the posters. On the cream ground, the poster colors are inverted: white organic shapes instead of cream ones.
- **Typography:** oversized, condensed, tight headlines with stepped line indents (`display` utility), like the posters' "Kakšno / ·mesto / hočemo!".
- **Hand-drawn marks:** crayon stroke before "Apolonija", hand-drawn circle around the ballot number 6 ("Obkroži 6"), underlines, arrows. Each is a separate SVG in `src/assets/risbe/`, rendered via `Risba.astro`; replace files with scanned drawings later (see the README there).
- **Accents:** green Q&A band, black footer, black pill buttons, thin black frames around text blocks. No gradients, no shadows.
- **Scale:** bold but not oversized. Keep headlines and section spacing moderate (the team found the first homepage too big); readability on a phone comes first.
- **Header:** sticky. Partner logo on the left, only a "Meni" button on the right, both on the same content edges as the page (no inline links). On phones (below `md`, 768px) it is one row: logo (sized to fill the space) and a hand-drawn hamburger icon button (`risbe/meni.svg`, 44×44 tap area, aria-label "Meni"); the overlay shows a hand-drawn close icon (`risbe/zapri.svg`) in the same place. No border line: at the top of the page the header blends into the paper; once scrolled it becomes a cream paper strip with a torn bottom edge and a soft shadow.
- **Navigation:** the "Meni" button opens a full-screen overlay on all screen sizes: translucent cream with blur, comfortable (not huge) link size, fade + staggered slide-in, clearly visible "Zapri" button, Esc closes, respects `prefers-reduced-motion`.
- **Hero rule:** photos must never cover text at any width (only the white background shapes may overlap). The homepage hero has no ballot number / election date element (removed). On phones (below `md`) the hero uses a tighter photo crop (`dezniki-blizje.jpg`), larger and centered; the Q&A heading is sized to the content width (`cqi`) so it spans edge to edge. The paper shape behind the hero photo is print green (`zelena`); the shape behind the name stays white. Name and photo sit close together, and the composition is centered as a group (equal empty space left and right). No crayon stroke next to the name in the hero. The name size uses container units (`cqi`) so it scales with the content width.
- **Side margins:** one shared container (`site-container` / `px-gutter` in `global.css`; `--gutter: clamp(1.5rem, 6vw, 5.5rem)` scales with the window, `--container: 84rem` max width). Every section, the header, the menu and the footer use it; change the margin there only.
- **Links vs buttons:** secondary links ("Celoten program", "Vse objave", "Več o Apoloniji") are text with a green underline, not filled buttons.

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
- **Latest post / archive:** for now a manually maintained content collection `src/content/objave/` (one file per post: datum, tip, platforma, povezava, opis, slika). **Open decision:** automatic import from Instagram (Graph API) is not decided yet. The fields are chosen to map 1:1 to an Instagram media object (see the comment in `src/content.config.ts`), so an import could later write the same files or replace the loader. All post types (grafika, besedilo, fotografija, video) use one identical card format (`PostCard.astro`): square thumbnail with a type tag, date on one line, 2-line caption, link. Video only adds a play button. No per-type layouts, so cards in a row always line up.
- **Instagram embeds:** click-to-load (thumbnail first, embed only on click). No Meta scripts on page load. Implemented in `PostCard.astro` (Instagram `/p/…`, `/reel/…` permalinks; posts with a `#` link show a prototype note instead).
- **Question form (Q&A):** build the UI only; no backend yet. Mark it as non-functional in the prototype. Answered questions will be a content collection shown on `/vprasanja`.
- **No survey:** the online survey was dropped from the site.
- **Donations:** placeholder payment details only.
- **Analytics / cookies:** none for now.

## Working rules
- Build page by page. Show the result and wait for feedback before moving to the next page.
- Before larger changes, briefly say what you plan to do.
- Never edit or delete files in `design-reference/`.
- Keep components small and reusable (layout, header/menu, footer, section blocks, placeholder marker).

## Before final launch
Checklist before the site goes public:
- [ ] Set `NOINDEX = false` in `src/config.ts` (preview mode adds `<meta name="robots" content="noindex, nofollow">` to every page and makes `/robots.txt` disallow everything). The 404 page stays noindex either way.
- [ ] Set `SHOW_PLACEHOLDERS = false` in `src/config.ts` and run `npm run check-placeholders -- --strict`: it must report no placeholders left.
- [ ] Confirm the organizer notice in the footer ("Naročnik: ..."), the payment details on /pomagaj and the contact details on /kontakt.
- [ ] Replace the placeholder Instagram/Facebook links in `src/data/site.ts`.

