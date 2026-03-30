// Competitor news sweep (as of March 29, 2026)
// Writes into competitor_news table.
// Sources are embedded per-row in url.
const Database = require('better-sqlite3');
const db = new Database('/home/user/workspace/dc-intel/data.db');
const published_date = '2026-03-29';

const hasTable = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='competitor_news'").get();
if (!hasTable) {
  console.log('No competitor_news table found; skipping DB write.');
  process.exit(0);
}

// Guard: if any rows already exist for published_date, skip
const guard = db.prepare('SELECT 1 FROM competitor_news WHERE published_date=? LIMIT 1').get(published_date);
if (guard) {
  console.log('Already seeded competitor_news for', published_date);
  process.exit(0);
}

const getCompetitorId = db.prepare('SELECT id FROM competitors WHERE name LIKE ? LIMIT 1');
const ins = db.prepare(`INSERT INTO competitor_news
  (competitor_id, headline, summary, url, published_date, category)
  VALUES (?,?,?,?,?,?)`);

const items = [
  {
    competitor_like: '%Liberty%',
    headline: 'Liberty Energy: 330 MW data center contract terminated after project delay/expansion modification',
    summary: 'Denver Business Journal reported the developer modified and delayed a 330 MW expansion project, leading to early termination of Liberty Energy\'s Texas data center power reservation agreement (Mar 23, 2026).',
    url: 'https://www.bizjournals.com/denver/news/2026/03/23/denver-fracking-co-data-center-power-deal-nixed.html',
    category: 'data_center_power'
  },
  {
    competitor_like: '%Williams%',
    headline: 'Williams considering buying upstream gas assets to support hyperscaler/data center energy offering',
    summary: 'Reuters reported Williams is weighing acquisitions of U.S. gas-producing assets to help secure fuel supply for hyperscaler/data center energy offerings (Feb 6, 2026).',
    url: 'https://www.reuters.com/business/energy/williams-weighs-buying-gas-producing-assets-enhance-ai-energy-supply-2026-02-06/',
    category: 'midstream_strategy'
  },
  {
    competitor_like: '%NiSource%',
    headline: 'NiSource beats Q4 profit estimates; reaffirms 2026 forecast; highlights data center capex plan',
    summary: 'Reuters reported NiSource beat Q4 profit estimates and reaffirmed 2026 guidance, citing growing commercial demand (incl. data centers) and a long-term capex plan (Feb 11, 2026).',
    url: 'https://www.reuters.com/business/energy/nisource-beats-fourth-quarter-profit-estimates-reaffirms-2026-forecast-2026-02-11/',
    category: 'utility_capex'
  },
  {
    competitor_like: '%Oklo%',
    headline: 'Oklo signs prepayment power agreement with Meta tied to planned Ohio nuclear plant',
    summary: 'Yahoo Finance coverage noted Oklo signed a prepayment agreement with Meta for power from its planned Ohio nuclear plant, intended to fund early-phase work in 2026 (Mar 4, 2026).',
    url: 'https://finance.yahoo.com/news/oklo-meta-deal-links-early-231736686.html',
    category: 'nuclear'
  }
];

let inserted = 0;
for (const it of items) {
  const row = getCompetitorId.get(it.competitor_like);
  if (!row) {
    console.log('competitor not found for', it.competitor_like, '— skipping');
    continue;
  }
  ins.run(row.id, it.headline, it.summary, it.url, published_date, it.category);
  inserted += 1;
}

console.log('✅ competitor_news seeded:', inserted);
