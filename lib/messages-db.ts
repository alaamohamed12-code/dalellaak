import db from './companies-db';

// Initialize tables for conversations and messages
db.exec(`
CREATE TABLE IF NOT EXISTS conversations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER NOT NULL,
  companyId INTEGER NOT NULL,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(userId, companyId)
);

CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversationId INTEGER NOT NULL,
  senderType TEXT NOT NULL CHECK(senderType IN ('user','company')),
  senderId INTEGER NOT NULL,
  body TEXT NOT NULL,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  readAt TEXT
);

CREATE INDEX IF NOT EXISTS idx_conversations_user ON conversations(userId);
CREATE INDEX IF NOT EXISTS idx_conversations_company ON conversations(companyId);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversationId);
`);

export function findOrCreateConversation(userId: number, companyId: number) {
  const existing = db.prepare('SELECT * FROM conversations WHERE userId = ? AND companyId = ?').get(userId, companyId);
  if (existing) return existing;
  const result = db.prepare('INSERT INTO conversations (userId, companyId) VALUES (?, ?)').run(userId, companyId);
  return db.prepare('SELECT * FROM conversations WHERE id = ?').get(result.lastInsertRowid as number);
}

export function addMessage(conversationId: number, senderType: 'user' | 'company', senderId: number, body: string) {
  const res = db.prepare('INSERT INTO messages (conversationId, senderType, senderId, body) VALUES (?, ?, ?, ?)')
    .run(conversationId, senderType, senderId, body);
  db.prepare('UPDATE conversations SET updatedAt = CURRENT_TIMESTAMP WHERE id = ?').run(conversationId);
  return db.prepare('SELECT * FROM messages WHERE id = ?').get(res.lastInsertRowid as number);
}

export function getMessages(conversationId: number) {
  return db.prepare('SELECT * FROM messages WHERE conversationId = ? ORDER BY createdAt ASC, id ASC').all(conversationId);
}

export function getConversationsForUser(userId: number) {
  return db.prepare(`
    SELECT c.*, 
      (SELECT body FROM messages m WHERE m.conversationId = c.id ORDER BY createdAt DESC, id DESC LIMIT 1) as lastBody,
      (SELECT createdAt FROM messages m WHERE m.conversationId = c.id ORDER BY createdAt DESC, id DESC LIMIT 1) as lastAt,
      (SELECT COUNT(*) FROM messages m WHERE m.conversationId = c.id AND m.readAt IS NULL AND m.senderType != 'user') as unreadCount
    FROM conversations c
    WHERE c.userId = ?
    ORDER BY COALESCE(lastAt, c.updatedAt) DESC
  `).all(userId);
}

export function getConversationsForCompany(companyId: number) {
  return db.prepare(`
    SELECT c.*, 
      (SELECT body FROM messages m WHERE m.conversationId = c.id ORDER BY createdAt DESC, id DESC LIMIT 1) as lastBody,
      (SELECT createdAt FROM messages m WHERE m.conversationId = c.id ORDER BY createdAt DESC, id DESC LIMIT 1) as lastAt,
      (SELECT COUNT(*) FROM messages m WHERE m.conversationId = c.id AND m.readAt IS NULL AND m.senderType != 'company') as unreadCount
    FROM conversations c
    WHERE c.companyId = ?
    ORDER BY COALESCE(lastAt, c.updatedAt) DESC
  `).all(companyId);
}

export function markMessagesAsRead(conversationId: number, userType: 'user' | 'company') {
  // Mark messages as read for the current user (mark messages from the OTHER party as read)
  const otherSenderType = userType === 'user' ? 'company' : 'user';
  const stmt = db.prepare('UPDATE messages SET readAt = CURRENT_TIMESTAMP WHERE conversationId = ? AND senderType = ? AND readAt IS NULL');
  return stmt.run(conversationId, otherSenderType);
}
