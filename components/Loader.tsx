"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const preloadFrames = useCallback(async () => {
    const isMobile =
      typeof window !== "undefined" &&
      window.innerWidth < MOBILE_BREAKPOINT;
    const framePath = isMobile ? FRAME_PATH_MOBILE : FRAME_PATH;

    const preloadImage = (src: string): Promise<void> => {
      return new Promise((resolve) => {
        const img = new window.Image();
        img.src = src;
        img.onload = () => resolve();
        img.onerror = () => resolve();
      });
    };

    const sources = Array.from(
      { length: FRAME_COUNT },
      (_, i) => `${framePath}${String(i + 1).padStart(3, "0")}.webp`
    );

    const batchSize = 16;
    let loaded = 0;

    for (let i = 0; i < sources.length; i += batchSize) {
      const batch = sources.slice(i, i + batchSize);
      await Promise.all(batch.map((src) => preloadImage(src)));
      loaded += batch.length;
      setProgress(loaded / FRAME_COUNT);
    }

    setIsComplete(true);
  }, []);

  useEffect(() => {
    preloadFrames();
  }, [preloadFrames]);

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
              style={{ background: "var(--gold)" }}
              initial={{ width: "0%" }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.5, ease: EASE }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
