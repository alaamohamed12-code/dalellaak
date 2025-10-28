"use client"
import { useEffect, useState, useRef } from 'react'
import UserMenu from './UserMenu'
import MobileBottomNav from './MobileBottomNav'
import { useLang } from './Providers'
import { motion } from 'framer-motion'
import { useNotifications } from '@/contexts/NotificationContext'
import { fetchAllConversationsWithDetails } from '@/lib/conversations-api'
import type { UserType, HeaderProps, Conversation } from '@/types/header'


export default function Header({ navOnlyHome }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false)
  const { lang, setLang, t } = useLang()
  const { unreadCount: notificationsCount, requestPermission } = useNotifications()
  const [user, setUser] = useState<UserType | null>(null)
  const [showMessages, setShowMessages] = useState(false)
  const [convLoading, setConvLoading] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement | null>(null)
  
  // Calculate total unread messages count (including support tickets)
  const unreadCount = conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0)
  
  // Calculate unread counts separately
  const regularUnreadCount = conversations.filter(c => c.type !== 'support').reduce((sum, conv) => sum + (conv.unreadCount || 0), 0)
  const supportUnreadCount = conversations.filter(c => c.type === 'support').reduce((sum, conv) => sum + (conv.unreadCount || 0), 0)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const u = localStorage.getItem('user')
      if (u) setUser(JSON.parse(u))
    }
  }, [])

  function handleLogout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user')
      setUser(null)
      window.location.href = '/login'
    }
  }

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20)
    }
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Fetch conversations when dropdown opens
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    
    async function loadConversations() {
      if (!user) return;
      
      setConvLoading(true);
      setLoadError(null);
      
      const { conversations: fetchedConversations, error } = await fetchAllConversationsWithDetails({
        userId: user.accountType === 'user' ? user.id : undefined,
        companyId: user.accountType === 'company' ? user.id : undefined,
        accountType: user.accountType,
        lang
      });

      if (error) {
        setLoadError(error);
      } else {
        setConversations(fetchedConversations);
      }
      
      setConvLoading(false);
    }
    
    if (showMessages) {
      loadConversations();
      // Poll every 30 seconds while dropdown is open
      timer = setInterval(loadConversations, 30000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [showMessages, user, lang]);

  // Load conversations count periodically when user is present
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    
    async function loadConversationsCount() {
      if (!user) return;
      
      const { conversations: fetchedConversations } = await fetchAllConversationsWithDetails({
        userId: user.accountType === 'user' ? user.id : undefined,
        companyId: user.accountType === 'company' ? user.id : undefined,
        accountType: user.accountType,
        lang
      });

      setConversations(fetchedConversations);
    }
    
    if (user) {
      loadConversationsCount();
      // Poll every 60 seconds for new conversations
      timer = setInterval(loadConversationsCount, 60000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [user, lang]);

  // Request notification permission when user logs in
  useEffect(() => {
    if (user) {
      requestPermission()
    }
  }, [user, requestPermission])

  // Close on outside click
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!showMessages) return
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowMessages(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [showMessages])

  // Show full navigation only on home page (when navOnlyHome is false or undefined)
  // On other pages (when navOnlyHome is true), show only home link
  const showFullNav = !navOnlyHome
  
  const nav = showFullNav
    ? [
        { id: 'home', label: t('nav.home') },
        { id: 'services', label: t('nav.services') },
        { id: 'faq', label: t('nav.partners') },
        { id: 'contact', label: t('nav.contact') }
      ]
    : [
        { id: 'home', label: t('nav.home') }
      ]

  function scrollToId(id: string) {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <motion.header
      initial={{ y: -18, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-xl shadow-lg border-b border-gray-200/50' 
          : 'bg-white/80 backdrop-blur-md shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (typeof window !== 'undefined') {
                  if (window.location.pathname === '/' || window.location.pathname === '/ar' || window.location.pathname === '/en') {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  } else {
                    window.location.href = '/';
                  }
                }
              }}
              aria-label="Go to home page"
              className="flex items-center cursor-pointer group"
            >
              <img 
                src="/logo.png" 
                alt="Logo" 
                className="h-12 sm:h-14 w-auto object-contain transition-all group-hover:scale-105"
              />
            </motion.button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex gap-1">
              {nav.map((n) => (
                <motion.button
                  key={n.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (n.id === 'home') {
                      if (typeof window !== 'undefined') {
                        if (window.location.pathname === '/' || window.location.pathname === '/ar' || window.location.pathname === '/en') {
                          const hero = document.getElementById('hero');
                          if (hero) {
                            hero.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          } else {
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }
                        } else {
                          window.location.href = '/';
                        }
                      }
                    } else {
                      scrollToId(n.id);
                    }
                  }}
                  className="relative px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 hover:text-gray-900 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all group"
                >
                  {n.label}
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-3/4 transition-all duration-300 rounded-full"></span>
                </motion.button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Notifications Icon */}
            {user && (
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <button
                  className="relative p-2.5 rounded-xl hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 focus:outline-none transition-all group"
                  aria-label="Notifications"
                  onClick={() => window.location.href = '/notifications'}
                >
                  <motion.svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    className="w-6 h-6 text-yellow-600 group-hover:text-yellow-700 transition-colors" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                    animate={notificationsCount > 0 ? {
                      rotate: [0, -10, 10, -10, 0],
                      transition: { 
                        duration: 0.5, 
                        repeat: Infinity, 
                        repeatDelay: 3 
                      }
                    } : {}}
                  >
                    <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11c0-3.07-1.64-5.64-5-5.64S8 7.93 8 11v3.159c0 .538-.214 1.055-.595 1.436L6 17h5m4 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </motion.svg>
                  {notificationsCount > 0 && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ 
                        scale: [1, 1.2, 1],
                        transition: { 
                          duration: 0.5, 
                          repeat: Infinity, 
                          repeatDelay: 2 
                        }
                      }}
                      className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-lg animate-pulse"
                    >
                      {notificationsCount > 99 ? '99+' : notificationsCount}
                    </motion.span>
                  )}
                </button>
              </motion.div>
            )}

            {user ? (
              <div className="flex items-center gap-2">
                {user.accountType === 'company' && (
                  <>
                    <motion.span 
                      whileHover={{ scale: 1.02 }}
                      title={t('company.menu.company')} 
                      className="hidden sm:inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 rounded-full text-xs font-bold shadow-sm"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21V7a2 2 0 012-2h2a2 2 0 012 2v14M7 21h10M17 21V7a2 2 0 012-2h2a2 2 0 012 2v14" /></svg>
                      {t('company.menu.company')}
                    </motion.span>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl text-xs font-bold shadow-lg hover:shadow-xl transition-all"
                      onClick={() => window.location.href = `/company-dashboard/profile`}
                    >
                      {t('company.dashboard')}
                    </motion.button>
                  </>
                )}
                <UserMenu user={user} onLogout={handleLogout} />
              </div>
            ) : null}

            {/* Messages Dropdown - Messenger-like interface */}
            {user && (
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="relative" 
                ref={dropdownRef}
              >
                <button
                  className="relative p-2.5 rounded-xl hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 focus:outline-none transition-all group"
                  aria-label="Messages"
                  onClick={() => setShowMessages(v => !v)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6 text-cyan-700 group-hover:text-cyan-800 transition-colors" fill="currentColor" aria-hidden="true">
                    <path d="M4 4h16a2 2 0 012 2v9a2 2 0 01-2 2H9l-5 4v-4H4a2 2 0 01-2-2V6a2 2 0 012-2z" />
                    <circle cx="9" cy="10.5" r="1.25" fill="white" />
                    <circle cx="12" cy="10.5" r="1.25" fill="white" />
                    <circle cx="15" cy="10.5" r="1.25" fill="white" />
                  </svg>
                  {unreadCount > 0 && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-lg"
                    >
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </motion.span>
                  )}
                </button>

                {/* Dropdown Panel */}
                {showMessages && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className="absolute end-0 mt-2 w-[calc(100vw-2rem)] sm:w-96 max-w-md max-h-[70vh] overflow-hidden rounded-2xl shadow-2xl bg-white border border-gray-200 z-50"
                  >
                    <div className="px-2.5 sm:px-4 py-2.5 sm:py-3 border-b bg-gradient-to-r from-cyan-50 to-blue-50">
                      <div className="flex items-center gap-1.5 sm:gap-3">
                        <div className="w-[clamp(2.1rem,7vw,2.5rem)] h-[clamp(2.1rem,7vw,2.5rem)] sm:w-10 sm:h-10 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-700 font-bold text-[clamp(1rem,3vw,1.15rem)] sm:text-lg flex-shrink-0">
                          {(user?.username || '?').slice(0,1).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-[clamp(0.9rem,2.7vw,1rem)] sm:text-base text-cyan-800 truncate">{user?.username}</div>
                          <div className="text-[clamp(9px,2vw,11px)] sm:text-xs text-gray-600 flex items-center gap-1 sm:gap-2 flex-wrap">
                            <span>{user?.accountType === 'company' ? (lang === 'ar' ? 'شركة' : 'Company') : (lang === 'ar' ? 'فرد' : 'Individual')}</span>
                            {conversations.length > 0 && (
                              <span className="px-1 py-0.5 sm:px-2 bg-cyan-600 text-white rounded-full text-[clamp(8px,1.7vw,10px)] sm:text-[10px]">
                                {conversations.length} {lang === 'ar' ? 'محادثة' : 'conversations'}
                              </span>
                            )}
                            {unreadCount > 0 && (
                              <span className="px-1 py-0.5 sm:px-2 bg-red-500 text-white rounded-full text-[clamp(8px,1.7vw,10px)] sm:text-[10px]">
                                {unreadCount} {lang === 'ar' ? 'جديد' : 'unread'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="max-h-[45vh] sm:max-h-[48vh] overflow-y-auto divide-y">
                      {convLoading ? (
                        <div className="p-4 text-gray-500 text-xs sm:text-sm flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
                          {lang === 'ar' ? 'جارِ التحميل...' : 'Loading...'}
                        </div>
                      ) : loadError ? (
                        <div className="p-5 sm:p-6 text-red-500 text-xs sm:text-sm text-center">
                          <div className="text-3xl sm:text-4xl mb-2">⚠️</div>
                          <div className="font-semibold text-sm sm:text-base">{lang === 'ar' ? 'حدث خطأ' : 'Error occurred'}</div>
                          <div className="text-[10px] sm:text-xs mt-1 px-2">{loadError}</div>
                        </div>
                      ) : conversations.length === 0 ? (
                        <div className="p-5 sm:p-6 text-gray-500 text-xs sm:text-sm text-center">
                          <div className="text-3xl sm:text-4xl mb-2">💬</div>
                          <div className="font-semibold text-sm sm:text-base">{lang === 'ar' ? 'لا توجد محادثات بعد' : 'No conversations yet'}</div>
                          <div className="text-[10px] sm:text-xs mt-1 px-2">{lang === 'ar' ? 'ابدأ محادثة مع شركة من صفحتها' : 'Start a conversation with a company from their page'}</div>
                        </div>
                      ) : (
                        conversations.map((c: any) => (
                          <button
                            key={c.id}
                            className={`w-full text-start p-2 sm:p-2.5 hover:bg-gray-50 transition-colors relative flex items-center gap-1.5 sm:gap-3 min-h-[clamp(44px,8vw,56px)] sm:min-h-[60px] ${
                              c.unreadCount > 0 ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                            } ${c.type === 'support' ? 'bg-purple-50/50 border-l-4 border-purple-400' : ''}`}
                            onClick={() => { 
                              setShowMessages(false);
                              if (c.type === 'support') {
                                window.location.href = `/support`;
                              } else {
                                window.location.href = `/messages`;
                              }
                            }}
                          >
                              <div className="relative flex-shrink-0">
                                {c.otherParty?.image ? (
                                  <img 
                                    src={c.otherParty.image} 
                                    alt={`${c.otherParty.firstName} ${c.otherParty.lastName}`}
                                    className="w-[clamp(2rem,7vw,2.3rem)] h-[clamp(2rem,7vw,2.3rem)] sm:w-10 sm:h-10 rounded-full object-cover border-2 border-gray-200"
                                  />
                                ) : (
                                  <div className={`w-[clamp(2rem,7vw,2.3rem)] h-[clamp(2rem,7vw,2.3rem)] sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-[clamp(1rem,3vw,1.1rem)] sm:text-lg border-2 border-gray-200 ${
                                    c.type === 'support'
                                      ? 'bg-gradient-to-br from-purple-100 to-pink-100 text-purple-700'
                                      : c.unreadCount > 0 
                                      ? 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700' 
                                      : 'bg-gradient-to-br from-cyan-100 to-blue-100 text-cyan-700'
                                  }`}>
                                    {c.type === 'support' ? '🛠️' : c.otherParty ? 
                                      (c.otherParty.firstName?.charAt(0) || c.otherParty.username?.charAt(0) || '?').toUpperCase() 
                                      : '#'
                                    }
                                  </div>
                                )}
                                {c.otherParty?.type && c.type !== 'support' && (
                                  <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] ${
                                    c.otherParty.type === 'company' ? 'bg-yellow-500' : 'bg-green-500'
                                  }`}>
                                    {c.otherParty.type === 'company' ? '🏢' : '👤'}
                                  </div>
                                )}
                              </div>
                              
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-1 sm:gap-2 mb-0.5 sm:mb-1">
                                  <div className={`font-semibold text-[clamp(12px,2.7vw,14px)] sm:text-sm truncate ${
                                    c.unreadCount > 0 ? 'text-blue-800' : c.type === 'support' ? 'text-purple-800' : 'text-cyan-800'
                                  }`}>
                                    {c.type === 'support' ? (
                                      <span className="flex items-center gap-1">
                                        🛠️ {c.otherParty.firstName} {c.otherParty.lastName}
                                      </span>
                                    ) : c.otherParty ? 
                                      `${c.otherParty.firstName || ''} ${c.otherParty.lastName || ''}`.trim() || c.otherParty.username
                                      : (lang === 'ar' ? 'محادثة' : 'Conversation') + ` #${c.id}`
                                    }
                                  </div>
                                  <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
                                    {c.unreadCount > 0 && (
                                      <span className="bg-red-500 text-white text-[clamp(8px,1.7vw,10px)] sm:text-[10px] font-bold rounded-full min-w-[13px] sm:min-w-[16px] h-[13px] sm:h-[16px] flex items-center justify-center px-1">
                                        {c.unreadCount}
                                      </span>
                                    )}
                                    {c.status && c.type === 'support' && (
                                      <span className={`text-[clamp(8px,1.7vw,10px)] sm:text-[10px] px-1.5 py-0.5 rounded-full ${
                                        c.status === 'open' ? 'bg-yellow-100 text-yellow-700' :
                                        c.status === 'answered' ? 'bg-green-100 text-green-700' :
                                        'bg-gray-100 text-gray-700'
                                      }`}>
                                        {c.status === 'open' ? '🟡' : c.status === 'answered' ? '🟢' : '⚫'}
                                      </span>
                                    )}
                                    {c.lastAt && (
                                      <div className="text-[clamp(8px,1.7vw,10px)] sm:text-[10px] text-gray-400 whitespace-nowrap">
                                        {new Date(c.lastAt).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { 
                                          month: 'short', 
                                          day: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                <div className={`text-[clamp(10px,2vw,12px)] sm:text-sm truncate ${
                                  c.unreadCount > 0 ? 'text-gray-800 font-medium' : 'text-gray-600'
                                }`}>
                                  {c.type === 'support' && c.subject ? c.subject : c.lastBody || (lang === 'ar' ? 'بدون رسائل' : 'No messages')}
                                </div>
                                
                                {c.otherParty && c.type !== 'support' && (
                                  <div className="text-[clamp(8px,1.7vw,10px)] sm:text-[10px] text-gray-400 mt-0.5 truncate">
                                    @{c.otherParty.username} • {c.otherParty.type === 'company' ? 
                                      (lang === 'ar' ? 'شركة' : 'Company') : 
                                      (lang === 'ar' ? 'فرد' : 'Individual')
                                    }
                                  </div>
                                )}
                              </div>
                          </button>
                        ))
                      )}
                    </div>

                    <div className="p-2.5 sm:p-3 border-t bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-2">
                      <div className="text-[10px] sm:text-xs text-gray-500 text-center sm:text-start">
                        {lang === 'ar' ? 'عرض جميع المحادثات' : 'View all conversations'}
                      </div>
                      <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2">
                        <button 
                          className="w-full sm:w-auto px-4 py-2 sm:py-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-bold transition-colors flex items-center justify-center gap-1 min-h-[44px] sm:min-h-0 relative" 
                          onClick={() => { 
                            setShowMessages(false);
                            window.location.href = '/support';
                          }}
                        >
                          🛠️
                          {lang === 'ar' ? 'التذاكر الفنية' : 'Support Tickets'}
                          {supportUnreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-lg">
                              {supportUnreadCount > 99 ? '99+' : supportUnreadCount}
                            </span>
                          )}
                        </button>
                        <button 
                          className="w-full sm:w-auto px-4 py-2 sm:py-2 rounded-full bg-cyan-600 hover:bg-cyan-700 text-white text-xs sm:text-sm font-bold transition-colors flex items-center justify-center gap-1 min-h-[44px] sm:min-h-0 relative" 
                          onClick={() => { 
                            setShowMessages(false);
                            window.location.href = '/messages'; 
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 sm:w-4 sm:h-4">
                            <path fillRule="evenodd" d="M2 10a8 8 0 1116 0 8 8 0 01-16 0zm6.39-2.908a.75.75 0 01.766.027l3.5 2.25a.75.75 0 010 1.262l-3.5 2.25A.75.75 0 018 12.25v-4.5a.75.75 0 01.39-.658z" clipRule="evenodd" />
                          </svg>
                          {lang === 'ar' ? 'كل المحادثات' : 'All Messages'}
                          {regularUnreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-lg">
                              {regularUnreadCount > 99 ? '99+' : regularUnreadCount}
                            </span>
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Rightmost action icons */}
            {!user ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2.5 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 focus:outline-none transition-all group"
                aria-label={t('nav.login')}
                title={t('nav.login')}
                onClick={() => { window.location.href = '/login' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-blue-600 group-hover:text-blue-700">
                  <path d="M12 2a5 5 0 100 10 5 5 0 000-10zM4 20a8 8 0 1116 0H4z" />
                </svg>
              </motion.button>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2.5 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 focus:outline-none transition-all group"
                  aria-label={t('settings')}
                  title={t('settings')}
                  onClick={() => { window.location.href = '/profile' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-blue-600 group-hover:text-blue-700">
                    <path d="M11.983 8.25a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5z" />
                    <path fillRule="evenodd" d="M4.5 12a7.5 7.5 0 0112.51-5.77l.86-.5a1.125 1.125 0 011.53.41l1.125 1.948a1.125 1.125 0 01-.41 1.53l-.86.5c.08.41.12.84.12 1.28s-.04.87-.12 1.28l.86.5c.54.31.72 1 .41 1.53l-1.125 1.948a1.125 1.125 0 01-1.53.41l-.86-.5A7.5 7.5 0 114.5 12zm7.483-5.25a5.25 5.25 0 100 10.5 5.25 5.25 0 000-10.5z" clipRule="evenodd" />
                  </svg>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2.5 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 focus:outline-none transition-all group"
                  aria-label={t('logout')}
                  title={t('logout')}
                  onClick={handleLogout}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-red-600 group-hover:text-red-700">
                    <path d="M10.5 3.75A2.25 2.25 0 008.25 6v12A2.25 2.25 0 0010.5 20.25h3a2.25 2.25 0 002.25-2.25V15a.75.75 0 011.5 0v3a3.75 3.75 0 01-3.75 3.75h-3A3.75 3.75 0 016.75 18V6A3.75 3.75 0 0110.5 2.25h3A3.75 3.75 0 0117.25 6v3a.75.75 0 01-1.5 0V6A2.25 2.25 0 0013.5 3.75h-3z" />
                    <path d="M12.53 8.47a.75.75 0 10-1.06 1.06L12.94 11H6.75a.75.75 0 000 1.5h6.19l-1.47 1.47a.75.75 0 101.06 1.06l3-3a.75.75 0 000-1.06l-3-3z" />
                  </svg>
                </motion.button>
              </div>
            )}

            {/* Language switcher - Modern pill design */}
            <div className="flex items-center gap-1 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-1 shadow-sm border border-gray-200">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setLang('ar')}
                className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                  lang === 'ar' 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                AR
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setLang('en')}
                className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                  lang === 'en' 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                EN
              </motion.button>
            </div>
          </div>

        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        user={user}
        lang={lang}
        unreadCount={unreadCount}
        notificationsCount={notificationsCount}
      />
    </motion.header>
  )
}
