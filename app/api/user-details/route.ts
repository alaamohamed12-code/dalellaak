import { NextRequest, NextResponse } from 'next/server';
import db from '../../../lib/db';
import companiesDb from '../../../lib/companies-db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const companyId = searchParams.get('companyId');
    
    if (!userId && !companyId) {
      return NextResponse.json({ error: 'Provide userId or companyId' }, { status: 400 });
    }

    if (userId) {
      // Get user details
      const user = db.prepare('SELECT id, firstName, lastName, username, image FROM users WHERE id = ?').get(userId);
      return NextResponse.json({ user });
    }
    
    if (companyId) {
      // Get company details
      const company = companiesDb.prepare('SELECT id, firstName, lastName, username, image FROM companies WHERE id = ?').get(companyId);
      return NextResponse.json({ company });
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: 'Server error', details: String(err) }, { status: 500 });
  }
}