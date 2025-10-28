'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQ {
  id: number;
  questionAr: string;
  answerAr: string;
  questionEn: string;
  answerEn: string;
  displayOrder: number;
  isActive: number;
  createdAt: string;
  updatedAt: string;
}

export default function FAQManagement() {
  const router = useRouter();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    questionAr: '',
    answerAr: '',
    questionEn: '',
    answerEn: ''
  });

  useEffect(() => {
    const adminStr = localStorage.getItem('admin');
    if (!adminStr) {
      router.push('/admin-panel/login');
      return;
    }
    loadFAQs();
  }, []);

  const loadFAQs = async () => {
    try {
      const response = await fetch('/api/faq');
      if (!response.ok) throw new Error('فشل في تحميل البيانات');
      
      const data = await response.json();
      setFaqs(data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading FAQs:', error);
      showMessage('error', 'حدث خطأ في تحميل الأسئلة الشائعة');
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleAdd = async () => {
    if (!formData.questionAr.trim() || !formData.answerAr.trim() || 
        !formData.questionEn.trim() || !formData.answerEn.trim()) {
      showMessage('error', 'الرجاء إدخال السؤال والإجابة بالعربي والإنجليزي');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/faq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('فشل في إضافة السؤال');
      
      showMessage('success', 'تم إضافة السؤال بنجاح! ✅');
      setFormData({ questionAr: '', answerAr: '', questionEn: '', answerEn: '' });
      setIsAddingNew(false);
      loadFAQs();
    } catch (error) {
      console.error('Error adding FAQ:', error);
      showMessage('error', 'حدث خطأ في إضافة السؤال');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id: number) => {
    if (!formData.questionAr.trim() || !formData.answerAr.trim() || 
        !formData.questionEn.trim() || !formData.answerEn.trim()) {
      showMessage('error', 'الرجاء إدخال السؤال والإجابة بالعربي والإنجليزي');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/faq', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...formData })
      });

      if (!response.ok) throw new Error('فشل في تحديث السؤال');
      
      showMessage('success', 'تم تحديث السؤال بنجاح! ✅');
      setEditingId(null);
      setFormData({ questionAr: '', answerAr: '', questionEn: '', answerEn: '' });
      loadFAQs();
    } catch (error) {
      console.error('Error updating FAQ:', error);
      showMessage('error', 'حدث خطأ في تحديث السؤال');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا السؤال؟')) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/faq?id=${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('فشل في حذف السؤال');
      
      showMessage('success', 'تم حذف السؤال بنجاح! ✅');
      loadFAQs();
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      showMessage('error', 'حدث خطأ في حذف السؤال');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (id: number, currentStatus: number) => {
    setSaving(true);
    try {
      const response = await fetch('/api/faq', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: currentStatus === 1 ? 0 : 1 })
      });

      if (!response.ok) throw new Error('فشل في تغيير الحالة');
      
      showMessage('success', 'تم تغيير الحالة بنجاح! ✅');
      loadFAQs();
    } catch (error) {
      console.error('Error toggling active:', error);
      showMessage('error', 'حدث خطأ في تغيير الحالة');
    } finally {
      setSaving(false);
    }
  };

  const handleReorder = async (id: number, newOrder: number) => {
    setSaving(true);
    try {
      const response = await fetch('/api/faq', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, displayOrder: newOrder })
      });

      if (!response.ok) throw new Error('فشل في تغيير الترتيب');
      
      showMessage('success', 'تم تغيير الترتيب بنجاح! ✅');
      loadFAQs();
    } catch (error) {
      console.error('Error reordering FAQ:', error);
      showMessage('error', 'حدث خطأ في تغيير الترتيب');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (faq: FAQ) => {
    setEditingId(faq.id);
    setFormData({ 
      questionAr: faq.questionAr, 
      answerAr: faq.answerAr,
      questionEn: faq.questionEn,
      answerEn: faq.answerEn
    });
    setIsAddingNew(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAddingNew(false);
    setFormData({ questionAr: '', answerAr: '', questionEn: '', answerEn: '' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل الأسئلة الشائعة...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8" dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">إدارة الأسئلة الشائعة</h1>
              <p className="text-gray-600">إضافة وتعديل الأسئلة الشائعة التي تظهر للمستخدمين</p>
            </div>
            <button
              onClick={() => {
                setIsAddingNew(true);
                setEditingId(null);
                setFormData({ questionAr: '', answerAr: '', questionEn: '', answerEn: '' });
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-bold transition-all shadow-lg flex items-center gap-2"
            >
              <span className="text-xl">+</span>
              إضافة سؤال جديد
            </button>
          </div>
        </motion.div>

        {/* Message Alert */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mb-6 p-4 rounded-lg ${
                message.type === 'success' 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add New Form */}
        {isAddingNew && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-lg p-6 mb-6"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">إضافة سؤال جديد</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">السؤال (عربي)</label>
                  <input
                    type="text"
                    value={formData.questionAr}
                    onChange={(e) => setFormData({ ...formData, questionAr: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="اكتب السؤال بالعربي..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Question (English)</label>
                  <input
                    type="text"
                    value={formData.questionEn}
                    onChange={(e) => setFormData({ ...formData, questionEn: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Type the question in English..."
                    dir="ltr"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">الإجابة (عربي)</label>
                  <textarea
                    value={formData.answerAr}
                    onChange={(e) => setFormData({ ...formData, answerAr: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="اكتب الإجابة بالعربي..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Answer (English)</label>
                  <textarea
                    value={formData.answerEn}
                    onChange={(e) => setFormData({ ...formData, answerEn: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Type the answer in English..."
                    dir="ltr"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleAdd}
                  disabled={saving}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:bg-gray-400"
                >
                  {saving ? 'جاري الحفظ...' : 'حفظ'}
                </button>
                <button
                  onClick={cancelEdit}
                  disabled={saving}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* FAQ List */}
        <div className="space-y-4">
          <AnimatePresence>
            {faqs.map((faq, index) => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden"
              >
                {editingId === faq.id ? (
                  // Edit Mode
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">تعديل السؤال</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">السؤال (عربي)</label>
                          <input
                            type="text"
                            value={formData.questionAr}
                            onChange={(e) => setFormData({ ...formData, questionAr: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Question (English)</label>
                          <input
                            type="text"
                            value={formData.questionEn}
                            onChange={(e) => setFormData({ ...formData, questionEn: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                            dir="ltr"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">الإجابة (عربي)</label>
                          <textarea
                            value={formData.answerAr}
                            onChange={(e) => setFormData({ ...formData, answerAr: e.target.value })}
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Answer (English)</label>
                          <textarea
                            value={formData.answerEn}
                            onChange={(e) => setFormData({ ...formData, answerEn: e.target.value })}
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                            dir="ltr"
                          />
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleUpdate(faq.id)}
                          disabled={saving}
                          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:bg-gray-400"
                        >
                          {saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                        </button>
                        <button
                          onClick={cancelEdit}
                          disabled={saving}
                          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                          إلغاء
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-bold">
                            #{faq.displayOrder}
                          </span>
                          {faq.isActive === 1 ? (
                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">
                              نشط
                            </span>
                          ) : (
                            <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-bold">
                              غير نشط
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="border-r-4 border-purple-500 pr-4">
                            <h4 className="text-sm font-bold text-gray-500 mb-2">العربي</h4>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">{faq.questionAr}</h3>
                            <p className="text-gray-600 leading-relaxed">{faq.answerAr}</p>
                          </div>
                          <div className="border-l-4 border-blue-500 pl-4" dir="ltr">
                            <h4 className="text-sm font-bold text-gray-500 mb-2">English</h4>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">{faq.questionEn}</h3>
                            <p className="text-gray-600 leading-relaxed">{faq.answerEn}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => startEdit(faq)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors text-sm font-bold"
                        >
                          تعديل
                        </button>
                        <button
                          onClick={() => handleToggleActive(faq.id, faq.isActive)}
                          disabled={saving}
                          className={`px-4 py-2 rounded-lg transition-colors text-sm font-bold ${
                            faq.isActive === 1
                              ? 'bg-gray-500 hover:bg-gray-600 text-white'
                              : 'bg-green-500 hover:bg-green-600 text-white'
                          }`}
                        >
                          {faq.isActive === 1 ? 'إخفاء' : 'نشر'}
                        </button>
                        <button
                          onClick={() => handleDelete(faq.id)}
                          disabled={saving}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors text-sm font-bold"
                        >
                          حذف
                        </button>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-3">
                      <span className="text-sm text-gray-500">الترتيب:</span>
                      <input
                        type="number"
                        value={faq.displayOrder}
                        onChange={(e) => handleReorder(faq.id, parseInt(e.target.value) || 0)}
                        className="w-20 px-3 py-1 border border-gray-300 rounded-lg text-center"
                        min="0"
                      />
                      <button
                        onClick={() => handleReorder(faq.id, faq.displayOrder - 1)}
                        disabled={saving || faq.displayOrder <= 1}
                        className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-lg text-sm disabled:opacity-50"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => handleReorder(faq.id, faq.displayOrder + 1)}
                        disabled={saving}
                        className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-lg text-sm"
                      >
                        ↓
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {faqs.length === 0 && !isAddingNew && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">❓</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">لا توجد أسئلة شائعة</h3>
            <p className="text-gray-600 mb-6">ابدأ بإضافة أول سؤال للمستخدمين</p>
            <button
              onClick={() => setIsAddingNew(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-bold transition-all"
            >
              إضافة سؤال جديد
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
