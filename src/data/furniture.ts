import type { T } from '../i18n/LangContext';
import { m } from './geometry';

export type Kind =
  | 'bed-double'
  | 'bed-single'
  | 'nightstand'
  | 'wardrobe'
  | 'wardrobe-small'
  | 'dresser'
  | 'desk'
  | 'chair'
  | 'sofa-3'
  | 'sofa-2'
  | 'armchair'
  | 'coffee-table'
  | 'side-table'
  | 'dining-rect'
  | 'dining-round'
  | 'tv-unit'
  | 'bookshelf'
  | 'rug'
  | 'fridge'
  | 'washer'
  | 'plant';

export type CatalogItem = {
  kind: Kind;
  name: T;
  /** Typical size in metres: width (local x), depth (local y), height. */
  w: number;
  d: number;
  h: number;
  round?: boolean;
  color: string;
  group: 'sleep' | 'living' | 'dining' | 'storage' | 'utility';
};

/** Typical retail sizes. They are generic, not measured from any specific product. */
export const catalog: CatalogItem[] = [
  { kind: 'bed-double', name: { en: 'Double bed', ar: 'سرير مزدوج' }, w: 1.6, d: 2.0, h: 0.5, color: '#d9cfbd', group: 'sleep' },
  { kind: 'bed-single', name: { en: 'Single bed', ar: 'سرير فردي' }, w: 0.9, d: 2.0, h: 0.5, color: '#d9cfbd', group: 'sleep' },
  { kind: 'nightstand', name: { en: 'Nightstand', ar: 'كومودينو' }, w: 0.45, d: 0.4, h: 0.55, color: '#9b8a72', group: 'sleep' },
  { kind: 'wardrobe', name: { en: 'Wardrobe 1.8 m', ar: 'دولاب 1.8 م' }, w: 1.8, d: 0.6, h: 2.2, color: '#b7a789', group: 'storage' },
  { kind: 'wardrobe-small', name: { en: 'Wardrobe 1.2 m', ar: 'دولاب 1.2 م' }, w: 1.2, d: 0.6, h: 2.2, color: '#b7a789', group: 'storage' },
  { kind: 'dresser', name: { en: 'Dresser', ar: 'تسريحة' }, w: 1.2, d: 0.45, h: 0.8, color: '#9b8a72', group: 'storage' },
  { kind: 'desk', name: { en: 'Desk', ar: 'مكتب' }, w: 1.2, d: 0.6, h: 0.75, color: '#a8957a', group: 'living' },
  { kind: 'chair', name: { en: 'Chair', ar: 'كرسي' }, w: 0.45, d: 0.5, h: 0.9, color: '#6f6658', group: 'dining' },
  { kind: 'sofa-3', name: { en: 'Sofa, 3-seat', ar: 'كنبة 3 مقاعد' }, w: 2.1, d: 0.9, h: 0.8, color: '#8a9a8f', group: 'living' },
  { kind: 'sofa-2', name: { en: 'Sofa, 2-seat', ar: 'كنبة مقعدين' }, w: 1.6, d: 0.9, h: 0.8, color: '#8a9a8f', group: 'living' },
  { kind: 'armchair', name: { en: 'Armchair', ar: 'فوتيه' }, w: 0.85, d: 0.85, h: 0.8, color: '#8a9a8f', group: 'living' },
  { kind: 'coffee-table', name: { en: 'Coffee table', ar: 'ترابيزة وسط' }, w: 1.0, d: 0.55, h: 0.4, color: '#7d6b55', group: 'living' },
  { kind: 'side-table', name: { en: 'Side table', ar: 'ترابيزة جانبية' }, w: 0.5, d: 0.5, h: 0.5, color: '#7d6b55', group: 'living' },
  { kind: 'dining-rect', name: { en: 'Dining table (4)', ar: 'سفرة 4 أفراد' }, w: 1.2, d: 0.8, h: 0.75, color: '#8b765c', group: 'dining' },
  { kind: 'dining-round', name: { en: 'Round table Ø1.0', ar: 'ترابيزة دائرية Ø1.0' }, w: 1.0, d: 1.0, h: 0.75, round: true, color: '#8b765c', group: 'dining' },
  { kind: 'tv-unit', name: { en: 'TV unit', ar: 'وحدة تلفزيون' }, w: 1.8, d: 0.4, h: 0.5, color: '#5f574c', group: 'living' },
  { kind: 'bookshelf', name: { en: 'Bookshelf', ar: 'مكتبة' }, w: 0.8, d: 0.35, h: 1.9, color: '#a8957a', group: 'storage' },
  { kind: 'rug', name: { en: 'Rug 2.0 × 1.4', ar: 'سجادة 2.0 × 1.4' }, w: 2.0, d: 1.4, h: 0.01, color: '#c9b79a', group: 'living' },
  { kind: 'fridge', name: { en: 'Fridge', ar: 'ثلاجة' }, w: 0.7, d: 0.7, h: 1.8, color: '#dcdcdc', group: 'utility' },
  { kind: 'washer', name: { en: 'Washing machine', ar: 'غسالة' }, w: 0.6, d: 0.6, h: 0.85, color: '#e6e6e6', group: 'utility' },
  { kind: 'plant', name: { en: 'Plant', ar: 'نبات' }, w: 0.45, d: 0.45, h: 1.2, round: true, color: '#6f8f5f', group: 'living' },
];

export const catalogByKind = Object.fromEntries(catalog.map((c) => [c.kind, c])) as Record<Kind, CatalogItem>;

export type Placed = {
  id: string;
  kind: Kind;
  /** Centre, metres from the plan image origin. */
  x: number;
  y: number;
  /** Degrees, clockwise in plan view. */
  rot: number;
  w: number;
  d: number;
};

let seq = 0;
export const newId = () => `f${Date.now().toString(36)}${(seq++).toString(36)}`;

/** Place an item by its pixel centre / size in the plan image. */
const px = (kind: Kind, cx: number, cy: number, wPx: number, dPx: number, rot = 0): Placed => ({
  id: `b-${kind}-${cx}-${cy}`,
  kind,
  x: m(cx),
  y: m(cy),
  rot,
  w: +m(wPx).toFixed(2),
  d: +m(dPx).toFixed(2),
});

/**
 * The furniture exactly as the developer drew it on the brochure plan (p.102), measured
 * from the image. Sizes are therefore those of the drawing, not of real products.
 */
export const brochureLayout: Placed[] = [
  px('bed-double', 410, 190, 60, 84),
  px('nightstand', 366, 158, 18, 18),
  px('nightstand', 453, 158, 18, 18),
  px('wardrobe', 368, 275.5, 100, 27, 180),
  px('dresser', 446, 280, 52, 19, 180),
  px('dining-round', 108, 333, 41, 41),
  px('chair', 91, 309, 18, 18, 315),
  px('chair', 125, 309, 18, 18, 45),
  px('chair', 91, 357, 18, 18, 225),
  px('chair', 125, 357, 18, 18, 135),
  px('sofa-2', 195.5, 325, 64, 35, 270),
  px('coffee-table', 247.5, 332.5, 31, 21),
  px('sofa-3', 243.5, 374, 63, 34, 180),
  px('side-table', 197, 371.5, 22, 22),
  px('tv-unit', 235, 244, 70, 12),
];
