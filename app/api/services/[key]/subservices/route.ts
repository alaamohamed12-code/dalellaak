import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'companies.db');

export async function GET(req: NextRequest, { params }: { params: { key: string } }) {
  try {
    const serviceKey = params.key;
    const db = new Database(dbPath);
    
    const subservices = db.prepare(`
      SELECT * FROM subservices 
      WHERE service_key = ? AND is_active = 1 
      ORDER BY display_order ASC, title_ar ASC
    `).all(serviceKey);

    db.close();
    return NextResponse.json(subservices);
  } catch (error) {
    console.error('Error fetching subservices:', error);
    return NextResponse.json({ error: 'Failed to fetch subservices' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { key: string } }) {
  try {
    const serviceKey = params.key;
    const body = await req.json();
    const { 
      key, 
      title_ar, 
      title_en, 
      icon, 
      description_ar, 
      description_en, 
      display_order 
    } = body;

    if (!key || !title_ar || !title_en) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = new Database(dbPath);
    
    const insert = db.prepare(`
      INSERT INTO subservices (service_key, key, title_ar, title_en, icon, description_ar, description_en, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insert.run(
      serviceKey,
      key,
      title_ar,
      title_en,
      icon || '🔧',
      description_ar || '',
      description_en || '',
      display_order || 0
    );

    db.close();
    return NextResponse.json({ success: true, id: result.lastInsertRowid }, { status: 201 });
  } catch (error: any) {
    console.error('Error adding subservice:', error);
    if (error.message.includes('UNIQUE constraint failed')) {
      return NextResponse.json({ error: 'Subservice key already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to add subservice' }, { status: 500 });
  }
}
