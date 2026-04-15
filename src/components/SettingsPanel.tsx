"use client";

import { OptionMenu } from "@/components/OptionMenu";
import type { AlarmKind } from "@/lib/playChime";
import { useId, useState } from "react";

function formatTotalFocus(ms: number): string {
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1000);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${String(s).padStart(2, "0")}s`;
}

const ALARM_LABEL: Record<AlarmKind, string> = {
  ding: "Ding",
  soft: "Soft",
  bell: "Bell",
};

type MenuKey = "focus" | "break" | "rest" | "alarm";

type RowProps = {
  label: string;
  value: string;
  onOpenMenu?: (key: MenuKey, rect: DOMRect) => void;
  menuKey?: MenuKey;
  disabled?: boolean;
  dim?: boolean;
  rowId?: string;
};

function SettingRow({
  label,
  value,
  onOpenMenu,
  menuKey,
  disabled,
  dim,
  rowId,
}: RowProps) {
  const interactive = Boolean(onOpenMenu && menuKey && !disabled && !dim);
  return (
    <button
      type="button"
      id={rowId}
      data-session-menu-row={interactive ? menuKey : undefined}
      disabled={!interactive}
      onClick={(e) => {
        if (!interactive || !onOpenMenu || !menuKey) return;
        onOpenMenu(menuKey, e.currentTarget.getBoundingClientRect());
      }}
      className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3.5 text-left transition ${
        interactive
          ? "hover:bg-white/6 active:bg-white/10"
          : "cursor-default opacity-90"
      }`}
    >
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] font-semibold uppercase tracking-[0.28em] text-zinc-500">
          {label}
        </span>
        <span
          className={`mt-1 block text-base font-medium ${
            dim ? "text-white/55" : "text-white"
          }`}
        >
          {value}
        </span>
      </span>
      {interactive ? (
        <span className="text-lg text-white/35" aria-hidden>
          ›
        </span>
      ) : null}
    </button>
  );
}

type Props = {
  focusMinutes: number;
  breakMinutes: number;
  longRestMinutes: number;
  alarm: AlarmKind;
  totalFocusMs: number;
  focusOptions: readonly number[];
  breakOptions: readonly number[];
  longRestOptions: readonly number[];
  alarmOptions: readonly AlarmKind[];
  onFocusChange: (minutes: number) => void;
  onBreakChange: (minutes: number) => void;
  onLongRestChange: (minutes: number) => void;
  onAlarmChange: (alarm: AlarmKind) => void;
  settingsLocked: boolean;
};

export function SettingsPanel({
  focusMinutes,
  breakMinutes,
  longRestMinutes,
  alarm,
  totalFocusMs,
  focusOptions,
  breakOptions,
  longRestOptions,
  alarmOptions,
  onFocusChange,
  onBreakChange,
  onLongRestChange,
  onAlarmChange,
  settingsLocked,
}: Props) {
  const uid = useId().replace(/:/g, "");
  const [openMenu, setOpenMenu] = useState<MenuKey | null>(null);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);

  const openFor = (key: MenuKey, rect: DOMRect) => {
    setAnchorRect(rect);
    setOpenMenu((prev) => (prev === key ? null : key));
  };

  const closeMenu = () => {
    setOpenMenu(null);
  };

  return (
    <div className="glass-panel rounded-3xl px-3 pb-4 pt-0 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
      <div className="flex items-center gap-2 border-b border-white/10 px-2 py-3">
        <span
          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-white/45"
          aria-hidden
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5 8.25 12l7.5-7.5"
            />
          </svg>
        </span>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-zinc-400">
            Session
          </p>
          <p className="text-sm text-white/80">Timers & alarm</p>
        </div>
      </div>

      <OptionMenu
        open={openMenu === "focus"}
        anchorRect={openMenu === "focus" ? anchorRect : null}
        options={focusOptions}
        value={focusMinutes}
        onSelect={onFocusChange}
        onClose={closeMenu}
        formatOption={(m) => `${m} min`}
        title="Focus length"
        menuId={`focus-menu-${uid}`}
      />
      <OptionMenu
        open={openMenu === "break"}
        anchorRect={openMenu === "break" ? anchorRect : null}
        options={breakOptions}
        value={breakMinutes}
        onSelect={onBreakChange}
        onClose={closeMenu}
        formatOption={(m) => `${m} min`}
        title="Break length"
        menuId={`break-menu-${uid}`}
      />
      <OptionMenu
        open={openMenu === "rest"}
        anchorRect={openMenu === "rest" ? anchorRect : null}
        options={longRestOptions}
        value={longRestMinutes}
        onSelect={onLongRestChange}
        onClose={closeMenu}
        formatOption={(m) => `${m} min`}
        title="Long rest"
        menuId={`rest-menu-${uid}`}
      />
      <OptionMenu
        open={openMenu === "alarm"}
        anchorRect={openMenu === "alarm" ? anchorRect : null}
        options={alarmOptions}
        value={alarm}
        onSelect={onAlarmChange}
        onClose={closeMenu}
        formatOption={(a) => ALARM_LABEL[a]}
        title="Alarm sound"
        menuId={`alarm-menu-${uid}`}
      />

      <div className="mt-1 divide-y divide-white/5">
        <SettingRow
          rowId={`focus-row-${uid}`}
          label="Focus"
          value={`${focusMinutes} min`}
          menuKey="focus"
          onOpenMenu={openFor}
          disabled={settingsLocked}
        />
        <SettingRow
          rowId={`break-row-${uid}`}
          label="Break"
          value={`${breakMinutes} min`}
          menuKey="break"
          onOpenMenu={openFor}
          disabled={settingsLocked}
        />
        <SettingRow
          rowId={`rest-row-${uid}`}
          label="Rest"
          value={`${longRestMinutes} min`}
          menuKey="rest"
          onOpenMenu={openFor}
          disabled={settingsLocked}
        />
        <SettingRow
          rowId={`alarm-row-${uid}`}
          label="Alarm"
          value={ALARM_LABEL[alarm]}
          menuKey="alarm"
          onOpenMenu={openFor}
          disabled={settingsLocked}
        />
        <SettingRow
          rowId={`total-row-${uid}`}
          label="Total focus"
          value={formatTotalFocus(totalFocusMs)}
          dim
        />
      </div>

      {settingsLocked ? (
        <p className="mt-3 px-2 text-center text-[11px] text-white/45">
          Pause the timer to change durations or alarm.
        </p>
      ) : null}
    </div>
  );
}
