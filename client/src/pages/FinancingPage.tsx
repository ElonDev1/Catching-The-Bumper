import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import Layout from "@/components/Layout";
import { Skeleton } from "@/components/ui/skeleton";
import MethodologyTip from "@/components/MethodologyTip";
import {
  DollarSign, ExternalLink, ChevronDown, ChevronUp,
  Building2, Zap, BarChart3, Filter, Info,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────

interface FinancingDeal {
  id: number;
  project_name: string;
  project_id: number | null;
  borrower: string;
  lead_lenders: string;
  all_lenders: string | null;
  deal_type: string;
  amount_mm: number;
  currency: string;
  sofr_spread_bps: number | null;
  close_date: string | null;
  status: string;
  btm_specific: number;
  btm_mw: number | null;
  btm_tech: string | null;
  structure_notes: string | null;
  source_label: string;
  source_url: string;
  source_2_label: string | null;
  source_2_url: string | null;
}

interface FinancingLender {
  id: number;
  name: string;
  short_name: string | null;
  type: string;
  hq: string | null;
  country: string;
  website: string | null;
  description: string | null;
  logo_initials: string | null;
  company_id: number | null;
  sort_order: number;
}

interface LenderActivity {
  id: number;
  lender_id: number;
  year: number;
  total_dc_volume_bn: number | null;
  dc_deal_count: number | null;
  btm_specific: number;
  rank_infralogic: number | null;
  yoy_growth_pct: number | null;
  notes: string | null;
  source_label: string | null;
  source_url: string | null;
}

interface FinancingStats {
  total_tracked_bn: number;
  deal_count: number;
  btm_deal_count: number;
  btm_volume_bn: number;
  largest_deal_mm: number;
  largest_deal_name: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function fmtAmount(mm: number): string {
  if (mm >= 1000) return `$${(mm / 1000).toFixed(1)}B`;
  return `$${mm.toFixed(0)}M`;
}

function fmtDate(d: string | null): string {
  if (!d) return "—";
  // Partial dates like "2025-08"
  if (d.length === 7) {
    const [y, m] = d.split("-");
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return `${months[parseInt(m) - 1]} ${y}`;
  }
  try {
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch { return d; }
}

const DEAL_TYPE_CFG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  construction_loan:    { label: "CONSTRUCTION LOAN",  color: "#3b82f6", bg: "rgba(59,130,246,0.10)",  border: "rgba(59,130,246,0.25)" },
  term_loan:            { label: "TERM LOAN",           color: "#8b5cf6", bg: "rgba(139,92,246,0.10)", border: "rgba(139,92,246,0.25)" },
  senior_secured_notes: { label: "SR SECURED NOTES",   color: "#10b981", bg: "rgba(16,185,129,0.10)", border: "rgba(16,185,129,0.25)" },
  abl_revolving:        { label: "ABL REVOLVER",        color: "#06b6d4", bg: "rgba(6,182,212,0.10)",  border: "rgba(6,182,212,0.25)" },
  project_bond:         { label: "PROJECT BOND",        color: "#f59e0b", bg: "rgba(245,158,11,0.10)", border: "rgba(245,158,11,0.25)" },
  project_finance:      { label: "PROJECT FINANCE",     color: "#3b82f6", bg: "rgba(59,130,246,0.10)", border: "rgba(59,130,246,0.25)" },
  cmbs_abs:             { label: "CMBS + ABS",          color: "#a855f7", bg: "rgba(168,85,247,0.10)", border: "rgba(168,85,247,0.25)" },
  abs_securitization:   { label: "ABS",                 color: "#a855f7", bg: "rgba(168,85,247,0.10)", border: "rgba(168,85,247,0.25)" },
  investment_grade_bond:{ label: "IG BOND",             color: "#10b981", bg: "rgba(16,185,129,0.10)", border: "rgba(16,185,129,0.25)" },
  equipment_finance:    { label: "EQUIPMENT FINANCE",   color: "#f97316", bg: "rgba(249,115,22,0.10)", border: "rgba(249,115,22,0.25)" },
  credit_facility:      { label: "CREDIT FACILITY",     color: "#06b6d4", bg: "rgba(6,182,212,0.10)",  border: "rgba(6,182,212,0.25)" },
  strategic_equity:     { label: "STRATEGIC EQUITY",    color: "#ec4899", bg: "rgba(236,72,153,0.10)", border: "rgba(236,72,153,0.25)" },
};

const LENDER_TYPE_CFG: Record<string, { label: string; color: string }> = {
  bulge_bracket:       { label: "Bulge Bracket",       color: "#3b82f6" },
  japanese_commercial: { label: "Japanese Commercial", color: "#10b981" },
  european_commercial: { label: "European Commercial", color: "#06b6d4" },
  canadian_bank:       { label: "Canadian Bank",       color: "#8b5cf6" },
  regional_us:         { label: "US Regional Bank",    color: "#6366f1" },
  private_credit:      { label: "Private Credit",      color: "#f59e0b" },
  asset_manager:       { label: "Asset Manager",       color: "#ec4899" },
  equipment_finance:   { label: "Equipment Finance",   color: "#f97316" },
};

const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  closed:    { label: "CLOSED",    color: "#10b981", bg: "rgba(16,185,129,0.10)" },
  announced: { label: "ANNOUNCED", color: "#f59e0b", bg: "rgba(245,158,11,0.10)" },
  rumored:   { label: "RUMORED",   color: "#6b7280", bg: "rgba(107,114,128,0.10)" },
};

// ── Deal Type bar chart helper ─────────────────────────────────────────────

function dealTypeTotals(deals: FinancingDeal[]) {
  const totals: Record<string, number> = {};
  for (const d of deals) {
    totals[d.deal_type] = (totals[d.deal_type] ?? 0) + d.amount_mm;
  }
  return Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .map(([type, mm]) => ({ type, mm }));
}

// ── Deal Detail Expansion ─────────────────────────────────────────────────

function DealDetail({ deal }: { deal: FinancingDeal }) {
  return (
    <tr>
      <td colSpan={7} className="px-0 py-0">
        <div className="bg-muted/20 border-t border-b border-border/60 px-6 py-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Lenders */}
            <div>
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                All Lenders / Participants
              </div>
              <p className="text-xs text-foreground leading-relaxed">
                {deal.all_lenders ?? deal.lead_lenders}
              </p>
            </div>

            {/* Structure notes */}
            {deal.structure_notes && (
              <div>
                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                  Structure & Notes
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {deal.structure_notes}
                </p>
              </div>
            )}
          </div>

          {/* BTM details row */}
          {deal.btm_specific === 1 && (
            <div className="flex items-center gap-4 pt-1">
              <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-400">
                <Zap size={10} />
                BTM-SPECIFIC FINANCING
              </span>
              {deal.btm_mw && (
                <span className="text-[10px] text-muted-foreground">
                  {deal.btm_mw.toLocaleString()} MW BTM capacity
                </span>
              )}
              {deal.btm_tech && (
                <span className="text-[10px] text-muted-foreground">
                  Technology: {deal.btm_tech}
                </span>
              )}
            </div>
          )}

          {/* Sources */}
          <div className="flex items-center gap-4 pt-1 border-t border-border/30">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Sources:</span>
            <a
              href={deal.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline"
            >
              {deal.source_label} <ExternalLink size={9} />
            </a>
            {deal.source_2_url && deal.source_2_label && (
              <a
                href={deal.source_2_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline"
              >
                {deal.source_2_label} <ExternalLink size={9} />
              </a>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
}

// ── Deal Row ────────────────────────────────────────────────────────────────

function DealRow({ deal, expanded, onToggle }: {
  deal: FinancingDeal;
  expanded: boolean;
  onToggle: () => void;
}) {
  const typeCfg = DEAL_TYPE_CFG[deal.deal_type] ?? { label: deal.deal_type.toUpperCase(), color: "#6b7280", bg: "rgba(107,114,128,0.10)", border: "rgba(107,114,128,0.25)" };
  const statusCfg = STATUS_CFG[deal.status] ?? STATUS_CFG.closed;

  return (
    <>
      <tr
        className="border-b border-border/40 hover:bg-muted/20 transition-colors cursor-pointer"
        onClick={onToggle}
      >
        {/* Expand + project */}
        <td className="py-3 pl-4 pr-3">
          <div className="flex items-center gap-2">
            {expanded
              ? <ChevronUp size={11} className="text-muted-foreground shrink-0" />
              : <ChevronDown size={11} className="text-muted-foreground shrink-0" />}
            <div>
              <div className="text-xs font-semibold text-foreground leading-tight">{deal.project_name}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{deal.borrower}</div>
            </div>
          </div>
        </td>

        {/* Deal type */}
        <td className="py-3 px-3">
          <span
            className="text-[9px] font-bold px-1.5 py-0.5 rounded border"
            style={{ color: typeCfg.color, background: typeCfg.bg, borderColor: typeCfg.border }}
          >
            {typeCfg.label}
          </span>
        </td>

        {/* Amount */}
        <td className="py-3 px-3 text-right">
          <span className="text-xs font-bold text-foreground tabular-nums">{fmtAmount(deal.amount_mm)}</span>
        </td>

        {/* Lead lenders */}
        <td className="py-3 px-3">
          <span className="text-[10px] text-foreground line-clamp-2 leading-snug">{deal.lead_lenders}</span>
        </td>

        {/* BTM specific */}
        <td className="py-3 px-3 text-center">
          {deal.btm_specific === 1 ? (
            <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-1.5 py-0.5 rounded">
              <Zap size={8} /> BTM
            </span>
          ) : (
            <span className="text-muted-foreground text-xs">—</span>
          )}
        </td>

        {/* Date */}
        <td className="py-3 px-3">
          <span className="text-[10px] text-muted-foreground">{fmtDate(deal.close_date)}</span>
        </td>

        {/* Status */}
        <td className="py-3 pl-3 pr-4">
          <span
            className="text-[9px] font-bold px-1.5 py-0.5 rounded"
            style={{ color: statusCfg.color, background: statusCfg.bg }}
          >
            {statusCfg.label}
          </span>
        </td>
      </tr>
      {expanded && <DealDetail deal={deal} />}
    </>
  );
}

// ── Lender Card ────────────────────────────────────────────────────────────

function LenderCard({ lender, activity }: {
  lender: FinancingLender;
  activity: LenderActivity | undefined;
}) {
  const typeCfg = LENDER_TYPE_CFG[lender.type] ?? { label: lender.type, color: "#6b7280" };

  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3 hover:border-primary/30 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
            style={{ background: "var(--color-muted)", color: "var(--color-foreground)" }}
          >
            {lender.logo_initials ?? lender.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="text-xs font-semibold text-foreground leading-tight">{lender.name}</div>
            <div className="text-[10px] text-muted-foreground">{lender.hq}</div>
          </div>
        </div>
        <span
          className="text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0"
          style={{ color: typeCfg.color, background: `${typeCfg.color}18` }}
        >
          {typeCfg.label.toUpperCase()}
        </span>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-3 flex-wrap">
        {activity?.total_dc_volume_bn && (
          <div className="text-center">
            <div className="text-sm font-bold text-foreground tabular-nums">${activity.total_dc_volume_bn.toFixed(2)}B</div>
            <div className="text-[9px] text-muted-foreground">2025 DC volume</div>
          </div>
        )}
        {activity?.rank_infralogic && (
          <div className="text-center">
            <div className="text-sm font-bold text-primary tabular-nums">#{activity.rank_infralogic}</div>
            <div className="text-[9px] text-muted-foreground">Infralogic rank</div>
          </div>
        )}
        {activity?.yoy_growth_pct && (
          <div className="text-center">
            <div className="text-sm font-bold text-emerald-400 tabular-nums">+{activity.yoy_growth_pct}%</div>
            <div className="text-[9px] text-muted-foreground">YoY growth</div>
          </div>
        )}
      </div>

      {/* Description */}
      {lender.description && (
        <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-3">
          {lender.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-1 border-t border-border/30">
        {activity?.source_url && (
          <a
            href={activity.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline"
          >
            {activity.source_label ?? "Source"} <ExternalLink size={9} />
          </a>
        )}
        {lender.website && (
          <a
            href={lender.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground hover:underline ml-auto"
          >
            Website <ExternalLink size={9} />
          </a>
        )}
      </div>
    </div>
  );
}

// ── Market Overview strip ─────────────────────────────────────────────────

function MarketOverview({ deals, stats }: { deals: FinancingDeal[]; stats: FinancingStats | undefined }) {
  const byType = dealTypeTotals(deals);
  const maxBar = byType[0]?.mm ?? 1;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Headline KPIs */}
      <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2 mb-1">
          <BarChart3 size={13} className="text-primary" />
          <span className="text-xs font-semibold text-foreground uppercase tracking-wide">Market Overview</span>
          <MethodologyTip
            title="Financing Deal Scope"
            body="This tracker covers confirmed data center and BTM generation financing transactions from 2024–2026. 'BTM-specific' deals directly finance behind-the-meter power generation assets (turbines, fuel cells, equipment). General data center deals finance the broader DC facility but may include BTM components. All amounts are in USD. Deals marked 'Announced' have been reported by Reuters, Bloomberg, FT, or company press releases but may not have formally closed."
            sources={[
              { label: "ION Analytics / Infralogic Project Finance Rankings 2025", url: "https://ionanalytics.com/insights/infralogic/data-center-boom-sees-explosion-in-bulge-bracket-project-finance/" },
              { label: "S&P Global Market Intelligence — $121.9B DC credit in 2025", url: "https://www.spglobal.com/market-intelligence/en/news-insights/research/2026/02/banks-meeting-data-center-demand-with-billions-in-credit-facilities-bonds" },
            ]}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-xl font-bold text-foreground tabular-nums">
              {stats ? fmtAmount(stats.total_tracked_bn * 1000) : "—"}
            </div>
            <div className="text-[10px] text-muted-foreground">total tracked</div>
          </div>
          <div>
            <div className="text-xl font-bold text-foreground tabular-nums">{deals.length}</div>
            <div className="text-[10px] text-muted-foreground">deals tracked</div>
          </div>
          <div>
            <div className="text-xl font-bold text-emerald-400 tabular-nums">
              {deals.filter(d => d.btm_specific === 1).length}
            </div>
            <div className="text-[10px] text-muted-foreground">BTM-specific</div>
          </div>
          <div>
            <div className="text-xl font-bold text-primary tabular-nums">
              {fmtAmount(deals.filter(d => d.btm_specific === 1).reduce((s, d) => s + d.amount_mm, 0))}
            </div>
            <div className="text-[10px] text-muted-foreground">BTM volume</div>
          </div>
        </div>
        {stats && (
          <div className="text-[10px] text-muted-foreground border-t border-border/40 pt-2 leading-relaxed">
            Largest: <span className="text-foreground font-medium">{stats.largest_deal_name}</span> at{" "}
            <span className="text-foreground font-medium">{fmtAmount(stats.largest_deal_mm)}</span>
          </div>
        )}
      </div>

      {/* Deal type breakdown bar chart */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Volume by Structure Type
        </div>
        <div className="space-y-2">
          {byType.slice(0, 7).map(({ type, mm }) => {
            const cfg = DEAL_TYPE_CFG[type] ?? { label: type, color: "#6b7280", bg: "", border: "" };
            return (
              <div key={type} className="flex items-center gap-2">
                <div className="text-[9px] w-28 shrink-0 text-muted-foreground truncate">{cfg.label}</div>
                <div className="flex-1 h-3 bg-muted/30 rounded overflow-hidden">
                  <div
                    className="h-full rounded transition-all"
                    style={{ width: `${Math.max(4, (mm / maxBar) * 100)}%`, background: cfg.color }}
                  />
                </div>
                <div className="text-[9px] text-foreground tabular-nums w-12 text-right shrink-0">
                  {fmtAmount(mm)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* BTM vs General split */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1">
          BTM vs. General DC
          <MethodologyTip
            size="xs"
            title="BTM vs. General DC Classification"
            body="BTM-Specific: the deal directly finances behind-the-meter generation assets — equipment, SPV, or offtake backed by BTM power generation. Examples: VoltaGrid ($5B), Fermi America equipment financing, Brookfield/Bloom, Solaris credit facility. General DC: the deal finances a data center facility that may include BTM power but the financing is collateralized against the real estate/lease rather than the generation asset itself. Examples: Meta Louisiana ($29B), Stargate, QTS bonds."
          />
        </div>
        <div className="space-y-3">
          {[
            { label: "BTM-Specific", color: "#10b981", deals: deals.filter(d => d.btm_specific === 1) },
            { label: "General DC / Hyperscale", color: "#3b82f6", deals: deals.filter(d => d.btm_specific === 0) },
          ].map(({ label, color, deals: grp }) => {
            const vol = grp.reduce((s, d) => s + d.amount_mm, 0);
            const totalVol = deals.reduce((s, d) => s + d.amount_mm, 0);
            const pct = totalVol > 0 ? (vol / totalVol) * 100 : 0;
            return (
              <div key={label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-foreground font-medium">{label}</span>
                  <span className="text-[10px] text-muted-foreground">{fmtAmount(vol)} ({pct.toFixed(0)}%)</span>
                </div>
                <div className="h-2.5 bg-muted/30 rounded overflow-hidden">
                  <div
                    className="h-full rounded"
                    style={{ width: `${pct}%`, background: color }}
                  />
                </div>
                <div className="text-[9px] text-muted-foreground mt-0.5">{grp.length} deals</div>
              </div>
            );
          })}
        </div>

        {/* Context note */}
        <div className="mt-3 pt-3 border-t border-border/40 text-[10px] text-muted-foreground leading-relaxed">
          US DC lenders committed an estimated{" "}
          <a href="https://www.spglobal.com/market-intelligence/en/news-insights/research/2026/02/banks-meeting-data-center-demand-with-billions-in-credit-facilities-bonds"
             target="_blank" rel="noopener noreferrer"
             className="text-primary hover:underline">$121.9B in total DC credit in 2025
          </a>{" "}(S&P Global). This tracker covers publicly confirmed deals with primary-source citations.
        </div>
      </div>
    </div>
  );
}

// ── About This Data Card ────────────────────────────────────────────────────

function AboutDataCard() {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <Info size={13} className="text-muted-foreground" />
        <h2 className="text-sm font-semibold text-foreground">About This Data</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
        <div>
          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Sources & Methodology</div>
          <p className="text-muted-foreground leading-relaxed">
            All deals are sourced from primary press releases, SEC 8-K filings, or tier-1 financial journalism (Reuters, Bloomberg, Financial Times, Data Center Dynamics). Deal amounts reflect disclosed or reported figures. Where a range was reported, the midpoint or confirmed figure is used. Deals marked "Announced" have been reported but may not have formally closed.
          </p>
          <a href="https://ionanalytics.com/insights/infralogic/data-center-boom-sees-explosion-in-bulge-bracket-project-finance/"
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline mt-1.5">
            ION Analytics / Infralogic PF Rankings 2025 <ExternalLink size={9} />
          </a>
        </div>
        <div>
          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Deal Type Definitions</div>
          <div className="space-y-1.5 text-muted-foreground">
            <div><span className="text-foreground font-medium">Construction Loan</span> — short-term (3–5 yr), converts to perm on stabilization. Underwritten on lease creditworthiness.</div>
            <div><span className="text-foreground font-medium">Equipment Finance</span> — secured by the generation equipment itself (turbines, fuel cells). 5–10 yr terms. Key for BTM.</div>
            <div><span className="text-foreground font-medium">ABS / CMBS</span> — securitized takeout of stabilized DC assets. Investment-grade rated. Lowest cost of capital.</div>
            <div><span className="text-foreground font-medium">Strategic Equity</span> — offtake or equity investment from a non-bank (e.g., asset manager). Not traditional debt.</div>
          </div>
        </div>
        <div>
          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Market Context (2025)</div>
          <div className="space-y-1.5 text-muted-foreground">
            <div>US bulge bracket banks lent <span className="text-foreground">$13.28B</span> in DC project finance in 2025 vs ~$600M in 2024 (+2,113%) per Infralogic.</div>
            <div>Total North America DC project finance: <span className="text-foreground">$113.4B across 37 deals</span> in 2025 per Infralogic.</div>
            <div>JPMorgan ranked #1 US lender by DC volume with <span className="text-foreground">$6.72B</span> committed in 2025.</div>
          </div>
          <a href="https://ionanalytics.com/insights/infralogic/lng-data-centers-drive-growth-in-project-finance/"
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline mt-1.5">
            ION Analytics full market report <ExternalLink size={9} />
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function FinancingPage() {
  const [expandedDeal, setExpandedDeal] = useState<number | null>(null);
  const [dealTypeFilter, setDealTypeFilter] = useState<string>("all");
  const [btmFilter, setBtmFilter] = useState<"all" | "btm" | "general">("all");
  const [lenderTypeFilter, setLenderTypeFilter] = useState<string>("all");

  const { data: deals, isLoading: dealsLoading } = useQuery<FinancingDeal[]>({
    queryKey: ["/api/financing/deals"],
    queryFn: () => apiRequest("GET", "/api/financing/deals").then(r => r.json()),
  });

  const { data: lenders, isLoading: lendersLoading } = useQuery<FinancingLender[]>({
    queryKey: ["/api/financing/lenders"],
    queryFn: () => apiRequest("GET", "/api/financing/lenders").then(r => r.json()),
  });

  const { data: activities } = useQuery<LenderActivity[]>({
    queryKey: ["/api/financing/activity"],
    queryFn: () => apiRequest("GET", "/api/financing/activity").then(r => r.json()),
  });

  const { data: stats } = useQuery<FinancingStats>({
    queryKey: ["/api/financing/stats"],
    queryFn: () => apiRequest("GET", "/api/financing/stats").then(r => r.json()),
  });

  const allDeals = deals ?? [];

  // Filter deals
  const filteredDeals = allDeals.filter(d => {
    if (dealTypeFilter !== "all" && d.deal_type !== dealTypeFilter) return false;
    if (btmFilter === "btm" && d.btm_specific !== 1) return false;
    if (btmFilter === "general" && d.btm_specific !== 0) return false;
    return true;
  });

  // Filter lenders
  const filteredLenders = (lenders ?? []).filter(l => {
    if (lenderTypeFilter !== "all" && l.type !== lenderTypeFilter) return false;
    return true;
  });

  const activityMap: Record<number, LenderActivity> = {};
  for (const a of activities ?? []) activityMap[a.lender_id] = a;

  const dealTypes = [...new Set(allDeals.map(d => d.deal_type))].sort();
  const lenderTypes = [...new Set((lenders ?? []).map(l => l.type))].sort();

  const totalBtmVol = allDeals.filter(d => d.btm_specific === 1).reduce((s, d) => s + d.amount_mm, 0);

  return (
    <Layout>
      {/* Page header */}
      <div className="border-b border-border px-6 py-4 bg-card/50 sticky top-0 z-10 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <DollarSign size={15} className="text-primary" />
              <h1 className="text-lg font-bold text-foreground">Financing Intelligence</h1>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              <span className="text-primary font-medium">Project finance & equipment lending</span>
              {" · "}Data center and BTM generation financing deals, lenders, and market structure
            </p>
          </div>

          {!dealsLoading && (
            <div className="flex items-center gap-5 text-right">
              <div>
                <div className="text-lg font-bold text-foreground tabular-nums">{allDeals.length}</div>
                <div className="text-[10px] text-muted-foreground">deals tracked</div>
              </div>
              <div>
                <div className="text-lg font-bold text-emerald-400 tabular-nums">
                  {fmtAmount(totalBtmVol)}
                </div>
                <div className="text-[10px] text-muted-foreground">BTM-specific volume</div>
              </div>
              <div>
                <div className="text-lg font-bold text-primary tabular-nums">{lenders?.length ?? 0}</div>
                <div className="text-[10px] text-muted-foreground">lenders tracked</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="px-6 py-5 space-y-6">

        {/* ── LAYER 1: Market Overview ─────────────────────────────────── */}
        {dealsLoading ? (
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-44 rounded-xl" />)}
          </div>
        ) : (
          <MarketOverview deals={allDeals} stats={stats} />
        )}

        {/* ── LAYER 2: Deal Feed ───────────────────────────────────────── */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {/* Table header + filters */}
          <div className="px-4 py-3 border-b border-border flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 mr-auto">
              <DollarSign size={13} className="text-primary shrink-0" />
              <div>
                <h2 className="text-xs font-semibold text-foreground uppercase tracking-wide">Deal Feed</h2>
                <div className="text-[10px] text-muted-foreground">
                  {filteredDeals.length} of {allDeals.length} deals · click row to expand
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <Filter size={10} className="text-muted-foreground" />

              {/* BTM filter */}
              <div className="flex items-center gap-1 bg-muted/30 rounded-lg p-0.5">
                {(["all", "btm", "general"] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setBtmFilter(f)}
                    className={`text-[9px] font-semibold px-2 py-1 rounded transition-all ${btmFilter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    {f === "all" ? "All" : f === "btm" ? "BTM Only" : "General DC"}
                  </button>
                ))}
              </div>

              {/* Deal type filter */}
              <select
                value={dealTypeFilter}
                onChange={e => setDealTypeFilter(e.target.value)}
                className="text-[9px] bg-muted/30 border border-border rounded px-2 py-1.5 text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="all">All Types</option>
                {dealTypes.map(t => (
                  <option key={t} value={t}>
                    {DEAL_TYPE_CFG[t]?.label ?? t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {dealsLoading ? (
            <div className="p-4 space-y-2">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/20">
                    <th className="text-left py-2.5 pl-4 pr-3 text-muted-foreground font-medium">Project / Borrower</th>
                    <th className="text-left py-2.5 px-3 text-muted-foreground font-medium">
                      <span className="inline-flex items-center gap-1">
                        Structure
                        <MethodologyTip
                          size="xs"
                          title="Deal Structure Types"
                          body="Construction Loan: short-term bank debt funding DC build, converts to perm on lease-up. Term Loan: drawn facility repaid over fixed schedule. Senior Secured Notes: bond-style debt, typically 2L or 1L on assets. ABL Revolver: asset-based revolving facility secured against receivables/equipment. Project Finance: non-recourse SPV debt secured against project cash flows. ABS/CMBS: securitized bonds backed by DC lease streams or equipment. Equipment Finance: asset-backed term loans secured by specific generation equipment. Strategic Equity: equity or offtake investment from institutional LP or partner."
                        />
                      </span>
                    </th>
                    <th className="text-right py-2.5 px-3 text-muted-foreground font-medium">Amount</th>
                    <th className="text-left py-2.5 px-3 text-muted-foreground font-medium">Lead Lender(s)</th>
                    <th className="text-center py-2.5 px-3 text-muted-foreground font-medium">
                      <span className="inline-flex items-center gap-1 justify-center">
                        BTM
                        <MethodologyTip
                          size="xs"
                          side="right"
                          title="BTM-Specific Flag"
                          body="Deals flagged BTM directly finance behind-the-meter power generation assets: turbine equipment, fuel cell deployments, or SPVs whose primary collateral is BTM generation capacity. Unflagged deals finance data center real estate/shells that may include BTM but are primarily underwritten on lease credit quality."
                        />
                      </span>
                    </th>
                    <th className="text-left py-2.5 px-3 text-muted-foreground font-medium">Close Date</th>
                    <th className="text-left py-2.5 pl-3 pr-4 text-muted-foreground font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDeals
                    .sort((a, b) => b.amount_mm - a.amount_mm)
                    .map(deal => (
                      <DealRow
                        key={deal.id}
                        deal={deal}
                        expanded={expandedDeal === deal.id}
                        onToggle={() => setExpandedDeal(expandedDeal === deal.id ? null : deal.id)}
                      />
                    ))}
                  {filteredDeals.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-muted-foreground text-xs italic">
                        No deals match current filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── LAYER 3: Lender Cards ──────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Building2 size={13} className="text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Active Lenders</h2>
              <MethodologyTip
                title="Lender Profiles"
                body="Lender profiles cover banks, private credit funds, asset managers, and equipment finance specialists with confirmed activity in data center or BTM generation financing. Volume and ranking data for bulge bracket banks sourced from Infralogic Project Finance Rankings 2025. YoY growth figures represent the change in DC project finance volume between 2024 and 2025 per Infralogic."
                sources={[
                  { label: "ION Analytics / Infralogic 2025 PF Rankings", url: "https://ionanalytics.com/insights/infralogic/data-center-boom-sees-explosion-in-bulge-bracket-project-finance/" },
                ]}
              />
            </div>

            {/* Lender type filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <Filter size={10} className="text-muted-foreground" />
              <div className="flex items-center gap-1 bg-muted/30 rounded-lg p-0.5">
                <button
                  onClick={() => setLenderTypeFilter("all")}
                  className={`text-[9px] font-semibold px-2 py-1 rounded transition-all ${lenderTypeFilter === "all" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  All
                </button>
                {lenderTypes.map(t => {
                  const cfg = LENDER_TYPE_CFG[t] ?? { label: t, color: "#6b7280" };
                  return (
                    <button
                      key={t}
                      onClick={() => setLenderTypeFilter(t)}
                      className={`text-[9px] font-semibold px-2 py-1 rounded transition-all ${lenderTypeFilter === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      {cfg.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {lendersLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredLenders
                .sort((a, b) => a.sort_order - b.sort_order)
                .map(lender => (
                  <LenderCard key={lender.id} lender={lender} activity={activityMap[lender.id]} />
                ))}
            </div>
          )}
        </div>

        {/* ── About this data ─────────────────────────────────────────────── */}
        <AboutDataCard />
      </div>
    </Layout>
  );
}
