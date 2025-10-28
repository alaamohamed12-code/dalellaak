"use client";
import { useState, useEffect } from 'react';
import { useLang } from '../../components/layout/Providers';
import Header from '../../components/layout/Header';
import { getProfileImageUrl } from '../../lib/image-utils';

export default function ProfilePage() {
  const { t } = useLang();
  const [user, setUser] = useState<any>(null);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    username: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    image: undefined as File | undefined
  });
  const [step, setStep] = useState<'edit' | 'verify'>('edit');
  const [verificationCode, setVerificationCode] = useState('');
  const [sentCode, setSentCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      if (!userData) {
        window.location.href = '/login';
        return;
      }
      const parsed = JSON.parse(userData);
      setUser(parsed);
      
      // جلب البيانات الكاملة من قاعدة البيانات
      fetchUserData(parsed.username);
    }
  }, []);

  async function fetchUserData(username: string) {
    try {
      const res = await fetch('/api/user-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setForm({
          firstName: data.user.firstName || '',
          lastName: data.user.lastName || '',
          email: data.user.email || '',
          phone: data.user.phone || '',
          username: data.user.username || '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
          image: undefined
        });
      }
    } catch (err) {
      console.error('خطأ في جلب بيانات المستخدم:', err);
    }
  }

  function handleChange(e: any) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleImageChange(e: any) {
    setForm({ ...form, image: e.target.files?.[0] });
  }

  async function handleSaveChanges(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    // التحقق من كلمة المرور الحالية إذا تم تغيير كلمة المرور
    if (form.newPassword) {
      if (!form.currentPassword) {
        setError('يجب إدخال كلمة المرور الحالية لتغييرها');
        setLoading(false);
        return;
      }
      if (form.newPassword !== form.confirmPassword) {
        setError('كلمات المرور الجديدة غير متطابقة');
        setLoading(false);
        return;
      }
    }

    try {
      // إرسال كود التحقق إلى الإيميل
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const codeRes = await fetch('/api/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, code })
      });
      const codeData = await codeRes.json();
      if (!codeRes.ok) throw new Error(codeData.error || 'فشل إرسال كود التحقق');
      
      setSentCode(code);
      setStep('verify');
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ');
      setLoading(false);
    }
  }

  async function handleVerifyAndUpdate(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (verificationCode !== sentCode) {
      setError('كود التحقق غير صحيح');
      setLoading(false);
      return;
    }

    try {
      // تحديث البيانات
      const hasImage = !!form.image;
      let apiUrl = '/api/update-profile';
      
      if (hasImage) {
        const formData = new FormData();
        formData.append('username', user.username);
        formData.append('firstName', form.firstName);
        formData.append('lastName', form.lastName);
        formData.append('email', form.email);
        formData.append('phone', form.phone);
        formData.append('newUsername', form.username);
        if (form.currentPassword) formData.append('currentPassword', form.currentPassword);
        if (form.newPassword) formData.append('newPassword', form.newPassword);
        if (form.image) formData.append('image', form.image);
        formData.append('accountType', user.accountType || 'individual');

        const res = await fetch(apiUrl, {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'فشل تحديث البيانات');
        
        // تحديث localStorage
        if (typeof window !== 'undefined') {
          const updatedUser = {
            username: form.username,
            image: data.imagePath || user.image,
            accountType: user.accountType
          };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          setUser(updatedUser);
        }
      } else {
        const res = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: user.username,
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            phone: form.phone,
            newUsername: form.username,
            currentPassword: form.currentPassword || undefined,
            newPassword: form.newPassword || undefined,
            accountType: user.accountType || 'individual'
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'فشل تحديث البيانات');
        
        // تحديث localStorage
        if (typeof window !== 'undefined') {
          const updatedUser = {
            username: form.username,
            image: user.image,
            accountType: user.accountType
          };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          setUser(updatedUser);
        }
      }

      setSuccess('تم تحديث البيانات بنجاح!');
      setStep('edit');
      setVerificationCode('');
      setForm({ ...form, currentPassword: '', newPassword: '', confirmPassword: '', image: undefined });
      setLoading(false);
      
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء التحديث');
      setLoading(false);
    }
  }

  if (!user) {
    return <div className="flex justify-center items-center min-h-screen">{t('profile.loading')}</div>;
  }

  return (
    <>
      <Header navOnlyHome />
      <main className="max-w-2xl mx-auto py-6 sm:py-10 px-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8">{t('profile.title')}</h1>
        
        {step === 'edit' ? (
          <form onSubmit={handleSaveChanges} className="bg-white rounded-2xl shadow-xl p-4 sm:p-8 space-y-4 sm:space-y-6">
            <div className="flex justify-center mb-6">
              <div className="relative">
                {user.image && user.image.length > 3 ? (
                  <img 
                    src={getProfileImageUrl(user.image)} 
                    alt={t('profile.editImage')} 
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-cyan-500"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/profile-images/default-avatar.svg';
                    }}
                  />
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-700 font-bold text-2xl border-4 border-cyan-500">
                    <svg xmlns='http://www.w3.org/2000/svg' className='w-12 h-12 sm:w-16 sm:h-16' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z' /></svg>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block mb-2 font-semibold text-sm sm:text-base">{t('profile.editImage')}</label>
              <input type="file" accept="image/*" onChange={handleImageChange} className="input input-bordered w-full min-h-[48px] text-sm" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block mb-2 font-semibold text-sm sm:text-base">{t('profile.firstName')}</label>
                <input type="text" name="firstName" value={form.firstName} onChange={handleChange} className="input input-bordered w-full min-h-[48px]" required />
              </div>
              <div>
                <label className="block mb-2 font-semibold text-sm sm:text-base">{t('profile.lastName')}</label>
                <input type="text" name="lastName" value={form.lastName} onChange={handleChange} className="input input-bordered w-full min-h-[48px]" required />
              </div>
            </div>

            <div>
              <label className="block mb-2 font-semibold text-sm sm:text-base">{t('profile.email')}</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} className="input input-bordered w-full min-h-[48px]" inputMode="email" required />
            </div>

            <div>
              <label className="block mb-2 font-semibold text-sm sm:text-base">{t('profile.phone')}</label>
              <input type="tel" name="phone" value={form.phone} onChange={handleChange} className="input input-bordered w-full min-h-[48px]" inputMode="tel" />
            </div>

            <div>
              <label className="block mb-2 font-semibold text-sm sm:text-base">{t('profile.username')}</label>
              <input type="text" name="username" value={form.username} onChange={handleChange} className="input input-bordered w-full min-h-[48px]" required />
            </div>

            <hr className="my-4 sm:my-6" />
            
            <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">{t('profile.changePassword')}</h3>
            
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-semibold text-orange-800 text-sm sm:text-base">{t('profile.forgotPassword')}</h4>
                  <p className="text-sm text-orange-600">{t('profile.forgotPasswordDesc')}</p>
                </div>
                <button
                  type="button"
                  onClick={() => window.location.href = '/forgot-password'}
                  className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 active:scale-95 text-white px-4 py-2.5 rounded-full text-sm font-bold transition-all min-h-[44px] flex items-center justify-center"
                >
                  {t('profile.forgotPasswordBtn')}
                </button>
              </div>
            </div>
            
            <div>
              <label className="block mb-2 font-semibold text-sm sm:text-base">{t('profile.currentPassword')}</label>
              <input type="password" name="currentPassword" value={form.currentPassword} onChange={handleChange} className="input input-bordered w-full min-h-[48px]" autoComplete="current-password" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block mb-2 font-semibold text-sm sm:text-base">{t('profile.newPassword')}</label>
                <input type="password" name="newPassword" value={form.newPassword} onChange={handleChange} className="input input-bordered w-full min-h-[48px]" autoComplete="new-password" />
              </div>
              <div>
                <label className="block mb-2 font-semibold text-sm sm:text-base">{t('profile.confirmNewPassword')}</label>
                <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} className="input input-bordered w-full min-h-[48px]" autoComplete="new-password" />
              </div>
            </div>

            {error && <div className="text-red-500 text-center text-sm sm:text-base px-2" role="alert">{error}</div>}
            {success && <div className="text-green-600 text-center font-bold text-sm sm:text-base px-2" role="alert">{t('profile.success')}</div>}

            <button type="submit" disabled={loading} className="w-full bg-cyan-600 hover:bg-cyan-700 active:scale-95 text-white font-bold py-3 rounded-full text-base sm:text-lg shadow transition-all disabled:opacity-50 min-h-[48px]">
              {loading ? t('profile.saving') : t('profile.save')}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyAndUpdate} className="bg-white rounded-2xl shadow-xl p-4 sm:p-8 space-y-4 sm:space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-center mb-3 sm:mb-4">{t('profile.verifyTitle')}</h2>
            <p className="text-center text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">{t('profile.verifyDesc')}</p>
            
            <div>
              <label className="block mb-2 font-semibold text-center text-sm sm:text-base">{t('profile.codeLabel')}</label>
              <input 
                type="text" 
                value={verificationCode} 
                onChange={e => setVerificationCode(e.target.value)} 
                className="input input-bordered w-full text-center tracking-widest text-base sm:text-lg min-h-[48px]" 
                placeholder={t('profile.codePlaceholder')}
                inputMode="numeric"
                maxLength={6}
                required 
              />
            </div>

            {error && <div className="text-red-500 text-center text-sm sm:text-base px-2" role="alert">{error}</div>}

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button type="button" onClick={() => setStep('edit')} className="flex-1 bg-gray-500 hover:bg-gray-600 active:scale-95 text-white font-bold py-3 rounded-full text-sm sm:text-base min-h-[48px] transition-all">
                {t('profile.backToEdit')}
              </button>
              <button type="submit" disabled={loading} className="flex-1 bg-green-600 hover:bg-green-700 active:scale-95 text-white font-bold py-3 rounded-full text-sm sm:text-base disabled:opacity-50 min-h-[48px] transition-all">
                {loading ? t('profile.updating') : t('profile.confirmAndSave')}
              </button>
            </div>
          </form>
        )}
      </main>
    </>
  );
}