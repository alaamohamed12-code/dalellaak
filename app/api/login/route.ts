import db from '../../../lib/db';
import companiesDb from '../../../lib/companies-db';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

type UserRow = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  username: string;
  password: string;
  accountType: string;
  image: string;
};

type CompanyRow = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  username: string;
  password: string;
  accountType: string;
  image: string;
  status: string;
};

export async function POST(req: Request) {
  const body = await req.json();
  const { identifier, password } = body; // identifier = email or username
  if (!identifier || !password) {
    return NextResponse.json({ error: 'يجب إدخال البريد الإلكتروني أو اسم المستخدم وكلمة المرور' }, { status: 400 });
  }
  try {
    // ابحث أولاً في جدول المستخدمين العاديين
    const user = db.prepare('SELECT * FROM users WHERE email = ? OR username = ?').get(identifier, identifier) as UserRow | undefined;
    if (user) {
      const valid = bcrypt.compareSync(password, user.password);
      if (!valid) {
        return NextResponse.json({ error: 'كلمة المرور غير صحيحة' }, { status: 401 });
      }
      const { password: _, ...userData } = user;
      return NextResponse.json({ success: true, user: { ...userData, accountType: 'individual' } });
    }
    // إذا لم يوجد، ابحث في جدول الشركات (المقبولة فقط)
    const company = companiesDb.prepare('SELECT * FROM companies WHERE (email = ? OR username = ?) AND status = ?').get(identifier, identifier, 'approved') as CompanyRow | undefined;
    if (company) {
      const valid = bcrypt.compareSync(password, company.password);
      if (!valid) {
        return NextResponse.json({ error: 'كلمة المرور غير صحيحة' }, { status: 401 });
      }
      const { password: _, ...companyData } = company;
      return NextResponse.json({ success: true, user: { ...companyData, accountType: 'company' } });
    }
    // إذا لم يوجد في أي مكان
    return NextResponse.json({ error: 'المستخدم غير موجود أو لم يتم قبول الشركة بعد' }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
