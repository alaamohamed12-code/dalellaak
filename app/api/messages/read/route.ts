import { NextRequest, NextResponse } from 'next/server';
import { markMessagesAsRead } from '../../../../lib/messages-db';
import db from '../../../../lib/companies-db';

// PATCH: mark messages as read in a conversation or support ticket
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { conversationId, supportTicketId, userType, userId } = body || {};
    
    // Handle support ticket read marking
    if (supportTicketId) {
      if (!userId) {
        return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
      }
      
      db.prepare(`
        UPDATE support_tickets 
        SET lastReadAt = CURRENT_TIMESTAMP 
        WHERE id = ? AND userId = ?
      `).run(Number(supportTicketId), Number(userId));
      
      return NextResponse.json({ success: true });
    }
    
    // Handle regular conversation read marking
    if (!conversationId || (userType !== 'user' && userType !== 'company')) {
      return NextResponse.json({ error: 'Missing conversationId or invalid userType' }, { status: 400 });
    }
    const result = markMessagesAsRead(Number(conversationId), userType);
    return NextResponse.json({ success: true, markedAsRead: result.changes });
  } catch (err: any) {
    return NextResponse.json({ error: 'Server error', details: String(err) }, { status: 500 });
  }
}