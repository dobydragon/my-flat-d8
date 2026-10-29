import { useCallback, useEffect, useState } from 'react';
import { brochureLayout, catalogByKind, newId, type Kind, type Placed } from '../data/furniture';
import { pointInPoly, rooms, SCALE, type Pt } from '../data/geometry';

const KEY = 'd8-layout-v1';

function load(): Placed[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Placed[];
      if (Array.isArray(parsed) && parsed.every((p) => typeof p.x === 'number' && p.kind in catalogByKind)) return parsed;
    }
  } catch {
    /* unavailable or corrupt: fall back to the brochure layout */
  }
  return brochureLayout;
}

export function useLayout() {
  const [items, setItems] = useState<Placed[]>(load);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items]);

  const update = useCallback((id: string, patch: Partial<Placed>) => {
    setItems((list) => list.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }, []);

  const add = useCallback((kind: Kind, x: number, y: number) => {
    const c = catalogByKind[kind];
    const item: Placed = { id: newId(), kind, x, y, rot: 0, w: c.w, d: c.d };
    setItems((list) => [...list, item]);
    setSelected(item.id);
  }, []);

  const remove = useCallback((id: string) => {
    setItems((list) => list.filter((it) => it.id !== id));
    setSelected((s) => (s === id ? null : s));
  }, []);

  const duplicate = useCallback(
    (id: string) => {
      const src = items.find((it) => it.id === id);
      if (!src) return;
      const copy = { ...src, id: newId(), x: src.x + 0.3, y: src.y + 0.3 };
      setItems((list) => [...list, copy]);
      setSelected(copy.id);
    },
    [items],
  );

  const replace = useCallback((next: Placed[]) => {
    setItems(next.map((it) => ({ ...it, id: newId() })));
    setSelected(null);
  }, []);

  return { items, selected, setSelected, update, add, remove, duplicate, replace };
}

/** Corner and edge points of an item, in image pixels, shrunk 3 cm so items touching a wall still count as inside. */
function samplePoints(it: Placed): Pt[] {
  const hw = it.w / 2 - 0.03;
  const hd = it.d / 2 - 0.03;
  const r = (it.rot * Math.PI) / 180;
  const cos = Math.cos(r);
  const sin = Math.sin(r);
  const local: Pt[] = [
    [-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd],
    [0, -hd], [hw, 0], [0, hd], [-hw, 0], [0, 0],
  ];
  return local.map(([x, y]) => [(it.x + x * cos - y * sin) * SCALE, (it.y + x * sin + y * cos) * SCALE]);
}

/** True when every sample point lies inside some room polygon (i.e. the item crosses no wall). */
export function fitsInside(it: Placed) {
  return samplePoints(it).every((p) => rooms.some((r) => pointInPoly(p, r.poly)));
}
