"use client"
import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Notification {
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

interface NotificationContextType {
  unreadCount: number
  notifications: Notification[]
  refreshNotifications: () => Promise<void>
  markAsRead: (id: number) => Promise<void>
  requestPermission: () => Promise<NotificationPermission>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider')
  }
  return context
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [toasts, setToasts] = useState<Array<{ id: number; message: string }>>([])
  const prevCountRef = useRef(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const [hasPermission, setHasPermission] = useState(false)

  // Load user from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        try {
          setUser(JSON.parse(userStr))
        } catch (e) {
          console.error('Failed to parse user:', e)
        }
      }
    }
  }, [])

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission()
      setHasPermission(permission === 'granted')
      return permission
    }
    return Notification.permission
  }, [])

  // Check notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      setHasPermission(Notification.permission === 'granted')
    }
  }, [])

  // Show browser notification
  const showBrowserNotification = useCallback((message: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification('إشعار جديد 🔔', {
        body: message,
        icon: '/icon.png', // Add your icon path
        badge: '/badge.png',
        tag: 'new-notification',
        requireInteraction: false,
        silent: false
      })

      notification.onclick = () => {
        window.focus()
        window.location.href = '/notifications'
        notification.close()
      }

      // Auto close after 5 seconds
      setTimeout(() => notification.close(), 5000)
    }
  }, [])

  // Show toast notification
  const showToast = useCallback((message: string) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message }])
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 5000)
  }, [])

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!user) return

    try {
      const qp = new URLSearchParams({ 
        userId: String(user.id), 
        accountType: String(user.accountType),
        onlyCount: 'false'
      })
      if (user.email) qp.set('email', user.email)

      const res = await fetch(`/api/notifications?${qp.toString()}`)
      const data = await res.json()

      if (data.notifications) {
        setNotifications(data.notifications)
        
        const newUnreadCount = data.unreadCount || 0
        
        // Check if there are new notifications
        if (newUnreadCount > prevCountRef.current && prevCountRef.current > 0) {
          const newNotifications = data.notifications.filter((n: Notification) => !n.isRead)
          
          // Show notifications for new items
          newNotifications.slice(0, 3).forEach((notif: Notification) => {
            if (notif.notification?.message) {
              showBrowserNotification(notif.notification.message)
              showToast(notif.notification.message)
            }
          })

          // Play sound
          if (typeof Audio !== 'undefined') {
            try {
              const audio = new Audio('/notification.mp3') // Add your sound file
              audio.volume = 0.3
              audio.play().catch(e => console.log('Could not play sound:', e))
            } catch (e) {
              console.log('Audio not available:', e)
            }
          }
        }

        prevCountRef.current = newUnreadCount
        setUnreadCount(newUnreadCount)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }, [user, showBrowserNotification, showToast])

  // Start polling when user is logged in
  useEffect(() => {
    if (!user) return

    // Initial fetch
    fetchNotifications()

    // Poll every 10 seconds (reduced from 30 for faster updates)
    intervalRef.current = setInterval(fetchNotifications, 10000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [user, fetchNotifications])

  // Manual refresh
  const refreshNotifications = useCallback(async () => {
    await fetchNotifications()
  }, [fetchNotifications])

  // Mark as read
  const markAsRead = useCallback(async (userNotificationId: number) => {
    try {
      await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userNotificationId })
      })

      setNotifications(prev =>
        prev.map(n =>
          n.id === userNotificationId ? { ...n, isRead: 1, readAt: new Date().toISOString() } : n
        )
      )
      
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }, [])

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        notifications,
        refreshNotifications,
        markAsRead,
        requestPermission
      }}
    >
      {children}

      {/* Toast Notifications */}
      <div className="fixed top-20 left-4 right-4 md:left-auto md:right-4 md:w-96 z-[9999] pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.8 }}
              className="mb-3 pointer-events-auto"
            >
              <div className="bg-white rounded-2xl shadow-2xl border-2 border-cyan-500 p-4 flex items-start gap-3">
                <motion.div
                  animate={{
                    rotate: [0, -10, 10, -10, 0],
                    transition: { duration: 0.5, repeat: 2 }
                  }}
                  className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-lg shadow-lg"
                >
                  🔔
                </motion.div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 mb-1">إشعار جديد</p>
                  <p className="text-xs text-gray-600 line-clamp-2">{toast.message}</p>
                </div>
                <button
                  onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                  className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  )
}
