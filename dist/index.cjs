"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// vite.config.ts
var import_vite, import_plugin_react, import_path3, import_meta, vite_config_default;
var init_vite_config = __esm({
  "vite.config.ts"() {
    "use strict";
    import_vite = require("vite");
    import_plugin_react = __toESM(require("@vitejs/plugin-react"), 1);
    import_path3 = __toESM(require("path"), 1);
    import_meta = {};
    vite_config_default = (0, import_vite.defineConfig)({
      plugins: [(0, import_plugin_react.default)()],
      resolve: {
        alias: {
          "@": import_path3.default.resolve(import_meta.dirname, "client", "src"),
          "@shared": import_path3.default.resolve(import_meta.dirname, "shared"),
          "@assets": import_path3.default.resolve(import_meta.dirname, "attached_assets")
        }
      },
      root: import_path3.default.resolve(import_meta.dirname, "client"),
      base: "./",
      build: {
        outDir: import_path3.default.resolve(import_meta.dirname, "dist/public"),
        emptyOutDir: true,
        rollupOptions: {
          output: {
            entryFileNames: `assets/[name]-[hash]-v3.js`,
            chunkFileNames: `assets/[name]-[hash]-v3.js`,
            assetFileNames: `assets/[name]-[hash]-v3.[ext]`
          }
        }
      },
      server: {
        fs: {
          strict: true,
          deny: ["**/.*"]
        }
      }
    });
  }
});

