"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_THEME, type Theme } from "./theme";

interface SettingsState {
  /** Use the OpenDyslexic typeface across the app. */
  dyslexiaFont: boolean;
  /** Slightly larger, roomier reading size. */
  roomyText: boolean;
  /** Site-wide color theme. */
  theme: Theme;
  setDyslexiaFont: (v: boolean) => void;
  setRoomyText: (v: boolean) => void;
  setTheme: (t: Theme) => void;
  patchTheme: (p: Partial<Theme>) => void;
  resetTheme: () => void;
}

/** Appearance + accessibility preferences, persisted to localStorage so they
 *  stick per device. Kept separate from course data. */
export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      dyslexiaFont: false,
      roomyText: false,
      theme: DEFAULT_THEME,
      setDyslexiaFont: (v) => set({ dyslexiaFont: v }),
      setRoomyText: (v) => set({ roomyText: v }),
      setTheme: (theme) => set({ theme }),
      patchTheme: (p) => set((s) => ({ theme: { ...s.theme, ...p } })),
      resetTheme: () => set({ theme: DEFAULT_THEME }),
    }),
    { name: "diverselearning-settings-v1" }
  )
);
