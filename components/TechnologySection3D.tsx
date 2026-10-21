"use client";

import { useRef, useSyncExternalStore } from "react";
import { useInView } from "framer-motion";
import { FEATURES, type Feature } from "@/lib/specs";
import { TECH_PARTS } from "@/lib/tech3d";
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

function FeatureRow({
  feature,
  index,
  active,
}: {
  feature: Feature;
  index: number;
  active: boolean;
}) {
  return (
    <li className="border-t border-line py-8 md:py-10">
      <div
        className="grid grid-cols-[3.25rem_minmax(0,1fr)] gap-x-5 transition-opacity duration-700 md:gap-x-10"
        style={{ opacity: active ? 1 : 0.6 }}
      >
        <span
          className="numeral--display pt-1 transition-colors duration-700"
          style={{ color: active ? "var(--gold)" : "var(--gold-muted)" }}
        >
          {String(index + 1).padStart(2, "0")}
        </span>

        <div>
          <h3
            className="font-serif text-[1.45rem] leading-tight md:text-[1.8rem]"
            style={{ color: "var(--ivory)" }}
          >
            {feature.title}
          </h3>
          <p className="body-text mt-3">{feature.description}</p>
        </div>
      </div>
    </li>
  );
}

function FeatureList({
  activeIndex,
  interactive,
  listRef,
}: {
  activeIndex: number;
  interactive: boolean;
  listRef: React.RefObject<HTMLUListElement | null>;
}) {
  return (
    <ul ref={listRef} className="relative z-0">
      {FEATURES.map((feature, index) => (
        <FeatureRow
          key={feature.title}
          feature={feature}
          index={index}
          active={!interactive || activeIndex === index}
        />
      ))}
      <li className="border-t border-line" aria-hidden="true" />
    </ul>
  );
}

export default function TechnologySection3D() {
  const sectionRef = useRef<HTMLElement>(null);
  const { listRef, activeIndex, isVisible } = useScrollStage(
    FEATURES.length,
    sectionRef
  );

  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotion,
    () => false
  );

  const inView = useInView(sectionRef, { once: true, amount: 0.05 });

  const activePart = TECH_PARTS[activeIndex] ?? TECH_PARTS[0];

  return (
    <section
      id="technology"
      ref={sectionRef}
      className="relative"
      style={{ background: "var(--bg)" }}
    >
      {/* Heading */}
      <div className="mx-auto max-w-[1600px] px-[8vw] pb-[10vh] pt-[16vh]">
        <Eyebrow label="Technology" />

        <MaskedLine active={inView} delay={0.08} className="mt-8">
          <h2 className="headline headline--section">
            Six reasons it <em className="headline-italic-gold">sounds</em>{" "}
            right.
          </h2>
        </MaskedLine>

        <MaskedLine active={inView} delay={0.16} className="mt-7">
          <p className="body-text">Everything else has been quietly removed.</p>
        </MaskedLine>
      </div>

      {reducedMotion ? (
        <div className="mx-auto max-w-[1600px] px-[8vw] pb-[14vh]">
          <FeatureList
            activeIndex={activeIndex}
            interactive={false}
            listRef={listRef}
          />
        </div>
      ) : (
        <div className="relative mx-auto flex max-w-[1600px] flex-col pb-[14vh] md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)] md:gap-x-[7vw] md:px-[8vw]">
          {/* The stage stays pinned while the list scrolls past it */}
          <div
            className="sticky top-0 z-10 h-[42dvh] w-full shrink-0 self-stretch md:h-[100dvh] md:self-start"
            style={{ background: "var(--bg)" }}
          >
            <StageCanvas
              part={activePart}
              visible={isVisible}
              label="Three-dimensional model of the Aurum Buds Pro, highlighting the part behind each feature."
            />
          </div>

          <div className="relative z-0 px-[8vw] pt-[8vh] md:px-0 md:pt-0">
            <FeatureList
              activeIndex={activeIndex}
              interactive
              listRef={listRef}
            />
          </div>
        </div>
      )}
    </section>
  );
}
