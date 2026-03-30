import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import Layout from "@/components/Layout";
import { Lock, Copy, Check, ChevronRight, ChevronDown, Search, X, ArrowUp, ArrowDown } from "lucide-react";

// ============================================================
// FILE CONTENTS — embedded snapshot, read-only
// ============================================================
const FILE_CONTENTS: Record<string, string> = {
  "App.tsx": `import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import Dashboard from "@/pages/Dashboard";
import Projects from "@/pages/Projects";
import ProjectDetail from "@/pages/ProjectDetail";
import CompanyDetail from "@/pages/CompanyDetail";
import Companies from "@/pages/Companies";
import Competitors from "@/pages/Competitors";
import CompetitorDetail from "@/pages/CompetitorDetail";
import MacroPower from "@/pages/MacroPower";
import MapView from "@/pages/MapView";
import NewsPage from "@/pages/NewsPage";
import QueueIntelligence from "@/pages/QueueIntelligence";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";
import { applyTheme, getStoredTheme } from "@/lib/themes";

export default function App() {
  // Apply persisted theme on mount
  useEffect(() => { applyTheme(getStoredTheme()); }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Router hook={useHashLocation}>
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/projects" component={Projects} />
          <Route path="/projects/:id" component={ProjectDetail} />
          <Route path="/news" component={NewsPage} />
          <Route path="/queue" component={QueueIntelligence} />
          <Route path="/settings" component={Settings} />
          <Route path="/companies" component={Companies} />
          <Route path="/companies/:id" component={CompanyDetail} />
          <Route path="/competitors" component={Competitors} />
          <Route path="/competitors/:id" component={CompetitorDetail} />
          <Route path="/macro" component={MacroPower} />
          <Route path="/map" component={MapView} />
          <Route component={NotFound} />
        </Switch>
      </Router>
      <Toaster />
    </QueryClientProvider>
  );
}
`,
  "main.tsx": `import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

if (!window.location.hash) {
  window.location.hash = "#/";
}

createRoot(document.getElementById("root")!).render(<App />);
`,
  "queryClient.ts": `import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Derive the full API base URL from the current page location.
// This ensures API calls work both in local dev (http://localhost:5000/api/...)
// AND through the Perplexity deploy proxy where the page is served at a
// deep path (e.g. https://sites.pplx.app/sites/proxy/[JWT]/port/5000/).
// We use origin + pathname (stripped of trailing slash) so that
// \`\${API_BASE}/api/projects\` resolves to the correct proxied endpoint.
function getApiBase(): string {
  if (typeof window === "undefined") return "";
  const { origin, pathname } = window.location;
  // Strip trailing slash from pathname
  const base = pathname.replace(/\\/$/, "");
  return \`\${origin}\${base}\`;
}
const API_BASE = getApiBase();

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(\`\${res.status}: \${text}\`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(\`\${API_BASE}\${url}\`, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(\`\${API_BASE}\${queryKey.join("/")}\`);

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
`,
  "themes.ts": `// DC Intel color themes
// Each theme defines HSL values for all CSS custom properties
// Format: "H S% L%" (no hsl() wrapper — Tailwind uses this format)

export type ThemeId = "navy" | "midnight" | "slate" | "forest" | "charcoal";

export type Theme = {
  id: ThemeId;
  name: string;
  description: string;
  preview: { bg: string; accent: string; card: string };
  vars: Record<string, string>;
};

export const THEMES: Theme[] = [
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

export const DEFAULT_THEME: ThemeId = "navy";

export function applyTheme(themeId: ThemeId) {
  const theme = THEMES.find(t => t.id === themeId) ?? THEMES[0];
  const root = document.documentElement;
  Object.entries(theme.vars).forEach(([key, val]) => {
    root.style.setProperty(key, val);
  });
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
`,
  "utils.ts": `import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
`,
  "rtoPolygons.ts": `// OFFICIAL HIFLD RTO BOUNDARY POLYGONS
// Source: HIFLD Electric Planning Areas federal dataset, March 2026
// https://services5.arcgis.com/HDRa0B57OVrv2E1q/arcgis/rest/services/Electric_Planning_Areas/
export const RTO_POLYGONS_OFFICIAL: Record<string, [number,number][][]> = {
  "ERCOT": [
    [
      [
        36.06,
        -101.04
      ],
      [
        36.06,
        -100
      ],
      [
        34.56,
        -100
      ],
      [
        34.38,
        -99.7
      ],
      [
        34.46,
        -99.36
      ],
      [
        34.22,
        -99.19
      ],
      [
        34.21,
        -98.96
      ],
      [
        33.83,
        -98.95
      ],
      [
        33.84,
        -98.42
      ],
      [
        34.13,
        -98.4
      ],
      [
        34.15,
        -98.12
      ],
      [
        33.88,
        -97.97
      ],
      [
        33.91,
        -97.21
      ],
      [
        33.72,
        -97.13
      ],
      [
        33.96,
        -96.92
      ],
      [
        33.69,
        -96.35
      ],
      [
        33.86,
        -96.09
      ],
      [
        33.96,
        -95.23
      ],
      [
        33.76,
        -94.76
      ],
      [
        33.32,
        -94.75
      ],
      [
        33.39,
        -95.13
      ],
      [
        32.57,
        -95.15
      ],
      [
        32.54,
        -94.99
      ],
      [
        32.37,
        -94.99
      ],
      [
        32.39,
        -94.49
      ],
      [
        31.97,
        -94.6
      ],
      [
        31.98,
        -94.02
      ],
      [
        31.7,
        -93.79
      ],
      [
        31.57,
        -93.98
      ],
      [
        31.65,
        -94.4
      ],
      [
        31.24,
        -94.34
      ],
      [
        31.1,
        -94.13
      ],
      [
        31.15,
        -94.84
      ],
      [
        30.82,
        -95.2
      ],
      [
        30.9,
        -95.31
      ],
      [
        30.48,
        -95.35
      ],
      [
        29.83,
        -94.91
      ],
      [
        29.55,
        -95.02
      ],
      [
        29.56,
        -95.22
      ],
      [
        29.07,
        -95.12
      ],
      [
        28.42,
        -96.32
      ],
      [
        28.66,
        -95.97
      ],
      [
        28.58,
        -96.23
      ],
      [
        28.76,
        -96.17
      ],
      [
        28.63,
        -96.36
      ],
      [
        28.77,
        -96.43
      ],
      [
        28.57,
        -96.49
      ],
      [
        28.72,
        -96.66
      ],
      [
        28.43,
        -96.4
      ],
      [
        28.31,
        -96.67
      ],
      [
        28.48,
        -96.81
      ],
      [
        28.24,
        -96.78
      ],
      [
        28.08,
        -97.26
      ],
      [
        27.93,
        -97.19
      ],
      [
        28.1,
        -97.02
      ],
      [
        27.82,
        -97.19
      ],
      [
        27.87,
        -97.52
      ],
      [
        27.69,
        -97.24
      ],
      [
        27.33,
        -97.4
      ],
      [
        27.28,
        -97.54
      ],
      [
        27.48,
        -97.54
      ],
      [
        27.34,
        -97.53
      ],
      [
        27.43,
        -97.75
      ],
      [
        27.3,
        -97.65
      ],
      [
        27.28,
        -97.79
      ],
      [
        27.26,
        -97.42
      ],
      [
        26.98,
        -97.57
      ],
      [
        26.85,
        -97.47
      ],
      [
        26.85,
        -97.59
      ],
      [
        25.96,
        -97.25
      ],
      [
        26.06,
        -97.15
      ],
      [
        25.84,
        -97.37
      ],
      [
        26.43,
        -99.11
      ],
      [
        27.02,
        -99.45
      ],
      [
        27.57,
        -99.51
      ],
      [
        28.19,
        -100.21
      ],
      [
        29.09,
        -100.11
      ],
      [
        29.08,
        -100.67
      ],
      [
        29.77,
        -101.4
      ],
      [
        29.78,
        -101.76
      ],
      [
        30.64,
        -101.67
      ],
      [
        30.6,
        -102.34
      ],
      [
        30.28,
        -102.34
      ],
      [
        30.28,
        -102.57
      ],
      [
        30.05,
        -102.57
      ],
      [
        30.77,
        -103.58
      ],
      [
        31.38,
        -103.01
      ],
      [
        31.43,
        -103.46
      ],
      [
        32,
        -103.98
      ],
      [
        32.09,
        -102.29
      ],
      [
        31.65,
        -102.29
      ],
      [
        31.65,
        -101.78
      ],
      [
        32.96,
        -101.69
      ],
      [
        32.96,
        -102.08
      ],
      [
        33.39,
        -102.08
      ],
      [
        33.39,
        -102.59
      ],
      [
        34.31,
        -102.62
      ],
      [
        34.31,
        -102
      ],
      [
        35.18,
        -102.17
      ],
      [
        35.18,
        -101.09
      ],
      [
        36.06,
        -101.04
      ]
    ]
  ],
  "PJM": [
    [
      [
        37.53,
        -75.67
      ],
      [
        37.12,
        -75.9
      ],
      [
        37.27,
        -76.03
      ],
      [
        37.94,
        -75.64
      ],
      [
        37.92,
        -75.9
      ],
      [
        38.2,
        -75.7
      ],
      [
        38.14,
        -75.96
      ],
      [
        38.56,
        -75.7
      ],
      [
        38.22,
        -76.03
      ],
      [
        38.48,
        -76.33
      ],
      [
        38.59,
        -75.98
      ],
      [
        38.97,
        -75.8
      ],
      [
        38.58,
        -76.03
      ],
      [
        38.68,
        -76.34
      ],
      [
        39.03,
        -76.32
      ],
      [
        39.24,
        -75.89
      ],
      [
        39.15,
        -76.28
      ],
      [
        39.53,
        -75.98
      ],
      [
        39.2,
        -76.44
      ],
      [
        39.35,
        -76.88
      ],
      [
        39.13,
        -76.43
      ],
      [
        38.32,
        -76.46
      ],
      [
        39.12,
        -76.88
      ],
      [
        38.04,
        -76.32
      ],
      [
        38.3,
        -76.97
      ],
      [
        37.88,
        -76.18
      ],
      [
        37.61,
        -76.22
      ],
      [
        38.11,
        -77.05
      ],
      [
        37.56,
        -76.3
      ],
      [
        37.31,
        -76.27
      ],
      [
        37.25,
        -76.5
      ],
      [
        37.5,
        -76.81
      ],
      [
        37.13,
        -76.3
      ],
      [
        36.96,
        -76.41
      ],
      [
        37.11,
        -76.61
      ],
      [
        36.9,
        -76.41
      ],
      [
        36.92,
        -75.99
      ],
      [
        35.78,
        -75.53
      ],
      [
        36.72,
        -76.08
      ],
      [
        36.07,
        -75.79
      ],
      [
        36.36,
        -76.05
      ],
      [
        36.16,
        -75.91
      ],
      [
        36.29,
        -76.2
      ],
      [
        36.15,
        -76.06
      ],
      [
        36.01,
        -76.58
      ],
      [
        36.35,
        -76.76
      ],
      [
        35.94,
        -76.73
      ],
      [
        35.96,
        -76.02
      ],
      [
        35.61,
        -76.21
      ],
      [
        35.98,
        -75.9
      ],
      [
        35.69,
        -75.72
      ],
      [
        35.33,
        -76.15
      ],
      [
        35.4,
        -76.53
      ],
      [
        35.58,
        -76.49
      ],
      [
        35.39,
        -76.58
      ],
      [
        35.57,
        -77.11
      ],
      [
        35.31,
        -76.48
      ],
      [
        34.96,
        -76.8
      ],
      [
        35.33,
        -77.35
      ],
      [
        35.71,
        -77.19
      ],
      [
        35.68,
        -77.56
      ],
      [
        35.91,
        -77.76
      ],
      [
        36.19,
        -77.76
      ],
      [
        36.14,
        -77.43
      ],
      [
        35.93,
        -77.41
      ],
      [
        36.11,
        -77.23
      ],
      [
        36.34,
        -77.91
      ],
      [
        36.51,
        -77.9
      ],
      [
        36.2,
        -78.01
      ],
      [
        36.27,
        -78.31
      ],
      [
        36.02,
        -78.55
      ],
      [
        36.24,
        -79.15
      ],
      [
        36.54,
        -79.14
      ],
      [
        36.61,
        -81.83
      ],
      [
        36.1,
        -82.6
      ],
      [
        36.42,
        -82.63
      ],
      [
        36.32,
        -83.27
      ],
      [
        36.59,
        -82.75
      ],
      [
        36.99,
        -82.91
      ],
      [
        36.89,
        -83.92
      ],
      [
        36.73,
        -83.74
      ],
      [
        36.59,
        -83.92
      ],
      [
        36.79,
        -84.13
      ],
      [
        36.59,
        -84.15
      ],
      [
        36.63,
        -85.27
      ],
      [
        36.99,
        -85.3
      ],
      [
        36.75,
        -85.94
      ],
      [
        37.11,
        -86.12
      ],
      [
        37.1,
        -85.81
      ],
      [
        37.38,
        -85.75
      ],
      [
        37.18,
        -86.04
      ],
      [
        37.52,
        -86.17
      ],
      [
        37.62,
        -86
      ],
      [
        37.6,
        -86.27
      ],
      [
        37.84,
        -85.75
      ],
      [
        38.03,
        -85.9
      ],
      [
        38.15,
        -84.84
      ],
      [
        37.99,
        -84.97
      ],
      [
        37.87,
        -84.67
      ],
      [
        37.87,
        -84.93
      ],
      [
        37.59,
        -84.91
      ],
      [
        37.63,
        -84.66
      ],
      [
        38.01,
        -84.66
      ],
      [
        37.88,
        -84.34
      ],
      [
        37.57,
        -84.42
      ],
      [
        37.71,
        -84.09
      ],
      [
        37.96,
        -84.21
      ],
      [
        37.94,
        -83.78
      ],
      [
        38.13,
        -83.74
      ],
      [
        38.04,
        -84.28
      ],
      [
        38.19,
        -84.01
      ],
      [
        38.23,
        -84.52
      ],
      [
        38.5,
        -84.55
      ],
      [
        38.23,
        -84.58
      ],
      [
        38.36,
        -84.88
      ],
      [
        38.16,
        -84.95
      ],
      [
        38.22,
        -85.18
      ],
      [
        38.48,
        -84.94
      ],
      [
        38.37,
        -85.33
      ],
      [
        38.73,
        -85.43
      ],
      [
        38.53,
        -85.34
      ],
      [
        38.73,
        -85.31
      ],
      [
        38.63,
        -84.76
      ],
      [
        38.68,
        -85.14
      ],
      [
        38.87,
        -84.79
      ],
      [
        39.83,
        -84.81
      ],
      [
        39.81,
        -85.01
      ],
      [
        40.05,
        -84.81
      ],
      [
        40.01,
        -85.21
      ],
      [
        39.79,
        -85.22
      ],
      [
        39.94,
        -85.86
      ],
      [
        40.84,
        -86.02
      ],
      [
        41.05,
        -85.68
      ],
      [
        41.44,
        -85.7
      ],
      [
        41.35,
        -86.28
      ],
      [
        41.76,
        -86.82
      ],
      [
        42.43,
        -86.26
      ],
      [
        42.42,
        -85.3
      ],
      [
        41.53,
        -85.19
      ],
      [
        41.71,
        -84.36
      ],
      [
        42.07,
        -84.36
      ],
      [
        42.09,
        -83.3
      ],
      [
        41.69,
        -83.44
      ],
      [
        41.38,
        -82.49
      ],
      [
        42.27,
        -79.76
      ],
      [
        42,
        -79.76
      ],
      [
        42,
        -76.61
      ],
      [
        42.17,
        -76.54
      ],
      [
        42,
        -76.49
      ],
      [
        42,
        -75.35
      ],
      [
        41.48,
        -74.98
      ],
      [
        41,
        -73.89
      ],
      [
        40.49,
        -74.28
      ],
      [
        40.33,
        -73.97
      ],
      [
        39.44,
        -74.33
      ],
      [
        38.93,
        -74.92
      ],
      [
        39.17,
        -74.9
      ],
      [
        39.34,
        -75.48
      ],
      [
        38.44,
        -75.05
      ],
      [
        38,
        -75.56
      ],
      [
        38.01,
        -75.38
      ],
      [
        37.53,
        -75.67
      ]
    ],
    [
      [
        42.51,
        -90.06
      ],
      [
        42.49,
        -87.8
      ],
      [
        40.93,
        -87.53
      ],
      [
        40.92,
        -88.33
      ],
      [
        40.62,
        -88.39
      ],
      [
        40.83,
        -88.72
      ],
      [
        40.66,
        -89.08
      ],
      [
        41.1,
        -89.29
      ],
      [
        41.38,
        -88.99
      ],
      [
        41.45,
        -90.28
      ],
      [
        42,
        -90.03
      ],
      [
        42.51,
        -90.38
      ],
      [
        42.51,
        -90.06
      ]
    ]
  ],
  "MISO": [
    [
      [
        39.27,
        -94.6
      ],
      [
        39.56,
        -94.82
      ],
      [
        39.72,
        -94.55
      ],
      [
        40.02,
        -94.61
      ],
      [
        40.13,
        -94.05
      ],
      [
        39.76,
        -94.23
      ],
      [
        39.61,
        -93.76
      ],
      [
        39.28,
        -94.13
      ],
      [
        39.27,
        -94.6
      ]
    ],
    [
      [
        28.93,
        -89.42
      ],
      [
        29.22,
        -89.3
      ],
      [
        29.41,
        -89.99
      ],
      [
        29.81,
        -90.17
      ],
      [
        29.66,
        -90.34
      ],
      [
        29.3,
        -90.01
      ],
      [
        29.09,
        -90.22
      ],
      [
        29.37,
        -90.49
      ],
      [
        29.06,
        -90.83
      ],
      [
        29.25,
        -91.28
      ],
      [
        29.44,
        -91.22
      ],
      [
        29.84,
        -91.89
      ],
      [
        29.54,
        -92.27
      ],
      [
        29.77,
        -93.5
      ],
      [
        29.36,
        -94.78
      ],
      [
        29.56,
        -94.47
      ],
      [
        29.53,
        -94.78
      ],
      [
        29.79,
        -94.74
      ],
      [
        29.55,
        -95.02
      ],
      [
        29.33,
        -94.72
      ],
      [
        29.08,
        -95.12
      ],
      [
        29.28,
        -94.87
      ],
      [
        29.2,
        -95.06
      ],
      [
        29.59,
        -95.26
      ],
      [
        29.73,
        -96.03
      ],
      [
        30.07,
        -96.15
      ],
      [
        30.04,
        -96.62
      ],
      [
        30.16,
        -96.79
      ],
      [
        30.3,
        -96.64
      ],
      [
        30.56,
        -96.96
      ],
      [
        30.46,
        -97.16
      ],
      [
        30.75,
        -97.32
      ],
      [
        30.99,
        -97.07
      ],
      [
        31.28,
        -97.28
      ],
      [
        31.52,
        -96.8
      ],
      [
        31.71,
        -96.93
      ],
      [
        31.8,
        -96.5
      ],
      [
        31.41,
        -96.24
      ],
      [
        31.65,
        -95.74
      ],
      [
        31.43,
        -95
      ],
      [
        32.37,
        -94.99
      ],
      [
        32.39,
        -94.04
      ],
      [
        33.55,
        -94.04
      ],
      [
        33.64,
        -94.49
      ],
      [
        35.32,
        -94.43
      ],
      [
        35.41,
        -94.21
      ],
      [
        35.07,
        -94.23
      ],
      [
        35.02,
        -93.7
      ],
      [
        35.21,
        -93.28
      ],
      [
        35.73,
        -93.16
      ],
      [
        35.73,
        -93.52
      ],
      [
        36.08,
        -93.45
      ],
      [
        36.31,
        -93.87
      ],
      [
        35.76,
        -93.96
      ],
      [
        35.76,
        -94.49
      ],
      [
        36.5,
        -94.62
      ],
      [
        36.5,
        -90.1
      ],
      [
        36.72,
        -90.1
      ],
      [
        36.72,
        -90.63
      ],
      [
        36.93,
        -90.62
      ],
      [
        36.93,
        -90.11
      ],
      [
        37.37,
        -90.15
      ],
      [
        37.36,
        -89.86
      ],
      [
        37.56,
        -89.86
      ],
      [
        37.59,
        -91.07
      ],
      [
        37.31,
        -91.18
      ],
      [
        38.29,
        -91.15
      ],
      [
        38.16,
        -92.18
      ],
      [
        37.95,
        -92.22
      ],
      [
        38.22,
        -92.7
      ],
      [
        38.79,
        -92.78
      ],
      [
        39.45,
        -92.46
      ],
      [
        39.7,
        -93.36
      ],
      [
        40.03,
        -93.36
      ],
      [
        40.04,
        -92.86
      ],
      [
        40.59,
        -92.71
      ],
      [
        40.45,
        -92.05
      ],
      [
        40.61,
        -91.94
      ],
      [
        40.59,
        -95.77
      ],
      [
        41.97,
        -96.13
      ],
      [
        42.74,
        -96.64
      ],
      [
        43.08,
        -96.45
      ],
      [
        43.2,
        -98.11
      ],
      [
        43.85,
        -97.97
      ],
      [
        43.85,
        -98.33
      ],
      [
        44.2,
        -98.33
      ],
      [
        44.2,
        -97.85
      ],
      [
        44.54,
        -97.85
      ],
      [
        44.54,
        -97.49
      ],
      [
        45.15,
        -97.49
      ],
      [
        45.24,
        -98.72
      ],
      [
        44.9,
        -98.72
      ],
      [
        44.9,
        -100.4
      ],
      [
        45.47,
        -100.34
      ],
      [
        45.47,
        -102
      ],
      [
        45.04,
        -102
      ],
      [
        45.21,
        -104.04
      ],
      [
        45.75,
        -104.05
      ],
      [
        45.6,
        -104.4
      ],
      [
        45.88,
        -104.72
      ],
      [
        46.6,
        -104.73
      ],
      [
        46.6,
        -105.1
      ],
      [
        46.25,
        -105.27
      ],
      [
        45.97,
        -105.92
      ],
      [
        45.97,
        -106.33
      ],
      [
        46.69,
        -106.4
      ],
      [
        47.05,
        -104.93
      ],
      [
        47.48,
        -104.93
      ],
      [
        47.65,
        -106
      ],
      [
        48.24,
        -106.12
      ],
      [
        48.57,
        -104.05
      ],
      [
        49,
        -104.05
      ],
      [
        49,
        -95.15
      ],
      [
        49.38,
        -95.15
      ],
      [
        49.37,
        -94.96
      ],
      [
        48.74,
        -94.64
      ],
      [
        48.52,
        -93.79
      ],
      [
        48.63,
        -92.95
      ],
      [
        48.04,
        -91.57
      ],
      [
        48.25,
        -90.89
      ],
      [
        48.01,
        -89.49
      ],
      [
        47.61,
        -90.78
      ],
      [
        46.79,
        -92.09
      ],
      [
        46.68,
        -91.97
      ],
      [
        46.96,
        -90.86
      ],
      [
        46.7,
        -90.85
      ],
      [
        46.56,
        -90.43
      ],
      [
        47.48,
        -87.94
      ],
      [
        47.4,
        -87.71
      ],
      [
        47.2,
        -88.23
      ],
      [
        46.75,
        -88.48
      ],
      [
        46.97,
        -88.14
      ],
      [
        46.82,
        -88.29
      ],
      [
        46.89,
        -87.82
      ],
      [
        46.5,
        -87.35
      ],
      [
        46.77,
        -84.96
      ],
      [
        46.48,
        -85.03
      ],
      [
        46.49,
        -84.3
      ],
      [
        45.96,
        -83.91
      ],
      [
        46.05,
        -84.66
      ],
      [
        45.84,
        -84.75
      ],
      [
        46.1,
        -85.5
      ],
      [
        45.94,
        -86.28
      ],
      [
        45.6,
        -86.61
      ],
      [
        45.89,
        -86.54
      ],
      [
        45.67,
        -86.97
      ],
      [
        45.9,
        -86.99
      ],
      [
        44.58,
        -88.04
      ],
      [
        45.28,
        -86.97
      ],
      [
        44.18,
        -87.52
      ],
      [
        43.8,
        -88
      ],
      [
        43.61,
        -87.76
      ],
      [
        42.78,
        -87.76
      ],
      [
        42.49,
        -87.8
      ],
      [
        42.5,
        -88.2
      ],
      [
        42.15,
        -88.2
      ],
      [
        42.2,
        -90.22
      ],
      [
        41.93,
        -90.05
      ],
      [
        41.93,
        -89.63
      ],
      [
        41.58,
        -89.63
      ],
      [
        41.6,
        -88.26
      ],
      [
        41.46,
        -88.6
      ],
      [
        41.11,
        -88.59
      ],
      [
        41.11,
        -88.93
      ],
      [
        40.75,
        -88.99
      ],
      [
        40.93,
        -88.88
      ],
      [
        41.01,
        -87.53
      ],
      [
        41.74,
        -87.52
      ],
      [
        41.76,
        -86.52
      ],
      [
        41.48,
        -86.3
      ],
      [
        41.76,
        -85.41
      ],
      [
        41.93,
        -85.62
      ],
      [
        42.16,
        -85.47
      ],
      [
        42.42,
        -85.91
      ],
      [
        42.1,
        -86.13
      ],
      [
        44.07,
        -86.52
      ],
      [
        44.92,
        -86.08
      ],
      [
        45.21,
        -85.54
      ],
      [
        44.75,
        -85.52
      ],
      [
        45.27,
        -85.38
      ],
      [
        45.4,
        -84.97
      ],
      [
        45.58,
        -85.12
      ],
      [
        45.79,
        -84.77
      ],
      [
        45.29,
        -83.38
      ],
      [
        44.32,
        -83.33
      ],
      [
        43.72,
        -83.94
      ],
      [
        43.58,
        -83.68
      ],
      [
        43.92,
        -83.4
      ],
      [
        44.02,
        -82.79
      ],
      [
        42.98,
        -82.41
      ],
      [
        41.73,
        -83.43
      ],
      [
        41.47,
        -85.59
      ],
      [
        41.12,
        -85.69
      ],
      [
        40.81,
        -85.33
      ],
      [
        40.67,
        -85.77
      ],
      [
        40.38,
        -85.86
      ],
      [
        40.38,
        -85.58
      ],
      [
        40.08,
        -85.58
      ],
      [
        40.21,
        -84.81
      ],
      [
        38.79,
        -84.81
      ],
      [
        38.73,
        -85.44
      ],
      [
        38.02,
        -85.93
      ],
      [
        38.01,
        -86.19
      ],
      [
        37.84,
        -86
      ],
      [
        37.59,
        -86.26
      ],
      [
        37.56,
        -86.85
      ],
      [
        37.32,
        -87.11
      ],
      [
        37.56,
        -87.37
      ],
      [
        37.41,
        -87.18
      ],
      [
        37.4,
        -87.64
      ],
      [
        37.13,
        -87.88
      ],
      [
        37.34,
        -88.2
      ],
      [
        36.99,
        -88.14
      ],
      [
        36.83,
        -88.73
      ],
      [
        36.97,
        -89.08
      ],
      [
        37.18,
        -88.79
      ],
      [
        37.12,
        -89.11
      ],
      [
        36.58,
        -89.21
      ],
      [
        36.56,
        -89.57
      ],
      [
        35.89,
        -89.64
      ],
      [
        35.73,
        -89.96
      ],
      [
        35.14,
        -90.07
      ],
      [
        35,
        -90.31
      ],
      [
        35,
        -89.57
      ],
      [
        33.92,
        -89.72
      ],
      [
        33.88,
        -89.27
      ],
      [
        32.61,
        -89.43
      ],
      [
        32.55,
        -88.76
      ],
      [
        32.03,
        -88.81
      ],
      [
        32,
        -88.46
      ],
      [
        31.7,
        -88.46
      ],
      [
        31.7,
        -88.09
      ],
      [
        31.39,
        -87.89
      ],
      [
        30.31,
        -88.14
      ],
      [
        30.3,
        -89.29
      ],
      [
        30.88,
        -89.34
      ],
      [
        30.9,
        -89.77
      ],
      [
        30.12,
        -89.53
      ],
      [
        29.96,
        -89.85
      ],
      [
        29.87,
        -89.62
      ],
      [
        30.08,
        -89.48
      ],
      [
        29.76,
        -89.29
      ],
      [
        29.6,
        -89.73
      ],
      [
        29.18,
        -89
      ],
      [
        28.93,
        -89.42
      ]
    ],
    [
      [
        39.34,
        -91.86
      ],
      [
        39.69,
        -91.72
      ],
      [
        39.68,
        -91.31
      ],
      [
        39.94,
        -91.43
      ],
      [
        39.95,
        -92.01
      ],
      [
        39.66,
        -92
      ],
      [
        39.61,
        -92.3
      ],
      [
        39.35,
        -92.21
      ],
      [
        39.34,
        -91.86
      ]
    ],
    [
      [
        43.5,
        -96.1
      ],
      [
        44.23,
        -96.14
      ],
      [
        44.2,
        -95.63
      ],
      [
        44.41,
        -95.59
      ],
      [
        44.79,
        -96.45
      ],
      [
        43.5,
        -96.45
      ],
      [
        43.5,
        -96.1
      ]
    ],
    [
      [
        45.4,
        -96.56
      ],
      [
        45.58,
        -96.16
      ],
      [
        46.01,
        -96.27
      ],
      [
        46.02,
        -96.55
      ],
      [
        45.64,
        -96.84
      ],
      [
        45.4,
        -96.56
      ]
    ],
    [
      [
        46.63,
        -103.35
      ],
      [
        47.33,
        -103.03
      ],
      [
        47.33,
        -103.67
      ],
      [
        46.63,
        -103.61
      ],
      [
        46.63,
        -103.35
      ]
    ]
  ],
  "SPP": [
    [
      [
        42.56,
        -92.79
      ],
      [
        42.56,
        -93.03
      ],
      [
        43.17,
        -93.02
      ],
      [
        43.13,
        -92.75
      ],
      [
        42.99,
        -92.74
      ],
      [
        43.1,
        -92.08
      ],
      [
        42.64,
        -92.08
      ],
      [
        42.56,
        -92.79
      ]
    ],
    [
      [
        42.35,
        -93.79
      ],
      [
        42.35,
        -94.05
      ],
      [
        42.49,
        -94.09
      ],
      [
        42.85,
        -93.97
      ],
      [
        42.85,
        -93.76
      ],
      [
        43.03,
        -93.77
      ],
      [
        43.03,
        -93.97
      ],
      [
        43.25,
        -93.97
      ],
      [
        43.28,
        -93.39
      ],
      [
        42.53,
        -93.5
      ],
      [
        42.35,
        -93.79
      ]
    ],
    [
      [
        30.86,
        -93.48
      ],
      [
        31.59,
        -93.84
      ],
      [
        31.65,
        -94.4
      ],
      [
        31.22,
        -94.33
      ],
      [
        31.57,
        -94.92
      ],
      [
        32.14,
        -94.99
      ],
      [
        32.14,
        -95.46
      ],
      [
        32.35,
        -95.45
      ],
      [
        32.36,
        -96.08
      ],
      [
        32.84,
        -96.08
      ],
      [
        32.84,
        -95.93
      ],
      [
        33.22,
        -95.86
      ],
      [
        33.38,
        -95.31
      ],
      [
        33.88,
        -95.31
      ],
      [
        33.94,
        -95.59
      ],
      [
        33.69,
        -96.35
      ],
      [
        33.96,
        -96.98
      ],
      [
        33.72,
        -97.13
      ],
      [
        33.91,
        -97.21
      ],
      [
        33.82,
        -97.43
      ],
      [
        33.99,
        -97.67
      ],
      [
        33.85,
        -97.87
      ],
      [
        34.15,
        -98.11
      ],
      [
        34.16,
        -98.37
      ],
      [
        33.4,
        -98.42
      ],
      [
        33.4,
        -99.47
      ],
      [
        33.75,
        -99.48
      ],
      [
        33.83,
        -99.69
      ],
      [
        33.83,
        -101.04
      ],
      [
        32.52,
        -101.17
      ],
      [
        32.53,
        -101.69
      ],
      [
        31.65,
        -101.78
      ],
      [
        31.65,
        -102.8
      ],
      [
        32.09,
        -102.8
      ],
      [
        32,
        -104.85
      ],
      [
        32.52,
        -104.85
      ],
      [
        32.52,
        -105.35
      ],
      [
        33.13,
        -105.32
      ],
      [
        33.14,
        -104.91
      ],
      [
        34.35,
        -104.89
      ],
      [
        34.35,
        -105.31
      ],
      [
        35.04,
        -105.29
      ],
      [
        35.04,
        -105.71
      ],
      [
        35.87,
        -105.72
      ],
      [
        35.78,
        -104.36
      ],
      [
        36.22,
        -104.44
      ],
      [
        36.22,
        -104.01
      ],
      [
        37,
        -104.01
      ],
      [
        37,
        -103.09
      ],
      [
        37.64,
        -103.08
      ],
      [
        37.64,
        -102.04
      ],
      [
        41,
        -102.05
      ],
      [
        41,
        -103.38
      ],
      [
        41.7,
        -103.37
      ],
      [
        41.7,
        -104.05
      ],
      [
        43,
        -104.05
      ],
      [
        43.02,
        -103.81
      ],
      [
        43.01,
        -104.07
      ],
      [
        43.17,
        -103.95
      ],
      [
        44.35,
        -104.06
      ],
      [
        44.22,
        -103.45
      ],
      [
        44.26,
        -103.57
      ],
      [
        44.6,
        -103.57
      ],
      [
        44.57,
        -104.06
      ],
      [
        48.12,
        -104.05
      ],
      [
        48.03,
        -106.43
      ],
      [
        47.71,
        -106.75
      ],
      [
        47.69,
        -107.43
      ],
      [
        48.43,
        -107.37
      ],
      [
        48.56,
        -106.93
      ],
      [
        49,
        -106.97
      ],
      [
        49,
        -99
      ],
      [
        48.53,
        -98.97
      ],
      [
        48.3,
        -99.2
      ],
      [
        48.02,
        -99.07
      ],
      [
        47.92,
        -98.53
      ],
      [
        48.19,
        -98.42
      ],
      [
        48.19,
        -97.9
      ],
      [
        47.67,
        -97.88
      ],
      [
        47.67,
        -98.53
      ],
      [
        47.85,
        -98.53
      ],
      [
        47.85,
        -98.9
      ],
      [
        47.54,
        -98.5
      ],
      [
        47.24,
        -98.44
      ],
      [
        47.24,
        -97.71
      ],
      [
        46.63,
        -97.68
      ],
      [
        46.63,
        -98.34
      ],
      [
        46.55,
        -98.1
      ],
      [
        46.22,
        -98.07
      ],
      [
        46.32,
        -97.67
      ],
      [
        46.62,
        -97.33
      ],
      [
        46.63,
        -96.79
      ],
      [
        47.15,
        -96.84
      ],
      [
        47.15,
        -96.19
      ],
      [
        46.63,
        -96.17
      ],
      [
        46.63,
        -96.79
      ],
      [
        46.25,
        -96.6
      ],
      [
        46.03,
        -96.11
      ],
      [
        45.58,
        -96.16
      ],
      [
        45.42,
        -96.61
      ],
      [
        44.7,
        -95.36
      ],
      [
        44.54,
        -95.36
      ],
      [
        44.63,
        -96.16
      ],
      [
        44.52,
        -95.77
      ],
      [
        44.31,
        -95.7
      ],
      [
        44.41,
        -95.59
      ],
      [
        44.23,
        -95.64
      ],
      [
        44.23,
        -96.13
      ],
      [
        44.01,
        -96.34
      ],
      [
        43.83,
        -96.12
      ],
      [
        44,
        -96.29
      ],
      [
        44.13,
        -96.05
      ],
      [
        43.5,
        -96.07
      ],
      [
        43.5,
        -93.97
      ],
      [
        43.28,
        -94.06
      ],
      [
        43.28,
        -94.44
      ],
      [
        42.56,
        -94.44
      ],
      [
        42.56,
        -95.33
      ],
      [
        42.34,
        -95.32
      ],
      [
        42.21,
        -95.09
      ],
      [
        42.21,
        -94.63
      ],
      [
        41.86,
        -94.63
      ],
      [
        41.86,
        -94.28
      ],
      [
        41.5,
        -94.24
      ],
      [
        41.5,
        -94.93
      ],
      [
        41.16,
        -94.93
      ],
      [
        41.16,
        -95.88
      ],
      [
        40.72,
        -95.88
      ],
      [
        40.58,
        -95.77
      ],
      [
        40.58,
        -93.56
      ],
      [
        40.27,
        -93.49
      ],
      [
        40.39,
        -92.86
      ],
      [
        40.04,
        -92.86
      ],
      [
        40.03,
        -93.36
      ],
      [
        39.7,
        -93.36
      ],
      [
        39.7,
        -92.86
      ],
      [
        40.04,
        -92.85
      ],
      [
        39.95,
        -92.29
      ],
      [
        39.61,
        -92.3
      ],
      [
        39.61,
        -92.67
      ],
      [
        39.2,
        -92.66
      ],
      [
        38.97,
        -93.05
      ],
      [
        38.06,
        -93.07
      ],
      [
        38.07,
        -93.5
      ],
      [
        37.83,
        -93.57
      ],
      [
        37.9,
        -93.92
      ],
      [
        37.58,
        -93.93
      ],
      [
        37.41,
        -93.07
      ],
      [
        36.81,
        -92.91
      ],
      [
        36.82,
        -93.34
      ],
      [
        36.99,
        -93.34
      ],
      [
        37,
        -93.61
      ],
      [
        37.28,
        -93.61
      ],
      [
        37.36,
        -94.62
      ],
      [
        36.5,
        -94.62
      ],
      [
        36.5,
        -93.36
      ],
      [
        36.12,
        -93.33
      ],
      [
        36,
        -92.96
      ],
      [
        35.41,
        -93.05
      ],
      [
        34.96,
        -93.85
      ],
      [
        34.78,
        -93.71
      ],
      [
        34.73,
        -94.05
      ],
      [
        34.14,
        -93.98
      ],
      [
        33.89,
        -93.54
      ],
      [
        33.55,
        -93.95
      ],
      [
        33.25,
        -93.87
      ],
      [
        33.21,
        -94.04
      ],
      [
        33.02,
        -94.04
      ],
      [
        33.02,
        -93.58
      ],
      [
        32,
        -93.09
      ],
      [
        32.13,
        -92.95
      ],
      [
        31.8,
        -92.85
      ],
      [
        32.05,
        -92.53
      ],
      [
        31.81,
        -92.62
      ],
      [
        31.42,
        -92.5
      ],
      [
        31.52,
        -92.72
      ],
      [
        31.35,
        -92.98
      ],
      [
        31.25,
        -92.83
      ],
      [
        30.88,
        -92.82
      ],
      [
        30.86,
        -93.48
      ]
    ],
    [
      [
        39.24,
        -94.27
      ],
      [
        39.45,
        -93.78
      ],
      [
        39.78,
        -93.76
      ],
      [
        39.79,
        -94.21
      ],
      [
        40.03,
        -94.2
      ],
      [
        40.04,
        -94.41
      ],
      [
        39.52,
        -94.55
      ],
      [
        39.24,
        -94.27
      ]
    ],
    [
      [
        40.65,
        -101.2
      ],
      [
        40.7,
        -100.87
      ],
      [
        40.83,
        -100.87
      ],
      [
        41.05,
        -100.93
      ],
      [
        41.15,
        -101.35
      ],
      [
        41.23,
        -101.14
      ],
      [
        41.39,
        -101.14
      ],
      [
        41.4,
        -101.41
      ],
      [
        41.65,
        -101.41
      ],
      [
        41.74,
        -101.19
      ],
      [
        41.74,
        -101.43
      ],
      [
        42.09,
        -101.43
      ],
      [
        42.2,
        -101.11
      ],
      [
        42.5,
        -101.22
      ],
      [
        42.6,
        -101.04
      ],
      [
        42.77,
        -101.06
      ],
      [
        42.77,
        -101.36
      ],
      [
        43,
        -101.37
      ],
      [
        43,
        -100.2
      ],
      [
        43.71,
        -100.23
      ],
      [
        43.86,
        -101.03
      ],
      [
        43.62,
        -101.18
      ],
      [
        43.72,
        -101.87
      ],
      [
        43.52,
        -102.47
      ],
      [
        43.67,
        -102.51
      ],
      [
        43.66,
        -102.92
      ],
      [
        43,
        -103
      ],
      [
        43,
        -103.5
      ],
      [
        42.44,
        -103.48
      ],
      [
        42.44,
        -102.75
      ],
      [
        41.22,
        -102.61
      ],
      [
        41.22,
        -102.06
      ],
      [
        41.08,
        -102.06
      ],
      [
        41.19,
        -101.68
      ],
      [
        41.05,
        -101.68
      ],
      [
        41,
        -102.05
      ],
      [
        41,
        -101.25
      ],
      [
        40.65,
        -101.34
      ],
      [
        40.65,
        -101.2
      ]
    ]
  ],
  "CAISO": [
    [
      [
        32.53,
        -117.12
      ],
      [
        33.31,
        -117.49
      ],
      [
        33.8,
        -118.3
      ],
      [
        34.1,
        -118.16
      ],
      [
        34.28,
        -118.24
      ],
      [
        34.3,
        -118.59
      ],
      [
        34.04,
        -118.57
      ],
      [
        34,
        -118.81
      ],
      [
        34.41,
        -119.56
      ],
      [
        34.44,
        -120.45
      ],
      [
        34.58,
        -120.65
      ],
      [
        35.14,
        -120.65
      ],
      [
        36.31,
        -121.9
      ],
      [
        36.93,
        -121.86
      ],
      [
        37.2,
        -122.41
      ],
      [
        37.81,
        -122.48
      ],
      [
        37.51,
        -122.25
      ],
      [
        37.45,
        -121.94
      ],
      [
        37.93,
        -122.42
      ],
      [
        38.06,
        -122.26
      ],
      [
        38.11,
        -122.49
      ],
      [
        37.82,
        -122.53
      ],
      [
        38.09,
        -122.93
      ],
      [
        38,
        -123.02
      ],
      [
        38.24,
        -123
      ],
      [
        38.08,
        -122.83
      ],
      [
        38.22,
        -122.92
      ],
      [
        38.92,
        -123.73
      ],
      [
        39.83,
        -123.85
      ],
      [
        40.44,
        -124.41
      ],
      [
        40.83,
        -124.08
      ],
      [
        40.76,
        -124.23
      ],
      [
        41.46,
        -124.06
      ],
      [
        41.38,
        -123.5
      ],
      [
        41.18,
        -123.41
      ],
      [
        40.94,
        -123.45
      ],
      [
        40.93,
        -123.62
      ],
      [
        39.98,
        -123.54
      ],
      [
        39.98,
        -122.93
      ],
      [
        40.35,
        -123.07
      ],
      [
        40.57,
        -122.7
      ],
      [
        40.88,
        -122.63
      ],
      [
        40.87,
        -121.94
      ],
      [
        41.18,
        -121.94
      ],
      [
        41.18,
        -121.13
      ],
      [
        41,
        -121.11
      ],
      [
        41,
        -120.64
      ],
      [
        40.68,
        -120.64
      ],
      [
        40.76,
        -120
      ],
      [
        39,
        -120
      ],
      [
        35.21,
        -114.9
      ],
      [
        34.56,
        -114.97
      ],
      [
        34.57,
        -114.4
      ],
      [
        34.3,
        -114.14
      ],
      [
        33.93,
        -114.54
      ],
      [
        33.17,
        -114.68
      ],
      [
        33.43,
        -114.79
      ],
      [
        33.43,
        -115.26
      ],
      [
        33.86,
        -115.77
      ],
      [
        34.04,
        -115.77
      ],
      [
        34.03,
        -116.41
      ],
      [
        32.62,
        -116.11
      ],
      [
        32.53,
        -117.12
      ]
    ],
    [
      [
        36.13,
        -117.86
      ],
      [
        36.29,
        -117.6
      ],
      [
        36.47,
        -117.89
      ],
      [
        37.34,
        -118.04
      ],
      [
        37.46,
        -118.58
      ],
      [
        37.39,
        -118.33
      ],
      [
        37.2,
        -118.27
      ],
      [
        37.12,
        -118.59
      ],
      [
        37.06,
        -118.44
      ],
      [
        36.13,
        -118.07
      ],
      [
        36.13,
        -117.86
      ]
    ],
    [
      [
        37.28,
        -121.26
      ],
      [
        37.42,
        -120.67
      ],
      [
        37.7,
        -120.37
      ],
      [
        38.08,
        -120.93
      ],
      [
        37.74,
        -121.3
      ],
      [
        37.54,
        -121.12
      ],
      [
        37.4,
        -121.45
      ],
      [
        37.28,
        -121.26
      ]
    ]
  ],
  "ISONE": [
    [
      [
        45.36,
        -70.48
      ],
      [
        45.67,
        -70.55
      ],
      [
        45.89,
        -70.26
      ],
      [
        46.19,
        -70.29
      ],
      [
        46.7,
        -70
      ],
      [
        47.46,
        -69.23
      ],
      [
        47.18,
        -68.9
      ],
      [
        47.36,
        -68.23
      ],
      [
        47.07,
        -67.79
      ],
      [
        45.69,
        -67.82
      ],
      [
        45.58,
        -67.43
      ],
      [
        45.28,
        -67.49
      ],
      [
        45.16,
        -67.16
      ],
      [
        44.91,
        -66.98
      ],
      [
        44.95,
        -67.16
      ],
      [
        44.84,
        -67.12
      ],
      [
        44.81,
        -66.95
      ],
      [
        44.53,
        -67.57
      ],
      [
        44.61,
        -67.79
      ],
      [
        44.33,
        -68.06
      ],
      [
        44.54,
        -68.32
      ],
      [
        44.39,
        -68.18
      ],
      [
        44.24,
        -68.25
      ],
      [
        44.46,
        -68.48
      ],
      [
        44.23,
        -68.53
      ],
      [
        44.45,
        -68.93
      ],
      [
        43.93,
        -69.21
      ],
      [
        44.02,
        -69.39
      ],
      [
        43.7,
        -69.84
      ],
      [
        43.76,
        -70.19
      ],
      [
        43.57,
        -70.2
      ],
      [
        42.91,
        -70.81
      ],
      [
        42.69,
        -70.79
      ],
      [
        42.64,
        -70.59
      ],
      [
        42.37,
        -71.06
      ],
      [
        42.21,
        -70.72
      ],
      [
        41.76,
        -70.47
      ],
      [
        41.79,
        -70.02
      ],
      [
        42.06,
        -70.25
      ],
      [
        42.05,
        -70.07
      ],
      [
        41.63,
        -69.96
      ],
      [
        41.51,
        -70.66
      ],
      [
        41.75,
        -70.62
      ],
      [
        41.74,
        -70.73
      ],
      [
        41.45,
        -71.2
      ],
      [
        41.7,
        -71.17
      ],
      [
        41.74,
        -71.29
      ],
      [
        41.36,
        -71.48
      ],
      [
        41.3,
        -72.91
      ],
      [
        40.99,
        -73.66
      ],
      [
        41.1,
        -73.73
      ],
      [
        41.21,
        -73.48
      ],
      [
        42.09,
        -73.51
      ],
      [
        42.75,
        -73.26
      ],
      [
        43.53,
        -73.24
      ],
      [
        43.59,
        -73.43
      ],
      [
        45.01,
        -73.34
      ],
      [
        45.01,
        -71.5
      ],
      [
        45.24,
        -71.44
      ],
      [
        45.31,
        -71.09
      ],
      [
        44.99,
        -71.06
      ],
      [
        45,
        -70.93
      ],
      [
        45.22,
        -70.83
      ],
      [
        45.16,
        -70.56
      ],
      [
        45.34,
        -70.6
      ],
      [
        45.36,
        -70.48
      ]
    ]
  ],
  "NYISO": [
    [
      [
        41.16,
        -72.23
      ],
      [
        40.9,
        -72.51
      ],
      [
        41.07,
        -71.86
      ],
      [
        40.62,
        -73.25
      ],
      [
        40.75,
        -72.88
      ],
      [
        40.62,
        -74.04
      ],
      [
        40.9,
        -73.63
      ],
      [
        40.98,
        -72.64
      ],
      [
        41.16,
        -72.23
      ]
    ],
    [
      [
        42.57,
        -79.14
      ],
      [
        42.79,
        -78.85
      ],
      [
        43.26,
        -79.07
      ],
      [
        43.31,
        -76.78
      ],
      [
        43.55,
        -76.21
      ],
      [
        43.85,
        -76.3
      ],
      [
        43.91,
        -76.13
      ],
      [
        44.07,
        -76.36
      ],
      [
        44.2,
        -76.31
      ],
      [
        44.85,
        -75.28
      ],
      [
        44.85,
        -74.83
      ],
      [
        45,
        -74.72
      ],
      [
        45.01,
        -73.34
      ],
      [
        43.59,
        -73.43
      ],
      [
        43.53,
        -73.24
      ],
      [
        42.75,
        -73.26
      ],
      [
        42.09,
        -73.51
      ],
      [
        41.21,
        -73.48
      ],
      [
        40.71,
        -73.98
      ],
      [
        41.04,
        -74
      ],
      [
        41.02,
        -74.37
      ],
      [
        41.22,
        -74.4
      ],
      [
        41.35,
        -74.67
      ],
      [
        41.08,
        -75.03
      ],
      [
        41.25,
        -75.13
      ],
      [
        41.24,
        -75.36
      ],
      [
        41.62,
        -75.04
      ],
      [
        41.81,
        -75.07
      ],
      [
        42,
        -75.36
      ],
      [
        42,
        -76.49
      ],
      [
        42.17,
        -76.58
      ],
      [
        42,
        -76.61
      ],
      [
        42,
        -79.76
      ],
      [
        42.27,
        -79.76
      ],
      [
        42.57,
        -79.14
      ]
    ]
  ]
};
`,
  "Layout.tsx": `import { Link, useLocation } from "wouter";
import { Building2, Zap, Home, Swords, Activity, Map, Newspaper, ListOrdered, Settings2 } from "lucide-react";
import { PerplexityAttribution } from "@/components/PerplexityAttribution";
import GlobalSearch from "@/components/GlobalSearch";

const navItems = [
  { href: "/",           label: "Overview",     icon: Home        },
  { href: "/news",       label: "News",         icon: Newspaper   },
  { href: "/projects",   label: "Projects",     icon: Zap         },
  { href: "/companies",  label: "Companies",    icon: Building2   },
  { href: "/competitors",label: "Competitors",  icon: Swords      },
  { href: "/queue",      label: "Queue Intel",  icon: ListOrdered },
  { href: "/macro",      label: "Federal / RTO", icon: Activity    },
  { href: "/map",        label: "Map",          icon: Map         },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-border flex flex-col bg-card">
        {/* Logo */}
        <div className="px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Zap size={14} className="text-primary" />
            </div>
            <div>
              <div className="text-xs font-semibold text-foreground tracking-wide uppercase">DC Intel</div>
              <div className="text-[10px] text-muted-foreground">BTM Generation Tracker</div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="px-0 pt-2">
          <GlobalSearch />
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-1 space-y-0.5">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? location === "/" : location.startsWith(href);
            return (
              <Link key={href} href={href}>
                <a className={\`sidebar-item flex items-center gap-2.5 px-3 py-2 rounded-md text-sm cursor-pointer \${active ? "active text-primary" : "text-muted-foreground"}\`}>
                  <Icon size={15} />
                  {label}
                </a>
              </Link>
            );
          })}
        </nav>

        {/* Settings + footer */}
        <div className="px-2 pb-2 border-t border-border pt-2">
          <Link href="/settings">
            <a className={\`sidebar-item flex items-center gap-2.5 px-3 py-2 rounded-md text-sm cursor-pointer \${
              location.startsWith('/settings') ? 'active text-primary' : 'text-muted-foreground'
            }\`}>
              <Settings2 size={15} />
              Settings
            </a>
          </Link>
          <div className="px-2 pt-2">
            <PerplexityAttribution />
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto overscroll-contain">
        {children}
      </main>
    </div>
  );
}
`,
  "GlobalSearch.tsx": `import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Search, X, Zap, Building2, Swords, Newspaper, MapPin } from "lucide-react";

type SearchProject = { id: number; name: string; location: string; state: string | null; status: string; capacityMw: number | null; type: "project" };
type SearchCompany = { id: number; name: string; ticker: string | null; hq: string | null; role: string; type: "company" };
type SearchCompetitor = { id: number; name: string; ticker: string | null; hq: string | null; type: "competitor" };
type SearchNews = { id: number; headline: string; competitorId: number; competitorName: string; publishedDate: string | null; category: string | null; type: "news" };

type SearchResults = {
  projects: SearchProject[];
  companies: SearchCompany[];
  competitors: SearchCompetitor[];
  news: SearchNews[];
};

const STATUS_COLORS: Record<string, string> = {
  announced: "text-amber-400",
  under_construction: "text-blue-400",
  operational: "text-emerald-400",
  planned: "text-slate-400",
};

const ROLE_LABELS: Record<string, string> = {
  hyperscaler: "Hyperscaler",
  dc_operator: "DC Operator",
  btm_developer: "BTM Developer",
  tech_vendor: "Tech Vendor",
  fuel_supplier: "Fuel Supplier",
  investor: "Investor",
};

function formatMw(mw: number | null): string {
  if (!mw) return "";
  if (mw >= 1000) return \`\${(mw / 1000).toFixed(1)} GW\`;
  return \`\${mw} MW\`;
}

export default function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [, navigate] = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalResults = results
    ? results.projects.length + results.companies.length + results.competitors.length + results.news.length
    : 0;

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) { setResults(null); setLoading(false); return; }
    setLoading(true);
    try {
      const r = await apiRequest("GET", \`/api/search?q=\${encodeURIComponent(q)}\`);
      const data: SearchResults = await r.json();
      setResults(data);
    } catch { setResults(null); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(query), 220);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, doSearch]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Escape") { setOpen(false); setQuery(""); }
  }

  function go(path: string) {
    setOpen(false);
    setQuery("");
    setResults(null);
    navigate(path);
  }

  const hasResults = results && totalResults > 0;

  return (
    <div ref={containerRef} className="relative px-2 mb-2">
      {/* Input */}
      <div className={\`flex items-center gap-2 px-2.5 py-2 rounded-md border transition-colors \${open ? "border-primary/50 bg-background" : "border-border bg-muted/40"}\`}>
        <Search size={13} className="text-muted-foreground shrink-0" />
        <input
          ref={inputRef}
          data-testid="global-search-input"
          type="text"
          placeholder="Search projects, companies…"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKey}
          className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none min-w-0"
        />
        {query && (
          <button onClick={() => { setQuery(""); setResults(null); }} className="text-muted-foreground hover:text-foreground">
            <X size={11} />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && query.length >= 2 && (
        <div className="absolute left-2 right-2 top-full mt-1 z-50 bg-card border border-border rounded-lg shadow-xl overflow-hidden max-h-[420px] overflow-y-auto">
          {loading && (
            <div className="px-3 py-4 text-xs text-muted-foreground text-center">Searching…</div>
          )}

          {!loading && results && totalResults === 0 && (
            <div className="px-3 py-4 text-xs text-muted-foreground text-center">
              No results for "{query}"
            </div>
          )}

          {!loading && hasResults && (
            <>
              {/* Projects */}
              {results.projects.length > 0 && (
                <div>
                  <div className="px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide bg-muted/30 flex items-center gap-1.5">
                    <Zap size={9} className="text-primary" /> Projects
                  </div>
                  {results.projects.map((p) => (
                    <button
                      key={p.id}
                      data-testid={\`search-result-project-\${p.id}\`}
                      onClick={() => go(\`/projects/\${p.id}\`)}
                      className="w-full text-left px-3 py-2 hover:bg-muted/50 flex items-center justify-between gap-2 border-b border-border/40 last:border-0"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-foreground truncate">{p.name}</div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <MapPin size={9} className="text-muted-foreground shrink-0" />
                          <span className="text-[10px] text-muted-foreground truncate">{p.location}{p.state ? \`, \${p.state}\` : ""}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {p.capacityMw && <span className="text-[10px] text-muted-foreground">{formatMw(p.capacityMw)}</span>}
                        <span className={\`text-[9px] font-medium \${STATUS_COLORS[p.status] ?? "text-muted-foreground"}\`}>
                          {p.status.replace("_", " ")}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Companies */}
              {results.companies.length > 0 && (
                <div>
                  <div className="px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide bg-muted/30 flex items-center gap-1.5">
                    <Building2 size={9} className="text-blue-400" /> Companies
                  </div>
                  {results.companies.map((c) => (
                    <button
                      key={c.id}
                      data-testid={\`search-result-company-\${c.id}\`}
                      onClick={() => go(\`/companies/\${c.id}\`)}
                      className="w-full text-left px-3 py-2 hover:bg-muted/50 flex items-center justify-between gap-2 border-b border-border/40 last:border-0"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-foreground truncate">{c.name}</div>
                        {c.hq && <div className="text-[10px] text-muted-foreground truncate">{c.hq}</div>}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {c.ticker && <span className="text-[9px] font-mono bg-muted px-1 py-0.5 rounded text-muted-foreground">{c.ticker}</span>}
                        <span className="text-[9px] text-muted-foreground">{ROLE_LABELS[c.role] ?? c.role}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Competitors */}
              {results.competitors.length > 0 && (
                <div>
                  <div className="px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide bg-muted/30 flex items-center gap-1.5">
                    <Swords size={9} className="text-orange-400" /> Competitors
                  </div>
                  {results.competitors.map((c) => (
                    <button
                      key={c.id}
                      data-testid={\`search-result-competitor-\${c.id}\`}
                      onClick={() => go(\`/competitors/\${c.id}\`)}
                      className="w-full text-left px-3 py-2 hover:bg-muted/50 flex items-center justify-between gap-2 border-b border-border/40 last:border-0"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-foreground truncate">{c.name}</div>
                        {c.hq && <div className="text-[10px] text-muted-foreground truncate">{c.hq}</div>}
                      </div>
                      {c.ticker && <span className="text-[9px] font-mono bg-muted px-1 py-0.5 rounded text-muted-foreground shrink-0">{c.ticker}</span>}
                    </button>
                  ))}
                </div>
              )}

              {/* News */}
              {results.news.length > 0 && (
                <div>
                  <div className="px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide bg-muted/30 flex items-center gap-1.5">
                    <Newspaper size={9} className="text-purple-400" /> News
                  </div>
                  {results.news.map((n) => (
                    <button
                      key={n.id}
                      data-testid={\`search-result-news-\${n.id}\`}
                      onClick={() => go(\`/competitors/\${n.competitorId}\`)}
                      className="w-full text-left px-3 py-2 hover:bg-muted/50 border-b border-border/40 last:border-0"
                    >
                      <div className="text-xs font-medium text-foreground line-clamp-1">{n.headline}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] text-muted-foreground">{n.competitorName}</span>
                        {n.publishedDate && <span className="text-[9px] text-muted-foreground">· {n.publishedDate}</span>}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
`,
  "MethodologyTip.tsx": `import { useState, useRef, useEffect } from "react";
import { Info, X, ExternalLink } from "lucide-react";

type Source = { label: string; url?: string };

type Props = {
  title: string;
  body: string;
  sources?: Source[];
  size?: "sm" | "xs";
  side?: "left" | "right" | "top";
};

/**
 * A small (i) icon that expands to show methodology/sourcing info.
 * Clicking the icon toggles an inline callout; clicking outside closes it.
 * Designed to sit inline next to any metric label or card header.
 */
export default function MethodologyTip({ title, body, sources, size = "sm", side = "right" }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  const iconSize = size === "xs" ? 10 : 12;

  return (
    <div ref={ref} className="relative inline-flex items-center" style={{ verticalAlign: "middle" }}>
      <button
        onClick={e => { e.stopPropagation(); setOpen(v => !v); }}
        className={\`rounded-full transition-colors flex items-center justify-center shrink-0
          \${open
            ? "text-primary bg-primary/15"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }\`}
        style={{ width: iconSize + 8, height: iconSize + 8 }}
        aria-label="Show methodology"
        title="Methodology"
      >
        <Info size={iconSize} />
      </button>

      {open && (
        <div
          className="absolute z-50 w-72 bg-card border border-border rounded-lg shadow-xl p-3"
          style={{
            top: side === "top" ? "auto" : "calc(100% + 6px)",
            bottom: side === "top" ? "calc(100% + 6px)" : "auto",
            left: side === "right" ? 0 : "auto",
            right: side === "left" ? 0 : "auto",
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5">
              <Info size={11} className="text-primary shrink-0 mt-0.5" />
              <span className="text-[11px] font-semibold text-foreground leading-tight">{title}</span>
            </div>
            <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground shrink-0 -mt-0.5">
              <X size={12} />
            </button>
          </div>

          {/* Body */}
          <p className="text-[11px] text-muted-foreground leading-relaxed mb-2">{body}</p>

          {/* Sources */}
          {sources && sources.length > 0 && (
            <div className="border-t border-border/60 pt-2 space-y-1">
              <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide">Sources</span>
              {sources.map((s, i) => (
                <div key={i} className="flex items-center gap-1">
                  <span className="text-[9px] text-muted-foreground">→</span>
                  {s.url ? (
                    <a href={s.url} target="_blank" rel="noopener noreferrer"
                      className="text-[10px] text-primary hover:underline flex items-center gap-0.5">
                      {s.label} <ExternalLink size={8} />
                    </a>
                  ) : (
                    <span className="text-[10px] text-muted-foreground">{s.label}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
`,
  "TechBadge.tsx": `const TECH_LABELS: Record<string, string> = {
  gas_turbine: "Gas Turbine",
  recip_engine: "Recip Engine",
  fuel_cell: "Fuel Cell (SOFC)",
  nuclear_smr: "SMR Nuclear",
  nuclear_existing: "Nuclear (Existing)",
  battery: "Battery / BESS",
  solar: "Solar PV",
  wind: "Wind",
  diesel: "Diesel Gen",
};

export default function TechBadge({ type, size = "sm" }: { type: string; size?: "xs" | "sm" }) {
  const label = TECH_LABELS[type] ?? type;
  const cls = type.replace(/_/g, "-");
  return (
    <span className={\`tech-\${cls} inline-flex items-center rounded-full font-medium \${size === "xs" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-xs"}\`}>
      {label}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const labels: Record<string, string> = {
    announced: "Announced",
    under_construction: "Under Construction",
    operational: "Operational",
    planned: "Planned",
  };
  return (
    <span className={\`status-\${status} inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium\`}>
      {labels[status] ?? status}
    </span>
  );
}
`,
  "Dashboard.tsx": `import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import Layout from "@/components/Layout";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useMemo } from "react";
import { Zap, TrendingUp, DollarSign, WifiOff, Globe, Flame, Swords, Activity, ArrowRight } from "lucide-react";
import MethodologyTip from "@/components/MethodologyTip";

const TECH_COLORS: Record<string, string> = {
  gas_turbine: "#2196f3",
  recip_engine: "#ffb300",
  fuel_cell: "#26c6a2",
  nuclear_smr: "#ab47bc",
  nuclear_existing: "#7b1fa2",
  battery: "#66bb6a",
  solar: "#ffd54f",
  wind: "#4dd0e1",
  diesel: "#9e9e9e",
};

const TECH_LABELS: Record<string, string> = {
  gas_turbine: "Gas Turbine",
  recip_engine: "Recip Engine",
  fuel_cell: "Fuel Cell",
  nuclear_smr: "SMR Nuclear",
  nuclear_existing: "Nuclear (Existing)",
  battery: "Battery/BESS",
  solar: "Solar",
  wind: "Wind",
  diesel: "Diesel",
};

type StatCardProps = { label: string; value: string; sub?: string; icon: any; color: string; tip?: { title: string; body: string; sources?: { label: string; url?: string }[] } };
function StatCard({ label, value, sub, icon: Icon, color, tip }: StatCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 flex items-start gap-3">
      <div className={\`w-9 h-9 rounded-lg flex items-center justify-center shrink-0\`} style={{ background: \`\${color}22\`, border: \`1px solid \${color}44\` }}>
        <Icon size={16} style={{ color }} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1 text-muted-foreground text-xs mb-0.5">
          {label}
          {tip && <MethodologyTip size="xs" {...tip} />}
        </div>
        <div className="tabular text-xl font-bold text-foreground">{value}</div>
        {sub && <div className="text-muted-foreground text-xs mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

function MiniBar({ value, total, color }: { value: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: \`\${pct}%\`, background: color }} />
      </div>
      <span className="text-xs tabular text-muted-foreground w-8 text-right">{pct}%</span>
    </div>
  );
}

export default function Dashboard() {
  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ["/api/projects"],
    queryFn: () => apiRequest("GET", "/api/projects").then((r) => r.json()),
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/stats"],
    queryFn: () => apiRequest("GET", "/api/stats").then((r) => r.json()),
  });

  const totalBtmMw = stats?.totalBtmMw ?? 0;
  const techBreakdown = stats?.techBreakdown ?? {};
  const originBreakdown = stats?.originBreakdown ?? {};
  const totalOriginMw = Object.values(originBreakdown as Record<string, number>).reduce((a: number, b: number) => a + b, 0);
  const totalTechMw = Object.values(techBreakdown as Record<string, number>).reduce((a: number, b: number) => a + b, 0);

  // Latest project (most recently announced)
  const latestProject = useMemo(() => {
    if (!projects) return null;
    return [...projects].sort((a: any, b: any) =>
      (b.announcedDate ?? "").localeCompare(a.announcedDate ?? "")
    )[0] ?? null;
  }, [projects]);

  return (
    <Layout>
      {/* Header */}
      <div className="border-b border-border px-6 py-4 bg-card/50 sticky top-0 z-10 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-foreground">Data Center Intelligence</h1>
            <p className="text-xs text-muted-foreground mt-0.5">BTM Generation · Technology · Company Ecosystem · 2024–2026</p>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span className="text-xs text-muted-foreground">Live Data</span>
          </div>
        </div>
      </div>

      <div className="px-6 py-5 space-y-6">
        {/* ── This Week ───────────────────────────────────────────── */}
        <WeeklyHighlights latestProject={latestProject} />

        {/* KPI Row */}
        {statsLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label="Total Projects" value={stats?.totalProjects ?? "—"} sub={\`\${stats?.btmProjectCount} with BTM generation\`} icon={TrendingUp} color="#2196f3"
              tip={{ title: "Project Count Methodology", body: "Counts all data center and AI infrastructure projects with announced BTM generation components, co-location agreements, or dedicated on-site power arrangements. Includes announced, under-construction, and operational projects. Excludes utility-scale data centers with no on-site generation component.", sources: [{ label: "Manually curated from public announcements", url: "https://www.datacenterdynamics.com" }, { label: "Updated weekly via Saturday research sweep" }] }} />
            <StatCard label="Total Capacity" value={\`\${((stats?.totalCapacityMw ?? 0) / 1000).toFixed(1)} GW\`} sub="IT load across all projects" icon={Zap} color="#ffb300"
              tip={{ title: "IT Capacity Methodology", body: "Sum of announced IT load capacity (MW) across all tracked projects. Represents the compute load the data center is designed to serve — not the generation capacity powering it. For projects where IT load is undisclosed, BTM generation capacity is used as a proxy. Includes announced capacity whether or not the project has reached construction.", sources: [{ label: "Sourced from press releases and project filings" }] }} />
            <StatCard label="BTM Generation" value={\`\${(totalBtmMw / 1000).toFixed(1)} GW\`} sub={\`\${stats?.offGridProjectCount} fully off-grid projects\`} icon={WifiOff} color="#26c6a2"
              tip={{ title: "BTM Generation Methodology", body: "Sum of announced behind-the-meter (BTM) generation capacity across all tracked projects. BTM generation is power produced on the customer side of the utility meter — it either supplements or fully replaces grid power. Fully off-grid projects (100% BTM) are counted separately. Includes gas turbines, reciprocating engines, fuel cells, SMRs, and nuclear co-location.", sources: [{ label: "BTM definition: generation installed behind the meter per FERC/RTO rules" }, { label: "Includes both dedicated and hybrid BTM arrangements" }] }} />
            <StatCard label="Total Investment" value={\`$\${(stats?.totalInvestmentB ?? 0).toFixed(0)}B\`} sub="Committed capital announced" icon={DollarSign} color="#ab47bc"
              tip={{ title: "Investment Methodology", body: "Sum of publicly announced committed capital across all tracked projects. Includes data center construction costs, on-site generation equipment, and infrastructure capex as stated in press releases or SEC filings. Where total project investment is undisclosed, only confirmed power generation capex is included. Figures are as-announced and may include equity + debt combined.", sources: [{ label: "Sourced from company press releases and SEC filings" }, { label: "Not adjusted for probability of completion" }] }} />
          </div>
        )}

        {/* Quick links */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { href: "/projects",    label: "Browse Projects",     sub: \`\${stats?.totalProjects ?? "–"} tracked\`,        color: "#2196f3" },
            { href: "/competitors", label: "Competitor Intel",     sub: "11 BTM providers",                                color: "#f97316" },
            { href: "/macro",       label: "Macro Power",          sub: "FERC · PJM · MISO · ERCOT",                       color: "#f59e0b" },
            { href: "/map",         label: "Project Map",          sub: "42 projects mapped",                              color: "#10b981" },
          ].map(({ href, label, sub, color }) => (
            <Link key={href} href={href}>
              <a className="block bg-card border border-border rounded-xl p-3.5 hover:border-primary/30 transition-colors cursor-pointer">
                <div className="text-sm font-semibold text-foreground mb-0.5">{label}</div>
                <div className="text-xs text-muted-foreground">{sub}</div>
                <div className="mt-2 h-0.5 rounded-full w-8" style={{ background: color }} />
              </a>
            </Link>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Tech Breakdown */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">BTM Technology Mix (MW)</h2>
            {statsLoading ? <Skeleton className="h-40" /> : (
              <div className="space-y-2.5">
                {Object.entries(techBreakdown as Record<string, number>)
                  .sort(([, a], [, b]) => (b as number) - (a as number))
                  .map(([tech, mw]) => (
                    <div key={tech}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-sm" style={{ background: TECH_COLORS[tech] ?? "#666" }} />
                          <span className="text-xs text-muted-foreground">{TECH_LABELS[tech] ?? tech}</span>
                        </div>
                        <span className="text-xs tabular text-foreground font-medium">{((mw as number) / 1000).toFixed(1)} GW</span>
                      </div>
                      <MiniBar value={mw as number} total={totalTechMw} color={TECH_COLORS[tech] ?? "#666"} />
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Origin Country */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h2 className="text-sm font-semibold text-foreground mb-1">Technology Origin (MW)</h2>
            <p className="text-xs text-muted-foreground mb-3">Where BTM generation equipment is manufactured</p>
            {statsLoading ? <Skeleton className="h-40" /> : (
              <div className="space-y-2.5">
                {Object.entries(originBreakdown as Record<string, number>)
                  .sort(([, a], [, b]) => (b as number) - (a as number))
                  .map(([country, mw]) => (
                    <div key={country}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Globe size={12} className="text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{country}</span>
                        </div>
                        <span className="text-xs tabular text-foreground font-medium">{((mw as number) / 1000).toFixed(1)} GW</span>
                      </div>
                      <MiniBar value={mw as number} total={totalOriginMw} color={country === "USA" ? "#2196f3" : country === "Austria" ? "#ffb300" : country === "Germany" ? "#26c6a2" : "#ab47bc"} />
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>


      </div>
    </Layout>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function WeeklyHighlights({ latestProject }: { latestProject: any }) {
  // Latest competitor news
  const { data: competitors } = useQuery({
    queryKey: ["/api/competitors"],
    queryFn: () => apiRequest("GET", "/api/competitors").then((r) => r.json()),
  });

  // Most recent news item across all competitors
  const latestNews = useMemo(() => {
    if (!competitors) return null;
    let best: any = null;
    for (const c of competitors) {
      if (c.latestNews?.[0]) {
        const item = { ...c.latestNews[0], competitorName: c.name, competitorId: c.id };
        if (!best || (item.publishedDate ?? "") > (best.publishedDate ?? "")) best = item;
      }
    }
    return best;
  }, [competitors]);

  // Hardcoded top regulatory update (FERC April 30 deadline is the live one)
  const regulatoryUpdate = {
    label: "FERC ANOPR Deadline",
    text: "FERC must take final action on national large-load interconnection rules by April 30, 2026 — 35 days away.",
    href: "/macro",
    urgency: "high" as const,
    date: "Apr 30, 2026",
  };

  function formatMw(mw: number | null) {
    if (!mw) return "";
    return mw >= 1000 ? \`\${(mw / 1000).toFixed(1)} GW\` : \`\${mw} MW\`;
  }

  const loading = !latestProject && !latestNews;

  return (
    <div>
      {/* Section label */}
      <div className="flex items-center gap-2 mb-2.5">
        <Flame size={13} className="text-orange-400" />
        <span className="text-xs font-semibold text-foreground uppercase tracking-wide">This Week</span>
        <span className="text-[10px] text-muted-foreground">— biggest updates across projects, competitors &amp; regulatory</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">

        {/* ─ Latest Project ─ */}
        {loading ? (
          <Skeleton className="h-24 rounded-xl" />
        ) : latestProject ? (
          <Link href={\`/projects/\${latestProject.id}\`}>
            <a className="group block bg-card border border-border rounded-xl p-3.5 hover:border-primary/40 transition-colors cursor-pointer h-full">
              <div className="flex items-center gap-1.5 mb-2">
                <div className="w-5 h-5 rounded bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <Zap size={10} className="text-primary" />
                </div>
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Latest Project</span>
              </div>
              <div className="text-sm font-semibold text-foreground leading-snug line-clamp-1 group-hover:text-primary transition-colors">
                {latestProject.name}
              </div>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                {latestProject.btmCapacityMw && (
                  <span className="text-xs font-medium text-accent">{formatMw(latestProject.btmCapacityMw)} BTM</span>
                )}
                {latestProject.btmCapacityMw && latestProject.location && <span className="text-muted-foreground text-[10px]">·</span>}
                <span className="text-[11px] text-muted-foreground truncate">{latestProject.location}</span>
              </div>
              {latestProject.announcedDate && (
                <div className="text-[10px] text-muted-foreground mt-1.5">{latestProject.announcedDate}</div>
              )}
              <div className="flex items-center gap-1 mt-2 text-[10px] text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                View project <ArrowRight size={9} />
              </div>
            </a>
          </Link>
        ) : null}

        {/* ─ Latest Competitor News ─ */}
        {loading ? (
          <Skeleton className="h-24 rounded-xl" />
        ) : latestNews ? (
          <Link href={\`/competitors/\${latestNews.competitorId}\`}>
            <a className="group block bg-card border border-border rounded-xl p-3.5 hover:border-orange-500/40 transition-colors cursor-pointer h-full">
              <div className="flex items-center gap-1.5 mb-2">
                <div className="w-5 h-5 rounded bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
                  <Swords size={10} className="text-orange-400" />
                </div>
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Competitor Intel</span>
              </div>
              <div className="text-sm font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-orange-400 transition-colors">
                {latestNews.headline}
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[11px] text-muted-foreground">{latestNews.competitorName}</span>
                {latestNews.category && (
                  <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20 uppercase tracking-wide">
                    {latestNews.category}
                  </span>
                )}
              </div>
              {latestNews.publishedDate && (
                <div className="text-[10px] text-muted-foreground mt-1.5">{latestNews.publishedDate}</div>
              )}
              <div className="flex items-center gap-1 mt-2 text-[10px] text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity">
                View profile <ArrowRight size={9} />
              </div>
            </a>
          </Link>
        ) : null}

        {/* ─ Regulatory Update ─ */}
        <Link href={regulatoryUpdate.href}>
          <a className="group block bg-card border border-amber-500/25 rounded-xl p-3.5 hover:border-amber-500/50 transition-colors cursor-pointer h-full">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-5 h-5 rounded bg-amber-500/10 border border-amber-500/25 flex items-center justify-center shrink-0">
                <Activity size={10} className="text-amber-400" />
              </div>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Regulatory</span>
              <span className="ml-auto text-[9px] font-medium px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 uppercase tracking-wide">Urgent</span>
            </div>
            <div className="text-sm font-semibold text-amber-400 leading-snug">
              {regulatoryUpdate.label}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">
              {regulatoryUpdate.text}
            </p>
            <div className="text-[10px] text-muted-foreground mt-1.5">{regulatoryUpdate.date}</div>
            <div className="flex items-center gap-1 mt-2 text-[10px] text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity">
              View Macro Power <ArrowRight size={9} />
            </div>
          </a>
        </Link>

      </div>
    </div>
  );
}

function ProjectCard({ project: p }: { project: any }) {
  const techTypes = [...new Set(p.btmSources?.map((b: any) => b.technologyType) ?? [])];
  const vendors = [...new Set(p.btmSources?.map((b: any) => b.vendor?.name).filter(Boolean) ?? [])];

  return (
    <Link href={\`/projects/\${p.id}\`}>
      <div
        data-testid={\`card-project-\${p.id}\`}
        className="project-card bg-card border border-border rounded-xl p-4 cursor-pointer h-full"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-foreground leading-snug line-clamp-2">{p.name}</div>
            {p.operator && (
              <div className="text-xs text-muted-foreground mt-0.5">{p.operator.name}</div>
            )}
          </div>
          <StatusBadge status={p.status} />
        </div>

        {/* Location */}
        <div className="flex items-center gap-1.5 mb-3">
          <MapPin size={11} className="text-muted-foreground shrink-0" />
          <span className="text-xs text-muted-foreground truncate">{p.location}</span>
        </div>

        {/* Capacity row */}
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          {p.capacityMw && (
            <div className="text-center">
              <div className="tabular text-base font-bold text-foreground">{p.capacityMw >= 1000 ? \`\${(p.capacityMw / 1000).toFixed(1)} GW\` : \`\${p.capacityMw} MW\`}</div>
              <div className="text-[10px] text-muted-foreground">IT Capacity</div>
            </div>
          )}
          {p.hasBtm && p.btmCapacityMw && (
            <>
              <div className="w-px h-6 bg-border" />
              <div className="text-center">
                <div className="tabular text-base font-bold text-accent">{p.btmCapacityMw >= 1000 ? \`\${(p.btmCapacityMw / 1000).toFixed(1)} GW\` : \`\${p.btmCapacityMw} MW\`}</div>
                <div className="text-[10px] text-muted-foreground">BTM Generation</div>
              </div>
            </>
          )}
          {p.totalInvestmentB && (
            <>
              <div className="w-px h-6 bg-border" />
              <div className="text-center">
                <div className="tabular text-base font-bold text-foreground">\${p.totalInvestmentB}B</div>
                <div className="text-[10px] text-muted-foreground">Investment</div>
              </div>
            </>
          )}
        </div>

        {/* BTM indicator */}
        {p.hasBtm && (
          <div className="flex items-center gap-1.5 mb-3">
            {p.fullyOffGrid ? (
              <><WifiOff size={11} className="text-destructive" /><span className="text-[10px] text-destructive font-medium">Fully Off-Grid</span></>
            ) : (
              <><Wifi size={11} className="text-accent" /><span className="text-[10px] text-accent font-medium">BTM + Grid Hybrid</span></>
            )}
          </div>
        )}

        {/* Tech badges */}
        {techTypes.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {techTypes.slice(0, 3).map((t: any) => (
              <TechBadge key={t} type={t} size="xs" />
            ))}
            {techTypes.length > 3 && <span className="text-[10px] text-muted-foreground self-center">+{techTypes.length - 3}</span>}
          </div>
        )}

        {/* Vendors */}
        {vendors.length > 0 && (
          <div className="text-[10px] text-muted-foreground mt-1 truncate">
            Vendors: {vendors.slice(0, 3).join(" · ")}{vendors.length > 3 ? \` +\${vendors.length - 3}\` : ""}
          </div>
        )}
      </div>
    </Link>
  );
}
`,
  "Projects.tsx": `import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import Layout from "@/components/Layout";
import TechBadge, { StatusBadge } from "@/components/TechBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useMemo } from "react";
import { Search, MapPin, Wifi, WifiOff, Zap } from "lucide-react";

export default function Projects() {
  const [search, setSearch] = useState("");
  const [techFilter, setTechFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [btmFilter, setBtmFilter] = useState("all");

  const { data: projects, isLoading } = useQuery({
    queryKey: ["/api/projects"],
    queryFn: () => apiRequest("GET", "/api/projects").then(r => r.json()),
  });

  const filtered = useMemo(() => {
    if (!projects) return [];
    return projects.filter((p: any) => {
      if (btmFilter === "btm" && !p.hasBtm) return false;
      if (btmFilter === "offgrid" && !p.fullyOffGrid) return false;
      if (btmFilter === "gridtied" && (!p.hasBtm || p.fullyOffGrid)) return false;
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (techFilter !== "all" && !p.btmSources?.some((b: any) => b.technologyType === techFilter)) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !p.name.toLowerCase().includes(q) &&
          !p.location?.toLowerCase().includes(q) &&
          !p.operator?.name?.toLowerCase().includes(q) &&
          !p.state?.toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });
  }, [projects, search, techFilter, statusFilter, btmFilter]);

  return (
    <Layout>
      {/* Sticky header */}
      <div className="border-b border-border px-6 py-4 bg-card/50 sticky top-0 z-10 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Zap size={15} className="text-primary" />
              <h1 className="text-lg font-bold text-foreground">Projects</h1>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              AI data center BTM generation announcements · 2024–2026
            </p>
          </div>
          <span className="text-xs text-muted-foreground">{filtered.length} of {projects?.length ?? 0}</span>
        </div>
      </div>

      <div className="px-6 py-5 space-y-5">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              data-testid="input-search"
              placeholder="Search projects, locations, operators…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 h-8 text-sm bg-secondary border-border"
            />
          </div>
          <Select value={btmFilter} onValueChange={setBtmFilter}>
            <SelectTrigger className="w-36 h-8 text-sm bg-secondary border-border">
              <SelectValue placeholder="Power type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              <SelectItem value="btm">Has BTM Gen</SelectItem>
              <SelectItem value="offgrid">Fully Off-Grid</SelectItem>
              <SelectItem value="gridtied">BTM + Grid</SelectItem>
            </SelectContent>
          </Select>
          <Select value={techFilter} onValueChange={setTechFilter}>
            <SelectTrigger className="w-36 h-8 text-sm bg-secondary border-border">
              <SelectValue placeholder="Technology" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tech</SelectItem>
              <SelectItem value="gas_turbine">Gas Turbine</SelectItem>
              <SelectItem value="recip_engine">Recip Engine</SelectItem>
              <SelectItem value="fuel_cell">Fuel Cell</SelectItem>
              <SelectItem value="nuclear_smr">SMR Nuclear</SelectItem>
              <SelectItem value="nuclear_existing">Nuclear Existing</SelectItem>
              <SelectItem value="battery">Battery / BESS</SelectItem>
              <SelectItem value="solar">Solar</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 h-8 text-sm bg-secondary border-border">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="announced">Announced</SelectItem>
              <SelectItem value="under_construction">Under Construction</SelectItem>
              <SelectItem value="operational">Operational</SelectItem>
            </SelectContent>
          </Select>
          {(search || techFilter !== "all" || statusFilter !== "all" || btmFilter !== "all") && (
            <button
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => { setSearch(""); setTechFilter("all"); setStatusFilter("all"); setBtmFilter("all"); }}
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
            {Array.from({ length: 9 }).map((_, i) => <Skeleton key={i} className="h-52 rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
            {filtered.map((p: any) => <ProjectCard key={p.id} project={p} />)}
            {filtered.length === 0 && (
              <div className="col-span-full py-16 text-center text-muted-foreground text-sm">
                No projects match your filters.
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}

function ProjectCard({ project: p }: { project: any }) {
  const techTypes = [...new Set(p.btmSources?.map((b: any) => b.technologyType) ?? [])];
  const vendors = [...new Set(p.btmSources?.map((b: any) => b.vendor?.name).filter(Boolean) ?? [])];

  return (
    <Link href={\`/projects/\${p.id}\`}>
      <div
        data-testid={\`card-project-\${p.id}\`}
        className="project-card bg-card border border-border rounded-xl p-4 cursor-pointer h-full"
      >
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-foreground leading-snug line-clamp-2">{p.name}</div>
            {p.operator && <div className="text-xs text-muted-foreground mt-0.5">{p.operator.name}</div>}
          </div>
          <StatusBadge status={p.status} />
        </div>

        <div className="flex items-center gap-1.5 mb-3">
          <MapPin size={11} className="text-muted-foreground shrink-0" />
          <span className="text-xs text-muted-foreground truncate">{p.location}</span>
        </div>

        <div className="flex items-center gap-3 mb-3 flex-wrap">
          {p.capacityMw && (
            <div className="text-center">
              <div className="tabular text-base font-bold text-foreground">
                {p.capacityMw >= 1000 ? \`\${(p.capacityMw/1000).toFixed(1)} GW\` : \`\${p.capacityMw} MW\`}
              </div>
              <div className="text-[10px] text-muted-foreground">IT Capacity</div>
            </div>
          )}
          {p.hasBtm && p.btmCapacityMw && (
            <>
              <div className="w-px h-6 bg-border" />
              <div className="text-center">
                <div className="tabular text-base font-bold text-accent">
                  {p.btmCapacityMw >= 1000 ? \`\${(p.btmCapacityMw/1000).toFixed(1)} GW\` : \`\${p.btmCapacityMw} MW\`}
                </div>
                <div className="text-[10px] text-muted-foreground">BTM Generation</div>
              </div>
            </>
          )}
          {p.totalInvestmentB && (
            <>
              <div className="w-px h-6 bg-border" />
              <div className="text-center">
                <div className="tabular text-base font-bold text-foreground">\${p.totalInvestmentB}B</div>
                <div className="text-[10px] text-muted-foreground">Investment</div>
              </div>
            </>
          )}
        </div>

        {p.hasBtm && (
          <div className="flex items-center gap-1.5 mb-3">
            {p.fullyOffGrid
              ? <><WifiOff size={11} className="text-destructive" /><span className="text-[10px] text-destructive font-medium">Fully Off-Grid</span></>
              : <><Wifi size={11} className="text-accent" /><span className="text-[10px] text-accent font-medium">BTM + Grid Hybrid</span></>
            }
          </div>
        )}

        {techTypes.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {techTypes.slice(0, 3).map((t: any) => <TechBadge key={t} type={t} size="xs" />)}
            {techTypes.length > 3 && <span className="text-[10px] text-muted-foreground self-center">+{techTypes.length - 3}</span>}
          </div>
        )}

        {vendors.length > 0 && (
          <div className="text-[10px] text-muted-foreground mt-1 truncate">
            Vendors: {vendors.slice(0, 3).join(" · ")}{vendors.length > 3 ? \` +\${vendors.length - 3}\` : ""}
          </div>
        )}
      </div>
    </Link>
  );
}
`,
  "NewsPage.tsx": `import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import Layout from "@/components/Layout";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Zap, Swords, Activity, ExternalLink,
  ChevronRight, DollarSign, TrendingUp, Newspaper
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
type NewsItem = {
  id: string;
  tab: "projects" | "competitors" | "financing" | "sentiment" | "regulatory";
  date: string;
  headline: string;
  summary: string;
  category: string;
  url?: string;
  linkTo?: string;
  linkLabel?: string;
  badge?: string;
};

// ── Column config ─────────────────────────────────────────────────────────────
const COLUMNS: {
  id: NewsItem["tab"];
  label: string;
  icon: React.ElementType;
  color: string;
  accent: string;
  description: string;
}[] = [
  {
    id: "projects",
    label: "Projects",
    icon: Zap,
    color: "text-primary",
    accent: "#2196f3",
    description: "New BTM generation announcements",
  },
  {
    id: "competitors",
    label: "Competitors",
    icon: Swords,
    color: "text-orange-400",
    accent: "#f97316",
    description: "Equipment, deals & market moves",
  },
  {
    id: "financing",
    label: "Financing",
    icon: DollarSign,
    color: "text-emerald-400",
    accent: "#10b981",
    description: "Capital raises, valuations, M&A",
  },
  {
    id: "sentiment",
    label: "Public Sentiment",
    icon: TrendingUp,
    color: "text-purple-400",
    accent: "#a855f7",
    description: "Analyst views, policy signals, market outlook",
  },
  {
    id: "regulatory",
    label: "Regulatory / RTO",
    icon: Activity,
    color: "text-amber-400",
    accent: "#f59e0b",
    description: "FERC, PJM, MISO, ERCOT BTM rulings",
  },
];

// ── Category colors ────────────────────────────────────────────────────────────
const CAT_COLORS: Record<string, string> = {
  deal:         "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  product:      "bg-blue-500/15 text-blue-400 border-blue-500/30",
  partnership:  "bg-purple-500/15 text-purple-400 border-purple-500/30",
  funding:      "bg-amber-500/15 text-amber-400 border-amber-500/30",
  expansion:    "bg-teal-500/15 text-teal-400 border-teal-500/30",
  regulatory:   "bg-orange-500/15 text-orange-400 border-orange-500/30",
  valuation:    "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  acquisition:  "bg-purple-500/15 text-purple-400 border-purple-500/30",
  analyst:      "bg-slate-500/15 text-slate-400 border-slate-500/30",
  policy:       "bg-amber-500/15 text-amber-400 border-amber-500/30",
  announcement: "bg-primary/15 text-primary border-primary/30",
  other:        "bg-slate-500/15 text-slate-400 border-slate-500/30",
};

function formatDate(s: string) {
  if (!s) return "";
  try {
    const d = new Date(s + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch { return s; }
}

function relativeDate(s: string) {
  if (!s) return "";
  const days = Math.floor((Date.now() - new Date(s + "T00:00:00").getTime()) / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days <= 7) return \`\${days}d ago\`;
  if (days <= 30) return \`\${Math.floor(days / 7)}w ago\`;
  if (days <= 365) return \`\${Math.floor(days / 30)}mo ago\`;
  return \`\${Math.floor(days / 365)}y ago\`;
}

// ── Single news card ───────────────────────────────────────────────────────────
function NewsCard({ item, accent }: { item: NewsItem; accent: string }) {
  return (
    <div className="border-b border-border/50 px-3 py-3 hover:bg-muted/20 transition-colors group">
      {/* Meta row */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          {item.category && item.category !== "announcement" && (
            <span className={\`text-[9px] font-medium px-1.5 py-0.5 rounded border uppercase tracking-wide \${CAT_COLORS[item.category] ?? CAT_COLORS.other}\`}>
              {item.category}
            </span>
          )}
          {item.badge && (
            <span className="text-[9px] text-muted-foreground truncate max-w-[100px]">{item.badge}</span>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[9px] text-muted-foreground">{relativeDate(item.date)}</span>
          {item.url && (
            <a href={item.url} target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="text-muted-foreground hover:text-primary transition-colors">
              <ExternalLink size={10} />
            </a>
          )}
        </div>
      </div>

      {/* Headline */}
      <h3 className="text-xs font-semibold text-foreground leading-snug mb-1"
        style={{ transition: "color .15s" }}
        onMouseEnter={e => (e.currentTarget.style.color = accent)}
        onMouseLeave={e => (e.currentTarget.style.color = "")}>
        {item.headline}
      </h3>

      {/* Summary */}
      {item.summary && (
        <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-2 mb-1.5">
          {item.summary}
        </p>
      )}

      {/* Link */}
      {item.linkTo && (
        <Link href={item.linkTo}>
          <a className="inline-flex items-center gap-0.5 text-[10px] hover:underline"
            style={{ color: accent }}>
            {item.linkLabel ?? "Detail"} <ChevronRight size={9} />
          </a>
        </Link>
      )}
    </div>
  );
}

// ── Column ─────────────────────────────────────────────────────────────────────
function NewsColumn({ col, items, loading }: {
  col: typeof COLUMNS[0];
  items: NewsItem[];
  loading: boolean;
}) {
  const Icon = col.icon;
  return (
    <div className="flex flex-col min-w-0 border-r border-border last:border-r-0" style={{ flex: "1 1 0" }}>
      {/* Column header */}
      <div className="px-3 py-3 border-b border-border bg-card/60 sticky top-0 z-10 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <div className="w-5 h-5 rounded flex items-center justify-center shrink-0"
            style={{ background: col.accent + "20", border: \`1px solid \${col.accent}40\` }}>
            <Icon size={11} style={{ color: col.accent }} />
          </div>
          <span className="text-xs font-semibold text-foreground">{col.label}</span>
          <span className="ml-auto text-[9px] text-muted-foreground tabular-nums">{items.length}</span>
        </div>
        <p className="text-[9px] text-muted-foreground leading-tight">{col.description}</p>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-3 py-3 border-b border-border/50 space-y-1.5">
              <Skeleton className="h-2.5 w-20" />
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3 w-4/5" />
            </div>
          ))
        ) : items.length === 0 ? (
          <div className="px-3 py-8 text-center">
            <Icon size={18} className="mx-auto mb-2 text-muted-foreground/30" style={{ color: col.accent + "50" }} />
            <p className="text-[10px] text-muted-foreground">No items yet.</p>
            <p className="text-[9px] text-muted-foreground/60 mt-0.5">Updated every 2 days.</p>
          </div>
        ) : (
          items.map(item => <NewsCard key={item.id} item={item} accent={col.accent} />)
        )}
      </div>
    </div>
  );
}

// ── Regulatory items (static seed, cron keeps current) ────────────────────────
const REGULATORY_ITEMS: Omit<NewsItem, "id">[] = [
  {
    tab: "regulatory", date: "2026-03-17",
    headline: "PJM Proposes Expedited Interconnection Track (EIT) for Large Generation",
    summary: "PJM filed a proposal to process up to 10 generator interconnection requests/year on an expedited ~10-month timeline. FERC order requested by May 28, 2026.",
    category: "regulatory",
    url: "https://www.troutmanenergyreport.com/2026/03/pjm-proposes-expedited-generator-interconnection-track/",
    linkTo: "/macro", linkLabel: "View PJM status",
  },
  {
    tab: "regulatory", date: "2026-02-23",
    headline: "PJM Compliance Filing: 50 MW BTM Cap + Three Co-Location Services",
    summary: "PJM filed ER26-5181 per FERC Dec 2025 order. Sets 50 MW BTM netting cap, emergency generation exemption, and grandfathers pre-Dec 18 contracts. Target: July 31, 2026.",
    category: "regulatory",
    url: "https://www.utilitydive.com/news/pjm-ferc-behind-the-meter-data-center-colocation/812939/",
    linkTo: "/macro", linkLabel: "View PJM status",
  },
  {
    tab: "regulatory", date: "2026-01-25",
    headline: "DOE 202(c): ERCOT Authorized to Direct Data Center Backup Generation",
    summary: "DOE Section 202(c) order authorizes ERCOT to activate data center backup generation during grid emergencies — highlighting the scale of BTM assets already deployed in Texas.",
    category: "regulatory",
    url: "https://www.ercot.com/services/comm/mkt_notices/M-A012526-01",
    linkTo: "/macro", linkLabel: "View ERCOT status",
  },
  {
    tab: "regulatory", date: "2026-01-22",
    headline: "MISO Develops Zero-Injection Agreement Framework for BTM Data Centers",
    summary: "MISO presented its zero-injection agreement concept allowing dedicated generation for large loads barred from grid injection — full BTM without netting restrictions.",
    category: "regulatory",
    url: "https://www.rtoinsider.com/123961-questions-abound-miso-idea-zero-injection-agreements/",
    linkTo: "/macro", linkLabel: "View MISO status",
  },
  {
    tab: "regulatory", date: "2025-12-18",
    headline: "FERC Orders PJM to Overhaul BTM Rules for Co-Located Data Centers",
    summary: "FERC Order 193 FERC ¶ 61,217: PJM tariff unjust/unreasonable. Creates co-location framework, 50 MW BTM threshold, 3 TX services, 3-year transition period to Dec 2028.",
    category: "regulatory",
    url: "https://www.ferc.gov/news-events/news/ferc-directs-nations-largest-grid-operator-create-new-rules-embrace-innovation-and",
    linkTo: "/macro", linkLabel: "View FERC status",
  },
  {
    tab: "regulatory", date: "2025-10-23",
    headline: "DOE ANOPR: FERC Must Standardize National Large-Load Interconnection Rules",
    summary: "DOE directed FERC to conduct rulemaking on large load (>20 MW) interconnection nationwide. FERC final action deadline: April 30, 2026.",
    category: "policy",
    url: "https://www.ferc.gov/rm26-4",
    linkTo: "/macro", linkLabel: "View FERC status",
  },
];

// ── Financing items (static seed, pulled from competitor news with funding category) ──
const FINANCING_ITEMS_STATIC: Omit<NewsItem, "id">[] = [
  {
    tab: "financing", date: "2026-03-10",
    headline: "Atlas Energy Signs $840M Caterpillar Framework for 1.4 GW BTM Power",
    summary: "Atlas / Galt Power secured a global framework agreement with Caterpillar for 1.4 GW of reciprocating engine assets through 2029, targeting AI data center customers.",
    category: "deal",
    url: "https://ir.atlas.energy/news-events/press-releases/detail/66/atlas-energy-solutions-enters-agreement-with-caterpillar",
    linkTo: "/competitors/7", linkLabel: "View Atlas",
  },
  {
    tab: "financing", date: "2025-12-10",
    headline: "VoltaGrid Closes $5B Financing for 4.3 GW BTM Deployment",
    summary: "$2B senior secured notes + $3B asset-based loan facility. Funds 4.3+ GW of natural gas BTM microgrids for AI data centers through 2028.",
    category: "funding",
    url: "https://voltagrid.com/voltagrid-closes-5-0-billion-comprehensive-financing-package-consisting-of-2-0-billion-of-senior-secured-second-lien-notes-and-3-0-billion-asset-based-loan-facility",
    linkTo: "/competitors/3", linkLabel: "View VoltaGrid",
  },
  {
    tab: "financing", date: "2025-11-20",
    headline: "Amazon + NIPSCO GenCo: $7B, 2.4 GW 15-Year Power Deal",
    summary: "Amazon Data Services signed a 15-year special contract for up to 2.4 GW of dedicated generation from NIPSCO's GenCo subsidiary — a landmark utility-scale data center power structure.",
    category: "deal",
    url: "https://www.nipsco.com/our-company/news-room/news-article/powering-indiana-s-future--how-nipsco--genco--and-amazon-keep-energy-reliable-and-affordable",
    linkTo: "/competitors/9", linkLabel: "View GenCo",
  },
  {
    tab: "financing", date: "2026-02-24",
    headline: "VoltaGrid Weighs IPO or Sale at $10B+ Valuation",
    summary: "Bloomberg reported VoltaGrid is exploring a public listing or sale exceeding $10B valuation as AI data center power demand drives rapid growth in its QPac BTM platform.",
    category: "valuation",
    url: "https://www.bloomberg.com/news/articles/2026-02-24/voltagrid-weighs-public-listing-or-sale-as-it-rides-the-ai-wave",
    linkTo: "/competitors/3", linkLabel: "View VoltaGrid",
  },
  {
    tab: "financing", date: "2025-10-15",
    headline: "Partners Group Acquires Life Cycle Power to Expand DC Focus",
    summary: "Partners Group acquired Life Cycle Power from Arroyo Investors to expand into the AI data center BTM power market, leveraging its ~1 GW fleet of mobile gas turbines.",
    category: "acquisition",
    url: "https://www.partnersgroup.com/en/news-and-views/press-releases/investment-news/detail?news_id=27bbb516-e9e5-44b3-b197-0fcc4dccac85",
    linkTo: "/competitors/11", linkLabel: "View LifeCycle",
  },
];

// ── Sentiment items (static seed) ─────────────────────────────────────────────
const SENTIMENT_ITEMS_STATIC: Omit<NewsItem, "id">[] = [
  {
    tab: "sentiment", date: "2026-03-17",
    headline: "RMI: US Interconnection Queue Now 2.2 TW — Barrier to AI Data Center Power",
    summary: "RMI report finds only 19% of projects reach commercial operation, 80% withdraw. Average wait time 5 years. BTM and off-grid arrangements are the primary workaround for data center developers.",
    category: "analyst",
    url: "https://rmi.org/interconnection-reform-ai-data-centers-generator-queues/",
    linkTo: "/queue", linkLabel: "View Queue Intel",
  },
  {
    tab: "sentiment", date: "2026-03-26",
    headline: "FERC State of Markets: 50 GW US Data Center Capacity Online at End of 2025",
    summary: "FERC's 2025 State of Markets reports 50 GW of US data center capacity online, up 24% CAGR since 2020. MISO saw the fastest growth at 43% annually. Average DC size grew from 25 MW to 80 MW.",
    category: "analyst",
    url: "https://www.utilitydive.com/news/data-centers-miso-ferc-market-report/815831/",
    linkTo: "/queue", linkLabel: "View Queue Intel",
  },
  {
    tab: "sentiment", date: "2026-02-27",
    headline: "Modo Energy: PJM Forecasts 35 GW Data Center Load Growth 2026–2031",
    summary: "PJM's 2026 Long-Term Load Forecast shows data centers driving 100%+ of near-term demand growth. DOM, AEP, ComEd, and PL zones to double annual load by 2046. Raw utility submissions for 2030: 60 GW; PJM accepted 34 GW.",
    category: "analyst",
    url: "https://modoenergy.com/research/en/pjm-load-forecast-data-centers-2046",
    linkTo: "/queue", linkLabel: "View Queue Intel",
  },
  {
    tab: "sentiment", date: "2026-01-16",
    headline: "PJM Board + 13 State Governors: Data Centers Must Fund Their Own Power",
    summary: "White House National Energy Dominance Council and all 13 PJM state governors issued a joint Statement of Principles demanding data centers bear infrastructure costs rather than shifting to ratepayers.",
    category: "policy",
    url: "https://insidelines.pjm.com/pjm-board-outlines-plans-to-integrate-large-loads-reliably/",
    linkTo: "/macro", linkLabel: "View Federal / RTO",
  },
  {
    tab: "sentiment", date: "2026-03-04",
    headline: "BIC Magazine: 'How Real Is the 233 GW ERCOT Data Center Queue?'",
    summary: "Expert analysis: 55% of ERCOT's large load queue (128 GW) hasn't submitted a transmission study. 'We know it's not all real. The question is how much is real.' — ERCOT. $100K SB6 fee aimed at filtering speculative filings.",
    category: "analyst",
    url: "https://www.bicmagazine.com/industry/powergen/texas-grid-sees-233-gw-data-center-requests-much-real/",
    linkTo: "/queue", linkLabel: "View Queue Intel",
  },
];

// ── Main ──────────────────────────────────────────────────────────────────────
export default function NewsPage() {
  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ["/api/projects"],
    queryFn: () => apiRequest("GET", "/api/projects").then(r => r.json()),
  });

  const { data: competitors, isLoading: competitorsLoading } = useQuery({
    queryKey: ["/api/competitors"],
    queryFn: () => apiRequest("GET", "/api/competitors").then(r => r.json()),
  });

  // Include competitor IDs in the queryKey so this refires once competitors load
  const competitorIds = competitors ? (competitors as any[]).map((c: any) => c.id).join(",") : "";
  const { data: allCompNewsRaw } = useQuery({
    queryKey: ["/api/all-competitor-news", competitorIds],
    queryFn: async () => {
      if (!competitors || !(competitors as any[]).length) return [];
      const results = await Promise.all(
        (competitors as any[]).map((c: any) =>
          apiRequest("GET", \`/api/competitors/\${c.id}\`).then(r => r.json()).then((d: any) =>
            (d.news ?? []).map((n: any) => ({ ...n, competitorName: c.name, competitorId: c.id }))
          )
        )
      );
      return results.flat();
    },
    enabled: !!competitors && (competitors as any[]).length > 0,
  });

  const isLoading = projectsLoading || competitorsLoading;

  // Build all items classified into 5 columns
  const columnItems = useMemo(() => {
    const map: Record<NewsItem["tab"], NewsItem[]> = {
      projects: [], competitors: [], financing: [], sentiment: [], regulatory: [],
    };

    // ── Projects ──────────────────────────────────────────────────────────────
    if (projects) {
      for (const p of projects) {
        if (!p.announcedDate) continue;
        const btmStr = p.btmCapacityMw
          ? \` · \${p.btmCapacityMw >= 1000 ? (p.btmCapacityMw / 1000).toFixed(1) + " GW" : p.btmCapacityMw + " MW"} BTM\`
          : "";
        const invStr = p.totalInvestmentB ? \` · $\${p.totalInvestmentB}B\` : "";
        map.projects.push({
          id: \`proj-\${p.id}\`,
          tab: "projects",
          date: p.announcedDate,
          headline: p.name,
          summary: \`\${p.location ?? ""}\${btmStr}\${invStr}\${p.notes ? " — " + p.notes.slice(0, 100) : ""}\`,
          category: "announcement",
          url: p.sourceUrl ?? undefined,
          linkTo: \`/projects/\${p.id}\`,
          linkLabel: "View project",
          badge: p.operator?.name,
        });
      }
    }

    // ── Competitor news — classify into competitors / financing / sentiment ───
    if (allCompNewsRaw) {
      for (const n of allCompNewsRaw) {
        const cat = n.category ?? "other";
        // Financing column: funding, valuation, acquisition categories
        const isFinancing = ["funding", "acquisition"].includes(cat);
        // Sentiment: analyst, policy-type items — we'll use keyword hints in headline
        const isSentiment = cat === "other" && (
          n.headline.toLowerCase().includes("analyst") ||
          n.headline.toLowerCase().includes("report") ||
          n.headline.toLowerCase().includes("market") ||
          n.headline.toLowerCase().includes("forecast")
        );

        const tab: NewsItem["tab"] = isFinancing ? "financing"
          : isSentiment ? "sentiment"
          : "competitors";

        map[tab].push({
          id: \`comp-\${n.id}\`,
          tab,
          date: n.publishedDate ?? "",
          headline: n.headline,
          summary: n.summary ?? "",
          category: cat,
          url: n.url ?? undefined,
          linkTo: \`/competitors/\${n.competitorId}\`,
          linkLabel: "View competitor",
          badge: n.competitorName,
        });
      }
    }

    // ── Financing static items ────────────────────────────────────────────────
    FINANCING_ITEMS_STATIC.forEach((item, i) =>
      map.financing.push({ id: \`fin-static-\${i}\`, ...item })
    );

    // ── Sentiment static items ────────────────────────────────────────────────
    SENTIMENT_ITEMS_STATIC.forEach((item, i) =>
      map.sentiment.push({ id: \`sent-static-\${i}\`, ...item })
    );

    // ── Regulatory static items ───────────────────────────────────────────────
    REGULATORY_ITEMS.forEach((item, i) =>
      map.regulatory.push({ id: \`reg-static-\${i}\`, ...item })
    );

    // Sort each column newest first, deduplicate by URL then headline
    for (const tab of Object.keys(map) as NewsItem["tab"][]) {
      const seenUrls = new Set<string>();
      const seenHeadlines = new Set<string>();
      map[tab] = map[tab]
        .filter(item => {
          if (!item.date) return false;
          // Dedupe by URL first (catches same story from different sources)
          if (item.url && seenUrls.has(item.url)) return false;
          if (item.url) seenUrls.add(item.url);
          // Then dedupe by normalized headline
          const normalizedHeadline = item.headline.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 60);
          if (seenHeadlines.has(normalizedHeadline)) return false;
          seenHeadlines.add(normalizedHeadline);
          return true;
        })
        .sort((a, b) => b.date.localeCompare(a.date));
    }

    return map;
  }, [projects, allCompNewsRaw]);

  const totalItems = Object.values(columnItems).reduce((s, arr) => s + arr.length, 0);

  return (
    <Layout>
      <div className="flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="border-b border-border px-6 py-3 bg-card/50 sticky top-0 z-20 backdrop-blur-sm shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Newspaper size={15} className="text-primary" />
              <h1 className="text-lg font-bold text-foreground">News</h1>
              {!isLoading && (
                <span className="text-xs text-muted-foreground ml-1">{totalItems} items</span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              Updated every 2 days
            </div>
          </div>
        </div>

        {/* 5-column grid */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {COLUMNS.map(col => (
            <NewsColumn
              key={col.id}
              col={col}
              items={columnItems[col.id] ?? []}
              loading={isLoading}
            />
          ))}
        </div>
      </div>
    </Layout>
  );
}
`,
  "Competitors.tsx": `import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import Layout from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUpRight, Newspaper, Zap, TrendingUp, Building } from "lucide-react";
import MethodologyTip from "@/components/MethodologyTip";

type CompetitorSummary = {
  id: number;
  name: string;
  ticker: string | null;
  hq: string | null;
  website: string | null;
  description: string | null;
  technology: string | null;
  keyDeals: string | null;
  capacityDeployedMw: number | null;
  capacityPipelineMw: number | null;
  logoInitials: string | null;
  isPublic: number | null;
  newsCount: number;
  latestNews: Array<{
    headline: string;
    publishedDate: string | null;
    category: string | null;
  }>;
};

const CATEGORY_COLORS: Record<string, string> = {
  deal: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  product: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  partnership: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  funding: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  expansion: "bg-teal-500/15 text-teal-400 border-teal-500/30",
  regulatory: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  other: "bg-slate-500/15 text-slate-400 border-slate-500/30",
};

function formatMw(mw: number | null): string {
  if (mw === null || mw === undefined) return "—";
  if (mw >= 1000) return \`\${(mw / 1000).toFixed(1)} GW\`;
  return \`\${mw} MW\`;
}

function CompetitorCard({ c }: { c: CompetitorSummary }) {
  const latestItem = c.latestNews?.[0];
  const isPublic = c.isPublic === 1;

  return (
    <Link href={\`/competitors/\${c.id}\`}>
      <a
        data-testid={\`card-competitor-\${c.id}\`}
        className="group block bg-card border border-border rounded-lg p-5 hover:border-primary/40 hover:bg-card/80 transition-all duration-200 cursor-pointer"
      >
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            {/* Logo initials */}
            <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-primary tracking-wide">
                {c.logoInitials || c.name.slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground leading-tight">
                {c.name}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {c.hq}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {isPublic && c.ticker && (
              <span className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground border border-border">
                {c.ticker}
              </span>
            )}
            {!isPublic && (
              <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground border border-border">
                Private
              </span>
            )}
            <ArrowUpRight size={13} className="text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">
          {c.description}
        </p>

        {/* Stats row */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-1.5">
            <Zap size={11} className="text-primary" />
            <span className="text-[10px] text-muted-foreground">Deployed</span>
            <span className="text-[10px] font-semibold text-foreground">
              {c.capacityDeployedMw === 0 ? "New" : formatMw(c.capacityDeployedMw)}
            </span>
          </div>
          <div className="w-px h-3 bg-border" />
          <div className="flex items-center gap-1.5">
            <TrendingUp size={11} className="text-emerald-400" />
            <span className="text-[10px] text-muted-foreground">Pipeline</span>
            <span className="text-[10px] font-semibold text-foreground">
              {formatMw(c.capacityPipelineMw)}
            </span>
          </div>
          <div className="w-px h-3 bg-border" />
          <div className="flex items-center gap-1.5">
            <Newspaper size={11} className="text-muted-foreground" />
            <span className="text-[10px] font-semibold text-foreground">{c.newsCount}</span>
            <span className="text-[10px] text-muted-foreground">news</span>
          </div>
        </div>

        {/* Latest news teaser */}
        {latestItem && (
          <div className="border-t border-border pt-3">
            <div className="flex items-start gap-2">
              {latestItem.category && (
                <span className={\`inline-flex items-center text-[9px] font-medium px-1.5 py-0.5 rounded border uppercase tracking-wide shrink-0 mt-0.5 \${CATEGORY_COLORS[latestItem.category] ?? CATEGORY_COLORS.other}\`}>
                  {latestItem.category}
                </span>
              )}
              <p className="text-[11px] text-muted-foreground line-clamp-2 leading-snug">
                {latestItem.headline}
              </p>
            </div>
          </div>
        )}
      </a>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-card border border-border rounded-lg p-5 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-lg" />
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-36" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
      <div className="flex gap-3">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

export default function Competitors() {
  const { data, isLoading, error } = useQuery<CompetitorSummary[]>({
    queryKey: ["/api/competitors"],
    queryFn: () => apiRequest("GET", "/api/competitors").then((r) => r.json()),
  });

  const publicCount = data?.filter((c) => c.isPublic === 1).length ?? 0;
  const privateCount = data?.filter((c) => c.isPublic !== 1).length ?? 0;
  const totalPipelineGw = data
    ? data.reduce((s, c) => s + (c.capacityPipelineMw ?? 0), 0) / 1000
    : 0;

  return (
    <Layout>
      <div className="px-6 py-6">
        {/* Page header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Building size={16} className="text-primary" />
            <h1 className="text-lg font-semibold text-foreground">Competitors</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            BTM generation providers competing in the AI data center power market — equipment, deals, and recent news.
          </p>
        </div>

        {/* Summary stats */}
        {!isLoading && data && (
          <div className="grid grid-cols-4 gap-3 mb-6">
            <div className="bg-card border border-border rounded-lg px-4 py-3">
              <div className="text-xl font-bold text-foreground">{data.length}</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                Tracked Competitors
                <MethodologyTip size="xs" title="Competitor Selection" body="Competitors are BTM generation providers actively pursuing the AI data center power market. Selected based on publicly announced data center deals, equipment deployments, or stated strategic focus on BTM power for data centers. Excludes pure utility players and general EPC contractors." />
              </div>
            </div>
            <div className="bg-card border border-border rounded-lg px-4 py-3">
              <div className="text-xl font-bold text-foreground">{publicCount}</div>
              <div className="text-xs text-muted-foreground mt-0.5">Publicly Traded</div>
            </div>
            <div className="bg-card border border-border rounded-lg px-4 py-3">
              <div className="text-xl font-bold text-foreground">{privateCount}</div>
              <div className="text-xs text-muted-foreground mt-0.5">Private</div>
            </div>
            <div className="bg-card border border-border rounded-lg px-4 py-3">
              <div className="text-xl font-bold text-foreground">{totalPipelineGw.toFixed(1)} GW</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                Combined Pipeline
                <MethodologyTip size="xs" side="left" title="Pipeline MW Methodology" body="Sum of announced, contracted, or publicly stated MW deployment targets across all tracked competitors. Includes both near-term (2025-2027) and longer-term (by 2029-2030) targets. Pipeline figures are management-stated targets from earnings calls, press releases, and public filings — they are aspirational and not all will be realized. Duplicate MW (same project served by multiple competitors) is not netted out." sources={[{ label: "Sourced from earnings releases and press announcements" }, { label: "Last updated weekly via Saturday research sweep" }]} />
              </div>
            </div>
          </div>
        )}

        {/* Cards grid */}
        {error && (
          <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
            Failed to load competitors. Please refresh.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : data?.map((c) => <CompetitorCard key={c.id} c={c} />)}
        </div>
      </div>
    </Layout>
  );
}
`,
  "CompetitorDetail.tsx": `import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import Layout from "@/components/Layout";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft, ExternalLink, Zap, TrendingUp, Globe,
  Newspaper, Calendar, ChevronRight, DollarSign, BarChart2
} from "lucide-react";

type NewsItem = {
  id: number;
  competitorId: number;
  headline: string;
  summary: string | null;
  url: string | null;
  publishedDate: string | null;
  category: string | null;
};

type CompetitorDetail = {
  id: number;
  name: string;
  ticker: string | null;
  hq: string | null;
  country: string | null;
  website: string | null;
  description: string | null;
  technology: string | null;
  keyDeals: string | null;
  capacityDeployedMw: number | null;
  capacityPipelineMw: number | null;
  logoInitials: string | null;
  isPublic: number | null;
  stockPrice: number | null;
  marketCapB: number | null;
  revenueTtmM: number | null;
  ebitdaTtmM: number | null;
  netIncomeTtmM: number | null;
  fcfTtmM: number | null;
  peRatio: number | null;
  yearLow: number | null;
  yearHigh: number | null;
  finsUpdatedDate: string | null;
  news: NewsItem[];
};

const CATEGORY_COLORS: Record<string, string> = {
  deal: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  product: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  partnership: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  funding: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  expansion: "bg-teal-500/15 text-teal-400 border-teal-500/30",
  regulatory: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  other: "bg-slate-500/15 text-slate-400 border-slate-500/30",
};

function formatMw(mw: number | null | undefined): string {
  if (mw === null || mw === undefined) return "—";
  if (mw === 0) return "0 (New)";
  if (mw >= 1000) return \`\${(mw / 1000).toFixed(1)} GW\`;
  return \`\${mw} MW\`;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function NewsCard({ item }: { item: NewsItem }) {
  return (
    <div
      data-testid={\`news-item-\${item.id}\`}
      className="border border-border rounded-lg p-4 bg-card hover:border-border/80 transition-colors"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          {item.category && (
            <span className={\`inline-flex text-[9px] font-medium px-1.5 py-0.5 rounded border uppercase tracking-wide \${CATEGORY_COLORS[item.category] ?? CATEGORY_COLORS.other}\`}>
              {item.category}
            </span>
          )}
          {item.publishedDate && (
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Calendar size={9} />
              {formatDate(item.publishedDate)}
            </span>
          )}
        </div>
        {item.url && (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-muted-foreground hover:text-primary transition-colors shrink-0"
            data-testid={\`news-link-\${item.id}\`}
          >
            <ExternalLink size={13} />
          </a>
        )}
      </div>
      <h4 className="text-sm font-medium text-foreground leading-snug mb-1.5">
        {item.headline}
      </h4>
      {item.summary && (
        <p className="text-xs text-muted-foreground leading-relaxed">
          {item.summary}
        </p>
      )}
    </div>
  );
}

function StatBox({ label, value, icon: Icon, accent }: {
  label: string;
  value: string;
  icon: React.ElementType;
  accent?: string;
}) {
  return (
    <div className="bg-card border border-border rounded-lg px-4 py-3">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon size={11} className={accent ?? "text-muted-foreground"} />
        <span className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</span>
      </div>
      <div className="text-lg font-bold text-foreground leading-none">{value}</div>
    </div>
  );
}

export default function CompetitorDetail() {
  const [, params] = useRoute("/competitors/:id");
  const id = params?.id ? parseInt(params.id) : null;

  const { data, isLoading, error } = useQuery<CompetitorDetail>({
    queryKey: ["/api/competitors", id],
    queryFn: () => apiRequest("GET", \`/api/competitors/\${id}\`).then((r) => r.json()),
    enabled: id !== null,
  });

  const isPublic = data?.isPublic === 1;

  if (error) {
    return (
      <Layout>
        <div className="px-6 py-6">
          <Link href="/competitors">
            <a className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
              <ArrowLeft size={13} /> Back to Competitors
            </a>
          </Link>
          <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
            Competitor not found.
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="px-6 py-6 max-w-4xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-5">
          <Link href="/competitors">
            <a className="hover:text-foreground transition-colors">Competitors</a>
          </Link>
          <ChevronRight size={11} />
          {isLoading ? (
            <Skeleton className="h-3 w-32" />
          ) : (
            <span className="text-foreground">{data?.name}</span>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <Skeleton className="w-14 h-14 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-52" />
                <Skeleton className="h-3.5 w-36" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
            </div>
            <Skeleton className="h-24 rounded-lg" />
          </div>
        ) : data ? (
          <>
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary tracking-wide">
                    {data.logoInitials || data.name.slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl font-bold text-foreground">{data.name}</h1>
                    {isPublic && data.ticker && (
                      <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded text-muted-foreground border border-border">
                        {data.ticker}
                      </span>
                    )}
                    {!isPublic && (
                      <span className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground border border-border">
                        Private
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    {data.hq && (
                      <span className="text-sm text-muted-foreground">{data.hq}</span>
                    )}
                    {data.website && (
                      <a
                        href={data.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                        data-testid="competitor-website"
                      >
                        <Globe size={11} />
                        Website
                        <ExternalLink size={9} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Financial snapshot — public companies only */}
            {data.isPublic === 1 && data.stockPrice && (
              <div className="bg-card border border-border rounded-lg p-4 mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart2 size={13} className="text-emerald-400" />
                  <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide">Financials</h3>
                  {data.ticker && (
                    <a href={\`https://perplexity.ai/finance/\${data.ticker}\`} target="_blank" rel="noopener noreferrer"
                      className="ml-auto flex items-center gap-1 text-[10px] text-primary hover:underline">
                      {data.ticker} <ExternalLink size={9} />
                    </a>
                  )}
                  {data.finsUpdatedDate && <span className="text-[10px] text-muted-foreground">as of {data.finsUpdatedDate}</span>}
                </div>
                <div className="grid grid-cols-4 gap-3 mb-3">
                  {[
                    { label: 'Stock Price', value: data.stockPrice ? \`$\${data.stockPrice.toFixed(2)}\` : '—' },
                    { label: 'Market Cap', value: data.marketCapB ? \`$\${data.marketCapB.toFixed(1)}B\` : '—' },
                    { label: 'P/E Ratio', value: data.peRatio ? \`\${data.peRatio.toFixed(1)}x\` : 'N/A' },
                    { label: 'TTM Revenue', value: data.revenueTtmM ? \`$\${(data.revenueTtmM/1000).toFixed(1)}B\` : '—' },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-muted/30 rounded px-2.5 py-2">
                      <div className="text-[9px] text-muted-foreground uppercase tracking-wide mb-0.5">{label}</div>
                      <div className="text-sm font-bold text-foreground">{value}</div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: 'TTM EBITDA', value: data.ebitdaTtmM ? \`$\${(data.ebitdaTtmM/1000).toFixed(1)}B\` : '—', color: (data.ebitdaTtmM ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400' },
                    { label: 'TTM Net Income', value: data.netIncomeTtmM ? \`$\${(data.netIncomeTtmM/1000).toFixed(2)}B\` : '—', color: (data.netIncomeTtmM ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400' },
                    { label: 'TTM FCF', value: data.fcfTtmM ? \`$\${(data.fcfTtmM/1000).toFixed(2)}B\` : '—', color: (data.fcfTtmM ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400' },
                    { label: '52-Wk Range', value: data.yearLow && data.yearHigh ? \`$\${data.yearLow}–$\${data.yearHigh}\` : '—', color: 'text-foreground' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="bg-muted/30 rounded px-2.5 py-2">
                      <div className="text-[9px] text-muted-foreground uppercase tracking-wide mb-0.5">{label}</div>
                      <div className={\`text-sm font-bold \${color}\`}>{value}</div>
                    </div>
                  ))}
                </div>
                {/* 52-week price bar */}
                {data.yearLow && data.yearHigh && data.stockPrice && (
                  <div className="mt-3">
                    <div className="flex justify-between text-[9px] text-muted-foreground mb-1">
                      <span>52-week low \${data.yearLow}</span>
                      <span>Current \${data.stockPrice.toFixed(2)}</span>
                      <span>High \${data.yearHigh}</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-400 rounded-full" style={{ width: \`\${Math.min(100, ((data.stockPrice - data.yearLow) / (data.yearHigh - data.yearLow)) * 100)}%\` }} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <StatBox
                label="Deployed Capacity"
                value={formatMw(data.capacityDeployedMw)}
                icon={Zap}
                accent="text-primary"
              />
              <StatBox
                label="Pipeline Capacity"
                value={formatMw(data.capacityPipelineMw)}
                icon={TrendingUp}
                accent="text-emerald-400"
              />
              <StatBox
                label="News Items"
                value={String(data.news.length)}
                icon={Newspaper}
                accent="text-blue-400"
              />
            </div>

            {/* Two-column layout for profile + deals */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Description */}
              <div className="bg-card border border-border rounded-lg p-4">
                <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2.5">
                  Overview
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {data.description}
                </p>
              </div>

              {/* Technology */}
              <div className="bg-card border border-border rounded-lg p-4">
                <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2.5">
                  Technology & Equipment
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {data.technology ?? "—"}
                </p>
              </div>
            </div>

            {/* Key Deals */}
            {data.keyDeals && (
              <div className="bg-card border border-border rounded-lg p-4 mb-6">
                <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2.5">
                  Key Deals & Projects
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {data.keyDeals}
                </p>
              </div>
            )}

            {/* News Feed */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Newspaper size={14} className="text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">
                  News & Announcements
                </h3>
                <span className="text-xs text-muted-foreground">({data.news.length})</span>
              </div>

              {data.news.length === 0 ? (
                <div className="bg-card border border-border rounded-lg px-4 py-6 text-center">
                  <Newspaper size={20} className="text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No news items yet.</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    The weekly sweep will populate this section each Saturday.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.news.map((item) => (
                    <NewsCard key={item.id} item={item} />
                  ))}
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </Layout>
  );
}
`,
  "Companies.tsx": `import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import Layout from "@/components/Layout";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Globe, ExternalLink } from "lucide-react";
import { useState, useMemo } from "react";

const ROLE_LABELS: Record<string, string> = {
  hyperscaler: "Hyperscaler",
  dc_operator: "DC Operator",
  btm_developer: "BTM Developer",
  tech_vendor: "Tech Vendor",
  fuel_supplier: "Fuel / Power",
  investor: "Investor",
};

const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  hyperscaler: { bg: "bg-primary/10", text: "text-primary" },
  dc_operator: { bg: "bg-blue-500/10", text: "text-blue-400" },
  btm_developer: { bg: "bg-purple-500/10", text: "text-purple-400" },
  tech_vendor: { bg: "bg-accent/10", text: "text-accent" },
  fuel_supplier: { bg: "bg-yellow-500/10", text: "text-yellow-400" },
  investor: { bg: "bg-pink-500/10", text: "text-pink-400" },
};

export default function Companies() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const { data: companies, isLoading } = useQuery({
    queryKey: ["/api/companies"],
    queryFn: () => apiRequest("GET", "/api/companies").then((r) => r.json()),
  });

  const filtered = useMemo(() => {
    if (!companies) return [];
    return companies.filter((c: any) => {
      if (roleFilter !== "all" && c.role !== roleFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!c.name.toLowerCase().includes(q) && !c.description?.toLowerCase().includes(q) && !c.hq?.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [companies, search, roleFilter]);

  const grouped = useMemo(() => {
    const g: Record<string, any[]> = {};
    for (const c of filtered) {
      if (!g[c.role]) g[c.role] = [];
      g[c.role].push(c);
    }
    return g;
  }, [filtered]);

  const roleOrder = ["hyperscaler", "dc_operator", "btm_developer", "tech_vendor", "fuel_supplier", "investor"];

  return (
    <Layout>
      <div className="border-b border-border px-6 py-4 bg-card/50 sticky top-0 z-10 backdrop-blur-sm">
        <h1 className="text-lg font-bold text-foreground">Companies</h1>
        <p className="text-xs text-muted-foreground mt-0.5">All players in the data center BTM ecosystem</p>
      </div>

      <div className="px-6 py-5 space-y-5">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search companies…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-sm bg-secondary border-border"
              data-testid="input-company-search"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-40 h-8 text-sm bg-secondary border-border" data-testid="select-role-filter">
              <SelectValue placeholder="All roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {roleOrder.map((r) => (
                <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground ml-auto">{filtered.length} companies</span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {[...Array(9)].map((_, i) => <Skeleton key={i} className="h-36 rounded-xl" />)}
          </div>
        ) : roleFilter === "all" ? (
          // Grouped by role
          <div className="space-y-6">
            {roleOrder.filter((r) => grouped[r]?.length).map((role) => (
              <div key={role}>
                <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">{ROLE_LABELS[role]}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {grouped[role].map((c: any) => <CompanyCard key={c.id} company={c} />)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {filtered.map((c: any) => <CompanyCard key={c.id} company={c} />)}
          </div>
        )}
      </div>
    </Layout>
  );
}

function CompanyCard({ company: c }: { company: any }) {
  const rc = ROLE_COLORS[c.role] ?? { bg: "bg-secondary", text: "text-muted-foreground" };
  return (
    <Link href={\`/companies/\${c.id}\`}>
      <div
        data-testid={\`card-company-\${c.id}\`}
        className="project-card bg-card border border-border rounded-xl p-4 cursor-pointer h-full"
      >
        <div className="flex items-start gap-3 mb-2">
          <div className={\`w-9 h-9 rounded-lg \${rc.bg} flex items-center justify-center shrink-0 text-xs font-bold \${rc.text}\`}>
            {c.logoInitials ?? c.name.slice(0, 2)}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-foreground truncate">{c.name}</div>
            <span className={\`text-[10px] font-medium \${rc.text} \${rc.bg} px-1.5 py-0.5 rounded\`}>{ROLE_LABELS[c.role] ?? c.role}</span>
          </div>
          {c.ticker && (
            <span className="text-[10px] tabular text-muted-foreground ml-auto bg-secondary px-1.5 py-0.5 rounded font-mono">{c.ticker}</span>
          )}
        </div>

        {c.hq && (
          <div className="flex items-center gap-1 mb-2">
            <Globe size={10} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{c.hq} · {c.country}</span>
          </div>
        )}

        {c.description && (
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{c.description}</p>
        )}
      </div>
    </Link>
  );
}
`,
  "CompanyDetail.tsx": `import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import Layout from "@/components/Layout";
import { StatusBadge } from "@/components/TechBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Globe, ExternalLink, MapPin, Building2, Zap, BarChart2 } from "lucide-react";

const ROLE_LABELS: Record<string, string> = {
  hyperscaler: "Hyperscaler",
  dc_operator: "Data Center Operator",
  btm_developer: "BTM Developer / Power Provider",
  tech_vendor: "Technology Vendor",
  fuel_supplier: "Fuel / Power Supplier",
  investor: "Investor",
};

const ROLE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  hyperscaler: { bg: "bg-primary/10", text: "text-primary", border: "border-primary/20" },
  dc_operator: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" },
  btm_developer: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20" },
  tech_vendor: { bg: "bg-accent/10", text: "text-accent", border: "border-accent/20" },
  fuel_supplier: { bg: "bg-yellow-500/10", text: "text-yellow-400", border: "border-yellow-500/20" },
  investor: { bg: "bg-pink-500/10", text: "text-pink-400", border: "border-pink-500/20" },
};

export default function CompanyDetail() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const { data: company, isLoading } = useQuery({
    queryKey: ["/api/companies", id],
    queryFn: () => apiRequest("GET", \`/api/companies/\${id}\`).then((r) => r.json()),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="px-6 py-5 space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-32" />
        </div>
      </Layout>
    );
  }

  if (!company) return <Layout><div className="px-6 py-8 text-muted-foreground">Company not found.</div></Layout>;

  const rc = ROLE_COLORS[company.role] ?? { bg: "bg-secondary", text: "text-muted-foreground", border: "border-border" };

  return (
    <Layout>
      <div className="px-6 py-5 max-w-3xl">
        <Link href="/companies">
          <a className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-4 cursor-pointer">
            <ArrowLeft size={13} /> Back to Companies
          </a>
        </Link>

        {/* Header */}
        <div className="flex items-start gap-4 mb-5">
          <div className={\`w-14 h-14 rounded-xl \${rc.bg} border \${rc.border} flex items-center justify-center text-lg font-bold \${rc.text}\`}>
            {company.logoInitials ?? company.name.slice(0, 2)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-foreground">{company.name}</h1>
              {company.ticker && (
                <span className="text-xs tabular text-muted-foreground bg-secondary px-2 py-0.5 rounded font-mono">{company.ticker}</span>
              )}
            </div>
            <span className={\`text-xs font-medium \${rc.text} \${rc.bg} border \${rc.border} px-2 py-0.5 rounded-full mt-1 inline-block\`}>
              {ROLE_LABELS[company.role] ?? company.role}
            </span>
            {company.hq && (
              <div className="flex items-center gap-1.5 mt-2">
                <MapPin size={11} className="text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{company.hq}</span>
                <Globe size={11} className="text-muted-foreground ml-1" />
                <span className="text-sm text-muted-foreground">{company.country}</span>
              </div>
            )}
            {company.website && (
              <a href={\`https://\${company.website}\`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1">
                {company.website} <ExternalLink size={10} />
              </a>
            )}
          </div>
        </div>

        {/* Financial snapshot */}
        {company.stockPrice && (
          <div className="bg-card border border-border rounded-xl p-4 mb-5">
            <div className="flex items-center gap-2 mb-3">
              <BarChart2 size={13} className="text-emerald-400" />
              <span className="text-xs font-semibold text-foreground uppercase tracking-wide">Financials</span>
              {company.ticker && (
                <a href={\`https://perplexity.ai/finance/\${company.ticker}\`} target="_blank" rel="noopener noreferrer"
                  className="ml-auto flex items-center gap-1 text-[10px] text-primary hover:underline">
                  {company.ticker} <ExternalLink size={9} />
                </a>
              )}
              {company.finsUpdatedDate && <span className="text-[10px] text-muted-foreground">as of {company.finsUpdatedDate}</span>}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
              {[
                { label: 'Stock Price', value: \`$\${company.stockPrice.toFixed(2)}\` },
                { label: 'Market Cap', value: company.marketCapB ? \`$\${company.marketCapB >= 1000 ? (company.marketCapB/1000).toFixed(1)+'T' : company.marketCapB.toFixed(1)+'B'}\` : '—' },
                { label: 'P/E Ratio', value: company.peRatio ? \`\${company.peRatio.toFixed(1)}x\` : 'N/A' },
                { label: 'TTM Revenue', value: company.revenueTtmB ? \`$\${company.revenueTtmB >= 1000 ? (company.revenueTtmB/1000).toFixed(1)+'T' : company.revenueTtmB.toFixed(0)+'B'}\` : '—' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-muted/30 rounded px-3 py-2">
                  <div className="text-[9px] text-muted-foreground uppercase tracking-wide mb-0.5">{label}</div>
                  <div className="text-sm font-bold text-foreground">{value}</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: 'EBITDA (TTM)', value: company.ebitdaTtmB != null ? \`$\${Math.abs(company.ebitdaTtmB).toFixed(1)}B\` : '—', pos: (company.ebitdaTtmB ?? 0) >= 0 },
                { label: 'Net Income (TTM)', value: company.netIncomeTtmB != null ? \`$\${Math.abs(company.netIncomeTtmB).toFixed(1)}B\` : '—', pos: (company.netIncomeTtmB ?? 0) >= 0 },
                { label: 'Free Cash Flow (TTM)', value: company.fcfTtmB != null ? \`$\${Math.abs(company.fcfTtmB).toFixed(1)}B\` : '—', pos: (company.fcfTtmB ?? 0) >= 0 },
              ].map(({ label, value, pos }) => (
                <div key={label} className="bg-muted/30 rounded px-3 py-2">
                  <div className="text-[9px] text-muted-foreground uppercase tracking-wide mb-0.5">{label}</div>
                  <div className={\`text-sm font-bold \${pos ? 'text-emerald-400' : 'text-red-400'}\`}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        {company.description && (
          <div className="bg-card border border-border rounded-xl p-4 mb-5">
            <p className="text-sm text-foreground/90 leading-relaxed">{company.description}</p>
          </div>
        )}

        {/* Operated Projects */}
        {company.operatedProjects?.length > 0 && (
          <section className="mb-5">
            <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Building2 size={14} className="text-primary" />
              Operated Projects ({company.operatedProjects.length})
            </h2>
            <div className="space-y-2">
              {company.operatedProjects.map((p: any) => (
                <Link key={p.id} href={\`/projects/\${p.id}\`}>
                  <a className="block bg-card border border-border rounded-xl p-3 hover:border-primary/30 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">{p.name}</div>
                        <div className="text-xs text-muted-foreground">{p.location}</div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {p.btmCapacityMw && (
                          <div className="text-right">
                            <div className="tabular text-xs font-bold text-accent">{p.btmCapacityMw >= 1000 ? \`\${(p.btmCapacityMw / 1000).toFixed(1)} GW\` : \`\${p.btmCapacityMw} MW\`} BTM</div>
                          </div>
                        )}
                        <StatusBadge status={p.status} />
                      </div>
                    </div>
                  </a>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Linked Projects */}
        {company.linkedProjects?.length > 0 && (
          <section className="mb-5">
            <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Zap size={14} className="text-accent" />
              Involved In ({company.linkedProjects.length})
            </h2>
            <div className="space-y-2">
              {company.linkedProjects.map((p: any) => (
                <Link key={p.id} href={\`/projects/\${p.id}\`}>
                  <a className="block bg-card border border-border rounded-xl p-3 hover:border-primary/30 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">{p.name}</div>
                        <div className="text-xs text-muted-foreground">{p.location}</div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {p.btmCapacityMw && (
                          <div className="tabular text-xs font-bold text-accent">{p.btmCapacityMw >= 1000 ? \`\${(p.btmCapacityMw / 1000).toFixed(1)} GW\` : \`\${p.btmCapacityMw} MW\`} BTM</div>
                        )}
                        <StatusBadge status={p.status} />
                      </div>
                    </div>
                  </a>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}
`,
  "QueueIntelligence.tsx": `import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import Layout from "@/components/Layout";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle, TrendingUp, Activity, Info,
  ChevronRight, ExternalLink, ArrowUp, ArrowDown,
  Minus, CheckCircle2, Clock, Zap, BarChart2
} from "lucide-react";
import MethodologyTip from "@/components/MethodologyTip";

// ── RTO config ────────────────────────────────────────────────────────────────
const RTO_CFG: Record<string, { color: string; btmColor: string; btmLabel: string }> = {
  ERCOT: { color: "#10b981", btmColor: "#10b981", btmLabel: "Highly Favorable" },
  PJM:   { color: "#f59e0b", btmColor: "#f59e0b", btmLabel: "Transitional"     },
  MISO:  { color: "#3b82f6", btmColor: "#3b82f6", btmLabel: "Developing"       },
  SPP:   { color: "#8b5cf6", btmColor: "#94a3b8", btmLabel: "Neutral"          },
  CAISO: { color: "#a855f7", btmColor: "#ef4444", btmLabel: "Restrictive"      },
  NYISO: { color: "#6b7280", btmColor: "#ef4444", btmLabel: "Restrictive"      },
  ISONE: { color: "#94a3b8", btmColor: "#f59e0b", btmLabel: "Mixed"            },
};

// ── Reality check — large load focused ────────────────────────────────────────
const REALITY_STEPS = [
  {
    label: "Published Large Load Requests",
    value: "290+ GW",
    rawMw: 290000,
    color: "#ef4444",
    pct: 100,
    detail: "ERCOT alone has 233 GW of large load requests as of Dec 2025. PJM utilities forecast ~55 GW by 2030. Raw submissions are massively inflated by speculative and duplicate filings.",
    sources: [
      { label: "BIC Magazine: ERCOT 233 GW", url: "https://www.bicmagazine.com/industry/powergen/texas-grid-sees-233-gw-data-center-requests-much-real/" },
      { label: "Wood Mackenzie: PJM 55 GW", url: "https://www.whitecase.com/insight-alert/pjm-proposes-carve-out-new-services-co-located-data-centers" },
    ],
  },
  {
    label: "After Duplicate / Multi-Queue Filing Haircut",
    value: "~175 GW",
    rawMw: 175000,
    color: "#f97316",
    pct: 60,
    detail: "Developers routinely file the same project across multiple utility queues and multiple RTOs to hedge against localized transmission constraints. PJM's own load forecast applies a 43% reduction to raw utility submissions. ERCOT's new SB6 $100K fee + duplicate disclosure requirement was specifically designed to expose this.",
    sources: [
      { label: "PJM: 60 GW raw → 34 GW accepted (43% haircut)", url: "https://modoenergy.com/research/en/pjm-load-forecast-data-centers-2046" },
      { label: "ERCOT SB6 duplicate disclosure requirement", url: "https://www.texastribune.org/2026/01/19/ercot-texas-data-centers-electricty-demand/" },
    ],
  },
  {
    label: "Projects That Actually Submit Transmission Studies",
    value: "~105 GW",
    rawMw: 105000,
    color: "#f59e0b",
    pct: 36,
    detail: "In ERCOT alone, 128 GW of the 233 GW total — about 55% — has not submitted transmission studies required to begin the interconnection process. Projects without studies are fully speculative. Similar dynamics observed in PJM where raw large load adjustment submissions are filtered before entering the load forecast.",
    sources: [
      { label: "BIC Magazine: 128 GW no study submitted", url: "https://www.bicmagazine.com/industry/powergen/texas-grid-sees-233-gw-data-center-requests-much-real/" },
    ],
  },
  {
    label: "Projects With Financial Commitment / Agreement Signed",
    value: "~35 GW",
    rawMw: 35000,
    color: "#3b82f6",
    pct: 12,
    detail: "Once a project submits a study and completes the interconnection process, a financial commitment is required. PJM's new large load framework requires a $15K/MW readiness deposit. ERCOT's Batch Zero process will require firm financial commitments post-study. Projects that make it this far are highly likely to be built.",
    sources: [
      { label: "PJM EIT: $15K/MW readiness deposit", url: "https://www.troutmanenergyreport.com/2026/03/pjm-proposes-expedited-generator-interconnection-track/" },
      { label: "ERCOT Batch Zero financial commitment required", url: "https://www.texastribune.org/2026/01/19/ercot-texas-data-centers-electricty-demand/" },
    ],
  },
  {
    label: "Actually Connected to Grid (as of Q1 2026)",
    value: "~7.5 GW (ERCOT)",
    rawMw: 7500,
    color: "#10b981",
    pct: 2.6,
    detail: "In ERCOT, only ~7.5 GW of the 233 GW large load queue is actually connected and energized. The US had ~50 GW of total data center capacity online at end of 2025 (FERC State of Markets Mar 2026), but the majority is served via utility grid agreements, not the large load interconnection queue.",
    sources: [
      { label: "ERCOT: 7.5 GW actually connected", url: "https://www.bicmagazine.com/industry/powergen/texas-grid-sees-233-gw-data-center-requests-much-real/" },
      { label: "FERC: 50 GW US data center capacity online end 2025", url: "https://www.utilitydive.com/news/data-centers-miso-ferc-market-report/815831/" },
    ],
  },
];

// ── Generation queue — secondary context ──────────────────────────────────────
const GEN_QUEUE_CONTEXT = [
  { rto: "SPP",   genGw: 320, llGw: null,  note: "Mostly wind/solar speculation; minimal DC relevance" },
  { rto: "MISO",  genGw: 169, llGw: null,  note: "Cleaner post-Order 2023 reforms; large load queue not published" },
  { rto: "PJM",   genGw: 280, llGw: 55,    note: "55 GW large load by 2030 vs 280 GW gen queue" },
  { rto: "CAISO", genGw: 198, llGw: 1.8,   note: "CARB limits gas; 1.8 GW DC by 2030" },
  { rto: "ERCOT", genGw: 454, llGw: 233,   note: "Both queues massive; gen queue separate from load queue" },
  { rto: "NYISO", genGw: 82,  llGw: null,  note: "CLCPA constrained; no formal large load queue" },
  { rto: "ISONE", genGw: 36,  llGw: null,  note: "Small market; utility-level interconnection" },
];

function fgw(mw: number | null | undefined): string {
  if (!mw) return "—";
  if (mw >= 1000) return \`\${(mw / 1000).toFixed(0)} GW\`;
  return \`\${mw} MW\`;
}

// ── Reality Check ─────────────────────────────────────────────────────────────
function RealityCheck() {
  const [expanded, setExpanded] = useState<number | null>(null);
  const maxRaw = REALITY_STEPS[0].rawMw;

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Large Load Queue Reality Check</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            How real is the 290+ GW of large load interconnection requests? A five-step deduction from raw filings to actually connected.
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded shrink-0">
          <CheckCircle2 size={10} />
          ~2.6% actually connected
        </div>
      </div>

      <div className="space-y-4">
        {REALITY_STEPS.map((step, i) => {
          const barPct = (step.rawMw / maxRaw) * 100;
          const isOpen = expanded === i;
          return (
            <div key={i}>
              <button className="w-full text-left group" onClick={() => setExpanded(isOpen ? null : i)}>
                <div className="flex items-center justify-between gap-3 mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[10px] font-bold text-muted-foreground shrink-0 w-4">{i + 1}.</span>
                    <span className="text-xs font-semibold text-foreground truncate">{step.label}</span>
                    <Info size={11} className="text-muted-foreground group-hover:text-foreground shrink-0 transition-colors" />
                  </div>
                  <span className="text-sm font-bold tabular-nums shrink-0" style={{ color: step.color }}>
                    {step.value}
                  </span>
                </div>
                <div className="h-5 bg-muted/40 rounded overflow-hidden relative">
                  <div className="h-full rounded transition-all duration-700"
                    style={{ width: \`\${barPct}%\`, background: \`\${step.color}bb\` }} />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-medium text-muted-foreground">
                    {step.pct}% of raw requests
                  </span>
                </div>
              </button>

              {isOpen && (
                <div className="mt-2 ml-6 p-3 rounded-lg bg-muted/20 border border-border/50">
                  <p className="text-xs text-muted-foreground leading-relaxed mb-2">{step.detail}</p>
                  <div className="space-y-1">
                    {step.sources.map((s, si) => (
                      <div key={si} className="flex items-center gap-1 text-[10px]">
                        <span className="text-muted-foreground">→</span>
                        <a href={s.url} target="_blank" rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-0.5">
                          {s.label} <ExternalLink size={9} />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {i < REALITY_STEPS.length - 1 && (
                <div className="flex items-center gap-2 ml-5 mt-1.5">
                  <div className="w-0 border-l-2 border-dashed border-border h-3" />
                  <span className="text-[9px] text-muted-foreground italic">
                    {i === 0 ? "−40% multi-queue duplicates / phantom load" :
                     i === 1 ? "−40% never submit transmission studies" :
                     i === 2 ? "−67% don't reach financial commitment" :
                     "−79% not yet energized / under construction"}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-5 pt-4 border-t border-border">
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          <span className="text-amber-400 font-semibold">Bottom line: </span>
          Of 290+ GW of large load requests nationally, roughly 7–12 GW has reached firm commitment or energization as of Q1 2026.
          The 42 BTM projects in this tracker represent an estimated <span className="text-emerald-400 font-semibold">74+ GW of generation capacity that bypasses both the generation and load queues entirely</span> — the most time-efficient path to power for AI data centers by 5–10 years.
        </p>
        <Link href="/projects">
          <a className="inline-flex items-center gap-1 text-[10px] text-emerald-400 hover:underline mt-2">
            View BTM projects that skip the queue <ChevronRight size={9} />
          </a>
        </Link>
      </div>
    </div>
  );
}

// ── Large Load RTO Card ───────────────────────────────────────────────────────
function LargeLoadCard({ snap }: { snap: any }) {
  const cfg = RTO_CFG[snap.rto_id] ?? { color: "#6b7280", btmColor: "#6b7280", btmLabel: "—" };
  const hasData = snap.total_request_mw != null;
  const connectedPct = hasData && snap.total_request_mw > 0
    ? ((snap.actually_connected_mw ?? 0) / snap.total_request_mw * 100).toFixed(1)
    : null;

  return (
    <div className="bg-card border border-border rounded-xl p-4" style={{ borderTop: \`3px solid \${cfg.color}\` }}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-base font-bold text-foreground">{snap.rto_id}</span>
            <span className="text-[9px] font-medium px-1.5 py-0.5 rounded border"
              style={{ background: \`\${cfg.btmColor}18\`, color: cfg.btmColor, borderColor: \`\${cfg.btmColor}40\` }}>
              BTM: {cfg.btmLabel}
            </span>
          </div>
          <div className="text-[10px] text-muted-foreground">{snap.process_name}</div>
        </div>
        <div className="text-right">
          {hasData ? (
            <>
              <div className="text-xl font-bold tabular-nums" style={{ color: cfg.color }}>
                {fgw(snap.total_request_mw)}
              </div>
              <div className="text-[9px] text-muted-foreground">large load requests</div>
            </>
          ) : (
            <div className="text-sm text-muted-foreground italic">Queue not<br/>published</div>
          )}
        </div>
      </div>

      {/* Key metrics */}
      {hasData && (
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="bg-muted/30 rounded px-2 py-1.5">
            <div className="flex items-center gap-0.5 text-[9px] text-muted-foreground mb-0.5">
              Data Centers
              <MethodologyTip size="xs" side="right" title="Data Center %" body="Percentage of total large load interconnection requests from data centers (as opposed to crypto miners, hydrogen facilities, and other industrial large loads). In ERCOT, 77% of the 233 GW queue is data center driven. Source: ERCOT board reports Dec 2025." />
            </div>
            <div className="text-sm font-bold" style={{ color: cfg.color }}>
              {snap.data_center_pct ? \`\${snap.data_center_pct}%\` : "—"}
            </div>
            {snap.data_center_mw && (
              <div className="text-[9px] text-muted-foreground">{fgw(snap.data_center_mw)}</div>
            )}
          </div>
          <div className="bg-muted/30 rounded px-2 py-1.5">
            <div className="flex items-center gap-0.5 text-[9px] text-muted-foreground mb-0.5">
              Connected
              <MethodologyTip size="xs" side="right" title="Actually Connected" body="MW of large load interconnection requests that have completed the full process and are energized / operational. In ERCOT this is ~7.5 GW out of 233 GW total requests — a 3.2% connection rate. The gap reflects how new and overwhelmed large load queues are; many projects are years away from energization even if approved." />
            </div>
            <div className="text-sm font-bold text-emerald-400">
              {snap.actually_connected_mw ? fgw(snap.actually_connected_mw) : "—"}
            </div>
            {connectedPct && (
              <div className="text-[9px] text-muted-foreground">{connectedPct}% of requests</div>
            )}
          </div>
          <div className="bg-muted/30 rounded px-2 py-1.5">
            <div className="flex items-center gap-0.5 text-[9px] text-muted-foreground mb-0.5">
              No Study
              <MethodologyTip size="xs" side="left" title="No Transmission Study Submitted" body="Projects that have filed an interconnection request but have not yet submitted the required transmission study. In ERCOT, 128 GW of the 233 GW queue — 55% — falls into this category. Projects without a submitted study are the most speculative tier: they have expressed interest but made no financial or technical commitment. ERCOT's $100K SB6 fee is specifically designed to reduce this pool." sources={[{ label: "BIC Magazine: ERCOT 128 GW no study", url: "https://www.bicmagazine.com/industry/powergen/texas-grid-sees-233-gw-data-center-requests-much-real/" }]} />
            </div>
            <div className="text-sm font-bold text-red-400">
              {snap.no_study_submitted_mw ? fgw(snap.no_study_submitted_mw) : "—"}
            </div>
            {snap.no_study_submitted_mw && snap.total_request_mw && (
              <div className="text-[9px] text-muted-foreground">
                {((snap.no_study_submitted_mw / snap.total_request_mw) * 100).toFixed(0)}% speculative
              </div>
            )}
          </div>
        </div>
      )}

      {/* Speculative meter — ERCOT only since we have the data */}
      {snap.rto_id === 'ERCOT' && snap.total_request_mw && (
        <div className="mb-3">
          <div className="text-[9px] text-muted-foreground mb-1.5">Queue composition</div>
          <div className="h-4 rounded-full overflow-hidden flex gap-px">
            <div style={{ width: \`\${((snap.actually_connected_mw ?? 0) / snap.total_request_mw) * 100}%\`, background: "#10b981" }}
              title={\`Connected: \${fgw(snap.actually_connected_mw)}\`} />
            <div style={{ width: \`\${((snap.under_study_mw ?? 0) / snap.total_request_mw) * 100}%\`, background: "#f59e0b" }}
              title={\`Under study: \${fgw(snap.under_study_mw)}\`} />
            <div style={{ width: \`\${((snap.no_study_submitted_mw ?? 0) / snap.total_request_mw) * 100}%\`, background: "#ef4444" }}
              title={\`No study: \${fgw(snap.no_study_submitted_mw)}\`} />
          </div>
          <div className="flex items-center gap-3 mt-1">
            {[
              { color: "#10b981", label: \`Connected \${fgw(snap.actually_connected_mw)}\` },
              { color: "#f59e0b", label: \`Under study \${fgw(snap.under_study_mw)}\` },
              { color: "#ef4444", label: \`No study \${fgw(snap.no_study_submitted_mw)}\` },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-sm" style={{ background: color }} />
                <span className="text-[9px] text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Process status */}
      <div className="mb-3 px-2 py-1.5 rounded bg-muted/20 border border-border/50">
        <div className="text-[9px] text-muted-foreground mb-0.5 uppercase tracking-wide font-semibold">Process Status</div>
        <p className="text-[10px] text-foreground leading-relaxed">{snap.process_status}</p>
        {snap.min_threshold_mw && (
          <div className="text-[9px] text-muted-foreground mt-1">
            Min threshold: ≥{snap.min_threshold_mw} MW per POI
          </div>
        )}
      </div>

      <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-4 mb-2">{snap.notes}</p>

      {snap.source_url && (
        <a href={snap.source_url} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline">
          Source <ExternalLink size={9} />
        </a>
      )}
    </div>
  );
}

// ── Gen queue context table ────────────────────────────────────────────────────
function GenQueueContext({ genSnapshots }: { genSnapshots: any[] }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-1">
        <BarChart2 size={13} className="text-muted-foreground" />
        <h2 className="text-sm font-semibold text-foreground">Generation Queue Context</h2>
        <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground border border-border ml-1">Secondary</span>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        The generation interconnection queue (solar, wind, storage, gas waiting to connect supply-side) is separate from — and less relevant to — large load data center interconnection.
        Shown here for context only. <span className="text-amber-400">High generation queue = supply-side backstop for grid-tied DCs; BTM projects bypass both queues.</span>
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 text-muted-foreground font-medium">RTO</th>
              <th className="text-right py-2 px-3 text-muted-foreground font-medium">Gen Queue</th>
              <th className="text-right py-2 px-3 text-muted-foreground font-medium">Large Load Queue</th>
              <th className="text-right py-2 px-3 text-muted-foreground font-medium">Withdrawal Rate</th>
              <th className="text-right py-2 pl-3 text-muted-foreground font-medium">Avg Wait</th>
              <th className="text-left py-2 pl-4 text-muted-foreground font-medium">Note</th>
            </tr>
          </thead>
          <tbody>
            {GEN_QUEUE_CONTEXT.map(row => {
              const snap = genSnapshots.find(s => s.rto_id === row.rto);
              const cfg = RTO_CFG[row.rto] ?? { color: "#6b7280" };
              return (
                <tr key={row.rto} className="border-b border-border/40 hover:bg-muted/20 transition-colors">
                  <td className="py-2.5 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-sm" style={{ background: cfg.color }} />
                      <span className="font-semibold text-foreground">{row.rto}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-muted-foreground">
                    {snap ? fgw(snap.total_queue_mw) : \`\${row.genGw} GW\`}
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums font-semibold" style={{ color: cfg.color }}>
                    {row.llGw ? \`\${row.llGw} GW\` : <span className="text-muted-foreground font-normal">—</span>}
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-muted-foreground">
                    {snap?.withdrawal_rate_pct ? \`\${snap.withdrawal_rate_pct}%\` : "~75–80%"}
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-muted-foreground">
                    {snap?.avg_wait_yrs ? \`\${snap.avg_wait_yrs} yrs\` : "—"}
                  </td>
                  <td className="py-2.5 pl-4 text-muted-foreground text-[10px]">{row.note}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── WoW change ─────────────────────────────────────────────────────────────────
function WowTable({ llHistory }: { llHistory: any[] }) {
  const rtos = [...new Set(llHistory.map(h => h.rto_id))];

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-1">
        <h2 className="text-sm font-semibold text-foreground">Large Load Queue Trend</h2>
        <MethodologyTip
          title="Week-over-Week Calculation"
          body="Change is calculated by comparing the most recent snapshot date to the prior snapshot date for each RTO. A positive delta (red arrow) means more new large load requests were submitted than withdrew — queue is growing. A negative delta (green) means reforms or financial barriers (like ERCOT's $100K SB6 fee) are filtering out speculative filings. Snapshots are updated each Saturday from official RTO sources."
          sources={[
            { label: "ERCOT Monthly Operational Overview", url: "https://www.ercot.com" },
            { label: "PJM Large Load Adjustment Submissions", url: "https://www.pjm.com" },
          ]}
        />
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Period-over-period change in large load interconnection requests.
        <span className="text-red-400 ml-1">Red = queue growing (more new requests than withdrawals — bad for grid-tied projects).</span>
        <span className="text-emerald-400 ml-1">Green = queue shrinking (reforms filtering speculative filings — good).</span>
      </p>

      <div className="space-y-3">
        {rtos.map(rto => {
          const cfg = RTO_CFG[rto] ?? { color: "#6b7280" };
          const snaps = llHistory.filter(h => h.rto_id === rto).sort((a, b) => a.snapshot_date.localeCompare(b.snapshot_date));
          if (snaps.length < 2 || !snaps[0].total_request_mw || !snaps[1].total_request_mw) {
            // Single snap or no data — just show latest
            const latest = snaps[snaps.length - 1];
            return (
              <div key={rto} className="flex items-center gap-3 py-2 border-b border-border/40">
                <div className="w-2 h-2 rounded-sm shrink-0" style={{ background: cfg.color }} />
                <span className="text-xs font-semibold text-foreground w-16">{rto}</span>
                {latest?.total_request_mw ? (
                  <span className="text-xs tabular-nums font-semibold" style={{ color: cfg.color }}>
                    {fgw(latest.total_request_mw)}
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground italic">No formal queue published</span>
                )}
              </div>
            );
          }
          const prev = snaps[snaps.length - 2];
          const curr = snaps[snaps.length - 1];
          const delta = curr.total_request_mw - prev.total_request_mw;
          const deltaPct = ((delta / prev.total_request_mw) * 100).toFixed(0);

          return (
            <div key={rto} className="flex items-center gap-3 py-2 border-b border-border/40">
              <div className="w-2 h-2 rounded-sm shrink-0" style={{ background: cfg.color }} />
              <span className="text-xs font-semibold text-foreground w-16">{rto}</span>
              <span className="text-xs tabular-nums font-semibold w-16" style={{ color: cfg.color }}>
                {fgw(curr.total_request_mw)}
              </span>
              <div className="flex items-center gap-1">
                {delta > 0
                  ? <ArrowUp size={11} className="text-red-400" />
                  : delta < 0
                  ? <ArrowDown size={11} className="text-emerald-400" />
                  : <Minus size={11} className="text-muted-foreground" />}
                <span className={\`text-xs font-semibold tabular-nums \${delta > 0 ? "text-red-400" : delta < 0 ? "text-emerald-400" : "text-muted-foreground"}\`}>
                  {delta > 0 ? "+" : ""}{fgw(delta)} ({delta > 0 ? "+" : ""}{deltaPct}%)
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground ml-auto">
                {prev.snapshot_date} → {curr.snapshot_date}
              </span>
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-muted-foreground mt-3 border-t border-border pt-3">
        The Saturday sweep pulls updated large load queue figures from ERCOT Monthly Ops Overview, PJM large load adjustment data, and other official RTO publications.
      </p>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function QueueIntelligence() {
  const { data: llData, isLoading: llLoading } = useQuery<{ snapshots: any[]; history: any[] }>({
    queryKey: ["/api/queue/large-load"],
    queryFn: () => apiRequest("GET", "/api/queue/large-load").then(r => r.json()),
  });
  const { data: genData, isLoading: genLoading } = useQuery<{ snapshots: any[]; history: any[] }>({
    queryKey: ["/api/queue"],
    queryFn: () => apiRequest("GET", "/api/queue").then(r => r.json()),
  });

  const llSnaps = llData?.snapshots ?? [];
  const llHistory = llData?.history ?? [];
  const genSnaps = genData?.snapshots ?? [];

  const totalLLGw = llSnaps.filter(s => s.total_request_mw).reduce((s: number, r: any) => s + (r.total_request_mw ?? 0), 0) / 1000;
  const totalConnectedGw = llSnaps.filter(s => s.actually_connected_mw).reduce((s: number, r: any) => s + (r.actually_connected_mw ?? 0), 0) / 1000;

  return (
    <Layout>
      <div className="border-b border-border px-6 py-4 bg-card/50 sticky top-0 z-10 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Activity size={15} className="text-primary" />
              <h1 className="text-lg font-bold text-foreground">Queue Intelligence</h1>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              <span className="text-primary font-medium">Large load interconnection requests</span> — data centers, hyperscalers, industrial · with generation queue as secondary context
            </p>
          </div>
          {!llLoading && (
            <div className="flex items-center gap-5 text-right">
              <div>
                <div className="text-lg font-bold text-foreground tabular-nums">290+ GW</div>
                <div className="text-[10px] text-muted-foreground">large load requests</div>
              </div>
              <div>
                <div className="text-lg font-bold text-emerald-400 tabular-nums">{totalConnectedGw.toFixed(1)} GW</div>
                <div className="text-[10px] text-muted-foreground">actually connected</div>
              </div>
              <div>
                <div className="text-lg font-bold text-amber-400 tabular-nums">~2.6%</div>
                <div className="text-[10px] text-muted-foreground">connection rate</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="px-6 py-5 space-y-6">
        {/* Primary: Reality Check */}
        <RealityCheck />

        {/* WoW trend */}
        {llLoading ? <Skeleton className="h-40 rounded-xl" /> : <WowTable llHistory={llHistory} />}

        {/* Large load per-RTO cards */}
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3">Large Load Queue by RTO</h2>
          {llLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {llSnaps.map((snap: any) => <LargeLoadCard key={snap.rto_id} snap={snap} />)}
            </div>
          )}
        </div>

        {/* BTM callout */}
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Zap size={14} className="text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-emerald-400 mb-1">
                BTM projects skip both the generation queue and the large load queue
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                A grid-tied data center in PJM must navigate both queues: first the large load queue (1–5 years) to get grid capacity allocated, then potentially the generation queue (8+ years) if they bring their own generation. A fully BTM or off-grid project skips both entirely — it never touches a public interconnection process. With ERCOT only having 2.6% of large load requests actually connected, the time value of BTM is enormous.
              </p>
              <Link href="/map">
                <a className="inline-flex items-center gap-1 text-[10px] text-emerald-400 hover:underline mt-1.5">
                  View queue-bypass projects on map <ChevronRight size={9} />
                </a>
              </Link>
            </div>
          </div>
        </div>

        {/* Secondary: Gen queue context */}
        {genLoading ? <Skeleton className="h-40 rounded-xl" /> : <GenQueueContext genSnapshots={genSnaps} />}
      </div>
    </Layout>
  );
}
`,
  "MacroPower.tsx": `import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Layout from "@/components/Layout";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ExternalLink, Calendar, ChevronRight, AlertCircle,
  CheckCircle2, Clock, TrendingUp, Activity, Globe,
  RefreshCw, FileText
} from "lucide-react";

type KeyRuling = { date: string; text: string; url: string };

type RtoData = {
  id: string;
  name: string;
  fullName: string;
  region: string;
  status: "active" | "compliance" | "developing" | "favorable" | "early" | "monitoring";
  statusLabel: string;
  summary: string;
  keyRulings: KeyRuling[];
  nextMilestone: string;
  btmOutlook: string;
  docketUrl: string;
};

type LiveNewsItem = {
  title: string;
  url: string;
  snippet: string;
  date?: string;
};

const STATUS_CONFIG: Record<string, { color: string; bg: string; border: string; icon: React.ElementType; dot: string }> = {
  active:      { color: "text-red-400",     bg: "bg-red-500/10",     border: "border-red-500/30",     icon: AlertCircle,    dot: "bg-red-400" },
  compliance:  { color: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/30",   icon: Clock,          dot: "bg-amber-400" },
  developing:  { color: "text-blue-400",    bg: "bg-blue-500/10",    border: "border-blue-500/30",    icon: Activity,       dot: "bg-blue-400" },
  favorable:   { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", icon: CheckCircle2,   dot: "bg-emerald-400" },
  early:       { color: "text-purple-400",  bg: "bg-purple-500/10",  border: "border-purple-500/30",  icon: TrendingUp,     dot: "bg-purple-400" },
  monitoring:  { color: "text-slate-400",   bg: "bg-slate-500/10",   border: "border-slate-500/30",   icon: Globe,          dot: "bg-slate-400" },
};

const BTM_OUTLOOK_SCORE: Record<string, number> = {
  favorable: 5,
  developing: 3,
  compliance: 2,
  early: 2,
  monitoring: 3,
  active: 1,
};

function formatDate(s: string): string {
  const d = new Date(s + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function OutlookMeter({ score }: { score: number }) {
  const bars = 5;
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
          className={\`h-2 w-3.5 rounded-sm \${i < score
            ? score >= 4 ? "bg-emerald-400" : score >= 3 ? "bg-amber-400" : "bg-red-400"
            : "bg-muted"}\`}
        />
      ))}
    </div>
  );
}

function LiveNewsFeed({ rtoId }: { rtoId: string }) {
  const { data, isLoading, isError, refetch, isFetching } = useQuery<LiveNewsItem[]>({
    queryKey: ["/api/regulatory/news", rtoId],
    queryFn: () => apiRequest("GET", \`/api/regulatory/news?rto=\${rtoId}\`).then((r) => r.json()),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Live News</span>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
          data-testid={\`refresh-news-\${rtoId}\`}
        >
          <RefreshCw size={9} className={isFetching ? "animate-spin" : ""} />
          {isFetching ? "Fetching…" : "Refresh"}
        </button>
      </div>

      {isLoading && (
        <div className="space-y-2">
          {[1, 2].map((i) => <Skeleton key={i} className="h-10 w-full rounded" />)}
        </div>
      )}

      {isError && (
        <div className="text-[11px] text-muted-foreground bg-muted/30 rounded px-2 py-1.5">
          Live news unavailable — connect a Perplexity API key to enable real-time feeds.
        </div>
      )}

      {!isLoading && !isError && data && data.length === 0 && (
        <div className="text-[11px] text-muted-foreground">No recent news found.</div>
      )}

      {!isLoading && data && data.length > 0 && (
        <div className="space-y-2">
          {data.map((item, i) => (
            <div key={i} className="border border-border/50 rounded p-2 bg-muted/20">
              <div className="flex items-start justify-between gap-2">
                <p className="text-[11px] font-medium text-foreground leading-snug line-clamp-2">{item.title}</p>
                {item.url && (
                  <a href={item.url} target="_blank" rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary shrink-0 mt-0.5">
                    <ExternalLink size={10} />
                  </a>
                )}
              </div>
              {item.snippet && (
                <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{item.snippet}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RtoCard({ rto, isSelected, onClick }: { rto: RtoData; isSelected: boolean; onClick: () => void }) {
  const cfg = STATUS_CONFIG[rto.status] ?? STATUS_CONFIG.monitoring;
  const Icon = cfg.icon;
  const score = BTM_OUTLOOK_SCORE[rto.status] ?? 3;

  return (
    <button
      data-testid={\`rto-card-\${rto.id}\`}
      onClick={onClick}
      className={\`w-full text-left p-3 rounded-lg border transition-all duration-150 \${
        isSelected
          ? "border-primary/50 bg-primary/5 ring-1 ring-primary/20"
          : "border-border bg-card hover:border-border/80 hover:bg-card/80"
      }\`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <div className="text-base font-bold text-foreground leading-none">{rto.name}</div>
          <div className="text-[10px] text-muted-foreground mt-1 leading-tight">{rto.region}</div>
        </div>
        <div className={\`flex items-center gap-1 px-1.5 py-0.5 rounded border text-[9px] font-medium \${cfg.bg} \${cfg.border} \${cfg.color}\`}>
          <div className={\`w-1.5 h-1.5 rounded-full \${cfg.dot}\`} />
          {rto.statusLabel}
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-[9px] text-muted-foreground">BTM Outlook</span>
        <OutlookMeter score={score} />
      </div>
    </button>
  );
}

function RtoDetail({ rto }: { rto: RtoData }) {
  const cfg = STATUS_CONFIG[rto.status] ?? STATUS_CONFIG.monitoring;
  const score = BTM_OUTLOOK_SCORE[rto.status] ?? 3;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-bold text-foreground">{rto.fullName}</h2>
            <span className={\`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-medium \${cfg.bg} \${cfg.border} \${cfg.color}\`}>
              <div className={\`w-1.5 h-1.5 rounded-full \${cfg.dot}\`} />
              {rto.statusLabel}
            </span>
          </div>
          <div className="text-sm text-muted-foreground mt-0.5">{rto.region}</div>
        </div>
        {rto.docketUrl && (
          <a
            href={rto.docketUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors shrink-0"
            data-testid={\`docket-link-\${rto.id}\`}
          >
            <FileText size={12} />
            Docket
            <ExternalLink size={10} />
          </a>
        )}
      </div>

      {/* Summary */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">Proceeding Summary</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{rto.summary}</p>
      </div>

      {/* BTM Outlook */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide">BTM Outlook for Data Centers</h3>
          <OutlookMeter score={score} />
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{rto.btmOutlook}</p>
      </div>

      {/* Next Milestone */}
      <div className={\`rounded-lg p-3 border \${cfg.bg} \${cfg.border}\`}>
        <div className="flex items-center gap-1.5 mb-1">
          <Calendar size={11} className={cfg.color} />
          <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Next Milestone</span>
        </div>
        <p className={\`text-sm font-medium \${cfg.color}\`}>{rto.nextMilestone}</p>
      </div>

      {/* Key Rulings */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide mb-3">Key Rulings & Filings</h3>
        <div className="space-y-3">
          {rto.keyRulings.map((ruling, i) => (
            <div key={i} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className={\`w-2 h-2 rounded-full mt-1 shrink-0 \${cfg.dot}\`} />
                {i < rto.keyRulings.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
              </div>
              <div className="pb-3 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10px] text-muted-foreground">{formatDate(ruling.date)}</span>
                </div>
                <p className="text-xs text-foreground leading-snug">{ruling.text}</p>
                {ruling.url && (
                  <a
                    href={ruling.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-0.5 text-[10px] text-primary hover:underline mt-1"
                  >
                    Source <ExternalLink size={9} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live News */}
      <div className="bg-card border border-border rounded-lg p-4">
        <LiveNewsFeed rtoId={rto.id} />
      </div>
    </div>
  );
}

export default function MacroPower() {
  const [selectedRto, setSelectedRto] = useState<string>("ferc");

  const { data: rtos, isLoading } = useQuery<RtoData[]>({
    queryKey: ["/api/regulatory"],
    queryFn: () => apiRequest("GET", "/api/regulatory").then((r) => r.json()),
  });

  const selected = rtos?.find((r) => r.id === selectedRto);

  return (
    <Layout>
      <div className="px-6 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Activity size={16} className="text-primary" />
            <h1 className="text-lg font-semibold text-foreground">Federal / RTO</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            FERC and RTO-level proceedings on co-located BTM generation and data center interconnection — status, rulings, and live news.
          </p>
        </div>

        {/* Summary banner */}
        {!isLoading && rtos && (
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg px-4 py-3 mb-6 flex items-start gap-3">
            <AlertCircle size={14} className="text-amber-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-amber-400 mb-0.5">Critical Deadline: April 30, 2026</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                DOE directed FERC to take final action on national large-load interconnection rules (ANOPR RM26-4) by April 30, 2026.
                PJM's new BTM tariff targeting July 31, 2026 effective date. ERCOT remains outside FERC jurisdiction — most permissive BTM environment in the U.S.
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-5">
          {/* Left column: RTO selector cards */}
          <div className="w-52 shrink-0 space-y-2">
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)
              : rtos?.map((rto) => (
                  <RtoCard
                    key={rto.id}
                    rto={rto}
                    isSelected={selectedRto === rto.id}
                    onClick={() => setSelectedRto(rto.id)}
                  />
                ))
            }
          </div>

          {/* Right column: Detail panel */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-16 rounded-lg" />
                <Skeleton className="h-32 rounded-lg" />
                <Skeleton className="h-24 rounded-lg" />
                <Skeleton className="h-40 rounded-lg" />
              </div>
            ) : selected ? (
              <RtoDetail rto={selected} />
            ) : null}
          </div>
        </div>
      </div>
    </Layout>
  );
}
`,
  "MapView.tsx": `import { useQuery } from "@tanstack/react-query";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import Layout from "@/components/Layout";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, X, Layers, ChevronRight, Globe, AlertCircle, Clock, DollarSign, Zap, TrendingUp } from "lucide-react";
import MethodologyTip from "@/components/MethodologyTip";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { RTO_POLYGONS_OFFICIAL } from "@/lib/rtoPolygons";

// ── Corrected RTO state assignments (based on official FERC/RTO membership) ──
// Note: Several states are split between RTOs; we use the dominant load-serving RTO
const STATE_TO_RTO: Record<string, string> = {
  // ERCOT — Texas (85% of state)
  TX: "ERCOT",
  // PJM — 13 states + DC
  DE:"PJM", MD:"PJM", NJ:"PJM", PA:"PJM", VA:"PJM", WV:"PJM",
  NC:"PJM", TN:"PJM", DC:"PJM",
  OH:"PJM",   // majority PJM
  KY:"PJM",   // majority PJM (Duke Energy KY is PJM)
  IN:"PJM",   // majority PJM by load (NIPSCO is PJM)
  // MISO — 15 states + Manitoba
  MN:"MISO", IA:"MISO", WI:"MISO", MO:"MISO",
  ND:"MISO", SD:"MISO", MT:"MISO",
  AR:"MISO", LA:"MISO", MS:"MISO",
  IL:"MISO",  // majority MISO (ComEd northern IL is PJM exception)
  MI:"MISO",  // majority MISO
  // SPP — 14 states (central plains)
  KS:"SPP", OK:"SPP", NE:"SPP", WY:"SPP", CO:"SPP",
  NM:"SPP",   // eastern NM is SPP
  // NYISO
  NY:"NYISO",
  // ISO-NE
  ME:"ISONE", NH:"ISONE", VT:"ISONE", MA:"ISONE", RI:"ISONE", CT:"ISONE",
  // CAISO
  CA:"CAISO",
  // WECC non-CAISO West
  WA:"WECC", OR:"WECC", ID:"WECC", NV:"WECC", AZ:"WECC", UT:"WECC",
  AK:"OTHER", HI:"OTHER",
};

function getRto(state: string | null, country: string | null): string {
  if (!state || state === "USA") {
    if (country === "UAE" || country === "Canada" || country === "Singapore") return "INTL";
    return "OTHER";
  }
  return STATE_TO_RTO[state] ?? "OTHER";
}

// ── Interconnection type classification ──────────────────────────────────────
function getInterconnectType(p: any): "off_grid" | "btm_colocation" | "btm_hybrid" | "grid_standard" {
  if (p.fullyOffGrid) return "off_grid";
  if (p.hasBtm && !p.gridTied) return "btm_colocation";
  if (p.hasBtm) return "btm_hybrid";
  return "grid_standard";
}

const IC = {
  off_grid:       { color: "#ef4444", label: "Fully Off-Grid",       desc: "Zero grid dependency — bypasses interconnection entirely", ring: true  },
  btm_colocation: { color: "#f97316", label: "BTM Co-location",      desc: "Dedicated on-site generation, no grid netting required",  ring: true  },
  btm_hybrid:     { color: "#3b82f6", label: "BTM + Grid Hybrid",    desc: "On-site generation with grid backstop",                   ring: false },
  grid_standard:  { color: "#6b7280", label: "Grid-Tied (Standard)", desc: "Standard grid interconnection queue",                     ring: false },
};

// ── RTO data: accurate polygons + economics ──────────────────────────────────
// Polygons are simplified but state-accurate (not county-precise)
const RTO_DATA: Record<string, {
  label: string; color: string; statusLabel: string; status: string;
  queueWaitYrs: number; avgPriceMwh: number; queueGw: number;
  btmOutlook: string; macroId: string;
  polygon: [number, number][];
}> = {
  ERCOT: {
    label: "ERCOT", color: "#10b981",
    statusLabel: "Most Permissive — No FERC Jurisdiction",
    status: "favorable",
    queueWaitYrs: 2.5, avgPriceMwh: 32, queueGw: 290,
    btmOutlook: "Highly favorable. No federal BTM netting restrictions. Fastest BTM gas deployment market in the US.",
    macroId: "ercot",
  },
  PJM: {
    label: "PJM", color: "#f59e0b",
    statusLabel: "Compliance Filing Under Review",
    status: "compliance",
    queueWaitYrs: 8, avgPriceMwh: 48, queueGw: 280,
    btmOutlook: "Transitional. 50 MW BTM netting cap effective July 2026. Co-location permitted via 3 new TX service options. 8-year queue is the key driver of BTM demand.",
    macroId: "pjm",
  },
  MISO: {
    label: "MISO", color: "#3b82f6",
    statusLabel: "Zero-Injection Framework Developing",
    status: "developing",
    queueWaitYrs: 4.5, avgPriceMwh: 38, queueGw: 480,
    btmOutlook: "Developing. Zero-injection agreement concept favorable for full BTM — no netting restrictions. GenCo utility model (NIPSCO/Amazon) is the live test case.",
    macroId: "miso",
  },
  SPP: {
    label: "SPP", color: "#8b5cf6",
    statusLabel: "Monitoring FERC ANOPR",
    status: "monitoring",
    queueWaitYrs: 3.5, avgPriceMwh: 35, queueGw: 320,
    btmOutlook: "Neutral. No formal BTM proceedings. Wind-rich region with emerging BTM gas + hybrid opportunities. Lower land/energy costs than PJM or MISO.",
    macroId: "spp",
  },
  NYISO: {
    label: "NYISO", color: "#6b7280",
    statusLabel: "Monitoring PJM / FERC",
    status: "monitoring",
    queueWaitYrs: 5, avgPriceMwh: 58, queueGw: 90,
    btmOutlook: "Restrictive. CLCPA mandates 70% renewable by 2030. New gas BTM politically difficult. Nuclear co-location more viable. High electricity prices drive BTM economics.",
    macroId: "nyiso",
  },
  ISONE: {
    label: "ISO-NE", color: "#94a3b8",
    statusLabel: "Monitoring FERC ANOPR",
    status: "monitoring",
    queueWaitYrs: 4, avgPriceMwh: 55, queueGw: 40,
    btmOutlook: "Mixed. Highest power prices in continental US make BTM economics compelling. Limited gas pipeline capacity constrains new BTM gas projects.",
    macroId: "isone",
  },
  CAISO: {
    label: "CAISO", color: "#a855f7",
    statusLabel: "Issue Paper Stage",
    status: "early",
    queueWaitYrs: 4, avgPriceMwh: 52, queueGw: 210,
    btmOutlook: "Restrictive for gas BTM. CARB air quality rules make new gas turbine permits difficult. Storage + solar BTM more viable. 1.8 GW incremental DC load projected by 2030.",
    macroId: "caiso",
  },
};

const TECH_COLORS: Record<string, string> = {
  gas_turbine: "#3b82f6", recip_engine: "#f59e0b", fuel_cell: "#10b981",
  nuclear_smr: "#a855f7", nuclear_existing: "#7c3aed", battery: "#22c55e",
  solar: "#fbbf24", wind: "#06b6d4", diesel: "#9ca3af",
};
const TECH_LABELS: Record<string, string> = {
  gas_turbine: "Gas Turbine", recip_engine: "Recip Engine", fuel_cell: "Fuel Cell",
  nuclear_smr: "SMR Nuclear", nuclear_existing: "Nuclear (Existing)",
  battery: "Battery/BESS", solar: "Solar", wind: "Wind", diesel: "Diesel",
};
const STATUS_DOT: Record<string, string> = {
  announced: "bg-amber-400", under_construction: "bg-blue-400",
  operational: "bg-emerald-400", planned: "bg-slate-400",
};

function fmw(mw: number | null) {
  if (!mw) return "";
  return mw >= 1000 ? \`\${(mw / 1000).toFixed(1)} GW\` : \`\${mw} MW\`;
}
function primaryTech(p: any): string {
  const s = p.btmSources ?? [];
  if (!s.length) return "gas_turbine";
  return [...s].sort((a: any, b: any) => (b.capacityMw ?? 0) - (a.capacityMw ?? 0))[0]?.technologyType ?? "gas_turbine";
}

// Estimate $/MWh savings from BTM vs grid
function btmSavingsLabel(p: any, rtoId: string): string | null {
  const rto = RTO_DATA[rtoId];
  if (!rto || !p.btmCapacityMw) return null;
  const gridPrice = rto.avgPriceMwh;
  // BTM natural gas generation is typically $25-35/MWh all-in
  const btmCost = 30;
  const savingsPerMwh = gridPrice - btmCost;
  if (savingsPerMwh <= 0) return null;
  const annualMwh = p.btmCapacityMw * 8760 * 0.85; // 85% capacity factor
  const annualSavingsM = (annualMwh * savingsPerMwh) / 1_000_000;
  return \`~$\${annualSavingsM.toFixed(0)}M/yr savings vs grid\`;
}

// ── Leaflet map component ─────────────────────────────────────────────────────
function LeafletMap({ projects, showRto, selectedRto, onSelectRto, onSelectProject, selectedProjectId, showAdvancedOnly, flyToProject }: {
  projects: any[]; showRto: boolean; selectedRto: string | null;
  onSelectRto: (rto: string | null) => void; onSelectProject: (p: any) => void;
  selectedProjectId: number | null; showAdvancedOnly: boolean; flyToProject: any;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const polysRef = useRef<any[]>([]);

  useEffect(() => {
    if (!mapRef.current || leafletRef.current) return;
    const map = L.map(mapRef.current, { center: [38.5, -96.0], zoom: 4, zoomControl: true, preferCanvas: true });
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '© OpenStreetMap © CARTO', maxZoom: 19,
    }).addTo(map);
    leafletRef.current = map;
    return () => { map.remove(); leafletRef.current = null; };
  }, []);

  // Fly to selected project
  useEffect(() => {
    const map = leafletRef.current;
    if (!map || !flyToProject?.lat) return;
    map.flyTo([flyToProject.lat, flyToProject.lng], 7, { duration: 1.2, easeLinearity: 0.25 });
  }, [flyToProject]);

  // RTO polygons
  useEffect(() => {
    const map = leafletRef.current;
    if (!map) return;
    polysRef.current.forEach(p => p.remove());
    polysRef.current = [];
    if (!showRto) return;

    Object.entries(RTO_DATA).forEach(([rtoId, cfg]) => {
      const rings = RTO_POLYGONS_OFFICIAL[rtoId];
      if (!rings?.length) return;
      const isSelected = selectedRto === rtoId;

      // Draw all rings (multi-polygon RTOs like MISO, SPP have Gulf Coast fragments)
      rings.forEach((ring) => {
        const p = L.polygon(ring as any, {
          color: cfg.color,
          fillColor: cfg.color,
          fillOpacity: isSelected ? 0.20 : 0.07,
          weight: isSelected ? 2.5 : 1,
          opacity: isSelected ? 1 : 0.6,
          dashArray: isSelected ? undefined : "5 5",
          interactive: true,
        }).addTo(map);
        p.on("click", () => onSelectRto(selectedRto === rtoId ? null : rtoId));
        polysRef.current.push(p);
      });

      // Label + badge centered on the largest ring
      const biggestRing = [...rings].sort((a, b) => b.length - a.length)[0];
      const center = L.polygon(biggestRing as any).getBounds().getCenter();
      const isAdv = rtoId === "ERCOT";

      const labelHtml = \`<div style="
        background:\${cfg.color}\${isSelected ? "28" : "14"};
        border:1px solid \${cfg.color}\${isSelected ? "99" : "44"};
        color:\${cfg.color};padding:2px 8px;border-radius:4px;
        font-size:\${isSelected ? 12 : 10}px;font-weight:700;
        letter-spacing:.07em;white-space:nowrap;cursor:pointer;
        box-shadow:\${isSelected ? \`0 2px 12px \${cfg.color}33\` : "none"};
      ">\${cfg.label}\${isAdv ? " ⚡" : ""}</div>\`;

      const labelIcon = L.divIcon({ html: labelHtml, className: "", iconAnchor: [28, 10] });
      const label = L.marker(center, { icon: labelIcon, interactive: true, zIndexOffset: 10 }).addTo(map);

      const badgeHtml = \`<div style="
        background:#0f172a;border:1px solid \${cfg.color}44;
        color:\${cfg.color};padding:1px 5px;border-radius:3px;
        font-size:9px;font-weight:600;white-space:nowrap;
        opacity:\${isSelected ? 1 : 0.7};
      ">⏱ \${cfg.queueWaitYrs}yr queue · $\${cfg.avgPriceMwh}/MWh</div>\`;
      const badgeIcon = L.divIcon({ html: badgeHtml, className: "", iconAnchor: [40, -4] });
      const badge = L.marker([center.lat - 1.2, center.lng], { icon: badgeIcon, interactive: false }).addTo(map);

      label.on("click", () => onSelectRto(selectedRto === rtoId ? null : rtoId));
      polysRef.current.push(label, badge);
    });
  }, [showRto, selectedRto]);

  // Project markers
  useEffect(() => {
    const map = leafletRef.current;
    if (!map) return;
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const mappable = projects.filter(p => p.lat && p.lng);
    mappable.forEach((p: any) => {
      const itype = getInterconnectType(p);
      const cfg = IC[itype];
      const rtoId = getRto(p.state, p.country);
      const isSelected = p.id === selectedProjectId;
      const isAdv = itype === "off_grid" || itype === "btm_colocation";
      const isDimmed = showAdvancedOnly && !isAdv;

      const radius = isSelected ? 13 : isAdv ? 9 : 6;

      const marker = L.circleMarker([p.lat, p.lng], {
        radius,
        color: isSelected ? "#ffffff" : cfg.color,
        fillColor: cfg.color,
        fillOpacity: isDimmed ? 0.1 : isSelected ? 1 : 0.88,
        weight: isSelected ? 3 : isAdv ? 2 : 1.5,
        opacity: isDimmed ? 0.2 : 1,
      }).addTo(map);

      // Pulsing ring for advanced projects
      if (cfg.ring && !isDimmed) {
        const sz = (radius + 6) * 2;
        const ringIcon = L.divIcon({
          html: \`<div style="width:\${sz}px;height:\${sz}px;border-radius:50%;border:1.5px solid \${cfg.color}55;animation:mapPulse 2.2s ease-in-out infinite;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%)"></div>\`,
          className: "", iconAnchor: [0, 0],
        });
        const ring = L.marker([p.lat, p.lng], { icon: ringIcon, interactive: false, zIndexOffset: -1 }).addTo(map);
        markersRef.current.push(ring);
      }

      const savings = btmSavingsLabel(p, rtoId);
      const tech = primaryTech(p);
      const tip = \`
        <div style="min-width:180px">
          <div style="font-size:12px;font-weight:700;color:#f8fafc;margin-bottom:4px">\${p.name}</div>
          <div style="font-size:10px;color:#94a3b8;margin-bottom:6px">\${p.location ?? ""}</div>
          <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:6px">
            <span style="font-size:9px;padding:1px 5px;border-radius:3px;background:\${cfg.color}22;color:\${cfg.color};border:1px solid \${cfg.color}44">\${cfg.label}</span>
            <span style="font-size:9px;padding:1px 5px;border-radius:3px;background:#ffffff12;color:#64748b">\${rtoId}</span>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-bottom:\${savings ? 6 : 0}px">
            \${p.capacityMw ? \`<div><div style="font-size:11px;font-weight:700;color:#f8fafc">\${fmw(p.capacityMw)}</div><div style="font-size:9px;color:#64748b">IT Load</div></div>\` : ""}
            \${p.btmCapacityMw ? \`<div><div style="font-size:11px;font-weight:700;color:\${cfg.color}">\${fmw(p.btmCapacityMw)}</div><div style="font-size:9px;color:#64748b">BTM Gen</div></div>\` : ""}
          </div>
          \${savings ? \`<div style="font-size:9px;color:#10b981;background:#10b98114;border:1px solid #10b98133;border-radius:3px;padding:2px 6px">\${savings}</div>\` : ""}
        </div>\`;
      marker.bindTooltip(tip, { direction: "top", offset: [0, -radius], opacity: 0.97, sticky: false });
      marker.on("click", () => onSelectProject(p));
      markersRef.current.push(marker);
    });
  }, [projects, selectedProjectId, showAdvancedOnly]);

  return <div ref={mapRef} style={{ width: "100%", height: "100%" }} />;
}

// ── RTO panel ─────────────────────────────────────────────────────────────────
function RtoPanelContent({ rtoId, projects, rtos }: { rtoId: string; projects: any[]; rtos: any[] }) {
  const cfg = RTO_DATA[rtoId];
  if (!cfg) return null;
  const rtoProjects = projects.filter(p => getRto(p.state, p.country) === rtoId);
  const advanced = rtoProjects.filter(p => { const t = getInterconnectType(p); return t === "off_grid" || t === "btm_colocation"; });
  const totalBtmMw = rtoProjects.reduce((s, p) => s + (p.btmCapacityMw ?? 0), 0);
  const regulatory = rtos?.find((r: any) => r.id === cfg.macroId);

  return (
    <div className="flex-1 overflow-y-auto text-xs">
      {/* Header */}
      <div className="px-3 py-3 border-b border-border" style={{ borderLeft: \`3px solid \${cfg.color}\` }}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-bold text-foreground">{cfg.label}</span>
          <span className="text-[9px] font-medium px-1.5 py-0.5 rounded border"
            style={{ background: \`\${cfg.color}18\`, color: cfg.color, borderColor: \`\${cfg.color}44\` }}>
            {cfg.statusLabel}
          </span>
        </div>
        <div className="text-[10px] text-muted-foreground">
          {rtoProjects.length} tracked projects · {fmw(totalBtmMw)} BTM
          {advanced.length > 0 && <span className="text-orange-400 ml-1">· {advanced.length} bypassing queue</span>}
        </div>
      </div>

      {/* Economics strip */}
      <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
        <div className="px-3 py-2 text-center">
          <div className="flex items-center justify-center gap-0.5 mb-0.5">
            <Clock size={9} className="text-muted-foreground" />
            <MethodologyTip size="xs" side="right" title="Queue Wait Time" body="Average time from initial generation interconnection request to commercial operation. Based on LBNL Queued Up 2025 and RMI March 2026 analysis. In 2025, projects that became operational spent an average of 8 years in the PJM queue. ERCOT is fastest at ~2.5 years due to no FERC jurisdiction. Note: large load queue wait times are often shorter (1-3 years) but still longer than BTM." sources={[{ label: "LBNL Queued Up 2025", url: "https://emp.lbl.gov/queues" }, { label: "RMI March 2026", url: "https://rmi.org/interconnection-reform-ai-data-centers-generator-queues/" }]} />
          </div>
          <div className="font-bold text-foreground" style={{ color: cfg.queueWaitYrs >= 6 ? "#ef4444" : cfg.queueWaitYrs >= 4 ? "#f59e0b" : "#10b981" }}>
            {cfg.queueWaitYrs} yrs
          </div>
          <div className="text-[9px] text-muted-foreground">Queue wait</div>
        </div>
        <div className="px-3 py-2 text-center">
          <div className="flex items-center justify-center gap-0.5 mb-0.5">
            <DollarSign size={9} className="text-muted-foreground" />
            <MethodologyTip size="xs" side="right" title="Average Wholesale Power Price" body="Average day-ahead wholesale electricity price at major hubs within this RTO for 2025. Used to estimate the economic value of BTM generation vs grid-purchased power. A BTM gas project costs approximately $25-35/MWh all-in — the spread between this and the grid price is the annual savings per MWh of BTM capacity." sources={[{ label: "EIA: US wholesale prices rose in 2025", url: "https://www.eia.gov/todayinenergy/detail.php?id=67106" }, { label: "Utility Dive: wholesale price forecasts 2025" }]} />
          </div>
          <div className="font-bold text-foreground">\${cfg.avgPriceMwh}</div>
          <div className="text-[9px] text-muted-foreground">Avg $/MWh</div>
        </div>
        <div className="px-3 py-2 text-center">
          <div className="flex items-center justify-center gap-0.5 mb-0.5">
            <TrendingUp size={9} className="text-muted-foreground" />
            <MethodologyTip size="xs" side="left" title="Generation Queue Size" body="Total MW of generation projects (solar, wind, storage, gas) actively seeking grid interconnection in this RTO's queue as of latest available data. This is the generation interconnection queue — distinct from the large load queue. A large generation queue can indicate future supply availability but also queue congestion that slows individual project timelines." sources={[{ label: "LBNL Queued Up 2025", url: "https://emp.lbl.gov/queues" }]} />
          </div>
          <div className="font-bold text-foreground">{cfg.queueGw} GW</div>
          <div className="text-[9px] text-muted-foreground">Gen queue size</div>
        </div>
      </div>

      {/* BTM outlook */}
      <div className="px-3 py-2 border-b border-border bg-muted/10">
        <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">BTM Outlook</div>
        <p className="text-[10px] text-muted-foreground leading-relaxed">{cfg.btmOutlook}</p>
      </div>

      {/* Advanced projects highlight */}
      {advanced.length > 0 && (
        <div className="px-3 py-2 border-b border-border">
          <div className="flex items-center gap-1.5 mb-1.5">
            <AlertCircle size={10} className="text-orange-400" />
            <span className="text-[9px] font-semibold text-orange-400 uppercase tracking-wide">Queue-Bypassing Projects</span>
          </div>
          <div className="space-y-1.5">
            {advanced.map((p: any) => {
              const t = getInterconnectType(p);
              const ic = IC[t];
              const savings = btmSavingsLabel(p, rtoId);
              return (
                <div key={p.id} className="rounded px-2 py-1.5" style={{ background: \`\${ic.color}10\`, border: \`1px solid \${ic.color}28\` }}>
                  <div className="font-semibold text-foreground truncate" style={{ fontSize: 10 }}>{p.name}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[9px]" style={{ color: ic.color }}>{ic.label}</span>
                    {p.btmCapacityMw && <span className="text-[9px] text-muted-foreground">{fmw(p.btmCapacityMw)}</span>}
                    {savings && <span className="text-[9px] text-emerald-400">{savings.replace("~", "")}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Regulatory status from macro power DB */}
      {regulatory && (
        <div className="px-3 py-2 border-b border-border">
          <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Regulatory</div>
          <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-3">{regulatory.summary}</p>
          {regulatory.nextMilestone && (
            <div className="mt-1 text-[10px] font-medium" style={{ color: cfg.color }}>
              → {regulatory.nextMilestone.split("—")[0].trim()}
            </div>
          )}
          <Link href="/macro">
            <a className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline mt-1.5">
              Full regulatory detail <ChevronRight size={9} />
            </a>
          </Link>
        </div>
      )}

      {/* All projects */}
      <div className="px-3 py-2">
        <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
          All Projects ({rtoProjects.length})
        </div>
        {rtoProjects.map((p: any) => {
          const t = getInterconnectType(p);
          const ic = IC[t];
          return (
            <div key={p.id} className="flex items-center gap-2 py-1.5 border-b border-border/30 last:border-0">
              <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: ic.color }} />
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-medium text-foreground truncate">{p.name}</div>
                <div className="text-[9px] text-muted-foreground">{ic.label}</div>
              </div>
              {p.btmCapacityMw && <span className="text-[9px] font-semibold shrink-0" style={{ color: ic.color }}>{fmw(p.btmCapacityMw)}</span>}
            </div>
          );
        })}
        {rtoProjects.length === 0 && <p className="text-[10px] text-muted-foreground italic">No mapped projects in this region.</p>}
      </div>
    </div>
  );
}

// ── Project detail panel ──────────────────────────────────────────────────────
function ProjectPanel({ project: p, onClose }: { project: any; onClose: () => void }) {
  const itype = getInterconnectType(p);
  const ic = IC[itype];
  const rtoId = getRto(p.state, p.country);
  const rtoCfg = RTO_DATA[rtoId];
  const techs: string[] = [...new Set(p.btmSources?.map((b: any) => b.technologyType) ?? [])];
  const savings = btmSavingsLabel(p, rtoId);

  return (
    <div className="border-t border-border p-3 shrink-0" style={{ borderLeft: \`3px solid \${ic.color}\` }}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <div className="text-xs font-semibold text-foreground leading-snug">{p.name}</div>
          {p.operator && <div className="text-[10px] text-muted-foreground mt-0.5">{p.operator.name}</div>}
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground shrink-0 mt-0.5"><X size={13} /></button>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap mb-2">
        <span className="text-[9px] font-medium px-1.5 py-0.5 rounded border"
          style={{ background: \`\${ic.color}18\`, color: ic.color, borderColor: \`\${ic.color}44\` }}>
          {ic.label}
        </span>
        {rtoId !== "OTHER" && rtoId !== "INTL" && rtoCfg && (
          <span className="text-[9px] px-1.5 py-0.5 rounded border"
            style={{ background: \`\${rtoCfg.color}14\`, color: rtoCfg.color, borderColor: \`\${rtoCfg.color}40\` }}>
            {rtoId} · {rtoCfg.queueWaitYrs}yr queue
          </span>
        )}
        {p.location && (
          <span className="flex items-center gap-0.5 text-[9px] text-muted-foreground">
            <MapPin size={8} />{p.location}
          </span>
        )}
      </div>

      <div className="flex gap-3 flex-wrap mb-2">
        {p.capacityMw && <div><div className="text-sm font-bold text-foreground">{fmw(p.capacityMw)}</div><div className="text-[9px] text-muted-foreground">IT Load</div></div>}
        {p.btmCapacityMw && <div><div className="text-sm font-bold" style={{ color: ic.color }}>{fmw(p.btmCapacityMw)}</div><div className="text-[9px] text-muted-foreground">BTM Gen</div></div>}
        {p.totalInvestmentB && <div><div className="text-sm font-bold text-foreground">\${p.totalInvestmentB}B</div><div className="text-[9px] text-muted-foreground">Investment</div></div>}
      </div>

      {savings && (
        <div className="text-[10px] px-2 py-1 rounded mb-2" style={{ background: "#10b98114", color: "#10b981", border: "1px solid #10b98130" }}>
          {savings} vs grid at \${rtoCfg?.avgPriceMwh ?? "??"}/MWh
        </div>
      )}

      <p className="text-[10px] text-muted-foreground italic mb-2">{ic.desc}</p>

      {techs.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {techs.map((t: string) => (
            <span key={t} className="text-[9px] px-1.5 py-0.5 rounded font-medium"
              style={{ background: \`\${TECH_COLORS[t] ?? "#3b82f6"}22\`, color: TECH_COLORS[t] ?? "#3b82f6", border: \`1px solid \${TECH_COLORS[t] ?? "#3b82f6"}44\` }}>
              {TECH_LABELS[t] ?? t}
            </span>
          ))}
        </div>
      )}

      <Link href={\`/projects/\${p.id}\`}>
        <a className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline">
          Full detail <ChevronRight size={9} />
        </a>
      </Link>
    </div>
  );
}

// ── Project list row ──────────────────────────────────────────────────────────
function ProjectRow({ p, isSelected, onClick }: { p: any; isSelected: boolean; onClick: () => void }) {
  const itype = getInterconnectType(p);
  const ic = IC[itype];
  const rtoId = getRto(p.state, p.country);
  const rtoCfg = RTO_DATA[rtoId];
  return (
    <button onClick={onClick} data-testid={\`map-row-\${p.id}\`}
      className={\`w-full text-left px-3 py-2 border-b border-border/40 last:border-0 hover:bg-muted/40 transition-colors \${isSelected ? "bg-primary/5" : ""}\`}
      style={isSelected ? { borderLeft: \`2px solid \${ic.color}\` } : {}}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[11px] font-medium text-foreground truncate">{p.name}</div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: ic.color }} />
            <span className="text-[9px]" style={{ color: ic.color }}>{ic.label}</span>
            {rtoCfg && <span className="text-[9px] text-muted-foreground">· {rtoId}</span>}
          </div>
        </div>
        <div className="flex flex-col items-end gap-0.5 shrink-0">
          {p.btmCapacityMw && <span className="text-[10px] font-semibold" style={{ color: ic.color }}>{fmw(p.btmCapacityMw)}</span>}
          <div className={\`w-1.5 h-1.5 rounded-full \${STATUS_DOT[p.status] ?? "bg-slate-400"}\`} />
        </div>
      </div>
    </button>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function MapView() {
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [selectedRto, setSelectedRto] = useState<string | null>(null);
  const [showRto, setShowRto] = useState(true);
  const [showAdvancedOnly, setShowAdvancedOnly] = useState(false);
  const [techFilter, setTechFilter] = useState("all");
  const [flyToProject, setFlyToProject] = useState<any>(null);

  const { data: projects, isLoading } = useQuery({
    queryKey: ["/api/projects"],
    queryFn: () => apiRequest("GET", "/api/projects").then(r => r.json()),
  });
  const { data: rtos } = useQuery({
    queryKey: ["/api/regulatory"],
    queryFn: () => apiRequest("GET", "/api/regulatory").then(r => r.json()),
  });

  const allMapped = useMemo(() => projects?.filter((p: any) => p.lat && p.lng) ?? [], [projects]);

  const filtered = useMemo(() => {
    if (!projects) return [];
    let list = projects;
    if (techFilter !== "all") list = list.filter((p: any) => p.btmSources?.some((b: any) => b.technologyType === techFilter));
    if (selectedRto) list = list.filter((p: any) => getRto(p.state, p.country) === selectedRto);
    return list;
  }, [projects, techFilter, selectedRto]);

  const advancedCount = useMemo(() => allMapped.filter((p: any) => {
    const t = getInterconnectType(p); return t === "off_grid" || t === "btm_colocation";
  }).length, [allMapped]);

  const totalBtmMw = filtered.reduce((s: number, p: any) => s + (p.btmCapacityMw ?? 0), 0);

  const handleSelectProject = useCallback((p: any) => {
    setSelectedProject(prev => {
      if (prev?.id === p.id) return null;
      setFlyToProject(p);
      return p;
    });
    setSelectedRto(null);
  }, []);

  const handleSelectRto = useCallback((rto: string | null) => {
    setSelectedRto(rto);
    setSelectedProject(null);
  }, []);

  const mapProjects = useMemo(() => {
    if (showAdvancedOnly) return allMapped.filter((p: any) => { const t = getInterconnectType(p); return t === "off_grid" || t === "btm_colocation"; });
    return allMapped;
  }, [allMapped, showAdvancedOnly]);

  return (
    <Layout>
      <style>{\`
        @keyframes mapPulse {
          0%,100% { opacity:.55; transform:translate(-50%,-50%) scale(1); }
          50%      { opacity:.15; transform:translate(-50%,-50%) scale(1.7); }
        }
      \`}</style>

      <div className="flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="border-b border-border px-6 py-2.5 bg-card/50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Globe size={14} className="text-primary" />
              <span className="text-sm font-semibold text-foreground">Project Map</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <span className="text-xs text-muted-foreground">
              {allMapped.length} mapped · {(totalBtmMw / 1000).toFixed(1)} GW BTM shown ·{" "}
              <span className="text-orange-400 font-medium">{advancedCount} bypassing interconnection queue</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <select value={techFilter} onChange={e => setTechFilter(e.target.value)}
              className="h-7 text-xs bg-secondary border border-border rounded px-2 text-foreground">
              <option value="all">All Technologies</option>
              {Object.entries(TECH_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <button onClick={() => setShowAdvancedOnly(v => !v)}
              className={\`flex items-center gap-1.5 px-2.5 h-7 rounded text-xs border transition-colors \${showAdvancedOnly ? "bg-orange-500/10 border-orange-500/30 text-orange-400" : "bg-secondary border-border text-muted-foreground hover:text-foreground"}\`}>
              <AlertCircle size={10} /> Queue Bypass
            </button>
            <button onClick={() => setShowRto(v => !v)}
              className={\`flex items-center gap-1.5 px-2.5 h-7 rounded text-xs border transition-colors \${showRto ? "bg-primary/10 border-primary/30 text-primary" : "bg-secondary border-border text-muted-foreground hover:text-foreground"}\`}>
              <Layers size={10} /> RTO Zones
            </button>
            {(selectedRto || techFilter !== "all" || showAdvancedOnly) && (
              <button onClick={() => { setSelectedRto(null); setTechFilter("all"); setShowAdvancedOnly(false); }}
                className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 px-1.5">
                <X size={10} /> Clear
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-1 min-h-0">
          {/* Side panel */}
          <div className="w-64 shrink-0 border-r border-border flex flex-col bg-card min-h-0">
            {selectedRto ? (
              <>
                <div className="px-3 py-2 border-b border-border flex items-center justify-between shrink-0">
                  <span className="text-[11px] font-semibold text-foreground">{RTO_DATA[selectedRto]?.label ?? selectedRto} Region</span>
                  <button onClick={() => setSelectedRto(null)} className="text-muted-foreground hover:text-foreground"><X size={12} /></button>
                </div>
                <RtoPanelContent rtoId={selectedRto} projects={projects ?? []} rtos={rtos ?? []} />
              </>
            ) : (
              <>
                <div className="px-3 py-2 border-b border-border shrink-0">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                    {filtered.length} Projects
                    {selectedRto && \` in \${selectedRto}\`}
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {isLoading
                    ? Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-12 m-2 rounded" />)
                    : filtered.map((p: any) => (
                        <ProjectRow key={p.id} p={p}
                          isSelected={selectedProject?.id === p.id}
                          onClick={() => handleSelectProject(p)} />
                      ))
                  }
                </div>
              </>
            )}
            {selectedProject && !selectedRto && (
              <ProjectPanel project={selectedProject} onClose={() => setSelectedProject(null)} />
            )}
          </div>

          {/* Map */}
          <div className="flex-1 relative min-h-0">
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center bg-muted/10">
                <div className="text-sm text-muted-foreground">Loading map…</div>
              </div>
            ) : (
              <LeafletMap
                projects={mapProjects}
                showRto={showRto}
                selectedRto={selectedRto}
                onSelectRto={handleSelectRto}
                onSelectProject={handleSelectProject}
                selectedProjectId={selectedProject?.id ?? null}
                showAdvancedOnly={showAdvancedOnly}
                flyToProject={flyToProject}
              />
            )}

            {/* Legend */}
            <div className="absolute bottom-4 right-4 z-[1000] bg-card/93 border border-border rounded-lg px-3 py-2.5 backdrop-blur-sm pointer-events-none">
              <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Interconnection Type</div>
              {Object.entries(IC).map(([k, v]) => (
                <div key={k} className="flex items-center gap-2 mb-1">
                  <div className="relative shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: v.color }} />
                    {v.ring && <div className="absolute inset-0 rounded-full border" style={{ borderColor: \`\${v.color}55\`, transform: "scale(1.7)" }} />}
                  </div>
                  <span className="text-[10px] text-muted-foreground">{v.label}</span>
                </div>
              ))}
              <div className="border-t border-border mt-2 pt-2">
                <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">RTO Queue Wait</div>
                <div className="flex items-center gap-1.5 mb-1"><div className="w-2 h-2 rounded-sm bg-emerald-500" /><span className="text-[10px] text-muted-foreground">&lt;3 yrs (ERCOT)</span></div>
                <div className="flex items-center gap-1.5 mb-1"><div className="w-2 h-2 rounded-sm bg-amber-400" /><span className="text-[10px] text-muted-foreground">3–5 yrs (MISO/SPP)</span></div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm bg-red-500" /><span className="text-[10px] text-muted-foreground">5–8 yrs (PJM/NYISO)</span></div>
              </div>
            </div>

            {/* Hint */}
            {showRto && !selectedRto && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none">
                <div className="bg-card/85 border border-border rounded-full px-3 py-1 backdrop-blur-sm">
                  <span className="text-[10px] text-muted-foreground">Click an RTO zone · markers show queue-bypass type · pulsing = advanced interconnection</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
`,
  "Settings.tsx": `import { useState } from "react";
import Layout from "@/components/Layout";
import { THEMES, applyTheme, storeTheme, getStoredTheme } from "@/lib/themes";
import type { ThemeId } from "@/lib/themes";
import { Settings2, Check, Palette } from "lucide-react";

export default function Settings() {
  const [activeTheme, setActiveTheme] = useState<ThemeId>(getStoredTheme);

  function selectTheme(id: ThemeId) {
    setActiveTheme(id);
    applyTheme(id);
    storeTheme(id);
  }

  return (
    <Layout>
      <div className="px-6 py-6 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <Settings2 size={16} className="text-primary" />
          <h1 className="text-lg font-semibold text-foreground">Settings</h1>
        </div>

        {/* Theme section */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-1">
            <Palette size={14} className="text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Appearance</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-5">
            Choose a color theme. Your preference is saved for this session.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {THEMES.map(theme => {
              const isActive = activeTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  data-testid={\`theme-\${theme.id}\`}
                  onClick={() => selectTheme(theme.id)}
                  className={\`group relative text-left rounded-xl border-2 p-4 transition-all duration-150 \${
                    isActive
                      ? "border-primary ring-1 ring-primary/30"
                      : "border-border hover:border-border/80"
                  }\`}
                  style={{ background: theme.preview.bg }}
                >
                  {/* Preview swatch */}
                  <div className="flex gap-1.5 mb-3">
                    <div className="w-8 h-8 rounded-lg" style={{ background: theme.preview.card, border: "1px solid rgba(255,255,255,0.08)" }} />
                    <div className="flex-1 flex flex-col gap-1 justify-center">
                      <div className="h-2 rounded-full w-full" style={{ background: "rgba(255,255,255,0.08)" }} />
                      <div className="h-2 rounded-full w-2/3" style={{ background: theme.preview.accent + "88" }} />
                    </div>
                    <div className="w-5 h-5 rounded-full shrink-0" style={{ background: theme.preview.accent }} />
                  </div>

                  {/* Name */}
                  <div className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.85)" }}>
                    {theme.name}
                  </div>
                  <div className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                    {theme.description}
                  </div>

                  {/* Active checkmark */}
                  {isActive && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Check size={11} className="text-primary-foreground" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <p className="text-[10px] text-muted-foreground mt-4">
            Theme applies immediately. Session storage keeps your choice while the app is open — it will reset on next visit.
            Persistent user preferences coming in a future update.
          </p>
        </div>

        {/* More settings sections — placeholders for future */}
        <div className="mt-4 bg-card border border-border rounded-xl p-5 opacity-50">
          <h2 className="text-sm font-semibold text-foreground mb-1">Data Preferences</h2>
          <p className="text-xs text-muted-foreground">Configure default filters, MW display units, and notification preferences — coming soon.</p>
        </div>
      </div>
    </Layout>
  );
}
`,
  "ProjectDetail.tsx": `import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import Layout from "@/components/Layout";
import TechBadge, { StatusBadge } from "@/components/TechBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, MapPin, Zap, DollarSign, Globe, Building2, Wifi, WifiOff, ExternalLink, Fuel } from "lucide-react";

const ROLE_COLORS: Record<string, string> = {
  customer: "text-primary",
  tech_vendor: "text-accent",
  fuel_supplier: "text-yellow-400",
  btm_developer: "text-purple-400",
  investor: "text-pink-400",
  operator: "text-foreground",
  partner: "text-blue-400",
  epc: "text-orange-400",
};

const ROLE_LABELS: Record<string, string> = {
  customer: "Customer",
  tech_vendor: "Technology Vendor",
  fuel_supplier: "Fuel / Power Supplier",
  btm_developer: "BTM Developer",
  investor: "Investor",
  operator: "Operator",
  partner: "Partner",
  epc: "EPC Contractor",
};

const FUEL_LABELS: Record<string, string> = {
  natural_gas: "Natural Gas",
  hydrogen: "Hydrogen",
  nuclear: "Nuclear",
  solar: "Solar",
  wind: "Wind",
  diesel: "Diesel",
};

export default function ProjectDetail() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const { data: project, isLoading } = useQuery({
    queryKey: ["/api/projects", id],
    queryFn: () => apiRequest("GET", \`/api/projects/\${id}\`).then((r) => r.json()),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="px-6 py-5 space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-48" />
          <Skeleton className="h-64" />
        </div>
      </Layout>
    );
  }

  if (!project) return <Layout><div className="px-6 py-8 text-muted-foreground">Project not found.</div></Layout>;

  const p = project;
  const btmSources = p.btmSources ?? [];
  const linkedCompanies = p.linkedCompanies ?? [];

  // Group companies by role
  const companyByRole: Record<string, any[]> = {};
  for (const c of linkedCompanies) {
    if (!companyByRole[c.role]) companyByRole[c.role] = [];
    companyByRole[c.role].push(c);
  }

  return (
    <Layout>
      <div className="px-6 py-5 max-w-4xl">
        {/* Back */}
        <Link href="/">
          <a className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-4 cursor-pointer">
            <ArrowLeft size={13} /> Back to Dashboard
          </a>
        </Link>

        {/* Title block */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h1 className="text-xl font-bold text-foreground leading-tight">{p.name}</h1>
            {p.operator && (
              <Link href={\`/companies/\${p.operator.id}\`}>
                <a className="text-sm text-primary hover:underline mt-1 inline-block cursor-pointer">{p.operator.name}</a>
              </Link>
            )}
            <div className="flex items-center gap-1.5 mt-1.5">
              <MapPin size={12} className="text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{p.location}</span>
            </div>
          </div>
          <StatusBadge status={p.status} />
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {p.capacityMw && (
            <div className="bg-card border border-border rounded-xl p-3">
              <div className="text-xs text-muted-foreground mb-1">IT Capacity</div>
              <div className="tabular text-lg font-bold text-foreground">{p.capacityMw >= 1000 ? \`\${(p.capacityMw / 1000).toFixed(1)} GW\` : \`\${p.capacityMw} MW\`}</div>
            </div>
          )}
          {p.hasBtm && p.btmCapacityMw && (
            <div className="bg-card border border-border rounded-xl p-3">
              <div className="text-xs text-muted-foreground mb-1">BTM Generation</div>
              <div className="tabular text-lg font-bold text-accent">{p.btmCapacityMw >= 1000 ? \`\${(p.btmCapacityMw / 1000).toFixed(1)} GW\` : \`\${p.btmCapacityMw} MW\`}</div>
            </div>
          )}
          {p.totalInvestmentB && (
            <div className="bg-card border border-border rounded-xl p-3">
              <div className="text-xs text-muted-foreground mb-1">Investment</div>
              <div className="tabular text-lg font-bold text-foreground">\${p.totalInvestmentB}B</div>
            </div>
          )}
          {p.announcedDate && (
            <div className="bg-card border border-border rounded-xl p-3">
              <div className="text-xs text-muted-foreground mb-1">Announced</div>
              <div className="text-sm font-semibold text-foreground">{new Date(p.announcedDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</div>
            </div>
          )}
        </div>

        {/* Grid status */}
        <div className="flex items-center gap-3 mb-5">
          {p.fullyOffGrid ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-destructive/10 border border-destructive/20">
              <WifiOff size={13} className="text-destructive" />
              <span className="text-xs font-medium text-destructive">Fully Off-Grid — No Utility Interconnect</span>
            </div>
          ) : p.hasBtm && p.gridTied ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/20">
              <Wifi size={13} className="text-accent" />
              <span className="text-xs font-medium text-accent">BTM + Grid Hybrid</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary border border-border">
              <Wifi size={13} className="text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Grid-Connected (no BTM)</span>
            </div>
          )}
        </div>

        {/* Notes */}
        {p.notes && (
          <div className="bg-secondary/50 border border-border rounded-xl p-4 mb-5">
            <p className="text-sm text-foreground/90 leading-relaxed">{p.notes}</p>
            {p.sourceUrl && (
              <a href={p.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2">
                Source <ExternalLink size={10} />
              </a>
            )}
          </div>
        )}

        {/* BTM Generation Sources */}
        {btmSources.length > 0 && (
          <section className="mb-5">
            <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Zap size={14} className="text-accent" />
              BTM Generation Sources
            </h2>
            <div className="space-y-2.5">
              {btmSources.map((b: any) => (
                <div key={b.id} className="bg-card border border-border rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <TechBadge type={b.technologyType} />
                      {b.productModel && (
                        <span className="text-xs text-muted-foreground font-mono bg-secondary px-2 py-0.5 rounded">{b.productModel}</span>
                      )}
                    </div>
                    <div className="tabular text-sm font-bold text-foreground shrink-0">
                      {b.capacityMw ? (b.capacityMw >= 1000 ? \`\${(b.capacityMw / 1000).toFixed(1)} GW\` : \`\${b.capacityMw} MW\`) : "—"}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-2">
                    {b.vendor && (
                      <div>
                        <div className="text-[10px] text-muted-foreground mb-0.5">Technology Vendor</div>
                        <Link href={\`/companies/\${b.vendor.id}\`}>
                          <a className="text-xs text-primary hover:underline cursor-pointer font-medium">{b.vendor.name}</a>
                        </Link>
                      </div>
                    )}
                    {b.developer && b.developer.id !== p.operatorId && (
                      <div>
                        <div className="text-[10px] text-muted-foreground mb-0.5">BTM Developer</div>
                        <Link href={\`/companies/\${b.developer.id}\`}>
                          <a className="text-xs text-primary hover:underline cursor-pointer font-medium">{b.developer.name}</a>
                        </Link>
                      </div>
                    )}
                    {b.fuelSource && (
                      <div>
                        <div className="text-[10px] text-muted-foreground mb-0.5">Fuel Supplier</div>
                        <Link href={\`/companies/\${b.fuelSource.id}\`}>
                          <a className="text-xs text-yellow-400 hover:underline cursor-pointer font-medium">{b.fuelSource.name}</a>
                        </Link>
                      </div>
                    )}
                    {b.fuelType && (
                      <div>
                        <div className="text-[10px] text-muted-foreground mb-0.5">Fuel Type</div>
                        <span className="text-xs text-foreground">{FUEL_LABELS[b.fuelType] ?? b.fuelType}</span>
                      </div>
                    )}
                    {b.originCountry && (
                      <div>
                        <div className="text-[10px] text-muted-foreground mb-0.5">Manufactured In</div>
                        <div className="flex items-center gap-1">
                          <Globe size={10} className="text-muted-foreground" />
                          <span className="text-xs text-foreground">{b.originCountry}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {b.notes && (
                    <p className="text-xs text-muted-foreground leading-relaxed border-t border-border pt-2 mt-2">{b.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Companies Involved */}
        {Object.keys(companyByRole).length > 0 && (
          <section className="mb-5">
            <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Building2 size={14} className="text-primary" />
              Companies Involved
            </h2>
            <div className="space-y-3">
              {Object.entries(companyByRole).map(([role, cos]) => (
                <div key={role}>
                  <div className="text-xs text-muted-foreground mb-1.5">{ROLE_LABELS[role] ?? role}</div>
                  <div className="flex flex-wrap gap-2">
                    {cos.map((c: any) => (
                      <Link key={c.id} href={\`/companies/\${c.id}\`}>
                        <a className={\`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary border border-border text-xs font-medium hover:border-primary/30 transition-colors cursor-pointer \${ROLE_COLORS[role] ?? "text-foreground"}\`}>
                          <span className="w-5 h-5 rounded text-[9px] font-bold bg-background flex items-center justify-center text-muted-foreground">{c.logoInitials ?? c.name?.slice(0, 2)}</span>
                          {c.name}
                        </a>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}
`,
  "index.ts": `import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { seedDatabase } from "./seed";
import { seedDatabaseV2 } from "./seed_v2";
import { seedDatabaseV3 } from "./seed_v3";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(\`\${formattedTime} [\${source}] \${message}\`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = \`\${req.method} \${path} \${res.statusCode} in \${duration}ms\`;
      if (capturedJsonResponse) {
        logLine += \` :: \${JSON.stringify(capturedJsonResponse)}\`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  seedDatabase();
  seedDatabaseV2();
  seedDatabaseV3();
  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error("Internal Server Error:", err);

    if (res.headersSent) {
      return next(err);
    }

    return res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(\`serving on port \${port}\`);
    },
  );
})();
`,
  "routes.ts": `import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { rawDb } from "./db";
import https from "https";
import http from "http";

// ── Perplexity search helper (used for live regulatory data) ────────────────
function perplexitySearch(query: string): Promise<{ title: string; url: string; snippet: string; date?: string }[]> {
  return new Promise((resolve) => {
    const apiKey = process.env.PERPLEXITY_API_KEY || "";
    if (!apiKey) { resolve([]); return; }
    const body = JSON.stringify({
      model: "sonar",
      messages: [{ role: "user", content: \`Search for recent news and updates: \${query}. Return the 5 most recent and relevant results with title, url, date, and a 2-3 sentence summary.\` }],
      search_recency_filter: "month",
      return_citations: true,
    });
    const req = https.request({
      hostname: "api.perplexity.ai",
      path: "/chat/completions",
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: \`Bearer \${apiKey}\`, "Content-Length": Buffer.byteLength(body) },
    }, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          const citations: { url: string; title?: string }[] = parsed.citations || [];
          const content: string = parsed.choices?.[0]?.message?.content || "";
          // Return citations with content as snippet
          const results = citations.slice(0, 6).map((c, i) => ({
            title: c.title || \`Source \${i + 1}\`,
            url: c.url,
            snippet: content.length > 200 ? content.slice(0, 600) : content,
          }));
          resolve(results.length > 0 ? results : [{ title: "AI Summary", url: "", snippet: content }]);
        } catch { resolve([]); }
      });
    });
    req.on("error", () => resolve([]));
    req.write(body);
    req.end();
  });
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  // All projects with aggregate data
  app.get("/api/projects", (_req, res) => {
    const allProjects = storage.getAllProjects();
    const allBtm = storage.getAllBtmSources();
    const allLinks = storage.getAllProjectCompanies();
    const allCompanies = storage.getAllCompanies();

    const companyMap: Record<number, typeof allCompanies[0]> = {};
    for (const c of allCompanies) companyMap[c.id] = c;

    const result = allProjects.map((p) => {
      const btmSources = allBtm.filter((b) => b.projectId === p.id);
      const links = allLinks.filter((l) => l.projectId === p.id);
      const linkedCompanies = links.map((l) => ({
        ...companyMap[l.companyId],
        role: l.role,
      })).filter(Boolean);
      const operator = p.operatorId ? companyMap[p.operatorId] : null;

      return {
        ...p,
        operator,
        btmSources: btmSources.map((b) => ({
          ...b,
          vendor: b.vendorId ? companyMap[b.vendorId] : null,
          developer: b.developerId ? companyMap[b.developerId] : null,
          fuelSource: b.fuelSourceId ? companyMap[b.fuelSourceId] : null,
        })),
        linkedCompanies,
      };
    });

    res.json(result);
  });

  // Single project
  app.get("/api/projects/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const project = storage.getProjectById(id);
    if (!project) return res.status(404).json({ error: "Not found" });

    const allCompanies = storage.getAllCompanies();
    const companyMap: Record<number, typeof allCompanies[0]> = {};
    for (const c of allCompanies) companyMap[c.id] = c;

    const btmSources = storage.getBtmSourcesByProject(id).map((b) => ({
      ...b,
      vendor: b.vendorId ? companyMap[b.vendorId] : null,
      developer: b.developerId ? companyMap[b.developerId] : null,
      fuelSource: b.fuelSourceId ? companyMap[b.fuelSourceId] : null,
    }));

    const links = storage.getProjectCompaniesByProject(id);
    const linkedCompanies = links.map((l) => ({
      ...companyMap[l.companyId],
      role: l.role,
    })).filter(Boolean);

    res.json({
      ...project,
      operator: project.operatorId ? companyMap[project.operatorId] : null,
      btmSources,
      linkedCompanies,
    });
  });

  // All companies
  app.get("/api/companies", (_req, res) => {
    res.json(storage.getAllCompanies());
  });

  // Company detail with projects
  app.get("/api/companies/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const company = storage.getCompanyById(id);
    if (!company) return res.status(404).json({ error: "Not found" });

    const allLinks = storage.getAllProjectCompanies();
    const allProjects = storage.getAllProjects();
    const projectIds = allLinks.filter((l) => l.companyId === id).map((l) => l.projectId);
    const operatedProjects = allProjects.filter((p) => p.operatorId === id);
    const linkedProjects = allProjects.filter((p) => projectIds.includes(p.id) && p.operatorId !== id);

    res.json({ ...company, operatedProjects, linkedProjects });
  });

  // Aggregate stats for dashboard
  app.get("/api/stats", (_req, res) => {
    const allProjects = storage.getAllProjects();
    const allBtm = storage.getAllBtmSources();

    const totalCapacityMw = allProjects.reduce((s, p) => s + (p.capacityMw ?? 0), 0);
    const totalBtmMw = allProjects.reduce((s, p) => s + (p.btmCapacityMw ?? 0), 0);
    const totalInvestmentB = allProjects.reduce((s, p) => s + (p.totalInvestmentB ?? 0), 0);
    const btmProjects = allProjects.filter((p) => p.hasBtm);
    const offGridProjects = allProjects.filter((p) => p.fullyOffGrid);

    // Tech type breakdown
    const techBreakdown: Record<string, number> = {};
    for (const b of allBtm) {
      techBreakdown[b.technologyType] = (techBreakdown[b.technologyType] ?? 0) + (b.capacityMw ?? 0);
    }

    // Origin country breakdown
    const originBreakdown: Record<string, number> = {};
    for (const b of allBtm) {
      if (b.originCountry) {
        originBreakdown[b.originCountry] = (originBreakdown[b.originCountry] ?? 0) + (b.capacityMw ?? 0);
      }
    }

    // Status breakdown
    const statusBreakdown: Record<string, number> = {};
    for (const p of allProjects) {
      statusBreakdown[p.status] = (statusBreakdown[p.status] ?? 0) + 1;
    }

    res.json({
      totalProjects: allProjects.length,
      totalCapacityMw,
      totalBtmMw,
      totalInvestmentB,
      btmProjectCount: btmProjects.length,
      offGridProjectCount: offGridProjects.length,
      techBreakdown,
      originBreakdown,
      statusBreakdown,
    });
  });

  // All competitors
  app.get("/api/competitors", (_req, res) => {
    const allCompetitors = storage.getAllCompetitors();
    const allNews = storage.getAllCompetitorNews();
    const result = allCompetitors.map((c) => ({
      ...c,
      newsCount: allNews.filter((n) => n.competitorId === c.id).length,
      latestNews: allNews
        .filter((n) => n.competitorId === c.id)
        .sort((a, b) => (b.publishedDate ?? "").localeCompare(a.publishedDate ?? ""))
        .slice(0, 1),
    }));
    res.json(result);
  });

  // Single competitor with full news
  app.get("/api/competitors/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const competitor = storage.getCompetitorById(id);
    if (!competitor) return res.status(404).json({ error: "Not found" });
    const news = storage.getNewsByCompetitor(id).sort(
      (a, b) => (b.publishedDate ?? "").localeCompare(a.publishedDate ?? "")
    );
    res.json({ ...competitor, news });
  });

  // News for a competitor
  app.get("/api/competitors/:id/news", (req, res) => {
    const id = parseInt(req.params.id);
    const news = storage.getNewsByCompetitor(id).sort(
      (a, b) => (b.publishedDate ?? "").localeCompare(a.publishedDate ?? "")
    );
    res.json(news);
  });

  // ── Queue snapshots ────────────────────────────────────────────────
  app.get("/api/queue", (_req, res) => {
    // Get latest snapshot per RTO
    const snapshots = rawDb.prepare(\`
      SELECT s.* FROM rto_queue_snapshots s
      INNER JOIN (
        SELECT rto_id, MAX(snapshot_date) as max_date
        FROM rto_queue_snapshots GROUP BY rto_id
      ) latest ON s.rto_id = latest.rto_id AND s.snapshot_date = latest.max_date
      ORDER BY s.total_queue_mw DESC
    \`).all();
    // Also get all snapshots for trend lines
    const history = rawDb.prepare(\`
      SELECT rto_id, snapshot_date, total_queue_mw, active_queue_mw, gas_mw, solar_mw, wind_mw, storage_mw, nuclear_mw
      FROM rto_queue_snapshots ORDER BY rto_id, snapshot_date
    \`).all();
    res.json({ snapshots, history });
  });

  // Large load queue
  app.get("/api/queue/large-load", (_req, res) => {
    const snapshots = rawDb.prepare(\`
      SELECT s.* FROM rto_large_load_queue s
      INNER JOIN (
        SELECT rto_id, MAX(snapshot_date) as max_date
        FROM rto_large_load_queue GROUP BY rto_id
      ) latest ON s.rto_id = latest.rto_id AND s.snapshot_date = latest.max_date
      ORDER BY COALESCE(s.total_request_mw, 0) DESC
    \`).all();
    const history = rawDb.prepare(\`
      SELECT rto_id, snapshot_date, total_request_mw, data_center_mw, actually_connected_mw, data_center_pct
      FROM rto_large_load_queue ORDER BY rto_id, snapshot_date
    \`).all();
    res.json({ snapshots, history });
  });

  // ── Global Search ──────────────────────────────────────────────────────
  app.get("/api/search", (req, res) => {
    const q = ((req.query.q as string) || "").toLowerCase().trim();
    if (!q || q.length < 2) return res.json({ projects: [], companies: [], competitors: [], news: [] });

    const allProjects = storage.getAllProjects();
    const allCompanies = storage.getAllCompanies();
    const allCompetitors = storage.getAllCompetitors();
    const allNews = storage.getAllCompetitorNews();

    const projects = allProjects
      .filter((p) =>
        p.name.toLowerCase().includes(q) ||
        (p.location ?? "").toLowerCase().includes(q) ||
        (p.state ?? "").toLowerCase().includes(q) ||
        (p.notes ?? "").toLowerCase().includes(q)
      )
      .slice(0, 8)
      .map((p) => ({ id: p.id, name: p.name, location: p.location, state: p.state, status: p.status, capacityMw: p.capacityMw, type: "project" as const }));

    const companies = allCompanies
      .filter((c) =>
        c.name.toLowerCase().includes(q) ||
        (c.ticker ?? "").toLowerCase().includes(q) ||
        (c.hq ?? "").toLowerCase().includes(q) ||
        (c.description ?? "").toLowerCase().includes(q) ||
        (c.role ?? "").toLowerCase().includes(q)
      )
      .slice(0, 8)
      .map((c) => ({ id: c.id, name: c.name, ticker: c.ticker, hq: c.hq, role: c.role, type: "company" as const }));

    const competitors = allCompetitors
      .filter((c) =>
        c.name.toLowerCase().includes(q) ||
        (c.ticker ?? "").toLowerCase().includes(q) ||
        (c.hq ?? "").toLowerCase().includes(q) ||
        (c.description ?? "").toLowerCase().includes(q) ||
        (c.technology ?? "").toLowerCase().includes(q)
      )
      .slice(0, 5)
      .map((c) => ({ id: c.id, name: c.name, ticker: c.ticker, hq: c.hq, type: "competitor" as const }));

    const news = allNews
      .filter((n) =>
        n.headline.toLowerCase().includes(q) ||
        (n.summary ?? "").toLowerCase().includes(q)
      )
      .slice(0, 6)
      .map((n) => {
        const comp = allCompetitors.find((c) => c.id === n.competitorId);
        return { id: n.id, headline: n.headline, competitorId: n.competitorId, competitorName: comp?.name ?? "", publishedDate: n.publishedDate, category: n.category, type: "news" as const };
      });

    res.json({ projects, companies, competitors, news });
  });

  // ── Live Regulatory / RTO Status ───────────────────────────────────────────
  app.get("/api/regulatory", async (_req, res) => {
    // Static seed data with known status as of March 2026
    // The live news section is fetched client-side or can be refreshed
    const rtos = [
      {
        id: "ferc",
        name: "FERC",
        fullName: "Federal Energy Regulatory Commission",
        region: "National",
        status: "active",
        statusLabel: "Active Rulemaking",
        summary: "FERC is managing two parallel tracks: (1) the PJM-specific Dec 18, 2025 co-location order requiring tariff reform, and (2) DOE's Oct 2025 ANOPR directing FERC to establish national large-load interconnection standards by April 30, 2026. The PJM order established a 50 MW BTM netting threshold, three new co-location transmission services, and a 3-year transition period (expires Dec 18, 2028).",
        keyRulings: [
          { date: "2025-12-18", text: "Order 193 FERC ¶ 61,217 — PJM tariff unjust/unreasonable; directed to create co-location framework, 50 MW BTM threshold, 3 new TX services", url: "https://www.ferc.gov/news-events/news/ferc-directs-nations-largest-grid-operator-create-new-rules-embrace-innovation-and" },
          { date: "2025-10-23", text: "DOE ANOPR (RM26-4) — directs FERC to standardize large load (>20 MW) interconnection nationwide; final action deadline April 30, 2026", url: "https://www.ferc.gov/rm26-4" },
          { date: "2025-02-20", text: "FERC initiates show-cause proceeding on PJM co-location rules following 8.5 GW queue backlog", url: "https://www.ferc.gov/news-events/news/ferc-orders-action-co-location-issues-related-data-centers-running-ai" },
        ],
        nextMilestone: "April 30, 2026 — FERC final action deadline on national large-load interconnection ANOPR",
        btmOutlook: "Restrictive for large loads (>50 MW). BTM netting being phased out for data centers in PJM; national rules pending. Grandfathering protects pre-Dec 2025 contracts.",
        docketUrl: "https://www.ferc.gov/media/e-1-el25-49-000-0",
      },
      {
        id: "pjm",
        name: "PJM",
        fullName: "PJM Interconnection",
        region: "Mid-Atlantic / Midwest (13 states + DC)",
        status: "compliance",
        statusLabel: "Compliance Filing Under Review",
        summary: "PJM submitted its compliance filing on Feb 23, 2026 (Docket ER26-5181) implementing FERC's Dec 2025 order. Key changes: 50 MW BTM netting cap, emergency generation exemption from threshold, grandfathering for pre-Dec 18, 2025 contracts, three new transmission services (Interim NITS, Firm Contract Demand, Non-Firm Contract Demand). Effective date targeted July 31, 2026. PJM also proposed Expedited Interconnection Track (EIT) on Feb 27, 2026 — up to 10 projects/year, ~10-month timeline if approved.",
        keyRulings: [
          { date: "2026-02-23", text: "PJM compliance filing (ER26-5181) — 50 MW BTM cap, 3 new TX services, grandfathering, emergency gen exemption; target effective July 31, 2026", url: "https://www.datacenterdynamics.com/en/news/pjm-requests-approval-from-ferc-for-new-behind-the-meter-generation-rules-for-data-centers/" },
          { date: "2026-02-27", text: "PJM proposes Expedited Interconnection Track (EIT) — up to 10 projects/year, ~10-month timeline; FERC order requested by May 28, 2026", url: "https://www.whitecase.com/insight-alert/pjm-proposes-carve-out-new-services-co-located-data-centers" },
          { date: "2025-12-18", text: "FERC order finds PJM tariff unjust/unreasonable; 8.5 GW co-located load in queue; directs tariff overhaul", url: "https://www.ferc.gov/news-events/news/fact-sheet-ferc-directs-nations-largest-grid-operator-create-new-rules-embrace" },
        ],
        nextMilestone: "July 31, 2026 — targeted effective date for new BTM/co-location tariff; May 28, 2026 — FERC order requested on EIT",
        btmOutlook: "Transitional. New >50 MW BTM netting prohibited for data centers post-July 2026. Co-location permitted via 3 new TX service options. 8-year interconnection queue remains the key constraint. Expedited track could help new baseload gas projects.",
        docketUrl: "https://www.utilitydive.com/news/pjm-ferc-behind-the-meter-data-center-colocation/812939/",
      },
      {
        id: "miso",
        name: "MISO",
        fullName: "Midcontinent Independent System Operator",
        region: "Midwest / South (15 states + MB Canada)",
        status: "developing",
        statusLabel: "Framework Under Development",
        summary: "MISO is developing a 'zero-injection' agreement framework allowing dedicated generation for large loads to be barred from grid injection — effectively a structured BTM pathway. As of Jan 2026, stakeholders have raised questions about the proposal's mechanics. MISO has not yet issued a formal tariff filing. MISO's queue has undergone Order 2023 cluster-based reform. Indiana's NIPSCO GenCo model (Amazon, 2.4 GW) is a key MISO test case operating under a special utility structure.",
        keyRulings: [
          { date: "2026-01-22", text: "MISO presents 'zero-injection agreement' concept for large load dedicated generation; stakeholder questions remain on mechanics", url: "https://www.rtoinsider.com/123961-questions-abound-miso-idea-zero-injection-agreements/" },
          { date: "2025-09-10", text: "Indiana IURC approves NIPSCO GenCo model — first utility to create dedicated subsidiary for data center load isolation", url: "https://www.nisource.com/news/article/nisource-achieves-iurc-regulatory-approval-for-genco-strategy" },
        ],
        nextMilestone: "Zero-injection tariff filing — timing TBD; watching FERC ANOPR national rulemaking for guidance",
        btmOutlook: "Developing. No formal co-location tariff yet. Zero-injection concept favorable for BTM gas projects — would allow full BTM without netting restrictions. GenCo utility model is a working alternative. More permissive outlook than PJM for new BTM deployments.",
        docketUrl: "https://www.rtoinsider.com/123961-questions-abound-miso-idea-zero-injection-agreements/",
      },
      {
        id: "ercot",
        name: "ERCOT",
        fullName: "Electric Reliability Council of Texas",
        region: "Texas (85% of state)",
        status: "favorable",
        statusLabel: "Most Permissive — BTM Flourishing",
        summary: "ERCOT operates outside FERC jurisdiction, giving Texas the most permissive BTM environment in the U.S. No federal co-location rules apply. DOE issued a Section 202(c) order in Jan 2026 directing ERCOT to activate backup generation at data centers during grid emergencies — highlighting the scale of behind-the-meter assets already deployed. Williams Power, Atlas/Galt Power, Conduit Power, and Solaris are all actively deploying BTM in ERCOT. The majority of new BTM gas generation projects in the tracker are in Texas.",
        keyRulings: [
          { date: "2026-01-25", text: "DOE Section 202(c) order: ERCOT authorized to direct data center backup generation during grid emergencies (EEA-3 or near-EEA-3)", url: "https://www.ercot.com/services/comm/mkt_notices/M-A012526-01" },
          { date: "2025-01-01", text: "No FERC jurisdiction over ERCOT — BTM rules governed by PUCT and ERCOT protocols; co-location not subject to FERC orders", url: "https://www.ercot.com" },
        ],
        nextMilestone: "PUCT may issue large load integration guidance; DOE 202(c) order to be monitored for extension",
        btmOutlook: "Highly favorable. Fully permissive BTM environment. No federal netting restrictions. Fastest path to BTM gas deployment. Risk: PUCT could impose state-level co-location rules; grid strain during extreme weather events.",
        docketUrl: "https://www.ercot.com",
      },
      {
        id: "caiso",
        name: "CAISO",
        fullName: "California Independent System Operator",
        region: "California",
        status: "early",
        statusLabel: "Issue Paper Stage",
        summary: "CAISO published a large load consideration issue paper in Jan 2026, projecting 1.8 GW of incremental data center load by 2030 and 4.9 GW by 2040. The paper is in early stakeholder engagement phase with no formal tariff changes yet. California's strict environmental rules (CARB) make natural gas BTM more complex — permitting for new gas turbines is challenging. Nuclear and storage-coupled renewables are the preferred BTM technologies. CAISO is also expanding its Extended Day-Ahead Market (EDAM) with western neighbors.",
        keyRulings: [
          { date: "2026-01-20", text: "CAISO issue paper: Large Load Considerations published — 1.8 GW DC load projected by 2030, 4.9 GW by 2040; early stakeholder process initiated", url: "https://www.caiso.com/documents/issue-paper-large-load-consideration-jan-20-2026.pdf" },
        ],
        nextMilestone: "Stakeholder comment period and draft proposal expected mid-2026",
        btmOutlook: "Restrictive for gas BTM. CARB air quality rules make new gas turbine permits difficult. Storage + solar BTM more viable. Co-location with existing gas plants possible but complex. California is a minor market for BTM gas projects.",
        docketUrl: "https://www.caiso.com/documents/issue-paper-large-load-consideration-jan-20-2026.pdf",
      },
      {
        id: "spp",
        name: "SPP",
        fullName: "Southwest Power Pool",
        region: "Great Plains (14 states)",
        status: "monitoring",
        statusLabel: "Monitoring FERC ANOPR",
        summary: "SPP has not initiated a formal co-location or BTM proceeding as of Q1 2026. The region is watching FERC's national ANOPR (RM26-4) for guidance before acting independently. SPP has undergone Order 2023 queue reform. The region has significant wind generation and growing data center interest — particularly in Oklahoma, Kansas, and Nebraska. BTM gas + wind hybrid projects are emerging. Atlas Energy's Permian Basin assets are near the SPP/ERCOT border.",
        keyRulings: [
          { date: "2025-11-01", text: "SPP implementing FERC Order 2023 queue reforms — cluster-based study process replacing serial queue", url: "https://www.spp.org" },
        ],
        nextMilestone: "Awaiting FERC ANOPR final action (April 30, 2026) before initiating co-location framework",
        btmOutlook: "Neutral to slightly favorable. No BTM restrictions yet. Lower land/energy costs than PJM. Wind-rich region for hybrid projects. Natural gas BTM permissible under current rules — no active restriction proceedings.",
        docketUrl: "https://www.spp.org",
      },
      {
        id: "nyiso",
        name: "NYISO",
        fullName: "New York Independent System Operator",
        region: "New York State",
        status: "monitoring",
        statusLabel: "Monitoring PJM / FERC",
        summary: "NYISO has not filed a co-location proceeding as of Q1 2026. New York's Climate Leadership and Community Protection Act (CLCPA) mandates 70% renewable by 2030, creating significant constraints on new gas BTM projects. Co-location with existing gas plants is theoretically possible but faces state-level environmental review. Data center growth in the NYC metro area is driving grid stress. NYISO is watching FERC's PJM order as a potential template.",
        keyRulings: [
          { date: "2025-06-01", text: "NYISO large load interconnection process updated under Order 2023 reforms — cluster studies replacing serial queue", url: "https://www.nyiso.com" },
        ],
        nextMilestone: "Possible NYISO co-location framework proposal in H2 2026 following FERC national rulemaking",
        btmOutlook: "Restrictive. CLCPA constraints make gas BTM politically and legally difficult. Nuclear co-location (e.g., Constellation's upstate plants) is more viable. High electricity costs drive demand for BTM, but environmental rules limit gas options.",
        docketUrl: "https://www.nyiso.com",
      },
      {
        id: "isone",
        name: "ISO-NE",
        fullName: "ISO New England",
        region: "New England (6 states)",
        status: "monitoring",
        statusLabel: "Monitoring FERC ANOPR",
        summary: "ISO-NE has not initiated a formal co-location proceeding as of Q1 2026. New England faces some of the highest electricity prices in the continental U.S., creating strong BTM economics for data centers. However, regional environmental rules and limited gas pipeline capacity constrain new BTM gas projects. The region has significant nuclear assets (Millstone, Seabrook) that could support co-location. ISO-NE is monitoring the FERC ANOPR and PJM proceedings.",
        keyRulings: [
          { date: "2025-06-01", text: "ISO-NE completes Order 2023 queue reform transition — cluster-based interconnection studies now in effect", url: "https://www.iso-ne.com" },
        ],
        nextMilestone: "Following FERC ANOPR timeline; possible co-location issue paper in H2 2026",
        btmOutlook: "Mixed. High electricity prices make BTM economics compelling. Nuclear co-location viable. New gas BTM difficult due to pipeline constraints and state policies. Small market relative to PJM/MISO/ERCOT.",
        docketUrl: "https://www.iso-ne.com",
      },
    ];
    res.json(rtos);
  });

  // Live FERC/RTO news feed (fetches fresh results per query)
  app.get("/api/regulatory/news", async (req, res) => {
    const rtoId = (req.query.rto as string) || "ferc";
    const queries: Record<string, string> = {
      ferc: "FERC large load co-location data center rulemaking ANOPR 2026",
      pjm: "PJM behind the meter co-location data center tariff compliance 2026",
      miso: "MISO large load data center co-location zero injection agreement 2026",
      ercot: "ERCOT data center behind the meter generation BTM Texas 2026",
      caiso: "CAISO large load data center interconnection California 2026",
      spp: "SPP Southwest Power Pool data center large load interconnection 2026",
      nyiso: "NYISO New York data center large load co-location rules 2026",
      isone: "ISO-NE New England data center large load interconnection 2026",
    };
    const query = queries[rtoId] || queries.ferc;
    const results = await perplexitySearch(query);
    res.json(results);
  });

  return httpServer;
}
`,
  "db.ts": `import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "@shared/schema";
import path from "path";

const dbPath = path.resolve(process.cwd(), "data.db");
const sqlite = new Database(dbPath);

// Enable WAL mode for better performance
sqlite.pragma("journal_mode = WAL");

export const db = drizzle(sqlite, { schema });
export const rawDb = sqlite;
`,
  "storage.ts": `import { db } from "./db";
import { companies, projects, btmSources, projectCompanies, competitors, competitorNews } from "@shared/schema";
import type { InsertCompany, Company, InsertProject, Project, InsertBtmSource, BtmSource, InsertProjectCompany, ProjectCompany, InsertCompetitor, Competitor, InsertCompetitorNews, CompetitorNews } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Companies
  getAllCompanies(): Company[];
  getCompanyById(id: number): Company | undefined;
  upsertCompany(data: InsertCompany): Company;

  // Projects
  getAllProjects(): Project[];
  getProjectById(id: number): Project | undefined;
  upsertProject(data: InsertProject): Project;

  // BTM Sources
  getBtmSourcesByProject(projectId: number): BtmSource[];
  getAllBtmSources(): BtmSource[];

  // Project Companies
  getProjectCompaniesByProject(projectId: number): ProjectCompany[];
  getAllProjectCompanies(): ProjectCompany[];

  // Competitors
  getAllCompetitors(): Competitor[];
  getCompetitorById(id: number): Competitor | undefined;

  // Competitor News
  getNewsByCompetitor(competitorId: number): CompetitorNews[];
  getAllCompetitorNews(): CompetitorNews[];
}

class SqliteStorage implements IStorage {
  getAllCompanies(): Company[] {
    return db.select().from(companies).all();
  }

  getCompanyById(id: number): Company | undefined {
    return db.select().from(companies).where(eq(companies.id, id)).get();
  }

  upsertCompany(data: InsertCompany): Company {
    return db.insert(companies).values(data).returning().get();
  }

  getAllProjects(): Project[] {
    return db.select().from(projects).all();
  }

  getProjectById(id: number): Project | undefined {
    return db.select().from(projects).where(eq(projects.id, id)).get();
  }

  upsertProject(data: InsertProject): Project {
    return db.insert(projects).values(data).returning().get();
  }

  getBtmSourcesByProject(projectId: number): BtmSource[] {
    return db.select().from(btmSources).where(eq(btmSources.projectId, projectId)).all();
  }

  getAllBtmSources(): BtmSource[] {
    return db.select().from(btmSources).all();
  }

  getProjectCompaniesByProject(projectId: number): ProjectCompany[] {
    return db.select().from(projectCompanies).where(eq(projectCompanies.projectId, projectId)).all();
  }

  getAllProjectCompanies(): ProjectCompany[] {
    return db.select().from(projectCompanies).all();
  }

  getAllCompetitors(): Competitor[] {
    return db.select().from(competitors).all();
  }

  getCompetitorById(id: number): Competitor | undefined {
    return db.select().from(competitors).where(eq(competitors.id, id)).get();
  }

  getNewsByCompetitor(competitorId: number): CompetitorNews[] {
    return db.select().from(competitorNews).where(eq(competitorNews.competitorId, competitorId)).all();
  }

  getAllCompetitorNews(): CompetitorNews[] {
    return db.select().from(competitorNews).all();
  }
}

export const storage = new SqliteStorage();
`,
  "static.ts": `import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      \`Could not find the build directory: \${distPath}, make sure to build the client first\`,
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("/{*path}", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
`,
  "seed.ts": `import { db } from "./db";
import { companies, projects, btmSources, projectCompanies } from "@shared/schema";

export function seedDatabase() {
  const existingCompanies = db.select().from(companies).all();
  if (existingCompanies.length > 0) return; // already seeded

  // ── COMPANIES ──────────────────────────────────────────────────────────────
  const companyData = [
    // Hyperscalers / customers
    { name: "Oracle", ticker: "ORCL", role: "hyperscaler", hq: "Austin, TX", country: "USA", website: "oracle.com", description: "Cloud & AI infrastructure. Largest Stargate investor. Committing $40B+ to US AI campuses.", logoInitials: "OR" },
    { name: "Microsoft", ticker: "MSFT", role: "hyperscaler", hq: "Redmond, WA", country: "USA", website: "microsoft.com", description: "Azure AI hyperscaler. $80B 2025 capex plan. Restarted Three Mile Island via Constellation.", logoInitials: "MS" },
    { name: "Meta", ticker: "META", role: "hyperscaler", hq: "Menlo Park, CA", country: "USA", website: "meta.com", description: "AI infrastructure investor. 6.6 GW nuclear commitments. Building 400 MW dedicated gas gen.", logoInitials: "ME" },
    { name: "Amazon Web Services", ticker: "AMZN", role: "hyperscaler", hq: "Seattle, WA", country: "USA", website: "aws.amazon.com", description: "Susquehanna nuclear campus. X-energy SMR investment. $20B+ nuclear conversion.", logoInitials: "AW" },
    { name: "Google", ticker: "GOOGL", role: "hyperscaler", hq: "Mountain View, CA", country: "USA", website: "google.com", description: "500 MW Kairos Power SMR deal. First US corporate SMR fleet agreement.", logoInitials: "GO" },
    { name: "OpenAI", role: "hyperscaler", hq: "San Francisco, CA", country: "USA", website: "openai.com", description: "Stargate project initiator. 10 GW committed AI campus capacity across US.", logoInitials: "OA" },
    // DC Operators / Developers
    { name: "Aligned Data Centers", role: "dc_operator", hq: "Irving, TX", country: "USA", website: "aligneddc.com", description: "$40B Macquarie-backed hyperscale operator. 5 GW+ planned. Americas footprint.", logoInitials: "AL" },
    { name: "Vantage Data Centers", role: "dc_operator", hq: "Santa Clara, CA", country: "USA", website: "vantagedc.com", description: "Hyperscale colo operator. 1 GW+ VoltaGrid BTM gas agreement.", logoInitials: "VD" },
    { name: "Equinix", ticker: "EQIX", role: "dc_operator", hq: "Redwood City, CA", country: "USA", website: "equinix.com", description: "Global colocation REIT. 100+ MW Bloom Energy SOFC across 19 IBX data centers.", logoInitials: "EQ" },
    { name: "CoreWeave", role: "dc_operator", hq: "Roseland, NJ", country: "USA", website: "coreweave.com", description: "AI cloud infrastructure. 14 MW Bloom Energy SOFC for rapid AI deployment.", logoInitials: "CW" },
    { name: "CoreSite", role: "dc_operator", hq: "Denver, CO", country: "USA", website: "coresite.com", description: "Hybrid utility + SOFC systems. Blend grid and fuel cell primary power.", logoInitials: "CS" },
    { name: "Joule Capital Partners", role: "dc_operator", hq: "Millard County, UT", country: "USA", website: "jouledevelopment.com", description: "Utah AI campus. 1.7 GW Caterpillar recip engines. Fully islanded from RMP grid.", logoInitials: "JC" },
    { name: "Fermi America", role: "dc_operator", hq: "USA", country: "USA", website: "fermiamerica.com", description: "Project Matador: up to 11 GW BTM, 15M sq ft AI hyperscale by 2038.", logoInitials: "FA" },
    { name: "Prometheus Hyperscale", role: "dc_operator", hq: "USA", country: "USA", website: "prometheushyperscale.com", description: "Wyoming 1.2 GW campus with Engie. Oklo SMR future integration planned.", logoInitials: "PH" },
    // BTM Developers / Power Providers
    { name: "VoltaGrid", role: "btm_developer", hq: "Dallas, TX", country: "USA", website: "voltagrid.com", description: "Modular reciprocating engine BTM platform. 2.3 GW Oracle deal. 1+ GW Vantage. Qpac platform using INNIO Jenbacher + ABB.", logoInitials: "VG" },
    { name: "Brookfield Asset Management", ticker: "BAM", role: "investor", hq: "Toronto, ON", country: "Canada", website: "brookfield.com", description: "$5B Bloom Energy fuel cell deployment for AI data centers. Global AI infrastructure head.", logoInitials: "BK" },
    { name: "Conduit Power", role: "btm_developer", hq: "USA", country: "USA", website: "conduitpower.com", description: "300 MW BTM gas + battery storage at Prometheus/Engie Texas sites.", logoInitials: "CP" },
    { name: "International Electric Power", role: "btm_developer", hq: "USA", country: "USA", website: "iep.com", description: "944 MW gas plant in Pennsylvania. Data center power with BESS, avoids PJM interconnect.", logoInitials: "IE" },
    { name: "FO Permian Partners / Hivolt Energy", role: "btm_developer", hq: "Permian Basin, TX", country: "USA", website: "hivolt.com", description: "5 GW off-grid gas power solution for Texas data centers in the Permian Basin.", logoInitials: "HV" },
    // Technology Vendors
    { name: "GE Vernova", ticker: "GEV", role: "tech_vendor", hq: "Cambridge, MA", country: "USA", website: "gevernova.com", description: "Aeroderivative gas turbines (LM2500, LM6000) for BTM. 29 stackable units (~1 GW) for Project Stargate.", logoInitials: "GV" },
    { name: "INNIO Jenbacher", role: "tech_vendor", hq: "Jenbach", country: "Austria", website: "jenbacher.com", description: "Reciprocating gas engines for data centers. J620, J624 models. 2.3 GW ordered for Oracle. Manufactured in Austria.", logoInitials: "IJ" },
    { name: "Caterpillar", ticker: "CAT", role: "tech_vendor", hq: "Irving, TX", country: "USA", website: "cat.com", description: "G3520K generator sets (2.5 MW each). 1.7 GW firm order for Joule Utah campus. 4 GW potential total.", logoInitials: "CA" },
    { name: "Siemens Energy", ticker: "ENR", role: "tech_vendor", hq: "Munich", country: "Germany", website: "siemens-energy.com", description: "Gas turbines for Stargate Doña Ana NM campus. Grid-independent microgrid turbines.", logoInitials: "SE" },
    { name: "Bloom Energy", ticker: "BE", role: "tech_vendor", hq: "San Jose, CA", country: "USA", website: "bloomenergy.com", description: "SureSource SOFC fuel cells. 60-65% efficiency. $5B Brookfield deal. AEP 1 GW agreement. Equinix 100+ MW, CoreWeave 14 MW.", logoInitials: "BL" },
    { name: "Fuel Cell Energy", ticker: "FCEL", role: "tech_vendor", hq: "Danbury, CT", country: "USA", website: "fuelcellenergy.com", description: "Carbonate & SOFC platforms. 450 MW SDCL partnership. Off-grid data center power, CHP, carbon capture.", logoInitials: "FC" },
    { name: "ABB", ticker: "ABB", role: "tech_vendor", hq: "Zurich", country: "Switzerland", website: "abb.com", description: "Power electronics, switchgear, and control systems. Key VoltaGrid Qpac platform supplier.", logoInitials: "AB" },
    { name: "Kairos Power", role: "tech_vendor", hq: "Alameda, CA", country: "USA", website: "kairospower.com", description: "Molten salt SMR technology. 500 MW Google deal across 6-7 reactors by 2035. Hermes 2 reactor.", logoInitials: "KP" },
    { name: "X-energy", role: "tech_vendor", hq: "Rockville, MD", country: "USA", website: "x-energy.com", description: "Xe-100 high-temperature gas SMR (80 MW each). Amazon Cascade facility (up to 12 units). TRISO fuel.", logoInitials: "XE" },
    { name: "Oklo", ticker: "OKLO", role: "tech_vendor", hq: "Santa Clara, CA", country: "USA", website: "oklo.com", description: "Aurora microreactor SMR. Prometheus Hyperscale future BTM integration in Wyoming.", logoInitials: "OK" },
    { name: "Caterpillar / Ballard Power Systems", role: "tech_vendor", hq: "Vancouver, BC", country: "Canada", website: "ballard.com", description: "PEM hydrogen fuel cell backup power. Microsoft 1.5 MW demonstration project.", logoInitials: "BP" },
    // Fuel suppliers
    { name: "Energy Transfer", ticker: "ET", role: "fuel_supplier", hq: "Dallas, TX", country: "USA", website: "energytransfer.com", description: "Midstream gas pipeline operator. Supplying Oracle's 2.3 GW VoltaGrid BTM infrastructure.", logoInitials: "ET" },
    { name: "Constellation Energy", ticker: "CEG", role: "fuel_supplier", hq: "Baltimore, MD", country: "USA", website: "constellationenergy.com", description: "Nuclear power supplier. Three Mile Island restart (Crane CEC) for Microsoft $16B 20-year PPA.", logoInitials: "CE" },
    { name: "American Electric Power", ticker: "AEP", role: "fuel_supplier", hq: "Columbus, OH", country: "USA", website: "aep.com", description: "Procuring up to 1 GW of Bloom Energy SOFCs for behind-the-meter data center customers.", logoInitials: "AE" },
    { name: "Engie", role: "fuel_supplier", hq: "La Défense", country: "France", website: "engie.com", description: "Energy utility. Partner with Prometheus Hyperscale on Wyoming 1.2 GW campus.", logoInitials: "EN" },
  ];

  const insertedCompanies: { [key: string]: number } = {};
  for (const c of companyData) {
    const result = db.insert(companies).values(c as any).returning().get();
    insertedCompanies[c.name] = result.id;
  }

  // ── PROJECTS ──────────────────────────────────────────────────────────────
  const projectData = [
    {
      name: "Project Stargate – Texas (Shackleford County)",
      operatorId: insertedCompanies["Oracle"],
      location: "Shackleford County, TX",
      state: "TX",
      capacityMw: 800,
      status: "under_construction",
      announcedDate: "2025-01-01",
      totalInvestmentB: 40,
      hasBtm: 1,
      btmCapacityMw: 2300,
      gridTied: 0,
      fullyOffGrid: 1,
      notes: "Powered by onsite BTM gas-powered microgrid. VoltaGrid Qpac (INNIO Jenbacher recip engines) + GE Vernova aeroderivative turbines. Gas supply via Energy Transfer.",
      sourceUrl: "https://voltagrid.com/voltagrid-collaborates-with-oracle-to-power-next-gen-ai-data-centers",
    },
    {
      name: "Project Stargate – New Mexico (Doña Ana County)",
      operatorId: insertedCompanies["Oracle"],
      location: "Doña Ana County, NM",
      state: "NM",
      capacityMw: 400,
      status: "under_construction",
      announcedDate: "2025-03-01",
      totalInvestmentB: 5,
      hasBtm: 1,
      btmCapacityMw: 600,
      gridTied: 0,
      fullyOffGrid: 1,
      notes: "Onsite BTM microgrid using Siemens and GE gas turbines. Fully independent from local grid.",
      sourceUrl: "https://www.latitudemedia.com/news/behind-the-meter-generation-is-picking-up-traction/",
    },
    {
      name: "Joule BetterGrid Campus – Utah",
      operatorId: insertedCompanies["Joule Capital Partners"],
      location: "Millard County, UT",
      state: "UT",
      capacityMw: 2000,
      status: "under_construction",
      announcedDate: "2025-10-01",
      totalInvestmentB: 3,
      hasBtm: 1,
      btmCapacityMw: 1700,
      gridTied: 0,
      fullyOffGrid: 1,
      notes: "1.7 GW Caterpillar G3520K generator sets on firm order. N+2 BTM design. 4,000 acres, 10,000 acre-ft water rights, direct gas interconnect. Fully islanded from Rocky Mountain Power.",
      sourceUrl: "https://thedatacenterengineer.com/news/joule-announces-bettergrid-platform-for-high-density-ai-data-centers-in-utah/",
    },
    {
      name: "Vantage Data Centers – BTM Gas Portfolio",
      operatorId: insertedCompanies["Vantage Data Centers"],
      location: "Multiple, USA",
      state: "USA",
      capacityMw: 500,
      status: "under_construction",
      announcedDate: "2025-04-01",
      totalInvestmentB: 1.5,
      hasBtm: 1,
      btmCapacityMw: 1000,
      gridTied: 1,
      fullyOffGrid: 0,
      notes: "VoltaGrid deploying 1+ GW of gas power solutions. Hybrid BTM + grid.",
      sourceUrl: "https://www.latitudemedia.com/news/behind-the-meter-generation-is-picking-up-traction/",
    },
    {
      name: "Equinix IBX Fuel Cell Program",
      operatorId: insertedCompanies["Equinix"],
      location: "Multiple, USA",
      state: "USA",
      capacityMw: 300,
      status: "operational",
      announcedDate: "2024-06-01",
      totalInvestmentB: 0.5,
      hasBtm: 1,
      btmCapacityMw: 100,
      gridTied: 1,
      fullyOffGrid: 0,
      notes: "Bloom Energy SureSource SOFCs as primary power across 19 IBX colocation data centers.",
      sourceUrl: "https://enkiai.com/data-center/top-10-2025-fuel-cell-projects-for-ai-data-centers",
    },
    {
      name: "Brookfield–Bloom Energy AI Data Center Program",
      operatorId: insertedCompanies["Brookfield Asset Management"],
      location: "Multiple, USA",
      state: "USA",
      capacityMw: 2000,
      status: "announced",
      announcedDate: "2025-10-13",
      totalInvestmentB: 5,
      hasBtm: 1,
      btmCapacityMw: 2000,
      gridTied: 0,
      fullyOffGrid: 1,
      notes: "$5B framework to deploy Bloom Energy SOFCs at AI data centers. Avoids grid connection delays. 'BTM power is essential to closing the grid gap for AI factories' - Brookfield AI Infrastructure Head.",
      sourceUrl: "https://www.spglobal.com/market-intelligence/en/news-insights/articles/2025/10/data-center-developers-turn-to-distributed-behind-the-meter-power-94174247",
    },
    {
      name: "Fermi America – Project Matador",
      operatorId: insertedCompanies["Fermi America"],
      location: "USA (undisclosed)",
      state: "USA",
      capacityMw: 15000,
      status: "announced",
      announcedDate: "2025-09-01",
      totalInvestmentB: 50,
      hasBtm: 1,
      btmCapacityMw: 11000,
      gridTied: 0,
      fullyOffGrid: 1,
      notes: "Up to 11 GW BTM energy, 15M sq ft AI hyperscale compute by 2038. Public filing describes multi-phased BTM-first architecture.",
      sourceUrl: "https://www.latitudemedia.com/news/behind-the-meter-generation-is-picking-up-traction/",
    },
    {
      name: "Prometheus Hyperscale – Wyoming Campus",
      operatorId: insertedCompanies["Prometheus Hyperscale"],
      location: "Evanston, WY",
      state: "WY",
      capacityMw: 1200,
      status: "announced",
      announcedDate: "2025-07-01",
      totalInvestmentB: 4,
      hasBtm: 1,
      btmCapacityMw: 1500,
      gridTied: 1,
      fullyOffGrid: 0,
      notes: "Gas-fired BTM generation with Engie. 300 MW via Conduit Power at Texas sites. Oklo SMR integration planned for future phases.",
      sourceUrl: "https://www.latitudemedia.com/news/behind-the-meter-generation-is-picking-up-traction/",
    },
    {
      name: "Microsoft – Crane Clean Energy Center (TMI Restart)",
      operatorId: insertedCompanies["Microsoft"],
      location: "Dauphin County, PA",
      state: "PA",
      capacityMw: 835,
      status: "under_construction",
      announcedDate: "2023-09-20",
      totalInvestmentB: 16,
      hasBtm: 0,
      btmCapacityMw: null,
      gridTied: 1,
      fullyOffGrid: 0,
      notes: "20-year PPA with Constellation Energy to restart Three Mile Island Unit 1 (renamed Crane CEC). 835 MW nuclear. Target 2028. Grid-tied nuclear supply for Azure data centers.",
      sourceUrl: "https://introl.com/blog/nuclear-power-ai-data-centers-microsoft-google-amazon-2025",
    },
    {
      name: "Google – Kairos Power SMR Program",
      operatorId: insertedCompanies["Google"],
      location: "Multiple, USA (TN & AL)",
      state: "TN",
      capacityMw: 500,
      status: "announced",
      announcedDate: "2024-10-14",
      totalInvestmentB: 4,
      hasBtm: 0,
      btmCapacityMw: null,
      gridTied: 1,
      fullyOffGrid: 0,
      notes: "First US corporate SMR fleet agreement. 500 MW across 6-7 Kairos Hermes 2 molten salt reactors. First reactor 2030, fleet by 2035. TVA offtake agreement.",
      sourceUrl: "https://introl.com/blog/nuclear-power-ai-data-centers-microsoft-google-amazon-2025",
    },
    {
      name: "Amazon – Cascade Advanced Energy Facility",
      operatorId: insertedCompanies["Amazon Web Services"],
      location: "Richland, WA",
      state: "WA",
      capacityMw: 960,
      status: "announced",
      announcedDate: "2024-10-16",
      totalInvestmentB: 20,
      hasBtm: 0,
      btmCapacityMw: null,
      gridTied: 1,
      fullyOffGrid: 0,
      notes: "Up to 12 X-energy Xe-100 SMRs (80 MW each). Start with 4 units (320 MW), scale to 960 MW. TRISO fuel technology. Early 2030s operational. Powers eastern Oregon AWS cluster.",
      sourceUrl: "https://introl.com/blog/nuclear-power-ai-data-centers-microsoft-google-amazon-2025",
    },
    {
      name: "Meta – 400 MW Dedicated Gas Generation",
      operatorId: insertedCompanies["Meta"],
      location: "USA (undisclosed)",
      state: "USA",
      capacityMw: 400,
      status: "announced",
      announcedDate: "2025-02-01",
      totalInvestmentB: 1.2,
      hasBtm: 1,
      btmCapacityMw: 400,
      gridTied: 0,
      fullyOffGrid: 1,
      notes: "400 MW dedicated natural gas generation that never touches the grid. First large Meta BTM gas commitment.",
      sourceUrl: "https://avanzaenergy.substack.com/p/data-centers-are-killing-the-grid",
    },
    {
      name: "FO Permian – 5 GW Texas Off-Grid Gas",
      operatorId: insertedCompanies["FO Permian Partners / Hivolt Energy"],
      location: "Permian Basin, TX",
      state: "TX",
      capacityMw: 5000,
      status: "announced",
      announcedDate: "2025-08-01",
      totalInvestmentB: 10,
      hasBtm: 1,
      btmCapacityMw: 5000,
      gridTied: 0,
      fullyOffGrid: 1,
      notes: "5 GW fully off-grid gas power solution for Texas data centers in the Permian Basin.",
      sourceUrl: "https://www.latitudemedia.com/news/behind-the-meter-generation-is-picking-up-traction/",
    },
    {
      name: "CoreWeave – Bloom Energy SOFC Deployment",
      operatorId: insertedCompanies["CoreWeave"],
      location: "Multiple, USA",
      state: "USA",
      capacityMw: 50,
      status: "operational",
      announcedDate: "2024-12-01",
      totalInvestmentB: 0.08,
      hasBtm: 1,
      btmCapacityMw: 14,
      gridTied: 1,
      fullyOffGrid: 0,
      notes: "14 MW Bloom Energy SureSource SOFCs. Rapid power deployment for AI cloud infrastructure.",
      sourceUrl: "https://enkiai.com/data-center/top-10-2025-fuel-cell-projects-for-ai-data-centers",
    },
    {
      name: "AEP – 1 GW Bloom SOFC BTM Program",
      operatorId: insertedCompanies["American Electric Power"],
      location: "Multiple, USA",
      state: "USA",
      capacityMw: 1000,
      status: "announced",
      announcedDate: "2025-06-01",
      totalInvestmentB: 2,
      hasBtm: 1,
      btmCapacityMw: 1000,
      gridTied: 1,
      fullyOffGrid: 0,
      notes: "AEP procuring up to 1 GW of Bloom Energy SOFCs for behind-the-meter power for utility data center customers.",
      sourceUrl: "https://enkiai.com/data-center/top-10-2025-fuel-cell-projects-for-ai-data-centers",
    },
    {
      name: "International Electric Power – PA Gas Plant",
      operatorId: insertedCompanies["International Electric Power"],
      location: "Pennsylvania",
      state: "PA",
      capacityMw: 944,
      status: "announced",
      announcedDate: "2025-05-01",
      totalInvestmentB: 1.8,
      hasBtm: 1,
      btmCapacityMw: 944,
      gridTied: 0,
      fullyOffGrid: 0,
      notes: "944 MW gas plant powering data center. Integrates with BESS. Avoids PJM interconnection for initial operation.",
      sourceUrl: "https://www.latitudemedia.com/news/behind-the-meter-generation-is-picking-up-traction/",
    },
  ];

  const insertedProjects: { [key: string]: number } = {};
  for (const p of projectData) {
    const result = db.insert(projects).values(p as any).returning().get();
    insertedProjects[p.name] = result.id;
  }

  // ── BTM SOURCES ────────────────────────────────────────────────────────────
  const btmData = [
    // Stargate Texas – 2 BTM techs
    { projectId: insertedProjects["Project Stargate – Texas (Shackleford County)"], technologyType: "recip_engine", capacityMw: 1500, vendorId: insertedCompanies["INNIO Jenbacher"], developerId: insertedCompanies["VoltaGrid"], fuelType: "natural_gas", fuelSourceId: insertedCompanies["Energy Transfer"], productModel: "Jenbacher J620/J624 (Qpac Platform)", originCountry: "Austria", notes: "Qpac modular platform, up to 20 MW per unit, 200 MW per minor-source air permit. AI-optimized high-transient-response. ABB power electronics." },
    { projectId: insertedProjects["Project Stargate – Texas (Shackleford County)"], technologyType: "gas_turbine", capacityMw: 800, vendorId: insertedCompanies["GE Vernova"], developerId: insertedCompanies["VoltaGrid"], fuelType: "natural_gas", fuelSourceId: insertedCompanies["Energy Transfer"], productModel: "GE LM2500+G4 (aeroderivative, stackable)", originCountry: "USA", notes: "29 stackable aeroderivative turbines delivering ~1 GW. Fast deployment, scalable footprint." },
    // Stargate NM
    { projectId: insertedProjects["Project Stargate – New Mexico (Doña Ana County)"], technologyType: "gas_turbine", capacityMw: 400, vendorId: insertedCompanies["Siemens Energy"], developerId: null, fuelType: "natural_gas", fuelSourceId: null, productModel: "Siemens SGT industrial gas turbine", originCountry: "Germany", notes: "BTM microgrid, fully independent from local grid." },
    { projectId: insertedProjects["Project Stargate – New Mexico (Doña Ana County)"], technologyType: "gas_turbine", capacityMw: 200, vendorId: insertedCompanies["GE Vernova"], developerId: null, fuelType: "natural_gas", fuelSourceId: null, productModel: "GE aeroderivative turbine", originCountry: "USA", notes: "Combined with Siemens turbines for NM campus BTM microgrid." },
    // Joule Utah
    { projectId: insertedProjects["Joule BetterGrid Campus – Utah"], technologyType: "recip_engine", capacityMw: 1700, vendorId: insertedCompanies["Caterpillar"], developerId: insertedCompanies["Joule Capital Partners"], fuelType: "natural_gas", fuelSourceId: null, productModel: "Caterpillar G3520K (2.5 MW/unit)", originCountry: "USA", notes: "1.7 GW firm order. First delivery March 2025. N+2 redundancy. BetterGrid platform includes SCR units and BESS." },
    // Vantage
    { projectId: insertedProjects["Vantage Data Centers – BTM Gas Portfolio"], technologyType: "recip_engine", capacityMw: 1000, vendorId: insertedCompanies["INNIO Jenbacher"], developerId: insertedCompanies["VoltaGrid"], fuelType: "natural_gas", fuelSourceId: null, productModel: "VoltaGrid Qpac (Jenbacher engines)", originCountry: "Austria", notes: "VoltaGrid deploying 1+ GW across Vantage portfolio." },
    // Equinix
    { projectId: insertedProjects["Equinix IBX Fuel Cell Program"], technologyType: "fuel_cell", capacityMw: 100, vendorId: insertedCompanies["Bloom Energy"], developerId: null, fuelType: "natural_gas", fuelSourceId: null, productModel: "Bloom Energy SureSource 4000 (SOFC)", originCountry: "USA", notes: "Primary power across 19 IBX data centers. 60-65% efficiency. 100 MW per acre stacked density." },
    // Brookfield–Bloom
    { projectId: insertedProjects["Brookfield–Bloom Energy AI Data Center Program"], technologyType: "fuel_cell", capacityMw: 2000, vendorId: insertedCompanies["Bloom Energy"], developerId: insertedCompanies["Brookfield Asset Management"], fuelType: "natural_gas", fuelSourceId: null, productModel: "Bloom Energy SureSource (SOFC)", originCountry: "USA", notes: "$5B framework. Grid-independent. 'Closing the grid gap for AI factories'." },
    // CoreWeave
    { projectId: insertedProjects["CoreWeave – Bloom Energy SOFC Deployment"], technologyType: "fuel_cell", capacityMw: 14, vendorId: insertedCompanies["Bloom Energy"], developerId: null, fuelType: "natural_gas", fuelSourceId: null, productModel: "Bloom Energy SureSource (SOFC)", originCountry: "USA", notes: "Rapid deployment for AI cloud infrastructure." },
    // AEP
    { projectId: insertedProjects["AEP – 1 GW Bloom SOFC BTM Program"], technologyType: "fuel_cell", capacityMw: 1000, vendorId: insertedCompanies["Bloom Energy"], developerId: insertedCompanies["American Electric Power"], fuelType: "natural_gas", fuelSourceId: null, productModel: "Bloom Energy SureSource (SOFC)", originCountry: "USA", notes: "Utility-procured BTM fuel cells for data center customers." },
    // Meta gas
    { projectId: insertedProjects["Meta – 400 MW Dedicated Gas Generation"], technologyType: "gas_turbine", capacityMw: 400, vendorId: null, developerId: insertedCompanies["Meta"], fuelType: "natural_gas", fuelSourceId: null, productModel: "Industrial gas turbine (vendor TBD)", originCountry: "USA", notes: "Never touches the grid. Dedicated generation for Meta AI campuses." },
    // Fermi
    { projectId: insertedProjects["Fermi America – Project Matador"], technologyType: "recip_engine", capacityMw: 6000, vendorId: null, developerId: insertedCompanies["Fermi America"], fuelType: "natural_gas", fuelSourceId: null, productModel: "TBD – multiple vendor RFPs", originCountry: "USA", notes: "Multi-phased BTM-first architecture through 2038." },
    { projectId: insertedProjects["Fermi America – Project Matador"], technologyType: "gas_turbine", capacityMw: 5000, vendorId: null, developerId: insertedCompanies["Fermi America"], fuelType: "natural_gas", fuelSourceId: null, productModel: "TBD – multiple vendor RFPs", originCountry: "USA", notes: "Mix of recip engines and turbines expected." },
    // Prometheus
    { projectId: insertedProjects["Prometheus Hyperscale – Wyoming Campus"], technologyType: "gas_turbine", capacityMw: 900, vendorId: null, developerId: insertedCompanies["Conduit Power"], fuelType: "natural_gas", fuelSourceId: null, productModel: "Gas turbines (vendor TBD)", originCountry: "USA", notes: "Onsite gas-fired BTM generation with Engie." },
    { projectId: insertedProjects["Prometheus Hyperscale – Wyoming Campus"], technologyType: "battery", capacityMw: 300, vendorId: null, developerId: insertedCompanies["Conduit Power"], fuelType: "solar", fuelSourceId: null, productModel: "BESS (vendor TBD)", originCountry: "USA", notes: "Battery storage at Texas Engie sites." },
    { projectId: insertedProjects["Prometheus Hyperscale – Wyoming Campus"], technologyType: "nuclear_smr", capacityMw: 300, vendorId: insertedCompanies["Oklo"], developerId: null, fuelType: "nuclear", fuelSourceId: null, productModel: "Oklo Aurora microreactor", originCountry: "USA", notes: "Future BTM integration planned. Not yet contracted." },
    // TMI / Microsoft
    { projectId: insertedProjects["Microsoft – Crane Clean Energy Center (TMI Restart)"], technologyType: "nuclear_existing", capacityMw: 835, vendorId: insertedCompanies["Constellation Energy"], developerId: insertedCompanies["Microsoft"], fuelType: "nuclear", fuelSourceId: insertedCompanies["Constellation Energy"], productModel: "Three Mile Island Unit 1 (PWR)", originCountry: "USA", notes: "Existing pressurized water reactor restart. 20-year PPA. Crane Clean Energy Center." },
    // Google SMR
    { projectId: insertedProjects["Google – Kairos Power SMR Program"], technologyType: "nuclear_smr", capacityMw: 500, vendorId: insertedCompanies["Kairos Power"], developerId: insertedCompanies["Google"], fuelType: "nuclear", fuelSourceId: null, productModel: "Kairos Hermes 2 (molten salt SMR, ~70 MW/unit)", originCountry: "USA", notes: "6-7 reactors. TVA offtake agreement. First-of-kind US corporate SMR fleet." },
    // Amazon SMR
    { projectId: insertedProjects["Amazon – Cascade Advanced Energy Facility"], technologyType: "nuclear_smr", capacityMw: 960, vendorId: insertedCompanies["X-energy"], developerId: insertedCompanies["Amazon Web Services"], fuelType: "nuclear", fuelSourceId: null, productModel: "X-energy Xe-100 (HTGR, 80 MW/unit)", originCountry: "USA", notes: "Up to 12 modules. TRISO fuel, physically cannot melt. Start 4 units → scale to 12." },
    // IEP PA
    { projectId: insertedProjects["International Electric Power – PA Gas Plant"], technologyType: "gas_turbine", capacityMw: 800, vendorId: null, developerId: insertedCompanies["International Electric Power"], fuelType: "natural_gas", fuelSourceId: null, productModel: "Combined cycle gas plant", originCountry: "USA", notes: "944 MW total, combined cycle with BESS. Avoids PJM interconnection." },
    { projectId: insertedProjects["International Electric Power – PA Gas Plant"], technologyType: "battery", capacityMw: 144, vendorId: null, developerId: insertedCompanies["International Electric Power"], fuelType: "solar", fuelSourceId: null, productModel: "Grid-scale BESS", originCountry: "USA", notes: "Battery storage for load management alongside gas plant." },
    // FO Permian
    { projectId: insertedProjects["FO Permian – 5 GW Texas Off-Grid Gas"], technologyType: "gas_turbine", capacityMw: 3000, vendorId: null, developerId: insertedCompanies["FO Permian Partners / Hivolt Energy"], fuelType: "natural_gas", fuelSourceId: null, productModel: "Industrial gas turbines (multiple vendors)", originCountry: "USA", notes: "Permian Basin off-grid. Multiple turbine vendors expected." },
    { projectId: insertedProjects["FO Permian – 5 GW Texas Off-Grid Gas"], technologyType: "recip_engine", capacityMw: 2000, vendorId: null, developerId: insertedCompanies["FO Permian Partners / Hivolt Energy"], fuelType: "natural_gas", fuelSourceId: null, productModel: "Reciprocating engines (multiple vendors)", originCountry: "USA", notes: "Mix of turbines and recip engines for 5 GW total." },
  ];

  for (const b of btmData) {
    db.insert(btmSources).values(b as any).run();
  }

  // ── PROJECT-COMPANY LINKS ──────────────────────────────────────────────────
  const links = [
    { projectId: insertedProjects["Project Stargate – Texas (Shackleford County)"], companyId: insertedCompanies["OpenAI"], role: "customer" },
    { projectId: insertedProjects["Project Stargate – Texas (Shackleford County)"], companyId: insertedCompanies["VoltaGrid"], role: "btm_developer" },
    { projectId: insertedProjects["Project Stargate – Texas (Shackleford County)"], companyId: insertedCompanies["Energy Transfer"], role: "fuel_supplier" },
    { projectId: insertedProjects["Project Stargate – Texas (Shackleford County)"], companyId: insertedCompanies["GE Vernova"], role: "tech_vendor" },
    { projectId: insertedProjects["Project Stargate – Texas (Shackleford County)"], companyId: insertedCompanies["INNIO Jenbacher"], role: "tech_vendor" },
    { projectId: insertedProjects["Project Stargate – Texas (Shackleford County)"], companyId: insertedCompanies["ABB"], role: "tech_vendor" },
    { projectId: insertedProjects["Project Stargate – New Mexico (Doña Ana County)"], companyId: insertedCompanies["OpenAI"], role: "customer" },
    { projectId: insertedProjects["Project Stargate – New Mexico (Doña Ana County)"], companyId: insertedCompanies["GE Vernova"], role: "tech_vendor" },
    { projectId: insertedProjects["Project Stargate – New Mexico (Doña Ana County)"], companyId: insertedCompanies["Siemens Energy"], role: "tech_vendor" },
    { projectId: insertedProjects["Joule BetterGrid Campus – Utah"], companyId: insertedCompanies["Caterpillar"], role: "tech_vendor" },
    { projectId: insertedProjects["Vantage Data Centers – BTM Gas Portfolio"], companyId: insertedCompanies["VoltaGrid"], role: "btm_developer" },
    { projectId: insertedProjects["Vantage Data Centers – BTM Gas Portfolio"], companyId: insertedCompanies["INNIO Jenbacher"], role: "tech_vendor" },
    { projectId: insertedProjects["Equinix IBX Fuel Cell Program"], companyId: insertedCompanies["Bloom Energy"], role: "tech_vendor" },
    { projectId: insertedProjects["Brookfield–Bloom Energy AI Data Center Program"], companyId: insertedCompanies["Bloom Energy"], role: "tech_vendor" },
    { projectId: insertedProjects["AEP – 1 GW Bloom SOFC BTM Program"], companyId: insertedCompanies["Bloom Energy"], role: "tech_vendor" },
    { projectId: insertedProjects["CoreWeave – Bloom Energy SOFC Deployment"], companyId: insertedCompanies["Bloom Energy"], role: "tech_vendor" },
    { projectId: insertedProjects["Microsoft – Crane Clean Energy Center (TMI Restart)"], companyId: insertedCompanies["Constellation Energy"], role: "fuel_supplier" },
    { projectId: insertedProjects["Google – Kairos Power SMR Program"], companyId: insertedCompanies["Kairos Power"], role: "tech_vendor" },
    { projectId: insertedProjects["Amazon – Cascade Advanced Energy Facility"], companyId: insertedCompanies["X-energy"], role: "tech_vendor" },
    { projectId: insertedProjects["Prometheus Hyperscale – Wyoming Campus"], companyId: insertedCompanies["Engie"], role: "partner" },
    { projectId: insertedProjects["Prometheus Hyperscale – Wyoming Campus"], companyId: insertedCompanies["Conduit Power"], role: "btm_developer" },
    { projectId: insertedProjects["Prometheus Hyperscale – Wyoming Campus"], companyId: insertedCompanies["Oklo"], role: "tech_vendor" },
  ];

  for (const l of links) {
    db.insert(projectCompanies).values(l as any).run();
  }

  console.log("✅ Database seeded with DC Intel data");
}
`,
  "seed_v2.ts": `import { db } from "./db";
import { companies, projects, btmSources, projectCompanies } from "@shared/schema";

// Additional projects and companies found in March 2026 research sweep
export function seedDatabaseV2() {
  const existingProjects = db.select().from(projects).all();
  // Check if we already have the new projects (avoid double-seeding)
  const hasV2 = existingProjects.some((p) => p.name === "SoftBank / SB Energy – Piketon AI Campus (Ohio)");
  if (hasV2) return;

  const allCompanies = db.select().from(companies).all();
  const cmap: Record<string, number> = {};
  for (const c of allCompanies) cmap[c.name] = c.id;

  // ── NEW COMPANIES ───────────────────────────────────────────────────────────
  const newCompanyData = [
    // New operators / developers
    { name: "SB Energy (SoftBank)", role: "dc_operator", hq: "Tokyo / USA", country: "Japan", website: "sbenergy.com", description: "SoftBank subsidiary. $10B initial investment in 800 MW AI campus at Piketon, Ohio. 10 GW eventual target. 9.2 GW dedicated gas plant via AEP Ohio partnership.", logoInitials: "SB" },
    { name: "CyrusOne", role: "dc_operator", hq: "Dallas, TX", country: "USA", website: "cyrusone.com", description: "Global hyperscale data center operator. Joint venture with ECP/KKR for 190 MW Bosque County TX campus co-located with Calpine gas generation.", logoInitials: "CY" },
    { name: "DayOne Data Centers", role: "dc_operator", hq: "Singapore", country: "Singapore", website: "dayonedc.com", description: "APAC data center developer. First SOFC-powered data center in Singapore. 20 MW SG1 campus with Bloom Energy SOFC hydrogen pilot.", logoInitials: "D1" },
    { name: "Sharon AI / Texas Critical Data Centers", role: "dc_operator", hq: "Midland, TX", country: "USA", website: "sharonai.com", description: "250 MW net-zero BTM data center in Permian Basin. JV with New Era Helium for dedicated gas supply + CO2 capture. NVIDIA & Lenovo Tier III liquid-cooled facility.", logoInitials: "SA" },
    { name: "New Era Energy & Digital (NUAI)", ticker: "NUAI", role: "dc_operator", hq: "Ector County, TX", country: "USA", website: "newera.ai", description: "450 MW BTM campus in Permian Basin (TCDC). Partnership with Thunderhead Energy and TURBINE-X. 1+ GW eventual capacity. Aligned with Trump Ratepayer Pledge.", logoInitials: "NE" },
    // New BTM/power developers
    { name: "NextEra Energy Resources", ticker: "NEE", role: "btm_developer", hq: "Juno Beach, FL", country: "USA", website: "nexteraenergy.com", description: "Developing 4.3 GW gas hub in SW Pennsylvania and 5.2 GW hub in Anderson County TX for SoftBank-linked AI data centers. Also restarting Duane Arnold nuclear for Google.", logoInitials: "NR" },
    { name: "Energy Capital Partners (ECP)", role: "investor", hq: "Summit, NJ", country: "USA", website: "ecpgp.com", description: "$50B strategic partnership with KKR for integrated digital + power infrastructure. First project: 190 MW Bosque TX campus co-located with Calpine Thad Hill gas plant.", logoInitials: "EC" },
    { name: "KKR", ticker: "KKR", role: "investor", hq: "New York, NY", country: "USA", website: "kkr.com", description: "$50B partnership with ECP for AI infrastructure. Co-investing in CyrusOne Bosque campus co-located with Calpine dedicated gas generation.", logoInitials: "KK" },
    { name: "Calpine", role: "fuel_supplier", hq: "Houston, TX", country: "USA", website: "calpine.com", description: "Largest US gas-fired power generator. Long-term contract to supply dedicated power to CyrusOne/ECP Bosque campus from Thad Hill Energy Center.", logoInitials: "CL" },
    { name: "New Era Helium (NEHC)", ticker: "NEHC", role: "fuel_supplier", hq: "Midland, TX", country: "USA", website: "newerahelium.com", description: "Permian Basin E&P company. Building dedicated gas plant with CO2 capture for Sharon AI's 250 MW net-zero data center. 20-year gas supply agreement.", logoInitials: "NH" },
    { name: "Thunderhead Energy / TURBINE-X", role: "tech_vendor", hq: "Texas", country: "USA", website: "thunderheadsolutions.com", description: "BTM generation equipment procurement partner. Secured commercial partnership with TURBINE-X (OEM channel partner) for New Era Energy 450 MW TCDC campus.", logoInitials: "TE" },
    { name: "Intersect Power", role: "btm_developer", hq: "San Francisco, CA", country: "USA", website: "intersectpower.com", description: "Renewable energy developer. Up to $20B partnership with Google and TPG to develop 'powered land' with co-located renewables. Google acquiring for ~$4.75B.", logoInitials: "IP" },
    { name: "TPG", ticker: "TPG", role: "investor", hq: "Fort Worth, TX", country: "USA", website: "tpg.com", description: "Private equity firm. Partner with Google and Intersect Power in $20B 'powered land' program for AI data centers with co-located renewable generation.", logoInitials: "TP" },
  ];

  const newCmap: Record<string, number> = {};
  for (const c of newCompanyData) {
    const result = db.insert(companies).values(c as any).returning().get();
    newCmap[c.name] = result.id;
  }

  // Merge all company ID maps
  const fullCmap = { ...cmap, ...newCmap };

  // ── NEW PROJECTS ────────────────────────────────────────────────────────────
  const newProjectData = [
    {
      name: "SoftBank / SB Energy – Piketon AI Campus (Ohio)",
      operatorId: fullCmap["SB Energy (SoftBank)"],
      location: "Piketon, OH (Portsmouth DOE Site)",
      state: "OH",
      country: "USA",
      capacityMw: 10000,
      status: "announced",
      announcedDate: "2026-03-20",
      totalInvestmentB: 43.3,
      hasBtm: 1,
      btmCapacityMw: 9200,
      gridTied: 1,
      fullyOffGrid: 0,
      notes: "Announced March 20, 2026 at former Portsmouth Gaseous Diffusion Plant (now PORTS Technology Campus). $33.3B dedicated 9.2 GW natural gas plant + $10B initial 800 MW data center (scaling to 10 GW). AEP Ohio partnership for $4.2B transmission upgrades. Part of US-Japan Strategic Investment agreement. SB Energy leads.",
      sourceUrl: "https://www.statenews.org/government-politics/2026-03-20/feds-announce-huge-natural-gas-plant-data-center-project-in-southern-ohio",
    },
    {
      name: "NextEra – Anderson County TX Gas Hub (SoftBank-linked)",
      operatorId: fullCmap["NextEra Energy Resources"],
      location: "Anderson County, TX",
      state: "TX",
      country: "USA",
      capacityMw: 5200,
      status: "announced",
      announcedDate: "2026-03-23",
      totalInvestmentB: 18,
      hasBtm: 1,
      btmCapacityMw: 5200,
      gridTied: 0,
      fullyOffGrid: 1,
      notes: "5.2 GW natural gas generation hub in Anderson County, Texas for AI data centers. Part of $550B US-Japan deal. Announced at CERAWeek March 2026. Gas-to-data-center co-location model.",
      sourceUrl: "https://www.utilitydive.com/news/nextera-gas-generation-doe-softbank-texas-pennsylvania/815541/",
    },
    {
      name: "NextEra – SW Pennsylvania Gas Hub (SoftBank-linked)",
      operatorId: fullCmap["NextEra Energy Resources"],
      location: "Southwest Pennsylvania",
      state: "PA",
      country: "USA",
      capacityMw: 4300,
      status: "announced",
      announcedDate: "2026-03-23",
      totalInvestmentB: 15,
      hasBtm: 1,
      btmCapacityMw: 4300,
      gridTied: 0,
      fullyOffGrid: 1,
      notes: "4.3 GW natural gas generation hub in SW Pennsylvania for AI data centers. Part of $550B US-Japan deal. Paired with Anderson County TX hub for total 9.5 GW from NextEra.",
      sourceUrl: "https://www.utilitydive.com/news/nextera-gas-generation-doe-softbank-texas-pennsylvania/815541/",
    },
    {
      name: "ECP / KKR / CyrusOne – Bosque County TX Campus",
      operatorId: fullCmap["CyrusOne"],
      location: "Bosque County, TX",
      state: "TX",
      country: "USA",
      capacityMw: 190,
      status: "under_construction",
      announcedDate: "2025-07-30",
      totalInvestmentB: 4,
      hasBtm: 1,
      btmCapacityMw: 190,
      gridTied: 1,
      fullyOffGrid: 0,
      notes: "Inaugural investment from ECP/KKR $50B strategic partnership. 190 MW campus adjacent to Calpine Thad Hill Energy Center. Co-located with dedicated gas generation \\u2014 surplus power fed back to ERCOT during scarcity. 700,000+ sq ft. Operational Q4 2026. Climate-neutral initiatives, water conservation, biodiversity protection.",
      sourceUrl: "https://www.ecpgp.com/about/news-and-insights/press-releases/2025/energy-capital-partners--ecp--and-kkr-announce-development-of-hy",
    },
    {
      name: "Oracle – Bloom Energy SOFC Deployment (OCI)",
      operatorId: fullCmap["Oracle"],
      location: "Multiple OCI Sites, USA",
      state: "USA",
      country: "USA",
      capacityMw: 200,
      status: "operational",
      announcedDate: "2025-07-24",
      totalInvestmentB: 0.4,
      hasBtm: 1,
      btmCapacityMw: 200,
      gridTied: 1,
      fullyOffGrid: 0,
      notes: "Bloom Energy deploying SOFCs at select Oracle Cloud Infrastructure data centers. Bloom committed to deliver onsite power for an entire data center within 90 days of order. Supports OCI AI and cloud workloads. Complements Oracle's 2.3 GW VoltaGrid/Jenbacher BTM agreement.",
      sourceUrl: "https://investor.bloomenergy.com/press-releases/press-release-details/2025/Oracle-and-Bloom-Energy-Collaborate-to-Deliver-Power-to-Data-Centers-at-the-Speed-of-AI/default.aspx",
    },
    {
      name: "Google – Duane Arnold Nuclear Restart (Iowa)",
      operatorId: fullCmap["Google"],
      location: "Palo (near Cedar Rapids), IA",
      state: "IA",
      country: "USA",
      capacityMw: 615,
      status: "under_construction",
      announcedDate: "2025-10-27",
      totalInvestmentB: 9,
      hasBtm: 0,
      btmCapacityMw: null,
      gridTied: 1,
      fullyOffGrid: 0,
      notes: "25-year PPA with NextEra Energy to restart Iowa's only nuclear plant (shut down 2020). 615 MW Boiling Water Reactor targeting Q1 2029 restart. Google covering all power costs, no cost to Iowa ratepayers. $9B+ economic benefit to Iowa. CIPCO buying remaining portion. Powers Google Cloud/AI in Iowa.",
      sourceUrl: "https://www.investor.nexteraenergy.com/news-and-events/news-releases/2025/10-27-2025-203948689",
    },
    {
      name: "Google / Intersect Power / TPG – Powered Land Program",
      operatorId: fullCmap["Google"],
      location: "Multiple, USA",
      state: "USA",
      country: "USA",
      capacityMw: 3000,
      status: "announced",
      announcedDate: "2024-12-01",
      totalInvestmentB: 20,
      hasBtm: 1,
      btmCapacityMw: 3000,
      gridTied: 1,
      fullyOffGrid: 0,
      notes: "Up to $20B three-way partnership to develop 'powered land' \\u2014 data center sites co-located with renewable generation and storage. Google acquiring Intersect Power for ~$4.75B. Fundamental shift from grid PPAs to controlling the entire energy supply chain. Renewables + storage co-location model.",
      sourceUrl: "https://enkiai.com/data-center/on-site-data-center-power-unlocking-the-2026-3t-market",
    },
    {
      name: "DayOne SG1 – Singapore SOFC Hydrogen Pilot",
      operatorId: fullCmap["DayOne Data Centers"],
      location: "Singapore",
      state: null,
      country: "Singapore",
      capacityMw: 20,
      status: "under_construction",
      announcedDate: "2025-07-25",
      totalInvestmentB: 0.26,
      hasBtm: 1,
      btmCapacityMw: 0.3,
      gridTied: 1,
      fullyOffGrid: 0,
      notes: "Singapore's first hydrogen-powered data center. 20 MW facility, 40,000 sqm. Phase I RFS 2026. 0.3 MW SOFC proof-of-concept with NUS partnership. Supports high-density air-cooled GPUs and hybrid liquid cooling. LEED Platinum + Green Mark Platinum targets. SG$350M development cost.",
      sourceUrl: "https://www.datacenterdynamics.com/en/news/dayone-breaks-ground-on-20mw-data-center-in-singapore/",
    },
    {
      name: "Sharon AI / New Era Helium – Permian BTM Net-Zero Campus",
      operatorId: fullCmap["Sharon AI / Texas Critical Data Centers"],
      location: "Midland/Ector County, TX (Permian Basin)",
      state: "TX",
      country: "USA",
      capacityMw: 250,
      status: "announced",
      announcedDate: "2025-01-21",
      totalInvestmentB: 1.5,
      hasBtm: 1,
      btmCapacityMw: 250,
      gridTied: 0,
      fullyOffGrid: 1,
      notes: "Texas Critical Data Centers LLC JV. 250 MW net-zero BTM data center in Permian Basin. New Era Helium providing gas supply + CO2 capture technology. 20-year gas supply agreement. NVIDIA + Lenovo Tier III liquid-cooled facility. 45Q CCUS tax credit pursuit. Expanded from original 90 MW plan.",
      sourceUrl: "https://sharonai.com/press-releases/sharon-ai-and-new-era-helium-finalise-joint-venture-to-build-250mw-net-zero-energy-data-centre-in-texas/",
    },
    {
      name: "New Era Energy & Digital – TCDC Permian Campus",
      operatorId: fullCmap["New Era Energy & Digital (NUAI)"],
      location: "Ector County, TX (Permian Basin)",
      state: "TX",
      country: "USA",
      capacityMw: 450,
      status: "announced",
      announcedDate: "2026-02-27",
      totalInvestmentB: 2,
      hasBtm: 1,
      btmCapacityMw: 450,
      gridTied: 0,
      fullyOffGrid: 1,
      notes: "438-acre AI/HPC campus in Permian Basin scaling to 1+ GW. Thunderhead Energy + TURBINE-X partnership for BTM generation equipment. Aligned with Trump Ratepayer Pledge. Hyperscale anchor tenant secured. Procurement activities underway for generation equipment.",
      sourceUrl: "https://finance.yahoo.com/news/era-energy-digital-announces-450-140000779.html",
    },
    {
      name: "FuelCell Energy – 12.5 MW Data Center Power Block",
      operatorId: fullCmap["Fuel Cell Energy"],
      location: "Multiple, USA",
      state: "USA",
      country: "USA",
      capacityMw: 100,
      status: "announced",
      announcedDate: "2026-03-22",
      totalInvestmentB: 0.15,
      hasBtm: 1,
      btmCapacityMw: 100,
      gridTied: 1,
      fullyOffGrid: 0,
      notes: "New standardized 12.5 MW packaged power block for data centers (10x 1.25 MW modules). Manufacturing expansion from 100 MW to 350 MW/yr at Torrington CT. 275% pipeline increase since Feb 2025. Mostly data center demand. Hub-and-spoke manufacturing model. 12.5 MW block announced at DCD>Connect New York, March 24 2026.",
      sourceUrl: "https://www.nasdaq.com/press-release/fuelcell-energy-scales-data-centers-packaged-125-mw-utility-grade-power-block",
    },
    {
      name: "AEP / Bloom Energy – Wyoming AI Campus 900 MW SOFC",
      operatorId: fullCmap["American Electric Power"],
      location: "Wyoming",
      state: "WY",
      country: "USA",
      capacityMw: 900,
      status: "announced",
      announcedDate: "2026-01-15",
      totalInvestmentB: 2.65,
      hasBtm: 1,
      btmCapacityMw: 900,
      gridTied: 1,
      fullyOffGrid: 0,
      notes: "$2.65B unconditional purchase of ~900 MW Bloom Energy SOFC capacity for Wyoming AI campus. Complements earlier AEP 1 GW BTM SOFC announcement. Utility-procured BTM fuel cells enabling large AI data center in Wyoming without grid bottleneck.",
      sourceUrl: "https://introl.com/blog/fuel-cells-data-center-power-dark-horse-7-billion",
    },
  ];

  const insertedProjects: Record<string, number> = {};
  for (const p of newProjectData) {
    const result = db.insert(projects).values(p as any).returning().get();
    insertedProjects[p.name] = result.id;
  }

  // ── NEW BTM SOURCES ─────────────────────────────────────────────────────────
  const newBtmData = [
    // Piketon Ohio – SoftBank / SB Energy / AEP
    {
      projectId: insertedProjects["SoftBank / SB Energy – Piketon AI Campus (Ohio)"],
      technologyType: "gas_turbine",
      capacityMw: 9200,
      vendorId: null,
      developerId: fullCmap["SB Energy (SoftBank)"],
      fuelType: "natural_gas",
      fuelSourceId: fullCmap["American Electric Power"],
      productModel: "Combined cycle gas turbines (multiple vendors – RFP stage)",
      originCountry: "USA",
      notes: "$33.3B, 9.2 GW dedicated gas plant. AEP Ohio as utility partner. $4.2B transmission upgrades. Integrated on-site + grid hybrid model. On former DOE Portsmouth site.",
    },
    // NextEra TX
    {
      projectId: insertedProjects["NextEra – Anderson County TX Gas Hub (SoftBank-linked)"],
      technologyType: "gas_turbine",
      capacityMw: 5200,
      vendorId: null,
      developerId: fullCmap["NextEra Energy Resources"],
      fuelType: "natural_gas",
      fuelSourceId: null,
      productModel: "Combined cycle gas turbines (vendor TBD)",
      originCountry: "USA",
      notes: "Part of 9.5 GW NextEra AI data center power buildout. Announced CERAWeek March 2026.",
    },
    // NextEra PA
    {
      projectId: insertedProjects["NextEra – SW Pennsylvania Gas Hub (SoftBank-linked)"],
      technologyType: "gas_turbine",
      capacityMw: 4300,
      vendorId: null,
      developerId: fullCmap["NextEra Energy Resources"],
      fuelType: "natural_gas",
      fuelSourceId: null,
      productModel: "Combined cycle gas turbines (vendor TBD)",
      originCountry: "USA",
      notes: "Part of 9.5 GW NextEra AI data center power buildout.",
    },
    // ECP/KKR/CyrusOne Bosque – Calpine gas
    {
      projectId: insertedProjects["ECP / KKR / CyrusOne – Bosque County TX Campus"],
      technologyType: "gas_turbine",
      capacityMw: 190,
      vendorId: null,
      developerId: fullCmap["Calpine"],
      fuelType: "natural_gas",
      fuelSourceId: fullCmap["Calpine"],
      productModel: "Calpine Thad Hill Energy Center (natural gas combined cycle)",
      originCountry: "USA",
      notes: "Co-located with Calpine Thad Hill plant. Long-term dedicated power contract. Surplus fed to ERCOT during grid scarcity events.",
    },
    // Oracle Bloom
    {
      projectId: insertedProjects["Oracle – Bloom Energy SOFC Deployment (OCI)"],
      technologyType: "fuel_cell",
      capacityMw: 200,
      vendorId: fullCmap["Bloom Energy"],
      developerId: fullCmap["Bloom Energy"],
      fuelType: "natural_gas",
      fuelSourceId: null,
      productModel: "Bloom Energy SureSource SOFC (90-day delivery commitment)",
      originCountry: "USA",
      notes: "Bloom committed to power an entire data center within 90 days. Supports OCI AI workloads. Complements Oracle's VoltaGrid gas BTM agreement.",
    },
    // Google Duane Arnold – nuclear existing
    {
      projectId: insertedProjects["Google – Duane Arnold Nuclear Restart (Iowa)"],
      technologyType: "nuclear_existing",
      capacityMw: 615,
      vendorId: fullCmap["NextEra Energy Resources"],
      developerId: fullCmap["NextEra Energy Resources"],
      fuelType: "nuclear",
      fuelSourceId: fullCmap["NextEra Energy Resources"],
      productModel: "Boiling Water Reactor – Duane Arnold Energy Center (Iowa)",
      originCountry: "USA",
      notes: "Shut down 2020, restart targeting Q1 2029. NextEra acquiring 100% ownership. 25-year Google PPA. CIPCO buys remaining output. Zero cost to Iowa ratepayers.",
    },
    // Google/Intersect/TPG – renewables co-located
    {
      projectId: insertedProjects["Google / Intersect Power / TPG – Powered Land Program"],
      technologyType: "solar",
      capacityMw: 2000,
      vendorId: fullCmap["Intersect Power"],
      developerId: fullCmap["Intersect Power"],
      fuelType: "solar",
      fuelSourceId: null,
      productModel: "Utility-scale solar PV + BESS (co-located with data centers)",
      originCountry: "USA",
      notes: "Google acquiring Intersect Power (~$4.75B). Powered land strategy: data centers built adjacent to generation assets. Up to $20B total program.",
    },
    {
      projectId: insertedProjects["Google / Intersect Power / TPG – Powered Land Program"],
      technologyType: "battery",
      capacityMw: 1000,
      vendorId: fullCmap["Intersect Power"],
      developerId: fullCmap["Intersect Power"],
      fuelType: "solar",
      fuelSourceId: null,
      productModel: "Grid-scale BESS (paired with solar)",
      originCountry: "USA",
      notes: "Long-duration storage co-located to firm renewable generation for 24/7 power.",
    },
    // DayOne Singapore
    {
      projectId: insertedProjects["DayOne SG1 – Singapore SOFC Hydrogen Pilot"],
      technologyType: "fuel_cell",
      capacityMw: 0.3,
      vendorId: fullCmap["Bloom Energy"],
      developerId: fullCmap["DayOne Data Centers"],
      fuelType: "hydrogen",
      fuelSourceId: null,
      productModel: "Solid Oxide Fuel Cell (SOFC) – hydrogen pilot with NUS",
      originCountry: "USA",
      notes: "Proof-of-concept 0.3 MW. Singapore's first SOFC data center power. NUS research partnership. Future scale-up planned if pilot validates.",
    },
    // Sharon AI / New Era Helium
    {
      projectId: insertedProjects["Sharon AI / New Era Helium – Permian BTM Net-Zero Campus"],
      technologyType: "gas_turbine",
      capacityMw: 250,
      vendorId: null,
      developerId: fullCmap["New Era Helium (NEHC)"],
      fuelType: "natural_gas",
      fuelSourceId: fullCmap["New Era Helium (NEHC)"],
      productModel: "Gas-fired power plant with CO2 capture (CCUS) – vendor TBD",
      originCountry: "USA",
      notes: "New Era Helium building dedicated gas plant with CO2 capture. 20-year fixed-price gas supply. 45Q CCUS tax credits. Net-zero target via carbon capture.",
    },
    // New Era Energy TCDC
    {
      projectId: insertedProjects["New Era Energy & Digital – TCDC Permian Campus"],
      technologyType: "gas_turbine",
      capacityMw: 450,
      vendorId: fullCmap["Thunderhead Energy / TURBINE-X"],
      developerId: fullCmap["New Era Energy & Digital (NUAI)"],
      fuelType: "natural_gas",
      fuelSourceId: null,
      productModel: "Gas turbines via TURBINE-X OEM channel",
      originCountry: "USA",
      notes: "TURBINE-X is OEM channel partner. Equipment procurement underway. 438-acre site in Permian Basin.",
    },
    // FuelCell Energy 12.5 MW block program
    {
      projectId: insertedProjects["FuelCell Energy – 12.5 MW Data Center Power Block"],
      technologyType: "fuel_cell",
      capacityMw: 100,
      vendorId: fullCmap["Fuel Cell Energy"],
      developerId: fullCmap["Fuel Cell Energy"],
      fuelType: "natural_gas",
      fuelSourceId: null,
      productModel: "FuelCell Energy Block 12.5 MW (10× 1.25 MW modules)",
      originCountry: "USA",
      notes: "Standardized packaged system for faster deployment. Reduces site-specific engineering. Torrington CT manufacturing expanding 100→350 MW/yr. 275% pipeline growth. No rare earth materials.",
    },
    // AEP Wyoming SOFC
    {
      projectId: insertedProjects["AEP / Bloom Energy – Wyoming AI Campus 900 MW SOFC"],
      technologyType: "fuel_cell",
      capacityMw: 900,
      vendorId: fullCmap["Bloom Energy"],
      developerId: fullCmap["American Electric Power"],
      fuelType: "natural_gas",
      fuelSourceId: null,
      productModel: "Bloom Energy SureSource SOFC",
      originCountry: "USA",
      notes: "$2.65B unconditional purchase. Wyoming AI campus. Utility-procured BTM fuel cells. Enables large AI data center without grid bottleneck.",
    },
  ];

  for (const b of newBtmData) {
    db.insert(btmSources).values(b as any).run();
  }

  // ── PROJECT-COMPANY LINKS ───────────────────────────────────────────────────
  const newLinks = [
    { projectId: insertedProjects["SoftBank / SB Energy – Piketon AI Campus (Ohio)"], companyId: fullCmap["American Electric Power"], role: "partner" },
    { projectId: insertedProjects["SoftBank / SB Energy – Piketon AI Campus (Ohio)"], companyId: fullCmap["NextEra Energy Resources"], role: "btm_developer" },
    { projectId: insertedProjects["ECP / KKR / CyrusOne – Bosque County TX Campus"], companyId: fullCmap["Energy Capital Partners (ECP)"], role: "investor" },
    { projectId: insertedProjects["ECP / KKR / CyrusOne – Bosque County TX Campus"], companyId: fullCmap["KKR"], role: "investor" },
    { projectId: insertedProjects["ECP / KKR / CyrusOne – Bosque County TX Campus"], companyId: fullCmap["Calpine"], role: "fuel_supplier" },
    { projectId: insertedProjects["Oracle – Bloom Energy SOFC Deployment (OCI)"], companyId: fullCmap["Bloom Energy"], role: "tech_vendor" },
    { projectId: insertedProjects["Google – Duane Arnold Nuclear Restart (Iowa)"], companyId: fullCmap["NextEra Energy Resources"], role: "fuel_supplier" },
    { projectId: insertedProjects["Google / Intersect Power / TPG – Powered Land Program"], companyId: fullCmap["Intersect Power"], role: "btm_developer" },
    { projectId: insertedProjects["Google / Intersect Power / TPG – Powered Land Program"], companyId: fullCmap["TPG"], role: "investor" },
    { projectId: insertedProjects["DayOne SG1 – Singapore SOFC Hydrogen Pilot"], companyId: fullCmap["Bloom Energy"], role: "tech_vendor" },
    { projectId: insertedProjects["Sharon AI / New Era Helium – Permian BTM Net-Zero Campus"], companyId: fullCmap["New Era Helium (NEHC)"], role: "fuel_supplier" },
    { projectId: insertedProjects["New Era Energy & Digital – TCDC Permian Campus"], companyId: fullCmap["Thunderhead Energy / TURBINE-X"], role: "tech_vendor" },
    { projectId: insertedProjects["FuelCell Energy – 12.5 MW Data Center Power Block"], companyId: fullCmap["Fuel Cell Energy"], role: "tech_vendor" },
    { projectId: insertedProjects["AEP / Bloom Energy – Wyoming AI Campus 900 MW SOFC"], companyId: fullCmap["Bloom Energy"], role: "tech_vendor" },
    { projectId: insertedProjects["NextEra – Anderson County TX Gas Hub (SoftBank-linked)"], companyId: fullCmap["SB Energy (SoftBank)"], role: "customer" },
    { projectId: insertedProjects["NextEra – SW Pennsylvania Gas Hub (SoftBank-linked)"], companyId: fullCmap["SB Energy (SoftBank)"], role: "customer" },
  ];

  for (const l of newLinks) {
    if (l.companyId) {
      db.insert(projectCompanies).values(l as any).run();
    }
  }

  console.log("✅ Database seeded with V2 DC Intel additions (12 new projects, 13 new companies)");
}
`,
  "seed_v3.ts": `import { db } from "./db";
import { companies, projects, btmSources, projectCompanies } from "@shared/schema";

// V3 research sweep — March 2026
// New DC projects, midstream gas players, novel BTM tech, and international campuses
export function seedDatabaseV3() {
  const existingProjects = db.select().from(projects).all();
  const hasV3 = existingProjects.some((p) => p.name === "Crusoe / OpenAI – Stargate Abilene Campus (Texas)");
  if (hasV3) return;

  const allCompanies = db.select().from(companies).all();
  const cmap: Record<string, number> = {};
  for (const c of allCompanies) cmap[c.name] = c.id;

  // ── NEW COMPANIES ──────────────────────────────────────────────────────────

  const newCompanyData = [
    // DC Operators / Developers
    {
      name: "Crusoe Energy",
      role: "dc_operator",
      hq: "San Francisco, CA",
      country: "USA",
      website: "crusoe.ai",
      description: "Energy-first AI infrastructure provider. Primary contractor for OpenAI's Stargate Abilene campus. 1.2 GW under construction in Abilene, TX. 10+ GW in pipeline. Launch customer for Boom Superpower turbines.",
      logoInitials: "CR",
    },
    {
      name: "CloudBurst Data Centers",
      role: "dc_operator",
      hq: "Dallas, TX",
      country: "USA",
      website: "cloudburstdc.com",
      description: "Next-gen AI GigaCenter developer. Flagship 1.2 GW San Marcos campus (Hays/Guadalupe Counties, TX) BTM-powered by Energy Transfer's Oasis Pipeline. Q4 2026 first phase.",
      logoInitials: "CB",
    },
    {
      name: "GridFree AI",
      role: "dc_operator",
      hq: "Houston, TX",
      country: "USA",
      website: "gridfree.ai",
      description: "Grid-independent AI data center developer. South Dallas Cluster: 3-site, ~5 GW combined. 'Power Foundry' model: US natural gas, 24-month delivery, Goldman Sachs financing. CEO Ralph Alexander.",
      logoInitials: "GF",
    },
    {
      name: "BorderPlex Digital Assets",
      role: "dc_operator",
      hq: "El Paso, TX",
      country: "USA",
      website: "projectjupitertogether.com",
      description: "Developer of Project Jupiter in Doña Ana County, NM. $165B 30-year campus with Stack Infrastructure. Oracle as anchor tenant. 700-900 MW on-site gas microgrid. Phase 1: $50B.",
      logoInitials: "BP",
    },
    {
      name: "AVAIO Digital Partners",
      role: "dc_operator",
      hq: "New York, NY",
      country: "USA",
      website: "avaiodigital.com",
      description: "Hyperscale AI campus developer. AVAIO Digital Leo: 760-acre, $6B campus near Little Rock, AR. Up to 1 GW power. Grid + BTM hybrid. 1.2 GW secured utility portfolio across CA, VA, AR, MS.",
      logoInitials: "AV",
    },
    {
      name: "Titus Low Carbon Ventures",
      role: "dc_operator",
      hq: "Austin, TX",
      country: "USA",
      website: "tituslcv.com",
      description: "Texas multi-campus AI data center power park developer. 673 MW gas engine supply deal with AB Energy (Jenbacher J620). Hybrid BTM: recip engines + solar + wind + BESS. Island-mode operation.",
      logoInitials: "TL",
    },
    {
      name: "G42 / Khazna Data Centers",
      role: "dc_operator",
      hq: "Abu Dhabi, UAE",
      country: "UAE",
      website: "g42.ai",
      description: "Abu Dhabi sovereign AI operator. 60% majority stakeholder in Stargate UAE: $30B, 5 GW, 10 sq-mile campus with OpenAI, NVIDIA, Oracle, SoftBank. First 200 MW operational 2026.",
      logoInitials: "G4",
    },
    {
      name: "Capital Power (Polaris @ Genesee)",
      ticker: "CPX",
      role: "dc_operator",
      hq: "Edmonton, AB",
      country: "Canada",
      website: "capitalpower.com",
      description: "Canadian power generator co-locating 1.0-1.5 GW hyperscale data center at Genesee Generating Station, Alberta. 1,800 MW gas plant with 500 MW excess capacity. 2028 target. SMR feasibility study with OPG.",
      logoInitials: "CP",
    },
    // Midstream / Gas Supply
    {
      name: "Williams Companies",
      ticker: "WMB",
      role: "fuel_supplier",
      hq: "Tulsa, OK",
      country: "USA",
      website: "williams.com",
      description: "Major midstream operator pivoting to data center power. $7.3B+ in AI power projects: Socrates (400 MW, Meta, OH), Apollo (490 MW, OH), Aquila (520 MW, UT), Socrates the Younger (340 MW, OH). 33,000 mi pipeline network.",
      logoInitials: "WI",
    },
    // BTM Tech Vendors / Power Developers
    {
      name: "Boom Supersonic",
      role: "tech_vendor",
      hq: "Denver, CO",
      country: "USA",
      website: "boomsupersonic.com",
      description: "Supersonic aviation company repurposing jet engine core as 42 MW 'Superpower' aeroderivative gas turbine for data centers. 29 turbines (1.21 GW) ordered by Crusoe. $300M raised. 4 GW/yr production target by 2030.",
      logoInitials: "BS",
    },
    {
      name: "AB Energy (Gruppo AB)",
      role: "tech_vendor",
      hq: "Arzignano, Italy",
      country: "Italy",
      website: "gruppoab.com",
      description: "Italian reciprocating engine OEM. Supplying 202 Ecomax 33 units (Jenbacher J620 engines, 673 MW total) to Titus Low Carbon Ventures for Texas AI data center parks. First 400 MW commissioned Q4 2027.",
      logoInitials: "AB",
    },
    {
      name: "Baker Hughes",
      ticker: "BKR",
      role: "tech_vendor",
      hq: "Houston, TX",
      country: "USA",
      website: "bakerhughes.com",
      description: "Energy technology company. Supplying 31 BRUSH™ Power DAX 7 2-pole air-cooled generators (1.3 GW total) paired with Boom Superpower turbines for Crusoe's AI data centers. Deliveries mid-2026 through 2028.",
      logoInitials: "BH",
    },
    {
      name: "Oklo",
      ticker: "OKLO",
      role: "tech_vendor",
      hq: "Santa Clara, CA",
      country: "USA",
      website: "oklo.com",
      description: "Advanced fission company. 1.2 GW Aurora powerhouse campus agreement with Meta in Pike County, OH. 206-acre site. First phase online 2030, full 1.2 GW by 2034. Also partnered with Switch. Meta provides prepayment + capital.",
      logoInitials: "OK",
    },
    {
      name: "TerraPower",
      role: "tech_vendor",
      hq: "Bellevue, WA",
      country: "USA",
      website: "terrapower.com",
      description: "Bill Gates-founded advanced nuclear. Natrium reactor (sodium-cooled fast reactor). MOU with Meta for up to 8 reactors. First two units targeting 2032. Meta supporting early development for up to 6 GW nuclear.",
      logoInitials: "TP",
    },
    {
      name: "Stack Infrastructure",
      role: "dc_operator",
      hq: "New York, NY",
      country: "USA",
      website: "stackinfra.com",
      description: "Hyperscale data center developer and builder. Construction and development partner for BorderPlex's Project Jupiter in New Mexico. Oracle confirmed as anchor tenant.",
      logoInitials: "SI",
    },
    {
      name: "Pacifico Energy (Nate Franklin)",
      role: "btm_developer",
      hq: "Midland, TX",
      country: "USA",
      website: "pacificoenergy.com",
      description: "West Texas 8,400-acre off-grid AI power complex. 7.5 GW gas turbines + 750 MW solar + 1 GWh BESS. ERCOT-independent. Lowest-cost Permian gas supply. Permits secured from TCEQ.",
      logoInitials: "PE",
    },
  ];

  const insertedCompanies = db.insert(companies).values(
    newCompanyData.map((c) => ({
      name: c.name,
      ticker: (c as any).ticker ?? null,
      role: c.role as any,
      hq: c.hq,
      country: c.country,
      website: c.website,
      description: c.description,
      logoInitials: c.logoInitials,
    }))
  ).returning().all();

  for (const c of insertedCompanies) cmap[c.name] = c.id;

  console.log(\`✅ V3: Inserted \${insertedCompanies.length} new companies\`);

  // ── NEW PROJECTS ──────────────────────────────────────────────────────────

  // 1. Crusoe / OpenAI Stargate Abilene
  const p1 = db.insert(projects).values({
    name: "Crusoe / OpenAI – Stargate Abilene Campus (Texas)",
    operatorId: cmap["Crusoe Energy"],
    location: "Abilene (Lancium Clean Campus)",
    state: "TX",
    country: "USA",
    capacityMw: 1200,
    status: "under_construction",
    announcedDate: "2025-03-18",
    totalInvestmentB: 15,
    hasBtm: false,
    btmCapacityMw: 0,
    gridTied: true,
    fullyOffGrid: false,
    notes: "OpenAI's primary Stargate campus. 8 buildings, ~4M sqft. Grid-connected via Lancium with BTM battery + solar overlay. Aeroderivative turbines for backup. Liquid cooling (zero-water evaporation). 1.6 GW total Crusoe footprint under ops+construction.",
    sourceUrl: "https://www.crusoe.ai/resources/newsroom/crusoe-expands-ai-data-center-campus-in-abilene-to-1-2-gigawatts",
  }).returning().get();

  db.insert(projectCompanies).values([
    { projectId: p1.id, companyId: cmap["Crusoe Energy"], role: "operator" },
    { projectId: p1.id, companyId: cmap["OpenAI"], role: "customer" },
    { projectId: p1.id, companyId: cmap["Boom Supersonic"], role: "vendor" },
  ]).run();

  // 2. CloudBurst San Marcos GigaCenter
  const p2 = db.insert(projects).values({
    name: "CloudBurst – San Marcos GigaCenter (Texas)",
    operatorId: cmap["CloudBurst Data Centers"],
    location: "San Marcos / New Braunfels, Hays & Guadalupe Counties",
    state: "TX",
    country: "USA",
    capacityMw: 1200,
    status: "under_construction",
    announcedDate: "2025-02-11",
    totalInvestmentB: 5,
    hasBtm: true,
    btmCapacityMw: 1200,
    gridTied: false,
    fullyOffGrid: true,
    notes: "Energy Transfer Oasis Pipeline: 450,000 MMBtu/day (1.8 GW capacity). Phase 1: 50 MW, Q4 2026. Master-planned to 1.2 GW. High-density AI/HPC, liquid cooling. Also planning Oklahoma City campus.",
    sourceUrl: "https://evolveincorporated.com/company-news/cloudburst-and-evolve-break-ground-on-1-2gw-flagship-ai-data-center-campus-incentral-texas",
  }).returning().get();

  db.insert(btmSources).values({
    projectId: p2.id,
    technologyType: "gas_turbine",
    capacityMw: 1200,
    vendorId: null,
    developerId: cmap["CloudBurst Data Centers"],
    fuelType: "natural_gas",
    fuelSourceId: cmap["Energy Transfer"],
    originCountry: "USA",
    notes: "Energy Transfer Oasis Pipeline direct supply. 450,000 MMBtu/day. Multiple turbine types. Fully behind-the-meter, off-grid.",
  }).run();

  db.insert(projectCompanies).values([
    { projectId: p2.id, companyId: cmap["CloudBurst Data Centers"], role: "operator" },
    { projectId: p2.id, companyId: cmap["Energy Transfer"], role: "fuel_supplier" },
  ]).run();

  // 3. GridFree AI – South Dallas Cluster
  const p3 = db.insert(projects).values({
    name: "GridFree AI – South Dallas Power Foundry Cluster",
    operatorId: cmap["GridFree AI"],
    location: "Hill County (South of DFW)",
    state: "TX",
    country: "USA",
    capacityMw: 5000,
    status: "announced",
    announcedDate: "2025-12-30",
    totalInvestmentB: 12,
    hasBtm: true,
    btmCapacityMw: 5000,
    gridTied: false,
    fullyOffGrid: true,
    notes: "Three-site 'Power Foundry' cluster. Each site 1.5+ GW. Goldman Sachs co-leading financing. Newmark exclusive advisor. 24-month delivery from lease. US natural gas. 5x9 uptime. Industrial chilled-water cooling.",
    sourceUrl: "https://www.datacenterknowledge.com/energy-power-supply/gridfree-unveils-first-power-foundry-site-for-ai-data-center-workloads",
  }).returning().get();

  db.insert(btmSources).values({
    projectId: p3.id,
    technologyType: "gas_turbine",
    capacityMw: 5000,
    vendorId: null,
    developerId: cmap["GridFree AI"],
    fuelType: "natural_gas",
    fuelSourceId: null,
    originCountry: "USA",
    notes: "Proprietary Power Foundry gas turbine platform. ERCOT-independent. Grid-isolated by design.",
  }).run();

  db.insert(projectCompanies).values([
    { projectId: p3.id, companyId: cmap["GridFree AI"], role: "operator" },
  ]).run();

  // 4. Project Jupiter – BorderPlex / Oracle (New Mexico)
  const p4 = db.insert(projects).values({
    name: "Project Jupiter – BorderPlex / Oracle (New Mexico)",
    operatorId: cmap["BorderPlex Digital Assets"],
    location: "Santa Teresa, Doña Ana County",
    state: "NM",
    country: "USA",
    capacityMw: 2880,
    status: "announced",
    announcedDate: "2025-11-01",
    totalInvestmentB: 165,
    hasBtm: true,
    btmCapacityMw: 900,
    gridTied: false,
    fullyOffGrid: true,
    notes: "Oracle anchor tenant (confirmed Jan 2026). 1,400 acres near Mexican border. Stack Infrastructure as builder. 700-900 MW on-site natural gas microgrid (simple-cycle turbines). Phase 1: $50B. County PILOT: $12M/yr x 30 yrs. Adjacent to Foxconn/Maquiladora industrial zone.",
    sourceUrl: "https://www.datacenterdynamics.com/en/news/oracle-revealed-as-tenant-of-project-jupiter-data-center-campus-in-new-mexico/",
  }).returning().get();

  db.insert(btmSources).values({
    projectId: p4.id,
    technologyType: "gas_turbine",
    capacityMw: 900,
    vendorId: null,
    developerId: cmap["BorderPlex Digital Assets"],
    fuelType: "natural_gas",
    fuelSourceId: null,
    originCountry: "USA",
    notes: "Simple-cycle gas turbine microgrid. NMLEG amendment exempting microgrid from Energy Transition Act (no surplus sales required). 110-140 MMcf/d gas at full build.",
  }).run();

  db.insert(projectCompanies).values([
    { projectId: p4.id, companyId: cmap["BorderPlex Digital Assets"], role: "operator" },
    { projectId: p4.id, companyId: cmap["Stack Infrastructure"], role: "developer" },
    { projectId: p4.id, companyId: cmap["Oracle"], role: "customer" },
  ]).run();

  // 5. AVAIO Digital Leo – Little Rock, Arkansas
  const p5 = db.insert(projects).values({
    name: "AVAIO Digital Leo – Little Rock Campus (Arkansas)",
    operatorId: cmap["AVAIO Digital Partners"],
    location: "Pulaski County (near Little Rock)",
    state: "AR",
    country: "USA",
    capacityMw: 1000,
    status: "announced",
    announcedDate: "2026-01-12",
    totalInvestmentB: 6,
    hasBtm: false,
    btmCapacityMw: 0,
    gridTied: true,
    fullyOffGrid: false,
    notes: "760-acre campus. $6B initial investment (largest in Arkansas history). 150 MW contracted with Entergy Arkansas, scaling to 1 GW. Grid + BTM hybrid model. 500+ permanent jobs. Part of AVAIO's 1.2 GW multi-state utility portfolio.",
    sourceUrl: "https://www.avaiodigital.com/updates/avaio-digital-announces-new-large-scale-ai-ready-data-center-and-power-campus-in-little-rock-arkansas",
  }).returning().get();

  db.insert(projectCompanies).values([
    { projectId: p5.id, companyId: cmap["AVAIO Digital Partners"], role: "operator" },
  ]).run();

  // 6. Titus Low Carbon – Texas AI Power Parks
  const p6 = db.insert(projects).values({
    name: "Titus Low Carbon – Texas AI Data Center Power Parks",
    operatorId: cmap["Titus Low Carbon Ventures"],
    location: "Multiple sites, Texas",
    state: "TX",
    country: "USA",
    capacityMw: 673,
    status: "announced",
    announcedDate: "2025-09-12",
    totalInvestmentB: 3,
    hasBtm: true,
    btmCapacityMw: 673,
    gridTied: true,
    fullyOffGrid: false,
    notes: "Half-dozen Texas data center parks. 673 MW gas engine deal with AB Energy (Jenbacher J620). 202 Ecomax 33 units. First 400 MW commissioned Q4 2027, remainder mid-2028. Hybrid: BTM recip + solar + wind + BESS. Island-mode capable. 70%+ cost reduction vs grid-only.",
    sourceUrl: "https://www.datacenterdynamics.com/en/news/titus-signs-673mw-gas-engine-supply-deal-with-ab-energy-for-texas-data-center-parks/",
  }).returning().get();

  db.insert(btmSources).values({
    projectId: p6.id,
    technologyType: "recip_engine",
    capacityMw: 673,
    vendorId: cmap["AB Energy (Gruppo AB)"],
    developerId: cmap["Titus Low Carbon Ventures"],
    fuelType: "natural_gas",
    fuelSourceId: null,
    productModel: "Ecomax 33 / Jenbacher J620",
    originCountry: "Italy",
    notes: "202 Ecomax 33 preassembled units. 202 × Jenbacher J620 engines. Fast-start, fast-ramp, low heat rate. Modular parallel installation. Island-mode BESS integration.",
  }).run();

  db.insert(btmSources).values({
    projectId: p6.id,
    technologyType: "solar",
    capacityMw: 200,
    vendorId: null,
    developerId: cmap["Titus Low Carbon Ventures"],
    fuelType: null,
    fuelSourceId: null,
    originCountry: "USA",
    notes: "Co-located utility-scale solar + wind + BESS across Texas power parks.",
  }).run();

  db.insert(projectCompanies).values([
    { projectId: p6.id, companyId: cmap["Titus Low Carbon Ventures"], role: "operator" },
    { projectId: p6.id, companyId: cmap["AB Energy (Gruppo AB)"], role: "vendor" },
  ]).run();

  // 7. Williams Companies – Socrates Power Projects (Ohio / Meta)
  const p7 = db.insert(projects).values({
    name: "Williams Companies – Socrates Power Projects (Ohio)",
    operatorId: cmap["Williams Companies"],
    location: "New Albany, Ohio (Socrates North & South)",
    state: "OH",
    country: "USA",
    capacityMw: 400,
    status: "under_construction",
    announcedDate: "2025-10-01",
    totalInvestmentB: 2,
    hasBtm: true,
    btmCapacityMw: 400,
    gridTied: false,
    fullyOffGrid: true,
    notes: "Two 200 MW sites in New Albany, OH. Meta Platforms buyer under PPA. Williams provides gas supply + pipeline + compression + generation. Target: H2 2026 in-service. Part of $7.3B Williams AI power portfolio (Socrates, Apollo, Aquila, Socrates the Younger).",
    sourceUrl: "https://www.williams.com/expansion-project/socrates-power-solution-facilities/",
  }).returning().get();

  db.insert(btmSources).values({
    projectId: p7.id,
    technologyType: "gas_turbine",
    capacityMw: 400,
    vendorId: null,
    developerId: cmap["Williams Companies"],
    fuelType: "natural_gas",
    fuelSourceId: cmap["Williams Companies"],
    originCountry: "USA",
    notes: "Williams integrated model: upstream gas + 33,000-mi pipeline + on-site generation. 10-year take-or-pay with Meta. Ohio Power Siting Board regulated.",
  }).run();

  db.insert(projectCompanies).values([
    { projectId: p7.id, companyId: cmap["Williams Companies"], role: "operator" },
    { projectId: p7.id, companyId: cmap["Meta"], role: "customer" },
  ]).run();

  // 8. Williams Apollo + Aquila Projects (Ohio + Utah)
  const p8 = db.insert(projects).values({
    name: "Williams – Apollo (Ohio) & Aquila (Utah) Power Projects",
    operatorId: cmap["Williams Companies"],
    location: "Ohio & Utah",
    state: "OH",
    country: "USA",
    capacityMw: 1010,
    status: "announced",
    announcedDate: "2025-10-01",
    totalInvestmentB: 3.1,
    hasBtm: true,
    btmCapacityMw: 1010,
    gridTied: false,
    fullyOffGrid: true,
    notes: "Apollo (OH): 490 MW, 12.5-yr agreement, online H1 2027. Aquila (UT): 520 MW, 12.5-yr agreement, online H1 2027. Undisclosed hyperscaler customer. Part of Williams' $7.3B data center power portfolio. Gas supply + pipeline + generation fully integrated.",
    sourceUrl: "https://www.argusmedia.com/en/news-and-insights/latest-market-news/2786994-williams-to-supply-gas-power-to-meet-ohio-demand",
  }).returning().get();

  db.insert(btmSources).values({
    projectId: p8.id,
    technologyType: "gas_turbine",
    capacityMw: 1010,
    vendorId: null,
    developerId: cmap["Williams Companies"],
    fuelType: "natural_gas",
    fuelSourceId: cmap["Williams Companies"],
    originCountry: "USA",
    notes: "Apollo: 490 MW Ohio. Aquila: 520 MW Utah. Both 12.5-year take-or-pay contracts with undisclosed hyperscaler. H1 2027 target.",
  }).run();

  db.insert(projectCompanies).values([
    { projectId: p8.id, companyId: cmap["Williams Companies"], role: "operator" },
  ]).run();

  // 9. Stargate UAE – G42 / OpenAI / NVIDIA / Oracle (Abu Dhabi)
  const p9 = db.insert(projects).values({
    name: "Stargate UAE – G42 / OpenAI / NVIDIA / Oracle (Abu Dhabi)",
    operatorId: cmap["G42 / Khazna Data Centers"],
    location: "Masdar City Technology Zone, Abu Dhabi",
    state: null,
    country: "UAE",
    capacityMw: 5000,
    status: "under_construction",
    announcedDate: "2025-05-22",
    totalInvestmentB: 30,
    hasBtm: true,
    btmCapacityMw: 3500,
    gridTied: true,
    fullyOffGrid: false,
    notes: "World's largest planned AI campus. 10 sq miles. G42 (60%), OpenAI (20%), NVIDIA (12%), Oracle (8%). First 200 MW online 2026. Full 5 GW by ~2030. Power: dedicated gas turbines (baseload BTM) + 1.5 GW solar array + BESS + grid. Barakah nuclear grid backup. 1M+ Nvidia Blackwell Ultra chips. Sovereign AI for UAE government.",
    sourceUrl: "https://www.prnewswire.com/apac/news-releases/g42-provides-update-on-construction-of-stargate-uae-ai-infrastructure-cluster-302586440.html",
  }).returning().get();

  db.insert(btmSources).values({
    projectId: p9.id,
    technologyType: "gas_turbine",
    capacityMw: 2000,
    vendorId: null,
    developerId: cmap["G42 / Khazna Data Centers"],
    fuelType: "natural_gas",
    fuelSourceId: null,
    originCountry: "UAE",
    notes: "Dedicated BTM gas turbines for baseload power. UAE Department of Energy-approved dedicated transmission corridor. Campus-scale generation.",
  }).run();

  db.insert(btmSources).values({
    projectId: p9.id,
    technologyType: "solar",
    capacityMw: 1500,
    vendorId: null,
    developerId: cmap["G42 / Khazna Data Centers"],
    fuelType: null,
    fuelSourceId: null,
    originCountry: "UAE",
    notes: "1.5 GW solar array co-located with campus. Combined with BESS for renewables integration.",
  }).run();

  db.insert(projectCompanies).values([
    { projectId: p9.id, companyId: cmap["G42 / Khazna Data Centers"], role: "operator" },
    { projectId: p9.id, companyId: cmap["OpenAI"], role: "customer" },
    { projectId: p9.id, companyId: cmap["Oracle"], role: "vendor" },
  ]).run();

  // 10. Capital Power Polaris @ Genesee – Alberta
  const p10 = db.insert(projects).values({
    name: "Capital Power – Polaris @ Genesee Energy Campus (Alberta)",
    operatorId: cmap["Capital Power (Polaris @ Genesee)"],
    location: "Genesee Generating Station (80 km SW of Edmonton)",
    state: null,
    country: "Canada",
    capacityMw: 1500,
    status: "announced",
    announcedDate: "2025-06-01",
    totalInvestmentB: 4,
    hasBtm: true,
    btmCapacityMw: 1500,
    gridTied: true,
    fullyOffGrid: false,
    notes: "1.0-1.5 GW hyperscale campus co-located at 1,800 MW Genesee Gas Station. 500 MW excess capacity available immediately. 2028 in-service target. AESO Phase 2 queue. BESS + SMR feasibility (with Ontario Power Generation). Tier IV-capable.",
    sourceUrl: "https://www.capitalpower.com/pgec/",
  }).returning().get();

  db.insert(btmSources).values({
    projectId: p10.id,
    technologyType: "gas_turbine",
    capacityMw: 1500,
    vendorId: null,
    developerId: cmap["Capital Power (Polaris @ Genesee)"],
    fuelType: "natural_gas",
    fuelSourceId: null,
    originCountry: "Canada",
    notes: "Co-located with 1,800 MW Genesee Gas Station (converted from coal, -40% GHG). 500 MW near-term via BESS unlock. SMR feasibility study with OPG underway.",
  }).run();

  db.insert(projectCompanies).values([
    { projectId: p10.id, companyId: cmap["Capital Power (Polaris @ Genesee)"], role: "operator" },
  ]).run();

  // 11. Oklo / Meta – Aurora Nuclear Campus (Ohio)
  const p11 = db.insert(projects).values({
    name: "Oklo / Meta – Aurora Nuclear Campus (Pike County, Ohio)",
    operatorId: cmap["Oklo"],
    location: "Pike County, Ohio",
    state: "OH",
    country: "USA",
    capacityMw: 1200,
    status: "announced",
    announcedDate: "2026-01-09",
    totalInvestmentB: 5,
    hasBtm: false,
    btmCapacityMw: 0,
    gridTied: true,
    fullyOffGrid: false,
    notes: "Meta Platforms pre-pays for power + funds Phase 1. 206 acres. Pre-construction 2026. First Aurora powerhouse online 2030. Full 1.2 GW by 2034. Up to 16 Aurora reactors. First-of-kind commercial prepayment structure for nuclear. Meta separately signed with TerraPower (8 Natrium reactors, 2032 target).",
    sourceUrl: "https://oklo.com/newsroom/news-details/2026/Oklo-Meta-Announce-Agreement-in-Support-of-1.2-GW-Nuclear-Energy-Development-in-Southern-Ohio/default.aspx",
  }).returning().get();

  db.insert(btmSources).values({
    projectId: p11.id,
    technologyType: "nuclear_smr",
    capacityMw: 1200,
    vendorId: cmap["Oklo"],
    developerId: cmap["Oklo"],
    fuelType: "nuclear",
    fuelSourceId: null,
    productModel: "Aurora Powerhouse (advanced fission)",
    originCountry: "USA",
    notes: "Up to 16 Aurora reactors. Advanced fission (fast spectrum). Scaling incrementally. Meta prepayment mechanism novel for nuclear sector.",
  }).run();

  db.insert(projectCompanies).values([
    { projectId: p11.id, companyId: cmap["Oklo"], role: "vendor" },
    { projectId: p11.id, companyId: cmap["Meta"], role: "customer" },
  ]).run();

  // 12. Meta – Lebanon Indiana 1 GW Campus
  const p12 = db.insert(projects).values({
    name: "Meta – Lebanon Data Center Campus (Indiana)",
    operatorId: cmap["Meta"],
    location: "Lebanon, Boone County (30 mi NW of Indianapolis)",
    state: "IN",
    country: "USA",
    capacityMw: 1000,
    status: "under_construction",
    announcedDate: "2026-02-11",
    totalInvestmentB: 10,
    hasBtm: false,
    btmCapacityMw: 0,
    gridTied: true,
    fullyOffGrid: false,
    notes: "Meta's second Indiana campus. Groundbreaking Feb 11, 2026. 100% clean energy matched. 4,000 construction jobs at peak. Operational late 2027 / early 2028. LEED Gold. Closed-loop liquid cooling (zero water most of year). $1M/yr Boone REMC community fund for 20 years.",
    sourceUrl: "https://about.fb.com/news/2026/02/metas-new-data-center-lebanon-indiana-marks-milestone-ai-investment/",
  }).returning().get();

  db.insert(projectCompanies).values([
    { projectId: p12.id, companyId: cmap["Meta"], role: "operator" },
  ]).run();

  // 13. Pacifico Energy – West Texas 7.5 GW Off-Grid Complex
  const p13 = db.insert(projects).values({
    name: "Pacifico Energy – West Texas Off-Grid AI Power Complex",
    operatorId: cmap["Pacifico Energy (Nate Franklin)"],
    location: "West Texas (8,400 acres, Permian Basin area)",
    state: "TX",
    country: "USA",
    capacityMw: 7500,
    status: "announced",
    announcedDate: "2026-02-19",
    totalInvestmentB: 20,
    hasBtm: true,
    btmCapacityMw: 7500,
    gridTied: false,
    fullyOffGrid: true,
    notes: "Nate Franklin (founder). TCEQ air permits secured for gas turbines. 7.5 GW gas + 750 MW solar + 1 GWh BESS. Cheapest Permian gas supply. ERCOT-independent model. Forbes profile Feb 2026. Data center tenants TBD.",
    sourceUrl: "https://www.forbes.com/sites/christopherhelman/2026/02/19/this-daring-developer-wants-to-power-americas-ai-future/",
  }).returning().get();

  db.insert(btmSources).values({
    projectId: p13.id,
    technologyType: "gas_turbine",
    capacityMw: 7500,
    vendorId: null,
    developerId: cmap["Pacifico Energy (Nate Franklin)"],
    fuelType: "natural_gas",
    fuelSourceId: null,
    originCountry: "USA",
    notes: "Permitted for gas turbines (TCEQ). ERCOT-isolated. Permian Basin cheapest gas. 8,400 acres acquired/optioned.",
  }).run();

  db.insert(btmSources).values({
    projectId: p13.id,
    technologyType: "solar",
    capacityMw: 750,
    vendorId: null,
    developerId: cmap["Pacifico Energy (Nate Franklin)"],
    fuelType: null,
    fuelSourceId: null,
    originCountry: "USA",
    notes: "750 MW solar + 1 GWh BESS as hybrid overlay on gas turbine baseload.",
  }).run();

  db.insert(projectCompanies).values([
    { projectId: p13.id, companyId: cmap["Pacifico Energy (Nate Franklin)"], role: "operator" },
  ]).run();

  // 14. Boom Superpower – Crusoe BTM Turbine Fleet (National)
  const p14 = db.insert(projects).values({
    name: "Boom Superpower – Crusoe Aeroderivative Fleet (National)",
    operatorId: cmap["Boom Supersonic"],
    location: "Multiple US Sites",
    state: null,
    country: "USA",
    capacityMw: 1210,
    status: "announced",
    announcedDate: "2025-12-09",
    totalInvestmentB: 1.25,
    hasBtm: true,
    btmCapacityMw: 1210,
    gridTied: false,
    fullyOffGrid: true,
    notes: "29 × 42 MW Superpower turbines ordered by Crusoe ($1.25B backlog). 31 units total with Baker Hughes BRUSH DAX 7 generators. Deliveries mid-2026 → 2028. Derived from Overture supersonic jet core. Full-rated output at 110°F+. Waterless. No ERCOT connection needed. 4 GW/yr production target 2030.",
    sourceUrl: "https://investors.bakerhughes.com/news/press-releases/news-details/2026/Baker-Hughes-Secures-1.21-Gigawatt-Generator-Order-to-Power-Boom-Supersonics-AI-Data-Center-Solution/default.aspx",
  }).returning().get();

  db.insert(btmSources).values({
    projectId: p14.id,
    technologyType: "gas_turbine",
    capacityMw: 1210,
    vendorId: cmap["Boom Supersonic"],
    developerId: cmap["Crusoe Energy"],
    fuelType: "natural_gas",
    fuelSourceId: null,
    productModel: "Boom Superpower (42 MW aeroderivative) + Baker Hughes BRUSH DAX 7",
    originCountry: "USA",
    notes: "Supersonic jet-derived aeroderivative. 42 MW per unit ISO-rated. Waterless operation. $300M Boom funding (Darsana, Altimeter, ARK, Bessemer, Robinhood, YC).",
  }).run();

  db.insert(projectCompanies).values([
    { projectId: p14.id, companyId: cmap["Boom Supersonic"], role: "vendor" },
    { projectId: p14.id, companyId: cmap["Crusoe Energy"], role: "operator" },
    { projectId: p14.id, companyId: cmap["Baker Hughes"], role: "vendor" },
  ]).run();

  console.log(\`✅ V3: Inserted 14 new projects with BTM sources and project-company links\`);
}
`,
  "vite.config.ts": `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  base: "./",
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
`,
  "package.json": `{
  "name": "rest-express",
  "version": "1.0.0",
  "type": "module",
  "license": "MIT",
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "build": "tsx script/build.ts",
    "start": "NODE_ENV=production node dist/index.cjs",
    "check": "tsc",
    "db:push": "drizzle-kit push"
  },
  "dependencies": {
    "@hookform/resolvers": "^3.10.0",
    "@jridgewell/trace-mapping": "^0.3.25",
    "@radix-ui/react-accordion": "^1.2.4",
    "@radix-ui/react-alert-dialog": "^1.1.7",
    "@radix-ui/react-aspect-ratio": "^1.1.3",
    "@radix-ui/react-avatar": "^1.1.4",
    "@radix-ui/react-checkbox": "^1.1.5",
    "@radix-ui/react-collapsible": "^1.1.4",
    "@radix-ui/react-context-menu": "^2.2.7",
    "@radix-ui/react-dialog": "^1.1.7",
    "@radix-ui/react-dropdown-menu": "^2.1.7",
    "@radix-ui/react-hover-card": "^1.1.7",
    "@radix-ui/react-label": "^2.1.3",
    "@radix-ui/react-menubar": "^1.1.7",
    "@radix-ui/react-navigation-menu": "^1.2.6",
    "@radix-ui/react-popover": "^1.1.7",
    "@radix-ui/react-progress": "^1.1.3",
    "@radix-ui/react-radio-group": "^1.2.4",
    "@radix-ui/react-scroll-area": "^1.2.4",
    "@radix-ui/react-select": "^2.1.7",
    "@radix-ui/react-separator": "^1.1.3",
    "@radix-ui/react-slider": "^1.2.4",
    "@radix-ui/react-slot": "^1.2.0",
    "@radix-ui/react-switch": "^1.1.4",
    "@radix-ui/react-tabs": "^1.1.4",
    "@radix-ui/react-toast": "^1.2.7",
    "@radix-ui/react-toggle": "^1.1.3",
    "@radix-ui/react-toggle-group": "^1.1.3",
    "@radix-ui/react-tooltip": "^1.2.0",
    "@tanstack/react-query": "^5.60.5",
    "@types/leaflet": "^1.9.21",
    "better-sqlite3": "^11.7.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "^1.1.1",
    "date-fns": "^3.6.0",
    "drizzle-orm": "^0.39.3",
    "drizzle-zod": "^0.7.0",
    "embla-carousel-react": "^8.6.0",
    "express": "^5.0.1",
    "express-session": "^1.18.1",
    "framer-motion": "^11.13.1",
    "input-otp": "^1.4.2",
    "leaflet": "^1.9.4",
    "lucide-react": "^0.453.0",
    "memorystore": "^1.6.7",
    "next-themes": "^0.4.6",
    "passport": "^0.7.0",
    "passport-local": "^1.0.0",
    "react": "^18.3.1",
    "react-day-picker": "^8.10.1",
    "react-dom": "^18.3.1",
    "react-hook-form": "^7.55.0",
    "react-icons": "^5.4.0",
    "react-leaflet": "^5.0.0",
    "react-resizable-panels": "^2.1.7",
    "recharts": "^2.15.2",
    "tailwind-merge": "^2.6.0",
    "tailwindcss-animate": "^1.0.7",
    "tw-animate-css": "^1.2.5",
    "vaul": "^1.1.2",
    "wouter": "^3.3.5",
    "ws": "^8.18.0",
    "zod": "^3.24.2",
    "zod-validation-error": "^3.4.0"
  },
  "devDependencies": {
    "@tailwindcss/typography": "^0.5.15",
    "@tailwindcss/vite": "^4.1.18",
    "@types/better-sqlite3": "^7.6.12",
    "@types/express": "^5.0.0",
    "@types/express-session": "^1.18.0",
    "@types/node": "20.19.27",
    "@types/passport": "^1.0.16",
    "@types/passport-local": "^1.0.38",
    "@types/react": "^18.3.11",
    "@types/react-dom": "^18.3.1",
    "@types/ws": "^8.5.13",
    "@vitejs/plugin-react": "^4.7.0",
    "autoprefixer": "^10.4.20",
    "drizzle-kit": "^0.31.8",
    "esbuild": "^0.25.0",
    "postcss": "^8.4.47",
    "simplify-js": "^1.2.4",
    "tailwindcss": "^3.4.17",
    "tsx": "^4.20.5",
    "typescript": "5.6.3",
    "vite": "^7.3.0"
  },
  "overrides": {
    "drizzle-kit": {
      "@esbuild-kit/esm-loader": "npm:tsx@^4.20.4"
    }
  },
  "optionalDependencies": {
    "bufferutil": "^4.0.8"
  }
}
`,
};

// ============================================================
// File tree definition
// ============================================================
type FileEntry = { name: string; path: string; lang: "typescript" | "json" };
type FileGroup = { label: string; files: FileEntry[] };

const FILE_TREE: FileGroup[] = [
  {
    label: "Client / Core",
    files: [
      { name: "App.tsx", path: "client/src/App.tsx", lang: "typescript" },
      { name: "main.tsx", path: "client/src/main.tsx", lang: "typescript" },
    ],
  },
  {
    label: "Client / Lib",
    files: [
      { name: "queryClient.ts", path: "client/src/lib/queryClient.ts", lang: "typescript" },
      { name: "themes.ts", path: "client/src/lib/themes.ts", lang: "typescript" },
      { name: "utils.ts", path: "client/src/lib/utils.ts", lang: "typescript" },
      { name: "rtoPolygons.ts", path: "client/src/lib/rtoPolygons.ts", lang: "typescript" },
    ],
  },
  {
    label: "Client / Components",
    files: [
      { name: "Layout.tsx", path: "client/src/components/Layout.tsx", lang: "typescript" },
      { name: "GlobalSearch.tsx", path: "client/src/components/GlobalSearch.tsx", lang: "typescript" },
      { name: "MethodologyTip.tsx", path: "client/src/components/MethodologyTip.tsx", lang: "typescript" },
      { name: "TechBadge.tsx", path: "client/src/components/TechBadge.tsx", lang: "typescript" },
    ],
  },
  {
    label: "Client / Pages",
    files: [
      { name: "Dashboard.tsx", path: "client/src/pages/Dashboard.tsx", lang: "typescript" },
      { name: "Projects.tsx", path: "client/src/pages/Projects.tsx", lang: "typescript" },
      { name: "NewsPage.tsx", path: "client/src/pages/NewsPage.tsx", lang: "typescript" },
      { name: "Competitors.tsx", path: "client/src/pages/Competitors.tsx", lang: "typescript" },
      { name: "CompetitorDetail.tsx", path: "client/src/pages/CompetitorDetail.tsx", lang: "typescript" },
      { name: "Companies.tsx", path: "client/src/pages/Companies.tsx", lang: "typescript" },
      { name: "CompanyDetail.tsx", path: "client/src/pages/CompanyDetail.tsx", lang: "typescript" },
      { name: "QueueIntelligence.tsx", path: "client/src/pages/QueueIntelligence.tsx", lang: "typescript" },
      { name: "MacroPower.tsx", path: "client/src/pages/MacroPower.tsx", lang: "typescript" },
      { name: "MapView.tsx", path: "client/src/pages/MapView.tsx", lang: "typescript" },
      { name: "Settings.tsx", path: "client/src/pages/Settings.tsx", lang: "typescript" },
      { name: "ProjectDetail.tsx", path: "client/src/pages/ProjectDetail.tsx", lang: "typescript" },
    ],
  },
  {
    label: "Server",
    files: [
      { name: "index.ts", path: "server/index.ts", lang: "typescript" },
      { name: "routes.ts", path: "server/routes.ts", lang: "typescript" },
      { name: "db.ts", path: "server/db.ts", lang: "typescript" },
      { name: "storage.ts", path: "server/storage.ts", lang: "typescript" },
      { name: "static.ts", path: "server/static.ts", lang: "typescript" },
      { name: "seed.ts", path: "server/seed.ts", lang: "typescript" },
      { name: "seed_v2.ts", path: "server/seed_v2.ts", lang: "typescript" },
      { name: "seed_v3.ts", path: "server/seed_v3.ts", lang: "typescript" },
    ],
  },
  {
    label: "Config",
    files: [
      { name: "vite.config.ts", path: "vite.config.ts", lang: "typescript" },
      { name: "package.json", path: "package.json", lang: "json" },
    ],
  },
];

// ============================================================
// Syntax tokenizer — no external library
// ============================================================
type Token = { text: string; color: string };

const TS_KEYWORDS = new Set([
  "import","export","from","default","const","let","var","function","return",
  "if","else","for","while","do","switch","case","break","continue",
  "async","await","try","catch","finally","throw","new","typeof","instanceof",
  "class","extends","implements","interface","type","enum","namespace",
  "public","private","protected","static","readonly","abstract","override",
  "true","false","null","undefined","void","never","any","unknown","as","in",
  "of","keyof","infer","declare","module","require","delete",
]);

function tokenizeLine(line: string, lang: "typescript" | "json"): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const len = line.length;

  while (i < len) {
    // Single-line comment
    if (line[i] === "/" && line[i + 1] === "/") {
      tokens.push({ text: line.slice(i), color: "#6B7280" });
      break;
    }

    // Block comment
    if (line[i] === "/" && line[i + 1] === "*") {
      const end = line.indexOf("*/", i + 2);
      if (end !== -1) {
        tokens.push({ text: line.slice(i, end + 2), color: "#6B7280" });
        i = end + 2;
      } else {
        tokens.push({ text: line.slice(i), color: "#6B7280" });
        break;
      }
      continue;
    }

    // Backtick template literal
    if (line[i] === "`") {
      const start = i++;
      while (i < len && line[i] !== "`") {
        if (line[i] === "\\") i++;
        i++;
      }
      i++;
      tokens.push({ text: line.slice(start, i), color: "#D97706" });
      continue;
    }

    // Double-quoted string
    if (line[i] === '"') {
      const start = i++;
      while (i < len && line[i] !== '"') {
        if (line[i] === "\\") i++;
        i++;
      }
      i++;
      tokens.push({ text: line.slice(start, i), color: "#10B981" });
      continue;
    }

    // Single-quoted string
    if (line[i] === "'") {
      const start = i++;
      while (i < len && line[i] !== "'") {
        if (line[i] === "\\") i++;
        i++;
      }
      i++;
      tokens.push({ text: line.slice(start, i), color: "#10B981" });
      continue;
    }

    // JSX/HTML tag
    if (line[i] === "<" && (line[i + 1] === "/" || /[A-Z]/.test(line[i + 1] ?? ""))) {
      const start = i++;
      while (i < len && line[i] !== ">" && line[i] !== " " && line[i] !== "\n") i++;
      if (i < len && line[i] === ">") i++;
      tokens.push({ text: line.slice(start, i), color: "#06B6D4" });
      continue;
    }

    // Numbers
    if (/[0-9]/.test(line[i]) && (i === 0 || !/[a-zA-Z_$]/.test(line[i - 1]))) {
      const start = i;
      while (i < len && /[0-9._xXa-fA-FbBoO]/.test(line[i])) i++;
      tokens.push({ text: line.slice(start, i), color: "#F97316" });
      continue;
    }

    // Identifiers / keywords
    if (/[a-zA-Z_$]/.test(line[i])) {
      const start = i;
      while (i < len && /[a-zA-Z0-9_$]/.test(line[i])) i++;
      const word = line.slice(start, i);
      if (lang === "typescript" && TS_KEYWORDS.has(word)) {
        tokens.push({ text: word, color: "#818CF8" });
      } else {
        tokens.push({ text: word, color: "#E5E7EB" });
      }
      continue;
    }

    // Default
    tokens.push({ text: line[i], color: "#9CA3AF" });
    i++;
  }

  return tokens;
}

// ============================================================
// CodeLine component
// ============================================================
function CodeLine({
  lineNumber,
  tokens,
  isMatch,
  isActiveMatch,
}: {
  lineNumber: number;
  tokens: Token[];
  isMatch: boolean;
  isActiveMatch: boolean;
  searchTerm: string;
}) {
  const bgColor = isActiveMatch
    ? "rgba(251, 191, 36, 0.25)"
    : isMatch
    ? "rgba(251, 191, 36, 0.10)"
    : "transparent";

  return (
    <div style={{ backgroundColor: bgColor, display: "flex", minHeight: "1.5rem" }}>
      <span
        style={{
          display: "inline-block",
          width: "3.5rem",
          minWidth: "3.5rem",
          textAlign: "right",
          paddingRight: "1rem",
          color: "#4B5563",
          userSelect: "none",
          fontSize: "0.8125rem",
          lineHeight: "1.5rem",
          fontFamily: "ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, monospace",
        }}
      >
        {lineNumber}
      </span>
      <span
        style={{
          fontSize: "0.8125rem",
          lineHeight: "1.5rem",
          whiteSpace: "pre",
          fontFamily: "ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, monospace",
        }}
      >
        {tokens.map((tok, ti) => (
          <span key={ti} style={{ color: tok.color }}>
            {tok.text}
          </span>
        ))}
      </span>
    </div>
  );
}

// ============================================================
// Main DevBackend page component
// ============================================================
export default function DevBackend() {
  const [selectedFile, setSelectedFile] = useState<string>("App.tsx");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchMatchIndex, setSearchMatchIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [showSearch, setShowSearch] = useState(false);
  const codeRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Get current file entry metadata
  const currentFileEntry = useMemo<FileEntry | undefined>(() => {
    for (const group of FILE_TREE) {
      const found = group.files.find((f) => f.name === selectedFile);
      if (found) return found;
    }
    return undefined;
  }, [selectedFile]);

  const rawContent = FILE_CONTENTS[selectedFile] ?? "";
  const lines = useMemo(() => rawContent.split("\n"), [rawContent]);

  // Tokenize lines for syntax highlighting
  const tokenizedLines = useMemo(() => {
    const lang = currentFileEntry?.lang ?? "typescript";
    return lines.map((line) => tokenizeLine(line, lang));
  }, [lines, currentFileEntry]);

  // Find search match line indices
  const matchingLineIndices = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const lower = searchTerm.toLowerCase();
    return lines
      .map((line, i) => ({ line, i }))
      .filter(({ line }) => line.toLowerCase().includes(lower))
      .map(({ i }) => i);
  }, [lines, searchTerm]);

  const safeMatchIndex =
    matchingLineIndices.length > 0
      ? ((searchMatchIndex % matchingLineIndices.length) + matchingLineIndices.length) % matchingLineIndices.length
      : 0;

  // Scroll active match into view
  useEffect(() => {
    if (matchingLineIndices.length > 0 && codeRef.current) {
      const targetLine = matchingLineIndices[safeMatchIndex];
      const lineEl = codeRef.current.querySelector(
        `[data-line-index="${targetLine}"]`
      );
      if (lineEl) {
        (lineEl as HTMLElement).scrollIntoView({ block: "center", behavior: "smooth" });
      }
    }
  }, [safeMatchIndex, matchingLineIndices]);

  // Copy raw file content to clipboard
  const handleCopy = useCallback(() => {
    const originalContent = FILE_CONTENTS[selectedFile] ?? "";
    navigator.clipboard.writeText(originalContent).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [selectedFile]);

  // Keyboard shortcut: Ctrl+F to open search, Escape to close
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        setShowSearch(true);
        setTimeout(() => searchRef.current?.focus(), 50);
      }
      if (e.key === "Escape" && showSearch) {
        setShowSearch(false);
        setSearchTerm("");
      }
    },
    [showSearch]
  );

  const toggleGroup = (label: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const goToMatch = (dir: "prev" | "next") => {
    if (matchingLineIndices.length === 0) return;
    const n = matchingLineIndices.length;
    setSearchMatchIndex((prev) => {
      if (dir === "next") return (prev + 1) % n;
      return ((prev - 1) % n + n) % n;
    });
  };

  // Reset search state on file change
  useEffect(() => {
    setSearchTerm("");
    setSearchMatchIndex(0);
    setShowSearch(false);
    if (codeRef.current) codeRef.current.scrollTop = 0;
  }, [selectedFile]);

  const lineCount = lines.length;
  const lang = currentFileEntry?.lang === "json" ? "JSON" : "TypeScript";

  return (
    <Layout>
      {/* Outer container: full viewport height minus nav */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "calc(100vh - 4rem)",
          background: "#0D1117",
          color: "#E5E7EB",
          overflow: "hidden",
        }}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        {/* ── Page header ── */}
        <div
          style={{
            padding: "0.875rem 1.5rem 0.75rem",
            borderBottom: "1px solid #1F2937",
            background: "#0D1117",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            <Lock size={18} style={{ color: "#F59E0B" }} />
            <h1
              style={{
                margin: 0,
                fontSize: "1.0625rem",
                fontWeight: 700,
                color: "#F9FAFB",
                letterSpacing: "-0.01em",
              }}
            >
              Dev Backend Draft
            </h1>
            <span
              style={{
                background: "#78350F",
                color: "#FCD34D",
                fontSize: "0.625rem",
                fontWeight: 800,
                padding: "0.125rem 0.5rem",
                borderRadius: "0.25rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              DRAFT · NOT FOR DISTRIBUTION
            </span>
          </div>
          <p style={{ margin: "0.2rem 0 0", fontSize: "0.8rem", color: "#6B7280" }}>
            CS Internal — Read-Only Code Snapshot · March 28, 2026
          </p>
          <p style={{ margin: "0.1rem 0 0", fontSize: "0.725rem", color: "#4B5563", fontStyle: "italic" }}>
            This is a live snapshot of the application source. Changes here do not affect the running app.
          </p>
        </div>

        {/* ── IDE layout: sidebar + code panel ── */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* ── File tree sidebar ── */}
          <div
            style={{
              width: "13.5rem",
              minWidth: "13.5rem",
              borderRight: "1px solid #1F2937",
              overflowY: "auto",
              background: "#111827",
              paddingBottom: "1rem",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                padding: "0.5rem 0.75rem",
                fontSize: "0.625rem",
                fontWeight: 800,
                color: "#4B5563",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                borderBottom: "1px solid #1F2937",
                userSelect: "none",
              }}
            >
              EXPLORER
            </div>
            {FILE_TREE.map((group) => {
              const collapsed = !!collapsedGroups[group.label];
              return (
                <div key={group.label}>
                  <button
                    onClick={() => toggleGroup(group.label)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      width: "100%",
                      padding: "0.35rem 0.75rem",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#9CA3AF",
                      fontSize: "0.625rem",
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      textAlign: "left",
                    }}
                  >
                    {collapsed ? (
                      <ChevronRight size={11} style={{ flexShrink: 0 }} />
                    ) : (
                      <ChevronDown size={11} style={{ flexShrink: 0 }} />
                    )}
                    {group.label}
                  </button>
                  {!collapsed &&
                    group.files.map((file) => {
                      const isActive = file.name === selectedFile;
                      return (
                        <button
                          key={file.name}
                          onClick={() => setSelectedFile(file.name)}
                          style={{
                            display: "block",
                            width: "100%",
                            textAlign: "left",
                            padding: "0.25rem 0.75rem 0.25rem 1.625rem",
                            background: isActive ? "#1D3461" : "none",
                            border: "none",
                            borderLeft: isActive ? "2px solid #3B82F6" : "2px solid transparent",
                            cursor: "pointer",
                            color: isActive ? "#93C5FD" : "#9CA3AF",
                            fontSize: "0.8125rem",
                            fontFamily:
                              "ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, monospace",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {file.name}
                        </button>
                      );
                    })}
                </div>
              );
            })}
          </div>

          {/* ── Main code panel ── */}
          <div
            style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}
          >
            {/* Top bar: file info + badges + controls */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.375rem 1rem",
                borderBottom: "1px solid #1F2937",
                background: "#161B22",
                flexShrink: 0,
                gap: "0.5rem",
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  minWidth: 0,
                  overflow: "hidden",
                }}
              >
                <span
                  style={{
                    fontSize: "0.8125rem",
                    color: "#E5E7EB",
                    fontFamily:
                      "ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, monospace",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {currentFileEntry?.path ?? selectedFile}
                </span>
                <span style={{ fontSize: "0.6875rem", color: "#374151" }}>·</span>
                <span style={{ fontSize: "0.6875rem", color: "#6B7280", whiteSpace: "nowrap" }}>
                  {lang}
                </span>
                <span style={{ fontSize: "0.6875rem", color: "#374151" }}>·</span>
                <span style={{ fontSize: "0.6875rem", color: "#6B7280", whiteSpace: "nowrap" }}>
                  {lineCount.toLocaleString()} lines
                </span>
                <span style={{ fontSize: "0.6875rem", color: "#374151" }}>·</span>
                <span style={{ fontSize: "0.6875rem", color: "#6B7280", whiteSpace: "nowrap" }}>
                  March 28, 2026
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
                <span
                  style={{
                    background: "#451A03",
                    color: "#FCD34D",
                    fontSize: "0.5625rem",
                    fontWeight: 800,
                    padding: "0.125rem 0.4rem",
                    borderRadius: "0.2rem",
                    letterSpacing: "0.08em",
                    whiteSpace: "nowrap",
                    textTransform: "uppercase",
                  }}
                >
                  READ ONLY — DEV DRAFT CS
                </span>
                <button
                  onClick={() => {
                    setShowSearch(true);
                    setTimeout(() => searchRef.current?.focus(), 50);
                  }}
                  title="Search (Ctrl+F)"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "0.25rem 0.4rem",
                    background: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "0.25rem",
                    cursor: "pointer",
                    color: "#9CA3AF",
                  }}
                >
                  <Search size={13} />
                </button>
                <button
                  onClick={handleCopy}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    padding: "0.25rem 0.6rem",
                    background: copied ? "#064E3B" : "#1F2937",
                    border: `1px solid ${copied ? "#065F46" : "#374151"}`,
                    borderRadius: "0.25rem",
                    cursor: "pointer",
                    color: copied ? "#6EE7B7" : "#9CA3AF",
                    fontSize: "0.75rem",
                    transition: "all 0.15s",
                    whiteSpace: "nowrap",
                  }}
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            {/* Inline search bar */}
            {showSearch && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.375rem 1rem",
                  borderBottom: "1px solid #1F2937",
                  background: "#1A1F2E",
                  flexShrink: 0,
                }}
              >
                <Search size={13} style={{ color: "#6B7280", flexShrink: 0 }} />
                <input
                  ref={searchRef}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setSearchMatchIndex(0);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.shiftKey ? goToMatch("prev") : goToMatch("next");
                    }
                    if (e.key === "Escape") {
                      setShowSearch(false);
                      setSearchTerm("");
                    }
                  }}
                  placeholder="Find in file… (Enter to navigate)"
                  style={{
                    flex: 1,
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    color: "#E5E7EB",
                    fontSize: "0.8125rem",
                    fontFamily:
                      "ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, monospace",
                    minWidth: 0,
                  }}
                />
                {searchTerm && (
                  <span
                    style={{ fontSize: "0.75rem", color: "#6B7280", whiteSpace: "nowrap", flexShrink: 0 }}
                  >
                    {matchingLineIndices.length > 0
                      ? `${safeMatchIndex + 1} of ${matchingLineIndices.length}`
                      : "No matches"}
                  </span>
                )}
                <button
                  onClick={() => goToMatch("prev")}
                  disabled={matchingLineIndices.length === 0}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: matchingLineIndices.length > 0 ? "pointer" : "default",
                    color: matchingLineIndices.length > 0 ? "#9CA3AF" : "#374151",
                    padding: "0.125rem",
                    display: "flex",
                    flexShrink: 0,
                  }}
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  onClick={() => goToMatch("next")}
                  disabled={matchingLineIndices.length === 0}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: matchingLineIndices.length > 0 ? "pointer" : "default",
                    color: matchingLineIndices.length > 0 ? "#9CA3AF" : "#374151",
                    padding: "0.125rem",
                    display: "flex",
                    flexShrink: 0,
                  }}
                >
                  <ArrowDown size={14} />
                </button>
                <button
                  onClick={() => {
                    setShowSearch(false);
                    setSearchTerm("");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#6B7280",
                    padding: "0.125rem",
                    display: "flex",
                    flexShrink: 0,
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Code viewer — scrollable independently */}
            <div
              ref={codeRef}
              style={{
                flex: 1,
                overflowY: "auto",
                overflowX: "auto",
                background: "#0D1117",
                paddingTop: "0.5rem",
                paddingBottom: "2rem",
              }}
            >
              {tokenizedLines.map((tokens, idx) => {
                const isMatch =
                  searchTerm.trim().length > 0 && matchingLineIndices.includes(idx);
                const isActiveMatch =
                  matchingLineIndices.length > 0 &&
                  matchingLineIndices[safeMatchIndex] === idx;
                return (
                  <div key={idx} data-line-index={idx}>
                    <CodeLine
                      lineNumber={idx + 1}
                      tokens={tokens}
                      isMatch={isMatch}
                      isActiveMatch={isActiveMatch}
                      searchTerm={searchTerm}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
