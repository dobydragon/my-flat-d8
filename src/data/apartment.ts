import raw from './generated/viale-units.json';
import type { T } from '../i18n/LangContext';
import type { RoomId } from './geometry';

type SourceRoom = { no: number; name: string; dims: [number, number]; netArea: number };
type SourceUnit = {
  id: string;
  page: number;
  grossArea: number;
  rooms: SourceRoom[];
  netRoomsTotal: number;
  flags: string[];
  plateRects: [number, number, number, number][];
};

const all = (raw as unknown as { units: SourceUnit[] }).units;
/** The brochure record this apartment is matched to. */
export const source = all.find((u) => u.id === '8D-104')!;
/** The other 79 m² unit in Block 8D (ground floor, with garden) — shown to explain the match. */
export const groundTwin = all.find((u) => u.id === '8D-G04')!;

export type Status = 'owner' | 'source' | 'derived' | 'estimate' | 'unknown';

export type Fact = { label: T; value: T; status: Status; note?: T };

export const owner = { unit: 'D8', floor: 5, area: 79.25 };

export const facts: Fact[] = [
  {
    label: { en: 'Unit', ar: 'الوحدة' },
    value: { en: 'D8', ar: 'D8' },
    status: 'owner',
    note: { en: 'Read as Block 8D (Type D) in the brochure.', ar: 'تُقرأ في الكتيّب على أنها العمارة 8D (النموذج D).' },
  },
  {
    label: { en: 'Floor', ar: 'الدور' },
    value: { en: 'Fifth floor', ar: 'الدور الخامس' },
    status: 'owner',
    note: { en: 'Buildings are ground + 5, so this is the top floor (p.9).', ar: 'المباني أرضي + 5، أي أن هذا هو الدور الأخير (ص 9).' },
  },
  {
    label: { en: 'Area', ar: 'المساحة' },
    value: { en: '≈ 79.25 m²', ar: '≈ 79.25 م²' },
    status: 'owner',
    note: { en: 'Brochure prints 79 m² gross for this layout (p.102): consistent.', ar: 'يطبع الكتيّب 79 م² إجمالي لهذا التصميم (ص 102): متسق.' },
  },
  {
    label: { en: 'Layout', ar: 'التصميم' },
    value: { en: '8D-104 (typical floor)', ar: '8D-104 (الدور المتكرر)' },
    status: 'derived',
    note: {
      en: 'The only 79 m² typical-floor unit in Block 8D. The brochure does not print fifth-floor codes.',
      ar: 'الوحدة الوحيدة بمساحة 79 م² في الدور المتكرر بالعمارة 8D. ولا يطبع الكتيّب أكواد الدور الخامس.',
    },
  },
  {
    label: { en: 'Project', ar: 'المشروع' },
    value: { en: 'Viàle Residence, New Obour City', ar: 'ڤيالي ريزيدنس، مدينة العبور الجديدة' },
    status: 'source',
  },
  {
    label: { en: 'Developer', ar: 'المطوّر' },
    value: { en: 'MRS Developments', ar: 'إم آر إس للتطوير العقاري' },
    status: 'source',
  },
  {
    label: { en: 'Bedrooms / bathrooms', ar: 'غرف النوم / الحمامات' },
    value: { en: '1 / 1', ar: '1 / 1' },
    status: 'source',
  },
  {
    label: { en: 'Orientation', ar: 'الاتجاه' },
    value: { en: 'Not stated', ar: 'غير مذكور' },
    status: 'unknown',
    note: { en: 'No north arrow or site orientation in either PDF.', ar: 'لا يوجد سهم شمال أو اتجاه للموقع في أي من الملفين.' },
  },
  {
    label: { en: 'Ceiling height', ar: 'ارتفاع السقف' },
    value: { en: 'Not stated', ar: 'غير مذكور' },
    status: 'unknown',
    note: { en: 'The 3D preview assumes 2.80 m.', ar: 'يفترض العرض الثلاثي 2.80 م.' },
  },
  {
    label: { en: 'Finishing specification', ar: 'مواصفات التشطيب' },
    value: { en: 'Not stated', ar: 'غير مذكورة' },
    status: 'unknown',
    note: { en: 'The brochure shows an interior theme only (p.115).', ar: 'يعرض الكتيّب طابعًا داخليًا فقط (ص 115).' },
  },
];

export const roomNames: Record<RoomId, T> = {
  corridor: { en: 'Corridor', ar: 'ممر' },
  kitchen: { en: 'Kitchen', ar: 'مطبخ' },
  living: { en: 'Living & dining', ar: 'معيشة وسفرة' },
  terrace: { en: 'Terrace', ar: 'تراس' },
  lobby: { en: 'Lobby', ar: 'ردهة' },
  bedroom: { en: 'Bedroom', ar: 'غرفة نوم' },
  bathroom: { en: 'Bathroom', ar: 'حمام' },
  circulation: { en: 'Open circulation (not numbered)', ar: 'منطقة حركة مفتوحة (بلا رقم)' },
};

export const project = {
  location: { en: 'New Obour City, Egypt', ar: 'مدينة العبور الجديدة، مصر' } as T,
  floors: { en: 'Ground + 5 floors', ar: 'أرضي + 5 أدوار' } as T,
  units: 267,
  masterPlan: 43677,
  amenities: [
    { en: 'Central swimming pool', ar: 'حمام سباحة مركزي' },
    { en: 'Shaded seating areas', ar: 'جلسات مظللة' },
    { en: 'BBQ areas', ar: 'مناطق شواء' },
    { en: 'Meditation spaces', ar: 'مساحات للتأمل' },
    { en: 'Yoga zones', ar: 'مناطق لليوغا' },
    { en: 'Kids’ play areas', ar: 'مناطق لعب للأطفال' },
    { en: 'Landscaped walking paths', ar: 'ممرات مشي منسّقة' },
    { en: 'Integrated commercial services', ar: 'خدمات تجارية متكاملة' },
    { en: 'Secure access & controlled circulation', ar: 'دخول آمن وحركة منظّمة' },
  ] as T[],
  hotline: '15691',
  email: 'info@mrsdevelopment.com',
};
