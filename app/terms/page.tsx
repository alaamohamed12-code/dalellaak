"use client"
import Link from "next/link";
import { useLang } from '@/components/layout/Providers';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TermSection {
  id: number;
  sectionId: string;
  title: string;
  content: string;
  icon: string;
  displayOrder: number;
  isActive: number;
}

export default function TermsPage() {
  const { lang } = useLang();
  const [terms, setTerms] = useState<TermSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch terms from API with language parameter
    setLoading(true);
    fetch(`/api/terms?activeOnly=true&lang=${lang}`)
      .then(res => res.json())
      .then(data => {
        setTerms(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading terms:', error);
        setLoading(false);
      });
  }, [lang]); // Re-fetch when language changes

  const toc = terms.map(term => ({
    id: term.sectionId,
    label: term.title
  }));

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {lang === 'ar' ? 'جاري تحميل الشروط والأحكام...' : 'Loading Terms and Conditions...'}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <section className="relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.08),transparent_40%),radial-gradient(circle_at_80%_10%,rgba(16,185,129,0.08),transparent_40%)]"/>
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center justify-between gap-4 mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-emerald-600 to-purple-600 bg-clip-text text-transparent">
              {lang === 'ar' ? 'الشروط والأحكام' : 'Terms and Conditions'}
            </h1>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-xs">
                <Link href="/" className="text-gray-500 hover:text-gray-700">
                  {lang === 'ar' ? 'الرئيسية' : 'Home'}
                </Link>
                <span className="text-gray-400">/</span>
                <span className="text-gray-700 font-semibold">
                  {lang === 'ar' ? 'الشروط والأحكام' : 'Terms'}
                </span>
              </div>
              <Link
                href="/"
                className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold px-3 py-2 shadow hover:shadow-md"
                aria-label={lang === 'ar' ? 'العودة إلى الرئيسية' : 'Back to Home'}
              >
                <span>{lang === 'ar' ? 'العودة إلى الرئيسية' : 'Back to Home'}</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={lang === 'ar' ? "M9 18l6-6-6-6" : "M15 18l-6-6 6-6"} />
                </svg>
              </Link>
            </div>
          </div>

          {/* Quick navigation */}
          <div className="mb-6">
            <div className="rounded-2xl border border-gray-200 bg-white/70 backdrop-blur p-3 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-extrabold text-gray-800">
                  {lang === 'ar' ? 'روابط سريعة' : 'Quick Links'}
                </div>
                <Link href="/" className="sm:hidden inline-flex items-center gap-1.5 text-xs text-blue-700 hover:underline">
                  {lang === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d={lang === 'ar' ? "M9 18l6-6-6-6" : "M15 18l-6-6 6-6"}/>
                  </svg>
                </Link>
              </div>
              <div className="flex flex-wrap gap-2">
                {toc.map(item => (
                  <a key={item.id} href={`#${item.id}`} className="inline-flex items-center gap-2 text-xs sm:text-sm px-3 py-1.5 rounded-full border border-gray-200 bg-white hover:border-blue-300 hover:text-blue-700 transition-colors">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600" />
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-5 sm:p-8">
              {terms.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📄</div>
                  <p className="text-gray-500 text-lg">
                    {lang === 'ar' ? 'لا توجد شروط وأحكام متاحة حالياً' : 'No terms and conditions available at the moment'}
                  </p>
                </div>
              ) : (
                <article className="space-y-10 text-gray-800 leading-8">
                  {terms.map((term) => (
                    <Section 
                      key={term.id} 
                      id={term.sectionId} 
                      icon={<span>{term.icon}</span>} 
                      title={term.title}
                    >
                      {term.content.split('\n').map((line, index) => {
                        // If line starts with bullet point or dash, render as list item
                        const trimmedLine = line.trim();
                        if (trimmedLine) {
                          return (
                            <p key={index} className="mb-2">
                              {trimmedLine}
                            </p>
                          );
                        }
                        return null;
                      })}
                    </Section>
                  ))}
                </article>
              )}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between gap-3">
            <div className="text-xs text-gray-500">
              {lang === 'ar' ? 'آخر تحديث:' : 'Last updated:'} {new Date().toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US')}
            </div>
            <Link href="/" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold px-3 py-2 shadow hover:shadow-md">
              <span>{lang === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={lang === 'ar' ? "M9 18l6-6-6-6" : "M15 18l-6-6 6-6"} />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function Section({ id, title, icon, children }: { id: string; title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section id={id} className="space-y-3 scroll-mt-24">
      <div className="flex items-center gap-2">
        {icon && (
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 text-blue-700 flex items-center justify-center text-lg">
            {icon}
          </div>
        )}
        <h2 className="text-lg sm:text-xl font-extrabold text-gray-900">
          {title}
        </h2>
      </div>
      <div className="text-sm sm:text-base text-gray-700 space-y-2">
        {children}
      </div>
      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mt-4" />
    </section>
  );
}
