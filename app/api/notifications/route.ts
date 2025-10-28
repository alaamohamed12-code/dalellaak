import { NextRequest, NextResponse } from 'next/server'
import { getUserNotifications, getUnreadCount } from '@/lib/notifications-db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const accountType = searchParams.get('accountType')
  const userEmail = searchParams.get('email') || undefined
    const onlyCount = searchParams.get('onlyCount') === 'true'

    console.log('Fetching notifications for:', { userId, accountType, userEmail, onlyCount })

    if (!userId || !accountType) {
      return NextResponse.json(
        { error: 'userId and accountType are required' },
        { status: 400 }
      )
    }

    if (onlyCount) {
      const count = getUnreadCount(parseInt(userId), accountType, userEmail)
      console.log('Unread count:', count)
      return NextResponse.json({ unreadCount: count })
    }

    const notifications = getUserNotifications(parseInt(userId), accountType, userEmail)
    const unreadCount = getUnreadCount(parseInt(userId), accountType, userEmail)
    
    console.log('Found notifications:', notifications.length, 'unread:', unreadCount)

    return NextResponse.json({
      notifications,
      unreadCount
    })
  } catch (error: any) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications', details: error.message },
      { status: 500 }
    )
  }
}
