import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'site-settings.db');

// GET - Fetch all sections or specific section
export async function GET(request: NextRequest) {
  try {
    const db = new Database(dbPath);
    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section');

    let result;
    if (section) {
      result = db.prepare('SELECT * FROM home_content WHERE section = ?').get(section);
    } else {
      result = db.prepare('SELECT * FROM home_content ORDER BY id').all();
    }

    db.close();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching home content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch home content' },
      { status: 500 }
    );
  }
}

// PUT - Update section content
export async function PUT(request: NextRequest) {
  try {
    const { section, content } = await request.json();

    if (!section || !content) {
      return NextResponse.json(
        { error: 'Section and content are required' },
        { status: 400 }
      );
    }

    const db = new Database(dbPath);
    
    const stmt = db.prepare(`
      UPDATE home_content 
      SET content = ?, updatedAt = CURRENT_TIMESTAMP 
      WHERE section = ?
    `);

    const result = stmt.run(JSON.stringify(content), section);

    db.close();

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Section not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Content updated successfully' 
    });
  } catch (error) {
    console.error('Error updating home content:', error);
    return NextResponse.json(
      { error: 'Failed to update home content' },
      { status: 500 }
    );
  }
}
