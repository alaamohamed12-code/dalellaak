"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface City {
  id: number;
  nameAr: string;
  nameEn: string;
  isVisible: number;
  sortOrder: number;
  cityType: 'signup' | 'filter' | 'both';
}

export default function AdminCitiesPage() {
  const router = useRouter();
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'signup' | 'filter' | 'both'>('signup');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentCity, setCurrentCity] = useState<City | null>(null);

  const [formData, setFormData] = useState({
    nameAr: '',
    nameEn: '',
    isVisible: 1,
    sortOrder: 0,
    cityType: 'signup' as 'signup' | 'filter' | 'both'
  });

  useEffect(() => {
    const isAdmin = localStorage.getItem('admin');
    if (!isAdmin) {
      router.push('/admin');
      return;
    }
    fetchCities();
  }, [router]);

  async function fetchCities() {
    try {
      const res = await fetch('/api/admin/cities?includeHidden=true');
      const data = await res.json();
      setCities(data.cities || []);
    } catch (error) {
      console.error('Error fetching cities:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddCity() {
    try {
      const res = await fetch('/api/admin/cities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        resetForm();
        fetchCities();
        alert('✅ تم إضافة المدينة بنجاح!');
      } else {
        alert('❌ خطأ: ' + data.error);
      }
    } catch (error) {
      alert('❌ فشل إضافة المدينة');
    }
  }

  async function handleUpdateCity() {
    if (!currentCity) return;
    
    try {
      const res = await fetch('/api/admin/cities', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentCity.id,
          ...formData
        })
      });

      const data = await res.json();
      if (data.success) {
        setShowEditModal(false);
        setCurrentCity(null);
        resetForm();
        fetchCities();
        alert('✅ تم تحديث المدينة بنجاح!');
      } else {
        alert('❌ خطأ: ' + data.error);
      }
    } catch (error) {
      alert('❌ فشل تحديث المدينة');
    }
  }

  async function handleToggleActive(city: City) {
    try {
      const res = await fetch('/api/admin/cities', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: city.id,
          isVisible: city.isVisible === 1 ? 0 : 1
        })
      });

      const data = await res.json();
      if (data.success) {
        fetchCities();
      } else {
        alert('❌ فشل تغيير حالة المدينة');
      }
    } catch (error) {
      alert('❌ فشل تغيير حالة المدينة');
    }
  }

  async function handleDeleteCity(cityId: number, cityName: string) {
    if (!confirm(`هل أنت متأكد من حذف مدينة "${cityName}"؟`)) return;
    
    try {
      const res = await fetch(`/api/admin/cities?id=${cityId}`, {
        method: 'DELETE'
      });

      const data = await res.json();
      if (data.success) {
        fetchCities();
        alert('✅ تم حذف المدينة بنجاح!');
      } else {
        alert('❌ فشل حذف المدينة');
      }
    } catch (error) {
      alert('❌ فشل حذف المدينة');
    }
  }

  function openEditModal(city: City) {
    setCurrentCity(city);
    setFormData({
      nameAr: city.nameAr,
      nameEn: city.nameEn,
      isVisible: city.isVisible,
      sortOrder: city.sortOrder,
      cityType: city.cityType || 'both'
    });
    setShowEditModal(true);
  }

  function resetForm() {
    setFormData({
      nameAr: '',
      nameEn: '',
      isVisible: 1,
      sortOrder: 0,
      cityType: activeTab
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // فلترة المدن حسب النوع والظهور
  const signupCities = cities.filter(c => (c.cityType === 'signup' || c.cityType === 'both'));
  const filterCities = cities.filter(c => (c.cityType === 'filter' || c.cityType === 'both'));
  const bothCities = cities.filter(c => c.cityType === 'both');
  
  const currentCities = activeTab === 'signup' ? signupCities : activeTab === 'filter' ? filterCities : bothCities;
  const activeCitiesInTab = currentCities.filter(c => c.isVisible === 1);
  const inactiveCitiesInTab = currentCities.filter(c => c.isVisible === 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">🌍 إدارة المدن</h1>
              <p className="text-gray-600">التحكم في المدن حسب موقع الظهور (التسجيل أو الفلاتر)</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setFormData({ ...formData, cityType: activeTab });
                  setShowAddModal(true);
                }}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                ➕ إضافة مدينة جديدة
              </button>
              <button
                onClick={() => router.push('/admin-panel/dashboard')}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all"
              >
                🏠 العودة
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg p-2 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('signup')}
              className={`flex-1 px-6 py-3 rounded-xl font-bold transition-all ${
                activeTab === 'signup'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📝 مدن التسجيل ({signupCities.length})
            </button>
            <button
              onClick={() => setActiveTab('filter')}
              className={`flex-1 px-6 py-3 rounded-xl font-bold transition-all ${
                activeTab === 'filter'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🔍 مدن الفلتر ({filterCities.length})
            </button>
            <button
              onClick={() => setActiveTab('both')}
              className={`flex-1 px-6 py-3 rounded-xl font-bold transition-all ${
                activeTab === 'both'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🌟 كلاهما ({bothCities.length})
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className={`rounded-2xl shadow-lg p-6 text-white ${
            activeTab === 'signup' ? 'bg-gradient-to-br from-emerald-500 to-teal-600' :
            activeTab === 'filter' ? 'bg-gradient-to-br from-blue-500 to-cyan-600' :
            'bg-gradient-to-br from-purple-500 to-pink-600'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-semibold mb-1">إجمالي المدن</p>
                <p className="text-4xl font-bold">{currentCities.length}</p>
              </div>
              <div className="text-5xl opacity-20">🏙️</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-semibold mb-1">المدن النشطة</p>
                <p className="text-4xl font-bold">{activeCitiesInTab.length}</p>
              </div>
              <div className="text-5xl opacity-20">✅</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-100 text-sm font-semibold mb-1">المدن المخفية</p>
                <p className="text-4xl font-bold">{inactiveCitiesInTab.length}</p>
              </div>
              <div className="text-5xl opacity-20">👁️‍🗨️</div>
            </div>
          </div>
        </div>

        {/* Active Cities */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-green-500">✅</span>
            المدن النشطة في 
            {activeTab === 'signup' ? ' التسجيل' : activeTab === 'filter' ? ' الفلتر' : ' كلاهما'} 
            ({activeCitiesInTab.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {activeCitiesInTab.map((city, index) => (
              <motion.div
                key={city.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg">{city.nameAr}</h3>
                    <p className="text-sm text-gray-600">{city.nameEn}</p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold">
                    #{city.sortOrder}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(city)}
                    className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-semibold transition"
                  >
                    ✏️ تعديل
                  </button>
                  <button
                    onClick={() => handleToggleActive(city)}
                    className="flex-1 px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm font-semibold transition"
                  >
                    👁️ إخفاء
                  </button>
                  <button
                    onClick={() => handleDeleteCity(city.id, city.nameAr)}
                    className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition"
                  >
                    🗑️
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
          {activeCitiesInTab.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">لا توجد مدن نشطة في هذا القسم</p>
            </div>
          )}
        </div>

        {/* Inactive Cities */}
        {inactiveCitiesInTab.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-gray-500">👁️‍🗨️</span>
              المدن المخفية في 
              {activeTab === 'signup' ? ' التسجيل' : activeTab === 'filter' ? ' الفلتر' : ' كلاهما'} 
              ({inactiveCitiesInTab.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {inactiveCitiesInTab.map((city, index) => (
                <motion.div
                  key={city.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4 opacity-75 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-700 text-lg">{city.nameAr}</h3>
                      <p className="text-sm text-gray-500">{city.nameEn}</p>
                    </div>
                    <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded text-xs font-bold">
                      #{city.sortOrder}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(city)}
                      className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-semibold transition"
                    >
                      ✏️ تعديل
                    </button>
                    <button
                      onClick={() => handleToggleActive(city)}
                      className="flex-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-semibold transition"
                    >
                      👁️ إظهار
                    </button>
                    <button
                      onClick={() => handleDeleteCity(city.id, city.nameAr)}
                      className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition"
                    >
                      🗑️
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {(showAddModal || showEditModal) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => {
              setShowAddModal(false);
              setShowEditModal(false);
              setCurrentCity(null);
              resetForm();
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {showEditModal ? '✏️ تعديل المدينة' : '➕ إضافة مدينة جديدة'}
              </h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      اسم المدينة بالعربي
                    </label>
                    <input
                      type="text"
                      value={formData.nameAr}
                      onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="الرياض"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      اسم المدينة بالإنجليزي
                    </label>
                    <input
                      type="text"
                      value={formData.nameEn}
                      onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Riyadh"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      ترتيب العرض
                    </label>
                    <input
                      type="number"
                      value={formData.sortOrder}
                      onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">الرقم الأقل يظهر أولاً</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      موقع الظهور
                    </label>
                    <select
                      value={formData.cityType}
                      onChange={(e) => setFormData({ ...formData, cityType: e.target.value as 'signup' | 'filter' | 'both' })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                      <option value="signup">📝 التسجيل فقط</option>
                      <option value="filter">🔍 الفلتر فقط</option>
                      <option value="both">🌟 كلاهما</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">اختر أين ستظهر المدينة</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={showEditModal ? handleUpdateCity : handleAddCity}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
                >
                  {showEditModal ? '💾 حفظ التعديلات' : '➕ إضافة المدينة'}
                </button>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    setCurrentCity(null);
                    resetForm();
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all"
                >
                  ❌ إلغاء
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
