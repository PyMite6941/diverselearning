"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_THEME, type Theme } from "./theme";
import type { StatsScope } from "./visibleText";

interface SettingsState {
  /** Use the OpenDyslexic typeface across the app. */
  dyslexiaFont: boolean;
  /** Slightly larger, roomier reading size. */
  roomyText: boolean;
  /** Show the bottom-left word / character / repeat counter. */
  textStats: boolean;
  /** What the counter measures: what's on screen, or the whole page. */
  textStatsScope: StatsScope;
  /** Break the repeated-character counts out into a per-letter list. */
  textStatsRepeatDetail: boolean;
  /** Site-wide color theme. */
  theme: Theme;
  /** How the learner wants to learn — free text, fed into course generation so
   *  every course (especially concept lessons) adapts to them. */
  learningStyle: string;
  setDyslexiaFont: (v: boolean) => void;
  setRoomyText: (v: boolean) => void;
  setTextStats: (v: boolean) => void;
  setTextStatsScope: (v: StatsScope) => void;
  setTextStatsRepeatDetail: (v: boolean) => void;
  setTheme: (t: Theme) => void;
  patchTheme: (p: Partial<Theme>) => void;
  resetTheme: () => void;
  setLearningStyle: (v: string) => void;
}

/** Appearance + accessibility preferences, persisted to localStorage so they
 *  stick per device. Kept separate from course data. */
export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      dyslexiaFont: false,
      roomyText: false,
      textStats: false,
      textStatsScope: "screen",
      textStatsRepeatDetail: false,
      theme: DEFAULT_THEME,
      learningStyle: "",
      setDyslexiaFont: (v) => set({ dyslexiaFont: v }),
      setRoomyText: (v) => set({ roomyText: v }),
      setTextStats: (v) => set({ textStats: v }),
      setTextStatsScope: (v) => set({ textStatsScope: v }),
      setTextStatsRepeatDetail: (v) => set({ textStatsRepeatDetail: v }),
      setTheme: (theme) => set({ theme }),
      patchTheme: (p) => set((s) => ({ theme: { ...s.theme, ...p } })),
      resetTheme: () => set({ theme: DEFAULT_THEME }),
      setLearningStyle: (v) => set({ learningStyle: v }),
    }),
    { name: "diverselearning-settings-v1" }
  )
);
