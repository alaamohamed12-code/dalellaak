"use client";
import Header from '../../components/layout/Header';
import { useRouter, useSearchParams } from 'next/navigation';
import React from 'react';

type SubService = { key: string; title: string };
type MainService = { key: string; title: string; subs: SubService[] };

const services: MainService[] = [
  {
    key: 'engineering-consulting',
    title: 'استشارات هندسية',
    subs: [
      { key: 'architectural-design', title: 'تصميم معماري' },
      { key: 'structural-design', title: 'تصميم إنشائي' },
      { key: 'electrical', title: 'كهرباء' },
      { key: 'mechanical', title: 'ميكانيكا' },
      { key: 'project-management', title: 'إدارة مشاريع' },
      { key: 'valuation', title: 'تقييم' },
    ],
  },
  {
    key: 'contracting',
    title: 'المقاولات',
    subs: [
      { key: 'building-construction', title: 'بناء مباني' },
      { key: 'structures', title: 'هياكل' },
      { key: 'restoration', title: 'أعمال ترميم' },
      { key: 'site-management', title: 'إدارة موقع' },
      { key: 'finishing', title: 'تشطيب' },
      { key: 'maintenance-services', title: 'خدمات الصيانة' },
    ],
  },
  {
    key: 'building-materials',
    title: 'مواد البناء',
    subs: [
      { key: 'cement', title: 'أسمنت' },
      { key: 'steel', title: 'حديد' },
      { key: 'insulation', title: 'عزل' },
      { key: 'marble', title: 'رخام' },
      { key: 'paints', title: 'دهانات' },
      { key: 'timber', title: 'خشب' },
    ],
  },
  {
    key: 'decoration-furnishing',
    title: 'الديكور والتأثيث',
    subs: [
      { key: 'interior-design', title: 'تصميم داخلي' },
      { key: 'furniture', title: 'أثاث' },
      { key: 'lighting', title: 'إضاءة' },
      { key: 'windows', title: 'نوافذ' },
      { key: 'fabrics', title: 'أقمشة' },
      { key: 'details', title: 'تفاصيل' },
    ],
  },
];

function SubServiceButton({ title, onClick }: { title: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-full px-4 py-2 font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow border-2 border-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-400"
      aria-label={title}
    >
      {title}
    </button>
  );
}

export default function BlankPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const serviceKey = searchParams?.get('service');
  const service = services.find(s => s.key === serviceKey);

  return (
    <>
      <Header navOnlyHome />
      <main className="min-h-screen py-8 px-4 flex flex-col items-center">
        {service ? (
          <>
            <h2 className="text-2xl font-bold mb-8 text-cyan-700">{service.title}</h2>
            <div className="w-full max-w-3xl grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {service.subs.map(sub => (
                <SubServiceButton
                  key={sub.key}
                  title={sub.title}
                  onClick={() => router.push(`/companies?service=${encodeURIComponent(sub.key)}`)}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-gray-400 text-xl">اختر خدمة رئيسية لعرض خدماتها الفرعية</div>
        )}
      </main>
    </>
  );
}
