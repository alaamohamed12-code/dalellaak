"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  const [admin, setAdmin] = useState<any>(null);
  const router = useRouter();
  const { hasPermission, canAccessPage, isSuperAdmin } = useAdminPermissions();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const a = localStorage.getItem("admin");
      if (!a) {
        router.replace("/admin-panel/login");
      } else {
        setAdmin(JSON.parse(a));
      }
    }
  }, [router]);

  const [userCount, setUserCount] = useState<number | null>(null);
  const [companyCount, setCompanyCount] = useState<number | null>(null);
  const [pendingCount, setPendingCount] = useState<number | null>(null);
  const [servicesCount, setServicesCount] = useState<number | null>(null);
  const [pendingContracts, setPendingContracts] = useState<number>(0);
  const [newSupportTickets, setNewSupportTickets] = useState<number>(0);

  useEffect(() => {
    fetch('/admin-panel/api/users')
      .then(res => res.json())
      .then(data => setUserCount(Array.isArray(data.users) ? data.users.length : 0))
      .catch(() => setUserCount(0));
    
    fetch('/admin-panel/api/companies')
      .then(res => res.json())
      .then(data => {
        const companies = data.companies || [];
        setCompanyCount(companies.length);
        setPendingCount(companies.filter((c: any) => c.status === 'pending').length);
      })
      .catch(() => {
        setCompanyCount(0);
        setPendingCount(0);
      });

    // Load active services and count
    fetch('/api/services')
      .then(res => res.json())
      .then(data => setServicesCount(Array.isArray(data) ? data.length : 0))
      .catch(() => setServicesCount(0));

    // Pending contract events count (from HEAD header)
    fetch('/api/admin/contracts', { method: 'HEAD' as any })
      .then(res => Number(res.headers.get('x-pending-count') || '0'))
      .then(c => setPendingContracts(isNaN(c) ? 0 : c))
      .catch(() => setPendingContracts(0));

    // New support tickets count (open status)
    fetch('/api/support?admin=true&status=open')
      .then(res => res.json())
      .then(data => setNewSupportTickets(Array.isArray(data.tickets) ? data.tickets.length : 0))
      .catch(() => setNewSupportTickets(0));
  }, []);

  if (!admin) return null;

  const getRoleNameAr = (role: string) => {
    const roles: Record<string, string> = {
      super_admin: 'مسؤول رئيسي',
      admin: 'مسؤول',
      moderator: 'مشرف'
    };
    return roles[role] || role;
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      super_admin: 'from-purple-500 to-pink-500',
      admin: 'from-blue-500 to-cyan-500',
      moderator: 'from-green-500 to-teal-500'
    };
    return colors[role] || 'from-gray-500 to-gray-600';
  };

  // بيانات الإحصائيات
  const stats = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
          <path fillRule="evenodd" d="M4.5 2.25a.75.75 0 000 1.5v16.5h-.75a.75.75 0 000 1.5h16.5a.75.75 0 000-1.5h-.75V3.75a.75.75 0 000-1.5h-15zM9 6a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5H9zm-.75 3.75A.75.75 0 019 9h1.5a.75.75 0 010 1.5H9a.75.75 0 01-.75-.75zM9 12a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5H9zm3.75-5.25A.75.75 0 0113.5 6H15a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75zM13.5 9a.75.75 0 000 1.5H15A.75.75 0 0015 9h-1.5zm-.75 3.75a.75.75 0 01.75-.75H15a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75zM9 19.5v-2.25a.75.75 0 01.75-.75h4.5a.75.75 0 01.75.75v2.25a.75.75 0 01-.75.75h-4.5A.75.75 0 019 19.5z" clipRule="evenodd" />
        </svg>
      ),
      title: 'الشركات',
      value: companyCount === null ? '--' : companyCount,
      subtitle: pendingCount ? `${pendingCount} قيد المراجعة` : null,
      color: 'from-cyan-500 to-blue-600',
      bgColor: 'from-cyan-50 to-blue-50'
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
          <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
        </svg>
      ),
      title: 'المستخدمين',
      value: userCount === null ? '--' : userCount,
      color: 'from-purple-500 to-pink-600',
      bgColor: 'from-purple-50 to-pink-50'
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
          <path d="M11.644 1.59a.75.75 0 01.712 0l9.75 5.25a.75.75 0 010 1.32l-9.75 5.25a.75.75 0 01-.712 0l-9.75-5.25a.75.75 0 010-1.32l9.75-5.25z" />
          <path d="M3.265 10.602l7.668 4.129a2.25 2.25 0 002.134 0l7.668-4.13 1.37.739a.75.75 0 010 1.32l-9.75 5.25a.75.75 0 01-.71 0l-9.75-5.25a.75.75 0 010-1.32l1.37-.738z" />
          <path d="M10.933 19.231l-7.668-4.13-1.37.739a.75.75 0 000 1.32l9.75 5.25c.221.12.489.12.71 0l9.75-5.25a.75.75 0 000-1.32l-1.37-.738-7.668 4.13a2.25 2.25 0 01-2.134-.001z" />
        </svg>
      ),
      title: 'الخدمات',
      value: servicesCount === null ? '--' : servicesCount,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'from-green-50 to-emerald-50'
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
          <path fillRule="evenodd" d="M2.25 6a3 3 0 013-3h13.5a3 3 0 013 3v12a3 3 0 01-3 3H5.25a3 3 0 01-3-3V6zm3.97.97a.75.75 0 011.06 0l2.25 2.25a.75.75 0 010 1.06l-2.25 2.25a.75.75 0 01-1.06-1.06l1.72-1.72-1.72-1.72a.75.75 0 010-1.06zm4.28 4.28a.75.75 0 000 1.5h5.25a.75.75 0 000-1.5H10.5z" clipRule="evenodd" />
        </svg>
      ),
      title: 'العقود',
      value: pendingContracts,
      subtitle: pendingContracts > 0 ? 'قيد الانتظار' : null,
      color: 'from-orange-500 to-red-600',
      bgColor: 'from-orange-50 to-red-50'
    }
  ];

  // قائمة الأزرار السريعة
  const quickActions = [
    {
      icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M4.5 2.25a.75.75 0 000 1.5v16.5h-.75a.75.75 0 000 1.5h16.5a.75.75 0 000-1.5h-.75V3.75a.75.75 0 000-1.5h-15z" clipRule="evenodd" /></svg>,
      label: 'إدارة الشركات',
      href: '/admin-panel/companies',
      color: 'from-cyan-500 to-blue-600',
      show: canAccessPage('companies'),
      badge: pendingCount
    },
    {
      icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M5.25 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM2.25 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122z" /></svg>,
      label: 'إدارة المستخدمين',
      href: '/admin-panel/users',
      color: 'from-purple-500 to-pink-600',
      show: canAccessPage('users')
    },
    {
      icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M11.644 1.59a.75.75 0 01.712 0l9.75 5.25a.75.75 0 010 1.32l-9.75 5.25a.75.75 0 01-.712 0l-9.75-5.25a.75.75 0 010-1.32l9.75-5.25z" /></svg>,
      label: 'إدارة الخدمات',
      href: '/admin/services',
      color: 'from-green-500 to-emerald-600',
      show: canAccessPage('services')
    },
    {
      icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>,
      label: 'إدارة التقييمات',
      href: '/admin-panel/reviews',
      color: 'from-yellow-500 to-orange-600',
      show: canAccessPage('reviews')
    },
    {
      icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" /><path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" /></svg>,
      label: 'مراجعة الرسائل',
      href: '/admin-panel/messages',
      color: 'from-blue-500 to-indigo-600',
      show: canAccessPage('messages')
    },
    {
      icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11c0-3.07-1.64-5.64-5-5.64S8 7.93 8 11v3.159c0 .538-.214 1.055-.595 1.436L6 17h5m4 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
      label: 'إرسال إشعارات',
      href: '/admin-panel/notifications',
      color: 'from-yellow-500 to-amber-600',
      show: canAccessPage('notifications')
    },
    {
      icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M2.25 6a3 3 0 013-3h13.5a3 3 0 013 3v12a3 3 0 01-3 3H5.25a3 3 0 01-3-3V6z" clipRule="evenodd" /></svg>,
      label: 'حالات التعاقد',
      href: '/admin-panel/contracts',
      color: 'from-teal-500 to-cyan-600',
      show: canAccessPage('contracts'),
      badge: pendingContracts
    },
    {
      icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>,
      label: 'الدعم الفني',
      href: '/admin-panel/support',
      color: 'from-purple-500 to-violet-600',
      show: canAccessPage('support'),
      badge: newSupportTickets
    },
    {
      icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" clipRule="evenodd" /><path fillRule="evenodd" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" clipRule="evenodd" /></svg>,
      label: 'إدارة المدن',
      href: '/admin-panel/cities',
      color: 'from-blue-500 to-sky-600',
      show: canAccessPage('cities')
    },
    {
      icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" clipRule="evenodd" /></svg>,
      label: 'إدارة المجالات',
      href: '/admin-panel/sectors',
      color: 'from-emerald-500 to-green-600',
      show: canAccessPage('sectors')
    },
    {
      icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" /><path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" /></svg>,
      label: 'محتوى الصفحة الرئيسية',
      href: '/admin-panel/home-content',
      color: 'from-indigo-500 to-purple-600',
      show: canAccessPage('homeContent')
    },
    {
      icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" clipRule="evenodd" /></svg>,
      label: 'الأسئلة الشائعة',
      href: '/admin-panel/faq',
      color: 'from-pink-500 to-rose-600',
      show: canAccessPage('faq')
    },
    {
      icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" clipRule="evenodd" /></svg>,
      label: 'الشروط والأحكام',
      href: '/admin-panel/terms',
      color: 'from-orange-500 to-amber-600',
      show: canAccessPage('terms')
    },
    {
      icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
      label: 'إدارة العضويات',
      href: '/admin-panel/memberships',
      color: 'from-violet-500 to-purple-600',
      show: canAccessPage('memberships')
    },
    {
      icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
      label: 'إدارة المسؤولين',
      href: '/admin-panel/settings/admins',
      color: 'from-gray-700 to-gray-900',
      show: canAccessPage('admins')
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-b border-gray-200 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              {/* Avatar */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br ${getRoleBadgeColor(admin?.role)} shadow-lg flex items-center justify-center flex-shrink-0`}
              >
                <span className="text-2xl sm:text-3xl font-bold text-white">
                  {admin?.username?.charAt(0).toUpperCase() || 'A'}
                </span>
              </motion.div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
                  مرحباً، {admin?.firstName || admin?.username}! 👋
                </h1>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${getRoleBadgeColor(admin?.role)} shadow-md`}>
                    {getRoleNameAr(admin?.role)}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                    {admin?.email}
                  </span>
                  {isSuperAdmin && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-md animate-pulse">
                      ⭐ صلاحيات كاملة
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                localStorage.removeItem("admin");
                router.replace("/admin-panel/login");
              }}
              className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M7.5 3.75A1.5 1.5 0 006 5.25v13.5a1.5 1.5 0 001.5 1.5h6a1.5 1.5 0 001.5-1.5V15a.75.75 0 011.5 0v3.75a3 3 0 01-3 3h-6a3 3 0 01-3-3V5.25a3 3 0 013-3h6a3 3 0 013 3V9A.75.75 0 0115 9V5.25a1.5 1.5 0 00-1.5-1.5h-6zm10.72 4.72a.75.75 0 011.06 0l3 3a.75.75 0 010 1.06l-3 3a.75.75 0 11-1.06-1.06l1.72-1.72H9a.75.75 0 010-1.5h10.94l-1.72-1.72a.75.75 0 010-1.06z" clipRule="evenodd" />
              </svg>
              تسجيل الخروج
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.03, y: -5 }}
              className="relative overflow-hidden"
            >
              <div className={`h-full bg-gradient-to-br ${stat.color} rounded-2xl shadow-lg hover:shadow-2xl transition-all p-6`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-white/80 text-sm font-medium mb-2">{stat.title}</p>
                    <p className="text-4xl font-bold text-white mb-1">{stat.value}</p>
                    {stat.subtitle && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-white/30 text-white backdrop-blur-sm"
                      >
                        {stat.subtitle}
                      </motion.span>
                    )}
                  </div>
                  <div className="text-white/40">
                    {stat.icon}
                  </div>
                </div>
                
                {/* Decorative Element */}
                <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions Grid */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">الإجراءات السريعة</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {quickActions.filter(action => action.show).map((action, index) => (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push(action.href)}
                className="relative group"
              >
                <div className={`h-full bg-gradient-to-br ${action.color} rounded-2xl shadow-lg hover:shadow-2xl transition-all p-6 text-white`}>
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                      {action.icon}
                    </div>
                    <span className="font-bold text-sm">{action.label}</span>
                    
                    {/* Badge */}
                    {action.badge && action.badge > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold shadow-lg animate-pulse"
                      >
                        {action.badge}
                      </motion.span>
                    )}
                  </div>
                  
                  {/* Hover Effect */}
                  <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 rounded-2xl transition-all"></div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
