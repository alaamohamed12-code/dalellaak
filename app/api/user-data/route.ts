import db from '../../../lib/db';
import companiesDb from '../../../lib/companies-db';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { username } = await req.json();
  if (!username) {
    return NextResponse.json({ error: 'اسم المستخدم مطلوب' }, { status: 400 });
  }

  try {
    // البحث في جدول المستخدمين أولاً
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as any;
    if (user) {
      const { password, ...userData } = user;
      return NextResponse.json({ success: true, user: userData });
    }

    // البحث في جدول الشركات
    const company = companiesDb.prepare('SELECT * FROM companies WHERE username = ?').get(username) as any;
    if (company) {
      const { password, ...companyData } = company;
      return NextResponse.json({ success: true, user: companyData });
    }

    return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}