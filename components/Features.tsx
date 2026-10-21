"use client";

import { useRef } from "react";
import { useInView } from "framer-motion";
import { FEATURES, type Feature } from "@/lib/specs";
import { MaskedLine } from "./Reveal";
import Eyebrow from "./Eyebrow";

function FeatureRow({
  feature,
  index,
}: {
  feature: Feature;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });

  return (
    <div
      ref={ref}
      className="grid grid-cols-[auto_1fr] items-baseline gap-x-6 gap-y-3 border-t border-line py-9 md:grid-cols-[6rem_minmax(0,18rem)_minmax(0,1fr)] md:gap-x-10 md:py-11"
    >
      <MaskedLine active={inView} delay={0}>
        <span className="numeral">{String(index + 1).padStart(2, "0")}</span>
      </MaskedLine>

      <MaskedLine active={inView} delay={0.08}>
        <h3
          className="font-serif text-[1.4rem] leading-tight md:text-[1.7rem]"
          style={{ color: "var(--ivory)" }}
        >
          {feature.title}
        </h3>
      </MaskedLine>

      <MaskedLine active={inView} delay={0.16} className="col-start-2 md:col-start-3">
        <p className="body-text">{feature.description}</p>
      </MaskedLine>
    </div>
  );
}

/**
 * The technology, told as an editorial list rather than a grid of cards.
 */
export default function Features() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });

  return (
    <section
      id="technology"
      ref={ref}
      className="px-[8vw] py-[16vh]"
      style={{ background: "var(--bg)" }}
    >
      <div className="mx-auto max-w-6xl">
        <Eyebrow label="Technology" />

        <MaskedLine active={inView} delay={0.08} className="mt-8">
          <h2 className="headline headline--section">
            Six reasons it <em className="headline-italic-gold">sounds</em> right.
          </h2>
        </MaskedLine>

        <MaskedLine active={inView} delay={0.16} className="mt-8">
          <p className="body-text">
            Everything else has been quietly removed.
          </p>
        </MaskedLine>

        <div className="mt-16 md:mt-24">
          {FEATURES.map((feature, index) => (
            <FeatureRow key={feature.title} feature={feature} index={index} />
          ))}
          <div className="border-t border-line" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
