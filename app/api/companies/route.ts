import { NextRequest, NextResponse } from 'next/server';
import companiesDb from '../../../lib/companies-db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sector = searchParams.get('sector'); // يمكن أن يأتي بالعربية أو الإنجليزية
    const city = searchParams.get('city');
    const service = searchParams.get('service'); // مفتاح الخدمة الفرعية (اختياري)

    if (!sector) {
      return NextResponse.json({ error: 'Missing sector' }, { status: 400 });
    }

    // نجلب جميع الشركات المعتمدة والنشطة فقط (لديها عضوية نشطة)
    const now = new Date().toISOString();
    const rows = companiesDb
      .prepare(`
        SELECT id, firstName, lastName, email, phone, image, location, sector, status, subservices, 
               membershipStatus, membershipExpiry
        FROM companies 
        WHERE status = ? 
        AND membershipStatus = 'active' 
        AND (membershipExpiry IS NULL OR membershipExpiry > ?)
      `)
      .all('approved', now);

    // فلترة حسب القطاع (يدعم العربية والإنجليزية والمفاتيح المختلفة)
    const filteredBySector = rows.filter((c: any) => {
      if (!c.sector) return false;
      
      const companySector = String(c.sector).toLowerCase().trim();
      const searchSector = String(sector).toLowerCase().trim();
      
      // مقارنة مباشرة
      if (companySector === searchSector) return true;
      
      // قاموس ترجمة القطاعات للمطابقة المرنة
      const sectorMapping: { [key: string]: string[] } = {
        'استشارات هندسية': ['استشارات هندسية', 'engineering consulting', 'engineering-consulting', 'consulting'],
        'مقاولات': ['مقاولات', 'contracting', 'contractor'],
        'مواد البناء': ['مواد البناء', 'building materials', 'materials', 'مواد بناء'],
        'الديكور والتأثيث': ['الديكور والتأثيث', 'decoration & furnishing', 'design', 'ديكور', 'تأثيث'],
        'تشطيبات': ['تشطيبات', 'finishing', 'تشطيب'],
        'أعمال كهرباء': ['أعمال كهرباء', 'electrical works', 'electrical', 'كهرباء'],
        'أعمال سباكة': ['أعمال سباكة', 'plumbing works', 'plumbing', 'سباكة'],
        'نجارة': ['نجارة', 'carpentry', 'نجار'],
        'حدادة': ['حدادة', 'blacksmithing', 'حداد'],
        'دهانات': ['دهانات', 'painting', 'دهان'],
      };
      
      // البحث في قاموس الترجمة
      for (const [key, variations] of Object.entries(sectorMapping)) {
        const keyLower = key.toLowerCase();
        if (companySector === keyLower || variations.some(v => v.toLowerCase() === companySector)) {
          if (variations.some(v => v.toLowerCase() === searchSector) || keyLower === searchSector) {
            return true;
          }
        }
      }
      
      return false;
    });

    // فلترة اختيارية بالمدينة
    // فلترة اختيارية بالخدمة الفرعية
    let filtered = filteredBySector;
    if (service) {
      const subKey = String(service).trim();
      filtered = filtered.filter((c: any) => {
        try {
          const subs = c.subservices ? JSON.parse(c.subservices) : [];
          return Array.isArray(subs) && subs.includes(subKey);
        } catch {
          return false;
        }
      });
    }

    // فلترة اختيارية بالمدينة
    filtered = city
      ? filtered.filter((c: any) => String(c.location || '').toLowerCase() === String(city).toLowerCase())
      : filtered;

    // إضافة حقول التقييم الافتراضية
    const result = filtered.map((c: any) => ({
      id: c.id,
      firstName: c.firstName,
      lastName: c.lastName,
      email: c.email,
      phone: c.phone,
      image: c.image,
      location: c.location,
      sector: c.sector,
      subservices: c.subservices,
      rating: 0,
      reviewsCount: 0,
    }));

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: 'Server error', details: String(err) }, { status: 500 });
  }
}
