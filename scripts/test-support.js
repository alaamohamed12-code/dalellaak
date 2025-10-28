const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'site-settings.db');
const db = new Database(dbPath);

console.log('Testing support ticket creation...\n');

try {
  // Disable foreign keys
  db.exec('PRAGMA foreign_keys = OFF');
  
  // Test insert
  const insertTicket = db.prepare(`
    INSERT INTO support_tickets (userId, companyId, subject, message, status)
    VALUES (?, ?, ?, ?, 'open')
  `);

  const result = insertTicket.run(1, null, 'Test Subject', 'Test Message');
  const ticketId = result.lastInsertRowid;
  
  console.log('✅ Ticket created successfully with ID:', ticketId);

  // Add initial message
  const insertMessage = db.prepare(`
    INSERT INTO support_messages (ticketId, senderId, senderType, message)
    VALUES (?, ?, ?, ?)
  `);

  insertMessage.run(ticketId, 1, 'user', 'Test Message');
  console.log('✅ Initial message added');

  // Re-enable foreign keys
  db.exec('PRAGMA foreign_keys = ON');

  // Verify data
  const ticket = db.prepare('SELECT * FROM support_tickets WHERE id = ?').get(ticketId);
  console.log('\nCreated ticket:', ticket);

  const messages = db.prepare('SELECT * FROM support_messages WHERE ticketId = ?').all(ticketId);
  console.log('Messages:', messages);

  // Clean up test data
  db.exec('PRAGMA foreign_keys = OFF');
  db.prepare('DELETE FROM support_messages WHERE ticketId = ?').run(ticketId);
  db.prepare('DELETE FROM support_tickets WHERE id = ?').run(ticketId);
  db.exec('PRAGMA foreign_keys = ON');
  console.log('\n✅ Test data cleaned up');

} catch (error) {
  console.error('❌ Error:', error.message);
} finally {
  db.close();
}

console.log('\n✅ Test completed!');
