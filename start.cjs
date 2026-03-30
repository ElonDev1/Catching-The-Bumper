// Startup script — runs DB migrations then starts the server
const { execSync } = require('child_process');
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(process.cwd(), 'data.db');
const db = new Database(dbPath);

// Add missing columns if they don't exist
const migrations = [
  "ALTER TABLE companies ADD COLUMN stock_price REAL",
  "ALTER TABLE companies ADD COLUMN market_cap_b REAL",
  "ALTER TABLE companies ADD COLUMN revenue_ttm_b REAL",
  "ALTER TABLE companies ADD COLUMN ebitda_ttm_b REAL",
  "ALTER TABLE companies ADD COLUMN net_income_ttm_b REAL",
  "ALTER TABLE companies ADD COLUMN fcf_ttm_b REAL",
  "ALTER TABLE companies ADD COLUMN pe_ratio REAL",
  "ALTER TABLE companies ADD COLUMN fins_updated_date TEXT",
  "ALTER TABLE competitors ADD COLUMN stock_price REAL",
  "ALTER TABLE competitors ADD COLUMN market_cap_b REAL",
  "ALTER TABLE competitors ADD COLUMN revenue_ttm_m REAL",
  "ALTER TABLE competitors ADD COLUMN ebitda_ttm_m REAL",
  "ALTER TABLE competitors ADD COLUMN net_income_ttm_m REAL",
  "ALTER TABLE competitors ADD COLUMN fcf_ttm_m REAL",
  "ALTER TABLE competitors ADD COLUMN pe_ratio REAL",
  "ALTER TABLE competitors ADD COLUMN year_low REAL",
  "ALTER TABLE competitors ADD COLUMN year_high REAL",
  "ALTER TABLE competitors ADD COLUMN fins_updated_date TEXT",
  "ALTER TABLE projects ADD COLUMN lat REAL",
  "ALTER TABLE projects ADD COLUMN lng REAL",
  "CREATE TABLE IF NOT EXISTS rto_queue_snapshots (id INTEGER PRIMARY KEY AUTOINCREMENT, rto_id TEXT, snapshot_date TEXT, total_queue_mw REAL, active_queue_mw REAL, gas_mw REAL, solar_mw REAL, wind_mw REAL, storage_mw REAL, nuclear_mw REAL, other_mw REAL, project_count INTEGER, withdrawal_rate_pct REAL, avg_wait_yrs REAL, notes TEXT, source_url TEXT)",
  "CREATE TABLE IF NOT EXISTS rto_large_load_queue (id INTEGER PRIMARY KEY AUTOINCREMENT, rto_id TEXT, snapshot_date TEXT, total_queue_mw REAL, data_center_mw REAL, data_center_pct REAL, connected_mw REAL, no_study_mw REAL, notes TEXT, source_url TEXT)",
  "CREATE TABLE IF NOT EXISTS midstream_pipelines (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, operator TEXT, ferc_docket TEXT, ferc_cid TEXT, capacity_bcfd REAL, capacity_notes TEXT, utilization_status TEXT, utilization_pct REAL, route_description TEXT, grady_county_present INTEGER DEFAULT 0, iron_horse_connected INTEGER DEFAULT 0, is_interstate INTEGER DEFAULT 1, tariff_url TEXT, ioc_url TEXT, latest_549b_quarter TEXT, notes TEXT, created_at TEXT DEFAULT (datetime('now')))",
  "CREATE TABLE IF NOT EXISTS midstream_shippers (id INTEGER PRIMARY KEY AUTOINCREMENT, pipeline_id INTEGER, shipper_name TEXT NOT NULL, mdq_dth_d REAL, rate_schedule TEXT, contract_start TEXT, contract_end TEXT, receipt_point TEXT, delivery_point TEXT, zone TEXT, is_competitor INTEGER DEFAULT 0, competitor_id INTEGER, notes TEXT, source_quarter TEXT, source_url TEXT)",
  "CREATE TABLE IF NOT EXISTS midstream_signals (id INTEGER PRIMARY KEY AUTOINCREMENT, pipeline_id INTEGER, signal_type TEXT, title TEXT NOT NULL, summary TEXT, date TEXT, url TEXT, urgency TEXT DEFAULT 'normal')",
];

for (const sql of migrations) {
  try {
    db.exec(sql);
  } catch (e) {
    // Column already exists or table already exists — ignore
    if (!e.message.includes('already exists') && !e.message.includes('duplicate column')) {
      console.warn('Migration warning:', e.message);
    }
  }
}

console.log('DB migrations complete');
db.close();

// Now start the actual server
require('./dist/index.cjs');
