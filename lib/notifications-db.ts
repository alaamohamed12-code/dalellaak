import Database from 'better-sqlite3'
import path from 'path'

const dbPath = path.join(process.cwd(), 'notifications.db')
const db = new Database(dbPath)

// Create notifications table
db.exec(`
  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message TEXT NOT NULL,
    target TEXT NOT NULL,
    targetEmail TEXT,
    createdAt TEXT DEFAULT (datetime('now')),
    createdBy TEXT
  )
`)

// Create user notifications tracking table (to track read status)
db.exec(`
  CREATE TABLE IF NOT EXISTS user_notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    notificationId INTEGER NOT NULL,
    userId INTEGER,
    userEmail TEXT,
    accountType TEXT,
    isRead INTEGER DEFAULT 0,
    readAt TEXT,
    FOREIGN KEY (notificationId) REFERENCES notifications(id)
  )
`)

export interface Notification {
  id: number
  message: string
  target: string
  targetEmail?: string
  createdAt: string
  createdBy?: string
}

export interface UserNotification {
  id: number
  notificationId: number
  userId?: number
  userEmail?: string
  accountType?: string
  isRead: number
  readAt?: string
  notification?: Notification
}

// Create a new notification
export function createNotification(
  message: string,
  target: 'all' | 'users' | 'companies' | 'custom',
  targetEmail?: string,
  createdBy?: string
): Notification {
  const stmt = db.prepare(`
    INSERT INTO notifications (message, target, targetEmail, createdBy)
    VALUES (?, ?, ?, ?)
  `)
  const result = stmt.run(message, target, targetEmail || null, createdBy || null)
  return {
    id: result.lastInsertRowid as number,
    message,
    target,
    targetEmail,
    createdAt: new Date().toISOString(),
    createdBy
  }
}

// Get notifications for a specific user
export function getUserNotifications(userId: number, accountType: string, userEmail?: string): UserNotification[] {
  const normalizedType = accountType === 'individual' ? 'user' : accountType
  console.log('getUserNotifications called with:', { userId, accountType, normalizedType, userEmail })

  let rows: any[] = []
  if (userEmail) {
    const stmt = db.prepare(`
      SELECT 
        un.id,
        un.notificationId,
        un.userId,
        un.userEmail,
        un.accountType,
        un.isRead,
        un.readAt,
        n.id as nId,
        n.message,
        n.target,
        n.targetEmail,
        n.createdAt,
        n.createdBy
      FROM user_notifications un
      JOIN notifications n ON un.notificationId = n.id
      WHERE (un.userId = ? AND un.accountType = ?) OR un.userEmail = ?
      ORDER BY n.createdAt DESC
    `)
    rows = stmt.all(userId, normalizedType, userEmail) as any[]
  } else {
    const stmt = db.prepare(`
      SELECT 
        un.id,
        un.notificationId,
        un.userId,
        un.userEmail,
        un.accountType,
        un.isRead,
        un.readAt,
        n.id as nId,
        n.message,
        n.target,
        n.targetEmail,
        n.createdAt,
        n.createdBy
      FROM user_notifications un
      JOIN notifications n ON un.notificationId = n.id
      WHERE (un.userId = ? AND un.accountType = ?)
      ORDER BY n.createdAt DESC
    `)
    rows = stmt.all(userId, normalizedType) as any[]
  }
  console.log('Found rows:', rows.length)

  return rows.map(row => ({
    id: row.id,
    notificationId: row.notificationId,
    userId: row.userId,
    userEmail: row.userEmail,
    accountType: row.accountType,
    isRead: row.isRead,
    readAt: row.readAt,
    notification: {
      id: row.nId,
      message: row.message,
      target: row.target,
      targetEmail: row.targetEmail,
      createdAt: row.createdAt,
      createdBy: row.createdBy
    }
  }))
}

