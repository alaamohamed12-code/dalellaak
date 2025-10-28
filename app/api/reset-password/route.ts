import db from '../../../lib/db';
import companiesDb from '../../../lib/companies-db';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  const { identifier, newPassword, verificationCode } = await req.json();
  
  if (!identifier || !newPassword || !verificationCode) {
    return NextResponse.json({ error: 'جميع الحقول مطلوبة' }, { status: 400 });
  }

  if (newPassword.length < 6) {
    return NextResponse.json({ error: 'كلمة المرور يجب أن تكون على الأقل 6 أحرف' }, { status: 400 });
  }

  try {
    let userFound = false;
    let targetDb = null;
    let tableName = '';

    // البحث في جدول المستخدمين أولاً
    const user = db.prepare('SELECT * FROM users WHERE email = ? OR username = ?').get(identifier, identifier) as any;
    if (user) {
      userFound = true;
      targetDb = db;
      tableName = 'users';
    } else {
      // البحث في جدول الشركات
      const company = companiesDb.prepare('SELECT * FROM companies WHERE email = ? OR username = ?').get(identifier, identifier) as any;
      if (company) {
        userFound = true;
        targetDb = companiesDb;
        tableName = 'companies';
      }
    }

    if (!userFound || !targetDb) {
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
    }

    // تشفير كلمة المرور الجديدة
    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    // تحديث كلمة المرور في قاعدة البيانات
    const updateQuery = `UPDATE ${tableName} SET password = ? WHERE email = ? OR username = ?`;
    targetDb.prepare(updateQuery).run(hashedPassword, identifier, identifier);

    return NextResponse.json({ 
      success: true, 
      message: 'تم تحديث كلمة المرور بنجاح' 
    });

  } catch (err: any) {
    return NextResponse.json({ 
      error: 'حدث خطأ أثناء تحديث كلمة المرور. حاول مرة أخرى.' 
    }, { status: 500 });
  }
}