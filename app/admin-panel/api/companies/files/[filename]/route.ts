import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function GET(req: Request, { params }: { params: { filename: string } }) {
  try {
    const filename = params.filename;
    const filePath = path.join(process.cwd(), 'company-uploads', filename);
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'الملف غير موجود' }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    const extension = path.extname(filename).toLowerCase();
    
    let contentType = 'application/octet-stream';
    if (['.jpg', '.jpeg', '.png', '.gif'].includes(extension)) {
      contentType = `image/${extension.slice(1)}`;
    } else if (extension === '.pdf') {
      contentType = 'application/pdf';
    }

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${filename}"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}