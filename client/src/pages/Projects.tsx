import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import Layout from "@/components/Layout";
import TechBadge, { StatusBadge } from "@/components/TechBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useMemo } from "react";
import { Search, MapPin, Wifi, WifiOff, Zap } from "lucide-react";

export default function Projects() {
  const [search, setSearch] = useState("");
  const [techFilter, setTechFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [btmFilter, setBtmFilter] = useState("all");

  const { data: projects, isLoading } = useQuery({
    queryKey: ["/api/projects"],
    queryFn: () => apiRequest("GET", "/api/projects").then(r => r.json()),
  });

  const filtered = useMemo(() => {
    if (!projects) return [];
    return projects.filter((p: any) => {
      if (btmFilter === "btm" && !p.hasBtm) return false;
      if (btmFilter === "offgrid" && !p.fullyOffGrid) return false;
      if (btmFilter === "gridtied" && (!p.hasBtm || p.fullyOffGrid)) return false;
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (techFilter !== "all" && !p.btmSources?.some((b: any) => b.technologyType === techFilter)) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !p.name.toLowerCase().includes(q) &&
          !p.location?.toLowerCase().includes(q) &&
          !p.operator?.name?.toLowerCase().includes(q) &&
          !p.state?.toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });
  }, [projects, search, techFilter, statusFilter, btmFilter]);

  return (
    <Layout>
      {/* Sticky header */}
      <div className="border-b border-border px-6 py-4 bg-card/50 sticky top-0 z-10 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Zap size={15} className="text-primary" />
              <h1 className="text-lg font-bold text-foreground">Projects</h1>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              AI data center BTM generation announcements · 2024–2026
            </p>
          </div>
          <span className="text-xs text-muted-foreground">{filtered.length} of {projects?.length ?? 0}</span>
        </div>
      </div>

      <div className="px-6 py-5 space-y-5">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              data-testid="input-search"
              placeholder="Search projects, locations, operators…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 h-8 text-sm bg-secondary border-border"
            />
          </div>
          <Select value={btmFilter} onValueChange={setBtmFilter}>
            <SelectTrigger className="w-36 h-8 text-sm bg-secondary border-border">
              <SelectValue placeholder="Power type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              <SelectItem value="btm">Has BTM Gen</SelectItem>
              <SelectItem value="offgrid">Fully Off-Grid</SelectItem>
              <SelectItem value="gridtied">BTM + Grid</SelectItem>
            </SelectContent>
          </Select>
          <Select value={techFilter} onValueChange={setTechFilter}>
            <SelectTrigger className="w-36 h-8 text-sm bg-secondary border-border">
              <SelectValue placeholder="Technology" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tech</SelectItem>
              <SelectItem value="gas_turbine">Gas Turbine</SelectItem>
              <SelectItem value="recip_engine">Recip Engine</SelectItem>
              <SelectItem value="fuel_cell">Fuel Cell</SelectItem>
              <SelectItem value="nuclear_smr">SMR Nuclear</SelectItem>
              <SelectItem value="nuclear_existing">Nuclear Existing</SelectItem>
              <SelectItem value="battery">Battery / BESS</SelectItem>
              <SelectItem value="solar">Solar</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 h-8 text-sm bg-secondary border-border">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="announced">Announced</SelectItem>
              <SelectItem value="under_construction">Under Construction</SelectItem>
              <SelectItem value="operational">Operational</SelectItem>
            </SelectContent>
          </Select>
          {(search || techFilter !== "all" || statusFilter !== "all" || btmFilter !== "all") && (
            <button
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => { setSearch(""); setTechFilter("all"); setStatusFilter("all"); setBtmFilter("all"); }}
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
            {Array.from({ length: 9 }).map((_, i) => <Skeleton key={i} className="h-52 rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
            {filtered.map((p: any) => <ProjectCard key={p.id} project={p} />)}
            {filtered.length === 0 && (
              <div className="col-span-full py-16 text-center text-muted-foreground text-sm">
                No projects match your filters.
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
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
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-foreground leading-snug line-clamp-2">{p.name}</div>
            {p.operator && <div className="text-xs text-muted-foreground mt-0.5">{p.operator.name}</div>}
          </div>
          <StatusBadge status={p.status} />
        </div>

        <div className="flex items-center gap-1.5 mb-3">
          <MapPin size={11} className="text-muted-foreground shrink-0" />
          <span className="text-xs text-muted-foreground truncate">{p.location}</span>
        </div>

        <div className="flex items-center gap-3 mb-3 flex-wrap">
          {p.capacityMw && (
            <div className="text-center">
              <div className="tabular text-base font-bold text-foreground">
                {p.capacityMw >= 1000 ? `${(p.capacityMw/1000).toFixed(1)} GW` : `${p.capacityMw} MW`}
              </div>
              <div className="text-[10px] text-muted-foreground">IT Capacity</div>
            </div>
          )}
          {p.hasBtm && p.btmCapacityMw && (
            <>
              <div className="w-px h-6 bg-border" />
              <div className="text-center">
                <div className="tabular text-base font-bold text-accent">
                  {p.btmCapacityMw >= 1000 ? `${(p.btmCapacityMw/1000).toFixed(1)} GW` : `${p.btmCapacityMw} MW`}
                </div>
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

        {p.hasBtm && (
          <div className="flex items-center gap-1.5 mb-3">
            {p.fullyOffGrid
              ? <><WifiOff size={11} className="text-destructive" /><span className="text-[10px] text-destructive font-medium">Fully Off-Grid</span></>
              : <><Wifi size={11} className="text-accent" /><span className="text-[10px] text-accent font-medium">BTM + Grid Hybrid</span></>
            }
          </div>
        )}

        {techTypes.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {techTypes.slice(0, 3).map((t: any) => <TechBadge key={t} type={t} size="xs" />)}
            {techTypes.length > 3 && <span className="text-[10px] text-muted-foreground self-center">+{techTypes.length - 3}</span>}
          </div>
        )}

        {vendors.length > 0 && (
          <div className="text-[10px] text-muted-foreground mt-1 truncate">
            Vendors: {vendors.slice(0, 3).join(" · ")}{vendors.length > 3 ? ` +${vendors.length - 3}` : ""}
          </div>
        )}
      </div>
    </Link>
  );
}
