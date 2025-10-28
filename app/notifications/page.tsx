"use client"
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '@/components/layout/Header'
import { useNotifications } from '@/contexts/NotificationContext'

type Notification = {
  id: number
  notificationId: number
  isRead: number
  readAt?: string
  notification?: {
    id: number
    message: string
    target: string
    createdAt: string
    createdBy?: string
  }
}

type FilterType = 'all' | 'unread' | 'read'

export default function NotificationsPage() {
  const [lang, setLang] = useState('ar')
  const { notifications, refreshNotifications, markAsRead: contextMarkAsRead } = useNotifications()
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [filter, setFilter] = useState<FilterType>('all')
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const u = localStorage.getItem('user')
      if (u) setUser(JSON.parse(u))
      const savedLang = localStorage.getItem('lang')
      if (savedLang) setLang(savedLang)
    }
  }, [])

  // Load notifications function
  const loadNotifications = async () => {
    setRefreshing(true)
    await refreshNotifications()
    setRefreshing(false)
  }

  // Mark single notification as read
  const markAsRead = async (userNotificationId: number) => {
    await contextMarkAsRead(userNotificationId)
  }

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!user) return
    
    try {
      await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user.id, 
          accountType: user.accountType,
          userEmail: user.email 
        })
      })

      await refreshNotifications()
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  // Delete selected notifications
  const deleteSelected = async () => {
    if (selectedIds.length === 0) return
    
    try {
      await fetch('/api/notifications/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userNotificationIds: selectedIds })
      })

      await refreshNotifications()
      setSelectedIds([])
    } catch (error) {
      console.error('Error deleting notifications:', error)
    }
  }

  // Toggle selection
  const toggleSelect = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  // Select all filtered
  const selectAll = () => {
    const filtered = getFilteredNotifications()
    setSelectedIds(filtered.map(n => n.id))
  }

  // Get filtered notifications
  const getFilteredNotifications = () => {
    switch (filter) {
      case 'unread':
        return notifications.filter(n => !n.isRead)
      case 'read':
        return notifications.filter(n => n.isRead)
      default:
        return notifications
    }
  }

  const filteredNotifications = getFilteredNotifications()
  const unreadCount = notifications.filter(n => !n.isRead).length

  if (!user) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="text-8xl mb-6">🔔</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {lang === 'ar' ? 'يرجى تسجيل الدخول' : 'Please log in'}
            </h2>
            <p className="text-gray-600 mb-6">
              {lang === 'ar' ? 'يجب تسجيل الدخول لعرض الإشعارات' : 'You need to log in to view notifications'}
            </p>
            <button
              className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105"
              onClick={() => (window.location.href = '/login')}
            >
              {lang === 'ar' ? 'تسجيل الدخول' : 'Login'}
            </button>
          </motion.div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 py-8">
        <div className="max-w-5xl mx-auto px-4">
          {/* Header with actions */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-2xl shadow-lg">
                    🔔
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                      {lang === 'ar' ? 'الإشعارات' : 'Notifications'}
                    </h1>
                    <p className="text-sm text-gray-600">
                      {lang === 'ar' ? 'تحديثات ورسائل هامة' : 'Important updates and messages'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => loadNotifications()}
                  disabled={refreshing}
                  className={`px-4 py-2 rounded-xl bg-white border-2 border-gray-200 hover:border-cyan-500 transition-all flex items-center gap-2 font-medium text-gray-700 hover:text-cyan-600 ${refreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span className={refreshing ? 'animate-spin' : ''}>🔄</span>
                  <span className="hidden sm:inline">{lang === 'ar' ? 'تحديث' : 'Refresh'}</span>
                </button>

                {typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default' && (
                  <button
                    onClick={async () => {
                      if ('Notification' in window) {
                        await Notification.requestPermission()
                        window.location.reload()
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white font-medium hover:shadow-lg transition-all hover:scale-105 flex items-center gap-2"
                  >
                    <span>🔔</span>
                    <span className="hidden sm:inline">{lang === 'ar' ? 'تفعيل التنبيهات' : 'Enable Alerts'}</span>
                  </button>
                )}
                
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium hover:shadow-lg transition-all hover:scale-105 flex items-center gap-2"
                  >
                    <span>✓</span>
                    <span className="hidden sm:inline">{lang === 'ar' ? 'تعيين الكل كمقروء' : 'Mark all as read'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Stats bar */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-2xl p-4 shadow-md border border-gray-100"
              >
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                  {notifications.length}
                </div>
                <div className="text-sm text-gray-600 font-medium mt-1">
                  {lang === 'ar' ? 'الإجمالي' : 'Total'}
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-4 shadow-md"
              >
                <div className="text-3xl font-bold text-white">
                  {unreadCount}
                </div>
                <div className="text-sm text-white/90 font-medium mt-1">
                  {lang === 'ar' ? 'غير مقروءة' : 'Unread'}
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-2xl p-4 shadow-md border border-gray-100"
              >
                <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
                  {notifications.length - unreadCount}
                </div>
                <div className="text-sm text-gray-600 font-medium mt-1">
                  {lang === 'ar' ? 'مقروءة' : 'Read'}
                </div>
              </motion.div>
            </div>

            {/* Filter tabs */}
            <div className="flex items-center gap-2 bg-white rounded-2xl p-2 shadow-md border border-gray-100">
              {(['all', 'unread', 'read'] as FilterType[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`flex-1 px-4 py-2.5 rounded-xl font-semibold transition-all ${
                    filter === f
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {f === 'all' && (lang === 'ar' ? '🔔 الكل' : '🔔 All')}
                  {f === 'unread' && (lang === 'ar' ? '📬 غير مقروءة' : '📬 Unread')}
                  {f === 'read' && (lang === 'ar' ? '✓ مقروءة' : '✓ Read')}
                </button>
              ))}
            </div>

            {/* Bulk actions */}
            <AnimatePresence>
              {selectedIds.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-blue-900">
                      {selectedIds.length} {lang === 'ar' ? 'محدد' : 'selected'}
                    </span>
                    <button
                      onClick={() => setSelectedIds([])}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {lang === 'ar' ? 'إلغاء التحديد' : 'Deselect all'}
                    </button>
                  </div>
                  <button
                    onClick={deleteSelected}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-all flex items-center gap-2"
                  >
                    <span>🗑️</span>
                    <span>{lang === 'ar' ? 'حذف المحدد' : 'Delete selected'}</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {filteredNotifications.length > 0 && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={selectAll}
                  className="text-sm text-cyan-600 hover:text-cyan-800 font-medium"
                >
                  {lang === 'ar' ? '✓ تحديد الكل' : '✓ Select all'}
                </button>
              </div>
            )}
          </motion.div>

          {/* Notifications list */}
          {loading ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-2xl shadow-lg p-12 text-center"
            >
              <div className="inline-block w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 font-semibold text-lg">{lang === 'ar' ? 'جارٍ التحميل...' : 'Loading...'}</p>
            </motion.div>
          ) : filteredNotifications.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-lg p-12 text-center"
            >
              <div className="text-8xl mb-6">
                {filter === 'all' && '🔔'}
                {filter === 'unread' && '📬'}
                {filter === 'read' && '✓'}
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                {filter === 'all' && (lang === 'ar' ? 'لا توجد إشعارات' : 'No notifications')}
                {filter === 'unread' && (lang === 'ar' ? 'لا توجد إشعارات غير مقروءة' : 'No unread notifications')}
                {filter === 'read' && (lang === 'ar' ? 'لا توجد إشعارات مقروءة' : 'No read notifications')}
              </h2>
              <p className="text-gray-600">
                {lang === 'ar' ? 'ستظهر هنا الإشعارات والتحديثات الهامة' : 'Important notifications and updates will appear here'}
              </p>
            </motion.div>
          ) : (
            <motion.div layout className="space-y-3">
              <AnimatePresence mode="popLayout">
                {filteredNotifications.map((notif, index) => (
                  <motion.div
                    key={notif.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.02 }}
                    className={`group relative bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-5 ${
                      !notif.isRead ? 'border-l-4 border-cyan-500' : 'border-l-4 border-transparent'
                    } ${selectedIds.includes(notif.id) ? 'ring-2 ring-blue-500' : ''}`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Checkbox */}
                      <label className="flex-shrink-0 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(notif.id)}
                          onChange={() => toggleSelect(notif.id)}
                          className="w-5 h-5 rounded-lg cursor-pointer accent-cyan-500"
                        />
                      </label>

                      {/* Icon */}
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-md ${
                          !notif.isRead 
                            ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white' 
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {!notif.isRead ? '🔔' : '✓'}
                      </motion.div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <p className={`text-base leading-relaxed ${!notif.isRead ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                            {notif.notification?.message}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <span>📅</span>
                            <span>
                              {notif.notification?.createdAt &&
                                new Date(notif.notification.createdAt).toLocaleDateString(
                                  lang === 'ar' ? 'ar-EG' : 'en-US',
                                  {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  }
                                )}
                            </span>
                          </span>
                          {notif.notification?.createdBy && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <span>👤</span>
                                <span>{notif.notification.createdBy}</span>
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex-shrink-0 flex flex-col gap-2">
                        {!notif.isRead && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => markAsRead(notif.id)}
                            className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg text-xs font-semibold shadow-md hover:shadow-lg transition-all"
                          >
                            {lang === 'ar' ? '✓ قراءة' : '✓ Read'}
                          </motion.button>
                        )}
                      </div>
                    </div>

                    {/* Unread indicator */}
                    {!notif.isRead && (
                      <div className="absolute top-5 right-5 w-3 h-3 bg-cyan-500 rounded-full animate-pulse"></div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </>
  )
}
