import { NextResponse } from 'next/server';
import companiesDb from '../../../lib/companies-db';

export async function GET() {
  try {
    const companies = companiesDb.prepare('SELECT id, username, status, firstName, lastName, email FROM companies').all();
    return NextResponse.json({ companies });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
