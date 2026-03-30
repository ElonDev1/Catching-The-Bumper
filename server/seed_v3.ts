import { db } from "./db";
import { companies, projects, btmSources, projectCompanies } from "@shared/schema";

// V3 research sweep — March 2026
// New DC projects, midstream gas players, novel BTM tech, and international campuses
export function seedDatabaseV3() {
  const existingProjects = db.select().from(projects).all();
  const hasV3 = existingProjects.some((p) => p.name === "Crusoe / OpenAI – Stargate Abilene Campus (Texas)");
  if (hasV3) return;

  const allCompanies = db.select().from(companies).all();
  const cmap: Record<string, number> = {};
  for (const c of allCompanies) cmap[c.name] = c.id;

  // ── NEW COMPANIES ──────────────────────────────────────────────────────────

  const newCompanyData = [
    // DC Operators / Developers
    {
      name: "Crusoe Energy",
      role: "dc_operator",
      hq: "San Francisco, CA",
      country: "USA",
      website: "crusoe.ai",
      description: "Energy-first AI infrastructure provider. Primary contractor for OpenAI's Stargate Abilene campus. 1.2 GW under construction in Abilene, TX. 10+ GW in pipeline. Launch customer for Boom Superpower turbines.",
      logoInitials: "CR",
    },
    {
      name: "CloudBurst Data Centers",
      role: "dc_operator",
      hq: "Dallas, TX",
      country: "USA",
      website: "cloudburstdc.com",
      description: "Next-gen AI GigaCenter developer. Flagship 1.2 GW San Marcos campus (Hays/Guadalupe Counties, TX) BTM-powered by Energy Transfer's Oasis Pipeline. Q4 2026 first phase.",
      logoInitials: "CB",
    },
    {
      name: "GridFree AI",
      role: "dc_operator",
      hq: "Houston, TX",
      country: "USA",
      website: "gridfree.ai",
      description: "Grid-independent AI data center developer. South Dallas Cluster: 3-site, ~5 GW combined. 'Power Foundry' model: US natural gas, 24-month delivery, Goldman Sachs financing. CEO Ralph Alexander.",
      logoInitials: "GF",
    },
    {
      name: "BorderPlex Digital Assets",
      role: "dc_operator",
      hq: "El Paso, TX",
      country: "USA",
      website: "projectjupitertogether.com",
      description: "Developer of Project Jupiter in Doña Ana County, NM. $165B 30-year campus with Stack Infrastructure. Oracle as anchor tenant. 700-900 MW on-site gas microgrid. Phase 1: $50B.",
      logoInitials: "BP",
    },
    {
      name: "AVAIO Digital Partners",
      role: "dc_operator",
      hq: "New York, NY",
      country: "USA",
      website: "avaiodigital.com",
      description: "Hyperscale AI campus developer. AVAIO Digital Leo: 760-acre, $6B campus near Little Rock, AR. Up to 1 GW power. Grid + BTM hybrid. 1.2 GW secured utility portfolio across CA, VA, AR, MS.",
      logoInitials: "AV",
    },
    {
      name: "Titus Low Carbon Ventures",
      role: "dc_operator",
      hq: "Austin, TX",
      country: "USA",
      website: "tituslcv.com",
      description: "Texas multi-campus AI data center power park developer. 673 MW gas engine supply deal with AB Energy (Jenbacher J620). Hybrid BTM: recip engines + solar + wind + BESS. Island-mode operation.",
      logoInitials: "TL",
    },
    {
      name: "G42 / Khazna Data Centers",
      role: "dc_operator",
      hq: "Abu Dhabi, UAE",
      country: "UAE",
      website: "g42.ai",
      description: "Abu Dhabi sovereign AI operator. 60% majority stakeholder in Stargate UAE: $30B, 5 GW, 10 sq-mile campus with OpenAI, NVIDIA, Oracle, SoftBank. First 200 MW operational 2026.",
      logoInitials: "G4",
    },
    {
      name: "Capital Power (Polaris @ Genesee)",
      ticker: "CPX",
      role: "dc_operator",
      hq: "Edmonton, AB",
      country: "Canada",
      website: "capitalpower.com",
      description: "Canadian power generator co-locating 1.0-1.5 GW hyperscale data center at Genesee Generating Station, Alberta. 1,800 MW gas plant with 500 MW excess capacity. 2028 target. SMR feasibility study with OPG.",
      logoInitials: "CP",
    },
    // Midstream / Gas Supply
    {
      name: "Williams Companies",
      ticker: "WMB",
      role: "fuel_supplier",
      hq: "Tulsa, OK",
      country: "USA",
      website: "williams.com",
      description: "Major midstream operator pivoting to data center power. $7.3B+ in AI power projects: Socrates (400 MW, Meta, OH), Apollo (490 MW, OH), Aquila (520 MW, UT), Socrates the Younger (340 MW, OH). 33,000 mi pipeline network.",
      logoInitials: "WI",
    },
    // BTM Tech Vendors / Power Developers
    {
      name: "Boom Supersonic",
      role: "tech_vendor",
      hq: "Denver, CO",
      country: "USA",
      website: "boomsupersonic.com",
      description: "Supersonic aviation company repurposing jet engine core as 42 MW 'Superpower' aeroderivative gas turbine for data centers. 29 turbines (1.21 GW) ordered by Crusoe. $300M raised. 4 GW/yr production target by 2030.",
      logoInitials: "BS",
    },
    {
      name: "AB Energy (Gruppo AB)",
      role: "tech_vendor",
      hq: "Arzignano, Italy",
      country: "Italy",
      website: "gruppoab.com",
      description: "Italian reciprocating engine OEM. Supplying 202 Ecomax 33 units (Jenbacher J620 engines, 673 MW total) to Titus Low Carbon Ventures for Texas AI data center parks. First 400 MW commissioned Q4 2027.",
      logoInitials: "AB",
    },
    {
      name: "Baker Hughes",
      ticker: "BKR",
      role: "tech_vendor",
      hq: "Houston, TX",
      country: "USA",
      website: "bakerhughes.com",
      description: "Energy technology company. Supplying 31 BRUSH™ Power DAX 7 2-pole air-cooled generators (1.3 GW total) paired with Boom Superpower turbines for Crusoe's AI data centers. Deliveries mid-2026 through 2028.",
      logoInitials: "BH",
    },
    {
      name: "Oklo",
      ticker: "OKLO",
      role: "tech_vendor",
      hq: "Santa Clara, CA",
      country: "USA",
      website: "oklo.com",
      description: "Advanced fission company. 1.2 GW Aurora powerhouse campus agreement with Meta in Pike County, OH. 206-acre site. First phase online 2030, full 1.2 GW by 2034. Also partnered with Switch. Meta provides prepayment + capital.",
      logoInitials: "OK",
    },
    {
      name: "TerraPower",
      role: "tech_vendor",
      hq: "Bellevue, WA",
      country: "USA",
      website: "terrapower.com",
      description: "Bill Gates-founded advanced nuclear. Natrium reactor (sodium-cooled fast reactor). MOU with Meta for up to 8 reactors. First two units targeting 2032. Meta supporting early development for up to 6 GW nuclear.",
      logoInitials: "TP",
    },
    {
      name: "Stack Infrastructure",
      role: "dc_operator",
      hq: "New York, NY",
      country: "USA",
      website: "stackinfra.com",
      description: "Hyperscale data center developer and builder. Construction and development partner for BorderPlex's Project Jupiter in New Mexico. Oracle confirmed as anchor tenant.",
      logoInitials: "SI",
    },
    {
      name: "Pacifico Energy (Nate Franklin)",
      role: "btm_developer",
      hq: "Midland, TX",
      country: "USA",
      website: "pacificoenergy.com",
      description: "West Texas 8,400-acre off-grid AI power complex. 7.5 GW gas turbines + 750 MW solar + 1 GWh BESS. ERCOT-independent. Lowest-cost Permian gas supply. Permits secured from TCEQ.",
      logoInitials: "PE",
    },
  ];

  const insertedCompanies = db.insert(companies).values(
    newCompanyData.map((c) => ({
      name: c.name,
      ticker: (c as any).ticker ?? null,
      role: c.role as any,
      hq: c.hq,
      country: c.country,
      website: c.website,
      description: c.description,
      logoInitials: c.logoInitials,
    }))
  ).returning().all();

  for (const c of insertedCompanies) cmap[c.name] = c.id;

  console.log(`✅ V3: Inserted ${insertedCompanies.length} new companies`);

  // ── NEW PROJECTS ──────────────────────────────────────────────────────────

  // 1. Crusoe / OpenAI Stargate Abilene
  const p1 = db.insert(projects).values({
    name: "Crusoe / OpenAI – Stargate Abilene Campus (Texas)",
    operatorId: cmap["Crusoe Energy"],
    location: "Abilene (Lancium Clean Campus)",
    state: "TX",
    country: "USA",
    capacityMw: 1200,
    status: "under_construction",
    announcedDate: "2025-03-18",
    totalInvestmentB: 15,
    hasBtm: false,
    btmCapacityMw: 0,
    gridTied: true,
    fullyOffGrid: false,
    notes: "OpenAI's primary Stargate campus. 8 buildings, ~4M sqft. Grid-connected via Lancium with BTM battery + solar overlay. Aeroderivative turbines for backup. Liquid cooling (zero-water evaporation). 1.6 GW total Crusoe footprint under ops+construction.",
    sourceUrl: "https://www.crusoe.ai/resources/newsroom/crusoe-expands-ai-data-center-campus-in-abilene-to-1-2-gigawatts",
  }).returning().get();

  db.insert(projectCompanies).values([
    { projectId: p1.id, companyId: cmap["Crusoe Energy"], role: "operator" },
    { projectId: p1.id, companyId: cmap["OpenAI"], role: "customer" },
    { projectId: p1.id, companyId: cmap["Boom Supersonic"], role: "vendor" },
  ]).run();

  // 2. CloudBurst San Marcos GigaCenter
  const p2 = db.insert(projects).values({
    name: "CloudBurst – San Marcos GigaCenter (Texas)",
    operatorId: cmap["CloudBurst Data Centers"],
    location: "San Marcos / New Braunfels, Hays & Guadalupe Counties",
    state: "TX",
    country: "USA",
    capacityMw: 1200,
    status: "under_construction",
    announcedDate: "2025-02-11",
    totalInvestmentB: 5,
    hasBtm: true,
    btmCapacityMw: 1200,
    gridTied: false,
    fullyOffGrid: true,
    notes: "Energy Transfer Oasis Pipeline: 450,000 MMBtu/day (1.8 GW capacity). Phase 1: 50 MW, Q4 2026. Master-planned to 1.2 GW. High-density AI/HPC, liquid cooling. Also planning Oklahoma City campus.",
    sourceUrl: "https://evolveincorporated.com/company-news/cloudburst-and-evolve-break-ground-on-1-2gw-flagship-ai-data-center-campus-incentral-texas",
  }).returning().get();

  db.insert(btmSources).values({
    projectId: p2.id,
    technologyType: "gas_turbine",
    capacityMw: 1200,
    vendorId: null,
    developerId: cmap["CloudBurst Data Centers"],
    fuelType: "natural_gas",
    fuelSourceId: cmap["Energy Transfer"],
    originCountry: "USA",
    notes: "Energy Transfer Oasis Pipeline direct supply. 450,000 MMBtu/day. Multiple turbine types. Fully behind-the-meter, off-grid.",
  }).run();

  db.insert(projectCompanies).values([
    { projectId: p2.id, companyId: cmap["CloudBurst Data Centers"], role: "operator" },
    { projectId: p2.id, companyId: cmap["Energy Transfer"], role: "fuel_supplier" },
  ]).run();

  // 3. GridFree AI – South Dallas Cluster
  const p3 = db.insert(projects).values({
    name: "GridFree AI – South Dallas Power Foundry Cluster",
    operatorId: cmap["GridFree AI"],
    location: "Hill County (South of DFW)",
    state: "TX",
    country: "USA",
    capacityMw: 5000,
    status: "announced",
    announcedDate: "2025-12-30",
    totalInvestmentB: 12,
    hasBtm: true,
    btmCapacityMw: 5000,
    gridTied: false,
    fullyOffGrid: true,
    notes: "Three-site 'Power Foundry' cluster. Each site 1.5+ GW. Goldman Sachs co-leading financing. Newmark exclusive advisor. 24-month delivery from lease. US natural gas. 5x9 uptime. Industrial chilled-water cooling.",
    sourceUrl: "https://www.datacenterknowledge.com/energy-power-supply/gridfree-unveils-first-power-foundry-site-for-ai-data-center-workloads",
  }).returning().get();

  db.insert(btmSources).values({
    projectId: p3.id,
    technologyType: "gas_turbine",
    capacityMw: 5000,
    vendorId: null,
    developerId: cmap["GridFree AI"],
    fuelType: "natural_gas",
    fuelSourceId: null,
    originCountry: "USA",
    notes: "Proprietary Power Foundry gas turbine platform. ERCOT-independent. Grid-isolated by design.",
  }).run();

  db.insert(projectCompanies).values([
    { projectId: p3.id, companyId: cmap["GridFree AI"], role: "operator" },
  ]).run();

  // 4. Project Jupiter – BorderPlex / Oracle (New Mexico)
  const p4 = db.insert(projects).values({
    name: "Project Jupiter – BorderPlex / Oracle (New Mexico)",
    operatorId: cmap["BorderPlex Digital Assets"],
    location: "Santa Teresa, Doña Ana County",
    state: "NM",
    country: "USA",
    capacityMw: 2880,
    status: "announced",
    announcedDate: "2025-11-01",
    totalInvestmentB: 165,
    hasBtm: true,
    btmCapacityMw: 900,
    gridTied: false,
    fullyOffGrid: true,
    notes: "Oracle anchor tenant (confirmed Jan 2026). 1,400 acres near Mexican border. Stack Infrastructure as builder. 700-900 MW on-site natural gas microgrid (simple-cycle turbines). Phase 1: $50B. County PILOT: $12M/yr x 30 yrs. Adjacent to Foxconn/Maquiladora industrial zone.",
    sourceUrl: "https://www.datacenterdynamics.com/en/news/oracle-revealed-as-tenant-of-project-jupiter-data-center-campus-in-new-mexico/",
  }).returning().get();

  db.insert(btmSources).values({
    projectId: p4.id,
    technologyType: "gas_turbine",
    capacityMw: 900,
    vendorId: null,
    developerId: cmap["BorderPlex Digital Assets"],
    fuelType: "natural_gas",
    fuelSourceId: null,
    originCountry: "USA",
    notes: "Simple-cycle gas turbine microgrid. NMLEG amendment exempting microgrid from Energy Transition Act (no surplus sales required). 110-140 MMcf/d gas at full build.",
  }).run();

  db.insert(projectCompanies).values([
    { projectId: p4.id, companyId: cmap["BorderPlex Digital Assets"], role: "operator" },
    { projectId: p4.id, companyId: cmap["Stack Infrastructure"], role: "developer" },
    { projectId: p4.id, companyId: cmap["Oracle"], role: "customer" },
  ]).run();

  // 5. AVAIO Digital Leo – Little Rock, Arkansas
  const p5 = db.insert(projects).values({
    name: "AVAIO Digital Leo – Little Rock Campus (Arkansas)",
    operatorId: cmap["AVAIO Digital Partners"],
    location: "Pulaski County (near Little Rock)",
    state: "AR",
    country: "USA",
    capacityMw: 1000,
    status: "announced",
    announcedDate: "2026-01-12",
    totalInvestmentB: 6,
    hasBtm: false,
    btmCapacityMw: 0,
    gridTied: true,
    fullyOffGrid: false,
    notes: "760-acre campus. $6B initial investment (largest in Arkansas history). 150 MW contracted with Entergy Arkansas, scaling to 1 GW. Grid + BTM hybrid model. 500+ permanent jobs. Part of AVAIO's 1.2 GW multi-state utility portfolio.",
    sourceUrl: "https://www.avaiodigital.com/updates/avaio-digital-announces-new-large-scale-ai-ready-data-center-and-power-campus-in-little-rock-arkansas",
  }).returning().get();

  db.insert(projectCompanies).values([
    { projectId: p5.id, companyId: cmap["AVAIO Digital Partners"], role: "operator" },
  ]).run();

  // 6. Titus Low Carbon – Texas AI Power Parks
  const p6 = db.insert(projects).values({
    name: "Titus Low Carbon – Texas AI Data Center Power Parks",
    operatorId: cmap["Titus Low Carbon Ventures"],
    location: "Multiple sites, Texas",
    state: "TX",
    country: "USA",
    capacityMw: 673,
    status: "announced",
    announcedDate: "2025-09-12",
    totalInvestmentB: 3,
    hasBtm: true,
    btmCapacityMw: 673,
    gridTied: true,
    fullyOffGrid: false,
    notes: "Half-dozen Texas data center parks. 673 MW gas engine deal with AB Energy (Jenbacher J620). 202 Ecomax 33 units. First 400 MW commissioned Q4 2027, remainder mid-2028. Hybrid: BTM recip + solar + wind + BESS. Island-mode capable. 70%+ cost reduction vs grid-only.",
    sourceUrl: "https://www.datacenterdynamics.com/en/news/titus-signs-673mw-gas-engine-supply-deal-with-ab-energy-for-texas-data-center-parks/",
  }).returning().get();

  db.insert(btmSources).values({
    projectId: p6.id,
    technologyType: "recip_engine",
    capacityMw: 673,
    vendorId: cmap["AB Energy (Gruppo AB)"],
    developerId: cmap["Titus Low Carbon Ventures"],
    fuelType: "natural_gas",
    fuelSourceId: null,
    productModel: "Ecomax 33 / Jenbacher J620",
    originCountry: "Italy",
    notes: "202 Ecomax 33 preassembled units. 202 × Jenbacher J620 engines. Fast-start, fast-ramp, low heat rate. Modular parallel installation. Island-mode BESS integration.",
  }).run();

  db.insert(btmSources).values({
    projectId: p6.id,
    technologyType: "solar",
    capacityMw: 200,
    vendorId: null,
    developerId: cmap["Titus Low Carbon Ventures"],
    fuelType: null,
    fuelSourceId: null,
    originCountry: "USA",
    notes: "Co-located utility-scale solar + wind + BESS across Texas power parks.",
  }).run();

  db.insert(projectCompanies).values([
    { projectId: p6.id, companyId: cmap["Titus Low Carbon Ventures"], role: "operator" },
    { projectId: p6.id, companyId: cmap["AB Energy (Gruppo AB)"], role: "vendor" },
  ]).run();

  // 7. Williams Companies – Socrates Power Projects (Ohio / Meta)
  const p7 = db.insert(projects).values({
    name: "Williams Companies – Socrates Power Projects (Ohio)",
    operatorId: cmap["Williams Companies"],
    location: "New Albany, Ohio (Socrates North & South)",
    state: "OH",
    country: "USA",
    capacityMw: 400,
    status: "under_construction",
    announcedDate: "2025-10-01",
    totalInvestmentB: 2,
    hasBtm: true,
    btmCapacityMw: 400,
    gridTied: false,
    fullyOffGrid: true,
    notes: "Two 200 MW sites in New Albany, OH. Meta Platforms buyer under PPA. Williams provides gas supply + pipeline + compression + generation. Target: H2 2026 in-service. Part of $7.3B Williams AI power portfolio (Socrates, Apollo, Aquila, Socrates the Younger).",
    sourceUrl: "https://www.williams.com/expansion-project/socrates-power-solution-facilities/",
  }).returning().get();

  db.insert(btmSources).values({
    projectId: p7.id,
    technologyType: "gas_turbine",
    capacityMw: 400,
    vendorId: null,
    developerId: cmap["Williams Companies"],
    fuelType: "natural_gas",
    fuelSourceId: cmap["Williams Companies"],
    originCountry: "USA",
    notes: "Williams integrated model: upstream gas + 33,000-mi pipeline + on-site generation. 10-year take-or-pay with Meta. Ohio Power Siting Board regulated.",
  }).run();

  db.insert(projectCompanies).values([
    { projectId: p7.id, companyId: cmap["Williams Companies"], role: "operator" },
    { projectId: p7.id, companyId: cmap["Meta"], role: "customer" },
  ]).run();

  // 8. Williams Apollo + Aquila Projects (Ohio + Utah)
  const p8 = db.insert(projects).values({
    name: "Williams – Apollo (Ohio) & Aquila (Utah) Power Projects",
    operatorId: cmap["Williams Companies"],
    location: "Ohio & Utah",
    state: "OH",
    country: "USA",
    capacityMw: 1010,
    status: "announced",
    announcedDate: "2025-10-01",
    totalInvestmentB: 3.1,
    hasBtm: true,
    btmCapacityMw: 1010,
    gridTied: false,
    fullyOffGrid: true,
    notes: "Apollo (OH): 490 MW, 12.5-yr agreement, online H1 2027. Aquila (UT): 520 MW, 12.5-yr agreement, online H1 2027. Undisclosed hyperscaler customer. Part of Williams' $7.3B data center power portfolio. Gas supply + pipeline + generation fully integrated.",
    sourceUrl: "https://www.argusmedia.com/en/news-and-insights/latest-market-news/2786994-williams-to-supply-gas-power-to-meet-ohio-demand",
  }).returning().get();

  db.insert(btmSources).values({
    projectId: p8.id,
    technologyType: "gas_turbine",
    capacityMw: 1010,
    vendorId: null,
    developerId: cmap["Williams Companies"],
    fuelType: "natural_gas",
    fuelSourceId: cmap["Williams Companies"],
    originCountry: "USA",
    notes: "Apollo: 490 MW Ohio. Aquila: 520 MW Utah. Both 12.5-year take-or-pay contracts with undisclosed hyperscaler. H1 2027 target.",
  }).run();

  db.insert(projectCompanies).values([
    { projectId: p8.id, companyId: cmap["Williams Companies"], role: "operator" },
  ]).run();

  // 9. Stargate UAE – G42 / OpenAI / NVIDIA / Oracle (Abu Dhabi)
  const p9 = db.insert(projects).values({
    name: "Stargate UAE – G42 / OpenAI / NVIDIA / Oracle (Abu Dhabi)",
    operatorId: cmap["G42 / Khazna Data Centers"],
    location: "Masdar City Technology Zone, Abu Dhabi",
    state: null,
    country: "UAE",
    capacityMw: 5000,
    status: "under_construction",
    announcedDate: "2025-05-22",
    totalInvestmentB: 30,
    hasBtm: true,
    btmCapacityMw: 3500,
    gridTied: true,
    fullyOffGrid: false,
    notes: "World's largest planned AI campus. 10 sq miles. G42 (60%), OpenAI (20%), NVIDIA (12%), Oracle (8%). First 200 MW online 2026. Full 5 GW by ~2030. Power: dedicated gas turbines (baseload BTM) + 1.5 GW solar array + BESS + grid. Barakah nuclear grid backup. 1M+ Nvidia Blackwell Ultra chips. Sovereign AI for UAE government.",
    sourceUrl: "https://www.prnewswire.com/apac/news-releases/g42-provides-update-on-construction-of-stargate-uae-ai-infrastructure-cluster-302586440.html",
  }).returning().get();

  db.insert(btmSources).values({
    projectId: p9.id,
    technologyType: "gas_turbine",
    capacityMw: 2000,
    vendorId: null,
    developerId: cmap["G42 / Khazna Data Centers"],
    fuelType: "natural_gas",
    fuelSourceId: null,
    originCountry: "UAE",
    notes: "Dedicated BTM gas turbines for baseload power. UAE Department of Energy-approved dedicated transmission corridor. Campus-scale generation.",
  }).run();

  db.insert(btmSources).values({
    projectId: p9.id,
    technologyType: "solar",
    capacityMw: 1500,
    vendorId: null,
    developerId: cmap["G42 / Khazna Data Centers"],
    fuelType: null,
    fuelSourceId: null,
    originCountry: "UAE",
    notes: "1.5 GW solar array co-located with campus. Combined with BESS for renewables integration.",
  }).run();

  db.insert(projectCompanies).values([
    { projectId: p9.id, companyId: cmap["G42 / Khazna Data Centers"], role: "operator" },
    { projectId: p9.id, companyId: cmap["OpenAI"], role: "customer" },
    { projectId: p9.id, companyId: cmap["Oracle"], role: "vendor" },
  ]).run();

  // 10. Capital Power Polaris @ Genesee – Alberta
  const p10 = db.insert(projects).values({
    name: "Capital Power – Polaris @ Genesee Energy Campus (Alberta)",
    operatorId: cmap["Capital Power (Polaris @ Genesee)"],
    location: "Genesee Generating Station (80 km SW of Edmonton)",
    state: null,
    country: "Canada",
    capacityMw: 1500,
    status: "announced",
    announcedDate: "2025-06-01",
    totalInvestmentB: 4,
    hasBtm: true,
    btmCapacityMw: 1500,
    gridTied: true,
    fullyOffGrid: false,
    notes: "1.0-1.5 GW hyperscale campus co-located at 1,800 MW Genesee Gas Station. 500 MW excess capacity available immediately. 2028 in-service target. AESO Phase 2 queue. BESS + SMR feasibility (with Ontario Power Generation). Tier IV-capable.",
    sourceUrl: "https://www.capitalpower.com/pgec/",
  }).returning().get();

  db.insert(btmSources).values({
    projectId: p10.id,
    technologyType: "gas_turbine",
    capacityMw: 1500,
    vendorId: null,
    developerId: cmap["Capital Power (Polaris @ Genesee)"],
    fuelType: "natural_gas",
    fuelSourceId: null,
    originCountry: "Canada",
    notes: "Co-located with 1,800 MW Genesee Gas Station (converted from coal, -40% GHG). 500 MW near-term via BESS unlock. SMR feasibility study with OPG underway.",
  }).run();

  db.insert(projectCompanies).values([
    { projectId: p10.id, companyId: cmap["Capital Power (Polaris @ Genesee)"], role: "operator" },
  ]).run();

  // 11. Oklo / Meta – Aurora Nuclear Campus (Ohio)
  const p11 = db.insert(projects).values({
    name: "Oklo / Meta – Aurora Nuclear Campus (Pike County, Ohio)",
    operatorId: cmap["Oklo"],
    location: "Pike County, Ohio",
    state: "OH",
    country: "USA",
    capacityMw: 1200,
    status: "announced",
    announcedDate: "2026-01-09",
    totalInvestmentB: 5,
    hasBtm: false,
    btmCapacityMw: 0,
    gridTied: true,
    fullyOffGrid: false,
    notes: "Meta Platforms pre-pays for power + funds Phase 1. 206 acres. Pre-construction 2026. First Aurora powerhouse online 2030. Full 1.2 GW by 2034. Up to 16 Aurora reactors. First-of-kind commercial prepayment structure for nuclear. Meta separately signed with TerraPower (8 Natrium reactors, 2032 target).",
    sourceUrl: "https://oklo.com/newsroom/news-details/2026/Oklo-Meta-Announce-Agreement-in-Support-of-1.2-GW-Nuclear-Energy-Development-in-Southern-Ohio/default.aspx",
  }).returning().get();

  db.insert(btmSources).values({
    projectId: p11.id,
    technologyType: "nuclear_smr",
    capacityMw: 1200,
    vendorId: cmap["Oklo"],
    developerId: cmap["Oklo"],
    fuelType: "nuclear",
    fuelSourceId: null,
    productModel: "Aurora Powerhouse (advanced fission)",
    originCountry: "USA",
    notes: "Up to 16 Aurora reactors. Advanced fission (fast spectrum). Scaling incrementally. Meta prepayment mechanism novel for nuclear sector.",
  }).run();

  db.insert(projectCompanies).values([
    { projectId: p11.id, companyId: cmap["Oklo"], role: "vendor" },
    { projectId: p11.id, companyId: cmap["Meta"], role: "customer" },
  ]).run();

  // 12. Meta – Lebanon Indiana 1 GW Campus
  const p12 = db.insert(projects).values({
    name: "Meta – Lebanon Data Center Campus (Indiana)",
    operatorId: cmap["Meta"],
    location: "Lebanon, Boone County (30 mi NW of Indianapolis)",
    state: "IN",
    country: "USA",
    capacityMw: 1000,
    status: "under_construction",
    announcedDate: "2026-02-11",
    totalInvestmentB: 10,
    hasBtm: false,
    btmCapacityMw: 0,
    gridTied: true,
    fullyOffGrid: false,
    notes: "Meta's second Indiana campus. Groundbreaking Feb 11, 2026. 100% clean energy matched. 4,000 construction jobs at peak. Operational late 2027 / early 2028. LEED Gold. Closed-loop liquid cooling (zero water most of year). $1M/yr Boone REMC community fund for 20 years.",
    sourceUrl: "https://about.fb.com/news/2026/02/metas-new-data-center-lebanon-indiana-marks-milestone-ai-investment/",
  }).returning().get();

  db.insert(projectCompanies).values([
    { projectId: p12.id, companyId: cmap["Meta"], role: "operator" },
  ]).run();

  // 13. Pacifico Energy – West Texas 7.5 GW Off-Grid Complex
  const p13 = db.insert(projects).values({
    name: "Pacifico Energy – West Texas Off-Grid AI Power Complex",
    operatorId: cmap["Pacifico Energy (Nate Franklin)"],
    location: "West Texas (8,400 acres, Permian Basin area)",
    state: "TX",
    country: "USA",
    capacityMw: 7500,
    status: "announced",
    announcedDate: "2026-02-19",
    totalInvestmentB: 20,
    hasBtm: true,
    btmCapacityMw: 7500,
    gridTied: false,
    fullyOffGrid: true,
    notes: "Nate Franklin (founder). TCEQ air permits secured for gas turbines. 7.5 GW gas + 750 MW solar + 1 GWh BESS. Cheapest Permian gas supply. ERCOT-independent model. Forbes profile Feb 2026. Data center tenants TBD.",
    sourceUrl: "https://www.forbes.com/sites/christopherhelman/2026/02/19/this-daring-developer-wants-to-power-americas-ai-future/",
  }).returning().get();

  db.insert(btmSources).values({
    projectId: p13.id,
    technologyType: "gas_turbine",
    capacityMw: 7500,
    vendorId: null,
    developerId: cmap["Pacifico Energy (Nate Franklin)"],
    fuelType: "natural_gas",
    fuelSourceId: null,
    originCountry: "USA",
    notes: "Permitted for gas turbines (TCEQ). ERCOT-isolated. Permian Basin cheapest gas. 8,400 acres acquired/optioned.",
  }).run();

  db.insert(btmSources).values({
    projectId: p13.id,
    technologyType: "solar",
    capacityMw: 750,
    vendorId: null,
    developerId: cmap["Pacifico Energy (Nate Franklin)"],
    fuelType: null,
    fuelSourceId: null,
    originCountry: "USA",
    notes: "750 MW solar + 1 GWh BESS as hybrid overlay on gas turbine baseload.",
  }).run();

  db.insert(projectCompanies).values([
    { projectId: p13.id, companyId: cmap["Pacifico Energy (Nate Franklin)"], role: "operator" },
  ]).run();

  // 14. Boom Superpower – Crusoe BTM Turbine Fleet (National)
  const p14 = db.insert(projects).values({
    name: "Boom Superpower – Crusoe Aeroderivative Fleet (National)",
    operatorId: cmap["Boom Supersonic"],
    location: "Multiple US Sites",
    state: null,
    country: "USA",
    capacityMw: 1210,
    status: "announced",
    announcedDate: "2025-12-09",
    totalInvestmentB: 1.25,
    hasBtm: true,
    btmCapacityMw: 1210,
    gridTied: false,
    fullyOffGrid: true,
    notes: "29 × 42 MW Superpower turbines ordered by Crusoe ($1.25B backlog). 31 units total with Baker Hughes BRUSH DAX 7 generators. Deliveries mid-2026 → 2028. Derived from Overture supersonic jet core. Full-rated output at 110°F+. Waterless. No ERCOT connection needed. 4 GW/yr production target 2030.",
    sourceUrl: "https://investors.bakerhughes.com/news/press-releases/news-details/2026/Baker-Hughes-Secures-1.21-Gigawatt-Generator-Order-to-Power-Boom-Supersonics-AI-Data-Center-Solution/default.aspx",
  }).returning().get();

  db.insert(btmSources).values({
    projectId: p14.id,
    technologyType: "gas_turbine",
    capacityMw: 1210,
    vendorId: cmap["Boom Supersonic"],
    developerId: cmap["Crusoe Energy"],
    fuelType: "natural_gas",
    fuelSourceId: null,
    productModel: "Boom Superpower (42 MW aeroderivative) + Baker Hughes BRUSH DAX 7",
    originCountry: "USA",
    notes: "Supersonic jet-derived aeroderivative. 42 MW per unit ISO-rated. Waterless operation. $300M Boom funding (Darsana, Altimeter, ARK, Bessemer, Robinhood, YC).",
  }).run();

  db.insert(projectCompanies).values([
    { projectId: p14.id, companyId: cmap["Boom Supersonic"], role: "vendor" },
    { projectId: p14.id, companyId: cmap["Crusoe Energy"], role: "operator" },
    { projectId: p14.id, companyId: cmap["Baker Hughes"], role: "vendor" },
  ]).run();

  console.log(`✅ V3: Inserted 14 new projects with BTM sources and project-company links`);
}
