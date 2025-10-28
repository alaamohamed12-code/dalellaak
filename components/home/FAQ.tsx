"use client"
import React, { useState, useEffect } from 'react'
import { useLang } from '../layout/Providers'
import { motion, AnimatePresence } from 'framer-motion'

interface FAQItem {
  id: number
  question: string
  answer: string
  displayOrder: number
  isActive: number
}

export default function FAQ() {
  const { lang } = useLang()
  const [openId, setOpenId] = useState<number | null>(null)
  const [faqs, setFaqs] = useState<FAQItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch FAQ data from API with language parameter
    console.log('🔄 FAQ: Fetching data with language:', lang);
    setLoading(true)
    fetch(`/api/faq?activeOnly=true&lang=${lang}`)
      .then(res => res.json())
      .then(data => {
        console.log('✅ FAQ: Received data:', data);
        console.log('📊 FAQ: First question:', data[0]?.question);
        setFaqs(data)
        setLoading(false)
      })
      .catch(error => {
        console.error('❌ FAQ: Error loading FAQs:', error)
        setLoading(false)
      })
  }, [lang]) // Re-fetch when language changes

  const toggleFAQ = (id: number) => {
    setOpenId(openId === id ? null : id)
  }

  if (loading) {
    return (
      <section id="faq" className="relative py-16 sm:py-20 md:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {lang === 'ar' ? 'جاري تحميل الأسئلة الشائعة...' : 'Loading FAQs...'}
          </p>
        </div>
      </section>
    )
  }

  if (faqs.length === 0) {
    return null
  }

  return (
    <section id="faq" className="relative py-16 sm:py-20 md:py-24 overflow-hidden">
      {/* Background with gradient and patterns */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50"></div>
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-400 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400 rounded-full filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
        {/* Title Section */}
        <div className="text-center mb-12 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative inline-block"
          >
            {/* Decorative icon */}
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl rotate-12 flex items-center justify-center shadow-xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-4 mt-6">
              {lang === 'ar' ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
            </h2>
            <div className="w-24 h-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 mx-auto rounded-full mb-4"></div>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed"
          >
            {lang === 'ar' 
              ? 'كل ما تحتاج معرفته عن منصتنا في مكان واحد - إجابات واضحة وسريعة' 
              : 'Everything you need to know about our platform in one place - clear and quick answers'}
          </motion.p>
        </div>

        {/* FAQ Accordion - Enhanced Design */}
        <div className="space-y-5">
          {faqs.map((faq, index) => (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ 
                duration: 0.6, 
                delay: index * 0.08,
                ease: "easeOut" 
              }}
              whileHover={{ scale: 1.01 }}
              className="group relative"
            >
              {/* Gradient border effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur"></div>
              
              <div className={`relative bg-white rounded-2xl shadow-lg border-2 overflow-hidden transition-all duration-500 ${
                openId === faq.id 
                  ? 'border-cyan-500 shadow-2xl shadow-cyan-500/20' 
                  : 'border-gray-100 hover:border-cyan-300'
              }`}>
                {/* Question Button */}
                <button
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full flex items-start sm:items-center gap-4 sm:gap-6 p-5 sm:p-7 text-left focus:outline-none"
                  aria-expanded={openId === faq.id}
                >
                  {/* Animated Number Badge */}
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.15 }}
                    transition={{ duration: 0.6 }}
                    className="flex-shrink-0"
                  >
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-lg sm:text-xl font-bold shadow-xl transition-all duration-300 ${
                      openId === faq.id
                        ? 'bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 text-white scale-110'
                        : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 group-hover:from-cyan-100 group-hover:to-blue-100 group-hover:text-cyan-700'
                    }`}>
                      {index + 1}
                    </div>
                  </motion.div>

                  {/* Question Text */}
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-lg sm:text-xl font-bold transition-all duration-300 leading-tight ${
                      openId === faq.id
                        ? 'text-transparent bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text'
                        : 'text-gray-800 group-hover:text-cyan-700'
                    }`}>
                      {faq.question}
                    </h3>
                  </div>

                  {/* Animated Arrow Icon */}
                  <motion.div
                    animate={{ 
                      rotate: openId === faq.id ? 180 : 0,
                      scale: openId === faq.id ? 1.1 : 1
                    }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="flex-shrink-0"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      openId === faq.id
                        ? 'bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg'
                        : 'bg-gray-100 group-hover:bg-cyan-100'
                    }`}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`w-6 h-6 transition-colors duration-300 ${
                          openId === faq.id ? 'text-white' : 'text-gray-600 group-hover:text-cyan-600'
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </motion.div>
                </button>

                {/* Answer Section with Enhanced Animation */}
                <AnimatePresence>
                  {openId === faq.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ 
                        height: { duration: 0.4, ease: "easeInOut" },
                        opacity: { duration: 0.3 }
                      }}
                      className="overflow-hidden"
                    >
                      <motion.div 
                        initial={{ y: -10 }}
                        animate={{ y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="px-5 sm:px-7 pb-6 sm:pb-7"
                      >
                        {/* Decorative divider */}
                        <div className="w-full h-px bg-gradient-to-r from-transparent via-cyan-300 to-transparent mb-5"></div>
                        
                        <div className="pl-0 sm:pl-20">
                          <div className="bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 rounded-xl p-5 sm:p-6 border-l-4 border-cyan-500 shadow-inner">
                            <p className="text-base sm:text-lg text-gray-700 leading-relaxed whitespace-pre-line">
                              {faq.answer}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Enhanced Contact CTA */}
        <motion.div
          className="mt-12 sm:mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 p-8 sm:p-10 shadow-2xl">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full filter blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full filter blur-2xl"></div>
            
            <div className="relative text-center">
              {/* Icon */}
              <motion.div 
                className="inline-block mb-4"
                whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
              </motion.div>

              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                {lang === 'ar' ? 'لم تجد إجابة لسؤالك؟' : "Still have questions?"}
              </h3>
              <p className="text-base sm:text-lg text-white/90 mb-6 max-w-2xl mx-auto">
                {lang === 'ar' 
                  ? 'فريق الدعم لدينا جاهز دائماً لمساعدتك والإجابة على جميع استفساراتك' 
                  : "Our support team is always ready to help you and answer all your questions"}
              </p>

              <motion.button
                onClick={() => {
                  const contactSection = document.getElementById('contact');
                  if (contactSection) {
                    contactSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-3 px-8 py-4 bg-white text-cyan-600 font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all text-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {lang === 'ar' ? 'تواصل معنا الآن' : 'Contact Us Now'}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
