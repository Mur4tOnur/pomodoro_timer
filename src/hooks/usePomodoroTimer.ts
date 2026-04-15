"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_FOCUS_SECONDS = 25 * 60;

type Options = {
  focusSeconds?: number;
  onComplete?: () => void;
};

export function usePomodoroTimer(options: Options = {}) {
  const focusSeconds = options.focusSeconds ?? DEFAULT_FOCUS_SECONDS;
  const onCompleteRef = useRef(options.onComplete);

  const totalMs = focusSeconds * 1000;
  const [displayMs, setDisplayMs] = useState(totalMs);
  const [running, setRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [totalFocusMs, setTotalFocusMs] = useState(0);

  const endAtRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const displayMsRef = useRef(displayMs);
  const focusSegmentStartRef = useRef<number | null>(null);

  useEffect(() => {
    onCompleteRef.current = options.onComplete;
  }, [options.onComplete]);

  const stopRaf = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const flushFocusSegment = useCallback((discard: boolean) => {
    if (!focusSegmentStartRef.current || discard) {
      focusSegmentStartRef.current = null;
      return;
    }
    const delta = Date.now() - focusSegmentStartRef.current;
    focusSegmentStartRef.current = null;
    setTotalFocusMs((t) => t + delta);
  }, []);

  const beginFocusSegment = useCallback(() => {
    focusSegmentStartRef.current = Date.now();
  }, []);

  const start = useCallback(() => {
    if (endAtRef.current) return;
    const base = displayMsRef.current <= 0 ? totalMs : displayMsRef.current;
    endAtRef.current = Date.now() + base;
    setRunning(true);
    beginFocusSegment();
    stopRaf();

    const step = () => {
      if (!endAtRef.current) return;
      const msLeft = Math.max(0, endAtRef.current - Date.now());
      setDisplayMs(msLeft);

      if (msLeft <= 0) {
        stopRaf();
        endAtRef.current = null;
        setRunning(false);
        flushFocusSegment(false);
        setDisplayMs(totalMs);
        displayMsRef.current = totalMs;
        setCompletedSessions((c) => c + 1);
        onCompleteRef.current?.();
        return;
      }

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
  }, [beginFocusSegment, flushFocusSegment, stopRaf, totalMs]);

  const pause = useCallback(() => {
    if (!endAtRef.current) return;
    const msLeft = Math.max(0, endAtRef.current - Date.now());
    endAtRef.current = null;
    setRunning(false);
    stopRaf();
    flushFocusSegment(false);
    setDisplayMs(msLeft);
    displayMsRef.current = msLeft;
  }, [flushFocusSegment, stopRaf]);

  const reset = useCallback(() => {
    if (endAtRef.current) {
      flushFocusSegment(true);
    }
    endAtRef.current = null;
    setRunning(false);
    stopRaf();
    setDisplayMs(totalMs);
    displayMsRef.current = totalMs;
  }, [flushFocusSegment, stopRaf, totalMs]);

  const toggle = useCallback(() => {
    if (endAtRef.current) pause();
    else start();
  }, [pause, start]);

  useEffect(() => {
    return () => stopRaf();
  }, [stopRaf]);

  const remainingSeconds = Math.ceil(displayMs / 1000);
  const progress =
    totalMs <= 0 ? 0 : Math.min(1, Math.max(0, 1 - displayMs / totalMs));

  return {
    focusSeconds,
    totalMs,
    displayMs,
    remainingSeconds,
    progress,
    running,
    completedSessions,
    totalFocusMs,
    start,
    pause,
    reset,
    toggle,
  };
}
