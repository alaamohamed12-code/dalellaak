import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'database.db');

// GET: Fetch all cities (for admin or signup based on query param)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeHidden = searchParams.get('includeHidden') === 'true';
    const cityType = searchParams.get('type'); // 'signup', 'filter', 'both', or null for all
    
    const db = new Database(dbPath);
    
    let query = 'SELECT * FROM cities';
    const conditions: string[] = [];
    const params: any[] = [];
    
    if (!includeHidden) {
      conditions.push('isVisible = 1');
    }
    
    if (cityType) {
      // إذا طلب نوع معين، جلب المدن من هذا النوع أو 'both'
      conditions.push('(cityType = ? OR cityType = ?)');
      params.push(cityType, 'both');
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY sortOrder ASC, nameAr ASC';
    
    const cities = db.prepare(query).all(...params);
    db.close();

    return NextResponse.json({ cities });
  } catch (error: any) {
    console.error('Error fetching cities:', error);
    return NextResponse.json({ error: 'فشل في جلب المدن' }, { status: 500 });
  }
}

// POST: Create new city
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nameAr, nameEn, isVisible = 1, sortOrder = 0, cityType = 'both' } = body;

    if (!nameAr || !nameEn) {
      return NextResponse.json({ error: 'الاسم بالعربي والإنجليزي مطلوبان' }, { status: 400 });
    }

    const db = new Database(dbPath);
    
    // Check if city already exists
    const existing = db.prepare('SELECT id FROM cities WHERE nameAr = ? OR nameEn = ?').get(nameAr, nameEn);
    if (existing) {
      db.close();
      return NextResponse.json({ error: 'المدينة موجودة بالفعل' }, { status: 400 });
    }

    const result = db.prepare(`
      INSERT INTO cities (nameAr, nameEn, isVisible, sortOrder, cityType)
      VALUES (?, ?, ?, ?, ?)
    `).run(nameAr, nameEn, isVisible, sortOrder, cityType);

    db.close();

    return NextResponse.json({ 
      success: true,
      id: result.lastInsertRowid,
      message: 'تم إضافة المدينة بنجاح' 
    });
  } catch (error: any) {
    console.error('Error creating city:', error);
    return NextResponse.json({ error: 'فشل في إضافة المدينة' }, { status: 500 });
  }
}

// PUT: Update city
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, nameAr, nameEn, isVisible, sortOrder, cityType } = body;

    if (!id) {
      return NextResponse.json({ error: 'معرف المدينة مطلوب' }, { status: 400 });
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
    if (cityType !== undefined) {
      updates.push('cityType = ?');
      values.push(cityType);
    }

    if (updates.length === 0) {
      db.close();
      return NextResponse.json({ error: 'لا توجد بيانات للتحديث' }, { status: 400 });
    }

    // Add updatedAt at the end
    updates.push("updatedAt = datetime('now')");
    values.push(id);

    const result = db.prepare(`
      UPDATE cities 
      SET ${updates.join(', ')}
      WHERE id = ?
    `).run(...values);

    db.close();

    if (result.changes === 0) {
      return NextResponse.json({ error: 'المدينة غير موجودة' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'تم تحديث المدينة بنجاح' 
    });
  } catch (error: any) {
    console.error('Error updating city:', error);
    return NextResponse.json({ 
      error: 'فشل في تحديث المدينة',
      details: error.message 
    }, { status: 500 });
  }
}

// DELETE: Delete city
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'معرف المدينة مطلوب' }, { status: 400 });
    }

    const db = new Database(dbPath);
    
    db.prepare('DELETE FROM cities WHERE id = ?').run(id);
    db.close();

    return NextResponse.json({ 
      success: true,
      message: 'تم حذف المدينة بنجاح' 
    });
  } catch (error: any) {
    console.error('Error deleting city:', error);
    return NextResponse.json({ error: 'فشل في حذف المدينة' }, { status: 500 });
  }
}
