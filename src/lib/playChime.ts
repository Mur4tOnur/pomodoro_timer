"use client";

export type AlarmKind = "ding" | "soft" | "bell";

export async function playChime(kind: AlarmKind = "ding"): Promise<void> {
  const AudioContextClass =
    typeof window !== "undefined"
      ? window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext
      : undefined;

  if (!AudioContextClass) return;

  const ctx = new AudioContextClass();
  if (ctx.state === "suspended") {
    await ctx.resume().catch(() => undefined);
  }

  const now = ctx.currentTime;

  const beep = (freq: number, start: number, dur: number, vol: number) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = kind === "soft" ? "triangle" : "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(vol, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + dur + 0.05);
  };

  if (kind === "bell") {
    beep(784, now, 0.22, 0.18);
    beep(1046, now + 0.18, 0.28, 0.16);
  } else if (kind === "soft") {
    beep(520, now, 0.45, 0.12);
  } else {
    beep(880, now, 0.35, 0.2);
  }

  window.setTimeout(() => {
    void ctx.close();
  }, 900);
}
