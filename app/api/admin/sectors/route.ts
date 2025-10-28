import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'database.db');

// GET: Fetch all sectors (for admin or signup based on query param)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeHidden = searchParams.get('includeHidden') === 'true';
    
    const db = new Database(dbPath);
    
    let query = 'SELECT * FROM sectors';
    if (!includeHidden) {
      query += ' WHERE isVisible = 1';
    }
    query += ' ORDER BY sortOrder ASC, nameAr ASC';
    
    const sectors = db.prepare(query).all();
    db.close();

    return NextResponse.json({ sectors });
  } catch (error: any) {
    console.error('Error fetching sectors:', error);
    return NextResponse.json({ error: 'فشل في جلب المجالات' }, { status: 500 });
  }
}

// POST: Create new sector
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nameAr, nameEn, isVisible = 1, sortOrder = 0 } = body;

    if (!nameAr || !nameEn) {
      return NextResponse.json({ error: 'الاسم بالعربي والإنجليزي مطلوبان' }, { status: 400 });
    }

    const db = new Database(dbPath);
    
    // Check if sector already exists
    const existing = db.prepare('SELECT id FROM sectors WHERE nameAr = ? OR nameEn = ?').get(nameAr, nameEn);
    if (existing) {
      db.close();
      return NextResponse.json({ error: 'المجال موجود بالفعل' }, { status: 400 });
    }

    const result = db.prepare(`
      INSERT INTO sectors (nameAr, nameEn, isVisible, sortOrder)
      VALUES (?, ?, ?, ?)
    `).run(nameAr, nameEn, isVisible, sortOrder);

    db.close();

    return NextResponse.json({ 
      success: true,
      id: result.lastInsertRowid,
      message: 'تم إضافة المجال بنجاح' 
    });
  } catch (error: any) {
    console.error('Error creating sector:', error);
    return NextResponse.json({ error: 'فشل في إضافة المجال' }, { status: 500 });
  }
}

// PUT: Update sector
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, nameAr, nameEn, isVisible, sortOrder } = body;

    if (!id) {
      return NextResponse.json({ error: 'معرف المجال مطلوب' }, { status: 400 });
    }

    const db = new Database(dbPath);
    
    const updates: string[] = [];
    const values: any[] = [];

    if (nameAr !== undefined) {
      updates.push('nameAr = ?');
      values.push(nameAr);
    }
    if (nameEn !== undefined) {
      updates.push('nameEn = ?');
      values.push(nameEn);
    }
    if (isVisible !== undefined) {
      updates.push('isVisible = ?');
      values.push(isVisible);
    }
    if (sortOrder !== undefined) {
      updates.push('sortOrder = ?');
      values.push(sortOrder);
    }

    if (updates.length === 0) {
      db.close();
      return NextResponse.json({ error: 'لا توجد بيانات للتحديث' }, { status: 400 });
    }

    // Add updatedAt at the end
    updates.push("updatedAt = datetime('now')");
    values.push(id);

    const result = db.prepare(`
      UPDATE sectors 
      SET ${updates.join(', ')}
      WHERE id = ?
    `).run(...values);

    db.close();

    if (result.changes === 0) {
      return NextResponse.json({ error: 'المجال غير موجود' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'تم تحديث المجال بنجاح' 
    });
  } catch (error: any) {
    console.error('Error updating sector:', error);
    return NextResponse.json({ 
      error: 'فشل في تحديث المجال',
      details: error.message 
    }, { status: 500 });
  }
}

// DELETE: Delete sector
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'معرف المجال مطلوب' }, { status: 400 });
    }

    const db = new Database(dbPath);
    
    db.prepare('DELETE FROM sectors WHERE id = ?').run(id);
    db.close();

    return NextResponse.json({ 
      success: true,
      message: 'تم حذف المجال بنجاح' 
    });
  } catch (error: any) {
    console.error('Error deleting sector:', error);
    return NextResponse.json({ error: 'فشل في حذف المجال' }, { status: 500 });
  }
}
