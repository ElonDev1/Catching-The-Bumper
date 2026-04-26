'use strict';
/**
 * validate_news.cjs
 * Runs before every build+push. Exits 0 if clean, exits 1 if blocking issues found.
 * Called by all crons after seed scripts run, before npm run build.
 *
 * Checks:
 *  1. No invalid tabs
 *  2. No empty URLs (except known no-URL sources)
 *  3. No truncated dollar/MW amounts (headline vs URL mismatch)
 *  4. No duplicate URLs
 *  5. No near-duplicate headlines (same company + event within 60 days)
 *  6. Article count hasn't dropped by more than 10 vs last known good count
 *  7. Tab distribution sanity (no single tab > 60% of total)
 */

const Database = require('better-sqlite3');
const db = new Database('/home/user/workspace/dc-intel/data.db');

const VALID_TABS = ['projects', 'competitors', 'financing', 'regulatory', 'sentiment'];
const NO_URL_OK_SOURCES = ['NGI', 'Enverus Intelligence']; // known paywalled sources
const MIN_ARTICLE_COUNT = 100; // hard floor — warn if below
const MAX_DROP_FROM_LAST_GOOD = 10; // alert if count dropped sharply

// Load last known good count from state file if it exists
let lastGoodCount = null;
try {
  const state = JSON.parse(require('fs').readFileSync(
    '/home/user/workspace/dc-intel/cron_tracking/validate_state.json', 'utf8'
  ));
  lastGoodCount = state.last_good_count;
} catch (e) { /* no state file yet — first run */ }

const articles = db.prepare('SELECT * FROM news_articles ORDER BY id').all();
const errors = [];
const warnings = [];

// ── 1. Invalid tabs ────────────────────────────────────────────────────────
const badTabs = articles.filter(a => !VALID_TABS.includes(a.tab));
if (badTabs.length > 0) {
  for (const a of badTabs) {
    errors.push(`INVALID TAB "${a.tab}" on id=${a.id}: ${a.headline?.slice(0,70)}`);
  }
}

// ── 2. Empty URLs ──────────────────────────────────────────────────────────
const emptyUrl = articles.filter(a => 
  (!a.url || a.url.trim() === '') && !NO_URL_OK_SOURCES.includes(a.source)
);
if (emptyUrl.length > 0) {
  for (const a of emptyUrl) {
    warnings.push(`EMPTY URL on id=${a.id} (${a.source}): ${a.headline?.slice(0,70)}`);
  }
}

// ── 3. Truncated numbers (headline vs URL mismatch) ────────────────────────
// Extract all 3+ digit numbers from URL, check they appear in headline
// Handles cases like URL has "768" but headline says "68"
for (const a of articles) {
  if (!a.url || !a.headline) continue;
  // Extract numbers from URL path (ignore query params and common IDs)
  // Check for truncated numbers: look for 2-4 digit numbers in the URL title slug
  // that look like dollar amounts or MW values but are missing from the headline.
  // We extract numbers from the human-readable URL slug (last path segment with words),
  // skipping pure numeric article IDs (5+ digits like 816806).
  const urlPath = a.url.split('?')[0];
  const lastSeg = urlPath.split('/').filter(Boolean).pop() || '';
  // Only process segments that contain words (not pure ID segments)
  if (/[a-z]/i.test(lastSeg)) {
    const segNumbers = [...new Set((lastSeg.match(/(?<=-)(\d{2,4})(?=-)/g) || []))];
    for (const n of segNumbers) {
      const num = parseInt(n);
      if (num >= 2020 && num <= 2030) continue; // skip years
      if (num < 50 || num > 9999) continue;     // skip tiny/huge
      if (!a.headline) continue;
      if (a.headline.includes(n)) continue;     // already in headline — OK
      warnings.push(`POSSIBLE TRUNCATION id=${a.id}: URL slug has "${n}" not in headline — "${a.headline?.slice(0,65)}"`);
    }
  }
}

// ── 4. Duplicate URLs ──────────────────────────────────────────────────────
const urlMap = new Map();
for (const a of articles) {
  if (!a.url || !a.url.trim()) continue;
  const norm = a.url.trim().toLowerCase().replace(/\/$/, '');
  if (urlMap.has(norm)) {
    errors.push(`DUPLICATE URL: id=${urlMap.get(norm)} and id=${a.id} — "${a.headline?.slice(0,60)}"`);
  } else {
    urlMap.set(norm, a.id);
  }
}

