// حذف عمل
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const workId = searchParams.get('id');
  const companyId = searchParams.get('companyId');
  if (!workId || !companyId) return NextResponse.json({ error: 'id و companyId مطلوبان' }, { status: 400 });
  // تحقق من ملكية الشركة للعمل
  const work = db.prepare('SELECT * FROM works WHERE id = ? AND companyId = ?').get(workId, companyId);
  if (!work) return NextResponse.json({ error: 'العمل غير موجود أو ليس لك' }, { status: 404 });
  db.prepare('DELETE FROM works WHERE id = ? AND companyId = ?').run(workId, companyId);
  return NextResponse.json({ success: true });
}

// تعديل عمل
export async function PATCH(req: Request) {
  const contentType = req.headers.get('content-type') || '';
  let data: any = {};
  if (contentType.includes('application/json')) {
    data = await req.json();
  } else if (contentType.includes('multipart/form-data')) {
    const formData = await req.formData();
    data.id = formData.get('id');
    data.companyId = formData.get('companyId');
    data.title = formData.get('title');
    data.description = formData.get('description');
    data.media = formData.getAll('media');
  }
  const { id, companyId, title, description, media } = data;
  if (!id || !companyId || !title) return NextResponse.json({ error: 'جميع الحقول مطلوبة' }, { status: 400 });
  // تحقق من ملكية الشركة للعمل
  const work = db.prepare('SELECT * FROM works WHERE id = ? AND companyId = ?').get(id, companyId) as any;
  if (!work) return NextResponse.json({ error: 'العمل غير موجود أو ليس لك' }, { status: 404 });
  let mediaArr = Array.isArray(media) ? media : [];
  // إذا لم يتم رفع ميديا جديدة، استخدم القديمة
  if (mediaArr.length === 0 && work.media) mediaArr = JSON.parse(work.media);
  db.prepare('UPDATE works SET title = ?, description = ?, media = ? WHERE id = ? AND companyId = ?')
    .run(title, description, JSON.stringify(mediaArr), id, companyId);
  return NextResponse.json({ success: true });
}
import db from '../../../lib/company-works-db';
import companiesDb from '../../../lib/companies-db';
import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(req: Request) {
  // إضافة عمل جديد
  const contentType = req.headers.get('content-type') || '';
  if (!contentType.includes('multipart/form-data')) {
    return NextResponse.json({ error: 'يجب استخدام FormData' }, { status: 400 });
  }
  const formData = await req.formData();
  const companyId = formData.get('companyId');
  const title = formData.get('title');
  const description = formData.get('description');
  const mediaFiles = formData.getAll('media');

  if (!companyId || !title) {
    return NextResponse.json({ error: 'جميع الحقول مطلوبة' }, { status: 400 });
  }

  // تحقق من الشركة
  const company = companiesDb.prepare('SELECT * FROM companies WHERE id = ?').get(companyId);
  if (!company) {
    return NextResponse.json({ error: 'الشركة غير موجودة' }, { status: 404 });
  }

  // حفظ الملفات
  const savedFiles: string[] = [];
  if (mediaFiles.length > 15) {
    return NextResponse.json({ error: 'الحد الأقصى للملفات هو 15' }, { status: 400 });
  }
  for (const file of mediaFiles) {
    if (typeof file === 'object' && 'arrayBuffer' in file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const ext = (file as File).name.split('.').pop() || 'jpg';
      const fileName = `${Date.now()}_${Math.random().toString(36).slice(2,8)}.${ext}`;
      const filePath = path.join(process.cwd(), 'public', 'company-works', fileName);
      await writeFile(filePath, buffer);
      savedFiles.push(fileName);
    }
  }

  db.prepare('INSERT INTO works (companyId, title, description, media) VALUES (?, ?, ?, ?)')
    .run(companyId, title, description, JSON.stringify(savedFiles));

  return NextResponse.json({ success: true });
}

export async function GET(req: Request) {
  // جلب أعمال شركة معينة
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get('companyId');
  if (!companyId) return NextResponse.json({ error: 'companyId مطلوب' }, { status: 400 });
  const works = db.prepare('SELECT * FROM works WHERE companyId = ? ORDER BY createdAt DESC').all(companyId);
  return NextResponse.json({ works });
}
