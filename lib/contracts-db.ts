import Database from 'better-sqlite3'
import path from 'path'

// Use the same DB as conversations/messages to keep relations simple
const dbPath = path.join(process.cwd(), 'companies.db')
const db = new Database(dbPath)

// Initialize contract events table
// One row per action (completed/cancelled); admin can mark as reviewed
// Multiple rows can exist per conversation (e.g., each party submits a cancellation reason)
db.exec(`
  CREATE TABLE IF NOT EXISTS contract_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversationId INTEGER NOT NULL,
    userId INTEGER NOT NULL,
    companyId INTEGER NOT NULL,
    action TEXT NOT NULL CHECK(action IN ('completed','cancelled')),
    reason TEXT,
    createdByType TEXT NOT NULL CHECK(createdByType IN ('user','company')),
    createdById INTEGER NOT NULL,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','reviewed')),
    FOREIGN KEY (conversationId) REFERENCES conversations(id)
  );

  CREATE INDEX IF NOT EXISTS idx_contract_events_conv ON contract_events(conversationId);
  CREATE INDEX IF NOT EXISTS idx_contract_events_status ON contract_events(status);
`)

export type ContractAction = 'completed' | 'cancelled'
export type ActorType = 'user' | 'company'
export type ReviewStatus = 'pending' | 'reviewed'

export interface ContractEvent {
  id: number
  conversationId: number
  userId: number
  companyId: number
  action: ContractAction
  reason?: string | null
  createdByType: ActorType
  createdById: number
  createdAt: string
  status: ReviewStatus
}

export function createContractEvent(payload: {
  conversationId: number
  userId: number
  companyId: number
  action: ContractAction
  reason?: string | null
  createdByType: ActorType
  createdById: number
}): ContractEvent {
  const stmt = db.prepare(`
    INSERT INTO contract_events (
      conversationId, userId, companyId, action, reason, createdByType, createdById
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `)
  const res = stmt.run(
    payload.conversationId,
    payload.userId,
    payload.companyId,
    payload.action,
    payload.reason || null,
    payload.createdByType,
    payload.createdById
  )
  return db.prepare('SELECT * FROM contract_events WHERE id = ?').get(res.lastInsertRowid as number) as ContractEvent
}

export function listContractEvents(filter?: { status?: ReviewStatus; action?: ContractAction; conversationId?: number }) {
  const conditions: string[] = []
  const args: any[] = []
  if (filter?.status) { conditions.push('status = ?'); args.push(filter.status) }
  if (filter?.action) { conditions.push('action = ?'); args.push(filter.action) }
  if (filter?.conversationId) { conditions.push('conversationId = ?'); args.push(filter.conversationId) }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
  const sql = `SELECT * FROM contract_events ${where} ORDER BY createdAt DESC, id DESC`
  return db.prepare(sql).all(...args) as ContractEvent[]
}

export function updateContractEventStatus(id: number, status: ReviewStatus) {
  const stmt = db.prepare('UPDATE contract_events SET status = ? WHERE id = ?')
  const res = stmt.run(status, id)
  return res.changes > 0
}

export function countPendingContractEvents() {
  const row = db.prepare("SELECT COUNT(*) as c FROM contract_events WHERE status = 'pending'").get() as any
  return row?.c || 0
}

export default db
