import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ASSUMED, centroid, fixtures, m, rooms, walls, wallSegments, type Pt, type RoomId, type Wall } from '../data/geometry';
import { catalogByKind, type Placed } from '../data/furniture';

export type CameraMode = 'orbit' | 'top' | 'walk';

type Props = {
  items: Placed[];
  mode: CameraMode;
  cutaway: boolean;
  showAssumed: boolean;
  focusRoom: RoomId | null;
  roomLabels: Record<RoomId, string>;
  /** Pressed on-screen walk buttons (for touch devices). */
  walkInput: React.MutableRefObject<{ fwd: number; turn: number }>;
  onError: () => void;
};

const FLOOR_COLOR: Record<string, number> = { tile: 0xe9e2d3, wood: 0xc9ad86, wet: 0xd4e0e4, outdoor: 0xb9b8a6 };
const WALL_COLOR = 0xf3efe7;
const ASSUMED_COLOR = 0xe0782f;
const CENTER = new THREE.Vector3(m(270), 0, m(210));
const EYE = 1.6;

type Collider = { a: THREE.Vector2; b: THREE.Vector2; r: number };

function shapeFrom(poly: Pt[]) {
  const s = new THREE.Shape();
  poly.forEach(([x, y], i) => (i ? s.lineTo(m(x), m(y)) : s.moveTo(m(x), m(y))));
  s.closePath();
  return s;
}

function makeLabel(text: string) {
  const c = document.createElement('canvas');
  const ctx = c.getContext('2d')!;
  const font = '600 44px "Reddit Sans", "IBM Plex Sans Arabic", sans-serif';
  ctx.font = font;
  const w = Math.ceil(ctx.measureText(text).width) + 40;
  c.width = w;
  c.height = 72;
  ctx.font = font;
  ctx.fillStyle = 'rgba(250,247,240,0.92)';
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(0, 0, w, 72, 14);
  else ctx.rect(0, 0, w, 72);
  ctx.fill();
  ctx.fillStyle = '#2b2a27';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, w / 2, 38);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true }));
  sprite.scale.set(w / 72 * 0.32, 0.32, 1);
  sprite.renderOrder = 10;
  return sprite;
}

/**
 * Approximate 3D model of 8D-104. Wall positions come from the trace; all heights are
 * the ASSUMED values (the source has no sections or elevations).
 */
