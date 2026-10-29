/**
 * Apartment 8D-104 geometry, traced from the brochure's plan image (Viàle brochure p.102,
 * 524 × 497 px, `public/assets/plan-8D-104.jpg`).
 *
 * All coordinates below are in pixels of that image, so the trace can be laid over the
 * original for checking. `SCALE` converts them to metres. It was calibrated from the printed
 * net dimensions (bedroom, living, lobby, bathroom, terrace measure 40.2–42.0 px/m), so
 * traced lengths carry roughly ±5 % / ±10 cm uncertainty.
 */
export const PLAN_IMAGE = { src: 'assets/plan-8D-104.jpg', w: 524, h: 497 };
export const SCALE = 40.8; // px per metre
export const m = (px: number) => px / SCALE;

/**
 * - `source`: printed in the brochure
 * - `drawn`: traced from lines in the drawing
 * - `interpreted`: our reading of a drawing symbol (e.g. a thin line read as a shower screen)
 * - `assumed`: not in the source at all; a typical value used only for the 3D preview
 */
export type Confidence = 'source' | 'drawn' | 'interpreted' | 'assumed';

export type Pt = [number, number];

export type Opening = {
  kind: 'door' | 'window' | 'glazed-door';
  /** Start and end along the wall, in px measured from wall point `a`. */
  from: number;
  to: number;
  /** For doors: hinge end, and swing side: +1 = towards the normal (−dy, dx) of a→b in image coordinates. */
  hinge?: 'from' | 'to';
  swing?: 1 | -1;
  label: string;
  confidence: Confidence;
};

export type Wall = {
  id: string;
  a: Pt;
  b: Pt;
  /** Drawn thickness in px. The drawing shows ~6 px (~15 cm) for every wall. */
  t: number;
  kind: 'wall' | 'parapet' | 'screen';
  openings?: Opening[];
  confidence: Confidence;
};

export const walls: Wall[] = [
  {
    id: 'entrance-wall',
    a: [60, 22],
    b: [112, 22],
    t: 4,
    kind: 'wall',
    confidence: 'drawn',
    openings: [{ kind: 'door', from: 7, to: 48, hinge: 'from', swing: 1, label: 'Entrance door', confidence: 'drawn' }],
  },
  { id: 'west', a: [60, 22], b: [60, 396], t: 6, kind: 'wall', confidence: 'drawn' },
  { id: 'corridor-east', a: [112, 22], b: [112, 143.5], t: 6, kind: 'wall', confidence: 'drawn' },
  {
    id: 'north',
    a: [112, 143.5],
    b: [485, 143.5],
    t: 6,
    kind: 'wall',
    confidence: 'drawn',
    openings: [{ kind: 'window', from: 93, to: 123, label: 'Bathroom window', confidence: 'drawn' }],
  },
  {
    id: 'east',
    a: [485, 143.5],
    b: [485, 292],
    t: 6,
    kind: 'wall',
    confidence: 'drawn',
    openings: [{ kind: 'window', from: 37.5, to: 99.5, label: 'Bedroom window', confidence: 'drawn' }],
  },
  { id: 'bedroom-south', a: [313.5, 292], b: [485, 292], t: 6, kind: 'wall', confidence: 'drawn' },
  { id: 'south', a: [60, 395.5], b: [313.5, 395.5], t: 6, kind: 'wall', confidence: 'drawn' },
  { id: 'terrace-south', a: [313.5, 395.5], b: [372, 395.5], t: 5, kind: 'parapet', confidence: 'interpreted' },
  { id: 'terrace-east', a: [372, 292], b: [372, 395.5], t: 3, kind: 'parapet', confidence: 'interpreted' },
  {
    id: 'living-terrace',
    a: [313.5, 292],
    b: [313.5, 395.5],
    t: 6,
    kind: 'wall',
    confidence: 'drawn',
    openings: [{ kind: 'glazed-door', from: 6, to: 98, label: 'Glazed opening to terrace', confidence: 'interpreted' }],
  },
  {
    id: 'bedroom-west',
    a: [313.5, 143.5],
    b: [313.5, 292],
    t: 6,
    kind: 'wall',
    confidence: 'drawn',
    openings: [{ kind: 'door', from: 48.5, to: 86.5, hinge: 'to', swing: -1, label: 'Bedroom door', confidence: 'drawn' }],
  },
  { id: 'kitchen-bath', a: [194.5, 143.5], b: [194.5, 234.5], t: 6, kind: 'wall', confidence: 'drawn' },
  { id: 'bath-south', a: [140, 234.5], b: [270, 234.5], t: 6, kind: 'wall', confidence: 'drawn' },
  { id: 'shower-south', a: [263.5, 184], b: [313.5, 184], t: 6, kind: 'wall', confidence: 'drawn' },
  { id: 'shower-screen', a: [263.5, 146.5], b: [263.5, 184], t: 2, kind: 'screen', confidence: 'interpreted' },
  {
    id: 'bath-lobby',
    a: [263.5, 184],
    b: [263.5, 234.5],
    t: 4,
    kind: 'wall',
    confidence: 'drawn',
    openings: [{ kind: 'door', from: 11, to: 44, hinge: 'to', swing: 1, label: 'Bathroom door', confidence: 'drawn' }],
  },
];

export type RoomId = 'corridor' | 'kitchen' | 'living' | 'terrace' | 'lobby' | 'bedroom' | 'bathroom' | 'circulation';

