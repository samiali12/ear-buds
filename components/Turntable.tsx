"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";
import { SPIN_FRAME_COUNT } from "@/lib/config";
import {
  TURNTABLE_IDLE_TIMEOUT,
  TURNTABLE_VELOCITY_DECAY,
  TURNTABLE_MIN_VELOCITY,
  SHADOW_OPACITY_ASSEMBLED,
  EASE_LUXURY,
} from "@/lib/motion";

const FRAME_PATH = "/spin/spin_";

export default function Turntable() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reflectionCanvasRef = useRef<HTMLCanvasElement>(null);
  const [framesLoaded, setFramesLoaded] = useState(false);
  const [spinFramesExist, setSpinFramesExist] = useState<boolean | null>(null);
  const [showHint, setShowHint] = useState(true);
  const [isInteracting, setIsInteracting] = useState(false);
  const framesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const prefersReducedMotion = useReducedMotion();

  // Motion values for interaction
  const velocity = useMotionValue(0);
  const isDragging = useMotionValue(false);
  const lastX = useRef(0);
  const lastTime = useRef(0);

  // Check if spin frames exist
  useEffect(() => {
    const img = new Image();
    img.src = `${FRAME_PATH}${String(SPIN_FRAME_COUNT).padStart(3, "0")}.webp`;
    img.onload = () => setSpinFramesExist(true);
    img.onerror = () => {
      setSpinFramesExist(false);
      console.warn(
        "Turntable: /public/spin frames not found. Hiding 360 viewer section."
      );
    };
  }, []);

  // Load frames when section is near viewport
  useEffect(() => {
    if (spinFramesExist === false || prefersReducedMotion) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !framesLoaded) {
          loadFrames();
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [spinFramesExist, framesLoaded, prefersReducedMotion]);

  const loadFrames = useCallback(() => {
    const frames: HTMLImageElement[] = [];

    const loadFrame = (index: number): Promise<void> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = `${FRAME_PATH}${String(index + 1).padStart(3, "0")}.webp`;
        img.onload = () => {
          frames[index] = img;
          resolve();
        };
        img.onerror = () => resolve();
      });
    };

    Promise.all(
      Array.from({ length: SPIN_FRAME_COUNT }, (_, i) => loadFrame(i))
    ).then(() => {
      framesRef.current = frames.filter(Boolean);
      if (framesRef.current.length > 0) {
        setFramesLoaded(true);
      }
    });
  }, []);

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

    const surface = getComputedStyle(document.documentElement)
      .getPropertyValue("--bg")
      .trim();
    ctx.fillStyle = surface;
    ctx.fillRect(0, 0, rect.width, rect.height);

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

  // Draw reflection
  const drawReflection = useCallback((frameIndex: number) => {
    const canvas = reflectionCanvasRef.current;
    const frame = framesRef.current[frameIndex];
    if (!canvas || !frame) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();

    canvas.width = (rect.width * dpr) / 2;
    canvas.height = (rect.height * dpr) / 2;
    ctx.setTransform(dpr / 2, 0, 0, dpr / 2, 0, 0);

    const surface = getComputedStyle(document.documentElement)
      .getPropertyValue("--bg")
      .trim();
    ctx.fillStyle = surface;
    ctx.fillRect(0, 0, rect.width / 2, rect.height / 2);

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

  // Animation loop for inertia
  useEffect(() => {
    if (prefersReducedMotion || !framesLoaded) return;

    let last = performance.now();

    const update = (now: number) => {
      const delta = Math.min((now - last) / 16.667, 4);
      last = now;

      if (!isInteracting) {
        const currentVelocity = velocity.get();

        if (Math.abs(currentVelocity) > TURNTABLE_MIN_VELOCITY) {
          currentFrameRef.current += currentVelocity * 0.1;

          // Wrap around
          while (currentFrameRef.current < 0) {
            currentFrameRef.current += SPIN_FRAME_COUNT;
          }
          while (currentFrameRef.current >= SPIN_FRAME_COUNT) {
            currentFrameRef.current -= SPIN_FRAME_COUNT;
          }

          const frameIndex = Math.floor(currentFrameRef.current) % SPIN_FRAME_COUNT;
          drawFrame(frameIndex);
          drawReflection(frameIndex);

          velocity.set(currentVelocity * TURNTABLE_VELOCITY_DECAY);
        }
      }

      rafRef.current = requestAnimationFrame(update);
    };

    rafRef.current = requestAnimationFrame(update);
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [framesLoaded, velocity, isInteracting, drawFrame, drawReflection, prefersReducedMotion]);

  // Auto-rotate when idle
  useEffect(() => {
    if (prefersReducedMotion || !framesLoaded) return;

    const startAutoRotate = () => {
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }

      idleTimeoutRef.current = setTimeout(() => {
        if (!isInteracting) {
          // Slow auto-rotation
          velocity.set(2);
        }
      }, TURNTABLE_IDLE_TIMEOUT);
    };

    startAutoRotate();

    return () => {
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }
    };
  }, [framesLoaded, isInteracting, velocity, prefersReducedMotion]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (framesLoaded && currentFrameRef.current >= 0) {
        drawFrame(Math.floor(currentFrameRef.current));
        drawReflection(Math.floor(currentFrameRef.current));
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [framesLoaded, drawFrame, drawReflection]);

  // Initial draw
  useEffect(() => {
    if (framesLoaded) {
      drawFrame(0);
      drawReflection(0);
    }
  }, [framesLoaded, drawFrame, drawReflection]);

  // Pointer handlers
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (prefersReducedMotion) return;

      setIsInteracting(true);
      isDragging.set(true);
      setShowHint(false);

      lastX.current = e.clientX;
      lastTime.current = performance.now();
      velocity.set(0);

      if (containerRef.current) {
        containerRef.current.setPointerCapture(e.pointerId);
      }
    },
    [prefersReducedMotion, isDragging, velocity]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (prefersReducedMotion) return;
      if (!isDragging.get()) return;

      const now = performance.now();
      const deltaTime = now - lastTime.current;
      const deltaX = e.clientX - lastX.current;

      if (deltaTime > 0) {
        // Calculate velocity
        const newVelocity = (deltaX / deltaTime) * 60;
        velocity.set(newVelocity);

        // Update frame
        const frameChange = deltaX * 0.5;
        currentFrameRef.current += frameChange;

        // Wrap around
        while (currentFrameRef.current < 0) {
          currentFrameRef.current += SPIN_FRAME_COUNT;
        }
        while (currentFrameRef.current >= SPIN_FRAME_COUNT) {
          currentFrameRef.current -= SPIN_FRAME_COUNT;
        }

        const frameIndex = Math.floor(currentFrameRef.current) % SPIN_FRAME_COUNT;
        drawFrame(frameIndex);
        drawReflection(frameIndex);
      }

      lastX.current = e.clientX;
      lastTime.current = now;
    },
    [prefersReducedMotion, isDragging, velocity, drawFrame, drawReflection]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (prefersReducedMotion) return;

      setIsInteracting(false);
      isDragging.set(false);

      if (containerRef.current) {
        containerRef.current.releasePointerCapture(e.pointerId);
      }
    },
    [prefersReducedMotion, isDragging]
  );

  // Keyboard handlers
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (prefersReducedMotion) return;
      if (!framesLoaded) return;

      setShowHint(false);

      if (e.key === "ArrowLeft") {
        currentFrameRef.current -= 3;
        while (currentFrameRef.current < 0) {
          currentFrameRef.current += SPIN_FRAME_COUNT;
        }
        const frameIndex = Math.floor(currentFrameRef.current) % SPIN_FRAME_COUNT;
        drawFrame(frameIndex);
        drawReflection(frameIndex);
      } else if (e.key === "ArrowRight") {
        currentFrameRef.current += 3;
        while (currentFrameRef.current >= SPIN_FRAME_COUNT) {
          currentFrameRef.current -= SPIN_FRAME_COUNT;
        }
        const frameIndex = Math.floor(currentFrameRef.current) % SPIN_FRAME_COUNT;
        drawFrame(frameIndex);
        drawReflection(frameIndex);
      }
    },
    [prefersReducedMotion, framesLoaded, drawFrame, drawReflection]
  );

  // Don't render if frames don't exist
  if (spinFramesExist === false) {
    return null;
  }

  // Reduced motion static version
  if (prefersReducedMotion) {
    return (
      <section
        id="explore"
        className="relative flex min-h-screen items-center justify-center px-[8vw]"
        style={{ background: "var(--bg)" }}
      >
        <div className="text-center">
          <h2 className="headline headline--section">Hold it. Turn it.</h2>
          <p
            className="mt-4 body-text mx-auto"
            style={{ color: "var(--text-muted)" }}
          >
            360° view available. Use arrow keys to rotate.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      id="explore"
      className="relative flex min-h-screen flex-col items-center justify-center px-[8vw]"
      style={{ background: "var(--bg)" }}
    >
      {/* Headline */}
      <div className="absolute top-[12vh] text-center">
        <motion.h2
          className="headline headline--section"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE_LUXURY }}
          viewport={{ once: true }}
        >
          Hold it. <em className="headline-italic-gold">Turn it.</em>
        </motion.h2>
        <motion.p
          className="mt-4 body-text mx-auto"
          style={{ color: "var(--text-muted)" }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE_LUXURY, delay: 0.1 }}
          viewport={{ once: true }}
        >
          Every angle, crafted to captivate.
        </motion.p>
      </div>

      {/* Turntable container */}
      <div
        ref={containerRef}
        className="relative mt-[20vh] w-full max-w-2xl cursor-grab touch-none"
        style={{ perspective: "1200px" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="slider"
        aria-label="360 degree product viewer"
        aria-valuemin={0}
        aria-valuemax={SPIN_FRAME_COUNT - 1}
        aria-valuenow={Math.floor(currentFrameRef.current)}
      >
        {/* Reflection */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 w-full -translate-x-1/2">
          <canvas
            ref={reflectionCanvasRef}
            className="mx-auto max-w-[70%] opacity-[0.12]"
            style={{
              filter: "blur(2px)",
              maskImage: "linear-gradient(to bottom, transparent, black 40%)",
              WebkitMaskImage: "linear-gradient(to bottom, transparent, black 40%)",
              transform: "scaleY(-1)",
            }}
            aria-hidden="true"
          />
        </div>

        {/* Main canvas */}
        <canvas
          ref={canvasRef}
          className="relative z-10 w-full"
          style={{ touchAction: "none" }}
          aria-hidden="true"
        />

        {/* Contact shadow */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 w-[60%] -translate-x-1/2"
          style={{ top: "calc(50% + 100px)" }}
        >
          <div
            className="h-[20px] w-full rounded-[100%]"
            style={{
              background: "radial-gradient(ellipse, rgba(0,0,0,0.35) 0%, transparent 70%)",
              filter: "blur(40px)",
              opacity: SHADOW_OPACITY_ASSEMBLED,
            }}
          />
        </div>

        {/* Hint */}
        <motion.div
          className="pointer-events-none absolute bottom-[-60px] left-1/2 -translate-x-1/2 text-center"
          style={{ color: "var(--text-muted)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: showHint ? 1 : 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="font-sans text-xs tracking-widest uppercase">
            Drag to rotate
          </span>
        </motion.div>
      </div>
    </section>
  );
}