import { NextRequest, NextResponse } from 'next/server';
import { addMessage, findOrCreateConversation, getMessages } from '../../../lib/messages-db';
import db from '../../../lib/companies-db';

// POST: start or continue a conversation and send a message
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, companyId, senderType, senderId, text, supportTicketId } = body || {};
    
    // Handle support ticket message
    if (supportTicketId) {
      if (!text || String(text).trim().length === 0) {
        return NextResponse.json({ error: 'Message text required' }, { status: 400 });
      }
      
      const ticketId = Number(supportTicketId);
      
      // Insert message
      const insertMessage = db.prepare(`
        INSERT INTO support_messages (ticketId, senderId, senderType, message)
        VALUES (?, ?, ?, ?)
      `);
      
      insertMessage.run(
        ticketId,
        senderId || null,
        senderType,
        String(text).trim()
      );
      
      // Update ticket timestamp
      db.prepare(`
        UPDATE support_tickets 
        SET updatedAt = CURRENT_TIMESTAMP, status = ?
        WHERE id = ?
      `).run(senderType === 'admin' ? 'answered' : 'open', ticketId);
      
      // Get ticket info for notification
      const ticket = db.prepare('SELECT * FROM support_tickets WHERE id = ?').get(ticketId) as any;
      
      // Create notification for the other party
      if (ticket) {
        const recipientId = senderType === 'admin' ? (ticket.userId || ticket.companyId) : null;
        const recipientType = senderType === 'admin' ? (ticket.userId ? 'user' : 'company') : 'admin';
        
        if (recipientId && recipientType !== 'admin') {
          try {
            const notifMessage = senderType === 'admin' ? 'رد جديد على تذكرة الدعم الفني' : 'رسالة جديدة من المستخدم';
            const notifMessageEn = senderType === 'admin' ? 'New reply on support ticket' : 'New message from user';
            
            const insertNotif = db.prepare(`
              INSERT INTO notifications (userId, companyId, type, message, messageEn, link, isRead, createdAt)
              VALUES (?, ?, 'support_reply', ?, ?, ?, 0, CURRENT_TIMESTAMP)
            `);
            
            insertNotif.run(
              recipientType === 'user' ? recipientId : null,
              recipientType === 'company' ? recipientId : null,
              notifMessage,
              notifMessageEn,
              `/messages`
            );
          } catch (notifError: any) {
            console.log('Notification creation failed (non-critical):', notifError.message);
          }
        }
      }
      
      return NextResponse.json({ success: true, message: 'Message sent' });
    }
    
    // Handle regular conversation message
    if (userId === undefined || companyId === undefined || (senderType !== 'user' && senderType !== 'company') || senderId === undefined || senderId === null || !text || String(text).trim().length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const conv = findOrCreateConversation(Number(userId), Number(companyId)) as any;
    const msg = addMessage(Number((conv as any).id), senderType, Number(senderId), String(text).slice(0, 5000));
    return NextResponse.json({ conversation: conv, message: msg });
  } catch (err: any) {
    return NextResponse.json({ error: 'Server error', details: String(err) }, { status: 500 });
  }
}

// GET: list messages for a conversation id or support ticket
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get('conversationId');
    const supportTicketId = searchParams.get('supportTicketId');
    
    // Get support ticket messages
    if (supportTicketId) {
      const ticketId = Number(supportTicketId);
      const ticket = db.prepare('SELECT * FROM support_tickets WHERE id = ?').get(ticketId);
      
      if (!ticket) {
        return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
      }
      
      const messages = db.prepare(`
        SELECT * FROM support_messages 
        WHERE ticketId = ? 
        ORDER BY createdAt ASC
      `).all(ticketId);
      
      return NextResponse.json({ 
        messages,
        ticket,
        type: 'support'
      });
    }
    
    // Get regular conversation messages
    if (!conversationId) {
      return NextResponse.json({ error: 'Missing conversationId or supportTicketId' }, { status: 400 });
    }
    
    const messages = getMessages(Number(conversationId));
    return NextResponse.json({ messages, type: 'conversation' });
  } catch (err: any) {
    return NextResponse.json({ error: 'Server error', details: String(err) }, { status: 500 });
  }
}
