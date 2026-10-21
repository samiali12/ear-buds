"use client";

import { useRef, useSyncExternalStore } from "react";
import { useInView } from "framer-motion";
import { SPECS } from "@/lib/specs";
import { SPEC_PARTS } from "@/lib/tech3d";
import { useScrollStage } from "@/lib/use-scroll-stage";
import { MaskedLine } from "./Reveal";
import Eyebrow from "./Eyebrow";
import StageCanvas from "./StageCanvas";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(callback: () => void) {
  const media = window.matchMedia(REDUCED_MOTION_QUERY);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

function getReducedMotion() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function SpecRow({
  label,
  value,
  active,
}: {
  label: string;
  value: string;
  active: boolean;
}) {
  return (
    <li className="border-t border-line py-7 md:py-9">
      <div
        className="grid grid-cols-1 gap-2 transition-opacity duration-700 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:items-baseline md:gap-10"
        style={{ opacity: active ? 1 : 0.6 }}
      >
        <span
          className="text-[11px] uppercase tracking-[0.28em] transition-colors duration-700"
          style={{ color: active ? "var(--gold)" : "var(--text-muted)" }}
        >
          {label}
        </span>
        <span
          className="font-serif text-[1.15rem] leading-snug md:text-[1.4rem]"
          style={{ color: "var(--ivory)" }}
        >
          {value}
        </span>
      </div>
    </li>
  );
}

export default function Specs() {
  const sectionRef = useRef<HTMLElement>(null);
  const { listRef, activeIndex, isVisible } = useScrollStage(
    SPECS.length,
    sectionRef
  );

  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotion,
    () => false
  );

  const inView = useInView(sectionRef, { once: true, amount: 0.05 });

  const activePart = SPEC_PARTS[activeIndex] ?? SPEC_PARTS[0];

  return (
    <section
      id="specs"
      ref={sectionRef}
      className="relative"
      style={{ background: "var(--bg)" }}
    >
      {/* Heading */}
      <div className="mx-auto max-w-[1600px] px-[8vw] pb-[10vh] pt-[16vh]">
        <Eyebrow label="Specification" />

        <MaskedLine active={inView} delay={0.08} className="mt-8">
          <h2 className="headline headline--section">
            The <em className="headline-italic-gold">measurements</em>.
          </h2>
        </MaskedLine>

        <MaskedLine active={inView} delay={0.16} className="mt-7">
          <p className="body-text">Every figure, stated plainly.</p>
        </MaskedLine>
      </div>

      {reducedMotion ? (
        <div className="mx-auto max-w-[1600px] px-[8vw] pb-[14vh]">
          <ul>
            {SPECS.map((spec) => (
              <SpecRow
                key={spec.label}
                label={spec.label}
                value={spec.value}
                active
              />
            ))}
            <li className="border-t border-line" aria-hidden="true" />
          </ul>
        </div>
      ) : (
        <div className="relative mx-auto flex max-w-[1600px] flex-col pb-[14vh] md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)] md:gap-x-[7vw] md:px-[8vw]">
          {/* The stage stays pinned while the measurements scroll past it */}
          <div
            className="sticky top-0 z-10 h-[42dvh] w-full shrink-0 self-stretch md:h-[100dvh] md:self-start"
            style={{ background: "var(--bg)" }}
          >
            <StageCanvas
              part={activePart}
              visible={isVisible}
              label="Three-dimensional model of the Aurum Buds Pro, highlighting the part behind each measurement."
            />
          </div>

          <div className="relative z-0 px-[8vw] pt-[8vh] md:px-0 md:pt-0">
            <ul ref={listRef}>
              {SPECS.map((spec, index) => (
                <SpecRow
                  key={spec.label}
                  label={spec.label}
                  value={spec.value}
                  active={index === activeIndex}
                />
              ))}
              <li className="border-t border-line" aria-hidden="true" />
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}