// Assign notification to users based on target
export function assignNotificationToUsers(notificationId: number, target: string, targetEmail?: string) {
  try {
    // Import users and companies from their respective databases
    const usersDbPath = path.join(process.cwd(), 'users.db')
    const companiesDbPath = path.join(process.cwd(), 'companies.db')
    
    console.log('Opening databases:', { usersDbPath, companiesDbPath })
    
    const usersDb = new Database(usersDbPath)
    const companiesDb = new Database(companiesDbPath)
    
    const insertStmt = db.prepare(`
      INSERT INTO user_notifications (notificationId, userId, userEmail, accountType)
      VALUES (?, ?, ?, ?)
    `)
    
    let assignedCount = 0
    
    if (target === 'all' || target === 'users') {
      // Get all users
      try {
        const users = usersDb.prepare('SELECT id, email FROM users').all() as any[]
        console.log(`Found ${users.length} users`)
        users.forEach(user => {
          try {
            // Normalize to 'user' for individuals
            insertStmt.run(notificationId, user.id, user.email, 'user')
            assignedCount++
          } catch (e) {
            console.error('Error inserting notification for user:', user.id, e)
          }
        })
      } catch (e) {
        console.error('Error fetching users:', e)
      }
    }
    
    if (target === 'all' || target === 'companies') {
      // Get all companies
      try {
        const companies = companiesDb.prepare('SELECT id, email FROM companies').all() as any[]
        console.log(`Found ${companies.length} companies`)
        companies.forEach(company => {
          try {
            // Keep 'company' for companies
            insertStmt.run(notificationId, company.id, company.email, 'company')
            assignedCount++
          } catch (e) {
            console.error('Error inserting notification for company:', company.id, e)
          }
        })
      } catch (e) {
        console.error('Error fetching companies:', e)
      }
    }
    
    if (target === 'custom' && targetEmail) {
      // Find user or company by email
      try {
      const user = usersDb.prepare('SELECT id, email FROM users WHERE email = ?').get(targetEmail) as any
        if (user) {
        insertStmt.run(notificationId, user.id, user.email, 'user')
          assignedCount++
          console.log('Assigned to user:', user.email)
        }
      } catch (e) {
        console.error('Error finding user by email:', e)
      }
      
      try {
        const company = companiesDb.prepare('SELECT id, email FROM companies WHERE email = ?').get(targetEmail) as any
        if (company) {
          insertStmt.run(notificationId, company.id, company.email, 'company')
          assignedCount++
          console.log('Assigned to company:', company.email)
        }
      } catch (e) {
        console.error('Error finding company by email:', e)
      }
    }
    
    console.log(`Assigned notification ${notificationId} to ${assignedCount} recipients`)
    
    usersDb.close()
    companiesDb.close()
    
    return assignedCount
  } catch (error) {
    console.error('Error in assignNotificationToUsers:', error)
    throw error
  }
}

// Mark notification as read
export function markNotificationAsRead(userNotificationId: number) {
  const stmt = db.prepare(`
    UPDATE user_notifications
    SET isRead = 1, readAt = datetime('now')
    WHERE id = ?
  `)
  stmt.run(userNotificationId)
}

// Get unread count for a user
export function getUnreadCount(userId: number, accountType: string, userEmail?: string): number {
  const normalizedType = accountType === 'individual' ? 'user' : accountType
  if (userEmail) {
    const stmt = db.prepare(`
      SELECT COUNT(*) as count
      FROM user_notifications
      WHERE ((userId = ? AND accountType = ?) OR userEmail = ?) AND isRead = 0
    `)
    const result = stmt.get(userId, normalizedType, userEmail) as any
    return result?.count || 0
  } else {
    const stmt = db.prepare(`
      SELECT COUNT(*) as count
      FROM user_notifications
      WHERE (userId = ? AND accountType = ?) AND isRead = 0
    `)
    const result = stmt.get(userId, normalizedType) as any
    return result?.count || 0
  }
}

// Get all notifications (for admin)
export function getAllNotifications(): Notification[] {
  const stmt = db.prepare(`
    SELECT * FROM notifications
    ORDER BY createdAt DESC
  `)
  return stmt.all() as Notification[]
}

export default db
