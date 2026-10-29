import { useRef, useState } from 'react';
import { useLang } from '../i18n/LangContext';
import { asset } from '../lib/asset';
import { fitsInside, type useLayout } from '../lib/useLayout';
import { PLAN_IMAGE, type RoomId } from '../data/geometry';
import { PlanViewer } from './PlanViewer';
import { FurnitureShape, PlanSvg, VIEW_H, VIEW_W } from './PlanSvg';

type Layout = ReturnType<typeof useLayout>;
export type Tool = 'select' | 'measure';

type Props = {
  layout: Layout;
  tool: Tool;
  underlay: boolean;
  selectedRoom: RoomId | null;
  onRoomClick: (id: RoomId) => void;
  measure: [number, number][];
  setMeasure: (pts: [number, number][]) => void;
};

export function Studio({ layout, tool, underlay, selectedRoom, onRoomClick, measure, setMeasure }: Props) {
  const { t, num } = useLang();
  const svgRef = useRef<SVGSVGElement | null>(null);
  const drag = useRef<{ id: string; dx: number; dy: number; pointer: number } | null>(null);
  const downAt = useRef<{ x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  // Bounding-rect maths rather than getScreenCTM(): the latter ignored page scroll inside the
  // CSS-transformed viewer in Chrome. The SVG is never rotated, so this is exact.
  const toPlan = (e: { clientX: number; clientY: number }): [number, number] | null => {
    const r = svgRef.current?.getBoundingClientRect();
    if (!r || !r.width) return null;
    return [((e.clientX - r.left) / r.width) * VIEW_W, ((e.clientY - r.top) / r.height) * VIEW_H];
  };

  const startDrag = (e: React.PointerEvent, id: string) => {
    if (tool !== 'select') return;
    e.stopPropagation();
    const it = layout.items.find((i) => i.id === id);
    const p = toPlan(e);
    if (!it || !p) return;
    layout.setSelected(id);
    downAt.current = { x: e.clientX, y: e.clientY }; // so the click that ends a drag is not read as "click on empty floor"
    drag.current = { id, dx: p[0] - it.x, dy: p[1] - it.y, pointer: e.pointerId };
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    setDragging(true);
  };
  const moveDrag = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.pointer !== e.pointerId) return;
    const p = toPlan(e);
    if (!p) return;
    layout.update(d.id, { x: +(p[0] - d.dx).toFixed(3), y: +(p[1] - d.dy).toFixed(3) });
  };
  const endDrag = () => {
    drag.current = null;
    setDragging(false);
  };

  const onSvgPointerDown = (e: React.PointerEvent) => {
    downAt.current = { x: e.clientX, y: e.clientY };
  };
  const onSvgClick = (e: React.MouseEvent) => {
    const d = downAt.current;
    if (d && Math.hypot(e.clientX - d.x, e.clientY - d.y) > 4) return; // that was a pan
    if (tool === 'measure') {
      const p = toPlan(e);
      if (!p) return;
      setMeasure(measure.length >= 2 ? [p] : [...measure, p]);
      return;
    }
    if (!(e.target as Element).closest('.furniture')) layout.setSelected(null);
  };

  const onKey = (e: React.KeyboardEvent) => {
    const id = layout.selected;
    if (!id || tool !== 'select') return;
    const it = layout.items.find((i) => i.id === id);
    if (!it) return;
    const step = e.shiftKey ? 0.5 : 0.05;
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    if (moves[e.key]) {
      e.preventDefault();
      e.stopPropagation();
      layout.update(id, { x: it.x + moves[e.key][0], y: it.y + moves[e.key][1] });
    } else if (e.key === 'r' || e.key === 'R') {
      layout.update(id, { rot: (it.rot + (e.shiftKey ? 15 : 90)) % 360 });
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      layout.remove(id);
    }
  };

  const dist = measure.length === 2 ? Math.hypot(measure[1][0] - measure[0][0], measure[1][1] - measure[0][1]) : null;

  return (
    <div onKeyDownCapture={onKey} className={`studio tool-${tool}${dragging ? ' is-dragging' : ''}`}>
      <PlanViewer width={PLAN_IMAGE.w} height={PLAN_IMAGE.h} label={t('ex.title')} className="studio-viewer" maxScale={10}>
        <div style={{ position: 'relative', width: PLAN_IMAGE.w, height: PLAN_IMAGE.h }}>
          {underlay && <img src={asset(PLAN_IMAGE.src)} alt="" className="underlay" width={PLAN_IMAGE.w} height={PLAN_IMAGE.h} draggable={false} />}
          <div
            ref={(el) => {
              svgRef.current = el?.querySelector('svg') ?? null;
            }}
            style={{ position: 'absolute', inset: 0 }}
            onPointerDown={onSvgPointerDown}
            onPointerMove={moveDrag}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onClick={onSvgClick}
          >
            <PlanSvg
              ghost={underlay}
              showLabels
              selectedRoom={selectedRoom}
              onRoomClick={tool === 'select' ? onRoomClick : undefined}
              className="plan-svg"
              overlay={
                measure.length > 0 && (
                  <g className="measure">
                    {measure.length === 2 && <line x1={measure[0][0]} y1={measure[0][1]} x2={measure[1][0]} y2={measure[1][1]} />}
                    {measure.map(([x, y], i) => (
                      <circle key={i} cx={x} cy={y} r={0.07} />
                    ))}
                    {dist !== null && (
                      <text x={(measure[0][0] + measure[1][0]) / 2} y={(measure[0][1] + measure[1][1]) / 2 - 0.15} fontSize={0.3}>
                        {num(dist, 2)} m
                      </text>
                    )}
                  </g>
                )
              }
            >
              <g>
                {layout.items.map((it) => (
                  <g
                    key={it.id}
                    data-no-pan
                    onPointerDown={(e) => startDrag(e, it.id)}
                    role="button"
                    tabIndex={-1}
                    aria-label={it.kind}
                    style={{ cursor: tool === 'select' ? 'move' : 'crosshair' }}
                  >
                    <FurnitureShape item={it} selected={it.id === layout.selected} clash={!fitsInside(it)} />
                  </g>
                ))}
              </g>
            </PlanSvg>
          </div>
        </div>
      </PlanViewer>
    </div>
  );
}
