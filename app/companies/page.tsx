"use client";
import { useEffect, useMemo, useState } from 'react';
import Header from '../../components/layout/Header';
import { useSearchParams } from 'next/navigation';
import { useLang } from '../../components/layout/Providers';
import { getCompanyDisplayName } from '../../lib/transliteration';
import { getProfileImageUrl } from '../../lib/image-utils';

// Map sub-service keys to localized labels and parent sectors
const sectorBySub: Record<string, string> = {
  // engineering-consulting
  'architectural-design': 'engineering-consulting',
  'structural-design': 'engineering-consulting',
  'electrical': 'engineering-consulting',
  'mechanical': 'engineering-consulting',
  'project-management': 'engineering-consulting',
  'valuation': 'engineering-consulting',
  // contracting
  'building-construction': 'contracting',
  'structures': 'contracting',
  'restoration': 'contracting',
  'site-management': 'contracting',
  'finishing': 'contracting',
  'maintenance-services': 'contracting',
  // building-materials
  'cement': 'building-materials',
  'steel': 'building-materials',
  'insulation': 'building-materials',
  'marble': 'building-materials',
  'paints': 'building-materials',
  'timber': 'building-materials',
  // decoration-furnishing
  'interior-design': 'decoration-furnishing',
  'furniture': 'decoration-furnishing',
  'lighting': 'decoration-furnishing',
  'windows': 'decoration-furnishing',
  'fabrics': 'decoration-furnishing',
  'details': 'decoration-furnishing',
};

const labels: Record<string, { ar: string; en: string }> = {
  // engineering-consulting
  'architectural-design': { ar: 'تصميم معماري', en: 'Architectural Design' },
  'structural-design': { ar: 'تصميم إنشائي', en: 'Structural Design' },
  'electrical': { ar: 'كهرباء', en: 'Electrical' },
  'mechanical': { ar: 'ميكانيكا', en: 'Mechanical' },
  'project-management': { ar: 'إدارة مشاريع', en: 'Project Management' },
  'valuation': { ar: 'تقييم', en: 'Valuation' },
  // contracting
  'building-construction': { ar: 'بناء مباني', en: 'Building Construction' },
  'structures': { ar: 'هياكل', en: 'Structures' },
  'restoration': { ar: 'أعمال ترميم', en: 'Restoration' },
  'site-management': { ar: 'إدارة موقع', en: 'Site Management' },
  'finishing': { ar: 'تشطيب', en: 'Finishing' },
  'maintenance-services': { ar: 'خدمات الصيانة', en: 'Maintenance Services' },
  // building-materials
  'cement': { ar: 'أسمنت', en: 'Cement' },
  'steel': { ar: 'حديد', en: 'Steel' },
  'insulation': { ar: 'عزل', en: 'Insulation' },
  'marble': { ar: 'رخام', en: 'Marble' },
  'paints': { ar: 'دهانات', en: 'Paints' },
  'timber': { ar: 'خشب', en: 'Timber' },
  // decoration-furnishing
  'interior-design': { ar: 'تصميم داخلي', en: 'Interior Design' },
  'furniture': { ar: 'أثاث', en: 'Furniture' },
  'lighting': { ar: 'إضاءة', en: 'Lighting' },
  'windows': { ar: 'نوافذ', en: 'Windows' },
  'fabrics': { ar: 'أقمشة', en: 'Fabrics' },
  'details': { ar: 'تفاصيل', en: 'Details' },
};

export default function CompaniesPage() {
  const searchParams = useSearchParams();
  const { lang, t } = useLang();
  const subKey = searchParams?.get('service') || '';
  const sectorKey = sectorBySub[subKey] || '';
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        let fetched: any[] = [];
        if (sectorKey) {
          const res = await fetch(`/api/companies?sector=${encodeURIComponent(sectorKey)}&service=${encodeURIComponent(subKey)}`);
          try {
            const data = await res.json();
            if (Array.isArray(data)) fetched = data;
          } catch {}
        }
        setCompanies(fetched);
      } catch {
        setCompanies([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [subKey, sectorKey, lang]);

  const subLabel = useMemo(() => labels[subKey]?.[lang] || '', [subKey, lang]);

  return (
    <>
      <Header navOnlyHome />
      <main className="max-w-7xl mx-auto py-10 px-4">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-cyan-800">{lang === 'ar' ? 'الشركات' : 'Companies'}</h1>
          {subLabel && (
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-700 font-bold text-sm">
              <span>{lang === 'ar' ? 'الخدمة الفرعية:' : 'Sub-service:'}</span>
              <span className="px-2 py-0.5 rounded-full bg-cyan-600 text-white">{subLabel}</span>
            </div>
          )}
        </div>
        {loading ? (
          <div className="text-center text-gray-500 py-12">{lang === 'ar' ? 'جاري التحميل...' : 'Loading...'}</div>
        ) : companies.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 text-6xl mb-4">🏢</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              {lang === 'ar' ? 'لا توجد شركات مطابقة' : 'No matching companies'}
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {lang === 'ar' ? 'لم نجد شركات تقدم هذه الخدمة الفرعية حتى الآن.' : 'We could not find companies offering this sub-service yet.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-5 grid-cols-1 md:grid-cols-2">
            {companies.map((company: any) => (
              <div key={company.id} className="bg-white rounded-xl shadow p-5 flex flex-col gap-2 border border-cyan-100">
                <div className="flex items-center gap-3 mb-2">
                  <img 
                    src={getProfileImageUrl(company.image)} 
                    alt={getCompanyDisplayName(company, lang)} 
                    className="w-16 h-16 rounded-full object-cover border-2 border-cyan-200 bg-cyan-50"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/profile-images/default-avatar.svg';
                    }}
                  />
                  <div>
                    <h2 className="text-lg font-bold text-cyan-800">{getCompanyDisplayName(company, lang)}</h2>
                    <p className="text-gray-600 text-sm">{company.email}</p>
                    <p className="text-gray-600 text-sm phone-number">{company.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-1 text-sm">
                  <span className="font-bold">{lang === 'ar' ? 'المدينة:' : 'City:'}</span>
                  <span className="text-cyan-700">{company.location}</span>
                </div>
                <a href={`/company/${company.id}`} className="mt-2 inline-block bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-full text-center transition">
                  {lang === 'ar' ? 'عرض الملف' : 'View Profile'}
                </a>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
