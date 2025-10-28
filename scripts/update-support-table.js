const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'site-settings.db');
const db = new Database(dbPath);

console.log('Adding unreadCount and lastReadAt columns to support_tickets...');

try {
  // Check if columns already exist
  const tableInfo = db.prepare("PRAGMA table_info(support_tickets)").all();
  const hasUnreadCount = tableInfo.some(col => col.name === 'unreadCount');
  const hasLastReadAt = tableInfo.some(col => col.name === 'lastReadAt');
  
  if (!hasUnreadCount) {
    db.exec(`
      ALTER TABLE support_tickets 
      ADD COLUMN unreadCount INTEGER DEFAULT 0
    `);
    console.log('✅ Added unreadCount column');
  } else {
    console.log('ℹ️ unreadCount column already exists');
  }
  
  if (!hasLastReadAt) {
    db.exec(`
      ALTER TABLE support_tickets 
      ADD COLUMN lastReadAt DATETIME
    `);
    console.log('✅ Added lastReadAt column');
  } else {
    console.log('ℹ️ lastReadAt column already exists');
  }
  
  console.log('✅ Support tickets table updated successfully!');
} catch (error) {
  console.error('❌ Error updating table:', error.message);
  process.exit(1);
}

db.close();
