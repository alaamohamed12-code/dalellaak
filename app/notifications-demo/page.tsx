"use client"
import { motion } from 'framer-motion'
import { useState } from 'react'
import { testNotifications, animationVariants } from '@/lib/notifications-test'

export default function NotificationsDemoPage() {
  const [selectedDemo, setSelectedDemo] = useState<'slideIn' | 'fadeScale' | 'bounce' | 'pulse' | 'shake'>('slideIn')
  const [showNotification, setShowNotification] = useState(true)

  const demoVariants = {
    slideIn: animationVariants.slideInRight,
    fadeScale: animationVariants.fadeScale,
    bounce: animationVariants.bounce,
    pulse: animationVariants.pulse,
    shake: animationVariants.shake
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-4">
            🔔 نظام الإشعارات المطور
          </h1>
          <p className="text-xl text-gray-600">
            عرض توضيحي للتحسينات والأنيميشن الجديدة
          </p>
        </motion.div>

        {/* Animation Controls */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4">اختر نوع الأنيميشن</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {(['slideIn', 'fadeScale', 'bounce', 'pulse', 'shake'] as const).map((type) => (
              <button
                key={type}
                onClick={() => {
                  setSelectedDemo(type)
                  setShowNotification(false)
                  setTimeout(() => setShowNotification(true), 100)
                }}
                className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                  selectedDemo === type
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type === 'slideIn' && '↗️ انزلاق'}
                {type === 'fadeScale' && '🎯 تلاشي'}
                {type === 'bounce' && '⬆️ ارتداد'}
                {type === 'pulse' && '💓 نبض'}
                {type === 'shake' && '🔔 اهتزاز'}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Demo Area */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-lg p-12 min-h-[400px] flex items-center justify-center">
          {showNotification && (
            <motion.div
              key={selectedDemo}
              {...demoVariants[selectedDemo]}
              className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xl shadow-md">
                  🔔
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-1">
                    إشعار جديد
                  </h3>
                  <p className="text-gray-600 text-sm">
                    لديك رسالة جديدة من أحد العملاء
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-xs text-gray-500">منذ دقيقتين</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-xs text-gray-500">من: النظام</span>
                  </div>
                </div>
                <div className="w-3 h-3 bg-cyan-500 rounded-full animate-pulse"></div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {[
            {
              icon: '🔄',
              title: 'تحديث تلقائي',
              description: 'يتم تحديث الإشعارات كل 30 ثانية تلقائياً'
            },
            {
              icon: '📊',
              title: 'إحصائيات ذكية',
              description: 'عرض إجمالي الإشعارات والمقروءة وغير المقروءة'
            },
            {
              icon: '🎯',
              title: 'فلاتر متقدمة',
              description: 'تصفية الإشعارات حسب الحالة: الكل، مقروءة، غير مقروءة'
            },
            {
              icon: '✅',
              title: 'تحديد متعدد',
              description: 'إمكانية تحديد وحذف عدة إشعارات دفعة واحدة'
            },
            {
              icon: '⚡',
              title: 'استجابة سريعة',
              description: 'أداء محسّن وسرعة في تحميل الإشعارات'
            },
            {
              icon: '🎨',
              title: 'تصميم احترافي',
              description: 'واجهة مستخدم حديثة مع أنيميشن انسيابية'
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white rounded-2xl shadow-lg p-6 text-center"
            >
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Test Notifications */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 bg-white rounded-2xl shadow-lg p-6"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4">نماذج إشعارات تجريبية</h2>
          <div className="space-y-3">
            {testNotifications.slice(0, 3).map((notif, index) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-xl border-2 ${
                  !notif.isRead
                    ? 'border-cyan-500 bg-cyan-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    !notif.isRead
                      ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white'
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    {!notif.isRead ? '🔔' : '✓'}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm ${!notif.isRead ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                      {notif.notification?.message}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      <span>{notif.notification?.createdBy}</span>
                    </div>
                  </div>
                  {!notif.isRead && (
                    <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* API Endpoints */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-12 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl shadow-lg p-6 text-white"
        >
          <h2 className="text-2xl font-bold mb-4">🚀 API Endpoints</h2>
          <div className="space-y-3 font-mono text-sm">
            <div className="flex items-center gap-3">
              <span className="px-2 py-1 bg-green-500 rounded text-xs font-bold">GET</span>
              <span>/api/notifications</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-2 py-1 bg-blue-500 rounded text-xs font-bold">POST</span>
              <span>/api/notifications/mark-read</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-2 py-1 bg-blue-500 rounded text-xs font-bold">POST</span>
              <span>/api/notifications/mark-all-read</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-2 py-1 bg-red-500 rounded text-xs font-bold">POST</span>
              <span>/api/notifications/delete</span>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 text-center"
        >
          <a
            href="/notifications"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            <span>🔔</span>
            <span>انتقل إلى صفحة الإشعارات</span>
          </a>
        </motion.div>
      </div>
    </div>
  )
}
