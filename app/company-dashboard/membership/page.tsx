"use client";
import { useEffect, useState } from 'react';
import Header from '../../../components/layout/Header';
import { useLang } from '../../../components/layout/Providers';
import { useRouter } from 'next/navigation';
import CompanyDashboardNav from '../../../components/company-dashboard/CompanyDashboardNav';

export default function MembershipPage() {
  const { t, lang } = useLang();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [membershipData, setMembershipData] = useState<any>(null);
  const [renewing, setRenewing] = useState(false);

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (!u) {
      router.push('/login');
      return;
    }
    const user = JSON.parse(u);
    if (user.accountType !== 'company') {
      router.push('/');
      return;
    }
    loadMembership();
  }, []);

  const loadMembership = async () => {
    try {
      const u = localStorage.getItem('user');
      if (!u) return;
      const user = JSON.parse(u);

      const res = await fetch(`/api/membership?companyId=${user.id}`);
      const data = await res.json();
      setMembershipData(data);
    } catch (err) {
      console.error('Error loading membership:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRenew = async (days: number) => {
    if (!confirm(lang === 'ar' ? `تجديد العضوية لمدة ${days} يوم؟` : `Renew membership for ${days} days?`)) {
      return;
    }

    try {
      setRenewing(true);
      const u = localStorage.getItem('user');
      if (!u) return;
      const user = JSON.parse(u);

      const res = await fetch('/api/membership/renew', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: user.id,
          days
        })
      });

      const data = await res.json();
      
      if (!res.ok) {
        alert(data.error || (lang === 'ar' ? 'فشل التجديد' : 'Renewal failed'));
        return;
      }

      alert(lang === 'ar' ? 'تم التجديد بنجاح!' : 'Renewed successfully!');
      loadMembership();
    } catch (err) {
      alert(lang === 'ar' ? 'حدث خطأ' : 'An error occurred');
    } finally {
      setRenewing(false);
    }
  };

  const getDaysLeft = () => {
    if (!membershipData?.membershipExpiry) return 0;
    const now = new Date();
    const expiry = new Date(membershipData.membershipExpiry);
    const diff = expiry.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getStatusColor = () => {
    const days = getDaysLeft();
    if (days <= 0) return 'bg-red-500';
    if (days <= 7) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const getStatusText = () => {
    if (membershipData?.membershipStatus !== 'active') {
      return lang === 'ar' ? 'غير نشطة' : 'Inactive';
    }
    const days = getDaysLeft();
    if (days <= 0) return lang === 'ar' ? 'منتهية' : 'Expired';
    return lang === 'ar' ? 'نشطة' : 'Active';
  };

  return (
    <>
      <Header />
      <CompanyDashboardNav />
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              {lang === 'ar' ? 'حالة العضوية' : 'Membership Status'}
            </h1>
            <p className="text-gray-600">
              {lang === 'ar' ? 'إدارة وتجديد عضويتك في الموقع' : 'Manage and renew your site membership'}
            </p>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : membershipData ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Current Status Card */}
              <div className="lg:col-span-2">
                {/* Status Banner - Very Clear */}
                <div className={`${
                  membershipData.membershipStatus === 'active' && getDaysLeft() > 0
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                    : 'bg-gradient-to-r from-red-500 to-orange-600'
                } rounded-2xl shadow-2xl p-6 mb-6 text-white`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {membershipData.membershipStatus === 'active' && getDaysLeft() > 0 ? (
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                      )}
                      <div>
                        <h3 className="text-2xl font-bold mb-1">
                          {membershipData.membershipStatus === 'active' && getDaysLeft() > 0
                            ? (lang === 'ar' ? '✓ عضويتك نشطة' : '✓ Your membership is active')
                            : (lang === 'ar' ? '✗ عضويتك غير نشطة' : '✗ Your membership is inactive')
                          }
                        </h3>
                        <p className="text-white/90">
                          {membershipData.membershipStatus === 'active' && getDaysLeft() > 0
                            ? (lang === 'ar' ? 'حسابك يظهر للعملاء ويمكنك تلقي الطلبات' : 'Your account is visible to customers and can receive requests')
                            : (lang === 'ar' ? 'حسابك مخفي ولن تتلقى طلبات جديدة' : 'Your account is hidden and will not receive new requests')
                          }
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-5xl font-black mb-1">
                        {membershipData.membershipStatus === 'active' && getDaysLeft() > 0 ? getDaysLeft() : '0'}
                      </div>
                      <div className="text-sm font-medium opacity-90">
                        {lang === 'ar' ? 'يوم متبقي' : 'days left'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                  {/* Header with gradient */}
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold">
                          {lang === 'ar' ? 'تفاصيل العضوية' : 'Membership Details'}
                        </h2>
                        <div className={`px-4 py-2 rounded-full ${getStatusColor()} text-white font-bold flex items-center gap-2`}>
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                          {getStatusText()}
                        </div>
                      </div>
                      <div className="text-white/90 text-sm">
                        {lang === 'ar' ? 'عضوية نشطة تتيح لك الظهور في نتائج البحث وتلقي طلبات من العملاء' : 'Active membership allows you to appear in search results and receive customer requests'}
                      </div>
                    </div>
                  </div>

                  {/* Membership Details */}
                  <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      {/* Days Left */}
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-gray-600 text-sm mb-1">
                              {lang === 'ar' ? 'الأيام المتبقية' : 'Days Remaining'}
                            </div>
                            <div className="text-3xl font-bold text-gray-900">
                              {getDaysLeft()} {lang === 'ar' ? 'يوم' : 'days'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Expiry Date */}
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-purple-600 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-gray-600 text-sm mb-1">
                              {lang === 'ar' ? 'تاريخ الانتهاء' : 'Expiry Date'}
                            </div>
                            <div className="text-xl font-bold text-gray-900">
                              {membershipData.membershipExpiry ? 
                                new Date(membershipData.membershipExpiry).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })
                                : lang === 'ar' ? 'غير محدد' : 'Not set'
                              }
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {membershipData.membershipExpiry && (
                      <div className="mb-8">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <span>{lang === 'ar' ? 'وقت العضوية' : 'Membership Time'}</span>
                          <span>{getDaysLeft()} / 30 {lang === 'ar' ? 'يوم' : 'days'}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div 
                            className={`h-full ${getStatusColor()} transition-all duration-500`}
                            style={{ width: `${Math.min(100, Math.max(0, (getDaysLeft() / 30) * 100))}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Warning Message */}
                    {getDaysLeft() <= 7 && getDaysLeft() > 0 && (
                      <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-6">
                        <div className="flex items-center gap-3">
                          <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          <p className="text-orange-800">
                            {lang === 'ar' 
                              ? `تنتهي عضويتك خلال ${getDaysLeft()} أيام. قم بالتجديد للاستمرار في الظهور للعملاء.`
                              : `Your membership expires in ${getDaysLeft()} days. Renew to continue appearing to customers.`
                            }
                          </p>
                        </div>
                      </div>
                    )}

                    {getDaysLeft() <= 0 && (
                      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                        <div className="flex items-center gap-3">
                          <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-red-800 font-semibold">
                            {lang === 'ar' 
                              ? 'عضويتك منتهية! لن تظهر في نتائج البحث. قم بالتجديد الآن.'
                              : 'Your membership has expired! You won\'t appear in search results. Renew now.'
                            }
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Renewal Plans */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">
                    {lang === 'ar' ? 'خطط التجديد' : 'Renewal Plans'}
                  </h3>

                  <div className="space-y-4">
                    {/* 30 Days Plan */}
                    <div className="border-2 border-blue-200 hover:border-blue-500 rounded-xl p-5 transition-all cursor-pointer group"
                      onClick={() => handleRenew(30)}>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {lang === 'ar' ? 'شهر واحد' : '1 Month'}
                          </div>
                          <div className="text-sm text-gray-600">30 {lang === 'ar' ? 'يوم' : 'days'}</div>
                        </div>
                        <div className="text-2xl font-bold text-blue-600">
                          {lang === 'ar' ? 'مجاني' : 'Free'}
                        </div>
                      </div>
                      <button 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50"
                        disabled={renewing}
                      >
                        {renewing ? (lang === 'ar' ? 'جاري التجديد...' : 'Renewing...') : (lang === 'ar' ? 'تجديد' : 'Renew')}
                      </button>
                    </div>

                    {/* 90 Days Plan */}
                    <div className="border-2 border-purple-200 hover:border-purple-500 rounded-xl p-5 transition-all cursor-pointer group relative overflow-hidden"
                      onClick={() => handleRenew(90)}>
                      <div className="absolute top-0 right-0 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                        {lang === 'ar' ? 'الأكثر قيمة' : 'Best Value'}
                      </div>
                      <div className="flex items-center justify-between mb-3 mt-2">
                        <div>
                          <div className="text-lg font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                            {lang === 'ar' ? '3 أشهر' : '3 Months'}
                          </div>
                          <div className="text-sm text-gray-600">90 {lang === 'ar' ? 'يوم' : 'days'}</div>
                        </div>
                        <div className="text-2xl font-bold text-purple-600">
                          {lang === 'ar' ? 'مجاني' : 'Free'}
                        </div>
                      </div>
                      <button 
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50"
                        disabled={renewing}
                      >
                        {renewing ? (lang === 'ar' ? 'جاري التجديد...' : 'Renewing...') : (lang === 'ar' ? 'تجديد' : 'Renew')}
                      </button>
                    </div>

                    {/* 365 Days Plan */}
                    <div className="border-2 border-green-200 hover:border-green-500 rounded-xl p-5 transition-all cursor-pointer group"
                      onClick={() => handleRenew(365)}>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="text-lg font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                            {lang === 'ar' ? 'سنة كاملة' : '1 Year'}
                          </div>
                          <div className="text-sm text-gray-600">365 {lang === 'ar' ? 'يوم' : 'days'}</div>
                        </div>
                        <div className="text-2xl font-bold text-green-600">
                          {lang === 'ar' ? 'مجاني' : 'Free'}
                        </div>
                      </div>
                      <button 
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50"
                        disabled={renewing}
                      >
                        {renewing ? (lang === 'ar' ? 'جاري التجديد...' : 'Renewing...') : (lang === 'ar' ? 'تجديد' : 'Renew')}
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 text-center">
                      {lang === 'ar' 
                        ? 'ملاحظة: التجديد مجاني حالياً كميزة تجريبية'
                        : 'Note: Renewal is currently free as a trial feature'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl">
              <p className="text-gray-500">{lang === 'ar' ? 'لم يتم العثور على بيانات العضوية' : 'Membership data not found'}</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
