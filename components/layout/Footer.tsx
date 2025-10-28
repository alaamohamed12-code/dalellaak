"use client"
import { useLang } from './Providers'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function Footer() {
  const { t, lang } = useLang()
  const nav = [
    { id: 'home', label: t('nav.home') },
    { id: 'services', label: t('nav.services') },
    { id: 'partners', label: t('nav.partners') }
  ]

  function scrollToId(id: string) {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  const followUsLabel = lang === 'ar' ? 'تابعنا' : 'Follow us'

  return (
    <footer className="relative text-gray-100 overflow-hidden">
      {/* Subtle animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-[#0b1220] to-gray-900" />
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <motion.div
          animate={{ scale: [1, 1.2, 1], x: [0, 30, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-24 -left-16 w-80 h-80 rounded-full bg-cyan-500 blur-3xl"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], x: [0, -30, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-24 -right-16 w-80 h-80 rounded-full bg-purple-600 blur-3xl"
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Top CTA strip */}
        <div className="mb-10">
          <div className="relative group">
            <div className="absolute -inset-px bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 rounded-2xl opacity-70 blur group-hover:opacity-100 transition-opacity" />
            <div className="relative rounded-2xl bg-gradient-to-br from-cyan-500/20 via-blue-600/20 to-purple-700/20 border border-white/10 backdrop-blur-md p-5 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-center md:text-start">
                <div className="text-lg sm:text-xl font-bold text-white">
                  {t('join.title')}
                </div>
                <div className="text-sm text-white/80 mt-1">
                  {lang === 'ar' ? 'انطلق الآن وكن شريكاً موثوقاً ضمن شبكتنا' : 'Start now and become a trusted partner in our network'}
                </div>
              </div>
              <a
                href="/signup"
                className="relative inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-gray-900 font-semibold shadow-lg hover:shadow-xl transition-shadow"
              >
                <span className="bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent text-base sm:text-lg font-extrabold">
                  {t('cta.start')}
                </span>
                <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 text-white ${lang === 'ar' ? 'rotate-180' : ''}`}>
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M13 7l5 5-5 5" />
                    <path d="M6 12h12" />
                  </svg>
                </span>
              </a>
            </div>
          </div>
        </div>

        {/* Main footer grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {/* Brand / About */}
          <div>
            <div className="text-2xl font-extrabold tracking-tight">{t('site.title')}</div>
            <p className="mt-3 text-sm leading-relaxed text-gray-300 max-w-sm">
              {t('hero.line1')}
            </p>
            <div className="mt-5">
              <div className="text-xs uppercase tracking-wider text-white/70 mb-2">{followUsLabel}</div>
              <div className="flex items-center gap-3">
                <a href="#" aria-label="X" className="group inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 transition-colors">
                  <svg className="h-5 w-5 text-white/90 group-hover:text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M18.9 3H22l-7.1 8.1L22.8 21h-7l-5.5-6.6L3.9 21H1l7.6-8.7L1 3h7l5 6 5.9-6z"/></svg>
                </a>
                <a href="#" aria-label="LinkedIn" className="group inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 transition-colors">
                  <svg className="h-5 w-5 text-white/90 group-hover:text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M6.94 6.5A2.44 2.44 0 114.5 4.06 2.44 2.44 0 016.94 6.5zM4.75 8.5h4.38V21H4.75zM13 8.5h4.19v1.7h.06a4.6 4.6 0 014.15-2.28C24 7.92 25 10.2 25 13.57V21h-4.38v-6.28c0-1.5 0-3.42-2.09-3.42-2.09 0-2.41 1.63-2.41 3.31V21H11.75V8.5z" transform="translate(-2)"/></svg>
                </a>
                <a href="#" aria-label="Instagram" className="group inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 transition-colors">
                  <svg className="h-5 w-5 text-white/90 group-hover:text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.9.3 2.4.5.6.2 1 .5 1.5 1 .5.5.8.9 1 1.5.2.5.4 1.2.5 2.4.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.3 1.9-.5 2.4-.2.6-.5 1-1 1.5-.5.5-.9.8-1.5 1-.5.2-1.2.4-2.4.5-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.9-.3-2.4-.5-.6-.2-1-.5-1.5-1-.5-.5-.8-.9-1-1.5-.2-.5-.4-1.2-.5-2.4C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.3-1.9.5-2.4.2-.6.5-1 1-1.5.5-.5.9-.8 1.5-1 .5-.2 1.2-.4 2.4-.5C8.4 2.2 8.8 2.2 12 2.2m0 1.8c-3.1 0-3.5 0-4.7.1-1 .1-1.6.2-2 .4-.5.2-.8.4-1.2.8-.4.4-.6.7-.8 1.2-.2.4-.3 1-.4 2-.1 1.2-.1 1.6-.1 4.7s0 3.5.1 4.7c.1 1 .2 1.6.4 2 .2.5.4.8.8 1.2.4.4.7.6 1.2.8.4.2 1 .3 2 .4 1.2.1 1.6.1 4.7.1s3.5 0 4.7-.1c1-.1 1.6-.2 2-.4.5-.2.8-.4 1.2-.8.4-.4.6-.7.8-1.2.2-.4.3-1 .4-2 .1-1.2.1-1.6.1-4.7s0-3.5-.1-4.7c-.1-1-.2-1.6-.4-2-.2-.5-.4-.8-.8-1.2-.4-.4-.7-.6-1.2-.8-.4-.2-1-.3-2-.4-1.2-.1-1.6-.1-4.7-.1m0 3.7a4.6 4.6 0 110 9.3 4.6 4.6 0 010-9.3m0 1.8a2.9 2.9 0 100 5.7 2.9 2.9 0 000-5.7M17.8 6.6a1.1 1.1 0 110 2.2 1.1 1.1 0 010-2.2"/></svg>
                </a>
              </div>
            </div>
          </div>

          {/* Links */}
          <div>
            <div className="text-sm font-semibold text-white/80 mb-3">{t('footer.links')}</div>
            <ul className="space-y-2 text-sm">
              {nav.map((n) => (
                <li key={n.id}>
                  <button
                    onClick={() => scrollToId(n.id)}
                    className="w-full text-start hover:text-cyan-400 transition-colors py-1.5 px-2 rounded-md hover:bg-white/5 min-h-[40px] inline-flex items-center"
                  >
                    {n.label}
                  </button>
                </li>
              ))}
              <li>
                <Link
                  href="/terms"
                  className="inline-flex items-center gap-2 hover:text-cyan-400 transition-colors py-1.5 px-2 rounded-md hover:bg-white/5 min-h-[40px]"
                >
                  <span className="inline-block w-2 h-2 rounded-full bg-white/30" />
                  {lang === 'ar' ? 'الشروط والأحكام' : 'Terms & Conditions'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <div className="text-sm font-semibold text-white/80 mb-3">{t('footer.contact')}</div>
            <ul className="space-y-3 text-sm">
              <li>
                <a href={`mailto:${t('contact.email')}`} className="group inline-flex items-center gap-3 text-gray-200 hover:text-white">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 border border-white/10 group-hover:bg-white/20 transition-colors">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16v16H4z" opacity=".1" />
                      <path d="M4 8l8 5 8-5" />
                      <rect x="4" y="4" width="16" height="16" rx="2" />
                    </svg>
                  </span>
                  <span className="font-medium">{t('contact.email')}</span>
                </a>
              </li>
              <li>
                <a href={`tel:${t('contact.phone')}`} className="group inline-flex items-center gap-3 text-gray-200 hover:text-white">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 border border-white/10 group-hover:bg-white/20 transition-colors">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.8 19.8 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.8 19.8 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.12.9.33 1.78.62 2.63a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.45-1.19a2 2 0 012.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0122 16.92z" />
                    </svg>
                  </span>
                  <span className="font-medium phone-number">{t('contact.phone')}</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Quick CTA */}
          <div>
            <div className="text-sm font-semibold text-white/80 mb-3">{lang === 'ar' ? 'ابدأ' : 'Get started'}</div>
            <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
              <p className="text-sm text-gray-300 mb-4">
                {lang === 'ar' ? 'انضم كشريك موثوق واستفد من فرص جديدة.' : 'Join as a trusted partner and unlock new opportunities.'}
              </p>
              <a href="/signup" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-gray-900 font-semibold shadow hover:shadow-md transition-shadow">
                <span className="bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
                  {t('cta.start')}
                </span>
                <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 text-white ${lang === 'ar' ? 'rotate-180' : ''}`}>
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M13 7l5 5-5 5" />
                    <path d="M6 12h12" />
                  </svg>
                </span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 pt-6 border-t border-white/10 text-center text-xs sm:text-sm text-gray-300">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
            <div>{t('footer.rights')}</div>
            <span className="hidden sm:inline text-white/20">•</span>
            <Link href="/terms" className="hover:text-white underline/20 hover:underline">
              {lang === 'ar' ? 'الشروط والأحكام' : 'Terms & Conditions'}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
