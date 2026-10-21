"use client";

import { useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { BEATS, parseHeadline, type Beat } from "@/lib/story";
import { PRODUCT_NAME, TAGLINE, EASE } from "@/lib/config";
import { MaskedLine } from "./Reveal";
import Eyebrow from "./Eyebrow";
import OutlineButton from "./Button";

/**
 * The masked reveal starts once the beat is genuinely on screen and resets
 * only when it has faded out of sight.
 */
function useBeatReveal(opacity: MotionValue<number>) {
  const [revealed, setRevealed] = useState(false);
  const flag = useRef(false);

  useMotionValueEvent(opacity, "change", (value) => {
    const visible = value > 0.02;
    if (visible === flag.current) return;
    flag.current = visible;
    setRevealed(visible);
  });

  return revealed;
}

function BeatBlock({ beat, progress }: { beat: Beat; progress: MotionValue<number> }) {
  const [start, end] = beat.range;
  const opacity = useTransform(
    progress,
    [start, start + 0.03, end - 0.03, end],
    [0, 1, 1, 0]
  );

  const revealed = useBeatReveal(opacity);
  const isRight = beat.align === "right";
  const { before, accent, after } = parseHeadline(beat.headline);

  return (
    <motion.div
      className={[
        "absolute inset-0 flex flex-col justify-end",
        "px-[max(24px,env(safe-area-inset-left))]",
        "pb-[max(20px,env(safe-area-inset-bottom))]",
        "md:px-[8vw] md:pb-12",
      ].join(" ")}
      style={{ opacity }}
    >
      <div
        className={[
          "w-full",
          isRight
            ? "md:ml-auto md:max-w-[34ch] md:text-right"
            : "md:max-w-[34ch]",
        ].join(" ")}
      >
        <Eyebrow
          chapter={beat.chapter}
          label={beat.label}
          align={beat.align}
          active={revealed}
        />

        <MaskedLine active={revealed} delay={0.08} className="mt-5 md:mt-7">
          <h2 className="headline headline--beat">
            {before}
            <em className="headline-italic-gold">{accent}</em>
            {after}
          </h2>
        </MaskedLine>

        <MaskedLine active={revealed} delay={0.16} className="mt-4 md:mt-5">
          <p className="body-text">{beat.body}</p>
        </MaskedLine>

        {beat.id === "experience" ? (
          <MaskedLine active={revealed} delay={0.24} className="mt-6 md:mt-8">
            <div className="pointer-events-auto">
              <OutlineButton href="#buy" size="sm">
                Pre-order {PRODUCT_NAME}
              </OutlineButton>
            </div>
          </MaskedLine>
        ) : null}
      </div>
    </motion.div>
  );
}

export default function StoryBeats({
  progress,
  ready,
}: {
  progress: MotionValue<number>;
  ready: boolean;
}) {
  const heroOpacity = useTransform(progress, [0, 0.07, 0.11], [1, 1, 0]);

  return (
    /*
     * The type band. It is a sibling of the stage, holds no transform, and
     * is the topmost layer of the sequence, so every glyph is crisp and no
     * copy ever crosses the product.
     */
    <div className="type-band z-20">
      {/* Hero */}
      <motion.div
        className="absolute inset-0 flex flex-col justify-end px-[max(24px,env(safe-area-inset-left))] pb-[max(20px,env(safe-area-inset-bottom))] md:px-[8vw] md:pb-12"
        style={{ opacity: heroOpacity }}
      >
        <div className="text-left">
          <MaskedLine active={ready} delay={0}>
            <h1 className="headline">{PRODUCT_NAME}</h1>
          </MaskedLine>
          <MaskedLine active={ready} delay={0.12} className="mt-4 md:mt-5">
            <p
              className="font-serif text-lg italic md:text-xl"
              style={{ color: "var(--text-muted)" }}
            >
              {TAGLINE}
            </p>
          </MaskedLine>
        </div>

        {/* Scroll indicator */}
        <div className="pointer-events-none absolute bottom-6 left-1/2 hidden -translate-x-1/2 md:block">
          <motion.div
            className="h-14 w-px origin-top"
            style={{ background: "var(--gold)", opacity: 0.5 }}
            initial={{ scaleY: 0 }}
            animate={ready ? { scaleY: 1 } : { scaleY: 0 }}
            transition={{ duration: 1.6, ease: EASE, delay: 0.5 }}
          />
        </div>
      </motion.div>

      {/* Chaptered beats */}
      {BEATS.map((beat) => (
        <BeatBlock key={beat.id} beat={beat} progress={progress} />
      ))}
    </div>
  );
}
