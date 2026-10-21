"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  useInView,
  useMotionValueEvent,
  useScroll,
} from "framer-motion";
import { FEATURES, type Feature } from "@/lib/specs";
import { TECH_PARTS } from "@/lib/tech3d";
import { MaskedLine } from "./Reveal";
import Eyebrow from "./Eyebrow";

/**
 * The canvas is WebGL, so it never runs on the server. The placeholder keeps
 * the stage the same size so nothing jumps when it arrives.
 */
const TechnologyCanvas = dynamic(() => import("./TechnologyCanvas"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full" style={{ background: "var(--bg)" }} />
  ),
});

/** Resolves to null until the preference is known. */
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState<boolean | null>(null);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setReduced(event.matches);
    };

    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  return reduced;
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
    <li className="flex items-center border-t border-line py-9 md:min-h-[52vh] md:py-12">
      <div
        className="grid w-full grid-cols-[auto_1fr] items-baseline gap-x-6 gap-y-3 transition-opacity duration-700 md:grid-cols-[6rem_minmax(0,18rem)_minmax(0,1fr)] md:gap-x-10"
        style={{ opacity: active ? 1 : 0.62 }}
      >
        <span
          className="numeral transition-colors duration-700"
          style={{ color: active ? "var(--gold)" : "var(--gold-muted)" }}
        >
          {String(index + 1).padStart(2, "0")}
        </span>

        <h3
          className="font-serif text-[1.4rem] leading-tight md:text-[1.7rem]"
          style={{ color: "var(--ivory)" }}
        >
          {feature.title}
        </h3>

        <p className="body-text col-start-2 md:col-start-3">
          {feature.description}
        </p>
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
    <ul ref={listRef} className="relative z-0 px-[8vw] md:px-0">
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
  const listRef = useRef<HTMLUListElement>(null);
  const activeRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  const inView = useInView(sectionRef, { once: true, amount: 0.05 });

  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ["start 60%", "end 60%"],
  });

  // Only the active feature causes a re-render — never the scroll frame.
  useMotionValueEvent(scrollYProgress, "change", (value) => {
    const next = Math.min(
      FEATURES.length - 1,
      Math.max(0, Math.floor(value * FEATURES.length))
    );

    if (next !== activeRef.current) {
      activeRef.current = next;
      setActiveIndex(next);
    }
  });

  // Catch a deep link that lands part way down the list
  useEffect(() => {
    const next = Math.min(
      FEATURES.length - 1,
      Math.max(0, Math.floor(scrollYProgress.get() * FEATURES.length))
    );
    activeRef.current = next;
    setActiveIndex(next);
  }, [scrollYProgress]);

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
  }, []);

  const reduced = reducedMotion === true;

  return (
    <section
      id="technology"
      ref={sectionRef}
      className="relative"
      style={{ background: "var(--bg)" }}
    >
      {/* Heading */}
      <div className="mx-auto max-w-[1600px] px-[8vw] pb-[6vh] pt-[14vh]">
        <Eyebrow label="Technology" />

        <MaskedLine active={inView} delay={0.08} className="mt-8">
          <h2 className="headline headline--section">
            Six reasons it <em className="headline-italic-gold">sounds</em>{" "}
            right.
          </h2>
        </MaskedLine>

        <MaskedLine active={inView} delay={0.16} className="mt-8">
          <p className="body-text">Everything else has been quietly removed.</p>
        </MaskedLine>
      </div>

      {reduced ? (
        <div className="mx-auto max-w-[1600px] pb-[14vh]">
          <FeatureList
            activeIndex={activeIndex}
            interactive={false}
            listRef={listRef}
          />
        </div>
      ) : (
        <div className="relative mx-auto flex max-w-[1600px] flex-col pb-[14vh] md:grid md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] md:gap-x-[6vw] md:px-[8vw]">
          {/* The stage stays pinned while the list scrolls past it */}
          <div
            className="sticky top-0 z-10 h-[38vh] w-full shrink-0 self-stretch md:h-screen md:self-start"
            style={{ background: "var(--bg)" }}
          >
            {reducedMotion === false ? (
              <TechnologyCanvas activeIndex={activeIndex} visible={isVisible} />
            ) : null}
          </div>

          <FeatureList activeIndex={activeIndex} interactive listRef={listRef} />
        </div>
      )}
    </section>
  );
}
