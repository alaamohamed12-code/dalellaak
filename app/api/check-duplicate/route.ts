import db from '../../../lib/db';
import companiesDb from '../../../lib/companies-db';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { email, username } = await req.json();
  if (!email && !username) {
    return NextResponse.json({ error: 'يجب إدخال البريد الإلكتروني أو اسم المستخدم' }, { status: 400 });
  }
  // تحقق من وجود البريد أو اسم المستخدم في المستخدمين أو الشركات
  const user = db.prepare('SELECT * FROM users WHERE email = ? OR username = ?').get(email, username) as any;
  if (user && Object.keys(user).length > 0) {
    let msg = '';
    if (user.email === email && user.username === username) {
      msg = 'البريد الإلكتروني واسم المستخدم مستخدمان بالفعل. يمكنك تسجيل الدخول أو استخدام بيانات أخرى.';
    } else if (user.email === email) {
      msg = 'البريد الإلكتروني مستخدم بالفعل. يمكنك تسجيل الدخول أو استخدام بريد آخر.';
    } else {
      msg = 'اسم المستخدم مستخدم بالفعل. يمكنك تسجيل الدخول أو استخدام اسم آخر.';
    }
    return NextResponse.json({ duplicate: true, message: msg }, { status: 200 });
  }
  const company = companiesDb.prepare('SELECT * FROM companies WHERE email = ? OR username = ?').get(email, username) as any;
  if (company && Object.keys(company).length > 0) {
    let msg = '';
    if (company.email === email && company.username === username) {
      msg = 'البريد الإلكتروني واسم المستخدم مستخدمان بالفعل. يمكنك تسجيل الدخول أو استخدام بيانات أخرى.';
    } else if (company.email === email) {
      msg = 'البريد الإلكتروني مستخدم بالفعل. يمكنك تسجيل الدخول أو استخدام بريد آخر.';
    } else {
      msg = 'اسم المستخدم مستخدم بالفعل. يمكنك تسجيل الدخول أو استخدام اسم آخر.';
    }
    return NextResponse.json({ duplicate: true, message: msg }, { status: 200 });
  }
  return NextResponse.json({ duplicate: false });
}
