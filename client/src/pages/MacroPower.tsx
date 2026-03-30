import { useState } from "react";
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
          className={`h-2 w-3.5 rounded-sm ${i < score
            ? score >= 4 ? "bg-emerald-400" : score >= 3 ? "bg-amber-400" : "bg-red-400"
            : "bg-muted"}`}
        />
      ))}
    </div>
  );
}

function LiveNewsFeed({ rtoId }: { rtoId: string }) {
  const { data, isLoading, isError, refetch, isFetching } = useQuery<LiveNewsItem[]>({
    queryKey: ["/api/regulatory/news", rtoId],
    queryFn: () => apiRequest("GET", `/api/regulatory/news?rto=${rtoId}`).then((r) => r.json()),
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
          data-testid={`refresh-news-${rtoId}`}
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
      data-testid={`rto-card-${rto.id}`}
      onClick={onClick}
      className={`w-full text-left p-3 rounded-lg border transition-all duration-150 ${
        isSelected
          ? "border-primary/50 bg-primary/5 ring-1 ring-primary/20"
          : "border-border bg-card hover:border-border/80 hover:bg-card/80"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <div className="text-base font-bold text-foreground leading-none">{rto.name}</div>
          <div className="text-[10px] text-muted-foreground mt-1 leading-tight">{rto.region}</div>
        </div>
        <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded border text-[9px] font-medium ${cfg.bg} ${cfg.border} ${cfg.color}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
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
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-medium ${cfg.bg} ${cfg.border} ${cfg.color}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
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
            data-testid={`docket-link-${rto.id}`}
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
      <div className={`rounded-lg p-3 border ${cfg.bg} ${cfg.border}`}>
        <div className="flex items-center gap-1.5 mb-1">
          <Calendar size={11} className={cfg.color} />
          <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Next Milestone</span>
        </div>
        <p className={`text-sm font-medium ${cfg.color}`}>{rto.nextMilestone}</p>
      </div>

      {/* Key Rulings */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide mb-3">Key Rulings & Filings</h3>
        <div className="space-y-3">
          {rto.keyRulings.map((ruling, i) => (
            <div key={i} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className={`w-2 h-2 rounded-full mt-1 shrink-0 ${cfg.dot}`} />
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
