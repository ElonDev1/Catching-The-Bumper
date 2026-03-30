const TECH_LABELS: Record<string, string> = {
  gas_turbine: "Gas Turbine",
  recip_engine: "Recip Engine",
  fuel_cell: "Fuel Cell (SOFC)",
  nuclear_smr: "SMR Nuclear",
  nuclear_existing: "Nuclear (Existing)",
  battery: "Battery / BESS",
  solar: "Solar PV",
  wind: "Wind",
  diesel: "Diesel Gen",
};

export default function TechBadge({ type, size = "sm" }: { type: string; size?: "xs" | "sm" }) {
  const label = TECH_LABELS[type] ?? type;
  const cls = type.replace(/_/g, "-");
  return (
    <span className={`tech-${cls} inline-flex items-center rounded-full font-medium ${size === "xs" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-xs"}`}>
      {label}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const labels: Record<string, string> = {
    announced: "Announced",
    under_construction: "Under Construction",
    operational: "Operational",
    planned: "Planned",
  };
  return (
    <span className={`status-${status} inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium`}>
      {labels[status] ?? status}
    </span>
  );
}
