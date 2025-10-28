"use client"
import { motion } from 'framer-motion'
import type { UserType } from '@/types/header'

interface MobileNavProps {
  user: UserType | null;
  lang: string;
  unreadCount: number;
  notificationsCount: number;
}

export default function MobileBottomNav({
  user,
  lang,
  unreadCount,
  notificationsCount
}: MobileNavProps) {
  
  function handleLogout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  }

  function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }
  const navItems = [
    {
      id: 'home',
      show: true,
      onClick: () => {
        if (typeof window !== 'undefined') {
          if (window.location.pathname === '/' || window.location.pathname === '/ar' || window.location.pathname === '/en') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            window.location.href = lang === 'ar' ? '/ar' : '/';
          }
        }
      },
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-blue-600">
          <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
          <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
        </svg>
      ),
      label: lang === 'ar' ? 'الرئيسية' : 'Home',
      hoverClass: 'hover:from-blue-50 hover:to-purple-50'
    },
    {
      id: 'dashboard',
      show: user?.accountType === 'company',
      onClick: () => { window.location.href = '/company-dashboard/profile' },
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-yellow-600">
          <path fillRule="evenodd" d="M4.5 2.25a.75.75 0 000 1.5v16.5h-.75a.75.75 0 000 1.5h16.5a.75.75 0 000-1.5h-.75V3.75a.75.75 0 000-1.5h-15zM9 6a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5H9zm-.75 3.75A.75.75 0 019 9h1.5a.75.75 0 010 1.5H9a.75.75 0 01-.75-.75zM9 12a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5H9zm3.75-5.25A.75.75 0 0113.5 6H15a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75zM13.5 9a.75.75 0 000 1.5H15A.75.75 0 0015 9h-1.5zm-.75 3.75a.75.75 0 01.75-.75H15a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75zM9 19.5v-2.25a.75.75 0 01.75-.75h4.5a.75.75 0 01.75.75v2.25a.75.75 0 01-.75.75h-4.5A.75.75 0 019 19.5z" clipRule="evenodd" />
        </svg>
      ),
      label: lang === 'ar' ? 'لوحتي' : 'Dashboard',
      hoverClass: 'hover:from-yellow-50 hover:to-orange-50'
    },
    {
      id: 'messages',
      show: !!user,
      onClick: () => { window.location.href = '/messages' },
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-cyan-600">
          <path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 00-1.032-.211 50.89 50.89 0 00-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 002.433 3.984L7.28 21.53A.75.75 0 016 21v-4.03a48.527 48.527 0 01-1.087-.128C2.905 16.58 1.5 14.833 1.5 12.862V6.638c0-1.97 1.405-3.718 3.413-3.979z" />
          <path d="M15.75 7.5c-1.376 0-2.739.057-4.086.169C10.124 7.797 9 9.103 9 10.609v4.285c0 1.507 1.128 2.814 2.67 2.94 1.243.102 2.5.157 3.768.165l2.782 2.781a.75.75 0 001.28-.53v-2.39l.33-.026c1.542-.125 2.67-1.433 2.67-2.94v-4.286c0-1.505-1.125-2.811-2.664-2.94A49.392 49.392 0 0015.75 7.5z" />
        </svg>
      ),
      label: lang === 'ar' ? 'الرسائل' : 'Messages',
      badge: unreadCount,
      hoverClass: 'hover:from-cyan-50 hover:to-blue-50'
    },
    {
      id: 'notifications',
      show: !!user,
      onClick: () => {
        requestNotificationPermission();
        window.location.href = '/notifications';
      },
      icon: (
        <motion.svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          className="w-6 h-6 text-yellow-600" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
          animate={notificationsCount > 0 ? {
            rotate: [0, -10, 10, -10, 0],
            transition: { duration: 0.5, repeat: Infinity, repeatDelay: 3 }
          } : {}}
        >
          <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11c0-3.07-1.64-5.64-5-5.64S8 7.93 8 11v3.159c0 .538-.214 1.055-.595 1.436L6 17h5m4 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </motion.svg>
      ),
      label: lang === 'ar' ? 'إشعارات' : 'Alerts',
      badge: notificationsCount,
      animatedBadge: true,
      hoverClass: 'hover:from-yellow-50 hover:to-orange-50'
    },
    {
      id: 'profile',
      show: !!user,
      onClick: () => { window.location.href = '/profile' },
      icon: user?.image ? (
        <img src={user.image} alt={user.username} className="w-6 h-6 rounded-full object-cover border-2 border-purple-300" />
      ) : (
        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-lg">
          {user?.username.charAt(0).toUpperCase()}
        </div>
      ),
      label: lang === 'ar' ? 'حسابي' : 'Profile',
      hoverClass: 'hover:from-purple-50 hover:to-indigo-50'
    },
    {
      id: 'login',
      show: !user,
      onClick: () => { window.location.href = '/login' },
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-purple-600">
          <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
        </svg>
      ),
      label: lang === 'ar' ? 'دخول' : 'Login',
      hoverClass: 'hover:from-purple-50 hover:to-indigo-50'
    },
    {
      id: 'logout',
      show: !!user,
      onClick: handleLogout,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-red-600">
          <path fillRule="evenodd" d="M7.5 3.75A1.5 1.5 0 006 5.25v13.5a1.5 1.5 0 001.5 1.5h6a1.5 1.5 0 001.5-1.5V15a.75.75 0 011.5 0v3.75a3 3 0 01-3 3h-6a3 3 0 01-3-3V5.25a3 3 0 013-3h6a3 3 0 013 3V9A.75.75 0 0115 9V5.25a1.5 1.5 0 00-1.5-1.5h-6zm10.72 4.72a.75.75 0 011.06 0l3 3a.75.75 0 010 1.06l-3 3a.75.75 0 11-1.06-1.06l1.72-1.72H9a.75.75 0 010-1.5h10.94l-1.72-1.72a.75.75 0 010-1.06z" clipRule="evenodd" />
        </svg>
      ),
      label: lang === 'ar' ? 'خروج' : 'Logout',
      hoverClass: 'hover:from-red-50 hover:to-pink-50'
    },
    {
      id: 'signup',
      show: !user,
      onClick: () => { window.location.href = '/signup' },
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-emerald-600">
          <path d="M6.25 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM3.25 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM19.75 7.5a.75.75 0 00-1.5 0v2.25H16a.75.75 0 000 1.5h2.25v2.25a.75.75 0 001.5 0v-2.25H22a.75.75 0 000-1.5h-2.25V7.5z" />
        </svg>
      ),
      label: lang === 'ar' ? 'تسجيل' : 'Signup',
      hoverClass: 'hover:from-emerald-50 hover:to-teal-50'
    }
  ].filter(item => item.show);

  const gridCols = navItems.length === 6 ? 'grid-cols-6' : 
                   navItems.length === 5 ? 'grid-cols-5' : 
                   navItems.length === 4 ? 'grid-cols-4' : 'grid-cols-3';

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-gray-200 shadow-2xl pb-safe">
      <div className={`grid ${gridCols} gap-1 px-1 py-2`}>
        {navItems.map((item) => (
          <motion.button
            key={item.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={item.onClick}
            className={`flex flex-col items-center justify-center gap-0.5 py-2 rounded-xl hover:bg-gradient-to-r ${item.hoverClass} transition-all min-h-[56px] relative`}
          >
            {item.icon}
            {item.badge && item.badge > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={item.animatedBadge ? { 
                  scale: [1, 1.2, 1], 
                  transition: { duration: 0.5, repeat: Infinity, repeatDelay: 2 } 
                } : { scale: 1 }}
                className="absolute top-1 right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[9px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-0.5 shadow-lg"
              >
                {item.badge > 9 ? '9+' : item.badge}
              </motion.span>
            )}
            <span className="text-[9px] font-semibold text-gray-700">{item.label}</span>
          </motion.button>
        ))}
      </div>
    </nav>
  );
}
