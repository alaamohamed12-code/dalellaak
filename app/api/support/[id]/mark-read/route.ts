import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'site-settings.db');

// POST - Mark ticket as read by user
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const ticketId = params.id;
    const { userId } = body;

    const db = new Database(dbPath);

    try {
      // Update lastReadAt timestamp
      const updateStmt = db.prepare(`
        UPDATE support_tickets 
        SET lastReadAt = CURRENT_TIMESTAMP 
        WHERE id = ?
      `);
      const result = updateStmt.run(ticketId);

      console.log('Mark as read:', {
        ticketId,
        changes: result.changes,
        timestamp: new Date().toISOString()
      });

      db.close();

      return NextResponse.json({ 
        success: true,
        message: 'Ticket marked as read' 
      });
    } catch (dbError: any) {
      console.error('Database error:', dbError);
      db.close();
      return NextResponse.json(
        { error: 'Database error: ' + dbError.message },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error marking ticket as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark ticket as read: ' + error.message },
      { status: 500 }
    );
  }
}
