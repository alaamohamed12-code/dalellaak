"use client"
import { useState, useEffect } from 'react'
import { useLang } from '../layout/Providers'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'

export default function ContactSupport() {
  const { t, lang } = useLang()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const u = localStorage.getItem('user')
      if (u) setUser(JSON.parse(u))
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      alert(lang === 'ar' ? 'يرجى تسجيل الدخول أولاً' : 'Please login first')
      router.push('/login')
      return
    }

    if (!subject.trim() || !message.trim()) {
      alert(lang === 'ar' ? 'يرجى ملء جميع الحقول' : 'Please fill all fields')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.accountType !== 'company' ? user.id : null,
          companyId: user.accountType === 'company' ? user.id : null,
          subject,
          message,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setShowSuccess(true)
        setSubject('')
        setMessage('')
        
        // Redirect to support page after 2 seconds
        setTimeout(() => {
          router.push(`/support`)
        }, 2000)
      } else {
        alert(data.error || (lang === 'ar' ? 'حدث خطأ' : 'An error occurred'))
      }
    } catch (error) {
      console.error('Error submitting support ticket:', error)
      alert(lang === 'ar' ? 'حدث خطأ في الإرسال' : 'Failed to submit')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="contact" className="relative py-16 sm:py-20 md:py-24 px-4 overflow-hidden">
      {/* Animated Background */}
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
          className="text-center mb-12"
        >
          {/* Icon badge */}
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-100 to-purple-100 px-5 py-2.5 rounded-full mb-6 border border-cyan-200"
          >
            <motion.span
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-2xl"
            >
              💬
            </motion.span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-purple-600 text-sm font-bold uppercase tracking-wider">
              {lang === 'ar' ? 'الدعم الفني' : 'Technical Support'}
            </span>
          </motion.div>

          <h2 className="text-4xl sm:text-5xl font-extrabold mb-4">
            <span className="bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              {lang === 'ar' ? 'كيف يمكننا مساعدتك؟' : 'How Can We Help You?'}
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {lang === 'ar' 
              ? 'نحن هنا للإجابة على استفساراتك وحل مشاكلك. فريقنا جاهز لمساعدتك على مدار الساعة'
              : 'We\'re here to answer your questions and solve your problems. Our team is ready to help you 24/7'}
          </p>
        </motion.div>

        {/* Main Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative group"
        >
          {/* Glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 rounded-3xl opacity-30 blur-xl group-hover:opacity-50 transition-opacity duration-500"></div>

          {/* Card */}
          <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Decorative header */}
            <div className="relative h-2 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600"></div>

            <div className="p-8 sm:p-10 md:p-12">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Subject Field */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                >
                  <label className="block mb-3">
                    <span className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-2">
                      <span className="text-2xl">📋</span>
                      {lang === 'ar' ? 'موضوع الرسالة' : 'Subject'}
                      <span className="text-red-500">*</span>
                    </span>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder={lang === 'ar' ? 'ما هو موضوع استفسارك؟' : 'What is your inquiry about?'}
                      className="w-full px-5 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200 rounded-2xl focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 transition-all text-gray-800 placeholder-gray-400 font-medium"
                      required
                    />
                  </label>
                </motion.div>

                {/* Message Field */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                >
                  <label className="block">
                    <span className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-2">
                      <span className="text-2xl">✍️</span>
                      {lang === 'ar' ? 'تفاصيل المشكلة' : 'Problem Details'}
                      <span className="text-red-500">*</span>
                    </span>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={lang === 'ar' ? 'اشرح مشكلتك بالتفصيل...' : 'Explain your problem in detail...'}
                      rows={6}
                      className="w-full px-5 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200 rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all text-gray-800 placeholder-gray-400 font-medium resize-none"
                      required
                    />
                  </label>
                </motion.div>

                {/* Info Box */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                  className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-5"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">💡</span>
                    <div className="text-sm text-gray-700">
                      <p className="font-semibold mb-1">
                        {lang === 'ar' ? 'نصيحة:' : 'Tip:'}
                      </p>
                      <p>
                        {lang === 'ar'
                          ? 'كلما كانت التفاصيل أكثر، كلما استطعنا مساعدتك بشكل أفضل وأسرع.'
                          : 'The more details you provide, the better and faster we can help you.'}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Submit Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 }}
                >
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                    className={`group relative w-full ${loading ? 'cursor-not-allowed' : ''}`}
                  >
                    {/* Button glow */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 rounded-2xl opacity-75 group-hover:opacity-100 blur-lg transition-opacity"></div>

                    {/* Button */}
                    <div className={`relative bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 px-8 py-5 rounded-2xl shadow-xl flex items-center justify-center gap-3 ${loading ? 'opacity-70' : ''}`}>
                      {loading ? (
                        <>
                          <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-white font-bold text-lg">
                            {lang === 'ar' ? 'جاري الإرسال...' : 'Sending...'}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-white font-bold text-lg">
                            {lang === 'ar' ? 'إرسال الرسالة' : 'Send Message'}
                          </span>
                          <motion.div
                            animate={{ x: lang === 'ar' ? [-3, 0, -3] : [0, 3, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            <svg className={`w-6 h-6 text-white ${lang === 'ar' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                          </motion.div>
                        </>
                      )}
                    </div>
                  </motion.button>
                </motion.div>
              </form>

              {/* Contact Info */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.7 }}
                className="mt-10 pt-8 border-t-2 border-gray-200"
              >
                <p className="text-center text-gray-600 mb-6 font-medium">
                  {lang === 'ar' ? 'أو تواصل معنا مباشرة:' : 'Or contact us directly:'}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.a
                    href={`mailto:${t('contact.email')}`}
                    whileHover={{ scale: 1.05, y: -2 }}
                    className="flex items-center gap-3 bg-gradient-to-r from-cyan-50 to-blue-50 px-6 py-4 rounded-xl border-2 border-cyan-200 hover:border-cyan-400 transition-all group"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <div className="text-xs text-gray-500 uppercase font-bold tracking-wide">
                        {lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                      </div>
                      <div className="text-cyan-700 font-bold group-hover:text-cyan-800">
                        {t('contact.email')}
                      </div>
                    </div>
                  </motion.a>

                  <motion.a
                    href={`tel:${t('contact.phone')}`}
                    whileHover={{ scale: 1.05, y: -2 }}
                    className="flex items-center gap-3 bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 rounded-xl border-2 border-purple-200 hover:border-purple-400 transition-all group"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <div className="text-xs text-gray-500 uppercase font-bold tracking-wide">
                        {lang === 'ar' ? 'الهاتف' : 'Phone'}
                      </div>
                      <div className="text-purple-700 font-bold group-hover:text-purple-800 phone-number">
                        {t('contact.phone')}
                      </div>
                    </div>
                  </motion.a>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowSuccess(false)}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {lang === 'ar' ? 'تم الإرسال بنجاح!' : 'Sent Successfully!'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {lang === 'ar' 
                    ? 'سيتم توجيهك إلى صفحة الدعم الفني...'
                    : 'You will be redirected to the support page...'}
                </p>
                <div className="flex items-center justify-center gap-2 text-cyan-600">
                  <div className="w-2 h-2 bg-cyan-600 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-cyan-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-cyan-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
