import { NextRequest, NextResponse } from 'next/server';
import companiesDb from '../../../lib/companies-db';
import { getCompanyWorks } from '../../../lib/company-works-db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const username = searchParams.get('username');
  if (!id || !username) return NextResponse.json({ error: 'Missing id or username' }, { status: 400 });

  // Debug: return both id and username as received, and what is in DB
  const company = companiesDb.prepare('SELECT * FROM companies WHERE CAST(id AS TEXT) = ? AND username = ?').get(String(id), username);
  const all = companiesDb.prepare('SELECT id, username FROM companies').all();
  return NextResponse.json({
    received: { id, username },
    found: !!company,
    company,
    allCompanies: all
  });
}
