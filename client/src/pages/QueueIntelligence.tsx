import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import Layout from "@/components/Layout";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle, TrendingUp, Activity, Info,
  ChevronRight, ExternalLink, ArrowUp, ArrowDown,
  Minus, CheckCircle2, Clock, Zap, BarChart2
} from "lucide-react";
import MethodologyTip from "@/components/MethodologyTip";

// ── RTO config ────────────────────────────────────────────────────────────────
const RTO_CFG: Record<string, { color: string; btmColor: string; btmLabel: string }> = {
  ERCOT: { color: "#10b981", btmColor: "#10b981", btmLabel: "Highly Favorable" },
  PJM:   { color: "#f59e0b", btmColor: "#f59e0b", btmLabel: "Transitional"     },
  MISO:  { color: "#3b82f6", btmColor: "#3b82f6", btmLabel: "Developing"       },
  SPP:   { color: "#8b5cf6", btmColor: "#94a3b8", btmLabel: "Neutral"          },
  CAISO: { color: "#a855f7", btmColor: "#ef4444", btmLabel: "Restrictive"      },
  NYISO: { color: "#6b7280", btmColor: "#ef4444", btmLabel: "Restrictive"      },
  ISONE: { color: "#94a3b8", btmColor: "#f59e0b", btmLabel: "Mixed"            },
};

// ── Reality check — large load focused ────────────────────────────────────────
const REALITY_STEPS = [
  {
    label: "Published Large Load Requests",
    value: "290+ GW",
    rawMw: 290000,
    color: "#ef4444",
    pct: 100,
    detail: "ERCOT alone has 233 GW of large load requests as of Dec 2025. PJM utilities forecast ~55 GW by 2030. Raw submissions are massively inflated by speculative and duplicate filings.",
    sources: [
      { label: "BIC Magazine: ERCOT 233 GW", url: "https://www.bicmagazine.com/industry/powergen/texas-grid-sees-233-gw-data-center-requests-much-real/" },
      { label: "Wood Mackenzie: PJM 55 GW", url: "https://www.whitecase.com/insight-alert/pjm-proposes-carve-out-new-services-co-located-data-centers" },
    ],
  },
  {
    label: "After Duplicate / Multi-Queue Filing Haircut",
    value: "~175 GW",
    rawMw: 175000,
    color: "#f97316",
    pct: 60,
    detail: "Developers routinely file the same project across multiple utility queues and multiple RTOs to hedge against localized transmission constraints. PJM's own load forecast applies a 43% reduction to raw utility submissions. ERCOT's new SB6 $100K fee + duplicate disclosure requirement was specifically designed to expose this.",
    sources: [
      { label: "PJM: 60 GW raw → 34 GW accepted (43% haircut)", url: "https://modoenergy.com/research/en/pjm-load-forecast-data-centers-2046" },
      { label: "ERCOT SB6 duplicate disclosure requirement", url: "https://www.texastribune.org/2026/01/19/ercot-texas-data-centers-electricty-demand/" },
    ],
  },
  {
    label: "Projects That Actually Submit Transmission Studies",
    value: "~105 GW",
    rawMw: 105000,
    color: "#f59e0b",
    pct: 36,
    detail: "In ERCOT alone, 128 GW of the 233 GW total — about 55% — has not submitted transmission studies required to begin the interconnection process. Projects without studies are fully speculative. Similar dynamics observed in PJM where raw large load adjustment submissions are filtered before entering the load forecast.",
    sources: [
      { label: "BIC Magazine: 128 GW no study submitted", url: "https://www.bicmagazine.com/industry/powergen/texas-grid-sees-233-gw-data-center-requests-much-real/" },
    ],
  },
  {
    label: "Projects With Financial Commitment / Agreement Signed",
    value: "~35 GW",
    rawMw: 35000,
    color: "#3b82f6",
    pct: 12,
    detail: "Once a project submits a study and completes the interconnection process, a financial commitment is required. PJM's new large load framework requires a $15K/MW readiness deposit. ERCOT's Batch Zero process will require firm financial commitments post-study. Projects that make it this far are highly likely to be built.",
    sources: [
      { label: "PJM EIT: $15K/MW readiness deposit", url: "https://www.troutmanenergyreport.com/2026/03/pjm-proposes-expedited-generator-interconnection-track/" },
      { label: "ERCOT Batch Zero financial commitment required", url: "https://www.texastribune.org/2026/01/19/ercot-texas-data-centers-electricty-demand/" },
    ],
  },
  {
    label: "Actually Connected to Grid (as of Q1 2026)",
    value: "~7.5 GW (ERCOT)",
    rawMw: 7500,
    color: "#10b981",
    pct: 2.6,
    detail: "In ERCOT, only ~7.5 GW of the 233 GW large load queue is actually connected and energized. The US had ~50 GW of total data center capacity online at end of 2025 (FERC State of Markets Mar 2026), but the majority is served via utility grid agreements, not the large load interconnection queue.",
    sources: [
      { label: "ERCOT: 7.5 GW actually connected", url: "https://www.bicmagazine.com/industry/powergen/texas-grid-sees-233-gw-data-center-requests-much-real/" },
      { label: "FERC: 50 GW US data center capacity online end 2025", url: "https://www.utilitydive.com/news/data-centers-miso-ferc-market-report/815831/" },
    ],
  },
];