// server/vite.ts
var vite_exports = {};
__export(vite_exports, {
  setupVite: () => setupVite
});
async function setupVite(server, app2) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server, path: "/vite-hmr" },
    allowedHosts: true
  };
  const vite = await (0, import_vite2.createServer)({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("/{*path}", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = import_path4.default.resolve(
        import_meta2.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await import_fs2.default.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${(0, import_nanoid.nanoid)()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
var import_vite2, import_fs2, import_path4, import_nanoid, import_meta2, viteLogger;
var init_vite = __esm({
  "server/vite.ts"() {
    "use strict";
    import_vite2 = require("vite");
    init_vite_config();
    import_fs2 = __toESM(require("fs"), 1);
    import_path4 = __toESM(require("path"), 1);
    import_nanoid = require("nanoid");
    import_meta2 = {};
    viteLogger = (0, import_vite2.createLogger)();
  }
});

// server/index.ts
var index_exports = {};
__export(index_exports, {
  log: () => log
});
module.exports = __toCommonJS(index_exports);
var import_express3 = __toESM(require("express"), 1);

// server/db.ts
var import_better_sqlite3 = __toESM(require("better-sqlite3"), 1);
var import_better_sqlite32 = require("drizzle-orm/better-sqlite3");

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  btmSources: () => btmSources,
  companies: () => companies,
  competitorNews: () => competitorNews,
  competitors: () => competitors,
  insertBtmSourceSchema: () => insertBtmSourceSchema,
  insertCompanySchema: () => insertCompanySchema,
  insertCompetitorNewsSchema: () => insertCompetitorNewsSchema,
  insertCompetitorSchema: () => insertCompetitorSchema,
  insertProjectCompanySchema: () => insertProjectCompanySchema,
  insertProjectSchema: () => insertProjectSchema,
  projectCompanies: () => projectCompanies,
  projects: () => projects
});
var import_sqlite_core = require("drizzle-orm/sqlite-core");
var import_drizzle_zod = require("drizzle-zod");
var companies = (0, import_sqlite_core.sqliteTable)("companies", {
  id: (0, import_sqlite_core.integer)("id").primaryKey({ autoIncrement: true }),
  name: (0, import_sqlite_core.text)("name").notNull(),
  ticker: (0, import_sqlite_core.text)("ticker"),
  role: (0, import_sqlite_core.text)("role").notNull(),
  // 'hyperscaler' | 'dc_operator' | 'btm_developer' | 'tech_vendor' | 'fuel_supplier' | 'investor'
  hq: (0, import_sqlite_core.text)("hq"),
  country: (0, import_sqlite_core.text)("country"),
  website: (0, import_sqlite_core.text)("website"),
  description: (0, import_sqlite_core.text)("description"),
  logoInitials: (0, import_sqlite_core.text)("logo_initials"),
  // Financial data (public companies only)
  stockPrice: (0, import_sqlite_core.real)("stock_price"),
  marketCapB: (0, import_sqlite_core.real)("market_cap_b"),
  revenueTtmB: (0, import_sqlite_core.real)("revenue_ttm_b"),
  ebitdaTtmB: (0, import_sqlite_core.real)("ebitda_ttm_b"),
  netIncomeTtmB: (0, import_sqlite_core.real)("net_income_ttm_b"),
  fcfTtmB: (0, import_sqlite_core.real)("fcf_ttm_b"),
  peRatio: (0, import_sqlite_core.real)("pe_ratio"),
  finsUpdatedDate: (0, import_sqlite_core.text)("fins_updated_date")
});
var insertCompanySchema = (0, import_drizzle_zod.createInsertSchema)(companies).omit({ id: true });
var projects = (0, import_sqlite_core.sqliteTable)("projects", {
  id: (0, import_sqlite_core.integer)("id").primaryKey({ autoIncrement: true }),
  name: (0, import_sqlite_core.text)("name").notNull(),
  operatorId: (0, import_sqlite_core.integer)("operator_id"),
  // FK to companies
  location: (0, import_sqlite_core.text)("location").notNull(),
  // city/county, state
  state: (0, import_sqlite_core.text)("state"),
  country: (0, import_sqlite_core.text)("country").default("USA"),
  capacityMw: (0, import_sqlite_core.real)("capacity_mw"),
  // total IT load MW
  status: (0, import_sqlite_core.text)("status").notNull(),
  // 'announced' | 'under_construction' | 'operational' | 'planned'
  announcedDate: (0, import_sqlite_core.text)("announced_date"),
  totalInvestmentB: (0, import_sqlite_core.real)("total_investment_b"),
  // billions USD
  hasBtm: (0, import_sqlite_core.integer)("has_btm").default(0),
  // boolean
  btmCapacityMw: (0, import_sqlite_core.real)("btm_capacity_mw"),
  gridTied: (0, import_sqlite_core.integer)("grid_tied").default(1),
  // boolean
  fullyOffGrid: (0, import_sqlite_core.integer)("fully_off_grid").default(0),
  // boolean
  notes: (0, import_sqlite_core.text)("notes"),
  sourceUrl: (0, import_sqlite_core.text)("source_url"),
  lat: (0, import_sqlite_core.real)("lat"),
  lng: (0, import_sqlite_core.real)("lng")
});
var insertProjectSchema = (0, import_drizzle_zod.createInsertSchema)(projects).omit({ id: true });
var btmSources = (0, import_sqlite_core.sqliteTable)("btm_sources", {
  id: (0, import_sqlite_core.integer)("id").primaryKey({ autoIncrement: true }),
  projectId: (0, import_sqlite_core.integer)("project_id").notNull(),
  technologyType: (0, import_sqlite_core.text)("technology_type").notNull(),
  // 'gas_turbine' | 'recip_engine' | 'fuel_cell' | 'solar' | 'battery' | 'nuclear_smr' | 'nuclear_existing' | 'wind' | 'diesel'
  capacityMw: (0, import_sqlite_core.real)("capacity_mw"),
  vendorId: (0, import_sqlite_core.integer)("vendor_id"),
  // FK to companies (tech vendor)
  developerId: (0, import_sqlite_core.integer)("developer_id"),
  // FK to companies (BTM developer/operator)
  fuelType: (0, import_sqlite_core.text)("fuel_type"),
  // 'natural_gas' | 'hydrogen' | 'nuclear' | 'solar' | 'wind' | 'diesel'
  fuelSourceId: (0, import_sqlite_core.integer)("fuel_source_id"),
  // FK to companies (fuel supplier)
  productModel: (0, import_sqlite_core.text)("product_model"),
  // e.g. "LM2500+G4", "J624", "SureSource 4000"
  originCountry: (0, import_sqlite_core.text)("origin_country"),
  // where technology is manufactured
  notes: (0, import_sqlite_core.text)("notes")
});
var insertBtmSourceSchema = (0, import_drizzle_zod.createInsertSchema)(btmSources).omit({ id: true });
var projectCompanies = (0, import_sqlite_core.sqliteTable)("project_companies", {
  id: (0, import_sqlite_core.integer)("id").primaryKey({ autoIncrement: true }),
  projectId: (0, import_sqlite_core.integer)("project_id").notNull(),
  companyId: (0, import_sqlite_core.integer)("company_id").notNull(),
  role: (0, import_sqlite_core.text)("role").notNull()
  // 'customer' | 'investor' | 'epc' | 'fuel_supplier' | 'operator' | 'partner'
});
var insertProjectCompanySchema = (0, import_drizzle_zod.createInsertSchema)(projectCompanies).omit({ id: true });
var competitors = (0, import_sqlite_core.sqliteTable)("competitors", {
  id: (0, import_sqlite_core.integer)("id").primaryKey({ autoIncrement: true }),
  name: (0, import_sqlite_core.text)("name").notNull(),
  ticker: (0, import_sqlite_core.text)("ticker"),
  hq: (0, import_sqlite_core.text)("hq"),
  country: (0, import_sqlite_core.text)("country").default("USA"),
  website: (0, import_sqlite_core.text)("website"),
  description: (0, import_sqlite_core.text)("description"),
  technology: (0, import_sqlite_core.text)("technology"),
  // equipment / platform description
  keyDeals: (0, import_sqlite_core.text)("key_deals"),
  // major DC deals / projects summary
  capacityDeployedMw: (0, import_sqlite_core.integer)("capacity_deployed_mw"),
  capacityPipelineMw: (0, import_sqlite_core.integer)("capacity_pipeline_mw"),
  logoInitials: (0, import_sqlite_core.text)("logo_initials"),
  isPublic: (0, import_sqlite_core.integer)("is_public"),
  // 0 = private, 1 = public
  // Financial data (public competitors only)
  stockPrice: (0, import_sqlite_core.real)("stock_price"),
  marketCapB: (0, import_sqlite_core.real)("market_cap_b"),
  revenueTtmM: (0, import_sqlite_core.real)("revenue_ttm_m"),
  ebitdaTtmM: (0, import_sqlite_core.real)("ebitda_ttm_m"),
  netIncomeTtmM: (0, import_sqlite_core.real)("net_income_ttm_m"),
  fcfTtmM: (0, import_sqlite_core.real)("fcf_ttm_m"),
  peRatio: (0, import_sqlite_core.real)("pe_ratio"),
  yearLow: (0, import_sqlite_core.real)("year_low"),
  yearHigh: (0, import_sqlite_core.real)("year_high"),
  finsUpdatedDate: (0, import_sqlite_core.text)("fins_updated_date")
});
var insertCompetitorSchema = (0, import_drizzle_zod.createInsertSchema)(competitors).omit({ id: true });
var competitorNews = (0, import_sqlite_core.sqliteTable)("competitor_news", {
  id: (0, import_sqlite_core.integer)("id").primaryKey({ autoIncrement: true }),
  competitorId: (0, import_sqlite_core.integer)("competitor_id").notNull(),
  headline: (0, import_sqlite_core.text)("headline").notNull(),
  summary: (0, import_sqlite_core.text)("summary"),
  url: (0, import_sqlite_core.text)("url"),
  publishedDate: (0, import_sqlite_core.text)("published_date"),
  category: (0, import_sqlite_core.text)("category")
  // 'deal' | 'product' | 'partnership' | 'funding' | 'expansion' | 'regulatory' | 'other'
});
var insertCompetitorNewsSchema = (0, import_drizzle_zod.createInsertSchema)(competitorNews).omit({ id: true });

// server/db.ts
var import_path = __toESM(require("path"), 1);
var dbPath = import_path.default.resolve(process.cwd(), "data.db");
var sqlite = new import_better_sqlite3.default(dbPath);
sqlite.pragma("journal_mode = WAL");
var db = (0, import_better_sqlite32.drizzle)(sqlite, { schema: schema_exports });
var rawDb = sqlite;

// server/storage.ts
var import_drizzle_orm = require("drizzle-orm");
var SqliteStorage = class {
  getAllCompanies() {
    return db.select().from(companies).all();
  }
  getCompanyById(id) {
    return db.select().from(companies).where((0, import_drizzle_orm.eq)(companies.id, id)).get();
  }
  upsertCompany(data) {
    return db.insert(companies).values(data).returning().get();
  }
  getAllProjects() {
    return db.select().from(projects).all();
  }
  getProjectById(id) {
    return db.select().from(projects).where((0, import_drizzle_orm.eq)(projects.id, id)).get();
  }
  upsertProject(data) {
    return db.insert(projects).values(data).returning().get();
  }
  getBtmSourcesByProject(projectId) {
    return db.select().from(btmSources).where((0, import_drizzle_orm.eq)(btmSources.projectId, projectId)).all();
  }
  getAllBtmSources() {
    return db.select().from(btmSources).all();
  }
  getProjectCompaniesByProject(projectId) {
    return db.select().from(projectCompanies).where((0, import_drizzle_orm.eq)(projectCompanies.projectId, projectId)).all();
  }
  getAllProjectCompanies() {
    return db.select().from(projectCompanies).all();
  }
  getAllCompetitors() {
    return db.select().from(competitors).all();
  }
  getCompetitorById(id) {
    return db.select().from(competitors).where((0, import_drizzle_orm.eq)(competitors.id, id)).get();
  }
  getNewsByCompetitor(competitorId) {
    return db.select().from(competitorNews).where((0, import_drizzle_orm.eq)(competitorNews.competitorId, competitorId)).all();
  }
  getAllCompetitorNews() {
    return db.select().from(competitorNews).all();
  }
};
var storage = new SqliteStorage();

// server/routes.ts
var import_https = __toESM(require("https"), 1);
function toCamel(obj) {
  if (Array.isArray(obj)) return obj.map(toCamel);
  if (obj !== null && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [
        k.replace(/_([a-z])/g, (_, c) => c.toUpperCase()),
        toCamel(v)
      ])
    );
  }
  return obj;
}
function perplexitySearch(query) {
  return new Promise((resolve) => {
    const apiKey = process.env.PERPLEXITY_API_KEY || "";
    if (!apiKey) {
      resolve([]);
      return;
    }
    const body = JSON.stringify({
      model: "sonar",
      messages: [{ role: "user", content: `Search for recent news and updates: ${query}. Return the 5 most recent and relevant results with title, url, date, and a 2-3 sentence summary.` }],
      search_recency_filter: "month",
      return_citations: true
    });
    const req = import_https.default.request({
      hostname: "api.perplexity.ai",
      path: "/chat/completions",
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}`, "Content-Length": Buffer.byteLength(body) }
    }, (res) => {
      let data = "";
      res.on("data", (c) => data += c);
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          const citations = parsed.citations || [];
          const content = parsed.choices?.[0]?.message?.content || "";
          const results = citations.slice(0, 6).map((c, i) => ({
            title: c.title || `Source ${i + 1}`,
            url: c.url,
            snippet: content.length > 200 ? content.slice(0, 600) : content
          }));
          resolve(results.length > 0 ? results : [{ title: "AI Summary", url: "", snippet: content }]);
        } catch {
          resolve([]);
        }
      });
    });
    req.on("error", () => resolve([]));
    req.write(body);
    req.end();
  });
}
async function registerRoutes(httpServer2, app2) {
  app2.get("/api/projects", (_req, res) => {
    const allProjects = storage.getAllProjects();
    const allBtm = storage.getAllBtmSources();
    const allLinks = storage.getAllProjectCompanies();
    const allCompanies = storage.getAllCompanies();
    const companyMap = {};
    for (const c of allCompanies) companyMap[c.id] = c;
    const result = allProjects.map((p) => {
      const btmSources2 = allBtm.filter((b) => b.projectId === p.id);
      const links = allLinks.filter((l) => l.projectId === p.id);
      const linkedCompanies = links.map((l) => ({
        ...companyMap[l.companyId],
        role: l.role
      })).filter(Boolean);
      const operator = p.operatorId ? companyMap[p.operatorId] : null;
      return {
        ...p,
        operator,
        btmSources: btmSources2.map((b) => ({
          ...b,
          vendor: b.vendorId ? companyMap[b.vendorId] : null,
          developer: b.developerId ? companyMap[b.developerId] : null,
          fuelSource: b.fuelSourceId ? companyMap[b.fuelSourceId] : null
        })),
        linkedCompanies
      };
    });
    res.json(result);
  });
  app2.get("/api/projects/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const project = storage.getProjectById(id);
    if (!project) return res.status(404).json({ error: "Not found" });
    const allCompanies = storage.getAllCompanies();
    const companyMap = {};
    for (const c of allCompanies) companyMap[c.id] = c;
    const btmSources2 = storage.getBtmSourcesByProject(id).map((b) => ({
      ...b,
      vendor: b.vendorId ? companyMap[b.vendorId] : null,
      developer: b.developerId ? companyMap[b.developerId] : null,
      fuelSource: b.fuelSourceId ? companyMap[b.fuelSourceId] : null
    }));
    const links = storage.getProjectCompaniesByProject(id);
    const linkedCompanies = links.map((l) => ({
      ...companyMap[l.companyId],
      role: l.role
    })).filter(Boolean);
    res.json({
      ...project,
      operator: project.operatorId ? companyMap[project.operatorId] : null,
      btmSources: btmSources2,
      linkedCompanies
    });
  });
  app2.get("/api/companies", (_req, res) => {
    res.json(toCamel(rawDb.prepare("SELECT * FROM companies ORDER BY name").all()));
  });
  app2.get("/api/companies/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const company = rawDb.prepare("SELECT * FROM companies WHERE id = ?").get(id);
    if (!company) return res.status(404).json({ error: "Not found" });
    const allLinks = storage.getAllProjectCompanies();
    const allProjects = storage.getAllProjects();
    const projectIds = allLinks.filter((l) => l.companyId === id).map((l) => l.projectId);
    const operatedProjects = allProjects.filter((p) => p.operatorId === id);
    const linkedProjects = allProjects.filter((p) => projectIds.includes(p.id) && p.operatorId !== id);
    res.json(toCamel({ ...company, operatedProjects, linkedProjects }));
  });
  app2.get("/api/stats", (_req, res) => {
    const allProjects = storage.getAllProjects();
    const allBtm = storage.getAllBtmSources();
    const totalCapacityMw = allProjects.reduce((s, p) => s + (p.capacityMw ?? 0), 0);
    const totalBtmMw = allProjects.reduce((s, p) => s + (p.btmCapacityMw ?? 0), 0);
    const totalInvestmentB = allProjects.reduce((s, p) => s + (p.totalInvestmentB ?? 0), 0);
    const btmProjects = allProjects.filter((p) => p.hasBtm);
    const offGridProjects = allProjects.filter((p) => p.fullyOffGrid);
    const techBreakdown = {};
    for (const b of allBtm) {
      techBreakdown[b.technologyType] = (techBreakdown[b.technologyType] ?? 0) + (b.capacityMw ?? 0);
    }
    const originBreakdown = {};
    for (const b of allBtm) {
      if (b.originCountry) {
        originBreakdown[b.originCountry] = (originBreakdown[b.originCountry] ?? 0) + (b.capacityMw ?? 0);
      }
    }
    const statusBreakdown = {};
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
      statusBreakdown
    });
  });
  app2.get("/api/competitors", (_req, res) => {
    const allCompetitors = rawDb.prepare("SELECT * FROM competitors ORDER BY id").all();
    const allNews = storage.getAllCompetitorNews();
    const result = allCompetitors.map((c) => toCamel({
      ...c,
      news_count: allNews.filter((n) => n.competitorId === c.id).length,
      latest_news: allNews.filter((n) => n.competitorId === c.id).sort((a, b) => (b.publishedDate ?? "").localeCompare(a.publishedDate ?? "")).slice(0, 1)
    }));
    res.json(result);
  });
  app2.get("/api/competitors/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const competitor = rawDb.prepare("SELECT * FROM competitors WHERE id = ?").get(id);
    if (!competitor) return res.status(404).json({ error: "Not found" });
    const news = storage.getNewsByCompetitor(id).sort(
      (a, b) => (b.publishedDate ?? "").localeCompare(a.publishedDate ?? "")
    );
    res.json(toCamel({ ...competitor, news }));
  });
  app2.get("/api/competitors/:id/news", (req, res) => {
    const id = parseInt(req.params.id);
    const news = storage.getNewsByCompetitor(id).sort(
      (a, b) => (b.publishedDate ?? "").localeCompare(a.publishedDate ?? "")
    );
    res.json(news);
  });
  app2.get("/api/queue", (_req, res) => {
    const snapshots = rawDb.prepare(`
      SELECT s.* FROM rto_queue_snapshots s
      INNER JOIN (
        SELECT rto_id, MAX(snapshot_date) as max_date
        FROM rto_queue_snapshots GROUP BY rto_id
      ) latest ON s.rto_id = latest.rto_id AND s.snapshot_date = latest.max_date
      ORDER BY s.total_queue_mw DESC
    `).all();
    const history = rawDb.prepare(`
      SELECT rto_id, snapshot_date, total_queue_mw, active_queue_mw, gas_mw, solar_mw, wind_mw, storage_mw, nuclear_mw
      FROM rto_queue_snapshots ORDER BY rto_id, snapshot_date
    `).all();
    res.json({ snapshots, history });
  });
  app2.get("/api/queue/large-load", (_req, res) => {
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
  app2.get("/api/search", (req, res) => {
    const q = (req.query.q || "").toLowerCase().trim();
    if (!q || q.length < 2) return res.json({ projects: [], companies: [], competitors: [], news: [] });
    const allProjects = storage.getAllProjects();
    const allCompanies = storage.getAllCompanies();
    const allCompetitors = storage.getAllCompetitors();
    const allNews = storage.getAllCompetitorNews();
    const projects2 = allProjects.filter(
      (p) => p.name.toLowerCase().includes(q) || (p.location ?? "").toLowerCase().includes(q) || (p.state ?? "").toLowerCase().includes(q) || (p.notes ?? "").toLowerCase().includes(q)
    ).slice(0, 8).map((p) => ({ id: p.id, name: p.name, location: p.location, state: p.state, status: p.status, capacityMw: p.capacityMw, type: "project" }));
    const companies2 = allCompanies.filter(
      (c) => c.name.toLowerCase().includes(q) || (c.ticker ?? "").toLowerCase().includes(q) || (c.hq ?? "").toLowerCase().includes(q) || (c.description ?? "").toLowerCase().includes(q) || (c.role ?? "").toLowerCase().includes(q)
    ).slice(0, 8).map((c) => ({ id: c.id, name: c.name, ticker: c.ticker, hq: c.hq, role: c.role, type: "company" }));
    const competitors2 = allCompetitors.filter(
      (c) => c.name.toLowerCase().includes(q) || (c.ticker ?? "").toLowerCase().includes(q) || (c.hq ?? "").toLowerCase().includes(q) || (c.description ?? "").toLowerCase().includes(q) || (c.technology ?? "").toLowerCase().includes(q)
    ).slice(0, 5).map((c) => ({ id: c.id, name: c.name, ticker: c.ticker, hq: c.hq, type: "competitor" }));
    const news = allNews.filter(
      (n) => n.headline.toLowerCase().includes(q) || (n.summary ?? "").toLowerCase().includes(q)
    ).slice(0, 6).map((n) => {
      const comp = allCompetitors.find((c) => c.id === n.competitorId);
      return { id: n.id, headline: n.headline, competitorId: n.competitorId, competitorName: comp?.name ?? "", publishedDate: n.publishedDate, category: n.category, type: "news" };
    });
    res.json({ projects: projects2, companies: companies2, competitors: competitors2, news });
  });
  app2.get("/api/regulatory", async (_req, res) => {
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
          { date: "2025-12-18", text: "Order 193 FERC \xB6 61,217 \u2014 PJM tariff unjust/unreasonable; directed to create co-location framework, 50 MW BTM threshold, 3 new TX services", url: "https://www.ferc.gov/news-events/news/ferc-directs-nations-largest-grid-operator-create-new-rules-embrace-innovation-and" },
          { date: "2025-10-23", text: "DOE ANOPR (RM26-4) \u2014 directs FERC to standardize large load (>20 MW) interconnection nationwide; final action deadline April 30, 2026", url: "https://www.ferc.gov/rm26-4" },
          { date: "2025-02-20", text: "FERC initiates show-cause proceeding on PJM co-location rules following 8.5 GW queue backlog", url: "https://www.ferc.gov/news-events/news/ferc-orders-action-co-location-issues-related-data-centers-running-ai" }
        ],
        nextMilestone: "April 30, 2026 \u2014 FERC final action deadline on national large-load interconnection ANOPR",
        btmOutlook: "Restrictive for large loads (>50 MW). BTM netting being phased out for data centers in PJM; national rules pending. Grandfathering protects pre-Dec 2025 contracts.",
        docketUrl: "https://www.ferc.gov/media/e-1-el25-49-000-0"
      },
      {
        id: "pjm",
        name: "PJM",
        fullName: "PJM Interconnection",
        region: "Mid-Atlantic / Midwest (13 states + DC)",
        status: "compliance",
        statusLabel: "Compliance Filing Under Review",
        summary: "PJM submitted its compliance filing on Feb 23, 2026 (Docket ER26-5181) implementing FERC's Dec 2025 order. Key changes: 50 MW BTM netting cap, emergency generation exemption from threshold, grandfathering for pre-Dec 18, 2025 contracts, three new transmission services (Interim NITS, Firm Contract Demand, Non-Firm Contract Demand). Effective date targeted July 31, 2026. PJM also proposed Expedited Interconnection Track (EIT) on Feb 27, 2026 \u2014 up to 10 projects/year, ~10-month timeline if approved.",
        keyRulings: [
          { date: "2026-02-23", text: "PJM compliance filing (ER26-5181) \u2014 50 MW BTM cap, 3 new TX services, grandfathering, emergency gen exemption; target effective July 31, 2026", url: "https://www.datacenterdynamics.com/en/news/pjm-requests-approval-from-ferc-for-new-behind-the-meter-generation-rules-for-data-centers/" },
          { date: "2026-02-27", text: "PJM proposes Expedited Interconnection Track (EIT) \u2014 up to 10 projects/year, ~10-month timeline; FERC order requested by May 28, 2026", url: "https://www.whitecase.com/insight-alert/pjm-proposes-carve-out-new-services-co-located-data-centers" },
          { date: "2025-12-18", text: "FERC order finds PJM tariff unjust/unreasonable; 8.5 GW co-located load in queue; directs tariff overhaul", url: "https://www.ferc.gov/news-events/news/fact-sheet-ferc-directs-nations-largest-grid-operator-create-new-rules-embrace" }
        ],
        nextMilestone: "July 31, 2026 \u2014 targeted effective date for new BTM/co-location tariff; May 28, 2026 \u2014 FERC order requested on EIT",
        btmOutlook: "Transitional. New >50 MW BTM netting prohibited for data centers post-July 2026. Co-location permitted via 3 new TX service options. 8-year interconnection queue remains the key constraint. Expedited track could help new baseload gas projects.",
        docketUrl: "https://www.utilitydive.com/news/pjm-ferc-behind-the-meter-data-center-colocation/812939/"
      },
      {
        id: "miso",
        name: "MISO",
        fullName: "Midcontinent Independent System Operator",
        region: "Midwest / South (15 states + MB Canada)",
        status: "developing",
        statusLabel: "Framework Under Development",
        summary: "MISO is developing a 'zero-injection' agreement framework allowing dedicated generation for large loads to be barred from grid injection \u2014 effectively a structured BTM pathway. As of Jan 2026, stakeholders have raised questions about the proposal's mechanics. MISO has not yet issued a formal tariff filing. MISO's queue has undergone Order 2023 cluster-based reform. Indiana's NIPSCO GenCo model (Amazon, 2.4 GW) is a key MISO test case operating under a special utility structure.",
        keyRulings: [
          { date: "2026-01-22", text: "MISO presents 'zero-injection agreement' concept for large load dedicated generation; stakeholder questions remain on mechanics", url: "https://www.rtoinsider.com/123961-questions-abound-miso-idea-zero-injection-agreements/" },
          { date: "2025-09-10", text: "Indiana IURC approves NIPSCO GenCo model \u2014 first utility to create dedicated subsidiary for data center load isolation", url: "https://www.nisource.com/news/article/nisource-achieves-iurc-regulatory-approval-for-genco-strategy" }
        ],
        nextMilestone: "Zero-injection tariff filing \u2014 timing TBD; watching FERC ANOPR national rulemaking for guidance",
        btmOutlook: "Developing. No formal co-location tariff yet. Zero-injection concept favorable for BTM gas projects \u2014 would allow full BTM without netting restrictions. GenCo utility model is a working alternative. More permissive outlook than PJM for new BTM deployments.",
        docketUrl: "https://www.rtoinsider.com/123961-questions-abound-miso-idea-zero-injection-agreements/"
      },
      {
        id: "ercot",
        name: "ERCOT",
        fullName: "Electric Reliability Council of Texas",
        region: "Texas (85% of state)",
        status: "favorable",
        statusLabel: "Most Permissive \u2014 BTM Flourishing",
        summary: "ERCOT operates outside FERC jurisdiction, giving Texas the most permissive BTM environment in the U.S. No federal co-location rules apply. DOE issued a Section 202(c) order in Jan 2026 directing ERCOT to activate backup generation at data centers during grid emergencies \u2014 highlighting the scale of behind-the-meter assets already deployed. Williams Power, Atlas/Galt Power, Conduit Power, and Solaris are all actively deploying BTM in ERCOT. The majority of new BTM gas generation projects in the tracker are in Texas.",
        keyRulings: [
          { date: "2026-01-25", text: "DOE Section 202(c) order: ERCOT authorized to direct data center backup generation during grid emergencies (EEA-3 or near-EEA-3)", url: "https://www.ercot.com/services/comm/mkt_notices/M-A012526-01" },
          { date: "2025-01-01", text: "No FERC jurisdiction over ERCOT \u2014 BTM rules governed by PUCT and ERCOT protocols; co-location not subject to FERC orders", url: "https://www.ercot.com" }
        ],
        nextMilestone: "PUCT may issue large load integration guidance; DOE 202(c) order to be monitored for extension",
        btmOutlook: "Highly favorable. Fully permissive BTM environment. No federal netting restrictions. Fastest path to BTM gas deployment. Risk: PUCT could impose state-level co-location rules; grid strain during extreme weather events.",
        docketUrl: "https://www.ercot.com"
      },
      {
        id: "caiso",
        name: "CAISO",
        fullName: "California Independent System Operator",
        region: "California",
        status: "early",
        statusLabel: "Issue Paper Stage",
        summary: "CAISO published a large load consideration issue paper in Jan 2026, projecting 1.8 GW of incremental data center load by 2030 and 4.9 GW by 2040. The paper is in early stakeholder engagement phase with no formal tariff changes yet. California's strict environmental rules (CARB) make natural gas BTM more complex \u2014 permitting for new gas turbines is challenging. Nuclear and storage-coupled renewables are the preferred BTM technologies. CAISO is also expanding its Extended Day-Ahead Market (EDAM) with western neighbors.",
        keyRulings: [
          { date: "2026-01-20", text: "CAISO issue paper: Large Load Considerations published \u2014 1.8 GW DC load projected by 2030, 4.9 GW by 2040; early stakeholder process initiated", url: "https://www.caiso.com/documents/issue-paper-large-load-consideration-jan-20-2026.pdf" }
        ],
        nextMilestone: "Stakeholder comment period and draft proposal expected mid-2026",
        btmOutlook: "Restrictive for gas BTM. CARB air quality rules make new gas turbine permits difficult. Storage + solar BTM more viable. Co-location with existing gas plants possible but complex. California is a minor market for BTM gas projects.",
        docketUrl: "https://www.caiso.com/documents/issue-paper-large-load-consideration-jan-20-2026.pdf"
      },
      {
        id: "spp",
        name: "SPP",
        fullName: "Southwest Power Pool",
        region: "Great Plains (14 states)",
        status: "monitoring",
        statusLabel: "Monitoring FERC ANOPR",
        summary: "SPP has not initiated a formal co-location or BTM proceeding as of Q1 2026. The region is watching FERC's national ANOPR (RM26-4) for guidance before acting independently. SPP has undergone Order 2023 queue reform. The region has significant wind generation and growing data center interest \u2014 particularly in Oklahoma, Kansas, and Nebraska. BTM gas + wind hybrid projects are emerging. Atlas Energy's Permian Basin assets are near the SPP/ERCOT border.",
        keyRulings: [
          { date: "2025-11-01", text: "SPP implementing FERC Order 2023 queue reforms \u2014 cluster-based study process replacing serial queue", url: "https://www.spp.org" }
        ],
        nextMilestone: "Awaiting FERC ANOPR final action (April 30, 2026) before initiating co-location framework",
        btmOutlook: "Neutral to slightly favorable. No BTM restrictions yet. Lower land/energy costs than PJM. Wind-rich region for hybrid projects. Natural gas BTM permissible under current rules \u2014 no active restriction proceedings.",
        docketUrl: "https://www.spp.org"
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
          { date: "2025-06-01", text: "NYISO large load interconnection process updated under Order 2023 reforms \u2014 cluster studies replacing serial queue", url: "https://www.nyiso.com" }
        ],
        nextMilestone: "Possible NYISO co-location framework proposal in H2 2026 following FERC national rulemaking",
        btmOutlook: "Restrictive. CLCPA constraints make gas BTM politically and legally difficult. Nuclear co-location (e.g., Constellation's upstate plants) is more viable. High electricity costs drive demand for BTM, but environmental rules limit gas options.",
        docketUrl: "https://www.nyiso.com"
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
          { date: "2025-06-01", text: "ISO-NE completes Order 2023 queue reform transition \u2014 cluster-based interconnection studies now in effect", url: "https://www.iso-ne.com" }
        ],
        nextMilestone: "Following FERC ANOPR timeline; possible co-location issue paper in H2 2026",
        btmOutlook: "Mixed. High electricity prices make BTM economics compelling. Nuclear co-location viable. New gas BTM difficult due to pipeline constraints and state policies. Small market relative to PJM/MISO/ERCOT.",
        docketUrl: "https://www.iso-ne.com"
      }
    ];
    res.json(rtos);
  });
  app2.get("/api/regulatory/news", async (req, res) => {
    const rtoId = req.query.rto || "ferc";
    const queries = {
      ferc: "FERC large load co-location data center rulemaking ANOPR 2026",
      pjm: "PJM behind the meter co-location data center tariff compliance 2026",
      miso: "MISO large load data center co-location zero injection agreement 2026",
      ercot: "ERCOT data center behind the meter generation BTM Texas 2026",
      caiso: "CAISO large load data center interconnection California 2026",
      spp: "SPP Southwest Power Pool data center large load interconnection 2026",
      nyiso: "NYISO New York data center large load co-location rules 2026",
      isone: "ISO-NE New England data center large load interconnection 2026"
    };
    const query = queries[rtoId] || queries.ferc;
    const results = await perplexitySearch(query);
    res.json(results);
  });
  app2.get("/api/midstream/pipelines", (_req, res) => {
    const pipelines = rawDb.prepare("SELECT * FROM midstream_pipelines ORDER BY is_interstate DESC, capacity_bcfd DESC").all();
    res.json(pipelines);
  });
  app2.get("/api/midstream/pipelines/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const pipeline = rawDb.prepare("SELECT * FROM midstream_pipelines WHERE id = ?").get(id);
    if (!pipeline) return res.status(404).json({ error: "Not found" });
    const shippers = rawDb.prepare("SELECT * FROM midstream_shippers WHERE pipeline_id = ? ORDER BY mdq_dth_d DESC").all(id);
    const signals = rawDb.prepare("SELECT * FROM midstream_signals WHERE pipeline_id = ? ORDER BY date DESC").all(id);
    res.json({ ...pipeline, shippers, signals });
  });
  app2.get("/api/midstream/signals", (_req, res) => {
    const signals = rawDb.prepare(`
      SELECT s.*, p.name as pipeline_name, p.operator as pipeline_operator
      FROM midstream_signals s
      LEFT JOIN midstream_pipelines p ON s.pipeline_id = p.id
      ORDER BY s.urgency DESC, s.date DESC
    `).all();
    res.json(signals);
  });
  app2.get("/api/news", (req, res) => {
    const tab = req.query.tab;
    const limit = parseInt(req.query.limit || "200", 10);
    let query = "SELECT * FROM news_articles";
    const params = [];
    if (tab) {
      query += " WHERE tab = ?";
      params.push(tab);
    }
    query += " ORDER BY published_date DESC LIMIT ?";
    params.push(limit);
    const articles = rawDb.prepare(query).all(...params);
    res.json(articles);
  });
  app2.get("/api/financing/deals", (_req, res) => {
    const deals = rawDb.prepare("SELECT * FROM financing_deals ORDER BY amount_mm DESC").all();
    res.json(deals);
  });
  app2.get("/api/financing/lenders", (_req, res) => {
    const lenders = rawDb.prepare("SELECT * FROM financing_lenders ORDER BY sort_order ASC").all();
    res.json(lenders);
  });
  app2.get("/api/financing/activity", (_req, res) => {
    const activity = rawDb.prepare("SELECT * FROM lender_activity ORDER BY lender_id, year DESC").all();
    res.json(activity);
  });
  app2.get("/api/financing/lenders/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const lender = rawDb.prepare("SELECT * FROM financing_lenders WHERE id = ?").get(id);
    if (!lender) return res.status(404).json({ error: "Not found" });
    const activity = rawDb.prepare("SELECT * FROM lender_activity WHERE lender_id = ?").all(id);
    res.json({ ...lender, activity });
  });
  app2.get("/api/financing/stats", (_req, res) => {
    const totals = rawDb.prepare(`
      SELECT
        SUM(amount_mm) / 1000.0 as total_tracked_bn,
        COUNT(*) as deal_count,
        SUM(CASE WHEN btm_specific = 1 THEN 1 ELSE 0 END) as btm_deal_count,
        SUM(CASE WHEN btm_specific = 1 THEN amount_mm ELSE 0 END) / 1000.0 as btm_volume_bn,
        MAX(amount_mm) as largest_deal_mm
      FROM financing_deals
    `).get();
    const largestDeal = rawDb.prepare(
      "SELECT project_name FROM financing_deals ORDER BY amount_mm DESC LIMIT 1"
    ).get();
    res.json({
      ...totals,
      largest_deal_name: largestDeal?.project_name ?? "\u2014"
    });
  });
  return httpServer2;
}

// server/static.ts
var import_express = __toESM(require("express"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_path2 = __toESM(require("path"), 1);
function serveStatic(app2) {
  const distPath = import_path2.default.resolve(__dirname, "public");
  if (!import_fs.default.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(import_express.default.static(distPath));
  app2.use("/{*path}", (_req, res) => {
    res.sendFile(import_path2.default.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var import_http = require("http");

// server/seed.ts
function seedDatabase() {
  const existingCompanies = db.select().from(companies).all();
  if (existingCompanies.length > 0) return;
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
    { name: "Siemens Energy", ticker: "ENR", role: "tech_vendor", hq: "Munich", country: "Germany", website: "siemens-energy.com", description: "Gas turbines for Stargate Do\xF1a Ana NM campus. Grid-independent microgrid turbines.", logoInitials: "SE" },
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
    { name: "Engie", role: "fuel_supplier", hq: "La D\xE9fense", country: "France", website: "engie.com", description: "Energy utility. Partner with Prometheus Hyperscale on Wyoming 1.2 GW campus.", logoInitials: "EN" }
  ];
  const insertedCompanies = {};
  for (const c of companyData) {
    const result = db.insert(companies).values(c).returning().get();
    insertedCompanies[c.name] = result.id;
  }
  const projectData = [
    {
      name: "Project Stargate \u2013 Texas (Shackleford County)",
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
      sourceUrl: "https://voltagrid.com/voltagrid-collaborates-with-oracle-to-power-next-gen-ai-data-centers"
    },
    {
      name: "Project Stargate \u2013 New Mexico (Do\xF1a Ana County)",
      operatorId: insertedCompanies["Oracle"],
      location: "Do\xF1a Ana County, NM",
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
      sourceUrl: "https://www.latitudemedia.com/news/behind-the-meter-generation-is-picking-up-traction/"
    },
    {
      name: "Joule BetterGrid Campus \u2013 Utah",
      operatorId: insertedCompanies["Joule Capital Partners"],
      location: "Millard County, UT",
      state: "UT",
      capacityMw: 2e3,
      status: "under_construction",
      announcedDate: "2025-10-01",
      totalInvestmentB: 3,
      hasBtm: 1,
      btmCapacityMw: 1700,
      gridTied: 0,
      fullyOffGrid: 1,
      notes: "1.7 GW Caterpillar G3520K generator sets on firm order. N+2 BTM design. 4,000 acres, 10,000 acre-ft water rights, direct gas interconnect. Fully islanded from Rocky Mountain Power.",
      sourceUrl: "https://thedatacenterengineer.com/news/joule-announces-bettergrid-platform-for-high-density-ai-data-centers-in-utah/"
    },
    {
      name: "Vantage Data Centers \u2013 BTM Gas Portfolio",
      operatorId: insertedCompanies["Vantage Data Centers"],
      location: "Multiple, USA",
      state: "USA",
      capacityMw: 500,
      status: "under_construction",
      announcedDate: "2025-04-01",
      totalInvestmentB: 1.5,
      hasBtm: 1,
      btmCapacityMw: 1e3,
      gridTied: 1,
      fullyOffGrid: 0,
      notes: "VoltaGrid deploying 1+ GW of gas power solutions. Hybrid BTM + grid.",
      sourceUrl: "https://www.latitudemedia.com/news/behind-the-meter-generation-is-picking-up-traction/"
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
      sourceUrl: "https://enkiai.com/data-center/top-10-2025-fuel-cell-projects-for-ai-data-centers"
    },
    {
      name: "Brookfield\u2013Bloom Energy AI Data Center Program",
      operatorId: insertedCompanies["Brookfield Asset Management"],
      location: "Multiple, USA",
      state: "USA",
      capacityMw: 2e3,
      status: "announced",
      announcedDate: "2025-10-13",
      totalInvestmentB: 5,
      hasBtm: 1,
      btmCapacityMw: 2e3,
      gridTied: 0,
      fullyOffGrid: 1,
      notes: "$5B framework to deploy Bloom Energy SOFCs at AI data centers. Avoids grid connection delays. 'BTM power is essential to closing the grid gap for AI factories' - Brookfield AI Infrastructure Head.",
      sourceUrl: "https://www.spglobal.com/market-intelligence/en/news-insights/articles/2025/10/data-center-developers-turn-to-distributed-behind-the-meter-power-94174247"
    },
    {
      name: "Fermi America \u2013 Project Matador",
      operatorId: insertedCompanies["Fermi America"],
      location: "USA (undisclosed)",
      state: "USA",
      capacityMw: 15e3,
      status: "announced",
      announcedDate: "2025-09-01",
      totalInvestmentB: 50,
      hasBtm: 1,
      btmCapacityMw: 11e3,
      gridTied: 0,
      fullyOffGrid: 1,
      notes: "Up to 11 GW BTM energy, 15M sq ft AI hyperscale compute by 2038. Public filing describes multi-phased BTM-first architecture.",
      sourceUrl: "https://www.latitudemedia.com/news/behind-the-meter-generation-is-picking-up-traction/"
    },
    {
      name: "Prometheus Hyperscale \u2013 Wyoming Campus",
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
      sourceUrl: "https://www.latitudemedia.com/news/behind-the-meter-generation-is-picking-up-traction/"
    },
    {
      name: "Microsoft \u2013 Crane Clean Energy Center (TMI Restart)",
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
      sourceUrl: "https://introl.com/blog/nuclear-power-ai-data-centers-microsoft-google-amazon-2025"
    },
    {
      name: "Google \u2013 Kairos Power SMR Program",
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
      sourceUrl: "https://introl.com/blog/nuclear-power-ai-data-centers-microsoft-google-amazon-2025"
    },
    {
      name: "Amazon \u2013 Cascade Advanced Energy Facility",
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
      sourceUrl: "https://introl.com/blog/nuclear-power-ai-data-centers-microsoft-google-amazon-2025"
    },
    {
      name: "Meta \u2013 400 MW Dedicated Gas Generation",
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
      sourceUrl: "https://avanzaenergy.substack.com/p/data-centers-are-killing-the-grid"
    },
    {
      name: "FO Permian \u2013 5 GW Texas Off-Grid Gas",
      operatorId: insertedCompanies["FO Permian Partners / Hivolt Energy"],
      location: "Permian Basin, TX",
      state: "TX",
      capacityMw: 5e3,
      status: "announced",
      announcedDate: "2025-08-01",
      totalInvestmentB: 10,
      hasBtm: 1,
      btmCapacityMw: 5e3,
      gridTied: 0,
      fullyOffGrid: 1,
      notes: "5 GW fully off-grid gas power solution for Texas data centers in the Permian Basin.",
      sourceUrl: "https://www.latitudemedia.com/news/behind-the-meter-generation-is-picking-up-traction/"
    },
    {
      name: "CoreWeave \u2013 Bloom Energy SOFC Deployment",
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
      sourceUrl: "https://enkiai.com/data-center/top-10-2025-fuel-cell-projects-for-ai-data-centers"
    },
    {
      name: "AEP \u2013 1 GW Bloom SOFC BTM Program",
      operatorId: insertedCompanies["American Electric Power"],
      location: "Multiple, USA",
      state: "USA",
      capacityMw: 1e3,
      status: "announced",
      announcedDate: "2025-06-01",
      totalInvestmentB: 2,
      hasBtm: 1,
      btmCapacityMw: 1e3,
      gridTied: 1,
      fullyOffGrid: 0,
      notes: "AEP procuring up to 1 GW of Bloom Energy SOFCs for behind-the-meter power for utility data center customers.",
      sourceUrl: "https://enkiai.com/data-center/top-10-2025-fuel-cell-projects-for-ai-data-centers"
    },
    {
      name: "International Electric Power \u2013 PA Gas Plant",
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
      sourceUrl: "https://www.latitudemedia.com/news/behind-the-meter-generation-is-picking-up-traction/"
    }
  ];
  const insertedProjects = {};
  for (const p of projectData) {
    const result = db.insert(projects).values(p).returning().get();
    insertedProjects[p.name] = result.id;
  }
  const btmData = [
    // Stargate Texas – 2 BTM techs
    { projectId: insertedProjects["Project Stargate \u2013 Texas (Shackleford County)"], technologyType: "recip_engine", capacityMw: 1500, vendorId: insertedCompanies["INNIO Jenbacher"], developerId: insertedCompanies["VoltaGrid"], fuelType: "natural_gas", fuelSourceId: insertedCompanies["Energy Transfer"], productModel: "Jenbacher J620/J624 (Qpac Platform)", originCountry: "Austria", notes: "Qpac modular platform, up to 20 MW per unit, 200 MW per minor-source air permit. AI-optimized high-transient-response. ABB power electronics." },
    { projectId: insertedProjects["Project Stargate \u2013 Texas (Shackleford County)"], technologyType: "gas_turbine", capacityMw: 800, vendorId: insertedCompanies["GE Vernova"], developerId: insertedCompanies["VoltaGrid"], fuelType: "natural_gas", fuelSourceId: insertedCompanies["Energy Transfer"], productModel: "GE LM2500+G4 (aeroderivative, stackable)", originCountry: "USA", notes: "29 stackable aeroderivative turbines delivering ~1 GW. Fast deployment, scalable footprint." },
    // Stargate NM
    { projectId: insertedProjects["Project Stargate \u2013 New Mexico (Do\xF1a Ana County)"], technologyType: "gas_turbine", capacityMw: 400, vendorId: insertedCompanies["Siemens Energy"], developerId: null, fuelType: "natural_gas", fuelSourceId: null, productModel: "Siemens SGT industrial gas turbine", originCountry: "Germany", notes: "BTM microgrid, fully independent from local grid." },
    { projectId: insertedProjects["Project Stargate \u2013 New Mexico (Do\xF1a Ana County)"], technologyType: "gas_turbine", capacityMw: 200, vendorId: insertedCompanies["GE Vernova"], developerId: null, fuelType: "natural_gas", fuelSourceId: null, productModel: "GE aeroderivative turbine", originCountry: "USA", notes: "Combined with Siemens turbines for NM campus BTM microgrid." },
    // Joule Utah
    { projectId: insertedProjects["Joule BetterGrid Campus \u2013 Utah"], technologyType: "recip_engine", capacityMw: 1700, vendorId: insertedCompanies["Caterpillar"], developerId: insertedCompanies["Joule Capital Partners"], fuelType: "natural_gas", fuelSourceId: null, productModel: "Caterpillar G3520K (2.5 MW/unit)", originCountry: "USA", notes: "1.7 GW firm order. First delivery March 2025. N+2 redundancy. BetterGrid platform includes SCR units and BESS." },
    // Vantage
    { projectId: insertedProjects["Vantage Data Centers \u2013 BTM Gas Portfolio"], technologyType: "recip_engine", capacityMw: 1e3, vendorId: insertedCompanies["INNIO Jenbacher"], developerId: insertedCompanies["VoltaGrid"], fuelType: "natural_gas", fuelSourceId: null, productModel: "VoltaGrid Qpac (Jenbacher engines)", originCountry: "Austria", notes: "VoltaGrid deploying 1+ GW across Vantage portfolio." },
    // Equinix
    { projectId: insertedProjects["Equinix IBX Fuel Cell Program"], technologyType: "fuel_cell", capacityMw: 100, vendorId: insertedCompanies["Bloom Energy"], developerId: null, fuelType: "natural_gas", fuelSourceId: null, productModel: "Bloom Energy SureSource 4000 (SOFC)", originCountry: "USA", notes: "Primary power across 19 IBX data centers. 60-65% efficiency. 100 MW per acre stacked density." },
    // Brookfield–Bloom
    { projectId: insertedProjects["Brookfield\u2013Bloom Energy AI Data Center Program"], technologyType: "fuel_cell", capacityMw: 2e3, vendorId: insertedCompanies["Bloom Energy"], developerId: insertedCompanies["Brookfield Asset Management"], fuelType: "natural_gas", fuelSourceId: null, productModel: "Bloom Energy SureSource (SOFC)", originCountry: "USA", notes: "$5B framework. Grid-independent. 'Closing the grid gap for AI factories'." },
    // CoreWeave
    { projectId: insertedProjects["CoreWeave \u2013 Bloom Energy SOFC Deployment"], technologyType: "fuel_cell", capacityMw: 14, vendorId: insertedCompanies["Bloom Energy"], developerId: null, fuelType: "natural_gas", fuelSourceId: null, productModel: "Bloom Energy SureSource (SOFC)", originCountry: "USA", notes: "Rapid deployment for AI cloud infrastructure." },
    // AEP
    { projectId: insertedProjects["AEP \u2013 1 GW Bloom SOFC BTM Program"], technologyType: "fuel_cell", capacityMw: 1e3, vendorId: insertedCompanies["Bloom Energy"], developerId: insertedCompanies["American Electric Power"], fuelType: "natural_gas", fuelSourceId: null, productModel: "Bloom Energy SureSource (SOFC)", originCountry: "USA", notes: "Utility-procured BTM fuel cells for data center customers." },
    // Meta gas
    { projectId: insertedProjects["Meta \u2013 400 MW Dedicated Gas Generation"], technologyType: "gas_turbine", capacityMw: 400, vendorId: null, developerId: insertedCompanies["Meta"], fuelType: "natural_gas", fuelSourceId: null, productModel: "Industrial gas turbine (vendor TBD)", originCountry: "USA", notes: "Never touches the grid. Dedicated generation for Meta AI campuses." },
    // Fermi
    { projectId: insertedProjects["Fermi America \u2013 Project Matador"], technologyType: "recip_engine", capacityMw: 6e3, vendorId: null, developerId: insertedCompanies["Fermi America"], fuelType: "natural_gas", fuelSourceId: null, productModel: "TBD \u2013 multiple vendor RFPs", originCountry: "USA", notes: "Multi-phased BTM-first architecture through 2038." },
    { projectId: insertedProjects["Fermi America \u2013 Project Matador"], technologyType: "gas_turbine", capacityMw: 5e3, vendorId: null, developerId: insertedCompanies["Fermi America"], fuelType: "natural_gas", fuelSourceId: null, productModel: "TBD \u2013 multiple vendor RFPs", originCountry: "USA", notes: "Mix of recip engines and turbines expected." },
    // Prometheus
    { projectId: insertedProjects["Prometheus Hyperscale \u2013 Wyoming Campus"], technologyType: "gas_turbine", capacityMw: 900, vendorId: null, developerId: insertedCompanies["Conduit Power"], fuelType: "natural_gas", fuelSourceId: null, productModel: "Gas turbines (vendor TBD)", originCountry: "USA", notes: "Onsite gas-fired BTM generation with Engie." },
    { projectId: insertedProjects["Prometheus Hyperscale \u2013 Wyoming Campus"], technologyType: "battery", capacityMw: 300, vendorId: null, developerId: insertedCompanies["Conduit Power"], fuelType: "solar", fuelSourceId: null, productModel: "BESS (vendor TBD)", originCountry: "USA", notes: "Battery storage at Texas Engie sites." },
    { projectId: insertedProjects["Prometheus Hyperscale \u2013 Wyoming Campus"], technologyType: "nuclear_smr", capacityMw: 300, vendorId: insertedCompanies["Oklo"], developerId: null, fuelType: "nuclear", fuelSourceId: null, productModel: "Oklo Aurora microreactor", originCountry: "USA", notes: "Future BTM integration planned. Not yet contracted." },
    // TMI / Microsoft
    { projectId: insertedProjects["Microsoft \u2013 Crane Clean Energy Center (TMI Restart)"], technologyType: "nuclear_existing", capacityMw: 835, vendorId: insertedCompanies["Constellation Energy"], developerId: insertedCompanies["Microsoft"], fuelType: "nuclear", fuelSourceId: insertedCompanies["Constellation Energy"], productModel: "Three Mile Island Unit 1 (PWR)", originCountry: "USA", notes: "Existing pressurized water reactor restart. 20-year PPA. Crane Clean Energy Center." },
    // Google SMR
    { projectId: insertedProjects["Google \u2013 Kairos Power SMR Program"], technologyType: "nuclear_smr", capacityMw: 500, vendorId: insertedCompanies["Kairos Power"], developerId: insertedCompanies["Google"], fuelType: "nuclear", fuelSourceId: null, productModel: "Kairos Hermes 2 (molten salt SMR, ~70 MW/unit)", originCountry: "USA", notes: "6-7 reactors. TVA offtake agreement. First-of-kind US corporate SMR fleet." },
    // Amazon SMR
    { projectId: insertedProjects["Amazon \u2013 Cascade Advanced Energy Facility"], technologyType: "nuclear_smr", capacityMw: 960, vendorId: insertedCompanies["X-energy"], developerId: insertedCompanies["Amazon Web Services"], fuelType: "nuclear", fuelSourceId: null, productModel: "X-energy Xe-100 (HTGR, 80 MW/unit)", originCountry: "USA", notes: "Up to 12 modules. TRISO fuel, physically cannot melt. Start 4 units \u2192 scale to 12." },
    // IEP PA
    { projectId: insertedProjects["International Electric Power \u2013 PA Gas Plant"], technologyType: "gas_turbine", capacityMw: 800, vendorId: null, developerId: insertedCompanies["International Electric Power"], fuelType: "natural_gas", fuelSourceId: null, productModel: "Combined cycle gas plant", originCountry: "USA", notes: "944 MW total, combined cycle with BESS. Avoids PJM interconnection." },
    { projectId: insertedProjects["International Electric Power \u2013 PA Gas Plant"], technologyType: "battery", capacityMw: 144, vendorId: null, developerId: insertedCompanies["International Electric Power"], fuelType: "solar", fuelSourceId: null, productModel: "Grid-scale BESS", originCountry: "USA", notes: "Battery storage for load management alongside gas plant." },
    // FO Permian
    { projectId: insertedProjects["FO Permian \u2013 5 GW Texas Off-Grid Gas"], technologyType: "gas_turbine", capacityMw: 3e3, vendorId: null, developerId: insertedCompanies["FO Permian Partners / Hivolt Energy"], fuelType: "natural_gas", fuelSourceId: null, productModel: "Industrial gas turbines (multiple vendors)", originCountry: "USA", notes: "Permian Basin off-grid. Multiple turbine vendors expected." },
    { projectId: insertedProjects["FO Permian \u2013 5 GW Texas Off-Grid Gas"], technologyType: "recip_engine", capacityMw: 2e3, vendorId: null, developerId: insertedCompanies["FO Permian Partners / Hivolt Energy"], fuelType: "natural_gas", fuelSourceId: null, productModel: "Reciprocating engines (multiple vendors)", originCountry: "USA", notes: "Mix of turbines and recip engines for 5 GW total." }
  ];
  for (const b of btmData) {
    db.insert(btmSources).values(b).run();
  }
  const links = [
    { projectId: insertedProjects["Project Stargate \u2013 Texas (Shackleford County)"], companyId: insertedCompanies["OpenAI"], role: "customer" },
    { projectId: insertedProjects["Project Stargate \u2013 Texas (Shackleford County)"], companyId: insertedCompanies["VoltaGrid"], role: "btm_developer" },
    { projectId: insertedProjects["Project Stargate \u2013 Texas (Shackleford County)"], companyId: insertedCompanies["Energy Transfer"], role: "fuel_supplier" },
    { projectId: insertedProjects["Project Stargate \u2013 Texas (Shackleford County)"], companyId: insertedCompanies["GE Vernova"], role: "tech_vendor" },
    { projectId: insertedProjects["Project Stargate \u2013 Texas (Shackleford County)"], companyId: insertedCompanies["INNIO Jenbacher"], role: "tech_vendor" },
    { projectId: insertedProjects["Project Stargate \u2013 Texas (Shackleford County)"], companyId: insertedCompanies["ABB"], role: "tech_vendor" },
    { projectId: insertedProjects["Project Stargate \u2013 New Mexico (Do\xF1a Ana County)"], companyId: insertedCompanies["OpenAI"], role: "customer" },
    { projectId: insertedProjects["Project Stargate \u2013 New Mexico (Do\xF1a Ana County)"], companyId: insertedCompanies["GE Vernova"], role: "tech_vendor" },
    { projectId: insertedProjects["Project Stargate \u2013 New Mexico (Do\xF1a Ana County)"], companyId: insertedCompanies["Siemens Energy"], role: "tech_vendor" },
    { projectId: insertedProjects["Joule BetterGrid Campus \u2013 Utah"], companyId: insertedCompanies["Caterpillar"], role: "tech_vendor" },
    { projectId: insertedProjects["Vantage Data Centers \u2013 BTM Gas Portfolio"], companyId: insertedCompanies["VoltaGrid"], role: "btm_developer" },
    { projectId: insertedProjects["Vantage Data Centers \u2013 BTM Gas Portfolio"], companyId: insertedCompanies["INNIO Jenbacher"], role: "tech_vendor" },
    { projectId: insertedProjects["Equinix IBX Fuel Cell Program"], companyId: insertedCompanies["Bloom Energy"], role: "tech_vendor" },
    { projectId: insertedProjects["Brookfield\u2013Bloom Energy AI Data Center Program"], companyId: insertedCompanies["Bloom Energy"], role: "tech_vendor" },
    { projectId: insertedProjects["AEP \u2013 1 GW Bloom SOFC BTM Program"], companyId: insertedCompanies["Bloom Energy"], role: "tech_vendor" },
    { projectId: insertedProjects["CoreWeave \u2013 Bloom Energy SOFC Deployment"], companyId: insertedCompanies["Bloom Energy"], role: "tech_vendor" },
    { projectId: insertedProjects["Microsoft \u2013 Crane Clean Energy Center (TMI Restart)"], companyId: insertedCompanies["Constellation Energy"], role: "fuel_supplier" },
    { projectId: insertedProjects["Google \u2013 Kairos Power SMR Program"], companyId: insertedCompanies["Kairos Power"], role: "tech_vendor" },
    { projectId: insertedProjects["Amazon \u2013 Cascade Advanced Energy Facility"], companyId: insertedCompanies["X-energy"], role: "tech_vendor" },
    { projectId: insertedProjects["Prometheus Hyperscale \u2013 Wyoming Campus"], companyId: insertedCompanies["Engie"], role: "partner" },
    { projectId: insertedProjects["Prometheus Hyperscale \u2013 Wyoming Campus"], companyId: insertedCompanies["Conduit Power"], role: "btm_developer" },
    { projectId: insertedProjects["Prometheus Hyperscale \u2013 Wyoming Campus"], companyId: insertedCompanies["Oklo"], role: "tech_vendor" }
  ];
  for (const l of links) {
    db.insert(projectCompanies).values(l).run();
  }
  console.log("\u2705 Database seeded with DC Intel data");
}

// server/seed_v2.ts
function seedDatabaseV2() {
  const existingProjects = db.select().from(projects).all();
  const hasV2 = existingProjects.some((p) => p.name === "SoftBank / SB Energy \u2013 Piketon AI Campus (Ohio)");
  if (hasV2) return;
  const allCompanies = db.select().from(companies).all();
  const cmap = {};
  for (const c of allCompanies) cmap[c.name] = c.id;
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
    { name: "TPG", ticker: "TPG", role: "investor", hq: "Fort Worth, TX", country: "USA", website: "tpg.com", description: "Private equity firm. Partner with Google and Intersect Power in $20B 'powered land' program for AI data centers with co-located renewable generation.", logoInitials: "TP" }
  ];
  const newCmap = {};
  for (const c of newCompanyData) {
    const result = db.insert(companies).values(c).returning().get();
    newCmap[c.name] = result.id;
  }
  const fullCmap = { ...cmap, ...newCmap };
  const newProjectData = [
    {
      name: "SoftBank / SB Energy \u2013 Piketon AI Campus (Ohio)",
      operatorId: fullCmap["SB Energy (SoftBank)"],
      location: "Piketon, OH (Portsmouth DOE Site)",
      state: "OH",
      country: "USA",
      capacityMw: 1e4,
      status: "announced",
      announcedDate: "2026-03-20",
      totalInvestmentB: 43.3,
      hasBtm: 1,
      btmCapacityMw: 9200,
      gridTied: 1,
      fullyOffGrid: 0,
      notes: "Announced March 20, 2026 at former Portsmouth Gaseous Diffusion Plant (now PORTS Technology Campus). $33.3B dedicated 9.2 GW natural gas plant + $10B initial 800 MW data center (scaling to 10 GW). AEP Ohio partnership for $4.2B transmission upgrades. Part of US-Japan Strategic Investment agreement. SB Energy leads.",
      sourceUrl: "https://www.statenews.org/government-politics/2026-03-20/feds-announce-huge-natural-gas-plant-data-center-project-in-southern-ohio"
    },
    {
      name: "NextEra \u2013 Anderson County TX Gas Hub (SoftBank-linked)",
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
      sourceUrl: "https://www.utilitydive.com/news/nextera-gas-generation-doe-softbank-texas-pennsylvania/815541/"
    },
    {
      name: "NextEra \u2013 SW Pennsylvania Gas Hub (SoftBank-linked)",
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
      sourceUrl: "https://www.utilitydive.com/news/nextera-gas-generation-doe-softbank-texas-pennsylvania/815541/"
    },
    {
      name: "ECP / KKR / CyrusOne \u2013 Bosque County TX Campus",
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
      sourceUrl: "https://www.ecpgp.com/about/news-and-insights/press-releases/2025/energy-capital-partners--ecp--and-kkr-announce-development-of-hy"
    },
    {
      name: "Oracle \u2013 Bloom Energy SOFC Deployment (OCI)",
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
      sourceUrl: "https://investor.bloomenergy.com/press-releases/press-release-details/2025/Oracle-and-Bloom-Energy-Collaborate-to-Deliver-Power-to-Data-Centers-at-the-Speed-of-AI/default.aspx"
    },
    {
      name: "Google \u2013 Duane Arnold Nuclear Restart (Iowa)",
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
      sourceUrl: "https://www.investor.nexteraenergy.com/news-and-events/news-releases/2025/10-27-2025-203948689"
    },
    {
      name: "Google / Intersect Power / TPG \u2013 Powered Land Program",
      operatorId: fullCmap["Google"],
      location: "Multiple, USA",
      state: "USA",
      country: "USA",
      capacityMw: 3e3,
      status: "announced",
      announcedDate: "2024-12-01",
      totalInvestmentB: 20,
      hasBtm: 1,
      btmCapacityMw: 3e3,
      gridTied: 1,
      fullyOffGrid: 0,
      notes: "Up to $20B three-way partnership to develop 'powered land' \u2014 data center sites co-located with renewable generation and storage. Google acquiring Intersect Power for ~$4.75B. Fundamental shift from grid PPAs to controlling the entire energy supply chain. Renewables + storage co-location model.",
      sourceUrl: "https://enkiai.com/data-center/on-site-data-center-power-unlocking-the-2026-3t-market"
    },
    {
      name: "DayOne SG1 \u2013 Singapore SOFC Hydrogen Pilot",
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
      sourceUrl: "https://www.datacenterdynamics.com/en/news/dayone-breaks-ground-on-20mw-data-center-in-singapore/"
    },
    {
      name: "Sharon AI / New Era Helium \u2013 Permian BTM Net-Zero Campus",
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
      sourceUrl: "https://sharonai.com/press-releases/sharon-ai-and-new-era-helium-finalise-joint-venture-to-build-250mw-net-zero-energy-data-centre-in-texas/"
    },
    {
      name: "New Era Energy & Digital \u2013 TCDC Permian Campus",
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
      sourceUrl: "https://finance.yahoo.com/news/era-energy-digital-announces-450-140000779.html"
    },
    {
      name: "FuelCell Energy \u2013 12.5 MW Data Center Power Block",
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
      sourceUrl: "https://www.nasdaq.com/press-release/fuelcell-energy-scales-data-centers-packaged-125-mw-utility-grade-power-block"
    },
    {
      name: "AEP / Bloom Energy \u2013 Wyoming AI Campus 900 MW SOFC",
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
      sourceUrl: "https://introl.com/blog/fuel-cells-data-center-power-dark-horse-7-billion"
    }
  ];
  const insertedProjects = {};
  for (const p of newProjectData) {
    const result = db.insert(projects).values(p).returning().get();
    insertedProjects[p.name] = result.id;
  }
  const newBtmData = [
    // Piketon Ohio – SoftBank / SB Energy / AEP
    {
      projectId: insertedProjects["SoftBank / SB Energy \u2013 Piketon AI Campus (Ohio)"],
      technologyType: "gas_turbine",
      capacityMw: 9200,
      vendorId: null,
      developerId: fullCmap["SB Energy (SoftBank)"],
      fuelType: "natural_gas",
      fuelSourceId: fullCmap["American Electric Power"],
      productModel: "Combined cycle gas turbines (multiple vendors \u2013 RFP stage)",
      originCountry: "USA",
      notes: "$33.3B, 9.2 GW dedicated gas plant. AEP Ohio as utility partner. $4.2B transmission upgrades. Integrated on-site + grid hybrid model. On former DOE Portsmouth site."
    },
    // NextEra TX
    {
      projectId: insertedProjects["NextEra \u2013 Anderson County TX Gas Hub (SoftBank-linked)"],
      technologyType: "gas_turbine",
      capacityMw: 5200,
      vendorId: null,
      developerId: fullCmap["NextEra Energy Resources"],
      fuelType: "natural_gas",
      fuelSourceId: null,
      productModel: "Combined cycle gas turbines (vendor TBD)",
      originCountry: "USA",
      notes: "Part of 9.5 GW NextEra AI data center power buildout. Announced CERAWeek March 2026."
    },
    // NextEra PA
    {
      projectId: insertedProjects["NextEra \u2013 SW Pennsylvania Gas Hub (SoftBank-linked)"],
      technologyType: "gas_turbine",
      capacityMw: 4300,
      vendorId: null,
      developerId: fullCmap["NextEra Energy Resources"],
      fuelType: "natural_gas",
      fuelSourceId: null,
      productModel: "Combined cycle gas turbines (vendor TBD)",
      originCountry: "USA",
      notes: "Part of 9.5 GW NextEra AI data center power buildout."
    },
    // ECP/KKR/CyrusOne Bosque – Calpine gas
    {
      projectId: insertedProjects["ECP / KKR / CyrusOne \u2013 Bosque County TX Campus"],
      technologyType: "gas_turbine",
      capacityMw: 190,
      vendorId: null,
      developerId: fullCmap["Calpine"],
      fuelType: "natural_gas",
      fuelSourceId: fullCmap["Calpine"],
      productModel: "Calpine Thad Hill Energy Center (natural gas combined cycle)",
      originCountry: "USA",
      notes: "Co-located with Calpine Thad Hill plant. Long-term dedicated power contract. Surplus fed to ERCOT during grid scarcity events."
    },
    // Oracle Bloom
    {
      projectId: insertedProjects["Oracle \u2013 Bloom Energy SOFC Deployment (OCI)"],
      technologyType: "fuel_cell",
      capacityMw: 200,
      vendorId: fullCmap["Bloom Energy"],
      developerId: fullCmap["Bloom Energy"],
      fuelType: "natural_gas",
      fuelSourceId: null,
      productModel: "Bloom Energy SureSource SOFC (90-day delivery commitment)",
      originCountry: "USA",
      notes: "Bloom committed to power an entire data center within 90 days. Supports OCI AI workloads. Complements Oracle's VoltaGrid gas BTM agreement."
    },
    // Google Duane Arnold – nuclear existing
    {
      projectId: insertedProjects["Google \u2013 Duane Arnold Nuclear Restart (Iowa)"],
      technologyType: "nuclear_existing",
      capacityMw: 615,
      vendorId: fullCmap["NextEra Energy Resources"],
      developerId: fullCmap["NextEra Energy Resources"],
      fuelType: "nuclear",
      fuelSourceId: fullCmap["NextEra Energy Resources"],
      productModel: "Boiling Water Reactor \u2013 Duane Arnold Energy Center (Iowa)",
      originCountry: "USA",
      notes: "Shut down 2020, restart targeting Q1 2029. NextEra acquiring 100% ownership. 25-year Google PPA. CIPCO buys remaining output. Zero cost to Iowa ratepayers."
    },
    // Google/Intersect/TPG – renewables co-located
    {
      projectId: insertedProjects["Google / Intersect Power / TPG \u2013 Powered Land Program"],
      technologyType: "solar",
      capacityMw: 2e3,
      vendorId: fullCmap["Intersect Power"],
      developerId: fullCmap["Intersect Power"],
      fuelType: "solar",
      fuelSourceId: null,
      productModel: "Utility-scale solar PV + BESS (co-located with data centers)",
      originCountry: "USA",
      notes: "Google acquiring Intersect Power (~$4.75B). Powered land strategy: data centers built adjacent to generation assets. Up to $20B total program."
    },
    {
      projectId: insertedProjects["Google / Intersect Power / TPG \u2013 Powered Land Program"],
      technologyType: "battery",
      capacityMw: 1e3,
      vendorId: fullCmap["Intersect Power"],
      developerId: fullCmap["Intersect Power"],
      fuelType: "solar",
      fuelSourceId: null,
      productModel: "Grid-scale BESS (paired with solar)",
      originCountry: "USA",
      notes: "Long-duration storage co-located to firm renewable generation for 24/7 power."
    },
    // DayOne Singapore
    {
      projectId: insertedProjects["DayOne SG1 \u2013 Singapore SOFC Hydrogen Pilot"],
      technologyType: "fuel_cell",
      capacityMw: 0.3,
      vendorId: fullCmap["Bloom Energy"],
      developerId: fullCmap["DayOne Data Centers"],
      fuelType: "hydrogen",
      fuelSourceId: null,
      productModel: "Solid Oxide Fuel Cell (SOFC) \u2013 hydrogen pilot with NUS",
      originCountry: "USA",
      notes: "Proof-of-concept 0.3 MW. Singapore's first SOFC data center power. NUS research partnership. Future scale-up planned if pilot validates."
    },
    // Sharon AI / New Era Helium
    {
      projectId: insertedProjects["Sharon AI / New Era Helium \u2013 Permian BTM Net-Zero Campus"],
      technologyType: "gas_turbine",
      capacityMw: 250,
      vendorId: null,
      developerId: fullCmap["New Era Helium (NEHC)"],
      fuelType: "natural_gas",
      fuelSourceId: fullCmap["New Era Helium (NEHC)"],
      productModel: "Gas-fired power plant with CO2 capture (CCUS) \u2013 vendor TBD",
      originCountry: "USA",
      notes: "New Era Helium building dedicated gas plant with CO2 capture. 20-year fixed-price gas supply. 45Q CCUS tax credits. Net-zero target via carbon capture."
    },
    // New Era Energy TCDC
    {
      projectId: insertedProjects["New Era Energy & Digital \u2013 TCDC Permian Campus"],
      technologyType: "gas_turbine",
      capacityMw: 450,
      vendorId: fullCmap["Thunderhead Energy / TURBINE-X"],
      developerId: fullCmap["New Era Energy & Digital (NUAI)"],
      fuelType: "natural_gas",
      fuelSourceId: null,
      productModel: "Gas turbines via TURBINE-X OEM channel",
      originCountry: "USA",
      notes: "TURBINE-X is OEM channel partner. Equipment procurement underway. 438-acre site in Permian Basin."
    },
    // FuelCell Energy 12.5 MW block program
    {
      projectId: insertedProjects["FuelCell Energy \u2013 12.5 MW Data Center Power Block"],
      technologyType: "fuel_cell",
      capacityMw: 100,
      vendorId: fullCmap["Fuel Cell Energy"],
      developerId: fullCmap["Fuel Cell Energy"],
      fuelType: "natural_gas",
      fuelSourceId: null,
      productModel: "FuelCell Energy Block 12.5 MW (10\xD7 1.25 MW modules)",
      originCountry: "USA",
      notes: "Standardized packaged system for faster deployment. Reduces site-specific engineering. Torrington CT manufacturing expanding 100\u2192350 MW/yr. 275% pipeline growth. No rare earth materials."
    },
    // AEP Wyoming SOFC
    {
      projectId: insertedProjects["AEP / Bloom Energy \u2013 Wyoming AI Campus 900 MW SOFC"],
      technologyType: "fuel_cell",
      capacityMw: 900,
      vendorId: fullCmap["Bloom Energy"],
      developerId: fullCmap["American Electric Power"],
      fuelType: "natural_gas",
      fuelSourceId: null,
      productModel: "Bloom Energy SureSource SOFC",
      originCountry: "USA",
      notes: "$2.65B unconditional purchase. Wyoming AI campus. Utility-procured BTM fuel cells. Enables large AI data center without grid bottleneck."
    }
  ];
  for (const b of newBtmData) {
    db.insert(btmSources).values(b).run();
  }
  const newLinks = [
    { projectId: insertedProjects["SoftBank / SB Energy \u2013 Piketon AI Campus (Ohio)"], companyId: fullCmap["American Electric Power"], role: "partner" },
    { projectId: insertedProjects["SoftBank / SB Energy \u2013 Piketon AI Campus (Ohio)"], companyId: fullCmap["NextEra Energy Resources"], role: "btm_developer" },
    { projectId: insertedProjects["ECP / KKR / CyrusOne \u2013 Bosque County TX Campus"], companyId: fullCmap["Energy Capital Partners (ECP)"], role: "investor" },
    { projectId: insertedProjects["ECP / KKR / CyrusOne \u2013 Bosque County TX Campus"], companyId: fullCmap["KKR"], role: "investor" },
    { projectId: insertedProjects["ECP / KKR / CyrusOne \u2013 Bosque County TX Campus"], companyId: fullCmap["Calpine"], role: "fuel_supplier" },
    { projectId: insertedProjects["Oracle \u2013 Bloom Energy SOFC Deployment (OCI)"], companyId: fullCmap["Bloom Energy"], role: "tech_vendor" },
    { projectId: insertedProjects["Google \u2013 Duane Arnold Nuclear Restart (Iowa)"], companyId: fullCmap["NextEra Energy Resources"], role: "fuel_supplier" },
    { projectId: insertedProjects["Google / Intersect Power / TPG \u2013 Powered Land Program"], companyId: fullCmap["Intersect Power"], role: "btm_developer" },
    { projectId: insertedProjects["Google / Intersect Power / TPG \u2013 Powered Land Program"], companyId: fullCmap["TPG"], role: "investor" },
    { projectId: insertedProjects["DayOne SG1 \u2013 Singapore SOFC Hydrogen Pilot"], companyId: fullCmap["Bloom Energy"], role: "tech_vendor" },
    { projectId: insertedProjects["Sharon AI / New Era Helium \u2013 Permian BTM Net-Zero Campus"], companyId: fullCmap["New Era Helium (NEHC)"], role: "fuel_supplier" },
    { projectId: insertedProjects["New Era Energy & Digital \u2013 TCDC Permian Campus"], companyId: fullCmap["Thunderhead Energy / TURBINE-X"], role: "tech_vendor" },
    { projectId: insertedProjects["FuelCell Energy \u2013 12.5 MW Data Center Power Block"], companyId: fullCmap["Fuel Cell Energy"], role: "tech_vendor" },
    { projectId: insertedProjects["AEP / Bloom Energy \u2013 Wyoming AI Campus 900 MW SOFC"], companyId: fullCmap["Bloom Energy"], role: "tech_vendor" },
    { projectId: insertedProjects["NextEra \u2013 Anderson County TX Gas Hub (SoftBank-linked)"], companyId: fullCmap["SB Energy (SoftBank)"], role: "customer" },
    { projectId: insertedProjects["NextEra \u2013 SW Pennsylvania Gas Hub (SoftBank-linked)"], companyId: fullCmap["SB Energy (SoftBank)"], role: "customer" }
  ];
  for (const l of newLinks) {
    if (l.companyId) {
      db.insert(projectCompanies).values(l).run();
    }
  }
  console.log("\u2705 Database seeded with V2 DC Intel additions (12 new projects, 13 new companies)");
}

// server/seed_v3.ts
function seedDatabaseV3() {
  const existingProjects = db.select().from(projects).all();
  const hasV3 = existingProjects.some((p) => p.name === "Crusoe / OpenAI \u2013 Stargate Abilene Campus (Texas)");
  if (hasV3) return;
  const allCompanies = db.select().from(companies).all();
  const cmap = {};
  for (const c of allCompanies) cmap[c.name] = c.id;
  const newCompanyData = [
    // DC Operators / Developers
    {
      name: "Crusoe Energy",
      role: "dc_operator",
      hq: "San Francisco, CA",
      country: "USA",
      website: "crusoe.ai",
      description: "Energy-first AI infrastructure provider. Primary contractor for OpenAI's Stargate Abilene campus. 1.2 GW under construction in Abilene, TX. 10+ GW in pipeline. Launch customer for Boom Superpower turbines.",
      logoInitials: "CR"
    },
    {
      name: "CloudBurst Data Centers",
      role: "dc_operator",
      hq: "Dallas, TX",
      country: "USA",
      website: "cloudburstdc.com",
      description: "Next-gen AI GigaCenter developer. Flagship 1.2 GW San Marcos campus (Hays/Guadalupe Counties, TX) BTM-powered by Energy Transfer's Oasis Pipeline. Q4 2026 first phase.",
      logoInitials: "CB"
    },
    {
      name: "GridFree AI",
      role: "dc_operator",
      hq: "Houston, TX",
      country: "USA",
      website: "gridfree.ai",
      description: "Grid-independent AI data center developer. South Dallas Cluster: 3-site, ~5 GW combined. 'Power Foundry' model: US natural gas, 24-month delivery, Goldman Sachs financing. CEO Ralph Alexander.",
      logoInitials: "GF"
    },
    {
      name: "BorderPlex Digital Assets",
      role: "dc_operator",
      hq: "El Paso, TX",
      country: "USA",
      website: "projectjupitertogether.com",
      description: "Developer of Project Jupiter in Do\xF1a Ana County, NM. $165B 30-year campus with Stack Infrastructure. Oracle as anchor tenant. 700-900 MW on-site gas microgrid. Phase 1: $50B.",
      logoInitials: "BP"
    },
    {
      name: "AVAIO Digital Partners",
      role: "dc_operator",
      hq: "New York, NY",
      country: "USA",
      website: "avaiodigital.com",
      description: "Hyperscale AI campus developer. AVAIO Digital Leo: 760-acre, $6B campus near Little Rock, AR. Up to 1 GW power. Grid + BTM hybrid. 1.2 GW secured utility portfolio across CA, VA, AR, MS.",
      logoInitials: "AV"
    },
    {
      name: "Titus Low Carbon Ventures",
      role: "dc_operator",
      hq: "Austin, TX",
      country: "USA",
      website: "tituslcv.com",
      description: "Texas multi-campus AI data center power park developer. 673 MW gas engine supply deal with AB Energy (Jenbacher J620). Hybrid BTM: recip engines + solar + wind + BESS. Island-mode operation.",
      logoInitials: "TL"
    },
    {
      name: "G42 / Khazna Data Centers",
      role: "dc_operator",
      hq: "Abu Dhabi, UAE",
      country: "UAE",
      website: "g42.ai",
      description: "Abu Dhabi sovereign AI operator. 60% majority stakeholder in Stargate UAE: $30B, 5 GW, 10 sq-mile campus with OpenAI, NVIDIA, Oracle, SoftBank. First 200 MW operational 2026.",
      logoInitials: "G4"
    },
    {
      name: "Capital Power (Polaris @ Genesee)",
      ticker: "CPX",
      role: "dc_operator",
      hq: "Edmonton, AB",
      country: "Canada",
      website: "capitalpower.com",
      description: "Canadian power generator co-locating 1.0-1.5 GW hyperscale data center at Genesee Generating Station, Alberta. 1,800 MW gas plant with 500 MW excess capacity. 2028 target. SMR feasibility study with OPG.",
      logoInitials: "CP"
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
      logoInitials: "WI"
    },
    // BTM Tech Vendors / Power Developers
    {
      name: "Boom Supersonic",
      role: "tech_vendor",
      hq: "Denver, CO",
      country: "USA",
      website: "boomsupersonic.com",
      description: "Supersonic aviation company repurposing jet engine core as 42 MW 'Superpower' aeroderivative gas turbine for data centers. 29 turbines (1.21 GW) ordered by Crusoe. $300M raised. 4 GW/yr production target by 2030.",
      logoInitials: "BS"
    },
    {
      name: "AB Energy (Gruppo AB)",
      role: "tech_vendor",
      hq: "Arzignano, Italy",
      country: "Italy",
      website: "gruppoab.com",
      description: "Italian reciprocating engine OEM. Supplying 202 Ecomax 33 units (Jenbacher J620 engines, 673 MW total) to Titus Low Carbon Ventures for Texas AI data center parks. First 400 MW commissioned Q4 2027.",
      logoInitials: "AB"
    },
    {
      name: "Baker Hughes",
      ticker: "BKR",
      role: "tech_vendor",
      hq: "Houston, TX",
      country: "USA",
      website: "bakerhughes.com",
      description: "Energy technology company. Supplying 31 BRUSH\u2122 Power DAX 7 2-pole air-cooled generators (1.3 GW total) paired with Boom Superpower turbines for Crusoe's AI data centers. Deliveries mid-2026 through 2028.",
      logoInitials: "BH"
    },
    {
      name: "Oklo",
      ticker: "OKLO",
      role: "tech_vendor",
      hq: "Santa Clara, CA",
      country: "USA",
      website: "oklo.com",
      description: "Advanced fission company. 1.2 GW Aurora powerhouse campus agreement with Meta in Pike County, OH. 206-acre site. First phase online 2030, full 1.2 GW by 2034. Also partnered with Switch. Meta provides prepayment + capital.",
      logoInitials: "OK"
    },
    {
      name: "TerraPower",
      role: "tech_vendor",
      hq: "Bellevue, WA",
      country: "USA",
      website: "terrapower.com",
      description: "Bill Gates-founded advanced nuclear. Natrium reactor (sodium-cooled fast reactor). MOU with Meta for up to 8 reactors. First two units targeting 2032. Meta supporting early development for up to 6 GW nuclear.",
      logoInitials: "TP"
    },
    {
      name: "Stack Infrastructure",
      role: "dc_operator",
      hq: "New York, NY",
      country: "USA",
      website: "stackinfra.com",
      description: "Hyperscale data center developer and builder. Construction and development partner for BorderPlex's Project Jupiter in New Mexico. Oracle confirmed as anchor tenant.",
      logoInitials: "SI"
    },
    {
      name: "Pacifico Energy (Nate Franklin)",
      role: "btm_developer",
      hq: "Midland, TX",
      country: "USA",
      website: "pacificoenergy.com",
      description: "West Texas 8,400-acre off-grid AI power complex. 7.5 GW gas turbines + 750 MW solar + 1 GWh BESS. ERCOT-independent. Lowest-cost Permian gas supply. Permits secured from TCEQ.",
      logoInitials: "PE"
    }
  ];
  const insertedCompanies = db.insert(companies).values(
    newCompanyData.map((c) => ({
      name: c.name,
      ticker: c.ticker ?? null,
      role: c.role,
      hq: c.hq,
      country: c.country,
      website: c.website,
      description: c.description,
      logoInitials: c.logoInitials
    }))
  ).returning().all();
  for (const c of insertedCompanies) cmap[c.name] = c.id;
  console.log(`\u2705 V3: Inserted ${insertedCompanies.length} new companies`);
  const p1 = db.insert(projects).values({
    name: "Crusoe / OpenAI \u2013 Stargate Abilene Campus (Texas)",
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
    sourceUrl: "https://www.crusoe.ai/resources/newsroom/crusoe-expands-ai-data-center-campus-in-abilene-to-1-2-gigawatts"
  }).returning().get();
  db.insert(projectCompanies).values([
    { projectId: p1.id, companyId: cmap["Crusoe Energy"], role: "operator" },
    { projectId: p1.id, companyId: cmap["OpenAI"], role: "customer" },
    { projectId: p1.id, companyId: cmap["Boom Supersonic"], role: "vendor" }
  ]).run();
  const p2 = db.insert(projects).values({
    name: "CloudBurst \u2013 San Marcos GigaCenter (Texas)",
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
    sourceUrl: "https://evolveincorporated.com/company-news/cloudburst-and-evolve-break-ground-on-1-2gw-flagship-ai-data-center-campus-incentral-texas"
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
    notes: "Energy Transfer Oasis Pipeline direct supply. 450,000 MMBtu/day. Multiple turbine types. Fully behind-the-meter, off-grid."
  }).run();
  db.insert(projectCompanies).values([
    { projectId: p2.id, companyId: cmap["CloudBurst Data Centers"], role: "operator" },
    { projectId: p2.id, companyId: cmap["Energy Transfer"], role: "fuel_supplier" }
  ]).run();
  const p3 = db.insert(projects).values({
    name: "GridFree AI \u2013 South Dallas Power Foundry Cluster",
    operatorId: cmap["GridFree AI"],
    location: "Hill County (South of DFW)",
    state: "TX",
    country: "USA",
    capacityMw: 5e3,
    status: "announced",
    announcedDate: "2025-12-30",
    totalInvestmentB: 12,
    hasBtm: true,
    btmCapacityMw: 5e3,
    gridTied: false,
    fullyOffGrid: true,
    notes: "Three-site 'Power Foundry' cluster. Each site 1.5+ GW. Goldman Sachs co-leading financing. Newmark exclusive advisor. 24-month delivery from lease. US natural gas. 5x9 uptime. Industrial chilled-water cooling.",
    sourceUrl: "https://www.datacenterknowledge.com/energy-power-supply/gridfree-unveils-first-power-foundry-site-for-ai-data-center-workloads"
  }).returning().get();
  db.insert(btmSources).values({
    projectId: p3.id,
    technologyType: "gas_turbine",
    capacityMw: 5e3,
    vendorId: null,
    developerId: cmap["GridFree AI"],
    fuelType: "natural_gas",
    fuelSourceId: null,
    originCountry: "USA",
    notes: "Proprietary Power Foundry gas turbine platform. ERCOT-independent. Grid-isolated by design."
  }).run();
  db.insert(projectCompanies).values([
    { projectId: p3.id, companyId: cmap["GridFree AI"], role: "operator" }
  ]).run();
  const p4 = db.insert(projects).values({
    name: "Project Jupiter \u2013 BorderPlex / Oracle (New Mexico)",
    operatorId: cmap["BorderPlex Digital Assets"],
    location: "Santa Teresa, Do\xF1a Ana County",
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
    sourceUrl: "https://www.datacenterdynamics.com/en/news/oracle-revealed-as-tenant-of-project-jupiter-data-center-campus-in-new-mexico/"
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
    notes: "Simple-cycle gas turbine microgrid. NMLEG amendment exempting microgrid from Energy Transition Act (no surplus sales required). 110-140 MMcf/d gas at full build."
  }).run();
  db.insert(projectCompanies).values([
    { projectId: p4.id, companyId: cmap["BorderPlex Digital Assets"], role: "operator" },
    { projectId: p4.id, companyId: cmap["Stack Infrastructure"], role: "developer" },
    { projectId: p4.id, companyId: cmap["Oracle"], role: "customer" }
  ]).run();
  const p5 = db.insert(projects).values({
    name: "AVAIO Digital Leo \u2013 Little Rock Campus (Arkansas)",
    operatorId: cmap["AVAIO Digital Partners"],
    location: "Pulaski County (near Little Rock)",
    state: "AR",
    country: "USA",
    capacityMw: 1e3,
    status: "announced",
    announcedDate: "2026-01-12",
    totalInvestmentB: 6,
    hasBtm: false,
    btmCapacityMw: 0,
    gridTied: true,
    fullyOffGrid: false,
    notes: "760-acre campus. $6B initial investment (largest in Arkansas history). 150 MW contracted with Entergy Arkansas, scaling to 1 GW. Grid + BTM hybrid model. 500+ permanent jobs. Part of AVAIO's 1.2 GW multi-state utility portfolio.",
    sourceUrl: "https://www.avaiodigital.com/updates/avaio-digital-announces-new-large-scale-ai-ready-data-center-and-power-campus-in-little-rock-arkansas"
  }).returning().get();
  db.insert(projectCompanies).values([
    { projectId: p5.id, companyId: cmap["AVAIO Digital Partners"], role: "operator" }
  ]).run();
  const p6 = db.insert(projects).values({
    name: "Titus Low Carbon \u2013 Texas AI Data Center Power Parks",
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
    sourceUrl: "https://www.datacenterdynamics.com/en/news/titus-signs-673mw-gas-engine-supply-deal-with-ab-energy-for-texas-data-center-parks/"
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
    notes: "202 Ecomax 33 preassembled units. 202 \xD7 Jenbacher J620 engines. Fast-start, fast-ramp, low heat rate. Modular parallel installation. Island-mode BESS integration."
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
    notes: "Co-located utility-scale solar + wind + BESS across Texas power parks."
  }).run();
  db.insert(projectCompanies).values([
    { projectId: p6.id, companyId: cmap["Titus Low Carbon Ventures"], role: "operator" },
    { projectId: p6.id, companyId: cmap["AB Energy (Gruppo AB)"], role: "vendor" }
  ]).run();
  const p7 = db.insert(projects).values({
    name: "Williams Companies \u2013 Socrates Power Projects (Ohio)",
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
    sourceUrl: "https://www.williams.com/expansion-project/socrates-power-solution-facilities/"
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
    notes: "Williams integrated model: upstream gas + 33,000-mi pipeline + on-site generation. 10-year take-or-pay with Meta. Ohio Power Siting Board regulated."
  }).run();
  db.insert(projectCompanies).values([
    { projectId: p7.id, companyId: cmap["Williams Companies"], role: "operator" },
    { projectId: p7.id, companyId: cmap["Meta"], role: "customer" }
  ]).run();
  const p8 = db.insert(projects).values({
    name: "Williams \u2013 Apollo (Ohio) & Aquila (Utah) Power Projects",
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
    sourceUrl: "https://www.argusmedia.com/en/news-and-insights/latest-market-news/2786994-williams-to-supply-gas-power-to-meet-ohio-demand"
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
    notes: "Apollo: 490 MW Ohio. Aquila: 520 MW Utah. Both 12.5-year take-or-pay contracts with undisclosed hyperscaler. H1 2027 target."
  }).run();
  db.insert(projectCompanies).values([
    { projectId: p8.id, companyId: cmap["Williams Companies"], role: "operator" }
  ]).run();
  const p9 = db.insert(projects).values({
    name: "Stargate UAE \u2013 G42 / OpenAI / NVIDIA / Oracle (Abu Dhabi)",
    operatorId: cmap["G42 / Khazna Data Centers"],
    location: "Masdar City Technology Zone, Abu Dhabi",
    state: null,
    country: "UAE",
    capacityMw: 5e3,
    status: "under_construction",
    announcedDate: "2025-05-22",
    totalInvestmentB: 30,
    hasBtm: true,
    btmCapacityMw: 3500,
    gridTied: true,
    fullyOffGrid: false,
    notes: "World's largest planned AI campus. 10 sq miles. G42 (60%), OpenAI (20%), NVIDIA (12%), Oracle (8%). First 200 MW online 2026. Full 5 GW by ~2030. Power: dedicated gas turbines (baseload BTM) + 1.5 GW solar array + BESS + grid. Barakah nuclear grid backup. 1M+ Nvidia Blackwell Ultra chips. Sovereign AI for UAE government.",
    sourceUrl: "https://www.prnewswire.com/apac/news-releases/g42-provides-update-on-construction-of-stargate-uae-ai-infrastructure-cluster-302586440.html"
  }).returning().get();
  db.insert(btmSources).values({
    projectId: p9.id,
    technologyType: "gas_turbine",
    capacityMw: 2e3,
    vendorId: null,
    developerId: cmap["G42 / Khazna Data Centers"],
    fuelType: "natural_gas",
    fuelSourceId: null,
    originCountry: "UAE",
    notes: "Dedicated BTM gas turbines for baseload power. UAE Department of Energy-approved dedicated transmission corridor. Campus-scale generation."
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
    notes: "1.5 GW solar array co-located with campus. Combined with BESS for renewables integration."
  }).run();
  db.insert(projectCompanies).values([
    { projectId: p9.id, companyId: cmap["G42 / Khazna Data Centers"], role: "operator" },
    { projectId: p9.id, companyId: cmap["OpenAI"], role: "customer" },
    { projectId: p9.id, companyId: cmap["Oracle"], role: "vendor" }
  ]).run();
  const p10 = db.insert(projects).values({
    name: "Capital Power \u2013 Polaris @ Genesee Energy Campus (Alberta)",
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
    sourceUrl: "https://www.capitalpower.com/pgec/"
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
    notes: "Co-located with 1,800 MW Genesee Gas Station (converted from coal, -40% GHG). 500 MW near-term via BESS unlock. SMR feasibility study with OPG underway."
  }).run();
  db.insert(projectCompanies).values([
    { projectId: p10.id, companyId: cmap["Capital Power (Polaris @ Genesee)"], role: "operator" }
  ]).run();
  const p11 = db.insert(projects).values({
    name: "Oklo / Meta \u2013 Aurora Nuclear Campus (Pike County, Ohio)",
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
    sourceUrl: "https://oklo.com/newsroom/news-details/2026/Oklo-Meta-Announce-Agreement-in-Support-of-1.2-GW-Nuclear-Energy-Development-in-Southern-Ohio/default.aspx"
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
    notes: "Up to 16 Aurora reactors. Advanced fission (fast spectrum). Scaling incrementally. Meta prepayment mechanism novel for nuclear sector."
  }).run();
  db.insert(projectCompanies).values([
    { projectId: p11.id, companyId: cmap["Oklo"], role: "vendor" },
    { projectId: p11.id, companyId: cmap["Meta"], role: "customer" }
  ]).run();
  const p12 = db.insert(projects).values({
    name: "Meta \u2013 Lebanon Data Center Campus (Indiana)",
    operatorId: cmap["Meta"],
    location: "Lebanon, Boone County (30 mi NW of Indianapolis)",
    state: "IN",
    country: "USA",
    capacityMw: 1e3,
    status: "under_construction",
    announcedDate: "2026-02-11",
    totalInvestmentB: 10,
    hasBtm: false,
    btmCapacityMw: 0,
    gridTied: true,
    fullyOffGrid: false,
    notes: "Meta's second Indiana campus. Groundbreaking Feb 11, 2026. 100% clean energy matched. 4,000 construction jobs at peak. Operational late 2027 / early 2028. LEED Gold. Closed-loop liquid cooling (zero water most of year). $1M/yr Boone REMC community fund for 20 years.",
    sourceUrl: "https://about.fb.com/news/2026/02/metas-new-data-center-lebanon-indiana-marks-milestone-ai-investment/"
  }).returning().get();
  db.insert(projectCompanies).values([
    { projectId: p12.id, companyId: cmap["Meta"], role: "operator" }
  ]).run();
  const p13 = db.insert(projects).values({
    name: "Pacifico Energy \u2013 West Texas Off-Grid AI Power Complex",
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
    sourceUrl: "https://www.forbes.com/sites/christopherhelman/2026/02/19/this-daring-developer-wants-to-power-americas-ai-future/"
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
    notes: "Permitted for gas turbines (TCEQ). ERCOT-isolated. Permian Basin cheapest gas. 8,400 acres acquired/optioned."
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
    notes: "750 MW solar + 1 GWh BESS as hybrid overlay on gas turbine baseload."
  }).run();
  db.insert(projectCompanies).values([
    { projectId: p13.id, companyId: cmap["Pacifico Energy (Nate Franklin)"], role: "operator" }
  ]).run();
  const p14 = db.insert(projects).values({
    name: "Boom Superpower \u2013 Crusoe Aeroderivative Fleet (National)",
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
    notes: "29 \xD7 42 MW Superpower turbines ordered by Crusoe ($1.25B backlog). 31 units total with Baker Hughes BRUSH DAX 7 generators. Deliveries mid-2026 \u2192 2028. Derived from Overture supersonic jet core. Full-rated output at 110\xB0F+. Waterless. No ERCOT connection needed. 4 GW/yr production target 2030.",
    sourceUrl: "https://investors.bakerhughes.com/news/press-releases/news-details/2026/Baker-Hughes-Secures-1.21-Gigawatt-Generator-Order-to-Power-Boom-Supersonics-AI-Data-Center-Solution/default.aspx"
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
    notes: "Supersonic jet-derived aeroderivative. 42 MW per unit ISO-rated. Waterless operation. $300M Boom funding (Darsana, Altimeter, ARK, Bessemer, Robinhood, YC)."
  }).run();
  db.insert(projectCompanies).values([
    { projectId: p14.id, companyId: cmap["Boom Supersonic"], role: "vendor" },
    { projectId: p14.id, companyId: cmap["Crusoe Energy"], role: "operator" },
    { projectId: p14.id, companyId: cmap["Baker Hughes"], role: "vendor" }
  ]).run();
  console.log(`\u2705 V3: Inserted 14 new projects with BTM sources and project-company links`);
}

// server/auth.ts
var import_express2 = __toESM(require("express"), 1);
var PASSWORD = process.env.APP_PASSWORD;
var COOKIE_NAME = "dc_intel_auth";
var COOKIE_VALUE = "granted";
var LOGIN_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>DC Intel \u2014 Login</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #04454B;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      font-family: 'IBM Plex Mono', 'Courier New', monospace;
    }
    .card {
      background: #04454B;
      border: 1px solid #01747B;
      padding: 48px 40px;
      width: 360px;
      text-align: center;
    }
    .logo {
      font-size: 22px;
      font-weight: 700;
      color: #72BBC1;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .sub {
      font-size: 10px;
      color: #407277;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin-bottom: 36px;
    }
    label {
      display: block;
      font-size: 10px;
      color: #72BBC1;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      text-align: left;
      margin-bottom: 8px;
    }
    input[type="password"] {
      width: 100%;
      background: #000;
      border: 1px solid #01747B;
      color: #fff;
      font-family: inherit;
      font-size: 14px;
      padding: 10px 12px;
      outline: none;
      margin-bottom: 20px;
    }
    input[type="password"]:focus { border-color: #72BBC1; }
    button {
      width: 100%;
      background: #01747B;
      border: none;
      color: #fff;
      font-family: inherit;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      padding: 12px;
      cursor: pointer;
    }
    button:hover { background: #72BBC1; color: #000; }
    .error {
      font-size: 11px;
      color: #ff4444;
      margin-top: 12px;
      letter-spacing: 0.04em;
    }
    .dot {
      display: inline-block;
      width: 6px; height: 6px;
      border-radius: 50%;
      background: #00FF41;
      margin-right: 6px;
      vertical-align: middle;
    }
    .live {
      font-size: 9px;
      color: #00FF41;
      letter-spacing: 0.08em;
      margin-bottom: 32px;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">DC Intel</div>
    <div class="sub">BTM Generation Tracker</div>
    <div class="live"><span class="dot"></span>LIVE DATA</div>
    <form method="POST" action="/login">
      <label>Access Password</label>
      <input type="password" name="password" autofocus placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" />
      {{ERROR}}
      <button type="submit">Enter</button>
    </form>
  </div>
</body>
</html>`;
function setupAuth(app2) {
  if (!PASSWORD) return;
  function getCookie(req, name) {
    const cookies = req.headers.cookie || "";
    const parts = cookies.split(";").map((c) => c.trim());
    for (const part of parts) {
      const [key, ...rest] = part.split("=");
      if (key.trim() === name) return rest.join("=").trim();
    }
    return void 0;
  }
  function isAuthed(req) {
    return getCookie(req, COOKIE_NAME) === COOKIE_VALUE;
  }
  app2.get("/login", (_req, res) => {
    res.send(LOGIN_HTML.replace("{{ERROR}}", ""));
  });
  app2.post("/login", import_express2.default.urlencoded({ extended: false }), (req, res) => {
    const { password } = req.body;
    if (password === PASSWORD) {
      const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3).toUTCString();
      res.setHeader("Set-Cookie", `${COOKIE_NAME}=${COOKIE_VALUE}; Path=/; Expires=${expires}; HttpOnly; SameSite=Lax`);
      res.redirect("/");
    } else {
      res.send(LOGIN_HTML.replace("{{ERROR}}", '<div class="error">Incorrect password \u2014 try again.</div>'));
    }
  });
  app2.use((req, res, next) => {
    if (req.path === "/login") return next();
    if (req.path.match(/\.(js|css|png|ico|woff2?|ttf|svg|map)$/)) return next();
    if (isAuthed(req)) return next();
    if (req.path.startsWith("/api/")) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    res.redirect("/login");
  });
}

// server/index.ts
var app = (0, import_express3.default)();
var httpServer = (0, import_http.createServer)(app);
app.use(
  import_express3.default.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    }
  })
);
app.use(import_express3.default.urlencoded({ extended: false }));
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
app.use((req, res, next) => {
  const start = Date.now();
  const path5 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path5.startsWith("/api")) {
      let logLine = `${req.method} ${path5} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  seedDatabase();
  seedDatabaseV2();
  seedDatabaseV3();
  setupAuth(app);
  await registerRoutes(httpServer, app);
  app.use((err, _req, res, next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error("Internal Server Error:", err);
    if (res.headersSent) {
      return next(err);
    }
    return res.status(status).json({ message });
  });
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite: setupVite2 } = await Promise.resolve().then(() => (init_vite(), vite_exports));
    await setupVite2(httpServer, app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true
    },
    () => {
      log(`serving on port ${port}`);
    }
  );
})();
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  log
});
