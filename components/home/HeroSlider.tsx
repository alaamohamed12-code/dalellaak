"use client"
import React, { useState, useEffect } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination, Navigation, EffectFade } from 'swiper/modules'
import { useLang } from '../../components/layout/Providers'
import { motion } from 'framer-motion'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'
import 'swiper/css/effect-fade'

const slides = [
  {
    title: { ar: 'بداية مشروع أحلامك', en: 'Kick off your dream project' },
    desc: { ar: 'اعثر على أفضل الشركاء لبناء مساحتك المثالية في الخليج', en: 'Find the best partners to build your ideal space in the Gulf' },
    cta: { ar: 'استكشف الخدمات', en: 'Explore Services' },
    gradient: 'from-blue-600 via-purple-600 to-pink-600',
    img: 'https://picsum.photos/seed/hero1/2000/1200'
  },
  {
    title: { ar: 'تصاميم مبهرة ومقاولات موثوقة', en: 'Stunning designs & trusted contractors' },
    desc: { ar: 'شبكة واسعة من المهندسين والمقاولين والموردين', en: 'A wide network of engineers, contractors and suppliers' },
    cta: { ar: 'ابدأ الآن', en: 'Get Started' },
    gradient: 'from-emerald-600 via-teal-600 to-cyan-600',
    img: 'https://picsum.photos/seed/hero2/2000/1200'
  },
  {
    title: { ar: 'حلول هندسية متكاملة', en: 'Comprehensive Engineering Solutions' },
    desc: { ar: 'من التصميم إلى التنفيذ، نوفر لك كل ما تحتاجه', en: 'From design to execution, we provide everything you need' },
    cta: { ar: 'تواصل معنا', en: 'Contact Us' },
    gradient: 'from-orange-600 via-amber-600 to-yellow-600',
    img: 'https://picsum.photos/seed/hero3/2000/1200'
  }
]

export default function HeroSlider() {
  const { lang } = useLang()
  
  const scrollToServices = () => {
    const el = document.getElementById('services')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="w-full relative">
      {/* Decorative gradient blobs */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <Swiper
        key={lang}
        modules={[Autoplay, Pagination, Navigation, EffectFade]}
        spaceBetween={0}
        slidesPerView={1}
        loop={true}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        pagination={{ 
          clickable: true, 
          dynamicBullets: true,
          renderBullet: (index, className) => {
            return `<span class="${className} custom-bullet"></span>`
          }
        }}
        navigation={true}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        className="hero-swiper-modern"
      >
        {slides.map((s, idx) => (
          <SwiperSlide key={idx}>
            <div className="relative h-[55vh] sm:h-[65vh] md:h-[75vh] lg:h-[80vh] w-full overflow-hidden">
              {/* Background image with gradient overlay */}
              <div className="absolute inset-0">
                <img 
                  src={s.img} 
                  alt={s.title[lang] ?? s.title.ar} 
                  className="w-full h-full object-cover animate-zoom-subtle" 
                  loading="eager"
                  style={{ objectPosition: 'center' }}
                />
                <div className={`absolute inset-0 bg-gradient-to-br ${s.gradient} opacity-70 mix-blend-multiply`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              </div>

              {/* Content */}
              <div className="relative z-10 flex items-center justify-center h-full px-4">
                <div className="max-w-5xl mx-auto text-white text-center w-full">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="mb-6"
                  >
                    <span className="inline-flex items-center px-6 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white font-semibold text-sm sm:text-base shadow-lg">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                      </svg>
                      {lang === 'ar' ? 'منصة الخدمات الهندسية' : 'Engineering Services Platform'}
                    </span>
                  </motion.div>

                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
                    className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold display-font leading-tight px-2 mb-6 drop-shadow-2xl"
                  >
                    {s.title[lang] ?? s.title.ar}
                  </motion.h1>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
                    className="text-lg sm:text-xl md:text-2xl font-medium px-4 mb-8 max-w-3xl mx-auto drop-shadow-lg"
                  >
                    {s.desc[lang] ?? s.desc.ar}
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
                    className="flex flex-wrap justify-center gap-4"
                  >
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={scrollToServices}
                      className={`group px-8 py-4 rounded-xl bg-white text-gray-900 font-bold text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center gap-2`}
                    >
                      <span>{s.cta[lang] ?? s.cta.ar}</span>
                      <svg className={`w-5 h-5 transform ${lang === 'ar' ? 'rotate-180' : ''} group-hover:translate-x-1 transition-transform`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5-5 5M6 12h12" />
                      </svg>
                    </motion.button>
                  </motion.div>

                  {/* Stats or features */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.8 }}
                    className="mt-12 grid grid-cols-3 gap-4 sm:gap-8 max-w-2xl mx-auto"
                  >
                    {[
                      { label: lang === 'ar' ? 'شركة موثوقة' : 'Trusted Companies', value: '500+', icon: '🏢' },
                      { label: lang === 'ar' ? 'خدمة متاحة' : 'Services Available', value: '50+', icon: '🛠️' },
                      { label: lang === 'ar' ? 'عميل راضٍ' : 'Happy Clients', value: '2000+', icon: '😊' }
                    ].map((stat, i) => (
                      <div key={i} className="text-center bg-white/10 backdrop-blur-md rounded-xl p-3 sm:p-4 border border-white/20">
                        <div className="text-2xl mb-1">{stat.icon}</div>
                        <div className="text-xl sm:text-2xl font-bold">{stat.value}</div>
                        <div className="text-xs sm:text-sm opacity-90">{stat.label}</div>
                      </div>
                    ))}
                  </motion.div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <style jsx global>{`
        @keyframes zoom-subtle {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .animate-zoom-subtle {
          animation: zoom-subtle 20s ease-in-out infinite;
          transform-origin: center;
        }
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 8s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .hero-swiper-modern .swiper-pagination {
          bottom: 30px !important;
        }
        .hero-swiper-modern .custom-bullet {
          width: 12px;
          height: 12px;
          background: white;
          opacity: 0.5;
          border-radius: 50%;
          display: inline-block;
          transition: all 0.3s;
        }
        .hero-swiper-modern .custom-bullet.swiper-pagination-bullet-active {
          opacity: 1;
          width: 32px;
          border-radius: 6px;
          background: linear-gradient(90deg, #06b6d4, #3b82f6);
        }
        .hero-swiper-modern .swiper-button-next,
        .hero-swiper-modern .swiper-button-prev {
          color: white;
          background: rgba(255,255,255,0.15);
          backdrop-filter: blur(10px);
          width: 50px;
          height: 50px;
          border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.3);
          transition: all 0.3s;
        }
        .hero-swiper-modern .swiper-button-next:hover,
        .hero-swiper-modern .swiper-button-prev:hover {
          background: rgba(255,255,255,0.25);
          transform: scale(1.1);
        }
        @media (max-width: 640px) {
          .hero-swiper-modern .swiper-button-next,
          .hero-swiper-modern .swiper-button-prev {
            width: 40px;
            height: 40px;
          }
          .hero-swiper-modern .swiper-button-next::after,
          .hero-swiper-modern .swiper-button-prev::after {
            font-size: 18px;
          }
        }
      `}</style>
    </section>
  )
}
