import { useLang, type T } from '../i18n/LangContext';
import { useMeta } from '../lib/useMeta';
import { roomNames, source } from '../data/apartment';
import { ASSUMED, rooms, SCALE, tracedFootprint, tracedSize, type Confidence } from '../data/geometry';
import { ConfidenceTag } from '../components/StatusTag';

const S = (en: string, ar: string): T => ({ en, ar });

const sections: { title: T; items: T[] }[] = [
  {
    title: S('Source files found', 'الملفات المصدرية'),
    items: [
      S('Viale Brochure.pdf — 116 pages, English. Unit plans for 8 blocks (80 units), floor plates, master plan, amenities.', 'Viale Brochure.pdf — ‏116 صفحة بالإنجليزية. مساقط وحدات 8 عمارات (80 وحدة)، ومساقط الأدوار، والمخطط العام، والمرافق.'),
      S('MRS- COMPANY PROFILE.pdf — 17 pages, English. Company background, projects and contact details.', 'MRS- COMPANY PROFILE.pdf — ‏17 صفحة بالإنجليزية. خلفية الشركة ومشروعاتها وبيانات التواصل.'),
      S('No CAD (DWG/DXF), BIM (IFC/Revit), sections, elevations or dimensioned drawings were provided.', 'لم تُتح ملفات CAD (DWG/DXF) أو BIM (IFC/Revit) أو قطاعات أو واجهات أو رسومات بأبعاد.'),
    ],
  },
  {
    title: S('How D8 was identified', 'كيف تم تحديد D8'),
    items: [
      S('“D8” read as Block 8D (Type D), brochure pages 91–103.', 'قُرئت «D8» على أنها العمارة 8D (النموذج D)، صفحات الكتيّب 91–103.'),
      S('Block 8D has exactly two 79 m² units: 8D-G04 (ground floor, with garden) and 8D-104 (typical floor). The fifth floor is a typical floor, so the layout is 8D-104 (p. 102).', 'في العمارة 8D وحدتان فقط بمساحة 79 م²: ‏8D-G04 (أرضي بحديقة) و8D-104 (دور متكرر). والدور الخامس دور متكرر، إذن التصميم هو 8D-104 (ص 102).'),
      S('Owner area 79.25 m² vs printed 79 m²: consistent (the brochure prints whole numbers). No conflict found.', 'مساحة المالك 79.25 م² مقابل 79 م² المطبوعة: متسقة (الكتيّب يطبع أرقامًا صحيحة). لا يوجد تعارض.'),
      S('Not confirmed by the source: the exact contract code for the fifth floor (likely numbered like 8D-504, but the brochure does not say).', 'غير مؤكد من المصدر: الكود الفعلي في العقد للدور الخامس (غالبًا بترقيم مثل 8D-504، لكن الكتيّب لا يذكر ذلك).'),
    ],
  },
  {
    title: S('2D plan: possible, calibrated', 'المسقط الثنائي: ممكن ومعايَر'),
    items: [
      S('The plan is an embedded image of 524 × 497 px with no scale bar. Scale was calibrated from the printed net dimensions: 40.8 px per metre.', 'المسقط صورة مضمّنة بمقاس 524 × 497 بكسل بلا مقياس رسم. تمت المعايرة من المقاسات الصافية المطبوعة: 40.8 بكسل لكل متر.'),
      S('Walls, doors (with swing), windows, kitchen counter and sanitary fixtures were traced over the drawing. Switch on “Original + traced rooms” on the plan page to check the alignment yourself.', 'تم تتبّع الحوائط والأبواب (باتجاه الفتح) والشبابيك ورخامة المطبخ والأدوات الصحية فوق الرسم. فعّل «الأصلي + الغرف المتتبَّعة» في صفحة المسقط لتتحقق من التطابق بنفسك.'),
    ],
  },
  {
    title: S('3D model: approximate only', 'النموذج الثلاثي: تقريبي فقط'),
    items: [
      S(`Ceiling height ${ASSUMED.ceiling} m, door head ${ASSUMED.doorHead} m, window sill/head ${ASSUMED.windowSill}/${ASSUMED.windowHead} m, glazed-opening head ${ASSUMED.glazedHead} m and terrace parapet ${ASSUMED.parapet} m are assumptions — none appear in the source.`, `ارتفاع السقف ${ASSUMED.ceiling} م، وأعلى الباب ${ASSUMED.doorHead} م، وجلسة/أعلى الشباك ${ASSUMED.windowSill}/${ASSUMED.windowHead} م، وأعلى الفتحة الزجاجية ${ASSUMED.glazedHead} م، وسور التراس ${ASSUMED.parapet} م كلها افتراضات — لا يوجد أي منها في المصدر.`),
      S('All walls are drawn at about 15 cm in the brochure; real external walls are usually thicker. Structural columns are not shown.', 'كل الحوائط مرسومة بسُمك 15 سم تقريبًا في الكتيّب، بينما الحوائط الخارجية الفعلية أسمك عادةً. ولا تظهر الأعمدة الإنشائية.'),
      S('Interpreted symbols: the thin line beside the shower (read as a glass screen), the double line between living room and terrace (read as a glazed opening), and the terrace edge (read as a parapet).', 'رموز مفسَّرة: الخط الرفيع بجوار الدُش (قُرئ كحاجز زجاجي)، والخط المزدوج بين المعيشة والتراس (قُرئ كفتحة زجاجية)، وحافة التراس (قُرئت كسور).'),
      S('The walkthrough is useful for proportions and furniture fit, not for exact clearances.', 'التجوّل مفيد لفهم النِسب ومدى ملاءمة الأثاث، لا للخلوصات الدقيقة.'),
    ],
  },
  {
    title: S('Not in the source', 'غير موجود في المصدر'),
    items: [
      S('Orientation (no north arrow), view, ceiling height, finishing specification, window and door schedule, structure, plumbing and electrical layout, price and delivery date.', 'الاتجاه (لا يوجد سهم شمال)، والإطلالة، وارتفاع السقف، ومواصفات التشطيب، وجدول الأبواب والشبابيك، والإنشاء، وتمديدات السباكة والكهرباء، والسعر وموعد التسليم.'),
    ],
  },
  {
    title: S('Ask the developer for', 'اطلب من المطوّر'),
    items: [
      S('The architectural plan of the fifth floor of Block 8D as DWG or a dimensioned PDF (with dimension lines and wall thicknesses).', 'المسقط المعماري للدور الخامس بالعمارة 8D بصيغة DWG أو PDF بأبعاد (بخطوط أبعاد وسُمك الحوائط).'),
      S('A section through the unit (floor-to-ceiling height, slab, false ceilings) and a door/window schedule (sizes, sill heights).', 'قطاعًا في الوحدة (ارتفاع السقف، البلاطة، الأسقف المعلّقة) وجدول الأبواب والشبابيك (المقاسات وارتفاع الجلسات).'),
      S('The site plan with north arrow, and the structural grid (columns inside the unit).', 'الموقع العام بسهم الشمال، وشبكة الأعمدة الإنشائية (الأعمدة داخل الوحدة).'),
      S('The finishing specification and the definition of the 79 / 79.25 m² (net, gross, share of common areas).', 'مواصفات التشطيب وتعريف مساحة 79 / 79.25 م² (صافي، إجمالي، نصيب المناطق المشتركة).'),
      S('With a DWG or IFC file the 3D model could be rebuilt at real wall thicknesses and heights, and exported as glTF for a true-to-scale walkthrough.', 'بملف DWG أو IFC يمكن إعادة بناء النموذج الثلاثي بسُمك الحوائط والارتفاعات الحقيقية وتصديره بصيغة glTF لتجوّل بمقياس دقيق.'),
    ],
  },
];

