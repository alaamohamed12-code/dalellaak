"use client";
import { useState, useEffect } from 'react';
import Header from '../../components/layout/Header';
import { useLang } from '../../components/layout/Providers';
import { motion, AnimatePresence } from 'framer-motion';

interface Sector {
  id: number;
  nameAr: string;
  nameEn: string;
}

interface City {
  id: number;
  nameAr: string;
  nameEn: string;
}

export default function SignupPage() {
  const { t, lang } = useLang();
  const [sectorsList, setSectorsList] = useState<Sector[]>([]);
  const [saudiCitiesList, setSaudiCitiesList] = useState<City[]>([]);
  type LangKey = 'ar' | 'en';
  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const emailParam = urlParams?.get('email') || '';
  const [step, setStep] = useState<'form'|'verify'|'pending'>('form');
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: emailParam,
    phone: '',
    username: '',
    password: '',
    accountType: 'individual',
    image: undefined as File | undefined,
    taxDocs: [] as File[],
    code: '',
    sector: '',
    location: ''
  });
  const [error, setError] = useState('');
  const [sentCode, setSentCode] = useState('');

  useEffect(() => {
    // Fetch sectors
    fetch('/api/admin/sectors')
      .then(res => res.json())
      .then(data => {
        if (data.sectors) {
          setSectorsList(data.sectors);
        }
      })
      .catch(err => console.error('Error fetching sectors:', err));

    // Fetch cities for signup only
    fetch('/api/admin/cities?type=signup')
      .then(res => res.json())
      .then(data => {
        if (data.cities) {
          setSaudiCitiesList(data.cities);
        }
      })
      .catch(err => console.error('Error fetching cities:', err));
  }, []);

  function handleChange(e: any) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleFiles(e: any) {
    setForm({ ...form, taxDocs: Array.from(e.target.files) });
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    // تحقق من صحة البيانات
    if (!form.email && !form.username) {
      setError('يجب إدخال البريد الإلكتروني أو اسم المستخدم');
      return;
    }
    if (form.accountType === 'company' && form.taxDocs.length === 0) {
      setError('يجب رفع ملفات السجل التجاري للشركات');
      return;
    }

    // تحقق من وجود البريد أو اسم المستخدم مسبقاً في قاعدة البيانات
    try {
      const checkRes = await fetch('/api/check-duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, username: form.username })
      });
      const checkData = await checkRes.json();
      if (!checkRes.ok) throw new Error(checkData.error || 'فشل التحقق من البيانات');
      if (checkData.duplicate) {
        setError(checkData.message || 'البريد الإلكتروني أو اسم المستخدم مستخدم بالفعل. يمكنك تسجيل الدخول أو استخدام بيانات أخرى.');
        return;
      }

      // لا يتم حفظ المستخدم في قاعدة البيانات الآن، بل بعد التحقق
      // حفظ بيانات التسجيل مؤقتًا في localStorage (أو متغير state)
      if (typeof window !== 'undefined') {
        const tempData = {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          username: form.username,
          password: form.password,
          accountType: form.accountType,
          sector: form.sector,
          location: form.location,
          taxDocsNames: form.taxDocs?.map(f => f.name) || [],
          imageName: form.image?.name || ''
        };
        localStorage.setItem('pendingSignup', JSON.stringify(tempData));
      }

      // أرسل كود التحقق فقط
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const codeRes = await fetch('/api/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, code })
      });
      const codeData = await codeRes.json();
      if (!codeRes.ok) throw new Error(codeData.error || 'فشل إرسال الكود');
      setSentCode(code);
      setStep('verify');
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء التسجيل');
    }
  }

  const [success, setSuccess] = useState('');
  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (form.code === sentCode) {
      // بعد التحقق، أرسل البيانات فعليًا إلى API التسجيل
      let pending = null;
      if (typeof window !== 'undefined') {
        pending = localStorage.getItem('pendingSignup');
      }
      let signupData = { ...form };
      if (pending) {
        try {
          const parsed = JSON.parse(pending);
          // دمج البيانات النصية فقط، والملفات تبقى من form الحالي
          signupData = { 
            ...signupData, 
            firstName: parsed.firstName,
            lastName: parsed.lastName,
            email: parsed.email,
            phone: parsed.phone,
            username: parsed.username,
            password: parsed.password,
            accountType: parsed.accountType,
            sector: parsed.sector || form.sector,
            location: parsed.location || form.location,
            // نعيد استخدام الملفات من state الحالي
            taxDocs: form.taxDocs,
            image: form.image
          };
        } catch {}
      }

      try {
        // تحقق إضافي من البيانات المطلوبة للشركات
        if (signupData.accountType === 'company') {
          if (!signupData.sector || !signupData.location) {
            setError('يجب اختيار القطاع والموقع للشركات');
            return;
          }
          if (!signupData.taxDocs || signupData.taxDocs.length === 0) {
            setError('يجب رفع ملفات السجل التجاري للشركات');
            return;
          }
        }

        let apiUrl = '/api/register';
        let useFormData = !!form.image;
        let requestData: any = {
          firstName: signupData.firstName,
          lastName: signupData.lastName,
          email: signupData.email,
          phone: signupData.phone,
          username: signupData.username,
          password: signupData.password,
          accountType: signupData.accountType
        };

        if (signupData.accountType === 'company' || useFormData) {
          if (signupData.accountType === 'company') apiUrl = '/api/company-register';
          const formData = new FormData();
          Object.keys(requestData).forEach(key => {
            formData.append(key, requestData[key]);
          });
          // إضافة sector و location
          if (signupData.accountType === 'company') {
            formData.append('sector', signupData.sector || '');
            formData.append('location', signupData.location || '');
          }
          if (signupData.image) formData.append('image', signupData.image);
          if (signupData.accountType === 'company' && signupData.taxDocs && signupData.taxDocs.length > 0) {
            signupData.taxDocs.forEach(file => {
              formData.append('taxDocs', file);
            });
          }
          const res = await fetch(apiUrl, {
            method: 'POST',
            body: formData
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'فشل التسجيل');
          
          // حفظ مسار الصورة المُعاد من الـ API
          if (data.imagePath && signupData.accountType === 'individual') {
            signupData.image = data.imagePath;
          }
        } else {
          const res = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData)
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'فشل التسجيل');
        }

        if (signupData.accountType === 'company') {
          setStep('pending');
        } else {
          // حفظ بيانات المستخدم في localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify({ 
              username: signupData.username, 
              image: (typeof signupData.image === 'string') ? signupData.image : '',
              accountType: signupData.accountType || 'individual'
            }));
            localStorage.removeItem('pendingSignup');
          }
          setSuccess(`مرحباً ${signupData.username}! تم تسجيل الحساب بنجاح.`);
          setTimeout(() => {
            window.location.href = '/';
          }, 1800);
        }
      } catch (err: any) {
        setError(err.message || 'حدث خطأ أثناء التسجيل');
      }
    } else {
      setError('الكود غير صحيح');
    }
  }

  return (
    <>
      <Header navOnlyHome />
      <main className="relative min-h-screen flex items-center justify-center px-4 py-12 overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-cyan-50" />
        <div className="pointer-events-none absolute inset-0 opacity-30">
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-0 right-0 w-96 h-96 bg-purple-400 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ scale: [1.2, 1, 1.2], rotate: [0, -90, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-400 rounded-full blur-3xl"
          />
        </div>

        <AnimatePresence mode="wait">
          {step === 'form' ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="relative w-full max-w-2xl"
            >
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-3xl opacity-75 blur-xl" />
              
              {/* Card */}
              <form onSubmit={handleSignup} className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 sm:p-10 space-y-6">
                {/* Header with icon */}
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring' }}
                    className="w-20 h-20 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                  >
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </motion.div>
                  <h2 className="text-3xl font-extrabold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                    {t('signup.title')}
                  </h2>
                  <p className="text-gray-600">
                    {lang === 'ar' ? 'انضم إلينا اليوم واستمتع بتجربة مميزة' : 'Join us today and enjoy a unique experience'}
                  </p>
                </div>
                {/* Name fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t('signup.firstName')}</label>
                    <input 
                      type="text" 
                      name="firstName" 
                      className="w-full px-4 py-3.5 text-base rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none" 
                      placeholder={lang === 'ar' ? 'أدخل الاسم الأول' : 'Enter first name'}
                      value={form.firstName} 
                      onChange={handleChange} 
                      required 
                      autoComplete="given-name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t('signup.lastName')}</label>
                    <input 
                      type="text" 
                      name="lastName" 
                      className="w-full px-4 py-3.5 text-base rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none" 
                      placeholder={lang === 'ar' ? 'أدخل الاسم الثاني' : 'Enter last name'}
                      value={form.lastName} 
                      onChange={handleChange} 
                      required 
                      autoComplete="family-name"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t('signup.email')}</label>
                  <input 
                    type="email" 
                    name="email" 
                    className="w-full px-4 py-3.5 text-base rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none" 
                    placeholder={lang === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                    value={form.email} 
                    onChange={handleChange} 
                    required 
                    autoComplete="email"
                    inputMode="email"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t('signup.phone')}</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    className="w-full px-4 py-3.5 text-base rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none" 
                    placeholder={lang === 'ar' ? 'أدخل رقم الهاتف' : 'Enter phone number'}
                    value={form.phone} 
                    onChange={handleChange} 
                    required 
                    autoComplete="tel"
                    inputMode="tel"
                  />
                </div>

                {/* Username & Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t('signup.username')}</label>
                    <input 
                      type="text" 
                      name="username" 
                      className="w-full px-4 py-3.5 text-base rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none" 
                      placeholder={lang === 'ar' ? 'اسم المستخدم' : 'Username'}
                      value={form.username} 
                      onChange={handleChange} 
                      required 
                      autoComplete="username"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t('signup.password')}</label>
                    <input 
                      type="password" 
                      name="password" 
                      className="w-full px-4 py-3.5 text-base rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none" 
                      placeholder={lang === 'ar' ? 'كلمة المرور' : 'Password'}
                      value={form.password} 
                      onChange={handleChange} 
                      required 
                      autoComplete="new-password"
                    />
                  </div>
                </div>
                {/* Account Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    {lang === 'ar' ? 'نوع الحساب' : 'Account Type'}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className={`relative flex items-center justify-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${form.accountType === 'individual' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'}`}>
                      <input 
                        type="radio" 
                        name="accountType" 
                        value="individual" 
                        checked={form.accountType === 'individual'} 
                        onChange={handleChange} 
                        className="sr-only" 
                      />
                      <svg className={`w-5 h-5 ${form.accountType === 'individual' ? 'text-purple-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className={`font-semibold ${form.accountType === 'individual' ? 'text-purple-700' : 'text-gray-600'}`}>
                        {t('signup.individual')}
                      </span>
                    </label>
                    <label className={`relative flex items-center justify-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${form.accountType === 'company' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'}`}>
                      <input 
                        type="radio" 
                        name="accountType" 
                        value="company" 
                        checked={form.accountType === 'company'} 
                        onChange={handleChange} 
                        className="sr-only" 
                      />
                      <svg className={`w-5 h-5 ${form.accountType === 'company' ? 'text-purple-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span className={`font-semibold ${form.accountType === 'company' ? 'text-purple-700' : 'text-gray-600'}`}>
                        {t('signup.company')}
                      </span>
                    </label>
                  </div>
                </div>

                {/* Profile Image */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t('signup.profileImage')}</label>
                  <div className="relative">
                    <input 
                      type="file" 
                      name="image" 
                      accept="image/*" 
                      className="w-full px-4 py-3 text-base rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100" 
                      onChange={e => setForm({ ...form, image: e.target.files?.[0] })} 
                    />
                  </div>
                </div>
                {/* Company-specific fields */}
                <AnimatePresence>
                  {form.accountType === 'company' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 border-t-2 border-gray-100 pt-4"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            {t('signup.companySector')} <span className="text-red-500">*</span>
                          </label>
                          <select
                            name="sector"
                            className="w-full px-4 py-3.5 text-base rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none bg-white"
                            value={form.sector}
                            onChange={handleChange}
                            required
                          >
                            <option value="">{lang === 'ar' ? 'اختر القطاع' : 'Select Sector'}</option>
                            {sectorsList.map(sec => (
                              <option key={sec.id} value={lang === 'ar' ? sec.nameAr : sec.nameEn}>
                                {lang === 'ar' ? sec.nameAr : sec.nameEn}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            {t('signup.location')} <span className="text-red-500">*</span>
                          </label>
                          <select
                            name="location"
                            className="w-full px-4 py-3.5 text-base rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none bg-white"
                            value={form.location}
                            onChange={handleChange}
                            required
                          >
                            <option value="">{t('signup.selectCity')}</option>
                            {saudiCitiesList.map(city => (
                              <option key={city.id} value={lang === 'ar' ? city.nameAr : city.nameEn}>
                                {lang === 'ar' ? city.nameAr : city.nameEn}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">{t('signup.commercialFiles')}</label>
                        <input 
                          type="file" 
                          multiple 
                          accept="image/*,.pdf" 
                          className="w-full px-4 py-3 text-base rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100" 
                          onChange={handleFiles} 
                          required 
                        />
                        <p className="text-xs text-gray-500 mt-2">{t('signup.filesHint')}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                {/* Error message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2"
                    role="alert"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {error}
                  </motion.div>
                )}

                {/* Submit button */}
                <motion.button 
                  type="submit" 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative w-full group overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl" />
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative flex items-center justify-center gap-2 py-4 text-white font-bold text-lg">
                    <span>{t('signup.registerButton')}</span>
                    <svg className={`w-5 h-5 group-hover:translate-x-1 transition-transform ${lang === 'ar' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </motion.button>

                {/* Login link */}
                <div className="text-center text-gray-600 text-sm">
                  {lang === 'ar' ? 'لديك حساب بالفعل؟' : 'Already have an account?'}{' '}
                  <a href="/login" className="text-purple-600 hover:text-purple-700 font-bold">
                    {lang === 'ar' ? 'تسجيل الدخول' : 'Log in'}
                  </a>
                </div>
              </form>
            </motion.div>
          ) : step === 'verify' ? (
            <motion.div
              key="verify"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="relative w-full max-w-md"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl opacity-75 blur-xl" />
              
              <form onSubmit={handleVerify} className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 sm:p-10 space-y-6">
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring' }}
                    className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                  >
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </motion.div>
                  <h2 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                    {t('signup.emailVerification')}
                  </h2>
                  <p className="text-gray-600">{t('signup.verificationCode')}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 text-center">
                    {t('signup.codePlaceholder')}
                  </label>
                  <input 
                    type="text" 
                    name="code" 
                    className="w-full px-4 py-4 text-center tracking-widest text-2xl font-bold rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none" 
                    placeholder="••••••" 
                    value={form.code} 
                    onChange={handleChange} 
                    required 
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                  />
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2"
                    role="alert"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {error}
                  </motion.div>
                )}

                {success && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {success}
                  </motion.div>
                )}

                <motion.button 
                  type="submit" 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative w-full group overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl" />
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative flex items-center justify-center gap-2 py-4 text-white font-bold text-lg">
                    <span>{t('signup.verifyAndLogin')}</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                </motion.button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="pending"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="relative w-full max-w-md"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-3xl opacity-75 blur-xl" />
              
              <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 sm:p-10 text-center space-y-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                  className="w-20 h-20 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg"
                >
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </motion.div>
                
                <h2 className="text-3xl font-extrabold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
                  {t('signup.requestReceived')}
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {t('signup.requestUnderReview')}
                </p>
                <p className="text-sm text-gray-500">
                  {t('signup.loginRestricted')}
                </p>
                
                <motion.button 
                  onClick={() => window.location.href = '/'} 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative w-full group overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl" />
                  <span className="relative flex items-center justify-center gap-2 py-4 text-white font-bold text-lg">
                    <svg className={`w-5 h-5 ${lang === 'ar' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span>{t('signup.backToHome')}</span>
                  </span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </>
  );
}
