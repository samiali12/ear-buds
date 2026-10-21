// Story beats — the editorial script carried by the scroll sequence.
// A beat is a headline plus at most one short sentence.

export type BeatAlign = "left" | "right";

export interface Beat {
  id: string;
  /** Chapter marker, e.g. "01 / 05" */
  chapter: string;
  /** Eyebrow label, e.g. "Engineering" */
  label: string;
  /** Headline; the word wrapped in asterisks is the single italic accent */
  headline: string;
  /** One short sentence, sixteen words at most */
  body: string;
  /** Which edge the block sits against */
  align: BeatAlign;
  /** Scroll-progress window in which the beat is on screen */
  range: [number, number];
}

export const BEATS: Beat[] = [
  {
    id: "engineering",
    chapter: "01 / 05",
    label: "Engineering",
    headline: "Precision for *silence*.",
    body: "Sealed chambers and custom drivers hold studio-grade clarity.",
    align: "left",
    range: [0.1, 0.26],
  },
  {
    id: "technology",
    chapter: "02 / 05",
    label: "Technology",
    headline: "Sound that *adapts*.",
    body: "A microphone array reads the room in real time.",
    align: "right",
    range: [0.28, 0.44],
  },
  {
    id: "sound",
    chapter: "03 / 05",
    label: "Sound",
    headline: "Every *note*, alive.",
    body: "Hi-res drivers reveal detail in every track.",
    align: "left",
    range: [0.46, 0.62],
  },
  {
    id: "craft",
    chapter: "04 / 05",
    label: "Craft",
    headline: "Made to *endure*.",
    body: "Machined aluminium, weighted to sit lightly in the hand.",
    align: "right",
    range: [0.64, 0.8],
  },
  {
    id: "experience",
    chapter: "05 / 05",
    label: "Experience",
    headline: "Hear everything. *Feel* nothing else.",
    body: "Designed for focus, crafted for comfort.",
    align: "left",
    range: [0.82, 1],
  },
];

/** Splits "Precision for *silence*." into its parts. */
export function parseHeadline(headline: string) {
  const [before = "", accent = "", after = ""] = headline.split("*");
  return { before, accent, after };
}
