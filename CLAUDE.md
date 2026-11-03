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
- **Dev server gotcha:** after changing `src/content.config.ts` (schema) or adding new files with new Tailwind classes, restart the dev server; after a schema change also delete `node_modules/.astro` (stale content cache: new fields are missing or pages fail with "Missing src/content/strani/…"). `astro sync` alone does not clear it.

## Background (real, from public sources)
- Apolonija Simon is an academic painter (master of arts, ALU Ljubljana) and the headmistress of Srednja šola za oblikovanje in fotografijo Ljubljana (SŠOF) since 2022 (almost 850 students, ~100 staff); she has taught drawing and painting there since 1999.
- She is a non-partisan candidate from civil society, running with the support of Vesna.
- Source for her biography: her CV, `podatki/vsebina/zivljenjepis-apolonija.md` (approved, first person). Her date and place of birth are in it but are left off the site for now; ask before adding them.
- Key message: a different way of running the city. Inclusive city politics that identifies problems early, works from data and expert knowledge, listens to residents, and acts publicly and transparently. Development only makes sense if it improves residents' quality of life; the city is not a company.
- Campaign themes: housing, transport, health, clean environment, greenery, culture, public space, transparency, creativity, cooperation with residents.
- Contested projects she has named: the C0 sewage canal and the planned waste incinerator.
- Lead of the city council list: Denis Striković (current city councillor).
- Apolonija's personal website: https://www.apolonijasimon.si/ (real; used on /apolonija-simon, /kontakt and in the footer, `src/content/strani/noga.md`).
Use these facts where relevant. Do not invent further facts about her or the list.

## Site structure
Main menu:
1. **Vstopna stran** (`/`)
   - Partner logos shown as a collaboration: "Vesna – zelena stranka" logo, "in", "civilna družba" (as on the banners), prominent
   - Hero heading is her name: "Apolonija Simon." + "Županja za vse meščane." ("Kakšno mesto hočemo!" is the domain name, not the page title). Composed like the posters: name on an organic white shape, cut-out photo on its own white paper shape overlapping it
   - The green photo shape flips like a card (`src/components/home/HeroObrat.astro`) between her photo and the newest post from `src/content/objave/` (picked automatically): photo first, after 2.5 s the post, then every 6 s. Pauses on hover/focus, stops while out of view or the tab is hidden, click/tap flips manually. The post side shows the Instagram handle (`instagram` in `src/content/strani/noga.md`), "Zadnja objava na Instagramu · [date]", a play icon + "Reel" for videos, and opens the post on Instagram. Reduced motion: no automatic flipping; a "Zadnja objava na Instagramu" button under the shape switches to the post. Because a click flips the shape, the photo no longer links to /apolonija-simon (the "Več o Apoloniji" link below does).
   - Q&A box under the hero: "Imaš vprašanje? Mi imamo odgovore.", a field to ask a question, and a link to `/vprasanja`
   - Under the Q&A box: 3 key programme areas, each on its own hand-cut white paper shape (each slightly different, subtle wobble on hover, none with reduced motion), each linking to its `/program/[slug]` page; centered title, "Celoten program" link (green underline) below. The selection is set in `poudarki` in `src/content/strani/vstopna.md` (each item: `podrocje` = file name from `src/content/program/`, `besedilo` = shortened homepage text). **Temporary selection with shortened texts:** Odprto in odgovorno upravljanje, Povezana in varna mobilnost, Pitna voda, zdravje in varnost; the shortened texts are homepage-only (`poudarki[].besedilo` in `vstopna.md`, supplied by the team, exactly as written), /program keeps the full texts. The section stays marked OSNUTEK until the team decides the final 3. From md the three shapes are equalized to the same height (script in `KeyPoints.astro`).
   - Text: why Apolonija is running (excerpt quoted exactly from CV section 9: the paragraph "Kot nestrankarska kandidatka …" and the bold sentence "Uspešnosti mesta ne smemo meriti …", blocks `kandidatura` / `kandidatura-poudarek` in `vstopna.md`, plus "Več o Apoloniji"), then why Vesna and civil society are joining forces (framed blocks of equal size, alternating title/text columns, aligned across both)
   - "Iz arhiva": title with archive link, then a row of the next 4 posts after the newest one (the newest is in the hero, so it is never shown twice; horizontally scrollable on mobile)
