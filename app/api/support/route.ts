import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'site-settings.db');

// GET - Get all support tickets for user/company or all for admin
export async function GET(req: NextRequest) {
  try {
    const db = new Database(dbPath);
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const companyId = searchParams.get('companyId');
    const adminView = searchParams.get('admin') === 'true';
    const status = searchParams.get('status');

    let query = `
      SELECT t.*, 
             COUNT(m.id) as messageCount,
             MAX(m.createdAt) as lastMessageAt,
             (
               SELECT COUNT(*)
               FROM support_messages m2
               WHERE m2.ticketId = t.id
               AND m2.senderType = 'admin'
               AND (t.lastReadAt IS NULL OR m2.createdAt > t.lastReadAt)
             ) as unreadCount
      FROM support_tickets t
      LEFT JOIN support_messages m ON t.id = m.ticketId
    `;

    const conditions = [];
    const params: any = {};

    if (userId && !adminView) {
      conditions.push('t.userId = @userId');
      params.userId = userId;
    }

    if (companyId && !adminView) {
      conditions.push('t.companyId = @companyId');
      params.companyId = companyId;
    }

    if (status) {
      conditions.push('t.status = @status');
      params.status = status;
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' GROUP BY t.id ORDER BY t.updatedAt DESC';

    const stmt = db.prepare(query);
    const tickets = stmt.all(params) as any[];

    // Debug log for first ticket
    if (tickets.length > 0) {
      console.log('First ticket debug:', {
        id: tickets[0].id,
        lastReadAt: tickets[0].lastReadAt,
        unreadCount: tickets[0].unreadCount,
        messageCount: tickets[0].messageCount
      });
    }

    db.close();
    return NextResponse.json({ tickets });
  } catch (error: any) {
    console.error('Error fetching support tickets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch support tickets' },
      { status: 500 }
    );
  }
}

// POST - Create new support ticket
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, companyId, subject, message } = body;

    console.log('Received support ticket request:', { userId, companyId, subject: subject?.substring(0, 30), message: message?.substring(0, 30) });

    if (!subject || !message) {
      console.log('Validation failed: missing subject or message');
      return NextResponse.json(
        { error: 'Subject and message are required' },
        { status: 400 }
      );
    }

    if (!userId && !companyId) {
      console.log('Validation failed: no userId or companyId');
      return NextResponse.json(
        { error: 'Either userId or companyId is required' },
        { status: 400 }
      );
    }

    const db = new Database(dbPath);

    try {
      // Create ticket - disable foreign key checks temporarily
      db.exec('PRAGMA foreign_keys = OFF');

      const insertTicket = db.prepare(`
        INSERT INTO support_tickets (userId, companyId, subject, message, status)
        VALUES (?, ?, ?, ?, 'open')
      `);

      const result = insertTicket.run(
        userId || null,
        companyId || null,
        subject,
        message
      );

      const ticketId = result.lastInsertRowid;
      console.log('Ticket created with ID:', ticketId);

      // Add initial message
      const insertMessage = db.prepare(`
        INSERT INTO support_messages (ticketId, senderId, senderType, message)
        VALUES (?, ?, ?, ?)
      `);

      insertMessage.run(
        ticketId,
        userId || companyId || null,
        userId ? 'user' : 'company',
        message
      );

      console.log('Initial message added');

      // Re-enable foreign keys
      db.exec('PRAGMA foreign_keys = ON');

      db.close();

      return NextResponse.json({ 
        success: true, 
        ticketId: Number(ticketId),
        message: 'Support ticket created successfully' 
      }, { status: 201 });
    } catch (dbError: any) {
      console.error('Database error:', dbError);
      db.close();
      return NextResponse.json(
        { error: 'Database error: ' + dbError.message },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error creating support ticket:', error);
    return NextResponse.json(
      { error: 'Failed to create support ticket: ' + error.message },
      { status: 500 }
    );
  }
}
