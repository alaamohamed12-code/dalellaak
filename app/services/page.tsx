import Link from 'next/link';
import { useLang } from '../../components/layout/Providers';

const sectorsList = [
  { key: 'engineering', ar: 'استشارات هندسية', en: 'Engineering Consulting' },
  { key: 'contracting', ar: 'مقاولات', en: 'Contracting' },
  { key: 'building', ar: 'مواد بناء', en: 'Building Materials' },
  { key: 'finishing', ar: 'تشطيبات', en: 'Finishing' },
  { key: 'electrical', ar: 'أعمال كهرباء', en: 'Electrical Works' },
  { key: 'plumbing', ar: 'أعمال سباكة', en: 'Plumbing Works' },
  { key: 'carpentry', ar: 'نجارة', en: 'Carpentry' },
  { key: 'blacksmithing', ar: 'حدادة', en: 'Blacksmithing' },
  { key: 'painting', ar: 'دهانات', en: 'Painting' },
  { key: 'other', ar: 'أخرى', en: 'Other' },
];

export default function ServicesPage() {
  const { lang, t } = useLang();
  return (
    <main className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6 text-center">{t('services.title') || (lang === 'ar' ? 'الخدمات' : 'Services')}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sectorsList.map(sec => (
          <Link
            key={sec.key}
            href={`/services/${sec.key}`}
            className="block p-6 rounded-xl shadow bg-white hover:bg-cyan-50 border border-cyan-100 text-center text-lg font-semibold transition"
          >
            {sec[lang]}
          </Link>
        ))}
      </div>
    </main>
  );
}
