import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'site-settings.db');

// GET - Fetch all terms or active ones only
export async function GET(request: NextRequest) {
  try {
    const db = new Database(dbPath);
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('activeOnly') === 'true';
    const lang = searchParams.get('lang') || 'ar'; // Default to Arabic

    let query = 'SELECT id, sectionId, icon, displayOrder, isActive, createdAt, updatedAt';
    
    // Select appropriate language columns
    if (lang === 'en') {
      query += ', titleEn as title, contentEn as content';
    } else {
      query += ', titleAr as title, contentAr as content';
    }
    
    query += ' FROM terms';
    
    if (activeOnly) {
      query += ' WHERE isActive = 1';
    }
    query += ' ORDER BY displayOrder ASC, id ASC';

    const terms = db.prepare(query).all();
    db.close();

    return NextResponse.json(terms);
  } catch (error) {
    console.error('Error fetching terms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch terms' },
      { status: 500 }
    );
  }
}

// POST - Add new term section
export async function POST(request: NextRequest) {
  try {
    const { sectionId, titleAr, titleEn, contentAr, contentEn, icon, displayOrder } = await request.json();

    if (!sectionId || !titleAr || !titleEn || !contentAr || !contentEn) {
      return NextResponse.json(
        { error: 'All fields (sectionId, titleAr, titleEn, contentAr, contentEn) are required' },
        { status: 400 }
      );
    }

    const db = new Database(dbPath);
    
    // Check if sectionId already exists
    const existing = db.prepare('SELECT id FROM terms WHERE sectionId = ?').get(sectionId);
    if (existing) {
      db.close();
      return NextResponse.json(
        { error: 'Section ID already exists' },
        { status: 400 }
      );
    }
    
    // Get max display order if not provided
    let order = displayOrder;
    if (!order) {
      const maxOrder = db.prepare('SELECT MAX(displayOrder) as maxOrder FROM terms').get() as any;
      order = (maxOrder?.maxOrder || 0) + 1;
    }

    const stmt = db.prepare(`
      INSERT INTO terms (sectionId, titleAr, titleEn, contentAr, contentEn, icon, displayOrder)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(sectionId, titleAr, titleEn, contentAr, contentEn, icon || '📄', order);
    db.close();

    return NextResponse.json({ 
      success: true, 
      id: result.lastInsertRowid,
      message: 'Term added successfully' 
    });
  } catch (error) {
    console.error('Error adding term:', error);
    return NextResponse.json(
      { error: 'Failed to add term' },
      { status: 500 }
    );
  }
}

// PUT - Update term
export async function PUT(request: NextRequest) {
  try {
    const { id, sectionId, titleAr, titleEn, contentAr, contentEn, icon, displayOrder, isActive } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Term ID is required' },
        { status: 400 }
      );
    }

    const db = new Database(dbPath);
    
    // Check if sectionId is being changed and if it already exists
    if (sectionId) {
      const existing = db.prepare('SELECT id FROM terms WHERE sectionId = ? AND id != ?').get(sectionId, id);
      if (existing) {
        db.close();
        return NextResponse.json(
          { error: 'Section ID already exists' },
          { status: 400 }
        );
      }
    }
    
    const updates: string[] = [];
    const values: any[] = [];

    if (sectionId !== undefined) {
      updates.push('sectionId = ?');
      values.push(sectionId);
    }
    if (titleAr !== undefined) {
      updates.push('titleAr = ?');
      values.push(titleAr);
    }
    if (titleEn !== undefined) {
      updates.push('titleEn = ?');
      values.push(titleEn);
    }
    if (contentAr !== undefined) {
      updates.push('contentAr = ?');
      values.push(contentAr);
    }
    if (contentEn !== undefined) {
      updates.push('contentEn = ?');
      values.push(contentEn);
    }
    if (icon !== undefined) {
      updates.push('icon = ?');
      values.push(icon);
    }
    if (displayOrder !== undefined) {
      updates.push('displayOrder = ?');
      values.push(displayOrder);
    }
    if (isActive !== undefined) {
      updates.push('isActive = ?');
      values.push(isActive ? 1 : 0);
    }

    if (updates.length === 0) {
      db.close();
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    updates.push('updatedAt = CURRENT_TIMESTAMP');
    values.push(id);

    const stmt = db.prepare(`
      UPDATE terms 
      SET ${updates.join(', ')}
      WHERE id = ?
    `);

    const result = stmt.run(...values);
    db.close();

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Term not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Term updated successfully' 
    });
  } catch (error) {
    console.error('Error updating term:', error);
    return NextResponse.json(
      { error: 'Failed to update term' },
      { status: 500 }
    );
  }
}

// DELETE - Remove term
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Term ID is required' },
        { status: 400 }
      );
    }

    const db = new Database(dbPath);
    const stmt = db.prepare('DELETE FROM terms WHERE id = ?');
    const result = stmt.run(id);
    db.close();

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Term not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Term deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting term:', error);
    return NextResponse.json(
      { error: 'Failed to delete term' },
      { status: 500 }
    );
  }
}
