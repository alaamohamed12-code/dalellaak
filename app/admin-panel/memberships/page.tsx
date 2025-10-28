"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminMembershipsPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive' | 'expiring'>('all');

  useEffect(() => {
    // Check if admin is logged in
    const adminStr = localStorage.getItem('admin');
    if (!adminStr) {
      router.push('/admin-panel/login');
      return;
    }
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      const res = await fetch('/api/admin/memberships');
      const data = await res.json();
      setCompanies(data.companies || []);
    } catch (err) {
      console.error('Error loading companies:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (companyId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    if (!confirm(`هل أنت متأكد من ${newStatus === 'active' ? 'تفعيل' : 'تعطيل'} عضوية هذه الشركة?`)) {
      return;
    }

    try {
      const res = await fetch('/api/admin/memberships/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, status: newStatus })
      });

      if (!res.ok) {
        throw new Error('Failed to update status');
      }

      loadCompanies();
    } catch (err) {
      alert('فشل تحديث الحالة');
    }
  };

  const handleExtend = async (companyId: number, days: number) => {
    if (!confirm(`هل تريد تمديد العضوية بـ ${days} يوم؟`)) {
      return;
    }

    try {
      const res = await fetch('/api/admin/memberships/extend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, days })
      });

      if (!res.ok) {
        throw new Error('Failed to extend membership');
      }

      alert('تم التمديد بنجاح');
      loadCompanies();
    } catch (err) {
      alert('فشل التمديد');
    }
  };

  const getDaysLeft = (expiryDate: string | null) => {
    if (!expiryDate) return null;
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diff = expiry.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getStatusColor = (status: string, daysLeft: number | null) => {
    if (status === 'inactive') return 'bg-red-100 text-red-800';
    if (daysLeft !== null && daysLeft <= 7) return 'bg-orange-100 text-orange-800';
    return 'bg-green-100 text-green-800';
  };

  const filteredCompanies = companies.filter(company => {
    if (filter === 'all') return true;
    if (filter === 'active') return company.membershipStatus === 'active';
    if (filter === 'inactive') return company.membershipStatus === 'inactive';
    if (filter === 'expiring') {
      const daysLeft = getDaysLeft(company.membershipExpiry);
      return company.membershipStatus === 'active' && daysLeft !== null && daysLeft <= 7;
    }
    return true;
  });

  const stats = {
    total: companies.length,
    active: companies.filter(c => c.membershipStatus === 'active').length,
    inactive: companies.filter(c => c.membershipStatus === 'inactive').length,
    expiring: companies.filter(c => {
      const daysLeft = getDaysLeft(c.membershipExpiry);
      return c.membershipStatus === 'active' && daysLeft !== null && daysLeft <= 7;
    }).length
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">إدارة العضويات</h1>
              <p className="text-gray-600 mt-1">عرض وإدارة عضويات جميع الشركات</p>
            </div>
            <button
              onClick={() => router.push('/admin-panel/dashboard')}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              ← العودة للوحة التحكم
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">إجمالي الشركات</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setFilter('active')}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">عضويات نشطة</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.active}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setFilter('inactive')}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">عضويات غير نشطة</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{stats.inactive}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setFilter('expiring')}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">تنتهي قريباً</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">{stats.expiring}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-gray-700">تصفية:</span>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              الكل ({stats.total})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'active' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              نشطة ({stats.active})
            </button>
            <button
              onClick={() => setFilter('inactive')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'inactive' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              غير نشطة ({stats.inactive})
            </button>
            <button
              onClick={() => setFilter('expiring')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'expiring' ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              تنتهي قريباً ({stats.expiring})
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="text-center py-20 text-gray-500">لا توجد شركات</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الشركة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تاريخ الانتهاء</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الأيام المتبقية</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCompanies.map((company) => {
                  const daysLeft = getDaysLeft(company.membershipExpiry);
                  return (
                    <tr key={company.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{company.firstName}</div>
                            <div className="text-sm text-gray-500">ID: {company.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(company.membershipStatus, daysLeft)}`}>
                          {company.membershipStatus === 'active' ? 'نشطة' : 'غير نشطة'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {company.membershipExpiry ? 
                          new Date(company.membershipExpiry).toLocaleDateString('ar-EG', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                          : '-'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {daysLeft !== null ? (
                          <span className={`text-sm font-medium ${
                            daysLeft <= 0 ? 'text-red-600' : 
                            daysLeft <= 7 ? 'text-orange-600' : 
                            'text-green-600'
                          }`}>
                            {daysLeft <= 0 ? 'منتهية' : `${daysLeft} يوم`}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2 space-x-reverse">
                        <button
                          onClick={() => handleToggleStatus(company.id, company.membershipStatus)}
                          className={`px-3 py-1 rounded-md font-medium ${
                            company.membershipStatus === 'active'
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {company.membershipStatus === 'active' ? 'تعطيل' : 'تفعيل'}
                        </button>
                        <button
                          onClick={() => handleExtend(company.id, 30)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-md font-medium"
                        >
                          +30 يوم
                        </button>
                        <button
                          onClick={() => handleExtend(company.id, 90)}
                          className="px-3 py-1 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-md font-medium"
                        >
                          +90 يوم
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
