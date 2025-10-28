"use client"
import React from 'react'
import { useLang } from '../../components/layout/Providers'
import { motion } from 'framer-motion'

const partners = [
  {
    id: 'p1',
    name: { ar: 'شركة الفجر للمقاولات', en: 'Al Fajr Contracting' },
    logo: 'https://picsum.photos/seed/partner1/400/200',
    rating: 4.6,
    href: '/partners/p1'
  },
  {
    id: 'p2',
    name: { ar: 'مؤسسة النخبة الهندسية', en: 'Elite Engineering Co.' },
    logo: 'https://picsum.photos/seed/partner2/400/200',
    rating: 4.3,
    href: '/partners/p2'
  },
  {
    id: 'p3',
    name: { ar: 'المزوّد الحديث للمواد', en: 'Modern Materials Supply' },
    logo: 'https://picsum.photos/seed/partner3/400/200',
    rating: 4.8,
    href: '/partners/p3'
  },
  {
    id: 'p4',
    name: { ar: 'ديزاينستوديو', en: 'DesignStudio' },
    logo: 'https://picsum.photos/seed/partner4/400/200',
    rating: 4.2,
    href: '/partners/p4'
  }
]

function Stars({ value }: { value: number }) {
  const full = Math.floor(value)
  const half = value - full >= 0.5
  const empty = 5 - full - (half ? 1 : 0)
  return (
    <div className="flex items-center gap-1 text-yellow-400" aria-hidden>
      {Array.from({ length: full }).map((_, i) => (
        <span key={'f' + i}>★</span>
      ))}
      {half ? <span>☆</span> : null}
      {Array.from({ length: empty }).map((_, i) => (
        <span key={'e' + i} className="text-gray-300">★</span>
      ))}
    </div>
  )
}

export default function PartnersSection() {
  const { t, lang } = useLang()

  const container = {
    hidden: { opacity: 0, scale: 0.0 },
    visible: { opacity: 1, scale: 1, transition: { staggerChildren: 0.12, type: 'spring', stiffness: 120, damping: 14 } }
  }
  const card = {
    hidden: { opacity: 0, scale: 0.85, rotateZ: 6 },
    visible: { opacity: 1, scale: 1, rotateZ: 0, transition: { type: 'spring', stiffness: 140, damping: 16 } }
  }

  return (
    <motion.section id="partners" className="py-12" initial="hidden" animate="visible" variants={container}>
      <div className="max-w-7xl mx-auto px-4 flex flex-col items-center">
        <motion.h2 variants={card} className="area-badge inline-block px-6 py-2 mb-8 text-lg font-bold rounded-full text-center">
          {t('partners.title')}
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full card-3d-wrap">
          {partners.map((p) => (
            <motion.a
              key={p.id}
              href={p.href}
              variants={card}
              className="card-3d bg-white rounded-lg p-4 flex flex-col items-center text-center"
              aria-label={`${p.name[lang]} profile`}
            >
              <div className="w-full flex items-center justify-center h-28 mb-3">
                <img src={p.logo} alt={p.name[lang]} className="max-h-20 object-contain" loading="eager" />
              </div>
              <div className="font-semibold text-lg leading-snug glow-text">{p.name[lang]}</div>
              <div className="mt-2 flex items-center gap-3">
                <Stars value={p.rating} />
                <div className="text-sm text-gray-600">{p.rating.toFixed(1)}</div>
              </div>
            </motion.a>
          ))}
        </div>

        <div className="mt-8 text-center">
          <a href="/partners" className="btn-oval-torch inline-flex">{t('partners.showAll')}</a>
        </div>
      </div>
    </motion.section>
  )
}
