const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'site-settings.db');
const db = new Database(dbPath);

console.log('📋 Creating support tickets table...');

// Create support_tickets table
db.exec(`
  CREATE TABLE IF NOT EXISTS support_tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    companyId INTEGER,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'open',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id),
    FOREIGN KEY (companyId) REFERENCES companies(id)
  )
`);

console.log('✅ Support tickets table created successfully!');

// Create support_messages table for replies
db.exec(`
  CREATE TABLE IF NOT EXISTS support_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticketId INTEGER NOT NULL,
    senderId INTEGER,
    senderType TEXT NOT NULL,
    message TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticketId) REFERENCES support_tickets(id) ON DELETE CASCADE
  )
`);

console.log('✅ Support messages table created successfully!');

db.close();
console.log('🎉 Database setup complete!');
