import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export interface AdminPermissions {
  companies?: { view?: boolean; create?: boolean; update?: boolean; delete?: boolean };
  users?: { view?: boolean; create?: boolean; update?: boolean; delete?: boolean };
  services?: { view?: boolean; create?: boolean; update?: boolean; delete?: boolean };
  reviews?: { view?: boolean; create?: boolean; update?: boolean; delete?: boolean };
  notifications?: { view?: boolean; create?: boolean; update?: boolean; delete?: boolean };
  messages?: { view?: boolean; create?: boolean; update?: boolean; delete?: boolean };
  contracts?: { view?: boolean; create?: boolean; update?: boolean; delete?: boolean };
  cities?: { view?: boolean; create?: boolean; update?: boolean; delete?: boolean };
  sectors?: { view?: boolean; create?: boolean; update?: boolean; delete?: boolean };
  homeContent?: { view?: boolean; create?: boolean; update?: boolean; delete?: boolean };
  faq?: { view?: boolean; create?: boolean; update?: boolean; delete?: boolean };
  terms?: { view?: boolean; create?: boolean; update?: boolean; delete?: boolean };
  support?: { view?: boolean; create?: boolean; update?: boolean; delete?: boolean };
  admins?: { view?: boolean; create?: boolean; update?: boolean; delete?: boolean };
  memberships?: { view?: boolean; create?: boolean; update?: boolean; delete?: boolean };
}

export interface Admin {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'super_admin' | 'admin' | 'moderator';
  permissions: AdminPermissions;
  lastLogin?: string;
}

export function useAdminPermissions() {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const adminStr = localStorage.getItem('admin');
    if (!adminStr) {
      router.push('/admin-panel/login');
      return;
    }

    try {
      const adminData = JSON.parse(adminStr);
      
      // تأكد من وجود بيانات الصلاحيات
      if (!adminData.permissions) {
        console.error('لا توجد صلاحيات للمسؤول');
        router.push('/admin-panel/login');
        return;
      }

      setAdmin(adminData);
    } catch (error) {
      console.error('خطأ في قراءة بيانات المسؤول:', error);
      router.push('/admin-panel/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  // التحقق من صلاحية معينة
  const hasPermission = (resource: keyof AdminPermissions, action: 'view' | 'create' | 'update' | 'delete'): boolean => {
    if (!admin) return false;
    
    // Super Admin لديه كل الصلاحيات
    if (admin.role === 'super_admin') return true;

    // التحقق من الصلاحية المحددة
    const resourcePermissions = admin.permissions[resource];
    if (!resourcePermissions) return false;

    return resourcePermissions[action] === true;
  };

  // التحقق من إمكانية الوصول إلى صفحة
  const canAccessPage = (resource: keyof AdminPermissions): boolean => {
    return hasPermission(resource, 'view');
  };

  // إعادة التوجيه إذا لم يكن لديه صلاحية
  const requirePermission = (resource: keyof AdminPermissions, action: 'view' | 'create' | 'update' | 'delete') => {
    if (!hasPermission(resource, action)) {
      router.push('/admin-panel/dashboard');
      return false;
    }
    return true;
  };

  return {
    admin,
    loading,
    hasPermission,
    canAccessPage,
    requirePermission,
    isSuperAdmin: admin?.role === 'super_admin'
  };
}
