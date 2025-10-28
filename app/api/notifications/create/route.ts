import { NextRequest, NextResponse } from 'next/server'
import { createNotification, assignNotificationToUsers } from '@/lib/notifications-db'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { message, target, targetEmail, createdBy } = body

    console.log('Creating notification:', { message, target, targetEmail, createdBy })

    if (!message || !target) {
      return NextResponse.json(
        { error: 'Message and target are required' },
        { status: 400 }
      )
    }

    if (target === 'custom' && !targetEmail) {
      return NextResponse.json(
        { error: 'Target email is required for custom notifications' },
        { status: 400 }
      )
    }

    // Create notification
    const notification = createNotification(message, target, targetEmail, createdBy)
    console.log('Notification created:', notification)

    // Assign to users based on target
    const assignedCount = assignNotificationToUsers(notification.id, target, targetEmail)
    console.log('Assigned to', assignedCount, 'recipients')

    return NextResponse.json({
      success: true,
      notification,
      assignedCount
    })
  } catch (error: any) {
    console.error('Error creating notification:', error)
    return NextResponse.json(
      { error: 'Failed to create notification', details: error.message },
      { status: 500 }
    )
  }
}
