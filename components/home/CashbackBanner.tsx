"use client"
import { useLang } from '../../components/layout/Providers'
import { motion } from 'framer-motion'

export default function CashbackBanner() {
  const { t, lang } = useLang()
  return (
    <section className="relative py-12 sm:py-16 md:py-20 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 opacity-60" />
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <motion.div
          animate={{ scale: [1, 1.3, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-400 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1.3, 1, 1.3], rotate: [0, -90, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-24 -left-24 w-96 h-96 bg-teal-500 rounded-full blur-3xl"
        />
      </div>

      <div className="relative max-w-5xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative group"
        >
          {/* Glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 rounded-3xl opacity-75 blur-2xl group-hover:opacity-100 transition-opacity duration-500" />

          {/* Card */}
          <div className="relative bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600 rounded-3xl shadow-2xl overflow-hidden">
            {/* Animated patterns */}
            <div className="absolute inset-0 opacity-20">
              <motion.div
                animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute -top-20 -right-20 w-64 h-64 bg-white rounded-full"
              />
              <motion.div
                animate={{ rotate: [360, 0], scale: [1.2, 1, 1.2] }}
                transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                className="absolute -bottom-20 -left-20 w-64 h-64 bg-white rounded-full"
              />
            </div>

            <div className="relative p-8 sm:p-12 md:p-16 text-center">
              {/* Badge */}
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, type: 'spring' }}
                className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-white/30"
              >
                <motion.span
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  className="text-2xl"
                >
                  💰
                </motion.span>
                <span className="text-white text-sm font-bold uppercase tracking-wider">
                  {lang === 'ar' ? 'عرض حصري' : 'Exclusive Offer'}
                </span>
              </motion.div>

              {/* Main message */}
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">
                {t('cashback.text')}
              </h3>

              <p className="text-lg sm:text-xl text-white/90 leading-relaxed mb-8 max-w-2xl mx-auto">
                {lang === 'ar'
                  ? 'احصل على كاش باك فوري بنسبة 2% عند إتمام أي تعاقد مع شركائنا المعتمدين'
                  : 'Get instant 2% cashback when completing any contract with our certified partners'}
              </p>

              {/* CTA */}
              <motion.button
                onClick={() => (window.location.href = '/signup')}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className="group/btn relative inline-flex items-center gap-3"
              >
                {/* Button glow */}
                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl opacity-75 group-hover/btn:opacity-100 blur-xl transition-opacity" />

                {/* Button */}
                <div className="relative bg-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
                  <span className="text-xl font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    {t('cta.start')}
                  </span>
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className={`w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center ${
                      lang === 'ar' ? 'rotate-180' : ''
                    }`}
                  >
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth="2.5"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </motion.div>
                </div>
              </motion.button>
            </div>

            {/* Bottom decorative line */}
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
              className="h-1.5 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 origin-left"
            />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
