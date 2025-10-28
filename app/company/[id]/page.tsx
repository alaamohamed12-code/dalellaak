"use client";
import { useEffect, useState } from 'react';
import Header from '../../../components/layout/Header';
import { useLang } from '../../../components/layout/Providers';
import { getCompanyDisplayName } from '../../../lib/transliteration';
import { getProfileImageUrl } from '../../../lib/image-utils';
import { useRouter } from 'next/navigation';
export default function CompanyProfilePage({ params }: { params: { id: string } }) {
  const { lang } = useLang();
  const [company, setCompany] = useState<any>(null);
  const [works, setWorks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWork, setSelectedWork] = useState<any>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [showMessage, setShowMessage] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [msgError, setMsgError] = useState('');
  const [msgLoading, setMsgLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('work');
  const [completedProjects, setCompletedProjects] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewStats, setReviewStats] = useState<any>(null);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [userReview, setUserReview] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    let url = `/api/company-profile?id=${params.id}`;
    if (typeof window !== 'undefined') {
      const u = localStorage.getItem('user');
      if (u) {
        const user = JSON.parse(u);
        if (user && user.accountType === 'company' && String(user.id) === String(params.id)) {
          url += `&username=${encodeURIComponent(user.username)}`;
        }
      }
    }
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (!data.company) {
          setCompany('notfound');
          setLoading(false);
          setTimeout(() => router.push('/'), 3500);
          return;
        }
        setCompany(data.company);
        setWorks(data.works || []);
        setCompletedProjects(data.completedProjects || []);
        setLoading(false);
      });
  }, [params.id]);

  // Fetch reviews
  useEffect(() => {
    fetch(`/api/reviews?companyId=${params.id}`)
      .then(res => res.json())
      .then(data => {
        setReviews(data.reviews || []);
        setReviewStats(data.stats);
        
        // Check if current user has already reviewed
        if (typeof window !== 'undefined') {
          const u = localStorage.getItem('user');
          if (u) {
            const user = JSON.parse(u);
            const existingReview = data.reviews?.find((r: any) => r.userId === user.id);
            setUserReview(existingReview);
          }
        }
      })
      .catch(err => console.error('Error fetching reviews:', err));
  }, [params.id]);

  // Submit review
  const handleSubmitReview = async () => {
    const u = localStorage.getItem('user');
    if (!u) {
      router.push('/login');
      return;
    }
    const user = JSON.parse(u);
    
    if (user.accountType !== 'individual') {
      alert(lang === 'ar' ? 'يمكن للأفراد فقط تقييم الشركات' : 'Only individuals can review companies');
      return;
    }

    if (!newReview.comment.trim()) {
      alert(lang === 'ar' ? 'الرجاء كتابة تعليق' : 'Please write a comment');
      return;
    }

    setReviewLoading(true);
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: params.id,
          userId: user.id,
          userFirstName: user.firstName,
          userLastName: user.lastName,
          rating: newReview.rating,
          comment: newReview.comment
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        alert(lang === 'ar' ? 'تم إضافة التقييم بنجاح!' : 'Review added successfully!');
        // Refresh reviews
        window.location.reload();
      } else {
        alert(data.error || (lang === 'ar' ? 'فشل في إضافة التقييم' : 'Failed to add review'));
      }
    } catch (error) {
      alert(lang === 'ar' ? 'حدث خطأ' : 'An error occurred');
    } finally {
      setReviewLoading(false);
    }
  };

  return (
    <>
      <Header navOnlyHome />
      <main className="min-h-screen bg-gray-50">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">جاري التحميل...</p>
          </div>
        ) : company === 'notfound' ? (
          <div className="text-center py-20 text-red-500">الشركة غير موجودة أو تم حذفها أو لم تعد مقبولة. سيتم إعادتك للصفحة الرئيسية خلال ثوانٍ...</div>
        ) : !company ? (
          <div className="text-center py-20 text-red-500">جاري التحقق من بيانات الشركة...</div>
        ) : (
          <>
            {/* Hero Section with Gradient Background */}
            <div className="relative bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-400 rounded-full filter blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400 rounded-full filter blur-3xl"></div>
              </div>
              
              <div className="relative max-w-7xl mx-auto px-6 py-16">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                  {/* Profile Image */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full opacity-75 group-hover:opacity-100 transition-opacity blur-xl"></div>
                    <img 
                      src={getProfileImageUrl(company.image)} 
                      alt={getCompanyDisplayName(company, lang)} 
                      className="relative w-40 h-40 md:w-48 md:h-48 rounded-full object-cover border-4 border-white shadow-2xl"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/profile-images/default-avatar.svg';
                      }}
                    />
                  </div>

                  {/* Company Info */}
                  <div className="flex-1 text-center md:text-right">
                    <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-cyan-200">
                      {getCompanyDisplayName(company, lang)}
                    </h1>
                    {/* Action Buttons - Top aligned with name on desktop */}
                    <div className="hidden md:flex gap-3 justify-center md:justify-end mb-2">
                      <button
                        onClick={() => {
                          const u = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
                          if (!u) {
                            router.push('/login');
                            return;
                          }
                          const parsed = JSON.parse(u);
                          if (parsed.accountType !== 'individual') {
                            alert(lang === 'ar' ? 'يمكن للأفراد فقط مراسلة الشركات.' : 'Only individuals can message companies.');
                            return;
                          }
                          setShowMessage(true);
                        }}
                        className="px-8 py-3 bg-white text-blue-900 font-bold rounded-full hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        {lang === 'ar' ? 'مراسلة الشركة' : 'Message Company'}
                      </button>
                    </div>
                    
                    {/* Large Rating Display - Above Badges */}
                    {company.rating > 0 && (
                      <div className="flex items-center justify-center md:justify-end gap-4 mb-3">
                        <div className="flex flex-col items-center md:items-end">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-5xl font-bold text-yellow-400">{company.rating.toFixed(1)}</span>
                            <svg className="w-10 h-10 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </div>
                          <div className="flex gap-1 mb-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg
                                key={star}
                                className={`w-5 h-5 ${
                                  star <= Math.round(company.rating)
                                    ? 'text-yellow-400'
                                    : 'text-gray-400'
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <span className="text-sm text-gray-300">
                            {lang === 'ar' ? 'بناءً على' : 'Based on'} {company.reviewCount || 0} {lang === 'ar' ? 'تقييم' : 'reviews'}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {/* Tags/Badges */}
                    <div className="flex flex-wrap gap-2 justify-center md:justify-end mb-6">
                      {/* Membership Badge */}
                      {company.membershipStatus === 'active' && (
                        <div className="px-5 py-2 bg-gradient-to-r from-purple-500 to-pink-500 backdrop-blur-sm rounded-full text-sm font-bold border-2 border-purple-300 flex items-center gap-2 shadow-lg">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          <span className="text-white">{lang === 'ar' ? 'عضوية نشطة' : 'Active Member'}</span>
                        </div>
                      )}
                      {/* Rating Badge - Prominent Display */}
                      {company.rating > 0 && (
                        <div className="px-5 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 backdrop-blur-sm rounded-full text-sm font-bold border-2 border-yellow-300 flex items-center gap-2 shadow-lg">
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-white text-lg">{company.rating.toFixed(1)}</span>
                          <span className="text-white/90 text-xs">
                            ({company.reviewCount || 0} {lang === 'ar' ? 'تقييم' : 'reviews'})
                          </span>
                        </div>
                      )}
                      <span className="px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium border border-white/30">
                        {lang === 'ar' ? 'شركة محترفة' : 'Professional Company'}
                      </span>
                      <span className="px-4 py-1.5 bg-green-500/30 backdrop-blur-sm rounded-full text-sm font-medium border border-green-400/50 flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                        {lang === 'ar' ? 'متاح الآن' : 'Available Now'}
                      </span>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-2 mb-4 text-gray-200">
                      <div className="flex items-center gap-2 justify-center md:justify-end">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span>{company.email}</span>
                      </div>
                      <div className="flex items-center gap-2 justify-center md:justify-end">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span className="phone-number">{company.phone}</span>
                      </div>
                      
                      {/* Rating Display - Large Format */}
                      {company.rating > 0 && (
                        <div className="flex items-center gap-3 justify-center md:justify-end mt-2">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg
                                key={star}
                                className={`w-6 h-6 ${
                                  star <= Math.round(company.rating)
                                    ? 'text-yellow-400'
                                    : 'text-gray-400'
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <div className="flex flex-col items-start">
                            <span className="text-2xl font-bold text-yellow-400">{company.rating.toFixed(1)}</span>
                            <span className="text-xs text-gray-300">
                              {company.reviewCount || 0} {lang === 'ar' ? 'تقييم' : 'reviews'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex md:hidden gap-3 justify-center">
                      <button
                        onClick={() => {
                          const u = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
                          if (!u) {
                            router.push('/login');
                            return;
                          }
                          const parsed = JSON.parse(u);
                          if (parsed.accountType !== 'individual') {
                            alert(lang === 'ar' ? 'يمكن للأفراد فقط مراسلة الشركات.' : 'Only individuals can message companies.');
                            return;
                          }
                          setShowMessage(true);
                        }}
                        className="px-8 py-3 bg-white text-blue-900 font-bold rounded-full hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        {lang === 'ar' ? 'مراسلة الشركة' : 'Message Company'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
              <div className="max-w-7xl mx-auto px-6">
                <nav className="flex gap-8">
                  <button
                    onClick={() => setActiveTab('work')}
                    className={`py-4 px-2 font-semibold transition-colors relative ${
                      activeTab === 'work'
                        ? 'text-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {lang === 'ar' ? 'الأعمال' : 'Work'}
                    {activeTab === 'work' && (
                      <div className="absolute bottom-0 right-0 left-0 h-1 bg-blue-600 rounded-t-full"></div>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab('services')}
                    className={`py-4 px-2 font-semibold transition-colors relative ${
                      activeTab === 'services'
                        ? 'text-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {lang === 'ar' ? 'الخدمات' : 'Services'}
                    {activeTab === 'services' && (
                      <div className="absolute bottom-0 right-0 left-0 h-1 bg-blue-600 rounded-t-full"></div>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab('completed')}
                    className={`py-4 px-2 font-semibold transition-colors relative ${
                      activeTab === 'completed'
                        ? 'text-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {lang === 'ar' ? 'الأعمال المنتهية' : 'Completed Projects'}
                    {activeTab === 'completed' && (
                      <div className="absolute bottom-0 right-0 left-0 h-1 bg-blue-600 rounded-t-full"></div>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab('about')}
                    className={`py-4 px-2 font-semibold transition-colors relative ${
                      activeTab === 'about'
                        ? 'text-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {lang === 'ar' ? 'عن الشركة' : 'About'}
                    {activeTab === 'about' && (
                      <div className="absolute bottom-0 right-0 left-0 h-1 bg-blue-600 rounded-t-full"></div>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab('reviews')}
                    className={`py-4 px-2 font-semibold transition-colors relative ${
                      activeTab === 'reviews'
                        ? 'text-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {lang === 'ar' ? 'التقييمات' : 'Reviews'}
                    {activeTab === 'reviews' && (
                      <div className="absolute bottom-0 right-0 left-0 h-1 bg-blue-600 rounded-t-full"></div>
                    )}
                  </button>
                </nav>
              </div>
            </div>

            {/* Tab Content */}
            <div className="max-w-7xl mx-auto px-6 py-12">
              {/* Work Tab */}
              {activeTab === 'work' && (
                <div className="animate-fadeIn">
                  <h2 className="text-3xl font-bold mb-8 text-gray-900">
                    {lang === 'ar' ? 'أعمالنا' : 'Our Work'}
                  </h2>
                  {works.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
                      <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <p className="text-gray-500 text-lg">{lang === 'ar' ? 'لا توجد أعمال مضافة بعد' : 'No work added yet'}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {works.map(work => (
                        <div
                          key={work.id}
                          className="group cursor-pointer"
                          onClick={() => {
                            setSelectedWork(work);
                            setCarouselIndex(0);
                          }}
                        >
                          <div className="relative overflow-hidden rounded-2xl bg-white shadow-md hover:shadow-2xl transition-all duration-300 transform group-hover:scale-[1.02]">
                            <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                              {(() => {
                                const mediaArr = JSON.parse(work.media || '[]');
                                const file = mediaArr[0];
                                if (!file) return <div className="w-full h-full flex items-center justify-center text-gray-400">No media</div>;
                                if (file.match(/\.(mp4|webm|ogg)$/i)) {
                                  return <video src={`/company-works/${file}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />;
                                } else {
                                  return <img src={`/company-works/${file}`} alt={work.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />;
                                }
                              })()}
                            </div>
                            <div className="p-6">
                              <h3 className="text-xl font-bold mb-2 text-gray-900 group-hover:text-blue-600 transition-colors">
                                {work.title}
                              </h3>
                              <p className="text-gray-600 line-clamp-2">
                                {work.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Services Tab */}
              {activeTab === 'services' && (
                <div className="animate-fadeIn">
                  <h2 className="text-3xl font-bold mb-8 text-gray-900">
                    {lang === 'ar' ? 'خدماتنا' : 'Our Services'}
                  </h2>
                  <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                    <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-500 text-lg">
                      {lang === 'ar' ? 'قريباً - سيتم إضافة تفاصيل الخدمات' : 'Coming soon - Services details will be added'}
                    </p>
                  </div>
                </div>
              )}

              {/* Completed Projects Tab */}
              {activeTab === 'completed' && (
                <div className="animate-fadeIn">
                  <h2 className="text-3xl font-bold mb-8 text-gray-900">
                    {lang === 'ar' ? 'الأعمال المنتهية' : 'Completed Projects'}
                  </h2>
                  {completedProjects.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
                      <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-gray-500 text-lg">
                        {lang === 'ar' ? 'لا توجد أعمال منتهية مضافة بعد' : 'No completed projects added yet'}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {completedProjects.map(project => (
                        <div
                          key={project.id}
                          className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] overflow-hidden"
                        >
                          {/* Project Image */}
                          <div className="aspect-[4/3] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 relative">
                            {project.image ? (
                              <img 
                                src={`/completed-projects/${project.image}`} 
                                alt={project.title} 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = '/placeholder-project.jpg';
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <svg className="w-20 h-20 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                            {/* Completed Badge */}
                            <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              {lang === 'ar' ? 'منتهي' : 'Completed'}
                            </div>
                          </div>
                          
                          {/* Project Info */}
                          <div className="p-6">
                            <h3 className="text-xl font-bold mb-2 text-gray-900 group-hover:text-blue-600 transition-colors">
                              {project.title}
                            </h3>
                            <p className="text-gray-600 line-clamp-3 mb-4 leading-relaxed">
                              {project.description}
                            </p>
                            
                            {/* Project Meta */}
                            {project.completedDate && (
                              <div className="flex items-center gap-2 text-sm text-gray-500 border-t pt-3">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span>
                                  {lang === 'ar' ? 'تم الإنتهاء:' : 'Completed:'} {new Date(project.completedDate).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* About Tab */}
              {activeTab === 'about' && (
                <div className="animate-fadeIn">
                  <h2 className="text-3xl font-bold mb-8 text-gray-900">
                    {lang === 'ar' ? 'عن الشركة' : 'About Company'}
                  </h2>
                  <div className="bg-white rounded-2xl shadow-sm p-12">
                    <div className="max-w-3xl">
                      <div className="space-y-6 text-gray-700 leading-relaxed">
                        <p className="text-lg">
                          {company.description || (lang === 'ar' ? 'لم يتم إضافة وصف للشركة بعد.' : 'No company description added yet.')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Reviews Tab */}
              {activeTab === 'reviews' && (
                <div className="animate-fadeIn space-y-8">
                  {/* Rating Summary */}
                  {reviewStats && reviewStats.totalReviews > 0 && (
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8">
                      <div className="grid md:grid-cols-2 gap-8">
                        {/* Overall Rating */}
                        <div className="text-center">
                          <div className="text-6xl font-bold text-blue-600 mb-2">
                            {reviewStats.avgRating}
                          </div>
                          <div className="flex justify-center gap-1 mb-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg
                                key={star}
                                className={`w-6 h-6 ${
                                  star <= Math.round(reviewStats.avgRating)
                                    ? 'text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <div className="text-gray-600">
                            {lang === 'ar' ? 'بناءً على' : 'Based on'} {reviewStats.totalReviews} {lang === 'ar' ? 'تقييم' : 'reviews'}
                          </div>
                        </div>

                        {/* Rating Distribution */}
                        <div className="space-y-2">
                          {[5, 4, 3, 2, 1].map((star) => {
                            const count = reviewStats.distribution[star] || 0;
                            const percentage = reviewStats.totalReviews > 0 
                              ? (count / reviewStats.totalReviews) * 100 
                              : 0;
                            return (
                              <div key={star} className="flex items-center gap-3">
                                <span className="text-sm font-medium text-gray-700 w-12">
                                  {star} {lang === 'ar' ? 'نجوم' : 'stars'}
                                </span>
                                <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 transition-all duration-500"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                                <span className="text-sm text-gray-600 w-8">{count}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Add Review Form */}
                  {!userReview && (
                    <div className="bg-white rounded-2xl shadow-sm p-8">
                      <h3 className="text-2xl font-bold mb-6 text-gray-900">
                        {lang === 'ar' ? 'أضف تقييمك' : 'Add Your Review'}
                      </h3>
                      
                      {/* Star Rating Input */}
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          {lang === 'ar' ? 'التقييم' : 'Rating'}
                        </label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => setNewReview({ ...newReview, rating: star })}
                              className="transition-transform hover:scale-110"
                            >
                              <svg
                                className={`w-10 h-10 ${
                                  star <= newReview.rating
                                    ? 'text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Comment Input */}
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          {lang === 'ar' ? 'التعليق' : 'Comment'}
                        </label>
                        <textarea
                          value={newReview.comment}
                          onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                          placeholder={lang === 'ar' ? 'اكتب تعليقك هنا...' : 'Write your comment here...'}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          rows={4}
                        />
                      </div>

                      <button
                        onClick={handleSubmitReview}
                        disabled={reviewLoading}
                        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        {reviewLoading 
                          ? (lang === 'ar' ? 'جارٍ الإضافة...' : 'Adding...') 
                          : (lang === 'ar' ? 'إضافة التقييم' : 'Add Review')
                        }
                      </button>
                    </div>
                  )}

                  {/* User's Existing Review */}
                  {userReview && (
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-lg font-bold text-blue-900">
                          {lang === 'ar' ? 'تقييمك' : 'Your Review'}
                        </h3>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                              key={star}
                              className={`w-5 h-5 ${
                                star <= userReview.rating
                                  ? 'text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{userReview.comment}</p>
                      <p className="text-sm text-gray-500 mt-3">
                        {new Date(userReview.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  )}

                  {/* Reviews List */}
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-gray-900">
                      {lang === 'ar' ? 'جميع التقييمات' : 'All Reviews'}
                    </h3>
                    {reviews.length === 0 ? (
                      <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                        <p className="text-gray-500 text-lg">
                          {lang === 'ar' ? 'لا توجد تقييمات بعد' : 'No reviews yet'}
                        </p>
                        <p className="text-gray-400 mt-2">
                          {lang === 'ar' ? 'كن أول من يقيم هذه الشركة!' : 'Be the first to review this company!'}
                        </p>
                      </div>
                    ) : (
                      reviews.map((review) => (
                        <div key={review.id} className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h4 className="font-bold text-gray-900">
                                {review.userFirstName} {review.userLastName}
                              </h4>
                              <p className="text-sm text-gray-500">
                                {new Date(review.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </p>
                            </div>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <svg
                                  key={star}
                                  className={`w-5 h-5 ${
                                    star <= review.rating
                                      ? 'text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Work Details Modal - Enhanced */}
            {selectedWork && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto relative animate-fadeIn">
                  <button
                    className="sticky top-4 float-left ml-4 z-10 w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-lg text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
                    onClick={() => setSelectedWork(null)}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  
                  <div className="p-8 md:p-12">
                    <h3 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">{selectedWork.title}</h3>
                    <p className="text-gray-600 text-lg mb-8 leading-relaxed whitespace-pre-line">{selectedWork.description}</p>
                    
                    {/* Main Image/Video Display */}
                    <div className="mb-8">
                      <div className="relative bg-gray-100 rounded-2xl overflow-hidden">
                        <div className="aspect-video flex items-center justify-center">
                          {(() => {
                            const mediaArr = JSON.parse(selectedWork.media || '[]');
                            const file = mediaArr[carouselIndex];
                            if (!file) return null;
                            if (file.match(/\.(mp4|webm|ogg)$/i)) {
                              return <video src={`/company-works/${file}`} controls className="w-full h-full object-contain" />;
                            } else {
                              return <img src={`/company-works/${file}`} alt="media" className="w-full h-full object-contain" />;
                            }
                          })()}
                        </div>
                        
                        {/* Navigation Arrows */}
                        {JSON.parse(selectedWork.media || '[]').length > 1 && (
                          <>
                            <button
                              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-white/90 hover:bg-white rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                              onClick={() => setCarouselIndex(i => Math.max(0, i - 1))}
                              disabled={carouselIndex === 0}
                            >
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                              </svg>
                            </button>
                            <button
                              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-white/90 hover:bg-white rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                              onClick={() => setCarouselIndex(i => Math.min(JSON.parse(selectedWork.media || '[]').length - 1, i + 1))}
                              disabled={carouselIndex === JSON.parse(selectedWork.media || '[]').length - 1}
                            >
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Thumbnail Grid */}
                    {JSON.parse(selectedWork.media || '[]').length > 1 && (
                      <div className="flex gap-3 overflow-x-auto pb-2">
                        {JSON.parse(selectedWork.media || '[]').map((file: string, i: number) => (
                          <button
                            key={i}
                            className={`flex-shrink-0 w-24 h-20 rounded-xl overflow-hidden border-3 transition-all ${
                              i === carouselIndex 
                                ? 'border-blue-600 ring-2 ring-blue-600 ring-offset-2' 
                                : 'border-gray-200 hover:border-gray-400'
                            }`}
                            onClick={() => setCarouselIndex(i)}
                          >
                            {file.match(/\.(mp4|webm|ogg)$/i) ? (
                              <video src={`/company-works/${file}`} className="w-full h-full object-cover" />
                            ) : (
                              <img src={`/company-works/${file}`} alt="thumbnail" className="w-full h-full object-cover" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Message Company Modal */}
      {showMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowMessage(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold">{lang === 'ar' ? 'مراسلة الشركة' : 'Message Company'}</h3>
              <button className="text-2xl leading-none" onClick={() => setShowMessage(false)}>×</button>
            </div>
            <textarea
              className="w-full border rounded-lg p-3 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-cyan-400"
              placeholder={lang === 'ar' ? 'اكتب رسالتك هنا...' : 'Write your message here...'}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
            />
            {msgError && <div className="text-red-600 text-sm mt-2">{msgError}</div>}
            <div className="flex justify-end gap-2 mt-4">
              <button className="px-4 py-2 rounded-full bg-gray-200" onClick={() => setShowMessage(false)}>{lang === 'ar' ? 'إلغاء' : 'Cancel'}</button>
              <button
                className="px-4 py-2 rounded-full bg-cyan-600 text-white font-bold disabled:opacity-60"
                disabled={msgLoading || messageText.trim().length === 0}
                onClick={async () => {
                  setMsgError('');
                  if (messageText.trim().length === 0) return;
                  const u = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
                  if (!u) { router.push('/login'); return; }
                  
                  const user = JSON.parse(u);
                  
                  // Check if user.id exists, if not, user needs to re-login
                  if (!user.id) {
                    setMsgError(lang === 'ar' ? 'يجب تسجيل الدخول مرة أخرى' : 'Please login again');
                    setTimeout(() => {
                      localStorage.removeItem('user');
                      router.push('/login');
                    }, 2000);
                    return;
                  }
                  
                  if (user.accountType !== 'individual') { 
                    setMsgError(lang === 'ar' ? 'يمكن للأفراد فقط الإرسال' : 'Only individuals can send'); 
                    return; 
                  }
                  
                  const payload = {
                    userId: Number(user.id),
                    companyId: Number(params.id),
                    senderType: 'user',
                    senderId: Number(user.id),
                    text: messageText.trim(),
                  };
                  
                  console.log('📤 رسالة الإرسال:', payload);
                  console.log('user.id:', user.id, 'type:', typeof user.id);
                  console.log('params.id:', params.id, 'type:', typeof params.id);
                  
                  try {
                    setMsgLoading(true);
                    const res = await fetch('/api/messages', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(payload),
                    });
                    const data = await res.json();
                    if (!res.ok) {
                      setMsgError(data.error || (lang === 'ar' ? 'فشل إرسال الرسالة' : 'Failed to send message'));
                    } else {
                      // Show success message briefly
                      const successMsg = lang === 'ar' ? '✅ تم إرسال الرسالة بنجاح!' : '✅ Message sent successfully!';
                      setMsgError(''); // Clear any previous errors
                      
                      // Create a temporary success div
                      const successDiv = document.createElement('div');
                      successDiv.className = 'fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg font-bold animate-bounce';
                      successDiv.textContent = successMsg;
                      document.body.appendChild(successDiv);
                      
                      // Remove success message after animation
                      setTimeout(() => {
                        successDiv.remove();
                      }, 2000);
                      
                      setShowMessage(false);
                      setMessageText('');
                      
                      // Add small delay to ensure DB commit, then navigate with conversation ID
                      setTimeout(() => {
                        // Pass conversation ID and force refresh
                        const convId = data.conversation?.id;
                        if (convId) {
                          router.push(`/messages?conv=${convId}&refresh=${Date.now()}`);
                        } else {
                          router.push(`/messages?refresh=${Date.now()}`);
                        }
                      }, 500);
                    }
                  } catch (e: any) {
                    setMsgError(lang === 'ar' ? 'خطأ في الاتصال' : 'Network error');
                  } finally {
                    setMsgLoading(false);
                  }
                }}
              >
                {msgLoading ? (lang === 'ar' ? 'جارٍ الإرسال...' : 'Sending...') : (lang === 'ar' ? 'إرسال' : 'Send')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
