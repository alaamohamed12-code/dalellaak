import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'companies.db');

export async function PUT(req: NextRequest, { params }: { params: { key: string } }) {
  try {
    const serviceKey = params.key;
    const body = await req.json();
    const { 
      title_ar, 
      title_en, 
      icon, 
      description_ar, 
      description_en, 
      gradient,
      display_order,
      is_active
    } = body;

    const db = new Database(dbPath);
    
    const update = db.prepare(`
      UPDATE services 
      SET title_ar = ?, 
          title_en = ?, 
          icon = ?, 
          description_ar = ?, 
          description_en = ?, 
          gradient = ?,
          display_order = ?,
          is_active = ?,
          updated_at = datetime('now')
      WHERE key = ?
    `);

    const result = update.run(
      title_ar,
      title_en,
      icon,
      description_ar,
      description_en,
      gradient,
      display_order,
      is_active !== undefined ? (is_active ? 1 : 0) : 1,
      serviceKey
    );

    db.close();

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating service:', error);
    return NextResponse.json({ error: 'Failed to update service' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { key: string } }) {
  try {
    const serviceKey = params.key;
    const db = new Database(dbPath);
    
    // Delete service (subservices will be deleted automatically due to CASCADE)
    const deleteStmt = db.prepare('DELETE FROM services WHERE key = ?');
    const result = deleteStmt.run(serviceKey);

    db.close();

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting service:', error);
    return NextResponse.json({ error: 'Failed to delete service' }, { status: 500 });
  }
}
