// Configuration constants — single source of truth for layout and motion.

/* Product */
export const PRODUCT_NAME = "Aurum Buds Pro";
export const TAGLINE = "Sound, in gold.";
export const TAGLINE_SUB =
  "Flagship wireless audio, re-engineered for a world that never stops.";

/* Frames */
export const FRAME_COUNT = 120;
export const FRAME_PATH = "/frames/frame_";
export const FRAME_PATH_MOBILE = "/frames-mobile/frame_";

/* Hero image */
export const HERO_IMAGE = "/hero.webp";

/* Smooth scroll */
export const LENIS_LERP = 0.08;
export const LENIS_DURATION = 1.4;
export const LENIS_OFFSET = -72;

/* Frame damping — heavy, liquid scrubbing */
export const FRAME_DAMPING = 0.07;

/* Breakpoints */
export const MOBILE_BREAKPOINT = 768;

/* Height of the scroll sequence, in viewport heights (see --sequence-height) */
export const SCROLL_HEIGHT_MULTIPLIER = 450;

/**
 * The share of the stage kept free for type. The product is drawn into the
 * remaining area, so a line of copy can never land on the earbuds.
 */
export const STAGE_BAND_DESKTOP = 0.3;
export const STAGE_BAND_MOBILE = 0.36;

/** The strip of the stage kept clear for the navigation bar. */
export const STAGE_TOP_DESKTOP = 76;
export const STAGE_TOP_MOBILE = 64;

/**
 * Where the product sits inside a frame, as a fraction of the frame height.
 * The widest extent is used so that the earbuds are never cropped, whatever
 * the frame does.
 */
export const FRAME_PRODUCT_TOP = 0.03;
export const FRAME_PRODUCT_BOTTOM = 0.94;

/* Motion */
export const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
export const EASE_CSS = "cubic-bezier(0.16, 1, 0.3, 1)";
export const REVEAL_DURATION = 1.2;
export const REVEAL_STAGGER = 0.08;

/* 360 turntable */
export const SPIN_FRAME_COUNT = 72;

/* Layout */
export const SIDE_MARGIN = "8vw";
