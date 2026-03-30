import { useQuery } from "@tanstack/react-query";
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
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0`} style={{ background: `${color}22`, border: `1px solid ${color}44` }}>
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
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
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
            <StatCard label="Total Projects" value={stats?.totalProjects ?? "—"} sub={`${stats?.btmProjectCount} with BTM generation`} icon={TrendingUp} color="#2196f3"
              tip={{ title: "Project Count Methodology", body: "Counts all data center and AI infrastructure projects with announced BTM generation components, co-location agreements, or dedicated on-site power arrangements. Includes announced, under-construction, and operational projects. Excludes utility-scale data centers with no on-site generation component.", sources: [{ label: "Manually curated from public announcements", url: "https://www.datacenterdynamics.com" }, { label: "Updated weekly via Saturday research sweep" }] }} />
            <StatCard label="Total Capacity" value={`${((stats?.totalCapacityMw ?? 0) / 1000).toFixed(1)} GW`} sub="IT load across all projects" icon={Zap} color="#ffb300"
              tip={{ title: "IT Capacity Methodology", body: "Sum of announced IT load capacity (MW) across all tracked projects. Represents the compute load the data center is designed to serve — not the generation capacity powering it. For projects where IT load is undisclosed, BTM generation capacity is used as a proxy. Includes announced capacity whether or not the project has reached construction.", sources: [{ label: "Sourced from press releases and project filings" }] }} />
            <StatCard label="BTM Generation" value={`${(totalBtmMw / 1000).toFixed(1)} GW`} sub={`${stats?.offGridProjectCount} fully off-grid projects`} icon={WifiOff} color="#26c6a2"
              tip={{ title: "BTM Generation Methodology", body: "Sum of announced behind-the-meter (BTM) generation capacity across all tracked projects. BTM generation is power produced on the customer side of the utility meter — it either supplements or fully replaces grid power. Fully off-grid projects (100% BTM) are counted separately. Includes gas turbines, reciprocating engines, fuel cells, SMRs, and nuclear co-location.", sources: [{ label: "BTM definition: generation installed behind the meter per FERC/RTO rules" }, { label: "Includes both dedicated and hybrid BTM arrangements" }] }} />
            <StatCard label="Total Investment" value={`$${(stats?.totalInvestmentB ?? 0).toFixed(0)}B`} sub="Committed capital announced" icon={DollarSign} color="#ab47bc"
              tip={{ title: "Investment Methodology", body: "Sum of publicly announced committed capital across all tracked projects. Includes data center construction costs, on-site generation equipment, and infrastructure capex as stated in press releases or SEC filings. Where total project investment is undisclosed, only confirmed power generation capex is included. Figures are as-announced and may include equity + debt combined.", sources: [{ label: "Sourced from company press releases and SEC filings" }, { label: "Not adjusted for probability of completion" }] }} />
          </div>
        )}

        {/* Quick links */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { href: "/projects",    label: "Browse Projects",     sub: `${stats?.totalProjects ?? "–"} tracked`,        color: "#2196f3" },
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
    return mw >= 1000 ? `${(mw / 1000).toFixed(1)} GW` : `${mw} MW`;
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
          <Link href={`/projects/${latestProject.id}`}>
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
          <Link href={`/competitors/${latestNews.competitorId}`}>
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
    <Link href={`/projects/${p.id}`}>
      <div
        data-testid={`card-project-${p.id}`}
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
              <div className="tabular text-base font-bold text-foreground">{p.capacityMw >= 1000 ? `${(p.capacityMw / 1000).toFixed(1)} GW` : `${p.capacityMw} MW`}</div>
              <div className="text-[10px] text-muted-foreground">IT Capacity</div>
            </div>
          )}
          {p.hasBtm && p.btmCapacityMw && (
            <>
              <div className="w-px h-6 bg-border" />
              <div className="text-center">
                <div className="tabular text-base font-bold text-accent">{p.btmCapacityMw >= 1000 ? `${(p.btmCapacityMw / 1000).toFixed(1)} GW` : `${p.btmCapacityMw} MW`}</div>
                <div className="text-[10px] text-muted-foreground">BTM Generation</div>
              </div>
            </>
          )}
          {p.totalInvestmentB && (
            <>
              <div className="w-px h-6 bg-border" />
              <div className="text-center">
                <div className="tabular text-base font-bold text-foreground">${p.totalInvestmentB}B</div>
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
            Vendors: {vendors.slice(0, 3).join(" · ")}{vendors.length > 3 ? ` +${vendors.length - 3}` : ""}
          </div>
        )}
      </div>
    </Link>
  );
}
