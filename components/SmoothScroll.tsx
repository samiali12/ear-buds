"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { LENIS_LERP } from "@/lib/config";
import { setLenis } from "@/lib/lenis";

/**
 * Smooth scroll.
 *
 * Lenis drives the real window scroll position, so Framer Motion's useScroll
 * keeps reporting an accurate progress value and the canvas mapping stays
 * correct — the sequence simply arrives with more inertia.
 */
export default function SmoothScroll() {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      lerp: LENIS_LERP,
      smoothWheel: true,
      wheelMultiplier: 0.85,
      touchMultiplier: 1.6,
      autoRaf: false,
      anchors: false,
    });

    setLenis(lenis);

    let frame = requestAnimationFrame(function raf(time: number) {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    });

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  return null;
}
