import { useState } from "react";
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
                  data-testid={`theme-${theme.id}`}
                  onClick={() => selectTheme(theme.id)}
                  className={`group relative text-left rounded-xl border-2 p-4 transition-all duration-150 ${
                    isActive
                      ? "border-primary ring-1 ring-primary/30"
                      : "border-border hover:border-border/80"
                  }`}
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

                  {/* Bloomberg TERMINAL badge */}
                  {theme.id === "bloomberg" && !isActive && (
                    <div
                      className="absolute top-3 right-3 px-1.5 py-0.5 rounded text-[9px] font-bold tracking-widest"
                      style={{ background: "rgba(255,102,0,0.18)", color: "#FF6600", fontFamily: "'Courier New', monospace", border: "1px solid rgba(255,102,0,0.4)" }}
                    >
                      TERMINAL
                    </div>
                  )}

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
