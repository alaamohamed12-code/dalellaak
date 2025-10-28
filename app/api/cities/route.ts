import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'companies.db');

// GET - Get all cities or active cities only
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get('active') === 'true';
    
    const db = new Database(dbPath);
    
    const query = activeOnly
      ? 'SELECT * FROM cities WHERE is_active = 1 ORDER BY display_order ASC, name_ar ASC'
      : 'SELECT * FROM cities ORDER BY display_order ASC, name_ar ASC';
    
    const cities = db.prepare(query).all();
    
    db.close();
    return NextResponse.json(cities);
  } catch (error) {
    console.error('Error fetching cities:', error);
    return NextResponse.json({ error: 'Failed to fetch cities' }, { status: 500 });
  }
}

// POST - Create a new city
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name_ar, name_en, display_order } = body;

    if (!name_ar || !name_en) {
      return NextResponse.json({ error: 'اسم المدينة مطلوب بالعربي والإنجليزي' }, { status: 400 });
    }

    const db = new Database(dbPath);
    
    const insert = db.prepare(`
      INSERT INTO cities (name_ar, name_en, display_order)
      VALUES (?, ?, ?)
    `);

    const result = insert.run(
      name_ar,
      name_en,
      display_order || 0
    );

    db.close();
    return NextResponse.json({ success: true, id: result.lastInsertRowid }, { status: 201 });
  } catch (error: any) {
    console.error('Error adding city:', error);
    if (error.message.includes('UNIQUE constraint failed')) {
      return NextResponse.json({ error: 'المدينة موجودة بالفعل' }, { status: 409 });
    }
    return NextResponse.json({ error: 'فشل إضافة المدينة' }, { status: 500 });
  }
}
