import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'companies.db');

export async function GET() {
  try {
    const db = new Database(dbPath);
    
    // Get all active services with their subservices
    const services = db.prepare(`
      SELECT * FROM services 
      WHERE is_active = 1 
      ORDER BY display_order ASC, title_ar ASC
    `).all() as any[];

    const servicesWithSubs = services.map((service: any) => {
      const subservices = db.prepare(`
        SELECT * FROM subservices 
        WHERE service_key = ? AND is_active = 1 
        ORDER BY display_order ASC, title_ar ASC
      `).all(service.key) as any[];

      return {
        ...service,
        subservices
      } as any;
    });

    db.close();
    return NextResponse.json(servicesWithSubs);
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      key, 
      title_ar, 
      title_en, 
      icon, 
      description_ar, 
      description_en, 
      gradient,
      display_order 
    } = body;

    if (!key || !title_ar || !title_en) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = new Database(dbPath);
    
    const insert = db.prepare(`
      INSERT INTO services (key, title_ar, title_en, icon, description_ar, description_en, gradient, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insert.run(
      key,
      title_ar,
      title_en,
      icon || '📋',
      description_ar || '',
      description_en || '',
      gradient || 'from-blue-500 to-purple-500',
      display_order || 0
    );

    db.close();
    return NextResponse.json({ success: true, id: result.lastInsertRowid }, { status: 201 });
  } catch (error: any) {
    console.error('Error adding service:', error);
    if (error.message.includes('UNIQUE constraint failed')) {
      return NextResponse.json({ error: 'Service key already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to add service' }, { status: 500 });
  }
}
