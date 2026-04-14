import { Link, useLocation } from "wouter";
import { Building2, Zap, Home, Swords, Activity, Map, Newspaper, ListOrdered, Settings2, Code2, GitBranch, DollarSign } from "lucide-react";
import { PerplexityAttribution } from "@/components/PerplexityAttribution";
import GlobalSearch from "@/components/GlobalSearch";
import { getStoredTheme } from "@/lib/themes";
import { useState, useEffect } from "react";

const navItems = [
  { href: "/",            label: "Overview",        short: "OVRVW",  key: "F1",  icon: Home        },
  { href: "/news",        label: "News",            short: "NEWS",   key: "F2",  icon: Newspaper   },
  { href: "/projects",    label: "Projects",        short: "PROJ",   key: "F3",  icon: Zap         },
  { href: "/companies",   label: "Companies",       short: "CO",     key: "F4",  icon: Building2   },
  { href: "/competitors", label: "Competitors",     short: "COMP",   key: "F5",  icon: Swords      },
  { href: "/queue",       label: "Queue Intel",     short: "QUEUE",  key: "F6",  icon: ListOrdered },
  { href: "/macro",       label: "Federal / RTO",   short: "RTO",    key: "F7",  icon: Activity    },
  { href: "/map",         label: "Map",             short: "MAP",    key: "F8",  icon: Map         },
  { href: "/midstream",   label: "Midstream",        short: "MIDS",   key: "F9",  icon: GitBranch   },
  { href: "/financing",  label: "Financing",        short: "FIN",    key: "F11", icon: DollarSign  },
  { href: "/dev",         label: "Dev Backend — CS",short: "DEV",   key: "F10", icon: Code2       },
];

// Bloomberg-style sidebar nav item
function BloombergNavItem({ href, label, short, fkey, icon: Icon, active }: {
  href: string; label: string; short: string; fkey: string;
  icon: React.ElementType; active: boolean;
}) {
  return (
    <Link href={href}>
      <a style={{
        display: "flex",
        alignItems: "center",
        gap: 0,
        padding: "0",
        cursor: "pointer",
        borderLeft: active ? "3px solid #FF6600" : "3px solid transparent",
        background: active ? "rgba(255,102,0,0.10)" : "transparent",
        textDecoration: "none",
        userSelect: "none",
      }}>
        {/* Function key label */}
        <span style={{
          display: "inline-block",
          width: "34px",
          minWidth: "34px",
          padding: "5px 4px",
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: "9px",
          fontWeight: 700,
          letterSpacing: "0.04em",
          color: active ? "#FF6600" : "#555",
          background: active ? "rgba(255,102,0,0.08)" : "#0a0a0a",
          borderRight: "1px solid #222",
          textAlign: "center",
          lineHeight: "1",
        }}>
          {fkey}
        </span>
        {/* Label */}
        <span style={{
          flex: 1,
          padding: "5px 8px",
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: "11px",
          fontWeight: active ? 700 : 400,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: active ? "#FF6600" : "#aaa",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}>
          {short}
        </span>
      </a>
    </Link>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [theme, setTheme] = useState(getStoredTheme());

  // Re-check theme on each render (theme changes update the module variable)
  useEffect(() => {
    const check = () => setTheme(getStoredTheme());
    check();
    // Poll every 500ms — lightweight, theme changes are infrequent
    const id = setInterval(check, 500);
    return () => clearInterval(id);
  }, []);

  const isBloomberg = theme === "bloomberg";

  if (isBloomberg) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#000", overflow: "hidden" }}>
        {/* Bloomberg top bar */}
        <div style={{
          height: "28px",
          minHeight: "28px",
          background: "#0a0a0a",
          borderBottom: "1px solid #FF6600",
          display: "flex",
          alignItems: "center",
          padding: "0 12px",
          gap: "16px",
          flexShrink: 0,
        }}>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", fontWeight: 700, color: "#FF6600", letterSpacing: "0.12em" }}>
            DC INTEL
          </span>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "#555", letterSpacing: "0.06em" }}>
            BTM GENERATION TRACKER
          </span>
          <span style={{ marginLeft: "auto", fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "#555", letterSpacing: "0.04em" }}>
            {new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            {" · "}
            {new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }).toUpperCase()}
          </span>
          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#00FF41", display: "inline-block" }} />
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "#00FF41", letterSpacing: "0.04em" }}>LIVE</span>
        </div>

        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* Bloomberg sidebar */}
          <aside style={{
            width: "160px",
            minWidth: "160px",
            background: "#000",
            borderRight: "1px solid #333",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}>
            {/* Search */}
            <div style={{ padding: "4px 0", borderBottom: "1px solid #222" }}>
              <GlobalSearch />
            </div>

            {/* Nav items */}
            <nav style={{ flex: 1, overflowY: "auto", paddingTop: "4px" }}>
              {navItems.map(({ href, label, short, key, icon }) => {
                const active = href === "/" ? location === "/" : location.startsWith(href);
                return (
                  <BloombergNavItem
                    key={href}
                    href={href}
                    label={label}
                    short={short}
                    fkey={key}
                    icon={icon}
                    active={active}
                  />
                );
              })}
            </nav>

            {/* Settings + footer */}
            <div style={{ borderTop: "1px solid #333", padding: "4px 0" }}>
              <Link href="/settings">
                <a style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0,
                  cursor: "pointer",
                  borderLeft: location.startsWith("/settings") ? "3px solid #FF6600" : "3px solid transparent",
                  background: location.startsWith("/settings") ? "rgba(255,102,0,0.10)" : "transparent",
                  textDecoration: "none",
                }}>
                  <span style={{
                    display: "inline-block",
                    width: "34px",
                    minWidth: "34px",
                    padding: "5px 4px",
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: "9px",
                    fontWeight: 700,
                    color: location.startsWith("/settings") ? "#FF6600" : "#555",
                    background: "#0a0a0a",
                    borderRight: "1px solid #222",
                    textAlign: "center",
                  }}>F12</span>
                  <span style={{
                    padding: "5px 8px",
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: "11px",
                    fontWeight: location.startsWith("/settings") ? 700 : 400,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: location.startsWith("/settings") ? "#FF6600" : "#aaa",
                  }}>SET</span>
                </a>
              </Link>
              <div style={{ padding: "4px 8px" }}>
                <PerplexityAttribution />
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main style={{ flex: 1, overflowY: "auto", background: "#000" }}>
            {children}
          </main>
        </div>
      </div>
    );
  }

  // ── Default (non-Bloomberg) layout ──────────────────────────────────────────
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
        <nav className="flex-1 px-2 py-1 space-y-0.5 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? location === "/" : location.startsWith(href);
            return (
              <Link key={href} href={href}>
                <a className={`sidebar-item flex items-center gap-2.5 px-3 py-2 rounded-md text-sm cursor-pointer ${active ? "active text-primary" : "text-muted-foreground"}`}>
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
            <a className={`sidebar-item flex items-center gap-2.5 px-3 py-2 rounded-md text-sm cursor-pointer ${
              location.startsWith('/settings') ? 'active text-primary' : 'text-muted-foreground'
            }`}>
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
