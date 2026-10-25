// Organic rounded shapes from the print material (the cream shape behind headlines).
// Each shape is a polygon (coordinates 0–1) whose corners are smoothed with quadratic curves.

export const blobShapes = {
  // poster "Kakšno mesto hočemo!"
  a: [[0.06, 0.34], [0.52, 0.03], [0.97, 0.46], [0.74, 0.97], [0.08, 0.86]],
  // poster "Mestni svet ..."
  b: [[0.02, 0.4], [0.44, 0.02], [0.96, 0.3], [0.88, 0.92], [0.22, 0.98]],
  // billboard, tilted
  c: [[0.1, 0.18], [0.7, 0.04], [0.98, 0.62], [0.56, 0.98], [0.03, 0.7]],
  // tall rounded cut-out for portrait photos
  d: [[0.04, 0.12], [0.62, 0.0], [0.99, 0.2], [0.96, 0.9], [0.4, 1.0], [0.0, 0.78]],
  // wide shape behind the name in the hero
  e: [[0.0, 0.14], [0.4, 0.0], [0.92, 0.06], [1.0, 0.62], [0.72, 1.0], [0.04, 0.94]],
  // hand-cut cards (key programme points): near-rectangles, each with different crooked edges
  g: [[0.03, 0.08], [0.55, 0.0], [0.97, 0.06], [1.0, 0.7], [0.9, 1.0], [0.08, 0.95], [0.0, 0.5]],
  h: [[0.0, 0.12], [0.4, 0.03], [0.96, 0.0], [0.99, 0.55], [0.94, 0.97], [0.3, 1.0], [0.04, 0.88]],
  i: [[0.06, 0.0], [0.92, 0.07], [1.0, 0.45], [0.95, 0.92], [0.5, 1.0], [0.0, 0.94], [0.02, 0.4]],
  // paper backing behind a cut-out photo
  f: [[0.1, 0.04], [0.8, 0.0], [1.0, 0.4], [0.92, 0.98], [0.18, 1.0], [0.0, 0.52]],
} satisfies Record<string, number[][]>;

export type BlobVariant = keyof typeof blobShapes;

// `round` (0–0.5) is how far along each edge the corner rounding reaches:
// 0.5 gives a soft pebble, lower values give the straighter edges of the poster shapes.
export function blobPath(variant: BlobVariant, scale = 1, round = 0.3): string {
  const pts = blobShapes[variant].map(([x, y]) => [x * scale, y * scale]);
  const lerp = (p: number[], q: number[], t: number) => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
  const n = pts.length;
  const f = (v: number[]) => `${+v[0].toFixed(3)},${+v[1].toFixed(3)}`;
  let d = '';
  pts.forEach((p, i) => {
    const a = lerp(p, pts[(i - 1 + n) % n], round);
    const b = lerp(p, pts[(i + 1) % n], round);
    d += `${i === 0 ? 'M' : ' L'}${f(a)} Q${f(p)} ${f(b)}`;
  });
  return d + 'Z';
}

// Ready-made hand-cut paper looks for card grids (shape, resting tilt, mirrored), cycled per card.
export const papirji: { oblika: BlobVariant; nagib: string; zrcali?: boolean }[] = [
  { oblika: 'g', nagib: '-1.5deg' },
  { oblika: 'h', nagib: '1deg' },
  { oblika: 'i', nagib: '-0.5deg' },
  { oblika: 'h', nagib: '-1deg', zrcali: true },
  { oblika: 'i', nagib: '1.5deg', zrcali: true },
  { oblika: 'g', nagib: '0.5deg', zrcali: true },
];

// Outline of a shape as a polygon (corners sampled along their curves), in 0–1 coordinates.
function outline(variant: BlobVariant, round = 0.3): number[][] {
  const pts = blobShapes[variant];
  const n = pts.length;
  const lerp = (p: number[], q: number[], t: number) => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
  const out: number[][] = [];
  pts.forEach((p, i) => {
    const a = lerp(p, pts[(i - 1 + n) % n], round);
    const b = lerp(p, pts[(i + 1) % n], round);
    for (let k = 0; k <= 12; k++) {
      const t = k / 12;
      out.push([
        (1 - t) ** 2 * a[0] + 2 * (1 - t) * t * p[0] + t ** 2 * b[0],
        (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * p[1] + t ** 2 * b[1],
      ]);
    }
  });
  return out;
}

export interface Inscribed {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}
const inscribedCache = new Map<BlobVariant, Inscribed>();

// Largest text-friendly rectangle inside a shape (0–1 coordinates), shrunk by a safety margin
// for the resting tilt. Because shapes are stretched with preserveAspectRatio="none", a rectangle
// inside the 0–1 outline stays inside the shape at ANY width and height.
export function inscribed(variant: BlobVariant, margin = 0.02): Inscribed {
  const hit = inscribedCache.get(variant);
  if (hit) return hit;
  const poly = outline(variant);
  const steps = 100;
  // vertical extent of the shape at each x
  const lo: number[] = [];
  const hi: number[] = [];
  for (let s = 0; s <= steps; s++) {
    const x = s / steps;
    let a = Infinity;
    let b = -Infinity;
    for (let i = 0; i < poly.length; i++) {
      const p = poly[i];
      const q = poly[(i + 1) % poly.length];
      if ((p[0] - x) * (q[0] - x) <= 0 && p[0] !== q[0]) {
        const y = p[1] + ((x - p[0]) / (q[0] - p[0])) * (q[1] - p[1]);
        a = Math.min(a, y);
        b = Math.max(b, y);
      }
    }
    lo.push(a);
    hi.push(b);
  }
  // favour wide rectangles (text lines) over tall ones
  let best: Inscribed = { x0: 0.25, x1: 0.75, y0: 0.25, y1: 0.75 };
  let score = 0;
  for (let i = 0; i <= steps; i++) {
    let top = -Infinity;
    let bottom = Infinity;
    for (let j = i + 1; j <= steps; j++) {
      top = Math.max(top, lo[j - 1], lo[j]);
      bottom = Math.min(bottom, hi[j - 1], hi[j]);
      const w = (j - i) / steps;
      const h = bottom - top;
      if (h <= 0) break;
      const sc = w ** 1.6 * h;
      if (sc > score) {
        score = sc;
        best = { x0: i / steps, x1: j / steps, y0: top, y1: bottom };
      }
    }
  }
  const r = { x0: best.x0 + margin, x1: best.x1 - margin, y0: best.y0 + margin, y1: best.y1 - margin };
  inscribedCache.set(variant, r);
  return r;
}
