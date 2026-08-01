"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

const _pulseScale = new THREE.Vector3();

/** Idle motion inferred from what a part is *called*, so a model comes across
 *  as a working mechanism (train wheels turning, a heart pulsing) instead of
 *  a static prop, even though the AI never specifies joints or animation. */
type Motion = "spin" | "oscillate" | "pulse" | null;

function classifyMotion(label: string): Motion {
  const l = label.toLowerCase();
  if (/\b(wheel|gear|cog|fan|propeller|rotor|blade|turbine|dial|disc|disk|reel)\b/.test(l)) {
    return "spin";
  }
  if (/\b(piston|arm|lever|leg|pendulum|hand|wing|flap|hinge|door|hatch|paddle|oar)\b/.test(l)) {
    return "oscillate";
  }
  if (/\b(heart|core|reactor|engine|light|bulb|led|eye|nucleus|battery|beacon|signal)\b/.test(l)) {
    return "pulse";
  }
  return null;
}

function Part({
  part,
  index,
  active,
  dim,
  linked,
  exploded,
  spread,
  dir,
  showLabel,
  onSelect,
  onHoverChange,
}: {
  part: ModelPart;
  index: number;
  active: boolean;
  dim: boolean;
  linked: boolean;
  exploded: boolean;
  spread: number;
  dir: [number, number, number];
  showLabel: boolean;
  onSelect: (id: string) => void;
  onHoverChange: (id: string | null) => void;
}) {
  const group = useRef<THREE.Group>(null);
  const pulse = useRef<THREE.Group>(null);
  const mesh = useRef<THREE.Mesh>(null);
  const [hover, setHover] = useState(false);
  const motion = useMemo(() => classifyMotion(part.label ?? ""), [part.label]);
  // Stable per-part variation so identical parts (e.g. two wheels) don't move
  // in lockstep.
  const seed = ((index * 37) % 7) / 7;
  const spinAxis = part.shape === "torus" || part.shape === "ring" ? "z" : "y";
  // Clamp extreme aspect ratios so a part the AI made razor-thin (e.g. a flat
  // membrane) still reads as a visible shape instead of an invisible sliver.
  const scale = ((): [number, number, number] => {
    const s = vec3(part.scale, [1, 1, 1]);
    const maxS = Math.max(Math.abs(s[0]), Math.abs(s[1]), Math.abs(s[2])) || 1;
    const floor = maxS / 5; // cap aspect ratio at ~5:1
    return s.map((v) =>
      Math.sign(v || 1) * Math.max(Math.abs(v), floor)
    ) as [number, number, number];
  })();
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

  useFrame((state, delta) => {
    const g = group.current;
    if (g) g.position.lerp(target, Math.min(1, delta * 8));

    const p = pulse.current;
    if (p) {
      let s = hover || active ? 1.08 : linked ? 1.035 : 1;
      if (motion === "pulse") s *= 1 + Math.sin(state.clock.elapsedTime * 2.4 + seed * 6) * 0.05;
      _pulseScale.set(s, s, s);
      p.scale.lerp(_pulseScale, Math.min(1, delta * 10));
    }

    const m = mesh.current;
    if (m && motion === "spin") {
      const speed = 1.1 + seed * 0.8;
      m.rotation[spinAxis] += delta * speed;
    } else if (m && motion === "oscillate") {
      m.rotation.z = Math.sin(state.clock.elapsedTime * 1.6 + seed * 6) * 0.3;
    }
  });

  return (
    <group ref={group} position={basePos} rotation={rotation}>
      <group ref={pulse}>
        <mesh
          ref={mesh}
          scale={scale}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(part.id);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHover(true);
            onHoverChange(part.id);
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            setHover(false);
            onHoverChange(null);
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
                opacity={dim ? 0.06 : active ? 0.45 : hover ? 0.35 : linked ? 0.3 : 0.22}
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
      </group>

      {(hover || active || showLabel) && !dim && (
        <Html
          distanceFactor={9}
          // Stagger labels into vertical bands (by part index) so, when every
          // label shows in exploded view, they don't stack on top of each other.
          position={[
            0,
            0.5 * (scale[1] ?? 1) + 0.28 + (exploded ? (index % 4) * 0.45 : 0),
            0,
          ]}
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
  const [hovered, setHovered] = useState<string | null>(null);
  const [exploded, setExploded] = useState(false);
  const [spread, setSpread] = useState(3.2);
  const [userTouched, setUserTouched] = useState(false);
  const [showKeys, setShowKeys] = useState(false);
  // Announced to screen readers when the selection changes. The 3D canvas is
  // opaque to assistive tech, so the part's label + explanation is mirrored
  // into a live region as plain text.
  const [announcement, setAnnouncement] = useState("");
  const controlsRef = useRef<any>(null);
  const active = model.parts.find((p) => p.id === selected) ?? null;
  const focusId = selected ?? hovered;

  const { center, fit, dirs, neighbors } = useMemo(() => {
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

    // Nearest other part, so hovering/selecting one can visibly "link" to
    // its closest neighbor (e.g. an axle lighting up next to its wheel).
    const positions = model.parts.map(posOf);
    const ns = model.parts.map((_, i) => {
      let best = -1;
      let bestDist = Infinity;
      positions.forEach((pos, j) => {
        if (j === i) return;
        const d = pos.distanceTo(positions[i]);
        if (d < bestDist) {
          bestDist = d;
          best = j;
        }
      });
      return best;
    });

    return { center: c, fit: fitScale, dirs: ds, neighbors: ns };
  }, [model.parts]);

  const focusIndex = focusId ? model.parts.findIndex((p) => p.id === focusId) : -1;
  const linkedIndex = focusIndex >= 0 ? neighbors[focusIndex] : -1;

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

  // --- Keyboard access -----------------------------------------------------
  // The viewer was pointer-only: every part could be reached by mouse or touch
  // and by nothing else. These handlers make the whole model operable from the
  // keyboard, which also gives switch-device users a route in.

  const step = useCallback(
    (delta: number) => {
      const n = model.parts.length;
      if (!n) return;
      setUserTouched(true);
      setSelected((cur) => {
        const i = cur ? model.parts.findIndex((p) => p.id === cur) : -1;
        const next = i < 0 ? (delta > 0 ? 0 : n - 1) : (i + delta + n) % n;
        return model.parts[next].id;
      });
    },
    [model.parts]
  );

  const orbit = useCallback((dAzimuth: number, dPolar: number) => {
    const c = controlsRef.current;
    if (!c) return;
    setUserTouched(true);
    c.setAzimuthalAngle(c.getAzimuthalAngle() + dAzimuth);
    // Stop short of the poles, where the camera flips over.
    c.setPolarAngle(
      Math.min(Math.PI - 0.06, Math.max(0.06, c.getPolarAngle() + dPolar))
    );
    c.update();
  }, []);

  const zoom = useCallback((factor: number) => {
    const c = controlsRef.current;
    if (!c) return;
    setUserTouched(true);
    const cam = c.object as THREE.Camera;
    const offset = cam.position.clone().sub(c.target);
    const len = Math.min(16, Math.max(3, offset.length() * factor));
    cam.position.copy(c.target).add(offset.normalize().multiplyScalar(len));
    c.update();
  }, []);

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    // Let the browser keep Tab for moving focus out of the viewer.
    if (e.key === "Tab") return;

    const shift = e.shiftKey;
    const ORBIT = 0.22;
    let handled = true;

    switch (e.key) {
      case "ArrowRight":
        shift ? orbit(ORBIT, 0) : step(1);
        break;
      case "ArrowLeft":
        shift ? orbit(-ORBIT, 0) : step(-1);
        break;
      case "ArrowUp":
        shift ? orbit(0, -ORBIT) : step(-1);
        break;
      case "ArrowDown":
        shift ? orbit(0, ORBIT) : step(1);
        break;
      case "Enter":
      case " ":
        if (selected) {
          // Re-announce the current part, so a screen-reader user can repeat
          // the explanation without moving the selection.
          setAnnouncement("");
          const p = model.parts.find((x) => x.id === selected);
          if (p) window.setTimeout(() => setAnnouncement(`${p.label}. ${p.explanation}`), 40);
        } else {
          step(1);
        }
        break;
      case "Escape":
        setSelected(null);
        setAnnouncement("Selection cleared.");
        break;
      case "b":
      case "B":
        setExploded((v) => {
          setAnnouncement(v ? "Model collapsed." : "Model broken apart into its parts.");
          return !v;
        });
        setSelected(null);
        break;
      case "+":
      case "=":
        if (exploded) setSpread((s) => Math.min(6, s + 0.4));
        break;
      case "-":
      case "_":
        if (exploded) setSpread((s) => Math.max(1, s - 0.4));
        break;
      case "z":
      case "Z":
        zoom(0.85);
        break;
      case "x":
      case "X":
        zoom(1.18);
        break;
      case "?":
      case "/":
        setShowKeys((v) => !v);
        break;
      default:
        handled = false;
    }

    // Arrows and space scroll the page by default; the viewer owns them here.
    if (handled) e.preventDefault();
  }

  // Mirror the selected part into the live region for screen readers.
  useEffect(() => {
    if (active) setAnnouncement(`${active.label}. ${active.explanation}`);
  }, [active?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const KEYS: [string, string][] = [
    ["← →", "Previous / next part"],
    ["Enter", "Read the selected part again"],
    ["Esc", "Clear the selection"],
    ["B", "Break apart / collapse"],
    ["+ −", "Spread the parts further / closer"],
    ["Shift + arrows", "Rotate the model"],
    ["Z / X", "Zoom in / out"],
    ["?", "Show or hide this list"],
  ];

  return (
    <div
      role="application"
      tabIndex={0}
      onKeyDown={onKeyDown}
      aria-label={`Interactive 3D model: ${model.caption}. ${model.parts.length} parts. Use the left and right arrow keys to move between parts, and press question mark for all controls.`}
      className="relative h-full w-full outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-inset"
    >
      {/* Screen-reader mirror of the 3D canvas, which is otherwise opaque. */}
      <p className="sr-only" aria-live="polite" role="status">
        {announcement}
      </p>

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
              index={i}
              active={active?.id === p.id}
              dim={!!active && active.id !== p.id}
              linked={i === linkedIndex}
              exploded={exploded}
              spread={spread}
              dir={dirs[i]}
              showLabel={exploded && !active}
              onSelect={(id) => setSelected((cur) => (cur === id ? null : id))}
              onHoverChange={setHovered}
            />
          ))}
        </group>
        <OrbitControls
          ref={controlsRef}
          enablePan={false}
          minDistance={3}
          maxDistance={16}
          autoRotate={!userTouched && !active && !exploded}
          autoRotateSpeed={0.55}
          onStart={() => setUserTouched(true)}
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
            <label htmlFor="spread-range">Spread</label>
            <input
              id="spread-range"
              type="range"
              min={1}
              max={6}
              step={0.1}
              value={spread}
              onChange={(e) => setSpread(parseFloat(e.target.value))}
              className="h-1 w-24 cursor-pointer accent-white"
            />
          </div>
        )}

        <button
          onClick={() => setShowKeys((v) => !v)}
          aria-expanded={showKeys}
          className="rounded-xl bg-black/60 px-3 py-1.5 text-xs font-medium text-white/70 ring-1 ring-white/15 transition hover:bg-black/80 hover:text-white"
        >
          ⌨ Keyboard
        </button>

        {showKeys && (
          <div className="w-60 rounded-xl bg-black/85 p-3 text-[11px] text-white/80 shadow-xl ring-1 ring-white/15 backdrop-blur">
            <p className="mb-2 font-semibold text-white">
              Everything here works without a mouse
            </p>
            <dl className="space-y-1.5">
              {KEYS.map(([k, what]) => (
                <div key={k} className="flex items-baseline gap-2">
                  <dt className="flex-none rounded bg-white/15 px-1.5 py-0.5 font-mono text-[10px] text-white">
                    {k}
                  </dt>
                  <dd className="flex-1 leading-snug text-white/70">{what}</dd>
                </div>
              ))}
            </dl>
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
              ? "Click a separated part — or use ← → to step through them"
              : "Drag to rotate · click a part · press B to break it apart"}
          </div>
        )}
      </div>
    </div>
  );
}
