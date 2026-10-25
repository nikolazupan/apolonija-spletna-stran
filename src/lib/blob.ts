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
