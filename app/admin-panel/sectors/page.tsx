'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Sector {
  id: number;
  nameAr: string;
  nameEn: string;
  isVisible: number;
  sortOrder: number;
}

export default function SectorsManagement() {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSector, setSelectedSector] = useState<Sector | null>(null);
  const [formData, setFormData] = useState({
    nameAr: '',
    nameEn: '',
    isVisible: 1,
    sortOrder: 0
  });

  useEffect(() => {
    fetchSectors();
  }, []);

  const fetchSectors = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/sectors?includeHidden=true');
      const data = await response.json();
      setSectors(data.sectors || []);
    } catch (error) {
      console.error('Error fetching sectors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    try {
      const response = await fetch('/api/admin/sectors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      
      if (data.success) {
        setShowAddModal(false);
        setFormData({ nameAr: '', nameEn: '', isVisible: 1, sortOrder: 0 });
        fetchSectors();
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error('Error adding sector:', error);
      alert('فشل في إضافة المجال');
    }
  };

  const handleEdit = async () => {
    if (!selectedSector) return;
    
    try {
      console.log('Sending update request:', { id: selectedSector.id, ...formData });
      
      const response = await fetch('/api/admin/sectors', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedSector.id, ...formData })
      });
      
      const data = await response.json();
      console.log('Update response:', data);
      
      if (data.success) {
        setShowEditModal(false);
        setSelectedSector(null);
        setFormData({ nameAr: '', nameEn: '', isVisible: 1, sortOrder: 0 });
        fetchSectors();
        alert('تم تحديث المجال بنجاح');
      } else {
        alert(data.error || 'فشل في تحديث المجال');
        console.error('Error details:', data);
      }
    } catch (error) {
      console.error('Error updating sector:', error);
      alert('فشل في تحديث المجال: ' + (error as Error).message);
    }
  };

  const handleDelete = async () => {
    if (!selectedSector) return;
    
    try {
      const response = await fetch(`/api/admin/sectors?id=${selectedSector.id}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      
      if (data.success) {
        setShowDeleteModal(false);
        setSelectedSector(null);
        fetchSectors();
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error('Error deleting sector:', error);
      alert('فشل في حذف المجال');
    }
  };

  const toggleVisibility = async (sector: Sector) => {
    try {
      console.log('Toggling visibility for sector:', sector.id);
      
      const response = await fetch('/api/admin/sectors', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: sector.id, 
          nameAr: sector.nameAr,
          nameEn: sector.nameEn,
          sortOrder: sector.sortOrder,
          isVisible: sector.isVisible === 1 ? 0 : 1 
        })
      });
      
      const data = await response.json();
      console.log('Toggle visibility response:', data);
      
      if (data.success) {
        fetchSectors();
      } else {
        alert(data.error || 'فشل في تغيير حالة الظهور');
      }
    } catch (error) {
      console.error('Error toggling visibility:', error);
      alert('فشل في تغيير حالة الظهور');
    }
  };

  const openEditModal = (sector: Sector) => {
    setSelectedSector(sector);
    setFormData({
      nameAr: sector.nameAr,
      nameEn: sector.nameEn,
      isVisible: sector.isVisible,
      sortOrder: sector.sortOrder
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (sector: Sector) => {
    setSelectedSector(sector);
    setShowDeleteModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">إدارة المجالات</h1>
            <p className="text-gray-600 mt-2">إدارة وتحديث قائمة المجالات المتاحة</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-shadow"
          >
            إضافة مجال جديد
          </motion.button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                    الاسم بالعربي
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                    الاسم بالإنجليزي
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                    الترتيب
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                    الحالة
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sectors.map((sector, index) => (
                  <motion.tr
                    key={sector.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {sector.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {sector.nameAr}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {sector.nameEn}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {sector.sortOrder}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleVisibility(sector)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          sector.isVisible === 1
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {sector.isVisible === 1 ? 'ظاهر' : 'مخفي'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(sector)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          تعديل
                        </button>
                        <button
                          onClick={() => openDeleteModal(sector)}
                          className="text-red-600 hover:text-red-900"
                        >
                          حذف
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Modal */}
        <AnimatePresence>
          {showAddModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">إضافة مجال جديد</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الاسم بالعربي
                    </label>
                    <input
                      type="text"
                      value={formData.nameAr}
                      onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الاسم بالإنجليزي
                    </label>
                    <input
                      type="text"
                      value={formData.nameEn}
                      onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الترتيب
                    </label>
                    <input
                      type="number"
                      value={formData.sortOrder}
                      onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isVisible"
                      checked={formData.isVisible === 1}
                      onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked ? 1 : 0 })}
                      className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                    />
                    <label htmlFor="isVisible" className="text-sm font-medium text-gray-700">
                      ظاهر للمستخدمين
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleAdd}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-semibold hover:shadow-lg transition-shadow"
                  >
                    إضافة
                  </button>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setFormData({ nameAr: '', nameEn: '', isVisible: 1, sortOrder: 0 });
                    }}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    إلغاء
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Edit Modal */}
        <AnimatePresence>
          {showEditModal && selectedSector && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">تعديل المجال</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الاسم بالعربي
                    </label>
                    <input
                      type="text"
                      value={formData.nameAr}
                      onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الاسم بالإنجليزي
                    </label>
                    <input
                      type="text"
                      value={formData.nameEn}
                      onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الترتيب
                    </label>
                    <input
                      type="number"
                      value={formData.sortOrder}
                      onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isVisibleEdit"
                      checked={formData.isVisible === 1}
                      onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked ? 1 : 0 })}
                      className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                    />
                    <label htmlFor="isVisibleEdit" className="text-sm font-medium text-gray-700">
                      ظاهر للمستخدمين
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleEdit}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition-shadow"
                  >
                    حفظ التغييرات
                  </button>
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedSector(null);
                      setFormData({ nameAr: '', nameEn: '', isVisible: 1, sortOrder: 0 });
                    }}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    إلغاء
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Delete Modal */}
        <AnimatePresence>
          {showDeleteModal && selectedSector && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-4">تأكيد الحذف</h2>
                <p className="text-gray-600 mb-6">
                  هل أنت متأكد من حذف المجال "{selectedSector.nameAr}"؟ لا يمكن التراجع عن هذا الإجراء.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={handleDelete}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-semibold hover:shadow-lg transition-shadow"
                  >
                    حذف
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setSelectedSector(null);
                    }}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    إلغاء
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
