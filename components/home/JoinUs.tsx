"use client"
import { useLang } from '../../components/layout/Providers'
import { motion } from 'framer-motion'

export default function JoinUs() {
  const { t, lang } = useLang()
  
  const handleJoinClick = () => {
    window.location.href = '/signup'
  }

  return (
    <section id="contact" className="relative py-16 sm:py-20 md:py-24 px-4 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50"></div>
      <div className="absolute inset-0 opacity-20">
        <motion.div
          animate={{ scale: [1, 1.3, 1], x: [0, 50, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 left-0 w-96 h-96 bg-cyan-400 rounded-full filter blur-3xl"
        />
        <motion.div
          animate={{ scale: [1.3, 1, 1.3], x: [0, -50, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400 rounded-full filter blur-3xl"
        />
      </div>
      
      <div className="relative max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {/* Main Card */}
          <div className="relative group">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 rounded-3xl opacity-75 blur-2xl group-hover:opacity-100 transition-opacity duration-500"></div>

            {/* Card content */}
            <div className="relative bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-700 rounded-3xl shadow-2xl overflow-hidden">
              {/* Animated background patterns */}
              <div className="absolute inset-0 opacity-20">
                <motion.div
                  animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute -top-20 -right-20 w-64 h-64 bg-white rounded-full"
                />
                <motion.div
                  animate={{ rotate: [360, 0], scale: [1.2, 1, 1.2] }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  className="absolute -bottom-20 -left-20 w-64 h-64 bg-white rounded-full"
                />
              </div>

              <div className="relative p-8 sm:p-10 md:p-12 flex flex-col lg:flex-row items-center justify-between gap-8">
                {/* Left side - Text content */}
                <div className="flex-1 text-center lg:text-left">
                  {/* Icon badge */}
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, type: "spring" }}
                    className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-white/30"
                  >
                    <motion.span
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="text-2xl"
                    >
                      🤝
                    </motion.span>
                    <span className="text-white text-sm font-bold uppercase tracking-wider">
                      {lang === 'ar' ? 'انضم إلينا' : 'Join Us'}
                    </span>
                  </motion.div>

                  <h3 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">
                    {t('join.title')}
                  </h3>

                  <p className="text-lg sm:text-xl text-white/90 leading-relaxed mb-6 max-w-2xl">
                    {lang === 'ar'
                      ? 'كن جزءاً من شبكتنا المتنامية من الشركاء المعتمدين واستفد من فرص عمل جديدة'
                      : 'Be part of our growing network of trusted partners and benefit from new business opportunities'}
                  </p>

                  {/* Contact info */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-6 lg:mb-0">
                    <motion.a
                      href={`mailto:${t('contact.email')}`}
                      whileHover={{ scale: 1.05, y: -2 }}
                      className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-5 py-3 rounded-xl border border-white/20 hover:bg-white/20 transition-all group"
                    >
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <div className="text-xs text-white/70 uppercase tracking-wide">
                          {lang === 'ar' ? 'البريد' : 'Email'}
                        </div>
                        <div className="text-white font-semibold">
                          {t('contact.email')}
                        </div>
                      </div>
                    </motion.a>

                    <motion.a
                      href={`tel:${t('contact.phone')}`}
                      whileHover={{ scale: 1.05, y: -2 }}
                      className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-5 py-3 rounded-xl border border-white/20 hover:bg-white/20 transition-all group"
                    >
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <div className="text-xs text-white/70 uppercase tracking-wide">
                          {lang === 'ar' ? 'الهاتف' : 'Phone'}
                        </div>
                        <div className="text-white font-semibold phone-number">
                          {t('contact.phone')}
                        </div>
                      </div>
                    </motion.a>
                  </div>
                </div>

                {/* Right side - CTA Button */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="flex-shrink-0"
                >
                  <motion.button
                    onClick={handleJoinClick}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    className="group relative"
                  >
                    {/* Button glow */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl opacity-75 group-hover:opacity-100 blur-xl transition-opacity"></div>

                    {/* Button */}
                    <div className="relative bg-white px-10 py-6 rounded-2xl shadow-2xl flex items-center gap-4">
                      <div>
                        <div className="text-sm text-gray-600 uppercase tracking-wide font-semibold">
                          {lang === 'ar' ? 'ابدأ الآن' : 'Start Now'}
                        </div>
                        <div className="text-2xl font-extrabold bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
                          {t('cta.start')}
                        </div>
                      </div>
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg"
                      >
                        <svg className={`w-6 h-6 text-white ${lang === 'ar' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </motion.div>
                    </div>
                  </motion.button>
                </motion.div>
              </div>

              {/* Bottom decorative line */}
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className="h-1.5 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 origin-left"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
