// Timeline for CV sections with `casovnica: true` (Izobrazba, Poklicna pot, src/content/zivljenjepis/).
// Takes the section's rendered HTML and turns every "### <year> – <title>" / "### <year> | <title>" heading
// plus the content after it (up to the next heading) into one entry:
//   <ol class="casovnica"><li><p class="casovnica-leto">1985</p><div class="casovnica-vsebina"><h3>title</h3>…</div></li>…</ol>
// Content before the first heading stays as it is; headings without a leading year are left untouched.

// "1985 – …", "1994–1997 | …", "Od 1999 | …" (the separator may be an HTML entity in the rendered output)
const LETO = /^\s*((?:Od\s+)?\d{4}(?:\s*[–-]\s*\d{4})?)\s*(?:–|\||&#124;|&vert;)\s*([\s\S]+)$/;

export function casovnica(html: string): string {
  const deli = html.split(/(?=<h3[\s>])/);
  const pred = deli[0].startsWith('<h3') ? '' : deli.shift()!;
  const tocke = deli.map((del) => {
    const m = del.match(/^<h3([^>]*)>([\s\S]*?)<\/h3>([\s\S]*)$/);
    const l = m && m[2].match(LETO);
    if (!m || !l) return null;
    return `<li><p class="casovnica-leto">${l[1]}</p><div class="casovnica-vsebina"><h3${m[1]}>${l[2].trim()}</h3>${m[3]}</div></li>`;
  });
  if (tocke.some((t) => t === null)) return html;
  return `${pred}<ol class="casovnica">${tocke.join('')}</ol>`;
}
