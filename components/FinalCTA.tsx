"use client";

import { useRef } from "react";
import { useInView } from "framer-motion";
import { PRODUCT_NAME } from "@/lib/config";
import { MaskedLine } from "./Reveal";
import Eyebrow from "./Eyebrow";
import OutlineButton from "./Button";

export default function FinalCTA() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section
      id="buy"
      ref={ref}
      className="px-[8vw] py-[18vh] text-center"
      style={{ background: "var(--bg)" }}
    >
      <div className="mx-auto max-w-3xl">
        <div className="flex justify-center">
          <Eyebrow label="Available now" className="items-center" />
        </div>

        <MaskedLine active={inView} delay={0.08} className="mt-10">
          <h2 className="headline">
            Begin <em className="headline-italic-gold">listening</em>.
          </h2>
        </MaskedLine>

        <MaskedLine active={inView} delay={0.16} className="mt-8">
          <p className="body-text mx-auto">
            Pre-orders are open. {PRODUCT_NAME} ships this autumn.
          </p>
        </MaskedLine>

        <MaskedLine active={inView} delay={0.24} className="mt-12 md:mt-16">
          <OutlineButton href="#overview" className="btn-outline--regal">
            Pre-order {PRODUCT_NAME}
          </OutlineButton>
        </MaskedLine>

        <MaskedLine active={inView} delay={0.32} className="mt-16 md:mt-24">
          <div className="ornament">
            <span className="ornament__mark" aria-hidden="true" />
          </div>
        </MaskedLine>
      </div>
    </section>
  );
}
