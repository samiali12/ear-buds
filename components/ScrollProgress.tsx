"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/**
 * A 1px gold line on the right edge showing how far through the page you are.
 */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 45,
    mass: 0.6,
  });

  return (
    <div
      className="fixed right-0 top-0 z-30 h-screen w-px"
      style={{ background: "var(--line-track)" }}
      aria-hidden="true"
    >
      <motion.div
        className="h-full w-full origin-top"
        style={{ scaleY, background: "var(--gold-40)" }}
      />
    </div>
  );
}
