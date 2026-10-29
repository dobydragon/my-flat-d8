import type { ReactNode } from 'react';
import { useLang } from '../i18n/LangContext';
import {
  centroid,
  fixtures,
  m,
  PLAN_IMAGE,
  rooms,
  walls,
  wallSegments,
  type Opening,
  type Pt,
  type RoomId,
  type Wall,
} from '../data/geometry';
import { roomNames } from '../data/apartment';
import { catalogByKind, type Placed } from '../data/furniture';

export const VIEW_W = m(PLAN_IMAGE.w);
export const VIEW_H = m(PLAN_IMAGE.h);

const FLOOR_FILL: Record<string, string> = {
  tile: '#efe9dc',
  wood: '#eadcc4',
  wet: '#dde7ea',
  outdoor: '#e2e3d6',
};

/** Hand-placed label anchors where the room centre is crowded (px). */
const LABEL_AT: Partial<Record<RoomId, Pt>> = { bathroom: [232, 190], lobby: [289, 214], corridor: [86, 100] };

const pts = (p: Pt[]) => p.map(([x, y]) => `${m(x)},${m(y)}`).join(' ');

type Props = {
  showRooms?: boolean;
  showLabels?: boolean;
  showFixtures?: boolean;
  showWalls?: boolean;
  /** Draw walls semi-transparent so the original drawing shows through. */
  ghost?: boolean;
  furniture?: Placed[];
  selectedRoom?: RoomId | null;
  onRoomClick?: (id: RoomId) => void;
  /** Drawn above furniture, below walls and labels (e.g. interactive furniture). */
  children?: ReactNode;
  /** Drawn on top of everything (e.g. measurements). */
  overlay?: ReactNode;
  className?: string;
  title?: string;
};

/** The traced plan, drawn in metres (viewBox = image size / SCALE). */
export function PlanSvg({
  showRooms = true,
  showLabels = true,
  showFixtures = true,
  showWalls = true,
  ghost = false,
  furniture,
  selectedRoom,
  onRoomClick,
  children,
  overlay,
  className,
  title,
}: Props) {
  const { tx, num, lang } = useLang();
  return (
    <svg
      className={className}
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width={PLAN_IMAGE.w}
      height={PLAN_IMAGE.h}
      role="img"
      aria-label={title}
    >
      {showRooms &&
        rooms.map((r) => (
          <polygon
            key={r.id}
            points={pts(r.poly)}
            fill={ghost ? 'transparent' : FLOOR_FILL[r.floor]}
            className={`room${selectedRoom === r.id ? ' selected' : ''}${onRoomClick ? ' clickable' : ''}`}
            onClick={onRoomClick ? () => onRoomClick(r.id) : undefined}
          />
        ))}
      {showFixtures &&
        fixtures.map((f) => (
          <polygon key={f.id} points={pts(f.poly)} className={`fixture conf-${f.confidence}`} />
        ))}
      {furniture?.map((it) => <FurnitureShape key={it.id} item={it} />)}
      {children}
      {showWalls && (
        <g className={ghost ? 'walls ghost' : 'walls'}>
          {walls.map((w) => (
            <WallShape key={w.id} w={w} />
          ))}
        </g>
      )}
      {showLabels &&
        rooms
          .filter((r) => r.no)
          .map((r) => {
            const [cx, cy] = LABEL_AT[r.id] ?? centroid(r.poly);
            const small = r.id === 'lobby' || r.id === 'terrace' || r.id === 'corridor' || r.id === 'bathroom';
            return (
              <g key={r.id} className="room-label" transform={`translate(${m(cx)} ${m(cy)})`}>
                <text y={-0.08} fontSize={small ? 0.2 : 0.26} className="name">
                  {lang === 'ar' ? `${r.no} · ${tx(roomNames[r.id])}` : `${r.no}. ${tx(roomNames[r.id])}`}
                </text>
                {r.printed && (
                  <text y={small ? 0.18 : 0.24} fontSize={small ? 0.17 : 0.21} className="dims">
                    {num(r.printed[0], 2)} × {num(r.printed[1], 2)}
                  </text>
                )}
              </g>
            );
          })}
      {overlay}
    </svg>
  );
}

function along(w: Wall, d: number): Pt {
  const len = Math.hypot(w.b[0] - w.a[0], w.b[1] - w.a[1]);
  const k = d / len;
  return [w.a[0] + (w.b[0] - w.a[0]) * k, w.a[1] + (w.b[1] - w.a[1]) * k];
}

