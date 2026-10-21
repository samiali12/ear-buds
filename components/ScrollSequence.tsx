"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  FRAME_COUNT,
  FRAME_DAMPING,
  FRAME_PATH,
  FRAME_PATH_MOBILE,
  MOBILE_BREAKPOINT,
  SCROLL_HEIGHT_MULTIPLIER,
} from "@/lib/config";
import StoryBeats from "./StoryBeats";

interface ScrollSequenceProps {
  /** The hero reveals itself once the loader has handed over. */
  ready?: boolean;
}

export default function ScrollSequence({ ready = false }: ScrollSequenceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [framesLoaded, setFramesLoaded] = useState(false);
  const framesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef<number>(-1);
  const rafRef = useRef<number | null>(null);

  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  /** Progress after the heavy, liquid damping is applied. */
  const smoothProgress = useMotionValue(0);

  // A single, very faint warm light that breathes as the sequence runs.
  const lightOpacity = useTransform(
    smoothProgress,
    [0, 0.32, 0.58, 0.82, 1],
    [0.05, 0.12, 0.1, 0.07, 0.05]
  );
  const lightScale = useTransform(smoothProgress, [0, 0.55, 1], [0.9, 1.08, 1]);

  // Check mobile and load frames
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Load frames
  useEffect(() => {
    if (prefersReducedMotion) return;

    const framePath = isMobile ? FRAME_PATH_MOBILE : FRAME_PATH;
    const frames: HTMLImageElement[] = [];

    const loadFrame = (index: number): Promise<void> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = `${framePath}${String(index + 1).padStart(3, "0")}.webp`;
        img.onload = () => {
          frames[index] = img;
          resolve();
        };
        img.onerror = () => resolve();
      });
    };

    Promise.all(
      Array.from({ length: FRAME_COUNT }, (_, i) => loadFrame(i))
    ).then(() => {
      framesRef.current = frames;
      setFramesLoaded(true);
    });
  }, [isMobile, prefersReducedMotion]);

  // Draw frame
  const drawFrame = useCallback((frameIndex: number) => {
    const canvas = canvasRef.current;
    const frame = framesRef.current[frameIndex];
    if (!canvas || !frame) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Clear with the surface token rather than a literal colour
    const surface = getComputedStyle(document.documentElement)
      .getPropertyValue("--bg")
      .trim();
    ctx.fillStyle = surface;
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Contain scaling
    const canvasAspect = rect.width / rect.height;
    const frameAspect = frame.width / frame.height;

    let drawWidth: number;
    let drawHeight: number;
    let offsetX = 0;
    let offsetY = 0;

    if (frameAspect > canvasAspect) {
      drawWidth = rect.width;
      drawHeight = rect.width / frameAspect;
      offsetY = (rect.height - drawHeight) / 2;
    } else {
      drawHeight = rect.height;
      drawWidth = rect.height * frameAspect;
      offsetX = (rect.width - drawWidth) / 2;
    }

    ctx.drawImage(frame, offsetX, offsetY, drawWidth, drawHeight);
  }, []);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (currentFrameRef.current >= 0) {
        drawFrame(currentFrameRef.current);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [drawFrame]);

  // Render loop — the frame index is eased by hand so scrubbing feels weighty
  useEffect(() => {
    if (prefersReducedMotion) return;

    let last = performance.now();

    const update = (now: number) => {
      const delta = Math.min((now - last) / 16.667, 4);
      last = now;

      const target = scrollYProgress.get();
      const current = smoothProgress.get();
      const alpha = 1 - Math.pow(1 - FRAME_DAMPING, delta);
      const next = current + (target - current) * alpha;

      if (Math.abs(next - current) > 0.00001) {
        smoothProgress.set(next);
      }

      const frameIndex = Math.min(
        Math.round(next * (FRAME_COUNT - 1)),
        FRAME_COUNT - 1
      );

      if (frameIndex !== currentFrameRef.current) {
        currentFrameRef.current = frameIndex;
        drawFrame(frameIndex);
      }

      rafRef.current = requestAnimationFrame(update);
    };

    rafRef.current = requestAnimationFrame(update);
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [scrollYProgress, smoothProgress, drawFrame, prefersReducedMotion]);

  // Initial draw
  useEffect(() => {
    if (!prefersReducedMotion && framesLoaded) {
      drawFrame(0);
    }
  }, [drawFrame, framesLoaded, prefersReducedMotion]);

  if (prefersReducedMotion) {
    return (
      <section
        id="overview"
        className="relative flex min-h-screen items-center justify-center px-[8vw]"
        style={{ background: "var(--bg)" }}
      >
        <div className="text-center">
          <h1 className="headline">Aurum Buds Pro</h1>
          <p
            className="mt-6 font-serif text-xl italic md:text-2xl"
            style={{ color: "var(--text-muted)" }}
          >
            Sound, in gold.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={containerRef}
      id="overview"
      className="relative"
      style={{ height: `${SCROLL_HEIGHT_MULTIPLIER}vh` }}
    >
      {/* Sticky canvas container */}
      <div
        className="sticky top-0 left-0 right-0 h-screen overflow-hidden"
        style={{ background: "var(--bg)" }}
      >
        {/* Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
        />

        {/* A single warm light, barely there */}
        <motion.div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 52% 42% at 50% 50%, var(--warm-core) 0%, transparent 70%)",
            opacity: lightOpacity,
            scale: lightScale,
            mixBlendMode: "screen",
          }}
        />

        {/* Soft vignette so the canvas edges disappear */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 78% 72% at 50% 50%, transparent 42%, var(--bg) 100%)",
          }}
        />

        {/* Edge scrims — the stage the type sits on */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-[42%]"
          style={{
            background:
              "linear-gradient(to right, var(--bg-scrim) 0%, var(--bg-scrim-soft) 18%, transparent 100%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-[42%]"
          style={{
            background:
              "linear-gradient(to left, var(--bg-scrim) 0%, var(--bg-scrim-soft) 18%, transparent 100%)",
          }}
        />

        {/* Story beats overlay */}
        <StoryBeats progress={smoothProgress} ready={ready} />
      </div>
    </section>
  );
}
