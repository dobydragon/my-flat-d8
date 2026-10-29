import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useLang } from '../i18n/LangContext';

type View = { s: number; x: number; y: number };

type Props = {
  /** Natural size of the content in CSS pixels. */
  width: number;
  height: number;
  children: ReactNode;
  label: string;
  className?: string;
  minScale?: number;
  maxScale?: number;
};

/**
 * Pan / zoom container for a plan image (and anything layered on it).
 * Mouse wheel, drag, two-finger pinch, buttons and keyboard (+ − 0 arrows).
 */
export function PlanViewer({ width, height, children, label, className = '', minScale = 0.2, maxScale = 8 }: Props) {
  const { t } = useLang();
  const box = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<View>({ s: 1, x: 0, y: 0 });
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ d: number; s: number } | null>(null);
  const start = useRef(new Map<number, { x: number; y: number }>());

  const fit = useCallback(() => {
    const el = box.current;
    if (!el) return;
    const { clientWidth: cw, clientHeight: ch } = el;
    const s = Math.min(cw / width, ch / height) * 0.94;
    setView({ s, x: (cw - width * s) / 2, y: (ch - height * s) / 2 });
  }, [width, height]);

  useEffect(() => {
    fit();
    const el = box.current;
    if (!el || !('ResizeObserver' in window)) return;
    const ro = new ResizeObserver(() => fit());
    ro.observe(el);
    return () => ro.disconnect();
  }, [fit]);

  const zoomAt = useCallback(
    (factor: number, cx?: number, cy?: number) => {
      const el = box.current;
      if (!el) return;
      const px = cx ?? el.clientWidth / 2;
      const py = cy ?? el.clientHeight / 2;
      setView((v) => {
        const s = Math.min(maxScale, Math.max(minScale, v.s * factor));
        const k = s / v.s;
        return { s, x: px - (px - v.x) * k, y: py - (py - v.y) * k };
      });
    },
    [minScale, maxScale],
  );

  const actualSize = () => {
    const el = box.current;
    if (!el) return;
    setView({ s: 1, x: (el.clientWidth - width) / 2, y: (el.clientHeight - height) / 2 });
  };

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = el.getBoundingClientRect();
      zoomAt(Math.exp(-e.deltaY * 0.0015), e.clientX - r.left, e.clientY - r.top);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [zoomAt]);

  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button, a, [data-no-pan]')) return;
    // Capture only once the pointer actually drags (see onPointerMove), so plain clicks still
    // reach the content (room selection, measuring).
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    start.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = { d: Math.hypot(a.x - b.x, a.y - b.y), s: view.s };
    }
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    const next = { x: e.clientX, y: e.clientY };
    pointers.current.set(e.pointerId, next);
    const s0 = start.current.get(e.pointerId);
    if (s0 && Math.hypot(next.x - s0.x, next.y - s0.y) > 3) {
      box.current?.setPointerCapture(e.pointerId);
      start.current.delete(e.pointerId);
    }
    if (pointers.current.size === 2 && pinch.current) {
      const [a, b] = [...pointers.current.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      const r = box.current!.getBoundingClientRect();
      const target = Math.min(maxScale, Math.max(minScale, (pinch.current.s * d) / pinch.current.d));
      zoomAt(target / view.s, (a.x + b.x) / 2 - r.left, (a.y + b.y) / 2 - r.top);
      return;
    }
    setView((v) => ({ ...v, x: v.x + next.x - prev.x, y: v.y + next.y - prev.y }));
  };
  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    start.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
  };

  const onKey = (e: React.KeyboardEvent) => {
    const step = 40;
    const map: Record<string, () => void> = {
      '+': () => zoomAt(1.25),
      '=': () => zoomAt(1.25),
      '-': () => zoomAt(0.8),
      '0': fit,
      ArrowLeft: () => setView((v) => ({ ...v, x: v.x + step })),
      ArrowRight: () => setView((v) => ({ ...v, x: v.x - step })),
      ArrowUp: () => setView((v) => ({ ...v, y: v.y + step })),
      ArrowDown: () => setView((v) => ({ ...v, y: v.y - step })),
    };
    const fn = map[e.key];
    if (fn) {
      e.preventDefault();
      fn();
    }
  };

  return (
    <div
      ref={box}
      className={`viewer ${className}`}
      role="application"
      aria-label={`${label}. ${t('viewer.hint')}`}
      tabIndex={0}
      onKeyDown={onKey}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onDoubleClick={(e) => {
        const r = box.current!.getBoundingClientRect();
        zoomAt(1.6, e.clientX - r.left, e.clientY - r.top);
      }}
    >
      <div
        className="viewer-canvas"
        style={{ width, height, transform: `translate(${view.x}px, ${view.y}px) scale(${view.s})` }}
      >
        {children}
      </div>
      <div className="viewer-controls">
        <button type="button" className="icon-btn" onClick={() => zoomAt(1.25)} aria-label={t('viewer.zoomIn')} title={t('viewer.zoomIn')}>
          +
        </button>
        <button type="button" className="icon-btn" onClick={() => zoomAt(0.8)} aria-label={t('viewer.zoomOut')} title={t('viewer.zoomOut')}>
          −
        </button>
        <button type="button" className="icon-btn" onClick={fit} aria-label={t('viewer.fit')} title={t('viewer.fit')}>
          ⤢
        </button>
        <button type="button" className="icon-btn" onClick={actualSize} aria-label={t('viewer.reset')} title={t('viewer.reset')}>
          1:1
        </button>
      </div>
      <div className="viewer-hint" aria-hidden="true">
        {t('viewer.hint')} · {Math.round(view.s * 100)}%
      </div>
    </div>
  );
}
