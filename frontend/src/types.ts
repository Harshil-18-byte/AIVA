export interface Asset {
  id: string;
  name: string;
  type: "video" | "audio" | "image" | "transition" | "effect";
  path: string;
  duration?: string;
  resolution?: string;
  color?: string;
  scene?: string;
  take?: string;
  reel?: string;
  lens?: string;
  camera?: string;
  codec?: string;
  colorspace?: string;
}

export interface Clip {
  id: string;
  name: string;
  path: string;
  start: number;
  width: number;
  color: string;
  type?: "video" | "audio" | "image" | "transition" | "effect";
  scale?: number;
  posX?: number;
  posY?: number;
  opacity?: number;
  volume?: number;
  enabled?: boolean; // For disabling effects/nodes
  // Color Grading Engine
  lift?: { r: number, g: number, b: number };
  gamma?: { r: number, g: number, b: number };
  gain?: { r: number, g: number, b: number };
  saturation?: number;
  contrast?: number;
  temperature?: number;
  tint?: number;
  // Metadata
  scene?: string;
  take?: string;
  reel?: string;
  transcription?: string;
}

export interface Track {
  id: string;
  clips: Clip[];
}
