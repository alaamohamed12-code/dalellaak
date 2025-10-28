
"use client";

import { useLang } from '../../components/layout/Providers'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

interface Service {
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

export default function ServicesSection() {
  const { t, lang } = useLang()
  const router = useRouter()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [activeKey, setActiveKey] = useState<string>('all')
  const [query, setQuery] = useState('')

  useEffect(() => {
    fetchServices();
  }, []);

  async function fetchServices() {
    try {
      const res = await fetch('/api/services');
      const data = await res.json();
      setServices(data);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  }

  // Gradient colors for each service card
  const gradients = [
    'from-blue-500 via-purple-500 to-pink-500',
    'from-emerald-500 via-teal-500 to-cyan-500',
    'from-orange-500 via-red-500 to-pink-500',
    'from-indigo-500 via-purple-500 to-blue-500'
  ]

  // Service icons (you can replace with real icons)
  const serviceIcons = [
    // Engineering Consulting
    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>,
    // Contracting
    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>,
    // Building Materials
    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>,
    // Decoration & Furnishing
    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
    </svg>
  ]

  const container = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { 
        staggerChildren: 0.15,
        delayChildren: 0.2
      } 
    }
  }

  const cardVariant = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: { 
        type: 'spring', 
        stiffness: 100, 
        damping: 12,
        duration: 0.6
      } 
    }
  }

  const filteredServices = useMemo(() => {
    const byTab = activeKey === 'all' ? services : services.filter(s => s.key === activeKey)
    if (!query.trim()) return byTab
    const q = query.toLowerCase()
    return byTab.filter(s => {
      const title = (lang === 'ar' ? s.title_ar : s.title_en).toLowerCase()
      const desc = (lang === 'ar' ? s.description_ar : s.description_en || '').toLowerCase()
      const subs = (s.subservices || []) as any[]
      const subHit = subs.some((sub: any) => (
        (lang === 'ar' ? sub.title_ar : sub.title_en).toLowerCase().includes(q)
      ))
      return title.includes(q) || desc.includes(q) || subHit
    })
  }, [services, activeKey, query, lang])

  return (
    <section id="services" className="py-16 sm:py-20 md:py-24 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="inline-block mb-4"
          >
            <span className="inline-flex items-center px-6 py-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-sm sm:text-base shadow-lg">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
              {t('services.title')}
            </span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4"
          >
            {lang === 'ar' ? 'خدماتنا المتميزة' : 'Our Premium Services'}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-lg text-gray-600 max-w-2xl mx-auto"
          >
            {lang === 'ar' 
              ? 'اكتشف مجموعة واسعة من الخدمات الهندسية والإنشائية المتكاملة' 
              : 'Discover a wide range of comprehensive engineering and construction services'}
          </motion.p>
        </motion.div>

        {/* Tabs + Search */}
        <div className="mb-8 sm:mb-10">
          <div className="flex flex-col gap-4">
            <div className={`flex items-center ${lang === 'ar' ? 'flex-row-reverse' : ''} gap-3`}>
              <div className="relative flex-1">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={lang === 'ar' ? 'ابحث عن خدمة أو خدمة فرعية...' : 'Search a service or subservice...'}
                  className="w-full rounded-xl border border-gray-200 bg-white/70 backdrop-blur px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <svg className={`absolute ${lang === 'ar' ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" />
                </svg>
              </div>
              {/* Reset */}
              {(query || activeKey !== 'all') && (
                <button
                  onClick={() => { setQuery(''); setActiveKey('all') }}
                  className="shrink-0 px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700"
                >
                  {lang === 'ar' ? 'إعادة ضبط' : 'Reset'}
                </button>
              )}
            </div>

            {/* Scrollable tabs */}
            <div className="no-scrollbar overflow-x-auto">
              <div className={`inline-flex ${lang === 'ar' ? 'flex-row-reverse' : ''} gap-2 min-w-full py-1`}>
                <button
                  onClick={() => setActiveKey('all')}
                  className={`px-4 py-2 rounded-full border transition-all ${activeKey === 'all' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                >
                  {lang === 'ar' ? 'الكل' : 'All'}
                </button>
                {services.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => setActiveKey(s.key)}
                    className={`px-4 py-2 rounded-full border transition-all whitespace-nowrap flex items-center gap-2 ${activeKey === s.key ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                  >
                    <span className="text-lg">{s.icon}</span>
                    <span>{lang === 'ar' ? s.title_ar : s.title_en}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8"
        >
          {loading && (
            <div className="col-span-full flex justify-center py-12">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          {!loading && filteredServices.map((service, idx) => {
            const serviceKey = service.key
            const gradient = service.gradient
            const subs = service.subservices || []
            
            return (
              <motion.div
                key={idx}
                variants={cardVariant}
                whileHover={{ 
                  scale: 1.03,
                  transition: { type: 'spring', stiffness: 300, damping: 20 }
                }}
                className="group cursor-pointer"
                onClick={() => router.push(`/services/${serviceKey}/subservices`)}
              >
                <div className={`relative h-full rounded-2xl bg-gradient-to-br ${gradient} p-1 shadow-xl hover:shadow-2xl transition-all duration-300`}>
                  {/* Inner white card */}
                  <div className="relative h-full bg-white rounded-xl p-6 sm:p-8 overflow-hidden">
                    {/* Decorative corner element */}
                    <div className={`absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br ${gradient} rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-300`}></div>
                    
                    {/* Icon */}
                    <motion.div 
                      className={`mb-6`}
                      whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <span className="text-6xl">{service.icon}</span>
                    </motion.div>

                    {/* Title */}
                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
                      {lang === 'ar' ? service.title_ar : service.title_en}
                    </h3>

                    {/* Subservice badges */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {subs.slice(0, 4).map((sub: any, i: number) => (
                        <span
                          key={i}
                          className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-gray-100 text-gray-700 group-hover:bg-gradient-to-r group-hover:from-blue-50 group-hover:to-purple-50 group-hover:text-gray-800 transition-all duration-300"
                        >
                          {lang === 'ar' ? sub.title_ar : sub.title_en}
                        </span>
                      ))}
                      {subs.length > 4 && (
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600">
                          +{subs.length - 4} {lang === 'ar' ? 'المزيد' : 'More'}
                        </span>
                      )}
                    </div>

                    {/* CTA Button */}
                    <motion.button
                      whileHover={{ scale: 1.05, x: lang === 'ar' ? -5 : 5 }}
                      whileTap={{ scale: 0.95 }}
                      className={`inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r ${gradient} text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 group/btn`}
                    >
                      <span>{t('cta.explore')}</span>
                      {lang === 'ar' ? (
                        <svg className="w-5 h-5 mr-2 transform group-hover/btn:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l-5 5 5 5" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 ml-2 transform group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5-5 5" />
                        </svg>
                      )}
                    </motion.button>
                    {/* Deep link to subservices */}
                    <div className={`mt-4 text-sm ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                      <button
                        onClick={(e) => { e.stopPropagation(); router.push(`/services/${serviceKey}/subservices`); }}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        {lang === 'ar' ? 'عرض جميع الخدمات الفرعية' : 'View all subservices'} →
                      </button>
                    </div>

                    {/* Hover Effect Lines */}
                    <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r ${gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`}></div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>

      {/* Add custom animations */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </section>
  )
}
