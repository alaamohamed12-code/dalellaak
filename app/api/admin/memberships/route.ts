import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

const companiesDbPath = path.join(process.cwd(), 'companies.db');

export async function GET() {
  try {
    const companiesDb = new Database(companiesDbPath);
    
    const companies = companiesDb.prepare(`
      SELECT id, firstName, membershipStatus, membershipExpiry, createdAt
      FROM companies
      ORDER BY 
        CASE membershipStatus 
          WHEN 'active' THEN 1 
          ELSE 2 
        END,
        membershipExpiry ASC
    `).all();

    companiesDb.close();

    return NextResponse.json({ companies });
  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