function WallShape({ w }: { w: Wall }) {
  const { parts } = wallSegments(w);
  const len = Math.hypot(w.b[0] - w.a[0], w.b[1] - w.a[1]);
  const nx = -(w.b[1] - w.a[1]) / len;
  const ny = (w.b[0] - w.a[0]) / len;
  return (
    <g className={`wall kind-${w.kind} conf-${w.confidence}`}>
      {parts.map((p, i) => {
        const [x1, y1] = along(w, p.from);
        const [x2, y2] = along(w, p.to);
        if (!p.opening) {
          return <line key={i} x1={m(x1)} y1={m(y1)} x2={m(x2)} y2={m(y2)} strokeWidth={m(w.t)} className="solid" />;
        }
        return <OpeningShape key={i} o={p.opening} a={[x1, y1]} b={[x2, y2]} n={[nx, ny]} t={w.t} />;
      })}
    </g>
  );
}

function OpeningShape({ o, a, b, n, t }: { o: Opening; a: Pt; b: Pt; n: Pt; t: number }) {
  const off = m(t) / 2;
  if (o.kind === 'window' || o.kind === 'glazed-door') {
    return (
      <g className={`opening ${o.kind} conf-${o.confidence}`}>
        <title>{o.label}</title>
        {[-1, 1].map((s) => (
          <line
            key={s}
            x1={m(a[0]) + n[0] * off * s * 0.6}
            y1={m(a[1]) + n[1] * off * s * 0.6}
            x2={m(b[0]) + n[0] * off * s * 0.6}
            y2={m(b[1]) + n[1] * off * s * 0.6}
          />
        ))}
      </g>
    );
  }
  // Door: leaf drawn open (90°) from the hinge, with its swing arc.
  const hinge = o.hinge === 'to' ? b : a;
  const free = o.hinge === 'to' ? a : b;
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const s = o.swing ?? 1;
  const leafEnd: Pt = [hinge[0] + n[0] * L * s, hinge[1] + n[1] * L * s];
  const v1 = [leafEnd[0] - hinge[0], leafEnd[1] - hinge[1]];
  const v2 = [free[0] - hinge[0], free[1] - hinge[1]];
  const sweep = v1[0] * v2[1] - v1[1] * v2[0] > 0 ? 1 : 0;
  return (
    <g className={`opening door conf-${o.confidence}`}>
      <title>{o.label}</title>
      <line x1={m(hinge[0])} y1={m(hinge[1])} x2={m(leafEnd[0])} y2={m(leafEnd[1])} className="leaf" />
      <path d={`M ${m(leafEnd[0])} ${m(leafEnd[1])} A ${m(L)} ${m(L)} 0 0 ${sweep} ${m(free[0])} ${m(free[1])}`} className="swing" />
    </g>
  );
}

/** Plan-view glyph for a furniture item. Local origin at its centre; front faces local +y. */
export function FurnitureShape({ item, selected, clash }: { item: Placed; selected?: boolean; clash?: boolean }) {
  const c = catalogByKind[item.kind];
  const { w, d } = item;
  const x0 = -w / 2;
  const y0 = -d / 2;
  let detail: ReactNode = null;
  if (item.kind.startsWith('bed')) {
    const pw = item.kind === 'bed-double' ? w / 2 - 0.08 : w - 0.16;
    detail = (
      <>
        <rect x={x0 + 0.06} y={y0 + 0.08} width={pw} height={0.28} rx={0.05} className="detail" />
        {item.kind === 'bed-double' && <rect x={0.02} y={y0 + 0.08} width={pw} height={0.28} rx={0.05} className="detail" />}
        <line x1={x0} y1={y0 + d * 0.38} x2={x0 + w} y2={y0 + d * 0.38} className="detail" />
      </>
    );
  } else if (item.kind.startsWith('sofa') || item.kind === 'armchair') {
    detail = (
      <>
        <rect x={x0} y={y0} width={w} height={Math.min(0.22, d * 0.25)} className="detail" />
        <rect x={x0} y={y0} width={0.16} height={d} className="detail" />
        <rect x={x0 + w - 0.16} y={y0} width={0.16} height={d} className="detail" />
      </>
    );
  } else if (item.kind.startsWith('wardrobe')) {
    detail = <line x1={0} y1={y0} x2={0} y2={y0 + d} className="detail" />;
  } else if (item.kind === 'chair') {
    detail = <rect x={x0} y={y0} width={w} height={0.08} className="detail" />;
  }
  return (
    <g
      transform={`translate(${item.x} ${item.y}) rotate(${item.rot})`}
      className={`furniture${selected ? ' selected' : ''}${clash ? ' clash' : ''}${item.kind === 'rug' ? ' rug' : ''}`}
      style={{ ['--fill' as string]: c.color }}
    >
      {c.round ? (
        <ellipse cx={0} cy={0} rx={w / 2} ry={d / 2} className="body" />
      ) : (
        <rect x={x0} y={y0} width={w} height={d} rx={0.03} className="body" />
      )}
      {detail}
    </g>
  );
}
