"use client"
import { useLang } from '../../components/layout/Providers'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

function ShieldIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M12 2l7 4v6c0 5-3.5 9-7 10-3.5-1-7-5-7-10V6l7-4Z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  )
}
function LightningIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M13 2L3 14h7l-1 8 11-12h-7l1-8Z" />
    </svg>
  )
}
function TrophyIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M17 3H7v3a5 5 0 0 0 10 0V3Z" />
      <path d="M5 3h2v2a4 4 0 0 1-4 4H2V5a2 2 0 0 1 2-2Z" />
      <path d="M19 3h-2v2a4 4 0 0 0 4 4h1V5a2 2 0 0 0-2-2Z" />
      <path d="M12 14v6" />
      <path d="M8 22h8" />
    </svg>
  )
}
function SupportIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 15h.01M12 7v5l3 3" />
    </svg>
  )
}
function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M12 3l2 4 4 2-4 2-2 4-2-4-4-2 4-2 2-4Z" />
      <path d="M19 14l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2Z" />
    </svg>
  )
}

export default function WhyChooseUs() {
  const { tArr, t, lang } = useLang()
  const features: any[] = tArr('why.features')

  const icons = [ShieldIcon, LightningIcon, TrophyIcon, SupportIcon, SparklesIcon]
  const colors = [
    { bg: 'from-green-500 to-emerald-600', icon: 'text-green-600', glow: 'bg-green-500' },
    { bg: 'from-blue-500 to-cyan-600', icon: 'text-blue-600', glow: 'bg-blue-500' },
    { bg: 'from-yellow-500 to-orange-600', icon: 'text-yellow-600', glow: 'bg-yellow-500' },
    { bg: 'from-purple-500 to-pink-600', icon: 'text-purple-600', glow: 'bg-purple-500' },
    { bg: 'from-red-500 to-rose-600', icon: 'text-red-600', glow: 'bg-red-500' },
  ]

  return (
    <section id="why" className="relative py-16 sm:py-20 md:py-24 px-4 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50"></div>
      <div className="absolute inset-0 opacity-20">
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-10 right-10 w-96 h-96 bg-purple-400 rounded-full filter blur-3xl"
        />
        <motion.div
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-10 left-10 w-80 h-80 bg-pink-400 rounded-full filter blur-3xl"
        />
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Enhanced Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 sm:mb-16"
        >
          <div className="inline-block relative">
            {/* Trophy icon */}
            <motion.div 
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -top-12 left-1/2 transform -translate-x-1/2"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl rotate-12 flex items-center justify-center shadow-2xl">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
            </motion.div>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent mb-4 mt-8 px-4">
              {t('why.title')}
            </h2>
            <div className="w-32 h-1.5 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 mx-auto rounded-full"></div>
          </div>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8">
          {features.map((f, i) => {
            const Icon = icons[i % icons.length]
            const color = colors[i % colors.length]
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ 
                  duration: 0.5, 
                  delay: i * 0.1,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ 
                  y: -12, 
                  scale: 1.05,
                  rotateY: 5,
                  rotateX: 5
                }}
                className="group relative"
              >
                {/* Glow effect */}
                <div className={`absolute -inset-1 ${color.glow} rounded-3xl opacity-0 group-hover:opacity-40 blur-2xl transition-opacity duration-500`}></div>
                
                {/* Card */}
                <div className="relative bg-white rounded-3xl p-6 shadow-xl border-2 border-gray-100 group-hover:border-transparent transition-all duration-300 h-full flex flex-col items-center justify-center text-center">
                  {/* Icon container */}
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.2 }}
                    transition={{ duration: 0.8 }}
                    className={`w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br ${color.bg} flex items-center justify-center shadow-2xl group-hover:shadow-3xl transition-shadow`}
                  >
                    <Icon className="w-10 h-10 text-white" strokeWidth={2.5} />
                  </motion.div>

                  {/* Text with emoji */}
                  <div className="text-gray-800 text-base sm:text-lg font-bold leading-relaxed">
                    {f[lang] ?? f.ar}
                  </div>

                  {/* Decorative corner */}
                  <div className={`absolute top-3 right-3 w-2 h-2 rounded-full bg-gradient-to-br ${color.bg} opacity-60`}></div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
