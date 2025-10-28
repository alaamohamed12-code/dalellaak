"use client";
import { useEffect, useMemo, useState } from 'react';
import { notFound, useParams, useRouter } from 'next/navigation';
import Header from '../../../../components/layout/Header';
import { useLang } from '../../../../components/layout/Providers';
import { motion } from 'framer-motion';

// Types for services fetched from API
interface SubserviceItem {
  id: number;
  service_key: string;
  key: string;
  title_ar: string;
  title_en: string;
  icon: string;
  description_ar: string;
  description_en: string;
  display_order: number;
  is_active: number;
}

interface ServiceItem {
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
  subservices: SubserviceItem[];
}

export default function SubservicesPage() {
  const router = useRouter();
  const params = useParams() as { sector?: string } | null;
  const { lang } = useLang();
  const [allServices, setAllServices] = useState<ServiceItem[]>([]);
  const [subservices, setSubservices] = useState<SubserviceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sectorObj, setSectorObj] = useState<ServiceItem | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/services');
        const data = await res.json();
        setAllServices(data);
        
        // Find the sector from the URL parameter
        const sectorParam = params?.sector ?? '';
        const slug = String(sectorParam).toLowerCase();
        
        // Try to find service by key first, then by title
        let service = data.find((s: ServiceItem) => s.key.toLowerCase() === slug);
        if (!service) {
          service = data.find((s: ServiceItem) => 
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
      } finally {
        setLoading(false);
      }
    })();
  }, [params?.sector]);

  if (!sectorObj && !loading) return notFound();

  const gradient = sectorObj?.gradient || 'from-blue-500 to-purple-500';

  if (loading) {
    return (
      <>
        <Header navOnlyHome />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-semibold">جاري التحميل...</p>
          </div>
        </div>
      </>
    );
  }
  // data already in state 'subservices'

  function handleSubserviceClick(key: string) {
    if (sectorObj) {
      router.push(`/services/${sectorObj.key}?service=${key}`);
    }
  }

  return (
    <>
      <Header navOnlyHome />
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        {/* Hero Section */}
        <div className={`relative overflow-hidden bg-gradient-to-r ${gradient} py-20 px-4`}>
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))]"></div>
          
          {/* Animated background shapes */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute top-20 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{ duration: 8, repeat: Infinity }}
            />
            <motion.div
              className="absolute bottom-20 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{ duration: 10, repeat: Infinity }}
            />
          </div>

          <div className="relative max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              {/* Breadcrumb */}
              {sectorObj && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mb-6 flex items-center justify-center gap-2 text-white/80 text-sm"
                >
                  <button onClick={() => router.push('/')} className="hover:text-white transition">
                    {lang === 'ar' ? '🏠 الرئيسية' : '🏠 Home'}
                  </button>
                  <span>{lang === 'ar' ? '←' : '→'}</span>
                  <button onClick={() => router.push(`/services/${sectorObj.key}`)} className="hover:text-white transition">
                    {lang === 'ar' ? sectorObj.title_ar : sectorObj.title_en}
                  </button>
                  <span>{lang === 'ar' ? '←' : '→'}</span>
                  <span className="text-white font-semibold">
                    {lang === 'ar' ? 'الخدمات الفرعية' : 'Subservices'}
                  </span>
                </motion.div>
              )}

              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
                className="inline-flex items-center px-6 py-3 rounded-full bg-white/20 backdrop-blur-sm text-white font-bold text-sm border border-white/30 shadow-lg mb-6"
              >
                <span className="text-2xl mr-2">{subservices[0]?.icon || '🔧'}</span>
                {lang === 'ar' ? '✨ استكشف الخدمات الفرعية' : '✨ Explore Subservices'}
              </motion.span>

              {sectorObj && (
                <>
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-5xl sm:text-6xl md:text-7xl font-bold text-white drop-shadow-lg mb-6"
                  >
                    {lang === 'ar' ? sectorObj.title_ar : sectorObj.title_en}
                  </motion.h1>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-xl sm:text-2xl text-white/95 max-w-3xl mx-auto mb-8 leading-relaxed"
                  >
                    {lang === 'ar' 
                      ? `اختر الخدمة الفرعية المناسبة لاحتياجاتك في ${sectorObj.title_ar}` 
                      : `Choose the right subservice for your needs in ${sectorObj.title_en}`}
                  </motion.p>
                </>
              )}

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                className="flex items-center justify-center gap-4 text-white/90"
              >
                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur rounded-full">
                  <span className="text-3xl font-bold">{subservices.length}</span>
                  <span className="text-sm">{lang === 'ar' ? 'خدمة فرعية' : 'Subservices'}</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Subservices Grid */}
        <div className="max-w-7xl mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {subservices.map((service, index) => (
              <motion.div
                key={service.key}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="group cursor-pointer"
                onClick={() => handleSubserviceClick(service.key)}
              >
                <div className={`relative h-full bg-gradient-to-br ${gradient} p-1 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300`}>
                  {/* Glow effect */}
                  <div className={`absolute -inset-1 bg-gradient-to-r ${gradient} rounded-3xl blur opacity-0 group-hover:opacity-30 transition duration-300`}></div>
                  
                  <div className="relative bg-white rounded-3xl p-8 h-full flex flex-col">
                    {/* Decorative corner */}
                    <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${gradient} opacity-5 rounded-bl-full`}></div>
                    
                    {/* Icon */}
                    <motion.div
                      whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                      className="relative mb-6"
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity`}></div>
                      <div className={`relative w-20 h-20 flex items-center justify-center bg-gradient-to-br ${gradient} rounded-2xl shadow-lg`}>
                        <span className="text-4xl filter drop-shadow">{service.icon}</span>
                      </div>
                    </motion.div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all">
                        {lang === 'ar' ? service.title_ar : service.title_en}
                      </h3>
                      
                      <p className="text-gray-600 leading-relaxed mb-6 text-sm">
                        {lang === 'ar' ? service.description_ar : service.description_en}
                      </p>
                    </div>

                    {/* CTA Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full py-3 px-6 rounded-xl bg-gradient-to-r ${gradient} text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 group/btn`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSubserviceClick(service.key);
                      }}
                    >
                      <span>{lang === 'ar' ? 'عرض الشركات' : 'View Companies'}</span>
                      {lang === 'ar' ? (
                        <motion.svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          animate={{ x: [0, -4, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l-5 5 5 5" />
                        </motion.svg>
                      ) : (
                        <motion.svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          animate={{ x: [0, 4, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5-5 5" />
                        </motion.svg>
                      )}
                    </motion.button>

                    {/* Bottom accent line */}
                    <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r ${gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center rounded-b-3xl`}></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Empty State */}
          {subservices.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20 bg-white rounded-3xl shadow-xl"
            >
              <div className="text-8xl mb-6">🔍</div>
              <h3 className="text-3xl font-bold text-gray-800 mb-3">
                {lang === 'ar' ? 'لا توجد خدمات فرعية' : 'No Subservices Available'}
              </h3>
              <p className="text-gray-600 text-lg max-w-md mx-auto">
                {lang === 'ar' 
                  ? 'لا توجد خدمات فرعية متاحة لهذا القطاع حالياً' 
                  : 'No subservices are available for this sector at the moment'}
              </p>
            </motion.div>
          )}
        </div>

        {/* Bottom CTA Section */}
        <div className={`relative overflow-hidden bg-gradient-to-r ${gradient} py-16 px-4 mt-16`}>
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                {lang === 'ar' ? 'لم تجد ما تبحث عنه؟' : 'Didn\'t find what you\'re looking for?'}
              </h2>
              <p className="text-xl text-white/90 mb-8">
                {lang === 'ar' 
                  ? 'تصفح جميع الأقسام أو تواصل معنا للمساعدة' 
                  : 'Browse all sectors or contact us for assistance'}
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/')}
                  className="px-8 py-4 bg-white text-gray-900 rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  {lang === 'ar' ? '🏠 العودة للرئيسية' : '🏠 Back to Home'}
                </motion.button>
                {sectorObj && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.push(`/services/${sectorObj.key}`)}
                    className="px-8 py-4 bg-white/10 backdrop-blur text-white border-2 border-white/30 rounded-xl font-bold hover:bg-white/20 transition-all duration-300"
                  >
                    {lang === 'ar' ? '📋 عرض جميع الشركات' : '📋 View All Companies'}
                  </motion.button>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        <style jsx global>{`
          .bg-grid-white\/10 {
            background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(255 255 255 / 0.1)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e");
          }
        `}</style>
      </main>
    </>
  );
}
