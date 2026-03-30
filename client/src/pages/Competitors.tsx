import { useQuery } from "@tanstack/react-query";
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
  if (mw >= 1000) return `${(mw / 1000).toFixed(1)} GW`;
  return `${mw} MW`;
}

function CompetitorCard({ c }: { c: CompetitorSummary }) {
  const latestItem = c.latestNews?.[0];
  const isPublic = c.isPublic === 1;

  return (
    <Link href={`/competitors/${c.id}`}>
      <a
        data-testid={`card-competitor-${c.id}`}
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
                <span className={`inline-flex items-center text-[9px] font-medium px-1.5 py-0.5 rounded border uppercase tracking-wide shrink-0 mt-0.5 ${CATEGORY_COLORS[latestItem.category] ?? CATEGORY_COLORS.other}`}>
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
