"use client";

import { useCallback, useEffect, useRef, useState, useMemo } from "react";
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
import {
  CAMERA_PERSPECTIVE,
  CAMERA_SCALE_START,
  CAMERA_SCALE_PEAK,
  CAMERA_SCALE_END,
  CAMERA_ROTATE_Y_START,
  CAMERA_ROTATE_Y_END,
  CAMERA_ROTATE_X_START,
  CAMERA_ROTATE_X_END,
  CAMERA_TRANSLATE_Y_DRIFT,
  CAMERA_PEAK_PROGRESS,
  PARALLAX_MAX_OFFSET,
  PARALLAX_FAR_GLOW,
  PARALLAX_CANVAS,
  PARALLAX_FLOOR_REFLECTION,
  PARALLAX_TEXT_BLOCKS,
  PARALLAX_FOREGROUND_PARTICLES,
  SHADOW_OPACITY_ASSEMBLED,
  SHADOW_OPACITY_EXPLODED,
  REFLECTION_OPACITY,
  REFLECTION_BLUR,
  REFLECTION_OFFSET_Y,
  LIGHT_SWEEP_FIRST_START,
  LIGHT_SWEEP_FIRST_END,
  LIGHT_SWEEP_SECOND_START,
  LIGHT_SWEEP_SECOND_END,
  LIGHT_SWEEP_OPACITY,
  BOKEH_COUNT,
  BOKEH_MIN_SIZE,
  BOKEH_MAX_SIZE,
  BOKEH_MIN_BLUR,
  BOKEH_MAX_BLUR,
  BOKEH_MIN_OPACITY,
  BOKEH_MAX_OPACITY,
  BOKEH_PARALLAX_MULTIPLIER,
  VIGNETTE_BLUR_INTENSITY,
} from "@/lib/motion";
import StoryBeats from "./StoryBeats";
import Turntable from "./Turntable";

interface ScrollSequenceProps {
  ready?: boolean;
}

