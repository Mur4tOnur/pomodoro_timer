"use client";

import { AmbientMenu } from "@/components/AmbientMenu";
import { DraggablePanel } from "@/components/DraggablePanel";
import { SettingsPanel } from "@/components/SettingsPanel";
import { TimerWidget } from "@/components/TimerWidget";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { usePomodoroTimer } from "@/hooks/usePomodoroTimer";
import {
  resumeAmbientContext,
  setAmbientMasterVolume,
  setAmbientPreset,
  teardownAmbient,
} from "@/lib/ambientEngine";
import { AMBIENT_PRESETS, type AmbientId } from "@/lib/ambientPresets";
import type { AlarmKind } from "@/lib/playChime";
import { playChime } from "@/lib/playChime";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const FOCUS_OPTIONS = [15, 20, 25, 30, 45, 50] as const;
const BREAK_OPTIONS = [3, 5, 10] as const;
const LONG_REST_OPTIONS = [15, 20, 30, 45] as const;
const ALARM_OPTIONS: readonly AlarmKind[] = ["ding", "soft", "bell"];

/** Phones stack panels; tablets/desktop use draggable floating panels. */
const DRAG_MEDIA = "(min-width: 768px)";

export default function Home() {
  const allowDrag = useMediaQuery(DRAG_MEDIA);
  const [ambientId, setAmbientId] = useState<AmbientId>("none");
  const [volume, setVolume] = useState(0.35);
  const [ambientOpen, setAmbientOpen] = useState(false);
  const [ambientAnchor, setAmbientAnchor] = useState<DOMRect | null>(null);

  const [focusMinutes, setFocusMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [longRestMinutes, setLongRestMinutes] = useState(30);
  const [alarm, setAlarm] = useState<AlarmKind>("ding");

  const alarmRef = useRef<AlarmKind>(alarm);
  useEffect(() => {
    alarmRef.current = alarm;
  }, [alarm]);

  const onComplete = useCallback(() => {
    void playChime(alarmRef.current);
  }, []);

  const timer = usePomodoroTimer({
    focusSeconds: focusMinutes * 60,
    onComplete,
  });
  const { reset: resetTimer, running: timerRunning } = timer;

  const prevFocusMinutes = useRef(focusMinutes);
  useEffect(() => {
    if (prevFocusMinutes.current === focusMinutes) return;
    prevFocusMinutes.current = focusMinutes;
    if (!timerRunning) {
      resetTimer();
    }
  }, [focusMinutes, timerRunning, resetTimer]);

  const primeAudio = useCallback(() => {
    void resumeAmbientContext();
  }, []);

  const backdrop = useMemo(() => {
    return (
      AMBIENT_PRESETS.find((p) => p.id === ambientId) ?? AMBIENT_PRESETS[0]
    ).gradient;
  }, [ambientId]);

  useEffect(() => {
    setAmbientMasterVolume(volume);
  }, [volume]);

  useEffect(() => {
    void resumeAmbientContext();
    setAmbientPreset(ambientId);
  }, [ambientId]);

  useEffect(() => () => teardownAmbient(), []);

  const selectAmbient = (id: AmbientId) => {
    void resumeAmbientContext();
    setAmbientId(id);
  };

  const onAmbientButton = (rect: DOMRect) => {
    setAmbientAnchor(rect);
    setAmbientOpen((open) => !open);
  };

  const settingsLocked = timerRunning;

  const timerPanel = (
    <TimerWidget
      timer={timer}
      onUserGesture={primeAudio}
      onAmbientMenuOpen={onAmbientButton}
    />
  );

  const settingsPanel = (
    <SettingsPanel
      focusMinutes={focusMinutes}
      breakMinutes={breakMinutes}
      longRestMinutes={longRestMinutes}
      alarm={alarm}
      totalFocusMs={timer.totalFocusMs}
      focusOptions={FOCUS_OPTIONS}
      breakOptions={BREAK_OPTIONS}
      longRestOptions={LONG_REST_OPTIONS}
      alarmOptions={ALARM_OPTIONS}
      onFocusChange={setFocusMinutes}
      onBreakChange={setBreakMinutes}
      onLongRestChange={setLongRestMinutes}
      onAlarmChange={setAlarm}
      settingsLocked={settingsLocked}
    />
  );

  return (
    <div
      className={`relative min-h-dvh overflow-hidden bg-gradient-to-br ${backdrop} transition-[background] duration-700`}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.07),_transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(34,211,238,0.06),_transparent_60%)]"
        aria-hidden
      />

      <AmbientMenu
        open={ambientOpen}
        anchorRect={ambientAnchor}
        activeId={ambientId}
        volume={volume}
        onClose={() => setAmbientOpen(false)}
        onSelect={selectAmbient}
        onVolumeChange={setVolume}
      />

      <main
        className={`relative mx-auto max-w-6xl px-3 py-6 sm:px-6 ${
          allowDrag
            ? "min-h-dvh"
            : "flex min-h-dvh flex-col gap-5 pb-10 pt-4"
        }`}
      >
        <header
          className={`text-center ${allowDrag ? "pointer-events-none" : ""}`}
        >
          <h1 className="text-balance text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            FOCUS
          </h1>
        </header>

        {allowDrag ? (
          <>
            <DraggablePanel
              key="timer-desk"
              draggable
              initialOffset={{ x: -22, y: 0 }}
            >
              {timerPanel}
            </DraggablePanel>
            <DraggablePanel
              key="settings-desk"
              draggable
              initialOffset={{ x: 22, y: 0 }}
            >
              {settingsPanel}
            </DraggablePanel>
          </>
        ) : (
          <>
            <DraggablePanel key="timer-mob" draggable={false}>
              {timerPanel}
            </DraggablePanel>
            <DraggablePanel key="settings-mob" draggable={false}>
              {settingsPanel}
            </DraggablePanel>
          </>
        )}
      </main>
    </div>
  );
}
