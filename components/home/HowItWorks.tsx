"use client"
import { useLang } from '../../components/layout/Providers'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}
function HandshakeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M4 12l4-4 4 4 4-4 4 4" />
      <path d="M4 12v4a2 2 0 0 0 2 2h3" />
      <path d="M20 12v4a2 2 0 0 1-2 2h-3" />
    </svg>
  )
}
function ChecklistIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <polyline points="4 7 7 10 13 4" />
      <line x1="4" y1="14" x2="20" y2="14" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  )
}
function RocketIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M5 19c2-6 8-12 14-14-2 6-8 12-14 14Z" />
      <path d="M6 6l4 4" />
      <path d="M2 22l4-4" />
    </svg>
  )
}

export default function HowItWorks() {
  const { tArr, t, lang } = useLang()
  const steps = tArr('how.steps')

  const icons = [SearchIcon, HandshakeIcon, ChecklistIcon, RocketIcon]
  const gradients = [
    'from-blue-500 to-cyan-500',
    'from-purple-500 to-pink-500',
    'from-orange-500 to-red-500',
    'from-green-500 to-emerald-500'
  ]

  return (
    <section id="how" className="relative py-16 sm:py-20 md:py-24 px-4 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50"></div>
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-400 rounded-full filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Enhanced Title Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 sm:mb-16"
        >
          <div className="inline-block relative">
            {/* Decorative elements */}
            <div className="absolute -top-6 -left-6 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full opacity-20 blur-xl"></div>
            <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-gradient-to-br from-pink-500 to-orange-600 rounded-full opacity-20 blur-xl"></div>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 px-4">
              {t('how.title')}
            </h2>
            <div className="w-32 h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 mx-auto rounded-full"></div>
          </div>
        </motion.div>

        {/* Steps with Connection Lines */}
        <div className="relative max-w-6xl mx-auto">
          {/* Connection line for desktop */}
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-1">
            <motion.div 
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 via-pink-500 to-green-500 rounded-full origin-left"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
          {steps.map((s: any, i: number) => {
            const Icon = icons[i % icons.length]
            const gradient = gradients[i % gradients.length]
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ 
                  duration: 0.6, 
                  delay: i * 0.15,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ y: -8, scale: 1.03 }}
                className="relative group"
              >
                {/* Glow effect */}
                <div className={`absolute -inset-1 bg-gradient-to-r ${gradient} rounded-3xl opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500`}></div>
                
                {/* Card */}
                <div className="relative bg-white rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-gray-100 group-hover:border-transparent transition-all duration-300">
                  {/* Number badge */}
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.2 }}
                    transition={{ duration: 0.6 }}
                    className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center font-extrabold text-white text-2xl shadow-2xl mb-5`}
                  >
                    {i + 1}
                  </motion.div>

                  {/* Icon */}
                  <motion.div
                    animate={{ 
                      y: [0, -5, 0],
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="mb-5"
                  >
                    <div className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br ${gradient} bg-opacity-10 flex items-center justify-center`}>
                      <Icon className={`w-10 h-10 bg-gradient-to-br ${gradient} text-transparent`} style={{ filter: 'drop-shadow(0 0 8px currentColor)' }} />
                    </div>
                  </motion.div>

                  {/* Text */}
                  <p className="text-gray-800 text-base sm:text-lg font-bold leading-relaxed text-center">
                    {s[lang] ?? s.ar}
                  </p>
                </div>

                {/* Arrow connector for desktop */}
                {i < steps.length - 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15 + 0.5 }}
                    className="hidden lg:block absolute top-20 -right-6 z-10"
                  >
                    <svg className="w-12 h-12 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5-5 5" />
                    </svg>
                  </motion.div>
                )}
              </motion.div>
            )
          })}
          </div>
        </div>
      </div>
    </section>
  )
}
