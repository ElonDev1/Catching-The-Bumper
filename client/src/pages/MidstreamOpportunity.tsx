import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import Layout from "@/components/Layout";
import { Skeleton } from "@/components/ui/skeleton";
import MethodologyTip from "@/components/MethodologyTip";
import {
  GitBranch, ExternalLink, CheckCircle2, Link2, AlertTriangle,
  ChevronDown, ChevronUp, Zap, TrendingUp, Activity, Info, Clock,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

interface Pipeline {
  id: number;
  name: string;
  operator: string | null;
  ferc_docket: string | null;
  ferc_cid: string | null;
  capacity_bcfd: number | null;
  capacity_notes: string | null;
  utilization_status: string | null;
  utilization_pct: number | null;
  route_description: string | null;
  grady_county_present: number;
  iron_horse_connected: number;
  is_interstate: number;
  tariff_url: string | null;
  ioc_url: string | null;
  latest_549b_quarter: string | null;
  notes: string | null;
  shippers?: Shipper[];
  signals?: Signal[];
}

interface Shipper {
  id: number;
  pipeline_id: number;
  shipper_name: string;
  mdq_dth_d: number | null;
  rate_schedule: string | null;
  receipt_point: string | null;
  delivery_point: string | null;
  zone: string | null;
  is_competitor: number;
  notes: string | null;
  source_quarter: string | null;
  source_url: string | null;
}

interface Signal {
  id: number;
  pipeline_id: number;
  pipeline_name?: string;
  pipeline_operator?: string;
  signal_type: string;
  title: string;
  summary: string | null;
  date: string | null;
  url: string | null;
  urgency: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmtMdq(val: number | null | undefined): string {
  if (!val) return "—";
  if (val >= 1000000) return `${(val / 1000000).toFixed(2)} Bcf/d`;
  if (val >= 1000) return `${(val / 1000).toFixed(0)} MDth/d`;
  return `${val} Dth/d`;
}

function fmtDate(d: string | null): string {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return d;
  }
}

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  fully_subscribed: { label: "FULLY SUBSCRIBED", color: "#ef4444", bg: "rgba(239,68,68,0.10)", border: "rgba(239,68,68,0.30)" },
  tight:            { label: "TIGHT",            color: "#f59e0b", bg: "rgba(245,158,11,0.10)", border: "rgba(245,158,11,0.30)" },
  available:        { label: "AVAILABLE",        color: "#10b981", bg: "rgba(16,185,129,0.10)", border: "rgba(16,185,129,0.30)" },
  unknown:          { label: "UNKNOWN",          color: "#6b7280", bg: "rgba(107,114,128,0.10)", border: "rgba(107,114,128,0.30)" },
};

