import companiesDb from '../../../../lib/companies-db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const companies = companiesDb
      .prepare('SELECT id, firstName, lastName, email, phone, username, accountType, sector, location, taxDocs, status, createdAt FROM companies ORDER BY createdAt DESC')
      .all();
    return NextResponse.json({ companies });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, status } = await req.json();
    if (!id || !status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'معرف الشركة والحالة مطلوبة' }, { status: 400 });
    }
    
    companiesDb.prepare('UPDATE companies SET status = ? WHERE id = ?').run(status, id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'معرف الشركة مطلوب' }, { status: 400 });
    }
    
    companiesDb.prepare('DELETE FROM companies WHERE id = ?').run(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}