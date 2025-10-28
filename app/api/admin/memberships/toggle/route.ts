import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

const companiesDbPath = path.join(process.cwd(), 'companies.db');

export async function POST(request: Request) {
  try {
    const { companyId, status } = await request.json();

    if (!companyId || !status) {
      return NextResponse.json({ error: 'Company ID and status are required' }, { status: 400 });
    }

    if (!['active', 'inactive'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const companiesDb = new Database(companiesDbPath);

    // Update company status
    companiesDb.prepare(`
      UPDATE companies 
      SET membershipStatus = ?
      WHERE id = ?
    `).run(status, companyId);

    companiesDb.close();

    return NextResponse.json({ success: true, message: 'Status updated successfully' });
  } catch (error) {
    console.error('Error toggling membership status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
