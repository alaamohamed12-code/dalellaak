import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'site-settings.db');

// GET - Get ticket details with all messages
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = new Database(dbPath);
    const ticketId = params.id;

    // Get ticket details
    const ticketStmt = db.prepare(`
      SELECT * FROM support_tickets WHERE id = ?
    `);
    const ticket = ticketStmt.get(ticketId);

    if (!ticket) {
      db.close();
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    // Get all messages for this ticket
    const messagesStmt = db.prepare(`
      SELECT * FROM support_messages 
      WHERE ticketId = ? 
      ORDER BY createdAt ASC
    `);
    const messages = messagesStmt.all(ticketId);

    db.close();

    return NextResponse.json({ 
      ticket,
      messages 
    });
  } catch (error: any) {
    console.error('Error fetching ticket details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ticket details' },
      { status: 500 }
    );
  }
}

// PUT - Update ticket status or add reply
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const ticketId = params.id;
    const { status, message, senderId, senderType } = body;

    console.log('PUT /api/support/[id] - Request:', {
      ticketId,
      status,
      hasMessa: !!message,
      senderType
    });

    const db = new Database(dbPath);

    try {
      // Disable foreign keys temporarily
      db.exec('PRAGMA foreign_keys = OFF');

      // Get ticket details to find the recipient
      const ticketStmt = db.prepare(`SELECT * FROM support_tickets WHERE id = ?`);
      const ticket: any = ticketStmt.get(ticketId);

      if (!ticket) {
        console.error('Ticket not found:', ticketId);
        db.close();
        return NextResponse.json(
          { error: 'Ticket not found' },
          { status: 404 }
        );
      }

      console.log('Ticket found:', { id: ticket.id, status: ticket.status });

      // Update ticket status if provided
      if (status) {
        const updateStmt = db.prepare(`
          UPDATE support_tickets 
          SET status = ?, updatedAt = CURRENT_TIMESTAMP 
          WHERE id = ?
        `);
        updateStmt.run(status, ticketId);
        console.log('Status updated to:', status);
      }

      // Add reply message if provided
      if (message && senderType) {
        const insertMessage = db.prepare(`
          INSERT INTO support_messages (ticketId, senderId, senderType, message)
          VALUES (?, ?, ?, ?)
        `);

        const result = insertMessage.run(
          ticketId,
          senderId || null,
          senderType,
          message
        );

        console.log('✅ Admin reply added:', {
          ticketId,
          senderType,
          messageId: result.lastInsertRowid,
          timestamp: new Date().toISOString()
        });

        // Update ticket updatedAt to show in conversations list
        const updateTime = db.prepare(`
          UPDATE support_tickets 
          SET updatedAt = CURRENT_TIMESTAMP 
          WHERE id = ?
        `);
        updateTime.run(ticketId);
      }

      // Re-enable foreign keys
      db.exec('PRAGMA foreign_keys = ON');

      db.close();

      return NextResponse.json({ 
        success: true,
        message: 'Ticket updated successfully' 
      });
    } catch (dbError: any) {
      console.error('❌ Database error in PUT:', dbError);
      db.close();
      return NextResponse.json(
        { error: 'Database error: ' + dbError.message },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('❌ Error updating ticket:', error);
    return NextResponse.json(
      { error: 'Failed to update ticket: ' + error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete ticket (admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = new Database(dbPath);
    const ticketId = params.id;

    const deleteStmt = db.prepare(`DELETE FROM support_tickets WHERE id = ?`);
    deleteStmt.run(ticketId);

    db.close();

    return NextResponse.json({ 
      success: true,
      message: 'Ticket deleted successfully' 
    });
  } catch (error: any) {
    console.error('Error deleting ticket:', error);
    return NextResponse.json(
      { error: 'Failed to delete ticket' },
      { status: 500 }
    );
  }
}