// ── Generation queue — secondary context ──────────────────────────────────────
const GEN_QUEUE_CONTEXT = [
  { rto: "SPP",   genGw: 320, llGw: null,  note: "Mostly wind/solar speculation; minimal DC relevance" },
  { rto: "MISO",  genGw: 169, llGw: null,  note: "Cleaner post-Order 2023 reforms; large load queue not published" },
  { rto: "PJM",   genGw: 280, llGw: 55,    note: "55 GW large load by 2030 vs 280 GW gen queue" },
  { rto: "CAISO", genGw: 198, llGw: 1.8,   note: "CARB limits gas; 1.8 GW DC by 2030" },
  { rto: "ERCOT", genGw: 454, llGw: 233,   note: "Both queues massive; gen queue separate from load queue" },
  { rto: "NYISO", genGw: 82,  llGw: null,  note: "CLCPA constrained; no formal large load queue" },
  { rto: "ISONE", genGw: 36,  llGw: null,  note: "Small market; utility-level interconnection" },
];

function fgw(mw: number | null | undefined): string {
  if (!mw) return "—";
  if (mw >= 1000) return `${(mw / 1000).toFixed(0)} GW`;
  return `${mw} MW`;
}

// ── Reality Check ─────────────────────────────────────────────────────────────
function RealityCheck() {
  const [expanded, setExpanded] = useState<number | null>(null);
  const maxRaw = REALITY_STEPS[0].rawMw;

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Large Load Queue Reality Check</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            How real is the 290+ GW of large load interconnection requests? A five-step deduction from raw filings to actually connected.
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded shrink-0">
          <CheckCircle2 size={10} />
          ~2.6% actually connected
        </div>
      </div>

      <div className="space-y-4">
        {REALITY_STEPS.map((step, i) => {
          const barPct = (step.rawMw / maxRaw) * 100;
          const isOpen = expanded === i;
          return (
            <div key={i}>
              <button className="w-full text-left group" onClick={() => setExpanded(isOpen ? null : i)}>
                <div className="flex items-center justify-between gap-3 mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[10px] font-bold text-muted-foreground shrink-0 w-4">{i + 1}.</span>
                    <span className="text-xs font-semibold text-foreground truncate">{step.label}</span>
                    <Info size={11} className="text-muted-foreground group-hover:text-foreground shrink-0 transition-colors" />
                  </div>
                  <span className="text-sm font-bold tabular-nums shrink-0" style={{ color: step.color }}>
                    {step.value}
                  </span>
                </div>
                <div className="h-5 bg-muted/40 rounded overflow-hidden relative">
                  <div className="h-full rounded transition-all duration-700"
                    style={{ width: `${barPct}%`, background: `${step.color}bb` }} />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-medium text-muted-foreground">
                    {step.pct}% of raw requests
                  </span>
                </div>
              </button>

              {isOpen && (
                <div className="mt-2 ml-6 p-3 rounded-lg bg-muted/20 border border-border/50">
                  <p className="text-xs text-muted-foreground leading-relaxed mb-2">{step.detail}</p>
                  <div className="space-y-1">
                    {step.sources.map((s, si) => (
                      <div key={si} className="flex items-center gap-1 text-[10px]">
                        <span className="text-muted-foreground">→</span>
                        <a href={s.url} target="_blank" rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-0.5">
                          {s.label} <ExternalLink size={9} />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {i < REALITY_STEPS.length - 1 && (
                <div className="flex items-center gap-2 ml-5 mt-1.5">
                  <div className="w-0 border-l-2 border-dashed border-border h-3" />
                  <span className="text-[9px] text-muted-foreground italic">
                    {i === 0 ? "−40% multi-queue duplicates / phantom load" :
                     i === 1 ? "−40% never submit transmission studies" :
                     i === 2 ? "−67% don't reach financial commitment" :
                     "−79% not yet energized / under construction"}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-5 pt-4 border-t border-border">
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          <span className="text-amber-400 font-semibold">Bottom line: </span>
          Of 290+ GW of large load requests nationally, roughly 7–12 GW has reached firm commitment or energization as of Q1 2026.
          The 42 BTM projects in this tracker represent an estimated <span className="text-emerald-400 font-semibold">74+ GW of generation capacity that bypasses both the generation and load queues entirely</span> — the most time-efficient path to power for AI data centers by 5–10 years.
        </p>
        <Link href="/projects">
          <a className="inline-flex items-center gap-1 text-[10px] text-emerald-400 hover:underline mt-2">
            View BTM projects that skip the queue <ChevronRight size={9} />
          </a>
        </Link>
      </div>
    </div>
  );
}

// ── Large Load RTO Card ───────────────────────────────────────────────────────
function LargeLoadCard({ snap }: { snap: any }) {
  const cfg = RTO_CFG[snap.rto_id] ?? { color: "#6b7280", btmColor: "#6b7280", btmLabel: "—" };
  const hasData = snap.total_request_mw != null;
  const connectedPct = hasData && snap.total_request_mw > 0
    ? ((snap.actually_connected_mw ?? 0) / snap.total_request_mw * 100).toFixed(1)
    : null;

  return (
    <div className="bg-card border border-border rounded-xl p-4" style={{ borderTop: `3px solid ${cfg.color}` }}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-base font-bold text-foreground">{snap.rto_id}</span>
            <span className="text-[9px] font-medium px-1.5 py-0.5 rounded border"
              style={{ background: `${cfg.btmColor}18`, color: cfg.btmColor, borderColor: `${cfg.btmColor}40` }}>
              BTM: {cfg.btmLabel}
            </span>
          </div>
          <div className="text-[10px] text-muted-foreground">{snap.process_name}</div>
        </div>
        <div className="text-right">
          {hasData ? (
            <>
              <div className="text-xl font-bold tabular-nums" style={{ color: cfg.color }}>
                {fgw(snap.total_request_mw)}
              </div>
              <div className="text-[9px] text-muted-foreground">large load requests</div>
            </>
          ) : (
            <div className="text-sm text-muted-foreground italic">Queue not<br/>published</div>
          )}
        </div>
      </div>

      {/* Key metrics */}
      {hasData && (
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="bg-muted/30 rounded px-2 py-1.5">
            <div className="flex items-center gap-0.5 text-[9px] text-muted-foreground mb-0.5">
              Data Centers
              <MethodologyTip size="xs" side="right" title="Data Center %" body="Percentage of total large load interconnection requests from data centers (as opposed to crypto miners, hydrogen facilities, and other industrial large loads). In ERCOT, 77% of the 233 GW queue is data center driven. Source: ERCOT board reports Dec 2025." />
            </div>
            <div className="text-sm font-bold" style={{ color: cfg.color }}>
              {snap.data_center_pct ? `${snap.data_center_pct}%` : "—"}
            </div>
            {snap.data_center_mw && (
              <div className="text-[9px] text-muted-foreground">{fgw(snap.data_center_mw)}</div>
            )}
          </div>
          <div className="bg-muted/30 rounded px-2 py-1.5">
            <div className="flex items-center gap-0.5 text-[9px] text-muted-foreground mb-0.5">
              Connected
              <MethodologyTip size="xs" side="right" title="Actually Connected" body="MW of large load interconnection requests that have completed the full process and are energized / operational. In ERCOT this is ~7.5 GW out of 233 GW total requests — a 3.2% connection rate. The gap reflects how new and overwhelmed large load queues are; many projects are years away from energization even if approved." />
            </div>
            <div className="text-sm font-bold text-emerald-400">
              {snap.actually_connected_mw ? fgw(snap.actually_connected_mw) : "—"}
            </div>
            {connectedPct && (
              <div className="text-[9px] text-muted-foreground">{connectedPct}% of requests</div>
            )}
          </div>
          <div className="bg-muted/30 rounded px-2 py-1.5">
            <div className="flex items-center gap-0.5 text-[9px] text-muted-foreground mb-0.5">
              No Study
              <MethodologyTip size="xs" side="left" title="No Transmission Study Submitted" body="Projects that have filed an interconnection request but have not yet submitted the required transmission study. In ERCOT, 128 GW of the 233 GW queue — 55% — falls into this category. Projects without a submitted study are the most speculative tier: they have expressed interest but made no financial or technical commitment. ERCOT's $100K SB6 fee is specifically designed to reduce this pool." sources={[{ label: "BIC Magazine: ERCOT 128 GW no study", url: "https://www.bicmagazine.com/industry/powergen/texas-grid-sees-233-gw-data-center-requests-much-real/" }]} />
            </div>
            <div className="text-sm font-bold text-red-400">
              {snap.no_study_submitted_mw ? fgw(snap.no_study_submitted_mw) : "—"}
            </div>
            {snap.no_study_submitted_mw && snap.total_request_mw && (
              <div className="text-[9px] text-muted-foreground">
                {((snap.no_study_submitted_mw / snap.total_request_mw) * 100).toFixed(0)}% speculative
              </div>
            )}
          </div>
        </div>
      )}

      {/* Speculative meter — ERCOT only since we have the data */}
      {snap.rto_id === 'ERCOT' && snap.total_request_mw && (
        <div className="mb-3">
          <div className="text-[9px] text-muted-foreground mb-1.5">Queue composition</div>
          <div className="h-4 rounded-full overflow-hidden flex gap-px">
            <div style={{ width: `${((snap.actually_connected_mw ?? 0) / snap.total_request_mw) * 100}%`, background: "#10b981" }}
              title={`Connected: ${fgw(snap.actually_connected_mw)}`} />
            <div style={{ width: `${((snap.under_study_mw ?? 0) / snap.total_request_mw) * 100}%`, background: "#f59e0b" }}
              title={`Under study: ${fgw(snap.under_study_mw)}`} />
            <div style={{ width: `${((snap.no_study_submitted_mw ?? 0) / snap.total_request_mw) * 100}%`, background: "#ef4444" }}
              title={`No study: ${fgw(snap.no_study_submitted_mw)}`} />
          </div>
          <div className="flex items-center gap-3 mt-1">
            {[
              { color: "#10b981", label: `Connected ${fgw(snap.actually_connected_mw)}` },
              { color: "#f59e0b", label: `Under study ${fgw(snap.under_study_mw)}` },
              { color: "#ef4444", label: `No study ${fgw(snap.no_study_submitted_mw)}` },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-sm" style={{ background: color }} />
                <span className="text-[9px] text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Process status */}
      <div className="mb-3 px-2 py-1.5 rounded bg-muted/20 border border-border/50">
        <div className="text-[9px] text-muted-foreground mb-0.5 uppercase tracking-wide font-semibold">Process Status</div>
        <p className="text-[10px] text-foreground leading-relaxed">{snap.process_status}</p>
        {snap.min_threshold_mw && (
          <div className="text-[9px] text-muted-foreground mt-1">
            Min threshold: ≥{snap.min_threshold_mw} MW per POI
          </div>
        )}
      </div>

      <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-4 mb-2">{snap.notes}</p>

      {snap.source_url && (
        <a href={snap.source_url} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline">
          Source <ExternalLink size={9} />
        </a>
      )}
    </div>
  );
}

// ── Gen queue context table ────────────────────────────────────────────────────
function GenQueueContext({ genSnapshots }: { genSnapshots: any[] }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-1">
        <BarChart2 size={13} className="text-muted-foreground" />
        <h2 className="text-sm font-semibold text-foreground">Generation Queue Context</h2>
        <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground border border-border ml-1">Secondary</span>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        The generation interconnection queue (solar, wind, storage, gas waiting to connect supply-side) is separate from — and less relevant to — large load data center interconnection.
        Shown here for context only. <span className="text-amber-400">High generation queue = supply-side backstop for grid-tied DCs; BTM projects bypass both queues.</span>
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 text-muted-foreground font-medium">RTO</th>
              <th className="text-right py-2 px-3 text-muted-foreground font-medium">Gen Queue</th>
              <th className="text-right py-2 px-3 text-muted-foreground font-medium">Large Load Queue</th>
              <th className="text-right py-2 px-3 text-muted-foreground font-medium">Withdrawal Rate</th>
              <th className="text-right py-2 pl-3 text-muted-foreground font-medium">Avg Wait</th>
              <th className="text-left py-2 pl-4 text-muted-foreground font-medium">Note</th>
            </tr>
          </thead>
          <tbody>
            {GEN_QUEUE_CONTEXT.map(row => {
              const snap = genSnapshots.find(s => s.rto_id === row.rto);
              const cfg = RTO_CFG[row.rto] ?? { color: "#6b7280" };
              return (
                <tr key={row.rto} className="border-b border-border/40 hover:bg-muted/20 transition-colors">
                  <td className="py-2.5 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-sm" style={{ background: cfg.color }} />
                      <span className="font-semibold text-foreground">{row.rto}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-muted-foreground">
                    {snap ? fgw(snap.total_queue_mw) : `${row.genGw} GW`}
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums font-semibold" style={{ color: cfg.color }}>
                    {row.llGw ? `${row.llGw} GW` : <span className="text-muted-foreground font-normal">—</span>}
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-muted-foreground">
                    {snap?.withdrawal_rate_pct ? `${snap.withdrawal_rate_pct}%` : "~75–80%"}
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-muted-foreground">
                    {snap?.avg_wait_yrs ? `${snap.avg_wait_yrs} yrs` : "—"}
                  </td>
                  <td className="py-2.5 pl-4 text-muted-foreground text-[10px]">{row.note}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── WoW change ─────────────────────────────────────────────────────────────────
function WowTable({ llHistory }: { llHistory: any[] }) {
  const rtos = [...new Set(llHistory.map(h => h.rto_id))];

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-1">
        <h2 className="text-sm font-semibold text-foreground">Large Load Queue Trend</h2>
        <MethodologyTip
          title="Week-over-Week Calculation"
          body="Change is calculated by comparing the most recent snapshot date to the prior snapshot date for each RTO. A positive delta (red arrow) means more new large load requests were submitted than withdrew — queue is growing. A negative delta (green) means reforms or financial barriers (like ERCOT's $100K SB6 fee) are filtering out speculative filings. Snapshots are updated each Saturday from official RTO sources."
          sources={[
            { label: "ERCOT Monthly Operational Overview", url: "https://www.ercot.com" },
            { label: "PJM Large Load Adjustment Submissions", url: "https://www.pjm.com" },
          ]}
        />
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Period-over-period change in large load interconnection requests.
        <span className="text-red-400 ml-1">Red = queue growing (more new requests than withdrawals — bad for grid-tied projects).</span>
        <span className="text-emerald-400 ml-1">Green = queue shrinking (reforms filtering speculative filings — good).</span>
      </p>

      <div className="space-y-3">
        {rtos.map(rto => {
          const cfg = RTO_CFG[rto] ?? { color: "#6b7280" };
          const snaps = llHistory.filter(h => h.rto_id === rto).sort((a, b) => a.snapshot_date.localeCompare(b.snapshot_date));
          if (snaps.length < 2 || !snaps[0].total_request_mw || !snaps[1].total_request_mw) {
            // Single snap or no data — just show latest
            const latest = snaps[snaps.length - 1];
            return (
              <div key={rto} className="flex items-center gap-3 py-2 border-b border-border/40">
                <div className="w-2 h-2 rounded-sm shrink-0" style={{ background: cfg.color }} />
                <span className="text-xs font-semibold text-foreground w-16">{rto}</span>
                {latest?.total_request_mw ? (
                  <span className="text-xs tabular-nums font-semibold" style={{ color: cfg.color }}>
                    {fgw(latest.total_request_mw)}
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground italic">No formal queue published</span>
                )}
              </div>
            );
          }
          const prev = snaps[snaps.length - 2];
          const curr = snaps[snaps.length - 1];
          const delta = curr.total_request_mw - prev.total_request_mw;
          const deltaPct = ((delta / prev.total_request_mw) * 100).toFixed(0);

          return (
            <div key={rto} className="flex items-center gap-3 py-2 border-b border-border/40">
              <div className="w-2 h-2 rounded-sm shrink-0" style={{ background: cfg.color }} />
              <span className="text-xs font-semibold text-foreground w-16">{rto}</span>
              <span className="text-xs tabular-nums font-semibold w-16" style={{ color: cfg.color }}>
                {fgw(curr.total_request_mw)}
              </span>
              <div className="flex items-center gap-1">
                {delta > 0
                  ? <ArrowUp size={11} className="text-red-400" />
                  : delta < 0
                  ? <ArrowDown size={11} className="text-emerald-400" />
                  : <Minus size={11} className="text-muted-foreground" />}
                <span className={`text-xs font-semibold tabular-nums ${delta > 0 ? "text-red-400" : delta < 0 ? "text-emerald-400" : "text-muted-foreground"}`}>
                  {delta > 0 ? "+" : ""}{fgw(delta)} ({delta > 0 ? "+" : ""}{deltaPct}%)
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground ml-auto">
                {prev.snapshot_date} → {curr.snapshot_date}
              </span>
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-muted-foreground mt-3 border-t border-border pt-3">
        The Saturday sweep pulls updated large load queue figures from ERCOT Monthly Ops Overview, PJM large load adjustment data, and other official RTO publications.
      </p>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function QueueIntelligence() {
  const { data: llData, isLoading: llLoading } = useQuery<{ snapshots: any[]; history: any[] }>({
    queryKey: ["/api/queue/large-load"],
    queryFn: () => apiRequest("GET", "/api/queue/large-load").then(r => r.json()),
  });
  const { data: genData, isLoading: genLoading } = useQuery<{ snapshots: any[]; history: any[] }>({
    queryKey: ["/api/queue"],
    queryFn: () => apiRequest("GET", "/api/queue").then(r => r.json()),
  });

  const llSnaps = llData?.snapshots ?? [];
  const llHistory = llData?.history ?? [];
  const genSnaps = genData?.snapshots ?? [];

  const totalLLGw = llSnaps.filter(s => s.total_request_mw).reduce((s: number, r: any) => s + (r.total_request_mw ?? 0), 0) / 1000;
  const totalConnectedGw = llSnaps.filter(s => s.actually_connected_mw).reduce((s: number, r: any) => s + (r.actually_connected_mw ?? 0), 0) / 1000;

  return (
    <Layout>
      <div className="border-b border-border px-6 py-4 bg-card/50 sticky top-0 z-10 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Activity size={15} className="text-primary" />
              <h1 className="text-lg font-bold text-foreground">Queue Intelligence</h1>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              <span className="text-primary font-medium">Large load interconnection requests</span> — data centers, hyperscalers, industrial · with generation queue as secondary context
            </p>
          </div>
          {!llLoading && (
            <div className="flex items-center gap-5 text-right">
              <div>
                <div className="text-lg font-bold text-foreground tabular-nums">290+ GW</div>
                <div className="text-[10px] text-muted-foreground">large load requests</div>
              </div>
              <div>
                <div className="text-lg font-bold text-emerald-400 tabular-nums">{totalConnectedGw.toFixed(1)} GW</div>
                <div className="text-[10px] text-muted-foreground">actually connected</div>
              </div>
              <div>
                <div className="text-lg font-bold text-amber-400 tabular-nums">~2.6%</div>
                <div className="text-[10px] text-muted-foreground">connection rate</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="px-6 py-5 space-y-6">
        {/* Primary: Reality Check */}
        <RealityCheck />

        {/* WoW trend */}
        {llLoading ? <Skeleton className="h-40 rounded-xl" /> : <WowTable llHistory={llHistory} />}

        {/* Large load per-RTO cards */}
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3">Large Load Queue by RTO</h2>
          {llLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {llSnaps.map((snap: any) => <LargeLoadCard key={snap.rto_id} snap={snap} />)}
            </div>
          )}
        </div>

        {/* BTM callout */}
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Zap size={14} className="text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-emerald-400 mb-1">
                BTM projects skip both the generation queue and the large load queue
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                A grid-tied data center in PJM must navigate both queues: first the large load queue (1–5 years) to get grid capacity allocated, then potentially the generation queue (8+ years) if they bring their own generation. A fully BTM or off-grid project skips both entirely — it never touches a public interconnection process. With ERCOT only having 2.6% of large load requests actually connected, the time value of BTM is enormous.
              </p>
              <Link href="/map">
                <a className="inline-flex items-center gap-1 text-[10px] text-emerald-400 hover:underline mt-1.5">
                  View queue-bypass projects on map <ChevronRight size={9} />
                </a>
              </Link>
            </div>
          </div>
        </div>

        {/* Secondary: Gen queue context */}
        {genLoading ? <Skeleton className="h-40 rounded-xl" /> : <GenQueueContext genSnapshots={genSnaps} />}
      </div>
    </Layout>
  );
}
