import { NextRequest, NextResponse } from 'next/server'
import { markNotificationAsRead } from '@/lib/notifications-db'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userNotificationId } = body

    if (!userNotificationId) {
      return NextResponse.json(
        { error: 'userNotificationId is required' },
        { status: 400 }
      )
    }

    markNotificationAsRead(userNotificationId)

    return NextResponse.json({
      success: true
    })
  } catch (error: any) {
    console.error('Error marking notification as read:', error)
    return NextResponse.json(
      { error: 'Failed to mark notification as read', details: error.message },
      { status: 500 }
    )
  }
}