// ── 5. Near-duplicate headlines ────────────────────────────────────────────
// Flag articles in the same tab, within 60 days, where headline shares
// 3+ significant words with another article
function significantWords(text) {
  const stop = new Set(['the','a','an','and','or','for','in','of','on','at','to',
    'with','by','is','are','was','were','has','have','had','be','been',
    'its','that','this','as','from','data','center','centers','data-center']);
  return (text || '').toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3 && !stop.has(w));
}

const byTab = {};
for (const a of articles) {
  if (!byTab[a.tab]) byTab[a.tab] = [];
  byTab[a.tab].push(a);
}

for (const [tab, tabArticles] of Object.entries(byTab)) {
  for (let i = 0; i < tabArticles.length; i++) {
    const a = tabArticles[i];
    const aWords = new Set(significantWords(a.headline));
    for (let j = i + 1; j < tabArticles.length; j++) {
      const b = tabArticles[j];
      // Only compare if within 60 days of each other
      if (a.published_date && b.published_date) {
        const daysDiff = Math.abs(
          (new Date(a.published_date) - new Date(b.published_date)) / 86400000
        );
        if (daysDiff > 60) continue;
      }
      const bWords = significantWords(b.headline);
      const shared = bWords.filter(w => aWords.has(w));
      if (shared.length >= 4) {
        warnings.push(
          `NEAR-DUPE [${tab}] id=${a.id} & id=${b.id}: shared words [${shared.slice(0,5).join(', ')}]\n` +
          `  A: ${a.headline?.slice(0,65)}\n` +
          `  B: ${b.headline?.slice(0,65)}`
        );
      }
    }
  }
}

// ── 6. Article count checks ────────────────────────────────────────────────
const total = articles.length;
if (total < MIN_ARTICLE_COUNT) {
  errors.push(`ARTICLE COUNT TOO LOW: ${total} articles (minimum ${MIN_ARTICLE_COUNT}) — possible mass deletion`);
}
if (lastGoodCount !== null && (lastGoodCount - total) > MAX_DROP_FROM_LAST_GOOD) {
  errors.push(`ARTICLE COUNT DROPPED: ${lastGoodCount} → ${total} (drop of ${lastGoodCount - total} exceeds max ${MAX_DROP_FROM_LAST_GOOD})`);
}

// ── 7. Tab distribution sanity ─────────────────────────────────────────────
const tabCounts = {};
for (const a of articles) tabCounts[a.tab] = (tabCounts[a.tab] || 0) + 1;
for (const [tab, count] of Object.entries(tabCounts)) {
  const pct = (count / total * 100).toFixed(0);
  if (count / total > 0.60) {
    warnings.push(`TAB IMBALANCE: "${tab}" has ${count}/${total} articles (${pct}%)`);
  }
}

// ── Report ─────────────────────────────────────────────────────────────────
const tabSummary = VALID_TABS.map(t => `${t}:${tabCounts[t]||0}`).join(' | ');
console.log(`\n╔══════════════════════════════════════════════════════╗`);
console.log(`║  NEWS VALIDATOR — ${new Date().toISOString().slice(0,10)}                       ║`);
console.log(`╚══════════════════════════════════════════════════════╝`);
console.log(`Total articles: ${total}  |  ${tabSummary}`);

if (warnings.length > 0) {
  console.log(`\n⚠️  WARNINGS (${warnings.length}) — will not block push:`);
  warnings.forEach(w => console.log('  ' + w));
}

if (errors.length > 0) {
  console.log(`\n❌ ERRORS (${errors.length}) — BLOCKING PUSH:`);
  errors.forEach(e => console.log('  ' + e));
  console.log('\nFix the above errors before pushing. Exiting with code 1.\n');
  db.close();
  process.exit(1);
}

console.log(`\n✅ Validation passed — ${errors.length} errors, ${warnings.length} warnings\n`);

// Save last good count
try {
  const fs = require('fs');
  const dir = '/home/user/workspace/dc-intel/cron_tracking';
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    dir + '/validate_state.json',
    JSON.stringify({ last_good_count: total, last_run: new Date().toISOString() }, null, 2)
  );
} catch (e) { /* non-fatal */ }

db.close();
process.exit(0);
