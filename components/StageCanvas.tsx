"use client";

import dynamic from "next/dynamic";
import type { PartSpec } from "@/lib/tech3d";

/**
 * The canvas is WebGL, so it never runs on the server. The placeholder keeps
 * the stage the same size so nothing jumps when it arrives.
 */
const EarbudCanvas = dynamic(() => import("./EarbudCanvas"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full" style={{ background: "var(--bg)" }} />
  ),
});

interface StageCanvasProps {
  part: PartSpec;
  visible: boolean;
  label: string;
}

export default function StageCanvas({ part, visible, label }: StageCanvasProps) {
  return <EarbudCanvas part={part} visible={visible} label={label} />;
}
