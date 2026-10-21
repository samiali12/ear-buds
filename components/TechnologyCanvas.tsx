"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { TECH3D, TECH_PARTS } from "@/lib/tech3d";
import { useThemeTokens } from "@/lib/theme";
import Earbud from "./Earbud";

interface TechnologyCanvasProps {
  /** Index into TECH_PARTS */
  activeIndex: number;
  /** Whether the section is on screen — the scene idles when it is not */
  visible: boolean;
}

const CANVAS_LABEL =
  "Three-dimensional view of the Aurum Buds Pro earbud, showing the part behind each feature.";

function Scene({ activeIndex, visible }: TechnologyCanvasProps) {
  const activePart = TECH_PARTS[activeIndex] ?? TECH_PARTS[0];
  const theme = useThemeTokens();

  if (!theme) return null;

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[3, 4, 5]}
        intensity={2.4}
        color={theme.ivory}
      />
      <directionalLight
        position={[-4, 1.5, -3]}
        intensity={1.6}
        color={theme.gold}
      />
      <pointLight
        position={[0, -2, 2]}
        intensity={12}
        distance={8}
        color={theme.gold}
      />

      <Suspense fallback={null}>
        <Earbud activePart={activePart} visible={visible} />
      </Suspense>
    </>
  );
}

export default function TechnologyCanvas({
  activeIndex,
  visible,
}: TechnologyCanvasProps) {
  return (
    <Canvas
      dpr={[1, 2]}
      frameloop="demand"
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      }}
      camera={{
        position: [0, 0, TECH3D.cameraZ],
        fov: TECH3D.fov,
      }}
      onCreated={({ gl }) => {
        // The canvas itself carries the description for assistive technology.
        gl.domElement.setAttribute("role", "img");
        gl.domElement.setAttribute("aria-label", CANVAS_LABEL);
      }}
    >
      <Scene activeIndex={activeIndex} visible={visible} />
    </Canvas>
  );
}
