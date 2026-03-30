import { db } from "./db";
import { companies, projects, btmSources, projectCompanies } from "@shared/schema";

export function seedDatabase() {
  const existingCompanies = db.select().from(companies).all();
  if (existingCompanies.length > 0) return; // already seeded

  // ── COMPANIES ──────────────────────────────────────────────────────────────
  const companyData = [
    // Hyperscalers / customers
    { name: "Oracle", ticker: "ORCL", role: "hyperscaler", hq: "Austin, TX", country: "USA", website: "oracle.com", description: "Cloud & AI infrastructure. Largest Stargate investor. Committing $40B+ to US AI campuses.", logoInitials: "OR" },
    { name: "Microsoft", ticker: "MSFT", role: "hyperscaler", hq: "Redmond, WA", country: "USA", website: "microsoft.com", description: "Azure AI hyperscaler. $80B 2025 capex plan. Restarted Three Mile Island via Constellation.", logoInitials: "MS" },
    { name: "Meta", ticker: "META", role: "hyperscaler", hq: "Menlo Park, CA", country: "USA", website: "meta.com", description: "AI infrastructure investor. 6.6 GW nuclear commitments. Building 400 MW dedicated gas gen.", logoInitials: "ME" },
    { name: "Amazon Web Services", ticker: "AMZN", role: "hyperscaler", hq: "Seattle, WA", country: "USA", website: "aws.amazon.com", description: "Susquehanna nuclear campus. X-energy SMR investment. $20B+ nuclear conversion.", logoInitials: "AW" },
    { name: "Google", ticker: "GOOGL", role: "hyperscaler", hq: "Mountain View, CA", country: "USA", website: "google.com", description: "500 MW Kairos Power SMR deal. First US corporate SMR fleet agreement.", logoInitials: "GO" },
    { name: "OpenAI", role: "hyperscaler", hq: "San Francisco, CA", country: "USA", website: "openai.com", description: "Stargate project initiator. 10 GW committed AI campus capacity across US.", logoInitials: "OA" },
    // DC Operators / Developers
    { name: "Aligned Data Centers", role: "dc_operator", hq: "Irving, TX", country: "USA", website: "aligneddc.com", description: "$40B Macquarie-backed hyperscale operator. 5 GW+ planned. Americas footprint.", logoInitials: "AL" },
    { name: "Vantage Data Centers", role: "dc_operator", hq: "Santa Clara, CA", country: "USA", website: "vantagedc.com", description: "Hyperscale colo operator. 1 GW+ VoltaGrid BTM gas agreement.", logoInitials: "VD" },
    { name: "Equinix", ticker: "EQIX", role: "dc_operator", hq: "Redwood City, CA", country: "USA", website: "equinix.com", description: "Global colocation REIT. 100+ MW Bloom Energy SOFC across 19 IBX data centers.", logoInitials: "EQ" },
    { name: "CoreWeave", role: "dc_operator", hq: "Roseland, NJ", country: "USA", website: "coreweave.com", description: "AI cloud infrastructure. 14 MW Bloom Energy SOFC for rapid AI deployment.", logoInitials: "CW" },
    { name: "CoreSite", role: "dc_operator", hq: "Denver, CO", country: "USA", website: "coresite.com", description: "Hybrid utility + SOFC systems. Blend grid and fuel cell primary power.", logoInitials: "CS" },
    { name: "Joule Capital Partners", role: "dc_operator", hq: "Millard County, UT", country: "USA", website: "jouledevelopment.com", description: "Utah AI campus. 1.7 GW Caterpillar recip engines. Fully islanded from RMP grid.", logoInitials: "JC" },
    { name: "Fermi America", role: "dc_operator", hq: "USA", country: "USA", website: "fermiamerica.com", description: "Project Matador: up to 11 GW BTM, 15M sq ft AI hyperscale by 2038.", logoInitials: "FA" },
    { name: "Prometheus Hyperscale", role: "dc_operator", hq: "USA", country: "USA", website: "prometheushyperscale.com", description: "Wyoming 1.2 GW campus with Engie. Oklo SMR future integration planned.", logoInitials: "PH" },
    // BTM Developers / Power Providers
    { name: "VoltaGrid", role: "btm_developer", hq: "Dallas, TX", country: "USA", website: "voltagrid.com", description: "Modular reciprocating engine BTM platform. 2.3 GW Oracle deal. 1+ GW Vantage. Qpac platform using INNIO Jenbacher + ABB.", logoInitials: "VG" },
    { name: "Brookfield Asset Management", ticker: "BAM", role: "investor", hq: "Toronto, ON", country: "Canada", website: "brookfield.com", description: "$5B Bloom Energy fuel cell deployment for AI data centers. Global AI infrastructure head.", logoInitials: "BK" },
    { name: "Conduit Power", role: "btm_developer", hq: "USA", country: "USA", website: "conduitpower.com", description: "300 MW BTM gas + battery storage at Prometheus/Engie Texas sites.", logoInitials: "CP" },
    { name: "International Electric Power", role: "btm_developer", hq: "USA", country: "USA", website: "iep.com", description: "944 MW gas plant in Pennsylvania. Data center power with BESS, avoids PJM interconnect.", logoInitials: "IE" },
    { name: "FO Permian Partners / Hivolt Energy", role: "btm_developer", hq: "Permian Basin, TX", country: "USA", website: "hivolt.com", description: "5 GW off-grid gas power solution for Texas data centers in the Permian Basin.", logoInitials: "HV" },
    // Technology Vendors
    { name: "GE Vernova", ticker: "GEV", role: "tech_vendor", hq: "Cambridge, MA", country: "USA", website: "gevernova.com", description: "Aeroderivative gas turbines (LM2500, LM6000) for BTM. 29 stackable units (~1 GW) for Project Stargate.", logoInitials: "GV" },
    { name: "INNIO Jenbacher", role: "tech_vendor", hq: "Jenbach", country: "Austria", website: "jenbacher.com", description: "Reciprocating gas engines for data centers. J620, J624 models. 2.3 GW ordered for Oracle. Manufactured in Austria.", logoInitials: "IJ" },
    { name: "Caterpillar", ticker: "CAT", role: "tech_vendor", hq: "Irving, TX", country: "USA", website: "cat.com", description: "G3520K generator sets (2.5 MW each). 1.7 GW firm order for Joule Utah campus. 4 GW potential total.", logoInitials: "CA" },
    { name: "Siemens Energy", ticker: "ENR", role: "tech_vendor", hq: "Munich", country: "Germany", website: "siemens-energy.com", description: "Gas turbines for Stargate Doña Ana NM campus. Grid-independent microgrid turbines.", logoInitials: "SE" },
    { name: "Bloom Energy", ticker: "BE", role: "tech_vendor", hq: "San Jose, CA", country: "USA", website: "bloomenergy.com", description: "SureSource SOFC fuel cells. 60-65% efficiency. $5B Brookfield deal. AEP 1 GW agreement. Equinix 100+ MW, CoreWeave 14 MW.", logoInitials: "BL" },
    { name: "Fuel Cell Energy", ticker: "FCEL", role: "tech_vendor", hq: "Danbury, CT", country: "USA", website: "fuelcellenergy.com", description: "Carbonate & SOFC platforms. 450 MW SDCL partnership. Off-grid data center power, CHP, carbon capture.", logoInitials: "FC" },
    { name: "ABB", ticker: "ABB", role: "tech_vendor", hq: "Zurich", country: "Switzerland", website: "abb.com", description: "Power electronics, switchgear, and control systems. Key VoltaGrid Qpac platform supplier.", logoInitials: "AB" },
    { name: "Kairos Power", role: "tech_vendor", hq: "Alameda, CA", country: "USA", website: "kairospower.com", description: "Molten salt SMR technology. 500 MW Google deal across 6-7 reactors by 2035. Hermes 2 reactor.", logoInitials: "KP" },
    { name: "X-energy", role: "tech_vendor", hq: "Rockville, MD", country: "USA", website: "x-energy.com", description: "Xe-100 high-temperature gas SMR (80 MW each). Amazon Cascade facility (up to 12 units). TRISO fuel.", logoInitials: "XE" },
    { name: "Oklo", ticker: "OKLO", role: "tech_vendor", hq: "Santa Clara, CA", country: "USA", website: "oklo.com", description: "Aurora microreactor SMR. Prometheus Hyperscale future BTM integration in Wyoming.", logoInitials: "OK" },
    { name: "Caterpillar / Ballard Power Systems", role: "tech_vendor", hq: "Vancouver, BC", country: "Canada", website: "ballard.com", description: "PEM hydrogen fuel cell backup power. Microsoft 1.5 MW demonstration project.", logoInitials: "BP" },
    // Fuel suppliers
    { name: "Energy Transfer", ticker: "ET", role: "fuel_supplier", hq: "Dallas, TX", country: "USA", website: "energytransfer.com", description: "Midstream gas pipeline operator. Supplying Oracle's 2.3 GW VoltaGrid BTM infrastructure.", logoInitials: "ET" },
    { name: "Constellation Energy", ticker: "CEG", role: "fuel_supplier", hq: "Baltimore, MD", country: "USA", website: "constellationenergy.com", description: "Nuclear power supplier. Three Mile Island restart (Crane CEC) for Microsoft $16B 20-year PPA.", logoInitials: "CE" },
    { name: "American Electric Power", ticker: "AEP", role: "fuel_supplier", hq: "Columbus, OH", country: "USA", website: "aep.com", description: "Procuring up to 1 GW of Bloom Energy SOFCs for behind-the-meter data center customers.", logoInitials: "AE" },
    { name: "Engie", role: "fuel_supplier", hq: "La Défense", country: "France", website: "engie.com", description: "Energy utility. Partner with Prometheus Hyperscale on Wyoming 1.2 GW campus.", logoInitials: "EN" },
  ];

  const insertedCompanies: { [key: string]: number } = {};
  for (const c of companyData) {
    const result = db.insert(companies).values(c as any).returning().get();
    insertedCompanies[c.name] = result.id;
  }

  // ── PROJECTS ──────────────────────────────────────────────────────────────
  const projectData = [
    {
      name: "Project Stargate – Texas (Shackleford County)",
      operatorId: insertedCompanies["Oracle"],
      location: "Shackleford County, TX",
      state: "TX",
      capacityMw: 800,
      status: "under_construction",
      announcedDate: "2025-01-01",
      totalInvestmentB: 40,
      hasBtm: 1,
      btmCapacityMw: 2300,
      gridTied: 0,
      fullyOffGrid: 1,
      notes: "Powered by onsite BTM gas-powered microgrid. VoltaGrid Qpac (INNIO Jenbacher recip engines) + GE Vernova aeroderivative turbines. Gas supply via Energy Transfer.",
      sourceUrl: "https://voltagrid.com/voltagrid-collaborates-with-oracle-to-power-next-gen-ai-data-centers",
    },
    {
      name: "Project Stargate – New Mexico (Doña Ana County)",
      operatorId: insertedCompanies["Oracle"],
      location: "Doña Ana County, NM",
      state: "NM",
      capacityMw: 400,
      status: "under_construction",
      announcedDate: "2025-03-01",
      totalInvestmentB: 5,
      hasBtm: 1,
      btmCapacityMw: 600,
      gridTied: 0,
      fullyOffGrid: 1,
      notes: "Onsite BTM microgrid using Siemens and GE gas turbines. Fully independent from local grid.",
      sourceUrl: "https://www.latitudemedia.com/news/behind-the-meter-generation-is-picking-up-traction/",
    },
    {
      name: "Joule BetterGrid Campus – Utah",
      operatorId: insertedCompanies["Joule Capital Partners"],
      location: "Millard County, UT",
      state: "UT",
      capacityMw: 2000,
      status: "under_construction",
      announcedDate: "2025-10-01",
      totalInvestmentB: 3,
      hasBtm: 1,
      btmCapacityMw: 1700,
      gridTied: 0,
      fullyOffGrid: 1,
      notes: "1.7 GW Caterpillar G3520K generator sets on firm order. N+2 BTM design. 4,000 acres, 10,000 acre-ft water rights, direct gas interconnect. Fully islanded from Rocky Mountain Power.",
      sourceUrl: "https://thedatacenterengineer.com/news/joule-announces-bettergrid-platform-for-high-density-ai-data-centers-in-utah/",
    },
    {
      name: "Vantage Data Centers – BTM Gas Portfolio",
      operatorId: insertedCompanies["Vantage Data Centers"],
      location: "Multiple, USA",
      state: "USA",
      capacityMw: 500,
      status: "under_construction",
      announcedDate: "2025-04-01",
      totalInvestmentB: 1.5,
      hasBtm: 1,
      btmCapacityMw: 1000,
      gridTied: 1,
      fullyOffGrid: 0,
      notes: "VoltaGrid deploying 1+ GW of gas power solutions. Hybrid BTM + grid.",
      sourceUrl: "https://www.latitudemedia.com/news/behind-the-meter-generation-is-picking-up-traction/",
    },
    {
      name: "Equinix IBX Fuel Cell Program",
      operatorId: insertedCompanies["Equinix"],
      location: "Multiple, USA",
      state: "USA",
      capacityMw: 300,
      status: "operational",
      announcedDate: "2024-06-01",
      totalInvestmentB: 0.5,
      hasBtm: 1,
      btmCapacityMw: 100,
      gridTied: 1,
      fullyOffGrid: 0,
      notes: "Bloom Energy SureSource SOFCs as primary power across 19 IBX colocation data centers.",
      sourceUrl: "https://enkiai.com/data-center/top-10-2025-fuel-cell-projects-for-ai-data-centers",
    },
    {
      name: "Brookfield–Bloom Energy AI Data Center Program",
      operatorId: insertedCompanies["Brookfield Asset Management"],
      location: "Multiple, USA",
      state: "USA",
      capacityMw: 2000,
      status: "announced",
      announcedDate: "2025-10-13",
      totalInvestmentB: 5,
      hasBtm: 1,
      btmCapacityMw: 2000,
      gridTied: 0,
      fullyOffGrid: 1,
      notes: "$5B framework to deploy Bloom Energy SOFCs at AI data centers. Avoids grid connection delays. 'BTM power is essential to closing the grid gap for AI factories' - Brookfield AI Infrastructure Head.",
      sourceUrl: "https://www.spglobal.com/market-intelligence/en/news-insights/articles/2025/10/data-center-developers-turn-to-distributed-behind-the-meter-power-94174247",
    },
    {
      name: "Fermi America – Project Matador",
      operatorId: insertedCompanies["Fermi America"],
      location: "USA (undisclosed)",
      state: "USA",
      capacityMw: 15000,
      status: "announced",
      announcedDate: "2025-09-01",
      totalInvestmentB: 50,
      hasBtm: 1,
      btmCapacityMw: 11000,
      gridTied: 0,
      fullyOffGrid: 1,
      notes: "Up to 11 GW BTM energy, 15M sq ft AI hyperscale compute by 2038. Public filing describes multi-phased BTM-first architecture.",
      sourceUrl: "https://www.latitudemedia.com/news/behind-the-meter-generation-is-picking-up-traction/",
    },
    {
      name: "Prometheus Hyperscale – Wyoming Campus",
      operatorId: insertedCompanies["Prometheus Hyperscale"],
      location: "Evanston, WY",
      state: "WY",
      capacityMw: 1200,
      status: "announced",
      announcedDate: "2025-07-01",
      totalInvestmentB: 4,
      hasBtm: 1,
      btmCapacityMw: 1500,
      gridTied: 1,
      fullyOffGrid: 0,
      notes: "Gas-fired BTM generation with Engie. 300 MW via Conduit Power at Texas sites. Oklo SMR integration planned for future phases.",
      sourceUrl: "https://www.latitudemedia.com/news/behind-the-meter-generation-is-picking-up-traction/",
    },
    {
      name: "Microsoft – Crane Clean Energy Center (TMI Restart)",
      operatorId: insertedCompanies["Microsoft"],
      location: "Dauphin County, PA",
      state: "PA",
      capacityMw: 835,
      status: "under_construction",
      announcedDate: "2023-09-20",
      totalInvestmentB: 16,
      hasBtm: 0,
      btmCapacityMw: null,
      gridTied: 1,
      fullyOffGrid: 0,
      notes: "20-year PPA with Constellation Energy to restart Three Mile Island Unit 1 (renamed Crane CEC). 835 MW nuclear. Target 2028. Grid-tied nuclear supply for Azure data centers.",
      sourceUrl: "https://introl.com/blog/nuclear-power-ai-data-centers-microsoft-google-amazon-2025",
    },
    {
      name: "Google – Kairos Power SMR Program",
      operatorId: insertedCompanies["Google"],
      location: "Multiple, USA (TN & AL)",
      state: "TN",
      capacityMw: 500,
      status: "announced",
      announcedDate: "2024-10-14",
      totalInvestmentB: 4,
      hasBtm: 0,
      btmCapacityMw: null,
      gridTied: 1,
      fullyOffGrid: 0,
      notes: "First US corporate SMR fleet agreement. 500 MW across 6-7 Kairos Hermes 2 molten salt reactors. First reactor 2030, fleet by 2035. TVA offtake agreement.",
      sourceUrl: "https://introl.com/blog/nuclear-power-ai-data-centers-microsoft-google-amazon-2025",
    },
    {
      name: "Amazon – Cascade Advanced Energy Facility",
      operatorId: insertedCompanies["Amazon Web Services"],
      location: "Richland, WA",
      state: "WA",
      capacityMw: 960,
      status: "announced",
      announcedDate: "2024-10-16",
      totalInvestmentB: 20,
      hasBtm: 0,
      btmCapacityMw: null,
      gridTied: 1,
      fullyOffGrid: 0,
      notes: "Up to 12 X-energy Xe-100 SMRs (80 MW each). Start with 4 units (320 MW), scale to 960 MW. TRISO fuel technology. Early 2030s operational. Powers eastern Oregon AWS cluster.",
      sourceUrl: "https://introl.com/blog/nuclear-power-ai-data-centers-microsoft-google-amazon-2025",
    },
    {
      name: "Meta – 400 MW Dedicated Gas Generation",
      operatorId: insertedCompanies["Meta"],
      location: "USA (undisclosed)",
      state: "USA",
      capacityMw: 400,
      status: "announced",
      announcedDate: "2025-02-01",
      totalInvestmentB: 1.2,
      hasBtm: 1,
      btmCapacityMw: 400,
      gridTied: 0,
      fullyOffGrid: 1,
      notes: "400 MW dedicated natural gas generation that never touches the grid. First large Meta BTM gas commitment.",
      sourceUrl: "https://avanzaenergy.substack.com/p/data-centers-are-killing-the-grid",
    },
    {
      name: "FO Permian – 5 GW Texas Off-Grid Gas",
      operatorId: insertedCompanies["FO Permian Partners / Hivolt Energy"],
      location: "Permian Basin, TX",
      state: "TX",
      capacityMw: 5000,
      status: "announced",
      announcedDate: "2025-08-01",
      totalInvestmentB: 10,
      hasBtm: 1,
      btmCapacityMw: 5000,
      gridTied: 0,
      fullyOffGrid: 1,
      notes: "5 GW fully off-grid gas power solution for Texas data centers in the Permian Basin.",
      sourceUrl: "https://www.latitudemedia.com/news/behind-the-meter-generation-is-picking-up-traction/",
    },
    {
      name: "CoreWeave – Bloom Energy SOFC Deployment",
      operatorId: insertedCompanies["CoreWeave"],
      location: "Multiple, USA",
      state: "USA",
      capacityMw: 50,
      status: "operational",
      announcedDate: "2024-12-01",
      totalInvestmentB: 0.08,
      hasBtm: 1,
      btmCapacityMw: 14,
      gridTied: 1,
      fullyOffGrid: 0,
      notes: "14 MW Bloom Energy SureSource SOFCs. Rapid power deployment for AI cloud infrastructure.",
      sourceUrl: "https://enkiai.com/data-center/top-10-2025-fuel-cell-projects-for-ai-data-centers",
    },
    {
      name: "AEP – 1 GW Bloom SOFC BTM Program",
      operatorId: insertedCompanies["American Electric Power"],
      location: "Multiple, USA",
      state: "USA",
      capacityMw: 1000,
      status: "announced",
      announcedDate: "2025-06-01",
      totalInvestmentB: 2,
      hasBtm: 1,
      btmCapacityMw: 1000,
      gridTied: 1,
      fullyOffGrid: 0,
      notes: "AEP procuring up to 1 GW of Bloom Energy SOFCs for behind-the-meter power for utility data center customers.",
      sourceUrl: "https://enkiai.com/data-center/top-10-2025-fuel-cell-projects-for-ai-data-centers",
    },
    {
      name: "International Electric Power – PA Gas Plant",
      operatorId: insertedCompanies["International Electric Power"],
      location: "Pennsylvania",
      state: "PA",
      capacityMw: 944,
      status: "announced",
      announcedDate: "2025-05-01",
      totalInvestmentB: 1.8,
      hasBtm: 1,
      btmCapacityMw: 944,
      gridTied: 0,
      fullyOffGrid: 0,
      notes: "944 MW gas plant powering data center. Integrates with BESS. Avoids PJM interconnection for initial operation.",
      sourceUrl: "https://www.latitudemedia.com/news/behind-the-meter-generation-is-picking-up-traction/",
    },
  ];

  const insertedProjects: { [key: string]: number } = {};
  for (const p of projectData) {
    const result = db.insert(projects).values(p as any).returning().get();
    insertedProjects[p.name] = result.id;
  }

  // ── BTM SOURCES ────────────────────────────────────────────────────────────
  const btmData = [
    // Stargate Texas – 2 BTM techs
    { projectId: insertedProjects["Project Stargate – Texas (Shackleford County)"], technologyType: "recip_engine", capacityMw: 1500, vendorId: insertedCompanies["INNIO Jenbacher"], developerId: insertedCompanies["VoltaGrid"], fuelType: "natural_gas", fuelSourceId: insertedCompanies["Energy Transfer"], productModel: "Jenbacher J620/J624 (Qpac Platform)", originCountry: "Austria", notes: "Qpac modular platform, up to 20 MW per unit, 200 MW per minor-source air permit. AI-optimized high-transient-response. ABB power electronics." },
    { projectId: insertedProjects["Project Stargate – Texas (Shackleford County)"], technologyType: "gas_turbine", capacityMw: 800, vendorId: insertedCompanies["GE Vernova"], developerId: insertedCompanies["VoltaGrid"], fuelType: "natural_gas", fuelSourceId: insertedCompanies["Energy Transfer"], productModel: "GE LM2500+G4 (aeroderivative, stackable)", originCountry: "USA", notes: "29 stackable aeroderivative turbines delivering ~1 GW. Fast deployment, scalable footprint." },
    // Stargate NM
    { projectId: insertedProjects["Project Stargate – New Mexico (Doña Ana County)"], technologyType: "gas_turbine", capacityMw: 400, vendorId: insertedCompanies["Siemens Energy"], developerId: null, fuelType: "natural_gas", fuelSourceId: null, productModel: "Siemens SGT industrial gas turbine", originCountry: "Germany", notes: "BTM microgrid, fully independent from local grid." },
    { projectId: insertedProjects["Project Stargate – New Mexico (Doña Ana County)"], technologyType: "gas_turbine", capacityMw: 200, vendorId: insertedCompanies["GE Vernova"], developerId: null, fuelType: "natural_gas", fuelSourceId: null, productModel: "GE aeroderivative turbine", originCountry: "USA", notes: "Combined with Siemens turbines for NM campus BTM microgrid." },
    // Joule Utah
    { projectId: insertedProjects["Joule BetterGrid Campus – Utah"], technologyType: "recip_engine", capacityMw: 1700, vendorId: insertedCompanies["Caterpillar"], developerId: insertedCompanies["Joule Capital Partners"], fuelType: "natural_gas", fuelSourceId: null, productModel: "Caterpillar G3520K (2.5 MW/unit)", originCountry: "USA", notes: "1.7 GW firm order. First delivery March 2025. N+2 redundancy. BetterGrid platform includes SCR units and BESS." },
    // Vantage
    { projectId: insertedProjects["Vantage Data Centers – BTM Gas Portfolio"], technologyType: "recip_engine", capacityMw: 1000, vendorId: insertedCompanies["INNIO Jenbacher"], developerId: insertedCompanies["VoltaGrid"], fuelType: "natural_gas", fuelSourceId: null, productModel: "VoltaGrid Qpac (Jenbacher engines)", originCountry: "Austria", notes: "VoltaGrid deploying 1+ GW across Vantage portfolio." },
    // Equinix
    { projectId: insertedProjects["Equinix IBX Fuel Cell Program"], technologyType: "fuel_cell", capacityMw: 100, vendorId: insertedCompanies["Bloom Energy"], developerId: null, fuelType: "natural_gas", fuelSourceId: null, productModel: "Bloom Energy SureSource 4000 (SOFC)", originCountry: "USA", notes: "Primary power across 19 IBX data centers. 60-65% efficiency. 100 MW per acre stacked density." },
    // Brookfield–Bloom
    { projectId: insertedProjects["Brookfield–Bloom Energy AI Data Center Program"], technologyType: "fuel_cell", capacityMw: 2000, vendorId: insertedCompanies["Bloom Energy"], developerId: insertedCompanies["Brookfield Asset Management"], fuelType: "natural_gas", fuelSourceId: null, productModel: "Bloom Energy SureSource (SOFC)", originCountry: "USA", notes: "$5B framework. Grid-independent. 'Closing the grid gap for AI factories'." },
    // CoreWeave
    { projectId: insertedProjects["CoreWeave – Bloom Energy SOFC Deployment"], technologyType: "fuel_cell", capacityMw: 14, vendorId: insertedCompanies["Bloom Energy"], developerId: null, fuelType: "natural_gas", fuelSourceId: null, productModel: "Bloom Energy SureSource (SOFC)", originCountry: "USA", notes: "Rapid deployment for AI cloud infrastructure." },
    // AEP
    { projectId: insertedProjects["AEP – 1 GW Bloom SOFC BTM Program"], technologyType: "fuel_cell", capacityMw: 1000, vendorId: insertedCompanies["Bloom Energy"], developerId: insertedCompanies["American Electric Power"], fuelType: "natural_gas", fuelSourceId: null, productModel: "Bloom Energy SureSource (SOFC)", originCountry: "USA", notes: "Utility-procured BTM fuel cells for data center customers." },
    // Meta gas
    { projectId: insertedProjects["Meta – 400 MW Dedicated Gas Generation"], technologyType: "gas_turbine", capacityMw: 400, vendorId: null, developerId: insertedCompanies["Meta"], fuelType: "natural_gas", fuelSourceId: null, productModel: "Industrial gas turbine (vendor TBD)", originCountry: "USA", notes: "Never touches the grid. Dedicated generation for Meta AI campuses." },
    // Fermi
    { projectId: insertedProjects["Fermi America – Project Matador"], technologyType: "recip_engine", capacityMw: 6000, vendorId: null, developerId: insertedCompanies["Fermi America"], fuelType: "natural_gas", fuelSourceId: null, productModel: "TBD – multiple vendor RFPs", originCountry: "USA", notes: "Multi-phased BTM-first architecture through 2038." },
    { projectId: insertedProjects["Fermi America – Project Matador"], technologyType: "gas_turbine", capacityMw: 5000, vendorId: null, developerId: insertedCompanies["Fermi America"], fuelType: "natural_gas", fuelSourceId: null, productModel: "TBD – multiple vendor RFPs", originCountry: "USA", notes: "Mix of recip engines and turbines expected." },
    // Prometheus
    { projectId: insertedProjects["Prometheus Hyperscale – Wyoming Campus"], technologyType: "gas_turbine", capacityMw: 900, vendorId: null, developerId: insertedCompanies["Conduit Power"], fuelType: "natural_gas", fuelSourceId: null, productModel: "Gas turbines (vendor TBD)", originCountry: "USA", notes: "Onsite gas-fired BTM generation with Engie." },
    { projectId: insertedProjects["Prometheus Hyperscale – Wyoming Campus"], technologyType: "battery", capacityMw: 300, vendorId: null, developerId: insertedCompanies["Conduit Power"], fuelType: "solar", fuelSourceId: null, productModel: "BESS (vendor TBD)", originCountry: "USA", notes: "Battery storage at Texas Engie sites." },
    { projectId: insertedProjects["Prometheus Hyperscale – Wyoming Campus"], technologyType: "nuclear_smr", capacityMw: 300, vendorId: insertedCompanies["Oklo"], developerId: null, fuelType: "nuclear", fuelSourceId: null, productModel: "Oklo Aurora microreactor", originCountry: "USA", notes: "Future BTM integration planned. Not yet contracted." },
    // TMI / Microsoft
    { projectId: insertedProjects["Microsoft – Crane Clean Energy Center (TMI Restart)"], technologyType: "nuclear_existing", capacityMw: 835, vendorId: insertedCompanies["Constellation Energy"], developerId: insertedCompanies["Microsoft"], fuelType: "nuclear", fuelSourceId: insertedCompanies["Constellation Energy"], productModel: "Three Mile Island Unit 1 (PWR)", originCountry: "USA", notes: "Existing pressurized water reactor restart. 20-year PPA. Crane Clean Energy Center." },
    // Google SMR
    { projectId: insertedProjects["Google – Kairos Power SMR Program"], technologyType: "nuclear_smr", capacityMw: 500, vendorId: insertedCompanies["Kairos Power"], developerId: insertedCompanies["Google"], fuelType: "nuclear", fuelSourceId: null, productModel: "Kairos Hermes 2 (molten salt SMR, ~70 MW/unit)", originCountry: "USA", notes: "6-7 reactors. TVA offtake agreement. First-of-kind US corporate SMR fleet." },
    // Amazon SMR
    { projectId: insertedProjects["Amazon – Cascade Advanced Energy Facility"], technologyType: "nuclear_smr", capacityMw: 960, vendorId: insertedCompanies["X-energy"], developerId: insertedCompanies["Amazon Web Services"], fuelType: "nuclear", fuelSourceId: null, productModel: "X-energy Xe-100 (HTGR, 80 MW/unit)", originCountry: "USA", notes: "Up to 12 modules. TRISO fuel, physically cannot melt. Start 4 units → scale to 12." },
    // IEP PA
    { projectId: insertedProjects["International Electric Power – PA Gas Plant"], technologyType: "gas_turbine", capacityMw: 800, vendorId: null, developerId: insertedCompanies["International Electric Power"], fuelType: "natural_gas", fuelSourceId: null, productModel: "Combined cycle gas plant", originCountry: "USA", notes: "944 MW total, combined cycle with BESS. Avoids PJM interconnection." },
    { projectId: insertedProjects["International Electric Power – PA Gas Plant"], technologyType: "battery", capacityMw: 144, vendorId: null, developerId: insertedCompanies["International Electric Power"], fuelType: "solar", fuelSourceId: null, productModel: "Grid-scale BESS", originCountry: "USA", notes: "Battery storage for load management alongside gas plant." },
    // FO Permian
    { projectId: insertedProjects["FO Permian – 5 GW Texas Off-Grid Gas"], technologyType: "gas_turbine", capacityMw: 3000, vendorId: null, developerId: insertedCompanies["FO Permian Partners / Hivolt Energy"], fuelType: "natural_gas", fuelSourceId: null, productModel: "Industrial gas turbines (multiple vendors)", originCountry: "USA", notes: "Permian Basin off-grid. Multiple turbine vendors expected." },
    { projectId: insertedProjects["FO Permian – 5 GW Texas Off-Grid Gas"], technologyType: "recip_engine", capacityMw: 2000, vendorId: null, developerId: insertedCompanies["FO Permian Partners / Hivolt Energy"], fuelType: "natural_gas", fuelSourceId: null, productModel: "Reciprocating engines (multiple vendors)", originCountry: "USA", notes: "Mix of turbines and recip engines for 5 GW total." },
  ];

  for (const b of btmData) {
    db.insert(btmSources).values(b as any).run();
  }

  // ── PROJECT-COMPANY LINKS ──────────────────────────────────────────────────
  const links = [
    { projectId: insertedProjects["Project Stargate – Texas (Shackleford County)"], companyId: insertedCompanies["OpenAI"], role: "customer" },
    { projectId: insertedProjects["Project Stargate – Texas (Shackleford County)"], companyId: insertedCompanies["VoltaGrid"], role: "btm_developer" },
    { projectId: insertedProjects["Project Stargate – Texas (Shackleford County)"], companyId: insertedCompanies["Energy Transfer"], role: "fuel_supplier" },
    { projectId: insertedProjects["Project Stargate – Texas (Shackleford County)"], companyId: insertedCompanies["GE Vernova"], role: "tech_vendor" },
    { projectId: insertedProjects["Project Stargate – Texas (Shackleford County)"], companyId: insertedCompanies["INNIO Jenbacher"], role: "tech_vendor" },
    { projectId: insertedProjects["Project Stargate – Texas (Shackleford County)"], companyId: insertedCompanies["ABB"], role: "tech_vendor" },
    { projectId: insertedProjects["Project Stargate – New Mexico (Doña Ana County)"], companyId: insertedCompanies["OpenAI"], role: "customer" },
    { projectId: insertedProjects["Project Stargate – New Mexico (Doña Ana County)"], companyId: insertedCompanies["GE Vernova"], role: "tech_vendor" },
    { projectId: insertedProjects["Project Stargate – New Mexico (Doña Ana County)"], companyId: insertedCompanies["Siemens Energy"], role: "tech_vendor" },
    { projectId: insertedProjects["Joule BetterGrid Campus – Utah"], companyId: insertedCompanies["Caterpillar"], role: "tech_vendor" },
    { projectId: insertedProjects["Vantage Data Centers – BTM Gas Portfolio"], companyId: insertedCompanies["VoltaGrid"], role: "btm_developer" },
    { projectId: insertedProjects["Vantage Data Centers – BTM Gas Portfolio"], companyId: insertedCompanies["INNIO Jenbacher"], role: "tech_vendor" },
    { projectId: insertedProjects["Equinix IBX Fuel Cell Program"], companyId: insertedCompanies["Bloom Energy"], role: "tech_vendor" },
    { projectId: insertedProjects["Brookfield–Bloom Energy AI Data Center Program"], companyId: insertedCompanies["Bloom Energy"], role: "tech_vendor" },
    { projectId: insertedProjects["AEP – 1 GW Bloom SOFC BTM Program"], companyId: insertedCompanies["Bloom Energy"], role: "tech_vendor" },
    { projectId: insertedProjects["CoreWeave – Bloom Energy SOFC Deployment"], companyId: insertedCompanies["Bloom Energy"], role: "tech_vendor" },
    { projectId: insertedProjects["Microsoft – Crane Clean Energy Center (TMI Restart)"], companyId: insertedCompanies["Constellation Energy"], role: "fuel_supplier" },
    { projectId: insertedProjects["Google – Kairos Power SMR Program"], companyId: insertedCompanies["Kairos Power"], role: "tech_vendor" },
    { projectId: insertedProjects["Amazon – Cascade Advanced Energy Facility"], companyId: insertedCompanies["X-energy"], role: "tech_vendor" },
    { projectId: insertedProjects["Prometheus Hyperscale – Wyoming Campus"], companyId: insertedCompanies["Engie"], role: "partner" },
    { projectId: insertedProjects["Prometheus Hyperscale – Wyoming Campus"], companyId: insertedCompanies["Conduit Power"], role: "btm_developer" },
    { projectId: insertedProjects["Prometheus Hyperscale – Wyoming Campus"], companyId: insertedCompanies["Oklo"], role: "tech_vendor" },
  ];

  for (const l of links) {
    db.insert(projectCompanies).values(l as any).run();
  }

  console.log("✅ Database seeded with DC Intel data");
}
