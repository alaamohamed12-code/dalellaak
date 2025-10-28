import db from '../../../lib/db';
import companiesDb from '../../../lib/companies-db';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(req: Request) {
  let username = '', firstName = '', lastName = '', email = '', phone = '', newUsername = '';
  let currentPassword = '', newPassword = '', accountType = '';
  let imagePath = '';
  let isFormData = false;
  let imageFile: File | null = null;

  // دعم استقبال FormData أو JSON
  const contentType = req.headers.get('content-type') || '';
  if (contentType.includes('multipart/form-data')) {
    isFormData = true;
    const formData = await req.formData();
    username = formData.get('username') as string;
    firstName = formData.get('firstName') as string;
    lastName = formData.get('lastName') as string;
    email = formData.get('email') as string;
    phone = formData.get('phone') as string;
    newUsername = formData.get('newUsername') as string;
    currentPassword = formData.get('currentPassword') as string || '';
    newPassword = formData.get('newPassword') as string || '';
    accountType = formData.get('accountType') as string;
    imageFile = formData.get('image') as File | null;
  } else {
    const body = await req.json();
    username = body.username;
    firstName = body.firstName;
    lastName = body.lastName;
    email = body.email;
    phone = body.phone;
    newUsername = body.newUsername;
    currentPassword = body.currentPassword || '';
    newPassword = body.newPassword || '';
    accountType = body.accountType;
  }

  if (!username || !firstName || !lastName || !email || !newUsername) {
    return NextResponse.json({ error: 'جميع الحقول المطلوبة يجب ملؤها' }, { status: 400 });
  }

  try {
    // تحديد نوع المستخدم وقاعدة البيانات المناسبة
    const isCompany = accountType === 'company';
    const targetDb = isCompany ? companiesDb : db;
    const tableName = isCompany ? 'companies' : 'users';
    
    // جلب بيانات المستخدم الحالية
    const currentUser = targetDb.prepare(`SELECT * FROM ${tableName} WHERE username = ?`).get(username) as any;
    if (!currentUser) {
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
    }

    // التحقق من كلمة المرور الحالية إذا تم تمرير كلمة مرور جديدة
    if (newPassword && currentPassword) {
      const validPassword = bcrypt.compareSync(currentPassword, currentUser.password);
      if (!validPassword) {
        return NextResponse.json({ error: 'كلمة المرور الحالية غير صحيحة' }, { status: 401 });
      }
    }

    // التحقق من عدم تكرار البريد الإلكتروني أو اسم المستخدم (إذا تم تغييرهما)
    if (email !== currentUser.email || newUsername !== currentUser.username) {
      // فحص في جدول المستخدمين
      const duplicateUser = db.prepare('SELECT * FROM users WHERE (email = ? OR username = ?) AND username != ?').get(email, newUsername, username);
      if (duplicateUser) {
        return NextResponse.json({ error: 'البريد الإلكتروني أو اسم المستخدم مستخدم بالفعل' }, { status: 409 });
      }
      
      // فحص في جدول الشركات
      const duplicateCompany = companiesDb.prepare('SELECT * FROM companies WHERE (email = ? OR username = ?) AND username != ?').get(email, newUsername, username);
      if (duplicateCompany) {
        return NextResponse.json({ error: 'البريد الإلكتروني أو اسم المستخدم مستخدم بالفعل' }, { status: 409 });
      }
    }

    // حفظ الصورة الجديدة إذا تم رفعها
    if (isFormData && imageFile && typeof imageFile === 'object' && 'arrayBuffer' in imageFile) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const ext = (imageFile.name || '').split('.').pop() || 'png';
      const fileName = `${Date.now()}_${newUsername}.${ext}`;
      const filePath = path.join(process.cwd(), 'public', 'profile-images', fileName);
      await writeFile(filePath, buffer);
      imagePath = `/profile-images/${fileName}`;
    } else {
      imagePath = currentUser.image; // الاحتفاظ بالصورة الحالية
    }

    // تحضير الاستعلام لتحديث البيانات
    let updateQuery = `UPDATE ${tableName} SET firstName = ?, lastName = ?, email = ?, phone = ?, username = ?, image = ?`;
    let params = [firstName, lastName, email, phone, newUsername, imagePath];

    // إضافة كلمة المرور الجديدة إذا تم تمريرها
    if (newPassword && currentPassword) {
      const hashedPassword = bcrypt.hashSync(newPassword, 10);
      updateQuery += ', password = ?';
      params.push(hashedPassword);
    }

    updateQuery += ' WHERE username = ?';
    params.push(username);

    // تنفيذ التحديث
    targetDb.prepare(updateQuery).run(...params);

    return NextResponse.json({ success: true, imagePath: imagePath });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}