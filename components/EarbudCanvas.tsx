"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { TECH3D, type PartSpec } from "@/lib/tech3d";
import { useThemeTokens } from "@/lib/theme";
import Earbud from "./Earbud";

interface EarbudCanvasProps {
  /** The part being presented */
  part: PartSpec;
  /** Whether the section is on screen — the scene idles when it is not */
  visible: boolean;
  /** Description of the model for assistive technology */
  label: string;
}

function Scene({ part, visible }: Omit<EarbudCanvasProps, "label">) {
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
        <Earbud activePart={part} visible={visible} />
      </Suspense>
    </>
  );
}

export default function EarbudCanvas({
  part,
  visible,
  label,
}: EarbudCanvasProps) {
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
        gl.domElement.setAttribute("aria-label", label);
      }}
    >
      <Scene part={part} visible={visible} />
    </Canvas>
  );
}