const BY_NO: Record<number, (typeof rooms)[number]['id']> = { 1: 'corridor', 2: 'kitchen', 3: 'living', 4: 'terrace', 5: 'lobby', 6: 'bedroom', 7: 'bathroom' };

export function Evidence() {
  const { t, tx, num } = useLang();
  useMeta(t('ev.title'), t('ev.lead'));

  const rows = source.rooms.map((r) => {
    const room = rooms.find((x) => x.id === BY_NO[r.no])!;
    const [ta, tb] = tracedSize(room);
    const [pa, pb] = [...r.dims].sort((x, y) => y - x);
    const dev = Math.max(Math.abs(ta - pa) / pa, Math.abs(tb - pb) / pb) * 100;
    return { r, room, ta, tb, pa, pb, dev };
  });

  const confRows: { what: T; c: Confidence }[] = [
    { what: S('Room names, numbers, net dimensions, gross area 79 m²', 'أسماء الغرف وأرقامها ومقاساتها الصافية والمساحة الإجمالية 79 م²'), c: 'source' },
    { what: S('Wall positions, door positions and swings, windows, kitchen counter, WC, basin', 'أماكن الحوائط والأبواب واتجاه فتحها والشبابيك ورخامة المطبخ والمرحاض والحوض'), c: 'drawn' },
    { what: S('Shower screen, glazed terrace opening, terrace parapet, L-shaped bathroom', 'حاجز الدُش، والفتحة الزجاجية للتراس، وسور التراس، والحمام على شكل L'), c: 'interpreted' },
    { what: S('All heights, wall thickness in 3D, ceiling', 'كل الارتفاعات، وسُمك الحوائط في النموذج الثلاثي، والسقف'), c: 'assumed' },
  ];

  return (
    <>
      <header className="page-head wrap">
        <p className="kicker">8D-104 · D8</p>
        <h1>{t('ev.title')}</h1>
        <p className="lead">{t('ev.lead')}</p>
      </header>

      <section className="section tight">
        <div className="wrap grid-2 wide-left">
          <div className="stack">
            {sections.map((s) => (
              <article key={s.title.en}>
                <h2 className="h-3" style={{ marginBottom: 10 }}>{tx(s.title)}</h2>
                <ul className="rule-list">
                  {s.items.map((i) => (
                    <li key={i.en}>{tx(i)}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
          <aside className="stack">
            <div className="panel">
              <h2>{tx(S('Scale check: printed vs traced', 'فحص المقياس: المطبوع مقابل المتتبَّع'))}</h2>
              <table className="table evidence-table small">
                <thead>
                  <tr>
                    <th>{t('ov.col.room')}</th>
                    <th className="num">{t('ov.col.printed')}</th>
                    <th className="num">{tx(S('Traced', 'المتتبَّع'))}</th>
                    <th className="num">Δ</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(({ r, room, ta, tb, pa, pb, dev }) => (
                    <tr key={r.no}>
                      <td>{tx(roomNames[room.id])}</td>
                      <td className="num"><span className="ltr">{pa.toFixed(2)}×{pb.toFixed(2)}</span></td>
                      <td className="num"><span className="ltr">{ta.toFixed(2)}×{tb.toFixed(2)}</span></td>
                      <td className="num" style={{ color: dev > 8 ? '#c0281c' : undefined, fontWeight: dev > 8 ? 700 : undefined }}>
                        {num(dev, 0)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="small muted" style={{ margin: 0 }}>
                {tx(
                  S(
                    `Scale ${SCALE} px/m. Most rooms agree within 4 %. The corridor width differs most (1.13 m traced vs 1.30 m printed; the printed figure may be wall-to-wall), then the small lobby (1.10 vs 1.20 m, where 4 px ≈ 10 cm). The bathroom figure matches the L-shape including the shower bay. Traced footprint incl. walls and terrace: ${tracedFootprint().toFixed(1)} m².`,
                    `المقياس ${SCALE} بكسل/م. معظم الغرف متطابقة في حدود 4٪. أكبر فرق في عرض الممر (1.13 م متتبَّع مقابل 1.30 م مطبوع؛ وقد يكون الرقم المطبوع من حائط لحائط)، ثم الردهة الصغيرة (1.10 مقابل 1.20 م، حيث 4 بكسل ≈ 10 سم). ورقم الحمام يطابق شكل L شاملًا جزء الدُش. المسطح المتتبَّع شاملًا الحوائط والتراس: ${tracedFootprint().toFixed(1)} م².`,
                  ),
                )}
              </p>
            </div>
            <div className="panel">
              <h2>{tx(S('Confidence by element', 'درجة الثقة لكل عنصر'))}</h2>
              <ul className="rule-list small">
                {confRows.map((row) => (
                  <li key={row.what.en} style={{ display: 'grid', gap: 6 }}>
                    <ConfidenceTag c={row.c} />
                    {tx(row.what)}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
