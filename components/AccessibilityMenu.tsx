"use client";

import { useEffect, useState } from "react";
import { useSettings } from "@/lib/settings";
import { PRESETS } from "@/lib/theme";

/** Appearance panel: site-wide color theme (presets + custom colors) and
 *  reading options. Preferences persist via useSettings; the headless
 *  <AccessibilityController> applies them to <html> on every page. */
export default function AccessibilityMenu() {
  const {
    dyslexiaFont,
    roomyText,
    textStats,
    textStatsScope,
    textStatsRepeatDetail,
    theme,
    setDyslexiaFont,
    setRoomyText,
    setTextStats,
    setTextStatsScope,
    setTextStatsRepeatDetail,
    setTheme,
    patchTheme,
    resetTheme,
  } = useSettings();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const activePreset = PRESETS.find(
    (p) =>
      p.theme.accent === theme.accent &&
      p.theme.accent2 === theme.accent2 &&
      p.theme.ink === theme.ink
  );

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        title="Appearance — colors & reading"
        className="flex h-10 items-center gap-2 rounded-2xl border border-white/15 px-3 text-sm font-medium text-white/80 transition hover:bg-white/10"
      >
        <span
          className="h-4 w-4 rounded-full ring-2 ring-white/20"
          style={{
            background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`,
          }}
        />
        <span className="hidden sm:inline">Appearance</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[90]" onClick={() => setOpen(false)} />
          <div className="glass-strong absolute right-0 z-[95] mt-2 w-72 rounded-2xl p-3 text-sm">
            {/* ── Theme ── */}
            <div className="flex items-center justify-between px-1 pb-1">
              <p className="text-xs uppercase tracking-wider text-white/40">Theme</p>
              <button
                onClick={resetTheme}
                className="text-[11px] text-white/40 transition hover:text-white"
              >
                Reset
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2 px-1">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setTheme(p.theme)}
                  title={p.name}
                  className={`flex h-10 items-center justify-center rounded-xl ring-2 transition ${
                    activePreset?.id === p.id
                      ? "ring-white/80"
                      : "ring-white/10 hover:ring-white/40"
                  }`}
                  style={{
                    background: `linear-gradient(135deg, ${p.theme.accent}, ${p.theme.accent2})`,
                  }}
                >
                  {activePreset?.id === p.id && (
                    <span className="text-xs font-bold text-white drop-shadow">✓</span>
                  )}
                </button>
              ))}
            </div>

            {/* Custom colors */}
            <div className="mt-3 space-y-1.5 px-1">
              <p className="text-[11px] text-white/40">Custom colors</p>
              <ColorRow
                label="Primary"
                value={theme.accent}
                onChange={(v) => patchTheme({ accent: v })}
              />
              <ColorRow
                label="Secondary"
                value={theme.accent2}
                onChange={(v) => patchTheme({ accent2: v })}
              />
              <ColorRow
                label="Highlight"
                value={theme.glow}
                onChange={(v) => patchTheme({ glow: v })}
              />
              <ColorRow
                label="Background"
                value={theme.ink}
                onChange={(v) => patchTheme({ ink: v })}
              />
            </div>

            <div className="my-3 h-px bg-white/10" />

            {/* ── Reading ── */}
            <p className="px-1 pb-1 text-xs uppercase tracking-wider text-white/40">
              Reading
            </p>
            <button
              onClick={() => setDyslexiaFont(!dyslexiaFont)}
              className="flex w-full items-center justify-between rounded-xl px-2 py-2.5 text-left transition hover:bg-white/10"
            >
              <span>
                <span className="block">Dyslexia-friendly font</span>
                <span className="block text-xs text-white/40">OpenDyslexic</span>
              </span>
              <Switch on={dyslexiaFont} />
            </button>
            <button
              onClick={() => setRoomyText(!roomyText)}
              className="flex w-full items-center justify-between rounded-xl px-2 py-2.5 text-left transition hover:bg-white/10"
            >
              <span>
                <span className="block">Roomier text</span>
                <span className="block text-xs text-white/40">Larger, more spacing</span>
              </span>
              <Switch on={roomyText} />
            </button>
            <button
              onClick={() => setTextStats(!textStats)}
              className="flex w-full items-center justify-between rounded-xl px-2 py-2.5 text-left transition hover:bg-white/10"
            >
              <span>
                <span className="block">Text stats</span>
                <span className="block text-xs text-white/40">
                  Words, characters &amp; repeats, bottom left
                </span>
              </span>
              <Switch on={textStats} />
            </button>

            {textStats && (
              <div className="mt-1 space-y-2 rounded-xl bg-white/5 p-2">
                <p className="text-[11px] text-white/40">Count</p>
                <div className="flex gap-1 rounded-lg bg-black/25 p-1">
                  <ScopeButton
                    label="On screen"
                    active={textStatsScope === "screen"}
                    onClick={() => setTextStatsScope("screen")}
                  />
                  <ScopeButton
                    label="Whole page"
                    active={textStatsScope === "page"}
                    onClick={() => setTextStatsScope("page")}
                  />
                </div>
                <p className="px-0.5 text-[11px] leading-snug text-white/35">
                  {textStatsScope === "screen"
                    ? "Only the text you can see right now — the numbers change as you scroll."
                    : "Everything on the page, scrolled off or not."}
                </p>
                <button
                  onClick={() => setTextStatsRepeatDetail(!textStatsRepeatDetail)}
                  className="flex w-full items-center justify-between rounded-lg px-1 py-1.5 text-left transition hover:bg-white/10"
                >
                  <span className="text-xs text-white/70">Per-letter repeats</span>
                  <Switch on={textStatsRepeatDetail} />
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function ScopeButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`flex-1 rounded-md px-2 py-1 text-xs font-medium transition ${
        active ? "bg-white/15 text-white" : "text-white/50 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}

function ColorRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-2 rounded-lg px-1 py-1">
      <span className="text-white/70">{label}</span>
      <span className="flex items-center gap-2">
        <span className="text-[11px] uppercase text-white/35">{value}</span>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-7 w-7 cursor-pointer rounded-md border border-white/15 bg-transparent p-0"
        />
      </span>
    </label>
  );
}

function Switch({ on }: { on: boolean }) {
  return (
    <span
      className={`relative inline-flex h-5 w-9 flex-none items-center rounded-full transition ${
        on ? "bg-accent" : "bg-white/15"
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition ${
          on ? "translate-x-4" : "translate-x-1"
        }`}
      />
    </span>
  );
}
