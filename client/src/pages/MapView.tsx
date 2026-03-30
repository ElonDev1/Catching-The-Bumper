import { useQuery } from "@tanstack/react-query";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import Layout from "@/components/Layout";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, X, Layers, ChevronRight, Globe, AlertCircle, Clock, DollarSign, Zap, TrendingUp } from "lucide-react";
import MethodologyTip from "@/components/MethodologyTip";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { RTO_POLYGONS_OFFICIAL } from "@/lib/rtoPolygons";

// ── Corrected RTO state assignments (based on official FERC/RTO membership) ──
// Note: Several states are split between RTOs; we use the dominant load-serving RTO
const STATE_TO_RTO: Record<string, string> = {
  // ERCOT — Texas (85% of state)
  TX: "ERCOT",
  // PJM — 13 states + DC
  DE:"PJM", MD:"PJM", NJ:"PJM", PA:"PJM", VA:"PJM", WV:"PJM",
  NC:"PJM", TN:"PJM", DC:"PJM",
  OH:"PJM",   // majority PJM
  KY:"PJM",   // majority PJM (Duke Energy KY is PJM)
  IN:"PJM",   // majority PJM by load (NIPSCO is PJM)
  // MISO — 15 states + Manitoba
  MN:"MISO", IA:"MISO", WI:"MISO", MO:"MISO",
  ND:"MISO", SD:"MISO", MT:"MISO",
  AR:"MISO", LA:"MISO", MS:"MISO",
  IL:"MISO",  // majority MISO (ComEd northern IL is PJM exception)
  MI:"MISO",  // majority MISO
  // SPP — 14 states (central plains)
  KS:"SPP", OK:"SPP", NE:"SPP", WY:"SPP", CO:"SPP",
  NM:"SPP",   // eastern NM is SPP
  // NYISO
  NY:"NYISO",
  // ISO-NE
  ME:"ISONE", NH:"ISONE", VT:"ISONE", MA:"ISONE", RI:"ISONE", CT:"ISONE",
  // CAISO
  CA:"CAISO",
  // WECC non-CAISO West
  WA:"WECC", OR:"WECC", ID:"WECC", NV:"WECC", AZ:"WECC", UT:"WECC",
  AK:"OTHER", HI:"OTHER",
};

function getRto(state: string | null, country: string | null): string {
  if (!state || state === "USA") {
    if (country === "UAE" || country === "Canada" || country === "Singapore") return "INTL";
    return "OTHER";
  }
  return STATE_TO_RTO[state] ?? "OTHER";
}

// ── Interconnection type classification ──────────────────────────────────────
function getInterconnectType(p: any): "off_grid" | "btm_colocation" | "btm_hybrid" | "grid_standard" {
  if (p.fullyOffGrid) return "off_grid";
  if (p.hasBtm && !p.gridTied) return "btm_colocation";
  if (p.hasBtm) return "btm_hybrid";
  return "grid_standard";
}

const IC = {
  off_grid:       { color: "#ef4444", label: "Fully Off-Grid",       desc: "Zero grid dependency — bypasses interconnection entirely", ring: true  },
  btm_colocation: { color: "#f97316", label: "BTM Co-location",      desc: "Dedicated on-site generation, no grid netting required",  ring: true  },
  btm_hybrid:     { color: "#3b82f6", label: "BTM + Grid Hybrid",    desc: "On-site generation with grid backstop",                   ring: false },
  grid_standard:  { color: "#6b7280", label: "Grid-Tied (Standard)", desc: "Standard grid interconnection queue",                     ring: false },
};

