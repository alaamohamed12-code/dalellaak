# دليل استكشاف أخطاء نظام الإشعارات

## المشكلة الحالية
عند إرسال إشعار من لوحة الأدمن، يظهر "تم الإرسال" ولكن لا تظهر الإشعارات للمستخدمين.

## خطوات التشخيص

### 1. التحقق من إنشاء الإشعار
افتح صفحة إرسال الإشعارات في الأدمن وأرسل إشعار تجريبي، ثم تحقق من Console في المتصفح:
- يجب أن ترى رسالة تحتوي على `assignedCount` تخبرك بعدد المستلمين
- إذا كان العدد 0، هناك مشكلة في قواعد البيانات

### 2. فحص قاعدة البيانات مباشرة
افتح الرابط التالي في المتصفح:
```
http://localhost:3000/api/notifications/debug
```

سيعرض لك:
- عدد الإشعارات الكلي
- عدد الإشعارات المخصصة للمستخدمين
- عدد الإشعارات غير المقروءة
- قائمة بجميع الإشعارات

### 3. التحقق من console.log في Terminal
افتح terminal حيث يعمل المشروع وتحقق من الرسائل التالية:

عند إرسال إشعار:
```
Creating notification: { message: '...', target: 'all', ... }
Notification created: { id: 1, ... }
Opening databases: { usersDbPath: '...', companiesDbPath: '...' }
Found X users
Found Y companies
Assigned notification 1 to Z recipients
```

عند تحميل الإشعارات:
```
Loading notifications count for: { id: 1, email: '...', accountType: '...' }
Fetching notifications for: { userId: '1', accountType: 'user', userEmail: '...' }
getUserNotifications called with: { userId: 1, accountType: 'user', userEmail: '...' }
Found rows: X
```

### 4. التحقق من وجود المستخدمين
تأكد من أن لديك مستخدمين مسجلين:
- افتح `users.db` في أي أداة SQLite
- تأكد من وجود مستخدمين في جدول `users`
- تأكد من وجود شركات في `companies.db` في جدول `companies`

### 5. إصلاحات محتملة

#### إذا كان assignedCount = 0:
المشكلة في قواعد البيانات أو المسارات:
1. تحقق من وجود ملفات `users.db` و `companies.db` في مجلد المشروع
2. تحقق من أن الجداول تحتوي على بيانات
3. راجع رسائل console.log في terminal

#### إذا كانت الإشعارات موجودة لكن لا تظهر:
المشكلة في عرض البيانات:
1. تحقق من أن `user.id` و `user.email` و `user.accountType` صحيحة في localStorage
2. افتح Console في المتصفح وابحث عن أخطاء
3. تأكد من أن API يعيد البيانات بشكل صحيح

#### إذا كانت الشارة لا تظهر:
1. تحقق من أن `notificationsCount` يتم تحديثه في الهيدر
2. راجع console.log في المتصفح عند تحميل الصفحة
3. تأكد من أن `user.email` موجود في localStorage

## الحلول السريعة

### إعادة تشغيل الخادم
أحيانًا يحتاج الخادم لإعادة تشغيل لتحديث الاتصالات بقواعد البيانات:
```bash
# أوقف الخادم (Ctrl+C)
# ثم شغله مرة أخرى
npm run dev
```

### مسح الذاكرة المؤقتة
```bash
# احذف مجلد .next
rm -rf .next  # Linux/Mac
rmdir /s .next  # Windows

# ثم شغل المشروع مرة أخرى
npm run dev
```

### اختبار يدوي للإشعارات
استخدم هذا الكود في console المتصفح لاختبار API مباشرة:
```javascript
// اختبار إنشاء إشعار
fetch('/api/notifications/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'اختبار إشعار',
    target: 'all',
    createdBy: 'admin'
  })
}).then(r => r.json()).then(console.log)

// اختبار جلب الإشعارات (استبدل القيم بقيم حقيقية)
fetch('/api/notifications?userId=1&accountType=user&email=test@example.com')
  .then(r => r.json())
  .then(console.log)
```

## معلومات إضافية

### التحقق من user object في localStorage
افتح Console في المتصفح واكتب:
```javascript
JSON.parse(localStorage.getItem('user'))
```

يجب أن يحتوي على:
- `id`: رقم معرف المستخدم
- `email`: البريد الإلكتروني
- `accountType`: 'user' أو 'company'
- `username`: اسم المستخدم

إذا كان أي من هذه القيم مفقودة، قم بتسجيل الخروج ثم الدخول مرة أخرى.
