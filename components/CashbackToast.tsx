"use client";
import { useEffect, useState } from 'react';
import { useLang } from './layout/Providers';
import { motion, AnimatePresence } from 'framer-motion';

const messages = {
  ar: {
    cashback: 'كاش باك 2%',
    description: 'عند التعاقد عبر المنصة',
    action: 'تفاصيل'
  },
  en: {
    cashback: '2% Cashback',
    description: 'On platform contracts',
    action: 'Details'
  },
};

export default function CashbackToast() {
  const { lang } = useLang();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const showToast = () => {
      setShow(true);
      setTimeout(() => setShow(false), 4000);
    };
    const initialTimeout = setTimeout(showToast, 3000);
    const interval = setInterval(showToast, 40000);
    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  const handleClick = () => {
    const servicesSection = document.getElementById('services');
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: 'smooth' });
    }
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ 
            x: lang === 'ar' ? 300 : -300,
            opacity: 0,
            scale: 0.9
          }}
          animate={{ 
            x: 0,
            opacity: 1,
            scale: 1
          }}
          exit={{ 
            x: lang === 'ar' ? 300 : -300,
            opacity: 0,
            scale: 0.9
          }}
          transition={{ 
            type: "spring",
            stiffness: 180,
            damping: 22
          }}
          className={`fixed bottom-20 md:bottom-6 ${lang === 'ar' ? 'right-4 md:right-6' : 'left-4 md:left-6'} z-[100] max-w-[280px] cursor-pointer group`}
          onClick={handleClick}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-2xl opacity-40 blur-lg group-hover:opacity-60 transition-opacity duration-300"></div>
          
          <motion.div
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="relative bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-xl overflow-hidden"
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.1, 0.15, 0.1]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute top-0 right-0 w-20 h-20 bg-white rounded-full blur-xl"
            />

            <div className="relative p-3">
              <div className="flex items-center gap-2.5">
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="flex-shrink-0 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </motion.div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-white leading-tight mb-0.5 flex items-center gap-1.5">
                    <motion.span
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="text-yellow-300 text-sm"
                    >
                      
                    </motion.span>
                    {messages[lang].cashback}
                  </h3>
                  <p className="text-white/85 text-xs leading-tight">
                    {messages[lang].description}
                  </p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.15, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShow(false);
                  }}
                  className="flex-shrink-0 w-6 h-6 bg-white/15 hover:bg-white/25 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors"
                >
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>

              <motion.button
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-2.5 w-full bg-white/95 hover:bg-white text-emerald-700 font-semibold py-1.5 px-3 rounded-lg text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5"
                onClick={handleClick}
              >
                <span>{messages[lang].action}</span>
                <motion.svg
                  animate={{ x: lang === 'ar' ? [-1, 1, -1] : [1, -1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className={`w-3.5 h-3.5 ${lang === 'ar' ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </motion.svg>
              </motion.button>
            </div>

            <motion.div
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: 4, ease: "linear" }}
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/50 origin-left"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
