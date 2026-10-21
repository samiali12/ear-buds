"use client";

import { useEffect, useRef, useState } from "react";
import { useMotionValueEvent, useScroll } from "framer-motion";

/**
 * Shared behaviour for the pinned 3D sections.
 *
 * The list scrolls past a pinned stage. The row crossing the 60% line of the
 * viewport becomes the active one, and the scene stops rendering entirely
 * while the section is off screen.
 *
 * Only a change of the active row causes a re-render — never a scroll frame.
 */
export function useScrollStage(
  count: number,
  sectionRef: React.RefObject<HTMLElement | null>
) {
  const listRef = useRef<HTMLUListElement>(null);
  const activeRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ["start 60%", "end 60%"],
  });

  const resolveIndex = (value: number) =>
    Math.min(count - 1, Math.max(0, Math.floor(value * count)));

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    const next = resolveIndex(value);
    if (next === activeRef.current) return;
    activeRef.current = next;
    setActiveIndex(next);
  });

  // Catch a deep link that lands part way down the list
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const next = resolveIndex(scrollYProgress.get());
      if (next === activeRef.current) return;
      activeRef.current = next;
      setActiveIndex(next);
    });

    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollYProgress, count]);

  // Pause the scene while the section is off screen
  useEffect(() => {
    const element = sectionRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { rootMargin: "25% 0px" }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [sectionRef]);

  return { listRef, activeIndex, isVisible };
}
