"use client";
import { useEffect, useMemo, useState } from 'react';
import { notFound, useParams, useSearchParams, useRouter } from 'next/navigation';
import Header from '../../../components/layout/Header';
import { useLang } from '../../../components/layout/Providers';
import { getCompanyDisplayName } from '../../../lib/transliteration';
import { getProfileImageUrl } from '../../../lib/image-utils';
import { motion, AnimatePresence } from 'framer-motion';

// Sector interface will be loaded from API
interface SectorService {
  id: number;
  key: string;
  title_ar: string;
  title_en: string;
  icon: string;
  description_ar: string;
  description_en: string;
  gradient: string;
  display_order: number;
  is_active: number;
  subservices: any[];
}

export default function SectorCompaniesPage() {
  const router = useRouter();
  const params = useParams() as { sector?: string } | null;
  const searchParams = useSearchParams();
  const { lang, t } = useLang();

  const [sectorObj, setSectorObj] = useState<SectorService | null>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [subservices, setSubservices] = useState<any[]>([]);
  const [cities, setCities] = useState<{ ar: string; en: string }[]>([]);
  const subKey = searchParams?.get('service') || '';

  // Load cities from admin-managed database (visible for filters)
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/cities?type=filter');
        const data = await res.json();
        if (Array.isArray(data?.cities)) {
          // Map to format: { ar: nameAr, en: nameEn }
          const mappedCities = data.cities.map((city: any) => ({
            ar: city.nameAr,
            en: city.nameEn
          }));
          setCities(mappedCities);
        }
      } catch (e) {
        console.error('Failed to fetch cities', e);
      }
    })();
  }, []);

  // Load sector and subservices dynamically from database
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/services');
        const data = await res.json();
        
        // Find the sector from the URL parameter
        const sectorParam = params?.sector ?? '';
        const slug = String(sectorParam).toLowerCase();
        
        // Try to find service by key first, then by title
        let service = data.find((s: SectorService) => s.key.toLowerCase() === slug);
        if (!service) {
          service = data.find((s: SectorService) => 
            s.title_ar === sectorParam || 
            s.title_en.toLowerCase() === slug
          );
        }
        
        if (service) {
          setSectorObj(service);
          setSubservices(service.subservices || []);
        }
      } catch (e) {
        console.error('Failed to fetch services', e);
      }
    })();
  }, [params?.sector]);

  const currentSubservice = subservices.find(s => s.key === subKey);
  const subLabel = currentSubservice ? (lang === 'ar' ? currentSubservice.title_ar : currentSubservice.title_en) : '';

  useEffect(() => {
    if (!sectorObj) return;
    fetchCompanies();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectorObj, lang, subKey]);

  async function fetchCompanies(city?: string) {
    if (!sectorObj) return;
    
    try {
      setLoading(true);
      const searchVariations = [
        lang === 'ar' ? sectorObj.title_ar : sectorObj.title_en,
        sectorObj.title_ar,
        sectorObj.title_en,
        sectorObj.key,
      ].filter((val, idx, arr) => arr.indexOf(val) === idx);

      let allCompanies: any[] = [];
      for (const sectorVariation of searchVariations) {
        const q = new URLSearchParams({ sector: sectorVariation });
        if (city) q.set('city', city);
        if (subKey) q.set('service', subKey);
        try {
          const res = await fetch(`/api/companies?${q.toString()}`);
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const newCompanies = data.filter((newComp: any) => !allCompanies.some((existingComp) => existingComp.id === newComp.id));
            allCompanies.push(...newCompanies);
          }
        } catch {}
      }
      setCompanies(allCompanies);
    } catch (e) {
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  }

  function toggleCity(cityLabel: string) {
    const already = selectedCities.includes(cityLabel);
    const next = already ? selectedCities.filter(c => c !== cityLabel) : [...selectedCities, cityLabel];
    setSelectedCities(next);
  }

  const visibleCompanies = useMemo(() => {
    if (selectedCities.length === 0) return companies;
    const labels = new Set(selectedCities.map(c => c.toLowerCase()));
    return companies.filter(c => labels.has(String(c.location || '').toLowerCase()));
  }, [companies, selectedCities]);

  if (!sectorObj && !loading) return notFound();

  const cityOptions = cities.map(c => ({ value: c[lang], label: c[lang] }));

  const gradient = sectorObj?.gradient || 'from-blue-500 to-purple-500';

  function handleSelectSubservice(key: string) {
    if (!sectorObj) return;
    const base = `/services/${sectorObj.key}`;
    const url = key ? `${base}?service=${key}` : base;
    router.push(url);
  }

  return (
    <>
      <Header navOnlyHome />
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        {/* Hero */}
        <div className={`relative overflow-hidden bg-gradient-to-r ${gradient} py-16 px-4`}>
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))]"></div>
          <div className="relative max-w-7xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center">
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white font-bold text-sm border border-white/30">
                {lang === 'ar' ? '🏢 الخدمات المتاحة' : '🏢 Available Services'}
              </span>
              {sectorObj && (
                <>
                  <h1 className="mt-4 text-4xl sm:text-5xl md:text-6xl font-bold text-white drop-shadow">
                    {lang === 'ar' ? sectorObj.title_ar : sectorObj.title_en}
                  </h1>
                  <p className="mt-3 text-lg sm:text-xl text-white/90 max-w-2xl mx-auto">
                    {lang === 'ar' ? `اكتشف أفضل الشركات المتخصصة في ${sectorObj.title_ar}` : `Discover the best companies specialized in ${sectorObj.title_en}`}
                  </p>
                </>
              )}
              <div className="mt-4 flex items-center justify-center gap-3 text-white/90">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{visibleCompanies.length}</span>
                  <span>{lang === 'ar' ? 'شركة متاحة' : 'Companies Available'}</span>
                </div>
                {selectedCities.length > 0 && (
                  <>
                    <span className="text-white/50">|</span>
                    <div className="flex items-center gap-2">
                      <span>📍</span>
                      <span>{selectedCities.length} {lang === 'ar' ? 'مدينة مختارة' : 'Cities Selected'}</span>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Subservice badge and chips */}
        <div className="max-w-7xl mx-auto px-4 -mt-6 mb-8">
          {subLabel && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center">
              <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r ${gradient} text-white shadow`}>
                <span className="font-semibold">{lang === 'ar' ? 'الخدمة الفرعية:' : 'Sub-service:'}</span>
                <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm font-bold">{subLabel}</span>
                <button onClick={() => handleSelectSubservice('')} className="px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 transition font-semibold">✕ {lang === 'ar' ? 'إزالة' : 'Clear'}</button>
              </div>
            </motion.div>
          )}

          {/* Chips */}
          {sectorObj && subservices.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-700">{lang === 'ar' ? 'الخدمات الفرعية' : 'Sub-services'}</h3>
                {subKey && (
                  <button className="text-xs font-semibold text-blue-600 hover:underline" onClick={() => handleSelectSubservice('')}>
                    {lang === 'ar' ? 'إزالة التحديد' : 'Clear selection'}
                  </button>
                )}
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                {subservices.map((subservice) => {
                  const active = subKey === subservice.key;
                  return (
                    <button key={subservice.key} onClick={() => handleSelectSubservice(active ? '' : subservice.key)}
                      className={`whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 border ${active ? `bg-gradient-to-r ${gradient} text-white border-transparent shadow` : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'}`}>
                      {subservice.icon} {lang === 'ar' ? subservice.title_ar : subservice.title_en}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="max-w-7xl mx-auto px-4 pb-16">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar filter */}
            <motion.aside initial={{ opacity: 0, x: lang === 'ar' ? 50 : -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="lg:w-80 shrink-0">
              <div className={`sticky top-6 bg-gradient-to-br ${gradient} p-1 rounded-2xl shadow-2xl`}>
                <div className="bg-white rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🗺️</span>
                      <h2 className="text-xl font-bold text-gray-800">{lang === 'ar' ? 'فلتر المدن' : 'City Filter'}</h2>
                    </div>
                    <button className="text-sm text-blue-600 hover:underline" onClick={() => setSelectedCities([])}>{lang === 'ar' ? 'إعادة تعيين' : 'Reset'}</button>
                  </div>
                  {selectedCities.length > 0 && (
                    <div className={`mb-4 p-3 rounded-xl bg-gradient-to-r ${gradient} text-white`}>
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <span>✓</span>
                        <span>{selectedCities.length} {lang === 'ar' ? 'مدينة مختارة' : 'Cities Selected'}</span>
                      </div>
                    </div>
                  )}
                  <div className="flex flex-col gap-2 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                    {cityOptions.map(c => (
                      <label key={c.value} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-all duration-200 group">
                        <input type="checkbox" checked={selectedCities.includes(c.label)} onChange={() => toggleCity(c.label)} className="w-5 h-5 rounded accent-current cursor-pointer" style={{ accentColor: 'currentColor' }} />
                        <span className={`font-medium ${selectedCities.includes(c.label) ? `bg-gradient-to-r ${gradient} bg-clip-text text-transparent font-bold` : 'text-gray-700 group-hover:text-gray-900'}`}>{c.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </motion.aside>

            {/* Companies grid */}
            <section className="flex-1">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-600 font-semibold">{lang === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
                </div>
              ) : visibleCompanies.length === 0 ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20 bg-white rounded-2xl shadow-lg">
                  <div className="text-8xl mb-6">🏢</div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">{lang === 'ar' ? 'لا توجد شركات مسجلة' : 'No Companies Registered'}</h3>
                  <p className="text-gray-600 max-w-lg mx-auto text-lg">
                    {sectorObj && (lang === 'ar' 
                      ? `لا توجد شركات مسجلة تقدم خدمة ${sectorObj.title_ar} حتى الآن. سنقوم بإضافة الشركات بمجرد تسجيلها.` 
                      : `No companies are registered for ${sectorObj.title_en} service yet. We'll add companies as they register.`)}
                  </p>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-6 grid-cols-1 xl:grid-cols-2">
                  <AnimatePresence>
                    {visibleCompanies.map((company: any, idx: number) => (
                      <motion.div key={company.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3, delay: idx * 0.05 }} whileHover={{ y: -6, transition: { duration: 0.2 } }} className="group cursor-pointer" onClick={() => (window.location.href = `/company/${company.id}`)}>
                        <div className={`relative bg-gradient-to-br ${gradient} p-1 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300`}>
                          <div className="bg-white rounded-xl p-6 h-full">
                            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-5 rounded-bl-full`}></div>
                            <div className="relative">
                              <div className="flex items-start gap-4 mb-4">
                                <div className="relative">
                                  <div className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-2xl blur-md opacity-40 group-hover:opacity-60 transition-opacity`}></div>
                                  <img src={getProfileImageUrl(company.image)} alt={getCompanyDisplayName(company, lang)} className="relative w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-lg" onError={(e) => { (e.target as HTMLImageElement).src = '/profile-images/default-avatar.svg'; }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h2 className="text-xl font-bold text-gray-900 mb-1 truncate group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all">{getCompanyDisplayName(company, lang)}</h2>
                                  <div className="flex items-center gap-1 mb-2">
                                    {[1,2,3,4,5].map(i => (
                                      <span key={i} className={`text-lg ${i <= (company.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                                    ))}
                                    <span className="text-sm text-gray-500 mr-1">({company.reviewsCount || 0})</span>
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-3 mb-5">
                                <div className="flex items-center gap-3 text-gray-700"><span className="text-xl">📧</span><span className="text-sm">{company.email}</span></div>
                                <div className="flex items-center gap-3 text-gray-700"><span className="text-xl">📱</span><span className="text-sm font-medium phone-number">{company.phone}</span></div>
                                <div className="flex items-center gap-3">
                                  <span className="text-xl">📍</span>
                                  <span className={`text-sm font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
                                    {(() => {
                                      const hit = cities.find(c => c.ar === company.location || c.en === company.location);
                                      return hit ? hit[lang] : company.location;
                                    })()}
                                  </span>
                                </div>
                              </div>
                              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className={`w-full py-3 px-6 rounded-xl bg-gradient-to-r ${gradient} text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 group/btn`} onClick={(e) => { e.stopPropagation(); window.location.href = `/company/${company.id}`; }}>
                                <span>{t('company.viewProfile')}</span>
                                {lang === 'ar' ? (
                                  <svg className="w-5 h-5 transform group-hover/btn:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l-5 5 5 5" /></svg>
                                ) : (
                                  <svg className="w-5 h-5 transform group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5-5 5" /></svg>
                                )}
                              </motion.button>
                              <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r ${gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-b-xl`}></div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </section>
          </div>
        </div>

        <style jsx global>{`
          .custom-scrollbar::-webkit-scrollbar { width: 6px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: linear-gradient(180deg, #3b82f6, #8b5cf6); border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: linear-gradient(180deg, #2563eb, #7c3aed); }
          .bg-grid-white\/10 { background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(255 255 255 / 0.1)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e"); }
        `}</style>
      </main>
    </>
  );
}
