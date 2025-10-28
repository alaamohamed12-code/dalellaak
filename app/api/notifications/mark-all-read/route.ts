import { NextRequest, NextResponse } from 'next/server'
import Database from 'better-sqlite3'
import path from 'path'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, accountType, userEmail } = body

    if (!userId || !accountType) {
      return NextResponse.json(
        { error: 'userId and accountType are required' },
        { status: 400 }
      )
    }

    const normalizedType = accountType === 'individual' ? 'user' : accountType
    const dbPath = path.join(process.cwd(), 'notifications.db')
    const db = new Database(dbPath)

    if (userEmail) {
      const stmt = db.prepare(`
        UPDATE user_notifications
        SET isRead = 1, readAt = datetime('now')
        WHERE ((userId = ? AND accountType = ?) OR userEmail = ?) AND isRead = 0
      `)
      stmt.run(userId, normalizedType, userEmail)
    } else {
      const stmt = db.prepare(`
        UPDATE user_notifications
        SET isRead = 1, readAt = datetime('now')
        WHERE userId = ? AND accountType = ? AND isRead = 0
      `)
      stmt.run(userId, normalizedType)
    }

    db.close()

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error marking all notifications as read:', error)
    return NextResponse.json(
      { error: 'Failed to mark all notifications as read', details: error.message },
      { status: 500 }
    )
  }
}
