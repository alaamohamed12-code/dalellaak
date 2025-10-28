"use client"
import { ReactNode, createContext, useContext, useState, useEffect } from 'react'
import { NotificationProvider } from '@/contexts/NotificationContext'

type Lang = 'ar' | 'en'

const translations: Record<string, any> = {
  'nav.home': { ar: 'الصفحة الرئيسية', en: 'Home' },
  'nav.services': { ar: 'الخدمات', en: 'Services' },
  'nav.partners': { ar: 'الأسئلة الشائعة', en: 'FAQ' },
  'nav.contact': { ar: 'تواصل', en: 'Contact' },
  'nav.login': { ar: 'تسجيل / دخول', en: 'Login / Register' },
  'logout': { ar: 'تسجيل الخروج', en: 'Logout' },
  'settings': { ar: 'إعدادات', en: 'Settings' },
  'hero.title': { ar: 'دليلك للأفضل في التصميم والبناء', en: 'Your guide to the best in design & build' },
  'site.title': { ar: 'دليل البناء', en: 'Build Guide' },
  'hero.line1': { ar: 'أكبر منصة تربطك بأفضل الشركات الهندسية والموردين في الخليج', en: 'The largest platform connecting you with top engineering firms & suppliers in the Gulf' },
  'hero.line2': { ar: 'نشاركك رحلة التصميم والبناء ونساعدك في اختيار الأفضل', en: 'We share the design & build journey and help you choose the best' },
  'hero.line3': { ar: 'استمتع بكاش باك 2% فور إتمام التعاقد 💰', en: 'Enjoy 2% cashback after contract completion 💰' },
  'cta.start': { ar: 'ابدأ الآن', en: 'Get Started' },
  'cta.explore': { ar: 'استكشف الخدمات', en: 'Explore Services' },
  'services.title': { ar: 'استكشف مجالاتنا الرئيسية', en: 'Explore Our Main Areas' },
  'service.more': { ar: 'استكشف المزيد', en: 'Explore More' },
  // services items (localized titles + subs and an image seed for each)
  'services.items': [
    {
      key: 'engineering-consulting',
      img: 'https://picsum.photos/seed/consulting/1200/800',
      title: { ar: 'استشارات هندسية', en: 'Engineering Consulting' },
      subs: [
        { ar: 'تصميم معماري', en: 'Architectural Design' },
        { ar: 'تصميم إنشائي', en: 'Structural Design' },
        { ar: 'كهرباء', en: 'Electrical' },
        { ar: 'ميكانيكا', en: 'Mechanical' },
        { ar: 'إدارة مشاريع', en: 'Project Management' },
        { ar: 'تقييم', en: 'Valuation' }
      ]
    },
    {
      key: 'contracting',
      img: 'https://picsum.photos/seed/contracting/1200/800',
      title: { ar: 'المقاولات', en: 'Contracting' },
      subs: [
        { ar: 'بناء مباني', en: 'Building Construction' },
        { ar: 'هياكل', en: 'Structures' },
        { ar: 'أعمال ترميم', en: 'Restoration' },
        { ar: 'إدارة موقع', en: 'Site Management' },
        { ar: 'تشطيب', en: 'Finishing' },
        { ar: 'خدمات الصيانة', en: 'Maintenance Services' }
      ]
    },
    {
      key: 'building-materials',
      img: 'https://picsum.photos/seed/materials/1200/800',
      title: { ar: 'مواد البناء', en: 'Building Materials' },
      subs: [
        { ar: 'أسمنت', en: 'Cement' },
        { ar: 'حديد', en: 'Steel' },
        { ar: 'عزل', en: 'Insulation' },
        { ar: 'رخام', en: 'Marble' },
        { ar: 'دهانات', en: 'Paints' },
        { ar: 'خشب', en: 'Timber' }
      ]
    },
    {
      key: 'decoration-furnishing',
      img: 'https://picsum.photos/seed/decor/1200/800',
      title: { ar: 'الديكور والتأثيث', en: 'Decoration & Furnishing' },
      subs: [
        { ar: 'تصميم داخلي', en: 'Interior Design' },
        { ar: 'أثاث', en: 'Furniture' },
        { ar: 'إضاءة', en: 'Lighting' },
        { ar: 'نوافذ', en: 'Windows' },
        { ar: 'أقمشة', en: 'Fabrics' },
        { ar: 'تفاصيل', en: 'Details' }
      ]
    }
  ],
  'partners.title': { ar: 'شركاؤنا في النجاح', en: 'Our Partners' },
  'partners.showAll': { ar: 'عرض جميع الشركاء', en: 'Show All Partners' },
  'cashback.text': { ar: '🎉 استمتع بكاش باك 2% عند إتمام التعاقد عبر المنصة', en: '🎉 Enjoy 2% cashback when completing a contract via the platform' },
  'how.title': { ar: 'كيف نربطك بالشركات الأنسب لك؟', en: 'How do we connect you with the best companies?' },
  'how.steps': [
    { ar: 'اختر المجال المناسب.', en: 'Choose the right field.' },
    { ar: 'حدّد منطقتك من الفلتر.', en: 'Filter by your area.' },
    { ar: 'تواصل مع الشريك.', en: 'Contact the partner.' },
    { ar: 'أتم التعاقد واستمتع بالكاش باك.', en: 'Complete the contract and enjoy cashback.' }
  ],
  'why.title': { ar: 'لماذا دليل البناء هو خيارك الأفضل؟', en: 'Why Build Guide is your best choice?' },
  'why.features': [
    { ar: 'شركاء معتمدون ✅', en: 'Verified Partners ✅' },
    { ar: 'دعم فني مباشر 💬', en: 'Live Support 💬' },
    { ar: 'كاش باك مضمون 💰', en: 'Guaranteed Cashback 💰' },
    { ar: 'تغطية خليجية 📍', en: 'Gulf-wide Coverage 📍' },
    { ar: 'تجربة آمنة 🔒', en: 'Secure Experience 🔒' }
  ],
  'join.title': { ar: 'هل ترغب بالانضمام كشريك موثوق؟', en: 'Want to join as a trusted partner?' },
  'contact.email': { ar: 'contact@buildguide.com', en: 'contact@buildguide.com' },
  'contact.phone': { ar: '+971 50 000 0000', en: '+971 50 000 0000' },
  'footer.links': { ar: 'روابط', en: 'Links' },
  'footer.contact': { ar: 'تواصل', en: 'Contact' },
  'footer.rights': { ar: '© 2025 دليل البناء – جميع الحقوق محفوظة.', en: '© 2025 Build Guide – All rights reserved.' },
  
  // Login page translations
  'login.title': { ar: 'تسجيل الدخول', en: 'Login' },
  'login.emailOrUsername': { ar: 'البريد الإلكتروني أو اسم المستخدم', en: 'Email or Username' },
  'login.password': { ar: 'كلمة المرور', en: 'Password' },
  'login.loginButton': { ar: 'تسجيل الدخول', en: 'Login' },
  'login.forgotPassword': { ar: 'نسيت كلمة المرور؟', en: 'Forgot Password?' },
  'login.noAccount': { ar: 'ليس لديك حساب؟', en: "Don't have an account?" },
  'login.signupLink': { ar: 'سجل الآن', en: 'Sign up now' },
  
  // Signup page translations
  'signup.title': { ar: 'تسجيل حساب جديد', en: 'Create New Account' },
  'signup.firstName': { ar: 'الاسم الأول', en: 'First Name' },
  'signup.lastName': { ar: 'الاسم الثاني', en: 'Last Name' },
  'signup.email': { ar: 'البريد الإلكتروني', en: 'Email' },
  'signup.phone': { ar: 'رقم الموبايل', en: 'Phone Number' },
  'signup.username': { ar: 'اسم المستخدم', en: 'Username' },
  'signup.password': { ar: 'كلمة المرور', en: 'Password' },
  'signup.individual': { ar: 'فرد', en: 'Individual' },
  'signup.company': { ar: 'شركة', en: 'Company' },
  'signup.profileImage': { ar: 'صورة الحساب (اختياري)', en: 'Profile Image (Optional)' },
  'signup.companySector': { ar: 'المجال الرئيسي للشركة', en: 'Company Main Sector' },
  'signup.selectSector': { ar: 'اختر المجال', en: 'Select Sector' },
  'signup.location': { ar: 'المدينة/الموقع', en: 'City/Location' },
  'signup.selectCity': { ar: 'اختر المدينة', en: 'Select City' },
  'signup.commercialFiles': { ar: 'السجل التجاري وملفات الشركة (مطلوبة)', en: 'Commercial Register & Company Files (Required)' },
  'signup.filesHint': { ar: 'يمكن رفع عدة ملفات (صور أو PDF)', en: 'Multiple files can be uploaded (Images or PDF)' },
  'signup.registerButton': { ar: 'تسجيل حساب', en: 'Register Account' },
  'signup.emailVerification': { ar: 'تأكيد البريد الإلكتروني', en: 'Email Verification' },
  'signup.verificationCode': { ar: 'أدخل الكود الذي تم إرساله إلى بريدك الإلكتروني', en: 'Enter the code sent to your email' },
  'signup.codePlaceholder': { ar: 'كود التحقق', en: 'Verification Code' },
  'signup.verifyAndLogin': { ar: 'تأكيد وتسجيل الدخول', en: 'Verify and Login' },
  'signup.requestReceived': { ar: 'تم استلام طلبك بنجاح', en: 'Your Request Has Been Received Successfully' },
  'signup.requestUnderReview': { ar: 'طلب تسجيل الشركة قيد المراجعة وسيتم التواصل معك خلال 24 ساعة.', en: 'Company registration request is under review and we will contact you within 24 hours.' },
  'signup.loginRestricted': { ar: 'لا يمكنك تسجيل الدخول حتى يتم قبول الحساب من الإدارة.', en: 'You cannot login until the account is approved by the administration.' },
  'signup.backToHome': { ar: 'العودة للصفحة الرئيسية', en: 'Back to Home Page' },
  
  // Forgot Password page translations
  'forgotPassword.title': { ar: 'نسيت كلمة المرور؟', en: 'Forgot Password?' },
  'forgotPassword.subtitle': { ar: 'لا تقلق، سنساعدك في استعادة حسابك', en: "Don't worry, we'll help you recover your account" },
  'forgotPassword.emailOrUsername': { ar: 'البريد الإلكتروني أو اسم المستخدم', en: 'Email or Username' },
  'forgotPassword.emailPlaceholder': { ar: 'أدخل بريدك الإلكتروني أو اسم المستخدم', en: 'Enter your email or username' },
  'forgotPassword.sendCode': { ar: 'إرسال كود الاستعادة', en: 'Send Recovery Code' },
  'forgotPassword.sending': { ar: 'جاري الإرسال...', en: 'Sending...' },
  'forgotPassword.backToLogin': { ar: 'العودة لتسجيل الدخول', en: 'Back to Login' },
  'forgotPassword.checkEmail': { ar: 'تحقق من بريدك الإلكتروني', en: 'Check Your Email' },
  'forgotPassword.codeSentTo': { ar: 'تم إرسال كود التحقق إلى:', en: 'Verification code sent to:' },
  'forgotPassword.verificationCode': { ar: 'كود التحقق', en: 'Verification Code' },
  'forgotPassword.enterCode': { ar: 'أدخل الكود', en: 'Enter Code' },
  'forgotPassword.verifyCode': { ar: 'تحقق من الكود', en: 'Verify Code' },
  'forgotPassword.backToPrevious': { ar: 'العودة للخطوة السابقة', en: 'Back to Previous Step' },
  'forgotPassword.newPasswordTitle': { ar: 'إنشاء كلمة مرور جديدة', en: 'Create New Password' },
  'forgotPassword.newPasswordSubtitle': { ar: 'اختر كلمة مرور قوية وآمنة', en: 'Choose a strong and secure password' },
  'forgotPassword.newPassword': { ar: 'كلمة المرور الجديدة', en: 'New Password' },
  'forgotPassword.newPasswordPlaceholder': { ar: 'أدخل كلمة المرور الجديدة', en: 'Enter new password' },
  'forgotPassword.passwordHint': { ar: 'يجب أن تكون على الأقل 6 أحرف', en: 'Must be at least 6 characters' },
  'forgotPassword.confirmPassword': { ar: 'تأكيد كلمة المرور', en: 'Confirm Password' },
  'forgotPassword.confirmPasswordPlaceholder': { ar: 'أعد إدخال كلمة المرور', en: 'Re-enter password' },
  'forgotPassword.updatePassword': { ar: 'تحديث كلمة المرور', en: 'Update Password' },
  'forgotPassword.updating': { ar: 'جاري التحديث...', en: 'Updating...' },
  'forgotPassword.successTitle': { ar: 'تم تحديث كلمة المرور بنجاح!', en: 'Password Updated Successfully!' },
  'forgotPassword.successMessage': { ar: 'يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة', en: 'You can now login with your new password' },
  'forgotPassword.loginButton': { ar: 'تسجيل الدخول', en: 'Login' },
  'forgotPassword.emailOrUsernameRequired': { ar: 'يجب إدخال البريد الإلكتروني أو اسم المستخدم', en: 'Email or username is required' },
  'forgotPassword.failedToSendCode': { ar: 'فشل في إرسال كود الاستعادة', en: 'Failed to send recovery code' },
  'forgotPassword.errorSendingCode': { ar: 'حدث خطأ أثناء إرسال كود الاستعادة', en: 'Error sending recovery code' },
  'forgotPassword.invalidCode': { ar: 'كود التحقق غير صحيح', en: 'Invalid verification code' },
  'forgotPassword.passwordLength': { ar: 'كلمة المرور يجب أن تكون على الأقل 6 أحرف', en: 'Password must be at least 6 characters' },
  'forgotPassword.passwordMismatch': { ar: 'كلمات المرور غير متطابقة', en: 'Passwords do not match' },
  'forgotPassword.errorUpdatingPassword': { ar: 'حدث خطأ أثناء تحديث كلمة المرور', en: 'Error updating password' },
  // Company Dashboard
  'company.profileTitle': { ar: 'بروفايل الشركة وإدارة الأعمال', en: 'Company Profile & Works Management' },
  'company.loading': { ar: 'جاري التحميل...', en: 'Loading...' },
  'company.loadError': { ar: 'تعذر تحميل بيانات الشركة', en: 'Failed to load company data' },
  'company.username': { ar: 'اسم المستخدم', en: 'Username' },
  'company.status': { ar: 'الحالة', en: 'Status' },
  'company.status.approved': { ar: 'مقبولة', en: 'Approved' },
  'company.status.pending': { ar: 'قيد المراجعة', en: 'Pending Review' },
  'company.sector': { ar: 'المجال', en: 'Sector' },
  'company.location': { ar: 'الموقع', en: 'Location' },
  'company.contactButton': { ar: 'مراسلة الشركة', en: 'Contact Company' },
  'company.viewProfile': { ar: 'عرض الملف الشخصي', en: 'View Company Profile' },
  'company.worksTitle': { ar: 'أعمالك وخدماتك', en: 'Your Works & Services' },
  'company.addWork': { ar: 'إضافة عمل جديد', en: 'Add New Work' },
  'company.noWorks': { ar: 'لا توجد أعمال مضافة بعد.', en: 'No works added yet.' },
  'company.editWork': { ar: 'تعديل العمل', en: 'Edit Work' },
  'company.addWorkTitle': { ar: 'إضافة عمل جديد', en: 'Add New Work' },
  'company.workTitle': { ar: 'اسم العمل أو الخدمة', en: 'Work or Service Title' },
  'company.workDesc': { ar: 'وصف العمل أو تفاصيل إضافية', en: 'Work Description or Details' },
  'company.uploadMedia': { ar: 'رفع صور أو فيديوهات (حتى 15 ملف):', en: 'Upload images or videos (up to 15 files):' },
  'company.filesCount': { ar: 'عدد الملفات المختارة', en: 'Selected files count' },
  'company.save': { ar: 'حفظ التعديلات', en: 'Save Changes' },
  'company.add': { ar: 'إضافة العمل', en: 'Add Work' },
  'company.saving': { ar: 'جاري الحفظ...', en: 'Saving...' },
  'company.edit': { ar: 'تعديل', en: 'Edit' },
  'company.delete': { ar: 'حذف', en: 'Delete' },
  'company.deleting': { ar: 'جاري الحذف...', en: 'Deleting...' },
  'company.deleteConfirm': { ar: 'تأكيد حذف العمل', en: 'Confirm Work Deletion' },
  'company.deleteMsg': { ar: 'هل أنت متأكد أنك تريد حذف هذا العمل؟ لا يمكن التراجع.', en: 'Are you sure you want to delete this work? This action cannot be undone.' },
  'company.cancel': { ar: 'إلغاء', en: 'Cancel' },
  'company.maxFiles': { ar: 'الحد الأقصى للملفات هو 15', en: 'Maximum files allowed is 15' },
  'company.requiredTitle': { ar: 'اسم العمل مطلوب', en: 'Work title is required' },
  'company.operationFailed': { ar: 'فشل العملية', en: 'Operation failed' },
  'company.deleteFailed': { ar: 'فشل الحذف', en: 'Delete failed' },
  'company.createdAt': { ar: 'تاريخ الإضافة', en: 'Created At' },
  'company.unknown': { ar: 'غير محدد', en: 'Not specified' },
  'company.dashboard': { ar: 'لوحة الشركة', en: 'Company Dashboard' },
  'company.menu.company': { ar: 'شركة', en: 'Company' },
  // Profile/Settings page
  'profile.title': { ar: 'إعدادات الملف الشخصي', en: 'Profile Settings' },
  'profile.editImage': { ar: 'تغيير صورة الملف الشخصي', en: 'Change Profile Image' },
  'profile.firstName': { ar: 'الاسم الأول', en: 'First Name' },
  'profile.lastName': { ar: 'الاسم الثاني', en: 'Last Name' },
  'profile.email': { ar: 'البريد الإلكتروني', en: 'Email' },
  'profile.phone': { ar: 'رقم الهاتف', en: 'Phone Number' },
  'profile.username': { ar: 'اسم المستخدم', en: 'Username' },
  'profile.currentPassword': { ar: 'كلمة المرور الحالية', en: 'Current Password' },
  'profile.newPassword': { ar: 'كلمة المرور الجديدة', en: 'New Password' },
  'profile.confirmNewPassword': { ar: 'تأكيد كلمة المرور الجديدة', en: 'Confirm New Password' },
  'profile.save': { ar: 'حفظ التغييرات', en: 'Save Changes' },
  'profile.saving': { ar: 'جاري الإرسال...', en: 'Saving...' },
  'profile.success': { ar: 'تم تحديث البيانات بنجاح!', en: 'Profile updated successfully!' },
  'profile.error': { ar: 'حدث خطأ أثناء التحديث', en: 'An error occurred while updating' },
  'profile.edit': { ar: 'تعديل', en: 'Edit' },
  'profile.forgotPassword': { ar: 'نسيت كلمة المرور الحالية؟', en: 'Forgot your current password?' },
  'profile.forgotPasswordDesc': { ar: 'يمكنك استعادة كلمة المرور عبر البريد الإلكتروني', en: 'You can recover your password via email' },
  'profile.forgotPasswordBtn': { ar: 'استعادة كلمة المرور', en: 'Recover Password' },
  'profile.changePassword': { ar: 'تغيير كلمة المرور (اختياري)', en: 'Change Password (Optional)' },
  'profile.verifyTitle': { ar: 'تأكيد التغييرات', en: 'Confirm Changes' },
  'profile.verifyDesc': { ar: 'تم إرسال كود التحقق إلى بريدك الإلكتروني', en: 'A verification code has been sent to your email' },
  'profile.codeLabel': { ar: 'كود التحقق', en: 'Verification Code' },
  'profile.codePlaceholder': { ar: 'أدخل الكود', en: 'Enter code' },
  'profile.backToEdit': { ar: 'العودة للتعديل', en: 'Back to Edit' },
  'profile.confirmAndSave': { ar: 'تأكيد وحفظ', en: 'Confirm & Save' },
  'profile.updating': { ar: 'جاري التحديث...', en: 'Updating...' },
  'profile.loading': { ar: 'جاري التحميل...', en: 'Loading...' }
}

