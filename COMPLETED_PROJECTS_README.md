# قسم الأعمال المنتهية - Completed Projects

## نظرة عامة
تم إضافة قسم جديد لعرض الأعمال المنتهية (Completed Projects) في صفحات بروفيل الشركات.

## الميزات

### 1. عرض الأعمال المنتهية في البروفيل
- تاب جديد "الأعمال المنتهية" في صفحة بروفيل الشركة
- عرض المشاريع بشكل كروت (Cards) مع:
  - صورة المشروع
  - عنوان المشروع
  - وصف المشروع
  - تاريخ الإنتهاء
  - شارة "منتهي" خضراء

### 2. لوحة التحكم للشركات
- صفحة مخصصة لإدارة الأعمال المنتهية
- المسار: `/company-dashboard/completed-projects`
- إمكانية إضافة مشاريع جديدة
- إمكانية حذف المشاريع
- رفع صورة للمشروع (اختياري)

## البنية التقنية

### قاعدة البيانات
جدول جديد: `completed_projects`
```sql
CREATE TABLE completed_projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  companyId INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image TEXT,
  completedDate TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE
)
```

### الملفات المضافة/المعدلة

1. **Frontend:**
   - `app/company/[id]/page.tsx` - إضافة تاب الأعمال المنتهية
   - `app/company-dashboard/completed-projects/page.tsx` - صفحة إدارة الأعمال المنتهية

2. **Backend API:**
   - `app/api/completed-projects/route.ts` - API endpoints (GET, POST, DELETE)
   - `app/api/company-profile/route.ts` - تعديل لإرجاع الأعمال المنتهية

3. **Database:**
   - `scripts/create-completed-projects-table.js` - سكريبت إنشاء الجدول

4. **Assets:**
   - `public/completed-projects/` - مجلد لحفظ صور المشاريع

## كيفية الاستخدام

### للشركات:
1. تسجيل الدخول كشركة
2. الذهاب إلى: `/company-dashboard/completed-projects`
3. الضغط على "إضافة مشروع جديد"
4. ملء البيانات (العنوان، الوصف، الصورة، التاريخ)
5. حفظ المشروع

### للعملاء:
1. زيارة صفحة بروفيل أي شركة
2. الضغط على تاب "الأعمال المنتهية"
3. مشاهدة جميع المشاريع المنتهية للشركة

## API Endpoints

### GET /api/completed-projects
- Query params: `companyId`
- يُرجع: قائمة المشاريع المنتهية للشركة

### POST /api/completed-projects
- Body: FormData (companyId, title, description, image, completedDate)
- يُرجع: ID المشروع الجديد

### DELETE /api/completed-projects
- Query params: `id`
- يحذف المشروع وصورته

## بيانات تجريبية
تم إضافة 3 مشاريع تجريبية للشركة الأولى في قاعدة البيانات:
1. مشروع فيلا سكنية فاخرة
2. مجمع تجاري
3. ترميم مبنى تاريخي

## ملاحظات
- الصور اختيارية - إذا لم تُرفع صورة، سيظهر أيقونة افتراضية
- التاريخ اختياري - سيستخدم التاريخ الحالي افتراضياً
- الحذف يزيل المشروع والصورة المرتبطة به
- التصميم متجاوب (Responsive) مع جميع الأحجام
