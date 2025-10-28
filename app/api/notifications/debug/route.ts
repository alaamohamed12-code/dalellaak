import { NextResponse } from 'next/server'
import { getAllNotifications } from '@/lib/notifications-db'
import Database from 'better-sqlite3'
import path from 'path'

export async function GET() {
  try {
    // Get all notifications
    const allNotifications = getAllNotifications()
    
    // Get all user_notifications
    const dbPath = path.join(process.cwd(), 'notifications.db')
    const db = new Database(dbPath)
    const userNotifications = db.prepare('SELECT * FROM user_notifications ORDER BY id DESC').all()
    
    // Get stats
    const notificationCount = db.prepare('SELECT COUNT(*) as count FROM notifications').get() as any
    const userNotificationCount = db.prepare('SELECT COUNT(*) as count FROM user_notifications').get() as any
    const unreadCount = db.prepare('SELECT COUNT(*) as count FROM user_notifications WHERE isRead = 0').get() as any
    
    db.close()
    
    return NextResponse.json({
      success: true,
      stats: {
        totalNotifications: notificationCount.count,
        totalUserNotifications: userNotificationCount.count,
        totalUnread: unreadCount.count
      },
      notifications: allNotifications,
      userNotifications: userNotifications
    })
  } catch (error: any) {
    console.error('Error in debug endpoint:', error)
    return NextResponse.json(
      { error: 'Failed to fetch debug info', details: error.message },
      { status: 500 }
    )
  }
}
