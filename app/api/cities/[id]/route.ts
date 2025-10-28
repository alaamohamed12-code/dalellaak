import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'companies.db');

// PUT - Update a city
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cityId = parseInt(params.id);
    const body = await req.json();
    const { name_ar, name_en, display_order, is_active } = body;

    if (!name_ar || !name_en) {
      return NextResponse.json({ error: 'اسم المدينة مطلوب بالعربي والإنجليزي' }, { status: 400 });
    }

    const db = new Database(dbPath);
    
    const update = db.prepare(`
      UPDATE cities 
      SET name_ar = ?, 
          name_en = ?, 
          display_order = ?,
          is_active = ?,
          updated_at = datetime('now')
      WHERE id = ?
    `);

    const result = update.run(
      name_ar,
      name_en,
      display_order !== undefined ? display_order : 0,
      is_active !== undefined ? is_active : 1,
      cityId
    );

    db.close();

    if (result.changes === 0) {
      return NextResponse.json({ error: 'المدينة غير موجودة' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating city:', error);
    if (error.message.includes('UNIQUE constraint failed')) {
      return NextResponse.json({ error: 'اسم المدينة موجود بالفعل' }, { status: 409 });
    }
    return NextResponse.json({ error: 'فشل تحديث المدينة' }, { status: 500 });
  }
}

// DELETE - Delete a city
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cityId = parseInt(params.id);

    const db = new Database(dbPath);
    
    const deleteStmt = db.prepare('DELETE FROM cities WHERE id = ?');
    const result = deleteStmt.run(cityId);

    db.close();

    if (result.changes === 0) {
      return NextResponse.json({ error: 'المدينة غير موجودة' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting city:', error);
    return NextResponse.json({ error: 'فشل حذف المدينة' }, { status: 500 });
  }
}

// PATCH - Toggle city active status
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cityId = parseInt(params.id);

    const db = new Database(dbPath);
    
    // Toggle is_active
    const update = db.prepare(`
      UPDATE cities 
      SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END,
          updated_at = datetime('now')
      WHERE id = ?
    `);

    const result = update.run(cityId);

    db.close();

    if (result.changes === 0) {
      return NextResponse.json({ error: 'المدينة غير موجودة' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error toggling city status:', error);
    return NextResponse.json({ error: 'فشل تغيير حالة المدينة' }, { status: 500 });
  }
}
