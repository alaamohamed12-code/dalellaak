import { NextRequest, NextResponse } from 'next/server'
import { listContractEvents, updateContractEventStatus, countPendingContractEvents } from '@/lib/contracts-db'
import Database from 'better-sqlite3'
import path from 'path'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') as 'pending' | 'reviewed' | null
    const action = searchParams.get('action') as 'completed' | 'cancelled' | null
    const conversationId = searchParams.get('conversationId')

    const events = listContractEvents({
      status: status || undefined,
      action: action || undefined,
      conversationId: conversationId ? Number(conversationId) : undefined
    })

    // Resolve usernames for context (optional)
    try {
      const usersDb = new Database(path.join(process.cwd(), 'users.db'))
      const companiesDb = new Database(path.join(process.cwd(), 'companies.db'))

      const enriched = events.map(ev => {
        const user = usersDb.prepare('SELECT id, username, firstName, lastName, email FROM users WHERE id = ?').get(ev.userId) as any
        const company = companiesDb.prepare('SELECT id, username, firstName, lastName, email FROM companies WHERE id = ?').get(ev.companyId) as any
        return {
          ...ev,
          user: user ? { id: user.id, username: user.username, name: `${user.firstName || ''} ${user.lastName || ''}`.trim(), email: user.email } : null,
          company: company ? { id: company.id, username: company.username, name: `${company.firstName || ''} ${company.lastName || ''}`.trim(), email: company.email } : null
        }
      })
      usersDb.close(); companiesDb.close()
      return NextResponse.json({ events: enriched })
    } catch {
      // Fallback without enrichment
      return NextResponse.json({ events })
    }
  } catch (e: any) {
    console.error('GET /api/admin/contracts error:', e)
    return NextResponse.json({ error: 'Failed to load contract events', details: e.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, status } = body || {}
    if (!id || !['pending','reviewed'].includes(status)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }
    const ok = updateContractEventStatus(Number(id), status)
    return NextResponse.json({ success: ok })
  } catch (e: any) {
    console.error('PATCH /api/admin/contracts error:', e)
    return NextResponse.json({ error: 'Failed to update event', details: e.message }, { status: 500 })
  }
}

export async function HEAD() {
  try {
    const c = countPendingContractEvents()
    return new NextResponse(null, { status: 200, headers: { 'x-pending-count': String(c) } })
  } catch {
    return new NextResponse(null, { status: 200, headers: { 'x-pending-count': '0' } })
  }
}
