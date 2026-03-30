// DC Intel color themes
// Each theme defines HSL values for all CSS custom properties
// Format: "H S% L%" (no hsl() wrapper — Tailwind uses this format)

export type ThemeId = "navy" | "midnight" | "slate" | "forest" | "charcoal" | "bloomberg" | "gpc";

export type Theme = {
  id: ThemeId;
  name: string;
  description: string;
  preview: { bg: string; accent: string; card: string };
  vars: Record<string, string>;
};

export const THEMES: Theme[] = [
  {
    id: "bloomberg",
    name: "Bloomberg",
    description: "Black terminal with Bloomberg orange — data-dense",
    preview: { bg: "#000000", accent: "#FF6600", card: "#0a0a0a" },
    vars: {
      "--background":            "0 0% 0%",        // pure black
      "--foreground":            "0 0% 96%",        // bright near-white text
      "--card":                  "0 0% 4%",         // very dark card
      "--card-foreground":       "0 0% 92%",
      "--popover":               "0 0% 4%",
      "--popover-foreground":    "0 0% 92%",
      "--primary":               "24 100% 50%",     // Bloomberg orange #FF6600
      "--primary-foreground":    "0 0% 0%",
      "--secondary":             "0 0% 10%",
      "--secondary-foreground":  "0 0% 70%",
      "--muted":                 "0 0% 8%",
      "--muted-foreground":      "0 0% 55%",        // more readable muted text
      "--accent":                "60 100% 50%",     // yellow for highlights
      "--accent-foreground":     "0 0% 0%",
      "--destructive":           "0 84% 52%",
      "--destructive-foreground":"0 0% 92%",
      "--border":                "0 0% 16%",        // visible but subtle borders
      "--input":                 "0 0% 16%",
      "--ring":                  "24 100% 50%",
    },
  },
  {
    id: "gpc",
    name: "GPC Infrastructure",
    description: "GPC Infrastructure brand — deep teal & cyan",
    preview: { bg: "#04454B", accent: "#01747B", card: "#04454B" },
    vars: {
      "--background":            "183 90% 10%",   // #04454B deep teal
      "--foreground":            "0 0% 96%",       // near-white
      "--card":                  "184 84% 14%",   // slightly lighter than bg
      "--card-foreground":       "0 0% 96%",
      "--popover":               "184 84% 14%",
      "--popover-foreground":    "0 0% 96%",
      "--primary":               "183 98% 24%",   // #01747B brand teal
      "--primary-foreground":    "0 0% 100%",
      "--secondary":             "184 30% 22%",   // #407277 mid teal
      "--secondary-foreground":  "0 0% 85%",
      "--muted":                 "184 40% 16%",
      "--muted-foreground":      "184 20% 58%",
      "--accent":                "184 40% 60%",   // #72BBC1 light cyan accent
      "--accent-foreground":     "183 90% 10%",
      "--destructive":           "0 72% 51%",
      "--destructive-foreground":"0 0% 96%",
      "--border":                "184 40% 22%",
      "--input":                 "184 40% 22%",
      "--ring":                  "183 98% 24%",
    },
  },
  {
    id: "navy",
    name: "Navy",
    description: "Deep navy with electric blue — default",
    preview: { bg: "#0d1117", accent: "#2196f3", card: "#161c25" },
    vars: {
      "--background":           "220 16% 8%",
      "--foreground":           "210 20% 92%",
      "--card":                 "220 14% 11%",
      "--card-foreground":      "210 20% 92%",
      "--popover":              "220 14% 11%",
      "--popover-foreground":   "210 20% 92%",
      "--primary":              "207 90% 54%",
      "--primary-foreground":   "220 16% 8%",
      "--secondary":            "220 12% 18%",
      "--secondary-foreground": "210 20% 80%",
      "--muted":                "220 12% 16%",
      "--muted-foreground":     "210 12% 52%",
      "--accent":               "173 80% 40%",
      "--accent-foreground":    "220 16% 8%",
      "--destructive":          "0 62% 55%",
      "--destructive-foreground":"210 20% 92%",
      "--border":               "220 10% 20%",
      "--input":                "220 10% 20%",
      "--ring":                 "207 90% 54%",
    },
  },
  {
    id: "midnight",
    name: "Midnight",
    description: "Pure black with violet accent",
    preview: { bg: "#08080a", accent: "#8b5cf6", card: "#0f0f14" },
    vars: {
      "--background":           "240 10% 4%",
      "--foreground":           "240 10% 92%",
      "--card":                 "240 8% 7%",
      "--card-foreground":      "240 10% 92%",
      "--popover":              "240 8% 7%",
      "--popover-foreground":   "240 10% 92%",
      "--primary":              "263 70% 62%",
      "--primary-foreground":   "240 10% 4%",
      "--secondary":            "240 6% 14%",
      "--secondary-foreground": "240 8% 76%",
      "--muted":                "240 6% 12%",
      "--muted-foreground":     "240 6% 48%",
      "--accent":               "290 60% 56%",
      "--accent-foreground":    "240 10% 4%",
      "--destructive":          "0 62% 52%",
      "--destructive-foreground":"240 10% 92%",
      "--border":               "240 6% 16%",
      "--input":                "240 6% 16%",
      "--ring":                 "263 70% 62%",
    },
  },
  {
    id: "slate",
    name: "Slate",
    description: "Cool slate grey with cyan",
    preview: { bg: "#0f172a", accent: "#06b6d4", card: "#1e293b" },
    vars: {
      "--background":           "222 47% 11%",
      "--foreground":           "210 40% 92%",
      "--card":                 "222 47% 16%",
      "--card-foreground":      "210 40% 92%",
      "--popover":              "222 47% 16%",
      "--popover-foreground":   "210 40% 92%",
      "--primary":              "192 91% 44%",
      "--primary-foreground":   "222 47% 11%",
      "--secondary":            "217 33% 22%",
      "--secondary-foreground": "210 28% 76%",
      "--muted":                "217 33% 18%",
      "--muted-foreground":     "215 20% 48%",
      "--accent":               "172 66% 44%",
      "--accent-foreground":    "222 47% 11%",
      "--destructive":          "0 62% 52%",
      "--destructive-foreground":"210 40% 92%",
      "--border":               "217 33% 24%",
      "--input":                "217 33% 24%",
      "--ring":                 "192 91% 44%",
    },
  },
  {
    id: "forest",
    name: "Forest",
    description: "Dark green with emerald accent",
    preview: { bg: "#0a1510", accent: "#10b981", card: "#0f1f16" },
    vars: {
      "--background":           "150 20% 6%",
      "--foreground":           "140 15% 90%",
      "--card":                 "150 18% 9%",
      "--card-foreground":      "140 15% 90%",
      "--popover":              "150 18% 9%",
      "--popover-foreground":   "140 15% 90%",
      "--primary":              "152 74% 40%",
      "--primary-foreground":   "150 20% 6%",
      "--secondary":            "150 14% 16%",
      "--secondary-foreground": "140 12% 74%",
      "--muted":                "150 14% 13%",
      "--muted-foreground":     "145 10% 46%",
      "--accent":               "173 80% 38%",
      "--accent-foreground":    "150 20% 6%",
      "--destructive":          "0 62% 52%",
      "--destructive-foreground":"140 15% 90%",
      "--border":               "150 12% 18%",
      "--input":                "150 12% 18%",
      "--ring":                 "152 74% 40%",
    },
  },
  {
    id: "charcoal",
    name: "Charcoal",
    description: "Warm charcoal with amber accent",
    preview: { bg: "#111110", accent: "#f59e0b", card: "#191917" },
    vars: {
      "--background":           "40 6% 6%",
      "--foreground":           "40 10% 90%",
      "--card":                 "40 5% 9%",
      "--card-foreground":      "40 10% 90%",
      "--popover":              "40 5% 9%",
      "--popover-foreground":   "40 10% 90%",
      "--primary":              "38 92% 58%",
      "--primary-foreground":   "40 6% 6%",
      "--secondary":            "40 4% 16%",
      "--secondary-foreground": "40 8% 74%",
      "--muted":                "40 4% 13%",
      "--muted-foreground":     "40 5% 46%",
      "--accent":               "25 95% 52%",
      "--accent-foreground":    "40 6% 6%",
      "--destructive":          "0 62% 52%",
      "--destructive-foreground":"40 10% 90%",
      "--border":               "40 4% 18%",
      "--input":                "40 4% 18%",
      "--ring":                 "38 92% 58%",
    },
  },
];

export const DEFAULT_THEME: ThemeId = "gpc";

export function applyTheme(themeId: ThemeId) {
  const theme = THEMES.find(t => t.id === themeId) ?? THEMES[0];
  const root = document.documentElement;
  Object.entries(theme.vars).forEach(([key, val]) => {
    root.style.setProperty(key, val);
  });
  root.setAttribute('data-theme', themeId);
}

// In-memory theme state (survives navigation, resets on page refresh)
// This is intentional — the app is served in a sandboxed iframe where
// localStorage and sessionStorage are unavailable.
let _currentTheme: ThemeId = DEFAULT_THEME;

export function getStoredTheme(): ThemeId {
  return _currentTheme;
}

export function storeTheme(themeId: ThemeId) {
  _currentTheme = themeId;
}
