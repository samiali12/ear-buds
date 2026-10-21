"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

const QUERY = "(pointer: fine)";

function subscribe(callback: () => void) {
  const media = window.matchMedia(QUERY);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

/**
 * A 10px hairline ring that follows the pointer on desktop only.
 */
export default function Cursor() {
  const isFinePointer = useSyncExternalStore(subscribe, getSnapshot, () => false);
  const [active, setActive] = useState(false);
  const [position, setPosition] = useState({ x: -100, y: -100 });

  useEffect(() => {
    if (!isFinePointer) return;

    document.documentElement.classList.add("has-custom-cursor");

    const handleMove = (event: MouseEvent) => {
      setPosition({ x: event.clientX, y: event.clientY });
    };

    const handleOver = (event: MouseEvent) => {
      const target = event.target as Element | null;
      setActive(
        Boolean(
          target?.closest("a, button, [role='button'], input, textarea, select")
        )
      );
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    window.addEventListener("mouseover", handleOver, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseover", handleOver);
      document.documentElement.classList.remove("has-custom-cursor");
    };
  }, [isFinePointer]);

  if (!isFinePointer) return null;

  return (
    <div
      className="cursor-outer"
      style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0)` }}
      aria-hidden="true"
    >
      <div className="cursor-ring" data-active={active} />
    </div>
  );
}
