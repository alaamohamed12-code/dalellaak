# نظام إدارة المجالات والمدن الديناميكي

## نظرة عامة
تم تطوير نظام ديناميكي لإدارة المجالات (Sectors) والمدن (Cities) التي تظهر في صفحة التسجيل، مما يمنح المسؤولين التحكم الكامل دون الحاجة لتعديل الكود.

## المكونات الرئيسية

### 1. قاعدة البيانات

#### جدول sectors
```sql
CREATE TABLE sectors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nameAr TEXT NOT NULL,
  nameEn TEXT NOT NULL,
  isVisible INTEGER DEFAULT 1,
  sortOrder INTEGER DEFAULT 0,
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT DEFAULT (datetime('now'))
)
```

#### جدول cities
```sql
CREATE TABLE cities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nameAr TEXT NOT NULL,
  nameEn TEXT NOT NULL,
  isVisible INTEGER DEFAULT 1,
  sortOrder INTEGER DEFAULT 0,
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT DEFAULT (datetime('now'))
)
```

#### الحقول:
- **nameAr**: الاسم بالعربية
- **nameEn**: الاسم بالإنجليزية
- **isVisible**: حالة الظهور (1=ظاهر، 0=مخفي)
- **sortOrder**: ترتيب العرض (الأرقام الأقل تظهر أولاً)
- **createdAt/updatedAt**: تواريخ الإنشاء والتحديث

### 2. APIs

#### `/api/admin/sectors`

**GET** - جلب المجالات
- معامل اختياري: `?includeHidden=true` لجلب المجالات المخفية أيضاً
- الترتيب: حسب sortOrder ثم nameAr

**POST** - إضافة مجال جديد
```json
{
  "nameAr": "استشارات هندسية",
  "nameEn": "Engineering Consulting",
  "isVisible": 1,
  "sortOrder": 0
}
```

**PUT** - تحديث مجال
```json
{
  "id": 1,
  "nameAr": "استشارات هندسية محدّثة",
  "nameEn": "Updated Engineering Consulting",
  "isVisible": 1,
  "sortOrder": 5
}
```

**DELETE** - حذف مجال
- معامل مطلوب: `?id=1`

#### `/api/admin/cities`
نفس البنية تماماً مثل `/api/admin/sectors`

### 3. صفحات لوحة التحكم

#### `/admin-panel/sectors`
- عرض جميع المجالات في جدول
- إضافة مجال جديد
- تعديل مجال موجود
- حذف مجال
- تبديل حالة الظهور (إخفاء/إظهار)
- جميع العمليات مع تأكيدات ورسائل نجاح/فشل

#### `/admin-panel/cities`
- نفس الميزات تماماً لكن للمدن
- تصميم متسق مع صفحة المجالات

### 4. صفحة التسجيل

تم تحديث `/signup` لجلب البيانات ديناميكياً:
```typescript
useEffect(() => {
  // جلب المجالات
  fetch('/api/admin/sectors')
    .then(res => res.json())
    .then(data => setSectorsList(data.sectors))
    
  // جلب المدن
  fetch('/api/admin/cities')
    .then(res => res.json())
    .then(data => setSaudiCitiesList(data.cities))
}, []);
```

## البيانات الأولية

### المجالات (10):
1. استشارات هندسية
2. مقاولات
3. مواد بناء
4. تشطيبات
5. أعمال كهرباء
6. أعمال سباكة
7. نجارة
8. حدادة
9. دهانات
10. أخرى

### المدن (20):
الرياض، جدة، مكة المكرمة، المدينة المنورة، الدمام، الخبر، الطائف، بريدة، تبوك، حائل، أبها، خميس مشيط، جازان، نجران، الجبيل، ينبع، القطيف، الظهران، سيهات، الرس

## كيفية الاستخدام

### 1. تشغيل السكربت الأولي
```bash
node scripts/create-sectors-cities-tables.js
```
يقوم بإنشاء الجداول وإضافة البيانات الأولية.

### 2. الوصول لصفحات الإدارة
- الدخول للوحة التحكم: `/admin-panel/dashboard`
- اضغط على "إدارة المجالات" أو "إدارة المدن"

### 3. إضافة عنصر جديد
- اضغط زر "إضافة مجال جديد" أو "إضافة مدينة جديدة"
- أدخل الاسم بالعربي والإنجليزي
- حدد الترتيب (اختياري)
- فعّل/عطّل الظهور
- احفظ

### 4. تعديل عنصر
- اضغط زر "تعديل" على العنصر المطلوب
- عدّل البيانات
- احفظ التغييرات

### 5. إخفاء/إظهار عنصر
- اضغط على زر الحالة (ظاهر/مخفي)
- يتم التبديل فوراً دون حذف البيانات

### 6. حذف عنصر
- اضغط زر "حذف"
- أكّد الحذف
- يتم الحذف نهائياً من قاعدة البيانات

## الميزات

✅ **إدارة ديناميكية**: لا حاجة لتعديل الكود لإضافة/حذف مجالات أو مدن
✅ **إخفاء مؤقت**: إمكانية إخفاء عنصر دون حذفه نهائياً
✅ **ترتيب مخصص**: التحكم في ترتيب ظهور العناصر
✅ **ثنائية اللغة**: دعم العربية والإنجليزية
✅ **واجهات حديثة**: تصميم احترافي مع Framer Motion
✅ **تحقق من الصحة**: منع التكرار والبيانات الناقصة
✅ **رسائل توضيحية**: تأكيدات قبل الحذف ورسائل نجاح/فشل

## الملاحظات التقنية

- استخدام better-sqlite3 لقاعدة البيانات
- جميع APIs تعيد رسائل بالعربية
- التحقق من التكرار يشمل الاسم العربي والإنجليزي
- الحقل isVisible يُستخدم للفلترة في صفحة التسجيل
- sortOrder يسمح بترتيب يدوي بدلاً من الأبجدي
- جميع الملفات خالية من أخطاء TypeScript

## ملفات المشروع

### APIs
- `app/api/admin/sectors/route.ts`
- `app/api/admin/cities/route.ts`

### صفحات لوحة التحكم
- `app/admin-panel/sectors/page.tsx`
- `app/admin-panel/cities/page.tsx`
- `app/admin-panel/dashboard/page.tsx` (محدّثة)

### صفحة التسجيل
- `app/signup/page.tsx` (محدّثة)

### السكربتات
- `scripts/create-sectors-cities-tables.js`

## التطوير المستقبلي

- إضافة إمكانية استيراد/تصدير البيانات بصيغة CSV
- إضافة سجل تاريخي للتعديلات
- إضافة صلاحيات للمسؤولين
- إضافة بحث وفلترة في صفحات الإدارة
- إضافة مجالات ومدن متعددة دفعة واحدة
