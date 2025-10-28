"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface Subservice {
  id: number;
  service_key: string;
  key: string;
  title_ar: string;
  title_en: string;
  icon: string;
  description_ar: string;
  description_en: string;
  display_order: number;
  is_active: number;
}

interface Service {
  id: number;
  key: string;
  title_ar: string;
  title_en: string;
  icon: string;
  description_ar: string;
  description_en: string;
  gradient: string;
  display_order: number;
  is_active: number;
  subservices: Subservice[];
}

export default function AdminServicesPage() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSubModal, setShowSubModal] = useState(false);
  const [currentService, setCurrentService] = useState<Service | null>(null);
  const [currentSubservice, setCurrentSubservice] = useState<Subservice | null>(null);
  const [expandedService, setExpandedService] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    key: '',
    title_ar: '',
    title_en: '',
    icon: '',
    description_ar: '',
    description_en: '',
    gradient: 'from-blue-500 to-purple-500',
    display_order: 0
  });

  const [subFormData, setSubFormData] = useState({
    key: '',
    title_ar: '',
    title_en: '',
    icon: '',
    description_ar: '',
    description_en: '',
    display_order: 0
  });

  const gradientOptions = [
    'from-blue-500 via-indigo-500 to-purple-500',
    'from-emerald-500 via-teal-500 to-cyan-500',
    'from-orange-500 via-amber-500 to-yellow-500',
    'from-pink-500 via-rose-500 to-red-500',
    'from-violet-500 via-purple-500 to-fuchsia-500',
    'from-yellow-500 via-orange-500 to-red-500',
    'from-blue-600 via-cyan-600 to-teal-600',
    'from-amber-600 via-orange-600 to-red-600',
    'from-gray-700 via-gray-800 to-gray-900',
    'from-indigo-500 via-blue-500 to-cyan-500',
    'from-gray-500 via-gray-600 to-gray-700'
  ];

  useEffect(() => {
    const isAdmin = localStorage.getItem('admin');
    if (!isAdmin) {
      router.push('/admin');
      return;
    }
    fetchServices();
  }, [router]);

  async function fetchServices() {
    try {
      const res = await fetch('/api/services');
      const data = await res.json();
      setServices(data);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddService() {
    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setShowAddModal(false);
        resetForm();
        fetchServices();
        alert('✅ تم إضافة الخدمة بنجاح!');
      } else {
        const data = await res.json();
        alert('❌ خطأ: ' + data.error);
      }
    } catch (error) {
      alert('❌ فشل إضافة الخدمة');
    }
  }

  async function handleUpdateService() {
    if (!currentService) return;
    
    try {
      const res = await fetch(`/api/services/${currentService.key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setShowEditModal(false);
        setCurrentService(null);
        resetForm();
        fetchServices();
        alert('✅ تم تحديث الخدمة بنجاح!');
      } else {
        alert('❌ فشل تحديث الخدمة');
      }
    } catch (error) {
      alert('❌ فشل تحديث الخدمة');
    }
  }

  async function handleDeleteService(serviceKey: string) {
    if (!confirm('هل أنت متأكد من حذف هذه الخدمة؟ سيتم حذف جميع الخدمات الفرعية المرتبطة بها!')) return;
    
    try {
      const res = await fetch(`/api/services/${serviceKey}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        fetchServices();
        alert('✅ تم حذف الخدمة بنجاح!');
      } else {
        alert('❌ فشل حذف الخدمة');
      }
    } catch (error) {
      alert('❌ فشل حذف الخدمة');
    }
  }

  async function handleAddSubservice() {
    if (!currentService) return;
    
    try {
      const res = await fetch(`/api/services/${currentService.key}/subservices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subFormData)
      });

      if (res.ok) {
        setShowSubModal(false);
        resetSubForm();
        fetchServices();
        alert('✅ تم إضافة الخدمة الفرعية بنجاح!');
      } else {
        const data = await res.json();
        alert('❌ خطأ: ' + data.error);
      }
    } catch (error) {
      alert('❌ فشل إضافة الخدمة الفرعية');
    }
  }

  async function handleUpdateSubservice() {
    if (!currentService || !currentSubservice) return;
    
    try {
      const res = await fetch(`/api/services/${currentService.key}/subservices/${currentSubservice.key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subFormData)
      });

      if (res.ok) {
        setShowSubModal(false);
        setCurrentSubservice(null);
        resetSubForm();
        fetchServices();
        alert('✅ تم تحديث الخدمة الفرعية بنجاح!');
      } else {
        alert('❌ فشل تحديث الخدمة الفرعية');
      }
    } catch (error) {
      alert('❌ فشل تحديث الخدمة الفرعية');
    }
  }

  async function handleDeleteSubservice(serviceKey: string, subKey: string) {
    if (!confirm('هل أنت متأكد من حذف هذه الخدمة الفرعية؟')) return;
    
    try {
      const res = await fetch(`/api/services/${serviceKey}/subservices/${subKey}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        fetchServices();
        alert('✅ تم حذف الخدمة الفرعية بنجاح!');
      } else {
        alert('❌ فشل حذف الخدمة الفرعية');
      }
    } catch (error) {
      alert('❌ فشل حذف الخدمة الفرعية');
    }
  }

  function openEditModal(service: Service) {
    setCurrentService(service);
    setFormData({
      key: service.key,
      title_ar: service.title_ar,
      title_en: service.title_en,
      icon: service.icon,
      description_ar: service.description_ar,
      description_en: service.description_en,
      gradient: service.gradient,
      display_order: service.display_order
    });
    setShowEditModal(true);
  }

  function openSubModal(service: Service, subservice?: Subservice) {
    setCurrentService(service);
    if (subservice) {
      setCurrentSubservice(subservice);
      setSubFormData({
        key: subservice.key,
        title_ar: subservice.title_ar,
        title_en: subservice.title_en,
        icon: subservice.icon,
        description_ar: subservice.description_ar,
        description_en: subservice.description_en,
        display_order: subservice.display_order
      });
    } else {
      setCurrentSubservice(null);
      resetSubForm();
    }
    setShowSubModal(true);
  }

  function resetForm() {
    setFormData({
      key: '',
      title_ar: '',
      title_en: '',
      icon: '',
      description_ar: '',
      description_en: '',
      gradient: 'from-blue-500 to-purple-500',
      display_order: 0
    });
  }

  function resetSubForm() {
    setSubFormData({
      key: '',
      title_ar: '',
      title_en: '',
      icon: '',
      description_ar: '',
      description_en: '',
      display_order: 0
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">🔧 إدارة الخدمات</h1>
              <p className="text-gray-600">إضافة وتعديل وحذف الخدمات الرئيسية والفرعية</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                ➕ إضافة خدمة جديدة
              </button>
              <button
                onClick={() => router.push('/admin')}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all"
              >
                🏠 العودة
              </button>
            </div>
          </div>
        </div>

        {/* Services List */}
        <div className="space-y-4">
          {services.map((service) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden"
            >
              {/* Service Header */}
              <div className={`bg-gradient-to-r ${service.gradient} p-6`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <span className="text-5xl">{service.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-2xl font-bold text-white">{service.title_ar}</h2>
                        <span className="px-3 py-1 bg-white/20 backdrop-blur rounded-full text-white text-sm font-semibold">
                          {service.title_en}
                        </span>
                        <span className="px-3 py-1 bg-white/20 backdrop-blur rounded-full text-white text-sm">
                          #{service.display_order}
                        </span>
                      </div>
                      <p className="text-white/90 text-sm">{service.description_ar}</p>
                      <p className="text-white/75 text-xs mt-1">{service.description_en}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openSubModal(service)}
                      className="px-4 py-2 bg-white/20 backdrop-blur hover:bg-white/30 text-white rounded-lg font-semibold transition"
                    >
                      ➕ إضافة فرعية
                    </button>
                    <button
                      onClick={() => openEditModal(service)}
                      className="px-4 py-2 bg-white/20 backdrop-blur hover:bg-white/30 text-white rounded-lg font-semibold transition"
                    >
                      ✏️ تعديل
                    </button>
                    <button
                      onClick={() => handleDeleteService(service.key)}
                      className="px-4 py-2 bg-red-500/80 hover:bg-red-600 text-white rounded-lg font-semibold transition"
                    >
                      🗑️ حذف
                    </button>
                    <button
                      onClick={() => setExpandedService(expandedService === service.key ? null : service.key)}
                      className="px-4 py-2 bg-white/20 backdrop-blur hover:bg-white/30 text-white rounded-lg font-semibold transition"
                    >
                      {expandedService === service.key ? '▲' : '▼'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Subservices */}
              <AnimatePresence>
                {expandedService === service.key && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="bg-gray-50 p-6"
                  >
                    <h3 className="text-lg font-bold text-gray-800 mb-4">
                      الخدمات الفرعية ({service.subservices.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {service.subservices.map((sub) => (
                        <div key={sub.id} className="bg-white rounded-xl p-4 shadow hover:shadow-lg transition">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-3xl">{sub.icon}</span>
                              <div>
                                <h4 className="font-bold text-gray-900">{sub.title_ar}</h4>
                                <p className="text-xs text-gray-500">{sub.title_en}</p>
                              </div>
                            </div>
                            <span className="px-2 py-1 bg-gray-100 rounded text-xs">#{sub.display_order}</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{sub.description_ar}</p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => openSubModal(service, sub)}
                              className="flex-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-semibold transition"
                            >
                              ✏️ تعديل
                            </button>
                            <button
                              onClick={() => handleDeleteSubservice(service.key, sub.key)}
                              className="flex-1 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition"
                            >
                              🗑️ حذف
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    {service.subservices.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        لا توجد خدمات فرعية. اضغط "➕ إضافة فرعية" لإضافة خدمة فرعية جديدة.
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {services.length === 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="text-8xl mb-6">📋</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">لا توجد خدمات</h3>
            <p className="text-gray-600 mb-6">ابدأ بإضافة خدمة جديدة</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
            >
              ➕ إضافة خدمة جديدة
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Service Modal */}
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
              setCurrentService(null);
              resetForm();
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {showEditModal ? '✏️ تعديل الخدمة' : '➕ إضافة خدمة جديدة'}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">المعرف (Key)</label>
                  <input
                    type="text"
                    value={formData.key}
                    onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                    disabled={showEditModal}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    placeholder="engineering-consulting"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">العنوان بالعربي</label>
                    <input
                      type="text"
                      value={formData.title_ar}
                      onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="استشارات هندسية"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">العنوان بالإنجليزي</label>
                    <input
                      type="text"
                      value={formData.title_en}
                      onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Engineering Consulting"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">الأيقونة (Emoji)</label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-3xl"
                    placeholder="🏛️"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">الوصف بالعربي</label>
                  <textarea
                    value={formData.description_ar}
                    onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="وصف الخدمة بالعربي"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">الوصف بالإنجليزي</label>
                  <textarea
                    value={formData.description_en}
                    onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Service description in English"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">التدرج اللوني</label>
                  <select
                    value={formData.gradient}
                    onChange={(e) => setFormData({ ...formData, gradient: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {gradientOptions.map((grad) => (
                      <option key={grad} value={grad}>{grad}</option>
                    ))}
                  </select>
                  <div className={`mt-2 h-12 rounded-xl bg-gradient-to-r ${formData.gradient}`}></div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">ترتيب العرض</label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={showEditModal ? handleUpdateService : handleAddService}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
                >
                  {showEditModal ? '💾 حفظ التعديلات' : '➕ إضافة الخدمة'}
                </button>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    setCurrentService(null);
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

      {/* Add/Edit Subservice Modal */}
      <AnimatePresence>
        {showSubModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => {
              setShowSubModal(false);
              setCurrentSubservice(null);
              resetSubForm();
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {currentSubservice ? '✏️ تعديل الخدمة الفرعية' : '➕ إضافة خدمة فرعية'}
              </h2>
              <p className="text-gray-600 mb-6">للخدمة: {currentService?.title_ar}</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">المعرف (Key)</label>
                  <input
                    type="text"
                    value={subFormData.key}
                    onChange={(e) => setSubFormData({ ...subFormData, key: e.target.value })}
                    disabled={!!currentSubservice}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    placeholder="architectural-design"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">العنوان بالعربي</label>
                    <input
                      type="text"
                      value={subFormData.title_ar}
                      onChange={(e) => setSubFormData({ ...subFormData, title_ar: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="تصميم معماري"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">العنوان بالإنجليزي</label>
                    <input
                      type="text"
                      value={subFormData.title_en}
                      onChange={(e) => setSubFormData({ ...subFormData, title_en: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Architectural Design"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">الأيقونة (Emoji)</label>
                  <input
                    type="text"
                    value={subFormData.icon}
                    onChange={(e) => setSubFormData({ ...subFormData, icon: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-3xl"
                    placeholder="🏛️"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">الوصف بالعربي</label>
                  <textarea
                    value={subFormData.description_ar}
                    onChange={(e) => setSubFormData({ ...subFormData, description_ar: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={2}
                    placeholder="وصف الخدمة الفرعية بالعربي"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">الوصف بالإنجليزي</label>
                  <textarea
                    value={subFormData.description_en}
                    onChange={(e) => setSubFormData({ ...subFormData, description_en: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={2}
                    placeholder="Subservice description in English"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">ترتيب العرض</label>
                  <input
                    type="number"
                    value={subFormData.display_order}
                    onChange={(e) => setSubFormData({ ...subFormData, display_order: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={currentSubservice ? handleUpdateSubservice : handleAddSubservice}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
                >
                  {currentSubservice ? '💾 حفظ التعديلات' : '➕ إضافة الخدمة الفرعية'}
                </button>
                <button
                  onClick={() => {
                    setShowSubModal(false);
                    setCurrentSubservice(null);
                    resetSubForm();
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
