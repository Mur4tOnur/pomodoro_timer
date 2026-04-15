"use client";

import type { usePomodoroTimer } from "@/hooks/usePomodoroTimer";
import { useId } from "react";

type Timer = ReturnType<typeof usePomodoroTimer>;

type Props = {
  timer: Timer;
  onUserGesture?: () => void;
  onAmbientMenuOpen: (anchor: DOMRect) => void;
};

function formatClock(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

export function TimerWidget({
  timer,
  onUserGesture,
  onAmbientMenuOpen,
}: Props) {
  const uid = useId().replace(/:/g, "");
  const gradId = `accent-${uid}`;
  const glowId = `glow-${uid}`;
  const size = 220;
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = c * (1 - timer.progress);
  const angle = -Math.PI / 2 + timer.progress * 2 * Math.PI;
  const dotX = size / 2 + r * Math.cos(angle);
  const dotY = size / 2 + r * Math.sin(angle);
  const cycleDots = 4;
  const filled = timer.completedSessions % cycleDots;

  return (
    <div className="glass-panel rounded-3xl px-5 pb-6 pt-0 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
      <div className="text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-zinc-300">
          Focus
        </p>
      </div>

      <div
        className="relative mx-auto mt-4 grid max-w-[220px] place-items-center"
        style={{ width: size, height: size }}
      >
        <svg
          width={size}
          height={size}
          className="-rotate-90"
          aria-hidden
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#a5f3fc" />
            </linearGradient>
            <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${c} ${c}`}
            strokeDashoffset={dash}
            className="transition-[stroke-dashoffset] duration-150 ease-linear"
          />
          <circle
            cx={dotX}
            cy={dotY}
            r={5}
            fill="#ecfeff"
            stroke="rgba(34,211,238,0.9)"
            strokeWidth={2}
            filter={`url(#${glowId})`}
            className="pointer-events-none"
          />
        </svg>
        <div className="pointer-events-none absolute inset-0 grid place-items-center px-3">
          <p className="text-center text-[2.125rem] font-semibold tabular-nums leading-none tracking-tight text-white sm:text-[2.375rem]">
            {formatClock(timer.displayMs)}
          </p>
        </div>
      </div>

      <div
        className="mt-3 flex justify-center gap-2"
        role="presentation"
        aria-label="Session progress"
      >
        {Array.from({ length: cycleDots }, (_, i) => (
          <span
            key={i}
            className={`h-1.5 w-1.5 rounded-full ${
              i < filled ? "bg-white" : "bg-white/25"
            }`}
          />
        ))}
      </div>

      <p className="mt-3 text-center text-xs text-white/55">
        Sessions completed:{" "}
        <span className="font-semibold text-white/90">
          {timer.completedSessions}
        </span>
      </p>

      <div className="mt-5 flex items-center justify-between px-1">
        <button
          type="button"
          onClick={() => {
            onUserGesture?.();
            timer.reset();
          }}
          className="icon-btn"
          aria-label="Reset timer"
          title="Reset"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 9.75V6m0 0h3.75M4.5 6l3 2.25M19.5 14.25V18m0 0h-3.75M19.5 18l-3-2.25M16.5 5.25a7.5 7.5 0 10 2.25 6.03"
            />
          </svg>
        </button>

        <button
          type="button"
          onClick={() => {
            onUserGesture?.();
            timer.toggle();
          }}
          className="icon-btn h-12 w-12 border-white/20 bg-white/10"
          aria-label={timer.running ? "Pause" : "Start"}
          title={timer.running ? "Pause" : "Start"}
        >
          {timer.running ? (
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6"
              fill="currentColor"
              aria-hidden
            >
              <path d="M8 5h3v14H8V5zm5 0h3v14h-3V5z" />
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6"
              fill="currentColor"
              aria-hidden
            >
              <path d="M8 5v14l11-7L8 5z" />
            </svg>
          )}
        </button>

        <button
          id="ambient-menu-anchor"
          type="button"
          onClick={(e) => {
            onUserGesture?.();
            onAmbientMenuOpen(
              (e.currentTarget as HTMLButtonElement).getBoundingClientRect(),
            );
          }}
          className="icon-btn"
          aria-label="Open ambient menu"
          title="Ambient menu"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.281Z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