// ── RTO data: accurate polygons + economics ──────────────────────────────────
// Polygons are simplified but state-accurate (not county-precise)
const RTO_DATA: Record<string, {
  label: string; color: string; statusLabel: string; status: string;
  queueWaitYrs: number; avgPriceMwh: number; queueGw: number;
  btmOutlook: string; macroId: string;
  polygon: [number, number][];
}> = {
  ERCOT: {
    label: "ERCOT", color: "#10b981",
    statusLabel: "Most Permissive — No FERC Jurisdiction",
    status: "favorable",
    queueWaitYrs: 2.5, avgPriceMwh: 32, queueGw: 290,
    btmOutlook: "Highly favorable. No federal BTM netting restrictions. Fastest BTM gas deployment market in the US.",
    macroId: "ercot",
  },
  PJM: {
    label: "PJM", color: "#f59e0b",
    statusLabel: "Compliance Filing Under Review",
    status: "compliance",
    queueWaitYrs: 8, avgPriceMwh: 48, queueGw: 280,
    btmOutlook: "Transitional. 50 MW BTM netting cap effective July 2026. Co-location permitted via 3 new TX service options. 8-year queue is the key driver of BTM demand.",
    macroId: "pjm",
  },
  MISO: {
    label: "MISO", color: "#3b82f6",
    statusLabel: "Zero-Injection Framework Developing",
    status: "developing",
    queueWaitYrs: 4.5, avgPriceMwh: 38, queueGw: 480,
    btmOutlook: "Developing. Zero-injection agreement concept favorable for full BTM — no netting restrictions. GenCo utility model (NIPSCO/Amazon) is the live test case.",
    macroId: "miso",
  },
  SPP: {
    label: "SPP", color: "#8b5cf6",
    statusLabel: "Monitoring FERC ANOPR",
    status: "monitoring",
    queueWaitYrs: 3.5, avgPriceMwh: 35, queueGw: 320,
    btmOutlook: "Neutral. No formal BTM proceedings. Wind-rich region with emerging BTM gas + hybrid opportunities. Lower land/energy costs than PJM or MISO.",
    macroId: "spp",
  },
  NYISO: {
    label: "NYISO", color: "#6b7280",
    statusLabel: "Monitoring PJM / FERC",
    status: "monitoring",
    queueWaitYrs: 5, avgPriceMwh: 58, queueGw: 90,
    btmOutlook: "Restrictive. CLCPA mandates 70% renewable by 2030. New gas BTM politically difficult. Nuclear co-location more viable. High electricity prices drive BTM economics.",
    macroId: "nyiso",
  },
  ISONE: {
    label: "ISO-NE", color: "#94a3b8",
    statusLabel: "Monitoring FERC ANOPR",
    status: "monitoring",
    queueWaitYrs: 4, avgPriceMwh: 55, queueGw: 40,
    btmOutlook: "Mixed. Highest power prices in continental US make BTM economics compelling. Limited gas pipeline capacity constrains new BTM gas projects.",
    macroId: "isone",
  },
  CAISO: {
    label: "CAISO", color: "#a855f7",
    statusLabel: "Issue Paper Stage",
    status: "early",
    queueWaitYrs: 4, avgPriceMwh: 52, queueGw: 210,
    btmOutlook: "Restrictive for gas BTM. CARB air quality rules make new gas turbine permits difficult. Storage + solar BTM more viable. 1.8 GW incremental DC load projected by 2030.",
    macroId: "caiso",
  },
};

const TECH_COLORS: Record<string, string> = {
  gas_turbine: "#3b82f6", recip_engine: "#f59e0b", fuel_cell: "#10b981",
  nuclear_smr: "#a855f7", nuclear_existing: "#7c3aed", battery: "#22c55e",
  solar: "#fbbf24", wind: "#06b6d4", diesel: "#9ca3af",
};
const TECH_LABELS: Record<string, string> = {
  gas_turbine: "Gas Turbine", recip_engine: "Recip Engine", fuel_cell: "Fuel Cell",
  nuclear_smr: "SMR Nuclear", nuclear_existing: "Nuclear (Existing)",
  battery: "Battery/BESS", solar: "Solar", wind: "Wind", diesel: "Diesel",
};
const STATUS_DOT: Record<string, string> = {
  announced: "bg-amber-400", under_construction: "bg-blue-400",
  operational: "bg-emerald-400", planned: "bg-slate-400",
};

function fmw(mw: number | null) {
  if (!mw) return "";
  return mw >= 1000 ? `${(mw / 1000).toFixed(1)} GW` : `${mw} MW`;
}
function primaryTech(p: any): string {
  const s = p.btmSources ?? [];
  if (!s.length) return "gas_turbine";
  return [...s].sort((a: any, b: any) => (b.capacityMw ?? 0) - (a.capacityMw ?? 0))[0]?.technologyType ?? "gas_turbine";
}

// Estimate $/MWh savings from BTM vs grid
function btmSavingsLabel(p: any, rtoId: string): string | null {
  const rto = RTO_DATA[rtoId];
  if (!rto || !p.btmCapacityMw) return null;
  const gridPrice = rto.avgPriceMwh;
  // BTM natural gas generation is typically $25-35/MWh all-in
  const btmCost = 30;
  const savingsPerMwh = gridPrice - btmCost;
  if (savingsPerMwh <= 0) return null;
  const annualMwh = p.btmCapacityMw * 8760 * 0.85; // 85% capacity factor
  const annualSavingsM = (annualMwh * savingsPerMwh) / 1_000_000;
  return `~$${annualSavingsM.toFixed(0)}M/yr savings vs grid`;
}

