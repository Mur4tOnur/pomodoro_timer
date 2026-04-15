"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

type Props<T> = {
  open: boolean;
  anchorRect: DOMRect | null;
  options: readonly T[];
  value: T;
  onSelect: (value: T) => void;
  onClose: () => void;
  formatOption: (value: T) => string;
  title: string;
  menuId: string;
};

export function OptionMenu<T>({
  open,
  anchorRect,
  options,
  value,
  onSelect,
  onClose,
  formatOption,
  title,
  menuId,
}: Props<T>) {
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);

    let removed = false;
    const removePointer = () => {
      if (removed) return;
      removed = true;
      document.removeEventListener("pointerdown", onPointer, true);
    };

    const onPointer = (e: PointerEvent) => {
      const t = e.target as Node;
      const el = t instanceof Element ? t : null;
      if (el?.closest?.("[data-session-menu-row]")) return;
      const panel = document.getElementById(menuId);
      if (panel?.contains(t)) return;
      onClose();
    };

    const frame = requestAnimationFrame(() => {
      document.addEventListener("pointerdown", onPointer, true);
    });

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKey);
      removePointer();
    };
  }, [open, onClose, menuId]);

  if (
    typeof document === "undefined" ||
    !open ||
    !anchorRect
  ) {
    return null;
  }

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const width = Math.min(280, vw - 24);
  let left = anchorRect.left + anchorRect.width / 2 - width / 2;
  left = Math.max(12, Math.min(left, vw - width - 12));
  const estimatedH = Math.min(280, vh * 0.5);
  let top = anchorRect.bottom + 8;
  if (top + estimatedH > vh - 12) {
    top = Math.max(12, anchorRect.top - estimatedH - 8);
  }

  const menu = (
    <div
      id={menuId}
      className="glass-panel fixed z-[10000] max-h-[min(50vh,280px)] overflow-hidden rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
      style={{ left, top, width }}
      role="listbox"
      aria-label={title}
    >
      <p className="border-b border-white/10 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-zinc-500">
        {title}
      </p>
      <ul className="max-h-[220px] overflow-y-auto py-1">
        {options.map((opt) => {
          const active = opt === value;
          return (
            <li key={String(opt)}>
              <button
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  onSelect(opt);
                  onClose();
                }}
                className={`flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm transition ${
                  active
                    ? "bg-white/12 text-white ring-1 ring-cyan-300/30"
                    : "text-white/85 hover:bg-white/6"
                }`}
              >
                <span className="text-white/40" aria-hidden>
                  {active ? "●" : "○"}
                </span>
                <span className="font-medium">{formatOption(opt)}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );

  return createPortal(menu, document.body);
}
