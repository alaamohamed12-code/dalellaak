
import { NextRequest, NextResponse } from 'next/server';
import companiesDb from '../../../lib/companies-db';
import { getCompanyWorks } from '../../../lib/company-works-db';

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, sector } = body;
    // Debug log
    console.log('PATCH /api/company-profile', { id, sector });
    if (!id || typeof sector !== 'string') {
      return NextResponse.json({ error: 'Missing id or sector' }, { status: 400 });
    }
    // Ensure id is number
    const companyId = typeof id === 'number' ? id : Number(id);
    if (!companyId) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }
    const stmt = companiesDb.prepare('UPDATE companies SET sector = ? WHERE id = ?');
    const result = stmt.run(sector, companyId);
    if (result.changes === 0) {
      return NextResponse.json({ error: 'لم يتم العثور على الشركة أو لم يتم التحديث' }, { status: 404 });
    }
    // Return updated company
    const updated = companiesDb.prepare('SELECT * FROM companies WHERE id = ?').get(companyId);
    return NextResponse.json({ success: true, company: updated });
  } catch (err) {
    return NextResponse.json({ error: 'خطأ في الخادم', details: String(err) }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const username = searchParams.get('username');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const now = new Date().toISOString();
  
  // إذا كان هناك اسم مستخدم (يعني صاحب الشركة نفسه)
  let company;
  if (username) {
    company = companiesDb.prepare('SELECT * FROM companies WHERE CAST(id AS TEXT) = ? AND username = ?').get(String(id), username);
  } else {
    // للزوار: عرض الشركات النشطة فقط
    company = companiesDb.prepare(`
      SELECT * FROM companies 
      WHERE id = ? 
      AND status = ? 
      AND membershipStatus = 'active' 
      AND (membershipExpiry IS NULL OR membershipExpiry > ?)
    `).get(id, 'approved', now);
  }
  if (!company) return NextResponse.json({ company: null });

  // Get company works
  const works = getCompanyWorks(Number(id));

  // Get completed projects
  const completedProjects = companiesDb.prepare(`
    SELECT * FROM completed_projects 
    WHERE companyId = ? 
    ORDER BY completedDate DESC
  `).all(Number(id));

  return NextResponse.json({ company, works, completedProjects });
}
