import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { rawDb } from "./db";
import https from "https";
import http from "http";

// Convert snake_case keys to camelCase (deep, handles arrays and nested objects)
function toCamel(obj: any): any {
  if (Array.isArray(obj)) return obj.map(toCamel);
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [
        k.replace(/_([a-z])/g, (_, c) => c.toUpperCase()),
        toCamel(v)
      ])
    );
  }
  return obj;
}

// ── Perplexity search helper (used for live regulatory data) ────────────────
function perplexitySearch(query: string): Promise<{ title: string; url: string; snippet: string; date?: string }[]> {
  return new Promise((resolve) => {
    const apiKey = process.env.PERPLEXITY_API_KEY || "";
    if (!apiKey) { resolve([]); return; }
    const body = JSON.stringify({
      model: "sonar",
      messages: [{ role: "user", content: `Search for recent news and updates: ${query}. Return the 5 most recent and relevant results with title, url, date, and a 2-3 sentence summary.` }],
      search_recency_filter: "month",
      return_citations: true,
    });
    const req = https.request({
      hostname: "api.perplexity.ai",
      path: "/chat/completions",
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}`, "Content-Length": Buffer.byteLength(body) },
    }, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          const citations: { url: string; title?: string }[] = parsed.citations || [];
          const content: string = parsed.choices?.[0]?.message?.content || "";
          // Return citations with content as snippet
          const results = citations.slice(0, 6).map((c, i) => ({
            title: c.title || `Source ${i + 1}`,
            url: c.url,
            snippet: content.length > 200 ? content.slice(0, 600) : content,
          }));
          resolve(results.length > 0 ? results : [{ title: "AI Summary", url: "", snippet: content }]);
        } catch { resolve([]); }
      });
    });
    req.on("error", () => resolve([]));
    req.write(body);
    req.end();
  });
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  // All projects with aggregate data
  app.get("/api/projects", (_req, res) => {
    const allProjects = storage.getAllProjects();
    const allBtm = storage.getAllBtmSources();
    const allLinks = storage.getAllProjectCompanies();
    const allCompanies = storage.getAllCompanies();

    const companyMap: Record<number, typeof allCompanies[0]> = {};
    for (const c of allCompanies) companyMap[c.id] = c;

    const result = allProjects.map((p) => {
      const btmSources = allBtm.filter((b) => b.projectId === p.id);
      const links = allLinks.filter((l) => l.projectId === p.id);
      const linkedCompanies = links.map((l) => ({
        ...companyMap[l.companyId],
        role: l.role,
      })).filter(Boolean);
      const operator = p.operatorId ? companyMap[p.operatorId] : null;

      return {
        ...p,
        operator,
        btmSources: btmSources.map((b) => ({
          ...b,
          vendor: b.vendorId ? companyMap[b.vendorId] : null,
          developer: b.developerId ? companyMap[b.developerId] : null,
          fuelSource: b.fuelSourceId ? companyMap[b.fuelSourceId] : null,
        })),
        linkedCompanies,
      };
    });

    res.json(result);
  });

  // Single project
  app.get("/api/projects/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const project = storage.getProjectById(id);
    if (!project) return res.status(404).json({ error: "Not found" });

    const allCompanies = storage.getAllCompanies();
    const companyMap: Record<number, typeof allCompanies[0]> = {};
    for (const c of allCompanies) companyMap[c.id] = c;

    const btmSources = storage.getBtmSourcesByProject(id).map((b) => ({
      ...b,
      vendor: b.vendorId ? companyMap[b.vendorId] : null,
      developer: b.developerId ? companyMap[b.developerId] : null,
      fuelSource: b.fuelSourceId ? companyMap[b.fuelSourceId] : null,
    }));

    const links = storage.getProjectCompaniesByProject(id);
    const linkedCompanies = links.map((l) => ({
      ...companyMap[l.companyId],
      role: l.role,
    })).filter(Boolean);

    res.json({
      ...project,
      operator: project.operatorId ? companyMap[project.operatorId] : null,
      btmSources,
      linkedCompanies,
    });
  });

  // All companies
  app.get("/api/companies", (_req, res) => {
    res.json(toCamel(rawDb.prepare("SELECT * FROM companies ORDER BY name").all()));
  });

  // Company detail with projects
  app.get("/api/companies/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const company = rawDb.prepare("SELECT * FROM companies WHERE id = ?").get(id) as any;
    if (!company) return res.status(404).json({ error: "Not found" });

    const allLinks = storage.getAllProjectCompanies();
    const allProjects = storage.getAllProjects();
    const projectIds = allLinks.filter((l) => l.companyId === id).map((l) => l.projectId);
    const operatedProjects = allProjects.filter((p) => p.operatorId === id);
    const linkedProjects = allProjects.filter((p) => projectIds.includes(p.id) && p.operatorId !== id);

    res.json(toCamel({ ...company, operatedProjects, linkedProjects }));
  });

  // Aggregate stats for dashboard
  app.get("/api/stats", (_req, res) => {
    const allProjects = storage.getAllProjects();
    const allBtm = storage.getAllBtmSources();

    const totalCapacityMw = allProjects.reduce((s, p) => s + (p.capacityMw ?? 0), 0);
    const totalBtmMw = allProjects.reduce((s, p) => s + (p.btmCapacityMw ?? 0), 0);
    const totalInvestmentB = allProjects.reduce((s, p) => s + (p.totalInvestmentB ?? 0), 0);
    const btmProjects = allProjects.filter((p) => p.hasBtm);
    const offGridProjects = allProjects.filter((p) => p.fullyOffGrid);

    // Tech type breakdown
    const techBreakdown: Record<string, number> = {};
    for (const b of allBtm) {
      techBreakdown[b.technologyType] = (techBreakdown[b.technologyType] ?? 0) + (b.capacityMw ?? 0);
    }

    // Origin country breakdown
    const originBreakdown: Record<string, number> = {};
    for (const b of allBtm) {
      if (b.originCountry) {
        originBreakdown[b.originCountry] = (originBreakdown[b.originCountry] ?? 0) + (b.capacityMw ?? 0);
      }
    }

    // Status breakdown
    const statusBreakdown: Record<string, number> = {};
    for (const p of allProjects) {
      statusBreakdown[p.status] = (statusBreakdown[p.status] ?? 0) + 1;
    }

    res.json({
      totalProjects: allProjects.length,
      totalCapacityMw,
      totalBtmMw,
      totalInvestmentB,
      btmProjectCount: btmProjects.length,
      offGridProjectCount: offGridProjects.length,
      techBreakdown,
      originBreakdown,
      statusBreakdown,
    });
  });

  // All competitors
  app.get("/api/competitors", (_req, res) => {
    const allCompetitors = rawDb.prepare("SELECT * FROM competitors ORDER BY id").all() as any[];
    const allNews = storage.getAllCompetitorNews();
    const result = allCompetitors.map((c) => toCamel({
      ...c,
      news_count: allNews.filter((n) => n.competitorId === c.id).length,
      latest_news: allNews
        .filter((n) => n.competitorId === c.id)
        .sort((a, b) => (b.publishedDate ?? "").localeCompare(a.publishedDate ?? ""))
        .slice(0, 1),
    }));
    res.json(result);
  });

  // Single competitor with full news
  app.get("/api/competitors/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const competitor = rawDb.prepare("SELECT * FROM competitors WHERE id = ?").get(id) as any;
    if (!competitor) return res.status(404).json({ error: "Not found" });
    const news = storage.getNewsByCompetitor(id).sort(
      (a, b) => (b.publishedDate ?? "").localeCompare(a.publishedDate ?? "")
    );
    res.json(toCamel({ ...competitor, news }));
  });

  // News for a competitor
  app.get("/api/competitors/:id/news", (req, res) => {
    const id = parseInt(req.params.id);
    const news = storage.getNewsByCompetitor(id).sort(
      (a, b) => (b.publishedDate ?? "").localeCompare(a.publishedDate ?? "")
    );
    res.json(news);
  });

  // ── Queue snapshots ────────────────────────────────────────────────
  app.get("/api/queue", (_req, res) => {
    // Get latest snapshot per RTO
    const snapshots = rawDb.prepare(`
      SELECT s.* FROM rto_queue_snapshots s
      INNER JOIN (
        SELECT rto_id, MAX(snapshot_date) as max_date
        FROM rto_queue_snapshots GROUP BY rto_id
      ) latest ON s.rto_id = latest.rto_id AND s.snapshot_date = latest.max_date
      ORDER BY s.total_queue_mw DESC
    `).all();
    // Also get all snapshots for trend lines
    const history = rawDb.prepare(`
      SELECT rto_id, snapshot_date, total_queue_mw, active_queue_mw, gas_mw, solar_mw, wind_mw, storage_mw, nuclear_mw
      FROM rto_queue_snapshots ORDER BY rto_id, snapshot_date
    `).all();
    res.json({ snapshots, history });
  });

  // Large load queue
  app.get("/api/queue/large-load", (_req, res) => {
    const snapshots = rawDb.prepare(`
      SELECT s.* FROM rto_large_load_queue s
      INNER JOIN (
        SELECT rto_id, MAX(snapshot_date) as max_date
        FROM rto_large_load_queue GROUP BY rto_id
      ) latest ON s.rto_id = latest.rto_id AND s.snapshot_date = latest.max_date
      ORDER BY COALESCE(s.total_request_mw, 0) DESC
    `).all();
    const history = rawDb.prepare(`
      SELECT rto_id, snapshot_date, total_request_mw, data_center_mw, actually_connected_mw, data_center_pct
      FROM rto_large_load_queue ORDER BY rto_id, snapshot_date
    `).all();
    res.json({ snapshots, history });
  });

  // ── Global Search ──────────────────────────────────────────────────────
  app.get("/api/search", (req, res) => {
    const q = ((req.query.q as string) || "").toLowerCase().trim();
    if (!q || q.length < 2) return res.json({ projects: [], companies: [], competitors: [], news: [] });

    const allProjects = storage.getAllProjects();
    const allCompanies = storage.getAllCompanies();
    const allCompetitors = storage.getAllCompetitors();
    const allNews = storage.getAllCompetitorNews();

    const projects = allProjects
      .filter((p) =>
        p.name.toLowerCase().includes(q) ||
        (p.location ?? "").toLowerCase().includes(q) ||
        (p.state ?? "").toLowerCase().includes(q) ||
        (p.notes ?? "").toLowerCase().includes(q)
      )
      .slice(0, 8)
      .map((p) => ({ id: p.id, name: p.name, location: p.location, state: p.state, status: p.status, capacityMw: p.capacityMw, type: "project" as const }));

    const companies = allCompanies
      .filter((c) =>
        c.name.toLowerCase().includes(q) ||
        (c.ticker ?? "").toLowerCase().includes(q) ||
        (c.hq ?? "").toLowerCase().includes(q) ||
        (c.description ?? "").toLowerCase().includes(q) ||
        (c.role ?? "").toLowerCase().includes(q)
      )
      .slice(0, 8)
      .map((c) => ({ id: c.id, name: c.name, ticker: c.ticker, hq: c.hq, role: c.role, type: "company" as const }));

    const competitors = allCompetitors
      .filter((c) =>
        c.name.toLowerCase().includes(q) ||
        (c.ticker ?? "").toLowerCase().includes(q) ||
        (c.hq ?? "").toLowerCase().includes(q) ||
        (c.description ?? "").toLowerCase().includes(q) ||
        (c.technology ?? "").toLowerCase().includes(q)
      )
      .slice(0, 5)
      .map((c) => ({ id: c.id, name: c.name, ticker: c.ticker, hq: c.hq, type: "competitor" as const }));

    const news = allNews
      .filter((n) =>
        n.headline.toLowerCase().includes(q) ||
        (n.summary ?? "").toLowerCase().includes(q)
      )
      .slice(0, 6)
      .map((n) => {
        const comp = allCompetitors.find((c) => c.id === n.competitorId);
        return { id: n.id, headline: n.headline, competitorId: n.competitorId, competitorName: comp?.name ?? "", publishedDate: n.publishedDate, category: n.category, type: "news" as const };
      });

    res.json({ projects, companies, competitors, news });
  });

  // ── Live Regulatory / RTO Status ───────────────────────────────────────────
  app.get("/api/regulatory", async (_req, res) => {
    // Static seed data with known status as of March 2026
    // The live news section is fetched client-side or can be refreshed
    const rtos = [
      {
        id: "ferc",
        name: "FERC",
        fullName: "Federal Energy Regulatory Commission",
        region: "National",
        status: "active",
        statusLabel: "Active Rulemaking",
        summary: "FERC is managing two parallel tracks: (1) the PJM-specific Dec 18, 2025 co-location order requiring tariff reform, and (2) DOE's Oct 2025 ANOPR directing FERC to establish national large-load interconnection standards by April 30, 2026. The PJM order established a 50 MW BTM netting threshold, three new co-location transmission services, and a 3-year transition period (expires Dec 18, 2028).",
        keyRulings: [
          { date: "2025-12-18", text: "Order 193 FERC ¶ 61,217 — PJM tariff unjust/unreasonable; directed to create co-location framework, 50 MW BTM threshold, 3 new TX services", url: "https://www.ferc.gov/news-events/news/ferc-directs-nations-largest-grid-operator-create-new-rules-embrace-innovation-and" },
          { date: "2025-10-23", text: "DOE ANOPR (RM26-4) — directs FERC to standardize large load (>20 MW) interconnection nationwide; final action deadline April 30, 2026", url: "https://www.ferc.gov/rm26-4" },
          { date: "2025-02-20", text: "FERC initiates show-cause proceeding on PJM co-location rules following 8.5 GW queue backlog", url: "https://www.ferc.gov/news-events/news/ferc-orders-action-co-location-issues-related-data-centers-running-ai" },
        ],
        nextMilestone: "April 30, 2026 — FERC final action deadline on national large-load interconnection ANOPR",
        btmOutlook: "Restrictive for large loads (>50 MW). BTM netting being phased out for data centers in PJM; national rules pending. Grandfathering protects pre-Dec 2025 contracts.",
        docketUrl: "https://www.ferc.gov/media/e-1-el25-49-000-0",
      },
      {
        id: "pjm",
        name: "PJM",
        fullName: "PJM Interconnection",
        region: "Mid-Atlantic / Midwest (13 states + DC)",
        status: "compliance",
        statusLabel: "Compliance Filing Under Review",
        summary: "PJM submitted its compliance filing on Feb 23, 2026 (Docket ER26-5181) implementing FERC's Dec 2025 order. Key changes: 50 MW BTM netting cap, emergency generation exemption from threshold, grandfathering for pre-Dec 18, 2025 contracts, three new transmission services (Interim NITS, Firm Contract Demand, Non-Firm Contract Demand). Effective date targeted July 31, 2026. PJM also proposed Expedited Interconnection Track (EIT) on Feb 27, 2026 — up to 10 projects/year, ~10-month timeline if approved.",
        keyRulings: [
          { date: "2026-02-23", text: "PJM compliance filing (ER26-5181) — 50 MW BTM cap, 3 new TX services, grandfathering, emergency gen exemption; target effective July 31, 2026", url: "https://www.datacenterdynamics.com/en/news/pjm-requests-approval-from-ferc-for-new-behind-the-meter-generation-rules-for-data-centers/" },
          { date: "2026-02-27", text: "PJM proposes Expedited Interconnection Track (EIT) — up to 10 projects/year, ~10-month timeline; FERC order requested by May 28, 2026", url: "https://www.whitecase.com/insight-alert/pjm-proposes-carve-out-new-services-co-located-data-centers" },
          { date: "2025-12-18", text: "FERC order finds PJM tariff unjust/unreasonable; 8.5 GW co-located load in queue; directs tariff overhaul", url: "https://www.ferc.gov/news-events/news/fact-sheet-ferc-directs-nations-largest-grid-operator-create-new-rules-embrace" },
        ],
        nextMilestone: "July 31, 2026 — targeted effective date for new BTM/co-location tariff; May 28, 2026 — FERC order requested on EIT",
        btmOutlook: "Transitional. New >50 MW BTM netting prohibited for data centers post-July 2026. Co-location permitted via 3 new TX service options. 8-year interconnection queue remains the key constraint. Expedited track could help new baseload gas projects.",
        docketUrl: "https://www.utilitydive.com/news/pjm-ferc-behind-the-meter-data-center-colocation/812939/",
      },
      {
        id: "miso",
        name: "MISO",
        fullName: "Midcontinent Independent System Operator",
        region: "Midwest / South (15 states + MB Canada)",
        status: "developing",
        statusLabel: "Framework Under Development",
        summary: "MISO is developing a 'zero-injection' agreement framework allowing dedicated generation for large loads to be barred from grid injection — effectively a structured BTM pathway. As of Jan 2026, stakeholders have raised questions about the proposal's mechanics. MISO has not yet issued a formal tariff filing. MISO's queue has undergone Order 2023 cluster-based reform. Indiana's NIPSCO GenCo model (Amazon, 2.4 GW) is a key MISO test case operating under a special utility structure.",
        keyRulings: [
          { date: "2026-01-22", text: "MISO presents 'zero-injection agreement' concept for large load dedicated generation; stakeholder questions remain on mechanics", url: "https://www.rtoinsider.com/123961-questions-abound-miso-idea-zero-injection-agreements/" },
          { date: "2025-09-10", text: "Indiana IURC approves NIPSCO GenCo model — first utility to create dedicated subsidiary for data center load isolation", url: "https://www.nisource.com/news/article/nisource-achieves-iurc-regulatory-approval-for-genco-strategy" },
        ],
        nextMilestone: "Zero-injection tariff filing — timing TBD; watching FERC ANOPR national rulemaking for guidance",
        btmOutlook: "Developing. No formal co-location tariff yet. Zero-injection concept favorable for BTM gas projects — would allow full BTM without netting restrictions. GenCo utility model is a working alternative. More permissive outlook than PJM for new BTM deployments.",
        docketUrl: "https://www.rtoinsider.com/123961-questions-abound-miso-idea-zero-injection-agreements/",
      },
      {
        id: "ercot",
        name: "ERCOT",
        fullName: "Electric Reliability Council of Texas",
        region: "Texas (85% of state)",
        status: "favorable",
        statusLabel: "Most Permissive — BTM Flourishing",
        summary: "ERCOT operates outside FERC jurisdiction, giving Texas the most permissive BTM environment in the U.S. No federal co-location rules apply. DOE issued a Section 202(c) order in Jan 2026 directing ERCOT to activate backup generation at data centers during grid emergencies — highlighting the scale of behind-the-meter assets already deployed. Williams Power, Atlas/Galt Power, Conduit Power, and Solaris are all actively deploying BTM in ERCOT. The majority of new BTM gas generation projects in the tracker are in Texas.",
        keyRulings: [
          { date: "2026-01-25", text: "DOE Section 202(c) order: ERCOT authorized to direct data center backup generation during grid emergencies (EEA-3 or near-EEA-3)", url: "https://www.ercot.com/services/comm/mkt_notices/M-A012526-01" },
          { date: "2025-01-01", text: "No FERC jurisdiction over ERCOT — BTM rules governed by PUCT and ERCOT protocols; co-location not subject to FERC orders", url: "https://www.ercot.com" },
        ],
        nextMilestone: "PUCT may issue large load integration guidance; DOE 202(c) order to be monitored for extension",
        btmOutlook: "Highly favorable. Fully permissive BTM environment. No federal netting restrictions. Fastest path to BTM gas deployment. Risk: PUCT could impose state-level co-location rules; grid strain during extreme weather events.",
        docketUrl: "https://www.ercot.com",
      },
      {
        id: "caiso",
        name: "CAISO",
        fullName: "California Independent System Operator",
        region: "California",
        status: "early",
        statusLabel: "Issue Paper Stage",
        summary: "CAISO published a large load consideration issue paper in Jan 2026, projecting 1.8 GW of incremental data center load by 2030 and 4.9 GW by 2040. The paper is in early stakeholder engagement phase with no formal tariff changes yet. California's strict environmental rules (CARB) make natural gas BTM more complex — permitting for new gas turbines is challenging. Nuclear and storage-coupled renewables are the preferred BTM technologies. CAISO is also expanding its Extended Day-Ahead Market (EDAM) with western neighbors.",
        keyRulings: [
          { date: "2026-01-20", text: "CAISO issue paper: Large Load Considerations published — 1.8 GW DC load projected by 2030, 4.9 GW by 2040; early stakeholder process initiated", url: "https://www.caiso.com/documents/issue-paper-large-load-consideration-jan-20-2026.pdf" },
        ],
        nextMilestone: "Stakeholder comment period and draft proposal expected mid-2026",
        btmOutlook: "Restrictive for gas BTM. CARB air quality rules make new gas turbine permits difficult. Storage + solar BTM more viable. Co-location with existing gas plants possible but complex. California is a minor market for BTM gas projects.",
        docketUrl: "https://www.caiso.com/documents/issue-paper-large-load-consideration-jan-20-2026.pdf",
      },
      {
        id: "spp",
        name: "SPP",
        fullName: "Southwest Power Pool",
        region: "Great Plains (14 states)",
        status: "monitoring",
        statusLabel: "Monitoring FERC ANOPR",
        summary: "SPP has not initiated a formal co-location or BTM proceeding as of Q1 2026. The region is watching FERC's national ANOPR (RM26-4) for guidance before acting independently. SPP has undergone Order 2023 queue reform. The region has significant wind generation and growing data center interest — particularly in Oklahoma, Kansas, and Nebraska. BTM gas + wind hybrid projects are emerging. Atlas Energy's Permian Basin assets are near the SPP/ERCOT border.",
        keyRulings: [
          { date: "2025-11-01", text: "SPP implementing FERC Order 2023 queue reforms — cluster-based study process replacing serial queue", url: "https://www.spp.org" },
        ],
        nextMilestone: "Awaiting FERC ANOPR final action (April 30, 2026) before initiating co-location framework",
        btmOutlook: "Neutral to slightly favorable. No BTM restrictions yet. Lower land/energy costs than PJM. Wind-rich region for hybrid projects. Natural gas BTM permissible under current rules — no active restriction proceedings.",
        docketUrl: "https://www.spp.org",
      },
      {
        id: "nyiso",
        name: "NYISO",
        fullName: "New York Independent System Operator",
        region: "New York State",
        status: "monitoring",
        statusLabel: "Monitoring PJM / FERC",
        summary: "NYISO has not filed a co-location proceeding as of Q1 2026. New York's Climate Leadership and Community Protection Act (CLCPA) mandates 70% renewable by 2030, creating significant constraints on new gas BTM projects. Co-location with existing gas plants is theoretically possible but faces state-level environmental review. Data center growth in the NYC metro area is driving grid stress. NYISO is watching FERC's PJM order as a potential template.",
        keyRulings: [
          { date: "2025-06-01", text: "NYISO large load interconnection process updated under Order 2023 reforms — cluster studies replacing serial queue", url: "https://www.nyiso.com" },
        ],
        nextMilestone: "Possible NYISO co-location framework proposal in H2 2026 following FERC national rulemaking",
        btmOutlook: "Restrictive. CLCPA constraints make gas BTM politically and legally difficult. Nuclear co-location (e.g., Constellation's upstate plants) is more viable. High electricity costs drive demand for BTM, but environmental rules limit gas options.",
        docketUrl: "https://www.nyiso.com",
      },
      {
        id: "isone",
        name: "ISO-NE",
        fullName: "ISO New England",
        region: "New England (6 states)",
        status: "monitoring",
        statusLabel: "Monitoring FERC ANOPR",
        summary: "ISO-NE has not initiated a formal co-location proceeding as of Q1 2026. New England faces some of the highest electricity prices in the continental U.S., creating strong BTM economics for data centers. However, regional environmental rules and limited gas pipeline capacity constrain new BTM gas projects. The region has significant nuclear assets (Millstone, Seabrook) that could support co-location. ISO-NE is monitoring the FERC ANOPR and PJM proceedings.",
        keyRulings: [
          { date: "2025-06-01", text: "ISO-NE completes Order 2023 queue reform transition — cluster-based interconnection studies now in effect", url: "https://www.iso-ne.com" },
        ],
        nextMilestone: "Following FERC ANOPR timeline; possible co-location issue paper in H2 2026",
        btmOutlook: "Mixed. High electricity prices make BTM economics compelling. Nuclear co-location viable. New gas BTM difficult due to pipeline constraints and state policies. Small market relative to PJM/MISO/ERCOT.",
        docketUrl: "https://www.iso-ne.com",
      },
    ];
    res.json(rtos);
  });

  // Live FERC/RTO news feed (fetches fresh results per query)
  app.get("/api/regulatory/news", async (req, res) => {
    const rtoId = (req.query.rto as string) || "ferc";
    const queries: Record<string, string> = {
      ferc: "FERC large load co-location data center rulemaking ANOPR 2026",
      pjm: "PJM behind the meter co-location data center tariff compliance 2026",
      miso: "MISO large load data center co-location zero injection agreement 2026",
      ercot: "ERCOT data center behind the meter generation BTM Texas 2026",
      caiso: "CAISO large load data center interconnection California 2026",
      spp: "SPP Southwest Power Pool data center large load interconnection 2026",
      nyiso: "NYISO New York data center large load co-location rules 2026",
      isone: "ISO-NE New England data center large load interconnection 2026",
    };
    const query = queries[rtoId] || queries.ferc;
    const results = await perplexitySearch(query);
    res.json(results);
  });

  // ── Midstream pipelines ────────────────────────────────────────────────────
  app.get("/api/midstream/pipelines", (_req, res) => {
    const pipelines = rawDb.prepare("SELECT * FROM midstream_pipelines ORDER BY is_interstate DESC, capacity_bcfd DESC").all();
    res.json(pipelines);
  });

  app.get("/api/midstream/pipelines/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const pipeline = rawDb.prepare("SELECT * FROM midstream_pipelines WHERE id = ?").get(id);
    if (!pipeline) return res.status(404).json({ error: "Not found" });
    const shippers = rawDb.prepare("SELECT * FROM midstream_shippers WHERE pipeline_id = ? ORDER BY mdq_dth_d DESC").all(id);
    const signals = rawDb.prepare("SELECT * FROM midstream_signals WHERE pipeline_id = ? ORDER BY date DESC").all(id);
    res.json({ ...pipeline, shippers, signals });
  });

  app.get("/api/midstream/signals", (_req, res) => {
    const signals = rawDb.prepare(`
      SELECT s.*, p.name as pipeline_name, p.operator as pipeline_operator
      FROM midstream_signals s
      LEFT JOIN midstream_pipelines p ON s.pipeline_id = p.id
      ORDER BY s.urgency DESC, s.date DESC
    `).all();
    res.json(signals);
  });

// ── NEWS ARTICLES — served from DB seed ────────────────────────────────────
  app.get("/api/news", (req, res) => {
    const tab = req.query.tab as string | undefined;
    const limit = parseInt((req.query.limit as string) || "200", 10);
    let query = "SELECT * FROM news_articles";
    const params: any[] = [];
    if (tab) {
      query += " WHERE tab = ?";
      params.push(tab);
    }
    query += " ORDER BY published_date DESC LIMIT ?";
    params.push(limit);
    const articles = rawDb.prepare(query).all(...params);
    res.json(articles);
  });

// ── FINANCING ROUTES — paste into server/routes.ts before the `return httpServer;` line ──

  // ── Financing deals ──────────────────────────────────────────────────────
  app.get("/api/financing/deals", (_req, res) => {
    const deals = rawDb.prepare("SELECT * FROM financing_deals ORDER BY amount_mm DESC").all();
    res.json(deals);
  });

  // ── Financing lenders ────────────────────────────────────────────────────
  app.get("/api/financing/lenders", (_req, res) => {
    const lenders = rawDb.prepare("SELECT * FROM financing_lenders ORDER BY sort_order ASC").all();
    res.json(lenders);
  });

  // ── Lender activity / league table ──────────────────────────────────────
  app.get("/api/financing/activity", (_req, res) => {
    const activity = rawDb.prepare("SELECT * FROM lender_activity ORDER BY lender_id, year DESC").all();
    res.json(activity);
  });

  // ── Single lender with deals ──────────────────────────────────────────────
  app.get("/api/financing/lenders/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const lender = rawDb.prepare("SELECT * FROM financing_lenders WHERE id = ?").get(id);
    if (!lender) return res.status(404).json({ error: "Not found" });
    const activity = rawDb.prepare("SELECT * FROM lender_activity WHERE lender_id = ?").all(id);
    res.json({ ...lender, activity });
  });

  // ── Financing stats (for market overview) ──────────────────────────────
  app.get("/api/financing/stats", (_req, res) => {
    const totals = rawDb.prepare(`
      SELECT
        SUM(amount_mm) / 1000.0 as total_tracked_bn,
        COUNT(*) as deal_count,
        SUM(CASE WHEN btm_specific = 1 THEN 1 ELSE 0 END) as btm_deal_count,
        SUM(CASE WHEN btm_specific = 1 THEN amount_mm ELSE 0 END) / 1000.0 as btm_volume_bn,
        MAX(amount_mm) as largest_deal_mm
      FROM financing_deals
    `).get() as any;

    const largestDeal = rawDb.prepare(
      "SELECT project_name FROM financing_deals ORDER BY amount_mm DESC LIMIT 1"
    ).get() as any;

    res.json({
      ...totals,
      largest_deal_name: largestDeal?.project_name ?? "—",
    });
  });

  return httpServer;
}
