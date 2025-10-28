import { NextRequest, NextResponse } from 'next/server';
import companiesDb from '../../../lib/companies-db';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get('companyId');

  if (!companyId) {
    return NextResponse.json({ error: 'Missing companyId' }, { status: 400 });
  }

  try {
    const projects = companiesDb.prepare(`
      SELECT * FROM completed_projects 
      WHERE companyId = ? 
      ORDER BY completedDate DESC
    `).all(Number(companyId));

    return NextResponse.json({ projects });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const companyId = formData.get('companyId') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const completedDate = formData.get('completedDate') as string;
    const imageFile = formData.get('image') as File | null;

    if (!companyId || !title || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let imagePath: string | null = null;

    // Handle image upload
    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const fileName = `${Date.now()}-${imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = path.join(process.cwd(), 'public', 'completed-projects', fileName);
      
      await writeFile(filePath, buffer);
      imagePath = fileName;
    }

    // Insert into database
    const stmt = companiesDb.prepare(`
      INSERT INTO completed_projects (companyId, title, description, image, completedDate)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      Number(companyId),
      title,
      description,
      imagePath,
      completedDate || new Date().toISOString().split('T')[0]
    );

    return NextResponse.json({ 
      success: true, 
      id: result.lastInsertRowid 
    });
  } catch (error: any) {
    console.error('Error adding completed project:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  try {
    // Get project to delete image file
    const project = companiesDb.prepare('SELECT * FROM completed_projects WHERE id = ?').get(Number(id));
    
    if (project && (project as any).image) {
      const imagePath = path.join(process.cwd(), 'public', 'completed-projects', (project as any).image);
      try {
        const fs = require('fs');
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      } catch (err) {
        console.error('Error deleting image file:', err);
      }
    }

    // Delete from database
    const stmt = companiesDb.prepare('DELETE FROM completed_projects WHERE id = ?');
    stmt.run(Number(id));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