export default function Apartment3D({ items, mode, cutaway, showAssumed, focusRoom, roomLabels, walkInput, onError }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const api = useRef<{
    setItems: (it: Placed[]) => void;
    setMode: (m: CameraMode) => void;
    setArch: (cut: boolean, assumed: boolean) => void;
    focus: (r: RoomId | null) => void;
    setLabels: (l: Record<RoomId, string>) => void;
  } | null>(null);
  const latest = useRef({ items, mode, cutaway, showAssumed, focusRoom, roomLabels });
  latest.current = { items, mode, cutaway, showAssumed, focusRoom, roomLabels };

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true });
    } catch {
      onError();
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0xf1ece2);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xf1ece2, 30, 60);
    const camera = new THREE.PerspectiveCamera(50, 1, 0.05, 200);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.copy(CENTER);

    scene.add(new THREE.HemisphereLight(0xfffaf0, 0xb8ab92, 1.6));
    const sun = new THREE.DirectionalLight(0xfff3df, 2.2);
    sun.position.set(CENTER.x + 6, 14, CENTER.z + 9);
    sun.target.position.copy(CENTER);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    const sc = sun.shadow.camera;
    sc.left = -9;
    sc.right = 9;
    sc.top = 9;
    sc.bottom = -9;
    sun.shadow.bias = -0.0005;
    scene.add(sun, sun.target);

    const disposables: { dispose: () => void }[] = [];
    const keep = <T extends { dispose: () => void }>(x: T) => (disposables.push(x), x);

    // ground
    const ground = new THREE.Mesh(keep(new THREE.CircleGeometry(20, 48)), keep(new THREE.MeshLambertMaterial({ color: 0xe4dccb })));
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(CENTER.x, -0.06, CENTER.z);
    ground.receiveShadow = true;
    scene.add(ground);

    // floors
    for (const r of rooms) {
      const g = keep(new THREE.ExtrudeGeometry(shapeFrom(r.poly), { depth: 0.05, bevelEnabled: false }));
      g.rotateX(Math.PI / 2);
      const mesh = new THREE.Mesh(g, keep(new THREE.MeshStandardMaterial({ color: FLOOR_COLOR[r.floor], roughness: 0.85 })));
      mesh.position.y = 0;
      mesh.receiveShadow = true;
      mesh.userData.room = r.id;
      scene.add(mesh);
    }
    // ExtrudeGeometry rotated +90° about X maps shape y → +z and extrudes downwards: top face at y = 0.

    // fixtures
    for (const f of fixtures) {
      const g = keep(new THREE.ExtrudeGeometry(shapeFrom(f.poly), { depth: f.height, bevelEnabled: false }));
      g.rotateX(Math.PI / 2);
      g.translate(0, f.height, 0);
      const mesh = new THREE.Mesh(g, keep(new THREE.MeshStandardMaterial({ color: f.id === 'kitchen-counter' ? 0xd8d2c6 : 0xffffff, roughness: 0.5 })));
      mesh.castShadow = mesh.receiveShadow = true;
      scene.add(mesh);
    }

    // architecture (walls, glass, parapets) — rebuilt when cutaway / assumed toggles change
    const arch = new THREE.Group();
    scene.add(arch);
    const colliders: Collider[] = [];
    const wallMat = keep(new THREE.MeshStandardMaterial({ color: WALL_COLOR, roughness: 0.9 }));
    const assumedMat = keep(new THREE.MeshStandardMaterial({ color: ASSUMED_COLOR, roughness: 0.8 }));
    const glassMat = keep(new THREE.MeshPhysicalMaterial({ color: 0xbfd8e2, transparent: true, opacity: 0.32, roughness: 0.05 }));
    const glassAssumed = keep(new THREE.MeshPhysicalMaterial({ color: ASSUMED_COLOR, transparent: true, opacity: 0.35 }));
    const ceilingMat = keep(new THREE.MeshBasicMaterial({ color: ASSUMED_COLOR, transparent: true, opacity: 0.12, side: THREE.DoubleSide, depthWrite: false }));
    const archGeos: THREE.BufferGeometry[] = [];

    const box = (w: Wall, from: number, to: number, y0: number, y1: number, mat: THREE.Material, thick = w.t) => {
      if (y1 - y0 <= 0.001 || to - from <= 0.01) return;
      const len = Math.hypot(w.b[0] - w.a[0], w.b[1] - w.a[1]);
      const ux = (w.b[0] - w.a[0]) / len;
      const uy = (w.b[1] - w.a[1]) / len;
      const mid = (from + to) / 2;
      const g = new THREE.BoxGeometry(m(to - from), y1 - y0, m(thick));
      archGeos.push(g);
      const mesh = new THREE.Mesh(g, mat);
      mesh.position.set(m(w.a[0] + ux * mid), (y0 + y1) / 2, m(w.a[1] + uy * mid));
      mesh.rotation.y = -Math.atan2(uy, ux);
      mesh.castShadow = mesh.receiveShadow = true;
      arch.add(mesh);
    };

    const buildArch = (cut: boolean, showA: boolean) => {
      arch.clear();
      archGeos.splice(0).forEach((g) => g.dispose());
      colliders.length = 0;
      const H = cut ? 1.2 : ASSUMED.ceiling;
      const top = (y: number) => Math.min(y, H);
      const aMat = showA ? assumedMat : wallMat;
      const gMat = showA ? glassAssumed : glassMat;
      for (const w of walls) {
        const { parts } = wallSegments(w);
        const len = Math.hypot(w.b[0] - w.a[0], w.b[1] - w.a[1]);
        const pt = (d: number) => new THREE.Vector2(m(w.a[0] + ((w.b[0] - w.a[0]) * d) / len), m(w.a[1] + ((w.b[1] - w.a[1]) * d) / len));
        for (const p of parts) {
          const o = p.opening;
          if (w.kind === 'parapet') {
            box(w, p.from, p.to, 0, top(ASSUMED.parapet), showA ? assumedMat : wallMat);
          } else if (w.kind === 'screen') {
            box(w, p.from, p.to, 0, top(ASSUMED.screen), gMat, 2);
          } else if (!o) {
            box(w, p.from, p.to, 0, H, wallMat);
          } else if (o.kind === 'door') {
            box(w, p.from, p.to, top(ASSUMED.doorHead), H, aMat);
            continue; // passable
          } else if (o.kind === 'window') {
            box(w, p.from, p.to, 0, top(ASSUMED.windowSill), aMat);
            box(w, p.from, p.to, ASSUMED.windowSill, top(ASSUMED.windowHead), gMat, 2);
            box(w, p.from, p.to, top(ASSUMED.windowHead), H, aMat);
          } else {
            box(w, p.from, p.to, 0, top(ASSUMED.glazedHead), gMat, 2);
            box(w, p.from, p.to, top(ASSUMED.glazedHead), H, aMat);
          }
          colliders.push({ a: pt(p.from), b: pt(p.to), r: m(w.t) / 2 });
        }
      }
      if (showA && !cut) {
        const g = new THREE.PlaneGeometry(m(440), m(390));
        archGeos.push(g);
        const ceiling = new THREE.Mesh(g, ceilingMat);
        ceiling.rotation.x = -Math.PI / 2;
        ceiling.position.set(m(272), ASSUMED.ceiling, m(210));
        arch.add(ceiling);
      }
    };

    // furniture
    const furn = new THREE.Group();
    scene.add(furn);
    const furnGeos: THREE.BufferGeometry[] = [];
    const furnMats: THREE.Material[] = [];
    const buildFurniture = (list: Placed[]) => {
      furn.clear();
      furnGeos.splice(0).forEach((g) => g.dispose());
      furnMats.splice(0).forEach((x) => x.dispose());
      for (const it of list) {
        const c = catalogByKind[it.kind];
        const mat = new THREE.MeshStandardMaterial({ color: c.color, roughness: 0.8 });
        furnMats.push(mat);
        const g = c.round ? new THREE.CylinderGeometry(it.w / 2, it.w / 2, c.h, 28) : new THREE.BoxGeometry(it.w, c.h, it.d);
        if (c.round) g.scale(1, 1, it.d / it.w);
        furnGeos.push(g);
        const group = new THREE.Group();
        const body = new THREE.Mesh(g, mat);
        body.position.y = c.h / 2;
        body.castShadow = body.receiveShadow = true;
        group.add(body);
        if (it.kind.startsWith('sofa') || it.kind === 'armchair') {
          const back = new THREE.BoxGeometry(it.w, 0.4, 0.2);
          furnGeos.push(back);
          const bm = new THREE.Mesh(back, mat);
          bm.position.set(0, c.h + 0.1, -it.d / 2 + 0.1);
          bm.castShadow = true;
          body.scale.y = 0.55;
          body.position.y = (c.h * 0.55) / 2;
          bm.position.y = c.h * 0.55 + 0.2;
          group.add(bm);
        }
        if (it.kind.startsWith('bed')) {
          const pm = new THREE.MeshStandardMaterial({ color: 0xffffff });
          furnMats.push(pm);
          const pg = new THREE.BoxGeometry(it.w - 0.12, 0.12, 0.35);
          furnGeos.push(pg);
          const pillow = new THREE.Mesh(pg, pm);
          pillow.position.set(0, c.h + 0.06, -it.d / 2 + 0.25);
          group.add(pillow);
        }
        group.position.set(it.x, 0, it.y);
        group.rotation.y = (-it.rot * Math.PI) / 180;
        furn.add(group);
      }
    };

    // room labels
    const labels = new THREE.Group();
    scene.add(labels);
    const setLabels = (names: Record<RoomId, string>) => {
      labels.children.forEach((s) => {
        const sp = s as THREE.Sprite;
        sp.material.map?.dispose();
        sp.material.dispose();
      });
      labels.clear();
      for (const r of rooms) {
        if (!r.no || !names[r.id]) continue;
        const [cx, cy] = centroid(r.poly);
        const s = makeLabel(names[r.id]);
        s.position.set(m(cx), 2.0, m(cy));
        labels.add(s);
      }
    };

    // camera modes
    let mode: CameraMode = 'orbit';
    let yaw = Math.PI; // facing +z (down the corridor from the entrance)
    let pitch = 0;
    const walkPos = new THREE.Vector3(m(88), EYE, m(50));
    const setMode = (next: CameraMode) => {
      mode = next;
      controls.enabled = next !== 'walk';
      labels.visible = next !== 'walk';
      if (next === 'orbit') {
        controls.minPolarAngle = 0.05;
        controls.maxPolarAngle = Math.PI * 0.48;
        controls.enableRotate = true;
        controls.target.copy(CENTER);
        camera.position.set(CENTER.x - 2.5, 12.5, CENTER.z + 8.5);
      } else if (next === 'top') {
        controls.minPolarAngle = 0;
        controls.maxPolarAngle = 0;
        controls.enableRotate = false;
        controls.target.copy(CENTER);
        camera.position.set(CENTER.x, 15, CENTER.z + 0.001);
      } else {
        camera.position.copy(walkPos);
        yaw = Math.PI;
        pitch = 0;
      }
      controls.update();
    };

    const focus = (r: RoomId | null) => {
      if (!r) return;
      const room = rooms.find((x) => x.id === r)!;
      const [cx, cy] = centroid(room.poly);
      if (mode === 'walk') {
        walkPos.set(m(cx), EYE, m(cy));
      } else {
        controls.target.set(m(cx), 0.6, m(cy));
        if (mode === 'orbit') camera.position.set(m(cx) - 3.2, 5.5, m(cy) + 4.2);
        else camera.position.set(m(cx), 9, m(cy) + 0.001);
        controls.update();
      }
    };

    // walk input
    const keys = new Set<string>();
    const onKeyDown = (e: KeyboardEvent) => {
      if (mode !== 'walk') return;
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(e.key.toLowerCase())) {
        e.preventDefault();
        keys.add(e.key.toLowerCase());
      }
    };
    const onKeyUp = (e: KeyboardEvent) => keys.delete(e.key.toLowerCase());
    el.addEventListener('keydown', onKeyDown);
    el.addEventListener('keyup', onKeyUp);
    el.addEventListener('blur', () => keys.clear());
    let look: { x: number; y: number } | null = null;
    const onDown = (e: PointerEvent) => {
      if (mode === 'walk') {
        look = { x: e.clientX, y: e.clientY };
        renderer.domElement.setPointerCapture(e.pointerId);
      }
      el.focus({ preventScroll: true });
    };
    const onMove = (e: PointerEvent) => {
      if (mode !== 'walk' || !look) return;
      yaw -= (e.clientX - look.x) * 0.005;
      pitch = Math.max(-1.2, Math.min(1.2, pitch - (e.clientY - look.y) * 0.004));
      look = { x: e.clientX, y: e.clientY };
    };
    const onUp = () => (look = null);
    renderer.domElement.addEventListener('pointerdown', onDown);
    renderer.domElement.addEventListener('pointermove', onMove);
    renderer.domElement.addEventListener('pointerup', onUp);

    const collide = (p: THREE.Vector2) => {
      const R = 0.22;
      for (let k = 0; k < 3; k++) {
        for (const c of colliders) {
          const ab = c.b.clone().sub(c.a);
          const t = Math.max(0, Math.min(1, p.clone().sub(c.a).dot(ab) / ab.lengthSq()));
          const q = c.a.clone().add(ab.multiplyScalar(t));
          const d = p.distanceTo(q);
          const min = R + c.r;
          if (d < min && d > 1e-6) p.add(p.clone().sub(q).multiplyScalar((min - d) / d));
        }
      }
      return p;
    };

    const resize = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    const clock = new THREE.Clock();
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(clock.getDelta(), 0.05);
      if (mode === 'walk') {
        const k = (n: string) => (keys.has(n) ? 1 : 0);
        const fwd = k('w') + k('arrowup') - k('s') - k('arrowdown') + walkInput.current.fwd;
        const turn = k('a') + k('arrowleft') - k('d') - k('arrowright') + walkInput.current.turn;
        yaw += turn * dt * 1.8;
        if (fwd) {
          const p = new THREE.Vector2(walkPos.x - Math.sin(yaw) * fwd * dt * 1.4, walkPos.z - Math.cos(yaw) * fwd * dt * 1.4);
          collide(p);
          walkPos.x = p.x;
          walkPos.z = p.y;
        }
        camera.position.copy(walkPos);
        camera.rotation.set(pitch, yaw, 0, 'YXZ');
      } else {
        controls.update();
      }
      renderer.render(scene, camera);
    };

    const L = latest.current;
    buildArch(L.cutaway, L.showAssumed);
    buildFurniture(L.items);
    setLabels(L.roomLabels);
    setMode(L.mode);
    focus(L.focusRoom);
    tick();

    api.current = { setItems: buildFurniture, setMode, setArch: buildArch, focus, setLabels };

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      el.removeEventListener('keydown', onKeyDown);
      el.removeEventListener('keyup', onKeyUp);
      controls.dispose();
      setLabels({} as Record<RoomId, string>);
      archGeos.forEach((g) => g.dispose());
      furnGeos.forEach((g) => g.dispose());
      furnMats.forEach((x) => x.dispose());
      disposables.forEach((d) => d.dispose());
      scene.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (mesh.isMesh && mesh.geometry) mesh.geometry.dispose();
      });
      renderer.dispose();
      renderer.domElement.remove();
      api.current = null;
    };
    // Built once; prop changes are pushed through `api` below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    api.current?.setItems(items);
  }, [items]);
  useEffect(() => {
    api.current?.setMode(mode);
  }, [mode]);
  useEffect(() => {
    api.current?.setArch(cutaway, showAssumed);
  }, [cutaway, showAssumed]);
  useEffect(() => {
    api.current?.focus(focusRoom);
  }, [focusRoom]);
  useEffect(() => {
    api.current?.setLabels(roomLabels);
  }, [roomLabels]);

  return <div ref={host} className="stage-3d" tabIndex={0} />;
}
