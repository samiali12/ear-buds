"use client";

import { motion } from "framer-motion";
import { EASE } from "@/lib/config";

interface EyebrowProps {
  /** Chapter marker, e.g. "01 / 05" */
  chapter?: string;
  /** Eyebrow label, e.g. "Engineering" */
  label: string;
  /** Which edge the block is anchored to */
  align?: "left" | "right";
  /** Drives the hairline. Falls back to an in-view reveal. */
  active?: boolean;
  className?: string;
}

/**
 * A 1px gold hairline, a chapter marker and a small tracked label.
 */
export default function Eyebrow({
  chapter,
  label,
  align = "left",
  active,
  className = "",
}: EyebrowProps) {
  const rule =
    active === undefined
      ? {
          initial: { scaleX: 0 },
          whileInView: { scaleX: 1 },
          viewport: { once: true },
          transition: { duration: 1.2, ease: EASE },
        }
      : {
          initial: { scaleX: 0 },
          animate: { scaleX: active ? 1 : 0 },
          transition: { duration: active ? 1.2 : 0.6, ease: EASE },
        };

  return (
    <div
      className={`eyebrow-block ${
        align === "right" ? "items-end text-right" : ""
      } ${className}`}
    >
      <motion.span
        className="eyebrow-block__rule"
        style={{
          transformOrigin: align === "right" ? "right center" : "left center",
        }}
        aria-hidden="true"
        {...rule}
      />
      {chapter ? <span className="chapter">{chapter}</span> : null}
      <span className="eyebrow">{label}</span>
    </div>
  );
}
