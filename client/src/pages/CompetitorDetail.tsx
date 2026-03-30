import { useQuery } from "@tanstack/react-query";
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
  if (mw >= 1000) return `${(mw / 1000).toFixed(1)} GW`;
  return `${mw} MW`;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function NewsCard({ item }: { item: NewsItem }) {
  return (
    <div
      data-testid={`news-item-${item.id}`}
      className="border border-border rounded-lg p-4 bg-card hover:border-border/80 transition-colors"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          {item.category && (
            <span className={`inline-flex text-[9px] font-medium px-1.5 py-0.5 rounded border uppercase tracking-wide ${CATEGORY_COLORS[item.category] ?? CATEGORY_COLORS.other}`}>
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
            data-testid={`news-link-${item.id}`}
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
    queryFn: () => apiRequest("GET", `/api/competitors/${id}`).then((r) => r.json()),
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
                    <a href={`https://perplexity.ai/finance/${data.ticker}`} target="_blank" rel="noopener noreferrer"
                      className="ml-auto flex items-center gap-1 text-[10px] text-primary hover:underline">
                      {data.ticker} <ExternalLink size={9} />
                    </a>
                  )}
                  {data.finsUpdatedDate && <span className="text-[10px] text-muted-foreground">as of {data.finsUpdatedDate}</span>}
                </div>
                <div className="grid grid-cols-4 gap-3 mb-3">
                  {[
                    { label: 'Stock Price', value: data.stockPrice ? `$${data.stockPrice.toFixed(2)}` : '—' },
                    { label: 'Market Cap', value: data.marketCapB ? `$${data.marketCapB.toFixed(1)}B` : '—' },
                    { label: 'P/E Ratio', value: data.peRatio ? `${data.peRatio.toFixed(1)}x` : 'N/A' },
                    { label: 'TTM Revenue', value: data.revenueTtmM ? `$${(data.revenueTtmM/1000).toFixed(1)}B` : '—' },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-muted/30 rounded px-2.5 py-2">
                      <div className="text-[9px] text-muted-foreground uppercase tracking-wide mb-0.5">{label}</div>
                      <div className="text-sm font-bold text-foreground">{value}</div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: 'TTM EBITDA', value: data.ebitdaTtmM ? `$${(data.ebitdaTtmM/1000).toFixed(1)}B` : '—', color: (data.ebitdaTtmM ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400' },
                    { label: 'TTM Net Income', value: data.netIncomeTtmM ? `$${(data.netIncomeTtmM/1000).toFixed(2)}B` : '—', color: (data.netIncomeTtmM ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400' },
                    { label: 'TTM FCF', value: data.fcfTtmM ? `$${(data.fcfTtmM/1000).toFixed(2)}B` : '—', color: (data.fcfTtmM ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400' },
                    { label: '52-Wk Range', value: data.yearLow && data.yearHigh ? `$${data.yearLow}–$${data.yearHigh}` : '—', color: 'text-foreground' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="bg-muted/30 rounded px-2.5 py-2">
                      <div className="text-[9px] text-muted-foreground uppercase tracking-wide mb-0.5">{label}</div>
                      <div className={`text-sm font-bold ${color}`}>{value}</div>
                    </div>
                  ))}
                </div>
                {/* 52-week price bar */}
                {data.yearLow && data.yearHigh && data.stockPrice && (
                  <div className="mt-3">
                    <div className="flex justify-between text-[9px] text-muted-foreground mb-1">
                      <span>52-week low ${data.yearLow}</span>
                      <span>Current ${data.stockPrice.toFixed(2)}</span>
                      <span>High ${data.yearHigh}</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${Math.min(100, ((data.stockPrice - data.yearLow) / (data.yearHigh - data.yearLow)) * 100)}%` }} />
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
