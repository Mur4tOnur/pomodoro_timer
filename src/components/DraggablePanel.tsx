"use client";

import {
  useCallback,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from "react";

type Props = {
  children: ReactNode;
  className?: string;
  initialOffset?: { x: number; y: number };
  /** When false, panel is not positioned for dragging (use fixed stack layout from parent). */
  draggable?: boolean;
};

export function DraggablePanel({
  children,
  className = "",
  initialOffset = { x: 0, y: 0 },
  draggable = true,
}: Props) {
  const [pos, setPos] = useState(initialOffset);
  const drag = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!draggable || e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      originX: pos.x,
      originY: pos.y,
    };
  };

  const endDrag = useCallback((e: PointerEvent<HTMLDivElement>) => {
    if (!drag.current || e.pointerId !== drag.current.pointerId) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    drag.current = null;
  }, []);

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!draggable || !drag.current || e.pointerId !== drag.current.pointerId)
      return;
    const w = window.innerWidth || 1;
    const h = window.innerHeight || 1;
    const dx = ((e.clientX - drag.current.startX) / w) * 100;
    const dy = ((e.clientY - drag.current.startY) / h) * 100;
    setPos({
      x: drag.current.originX + dx,
      y: drag.current.originY + dy,
    });
  };

  if (!draggable) {
    return (
      <div className={`relative z-20 mx-auto w-full max-w-[380px] ${className}`}>
        <div className="rounded-3xl">{children}</div>
      </div>
    );
  }

  return (
    <div
      className={`pointer-events-none fixed z-20 w-[min(92vw,380px)] ${className}`}
      style={{
        left: "50%",
        top: "50%",
        transform: `translate(calc(-50% + ${pos.x}vw), calc(-50% + ${pos.y}vh))`,
      }}
    >
      <div className="pointer-events-auto rounded-3xl">
        <div
          role="presentation"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          className="group touch-none select-none rounded-t-3xl px-4 pb-2 pt-3"
        >
          <div
            className="mx-auto h-1 w-12 rounded-full bg-white/25"
            aria-hidden
          />
          <p className="drag-hint" aria-hidden>
            Drag
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