type ProviderValue = {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: string) => string
  tArr: (key: string) => { ar: string; en: string }[]
}

const LangContext = createContext<ProviderValue>({ lang: 'ar', setLang: () => {}, t: () => '', tArr: () => [] })

export function useLang() {
  return useContext(LangContext)
}

export default function Providers({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('ar') // Default to Arabic

  // Initialize language from localStorage on mount; default to Arabic if not present
  useEffect(() => {
    const savedLang = localStorage.getItem('preferred-language') as Lang
    if (savedLang && (savedLang === 'ar' || savedLang === 'en')) {
      setLang(savedLang)
    } else {
      // No preference saved -> default to Arabic
      localStorage.setItem('preferred-language', 'ar')
      setLang('ar')
    }
  }, [])

  // Update language preference and save to localStorage
  const handleSetLang = (newLang: Lang) => {
    setLang(newLang)
    localStorage.setItem('preferred-language', newLang)
  }

  useEffect(() => {
    document.documentElement.lang = lang
    if (lang === 'ar') {
      document.documentElement.dir = 'rtl'
      document.documentElement.classList.add('rtl')
      document.documentElement.classList.remove('ltr')
    } else {
      document.documentElement.dir = 'ltr'
      document.documentElement.classList.add('ltr')
      document.documentElement.classList.remove('rtl')
    }
  }, [lang])

  const t = (key: string) => {
    const v = (translations as any)[key]
    if (!v) return key
    if (typeof v === 'string') return v
    return (v as any)[lang] ?? key
  }

  const tArr = (key: string) => {
    const v = (translations as any)[key]
    if (!v) return []
    return v as any
  }

  return (
    <LangContext.Provider value={{ lang, setLang: handleSetLang, t, tArr }}>
      <NotificationProvider>
        {children}
      </NotificationProvider>
    </LangContext.Provider>
  )
}
