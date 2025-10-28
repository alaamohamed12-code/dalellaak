import db from '../../../../lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const users = db.prepare('SELECT id, firstName, lastName, email, phone, username, accountType, image FROM users WHERE accountType = ?').all('individual');
    return NextResponse.json({ users });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
