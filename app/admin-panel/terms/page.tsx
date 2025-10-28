"use client"
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Term {
  id: number;
  sectionId: string;
  titleAr: string;
  titleEn: string;
  contentAr: string;
  contentEn: string;
  icon: string;
  displayOrder: number;
  isActive: number;
  createdAt: string;
  updatedAt: string;
}

export default function AdminTermsPage() {
  const router = useRouter();
  const [terms, setTerms] = useState<Term[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTerm, setEditingTerm] = useState<Term | null>(null);
  const [formData, setFormData] = useState({
    sectionId: '',
    titleAr: '',
    titleEn: '',
    contentAr: '',
    contentEn: '',
    icon: '📄',
    displayOrder: 0,
    isActive: 1
  });

  useEffect(() => {
    // Check authentication
    const admin = localStorage.getItem('admin');
    if (!admin) {
      router.push('/admin-panel/login');
      return;
    }
    
    fetchTerms();
  }, [router]);

  const fetchTerms = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/terms');
      const data = await res.json();
      setTerms(data);
    } catch (error) {
      console.error('Error fetching terms:', error);
      alert('فشل في تحميل الشروط والأحكام');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingTerm(null);
    setFormData({
      sectionId: '',
      titleAr: '',
      titleEn: '',
      contentAr: '',
      contentEn: '',
      icon: '📄',
      displayOrder: terms.length + 1,
      isActive: 1
    });
    setShowAddModal(true);
  };

  const handleEdit = (term: Term) => {
    setEditingTerm(term);
    setFormData({
      sectionId: term.sectionId,
      titleAr: term.titleAr,
      titleEn: term.titleEn,
      contentAr: term.contentAr,
      contentEn: term.contentEn,
      icon: term.icon,
      displayOrder: term.displayOrder,
      isActive: term.isActive
    });
    setShowAddModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.sectionId || !formData.titleAr || !formData.titleEn || !formData.contentAr || !formData.contentEn) {
      alert('جميع الحقول مطلوبة');
      return;
    }

    try {
      const url = editingTerm ? '/api/terms' : '/api/terms';
      const method = editingTerm ? 'PUT' : 'POST';
      const body = editingTerm ? { id: editingTerm.id, ...formData } : formData;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (data.success) {
        alert(editingTerm ? 'تم التحديث بنجاح!' : 'تم الإضافة بنجاح!');
        setShowAddModal(false);
        fetchTerms();
      } else {
        alert(data.error || 'حدث خطأ');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('فشل في حفظ البيانات');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا القسم؟')) return;

    try {
      const res = await fetch(`/api/terms?id=${id}`, {
        method: 'DELETE'
      });

      const data = await res.json();

      if (data.success) {
        alert('تم الحذف بنجاح!');
        fetchTerms();
      } else {
        alert(data.error || 'فشل الحذف');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('فشل في حذف القسم');
    }
  };

  const handleToggleActive = async (term: Term) => {
    try {
      const res = await fetch('/api/terms', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: term.id,
          isActive: term.isActive === 1 ? 0 : 1
        })
      });

      const data = await res.json();

      if (data.success) {
        fetchTerms();
      } else {
        alert(data.error || 'فشل التحديث');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('فشل في تحديث الحالة');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">إدارة الشروط والأحكام</h1>
              <p className="text-gray-600">إضافة وتعديل وحذف أقسام الشروط والأحكام</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleAdd}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl font-bold"
              >
                + إضافة قسم جديد
              </button>
              <button
                onClick={() => router.push('/admin-panel/dashboard')}
                className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all shadow-lg hover:shadow-xl font-bold"
              >
                العودة للوحة التحكم
              </button>
            </div>
          </div>
        </div>

        {/* Terms List */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-50 to-purple-50">
                <tr>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-900">الأيقونة</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-900">معرف القسم</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-900">العنوان (عربي)</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-900">العنوان (إنجليزي)</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-900">الترتيب</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-900">الحالة</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-900">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {terms.map((term) => (
                  <tr key={term.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-2xl">{term.icon}</span>
                    </td>
                    <td className="px-6 py-4">
                      <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono text-blue-600">
                        {term.sectionId}
                      </code>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">{term.titleAr}</td>
                    <td className="px-6 py-4 text-gray-700">{term.titleEn}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 rounded-full font-bold text-sm">
                        {term.displayOrder}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggleActive(term)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                          term.isActive === 1
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                      >
                        {term.isActive === 1 ? 'نشط' : 'غير نشط'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(term)}
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                          title="تعديل"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(term.id)}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                          title="حذف"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {terms.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📄</div>
              <p className="text-gray-500 text-lg">لا توجد أقسام بعد</p>
              <p className="text-gray-400 text-sm mt-2">انقر على "إضافة قسم جديد" لإضافة أول قسم</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
              <h2 className="text-2xl font-bold">
                {editingTerm ? 'تعديل القسم' : 'إضافة قسم جديد'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Section ID */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    معرف القسم (Section ID) *
                  </label>
                  <input
                    type="text"
                    value={formData.sectionId}
                    onChange={(e) => setFormData({ ...formData, sectionId: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none font-mono"
                    placeholder="مثال: intro, usage"
                    required
                    disabled={!!editingTerm}
                  />
                  <p className="text-xs text-gray-500 mt-1">معرف فريد بالإنجليزية (لا يمكن تغييره)</p>
                </div>

                {/* Icon */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    الأيقونة *
                  </label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-2xl text-center"
                    placeholder="📄"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">اختر إيموجي مناسب</p>
                </div>

                {/* Title Arabic */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    العنوان (عربي) *
                  </label>
                  <input
                    type="text"
                    value={formData.titleAr}
                    onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                    placeholder="مثال: مقدمة"
                    required
                  />
                </div>

                {/* Title English */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    العنوان (إنجليزي) *
                  </label>
                  <input
                    type="text"
                    value={formData.titleEn}
                    onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                    placeholder="Example: Introduction"
                    required
                    dir="ltr"
                  />
                </div>

                {/* Display Order */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    ترتيب العرض *
                  </label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                    min="0"
                    required
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    الحالة *
                  </label>
                  <select
                    value={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  >
                    <option value={1}>نشط</option>
                    <option value={0}>غير نشط</option>
                  </select>
                </div>
              </div>

              {/* Content Arabic */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  المحتوى (عربي) *
                </label>
                <textarea
                  value={formData.contentAr}
                  onChange={(e) => setFormData({ ...formData, contentAr: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none min-h-[150px]"
                  placeholder="اكتب المحتوى بالعربي..."
                  required
                />
                <p className="text-xs text-gray-500 mt-1">استخدم سطر جديد للنقاط المتعددة</p>
              </div>

              {/* Content English */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  المحتوى (إنجليزي) *
                </label>
                <textarea
                  value={formData.contentEn}
                  onChange={(e) => setFormData({ ...formData, contentEn: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none min-h-[150px]"
                  placeholder="Write content in English..."
                  required
                  dir="ltr"
                />
                <p className="text-xs text-gray-500 mt-1">Use new lines for multiple points</p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl font-bold"
                >
                  {editingTerm ? 'تحديث القسم' : 'إضافة القسم'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-bold"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
