import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'companies.db');

export async function PUT(
  req: NextRequest, 
  { params }: { params: { key: string; subkey: string } }
) {
  try {
    const { key: serviceKey, subkey } = params;
    const body = await req.json();
    const { 
      title_ar, 
      title_en, 
      icon, 
      description_ar, 
      description_en, 
      display_order,
      is_active
    } = body;

    const db = new Database(dbPath);
    
    const update = db.prepare(`
      UPDATE subservices 
      SET title_ar = ?, 
          title_en = ?, 
          icon = ?, 
          description_ar = ?, 
          description_en = ?, 
          display_order = ?,
          is_active = ?,
          updated_at = datetime('now')
      WHERE service_key = ? AND key = ?
    `);

    const result = update.run(
      title_ar,
      title_en,
      icon,
      description_ar,
      description_en,
      display_order,
      is_active !== undefined ? (is_active ? 1 : 0) : 1,
      serviceKey,
      subkey
    );

    db.close();

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Subservice not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating subservice:', error);
    return NextResponse.json({ error: 'Failed to update subservice' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest, 
  { params }: { params: { key: string; subkey: string } }
) {
  try {
    const { key: serviceKey, subkey } = params;
    const db = new Database(dbPath);
    
    const deleteStmt = db.prepare('DELETE FROM subservices WHERE service_key = ? AND key = ?');
    const result = deleteStmt.run(serviceKey, subkey);

    db.close();

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Subservice not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting subservice:', error);
    return NextResponse.json({ error: 'Failed to delete subservice' }, { status: 500 });
  }
}