export default function ScrollSequence({ ready = false }: ScrollSequenceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reflectionCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [framesLoaded, setFramesLoaded] = useState(false);
  const framesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef<number>(-1);
  const rafRef = useRef<number | null>(null);

  // Mouse position for parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  /** Progress after the heavy, liquid damping is applied. */
  const smoothProgress = useMotionValue(0);

  // =====================
  // VIRTUAL CAMERA
  // =====================

  // Scale: 1.0 -> 1.12 at peak (0.5), then back to 1.0
  const cameraScale = useTransform(
    smoothProgress,
    [0, CAMERA_PEAK_PROGRESS, 1],
    [CAMERA_SCALE_START, CAMERA_SCALE_PEAK, CAMERA_SCALE_END]
  );

  // Rotate Y: -4deg -> +4deg across sequence
  const cameraRotateY = useTransform(
    smoothProgress,
    [0, 1],
    [CAMERA_ROTATE_Y_START, CAMERA_ROTATE_Y_END]
  );

  // Rotate X: 2deg -> -2deg
  const cameraRotateX = useTransform(
    smoothProgress,
    [0, 1],
    [CAMERA_ROTATE_X_START, CAMERA_ROTATE_X_END]
  );

  // Translate Y drift: max 24px
  const cameraTranslateY = useTransform(
    smoothProgress,
    [0, 0.25, 0.5, 0.75, 1],
    [0, 12, CAMERA_TRANSLATE_Y_DRIFT, 12, 0]
  );

  // =====================
  // LAYERED PARALLAX
  // =====================

  // Far glow layer (0.3x)
  const farGlowX = useTransform(
    mouseX,
    [-0.5, 0.5],
    [PARALLAX_MAX_OFFSET * PARALLAX_FAR_GLOW, -PARALLAX_MAX_OFFSET * PARALLAX_FAR_GLOW]
  );
  const farGlowY = useTransform(
    mouseY,
    [-0.5, 0.5],
    [PARALLAX_MAX_OFFSET * PARALLAX_FAR_GLOW, -PARALLAX_MAX_OFFSET * PARALLAX_FAR_GLOW]
  );

  // Canvas layer (1x) - handled by virtual camera
  const canvasX = useTransform(
    mouseX,
    [-0.5, 0.5],
    [PARALLAX_MAX_OFFSET * PARALLAX_CANVAS, -PARALLAX_MAX_OFFSET * PARALLAX_CANVAS]
  );
  const canvasY = useTransform(
    mouseY,
    [-0.5, 0.5],
    [PARALLAX_MAX_OFFSET * PARALLAX_CANVAS, -PARALLAX_MAX_OFFSET * PARALLAX_CANVAS]
  );

  // Floor reflection (1.2x)
  const reflectionX = useTransform(
    mouseX,
    [-0.5, 0.5],
    [PARALLAX_MAX_OFFSET * PARALLAX_FLOOR_REFLECTION, -PARALLAX_MAX_OFFSET * PARALLAX_FLOOR_REFLECTION]
  );
  const reflectionY = useTransform(
    mouseY,
    [-0.5, 0.5],
    [PARALLAX_MAX_OFFSET * PARALLAX_FLOOR_REFLECTION, -PARALLAX_MAX_OFFSET * PARALLAX_FLOOR_REFLECTION]
  );

  // Foreground particles (2x)
  const foregroundX = useTransform(
    mouseX,
    [-0.5, 0.5],
    [-PARALLAX_MAX_OFFSET * PARALLAX_FOREGROUND_PARTICLES, PARALLAX_MAX_OFFSET * PARALLAX_FOREGROUND_PARTICLES]
  );
  const foregroundY = useTransform(
    mouseY,
    [-0.5, 0.5],
    [-PARALLAX_MAX_OFFSET * PARALLAX_FOREGROUND_PARTICLES, PARALLAX_MAX_OFFSET * PARALLAX_FOREGROUND_PARTICLES]
  );

  // Text blocks (0.5x, opposite direction)
  const textX = useTransform(
    mouseX,
    [-0.5, 0.5],
    [-PARALLAX_MAX_OFFSET * PARALLAX_TEXT_BLOCKS, PARALLAX_MAX_OFFSET * PARALLAX_TEXT_BLOCKS]
  );

  // =====================
  // GROUNDING
  // =====================

  // Shadow opacity: stronger when assembled, weaker at exploded peak
  const shadowOpacity = useTransform(
    smoothProgress,
    [0, CAMERA_PEAK_PROGRESS, 1],
    [SHADOW_OPACITY_ASSEMBLED, SHADOW_OPACITY_EXPLODED, SHADOW_OPACITY_ASSEMBLED]
  );

  // =====================
  // LIGHT SWEEP
  // =====================

  // First sweep: 0.15 - 0.30
  const lightSweepOpacity1 = useTransform(
    smoothProgress,
    [
      LIGHT_SWEEP_FIRST_START - 0.02,
      LIGHT_SWEEP_FIRST_START,
      (LIGHT_SWEEP_FIRST_START + LIGHT_SWEEP_FIRST_END) / 2,
      LIGHT_SWEEP_FIRST_END,
      LIGHT_SWEEP_FIRST_END + 0.02,
    ],
    [0, LIGHT_SWEEP_OPACITY, LIGHT_SWEEP_OPACITY * 1.5, 0, 0]
  );

  const lightSweepX1 = useTransform(
    smoothProgress,
    [LIGHT_SWEEP_FIRST_START, LIGHT_SWEEP_FIRST_END],
    ["-20%", "120%"]
  );

  // Second sweep: 0.88 - 0.98
  const lightSweepOpacity2 = useTransform(
    smoothProgress,
    [
      LIGHT_SWEEP_SECOND_START - 0.02,
      LIGHT_SWEEP_SECOND_START,
      (LIGHT_SWEEP_SECOND_START + LIGHT_SWEEP_SECOND_END) / 2,
      LIGHT_SWEEP_SECOND_END,
      LIGHT_SWEEP_SECOND_END + 0.02,
    ],
    [0, LIGHT_SWEEP_OPACITY, LIGHT_SWEEP_OPACITY * 1.5, 0, 0]
  );

  const lightSweepX2 = useTransform(
    smoothProgress,
    [LIGHT_SWEEP_SECOND_START, LIGHT_SWEEP_SECOND_END],
    ["-20%", "120%"]
  );

  // =====================
  // DEPTH OF FIELD - BOKEH
  // =====================

  // Deterministic per-index noise. Randomness during render would be
  // evaluated at build time and would not match the client. Values are
  // rounded so the server and the client serialise them identically.
  const bokehElements = useMemo(() => {
    if (prefersReducedMotion) return [];

    const noise = (index: number, salt: number) => {
      const value = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
      return value - Math.floor(value);
    };

    const round = (value: number) => Math.round(value * 10000) / 10000;

    return Array.from({ length: BOKEH_COUNT }, (_, i) => ({
      id: i,
      size: round(
        BOKEH_MIN_SIZE + noise(i, 1) * (BOKEH_MAX_SIZE - BOKEH_MIN_SIZE)
      ),
      blur: round(
        BOKEH_MIN_BLUR + noise(i, 2) * (BOKEH_MAX_BLUR - BOKEH_MIN_BLUR)
      ),
      opacity: round(
        BOKEH_MIN_OPACITY +
          noise(i, 3) * (BOKEH_MAX_OPACITY - BOKEH_MIN_OPACITY)
      ),
      x: round(noise(i, 4) * 100),
      y: round(noise(i, 5) * 100),
      delay: round(noise(i, 6) * 2),
    }));
  }, [prefersReducedMotion]);

  // Vignette blur at exploded peak
  const vignetteBlur = useTransform(
    smoothProgress,
    [CAMERA_PEAK_PROGRESS - 0.1, CAMERA_PEAK_PROGRESS, CAMERA_PEAK_PROGRESS + 0.1],
    [0, VIGNETTE_BLUR_INTENSITY, 0]
  );

  // A single, very faint warm light that breathes as the sequence runs.
  const lightOpacity = useTransform(
    smoothProgress,
    [0, 0.32, 0.58, 0.82, 1],
    [0.05, 0.12, 0.1, 0.07, 0.05]
  );
  const lightScale = useTransform(smoothProgress, [0, 0.55, 1], [0.9, 1.08, 1]);

  // Mouse move handler for parallax
  useEffect(() => {
    if (prefersReducedMotion || isMobile) return;

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [prefersReducedMotion, isMobile, mouseX, mouseY]);

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

  // Draw frame to main canvas
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

  // Draw frame to reflection canvas (half resolution)
  const drawReflection = useCallback((frameIndex: number) => {
    const canvas = reflectionCanvasRef.current;
    const frame = framesRef.current[frameIndex];
    if (!canvas || !frame) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();

    // Half resolution for performance
    canvas.width = (rect.width * dpr) / 2;
    canvas.height = (rect.height * dpr) / 2;
    ctx.setTransform(dpr / 2, 0, 0, dpr / 2, 0, 0);

    const surface = getComputedStyle(document.documentElement)
      .getPropertyValue("--bg")
      .trim();
    ctx.fillStyle = surface;
    ctx.fillRect(0, 0, rect.width / 2, rect.height / 2);

    // Flip vertically
    ctx.save();
    ctx.scale(1, -1);
    ctx.translate(0, -rect.height);

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
    ctx.restore();
  }, []);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (currentFrameRef.current >= 0) {
        drawFrame(currentFrameRef.current);
        drawReflection(currentFrameRef.current);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [drawFrame, drawReflection]);

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
        drawReflection(frameIndex);
      }

      rafRef.current = requestAnimationFrame(update);
    };

    rafRef.current = requestAnimationFrame(update);
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [scrollYProgress, smoothProgress, drawFrame, drawReflection, prefersReducedMotion]);

  // Initial draw - start from exploded view (near end frames) for hero effect
  const [initialFrameSet, setInitialFrameSet] = useState(false);

  useEffect(() => {
    if (!prefersReducedMotion && framesLoaded && !initialFrameSet) {
      setInitialFrameSet(true);

      const totalFrames = isMobile ? Math.min(FRAME_COUNT, 60) : FRAME_COUNT;
      const startFrame = Math.floor(totalFrames * 0.85); // Start at 85%
      const endFrame = totalFrames - 1;

      // Start at exploded view
      drawFrame(startFrame);
      drawReflection(startFrame);

      // Animate to last frame then back (exploded → fully exploded → reverse)
      let frame = startFrame;
      const animateExploded = () => {
        frame++;
        if (frame <= endFrame) {
          drawFrame(frame);
          drawReflection(frame);
          requestAnimationFrame(animateExploded);
        } else {
          // Then reverse back through frames for full effect
          let reverseFrame = endFrame;
          const reverseAnim = () => {
            reverseFrame--;
            if (reverseFrame >= 0) {
              drawFrame(reverseFrame);
              drawReflection(reverseFrame);
              requestAnimationFrame(reverseAnim);
            }
          };
          // Faster on mobile
          const delay = isMobile ? 150 : 300;
          setTimeout(() => requestAnimationFrame(reverseAnim), delay);
        }
      };
      // Faster animation on mobile
      const delay = isMobile ? 200 : 400;
      setTimeout(() => requestAnimationFrame(animateExploded), delay);
    }
  }, [drawFrame, drawReflection, framesLoaded, prefersReducedMotion, initialFrameSet, isMobile]);

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
        <Turntable />
      </section>
    );
  }

  return (
    <>
      <section
        ref={containerRef}
        id="overview"
        className="relative"
        style={{ height: `${SCROLL_HEIGHT_MULTIPLIER}vh` }}
      >
        {/* Sticky canvas container with perspective */}
        <div
          className="sticky top-0 left-0 right-0 h-screen overflow-hidden"
          style={{
            background: "var(--bg)",
            perspective: `${CAMERA_PERSPECTIVE}px`,
            perspectiveOrigin: "50% 50%",
          }}
        >
          {/* Virtual camera container - all 3D transforms applied here */}
          <motion.div
            className="relative h-full w-full"
            style={{
              scale: cameraScale,
              rotateY: cameraRotateY,
              rotateX: cameraRotateX,
              translateY: cameraTranslateY,
              transformStyle: "preserve-3d",
            }}
          >
            {/* Far glow layer */}
            <motion.div
              className="pointer-events-none absolute inset-0"
              style={{
                x: farGlowX,
                y: farGlowY,
              }}
            >
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(ellipse 60% 50% at 50% 50%, var(--warm-light) 0%, transparent 70%)",
                  opacity: 0.6,
                  filter: "blur(60px)",
                }}
              />
            </motion.div>

            {/* Floor reflection - positioned below canvas */}
            <motion.div
              className="pointer-events-none absolute left-1/2 top-1/2 w-full -translate-x-1/2"
              style={{
                x: reflectionX,
                y: reflectionY,
              }}
            >
              <canvas
                ref={reflectionCanvasRef}
                className="mx-auto max-w-[80%] opacity-[0.12]"
                style={{
                  marginTop: REFLECTION_OFFSET_Y,
                  filter: `blur(${REFLECTION_BLUR}px)`,
                  maskImage: "linear-gradient(to bottom, transparent, black 30%)",
                  WebkitMaskImage: "linear-gradient(to bottom, transparent, black 30%)",
                }}
                aria-hidden="true"
              />
            </motion.div>

            {/* Canvas container with parallax */}
            <motion.div
              className="absolute inset-0"
              style={{ x: canvasX, y: canvasY }}
            >
              {/* Canvas */}
              <canvas
                ref={canvasRef}
                className="absolute inset-0 h-full w-full"
                aria-hidden="true"
              />
            </motion.div>

            {/* Contact shadow */}
            <motion.div
              className="pointer-events-none absolute left-1/2 top-1/2 w-[60%] -translate-x-1/2"
              style={{
                y: "calc(50% + 120px)",
                opacity: shadowOpacity,
              }}
            >
              <div
                className="h-[20px] w-full rounded-[100%]"
                style={{
                  background: "radial-gradient(ellipse, rgba(0,0,0,0.4) 0%, transparent 70%)",
                  filter: "blur(40px)",
                }}
              />
            </motion.div>

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

            {/* Light sweep 1 */}
            <motion.div
              className="pointer-events-none absolute inset-0 overflow-hidden"
              style={{ opacity: lightSweepOpacity1 }}
            >
              <motion.div
                className="absolute inset-y-0 w-[200%] -rotate-45"
                style={{
                  left: lightSweepX1,
                  top: "-20%",
                  background:
                    "linear-gradient(to right, transparent, var(--gold-light) 20%, var(--gold-light) 80%, transparent)",
                  mixBlendMode: "screen",
                }}
              />
            </motion.div>

            {/* Light sweep 2 */}
            <motion.div
              className="pointer-events-none absolute inset-0 overflow-hidden"
              style={{ opacity: lightSweepOpacity2 }}
            >
              <motion.div
                className="absolute inset-y-0 w-[200%] -rotate-45"
                style={{
                  left: lightSweepX2,
                  top: "-20%",
                  background:
                    "linear-gradient(to right, transparent, var(--gold-light) 20%, var(--gold-light) 80%, transparent)",
                  mixBlendMode: "screen",
                }}
              />
            </motion.div>

            {/* Soft vignette so the canvas edges disappear */}
            <motion.div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 78% 72% at 50% 50%, transparent 42%, var(--bg) 100%)",
                opacity: vignetteBlur,
              }}
            />

            {/* Static vignette for base case */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 78% 72% at 50% 50%, transparent 42%, var(--bg) 100%)",
              }}
            />

            {/* Edge scrims — the stage the type sits on */}
            <motion.div
              className="pointer-events-none absolute inset-y-0 left-0 w-[42%]"
              style={{ x: textX }}
            >
              <div
                className="h-full"
                style={{
                  background:
                    "linear-gradient(to right, var(--bg-scrim) 0%, var(--bg-scrim-soft) 18%, transparent 100%)",
                }}
              />
            </motion.div>
            <motion.div
              className="pointer-events-none absolute inset-y-0 right-0 w-[42%]"
              style={{ x: textX }}
            >
              <div
                className="h-full"
                style={{
                  background:
                    "linear-gradient(to left, var(--bg-scrim) 0%, var(--bg-scrim-soft) 18%, transparent 100%)",
                }}
              />
            </motion.div>

            {/* Foreground bokeh circles */}
            {!isMobile &&
              bokehElements.map((bokeh) => (
                <motion.div
                  key={bokeh.id}
                  className="pointer-events-none absolute rounded-full"
                  style={{
                    left: `${bokeh.x}%`,
                    top: `${bokeh.y}%`,
                    width: bokeh.size,
                    height: bokeh.size,
                    background: "var(--gold-light)",
                    filter: `blur(${bokeh.blur}px)`,
                    opacity: bokeh.opacity,
                    x: foregroundX,
                    y: foregroundY,
                  }}
                />
              ))}

            {/* Story beats overlay */}
            <StoryBeats
              progress={smoothProgress}
              ready={ready}
              textParallaxX={textX}
            />
          </motion.div>
        </div>
      </section>
    </>
  );
}