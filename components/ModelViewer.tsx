"use client";

import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Edges } from "@react-three/drei";
import * as THREE from "three";
import type { ModelPart, ModelSpec } from "@/lib/types";

const DEG = Math.PI / 180;

/** Coerce a possibly-dirty AI value (string, undefined, NaN) to a finite
 *  number, falling back to `d`. */
function num(v: unknown, d = 0): number {
  const f = typeof v === "number" ? v : parseFloat(v as string);
  return Number.isFinite(f) ? f : d;
}
function vec3(a: unknown, d: [number, number, number] = [0, 0, 0]): [number, number, number] {
  const arr = Array.isArray(a) ? a : [];
  return [num(arr[0], d[0]), num(arr[1], d[1]), num(arr[2], d[2])];
}
function isFiniteVec(v: THREE.Vector3): boolean {
  return Number.isFinite(v.x) && Number.isFinite(v.y) && Number.isFinite(v.z);
}

function PartGeometry({ shape }: { shape: ModelPart["shape"] }) {
  switch (shape) {
    case "sphere":
      return <sphereGeometry args={[0.5, 32, 32]} />;
    case "cylinder":
      return <cylinderGeometry args={[0.5, 0.5, 1, 40]} />;
    case "cone":
      return <coneGeometry args={[0.5, 1, 40]} />;
    case "torus":
      return <torusGeometry args={[0.5, 0.18, 20, 64]} />;
    case "capsule":
      return <capsuleGeometry args={[0.35, 0.6, 12, 24]} />;
    case "tetrahedron":
      return <tetrahedronGeometry args={[0.6]} />;
    case "octahedron":
      return <octahedronGeometry args={[0.6]} />;
    case "ring":
      return <ringGeometry args={[0.3, 0.5, 48]} />;
    case "plane":
      return <planeGeometry args={[1, 1]} />;
    case "torusKnot":
      return <torusKnotGeometry args={[0.4, 0.13, 96, 16]} />;
    default:
      return <boxGeometry args={[1, 1, 1]} />;
  }
}

function Part({
  part,
  active,
  dim,
  exploded,
  spread,
  dir,
  showLabel,
  onSelect,
}: {
  part: ModelPart;
  active: boolean;
  dim: boolean;
  exploded: boolean;
  spread: number;
  dir: [number, number, number];
  showLabel: boolean;
  onSelect: (id: string) => void;
}) {
  const group = useRef<THREE.Group>(null);
  const [hover, setHover] = useState(false);
  const scale = vec3(part.scale, [1, 1, 1]);
  const basePos = vec3(part.position);
  const rotation = vec3(part.rotation).map((d) => d * DEG) as [
    number,
    number,
    number
  ];

  const opacity = num(part.opacity, 1);
  const transparent = opacity < 1;

  const target = useMemo(() => {
    const [bx, by, bz] = basePos;
    if (!exploded) return new THREE.Vector3(bx, by, bz);
    return new THREE.Vector3(
      bx + dir[0] * spread,
      by + dir[1] * spread,
      bz + dir[2] * spread
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exploded, spread, dir, basePos[0], basePos[1], basePos[2]]);

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    g.position.lerp(target, Math.min(1, delta * 8));
  });

  return (
    <group ref={group} position={basePos} rotation={rotation}>
      <mesh
        scale={scale}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(part.id);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHover(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHover(false);
          document.body.style.cursor = "default";
        }}
      >
        <PartGeometry shape={part.shape} />
        <meshStandardMaterial
          color={part.color}
          transparent={transparent}
          opacity={opacity}
          depthWrite={!transparent}
          side={opacity < 1 ? THREE.DoubleSide : THREE.FrontSide}
        />
        {opacity >= 0.95 && (
          <Edges threshold={18}>
            <lineBasicMaterial
              color="white"
              transparent
              opacity={dim ? 0.06 : active ? 0.45 : hover ? 0.35 : 0.22}
            />
          </Edges>
        )}
      </mesh>

      {opacity < 0.35 && part.shape === "sphere" && (
        <mesh scale={scale} raycast={() => null}>
          <sphereGeometry args={[0.5, 22, 22]} />
          <meshBasicMaterial
            wireframe
            transparent
            opacity={dim ? 0.04 : 0.1}
            color={part.color}
            depthWrite={false}
          />
        </mesh>
      )}

      {(hover || active || showLabel) && !dim && (
        <Html
          distanceFactor={9}
          position={[0, 0.5 * (scale[1] ?? 1) + 0.28, 0]}
          center
          zIndexRange={[18, 2]}
          style={{ pointerEvents: "none" }}
        >
          <div
            className={`pointer-events-none whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold shadow-[0_2px_10px_rgba(0,0,0,0.6)] ring-1 ${
              active
                ? "bg-white text-black ring-black/10"
                : "bg-black/85 text-white ring-white/20"
            }`}
          >
            {part.label}
          </div>
        </Html>
      )}
    </group>
  );
}