2. **Apolonija Simon** (`/apolonija-simon`): from her CV (`podatki/vsebina/zivljenjepis-apolonija.md`), text **exactly as written**, one file per CV section in `src/content/zivljenjepis/` (`vrsta`: `uvod` / `razdelek` / `zakaj`; `casovnica: true` turns `### <year> – <title>` headings into a timeline via `src/lib/casovnica.ts`, since Astro 7's default Markdown processor runs no rehype plugins).
   - Top: name, "Kandidatka za županjo Mestne občine Ljubljana" and the subtitle line (block `glava` in `src/content/strani/apolonija-simon.md`, " | " separates the items) on a white hand-cut shape (text must always stay inside it), a cut-out of her face beside it (above it on phones, from `design-reference/4_Apolonija Portret.jpg`, copied to `src/assets/foto/`). "Rojena: …" is left out until the team confirms.
   - Section 1 (Poklicna in osebna predstavitev) as the intro text, then sections 2–8 under "Življenjepis" as collapsible `<details>`: Izobrazba and Poklicna pot as timelines, awards in Umetniško delo as a 2-column table (Leto, Nagrada oziroma priznanje; the CV's "Vir" column is dropped).
   - Section 9 as its own prominent section "Zakaj kandidiram" (not collapsed); the bold sentence is a markdown blockquote, shown as the large quote with a hand-drawn »« (`risbe/narekovaj.svg`) and underline.
   - Then the real quotes from Siol.net, 1. 10. 2026 (source in `src/content/strani/apolonija-simon.md`; any further quotes must also be real and sourced), and the link to her personal website.
3. **Lista Vesna in civilna družba** (`/lista`): short text, two group photos (`src/assets/fotografije/skupinske/`), city council candidates, candidates for četrtne skupnosti. **Real data**, generated from the team's spreadsheet `podatki/kandidati.xlsx` (personal data: `podatki/` is git-ignored and must never be committed or copied into the site).
   - City council (`src/content/kandidati/mestni-svet.yaml`, sheet "Kandidati za MS"): only Št. (order), Ime in priimek, Član ("Vesna" / "Civilna iniciativa", shown as a small tag) and Strokovni ali znanstveni naslov (exactly as written). Never use Spol, Leto rojstva, Četrtna skupnost, Delo or anything else. Denis Striković is nosilec liste. Photos from `src/assets/fotografije/kandidati/` via `slika`; without a photo the card shows the initials on a green hand-cut shape (not OSNUTEK).
   - Četrtne skupnosti (`src/content/kandidati/cetrtne-skupnosti.yaml`, sheet "Kandidati za ČS"): only Četrtna skupnost and Ime in priimek, in the file's order; only ČS that have candidates; collapsible per ČS.
4. **Program** (`/program`): **9 areas**, source **`podatki/vsebina/program-povzetek.md`** (the team's one-page summary; a longer 3-page version with detail texts and references will follow). The page starts with the summary's title "Program razvoja Ljubljane" and its two intro paragraphs (`src/content/strani/program.md`), then the 9 areas as cards; each links to `/program/[slug]`. Content: one file per area in `src/content/program/` (file name = slug, `vrstniRed` = order in the summary, `povzetek` = the short description, body = longer text, `viri` = references). Titles and descriptions are real and exactly as written (only agreed typo fixes: seznam, Konkretne, Občinski prostorski načrt, period after "multimodalna vozlišča"). The longer texts and references are not available yet, so they are OSNUTEK (`osnutek: true` in each area file). The **whole program is OSNUTEK at page level** (`osnutek: true` in `program.md`) until the team confirms it is final.
   1. Odprto in odgovorno upravljanje
   2. Prostor v javnem interesu
   3. Dostopen dom in žive soseske
   4. Povezana in varna mobilnost
   5. Podnebna odpornost in obnova narave
   6. Pitna voda, zdravje in varnost
   7. Energija, odpadki in lokalno gospodarstvo
   8. Uporabna digitalizacija
   9. Solidarnost, kultura in dostopnost
5. **Sporni projekti + naše stališče** (`/sporni-projekti`): per project an image, short text and our position. One file per project in `src/content/sporni-projekti/`. Real names: kanalizacijski kanal C0, sežigalnica odpadkov. Their "Naše stališče" is quoted exactly from the program summary (`stalisce`, with `stalisceVir` linking to the program area: C0 → Pitna voda, zdravje in varnost; sežigalnica → Energija, odpadki in lokalno gospodarstvo). Descriptions and photos are still placeholders; projects 3 and 4 are placeholders entirely (`naslovOsnutek` and `stalisceOsnutek: true`).
6. **Vprašanja in odgovori** (`/vprasanja`): list of questions residents have asked, with Apolonija's answers, and a form to ask a new one
7. **Arhiv objav** (`/arhiv`): grid of about 5 per row, newest first (top left), date under each. Posts are mixed: graphics, text, photos, video
   - Below the posts: **"Plakati"**, the 13 campaign posters (unique designs) as a grid; click opens a lightbox (`<dialog>`) with a "Prenesi" button. Made from the print PDFs in `podatki/plakati/` (git-ignored, never on the site) with `npm run plakati` (`scripts/pripravi-plakate.mjs`, macOS `sips`): cropped to the PDF TrimBox, download JPG (3000 px) in `public/plakati/`, preview in `src/assets/plakati/`. Names come from the slogan (`src/content/plakati/plakati.yaml`); never use the billboard location names. The PDFs are not offered for download.
8. **Pomagaj, če lahko** (`/pomagaj`): donation request with payment details
9. **Kontakt** (`/kontakt`): contact details, links to Apolonija's personal site and Vesna's website
10. **Odprta vprašanja mesta** (`/odprta-vprasanja`, last in menu and footer): the team's document on open issues in the city (C0, sežigalnica, tržnica, Križanke …). Source `podatki/vsebina/Odprta vprašanja mesta.md`; content in `src/content/odprta-vprasanja/odprta-vprasanja.md` (body = the document **exactly as written**, never rewrite or shorten it; to update, paste the new version below the frontmatter). Table of contents from its `###` headings. Whole page marked OSNUTEK until the team reviews it. Different from `/vprasanja` (citizens' questions with answers): each page has a short intro line (OSNUTEK) explaining this and linking to the other.

Footer on every page: campaign organizer notice ("Naročnik: ..."), privacy notice link (`/zasebnost`), social links.

Also: `/zasebnost` (privacy notice, legal text still to be supplied) and a custom 404 page.

**Internal team page** (`/placeholders`, path in `INTERNA_POT` in `src/config.ts`): not linked anywhere, noindex/nofollow, plain layout (no public header/footer). Section 1 "Manjkajoče vsebine" is generated from the same scan as `npm run check-placeholders` (shared module `scripts/lib/placeholderji.mjs`; wording/grouping in `src/lib/manjkajoce.ts`, unknown placeholders fall into "Ostalo") plus candidates without a photo; each item has an "Uredi v CMS" link to its Pages CMS entry (`src/lib/cms.ts`, built from `.pages.yml` and `CMS_URL` in `src/config.ts`). Section 2 "Odprte zadeve" is maintained by hand in `src/content/odprte-zadeve/odprte-zadeve.yaml` (naslov, opis, kdo, status odprto / v teku / urejeno). Built only while `INTERNA_STRAN` is true (it follows `NOINDEX`), so it is left out of the launch build. Never link it or list it in robots.txt. Every page's title and meta description come from its file in `src/content/strani/` (`naslov`, `opis`); the layout appends "| Apolonija Simon za županjo".

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
- **Ballot number in the hero:** the 6 is circled by hand with a green pencil/crayon (`src/assets/risbe/krog-svincnik.svg`: uneven, overlapping ends, varying width, grainy edge; replaceable with a scan). Note: the print material itself shows the numbers as white digits in solid green circles; the pencil ring is a web-only choice of the team (2026-11-01).
- **Hand-drawn marks:** crayon stroke before "Apolonija", hand-drawn circles (e.g. the "?" decoration), underlines, arrows. Each is a separate SVG in `src/assets/risbe/`, rendered via `Risba.astro`; replace files with scanned drawings later (see the README there).
- **Accents:** green Q&A band, black footer, black pill buttons, thin black frames around text blocks. No gradients, no shadows.
- **Scale:** bold but not oversized. Keep headlines and section spacing moderate (the team found the first homepage too big); readability on a phone comes first.
- **Header** (`SiteHeader.astro`, variant "B · Papirnat izrez", chosen 2026-11-01): sticky. Partner logo on the left, on the right only the menu button: a small white paper cut-out (`Blob`), slightly rotated, with "Meni" and three hand-drawn lines (`risbe/meni.svg`); it straightens on hover, and reads "Zapri" + hand-drawn X (`risbe/zapri.svg`) while the menu is open. Same on all screen sizes (no inline links); on phones the logo fills the space the button leaves. At the top of the page no background; once scrolled the header **shrinks** (smaller logo, less padding) and becomes a cream paper strip with a torn bottom edge and a soft shadow; it grows back at the top.
- **Navigation:** the menu button opens a full-screen overlay (`<nav id="meni">`) on all screen sizes: translucent cream with blur, comfortable link size, fade + staggered slide-in. The header stays above the overlay, so the same button closes it; Esc closes; focus stays within button + links; respects `prefers-reduced-motion`. Scroll lock = `overflow: hidden` on `<html>`; `html { scrollbar-gutter: stable }` (global.css) keeps the page from shifting when the scrollbar disappears. Never add padding compensation for the scrollbar.
- **Hero rule:** photos must never cover text at any width (only the white background shapes may overlap). The homepage hero shows the mayoral ballot mark "Za županjo obkroži:" + the circled 6 (`GlasovnicaSest.astro`, wording in `vstopna.md` → `hero.obkrozi`). It is absolutely positioned and never changes the size of the white name shape: desktop lower right next to the tagline (left of the green shape), tablet under the tagline on the white shape's lower-left edge; **hidden on phones** (below `md`). It must never cover the name, her face or the post. Wording must always say it's for the mayor (never "Lokalne volitve" or anything that reads like a list number; the list is 9). The hero photo is `podatki/fotografije-originali/apolonija-uvod.jpg`; `npm run fotografije` makes the full web version and two 4:5 crops (`src/assets/fotografije/apolonija-uvod-izrez.jpg` for tablet/desktop, `apolonija-uvod-blizje.jpg` closer for phones; crop boxes in `scripts/pripravi-fotografije.mjs`). On phones (below `md`) the hero uses the closer crop, larger and centered; the Q&A heading is sized to the content width (`cqi`) so it spans edge to edge. The paper shape behind the hero photo is print green (`zelena`); the shape behind the name stays white. Name and photo sit close together, and the composition is centered as a group (equal empty space left and right). No crayon stroke next to the name in the hero. The name size uses container units (`cqi`) so it scales with the content width.
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
- **In content files:** every entry or block that is not real gets `osnutek: true` (also `naslovOsnutek`, `uvodOsnutek`, `stalisceOsnutek` for single fields). If only part of a text is invented, split it into its own field with its own `osnutek` flag. Never hardcode a `<Placeholder>` around text in a component: components only use `<Placeholder active={…osnutek}>`, so editors can switch the mark off in the CMS.
- **On the page:** placeholder content is visibly marked (e.g. striped highlight or dashed outline plus a small "OSNUTEK" label), so nobody mistakes it for approved text.
- **One switch:** a single config flag turns the visual marking on/off.
- **Check script:** `npm run check-placeholders` lists every remaining placeholder (file, line and field path), so nothing slips into the final site.
- **What placeholders may say:** describe what will go there (e.g. "[Tu bo kratek opis točke programa o prometu.]") or use neutral filler. **Never invent political positions, promises, quotes, statistics, or statements attributed to Apolonija or anyone else**, and never invent names of real people (use "Kandidat/ka 1" etc.).
- **Images:** use clearly labeled grey placeholder boxes ("FOTO: Apolonija"), not stock photos of people.
- Real content (from the background section above or supplied by the team) is not marked.

## Features: prototype first
- **Social profiles** (one place: `omrezja` in `src/content/strani/noga.md`, read via `src/data/site.ts`; used in footer, menu overlay and /kontakt): Instagram **@skupajzamesto** (https://www.instagram.com/skupajzamesto), Facebook https://www.facebook.com/profile.php?id=61595183339767. Also keep the link to vesnazelenastranka.si.
- **Instagram posts** (hero flip, "Iz arhiva", /arhiv) come from **@skupajzamesto**. Only posts from `OBJAVE_OD` (`src/config.ts`, currently 2026-10-01) are shown, newest first (`getObjave()` in `src/lib/objave.ts`).
  - Data shape (`src/content.config.ts` → `objave`): `datum`, `tip` (grafika / fotografija / video / reel / carousel), `platforma`, `povezava` (permalink), `opis` (first line of the caption), `slika` (local image in `src/assets/objave/`) or `slikaUrl` (remote image from the feed), `osnutek` (stand-in post).
  - **Manual (current):** one file per post in `src/content/objave/`, added with `npm run objava` (see "Adding an Instagram post" below). Placeholder posts are shown only while no real post exists; the first real post added with the script deletes them.
  - **Automatic (prepared, off):** a Behold JSON feed (`src/lib/objave-loader.ts`). Switch on by setting `BEHOLD_FEED_URL` in `src/config.ts` (or the env variable) and rebuilding; the account to connect in Behold is **@skupajzamesto**. The loader maps feed posts to the same shape (reel/video/carousel/photo, first caption line, image URL). If the feed can't be loaded, the build falls back to the manual entries. Check the feed's image host against `image.remotePatterns` in `astro.config.mjs` when switching on. The site is static, so new feed posts appear after the next build (rebuild regularly, e.g. a scheduled deploy).
  - **Cards** (`PostCard.astro`, one format for all types): square thumbnail with type tag, date on one line, 2-line caption, link. Reels/videos: cover image + play icon + "Reel"/"Video" label, a click opens the post on Instagram. Photos/graphics: click-to-load embed (no Meta scripts before a click). A post without a permalink yet links to the profile (`povezavaObjave()`).
- **Question form (Q&A):** build the UI only; no backend yet. Mark it as non-functional in the prototype. Answered questions will be a content collection shown on `/vprasanja`.
- **No survey:** the online survey was dropped from the site.
- **Donations:** placeholder payment details only.
- **Analytics / cookies:** none for now.

## Pages CMS (content editing for the team)
The team edits content in **Pages CMS** (hosted app, https://app.pagescms.org), which commits straight to this GitHub repo (branch `main`). Phase 1: content only, no form backend.

**What it edits:** only what `.pages.yml` lists: the files in `src/content/` (pages in `strani/`, plus `zivljenjepis/`, `kandidati/`, `program/`, `sporni-projekti/`, `vprasanja/`, `objave/`, `plakati/`, `odprta-vprasanja/`, `odprte-zadeve/`, `novice/`) and four image folders (`src/assets/fotografije`, `foto`, `objave`, `novice`). Code, config, `src/assets/risbe` and `src/assets/plakati` are not exposed; `settings.hide` hides the configuration page. Invited collaborators (email, no GitHub account) cannot change `.pages.yml`.

**How content is structured for it:**
- Every visible text and image lives in a content file. Page texts are named blocks under `bloki:` in `src/content/strani/<page>.md` (`naslov`, `besedilo`, `povezava` = link text, `podpis` = signature/label, `osnutek`), read in pages with `getStran('<page>').blok('<name>')` (a missing block fails the build). Only interface controls (Meni/Zapri, Kopiraj, Prenesi, aria labels, post type tags) stay in components; the menu (`navigation` in `src/data/site.ts`) follows the routes and stays in code.
- Footer, social profiles and the Instagram profile: `src/content/strani/noga.md` ("Noga strani"), exposed through `src/data/site.ts`.
- Images are stored as `@assets/<folder>/<file>` (alias in `tsconfig.json`), which Astro's `image()` resolves from any content file.
- Long texts that must stay exactly as written (CV sections, Odprta vprašanja mesta) use the markdown code editor, not rich text, so the source is not reformatted. Answers, programme area texts and news use rich text (markdown).
- `/vprasanja` shows only questions with `objavljeno: true` and an answer (body), via `src/lib/vprasanja.ts`.
- **Novice** (`src/content/novice/`: naslov, datum, slika, body, objavljeno) is a prepared, empty collection; it is not shown on the site until the user says so.
- Fields cleared in the CMS (saved as `""` or `null`) are treated as unset by the schema, so the build doesn't fail.
- `settings.content.merge: true` keeps keys not listed in `.pages.yml`, but **YAML comments in content files are lost** when the CMS saves a file: put explanations editors need in the field `description` in `.pages.yml`.

**Adding a new field:**
1. Add it to the schema in `src/content.config.ts` (for page texts usually just a new block under `bloki:`; the block schema is shared).
2. Add the value to the content file and use it in the page/component (no hardcoded text).
3. Add the field to the matching entry in `.pages.yml` with a Slovenian `label` and a short `description` (what to write, how long; for images the size/ratio).
4. Run `npm run check-cms` (every key in the content files must have a field in `.pages.yml`), `npm run build`, and restart the dev server / delete `node_modules/.astro` after the schema change.
5. Draft content gets `osnutek: true`; the team page and `npm run check-placeholders` pick it up automatically. New page files need an entry in `STRANI` in `src/lib/manjkajoce.ts` to be grouped under their page.

## Adding an Instagram post
When the user gives a post (link, caption, first image or a screenshot of a reel's cover; ask for the publication date if it isn't given):
1. Pick the type: `grafika` (designed graphic), `fotografija` (photo), `carousel` (several images), `reel`, `video`.
2. Save the image the user gave somewhere outside `src/` (e.g. the scratchpad or `podatki/`); never commit the original.
3. Run `npm run objava -- --url "<link>" --datum <YYYY-MM-DD> --tip <type> --opis "<caption>" --slika "<image path>"`. The script keeps only the first line of the caption, cleans the link to the canonical permalink, writes the web image (max 2400 px, JPEG 82, EXIF-rotated, metadata stripped) to `src/assets/objave/<date>-<code>.jpg` and the entry to `src/content/objave/<date>-<code>.md`. The first real post also deletes all placeholder posts and their stand-in image.
4. Do not invent or rephrase captions; use the caption exactly as given (first line only). Posts before `OBJAVE_OD` are not shown.
5. Build (`npm run build`), check the hero flip and /arhiv, and report what was added. Do not commit.

## Working rules
- Build page by page. Show the result and wait for feedback before moving to the next page.
- Before larger changes, briefly say what you plan to do.
- Never edit or delete files in `design-reference/`.
- Keep components small and reusable (layout, header/menu, footer, section blocks, placeholder marker).

## Before final launch
Checklist before the site goes public:
- [ ] Check that the internal team page (`/placeholders`) is gone from the production build: `INTERNA_STRAN` follows `NOINDEX`, so setting `NOINDEX = false` removes it; confirm `dist/` has no `placeholders` folder.
- [ ] Set `NOINDEX = false` in `src/config.ts` (preview mode adds `<meta name="robots" content="noindex, nofollow">` to every page and makes `/robots.txt` disallow everything). The 404 page stays noindex either way.
- [ ] Set `SHOW_PLACEHOLDERS = false` in `src/config.ts` and run `npm run check-placeholders -- --strict`: it must report no placeholders left.
- [ ] Confirm the organizer notice in the footer ("Naročnik: ..."), the payment details on /pomagaj and the contact details on /kontakt.
- [ ] Replace the placeholder posts in `src/content/objave/` with real @skupajzamesto posts (permalink, date, caption, image), or set up the automatic import.

