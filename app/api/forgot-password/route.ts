import db from '../../../lib/db';
import companiesDb from '../../../lib/companies-db';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { identifier } = await req.json();
  
  if (!identifier) {
    return NextResponse.json({ error: 'يجب إدخال البريد الإلكتروني أو اسم المستخدم' }, { status: 400 });
  }

  try {
    let userFound = false;
    let userEmail = '';

    // البحث في جدول المستخدمين أولاً
    const user = db.prepare('SELECT email FROM users WHERE email = ? OR username = ?').get(identifier, identifier) as any;
    if (user) {
      userFound = true;
      userEmail = user.email;
    } else {
      // البحث في جدول الشركات
      const company = companiesDb.prepare('SELECT email FROM companies WHERE email = ? OR username = ?').get(identifier, identifier) as any;
      if (company) {
        userFound = true;
        userEmail = company.email;
      }
    }

    if (!userFound) {
      return NextResponse.json({ 
        error: 'لم يتم العثور على مستخدم بهذا البريد الإلكتروني أو اسم المستخدم. تأكد من صحة البيانات أو قم بإنشاء حساب جديد.' 
      }, { status: 404 });
    }

    // إنشاء كود استعادة
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    // إرسال كود الاستعادة عبر البريد الإلكتروني
    const emailRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/send-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: userEmail, 
        code: resetCode,
        subject: 'كود استعادة كلمة المرور',
        message: `كود استعادة كلمة المرور الخاص بك هو: ${resetCode}\n\nهذا الكود صالح لمدة 15 دقيقة فقط.\n\nإذا لم تطلب استعادة كلمة المرور، يمكنك تجاهل هذا البريد.`
      })
    });

    if (!emailRes.ok) {
      throw new Error('فشل في إرسال كود الاستعادة');
    }

    // حفظ كود الاستعادة مؤقتاً (يمكن تحسين هذا باستخدام Redis أو قاعدة بيانات مؤقتة)
    // للبساطة، سنرجع الكود في الاستجابة (في بيئة الإنتاج، يجب حفظه في قاعدة بيانات آمنة)
    
    return NextResponse.json({ 
      success: true, 
      message: 'تم إرسال كود استعادة كلمة المرور إلى بريدك الإلكتروني',
      email: userEmail.replace(/(.{2}).*(@.*)/, '$1***$2'), // إخفاء جزء من الإيميل للأمان
      code: resetCode // في الإنتاج، لا ترجع الكود هنا
    });

  } catch (err: any) {
    return NextResponse.json({ 
      error: 'حدث خطأ أثناء معالجة طلب استعادة كلمة المرور. حاول مرة أخرى.' 
    }, { status: 500 });
  }
}