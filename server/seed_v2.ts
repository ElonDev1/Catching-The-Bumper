import { db } from "./db";
import { companies, projects, btmSources, projectCompanies } from "@shared/schema";

// Additional projects and companies found in March 2026 research sweep
export function seedDatabaseV2() {
  const existingProjects = db.select().from(projects).all();
  // Check if we already have the new projects (avoid double-seeding)
  const hasV2 = existingProjects.some((p) => p.name === "SoftBank / SB Energy – Piketon AI Campus (Ohio)");
  if (hasV2) return;

  const allCompanies = db.select().from(companies).all();
  const cmap: Record<string, number> = {};
  for (const c of allCompanies) cmap[c.name] = c.id;

  // ── NEW COMPANIES ───────────────────────────────────────────────────────────
  const newCompanyData = [
    // New operators / developers
    { name: "SB Energy (SoftBank)", role: "dc_operator", hq: "Tokyo / USA", country: "Japan", website: "sbenergy.com", description: "SoftBank subsidiary. $10B initial investment in 800 MW AI campus at Piketon, Ohio. 10 GW eventual target. 9.2 GW dedicated gas plant via AEP Ohio partnership.", logoInitials: "SB" },
    { name: "CyrusOne", role: "dc_operator", hq: "Dallas, TX", country: "USA", website: "cyrusone.com", description: "Global hyperscale data center operator. Joint venture with ECP/KKR for 190 MW Bosque County TX campus co-located with Calpine gas generation.", logoInitials: "CY" },
    { name: "DayOne Data Centers", role: "dc_operator", hq: "Singapore", country: "Singapore", website: "dayonedc.com", description: "APAC data center developer. First SOFC-powered data center in Singapore. 20 MW SG1 campus with Bloom Energy SOFC hydrogen pilot.", logoInitials: "D1" },
    { name: "Sharon AI / Texas Critical Data Centers", role: "dc_operator", hq: "Midland, TX", country: "USA", website: "sharonai.com", description: "250 MW net-zero BTM data center in Permian Basin. JV with New Era Helium for dedicated gas supply + CO2 capture. NVIDIA & Lenovo Tier III liquid-cooled facility.", logoInitials: "SA" },
    { name: "New Era Energy & Digital (NUAI)", ticker: "NUAI", role: "dc_operator", hq: "Ector County, TX", country: "USA", website: "newera.ai", description: "450 MW BTM campus in Permian Basin (TCDC). Partnership with Thunderhead Energy and TURBINE-X. 1+ GW eventual capacity. Aligned with Trump Ratepayer Pledge.", logoInitials: "NE" },
    // New BTM/power developers
    { name: "NextEra Energy Resources", ticker: "NEE", role: "btm_developer", hq: "Juno Beach, FL", country: "USA", website: "nexteraenergy.com", description: "Developing 4.3 GW gas hub in SW Pennsylvania and 5.2 GW hub in Anderson County TX for SoftBank-linked AI data centers. Also restarting Duane Arnold nuclear for Google.", logoInitials: "NR" },
    { name: "Energy Capital Partners (ECP)", role: "investor", hq: "Summit, NJ", country: "USA", website: "ecpgp.com", description: "$50B strategic partnership with KKR for integrated digital + power infrastructure. First project: 190 MW Bosque TX campus co-located with Calpine Thad Hill gas plant.", logoInitials: "EC" },
    { name: "KKR", ticker: "KKR", role: "investor", hq: "New York, NY", country: "USA", website: "kkr.com", description: "$50B partnership with ECP for AI infrastructure. Co-investing in CyrusOne Bosque campus co-located with Calpine dedicated gas generation.", logoInitials: "KK" },
    { name: "Calpine", role: "fuel_supplier", hq: "Houston, TX", country: "USA", website: "calpine.com", description: "Largest US gas-fired power generator. Long-term contract to supply dedicated power to CyrusOne/ECP Bosque campus from Thad Hill Energy Center.", logoInitials: "CL" },
    { name: "New Era Helium (NEHC)", ticker: "NEHC", role: "fuel_supplier", hq: "Midland, TX", country: "USA", website: "newerahelium.com", description: "Permian Basin E&P company. Building dedicated gas plant with CO2 capture for Sharon AI's 250 MW net-zero data center. 20-year gas supply agreement.", logoInitials: "NH" },
    { name: "Thunderhead Energy / TURBINE-X", role: "tech_vendor", hq: "Texas", country: "USA", website: "thunderheadsolutions.com", description: "BTM generation equipment procurement partner. Secured commercial partnership with TURBINE-X (OEM channel partner) for New Era Energy 450 MW TCDC campus.", logoInitials: "TE" },
    { name: "Intersect Power", role: "btm_developer", hq: "San Francisco, CA", country: "USA", website: "intersectpower.com", description: "Renewable energy developer. Up to $20B partnership with Google and TPG to develop 'powered land' with co-located renewables. Google acquiring for ~$4.75B.", logoInitials: "IP" },
    { name: "TPG", ticker: "TPG", role: "investor", hq: "Fort Worth, TX", country: "USA", website: "tpg.com", description: "Private equity firm. Partner with Google and Intersect Power in $20B 'powered land' program for AI data centers with co-located renewable generation.", logoInitials: "TP" },
  ];

  const newCmap: Record<string, number> = {};
  for (const c of newCompanyData) {
    const result = db.insert(companies).values(c as any).returning().get();
    newCmap[c.name] = result.id;
  }

  // Merge all company ID maps
  const fullCmap = { ...cmap, ...newCmap };

  // ── NEW PROJECTS ────────────────────────────────────────────────────────────
  const newProjectData = [
    {
      name: "SoftBank / SB Energy – Piketon AI Campus (Ohio)",
      operatorId: fullCmap["SB Energy (SoftBank)"],
      location: "Piketon, OH (Portsmouth DOE Site)",
      state: "OH",
      country: "USA",
      capacityMw: 10000,
      status: "announced",
      announcedDate: "2026-03-20",
      totalInvestmentB: 43.3,
      hasBtm: 1,
      btmCapacityMw: 9200,
      gridTied: 1,
      fullyOffGrid: 0,
      notes: "Announced March 20, 2026 at former Portsmouth Gaseous Diffusion Plant (now PORTS Technology Campus). $33.3B dedicated 9.2 GW natural gas plant + $10B initial 800 MW data center (scaling to 10 GW). AEP Ohio partnership for $4.2B transmission upgrades. Part of US-Japan Strategic Investment agreement. SB Energy leads.",
      sourceUrl: "https://www.statenews.org/government-politics/2026-03-20/feds-announce-huge-natural-gas-plant-data-center-project-in-southern-ohio",
    },
    {
      name: "NextEra – Anderson County TX Gas Hub (SoftBank-linked)",
      operatorId: fullCmap["NextEra Energy Resources"],
      location: "Anderson County, TX",
      state: "TX",
      country: "USA",
      capacityMw: 5200,
      status: "announced",
      announcedDate: "2026-03-23",
      totalInvestmentB: 18,
      hasBtm: 1,
      btmCapacityMw: 5200,
      gridTied: 0,
      fullyOffGrid: 1,
      notes: "5.2 GW natural gas generation hub in Anderson County, Texas for AI data centers. Part of $550B US-Japan deal. Announced at CERAWeek March 2026. Gas-to-data-center co-location model.",
      sourceUrl: "https://www.utilitydive.com/news/nextera-gas-generation-doe-softbank-texas-pennsylvania/815541/",
    },
    {
      name: "NextEra – SW Pennsylvania Gas Hub (SoftBank-linked)",
      operatorId: fullCmap["NextEra Energy Resources"],
      location: "Southwest Pennsylvania",
      state: "PA",
      country: "USA",
      capacityMw: 4300,
      status: "announced",
      announcedDate: "2026-03-23",
      totalInvestmentB: 15,
      hasBtm: 1,
      btmCapacityMw: 4300,
      gridTied: 0,
      fullyOffGrid: 1,
      notes: "4.3 GW natural gas generation hub in SW Pennsylvania for AI data centers. Part of $550B US-Japan deal. Paired with Anderson County TX hub for total 9.5 GW from NextEra.",
      sourceUrl: "https://www.utilitydive.com/news/nextera-gas-generation-doe-softbank-texas-pennsylvania/815541/",
    },
    {
      name: "ECP / KKR / CyrusOne – Bosque County TX Campus",
      operatorId: fullCmap["CyrusOne"],
      location: "Bosque County, TX",
      state: "TX",
      country: "USA",
      capacityMw: 190,
      status: "under_construction",
      announcedDate: "2025-07-30",
      totalInvestmentB: 4,
      hasBtm: 1,
      btmCapacityMw: 190,
      gridTied: 1,
      fullyOffGrid: 0,
      notes: "Inaugural investment from ECP/KKR $50B strategic partnership. 190 MW campus adjacent to Calpine Thad Hill Energy Center. Co-located with dedicated gas generation \u2014 surplus power fed back to ERCOT during scarcity. 700,000+ sq ft. Operational Q4 2026. Climate-neutral initiatives, water conservation, biodiversity protection.",
      sourceUrl: "https://www.ecpgp.com/about/news-and-insights/press-releases/2025/energy-capital-partners--ecp--and-kkr-announce-development-of-hy",
    },
    {
      name: "Oracle – Bloom Energy SOFC Deployment (OCI)",
      operatorId: fullCmap["Oracle"],
      location: "Multiple OCI Sites, USA",
      state: "USA",
      country: "USA",
      capacityMw: 200,
      status: "operational",
      announcedDate: "2025-07-24",
      totalInvestmentB: 0.4,
      hasBtm: 1,
      btmCapacityMw: 200,
      gridTied: 1,
      fullyOffGrid: 0,
      notes: "Bloom Energy deploying SOFCs at select Oracle Cloud Infrastructure data centers. Bloom committed to deliver onsite power for an entire data center within 90 days of order. Supports OCI AI and cloud workloads. Complements Oracle's 2.3 GW VoltaGrid/Jenbacher BTM agreement.",
      sourceUrl: "https://investor.bloomenergy.com/press-releases/press-release-details/2025/Oracle-and-Bloom-Energy-Collaborate-to-Deliver-Power-to-Data-Centers-at-the-Speed-of-AI/default.aspx",
    },
    {
      name: "Google – Duane Arnold Nuclear Restart (Iowa)",
      operatorId: fullCmap["Google"],
      location: "Palo (near Cedar Rapids), IA",
      state: "IA",
      country: "USA",
      capacityMw: 615,
      status: "under_construction",
      announcedDate: "2025-10-27",
      totalInvestmentB: 9,
      hasBtm: 0,
      btmCapacityMw: null,
      gridTied: 1,
      fullyOffGrid: 0,
      notes: "25-year PPA with NextEra Energy to restart Iowa's only nuclear plant (shut down 2020). 615 MW Boiling Water Reactor targeting Q1 2029 restart. Google covering all power costs, no cost to Iowa ratepayers. $9B+ economic benefit to Iowa. CIPCO buying remaining portion. Powers Google Cloud/AI in Iowa.",
      sourceUrl: "https://www.investor.nexteraenergy.com/news-and-events/news-releases/2025/10-27-2025-203948689",
    },
    {
      name: "Google / Intersect Power / TPG – Powered Land Program",
      operatorId: fullCmap["Google"],
      location: "Multiple, USA",
      state: "USA",
      country: "USA",
      capacityMw: 3000,
      status: "announced",
      announcedDate: "2024-12-01",
      totalInvestmentB: 20,
      hasBtm: 1,
      btmCapacityMw: 3000,
      gridTied: 1,
      fullyOffGrid: 0,
      notes: "Up to $20B three-way partnership to develop 'powered land' \u2014 data center sites co-located with renewable generation and storage. Google acquiring Intersect Power for ~$4.75B. Fundamental shift from grid PPAs to controlling the entire energy supply chain. Renewables + storage co-location model.",
      sourceUrl: "https://enkiai.com/data-center/on-site-data-center-power-unlocking-the-2026-3t-market",
    },
    {
      name: "DayOne SG1 – Singapore SOFC Hydrogen Pilot",
      operatorId: fullCmap["DayOne Data Centers"],
      location: "Singapore",
      state: null,
      country: "Singapore",
      capacityMw: 20,
      status: "under_construction",
      announcedDate: "2025-07-25",
      totalInvestmentB: 0.26,
      hasBtm: 1,
      btmCapacityMw: 0.3,
      gridTied: 1,
      fullyOffGrid: 0,
      notes: "Singapore's first hydrogen-powered data center. 20 MW facility, 40,000 sqm. Phase I RFS 2026. 0.3 MW SOFC proof-of-concept with NUS partnership. Supports high-density air-cooled GPUs and hybrid liquid cooling. LEED Platinum + Green Mark Platinum targets. SG$350M development cost.",
      sourceUrl: "https://www.datacenterdynamics.com/en/news/dayone-breaks-ground-on-20mw-data-center-in-singapore/",
    },
    {
      name: "Sharon AI / New Era Helium – Permian BTM Net-Zero Campus",
      operatorId: fullCmap["Sharon AI / Texas Critical Data Centers"],
      location: "Midland/Ector County, TX (Permian Basin)",
      state: "TX",
      country: "USA",
      capacityMw: 250,
      status: "announced",
      announcedDate: "2025-01-21",
      totalInvestmentB: 1.5,
      hasBtm: 1,
      btmCapacityMw: 250,
      gridTied: 0,
      fullyOffGrid: 1,
      notes: "Texas Critical Data Centers LLC JV. 250 MW net-zero BTM data center in Permian Basin. New Era Helium providing gas supply + CO2 capture technology. 20-year gas supply agreement. NVIDIA + Lenovo Tier III liquid-cooled facility. 45Q CCUS tax credit pursuit. Expanded from original 90 MW plan.",
      sourceUrl: "https://sharonai.com/press-releases/sharon-ai-and-new-era-helium-finalise-joint-venture-to-build-250mw-net-zero-energy-data-centre-in-texas/",
    },
    {
      name: "New Era Energy & Digital – TCDC Permian Campus",
      operatorId: fullCmap["New Era Energy & Digital (NUAI)"],
      location: "Ector County, TX (Permian Basin)",
      state: "TX",
      country: "USA",
      capacityMw: 450,
      status: "announced",
      announcedDate: "2026-02-27",
      totalInvestmentB: 2,
      hasBtm: 1,
      btmCapacityMw: 450,
      gridTied: 0,
      fullyOffGrid: 1,
      notes: "438-acre AI/HPC campus in Permian Basin scaling to 1+ GW. Thunderhead Energy + TURBINE-X partnership for BTM generation equipment. Aligned with Trump Ratepayer Pledge. Hyperscale anchor tenant secured. Procurement activities underway for generation equipment.",
      sourceUrl: "https://finance.yahoo.com/news/era-energy-digital-announces-450-140000779.html",
    },
    {
      name: "FuelCell Energy – 12.5 MW Data Center Power Block",
      operatorId: fullCmap["Fuel Cell Energy"],
      location: "Multiple, USA",
      state: "USA",
      country: "USA",
      capacityMw: 100,
      status: "announced",
      announcedDate: "2026-03-22",
      totalInvestmentB: 0.15,
      hasBtm: 1,
      btmCapacityMw: 100,
      gridTied: 1,
      fullyOffGrid: 0,
      notes: "New standardized 12.5 MW packaged power block for data centers (10x 1.25 MW modules). Manufacturing expansion from 100 MW to 350 MW/yr at Torrington CT. 275% pipeline increase since Feb 2025. Mostly data center demand. Hub-and-spoke manufacturing model. 12.5 MW block announced at DCD>Connect New York, March 24 2026.",
      sourceUrl: "https://www.nasdaq.com/press-release/fuelcell-energy-scales-data-centers-packaged-125-mw-utility-grade-power-block",
    },
    {
      name: "AEP / Bloom Energy – Wyoming AI Campus 900 MW SOFC",
      operatorId: fullCmap["American Electric Power"],
      location: "Wyoming",
      state: "WY",
      country: "USA",
      capacityMw: 900,
      status: "announced",
      announcedDate: "2026-01-15",
      totalInvestmentB: 2.65,
      hasBtm: 1,
      btmCapacityMw: 900,
      gridTied: 1,
      fullyOffGrid: 0,
      notes: "$2.65B unconditional purchase of ~900 MW Bloom Energy SOFC capacity for Wyoming AI campus. Complements earlier AEP 1 GW BTM SOFC announcement. Utility-procured BTM fuel cells enabling large AI data center in Wyoming without grid bottleneck.",
      sourceUrl: "https://introl.com/blog/fuel-cells-data-center-power-dark-horse-7-billion",
    },
  ];

  const insertedProjects: Record<string, number> = {};
  for (const p of newProjectData) {
    const result = db.insert(projects).values(p as any).returning().get();
    insertedProjects[p.name] = result.id;
  }

  // ── NEW BTM SOURCES ─────────────────────────────────────────────────────────
  const newBtmData = [
    // Piketon Ohio – SoftBank / SB Energy / AEP
    {
      projectId: insertedProjects["SoftBank / SB Energy – Piketon AI Campus (Ohio)"],
      technologyType: "gas_turbine",
      capacityMw: 9200,
      vendorId: null,
      developerId: fullCmap["SB Energy (SoftBank)"],
      fuelType: "natural_gas",
      fuelSourceId: fullCmap["American Electric Power"],
      productModel: "Combined cycle gas turbines (multiple vendors – RFP stage)",
      originCountry: "USA",
      notes: "$33.3B, 9.2 GW dedicated gas plant. AEP Ohio as utility partner. $4.2B transmission upgrades. Integrated on-site + grid hybrid model. On former DOE Portsmouth site.",
    },
    // NextEra TX
    {
      projectId: insertedProjects["NextEra – Anderson County TX Gas Hub (SoftBank-linked)"],
      technologyType: "gas_turbine",
      capacityMw: 5200,
      vendorId: null,
      developerId: fullCmap["NextEra Energy Resources"],
      fuelType: "natural_gas",
      fuelSourceId: null,
      productModel: "Combined cycle gas turbines (vendor TBD)",
      originCountry: "USA",
      notes: "Part of 9.5 GW NextEra AI data center power buildout. Announced CERAWeek March 2026.",
    },
    // NextEra PA
    {
      projectId: insertedProjects["NextEra – SW Pennsylvania Gas Hub (SoftBank-linked)"],
      technologyType: "gas_turbine",
      capacityMw: 4300,
      vendorId: null,
      developerId: fullCmap["NextEra Energy Resources"],
      fuelType: "natural_gas",
      fuelSourceId: null,
      productModel: "Combined cycle gas turbines (vendor TBD)",
      originCountry: "USA",
      notes: "Part of 9.5 GW NextEra AI data center power buildout.",
    },
    // ECP/KKR/CyrusOne Bosque – Calpine gas
    {
      projectId: insertedProjects["ECP / KKR / CyrusOne – Bosque County TX Campus"],
      technologyType: "gas_turbine",
      capacityMw: 190,
      vendorId: null,
      developerId: fullCmap["Calpine"],
      fuelType: "natural_gas",
      fuelSourceId: fullCmap["Calpine"],
      productModel: "Calpine Thad Hill Energy Center (natural gas combined cycle)",
      originCountry: "USA",
      notes: "Co-located with Calpine Thad Hill plant. Long-term dedicated power contract. Surplus fed to ERCOT during grid scarcity events.",
    },
    // Oracle Bloom
    {
      projectId: insertedProjects["Oracle – Bloom Energy SOFC Deployment (OCI)"],
      technologyType: "fuel_cell",
      capacityMw: 200,
      vendorId: fullCmap["Bloom Energy"],
      developerId: fullCmap["Bloom Energy"],
      fuelType: "natural_gas",
      fuelSourceId: null,
      productModel: "Bloom Energy SureSource SOFC (90-day delivery commitment)",
      originCountry: "USA",
      notes: "Bloom committed to power an entire data center within 90 days. Supports OCI AI workloads. Complements Oracle's VoltaGrid gas BTM agreement.",
    },
    // Google Duane Arnold – nuclear existing
    {
      projectId: insertedProjects["Google – Duane Arnold Nuclear Restart (Iowa)"],
      technologyType: "nuclear_existing",
      capacityMw: 615,
      vendorId: fullCmap["NextEra Energy Resources"],
      developerId: fullCmap["NextEra Energy Resources"],
      fuelType: "nuclear",
      fuelSourceId: fullCmap["NextEra Energy Resources"],
      productModel: "Boiling Water Reactor – Duane Arnold Energy Center (Iowa)",
      originCountry: "USA",
      notes: "Shut down 2020, restart targeting Q1 2029. NextEra acquiring 100% ownership. 25-year Google PPA. CIPCO buys remaining output. Zero cost to Iowa ratepayers.",
    },
    // Google/Intersect/TPG – renewables co-located
    {
      projectId: insertedProjects["Google / Intersect Power / TPG – Powered Land Program"],
      technologyType: "solar",
      capacityMw: 2000,
      vendorId: fullCmap["Intersect Power"],
      developerId: fullCmap["Intersect Power"],
      fuelType: "solar",
      fuelSourceId: null,
      productModel: "Utility-scale solar PV + BESS (co-located with data centers)",
      originCountry: "USA",
      notes: "Google acquiring Intersect Power (~$4.75B). Powered land strategy: data centers built adjacent to generation assets. Up to $20B total program.",
    },
    {
      projectId: insertedProjects["Google / Intersect Power / TPG – Powered Land Program"],
      technologyType: "battery",
      capacityMw: 1000,
      vendorId: fullCmap["Intersect Power"],
      developerId: fullCmap["Intersect Power"],
      fuelType: "solar",
      fuelSourceId: null,
      productModel: "Grid-scale BESS (paired with solar)",
      originCountry: "USA",
      notes: "Long-duration storage co-located to firm renewable generation for 24/7 power.",
    },
    // DayOne Singapore
    {
      projectId: insertedProjects["DayOne SG1 – Singapore SOFC Hydrogen Pilot"],
      technologyType: "fuel_cell",
      capacityMw: 0.3,
      vendorId: fullCmap["Bloom Energy"],
      developerId: fullCmap["DayOne Data Centers"],
      fuelType: "hydrogen",
      fuelSourceId: null,
      productModel: "Solid Oxide Fuel Cell (SOFC) – hydrogen pilot with NUS",
      originCountry: "USA",
      notes: "Proof-of-concept 0.3 MW. Singapore's first SOFC data center power. NUS research partnership. Future scale-up planned if pilot validates.",
    },
    // Sharon AI / New Era Helium
    {
      projectId: insertedProjects["Sharon AI / New Era Helium – Permian BTM Net-Zero Campus"],
      technologyType: "gas_turbine",
      capacityMw: 250,
      vendorId: null,
      developerId: fullCmap["New Era Helium (NEHC)"],
      fuelType: "natural_gas",
      fuelSourceId: fullCmap["New Era Helium (NEHC)"],
      productModel: "Gas-fired power plant with CO2 capture (CCUS) – vendor TBD",
      originCountry: "USA",
      notes: "New Era Helium building dedicated gas plant with CO2 capture. 20-year fixed-price gas supply. 45Q CCUS tax credits. Net-zero target via carbon capture.",
    },
    // New Era Energy TCDC
    {
      projectId: insertedProjects["New Era Energy & Digital – TCDC Permian Campus"],
      technologyType: "gas_turbine",
      capacityMw: 450,
      vendorId: fullCmap["Thunderhead Energy / TURBINE-X"],
      developerId: fullCmap["New Era Energy & Digital (NUAI)"],
      fuelType: "natural_gas",
      fuelSourceId: null,
      productModel: "Gas turbines via TURBINE-X OEM channel",
      originCountry: "USA",
      notes: "TURBINE-X is OEM channel partner. Equipment procurement underway. 438-acre site in Permian Basin.",
    },
    // FuelCell Energy 12.5 MW block program
    {
      projectId: insertedProjects["FuelCell Energy – 12.5 MW Data Center Power Block"],
      technologyType: "fuel_cell",
      capacityMw: 100,
      vendorId: fullCmap["Fuel Cell Energy"],
      developerId: fullCmap["Fuel Cell Energy"],
      fuelType: "natural_gas",
      fuelSourceId: null,
      productModel: "FuelCell Energy Block 12.5 MW (10× 1.25 MW modules)",
      originCountry: "USA",
      notes: "Standardized packaged system for faster deployment. Reduces site-specific engineering. Torrington CT manufacturing expanding 100→350 MW/yr. 275% pipeline growth. No rare earth materials.",
    },
    // AEP Wyoming SOFC
    {
      projectId: insertedProjects["AEP / Bloom Energy – Wyoming AI Campus 900 MW SOFC"],
      technologyType: "fuel_cell",
      capacityMw: 900,
      vendorId: fullCmap["Bloom Energy"],
      developerId: fullCmap["American Electric Power"],
      fuelType: "natural_gas",
      fuelSourceId: null,
      productModel: "Bloom Energy SureSource SOFC",
      originCountry: "USA",
      notes: "$2.65B unconditional purchase. Wyoming AI campus. Utility-procured BTM fuel cells. Enables large AI data center without grid bottleneck.",
    },
  ];

  for (const b of newBtmData) {
    db.insert(btmSources).values(b as any).run();
  }

  // ── PROJECT-COMPANY LINKS ───────────────────────────────────────────────────
  const newLinks = [
    { projectId: insertedProjects["SoftBank / SB Energy – Piketon AI Campus (Ohio)"], companyId: fullCmap["American Electric Power"], role: "partner" },
    { projectId: insertedProjects["SoftBank / SB Energy – Piketon AI Campus (Ohio)"], companyId: fullCmap["NextEra Energy Resources"], role: "btm_developer" },
    { projectId: insertedProjects["ECP / KKR / CyrusOne – Bosque County TX Campus"], companyId: fullCmap["Energy Capital Partners (ECP)"], role: "investor" },
    { projectId: insertedProjects["ECP / KKR / CyrusOne – Bosque County TX Campus"], companyId: fullCmap["KKR"], role: "investor" },
    { projectId: insertedProjects["ECP / KKR / CyrusOne – Bosque County TX Campus"], companyId: fullCmap["Calpine"], role: "fuel_supplier" },
    { projectId: insertedProjects["Oracle – Bloom Energy SOFC Deployment (OCI)"], companyId: fullCmap["Bloom Energy"], role: "tech_vendor" },
    { projectId: insertedProjects["Google – Duane Arnold Nuclear Restart (Iowa)"], companyId: fullCmap["NextEra Energy Resources"], role: "fuel_supplier" },
    { projectId: insertedProjects["Google / Intersect Power / TPG – Powered Land Program"], companyId: fullCmap["Intersect Power"], role: "btm_developer" },
    { projectId: insertedProjects["Google / Intersect Power / TPG – Powered Land Program"], companyId: fullCmap["TPG"], role: "investor" },
    { projectId: insertedProjects["DayOne SG1 – Singapore SOFC Hydrogen Pilot"], companyId: fullCmap["Bloom Energy"], role: "tech_vendor" },
    { projectId: insertedProjects["Sharon AI / New Era Helium – Permian BTM Net-Zero Campus"], companyId: fullCmap["New Era Helium (NEHC)"], role: "fuel_supplier" },
    { projectId: insertedProjects["New Era Energy & Digital – TCDC Permian Campus"], companyId: fullCmap["Thunderhead Energy / TURBINE-X"], role: "tech_vendor" },
    { projectId: insertedProjects["FuelCell Energy – 12.5 MW Data Center Power Block"], companyId: fullCmap["Fuel Cell Energy"], role: "tech_vendor" },
    { projectId: insertedProjects["AEP / Bloom Energy – Wyoming AI Campus 900 MW SOFC"], companyId: fullCmap["Bloom Energy"], role: "tech_vendor" },
    { projectId: insertedProjects["NextEra – Anderson County TX Gas Hub (SoftBank-linked)"], companyId: fullCmap["SB Energy (SoftBank)"], role: "customer" },
    { projectId: insertedProjects["NextEra – SW Pennsylvania Gas Hub (SoftBank-linked)"], companyId: fullCmap["SB Energy (SoftBank)"], role: "customer" },
  ];

  for (const l of newLinks) {
    if (l.companyId) {
      db.insert(projectCompanies).values(l as any).run();
    }
  }

  console.log("✅ Database seeded with V2 DC Intel additions (12 new projects, 13 new companies)");
}
