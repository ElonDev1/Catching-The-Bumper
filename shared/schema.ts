import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Companies involved in data center / BTM generation ecosystem
export const companies = sqliteTable("companies", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  ticker: text("ticker"),
  role: text("role").notNull(), // 'hyperscaler' | 'dc_operator' | 'btm_developer' | 'tech_vendor' | 'fuel_supplier' | 'investor'
  hq: text("hq"),
  country: text("country"),
  website: text("website"),
  description: text("description"),
  logoInitials: text("logo_initials"),
  // Financial data (public companies only)
  stockPrice: real("stock_price"),
  marketCapB: real("market_cap_b"),
  revenueTtmB: real("revenue_ttm_b"),
  ebitdaTtmB: real("ebitda_ttm_b"),
  netIncomeTtmB: real("net_income_ttm_b"),
  fcfTtmB: real("fcf_ttm_b"),
  peRatio: real("pe_ratio"),
  finsUpdatedDate: text("fins_updated_date"),
});

export const insertCompanySchema = createInsertSchema(companies).omit({ id: true });
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Company = typeof companies.$inferSelect;

// Data center projects / announcements
export const projects = sqliteTable("projects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  operatorId: integer("operator_id"), // FK to companies
  location: text("location").notNull(), // city/county, state
  state: text("state"),
  country: text("country").default("USA"),
  capacityMw: real("capacity_mw"), // total IT load MW
  status: text("status").notNull(), // 'announced' | 'under_construction' | 'operational' | 'planned'
  announcedDate: text("announced_date"),
  totalInvestmentB: real("total_investment_b"), // billions USD
  hasBtm: integer("has_btm").default(0), // boolean
  btmCapacityMw: real("btm_capacity_mw"),
  gridTied: integer("grid_tied").default(1), // boolean
  fullyOffGrid: integer("fully_off_grid").default(0), // boolean
  notes: text("notes"),
  sourceUrl: text("source_url"),
  lat: real("lat"),
  lng: real("lng"),
});

export const insertProjectSchema = createInsertSchema(projects).omit({ id: true });
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

// BTM generation sources tied to a project
export const btmSources = sqliteTable("btm_sources", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id").notNull(),
  technologyType: text("technology_type").notNull(), // 'gas_turbine' | 'recip_engine' | 'fuel_cell' | 'solar' | 'battery' | 'nuclear_smr' | 'nuclear_existing' | 'wind' | 'diesel'
  capacityMw: real("capacity_mw"),
  vendorId: integer("vendor_id"), // FK to companies (tech vendor)
  developerId: integer("developer_id"), // FK to companies (BTM developer/operator)
  fuelType: text("fuel_type"), // 'natural_gas' | 'hydrogen' | 'nuclear' | 'solar' | 'wind' | 'diesel'
  fuelSourceId: integer("fuel_source_id"), // FK to companies (fuel supplier)
  productModel: text("product_model"), // e.g. "LM2500+G4", "J624", "SureSource 4000"
  originCountry: text("origin_country"), // where technology is manufactured
  notes: text("notes"),
});

export const insertBtmSourceSchema = createInsertSchema(btmSources).omit({ id: true });
export type InsertBtmSource = z.infer<typeof insertBtmSourceSchema>;
export type BtmSource = typeof btmSources.$inferSelect;

// Many-to-many: project <-> companies (customers / investors / partners)
export const projectCompanies = sqliteTable("project_companies", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id").notNull(),
  companyId: integer("company_id").notNull(),
  role: text("role").notNull(), // 'customer' | 'investor' | 'epc' | 'fuel_supplier' | 'operator' | 'partner'
});

export const insertProjectCompanySchema = createInsertSchema(projectCompanies).omit({ id: true });
export type InsertProjectCompany = z.infer<typeof insertProjectCompanySchema>;
export type ProjectCompany = typeof projectCompanies.$inferSelect;

// Competitors — BTM generation providers tracked as competitive intelligence
export const competitors = sqliteTable("competitors", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  ticker: text("ticker"),
  hq: text("hq"),
  country: text("country").default("USA"),
  website: text("website"),
  description: text("description"),
  technology: text("technology"),         // equipment / platform description
  keyDeals: text("key_deals"),            // major DC deals / projects summary
  capacityDeployedMw: integer("capacity_deployed_mw"),
  capacityPipelineMw: integer("capacity_pipeline_mw"),
  logoInitials: text("logo_initials"),
  isPublic: integer("is_public"),         // 0 = private, 1 = public
  // Financial data (public competitors only)
  stockPrice: real("stock_price"),
  marketCapB: real("market_cap_b"),
  revenueTtmM: real("revenue_ttm_m"),
  ebitdaTtmM: real("ebitda_ttm_m"),
  netIncomeTtmM: real("net_income_ttm_m"),
  fcfTtmM: real("fcf_ttm_m"),
  peRatio: real("pe_ratio"),
  yearLow: real("year_low"),
  yearHigh: real("year_high"),
  finsUpdatedDate: text("fins_updated_date"),
});

export const insertCompetitorSchema = createInsertSchema(competitors).omit({ id: true });
export type InsertCompetitor = z.infer<typeof insertCompetitorSchema>;
export type Competitor = typeof competitors.$inferSelect;

// News items tied to a competitor
export const competitorNews = sqliteTable("competitor_news", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  competitorId: integer("competitor_id").notNull(),
  headline: text("headline").notNull(),
  summary: text("summary"),
  url: text("url"),
  publishedDate: text("published_date"),
  category: text("category"), // 'deal' | 'product' | 'partnership' | 'funding' | 'expansion' | 'regulatory' | 'other'
});

export const insertCompetitorNewsSchema = createInsertSchema(competitorNews).omit({ id: true });
export type InsertCompetitorNews = z.infer<typeof insertCompetitorNewsSchema>;
export type CompetitorNews = typeof competitorNews.$inferSelect;
