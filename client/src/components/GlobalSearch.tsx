import { useState, useRef, useEffect, useCallback } from "react";
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
  if (mw >= 1000) return `${(mw / 1000).toFixed(1)} GW`;
  return `${mw} MW`;
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
      const r = await apiRequest("GET", `/api/search?q=${encodeURIComponent(q)}`);
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
      <div className={`flex items-center gap-2 px-2.5 py-2 rounded-md border transition-colors ${open ? "border-primary/50 bg-background" : "border-border bg-muted/40"}`}>
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
                      data-testid={`search-result-project-${p.id}`}
                      onClick={() => go(`/projects/${p.id}`)}
                      className="w-full text-left px-3 py-2 hover:bg-muted/50 flex items-center justify-between gap-2 border-b border-border/40 last:border-0"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-foreground truncate">{p.name}</div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <MapPin size={9} className="text-muted-foreground shrink-0" />
                          <span className="text-[10px] text-muted-foreground truncate">{p.location}{p.state ? `, ${p.state}` : ""}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {p.capacityMw && <span className="text-[10px] text-muted-foreground">{formatMw(p.capacityMw)}</span>}
                        <span className={`text-[9px] font-medium ${STATUS_COLORS[p.status] ?? "text-muted-foreground"}`}>
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
                      data-testid={`search-result-company-${c.id}`}
                      onClick={() => go(`/companies/${c.id}`)}
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
                      data-testid={`search-result-competitor-${c.id}`}
                      onClick={() => go(`/competitors/${c.id}`)}
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
                      data-testid={`search-result-news-${n.id}`}
                      onClick={() => go(`/competitors/${n.competitorId}`)}
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
