import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import Layout from "@/components/Layout";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Globe, ExternalLink } from "lucide-react";
import { useState, useMemo } from "react";

const ROLE_LABELS: Record<string, string> = {
  hyperscaler: "Hyperscaler",
  dc_operator: "DC Operator",
  btm_developer: "BTM Developer",
  tech_vendor: "Tech Vendor",
  fuel_supplier: "Fuel / Power",
  investor: "Investor",
};

const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  hyperscaler: { bg: "bg-primary/10", text: "text-primary" },
  dc_operator: { bg: "bg-blue-500/10", text: "text-blue-400" },
  btm_developer: { bg: "bg-purple-500/10", text: "text-purple-400" },
  tech_vendor: { bg: "bg-accent/10", text: "text-accent" },
  fuel_supplier: { bg: "bg-yellow-500/10", text: "text-yellow-400" },
  investor: { bg: "bg-pink-500/10", text: "text-pink-400" },
};

export default function Companies() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const { data: companies, isLoading } = useQuery({
    queryKey: ["/api/companies"],
    queryFn: () => apiRequest("GET", "/api/companies").then((r) => r.json()),
  });

  const filtered = useMemo(() => {
    if (!companies) return [];
    return companies.filter((c: any) => {
      if (roleFilter !== "all" && c.role !== roleFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!c.name.toLowerCase().includes(q) && !c.description?.toLowerCase().includes(q) && !c.hq?.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [companies, search, roleFilter]);

  const grouped = useMemo(() => {
    const g: Record<string, any[]> = {};
    for (const c of filtered) {
      if (!g[c.role]) g[c.role] = [];
      g[c.role].push(c);
    }
    return g;
  }, [filtered]);

  const roleOrder = ["hyperscaler", "dc_operator", "btm_developer", "tech_vendor", "fuel_supplier", "investor"];

  return (
    <Layout>
      <div className="border-b border-border px-6 py-4 bg-card/50 sticky top-0 z-10 backdrop-blur-sm">
        <h1 className="text-lg font-bold text-foreground">Companies</h1>
        <p className="text-xs text-muted-foreground mt-0.5">All players in the data center BTM ecosystem</p>
      </div>

      <div className="px-6 py-5 space-y-5">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search companies…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-sm bg-secondary border-border"
              data-testid="input-company-search"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-40 h-8 text-sm bg-secondary border-border" data-testid="select-role-filter">
              <SelectValue placeholder="All roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {roleOrder.map((r) => (
                <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground ml-auto">{filtered.length} companies</span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {[...Array(9)].map((_, i) => <Skeleton key={i} className="h-36 rounded-xl" />)}
          </div>
        ) : roleFilter === "all" ? (
          // Grouped by role
          <div className="space-y-6">
            {roleOrder.filter((r) => grouped[r]?.length).map((role) => (
              <div key={role}>
                <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">{ROLE_LABELS[role]}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {grouped[role].map((c: any) => <CompanyCard key={c.id} company={c} />)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {filtered.map((c: any) => <CompanyCard key={c.id} company={c} />)}
          </div>
        )}
      </div>
    </Layout>
  );
}

function CompanyCard({ company: c }: { company: any }) {
  const rc = ROLE_COLORS[c.role] ?? { bg: "bg-secondary", text: "text-muted-foreground" };
  return (
    <Link href={`/companies/${c.id}`}>
      <div
        data-testid={`card-company-${c.id}`}
        className="project-card bg-card border border-border rounded-xl p-4 cursor-pointer h-full"
      >
        <div className="flex items-start gap-3 mb-2">
          <div className={`w-9 h-9 rounded-lg ${rc.bg} flex items-center justify-center shrink-0 text-xs font-bold ${rc.text}`}>
            {c.logoInitials ?? c.name.slice(0, 2)}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-foreground truncate">{c.name}</div>
            <span className={`text-[10px] font-medium ${rc.text} ${rc.bg} px-1.5 py-0.5 rounded`}>{ROLE_LABELS[c.role] ?? c.role}</span>
          </div>
          {c.ticker && (
            <span className="text-[10px] tabular text-muted-foreground ml-auto bg-secondary px-1.5 py-0.5 rounded font-mono">{c.ticker}</span>
          )}
        </div>

        {c.hq && (
          <div className="flex items-center gap-1 mb-2">
            <Globe size={10} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{c.hq} · {c.country}</span>
          </div>
        )}

        {c.description && (
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{c.description}</p>
        )}
      </div>
    </Link>
  );
}
