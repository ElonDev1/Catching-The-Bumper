import { db } from "./db";
import { companies, projects, btmSources, projectCompanies } from "@shared/schema";
import type { InsertCompany, Company, InsertProject, Project, InsertBtmSource, BtmSource, InsertProjectCompany, ProjectCompany } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Companies
  getAllCompanies(): Company[];
  getCompanyById(id: number): Company | undefined;
  upsertCompany(data: InsertCompany): Company;

  // Projects
  getAllProjects(): Project[];
  getProjectById(id: number): Project | undefined;
  upsertProject(data: InsertProject): Project;

  // BTM Sources
  getBtmSourcesByProject(projectId: number): BtmSource[];
  getAllBtmSources(): BtmSource[];

  // Project Companies
  getProjectCompaniesByProject(projectId: number): ProjectCompany[];
  getAllProjectCompanies(): ProjectCompany[];
}

class SqliteStorage implements IStorage {
  getAllCompanies(): Company[] {
    return db.select().from(companies).all();
  }

  getCompanyById(id: number): Company | undefined {
    return db.select().from(companies).where(eq(companies.id, id)).get();
  }

  upsertCompany(data: InsertCompany): Company {
    return db.insert(companies).values(data).returning().get();
  }

  getAllProjects(): Project[] {
    return db.select().from(projects).all();
  }

  getProjectById(id: number): Project | undefined {
    return db.select().from(projects).where(eq(projects.id, id)).get();
  }

  upsertProject(data: InsertProject): Project {
    return db.insert(projects).values(data).returning().get();
  }

  getBtmSourcesByProject(projectId: number): BtmSource[] {
    return db.select().from(btmSources).where(eq(btmSources.projectId, projectId)).all();
  }

  getAllBtmSources(): BtmSource[] {
    return db.select().from(btmSources).all();
  }

  getProjectCompaniesByProject(projectId: number): ProjectCompany[] {
    return db.select().from(projectCompanies).where(eq(projectCompanies.projectId, projectId)).all();
  }

  getAllProjectCompanies(): ProjectCompany[] {
    return db.select().from(projectCompanies).all();
  }
}

export const storage = new SqliteStorage();
