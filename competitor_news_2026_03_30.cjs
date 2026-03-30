// Auto-generated competitor news seed
const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname,'data.db'));
const items = [
  {
    "competitor": "Williams / Will Power",
    "headline": "Williams leaders highlight data centers as major driver of U.S. gas-fired power demand growth through 2035 (2026 Analyst Day)",
    "date": "2026-02-13",
    "url": "https://www.williams.com/2026/02/13/natural-gas-infrastructure-is-the-fix-for-surging-energy-demand/"
  }
];

const getId = db.prepare('SELECT id FROM competitors WHERE name = ?');
const exists = db.prepare('SELECT 1 FROM competitor_news WHERE competitor_id = ? AND url = ?');
const insert = db.prepare('INSERT INTO competitor_news (competitor_id, published_date, headline, url, category) VALUES (?, ?, ?, ?, ?)');

let inserted=0;
for (const it of items) {
  const row = getId.get(it.competitor);
  if (!row) continue;
  if (exists.get(row.id, it.url)) continue;
  insert.run(row.id, it.date, it.headline, it.url, 'market');
  inserted++;
}
console.log(JSON.stringify({inserted},null,2));
db.close();
