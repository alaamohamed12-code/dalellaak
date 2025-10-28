import Database from 'better-sqlite3';

const db = new Database('admin-users.db');

db.exec(`
CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  email TEXT UNIQUE,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);
`);

export default db;
