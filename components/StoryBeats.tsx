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

function BeatBlock({
  beat,
  progress,
  ready,
}: {
  beat: Beat;
  progress: MotionValue<number>;
  ready: boolean;
}) {
  const [start, end] = beat.range;
  const opacity = useTransform(
    progress,
    [start, start + 0.035, end - 0.035, end],
    [0, 1, 1, 0]
  );
  const revealed = useBeatReveal(opacity);
  const isRight = beat.align === "right";
  const { before, accent, after } = parseHeadline(beat.headline);

  return (
    <motion.div
      className={[
        "absolute inset-x-6 bottom-[7vh]",
        "md:inset-x-auto md:bottom-auto md:top-1/2 md:-translate-y-1/2",
        isRight ? "md:left-auto md:right-[8vw]" : "md:left-[8vw] md:right-auto",
      ].join(" ")}
      style={{ opacity }}
    >
      <div
        className={[
          "w-full md:w-[30ch]",
          isRight ? "md:ml-auto md:text-right" : "",
        ].join(" ")}
      >
        <Eyebrow
          chapter={beat.chapter}
          label={beat.label}
          align={beat.align}
          active={revealed}
        />

        <MaskedLine active={revealed} delay={0.08} className="mt-7 md:mt-9">
          <h2 className="headline headline--beat">
            {before}
            <em className="headline-italic-gold">{accent}</em>
            {after}
          </h2>
        </MaskedLine>

        <MaskedLine active={revealed} delay={0.16} className="mt-6 md:mt-7">
          <p className="body-text">{beat.body}</p>
        </MaskedLine>

        {beat.id === "experience" ? (
          <MaskedLine active={revealed} delay={0.24} className="mt-9 md:mt-11">
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
    <div className="pointer-events-none absolute inset-0">
      {/* Hero */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center px-[8vw]"
        style={{ opacity: heroOpacity }}
      >
        <div className="text-center">
          <MaskedLine active={ready} delay={0}>
            <h1 className="headline">{PRODUCT_NAME}</h1>
          </MaskedLine>
          <MaskedLine active={ready} delay={0.12} className="mt-6 md:mt-8">
            <p
              className="font-serif text-xl italic md:text-2xl"
              style={{ color: "var(--text-muted)" }}
            >
              {TAGLINE}
            </p>
          </MaskedLine>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 md:bottom-16">
          <motion.div
            className="h-12 w-px origin-top md:h-16"
            style={{ background: "var(--gold)", opacity: 0.5 }}
            initial={{ scaleY: 0 }}
            animate={ready ? { scaleY: 1 } : { scaleY: 0 }}
            transition={{ duration: 1.6, ease: EASE, delay: 0.5 }}
          />
        </div>
      </motion.div>

      {/* Chaptered beats */}
      {BEATS.map((beat) => (
        <BeatBlock key={beat.id} beat={beat} progress={progress} ready={ready} />
      ))}
    </div>
  );
}
