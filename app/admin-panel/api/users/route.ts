import db from '../../../../lib/db';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url!);
  const q = searchParams.get('q');
  let users;
  if (q) {
    users = db.prepare('SELECT id, firstName, lastName, email, phone, username, accountType, image FROM users WHERE email LIKE ? OR username LIKE ?').all(`%${q}%`, `%${q}%`);
  } else {
    users = db.prepare('SELECT id, firstName, lastName, email, phone, username, accountType, image FROM users').all();
  }
  return NextResponse.json({ users });
}
