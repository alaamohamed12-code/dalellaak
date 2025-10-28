import { NextRequest, NextResponse } from 'next/server';
import companiesDb from '../../../lib/companies-db';

export async function PATCH(req: NextRequest) {
  try {
    const { companyId, subservices } = await req.json();
    if (!companyId || !Array.isArray(subservices)) {
      return NextResponse.json({ error: 'companyId و subservices مطلوبة' }, { status: 400 });
    }
    const json = JSON.stringify(subservices);
    companiesDb.prepare('UPDATE companies SET subservices = ? WHERE id = ?').run(json, companyId);
    const updated = companiesDb.prepare('SELECT id, subservices FROM companies WHERE id = ?').get(companyId);
    return NextResponse.json({ success: true, company: updated });
  } catch (e: any) {
    return NextResponse.json({ error: 'خطأ في الخادم', details: String(e) }, { status: 500 });
  }
}