function fibDir(i: number, n: number): THREE.Vector3 {
  const phi = Math.acos(1 - (2 * (i + 0.5)) / n);
  const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);
  return new THREE.Vector3(
    Math.sin(phi) * Math.cos(theta),
    Math.cos(phi),
    Math.sin(phi) * Math.sin(theta)
  );
}

export default function ModelViewer({
  model,
  accent = "#7c5cff",
}: {
  model: ModelSpec;
  accent?: string;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [exploded, setExploded] = useState(false);
  const [spread, setSpread] = useState(2.4);
  const active = model.parts.find((p) => p.id === selected) ?? null;

  const { center, fit, dirs } = useMemo(() => {
    // AI data can be dirty (strings, missing values, NaN). Coerce every number
    // so a single bad value can't turn `fit` into NaN and hide the whole model
    // (that was the "black canvas" bug — the sample cell has clean data).
    const posOf = (p: ModelPart) => {
      const a = p.position ?? [0, 0, 0];
      return new THREE.Vector3(num(a[0]), num(a[1]), num(a[2]));
    };
    const c = new THREE.Vector3();
    model.parts.forEach((p) => c.add(posOf(p)));
    c.divideScalar(model.parts.length || 1);
    if (!isFiniteVec(c)) c.set(0, 0, 0);

    let radius = 0.5;
    model.parts.forEach((p) => {
      const s = p.scale ?? [1, 1, 1];
      const partR = 0.6 * Math.max(num(s[0], 1), num(s[1], 1), num(s[2], 1));
      radius = Math.max(radius, posOf(p).distanceTo(c) + partR);
    });
    const TARGET = 2.1;
    let fitScale = TARGET / radius;
    if (!Number.isFinite(fitScale) || fitScale <= 0) fitScale = 1;
    fitScale = Math.min(5, Math.max(0.25, fitScale));

    const ds = model.parts.map((p, i) => {
      let d = posOf(p).clone().sub(c);
      if (d.length() < 0.4) d = fibDir(i, model.parts.length);
      d.normalize();
      return [d.x, d.y, d.z] as [number, number, number];
    });

    return { center: c, fit: fitScale, dirs: ds };
  }, [model.parts]);

  // The AI picks a viewing DIRECTION, but the model is normalized to a fixed
  // size — so use only the direction and a constant distance that always frames
  // it. This fixes AI models rendering as a black canvas (camera mis-placed).
  const camPos = useMemo<[number, number, number]>(() => {
    const def = new THREE.Vector3(4.5, 3, 6);
    let v = def;
    const cp = model.cameraPosition;
    if (Array.isArray(cp) && cp.length >= 3) {
      const cand = new THREE.Vector3(num(cp[0]), num(cp[1]), num(cp[2]));
      if (isFiniteVec(cand) && cand.length() > 0.01) v = cand;
    }
    const framed = v.clone().normalize().multiplyScalar(7.5);
    return [framed.x, framed.y, framed.z];
  }, [model.cameraPosition]);

  return (
    <div className="relative h-full w-full">
      <Canvas
        camera={{ position: camPos, fov: 45 }}
        onPointerMissed={() => setSelected(null)}
        dpr={[1, 1.5]}
        gl={{ antialias: true }}
      >
        <color attach="background" args={["#070710"]} />
        <ambientLight intensity={0.7} />
        <hemisphereLight args={["#cdd6ff", "#0a0a16", 0.7]} />
        <directionalLight position={[5, 6, 4]} intensity={1.2} />
        <directionalLight position={[-3, 2, -4]} intensity={0.4} />
        <pointLight position={[-4, -2, -3]} intensity={0.7} color={accent} />
        <group
          scale={fit}
          position={[-fit * center.x, -fit * center.y, -fit * center.z]}
        >
          {model.parts.map((p, i) => (
            <Part
              key={p.id}
              part={p}
              active={active?.id === p.id}
              dim={!!active && active.id !== p.id}
              exploded={exploded}
              spread={spread}
              dir={dirs[i]}
              showLabel={exploded && !active}
              onSelect={(id) => setSelected((cur) => (cur === id ? null : id))}
            />
          ))}
        </group>
        <OrbitControls
          enablePan={false}
          minDistance={3}
          maxDistance={16}
          autoRotate={!active && !exploded}
          autoRotateSpeed={0.55}
        />
      </Canvas>

      <div className="pointer-events-none absolute left-4 top-4 z-10 max-w-[48%] rounded-xl bg-black/60 px-3 py-2 text-xs leading-snug text-white/85 shadow-lg ring-1 ring-white/10 backdrop-blur">
        {model.caption}
      </div>

      <div className="absolute right-4 top-4 z-10 flex flex-col items-end gap-2">
        <button
          onClick={() => {
            setExploded((e) => !e);
            setSelected(null);
          }}
          className={`rounded-xl px-3 py-1.5 text-xs font-semibold shadow-lg ring-1 transition ${
            exploded
              ? "bg-white text-black ring-white/20"
              : "bg-black/60 text-white ring-white/15 hover:bg-black/80"
          }`}
        >
          {exploded ? "Collapse" : "⤢ Break apart"}
        </button>
        {exploded && (
          <div className="flex items-center gap-2 rounded-xl bg-black/60 px-3 py-1.5 text-[11px] text-white/70 ring-1 ring-white/15">
            <span>Spread</span>
            <input
              type="range"
              min={1}
              max={4}
              step={0.1}
              value={spread}
              onChange={(e) => setSpread(parseFloat(e.target.value))}
              className="h-1 w-24 cursor-pointer accent-white"
            />
          </div>
        )}
      </div>

      <div className="pointer-events-none absolute bottom-4 left-4 right-4 z-20 flex justify-center">
        {active ? (
          <div className="glass-strong pointer-events-auto max-w-lg rounded-2xl px-5 py-4 shadow-2xl ring-1 ring-white/10 transition-all">
            <div className="mb-1 flex items-center gap-2">
              <span
                className="inline-block h-3 w-3 flex-none rounded-full ring-1 ring-white/30"
                style={{ background: active.color }}
              />
              <h4 className="text-sm font-semibold text-white">{active.label}</h4>
            </div>
            <p className="text-sm leading-relaxed text-white/80">
              {active.explanation}
            </p>
          </div>
        ) : (
          <div className="pointer-events-none rounded-full bg-black/60 px-4 py-1.5 text-xs text-white/70 shadow-lg ring-1 ring-white/10 backdrop-blur">
            {exploded
              ? "Click any separated part to read what it does"
              : "Drag to rotate · click a part · or Break apart to see every piece"}
          </div>
        )}
      </div>
    </div>
  );
}
