import Database from 'better-sqlite3';

const db = new Database('companies.db');

db.exec(`
CREATE TABLE IF NOT EXISTS companies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  firstName TEXT NOT NULL,
  lastName TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  accountType TEXT DEFAULT 'company',
  image TEXT,
  taxDocs TEXT,
  sector TEXT,
  location TEXT,
  status TEXT DEFAULT 'pending',
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  subservices TEXT
);
`);

export default db;

// Ensure new columns exist (simple migrations)
try {
  const info = db.prepare("PRAGMA table_info('companies')").all() as Array<{ name: string }>;
  const hasSubservices = info.some(c => c.name === 'subservices');
  if (!hasSubservices) {
    db.exec("ALTER TABLE companies ADD COLUMN subservices TEXT");
  }
  const hasRating = info.some(c => c.name === 'rating');
  if (!hasRating) {
    db.exec("ALTER TABLE companies ADD COLUMN rating REAL DEFAULT 0");
  }
  const hasReviewCount = info.some(c => c.name === 'reviewCount');
  if (!hasReviewCount) {
    db.exec("ALTER TABLE companies ADD COLUMN reviewCount INTEGER DEFAULT 0");
  }
} catch (e) {
  // Best-effort migration; ignore if not applicable
}