// ── Leaflet map component ─────────────────────────────────────────────────────
function LeafletMap({ projects, showRto, selectedRto, onSelectRto, onSelectProject, selectedProjectId, showAdvancedOnly, flyToProject }: {
  projects: any[]; showRto: boolean; selectedRto: string | null;
  onSelectRto: (rto: string | null) => void; onSelectProject: (p: any) => void;
  selectedProjectId: number | null; showAdvancedOnly: boolean; flyToProject: any;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const polysRef = useRef<any[]>([]);

  useEffect(() => {
    if (!mapRef.current || leafletRef.current) return;
    const map = L.map(mapRef.current, { center: [38.5, -96.0], zoom: 4, zoomControl: true, preferCanvas: true });
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '© OpenStreetMap © CARTO', maxZoom: 19,
    }).addTo(map);
    leafletRef.current = map;
    return () => { map.remove(); leafletRef.current = null; };
  }, []);

  // Fly to selected project
  useEffect(() => {
    const map = leafletRef.current;
    if (!map || !flyToProject?.lat) return;
    map.flyTo([flyToProject.lat, flyToProject.lng], 7, { duration: 1.2, easeLinearity: 0.25 });
  }, [flyToProject]);

  // RTO polygons
  useEffect(() => {
    const map = leafletRef.current;
    if (!map) return;
    polysRef.current.forEach(p => p.remove());
    polysRef.current = [];
    if (!showRto) return;

    Object.entries(RTO_DATA).forEach(([rtoId, cfg]) => {
      const rings = RTO_POLYGONS_OFFICIAL[rtoId];
      if (!rings?.length) return;
      const isSelected = selectedRto === rtoId;

      // Draw all rings (multi-polygon RTOs like MISO, SPP have Gulf Coast fragments)
      rings.forEach((ring) => {
        const p = L.polygon(ring as any, {
          color: cfg.color,
          fillColor: cfg.color,
          fillOpacity: isSelected ? 0.20 : 0.07,
          weight: isSelected ? 2.5 : 1,
          opacity: isSelected ? 1 : 0.6,
          dashArray: isSelected ? undefined : "5 5",
          interactive: true,
        }).addTo(map);
        p.on("click", () => onSelectRto(selectedRto === rtoId ? null : rtoId));
        polysRef.current.push(p);
      });

      // Label + badge centered on the largest ring
      const biggestRing = [...rings].sort((a, b) => b.length - a.length)[0];
      const center = L.polygon(biggestRing as any).getBounds().getCenter();
      const isAdv = rtoId === "ERCOT";

      const labelHtml = `<div style="
        background:${cfg.color}${isSelected ? "28" : "14"};
        border:1px solid ${cfg.color}${isSelected ? "99" : "44"};
        color:${cfg.color};padding:2px 8px;border-radius:4px;
        font-size:${isSelected ? 12 : 10}px;font-weight:700;
        letter-spacing:.07em;white-space:nowrap;cursor:pointer;
        box-shadow:${isSelected ? `0 2px 12px ${cfg.color}33` : "none"};
      ">${cfg.label}${isAdv ? " ⚡" : ""}</div>`;

      const labelIcon = L.divIcon({ html: labelHtml, className: "", iconAnchor: [28, 10] });
      const label = L.marker(center, { icon: labelIcon, interactive: true, zIndexOffset: 10 }).addTo(map);

      const badgeHtml = `<div style="
        background:#0f172a;border:1px solid ${cfg.color}44;
        color:${cfg.color};padding:1px 5px;border-radius:3px;
        font-size:9px;font-weight:600;white-space:nowrap;
        opacity:${isSelected ? 1 : 0.7};
      ">⏱ ${cfg.queueWaitYrs}yr queue · $${cfg.avgPriceMwh}/MWh</div>`;
      const badgeIcon = L.divIcon({ html: badgeHtml, className: "", iconAnchor: [40, -4] });
      const badge = L.marker([center.lat - 1.2, center.lng], { icon: badgeIcon, interactive: false }).addTo(map);

      label.on("click", () => onSelectRto(selectedRto === rtoId ? null : rtoId));
      polysRef.current.push(label, badge);
    });
  }, [showRto, selectedRto]);

  // Project markers
  useEffect(() => {
    const map = leafletRef.current;
    if (!map) return;
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const mappable = projects.filter(p => p.lat && p.lng);
    mappable.forEach((p: any) => {
      const itype = getInterconnectType(p);
      const cfg = IC[itype];
      const rtoId = getRto(p.state, p.country);
      const isSelected = p.id === selectedProjectId;
      const isAdv = itype === "off_grid" || itype === "btm_colocation";
      const isDimmed = showAdvancedOnly && !isAdv;

      const radius = isSelected ? 13 : isAdv ? 9 : 6;

      const marker = L.circleMarker([p.lat, p.lng], {
        radius,
        color: isSelected ? "#ffffff" : cfg.color,
        fillColor: cfg.color,
        fillOpacity: isDimmed ? 0.1 : isSelected ? 1 : 0.88,
        weight: isSelected ? 3 : isAdv ? 2 : 1.5,
        opacity: isDimmed ? 0.2 : 1,
      }).addTo(map);

      // Pulsing ring for advanced projects
      if (cfg.ring && !isDimmed) {
        const sz = (radius + 6) * 2;
        const ringIcon = L.divIcon({
          html: `<div style="width:${sz}px;height:${sz}px;border-radius:50%;border:1.5px solid ${cfg.color}55;animation:mapPulse 2.2s ease-in-out infinite;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%)"></div>`,
          className: "", iconAnchor: [0, 0],
        });
        const ring = L.marker([p.lat, p.lng], { icon: ringIcon, interactive: false, zIndexOffset: -1 }).addTo(map);
        markersRef.current.push(ring);
      }

      const savings = btmSavingsLabel(p, rtoId);
      const tech = primaryTech(p);
      const tip = `
        <div style="min-width:180px">
          <div style="font-size:12px;font-weight:700;color:#f8fafc;margin-bottom:4px">${p.name}</div>
          <div style="font-size:10px;color:#94a3b8;margin-bottom:6px">${p.location ?? ""}</div>
          <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:6px">
            <span style="font-size:9px;padding:1px 5px;border-radius:3px;background:${cfg.color}22;color:${cfg.color};border:1px solid ${cfg.color}44">${cfg.label}</span>
            <span style="font-size:9px;padding:1px 5px;border-radius:3px;background:#ffffff12;color:#64748b">${rtoId}</span>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-bottom:${savings ? 6 : 0}px">
            ${p.capacityMw ? `<div><div style="font-size:11px;font-weight:700;color:#f8fafc">${fmw(p.capacityMw)}</div><div style="font-size:9px;color:#64748b">IT Load</div></div>` : ""}
            ${p.btmCapacityMw ? `<div><div style="font-size:11px;font-weight:700;color:${cfg.color}">${fmw(p.btmCapacityMw)}</div><div style="font-size:9px;color:#64748b">BTM Gen</div></div>` : ""}
          </div>
          ${savings ? `<div style="font-size:9px;color:#10b981;background:#10b98114;border:1px solid #10b98133;border-radius:3px;padding:2px 6px">${savings}</div>` : ""}
        </div>`;
      marker.bindTooltip(tip, { direction: "top", offset: [0, -radius], opacity: 0.97, sticky: false });
      marker.on("click", () => onSelectProject(p));
      markersRef.current.push(marker);
    });
  }, [projects, selectedProjectId, showAdvancedOnly]);

  return <div ref={mapRef} style={{ width: "100%", height: "100%" }} />;
}

