import companiesDb from '../../../lib/companies-db';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(req: Request) {
  const formData = await req.formData();
  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;
  const accountType = formData.get('accountType') as string;
  const sector = formData.get('sector') as string;
  const location = formData.get('location') as string;
  let imagePath = '';
  const imageFile = formData.get('image') as File | null;
  const taxDocs = formData.getAll('taxDocs');

  if (!firstName || !lastName || !email || !username || !password || !sector || !location || taxDocs.length === 0) {
    return NextResponse.json({ error: 'جميع الحقول مطلوبة وملفات الشركة إلزامية' }, { status: 400 });
  }

  try {
    // تحقق من عدم وجود الشركة مسبقاً
    const exists = companiesDb.prepare('SELECT * FROM companies WHERE email = ? OR username = ?').get(email, username);
    if (exists) {
      return NextResponse.json({ error: 'اسم المستخدم أو البريد الإلكتروني مستخدم بالفعل' }, { status: 409 });
    }

    // حفظ صورة الحساب إذا تم رفعها
    if (imageFile && typeof imageFile === 'object' && 'arrayBuffer' in imageFile) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const ext = (imageFile.name || '').split('.').pop() || 'png';
      const fileName = `${Date.now()}_${username}.${ext}`;
      const filePath = path.join(process.cwd(), 'public', 'profile-images', fileName);
      await writeFile(filePath, buffer);
      imagePath = `/profile-images/${fileName}`;
    }

    // حفظ ملفات الشركة
    const savedFiles: string[] = [];
    for (const file of taxDocs) {
      if (typeof file === 'object' && 'arrayBuffer' in file) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const fileName = `${Date.now()}_${(file as File).name}`;
        const filePath = path.join(process.cwd(), 'company-uploads', fileName);
        await writeFile(filePath, buffer);
        savedFiles.push(fileName);
      }
    }

    const hash = bcrypt.hashSync(password, 10);
    companiesDb.prepare('INSERT INTO companies (firstName, lastName, email, phone, username, password, accountType, image, taxDocs, sector, location, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .run(firstName, lastName, email, phone, username, hash, accountType, imagePath, JSON.stringify(savedFiles), sector, location, 'pending');

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}