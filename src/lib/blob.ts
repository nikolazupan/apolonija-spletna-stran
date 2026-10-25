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
} satisfies Record<string, number[][]>;

export type BlobVariant = keyof typeof blobShapes;

export function blobPath(variant: BlobVariant, scale = 1): string {
  const pts = blobShapes[variant].map(([x, y]) => [x * scale, y * scale]);
  const mid = (p: number[], q: number[]) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
  const start = mid(pts[pts.length - 1], pts[0]);
  let d = `M${start[0]},${start[1]}`;
  pts.forEach((p, i) => {
    const m = mid(p, pts[(i + 1) % pts.length]);
    d += ` Q${p[0]},${p[1]} ${m[0]},${m[1]}`;
  });
  return d + 'Z';
}
