import { useQuery } from "@tanstack/react-query";
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
  if (days <= 7) return `${days}d ago`;
  if (days <= 30) return `${Math.floor(days / 7)}w ago`;
  if (days <= 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

// ── Single news card ───────────────────────────────────────────────────────────
function NewsCard({ item, accent }: { item: NewsItem; accent: string }) {
  return (
    <div className="border-b border-border/50 px-3 py-3 hover:bg-muted/20 transition-colors group">
      {/* Meta row */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          {item.category && item.category !== "announcement" && (
            <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded border uppercase tracking-wide ${CAT_COLORS[item.category] ?? CAT_COLORS.other}`}>
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
            style={{ background: col.accent + "20", border: `1px solid ${col.accent}40` }}>
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

  // Fetch live news_articles from DB (seeded by start.cjs on each Render deploy)
  const { data: dbNewsRaw } = useQuery({
    queryKey: ["/api/news"],
    queryFn: () => apiRequest("GET", "/api/news").then(r => r.json()),
  });

  // Include competitor IDs in the queryKey so this refires once competitors load
  const competitorIds = competitors ? (competitors as any[]).map((c: any) => c.id).join(",") : "";
  const { data: allCompNewsRaw } = useQuery({
    queryKey: ["/api/all-competitor-news", competitorIds],
    queryFn: async () => {
      if (!competitors || !(competitors as any[]).length) return [];
      const results = await Promise.all(
        (competitors as any[]).map((c: any) =>
          apiRequest("GET", `/api/competitors/${c.id}`).then(r => r.json()).then((d: any) =>
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
          ? ` · ${p.btmCapacityMw >= 1000 ? (p.btmCapacityMw / 1000).toFixed(1) + " GW" : p.btmCapacityMw + " MW"} BTM`
          : "";
        const invStr = p.totalInvestmentB ? ` · $${p.totalInvestmentB}B` : "";
        map.projects.push({
          id: `proj-${p.id}`,
          tab: "projects",
          date: p.announcedDate,
          headline: p.name,
          summary: `${p.location ?? ""}${btmStr}${invStr}${p.notes ? " — " + p.notes.slice(0, 100) : ""}`,
          category: "announcement",
          url: p.sourceUrl ?? undefined,
          linkTo: `/projects/${p.id}`,
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
          id: `comp-${n.id}`,
          tab,
          date: n.publishedDate ?? "",
          headline: n.headline,
          summary: n.summary ?? "",
          category: cat,
          url: n.url ?? undefined,
          linkTo: `/competitors/${n.competitorId}`,
          linkLabel: "View competitor",
          badge: n.competitorName,
        });
      }
    }

    // ── DB news_articles (live seed, refreshed on each Render deploy) ────────
    if (dbNewsRaw && Array.isArray(dbNewsRaw)) {
      for (const n of dbNewsRaw) {
        const tab = n.tab as NewsItem["tab"];
        if (!map[tab]) continue;
        map[tab].push({
          id: `db-${n.id}`,
          tab,
          date: n.published_date ?? "",
          headline: n.headline ?? "",
          summary: n.summary ?? "",
          category: n.category ?? "other",
          url: n.url ?? undefined,
        });
      }
    }

    // ── Financing static items ────────────────────────────────────────────────
    FINANCING_ITEMS_STATIC.forEach((item, i) =>
      map.financing.push({ id: `fin-static-${i}`, ...item })
    );

    // ── Sentiment static items ────────────────────────────────────────────────
    SENTIMENT_ITEMS_STATIC.forEach((item, i) =>
      map.sentiment.push({ id: `sent-static-${i}`, ...item })
    );

    // ── Regulatory static items ───────────────────────────────────────────────
    REGULATORY_ITEMS.forEach((item, i) =>
      map.regulatory.push({ id: `reg-static-${i}`, ...item })
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
  }, [projects, allCompNewsRaw, dbNewsRaw]);

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
