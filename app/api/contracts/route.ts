import { NextRequest, NextResponse } from 'next/server'
import { createContractEvent, ContractAction } from '@/lib/contracts-db'
import Database from 'better-sqlite3'
import path from 'path'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      conversationId,
      userId,
      companyId,
      action,
      reason,
      createdByType,
      createdById
    } = body || {}

    if (!conversationId || !userId || !companyId || !action || !createdByType || !createdById) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!['completed','cancelled'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
    if (!['user','company'].includes(createdByType)) {
      return NextResponse.json({ error: 'Invalid createdByType' }, { status: 400 })
    }

    const event = createContractEvent({
      conversationId: Number(conversationId),
      userId: Number(userId),
      companyId: Number(companyId),
      action: action as ContractAction,
      reason: action === 'cancelled' ? String(reason || '').slice(0, 2000) : null,
      createdByType: createdByType,
      createdById: Number(createdById)
    })

    // Optional: also create a general notification for both parties
    // so they can see a banner in notifications page.
    try {
      const notificationsDbPath = path.join(process.cwd(), 'notifications.db')
      const ndb = new Database(notificationsDbPath)
      const message = action === 'completed'
        ? `تم الإبلاغ عن إتمام التعاقد للمحادثة رقم ${conversationId}.`
        : `تم الإبلاغ عن إلغاء التعاقد للمحادثة رقم ${conversationId}${reason ? ' - السبب: ' + String(reason).slice(0, 140) : ''}`
      const notifStmt = ndb.prepare(`INSERT INTO notifications (message, target, createdBy) VALUES (?, 'custom', 'system')`)
      const notifRes: any = notifStmt.run(message)
      const assignStmt = ndb.prepare(`INSERT INTO user_notifications (notificationId, userId, accountType) VALUES (?, ?, ?)`)
      // Assign to user and company involved
      assignStmt.run(notifRes.lastInsertRowid, Number(userId), 'user')
      assignStmt.run(notifRes.lastInsertRowid, Number(companyId), 'company')
      ndb.close()
    } catch (e) {
      console.warn('Failed to create user/company notifications for contract event:', e)
    }

    return NextResponse.json({ success: true, event })
  } catch (error: any) {
    console.error('Error creating contract event:', error)
    return NextResponse.json({ error: 'Server error', details: String(error?.message || error) }, { status: 500 })
  }
}
