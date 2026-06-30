"use client";

import { useEffect } from "react";
import { useSettings } from "@/lib/settings";

/** Headless: reflects saved accessibility preferences onto <html> so they
 *  apply on every route. Mount once in the root layout. */
export default function AccessibilityController() {
  const dyslexiaFont = useSettings((s) => s.dyslexiaFont);
  const roomyText = useSettings((s) => s.roomyText);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("font-dyslexic", dyslexiaFont);
    root.classList.toggle("reading-roomy", roomyText);
  }, [dyslexiaFont, roomyText]);

  return null;
}
