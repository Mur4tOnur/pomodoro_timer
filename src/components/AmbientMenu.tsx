"use client";

import { AMBIENT_PRESETS, type AmbientId } from "@/lib/ambientPresets";
import { useEffect } from "react";

type Props = {
  open: boolean;
  anchorRect: DOMRect | null;
  activeId: AmbientId;
  volume: number;
  onClose: () => void;
  onSelect: (id: AmbientId) => void;
  onVolumeChange: (value: number) => void;
};

export function AmbientMenu({
  open,
  anchorRect,
  activeId,
  volume,
  onClose,
  onSelect,
  onVolumeChange,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const onPointer = (e: MouseEvent | PointerEvent) => {
      const t = e.target as Node;
      const menu = document.getElementById("ambient-menu-panel");
      if (menu?.contains(t)) return;
      const anchor = document.getElementById("ambient-menu-anchor");
      if (anchor?.contains(t)) return;
      onClose();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer, true);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer, true);
    };
  }, [open, onClose]);

  if (!open || !anchorRect) return null;

  const vw = typeof window !== "undefined" ? window.innerWidth : 400;
  const width = 288;
  let left = anchorRect.left + anchorRect.width / 2 - width / 2;
  left = Math.max(12, Math.min(left, vw - width - 12));
  const top = Math.min(
    anchorRect.bottom + 10,
    (typeof window !== "undefined" ? window.innerHeight : 800) - 420,
  );

  return (
    <div
      id="ambient-menu-panel"
      className="glass-panel fixed z-[60] max-h-[min(70vh,420px)] w-72 overflow-hidden rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
      style={{ left, top }}
      role="menu"
      aria-label="Ambient sound menu"
    >
      <div className="border-b border-white/10 px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-zinc-400">
          Ambient
        </p>
        <p className="mt-1 text-sm text-white/85">Lofi soundscapes</p>
      </div>

      <ul className="max-h-[220px] space-y-0.5 overflow-y-auto px-2 py-2">
        {AMBIENT_PRESETS.map((p) => {
          const active = p.id === activeId;
          return (
            <li key={p.id}>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  onSelect(p.id);
                  onClose();
                }}
                className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                  active
                    ? "bg-white/12 text-white ring-1 ring-cyan-300/35"
                    : "text-white/85 hover:bg-white/6"
                }`}
              >
                <span className="text-white/40" aria-hidden>
                  {active ? "●" : "○"}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium">{p.label}</span>
                  <span className="block text-xs text-white/45">
                    {p.description}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="border-t border-white/10 px-4 py-3">
        <div className="flex items-center justify-between text-xs text-white/55">
          <span>Bed volume</span>
          <span className="tabular-nums text-white/80">
            {Math.round(volume * 100)}%
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(volume * 100)}
          onChange={(e) => onVolumeChange(Number(e.target.value) / 100)}
          className="mt-2 w-full accent-cyan-300"
          aria-label="Ambient volume"
        />
      </div>
    </div>
  );
}
