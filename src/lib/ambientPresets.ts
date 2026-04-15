export type AmbientId =
  | "none"
  | "fireplace"
  | "rain"
  | "beach"
  | "tavern"
  | "forest";

export type AmbientPreset = {
  id: AmbientId;
  label: string;
  description: string;
  /** Tailwind gradient classes for the page backdrop */
  gradient: string;
};

export const AMBIENT_PRESETS: AmbientPreset[] = [
  {
    id: "none",
    label: "Silence",
    description: "No ambient bed",
    gradient: "from-zinc-950 via-zinc-900 to-black",
  },
  {
    id: "fireplace",
    label: "Fireplace",
    description: "Warm crackle and low air",
    gradient: "from-stone-950 via-amber-950/40 to-black",
  },
  {
    id: "rain",
    label: "Rain",
    description: "Steady rainfall on glass",
    gradient: "from-slate-950 via-slate-800 to-zinc-950",
  },
  {
    id: "beach",
    label: "Seaside",
    description: "Surf and open air",
    gradient: "from-sky-950/80 via-cyan-950/50 to-zinc-950",
  },
  {
    id: "tavern",
    label: "Tavern",
    description: "Low room hum and murmur",
    gradient: "from-amber-950/60 via-orange-950/40 to-zinc-950",
  },
  {
    id: "forest",
    label: "Forest birds",
    description: "Trees, breeze, distant chirps",
    gradient: "from-emerald-950/70 via-green-950/40 to-zinc-950",
  },
];
