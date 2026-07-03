"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Html } from "@react-three/drei";
import * as THREE from "three";

function Model({ url }: { url: string }) {
  const proxied = `/api/model-proxy?url=${encodeURIComponent(url)}`;
  const { scene } = useGLTF(proxied);
  const ref = useRef<THREE.Group>(null);
  const framed = useRef(false);

  useFrame(() => {
    if (framed.current || !ref.current) return;
    const box = new THREE.Box3().setFromObject(ref.current);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim === 0 || !isFinite(maxDim)) { framed.current = true; return; }
    const scale = 3 / maxDim;
    ref.current.scale.setScalar(scale);
    const center = box.getCenter(new THREE.Vector3());
    ref.current.position.copy(center.clone().multiplyScalar(-scale));
    framed.current = true;
  });

  return (
    <group ref={ref}>
      <primitive object={scene} />
    </group>
  );
}

function Scene({ url }: { url: string }) {
  return (
    <Suspense
      fallback={
        <Html center>
          <span className="whitespace-nowrap text-xs text-white/50">
            Loading model...
          </span>
        </Html>
      }
    >
      <Model url={url} />
    </Suspense>
  );
}

export default function GLBViewer({
  url,
  accent = "#7c5cff",
}: {
  url: string;
  accent?: string;
}) {
  return (
    <div className="relative h-full w-full">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 1.5]}>
        <color attach="background" args={["#070710"]} />
        <ambientLight intensity={0.8} />
        <hemisphereLight args={["#cdd6ff", "#0a0a16", 0.7]} />
        <directionalLight position={[5, 6, 4]} intensity={1.2} />
        <directionalLight position={[-3, 2, -4]} intensity={0.5} />
        <pointLight position={[-4, -2, -3]} intensity={0.6} color={accent} />
        <Scene url={url} />
        <OrbitControls makeDefault enablePan={false} autoRotate autoRotateSpeed={0.6} />
      </Canvas>
    </div>
  );
}
