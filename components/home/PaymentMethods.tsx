"use client"
import React, { useEffect, useState } from 'react'
import { useLang } from '../layout/Providers'
import { motion, AnimatePresence } from 'framer-motion'

// Payment methods with their logos
const paymentMethods = [
  {
    id: 'visa',
    name: 'Visa',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg',
    color: '#1A1F71'
  },
  {
    id: 'mastercard',
    name: 'Mastercard',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg',
    color: '#EB001B'
  },
  {
    id: 'amex',
    name: 'American Express',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/3/30/American_Express_logo.svg',
    color: '#006FCF'
  },
  {
    id: 'paypal',
    name: 'PayPal',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg',
    color: '#003087'
  },
  {
    id: 'apple-pay',
    name: 'Apple Pay',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b0/Apple_Pay_logo.svg',
    color: '#000000'
  },
  {
    id: 'google-pay',
    name: 'Google Pay',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg',
    color: '#4285F4'
  },
  {
    id: 'mada',
    name: 'Mada',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Mada_Logo.svg',
    color: '#00A859'
  },
  {
    id: 'stc-pay',
    name: 'STC Pay',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Stc_pay_logo.svg',
    color: '#4B0082'
  }
]


export default function PaymentMethods() {
  const { t, lang } = useLang()
  // Animation: show each card one by one with fade/slide, then hide all, then repeat
  const [visibleIndexes, setVisibleIndexes] = useState<number[]>([]);
  const [cycle, setCycle] = useState(0);
  const delay = 0.3; // seconds between each card
  const showDuration = 1.2; // seconds each card stays visible

  useEffect(() => {
    let timeouts: NodeJS.Timeout[] = [];
    // Show cards one by one
    paymentMethods.forEach((_, i) => {
      timeouts.push(setTimeout(() => {
        setVisibleIndexes((prev) => [...prev, i]);
      }, i * delay * 1000));
    });
    // Hide all after all are shown
    timeouts.push(setTimeout(() => {
      setVisibleIndexes([]);
      setCycle((c) => c + 1);
    }, paymentMethods.length * delay * 1000 + showDuration * 1000));
    return () => timeouts.forEach(clearTimeout);
    // eslint-disable-next-line
  }, [cycle]);

  return (
    <section id="partners" className="py-16 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        {/* Title */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
              {lang === 'ar' ? 'طرق دفع آمنة ومضمونة' : 'Secure & Trusted Payment Methods'}
            </h2>
            <p className="text-gray-600 text-lg">
              {lang === 'ar' 
                ? 'نوفر لك جميع طرق الدفع الإلكترونية الآمنة لراحتك وضمان معاملاتك' 
                : 'We provide all secure electronic payment methods for your convenience and transaction security'}
            </p>
          </motion.div>
        </div>

        {/* Animated Payment Logos Carousel */}
  <div className="relative">
          {/* Gradient overlays for fade effect */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none"></div>

          {/* Scrolling container */}
          <div className="flex overflow-hidden py-8 justify-center">
            <AnimatePresence initial={false}>
              {paymentMethods.map((method, i) =>
                visibleIndexes.includes(i) && (
                  <motion.div
                    key={method.id + cycle}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -40 }}
                    transition={{ duration: 0.5 }}
                    className="flex-shrink-0 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 w-40 h-28 mx-4 flex items-center justify-center group cursor-pointer"
                    style={{ borderTop: `4px solid ${method.color}` }}
                  >
                    <div className="relative w-full h-full flex items-center justify-center">
                      <img
                        src={method.logo}
                        alt={method.name}
                        className="max-w-full max-h-full object-contain filter grayscale-0 group-hover:grayscale-0 transition-all duration-300"
                        loading="lazy"
                        onError={(e) => {
                          // Fallback to text if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            const textSpan = document.createElement('span');
                            textSpan.className = 'font-bold text-lg text-gray-700';
                            textSpan.textContent = method.name;
                            parent.appendChild(textSpan);
                          }
                        }}
                      />
                    </div>
                  </motion.div>
                )
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Security badges */}
        <motion.div
          className="mt-12 flex flex-wrap justify-center items-center gap-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full border border-green-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11.5 8.5a1 1 0 11-2 0 1 1 0 012 0zm-3 3a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
            <span className="font-semibold text-green-700">
              {lang === 'ar' ? 'مشفر وآمن 100%' : '100% Encrypted & Secure'}
            </span>
          </div>

          <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full border border-blue-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-semibold text-blue-700">
              {lang === 'ar' ? 'معتمد من PCI DSS' : 'PCI DSS Certified'}
            </span>
          </div>

          <div className="flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-full border border-purple-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
              <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
            </svg>
            <span className="font-semibold text-purple-700">
              {lang === 'ar' ? 'دفع سريع وسهل' : 'Fast & Easy Payment'}
            </span>
          </div>
        </motion.div>

        {/* Additional info */}
        <motion.p
          className="text-center text-gray-500 text-sm mt-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          {lang === 'ar' 
            ? 'جميع المعاملات محمية بتقنيات التشفير المتقدمة وتتوافق مع معايير الأمان الدولية' 
            : 'All transactions are protected by advanced encryption technologies and comply with international security standards'}
        </motion.p>
      </div>
    </section>
  )
}
