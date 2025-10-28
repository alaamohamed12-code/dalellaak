import Database from 'better-sqlite3';

const db = new Database('company-works.db');

db.exec(`
CREATE TABLE IF NOT EXISTS works (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  companyId INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  media TEXT, -- JSON array of file names
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);
`);


export function getCompanyWorks(companyId: number) {
  return db.prepare('SELECT * FROM works WHERE companyId = ? ORDER BY createdAt DESC').all(companyId);
}

export default db;
