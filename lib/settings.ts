"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsState {
  /** Use the OpenDyslexic typeface across the app. */
  dyslexiaFont: boolean;
  /** Slightly larger, roomier reading size. */
  roomyText: boolean;
  setDyslexiaFont: (v: boolean) => void;
  setRoomyText: (v: boolean) => void;
}

/** Accessibility preferences, persisted to localStorage so they stick per
 *  device. (Kept separate from the course store so toggling never touches
 *  course data.) */
export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      dyslexiaFont: false,
      roomyText: false,
      setDyslexiaFont: (v) => set({ dyslexiaFont: v }),
      setRoomyText: (v) => set({ roomyText: v }),
    }),
    { name: "diverselearning-settings-v1" }
  )
);
