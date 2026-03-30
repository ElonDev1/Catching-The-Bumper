import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import Layout from "@/components/Layout";
import TechBadge, { StatusBadge } from "@/components/TechBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, MapPin, Zap, DollarSign, Globe, Building2, Wifi, WifiOff, ExternalLink, Fuel } from "lucide-react";

const ROLE_COLORS: Record<string, string> = {
  customer: "text-primary",
  tech_vendor: "text-accent",
  fuel_supplier: "text-yellow-400",
  btm_developer: "text-purple-400",
  investor: "text-pink-400",
  operator: "text-foreground",
  partner: "text-blue-400",
  epc: "text-orange-400",
};

const ROLE_LABELS: Record<string, string> = {
  customer: "Customer",
  tech_vendor: "Technology Vendor",
  fuel_supplier: "Fuel / Power Supplier",
  btm_developer: "BTM Developer",
  investor: "Investor",
  operator: "Operator",
  partner: "Partner",
  epc: "EPC Contractor",
};

const FUEL_LABELS: Record<string, string> = {
  natural_gas: "Natural Gas",
  hydrogen: "Hydrogen",
  nuclear: "Nuclear",
  solar: "Solar",
  wind: "Wind",
  diesel: "Diesel",
};

export default function ProjectDetail() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const { data: project, isLoading } = useQuery({
    queryKey: ["/api/projects", id],
    queryFn: () => apiRequest("GET", `/api/projects/${id}`).then((r) => r.json()),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="px-6 py-5 space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-48" />
          <Skeleton className="h-64" />
        </div>
      </Layout>
    );
  }

  if (!project) return <Layout><div className="px-6 py-8 text-muted-foreground">Project not found.</div></Layout>;

  const p = project;
  const btmSources = p.btmSources ?? [];
  const linkedCompanies = p.linkedCompanies ?? [];

  // Group companies by role
  const companyByRole: Record<string, any[]> = {};
  for (const c of linkedCompanies) {
    if (!companyByRole[c.role]) companyByRole[c.role] = [];
    companyByRole[c.role].push(c);
  }

  return (
    <Layout>
      <div className="px-6 py-5 max-w-4xl">
        {/* Back */}
        <Link href="/">
          <a className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-4 cursor-pointer">
            <ArrowLeft size={13} /> Back to Dashboard
          </a>
        </Link>

        {/* Title block */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h1 className="text-xl font-bold text-foreground leading-tight">{p.name}</h1>
            {p.operator && (
              <Link href={`/companies/${p.operator.id}`}>
                <a className="text-sm text-primary hover:underline mt-1 inline-block cursor-pointer">{p.operator.name}</a>
              </Link>
            )}
            <div className="flex items-center gap-1.5 mt-1.5">
              <MapPin size={12} className="text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{p.location}</span>
            </div>
          </div>
          <StatusBadge status={p.status} />
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {p.capacityMw && (
            <div className="bg-card border border-border rounded-xl p-3">
              <div className="text-xs text-muted-foreground mb-1">IT Capacity</div>
              <div className="tabular text-lg font-bold text-foreground">{p.capacityMw >= 1000 ? `${(p.capacityMw / 1000).toFixed(1)} GW` : `${p.capacityMw} MW`}</div>
            </div>
          )}
          {p.hasBtm && p.btmCapacityMw && (
            <div className="bg-card border border-border rounded-xl p-3">
              <div className="text-xs text-muted-foreground mb-1">BTM Generation</div>
              <div className="tabular text-lg font-bold text-accent">{p.btmCapacityMw >= 1000 ? `${(p.btmCapacityMw / 1000).toFixed(1)} GW` : `${p.btmCapacityMw} MW`}</div>
            </div>
          )}
          {p.totalInvestmentB && (
            <div className="bg-card border border-border rounded-xl p-3">
              <div className="text-xs text-muted-foreground mb-1">Investment</div>
              <div className="tabular text-lg font-bold text-foreground">${p.totalInvestmentB}B</div>
            </div>
          )}
          {p.announcedDate && (
            <div className="bg-card border border-border rounded-xl p-3">
              <div className="text-xs text-muted-foreground mb-1">Announced</div>
              <div className="text-sm font-semibold text-foreground">{new Date(p.announcedDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</div>
            </div>
          )}
        </div>

        {/* Grid status */}
        <div className="flex items-center gap-3 mb-5">
          {p.fullyOffGrid ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-destructive/10 border border-destructive/20">
              <WifiOff size={13} className="text-destructive" />
              <span className="text-xs font-medium text-destructive">Fully Off-Grid — No Utility Interconnect</span>
            </div>
          ) : p.hasBtm && p.gridTied ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/20">
              <Wifi size={13} className="text-accent" />
              <span className="text-xs font-medium text-accent">BTM + Grid Hybrid</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary border border-border">
              <Wifi size={13} className="text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Grid-Connected (no BTM)</span>
            </div>
          )}
        </div>

        {/* Notes */}
        {p.notes && (
          <div className="bg-secondary/50 border border-border rounded-xl p-4 mb-5">
            <p className="text-sm text-foreground/90 leading-relaxed">{p.notes}</p>
            {p.sourceUrl && (
              <a href={p.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2">
                Source <ExternalLink size={10} />
              </a>
            )}
          </div>
        )}

        {/* BTM Generation Sources */}
        {btmSources.length > 0 && (
          <section className="mb-5">
            <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Zap size={14} className="text-accent" />
              BTM Generation Sources
            </h2>
            <div className="space-y-2.5">
              {btmSources.map((b: any) => (
                <div key={b.id} className="bg-card border border-border rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <TechBadge type={b.technologyType} />
                      {b.productModel && (
                        <span className="text-xs text-muted-foreground font-mono bg-secondary px-2 py-0.5 rounded">{b.productModel}</span>
                      )}
                    </div>
                    <div className="tabular text-sm font-bold text-foreground shrink-0">
                      {b.capacityMw ? (b.capacityMw >= 1000 ? `${(b.capacityMw / 1000).toFixed(1)} GW` : `${b.capacityMw} MW`) : "—"}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-2">
                    {b.vendor && (
                      <div>
                        <div className="text-[10px] text-muted-foreground mb-0.5">Technology Vendor</div>
                        <Link href={`/companies/${b.vendor.id}`}>
                          <a className="text-xs text-primary hover:underline cursor-pointer font-medium">{b.vendor.name}</a>
                        </Link>
                      </div>
                    )}
                    {b.developer && b.developer.id !== p.operatorId && (
                      <div>
                        <div className="text-[10px] text-muted-foreground mb-0.5">BTM Developer</div>
                        <Link href={`/companies/${b.developer.id}`}>
                          <a className="text-xs text-primary hover:underline cursor-pointer font-medium">{b.developer.name}</a>
                        </Link>
                      </div>
                    )}
                    {b.fuelSource && (
                      <div>
                        <div className="text-[10px] text-muted-foreground mb-0.5">Fuel Supplier</div>
                        <Link href={`/companies/${b.fuelSource.id}`}>
                          <a className="text-xs text-yellow-400 hover:underline cursor-pointer font-medium">{b.fuelSource.name}</a>
                        </Link>
                      </div>
                    )}
                    {b.fuelType && (
                      <div>
                        <div className="text-[10px] text-muted-foreground mb-0.5">Fuel Type</div>
                        <span className="text-xs text-foreground">{FUEL_LABELS[b.fuelType] ?? b.fuelType}</span>
                      </div>
                    )}
                    {b.originCountry && (
                      <div>
                        <div className="text-[10px] text-muted-foreground mb-0.5">Manufactured In</div>
                        <div className="flex items-center gap-1">
                          <Globe size={10} className="text-muted-foreground" />
                          <span className="text-xs text-foreground">{b.originCountry}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {b.notes && (
                    <p className="text-xs text-muted-foreground leading-relaxed border-t border-border pt-2 mt-2">{b.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Companies Involved */}
        {Object.keys(companyByRole).length > 0 && (
          <section className="mb-5">
            <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Building2 size={14} className="text-primary" />
              Companies Involved
            </h2>
            <div className="space-y-3">
              {Object.entries(companyByRole).map(([role, cos]) => (
                <div key={role}>
                  <div className="text-xs text-muted-foreground mb-1.5">{ROLE_LABELS[role] ?? role}</div>
                  <div className="flex flex-wrap gap-2">
                    {cos.map((c: any) => (
                      <Link key={c.id} href={`/companies/${c.id}`}>
                        <a className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary border border-border text-xs font-medium hover:border-primary/30 transition-colors cursor-pointer ${ROLE_COLORS[role] ?? "text-foreground"}`}>
                          <span className="w-5 h-5 rounded text-[9px] font-bold bg-background flex items-center justify-center text-muted-foreground">{c.logoInitials ?? c.name?.slice(0, 2)}</span>
                          {c.name}
                        </a>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}
