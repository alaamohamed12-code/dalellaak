import db from '../../admin-db';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  const { username, email, password } = await req.json();
  if (!username || !password) {
    return NextResponse.json({ error: 'اسم الأدمن وكلمة المرور مطلوبة' }, { status: 400 });
  }
  // تحقق من عدم وجود أدمن بنفس الاسم أو الإيميل
  const exists = db.prepare('SELECT * FROM admins WHERE username = ? OR email = ?').get(username, email);
  if (exists) {
    return NextResponse.json({ error: 'اسم الأدمن أو البريد الإلكتروني مستخدم بالفعل' }, { status: 409 });
  }
  const hash = bcrypt.hashSync(password, 10);
  db.prepare('INSERT INTO admins (username, email, password) VALUES (?, ?, ?)').run(username, email, hash);
  return NextResponse.json({ success: true });
}
