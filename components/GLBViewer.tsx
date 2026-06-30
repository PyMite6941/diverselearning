"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Stage,
  useGLTF,
  Center,
  Bounds,
  Html,
} from "@react-three/drei";

/** Loads a glTF/GLB through our CORS-safe proxy and auto-frames it. */
function Model({ url }: { url: string }) {
  const proxied = `/api/model-proxy?url=${encodeURIComponent(url)}`;
  const { scene } = useGLTF(proxied);
  return (
    <Center>
      <primitive object={scene} />
    </Center>
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
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 2]}>
        <color attach="background" args={["#070710"]} />
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
            <Stage
              intensity={0.5}
              environment="city"
              adjustCamera={false}
              shadows={{ type: "contact", opacity: 0.35, blur: 3 }}
            >
              <Model url={url} />
            </Stage>
          </Bounds>
        </Suspense>
        <pointLight position={[-4, -2, -3]} intensity={0.6} color={accent} />
        <OrbitControls makeDefault enablePan={false} autoRotate autoRotateSpeed={0.6} />
      </Canvas>
    </div>
  );
}
