"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Center, Bounds, Html } from "@react-three/drei";

/** Loads a glTF/GLB through our CORS-safe proxy and auto-frames it. */
function Model({ url }: { url: string }) {
  const proxied = `/api/model-proxy?url=${encodeURIComponent(url)}`;
  const { scene } = useGLTF(proxied);
  return <primitive object={scene} />;
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
        {/* Plain lights instead of Stage's HDR environment (no CDN download). */}
        <ambientLight intensity={0.8} />
        <hemisphereLight args={["#cdd6ff", "#0a0a16", 0.7]} />
        <directionalLight position={[5, 6, 4]} intensity={1.2} />
        <directionalLight position={[-3, 2, -4]} intensity={0.5} />
        <pointLight position={[-4, -2, -3]} intensity={0.6} color={accent} />
        <Suspense
          fallback={
            <Html center>
              <span className="whitespace-nowrap text-xs text-white/50">
                Loading model…
              </span>
            </Html>
          }
        >
          <Bounds fit clip observe margin={1.2}>
            <Center>
              <Model url={url} />
            </Center>
          </Bounds>
        </Suspense>
        <OrbitControls makeDefault enablePan={false} autoRotate autoRotateSpeed={0.6} />
      </Canvas>
    </div>
  );
}
