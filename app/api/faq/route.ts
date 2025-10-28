import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'site-settings.db');

// GET - Fetch all FAQ items or active ones only
export async function GET(request: NextRequest) {
  try {
    const db = new Database(dbPath);
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('activeOnly') === 'true';
    const lang = searchParams.get('lang') || 'ar'; // Default to Arabic

    console.log('🌍 FAQ API: Received request with lang =', lang, 'activeOnly =', activeOnly);

    let query = 'SELECT id, displayOrder, isActive, createdAt, updatedAt';
    
    // Select appropriate language columns
    if (lang === 'en') {
      query += ', questionEn as question, answerEn as answer';
      console.log('🇬🇧 FAQ API: Using English columns (questionEn, answerEn)');
    } else {
      query += ', questionAr as question, answerAr as answer';
      console.log('🇸🇦 FAQ API: Using Arabic columns (questionAr, answerAr)');
    }
    
    query += ' FROM faq';
    
    if (activeOnly) {
      query += ' WHERE isActive = 1';
    }
    query += ' ORDER BY displayOrder ASC, id ASC';

    console.log('📝 FAQ API: Executing query:', query);
    const faqs = db.prepare(query).all();
    console.log('✅ FAQ API: Returning', faqs.length, 'FAQs');
    if (faqs.length > 0) {
      console.log('📊 FAQ API: First FAQ question:', (faqs[0] as any).question);
    }
    db.close();

    return NextResponse.json(faqs);
  } catch (error) {
    console.error('❌ FAQ API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch FAQs' },
      { status: 500 }
    );
  }
}

// POST - Add new FAQ
export async function POST(request: NextRequest) {
  try {
    const { questionAr, answerAr, questionEn, answerEn, displayOrder } = await request.json();

    if (!questionAr || !answerAr) {
      return NextResponse.json(
        { error: 'Arabic question and answer are required' },
        { status: 400 }
      );
    }

    const db = new Database(dbPath);
    
    // Get max display order if not provided
    let order = displayOrder;
    if (!order) {
      const maxOrder = db.prepare('SELECT MAX(displayOrder) as maxOrder FROM faq').get() as any;
      order = (maxOrder?.maxOrder || 0) + 1;
    }

    const stmt = db.prepare(`
      INSERT INTO faq (questionAr, answerAr, questionEn, answerEn, displayOrder)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(questionAr, answerAr, questionEn || null, answerEn || null, order);
    db.close();

    return NextResponse.json({ 
      success: true, 
      id: result.lastInsertRowid,
      message: 'FAQ added successfully' 
    });
  } catch (error) {
    console.error('Error adding FAQ:', error);
    return NextResponse.json(
      { error: 'Failed to add FAQ' },
      { status: 500 }
    );
  }
}

// PUT - Update FAQ
export async function PUT(request: NextRequest) {
  try {
    const { id, questionAr, answerAr, questionEn, answerEn, displayOrder, isActive } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'FAQ ID is required' },
        { status: 400 }
      );
    }

    const db = new Database(dbPath);
    
    const updates: string[] = [];
    const values: any[] = [];

    if (questionAr !== undefined) {
      updates.push('questionAr = ?');
      values.push(questionAr);
    }
    if (answerAr !== undefined) {
      updates.push('answerAr = ?');
      values.push(answerAr);
    }
    if (questionEn !== undefined) {
      updates.push('questionEn = ?');
      values.push(questionEn);
    }
    if (answerEn !== undefined) {
      updates.push('answerEn = ?');
      values.push(answerEn);
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
      UPDATE faq 
      SET ${updates.join(', ')}
      WHERE id = ?
    `);

    const result = stmt.run(...values);
    db.close();

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'FAQ not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'FAQ updated successfully' 
    });
  } catch (error) {
    console.error('Error updating FAQ:', error);
    return NextResponse.json(
      { error: 'Failed to update FAQ' },
      { status: 500 }
    );
  }
}

// DELETE - Remove FAQ
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'FAQ ID is required' },
        { status: 400 }
      );
    }

    const db = new Database(dbPath);
    const stmt = db.prepare('DELETE FROM faq WHERE id = ?');
    const result = stmt.run(id);
    db.close();

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'FAQ not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'FAQ deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    return NextResponse.json(
      { error: 'Failed to delete FAQ' },
      { status: 500 }
    );
  }
}
