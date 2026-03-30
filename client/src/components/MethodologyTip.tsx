import { useState, useRef, useEffect } from "react";
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
        className={`rounded-full transition-colors flex items-center justify-center shrink-0
          ${open
            ? "text-primary bg-primary/15"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
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
