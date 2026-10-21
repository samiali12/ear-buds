// Product specifications - edit these values

export interface Spec {
  label: string;
  value: string;
}

export const SPECS: Spec[] = [
  { label: "Driver", value: "10mm custom dynamic drivers" },
  { label: "Battery", value: "Up to 8 hours (32 hours with case)" },
  { label: "ANC", value: "Adaptive -35dB noise reduction" },
  { label: "Connectivity", value: "Bluetooth 5.3, multipoint" },
  { label: "Water resistance", value: "IPX4 rated" },
  { label: "Weight", value: "5.4g per earbud (case: 42g)" },
  { label: "Case", value: "Wireless charging, USB-C" },
  { label: "Codecs", value: "LDAC, aptX Adaptive, AAC, SBC" },
];

export interface Feature {
  title: string;
  description: string;
}

export const FEATURES: Feature[] = [
  {
    title: "Adaptive ANC",
    description: "Cancellation that reads the room in real time.",
  },
  {
    title: "Multi-mic Clarity",
    description: "Six microphones hold your voice steady in traffic.",
  },
  {
    title: "Hi-res Drivers",
    description: "Custom 10mm drivers for detail and depth.",
  },
  {
    title: "All-day Battery",
    description: "Eight hours per charge, thirty-two with the case.",
  },
  {
    title: "Secure Comfort Fit",
    description: "Weighted to sit lightly, sealed to sit quietly.",
  },
  {
    title: "Seamless Pairing",
    description: "Two devices, one continuous conversation.",
  },
];
