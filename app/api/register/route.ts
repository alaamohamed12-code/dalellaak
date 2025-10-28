
import db from '../../../lib/db';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(req: Request) {
  let firstName = '', lastName = '', email = '', phone = '', username = '', password = '', accountType = '', imagePath = '';
  let isFormData = false;
  let imageFile: File | null = null;
  let hash = '';

  // دعم استقبال FormData أو JSON
  const contentType = req.headers.get('content-type') || '';
  if (contentType.includes('multipart/form-data')) {
    isFormData = true;
    const formData = await req.formData();
    firstName = formData.get('firstName') as string;
    lastName = formData.get('lastName') as string;
    email = formData.get('email') as string;
    phone = formData.get('phone') as string;
    username = formData.get('username') as string;
    password = formData.get('password') as string;
    accountType = formData.get('accountType') as string;
    imageFile = formData.get('image') as File | null;
  } else {
    const body = await req.json();
    firstName = body.firstName;
    lastName = body.lastName;
    email = body.email;
    phone = body.phone;
    username = body.username;
    password = body.password;
    accountType = body.accountType;
    imagePath = body.image || '';
  }

  if (!email && !username) {
    return NextResponse.json({ error: 'يجب إدخال البريد الإلكتروني أو اسم المستخدم' }, { status: 400 });
  }
  if (!password) {
    return NextResponse.json({ error: 'كلمة المرور مطلوبة' }, { status: 400 });
  }
  try {
    // تحقق من عدم وجود المستخدم مسبقاً
    const exists = db.prepare('SELECT * FROM users WHERE email = ? OR username = ?').get(email, username);
    if (exists) {
      return NextResponse.json({ error: 'المستخدم موجود بالفعل' }, { status: 409 });
    }
    hash = bcrypt.hashSync(password, 10);

    // إذا تم رفع صورة، احفظها فعليًا
    if (isFormData && imageFile && typeof imageFile === 'object' && 'arrayBuffer' in imageFile) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const ext = (imageFile.name || '').split('.').pop() || 'png';
      const fileName = `${Date.now()}_${username}.${ext}`;
      const filePath = path.join(process.cwd(), 'public', 'profile-images', fileName);
      await writeFile(filePath, buffer);
      imagePath = `/profile-images/${fileName}`;
    }

    db.prepare(`INSERT INTO users (firstName, lastName, email, phone, username, password, accountType, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(firstName, lastName, email, phone, username, hash, accountType, imagePath);
    return NextResponse.json({ success: true, imagePath });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
