"use client";

import { useRef } from "react";
import { useInView } from "framer-motion";
import { SPECS } from "@/lib/specs";
import { MaskedLine } from "./Reveal";
import Eyebrow from "./Eyebrow";

export default function Specs() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });

  return (
    <section
      id="specs"
      ref={ref}
      className="px-[8vw] py-[14vh]"
      style={{ background: "var(--bg)" }}
    >
      <div className="mx-auto max-w-5xl">
        <Eyebrow label="Specification" />

        <MaskedLine active={inView} delay={0.08} className="mt-8">
          <h2 className="headline headline--section">
            The <em className="headline-italic-gold">measurements</em>.
          </h2>
        </MaskedLine>

        <div className="mt-14 md:mt-20">
          {SPECS.map((spec) => (
            <div
              key={spec.label}
              className="grid grid-cols-1 gap-2 border-t border-line py-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] md:items-baseline md:gap-10 md:py-7"
            >
              <span
                className="text-[11px] uppercase tracking-[0.28em]"
                style={{ color: "var(--text-muted)" }}
              >
                {spec.label}
              </span>
              <span
                className="font-serif text-[1.15rem] md:text-[1.35rem]"
                style={{ color: "var(--ivory)" }}
              >
                {spec.value}
              </span>
            </div>
          ))}
          <div className="border-t border-line" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
