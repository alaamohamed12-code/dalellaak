"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PermissionGuard from "@/components/admin/PermissionGuard";
import { PermissionButton } from "@/components/admin/PermissionElements";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";

function AdminCompaniesPageContent() {
  const router = useRouter();
  const { hasPermission } = useAdminPermissions();
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [showFiles, setShowFiles] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, []);

  function fetchCompanies() {
    setLoading(true);
    fetch('/admin-panel/api/companies')
      .then(res => res.json())
      .then(data => {
        setCompanies(data.companies || []);
        setLoading(false);
      });
  }

  async function updateCompanyStatus(id: number, status: string) {
    try {
      const res = await fetch('/admin-panel/api/companies', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      if (res.ok) {
        fetchCompanies(); // إعادة تحميل البيانات
      }
    } catch (err) {
      console.error('خطأ في تحديث الحالة:', err);
    }
  }

  async function deleteCompany(id: number) {
    if (!confirm('هل أنت متأكد من حذف هذه الشركة؟')) return;
    
    try {
      const res = await fetch('/admin-panel/api/companies', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        fetchCompanies(); // إعادة تحميل البيانات
      }
    } catch (err) {
      console.error('خطأ في حذف الشركة:', err);
    }
  }

  function viewFiles(company: any) {
    setSelectedCompany(company);
    setShowFiles(true);
  }

  const filteredCompanies = companies.filter(company => {
    if (filter === 'all') return true;
    return company.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-orange-600 bg-orange-100';
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'قيد المراجعة';
      case 'approved': return 'مقبولة';
      case 'rejected': return 'مرفوضة';
      default: return status;
    }
  };

  return (
    <main className="max-w-6xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6 text-center">إدارة طلبات الشركات</h1>
      
      <div className="mb-6 flex gap-2 justify-center">
        <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-full font-bold ${filter === 'all' ? 'bg-cyan-600 text-white' : 'bg-gray-200'}`}>
          الكل ({companies.length})
        </button>
        <button onClick={() => setFilter('pending')} className={`px-4 py-2 rounded-full font-bold ${filter === 'pending' ? 'bg-orange-600 text-white' : 'bg-gray-200'}`}>
          قيد المراجعة ({companies.filter(c => c.status === 'pending').length})
        </button>
        <button onClick={() => setFilter('approved')} className={`px-4 py-2 rounded-full font-bold ${filter === 'approved' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
          مقبولة ({companies.filter(c => c.status === 'approved').length})
        </button>
        <button onClick={() => setFilter('rejected')} className={`px-4 py-2 rounded-full font-bold ${filter === 'rejected' ? 'bg-red-600 text-white' : 'bg-gray-200'}`}>
          مرفوضة ({companies.filter(c => c.status === 'rejected').length})
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10">جاري التحميل...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-xl shadow">
            <thead>
              <tr>
                <th className="py-2 px-3 border-b">#</th>
                <th className="py-2 px-3 border-b">اسم الشركة</th>
                <th className="py-2 px-3 border-b">البريد الإلكتروني</th>
                <th className="py-2 px-3 border-b">المجال</th>
                <th className="py-2 px-3 border-b">مقر الخدمة</th>
                <th className="py-2 px-3 border-b">رقم الموبايل</th>
                <th className="py-2 px-3 border-b">اسم المستخدم</th>
                <th className="py-2 px-3 border-b">الحالة</th>
                <th className="py-2 px-3 border-b">تاريخ التسجيل</th>
                <th className="py-2 px-3 border-b">الملفات</th>
                <th className="py-2 px-3 border-b">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredCompanies.map((company, i) => (
                <tr key={company.id} className="text-center">
                  <td className="py-2 px-3 border-b">{i + 1}</td>
                  <td className="py-2 px-3 border-b">{company.firstName} {company.lastName}</td>
                  <td className="py-2 px-3 border-b">{company.email}</td>
                  <td className="py-2 px-3 border-b">{company.sector || '-'}</td>
                  <td className="py-2 px-3 border-b">{company.location || '-'}</td>
                  <td className="py-2 px-3 border-b">{company.phone}</td>
                  <td className="py-2 px-3 border-b">{company.username}</td>
                  <td className="py-2 px-3 border-b">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(company.status)}`}>
                      {getStatusText(company.status)}
                    </span>
                  </td>
                  <td className="py-2 px-3 border-b text-xs">
                    {new Date(company.createdAt).toLocaleDateString('ar-EG')}
                  </td>
                  <td className="py-2 px-3 border-b">
                    {company.taxDocs ? (
                      <button 
                        onClick={() => viewFiles(company)}
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        {JSON.parse(company.taxDocs).length} ملف
                      </button>
                    ) : '-'}
                  </td>
                  <td className="py-2 px-3 border-b">
                    <div className="flex gap-1 justify-center flex-wrap">
                      {company.status === 'pending' && (
                        <>
                          <PermissionButton
                            resource="companies"
                            action="update"
                            onClick={() => updateCompanyStatus(company.id, 'approved')}
                            className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs font-bold"
                          >
                            قبول
                          </PermissionButton>
                          <PermissionButton
                            resource="companies"
                            action="update"
                            onClick={() => updateCompanyStatus(company.id, 'rejected')}
                            className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs font-bold"
                          >
                            رفض
                          </PermissionButton>
                        </>
                      )}
                      <PermissionButton
                        resource="companies"
                        action="delete"
                        onClick={() => deleteCompany(company.id)}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs font-bold"
                      >
                        حذف
                      </PermissionButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredCompanies.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {filter === 'all' ? 'لا توجد طلبات شركات.' : `لا توجد شركات ${getStatusText(filter)}.`}
            </div>
          )}
        </div>
      )}

      {/* نافذة عرض الملفات */}
      {showFiles && selectedCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">ملفات الشركة: {selectedCompany.firstName} {selectedCompany.lastName}</h2>
              <button 
                onClick={() => setShowFiles(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {JSON.parse(selectedCompany.taxDocs || '[]').map((filename: string, index: number) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="text-sm font-bold mb-2 truncate" title={filename}>
                    {filename}
                  </div>
                  
                  {filename.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/) ? (
                    <img 
                      src={`/admin-panel/api/companies/files/${filename}`}
                      alt={filename}
                      className="w-full h-40 object-cover rounded mb-2"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).nextElementSibling!.classList.remove('hidden');
                      }}
                    />
                  ) : (
                    <div className="w-full h-40 bg-gray-100 rounded mb-2 flex items-center justify-center">
                      <span className="text-gray-500">📄 PDF</span>
                    </div>
                  )}
                  
                  <div className="hidden w-full h-40 bg-red-100 rounded mb-2 flex items-center justify-center">
                    <span className="text-red-500 text-sm">خطأ في تحميل الملف</span>
                  </div>
                  
                  <a 
                    href={`/admin-panel/api/companies/files/${filename}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-blue-500 hover:bg-blue-600 text-white text-center py-2 rounded text-sm font-bold"
                  >
                    عرض الملف
                  </a>
                </div>
              ))}
            </div>
            
            {JSON.parse(selectedCompany.taxDocs || '[]').length === 0 && (
              <div className="text-center py-8 text-gray-500">لا توجد ملفات مرفوعة</div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

export default function AdminCompaniesPage() {
  return (
    <PermissionGuard resource="companies" action="view">
      <AdminCompaniesPageContent />
    </PermissionGuard>
  );
}