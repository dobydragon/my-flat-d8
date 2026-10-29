import { Link } from 'react-router-dom';
import { useLang } from '../i18n/LangContext';
import { useMeta } from '../lib/useMeta';
import { asset } from '../lib/asset';
import { facts, owner, project, roomNames, source } from '../data/apartment';
import { rooms, tracedFootprint, tracedSize, type RoomId } from '../data/geometry';
import { StatusTag } from '../components/StatusTag';

/** Brochure room number → traced room. */
const BY_NO: Record<number, RoomId> = { 1: 'corridor', 2: 'kitchen', 3: 'living', 4: 'terrace', 5: 'lobby', 6: 'bedroom', 7: 'bathroom' };

export function Overview() {
  const { t, tx, num } = useLang();
  useMeta('', t('ov.lead'));
  const footprint = tracedFootprint();
  const plate = { w: 743, h: 384 };

  const areas = [
    { label: t('ov.areaOwner'), value: owner.area, status: 'owner' as const },
    { label: t('ov.areaGross'), value: source.grossArea, status: 'source' as const },
    { label: t('ov.areaTrace'), value: footprint, status: 'estimate' as const },
    { label: t('ov.areaNet'), value: source.netRoomsTotal, status: 'derived' as const },
  ];
  const maxArea = Math.max(...areas.map((a) => a.value));

  return (
    <>
      <section className="ap-hero">
        <div className="frame">
          <img src={asset('assets/hero-panorama.webp')} alt={tx({ en: 'Viàle Residence buildings (developer rendering)', ar: 'مباني ڤيالي ريزيدنس (تصور المطوّر)' })} width={1687} height={598} />
        </div>
        <div className="wrap copy">
          <p className="kicker">{t('ov.kicker')}</p>
          <h1>{t('ov.title')}</h1>
          <p className="lead measure">{t('ov.lead')}</p>
          <div className="btn-row">
            <Link className="btn light" to="/plan">
              {t('ov.ctaPlan')}
            </Link>
            <Link className="btn ghost-light" to="/explore">
              {t('ov.ctaExplore')}
            </Link>
          </div>
        </div>
      </section>

      <section className="section tight">
        <div className="wrap">
          <h2 className="h-2" style={{ marginBottom: 20 }}>{t('ov.facts')}</h2>
          <dl className="facts" style={{ margin: 0 }}>
            {facts.map((f) => (
              <div className="fact" key={f.label.en}>
                <dt>
                  {tx(f.label)} <StatusTag status={f.status} />
                </dt>
                <dd>{tx(f.value)}</dd>
                {f.note && <span className="fnote">{tx(f.note)}</span>}
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="section sand tight">
        <div className="wrap grid-2 wide-left">
          <div>
            <h2 className="h-2" style={{ marginBottom: 8 }}>{t('ov.rooms')}</h2>
            <p className="muted">{t('ov.roomsLead')}</p>
            <div className="table-scroll">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">{t('ov.col.room')}</th>
                  <th scope="col" className="num">{t('ov.col.printed')}</th>
                  <th scope="col" className="num">{t('ov.col.area')}</th>
                  <th scope="col" className="num">{t('ov.col.traced')}</th>
                </tr>
              </thead>
              <tbody>
                {source.rooms.map((r) => {
                  const traced = rooms.find((x) => x.id === BY_NO[r.no]);
                  const [a, b] = traced ? tracedSize(traced) : [0, 0];
                  return (
                    <tr key={r.no}>
                      <td>
                        <span className="muted">{r.no}.</span> {tx(roomNames[BY_NO[r.no]])}
                      </td>
                      <td className="num">
                        <span className="ltr">{r.dims[0].toFixed(2)} × {r.dims[1].toFixed(2)}</span>
                      </td>
                      <td className="num">
                        {num(r.netArea, 2)} {tx({ en: 'm²', ar: 'م²' })}
                      </td>
                      <td className="num muted">
                        <span className="ltr">{a.toFixed(2)} × {b.toFixed(2)}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={2}>{t('ov.sum')}</td>
                  <td className="num">
                    {num(source.netRoomsTotal, 2)} {tx({ en: 'm²', ar: 'م²' })}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
            </div>
            <p className="small muted" style={{ marginTop: 12 }}>
              <StatusTag status="source" /> {tx({ en: 'Viàle brochure, p. 102', ar: 'كتيّب ڤيالي، ص 102' })}
            </p>
          </div>
          <div className="stack">
            <h2 className="h-3">{t('ov.areas')}</h2>
            <div className="compare">
              {areas.map((a) => (
                <div className="bar" key={a.label}>
                  <span>
                    {a.label}
                    <br />
                    <StatusTag status={a.status} />
                  </span>
                  <span className="track" aria-hidden="true">
                    <span className="fill" style={{ width: `${(a.value / maxArea) * 100}%` }} />
                  </span>
                  <b>
                    {num(a.value, 2)} {tx({ en: 'm²', ar: 'م²' })}
                  </b>
                </div>
              ))}
            </div>
            <p className="small">{t('ov.areaExplain')}</p>
          </div>
        </div>
      </section>

      <section className="section tight">
        <div className="wrap grid-2 wide-left" style={{ alignItems: 'start' }}>
          <div>
            <h2 className="h-2" style={{ marginBottom: 12 }}>{t('ov.position')}</h2>
            <div style={{ position: 'relative', background: '#fff', border: '1px solid var(--line)', padding: 16 }}>
              <div style={{ position: 'relative' }}>
                <img src={asset('assets/plate-8D-typical.jpg')} alt={t('ov.positionNote')} width={plate.w} height={plate.h} style={{ width: '100%', height: 'auto' }} />
                <svg viewBox="0 0 1 1" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} aria-hidden="true">
                  {source.plateRects.map(([x0, y0, x1, y1], i) => (
                    <rect key={i} x={x0} y={y0} width={x1 - x0} height={y1 - y0} fill="rgba(162,69,35,.45)" stroke="#a24523" strokeWidth={0.003} />
                  ))}
                </svg>
              </div>
            </div>
            <p className="caption">
              {t('ov.positionNote')} <StatusTag status="source" /> {tx({ en: 'p. 98, 102', ar: 'ص 98، 102' })}
            </p>
          </div>
          <div className="stack">
            <h2 className="h-3">{t('ov.project')}</h2>
            <p>
              <b>{tx({ en: 'Viàle Residence', ar: 'ڤيالي ريزيدنس' })}</b> — {tx(project.location)}
              <br />
              <span className="muted">{t('ov.projectFacts', { units: project.units, floors: tx(project.floors), area: num(project.masterPlan) })}</span>
            </p>
            <h3 className="h-3" style={{ fontSize: 'var(--step-0)' }}>{t('ov.amenities')}</h3>
            <ul className="small" style={{ margin: 0, paddingInlineStart: 18, columns: 2 }}>
              {project.amenities.map((a) => (
                <li key={a.en}>{tx(a)}</li>
              ))}
            </ul>
            <p className="small muted">
              <StatusTag status="source" /> {tx({ en: 'Viàle brochure, p. 7–9', ar: 'كتيّب ڤيالي، ص 7–9' })}
            </p>
            <div className="note">
              <h3>{t('ov.confirm')}</h3>
              <p className="small" style={{ margin: 0 }}>{t('ov.confirmList')}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section olive tight">
        <div className="wrap grid-2" style={{ alignItems: 'center' }}>
          <div className="frame ratio-wide">
            <img src={asset('assets/interior-bedroom.webp')} alt={tx({ en: 'Brochure interior theme (not this apartment)', ar: 'الطابع الداخلي في الكتيّب (ليس هذه الشقة)' })} loading="lazy" />
          </div>
          <div>
            <p className="kicker">{t('nav.explore')}</p>
            <p className="lead">{t('ex.lead')}</p>
            <Link className="btn light" to="/explore">
              {t('ov.ctaExplore')}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
