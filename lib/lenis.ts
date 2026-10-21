"use client";

import Lenis from "lenis";
import { LENIS_DURATION } from "@/lib/config";

let instance: Lenis | null = null;

/** Registers the live Lenis instance so anchors can be routed through it. */
export function setLenis(next: Lenis | null) {
  instance = next;
}

export function getLenis() {
  return instance;
}

/** Smoothly scrolls to a section id, honouring the smooth-scroll engine. */
export function scrollToSection(id: string, offset = 0) {
  if (typeof document === "undefined") return;

  const element = document.getElementById(id);
  if (!element) return;

  if (instance) {
    instance.scrollTo(element, { offset, duration: LENIS_DURATION });
    return;
  }

  element.scrollIntoView({ behavior: "smooth" });
}