// ── RTO panel ─────────────────────────────────────────────────────────────────
function RtoPanelContent({ rtoId, projects, rtos }: { rtoId: string; projects: any[]; rtos: any[] }) {
  const cfg = RTO_DATA[rtoId];
  if (!cfg) return null;
  const rtoProjects = projects.filter(p => getRto(p.state, p.country) === rtoId);
  const advanced = rtoProjects.filter(p => { const t = getInterconnectType(p); return t === "off_grid" || t === "btm_colocation"; });
  const totalBtmMw = rtoProjects.reduce((s, p) => s + (p.btmCapacityMw ?? 0), 0);
  const regulatory = rtos?.find((r: any) => r.id === cfg.macroId);

  return (
    <div className="flex-1 overflow-y-auto text-xs">
      {/* Header */}
      <div className="px-3 py-3 border-b border-border" style={{ borderLeft: `3px solid ${cfg.color}` }}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-bold text-foreground">{cfg.label}</span>
          <span className="text-[9px] font-medium px-1.5 py-0.5 rounded border"
            style={{ background: `${cfg.color}18`, color: cfg.color, borderColor: `${cfg.color}44` }}>
            {cfg.statusLabel}
          </span>
        </div>
        <div className="text-[10px] text-muted-foreground">
          {rtoProjects.length} tracked projects · {fmw(totalBtmMw)} BTM
          {advanced.length > 0 && <span className="text-orange-400 ml-1">· {advanced.length} bypassing queue</span>}
        </div>
      </div>

      {/* Economics strip */}
      <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
        <div className="px-3 py-2 text-center">
          <div className="flex items-center justify-center gap-0.5 mb-0.5">
            <Clock size={9} className="text-muted-foreground" />
            <MethodologyTip size="xs" side="right" title="Queue Wait Time" body="Average time from initial generation interconnection request to commercial operation. Based on LBNL Queued Up 2025 and RMI March 2026 analysis. In 2025, projects that became operational spent an average of 8 years in the PJM queue. ERCOT is fastest at ~2.5 years due to no FERC jurisdiction. Note: large load queue wait times are often shorter (1-3 years) but still longer than BTM." sources={[{ label: "LBNL Queued Up 2025", url: "https://emp.lbl.gov/queues" }, { label: "RMI March 2026", url: "https://rmi.org/interconnection-reform-ai-data-centers-generator-queues/" }]} />
          </div>
          <div className="font-bold text-foreground" style={{ color: cfg.queueWaitYrs >= 6 ? "#ef4444" : cfg.queueWaitYrs >= 4 ? "#f59e0b" : "#10b981" }}>
            {cfg.queueWaitYrs} yrs
          </div>
          <div className="text-[9px] text-muted-foreground">Queue wait</div>
        </div>
        <div className="px-3 py-2 text-center">
          <div className="flex items-center justify-center gap-0.5 mb-0.5">
            <DollarSign size={9} className="text-muted-foreground" />
            <MethodologyTip size="xs" side="right" title="Average Wholesale Power Price" body="Average day-ahead wholesale electricity price at major hubs within this RTO for 2025. Used to estimate the economic value of BTM generation vs grid-purchased power. A BTM gas project costs approximately $25-35/MWh all-in — the spread between this and the grid price is the annual savings per MWh of BTM capacity." sources={[{ label: "EIA: US wholesale prices rose in 2025", url: "https://www.eia.gov/todayinenergy/detail.php?id=67106" }, { label: "Utility Dive: wholesale price forecasts 2025" }]} />
          </div>
          <div className="font-bold text-foreground">${cfg.avgPriceMwh}</div>
          <div className="text-[9px] text-muted-foreground">Avg $/MWh</div>
        </div>
        <div className="px-3 py-2 text-center">
          <div className="flex items-center justify-center gap-0.5 mb-0.5">
            <TrendingUp size={9} className="text-muted-foreground" />
            <MethodologyTip size="xs" side="left" title="Generation Queue Size" body="Total MW of generation projects (solar, wind, storage, gas) actively seeking grid interconnection in this RTO's queue as of latest available data. This is the generation interconnection queue — distinct from the large load queue. A large generation queue can indicate future supply availability but also queue congestion that slows individual project timelines." sources={[{ label: "LBNL Queued Up 2025", url: "https://emp.lbl.gov/queues" }]} />
          </div>
          <div className="font-bold text-foreground">{cfg.queueGw} GW</div>
          <div className="text-[9px] text-muted-foreground">Gen queue size</div>
        </div>
      </div>

      {/* BTM outlook */}
      <div className="px-3 py-2 border-b border-border bg-muted/10">
        <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">BTM Outlook</div>
        <p className="text-[10px] text-muted-foreground leading-relaxed">{cfg.btmOutlook}</p>
      </div>

      {/* Advanced projects highlight */}
      {advanced.length > 0 && (
        <div className="px-3 py-2 border-b border-border">
          <div className="flex items-center gap-1.5 mb-1.5">
            <AlertCircle size={10} className="text-orange-400" />
            <span className="text-[9px] font-semibold text-orange-400 uppercase tracking-wide">Queue-Bypassing Projects</span>
          </div>
          <div className="space-y-1.5">
            {advanced.map((p: any) => {
              const t = getInterconnectType(p);
              const ic = IC[t];
              const savings = btmSavingsLabel(p, rtoId);
              return (
                <div key={p.id} className="rounded px-2 py-1.5" style={{ background: `${ic.color}10`, border: `1px solid ${ic.color}28` }}>
                  <div className="font-semibold text-foreground truncate" style={{ fontSize: 10 }}>{p.name}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[9px]" style={{ color: ic.color }}>{ic.label}</span>
                    {p.btmCapacityMw && <span className="text-[9px] text-muted-foreground">{fmw(p.btmCapacityMw)}</span>}
                    {savings && <span className="text-[9px] text-emerald-400">{savings.replace("~", "")}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Regulatory status from macro power DB */}
      {regulatory && (
        <div className="px-3 py-2 border-b border-border">
          <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Regulatory</div>
          <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-3">{regulatory.summary}</p>
          {regulatory.nextMilestone && (
            <div className="mt-1 text-[10px] font-medium" style={{ color: cfg.color }}>
              → {regulatory.nextMilestone.split("—")[0].trim()}
            </div>
          )}
          <Link href="/macro">
            <a className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline mt-1.5">
              Full regulatory detail <ChevronRight size={9} />
            </a>
          </Link>
        </div>
      )}

      {/* All projects */}
      <div className="px-3 py-2">
        <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
          All Projects ({rtoProjects.length})
        </div>
        {rtoProjects.map((p: any) => {
          const t = getInterconnectType(p);
          const ic = IC[t];
          return (
            <div key={p.id} className="flex items-center gap-2 py-1.5 border-b border-border/30 last:border-0">
              <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: ic.color }} />
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-medium text-foreground truncate">{p.name}</div>
                <div className="text-[9px] text-muted-foreground">{ic.label}</div>
              </div>
              {p.btmCapacityMw && <span className="text-[9px] font-semibold shrink-0" style={{ color: ic.color }}>{fmw(p.btmCapacityMw)}</span>}
            </div>
          );
        })}
        {rtoProjects.length === 0 && <p className="text-[10px] text-muted-foreground italic">No mapped projects in this region.</p>}
      </div>
    </div>
  );
}

// ── Project detail panel ──────────────────────────────────────────────────────
function ProjectPanel({ project: p, onClose }: { project: any; onClose: () => void }) {
  const itype = getInterconnectType(p);
  const ic = IC[itype];
  const rtoId = getRto(p.state, p.country);
  const rtoCfg = RTO_DATA[rtoId];
  const techs: string[] = [...new Set(p.btmSources?.map((b: any) => b.technologyType) ?? [])];
  const savings = btmSavingsLabel(p, rtoId);

  return (
    <div className="border-t border-border p-3 shrink-0" style={{ borderLeft: `3px solid ${ic.color}` }}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <div className="text-xs font-semibold text-foreground leading-snug">{p.name}</div>
          {p.operator && <div className="text-[10px] text-muted-foreground mt-0.5">{p.operator.name}</div>}
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground shrink-0 mt-0.5"><X size={13} /></button>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap mb-2">
        <span className="text-[9px] font-medium px-1.5 py-0.5 rounded border"
          style={{ background: `${ic.color}18`, color: ic.color, borderColor: `${ic.color}44` }}>
          {ic.label}
        </span>
        {rtoId !== "OTHER" && rtoId !== "INTL" && rtoCfg && (
          <span className="text-[9px] px-1.5 py-0.5 rounded border"
            style={{ background: `${rtoCfg.color}14`, color: rtoCfg.color, borderColor: `${rtoCfg.color}40` }}>
            {rtoId} · {rtoCfg.queueWaitYrs}yr queue
          </span>
        )}
        {p.location && (
          <span className="flex items-center gap-0.5 text-[9px] text-muted-foreground">
            <MapPin size={8} />{p.location}
          </span>
        )}
      </div>

      <div className="flex gap-3 flex-wrap mb-2">
        {p.capacityMw && <div><div className="text-sm font-bold text-foreground">{fmw(p.capacityMw)}</div><div className="text-[9px] text-muted-foreground">IT Load</div></div>}
        {p.btmCapacityMw && <div><div className="text-sm font-bold" style={{ color: ic.color }}>{fmw(p.btmCapacityMw)}</div><div className="text-[9px] text-muted-foreground">BTM Gen</div></div>}
        {p.totalInvestmentB && <div><div className="text-sm font-bold text-foreground">${p.totalInvestmentB}B</div><div className="text-[9px] text-muted-foreground">Investment</div></div>}
      </div>

      {savings && (
        <div className="text-[10px] px-2 py-1 rounded mb-2" style={{ background: "#10b98114", color: "#10b981", border: "1px solid #10b98130" }}>
          {savings} vs grid at ${rtoCfg?.avgPriceMwh ?? "??"}/MWh
        </div>
      )}

      <p className="text-[10px] text-muted-foreground italic mb-2">{ic.desc}</p>

      {techs.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {techs.map((t: string) => (
            <span key={t} className="text-[9px] px-1.5 py-0.5 rounded font-medium"
              style={{ background: `${TECH_COLORS[t] ?? "#3b82f6"}22`, color: TECH_COLORS[t] ?? "#3b82f6", border: `1px solid ${TECH_COLORS[t] ?? "#3b82f6"}44` }}>
              {TECH_LABELS[t] ?? t}
            </span>
          ))}
        </div>
      )}

      <Link href={`/projects/${p.id}`}>
        <a className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline">
          Full detail <ChevronRight size={9} />
        </a>
      </Link>
    </div>
  );
}

// ── Project list row ──────────────────────────────────────────────────────────
function ProjectRow({ p, isSelected, onClick }: { p: any; isSelected: boolean; onClick: () => void }) {
  const itype = getInterconnectType(p);
  const ic = IC[itype];
  const rtoId = getRto(p.state, p.country);
  const rtoCfg = RTO_DATA[rtoId];
  return (
    <button onClick={onClick} data-testid={`map-row-${p.id}`}
      className={`w-full text-left px-3 py-2 border-b border-border/40 last:border-0 hover:bg-muted/40 transition-colors ${isSelected ? "bg-primary/5" : ""}`}
      style={isSelected ? { borderLeft: `2px solid ${ic.color}` } : {}}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[11px] font-medium text-foreground truncate">{p.name}</div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: ic.color }} />
            <span className="text-[9px]" style={{ color: ic.color }}>{ic.label}</span>
            {rtoCfg && <span className="text-[9px] text-muted-foreground">· {rtoId}</span>}
          </div>
        </div>
        <div className="flex flex-col items-end gap-0.5 shrink-0">
          {p.btmCapacityMw && <span className="text-[10px] font-semibold" style={{ color: ic.color }}>{fmw(p.btmCapacityMw)}</span>}
          <div className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[p.status] ?? "bg-slate-400"}`} />
        </div>
      </div>
    </button>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function MapView() {
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [selectedRto, setSelectedRto] = useState<string | null>(null);
  const [showRto, setShowRto] = useState(true);
  const [showAdvancedOnly, setShowAdvancedOnly] = useState(false);
  const [techFilter, setTechFilter] = useState("all");
  const [flyToProject, setFlyToProject] = useState<any>(null);

  const { data: projects, isLoading } = useQuery({
    queryKey: ["/api/projects"],
    queryFn: () => apiRequest("GET", "/api/projects").then(r => r.json()),
  });
  const { data: rtos } = useQuery({
    queryKey: ["/api/regulatory"],
    queryFn: () => apiRequest("GET", "/api/regulatory").then(r => r.json()),
  });

  const allMapped = useMemo(() => projects?.filter((p: any) => p.lat && p.lng) ?? [], [projects]);

  const filtered = useMemo(() => {
    if (!projects) return [];
    let list = projects;
    if (techFilter !== "all") list = list.filter((p: any) => p.btmSources?.some((b: any) => b.technologyType === techFilter));
    if (selectedRto) list = list.filter((p: any) => getRto(p.state, p.country) === selectedRto);
    return list;
  }, [projects, techFilter, selectedRto]);

  const advancedCount = useMemo(() => allMapped.filter((p: any) => {
    const t = getInterconnectType(p); return t === "off_grid" || t === "btm_colocation";
  }).length, [allMapped]);

  const totalBtmMw = filtered.reduce((s: number, p: any) => s + (p.btmCapacityMw ?? 0), 0);

  const handleSelectProject = useCallback((p: any) => {
    setSelectedProject(prev => {
      if (prev?.id === p.id) return null;
      setFlyToProject(p);
      return p;
    });
    setSelectedRto(null);
  }, []);

  const handleSelectRto = useCallback((rto: string | null) => {
    setSelectedRto(rto);
    setSelectedProject(null);
  }, []);

  const mapProjects = useMemo(() => {
    if (showAdvancedOnly) return allMapped.filter((p: any) => { const t = getInterconnectType(p); return t === "off_grid" || t === "btm_colocation"; });
    return allMapped;
  }, [allMapped, showAdvancedOnly]);

  return (
    <Layout>
      <style>{`
        @keyframes mapPulse {
          0%,100% { opacity:.55; transform:translate(-50%,-50%) scale(1); }
          50%      { opacity:.15; transform:translate(-50%,-50%) scale(1.7); }
        }
      `}</style>

      <div className="flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="border-b border-border px-6 py-2.5 bg-card/50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Globe size={14} className="text-primary" />
              <span className="text-sm font-semibold text-foreground">Project Map</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <span className="text-xs text-muted-foreground">
              {allMapped.length} mapped · {(totalBtmMw / 1000).toFixed(1)} GW BTM shown ·{" "}
              <span className="text-orange-400 font-medium">{advancedCount} bypassing interconnection queue</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <select value={techFilter} onChange={e => setTechFilter(e.target.value)}
              className="h-7 text-xs bg-secondary border border-border rounded px-2 text-foreground">
              <option value="all">All Technologies</option>
              {Object.entries(TECH_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <button onClick={() => setShowAdvancedOnly(v => !v)}
              className={`flex items-center gap-1.5 px-2.5 h-7 rounded text-xs border transition-colors ${showAdvancedOnly ? "bg-orange-500/10 border-orange-500/30 text-orange-400" : "bg-secondary border-border text-muted-foreground hover:text-foreground"}`}>
              <AlertCircle size={10} /> Queue Bypass
            </button>
            <button onClick={() => setShowRto(v => !v)}
              className={`flex items-center gap-1.5 px-2.5 h-7 rounded text-xs border transition-colors ${showRto ? "bg-primary/10 border-primary/30 text-primary" : "bg-secondary border-border text-muted-foreground hover:text-foreground"}`}>
              <Layers size={10} /> RTO Zones
            </button>
            {(selectedRto || techFilter !== "all" || showAdvancedOnly) && (
              <button onClick={() => { setSelectedRto(null); setTechFilter("all"); setShowAdvancedOnly(false); }}
                className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 px-1.5">
                <X size={10} /> Clear
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-1 min-h-0">
          {/* Side panel */}
          <div className="w-64 shrink-0 border-r border-border flex flex-col bg-card min-h-0">
            {selectedRto ? (
              <>
                <div className="px-3 py-2 border-b border-border flex items-center justify-between shrink-0">
                  <span className="text-[11px] font-semibold text-foreground">{RTO_DATA[selectedRto]?.label ?? selectedRto} Region</span>
                  <button onClick={() => setSelectedRto(null)} className="text-muted-foreground hover:text-foreground"><X size={12} /></button>
                </div>
                <RtoPanelContent rtoId={selectedRto} projects={projects ?? []} rtos={rtos ?? []} />
              </>
            ) : (
              <>
                <div className="px-3 py-2 border-b border-border shrink-0">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                    {filtered.length} Projects
                    {selectedRto && ` in ${selectedRto}`}
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {isLoading
                    ? Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-12 m-2 rounded" />)
                    : filtered.map((p: any) => (
                        <ProjectRow key={p.id} p={p}
                          isSelected={selectedProject?.id === p.id}
                          onClick={() => handleSelectProject(p)} />
                      ))
                  }
                </div>
              </>
            )}
            {selectedProject && !selectedRto && (
              <ProjectPanel project={selectedProject} onClose={() => setSelectedProject(null)} />
            )}
          </div>

          {/* Map */}
          <div className="flex-1 relative min-h-0">
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center bg-muted/10">
                <div className="text-sm text-muted-foreground">Loading map…</div>
              </div>
            ) : (
              <LeafletMap
                projects={mapProjects}
                showRto={showRto}
                selectedRto={selectedRto}
                onSelectRto={handleSelectRto}
                onSelectProject={handleSelectProject}
                selectedProjectId={selectedProject?.id ?? null}
                showAdvancedOnly={showAdvancedOnly}
                flyToProject={flyToProject}
              />
            )}

            {/* Legend */}
            <div className="absolute bottom-4 right-4 z-[1000] bg-card/93 border border-border rounded-lg px-3 py-2.5 backdrop-blur-sm pointer-events-none">
              <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Interconnection Type</div>
              {Object.entries(IC).map(([k, v]) => (
                <div key={k} className="flex items-center gap-2 mb-1">
                  <div className="relative shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: v.color }} />
                    {v.ring && <div className="absolute inset-0 rounded-full border" style={{ borderColor: `${v.color}55`, transform: "scale(1.7)" }} />}
                  </div>
                  <span className="text-[10px] text-muted-foreground">{v.label}</span>
                </div>
              ))}
              <div className="border-t border-border mt-2 pt-2">
                <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">RTO Queue Wait</div>
                <div className="flex items-center gap-1.5 mb-1"><div className="w-2 h-2 rounded-sm bg-emerald-500" /><span className="text-[10px] text-muted-foreground">&lt;3 yrs (ERCOT)</span></div>
                <div className="flex items-center gap-1.5 mb-1"><div className="w-2 h-2 rounded-sm bg-amber-400" /><span className="text-[10px] text-muted-foreground">3–5 yrs (MISO/SPP)</span></div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm bg-red-500" /><span className="text-[10px] text-muted-foreground">5–8 yrs (PJM/NYISO)</span></div>
              </div>
            </div>

            {/* Hint */}
            {showRto && !selectedRto && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none">
                <div className="bg-card/85 border border-border rounded-full px-3 py-1 backdrop-blur-sm">
                  <span className="text-[10px] text-muted-foreground">Click an RTO zone · markers show queue-bypass type · pulsing = advanced interconnection</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
