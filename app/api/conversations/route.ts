import { NextRequest, NextResponse } from 'next/server';
import { getConversationsForCompany, getConversationsForUser } from '../../../lib/messages-db';
import db from '../../../lib/companies-db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const companyId = searchParams.get('companyId');
    if (!userId && !companyId) return NextResponse.json({ error: 'Provide userId or companyId' }, { status: 400 });
    
    let conversations: any[] = [];
    let supportTickets: any[] = [];
    
    if (userId) {
      // Get regular conversations
      conversations = getConversationsForUser(Number(userId));
      
      // Get support tickets for this user (try-catch to prevent errors if table doesn't exist)
      try {
        supportTickets = db.prepare(`
          SELECT 
            t.*,
            (SELECT message FROM support_messages m WHERE m.ticketId = t.id ORDER BY createdAt DESC LIMIT 1) as lastBody,
            (SELECT createdAt FROM support_messages m WHERE m.ticketId = t.id ORDER BY createdAt DESC LIMIT 1) as lastMessageAt,
            (
              SELECT COUNT(*)
              FROM support_messages m
              WHERE m.ticketId = t.id
              AND m.senderType = 'admin'
              AND m.createdAt > COALESCE(t.lastReadAt, '1970-01-01')
            ) as unreadCount
          FROM support_tickets t
          WHERE t.userId = ?
          ORDER BY COALESCE(lastMessageAt, t.updatedAt, t.createdAt) DESC
        `).all(Number(userId));
      } catch (supportError) {
        // Support tickets table doesn't exist yet, or query failed
        console.log('Support tickets query failed (table may not exist):', supportError);
        supportTickets = [];
      }
      
      // Transform support tickets to look like conversations
      const supportConversations = supportTickets.map(ticket => ({
        id: `support-${ticket.id}`,
        type: 'support',
        supportTicketId: ticket.id,
        userId: ticket.userId,
        companyId: null,
        subject: ticket.subject,
        status: ticket.status,
        lastBody: ticket.lastBody || ticket.message,
        lastAt: ticket.lastMessageAt || ticket.updatedAt || ticket.createdAt,
        unreadCount: ticket.unreadCount || 0,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt
      }));
      
      // Mark regular conversations as type 'conversation'
      conversations = conversations.map((c: any) => ({ ...c, type: 'conversation' }));
      
      // Combine both arrays
      const allConversations = [...conversations, ...supportConversations];
      
      // Sort by lastAt
      allConversations.sort((a, b) => {
        const dateA = new Date(a.lastAt || a.updatedAt || a.createdAt).getTime();
        const dateB = new Date(b.lastAt || b.updatedAt || b.createdAt).getTime();
        return dateB - dateA;
      });
      
      return NextResponse.json({ conversations: allConversations });
    }
    
    // For company, just return regular conversations (companies don't use support tickets)
    conversations = getConversationsForCompany(Number(companyId));
    conversations = conversations.map((c: any) => ({ ...c, type: 'conversation' }));
    return NextResponse.json({ conversations });
  } catch (err: any) {
    return NextResponse.json({ error: 'Server error', details: String(err) }, { status: 500 });
  }
}