const SIGNAL_CFG: Record<string, { label: string; color: string; bg: string }> = {
  open_season:        { label: "OPEN SEASON",       color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
  expansion:          { label: "EXPANSION",         color: "#8b5cf6", bg: "rgba(139,92,246,0.12)" },
  btm_opportunity:    { label: "BTM OPPORTUNITY",   color: "#10b981", bg: "rgba(16,185,129,0.12)" },
  competitor_activity:{ label: "COMPETITOR",        color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  capacity_release:   { label: "CAPACITY RELEASE",  color: "#a855f7", bg: "rgba(168,85,247,0.12)" },
};

// ── Signal Card (top strip) ──────────────────────────────────────────────────

function SignalCard({ sig }: { sig: Signal }) {
  const cfg = SIGNAL_CFG[sig.signal_type] ?? SIGNAL_CFG.expansion;
  const isUrgent = sig.urgency === "urgent";

  return (
    <div
      className="shrink-0 w-64 bg-card border border-border rounded-lg p-3 flex flex-col gap-1.5 cursor-default hover:border-primary/40 transition-colors"
      style={{ borderTop: `3px solid ${cfg.color}` }}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className="text-[9px] font-bold tracking-wide px-1.5 py-0.5 rounded"
          style={{ color: cfg.color, background: cfg.bg }}
        >
          {cfg.label}
        </span>
        {isUrgent && (
          <span className="flex items-center gap-1 text-[9px] text-amber-400">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse inline-block" />
            URGENT
          </span>
        )}
      </div>

      {sig.pipeline_name && (
        <div className="text-[10px] text-muted-foreground font-medium truncate">{sig.pipeline_name}</div>
      )}

      <div className="text-xs font-semibold text-foreground leading-tight line-clamp-2">{sig.title}</div>

      <div className="flex items-center justify-between mt-auto pt-1">
        <span className="text-[10px] text-muted-foreground">{fmtDate(sig.date)}</span>
        {sig.url && (
          <a
            href={sig.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/70 transition-colors"
            onClick={e => e.stopPropagation()}
          >
            <ExternalLink size={11} />
          </a>
        )}
      </div>
    </div>
  );
}

// ── Inline expanded pipeline detail ─────────────────────────────────────────

function PipelineDetail({ pipeline }: { pipeline: Pipeline }) {
  const { data, isLoading } = useQuery<Pipeline>({
    queryKey: [`/api/midstream/pipelines/${pipeline.id}`],
    queryFn: () => apiRequest("GET", `/api/midstream/pipelines/${pipeline.id}`).then(r => r.json()),
  });

  const shippers = data?.shippers ?? [];
  const signals = data?.signals ?? [];
  const maxMdq = Math.max(...shippers.filter(s => s.mdq_dth_d).map(s => s.mdq_dth_d!), 1);

  if (isLoading) {
    return (
      <tr>
        <td colSpan={7} className="px-4 py-3">
          <Skeleton className="h-24 w-full rounded-lg" />
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td colSpan={7} className="px-0 py-0">
        <div className="bg-muted/20 border-t border-b border-border/60 px-6 py-4 space-y-4">
          {/* Route + notes */}
          <div className="grid grid-cols-2 gap-4">
            {pipeline.route_description && (
              <div>
                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Route</div>
                <p className="text-xs text-foreground leading-relaxed">{pipeline.route_description}</p>
              </div>
            )}
            {pipeline.notes && (
              <div>
                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Notes</div>
                <p className="text-xs text-muted-foreground leading-relaxed">{pipeline.notes}</p>
              </div>
            )}
          </div>

          {/* Shippers sub-table */}
          {shippers.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
                Firm Shippers
                <MethodologyTip
                  size="xs"
                  title="Firm Shipper Data"
                  body="Shippers holding firm transportation agreements (FT) are required to be disclosed under FERC Form 549B. MDQ = Maximum Daily Quantity — the contracted daily capacity reservation in Dekatherms/day. Data sourced from quarterly IOC postings. Not all pipelines are current — MIDSHIP portal is offline post-acquisition."
                  sources={[{ label: "FERC Form 549B Repository", url: "https://www.ferc.gov/industries-data/natural-gas/industry-forms/form-549b-index-customers" }]}
                />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border/40">
                      <th className="text-left py-1.5 pr-3 text-muted-foreground font-medium">Shipper</th>
                      <th className="text-right py-1.5 px-3 text-muted-foreground font-medium">MDQ</th>
                      <th className="text-left py-1.5 px-3 text-muted-foreground font-medium">Zone</th>
                      <th className="text-left py-1.5 px-3 text-muted-foreground font-medium">Receipt → Delivery</th>
                      <th className="text-left py-1.5 pl-3 text-muted-foreground font-medium">Quarter</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shippers.map(s => (
                      <tr
                        key={s.id}
                        className={`border-b border-border/20 ${s.is_competitor ? "bg-amber-500/5 border-l-2 border-l-amber-500/50" : ""}`}
                      >
                        <td className="py-2 pr-3">
                          <div className="flex items-center gap-1.5">
                            <span className={`font-medium ${s.is_competitor ? "text-amber-400" : "text-foreground"}`}>
                              {s.shipper_name}
                            </span>
                            {s.is_competitor === 1 && (
                              <span className="text-[8px] font-bold px-1 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                                COMPETITOR
                              </span>
                            )}
                          </div>
                          {s.notes && <div className="text-[10px] text-muted-foreground mt-0.5">{s.notes}</div>}
                        </td>
                        <td className="py-2 px-3 text-right tabular-nums">
                          <div className="flex flex-col items-end gap-0.5">
                            <span className={`font-semibold ${s.is_competitor ? "text-amber-400" : "text-foreground"}`}>
                              {fmtMdq(s.mdq_dth_d)}
                            </span>
                            {s.mdq_dth_d && (
                              <div className="w-20 h-1.5 bg-muted/40 rounded overflow-hidden">
                                <div
                                  className="h-full rounded"
                                  style={{
                                    width: `${Math.min(100, (s.mdq_dth_d / maxMdq) * 100)}%`,
                                    background: s.is_competitor ? "#f59e0b" : "var(--color-primary)",
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-2 px-3 text-muted-foreground">{s.zone ?? "—"}</td>
                        <td className="py-2 px-3 text-muted-foreground text-[10px]">
                          {[s.receipt_point, s.delivery_point].filter(Boolean).join(" → ") || "—"}
                        </td>
                        <td className="py-2 pl-3 text-muted-foreground">{s.source_quarter ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Signals for this pipeline */}
          {signals.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Signals</div>
              <div className="space-y-2">
                {signals.map(sig => {
                  const cfg = SIGNAL_CFG[sig.signal_type] ?? SIGNAL_CFG.expansion;
                  return (
                    <div key={sig.id} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-muted/20 border border-border/40">
                      <span
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 mt-0.5"
                        style={{ color: cfg.color, background: cfg.bg }}
                      >
                        {cfg.label}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-foreground">{sig.title}</div>
                        {sig.summary && (
                          <p className="text-[10px] text-muted-foreground leading-relaxed mt-0.5 line-clamp-2">{sig.summary}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-muted-foreground">{fmtDate(sig.date)}</span>
                          {sig.url && (
                            <a href={sig.url} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-0.5 text-[10px] text-primary hover:underline">
                              Source <ExternalLink size={9} />
                            </a>
                          )}
                          {sig.urgency === "urgent" && (
                            <span className="flex items-center gap-1 text-[9px] text-amber-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse inline-block" />
                              URGENT
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}

// ── Pipeline Table Row ───────────────────────────────────────────────────────

function PipelineRow({ pipeline, expanded, onToggle }: {
  pipeline: Pipeline;
  expanded: boolean;
  onToggle: () => void;
}) {
  const statusCfg = STATUS_CFG[pipeline.utilization_status ?? "unknown"] ?? STATUS_CFG.unknown;

  return (
    <>
      <tr
        className="border-b border-border/40 hover:bg-muted/20 transition-colors cursor-pointer"
        onClick={onToggle}
      >
        {/* Pipeline name */}
        <td className="py-3 pl-4 pr-3">
          <div className="flex items-center gap-2">
            {expanded
              ? <ChevronUp size={12} className="text-muted-foreground shrink-0" />
              : <ChevronDown size={12} className="text-muted-foreground shrink-0" />}
            <div>
              <div className="text-xs font-semibold text-foreground">{pipeline.name}</div>
              <div className="text-[10px] text-muted-foreground">{pipeline.operator}</div>
            </div>
          </div>
        </td>

        {/* Capacity */}
        <td className="py-3 px-3 text-right">
          <div className="text-xs font-semibold text-foreground tabular-nums">
            {pipeline.capacity_bcfd != null ? `${pipeline.capacity_bcfd} Bcf/d` : "—"}
          </div>
          {pipeline.is_interstate === 0 && (
            <div className="text-[9px] text-muted-foreground">Intrastate</div>
          )}
        </td>

        {/* Status */}
        <td className="py-3 px-3">
          <span
            className="text-[9px] font-bold px-2 py-0.5 rounded border"
            style={{ color: statusCfg.color, background: statusCfg.bg, borderColor: statusCfg.border }}
          >
            {statusCfg.label}
          </span>
          {pipeline.utilization_pct != null && (
            <div className="text-[10px] text-muted-foreground mt-0.5">{pipeline.utilization_pct}%</div>
          )}
        </td>

        {/* Grady Co. */}
        <td className="py-3 px-3 text-center">
          {pipeline.grady_county_present === 1
            ? <CheckCircle2 size={13} className="text-emerald-400 inline" />
            : <span className="text-muted-foreground text-xs">—</span>}
        </td>

        {/* Iron Horse link */}
        <td className="py-3 px-3 text-center">
          {pipeline.iron_horse_connected === 1
            ? <span title="Connected to Iron Horse Midstream"><Link2 size={13} className="text-primary inline" /></span>
            : <span className="text-muted-foreground text-xs">—</span>}
        </td>

        {/* 549B quarter */}
        <td className="py-3 px-3">
          <span className="text-[10px] text-muted-foreground">
            {pipeline.latest_549b_quarter ?? (pipeline.is_interstate === 0 ? "N/A — Intrastate" : "—")}
          </span>
        </td>

        {/* Actions */}
        <td className="py-3 pl-3 pr-4">
          <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
            {pipeline.ioc_url && (
              <a
                href={pipeline.ioc_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline"
                title="IOC / 549B Portal"
              >
                549B <ExternalLink size={9} />
              </a>
            )}
            {pipeline.tariff_url && pipeline.tariff_url !== pipeline.ioc_url && (
              <a
                href={pipeline.tariff_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground hover:underline"
                title="Tariff / Portal"
              >
                Tariff <ExternalLink size={9} />
              </a>
            )}
          </div>
        </td>
      </tr>
      {expanded && <PipelineDetail pipeline={pipeline} />}
    </>
  );
}

// ── Shipper Intelligence Panel ───────────────────────────────────────────────

function ShipperPanel({ pipelines }: { pipelines: Pipeline[] }) {
  const allShippers = pipelines.flatMap(p =>
    (p.shippers ?? []).map(s => ({ ...s, _pipelineName: p.name, _capacityBcfd: p.capacity_bcfd }))
  );

  const byPipeline = pipelines.map(p => ({
    pipeline: p,
    shippers: allShippers.filter(s => s.pipeline_id === p.id),
  })).filter(g => g.shippers.length > 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-semibold text-foreground">Firm Shippers</h2>
        <MethodologyTip
          title="FERC Form 549B — Shipper Disclosure"
          body="FERC Form 549B requires interstate natural gas pipelines to publicly disclose all firm shippers (companies with firm transportation agreements) quarterly. Shippers, MDQ amounts, rate schedules, and receipt/delivery points are all required fields. Intrastate pipelines like Iron Horse are NOT subject to Form 549B. Data lags ~2 quarters from the reporting period."
          sources={[
            { label: "FERC 549B Index", url: "https://www.ferc.gov/industries-data/natural-gas/industry-forms/form-549b-index-customers" },
          ]}
        />
      </div>

      {byPipeline.map(({ pipeline, shippers }) => {
        const maxMdq = Math.max(...shippers.filter(s => s.mdq_dth_d).map(s => s.mdq_dth_d!), 1);
        const capacityDthd = (pipeline.capacity_bcfd ?? 0) * 1_000_000; // Bcf/d → Dth/d

        return (
          <div key={pipeline.id} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-xs font-semibold text-foreground">{pipeline.name}</div>
                <div className="text-[10px] text-muted-foreground">{pipeline.operator}</div>
              </div>
              {pipeline.latest_549b_quarter && (
                <span className="text-[9px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border">
                  {pipeline.latest_549b_quarter}
                </span>
              )}
            </div>

            <div className="space-y-2">
              {shippers
                .sort((a, b) => (b.mdq_dth_d ?? 0) - (a.mdq_dth_d ?? 0))
                .map(s => {
                  const pct = s.mdq_dth_d && maxMdq > 0
                    ? Math.min(100, (s.mdq_dth_d / maxMdq) * 100)
                    : 0;
                  const capacityPct = s.mdq_dth_d && capacityDthd > 0
                    ? ((s.mdq_dth_d / capacityDthd) * 100).toFixed(1)
                    : null;

                  return (
                    <div
                      key={s.id}
                      className={`p-2.5 rounded-lg ${
                        s.is_competitor
                          ? "border border-amber-500/30 bg-amber-500/5"
                          : "bg-muted/20 border border-border/40"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-xs font-semibold ${s.is_competitor ? "text-amber-400" : "text-foreground"}`}>
                            {s.shipper_name}
                          </span>
                          {s.is_competitor === 1 && (
                            <span className="text-[8px] font-bold px-1 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                              COMPETITOR
                            </span>
                          )}
                          {s.rate_schedule && (
                            <span className="text-[9px] text-muted-foreground bg-muted px-1 py-0.5 rounded">{s.rate_schedule}</span>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <div className={`text-xs font-bold tabular-nums ${s.is_competitor ? "text-amber-400" : "text-foreground"}`}>
                            {fmtMdq(s.mdq_dth_d)}
                          </div>
                          {capacityPct && (
                            <div className="text-[9px] text-muted-foreground">{capacityPct}% of cap.</div>
                          )}
                        </div>
                      </div>

                      {s.mdq_dth_d && (
                        <div className="h-1.5 bg-muted/40 rounded overflow-hidden mb-1">
                          <div
                            className="h-full rounded transition-all"
                            style={{
                              width: `${pct}%`,
                              background: s.is_competitor ? "#f59e0b" : "var(--color-primary)",
                            }}
                          />
                        </div>
                      )}

                      {(s.receipt_point || s.delivery_point || s.zone) && (
                        <div className="text-[10px] text-muted-foreground">
                          {[s.zone, s.receipt_point && `From: ${s.receipt_point}`, s.delivery_point && `To: ${s.delivery_point}`]
                            .filter(Boolean)
                            .join(" · ")}
                        </div>
                      )}

                      {s.notes && (
                        <div className="text-[10px] text-muted-foreground mt-0.5 italic">{s.notes}</div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        );
      })}

      {/* Data freshness note */}
      <div className="text-[10px] text-muted-foreground bg-muted/20 border border-border/40 rounded-lg px-3 py-2 leading-relaxed">
        <span className="text-amber-400 font-semibold">Data lag notice: </span>
        549B data lags ~2 quarters from reporting period. Direct TAB file downloads blocked by Cloudflare — access via pipeline portals. MIDSHIP portal offline after Howard Energy Partners acquisition (Feb 2025).
      </div>
    </div>
  );
}

// ── About This Data ──────────────────────────────────────────────────────────

function AboutDataCard() {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <Info size={13} className="text-muted-foreground" />
        <h2 className="text-sm font-semibold text-foreground">About This Data</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div>
          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">FERC Form 549B</div>
          <p className="text-muted-foreground leading-relaxed">
            FERC Form 549B is a quarterly mandatory filing for FERC-regulated interstate natural gas pipelines. It discloses all firm shippers, their Maximum Daily Quantity (MDQ), rate schedules, receipt/delivery points, and contract terms. Data is public and accessible via each pipeline's IOC portal or FERC's 549B repository.
          </p>
          <a href="https://www.ferc.gov/industries-data/natural-gas/industry-forms/form-549b-index-customers"
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline mt-1.5">
            FERC 549B Repository <ExternalLink size={9} />
          </a>
        </div>

        <div>
          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Iron Horse Midstream</div>
          <p className="text-muted-foreground leading-relaxed">
            Iron Horse Midstream is an intrastate gathering and processing system — it is NOT FERC-regulated and does not file Form 549B. The system has ~350 miles of gathering pipeline and 425 MMcf/d processing capacity (two cryogenic trains) across Grady, Canadian, McClain, Stephens, and Caddo counties. It connects to MIDSHIP, NGPL, EOIT (Energy Transfer), and Southern Star.
          </p>
          <a href="https://www.kirkland.com/news/press-release/2025/08/kirkland-advises-iron-horse-midstream-on-sale-to-sixth-street-partners"
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline mt-1.5">
            Sixth Street Acquisition (Aug 2025) <ExternalLink size={9} />
          </a>
        </div>

        <div>
          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Data Freshness</div>
          <div className="space-y-1.5 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock size={10} className="shrink-0" />
              <span>MIDSHIP / Southern Star: latest 549B Q2 2025</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={10} className="shrink-0" />
              <span>NGPL: latest 549B Q1 2026</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={10} className="shrink-0" />
              <span>Iron Horse: not FERC-regulated, no 549B</span>
            </div>
            <div className="mt-1.5">
              <a href="https://pipeline2.kindermorgan.com/IndexOfCust/IOC.aspx?code=NGPL"
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline">
                NGPL IOC Portal <ExternalLink size={9} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function MidstreamOpportunity() {
  const [expandedPipeline, setExpandedPipeline] = useState<number | null>(null);

  const { data: pipelines, isLoading: pipelinesLoading } = useQuery<Pipeline[]>({
    queryKey: ["/api/midstream/pipelines"],
    queryFn: () => apiRequest("GET", "/api/midstream/pipelines").then(r => r.json()),
  });

  const { data: signals, isLoading: signalsLoading } = useQuery<Signal[]>({
    queryKey: ["/api/midstream/signals"],
    queryFn: () => apiRequest("GET", "/api/midstream/signals").then(r => r.json()),
  });

  // Also fetch all pipeline details to populate the shipper panel
  const { data: pipelinesWithDetail } = useQuery<Pipeline[]>({
    queryKey: ["/api/midstream/pipelines-with-shippers"],
    queryFn: async () => {
      const base = await apiRequest("GET", "/api/midstream/pipelines").then(r => r.json()) as Pipeline[];
      const detailed = await Promise.all(
        base.map(p => apiRequest("GET", `/api/midstream/pipelines/${p.id}`).then(r => r.json()))
      );
      return detailed;
    },
    enabled: !pipelinesLoading && !!pipelines,
  });

  const urgentCount = (signals ?? []).filter(s => s.urgency === "urgent").length;

  return (
    <Layout>
      {/* Page header */}
      <div className="border-b border-border px-6 py-4 bg-card/50 sticky top-0 z-10 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <GitBranch size={15} className="text-primary" />
              <h1 className="text-lg font-bold text-foreground">Midstream Opportunity</h1>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              <span className="text-primary font-medium">Iron Horse Midstream / Grady County corridor</span>
              {" · "}Natural gas pipeline intelligence for BTM data center development in SCOOP/STACK play
            </p>
          </div>

          {!pipelinesLoading && (
            <div className="flex items-center gap-5 text-right">
              <div>
                <div className="text-lg font-bold text-foreground tabular-nums">{pipelines?.length ?? 0}</div>
                <div className="text-[10px] text-muted-foreground">pipelines tracked</div>
              </div>
              <div>
                <div className="text-lg font-bold text-amber-400 tabular-nums">{urgentCount}</div>
                <div className="text-[10px] text-muted-foreground">urgent signals</div>
              </div>
              <div>
                <div className="text-lg font-bold text-primary tabular-nums">
                  {pipelines?.filter(p => p.grady_county_present).length ?? 0}
                </div>
                <div className="text-[10px] text-muted-foreground">in Grady County</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="px-6 py-5 space-y-6">
        {/* TOP STRIP — Opportunity Signals */}
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <AlertTriangle size={12} className="text-amber-400" />
            <h2 className="text-sm font-semibold text-foreground">Opportunity Signals</h2>
            {urgentCount > 0 && (
              <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded">
                {urgentCount} URGENT
              </span>
            )}
          </div>

          {signalsLoading ? (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-28 w-64 shrink-0 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
              {(signals ?? []).map(sig => (
                <SignalCard key={sig.id} sig={sig} />
              ))}
              {(!signals || signals.length === 0) && (
                <div className="text-sm text-muted-foreground italic py-4">No signals recorded.</div>
              )}
            </div>
          )}
        </div>

        {/* MAIN TWO-COLUMN AREA */}
        <div className="flex gap-5">
          {/* LEFT: Pipeline Intelligence Table (60%) */}
          <div className="flex-[3] min-w-0">
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              {/* Table header */}
              <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <GitBranch size={13} className="text-primary shrink-0" />
                  <div>
                    <h2 className="text-xs font-semibold text-foreground uppercase tracking-wide">
                      Grady County / Iron Horse Corridor
                    </h2>
                    <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                      Pipelines serving the Iron Horse Midstream processing complex in Grady County, OK
                      <MethodologyTip
                        size="xs"
                        title="Pipeline Scope & Methodology"
                        body="This table focuses on pipelines that (1) physically traverse or interconnect in Grady County, Oklahoma, and/or (2) connect to the Iron Horse Midstream gathering/processing system. Iron Horse is the primary midstream infrastructure supporting BTM data center gas supply in the SCOOP/STACK/Merge play. Interstate pipelines shown are FERC-regulated with public 549B filings. Iron Horse is intrastate and not FERC-regulated."
                        sources={[
                          { label: "MIDSHIP FERC CP17-458", url: "https://www.ferc.gov/industries-data/natural-gas/industry-forms/form-549b-index-customers" },
                          { label: "Iron Horse — Sixth Street acquisition", url: "https://www.kirkland.com/news/press-release/2025/08/kirkland-advises-iron-horse-midstream-on-sale-to-sixth-street-partners" },
                        ]}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {pipelinesLoading ? (
                <div className="p-4 space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border bg-muted/20">
                        <th className="text-left py-2.5 pl-4 pr-3 text-muted-foreground font-medium">Pipeline</th>
                        <th className="text-right py-2.5 px-3 text-muted-foreground font-medium">
                          <span className="inline-flex items-center gap-1">
                            Capacity
                            <MethodologyTip
                              size="xs"
                              side="right"
                              title="Pipeline Capacity — Bcf/d"
                              body="Capacity is expressed in Bcf/d (Billion cubic feet per day). This is the nameplate or certificated maximum throughput capacity of the pipeline. Nameplate capacity ≠ available capacity. Contracted (firm) capacity is typically 80–95% of nameplate; remaining interruptible capacity can be lower. 1 Bcf/d ≈ 1 million Dth/d ≈ enough gas to power ~5,000 MW of combined-cycle generation continuously."
                            />
                          </span>
                        </th>
                        <th className="text-left py-2.5 px-3 text-muted-foreground font-medium">
                          <span className="inline-flex items-center gap-1">
                            Status
                            <MethodologyTip
                              size="xs"
                              side="right"
                              title="Utilization Status for BTM Developers"
                              body="FULLY SUBSCRIBED means all firm transportation capacity is contracted — no new firm capacity is available without an open season or capacity release. BTM developers seeking firm service on a fully subscribed pipeline must either (1) wait for a binding open season, (2) acquire released capacity, or (3) use interruptible service (no delivery guarantee). TIGHT means limited firm capacity; AVAILABLE means firm capacity can be contracted. For large BTM data centers (100+ MW), firm gas supply is critical — interruptible service is insufficient."
                            />
                          </span>
                        </th>
                        <th className="text-center py-2.5 px-3 text-muted-foreground font-medium">Grady Co.</th>
                        <th className="text-center py-2.5 px-3 text-muted-foreground font-medium">
                          <span className="inline-flex items-center gap-1 justify-center">
                            <Link2 size={10} />
                            IH Link
                          </span>
                        </th>
                        <th className="text-left py-2.5 px-3 text-muted-foreground font-medium">549B</th>
                        <th className="text-left py-2.5 pl-3 pr-4 text-muted-foreground font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(pipelines ?? []).map(pipeline => (
                        <PipelineRow
                          key={pipeline.id}
                          pipeline={pipeline}
                          expanded={expandedPipeline === pipeline.id}
                          onToggle={() => setExpandedPipeline(expandedPipeline === pipeline.id ? null : pipeline.id)}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Shipper Intelligence (40%) */}
          <div className="flex-[2] min-w-0">
            {!pipelinesWithDetail ? (
              <div className="space-y-3">
                <Skeleton className="h-6 w-32 rounded" />
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
              </div>
            ) : (
              <ShipperPanel pipelines={pipelinesWithDetail} />
            )}
          </div>
        </div>

        {/* BOTTOM: About This Data */}
        <AboutDataCard />
      </div>
    </Layout>
  );
}
