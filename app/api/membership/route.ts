import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

const companiesDbPath = path.join(process.cwd(), 'companies.db');

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
    }

    const companiesDb = new Database(companiesDbPath);
    
    const company = companiesDb.prepare(`
      SELECT id, firstName, membershipStatus, membershipExpiry 
      FROM companies 
      WHERE id = ?
    `).get(companyId) as { id: number; firstName: string; membershipStatus: string; membershipExpiry: string | null } | undefined;

    companiesDb.close();

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    return NextResponse.json(company);
  } catch (error) {
    console.error('Error fetching membership:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
