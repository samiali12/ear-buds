"use client";

import { useEffect, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform,
} from "framer-motion";
import {
  EASE,
  FRAME_COUNT,
  FRAME_PATH,
  FRAME_PATH_MOBILE,
  MOBILE_BREAKPOINT,
  PRODUCT_NAME,
} from "@/lib/config";

interface LoaderProps {
  onLoaded: () => void;
}

/**
 * A black screen. The name surfaces in spaced serif letters, a hairline of
 * gold fills as the frames arrive, then the whole thing fades away.
 */
export default function Loader({ onLoaded }: LoaderProps) {
  const [isComplete, setIsComplete] = useState(false);
  const progress = useMotionValue(0);
  const width = useTransform(progress, (value) => `${value * 100}%`);

  useEffect(() => {
    let cancelled = false;

    const preloadImage = (src: string): Promise<void> => {
      return new Promise((resolve) => {
        const img = new window.Image();
        img.src = src;
        img.onload = () => resolve();
        img.onerror = () => resolve();
      });
    };

    const preloadFrames = async () => {
      const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
      const framePath = isMobile ? FRAME_PATH_MOBILE : FRAME_PATH;

      const sources = Array.from(
        { length: FRAME_COUNT },
        (_, i) => `${framePath}${String(i + 1).padStart(3, "0")}.webp`
      );

      // The opening frames carry the first impression, so they are awaited.
      // The rest are warmed in the background and never hold the page up.
      const opening = sources.slice(0, 12);
      const rest = sources.slice(12);

      await Promise.all(opening.map((src) => preloadImage(src)));
      if (cancelled) return;
      progress.set(opening.length / FRAME_COUNT);

      const batchSize = 24;
      let loaded = opening.length;

      for (let i = 0; i < rest.length; i += batchSize) {
        const batch = rest.slice(i, i + batchSize);
        await Promise.all(batch.map((src) => preloadImage(src)));
        if (cancelled) return;

        loaded += batch.length;
        progress.set(loaded / FRAME_COUNT);
      }
    };

    preloadFrames().then(() => {
      if (!cancelled) setIsComplete(true);
    });

    return () => {
      cancelled = true;
    };
  }, [progress]);

  return (
    <AnimatePresence onExitComplete={onLoaded}>
      {!isComplete && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: EASE }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center"
          style={{ background: "var(--bg)" }}
        >
          <motion.span
            className="text-[13px] uppercase"
            style={{
              fontFamily: "var(--font-serif-family)",
              color: "var(--ivory)",
              letterSpacing: "0.42em",
              textIndent: "0.42em",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.6, ease: EASE, delay: 0.35 }}
          >
            {PRODUCT_NAME}
          </motion.span>

          <div
            className="relative mt-12 h-px w-40"
            style={{ background: "var(--line)" }}
          >
            <motion.div
              className="absolute inset-y-0 left-0"
              style={{ background: "var(--gold)", width }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
