"use client";

import type { AmbientId } from "./ambientPresets";

type Nodes = {
  disconnect: () => void;
};

let sharedCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let activeNodes: Nodes | null = null;
let chirpTimer: ReturnType<typeof setInterval> | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  if (!sharedCtx || sharedCtx.state === "closed") {
    sharedCtx = new Ctx();
    masterGain = sharedCtx.createGain();
    masterGain.gain.value = 0.35;
    masterGain.connect(sharedCtx.destination);
  }
  return sharedCtx;
}

function makeNoiseBuffer(ctx: AudioContext, lengthSec: number): AudioBuffer {
  const buffer = ctx.createBuffer(1, ctx.sampleRate * lengthSec, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

function connectBed(
  ctx: AudioContext,
  create: (destination: AudioNode) => void,
): Nodes {
  const sub = ctx.createGain();
  sub.gain.value = 1;
  if (!masterGain) {
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.35;
    masterGain.connect(ctx.destination);
  }
  sub.connect(masterGain);
  create(sub);
  return {
    disconnect: () => {
      try {
        sub.disconnect();
      } catch {
        /* ignore */
      }
    },
  };
}

function startRain(ctx: AudioContext): Nodes {
  const buffer = makeNoiseBuffer(ctx, 2);
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  src.loop = true;
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 900;
  const gain = ctx.createGain();
  gain.gain.value = 0.45;
  return connectBed(ctx, (dest) => {
    src.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    src.start();
  });
}

function startFireplace(ctx: AudioContext): Nodes {
  const buffer = makeNoiseBuffer(ctx, 2);
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  src.loop = true;
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 320;
  filter.Q.value = 0.7;
  const gain = ctx.createGain();
  gain.gain.value = 0.35;
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.frequency.value = 3.2;
  lfoGain.gain.value = 0.08;
  lfo.connect(lfoGain);
  lfoGain.connect(gain.gain);
  lfo.start();
  return connectBed(ctx, (dest) => {
    src.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    src.start();
  });
}

function startBeach(ctx: AudioContext): Nodes {
  const buffer = makeNoiseBuffer(ctx, 3);
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  src.loop = true;
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 400;
  const lfo = ctx.createOscillator();
  lfo.type = "sine";
  lfo.frequency.value = 0.12;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 350;
  lfo.connect(lfoGain);
  lfoGain.connect(filter.frequency);
  lfo.start();
  const gain = ctx.createGain();
  gain.gain.value = 0.4;
  return connectBed(ctx, (dest) => {
    src.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    src.start();
  });
}

function startTavern(ctx: AudioContext): Nodes {
  const hum = ctx.createOscillator();
  hum.type = "sine";
  hum.frequency.value = 58;
  const humGain = ctx.createGain();
  humGain.gain.value = 0.04;
  const buffer = makeNoiseBuffer(ctx, 2);
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  src.loop = true;
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 700;
  const noiseGain = ctx.createGain();
  noiseGain.gain.value = 0.12;
  return connectBed(ctx, (dest) => {
    hum.connect(humGain);
    humGain.connect(dest);
    hum.start();
    src.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(dest);
    src.start();
  });
}

function startForest(ctx: AudioContext): Nodes {
  const buffer = makeNoiseBuffer(ctx, 3);
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  src.loop = true;
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 1800;
  const gain = ctx.createGain();
  gain.gain.value = 0.12;
  const nodes = connectBed(ctx, (dest) => {
    src.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    src.start();
  });

  const playChirp = () => {
    if (!masterGain) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    const t = ctx.currentTime;
    o.type = "sine";
    o.frequency.setValueAtTime(1800 + Math.random() * 1200, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.04, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
    o.connect(g);
    g.connect(masterGain);
    o.start(t);
    o.stop(t + 0.2);
  };

  chirpTimer = setInterval(() => {
    if (Math.random() > 0.55) playChirp();
  }, 900);

  const prevDisconnect = nodes.disconnect.bind(nodes);
  nodes.disconnect = () => {
    if (chirpTimer) {
      clearInterval(chirpTimer);
      chirpTimer = null;
    }
    prevDisconnect();
  };

  return nodes;
}

export async function resumeAmbientContext(): Promise<void> {
  const ctx = getContext();
  if (!ctx) return;
  if (ctx.state === "suspended") {
    await ctx.resume().catch(() => undefined);
  }
}

export function setAmbientMasterVolume(linear: number): void {
  const v = Math.min(1, Math.max(0, linear));
  if (masterGain) {
    masterGain.gain.value = v;
  }
}

export function setAmbientPreset(id: AmbientId): void {
  const ctx = getContext();
  if (!ctx || !masterGain) return;

  if (activeNodes) {
    activeNodes.disconnect();
    activeNodes = null;
  }
  if (chirpTimer) {
    clearInterval(chirpTimer);
    chirpTimer = null;
  }

  if (id === "none") return;

  switch (id) {
    case "rain":
      activeNodes = startRain(ctx);
      break;
    case "fireplace":
      activeNodes = startFireplace(ctx);
      break;
    case "beach":
      activeNodes = startBeach(ctx);
      break;
    case "tavern":
      activeNodes = startTavern(ctx);
      break;
    case "forest":
      activeNodes = startForest(ctx);
      break;
    default:
      break;
  }
}

export function teardownAmbient(): void {
  if (activeNodes) {
    activeNodes.disconnect();
    activeNodes = null;
  }
  if (chirpTimer) {
    clearInterval(chirpTimer);
    chirpTimer = null;
  }
  if (sharedCtx && sharedCtx.state !== "closed") {
    void sharedCtx.close();
  }
  sharedCtx = null;
  masterGain = null;
}
