"use client";
import { ReactNode } from 'react';
import { useAdminPermissions, AdminPermissions } from '@/hooks/useAdminPermissions';
import { useRouter } from 'next/navigation';

interface PermissionGuardProps {
  children: ReactNode;
  resource: keyof AdminPermissions;
  action?: 'view' | 'create' | 'update' | 'delete';
  fallback?: ReactNode;
}

export default function PermissionGuard({ 
  children, 
  resource, 
  action = 'view',
  fallback 
}: PermissionGuardProps) {
  const { admin, loading, hasPermission } = useAdminPermissions();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!admin) {
    router.push('/admin-panel/login');
    return null;
  }

  if (!hasPermission(resource, action)) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">ليس لديك صلاحية</h2>
            <p className="text-gray-600 mb-6">
              عذراً، ليس لديك الصلاحيات اللازمة للوصول إلى هذه الصفحة أو تنفيذ هذا الإجراء.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="text-sm text-gray-700 space-y-1">
                <p><strong>المورد المطلوب:</strong> {getResourceNameAr(resource)}</p>
                <p><strong>الإجراء المطلوب:</strong> {getActionNameAr(action)}</p>
                <p><strong>دورك الحالي:</strong> {getRoleNameAr(admin.role)}</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/admin-panel/dashboard')}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg"
            >
              العودة إلى لوحة التحكم
            </button>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}

// دالة مساعدة لترجمة اسم المورد
function getResourceNameAr(resource: keyof AdminPermissions): string {
  const names: Record<string, string> = {
    companies: 'الشركات',
    users: 'المستخدمين',
    services: 'الخدمات',
    reviews: 'التقييمات',
    notifications: 'الإشعارات',
    messages: 'الرسائل',
    contracts: 'العقود',
    cities: 'المدن',
    sectors: 'المجالات',
    homeContent: 'محتوى الصفحة الرئيسية',
    faq: 'الأسئلة الشائعة',
    terms: 'الشروط والأحكام',
    support: 'الدعم الفني',
    admins: 'المسؤولين',
    memberships: 'العضويات'
  };
  return names[resource] || resource;
}

// دالة مساعدة لترجمة اسم الإجراء
function getActionNameAr(action: string): string {
  const actions: Record<string, string> = {
    view: 'عرض',
    create: 'إنشاء',
    update: 'تعديل',
    delete: 'حذف'
  };
  return actions[action] || action;
}

// دالة مساعدة لترجمة اسم الدور
function getRoleNameAr(role: string): string {
  const roles: Record<string, string> = {
    super_admin: 'مسؤول رئيسي',
    admin: 'مسؤول',
    moderator: 'مشرف'
  };
  return roles[role] || role;
}