export type Room = {
  id: RoomId;
  /** Number printed on the plan, if any. */
  no?: number;
  poly: Pt[];
  /** Net dimensions as printed in the brochure (metres). */
  printed?: [number, number];
  floor: 'tile' | 'wood' | 'wet' | 'outdoor';
  confidence: Confidence;
};

export const rooms: Room[] = [
  { id: 'corridor', no: 1, poly: [[63, 25], [109, 25], [109, 146], [63, 146]], printed: [2.95, 1.3], floor: 'tile', confidence: 'drawn' },
  { id: 'kitchen', no: 2, poly: [[112, 146], [192, 146], [192, 232], [112, 232]], printed: [2.2, 2.0], floor: 'tile', confidence: 'drawn' },
  { id: 'living', no: 3, poly: [[63, 237], [311, 237], [311, 393], [63, 393]], printed: [5.9, 3.8], floor: 'wood', confidence: 'drawn' },
  { id: 'terrace', no: 4, poly: [[316, 295], [370, 295], [370, 393], [316, 393]], printed: [2.3, 1.35], floor: 'outdoor', confidence: 'drawn' },
  { id: 'lobby', no: 5, poly: [[266, 187], [311, 187], [311, 232], [266, 232]], printed: [1.2, 1.2], floor: 'tile', confidence: 'drawn' },
  { id: 'bedroom', no: 6, poly: [[316, 146], [482, 146], [482, 289], [316, 289]], printed: [4.1, 3.5], floor: 'wood', confidence: 'drawn' },
  {
    id: 'bathroom',
    no: 7,
    poly: [[197, 146], [311, 146], [311, 181], [266, 181], [266, 232], [197, 232]],
    printed: [2.8, 2.2],
    floor: 'wet',
    confidence: 'drawn',
  },
  // Open area joining the corridor, kitchen and living room. Not numbered in the brochure.
  { id: 'circulation', poly: [[63, 146], [112, 146], [112, 232], [140, 232], [140, 237], [63, 237]], floor: 'tile', confidence: 'drawn' },
];

/** Built-in elements as drawn. They are part of the plan, not movable furniture. */
export type Fixture = { id: string; label: string; poly: Pt[]; height: number; confidence: Confidence; round?: boolean };

export const fixtures: Fixture[] = [
  {
    id: 'kitchen-counter',
    label: 'Kitchen counter (L-shaped)',
    poly: [[112, 146], [192, 146], [192, 232], [166, 232], [166, 172], [112, 172]],
    height: 0.9,
    confidence: 'drawn',
  },
  { id: 'wc', label: 'WC', poly: [[198, 160], [228, 160], [228, 178], [198, 178]], height: 0.4, confidence: 'drawn' },
  { id: 'basin', label: 'Basin', poly: [[198, 196], [219, 196], [219, 230], [198, 230]], height: 0.85, confidence: 'drawn' },
  { id: 'shower-tray', label: 'Shower', poly: [[266, 147], [311, 147], [311, 181], [266, 181]], height: 0.05, confidence: 'interpreted' },
];

/** Values that do not appear anywhere in the source, used only to extrude the 3D preview. */
export const ASSUMED = {
  ceiling: 2.8,
  doorHead: 2.1,
  windowSill: 0.9,
  windowHead: 2.2,
  glazedHead: 2.3,
  parapet: 1.1,
  screen: 2.0,
};

// ---------- helpers ----------

export const polyArea = (p: Pt[]) =>
  Math.abs(p.reduce((s, [x, y], i) => {
    const [x2, y2] = p[(i + 1) % p.length];
    return s + x * y2 - x2 * y;
  }, 0)) / 2;

export const bbox = (p: Pt[]) => {
  const xs = p.map((q) => q[0]);
  const ys = p.map((q) => q[1]);
  return { x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys) };
};

export const centroid = (p: Pt[]): Pt => {
  const b = bbox(p);
  return [(b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2];
};

/** Measured from the trace, in metres (bounding box). */
export const tracedSize = (r: Room): [number, number] => {
  const b = bbox(r.poly);
  const a = m(b.x1 - b.x0);
  const c = m(b.y1 - b.y0);
  return a >= c ? [a, c] : [c, a];
};

export const pointInPoly = ([x, y]: Pt, poly: Pt[]) => {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
};

/** Solid pieces of a wall after cutting out its openings (px along the wall). */
export function wallSegments(w: Wall) {
  const len = Math.hypot(w.b[0] - w.a[0], w.b[1] - w.a[1]);
  const cuts = [...(w.openings ?? [])].sort((p, q) => p.from - q.from);
  const parts: { from: number; to: number; opening?: Opening }[] = [];
  let pos = 0;
  for (const o of cuts) {
    if (o.from > pos) parts.push({ from: pos, to: o.from });
    parts.push({ from: o.from, to: o.to, opening: o });
    pos = o.to;
  }
  if (pos < len) parts.push({ from: pos, to: len });
  return { len, parts };
}

/** Footprint inside the outer wall lines, including walls and terrace (m²). */
export const tracedFootprint = () => {
  const outline: Pt[] = [[57, 19], [115, 19], [115, 140.5], [488, 140.5], [488, 295], [374, 295], [374, 398.5], [57, 398.5]];
  return polyArea(outline) / SCALE / SCALE;
};
