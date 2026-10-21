// The Technology section in three dimensions.
//
// Every feature in the list maps to a PartSpec. The `mesh` field is the name
// of the node that carries that part, both in the GLB model at
// /models/earbud.glb and in the primitive build that stands in for it.

export interface PartSpec {
  /** The feature title this part presents (matches lib/specs.ts) */
  feature: string;
  /** Named node inside the model */
  mesh: string;
  /** Short part label shown beneath the list */
  label: string;
  /** Resting orientation of the earbud when this part is presented */
  rotation: [number, number, number];
  /** Direction the part travels when it is presented */
  explode: [number, number, number];
  /** When true the part is only shown while it is the presented one */
  reveal?: boolean;
}

export const TECH_PARTS: PartSpec[] = [
  {
    feature: "Adaptive ANC",
    mesh: "NoiseControl",
    label: "Noise control",
    rotation: [-0.16, -0.62, 0.12],
    explode: [-0.85, -0.4, 0.5],
  },
  {
    feature: "Multi-mic Clarity",
    mesh: "MicArray",
    label: "Microphone array",
    rotation: [-0.34, 0.52, -0.1],
    explode: [0, -0.55, -0.85],
  },
  {
    feature: "Hi-res Drivers",
    mesh: "Driver",
    label: "10mm driver",
    rotation: [0.04, 0.18, 0],
    explode: [0, 0.1, 1],
  },
  {
    feature: "All-day Battery",
    mesh: "Cell",
    label: "Cell",
    rotation: [-0.22, 0.92, 0.16],
    explode: [0, -1, 0],
  },
  {
    feature: "Secure Comfort Fit",
    mesh: "Tip",
    label: "Silicone tip",
    rotation: [0.12, -0.26, 0],
    explode: [0, 0, 1.15],
  },
  {
    feature: "Seamless Pairing",
    mesh: "Chip",
    label: "Radio",
    rotation: [-0.3, 0.72, 0.22],
    explode: [0.85, -0.35, 0.45],
  },
];

/**
 * The measurements. Each specification in lib/specs.ts is presented by the
 * part of the product that answers it.
 */
export const SPEC_PARTS: PartSpec[] = [
  {
    feature: "Driver",
    mesh: "Driver",
    label: "10mm dynamic",
    rotation: [0.02, 0.14, 0],
    explode: [0, 0.08, 1],
  },
  {
    feature: "Battery",
    mesh: "Cell",
    label: "Cell",
    rotation: [-0.2, 0.86, 0.16],
    explode: [0, -1, 0],
  },
  {
    feature: "ANC",
    mesh: "NoiseControl",
    label: "Adaptive cancellation",
    rotation: [-0.16, -0.66, 0.12],
    explode: [-0.85, -0.4, 0.5],
  },
  {
    feature: "Connectivity",
    mesh: "Chip",
    label: "Bluetooth 5.3",
    rotation: [-0.3, 0.72, 0.22],
    explode: [0.85, -0.35, 0.45],
  },
  {
    feature: "Water resistance",
    mesh: "Seal",
    label: "IPX4 seal",
    rotation: [0.24, -0.3, 0.06],
    explode: [0, -0.1, 1.1],
  },
  {
    feature: "Weight",
    mesh: "Shell",
    label: "5.4g shell",
    rotation: [-0.08, 0.42, 0.04],
    explode: [0, 0, 0],
  },
  {
    feature: "Case",
    mesh: "Case",
    label: "Charging case",
    rotation: [0.12, -0.5, 0],
    explode: [0, 0, 0],
    reveal: true,
  },
  {
    feature: "Codecs",
    mesh: "Codec",
    label: "Codec board",
    rotation: [-0.22, 0.98, 0.2],
    explode: [0.6, -0.7, 0.3],
  },
];

/** Every part the model knows about, technology and measurements combined. */
export const ALL_PARTS: PartSpec[] = [...TECH_PARTS, ...SPEC_PARTS];

/** The GLB that replaces the primitive build when it is present. */
export const MODEL_URL = "/models/earbud.glb";

export const TECH3D = {
  /** Camera */
  fov: 30,
  cameraZ: 6.4,

  /** Slow idle turn of the model, radians per second */
  spin: 0.16,

  /** Frame-rate independent damping for every transition */
  damping: 3.4,

  /** How far a presented part travels out of the shell */
  explodeDistance: 0.92,

  /** Model scale */
  scale: 1.1,
};
