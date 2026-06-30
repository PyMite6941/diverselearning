"use client";

import { useEffect, useState } from "react";
import { useSettings } from "@/lib/settings";

/** The reading/accessibility toggle menu. Preferences persist via useSettings;
 *  the headless <AccessibilityController> (mounted in the root layout) applies
 *  them to <html> on every page. */
export default function AccessibilityMenu() {
  const { dyslexiaFont, roomyText, setDyslexiaFont, setRoomyText } = useSettings();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        title="Reading & accessibility"
        className={`flex h-10 items-center gap-1.5 rounded-2xl border px-3 text-sm font-medium transition ${
          dyslexiaFont || roomyText
            ? "border-accent/50 bg-accent/15 text-white"
            : "border-white/15 text-white/80 hover:bg-white/10"
        }`}
      >
        <span className="text-base leading-none">Aa</span>
        <span className="hidden sm:inline">Reading</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[90]" onClick={() => setOpen(false)} />
          <div className="glass-strong absolute right-0 z-[95] mt-2 w-64 rounded-2xl p-2 text-sm">
            <p className="px-3 pb-1 pt-2 text-xs uppercase tracking-wider text-white/40">
              Reading options
            </p>

            <button
              onClick={() => setDyslexiaFont(!dyslexiaFont)}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition hover:bg-white/10"
            >
              <span>
                <span className="block">Dyslexia-friendly font</span>
                <span className="block text-xs text-white/40">OpenDyslexic</span>
              </span>
              <Switch on={dyslexiaFont} />
            </button>

            <button
              onClick={() => setRoomyText(!roomyText)}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition hover:bg-white/10"
            >
              <span>
                <span className="block">Roomier text</span>
                <span className="block text-xs text-white/40">Larger, more spacing</span>
              </span>
              <Switch on={roomyText} />
            </button>
          </div>
        </>
      )}
    </div>
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
