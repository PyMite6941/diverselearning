"use client";

import { Suspense, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Html,
  Float,
  ContactShadows,
  Environment,
  Edges,
} from "@react-three/drei";
import * as THREE from "three";
import type { ModelPart, ModelSpec } from "@/lib/types";

const DEG = Math.PI / 180;

function PartGeometry({ shape }: { shape: ModelPart["shape"] }) {
  switch (shape) {
    case "sphere":
      return <sphereGeometry args={[0.5, 48, 48]} />;
    case "cylinder":
      return <cylinderGeometry args={[0.5, 0.5, 1, 64]} />;
    case "cone":
      return <coneGeometry args={[0.5, 1, 64]} />;
    case "torus":
      return <torusGeometry args={[0.5, 0.18, 32, 96]} />;
    case "capsule":
      return <capsuleGeometry args={[0.35, 0.6, 16, 32]} />;
    case "tetrahedron":
      return <tetrahedronGeometry args={[0.6]} />;
    case "octahedron":
      return <octahedronGeometry args={[0.6]} />;
    case "ring":
      return <ringGeometry args={[0.3, 0.5, 48]} />;
    case "plane":
      return <planeGeometry args={[1, 1]} />;
    case "torusKnot":
      return <torusKnotGeometry args={[0.4, 0.13, 128, 24]} />;
    default:
      return <boxGeometry args={[1, 1, 1]} />;
  }
}

function finishProps(finish: ModelPart["finish"]) {
  switch (finish) {
    case "metal":
      return { roughness: 0.22, metalness: 0.9 };
    case "glass":
      return { roughness: 0.08, metalness: 0.1, baseOpacity: 0.16, shell: true };
    case "glow":
      return { roughness: 0.4, metalness: 0.1, extraEmissive: 0.5 };
    default:
      return { roughness: 0.55, metalness: 0.08 };
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
  const scale = part.scale ?? [1, 1, 1];
  const rotation = (part.rotation ?? [0, 0, 0]).map((d) => d * DEG) as [
    number,
    number,
    number
  ];
  const fin = finishProps(part.finish);
  const baseOpacity = part.opacity ?? fin.baseOpacity ?? 0.92;
  const isShell = !!fin.shell || baseOpacity < 0.35;

  // Smoothly animate toward the exploded / collapsed target each frame.
  const target = useMemo(() => {
    const [bx, by, bz] = part.position;
    if (!exploded) return new THREE.Vector3(bx, by, bz);
    return new THREE.Vector3(
      bx + dir[0] * spread,
      by + dir[1] * spread,
      bz + dir[2] * spread
    );
  }, [exploded, spread, dir, part.position]);

  useFrame(() => {
    const g = group.current;
    if (!g) return;
    g.position.lerp(target, 0.16);
  });

  const opacity = dim
    ? Math.min(baseOpacity, 0.12)
    : active
    ? Math.max(baseOpacity, 0.96)
    : hover
    ? Math.min(1, baseOpacity + 0.08)
    : baseOpacity;

  const transparent = opacity < 1;
  const doubleSided =
    isShell || part.shape === "plane" || part.shape === "ring";

  return (
    <group ref={group} position={part.position} rotation={rotation}>
      <mesh
        scale={scale as [number, number, number]}
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
          roughness={fin.roughness}
          metalness={fin.metalness}
          transparent={transparent}
          opacity={opacity}
          // Don't write depth for translucent shells so inner parts always
          // show through cleanly (fixes the muddy stacked-sphere look).
          depthWrite={!transparent}
          side={doubleSided ? THREE.DoubleSide : THREE.FrontSide}
          emissive={part.color}
          emissiveIntensity={
            (active ? 0.5 : hover ? 0.28 : isShell ? 0.12 : 0.06) +
            (fin.extraEmissive ?? 0)
          }
        />
        {/* Crisp edge outline gives each solid part a clear, diagram-like
            silhouette. Skipped for smooth shells (no hard edges anyway). */}
        {!isShell && (
          <Edges threshold={18}>
            <lineBasicMaterial
              color="white"
              transparent
              opacity={dim ? 0.06 : active ? 0.45 : 0.22}
            />
          </Edges>
        )}
      </mesh>

      {/* Membrane lattice: a faint wireframe over spherical shells so they read
          as a containing membrane rather than a frosted ball. */}
      {isShell && part.shape === "sphere" && (
        <mesh scale={scale as [number, number, number]} raycast={() => null}>
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

/** Even, deterministic directions on a sphere — used to fan out parts that sit
 *  at (or near) the model's center so nested shells separate cleanly. */
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

  // Normalize every model so it's centered at the origin and scaled to a
  // consistent size — the AI picks arbitrary coordinates, so this is what makes
  // each model well-framed and readable instead of off-center or tiny/huge.
  const { center, fit, dirs } = useMemo(() => {
    const c = new THREE.Vector3();
    model.parts.forEach((p) =>
      c.add(new THREE.Vector3(p.position[0], p.position[1], p.position[2]))
    );
    c.divideScalar(model.parts.length || 1);

    let radius = 0.5;
    model.parts.forEach((p) => {
      const pos = new THREE.Vector3(p.position[0], p.position[1], p.position[2]);
      const partR = 0.6 * Math.max(...(p.scale ?? [1, 1, 1]));
      radius = Math.max(radius, pos.distanceTo(c) + partR);
    });
    const TARGET = 2.1;
    const fitScale = Math.min(5, Math.max(0.25, TARGET / radius));

    const ds = model.parts.map((p, i) => {
      const pos = new THREE.Vector3(p.position[0], p.position[1], p.position[2]);
      let d = pos.clone().sub(c);
      if (d.length() < 0.4) d = fibDir(i, model.parts.length);
      d.normalize();
      return [d.x, d.y, d.z] as [number, number, number];
    });

    return { center: c, fit: fitScale, dirs: ds };
  }, [model.parts]);

  return (
    <div className="relative h-full w-full">
      <Canvas
        camera={{ position: [4.5, 3, 6], fov: 45 }}
        onPointerMissed={() => setSelected(null)}
        dpr={[1, 2]}
      >
        <color attach="background" args={["#070710"]} />
        <ambientLight intensity={0.65} />
        <directionalLight position={[5, 6, 4]} intensity={1.15} />
        <pointLight position={[-4, -2, -3]} intensity={0.7} color={accent} />
        <Suspense fallback={null}>
          <Float
            speed={exploded ? 0 : 1.3}
            rotationIntensity={exploded ? 0 : 0.22}
            floatIntensity={exploded ? 0 : 0.35}
          >
            {/* recenter + uniform-fit so every model is framed the same way */}
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
          </Float>
          <ContactShadows
            position={[0, -2.4, 0]}
            opacity={0.38}
            scale={14}
            blur={2.6}
            far={4}
          />
          <Environment preset="city" />
        </Suspense>
        <OrbitControls
          enablePan={false}
          minDistance={3}
          maxDistance={16}
          autoRotate={!active && !exploded}
          autoRotateSpeed={0.55}
        />
      </Canvas>

      {/* caption */}
      <div className="pointer-events-none absolute left-4 top-4 z-10 max-w-[48%] rounded-xl bg-black/60 px-3 py-2 text-xs leading-snug text-white/85 shadow-lg ring-1 ring-white/10 backdrop-blur">
        {model.caption}
      </div>

      {/* break-apart controls */}
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

      {/* part breakdown panel */}
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
