import db from '../admin-db';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

type AdminRow = {
  id: number;
  username: string;
  password: string;
  email?: string;
  createdAt?: string;
};

export async function POST(req: Request) {
  const { username, password } = await req.json();
  if (!username || !password) {
    return NextResponse.json({ error: 'اسم المستخدم وكلمة المرور مطلوبة' }, { status: 400 });
  }
  const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get(username) as AdminRow | undefined;
  if (!admin) {
    return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
  }
  const valid = bcrypt.compareSync(password, admin.password);
  if (!valid) {
    return NextResponse.json({ error: 'كلمة المرور غير صحيحة' }, { status: 401 });
  }
  return NextResponse.json({ success: true });
}
