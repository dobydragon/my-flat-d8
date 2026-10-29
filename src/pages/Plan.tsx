import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../i18n/LangContext';
import { useMeta } from '../lib/useMeta';
import { asset } from '../lib/asset';
import { useLayout } from '../lib/useLayout';
import { PLAN_IMAGE } from '../data/geometry';
import { PlanViewer } from '../components/PlanViewer';
import { PlanSvg } from '../components/PlanSvg';
import { ConfidenceTag } from '../components/StatusTag';

type Mode = 'original' | 'overlay' | 'clean' | 'furnished';

export function Plan() {
  const { t, tx } = useLang();
  useMeta(t('plan.title'), t('plan.lead'));
  const [mode, setMode] = useState<Mode>('original');
  const [labels, setLabels] = useState(true);
  const { items } = useLayout();

  const showImage = mode === 'original' || mode === 'overlay';
  const showTrace = mode !== 'original';

  return (
    <div className="plan-page">
      <header className="page-head wrap">
        <p className="kicker">8D-104 · {tx({ en: 'Viàle brochure, p. 102', ar: 'كتيّب ڤيالي، ص 102' })}</p>
        <h1>{t('plan.title')}</h1>
        <p className="lead">{t('plan.lead')}</p>
      </header>
      <section className="section tight">
        <div className="wrap workspace">
          <div>
            <PlanViewer width={PLAN_IMAGE.w} height={PLAN_IMAGE.h} label={t('plan.title')} maxScale={10}>
              <div style={{ position: 'relative', width: PLAN_IMAGE.w, height: PLAN_IMAGE.h }}>
                {showImage && (
                  <img
                    src={asset(PLAN_IMAGE.src)}
                    alt={tx({ en: 'Original plan of 8D-104 from the brochure', ar: 'المسقط الأصلي للوحدة 8D-104 من الكتيّب' })}
                    width={PLAN_IMAGE.w}
                    height={PLAN_IMAGE.h}
                    draggable={false}
                    style={{ position: 'absolute', inset: 0, maxWidth: 'none', opacity: mode === 'overlay' ? 0.6 : 1 }}
                  />
                )}
                {showTrace && (
                  <PlanSvg
                    className="plan-svg"
                    ghost={mode === 'overlay'}
                    showRooms
                    showLabels={labels}
                    furniture={mode === 'furnished' ? items : undefined}
                    title={t('plan.title')}
                  />
                )}
                {mode === 'original' && labels && <PlanSvg className="plan-svg" ghost showRooms={false} showFixtures={false} showWalls={false} showLabels />}
              </div>
            </PlanViewer>
            <p className="caption">{t('plan.res')}</p>
          </div>

          <aside className="panel">
            <h2>{t('plan.layers')}</h2>
            <div className="room-buttons" role="radiogroup" aria-label={t('plan.layers')}>
              {(['original', 'overlay', 'clean', 'furnished'] as Mode[]).map((md) => (
                <button key={md} type="button" role="radio" aria-checked={mode === md} aria-pressed={mode === md} onClick={() => setMode(md)}>
                  <span>{t(`plan.mode.${md}`)}</span>
                </button>
              ))}
            </div>
            <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="checkbox" checked={labels} onChange={(e) => setLabels(e.target.checked)} />
              {t('plan.labels')}
            </label>
            <div className="legend" aria-label={t('legend')}>
              <span>
                <i className="sw" /> <ConfidenceTag c="drawn" />
              </span>
              <span>
                <i className="sw dash" /> <ConfidenceTag c="interpreted" />
              </span>
              <span>
                <i className="sw win" /> {tx({ en: 'Window / glazing', ar: 'شباك / زجاج' })}
              </span>
            </div>
            <p className="small muted" style={{ margin: 0 }}>{t('ex.scaleNote')}</p>
            <Link className="btn" to="/explore">
              {t('ov.ctaExplore')}
            </Link>
          </aside>
        </div>
      </section>

      <section className="section sand tight">
        <div className="wrap grid-2" style={{ alignItems: 'center' }}>
          <p className="measure" style={{ margin: 0 }}>{t('plan.ground')}</p>
          <figure style={{ margin: 0, background: '#fff', padding: 12, maxWidth: 360 }}>
            <img src={asset('assets/plan-8D-G04.jpg')} alt="8D-G04" width={589} height={497} loading="lazy" />
            <figcaption>8D-G04 · {tx({ en: 'brochure p. 96', ar: 'الكتيّب ص 96' })}</figcaption>
          </figure>
        </div>
      </section>
    </div>
  );
}
