import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import Layout from "@/components/Layout";
import { StatusBadge } from "@/components/TechBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Globe, ExternalLink, MapPin, Building2, Zap } from "lucide-react";

const ROLE_LABELS: Record<string, string> = {
  hyperscaler: "Hyperscaler",
  dc_operator: "Data Center Operator",
  btm_developer: "BTM Developer / Power Provider",
  tech_vendor: "Technology Vendor",
  fuel_supplier: "Fuel / Power Supplier",
  investor: "Investor",
};

const ROLE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  hyperscaler: { bg: "bg-primary/10", text: "text-primary", border: "border-primary/20" },
  dc_operator: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" },
  btm_developer: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20" },
  tech_vendor: { bg: "bg-accent/10", text: "text-accent", border: "border-accent/20" },
  fuel_supplier: { bg: "bg-yellow-500/10", text: "text-yellow-400", border: "border-yellow-500/20" },
  investor: { bg: "bg-pink-500/10", text: "text-pink-400", border: "border-pink-500/20" },
};

export default function CompanyDetail() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const { data: company, isLoading } = useQuery({
    queryKey: ["/api/companies", id],
    queryFn: () => apiRequest("GET", `/api/companies/${id}`).then((r) => r.json()),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="px-6 py-5 space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-32" />
        </div>
      </Layout>
    );
  }

  if (!company) return <Layout><div className="px-6 py-8 text-muted-foreground">Company not found.</div></Layout>;

  const rc = ROLE_COLORS[company.role] ?? { bg: "bg-secondary", text: "text-muted-foreground", border: "border-border" };

  return (
    <Layout>
      <div className="px-6 py-5 max-w-3xl">
        <Link href="/companies">
          <a className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-4 cursor-pointer">
            <ArrowLeft size={13} /> Back to Companies
          </a>
        </Link>

        {/* Header */}
        <div className="flex items-start gap-4 mb-5">
          <div className={`w-14 h-14 rounded-xl ${rc.bg} border ${rc.border} flex items-center justify-center text-lg font-bold ${rc.text}`}>
            {company.logoInitials ?? company.name.slice(0, 2)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-foreground">{company.name}</h1>
              {company.ticker && (
                <span className="text-xs tabular text-muted-foreground bg-secondary px-2 py-0.5 rounded font-mono">{company.ticker}</span>
              )}
            </div>
            <span className={`text-xs font-medium ${rc.text} ${rc.bg} border ${rc.border} px-2 py-0.5 rounded-full mt-1 inline-block`}>
              {ROLE_LABELS[company.role] ?? company.role}
            </span>
            {company.hq && (
              <div className="flex items-center gap-1.5 mt-2">
                <MapPin size={11} className="text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{company.hq}</span>
                <Globe size={11} className="text-muted-foreground ml-1" />
                <span className="text-sm text-muted-foreground">{company.country}</span>
              </div>
            )}
            {company.website && (
              <a href={`https://${company.website}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1">
                {company.website} <ExternalLink size={10} />
              </a>
            )}
          </div>
        </div>

        {/* Description */}
        {company.description && (
          <div className="bg-card border border-border rounded-xl p-4 mb-5">
            <p className="text-sm text-foreground/90 leading-relaxed">{company.description}</p>
          </div>
        )}

        {/* Operated Projects */}
        {company.operatedProjects?.length > 0 && (
          <section className="mb-5">
            <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Building2 size={14} className="text-primary" />
              Operated Projects ({company.operatedProjects.length})
            </h2>
            <div className="space-y-2">
              {company.operatedProjects.map((p: any) => (
                <Link key={p.id} href={`/projects/${p.id}`}>
                  <a className="block bg-card border border-border rounded-xl p-3 hover:border-primary/30 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">{p.name}</div>
                        <div className="text-xs text-muted-foreground">{p.location}</div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {p.btmCapacityMw && (
                          <div className="text-right">
                            <div className="tabular text-xs font-bold text-accent">{p.btmCapacityMw >= 1000 ? `${(p.btmCapacityMw / 1000).toFixed(1)} GW` : `${p.btmCapacityMw} MW`} BTM</div>
                          </div>
                        )}
                        <StatusBadge status={p.status} />
                      </div>
                    </div>
                  </a>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Linked Projects */}
        {company.linkedProjects?.length > 0 && (
          <section className="mb-5">
            <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Zap size={14} className="text-accent" />
              Involved In ({company.linkedProjects.length})
            </h2>
            <div className="space-y-2">
              {company.linkedProjects.map((p: any) => (
                <Link key={p.id} href={`/projects/${p.id}`}>
                  <a className="block bg-card border border-border rounded-xl p-3 hover:border-primary/30 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">{p.name}</div>
                        <div className="text-xs text-muted-foreground">{p.location}</div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {p.btmCapacityMw && (
                          <div className="tabular text-xs font-bold text-accent">{p.btmCapacityMw >= 1000 ? `${(p.btmCapacityMw / 1000).toFixed(1)} GW` : `${p.btmCapacityMw} MW`} BTM</div>
                        )}
                        <StatusBadge status={p.status} />
                      </div>
                    </div>
                  </a>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}
