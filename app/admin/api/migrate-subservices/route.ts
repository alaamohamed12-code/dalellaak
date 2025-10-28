import { NextRequest, NextResponse } from 'next/server';
import db from '../../../../lib/companies-db';

export async function POST(req: NextRequest) {
  try {
    // Optional naive admin check via header (replace with real auth in production)
    const token = req.headers.get('x-admin-token');
    if (!token || token !== process.env.ADMIN_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const info = db.prepare("PRAGMA table_info('companies')").all() as Array<{ name: string }>;
    const hasSubservices = info.some(c => c.name === 'subservices');
    if (!hasSubservices) {
      db.exec("ALTER TABLE companies ADD COLUMN subservices TEXT");
    }
    return NextResponse.json({ success: true, hasSubservices: true });
  } catch (e: any) {
    return NextResponse.json({ error: 'Migration failed', details: String(e) }, { status: 500 });
  }
}
