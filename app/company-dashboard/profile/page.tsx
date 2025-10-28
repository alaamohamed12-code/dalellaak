"use client";
import { useEffect, useState } from 'react';
import Header from '../../../components/layout/Header';
import { useRouter } from 'next/navigation';
import { useLang } from '../../../components/layout/Providers';
import { getCompanyDisplayName } from '../../../lib/transliteration';
import { getProfileImageUrl } from '../../../lib/image-utils';

export default function CompanyDashboardProfile() {
  const { t, lang } = useLang();
  // نفس القوائم من صفحة التسجيل
  const sectorsList = [
    { ar: 'استشارات هندسية', en: 'Engineering Consulting' },
    { ar: 'مقاولات', en: 'Contracting' },
    { ar: 'مواد بناء', en: 'Building Materials' },
    { ar: 'تشطيبات', en: 'Finishing' },
    { ar: 'أعمال كهرباء', en: 'Electrical Works' },
    { ar: 'أعمال سباكة', en: 'Plumbing Works' },
    { ar: 'نجارة', en: 'Carpentry' },
    { ar: 'حدادة', en: 'Blacksmithing' },
    { ar: 'دهانات', en: 'Painting' },
    { ar: 'أخرى', en: 'Other' },
  ];
  // Dynamic cities list from admin-managed DB
  const [cities, setCities] = useState<{ ar: string; en: string }[]>([]);
  const [user, setUser] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);
  const [editingSector, setEditingSector] = useState(false);
  const [sectorValue, setSectorValue] = useState('');
  const [sectorLoading, setSectorLoading] = useState(false);
  const [subservices, setSubservices] = useState<string[]>([]);
  const [savingSubs, setSavingSubs] = useState(false);
  const sectors = [
    'استشارات هندسية',
    'مقاولات',
    'مواد بناء',
    'تشطيبات',
    'أعمال كهرباء',
    'أعمال سباكة',
    'نجارة',
    'حدادة',
    'دهانات',
    'أخرى',
  ];
  const [works, setWorks] = useState<any[]>([]);
  // Dynamic services/subservices from DB (admin-managed)
  const [services, setServices] = useState<any[]>([]);
  const [servicesLoading, setServicesLoading] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const u = localStorage.getItem('user');
      if (!u) {
        router.push('/login');
        return;
      }
      const parsed = JSON.parse(u);
      if (parsed.accountType !== 'company') {
        router.push('/');
        return;
      }
      setUser(parsed);
      // Load company profile
      fetch(`/api/company-profile?id=${parsed.id}&username=${encodeURIComponent(parsed.username)}`)
        .then(res => res.json())
        .then(data => {
          console.log('API response:', data);
          setCompany(data.company);
          setWorks(data.works || []);
          setSectorValue(data.company?.sector || '');
          // Initialize subservices from company (stored as keys array)
          try {
            const subs = data.company?.subservices ? JSON.parse(data.company.subservices) : [];
            if (Array.isArray(subs)) setSubservices(subs);
          } catch {}
          setLoading(false);
        });
      // Load services and subservices (admin-managed)
      fetch('/api/services')
        .then(r => r.json())
        .then((data) => {
          if (Array.isArray(data)) setServices(data);
        })
        .catch(() => {})
        .finally(() => setServicesLoading(false));
      // Load cities (visible in site)
      fetch('/api/admin/cities')
        .then(r => r.json())
        .then((data) => {
          if (Array.isArray(data?.cities)) {
            setCities(data.cities.map((c: any) => ({ ar: c.nameAr, en: c.nameEn })));
          }
        })
        .catch(() => {});
    }
  }, []);

  // Debugging: log user, company, works after all state declarations
  useEffect(() => {
    console.log('user:', user);
    console.log('company:', company);
    console.log('works:', works);
    setSectorValue(company?.sector || '');
  }, [user, company, works]);

  // إدارة النوافذ المنبثقة
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState<any>(null); // work object or null
  const [showDelete, setShowDelete] = useState<any>(null); // work object or null
  const [form, setForm] = useState({ title: '', description: '', media: [] as File[] });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  function openAdd() {
    setForm({ title: '', description: '', media: [] });
    setFormError('');
    setShowAdd(true);
  }
  function openEdit(work: any) {
    let mediaArr: any[] = [];
    try {
      if (Array.isArray(work.media)) {
        mediaArr = work.media;
      } else if (typeof work.media === 'string') {
        mediaArr = work.media ? JSON.parse(work.media) : [];
      } else {
        mediaArr = [];
      }
    } catch {
      mediaArr = [];
    }
    setForm({ title: work.title, description: work.description, media: mediaArr });
    setFormError('');
    setShowEdit({ ...work }); // shallow copy to force state update
    // Debug
    // console.log('openEdit', work, mediaArr);
  }
  function openDelete(work: any) {
    setShowDelete(work);
  }
  function closeModals() {
    setShowAdd(false);
    setShowEdit(null);
    setShowDelete(null);
    setFormError('');
    setFormLoading(false);
  }

  function handleFormChange(e: any) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }
  function handleFiles(e: any) {
    setForm({ ...form, media: Array.from(e.target.files).slice(0, 15) as File[] });
  }

  async function handleAddOrEdit(e: any) {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);
    if (!form.title) {
      setFormError('اسم العمل مطلوب');
      setFormLoading(false);
      return;
    }
    if (form.media.length > 15) {
      setFormError('الحد الأقصى للملفات هو 15');
      setFormLoading(false);
      return;
    }
    const formData = new FormData();
    formData.append('companyId', user.id);
    formData.append('title', form.title);
    formData.append('description', form.description);
    form.media.forEach(file => formData.append('media', file));
    let url = '/api/company-works';
    let method = 'POST';
    if (showEdit) {
      formData.append('id', showEdit.id);
      method = 'PATCH';
    }
    const res = await fetch(url, { method, body: formData });
    const data = await res.json();
    if (!res.ok) {
      setFormError(data.error || 'فشل العملية');
      setFormLoading(false);
      return;
    }
    // إعادة تحميل الأعمال
    fetch(`/api/company-profile?id=${user.id}&username=${encodeURIComponent(user.username)}`)
      .then(res => res.json())
      .then(data => {
        setWorks(data.works || []);
        closeModals();
      });
  }

  async function handleDelete() {
    if (!showDelete) return;
    setFormLoading(true);
    const res = await fetch(`/api/company-works?id=${showDelete.id}&companyId=${user.id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) {
      setFormError(data.error || 'فشل الحذف');
      setFormLoading(false);
      return;
    }
    fetch(`/api/company-profile?id=${user.id}&username=${encodeURIComponent(user.username)}`)
      .then(res => res.json())
      .then(data => {
        setWorks(data.works || []);
        closeModals();
      });
  }

  // Resolve sector to a service record from DB
  const currentService = (() => {
    const val = (sectorValue || '').trim();
    if (!val) return null;
    // try exact match with ar/en titles or key
    return services.find((s: any) => s.title_ar === val || s.title_en === val || s.key === val) || null;
  })();
  // Available subservices from DB for the current sector
  const currentSubOptions: { key: string; ar: string; en: string }[] = currentService
    ? (currentService.subservices || []).map((ss: any) => ({ key: ss.key, ar: ss.title_ar, en: ss.title_en }))
    : [];

  // If selected subservices contain deleted/inactive keys, prune them from view to avoid confusion
  useEffect(() => {
    if (!currentSubOptions || currentSubOptions.length === 0) return;
    setSubservices(prev => prev.filter(k => currentSubOptions.some(o => o.key === k)));
  }, [currentService?.key, servicesLoading]);

  async function saveSubservices() {
    if (!user) return;
    setSavingSubs(true);
    try {
      const res = await fetch('/api/company-subservices', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: user.id, subservices })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل الحفظ');
    } catch (e) {
      // optional: show toast later
    } finally {
      setSavingSubs(false);
    }
  }

  return (

    <>
      <Header navOnlyHome />
      <main className="max-w-5xl mx-auto py-6 sm:py-10 px-4">
        <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">{t('company.profileTitle')}</h1>
        {loading ? (
          <div className="text-center py-10 text-sm sm:text-base">{t('company.loading')}</div>
        ) : !company ? (
          <div className="text-center py-10 text-red-500 text-sm sm:text-base">{t('company.loadError')}</div>
        ) : (
          <>
            {/* Hero Section (Behance-style) */}
            <div className="relative overflow-hidden rounded-3xl mb-6 sm:mb-8 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white shadow-2xl">
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute -top-12 -left-10 w-72 h-72 bg-cyan-400 rounded-full blur-3xl" />
                <div className="absolute -bottom-12 -right-10 w-80 h-80 bg-purple-400 rounded-full blur-3xl" />
              </div>
              <div className="relative px-5 sm:px-8 py-8 sm:py-12">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-10">
                  {/* Avatar */}
                  {(() => {
                    const def = '/profile-images/default-avatar.svg';
                    const src = getProfileImageUrl(company?.image);
                    return (
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full opacity-70 group-hover:opacity-100 transition-opacity blur-xl"></div>
                        <img
                          src={src}
                          alt={company.firstName}
                          className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover border-4 border-white shadow-2xl bg-cyan-50"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = def;
                          }}
                        />
                      </div>
                    );
                  })()}

                  {/* Info */}
                  <div className="flex-1 w-full text-center sm:text-start">
                    <h2 className="text-2xl sm:text-4xl font-extrabold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-cyan-200">
                      {getCompanyDisplayName(company, lang)}
                    </h2>

                    {/* Rating + Actions top row */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center sm:items-center justify-center sm:justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {company.rating > 0 && (
                          <div className="px-4 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full font-bold text-sm border-2 border-yellow-300 shadow-lg flex items-center gap-2">
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                            <span className="text-white text-base">{Number(company.rating).toFixed(1)}</span>
                            <span className="text-white/90 text-[11px]">({company.reviewCount || 0} {lang === 'ar' ? 'تقييم' : 'reviews'})</span>
                          </div>
                        )}
                        <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold border border-white/30">{lang === 'ar' ? 'شركة محترفة' : 'Pro Company'}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${company.status === 'approved' ? 'bg-green-500/30 border-green-400/60' : 'bg-yellow-500/30 border-yellow-400/60'}`}>
                          {company.status === 'approved' ? (lang === 'ar' ? 'متاح الآن' : 'Available') : (lang === 'ar' ? 'قيد المراجعة' : 'Pending')}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 justify-center">
                        <button
                          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-full px-5 py-2 shadow-lg hover:from-purple-600 hover:to-pink-600 active:scale-95 transition flex items-center gap-2"
                          onClick={() => router.push('/company-dashboard/membership')}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          {lang === 'ar' ? 'تفاصيل العضوية' : 'Membership Details'}
                        </button>
                        <button
                          className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-full px-5 py-2 shadow-lg hover:from-cyan-600 hover:to-blue-600 active:scale-95 transition flex items-center gap-2"
                          onClick={() => router.push('/company-dashboard/completed-projects')}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          {lang === 'ar' ? 'الأعمال المنتهية' : 'Completed Projects'}
                        </button>
                        <button
                          className="bg-white text-blue-900 font-bold rounded-full px-5 py-2 shadow hover:bg-gray-100 active:scale-95 transition"
                          onClick={openAdd}
                        >
                          {t('company.addWork')}
                        </button>
                        <button
                          className="bg-white/10 text-white border border-white/30 font-bold rounded-full px-5 py-2 shadow hover:bg-white/20 active:scale-95 transition"
                          onClick={() => router.push(`/company/${company.id}`)}
                        >
                          {lang === 'ar' ? 'عرض البروفايل العام' : 'View Public Profile'}
                        </button>
                      </div>
                    </div>

                    {/* Meta */}
                    <div className="text-gray-200 text-sm sm:text-base space-y-1">
                      <p className="break-all">{company.email}</p>
                      <p className="phone-number">{company.phone}</p>
                      <p>{t('company.username')}: <span className="font-semibold">{company.username}</span></p>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <span className="font-bold">{t('company.sector')}:</span>
                        <span className="text-cyan-200">
                          {(() => {
                            const sec = sectorsList.find(s => s.ar === company.sector || s.en === company.sector);
                            return sec ? sec[lang] : (company.sector || t('company.unknown'));
                          })()}
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <span className="font-bold">{t('company.location')}:</span>
                        <span className="text-cyan-200">
                          {(() => {
                            const hit = cities.find(c => c.ar === company.location || c.en === company.location);
                            return hit ? hit[lang] : (company.location || t('company.unknown'));
                          })()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold">{t('company.worksTitle')}</h2>
              <button className="w-full sm:hidden bg-cyan-600 hover:bg-cyan-700 active:scale-95 text-white font-bold py-2.5 px-6 rounded-full text-sm sm:text-base min-h-[44px] transition-all" onClick={openAdd}>{t('company.addWork')}</button>
            </div>
            {/* Subservices selector */}
            <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base sm:text-lg font-bold">{lang === 'ar' ? 'الخدمات الفرعية التي تقدمها' : 'Sub-services you offer'}</h3>
                <button
                  onClick={saveSubservices}
                  disabled={savingSubs}
                  className="px-4 py-2 rounded-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-sm border border-cyan-700 min-h-[40px]"
                >
                  {savingSubs ? (lang === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (lang === 'ar' ? 'حفظ' : 'Save')}
                </button>
              </div>
              {currentService ? (
                <div className="flex flex-wrap gap-2">
                  {currentSubOptions.map(opt => {
                    const active = subservices.includes(opt.key);
                    return (
                      <button
                        key={opt.key}
                        onClick={() => setSubservices(prev => active ? prev.filter(k => k !== opt.key) : [...prev, opt.key])}
                        className={`px-3 py-1.5 rounded-full border text-sm font-bold ${active ? 'bg-cyan-600 text-white border-cyan-700' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'}`}
                      >
                        {opt[lang]}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-gray-500 text-sm">{lang === 'ar' ? 'اختر المجال أولاً لعرض الخدمات الفرعية.' : 'Select your sector first to see sub-services.'}</div>
              )}
              {currentService && (
                <div className="mt-3">
                  <div className="text-sm text-gray-700 mb-1 font-bold">
                    {lang === 'ar' ? 'المختار:' : 'Selected:'}
                    <span className="ml-1 text-cyan-700">{subservices.length}</span>
                  </div>
                  {subservices.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {subservices.map(key => {
                        const label = (currentSubOptions.find(o => o.key === key) || ({} as any))[lang] || key;
                        return (
                          <span key={key} className="px-2 py-0.5 text-xs rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800">
                            {label}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
            {works.length === 0 ? (
              <div className="text-center text-gray-500 py-8 text-sm sm:text-base bg-white rounded-2xl shadow-xl">{t('company.noWorks')}</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {works.map(work => (
                  <div
                    key={work.id}
                    className="group bg-white rounded-2xl shadow-xl p-4 sm:p-5 flex flex-col gap-2 sm:gap-3 relative overflow-hidden transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl animate-fadeIn"
                    style={{ animation: 'fadeInCard 0.7s cubic-bezier(.4,2,.3,1)' }}
                  >
                    <div className="flex items-start gap-2 sm:gap-3 mb-2">
                      {(() => {
                        let mediaArr: string[] = [];
                        try {
                          mediaArr = Array.isArray(work.media) ? work.media : JSON.parse(work.media || '[]');
                        } catch {
                          mediaArr = [];
                        }
                        return mediaArr.slice(0, 1).map((file: string, i: number) => (
                        file.match(/\.(mp4|webm|ogg)$/i) ? (
                          <video key={i} src={`/company-works/${file}`} controls className="w-20 h-16 sm:w-24 sm:h-20 rounded-lg object-cover border-2 border-cyan-200 shadow-sm bg-black flex-shrink-0" />
                        ) : (
                          <img key={i} src={`/company-works/${file}`} alt="media" className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover border-2 border-cyan-200 shadow-sm flex-shrink-0" />
                        )
                        ));
                      })()}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-bold text-cyan-800 mb-0.5 sm:mb-1 truncate">{work.title}</h3>
                        <p className="text-gray-600 text-xs sm:text-sm line-clamp-2">{work.description}</p>
                        {work.createdAt && (
                          <div className="text-[10px] sm:text-xs text-gray-400 mt-1 flex items-center gap-1 animate-fadeIn">
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="inline-block align-middle text-cyan-400 flex-shrink-0"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            <span className="truncate">{new Date(work.createdAt).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US', { dateStyle: 'short', timeStyle: 'short' })}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-end gap-2 mt-2">
                      <button
                        type="button"
                        className="px-4 py-2 rounded-full bg-cyan-50 text-cyan-700 font-semibold border border-cyan-200 hover:bg-cyan-600 hover:text-white active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-sm min-h-[44px] sm:min-h-0 sm:py-1.5"
                        onClick={() => openEdit(work)}
                      >
                        {t('company.edit')}
                      </button>
                      <button
                        type="button"
                        className="px-4 py-2 rounded-full bg-red-50 text-red-600 font-semibold border border-red-200 hover:bg-red-600 hover:text-white active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 text-sm min-h-[44px] sm:min-h-0 sm:py-1.5"
                        onClick={() => openDelete(work)}
                      >
                        {t('company.delete')}
                      </button>
                    </div>
                    <style jsx>{`
                      @keyframes fadeInCard {
                        from { opacity: 0; transform: translateY(30px) scale(0.97); }
                        to { opacity: 1; transform: none; }
                      }
                    `}</style>
                  </div>
                ))}
              </div>
            )}
            {/* نافذة إضافة/تعديل خارج حلقة الأعمال */}
            {(showAdd || showEdit) && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4" onClick={closeModals}>
                <form
                  onSubmit={handleAddOrEdit}
                  className="bg-white rounded-xl shadow-xl max-w-md w-full p-4 sm:p-6 relative animate-fadeIn flex flex-col gap-3 sm:gap-4 max-h-[90vh] overflow-y-auto"
                  onClick={e => e.stopPropagation()}
                >
                  <button type="button" className="absolute top-2 left-2 text-gray-500 hover:text-red-600 text-2xl font-bold w-8 h-8 flex items-center justify-center z-10" onClick={closeModals}>×</button>
                  <h3 className="text-base sm:text-lg font-bold mb-1 sm:mb-2 pr-8">{showEdit ? t('company.editWork') : t('company.addWorkTitle')}</h3>
                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleFormChange}
                    className="input input-bordered w-full min-h-[48px] text-sm sm:text-base"
                    placeholder={t('company.workTitle')}
                    required
                    autoFocus
                  />
                  <textarea name="description" value={form.description} onChange={handleFormChange} className="input input-bordered w-full min-h-[80px] sm:min-h-[100px] text-sm sm:text-base" placeholder={t('company.workDesc')} />
                  <div className="flex flex-col gap-2 sm:gap-3">
                    <label className="font-bold text-sm sm:text-base">{t('company.uploadMedia')}</label>
                    <input type="file" multiple accept="image/*,video/*" onChange={handleFiles} className="input input-bordered w-full min-h-[48px] text-sm" />
                    <div className="text-xs sm:text-sm text-gray-600">{t('company.filesCount')}: <span className="font-semibold">{form.media.length} / 15</span></div>
                    {form.media.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {form.media.map((file, i) => {
                          const handleRemove = () => {
                            setForm(f => ({ ...f, media: f.media.filter((_, idx) => idx !== i) }));
                          };
                          let preview = null;
                          if (typeof file === 'string') {
                            if ((file as string).match(/\.(mp4|webm|ogg)$/i)) {
                              preview = <video key={i} src={`/company-works/${file}`} controls className="w-16 h-14 sm:w-20 sm:h-16 rounded object-cover" />;
                            } else {
                              preview = <img key={i} src={`/company-works/${file}`} alt="preview" className="w-14 h-14 sm:w-16 sm:h-16 rounded object-cover border" />;
                            }
                          } else if (file && typeof file === 'object' && 'type' in file) {
                            const url = URL.createObjectURL(file as File);
                            if ((file as File).type.startsWith('video')) {
                              preview = <video key={i} src={url} controls className="w-16 h-14 sm:w-20 sm:h-16 rounded object-cover" />;
                            } else {
                              preview = <img key={i} src={url} alt="preview" className="w-14 h-14 sm:w-16 sm:h-16 rounded object-cover border" />;
                            }
                          }
                          return (
                            <div key={i} className="relative group">
                              {preview}
                              <button
                                type="button"
                                onClick={handleRemove}
                                className="absolute -top-2 -left-2 bg-red-500 text-white rounded-full w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-xs sm:text-sm shadow-lg opacity-80 hover:opacity-100 active:scale-95 transition"
                                title="حذف الصورة/الفيديو"
                              >×</button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  {formError && <div className="text-red-500 text-center text-sm sm:text-base" role="alert">{formError}</div>}
                  <button type="submit" className="bg-cyan-600 hover:bg-cyan-700 active:scale-95 text-white font-bold py-2.5 rounded-full text-sm sm:text-base min-h-[48px] transition-all" disabled={formLoading}>{formLoading ? t('company.saving') : (showEdit ? t('company.save') : t('company.add'))}</button>
                </form>
              </div>
            )}
            {/* نافذة تأكيد الحذف */}
            {showDelete && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
                <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-4 sm:p-6 relative animate-fadeIn flex flex-col gap-3 sm:gap-4 items-center">
                  <button type="button" className="absolute top-2 left-2 text-gray-500 hover:text-red-600 text-2xl font-bold w-8 h-8 flex items-center justify-center" onClick={closeModals}>×</button>
                  <h3 className="text-base sm:text-lg font-bold mb-1 sm:mb-2 text-center px-6">{t('company.deleteConfirm')}</h3>
                  <p className="text-sm sm:text-base text-center text-gray-600">{t('company.deleteMsg')}</p>
                  {formError && <div className="text-red-500 text-center text-sm sm:text-base" role="alert">{formError}</div>}
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-2 w-full">
                    <button className="flex-1 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold py-2.5 px-6 rounded-full text-sm sm:text-base min-h-[48px] transition-all" onClick={handleDelete} disabled={formLoading}>{formLoading ? t('company.deleting') : t('company.delete')}</button>
                    <button className="flex-1 bg-gray-200 hover:bg-gray-300 active:scale-95 text-gray-800 font-bold py-2.5 px-6 rounded-full text-sm sm:text-base min-h-[48px] transition-all" onClick={closeModals}>{t('company.cancel')}</button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}
