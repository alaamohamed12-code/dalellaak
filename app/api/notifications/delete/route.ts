import { NextRequest, NextResponse } from 'next/server'
import Database from 'better-sqlite3'
import path from 'path'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userNotificationIds } = body

    if (!userNotificationIds || !Array.isArray(userNotificationIds) || userNotificationIds.length === 0) {
      return NextResponse.json(
        { error: 'userNotificationIds array is required' },
        { status: 400 }
      )
    }

    const dbPath = path.join(process.cwd(), 'notifications.db')
    const db = new Database(dbPath)

    const placeholders = userNotificationIds.map(() => '?').join(',')
    const stmt = db.prepare(`
      DELETE FROM user_notifications
      WHERE id IN (${placeholders})
    `)
    stmt.run(...userNotificationIds)

    db.close()

    return NextResponse.json({ success: true, deleted: userNotificationIds.length })
  } catch (error: any) {
    console.error('Error deleting notifications:', error)
    return NextResponse.json(
      { error: 'Failed to delete notifications', details: error.message },
      { status: 500 }
    )
  }
}
