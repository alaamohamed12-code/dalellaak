'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface HeroContent {
  title: string;
  subtitle: string;
  description: string;
  cashback: string;
  ctaText: string;
  backgroundImage: string;
}

interface Feature {
  icon: string;
  title: string;
  description: string;
}

interface FeaturesContent {
  title: string;
  items: Feature[];
}

interface StatisticsContent {
  companies: { count: string; label: string };
  projects: { count: string; label: string };
  users: { count: string; label: string };
  cashback: { count: string; label: string };
}

interface Step {
  number: string;
  title: string;
  description: string;
}

interface HowItWorksContent {
  title: string;
  steps: Step[];
}

export default function HomeContentManagement() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'hero' | 'features' | 'statistics' | 'howItWorks'>('hero');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Content states
  const [heroContent, setHeroContent] = useState<HeroContent>({
    title: '',
    subtitle: '',
    description: '',
    cashback: '',
    ctaText: '',
    backgroundImage: ''
  });

  const [featuresContent, setFeaturesContent] = useState<FeaturesContent>({
    title: '',
    items: []
  });

  const [statisticsContent, setStatisticsContent] = useState<StatisticsContent>({
    companies: { count: '', label: '' },
    projects: { count: '', label: '' },
    users: { count: '', label: '' },
    cashback: { count: '', label: '' }
  });

  const [howItWorksContent, setHowItWorksContent] = useState<HowItWorksContent>({
    title: '',
    steps: []
  });

  useEffect(() => {
    const adminStr = localStorage.getItem('admin');
    if (!adminStr) {
      router.push('/admin-panel/login');
      return;
    }
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const response = await fetch('/api/home-content');
      if (!response.ok) throw new Error('فشل في تحميل البيانات');
      
      const data = await response.json();
      
      // Load each section
      data.forEach((item: any) => {
        const content = JSON.parse(item.content);
        switch(item.section) {
          case 'hero':
            setHeroContent(content);
            break;
          case 'features':
            setFeaturesContent(content);
            break;
          case 'statistics':
            setStatisticsContent(content);
            break;
          case 'howItWorks':
            setHowItWorksContent(content);
            break;
        }
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading content:', error);
      setMessage({ type: 'error', text: 'حدث خطأ في تحميل المحتوى' });
      setLoading(false);
    }
  };

  const saveSection = async (section: string, content: any) => {
    setSaving(true);
    setMessage(null);
    
    try {
      const response = await fetch('/api/home-content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section, content })
      });

      if (!response.ok) throw new Error('فشل في حفظ التعديلات');
      
      setMessage({ type: 'success', text: 'تم حفظ التعديلات بنجاح! ✅' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error saving:', error);
      setMessage({ type: 'error', text: 'حدث خطأ في حفظ التعديلات' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveHero = () => saveSection('hero', heroContent);
  const handleSaveFeatures = () => saveSection('features', featuresContent);
  const handleSaveStatistics = () => saveSection('statistics', statisticsContent);
  const handleSaveHowItWorks = () => saveSection('howItWorks', howItWorksContent);

  const addFeature = () => {
    setFeaturesContent({
      ...featuresContent,
      items: [...featuresContent.items, { icon: '⭐', title: '', description: '' }]
    });
  };

  const removeFeature = (index: number) => {
    setFeaturesContent({
      ...featuresContent,
      items: featuresContent.items.filter((_, i) => i !== index)
    });
  };

  const updateFeature = (index: number, field: keyof Feature, value: string) => {
    const newItems = [...featuresContent.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFeaturesContent({ ...featuresContent, items: newItems });
  };

  const addStep = () => {
    const nextNumber = (howItWorksContent.steps.length + 1).toString();
    setHowItWorksContent({
      ...howItWorksContent,
      steps: [...howItWorksContent.steps, { number: nextNumber, title: '', description: '' }]
    });
  };

  const removeStep = (index: number) => {
    setHowItWorksContent({
      ...howItWorksContent,
      steps: howItWorksContent.steps.filter((_, i) => i !== index)
    });
  };

  const updateStep = (index: number, field: keyof Step, value: string) => {
    const newSteps = [...howItWorksContent.steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setHowItWorksContent({ ...howItWorksContent, steps: newSteps });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل المحتوى...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">إدارة محتوى الصفحة الرئيسية</h1>
          <p className="text-gray-600">تحكم في جميع أقسام الصفحة الرئيسية من هنا</p>
        </motion.div>

        {/* Message Alert */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </motion.div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {[
              { id: 'hero', label: 'قسم البطل (Hero)', icon: '🎯' },
              { id: 'features', label: 'المميزات', icon: '✨' },
              { id: 'statistics', label: 'الإحصائيات', icon: '📊' },
              { id: 'howItWorks', label: 'كيف يعمل', icon: '🔄' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 px-6 py-4 font-semibold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-8">
            {/* Hero Tab */}
            {activeTab === 'hero' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-4">قسم البطل (Hero Section)</h2>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">العنوان الرئيسي</label>
                  <input
                    type="text"
                    value={heroContent.title}
                    onChange={(e) => setHeroContent({ ...heroContent, title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="دليلك للأفضل في التصميم والبناء"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">العنوان الفرعي</label>
                  <input
                    type="text"
                    value={heroContent.subtitle}
                    onChange={(e) => setHeroContent({ ...heroContent, subtitle: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="أكبر منصة تربطك بأفضل الشركات"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">الوصف</label>
                  <textarea
                    value={heroContent.description}
                    onChange={(e) => setHeroContent({ ...heroContent, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="نشاركك رحلة التصميم والبناء..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">نص الكاش باك</label>
                  <input
                    type="text"
                    value={heroContent.cashback}
                    onChange={(e) => setHeroContent({ ...heroContent, cashback: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="استمتع بكاش باك 2% فور إتمام التعاقد 💰"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">نص زر الدعوة للإجراء (CTA)</label>
                  <input
                    type="text"
                    value={heroContent.ctaText}
                    onChange={(e) => setHeroContent({ ...heroContent, ctaText: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="استكشف الخدمات"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">صورة الخلفية (رابط)</label>
                  <input
                    type="text"
                    value={heroContent.backgroundImage}
                    onChange={(e) => setHeroContent({ ...heroContent, backgroundImage: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="/hero-bg.jpg"
                  />
                </div>

                <button
                  onClick={handleSaveHero}
                  disabled={saving}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                </button>
              </motion.div>
            )}

            {/* Features Tab */}
            {activeTab === 'features' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">قسم المميزات</h2>
                  <button
                    onClick={addFeature}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    + إضافة ميزة
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">عنوان القسم</label>
                  <input
                    type="text"
                    value={featuresContent.title}
                    onChange={(e) => setFeaturesContent({ ...featuresContent, title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="لماذا تختار منصتنا؟"
                  />
                </div>

                <div className="space-y-4">
                  {featuresContent.items.map((feature, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-semibold text-gray-700">ميزة #{index + 1}</span>
                        <button
                          onClick={() => removeFeature(index)}
                          className="text-red-600 hover:text-red-800 font-bold"
                        >
                          حذف
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={feature.icon}
                          onChange={(e) => updateFeature(index, 'icon', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="أيقونة (emoji)"
                        />
                        <input
                          type="text"
                          value={feature.title}
                          onChange={(e) => updateFeature(index, 'title', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="عنوان الميزة"
                        />
                        <textarea
                          value={feature.description}
                          onChange={(e) => updateFeature(index, 'description', e.target.value)}
                          rows={2}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="وصف الميزة"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleSaveFeatures}
                  disabled={saving}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-colors disabled:bg-gray-400"
                >
                  {saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                </button>
              </motion.div>
            )}

            {/* Statistics Tab */}
            {activeTab === 'statistics' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-4">قسم الإحصائيات</h2>

                {[
                  { key: 'companies', label: 'الشركات' },
                  { key: 'projects', label: 'المشاريع' },
                  { key: 'users', label: 'المستخدمين' },
                  { key: 'cashback', label: 'الكاش باك' }
                ].map((stat) => (
                  <div key={stat.key} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <h3 className="font-semibold text-gray-700 mb-3">{stat.label}</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">الرقم</label>
                        <input
                          type="text"
                          value={statisticsContent[stat.key as keyof StatisticsContent].count}
                          onChange={(e) => setStatisticsContent({
                            ...statisticsContent,
                            [stat.key]: { ...statisticsContent[stat.key as keyof StatisticsContent], count: e.target.value }
                          })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="500+"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">النص</label>
                        <input
                          type="text"
                          value={statisticsContent[stat.key as keyof StatisticsContent].label}
                          onChange={(e) => setStatisticsContent({
                            ...statisticsContent,
                            [stat.key]: { ...statisticsContent[stat.key as keyof StatisticsContent], label: e.target.value }
                          })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="شركة معتمدة"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={handleSaveStatistics}
                  disabled={saving}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-colors disabled:bg-gray-400"
                >
                  {saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                </button>
              </motion.div>
            )}

            {/* How It Works Tab */}
            {activeTab === 'howItWorks' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">قسم كيف يعمل</h2>
                  <button
                    onClick={addStep}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    + إضافة خطوة
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">عنوان القسم</label>
                  <input
                    type="text"
                    value={howItWorksContent.title}
                    onChange={(e) => setHowItWorksContent({ ...howItWorksContent, title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="كيف نساعدك في رحلتك؟"
                  />
                </div>

                <div className="space-y-4">
                  {howItWorksContent.steps.map((step, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-semibold text-gray-700">خطوة #{index + 1}</span>
                        <button
                          onClick={() => removeStep(index)}
                          className="text-red-600 hover:text-red-800 font-bold"
                        >
                          حذف
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={step.number}
                          onChange={(e) => updateStep(index, 'number', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="رقم الخطوة (1، 2، 3...)"
                        />
                        <input
                          type="text"
                          value={step.title}
                          onChange={(e) => updateStep(index, 'title', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="عنوان الخطوة"
                        />
                        <textarea
                          value={step.description}
                          onChange={(e) => updateStep(index, 'description', e.target.value)}
                          rows={2}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="وصف الخطوة"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleSaveHowItWorks}
                  disabled={saving}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-colors disabled:bg-gray-400"
                >
                  {saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
