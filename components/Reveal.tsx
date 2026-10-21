"use client";

import { motion } from "framer-motion";
import { EASE, REVEAL_DURATION } from "@/lib/config";

interface MaskedLineProps {
  /** When true the line rises out of its mask. */
  active: boolean;
  /** Seconds to wait before the line begins its rise. */
  delay?: number;
  children: React.ReactNode;
  className?: string;
}

/**
 * A single line of type inside an overflow-hidden mask.
 * The line travels from 100% below the mask to rest, slowly and softly.
 * When it is no longer active it is reset instantly while invisible, so it
 * never slides back out — it only fades.
 */
export function MaskedLine({
  active,
  delay = 0,
  children,
  className = "",
}: MaskedLineProps) {
  return (
    <span className={`mask ${className}`}>
      <motion.span
        className="block will-change-transform"
        initial={{ y: "112%" }}
        animate={active ? { y: "0%" } : { y: "112%" }}
        transition={{
          duration: active ? REVEAL_DURATION : 0,
          delay: active ? delay : 0,
          ease: EASE,
        }}
      >
        {children}
      </motion.span>
    </span>
  );
}
