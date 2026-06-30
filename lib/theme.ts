// Site-wide color theming. Colors are stored as hex in settings, converted to
// "r g b" channel strings, and written to CSS custom properties on <html>.
// Tailwind tokens reference these vars (rgb(var(--accent) / <alpha-value>)) so
// every accent/background/opacity class updates live when the theme changes.

export interface Theme {
  accent: string; // primary
  accent2: string; // secondary
  glow: string; // highlight / gradient
  ink: string; // page background base
}

export interface Preset {
  id: string;
  name: string;
  theme: Theme;
}

export const PRESETS: Preset[] = [
  { id: "indigo", name: "Indigo", theme: { accent: "#7c5cff", accent2: "#16d9c9", glow: "#a78bfa", ink: "#07070f" } },
  { id: "emerald", name: "Emerald", theme: { accent: "#10b981", accent2: "#34d399", glow: "#6ee7b7", ink: "#04100c" } },
  { id: "sunset", name: "Sunset", theme: { accent: "#ff6b6b", accent2: "#ffd166", glow: "#ff8e72", ink: "#140a0a" } },
  { id: "rose", name: "Rose", theme: { accent: "#ff5c8a", accent2: "#c77dff", glow: "#ff9ec7", ink: "#140a12" } },
  { id: "ocean", name: "Ocean", theme: { accent: "#3b82f6", accent2: "#22d3ee", glow: "#60a5fa", ink: "#06101a" } },
  { id: "amber", name: "Amber", theme: { accent: "#f59e0b", accent2: "#fcd34d", glow: "#fbbf24", ink: "#120c04" } },
  { id: "mono", name: "Mono", theme: { accent: "#c7c7d1", accent2: "#9aa0b5", glow: "#e5e5ee", ink: "#0c0c10" } },
];

export const DEFAULT_THEME: Theme = PRESETS[0].theme;

/** "#7c5cff" -> "124 92 255" (handles 3- or 6-digit hex). */
export function hexToChannels(hex: string): string {
  let h = hex.replace("#", "").trim();
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h, 16);
  if (Number.isNaN(n)) return "124 92 255";
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}

/** Apply a theme to the document root as CSS custom properties. */
export function applyTheme(theme: Theme) {
  const r = document.documentElement;
  r.style.setProperty("--accent", hexToChannels(theme.accent));
  r.style.setProperty("--accent2", hexToChannels(theme.accent2));
  r.style.setProperty("--glow", hexToChannels(theme.glow));
  r.style.setProperty("--ink", hexToChannels(theme.ink));
}
