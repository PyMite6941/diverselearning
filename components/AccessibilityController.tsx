"use client";

import { useEffect } from "react";
import { useSettings } from "@/lib/settings";
import { applyTheme } from "@/lib/theme";

/** Headless: reflects saved appearance preferences (color theme + reading
 *  options) onto <html> so they apply on every route. Mount once in the root
 *  layout. */
export default function AccessibilityController() {
  const dyslexiaFont = useSettings((s) => s.dyslexiaFont);
  const roomyText = useSettings((s) => s.roomyText);
  const theme = useSettings((s) => s.theme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("font-dyslexic", dyslexiaFont);
    root.classList.toggle("reading-roomy", roomyText);
  }, [dyslexiaFont, roomyText]);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return null;
}
