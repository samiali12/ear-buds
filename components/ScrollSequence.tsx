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
  FRAME_PRODUCT_BOTTOM,
  FRAME_PRODUCT_LEFT,
  FRAME_PRODUCT_RIGHT,
  FRAME_PRODUCT_TOP,
  MOBILE_BREAKPOINT,
  STAGE_BAND_DESKTOP,
  STAGE_BAND_MOBILE,
  STAGE_BIAS_DESKTOP,
  STAGE_BIAS_MOBILE,
  STAGE_MARGIN_DESKTOP,
  STAGE_MARGIN_MOBILE,
  STAGE_TOP_DESKTOP,
  STAGE_TOP_MOBILE,
} from "@/lib/config";
import StoryBeats from "./StoryBeats";

interface ScrollSequenceProps {
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

  // Pointer position, for a very small parallax on desktop only
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

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
  const lightScale = useTransform(smoothProgress, [0, 0.55, 1], [0.92, 1.06, 1]);

  // A whisper of parallax — never on a touch device.
  const stageX = useTransform(mouseX, [-0.5, 0.5], [-6, 6]);
  const stageY = useTransform(mouseY, [-0.5, 0.5], [-4, 4]);

  // Check mobile and load frames
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Mouse move handler for parallax — desktop pointers only
  useEffect(() => {
    if (prefersReducedMotion || isMobile) return;

    const finePointer = window.matchMedia("(pointer: fine)");
    if (!finePointer.matches) return;

    const handleMouseMove = (event: MouseEvent) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 2;
      const y = (event.clientY / window.innerHeight - 0.5) * 2;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [prefersReducedMotion, isMobile, mouseX, mouseY]);

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

  /**
   * The area of the stage the product may occupy: below the navigation bar
   * and above the strip reserved for type. The product is never cropped and
   * never touches either.
   */
  const getStageRect = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const band = isMobile ? STAGE_BAND_MOBILE : STAGE_BAND_DESKTOP;
    const top = isMobile ? STAGE_TOP_MOBILE : STAGE_TOP_DESKTOP;
    const stageHeight = rect.height * (1 - band) - top;

    return { rect, stageHeight, top };
  }, [isMobile]);

  // Draw frame
  const drawFrame = useCallback(
    (frameIndex: number) => {
      const canvas = canvasRef.current;
      const frame = framesRef.current[frameIndex];
      if (!canvas || !frame) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const stage = getStageRect();
      if (!stage) return;

      const { rect, stageHeight, top } = stage;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Clear with the surface token rather than a literal colour
      const surface = getComputedStyle(document.documentElement)
        .getPropertyValue("--bg")
        .trim();
      ctx.fillStyle = surface;
      ctx.fillRect(0, 0, rect.width, rect.height);
      // The frames are drawn as large as the stage allows, so the product
      // fills the space between the navigation bar and the type band. Only
      // the empty margins of a frame are ever cropped, never the earbuds.
      const frameAspect = frame.width / frame.height;
      const productRatio = FRAME_PRODUCT_BOTTOM - FRAME_PRODUCT_TOP;
      const productWidth = FRAME_PRODUCT_RIGHT - FRAME_PRODUCT_LEFT;
      const bias = isMobile ? STAGE_BIAS_MOBILE : STAGE_BIAS_DESKTOP;
      const margin = isMobile ? STAGE_MARGIN_MOBILE : STAGE_MARGIN_DESKTOP;

      const fitWidth = (rect.width - margin * 2) / productWidth;
      const fitHeight = (stageHeight / productRatio) * frameAspect;
      const frameWidth = Math.min(fitWidth, fitHeight);
      const frameHeight = frameWidth / frameAspect;

      const productHeight = frameHeight * productRatio;
      const offsetX = (rect.width - frameWidth) / 2;
      const offsetY =
        top +
        (stageHeight - productHeight) * bias -
        FRAME_PRODUCT_TOP * frameHeight;

      ctx.drawImage(frame, offsetX, offsetY, frameWidth, frameHeight);
    },
    [getStageRect, isMobile]
  );

  // Handle resize and orientation change
  useEffect(() => {
    const handleResize = () => {
      if (currentFrameRef.current >= 0) {
        drawFrame(currentFrameRef.current);
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
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
        className="relative flex min-h-[100dvh] items-center justify-center px-[8vw]"
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
      style={{ height: "var(--sequence-height)" }}
    >
      {/* The stage: product and effects only. No type lives in here. */}
      <div
        className="sticky top-0 left-0 right-0 h-[100dvh] overflow-hidden"
        style={{ background: "var(--bg)" }}
      >
        <div className="absolute inset-0" aria-hidden="true">
          <motion.div
            className="absolute inset-0"
            style={{ x: stageX, y: stageY }}
          >
            {/* Product */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 h-full w-full"
            />

            {/* A single warm light, barely there */}
              <motion.div
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "radial-gradient(ellipse 50% 38% at 50% 40%, var(--warm-core) 0%, transparent 70%)",
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
                    "radial-gradient(ellipse 74% 62% at 50% 40%, transparent 40%, var(--bg) 100%)",
                }}
              />

            {/* Edge scrims — the stage the type sits on */}
            <div
              className="pointer-events-none absolute inset-y-0 left-0 w-[34%]"
              style={{
                background:
                  "linear-gradient(to right, var(--bg-scrim) 0%, var(--bg-scrim-soft) 22%, transparent 100%)",
              }}
            />
            <div
              className="pointer-events-none absolute inset-y-0 right-0 w-[34%]"
              style={{
                background:
                  "linear-gradient(to left, var(--bg-scrim) 0%, var(--bg-scrim-soft) 22%, transparent 100%)",
              }}
            />
          </motion.div>
        </div>

        {/*
          The type. A sibling of the stage, not a child of anything that is
          transformed, so every glyph is rasterised on whole pixels.
        */}
        <StoryBeats progress={smoothProgress} ready={ready} />
      </div>
    </section>
  );
}
