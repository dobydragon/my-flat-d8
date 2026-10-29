import { lazy, Suspense, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLang } from '../i18n/LangContext';
import { useMeta } from '../lib/useMeta';
import { fitsInside, useLayout } from '../lib/useLayout';
import { brochureLayout, catalog, catalogByKind, type Kind } from '../data/furniture';
import { centroid, m, rooms, tracedSize, type RoomId } from '../data/geometry';
import { roomNames } from '../data/apartment';
import { Studio, type Tool } from '../components/Studio';
import { ConfidenceTag } from '../components/StatusTag';
import type { CameraMode } from '../three/Apartment3D';

const Apartment3D = lazy(() => import('../three/Apartment3D'));

function webgl() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

export function Explore() {
  const { t, tx, num, lang } = useLang();
  useMeta(t('ex.title'), t('ex.lead'));
  const [params, setParams] = useSearchParams();
  const [glOk, setGlOk] = useState(webgl);
  const view = params.get('view') === '3d' && glOk ? '3d' : '2d';
  const setView = (v: '2d' | '3d') => setParams(v === '3d' ? { view: '3d' } : {}, { replace: true });

  const layout = useLayout();
  const [tool, setTool] = useState<Tool>('select');
  const [underlay, setUnderlay] = useState(false);
  const [room, setRoom] = useState<RoomId | null>(null);
  const [measure, setMeasure] = useState<[number, number][]>([]);
  const [cam, setCam] = useState<CameraMode>('orbit');
  const [cutaway, setCutaway] = useState(false);
  const [assumed, setAssumed] = useState(false);
  const walkInput = useRef({ fwd: 0, turn: 0 });

  const labels = useMemo(
    () => Object.fromEntries(rooms.map((r) => [r.id, tx(roomNames[r.id])])) as Record<RoomId, string>,
    [tx],
  );
  const sel = layout.items.find((i) => i.id === layout.selected);
  const dist = measure.length === 2 ? Math.hypot(measure[1][0] - measure[0][0], measure[1][1] - measure[0][1]) : null;

  const addAt = (kind: Kind) => {
    const target = rooms.find((r) => r.id === (room ?? 'living'))!;
    const [cx, cy] = centroid(target.poly);
    layout.add(kind, m(cx), m(cy));
    setTool('select');
  };
  const preset = (which: 'empty' | 'brochure') => {
    if (layout.items.length && !window.confirm(t('ex.confirmReplace'))) return;
    layout.replace(which === 'empty' ? [] : brochureLayout);
  };

  const hold = (key: 'fwd' | 'turn', v: number) => ({
    onPointerDown: (e: React.PointerEvent) => {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      walkInput.current[key] = v;
    },
    onPointerUp: () => (walkInput.current[key] = 0),
    onPointerCancel: () => (walkInput.current[key] = 0),
    onPointerLeave: () => (walkInput.current[key] = 0),
  });

  const roomList = (
    <div className="panel">
      <h2>{t('ex.rooms')}</h2>
      <div className="room-buttons">
        {rooms
          .filter((r) => r.no)
          .map((r) => {
            const [a, b] = tracedSize(r);
            return (
              <button key={r.id} type="button" aria-pressed={room === r.id} onClick={() => setRoom(room === r.id ? null : r.id)} aria-label={t('ex.roomFocus', { room: tx(roomNames[r.id]) })}>
                <span style={{ fontWeight: 700 }}>
                  {lang === 'ar' ? `${r.no} · ${tx(roomNames[r.id])}` : `${r.no}. ${tx(roomNames[r.id])}`}
                </span>
                {r.printed && <span className="small">{num(r.printed[0] * r.printed[1], 2)} {tx({ en: 'm²', ar: 'م²' })}</span>}
                <span className="sub">
                  {r.printed && t('ex.roomPrinted', { a: num(r.printed[0], 2), b: num(r.printed[1], 2) })} · {t('ex.roomTraced', { a: num(a, 2), b: num(b, 2) })}
                </span>
              </button>
            );
          })}
      </div>
    </div>
  );

  return (
    <>
      <header className="page-head wrap">
        <p className="kicker">8D-104 · {tx({ en: 'Fifth floor', ar: 'الدور الخامس' })}</p>
        <h1>{t('ex.title')}</h1>
        <p className="lead">{t('ex.lead')}</p>
      </header>

      <section className="section tight">
        <div className="wrap">
          <div className="toolbar">
            <div className="field">
              <span id="lbl-view">{t('ex.view')}</span>
              <div className="seg" role="group" aria-labelledby="lbl-view">
                <button type="button" aria-pressed={view === '2d'} onClick={() => setView('2d')}>
                  {t('ex.view2d')}
                </button>
                <button type="button" aria-pressed={view === '3d'} onClick={() => setView('3d')} disabled={!glOk} title={glOk ? undefined : t('3d.fail')}>
                  {t('ex.view3d')}
                </button>
              </div>
            </div>
            {view === '2d' ? (
              <>
                <div className="field">
                  <span id="lbl-tool">{t('ex.tool')}</span>
                  <div className="seg" role="group" aria-labelledby="lbl-tool">
                    <button type="button" aria-pressed={tool === 'select'} onClick={() => setTool('select')}>
                      {t('ex.toolSelect')}
                    </button>
                    <button type="button" aria-pressed={tool === 'measure'} onClick={() => setTool('measure')}>
                      {t('ex.toolMeasure')}
                    </button>
                  </div>
                </div>
                <label style={{ display: 'flex', gap: 8, alignItems: 'center', alignSelf: 'end', minHeight: 46 }}>
                  <input type="checkbox" checked={underlay} onChange={(e) => setUnderlay(e.target.checked)} />
                  {t('ex.underlay')}
                </label>
              </>
            ) : (
              <>
                <div className="field">
                  <span id="lbl-cam">{t('3d.camera')}</span>
                  <div className="seg" role="group" aria-labelledby="lbl-cam">
                    {(['orbit', 'top', 'walk'] as CameraMode[]).map((c) => (
                      <button key={c} type="button" aria-pressed={cam === c} onClick={() => setCam(c)}>
                        {t(`3d.${c}`)}
                      </button>
                    ))}
                  </div>
                </div>
                <label style={{ display: 'flex', gap: 8, alignItems: 'center', alignSelf: 'end', minHeight: 46 }}>
                  <input type="checkbox" checked={cutaway} onChange={(e) => setCutaway(e.target.checked)} />
                  {t('3d.cutaway')}
                </label>
                <label style={{ display: 'flex', gap: 8, alignItems: 'center', alignSelf: 'end', minHeight: 46 }}>
                  <input type="checkbox" checked={assumed} onChange={(e) => setAssumed(e.target.checked)} />
                  {t('3d.estimates')}
                </label>
              </>
            )}
          </div>

          <div className="workspace">
            <div>
              {view === '2d' ? (
                <Studio
                  layout={layout}
                  tool={tool}
                  underlay={underlay}
                  selectedRoom={room}
                  onRoomClick={(id) => setRoom(id)}
                  measure={measure}
                  setMeasure={setMeasure}
                />
              ) : (
                <div className="stage-wrap">
                  <Suspense fallback={<div className="stage-3d"><div className="stage-msg">{t('3d.loading')}</div></div>}>
                    <Apartment3D
                      items={layout.items}
                      mode={cam}
                      cutaway={cutaway}
                      showAssumed={assumed}
                      focusRoom={room}
                      roomLabels={labels}
                      walkInput={walkInput}
                      onError={() => {
                        setGlOk(false);
                        setView('2d');
                      }}
                    />
                  </Suspense>
                  <div className="stage-overlay">{cam === 'walk' ? t('3d.walkHint') : t('3d.orbitHint')}</div>
                  {cam === 'walk' && (
                    <div className="walk-pad" aria-label={t('3d.walk')}>
                      <span />
                      <button type="button" aria-label={t('3d.forward')} {...hold('fwd', 1)}>↑</button>
                      <span />
                      <button type="button" aria-label={t('3d.left')} {...hold('turn', 1)}>↺</button>
                      <button type="button" aria-label={t('3d.back')} {...hold('fwd', -1)}>↓</button>
                      <button type="button" aria-label={t('3d.right')} {...hold('turn', -1)}>↻</button>
                    </div>
                  )}
                </div>
              )}
              <p className="caption">{view === '2d' ? t('ex.scaleNote') : t('3d.disclaimer')}</p>
              <div className="legend" style={{ marginTop: 8 }}>
                {view === '2d' ? (
                  <>
                    <span><i className="sw" /> <ConfidenceTag c="drawn" /></span>
                    <span><i className="sw dash" /> <ConfidenceTag c="interpreted" /></span>
                    <span><i className="sw clash" /> {t('ex.clash')}</span>
                  </>
                ) : (
                  <>
                    <span><i className="sw" /> {tx({ en: 'Wall positions', ar: 'أماكن الحوائط' })}: <ConfidenceTag c="drawn" /></span>
                    <span><i className="sw assumed" /> {tx({ en: 'Heights, glazing, ceiling', ar: 'الارتفاعات والزجاج والسقف' })}: <ConfidenceTag c="assumed" /></span>
                  </>
                )}
              </div>
            </div>

            <aside className="side-panel">
              {view === '2d' && tool === 'measure' && (
                <div className="panel" aria-live="polite">
                  <h2>{t('ex.toolMeasure')}</h2>
                  <p style={{ margin: 0 }}>{dist !== null ? t('ex.measured', { d: num(dist, 2) }) : t('ex.measureHint')}</p>
                  {measure.length > 0 && (
                    <button type="button" className="btn ghost" onClick={() => setMeasure([])}>
                      {t('ex.clearMeasure')}
                    </button>
                  )}
                </div>
              )}

              {view === '2d' && (
                <div className="panel">
                  <h2>{t('ex.selected')}</h2>
                  {sel ? (
                    <>
                      <p style={{ margin: 0, fontWeight: 700 }}>{tx(catalogByKind[sel.kind].name)}</p>
                      <div className="inline-fields">
                        <label className="field">
                          <span>{t('ex.width')}</span>
                          <input className="input ltr" type="number" min={0.2} max={4} step={0.05} value={sel.w}
                            onChange={(e) => e.target.valueAsNumber > 0 && layout.update(sel.id, { w: e.target.valueAsNumber })} />
                        </label>
                        <label className="field">
                          <span>{t('ex.depth')}</span>
                          <input className="input ltr" type="number" min={0.2} max={4} step={0.05} value={sel.d}
                            onChange={(e) => e.target.valueAsNumber > 0 && layout.update(sel.id, { d: e.target.valueAsNumber })} />
                        </label>
                      </div>
                      <p className={fitsInside(sel) ? 'status source' : 'status unknown'} style={fitsInside(sel) ? undefined : { color: '#c0281c' }}>
                        {fitsInside(sel) ? t('ex.fits') : t('ex.clash')}
                      </p>
                      <div className="btn-row">
                        <button type="button" className="btn ghost" onClick={() => layout.update(sel.id, { rot: (sel.rot + 90) % 360 })}>{t('ex.rotate')}</button>
                        <button type="button" className="btn ghost" onClick={() => layout.update(sel.id, { rot: (sel.rot + 15) % 360 })}>{t('ex.rotateFine')}</button>
                        <button type="button" className="btn ghost" onClick={() => layout.duplicate(sel.id)}>{t('ex.duplicate')}</button>
                        <button type="button" className="btn" onClick={() => layout.remove(sel.id)}>{t('ex.delete')}</button>
                      </div>
                      <p className="small muted" style={{ margin: 0 }}>{t('ex.keys')}</p>
                    </>
                  ) : (
                    <p className="muted" style={{ margin: 0 }}>{t('ex.none')}</p>
                  )}
                </div>
              )}

              {view === '2d' && (
                <div className="panel">
                  <h2>{t('ex.add')}</h2>
                  <div className="catalog">
                    {catalog.map((c) => (
                      <button key={c.kind} type="button" onClick={() => addAt(c.kind)}>
                        <span>{tx(c.name)}</span>
                        <small>{c.w}×{c.d}</small>
                      </button>
                    ))}
                  </div>
                  <p className="small muted" style={{ margin: 0 }}>{t('ex.typical')}</p>
                  <h3>{t('ex.layout')} · {t('ex.items', { n: layout.items.length })}</h3>
                  <div className="btn-row">
                    <button type="button" className="btn ghost" onClick={() => preset('brochure')}>{t('ex.presetBrochure')}</button>
                    <button type="button" className="btn ghost" onClick={() => preset('empty')}>{t('ex.presetEmpty')}</button>
                  </div>
                  <p className="small muted" style={{ margin: 0 }}>{t('ex.saved')}</p>
                </div>
              )}

              {roomList}
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
