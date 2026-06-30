"use client";

import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Html, Float, ContactShadows, Environment } from "@react-three/drei";
import type { ModelPart, ModelSpec } from "@/lib/types";

const DEG = Math.PI / 180;

function PartGeometry({ shape }: { shape: ModelPart["shape"] }) {
  switch (shape) {
    case "sphere":
      return <sphereGeometry args={[0.5, 64, 64]} />;
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
      return { roughness: 0.05, metalness: 0.1, baseOpacity: 0.22 };
    case "glow":
      return { roughness: 0.4, metalness: 0.1, extraEmissive: 0.5 };
    default: // matte
      return { roughness: 0.6, metalness: 0.08 };
  }
}

function Part({
  part,
  active,
  dim,
  onSelect,
}: {
  part: ModelPart;
  active: boolean;
  dim: boolean;
  onSelect: (id: string) => void;
}) {
  const [hover, setHover] = useState(false);
  const scale = part.scale ?? [1, 1, 1];
  const rotation = (part.rotation ?? [0, 0, 0]).map((d) => d * DEG) as [
    number,
    number,
    number
  ];
  const fin = finishProps(part.finish);
  const baseOpacity = part.opacity ?? fin.baseOpacity ?? 0.92;

  const opacity = dim
    ? Math.min(baseOpacity, 0.14)
    : active
    ? Math.max(baseOpacity, 0.96)
    : hover
    ? Math.min(1, baseOpacity + 0.08)
    : baseOpacity;

  return (
    <group position={part.position} rotation={rotation}>
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
          transparent={opacity < 1}
          opacity={opacity}
          emissive={part.color}
          emissiveIntensity={
            (active ? 0.45 : hover ? 0.25 : 0.06) + (fin.extraEmissive ?? 0)
          }
          side={part.shape === "plane" || part.shape === "ring" ? 2 : 0}
        />
      </mesh>
      {(hover || active) && (
        <Html distanceFactor={9} position={[0, 0.5 * (scale[1] ?? 1) + 0.3, 0]} center>
          <div className="pointer-events-none whitespace-nowrap rounded-full bg-black/80 px-3 py-1 text-xs font-medium text-white shadow-lg ring-1 ring-white/10">
            {part.label}
          </div>
        </Html>
      )}
    </group>
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
  const active = model.parts.find((p) => p.id === selected) ?? null;

  return (
    <div className="relative h-full w-full">
      <Canvas
        camera={{ position: [4, 3, 5], fov: 45 }}
        onPointerMissed={() => setSelected(null)}
        dpr={[1, 2]}
      >
        <color attach="background" args={["#070710"]} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 6, 4]} intensity={1.1} />
        <pointLight position={[-4, -2, -3]} intensity={0.6} color={accent} />
        <Suspense fallback={null}>
          <Float speed={1.4} rotationIntensity={0.25} floatIntensity={0.4}>
            <group>
              {model.parts.map((p) => (
                <Part
                  key={p.id}
                  part={p}
                  active={active?.id === p.id}
                  dim={!!active && active.id !== p.id}
                  onSelect={(id) => setSelected((cur) => (cur === id ? null : id))}
                />
              ))}
            </group>
          </Float>
          <ContactShadows
            position={[0, -2.2, 0]}
            opacity={0.4}
            scale={12}
            blur={2.6}
            far={4}
          />
          <Environment preset="city" />
        </Suspense>
        <OrbitControls
          enablePan={false}
          minDistance={3}
          maxDistance={12}
          autoRotate={!active}
          autoRotateSpeed={0.6}
        />
      </Canvas>

      {/* caption */}
      <div className="pointer-events-none absolute left-4 top-4 max-w-[60%] rounded-xl bg-black/40 px-3 py-2 text-xs text-white/70 backdrop-blur">
        {model.caption}
      </div>

      {/* part breakdown panel */}
      <div className="pointer-events-none absolute bottom-4 left-4 right-4 flex justify-center">
        {active ? (
          <div className="glass-strong pointer-events-auto max-w-lg rounded-2xl px-5 py-4 transition-all">
            <div className="mb-1 flex items-center gap-2">
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ background: active.color }}
              />
              <h4 className="text-sm font-semibold">{active.label}</h4>
            </div>
            <p className="text-sm leading-relaxed text-white/75">
              {active.explanation}
            </p>
          </div>
        ) : (
          <div className="pointer-events-none rounded-full bg-black/40 px-4 py-1.5 text-xs text-white/50 backdrop-blur">
            Drag to rotate · click a part to break it down
          </div>
        )}
      </div>
    </div>
  );
}
