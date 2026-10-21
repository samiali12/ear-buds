// Motion constants for luxury depth and 3D feel effects.
// All timing uses cubic-bezier(0.16, 1, 0.3, 1) unless otherwise noted.

/* ==========================================================================
   EASING
   ========================================================================== */

/** Luxurious, slow easing for all 3D effects */
export const EASE_LUXURY: [number, number, number, number] = [0.16, 1, 0.3, 1];
export const EASE_LUXURY_CSS = "cubic-bezier(0.16, 1, 0.3, 1)";
export const EASE_LUXURY_EASE = [0.16, 1, 0.3, 1];

/* ==========================================================================
   VIRTUAL CAMERA
   ========================================================================== */

/** Perspective depth for the 3D canvas container */
export const CAMERA_PERSPECTIVE = 1200;

/** Scale range for the virtual camera */
export const CAMERA_SCALE_START = 1;
export const CAMERA_SCALE_PEAK = 1.12;
export const CAMERA_SCALE_END = 1;

/** Rotation ranges */
export const CAMERA_ROTATE_Y_START = -4;
export const CAMERA_ROTATE_Y_END = 4;
export const CAMERA_ROTATE_X_START = 2;
export const CAMERA_ROTATE_X_END = -2;

/** Translate drift */
export const CAMERA_TRANSLATE_Y_DRIFT = 24;

/** Progress points for camera keyframes */
export const CAMERA_PEAK_PROGRESS = 0.5;

/* ==========================================================================
   LAYERED PARALLAX
   ========================================================================== */

/** Depth multipliers for different layers */
export const PARALLAX_FAR_GLOW = 0.3;
export const PARALLAX_CANVAS = 1;
export const PARALLAX_FLOOR_REFLECTION = 1.2;
export const PARALLAX_FOREGROUND_PARTICLES = 2;
export const PARALLAX_TEXT_BLOCKS = 0.5;

/** Max offset in pixels */
export const PARALLAX_MAX_OFFSET = 18;

/** Spring physics for parallax */
export const PARALLAX_SPRING_STIFFNESS = 80;
export const PARALLAX_SPRING_DAMPING = 20;

/* ==========================================================================
   GROUNDING
   ========================================================================== */

/** Contact shadow - stronger when assembled, almost gone at exploded peak */
export const SHADOW_OPACITY_ASSEMBLED = 0.35;
export const SHADOW_OPACITY_EXPLODED = 0.08;

/** Shadow size */
export const SHADOW_WIDTH = "60%";
export const SHADOW_HEIGHT = "20px";
export const SHADOW_BLUR = "40px";

/** Floor reflection */
export const REFLECTION_OPACITY = 0.12;
export const REFLECTION_BLUR = 2;
export const REFLECTION_OFFSET_Y = 8;

/* ==========================================================================
   LIGHT SWEEP
   ========================================================================== */

/** Light sweep progress ranges */
export const LIGHT_SWEEP_FIRST_START = 0.15;
export const LIGHT_SWEEP_FIRST_END = 0.30;
export const LIGHT_SWEEP_SECOND_START = 0.88;
export const LIGHT_SWEEP_SECOND_END = 0.98;

/** Light band opacity */
export const LIGHT_SWEEP_OPACITY = 0.10;

/* ==========================================================================
   DEPTH OF FIELD
   ========================================================================== */

/** Bokeh circles configuration */
export const BOKEH_COUNT = 10;
export const BOKEH_MIN_SIZE = 8;
export const BOKEH_MAX_SIZE = 12;
export const BOKEH_MIN_BLUR = 12;
export const BOKEH_MAX_BLUR = 24;
export const BOKEH_MIN_OPACITY = 0.05;
export const BOKEH_MAX_OPACITY = 0.12;
export const BOKEH_PARALLAX_MULTIPLIER = 2;

/** Vignette blur increase at exploded peak */
export const VIGNETTE_BLUR_INTENSITY = 0.15;
export const VIGNETTE_BLUR_PEAK = 0.5;

/* ==========================================================================
   PERSPECTIVE TEXT
   ========================================================================== */

/** Text entry/exit 3D transforms */
export const TEXT_ROTATE_Y_ENTER = 12;
export const TEXT_TRANSLATE_Z_ENTER = -80;
export const TEXT_ROTATE_Y_EXIT = -12;
export const TEXT_TRANSLATE_Z_EXIT = -40;

/* ==========================================================================
   360 TURNTABLE
   ========================================================================== */

/** Spin frame count - should match config.ts if present */
export const SPIN_FRAME_COUNT = 72;

/** Turntable timing */
export const TURNTABLE_IDLE_TIMEOUT = 2000;
export const TURNTABLE_AUTO_ROTATE_SPEED = 0.5;
export const TURNTABLE_VELOCITY_DECAY = 0.95;
export const TURNTABLE_MIN_VELOCITY = 0.1;

/** Touch/pointer handling */
export const TURNTABLE_ENABLE_TOUCH = true;